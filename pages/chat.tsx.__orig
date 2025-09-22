import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { frase, sectorize } from "../lib/pulseBrain";
import PreviewDemo from "../components/PreviewDemo";

type Msg = { who: "pulse" | "user"; text: string; typing?: boolean };
const SSR_STABLE_GREETING = "Lo hacemos en lo que dura este sorbo.";

export default function ChatGuardado5() {
  const [msgs, setMsgs] = useState<Msg[]>([{ who: "pulse", text: SSR_STABLE_GREETING }]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState<{sector?:string|null; title?:string; note?:string|null} | null>(null);

  const listRef = useRef<HTMLDivElement>(null);

  // Sustituir saludo en cliente (evita hydration mismatch)
  useEffect(() => {
    setMsgs((m) => {
      if (!m.length) return [{ who: "pulse", text: frase("entrada") }];
      if (m[0].who === "pulse" && m[0].text === SSR_STABLE_GREETING) {
        const replaced = [...m];
        replaced[0] = { who: "pulse", text: frase("entrada") };
        return replaced;
      }
      return m;
    });
  }, []);

  // Auto-scroll solo cuando hay overflow
  useEffect(() => {
    listRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
  }, [msgs.length]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    // push user
    setMsgs((m) => [...m, { who: "user", text }]);
    setInput("");
    setSending(true);

    // typing
    setMsgs((m) => [...m, { who: "pulse", text: "__typing__", typing: true }]);

    try {
      const r = await fetch("/api/pulse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const data = await r.json();
      const reply = (data?.text as string) || "Listo ☕⚡.";

      // Reemplazar typing por respuesta real
      setMsgs((m) => [...m.filter((x) => !x.typing && x.text !== "__typing__"), { who: "pulse", text: reply }]);

      // PREVIEW: si tenemos sector o lo inferimos, mostramos mini-demo
      const sector = (data?.meta?.sector as string | null) || sectorize(text) || null;
      const note = (data?.meta?.next_step as string | null) || null;
      const title = text.length > 4 ? text : "Tu web lista";
      setPreview({ sector, title, note });
    } catch {
      setMsgs((m) => [
        ...m.filter((x) => !x.typing && x.text !== "__typing__"),
        { who: "pulse", text: "Oops… derramé un espresso en el CSS. Dame 2 segundos 😅☕." }
      ]);
    } finally {
      setSending(false);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Utilidad: decide si mostramos scroll interno o no según nº mensajes
  const fewMsgs = msgs.filter(m=>!m.typing && m.text!=="__typing__").length <= 3;

  return (
    <main
      style={{
        minHeight: "100svh",
        background:
          "radial-gradient(1200px 600px at 20% 0%, rgba(56,189,248,.08), transparent), linear-gradient(180deg, #030712, #020617)",
        display: "grid",
        placeItems: "center",
        padding: "32px 20px"
      }}
      aria-live="polite"
    >
      <div
        style={{
          width: "min(1200px, 96vw)",
          display: "grid",
          gridTemplateColumns: "minmax(280px, 420px) 1fr",
          gap: 24
        }}
      >
        {/* Columna izquierda: Pulse */}
        <section
          style={{
            borderRadius: 20,
            background: "linear-gradient(180deg, rgba(4,12,24,.8), rgba(2,6,23,.6))",
            border: "1px solid rgba(56,189,248,.20)",
            boxShadow: "0 24px 80px rgba(0,0,0,.55), 0 0 40px rgba(56,189,248,.12) inset",
            padding: 16,
            display: "grid",
            alignContent: "start",
            gap: 16
          }}
        >
          <div
            style={{
              position: "relative",
              borderRadius: 24,
              padding: 18,
              background: "radial-gradient(500px 220px at 50% 20%, rgba(56,189,248,.14), transparent), rgba(2,6,23,.6)",
              border: "1px solid rgba(56,189,248,.25)",
              boxShadow: "0 20px 60px rgba(0,0,0,.45)"
            }}
          >
            <Image
              src="/pulse/pulse-neutral-coffee-4k.png"
              alt="Pulse con taza de café"
              width={720}
              height={900}
              priority
              style={{ width: "100%", height: "auto", display: "block", filter: "drop-shadow(0 10px 40px rgba(56,189,248,.25))" }}
            />
          </div>

          <div
            style={{
              borderRadius: 16,
              padding: "16px 18px",
              background: "rgba(15,23,42,.6)",
              border: "1px solid rgba(56,189,248,.18)",
              color: "#E6F6FF"
            }}
          >
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Tu web antes de que se te enfríe el café</h2>
            <p style={{ margin: "8px 0 0", fontSize: 13, opacity: 0.9 }}>
              Describe tu idea → recibes propuesta y preview. Privacidad primero • Sin SPAM
            </p>
          </div>
        </section>

        {/* Columna derecha: Chat + Preview */}
        <section
          style={{
            borderRadius: 20,
            background: "linear-gradient(180deg, rgba(4,12,24,.85), rgba(2,8,20,.65))",
            border: "1px solid rgba(56,189,248,.18)",
            boxShadow: "0 24px 80px rgba(0,0,0,.55)",
            padding: 20,
            display: "grid",
            gridTemplateRows: "auto 1fr auto auto",
            gap: 14
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <h1 style={{ color: "#E6F6FF", fontSize: 28, fontWeight: 800, letterSpacing: 0.3, margin: 0 }}>Chat con Pulse</h1>
          </div>

          {/* Mensajes: sin scrollbar si hay pocos; con scrollbar solo cuando crece */}
          <div
            ref={listRef}
            style={{
              minHeight: fewMsgs ? "180px" : "58svh",
              maxHeight: fewMsgs ? "none" : "58svh",
              overflowY: fewMsgs ? "visible" : "auto",
              display: "grid",
              gap: 12,
              paddingRight: 6
            }}
          >
            {msgs.map((m, i) => (
              <div
                key={i}
                style={{
                  justifySelf: m.who === "pulse" ? "start" : "end",
                  maxWidth: "68ch",
                  borderRadius: 18,
                  padding: "14px 16px",
                  background:
                    m.who === "pulse"
                      ? "linear-gradient(180deg, rgba(15,23,42,.85), rgba(2,6,23,.7))"
                      : "rgba(148,163,184,.12)",
                  border:
                    m.who === "pulse"
                      ? "1px solid rgba(56,189,248,.28)"
                      : "1px solid rgba(148,163,184,.28)",
                  color: m.who === "pulse" ? "#E6F6FF" : "#E5E7EB",
                  boxShadow:
                    m.who === "pulse"
                      ? "0 12px 40px rgba(0,0,0,.45), 0 0 28px rgba(56,189,248,.14)"
                      : "0 10px 32px rgba(0,0,0,.35)"
                }}
              >
                {m.typing ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                    <span style={{ marginLeft: 10, opacity: 0.85 }}>Pensando…</span>
                  </span>
                ) : (
                  <span>{m.text}</span>
                )}
              </div>
            ))}
          </div>

          {/* PREVIEW DEMO */}
          {preview && (
            <PreviewDemo sector={preview.sector || undefined} title={preview.title} note={preview.note || undefined} />
          )}

          {/* Input + botón */}
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <input
              aria-label="Escribe tu idea"
              placeholder="Ej: quiero una web para mi cafetería ☕ con carta y WhatsApp"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              style={{
                flex: 1,
                padding: "14px 16px",
                borderRadius: 14,
                border: "1px solid rgba(251,191,36,.45)",
                background: "rgba(255,255,255,.04)",
                color: "#E5F6FF",
                outline: "none",
                boxShadow: "0 0 0 0 rgba(56,189,248,0)"
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = "0 0 0 4px rgba(56,189,248,.18)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = "0 0 0 0 rgba(56,189,248,0)";
              }}
            />
            <button
              onClick={handleSend}
              disabled={sending}
              style={{
                minWidth: 120,
                padding: "12px 16px",
                borderRadius: 14,
                border: "1px solid #FFD700",
                color: "white",
                fontWeight: 800,
                background: "linear-gradient(180deg,#FFB648,#FF9F45)",
                boxShadow: "0 10px 30px rgba(255,159,69,.35)",
                opacity: sending ? 0.65 : 1,
                transform: sending ? "scale(.98)" : "scale(1)",
                transition: "transform .12s ease, opacity .12s ease"
              }}
              aria-busy={sending}
            >
              {sending ? "Sirviendo ☕…" : "Enviar"}
            </button>
          </div>

          <p style={{ margin: "4px 2px 0", color: "#9CCEEB", fontSize: 12, opacity: 0.8 }}>
            Enter para enviar • Shift+Enter salto de línea • “Tu web antes de que se te enfríe el café ☕⚡”
          </p>
        </section>
      </div>

      {/* CSS local para los puntos de typing */}
      <style jsx>{`
        .dot { width: 6px; height: 6px; border-radius: 999px; background: #38bdf8; opacity: 0.5; display: inline-block; animation: pulseDots 1.2s infinite ease-in-out; }
        .dot:nth-child(2) { animation-delay: 0.15s; }
        .dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes pulseDots { 0%,100% { transform: translateY(0); opacity: 0.5; } 50% { transform: translateY(-3px); opacity: 1; } }
      `}</style>
    </main>
  );
}
