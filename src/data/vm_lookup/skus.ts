export interface VmSkuRow {
  sku: string;
  family: string;
  vendor: 'AMD' | 'Intel';
  generation: 'v6' | 'v7';
  vcpu: number;
  memoryGiB: number;
  pricePerHourUsd?: number;
  windowsPerHourUsd?: number;
  regions: Array<'norwayeast' | 'norwaywest' | 'swedencentral' | 'swedensouth' | 'denmarkeast'>;
  zonalRegions: Array<'norwayeast' | 'swedencentral' | 'denmarkeast'>;
}

export const vmSkus: VmSkuRow[] = [
  { sku: 'Standard_D2as_v6', family: 'Dasv6', vendor: 'AMD', generation: 'v6', vcpu: 2, memoryGiB: 8, pricePerHourUsd: 0.1100, windowsPerHourUsd: 0.2020, regions: ['norwayeast', 'norwaywest', 'swedencentral', 'swedensouth', 'denmarkeast'], zonalRegions: ['norwayeast', 'swedencentral', 'denmarkeast'] },
  { sku: 'Standard_D2s_v6', family: 'Dsv6', vendor: 'Intel', generation: 'v6', vcpu: 2, memoryGiB: 8, pricePerHourUsd: 0.1210, windowsPerHourUsd: 0.2130, regions: ['norwayeast', 'norwaywest', 'swedencentral', 'swedensouth', 'denmarkeast'], zonalRegions: ['norwayeast', 'swedencentral', 'denmarkeast'] },
  { sku: 'Standard_D4as_v6', family: 'Dasv6', vendor: 'AMD', generation: 'v6', vcpu: 4, memoryGiB: 16, pricePerHourUsd: 0.2200, windowsPerHourUsd: 0.4040, regions: ['norwayeast', 'norwaywest', 'swedencentral', 'swedensouth', 'denmarkeast'], zonalRegions: ['norwayeast', 'swedencentral', 'denmarkeast'] },
  { sku: 'Standard_D4s_v6', family: 'Dsv6', vendor: 'Intel', generation: 'v6', vcpu: 4, memoryGiB: 16, pricePerHourUsd: 0.2420, windowsPerHourUsd: 0.4260, regions: ['norwayeast', 'norwaywest', 'swedencentral', 'swedensouth', 'denmarkeast'], zonalRegions: ['norwayeast', 'swedencentral', 'denmarkeast'] },
  { sku: 'Standard_D8as_v6', family: 'Dasv6', vendor: 'AMD', generation: 'v6', vcpu: 8, memoryGiB: 32, pricePerHourUsd: 0.5190, windowsPerHourUsd: 0.8870, regions: ['norwayeast', 'swedensouth', 'denmarkeast'], zonalRegions: ['norwayeast', 'denmarkeast'] },
  { sku: 'Standard_D8s_v6', family: 'Dsv6', vendor: 'Intel', generation: 'v6', vcpu: 8, memoryGiB: 32, pricePerHourUsd: 0.5770, windowsPerHourUsd: 0.9450, regions: ['norwayeast', 'norwaywest', 'swedencentral', 'swedensouth', 'denmarkeast'], zonalRegions: ['norwayeast', 'swedencentral', 'denmarkeast'] },
  { sku: 'Standard_D16ads_v6', family: 'Dadsv6', vendor: 'AMD', generation: 'v6', vcpu: 16, memoryGiB: 64, pricePerHourUsd: 1.3060, windowsPerHourUsd: 2.0420, regions: ['norwayeast', 'norwaywest', 'swedencentral', 'swedensouth', 'denmarkeast'], zonalRegions: ['norwayeast', 'swedencentral', 'denmarkeast'] },
  { sku: 'Standard_D16s_v6', family: 'Dsv6', vendor: 'Intel', generation: 'v6', vcpu: 16, memoryGiB: 64, pricePerHourUsd: 1.1530, windowsPerHourUsd: 1.8890, regions: ['norwayeast', 'norwaywest', 'swedencentral', 'swedensouth', 'denmarkeast'], zonalRegions: ['norwayeast', 'swedencentral', 'denmarkeast'] },
  { sku: 'Standard_D32ads_v6', family: 'Dadsv6', vendor: 'AMD', generation: 'v6', vcpu: 32, memoryGiB: 128, pricePerHourUsd: 1.9520, windowsPerHourUsd: 3.4240, regions: ['norwayeast', 'swedencentral', 'swedensouth', 'denmarkeast'], zonalRegions: ['norwayeast', 'swedencentral', 'denmarkeast'] },
  { sku: 'Standard_D32s_v6', family: 'Dsv6', vendor: 'Intel', generation: 'v6', vcpu: 32, memoryGiB: 128, pricePerHourUsd: 2.7630, windowsPerHourUsd: 4.2350, regions: ['norwaywest', 'swedensouth', 'denmarkeast'], zonalRegions: ['denmarkeast'] },
  { sku: 'Standard_D64as_v6', family: 'Dasv6', vendor: 'AMD', generation: 'v6', vcpu: 64, memoryGiB: 256, pricePerHourUsd: 4.1540, windowsPerHourUsd: 7.0980, regions: ['norwayeast', 'norwaywest', 'swedencentral', 'swedensouth', 'denmarkeast'], zonalRegions: ['norwayeast', 'swedencentral', 'denmarkeast'] },
  { sku: 'Standard_D64s_v6', family: 'Dsv6', vendor: 'Intel', generation: 'v6', vcpu: 64, memoryGiB: 256, pricePerHourUsd: 4.6120, windowsPerHourUsd: 7.5560, regions: ['norwayeast', 'norwaywest', 'swedencentral', 'denmarkeast'], zonalRegions: ['norwayeast', 'swedencentral', 'denmarkeast'] },
  { sku: 'Standard_D4as_v7', family: 'Dasv7', vendor: 'AMD', generation: 'v7', vcpu: 4, memoryGiB: 16, pricePerHourUsd: 0.1940, windowsPerHourUsd: 0.3780, regions: ['norwayeast', 'swedencentral'], zonalRegions: ['norwayeast', 'swedencentral'] },
  { sku: 'Standard_D4s_v7', family: 'Dsv7', vendor: 'Intel', generation: 'v7', vcpu: 4, memoryGiB: 16, pricePerHourUsd: 0.2140, windowsPerHourUsd: 0.3980, regions: ['swedencentral'], zonalRegions: ['swedencentral'] },
  { sku: 'Standard_D16ads_v7', family: 'Dadsv7', vendor: 'AMD', generation: 'v7', vcpu: 16, memoryGiB: 64, pricePerHourUsd: 0.9760, windowsPerHourUsd: 1.7120, regions: ['norwayeast', 'swedencentral'], zonalRegions: ['norwayeast', 'swedencentral'] },
  { sku: 'Standard_D16s_v7', family: 'Dsv7', vendor: 'Intel', generation: 'v7', vcpu: 16, memoryGiB: 64, pricePerHourUsd: 1.0770, windowsPerHourUsd: 1.8130, regions: ['swedencentral'], zonalRegions: ['swedencentral'] },
  { sku: 'Standard_D32ads_v7', family: 'Dadsv7', vendor: 'AMD', generation: 'v7', vcpu: 32, memoryGiB: 128, pricePerHourUsd: 1.9520, windowsPerHourUsd: 3.4240, regions: ['norwayeast', 'swedencentral'], zonalRegions: ['norwayeast', 'swedencentral'] },
  { sku: 'Standard_D32s_v7', family: 'Dsv7', vendor: 'Intel', generation: 'v7', vcpu: 32, memoryGiB: 128, pricePerHourUsd: 2.1540, windowsPerHourUsd: 3.6260, regions: ['swedencentral'], zonalRegions: ['swedencentral'] },
  { sku: 'Standard_E4as_v6', family: 'Easv6', vendor: 'AMD', generation: 'v6', vcpu: 4, memoryGiB: 32, pricePerHourUsd: 0.3410, windowsPerHourUsd: 0.5250, regions: ['norwayeast', 'norwaywest', 'swedencentral', 'swedensouth', 'denmarkeast'], zonalRegions: ['norwayeast', 'swedencentral', 'denmarkeast'] },
  { sku: 'Standard_E4s_v6', family: 'Esv6', vendor: 'Intel', generation: 'v6', vcpu: 4, memoryGiB: 32, pricePerHourUsd: 0.3780, windowsPerHourUsd: 0.5620, regions: ['norwayeast', 'swedencentral', 'swedensouth', 'denmarkeast'], zonalRegions: ['norwayeast', 'swedencentral', 'denmarkeast'] },
  { sku: 'Standard_E8as_v6', family: 'Easv6', vendor: 'AMD', generation: 'v6', vcpu: 8, memoryGiB: 64, pricePerHourUsd: 0.5760, windowsPerHourUsd: 0.9440, regions: ['norwayeast', 'norwaywest', 'swedencentral', 'swedensouth', 'denmarkeast'], zonalRegions: ['norwayeast', 'swedencentral', 'denmarkeast'] },
  { sku: 'Standard_E8s_v6', family: 'Esv6', vendor: 'Intel', generation: 'v6', vcpu: 8, memoryGiB: 64, pricePerHourUsd: 0.6400, windowsPerHourUsd: 1.0080, regions: ['norwayeast', 'norwaywest', 'swedencentral', 'swedensouth', 'denmarkeast'], zonalRegions: ['norwayeast', 'swedencentral', 'denmarkeast'] },
  { sku: 'Standard_E16as_v7', family: 'Easv7', vendor: 'AMD', generation: 'v7', vcpu: 16, memoryGiB: 128, pricePerHourUsd: 1.0210, windowsPerHourUsd: 1.7570, regions: ['norwayeast', 'swedencentral'], zonalRegions: ['norwayeast', 'swedencentral'] },
  { sku: 'Standard_E16s_v7', family: 'Esv7', vendor: 'Intel', generation: 'v7', vcpu: 16, memoryGiB: 128, pricePerHourUsd: 1.4140, windowsPerHourUsd: 2.1500, regions: ['swedencentral'], zonalRegions: ['swedencentral'] },
  { sku: 'Standard_E64as_v7', family: 'Easv7', vendor: 'AMD', generation: 'v7', vcpu: 64, memoryGiB: 512, pricePerHourUsd: 4.0830, windowsPerHourUsd: 7.0270, regions: ['norwayeast', 'swedencentral'], zonalRegions: ['norwayeast', 'swedencentral'] },
  { sku: 'Standard_E64ds_v7', family: 'Esv7', vendor: 'Intel', generation: 'v7', vcpu: 64, memoryGiB: 512, pricePerHourUsd: 6.7700, windowsPerHourUsd: 9.7140, regions: ['swedencentral'], zonalRegions: ['swedencentral'] },
  { sku: 'Standard_F4as_v6', family: 'Fasv6', vendor: 'AMD', generation: 'v6', vcpu: 4, memoryGiB: 8, pricePerHourUsd: 0.3910, windowsPerHourUsd: 0.5750, regions: ['norwayeast', 'norwaywest', 'swedencentral', 'swedensouth', 'denmarkeast'], zonalRegions: ['norwayeast', 'swedencentral', 'denmarkeast'] },
  { sku: 'Standard_F4ams_v6', family: 'Famsv6', vendor: 'Intel', generation: 'v6', vcpu: 4, memoryGiB: 8, pricePerHourUsd: 0.5120, windowsPerHourUsd: 0.6960, regions: ['norwayeast', 'norwaywest', 'swedencentral', 'swedensouth', 'denmarkeast'], zonalRegions: ['norwayeast', 'swedencentral', 'denmarkeast'] },
  { sku: 'Standard_F8as_v7', family: 'Fasv7', vendor: 'AMD', generation: 'v7', vcpu: 8, memoryGiB: 16, pricePerHourUsd: 0.5840, windowsPerHourUsd: 0.9520, regions: ['norwayeast', 'swedencentral'], zonalRegions: ['norwayeast', 'swedencentral'] },
  { sku: 'Standard_F8ams_v7', family: 'Famsv7', vendor: 'Intel', generation: 'v7', vcpu: 8, memoryGiB: 16, pricePerHourUsd: 0.7660, windowsPerHourUsd: 1.1340, regions: ['norwayeast', 'swedencentral'], zonalRegions: ['norwayeast', 'swedencentral'] },
  { sku: 'Standard_F32as_v7', family: 'Fasv7', vendor: 'AMD', generation: 'v7', vcpu: 32, memoryGiB: 64, pricePerHourUsd: 2.3360, windowsPerHourUsd: 3.8080, regions: ['norwayeast', 'swedencentral'], zonalRegions: ['norwayeast', 'swedencentral'] },
  { sku: 'Standard_F32ams_v7', family: 'Famsv7', vendor: 'Intel', generation: 'v7', vcpu: 32, memoryGiB: 64, pricePerHourUsd: 3.0620, windowsPerHourUsd: 4.5340, regions: ['norwayeast', 'swedencentral'], zonalRegions: ['norwayeast', 'swedencentral'] },
];
