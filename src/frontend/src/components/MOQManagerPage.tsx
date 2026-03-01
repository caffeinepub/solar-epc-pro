import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ClipboardList,
  FileSpreadsheet,
  IndianRupee,
  Loader2,
  PackagePlus,
  Save,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type MOQItem,
  useAddMOQItem,
  useDeleteMOQItem,
  useMOQ,
  useProjects,
  useQuotations,
  useUpdateMOQItemFull,
} from "../hooks/useQueries";
import { exportMOQToExcel } from "../utils/exportMOQExcel";
import { getAllOverrides } from "../utils/quotationOverrides";

const CATEGORIES = [
  "Solar PV",
  "Battery Bank",
  "Electrical BoS",
  "Cabling",
  "Mounting Structure",
  "Miscellaneous",
];

const UNITS = ["Nos", "Mtr", "Set", "Pkt", "kg", "Ltr"];

const CATEGORY_COLORS: Record<string, string> = {
  "Solar PV": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "Battery Bank": "bg-blue-100 text-blue-800 border-blue-300",
  "Electrical BoS": "bg-purple-100 text-purple-800 border-purple-300",
  Cabling: "bg-orange-100 text-orange-800 border-orange-300",
  "Mounting Structure": "bg-green-100 text-green-800 border-green-300",
  Miscellaneous: "bg-gray-100 text-gray-700 border-gray-300",
};

type EditableRow = {
  itemName: string;
  category: string;
  quantity: string;
  unit: string;
  brand: string;
  unitPrice: string;
};

