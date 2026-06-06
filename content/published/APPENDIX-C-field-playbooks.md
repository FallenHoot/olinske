---
title: 'Appendix C: Field Playbooks – Scenario-Specific Response'
description: >-
  Five critical failure scenarios with step-by-step playbooks. When your system
  fails in a specific way, start here for the exact actions to take in order.
publishDate: '2026-06-06'
tags:
  - cloud-architecture
  - incident-response
  - operations
  - playbooks
status: published
copyright: © 2026 Zach Olinski. All rights reserved.
licenseUrl: 'https://olinske.com/docs/COPYRIGHT.md'
attributionRequired: true
commercialUsePermitted: false
---

# Appendix C: Field Playbooks

Five specific failure scenarios. If your system fails in one of these ways, use the corresponding playbook.

**Playbooks are meant to be executed, not read.** Read them once to understand. Keep them accessible (printed, bookmarked, in Slack).

---

## PLAYBOOK 1: Identity System Down → Recovery

**Symptom:** Users cannot log in. Every request returns 401 Unauthorized.

**Blast Radius:** All user-facing services are effectively offline.

**Time Budget:** 0-15 minutes to have a workaround.

---

### STEP 1: Confirm Identity Is Actually Down (0-1 minute)

**Action:**
```bash
# Check identity provider status page
curl https://status.entra.microsoft.com/
# OR: Check your identity provider's status dashboard

# Try to issue a token directly
curl -X POST https://identity.company.com/oauth/token \
  -d "client_id=test&grant_type=client_credentials"
```

**Outcome:**
- If provider status page says "operational" but you cannot get a token → **Continue with workaround**
- If provider status says "degraded" or "down" → **Skip to Public Communications** section
- If you got a token successfully → **Not an identity issue, investigate elsewhere**

---

### STEP 2: Activate Degraded Mode (1-3 minutes)

**Action:**

Your application should have a "degraded mode" flag. Enable it:

```bash
# Option 1: Feature flag (fastest)
curl -X POST https://flagserver.internal/flags/use_cached_tokens \
  -d "enabled=true" \
  -H "Authorization: Bearer [admin-token]"

# Option 2: Config change (if feature flag unavailable)
kubectl set env deployment/api-service \
  DEGRADED_MODE=true \
  -n production

# Option 3: Environment variable (manual)
ssh prod-api-01
export DEGRADED_MODE=true
systemctl restart api-service
```

**What degraded mode does:**
- Existing users: validated against cached token data (stale, but they can keep working)
- New users: cannot log in (but at least existing users are not disconnected)

**Duration:** Up to 2 hours (after that, tokens are too old to trust)

---

### STEP 3: Verify Users Can Continue (3-5 minutes)

**Action:**

Test that your fallback is actually working:

```bash
# Test 1: Existing user session
curl -H "Authorization: Bearer [cached-token]" \
  https://api.company.com/user/profile
# Expected: 200 OK (using cached data)

# Test 2: New login attempt
curl -X POST https://api.company.com/login \
  -d "email=test@example.com&password=secret"
# Expected: 401 Unauthorized with message:
#   "Identity provider down. Try again in 10 minutes."

# Confirm: Do NOT show a generic error.
#   Show: "We are having temporary login issues. 
#         If you are already logged in, you can continue working."
```

**Outcome:**
- Existing users working → ✓ Good
- Existing users failing → Investigate why cache is empty
- New users getting good error message → ✓ Good

---

### STEP 4: Alert Team to Root Cause Investigation (5-10 minutes)

**Action:**

While degraded mode buys you time, page the identity team:

```bash
# Alert message
pagerduty.trigger_incident(
  title="Identity provider degraded - cached tokens active",
  service="Identity Team",
  urgency="high",
  description="""
  Symptoms:
  - New logins failing
  - Existing users working (on cached tokens)
  - Degraded mode active
  
  Status:
  - User impact: ~20% (new login attempts blocked)
  - Customer impact: ~5% (login-dependent users)
  - Duration: Unknown (provider TBD)
  
  On-call: Investigate provider issue and ETA to recovery
  """,
  escalation_after=15_minutes
)

# Notify leadership
slack.notify("#leadership", """
  Identity provider is degraded. 
  - New logins are blocked
  - Existing sessions continue to work (cached)
  - Estimated impact: < 5% of active users
  - Identity team investigating
  - Will update every 5 minutes
  """)
```

---

