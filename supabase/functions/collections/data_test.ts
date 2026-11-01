import { parseVisualizationRows } from "./data.ts";

Deno.test("parses labeled Google Visualization columns", () => {
  const rows = parseVisualizationRows(
    `google.visualization.Query.setResponse({"table":{"cols":[{"label":"cat_name"},{"label":"img"}],"rows":[{"c":[{"v":"Paper"},{"v":"paper.jpg"}]}]}});`,
  );
  if (rows.length !== 1 || rows[0].cat_name !== "Paper") {
    throw new Error("Expected the labeled sheet row to be parsed");
  }
  if (rows[0].img !== "paper.jpg") {
    throw new Error("Expected image data to be preserved");
  }
});

Deno.test("uses the first row as headers when column labels are empty", () => {
  const rows = parseVisualizationRows(
    `google.visualization.Query.setResponse({"table":{"cols":[{"label":""},{"label":""}],"rows":[{"c":[{"v":"1"},{"v":"2"}]},{"c":[{"v":"Writing"},{"v":"Pens"}]}]}});`,
  );
  if (rows.length !== 1 || rows[0]["1"] !== "Writing") {
    throw new Error("Expected the first row to provide headers");
  }
  if (rows[0]["2"] !== "Pens") {
    throw new Error("Expected the second column value to be parsed");
  }
});

Deno.test("ignores blank columns in the sheet header row", () => {
  const rows = parseVisualizationRows(
    `google.visualization.Query.setResponse({"table":{"cols":[{"label":""},{"label":""},{"label":""}],"rows":[{"c":[{"v":"1"},{"v":null},{"v":"3"}]},{"c":[{"v":"Writing"},{"v":null},{"v":"Pens"}]}]}});`,
  );
  if (
    rows.length !== 1 || rows[0]["1"] !== "Writing" || rows[0]["3"] !== "Pens"
  ) {
    throw new Error("Expected values under named headers to be retained");
  }
  if ("undefined" in rows[0]) {
    throw new Error("Expected values under blank headers to be ignored");
  }
});

Deno.test("omits blank cells and rejects malformed responses", () => {
  const rows = parseVisualizationRows(
    `google.visualization.Query.setResponse({"table":{"cols":[{"label":"name"},{"label":"image"}],"rows":[{"c":[{"v":"Paper"},{"v":null}]}]}});`,
  );
  if ("image" in rows[0]) {
    throw new Error("Expected blank cells to be omitted");
  }

  for (
    const source of [
      "",
      "not json",
      "google.visualization.Query.setResponse({});",
    ]
  ) {
    let rejected = false;
    try {
      parseVisualizationRows(source);
    } catch {
      rejected = true;
    }
    if (!rejected) throw new Error("Expected malformed response to fail");
  }
});
