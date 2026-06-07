---
title: 'Chapter 6: Silent Outages—When Data Corruption Looks Like Success'
description: >-
  Not all failures are loud. The most dangerous failures are silent: data
  corruption, inconsistency, and partial writes that leave your system appearing
  operational while integrity degrades. This chapter shows how to detect and
  prevent the failures that do not wake you up at 3 AM.
publishDate: '2026-06-06'
tags:
  - cloud-architecture
  - reliability
  - data-integrity
  - observability
status: published
---

*← [Identity – The System Kill Switch](/book/reliability-survival-guide/000032-identity-tier-zero-spof) | [How You See (and Miss) Reality →](/book/reliability-survival-guide/000034-reliability-illusions)*

---

Your system is returning 200 OK.

Your error rate is 0.001%.

Your latencies are normal.

Your data is corrupted.

You will not know for hours, days, or weeks.

This is the silent failure: the system continues to operate, responding correctly to requests, while integrity degrades in the background. By the time you notice, the damage has compounded through dozens of downstream systems.

## Silent failures are worse than loud failures

When your service crashes:
- Monitoring alerts immediately
- Users know something is wrong
- You can issue a status page update
- Recovery is visible and bounded

When your data is corrupted:
- The system returns success
- You cannot distinguish between "correct data returned" and "corrupted data returned"
- The corruption spreads to other systems that read the data
- You discover it when a human spots an anomaly (or worse, a customer does)

## The classic patterns

### Pattern 1: Partial writes

Your system writes to multiple destinations:
- Primary database
- Cache
- Search index
- Analytics pipeline

A request succeeds in destinations 1 and 2, fails in 3 and 4. Your application considers this "success" because the primary write worked.

**The result:** Your cache and search index are inconsistent with your database. Queries work fine until someone searches. Then they see outdated results, deleted items, or duplicates.

**The detection problem:** You monitor write latency and success rate. Both look fine. Your cache hit rate looks fine. Then one day someone notices their purchase is missing from the order history.

### Pattern 2: Distributed transaction partial failure

You have a workflow:
1. Debit account A
2. Credit account B
3. Log transaction
4. Send notification

Step 3 or 4 fails. The money moved but no record exists (or the user got no notification).

In financial systems, this is a nightmare. In less critical systems, it still breaks user experience and creates support noise.

**The detection problem:** Your primary operations succeeded. Your failure rate shows 0.1%. Nobody knows that 0.1% of transactions are missing their audit trail.

### Pattern 3: Replication lag masquerades as consistency

Your data is replicated to a secondary for resilience. During normal operation, replication lag is 100ms. That is fine.

Then something happens:
- Network partition
- Slow disk on replica
- GC pause
- Migration in progress

Replication lag jumps to 5 seconds. Then 30 seconds. Then your application times out waiting and falls back to the stale replica.

Requests start returning old data.

**The detection problem:** You monitor replication lag. But your threshold is "alert if > 60 seconds." You do not alert at 30 seconds because that has never caused problems before. But for this workload, 30 seconds is catastrophic.

### Pattern 4: Deletion cascades that do not cascade

You delete a user. Your application code is supposed to cascade:
1. Delete user record
2. Delete user sessions
3. Delete user preferences
4. Delete user audit logs

Step 1 succeeds. Steps 2-4 fail due to a dependency issue (session service is slow, preferences service is down).

**The result:** User is deleted but their ghost data remains. Orphaned sessions exist. When you reuse the user ID, you might pick up old sessions from the deleted user.

**The detection problem:** The deletion was reported as successful. Your orphaned data cleanup runs on a schedule (probably never) and does not cover this case.

### Pattern 5: Idempotency boundaries are wrong

You designed your system to be idempotent: the same request can be retried safely.

However, your idempotency check is wrong:
- You check by (user_id, request_id) but the same request_id is reused across sessions
- You check by timestamp but clocks are not synchronized
- You check by content hash but the content has cosmetic differences

Now retries create duplicates instead of being safe.

**The detection problem:** Your request traces look correct. Retries are being issued as designed. You do not notice the duplicates until billing runs: customers are charged twice.

### Pattern 6: Observability data loss masquerades as normal

