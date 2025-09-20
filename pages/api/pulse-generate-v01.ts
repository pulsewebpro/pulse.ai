import type { NextApiRequest, NextApiResponse } from "next";
import { generateWebZipV01 } from "../../lib/pulse-generator.v01";

export const config = { api: { bodyParser: { sizeLimit: "1mb" } } };

const SKINS = ["crystal-oro","warm-cafe"];
const SECTORS = ["restaurante","portfolio","saas","tienda","consultoria"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { prompt, skin, sector } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "Falta prompt" });
  if (!SKINS.includes(String(skin))) return res.status(400).json({ error: "Skin inválido" });
  if (!SECTORS.includes(String(sector))) return res.status(400).json({ error: "Sector inválido" });

  try {
    const url = await generateWebZipV01({ userPrompt: String(prompt), skin, sector });
    res.status(200).json({ downloadUrl: url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error generando web (v0.1)" });
  }
}
