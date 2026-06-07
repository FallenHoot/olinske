---
title: 'Appendix B: Operational Artifacts and Templates'
description: >-
  Copy-paste ready templates for building your operational runbooks, dependency
  maps, SPOF inventories, detection queries, and recovery checklists. Use these
  as starting points for your service.
publishDate: '2026-06-06'
tags:
  - cloud-architecture
  - incident-response
  - operations
  - templates
status: published
copyright: © 2026 Zach Olinski. All rights reserved.
licenseUrl: 'https://olinske.com/docs/COPYRIGHT.md'
attributionRequired: true
commercialUsePermitted: false
---

# Appendix B: Operational Artifacts and Templates

Every service needs these documents. Most services do not have them. Use these templates to build yours.

Print each one. Populate it with your service's details. Keep it in your wiki, not in people's heads.

---

## TEMPLATE 1: Service Runbook

**File:** `docs/runbooks/[service-name].md`

```markdown
# [Service Name] Runbook

## Quick Facts

| Attribute | Value |
|---|---|
| **Owner** | [Your name / team] |
| **On-Call Rotation** | [Pagerduty rotation name] |
| **Escalation** | [Manager / tech lead name] |
| **Criticality** | [Tier 1 (user-facing) / Tier 2 (system) / Tier 3 (operational)] |
| **Failover Available?** | [Yes / No] |
| **RPO** | [Recovery Point Objective: how much data loss acceptable?] |
| **RTO** | [Recovery Time Objective: how fast must it be back?] |

## Service Overview

### What does this service do?

[One paragraph describing the service's primary purpose and user journey]

Example: "PaymentProcessor validates credit card transactions and coordinates funds transfer. It is called during checkout (synchronous) and by the billing system (async via queue). Latency must be < 200ms for checkout to feel responsive."

### Service Dependencies

```
External:
  ├─ Stripe API (payment gateway) - used for card validation and charges
  ├─ PayPal API (alt payment method)
  └─ Datadog (observability)

Internal:
  ├─ UserService (authenticated user context)
  ├─ OrderService (create/update orders after payment)
  ├─ NotificationService (email receipts)
  └─ AuditService (log all transactions)

Data:
  ├─ PostgreSQL (transaction history, card tokens)
  ├─ Redis (session cache, rate limits)
  └─ S3 (audit logs archive)
```

### How to Find Things

| Resource | Location |
|---|---|
| Code | https://github.com/org/payment-processor |
| Deployment Pipeline | https://github.com/org/payment-processor/actions |
| Logs | Datadog > Logs > `service:payment-processor` |
| Metrics | Datadog > Dashboards > Payment Processor |
| Alerts | Datadog > Monitors > `payment-` |
| Config | `terraform/payment-processor/` |
| Docs | This file + team wiki page |

## The Service is Down: Diagnosis Tree

### Symptom 1: "Payment API returns 500"

**Check immediately:**
```bash
# SSH to prod (or container shell)
ssh prod-payment-01
curl -i http://localhost:8000/health
# Look for: 200 OK or 503 Service Unavailable?

# Check service logs
docker logs payment-processor-1 | tail -100
# Look for: panic, fatal, exception stack traces
```

**If 503 (service down):**
- Service crashed or is not running
- Restart: `systemctl restart payment-processor` or re-deploy
- Wait 30 seconds, check again

**If 500 + dependencies healthy:**
- Check: Is this a recent deployment? (See: Deployment Incidents below)
- Run: `curl -i http://Stripe-api.example.com/health` (check Stripe)
- Run: `curl -i http://localhost:6379` (check Redis)
- If Stripe is down → escalate to payment team, use cached response
- If Redis is down → restart Redis or switch to backup

### Symptom 2: "Timeout - requests taking > 30 seconds"

**Check immediately:**
```bash
# Check service latency
# Datadog: Payment Processor Dashboard > "Request Latency" graph
# Is it p99 > 30s? p50 > 5s?

# Check Stripe response time
# Datadog: Monitor > Stripe Integration > "Latency to Stripe"
# If Stripe latency is high, they are slow (not us)

# Check database connection pool
# SSH to server: curl http://localhost:8000/debug/pprof/heap
# Look for: open database connections (should be < 10)
```

**If database is slow:**
- Run: `SELECT COUNT(*) FROM pg_stat_activity WHERE query_start < now() - interval '5 min'`
- If count > 0: slow queries are running. Kill them or restart DB.

