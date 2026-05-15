export const vmLookupMeta = {
  generatedUtc: '2026-05-15 14:11:55 UTC',
  totalUniqueSkus: 553,
  regions: [
    { code: 'norwayeast', label: 'Norway East', skuCount: 420, zones: '1, 2, 3', launchDate: 'GA' },
    { code: 'norwaywest', label: 'Norway West', skuCount: 234, zones: 'Non-zonal', launchDate: 'GA' },
    { code: 'swedencentral', label: 'Sweden Central', skuCount: 496, zones: '1, 2, 3', launchDate: 'GA' },
    { code: 'swedensouth', label: 'Sweden South', skuCount: 226, zones: 'Non-zonal', launchDate: 'GA' },
    { code: 'denmarkeast', label: 'Denmark East', skuCount: 165, zones: '1, 2, 3', launchDate: 'Jan 2026' },
  ],
  notes: {
    source: 'Azure Retail Prices API',
    scope: 'v6 and v7 SKUs only',
  },
} as const;
