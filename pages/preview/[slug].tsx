import Base,{PD} from "./_base"; import {useRouter} from "next/router";
const MAP:Record<string,PD>={ventas:{intent:"ventas",title:"Tienda online lista",subtitle:"Catálogo, CTA dorado y checkout 1-click."},
reservas:{intent:"reservas",title:"Reservas y agenda",subtitle:"Calendario y confirmación simple."},
blog:{intent:"blog",title:"Blog / Contenido",subtitle:"Entradas, categorías y newsletter."},
creador:{intent:"creador",title:"Página de Creador",subtitle:"Bio, enlaces y productos propios."},
social:{intent:"social",title:"Proyecto social / ONG",subtitle:"Misión, donaciones y voluntariado."},
default:{intent:"default",title:"Describe tu idea y desbloquea tu preview",subtitle:"Elige chip o escribe tu briefing."}};
export default function P(){const {query}=useRouter();const s=String(query.slug||"default").toLowerCase();return <Base d={MAP[s]??MAP.default}/>;}
