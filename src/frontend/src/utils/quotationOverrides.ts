// Stores local approval/rejection overrides and revision info
// since backend doesn't support these status variants

export type LocalQuotStatus =
  | "clientApproved"
  | "clientRejected"
  | "pending"
  | null;

interface QuotOverride {
  status: LocalQuotStatus;
}

const OVERRIDES_KEY = "solar_epc_quot_overrides";
const REVISIONS_KEY = "solar_epc_quot_revisions";

export function getQuotationOverride(id: string): QuotOverride | null {
  const stored = localStorage.getItem(OVERRIDES_KEY);
  if (!stored) return null;
  const data = JSON.parse(stored) as Record<string, QuotOverride>;
  return data[id] ?? null;
}

export function setQuotationOverride(
  id: string,
  status: LocalQuotStatus,
): void {
  const stored = localStorage.getItem(OVERRIDES_KEY);
  const data = stored
    ? (JSON.parse(stored) as Record<string, QuotOverride>)
    : {};
  data[id] = { status };
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(data));
}

export function getAllOverrides(): Record<string, QuotOverride> {
  const stored = localStorage.getItem(OVERRIDES_KEY);
  return stored ? (JSON.parse(stored) as Record<string, QuotOverride>) : {};
}

// Revision tracking: stored locally
export interface RevisionRecord {
  id: string; // quotation backend id as string
  rev: number;
  proposalNumber: string;
  baseProposalNumber: string;
}

export function getRevisionsForBase(base: string): RevisionRecord[] {
  const stored = localStorage.getItem(REVISIONS_KEY);
  if (!stored) return [];
  const data = JSON.parse(stored) as Record<string, RevisionRecord[]>;
  return data[base] ?? [];
}

export function addRevision(record: RevisionRecord): void {
  const stored = localStorage.getItem(REVISIONS_KEY);
  const data = stored
    ? (JSON.parse(stored) as Record<string, RevisionRecord[]>)
    : {};
  if (!data[record.baseProposalNumber]) data[record.baseProposalNumber] = [];
  data[record.baseProposalNumber].push(record);
  localStorage.setItem(REVISIONS_KEY, JSON.stringify(data));
}

export function getMaxRevision(base: string): number {
  const revs = getRevisionsForBase(base);
  if (revs.length === 0) return 0;
  return Math.max(...revs.map((r) => r.rev));
}

/** Extract the base proposal number by stripping -Rev\d+ suffix */
export function getBaseProposalNumber(proposalNumber: string): string {
  return proposalNumber.replace(/-Rev\d+$/i, "");
}
