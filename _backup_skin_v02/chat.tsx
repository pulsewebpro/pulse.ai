import React, { useEffect, useMemo, useRef, useState } from "react";

/** ───── Chat (mantiene personalidad GUARDADO7) ───── */
type Msg = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "pulse_chat_v1";
const isBrowser = typeof window !== "undefined";
const safeGet = (k: string) => (isBrowser ? window.localStorage.getItem(k) : null);
const safeSet = (k: string, v: string) => { if (isBrowser) try { window.localStorage.setItem(k, v); } catch {} };

function formatAssistant(content: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let html = esc(content);
  html = html
    .replace(/\(\s*A\s*\)/gi, "[A]")
    .replace(/\(\s*B\s*\)/gi, "[B]")
    .replace(/\bA\)\s*/g, "[A] ")
    .replace(/\bB\)\s*/g, "[B] ");
  html = html.replace(/\[A\]/g, '<span class="pill pill-a">Ⓐ</span>').replace(/\[B\]/g, '<span class="pill pill-b">Ⓑ</span>');
  html = html.replace(/\s+o\s+/gi, ' <span class="or">· o ·</span> ');
  return html.replace(/\n/g, "<br/>");
}

/** ───── Generador ───── */
type SkinV01 = "crystal-oro" | "warm-cafe";
type SkinV02 = "crystal-oro" | "warm-cafe" | "minimal-noir";
type Sector = "restaurante" | "portfolio" | "saas" | "tienda" | "consultoria";

