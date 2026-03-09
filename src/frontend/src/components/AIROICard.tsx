import { Button } from "@/components/ui/button";
import { Leaf, Sparkles, TrendingUp, Zap } from "lucide-react";
import type { Quotation } from "../backend.d";
import { computeSmartROI } from "../utils/aiEngine";

interface AIROICardProps {
  quotation: Quotation;
  systemKW?: number;
}

function AiBadge() {
  return (
    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-solar text-navy inline-flex items-center gap-0.5 leading-none">
      <Sparkles className="h-2.5 w-2.5" />
      AI
    </span>
  );
}

export function AIROICard({ quotation, systemKW }: AIROICardProps) {
  // Estimate system kW from total cost if not provided
  const estimatedKW = systemKW ?? Math.max(quotation.totalCost / 60000, 1);

  const roi = computeSmartROI(
    estimatedKW,
    quotation.totalCost,
    // Estimate tariff from annual savings and yield
    estimatedKW > 0
      ? quotation.annualSavings / Math.max(estimatedKW * 5.5 * 365 * 0.8, 1)
      : 8.5,
    quotation.subsidy,
  );

  const twentyFiveYrLakh = (roi.twentyFiveYearSavings / 100000).toFixed(1);

  return (
    <div className="px-4 py-3 bg-solar/5 border-t border-solar/20 space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <AiBadge />
        <span className="text-xs font-semibold text-navy">
          Enhanced AI ROI Analysis
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2 rounded-lg bg-white/70 border border-solar/20 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Zap className="h-3 w-3 text-solar-dark" />
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Annual Yield
          </p>
          <p className="text-sm font-bold text-navy">
            {(roi.annualYield / 1000).toFixed(1)}k kWh/yr
          </p>
        </div>

        <div className="p-2 rounded-lg bg-white/70 border border-solar/20 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <TrendingUp className="h-3 w-3 text-green-600" />
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            25-Year Savings
          </p>
          <p className="text-sm font-bold text-navy">₹{twentyFiveYrLakh}L</p>
        </div>

        <div className="p-2 rounded-lg bg-white/70 border border-solar/20 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Leaf className="h-3 w-3 text-green-700" />
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Carbon Offset
          </p>
          <p className="text-sm font-bold text-navy">
            {roi.carbonTonnes} t CO₂/yr
          </p>
        </div>

        <div className="p-2 rounded-lg bg-white/70 border border-solar/20 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <TrendingUp className="h-3 w-3 text-blue-600" />
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Enhanced Payback
          </p>
          <p className="text-sm font-bold text-navy">{roi.paybackYears} yrs</p>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground italic">
        Enhanced calculation with 0.5%/yr panel degradation over 25 years.
        System size estimated from project cost.
      </p>
    </div>
  );
}

interface AIROIToggleButtonProps {
  quotationId: bigint;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

export function AIROIToggleButton({
  quotationId,
  isExpanded,
  onToggle,
}: AIROIToggleButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={`h-7 px-2 gap-1 text-xs ${
        isExpanded
          ? "text-navy bg-solar/20 border border-solar/40"
          : "text-muted-foreground hover:text-navy hover:bg-solar/10"
      }`}
      onClick={() => onToggle(quotationId.toString())}
      aria-label="Toggle AI ROI analysis"
    >
      <Sparkles className="h-3 w-3" />
      AI ROI
    </Button>
  );
}
