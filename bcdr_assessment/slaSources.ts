export type SlaProviderKey = 'azure' | 'aws' | 'gcp' | 'oci';

export type SlaSourceRecord = {
  provider: SlaProviderKey;
  providerName: string;
  officialIndexUrl: string;
  interpretationGuideUrl?: string;
  sourceVersionLabel: string;
  lastVerifiedAt: string;
  localSnapshotPath: string;
  notes: string;
};

export const SLA_SOURCE_REGISTRY: Record<SlaProviderKey, SlaSourceRecord> = {
  azure: {
    provider: 'azure',
    providerName: 'Microsoft Azure',
    officialIndexUrl: 'https://aka.ms/csla',
    interpretationGuideUrl: 'https://learn.microsoft.com/en-us/azure/reliability/concept-service-level-agreements',
    sourceVersionLabel: 'Microsoft Online Services SLA (WW), May 2026',
    lastVerifiedAt: '2026-05-15',
    localSnapshotPath: 'src/data/sla-snapshots/azure-sla-guide.html',
    notes: 'Use the five-pass model from Microsoft Learn to interpret definitions, measurement, exclusions, and claim process.',
  },
  aws: {
    provider: 'aws',
    providerName: 'Amazon Web Services',
    officialIndexUrl: 'https://aws.amazon.com/legal/service-level-agreements/',
    sourceVersionLabel: 'AWS Service Level Agreements index',
    lastVerifiedAt: '2026-05-15',
    localSnapshotPath: 'src/data/sla-snapshots/aws-sla-index.html',
    notes: 'Service-level terms are service-specific. Validate regional, multi-AZ, and request-log claim prerequisites.',
  },
  gcp: {
    provider: 'gcp',
    providerName: 'Google Cloud',
    officialIndexUrl: 'https://cloud.google.com/terms/sla',
    sourceVersionLabel: 'Google Cloud Service Level Agreements index',
    lastVerifiedAt: '2026-05-15',
    localSnapshotPath: 'src/data/sla-snapshots/gcp-sla-index.html',
    notes: 'Service terms can vary by network tier, region family, and covered-service scope.',
  },
  oci: {
    provider: 'oci',
    providerName: 'Oracle Cloud Infrastructure',
    officialIndexUrl: 'https://www.oracle.com/cloud/sla/',
    sourceVersionLabel: 'OCI SLA page with PaaS and IaaS Pillar reference',
    lastVerifiedAt: '2026-05-15',
    localSnapshotPath: 'src/data/sla-snapshots/oci-sla-index.html',
    notes: 'Reference OCI availability, performance, and manageability commitments plus Pillar document terms.',
  },
};
