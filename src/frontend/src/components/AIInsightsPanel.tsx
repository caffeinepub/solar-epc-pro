import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Sparkles, TrendingUp, Zap } from "lucide-react";
import type {
  InventoryItem,
  ProductMaster,
  Project,
  Quotation,
} from "../backend.d";
import { getAIInsights, getProductRecommendations } from "../utils/aiEngine";

interface AIInsightsPanelProps {
  projects: Project[];
  quotations: Quotation[];
  inventory: InventoryItem[];
  products: ProductMaster[];
}

function AiBadge() {
  return (
    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-solar text-navy inline-flex items-center gap-0.5 leading-none">
      <Sparkles className="h-2.5 w-2.5" />
      AI
    </span>
  );
}

export function AIInsightsPanel({
  projects,
  quotations,
  inventory,
  products,
}: AIInsightsPanelProps) {
  const insights = getAIInsights(projects, quotations, inventory, products);

  // Use static products as fallback for recommendations
  const recs = getProductRecommendations(
    insights.totalActivePipelineKW > 0
      ? insights.totalActivePipelineKW / Math.max(projects.length, 1)
      : 5,
    "onGrid",
    products,
  );

  const panelRec = recs.find((r) => r.category === "Solar Panel");
  const inverterRec = recs.find((r) => r.category === "Inverter");

  return (
    <Card
      data-ocid="ai.insights.panel"
      className="border-solar/30 bg-gradient-to-br from-navy/5 to-solar/5 overflow-hidden"
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-solar/20">
            <Sparkles className="h-4 w-4 text-navy" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-navy">AI Insights</span>
              <AiBadge />
            </div>
            <p className="text-xs font-normal text-muted-foreground mt-0.5">
              Smart analytics powered by your project data
            </p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 4 metric tiles */}
        <div className="grid grid-cols-2 gap-3">
          {/* Pipeline KW */}
          <div className="p-3 rounded-xl bg-white/60 border border-solar/20 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="h-3.5 w-3.5 text-navy/60" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Pipeline KW
              </span>
              <AiBadge />
            </div>
            <p className="text-2xl font-bold text-navy font-display">
              {insights.totalActivePipelineKW.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                kW
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Total across all projects
            </p>
          </div>

          {/* Yield Forecast */}
          <div className="p-3 rounded-xl bg-white/60 border border-solar/20 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-navy/60" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Yield Forecast
              </span>
              <AiBadge />
            </div>
            <p className="text-2xl font-bold text-navy font-display">
              {insights.yieldForecastKWhYear > 0
                ? `${(insights.yieldForecastKWhYear / 1000).toFixed(1)}k`
                : "0"}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                kWh/yr
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Est. annual generation
            </p>
          </div>

          {/* Avg ROI */}
          <div className="p-3 rounded-xl bg-white/60 border border-solar/20 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-green-600/70" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Avg ROI
              </span>
              <AiBadge />
            </div>
            <p className="text-2xl font-bold text-navy font-display">
              {insights.avgProjectROIYears.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                yrs
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Average payback period
            </p>
          </div>

          {/* Low Stock Alerts */}
          <div
            className={`p-3 rounded-xl border shadow-sm ${
              insights.lowStockAlerts > 0
                ? "bg-orange-50/80 border-orange-200"
                : "bg-green-50/80 border-green-200"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle
                className={`h-3.5 w-3.5 ${insights.lowStockAlerts > 0 ? "text-orange-500" : "text-green-600"}`}
              />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Low Stock
              </span>
              <AiBadge />
            </div>
            <p
              className={`text-2xl font-bold font-display ${insights.lowStockAlerts > 0 ? "text-orange-600" : "text-green-600"}`}
            >
              {insights.lowStockAlerts}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {insights.lowStockAlerts > 0
                ? "Items need restocking"
                : "All items stocked"}
            </p>
          </div>
        </div>

        {/* AI Procurement Forecast */}
        <div className="p-3 rounded-xl bg-navy/5 border border-navy/15">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-navy" />
            <span className="text-xs font-semibold text-navy">
              AI Procurement Forecast
            </span>
            <AiBadge />
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {insights.procurementForecast}
          </p>
          {insights.projectedMaterialNeeds !==
            "No pending material requirements" && (
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-medium">Material needs:</span>{" "}
              {insights.projectedMaterialNeeds}
            </p>
          )}
        </div>

        {/* Top AI Recommendations */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-navy">
              Top AI Recommendations
            </span>
            <AiBadge />
          </div>
          <div className="flex flex-wrap gap-2">
            {panelRec?.recommended ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs">
                <Sparkles className="h-3 w-3 text-amber-600 flex-shrink-0" />
                <span className="font-medium text-amber-800">
                  Panel: {panelRec.recommended.brand}{" "}
                  {panelRec.recommended.capacity}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs">
                <Sparkles className="h-3 w-3 text-amber-600 flex-shrink-0" />
                <span className="font-medium text-amber-800">
                  Panel: {insights.topRecommendedPanel}
                </span>
              </div>
            )}
            {inverterRec?.recommended ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs">
                <Sparkles className="h-3 w-3 text-blue-600 flex-shrink-0" />
                <span className="font-medium text-blue-800">
                  Inverter: {inverterRec.recommended.brand}{" "}
                  {inverterRec.recommended.capacity}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs">
                <Sparkles className="h-3 w-3 text-blue-600 flex-shrink-0" />
                <span className="font-medium text-blue-800">
                  Inverter: {insights.topRecommendedInverter}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
