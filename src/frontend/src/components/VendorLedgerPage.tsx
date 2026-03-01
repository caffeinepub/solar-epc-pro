import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookOpen, Building2, Eye, Search } from "lucide-react";
import { useState } from "react";
import {
  type AdvancePayment,
  type ProcurementEntry,
  type Vendor,
  getAdvancePayments,
  getBalanceDue,
  getProcurementEntries,
  getVendors,
} from "../utils/procurementStore";

// ─── Vendor Ledger Modal ────────────────────────────────────────────────────────
function VendorLedgerModal({
  vendor,
  onClose,
}: {
  vendor: Vendor;
  onClose: () => void;
}) {
  const entries: ProcurementEntry[] = getProcurementEntries().filter(
    (e) => e.vendorId === vendor.id,
  );
  const allAdvances: AdvancePayment[] = getAdvancePayments();

  const rows = entries.map((e) => {
    const paid = allAdvances
      .filter((a) => a.procurementEntryId === e.id)
      .reduce((s, a) => s + a.amount, 0);
    const balance = getBalanceDue(e.id);
    return { entry: e, paid, balance };
  });

  const grandTotal = rows.reduce((s, r) => s + r.entry.totalAmount, 0);
  const grandPaid = rows.reduce((s, r) => s + r.paid, 0);
  const grandBalance = rows.reduce((s, r) => s + r.balance, 0);

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            Vendor Ledger — {vendor.name}
          </DialogTitle>
        </DialogHeader>

        {/* Vendor info */}
        <div className="flex gap-6 py-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Address</p>
            <p className="font-medium">{vendor.address || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">GST No.</p>
            <p className="font-medium">
              {vendor.gstNo === "NA" ? (
                <Badge
                  variant="outline"
                  className="text-xs border-amber-400 text-amber-700 bg-amber-50"
                >
                  NA
                </Badge>
              ) : (
                vendor.gstNo
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Since</p>
            <p className="font-medium">
              {new Date(vendor.createdAt).toLocaleDateString("en-IN")}
            </p>
          </div>
        </div>

        <Separator />

        {/* Ledger table */}
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No invoices for this vendor yet.
          </p>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-semibold">
                    Invoice No.
                  </TableHead>
                  <TableHead className="text-xs font-semibold">Date</TableHead>
                  <TableHead className="text-xs font-semibold text-right">
                    Total Amount (₹)
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-right">
                    Advance Paid (₹)
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-right">
                    Balance Due (₹)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ entry, paid, balance }) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-sm font-medium">
                      {entry.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(entry.invoiceDate).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell className="text-sm text-right font-semibold">
                      {entry.totalAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-sm text-right text-green-700 font-medium">
                      {paid > 0
                        ? paid.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {balance > 0 ? (
                        <span className="text-sm font-bold text-destructive">
                          {balance.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                          Paid
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {/* Grand totals row */}
              <TableFooter>
                <TableRow className="bg-muted/60 font-semibold">
                  <TableCell colSpan={2} className="text-sm font-bold py-3">
                    Grand Total ({rows.length} invoices)
                  </TableCell>
                  <TableCell className="text-sm text-right font-bold text-primary">
                    ₹
                    {grandTotal.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-sm text-right font-bold text-green-700">
                    ₹
                    {grandPaid.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell
                    className={`text-sm text-right font-bold ${grandBalance > 0 ? "text-destructive" : "text-green-700"}`}
                  >
                    {grandBalance > 0
                      ? `₹${grandBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                      : "Fully Paid ✓"}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
interface VendorLedgerPageProps {
  activeRole: string;
}

export function VendorLedgerPage({ activeRole }: VendorLedgerPageProps) {
  const canAccess = activeRole === "owner" || activeRole === "procurement";

  const [vendors] = useState<Vendor[]>(() => getVendors());
  const [entries] = useState<ProcurementEntry[]>(() => getProcurementEntries());
  const [advances] = useState<AdvancePayment[]>(() => getAdvancePayments());
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [search, setSearch] = useState("");

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <BookOpen className="h-12 w-12 text-muted-foreground opacity-30" />
        <p className="text-muted-foreground font-medium">Access Restricted</p>
        <p className="text-sm text-muted-foreground">
          Vendor Ledger is accessible to Owner and Procurement roles only.
        </p>
      </div>
    );
  }

  const filtered = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.gstNo.toLowerCase().includes(search.toLowerCase()),
  );

  // Compute per-vendor totals
  const vendorStats = (vendorId: string) => {
    const vendorEntries = entries.filter((e) => e.vendorId === vendorId);
    const totalInvoiced = vendorEntries.reduce((s, e) => s + e.totalAmount, 0);
    const totalPaid = advances
      .filter((a) => vendorEntries.some((e) => e.id === a.procurementEntryId))
      .reduce((s, a) => s + a.amount, 0);
    const balance = Math.max(0, totalInvoiced - totalPaid);
    return { totalInvoiced, totalPaid, balance };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground font-display">
          Vendor Ledger
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Payment history and outstanding balances per vendor
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total Vendors</p>
            <p className="text-2xl font-bold text-foreground font-display">
              {vendors.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total Invoiced</p>
            <p className="text-2xl font-bold text-primary font-display">
              ₹
              {entries
                .reduce((s, e) => s + e.totalAmount, 0)
                .toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total Balance Due</p>
            <p className="text-2xl font-bold text-destructive font-display">
              ₹
              {entries
                .reduce((s, e) => s + getBalanceDue(e.id), 0)
                .toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search vendors..."
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Vendors list */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-10 w-10 text-muted-foreground opacity-20 mb-3" />
            <p className="text-muted-foreground text-sm">
              {search
                ? "No vendors match your search"
                : "No vendors registered yet"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Vendors are auto-created when you add procurement entries
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">
              All Vendors ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs font-semibold">
                      Vendor Name
                    </TableHead>
                    <TableHead className="text-xs font-semibold">
                      Address
                    </TableHead>
                    <TableHead className="text-xs font-semibold">
                      GST No.
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-right">
                      Total Invoiced
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-right">
                      Advance Paid
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-right">
                      Balance Due
                    </TableHead>
                    <TableHead className="text-xs font-semibold">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((vendor) => {
                    const { totalInvoiced, totalPaid, balance } = vendorStats(
                      vendor.id,
                    );
                    return (
                      <TableRow key={vendor.id} className="hover:bg-muted/20">
                        <TableCell className="font-medium text-sm">
                          {vendor.name}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {vendor.address || "—"}
                        </TableCell>
                        <TableCell>
                          {vendor.gstNo === "NA" ? (
                            <Badge
                              variant="outline"
                              className="text-xs border-amber-400 text-amber-700 bg-amber-50"
                            >
                              NA
                            </Badge>
                          ) : (
                            <span className="text-xs font-mono text-muted-foreground">
                              {vendor.gstNo}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold">
                          ₹{totalInvoiced.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-right text-sm text-green-700 font-medium">
                          ₹{totalPaid.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-right">
                          {balance > 0 ? (
                            <span className="text-sm font-bold text-destructive">
                              ₹{balance.toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                              Paid
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 text-primary"
                            onClick={() => setSelectedVendor(vendor)}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Ledger
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedVendor && (
        <VendorLedgerModal
          vendor={selectedVendor}
          onClose={() => setSelectedVendor(null)}
        />
      )}
    </div>
  );
}