Your observability pipeline has backpressure. When you are under load, logs and traces are dropped.

That is fine for debugging. It is not fine when the dropped data is the only evidence of corruption.

**Real scenario:** A data race causes incorrect behavior. It happens 0.01% of the time. Your observability system samples 10% of requests. The probability that the race is captured: extremely low. You will see error rate increase by 0.001% (0.01% * 10%) which falls below your alert threshold.

**The detection problem:** There is no log of the race happening. You see errors in production but cannot reproduce them. You eventually find the issue by code review, not by observability.

## What you should be doing

### 1. Define your consistency model explicitly

For each data flow, answer:
- Is this transaction or eventually consistent?
- What is the maximum acceptable staleness?
- What happens if a write fails partway through?
- How do you recover from partial failures?

Most teams never answer these questions. They just hope.

### 2. Build consistency verification into operations

Schedule a job that:
- Reads from primary and replicas
- Compares the values
- Reports inconsistencies
- Attempts to repair (or raises a ticket)

This is not real-time consistency. It is eventual consistency verification.

### 3. Implement compensating transactions

For workflows that span multiple services:
- Plan the rollback path before you build the happy path
- Build the rollback as a first-class operation
- Test that rollback actually works
- Monitor for stuck transactions that got partially rolled back

### 4. Separate audit logging from operational logging

Your observability pipeline is for debugging. It can drop data under load.

Your audit log is for forensics. It must not drop data.

Use different systems:
- Observability (logs, traces): sampling OK, latency sensitive
- Audit (immutable log): sampling NOT OK, latency tolerant

### 5. Monitor for corruption indicators, not just error rates

Error rate 0.001%: normal.
However:
- Cache hit rate dropped from 95% to 85%: investigate
- Search result count differs from database count: investigate
- Replication lag is now 5 seconds when it was 100ms: investigate
- User table row count does not match session table count: investigate

These are not errors. They are integrity warnings.

### 6. Build "consistency queries" into production monitoring

For critical data flows, run queries that verify integrity:

```sql
-- Check for orphaned records
SELECT COUNT(*) FROM sessions WHERE user_id NOT IN (SELECT id FROM users);

-- Check for stale cache
SELECT COUNT(*) FROM cache WHERE value != (
  SELECT value FROM primary WHERE key = cache.key
);

-- Check for replication lag
SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp()))
  AS replication_lag_seconds;
```

Run these periodically. Alert if counts are non-zero or lag exceeds threshold.

### 7. Test silent failures explicitly

In your chaos engineering, include:
- Write to primary succeeds, write to replica fails
- Primary returns data, replica returns stale version
- Cache has stale value while database is correct
- Partial write: first table succeeds, second table fails
- Replication lag exceeds your assumed threshold

Watch how your application behaves. Fix it before it is a production issue.

### 8. Implement read verification

For critical reads, verify the answer makes sense:

```python
# Read from cache first
value = cache.get(key)

# If we got something, verify it matches source
if value is not None:
    primary_value = primary.get(key)
    if value != primary_value:
        # Cache is stale, log incident
        log_consistency_violation(key, cache=value, primary=primary_value)
        # Return correct value
        value = primary_value
```

This catches cache staleness in real time.

## Detection Queries by Database Type

Theory without practice is a lecture. Here are the actual queries you run to detect silent failures.

Run these. Do not skip them because they look obvious. Silent failures look obvious in hindsight.

### Tier 1: Run Every 5 Minutes (Most Critical)

These are the canaries for catastrophic data loss. Alert immediately if counts are non-zero.

#### PostgreSQL / SQL

```sql
-- Orphaned foreign key records (data exists in child but not parent)
SELECT tablename, orphaned_count
FROM (
  SELECT 'orders_without_users' as tablename,
    COUNT(*) as orphaned_count
  FROM orders
  WHERE user_id NOT IN (SELECT id FROM users)
  
  UNION ALL
  
  SELECT 'sessions_without_users' as tablename,
    COUNT(*) as orphaned_count
  FROM sessions
  WHERE user_id NOT IN (SELECT id FROM users)
) counts
WHERE orphaned_count > 0;

-- Replication lag (primary to replica) in seconds
SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp()))
  AS replication_lag_seconds;

-- Uncommitted transactions that are blocking others
SELECT pid, usename, query, state_change
FROM pg_stat_activity
WHERE state = 'active'
  AND query_start < now() - interval '5 minutes'
ORDER BY query_start DESC;

-- Table bloat (dead rows that slow queries)
SELECT schemaname, tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  ROUND(100 * (pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename))
    / pg_total_relation_size(schemaname||'.'||tablename)) AS bloat_pct
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
```