**If Stripe is slow:**
- Check Stripe status page
- Implement timeout: kill request after 5s, return cached response
- Alert Stripe support

**If service is genuinely slow (no dependency issue):**
- Recent deployment?
- Check deployment time vs. latency spike
- If yes → rollback (see: Deployment Incidents)
- If no → scale up (more instances)

### Symptom 3: "Error rate spiking - 5% of requests failing"

**Check immediately:**
```bash
# See the actual errors
# Datadog: Logs > filter service:payment-processor status:error
# Read 10 error messages. What is the pattern?

# Is it "Stripe API returned 429 (rate limited)"?
#   → Add exponential backoff, lower request rate, escalate to Stripe
#
# Is it "Database connection pool exhausted"?
#   → Increase pool size or reduce number of instances
#
# Is it "JSON parse error: invalid field"?
#   → API contract broken, recent deployment
#   → Roll back or check if client changed behavior
```

---

## The Service is Slow: Performance Incidents

### Incident Type: Database Slow

**What you will see:**
- Request latency is high (p99 > 5 seconds)
- Database latency is high (query takes > 1 second)
- Error rate may be normal (queries complete, just slowly)

**What to do:**

1. **Check if this is normal:**
   ```sql
   -- Baseline: What is normal query time for this query?
   SELECT query, mean_time FROM pg_stat_statements WHERE query LIKE '%payment%' ORDER BY mean_time DESC LIMIT 5;
   ```

2. **Kill slow queries:**
   ```sql
   -- Find long-running queries
   SELECT pid, usename, query_start, query FROM pg_stat_activity
   WHERE state = 'active' AND query_start < now() - interval '10 minutes';
   
   -- Kill them
   SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid = [PID];
   ```

3. **Restart database if necessary:**
   - Last resort if many queries stuck
   - Warning: Takes 30 seconds, all requests fail during restart
   - Impact: Usually worth it to restore service

4. **Scale horizontally:**
   - Add read replicas for SELECT queries
   - Use connection pooling (PgBouncer)
   - Cache query results

---

## Incident Type: Memory Leak

**What you will see:**
- Process memory grows over time
- After a few hours, service crashes (OOM killed)

**What to do:**

1. **Restart the service (immediate fix):**
   - `systemctl restart payment-processor`
   - Latency spike during restart, but service recovers

2. **Investigate the leak:**
   - Get heap dump: `curl http://localhost:8000/debug/pprof/heap > heap.prof`
   - Analyze: `go tool pprof heap.prof`
   - Look for: growing allocations not freed
   - Find the code: likely unclosed connection, unbounded cache, or goroutine leak

3. **Deploy fix:**
   - Fix code, test in staging
   - Blue-green deploy (zero downtime)
   - Monitor: memory stays stable after fix

---

## Incident Type: Deployment Broke Something

**What you will see:**
- Error rate spiked right after deployment
- Tests passed in staging, failed in production

**What to do:**

1. **Immediate: Decide in < 2 minutes**
   - Is error rate > 5%? → Rollback now
   - Is error rate 1-5%? → Investigate (1 minute), then decide
   - Is error rate < 1%? → Monitor (5 more minutes), then decide

2. **Rollback if needed:**
   ```bash
   # Rollback to previous version
   kubectl rollout undo deployment/payment-processor
   # Or: git revert [commit], re-deploy
   ```

3. **Post-incident:**
   - What was the issue?
   - Why didn't tests catch it?
   - Add test case for this scenario

---

## Dependencies Are Down: What to do

### Stripe API Down

**What happens:**
- Your service tries to charge a card
- Stripe returns 500 or times out
- Payment fails, user sees error

**What to do:**

1. **Immediate:**
   - Check Stripe status page: https://status.stripe.com
   - If confirmed outage: notify customers
   - Use cached responses if available (old card data)

2. **Short term:**
   - Queue requests (RabbitMQ, SQS)
   - Retry when Stripe recovers

3. **Long term:**
   - Have backup payment processor (PayPal)
   - Or: implement queue + scheduled retry

---

### UserService Down

**What happens:**
- Your service cannot verify user identity
- Requests fail: "Cannot authenticate"

**What to do:**

1. **Check if temporary:**
   - Retry 3 times with backoff
   - If still failing, escalate

