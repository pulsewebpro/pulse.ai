import type { NextApiRequest, NextApiResponse } from 'next';
import { selectTemplate } from '../../lib/dj/selectTemplate';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const brief = (typeof body?.brief === 'string') ? body.brief : (body?.brief?.brief || '');
    const mem  = body?.mem || {};
    const intent = { objective: mem.objective, sector: mem.sector, brief };

    const { selection, copy } = selectTemplate(intent);
    if (!selection) return res.status(200).json({ ok: false, error: 'no_templates' });

    return res.status(200).json({ ok: true, selection, copy });
  } catch (e:any) {
    return res.status(200).json({ ok: false, error: String(e?.message || e) });
  }
}
