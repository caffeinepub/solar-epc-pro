import { Button } from "@/components/ui/button";
import { Battery, Sparkles, TrendingUp, X, Zap } from "lucide-react";
import { useState } from "react";
import { type AILoadSuggestion, analyzeLoad } from "../utils/aiEngine";

interface AILoadSuggestionCardProps {
  systemKW: number;
  systemType: string;
  backupHours?: number;
  tariff?: number;
  onApply?: (suggestion: AILoadSuggestion) => void;
}

function AiBadge() {
  return (
    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-solar text-navy inline-flex items-center gap-0.5 leading-none">
      <Sparkles className="h-2.5 w-2.5" />
      AI
    </span>
  );
}

function StatTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="p-2.5 rounded-lg bg-white/70 border border-solar/20 text-center">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">
        {label}
      </p>
      <p className="text-sm font-bold text-navy leading-tight">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

export function AILoadSuggestionCard({
  systemKW,
  systemType,
  backupHours = 4,
  tariff = 8.5,
  onApply,
}: AILoadSuggestionCardProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || systemKW <= 0) return null;

  const sysTypeNorm = (
    systemType === "onGrid" ||
    systemType === "offGrid" ||
    systemType === "hybrid"
      ? systemType
      : "onGrid"
  ) as "onGrid" | "offGrid" | "hybrid";

  const suggestion = analyzeLoad(
    systemKW,
    systemKW * 30 * 4.5,
    sysTypeNorm,
    backupHours,
    tariff,
  );

  const needsBattery = sysTypeNorm === "offGrid" || sysTypeNorm === "hybrid";

  const twentyFiveYrLakh = (suggestion.twentyFiveYearSavings / 100000).toFixed(
    1,
  );

  return (
    <div
      data-ocid="ai.load_suggestion.panel"
      className="rounded-xl border border-solar/40 bg-solar/5 p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="p-1.5 rounded-lg bg-solar/30">
            <Sparkles className="h-4 w-4 text-navy" />
          </div>
          <AiBadge />
          <span className="text-sm font-semibold text-navy">AI Suggestion</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground flex-shrink-0"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss AI suggestion"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Main suggestion text */}
      <p className="text-sm text-foreground leading-relaxed">
        AI recommends{" "}
        <strong className="text-navy">{suggestion.recommendedPanelType}</strong>{" "}
        panels with{" "}
        <strong className="text-navy">{suggestion.inverterSizeKW} kW</strong>{" "}
        inverter for this{" "}
        <strong className="text-navy">{systemKW.toFixed(1)} kWp</strong> system.
      </p>

      {/* Stats grid */}
      <div
        className={`grid gap-2 ${needsBattery ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"}`}
      >
        <StatTile
          label="Panel Qty"
          value={`${suggestion.panelQuantity} panels`}
          sub={`${suggestion.recommendedPanelWp}W each`}
        />
        <StatTile label="String Config" value={suggestion.stringConfig} />
        <StatTile
          label="Inverter Size"
          value={`${suggestion.inverterSizeKW} kW`}
          sub={`DC/AC: ${suggestion.dcAcRatio.toFixed(2)}`}
        />
        <StatTile
          label="Est. Yield"
          value={`${(suggestion.estimatedYieldKWhPerYear / 1000).toFixed(1)}k kWh/yr`}
        />
        {needsBattery && suggestion.batteryQty > 0 && (
          <StatTile
            label="Battery Config"
            value={`${suggestion.batteryQty} × ${suggestion.batteryAh}Ah`}
            sub={`@ ${suggestion.batteryVoltage}V`}
          />
        )}
      </div>

      {/* ROI mini-summary */}
      <div className="flex flex-wrap gap-3 py-2 px-3 rounded-lg bg-navy/5 border border-navy/10">
        <div className="flex items-center gap-1.5 text-xs">
          <TrendingUp className="h-3.5 w-3.5 text-green-600" />
          <span className="text-muted-foreground">Annual Savings:</span>
          <span className="font-semibold text-navy">
            ₹{suggestion.annualSavings.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <Zap className="h-3.5 w-3.5 text-solar-dark" />
          <span className="text-muted-foreground">Payback:</span>
          <span className="font-semibold text-navy">
            {suggestion.paybackYears} yrs
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <Battery className="h-3.5 w-3.5 text-blue-600" />
          <span className="text-muted-foreground">IRR:</span>
          <span className="font-semibold text-navy">{suggestion.irr}%</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <TrendingUp className="h-3.5 w-3.5 text-purple-600" />
          <span className="text-muted-foreground">25-yr savings:</span>
          <span className="font-semibold text-navy">₹{twentyFiveYrLakh}L</span>
        </div>
      </div>

      {/* Apply button + footer */}
      <div className="flex items-center justify-between gap-3">
        {onApply && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5 h-8 border-solar/50 text-navy hover:bg-solar/20 text-xs"
            onClick={() => onApply(suggestion)}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Apply Suggestion
          </Button>
        )}
        <p className="text-[10px] text-muted-foreground italic flex-1 min-w-0">
          AI suggestion based on standard solar design parameters. You can
          override any value.
        </p>
      </div>
    </div>
  );
}
