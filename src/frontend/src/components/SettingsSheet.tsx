import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useCompanyProfile } from "../hooks/useCompanyProfile";

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsSheet({ open, onClose }: SettingsSheetProps) {
  const { profile, saveProfile } = useCompanyProfile();
  const [companyName, setCompanyName] = useState(profile.companyName);
  const [companyAddress, setCompanyAddress] = useState(profile.companyAddress);
  const [gstNumber, setGstNumber] = useState(profile.gstNumber);
  const [logoBase64, setLogoBase64] = useState(profile.logoBase64);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync local state when sheet opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setCompanyName(profile.companyName);
      setCompanyAddress(profile.companyAddress);
      setGstNumber(profile.gstNumber);
      setLogoBase64(profile.logoBase64);
    } else {
      onClose();
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setLogoBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Small delay for UX feedback
    await new Promise((r) => setTimeout(r, 300));
    saveProfile({ companyName, companyAddress, gstNumber, logoBase64 });
    toast.success("Company profile saved");
    setIsSaving(false);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-2">
          <SheetTitle className="flex items-center gap-2 text-navy font-display">
            <Building2 className="h-5 w-5 text-solar-dark" />
            Company Settings
          </SheetTitle>
          <SheetDescription>
            Owner-only. Changes apply across all quotations.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-5 px-4 pb-4 pt-2">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Company Logo</Label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg border border-border bg-secondary/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {logoBase64 ? (
                  <img
                    src={logoBase64}
                    alt="Company logo"
                    className="w-16 h-16 object-contain rounded"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground text-center leading-tight px-1">
                    No logo
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload Logo
                </Button>
                {logoBase64 && (
                  <button
                    type="button"
                    onClick={() => setLogoBase64("")}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors text-left"
                  >
                    Remove logo
                  </button>
                )}
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, SVG accepted
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>
          </div>

          {/* Company Name */}
          <div className="space-y-1.5">
            <Label htmlFor="settings-company-name">Company Name</Label>
            <Input
              id="settings-company-name"
              placeholder="e.g. Sunshine Solar EPC Pvt. Ltd."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Company Address */}
          <div className="space-y-1.5">
            <Label htmlFor="settings-company-address">Company Address</Label>
            <Textarea
              id="settings-company-address"
              placeholder="e.g. 123, Industrial Estate, Sector 5, Ahmedabad - 380001, Gujarat"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              rows={3}
              className="text-sm resize-none"
            />
          </div>

          {/* GST Number */}
          <div className="space-y-1.5">
            <Label htmlFor="settings-gst">GST Number (GSTIN)</Label>
            <Input
              id="settings-gst"
              placeholder="e.g. 24AABCU9603R1ZX"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
              className="text-sm font-mono"
              maxLength={15}
            />
            <p className="text-xs text-muted-foreground">
              15-character GSTIN as per GST registration
            </p>
          </div>

          {/* Save button */}
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full gap-2 bg-navy hover:bg-navy/90 text-white"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isSaving ? "Saving..." : "Save Company Profile"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
