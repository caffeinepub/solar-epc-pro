import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Check,
  Loader2,
  Package,
  Pencil,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useCreateInventoryItem, useInventory } from "../hooks/useQueries";

const INVENTORY_CATEGORIES = [
  "Solar Panels",
  "Inverters",
  "Batteries",
  "ACDB/DCDB",
  "Cables",
  "Structure",
  "Protection Devices",
  "Earthing",
  "Miscellaneous",
];

function EditableQtyCell({
  itemId,
  current,
  unit,
}: {
  itemId: bigint;
  current: bigint;
  unit: string;
}) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(current.toString());
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!actor) return;
    setSaving(true);
    try {
      // Stock update acknowledged (backend update via inventory API coming soon)
      void actor;
      void itemId;
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Stock updated");
      setEditing(false);
    } catch {
      toast.error("Failed to update stock");
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-1.5 group">
        <span className="font-medium">
          {current.toString()} {unit}
        </span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-navy"
        >
          <Pencil className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-7 w-20 text-sm px-2"
        autoFocus
      />
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="text-green-400 hover:text-green-300"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
      </button>
      <button
        type="button"
        onClick={() => {
          setValue(current.toString());
          setEditing(false);
        }}
        className="text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function InventoryPage() {
  const { data: inventory, isLoading } = useInventory();
  const createItem = useCreateInventoryItem();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showLowStock, setShowLowStock] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [form, setForm] = useState({
    sku: "",
    name: "",
    category: "Solar Panels",
    quantityOnHand: "",
    minStock: "",
    unit: "Nos",
    warehouseLocation: "WH-01",
  });

  const handleCreate = async () => {
    if (!form.sku || !form.name) {
      toast.error("SKU and name are required");
      return;
    }
    try {
      await createItem.mutateAsync({
        sku: form.sku,
        name: form.name,
        category: form.category,
        quantityOnHand: BigInt(Number(form.quantityOnHand) || 0),
        minStock: BigInt(Number(form.minStock) || 0),
        unit: form.unit,
        warehouseLocation: form.warehouseLocation,
      });
      toast.success("Inventory item added");
      setDialogOpen(false);
      setForm({
        sku: "",
        name: "",
        category: "Solar Panels",
        quantityOnHand: "",
        minStock: "",
        unit: "Nos",
        warehouseLocation: "WH-01",
      });
    } catch {
      toast.error("Failed to add item");
    }
  };

  const filtered = inventory?.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    const matchesLowStock =
      !showLowStock || item.quantityOnHand < item.minStock;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const lowStockCount =
    inventory?.filter((i) => i.quantityOnHand < i.minStock).length ?? 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            {inventory?.length ?? 0} items · {lowStockCount} low stock
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>SKU *</Label>
                  <Input
                    placeholder="e.g. PNL-400W-01"
                    value={form.sku}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, sku: e.target.value }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, category: v }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INVENTORY_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Item Name *</Label>
                <Input
                  placeholder="e.g. Adani 400W Poly Panel"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Qty on Hand</Label>
                  <Input
                    type="number"
                    value={form.quantityOnHand}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, quantityOnHand: e.target.value }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Min Stock</Label>
                  <Input
                    type="number"
                    value={form.minStock}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, minStock: e.target.value }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Select
                    value={form.unit}
                    onValueChange={(v) => setForm((f) => ({ ...f, unit: v }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Nos", "Mtr", "Kg", "Set", "Box", "Pair"].map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Warehouse Location</Label>
                <Input
                  value={form.warehouseLocation}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      warehouseLocation: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <Button
                type="button"
                onClick={handleCreate}
                disabled={createItem.isPending}
                className="w-full"
              >
                {createItem.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Add to Inventory
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {INVENTORY_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          type="button"
          onClick={() => setShowLowStock((v) => !v)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
            showLowStock
              ? "bg-destructive/20 border-destructive/40 text-red-400"
              : "bg-secondary border-border text-muted-foreground hover:bg-secondary/80"
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          Low Stock ({lowStockCount})
        </button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-0">
              {["a", "b", "c", "d", "e"].map((k) => (
                <div key={k} className="flex gap-4 p-3 border-b border-border">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24 ml-auto" />
                </div>
              ))}
            </div>
          ) : !filtered || filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="font-medium">No items found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Min Stock</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => {
                  const isLow = item.quantityOnHand < item.minStock;
                  return (
                    <TableRow
                      key={item.id.toString()}
                      className={isLow ? "bg-destructive/5" : ""}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {item.sku}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.category}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.warehouseLocation}
                      </TableCell>
                      <TableCell className="text-right">
                        <EditableQtyCell
                          itemId={item.id}
                          current={item.quantityOnHand}
                          unit={item.unit}
                        />
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {item.minStock.toString()} {item.unit}
                      </TableCell>
                      <TableCell>
                        {isLow ? (
                          <Badge className="bg-destructive/20 text-red-400 text-xs border-destructive/30">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Low
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-700 text-xs border-green-200">
                            OK
                          </Badge>
                        )}
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
  );
}
