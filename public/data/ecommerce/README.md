# Portfolio chart sources

Aggregate snapshots copied on 6 October 2026 from the local checkout of
https://github.com/MMS-21/ecommerce-clv-churn.

- `segment-summary.csv`: `reports/segment_summary.csv`. Full historical RFM
  base: 5,720 named customers. Shares refer to customers and historical revenue,
  not predicted CLV. Returns excluded rather than netted; guest baskets excluded.
- `model-comparison.csv`: `reports/model_comparison_temporal.csv`. Corrected
  evaluation on a 4,311-customer cohort with a stratified 30% customer test split.
  Features use pre-cutoff transactions; label is no purchase during the following
  365 days. Scores are single-split point estimates, not campaign outcomes.

These two populations differ and must not be combined. The old leaked model
scores are excluded. No individual customer records are included here.

Rebuild the SVGs with `node tools/render-ecommerce-visuals.mjs` from the site root.
