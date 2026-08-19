# Silent Failure Detection: Quick Reference (1-Page Laminate)

**When:** Silent failure is suspected (customer report, audit finding, or detection fired)  
**Goal:** Triage in under 5 minutes, determine if data is actually diverged  
**Action:** Run these queries against your primary database  

---

## QUICK TRIAGE DECISION TREE

```
┌─ "Can you see the error in logs?"
├─ YES → Look for timeout, network error, database error
│        This is NOT a silent failure (it's visible)
│        Go to incident runbook
│
└─ NO → Continue below
    ├─ "Did customer report wrong data?"
    │  └─ YES → Likely cache/replica divergence
    │           Run: REPLICA_DIVERGENCE checks
    │
    ├─ "Did operation seem to succeed but have no effect?"
    │  └─ YES → Likely partial write (DB succeeded, cache failed)
    │           Run: CACHE_DIVERGENCE checks
    │
    ├─ "Are two related entities out of sync?"
    │  (payment + notification, order + delivery, debit + credit)
    │  └─ YES → Likely distributed transaction gap
    │           Run: CORRELATION checks
    │
    └─ "Did permission/token behavior change suddenly?"
        └─ YES → Likely identity staleness
                 Run: IDENTITY_DIVERGENCE checks
```

---

## QUICK REFERENCE QUERIES

### 1. REPLICA_DIVERGENCE
**Symptom:** Data looks wrong, but correct in primary database  
**Cause:** Write succeeded on primary, hasn't replicated yet, or replica is diverged

**Step 1: Check replication lag (PostgreSQL)**
```sql
SELECT slot_name, CASE WHEN restart_lsn > confirmed_flush_lsn THEN 'LAG' ELSE 'OK' END 
FROM pg_replication_slots;
```

**Step 2: Spot-check one entity**
```sql
SELECT id, email, status FROM primary_db.users WHERE id = <PROBLEM_USER_ID>;
SELECT id, email, status FROM replica_db.users WHERE id = <PROBLEM_USER_ID>;
-- Are they identical?
```

**Step 3: Check row count**
```sql
SELECT 'primary' as db, COUNT(*) as count FROM primary_db.<TABLE>;
UNION ALL
SELECT 'replica' as db, COUNT(*) FROM replica_db.<TABLE>;
-- Should be identical
```

**If diverged:**
- Severity: Check if data loss or just lag
- Action: Force replica refresh, or wait for replication to catch up

---

### 2. CACHE_DIVERGENCE
**Symptom:** Read returns different value than write  
**Cause:** Write hit database, missed cache. Or cache has stale TTL

**Step 1: Check cache vs. DB for specific key**
```python
# In your app or Redis CLI:
key = "order:12345:status"
cache_value = redis.get(key)
db_value = db.query(f"SELECT status FROM orders WHERE id = 12345")

print(f"Cache: {cache_value}, DB: {db_value}")
# If different → DIVERGED
```

**Step 2: Check TTL**
```
redis> TTL order:12345:status
(integer) -2    # Key does not exist (should exist)
(integer) 150   # 150 seconds left (should be > 3600)
```

**Step 3: Check hit rate**
```
redis> INFO stats
# Look for: keyspace_hits / (keyspace_hits + keyspace_misses)
# Should be > 0.95 for critical keys
```

**If diverged:**
- Action: `redis.delete(key)` to force repopulation
- Verify: Next request should re-populate from DB

---

### 3. PARTIAL_WRITE (Multi-Store Failure)
**Symptom:** Database updated, but downstream system didn't get notified  
**Cause:** DB succeeded, but cache write or message publish failed

**Step 1: Check if operation is in database**
```sql
SELECT * FROM orders WHERE id = <ORDER_ID> AND updated_at > NOW() - INTERVAL '5 minutes';
-- Should find it (DB write succeeded)
```

**Step 2: Check if update was sent downstream**
```sql
-- For cache: Check if cache has the value
redis> GET order:<ORDER_ID>:status

-- For message queue: Check outgoing events
SELECT * FROM outgoing_events WHERE order_id = <ORDER_ID> AND created_at > NOW() - INTERVAL '5 minutes';
```

