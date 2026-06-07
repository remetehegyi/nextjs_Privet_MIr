"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint } from "@/lib/parse-webhook-chart";

type ChartType = "bar" | "line" | "pie";

type RevenueChartProps = {
  data: ChartPoint[];
  chartType?: ChartType;
  yAxisLabel?: string;
};

const SHADE: Record<string, { top: string; side: string }> = {
  "#3b82f6": { top: "#bfdbfe", side: "#1d4ed8" },
  "#ef4444": { top: "#fecaca", side: "#b91c1c" },
};

function Bar3DShape(props: {
  x?: number; y?: number; width?: number; height?: number; fill?: string;
}) {
  const { x = 0, y = 0, width = 0, height = 0, fill = "#3b82f6" } = props;
  if (width <= 0 || height <= 0) return null;
  const d = Math.min(width * 0.45, 14);
  const { top: topColor, side: sideColor } = SHADE[fill] ?? { top: "#ccc", side: "#555" };
  return (
    <g>
      <path
        d={`M${x + width},${y} L${x + width + d},${y - d} L${x + width + d},${y + height - d} L${x + width},${y + height} Z`}
        fill={sideColor}
      />
      <path
        d={`M${x},${y} L${x + width},${y} L${x + width},${y + height} L${x},${y + height} Z`}
        fill={fill}
      />
      <path
        d={`M${x},${y} L${x + width},${y} L${x + width + d},${y - d} L${x + d},${y - d} Z`}
        fill={topColor}
      />
    </g>
  );
}

const numFmt = (n: number) =>
  n.toLocaleString("de-DE", { maximumFractionDigits: 1 });

const euroFmt = (n: number) =>
  n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

function niceStep(range: number, targetTicks = 6): number {
  const rough = range / targetTicks;
  const mag = Math.pow(10, Math.floor(Math.log10(rough || 1)));
  const norm = rough / mag;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return nice * mag;
}

const legendLabel = (value: string) =>
  value === "value" ? "Einkommen" : "Ausgaben";

const axisProps = {
  tick: { fill: "#374151", fontSize: 12 },
  axisLine: { stroke: "#d1d5db" },
  tickLine: false as const,
};

export function RevenueChart({
  data,
  chartType = "bar",
  yAxisLabel = "Einkommen in Euro",
}: RevenueChartProps) {
  const maxValue = Math.max(
    ...data.map((d) => d.value),
    ...data.map((d) => d.ausgaben ?? 0),
    0,
  );
  const step = niceStep(maxValue * 1.15) || 1;
  const yMax = Math.ceil((maxValue * 1.15) / step) * step || 10;
  const ticks = Array.from({ length: Math.round(yMax / step) + 1 }, (_, i) => i * step);

  const totalEinkommen = data.reduce((s, d) => s + d.value, 0);
  const avgEinkommen = data.length ? totalEinkommen / data.length : 0;
  const ausgabenPoints = data.filter((d) => d.ausgaben != null);
  const totalAusgaben = ausgabenPoints.reduce((s, d) => s + (d.ausgaben ?? 0), 0);
  const avgAusgaben = ausgabenPoints.length ? totalAusgaben / ausgabenPoints.length : 0;
  const differenz = totalEinkommen - totalAusgaben;

  return (
    <div className="w-full rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-2 text-center text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {yAxisLabel}
      </div>

      <ResponsiveContainer width="100%" height={420}>
        {chartType === "bar" ? (
          <BarChart data={data} margin={{ top: 28, right: 12, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="0" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis domain={[0, yMax]} ticks={ticks} width={48} {...axisProps} />
            <Tooltip formatter={(v) => typeof v === "number" ? euroFmt(v) : ""} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="rect"
              wrapperStyle={{ paddingBottom: 8 }}
              formatter={legendLabel}
            />
            <Bar dataKey="value" name="value" fill="#3b82f6" radius={[2, 2, 0, 0]} maxBarSize={48}>
              <LabelList
                dataKey="value"
                position="top"
                offset={8}
                className="fill-zinc-800 text-xs font-medium dark:fill-zinc-200"
                formatter={(v: unknown) => typeof v === "number" ? numFmt(v) : String(v ?? "")}
              />
            </Bar>
            <Bar dataKey="ausgaben" name="ausgaben" fill="#ef4444" radius={[2, 2, 0, 0]} maxBarSize={48}>
              <LabelList
                dataKey="ausgaben"
                position="top"
                offset={8}
                className="fill-zinc-800 text-xs font-medium dark:fill-zinc-200"
                formatter={(v: unknown) => typeof v === "number" ? numFmt(v) : String(v ?? "")}
              />
            </Bar>
          </BarChart>
        ) : chartType === "line" ? (
          <LineChart data={data} margin={{ top: 28, right: 12, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis domain={[0, yMax]} ticks={ticks} width={48} {...axisProps} />
            <Tooltip formatter={(v) => typeof v === "number" ? euroFmt(v) : ""} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="rect"
              wrapperStyle={{ paddingBottom: 8 }}
              formatter={legendLabel}
            />
            <Line
              type="monotone"
              dataKey="value"
              name="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4, fill: "#3b82f6" }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="ausgaben"
              name="ausgaben"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 4, fill: "#ef4444" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        ) : (
          <BarChart data={data} margin={{ top: 28, right: 32, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="0" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis domain={[0, yMax]} ticks={ticks} width={48} {...axisProps} />
            <Tooltip formatter={(v) => typeof v === "number" ? euroFmt(v) : ""} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="rect"
              wrapperStyle={{ paddingBottom: 8 }}
              formatter={legendLabel}
            />
            <Bar
              dataKey="value"
              name="value"
              fill="#3b82f6"
              maxBarSize={48}
              shape={(props: object) => <Bar3DShape {...(props as Parameters<typeof Bar3DShape>[0])} fill="#3b82f6" />}
            />
            <Bar
              dataKey="ausgaben"
              name="ausgaben"
              fill="#ef4444"
              maxBarSize={48}
              shape={(props: object) => <Bar3DShape {...(props as Parameters<typeof Bar3DShape>[0])} fill="#ef4444" />}
            />
          </BarChart>
        )}
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
            Ø Monatliches Einkommen
          </p>
          <p className="mt-1 text-2xl font-semibold text-blue-700 dark:text-blue-300">
            {euroFmt(avgEinkommen)}
          </p>
        </div>

        <div className="rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
          <p className="text-xs font-medium text-red-600 dark:text-red-400">
            Ø Monatliche Ausgaben
          </p>
          <p className="mt-1 text-2xl font-semibold text-red-700 dark:text-red-300">
            {euroFmt(avgAusgaben)}
          </p>
        </div>

        <div
          className={`rounded-lg border p-4 ${
            differenz >= 0
              ? "border-green-100 bg-green-50 dark:border-green-900 dark:bg-green-950/40"
              : "border-red-100 bg-red-50 dark:border-red-900 dark:bg-red-950/40"
          }`}
        >
          <p
            className={`text-xs font-medium ${
              differenz >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            Jahresbilanz (Einnahmen − Ausgaben)
          </p>
          <p
            className={`mt-1 text-2xl font-semibold ${
              differenz >= 0
                ? "text-green-700 dark:text-green-300"
                : "text-red-700 dark:text-red-300"
            }`}
          >
            {differenz >= 0 ? "+" : ""}
            {euroFmt(differenz)}
          </p>
        </div>
      </div>
    </div>
  );
}
