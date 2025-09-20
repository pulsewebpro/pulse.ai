import fs from "fs";
import path from "path";

type ManifestItem = {
  id: string;
  name: string;
  category: string;           // "saas" | "restaurant" | "ecommerce" | "portfolio" | "blog" | "social" | "misc"
  tags: string[];
  previewPath: string;        // ruta pública bajo /public (ej: "/templates/reservas.html")
  score?: number;             // 0..1 (calidad base)
  palettes?: string[][];
};

export type Brief = {
  sector?: string;            // preferencia principal
  tags?: string[];            // pistas libres: "minimal", "elegante", etc.
  idioma?: string;            // "es"|"en"|"fr" (por ahora informativo)
  ciudad?: string;
  estilo?: string;            // "minimal","elegante","vintage",...
  paletaPreferida?: string[]; // colores del cliente
};

export type Selection = {
  templateId: string;
  name: string;
  previewUrl: string;
  palette: string[];
  reason: string;
  top3?: Array<{ id: string; score: number }>;
};

const MANIFEST_PATH = path.join(process.cwd(), "data", "templates.manifest.json");

function loadManifest(): ManifestItem[] {
  const raw = fs.readFileSync(MANIFEST_PATH, "utf8");
  const items = JSON.parse(raw) as ManifestItem[];
  return items.filter(it => !!it?.previewPath);
}

function norm(a: string | undefined) { return (a || "").toLowerCase().trim(); }

function jaccard(a: string[], b: string[]): number {
  const A = new Set(a.map(x => norm(x)));
  const B = new Set(b.map(x => norm(x)));
  const inter = [...A].filter(x => B.has(x)).length;
  const uni = new Set([...A, ...B]).size || 1;
  return inter / uni;
}

function scoreItem(it: ManifestItem, brief: Brief): number {
  // pesos ajustables
  const BASE      = (it.score ?? 0.6);  // calidad del template
  const W_CAT     = 0.45;               // sector correcto pesa mucho
  const W_TAGS    = 0.35;               // coincidencia por tags/estilo
  const W_NAME    = 0.05;               // hint por nombre
  const W_MISC    = -0.15;              // penalización si es misc

  const wants = [
    brief.sector,
    brief.estilo,
    ...(brief.tags || [])
  ].filter(Boolean) as string[];

  const catOk = norm(brief.sector) && norm(brief.sector) === norm(it.category);
  const catScore = catOk ? 1 : 0;

  const tagScore = wants.length
    ? jaccard(wants, [it.category, ...it.tags])
    : 0;

  const nameHint = (() => {
    const n = norm(it.name);
    const s = norm(brief.sector);
    return s && n.includes(s) ? 1 : 0;
  })();

  const miscPenalty = it.category === "misc" ? 1 : 0;

  const total =
    BASE +
    W_CAT  * catScore +
    W_TAGS * tagScore +
    W_NAME * nameHint +
    W_MISC * miscPenalty;

  return Number(total.toFixed(4));
}

export function selectTemplate(brief: Brief): Selection {
  const items = loadManifest();
  if (!items.length) throw new Error("manifest vacío");

  // 1) priorizamos por sector; si no hay, usamos todo
  const sector = norm(brief.sector);
  const pool = sector
    ? items.filter(it => norm(it.category) === sector)
    : items.slice();

  const candidates = (pool.length ? pool : items)
    .map(it => ({ it, s: scoreItem(it, brief) }))
    .sort((a, b) => b.s - a.s);

  const chosen = candidates[0]?.it ?? items[0];

  const palette =
    (brief.paletaPreferida && brief.paletaPreferida.length >= 2)
      ? brief.paletaPreferida
      : (chosen.palettes?.[0] ?? ["#0ea5e9","#111827","#f5f7ff"]);

  const top3 = candidates.slice(0, 3).map(c => ({ id: c.it.id, score: c.s }));

  return {
    templateId: chosen.id,
    name: chosen.name,
    previewUrl: chosen.previewPath,
    palette,
    reason: `sector=${brief.sector ?? "n/a"} · top=${top3.map(t=>`${t.id}:${t.score.toFixed(2)}`).join(", ")}`,
    top3
  };
}
