export type SheetRow = Record<string, string>;

type VisualizationCell = { v?: unknown; f?: unknown } | null;
type VisualizationTable = {
  cols?: Array<{ label?: unknown }>;
  rows?: Array<{ c?: VisualizationCell[] }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function visualizationPayload(source: string): unknown {
  const prefix = "google.visualization.Query.setResponse(";
  const start = source.indexOf(prefix);
  const end = source.lastIndexOf(");");
  if (start < 0 || end <= start + prefix.length) {
    throw new Error("Google Sheets returned an invalid visualization response");
  }
  return JSON.parse(source.slice(start + prefix.length, end));
}

export function parseVisualizationRows(source: string): SheetRow[] {
  const payload = visualizationPayload(source);
  if (
    !isRecord(payload) ||
    !isRecord(payload.table) ||
    !Array.isArray(payload.table.cols) ||
    !Array.isArray(payload.table.rows)
  ) {
    throw new Error("Google Sheets response did not contain a table");
  }

  const table = payload.table as VisualizationTable;
  const rows = table.rows ?? [];
  let headers = (table.cols ?? []).map((column) =>
    typeof column.label === "string" ? column.label.trim() : ""
  );
  let dataRows = rows;

  if (!headers.some(Boolean)) {
    const [headerRow, ...remainingRows] = rows;
    headers = (headerRow?.c ?? []).map((cell) =>
      cell && typeof cell.v === "string" ? cell.v.trim() : ""
    );
    dataRows = remainingRows;
  }

  if (headers.length === 0 || headers.every((header) => !header)) {
    throw new Error("Google Sheets response is missing column headers");
  }

  return dataRows.map((row) => {
    const result: SheetRow = {};
    (row.c ?? []).forEach((cell, index) => {
      const header = headers[index];
      const value = cell?.v;
      if (header && value !== null && value !== undefined) {
        result[header] = String(value);
      }
    });
    return result;
  });
}

export async function fetchSheetRows(
  spreadsheetId: string,
  sheetName: string,
): Promise<SheetRow[]> {
  const url = new URL(
    `https://docs.google.com/spreadsheets/d/${
      encodeURIComponent(spreadsheetId)
    }/gviz/tq`,
  );
  url.searchParams.set("sheet", sheetName);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Sheets returned HTTP ${response.status}`);
  }

  return parseVisualizationRows(await response.text());
}