### STEP 5: Monitor Degraded Mode (10-15 minutes)

**Action:**

While identity team investigates:

```
Every 2 minutes, check:
├─ New login attempts: Still failing with good error? ✓
├─ Existing sessions: Still working? ✓
├─ Error rate: Elevated but stable? ✓
├─ Customer complaints: Increasing? ⚠
└─ Identity provider: Still down? Check status page
```

If degraded mode persists > 15 minutes:
```
├─ Notify customers: "Authentication services degraded"
├─ Advise: "Try again later" or "Contact support"
├─ Disable new features that require new authentication
└─ Escalate to VP if no ETA from identity team
```

---

### STEP 6: Recovery (When Provider Comes Back)

**Action:**

Monitor for recovery:

```bash
# Script to check provider recovery
while true; do
  if curl -s https://identity.company.com/oauth/token \
       -d "client_id=test&grant_type=client_credentials" | grep -q "access_token"; then
    echo "Provider recovered at $(date)"
    break
  fi
  sleep 5
done

# When provider responds:
# 1. Refresh application token
curl -X POST https://flagserver.internal/flags/use_cached_tokens \
  -d "enabled=false"

# 2. Verify new logins work
curl -X POST https://api.company.com/login \
  -d "email=test@example.com&password=secret"
# Expected: 200 OK with new token

# 3. Monitor error rate for 5 minutes
# Expected: Error rate returns to baseline

# 4. Declare: "Identity recovered, normal operation resumed"
```

---

**Key Takeaway:** With degraded mode, an identity provider outage does not have to be a complete outage. Existing users keep working. New login attempts are blocked gracefully. This buys the identity team time to fix the root cause.

---

## PLAYBOOK 2: Database Replication Lag → Recovery

**Symptom:** Read queries are returning stale data. Searches do not find recent records.

**Blast Radius:** Reads are stale (writes may cause confusion).

**Time Budget:** 0-10 minutes to stop the lag.

---

### STEP 1: Confirm Replication Lag (0-1 minute)

**Action:**

```sql
-- Check lag on each replica
ssh prod-db-replica-01
SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp()))
  AS replication_lag_seconds;

-- Expected: < 1 second normally
-- Problem: > 5 seconds
```

**Outcome:**
- Lag > 5 seconds → **Continue with recovery**
- Lag < 1 second → **Not a replication issue, investigate elsewhere**

---

### STEP 2: Find the Blockage (1-3 minutes)

**Action:**

On the replica, identify what is stuck:

```sql
-- What query is blocking replication?
SELECT pid, usename, query_start, state, query
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start ASC;

-- Look for: Queries running > 30 seconds

-- What are the long-running transactions?
SELECT pid, usename, xact_start, query_start, query
FROM pg_stat_activity
WHERE xact_start < now() - interval '5 minutes'
ORDER BY xact_start ASC;

-- Note: On replica, long-running queries block replication replay
```

---

### STEP 3: Kill the Blockage (3-5 minutes)

**Action:**

If you found a long-running query, kill it:

```sql
-- On replica
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE query_start < now() - interval '10 minutes'
  AND pid != pg_backend_pid();

-- Verify it killed the query
SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp()))
  AS replication_lag_seconds;

-- Check lag again (should drop to < 1 second)
```

---

### STEP 4: If Killing Queries Doesn't Work (5-8 minutes)

**Action:**

If replication is still lagged after killing queries, restart the replica:

```bash
# Graceful restart (replica keeps replaying, then restarts)
ssh prod-db-replica-01
systemctl restart postgresql

# Wait for service to come up (30-60 seconds)
systemctl status postgresql

# Verify replication recovered
sudo -u postgres psql -c "SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())) AS lag;"

# If lag is now normal, done. If still high, escalate to DB team.
```

---

### STEP 5: Prevent Future Lag (8-10 minutes)

**Action:**

Add permanent monitoring:

```python
# Add to monitoring system
@periodic_task(run_every=crontab(minute='*/5'))
def monitor_replication_lag():
    for replica in REPLICAS:
        lag_seconds = check_replication_lag(replica)
        
        if lag_seconds > 5:
            alert(f"Replication lag on {replica}: {lag_seconds}s")
            
            # Also: kill long-running queries automatically
            kill_queries_older_than_minutes(replica, minutes=10)

# Set alerting threshold
monitoring.set_alert(
    name="database_replication_lag",
    condition="lag > 5 seconds",
    severity="high"
)
```

---

