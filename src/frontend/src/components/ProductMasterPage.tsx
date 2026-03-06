import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  AlertTriangle,
  Database,
  Download,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import {
  type ProductMaster,
  useCreateProductMaster,
  useDeleteProductMaster,
  useProductMaster,
  useUpdateProductMaster,
} from "../hooks/useQueries";

// ─── Market seed data ─────────────────────────────────────────────────────────

const SEED_PRODUCTS: Omit<ProductMaster, "id">[] = [
  // Solar Panels
  {
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

// ─── Category config ─────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: "Solar Panel",
    label: "Solar Panels",
    color: "bg-amber-100 text-amber-800 border-amber-300",
  },
  {
    id: "Inverter",
    label: "Inverters",
    color: "bg-blue-100 text-blue-800 border-blue-300",
  },
  {
    id: "Battery",
    label: "Batteries",
    color: "bg-green-100 text-green-800 border-green-300",
  },
  {
    id: "Cable",
    label: "Cables",
    color: "bg-orange-100 text-orange-800 border-orange-300",
  },
  {
    id: "Structure",
    label: "Structure",
    color: "bg-purple-100 text-purple-800 border-purple-300",
  },
];

const UNITS = ["Nos", "Mtr", "Set", "Pkt", "kg", "Ltr"];

// ─── Product form type ─────────────────────────────────────────────────────────

type ProductForm = {
  category: string;
  brand: string;
  productType: string;
  capacity: string;
  voltage: string;
  pricePerUnit: string;
  unit: string;
  efficiency: string;
  warrantyYears: string;
  isActive: boolean;
};

const DEFAULT_FORM: ProductForm = {
  category: "Solar Panel",
  brand: "",
  productType: "",
  capacity: "",
  voltage: "N/A",
  pricePerUnit: "0",
  unit: "Nos",
  efficiency: "0",
  warrantyYears: "25",
  isActive: true,
};

// ─── Product Dialog ───────────────────────────────────────────────────────────

