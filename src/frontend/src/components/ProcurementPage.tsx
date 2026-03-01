import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Camera,
  Eye,
  FileUp,
  IndianRupee,
  Loader2,
  Plus,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useCamera } from "../camera/useCamera";
import { useCreateInventoryItem, useProjects } from "../hooks/useQueries";
import {
  type AdvancePayment,
  type ProcurementEntry,
  type ProcurementLineItem,
  type Vendor,
  createAdvancePayment,
  createProcurementEntry,
  findOrCreateVendor,
  getAdvancePayments,
  getBalanceDue,
  getProcurementEntries,
  getProcurementEntry,
  getVendors,
} from "../utils/procurementStore";

// ─── Constants ────────────────────────────────────────────────────────────────
const ITEM_CATEGORIES = [
  "Solar Panels",
  "Inverters",
  "Batteries",
  "ACDB/DCDB",
  "Cables",
  "Structure",
  "Protection Devices",
  "Earthing",
  "Miscellaneous",
];

const ITEM_UNITS = ["Nos", "Mtr", "Kg", "Set", "Box", "Pair", "Pkt"];

// ─── Empty line item template ─────────────────────────────────────────────────
function emptyLineItem(): ProcurementLineItem & { _key: string } {
  return {
    _key: `${Date.now()}_${Math.random()}`,
    itemName: "",
    category: "Miscellaneous",
    quantity: 1,
    unit: "Nos",
    unitPrice: 0,
  };
}

type LineItemRow = ProcurementLineItem & { _key: string };

