import type { NextApiRequest, NextApiResponse } from "next";
import { generate } from "@/lib/pulsekit/generator.v01";
export default function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method!=="POST") return res.status(405).json({error:"Method Not Allowed"});
  const body=typeof req.body==="string"?JSON.parse(req.body||"{}"):req.body||{};
  const plan=(process.env.PULSE_PLAN||"demo") as "demo"|"expansion"|"diamond";
  const data=generate({prompt: body.prompt||"Website demo", lang: body.lang||"es", theme: body.theme, plan});
  res.status(200).json(data);
}
