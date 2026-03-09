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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Battery,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Info,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Sun,
  Trash2,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useMOQ, useProductMaster } from "../hooks/useQueries";
import {
  QuotationStatus,
  Variant_applianceBased_consumptionBased,
  Variant_hybrid_offGrid_onGrid,
  Variant_sheetMetal_rccRooftop_other_groundMount,
} from "../hooks/useQueries";
import { generateNextProposalNumber } from "../utils/quotationNumbering";
import { AILoadSuggestionCard } from "./AILoadSuggestionCard";
import { AIProductRecommendationCard } from "./AIProductRecommendationCard";

// ─── Static product data for Brand Reference (fallback when backend returns nothing) ───
type StaticProduct = {
  id: bigint;
  category: string;
  brand: string;
  productType: string;
  capacity: string;
  voltage: string;
  pricePerUnit: number;
  unit: string;
  efficiency: number;
  warrantyYears: bigint;
  isActive: boolean;
};

const STATIC_PRODUCTS: StaticProduct[] = [
  // Solar Panels
  {
    id: BigInt(1),
    category: "Solar Panel",
    brand: "Waaree",
    productType: "Mono PERC",
    capacity: "540W",
    voltage: "N/A",
    pricePerUnit: 22000,
    unit: "Nos",
    efficiency: 20.8,
    warrantyYears: BigInt(25),
    isActive: true,
  },
  {
    id: BigInt(2),
    category: "Solar Panel",
    brand: "Waaree",
    productType: "TOPCon",
    capacity: "550W",
    voltage: "N/A",
    pricePerUnit: 24000,
    unit: "Nos",
    efficiency: 21.5,
    warrantyYears: BigInt(25),
    isActive: true,
  },
  {
    id: BigInt(3),
    category: "Solar Panel",
    brand: "Waaree",
    productType: "TOPCon",
    capacity: "700W",
    voltage: "N/A",
    pricePerUnit: 29000,
    unit: "Nos",
    efficiency: 22.1,
    warrantyYears: BigInt(25),
    isActive: true,
  },
  {
    id: BigInt(4),
    category: "Solar Panel",
    brand: "Waaree",
    productType: "TOPCon",
    capacity: "720W",
    voltage: "N/A",
    pricePerUnit: 30000,
    unit: "Nos",
    efficiency: 22.3,
    warrantyYears: BigInt(25),
    isActive: true,
  },
  {
    id: BigInt(5),
    category: "Solar Panel",
    brand: "Adani Solar",
    productType: "Mono PERC",
    capacity: "545W",
    voltage: "N/A",
    pricePerUnit: 23000,
    unit: "Nos",
    efficiency: 21.0,
    warrantyYears: BigInt(25),
    isActive: true,
  },
  {
    id: BigInt(6),
    category: "Solar Panel",
    brand: "Adani Solar",
    productType: "TOPCon",
    capacity: "600W",
    voltage: "N/A",
    pricePerUnit: 26000,
    unit: "Nos",
    efficiency: 21.8,
    warrantyYears: BigInt(25),
    isActive: true,
  },
  {
    id: BigInt(7),
    category: "Solar Panel",
    brand: "Adani Solar",
    productType: "Bifacial TOPCon",
    capacity: "700W",
    voltage: "N/A",
    pricePerUnit: 30000,
    unit: "Nos",
    efficiency: 22.5,
    warrantyYears: BigInt(25),
    isActive: true,
  },
  {
    id: BigInt(8),
    category: "Solar Panel",
    brand: "Longi Solar",
    productType: "Mono PERC",
    capacity: "540W",
    voltage: "N/A",
    pricePerUnit: 21500,
    unit: "Nos",
    efficiency: 20.9,
    warrantyYears: BigInt(25),
    isActive: true,
  },
  {
    id: BigInt(9),
    category: "Solar Panel",
    brand: "Longi Solar",
    productType: "HJT",
    capacity: "600W",
    voltage: "N/A",
    pricePerUnit: 27000,
    unit: "Nos",
    efficiency: 23.0,
    warrantyYears: BigInt(30),
    isActive: true,
  },
  {
    id: BigInt(10),
    category: "Solar Panel",
    brand: "Vikram Solar",
    productType: "Mono PERC",
    capacity: "540W",
    voltage: "N/A",
    pricePerUnit: 22500,
    unit: "Nos",
    efficiency: 21.0,
    warrantyYears: BigInt(25),
    isActive: true,
  },
  {
    id: BigInt(11),
    category: "Solar Panel",
    brand: "Vikram Solar",
    productType: "TOPCon",
    capacity: "550W",
    voltage: "N/A",
    pricePerUnit: 24500,
    unit: "Nos",
    efficiency: 21.6,
    warrantyYears: BigInt(25),
    isActive: true,
  },
  {
    id: BigInt(12),
    category: "Solar Panel",
    brand: "Tata Power Solar",
    productType: "Mono PERC",
    capacity: "500W",
    voltage: "N/A",
    pricePerUnit: 21000,
    unit: "Nos",
    efficiency: 20.5,
    warrantyYears: BigInt(25),
    isActive: true,
  },
  {
    id: BigInt(13),
    category: "Solar Panel",
    brand: "Tata Power Solar",
    productType: "TOPCon",
    capacity: "545W",
    voltage: "N/A",
    pricePerUnit: 23500,
    unit: "Nos",
    efficiency: 21.2,
    warrantyYears: BigInt(25),
    isActive: true,
  },
  {
    id: BigInt(14),
    category: "Solar Panel",
    brand: "REC Group",
    productType: "HJT",
    capacity: "405W",
    voltage: "N/A",
    pricePerUnit: 19000,
    unit: "Nos",
    efficiency: 22.0,
    warrantyYears: BigInt(25),
    isActive: true,
  },
  {
    id: BigInt(15),
    category: "Solar Panel",
    brand: "Renewsys",
    productType: "Polycrystalline",
    capacity: "330W",
    voltage: "N/A",
    pricePerUnit: 12000,
    unit: "Nos",
    efficiency: 17.0,
    warrantyYears: BigInt(25),
    isActive: true,
  },
  {
    id: BigInt(16),
    category: "Solar Panel",
    brand: "Renewsys",
    productType: "Mono PERC",
    capacity: "440W",
    voltage: "N/A",
    pricePerUnit: 18000,
    unit: "Nos",
    efficiency: 20.2,
    warrantyYears: BigInt(25),
    isActive: true,
  },
  {
    id: BigInt(17),
    category: "Solar Panel",
    brand: "Goldi Solar",
    productType: "TOPCon",
    capacity: "540W",
    voltage: "N/A",
    pricePerUnit: 22000,
    unit: "Nos",
    efficiency: 21.0,
    warrantyYears: BigInt(25),
    isActive: true,
  },
  {
    id: BigInt(18),
    category: "Solar Panel",
    brand: "Avaada",
    productType: "Mono PERC",
    capacity: "545W",
    voltage: "N/A",
    pricePerUnit: 22500,
    unit: "Nos",
    efficiency: 21.1,
    warrantyYears: BigInt(25),
    isActive: true,
  },
  {
    id: BigInt(19),
    category: "Solar Panel",
    brand: "Generic",
    productType: "Polycrystalline",
    capacity: "50W",
    voltage: "12V",
    pricePerUnit: 2800,
    unit: "Nos",
    efficiency: 15.0,
    warrantyYears: BigInt(10),
    isActive: true,
  },
  {
    id: BigInt(20),
    category: "Solar Panel",
    brand: "Generic",
    productType: "Mono PERC",
    capacity: "100W",
    voltage: "12V",
    pricePerUnit: 5200,
    unit: "Nos",
    efficiency: 18.0,
    warrantyYears: BigInt(10),
    isActive: true,
  },
  {
    id: BigInt(21),
    category: "Solar Panel",
    brand: "Generic",
    productType: "Mono PERC",
    capacity: "150W",
    voltage: "12V",
    pricePerUnit: 7500,
    unit: "Nos",
    efficiency: 18.5,
    warrantyYears: BigInt(10),
    isActive: true,
  },
  {
    id: BigInt(22),
    category: "Solar Panel",
    brand: "Generic",
    productType: "Mono PERC",
    capacity: "200W",
    voltage: "24V",
    pricePerUnit: 9800,
    unit: "Nos",
    efficiency: 19.0,
    warrantyYears: BigInt(10),
    isActive: true,
  },
  // Inverters
  {
    id: BigInt(23),
    category: "Inverter",
    brand: "Sungrow",
    productType: "String",
    capacity: "5kW",
    voltage: "220V AC",
    pricePerUnit: 45000,
    unit: "Nos",
    efficiency: 98.4,
    warrantyYears: BigInt(5),
    isActive: true,
  },
  {
    id: BigInt(24),
    category: "Inverter",
    brand: "Sungrow",
    productType: "String",
    capacity: "10kW",
    voltage: "220V AC",
    pricePerUnit: 75000,
    unit: "Nos",
    efficiency: 98.6,
    warrantyYears: BigInt(5),
    isActive: true,
  },
  {
    id: BigInt(25),
    category: "Inverter",
    brand: "Sungrow",
    productType: "Hybrid",
    capacity: "5kW",
    voltage: "220V AC",
    pricePerUnit: 65000,
    unit: "Nos",
    efficiency: 97.5,
    warrantyYears: BigInt(5),
    isActive: true,
  },
  {
    id: BigInt(26),
    category: "Inverter",
    brand: "Sungrow",
    productType: "Hybrid",
    capacity: "10kW",
    voltage: "220V AC",
    pricePerUnit: 95000,
    unit: "Nos",
    efficiency: 97.8,
    warrantyYears: BigInt(5),
    isActive: true,
  },
  {
    id: BigInt(27),
    category: "Inverter",
    brand: "Growatt",
    productType: "String",
    capacity: "5kW",
    voltage: "220V AC",
    pricePerUnit: 38000,
    unit: "Nos",
    efficiency: 97.8,
    warrantyYears: BigInt(5),
    isActive: true,
  },
  {
    id: BigInt(28),
    category: "Inverter",
    brand: "Growatt",
    productType: "Hybrid",
    capacity: "5kW",
    voltage: "220V AC",
    pricePerUnit: 55000,
    unit: "Nos",
    efficiency: 97.0,
    warrantyYears: BigInt(5),
    isActive: true,
  },
  {
    id: BigInt(29),
    category: "Inverter",
    brand: "Growatt",
    productType: "Off-grid",
    capacity: "3kW",
    voltage: "24V DC",
    pricePerUnit: 28000,
    unit: "Nos",
    efficiency: 93.0,
    warrantyYears: BigInt(2),
    isActive: true,
  },
  {
    id: BigInt(30),
    category: "Inverter",
    brand: "Luminous",
    productType: "Off-grid",
    capacity: "1kW",
    voltage: "12V DC",
    pricePerUnit: 8500,
    unit: "Nos",
    efficiency: 90.0,
    warrantyYears: BigInt(2),
    isActive: true,
  },
  {
    id: BigInt(31),
    category: "Inverter",
    brand: "Luminous",
    productType: "Off-grid",
    capacity: "2kW",
    voltage: "24V DC",
    pricePerUnit: 14000,
    unit: "Nos",
    efficiency: 92.0,
    warrantyYears: BigInt(2),
    isActive: true,
  },
  {
    id: BigInt(32),
    category: "Inverter",
    brand: "Luminous",
    productType: "Hybrid",
    capacity: "3kW",
    voltage: "24V DC",
    pricePerUnit: 35000,
    unit: "Nos",
    efficiency: 93.5,
    warrantyYears: BigInt(3),
    isActive: true,
  },
  {
    id: BigInt(33),
    category: "Inverter",
    brand: "Havells",
    productType: "String",
    capacity: "3kW",
    voltage: "220V AC",
    pricePerUnit: 30000,
    unit: "Nos",
    efficiency: 97.0,
    warrantyYears: BigInt(5),
    isActive: true,
  },
  {
    id: BigInt(34),
    category: "Inverter",
    brand: "Havells",
    productType: "String",
    capacity: "5kW",
    voltage: "220V AC",
    pricePerUnit: 42000,
    unit: "Nos",
    efficiency: 97.5,
    warrantyYears: BigInt(5),
    isActive: true,
  },
  {
    id: BigInt(35),
    category: "Inverter",
    brand: "Microtek",
    productType: "Off-grid",
    capacity: "1kW",
    voltage: "12V DC",
    pricePerUnit: 7500,
    unit: "Nos",
    efficiency: 88.0,
    warrantyYears: BigInt(2),
    isActive: true,
  },
  {
    id: BigInt(36),
    category: "Inverter",
    brand: "Microtek",
    productType: "Hybrid",
    capacity: "2kW",
    voltage: "24V DC",
    pricePerUnit: 22000,
    unit: "Nos",
    efficiency: 91.0,
    warrantyYears: BigInt(2),
    isActive: true,
  },
  {
    id: BigInt(37),
    category: "Inverter",
    brand: "Solax",
    productType: "Hybrid",
    capacity: "5kW",
    voltage: "220V AC",
    pricePerUnit: 58000,
    unit: "Nos",
    efficiency: 97.5,
    warrantyYears: BigInt(5),
    isActive: true,
  },
  {
    id: BigInt(38),
    category: "Inverter",
    brand: "ABB/FIMER",
    productType: "String",
    capacity: "10kW",
    voltage: "400V AC",
    pricePerUnit: 80000,
    unit: "Nos",
    efficiency: 98.0,
    warrantyYears: BigInt(5),
    isActive: true,
  },
  {
    id: BigInt(39),
    category: "Inverter",
    brand: "Huawei",
    productType: "String",
    capacity: "20kW",
    voltage: "400V AC",
    pricePerUnit: 140000,
    unit: "Nos",
    efficiency: 98.6,
    warrantyYears: BigInt(5),
    isActive: true,
  },
  {
    id: BigInt(40),
    category: "Inverter",
    brand: "Delta",
    productType: "String",
    capacity: "15kW",
    voltage: "400V AC",
    pricePerUnit: 110000,
    unit: "Nos",
    efficiency: 98.2,
    warrantyYears: BigInt(5),
    isActive: true,
  },
  // Batteries
  {
    id: BigInt(41),
    category: "Battery",
    brand: "Luminous",
    productType: "Tubular Lead-Acid",
    capacity: "150Ah",
    voltage: "12V",
    pricePerUnit: 12000,
    unit: "Nos",
    efficiency: 80.0,
    warrantyYears: BigInt(3),
    isActive: true,
  },
  {
    id: BigInt(42),
    category: "Battery",
    brand: "Luminous",
    productType: "Tubular Lead-Acid",
    capacity: "200Ah",
    voltage: "12V",
    pricePerUnit: 15000,
    unit: "Nos",
    efficiency: 80.0,
    warrantyYears: BigInt(3),
    isActive: true,
  },
  {
    id: BigInt(43),
    category: "Battery",
    brand: "Amaron",
    productType: "Tubular Lead-Acid",
    capacity: "200Ah",
    voltage: "12V",
    pricePerUnit: 16000,
    unit: "Nos",
    efficiency: 80.0,
    warrantyYears: BigInt(3),
    isActive: true,
  },
  {
    id: BigInt(44),
    category: "Battery",
    brand: "Exide",
    productType: "Tubular Lead-Acid",
    capacity: "150Ah",
    voltage: "12V",
    pricePerUnit: 13000,
    unit: "Nos",
    efficiency: 80.0,
    warrantyYears: BigInt(3),
    isActive: true,
  },
  {
    id: BigInt(45),
    category: "Battery",
    brand: "Exide",
    productType: "Tubular Lead-Acid",
    capacity: "200Ah",
    voltage: "12V",
    pricePerUnit: 16500,
    unit: "Nos",
    efficiency: 80.0,
    warrantyYears: BigInt(3),
    isActive: true,
  },
  {
    id: BigInt(46),
    category: "Battery",
    brand: "Livguard",
    productType: "Tubular Lead-Acid",
    capacity: "200Ah",
    voltage: "12V",
    pricePerUnit: 14500,
    unit: "Nos",
    efficiency: 80.0,
    warrantyYears: BigInt(3),
    isActive: true,
  },
  {
    id: BigInt(47),
    category: "Battery",
    brand: "Okaya",
    productType: "Tubular Lead-Acid",
    capacity: "200Ah",
    voltage: "12V",
    pricePerUnit: 14000,
    unit: "Nos",
    efficiency: 80.0,
    warrantyYears: BigInt(3),
    isActive: true,
  },
  {
    id: BigInt(48),
    category: "Battery",
    brand: "Genus",
    productType: "Flat Plate",
    capacity: "100Ah",
    voltage: "12V",
    pricePerUnit: 8000,
    unit: "Nos",
    efficiency: 75.0,
    warrantyYears: BigInt(2),
    isActive: true,
  },
  {
    id: BigInt(49),
    category: "Battery",
    brand: "Waaree Energy",
    productType: "LiFePO4",
    capacity: "100Ah",
    voltage: "48V",
    pricePerUnit: 28000,
    unit: "Nos",
    efficiency: 96.0,
    warrantyYears: BigInt(5),
    isActive: true,
  },
  {
    id: BigInt(50),
    category: "Battery",
    brand: "Shoto",
    productType: "LiFePO4",
    capacity: "100Ah",
    voltage: "48V",
    pricePerUnit: 26000,
    unit: "Nos",
    efficiency: 96.0,
    warrantyYears: BigInt(5),
    isActive: true,
  },
  {
    id: BigInt(51),
    category: "Battery",
    brand: "Pylontech",
    productType: "LiFePO4",
    capacity: "74Ah",
    voltage: "48V",
    pricePerUnit: 30000,
    unit: "Nos",
    efficiency: 96.5,
    warrantyYears: BigInt(10),
    isActive: true,
  },
  {
    id: BigInt(52),
    category: "Battery",
    brand: "BYD",
    productType: "Lithium-Ion",
    capacity: "100Ah",
    voltage: "48V",
    pricePerUnit: 32000,
    unit: "Nos",
    efficiency: 95.0,
    warrantyYears: BigInt(10),
    isActive: true,
  },
  {
    id: BigInt(53),
    category: "Battery",
    brand: "Generic",
    productType: "Lead-Acid",
    capacity: "150Ah",
    voltage: "24V",
    pricePerUnit: 22000,
    unit: "Nos",
    efficiency: 78.0,
    warrantyYears: BigInt(2),
    isActive: true,
  },
  // Cables
  {
    id: BigInt(54),
    category: "Cable",
    brand: "Havells",
    productType: "DC Solar Cable",
    capacity: "4sqmm",
    voltage: "1000V DC",
    pricePerUnit: 28,
    unit: "Mtr",
    efficiency: 0,
    warrantyYears: BigInt(10),
    isActive: true,
  },
  {
    id: BigInt(55),
    category: "Cable",
    brand: "Havells",
    productType: "DC Solar Cable",
    capacity: "6sqmm",
    voltage: "1000V DC",
    pricePerUnit: 38,
    unit: "Mtr",
    efficiency: 0,
    warrantyYears: BigInt(10),
    isActive: true,
  },
  {
    id: BigInt(56),
    category: "Cable",
    brand: "Havells",
    productType: "AC Power Cable",
    capacity: "4sqmm",
    voltage: "1100V AC",
    pricePerUnit: 30,
    unit: "Mtr",
    efficiency: 0,
    warrantyYears: BigInt(10),
    isActive: true,
  },
  {
    id: BigInt(57),
    category: "Cable",
    brand: "Havells",
    productType: "AC Power Cable",
    capacity: "6sqmm",
    voltage: "1100V AC",
    pricePerUnit: 42,
    unit: "Mtr",
    efficiency: 0,
    warrantyYears: BigInt(10),
    isActive: true,
  },
  {
    id: BigInt(58),
    category: "Cable",
    brand: "Havells",
    productType: "Earthing Cable",
    capacity: "16sqmm",
    voltage: "N/A",
    pricePerUnit: 48,
    unit: "Mtr",
    efficiency: 0,
    warrantyYears: BigInt(10),
    isActive: true,
  },
  {
    id: BigInt(59),
    category: "Cable",
    brand: "Polycab",
    productType: "DC Solar Cable",
    capacity: "6sqmm",
    voltage: "1000V DC",
    pricePerUnit: 36,
    unit: "Mtr",
    efficiency: 0,
    warrantyYears: BigInt(10),
    isActive: true,
  },
  {
    id: BigInt(60),
    category: "Cable",
    brand: "Polycab",
    productType: "AC Power Cable",
    capacity: "4sqmm",
    voltage: "1100V AC",
    pricePerUnit: 28,
    unit: "Mtr",
    efficiency: 0,
    warrantyYears: BigInt(10),
    isActive: true,
  },
  {
    id: BigInt(61),
    category: "Cable",
    brand: "Polycab",
    productType: "AC Power Cable",
    capacity: "10sqmm",
    voltage: "1100V AC",
    pricePerUnit: 65,
    unit: "Mtr",
    efficiency: 0,
    warrantyYears: BigInt(10),
    isActive: true,
  },
  {
    id: BigInt(62),
    category: "Cable",
    brand: "Polycab",
    productType: "Battery Interconnect",
    capacity: "50sqmm",
    voltage: "N/A",
    pricePerUnit: 180,
    unit: "Mtr",
    efficiency: 0,
    warrantyYears: BigInt(5),
    isActive: true,
  },
  {
    id: BigInt(63),
    category: "Cable",
    brand: "KEI",
    productType: "DC Solar Cable",
    capacity: "6sqmm",
    voltage: "1000V DC",
    pricePerUnit: 37,
    unit: "Mtr",
    efficiency: 0,
    warrantyYears: BigInt(10),
    isActive: true,
  },
  {
    id: BigInt(64),
    category: "Cable",
    brand: "KEI",
    productType: "AC Power Cable",
    capacity: "6sqmm",
    voltage: "1100V AC",
    pricePerUnit: 40,
    unit: "Mtr",
    efficiency: 0,
    warrantyYears: BigInt(10),
    isActive: true,
  },
  {
    id: BigInt(65),
    category: "Cable",
    brand: "KEI",
    productType: "Earthing Cable",
    capacity: "25sqmm",
    voltage: "N/A",
    pricePerUnit: 75,
    unit: "Mtr",
    efficiency: 0,
    warrantyYears: BigInt(10),
    isActive: true,
  },
  {
    id: BigInt(66),
    category: "Cable",
    brand: "Finolex",
    productType: "AC Power Cable",
    capacity: "4sqmm",
    voltage: "1100V AC",
    pricePerUnit: 27,
    unit: "Mtr",
    efficiency: 0,
    warrantyYears: BigInt(10),
    isActive: true,
  },
  {
    id: BigInt(67),
    category: "Cable",
    brand: "Lapp",
    productType: "DC Solar Cable",
    capacity: "6sqmm",
    voltage: "1500V DC",
    pricePerUnit: 55,
    unit: "Mtr",
    efficiency: 0,
    warrantyYears: BigInt(25),
    isActive: true,
  },
  // Structure
  {
    id: BigInt(68),
    category: "Structure",
    brand: "Local Fabricator",
    productType: "GI Structure",
    capacity: "Rooftop RCC",
    voltage: "N/A",
    pricePerUnit: 3800,
    unit: "Nos",
    efficiency: 0,
    warrantyYears: BigInt(5),
    isActive: true,
  },
  {
    id: BigInt(69),
    category: "Structure",
    brand: "Local Fabricator",
    productType: "MS Structure",
    capacity: "Rooftop RCC",
    voltage: "N/A",
    pricePerUnit: 4200,
    unit: "Nos",
    efficiency: 0,
    warrantyYears: BigInt(5),
    isActive: true,
  },
  {
    id: BigInt(70),
    category: "Structure",
    brand: "Local Fabricator",
    productType: "Aluminium Structure",
    capacity: "Rooftop RCC",
    voltage: "N/A",
    pricePerUnit: 5500,
    unit: "Nos",
    efficiency: 0,
    warrantyYears: BigInt(10),
    isActive: true,
  },
  {
    id: BigInt(71),
    category: "Structure",
    brand: "Local Fabricator",
    productType: "GI Roof Hook Structure",
    capacity: "Sheet Metal Roof",
    voltage: "N/A",
    pricePerUnit: 3500,
    unit: "Nos",
    efficiency: 0,
    warrantyYears: BigInt(5),
    isActive: true,
  },
  {
    id: BigInt(72),
    category: "Structure",
    brand: "Local Fabricator",
    productType: "MS Ground Mount",
    capacity: "Ground Mount",
    voltage: "N/A",
    pricePerUnit: 6500,
    unit: "Nos",
    efficiency: 0,
    warrantyYears: BigInt(5),
    isActive: true,
  },
  {
    id: BigInt(73),
    category: "Structure",
    brand: "Local Fabricator",
    productType: "GI Ground Mount",
    capacity: "Ground Mount",
    voltage: "N/A",
    pricePerUnit: 6000,
    unit: "Nos",
    efficiency: 0,
    warrantyYears: BigInt(5),
    isActive: true,
  },
  {
    id: BigInt(74),
    category: "Structure",
    brand: "Local Fabricator",
    productType: "Elevated MS Structure",
    capacity: "Elevated",
    voltage: "N/A",
    pricePerUnit: 8500,
    unit: "Nos",
    efficiency: 0,
    warrantyYears: BigInt(5),
    isActive: true,
  },
  {
    id: BigInt(75),
    category: "Structure",
    brand: "Local Fabricator",
    productType: "Carport Structure",
    capacity: "Carport",
    voltage: "N/A",
    pricePerUnit: 12000,
    unit: "Nos",
    efficiency: 0,
    warrantyYears: BigInt(5),
    isActive: true,
  },
  {
    id: BigInt(76),
    category: "Structure",
    brand: "Local Fabricator",
    productType: "Agricultural Land Mount",
    capacity: "Agricultural",
    voltage: "N/A",
    pricePerUnit: 7500,
    unit: "Nos",
    efficiency: 0,
    warrantyYears: BigInt(5),
    isActive: true,
  },
  {
    id: BigInt(77),
    category: "Structure",
    brand: "Enerack",
    productType: "Aluminium Rooftop",
    capacity: "Rooftop RCC",
    voltage: "N/A",
    pricePerUnit: 6000,
    unit: "Nos",
    efficiency: 0,
    warrantyYears: BigInt(10),
    isActive: true,
  },
  {
    id: BigInt(78),
    category: "Structure",
    brand: "Enerack",
    productType: "Ground Mount Tracker",
    capacity: "Ground Mount",
    voltage: "N/A",
    pricePerUnit: 14000,
    unit: "Nos",
    efficiency: 0,
    warrantyYears: BigInt(10),
    isActive: true,
  },
  {
    id: BigInt(79),
    category: "Structure",
    brand: "Schletter",
    productType: "Aluminium Rooftop",
    capacity: "Rooftop RCC",
    voltage: "N/A",
    pricePerUnit: 7000,
    unit: "Nos",
    efficiency: 0,
    warrantyYears: BigInt(10),
    isActive: true,
  },
];

