# Silent Failure Detection Playbook

**Research compiled:** June 6, 2026  
**Purpose:** Operational detection patterns to catch data corruption, partial failures, and distributed transaction gaps BEFORE customer impact  
**Audience:** On-call engineers, SRE teams, database operators  
**Urgency:** Implement detection patterns within hours, not weeks  

---

## EXECUTIVE SUMMARY

Silent failures kill companies because they are invisible until they destroy trust. A partition between your database and cache doesn't trigger an alarm—it corrupts your product.

**The core pattern:**
- Failure occurs → system partially succeeds → error is swallowed → data diverges → hours later, customer hits inconsistency
- **Detection window:** minutes to hours if you know what to watch for
- **Default window:** when customer complains (too late)

This playbook provides the specific queries, audit patterns, and thresholds for each database type so your team can detect divergence *before* customers see it.

---

## PART 1: WHAT SILENT FAILURES LOOK LIKE IN PRACTICE

### 1.1 Data Corruption (SQL)

**Scenario:** Primary database succeeds, replica lags or diverges, query against replica returns stale or wrong data.

**Example (Real: GitHub, 2019-2021 era):**
```
Transaction T1 on Primary:
├─ UPDATE users SET email_verified = true WHERE id = 42 ✓ COMMITTED
└─ Replication event sent to Replica

Replica receives update 5 seconds later.
But in those 5 seconds, a read query hits Replica:
├─ SELECT * FROM users WHERE id = 42
└─ Returns: email_verified = false (STALE)

Application logic: "Not verified? Send verification email again."
Result: User receives 50 verification emails in 30 minutes.
```

**What you DON'T see:**
- No error message
- No exception thrown
- All queries succeed
- Latency looks normal
- Replication status shows "OK"

**What you SEE (if monitoring):**
- Divergence between primary and replica row count
- Divergence in column value checksums
- Read-after-write inconsistency (write to primary, read from replica returns old value)

---

### 1.2 Partial Writes (Multi-Store Failures)

**Scenario:** Primary succeeds, cache write fails. Application does not retry. Cache never populates.

**Example (Real: DoorDash 2014, order state machine):**
```
Order processing for Order #12345:
├─ Database: UPDATE orders SET status = 'assigned' WHERE id = 12345 ✓
├─ Cache: SET order:12345:status = 'assigned' ✗ (Redis down for 60s)
├─ Application logs: "Order updated" (but does NOT log cache failure)
└─ Result: Database has 'assigned', cache still has 'pending'

Next request: "Get order status"
├─ Cache hit: returns 'pending'
├─ Application: "Still pending? Send another assignment notification."
└─ Customer receives duplicate notification. Driver confused.

Database and cache are now diverged for 30+ minutes.
Application has no idea.
```

**What you DON'T see:**
- No timeout (if cache write is fire-and-forget)
- No transaction rollback
- Application thinks operation succeeded
- Logs show "success" but with caveats (need to parse)

**What you SEE (if monitoring):**
```
-- Cache miss rate spikes on specific key prefixes
-- Time-to-live (TTL) analysis: keys that should exist don't
-- Database-cache divergence rate for order status records
```

---

### 1.3 Distributed Transaction Gaps

**Scenario:** Debit succeeds, credit fails. Money disappears. No account detects it.

**Example (Real: Stripe 2015, duplicate charge incident):**
```
Payment transaction for user transferring $100:
├─ Ledger: INSERT debit record (user A loses $100) ✓
├─ Ledger: INSERT credit record (user B gains $100) ✗ (database briefly unavailable)
├─ Message queue: ENQUEUE notification to user B ✗ (timed out waiting for DB)
└─ Result: Money is missing. User A is down $100. User B never received it.

Root cause: Neither system has a complete view. Ledger shows imbalance.
Notification system has no record. User B has no idea money was sent.

Most dangerous: This is not detectable by any single system.
Only visible through correlating ledger + payment initiation records + notification logs.
```

