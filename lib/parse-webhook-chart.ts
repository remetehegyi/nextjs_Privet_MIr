export type ChartPoint = {
  label: string;
  value: number;
  ausgaben?: number;
};

function readLabel(record: Record<string, unknown>, index: number): string {
  const raw =
    record.Monat ??
    record.monat ??
    record.Jahr ??
    record.jahr ??
    record.year ??
    record.label ??
    record.name;

  return raw != null ? String(raw) : `Punkt ${index + 1}`;
}

function readValue(record: Record<string, unknown>): number | null {
  const raw =
    record.Einkommen ??
    record.einkommen ??
    record.Umsatz ??
    record.umsatz ??
    record.value ??
    record.Value;

  if (raw == null) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function readAusgaben(record: Record<string, unknown>): number | null {
  const raw =
    record.Ausgaben ??
    record.ausgaben ??
    record.Kosten ??
    record.kosten;

  if (raw == null) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function parseWebhookChartData(data: unknown): ChartPoint[] {
  let items: unknown[] = [];

  if (Array.isArray(data)) {
    items = data;
  } else if (typeof data === "object" && data !== null) {
    const record = data as Record<string, unknown>;
    const nested = record.data ?? record.items ?? record.rows;
    if (Array.isArray(nested)) {
      items = nested;
    }
  }

  return items
    .map((item, index) => {
      if (typeof item !== "object" || item === null) return null;
      const record = item as Record<string, unknown>;
      const value = readValue(record);
      if (value === null) return null;
      const ausgaben = readAusgaben(record);
      return {
        label: readLabel(record, index),
        value,
        ...(ausgaben !== null ? { ausgaben } : {}),
      };
    })
    .filter((point): point is ChartPoint => point !== null);
}
