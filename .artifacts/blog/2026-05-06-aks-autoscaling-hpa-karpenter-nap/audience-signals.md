# Audience Signals: AKS Autoscaling - HPA vs Karpenter vs NAP
## Audience Problem
Teams choose AKS autoscaling strategy ad-hoc. HPA (Horizontal Pod Autoscaling) seems simplest, but doesn't handle node scarcity. Karpenter provides better capacity planning but requires new tooling. NAP (Node Autoprovisioner) is newer and less familiar. Teams often overprovision nodes (wasting money) or underprovision (accepting failed pod scheduling).
## Audience Alignment
- Platform engineers managing Kubernetes
- DevOps teams optimizing cluster costs
- CTO offices evaluating infrastructure decisions
