# Framework Pack: Cost-Aware Alerting

## Alert ROI Model
```
Alert ROI = (Incident cost prevented) - (Alert query cost + False positive cost)

Alert should be triggered only if ROI > 0
```

## Example Calculation
- Critical outage cost: $50,000/hour
- Alert detects 1 outage per quarter (30min faster resolution)
- Alert query cost: $50/month ($600/year)
- False positives: 2/month × $200 = $400/month ($4,800/year)
- **ROI: $50,000 × 0.5hr ÷ 4 quarters - $5,400/year = $1,100 profit**
- ✅ Alert is justified

## Checklist This Week
1. Calculate cost of your top 5 false positive alerts
2. Tune thresholds to reduce false positives
3. Measure alert effectiveness (does it prevent incidents?)
4. Do alert ROI analysis on top 10 alerts