**Key Takeaway:** Replication lag is usually caused by a long-running query blocking replay. Kill it. If that fails, restart the replica. Add permanent monitoring to catch it early next time.

---

## PLAYBOOK 3: Cascade Failure → Isolation & Recovery

**Symptom:** One service failed. Now everything is failing because it depends on that one service.

**Blast Radius:** Multiple services, compounding failures.

**Time Budget:** 0-20 minutes to restore.

---

### STEP 1: Identify the Lowest-Level Failure (0-2 minutes)

**Action:**

Do not fix from the top. Fix from the bottom up.

```
Current state:
├─ API Service: 50% error rate
├─ Order Service: 100% error rate (depends on API)
├─ Billing Service: 100% error rate (depends on Order)
└─ Notification Service: 100% error rate (depends on Order)

What failed FIRST?
└─ API Service (the root cause)

Action: Fix API Service. Everything else will recover.
```

**Question:** How do you know which failed first?

```bash
# Check logs and error timestamps
stern api-service -n production | head -100 | grep ERROR
# Look for: Earliest timestamp = what failed first

# Check deployment timeline
kubectl rollout history deployment/api-service
kubectl rollout history deployment/order-service
# Look for: Which service deployed most recently?
```

---

### STEP 2: Isolate the Failing Service (2-5 minutes)

**Action:**

Stop it from cascading. Remove the failing service from traffic:

```bash
# Option 1: Remove from load balancer
kubectl scale deployment api-service --replicas=0 -n production

# Option 2: Feature flag (if available)
curl -X POST https://flagserver.internal/flags/use_api_service \
  -d "enabled=false"

# Option 3: Traffic routing (if you have service mesh)
kubectl patch virtualservice api-service --type merge \
  -p '{"spec":{"hosts":[{"name":"api","weight":0}]}}'
```

**What this does:**
- Requests to API Service now fail (or are routed elsewhere)
- But API Service is not running, so it is not cascading errors
- Order Service still fails (API is not available), but it stops doing wasteful retries

---

### STEP 3: Fix the Root Cause (5-15 minutes)

**Action:**

Now fix the actual problem (depends on what happened):

**If deployment broke it:**
```bash
kubectl rollout undo deployment/api-service -n production
# Wait 2 minutes for rollback to complete
kubectl rollout status deployment/api-service -n production
```

**If database is broken:**
```bash
# Restart database
systemctl restart postgresql
# Wait 1 minute
# Verify health
psql -h localhost -c "SELECT 1;"
```

**If memory leak:**
```bash
# Restart pods
kubectl delete pod -l app=api-service -n production
# Kubernetes will respawn them
```

---

### STEP 4: Gradually Bring Service Back (15-18 minutes)

**Action:**

Do not restore all traffic at once. Bring it back gradually:

```bash
# Step 1: Restore API Service with 1 replica (no traffic)
kubectl scale deployment api-service --replicas=1 -n production
# Wait 1 minute for pod to be ready

# Step 2: Health check
curl http://api-service:8000/health
# Expected: 200 OK

# Step 3: Route 10% traffic
kubectl patch virtualservice api-service --type merge \
  -p '{"spec":{"hosts":[{"name":"api","weight":10}]}}'
# Wait 2 minutes, monitor error rate

# Step 4: Route 50% traffic
kubectl patch virtualservice api-service --type merge \
  -p '{"spec":{"hosts":[{"name":"api","weight":50}]}}'
# Wait 2 minutes

# Step 5: Route 100% traffic
kubectl scale deployment api-service --replicas=5 -n production
```

**Monitor during restore:**
```
Every 30 seconds:
├─ API Service error rate: Is it climbing?
├─ Order Service error rate: Did it improve?
├─ Latency: Normal?
└─ If anything looks bad, STOP and rollback
```

---

### STEP 5: Verify Cascade Is Broken (18-20 minutes)

**Action:**

Confirm the cascade has stopped:

```bash
# Check each service's health
for svc in api-service order-service billing-service notification-service; do
  echo "=== $svc ==="
  kubectl get deployment $svc -n production -o wide
  kubectl top pod -l app=$svc -n production | head -5
done

# All should show:
# - READY: 5/5 (or similar)
# - CPU: normal
# - Memory: normal
# - Error rate: < 0.1%
```

---

**Key Takeaway:** In cascade failures, fix the LOWEST level (root cause), not the highest level (symptoms). Isolate it. Fix it. Bring traffic back gradually.

