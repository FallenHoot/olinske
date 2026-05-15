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
    notes: 'Before setting targets, read how Azure defines availability, how it is measured, what is excluded, and how claims are filed.',
  },
  aws: {
    provider: 'aws',
    providerName: 'Amazon Web Services',
    officialIndexUrl: 'https://aws.amazon.com/legal/service-level-agreements/',
    sourceVersionLabel: 'AWS Service Level Agreements index',
    lastVerifiedAt: '2026-05-15',
    localSnapshotPath: 'src/data/sla-snapshots/aws-sla-index.html',
    notes: 'AWS terms vary by service. Double-check region and Multi-AZ conditions, plus evidence needed for a claim.',
  },
  gcp: {
    provider: 'gcp',
    providerName: 'Google Cloud',
    officialIndexUrl: 'https://cloud.google.com/terms/sla',
    sourceVersionLabel: 'Google Cloud Service Level Agreements index',
    lastVerifiedAt: '2026-05-15',
    localSnapshotPath: 'src/data/sla-snapshots/gcp-sla-index.html',
    notes: 'GCP terms can change by network tier, region setup, and exact service scope. Verify the details before committing.',
  },
  oci: {
    provider: 'oci',
    providerName: 'Oracle Cloud Infrastructure',
    officialIndexUrl: 'https://www.oracle.com/cloud/sla/',
    sourceVersionLabel: 'OCI SLA page with PaaS and IaaS Pillar reference',
    lastVerifiedAt: '2026-05-15',
    localSnapshotPath: 'src/data/sla-snapshots/oci-sla-index.html',
    notes: 'For OCI, confirm availability commitments and related Pillar terms so expectations match contract language.',
  },
};
