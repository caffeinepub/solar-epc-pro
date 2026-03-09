import type {
  InventoryItem,
  ProductMaster,
  Project,
  Quotation,
} from "../backend.d";

// ─── AI Types ────────────────────────────────────────────────────────────────

export type AILoadSuggestion = {
  recommendedSystemKW: number;
  recommendedBatteryKWh: number;
  recommendedPanelType: string;
  recommendedPanelWp: number;
  panelQuantity: number;
  stringConfig: string;
  inverterSizeKW: number;
  batteryAh: number;
  batteryVoltage: number;
  batteryQty: number;
  estimatedYieldKWhPerYear: number;
  paybackYears: number;
  irr: number;
  annualSavings: number;
  twentyFiveYearSavings: number;
  carbonSavingsTonnesPerYear: number;
  dcAcRatio: number;
  totalEstimatedCost: number;
  reasoning: string;
};

export type AIInsights = {
  totalActivePipelineKW: number;
  projectedMaterialNeeds: string;
  topRecommendedPanel: string;
  topRecommendedInverter: string;
  avgProjectROIYears: number;
  lowStockAlerts: number;
  procurementForecast: string;
  yieldForecastKWhYear: number;
};

export type AIProductRecommendation = {
  category: string;
  recommended: {
    id: bigint;
    brand: string;
    capacity: string;
    productType: string;
    price: number;
    efficiency: number;
    reason: string;
  } | null;
};

// ─── Standard inverter sizes ─────────────────────────────────────────────────

const STANDARD_INVERTER_KW = [
  1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 50, 100,
];

function roundUpToStandardInverter(kw: number): number {
  for (const size of STANDARD_INVERTER_KW) {
    if (kw <= size) return size;
  }
  return STANDARD_INVERTER_KW[STANDARD_INVERTER_KW.length - 1];
}

// ─── IRR lookup ──────────────────────────────────────────────────────────────

function irrFromPayback(payback: number): number {
  if (payback <= 4) return 22;
  if (payback <= 5) return 20;
  if (payback <= 6) return 18;
  if (payback <= 7) return 16;
  if (payback <= 8) return 14;
  return 12;
}

// ─── 25-year savings with 0.5% degradation ───────────────────────────────────

function compute25YrSavings(annualYield: number, tariff: number): number {
  let savings = 0;
  let degradedYield = annualYield;
  for (let y = 0; y < 25; y++) {
    savings += degradedYield * tariff;
    degradedYield *= 0.995;
  }
  return Math.round(savings);
}

// ─── analyzeLoad ─────────────────────────────────────────────────────────────

