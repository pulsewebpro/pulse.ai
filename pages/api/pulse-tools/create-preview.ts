import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const dest = '/pulse-v2';
  res.writeHead(307, { Location: dest });
  res.end();
}
