---
title: 'Glossary: Reliability Terms and Definitions'
description: >-
  Quick reference for technical terms used throughout the Reliability Survival
  Guide. Look up unfamiliar words here.
publishDate: '2026-06-06'
tags:
  - cloud-architecture
  - reliability
  - reference
status: published
---

# Glossary: Reliability Terms

**All the jargon explained in plain English.**

---

## A

**Availability**
How often your system is up and working. Measured as a percentage over time.
- Example: "99.9% availability" means your system should be working 99.9% of the time, down for about 43 minutes per month.
- Related: SLA, uptime

**ADR** (Architecture Decision Record)
A written note explaining a technical decision: what you decided, why you decided it, and what you considered. Used to prevent the same decision from being re-debated repeatedly.

---

## B

**Backup**
A copy of your data stored separately so you can restore it if the original is lost or damaged.
- Cold backup: Not actively used, takes time to restore
- Hot backup: Ready to use immediately
- Related: RPO, disaster recovery

**BCDR** (Business Continuity and Disaster Recovery)
The plan for keeping your business running if something goes wrong. Includes backups, failover procedures, and recovery procedures.

**Baseline**
Your normal state. What things look like when nothing is broken. Used to spot when something is wrong.
- Example: "Your database normally processes 1,000 requests per second. If it drops to 500, that is a baseline violation and signals a problem."

---

## C

**Cascade** (or cascading failure)
When one service breaks and causes other services to break as a result, then more services break as a chain reaction.
- Example: "Payment service went down. Then Order service went down because it could not process payments. Then Billing service went down because it could not update billing."
- Related: dependency, downtime

**CDN** (Content Delivery Network)
A service that copies your content to multiple locations around the world so users can download from the closest location (faster).

**Certificate** (or SSL/TLS certificate)
A digital document that proves your website is who it claims to be. Expires and must be renewed. If it expires, browsers will refuse to connect.
- Related: expiration, renewal

**Circuit breaker**
A safeguard that stops requests being sent to a broken service temporarily, preventing your system from trying over and over again and making the problem worse.
- Works like an electrical circuit breaker: if something is wrong, flip it off instead of burning things out

**Cluster**
A group of servers working together. If one fails, the others keep working.
- Example: A Kubernetes cluster = multiple servers running containers together

**Cold start**
The delay when a service is not running and needs to start up from nothing. Cold starts are slower than resuming a running service.
- Related: warm start, scaling

**Connection pool**
A group of database connections sitting ready to use, instead of creating a new connection every time. Makes things faster.
- When the pool is full (all connections in use), new requests have to wait

**Control plane**
The part of a system that manages other parts (like the brain). Makes decisions about what should run where.
- Related: data plane

---

## D

**Dashboard**
A visual display showing current system status (graphs, numbers, color-coded indicators). Used to spot problems quickly.

**Data corruption**
When your data gets changed incorrectly and you do not realize it is wrong.
- Example: Order quantity shows as 0 instead of 100, but the system looks fine (silent failure)
- Related: silent failure, data integrity

**Data integrity**
The trustworthiness of your data. If your data is consistent and correct, you have data integrity.

**Data plane**
The part of a system that actually does the work (serving requests, processing data). Not the management layer.
- Related: control plane

**Degraded mode**
When a system is not fully working but is still running at reduced capacity instead of completely failing.
- Example: "Identity service is down, so we switched to cached tokens and manually approved logins (degraded mode)"
- Related: failover

**Dependency**
Another service or system your system depends on to work.
- Example: "Our payment service depends on Stripe API. If Stripe is down, we are down."
- Related: cascade

**Deployment**
Releasing new code or configuration to production (putting it live).
- Blue-green deployment: Two identical environments, flip traffic between them
- Canary deployment: Send new code to 1% of users, then 10%, then 100% (test gradually)
- Rolling deployment: Replace servers one at a time
- Related: rollback, change

**Disaster recovery**
The process of getting your system back up after something catastrophic fails.
- Related: BCDR, backup, RTO

**DNS** (Domain Name System)
The system that converts domain names (example.com) to IP addresses (185.192.1.1). If DNS is broken, browsers cannot find your website.

---

## E

**Error budget**
The amount of downtime you are allowed before missing your SLA.
- Example: If your SLA is 99.9% uptime, your error budget is ~43 minutes per month
- Related: SLA, downtime

