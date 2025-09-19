import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const ChatPulse = dynamic(() => import("../components/ChatPulse"), { ssr: true });

type Msg = { id: string; role: "user"|"pulse"; text: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { id: "m0", role: "pulse", text: "¡Hola! Soy Pulse ☕⚡ Cuéntame tu idea y te maqueto una web real." }
  ]);
  const [input, setInput] = useState("");
  const [mood, setMood] = useState<"neutral"|"celebrate"|"oops">("neutral");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    const userMsg: Msg = { id: `u-${Date.now()}`, role: "user", text };

    setMessages(prev => [...prev, userMsg]);
    setMood("neutral"); // mientras escucha

    setTimeout(() => {
      try {
        const pulseMsg: Msg = {
          id: `p-${Date.now()}`,
          role: "pulse",
          text: "¡Genial! ✨ Ya tengo una propuesta lista para ti."
        };
        setMessages(prev => [...prev, pulseMsg]);
        setMood("celebrate");
      } catch (err) {
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

  function handleSubmit(e: React.FormEvent) { e.preventDefault(); sendMessage(); }

  return (
    <div className="chat-wrap">
      <div className="bg-layer" aria-hidden="true" />
      <main className="chat-main" role="main" aria-label="Chat con Pulse">
        <section className="left-rail" aria-label="Asistente Pulse">
          <ChatPulse size={220} mood={mood} />
          <div className="tagline">
            <h1>Tu web antes de que se te enfríe el café</h1>
            <p>Describe tu idea → recibes propuesta y preview.</p>
          </div>
        </section>

        <section className="thread" aria-live="polite" aria-label="Hilo de conversación">
          <header className="thread-head">
            <span className="dot" aria-hidden="true">☕</span>
            <strong>Chat con Pulse</strong>
            <span className="pill">cine</span>
          </header>

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
    </div>
  );
}
