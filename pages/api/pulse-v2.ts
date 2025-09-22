import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { getSystemPrompt } from "../../lib/pulse_v2/prompt";
import type { ChatMessage } from "../../lib/pulse_v2/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(400).json({ error: "Missing OPENAI_API_KEY" });

  const { messages, locale } = req.body as { messages: ChatMessage[]; locale?: "es"|"en"|"fr" };
  const client = new OpenAI({ apiKey });

  const system = { role: "system", content: getSystemPrompt(locale || "es") } as const;

  try {
    const completion = await client.chat.completions.create({
      model: process.env.PULSE_OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.6,
      max_tokens: 700,
      messages: [system as any, ...(messages as any)],
    });

    const content = completion.choices[0]?.message?.content ?? "Estoy con poco café hoy ☕, ¿puedes repetir?";
    return res.status(200).json({ content });
  } catch (e: any) {
    console.error("Pulse V2 error:", e?.message || e);
    return res.status(500).json({ error: "Pulse V2 falló al generar respuesta." });
  }
}
