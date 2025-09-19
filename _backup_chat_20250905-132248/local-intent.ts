import type { NextApiRequest, NextApiResponse } from "next";

function deaccent(s:string){ return s.normalize("NFD").replace(/[\u0300-\u036f]/g,""); }
const H = (s:string) => deaccent(s.toLowerCase());

const PRODUCT_HINTS = ["calcetines","ropa","camisetas","zapatos","joyas","cromos","cartas","café","galletas","cursos","ebooks","juguetes","velas","cosmetica","flores","accesorios"];
const SECTOR_WORDS: Record<string,string[]> = {
  "Cafetería": ["cafeteria","cafe"],
  "Restaurante": ["restaurante","restaurant","bar"],
  "Abogado": ["abogado","abogada","legal"],
  "Portfolio": ["portfolio","fotografo","fotógrafo","diseñador","ilustrador","artista","arquitecto"],
  "Evento": ["evento","concierto","festival","feria","congreso"],
  "E-commerce": ["tienda","shop","ecommerce","e-commerce","venta","vender", ...PRODUCT_HINTS],
};
const OBJ_WORDS: Record<string,string[]> = {
  "Vender": ["vender","comprar","carrito","pago","stripe","shop", ...PRODUCT_HINTS],
  "Reservas": ["reservar","reserva","cita","turno","mesa","agenda","booking"],
  "Leads": ["contacto","presupuesto","cotizacion","cotización","whatsapp","consulta","formulario","lead"],
  "Portfolio": ["portfolio","trabajos","galeria","galería","muestrario"],
};

function detect(rawIn:string){
  const raw = String(rawIn||"");
  const low = H(raw);

  // Nombre
  let nombre = "";
  const m1 = raw.match(/me llamo\s+([A-Za-zÁÉÍÓÚÑáéíóúñ]+)(?:\s|$)/i);
  const m2 = raw.match(/\bsoy\s+([A-Za-zÁÉÍÓÚÑáéíóúñ]+)(?:\s|$)/i);
  if(m1) nombre = m1[1]; else if(m2) nombre = m2[1];

  // Humor simple
  const humor = /jaj(a|aja)|😂|😅|jeje|broma|chiste/i.test(raw);

  // Sector
  let sector = "E-commerce";
  for(const k of Object.keys(SECTOR_WORDS)){
    if (SECTOR_WORDS[k].some(w=>low.includes(H(w)))){ sector = k; break; }
  }

  // Objetivo
  let objetivo = "Vender";
  for(const k of Object.keys(OBJ_WORDS)){
    if (OBJ_WORDS[k].some(w=>low.includes(H(w)))){ objetivo = k; break; }
  }

  // Producto
  let producto = "";
  const pv = low.match(/vender\s+(mis|unas|unos|un|una)?\s*([a-z0-9\- ]{2,40})/i);
  if (pv) producto = pv[2]?.trim() || "";

  // Idioma
  const idioma: "es"|"en"|"fr" = / the | and | buy | with /i.test(raw) ? "en" : (/ le | et | avec /i.test(raw) ? "fr" : "es");

  const estilo = "Premium cálido";

  // Confianza: suma pistas
  let conf = 0;
  if (sector) conf++;
  if (objetivo) conf++;
  if (producto) conf++;

  const subject = (producto && objetivo==="Vender") ? producto : sector.toLowerCase();
  const h1 =
    objetivo==="Vender"   ? `Tu ${subject} online listo para vender hoy`
  : objetivo==="Reservas" ? `Reservas fáciles para tu ${sector.toLowerCase()}`
  : objetivo==="Leads"    ? `Convierte visitas en clientes`
                          : `Portfolio que enamora y vende tu talento`;

  const subtitle =
    objetivo==="Vender"   ? `Checkout rápido, confianza y repetición de compra.`
  : objetivo==="Reservas" ? `Calendario claro, recordatorios y WhatsApp integrado.`
  : objetivo==="Leads"    ? `Formulario persuasivo, WhatsApp y prueba social.`
                          : `Muestra lo mejor de ti con un diseño limpio y potente.`;

  const sections =
    objetivo==="Vender"   ? ["Hero con oferta","Catálogo","Opiniones","FAQ","CTA Comprar"]
  : objetivo==="Reservas" ? ["Hero con CTA Reservar","Agenda","Servicios","Opiniones","CTA Reservar"]
  : objetivo==="Leads"    ? ["Hero con dolor/solución","Beneficios","Prueba social","FAQ","CTA Contactar"]
                          : ["Hero con claim","Trabajos destacados","Servicios","Sobre mí","CTA Contacto"];

  return {
    intent: { sector, objetivo, estilo, idioma, h1, subtitle, sections, nombre, producto },
    confidence: conf,
    humor
  };
}

export default function handler(req:NextApiRequest,res:NextApiResponse){
  try{
    if (req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
    const { text } = (req.body||{});
    return res.status(200).json(detect(String(text||"")));
  }catch(_e){
    return res.status(200).json(detect(""));
  }
}
