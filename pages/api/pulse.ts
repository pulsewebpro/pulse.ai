import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { PULSE_SYSTEM_PROMPT } from "@/lib/pulse-persona";
import { trimHistory, sanitizeMessageContent, guardMaxLines } from "@/lib/chat-helpers";
import { getPhaseInstruction } from "@/lib/pulse-conductor";

type Msg = { role: "system" | "user" | "assistant"; content: string };

const banned = [
  "depresión","diagnóstico","medicina","política","religión","guerra","suicidio",
  "trading","cripto","hacking","piratería","armas","drogas","apuestas","tarea escolar"
];

const MAX_LINES = Number(process.env.PULSE_MAX_LINES || 6);

function outsideScope(txt: string) {
  const t = (txt || "").toLowerCase();
  return banned.some(b => t.includes(b));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = req.body ?? {};
    let messages: Msg[] = Array.isArray(body.messages) ? body.messages : [];
    messages = messages
      .filter((m) => m && (m.role === "user" || m.role === "assistant" || m.role === "system"))
      .map((m) => ({ role: m.role, content: sanitizeMessageContent(String(m.content ?? "")) }))
      .slice(-40);

    const context = trimHistory(messages, 2200);
    const lastUser = [...context].reverse().find((m) => m.role === "user");
    const redirection =
      lastUser?.content && outsideScope(lastUser.content)
        ? [{
            role: "assistant" as const,
            content:
              "Puedo ayudarte si lo orientamos a tu **web o negocio**. ¿Te parece si lo aplicamos a tu proyecto online? ☕",
          }]
        : [];

    // Inyección de sistema + conductor de fase (micro-entregas guiadas y 3–6 líneas)
    const systemMsg = { role: "system" as const, content: PULSE_SYSTEM_PROMPT };
    const phaseMsg = { role: "system" as const, content: getPhaseInstruction(context, MAX_LINES) };

    const model = process.env.PULSE_OPENAI_MODEL || "gpt-4o-mini";
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model,
      temperature: 0.7,
      max_tokens: 520,
      messages: [systemMsg, phaseMsg, ...redirection, ...context],
    });

    const raw = completion.choices?.[0]?.message?.content ?? "…";
    const clipped = guardMaxLines(raw, MAX_LINES);

    res.status(200).json({ ok: true, content: clipped });
  } catch (err: any) {
    console.error("Pulse API error:", err?.message || err);
    res.status(500).json({
      ok: false,
      error: "Oops, casi derramo el café. Fallo temporal; probemos de nuevo. ☕",
    });
  }
}
