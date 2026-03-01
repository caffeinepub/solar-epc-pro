import type { MOQItem, Project, Quotation } from "../backend.d";
import {
  Variant_hybrid_offGrid_onGrid,
  Variant_sheetMetal_rccRooftop_other_groundMount,
} from "../backend.d";
import type { CompanyProfile } from "../hooks/useCompanyProfile";

// Dynamic imports for jsPDF to avoid SSR issues
// We import them at the module level since this is browser-only code
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Color constants ─────────────────────────────────────────────────────────
const NAVY = [30, 58, 95] as [number, number, number];
const NAVY_LIGHT = [44, 82, 130] as [number, number, number];
const YELLOW = [245, 166, 35] as [number, number, number];
const BODY_TEXT = [51, 51, 51] as [number, number, number];
const LIGHT_GRAY = [248, 249, 250] as [number, number, number];
const MID_GRAY = [220, 220, 225] as [number, number, number];
const WHITE = [255, 255, 255] as [number, number, number];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return `\u20B9${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
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

// ─── Section drawing helpers ─────────────────────────────────────────────────

function drawSectionHeading(doc: jsPDF, title: string, y: number): number {
  // Navy bold uppercase text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text(title.toUpperCase(), 14, y);

  // Yellow accent underline bar (40pt wide, 1.5pt tall)
  doc.setFillColor(...YELLOW);
  doc.rect(14, y + 1.5, 40, 1.5, "F");

  return y + 8; // Return Y position after the heading
}

function addFooter(doc: jsPDF, pageNum: number, totalPages: number): void {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const footerY = pageHeight - 12;

  // Footer line
  doc.setDrawColor(...MID_GRAY);
  doc.setLineWidth(0.3);
  doc.line(14, footerY - 2, pageWidth - 14, footerY - 2);

  // Left: confidential
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 130);
  doc.text("Solar EPC Pro | Confidential", 14, footerY + 3);

  // Right: page number
  doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 14, footerY + 3, {
    align: "right",
  });
}

// ─── Main export function ─────────────────────────────────────────────────────

export async function exportQuotationPDF(
  quotation: Quotation,
  companyProfile: CompanyProfile,
  project: Project | undefined,
  moqItems: MOQItem[],
): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const today = new Date();
  let curY = 14;

  // ── Section 1: Letterhead ─────────────────────────────────────────────────
  const headerStartY = curY;
  const logoMaxH = 22;
  const logoMaxW = 40;
  let logoEndX = 14;

  // Try to embed logo
  if (companyProfile.logoBase64 && companyProfile.logoBase64.length > 100) {
    try {
      // Detect image format
      const format = companyProfile.logoBase64.toLowerCase().includes("jpeg")
        ? "JPEG"
        : "PNG";
      doc.addImage(
        companyProfile.logoBase64,
        format,
        14,
        headerStartY,
        logoMaxW,
        logoMaxH,
        undefined,
        "FAST",
      );
      logoEndX = 14 + logoMaxW + 6;
    } catch {
      // If image fails, skip gracefully
      logoEndX = 14;
    }
  }

  // Company name (bold, large)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...NAVY);
  const companyName = companyProfile.companyName || "Solar EPC Company";
  doc.text(companyName, logoEndX, headerStartY + 7);

  // Company address
  if (companyProfile.companyAddress) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...BODY_TEXT);
    const addressLines = doc.splitTextToSize(
      companyProfile.companyAddress,
      pageWidth - logoEndX - 70,
    );
    doc.text(addressLines, logoEndX, headerStartY + 13);
  }

  // GSTIN
  if (companyProfile.gstNumber) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...BODY_TEXT);
    doc.text(`GSTIN: ${companyProfile.gstNumber}`, logoEndX, headerStartY + 20);
  }

  // Right side: Proposal number and date
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text(
    `Proposal No.: ${quotation.proposalNumber}`,
    pageWidth - 14,
    headerStartY + 7,
    {
      align: "right",
    },
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...BODY_TEXT);
  doc.text(`Date: ${formatDate(today)}`, pageWidth - 14, headerStartY + 13, {
    align: "right",
  });

  // Navy divider below header
  curY = headerStartY + 28;
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.8);
  doc.line(14, curY, pageWidth - 14, curY);
  curY += 8;

  // ── Section 2: Client Details ─────────────────────────────────────────────
  curY = drawSectionHeading(doc, "Client Details", curY);

  autoTable(doc, {
    startY: curY,
    head: [],
    body: [
      ["Client Name", quotation.clientName || "—"],
      ["Site / Company", quotation.companyName || "—"],
      ["Contact", "—"],
      ["Proposal No.", quotation.proposalNumber],
      ["Date", formatDate(today)],
    ],
    theme: "plain",
    styles: {
      fontSize: 9,
      textColor: BODY_TEXT,
      cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 2 },
    },
    columnStyles: {
      0: {
        fontStyle: "bold",
        textColor: NAVY,
        cellWidth: 45,
      },
      1: { cellWidth: "auto" },
    },
    tableLineWidth: 0,
    margin: { left: 14, right: 14 },
  });

  curY =
    (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
      .finalY + 8;

  // ── Section 3: System Summary ─────────────────────────────────────────────
  curY = drawSectionHeading(doc, "System Summary", curY);

  if (project) {
    const netInvestment = quotation.totalCost - quotation.subsidy;
    autoTable(doc, {
      startY: curY,
      head: [],
      body: [
        ["System Type", formatSystemType(project.systemType)],
        ["System Capacity", `${project.systemSizeKW} kWp`],
        ["Installation Type", formatInstallationType(project.installationType)],
        [
          "Battery Capacity",
          project.batteryCapacityKWh && project.batteryCapacityKWh > 0
            ? `${project.batteryCapacityKWh} kWh`
            : "N/A",
        ],
        ["Total Project Cost", formatCurrency(quotation.totalCost)],
        ["GST", `${quotation.gst}%`],
        [
          "Subsidy",
          quotation.subsidy > 0 ? formatCurrency(quotation.subsidy) : "—",
        ],
        ["Net Investment", formatCurrency(netInvestment)],
      ],
      theme: "plain",
      styles: {
        fontSize: 9,
        textColor: BODY_TEXT,
        cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 2 },
      },
      columnStyles: {
        0: {
          fontStyle: "bold",
          textColor: NAVY,
          cellWidth: 45,
        },
        1: { cellWidth: "auto" },
      },
      tableLineWidth: 0,
      margin: { left: 14, right: 14 },
    });
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(140, 140, 150);
    doc.text("Project details not available.", 14, curY + 4);
    curY += 10;
  }

  curY =
    (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
      .finalY + 8;

  // ── Section 4: Bill of Materials ──────────────────────────────────────────
  // Check if we need a new page
  if (curY > 230) {
    doc.addPage();
    curY = 14;
  }

  curY = drawSectionHeading(doc, "Bill of Materials", curY);

  if (!moqItems || moqItems.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(140, 140, 150);
    doc.text("MOQ not yet generated for this project.", 14, curY + 4);
    curY += 12;
  } else {
    // Group by category
    const grouped = moqItems.reduce(
      (acc, item) => {
        const cat = item.category || "General";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
      },
      {} as Record<string, MOQItem[]>,
    );

    const tableBody: (
      | string
      | { content: string; colSpan?: number; styles?: object }
    )[][] = [];

    let serialNo = 0;
    const grandTotal = moqItems.reduce((s, i) => s + i.totalPrice, 0);

    for (const [category, items] of Object.entries(grouped)) {
      // Category header row
      tableBody.push([
        {
          content: category.toUpperCase(),
          colSpan: 7,
          styles: {
            fillColor: LIGHT_GRAY,
            textColor: NAVY,
            fontStyle: "bold" as const,
            fontSize: 8.5,
          },
        },
      ]);

      // Item rows
      for (const item of items) {
        serialNo += 1;
        tableBody.push([
          String(serialNo),
          item.itemName,
          item.brand || "—",
          String(item.quantity),
          item.unit,
          formatCurrency(item.unitPrice),
          formatCurrency(item.totalPrice),
        ]);
      }
    }

    // Grand total row
    tableBody.push([
      {
        content: "GRAND TOTAL",
        colSpan: 6,
        styles: {
          fillColor: NAVY,
          textColor: WHITE,
          fontStyle: "bold" as const,
        },
      },
      {
        content: formatCurrency(grandTotal),
        styles: {
          fillColor: NAVY,
          textColor: WHITE,
          fontStyle: "bold" as const,
          halign: "right" as const,
        },
      },
    ]);

    autoTable(doc, {
      startY: curY,
      head: [["#", "Item Name", "Brand", "Qty", "Unit", "Unit Price", "Total"]],
      body: tableBody,
      theme: "grid",
      headStyles: {
        fillColor: NAVY_LIGHT,
        textColor: WHITE,
        fontSize: 8.5,
        fontStyle: "bold",
        cellPadding: { top: 2, bottom: 2, left: 2, right: 2 },
      },
      bodyStyles: {
        fontSize: 8,
        textColor: BODY_TEXT,
        cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 2 },
      },
      columnStyles: {
        0: { cellWidth: 8, halign: "center" },
        1: { cellWidth: "auto" },
        2: { cellWidth: 28 },
        3: { cellWidth: 12, halign: "center" },
        4: { cellWidth: 14, halign: "center" },
        5: { cellWidth: 24, halign: "right" },
        6: { cellWidth: 24, halign: "right" },
      },
      margin: { left: 14, right: 14 },
    });

    curY =
      (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 8;
  }

  // ── Section 5: ROI Summary ────────────────────────────────────────────────
  if (curY > 230) {
    doc.addPage();
    curY = 14;
  }

  curY = drawSectionHeading(doc, "Return on Investment", curY);

  const netInv = quotation.totalCost - quotation.subsidy;
  const netSavings25 = quotation.annualSavings * 25 - netInv;

  autoTable(doc, {
    startY: curY,
    head: [["Parameter", "Value"]],
    body: [
      ["Total Project Cost", formatCurrency(quotation.totalCost)],
      [
        "Subsidy",
        quotation.subsidy > 0 ? formatCurrency(quotation.subsidy) : "—",
      ],
      ["Net Investment", formatCurrency(netInv)],
      ["Annual Energy Savings", formatCurrency(quotation.annualSavings)],
      ["Payback Period", `${quotation.paybackYears.toFixed(1)} years`],
      ["Internal Rate of Return (IRR)", `${quotation.irr.toFixed(1)}%`],
      [
        "25-Year Net Savings",
        formatCurrency(netSavings25 > 0 ? netSavings25 : 0),
      ],
      [
        "Carbon Offset",
        `${quotation.carbonSavings.toFixed(2)} tonnes CO\u2082/year`,
      ],
    ],
    theme: "grid",
    headStyles: {
      fillColor: NAVY,
      textColor: WHITE,
      fontSize: 9,
      fontStyle: "bold",
      cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
    },
    bodyStyles: {
      fontSize: 9,
      textColor: BODY_TEXT,
      cellPadding: { top: 2, bottom: 2, left: 3, right: 3 },
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 80, textColor: NAVY },
      1: { cellWidth: "auto", halign: "right" },
    },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    margin: { left: 14, right: 14 },
  });

  curY =
    (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
      .finalY + 8;

  // ── Section 6: Terms & Conditions ─────────────────────────────────────────
  if (curY > 240) {
    doc.addPage();
    curY = 14;
  }

  curY = drawSectionHeading(doc, "Terms & Conditions", curY);

  const defaultTerms =
    "1. Payment Terms: 50% advance, 40% before delivery, 10% on commissioning.\n" +
    "2. Delivery: 4–6 weeks from order confirmation.\n" +
    "3. Warranty: As per manufacturer's terms for all equipment supplied.\n" +
    "4. Net metering application and related approvals are the client's responsibility.\n" +
    "5. Force majeure: The company shall not be liable for delays due to circumstances beyond its control.";

  const termsText =
    quotation.termsAndConditions &&
    quotation.termsAndConditions.trim().length > 0
      ? quotation.termsAndConditions
      : defaultTerms;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...BODY_TEXT);

  const termsLines = doc.splitTextToSize(termsText, pageWidth - 28);
  doc.text(termsLines, 14, curY);
  curY += termsLines.length * 4.5 + 8;

  // ── Add footers to all pages ──────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    addFooter(doc, p, totalPages);
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const filename = `Quotation_${sanitizeFilename(quotation.proposalNumber)}_${sanitizeFilename(quotation.clientName)}.pdf`;
  doc.save(filename);
}
