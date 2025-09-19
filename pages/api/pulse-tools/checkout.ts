import type { NextApiRequest, NextApiResponse } from "next";
export default async function handler(req:NextApiRequest,res:NextApiResponse){
  if (req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
  const { plan_id, accept_legal } = (req.body||{});
  if (!accept_legal) return res.status(200).json({ error:"LEGAL_REQUIRED" });
  // Simula URL externa de pago:
  return res.status(200).json({ checkout_url: "https://example.com/checkout?plan="+plan_id });
}