---

## PLAYBOOK 4: Bad Deployment → Safe Rollback

**Symptom:** We just deployed. Now error rate is 10%. Decision: Should we rollback?

**Blast Radius:** Unknown (depends on how many users are affected).

**Time Budget:** 0-5 minutes to decide, 5-15 minutes to execute.

---

### STEP 1: Confirm Deployment Caused It (0-1 minute)

**Action:**

```bash
# Check deployment timestamp
kubectl rollout history deployment/api-service -n production
# What time did the latest rollout happen?

# Check error rate graph
# Datadog: API Service dashboard > Error Rate graph
# Does error rate spike at the exact time of deployment?

# If YES: Deployment likely caused it → Continue with rollback
# If NO: Deployment probably not the issue → Investigate elsewhere
```

---

### STEP 2: Run Rollback Decision Matrix (1-3 minutes)

**Action:**

Use this matrix (from Chapter 7b):

| Deployment Age | Error Rate | Latency | Decision |
|---|---|---|---|
| 0-30 seconds | Any spike | Any spike | **Rollback immediately** |
| 30s-2min | > 3x baseline | > 5x baseline | **Rollback** (too early) |
| 2-5 minutes | > 2x baseline | > 3x baseline | **Rollback** (should know by now) |
| 5+ minutes | < 2x baseline | < 2x baseline | **Do NOT rollback** (probably settled) |

**Example:**
- Deployment 2 minutes ago
- Error rate: 8% (was 0.1%, so 80x baseline)
- Latency: p99 = 10 seconds (was 200ms, so 50x baseline)
- **Decision: ROLLBACK IMMEDIATELY**

---

### STEP 3: Check Dependencies Before Rollback (3-4 minutes)

**Action:**

Before you rollback, verify:

```sql
-- Did another service deploy AFTER us?
SELECT deployment_time, service_name
FROM deployment_history
WHERE deployment_time > (
  SELECT deployment_time FROM deployments 
  WHERE service_name = 'api-service' 
  ORDER BY deployment_time DESC LIMIT 1
)
ORDER BY deployment_time DESC;

-- If YES: Other services depend on our new code
--         Rollback will break them too
--         Don't rollback, fix forward instead

-- If NO: Safe to rollback independently
```

---

### STEP 4: Execute Rollback (4-10 minutes)

**Action:**

```bash
# Option 1: Kubernetes (if using K8s)
kubectl rollout undo deployment/api-service -n production

# Option 2: Docker (if using Docker directly)
docker pull [previous-version]
docker stop api-service
docker run -d --name api-service [previous-version]

# Option 3: Feature flag (if you have one)
curl -X POST https://flagserver.internal/flags/bad_feature \
  -d "enabled=false"

# Monitor the rollback
kubectl rollout status deployment/api-service -n production --timeout=5m

# Check error rate immediately after rollback completes
# Expected: Error rate drops to baseline within 1 minute
```

---

### STEP 5: Verify Rollback Worked (10-12 minutes)

**Action:**

```bash
# Health checks
curl http://api-service:8000/health
# Expected: 200 OK

# Check error rate
# Datadog: Should drop back to < 0.1% within 1 minute

# Check latency
# Datadog: Should return to normal (p99 < 500ms)

# Sample request
curl http://api.company.com/health
# Expected: 200 OK, fast response

# If all good:
echo "Rollback successful. Error rate normal."

# If error rate STILL high:
echo "STOP: Rollback didn't help. Something else is wrong."
# Investigate the actual root cause
```

---

### STEP 6: Post-Rollback (12-15 minutes)

**Action:**

```bash
# Alert about what went wrong
pagerduty.create_incident(
  title="Rollback executed: [reason]",
  service="api-service",
  urgency="high",
  description="Rollback successful. Schedule postmortem."
)

# Schedule postmortem
slack.notify("#incidents",
  "@team Postmortem scheduled for tomorrow 2 PM. 
   Topic: Why deployment broke. 
   Action: Improve testing.")

# Do NOT re-deploy immediately
# Fix the issue in staging first
```

---

**Key Takeaway:** Rollbacks should be fast (< 5 minutes total). If you have to think for > 2 minutes about whether to rollback, just do it. The cost of a wrong rollback is less than the cost of a failed deployment.

---

## PLAYBOOK 5: Provider Regional Outage → Failover Decision

**Symptom:** AWS us-east-1 is down. Traffic should go to us-west-2.

