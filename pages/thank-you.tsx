import Head from "next/head";

export default function ThankYou(){
  return (
    <main style={{minHeight:"100vh",background:"#0a0a0a",color:"#e6f3ff",display:"grid",placeItems:"center",padding:"24px"}}>
      <Head><title>Gracias · Pulse</title></Head>
      <div style={{maxWidth:720,textAlign:"center"}}>
        <h1 style={{fontSize:36,fontWeight:800,marginBottom:8}}>¡Gracias! ☕⚡</h1>
        <p style={{opacity:.9}}>Tu checkout se ha simulado correctamente. Un humano de Pulse te acompaña en el siguiente paso.</p>
        <a href="/chat" style={{display:"inline-block",marginTop:18,padding:"10px 16px",borderRadius:12,
          background:"#FFD700",color:"#0A0A0A",fontWeight:800,textDecoration:"none"}}>Volver al chat</a>
      </div>
    </main>
  );
}
