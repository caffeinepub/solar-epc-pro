// Financial year Apr-Mar. Quarters: Apr-Jun=A, Jul-Sep=B, Oct-Dec=C, Jan-Mar=D
// Format: "YY-YY-Q-SERIAL"
// First serial ever: 1000. After first FY change: 2000+

interface QuotState {
  serial: number;
  fy: string;
  firstFYCompleted: boolean;
}

function getCurrentFYAndQuarter(): { fy: string; quarter: string } {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();
  const fyStart = month >= 4 ? year : year - 1;
  const fyEnd = fyStart + 1;
  const fy = `${String(fyStart).slice(-2)}-${String(fyEnd).slice(-2)}`;
  const quarter =
    month >= 4 && month <= 6
      ? "A"
      : month >= 7 && month <= 9
        ? "B"
        : month >= 10
          ? "C"
          : "D";
  return { fy, quarter };
}

export function generateNextProposalNumber(): string {
  const { fy, quarter } = getCurrentFYAndQuarter();
  const stored = localStorage.getItem("solar_epc_quot_state");
  let state: QuotState = stored
    ? (JSON.parse(stored) as QuotState)
    : { serial: 999, fy: "", firstFYCompleted: false };

  if (state.fy === "") {
    // First quotation ever
    state = { serial: 1000, fy, firstFYCompleted: false };
  } else if (state.fy !== fy) {
    // New financial year
    state = { serial: 2000, fy, firstFYCompleted: true };
  } else {
    state.serial += 1;
  }

  localStorage.setItem("solar_epc_quot_state", JSON.stringify(state));
  return `${fy}-${quarter}-${state.serial}`;
}

export function peekCurrentSerial(): number {
  const stored = localStorage.getItem("solar_epc_quot_state");
  if (!stored) return 999;
  return (JSON.parse(stored) as QuotState).serial;
}
