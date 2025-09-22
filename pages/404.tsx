import Image from "next/image";
import Link from "next/link";

export default function Custom404() {
  return (
    <main style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: "linear-gradient(180deg,#0b111b 0%,#0e1622 100%)",
      color: "#dbeafe",
      padding: "2rem"
    }}>
      <div style={{
        maxWidth: 880,
        width: "100%",
        textAlign: "center",
        border: "1px solid rgba(255,255,255,.08)",
        background: "rgba(2,6,23,.6)",
        borderRadius: 16,
        padding: "2rem",
        boxShadow: "0 10px 30px rgba(0,0,0,.35)"
      }}>
        <div style={{ position: "relative", width: "100%", height: 360, marginBottom: 24 }}>
          <Image
            src="/pulse-oops-coffee-4k.png"
            alt="Página no encontrada"
            fill
            style={{ objectFit: "contain", filter: "drop-shadow(0 10px 20px rgba(0,0,0,.5))" }}
            priority
          />
        </div>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>404 · Esta página no existe</h1>
        <p style={{ opacity: .8, marginBottom: 20 }}>
          No pasa nada. Vuelve al chat y dime qué quieres y te lo monto.
        </p>
        <Link href="/chat" style={{
          display: "inline-block",
          background: "#0ea5e9",
          color: "#00131f",
          padding: "10px 16px",
          borderRadius: 10,
          fontWeight: 700
        }}>
          Ir al chat
        </Link>
      </div>
    </main>
  );
}
