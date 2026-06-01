export interface AprlRecommendation {
  title: string;
  url: string;
  impact: 'high' | 'medium';
}

export const APRL_RECOMMENDATIONS: Record<string, AprlRecommendation[]> = {
  'front-door': [
    {
      title: 'Review APRL Front Door resiliency recommendations',
      url: 'https://azure.github.io/Azure-Proactive-Resiliency-Library-v2/azure-resources/Network/frontDoors/',
      impact: 'medium',
    },
  ],
  'app-service': [
    {
      title: 'Migrate App Service plans to Availability Zone support',
      url: 'https://azure.github.io/Azure-Proactive-Resiliency-Library-v2/azure-resources/Web/serverFarms/#migrate-app-service-to-availability-zone-support',
      impact: 'high',
    },
    {
      title: 'Review full APRL App Service plan recommendations',
      url: 'https://azure.github.io/Azure-Proactive-Resiliency-Library-v2/azure-resources/Web/serverFarms/',
      impact: 'medium',
    },
  ],
  'sql-database': [
    {
      title: 'Review APRL Azure SQL server resiliency recommendations',
      url: 'https://azure.github.io/Azure-Proactive-Resiliency-Library-v2/azure-resources/Sql/servers/',
      impact: 'high',
    },
  ],
  'storage': [
    {
      title: 'Ensure storage accounts are zone or region redundant',
      url: 'https://azure.github.io/Azure-Proactive-Resiliency-Library-v2/azure-resources/Storage/storageAccounts/#ensure-that-storage-accounts-are-zone-or-region-redundant',
      impact: 'high',
    },
    {
      title: 'Review full APRL storage account recommendations',
      url: 'https://azure.github.io/Azure-Proactive-Resiliency-Library-v2/azure-resources/Storage/storageAccounts/',
      impact: 'medium',
    },
  ],
  'vm': [
    {
      title: 'Deploy VMs across Availability Zones',
      url: 'https://azure.github.io/Azure-Proactive-Resiliency-Library-v2/azure-resources/Compute/virtualMachines/#deploy-vms-across-availability-zones',
      impact: 'high',
    },
    {
      title: 'Use Premium or Ultra disks for mission critical workloads',
      url: 'https://azure.github.io/Azure-Proactive-Resiliency-Library-v2/azure-resources/Compute/virtualMachines/#mission-critical-workloads-should-consider-using-premium-or-ultra-disks',
      impact: 'medium',
    },
  ],
  'cosmos': [
    {
      title: 'Review APRL Cosmos DB database account resiliency recommendations',
      url: 'https://azure.github.io/Azure-Proactive-Resiliency-Library-v2/azure-resources/DocumentDB/databaseAccounts/',
      impact: 'high',
    },
  ],
  'azure-expressroute': [
    {
      title: 'Use multiple ExpressRoute circuits for critical workloads',
      url: 'https://azure.github.io/Azure-Proactive-Resiliency-Library-v2/azure-resources/Network/expressRouteCircuits/#connect-on-prem-networks-to-azure-critical-workloads-via-multiple-expressroutes',
      impact: 'high',
    },
    {
      title: 'Ensure physical links connect to distinct network edge devices',
      url: 'https://azure.github.io/Azure-Proactive-Resiliency-Library-v2/azure-resources/Network/expressRouteCircuits/#ensure-expressroutes-physical-links-connect-to-distinct-network-edge-devices',
      impact: 'medium',
    },
  ],
};
