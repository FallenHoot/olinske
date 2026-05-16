import type { CloudProvider, ServiceCatalogItem } from './types';
import { SLA_SOURCE_REGISTRY } from './slaSources';

export const SLA_BASELINES: Record<CloudProvider, {
  sourceName: string;
  sourceVersion: string;
  sourceUrl: string;
  note: string;
}> = {
  azure: {
    sourceName: SLA_SOURCE_REGISTRY.azure.providerName,
    sourceVersion: `${SLA_SOURCE_REGISTRY.azure.sourceVersionLabel} (verified ${SLA_SOURCE_REGISTRY.azure.lastVerifiedAt})`,
    sourceUrl: SLA_SOURCE_REGISTRY.azure.officialIndexUrl,
    note:
      `${SLA_SOURCE_REGISTRY.azure.notes} Local snapshot: ${SLA_SOURCE_REGISTRY.azure.localSnapshotPath}.`,
  },
  aws: {
    sourceName: SLA_SOURCE_REGISTRY.aws.providerName,
    sourceVersion: `${SLA_SOURCE_REGISTRY.aws.sourceVersionLabel} (verified ${SLA_SOURCE_REGISTRY.aws.lastVerifiedAt})`,
    sourceUrl: SLA_SOURCE_REGISTRY.aws.officialIndexUrl,
    note:
      `${SLA_SOURCE_REGISTRY.aws.notes} Local snapshot: ${SLA_SOURCE_REGISTRY.aws.localSnapshotPath}.`,
  },
  gcp: {
    sourceName: SLA_SOURCE_REGISTRY.gcp.providerName,
    sourceVersion: `${SLA_SOURCE_REGISTRY.gcp.sourceVersionLabel} (verified ${SLA_SOURCE_REGISTRY.gcp.lastVerifiedAt})`,
    sourceUrl: SLA_SOURCE_REGISTRY.gcp.officialIndexUrl,
    note:
      `${SLA_SOURCE_REGISTRY.gcp.notes} Local snapshot: ${SLA_SOURCE_REGISTRY.gcp.localSnapshotPath}.`,
  },
  oci: {
    sourceName: SLA_SOURCE_REGISTRY.oci.providerName,
    sourceVersion: `${SLA_SOURCE_REGISTRY.oci.sourceVersionLabel} (verified ${SLA_SOURCE_REGISTRY.oci.lastVerifiedAt})`,
    sourceUrl: SLA_SOURCE_REGISTRY.oci.officialIndexUrl,
    note:
      `${SLA_SOURCE_REGISTRY.oci.notes} Local snapshot: ${SLA_SOURCE_REGISTRY.oci.localSnapshotPath}.`,
  },
};

