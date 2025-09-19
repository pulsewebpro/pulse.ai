import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>Pulse · Te creo tu web</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="IA creativa que genera tu web personalizada en segundos." />
      </Head>

      <main>
        <section className="hero">
          <div className="hero__inner">
            <h1 className="title">TE CREO TU WEB</h1>

            <p className="kicker">Antes de que se te enfríe el café.</p>

            <p className="subtitle">
              <span className="line">IA CREATIVA QUE GENERA TU WEB PERSONALIZADA EN</span>
              <span className="line">EN SEGUNDOS.</span>
            </p>

            <div className="hero__spacer" />

            <Link
              href="/chat"
              aria-label="Diseñar mi web"
              className="cta"
              onMouseDown={(e) => {
                const img = e.currentTarget.querySelector("img") as HTMLImageElement | null;
                if (img) img.src = "/ui/ui-button-zafiro-pressed-es.png";
              }}
              onMouseUp={(e) => {
                const img = e.currentTarget.querySelector("img") as HTMLImageElement | null;
                if (img) img.src = "/ui/ui-button-zafiro-es.png";
              }}
            >
              <img src="/ui/ui-button-zafiro-es.png" alt="Diseñar mi web" draggable={false} />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
