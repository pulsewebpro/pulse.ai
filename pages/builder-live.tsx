import React, { useState } from "react";
import Head from "next/head";

export default function BuilderLive(){
  const [q, setQ] = useState("Restaurante bistró moderno en Madrid");
  const src = "/preview-embed?q=" + encodeURIComponent(q);
  const chatSrc = "/chat"; // reusa tu chat existente

  return (
    <>
      <Head><title>Pulse · Builder Live (Chat + Preview)</title></Head>
      <div className="grid md:grid-cols-2 min-h-screen">
        <div className="border-r bg-black/5">
          <div className="p-3 text-xs text-zinc-600">Chat (embed)</div>
          <iframe title="Chat Pulse" src={chatSrc} className="w-full h-[calc(100vh-2.5rem)] border-0"></iframe>
        </div>
        <div className="flex flex-col">
          <div className="p-3 flex gap-2 items-end border-b bg-white">
            <label className="flex-1 text-sm">
              <span className="block text-xs text-zinc-500 mb-1">Prompt</span>
              <input className="w-full rounded-2xl border px-3 py-2" value={q} onChange={e=>setQ(e.target.value)} placeholder="Ej: Tienda de flores minimalista en Barcelona"/>
            </label>
            <a href={src} target="preview" className="px-4 py-2 rounded-2xl border font-semibold">Generar</a>
          </div>
          <iframe name="preview" title="Preview" src={src} className="w-full flex-1 border-0"></iframe>
        </div>
      </div>
    </>
  );
}