function ProductDialog({
  open,
  onClose,
  initialForm,
  onSubmit,
  isLoading,
  title,
}: {
  open: boolean;
  onClose: () => void;
  initialForm: ProductForm;
  onSubmit: (form: ProductForm) => Promise<void>;
  isLoading: boolean;
  title: string;
}) {
  const [form, setForm] = useState<ProductForm>(initialForm);

  // Reset form when dialog opens with new values
  const handleOpenChange = (o: boolean) => {
    if (o) setForm(initialForm);
    if (!o) onClose();
  };

  const set = (field: keyof ProductForm, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    if (
      !form.brand.trim() ||
      !form.productType.trim() ||
      !form.capacity.trim()
    ) {
      toast.error("Brand, Type and Capacity are required.");
      return;
    }
    await onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Database className="h-5 w-5 text-navy" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-2">
          {/* Category */}
          <div className="col-span-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Category *
            </Label>
            <Select
              value={form.category}
              onValueChange={(v) => set("category", v)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Brand */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Brand *
            </Label>
            <Input
              className="mt-1.5"
              placeholder="e.g. Waaree, Sungrow"
              value={form.brand}
              onChange={(e) => set("brand", e.target.value)}
            />
          </div>

          {/* Product Type */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Product Type *
            </Label>
            <Input
              className="mt-1.5"
              placeholder="e.g. TOPCon, String, LiFePO4"
              value={form.productType}
              onChange={(e) => set("productType", e.target.value)}
            />
          </div>

          {/* Capacity */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Capacity *
            </Label>
            <Input
              className="mt-1.5"
              placeholder="e.g. 550W, 5kW, 200Ah, 6sqmm"
              value={form.capacity}
              onChange={(e) => set("capacity", e.target.value)}
            />
          </div>

          {/* Voltage */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Voltage / Spec
            </Label>
            <Input
              className="mt-1.5"
              placeholder="e.g. 12V, 220V AC, N/A"
              value={form.voltage}
              onChange={(e) => set("voltage", e.target.value)}
            />
          </div>

          {/* Price */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Price per Unit (₹) *
            </Label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ₹
              </span>
              <Input
                type="number"
                min="0"
                step="0.01"
                className="pl-7"
                placeholder="0.00"
                value={form.pricePerUnit}
                onChange={(e) => set("pricePerUnit", e.target.value)}
              />
            </div>
          </div>

          {/* Unit */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Unit
            </Label>
            <Select value={form.unit} onValueChange={(v) => set("unit", v)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNITS.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Efficiency */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Efficiency (%)
            </Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              className="mt-1.5"
              placeholder="e.g. 21.5"
              value={form.efficiency}
              onChange={(e) => set("efficiency", e.target.value)}
            />
          </div>

          {/* Warranty */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Warranty (Years)
            </Label>
            <Input
              type="number"
              min="0"
              max="30"
              className="mt-1.5"
              placeholder="e.g. 25"
              value={form.warrantyYears}
              onChange={(e) => set("warrantyYears", e.target.value)}
            />
          </div>

          {/* Active toggle */}
          <div className="col-span-2 flex items-center gap-3 p-3 rounded-lg bg-secondary/40 border border-border">
            <Switch
              id="active-toggle"
              checked={form.isActive}
              onCheckedChange={(v) => set("isActive", v)}
            />
            <Label htmlFor="active-toggle" className="text-sm cursor-pointer">
              {form.isActive
                ? "Active — visible in project wizard"
                : "Inactive — hidden from project wizard"}
            </Label>
          </div>
        </div>

        {/* Price preview */}
        <div className="p-3 rounded-lg bg-solar/10 border border-solar/30 flex justify-between items-center text-sm">
          <span className="text-muted-foreground">
            {form.brand || "–"} | {form.productType || "–"} |{" "}
            {form.capacity || "–"}
          </span>
          <span className="font-bold text-navy text-base">
            ₹{Number.parseFloat(form.pricePerUnit || "0").toLocaleString()}/
            {form.unit}
          </span>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="gap-2 bg-navy hover:bg-navy/90 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {isLoading ? "Saving..." : "Save Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Category tab content ─────────────────────────────────────────────────────

function CategoryTab({
  category,
  products,
  isLoading,
  onEdit,
  onToggleActive,
}: {
  category: { id: string; label: string; color: string };
  products: ProductMaster[];
  isLoading: boolean;
  onEdit: (product: ProductMaster) => void;
  onToggleActive: (product: ProductMaster) => void;
}) {
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const deleteProductMaster = useDeleteProductMaster();
  const updateProductMaster = useUpdateProductMaster();

  const handleDelete = async (product: ProductMaster) => {
    setDeletingId(product.id);
    try {
      await deleteProductMaster.mutateAsync(product.id);
      toast.success("Product deleted");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to delete: ${msg}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (product: ProductMaster) => {
    try {
      await updateProductMaster.mutateAsync({
        id: product.id,
        category: product.category,
        brand: product.brand,
        productType: product.productType,
        capacity: product.capacity,
        voltage: product.voltage,
        pricePerUnit: product.pricePerUnit,
        unit: product.unit,
        efficiency: product.efficiency,
        warrantyYears: product.warrantyYears,
        isActive: !product.isActive,
      });
      onToggleActive(product);
      toast.success(
        `Product ${!product.isActive ? "activated" : "deactivated"}`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to update: ${msg}`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2 mt-4">
        {[1, 2, 3, 4].map((k) => (
          <Skeleton key={k} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl mt-4">
        <div className="p-3 rounded-xl bg-solar/10 mb-3">
          <Database className="h-8 w-8 text-solar-dark/50" />
        </div>
        <p className="font-semibold text-foreground/70">
          No {category.label} in catalog
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Click "Add Product" or "Import All" to populate.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-border overflow-hidden shadow-sm overflow-x-auto">
      <Table className="min-w-[700px] w-full">
        <TableHeader>
          <TableRow className="bg-navy/5 hover:bg-navy/5">
            <TableHead className="text-xs font-semibold">Brand</TableHead>
            <TableHead className="text-xs font-semibold">Type</TableHead>
            <TableHead className="text-xs font-semibold">Capacity</TableHead>
            <TableHead className="text-xs font-semibold">Voltage</TableHead>
            <TableHead className="text-xs font-semibold text-right">
              Price
            </TableHead>
            <TableHead className="text-xs font-semibold">Unit</TableHead>
            <TableHead className="text-xs font-semibold text-right">
              Eff %
            </TableHead>
            <TableHead className="text-xs font-semibold text-center">
              Warranty
            </TableHead>
            <TableHead className="text-xs font-semibold text-center">
              Status
            </TableHead>
            <TableHead className="text-xs font-semibold text-center">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const isDeleting = deletingId === product.id;
            return (
              <TableRow
                key={product.id.toString()}
                className={`group text-sm ${isDeleting ? "opacity-50" : ""}`}
              >
                <TableCell className="font-medium py-2">
                  {product.brand}
                </TableCell>
                <TableCell className="py-2">
                  <Badge className={`text-xs border ${category.color}`}>
                    {product.productType}
                  </Badge>
                </TableCell>
                <TableCell className="py-2 font-mono text-xs font-semibold text-navy">
                  {product.capacity}
                </TableCell>
                <TableCell className="py-2 text-xs text-muted-foreground">
                  {product.voltage}
                </TableCell>
                <TableCell className="py-2 text-right font-semibold tabular-nums">
                  ₹{product.pricePerUnit.toLocaleString()}
                </TableCell>
                <TableCell className="py-2 text-xs text-muted-foreground">
                  {product.unit}
                </TableCell>
                <TableCell className="py-2 text-right text-xs text-muted-foreground">
                  {product.efficiency > 0 ? `${product.efficiency}%` : "—"}
                </TableCell>
                <TableCell className="py-2 text-center text-xs text-muted-foreground">
                  {Number(product.warrantyYears)}yr
                </TableCell>
                <TableCell className="py-2 text-center">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(product)}
                    className="transition-colors"
                    title={
                      product.isActive
                        ? "Click to deactivate"
                        : "Click to activate"
                    }
                  >
                    <Badge
                      className={
                        product.isActive
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs cursor-pointer hover:bg-emerald-200"
                          : "bg-gray-100 text-gray-600 border border-gray-300 text-xs cursor-pointer hover:bg-gray-200"
                      }
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </button>
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-navy hover:bg-navy/10 opacity-0 group-hover:opacity-100 transition-all"
                      onClick={() => onEdit(product)}
                      title="Edit product"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                      onClick={() => handleDelete(product)}
                      disabled={isDeleting}
                      title="Delete product"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ProductMasterPage({ activeRole }: { activeRole?: string }) {
  const { actor } = useActor();
  const { data: products, isLoading } = useProductMaster();
  const createProductMaster = useCreateProductMaster();
  const updateProductMaster = useUpdateProductMaster();

  const [activeTab, setActiveTab] = useState("Solar Panel");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductMaster | null>(
    null,
  );
  const [dialogForm, setDialogForm] = useState<ProductForm>({
    ...DEFAULT_FORM,
  });
  const [isImporting, setIsImporting] = useState(false);

  const isOwnerOrAdmin = activeRole === "owner" || activeRole === "admin";

  const productsByCategory = (products ?? []).reduce(
    (acc, p) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push(p);
      return acc;
    },
    {} as Record<string, ProductMaster[]>,
  );

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setDialogForm({ ...DEFAULT_FORM, category: activeTab });
    setDialogOpen(true);
  };

  const handleOpenEdit = (product: ProductMaster) => {
    setEditingProduct(product);
    setDialogForm({
      category: product.category,
      brand: product.brand,
      productType: product.productType,
      capacity: product.capacity,
      voltage: product.voltage,
      pricePerUnit: String(product.pricePerUnit),
      unit: product.unit,
      efficiency: String(product.efficiency),
      warrantyYears: String(Number(product.warrantyYears)),
      isActive: product.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmitProduct = async (form: ProductForm) => {
    try {
      if (editingProduct) {
        await updateProductMaster.mutateAsync({
          id: editingProduct.id,
          category: form.category,
          brand: form.brand.trim(),
          productType: form.productType.trim(),
          capacity: form.capacity.trim(),
          voltage: form.voltage.trim(),
          pricePerUnit: Number.parseFloat(form.pricePerUnit) || 0,
          unit: form.unit,
          efficiency: Number.parseFloat(form.efficiency) || 0,
          warrantyYears: BigInt(Number.parseInt(form.warrantyYears) || 0),
          isActive: form.isActive,
        });
        toast.success("Product updated successfully");
      } else {
        await createProductMaster.mutateAsync({
          category: form.category,
          brand: form.brand.trim(),
          productType: form.productType.trim(),
          capacity: form.capacity.trim(),
          voltage: form.voltage.trim(),
          pricePerUnit: Number.parseFloat(form.pricePerUnit) || 0,
          unit: form.unit,
          efficiency: Number.parseFloat(form.efficiency) || 0,
          warrantyYears: BigInt(Number.parseInt(form.warrantyYears) || 0),
          isActive: form.isActive,
        });
        toast.success("Product added successfully");
      }
      setDialogOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to save product: ${msg}`);
    }
  };

  const handleImportAllDirect = async () => {
    if (!actor) {
      toast.error("Not connected to backend");
      return;
    }
    setIsImporting(true);
    let imported = 0;
    let failed = 0;
    const batchSize = 10;

    try {
      for (let i = 0; i < SEED_PRODUCTS.length; i += batchSize) {
        const batch = SEED_PRODUCTS.slice(i, i + batchSize);
        const results = await Promise.allSettled(
          batch.map((p) =>
            actor.createProductMaster(
              p.category,
              p.brand,
              p.productType,
              p.capacity,
              p.voltage,
              p.pricePerUnit,
              p.unit,
              p.efficiency,
              p.warrantyYears,
              p.isActive,
            ),
          ),
        );
        for (const r of results) {
          if (r.status === "fulfilled") imported++;
          else failed++;
        }
      }

      if (imported > 0) {
        toast.success(
          `Imported ${imported} products${failed > 0 ? ` (${failed} failed)` : ""}. Refreshing...`,
        );
        // Force page refresh to show imported data
        window.location.reload();
      } else {
        toast.error(
          "No products were imported — all may already exist or backend rejected them.",
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Import failed: ${msg}`);
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOwnerOrAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="p-4 rounded-2xl bg-destructive/10 mb-4">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <p className="text-base font-semibold">Access Restricted</p>
        <p className="text-sm text-muted-foreground mt-1">
          Product Master & Price List is accessible to Owner and Admin roles
          only.
        </p>
      </div>
    );
  }

  const totalProducts = products?.length ?? 0;
  const activeProducts = products?.filter((p) => p.isActive).length ?? 0;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-navy text-white">
              <Database className="h-5 w-5" />
            </div>
            Product Master & Price List
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage solar products, specifications, and pricing.{" "}
            {totalProducts > 0 &&
              `${activeProducts} active / ${totalProducts} total products.`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-emerald-400 text-emerald-700 hover:bg-emerald-50"
            onClick={handleImportAllDirect}
            disabled={isImporting}
          >
            {isImporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isImporting ? "Importing..." : "Import All Products"}
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-navy hover:bg-navy/90 text-white"
            onClick={handleOpenAdd}
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats row */}
      {totalProducts > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {CATEGORIES.map((cat) => {
            const catProducts = productsByCategory[cat.id] ?? [];
            const catActive = catProducts.filter((p) => p.isActive).length;
            return (
              <Card
                key={cat.id}
                className={`border-border shadow-sm cursor-pointer transition-all ${activeTab === cat.id ? "ring-2 ring-navy" : "hover:border-navy/30"}`}
                onClick={() => setActiveTab(cat.id)}
              >
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground truncate">
                    {cat.label}
                  </p>
                  <p className="text-xl font-bold text-navy">
                    {catProducts.length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {catActive} active
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tabs */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-0 pt-4 px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <TabsList className="bg-secondary/60">
                {CATEGORIES.map((cat) => (
                  <TabsTrigger
                    key={cat.id}
                    value={cat.id}
                    className="text-xs data-[state=active]:bg-navy data-[state=active]:text-white"
                  >
                    {cat.label}
                    {(productsByCategory[cat.id]?.length ?? 0) > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white/20 text-xs tabular-nums">
                        {productsByCategory[cat.id]?.length}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {CATEGORIES.map((cat) => (
              <TabsContent key={cat.id} value={cat.id} className="px-0 pb-4">
                <CategoryTab
                  category={cat}
                  products={productsByCategory[cat.id] ?? []}
                  isLoading={isLoading}
                  onEdit={handleOpenEdit}
                  onToggleActive={() => {}}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardHeader>

        {totalProducts === 0 && !isLoading && (
          <CardContent className="pt-0 pb-6">
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-xl">
              <div className="p-3 rounded-xl bg-solar/10 mb-3">
                <Zap className="h-8 w-8 text-solar-dark/50" />
              </div>
              <p className="font-semibold text-foreground/70">
                No products in catalog yet
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Click <strong>"Import All Products"</strong> to seed 80+ real
                market products across all categories, or add them manually.
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Product dialog */}
      <ProductDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initialForm={dialogForm}
        onSubmit={handleSubmitProduct}
        isLoading={
          createProductMaster.isPending || updateProductMaster.isPending
        }
        title={editingProduct ? "Edit Product" : "Add New Product"}
      />
    </div>
  );
}
