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

// Generator function to create realistic pricing based on vCPU and memory
function generatePrice(vcpu: number, memoryGiB: number, vendor: 'AMD' | 'Intel', isWindows: boolean = false): number {
  const basePricePerVcpu = vendor === 'AMD' ? 0.0275 : 0.0303;
  const basePricePerGiB = 0.003;
  const windowsAdder = isWindows ? 0.084 : 0;
  return Number((vcpu * basePricePerVcpu + memoryGiB * basePricePerGiB + windowsAdder).toFixed(4));
}

// Helper to create SKU entries
function createSku(
  name: string,
  family: string,
  vendor: 'AMD' | 'Intel',
  gen: 'v6' | 'v7',
  vcpu: number,
  memGb: number,
  regions: Array<'norwayeast' | 'norwaywest' | 'swedencentral' | 'swedensouth' | 'denmarkeast'>,
  zones: Array<'norwayeast' | 'swedencentral' | 'denmarkeast'> = []
): VmSkuRow {
  return {
    sku: name,
    family,
    vendor,
    generation: gen,
    vcpu,
    memoryGiB: memGb,
    pricePerHourUsd: generatePrice(vcpu, memGb, vendor),
    windowsPerHourUsd: generatePrice(vcpu, memGb, vendor, true),
    regions,
    zonalRegions: zones,
  };
}

const allRegions = ['norwayeast', 'norwaywest', 'swedencentral', 'swedensouth', 'denmarkeast'] as const;
const zonalRegions = ['norwayeast', 'swedencentral', 'denmarkeast'] as const;

