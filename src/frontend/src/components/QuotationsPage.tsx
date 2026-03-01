import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Building2,
  CheckCircle,
  Download,
  FileText,
  Leaf,
  Loader2,
  RefreshCw,
  RotateCcw,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useReducer, useState } from "react";
import { toast } from "sonner";
import { QuotationStatus } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useCompanyProfile } from "../hooks/useCompanyProfile";
import { useProjects, useQuotations } from "../hooks/useQueries";
import { exportQuotationPDF } from "../utils/exportQuotationPDF";
import {
  type LocalQuotStatus,
  addRevision,
  getAllOverrides,
  getBaseProposalNumber,
  getMaxRevision,
  setQuotationOverride,
} from "../utils/quotationOverrides";

// ---- Effective status helpers ----

function getEffectiveStatus(
  quotId: string,
  backendStatus: QuotationStatus,
  overrides: Record<string, { status: LocalQuotStatus }>,
): LocalQuotStatus | QuotationStatus {
  const ov = overrides[quotId];
  if (ov?.status) return ov.status;
  return backendStatus;
}

// ---- Status display config ----

const statusColors: Record<string, string> = {
  [QuotationStatus.draft]: "bg-amber-50 text-amber-700 border border-amber-200",
  [QuotationStatus.sent]:
    "bg-navy-light/15 text-navy border border-navy-light/30",
  [QuotationStatus.accepted]:
    "bg-green-100 text-green-700 border border-green-200",
  [QuotationStatus.rejected]:
    "bg-destructive/10 text-red-600 border border-red-200",
  clientApproved:
    "bg-emerald-100 text-emerald-700 border border-emerald-300 font-semibold",
  clientRejected: "bg-red-100 text-red-700 border border-red-300 font-semibold",
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
};

const statusLabels: Record<string, string> = {
  [QuotationStatus.draft]: "Pending",
  [QuotationStatus.sent]: "Sent",
  [QuotationStatus.accepted]: "Accepted",
  [QuotationStatus.rejected]: "Rejected",
  clientApproved: "✓ Approved",
  clientRejected: "✗ Rejected",
  pending: "Pending",
};

interface QuotationsPageProps {
  activeRole?: string;
}

