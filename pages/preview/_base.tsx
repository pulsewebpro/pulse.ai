import Head from "next/head"; import "../../styles/preview.css";
export type PD={intent:"ventas"|"reservas"|"blog"|"creador"|"social"|"default";title:string;subtitle:string};
const IMG="/banner/banner-hero-4k.png";
export default function Base({d}:{d:PD}){const plan=process.env.NEXT_PUBLIC_PULSE_PLAN||"demo";const wm=process.env.NEXT_PUBLIC_PULSE_WATERMARK||"on";const demo=(plan==="demo"||wm==="on");
return (<html className={demo?"demo":""}><body><Head><title>Preview · Pulse</title><meta name="viewport" content="width=device-width,initial-scale=1"/></Head>
<div className="preview"><main className="card"><h1>{d.title}</h1><p>{d.subtitle}</p>
<img className="img" src={IMG} alt="Hero de ejemplo"/><div className="grid"><div className="block">Bloque A</div><div className="block">Bloque B</div><div className="block">Bloque C</div></div>
</main></div></body></html>);}