**Blast Radius:** All services in us-east-1 are offline.

**Time Budget:** 0-5 minutes to decide and fail over.

---

### STEP 1: Confirm Provider Outage (0-1 minute)

**Action:**

```bash
# Check provider status page
curl https://status.aws.amazon.com/
# Look for: us-east-1 = RED (degraded or down)

# Check your own services in that region
for svc in api-service order-service billing-service; do
  echo "=== $svc in us-east-1 ==="
  curl -i http://$svc.us-east-1.internal:8000/health || echo "TIMEOUT"
done

# If provider status says outage AND your services timeout:
# This is a provider outage, not your issue
```

---

### STEP 2: Check Failover Status (1-2 minutes)

**Action:**

```bash
# Is your secondary region healthy?
for svc in api-service order-service billing-service; do
  echo "=== $svc in us-west-2 ==="
  curl -i http://$svc.us-west-2.internal:8000/health
done

# Expected: All services in us-west-2 respond with 200

# If YES: Ready to failover
# If NO: us-west-2 is also having issues → escalate
```

---

### STEP 3: Failover DNS (2-4 minutes)

**Action:**

Route traffic away from us-east-1:

```bash
# Option 1: DNS failover (if using Route 53, Cloudflare, etc.)
# Change DNS to point to us-west-2
curl -X PATCH https://api.route53.aws.amazon.com/2013-04-01/hostedzone/Z123ABC/rrset \
  -d '{
    "Name": "api.company.com",
    "Type": "A",
    "TTL": 60,
    "ResourceRecords": [{"Value": "[us-west-2-IP]"}]
  }'

# Option 2: Load balancer failover
# Redirect traffic through backup load balancer
curl -X POST https://loadbalancer.internal/failover \
  -d "target_region=us-west-2"

# Option 3: Traffic routing (if using service mesh)
kubectl patch virtualservice api --type merge \
  -p '{"spec":{"hosts":[{"name":"api-us-east","weight":0},{"name":"api-us-west","weight":100}]}}'

# Wait 2-5 minutes for DNS propagation (if using DNS)
```

---

### STEP 4: Verify Failover (4-5 minutes)

**Action:**

```bash
# Test traffic is going to us-west-2
curl -i https://api.company.com/health
# Response should come from us-west-2

# Check error rate
# Datadog: Should be normal (< 0.1% errors)

# Check latency
# Datadog: May be slightly higher (cross-region), but acceptable

# Test a full transaction
curl -X POST https://api.company.com/checkout \
  -d "order_id=test-123&amount=99.99"
# Expected: 200 OK, order created

# If all good:
echo "Failover successful. Traffic now in us-west-2."
```

---

### STEP 5: Notify Customers (5-10 minutes)

**Action:**

```bash
# Update status page
slack.notify("#status-page",
  "AWS us-east-1 is experiencing regional outage. 
  We have failed over to us-west-2. Service is operational. 
  Latency may be slightly elevated. ETA for us-east-1 recovery: TBD")

# Notify team
slack.notify("#incidents",
  "Failover to us-west-2 complete. All services operational. 
  Monitoring for us-east-1 recovery. Will failback when provider confirms recovery.")
```

---

### STEP 6: Monitoring & Recovery (Ongoing)

**Action:**

While waiting for provider to recover:

```bash
# Every 5 minutes, check if us-east-1 is recovering
while true; do
  if curl -i http://api-service.us-east-1.internal:8000/health | grep -q "200"; then
    echo "us-east-1 is recovering at $(date)"
    
    # Gradual failback (do not all at once)
    # 1. Route 25% to us-east-1
    # 2. Wait 5 minutes
    # 3. Route 50% to us-east-1
    # 4. Wait 5 minutes
    # 5. Route 100% to us-east-1
    
    break
  fi
  sleep 300  # 5 minutes
done
```

---

**Key Takeaway:** Regional outages are outside your control. Have a failover ready. Fail over fast. Notify customers. Monitor recovery. Fail back gradually.

---

## Using These Playbooks

1. **Print them.** Put copies in war room, on-call binders, desk drawers.
2. **Practice them.** Run a fake incident using these playbooks during a gameday.
3. **Test them.** Make sure all the commands actually work in your environment.
4. **Update them.** After each real incident, update the playbooks with what actually happened.
5. **Share them.** Every engineer should know these playbooks exist.

---

*← [Appendix B: Operational Artifacts](/posts/APPENDIX-B-operational-artifacts)*
