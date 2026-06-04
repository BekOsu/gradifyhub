type CheckStatus = "ok" | "http" | "error" | "missing";

type ProviderResult = {
  name: string;
  status: CheckStatus;
  detail: string;
};

async function checkEndpoint(name: string, url: string, headers: Record<string, string>): Promise<ProviderResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(url, {
      method: "GET",
      headers,
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);

    if (res.ok) {
      return { name, status: "ok", detail: `HTTP ${res.status}` };
    }

    return { name, status: "http", detail: `HTTP ${res.status}` };
  } catch (err) {
    if (err instanceof Error) {
      return { name, status: "error", detail: err.name };
    }
    return { name, status: "error", detail: "Unknown error" };
  }
}

export default async function AdminAiHealthPage() {
  const checks: Promise<ProviderResult>[] = [];

  const anthropicKey = process.env.AGENT_ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_API_KEY;
  checks.push(
    anthropicKey
      ? checkEndpoint("Anthropic", "https://api.anthropic.com/v1/models", {
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        })
      : Promise.resolve({ name: "Anthropic", status: "missing" as const, detail: "Missing API key" }),
  );

  const openAiKey = process.env.AGENT_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY;
  checks.push(
    openAiKey
      ? checkEndpoint("OpenAI", "https://api.openai.com/v1/models", {
          Authorization: `Bearer ${openAiKey}`,
        })
      : Promise.resolve({ name: "OpenAI", status: "missing" as const, detail: "Missing API key" }),
  );

  checks.push(
    process.env.GROQ_API_KEY
      ? checkEndpoint("Groq", "https://api.groq.com/openai/v1/models", {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        })
      : Promise.resolve({ name: "Groq", status: "missing" as const, detail: "Missing API key" }),
  );

  checks.push(
    process.env.DEEPSEEK_API_KEY
      ? checkEndpoint("DeepSeek", `${(process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com").replace(/\/+$/, "")}/models`, {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        })
      : Promise.resolve({ name: "DeepSeek", status: "missing" as const, detail: "Missing API key" }),
  );

  checks.push(
    process.env.TOGETHER_API_KEY
      ? checkEndpoint("Together", `${(process.env.TOGETHER_BASE_URL ?? "https://api.together.xyz/v1").replace(/\/+$/, "")}/models`, {
          Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
        })
      : Promise.resolve({ name: "Together", status: "missing" as const, detail: "Missing API key" }),
  );

  checks.push(
    process.env.FIREWORKS_API_KEY
      ? checkEndpoint("Fireworks", `${(process.env.FIREWORKS_BASE_URL ?? "https://api.fireworks.ai/inference/v1").replace(/\/+$/, "")}/models`, {
          Authorization: `Bearer ${process.env.FIREWORKS_API_KEY}`,
        })
      : Promise.resolve({ name: "Fireworks", status: "missing" as const, detail: "Missing API key" }),
  );

  checks.push(
    process.env.HUGGINGFACE_API_KEY
      ? checkEndpoint("HuggingFace", "https://api-inference.huggingface.co/models", {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        })
      : Promise.resolve({ name: "HuggingFace", status: "missing" as const, detail: "Missing API key" }),
  );

  checks.push(
    process.env.COHERE_API_KEY
      ? checkEndpoint("Cohere", "https://api.cohere.com/v1/models", {
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
        })
      : Promise.resolve({ name: "Cohere", status: "missing" as const, detail: "Missing API key" }),
  );

  checks.push(
    process.env.GOOGLE_API_KEY
      ? checkEndpoint("Gemini", `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`, {})
      : Promise.resolve({ name: "Gemini", status: "missing" as const, detail: "Missing API key" }),
  );

  const results = await Promise.all(checks);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI health</h1>
        <p className="text-sm text-muted-foreground">
          Provider key checks from server-side environment. No secrets are displayed.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Provider</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Detail</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.name} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      r.status === "ok"
                        ? "bg-green-500/10 text-green-700"
                        : r.status === "missing"
                          ? "bg-muted text-muted-foreground"
                          : "bg-amber-500/10 text-amber-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{r.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

