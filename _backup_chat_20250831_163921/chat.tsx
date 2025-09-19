import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const ChatPulse = dynamic(() => import("../components/ChatPulse"), { ssr: true });

type Msg = { id: string; role: "user"|"pulse"; text: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { id: "m0", role: "pulse", text: "¡Hola! Soy Pulse ☕⚡ Cuéntame tu idea y te maqueto una web real. " }
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    const userMsg: Msg = { id: `u-${Date.now()}`, role: "user", text };
    const pulseMsg: Msg = {
      id: `p-${Date.now()+1}`,
      role: "pulse",
      text: "Recibido. ✨ Voy a proponerte estructura y un preview PNG. (Fase B: sonido y módulos)."
    };
    setMessages(prev => [...prev, userMsg, pulseMsg]);
    setInput("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage();
  }

  return (
    <div className="chat-wrap">
      {/* Fondo atmosférico con overlay de spark si existe */}
      <div className="bg-layer" aria-hidden="true" />
      <main className="chat-main" role="main" aria-label="Chat con Pulse">
        <section className="left-rail">
          <ChatPulse size={180} mood="neutral" />
          <div className="tagline">
            <h1>Tu web antes de que se te enfríe el café</h1>
            <p>Describe tu idea → recibes propuesta y preview.</p>
          </div>
        </section>

        <section className="thread" aria-live="polite">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                className={`bubble ${m.role}`}
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.22,1,0.36,1] }}
              >
                {m.text}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={endRef} />
        </section>

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

      <style jsx global>{`
        :root{
          --bg:#0A0A0A; --ink:#F8FAFC; --cyan:#38BDF8; --gold:#FFD700;
          --glass: rgba(255,255,255,0.06); --glass-2: rgba(255,255,255,0.10);
          --user: rgba(255,255,255,0.08); --pulse: rgba(56,189,248,0.10);
        }
        html,body,#__next { height: 100%; background: var(--bg); color: var(--ink); }
        .sr-only{ position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
        .chat-wrap { position: relative; min-height: 100vh; overflow: hidden; }
        .bg-layer{
          position:absolute; inset:0;
          background:
            radial-gradient(1200px 700px at 10% 80%, rgba(56,189,248,0.18), transparent 55%),
            radial-gradient(900px 600px at 85% 10%, rgba(255,215,0,0.10), transparent 60%),
            linear-gradient(180deg, #0B1220 0%, #000 100%);
        }
        .chat-main{
          position: relative; z-index: 1;
          display: grid; grid-template-columns: 360px 1fr; gap: 28px;
          max-width: 1200px; margin: 0 auto; padding: 28px 20px 28px 20px;
        }
        @media (max-width: 980px){
          .chat-main{ grid-template-columns: 1fr; }
          .left-rail{ order: 2; }
          .thread{ order: 1; }
        }

        .left-rail{
          position: sticky; top: 16px;
          align-self: start;
          display: grid; gap: 16px;
          padding: 10px;
          border-radius: 18px;
          background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
          outline: 1px solid rgba(56,189,248,0.15);
        }
        .left-rail .tagline h1{
          font-size: clamp(16px, 2.2vw, 22px);
          line-height: 1.15; margin: 4px 0 8px;
          text-shadow: 0 1px 0 rgba(0,0,0,0.4);
        }
        .left-rail .tagline p{
          margin: 0; color: rgba(248,250,252,0.75);
        }

        .thread{
          display: flex; flex-direction: column; gap: 16px;
          padding: 18px; border-radius: 18px;
          background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02));
          outline: 1px solid rgba(255,255,255,0.06);
          max-height: calc(100vh - 200px); overflow-y: auto;
          scroll-behavior: smooth;
        }
        .bubble{
          max-width: 82%;
          padding: 14px 16px; border-radius: 16px;
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.10);
          word-wrap: break-word; white-space: pre-wrap;
        }
        .bubble.pulse{
          align-self: flex-start;
          background: linear-gradient(180deg, var(--pulse), rgba(56,189,248,0.06));
          box-shadow: 0 10px 36px rgba(56,189,248,0.20);
        }
        .bubble.user{
          align-self: flex-end;
          background: linear-gradient(180deg, var(--user), rgba(255,255,255,0.06));
          box-shadow: 0 10px 36px rgba(255,255,255,0.10);
        }

        .composer{
          position: sticky; bottom: 0; left: 0; right: 0;
          display: grid; grid-template-columns: 1fr auto; gap: 12px;
          margin-top: 16px; padding: 12px; border-radius: 16px;
          background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03));
          outline: 1px solid rgba(255,255,255,0.08);
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
        .helper{
          grid-column: 1 / -1; font-size: 12px; color: rgba(248,250,252,0.6);
          margin: -4px 2px 0;
        }

        .send-btn{
          display: inline-grid; place-items: center;
          width: 56px; height: 56px; border-radius: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,215,0,0.35);
          box-shadow: 0 10px 30px rgba(255,215,0,0.18), 0 10px 40px rgba(56,189,248,0.18);
          cursor: pointer;
          transition: transform .08s ease;
        }
        .send-btn:active { transform: scale(0.97); }
        .send-btn img{
          display:block; width: 42px; height: 42px; object-fit: contain;
          filter: drop-shadow(0 6px 18px rgba(255,215,0,0.35));
        }

        /* Overlay opcional: partículas */
        .chat-wrap::before{
          content:""; position:absolute; inset:0; pointer-events:none;
          background-image: url("/banner/banner-spark-overlay.png");
          background-repeat:no-repeat; background-position: right top; background-size: contain;
          opacity: .45;
        }
        @media (prefers-reduced-motion: reduce){
          .thread{ scroll-behavior: auto; }
        }
      `}</style>
    </div>
  );
}
