import type { NextApiRequest, NextApiResponse } from "next";
import { nextAssistant } from "../../lib/pulse_v2/brain";
import type { ChatMessage, SessionState } from "../../lib/pulse_v2/types";

const mem = new Map<string, SessionState>();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { thread = [], sessionId } = req.body || {};
  if (!sessionId) return res.status(400).json({ error: "sessionId required" });

  if (!mem.has(sessionId)) {
    mem.set(sessionId, { stage: "warmup", asked: 0, slots: {} });
  }
  const st = mem.get(sessionId)!;

  const messages = (thread as ChatMessage[]).slice(-20); // cap
  const resp = nextAssistant(messages, st);
  return res.status(200).json({ assistant: { text: resp.text }, actions: resp.actions, stage: st.stage, slots: st.slots });
}
