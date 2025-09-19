import Head from "next/head";
import Link from "next/link";

export default function ChatPage() {
  return (
    <>
      <Head>
        <title>Pulse · Chat</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main style={{minHeight:"100vh", background:"#000", color:"#fff", display:"grid", placeItems:"center", padding:"40px"}}>
        <div style={{textAlign:"center", maxWidth:720}}>
          <h1 style={{fontSize:"42px", lineHeight:1, margin:"0 0 12px"}}>Hola, soy Pulse ⚡☕</h1>
          <p style={{opacity:0.85, margin:"0 0 24px"}}>
            Aquí irá el constructor guiado. Placeholder seguro por ahora.
          </p>
          <Link href="/" style={{textDecoration:"underline"}}>Volver</Link>
        </div>
      </main>
    </>
  );
}