// Category → productId field mapping
const CATEGORY_TO_PRODUCT_FIELD: Record<
  string,
  keyof typeof EMPTY_PRODUCT_IDS
> = {
  "Solar Panel": "panelId",
  Inverter: "inverterId",
  Battery: "batteryId",
  Cable: "cableId",
  Structure: "structureId",
};
const EMPTY_PRODUCT_IDS = {
  panelId: null as bigint | null,
  inverterId: null as bigint | null,
  batteryId: null as bigint | null,
  cableId: null as bigint | null,
  structureId: null as bigint | null,
};

// Category display config for Brand Reference
const BRAND_REF_CATEGORIES = [
  {
    id: "Solar Panel",
    label: "Solar Panel",
    color: "bg-amber-50 border-amber-200",
    chipColor: "bg-amber-100 text-amber-800 border-amber-300",
  },
  {
    id: "Inverter",
    label: "Inverter",
    color: "bg-blue-50 border-blue-200",
    chipColor: "bg-blue-100 text-blue-800 border-blue-300",
  },
  {
    id: "Battery",
    label: "Battery",
    color: "bg-green-50 border-green-200",
    chipColor: "bg-green-100 text-green-800 border-green-300",
  },
  {
    id: "Cable",
    label: "Cable",
    color: "bg-orange-50 border-orange-200",
    chipColor: "bg-orange-100 text-orange-800 border-orange-300",
  },
  {
    id: "Structure",
    label: "Mounting Structure",
    color: "bg-purple-50 border-purple-200",
    chipColor: "bg-purple-100 text-purple-800 border-purple-300",
  },
];

