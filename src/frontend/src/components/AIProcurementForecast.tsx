import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, X } from "lucide-react";
import { useState } from "react";
import type { InventoryItem, Project } from "../backend.d";
import { getAIInsights } from "../utils/aiEngine";

interface AIProcurementForecastProps {
  projects: Project[];
  inventory: InventoryItem[];
}

function AiBadge() {
  return (
    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-solar text-navy inline-flex items-center gap-0.5 leading-none">
      <Sparkles className="h-2.5 w-2.5" />
      AI
    </span>
  );
}

export function AIProcurementForecast({
  projects,
  inventory,
}: AIProcurementForecastProps) {
  const [dismissed, setDismissed] = useState(false);

  const insights = getAIInsights(projects, [], inventory, []);

  const activeCount = projects.filter(
    (p) =>
      p.status === "draft" ||
      p.status === "quoted" ||
      p.status === "inProgress",
  ).length;

  // Only show if there are active projects and inventory is loaded
  if (dismissed || activeCount === 0 || inventory.length === 0) return null;

  return (
    <div
      data-ocid="ai.procurement_forecast.panel"
      className="rounded-xl border border-navy/20 bg-gradient-to-r from-navy/5 to-solar/5 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div className="p-2 rounded-lg bg-navy/10 flex-shrink-0 mt-0.5">
            <TrendingUp className="h-4 w-4 text-navy" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-sm font-semibold text-navy">
                AI Procurement Forecast
              </span>
              <AiBadge />
            </div>

            <p className="text-sm text-foreground leading-relaxed">
              {insights.procurementForecast}
            </p>

            {insights.projectedMaterialNeeds !==
              "No pending material requirements" && (
              <div className="mt-2 flex items-start gap-2">
                <Sparkles className="h-3.5 w-3.5 text-solar-dark mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-navy">
                    Projected material needs:
                  </span>{" "}
                  {insights.projectedMaterialNeeds}
                </p>
              </div>
            )}

            {insights.lowStockAlerts > 0 && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-xs">
                <span className="text-orange-600 font-medium">
                  ⚠ {insights.lowStockAlerts} item
                  {insights.lowStockAlerts > 1 ? "s" : ""} below minimum stock
                  level
                </span>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground italic mt-2">
              AI forecast based on active project pipeline and current
              inventory.
            </p>
          </div>
        </div>

        {/* Dismiss */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground flex-shrink-0"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss procurement forecast"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