#### MySQL / MariaDB

```sql
-- Orphaned foreign key records
SELECT COUNT(*) as orphaned_orders
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
WHERE u.id IS NULL;

-- Replication lag (seconds behind primary)
SHOW SLAVE STATUS\G
-- Look for: Seconds_Behind_Master

-- InnoDB redo log utilization
SELECT VARIABLE_VALUE
FROM information_schema.global_variables
WHERE variable_name = 'innodb_log_file_size';

-- Slow queries in the slow query log
SELECT count_star, sum_timer_wait, sql_text
FROM performance_schema.events_statements_summary_by_digest
ORDER BY count_star DESC
LIMIT 5;
```

#### DynamoDB (AWS SDK / CloudWatch)

```python
# Check for write throttling
import boto3
cloudwatch = boto3.client('cloudwatch')

response = cloudwatch.get_metric_statistics(
    Namespace='AWS/DynamoDB',
    MetricName='WriteThrottleEvents',
    StartTime=datetime.now() - timedelta(minutes=5),
    EndTime=datetime.now(),
    Period=60,
    Statistics=['Sum']
)

throttle_events = sum(dp['Sum'] for dp in response['Datapoints'])
if throttle_events > 0:
    print(f"ALERT: Write throttled {throttle_events} times in 5 minutes")

# Check for item collection size limit violations
# (happens when an item exceeds 10GB due to versioning)
response = cloudwatch.get_metric_statistics(
    Namespace='AWS/DynamoDB',
    MetricName='ItemCollectionSizeExceeded',
    StartTime=datetime.now() - timedelta(minutes=5),
    EndTime=datetime.now(),
    Period=60,
    Statistics=['Sum']
)
```

#### Redis

```bash
# Memory usage (if it hits max, writes silently fail)
redis-cli INFO memory | grep -E "used_memory|maxmemory|evicted_keys"

# Replication lag (if Redis has replicas)
redis-cli INFO replication | grep -E "role|slave|offset"

# Expired keys stuck in memory (if your expiration is not working)
redis-cli DBSIZE
redis-cli SCAN 0 TYPE string COUNT 1000  # Sample for TTLs
redis-cli TTL <sample_key>  # -1 means no expiration

# Slow log (commands that are slow)
redis-cli SLOWLOG GET 10
```

#### Message Queues (SQS / RabbitMQ)

```python
# AWS SQS: Check for messages that are not being consumed
import boto3
sqs = boto3.client('sqs')

queue_url = 'https://sqs.us-east-1.amazonaws.com/123456789012/my-queue'
attrs = sqs.get_queue_attributes(
    QueueUrl=queue_url,
    AttributeNames=['ApproximateNumberOfMessages', 'ApproximateNumberOfMessagesNotVisible']
)

visible = int(attrs['Attributes']['ApproximateNumberOfMessages'])
in_flight = int(attrs['Attributes']['ApproximateNumberOfMessagesNotVisible'])

if visible > 1000 and in_flight < 10:
    print(f"ALERT: Messages backing up. {visible} waiting, only {in_flight} in flight")

# Dead-letter queue (messages that failed and were retried too many times)
dlq_attrs = sqs.get_queue_attributes(
    QueueUrl='https://sqs.us-east-1.amazonaws.com/123456789012/my-queue-dlq',
    AttributeNames=['ApproximateNumberOfMessages']
)
dlq_count = int(dlq_attrs['Attributes']['ApproximateNumberOfMessages'])
if dlq_count > 0:
    print(f"ALERT: {dlq_count} messages in dead-letter queue")
```

---

### Tier 2: Run Every Hour (Important Consistency Checks)

These catch subtle corruption that spreads slowly. Alerting threshold is usually non-zero (some corruption is normal after partial failures), but sudden increases are dangerous.

