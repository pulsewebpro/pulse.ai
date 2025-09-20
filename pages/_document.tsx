import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Custom Document to control the initial HTML structure.
 */
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