import { Badge } from "@/components/ui/badge";
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
import { Building2, FileText, Leaf, TrendingUp } from "lucide-react";
import { QuotationStatus } from "../backend.d";
import { useCompanyProfile } from "../hooks/useCompanyProfile";
import { useQuotations } from "../hooks/useQueries";

const statusColors: Record<string, string> = {
  [QuotationStatus.draft]: "bg-muted text-muted-foreground",
  [QuotationStatus.sent]:
    "bg-navy-light/15 text-navy border border-navy-light/30",
  [QuotationStatus.accepted]:
    "bg-green-100 text-green-700 border border-green-200",
  [QuotationStatus.rejected]:
    "bg-destructive/10 text-red-600 border border-red-200",
};

const statusLabels: Record<string, string> = {
  [QuotationStatus.draft]: "Draft",
  [QuotationStatus.sent]: "Sent",
  [QuotationStatus.accepted]: "Accepted",
  [QuotationStatus.rejected]: "Rejected",
};

interface QuotationsPageProps {
  activeRole?: string;
}

export function QuotationsPage({
  activeRole: _activeRole,
}: QuotationsPageProps) {
  const { data: quotations, isLoading } = useQuotations();
  const { profile } = useCompanyProfile();

  const hasCompanyProfile =
    profile.companyName ||
    profile.companyAddress ||
    profile.gstNumber ||
    profile.logoBase64;

  const totalValue = quotations?.reduce((sum, q) => sum + q.totalCost, 0) ?? 0;
  const acceptedCount =
    quotations?.filter((q) => q.status === QuotationStatus.accepted).length ??
    0;
  const avgPayback =
    quotations && quotations.length > 0
      ? quotations.reduce((sum, q) => sum + q.paybackYears, 0) /
        quotations.length
      : 0;

  return (
    <div className="space-y-5">
      {/* Company letterhead banner */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-4">
          {hasCompanyProfile ? (
            <div className="flex items-start gap-4">
              {/* Logo */}
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
              {/* Company info */}
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
                Accepted
              </p>
            </div>
            <p className="text-xl font-bold text-green-600">{acceptedCount}</p>
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

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-0">
              {["a", "b", "c"].map((k) => (
                <div key={k} className="flex gap-4 p-3 border-b border-border">
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotations.map((q) => (
                  <TableRow key={q.id.toString()}>
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
                      <Badge className={`text-xs ${statusColors[q.status]}`}>
                        {statusLabels[q.status] ?? q.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
