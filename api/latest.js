import { list } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({error:'Method not allowed'});
  try {
    const result = await list({prefix:'apks/'});
    const latest = result.blobs.sort((a,b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0] || null;
    if (!latest) return res.status(200).json({latest:null});
    const metadataPath = `metadata/${latest.pathname.replace(/^apks\//, '').replaceAll('/', '_')}.json`;
    const metadataList = await list({prefix: metadataPath});
    let metadata = {};
    const metadataBlob = metadataList.blobs.find(item => item.pathname === metadataPath);
    if (metadataBlob) { try { metadata = await (await fetch(metadataBlob.url)).json(); } catch {} }
    return res.status(200).json({latest: {url: latest.url, pathname: latest.pathname, size: latest.size, uploadedAt: latest.uploadedAt, version: metadata.version || ''}});
  } catch {
    return res.status(500).json({error:'APK storage is not configured yet.'});
  }
}