#### PostgreSQL

```sql
-- Check for rows with NULL in columns that should have values
SELECT tablename, column_name, null_count
FROM (
  SELECT 'users' as tablename, 'email' as column_name,
    COUNT(*) as null_count
  FROM users WHERE email IS NULL
  
  UNION ALL
  
  SELECT 'orders' as tablename, 'total_amount' as column_name,
    COUNT(*) as null_count
  FROM orders WHERE total_amount IS NULL OR total_amount <= 0
) nulls
WHERE null_count > 0;

-- Check for duplicate unique keys (should never happen)
SELECT column_name, value, count(*) as duplicate_count
FROM (
  SELECT email, email as value, COUNT(*) 
  FROM users 
  GROUP BY email 
  HAVING COUNT(*) > 1
) duplicates
GROUP BY column_name, value;

-- Check for cascade delete failures
-- (user deleted but their orders remain)
SELECT COUNT(*) as orphaned_orders
FROM orders
WHERE user_id NOT IN (SELECT id FROM users);

-- Check for inconsistent totals
-- (order total != sum of line items)
SELECT COUNT(*) as broken_totals
FROM orders o
WHERE o.total_amount != (
  SELECT COALESCE(SUM(unit_price * quantity), 0)
  FROM order_items
  WHERE order_id = o.id
);
```

#### MongoDB

```python
# Check for missing indexes that are causing slow queries
import pymongo

client = pymongo.MongoClient('mongodb://localhost:27017/')
db = client['production']

# Find collections with full table scans
for collection_name in db.list_collection_names():
    stats = db.command('collStats', collection_name)
    
    # If totalIndexSize is 0, no indexes exist
    if stats.get('totalIndexSize', 0) == 0 and stats['count'] > 1000:
        print(f"WARNING: {collection_name} has {stats['count']} documents but no indexes")

# Check for duplicate _id values (should be impossible)
for collection_name in db.list_collection_names():
    collection = db[collection_name]
    duplicates = collection.aggregate([
        {'$group': {'_id': '$_id', 'count': {'$sum': 1}}},
        {'$match': {'count': {'$gt': 1}}}
    ])
    
    dup_count = sum(1 for _ in duplicates)
    if dup_count > 0:
        print(f"ALERT: {collection_name} has {dup_count} duplicate _id values")
```

#### DynamoDB

```python
# Check for data validation anomalies using Athena queries
import boto3

athena = boto3.client('athena')

# Example: Check for orders with timestamps in the future
query = """
SELECT COUNT(*) as future_orders
FROM my_dynamodb_table
WHERE created_at > current_timestamp
"""

response = athena.start_query_execution(
    QueryString=query,
    QueryExecutionContext={'Database': 'my_database'},
    ResultConfiguration={'OutputLocation': 's3://my-bucket/results/'}
)
```

---

### Tier 3: Run Daily (Trending & Anomalies)

These are the slow checks that reveal long-term degradation. Run at low traffic times.

#### PostgreSQL / MySQL

```sql
-- Database growth rate (are you storing things you should not?)
SELECT
  datname as database_name,
  pg_size_pretty(pg_database_size(datname)) as size,
  COUNT(*) * 8 / 1024.0 as size_change_mb_since_yesterday
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC;

-- Table growth rate (which tables are bloating?)
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  ROUND(100.0 * (EXTRACT(EPOCH FROM (now() - last_vacuum)) / 86400)) as days_since_vacuum
FROM pg_tables
LEFT JOIN pg_stat_user_tables USING (tablename)
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;

-- Backup success rate (are backups actually working?)
SELECT
  backup_id,
  database_name,
  backup_time,
  backup_size,
  verification_status
FROM backups
WHERE backup_time > now() - interval '24 hours'
ORDER BY backup_time DESC;
```

---

## Frequency Recommendations by Tier

| Tier | Frequency | Alert Threshold | Example |
|---|---|---|---|
| **Tier 1** | Every 5 minutes | Non-zero (immediate escalate) | Replication lag, orphaned records, write throttling |
| **Tier 2** | Every hour | Usually zero, alert on change | Duplicate keys, cascade failures, data validation |
| **Tier 3** | Daily | Trend-based | Table growth, backup validation, slow queries |