**Escalation**
Calling in senior people when a problem is too big or urgent for on-call to handle alone.
- Example: After 15 minutes with no progress, escalate to the tech lead

---

## F

**Failover**
Switching traffic to a backup system when the primary system breaks.
- Example: "Primary database is down, failover to replica"
- Related: backup, BCDR, disaster recovery

**Fallback**
A simpler or reduced version of a system that you use when the full system breaks.
- Example: "Identity provider is down, fallback to cached tokens for 2 hours"
- Related: degraded mode

**Federation** (or federated identity)
Using credentials from one system in another system.
- Example: Sign in with Google, then use that to log into Slack
- Federation drift: When the systems get out of sync and stop trusting each other

**Firewall**
A security device that controls which traffic is allowed to enter or leave your network.

**Flow**
The movement of data through your system. If traffic is not flowing, data is getting stuck.

---

## G

**Graceful degradation**
When a system can keep working (partially) even when something breaks, instead of failing completely.
- Example: "If cache is down, read from database instead (slower but works)"

---

## H

**Health check**
A test that verifies a service is working. Runs frequently to catch failures early.
- Example: "Ping the API every 10 seconds, if no response, mark it as down"
- Related: monitoring, alerting

**Heartbeat**
A regular signal from a service saying "I am alive." If heartbeats stop, the service is assumed dead.
- Related: health check

---

## I

**IC** (Incident Commander)
The person in charge during an outage. Makes decisions about what to do (rollback, failover, etc.).
- Related: incident response

**Identity provider** (or auth provider)
A system that handles logins and creates tokens/credentials for users.
- Examples: Okta, Azure AD, Auth0
- If this is down, users cannot log in to anything that depends on it

**Idempotent**
An action that gives the same result no matter how many times you do it.
- Example: "Set color to red" is idempotent (doing it twice = same result)
- Example: "Add 1" is NOT idempotent (doing it twice adds 2)
- Related: retries

**Incident**
An event where your system is not working as expected. Ranges from small glitches to complete outages.

**Incident response**
The procedure for handling an incident: triage, decide on action, execute, validate recovery.

**Latency**
How long something takes. Usually measured in milliseconds.
- Example: "Database query latency is 50ms" = queries take 50 milliseconds
- Related: performance, throughput

---

## K

**Kubernetes** (K8s)
A system for automatically managing containers and servers at scale.

---

## L

**LB** (Load balancer)
A device that splits traffic across multiple servers so no single server gets overwhelmed.

**Logs**
Records of what your system did: who accessed it, what errors occurred, etc. Used for debugging.

---

## M

**Metric**
A number you track to understand system health. Examples: uptime, error rate, latency.
- Related: SLO, monitoring

**Mitigation**
A temporary fix that stops the bleeding without fixing the root cause.
- Example: "Mitigation: Route traffic away from the broken server. Root cause fix: Deploy a new version of the code."

**Monitoring**
Continuously watching metrics and logs to catch problems early.
- Related: alerting, observability

---

## O

**OODA loop**
Observe → Orient → Decide → Act. A decision-making framework. The team that cycles through this loop fastest wins.

**Observability**
Your ability to see what your system is doing. Built from metrics, logs, and traces.
- Related: monitoring, visibility

**Outage**
When a service is completely down or unavailable.
- Related: incident, downtime

---

## P

**Partial failure**
When part of your system works and part does not. More common and more dangerous than complete failures.
- Example: "East Coast servers work, West Coast servers do not"

**Patch**
A small update that fixes a specific problem, usually a security fix or bug.

**Postmortem**
A meeting after an incident to understand what happened, why, and how to prevent it next time.
- Related: incident response, lessons learned

**Provider** (or cloud provider)
The company hosting your infrastructure (AWS, Azure, Google Cloud, etc.).
- Related: SLA, outage

**Provisioning**
Setting up new servers, databases, or resources and making them ready to use.

---

## Q

**Queue** (or message queue)
A system for storing messages in order until another system processes them.
- Example: "Enqueue 10,000 orders to process, then process them one by one"
- Related: throughput, scaling

---

## R

**Redundancy**
Having backups or duplicates so if one fails, the other keeps working.
- Example: "Primary database + replica = redundancy"

