import { Button } from "@/components/ui/button";
import { Battery, Cpu, Sparkles, Sun, X } from "lucide-react";
import { useState } from "react";
import type { ProductMaster } from "../backend.d";
import { getProductRecommendations } from "../utils/aiEngine";

interface AIProductRecommendationCardProps {
  systemKW: number;
  systemType: string;
  products: ProductMaster[];
  onSelectProduct?: (category: string, productId: bigint) => void;
}

function AiBadge() {
  return (
    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-solar text-navy inline-flex items-center gap-0.5 leading-none">
      <Sparkles className="h-2.5 w-2.5" />
      AI
    </span>
  );
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Solar Panel": Sun,
  Inverter: Cpu,
  Battery: Battery,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Solar Panel": "text-amber-600 bg-amber-50 border-amber-200",
  Inverter: "text-blue-600 bg-blue-50 border-blue-200",
  Battery: "text-green-600 bg-green-50 border-green-200",
};

export function AIProductRecommendationCard({
  systemKW,
  systemType,
  products,
  onSelectProduct,
}: AIProductRecommendationCardProps) {
  const [dismissed, setDismissed] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(),
  );

  if (dismissed) return null;

  const sysTypeNorm = (
    systemType === "onGrid" ||
    systemType === "offGrid" ||
    systemType === "hybrid"
      ? systemType
      : "onGrid"
  ) as "onGrid" | "offGrid" | "hybrid";

  const recommendations = getProductRecommendations(
    systemKW,
    sysTypeNorm,
    products,
  );
  const validRecs = recommendations.filter((r) => r.recommended !== null);

  if (validRecs.length === 0) return null;

  function handleSelect(category: string, productId: bigint) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
    if (onSelectProduct) {
      onSelectProduct(category, productId);
    }
  }

  return (
    <div
      data-ocid="ai.product_rec.panel"
      className="rounded-xl border border-solar/30 bg-solar/5 p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="p-1.5 rounded-lg bg-solar/30">
            <Sparkles className="h-4 w-4 text-navy" />
          </div>
          <AiBadge />
          <span className="text-sm font-semibold text-navy">
            AI Product Recommendations
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground flex-shrink-0"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss AI product recommendations"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Recommendation rows */}
      <div className="space-y-2">
        {validRecs.slice(0, 3).map((rec) => {
          if (!rec.recommended) return null;
          const Icon = CATEGORY_ICONS[rec.category] ?? Sparkles;
          const colorClass =
            CATEGORY_COLORS[rec.category] ??
            "text-navy bg-navy/5 border-navy/20";
          const isSelected = selectedCategories.has(rec.category);

          return (
            <div
              key={rec.category}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                isSelected
                  ? "bg-solar/15 border-solar/50"
                  : "bg-white/70 border-solar/15 hover:border-solar/30"
              }`}
            >
              {/* Category icon */}
              <div
                className={`p-1.5 rounded-md border flex-shrink-0 ${colorClass}`}
              >
                <Icon className="h-4 w-4" />
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-navy">
                    {rec.recommended.brand} {rec.recommended.capacity}
                  </p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                    {rec.recommended.productType}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {rec.recommended.reason}
                </p>
              </div>

              {/* Price */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-navy">
                  ₹{rec.recommended.price.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground">/unit</p>
              </div>

              {/* Select button */}
              {onSelectProduct && (
                <Button
                  type="button"
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  className={`h-7 text-xs flex-shrink-0 ${
                    isSelected
                      ? "bg-navy text-white hover:bg-navy/90"
                      : "border-solar/50 text-navy hover:bg-solar/20"
                  }`}
                  onClick={() =>
                    handleSelect(rec.category, rec.recommended!.id)
                  }
                >
                  {isSelected ? "✓ Selected" : "Select"}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <p className="text-[10px] text-muted-foreground italic">
        Recommendations based on efficiency-to-cost ratio from your Product
        Master. You can override any selection.
      </p>
    </div>
  );
}
