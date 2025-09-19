import type { NextApiRequest, NextApiResponse } from "next";

const rmAcc = (s:string)=> s.normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const H = (s:string)=> rmAcc(String(s||"").toLowerCase());

const WORDS = {
  streaming: ["spotify","musica","música","audio","playlist","playlists","podcast","podcasts","player","artista","album","álbum","streaming","radio","suscripcion","suscripción","premium","escuchar","como spotify","tipo spotify"],
  ecommerce: ["vender","venta","carrito","pago","stripe","shop","tienda","producto","productos","comprar"],
  reservas: ["reservar","reserva","cita","turno","mesa","agenda","booking"],
  leads: ["presupuesto","cotizacion","cotización","contacto","whatsapp","lead","consulta","formulario"],
  portfolio: ["portfolio","trabajos","galeria","galería","fotografo","fotógrafo","diseñador","ilustrador","arquitecto","artista"],
  restaurante: ["restaurante","restaurant","bar","menu","carta","delivery"],
  cafeteria: ["cafeteria","café","cafe"],
  abogado: ["abogado","abogada","legal","bufete","despacho"],
  educacion: ["curso","cursos","academy","academia","formacion","formación","clases","escuela"],
  saas: ["saas","app","aplicacion","aplicación","dashboard","multiusuario","multi-usuario"],
  inmobiliaria: ["inmobiliaria","alquiler","venta de pisos","pisos","viviendas","propiedades"]
};

type Intent = {
  sector: string; objetivo: string; estilo: string; idioma:"es"|"en"|"fr";
  h1: string; subtitle: string; sections: string[]; nombre?:string; producto?:string;
}

function detect(rawIn:string){
  const raw = String(rawIn||""); const low = H(raw);

  // idioma
  const idioma: "es"|"en"|"fr" = / the | and | buy | with | like /i.test(raw) ? "en" : (/ le | et | avec | comme /i.test(raw) ? "fr" : "es");

  // nombre
  let nombre = "";
  const m1 = raw.match(/me llamo\s+([A-Za-zÁÉÍÓÚÑáéíóúñ]+)/i);
  const m2 = raw.match(/\bsoy\s+([A-Za-zÁÉÍÓÚÑáéíóúñ]+)/i);
  if (m1) nombre = m1[1]; else if (m2) nombre = m2[1];

  // humor
  const humor = /(jaj+a|jeje|😂|😅|😆|😜|😎|🤣|chiste|broma)/i.test(raw);

  // objetivo/señales
  let sector = "";
  let objetivo = "";

  const has = (arr:string[]) => arr.some(w=> low.includes(H(w)));

  if (has(WORDS.streaming)) { sector = "Streaming/Media"; objetivo = "Suscripción"; }
  if (!sector && has(WORDS.ecommerce)) { sector = "E-commerce"; objetivo = "Vender"; }
  if (!sector && has(WORDS.reservas)) { sector = "Servicios"; objetivo = "Reservas"; }
  if (!sector && has(WORDS.leads)) { sector = "Servicios"; objetivo = "Leads"; }
  if (!sector && has(WORDS.portfolio)) { sector = "Portfolio"; objetivo = "Portfolio"; }
  if (!sector && has(WORDS.restaurante)) { sector = "Restaurante"; objetivo = objetivo || "Reservas"; }
  if (!sector && has(WORDS.cafeteria)) { sector = "Cafetería"; objetivo = objetivo || "Reservas"; }
  if (!sector && has(WORDS.abogado)) { sector = "Abogado"; objetivo = objetivo || "Leads"; }
  if (!sector && has(WORDS.educacion)) { sector = "Educación"; objetivo = objetivo || "Vender"; }
  if (!sector && has(WORDS.saas)) { sector = "SaaS"; objetivo = objetivo || "Leads"; }
  if (!sector && has(WORDS.inmobiliaria)) { sector = "Inmobiliaria"; objetivo = objetivo || "Leads"; }

  // producto/tema
  let producto = "";
  const pv = low.match(/(?:mis|unos|unas|un|una)?\s*(calcetines|cartas|cromos|velas|joyas|camisetas|cafe|café|galletas|musica|música|podcasts|cursos|ebooks|flores|cosmetica|cosmética|zapatos|cuadros|accesorios)/i);
  if (pv) producto = (pv[1]||"").trim();

  // estilo por defecto
  const estilo = "Premium cálido";

  // H1 + subtítulo + secciones por vertical/objetivo
  const compose = (h1:string, subtitle:string, sections:string[]):Intent => ({
    sector: sector||"Genérico", objetivo: objetivo||"Leads", estilo, idioma, h1, subtitle, sections, nombre, producto
  });

  let out:Intent;
  if (sector==="Streaming/Media"){
    out = compose(
      "Tu plataforma de música con playlists y suscripción",
      "Player rápido, catálogo por artista y cobro mensual.",
      ["Hero con claim","Player","Catálogo","Suscripción","Legal/DMCA"]
    );
  } else if (sector==="E-commerce" || objetivo==="Vender"){
    const subj = producto || "e-commerce";
    out = compose(
      `Tu ${subj} online listo para vender hoy`,
      "Checkout rápido, confianza y repetición de compra.",
      ["Hero con oferta","Catálogo","Opiniones","FAQ","CTA Comprar"]
    );
  } else if (objetivo==="Reservas"){
    out = compose(
      `Reservas fáciles para tu ${sector.toLowerCase()||"negocio"}`,
      "Calendario claro, recordatorios y WhatsApp integrado.",
      ["Hero + CTA Reservar","Agenda","Servicios","Opiniones","CTA Reservar"]
    );
  } else if (objetivo==="Portfolio"){
    out = compose(
      "Portfolio que enamora y vende tu talento",
      "Tu mejor trabajo en primer plano, claro y memorable.",
      ["Hero con claim","Trabajos destacados","Servicios","Sobre mí","CTA Contacto"]
    );
  } else { // Leads por defecto
    out = compose(
      "Convierte visitas en clientes",
      "Beneficios claros, prueba social y contacto sin fricción.",
      ["Hero dolor/solución","Beneficios","Casos/Opiniones","FAQ","CTA Contacto"]
    );
  }

  // scoring
  let score = 0;
  if (sector && sector!=="Genérico") score += 2;
  if (objetivo) score += 1;
  if (producto) score += 1;
  if (idioma) score += 1;

  return { intent: out, confidence: score, humor };
}

export default function handler(req:NextApiRequest,res:NextApiResponse){
  try{
    if (req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
    const { text } = (req.body||{});
    return res.status(200).json(detect(String(text||"")));
  }catch{
    return res.status(200).json(detect(""));
  }
}
