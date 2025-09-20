export type WebzipResult = {
  filename: string;
  mime: string;
  data: Buffer;
  meta: { stub: true; version: 'v02' };
};

export function generateWebzipV02(_params: any): WebzipResult {
  return {
    filename: 'pulse-demo-v02.zip',
    mime: 'application/zip',
    data: Buffer.from([]),
    meta: { stub: true, version: 'v02' },
  };
}

export const generateWebZipV02 = generateWebzipV02;
export default generateWebzipV02;