export function analyzeLoad(
  systemKW: number,
  _monthlyKWh: number,
  systemType: "onGrid" | "offGrid" | "hybrid",
  backupHours: number,
  tariffPerKWh: number,
): AILoadSuggestion {
  // Panel type by system size
  let panelType: string;
  let panelWp: number;
  if (systemKW >= 50) {
    panelType = "Bifacial TOPCon 720W";
    panelWp = 720;
  } else if (systemKW >= 20) {
    panelType = "TOPCon 700W";
    panelWp = 700;
  } else if (systemKW >= 10) {
    panelType = "TOPCon 545W";
    panelWp = 545;
  } else if (systemKW >= 5) {
    panelType = "Mono PERC 540W";
    panelWp = 540;
  } else {
    panelType = "Mono PERC 440W";
    panelWp = 440;
  }

  // DC/AC ratio by system type
  const dcAcRatioTarget =
    systemType === "onGrid" ? 1.15 : systemType === "offGrid" ? 1.1 : 1.12;

  // Panel quantity
  const panelQty = Math.ceil((systemKW * dcAcRatioTarget * 1000) / panelWp);

  // String configuration
  const panelsPerString = panelWp >= 600 ? 8 : 10;
  const strings = Math.ceil(panelQty / panelsPerString);
  const stringConfig = `${strings} strings × ${panelsPerString} panels/string`;

  // Inverter size
  const rawInverterKW = systemKW * 1.1;
  const inverterKW = roundUpToStandardInverter(rawInverterKW);

  // Battery config
  const battVoltage = systemKW >= 10 ? 48 : 24;
  const battAh = 200;
  const dod = 0.8;
  const effectiveBackup = backupHours > 0 ? backupHours : 4;
  const requiredKWh = systemKW * effectiveBackup;
  const kwhPerUnit = (battVoltage * battAh * dod) / 1000;
  const needsBattery = systemType === "offGrid" || systemType === "hybrid";
  const battQty = needsBattery ? Math.ceil(requiredKWh / kwhPerUnit) : 0;
  const battCapKWh = battQty * kwhPerUnit;

  // Yield & savings
  const annualYield = systemKW * 5.5 * 365 * 0.8;
  const effectiveTariff = tariffPerKWh > 0 ? tariffPerKWh : 8.5;
  const annualSavings = annualYield * effectiveTariff;

  // Cost estimate
  const panelCostPerWp = panelWp >= 700 ? 40 : panelWp >= 540 ? 38 : 35;
  const totalCost =
    systemKW * 1000 * panelCostPerWp +
    inverterKW * 8000 +
    battQty * 14000 +
    systemKW * 15000;

  const paybackYears = annualSavings > 0 ? totalCost / annualSavings : 0;
  const irr = irrFromPayback(paybackYears);
  const twentyFiveYearSavings = compute25YrSavings(
    annualYield,
    effectiveTariff,
  );
  const carbonSavingsTonnesPerYear = (annualYield * 0.82) / 1000;

  // Actual DC/AC ratio
  const dcAcRatio = (panelQty * panelWp) / (inverterKW * 1000);

  const reasoning = `For a ${systemKW.toFixed(1)} kWp ${systemType} system, AI recommends ${panelType} panels (${panelQty} panels in ${strings} strings). Inverter: ${inverterKW} kW. ${needsBattery ? `Battery: ${battQty} × ${battAh}Ah @ ${battVoltage}V (${battCapKWh.toFixed(1)} kWh backup). ` : ""}Estimated annual yield: ${Math.round(annualYield).toLocaleString()} kWh, payback in ${paybackYears.toFixed(1)} years.`;

  return {
    recommendedSystemKW: systemKW,
    recommendedBatteryKWh: battCapKWh,
    recommendedPanelType: panelType,
    recommendedPanelWp: panelWp,
    panelQuantity: panelQty,
    stringConfig,
    inverterSizeKW: inverterKW,
    batteryAh: battAh,
    batteryVoltage: battVoltage,
    batteryQty: battQty,
    estimatedYieldKWhPerYear: Math.round(annualYield),
    paybackYears: Math.round(paybackYears * 10) / 10,
    irr,
    annualSavings: Math.round(annualSavings),
    twentyFiveYearSavings,
    carbonSavingsTonnesPerYear:
      Math.round(carbonSavingsTonnesPerYear * 10) / 10,
    dcAcRatio: Math.round(dcAcRatio * 100) / 100,
    totalEstimatedCost: Math.round(totalCost),
    reasoning,
  };
}

// ─── getAIInsights ───────────────────────────────────────────────────────────

export function getAIInsights(
  projects: Project[],
  quotations: Quotation[],
  inventory: InventoryItem[],
  products: ProductMaster[],
): AIInsights {
  const totalActivePipelineKW = projects.reduce(
    (sum, p) => sum + p.systemSizeKW,
    0,
  );

  const activeCount = projects.filter(
    (p) =>
      p.status === "draft" ||
      p.status === "quoted" ||
      p.status === "inProgress",
  ).length;

  const lowStockAlerts = inventory.filter(
    (i) => i.quantityOnHand < i.minStock,
  ).length;

  // Top recommended panel: highest efficiency active solar panel
  const activePanels = products
    .filter((p) => p.category === "Solar Panel" && p.isActive)
    .sort((a, b) => b.efficiency - a.efficiency);

  const topPanel = activePanels[0];
  const topRecommendedPanel = topPanel
    ? `${topPanel.brand} ${topPanel.capacity} ${topPanel.productType}`
    : "Waaree 545W TOPCon";

  // Top recommended inverter: first active inverter
  const activeInverters = products.filter(
    (p) => p.category === "Inverter" && p.isActive,
  );
  const topInverter = activeInverters[0];
  const topRecommendedInverter = topInverter
    ? `${topInverter.brand} ${topInverter.capacity} ${topInverter.productType}`
    : "Sungrow 5kW Hybrid";

  // Average ROI from quotations
  const avgProjectROIYears =
    quotations.length > 0
      ? quotations.reduce((sum, q) => sum + q.paybackYears, 0) /
        quotations.length
      : 6.5;

  // Yield forecast
  const yieldForecastKWhYear = Math.round(
    totalActivePipelineKW * 5.5 * 365 * 0.8,
  );

  // Procurement forecast
  let procurementForecast: string;
  if (activeCount > 0) {
    const estPanels = Math.ceil((totalActivePipelineKW * 1.15 * 1000) / 545);
    const estInverters = Math.ceil(activeCount * 1.1);
    procurementForecast = `~${activeCount} active project${activeCount > 1 ? "s" : ""}. Est. ${estPanels} panels, ${estInverters} inverter unit${estInverters > 1 ? "s" : ""} required.`;
  } else {
    procurementForecast = "No active projects in pipeline.";
  }

  // Projected material needs
  let projectedMaterialNeeds: string;
  if (activeCount > 0) {
    const panelCount = Math.ceil((totalActivePipelineKW * 1.15 * 1000) / 545);
    const inverterCount = Math.ceil(activeCount * 1.1);
    const cableMeters = Math.ceil(totalActivePipelineKW * 120);
    projectedMaterialNeeds = `${panelCount} solar panels, ${inverterCount} inverters, ${cableMeters} m DC cables`;
  } else {
    projectedMaterialNeeds = "No pending material requirements";
  }

  return {
    totalActivePipelineKW: Math.round(totalActivePipelineKW * 10) / 10,
    projectedMaterialNeeds,
    topRecommendedPanel,
    topRecommendedInverter,
    avgProjectROIYears: Math.round(avgProjectROIYears * 10) / 10,
    lowStockAlerts,
    procurementForecast,
    yieldForecastKWhYear,
  };
}

