import type { MOQItem, Project, Quotation } from "../backend.d";
import {
  Variant_hybrid_offGrid_onGrid,
  Variant_sheetMetal_rccRooftop_other_groundMount,
} from "../backend.d";
import type { CompanyProfile } from "../hooks/useCompanyProfile";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function formatDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function sanitizeFilename(str: string): string {
  return str.replace(/[^a-zA-Z0-9_\-. ]/g, "_").replace(/\s+/g, "_");
}

function formatSystemType(
  type: Variant_hybrid_offGrid_onGrid | undefined,
): string {
  if (!type) return "—";
  const map: Record<string, string> = {
    [Variant_hybrid_offGrid_onGrid.onGrid]: "On-Grid",
    [Variant_hybrid_offGrid_onGrid.offGrid]: "Off-Grid",
    [Variant_hybrid_offGrid_onGrid.hybrid]: "Hybrid",
  };
  return map[type] ?? String(type);
}

function formatInstallationType(
  type: Variant_sheetMetal_rccRooftop_other_groundMount | undefined,
): string {
  if (!type) return "—";
  const map: Record<string, string> = {
    [Variant_sheetMetal_rccRooftop_other_groundMount.rccRooftop]: "RCC Rooftop",
    [Variant_sheetMetal_rccRooftop_other_groundMount.sheetMetal]:
      "Sheet Metal Roof",
    [Variant_sheetMetal_rccRooftop_other_groundMount.groundMount]:
      "Ground Mount",
    [Variant_sheetMetal_rccRooftop_other_groundMount.other]: "Other",
  };
  return map[type] ?? String(type);
}

function row(label: string, value: string) {
  return `
    <tr>
      <td style="padding:4px 8px;font-weight:bold;color:#1e3a5f;width:40%;">${label}</td>
      <td style="padding:4px 8px;">${value}</td>
    </tr>`;
}

// ─── Main export function ─────────────────────────────────────────────────────
// Uses browser print dialog to generate a PDF — no external library needed.

