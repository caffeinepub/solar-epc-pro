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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import {
  Battery,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Plus,
  Sun,
  Trash2,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useBrands, useMOQ } from "../hooks/useQueries";
import {
  QuotationStatus,
  Variant_applianceBased_consumptionBased,
  Variant_hybrid_offGrid_onGrid,
  Variant_sheetMetal_rccRooftop_other_groundMount,
} from "../hooks/useQueries";

const STEPS = [
  { label: "Basic Info", icon: FileText },
  { label: "Load Input", icon: Zap },
  { label: "Auto MOQ", icon: Sun },
  { label: "Brands", icon: Battery },
  { label: "Quotation", icon: TrendingUp },
];

type ApplianceEntry = {
  id: string;
  name: string;
  wattage: number;
  surgeFactor: number;
  dailyHours: number;
  quantity: number;
};

const PRESET_APPLIANCES = [
  { name: "Ceiling Fan", wattage: 75, surgeFactor: 1.2 },
  { name: "LED Bulb (9W)", wattage: 9, surgeFactor: 1.0 },
  { name: "LED Tube Light", wattage: 20, surgeFactor: 1.0 },
  { name: "LED Panel Light", wattage: 36, surgeFactor: 1.0 },
  { name: 'Television (LED 32")', wattage: 60, surgeFactor: 1.0 },
  { name: 'Television (Smart 55")', wattage: 120, surgeFactor: 1.0 },
  { name: "Refrigerator (Single Door)", wattage: 150, surgeFactor: 2.5 },
  { name: "Refrigerator (Double Door)", wattage: 250, surgeFactor: 2.5 },
  { name: "AC 1 Ton", wattage: 900, surgeFactor: 3.0 },
  { name: "AC 1.5 Ton", wattage: 1200, surgeFactor: 3.0 },
  { name: "AC 2 Ton", wattage: 1600, surgeFactor: 3.0 },
  { name: "Washing Machine", wattage: 500, surgeFactor: 2.0 },
  { name: "Water Motor (0.5 HP)", wattage: 373, surgeFactor: 3.5 },
  { name: "Water Motor (1 HP)", wattage: 746, surgeFactor: 3.5 },
  { name: "Induction Cooktop", wattage: 2000, surgeFactor: 1.0 },
  { name: "Microwave Oven", wattage: 1200, surgeFactor: 1.0 },
  { name: "Geyser", wattage: 2000, surgeFactor: 1.0 },
  { name: "Computer (Desktop)", wattage: 300, surgeFactor: 1.5 },
  { name: "Laptop", wattage: 65, surgeFactor: 1.0 },
  { name: "CCTV System (4 cams)", wattage: 40, surgeFactor: 1.0 },
  { name: "RO Water Purifier", wattage: 60, surgeFactor: 1.0 },
  { name: "Mixer Grinder", wattage: 750, surgeFactor: 2.0 },
  { name: "EV Charger (3.3 kW)", wattage: 3300, surgeFactor: 1.2 },
  { name: "Agricultural Pump (3 HP)", wattage: 2238, surgeFactor: 3.5 },
];

function generateROIData(totalCost: number, annualSavings: number, years = 25) {
  const data: { year: string; cumulative: number; annual: number }[] = [];
  let cumulative = -totalCost;
  for (let y = 1; y <= years; y++) {
    cumulative += annualSavings;
    data.push({
      year: `Y${y}`,
      cumulative: Math.round(cumulative),
      annual: Math.round(annualSavings),
    });
  }
  return data;
}

