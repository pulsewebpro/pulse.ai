import type { NextApiRequest, NextApiResponse } from "next";

function stripAccents(s:string){ return s.normalize("NFD").replace(/[\u0300-\u036f]/g,""); }
function pick<T>(arr:T[], txt:string){ return arr.find(w => txt.includes(stripAccents(w.toLowerCase()))); }

const PRODUCT_HINTS = ["calcetines","ropa","camisetas","sudaderas","zapatos","bolsos","joyas","cromos","cartas","pokémon","comics","café","te","galletas","pasteles","cursos","ebooks","juguetes","velas","cosmetica","perfume","flores","accesorios"];
const SECTOR_WORDS: Record<string,string[]> = {
  "Cafetería": ["cafeteria","cafe","coffee"],
  "Restaurante": ["restaurante","restaurant","bar","bistro"],
  "Abogado": ["abogado","abogada","lawyer","legal"],
  "Portfolio": ["portfolio","fotografo","fotógrafo","diseñador","ilustrador","artista","arquitecto"],
  "Evento": ["evento","concierto","festival","feria","congreso"],
  "E-commerce": ["tienda","shop","ecommerce","e-commerce","venta","vender", ...PRODUCT_HINTS],
};
const OBJ_WORDS: Record<string,string[]> = {
  "Vender": ["vender","comprar","tienda","carrito","pago","stripe","shop", ...PRODUCT_HINTS],
  "Reservas": ["reservar","reserva","cita","turno","mesa","agenda","booking"],
  "Leads": ["contacto","presupuesto","cotizacion","cotización","whatsapp","consulta","formulario","lead"],
  "Portfolio": ["portfolio","trabajos","galeria","galería","muestrario"],
};

function detect(text:string){
  const raw = text || "";
  const low = stripAccents(raw.toLowerCase());

  // nombre
  let nombre = "";
  const m1 = raw.match(/me llamo\s+([A-Za-zÁÉÍÓÚÑáéíóúñ]+)(?:\s|$)/i);
  const m2 = raw.match(/\bsoy\s+([A-Za-zÁÉÍÓÚÑáéíóúñ]+)(?:\s|$)/i);
  if(m1) nombre = m1[1]; else if(m2) nombre = m2[1];

  // sector/objetivo heurísticos
  let sector = "E-commerce";
  for(const k of Object.keys(SECTOR_WORDS)){
    if (SECTOR_WORDS[k].some(w=>low.includes(stripAccents(w)))){ sector = k; break; }
  }

  let objetivo = "Vender";
  for(const k of Object.keys(OBJ_WORDS)){
    if (OBJ_WORDS[k].some(w=>low.includes(stripAccents(w)))){ objetivo = k; break; }
  }

  // producto (si “vender X …”)
  let producto = "";
  const pv = low.match(/vender\s+(mis\s+|misas\s+|unos\s+|unas\s+|un\s+|una\s+)?([a-záéíóúñ0-9\- ]{2,30})/i);
  if (pv) {
    producto = pv[2].trim();
    if(producto.length>0 && !PRODUCT_HINTS.includes(producto)) PRODUCT_HINTS.push(producto);
  }

  // idioma por pistas
  const idioma: "es"|"en"|"fr" = / the | and | with | shop | buy /i.test(raw) ? "en" : (/ le | et | avec | boutique /i.test(raw) ? "fr" : "es");

  // estilo por defecto
  const estilo = "Premium cálido";

  // copy base
  const topic = (producto && objetivo==="Vender") ? producto : sector.toLowerCase();
  const h1 = objetivo==="Vender"
    ? `Tu ${topic} online listo para vender hoy`
    : objetivo==="Reservas"
      ? `Reservas fáciles para tu ${sector.toLowerCase()}`
      : objetivo==="Leads"
        ? `Convierte visitas en clientes`
        : `Portfolio que enamora y vende tu talento`;

  const subtitle = objetivo==="Vender"
    ? `Checkout rápido, confianza y repetición de compra.`
    : objetivo==="Reservas"
      ? `Calendario claro, recordatorios y WhatsApp integrado.`
      : objetivo==="Leads"
        ? `Formulario persuasivo, WhatsApp y prueba social.`
        : `Muestra lo mejor de ti con un diseño limpio y potente.`;

  const sections =
    objetivo==="Vender" ? ["Hero con oferta","Catálogo","Opiniones","FAQ","CTA Comprar"]
    : objetivo==="Reservas" ? ["Hero con CTA Reservar","Agenda","Servicios","Opiniones","CTA Reservar"]
    : objetivo==="Leads" ? ["Hero con dolor/solución","Beneficios","Prueba social","FAQ","CTA Contactar"]
    : ["Hero con claim","Trabajos destacados","Servicios","Sobre mí","CTA Contacto"];

  return {
    intent: { sector, objetivo, estilo, idioma, h1, subtitle, sections, nombre }
  };
}

export default function handler(req:NextApiRequest,res:NextApiResponse){
  try{
    if (req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
    const { text } = (req.body||{});
    // Soft intent siempre devuelve algo válido
    return res.status(200).json(detect(String(text||"")));
  }catch(_e){
    // Aun en error, devolvemos un intent por defecto (nunca 500)
    return res.status(200).json(detect(""));
  }
}
