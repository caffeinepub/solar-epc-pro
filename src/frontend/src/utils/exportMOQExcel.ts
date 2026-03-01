import type { MOQItem, Project } from "../backend.d";

/**
 * Exports MOQ to Excel using a CSV file (browser-native, no external library needed).
 * Since xlsx is not available in the frozen package.json, we export as CSV
 * which Excel opens natively.
 */
export function exportMOQToExcel(
  project: Project,
  moqItems: MOQItem[],
  _clientName?: string,
): void {
  // Installation type label
  const installLabel =
    project.installationType === "rccRooftop"
      ? "RCC Rooftop"
      : project.installationType === "sheetMetal"
        ? "Sheet Metal"
        : project.installationType === "groundMount"
          ? "Ground Mount"
          : "Other";

  // System type label
  const systemLabel =
    project.systemType === "onGrid"
      ? "On-Grid"
      : project.systemType === "offGrid"
        ? "Off-Grid"
        : "Hybrid";

  const grandTotal = moqItems.reduce((sum, item) => sum + item.totalPrice, 0);

  // Build CSV rows
  const rows: string[][] = [
    ["Solar EPC Pro - Material Order Quantity (MOQ)"],
    [],
    ["Project Details"],
    ["Client Name", project.clientName],
    ["System Size (kWp)", String(Number(project.systemSizeKW.toFixed(2)))],
    ["System Type", systemLabel],
    ["Installation Type", installLabel],
    [],
    ["Bill of Materials"],
    [
      "#",
      "Item Name",
      "Category",
      "Brand",
      "Quantity",
      "Unit",
      "Unit Price (INR)",
      "Total Price (INR)",
    ],
  ];

  moqItems.forEach((item, i) => {
    rows.push([
      String(i + 1),
      item.itemName,
      item.category,
      item.brand || "-",
      String(item.quantity),
      item.unit,
      String(item.unitPrice),
      String(item.totalPrice),
    ]);
  });

  rows.push([]);
  rows.push(["", "", "", "", "", "", "TOTAL (Ex-GST)", String(grandTotal)]);

  // CSV serialization — escape cells with commas/quotes/newlines
  const escapeCell = (cell: string) => {
    if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
      return `"${cell.replace(/"/g, '""')}"`;
    }
    return cell;
  };

  const csvContent = rows
    .map((row) => row.map(escapeCell).join(","))
    .join("\n");

  // Use BOM for Excel UTF-8 detection
  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `MOQ_${project.clientName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