// ─── Camera Dialog ─────────────────────────────────────────────────────────────
function CameraDialog({
  open,
  onClose,
  onCapture,
}: {
  open: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}) {
  const {
    isActive,
    isLoading,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
    videoRef,
    canvasRef,
  } = useCamera({ facingMode: "environment", quality: 0.85 });

  const handleOpen = useCallback(async () => {
    await startCamera();
  }, [startCamera]);

  const handleCapture = useCallback(async () => {
    const file = await capturePhoto();
    if (!file) {
      toast.error("Failed to capture photo");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      onCapture(reader.result as string);
      stopCamera();
      onClose();
    };
    reader.readAsDataURL(file);
  }, [capturePhoto, stopCamera, onCapture, onClose]);

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">
            Capture Invoice Photo
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!isActive && !isLoading && (
            <div className="flex flex-col items-center justify-center gap-3 py-8 bg-muted rounded-lg">
              <Camera className="h-10 w-10 text-muted-foreground" />
              {error && (
                <p className="text-sm text-destructive text-center">
                  {error.message}
                </p>
              )}
              <Button
                onClick={handleOpen}
                className="bg-primary text-primary-foreground"
              >
                Open Camera
              </Button>
            </div>
          )}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {isActive && (
            <div className="relative rounded-lg overflow-hidden bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-h-72 object-cover"
              />
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {isActive && (
              <Button
                onClick={handleCapture}
                className="bg-primary text-primary-foreground"
              >
                <Camera className="h-4 w-4 mr-2" />
                Capture
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Image Lightbox ────────────────────────────────────────────────────────────
function ImageLightbox({
  dataUrl,
  open,
  onClose,
}: {
  dataUrl: string;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">Invoice Image</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center bg-muted rounded-lg overflow-hidden max-h-[70vh]">
          {dataUrl.startsWith("data:application/pdf") ? (
            <iframe
              src={dataUrl}
              className="w-full h-[60vh]"
              title="Invoice PDF"
            />
          ) : (
            <img
              src={dataUrl}
              alt="Invoice"
              className="max-w-full max-h-[60vh] object-contain"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── New Entry Form ────────────────────────────────────────────────────────────
interface EntryFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function NewEntryForm({ open, onClose, onSaved }: EntryFormProps) {
  const { data: projects = [] } = useProjects();
  const createInventoryItem = useCreateInventoryItem();

  // Vendor fields
  const [vendorName, setVendorName] = useState("");
  const [vendorAddress, setVendorAddress] = useState("");
  const [vendorGst, setVendorGst] = useState("");

  // Invoice fields
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [linkedProjectId, setLinkedProjectId] = useState<string>("none");

  // Line items
  const [lineItems, setLineItems] = useState<LineItemRow[]>([emptyLineItem()]);

  // GST
  const [gstAvailable, setGstAvailable] = useState(true);
  const [cgst, setCgst] = useState(0);
  const [sgst, setSgst] = useState(0);
  const [igst, setIgst] = useState(0);

  // UI state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculations
  const baseAmount = lineItems.reduce(
    (sum, i) => sum + i.quantity * i.unitPrice,
    0,
  );
  const taxTotal = gstAvailable ? cgst + sgst + igst : 0;
  const totalAmount = baseAmount + taxTotal;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const updateLineItem = (key: string, patch: Partial<LineItemRow>) => {
    setLineItems((prev) =>
      prev.map((item) => (item._key === key ? { ...item, ...patch } : item)),
    );
  };

  const removeLineItem = (key: string) => {
    setLineItems((prev) => prev.filter((item) => item._key !== key));
  };

  const resetForm = () => {
    setVendorName("");
    setVendorAddress("");
    setVendorGst("");
    setInvoiceNumber("");
    setInvoiceDate(new Date().toISOString().slice(0, 10));
    setImageDataUrl("");
    setLinkedProjectId("none");
    setLineItems([emptyLineItem()]);
    setGstAvailable(true);
    setCgst(0);
    setSgst(0);
    setIgst(0);
  };

  const handleSave = async () => {
    if (!vendorName.trim()) {
      toast.error("Vendor name is required");
      return;
    }
    if (!invoiceNumber.trim()) {
      toast.error("Invoice number is required");
      return;
    }
    if (linkedProjectId === "none") {
      toast.error("Please select a project");
      return;
    }
    if (lineItems.length === 0 || lineItems.every((i) => !i.itemName.trim())) {
      toast.error("Add at least one line item");
      return;
    }

    setSaving(true);
    try {
      const vendor: Vendor = findOrCreateVendor(
        vendorName,
        vendorAddress,
        vendorGst || "NA",
      );

      const validItems = lineItems.filter((i) => i.itemName.trim());

      const entry = createProcurementEntry({
        vendorId: vendor.id,
        invoiceNumber: invoiceNumber.trim(),
        invoiceDate,
        invoiceImageDataUrl: imageDataUrl,
        items: validItems.map(({ _key: _k, ...rest }) => rest),
        baseAmount,
        cgst: gstAvailable ? cgst : 0,
        sgst: gstAvailable ? sgst : 0,
        igst: gstAvailable ? igst : 0,
        gstAvailable,
        totalAmount,
        projectId: linkedProjectId === "none" ? null : linkedProjectId,
      });

      // Push each item into backend inventory
      await Promise.all(
        validItems.map((item) =>
          createInventoryItem
            .mutateAsync({
              sku: `PROC-${entry.id.slice(-6)}-${item.itemName.slice(0, 6).replace(/\s/g, "")}`.toUpperCase(),
              name: item.itemName,
              category: item.category,
              quantityOnHand: BigInt(Math.round(item.quantity)),
              minStock: BigInt(1),
              unit: item.unit,
              warehouseLocation: "Main Warehouse",
            })
            .catch(() => {
              // Non-fatal — store is still saved locally
            }),
        ),
      );

      toast.success(`Procurement entry saved! Invoice: ${invoiceNumber}`);
      resetForm();
      onSaved();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to save: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              New Procurement Entry
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* ── Vendor Section ── */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Vendor Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Vendor Name *</Label>
                  <Input
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="e.g. Solar Parts India"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Address</Label>
                  <Input
                    value={vendorAddress}
                    onChange={(e) => setVendorAddress(e.target.value)}
                    placeholder="City, State"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">
                    GST No. (enter NA if not available)
                  </Label>
                  <Input
                    value={vendorGst}
                    onChange={(e) => setVendorGst(e.target.value)}
                    placeholder="27AABCU9603R1ZX or NA"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* ── Invoice Details ── */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  2
                </span>
                Invoice Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Invoice Number *</Label>
                  <Input
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="INV-2024-001"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Invoice Date</Label>
                  <Input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Project *</Label>
                  <Select
                    value={linkedProjectId}
                    onValueChange={setLinkedProjectId}
                  >
                    <SelectTrigger className="text-sm h-9">
                      <SelectValue placeholder="Select project..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Select a project —</SelectItem>
                      {projects.map((p) => (
                        <SelectItem key={String(p.id)} value={String(p.id)}>
                          {p.clientName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Invoice image capture */}
              <div className="mt-3 space-y-2">
                <Label className="text-xs">Invoice Image / Document</Label>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCameraOpen(true)}
                    className="text-xs h-8"
                  >
                    <Camera className="h-3.5 w-3.5 mr-1.5" />
                    Take Photo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs h-8"
                  >
                    <FileUp className="h-3.5 w-3.5 mr-1.5" />
                    Upload File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  {imageDataUrl && (
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded border overflow-hidden bg-muted flex-shrink-0">
                        {imageDataUrl.startsWith("data:application/pdf") ? (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                            PDF
                          </div>
                        ) : (
                          <img
                            src={imageDataUrl}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 text-primary"
                        onClick={() => setLightboxOpen(true)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        View
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 text-destructive"
                        onClick={() => setImageDataUrl("")}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* ── Line Items ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                    3
                  </span>
                  Line Items
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() =>
                    setLineItems((prev) => [...prev, emptyLineItem()])
                  }
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Item
                </Button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs w-[220px]">
                        Item Name
                      </TableHead>
                      <TableHead className="text-xs w-[140px]">
                        Category
                      </TableHead>
                      <TableHead className="text-xs w-[80px]">Qty</TableHead>
                      <TableHead className="text-xs w-[90px]">Unit</TableHead>
                      <TableHead className="text-xs w-[110px]">
                        Unit Price (₹)
                      </TableHead>
                      <TableHead className="text-xs w-[110px] text-right">
                        Line Total
                      </TableHead>
                      <TableHead className="w-[40px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item) => (
                      <TableRow key={item._key}>
                        <TableCell className="p-1">
                          <Input
                            value={item.itemName}
                            onChange={(e) =>
                              updateLineItem(item._key, {
                                itemName: e.target.value,
                              })
                            }
                            placeholder="e.g. 540W Solar Panel"
                            className="h-8 text-xs"
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <Select
                            value={item.category}
                            onValueChange={(v) =>
                              updateLineItem(item._key, { category: v })
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ITEM_CATEGORIES.map((c) => (
                                <SelectItem
                                  key={c}
                                  value={c}
                                  className="text-xs"
                                >
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="p-1">
                          <Input
                            type="number"
                            min={0}
                            value={item.quantity}
                            onChange={(e) =>
                              updateLineItem(item._key, {
                                quantity: Number(e.target.value),
                              })
                            }
                            className="h-8 text-xs w-16"
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <Select
                            value={item.unit}
                            onValueChange={(v) =>
                              updateLineItem(item._key, { unit: v })
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ITEM_UNITS.map((u) => (
                                <SelectItem
                                  key={u}
                                  value={u}
                                  className="text-xs"
                                >
                                  {u}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="p-1">
                          <Input
                            type="number"
                            min={0}
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateLineItem(item._key, {
                                unitPrice: Number(e.target.value),
                              })
                            }
                            className="h-8 text-xs"
                          />
                        </TableCell>
                        <TableCell className="p-1 text-right text-xs font-semibold text-foreground">
                          ₹
                          {(item.quantity * item.unitPrice).toLocaleString(
                            "en-IN",
                          )}
                        </TableCell>
                        <TableCell className="p-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={() => removeLineItem(item._key)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <Separator />

            {/* ── GST Section ── */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  4
                </span>
                Tax & Totals
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <Switch
                  id="gst-toggle"
                  checked={gstAvailable}
                  onCheckedChange={setGstAvailable}
                />
                <Label htmlFor="gst-toggle" className="text-sm cursor-pointer">
                  GST Available
                </Label>
                {!gstAvailable && (
                  <Badge
                    variant="outline"
                    className="text-xs border-amber-400 text-amber-700 bg-amber-50"
                  >
                    GST: NA
                  </Badge>
                )}
              </div>

              <div className="bg-muted/40 rounded-lg p-4 space-y-3 max-w-sm">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base Amount</span>
                  <span className="font-semibold">
                    ₹
                    {baseAmount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                {gstAvailable ? (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-muted-foreground w-16">
                        CGST (₹)
                      </span>
                      <Input
                        type="number"
                        min={0}
                        value={cgst}
                        onChange={(e) => setCgst(Number(e.target.value))}
                        className="h-7 text-xs w-28 text-right"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-muted-foreground w-16">
                        SGST (₹)
                      </span>
                      <Input
                        type="number"
                        min={0}
                        value={sgst}
                        onChange={(e) => setSgst(Number(e.target.value))}
                        className="h-7 text-xs w-28 text-right"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-muted-foreground w-16">
                        IGST (₹)
                      </span>
                      <Input
                        type="number"
                        min={0}
                        value={igst}
                        onChange={(e) => setIgst(Number(e.target.value))}
                        className="h-7 text-xs w-28 text-right"
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="text-amber-600 font-medium">NA</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-base font-bold text-foreground">
                  <span>Total Amount</span>
                  <span className="text-primary">
                    ₹
                    {totalAmount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border mt-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-primary-foreground"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ShoppingCart className="h-4 w-4 mr-2" />
              )}
              {saving ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CameraDialog
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(url) => setImageDataUrl(url)}
      />

      {imageDataUrl && (
        <ImageLightbox
          dataUrl={imageDataUrl}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

// ─── Entry Detail / Advance Payments ─────────────────────────────────────────
function EntryDetail({
  entryId,
  onClose,
  onRefresh,
}: {
  entryId: string;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [entry, setEntry] = useState<ProcurementEntry | undefined>(() =>
    getProcurementEntry(entryId),
  );
  const [advances, setAdvances] = useState<AdvancePayment[]>(() =>
    getAdvancePayments(entryId),
  );
  const [vendors] = useState<Vendor[]>(() => getVendors());
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Advance form
  const [newAmount, setNewAmount] = useState("");
  const [newRemarks, setNewRemarks] = useState("");
  const [newPaidOn, setNewPaidOn] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const vendor = vendors.find((v) => v.id === entry?.vendorId);

  const refresh = () => {
    setEntry(getProcurementEntry(entryId));
    setAdvances(getAdvancePayments(entryId));
  };

  const handleAddAdvance = () => {
    const amount = Number.parseFloat(newAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid advance amount");
      return;
    }
    createAdvancePayment({
      procurementEntryId: entryId,
      amount,
      paidOn: newPaidOn,
      remarks: newRemarks.trim(),
    });
    setNewAmount("");
    setNewRemarks("");
    setNewPaidOn(new Date().toISOString().slice(0, 10));
    refresh();
    onRefresh();
    toast.success("Advance payment recorded");
  };

  if (!entry) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Entry not found.
      </div>
    );
  }

  const totalPaid = advances.reduce((sum, a) => sum + a.amount, 0);
  const balanceDue = Math.max(0, entry.totalAmount - totalPaid);

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            Invoice: {entry.invoiceNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Vendor & Invoice Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Vendor</p>
              <p className="font-semibold">{vendor?.name ?? "Unknown"}</p>
              <p className="text-muted-foreground text-xs">{vendor?.address}</p>
              <p className="text-muted-foreground text-xs">
                GST: {vendor?.gstNo}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Invoice Date</p>
              <p className="font-semibold">
                {new Date(entry.invoiceDate).toLocaleDateString("en-IN")}
              </p>
              {entry.invoiceImageDataUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary h-7 px-0 mt-1"
                  onClick={() => setLightboxOpen(true)}
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  View Invoice Image
                </Button>
              )}
            </div>
          </div>

          {/* GST Breakdown */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Amount Breakdown</h4>
            <div className="bg-muted/40 rounded-lg p-3 space-y-2 text-sm max-w-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Amount</span>
                <span>
                  ₹
                  {entry.baseAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              {entry.gstAvailable ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CGST</span>
                    <span>
                      ₹
                      {entry.cgst.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SGST</span>
                    <span>
                      ₹
                      {entry.sgst.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IGST</span>
                    <span>
                      ₹
                      {entry.igst.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (GST)</span>
                  <span className="text-amber-600 font-medium">NA</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total Amount</span>
                <span className="text-primary">
                  ₹
                  {entry.totalAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h4 className="text-sm font-semibold mb-2">
              Items Purchased ({entry.items.length})
            </h4>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs">Item Name</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs text-right">Qty</TableHead>
                    <TableHead className="text-xs">Unit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entry.items.map((item) => (
                    <TableRow key={`${item.itemName}-${item.category}`}>
                      <TableCell className="text-sm">{item.itemName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.category}
                      </TableCell>
                      <TableCell className="text-sm text-right font-medium">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.unit}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/40 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">
                Invoice Total
              </p>
              <p className="text-sm font-bold">
                ₹{entry.totalAmount.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
              <p className="text-xs text-green-700 mb-1">Total Paid</p>
              <p className="text-sm font-bold text-green-700">
                ₹{totalPaid.toLocaleString("en-IN")}
              </p>
            </div>
            <div
              className={`rounded-lg p-3 text-center border ${balanceDue > 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}
            >
              <p
                className={`text-xs mb-1 ${balanceDue > 0 ? "text-red-700" : "text-green-700"}`}
              >
                Balance Due
              </p>
              <p
                className={`text-sm font-bold ${balanceDue > 0 ? "text-red-700" : "text-green-700"}`}
              >
                {balanceDue > 0
                  ? `₹${balanceDue.toLocaleString("en-IN")}`
                  : "Paid ✓"}
              </p>
            </div>
          </div>

          {/* Advance Payments List */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Advance Payments</h4>
            {advances.length > 0 ? (
              <div className="rounded-lg border border-border overflow-hidden mb-3">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs">#</TableHead>
                      <TableHead className="text-xs">Amount (₹)</TableHead>
                      <TableHead className="text-xs">Paid On</TableHead>
                      <TableHead className="text-xs">Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {advances.map((ap, idx) => (
                      <TableRow key={ap.id}>
                        <TableCell className="text-xs text-muted-foreground">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="text-sm font-semibold">
                          ₹{ap.amount.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-xs">
                          {new Date(ap.paidOn).toLocaleDateString("en-IN")}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {ap.remarks || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-3">
                No advance payments recorded yet.
              </p>
            )}

            {/* Add advance form */}
            <div className="bg-muted/30 rounded-lg p-3 space-y-3">
              <p className="text-xs font-semibold text-foreground">
                + Add Advance Payment
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Amount (₹) *</Label>
                  <Input
                    type="number"
                    min={0}
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="0"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Paid On</Label>
                  <Input
                    type="date"
                    value={newPaidOn}
                    onChange={(e) => setNewPaidOn(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Remarks</Label>
                  <Input
                    value={newRemarks}
                    onChange={(e) => setNewRemarks(e.target.value)}
                    placeholder="Optional"
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleAddAdvance}
                className="bg-primary text-primary-foreground text-xs h-8"
              >
                <IndianRupee className="h-3.5 w-3.5 mr-1" />
                Record Payment
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>

      {entry.invoiceImageDataUrl && (
        <ImageLightbox
          dataUrl={entry.invoiceImageDataUrl}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </Dialog>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
interface ProcurementPageProps {
  activeRole: string;
}

export function ProcurementPage({ activeRole }: ProcurementPageProps) {
  const canAccess = activeRole === "owner" || activeRole === "procurement";

  const [entries, setEntries] = useState<ProcurementEntry[]>(() =>
    getProcurementEntries(),
  );
  const [vendors] = useState<Vendor[]>(() => getVendors());
  const [newEntryOpen, setNewEntryOpen] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  const refresh = () => {
    setEntries(getProcurementEntries());
  };

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <ShoppingCart className="h-12 w-12 text-muted-foreground opacity-30" />
        <p className="text-muted-foreground font-medium">Access Restricted</p>
        <p className="text-sm text-muted-foreground">
          Procurement entries are accessible to Owner and Procurement roles
          only.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground font-display">
            Procurement
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage purchase invoices, track payments, and update stock inventory
          </p>
        </div>
        <Button
          onClick={() => setNewEntryOpen(true)}
          className="bg-primary text-primary-foreground shadow-blue-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total Invoices</p>
            <p className="text-2xl font-bold text-foreground font-display">
              {entries.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold text-primary font-display">
              ₹
              {entries
                .reduce((s, e) => s + e.totalAmount, 0)
                .toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Balance Due</p>
            <p className="text-2xl font-bold text-destructive font-display">
              ₹
              {entries
                .reduce((s, e) => s + getBalanceDue(e.id), 0)
                .toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Entries table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">
            Procurement Entries
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-10 w-10 text-muted-foreground opacity-20 mb-3" />
              <p className="text-muted-foreground text-sm">
                No procurement entries yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Click "+ New Entry" to add your first invoice
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs font-semibold">
                      Invoice No.
                    </TableHead>
                    <TableHead className="text-xs font-semibold">
                      Vendor
                    </TableHead>
                    <TableHead className="text-xs font-semibold">
                      Date
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-right">
                      Items
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-right">
                      Base Amount
                    </TableHead>
                    <TableHead className="text-xs font-semibold">GST</TableHead>
                    <TableHead className="text-xs font-semibold text-right">
                      Total
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-right">
                      Balance Due
                    </TableHead>
                    <TableHead className="text-xs font-semibold">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => {
                    const vendor = vendors.find((v) => v.id === entry.vendorId);
                    const balance = getBalanceDue(entry.id);
                    return (
                      <TableRow
                        key={entry.id}
                        className="hover:bg-muted/20 cursor-pointer"
                      >
                        <TableCell className="text-sm font-medium">
                          {entry.invoiceNumber}
                        </TableCell>
                        <TableCell className="text-sm">
                          {vendor?.name ?? "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(entry.invoiceDate).toLocaleDateString(
                            "en-IN",
                          )}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {entry.items.length}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          ₹{entry.baseAmount.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell>
                          {entry.gstAvailable ? (
                            <Badge
                              variant="outline"
                              className="text-xs border-green-400 text-green-700 bg-green-50"
                            >
                              ₹
                              {(
                                entry.cgst +
                                entry.sgst +
                                entry.igst
                              ).toLocaleString("en-IN")}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-xs border-amber-400 text-amber-700 bg-amber-50"
                            >
                              NA
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-sm font-bold text-primary">
                          ₹{entry.totalAmount.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-right">
                          {balance > 0 ? (
                            <span className="text-sm font-semibold text-destructive">
                              ₹{balance.toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                              Paid
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 text-primary"
                            onClick={() => setSelectedEntryId(entry.id)}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New entry form */}
      <NewEntryForm
        open={newEntryOpen}
        onClose={() => setNewEntryOpen(false)}
        onSaved={refresh}
      />

      {/* Entry detail */}
      {selectedEntryId && (
        <EntryDetail
          entryId={selectedEntryId}
          onClose={() => setSelectedEntryId(null)}
          onRefresh={refresh}
        />
      )}
    </div>
  );
}
