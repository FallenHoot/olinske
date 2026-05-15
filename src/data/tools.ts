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
    slug: 'next-tool-slot',
    title: 'Next Tool Slot',
    description: 'Reserved space for your next interactive tool. Add links here as new tools are published.',
    href: '',
    status: 'Coming soon',
  },
];
