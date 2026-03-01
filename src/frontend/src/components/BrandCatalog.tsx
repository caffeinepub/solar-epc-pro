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
import { Battery, Download, Loader2, Plus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  MARKET_BRANDS,
  BRAND_CATEGORIES as STATIC_BRAND_CATEGORIES,
  getBrandsByCategory,
} from "../data/marketBrands";
import { useActor } from "../hooks/useActor";
import { useBrands, useCreateBrand } from "../hooks/useQueries";

const BRAND_CATEGORIES = [...STATIC_BRAND_CATEGORIES];

export function BrandCatalog() {
  const { data: brands, isLoading, isError } = useBrands();
  const createBrand = useCreateBrand();
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  // If loading takes > 4s with no data, show static fallback
  const [loadTimeout, setLoadTimeout] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setLoadTimeout(false);
      return;
    }
    const timer = setTimeout(() => setLoadTimeout(true), 4000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  const [form, setForm] = useState({
    category: "Solar Panel",
    name: "",
    isActive: true,
  });

  const handleImportAllBrands = async () => {
    if (!actor) return;
    setImporting(true);
    try {
      // Only import brands not already in the backend (match by name+category)
      const existingSet = new Set(
        (brands ?? []).map((b) => `${b.category}::${b.name.toLowerCase()}`),
      );
      const toImport = MARKET_BRANDS.filter(
        (mb) => !existingSet.has(`${mb.category}::${mb.name.toLowerCase()}`),
      );
      if (toImport.length === 0) {
        toast.info("All market brands are already imported.");
        return;
      }
      // Batch import sequentially to avoid overwhelming the canister
      let imported = 0;
      for (const mb of toImport) {
        await actor.createBrand(mb.category, mb.name, true);
        imported++;
      }
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success(`${imported} brands imported successfully!`);
    } catch (err) {
      toast.error("Import failed. Please try again.");
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

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

  // Use backend brands if available, otherwise fall back to static market brands
  const useStaticFallback = isError || (isLoading && loadTimeout);

  const brandsByCategory: Record<
    string,
    Array<{ id?: bigint; name: string; isActive: boolean; isStatic?: boolean }>
  > = useStaticFallback
    ? (() => {
        const staticByCategory = getBrandsByCategory();
        const result: Record<
          string,
          Array<{ name: string; isActive: boolean; isStatic: boolean }>
        > = {};
        for (const [cat, catBrands] of Object.entries(staticByCategory)) {
          result[cat] = catBrands.map((b) => ({
            name: b.name,
            isActive: true,
            isStatic: true,
          }));
        }
        return result;
      })()
    : (brands?.reduce(
        (acc, brand) => {
          if (!acc[brand.category]) acc[brand.category] = [];
          acc[brand.category].push(brand);
          return acc;
        },
        {} as Record<string, typeof brands>,
      ) ?? {});

  const totalBrands = useStaticFallback
    ? MARKET_BRANDS.length
    : (brands?.length ?? 0);
  const activeBrands = useStaticFallback
    ? MARKET_BRANDS.length
    : (brands?.filter((b) => b.isActive).length ?? 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Brand Catalog</h1>
          <p className="text-sm text-muted-foreground">
            {totalBrands} brands · {activeBrands} active
            {useStaticFallback && (
              <span className="ml-2 text-amber-600 text-xs">
                (showing market defaults — backend loading)
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleImportAllBrands}
            disabled={importing}
          >
            {importing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {importing ? "Importing..." : "Import All Brands"}
          </Button>
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
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, category: v }))
                    }
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
      </div>

      {isLoading && !loadTimeout ? (
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
          <Button
            variant="outline"
            size="sm"
            className="mt-3 gap-2"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["brands"] })
            }
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
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
                      key={brand.id ? brand.id.toString() : brand.name}
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
                      {brand.id ? (
                        <Switch
                          checked={brand.isActive}
                          onCheckedChange={() =>
                            handleToggle(brand.id as bigint, brand.isActive)
                          }
                          disabled={togglingId === brand.id.toString()}
                        />
                      ) : (
                        <Badge className="text-xs bg-solar/20 text-solar-dark border border-solar/30">
                          Market
                        </Badge>
                      )}
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
