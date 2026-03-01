// ─── Procurement Store ────────────────────────────────────────────────────────
// localStorage-based CRUD for Vendor, ProcurementEntry, AdvancePayment,
// and MaterialConsumed records.

export interface Vendor {
  id: string;
  name: string;
  address: string;
  gstNo: string; // "NA" when not available
  createdAt: string;
}

export interface ProcurementLineItem {
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface ProcurementEntry {
  id: string;
  vendorId: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceImageDataUrl: string; // base64 data URL
  items: ProcurementLineItem[];
  baseAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  gstAvailable: boolean;
  totalAmount: number;
  projectId: string | null;
  createdAt: string;
}

export interface AdvancePayment {
  id: string;
  procurementEntryId: string;
  amount: number;
  paidOn: string;
  remarks: string;
}

export interface MaterialConsumed {
  id: string;
  projectId: string;
  procurementEntryId: string;
  itemName: string;
  category: string;
  quantityConsumed: number;
  unit: string;
  consumedBy: string;
  consumedAt: string;
}

// ─── Keys ─────────────────────────────────────────────────────────────────────
const VENDORS_KEY = "solarEpc_vendors";
const ENTRIES_KEY = "solarEpc_procurementEntries";
const ADVANCES_KEY = "solarEpc_advancePayments";
const CONSUMED_KEY = "solarEpc_materialConsumed";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function uid(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function save<T>(key: string, items: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    console.warn("localStorage write failed");
  }
}

// ─── Vendor ───────────────────────────────────────────────────────────────────
export function getVendors(): Vendor[] {
  return load<Vendor>(VENDORS_KEY);
}

export function saveVendor(v: Vendor): void {
  const list = getVendors();
  const idx = list.findIndex((x) => x.id === v.id);
  if (idx >= 0) {
    list[idx] = v;
  } else {
    list.push(v);
  }
  save(VENDORS_KEY, list);
}

/**
 * Finds an existing vendor by name + gstNo (case-insensitive).
 * If no match, creates and persists a new vendor.
 */
export function findOrCreateVendor(
  name: string,
  address: string,
  gstNo: string,
): Vendor {
  const normalizedName = name.trim().toLowerCase();
  const normalizedGst = gstNo.trim().toUpperCase();

  const existing = getVendors().find(
    (v) =>
      v.name.trim().toLowerCase() === normalizedName &&
      v.gstNo.toUpperCase() === normalizedGst,
  );

  if (existing) {
    // Update address in case it changed
    const updated = { ...existing, address: address.trim() };
    saveVendor(updated);
    return updated;
  }

  const newVendor: Vendor = {
    id: uid(),
    name: name.trim(),
    address: address.trim(),
    gstNo: normalizedGst || "NA",
    createdAt: new Date().toISOString(),
  };
  saveVendor(newVendor);
  return newVendor;
}

// ─── Procurement Entry ─────────────────────────────────────────────────────────
export function getProcurementEntries(): ProcurementEntry[] {
  return load<ProcurementEntry>(ENTRIES_KEY);
}

export function getProcurementEntry(id: string): ProcurementEntry | undefined {
  return getProcurementEntries().find((e) => e.id === id);
}

export function saveProcurementEntry(e: ProcurementEntry): void {
  const list = getProcurementEntries();
  const idx = list.findIndex((x) => x.id === e.id);
  if (idx >= 0) {
    list[idx] = e;
  } else {
    list.push(e);
  }
  save(ENTRIES_KEY, list);
}

export function createProcurementEntry(
  partial: Omit<ProcurementEntry, "id" | "createdAt">,
): ProcurementEntry {
  const entry: ProcurementEntry = {
    ...partial,
    id: uid(),
    createdAt: new Date().toISOString(),
  };
  saveProcurementEntry(entry);
  return entry;
}

// ─── Advance Payments ─────────────────────────────────────────────────────────
export function getAdvancePayments(
  procurementEntryId?: string,
): AdvancePayment[] {
  const all = load<AdvancePayment>(ADVANCES_KEY);
  if (procurementEntryId) {
    return all.filter((a) => a.procurementEntryId === procurementEntryId);
  }
  return all;
}

export function saveAdvancePayment(ap: AdvancePayment): void {
  const list = getAdvancePayments();
  const idx = list.findIndex((x) => x.id === ap.id);
  if (idx >= 0) {
    list[idx] = ap;
  } else {
    list.push(ap);
  }
  save(ADVANCES_KEY, list);
}

export function createAdvancePayment(
  partial: Omit<AdvancePayment, "id">,
): AdvancePayment {
  const ap: AdvancePayment = { ...partial, id: uid() };
  saveAdvancePayment(ap);
  return ap;
}

export function getBalanceDue(procurementEntryId: string): number {
  const entry = getProcurementEntry(procurementEntryId);
  if (!entry) return 0;
  const totalPaid = getAdvancePayments(procurementEntryId).reduce(
    (sum, a) => sum + a.amount,
    0,
  );
  return Math.max(0, entry.totalAmount - totalPaid);
}

// ─── Material Consumed ─────────────────────────────────────────────────────────
export function getMaterialConsumed(projectId?: string): MaterialConsumed[] {
  const all = load<MaterialConsumed>(CONSUMED_KEY);
  if (projectId) {
    return all.filter((m) => m.projectId === projectId);
  }
  return all;
}

export function saveMaterialConsumed(mc: MaterialConsumed): void {
  const list = getMaterialConsumed();
  const idx = list.findIndex((x) => x.id === mc.id);
  if (idx >= 0) {
    list[idx] = mc;
  } else {
    list.push(mc);
  }
  save(CONSUMED_KEY, list);
}

export function createMaterialConsumed(
  partial: Omit<MaterialConsumed, "id" | "consumedAt">,
): MaterialConsumed {
  const mc: MaterialConsumed = {
    ...partial,
    id: uid(),
    consumedAt: new Date().toISOString(),
  };
  saveMaterialConsumed(mc);
  return mc;
}

// ─── Stock / Procurement helpers ─────────────────────────────────────────────

/**
 * Returns all line items from procurement entries linked to a specific project.
 */
export function getProcurementItemsForProject(
  projectId: string,
): ProcurementLineItem[] {
  const entries = getProcurementEntries().filter(
    (e) => e.projectId === projectId,
  );
  return entries.flatMap((e) => e.items);
}

/**
 * Returns aggregated stock availability for an item:
 * total purchased quantity - total consumed quantity.
 */
export function getStockAvailability(itemName: string): number {
  const normalizedName = itemName.trim().toLowerCase();

  const totalPurchased = getProcurementEntries()
    .flatMap((e) => e.items)
    .filter((i) => i.itemName.trim().toLowerCase() === normalizedName)
    .reduce((sum, i) => sum + i.quantity, 0);

  const totalConsumed = getMaterialConsumed()
    .filter((m) => m.itemName.trim().toLowerCase() === normalizedName)
    .reduce((sum, m) => sum + m.quantityConsumed, 0);

  return Math.max(0, totalPurchased - totalConsumed);
}

/**
 * Returns a deduplicated inventory summary across all procurement entries.
 * Groups by itemName, summing quantities.
 */
export interface StockSummaryItem {
  itemName: string;
  category: string;
  unit: string;
  totalPurchased: number;
  totalConsumed: number;
  available: number;
}

export function getStockSummary(): StockSummaryItem[] {
  const allItems = getProcurementEntries().flatMap((e) => e.items);
  const map = new Map<string, StockSummaryItem>();

  for (const item of allItems) {
    const key = item.itemName.trim().toLowerCase();
    const existing = map.get(key);
    if (existing) {
      existing.totalPurchased += item.quantity;
    } else {
      map.set(key, {
        itemName: item.itemName,
        category: item.category,
        unit: item.unit,
        totalPurchased: item.quantity,
        totalConsumed: 0,
        available: 0,
      });
    }
  }

  for (const mc of getMaterialConsumed()) {
    const key = mc.itemName.trim().toLowerCase();
    const entry = map.get(key);
    if (entry) {
      entry.totalConsumed += mc.quantityConsumed;
    }
  }

  for (const entry of map.values()) {
    entry.available = Math.max(0, entry.totalPurchased - entry.totalConsumed);
  }

  return Array.from(map.values()).sort((a, b) =>
    a.itemName.localeCompare(b.itemName),
  );
}