2. **Use fallback:**
   - Do you cache user data? Use it.
   - Is this critical? Fail fast vs. fail safe?

3. **Escalate:**
   - Page UserService on-call
   - Brief: "Your service is not responding, impacting payments"

---

## Recovery Validation

**After resolving any incident:**

### Immediate (< 5 minutes after fix):

- [ ] Error rate normal (< 1%)
- [ ] Latency normal (p99 < 500ms)
- [ ] No new alerts
- [ ] Sample a manual payment (with test card)

### Short-term (< 1 hour):

- [ ] No payment complaints from customers
- [ ] Retry queue draining (if used)
- [ ] Database consistency check: `SELECT COUNT(*) FROM transactions WHERE status IS NULL`

### Post-incident (within 24 hours):

- [ ] Postmortem scheduled
- [ ] Why did it happen?
- [ ] Why didn't we catch it earlier?
- [ ] What monitoring did we miss?

---

## Escalation Contacts

| Role | Name | Pager | Slack |
|---|---|---|---|
| Service Owner | [Name] | [Pagerduty URL] | @[slack-handle] |
| Tech Lead | [Name] | [Pagerduty URL] | @[slack-handle] |
| Manager | [Name] | [Pagerduty URL] | @[slack-handle] |
| Database Admin | [Name/team] | [Pagerduty URL] | @[slack-channel] |
| SRE On-Call | [Team] | [Pagerduty URL] | #[slack-channel] |

---

## Quick Command Reference

```bash
# Check service status
curl http://payment-processor:8000/health

# View recent logs
stern payment-processor -n production

# SSH to production
ssh prod-payment-01

# View running processes
ps aux | grep payment-processor

# Check disk usage
df -h

# Monitor real-time
watch -n 1 'curl -s http://localhost:8000/metrics | grep http_request'

# Graceful restart (allow in-flight requests to complete)
kill -TERM [PID]

# Force restart
systemctl restart payment-processor

# Check database connections
psql -h db.prod.internal
  SELECT COUNT(*) FROM pg_stat_activity WHERE datname = 'payments';
```

---

## Links

