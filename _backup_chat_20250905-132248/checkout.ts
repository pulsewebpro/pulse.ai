import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { plan_id, currency, accept_legal } = req.body as { plan_id: number; currency?: string; accept_legal?: boolean };
  if (!accept_legal) return res.status(400).json({ error: "Debe aceptar Términos y Privacidad." });

  // Simulación de checkout: devolvemos una URL local de 'gracias'
  const url = `/thank-you?plan=${encodeURIComponent(String(plan_id))}&cur=${encodeURIComponent(currency || "EUR")}`;
  return res.status(200).json({ ok: true, checkout_url: url });
}
