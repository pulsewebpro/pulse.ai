/**
 * Chips "humanos" que disparan preview y, si existe, envían un mensaje
 * mediante window.PULSE_SEND(msg). A prueba de SSR/Vercel.
 */
export type ChipKind = "ventas" | "reservas" | "blog" | "creador" | "social";

const CHIP_MAP: Record<ChipKind, {sector:string; objective:string; brief:string}> = {
  ventas:   { sector:"tienda online", objective:"ventas",    brief:"Quiero vender mis productos desde la web con pago y envío. Empecemos por una landing clara con catálogo y checkout." },
  reservas: { sector:"restaurante",   objective:"reservas",  brief:"Necesito que reserven sin llamar. Horarios claros y botón reservar grande." },
  blog:     { sector:"blog",          objective:"contenido", brief:"Quiero un blog limpio para artículos y captar suscriptores. Prima lectura y SEO." },
  creador:  { sector:"creador",       objective:"seguidores",brief:"Soy creador y quiero un link-in-bio con mis redes y un CTA para colaborar." },
  social:   { sector:"ONG",           objective:"colaborar", brief:"ONG con donaciones simples, voluntariado y transparencia. Tono cercano." }
};

export function installChipBehavior(){
  if (typeof window === "undefined") return;
  const w = window as any;
  if (w.__PULSE_CHIPS_READY__) return; // no duplicar
  w.__PULSE_CHIPS_READY__ = true;

  async function speak(kind: ChipKind){
    const c = CHIP_MAP[kind]; if (!c) return;
    // mensaje humano (si la app expone PULSE_SEND)
    if (typeof w.PULSE_SEND === "function") {
      try { await w.PULSE_SEND(c.brief); } catch {}
    }
    // mover el panel de preview (acepta {sector, objective, brief})
    if (typeof w.PULSE_DJ_PREVIEW === "function") {
      try { await w.PULSE_DJ_PREVIEW({ sector: c.sector, objective: c.objective, brief: c.brief }); } catch {}
    }
  }

  // API global
  w.PULSE_CHIP = speak;

  // Delegación por texto (no tocamos JSX ahora)
  const handler = (ev: MouseEvent) => {
    const t = ev.target as HTMLElement | null; if (!t) return;
    const txt = (t.textContent || "").toLowerCase();
    if (/\bventas\b/.test(txt))                      speak("ventas");
    else if (/\breservas\b/.test(txt))               speak("reservas");
    else if (/\bblog\b/.test(txt) || /contenido/.test(txt)) speak("blog");
    else if (/influencer|creador/.test(txt))         speak("creador");
    else if (/proyecto social|social/.test(txt))     speak("social");
  };
  document.addEventListener("click", handler, { capture:false });
}
