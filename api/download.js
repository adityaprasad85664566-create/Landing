import { list } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Method not allowed');
  try {
    const result = await list({prefix:'apks/'});
    const latest = result.blobs.sort((a,b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
    if (!latest) return res.status(404).send('No APK has been uploaded yet.');
    return res.redirect(302, latest.url);
  } catch {
    return res.status(500).send('APK storage is not configured.');
  }
}