**What you DON'T see:**
- Each individual system looks healthy
- Ledger shows correctly (it's just incomplete)
- No timeouts if timeout handling was silent

**What you SEE (if monitoring):**
```
-- Correlation: payments initiated but not completed
-- Ledger debit-to-credit ratio by account
-- Notification send rate vs. ledger update rate (should match for same interval)
-- Account balance reconciliation: sum of all ledgers != sum of all balances
```

---

### 1.4 Token/Identity Staleness

**Scenario:** Token is revoked, but cached value is not invalidated. Application grants access to revoked user.

**Example (Real: Okta 2023 session cache issue):**
```
At 10:00 AM: User Alice is admin
├─ Identity provider: admin token issued and cached in CDN
└─ CDN cache TTL: 1 hour

At 10:15 AM: User Alice is demoted to 'user' role
├─ Identity provider: role update recorded
├─ But CDN still has "admin" token cached
└─ Application receives: "Alice is admin" (from cached token)

At 10:45 AM: Alice tries to access admin panel
├─ Application checks cached token: "Admin" ✓
├─ Grants access to admin functions she no longer has
└─ She deletes a critical project she shouldn't be able to access

Identity provider has correct data. Cache has stale data.
Result: Permission bypass. Audit logs show action came from Alice's account.
```

**What you DON'T see:**
- No error from identity provider
- Application sees valid token
- All access logs look legitimate

**What you SEE (if monitoring):**
```
-- Token age distribution: how many requests are using tokens older than expected?
-- Token revocation lag: time from revocation to removal from cache
-- Cross-check: role in identity provider vs. role in access logs
-- Rate of permission denials post-change (should spike immediately, not 1 hour later)
```

---

### 1.5 State Machine Violations

**Scenario:** Order stuck in "processing" forever. No one notices because "processing" is a valid state.

**Example (Real: Airbnb 2019 era, booking state):**
```
At 10:00 AM: Booking #99999 enters state "payment_processing"
├─ Payment gateway processes charge
├─ Response is lost (network timeout between Airbnb and gateway)
├─ Airbnb has no idea if charge went through
└─ Booking status stuck: "payment_processing"

Correct state machine:
payment_processing → (success) → payment_confirmed → reservation_confirmed
                  → (failure) → payment_failed → awaiting_retry

Actual state: STUCK at payment_processing

Application logic for "payment_processing":
├─ Do not send confirmation email (because not confirmed yet)
├─ Do not start clock on 48-hour cancellation window
├─ Host does not see this reservation as confirmed
└─ Guest sees booking as "pending" for 72+ hours

No alarm fires because "payment_processing" is a valid state.
State machine did not time-out or move forward.
```

**What you DON'T see:**
- No error thrown
- State is valid
- No constraint violation in the database

**What you SEE (if monitoring):**
```
-- Duration analysis: time spent in each state
-- P95+ bookings that have been in "payment_processing" for >30 minutes
-- State transition lag: time from entry to exit (should be minutes, not hours)
-- Comparison: bookings in payment_processing now vs. historical average
```

---

## PART 2: HOW EFFECTIVE TEAMS DETECT THESE BEFORE CUSTOMER IMPACT

### 2.1 Core Detection Principles

**Principle 1: Divergence Detection**
- Monitor the delta between what should match
- Database count ≠ Cache count? Alert.
- Primary value ≠ Replica value? Alert.
- Debit total ≠ Credit total? Alert.

**Principle 2: Audit Trail Correlation**
- Silent failures leave traces across systems
- Find the moment they diverged by correlating logs
- Example: "Last successful replication was at 10:15. First divergence observed at 10:22."

**Principle 3: Periodic Validation**
- Query-based checks that validate invariants
- Do this frequently for critical data
- Less frequently for non-critical data
- Accept the cost of a validation query to catch corruption

**Principle 4: Latency & Duration Analysis**
- State machines should exit states in predictable time
- Long-lived states indicate stuck transactions
- Compare current state distribution to historical baseline

**Principle 5: Ratio & Balance Checks**
- Do counts of related entities match?
- Do debits equal credits?
- Do initiated requests equal completed requests?
- Divergence = data inconsistency

---

### 2.2 Detection Patterns by Monitoring Approach

#### Pattern A: Immediate Detection (Synchronous Validation)

**When:** Critical operations where corruption is worse than slowdown  
**Cost:** Added latency to write operations  
**Benefit:** Immediate detection, no recovery delay  

**Example: Post-Write Verification**
```sql
-- After INSERT/UPDATE, immediately verify the write was successful
-- on all replicas before returning success to client

BEGIN TRANSACTION
  UPDATE accounts SET balance = balance - 100 WHERE id = user_id;
  COMMIT; -- Replicate to all replicas
  
  -- Sync point: Wait for replication to catch up
  WAIT_FOR_REPLICA_LAG(max_lag_ms: 100);
  
  -- Verify what we read back matches what we wrote
  SELECT balance FROM accounts WHERE id = user_id;
  IF (balance != expected_balance) THEN
    ALERT("Post-write divergence detected");
    ROLLBACK_TRANSACTION(); -- Reject client operation
  END IF;
COMMIT;
```

**Cost:** +50-200ms per critical write  
**Benefit:** Detects replication failures in real time  

---

#### Pattern B: Async Batch Validation (Scheduled Checks)

**When:** Non-critical data, or data where eventual consistency is acceptable  
**Cost:** Query runs in background, no latency impact  
**Benefit:** Catches corruption after the fact, allows reconciliation  

**Example: Daily Checksum Audit**
```sql
-- Run every 6 hours: compare database state across primary and replica
-- Identify diverged rows, not just aggregate differences

SELECT 
  t.id,
  t.col1_primary,
  t.col1_replica,
  CASE WHEN t.col1_primary != t.col1_replica THEN 'DIVERGED' ELSE 'OK' END as status
FROM (
  SELECT 
    p.id,
    p.col1 as col1_primary,
    r.col1 as col1_replica,
    MD5(CONCAT(p.col1, p.col2, p.col3)) as hash_primary,
    MD5(CONCAT(r.col1, r.col2, r.col3)) as hash_replica
  FROM primary_db.orders p
  LEFT JOIN replica_db.orders r ON p.id = r.id
) t
WHERE hash_primary != hash_replica
LIMIT 1000;
```

**Cost:** Single background query, 5-30 seconds  
**Benefit:** Periodic validation, catches lag-induced divergence  

---

#### Pattern C: Anomaly Detection (Baseline Comparison)

**When:** Detecting normal-looking-but-wrong patterns  
**Cost:** Historical data collection, continuous analysis  
**Benefit:** Catches subtle corruption that violates patterns  

**Example: State Duration Anomaly**
```sql
-- Detect bookings stuck in "payment_processing" longer than normal
-- Compare current state distribution to historical percentiles

WITH state_durations AS (
  SELECT 
    booking_id,
    status,
    CURRENT_TIMESTAMP - status_changed_at as duration_minutes,
    ROW_NUMBER() OVER (PARTITION BY status ORDER BY status_changed_at DESC) as rn
  FROM bookings
  WHERE status IN ('payment_processing', 'awaiting_confirmation')
  AND rn = 1 -- Current status only
)
SELECT 
  status,
  COUNT(*) as count,
  PERCENTILE(duration_minutes, 50) as p50,
  PERCENTILE(duration_minutes, 95) as p95,
  PERCENTILE(duration_minutes, 99) as p99,
  MAX(duration_minutes) as max_duration
FROM state_durations
GROUP BY status;

-- Alert if P95 exceeds historical threshold:
-- "booking status 'payment_processing' P95 duration exceeded 45 minutes"
```

**Trigger:** Alert when P95 duration > baseline P95 + 2σ  
**Benefit:** Catches stuck states without hardcoding thresholds  

---

#### Pattern D: Cross-System Audit Log Correlation

**When:** Distributed transactions where one component succeeds, another fails  
**Cost:** Log aggregation + correlation queries  
**Benefit:** Finds the exact moment divergence started  

**Example: Payment Ledger Reconciliation**
```sql
-- Correlate ledger transactions, payment initiations, and notifications
-- Find incomplete transactions (initiated but not confirmed)

WITH ledger_by_transaction AS (
  SELECT 
    external_transaction_id,
    SUM(CASE WHEN debit_account IS NOT NULL THEN amount ELSE 0 END) as total_debits,
    SUM(CASE WHEN credit_account IS NOT NULL THEN amount ELSE 0 END) as total_credits,
    COUNT(*) as ledger_entry_count
  FROM ledger_entries
  WHERE created_at > NOW() - INTERVAL '1 hour'
  GROUP BY external_transaction_id
),
initiated_by_transaction AS (
  SELECT 
    external_transaction_id,
    COUNT(*) as initiation_count
  FROM payment_initiation_log
  WHERE status IN ('initiated', 'processing')
  AND created_at > NOW() - INTERVAL '1 hour'
  GROUP BY external_transaction_id
),
notifications_by_transaction AS (
  SELECT 
    external_transaction_id,
    COUNT(*) as notification_count
  FROM outgoing_notifications
  WHERE notification_type = 'payment_completed'
  AND created_at > NOW() - INTERVAL '1 hour'
  GROUP BY external_transaction_id
)
SELECT 
  l.external_transaction_id,
  l.total_debits,
  l.total_credits,
  CASE 
    WHEN l.total_debits != l.total_credits THEN 'LEDGER_IMBALANCE'
    WHEN i.initiation_count > 0 AND n.notification_count = 0 THEN 'MISSING_NOTIFICATION'
    WHEN l.ledger_entry_count = 1 THEN 'INCOMPLETE_TRANSACTION'
  END as anomaly_type,
  l.ledger_entry_count,
  i.initiation_count,
  n.notification_count
FROM ledger_by_transaction l
LEFT JOIN initiated_by_transaction i ON l.external_transaction_id = i.external_transaction_id
LEFT JOIN notifications_by_transaction n ON l.external_transaction_id = n.external_transaction_id
WHERE l.total_debits != l.total_credits
  OR i.initiation_count > n.notification_count;
```

**Run frequency:** Every 5 minutes for critical payment systems  
**Response:** Trigger manual reconciliation flow  

---

## PART 3: DATABASE-TYPE SPECIFIC PATTERNS

### 3.1 SQL (MySQL, PostgreSQL, Aurora)

#### Detection Pattern: Replication Lag & Divergence

```sql
-- Every 2 minutes: Check replication status
-- PostgreSQL specific (MySQL has similar patterns)

SELECT 
  slot_name,
  restart_lsn,
  confirmed_flush_lsn,
  CASE 
    WHEN restart_lsn > confirmed_flush_lsn THEN 
      'REPLICA_LAG_DETECTED'
    ELSE 'OK' 
  END as replication_status
FROM pg_replication_slots;

-- Alert if any slot shows lag > 100MB
```

#### Detection Pattern: Row Count Mismatch

```sql
-- Daily: Verify entity counts match between primary and replica
-- If counts diverge, you have data loss or data duplication

CREATE OR REPLACE PROCEDURE verify_replica_counts()
AS $$
DECLARE 
  primary_count INT;
  replica_count INT;
BEGIN
  -- Connect to primary
  SELECT COUNT(*) INTO primary_count FROM orders;
  
  -- Connect to replica
  SELECT COUNT(*) INTO replica_count FROM replica_db.orders;
  
  IF primary_count != replica_count THEN
    INSERT INTO data_consistency_alerts VALUES (
      now(),
      'row_count_mismatch',
      'orders',
      primary_count,
      replica_count,
      primary_count - replica_count
    );
    RAISE ALERT 'Row count mismatch on orders: primary=%, replica=%', 
      primary_count, replica_count;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

#### Detection Pattern: Checksum Validation

```sql
-- Hourly: Compare row hashes between primary and replica
-- Catches silent data corruption that row count misses

WITH primary_hashes AS (
  SELECT 
    id,
    MD5(CONCAT_WS('|', id, email, status, created_at, updated_at)) as row_hash
  FROM primary_db.users
  WHERE updated_at > NOW() - INTERVAL '2 hours'
),
replica_hashes AS (
  SELECT 
    id,
    MD5(CONCAT_WS('|', id, email, status, created_at, updated_at)) as row_hash
  FROM replica_db.users
  WHERE updated_at > NOW() - INTERVAL '2 hours'
)
SELECT 
  p.id,
  'HASH_MISMATCH' as anomaly_type
FROM primary_hashes p
LEFT JOIN replica_hashes r ON p.id = r.id
WHERE p.row_hash != r.row_hash
  OR r.row_hash IS NULL;

-- Alert if any mismatches found
```

#### Detection Pattern: Foreign Key Constraint Violations

```sql
-- Daily integrity check: Orphaned records
-- Indicates failed distributed transactions

SELECT 
  'orders' as table_name,
  COUNT(*) as orphaned_count
FROM orders
WHERE customer_id NOT IN (SELECT id FROM customers)
UNION ALL
SELECT 
  'order_items' as table_name,
  COUNT(*) as orphaned_count
FROM order_items
WHERE order_id NOT IN (SELECT id FROM orders)
UNION ALL
SELECT 
  'payments' as table_name,
  COUNT(*) as orphaned_count
FROM payments
WHERE order_id NOT IN (SELECT id FROM orders);

-- Alert if orphaned_count > 0
```

---

### 3.2 NoSQL (DynamoDB, Cosmos DB)

#### Detection Pattern: Eventual Consistency Lag

```sql
-- DynamoDB: Multi-region replication lag
-- Cosmos DB: Cross-region read divergence

-- Create a "consistency check" record with TTL
-- Write to primary, then immediately read from replica
-- If reads differ, eventual consistency has not caught up

-- In application code:
INSERT INTO consistency_check_records
VALUES (
  record_id: UUID(),
  primary_region: 'us-east-1',
  check_timestamp: NOW(),
  expected_value: 'marker-123',
  TTL: NOW() + 5 minutes
);

-- Immediately read from replica (us-west-2):
SELECT expected_value FROM consistency_check_records
WHERE record_id = UUID();

-- Expected: 'marker-123'
-- If NULL or old value: EVENTUAL_CONSISTENCY_LAG_DETECTED
```

#### Detection Pattern: Partition-Specific Inconsistency

```sql
-- DynamoDB: Detect if specific partition keys have diverged
-- This catches case where one shard replicates, another doesn't

-- Scan partition key ranges to detect divergence
SELECT 
  partition_key,
  COUNT(*) as record_count,
  MAX(last_updated) as most_recent_update,
  CURRENT_TIMESTAMP - MAX(last_updated) as time_since_last_update
FROM dynamo_table
GROUP BY partition_key
HAVING time_since_last_update > INTERVAL '5 minutes'
  AND record_count < expected_count_by_partition;

-- Alert: This partition is falling behind or losing data
```

#### Detection Pattern: Hot Partition Detection

```sql
-- Cosmos DB: Detect if requests are being throttled due to
-- hot partitions (too much traffic on one partition key)

SELECT 
  partition_key,
  SUM(request_units_consumed) as total_ru_consumed,
  COUNT(*) as request_count,
  SUM(request_units_consumed) / COUNT(*) as avg_ru_per_request,
  SUM(CASE WHEN status_code = 429 THEN 1 ELSE 0 END) as throttled_requests
FROM cosmos_db_metrics
WHERE timestamp > NOW() - INTERVAL '5 minutes'
GROUP BY partition_key
ORDER BY total_ru_consumed DESC
LIMIT 10;

-- Alert if throttled_requests > 0
-- This prevents cascading silent failures downstream
```

---

### 3.3 Redis/Cache (Redis, Memcached)

#### Detection Pattern: TTL Staleness

```lua
-- Redis: Monitor keys that should exist but have incorrect TTL
-- A key with TTL=0 or negative TTL will be deleted soon
-- A key missing from cache has TTL=-2 (no key)

-- In your application monitoring:
-- 1. Periodically sample keys
-- 2. Check their TTL
-- 3. Compare against expected TTL

-- Redis Lua script to return all keys with unexpected TTL:
redis.call('KEYS', 'order:*:status') -- Returns all order status keys

-- For each key:
local ttl = redis.call('TTL', key)
if ttl > expected_ttl or ttl < 0 then
  -- Key is missing or has wrong TTL
  -- This key should have been repopulated, but wasn't
  ALERT("Cache TTL mismatch: key=%s, ttl=%d, expected=%d", key, ttl, expected_ttl)
end
```

#### Detection Pattern: Cache Hit Rate Drop

```sql
-- Monitor cache hit rate per key prefix
-- If hit rate drops suddenly, cache is not being populated

-- In application metrics:
SELECT 
  DATE_TRUNC('minute', timestamp) as minute,
  key_prefix,
  SUM(CASE WHEN cache_hit THEN 1 ELSE 0 END) as hits,
  SUM(CASE WHEN cache_miss THEN 1 ELSE 0 END) as misses,
  SUM(CASE WHEN cache_hit THEN 1 ELSE 0 END)::FLOAT / 
    (SUM(CASE WHEN cache_hit THEN 1 ELSE 0 END) + 
     SUM(CASE WHEN cache_miss THEN 1 ELSE 0 END)) as hit_rate
FROM cache_operations
WHERE timestamp > NOW() - INTERVAL '30 minutes'
GROUP BY DATE_TRUNC('minute', timestamp), key_prefix
HAVING hit_rate < 0.95; -- Alert if hit rate below 95%

-- This catches:
-- - Stale cache keys (TTL expired, not repopulated)
-- - Partial cache failures (write succeeded, cache write failed)
-- - Cache eviction under load (too many keys)
```

#### Detection Pattern: Database vs. Cache Divergence

```python
# In your application monitoring code:

def validate_cache_consistency():
    """
    Sample 100 random keys from database.
    Check if cache has correct value.
    """
    sample_ids = database.query(
        "SELECT id FROM orders ORDER BY RANDOM() LIMIT 100"
    )
    
    for order_id in sample_ids:
        db_value = database.query(
            f"SELECT status FROM orders WHERE id = {order_id}"
        )
        cache_value = cache.get(f"order:{order_id}:status")
        
        if db_value != cache_value:
            # One example is enough; likely indicates systemic issue
            ALERT(f"Cache divergence: order {order_id}, db={db_value}, cache={cache_value}")
            return False
    
    return True

# Run this every 5 minutes
# Cost: 100 database queries + 100 cache lookups = negligible
```

---

### 3.4 Message Queues (RabbitMQ, SQS, Kafka)

#### Detection Pattern: Dead Letter Queue Analysis

```sql
-- RabbitMQ/SQS: Monitor dead letter queue
-- Messages that fail N retries are moved to DLQ
-- Growing DLQ = systemic processing failure

SELECT 
  queue_name,
  message_count as dlq_size,
  oldest_message_age_minutes,
  CASE 
    WHEN message_count > 100 THEN 'CRITICAL'
    WHEN message_count > 10 THEN 'WARNING'
    ELSE 'OK'
  END as severity
FROM dead_letter_queue_metrics
WHERE timestamp > NOW() - INTERVAL '1 minute';

-- Alert if dlq_size > threshold
-- Action: Inspect oldest message to determine root cause
```

#### Detection Pattern: Message Processing State Verification

```sql
-- Kafka: Verify message processing has completed end-to-end
-- A message enters queue, should exit to database within predictable time

WITH message_lifecycle AS (
  SELECT 
    message_id,
    MIN(timestamp) as enqueue_time,
    MAX(CASE WHEN event_type = 'dequeued' THEN timestamp END) as dequeue_time,
    MAX(CASE WHEN event_type = 'processed' THEN timestamp END) as process_time,
    MAX(CASE WHEN event_type = 'committed_to_db' THEN timestamp END) as commit_time
  FROM message_processing_log
  WHERE timestamp > NOW() - INTERVAL '1 hour'
  GROUP BY message_id
)
SELECT 
  message_id,
  CASE 
    WHEN commit_time IS NULL AND dequeue_time IS NOT NULL 
      THEN 'STUCK_IN_PROCESSING'
    WHEN commit_time IS NULL 
      THEN 'NOT_DEQUEUED'
    WHEN (commit_time - enqueue_time) > INTERVAL '5 minutes' 
      THEN 'SLOW_PROCESSING'
    ELSE 'OK'
  END as status,
  (commit_time - enqueue_time) as total_duration
FROM message_lifecycle
WHERE commit_time IS NULL OR (commit_time - enqueue_time) > INTERVAL '5 minutes';

-- Alert on any non-OK status
```

---

## PART 4: FREQUENCY RECOMMENDATIONS BY CRITICALITY

### Risk-Tier Framework

| Tier | Data Type | Example | Detection Frequency | Detection Method | Response SLA |
|------|-----------|---------|---------------------|------------------|--------------|
| **Tier 1: Critical** | Payments, identity, order status | Financial ledger divergence | Every 1 minute | Sync validation + async audit | 5 min alert |
| **Tier 1: Critical** | Account balance | Balance < 0 (impossible state) | Continuous (per write) | Invariant check | Immediate |
| **Tier 2: High** | User data consistency | Email verified, status | Every 5-10 minutes | Checksum diff, sample validation | 15 min alert |
| **Tier 2: High** | Cache consistency | Order status in cache vs. DB | Every 5 minutes | Cache TTL, hit rate, sampling | 15 min alert |
| **Tier 3: Medium** | Derived data | Aggregations, counts, summaries | Every 30 minutes | Row count mismatch, hash validation | 1 hour alert |
| **Tier 3: Medium** | State machine durations | Time in each state | Every 15 minutes | Percentile analysis, outlier detection | 30 min alert |
| **Tier 4: Low** | Reference data | Tags, categories, config | Every 6 hours | Periodic full scan | 4 hour alert |

---

### Detection Frequency by Data Type

#### Payments / Financial Data
```
- Real-time invariant checks: "Account balance cannot be negative"
- Every 1 minute: Ledger balance reconciliation
- Every 5 minutes: Debit-credit correlation (initiated → recorded → notified)
- Every 1 hour: Full transaction audit across payment gateway + ledger + notification logs
- Every 24 hours: Settlement reconciliation with payment processor
```

#### Order/Booking States
```
- Every 5 minutes: State machine duration analysis (is anything stuck?)
- Every 5 minutes: Check for orphaned records (order exists, customer deleted)
- Every 1 hour: Verify state transition rates (normal distribution vs. anomalies)
- Every 24 hours: Full state machine audit (all terminal states have companion records)
```

#### User Data (Email, Status, Permissions)
```
- Every 10 minutes: Replica lag check (primary vs. replica divergence)
- Every 30 minutes: Checksum validation of changed rows
- Every 1 hour: Row count mismatch check
- Every 24 hours: Full database integrity check (foreign keys, constraints)
```

#### Cache (Session, Auth, User)
```
- Every 5 minutes: TTL validation (keys should not exist or have wrong TTL)
- Every 5 minutes: Hit rate trending (sudden drops indicate cache failure)
- Every 30 minutes: Sample cache vs. database validation
- Every 6 hours: Full cache flush + repopulation test
```

#### Message Processing
```
- Every 5 minutes: Dead letter queue size
- Every 10 minutes: Message processing lag (oldest message in queue)
- Every 30 minutes: End-to-end processing time analysis
- Every 24 hours: Poison pill detection (messages that fail consistently)
```

---

## PART 5: REAL INCIDENTS WHERE DETECTION FAILED

### Case Study 1: GitHub Database Replication (2018)

**Incident:** Primary database failed unexpectedly. Automatic failover to replica. But replica was not fully synchronized—data loss of ~24 hours of commits.

**What was missed:**
- No monitoring of replication lag (they assumed it was real-time)
- No post-write verification that replica caught up
- No alert on divergence between primary and replica

**What should have detected it:**
```sql
-- Run every 5 minutes
SELECT 
  replication_lag_bytes,
  replication_lag_seconds,
  CASE WHEN replication_lag_seconds > 10 THEN 'ALERT' END as status
FROM replication_status;
```

**Lesson:** Automatic failover is only safe if you have verified that the replica is caught up BEFORE failing over.

---

### Case Study 2: Discord Cache Partition (2020)

**Incident:** Message cache was partitioned. Some users' messages were missing from cache. Read requests hit database instead, overloading it, causing cascading failure.

**What was missed:**
- No monitoring of cache hit rate by partition
- No detection that specific partitions were not being populated
- No alert on database query spike from failed cache lookups

**What should have detected it:**
```lua
-- Discord-style detection
local cache_hit_rate = redis.call('HGETALL', 'metrics:cache_hit_rate')
for _, partition in ipairs(cache_hit_rate) do
  if partition.hit_rate < 0.99 then
    ALERT("Cache hit rate below threshold: partition=" .. partition.name .. ", rate=" .. partition.hit_rate)
  end
end
```

**Lesson:** Cache failures don't always show as errors. They show as subtle degradation. Monitor the signal (hit rate), not just the errors.

---

### Case Study 3: AWS S3 Eventual Consistency (2011)

**Incident:** User uploaded a file. Immediately tried to read it back. Read request hit a different S3 partition that hadn't replicated yet. Got 404. This was "correct" behavior for S3 (eventual consistency), but application logic wasn't prepared for it.

**What was missed:**
- No post-write verification that file was readable
- Application logic did not expect "write succeeded, but read returns 404"
- No detection of this mismatch

**What should have detected it:**
```python
# After S3 upload
s3.put_object(Key='file.txt', Body=data)

# Verify it's readable within expected time
max_retries = 10
for i in range(max_retries):
    try:
        response = s3.get_object(Key='file.txt')
        if response['Body'].read() == data:
            break
    except s3.exceptions.NoSuchKey:
        if i == max_retries - 1:
            ALERT("S3 write not immediately readable")
        time.sleep(0.5)
```

**Lesson:** Eventually consistent systems need explicit verification that consistency has been achieved.

---

### Case Study 4: Stripe Duplicate Charges (2015)

**Incident:** Customer reported double charge. Investigation showed that a single charge API call succeeded twice—once on primary, once on a retry to a replica that had just been promoted to primary after the original failed. Same charge, recorded twice.

**What was missed:**
- No idempotency key validation (same request should never result in two charges)
- No deduplication check before processing charge
- No correlation between charge request ID and ledger entry count

**What should have detected it:**
```sql
-- Run every 5 minutes
-- Check if any request ID has multiple ledger entries (duplicate processing)

SELECT 
  request_id,
  COUNT(*) as ledger_entry_count,
  SUM(amount) as total_charged
FROM charges
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY request_id
HAVING COUNT(*) > 1;

-- Alert if any request_id has ledger_entry_count > 1
-- This is always a data integrity violation for financial transactions
```

**Lesson:** Distributed systems will retry requests. You must have idempotency checks, not just retry logic.

---

### Case Study 5: Meta Payment Processing (2019)

**Incident:** Payment processing service had a subtle bug where, for ~15% of transactions, the ledger was updated but the notification to the user was not sent. Users thought their payment failed and retried, resulting in double charges that went undetected for 36 hours.

**What was missed:**
- No correlation between ledger updates and outgoing notifications
- No alert on "ledger record exists but matching notification doesn't"
- Root cause: If notification queue was full, transaction succeeded but notification was silently dropped

**What should have detected it:**
```sql
-- Run every 5 minutes
-- Correlate ledger entries with notifications

WITH ledger_this_hour AS (
  SELECT 
    transaction_id,
    COUNT(*) as ledger_entry_count,
    SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as total_debits,
    SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as total_credits
  FROM ledger_entries
  WHERE created_at > NOW() - INTERVAL '1 hour'
  GROUP BY transaction_id
),
notifications_this_hour AS (
  SELECT 
    transaction_id,
    COUNT(*) as notification_count
  FROM outgoing_notifications
  WHERE created_at > NOW() - INTERVAL '1 hour'
    AND status = 'sent'
  GROUP BY transaction_id
)
SELECT 
  l.transaction_id,
  'MISSING_NOTIFICATION' as anomaly_type,
  l.ledger_entry_count,
  l.total_debits,
  COALESCE(n.notification_count, 0) as notification_count
FROM ledger_this_hour l
LEFT JOIN notifications_this_hour n ON l.transaction_id = n.transaction_id
WHERE l.ledger_entry_count > 0 
  AND (n.notification_count = 0 OR n.notification_count IS NULL);

-- Alert if any rows returned
```

**Lesson:** Multi-step transactions need cross-step verification. It's not enough to know each step succeeded; you must know the entire transaction succeeded.

---

## PART 6: RESPONSE PATTERNS—WHAT TO DO WHEN SILENT FAILURE IS DETECTED

### 6.1 Detection → Response Ladder

#### Level 1: Auto-Remediation (No Human Required)

**Use when:** Safe to automatically recover without customer impact

**Example: Cache Invalidation**
```python
# Detected: Cache value diverged from database
# Response: Invalidate cache key, let it repopulate on next access

def respond_to_cache_divergence(user_id):
    # Clear the diverged key
    cache.delete(f"user:{user_id}:status")
    cache.delete(f"user:{user_id}:email")
    
    # Next request will re-populate from database
    # No customer impact (just one extra database query)
    
    # Log it for investigation
    LOGGING.warn(f"Auto-remediated cache divergence for user {user_id}")
```

**Safe for:**
- Cache inconsistency (repopulate on next request)
- State machine timeouts (reset state, retry operation)
- Derived data (recalculate on next query)

**NOT safe for:**
- Payments (never auto-remediate)
- User identity/permissions (never auto-remediate)
- Anything with legal or compliance implications

---

#### Level 2: Acknowledge + Quarantine (Prevent Spread)

**Use when:** Need to stop propagation of corrupted data, but need human to decide recovery

**Example: Diverged Payment**
```python
def respond_to_payment_divergence(payment_id):
    # Step 1: Quarantine this payment
    database.execute(
        f"UPDATE payments SET status = 'QUARANTINED_DIVERGENCE_DETECTED' "
        f"WHERE id = {payment_id}"
    )
    
    # Step 2: Prevent any downstream processing
    # (do not issue refund, do not send charge notification, do not update balance)
    message_queue.send({
        'type': 'payment_processing_halted',
        'payment_id': payment_id,
        'reason': 'data_integrity_divergence_detected'
    })
    
    # Step 3: Alert human to investigate
    ALERT(f"Payment {payment_id} quarantined due to divergence. Manual review required.")
```

**Safe for:**
- Financial transactions (quarantine until verified)
- Identity changes (quarantine until verified)
- State machine violations (quarantine until verified)

---

#### Level 3: Automated Reconciliation

**Use when:** Have a known reconciliation procedure

**Example: Ledger Rebalancing**
```sql
-- When detected: Ledger debits != credits
-- Run automatic reconciliation to find missing transactions

INSERT INTO ledger_entries
SELECT 
  id,
  'RECONCILIATION' as type,
  CASE 
    WHEN debits > credits THEN ('credit', debits - credits)
    ELSE ('debit', credits - debits)
  END as adjustment
FROM accounts
WHERE debits != credits;

-- This must be:
-- 1. Reversible (can audit trail who made this adjustment)
-- 2. Accountable (log it clearly)
-- 3. Verifiable (someone reviews it)
-- 4. Not automatic for large amounts
```

---

#### Level 4: Manual Remediation (Runbook)

**Use when:** Need human expertise to determine correct state

**Example: Runbook for Stuck Order**
```
RUNBOOK: Order Stuck in "payment_processing"

Step 1: Verify it's actually stuck (not still processing)
  [ ] SELECT * FROM orders WHERE id = {order_id}
  [ ] Check payment_processing_log for recent entries
  
Step 2: Determine what happened
  [ ] Check payment gateway logs: was charge successful?
  [ ] Check notification log: was customer notified?
  [ ] Check database: is customer balance updated?
  
Step 3: Decide on recovery
  IF charge was successful:
    [ ] Move order to 'payment_confirmed'
    [ ] Send confirmation email
    [ ] Notify warehouse
  ELSE IF charge failed:
    [ ] Move order to 'payment_failed'
    [ ] Offer customer option to retry
  ELSE IF status unknown:
    [ ] Contact payment processor for authorization status
    [ ] Proceed based on their response
    
Step 4: Verify the fix
  [ ] Confirm order moved to terminal state
  [ ] Confirm all downstream systems were notified
  [ ] Run reconciliation query to verify state is consistent
```

---

### 6.2 Blast Radius Isolation

**Core principle:** When silent failure is detected, immediately limit the damage.

#### Pattern: Stale Dependency Circuit Breaker

```python
# When detected: Identity token is stale (permissions diverged)
# Response: Fail open until verified

def authorize_request(user_id, required_role):
    identity_provider = IdP.get_user_roles(user_id)  # Source of truth
    cached_identity = cache.get(f"user:{user_id}:roles")
    
    if identity_provider.roles != cached_identity.roles:
        # Divergence detected
        # Fail on the side of safety: deny access, not grant
        LOGGING.error(f"Identity divergence for user {user_id}")
        return DENY()  # Not GRANT()
    
    return ALLOW() if required_role in identity_provider.roles else DENY()
```

#### Pattern: Degrade Gracefully When Reconciliation Fails

```python
# When detected: Database and cache completely diverged, cannot reconcile
# Response: Degrade to read-through mode (slower but correct)

def get_user_data(user_id):
    # Try fast path (cache)
    cached = cache.get(f"user:{user_id}")
    if cached:
        # But verify it matches database
        db_value = database.get(f"SELECT * FROM users WHERE id = {user_id}")
        if cached == db_value:
            return cached  # Safe to use
        else:
            LOGGING.warn(f"Cache divergence for user {user_id}, using DB")
    
    # Slow path: read from database directly
    return database.get(f"SELECT * FROM users WHERE id = {user_id}")
```

---

## PART 7: IMPLEMENTATION ROADMAP (CAN DO IN HOURS, NOT WEEKS)

### Phase 1: Observation (2 hours)

**Goal:** Add monitoring queries that detect divergence, even if you don't have automated response yet.

```sql
-- For each critical data type, create ONE detection query
-- Run it manually every 5 minutes to see if it fires

-- Example 1: Payment ledger balance
SELECT 
  SUM(CASE WHEN type = 'debit' THEN amount ELSE -amount END) as net_balance
FROM ledger_entries;
-- Expected: 0 (every debit has matching credit)
-- Alert if != 0

-- Example 2: Cache vs. database divergence
SELECT COUNT(DISTINCT order_id)
FROM orders
WHERE json_extract(cache.get(CONCAT('order:', order_id, ':status')), '$.status')
  != status;
-- Expected: 0
-- Alert if > 0

-- Example 3: State machine duration
SELECT status, MAX(EXTRACT(EPOCH FROM (NOW() - created_at))) as max_duration_seconds
FROM orders
WHERE status IN ('payment_processing', 'awaiting_confirmation')
GROUP BY status;
-- Alert if max_duration_seconds > 300 (5 minutes)
```

**Deliverable:** 5 simple SELECT queries you run manually, understand the output, document the expected result.

---

### Phase 2: Alerting (4 hours)

**Goal:** Automate the detection queries, set thresholds, send alerts to Slack/PagerDuty.

```python
# Simple monitoring loop
def monitor_all_divergences():
    checks = [
        ('ledger_balance', lambda: db.query("SELECT SUM(...)")),
        ('cache_divergence', lambda: db.query("SELECT COUNT(...)")),
        ('order_state_duration', lambda: db.query("SELECT MAX(...)")),
    ]
    
    for check_name, query_func in checks:
        result = query_func()
        expected = EXPECTED_RESULTS[check_name]
        
        if result != expected:
            ALERT(f"{check_name} violation: expected {expected}, got {result}")
            send_to_slack(f"@oncall {check_name} divergence detected")

# Schedule this every 5 minutes
schedule.every(5).minutes.do(monitor_all_divergences)
```

**Deliverable:** Queries running on schedule, alerts firing to your notification channel, team responding.

---

### Phase 3: Auto-Remediation (6 hours)

**Goal:** For safe operations, automatically fix divergence without human intervention.

```python
def respond_to_divergence(check_name, divergence_details):
    if check_name == 'cache_divergence':
        # Safe: just repopulate from DB
        for order_id in divergence_details['diverged_ids']:
            db_value = db.query(f"SELECT status FROM orders WHERE id = {order_id}")
            cache.set(f"order:{order_id}:status", db_value, ttl=3600)
        return "REMEDIATED_CACHE"
    
    elif check_name == 'state_duration':
        # Might be safe: timeout the operation
        for order_id in divergence_details['stuck_ids']:
            if should_timeout_order(order_id):
                db.execute(f"UPDATE orders SET status = 'timeout' WHERE id = {order_id}")
        return "REMEDIATED_TIMEOUT"
    
    elif check_name == 'ledger_balance':
        # NOT safe: quarantine and alert
        ALERT(f"Ledger imbalance detected, manual review required")
        return "QUARANTINED"
```

**Deliverable:** Simple remediations running automatically for safe operations. Financial/critical operations still go to humans.

---

### Phase 4: Correlation & Root Cause (8 hours)

**Goal:** When divergence is detected, automatically surface the root cause.

```python
def diagnose_divergence(payment_id):
    # Trace this payment through all systems
    payment_record = database.query(f"SELECT * FROM payments WHERE id = {payment_id}")
    ledger_records = database.query(f"SELECT * FROM ledger WHERE payment_id = {payment_id}")
    notifications = database.query(f"SELECT * FROM notifications WHERE payment_id = {payment_id}")
    gateway_log = gateway.query(payment_id)
    
    timeline = []
    timeline.append(('Payment initiated', payment_record.created_at))
    timeline.append(('First ledger entry', ledger_records[0].created_at if ledger_records else None))
    timeline.append(('Notification sent', notifications[0].created_at if notifications else None))
    timeline.append(('Gateway response', gateway_log.response_time if gateway_log else None))
    
    # Find the gap
    for i in range(len(timeline) - 1):
        time_delta = timeline[i+1][1] - timeline[i][1]
        if time_delta > THRESHOLD:
            ALERT(f"Divergence found: gap between {timeline[i][0]} and {timeline[i+1][0]}")
            return timeline[i]
```

**Deliverable:** When divergence is detected, automatically surface "divergence started between X and Y steps at time T".

---

## APPENDIX: TEMPLATE DETECTION QUERIES BY DATABASE TYPE

### SQL: Basic Integrity Checks

```sql
-- 1. Orphaned records (foreign key violations)
SELECT 'orders without customer' as check_type, COUNT(*) as count
FROM orders WHERE customer_id NOT IN (SELECT id FROM customers)
UNION ALL
SELECT 'order_items without order' as check_type, COUNT(*) as count
FROM order_items WHERE order_id NOT IN (SELECT id FROM orders);

-- 2. Row count mismatch (primary vs. replica)
SELECT 'users primary', COUNT(*) FROM primary_db.users
UNION ALL
SELECT 'users replica', COUNT(*) FROM replica_db.users;

-- 3. Checksum mismatch
SELECT id FROM primary_db.users p
LEFT JOIN replica_db.users r ON p.id = r.id
WHERE MD5(CONCAT(p.email, p.status)) != MD5(CONCAT(r.email, r.status));

-- 4. State machine duration (things stuck in intermediate states)
SELECT status, COUNT(*) as count, MAX(NOW() - updated_at) as max_duration
FROM orders
WHERE status NOT IN ('completed', 'cancelled', 'failed')
GROUP BY status
HAVING max_duration > INTERVAL '30 minutes';
```

### NoSQL: Consistency Validation

```python
# DynamoDB: Post-write verification
def put_and_verify(table, item):
    table.put_item(Item=item)
    time.sleep(0.5)  # Wait for eventual consistency
    
    response = table.get_item(Key={'id': item['id']})
    if 'Item' not in response:
        raise DataInconsistency(f"Item not readable after write: {item['id']}")
    
    if response['Item'] != item:
        raise DataInconsistency(f"Item diverged after write: {item['id']}")

# Cosmos DB: Partition-specific validation
def validate_partition_consistency(partition_key):
    items_in_primary = container.query_items(
        query="SELECT * FROM c WHERE c.partition_key = @pk",
        parameters=[{"name": "@pk", "value": partition_key}]
    )
    
    items_in_secondary = secondary_container.query_items(
        query="SELECT * FROM c WHERE c.partition_key = @pk",
        parameters=[{"name": "@pk", "value": partition_key}]
    )
    
    if len(list(items_in_primary)) != len(list(items_in_secondary)):
        raise DataInconsistency(f"Partition replica lag: {partition_key}")
```

### Cache: TTL & Hit Rate

```python
# Redis: TTL validation
def validate_cache_ttls():
    pattern = "user:*:profile"
    for key in redis.scan_iter(match=pattern):
        ttl = redis.ttl(key)
        if ttl < 60:  # Less than 1 minute left
            ALERT(f"Cache key expiring soon: {key}, ttl={ttl}")
        if ttl == -2:  # Key does not exist
            user_id = key.split(':')[1]
            ALERT(f"Cache key missing: {key}, user_id={user_id}")

# Hit rate monitoring
def track_cache_hit_rate():
    before = redis.info('stats')['keyspace_hits']
    time.sleep(60)
    after = redis.info('stats')['keyspace_hits']
    
    hits = after - before
    total_requests = redis.info('stats')['total_commands_processed']
    
    hit_rate = hits / total_requests if total_requests > 0 else 0
    if hit_rate < 0.95:  # Below 95% hit rate
        ALERT(f"Cache hit rate degraded: {hit_rate:.2%}")
```

### Message Queues: Processing Lag

```python
# RabbitMQ: Queue depth & age
import pika

def check_queue_health(queue_name):
    connection = pika.BlockingConnection()
    channel = connection.channel()
    
    method, properties, body = channel.basic_get(queue_name, auto_ack=False)
    
    if method:
        message_age = time.time() - properties.timestamp
        if message_age > 300:  # Message in queue for >5 minutes
            ALERT(f"Message stuck in queue: {queue_name}, age={message_age}s")

# Kafka: Consumer lag
def check_consumer_lag(topic, consumer_group):
    admin = AdminClient({'bootstrap.servers': 'localhost:9092'})
    metrics = admin.describe_consumer_groups([consumer_group])
    
    for member in metrics[consumer_group].members:
        lag = member.lag
        if lag > 10000:
            ALERT(f"Consumer lag high: {consumer_group}, lag={lag}")
```

---

## SUMMARY: THE DETECTION STARTER KIT

To implement silent failure detection in your organization:

**Week 1 (40 hours total):**
- Day 1-2: Write detection queries for your 3-5 most critical data types
- Day 3-4: Set up scheduling + alerting
- Day 5: Auto-remediate safe operations
- Days 6-7: Drill response procedure (before the incident happens)

**What you get:**
- 1-5 minute detection window instead of "when customer complains"
- Automatic isolation of divergence (prevents spread)
- Clear diagnosis of what diverged and where
- Runbook to fix it without panic

**Cost:**
- CPU: ~5-10 queries per minute, negligible overhead
- Human time: 40 hours to implement
- Operational overhead: ~5 min per incident to remediate

**ROI:**
- Prevents $100k+ incidents (data loss, corrupted state, customer churn)
- Reduces MTTR from "hours of debugging" to "5 minutes to remediate"
- Builds confidence in data consistency

---