// ─── getProductRecommendations ────────────────────────────────────────────────

export function getProductRecommendations(
  systemKW: number,
  _systemType: "onGrid" | "offGrid" | "hybrid",
  products: ProductMaster[],
): AIProductRecommendation[] {
  const categories = ["Solar Panel", "Inverter", "Battery"];

  return categories.map((cat) => {
    const activeProducts = products.filter(
      (p) => p.category === cat && p.isActive,
    );

    if (activeProducts.length === 0) {
      return { category: cat, recommended: null };
    }

    let bestProduct: ProductMaster | null = null;
    let bestScore = Number.NEGATIVE_INFINITY;
    let reason = "";

    if (cat === "Solar Panel") {
      // Score by efficiency / price ratio
      for (const p of activeProducts) {
        const score =
          p.pricePerUnit > 0 ? (p.efficiency / p.pricePerUnit) * 10000 : 0;
        if (score > bestScore) {
          bestScore = score;
          bestProduct = p;
          reason = `Best efficiency-to-cost ratio at ${p.efficiency.toFixed(1)}% efficiency`;
        }
      }
    } else if (cat === "Inverter") {
      // Filter inverters roughly matching system size, score by warranty/price
      const capacityKW = Number.parseFloat(systemKW.toFixed(0));
      const filtered = activeProducts.filter((p) => {
        const cap = Number.parseFloat(p.capacity);
        return (
          !Number.isNaN(cap) && cap >= capacityKW * 0.5 && cap <= capacityKW * 2
        );
      });
      const pool = filtered.length > 0 ? filtered : activeProducts;
      for (const p of pool) {
        const warranty = Number(p.warrantyYears);
        const score =
          p.pricePerUnit > 0 ? (warranty / p.pricePerUnit) * 1000 : 0;
        if (score > bestScore) {
          bestScore = score;
          bestProduct = p;
          reason = `Best warranty-to-value ratio: ${warranty}-year warranty`;
        }
      }
    } else {
      // Battery: score by warranty/price
      for (const p of activeProducts) {
        const warranty = Number(p.warrantyYears);
        const score =
          p.pricePerUnit > 0 ? (warranty / p.pricePerUnit) * 1000 : 0;
        if (score > bestScore) {
          bestScore = score;
          bestProduct = p;
          reason = `Best value battery: ${warranty}-year warranty`;
        }
      }
    }

    if (!bestProduct) return { category: cat, recommended: null };

    return {
      category: cat,
      recommended: {
        id: bestProduct.id,
        brand: bestProduct.brand,
        capacity: bestProduct.capacity,
        productType: bestProduct.productType,
        price: bestProduct.pricePerUnit,
        efficiency: bestProduct.efficiency,
        reason,
      },
    };
  });
}

// ─── computeSmartROI ─────────────────────────────────────────────────────────

export function computeSmartROI(
  systemKW: number,
  totalCost: number,
  tariffPerKWh: number,
  subsidy: number,
): {
  annualYield: number;
  annualSavings: number;
  paybackYears: number;
  irr: number;
  twentyFiveYearSavings: number;
  carbonTonnes: number;
} {
  const annualYield = Math.round(systemKW * 5.5 * 365 * 0.8);
  const effectiveTariff = tariffPerKWh > 0 ? tariffPerKWh : 8.5;
  const annualSavings = Math.round(annualYield * effectiveTariff);
  const netCost = Math.max(totalCost - subsidy, 0);
  const paybackYears =
    annualSavings > 0 ? Math.round((netCost / annualSavings) * 10) / 10 : 0;
  const irr = irrFromPayback(paybackYears);
  const twentyFiveYearSavings = compute25YrSavings(
    annualYield,
    effectiveTariff,
  );
  const carbonTonnes = Math.round(((annualYield * 0.82) / 1000) * 10) / 10;

  return {
    annualYield,
    annualSavings,
    paybackYears,
    irr,
    twentyFiveYearSavings,
    carbonTonnes,
  };
}