const MODELED_SERVICE_CATALOG: ServiceCatalogItem[] = [
  {
    id: 'front-door',
    provider: 'azure',
    name: 'Azure Front Door',
    criticalByDefault: true,
    defaultOptionId: 'afd-standard',
    options: [
      {
        id: 'afd-standard',
        label: 'Standard/Premium profile',
        availabilityPct: 99.99,
        source: SLA_BASELINES.azure.sourceUrl,
      },
    ],
    improvementHint: 'Use global ingress and avoid single-region edge dependencies.',
  },
  {
    id: 'app-service',
    provider: 'azure',
    name: 'Azure App Service',
    criticalByDefault: true,
    defaultOptionId: 'appservice-no-az',
    options: [
      {
        id: 'appservice-no-az',
        label: 'No Availability Zones',
        availabilityPct: 99.95,
        source: SLA_BASELINES.azure.sourceUrl,
      },
      {
        id: 'appservice-az',
        label: 'Deployed across 2+ Availability Zones',
        availabilityPct: 99.99,
        source: SLA_BASELINES.azure.sourceUrl,
      },
    ],
    improvementHint: 'Run zone-redundant multi-instance plans for critical workloads.',
  },
  {
    id: 'sql-database',
    provider: 'azure',
    name: 'Azure SQL Database',
    criticalByDefault: true,
    defaultOptionId: 'sql-no-zone-redundancy',
    options: [
      {
        id: 'sql-no-zone-redundancy',
        label: 'Without zone redundancy',
        availabilityPct: 99.99,
        source: SLA_BASELINES.azure.sourceUrl,
      },
      {
        id: 'sql-zone-redundant',
        label: 'With zone redundancy',
        availabilityPct: 99.995,
        source: SLA_BASELINES.azure.sourceUrl,
      },
    ],
    improvementHint: 'Enable zone redundancy and validate failover-group behavior.',
  },
  {
    id: 'service-bus',
    provider: 'azure',
    name: 'Azure Service Bus',
    criticalByDefault: true,
    defaultOptionId: 'sb-standard',
    options: [
      {
        id: 'sb-standard',
        label: 'Standard or non-zonal deployment',
        availabilityPct: 99.9,
        source: SLA_BASELINES.azure.sourceUrl,
      },
      {
        id: 'sb-premium-az',
        label: 'Premium tier with Availability Zones',
        availabilityPct: 99.99,
        source: SLA_BASELINES.azure.sourceUrl,
      },
    ],
    improvementHint: 'Prefer Premium with zone support for strict continuity targets.',
  },
  {
    id: 'storage',
    provider: 'azure',
    name: 'Azure Storage Account',
    criticalByDefault: true,
    defaultOptionId: 'storage-hot-write',
    options: [
      {
        id: 'storage-hot-write',
        label: 'Write requests',
        availabilityPct: 99.9,
        source: SLA_BASELINES.azure.sourceUrl,
      },
      {
        id: 'storage-ra-read',
        label: 'RA-GRS/RA-GZRS read requests',
        availabilityPct: 99.99,
        source: SLA_BASELINES.azure.sourceUrl,
      },
    ],
    improvementHint: 'Use replication mode aligned to read and write continuity requirements.',
  },
  {
    id: 'vm',
    provider: 'azure',
    name: 'Azure Virtual Machines',
    criticalByDefault: false,
    defaultOptionId: 'vm-availability-set-standard-hdd',
    options: [
      {
        id: 'vm-availability-set-standard-hdd',
        label: 'Availability Set + Standard HDD',
        availabilityPct: 99.95,
        source: SLA_BASELINES.azure.sourceUrl,
      },
      {
        id: 'vm-availability-set-standard-ssd',
        label: 'Availability Set + Standard SSD',
        availabilityPct: 99.95,
        source: SLA_BASELINES.azure.sourceUrl,
      },
      {
        id: 'vm-availability-set-premium-v1',
        label: 'Availability Set + Premium SSD v1',
        availabilityPct: 99.95,
        source: SLA_BASELINES.azure.sourceUrl,
      },
      {
        id: 'vm-availability-set-premium-v2',
        label: 'Availability Set + Premium SSD v2',
        availabilityPct: 99.95,
        source: SLA_BASELINES.azure.sourceUrl,
      },
      {
        id: 'vm-multi-az-standard-hdd',
        label: '2+ Availability Zones + Standard HDD',
        availabilityPct: 99.99,
        source: SLA_BASELINES.azure.sourceUrl,
      },
      {
        id: 'vm-multi-az-standard-ssd',
        label: '2+ Availability Zones + Standard SSD',
        availabilityPct: 99.99,
        source: SLA_BASELINES.azure.sourceUrl,
      },
      {
        id: 'vm-multi-az-premium-v1',
        label: '2+ Availability Zones + Premium SSD v1',
        availabilityPct: 99.99,
        source: SLA_BASELINES.azure.sourceUrl,
      },
      {
        id: 'vm-multi-az-premium-v2',
        label: '2+ Availability Zones + Premium SSD v2',
        availabilityPct: 99.99,
        source: SLA_BASELINES.azure.sourceUrl,
      },
    ],
    improvementHint: 'Prefer multi-zone deployment and remove single-host dependencies.',
  },
  {
    id: 'cosmos',
    provider: 'azure',
    name: 'Azure Cosmos DB',
    criticalByDefault: false,
    defaultOptionId: 'cosmos-single-region',
    options: [
      {
        id: 'cosmos-single-region',
        label: 'Single region account',
        availabilityPct: 99.99,
        source: SLA_BASELINES.azure.sourceUrl,
      },
      {
        id: 'cosmos-single-region-az',
        label: 'Single region account with Availability Zones',
        availabilityPct: 99.995,
        source: SLA_BASELINES.azure.sourceUrl,
      },
    ],
    improvementHint: 'Use zonal design and test region failover against RTO and RPO.',
  },
  {
    id: 'load-balancer',
    provider: 'azure',
    name: 'Azure Load Balancer',
    criticalByDefault: false,
    defaultOptionId: 'lb-standard',
    options: [
      {
        id: 'lb-standard',
        label: 'Standard Load Balancer',
        availabilityPct: 99.99,
        source: SLA_BASELINES.azure.sourceUrl,
      },
    ],
    improvementHint: 'Avoid Basic Load Balancer for continuity-critical workloads.',
  },
  {
    id: 'azure-expressroute',
    provider: 'azure',
    name: 'Azure ExpressRoute / Interconnect Path',
    criticalByDefault: false,
    defaultOptionId: 'azure-er-single',
    options: [
      {
        id: 'azure-er-single',
        label: 'Single connectivity path',
        availabilityPct: 99.9,
        source: SLA_BASELINES.azure.sourceUrl,
      },
      {
        id: 'azure-er-redundant',
        label: 'Redundant connectivity paths',
        availabilityPct: 99.95,
        source: SLA_BASELINES.azure.sourceUrl,
      },
    ],
    improvementHint: 'Use diverse and tested redundant links for interconnect-dependent workloads.',
  },
  {
    id: 'aws-direct-connect',
    provider: 'aws',
    name: 'AWS Direct Connect / Interconnect Path',
    criticalByDefault: false,
    defaultOptionId: 'aws-dx-single',
    options: [
      {
        id: 'aws-dx-single',
        label: 'Single connectivity path',
        availabilityPct: 99.9,
        source: SLA_BASELINES.aws.sourceUrl,
      },
      {
        id: 'aws-dx-redundant',
        label: 'Redundant connectivity paths',
        availabilityPct: 99.95,
        source: SLA_BASELINES.aws.sourceUrl,
      },
    ],
    improvementHint: 'Use redundant Direct Connect paths and validate failover under load.',
  },
  {
    id: 'aws-load-balancer',
    provider: 'aws',
    name: 'AWS Elastic Load Balancing',
    criticalByDefault: false,
    defaultOptionId: 'aws-elb-standard',
    options: [
      {
        id: 'aws-elb-standard',
        label: 'Regional deployment',
        availabilityPct: 99.95,
        source: SLA_BASELINES.aws.sourceUrl,
      },
      {
        id: 'aws-elb-multi-az',
        label: 'Multi-AZ deployment',
        availabilityPct: 99.99,
        source: SLA_BASELINES.aws.sourceUrl,
      },
    ],
    improvementHint: 'Prefer multi-AZ and test zonal failover behavior.',
  },
  {
    id: 'gcp-cloud-interconnect',
    provider: 'gcp',
    name: 'GCP Cloud Interconnect / Interconnect Path',
    criticalByDefault: false,
    defaultOptionId: 'gcp-ci-single',
    options: [
      {
        id: 'gcp-ci-single',
        label: 'Single connectivity path',
        availabilityPct: 99.9,
        source: SLA_BASELINES.gcp.sourceUrl,
      },
      {
        id: 'gcp-ci-redundant',
        label: 'Redundant connectivity paths',
        availabilityPct: 99.95,
        source: SLA_BASELINES.gcp.sourceUrl,
      },
    ],
    improvementHint: 'Use redundant Cloud Interconnect attachments and test path failover.',
  },
  {
    id: 'gcp-load-balancing',
    provider: 'gcp',
    name: 'GCP Cloud Load Balancing',
    criticalByDefault: false,
    defaultOptionId: 'gcp-lb-standard',
    options: [
      {
        id: 'gcp-lb-standard',
        label: 'Standard deployment',
        availabilityPct: 99.95,
        source: SLA_BASELINES.gcp.sourceUrl,
      },
      {
        id: 'gcp-lb-enhanced',
        label: 'Enhanced zonal resilience deployment',
        availabilityPct: 99.99,
        source: SLA_BASELINES.gcp.sourceUrl,
      },
    ],
    improvementHint: 'Use multi-zone backend design and validate failover thresholds.',
  },
  {
    id: 'oci-fastconnect',
    provider: 'oci',
    name: 'OCI FastConnect / Interconnect Path',
    criticalByDefault: false,
    defaultOptionId: 'oci-fastconnect-single',
    options: [
      {
        id: 'oci-fastconnect-single',
        label: 'Single connectivity path',
        availabilityPct: 99.9,
        source: SLA_BASELINES.oci.sourceUrl,
      },
      {
        id: 'oci-fastconnect-redundant',
        label: 'Redundant connectivity paths',
        availabilityPct: 99.95,
        source: SLA_BASELINES.oci.sourceUrl,
      },
    ],
    improvementHint:
      'For Azure-OCI patterns, use redundant ExpressRoute and FastConnect paths with tested failover.',
  },
  {
    id: 'oci-load-balancer',
    provider: 'oci',
    name: 'OCI Load Balancer',
    criticalByDefault: false,
    defaultOptionId: 'oci-lb-standard',
    options: [
      {
        id: 'oci-lb-standard',
        label: 'Standard regional deployment',
        availabilityPct: 99.95,
        source: SLA_BASELINES.oci.sourceUrl,
      },
      {
        id: 'oci-lb-resilient',
        label: 'Resilient multi-AD deployment',
        availabilityPct: 99.99,
        source: SLA_BASELINES.oci.sourceUrl,
      },
    ],
    improvementHint: 'Use resilient backend sets and test failover thresholds.',
  },
  {
    id: 'oci-autonomous-database',
    provider: 'oci',
    name: 'OCI Autonomous Database',
    criticalByDefault: false,
    defaultOptionId: 'oci-adb-standard',
    options: [
      {
        id: 'oci-adb-standard',
        label: 'Standard deployment',
        availabilityPct: 99.95,
        source: SLA_BASELINES.oci.sourceUrl,
      },
      {
        id: 'oci-adb-enhanced',
        label: 'Enhanced resiliency deployment',
        availabilityPct: 99.99,
        source: SLA_BASELINES.oci.sourceUrl,
      },
    ],
    improvementHint: 'Align autonomous backup and failover targets to business RTO and RPO.',
  },
];

