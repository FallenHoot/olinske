export type CloudProvider = 'azure' | 'aws' | 'gcp' | 'oci';

export interface SlaOption {
  id: string;
  label: string;
  availabilityPct: number;
  source: string;
  notes?: string;
  modeled?: boolean;
}

export interface ServiceCatalogItem {
  id: string;
  provider: CloudProvider;
  name: string;
  criticalByDefault: boolean;
  defaultOptionId: string;
  options: SlaOption[];
  improvementHint: string;
}

export interface SelectedService {
  selectionId: string;
  serviceId: string;
  optionId: string;
  enabled: boolean;
}

export interface UpgradeImpact {
  serviceId: string;
  serviceName: string;
  fromLabel: string;
  toLabel: string;
  fromPct: number;
  toPct: number;
  compositeDeltaPct: number;
  newCompositePct: number;
  hint: string;
}
