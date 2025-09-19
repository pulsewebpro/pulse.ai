import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const ChatPulse = dynamic(() => import("../components/ChatPulse"), { ssr: true });

type Msg = { id: string; role: "user"|"pulse"; text: string };

export default function ChatPage() {
  // Mensaje inicial de Pulse
  const [messages, setMessages] = useState<Msg[]>([
    { id: "m0", role: "pulse", text: "¡Hola! Soy Pulse ☕⚡ Cuéntame tu idea y te maqueto una web real." }
  ]);
  const [input, setInput] = useState("");
  const [mood, setMood] = useState<"neutral"|"celebrate"|"oops">("neutral");
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function sendMessage() {
    const text = input.trim();
    if (!text) return;

    // Añadimos mensaje del usuario
    const userMsg: Msg = { id: `u-${Date.now()}`, role: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setMood("neutral"); // escuchando mientras “procesa”

    // Simulamos respuesta (éxito)
    setTimeout(() => {
      try {
        const pulseMsg: Msg = {
          id: `p-${Date.now()}`,
          role: "pulse",
          text: "¡Genial! ✨ Ya tengo una propuesta lista para ti."
        };
        setMessages(prev => [...prev, pulseMsg]);
        setMood("celebrate");
      } catch {
        // En caso de error → mood oops
        const errMsg: Msg = {
          id: `p-${Date.now()}`,
          role: "pulse",
          text: "Oops ☕ algo se me cayó… inténtalo de nuevo."
        };
        setMessages(prev => [...prev, errMsg]);
        setMood("oops");
      }
    }, 800);

    setInput("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage();
  }

  const isEmpty =
    messages.length === 0 ||
    (messages.length === 1 && messages[0].role === "pulse" && !!messages[0].text);

  return (
    <div className="chat-wrap">
      <div className="bg-layer" aria-hidden="true" />
      <main className="chat-main" role="main" aria-label="Chat con Pulse">
        {/* Rail izquierdo: Pulse + tagline */}
        <section className="left-rail" aria-label="Asistente Pulse">
          <ChatPulse size={220} mood={mood} />
          <div className="tagline">
            <h1>Tu web antes de que se te enfríe el café</h1>
            <p>Describe tu idea → recibes propuesta y preview.</p>
          </div>
        </section>

        {/* Panel derecho: hilo + header + empty state */}
        <section className="thread" aria-live="polite" aria-label="Hilo de conversación">
          <header className="thread-head">
            <span className="dot" aria-hidden="true">☕</span>
            <strong>Chat con Pulse</strong>
            <span className="pill">cine</span>
          </header>

          {isEmpty && (
            <div className="empty">
              <div className="empty-aurora" aria-hidden="true" />
              <h2>Cuéntame tu idea ✍️</h2>
              <p>Ejemplos: “web para cafetería con carta y WhatsApp” · “landing para abogado + testimonios”.</p>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                className={`bubble ${m.role}`}
                initial={{ opacity: 0, y: 16, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.985 }}
                transition={{ duration: 0.35, ease: [0.22,1,0.36,1] }}
              >
                <span className="bubble-inner">{m.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={endRef} />
        </section>

        {/* Composer */}
        <form className="composer" onSubmit={handleSubmit} aria-label="Escribir mensaje">
          <label htmlFor="chat-input" className="sr-only">Escribe tu mensaje</label>
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e)=>setInput(e.target.value)}
            placeholder="Ej: quiero una web para mi cafetería con menú y contacto"
            autoComplete="off"
            aria-describedby="helper"
          />
          <button type="submit" className="send-btn" aria-label="Enviar mensaje">
            <img src="/ui/button-gold-4k.png" alt="" width="56" height="56" />
          </button>
          <div id="helper" className="helper">Enter para enviar • Respetamos tu privacidad</div>
        </form>
      </main>

      {/* ESTILOS CINE  —  GLOBAL */}
      <style jsx global>{`
        :root{
          --bg:#0A0A0A; --ink:#F8FAFC; --muted:rgba(248,250,252,0.72);
          --cyan:#38BDF8; --gold:#FFD700;
          --user: rgba(255,255,255,0.08); --pulse: rgba(56,189,248,0.10);
        }
        html,body,#__next { height: 100%; background: var(--bg); color: var(--ink); }
        .sr-only{ position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
        .chat-wrap { position: relative; min-height: 100vh; overflow: hidden; }

        /* Fondo con auroras + overlay spark */
        .bg-layer{
          position:absolute; inset:0; pointer-events:none;
          background:
            radial-gradient(1200px 700px at 10% 80%, rgba(56,189,248,0.18), transparent 55%),
            radial-gradient(900px 600px at 85% 10%, rgba(255,215,0,0.10), transparent 60%),
            linear-gradient(180deg, #0B1220 0%, #000 100%);
        }
        .chat-wrap::before{
          content:""; position:absolute; inset:0; pointer-events:none;
          background-image: url("/banner/banner-spark-overlay.png");
          background-repeat:no-repeat; background-position: right top; background-size: 58vw auto;
          opacity: .36;
        }

        /* Layout principal */
        .chat-main{
          position: relative; z-index: 1;
          display: grid; grid-template-columns: 380px 1fr; gap: 28px;
          max-width: 1280px; margin: 0 auto; padding: 32px 22px 28px;
        }
        @media (max-width: 1100px){ .chat-main{ grid-template-columns: 1fr; } }

        /* Rail izquierdo */
        .left-rail{
          position: sticky; top: 18px; align-self: start;
          display: grid; gap: 14px; padding: 14px;
          border-radius: 20px;
          background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
          outline: 1px solid rgba(56,189,248,0.16);
          box-shadow: 0 18px 80px rgba(56,189,248,0.10);
        }
        .left-rail .tagline h1{
          font-size: clamp(18px, 2.4vw, 24px);
          line-height: 1.15; margin: 4px 0 6px;
          text-shadow: 0 1px 0 rgba(0,0,0,0.4);
        }
        .left-rail .tagline p{ margin: 0; color: var(--muted); }

        /* Panel derecho (hilo) */
        .thread{
          display: flex; flex-direction: column; gap: 14px;
          padding: 0; border-radius: 22px; position: relative; overflow: hidden;
          background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02));
          outline: 1px solid rgba(255,255,255,0.06);
        }
        .thread::after{
          content:""; position:absolute; inset:0; pointer-events:none;
          background:
            radial-gradient(800px 400px at 20% 0%, rgba(56,189,248,0.10), transparent 55%),
            radial-gradient(900px 500px at 100% 100%, rgba(255,215,0,0.08), transparent 60%);
          opacity:.65;
        }
        .thread-head{
          display:flex; align-items:center; gap:10px;
          padding: 14px 18px; position: sticky; top:0; z-index:2;
          background: linear-gradient(180deg, rgba(10,10,10,0.75), rgba(10,10,10,0.45));
          border-bottom: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(10px);
        }
        .thread-head .dot{ filter: drop-shadow(0 0 12px rgba(56,189,248,0.6)); }
        .thread-head strong{ letter-spacing: .2px; }
        .thread-head .pill{
          margin-left:auto; font-size:12px; padding:4px 8px; border-radius:999px;
          background: rgba(56,189,248,0.12); color: var(--ink);
          border: 1px solid rgba(56,189,248,0.25);
        }

        /* Empty state */
        .empty{
          display:grid; place-items:center; text-align:center; gap:8px;
          padding: 32px 18px 28px;
          color: var(--muted);
        }
        .empty h2{ color: var(--ink); margin: 6px 0 0; font-size: clamp(16px,2.4vw,20px); }
        .empty-aurora{
          width:min(420px,70%); height:140px; border-radius:28px;
          background:
            radial-gradient(closest-side, rgba(56,189,248,0.18), transparent 70%),
            radial-gradient(closest-side, rgba(255,215,0,0.12), transparent 75%);
          filter: blur(12px); opacity:.7;
        }

        /* Scroll área mensajes */
        .thread > :global(.bubble), .thread .empty{ position: relative; z-index:1; }
        .thread{ max-height: calc(100vh - 220px); overflow-y: auto; scroll-behavior: smooth; }
        .thread::-webkit-scrollbar{ width:10px; }
        .thread::-webkit-scrollbar-track{ background: rgba(255,255,255,0.03); }
        .thread::-webkit-scrollbar-thumb{
          background: linear-gradient(180deg, rgba(56,189,248,0.35), rgba(255,215,0,0.28));
          border-radius:20px; border: 2px solid rgba(0,0,0,0.35);
        }

        /* Burbujas cine */
        .bubble{
          max-width: 82%;
          padding: 0; margin: 10px 18px;
          border-radius: 18px; position: relative;
        }
        .bubble .bubble-inner{
          display:block; padding: 14px 16px; border-radius: inherit;
          backdrop-filter: blur(8px) saturate(1.02);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .bubble.pulse{ align-self: flex-start; background: transparent; }
        .bubble.pulse .bubble-inner{
          background: linear-gradient(180deg, rgba(56,189,248,0.14), rgba(56,189,248,0.06));
          box-shadow: 0 10px 36px rgba(56,189,248,0.22), inset 0 0 20px rgba(56,189,248,0.10);
        }
        .bubble.pulse::after{
          content:""; position:absolute; left:8px; bottom: -6px; width:12px; height:12px;
          background: linear-gradient(180deg, rgba(56,189,248,0.14), rgba(56,189,248,0.06));
          border-left:1px solid rgba(255,255,255,0.12); border-bottom:1px solid rgba(255,255,255,0.12);
          transform: rotate(45deg);
          filter: drop-shadow(0 6px 12px rgba(56,189,248,0.35));
        }
        .bubble.user{ align-self: flex-end; }
        .bubble.user .bubble-inner{
          background: linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.05));
          box-shadow: 0 10px 36px rgba(255,255,255,0.10), inset 0 0 16px rgba(255,255,255,0.06);
        }
        .bubble.user::after{
          content:""; position:absolute; right:8px; bottom: -6px; width:12px; height:12px;
          background: linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.05));
          border-right:1px solid rgba(255,255,255,0.12); border-bottom:1px solid rgba(255,255,255,0.12);
          transform: rotate(45deg);
          filter: drop-shadow(0 6px 12px rgba(0,0,0,0.35));
        }

        /* Composer */
        .composer{
          position: sticky; bottom: 0; left: 0; right: 0;
          display: grid; grid-template-columns: 1fr auto; gap: 12px;
          margin-top: 0; padding: 12px; border-radius: 0 0 22px 22px;
          background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03));
          border-top: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 -20px 60px rgba(0,0,0,0.25);
        }
        .composer input{
          width: 100%; font-size: 16px; color: var(--ink);
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,215,0,0.35);
          border-radius: 14px; padding: 14px 14px;
          outline: none;
          box-shadow: inset 0 0 0 1px rgba(56,189,248,0.18), 0 8px 28px rgba(0,0,0,0.35);
        }
        .composer input:focus{
          box-shadow: inset 0 0 0 2px rgba(56,189,248,0.55), 0 10px 36px rgba(56,189,248,0.25);
        }
        .helper{ grid-column: 1 / -1; font-size: 12px; color: rgba(248,250,252,0.6); margin: -4px 2px 0; }

        .send-btn{
          display: inline-grid; place-items: center;
          width: 56px; height: 56px; border-radius: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,215,0,0.35);
          box-shadow: 0 10px 30px rgba(255,215,0,0.18), 0 10px 40px rgba(56,189,248,0.18);
          cursor: pointer; transition: transform .08s ease;
        }
        .send-btn:active { transform: scale(0.97); }
        .send-btn img{ display:block; width: 42px; height: 42px; object-fit: contain; filter: drop-shadow(0 6px 18px rgba(255,215,0,0.35)); }
      `}</style>
    </div>
  );
}
