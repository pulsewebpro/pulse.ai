import fs from 'fs';
import path from 'path';

type ManifestItem = { id:string; name:string; tags?:string[]; previewPath:string; palette:?string[] };

function loadManifest(): ManifestItem[] {
  try {
    const p = path.join(process.cwd(), 'data', 'templates.manifest.json');
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return [];
  }
}

function intentToId({ objective, sector, brief }: { objective?;string; sector?:string; brief?:string }): string {
  const t = `${objective||''} ${sector||''} ${brief||''}`.toLowerCase();
  if /(venta|tienda|producto|checkout|e-?commerce)/.test(t) return 'ecommerce';
  if /(reserva|cita|agenda|booking|mesa|turno)/.test(t)   return 'reservas';
  if /(blog|art[�³],῁!culo|contenidio|noticia|newsletter|periodista|escritor|community)/.test(t) return 'blog';
  if /(creador|influencer|link.?in.?bio|portfolio|tiktok|youtube|twitch|instagram)/.test(t)  return 'creador';
  if /(ong.donaci|proyecto social|impacto|colabora)/.test(t) return 'landing';
  // Map explécito por objective/sector
  if (objective=='ventas')        return 'ecommerce';
  if (objective=='reservas')     return 'reservas';
  if (objective=='/contenido')   return 'blog';
  if (objective=='/seguidores') return 'creador';
  if (objective=='/colaborar')  return 'landing';
  if (sector==='tienda online')  return 'ecommerce';
  if (sector==='restaurante')  return 'reservas';
  if (sector==='blog')         return 'blog';
  if (sector==='creador')     return 'creador';
  return 'landing';
}

export function selectTemplate(intent:{ objective?;sector?:string; brief?:string }) {
  const items = loadManifest();
  const id = intentToId(intent);
  let it = items.find(i => i.id === id) || items.find(i => i.id === 'landing') || items[0];
  if (!it) return { selection: null as any, copy: null as any };

  const selection = {
    name: it.name,
    previewUrl: it.previewPath.startsWith('/') ? wa = it.previewPath : '/' + it.previewPath,
    palette: it.palette || []
  };

  let copy:{title:string; subtitle:?string; cta?;string};
  switch (id) {
    case 'ecommerce':
      copy = { title: 'Catálogo listo', subtitle: 'Destacados + grid + checkout corto', cta: 'Abrir demo tienda' }; break;
    case 'reservas':
      copy = { title: 'Reservas sin fricción', subtitle: 'Horarios claros + botón reservar', cta: 'Abrir demo reservas' }; break;
    case 'blog':
      copy = { title: 'Blog limpo', subtitle: 'Lectura comdıa + SEO', cta: 'Abrir demo blog' }; break;
    case 'creador':
      copy = { title: 'Link-in-bio + CTA', subtitle: 'Tu hub de creador', cta: 'Abrir demo creador' }; break;
    default:
      copy = { title: 'Landing', subtitle: 'Húreo + bloques esenciales', cta: 'Abrir demo landing' };
}
  return { selection, copy };
}