const STEPS = [
  { label: "Basic Info", icon: FileText },
  { label: "Load & Specs", icon: Zap },
  { label: "MOQ Review", icon: Sun },
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

export function ProjectWizard({
  onComplete,
  editProjectId,
}: {
  onComplete: () => void;
  editProjectId?: bigint;
}) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const isEditMode = editProjectId !== undefined;
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moqGenerated, setMoqGenerated] = useState(false);
  const [isRegenMOQ, setIsRegenMOQ] = useState(false);
  const [moqError, setMoqError] = useState<string | null>(null);

  // Step 1
  const [clientName, setClientName] = useState("");
  const [installationType, setInstallationType] =
    useState<Variant_sheetMetal_rccRooftop_other_groundMount>(
      Variant_sheetMetal_rccRooftop_other_groundMount.rccRooftop,
    );
  const [systemType, setSystemType] = useState<Variant_hybrid_offGrid_onGrid>(
    Variant_hybrid_offGrid_onGrid.onGrid,
  );

  // Step 2 — Load Input
  const [loadMethod, setLoadMethod] = useState<"consumption" | "appliance">(
    "consumption",
  );
  const [monthlyKWh, setMonthlyKWh] = useState("");
  const [tariff, setTariff] = useState("");
  const [dayNightRatio, setDayNightRatio] = useState("70");
  const [appliances, setAppliances] = useState<ApplianceEntry[]>([]);
  const [selectedPreset, setSelectedPreset] = useState("");

  // Project / MOQ state
  const [projectId, setProjectId] = useState<bigint | null>(
    editProjectId ?? null,
  );
  const { data: moqItems, isLoading: moqLoading } = useMOQ(projectId);
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>(
    {},
  );

  // Brand Reference cascaded spec state: category → { brand, type, capacity }
  const [selectedBrandSpec, setSelectedBrandSpec] = useState<
    Record<string, { brand: string; type: string; capacity: string }>
  >({});

  // Product specification selection from Product Master
  const { data: allProducts } = useProductMaster();
  const [selectedProductIds, setSelectedProductIds] = useState<{
    panelId: bigint | null;
    inverterId: bigint | null;
    batteryId: bigint | null;
    cableId: bigint | null;
    structureId: bigint | null;
  }>({
    panelId: null,
    inverterId: null,
    batteryId: null,
    cableId: null,
    structureId: null,
  });

  // Quotation fields
  const [companyName, setCompanyName] = useState("Origin Solar EPC Pro");
  const [gstPercent, setGstPercent] = useState("18");
  const [subsidyAmount, setSubsidyAmount] = useState("0");

  // Ref to avoid running auto-regen on first mount / edit load
  const isFirstRender = useRef(true);

  // Load project data when in edit mode
  useEffect(() => {
    if (!isEditMode || !editProjectId || !actor) return;
    (async () => {
      try {
        const project = await actor.getProject(editProjectId);
        if (project) {
          setClientName(project.clientName);
          setSystemType(project.systemType);
          setInstallationType(project.installationType);
          setMonthlyKWh((project.systemSizeKW * 30 * 4.5).toFixed(0));
        }
        // Pre-populate MOQ cache
        const fetchedMOQ = await actor.listMOQ(editProjectId);
        queryClient.setQueryData(["moq", editProjectId.toString()], fetchedMOQ);
        // Mark MOQ as generated so spec selectors appear immediately
        setMoqGenerated(true);
      } catch (err) {
        console.error("Failed to load project for editing:", err);
      }
    })();
  }, [isEditMode, editProjectId, actor, queryClient]);

  // Auto-regenerate MOQ when product specs change (after initial MOQ generation)
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally watching only selectedProductIds to trigger regen on spec change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!moqGenerated || !projectId || !actor) return;

    const hasAnyProduct = Object.values(selectedProductIds).some(
      (v) => v !== null,
    );
    const regen = async () => {
      setIsRegenMOQ(true);
      try {
        if (hasAnyProduct) {
          await actor.generateMOQWithProducts(
            projectId,
            selectedProductIds.panelId,
            selectedProductIds.inverterId,
            selectedProductIds.batteryId,
            selectedProductIds.cableId,
            selectedProductIds.structureId,
          );
        } else {
          await actor.generateMOQ(projectId);
        }
        const refreshed = await actor.listMOQ(projectId);
        queryClient.setQueryData(["moq", projectId.toString()], refreshed);
        toast.success("MOQ updated with new specifications");
      } catch {
        toast.error("Failed to update MOQ");
      } finally {
        setIsRegenMOQ(false);
      }
    };
    regen();
  }, [selectedProductIds]);

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

  const handleCreateOrUpdateProject = async () => {
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
    setMoqError(null);
    try {
      let id: bigint;

      if (isEditMode && editProjectId !== undefined) {
        await actor.updateProject(
          editProjectId,
          clientName,
          systemType,
          installationType,
          systemSizeKW,
          systemType !== Variant_hybrid_offGrid_onGrid.onGrid
            ? systemSizeKW * 2
            : 0,
        );
        id = editProjectId;
      } else {
        id = await actor.createProject(
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
      }

      // Auto-generate MOQ (with selected products if any)
      const hasAnyProduct =
        selectedProductIds.panelId !== null ||
        selectedProductIds.inverterId !== null ||
        selectedProductIds.batteryId !== null ||
        selectedProductIds.cableId !== null ||
        selectedProductIds.structureId !== null;

      if (hasAnyProduct) {
        await actor.generateMOQWithProducts(
          id,
          selectedProductIds.panelId,
          selectedProductIds.inverterId,
          selectedProductIds.batteryId,
          selectedProductIds.cableId,
          selectedProductIds.structureId,
        );
      } else {
        await actor.generateMOQ(id);
      }

      const fetchedMOQ = await actor.listMOQ(id);
      queryClient.setQueryData(["moq", id.toString()], fetchedMOQ);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setProjectId(id);
      // Mark MOQ as generated — reveal spec selectors on same page (step 1)
      setMoqGenerated(true);
      setMoqError(null);
      // Reset first-render guard so subsequent spec changes trigger auto-regen
      isFirstRender.current = false;
      toast.success(
        isEditMode
          ? "Project updated! MOQ regenerated."
          : "Project created! MOQ generated.",
      );
    } catch (err) {
      console.error("createProject error:", err);
      const rawMsg = err instanceof Error ? err.message : String(err);
      const isOffline =
        rawMsg.includes("IC0508") ||
        rawMsg.includes("is stopped") ||
        rawMsg.includes("rejected") ||
        rawMsg.includes("non_replicated_rejection");
      const userMsg = isOffline
        ? "The backend is offline. Please wait a moment and try again."
        : `Failed to ${isEditMode ? "update" : "create"} project: ${rawMsg}`;
      setMoqError(userMsg);
      toast.error(userMsg, { duration: 6000 });
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
  const carbonSavings = systemSizeKW * 4.5 * 365 * 0.82;

  const roiData = generateROIData(netCost, annualSavings);

  const handleCreateQuotation = async () => {
    if (!actor) return;
    setIsSubmitting(true);
    try {
      const propNum = generateNextProposalNumber();
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

  const canProceedStep1 = clientName.trim().length > 0;
  const canProceedLoadInput =
    loadMethod === "consumption"
      ? Number.parseFloat(monthlyKWh) > 0
      : appliances.length > 0;

  // Helper: render product spec card after selection
  const renderSelectedSpec = (
    bg: string,
    border: string,
    text: string,
    content: string,
    price: string,
  ) => (
    <div
      className={`mt-1.5 p-2 rounded-md ${bg} ${border} text-xs ${text} flex justify-between items-center`}
    >
      <span>{content}</span>
      <span className="font-bold ml-2">{price}</span>
    </div>
  );

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display">
          {isEditMode && clientName
            ? `Editing: ${clientName}`
            : isEditMode
              ? "Edit Project"
              : "New Project Wizard"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Step {step + 1} of {STEPS.length}
          {isEditMode && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-solar/20 text-solar-dark border border-solar/30 font-medium">
              Edit Mode
            </span>
          )}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex gap-1 items-center overflow-x-auto flex-nowrap pb-1">
        {STEPS.map((s, i) => (
          <div key={s.label} className="flex items-center gap-1 flex-shrink-0">
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
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
                className={`h-0.5 w-4 sm:flex-1 sm:w-auto rounded-full flex-shrink-0 ${i < step ? "bg-navy/30" : "bg-border"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* ───────────────────────────────────────────────
          STEP 1: Basic Info
      ─────────────────────────────────────────────── */}
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

      {/* ───────────────────────────────────────────────
          STEP 2: Load & Specs (combined)
      ─────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Guided instruction banner — shown before MOQ is generated */}
          {!moqGenerated && !moqError && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-lg border border-navy/30 bg-navy/5">
              <Info className="h-4 w-4 text-navy mt-0.5 shrink-0" />
              <p className="text-sm text-navy">
                Fill in your load data below, then click{" "}
                <strong>Generate MOQ</strong> to calculate the bill of materials
                and continue.
              </p>
            </div>
          )}

          {/* Error banner — shown when MOQ generation failed */}
          {moqError && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-lg border border-destructive/40 bg-destructive/5">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-destructive font-medium">
                  {moqError}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCreateOrUpdateProject}
                  disabled={isSubmitting}
                  className="mt-2 gap-1.5 h-7 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Phase A — Load Input */}
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
                      <p className="text-sm">
                        Add appliances to calculate load
                      </p>
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

              {/* AI Load Suggestion Card */}
              {systemSizeKW > 0 && (
                <div className="mt-4">
                  <AILoadSuggestionCard
                    systemKW={systemSizeKW}
                    systemType={systemType}
                    backupHours={
                      systemType !== Variant_hybrid_offGrid_onGrid.onGrid
                        ? 4
                        : 0
                    }
                    tariff={Number.parseFloat(tariff || "8.5")}
                  />
                </div>
              )}

              {/* Generate MOQ button inside load card */}
              <div className="mt-4 pt-4 border-t border-border">
                <Button
                  type="button"
                  onClick={handleCreateOrUpdateProject}
                  disabled={
                    !canProceedStep1 ||
                    !canProceedLoadInput ||
                    systemSizeKW <= 0 ||
                    isSubmitting
                  }
                  className="w-full gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : moqGenerated ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                  {isSubmitting
                    ? isEditMode
                      ? "Updating & Regenerating..."
                      : "Generating MOQ..."
                    : moqGenerated
                      ? isEditMode
                        ? "Update & Regenerate MOQ"
                        : "Regenerate MOQ"
                      : "Generate MOQ"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Phase B — Material Specifications (revealed after MOQ generated) */}
          {moqGenerated && (
            <Card className="border-navy/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4 text-navy" />
                  Material Specifications
                  {isRegenMOQ && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-navy ml-1" />
                  )}
                  <span className="ml-auto text-xs font-normal text-muted-foreground">
                    Selecting a product auto-updates MOQ pricing
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Solar Panel */}
                {(() => {
                  const panels = (allProducts ?? []).filter(
                    (p) => p.category === "Solar Panel" && p.isActive,
                  );
                  if (panels.length === 0) return null;
                  const sel = panels.find(
                    (p) => p.id === selectedProductIds.panelId,
                  );
                  return (
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-navy">
                        Solar Panel
                      </Label>
                      <Select
                        value={selectedProductIds.panelId?.toString() ?? ""}
                        onValueChange={(v) =>
                          setSelectedProductIds((prev) => ({
                            ...prev,
                            panelId: v ? BigInt(v) : null,
                          }))
                        }
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select panel model..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">
                            — None (use default pricing) —
                          </SelectItem>
                          {panels.map((p) => (
                            <SelectItem
                              key={p.id.toString()}
                              value={p.id.toString()}
                            >
                              {p.brand} | {p.productType} | {p.capacity} — ₹
                              {p.pricePerUnit.toLocaleString()}/{p.unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {sel &&
                        renderSelectedSpec(
                          "bg-solar/10",
                          "border border-solar/25",
                          "text-navy",
                          `${sel.brand} ${sel.productType} ${sel.capacity} | Eff: ${sel.efficiency}% | Warranty: ${Number(sel.warrantyYears)}yr`,
                          `₹${sel.pricePerUnit.toLocaleString()}`,
                        )}
                    </div>
                  );
                })()}

                {/* Inverter */}
                {(() => {
                  const inverters = (allProducts ?? []).filter(
                    (p) => p.category === "Inverter" && p.isActive,
                  );
                  if (inverters.length === 0) return null;
                  const sel = inverters.find(
                    (p) => p.id === selectedProductIds.inverterId,
                  );
                  return (
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-navy">
                        Inverter
                      </Label>
                      <Select
                        value={selectedProductIds.inverterId?.toString() ?? ""}
                        onValueChange={(v) =>
                          setSelectedProductIds((prev) => ({
                            ...prev,
                            inverterId: v ? BigInt(v) : null,
                          }))
                        }
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select inverter model..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">
                            — None (use default pricing) —
                          </SelectItem>
                          {inverters.map((p) => (
                            <SelectItem
                              key={p.id.toString()}
                              value={p.id.toString()}
                            >
                              {p.brand} | {p.productType} | {p.capacity} |{" "}
                              {p.voltage} — ₹{p.pricePerUnit.toLocaleString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {sel &&
                        renderSelectedSpec(
                          "bg-blue-50",
                          "border border-blue-200",
                          "text-navy",
                          `${sel.brand} ${sel.productType} ${sel.capacity} | ${sel.voltage} | Warranty: ${Number(sel.warrantyYears)}yr`,
                          `₹${sel.pricePerUnit.toLocaleString()}`,
                        )}
                    </div>
                  );
                })()}

                {/* Battery — only for off-grid/hybrid */}
                {(systemType === Variant_hybrid_offGrid_onGrid.offGrid ||
                  systemType === Variant_hybrid_offGrid_onGrid.hybrid) &&
                  (() => {
                    const batteries = (allProducts ?? []).filter(
                      (p) => p.category === "Battery" && p.isActive,
                    );
                    if (batteries.length === 0) return null;
                    const sel = batteries.find(
                      (p) => p.id === selectedProductIds.batteryId,
                    );
                    return (
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wider text-navy">
                          Battery
                        </Label>
                        <Select
                          value={selectedProductIds.batteryId?.toString() ?? ""}
                          onValueChange={(v) =>
                            setSelectedProductIds((prev) => ({
                              ...prev,
                              batteryId: v ? BigInt(v) : null,
                            }))
                          }
                        >
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Select battery model..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">
                              — None (use default pricing) —
                            </SelectItem>
                            {batteries.map((p) => (
                              <SelectItem
                                key={p.id.toString()}
                                value={p.id.toString()}
                              >
                                {p.brand} | {p.productType} | {p.capacity} |{" "}
                                {p.voltage} — ₹{p.pricePerUnit.toLocaleString()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {sel &&
                          renderSelectedSpec(
                            "bg-green-50",
                            "border border-green-200",
                            "text-navy",
                            `${sel.brand} ${sel.productType} ${sel.capacity} | ${sel.voltage} | Warranty: ${Number(sel.warrantyYears)}yr`,
                            `₹${sel.pricePerUnit.toLocaleString()}`,
                          )}
                      </div>
                    );
                  })()}

                {/* Cable */}
                {(() => {
                  const cables = (allProducts ?? []).filter(
                    (p) => p.category === "Cable" && p.isActive,
                  );
                  if (cables.length === 0) return null;
                  const sel = cables.find(
                    (p) => p.id === selectedProductIds.cableId,
                  );
                  return (
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-navy">
                        Cable Type
                      </Label>
                      <Select
                        value={selectedProductIds.cableId?.toString() ?? ""}
                        onValueChange={(v) =>
                          setSelectedProductIds((prev) => ({
                            ...prev,
                            cableId: v ? BigInt(v) : null,
                          }))
                        }
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select cable type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">
                            — None (use default pricing) —
                          </SelectItem>
                          {cables.map((p) => (
                            <SelectItem
                              key={p.id.toString()}
                              value={p.id.toString()}
                            >
                              {p.brand} | {p.productType} | {p.capacity} |{" "}
                              {p.voltage} — ₹{p.pricePerUnit.toLocaleString()}/
                              {p.unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {sel &&
                        renderSelectedSpec(
                          "bg-orange-50",
                          "border border-orange-200",
                          "text-navy",
                          `${sel.brand} ${sel.productType} ${sel.capacity} | ${sel.voltage}`,
                          `₹${sel.pricePerUnit.toLocaleString()}/${sel.unit}`,
                        )}
                    </div>
                  );
                })()}

                {/* Structure */}
                {(() => {
                  const structures = (allProducts ?? []).filter(
                    (p) => p.category === "Structure" && p.isActive,
                  );
                  if (structures.length === 0) return null;
                  const sel = structures.find(
                    (p) => p.id === selectedProductIds.structureId,
                  );
                  return (
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-navy">
                        Mounting Structure
                      </Label>
                      <Select
                        value={selectedProductIds.structureId?.toString() ?? ""}
                        onValueChange={(v) =>
                          setSelectedProductIds((prev) => ({
                            ...prev,
                            structureId: v ? BigInt(v) : null,
                          }))
                        }
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select structure type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">
                            — None (use default pricing) —
                          </SelectItem>
                          {structures.map((p) => (
                            <SelectItem
                              key={p.id.toString()}
                              value={p.id.toString()}
                            >
                              {p.brand} | {p.productType} | {p.capacity} — ₹
                              {p.pricePerUnit.toLocaleString()}/{p.unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {sel &&
                        renderSelectedSpec(
                          "bg-purple-50",
                          "border border-purple-200",
                          "text-navy",
                          `${sel.brand} ${sel.productType} | ${sel.capacity} | Warranty: ${Number(sel.warrantyYears)}yr`,
                          `₹${sel.pricePerUnit.toLocaleString()}/${sel.unit}`,
                        )}
                    </div>
                  );
                })()}

                {/* Selected product summary badges */}
                {(selectedProductIds.panelId ||
                  selectedProductIds.inverterId ||
                  selectedProductIds.batteryId ||
                  selectedProductIds.cableId ||
                  selectedProductIds.structureId) && (
                  <div className="p-3 rounded-lg bg-navy/5 border border-navy/15">
                    <p className="text-xs font-semibold text-navy mb-2">
                      Selected Specifications
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProductIds.panelId &&
                        allProducts?.find(
                          (p) => p.id === selectedProductIds.panelId,
                        ) && (
                          <Badge className="bg-amber-100 text-amber-800 border border-amber-300 text-xs">
                            Panel:{" "}
                            {
                              allProducts.find(
                                (p) => p.id === selectedProductIds.panelId,
                              )?.brand
                            }{" "}
                            {
                              allProducts.find(
                                (p) => p.id === selectedProductIds.panelId,
                              )?.capacity
                            }
                          </Badge>
                        )}
                      {selectedProductIds.inverterId &&
                        allProducts?.find(
                          (p) => p.id === selectedProductIds.inverterId,
                        ) && (
                          <Badge className="bg-blue-100 text-blue-800 border border-blue-300 text-xs">
                            Inverter:{" "}
                            {
                              allProducts.find(
                                (p) => p.id === selectedProductIds.inverterId,
                              )?.brand
                            }{" "}
                            {
                              allProducts.find(
                                (p) => p.id === selectedProductIds.inverterId,
                              )?.capacity
                            }
                          </Badge>
                        )}
                      {selectedProductIds.batteryId &&
                        allProducts?.find(
                          (p) => p.id === selectedProductIds.batteryId,
                        ) && (
                          <Badge className="bg-green-100 text-green-800 border border-green-300 text-xs">
                            Battery:{" "}
                            {
                              allProducts.find(
                                (p) => p.id === selectedProductIds.batteryId,
                              )?.brand
                            }{" "}
                            {
                              allProducts.find(
                                (p) => p.id === selectedProductIds.batteryId,
                              )?.capacity
                            }
                          </Badge>
                        )}
                      {selectedProductIds.cableId &&
                        allProducts?.find(
                          (p) => p.id === selectedProductIds.cableId,
                        ) && (
                          <Badge className="bg-orange-100 text-orange-800 border border-orange-300 text-xs">
                            Cable:{" "}
                            {
                              allProducts.find(
                                (p) => p.id === selectedProductIds.cableId,
                              )?.brand
                            }{" "}
                            {
                              allProducts.find(
                                (p) => p.id === selectedProductIds.cableId,
                              )?.capacity
                            }
                          </Badge>
                        )}
                      {selectedProductIds.structureId &&
                        allProducts?.find(
                          (p) => p.id === selectedProductIds.structureId,
                        ) && (
                          <Badge className="bg-purple-100 text-purple-800 border border-purple-300 text-xs">
                            Structure:{" "}
                            {
                              allProducts.find(
                                (p) => p.id === selectedProductIds.structureId,
                              )?.productType
                            }
                          </Badge>
                        )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* MOQ compact summary card */}
          {moqGenerated && (
            <Card className="border-solar/30 bg-solar/5">
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-navy" />
                    <span className="text-sm font-semibold text-navy">
                      MOQ Summary
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isRegenMOQ ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-navy" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {isRegenMOQ ? "Updating..." : "Up to date"}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    {moqItems?.length ?? 0} line items
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="font-bold text-navy">
                    Total:{" "}
                    {isRegenMOQ ? (
                      <span className="text-muted-foreground font-normal">
                        recalculating...
                      </span>
                    ) : (
                      `₹${totalMOQCost.toLocaleString()} (Ex-GST)`
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Brand Reference — cascaded Brand → Specification/Type → Size/Capacity */}
          {moqGenerated && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Battery className="h-4 w-4 text-navy" />
                  Brand Reference
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    — Select brand, type &amp; size to auto-reprice MOQ
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {(() => {
                  // Merge: prefer backend products if available, else fall back to static
                  const productList: StaticProduct[] =
                    (allProducts?.length ?? 0) > 0
                      ? (allProducts as StaticProduct[])
                      : STATIC_PRODUCTS;

                  return BRAND_REF_CATEGORIES.map((catConfig) => {
                    const catProducts = productList.filter(
                      (p) => p.category === catConfig.id && p.isActive,
                    );
                    if (catProducts.length === 0) return null;

                    // Unique brands available for this category (from product list)
                    const availableBrands = Array.from(
                      new Set(catProducts.map((p) => p.brand)),
                    ).sort();

                    const spec = selectedBrandSpec[catConfig.id] ?? {
                      brand: "",
                      type: "",
                      capacity: "",
                    };

                    // Types available for selected brand
                    const availableTypes = spec.brand
                      ? Array.from(
                          new Set(
                            catProducts
                              .filter((p) => p.brand === spec.brand)
                              .map((p) => p.productType),
                          ),
                        ).sort()
                      : [];

                    // Capacities available for selected brand + type
                    const availableCapacities =
                      spec.brand && spec.type
                        ? catProducts.filter(
                            (p) =>
                              p.brand === spec.brand &&
                              p.productType === spec.type,
                          )
                        : [];

                    // Currently matched product (for chip display)
                    const matchedProduct =
                      spec.brand && spec.type && spec.capacity
                        ? catProducts.find(
                            (p) =>
                              p.brand === spec.brand &&
                              p.productType === spec.type &&
                              p.capacity === spec.capacity,
                          )
                        : null;

                    const productField =
                      CATEGORY_TO_PRODUCT_FIELD[catConfig.id];
                    const isSelected =
                      productField &&
                      selectedProductIds[productField] !== null &&
                      matchedProduct !== null &&
                      matchedProduct !== undefined &&
                      selectedProductIds[productField] === matchedProduct.id;

                    return (
                      <div
                        key={catConfig.id}
                        data-ocid={`brand_ref.${catConfig.id.toLowerCase().replace(/\s+/g, "_")}.panel`}
                        className={`rounded-lg border p-3 transition-all ${isSelected ? `${catConfig.color} border-opacity-80` : "border-border bg-card"}`}
                      >
                        {/* Category label */}
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-navy">
                            {catConfig.label}
                          </Label>
                          {isSelected && matchedProduct && (
                            <Badge
                              className={`${catConfig.chipColor} text-xs border`}
                            >
                              ✓ Applied
                            </Badge>
                          )}
                        </div>

                        {/* Brand pills */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {availableBrands.map((brandName) => (
                            <button
                              type="button"
                              key={brandName}
                              data-ocid="brand_ref.brand.button"
                              onClick={() => {
                                // Selecting a brand resets type + capacity for this category
                                setSelectedBrandSpec((prev) => ({
                                  ...prev,
                                  [catConfig.id]: {
                                    brand: brandName,
                                    type: "",
                                    capacity: "",
                                  },
                                }));
                                // Clear product ID for this category when brand changes
                                if (productField) {
                                  setSelectedProductIds((prev) => ({
                                    ...prev,
                                    [productField]: null,
                                  }));
                                }
                              }}
                              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                                spec.brand === brandName
                                  ? "bg-navy text-white border-navy"
                                  : "bg-secondary text-secondary-foreground border-border hover:border-navy/40 hover:bg-navy/5"
                              }`}
                            >
                              {brandName}
                            </button>
                          ))}
                        </div>

                        {/* Type / Specification selector — shown only after brand is selected */}
                        {spec.brand && (
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs text-muted-foreground mb-1 block">
                                Specification / Type
                              </Label>
                              <Select
                                value={spec.type}
                                onValueChange={(val) => {
                                  setSelectedBrandSpec((prev) => ({
                                    ...prev,
                                    [catConfig.id]: {
                                      ...prev[catConfig.id],
                                      type: val,
                                      capacity: "", // reset capacity when type changes
                                    },
                                  }));
                                  // Clear product ID until capacity is also chosen
                                  if (productField) {
                                    setSelectedProductIds((prev) => ({
                                      ...prev,
                                      [productField]: null,
                                    }));
                                  }
                                }}
                              >
                                <SelectTrigger
                                  className="h-8 text-xs"
                                  data-ocid="brand_ref.type.select"
                                >
                                  <SelectValue placeholder="Select type..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableTypes.map((t) => (
                                    <SelectItem
                                      key={t}
                                      value={t}
                                      className="text-xs"
                                    >
                                      {t}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Capacity / Size selector — shown only after type is selected */}
                            {spec.type && (
                              <div>
                                <Label className="text-xs text-muted-foreground mb-1 block">
                                  Size / Capacity
                                </Label>
                                <Select
                                  value={spec.capacity}
                                  onValueChange={(val) => {
                                    setSelectedBrandSpec((prev) => ({
                                      ...prev,
                                      [catConfig.id]: {
                                        ...prev[catConfig.id],
                                        capacity: val,
                                      },
                                    }));
                                    // Find matching product and set its ID to trigger MOQ repricing
                                    const product = catProducts.find(
                                      (p) =>
                                        p.brand === spec.brand &&
                                        p.productType === spec.type &&
                                        p.capacity === val,
                                    );
                                    if (product && productField) {
                                      setSelectedProductIds((prev) => ({
                                        ...prev,
                                        [productField]: product.id,
                                      }));
                                    }
                                  }}
                                >
                                  <SelectTrigger
                                    className="h-8 text-xs"
                                    data-ocid="brand_ref.capacity.select"
                                  >
                                    <SelectValue placeholder="Select size..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableCapacities.map((p) => (
                                      <SelectItem
                                        key={p.id.toString()}
                                        value={p.capacity}
                                        className="text-xs"
                                      >
                                        {p.capacity}
                                        {p.voltage && p.voltage !== "N/A"
                                          ? ` | ${p.voltage}`
                                          : ""}
                                        {" — "}₹
                                        {p.pricePerUnit.toLocaleString()}/
                                        {p.unit}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Selected spec summary chip */}
                        {matchedProduct && (
                          <div
                            className={`mt-2.5 px-3 py-2 rounded-md ${catConfig.color} border flex items-center justify-between gap-2 text-xs`}
                          >
                            <span className="font-medium text-navy truncate">
                              {matchedProduct.brand} ·{" "}
                              {matchedProduct.productType} ·{" "}
                              {matchedProduct.capacity}
                              {matchedProduct.voltage &&
                              matchedProduct.voltage !== "N/A"
                                ? ` | ${matchedProduct.voltage}`
                                : ""}
                              {matchedProduct.efficiency > 0
                                ? ` | Eff: ${matchedProduct.efficiency}%`
                                : ""}
                              {" | Warranty: "}
                              {Number(matchedProduct.warrantyYears)}yr
                            </span>
                            <span className="font-bold text-navy whitespace-nowrap">
                              ₹{matchedProduct.pricePerUnit.toLocaleString()}/
                              {matchedProduct.unit}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}

                {/* AI Product Recommendations */}
                {systemSizeKW > 0 && (
                  <AIProductRecommendationCard
                    systemKW={systemSizeKW}
                    systemType={systemType}
                    products={
                      (allProducts?.length ?? 0) > 0
                        ? allProducts!
                        : STATIC_PRODUCTS
                    }
                    onSelectProduct={(category, productId) => {
                      const field = CATEGORY_TO_PRODUCT_FIELD[category];
                      if (field) {
                        setSelectedProductIds((prev) => ({
                          ...prev,
                          [field]: productId,
                        }));
                      }
                    }}
                  />
                )}

                {/* Summary of all selected specs */}
                {Object.values(selectedBrandSpec).some(
                  (s) => s.brand && s.type && s.capacity,
                ) && (
                  <div className="p-3 rounded-lg bg-navy/5 border border-navy/15">
                    <p className="text-xs font-semibold text-navy mb-2">
                      Selected Specifications
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {BRAND_REF_CATEGORIES.map((catConfig) => {
                        const spec = selectedBrandSpec[catConfig.id];
                        if (!spec?.brand || !spec.type || !spec.capacity)
                          return null;
                        return (
                          <Badge
                            key={catConfig.id}
                            className={`${catConfig.chipColor} text-xs border`}
                          >
                            {catConfig.label}: {spec.brand} {spec.type}{" "}
                            {spec.capacity}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────
          STEP 3: MOQ Review
      ─────────────────────────────────────────────── */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sun className="h-4 w-4 text-navy" />
              Auto-Generated Bill of Materials (MOQ)
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
                  Go back to Step 2 and click "Generate MOQ" to create the bill
                  of materials.
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
                    <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                      <Table className="min-w-[500px] w-full">
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
                            const effectiveTotal =
                              item.quantity * effectivePrice;
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

      {/* ───────────────────────────────────────────────
          STEP 4: Quotation & ROI
      ─────────────────────────────────────────────── */}
      {step === 3 && (
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

              {/* Summary grid */}
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
                    <RechartsTooltip
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
                    <RechartsTooltip
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

      {/* ───────────────────────────────────────────────
          Navigation
      ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => (step === 0 ? onComplete() : setStep((s) => s - 1))}
          className="gap-2 min-h-[44px] sm:min-h-0"
          data-ocid="wizard.cancel_button"
        >
          <ChevronLeft className="h-4 w-4" />
          {step === 0 ? "Cancel" : "Back"}
        </Button>

        {step < 3 ? (
          step === 1 ? (
            // Step 2: "Next" only enabled after MOQ is generated
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={
                      !moqGenerated || isRegenMOQ ? "cursor-not-allowed" : ""
                    }
                  >
                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!moqGenerated || isRegenMOQ}
                      className="gap-2 min-h-[44px] sm:min-h-0 w-full sm:w-auto"
                      data-ocid="wizard.primary_button"
                    >
                      {isRegenMOQ ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      {isRegenMOQ ? "Updating MOQ..." : "Next →"}
                    </Button>
                  </span>
                </TooltipTrigger>
                {(!moqGenerated || isRegenMOQ) && (
                  <TooltipContent
                    side="top"
                    className="text-xs max-w-[200px] text-center"
                  >
                    {isRegenMOQ
                      ? "Please wait while MOQ is being updated..."
                      : "Generate MOQ above to continue"}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 0 && !canProceedStep1}
              className="gap-2 min-h-[44px] sm:min-h-0 w-full sm:w-auto"
              data-ocid="wizard.primary_button"
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
            className="gap-2 min-h-[44px] sm:min-h-0 w-full sm:w-auto"
            data-ocid="wizard.submit_button"
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
