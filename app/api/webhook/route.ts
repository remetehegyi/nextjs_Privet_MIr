const WEBHOOK_URL = "https://n8n.tatyana-sarasa.com/webhook/testdata1";

export async function POST() {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "next.js" }),
      cache: "no-store",
    });

    const text = await response.text();
    let data: unknown = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      return Response.json(
        {
          error: `Webhook antwortete mit Status ${response.status}`,
          data,
        },
        { status: response.status },
      );
    }

    return Response.json(data ?? { ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unbekannter Fehler";
    return Response.json({ error: message }, { status: 500 });
  }
}
