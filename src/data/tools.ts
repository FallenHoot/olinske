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
    slug: 'nek400-kursfortegnelse',
    title: 'NEK 400 Kursfortegnelse',
    description: 'Create a NEK 400-oriented kursfortegnelse with common load presets, local test cases, and Ib/In/Iz validation.',
    href: '/tools/circuit_sheet/',
    status: 'Live',
  },
  {
    slug: 'us-panel-directory',
    title: 'US Panel Directory',
    description: 'Create an NEC-oriented panel directory with odd/even slot layout, SPARE and BLANK handling, and 2-pole checks.',
    href: '/tools/circuit_sheet/panel-directory/',
    status: 'Live',
  },
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
  {
    slug: 'compound-interest-calculator',
    title: 'Compound Interest Calculator',
    description: 'Model historical and future growth with date-ranged contribution phases, flexible compounding, and USD/NOK/SEK/EUR output.',
    href: '/tools/compound-interest/',
    status: 'Live',
  },
  {
    slug: 'fence-calculator-gjerdekalkulator',
    title: 'Fence Calculator | Gjerdekalkulator',
    description: 'Plan DIY fence projects with map-based length drawing, post spacing, materials, phased costs, and bilingual guidance.',
    href: '/tools/fence-calculator.html',
    status: 'Live',
  },
];
