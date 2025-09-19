import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };
type Meta = { ms?: number; approx_cost_eur?: number } | null;

const STORAGE_KEY = "pulse_chat_v1";

/** SSR-safe helpers */
const isBrowser = typeof window !== "undefined";
const safeGet = (k: string) => (isBrowser ? window.localStorage.getItem(k) : null);
const safeSet = (k: string, v: string) => { if (isBrowser) try { window.localStorage.setItem(k, v); } catch {} };

/** Escape + formateo de opciones alfabéticas */
function formatAssistant(content: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let html = esc(content);

  // Normalizamos variantes
  html = html
    .replace(/\(\s*A\s*\)/gi, "[A]")
    .replace(/\(\s*B\s*\)/gi, "[B]")
    .replace(/\bA\)\s*/g, "[A] ")
    .replace(/\bB\)\s*/g, "[B] ");

  // Pills visuales
  html = html
    .replace(/\[A\]/g, '<span class="pill pill-a">Ⓐ</span>')
    .replace(/\[B\]/g, '<span class="pill pill-b">Ⓑ</span>');

  // Separador visual “o”
  html = html.replace(/\s+o\s+/gi, ' <span class="or">· o ·</span> ');

  return html.replace(/\n/g, "<br/>");
}

export default function Chat() {
  const defaultMsgs: Msg[] = [
    {
      role: "assistant",
      content:
        "Estoy contigo. Cuéntame tu idea de web/negocio como si estuviéramos tomando un café. ¿Qué quieres lograr primero: vender, reservas o leads? ☕⚡",
    },
  ];
  const [msgs, setMsgs] = useState<Msg[]>(defaultMsgs);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<Meta>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const raw = safeGet(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) setMsgs(parsed);
      } catch {}
    }
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
    setMsgs(base); setInput(""); setLoading(true); setMeta(null);
    const started = Date.now();

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

      const perChar = 0.25;
      const pin = Math.ceil(base.map(m => m.content.length).reduce((a,b)=>a+b,0) * perChar);
      const pout = Math.ceil((acc||"").length * perChar);
      setMeta({ ms: Date.now() - started, approx_cost_eur: Number(((pin/1000)*0.003+(pout/1000)*0.009).toFixed(4)) });
    } catch (e: any) {
      setMsgs([...base, { role: "assistant", content: e?.name==="AbortError" ? "Corté la respuesta para priorizar tu último mensaje. ☕" : "Oops, falló la conexión. Reintentemos. ☕" }]);
    } finally { setLoading(false); abortRef.current = null; }
  }

  return (
    <main className="chat-page">
      <h1 className="chat-title">Chat con Pulse</h1>

      <div className="chat-window" ref={scrollRef} aria-live="polite">
        <div className="chat-container">
          {msgs.map((m,i)=>(
            <div key={i} className={["chat-bubble",m.role==="assistant"?"pulse":"user"].join(" ")}>
              {m.role==="assistant"
                ? <div className="bubble-content" dangerouslySetInnerHTML={{ __html: formatAssistant(m.content) }}/>
                : <div className="bubble-content">{m.content}</div>}
            </div>
          ))}
          {loading && <div className="chat-bubble pulse"><div className="bubble-content">Pensando tu mejor versión… ☕</div></div>}
        </div>
      </div>

      <div className="composer">
        <input
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          onKeyDown={(e)=>{
            if(e.key==="Enter"&&!e.shiftKey&&input.trim()&&!loading){e.preventDefault();send();}
            if(e.key==="Escape"&&abortRef.current)abortRef.current.abort();
          }}
          placeholder="Háblame como a un amigo, yo diseño tu web…"
          aria-label="Escribe tu idea"
          className="composer-input"
        />
        <button onClick={send} disabled={!input.trim()||loading} aria-busy={loading} className="composer-btn">
          {loading?"Creando…":"Enviar"}
        </button>
      </div>

      <div className="kpi">
        {meta
          ? <span>Latencia: <strong>{meta.ms} ms</strong> · Coste≈ <strong>{(meta.approx_cost_eur||0).toFixed(4)} €</strong></span>
          : <span>Enter para enviar • Shift+Enter salto de línea • Esc para cancelar</span>}
      </div>

      <style jsx global>{`
        .chat-page{min-height:100vh;background:#0a0a0a;color:#f8fafc;display:flex;flex-direction:column;align-items:center;padding:24px}
        .chat-title{font-size:28px;font-weight:800;margin-bottom:16px;letter-spacing:.2px;text-shadow:0 0 18px rgba(56,189,248,.18)}
        .chat-window{width:100%;max-width:860px;height:64vh;overflow-y:auto;padding:16px;background:rgba(255,255,255,.04);border:1px solid rgba(56,189,248,.25);border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.35)}
        .chat-container{display:flex;flex-direction:column;gap:10px;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}
        .chat-bubble{max-width:72%;padding:12px 14px;border-radius:14px;line-height:1.6;white-space:pre-wrap}
        .chat-bubble.user{align-self:flex-end;background:rgba(255,255,255,.08);color:#e5e7eb;border:1px solid rgba(255,215,0,.25)}
        .chat-bubble.pulse{align-self:flex-start;background:rgba(56,189,248,.1);color:#f3f4f6;border:1px solid rgba(56,189,248,.28);border-left:3px solid #38bdf8}
        .bubble-content strong{color:#ffd700;font-weight:700}
        .bubble-content em{font-style:italic;color:#cbd5e1}
        .pill{display:inline-block;min-width:1.6em;padding:.08rem .45rem;border-radius:999px;font-weight:800;font-size:.92em;line-height:1;border:1px solid rgba(255,255,255,.25);margin:0 .25rem;vertical-align:baseline;box-shadow:0 2px 8px rgba(0,0,0,.25)}
        .pill-a{background:linear-gradient(135deg,#ffd700,#ff9f45);color:#0a0a0a;border-color:rgba(255,215,0,.7)}
        .pill-b{background:linear-gradient(135deg,#3abff8,#38bdf8);color:#0a0a0a;border-color:rgba(56,189,248,.7)}
        .or{opacity:.7}
        .composer{display:flex;gap:10px;width:100%;max-width:860px;margin-top:14px;align-items:center}
        .composer-input{flex:1;padding:14px 16px;border-radius:12px;border:1px solid rgba(255,215,0,.45);background:rgba(255,255,255,.06);color:#f8fafc}
        .composer-btn{padding:12px 18px;border-radius:14px;border:1px solid rgba(255,215,0,.6);background:linear-gradient(135deg,#ffd700,#ff9f45);color:#0a0a0a;font-weight:800;cursor:pointer}
        .composer-btn[disabled]{opacity:.7;cursor:not-allowed;transform:scale(.98)}
        .kpi{margin-top:10px;color:rgba(248,250,252,.7);font-size:12px}
      `}</style>
    </main>
  );
}
