import type { App, McpUiHostContext } from "@modelcontextprotocol/ext-apps";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { useCallback, useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Company } from "../../shared/companySchema";
import { structuredCompaniesSchema } from "../../shared/companySchema";

function extractCompaniesFromStructuredContent(value: unknown): Company[] {
  const list = structuredCompaniesSchema.safeParse(value);
  if (list.success) {
    return list.data.companies;
  }
  return [];
}

function formatNumber(num: number): string {
  return num.toLocaleString("ja-JP");
}

interface CompanyDashboardInnerProps {
  app: App;
  toolResult: CallToolResult | null;
  hostContext?: McpUiHostContext;
}

type MetricKey = "sales" | "operatingProfit" | "cash" | "employees";

const METRICS: { key: MetricKey; label: string; unit: string }[] = [
  { key: "sales", label: "売上高", unit: "百万円" },
  { key: "operatingProfit", label: "経常利益", unit: "百万円" },
  { key: "cash", label: "現金", unit: "百万円" },
  { key: "employees", label: "従業員数", unit: "人" },
];

const COMPANY_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00C49F"];

export function CompanyDashboardInner({
  app,
  toolResult,
  hostContext,
}: CompanyDashboardInnerProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("sales");
  const [similarLoaded, setSimilarLoaded] = useState(false);

  useEffect(() => {
    const structuredCompanies = extractCompaniesFromStructuredContent(
      toolResult?.structuredContent,
    );
    if (structuredCompanies.length > 0) {
      setCompanies(structuredCompanies);
      return;
    }
  }, [toolResult]);

  const handleGetSimilarCompanies = useCallback(async () => {
    try {
      const result = await app.callServerTool({ name: "get-similar-companies", arguments: {} });
      const structuredCompanies = extractCompaniesFromStructuredContent(result.structuredContent);
      if (structuredCompanies.length > 0) {
        setCompanies((prev) => [...prev, ...structuredCompanies]);
        setSimilarLoaded(true);
        return;
      }
    } catch (e) {
      console.error(e);
    }
  }, [app]);

  const handleCompanyNews = useCallback(async () => {
    const signal = AbortSignal.timeout(5000);
    const message = "株式会社アボカド大好きの最新ニュースを調べて";
    try {
      const { isError } = await app.sendMessage(
        { role: "user", content: [{ type: "text", text: message }] },
        { signal },
      );
      console.info("Message", isError ? "rejected" : "accepted");
    } catch (e) {
      console.error("Message send error:", signal.aborted ? "timed out" : e);
    }
  }, [app]);

  const handleCompanyHP = useCallback(async () => {
    await app.openLink({ url: "https://github.com/SotaOishi/mcp-apps-experiments" });
  }, [app]);

  console.log(companies);

  return (
    <main
      style={{
        paddingTop: hostContext?.safeAreaInsets?.top,
        paddingRight: hostContext?.safeAreaInsets?.right,
        paddingBottom: hostContext?.safeAreaInsets?.bottom,
        paddingLeft: hostContext?.safeAreaInsets?.left,
      }}
    >
      <div>
        <h3>株式会社アボカド大好き</h3>
        <div style={{ display: "flex", gap: "8px" }}>
          <button type="button" onClick={handleCompanyNews}>
            最新ニュース取得依頼をする
          </button>
          <button type="button" onClick={handleCompanyHP}>
            HPを確認
          </button>
        </div>
      </div>

      {companies.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "16px" }}>
            {METRICS.map((metric) => (
              <button
                key={metric.key}
                type="button"
                onClick={() => setSelectedMetric(metric.key)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: selectedMetric === metric.key ? "#4CAF50" : "#e0e0e0",
                  color: selectedMetric === metric.key ? "white" : "black",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {metric.label}
              </button>
            ))}
            {!similarLoaded && (
              <button
                type="button"
                onClick={handleGetSimilarCompanies}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#2196F3",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginLeft: "auto",
                }}
              >
                類似企業と比較
              </button>
            )}
          </div>
          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "16px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <h4 style={{ margin: "0 0 16px 0" }}>
              {METRICS.find((m) => m.key === selectedMetric)?.label}（
              {METRICS.find((m) => m.key === selectedMetric)?.unit}）
            </h4>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <LineChart
                  data={companies[0]?.data.map((_, yearIndex) => {
                    const yearData: Record<string, number> = {
                      year: companies[0].data[yearIndex].year,
                    };
                    for (const company of companies) {
                      yearData[company.name] = company.data[yearIndex][selectedMetric];
                    }
                    return yearData;
                  })}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatNumber(Number(value))} />
                  <Legend />
                  {companies.map((company, index) => (
                    <Line
                      key={company.name}
                      type="monotone"
                      dataKey={company.name}
                      stroke={COMPANY_COLORS[index % COMPANY_COLORS.length]}
                      strokeWidth={2}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