**Step 3: Compare**
```
If: DB updated but cache empty AND message queue empty
Then: Partial write (DB succeeded, downstream failed)
```

**If true:**
- Action: Manually publish to downstream systems
- Verify: Cache repopulates, message is processed

---

### 4. CORRELATION (Distributed Transaction Gap)
**Symptom:** Money missing, order incomplete, notification never sent  
**Cause:** Step 1 succeeded, Step 2+ failed. Systems out of sync

**Step 1: Verify the transaction exists**
```sql
SELECT * FROM ledger_entries WHERE external_transaction_id = '<TX_ID>';
-- Count should be 2+ (debit and credit)
```

**Step 2: Check if debits equal credits**
```sql
SELECT 
  SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as total_debits,
  SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as total_credits
FROM ledger_entries
WHERE external_transaction_id = '<TX_ID>';
-- Should be: total_debits == total_credits
```

**Step 3: Verify notification was sent**
```sql
SELECT * FROM notifications WHERE transaction_id = '<TX_ID>';
-- Should have at least one record
```

**If imbalanced:**
- Action: Depends on root cause (see response patterns)
- Verify: Reconciliation query shows balance restored

---

### 5. IDENTITY_DIVERGENCE
**Symptom:** User has access they shouldn't have (or lost access they should have)  
**Cause:** Permission changed, but cached token not invalidated

**Step 1: Check identity provider (source of truth)**
```
curl https://idp.example.com/user/<USER_ID>/roles
```

**Step 2: Check what your app thinks**
```python
cached_roles = cache.get(f"user:{USER_ID}:roles")
# Compare to idp response
```

**Step 3: Check cache TTL**
```
redis> TTL user:<USER_ID>:roles
# If >5 min after permission change: STALE
```

**If stale:**
- Action: `redis.delete(f"user:{USER_ID}:roles")` to force refresh
- Verify: User accesses service, forces cache repopulation from IdP

---

## ALERT THRESHOLDS

**Set up alerts if:**

| Metric | Threshold | Frequency |
|--------|-----------|-----------|
| Replication lag | > 1 second | Every 10 seconds |
| Cache hit rate | < 95% | Every 5 minutes |
| Orphaned records | > 0 | Every 30 minutes |
| State stuck > expected | > P95 duration | Every 5 minutes |
| Ledger debit/credit diff | > 0 | Every 1 minute |
| Message processing lag | > 5 min oldest | Every 5 minutes |
| Identity cache age after change | > 1 min | Every 1 minute |

---

## RESPONSE CHECKLIST (First 5 Minutes)

- [ ] Determine which type of divergence (use decision tree above)
- [ ] Quantify: How many rows/records affected?
- [ ] Timeline: When did it start? When was it detected?
- [ ] Safety: Can we auto-remediate, or need manual review?
- [ ] Isolation: What customer impact? Can we quarantine?
- [ ] Comms: Does this need customer notification?
- [ ] Investigation: Save logs, data snapshots for postmortem

---

## AUTO-REMEDIATION (Safe To Run)

```python
# Only run these if you've verified they are safe in your system

# Cache divergence: Safe to repopulate
redis.delete(f"order:{ORDER_ID}:status")

# Replica lag: Safe to promote (if replica is nearly caught up)
# Only if lag < 10 seconds and replication queue < 1MB
promote_replica_to_primary()

# Identity cache: Safe to invalidate (forces refresh on next access)
redis.delete(f"user:{USER_ID}:roles")

# Message processing: Safe to re-queue (if idempotent)
message_queue.send({'retry_original': True, 'message_id': MSG_ID})
```

**Do NOT auto-remediate:**
- Payment/ledger divergence (always manual)
- Permission divergence > 5 minutes old (always manual)
- Data loss (> 100 rows affected, always manual)

---

## ESCALATION

**Page SRE if:**
- Divergence affects > 10k users
- Data loss detected (cannot be auto-remediated)
- Replication lag > 1 minute
- > 3 detection alerts in 5 minutes

**Page on-call DB if:**
- Replication is broken (not just lagged)
- Database corruption detected
- Need to perform manual recovery

---