export default function ChatAndBuilder() {
  // Chat state
  const defaultMsgs: Msg[] = [
    { role: "assistant", content: "Estoy contigo. Háblame de tu web o negocio. ¿Qué te gustaría lograr primero: ventas, reservas o leads? ☕⚡" },
  ];
  const [msgs, setMsgs] = useState<Msg[]>(defaultMsgs);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const raw = safeGet(STORAGE_KEY);
    if (raw) try { const parsed = JSON.parse(raw); if (Array.isArray(parsed) && parsed.length) setMsgs(parsed); } catch {}
  }, []);
  useEffect(() => {
    safeSet(STORAGE_KEY, JSON.stringify(msgs));
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, loading]);

  async function send() {
    if (!input.trim() || loading) return;
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const base = [...msgs, { role: "user" as const, content: input.trim().slice(0, 5000) }];
    setMsgs(base); setInput(""); setLoading(true);

    try {
      const res = await fetch("/api/pulse-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ messages: base }),
      });
      let acc = "";
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMsgs([...base, { role: "assistant", content: acc }]);
      }
    } catch (e: any) {
      setMsgs([...base, { role: "assistant", content: e?.name==="AbortError" ? "Corté la respuesta para priorizar tu último mensaje. ☕" : "Oops, falló la conexión. Reintentemos. ☕" }]);
    } finally { setLoading(false); abortRef.current = null; }
  }

  // Builder state
  const [useV02, setUseV02] = useState(true); // v0.2 por defecto
  const [prompt, setPrompt] = useState("");
  const [skinV01, setSkinV01] = useState<SkinV01>("crystal-oro");
  const [skinV02, setSkinV02] = useState<SkinV02>("crystal-oro");
  const [sector, setSector]   = useState<Sector>("restaurante");
  const [status, setStatus]   = useState("");
  const [downloadUrl, setDl]  = useState("");

  const previewSrc = useMemo(()=>"/banner/banner-hero-4k.png",[useV02, skinV01, skinV02]);

  async function generateZip(){
    setStatus("☕⚡ Creando tu web…"); setDl("");
    const body = {
      prompt: prompt || "Web lista para facturar",
      skin: useV02 ? skinV02 : skinV01,
      sector
    };
    const endpoint = useV02 ? "/api/pulse-generate-v02" : "/api/pulse-generate-v01";
    const res = await fetch(endpoint, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data?.downloadUrl){ setStatus("✅ ¡Tu web está lista!"); setDl(data.downloadUrl); }
    else { setStatus("❌ Error generando la web."); }
  }

  return (
    <main className="page">
      <div className="layout">
        {/* Columna izquierda: Chat Pulse */}
        <section className="col chat">
          <h1 className="title">Chat con Pulse</h1>
          <div className="window" ref={scrollRef} aria-live="polite">
            <div className="stack">
              {msgs.map((m,i)=>(
                <div key={i} className={["bubble",m.role==="assistant"?"pulse":"user"].join(" ")}>
                  {m.role==="assistant"
                    ? <div className="content" dangerouslySetInnerHTML={{ __html: formatAssistant(m.content) }}/>
                    : <div className="content">{m.content}</div>}
                </div>
              ))}
              {loading && <div className="bubble pulse"><div className="content">Pensando tu mejor versión… ☕</div></div>}
            </div>
          </div>
          <div className="composer">
            <input
              value={input}
              onChange={(e)=>setInput(e.target.value)}
              onKeyDown={(e)=>{ if(e.key==="Enter"&&!e.shiftKey&&input.trim()&&!loading){e.preventDefault();send();} if(e.key==="Escape"&&abortRef.current)abortRef.current.abort(); }}
              placeholder="Cuéntame tu idea. Yo diseño mientras se enfría el café…"
              aria-label="Escribe tu idea"
              className="composer-input"
            />
            <button onClick={send} disabled={!input.trim()||loading} aria-busy={loading} className="composer-btn">
              {loading?"Creando…":"Enviar"}
            </button>
          </div>
          <p className="hint">Enter para enviar • Shift+Enter salto de línea • Esc para cancelar</p>
        </section>

        {/* Columna derecha: Generador en vivo */}
        <section className="col builder">
          <h2 className="subtitle">Generador en vivo ☕⚡</h2>
          <div className="row">
            <label className="lab">Modo</label>
            <div className="toggle">
              <button className={!useV02?"on":""} onClick={()=>setUseV02(false)}>v0.1</button>
              <button className={useV02?"on":""} onClick={()=>setUseV02(true)}>v0.2</button>
            </div>
          </div>

          <div className="row">
            <label className="lab">Idea</label>
            <input value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Ej: SaaS de facturas, onboarding simple; cafetería con reservas…" />
          </div>

          <div className="row">
            <label className="lab">Estilo</label>
            {!useV02 ? (
              <select value={skinV01} onChange={e=>setSkinV01(e.target.value as SkinV01)}>
                <option value="crystal-oro">Crystal Oro (premium)</option>
                <option value="warm-cafe">Warm Café (cálido)</option>
              </select>
            ) : (
              <select value={skinV02} onChange={e=>setSkinV02(e.target.value as SkinV02)}>
                <option value="crystal-oro">Crystal Oro (premium)</option>
                <option value="warm-cafe">Warm Café (cálido)</option>
                <option value="minimal-noir">Minimal Noir (elegante)</option>
              </select>
            )}
          </div>

          <div className="row">
            <label className="lab">Sector</label>
            <select value={sector} onChange={e=>setSector(e.target.value as Sector)}>
              <option value="restaurante">Restaurante</option>
              <option value="portfolio">Portfolio</option>
              <option value="saas">SaaS</option>
              <option value="tienda">Tienda</option>
              <option value="consultoria">Consultoría</option>
            </select>
          </div>

          <div className="row">
            <button className="gen-btn" onClick={generateZip}>Generar ZIP {useV02 ? "v0.2" : "v0.1"}</button>
          </div>

          {status && <p className="status">{status}</p>}

          <div className="preview">
            <img src={previewSrc} alt="Preview del estilo" />
            <p className="caption">*Preview ilustrativa. El ZIP refleja estilo y sector (v0.2 añade TrustBar + Testimonios).</p>
          </div>

          {downloadUrl && (
            <a className="download" href={downloadUrl}>📦 Descargar ZIP</a>
          )}
        </section>
      </div>

      <style jsx global>{`
        .page{min-height:100vh;background:#0a0a0a;color:#f8fafc;display:flex;align-items:flex-start;justify-content:center;padding:24px;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}
        .layout{display:grid;grid-template-columns:1.3fr .9fr;gap:16px;width:100%;max-width:1220px}
        .col{background:rgba(255,255,255,.04);border:1px solid rgba(56,189,248,.25);border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.35);padding:16px}
        .title{font-size:24px;font-weight:800;margin:0 0 10px;text-shadow:0 0 18px rgba(56,189,248,.18)}
        .subtitle{font-size:20px;font-weight:800;margin:0 0 10px}
        .window{height:58vh;overflow-y:auto;padding:10px;background:rgba(255,255,255,.03);border:1px solid rgba(56,189,248,.2);border-radius:12px}
        .stack{display:flex;flex-direction:column;gap:10px}
        .bubble{max-width:80%;padding:12px 14px;border-radius:14px;line-height:1.6;white-space:pre-wrap}
        .bubble.user{align-self:flex-end;background:rgba(255,255,255,.08);color:#e5e7eb;border:1px solid rgba(255,215,0,.25)}
        .bubble.pulse{align-self:flex-start;background:rgba(56,189,248,.1);color:#f3f4f6;border:1px solid rgba(56,189,248,.28);border-left:3px solid #38bdf8}
        .pill{display:inline-block;min-width:1.6em;padding:.08rem .45rem;border-radius:999px;font-weight:800;font-size:.92em;line-height:1;border:1px solid rgba(255,255,255,.25);margin:0 .25rem;vertical-align:baseline;box-shadow:0 2px 8px rgba(0,0,0,.25)}
        .pill-a{background:linear-gradient(135deg,#ffd700,#ff9f45);color:#0a0a0a;border-color:rgba(255,215,0,.7)}
        .pill-b{background:linear-gradient(135deg,#3abff8,#38bdf8);color:#0a0a0a;border-color:rgba(56,189,248,.7)}
        .or{opacity:.7}
        .composer{display:flex;gap:10px;margin-top:10px}
        .composer-input{flex:1;padding:12px 14px;border-radius:12px;border:1px solid rgba(255,215,0,.45);background:rgba(255,255,255,.06);color:#f8fafc}
        .composer-btn{padding:12px 18px;border-radius:14px;border:1px solid rgba(255,215,0,.6);background:linear-gradient(135deg,#ffd700,#ff9f45);color:#0a0a0a;font-weight:800;cursor:pointer}
        .composer-btn[disabled]{opacity:.7;cursor:not-allowed;transform:scale(.98)}
        .hint{margin:8px 0 0;opacity:.7;font-size:12px}
        .row{display:flex;gap:10px;align-items:center;margin-top:8px}
        .row input,.row select{flex:1;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,215,0,.35);background:rgba(255,255,255,.06);color:#f8fafc}
        .lab{min-width:82px;opacity:.85}
        .toggle{display:flex;gap:6px}
        .toggle button{padding:8px 12px;border-radius:999px;border:1px solid rgba(56,189,248,.4);background:rgba(56,189,248,.08);color:#e5f6ff;font-weight:700;cursor:pointer}
        .toggle .on{background:#ffd700;color:#0a0a0a;border-color:rgba(255,215,0,.7)}
        .gen-btn{width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,215,0,.6);background:linear-gradient(135deg,#ffd700,#ff9f45);color:#0a0a0a;font-weight:800;cursor:pointer;margin-top:4px}
        .status{margin:8px 0 0}
        .preview{margin-top:14px}
        .preview img{width:100%;max-width:520px;border-radius:12px;box-shadow:0 10px 40px rgba(56,189,248,.15)}
        .caption{opacity:.7;margin-top:6px;font-size:12px}
        .download{display:inline-block;margin-top:12px;padding:12px 18px;background:#38bdf8;color:#0a0a0a;border-radius:12px;text-decoration:none;font-weight:800}
        @media (max-width:1020px){ .layout{grid-template-columns:1fr} .window{height:46vh} }
      `}</style>
    </main>
  );
}