---

## Real Incident Mappings

### Incident: GitHub Database Replication Lag (2017)

**What happened:** Replication lag drifted from 100ms to 8 seconds during a deploy. Application timed out and fell back to stale replica. Users saw 6-hour-old repos.

**Detection query (Tier 1):**
```sql
SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp()))
  AS replication_lag_seconds;
```

**Should have alerted when:** Lag exceeded 2 seconds (not 60 seconds)

**Resolution:** Tuned alert threshold from 60s to 5s. Added canary queries that verify replica is fresh before using it.

### Incident: Discord Cache Partitioning (2016)

**What happened:** Cache layer partitioned during network event. Half the servers cached one version of user data, half cached another. Users saw data flicker between two states.

**Detection query (Tier 2):**
```python
# Sample cache entries and compare to database
for key in redis.scan(match='user:*', count=100):
    cache_value = redis.get(key)
    db_value = db.get(key)
    if cache_value != db_value:
        log_inconsistency(key, cache=cache_value, db=db_value)
```

**Should have alerted when:** 10+ inconsistencies detected in one minute

**Resolution:** Built cache verification into request path. On mismatch, invalidate cache and return fresh data.

### Incident: Stripe Failed Cascade Delete (2014)

**What happened:** Deleted a customer. Billing records remained. New customer with same ID received old invoices.

**Detection query (Tier 1):**
```sql
SELECT COUNT(*) as orphaned_invoices
FROM invoices
WHERE customer_id NOT IN (SELECT id FROM customers);
```

**Should have alerted when:** Any orphaned invoices existed (should be zero)

**Resolution:** Made cascade deletes explicit. Built pre- and post-delete validation. Never rely on implicit cascades.

---

## Response Procedures: Detect → Isolate → Reconcile → Validate

When a consistency query triggers:

**1. Detect (Now)**
- Query confirmed corruption exists
- Example: 47 orphaned records found
- Alert: Yes, escalate immediately

**2. Isolate (0-5 minutes)**
- Stop writes to affected tables (if safe)
- Example: Set orders table to read-only
- Prevent corruption from spreading
- Notify team: "Table X is read-only during reconciliation"

**3. Reconcile (5-60 minutes)**
- Repair the corruption
- Manual examples:
  ```sql
  -- Delete orphaned records
  DELETE FROM orders WHERE user_id NOT IN (SELECT id FROM users);
  
  -- Recalculate totals
  UPDATE orders SET total = (SELECT SUM(price) FROM order_items WHERE order_id = orders.id);
  ```
- Validate that repair succeeded

**4. Validate (Before resuming)**
- Re-run the detection query (should show zero)
- Sample queries to verify data looks correct
- Resume writes only after validation passes
- Postmortem: Why did the corruption happen?

---

## Threshold Tuning: When to Alert

**Anti-pattern:** "Alert when count > 0"
- Triggers too often for inevitable small corruptions
- Teams create alert suppression rules (defeats the purpose)

**Better pattern:** Alert when count is abnormal for your system

```python
# Pseudocode: Smart threshold
orphaned_records = run_query("SELECT COUNT(*) orphaned FROM orders...")

# Baseline: What is normal for this system?
# Most systems have occasional orphaned records from:
# - Cascade delete timing windows
# - Partial failure recovery
baseline = 0  # or 1 or 5, depends on your system

if orphaned_records > baseline * 10:
    # Major corruption, alert immediately
    alert("CRITICAL: Orphaned record count {orphaned_records}, baseline {baseline}")
elif orphaned_records > baseline + 1 and orphaned_records > baseline * 1.5:
    # Trending toward corruption, investigate
    alert("WARNING: Orphaned count increased from {baseline} to {orphaned_records}")
else:
    # Normal
    pass
```

---

## Automation: Running Queries in Production

