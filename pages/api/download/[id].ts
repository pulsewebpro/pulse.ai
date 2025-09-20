import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export const config = { api: { bodyParser: false } };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const zipPath = path.join("/tmp", `${id}.zip`);
  if (!fs.existsSync(zipPath)) return res.status(404).end();
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename="pulse-web-${id}.zip"`);
  fs.createReadStream(zipPath).pipe(res);
}
