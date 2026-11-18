import { clearSession, sameOrigin } from '../lib/auth.js';
export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  if (!sameOrigin(req)) return res.status(403).json({error:'Origin not allowed'});
  clearSession(res);
  return res.status(200).json({ok:true});
}
