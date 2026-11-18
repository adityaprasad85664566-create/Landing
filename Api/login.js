import crypto from 'node:crypto';
import { createSession, setSession, sameOrigin } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  if (!sameOrigin(req)) return res.status(403).json({error:'Origin not allowed'});
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured || !process.env.SESSION_SECRET) return res.status(500).json({error:'Set ADMIN_PASSWORD and SESSION_SECRET in Vercel environment variables.'});
  const password = String(req.body?.password || '');
  const a = Buffer.from(password);
  const b = Buffer.from(configured);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(401).json({error:'Incorrect admin password.'});
  setSession(res, createSession());
  return res.status(200).json({ok:true});
}
