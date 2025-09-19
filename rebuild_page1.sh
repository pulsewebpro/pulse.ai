#!/usr/bin/env bash
#
# PulseWebPro Page 1 Rebuild Script
#
# This script replaces an existing Next.js project with the exact
# cinematic landing page shown in your reference image. It rebuilds
# package definitions, configurations, pages, and styles, and
# copies the necessary image assets. Place this script in the root
# of your project along with the three image files:
#   - banner-hero-rightspace-v2-4k.png
#   - ui-button-zafiro-es.png
#   - ui-button-zafiro-pressed-es.png
# Then run it from your project directory (e.g. `bash rebuild_page1.sh`).
#
# Assumptions:
# - You have Node.js and npm installed.
# - You will manually run `npm install` after this script to install
#   the dependencies.

set -euo pipefail

echo "🧹 Cleaning old files..."
# Remove existing build and configuration artifacts
rm -rf node_modules .next dist coverage 2>/dev/null || true

# Remove any existing source directories
rm -rf pages styles public 2>/dev/null || true

echo "📁 Recreating folder structure..."
mkdir -p pages styles public/banner public/ui

echo "📝 Writing package.json..."
cat > package.json <<'JSON'
{
  "name": "pulsewebpro",
  "private": true,
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev -p 3010",
    "build": "next build",
    "start": "next start -p 3010"
  },
  "dependencies": {
    "next": "^14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.12.12",
    "@types/react": "^18.2.79",
    "@types/react-dom": "^18.2.25",
    "typescript": "^5.4.5",
    "tailwindcss": "^3.4.10",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38"
  }
}
JSON

echo "📝 Writing tsconfig.json..."
cat > tsconfig.json <<'JSON'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "es2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "baseUrl": ".",
    "paths": {
      "@/*": ["*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
JSON

echo "📝 Writing next-env.d.ts..."
cat > next-env.d.ts <<'TS'
/// <reference types="next" />
/// <reference types="next/image-types/global" />
TS

echo "📝 Writing Next.js config..."
cat > next.config.mjs <<'JS'
const nextConfig = {
  reactStrictMode: true,
};
export default nextConfig;
JS

echo "📝 Writing PostCSS and Tailwind config..."
cat > postcss.config.js <<'JS'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
JS

cat > tailwind.config.js <<'JS'
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
JS

echo "📝 Writing global styles..."
cat > styles/globals.css <<'CSS'
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #__next {
  height: 100%;
}

body {
  margin: 0;
  color: #ffffff;
  background-color: #000000;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

a {
  color: inherit;
  text-decoration: none;
}
CSS

echo "📝 Writing hero-specific styles..."
cat > styles/hero.css <<'CSS'
/* Hero section replicating the final design */

.hero {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background-color: #000000;
}

.hero-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  background: linear-gradient(to right, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.9) 100%);
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  width: 50%;
  max-width: 600px;
  padding-right: 5%;
  padding-left: 5%;
}

.hero-title {
  font-size: clamp(2.5rem, 6vw, 5rem);
  font-weight: 800;
  line-height: 1.1;
  color: #e6f9ff;
  text-shadow: 0 0 12px rgba(56,189,248,0.8), 0 2px 2px rgba(0,0,0,0.6);
  margin: 0;
}

.hero-tagline {
  margin-top: 0.5rem;
  font-size: clamp(1.3rem, 2.5vw, 2rem);
  font-weight: 700;
  color: #fbbf24;
}

.hero-description {
  margin-top: 1rem;
  font-size: clamp(0.85rem, 1.5vw, 1.2rem);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.75);
}

.hero-button {
  margin-top: 2rem;
  display: inline-block;
  cursor: pointer;
}

.hero-watermark {
  position: absolute;
  bottom: 24px;
  left: 24px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.65);
  font-size: 14px;
  font-weight: 700;
  z-index: 2;
  user-select: none;
}
CSS

echo "📝 Writing custom App and Document..."
cat > pages/_app.tsx <<'TSX'
import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import '@/styles/hero.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
TSX

cat > pages/_document.tsx <<'TSX'
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="es">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
TSX

echo "📝 Writing landing page..."
cat > pages/index.tsx <<'TSX'
import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const [pressed, setPressed] = useState(false);
  const buttonSrc = pressed
    ? '/ui/ui-button-zafiro-pressed-es.png'
    : '/ui/ui-button-zafiro-es.png';

  return (
    <>
      <Head>
        <title>PulseWebPro · Te creo tu web</title>
        <meta
          name="description"
          content="IA creativa que genera tu web personalizada en segundos."
        />
      </Head>
      <section className="hero">
        <div className="hero-image">
          <Image
            src="/banner/banner-hero-rightspace-v2-4k.png"
            alt="Robot sosteniendo una taza de café"
            fill
            priority
            style={{ objectFit: 'cover', objectPosition: 'left center' }}
          />
        </div>
        <div className="hero-overlay" />
        <div className="hero-watermark">N</div>
        <div className="hero-content">
          <h1 className="hero-title">TE CREO TU WEB</h1>
          <p className="hero-tagline">Antes de que se te enfríe el café.</p>
          <p className="hero-description">
            IA creativa que genera tu web personalizada en segundos.
          </p>
          <Link href="/chat">
            <div
              className="hero-button"
              onMouseDown={() => setPressed(true)}
              onMouseUp={() => setPressed(false)}
              onMouseLeave={() => setPressed(false)}
            >
              <Image
                src={buttonSrc}
                alt="Diseñar mi web"
                width={350}
                height={96}
                priority
              />
            </div>
          </Link>
        </div>
      </section>
    </>
  );
}
TSX

echo "📝 Writing chat placeholder..."
cat > pages/chat.tsx <<'TSX'
export default function Chat() {
  return (
    <div
      style={{
        height: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#000',
        color: '#38BDF8',
      }}
    >
      <h1 style={{ textAlign: 'center' }}>
        Hola, soy Pulse ⚡☕
        <br />
        Aquí irá el chat interactivo.
      </h1>
    </div>
  );
}
TSX

echo "🖼  Copying image assets..."
# Copy assets from the directory where this script resides. Expect files to be present.
cp "$(dirname "$0")/banner-hero-rightspace-v2-4k.png" public/banner/banner-hero-rightspace-v2-4k.png
cp "$(dirname "$0")/ui-button-zafiro-es.png" public/ui/ui-button-zafiro-es.png
cp "$(dirname "$0")/ui-button-zafiro-pressed-es.png" public/ui/ui-button-zafiro-pressed-es.png

echo "✅ Page 1 rebuild complete. Run 'npm install' followed by 'npm run dev' to start the server."