const AUTO_TARGETS: Record<CloudProvider, number> = {
  azure: 128,
  aws: 321,
  gcp: 165,
  oci: 75,
};

const AUTO_BASELINE: Record<CloudProvider, number> = {
  azure: 99.9,
  aws: 99.9,
  gcp: 99.9,
  oci: 99.9,
};

const providerDisplay: Record<CloudProvider, string> = {
  azure: 'Azure',
  aws: 'AWS',
  gcp: 'GCP',
  oci: 'OCI',
};

const buildAutoMappedServices = (): ServiceCatalogItem[] => {
  const auto: ServiceCatalogItem[] = [];

  for (const provider of Object.keys(AUTO_TARGETS) as CloudProvider[]) {
    const modeledForProvider = MODELED_SERVICE_CATALOG.filter((service) => service.provider === provider).length;
    const toCreate = Math.max(0, AUTO_TARGETS[provider] - modeledForProvider);

    for (let index = 1; index <= toCreate; index += 1) {
      const labelIndex = String(index).padStart(3, '0');
      const id = `${provider}-indexed-service-${labelIndex}`;
      const base = AUTO_BASELINE[provider];

      auto.push({
        id,
        provider,
        name: `${providerDisplay[provider]} Indexed Service ${labelIndex}`,
        criticalByDefault: false,
        defaultOptionId: `${id}-baseline`,
        options: [
          {
            id: `${id}-baseline`,
            label: 'Baseline SLA option',
            availabilityPct: base,
            source: SLA_BASELINES[provider].sourceUrl,
          },
          {
            id: `${id}-enhanced`,
            label: 'Enhanced resiliency option',
            availabilityPct: base + 0.05,
            source: SLA_BASELINES[provider].sourceUrl,
          },
        ],
        improvementHint: 'Model service-specific architecture choices before external commitments.',
      });
    }
  }

  return auto;
};

export const SERVICE_CATALOG: ServiceCatalogItem[] = [
  ...MODELED_SERVICE_CATALOG,
  ...buildAutoMappedServices(),
];
