import type { NextApiRequest, NextApiResponse } from "next";
import { respondLocal, sectorize } from "../../lib/pulseBrain";
import { isOffTopic, offtopicReply } from "../../lib/pulsePolicy";
import { craftHumanReply } from "../../lib/humanizer";
import { FEW_SHOTS } from "../../lib/pulseExamples";

type ApiOut = {
  mode: "live" | "local" | "local_error" | "local_catch" | "offtopic";
  state: "feedback" | "cierre" | "error";
  text: string;
  mood: "neutral" | "celebrate" | "oops";
  meta?: any;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiOut>) {
  try {
    const { message } = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const userMsg = String(message || "").trim();
    const apiKey = process.env.OPENAI_API_KEY || process.env.PULSE_OPENAI_KEY;
    const model = process.env.PULSE_OPENAI_MODEL || "gpt-4o-mini";

    // 0) Capado con variedad (evita bucles)
    if (!userMsg || isOffTopic(userMsg)) {
      return res.status(200).json({ mode: "offtopic", state: "feedback", text: offtopicReply(), mood: "neutral" });
    }

    // 1) Con clave → LIVE human-like; sin clave → HUMANIZER local (más humano que el fallback simple)
    const sectorGuess = sectorize(userMsg) || undefined;

    if (!apiKey) {
      const human = craftHumanReply(userMsg, sectorGuess);
      return res.status(200).json({ mode: "local", state: "cierre", text: human, mood: "celebrate" });
    }

    // 2) LIVE: JSON-mode + tono humano (empatía + plan + micro-pregunta)
    const system = [
      "Eres Pulse, socio creativo cercano. SOLO tratas webs/negocios.",
      "Tono: cálido, premium, guiños de café; 1–2 frases con una micro-pregunta al final.",
      "Prohibido: temas fuera de ámbito, consejos médicos/financieros/legales, contenido sensible.",
      "Devuelve SIEMPRE JSON: {\"reply\":string,\"sector\":string,\"next_step\":string}. SIN texto fuera del JSON."
    ].join(" ");

    const fewShotMsgs = (FEW_SHOTS || []).flatMap(ex => ([
      { role: "user" as const, content: ex.user },
      { role: "assistant" as const, content: ex.assistantJson }
    ]));

    const user = userMsg;

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        temperature: 0.85,
        max_tokens: 220,
        messages: [
          { role: "system", content: system },
          ...fewShotMsgs,
          { role: "user", content: user }
        ]
      })
    });

    if (!r.ok) {
      const human = craftHumanReply(userMsg, sectorGuess);
      return res.status(200).json({ mode: "local_error", state: "cierre", text: human, mood: "celebrate" });
    }

    const data = await r.json();
    const raw = data?.choices?.[0]?.message?.content || "{}";
    let parsed: { reply?: string; sector?: string; next_step?: string } = {};
    try { parsed = JSON.parse(raw); } catch { /* noop */ }

    // Si por lo que sea viene vacío, humanizamos localmente
    const text = parsed.reply?.trim() || craftHumanReply(userMsg, sectorGuess);

    return res.status(200).json({
      mode: "live",
      state: "cierre",
      text,
      mood: "celebrate",
      meta: { sector: parsed.sector || sectorGuess || null, next_step: parsed.next_step || null }
    });
  } catch {
    const out = respondLocal("");
    return res.status(200).json({ mode: "local_catch", ...out });
  }
}