**Replication** (or data replication)
Copying data from one place to another in real-time or near-real-time so you have a backup.
- Replication lag: The delay between primary and replica (if it is 1 second behind, lag = 1 second)

**Resilience**
The ability to keep working or recover quickly when something breaks.

**RTO** (Recovery Time Objective)
How fast you need to recover. The maximum downtime you can tolerate.
- Example: "RTO = 1 hour" means you must be back up within 1 hour

**RPO** (Recovery Point Objective)
How much data loss you can tolerate. If your backup is 1 day old and you lose the last day of data, RPO = 1 day.
- Example: "RPO = 1 hour" means you can afford to lose up to 1 hour of data

**Rollback**
Reverting to a previous version (undoing a deployment or change).
- Example: "New code broke production, rollback to the previous version"

**Runbook**
Written procedures for handling specific problems. Step-by-step instructions for when things break.

---

## S

**SLA** (Service Level Agreement)
A promise to customers about uptime/availability (e.g., "99.9% uptime").
- Related: SLO, error budget

**SLO** (Service Level Objective)
An internal target for reliability (usually matches the SLA but may be stricter).

**SPOF** (Single Point of Failure)
One thing that, if it breaks, breaks everything downstream.
- Example: "We only have one database server = SPOF"
- Related: redundancy, resilience

**Scaling** (or auto-scaling)
Adding more servers when demand increases, removing them when demand decreases.
- Horizontal scaling: Add more servers
- Vertical scaling: Make each server more powerful
- Related: load balancer, throughput

**Schema**
The structure of a database: what tables exist, what columns they have, what data types.
- Schema migration: Changing the structure (adding a column, renaming a table, etc.)

**Shard** (or sharding)
Splitting data across multiple databases or servers by a key (e.g., split users by region).
- Related: scaling, load balancer

**Silent failure**
When a system fails but looks like it is working (returns 200 OK with corrupted data).
- Example: "Cache returns stale data silently, you do not know it is wrong"
- Related: data corruption, monitoring

**Spike**
A sudden, temporary increase in traffic or load.
- Example: "Error rate spiked to 50% for 2 minutes, then returned to normal"

**Staging**
A test environment that mirrors production but is not used by real customers. Used for testing before deploying.
- Related: production, deployment

**Status page**
A public page showing whether services are up or down and any ongoing incidents.

---

## T

**Telemetry**
Data collected about your system's behavior: metrics, logs, traces.

**Throughput**
How much work a system can do per unit time.
- Example: "Database throughput = 10,000 queries per second"
- Related: latency, capacity

**Throttling**
Intentionally slowing down or rejecting requests when a resource is overloaded.
- Example: "API rate limit: 100 requests per second, throttle the rest"

**Tier** (or tier numbering)
A ranking of how critical something is.
- Tier 1 (critical): If down, customers cannot use the service
- Tier 2 (important): If down, customers experience degradation
- Tier 3 (nice-to-have): If down, only internal processes affected
- Related: criticality, SLA

**Timeout**
A set time limit for an action. If it takes longer, stop trying.
- Example: "Request timeout = 5 seconds, stop trying after 5 seconds"

**Token** (or auth token)
A digital credential proving you are logged in. Short-lived (expires).
- Token refresh: Getting a new token before the old one expires

**Trace** (or distributed trace)
A log of a single request as it moves through all the services in your system.
- Related: logging, observability

---

## U

**Uptime**
How long a system is up and working. Opposite of downtime.
- Related: availability, SLA

---

## V

**Visibility**
Being able to see what your system is doing. If you have no visibility, you cannot debug problems.
- Related: observability, monitoring

---

## W

**War room**
A room (or virtual space) where the incident response team gathers during a crisis to make decisions and coordinate.

**Webhook**
A way for one system to automatically notify another when something happens.
- Example: "When a payment completes, webhook to our billing system to update the invoice"

---

## Z

**Zone** (or availability zone)
A separate data center in a region. If one zone fails, the other zones keep working.
- Example: "AWS us-east-1 has 3 zones: us-east-1a, 1b, 1c"
- Related: region, redundancy

---

## Looking for a term?

**Not in this glossary?** Check your chapter for a definition in parentheses or brackets. Many terms are explained on first use.

If you find a term that should be here, let us know.

---

*← [Back to Table of Contents](/book/reliability-survival-guide/000000-table-of-contents)*
