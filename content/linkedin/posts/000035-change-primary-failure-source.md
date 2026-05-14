---
title: "Chapter 7d: Change – The Failure You Deploy Yourself"
publishDate: 2026-07-07
tags:
  - cloud-architecture
  - reliability
  - change-management
type: blog-linkedin-share
linkedinPostId: "pending"
variant: medium
sourcePost: "content/posts/000035-change-primary-failure-source.md"
canonicalUrl: "https://zach.olinski.com/posts/000035-change-primary-failure-source"
hashtags:
  - Deployment
  - Reliability
---

60–80% of production outages are caused by change.

Not hardware failures. Not cloud provider incidents.

Change: deployments, configuration updates, migrations, upgrades.

Yet most teams treat deployment like a checkbox instead of a failure domain.

Six ways change creates failure:
1. Untested code paths that work in staging but break under production load
2. Configuration drift where manual updates create hidden state
3. Rollbacks that fail partway and leave systems in partially-broken states
4. API coupling where Service B breaks when Service A deploys first
5. Data migrations with no safe path (old code with new data, or vice versa)
6. Dependency cascades where upgrading one library breaks interactions elsewhere

The uncomfortable part: Most teams optimize for deployment frequency, not deployment safety.

Deploy 50 times a day. Have one incident a day. Call it "high velocity."

The teams that deploy frequently AND safely? They treat deployment as something you engineer for, not hope through.

What is your deployment safety strategy?
