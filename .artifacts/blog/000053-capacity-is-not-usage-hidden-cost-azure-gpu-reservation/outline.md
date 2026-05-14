# Outline: Capacity Is Not Usage

## Hook

Open with the decision tension: the deployment risk was solved, but the cost model changed from elastic usage to continuous capacity spend.

## Sections

1. Start with the Azure terms.
   - Separate quota, capacity, Capacity Reservation, Reserved Instances, and Savings Plan.

2. Billing follows capacity, not activity.
   - Explain that Azure bills at the underlying VM rate whether the VM is provisioned or not.

3. Concrete NVads A10 v5 planning example.
   - Show the 2,000 vCore example split across 72 and 36 vCPU shapes and the resulting 42 VMs.
   - Include an explicit assumption-marked monthly planning range of about EUR 123k to EUR 204k.

4. The business-hours trap.
   - Show why office-hour workloads still create a 24x7 reservation bill.

5. Scale-down is not a reversible assumption.
   - Use documented lifecycle and capacity-request semantics to explain reacquisition risk.

6. Discounts help price, not utilization.
   - Explain how Reserved Instances and Savings Plan can lower the rate on used and unused reservation usage without fixing low utilization.

7. When Capacity Reservation is the right choice.
   - Add the balancing case for stable, critical workloads.

8. Practical checklist and executive takeaway.
   - End with a decision checklist and the core line: capacity is not usage.