import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { PULSE_SYSTEM_PROMPT } from "@/lib/pulse-persona";
import { trimHistory, sanitizeMessageContent } from "@/lib/chat-helpers";
import { getPhaseInstruction } from "@/lib/pulse-conductor";

type Msg = { role: "system"|"user"|"assistant"; content: string };
const MAX_LINES = Number(process.env.PULSE_MAX_LINES || 6);

export const config = { api: { bodyParser: { sizeLimit: "1mb" } } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  // Cabeceras para streaming (chunked)
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("Cache-Control", "no-cache");

  try {
    const body = req.body ?? {};
    let messages: Msg[] = Array.isArray(body.messages) ? body.messages : [];
    messages = messages
      .filter((m)=>m && (m.role==="user"||m.role==="assistant"||m.role==="system"))
      .map((m)=>({ role:m.role, content: sanitizeMessageContent(String(m.content||"")) }))
      .slice(-40);

    const context = trimHistory(messages, 2200);
    const systemMsg: Msg = { role: "system", content: PULSE_SYSTEM_PROMPT };
    const phaseMsg: Msg = { role: "system", content: getPhaseInstruction(context, MAX_LINES) };

    const model = process.env.PULSE_OPENAI_MODEL || "gpt-4o-mini";
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const stream = await client.chat.completions.create({
      model,
      temperature: 0.7,
      max_tokens: 520,
      messages: [systemMsg, phaseMsg, ...context],
      stream: true,
    });

    // Guarda de líneas en tiempo real: corta el stream si se excede
    let buffer = "";
    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content || "";
      if (!delta) continue;
      buffer += delta;

      const lines = buffer.split(/\r?\n/);
      if (lines.length > MAX_LINES) {
        // Enviamos hasta el límite y cortamos con " …"
        res.write(lines.slice(0, MAX_LINES).join("\n") + " …");
        break;
      }
      res.write(delta);
    }
    res.end();
  } catch (e:any) {
    console.error("pulse-stream error:", e?.message||e);
    try { res.end(); } catch { /* noop */ }
  }
}
