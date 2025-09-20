/** Stub mínimo para compilar y desplegar en DEMO. */
export type WebzipResult = {
  filename: string;
  mime: string;
  data: Buffer;
  meta: { stub: true; version: 'v01' };
};

export function generateWebzipV01(_params: any): WebzipResult {
  return {
    filename: 'pulse-demo.zip',
    mime: 'application/zip',
    data: Buffer.from([]),
    meta: { stub: true, version: 'v01' },
  };
}

/* Alias para llamadas que usan Z mayúscula */
export const generateWebZipV01 = generateWebzipV01;

/* Export default por si algún sitio lo importa así */
export default generateWebzipV01;
