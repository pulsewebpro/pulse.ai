/**
 * Stub mínimo para compilar y desplegar.
 * Más adelante lo sustituimos por el generador real de ZIP.
 */
export async function generateWebzipV01(_params: any): Promise<any> {
  // estructura inocua que evita errores de tipos/uso
  return {
    filename: 'pulse-demo.zip',
    mime: 'application/zip',
    data: Buffer.from([]), // ZIP vacío; en demo no se usa esta ruta
    meta: { stub: true, version: 'v01' }
  };
}
