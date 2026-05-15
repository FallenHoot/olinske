import type { ServiceCatalogItem, SelectedService, UpgradeImpact } from './types';

const MINUTES_IN_MONTH = 30 * 24 * 60;
const MINUTES_IN_YEAR = 365 * 24 * 60;

const round = (value: number, decimals: number): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const pctToRatio = (pct: number): number => pct / 100;
const ratioToPct = (ratio: number): number => ratio * 100;

const resolveOptionPct = (
  service: ServiceCatalogItem,
  selected: SelectedService | undefined,
): number | null => {
  if (!selected || !selected.enabled) return null;
  const option = service.options.find((candidate) => candidate.id === selected.optionId);
  if (!option || option.modeled === false) return null;
  return option.availabilityPct;
};

export const calculateCompositeAvailabilityPct = (
  catalog: ServiceCatalogItem[],
  selections: SelectedService[],
): number => {
  const selectionMap = new Map(selections.map((entry) => [entry.serviceId, entry]));

  let composite = 1;
  for (const service of catalog) {
    const availability = resolveOptionPct(service, selectionMap.get(service.id));
    if (availability === null) continue;
    composite *= pctToRatio(availability);
  }

  return round(ratioToPct(composite), 6);
};

export const downtimeBudgetFromPct = (availabilityPct: number) => {
  const unavailableRatio = Math.max(0, 1 - pctToRatio(availabilityPct));
  return {
    monthlyMinutes: round(unavailableRatio * MINUTES_IN_MONTH, 3),
    yearlyMinutes: round(unavailableRatio * MINUTES_IN_YEAR, 3),
  };
};

export const evaluateUpgradeImpacts = (
  catalog: ServiceCatalogItem[],
  selections: SelectedService[],
): UpgradeImpact[] => {
  const selectionMap = new Map(selections.map((entry) => [entry.serviceId, entry]));
  const baseComposite = calculateCompositeAvailabilityPct(catalog, selections);

  const impacts: UpgradeImpact[] = [];

  for (const service of catalog) {
    const selected = selectionMap.get(service.id);
    if (!selected || !selected.enabled) continue;

    const currentOption = service.options.find((option) => option.id === selected.optionId);
    if (!currentOption || currentOption.modeled === false) continue;

    const higherOptions = service.options
      .filter((option) => option.modeled !== false && option.availabilityPct > currentOption.availabilityPct)
      .sort((a, b) => b.availabilityPct - a.availabilityPct);

    const bestOption = higherOptions[0];
    if (!bestOption) continue;

    const scenario = selections.map((entry) =>
      entry.serviceId === service.id ? { ...entry, optionId: bestOption.id } : entry,
    );

    const improvedComposite = calculateCompositeAvailabilityPct(catalog, scenario);

    impacts.push({
      serviceId: service.id,
      serviceName: service.name,
      fromLabel: currentOption.label,
      toLabel: bestOption.label,
      fromPct: currentOption.availabilityPct,
      toPct: bestOption.availabilityPct,
      compositeDeltaPct: round(improvedComposite - baseComposite, 6),
      newCompositePct: improvedComposite,
      hint: service.improvementHint,
    });
  }

  return impacts.sort((a, b) => b.compositeDeltaPct - a.compositeDeltaPct);
};

export const computeSloPlan = (
  compositeSlaPct: number,
  companySlaPct: number,
  internalSloBufferBps: number,
) => {
  const internalSloPct = companySlaPct + internalSloBufferBps / 100;
  const feasible = internalSloPct <= compositeSlaPct;
  const maxCompanySlaPct = round(compositeSlaPct - internalSloBufferBps / 100, 6);

  return {
    internalSloPct: round(internalSloPct, 6),
    feasible,
    maxCompanySlaPct,
    gapToCompositePct: round(compositeSlaPct - internalSloPct, 6),
  };
};

export const formatPct = (value: number): string => `${value.toFixed(6)}%`;
