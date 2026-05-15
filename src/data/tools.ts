export type ToolStatus = 'Live' | 'Coming soon';

export interface ToolEntry {
  slug: string;
  title: string;
  description: string;
  href: string;
  status: ToolStatus;
}

// Add future tools here. The Tools page renders this list automatically.
export const toolsRegistry: ToolEntry[] = [
  {
    slug: 'bcdr-assessment',
    title: 'BCDR Assessment',
    description: 'Model composite availability, evaluate commitment feasibility, and export executive evidence packs for reliability planning.',
    href: '/bcdr_assessment/',
    status: 'Live',
  },
  {
    slug: 'vm-lookup',
    title: 'Azure VM Size Lookup',
    description: 'Explore 553 Azure VM SKUs across Nordic regions. Compare pricing, vCPU, memory, availability, and find the right size for your workload.',
    href: '/vm_lookup/',
    status: 'Live',
  },
];