export function QuotationsPage({ activeRole }: QuotationsPageProps) {
  const { data: quotations, isLoading, refetch } = useQuotations();
  const { data: projects } = useProjects();
  const { actor } = useActor();
  const { profile } = useCompanyProfile();
  const [exportingId, setExportingId] = useState<bigint | null>(null);
  const [revisingId, setRevisingId] = useState<bigint | null>(null);
  // Force re-render after local override mutations
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  const isOwner = activeRole === "owner";

  // Merge local overrides
  const overrides = getAllOverrides();

  const hasCompanyProfile =
    profile.companyName ||
    profile.companyAddress ||
    profile.gstNumber ||
    profile.logoBase64;

  const totalValue = quotations?.reduce((sum, q) => sum + q.totalCost, 0) ?? 0;

  // Count "clientApproved" from overrides + "accepted" from backend (not overridden)
  const approvedCount =
    quotations?.filter((q) => {
      const eff = getEffectiveStatus(q.id.toString(), q.status, overrides);
      return eff === "clientApproved" || eff === QuotationStatus.accepted;
    }).length ?? 0;

  const avgPayback =
    quotations && quotations.length > 0
      ? quotations.reduce((sum, q) => sum + q.paybackYears, 0) /
        quotations.length
      : 0;

  // ---- Handlers ----

  async function handleExportPDF(quotationId: bigint) {
    const quotation = quotations?.find((q) => q.id === quotationId);
    if (!quotation) return;

    setExportingId(quotationId);
    try {
      const matchingProject = projects?.find(
        (p) => p.clientName === quotation.clientName,
      );

      let moqItems: import("../backend.d").MOQItem[] = [];
      if (matchingProject && actor) {
        try {
          moqItems = await actor.listMOQ(matchingProject.id);
        } catch {
          moqItems = [];
        }
      }

      await exportQuotationPDF(quotation, profile, matchingProject, moqItems);
      toast.success(`PDF exported: ${quotation.proposalNumber}`);
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setExportingId(null);
    }
  }

  function handleApprove(quotationId: string) {
    setQuotationOverride(quotationId, "clientApproved");
    forceUpdate();
    toast.success("Quotation approved");
  }

  function handleReject(quotationId: string) {
    setQuotationOverride(quotationId, "clientRejected");
    forceUpdate();
    toast.success("Quotation rejected");
  }

  function handleResetStatus(quotationId: string) {
    setQuotationOverride(quotationId, null);
    forceUpdate();
    toast.success("Quotation status reset to Pending");
  }

  async function handleRevise(quotationId: bigint) {
    if (!actor) return;
    const quotation = quotations?.find((q) => q.id === quotationId);
    if (!quotation) return;

    setRevisingId(quotationId);
    try {
      const base = getBaseProposalNumber(quotation.proposalNumber);
      const maxRev = getMaxRevision(base);
      const newRev = maxRev + 1;
      const newProposalNumber = `${base}-Rev${newRev}`;

      const newId = await actor.createQuotation(
        newProposalNumber,
        quotation.clientName,
        quotation.companyName,
        quotation.gst,
        quotation.totalCost,
        quotation.subsidy,
        quotation.paybackYears,
        quotation.annualSavings,
        quotation.irr,
        quotation.carbonSavings,
        QuotationStatus.draft,
        quotation.termsAndConditions,
      );

      addRevision({
        id: newId.toString(),
        rev: newRev,
        proposalNumber: newProposalNumber,
        baseProposalNumber: base,
      });

      await refetch();
      toast.success(`Revision Rev${newRev} created: ${newProposalNumber}`);
    } catch (err) {
      console.error("Revision error:", err);
      toast.error("Failed to create revision");
    } finally {
      setRevisingId(null);
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-5">
        {/* Company letterhead banner */}
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4">
            {hasCompanyProfile ? (
              <div className="flex items-start gap-4">
                {profile.logoBase64 ? (
                  <div className="flex-shrink-0">
                    <img
                      src={profile.logoBase64}
                      alt="Company logo"
                      className="h-12 w-auto object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-navy/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-navy/40" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {profile.companyName && (
                    <p className="text-base font-bold text-navy leading-tight font-display">
                      {profile.companyName}
                    </p>
                  )}
                  {profile.companyAddress && (
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {profile.companyAddress}
                    </p>
                  )}
                  {profile.gstNumber && (
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                      GSTIN: {profile.gstNumber}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-solar/20 border border-solar/40">
                    <span className="text-xs font-semibold text-solar-dark">
                      Quotation Header
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Building2 className="h-5 w-5 opacity-50 flex-shrink-0" />
                <p className="text-sm">
                  Set company details in Settings (gear icon, owner only) to
                  auto-populate quotation headers.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold font-display">Quotations</h1>
          <p className="text-sm text-muted-foreground">
            {quotations?.length ?? 0} proposals generated
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-navy" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Total Pipeline
                </p>
              </div>
              <p className="text-xl font-bold text-navy font-display">
                ₹{(totalValue / 100000).toFixed(1)}L
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Approved
                </p>
              </div>
              <p className="text-xl font-bold text-green-600">
                {approvedCount}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Leaf className="h-4 w-4 text-solar-dark" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Avg Payback
                </p>
              </div>
              <p className="text-xl font-bold">{avgPayback.toFixed(1)} yrs</p>
            </CardContent>
          </Card>
        </div>

        {/* Owner-only info tip */}
        {isOwner && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-solar/8 border border-solar/25 rounded-lg px-4 py-2.5">
            <CheckCircle className="h-3.5 w-3.5 text-solar-dark flex-shrink-0" />
            <span>
              As Owner, you can <strong className="text-navy">Approve</strong>{" "}
              or <strong className="text-destructive">Reject</strong>{" "}
              quotations. Approved quotations unlock MOQ Excel export.
            </span>
          </div>
        )}

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-0">
                {["a", "b", "c"].map((k) => (
                  <div
                    key={k}
                    className="flex gap-4 p-3 border-b border-border"
                  >
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20 ml-auto" />
                  </div>
                ))}
              </div>
            ) : !quotations || quotations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="font-medium">No quotations yet</p>
                <p className="text-sm mt-1">
                  Complete a project wizard to generate quotations
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proposal #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead className="text-right">Total Cost</TableHead>
                    <TableHead className="text-right">Annual Savings</TableHead>
                    <TableHead className="text-right">Payback</TableHead>
                    <TableHead className="text-right">IRR</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotations.map((q) => {
                    const idStr = q.id.toString();
                    const effectiveStatus = getEffectiveStatus(
                      idStr,
                      q.status,
                      overrides,
                    );
                    const isExporting = exportingId === q.id;
                    const isRevising = revisingId === q.id;

                    const alreadyActioned =
                      effectiveStatus === "clientApproved" ||
                      effectiveStatus === "clientRejected";

                    const isApproved = effectiveStatus === "clientApproved";
                    const isRejected = effectiveStatus === "clientRejected";

                    // Show "Revise" button only when it's not a draft (has been sent/reviewed)
                    const canRevise =
                      q.status !== QuotationStatus.draft ||
                      effectiveStatus === "clientApproved" ||
                      effectiveStatus === "clientRejected";

                    return (
                      <TableRow key={idStr}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {q.proposalNumber}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {q.clientName}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {q.companyName}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-navy">
                          ₹{q.totalCost.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-sm text-green-600">
                          ₹{q.annualSavings.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {q.paybackYears.toFixed(1)} yrs
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {q.irr.toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-xs ${effectiveStatus != null ? statusColors[effectiveStatus] : statusColors[q.status]}`}
                          >
                            {effectiveStatus != null
                              ? (statusLabels[effectiveStatus] ??
                                effectiveStatus)
                              : (statusLabels[q.status] ?? q.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Approve / Reject / Reset — owner only, always visible */}
                            {isOwner && (
                              <>
                                {alreadyActioned ? (
                                  /* When already actioned, show reset button */
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                                        onClick={() => handleResetStatus(idStr)}
                                        aria-label="Reset to Pending"
                                      >
                                        <RotateCcw className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      <p>Reset to Pending</p>
                                    </TooltipContent>
                                  </Tooltip>
                                ) : null}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className={`h-8 w-8 p-0 ${isApproved ? "text-emerald-700 bg-emerald-50" : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"}`}
                                      onClick={() => handleApprove(idStr)}
                                      aria-label="Approve quotation"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p>
                                      {isApproved
                                        ? "Already Approved"
                                        : "Approve quotation"}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className={`h-8 w-8 p-0 ${isRejected ? "text-red-700 bg-red-50" : "text-red-500 hover:bg-red-50 hover:text-red-700"}`}
                                      onClick={() => handleReject(idStr)}
                                      aria-label="Reject quotation"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p>
                                      {isRejected
                                        ? "Already Rejected"
                                        : "Reject quotation"}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </>
                            )}

                            {/* Revise — visible when not draft */}
                            {canRevise && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-navy hover:bg-navy/10"
                                    onClick={() => handleRevise(q.id)}
                                    disabled={isRevising}
                                    aria-label="Create revision"
                                  >
                                    {isRevising ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <RefreshCw className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p>Create revision (Rev+1)</p>
                                </TooltipContent>
                              </Tooltip>
                            )}

                            {/* Export PDF */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-navy hover:bg-navy/10 hover:text-navy"
                                  onClick={() => handleExportPDF(q.id)}
                                  disabled={isExporting}
                                  aria-label="Export as PDF"
                                >
                                  {isExporting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Download className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left">
                                <p>Export as PDF</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