**Option 1: Scheduled job (recommended)**
```python
import schedule
import time

def run_consistency_checks():
    results = {
        'timestamp': datetime.now(),
        'checks': []
    }
    
    # Tier 1 every 5 minutes
    results['checks'].append(check_replication_lag())
    results['checks'].append(check_orphaned_records())
    results['checks'].append(check_write_throttling())
    
    # Tier 2 every hour
    if datetime.now().minute == 0:
        results['checks'].append(check_duplicate_keys())
        results['checks'].append(check_cascade_deletes())
    
    # Tier 3 daily at 2am
    if datetime.now().hour == 2 and datetime.now().minute == 0:
        results['checks'].append(check_table_bloat())
        results['checks'].append(check_backup_success())
    
    # Send results to observability system
    observability.send(results)
    
    # Alert on any failures
    for check in results['checks']:
        if check['status'] == 'FAILED':
            alert.send(check)

schedule.every(5).minutes.do(run_consistency_checks)
while True:
    schedule.run_pending()
    time.sleep(1)
```

**Option 2: Observability system SQL job**
- Set up recurring SQL jobs in your observability tool (e.g., DataDog, New Relic, Datadog)
- They run the queries on schedule and alert on anomalies
- Easier than maintaining code, but less flexible

**Option 3: Database-native jobs**
- PostgreSQL: pg_cron extension
- MySQL: Event scheduler
- Less flexible, but no external dependencies

---

## The uncomfortable truth

The systems that fail silently are the ones you are confident about.

You are confident because:
- They have been running for months
- Your error rate is low
- Your monitoring shows green
- You have not had an incident in 6 months

That confidence is exactly when data corruption is most likely to go unnoticed.

By the time you detect it, it has propagated through three systems and your customers have discovered it in their reports.

---

## Key architecture principle

**Silent failures require different monitoring than loud failures.**

Loud failures (crashes, timeouts, 500 errors) show up in error rate.

Silent failures (data corruption, inconsistency, stale reads) do not. They show up in:
- Consistency queries
- Data verification
- Comparison between systems
- Human-observed anomalies

If you are only monitoring error rate, you are not monitoring for the worst failures.

---

## Chapter index

| Chapter | Topic |
|---|---|
| [Chapter 1](/book/reliability-survival-guide/000017-reliability-is-an-economic-decision) | Opening thesis: reliability as economic decision |
| [Chapter 2](/book/reliability-survival-guide/000019-systems-fail-according-to-incentives) | Incentives and organizational failure |
| [Chapter 3](/book/reliability-survival-guide/000031-the-things-that-actually-break) | The things that actually break |
| [Shared Responsibility](/book/reliability-survival-guide/000020-shared-responsibility-accountability-vacuum) | Shared responsibility and accountability vacuum |
| [Chapter 4](/book/reliability-survival-guide/000021-reliability-equation-financial-model) | The financial model |
| [Chapter 5](/book/reliability-survival-guide/000022-provider-failures-status-pages) | Provider failures and status page reality |
| [Chapter 6](/book/reliability-survival-guide/000023-partial-failure-control-plane-failures) | Partial failures and degraded-state design |
| [Chapter 5 (Alt)](/book/reliability-survival-guide/000032-identity-tier-zero-spof) | Identity as a Tier-0 failure domain |
| **Chapter 6 (Alt)** | **Silent outages and data corruption** |
| [Chapter 7](/book/reliability-survival-guide/000024-hidden-cost-reliability-tooling) | Hidden cost of observability tooling |
| [Chapter 8](/book/reliability-survival-guide/000025-reliability-tradeoffs-on-call-finops) | Trade-offs: on-call, FinOps, and human cost |
| [Chapter 9](/book/reliability-survival-guide/000026-reliability-governance-adr-ledger-indicators) | Governance system |
| [Chapter 10](/book/reliability-survival-guide/000027-reliability-execution-quarterly-plan) | Execution and the next quarter |
| [Chapter 12](/book/reliability-survival-guide/000029-reliability-pricing-saas-margin-trap) | Reliability pricing and the SaaS margin trap |
| [Appendix](/book/reliability-survival-guide/000028-reliability-operating-artifacts-and-policy-templates) | Operating artifacts and policy templates |
| [Chapter 13](/book/reliability-survival-guide/000030-reliability-maturity-organizational-adoption) | Maturity and organizational adoption |

---

*I work at Microsoft. The views expressed here are my own and based solely on publicly available information. This content is for educational purposes and does not represent official Microsoft guidance or commitments.*