export function ProjectWizard({ onComplete }: { onComplete: () => void }) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1
  const [clientName, setClientName] = useState("");
  const [installationType, setInstallationType] =
    useState<Variant_sheetMetal_rccRooftop_other_groundMount>(
      Variant_sheetMetal_rccRooftop_other_groundMount.rccRooftop,
    );
  const [systemType, setSystemType] = useState<Variant_hybrid_offGrid_onGrid>(
    Variant_hybrid_offGrid_onGrid.onGrid,
  );

  // Step 2
  const [loadMethod, setLoadMethod] = useState<"consumption" | "appliance">(
    "consumption",
  );
  const [monthlyKWh, setMonthlyKWh] = useState("");
  const [tariff, setTariff] = useState("");
  const [dayNightRatio, setDayNightRatio] = useState("70");
  const [appliances, setAppliances] = useState<ApplianceEntry[]>([]);
  const [selectedPreset, setSelectedPreset] = useState("");

  // Step 3 — generated project
  const [projectId, setProjectId] = useState<bigint | null>(null);
  const { data: moqItems, isLoading: moqLoading } = useMOQ(projectId);
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>(
    {},
  );

  // Step 4 — brand selection
  const { data: brands } = useBrands();
  const [selectedBrands, setSelectedBrands] = useState<Record<string, string>>(
    {},
  );

  // Step 5 — quotation
  const [companyName, setCompanyName] = useState("Solar EPC Pro");
  const [gstPercent, setGstPercent] = useState("18");
  const [subsidyAmount, setSubsidyAmount] = useState("0");

  const addAppliance = () => {
    if (!selectedPreset) return;
    const preset = PRESET_APPLIANCES.find((a) => a.name === selectedPreset);
    if (!preset) return;
    setAppliances((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: preset.name,
        wattage: preset.wattage,
        surgeFactor: preset.surgeFactor,
        dailyHours: 4,
        quantity: 1,
      },
    ]);
    setSelectedPreset("");
  };

  const removeAppliance = (id: string) => {
    setAppliances((prev) => prev.filter((a) => a.id !== id));
  };

  const updateAppliance = (
    id: string,
    field: keyof ApplianceEntry,
    value: number,
  ) => {
    setAppliances((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
    );
  };

  const totalConnectedLoad = appliances.reduce(
    (sum, a) => sum + a.wattage * a.quantity,
    0,
  );
  const dailyEnergyDemand = appliances.reduce(
    (sum, a) => sum + (a.wattage * a.quantity * a.dailyHours) / 1000,
    0,
  );

  const computedSystemSizeKW =
    loadMethod === "consumption"
      ? monthlyKWh
        ? Number.parseFloat(monthlyKWh) / 30 / 4.5
        : 0
      : dailyEnergyDemand / 4.5;

  const systemSizeKW = Math.ceil(computedSystemSizeKW * 10) / 10;

  const handleCreateProject = async () => {
    if (!actor) return;
    if (!clientName.trim()) {
      toast.error("Client name is required.");
      return;
    }
    if (systemSizeKW <= 0) {
      toast.error(
        "System size must be greater than 0. Please enter a valid load.",
      );
      return;
    }
    setIsSubmitting(true);
    try {
      const id = await actor.createProject(
        clientName,
        systemType,
        installationType,
        loadMethod === "consumption"
          ? Variant_applianceBased_consumptionBased.consumptionBased
          : Variant_applianceBased_consumptionBased.applianceBased,
        systemSizeKW,
        systemType !== Variant_hybrid_offGrid_onGrid.onGrid
          ? systemSizeKW * 2
          : 0,
      );

      // Add appliances if appliance-based
      if (loadMethod === "appliance" && appliances.length > 0) {
        await Promise.all(
          appliances.map((a) =>
            actor.addAppliance(
              id,
              a.name,
              a.wattage,
              a.surgeFactor,
              a.dailyHours,
              BigInt(a.quantity),
            ),
          ),
        );
      }

      // Auto-generate MOQ on the backend
      await actor.generateMOQ(id);
      // Fetch MOQ items directly and store them, then navigate
      const fetchedMOQ = await actor.listMOQ(id);
      queryClient.setQueryData(["moq", id.toString()], fetchedMOQ);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setProjectId(id);
      setStep(2);
      toast.success("Project created! MOQ generated.");
    } catch (err) {
      console.error("createProject error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to create project: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalMOQCost =
    moqItems?.reduce((sum, item) => {
      const effectivePrice =
        priceOverrides[item.id.toString()] ?? item.unitPrice;
      return sum + item.quantity * effectivePrice;
    }, 0) ?? 0;
  const annualSavings =
    systemSizeKW * 4.5 * 365 * Number.parseFloat(tariff || "7");
  const subsidy = Number.parseFloat(subsidyAmount) || 0;
  const gst = Number.parseFloat(gstPercent) || 18;
  const totalWithGST = totalMOQCost * (1 + gst / 100);
  const netCost = totalWithGST - subsidy;
  const paybackYears =
    netCost > 0 && annualSavings > 0 ? netCost / annualSavings : 0;
  const irr = paybackYears > 0 ? (100 / paybackYears) * 1.1 : 0;
  const carbonSavings = systemSizeKW * 4.5 * 365 * 0.82; // kg CO2/year

  const roiData = generateROIData(netCost, annualSavings);

  const handleCreateQuotation = async () => {
    if (!actor) return;
    setIsSubmitting(true);
    try {
      const propNum = `PROP-${Date.now().toString().slice(-6)}`;
      await actor.createQuotation(
        propNum,
        clientName,
        companyName,
        gst,
        totalWithGST,
        subsidy,
        paybackYears,
        annualSavings,
        irr,
        carbonSavings,
        QuotationStatus.draft,
        "Standard terms and conditions apply. Subject to site survey.",
      );
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      toast.success("Quotation generated successfully!");
      onComplete();
    } catch {
      toast.error("Failed to create quotation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const moqByCategory =
    moqItems?.reduce(
      (acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
      },
      {} as Record<string, typeof moqItems>,
    ) ?? {};

  const brandsByCategory =
    brands?.reduce(
      (acc, brand) => {
        if (!acc[brand.category]) acc[brand.category] = [];
        acc[brand.category].push(brand);
        return acc;
      },
      {} as Record<string, typeof brands>,
    ) ?? {};

  const canProceedStep1 = clientName.trim().length > 0;
  const canProceedStep2 =
    loadMethod === "consumption"
      ? Number.parseFloat(monthlyKWh) > 0
      : appliances.length > 0;

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display">New Project Wizard</h1>
        <p className="text-sm text-muted-foreground">
          Step {step + 1} of {STEPS.length}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex gap-1 items-center">
        {STEPS.map((s, i) => (
          <div key={s.label} className="flex items-center gap-1 flex-1">
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                i === step
                  ? "bg-navy text-white"
                  : i < step
                    ? "bg-solar text-navy font-semibold"
                    : "bg-secondary text-muted-foreground"
              }`}
            >
              {i < step ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <s.icon className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:block">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 rounded-full ${i < step ? "bg-navy/30" : "bg-border"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-navy" />
              Project Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Client Name *</Label>
              <Input
                placeholder="e.g. Sharma Agro Industries"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>System Type</Label>
              <Select
                value={systemType}
                onValueChange={(v) =>
                  setSystemType(v as Variant_hybrid_offGrid_onGrid)
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Variant_hybrid_offGrid_onGrid.onGrid}>
                    On-Grid (Grid-tied)
                  </SelectItem>
                  <SelectItem value={Variant_hybrid_offGrid_onGrid.offGrid}>
                    Off-Grid (Standalone)
                  </SelectItem>
                  <SelectItem value={Variant_hybrid_offGrid_onGrid.hybrid}>
                    Hybrid (Grid + Battery)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Installation Type</Label>
              <Select
                value={installationType}
                onValueChange={(v) =>
                  setInstallationType(
                    v as Variant_sheetMetal_rccRooftop_other_groundMount,
                  )
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value={
                      Variant_sheetMetal_rccRooftop_other_groundMount.rccRooftop
                    }
                  >
                    RCC Rooftop
                  </SelectItem>
                  <SelectItem
                    value={
                      Variant_sheetMetal_rccRooftop_other_groundMount.sheetMetal
                    }
                  >
                    Sheet Metal Roof
                  </SelectItem>
                  <SelectItem
                    value={
                      Variant_sheetMetal_rccRooftop_other_groundMount.groundMount
                    }
                  >
                    Ground Mount (Agricultural / Industrial)
                  </SelectItem>
                  <SelectItem
                    value={
                      Variant_sheetMetal_rccRooftop_other_groundMount.other
                    }
                  >
                    Elevated / Carport / Other
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Load Input */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-navy" />
              Load Input
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={loadMethod}
              onValueChange={(v) =>
                setLoadMethod(v as "consumption" | "appliance")
              }
            >
              <TabsList className="w-full">
                <TabsTrigger value="consumption" className="flex-1">
                  Monthly Consumption
                </TabsTrigger>
                <TabsTrigger value="appliance" className="flex-1">
                  Appliance Builder
                </TabsTrigger>
              </TabsList>

              <TabsContent value="consumption" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Monthly Consumption (kWh) *</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 500"
                      value={monthlyKWh}
                      onChange={(e) => setMonthlyKWh(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Utility Tariff (₹/kWh)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 7"
                      value={tariff}
                      onChange={(e) => setTariff(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <div>
                  <Label>Day/Night Usage Ratio: {dayNightRatio}% day</Label>
                  <input
                    type="range"
                    min="30"
                    max="90"
                    step="5"
                    value={dayNightRatio}
                    onChange={(e) => setDayNightRatio(e.target.value)}
                    className="w-full mt-2 accent-navy"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>30% (night-heavy)</span>
                    <span>90% (day-heavy)</span>
                  </div>
                </div>
                {monthlyKWh && Number.parseFloat(monthlyKWh) > 0 && (
                  <div className="p-3 rounded-lg bg-solar/15 border border-solar/40">
                    <p className="text-sm font-medium text-navy">
                      Estimated System Size:{" "}
                      <span className="text-lg font-bold">
                        {systemSizeKW.toFixed(1)} kWp
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Based on 4.5 peak sun hours/day
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="appliance" className="space-y-4 mt-4">
                {/* Appliance selector */}
                <div className="flex gap-2">
                  <Select
                    value={selectedPreset}
                    onValueChange={setSelectedPreset}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select appliance to add..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PRESET_APPLIANCES.map((a) => (
                        <SelectItem key={a.name} value={a.name}>
                          {a.name} ({a.wattage}W)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    onClick={addAppliance}
                    disabled={!selectedPreset}
                    size="sm"
                    className="gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>

                {appliances.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                    <Zap className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Add appliances to calculate load</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="grid grid-cols-12 gap-1 text-xs text-muted-foreground font-medium px-2 mb-1">
                      <span className="col-span-4">Appliance</span>
                      <span className="col-span-2">Watts</span>
                      <span className="col-span-2">Qty</span>
                      <span className="col-span-2">Hrs/day</span>
                      <span className="col-span-1">kWh</span>
                      <span className="col-span-1" />
                    </div>
                    {appliances.map((a) => (
                      <div
                        key={a.id}
                        className="grid grid-cols-12 gap-1 items-center p-2 rounded-md bg-secondary/30 text-sm"
                      >
                        <span className="col-span-4 text-xs font-medium truncate">
                          {a.name}
                        </span>
                        <span className="col-span-2 text-xs text-muted-foreground">
                          {a.wattage}W
                        </span>
                        <Input
                          type="number"
                          min="1"
                          value={a.quantity}
                          onChange={(e) =>
                            updateAppliance(
                              a.id,
                              "quantity",
                              Number.parseInt(e.target.value) || 1,
                            )
                          }
                          className="col-span-2 h-7 text-xs px-2"
                        />
                        <Input
                          type="number"
                          min="0.5"
                          max="24"
                          step="0.5"
                          value={a.dailyHours}
                          onChange={(e) =>
                            updateAppliance(
                              a.id,
                              "dailyHours",
                              Number.parseFloat(e.target.value) || 1,
                            )
                          }
                          className="col-span-2 h-7 text-xs px-2"
                        />
                        <span className="col-span-1 text-xs text-muted-foreground">
                          {(
                            (a.wattage * a.quantity * a.dailyHours) /
                            1000
                          ).toFixed(1)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAppliance(a.id)}
                          className="col-span-1 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {appliances.length > 0 && (
                  <div className="p-3 rounded-lg bg-solar/15 border border-solar/40 space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Connected Load
                      </span>
                      <span className="font-semibold">
                        {(totalConnectedLoad / 1000).toFixed(2)} kW
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Daily Energy Demand
                      </span>
                      <span className="font-semibold">
                        {dailyEnergyDemand.toFixed(1)} kWh
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Estimated System Size
                      </span>
                      <span className="font-bold text-navy">
                        {systemSizeKW.toFixed(1)} kWp
                      </span>
                    </div>
                    <div>
                      <Label className="text-xs">
                        Utility Tariff (₹/kWh) for ROI
                      </Label>
                      <Input
                        type="number"
                        placeholder="e.g. 7"
                        value={tariff}
                        onChange={(e) => setTariff(e.target.value)}
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Auto MOQ */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sun className="h-4 w-4 text-navy" />
              Auto-Generated Bill of Materials (MOQ)
              {projectId !== null && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="ml-auto gap-1.5 text-xs"
                  onClick={async () => {
                    if (!actor || projectId === null) return;
                    try {
                      await actor.generateMOQ(projectId);
                      const refreshedMOQ = await actor.listMOQ(projectId);
                      queryClient.setQueryData(
                        ["moq", projectId.toString()],
                        refreshedMOQ,
                      );
                      toast.success("MOQ regenerated");
                    } catch {
                      toast.error("Failed to regenerate MOQ");
                    }
                  }}
                >
                  <Sun className="h-3.5 w-3.5" />
                  Regenerate
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {moqLoading ? (
              <div className="space-y-2">
                {["a", "b", "c", "d", "e", "f"].map((k) => (
                  <Skeleton key={k} className="h-10 w-full" />
                ))}
              </div>
            ) : !moqItems || moqItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Sun className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="font-medium">MOQ data not yet generated</p>
                <p className="text-sm mt-1">
                  The system will auto-generate materials based on your load
                  data.
                </p>
                <p className="text-sm text-navy mt-2">
                  System Size: {systemSizeKW.toFixed(1)} kWp | Type:{" "}
                  {systemType === "onGrid"
                    ? "On-Grid"
                    : systemType === "offGrid"
                      ? "Off-Grid"
                      : "Hybrid"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground italic">
                  Unit prices are editable. Click a price to update.
                </p>
                {Object.entries(moqByCategory).map(([category, items]) => (
                  <div key={category}>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-navy mb-2">
                      {category}
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Item</TableHead>
                          <TableHead className="text-xs text-right">
                            Qty
                          </TableHead>
                          <TableHead className="text-xs">Unit</TableHead>
                          <TableHead className="text-xs text-right">
                            Unit Price
                          </TableHead>
                          <TableHead className="text-xs text-right">
                            Total
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item) => {
                          const effectivePrice =
                            priceOverrides[item.id.toString()] ??
                            item.unitPrice;
                          const effectiveTotal = item.quantity * effectivePrice;
                          return (
                            <TableRow key={item.id.toString()}>
                              <TableCell className="text-sm">
                                {item.itemName}
                              </TableCell>
                              <TableCell className="text-sm text-right">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {item.unit}
                              </TableCell>
                              <TableCell className="text-sm text-right">
                                <Input
                                  type="number"
                                  className="w-24 h-7 text-xs text-right"
                                  value={
                                    priceOverrides[item.id.toString()] ??
                                    item.unitPrice
                                  }
                                  onChange={(e) => {
                                    const val =
                                      Number.parseFloat(e.target.value) || 0;
                                    setPriceOverrides((prev) => ({
                                      ...prev,
                                      [item.id.toString()]: val,
                                    }));
                                  }}
                                  onBlur={async (e) => {
                                    const val =
                                      Number.parseFloat(e.target.value) || 0;
                                    try {
                                      await actor?.updateMOQItem(
                                        item.id,
                                        item.itemName,
                                        item.category,
                                        item.quantity,
                                        item.unit,
                                        item.brand,
                                        val,
                                      );
                                      queryClient.invalidateQueries({
                                        queryKey: ["moq"],
                                      });
                                    } catch {
                                      toast.error("Failed to update price");
                                    }
                                  }}
                                />
                              </TableCell>
                              <TableCell className="text-sm text-right font-medium">
                                ₹{effectiveTotal.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ))}

                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="font-semibold">
                    Total Material Cost (Ex-GST)
                  </span>
                  <span className="text-lg font-bold text-navy">
                    ₹{totalMOQCost.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Brand Selection */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Battery className="h-4 w-4 text-navy" />
              Brand Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.keys(brandsByCategory).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Battery className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="font-medium">No brands configured</p>
                <p className="text-sm mt-1">
                  Add brands in Brand Catalog to enable selection
                </p>
              </div>
            ) : (
              Object.entries(brandsByCategory).map(
                ([category, categoryBrands]) => (
                  <div key={category}>
                    <Label className="text-xs font-semibold uppercase tracking-wider text-navy">
                      {category}
                    </Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {categoryBrands
                        .filter((b) => b.isActive)
                        .map((brand) => (
                          <button
                            type="button"
                            key={brand.id.toString()}
                            onClick={() =>
                              setSelectedBrands((prev) => ({
                                ...prev,
                                [category]: brand.name,
                              }))
                            }
                            className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-all ${
                              selectedBrands[category] === brand.name
                                ? "bg-navy text-white border-navy"
                                : "bg-secondary text-secondary-foreground border-border hover:border-solar/60 hover:bg-solar/10"
                            }`}
                          >
                            {brand.name}
                          </button>
                        ))}
                    </div>
                  </div>
                ),
              )
            )}
            {Object.keys(selectedBrands).length > 0 && (
              <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Selected Brands
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedBrands).map(([cat, name]) => (
                    <Badge
                      key={cat}
                      className="bg-solar/25 text-solar-dark text-xs border border-solar/40"
                    >
                      {cat}: {name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 5: Quotation & ROI */}
      {step === 4 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-navy" />
                Quotation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Company Name</Label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>GST (%)</Label>
                  <Input
                    type="number"
                    value={gstPercent}
                    onChange={(e) => setGstPercent(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Subsidy (₹)</Label>
                  <Input
                    type="number"
                    value={subsidyAmount}
                    onChange={(e) => setSubsidyAmount(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Tariff (₹/kWh)</Label>
                  <Input
                    type="number"
                    value={tariff}
                    onChange={(e) => setTariff(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-secondary/50 border border-border">
                {[
                  {
                    label: "System Size",
                    value: `${systemSizeKW.toFixed(1)} kWp`,
                    highlight: false,
                  },
                  {
                    label: "Material Cost",
                    value: `₹${totalMOQCost.toLocaleString()}`,
                    highlight: false,
                  },
                  {
                    label: `GST (${gst}%)`,
                    value: `₹${((totalMOQCost * gst) / 100).toLocaleString()}`,
                    highlight: false,
                  },
                  {
                    label: "Subsidy",
                    value: `-₹${subsidy.toLocaleString()}`,
                    highlight: false,
                  },
                  {
                    label: "Net Investment",
                    value: `₹${Math.round(netCost).toLocaleString()}`,
                    highlight: true,
                  },
                  {
                    label: "Annual Savings",
                    value: `₹${Math.round(annualSavings).toLocaleString()}`,
                    highlight: true,
                  },
                  {
                    label: "Payback Period",
                    value: `${paybackYears.toFixed(1)} years`,
                    highlight: false,
                  },
                  {
                    label: "IRR (estimated)",
                    value: `${irr.toFixed(1)}%`,
                    highlight: false,
                  },
                  {
                    label: "CO₂ Saved/Year",
                    value: `${(carbonSavings / 1000).toFixed(1)} tonnes`,
                    highlight: false,
                  },
                  {
                    label: "25-Year Savings",
                    value: `₹${Math.round(annualSavings * 25).toLocaleString()}`,
                    highlight: true,
                  },
                ].map(({ label, value, highlight }) => (
                  <div key={label} className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                      {label}
                    </span>
                    <span
                      className={`text-sm font-semibold ${highlight ? "text-navy" : "text-foreground"}`}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ROI Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-navy" />
                25-Year ROI Projection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={roiData.filter((_, i) => i % 4 === 3 || i === 0)}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.88 0.03 245)"
                    />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 10, fill: "oklch(0.52 0.04 255)" }}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "oklch(0.52 0.04 255)" }}
                      tickFormatter={(v: number) =>
                        `₹${(v / 1000).toFixed(0)}K`
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "1px solid oklch(0.88 0.03 245)",
                        borderRadius: "6px",
                        fontSize: "12px",
                        color: "oklch(0.18 0.025 255)",
                      }}
                      formatter={(value: number) => [
                        `₹${value.toLocaleString()}`,
                        "Cumulative",
                      ]}
                    />
                    <Bar
                      dataKey="cumulative"
                      fill="oklch(0.35 0.14 255)"
                      radius={[3, 3, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Line chart for annual savings */}
              <div className="h-36 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={roiData.slice(0, 10)}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.88 0.03 245)"
                    />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 10, fill: "oklch(0.52 0.04 255)" }}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "oklch(0.52 0.04 255)" }}
                      tickFormatter={(v: number) =>
                        `₹${(v / 1000).toFixed(0)}K`
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "1px solid oklch(0.88 0.03 245)",
                        borderRadius: "6px",
                        fontSize: "12px",
                        color: "oklch(0.18 0.025 255)",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="annual"
                      stroke="oklch(0.88 0.19 88)"
                      strokeWidth={2.5}
                      dot={false}
                      name="Annual Savings"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => (step === 0 ? onComplete() : setStep((s) => s - 1))}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          {step === 0 ? "Cancel" : "Back"}
        </Button>

        {step < 4 ? (
          step === 1 ? (
            <Button
              type="button"
              onClick={handleCreateProject}
              disabled={
                !canProceedStep1 ||
                !canProceedStep2 ||
                systemSizeKW <= 0 ||
                isSubmitting
              }
              className="gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              {isSubmitting ? "Creating..." : "Generate MOQ"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 0 && !canProceedStep1}
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )
        ) : (
          <Button
            type="button"
            onClick={handleCreateQuotation}
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {isSubmitting ? "Saving..." : "Generate Quotation"}
          </Button>
        )}
      </div>
    </div>
  );
}
