"use client";

import { useMemo, useState } from "react";
import { GeistButton } from "@/components/geist-button";
import { RevenueChart } from "@/components/revenue-chart";
import {
  parseWebhookChartData,
  type ChartPoint,
} from "@/lib/parse-webhook-chart";

type ChartType = "bar" | "line" | "pie";

const CHART_BUTTONS: { type: ChartType; label: string }[] = [
  { type: "bar", label: "Balkendiagramm" },
  { type: "line", label: "Liniendiagramm" },
  { type: "pie", label: "3D-Balkendiagramm" },
];

export function WebhookLoader() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<ChartType>("bar");

  const chartData = useMemo<ChartPoint[]>(
    () => (data !== null ? parseWebhookChartData(data) : []),
    [data],
  );

  async function loadData() {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch("/api/webhook", { method: "POST" });
      const payload: unknown = await response.json();

      if (!response.ok) {
        const err =
          typeof payload === "object" &&
          payload !== null &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : `Fehler ${response.status}`;
        throw new Error(err);
      }

      const points = parseWebhookChartData(payload);
      if (points.length === 0) {
        throw new Error("Keine Diagrammdaten in der Webhook-Antwort gefunden");
      }

      setData(payload);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Daten konnten nicht geladen werden",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full max-w-5xl flex-col items-center gap-6 px-4">
      <GeistButton type="error" loading={loading} onClick={loadData}>
        Datei hochladen
      </GeistButton>

      {error && (
        <p className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </p>
      )}

      {chartData.length > 0 && (
        <div className="flex gap-2">
          {CHART_BUTTONS.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                chartType === type
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-black"
                  : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {chartData.length > 0 && <RevenueChart data={chartData} chartType={chartType} />}
    </div>
  );
}