function AddItemDialog({
  projectId,
  onAdded,
}: {
  projectId: bigint;
  onAdded: () => void;
}) {
  const addMOQItem = useAddMOQItem();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<EditableRow>({
    itemName: "",
    category: CATEGORIES[0],
    quantity: "1",
    unit: "Nos",
    brand: "",
    unitPrice: "0",
  });

  const handleSubmit = async () => {
    if (!form.itemName.trim()) {
      toast.error("Item name is required");
      return;
    }
    const qty = Number.parseFloat(form.quantity) || 0;
    const price = Number.parseFloat(form.unitPrice) || 0;
    if (qty <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }
    try {
      await addMOQItem.mutateAsync({
        projectId,
        itemName: form.itemName.trim(),
        category: form.category,
        quantity: qty,
        unit: form.unit,
        brand: form.brand.trim(),
        unitPrice: price,
      });
      toast.success("Item added successfully");
      setOpen(false);
      setForm({
        itemName: "",
        category: CATEGORIES[0],
        quantity: "1",
        unit: "Nos",
        brand: "",
        unitPrice: "0",
      });
      onAdded();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to add item: ${msg}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-navy hover:bg-navy/90 text-white" size="sm">
          <PackagePlus className="h-4 w-4" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <PackagePlus className="h-5 w-5 text-navy" />
            Add MOQ Item
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Item Name *
              </Label>
              <Input
                className="mt-1.5"
                placeholder="e.g. Monocrystalline PV Module 540Wp"
                value={form.itemName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, itemName: e.target.value }))
                }
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Category *
              </Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Brand
              </Label>
              <Input
                className="mt-1.5"
                placeholder="e.g. Waaree, Sungrow"
                value={form.brand}
                onChange={(e) =>
                  setForm((f) => ({ ...f, brand: e.target.value }))
                }
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Quantity *
              </Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                className="mt-1.5"
                value={form.quantity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, quantity: e.target.value }))
                }
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Unit
              </Label>
              <Select
                value={form.unit}
                onValueChange={(v) => setForm((f) => ({ ...f, unit: v }))}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Unit Price (₹)
              </Label>
              <div className="relative mt-1.5">
                <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className="pl-7"
                  placeholder="0.00"
                  value={form.unitPrice}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, unitPrice: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 rounded-lg bg-solar/10 border border-solar/30">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Total Price:</span>
              <span className="font-bold text-navy text-base">
                ₹
                {(
                  (Number.parseFloat(form.quantity) || 0) *
                  (Number.parseFloat(form.unitPrice) || 0)
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={addMOQItem.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={addMOQItem.isPending}
            className="gap-2 bg-navy hover:bg-navy/90 text-white"
          >
            {addMOQItem.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PackagePlus className="h-4 w-4" />
            )}
            {addMOQItem.isPending ? "Adding..." : "Add Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type RowEdits = Record<string, Partial<EditableRow>>;

function MOQCategorySection({
  category,
  items,
  onDelete,
  onSave,
}: {
  category: string;
  items: MOQItem[];
  onDelete: (id: bigint) => Promise<void>;
  onSave: (item: MOQItem, edits: EditableRow) => Promise<void>;
}) {
  const [rowEdits, setRowEdits] = useState<RowEdits>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});

  const getEdit = (item: MOQItem): EditableRow => {
    const key = item.id.toString();
    const edit = rowEdits[key];
    return {
      itemName: edit?.itemName ?? item.itemName,
      category: edit?.category ?? item.category,
      quantity: edit?.quantity ?? String(item.quantity),
      unit: edit?.unit ?? item.unit,
      brand: edit?.brand ?? item.brand,
      unitPrice: edit?.unitPrice ?? String(item.unitPrice),
    };
  };

  const updateEdit = (
    itemId: bigint,
    field: keyof EditableRow,
    value: string,
  ) => {
    const key = itemId.toString();
    setRowEdits((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleSave = async (item: MOQItem) => {
    const key = item.id.toString();
    const edits = getEdit(item);
    setSaving((prev) => ({ ...prev, [key]: true }));
    try {
      await onSave(item, edits);
      // Clear edit state after successful save
      setRowEdits((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleDelete = async (item: MOQItem) => {
    const key = item.id.toString();
    setDeleting((prev) => ({ ...prev, [key]: true }));
    try {
      await onDelete(item.id);
    } finally {
      setDeleting((prev) => ({ ...prev, [key]: false }));
    }
  };

  const categoryBadgeClass =
    CATEGORY_COLORS[category] || "bg-gray-100 text-gray-700 border-gray-300";

  const categoryTotal = items.reduce((sum, item) => {
    const edit = rowEdits[item.id.toString()];
    const qty = edit?.quantity
      ? Number.parseFloat(edit.quantity) || item.quantity
      : item.quantity;
    const price = edit?.unitPrice
      ? Number.parseFloat(edit.unitPrice) || item.unitPrice
      : item.unitPrice;
    return sum + qty * price;
  }, 0);

  return (
    <div className="rounded-xl border border-border overflow-hidden shadow-sm">
      {/* Category header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-navy/5 border-b border-border">
        <div className="flex items-center gap-2">
          <Badge
            className={`text-xs font-semibold border px-2.5 py-0.5 ${categoryBadgeClass}`}
          >
            {category}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </span>
        </div>
        <span className="text-xs font-semibold text-navy">
          ₹{Math.round(categoryTotal).toLocaleString()}
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="text-xs font-semibold w-[22%]">
              Item Name
            </TableHead>
            <TableHead className="text-xs font-semibold w-[14%]">
              Category
            </TableHead>
            <TableHead className="text-xs font-semibold w-[16%]">
              Brand
            </TableHead>
            <TableHead className="text-xs font-semibold w-[8%] text-right">
              Qty
            </TableHead>
            <TableHead className="text-xs font-semibold w-[7%]">Unit</TableHead>
            <TableHead className="text-xs font-semibold w-[12%] text-right">
              Unit Price (₹)
            </TableHead>
            <TableHead className="text-xs font-semibold w-[12%] text-right">
              Total (₹)
            </TableHead>
            <TableHead className="text-xs font-semibold w-[9%] text-center">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const key = item.id.toString();
            const edit = getEdit(item);
            const isDirty =
              rowEdits[key] && Object.keys(rowEdits[key]).length > 0;
            const isSaving = saving[key];
            const isDeleting = deleting[key];
            const rowTotal =
              (Number.parseFloat(edit.quantity) || 0) *
              (Number.parseFloat(edit.unitPrice) || 0);

            return (
              <TableRow
                key={key}
                className={`
                  transition-colors group
                  ${isDirty ? "bg-solar/8 hover:bg-solar/12" : "hover:bg-solar/5"}
                  ${isDeleting ? "opacity-50" : ""}
                `}
              >
                {/* Item Name */}
                <TableCell className="py-1.5 pr-1">
                  <Input
                    value={edit.itemName}
                    onChange={(e) =>
                      updateEdit(item.id, "itemName", e.target.value)
                    }
                    className="h-7 text-xs border-transparent bg-transparent hover:border-border focus:border-solar focus:bg-white transition-colors px-2"
                    placeholder="Item name"
                  />
                </TableCell>

                {/* Category */}
                <TableCell className="py-1.5 pr-1">
                  <Select
                    value={edit.category}
                    onValueChange={(v) => updateEdit(item.id, "category", v)}
                  >
                    <SelectTrigger className="h-7 text-xs border-transparent bg-transparent hover:border-border focus:border-solar transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c} className="text-xs">
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>

                {/* Brand */}
                <TableCell className="py-1.5 pr-1">
                  <Input
                    value={edit.brand}
                    onChange={(e) =>
                      updateEdit(item.id, "brand", e.target.value)
                    }
                    className="h-7 text-xs border-transparent bg-transparent hover:border-border focus:border-solar focus:bg-white transition-colors px-2"
                    placeholder="Brand"
                  />
                </TableCell>

                {/* Quantity */}
                <TableCell className="py-1.5 pr-1">
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={edit.quantity}
                    onChange={(e) =>
                      updateEdit(item.id, "quantity", e.target.value)
                    }
                    className="h-7 text-xs border-transparent bg-transparent hover:border-border focus:border-solar focus:bg-white transition-colors px-2 text-right"
                  />
                </TableCell>

                {/* Unit */}
                <TableCell className="py-1.5 pr-1">
                  <Select
                    value={edit.unit}
                    onValueChange={(v) => updateEdit(item.id, "unit", v)}
                  >
                    <SelectTrigger className="h-7 text-xs border-transparent bg-transparent hover:border-border focus:border-solar transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((u) => (
                        <SelectItem key={u} value={u} className="text-xs">
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>

                {/* Unit Price */}
                <TableCell className="py-1.5 pr-1">
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                      ₹
                    </span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={edit.unitPrice}
                      onChange={(e) =>
                        updateEdit(item.id, "unitPrice", e.target.value)
                      }
                      className="h-7 text-xs border-transparent bg-transparent hover:border-border focus:border-solar focus:bg-white transition-colors pl-5 pr-2 text-right"
                    />
                  </div>
                </TableCell>

                {/* Total */}
                <TableCell className="py-1.5 text-right">
                  <span
                    className={`text-xs font-semibold tabular-nums ${isDirty ? "text-solar-dark" : "text-foreground"}`}
                  >
                    ₹{Math.round(rowTotal).toLocaleString()}
                  </span>
                </TableCell>

                {/* Actions */}
                <TableCell className="py-1.5">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-7 w-7 rounded-md transition-all ${
                        isDirty
                          ? "text-navy bg-navy/10 hover:bg-navy hover:text-white"
                          : "text-muted-foreground hover:text-navy opacity-0 group-hover:opacity-100"
                      }`}
                      onClick={() => handleSave(item)}
                      disabled={isSaving || isDeleting}
                      title="Save changes"
                    >
                      {isSaving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                      onClick={() => handleDelete(item)}
                      disabled={isSaving || isDeleting}
                      title="Delete item"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export function MOQManagerPage({ activeRole }: { activeRole?: string }) {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: quotations } = useQuotations();
  const [selectedProjectId, setSelectedProjectId] = useState<bigint | null>(
    null,
  );
  const { data: moqItems, isLoading: moqLoading } = useMOQ(selectedProjectId);
  const deleteMOQItem = useDeleteMOQItem();
  const updateMOQItem = useUpdateMOQItemFull();

  const selectedProject = projects?.find((p) => p.id === selectedProjectId);

  // Check if any quotation for the selected project is clientApproved
  const overrides = getAllOverrides();
  const isProjectQuotationApproved = (() => {
    if (!selectedProject || !quotations) return false;
    return quotations.some((q) => {
      if (q.clientName !== selectedProject.clientName) return false;
      const ov = overrides[q.id.toString()];
      return ov?.status === "clientApproved";
    });
  })();

  const handleExportExcel = () => {
    if (!selectedProject || !moqItems || moqItems.length === 0) return;
    try {
      exportMOQToExcel(selectedProject, moqItems);
      toast.success(
        `Excel exported: MOQ_${selectedProject.clientName.replace(/\s+/g, "_")}`,
      );
    } catch (err) {
      console.error("Excel export error:", err);
      toast.error("Failed to export Excel");
    }
  };

  void activeRole; // Available for future role-based UI gating if needed

  const moqByCategory =
    moqItems?.reduce(
      (acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
      },
      {} as Record<string, MOQItem[]>,
    ) ?? {};

  const totalMOQCost =
    moqItems?.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) ??
    0;

  const handleDelete = async (id: bigint) => {
    try {
      await deleteMOQItem.mutateAsync(id);
      toast.success("Item deleted");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to delete: ${msg}`);
    }
  };

  const handleSave = async (item: MOQItem, edits: EditableRow) => {
    try {
      await updateMOQItem.mutateAsync({
        id: item.id,
        itemName: edits.itemName.trim() || item.itemName,
        category: edits.category,
        quantity: Number.parseFloat(edits.quantity) || item.quantity,
        unit: edits.unit,
        brand: edits.brand.trim(),
        unitPrice: Number.parseFloat(edits.unitPrice) || 0,
      });
      toast.success("Item updated");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to save: ${msg}`);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 max-w-7xl">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-navy text-white">
                <ClipboardList className="h-5 w-5" />
              </div>
              MOQ Manager
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              View and edit Material Order Quantities for all projects. Add
              items, update prices, specs, and brand assignments.
            </p>
          </div>
          {selectedProjectId !== null && (
            <div className="flex items-center gap-2">
              {/* Export Excel — locked until a quotation for this project is approved */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`gap-2 ${
                        isProjectQuotationApproved
                          ? "border-emerald-400 text-emerald-700 hover:bg-emerald-50"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                      disabled={
                        !isProjectQuotationApproved ||
                        !moqItems ||
                        moqItems.length === 0
                      }
                      onClick={handleExportExcel}
                      aria-label="Export MOQ to Excel"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Export Excel
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {isProjectQuotationApproved ? (
                    <p>Export MOQ as Excel spreadsheet</p>
                  ) : (
                    <p>Approve a quotation first to unlock Excel export</p>
                  )}
                </TooltipContent>
              </Tooltip>
              <AddItemDialog
                projectId={selectedProjectId}
                onAdded={() => {
                  // React Query handles re-fetch via cache invalidation
                }}
              />
            </div>
          )}
        </div>

        {/* Project selector */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Select Project
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {projectsLoading ? (
              <Skeleton className="h-10 w-full max-w-md" />
            ) : !projects || projects.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <ClipboardList className="h-4 w-4" />
                No projects found. Create a project via the Project Wizard
                first.
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <Select
                  value={selectedProjectId?.toString() ?? ""}
                  onValueChange={(v) => setSelectedProjectId(BigInt(v))}
                >
                  <SelectTrigger className="w-full max-w-md h-10">
                    <SelectValue placeholder="Choose a project to manage its MOQ..." />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id.toString()} value={p.id.toString()}>
                        <span className="font-medium">{p.clientName}</span>
                        <span className="text-muted-foreground ml-2 text-xs">
                          — {p.systemSizeKW.toFixed(1)} kWp |{" "}
                          {p.systemType === "onGrid"
                            ? "On-Grid"
                            : p.systemType === "offGrid"
                              ? "Off-Grid"
                              : "Hybrid"}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedProject && (
                  <div className="flex gap-2 flex-wrap">
                    <Badge className="bg-solar/20 text-solar-dark border border-solar/40 text-xs font-semibold">
                      {selectedProject.systemSizeKW.toFixed(1)} kWp
                    </Badge>
                    <Badge className="bg-navy/10 text-navy border border-navy/20 text-xs">
                      {selectedProject.systemType === "onGrid"
                        ? "On-Grid"
                        : selectedProject.systemType === "offGrid"
                          ? "Off-Grid"
                          : "Hybrid"}
                    </Badge>
                    <Badge className="bg-secondary text-secondary-foreground border border-border text-xs">
                      {selectedProject.installationType === "rccRooftop"
                        ? "RCC Rooftop"
                        : selectedProject.installationType === "sheetMetal"
                          ? "Sheet Metal"
                          : selectedProject.installationType === "groundMount"
                            ? "Ground Mount"
                            : "Other"}
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* MOQ content */}
        {selectedProjectId === null ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-2xl bg-navy/8 mb-4">
              <ClipboardList className="h-10 w-10 text-navy/40" />
            </div>
            <p className="text-base font-semibold text-foreground/60">
              No project selected
            </p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Select a project above to view and edit its Bill of Materials
              (MOQ).
            </p>
          </div>
        ) : moqLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((k) => (
              <div
                key={k}
                className="rounded-xl border border-border overflow-hidden"
              >
                <div className="h-10 bg-muted/30 border-b border-border" />
                {[1, 2, 3].map((r) => (
                  <div
                    key={r}
                    className="flex gap-3 p-3 border-b border-border"
                  >
                    <Skeleton className="h-7 flex-1" />
                    <Skeleton className="h-7 w-24" />
                    <Skeleton className="h-7 w-20" />
                    <Skeleton className="h-7 w-16" />
                    <Skeleton className="h-7 w-14" />
                    <Skeleton className="h-7 w-20" />
                    <Skeleton className="h-7 w-20" />
                    <Skeleton className="h-7 w-16" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : !moqItems || moqItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-2xl">
            <div className="p-4 rounded-2xl bg-solar/10 mb-4">
              <ClipboardList className="h-10 w-10 text-solar-dark/50" />
            </div>
            <p className="text-base font-semibold text-foreground/70">
              No MOQ items found
            </p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              This project has no Bill of Materials yet. Generate the MOQ via
              the Project Wizard or add items manually.
            </p>
            <div className="mt-4">
              <AddItemDialog projectId={selectedProjectId} onAdded={() => {}} />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Hint text */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-solar/8 border border-solar/25 rounded-lg px-4 py-2.5">
              <Save className="h-3.5 w-3.5 text-solar-dark" />
              <span>
                Edit any field inline. A{" "}
                <strong className="text-navy">Save</strong> button appears when
                a row has unsaved changes. Hover a row to reveal Delete.
              </span>
            </div>

            {/* Category sections */}
            {Object.entries(moqByCategory).map(([category, items]) => (
              <MOQCategorySection
                key={category}
                category={category}
                items={items}
                onDelete={handleDelete}
                onSave={handleSave}
              />
            ))}

            {/* Grand total */}
            <div className="rounded-xl border border-navy/20 bg-navy px-6 py-4 flex items-center justify-between shadow-md">
              <div>
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Total Material Cost
                </p>
                <p className="text-xs text-white/40 mt-0.5">
                  Exclusive of GST &middot; {moqItems.length} item
                  {moqItems.length !== 1 ? "s" : ""} across{" "}
                  {Object.keys(moqByCategory).length} categories
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-solar tabular-nums">
                  ₹{Math.round(totalMOQCost).toLocaleString()}
                </p>
                <p className="text-xs text-white/40 mt-0.5">Ex-GST</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
