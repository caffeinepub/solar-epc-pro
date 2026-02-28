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
import { FileText, Leaf, TrendingUp } from "lucide-react";
import { QuotationStatus } from "../backend.d";
import { useQuotations } from "../hooks/useQueries";

const statusColors: Record<string, string> = {
  [QuotationStatus.draft]: "bg-muted text-muted-foreground",
  [QuotationStatus.sent]: "bg-blue-500/20 text-blue-400",
  [QuotationStatus.accepted]: "bg-green-500/20 text-green-400",
  [QuotationStatus.rejected]: "bg-destructive/20 text-red-400",
};

const statusLabels: Record<string, string> = {
  [QuotationStatus.draft]: "Draft",
  [QuotationStatus.sent]: "Sent",
  [QuotationStatus.accepted]: "Accepted",
  [QuotationStatus.rejected]: "Rejected",
};

export function QuotationsPage() {
  const { data: quotations, isLoading } = useQuotations();

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
              <FileText className="h-4 w-4 text-solar" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Total Pipeline
              </p>
            </div>
            <p className="text-xl font-bold text-solar">
              ₹{(totalValue / 100000).toFixed(1)}L
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Accepted
              </p>
            </div>
            <p className="text-xl font-bold text-green-400">{acceptedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="h-4 w-4 text-emerald-400" />
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
                    <TableCell className="text-right font-semibold text-solar">
                      ₹{q.totalCost.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-sm text-green-400">
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
