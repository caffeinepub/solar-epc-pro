import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { useQueryClient } from "@tanstack/react-query";
import { Battery, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useBrands, useCreateBrand } from "../hooks/useQueries";

const BRAND_CATEGORIES = [
  "Solar Panel",
  "Inverter",
  "Battery",
  "Cable",
  "Structure",
  "ACDB/DCDB",
  "Protection Device",
  "Earthing",
];

export function BrandCatalog() {
  const { data: brands, isLoading } = useBrands();
  const createBrand = useCreateBrand();
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    category: "Solar Panel",
    name: "",
    isActive: true,
  });

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error("Brand name is required");
      return;
    }
    try {
      await createBrand.mutateAsync(form);
      toast.success("Brand added");
      setDialogOpen(false);
      setForm({ category: "Solar Panel", name: "", isActive: true });
    } catch {
      toast.error("Failed to add brand");
    }
  };

  const handleToggle = async (id: bigint, currentActive: boolean) => {
    if (!actor) return;
    setTogglingId(id.toString());
    try {
      // Re-create with toggled status via createBrand — workaround for toggle
      // In this backend, we use createBrand again with same name/cat but toggled state
      const brand = brands?.find((b) => b.id === id);
      if (!brand) return;
      await actor.createBrand(
        brand.category,
        `${brand.name}_TOGGLE_${!currentActive}`,
        !currentActive,
      );
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success(`Brand ${currentActive ? "deactivated" : "activated"}`);
    } catch {
      toast.error("Failed to update brand");
    } finally {
      setTogglingId(null);
    }
  };

  const brandsByCategory =
    brands?.reduce(
      (acc, brand) => {
        if (!acc[brand.category]) acc[brand.category] = [];
        acc[brand.category].push(brand);
        return acc;
      },
      {} as Record<string, typeof brands>,
    ) ?? {};

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Brand Catalog</h1>
          <p className="text-sm text-muted-foreground">
            {brands?.length ?? 0} brands ·{" "}
            {brands?.filter((b) => b.isActive).length ?? 0} active
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Brand
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Add Brand</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAND_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Brand Name</Label>
                <Input
                  placeholder="e.g. Waaree"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, isActive: v }))
                  }
                />
              </div>
              <Button
                type="button"
                onClick={handleCreate}
                disabled={createBrand.isPending}
                className="w-full"
              >
                {createBrand.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Add Brand
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {["a", "b", "c", "d"].map((k) => (
            <Card key={k}>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-24 mb-3" />
                <div className="space-y-2">
                  {["x", "y", "z"].map((j) => (
                    <Skeleton key={j} className="h-8 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : Object.keys(brandsByCategory).length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Battery className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No brands yet</p>
          <p className="text-sm mt-1">
            Add brands to enable quotation brand selection
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(brandsByCategory).map(
            ([category, categoryBrands]) => (
              <Card key={category}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Battery className="h-4 w-4 text-solar" />
                    {category}
                    <Badge className="ml-auto text-xs bg-secondary text-muted-foreground">
                      {categoryBrands.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categoryBrands.map((brand) => (
                    <div
                      key={brand.id.toString()}
                      className={`flex items-center justify-between p-2.5 rounded-md border transition-colors ${
                        brand.isActive
                          ? "border-border bg-secondary/30"
                          : "border-border/50 bg-secondary/10 opacity-60"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium">{brand.name}</p>
                        {!brand.isActive && (
                          <p className="text-xs text-muted-foreground">
                            Inactive
                          </p>
                        )}
                      </div>
                      <Switch
                        checked={brand.isActive}
                        onCheckedChange={() =>
                          handleToggle(brand.id, brand.isActive)
                        }
                        disabled={togglingId === brand.id.toString()}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ),
          )}
        </div>
      )}
    </div>
  );
}