export async function exportQuotationPDF(
  quotation: Quotation,
  companyProfile: CompanyProfile,
  project: Project | undefined,
  moqItems: MOQItem[],
): Promise<void> {
  const today = new Date();
  const netInv = quotation.totalCost - quotation.subsidy;
  const netSavings25 = quotation.annualSavings * 25 - netInv;

  // Group MOQ items by category
  const grouped = (moqItems ?? []).reduce(
    (acc, item) => {
      const cat = item.category || "General";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {} as Record<string, MOQItem[]>,
  );

  const grandTotal = (moqItems ?? []).reduce((s, i) => s + i.totalPrice, 0);

  let moqTableRows = "";
  let serial = 0;
  for (const [cat, items] of Object.entries(grouped)) {
    moqTableRows += `
      <tr>
        <td colspan="7" style="background:#f0f4f8;font-weight:bold;color:#1e3a5f;padding:5px 8px;font-size:10px;">${cat.toUpperCase()}</td>
      </tr>`;
    for (const item of items) {
      serial += 1;
      moqTableRows += `
        <tr>
          <td style="padding:4px 6px;text-align:center;">${serial}</td>
          <td style="padding:4px 6px;">${item.itemName}</td>
          <td style="padding:4px 6px;">${item.brand || "—"}</td>
          <td style="padding:4px 6px;text-align:center;">${item.quantity}</td>
          <td style="padding:4px 6px;text-align:center;">${item.unit}</td>
          <td style="padding:4px 6px;text-align:right;">${formatCurrency(item.unitPrice)}</td>
          <td style="padding:4px 6px;text-align:right;font-weight:bold;">${formatCurrency(item.totalPrice)}</td>
        </tr>`;
    }
  }

  const defaultTerms =
    "1. Payment Terms: 50% advance, 40% before delivery, 10% on commissioning.\n" +
    "2. Delivery: 4–6 weeks from order confirmation.\n" +
    "3. Warranty: As per manufacturer's terms for all equipment supplied.\n" +
    "4. Net metering application and related approvals are the client's responsibility.\n" +
    "5. Force majeure: The company shall not be liable for delays due to circumstances beyond its control.";

  const termsText =
    quotation.termsAndConditions?.trim().length > 0
      ? quotation.termsAndConditions
      : defaultTerms;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Quotation - ${quotation.proposalNumber}</title>
  <style>
    @page { size: A4; margin: 15mm 12mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #333; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1e3a5f; padding-bottom: 10px; margin-bottom: 14px; }
    .company-logo { max-height: 60px; max-width: 100px; object-fit: contain; }
    .company-info h1 { font-size: 16px; color: #1e3a5f; margin-bottom: 3px; }
    .company-info p { font-size: 9px; color: #555; line-height: 1.4; }
    .proposal-info { text-align: right; }
    .proposal-info h2 { font-size: 12px; color: #1e3a5f; }
    .proposal-info p { font-size: 9px; color: #555; }
    .section { margin-bottom: 14px; }
    .section-title { font-size: 11px; font-weight: bold; color: #1e3a5f; text-transform: uppercase; margin-bottom: 6px; border-bottom: 1.5px solid #f5a623; padding-bottom: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 9.5px; }
    th { background: #1e3a5f; color: #fff; padding: 5px 8px; text-align: left; }
    td { border-bottom: 1px solid #e8e8e8; }
    .alt { background: #f8f9fa; }
    .grand-total td { background: #1e3a5f; color: #fff; font-weight: bold; padding: 5px 8px; }
    .terms { font-size: 9px; line-height: 1.6; white-space: pre-line; color: #444; }
    .footer { text-align: center; font-size: 8px; color: #999; border-top: 1px solid #ddd; padding-top: 6px; margin-top: 14px; }
    .yellow-bar { background: #f5a623; height: 2px; width: 40px; margin-top: 2px; }
  </style>
</head>
<body>
  <!-- Letterhead -->
  <div class="header">
    <div style="display:flex;gap:12px;align-items:flex-start;">
      ${companyProfile.logoBase64 ? `<img src="${companyProfile.logoBase64}" class="company-logo" alt="logo">` : ""}
      <div class="company-info">
        <h1>${companyProfile.companyName || "Solar EPC Company"}</h1>
        ${companyProfile.companyAddress ? `<p>${companyProfile.companyAddress}</p>` : ""}
        ${companyProfile.gstNumber ? `<p>GSTIN: ${companyProfile.gstNumber}</p>` : ""}
      </div>
    </div>
    <div class="proposal-info">
      <h2>PROPOSAL</h2>
      <p>Proposal No.: <strong>${quotation.proposalNumber}</strong></p>
      <p>Date: ${formatDate(today)}</p>
    </div>
  </div>

  <!-- Client Details -->
  <div class="section">
    <div class="section-title">Client Details</div>
    <table>
      <tbody>
        ${row("Client Name", quotation.clientName || "—")}
        ${row("Site / Company", quotation.companyName || "—")}
        ${row("Proposal No.", quotation.proposalNumber)}
        ${row("Date", formatDate(today))}
      </tbody>
    </table>
  </div>

  ${
    project
      ? `<div class="section">
    <div class="section-title">System Summary</div>
    <table>
      <tbody>
        ${row("System Type", formatSystemType(project.systemType))}
        ${row("System Capacity", `${project.systemSizeKW} kWp`)}
        ${row("Installation Type", formatInstallationType(project.installationType))}
        ${row("Battery Capacity", project.batteryCapacityKWh && project.batteryCapacityKWh > 0 ? `${project.batteryCapacityKWh} kWh` : "N/A")}
        ${row("Total Project Cost", formatCurrency(quotation.totalCost))}
        ${row("GST", `${quotation.gst}%`)}
        ${row("Subsidy", quotation.subsidy > 0 ? formatCurrency(quotation.subsidy) : "—")}
        ${row("Net Investment", formatCurrency(netInv))}
      </tbody>
    </table>
  </div>`
      : ""
  }

  <!-- Bill of Materials -->
  <div class="section">
    <div class="section-title">Bill of Materials</div>
    ${
      moqItems && moqItems.length > 0
        ? `<table>
      <thead>
        <tr>
          <th style="width:28px;">#</th>
          <th>Item Name</th>
          <th>Brand</th>
          <th style="width:40px;text-align:center;">Qty</th>
          <th style="width:40px;text-align:center;">Unit</th>
          <th style="width:70px;text-align:right;">Unit Price</th>
          <th style="width:70px;text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${moqTableRows}
        <tr class="grand-total">
          <td colspan="6" style="padding:5px 8px;">GRAND TOTAL (Ex-GST)</td>
          <td style="text-align:right;padding:5px 8px;">${formatCurrency(grandTotal)}</td>
        </tr>
      </tbody>
    </table>`
        : `<p style="color:#999;font-style:italic;padding:6px 0;">MOQ not yet generated for this project.</p>`
    }
  </div>

  <!-- ROI -->
  <div class="section">
    <div class="section-title">Return on Investment</div>
    <table>
      <thead>
        <tr><th>Parameter</th><th style="text-align:right;">Value</th></tr>
      </thead>
      <tbody>
        <tr><td style="padding:4px 8px;font-weight:bold;color:#1e3a5f;">Total Project Cost</td><td style="padding:4px 8px;text-align:right;">${formatCurrency(quotation.totalCost)}</td></tr>
        <tr class="alt"><td style="padding:4px 8px;font-weight:bold;color:#1e3a5f;">Subsidy</td><td style="padding:4px 8px;text-align:right;">${quotation.subsidy > 0 ? formatCurrency(quotation.subsidy) : "—"}</td></tr>
        <tr><td style="padding:4px 8px;font-weight:bold;color:#1e3a5f;">Net Investment</td><td style="padding:4px 8px;text-align:right;">${formatCurrency(netInv)}</td></tr>
        <tr class="alt"><td style="padding:4px 8px;font-weight:bold;color:#1e3a5f;">Annual Energy Savings</td><td style="padding:4px 8px;text-align:right;">${formatCurrency(quotation.annualSavings)}</td></tr>
        <tr><td style="padding:4px 8px;font-weight:bold;color:#1e3a5f;">Payback Period</td><td style="padding:4px 8px;text-align:right;">${quotation.paybackYears.toFixed(1)} years</td></tr>
        <tr class="alt"><td style="padding:4px 8px;font-weight:bold;color:#1e3a5f;">Internal Rate of Return (IRR)</td><td style="padding:4px 8px;text-align:right;">${quotation.irr.toFixed(1)}%</td></tr>
        <tr><td style="padding:4px 8px;font-weight:bold;color:#1e3a5f;">25-Year Net Savings</td><td style="padding:4px 8px;text-align:right;">${formatCurrency(netSavings25 > 0 ? netSavings25 : 0)}</td></tr>
        <tr class="alt"><td style="padding:4px 8px;font-weight:bold;color:#1e3a5f;">Carbon Offset</td><td style="padding:4px 8px;text-align:right;">${quotation.carbonSavings.toFixed(2)} tonnes CO₂/year</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Terms & Conditions -->
  <div class="section">
    <div class="section-title">Terms &amp; Conditions</div>
    <p class="terms">${termsText}</p>
  </div>

  <div class="footer">
    Solar EPC Pro | ${companyProfile.companyName || "Solar EPC Company"} | Confidential
  </div>
</body>
</html>`;

  // Open in a new window and trigger print dialog
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) {
    // Fallback: download as HTML
    const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Quotation_${sanitizeFilename(quotation.proposalNumber)}_${sanitizeFilename(quotation.clientName)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();

  // Give images time to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 300);
  };

  // Fallback if onload doesn't fire
  setTimeout(() => {
    if (!printWindow.closed) {
      printWindow.focus();
      printWindow.print();
    }
  }, 800);
}