- [Code Repository](https://github.com/org/payment-processor)
- [Architecture Decision Records](https://github.com/org/payment-processor/tree/main/docs/adr)
- [Performance Baselines](https://docs.company.com/payments/performance)
- [Disaster Recovery Plan](https://docs.company.com/payments/dr)
- [On-Call Playbook](https://docs.company.com/oncall/payments)

```

---

## TEMPLATE 2: Dependency Map

**File:** `docs/dependency-map-[service].md`

```markdown
# Dependency Map: [Service Name]

## Service Dependencies (Inbound & Outbound)

### This Service: [Service Name]

```
┌──────────────────┐
│  [ServiceName]   │
│  :8000           │
│  (Tier 1)        │
└──────────────────┘
        ▲ │
        │ │
 ┌──────┘ └────────────────────────┐
 │                                 │
 │                                 ▼
 │                          ┌──────────────┐
 │                          │  OrderService│  (depends on us for payment)
 │                          │  :8001       │
 │                          └──────────────┘
 │
 ├─ Calls Stripe API
 │  (async, 10 req/sec, 500ms timeout)
 │
 ├─ Calls UserService
 │  (sync, needs < 100ms)
 │
 ├─ Writes to PostgreSQL
 │  (connection pool: 20 connections)
 │
 └─ Caches in Redis
    (TTL: 1 hour, 5GB max)
```

### Dependency Details

| Dependency | Type | Criticality | Timeout | Failure Mode |
|---|---|---|---|---|
| Stripe | External API | Critical | 5s | Queue + retry; use cached card |
| UserService | Internal API | Critical | 2s | Return 503; escalate |
| PostgreSQL | Database | Critical | 30s | Connection pool limit; restart DB |
| Redis | Cache | Important | 1s | Degrade to DB reads (slower) |
| Datadog | Observability | Nice-to-have | 1s | Lose metrics; still run |

### Dependents (Who Depends On Me?)

| Service | Type | How Critical? | Failure Impact |
|---|---|---|---|
| OrderService | Internal | Critical | Cannot complete checkout; user sees error |
| BillingService | Internal | Critical | Cannot charge customer; revenue loss |
| AnalyticsService | Internal | Nice-to-have | Cannot track payment events; metrics delayed |
| NotificationService | Internal | Important | Cannot send receipts; customer support burden |

---

## Failure Modes & Cascades

### If [Service] Fails

**Who breaks immediately?**
- OrderService: checkout cannot complete (users stuck)
- BillingService: scheduled billing cannot run (revenue stops)

**Blast radius:** ~10,000 users/hour affected

**Recovery impact:** OrderService needs to retry, may create duplicate attempts

---

### If Stripe API Fails

**What happens to [Service]?**
- New payments cannot be processed
- Old cached card data allows retries
- Service health: degraded but not down

**Blast radius:** New payment processing is blocked (~1,000 users/hour)

**Our responsibility:** Queue the payment and retry when Stripe recovers

---

### If PostgreSQL Fails

**What happens?**
- Service cannot read/write transaction history
- All requests fail (no workaround available)

**Blast radius:** Complete outage

**Recovery:** Database failover (takes 5-10 minutes)

---

## Deployment Implications

### Safe Deployment Order

When deploying correlated changes:

1. **Deploy PaymentService first** (no other service depends on new code)
2. **Wait 5 minutes** (monitor for errors)
3. **Then deploy OrderService** (now it can use new PaymentService API)

### Unsafe Deployment Order

If you deploy OrderService first and it expects new PaymentService API:
- OrderService will fail calling PaymentService until it deploys
- You have a brief window of cascading errors

---

## Scaling Implications

When you scale [Service]:

| Component | Scaling Impact | Action |
|---|---|---|
| Instances | 2 → 5 instances | +8 DB connections needed |
| Database | 20 → 40 connection pool | Restart to apply config |
| Cache | More instances = more cache hits | Size Redis to 10GB for 5 instances |
| Stripe API | More requests to Stripe | Verify rate limit headroom (500 req/s) |

---

## Change Impact

**Before you change this service, verify:**

- [ ] Will OrderService still work?
- [ ] Will API contract still be backward-compatible?
- [ ] Can we rollback without breaking dependents?
- [ ] Have you tested with dependent services in staging?

```

---

## TEMPLATE 3: SPOF (Single Point of Failure) Inventory

**File:** `docs/spof-[service].md`

```markdown
# SPOF Inventory: [Service Name]

## Critical SPOFs (Failure = Service Down)

| SPOF | Current State | Redundancy? | Fix |
|---|---|---|---|
| PostgreSQL (primary) | prod-db-01.us-east-1.internal | Replica only | Add another replica in different AZ |
| Stripe API key | Stored in Vault | No backup | Store backup key in different Vault |
| Deployment pipeline | GitHub Actions | Backup to GitLab | (Document manual deploy procedure) |
| Redis cluster | 1 primary + 2 replicas | Replicas only | Add primary in different region |
| Load balancer | Single ALB | No backup | Add backup ALB (requires DNS failover) |

---

## Important SPOFs (Failure = Degraded)

| SPOF | Current State | Redundancy? | Fix |
|---|---|---|---|
| Datadog (observability) | SaaS (99.9% SLA) | No alternative | None (accept SLA risk) |
| NotificationService | Internal API | No backup | Low priority |
| Analytics Pipeline | Async job (Spark) | Can retry | Low priority |

---

## How to Reduce

### SPOF: PostgreSQL Primary

**Current:** Single primary in one AZ

**Risk:** If it fails, entire service down (30 min recovery)

**Options:**

1. **Add read replicas** (current): Backup but cannot write
2. **Add standby primary** (better): Automatic failover, zero downtime
3. **Multi-region** (best): Replicate to another region, cross-region failover

**Recommended:** Option 2 (standby primary) = 2-3 hour project

---

### SPOF: Stripe API Key

**Current:** Only in Vault. No backup.

**Risk:** If Vault is inaccessible and we have no cached key, cannot process payments

**Options:**

1. **Cache the key locally** (current): Works but is a security anti-pattern
2. **Store in separate Vault** (better): Redundant secret storage
3. **Multi-provider** (best): Also use PayPal as fallback

**Recommended:** Option 2 (separate Vault) = 1 hour project

---

### SPOF: Load Balancer

**Current:** Single ALB. If it fails, service is unreachable.

**Risk:** LB failures are rare but do happen (software bug, hardware failure)

**Options:**

1. **Keep single LB** (current): Accept risk
2. **Add backup LB** (better): Manual DNS failover
3. **Active-active LBs** (best): Automatic failover

**Recommended:** Option 2 (backup LB) = 4 hour project

---

## Reducing SPOFs: Priority Matrix

| SPOF | Impact | Likelihood | Effort | Priority |
|---|---|---|---|---|
| Stripe key | Critical | Very low | Low | Medium |
| PostgreSQL primary | Critical | Low | High | High |
| LB | High | Very low | Medium | Medium |
| Vault access | Medium | Low | High | Low |

**Recommended next steps:**
1. Fix PostgreSQL primary (standby)
2. Add backup LB
3. Add backup Vault for Stripe key

```

---

## TEMPLATE 4: Silent Failure Detection Checklist

**File:** `ops/checks/[service]-silent-failures.sql`

```sql
-- Run this query daily at 2 AM
-- Alert if any count > 0

SELECT 
  'SILENT_FAILURE_CHECKS' as category,
  NOW() as check_time,
  
  -- Check 1: Orphaned records
  (SELECT COUNT(*) FROM orders WHERE user_id NOT IN (SELECT id FROM users)) as orphaned_orders,
  
  -- Check 2: Unfinished transactions
  (SELECT COUNT(*) FROM transactions WHERE status IS NULL AND created_at < NOW() - interval '1 hour') as stuck_transactions,
  
  -- Check 3: Duplicate payments
  (SELECT COUNT(*) FROM (SELECT user_id, created_at, COUNT(*) FROM transactions WHERE created_at > NOW() - interval '24 hours' GROUP BY user_id, created_at HAVING COUNT(*) > 1) as dups) as duplicate_payments,
  
  -- Check 4: Cache misses
  (SELECT COUNT(*) FROM cache_misses WHERE created_at > NOW() - interval '1 hour') as cache_misses_recent,
  
  -- Check 5: Replication lag
  (SELECT EXTRACT(EPOCH FROM (NOW() - pg_last_xact_replay_timestamp())) as replication_lag_seconds) as replication_lag,
  
  -- Check 6: Table bloat
  (SELECT COUNT(*) FROM pg_tables WHERE pg_total_relation_size(schemaname||'.'||tablename) > 10GB AND schemaname NOT IN ('pg_catalog', 'information_schema')) as bloated_tables,
  
  -- Check 7: Slow queries
  (SELECT COUNT(*) FROM pg_stat_statements WHERE mean_exec_time > 1000 LIMIT 5) as slow_queries_count;
```

---

## TEMPLATE 5: Post-Incident Recovery Checklist

**File:** `docs/post-incident-validation.md`

```markdown
# Post-Incident Recovery Validation

**Use after any incident. Do not declare "all clear" until this is complete.**

---

## First 10 Minutes: Technical Validation

- [ ] Service is responding to requests
  - Test: `curl http://service:8000/health` returns 200
  
- [ ] Error rate is normal (< 0.1%)
  - Check: Datadog error rate graph is green
  
- [ ] Latency is normal (p99 < 500ms)
  - Check: Datadog latency graph is green
  
- [ ] All instances are healthy
  - Check: All 5 instances in load balancer
  
- [ ] Database replication lag is normal (< 1 second)
  - Check: Query shows lag < 1s
  
- [ ] No new alerts firing
  - Check: Datadog monitor page has no red alerts

---

## First 30 Minutes: Data Integrity Validation

- [ ] Database is consistent
  - Run: `SELECT COUNT(*) FROM transactions WHERE status IS NULL` (should be ~0)
  - Run: `SELECT COUNT(*) FROM orders WHERE user_id NOT IN (SELECT id FROM users)` (should be 0)
  
- [ ] Recent transactions completed
  - Check: Last 100 transactions all have status = completed
  
- [ ] Cache is warm
  - Check: Cache hit rate > 80%
  
- [ ] No orphaned records
  - Check: No sessions for deleted users

---

## First 60 Minutes: Operational Validation

- [ ] Support team: No new complaints
  - Ask: Any customer reports of issues?
  
- [ ] Finance team: Payments are processing
  - Check: Revenue tracking dashboard shows data
  
- [ ] Product team: Features working as expected
  - Test: Manual checkout (with test card)
  
- [ ] No cascading issues discovered
  - Check: OrderService, BillingService both healthy

---

## Decision: All Clear?

**If ALL validation checks passed:**
- [ ] Technical = green ✓
- [ ] Data integrity = green ✓
- [ ] Operational = green ✓
- **Then: Declare "All Clear"**
  - Notify customers: "Issue resolved"
  - Notify team: "Incident closed"
  - Schedule postmortem: 48 hours later

**If ANY validation check failed:**
- Resolve the new issue
- Re-validate
- Only then declare "All Clear"

**DO NOT declare "all clear" early:**
- Declaring recovery before validation = declaring it again 30 min later
- Damages credibility

```

---

## TEMPLATE 6: Economics Decision Card

**File:** `docs/economics-threshold.md`

```markdown
# Economics Decision Card: [Service Name]

## When to Invest in Reliability

Use this to decide: Should we invest in redundancy, monitoring, or failover?

---

## Service Economics

| Metric | Value |
|---|---|
| Revenue per minute when service is up | $[amount] |
| Average downtime per year (baseline) | [hours] |
| Cost per hour of downtime | [amount] |
| Annual cost of reliability investment | [amount] |

---

## Decision Matrix: Reliability Investment

| Failure Mode | Frequency | Impact | Cost of Fix | ROI | Decision |
|---|---|---|---|---|---|
| Database failover | 1x per 2 years | 30 min down, $50k loss | $10k to build | **Worth it** | Invest |
| Second LB | 1x per 10 years | 15 min down, $25k loss | $5k to build | **Marginal** | Skip |
| Stripe backup | 1x per year | 30 min degraded, $10k loss | $15k to build | **Not worth** | Skip |
| Cache backup | 1x per month | 5 min slow, $1k loss | $3k to build | **Worth it** | Invest |

---

## This Quarter's Decision

**Invest:** Database failover (highest ROI)
**Skip:** Stripe backup (not enough savings to justify cost)
**Skip:** Second LB (too rare)

**Budget:** $10k (for database failover)
**Timeline:** 6 weeks

```

---

## TEMPLATE 7: Escalation Contact Card

**File:** `docs/escalation-contacts.txt` (print & laminate)

```
╔════════════════════════════════════════════════════════════╗
║         [SERVICE NAME] ESCALATION CONTACTS                ║
║              Keep this in your pocket. Use it.            ║
╚════════════════════════════════════════════════════════════╝

PRIMARY CONTACTS
├─ Service Owner: [Name] ......................... [Phone]
├─ Tech Lead: [Name] ............................ [Phone]
├─ Manager: [Name] ............................. [Phone]
└─ On-Call: [Pagerduty link]

DEPENDENT TEAMS
├─ OrderService owner: [Name] .................. [Phone]
├─ BillingService owner: [Name] ............... [Phone]
├─ Database team: [Name/Team] ................. [Phone]
└─ SRE: [Team name] ........................... [Slack]

EXTERNAL PROVIDERS
├─ Stripe support: stripe.com/support
├─ AWS support: [AWS account ID] (Enterprise)
└─ Datadog support: support.datadoghq.com

ESCALATION LADDER
├─ Alert triggered: Check runbook (docs/runbooks/)
├─ Issue > 2 min: Page Tech Lead
├─ Issue > 15 min: Page Manager
├─ Issue > 60 min: Page Director
└─ Customer impact > $10k: Page VP

QUICK LINKS
├─ Runbook: https://wiki.company.com/service/runbook
├─ Logs: https://app.datadoghq.com/... (Datadog)
├─ Status: https://status.company.com/
└─ Post-Mortem: https://wiki.company.com/incidents/
```

---

## How to Use These Templates

1. **Copy** the relevant template
2. **Populate** with your service's specific details
3. **Review** with your team (get their feedback)
4. **Store** in your wiki (not in someone's email)
5. **Test** by walking through a fake incident
6. **Update** quarterly

---

## Validation Checklist

Before you deploy these to your service:

- [ ] Runbook has all commands tested and working
- [ ] Dependency map is accurate (no missing services)
- [ ] Escalation contacts are correct phone numbers (test them)
- [ ] SPOF inventory matches reality (walk through your infra)
- [ ] Detection queries run without errors
- [ ] Recovery checklist is realistic (< 1 hour to validate)

---

*← [Appendix A: Crisis Reference Cards](/book/reliability-survival-guide/appendix-a-crisis-reference-cards) | [Appendix C: Field Playbooks →](/book/reliability-survival-guide/appendix-c-field-playbooks)*
