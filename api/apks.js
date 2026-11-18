import { list } from '@vercel/blob';
import { requireAdmin } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({error:'Method not allowed'});
  if (!requireAdmin(req, res)) return;
  try {
    const result = await list({prefix:'apks/'});
    const blobs = result.blobs.sort((a,b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    return res.status(200).json({blobs});
  } catch (error) {
    return res.status(500).json({error:'Could not read Blob storage. Check BLOB_READ_WRITE_TOKEN.'});
  }
}
