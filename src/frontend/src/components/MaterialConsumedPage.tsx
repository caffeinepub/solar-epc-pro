import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Hammer, Loader2, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useProjects } from "../hooks/useQueries";
import {
  createMaterialConsumed,
  getProcurementEntries,
  getStockAvailability,
} from "../utils/procurementStore";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AggregatedItem {
  itemName: string;
  category: string;
  unit: string;
  totalPurchased: number;
  stockAvailable: number;
  qtyConsumed: number;
  // Which entries contributed to this item for the project
  entryIds: string[];
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
interface MaterialConsumedPageProps {
  activeRole: string;
}

export function MaterialConsumedPage({
  activeRole,
}: MaterialConsumedPageProps) {
  const canAccess =
    activeRole === "siteEngineer" ||
    activeRole === "owner" ||
    activeRole === "admin";

  const { data: projects = [], isLoading: projectsLoading } = useProjects();

  const [selectedProjectId, setSelectedProjectId] = useState<string>("none");
  const [items, setItems] = useState<AggregatedItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Build aggregated items for the selected project
  const loadProjectItems = (projectId: string) => {
    if (projectId === "none") {
      setItems([]);
      return;
    }

    const entries = getProcurementEntries().filter(
      (e) => e.projectId === projectId,
    );

    // Aggregate by itemName (case-insensitive)
    const map = new Map<
      string,
      {
        itemName: string;
        category: string;
        unit: string;
        totalPurchased: number;
        entryIds: string[];
      }
    >();

    for (const entry of entries) {
      for (const item of entry.items) {
        const key = item.itemName.trim().toLowerCase();
        const existing = map.get(key);
        if (existing) {
          existing.totalPurchased += item.quantity;
          if (!existing.entryIds.includes(entry.id)) {
            existing.entryIds.push(entry.id);
          }
        } else {
          map.set(key, {
            itemName: item.itemName,
            category: item.category,
            unit: item.unit,
            totalPurchased: item.quantity,
            entryIds: [entry.id],
          });
        }
      }
    }

    const aggregated: AggregatedItem[] = Array.from(map.values()).map((v) => ({
      ...v,
      stockAvailable: getStockAvailability(v.itemName),
      qtyConsumed: 0,
    }));

    aggregated.sort(
      (a, b) =>
        a.category.localeCompare(b.category) ||
        a.itemName.localeCompare(b.itemName),
    );

    setItems(aggregated);
  };

  const updateConsumed = (itemName: string, qty: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.itemName.trim().toLowerCase() === itemName.trim().toLowerCase()
          ? { ...item, qtyConsumed: Math.max(0, qty) }
          : item,
      ),
    );
  };

  const handleSubmit = async () => {
    const toConsume = items.filter((i) => i.qtyConsumed > 0);

    if (toConsume.length === 0) {
      toast.error("Enter quantity consumed for at least one item");
      return;
    }

    for (const item of toConsume) {
      if (item.qtyConsumed > item.stockAvailable) {
        toast.error(
          `Cannot consume ${item.qtyConsumed} ${item.unit} of "${item.itemName}" — only ${item.stockAvailable} in stock`,
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      for (const item of toConsume) {
        createMaterialConsumed({
          projectId: selectedProjectId,
          procurementEntryId: item.entryIds[0] ?? "",
          itemName: item.itemName,
          category: item.category,
          quantityConsumed: item.qtyConsumed,
          unit: item.unit,
          consumedBy: activeRole,
        });
      }

      toast.success(
        `Material consumption recorded for ${toConsume.length} item${toConsume.length > 1 ? "s" : ""}`,
      );

      // Refresh stock availability
      loadProjectItems(selectedProjectId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to record: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Hammer className="h-12 w-12 text-muted-foreground opacity-30" />
        <p className="text-muted-foreground font-medium">Access Restricted</p>
        <p className="text-sm text-muted-foreground">
          Material consumption is accessible to Site Engineers, Owners, and
          Admins.
        </p>
      </div>
    );
  }

  const selectedProject = projects.find(
    (p) => String(p.id) === selectedProjectId,
  );

  const hasItems = items.length > 0;
  const toConsumeCount = items.filter((i) => i.qtyConsumed > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground font-display">
          Material Consumed
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Record material usage after installation and commissioning
        </p>
      </div>

      {/* Step 1: Select Project */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
              1
            </span>
            Select Project
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs space-y-1">
            <Label className="text-xs text-muted-foreground">Project</Label>
            {projectsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading projects...
              </div>
            ) : (
              <Select
                value={selectedProjectId}
                onValueChange={(v) => {
                  setSelectedProjectId(v);
                  loadProjectItems(v);
                }}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select a project..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Select project —</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={String(p.id)} value={String(p.id)}>
                      {p.clientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Enter consumption */}
      {selectedProjectId !== "none" && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                2
              </span>
              Purchased Materials — {selectedProject?.clientName}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!hasItems ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <Package className="h-10 w-10 text-muted-foreground opacity-20 mb-3" />
                <p className="text-muted-foreground text-sm font-medium">
                  No purchased materials for this project
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add procurement entries linked to this project first
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-xs font-semibold">
                          Item Name
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Category
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-right">
                          Purchased Qty
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Unit
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-center">
                          Stock Available
                        </TableHead>
                        <TableHead className="text-xs font-semibold w-[140px]">
                          Qty Consumed
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow
                          key={item.itemName}
                          className={item.qtyConsumed > 0 ? "bg-solar/10" : ""}
                        >
                          <TableCell className="text-sm font-medium">
                            {item.itemName}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {item.category}
                          </TableCell>
                          <TableCell className="text-sm text-right">
                            {item.totalPurchased}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {item.unit}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.stockAvailable > 0 ? (
                              <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                                {item.stockAvailable} {item.unit}
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-xs border-red-400 text-red-700 bg-red-50"
                              >
                                Out of stock
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              max={item.stockAvailable}
                              value={item.qtyConsumed || ""}
                              onChange={(e) =>
                                updateConsumed(
                                  item.itemName,
                                  Number(e.target.value),
                                )
                              }
                              placeholder="0"
                              className={`h-8 text-sm w-24 ${
                                item.qtyConsumed > item.stockAvailable
                                  ? "border-destructive focus-visible:ring-destructive"
                                  : ""
                              }`}
                              disabled={item.stockAvailable === 0}
                            />
                            {item.qtyConsumed > item.stockAvailable && (
                              <p className="text-xs text-destructive mt-0.5">
                                Exceeds stock
                              </p>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Note: prices are intentionally not shown */}
                <div className="p-4 border-t border-border bg-muted/20">
                  <p className="text-xs text-muted-foreground mb-3">
                    * Prices are not shown to site engineers. Only quantities
                    are displayed.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {toConsumeCount > 0 ? (
                        <span className="text-foreground font-medium">
                          {toConsumeCount} item
                          {toConsumeCount > 1 ? "s" : ""} to record
                        </span>
                      ) : (
                        "Enter quantities to record consumption"
                      )}
                    </div>
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting || toConsumeCount === 0}
                      className="bg-primary text-primary-foreground"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Hammer className="h-4 w-4 mr-2" />
                      )}
                      {submitting ? "Recording..." : "Submit Consumption"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
