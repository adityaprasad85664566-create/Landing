import { requireAdmin } from '../lib/auth.js';
export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({error:'Method not allowed'});
  if (!requireAdmin(req, res)) return;
  return res.status(200).json({ok:true});
}
