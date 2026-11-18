import { handleUpload } from '@vercel/blob/client';
import { put } from '@vercel/blob';
import { validSession, sameOrigin } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  if (!sameOrigin(req) || !validSession(req)) return res.status(401).json({error:'Admin sign-in required.'});
  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!pathname.startsWith('apks/') || !pathname.toLowerCase().endsWith('.apk')) throw new Error('Only APK files are allowed.');
        let details = {};
        try { details = JSON.parse(clientPayload || '{}'); } catch {}
        return {
          allowedContentTypes: [
            'application/vnd.android.package-archive',
            'application/octet-stream',
            'application/zip'
          ],
          maximumSizeInBytes: 500 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({version: String(details.version || '').slice(0, 40), notes: String(details.notes || '').slice(0, 1000)})
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        let details = {};
        try { details = JSON.parse(tokenPayload || '{}'); } catch {}
        const metadataPath = `metadata/${blob.pathname.replace(/^apks\//, '').replaceAll('/', '_')}.json`;
        await put(metadataPath, JSON.stringify({pathname: blob.pathname, url: blob.url, size: blob.size, uploadedAt: blob.uploadedAt, version: details.version || '', notes: details.notes || ''}), {access: 'public', addRandomSuffix: false, contentType: 'application/json'});
      }
    });
    return res.status(200).json(jsonResponse);
  } catch (error) {
    return res.status(400).json({error:error.message || 'Could not authorize upload.'});
  }
}
