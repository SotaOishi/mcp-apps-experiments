import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  RESOURCE_MIME_TYPE,
  registerAppResource,
  registerAppTool,
} from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import cors from "cors";
import express from "express";
import { companiesSchema } from "./shared/companySchema";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const server = new McpServer({
  name: "My MCP App Server",
  version: "1.0.0",
});

const resourceUri = "ui://avocado-company-data/mcp-app.html";

registerAppTool(
  server,
  "get-avocado-company-data",
  {
    title: "Get Avocado Company Data",
    description: "Returns Avocado Company data.",
    inputSchema: {},
    outputSchema: { companies: companiesSchema },
    _meta: { ui: { resourceUri } },
  },
  async () => {
    const company = {
      name: "株式会社アボカド大好き",
      data: [
        { year: 2020, sales: 8500, operatingProfit: 1200, cash: 2200, employees: 320 },
        { year: 2021, sales: 9200, operatingProfit: 1350, cash: 2500, employees: 350 },
        { year: 2022, sales: 10200, operatingProfit: 1520, cash: 2800, employees: 380 },
        { year: 2023, sales: 11300, operatingProfit: 1680, cash: 3000, employees: 420 },
        { year: 2024, sales: 12500, operatingProfit: 1850, cash: 3200, employees: 450 },
      ],
    };

    return {
      structuredContent: { companies: [company] },
      content: [{ type: "text", text: JSON.stringify({ companies: [company] }) }],
    };
  },
);

registerAppTool(
  server,
  "get-similar-companies",
  {
    title: "Get Companies",
    description: "Returns 5 years of data for 3 fictional companies.",
    inputSchema: {},
    outputSchema: { companies: companiesSchema },
    _meta: { ui: { resourceUri } },
  },
  async () => {
    const companies = [
      {
        name: "Avocado Inc.",
        data: [
          { year: 2020, sales: 38000, operatingProfit: 2400, cash: 6500, employees: 1080 },
          { year: 2021, sales: 40000, operatingProfit: 2600, cash: 7000, employees: 1120 },
          { year: 2022, sales: 42000, operatingProfit: 2800, cash: 7500, employees: 1150 },
          { year: 2023, sales: 43500, operatingProfit: 3000, cash: 8000, employees: 1180 },
          { year: 2024, sales: 45000, operatingProfit: 3200, cash: 8500, employees: 1200 },
        ],
      },
      {
        name: "パパイヤ小島グループ",
        data: [
          { year: 2020, sales: 10000, operatingProfit: 1000, cash: 3000, employees: 380 },
          { year: 2021, sales: 12500, operatingProfit: 1300, cash: 3600, employees: 430 },
          { year: 2022, sales: 15000, operatingProfit: 1600, cash: 4200, employees: 480 },
          { year: 2023, sales: 18000, operatingProfit: 2000, cash: 5000, employees: 550 },
          { year: 2024, sales: 21000, operatingProfit: 2400, cash: 5800, employees: 620 },
        ],
      },
    ];
    return {
      structuredContent: { companies },
      content: [{ type: "text", text: JSON.stringify({ companies }) }],
    };
  },
);

registerAppResource(
  server,
  resourceUri,
  resourceUri,
  { mimeType: RESOURCE_MIME_TYPE },
  async () => {
    const html = await fs.readFile(path.join(__dirname, "dist", "mcp-app.html"), "utf-8");
    return {
      contents: [{ uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html }],
    };
  },
);

const expressApp = express();
expressApp.use(cors());
expressApp.use(express.json());

expressApp.post("/mcp", async (req, res) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  res.on("close", () => transport.close());
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

expressApp.listen(3001, (err) => {
  if (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
  console.log("Server listening on http://localhost:3001/mcp");
});
