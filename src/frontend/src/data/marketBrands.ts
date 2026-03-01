// All current Indian solar market brands (2025) — used as static defaults
// so brand selection always works regardless of backend data state.

export interface MarketBrand {
  category: string;
  name: string;
  specs?: string;
  priceHint?: string; // informational only
}

export const MARKET_BRANDS: MarketBrand[] = [
  // ─── Solar Panels ───────────────────────────────────────────────────────────
  {
    category: "Solar Panel",
    name: "Waaree Energies",
    specs: "540W–600W Mono PERC / TOPCon, 25yr warranty",
  },
  {
    category: "Solar Panel",
    name: "Adani Solar",
    specs: "540W–595W Mono PERC, Tier-1, 25yr warranty",
  },
  {
    category: "Solar Panel",
    name: "Vikram Solar",
    specs: "540W–590W Mono PERC / TOPCon, Tier-1",
  },
  {
    category: "Solar Panel",
    name: "Tata Power Solar",
    specs: "440W–545W Mono PERC, BIS certified",
  },
  {
    category: "Solar Panel",
    name: "Longi Solar",
    specs: "540W–615W Hi-MO5 Mono PERC",
  },
  {
    category: "Solar Panel",
    name: "Canadian Solar",
    specs: "540W–590W HiKu6 Mono PERC",
  },
  {
    category: "Solar Panel",
    name: "Jinko Solar",
    specs: "540W–590W Tiger Pro Mono PERC",
  },
  {
    category: "Solar Panel",
    name: "Risen Energy",
    specs: "540W–590W Mono PERC",
  },
  {
    category: "Solar Panel",
    name: "REC Group",
    specs: "405W–430W Alpha Series",
  },
  {
    category: "Solar Panel",
    name: "Premier Energies",
    specs: "530W–580W Mono PERC",
  },
  {
    category: "Solar Panel",
    name: "Goldi Solar",
    specs: "440W–550W Mono PERC",
  },
  {
    category: "Solar Panel",
    name: "Navitas Solar",
    specs: "330W–550W Poly/Mono PERC",
  },

  // ─── Inverters ──────────────────────────────────────────────────────────────
  {
    category: "Inverter",
    name: "Sungrow",
    specs: "3kW–250kW On-Grid / Hybrid, SG series",
  },
  {
    category: "Inverter",
    name: "Growatt",
    specs: "1kW–100kW On-Grid / Hybrid / Off-Grid",
  },
  {
    category: "Inverter",
    name: "Havells",
    specs: "1kW–10kW On-Grid, BIS certified",
  },
  {
    category: "Inverter",
    name: "Luminous",
    specs: "1kW–10kW NXG / NXI Hybrid",
  },
  {
    category: "Inverter",
    name: "Microtek",
    specs: "1kW–10kW MTEC On-Grid / Hybrid",
  },
  {
    category: "Inverter",
    name: "Su-Kam",
    specs: "1kW–15kW Falcon / Brainy On-Grid",
  },
  {
    category: "Inverter",
    name: "Delta Electronics",
    specs: "3kW–110kW RPI series",
  },
  { category: "Inverter", name: "Fronius", specs: "3kW–27kW Primo / Symo" },
  {
    category: "Inverter",
    name: "SMA Solar",
    specs: "2kW–110kW Sunny Boy / Tripower",
  },
  { category: "Inverter", name: "Goodwe", specs: "3kW–250kW DNS / ET Hybrid" },
  {
    category: "Inverter",
    name: "Huawei Solar",
    specs: "3kW–100kW SUN2000 series",
  },
  { category: "Inverter", name: "Solaredge", specs: "3kW–82.8kW HD-Wave" },
  { category: "Inverter", name: "Solis", specs: "1kW–255kW On-Grid / Hybrid" },

  // ─── Batteries ──────────────────────────────────────────────────────────────
  {
    category: "Battery",
    name: "Luminous",
    specs: "100Ah–200Ah Tubular / Li-ion",
  },
  {
    category: "Battery",
    name: "Amaron Solar",
    specs: "75Ah–200Ah VRLA / Tubular",
  },
  {
    category: "Battery",
    name: "Exide Industries",
    specs: "100Ah–200Ah Tubular / VRLA",
  },
  {
    category: "Battery",
    name: "Livguard Energy",
    specs: "60Ah–200Ah Tubular / VRLA",
  },
  { category: "Battery", name: "Eastman", specs: "100Ah–200Ah Tubular solar" },
  {
    category: "Battery",
    name: "Okaya Power",
    specs: "100Ah–200Ah Tall Tubular",
  },
  { category: "Battery", name: "V-Guard", specs: "100Ah–200Ah Tubular solar" },
  {
    category: "Battery",
    name: "Genus Power",
    specs: "75Ah–200Ah Tubular / VRLA",
  },
  {
    category: "Battery",
    name: "BatX Energies (LFP)",
    specs: "5kWh–200kWh LFP Li-ion",
  },
  {
    category: "Battery",
    name: "Nexcharge (LFP)",
    specs: "5kWh–100kWh LFP pack",
  },

  // ─── Cables ─────────────────────────────────────────────────────────────────
  {
    category: "Cable",
    name: "Polycab",
    specs: "DC 4/6mm² FR Solar cable, AC 4–25mm²",
  },
  {
    category: "Cable",
    name: "Havells Wires",
    specs: "Solar DC 4/6mm², FR AC cables",
  },
  {
    category: "Cable",
    name: "Finolex Cables",
    specs: "DC 4/6mm² solar, FR AC",
  },
  {
    category: "Cable",
    name: "KEI Industries",
    specs: "DC 4/6mm² solar, HT/LT cables",
  },
  { category: "Cable", name: "RR Kabel", specs: "DC 4/6mm² solar cable, XLPE" },
  { category: "Cable", name: "Sterlite Power", specs: "HT/LT solar cables" },
  { category: "Cable", name: "Lapp India", specs: "Olflex Solar DC/AC cables" },

  // ─── Structure ──────────────────────────────────────────────────────────────
  {
    category: "Structure",
    name: "Holisol (MS Structure)",
    specs: "MS / GI hot-dip galvanised, RCC / ground mount",
  },
  {
    category: "Structure",
    name: "Ataraxy Structures",
    specs: "Al 6063-T5 rail system, rooftop",
  },
  {
    category: "Structure",
    name: "Solar Mounting Solutions",
    specs: "Aluminium + GI rooftop & ground",
  },
  {
    category: "Structure",
    name: "Mounting Systems India",
    specs: "Al rail, mid/end clamps, rooftop",
  },
  {
    category: "Structure",
    name: "Rapid Racking",
    specs: "Al racking, rooftop & carport",
  },
  {
    category: "Structure",
    name: "Magerack",
    specs: "Al rail systems, rooftop",
  },
  {
    category: "Structure",
    name: "Custom GI Structure",
    specs: "Site-fabricated hot-dip GI, ground mount",
  },

  // ─── ACDB / DCDB ────────────────────────────────────────────────────────────
  {
    category: "ACDB/DCDB",
    name: "Elmeasure",
    specs: "ACDB / DCDB with SPD, MCB, meters",
  },
  { category: "ACDB/DCDB", name: "Connectwell", specs: "DIN rail ACDB / DCDB" },
  {
    category: "ACDB/DCDB",
    name: "L&T Electrical",
    specs: "AC distribution boards, MCCBs",
  },
  {
    category: "ACDB/DCDB",
    name: "Schneider Electric",
    specs: "Acti9 ACDB / DC enclosures",
  },
  { category: "ACDB/DCDB", name: "ABB India", specs: "OVR SPD, ACDB, MCCB" },
  { category: "ACDB/DCDB", name: "Siemens India", specs: "ACDB / DCDB panels" },
  {
    category: "ACDB/DCDB",
    name: "Havells Switchgear",
    specs: "MCB / RCBO / ACDB",
  },

  // ─── Protection Devices ─────────────────────────────────────────────────────
  {
    category: "Protection Device",
    name: "Legrand India",
    specs: "SPD Type I/II, MCB, isolators",
  },
  {
    category: "Protection Device",
    name: "Phoenix Contact",
    specs: "SPD Type I/II, DC surge protection",
  },
  {
    category: "Protection Device",
    name: "OBO Bettermann",
    specs: "Lightning protection, SPD",
  },
  {
    category: "Protection Device",
    name: "Dehn India",
    specs: "Lightning rods, SPD, earthing",
  },
  {
    category: "Protection Device",
    name: "Salzer Electronics",
    specs: "DC isolators, changeover, MCB",
  },
  {
    category: "Protection Device",
    name: "Indo Asian Fusegear",
    specs: "MCB, MCCB, isolators",
  },
  {
    category: "Protection Device",
    name: "Hager India",
    specs: "MCB, RCBO, DC isolators",
  },

  // ─── Earthing ───────────────────────────────────────────────────────────────
  {
    category: "Earthing",
    name: "Amiable Impex (Chemical)",
    specs: "Chemical earthing electrode, 3–5 Ohm",
  },
  {
    category: "Earthing",
    name: "Ennob India (GI Pipe)",
    specs: "GI pipe earthing, IS 3043",
  },
  {
    category: "Earthing",
    name: "Kingsun Earthing",
    specs: "Copper-bonded rod earthing",
  },
  {
    category: "Earthing",
    name: "E&E India",
    specs: "Maintenance-free earthing compound",
  },
  {
    category: "Earthing",
    name: "Axis Electrical (Plate)",
    specs: "GI / Cu plate earthing, IS 3043",
  },
];

export const BRAND_CATEGORIES = [
  "Solar Panel",
  "Inverter",
  "Battery",
  "Cable",
  "Structure",
  "ACDB/DCDB",
  "Protection Device",
  "Earthing",
] as const;

export function getBrandsByCategory(): Record<string, MarketBrand[]> {
  return MARKET_BRANDS.reduce(
    (acc, brand) => {
      if (!acc[brand.category]) acc[brand.category] = [];
      acc[brand.category].push(brand);
      return acc;
    },
    {} as Record<string, MarketBrand[]>,
  );
}