export const vmSkus: VmSkuRow[] = [
  // D-series v6
  createSku('Standard_D2as_v6', 'Dasv6', 'AMD', 'v6', 2, 8, allRegions, zonalRegions),
  createSku('Standard_D2s_v6', 'Dsv6', 'Intel', 'v6', 2, 8, allRegions, zonalRegions),
  createSku('Standard_D4as_v6', 'Dasv6', 'AMD', 'v6', 4, 16, allRegions, zonalRegions),
  createSku('Standard_D4s_v6', 'Dsv6', 'Intel', 'v6', 4, 16, allRegions, zonalRegions),
  createSku('Standard_D8as_v6', 'Dasv6', 'AMD', 'v6', 8, 32, ['norwayeast', 'swedensouth', 'denmarkeast'], ['norwayeast', 'denmarkeast']),
  createSku('Standard_D8s_v6', 'Dsv6', 'Intel', 'v6', 8, 32, allRegions, zonalRegions),
  createSku('Standard_D16ads_v6', 'Dadsv6', 'AMD', 'v6', 16, 64, allRegions, zonalRegions),
  createSku('Standard_D16s_v6', 'Dsv6', 'Intel', 'v6', 16, 64, allRegions, zonalRegions),
  createSku('Standard_D32ads_v6', 'Dadsv6', 'AMD', 'v6', 32, 128, ['norwayeast', 'swedencentral', 'swedensouth', 'denmarkeast'], ['norwayeast', 'swedencentral', 'denmarkeast']),
  createSku('Standard_D32s_v6', 'Dsv6', 'Intel', 'v6', 32, 128, ['norwaywest', 'swedensouth', 'denmarkeast'], ['denmarkeast']),
  createSku('Standard_D64as_v6', 'Dasv6', 'AMD', 'v6', 64, 256, allRegions, zonalRegions),
  createSku('Standard_D64s_v6', 'Dsv6', 'Intel', 'v6', 64, 256, ['norwayeast', 'norwaywest', 'swedencentral', 'denmarkeast'], ['norwayeast', 'swedencentral', 'denmarkeast']),
  createSku('Standard_D96ads_v6', 'Dadsv6', 'AMD', 'v6', 96, 384, ['norwayeast', 'swedencentral', 'denmarkeast'], ['norwayeast', 'swedencentral', 'denmarkeast']),

  // D-series v7
  createSku('Standard_D2as_v7', 'Dasv7', 'AMD', 'v7', 2, 8, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_D2s_v7', 'Dsv7', 'Intel', 'v7', 2, 8, ['swedencentral'], ['swedencentral']),
  createSku('Standard_D4as_v7', 'Dasv7', 'AMD', 'v7', 4, 16, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_D4s_v7', 'Dsv7', 'Intel', 'v7', 4, 16, ['swedencentral'], ['swedencentral']),
  createSku('Standard_D8as_v7', 'Dasv7', 'AMD', 'v7', 8, 32, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_D8s_v7', 'Dsv7', 'Intel', 'v7', 8, 32, ['swedencentral'], ['swedencentral']),
  createSku('Standard_D16ads_v7', 'Dadsv7', 'AMD', 'v7', 16, 64, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_D16s_v7', 'Dsv7', 'Intel', 'v7', 16, 64, ['swedencentral'], ['swedencentral']),
  createSku('Standard_D32ads_v7', 'Dadsv7', 'AMD', 'v7', 32, 128, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_D32s_v7', 'Dsv7', 'Intel', 'v7', 32, 128, ['swedencentral'], ['swedencentral']),
  createSku('Standard_D64ads_v7', 'Dadsv7', 'AMD', 'v7', 64, 256, ['norwayeast', 'swedencentral'], zonalRegions),

  // E-series v6
  createSku('Standard_E2as_v6', 'Easv6', 'AMD', 'v6', 2, 16, allRegions, zonalRegions),
  createSku('Standard_E2s_v6', 'Esv6', 'Intel', 'v6', 2, 16, allRegions, zonalRegions),
  createSku('Standard_E4as_v6', 'Easv6', 'AMD', 'v6', 4, 32, allRegions, zonalRegions),
  createSku('Standard_E4s_v6', 'Esv6', 'Intel', 'v6', 4, 32, ['norwayeast', 'swedencentral', 'swedensouth', 'denmarkeast'], ['norwayeast', 'swedencentral', 'denmarkeast']),
  createSku('Standard_E8as_v6', 'Easv6', 'AMD', 'v6', 8, 64, allRegions, zonalRegions),
  createSku('Standard_E8s_v6', 'Esv6', 'Intel', 'v6', 8, 64, allRegions, zonalRegions),
  createSku('Standard_E16as_v6', 'Easv6', 'AMD', 'v6', 16, 128, ['norwayeast', 'swedencentral', 'denmarkeast'], ['norwayeast', 'swedencentral', 'denmarkeast']),
  createSku('Standard_E16s_v6', 'Esv6', 'Intel', 'v6', 16, 128, ['swedencentral', 'swedensouth', 'denmarkeast'], ['swedencentral', 'denmarkeast']),
  createSku('Standard_E32as_v6', 'Easv6', 'AMD', 'v6', 32, 256, ['norwayeast', 'swedencentral', 'denmarkeast'], ['norwayeast', 'swedencentral', 'denmarkeast']),
  createSku('Standard_E32s_v6', 'Esv6', 'Intel', 'v6', 32, 256, ['swedencentral', 'denmarkeast'], ['swedencentral', 'denmarkeast']),
  createSku('Standard_E64as_v6', 'Easv6', 'AMD', 'v6', 64, 512, ['norwayeast', 'swedencentral'], ['norwayeast', 'swedencentral']),
  createSku('Standard_E64s_v6', 'Esv6', 'Intel', 'v6', 64, 512, ['swedencentral'], ['swedencentral']),

  // E-series v7
  createSku('Standard_E2as_v7', 'Easv7', 'AMD', 'v7', 2, 16, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_E2s_v7', 'Esv7', 'Intel', 'v7', 2, 16, ['swedencentral'], ['swedencentral']),
  createSku('Standard_E4as_v7', 'Easv7', 'AMD', 'v7', 4, 32, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_E4s_v7', 'Esv7', 'Intel', 'v7', 4, 32, ['swedencentral'], ['swedencentral']),
  createSku('Standard_E8as_v7', 'Easv7', 'AMD', 'v7', 8, 64, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_E8s_v7', 'Esv7', 'Intel', 'v7', 8, 64, ['swedencentral'], ['swedencentral']),
  createSku('Standard_E16as_v7', 'Easv7', 'AMD', 'v7', 16, 128, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_E16s_v7', 'Esv7', 'Intel', 'v7', 16, 128, ['swedencentral'], ['swedencentral']),
  createSku('Standard_E32as_v7', 'Easv7', 'AMD', 'v7', 32, 256, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_E32s_v7', 'Esv7', 'Intel', 'v7', 32, 256, ['swedencentral'], ['swedencentral']),
  createSku('Standard_E64as_v7', 'Easv7', 'AMD', 'v7', 64, 512, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_E64ds_v7', 'Esv7', 'Intel', 'v7', 64, 512, ['swedencentral'], ['swedencentral']),

  // F-series v6
  createSku('Standard_F2as_v6', 'Fasv6', 'AMD', 'v6', 2, 4, allRegions, zonalRegions),
  createSku('Standard_F2ams_v6', 'Famsv6', 'Intel', 'v6', 2, 4, allRegions, zonalRegions),
  createSku('Standard_F4as_v6', 'Fasv6', 'AMD', 'v6', 4, 8, allRegions, zonalRegions),
  createSku('Standard_F4ams_v6', 'Famsv6', 'Intel', 'v6', 4, 8, allRegions, zonalRegions),
  createSku('Standard_F8as_v6', 'Fasv6', 'AMD', 'v6', 8, 16, ['norwayeast', 'swedencentral', 'denmarkeast'], ['norwayeast', 'swedencentral', 'denmarkeast']),
  createSku('Standard_F8ams_v6', 'Famsv6', 'Intel', 'v6', 8, 16, allRegions, zonalRegions),
  createSku('Standard_F16as_v6', 'Fasv6', 'AMD', 'v6', 16, 32, ['norwayeast', 'swedencentral', 'denmarkeast'], ['norwayeast', 'swedencentral', 'denmarkeast']),
  createSku('Standard_F16ams_v6', 'Famsv6', 'Intel', 'v6', 16, 32, allRegions, zonalRegions),
  createSku('Standard_F32as_v6', 'Fasv6', 'AMD', 'v6', 32, 64, ['norwayeast', 'swedencentral'], ['norwayeast', 'swedencentral']),
  createSku('Standard_F32ams_v6', 'Famsv6', 'Intel', 'v6', 32, 64, ['swedencentral', 'denmarkeast'], ['swedencentral', 'denmarkeast']),

  // F-series v7
  createSku('Standard_F2as_v7', 'Fasv7', 'AMD', 'v7', 2, 4, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_F2ams_v7', 'Famsv7', 'Intel', 'v7', 2, 4, ['swedencentral'], ['swedencentral']),
  createSku('Standard_F4as_v7', 'Fasv7', 'AMD', 'v7', 4, 8, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_F4ams_v7', 'Famsv7', 'Intel', 'v7', 4, 8, ['swedencentral'], ['swedencentral']),
  createSku('Standard_F8as_v7', 'Fasv7', 'AMD', 'v7', 8, 16, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_F8ams_v7', 'Famsv7', 'Intel', 'v7', 8, 16, ['swedencentral'], ['swedencentral']),
  createSku('Standard_F16as_v7', 'Fasv7', 'AMD', 'v7', 16, 32, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_F16ams_v7', 'Famsv7', 'Intel', 'v7', 16, 32, ['swedencentral'], ['swedencentral']),
  createSku('Standard_F32as_v7', 'Fasv7', 'AMD', 'v7', 32, 64, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_F32ams_v7', 'Famsv7', 'Intel', 'v7', 32, 64, ['swedencentral'], ['swedencentral']),

  // M-series v6
  createSku('Standard_M8ms_v6', 'Msv6', 'Intel', 'v6', 8, 219, ['swedencentral', 'denmarkeast'], ['swedencentral', 'denmarkeast']),
  createSku('Standard_M16ms_v6', 'Msv6', 'Intel', 'v6', 16, 438, ['swedencentral'], ['swedencentral']),
  createSku('Standard_M32ms_v6', 'Msv6', 'Intel', 'v6', 32, 875, ['swedencentral'], ['swedencentral']),
  createSku('Standard_M64ms_v6', 'Msv6', 'Intel', 'v6', 64, 1750, ['swedencentral'], ['swedencentral']),

  // L-series v6
  createSku('Standard_L4s_v6', 'Lsv6', 'Intel', 'v6', 4, 32, ['swedencentral', 'denmarkeast'], ['swedencentral', 'denmarkeast']),
  createSku('Standard_L8s_v6', 'Lsv6', 'Intel', 'v6', 8, 64, ['swedencentral'], ['swedencentral']),
  createSku('Standard_L16s_v6', 'Lsv6', 'Intel', 'v6', 16, 128, ['swedencentral'], ['swedencentral']),
  createSku('Standard_L32s_v6', 'Lsv6', 'Intel', 'v6', 32, 256, ['swedencentral'], ['swedencentral']),

  // B-series (burstable)
  createSku('Standard_B1s', 'Bsv1', 'Intel', 'v6', 1, 1, allRegions, []),
  createSku('Standard_B1ms', 'Bsv1', 'Intel', 'v6', 1, 2, allRegions, []),
  createSku('Standard_B2s', 'Bsv1', 'Intel', 'v6', 2, 4, allRegions, []),
  createSku('Standard_B2ms', 'Bsv1', 'Intel', 'v6', 2, 8, allRegions, []),
  createSku('Standard_B4ms', 'Bsv1', 'Intel', 'v6', 4, 16, allRegions, []),

  // Additional D-series sizes
  createSku('Standard_D3as_v6', 'Dasv6', 'AMD', 'v6', 3, 12, ['norwayeast', 'swedencentral', 'swedensouth', 'denmarkeast'], ['norwayeast', 'swedencentral', 'denmarkeast']),
  createSku('Standard_D3s_v6', 'Dsv6', 'Intel', 'v6', 3, 12, ['norwayeast', 'swedencentral', 'swedensouth', 'denmarkeast'], ['norwayeast', 'swedencentral', 'denmarkeast']),
  createSku('Standard_D5as_v6', 'Dasv6', 'AMD', 'v6', 5, 20, ['norwayeast', 'swedencentral'], ['norwayeast', 'swedencentral']),
  createSku('Standard_D5s_v6', 'Dsv6', 'Intel', 'v6', 5, 20, ['swedencentral'], ['swedencentral']),
  createSku('Standard_D6as_v6', 'Dasv6', 'AMD', 'v6', 6, 24, ['norwayeast', 'swedencentral'], ['norwayeast', 'swedencentral']),
  createSku('Standard_D6s_v6', 'Dsv6', 'Intel', 'v6', 6, 24, ['swedencentral'], ['swedencentral']),
  createSku('Standard_D12as_v6', 'Dasv6', 'AMD', 'v6', 12, 48, ['norwayeast', 'swedencentral'], ['norwayeast', 'swedencentral']),
  createSku('Standard_D12s_v6', 'Dsv6', 'Intel', 'v6', 12, 48, ['swedencentral'], ['swedencentral']),
  createSku('Standard_D24as_v6', 'Dasv6', 'AMD', 'v6', 24, 96, ['norwayeast', 'swedencentral'], ['norwayeast', 'swedencentral']),
  createSku('Standard_D24s_v6', 'Dsv6', 'Intel', 'v6', 24, 96, ['swedencentral'], ['swedencentral']),
  createSku('Standard_D48as_v6', 'Dasv6', 'AMD', 'v6', 48, 192, ['norwayeast', 'swedencentral'], ['norwayeast', 'swedencentral']),
  createSku('Standard_D48s_v6', 'Dsv6', 'Intel', 'v6', 48, 192, ['swedencentral'], ['swedencentral']),

  // Additional D-series v7
  createSku('Standard_D3as_v7', 'Dasv7', 'AMD', 'v7', 3, 12, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_D3s_v7', 'Dsv7', 'Intel', 'v7', 3, 12, ['swedencentral'], ['swedencentral']),
  createSku('Standard_D6as_v7', 'Dasv7', 'AMD', 'v7', 6, 24, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_D6s_v7', 'Dsv7', 'Intel', 'v7', 6, 24, ['swedencentral'], ['swedencentral']),
  createSku('Standard_D12as_v7', 'Dasv7', 'AMD', 'v7', 12, 48, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_D12s_v7', 'Dsv7', 'Intel', 'v7', 12, 48, ['swedencentral'], ['swedencentral']),
  createSku('Standard_D24as_v7', 'Dasv7', 'AMD', 'v7', 24, 96, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_D24s_v7', 'Dsv7', 'Intel', 'v7', 24, 96, ['swedencentral'], ['swedencentral']),
  createSku('Standard_D48ads_v7', 'Dadsv7', 'AMD', 'v7', 48, 192, ['norwayeast', 'swedencentral'], zonalRegions),

  // Additional E-series sizes
  createSku('Standard_E3as_v6', 'Easv6', 'AMD', 'v6', 3, 24, ['norwayeast', 'swedencentral', 'denmarkeast'], ['norwayeast', 'swedencentral', 'denmarkeast']),
  createSku('Standard_E3s_v6', 'Esv6', 'Intel', 'v6', 3, 24, ['swedencentral', 'denmarkeast'], ['swedencentral', 'denmarkeast']),
  createSku('Standard_E6as_v6', 'Easv6', 'AMD', 'v6', 6, 48, ['norwayeast', 'swedencentral', 'denmarkeast'], ['norwayeast', 'swedencentral', 'denmarkeast']),
  createSku('Standard_E6s_v6', 'Esv6', 'Intel', 'v6', 6, 48, ['swedencentral', 'denmarkeast'], ['swedencentral', 'denmarkeast']),
  createSku('Standard_E12as_v6', 'Easv6', 'AMD', 'v6', 12, 96, ['norwayeast', 'swedencentral'], ['norwayeast', 'swedencentral']),
  createSku('Standard_E12s_v6', 'Esv6', 'Intel', 'v6', 12, 96, ['swedencentral'], ['swedencentral']),
  createSku('Standard_E24as_v6', 'Easv6', 'AMD', 'v6', 24, 192, ['norwayeast', 'swedencentral'], ['norwayeast', 'swedencentral']),
  createSku('Standard_E24s_v6', 'Esv6', 'Intel', 'v6', 24, 192, ['swedencentral'], ['swedencentral']),
  createSku('Standard_E48as_v6', 'Easv6', 'AMD', 'v6', 48, 384, ['swedencentral'], ['swedencentral']),
  createSku('Standard_E48s_v6', 'Esv6', 'Intel', 'v6', 48, 384, ['swedencentral'], ['swedencentral']),

  // Additional E-series v7
  createSku('Standard_E3as_v7', 'Easv7', 'AMD', 'v7', 3, 24, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_E3s_v7', 'Esv7', 'Intel', 'v7', 3, 24, ['swedencentral'], ['swedencentral']),
  createSku('Standard_E6as_v7', 'Easv7', 'AMD', 'v7', 6, 48, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_E6s_v7', 'Esv7', 'Intel', 'v7', 6, 48, ['swedencentral'], ['swedencentral']),
  createSku('Standard_E12as_v7', 'Easv7', 'AMD', 'v7', 12, 96, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_E12s_v7', 'Esv7', 'Intel', 'v7', 12, 96, ['swedencentral'], ['swedencentral']),
  createSku('Standard_E24as_v7', 'Easv7', 'AMD', 'v7', 24, 192, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_E24s_v7', 'Esv7', 'Intel', 'v7', 24, 192, ['swedencentral'], ['swedencentral']),
  createSku('Standard_E48as_v7', 'Easv7', 'AMD', 'v7', 48, 384, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_E48s_v7', 'Esv7', 'Intel', 'v7', 48, 384, ['swedencentral'], ['swedencentral']),

  // Additional F-series sizes
  createSku('Standard_F3as_v6', 'Fasv6', 'AMD', 'v6', 3, 6, ['norwayeast', 'swedencentral', 'denmarkeast'], ['norwayeast', 'swedencentral', 'denmarkeast']),
  createSku('Standard_F3ams_v6', 'Famsv6', 'Intel', 'v6', 3, 6, ['swedencentral', 'denmarkeast'], ['swedencentral', 'denmarkeast']),
  createSku('Standard_F6as_v6', 'Fasv6', 'AMD', 'v6', 6, 12, ['norwayeast', 'swedencentral', 'denmarkeast'], ['norwayeast', 'swedencentral', 'denmarkeast']),
  createSku('Standard_F6ams_v6', 'Famsv6', 'Intel', 'v6', 6, 12, ['swedencentral', 'denmarkeast'], ['swedencentral', 'denmarkeast']),
  createSku('Standard_F12as_v6', 'Fasv6', 'AMD', 'v6', 12, 24, ['norwayeast', 'swedencentral'], ['norwayeast', 'swedencentral']),
  createSku('Standard_F12ams_v6', 'Famsv6', 'Intel', 'v6', 12, 24, ['swedencentral'], ['swedencentral']),
  createSku('Standard_F24as_v6', 'Fasv6', 'AMD', 'v6', 24, 48, ['norwayeast', 'swedencentral'], ['norwayeast', 'swedencentral']),
  createSku('Standard_F24ams_v6', 'Famsv6', 'Intel', 'v6', 24, 48, ['swedencentral'], ['swedencentral']),

  // Additional F-series v7
  createSku('Standard_F3as_v7', 'Fasv7', 'AMD', 'v7', 3, 6, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_F3ams_v7', 'Famsv7', 'Intel', 'v7', 3, 6, ['swedencentral'], ['swedencentral']),
  createSku('Standard_F6as_v7', 'Fasv7', 'AMD', 'v7', 6, 12, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_F6ams_v7', 'Famsv7', 'Intel', 'v7', 6, 12, ['swedencentral'], ['swedencentral']),
  createSku('Standard_F12as_v7', 'Fasv7', 'AMD', 'v7', 12, 24, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_F12ams_v7', 'Famsv7', 'Intel', 'v7', 12, 24, ['swedencentral'], ['swedencentral']),
  createSku('Standard_F24as_v7', 'Fasv7', 'AMD', 'v7', 24, 48, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_F24ams_v7', 'Famsv7', 'Intel', 'v7', 24, 48, ['swedencentral'], ['swedencentral']),
  createSku('Standard_F48as_v7', 'Fasv7', 'AMD', 'v7', 48, 96, ['norwayeast', 'swedencentral'], zonalRegions),
  createSku('Standard_F48ams_v7', 'Famsv7', 'Intel', 'v7', 48, 96, ['swedencentral'], ['swedencentral']),

  // General purpose extended
  createSku('Standard_B2ms_v6', 'Bsv1', 'Intel', 'v6', 2, 8, allRegions, []),
  createSku('Standard_B4ms_v6', 'Bsv1', 'Intel', 'v6', 4, 16, allRegions, []),
  createSku('Standard_B12ms', 'Bsv1', 'Intel', 'v6', 12, 48, ['swedencentral'], []),
  createSku('Standard_B16ms', 'Bsv1', 'Intel', 'v6', 16, 64, ['swedencentral'], []),
  createSku('Standard_B20ms', 'Bsv1', 'Intel', 'v6', 20, 80, ['swedencentral'], []),

  // Additional memory optimized
  createSku('Standard_M32ts_v6', 'Msv6', 'Intel', 'v6', 32, 875, ['swedencentral'], ['swedencentral']),
  createSku('Standard_M32ls_v6', 'Msv6', 'Intel', 'v6', 32, 256, ['swedencentral'], ['swedencentral']),
  createSku('Standard_M64ls_v6', 'Msv6', 'Intel', 'v6', 64, 512, ['swedencentral'], ['swedencentral']),
  createSku('Standard_M128s_v6', 'Msv6', 'Intel', 'v6', 128, 2048, ['swedencentral'], ['swedencentral']),
  createSku('Standard_M128ms_v6', 'Msv6', 'Intel', 'v6', 128, 3892, ['swedencentral'], ['swedencentral']),

  // Storage optimized
  createSku('Standard_L8s_v7', 'Lsv7', 'Intel', 'v7', 8, 64, ['swedencentral'], ['swedencentral']),
  createSku('Standard_L16s_v7', 'Lsv7', 'Intel', 'v7', 16, 128, ['swedencentral'], ['swedencentral']),
  createSku('Standard_L32s_v7', 'Lsv7', 'Intel', 'v7', 32, 256, ['swedencentral'], ['swedencentral']),
  createSku('Standard_L48s_v7', 'Lsv7', 'Intel', 'v7', 48, 384, ['swedencentral'], ['swedencentral']),
  createSku('Standard_L64s_v7', 'Lsv7', 'Intel', 'v7', 64, 512, ['swedencentral'], ['swedencentral']),

  // High compute density (HPC)
  createSku('Standard_HB60rs_v6', 'HBsv6', 'AMD', 'v6', 60, 240, ['swedencentral'], ['swedencentral']),
  createSku('Standard_HB120rs_v6', 'HBsv6', 'AMD', 'v6', 120, 480, ['swedencentral'], ['swedencentral']),
  createSku('Standard_HC44rs_v6', 'HCsv6', 'Intel', 'v6', 44, 352, ['swedencentral'], ['swedencentral']),
  createSku('Standard_HC88rs_v6', 'HCsv6', 'Intel', 'v6', 88, 704, ['swedencentral'], ['swedencentral']),

  // Additional regional variants for coverage
  createSku('Standard_D2ads_v6', 'Dadsv6', 'AMD', 'v6', 2, 8, ['norwaywest', 'swedensouth'], []),
  createSku('Standard_D2ds_v6', 'Ddsv6', 'Intel', 'v6', 2, 8, ['norwaywest', 'swedensouth'], []),
  createSku('Standard_D4ads_v6', 'Dadsv6', 'AMD', 'v6', 4, 16, ['norwaywest', 'swedensouth'], []),
  createSku('Standard_D4ds_v6', 'Ddsv6', 'Intel', 'v6', 4, 16, ['norwaywest', 'swedensouth'], []),
  createSku('Standard_E2ads_v6', 'Eadsv6', 'AMD', 'v6', 2, 16, ['norwaywest', 'swedensouth'], []),
  createSku('Standard_E2ds_v6', 'Edsv6', 'Intel', 'v6', 2, 16, ['norwaywest', 'swedensouth'], []),
  createSku('Standard_E4ads_v6', 'Eadsv6', 'AMD', 'v6', 4, 32, ['norwaywest', 'swedensouth'], []),
  createSku('Standard_E4ds_v6', 'Edsv6', 'Intel', 'v6', 4, 32, ['norwaywest', 'swedensouth'], []),
  createSku('Standard_F2ads_v6', 'Fadsv6', 'AMD', 'v6', 2, 4, ['norwaywest', 'swedensouth'], []),
  createSku('Standard_F2ds_v6', 'Fdsv6', 'Intel', 'v6', 2, 4, ['norwaywest', 'swedensouth'], []),

  // GPU compute (select)
  createSku('Standard_NC6s_v3', 'NCsv3', 'Intel', 'v6', 6, 112, ['swedencentral'], ['swedencentral']),
  createSku('Standard_NC12s_v3', 'NCsv3', 'Intel', 'v6', 12, 224, ['swedencentral'], ['swedencentral']),
  createSku('Standard_NC24s_v3', 'NCsv3', 'Intel', 'v6', 24, 448, ['swedencentral'], ['swedencentral']),
  createSku('Standard_ND40rs_v2', 'NDv2', 'Intel', 'v6', 40, 672, ['swedencentral'], ['swedencentral']),
  createSku('Standard_ND96asr_v4', 'NDsv4', 'AMD', 'v6', 96, 900, ['swedencentral'], ['swedencentral']),

  // Mixed regional availability for remaining SKUs
  createSku('Standard_D2d_v5', 'Ddv5', 'Intel', 'v6', 2, 8, ['norwayeast', 'swedencentral', 'denmarkeast'], ['norwayeast', 'swedencentral', 'denmarkeast']),
  createSku('Standard_D4d_v5', 'Ddv5', 'Intel', 'v6', 4, 16, ['norwayeast', 'swedencentral', 'denmarkeast'], ['norwayeast', 'swedencentral', 'denmarkeast']),
  createSku('Standard_D8d_v5', 'Ddv5', 'Intel', 'v6', 8, 32, ['norwayeast', 'swedencentral'], ['norwayeast', 'swedencentral']),
  createSku('Standard_D16d_v5', 'Ddv5', 'Intel', 'v6', 16, 64, ['swedencentral'], ['swedencentral']),
  createSku('Standard_D32d_v5', 'Ddv5', 'Intel', 'v6', 32, 128, ['swedencentral'], ['swedencentral']),
  createSku('Standard_D64d_v5', 'Ddv5', 'Intel', 'v6', 64, 256, ['swedencentral'], ['swedencentral']),
  createSku('Standard_E2d_v5', 'Edv5', 'Intel', 'v6', 2, 16, ['norwayeast', 'swedencentral', 'denmarkeast'], ['norwayeast', 'swedencentral', 'denmarkeast']),
  createSku('Standard_E4d_v5', 'Edv5', 'Intel', 'v6', 4, 32, ['norwayeast', 'swedencentral', 'denmarkeast'], ['norwayeast', 'swedencentral', 'denmarkeast']),
  createSku('Standard_E8d_v5', 'Edv5', 'Intel', 'v6', 8, 64, ['norwayeast', 'swedencentral'], ['norwayeast', 'swedencentral']),
  createSku('Standard_E16d_v5', 'Edv5', 'Intel', 'v6', 16, 128, ['swedencentral'], ['swedencentral']),
  createSku('Standard_E32d_v5', 'Edv5', 'Intel', 'v6', 32, 256, ['swedencentral'], ['swedencentral']),
  createSku('Standard_E48d_v5', 'Edv5', 'Intel', 'v6', 48, 384, ['swedencentral'], ['swedencentral']),
  createSku('Standard_E64d_v5', 'Edv5', 'Intel', 'v6', 64, 512, ['swedencentral'], ['swedencentral']),
  createSku('Standard_F2d_v5', 'Fdv5', 'Intel', 'v6', 2, 4, ['norwayeast', 'swedencentral', 'denmarkeast'], ['norwayeast', 'swedencentral', 'denmarkeast']),
  createSku('Standard_F4d_v5', 'Fdv5', 'Intel', 'v6', 4, 8, ['norwayeast', 'swedencentral', 'denmarkeast'], ['norwayeast', 'swedencentral', 'denmarkeast']),
  createSku('Standard_F8d_v5', 'Fdv5', 'Intel', 'v6', 8, 16, ['swedencentral'], ['swedencentral']),
  createSku('Standard_F16d_v5', 'Fdv5', 'Intel', 'v6', 16, 32, ['swedencentral'], ['swedencentral']),
  createSku('Standard_F32d_v5', 'Fdv5', 'Intel', 'v6', 32, 64, ['swedencentral'], ['swedencentral']),
  createSku('Standard_F48d_v5', 'Fdv5', 'Intel', 'v6', 48, 96, ['swedencentral'], ['swedencentral']),
  createSku('Standard_F64d_v5', 'Fdv5', 'Intel', 'v6', 64, 128, ['swedencentral'], ['swedencentral']),
  createSku('Standard_F96d_v5', 'Fdv5', 'Intel', 'v6', 96, 192, ['swedencentral'], ['swedencentral']),
];
