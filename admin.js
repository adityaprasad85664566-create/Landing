import { upload } from '@vercel/blob/client';

const $ = (id) => document.getElementById(id);
const message = (text, error = false) => {
  $('message').textContent = text;
  $('message').className = error ? 'message error' : 'message';
  $('message').hidden = false;
};
async function api(url, options = {}) {
  const response = await fetch(url, { credentials: 'same-origin', ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}
function showPanel(loggedIn) {
  $('loginCard').hidden = loggedIn;
  $('panel').hidden = !loggedIn;
}
async function refreshFiles() {
  const data = await api('/api/apks');
  const files = $('files');
  if (!data.blobs.length) {
    files.innerHTML = '<p class="empty">No APKs uploaded yet.</p>';
    return;
  }
  files.replaceChildren();
  for (const blob of data.blobs) {
    const item = document.createElement('div');
    item.className = 'file';
    const info = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = blob.pathname.split('/').pop();
    const detail = document.createElement('small');
    detail.textContent = `${(blob.size / 1048576).toFixed(1)} MB · ${new Date(blob.uploadedAt).toLocaleString()}`;
    info.append(title, detail);
    const link = document.createElement('a');
    link.href = blob.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = 'Open file ↗';
    item.append(info, link);
    files.append(item);
  }
}
async function checkSession() {
  try {
    await api('/api/me');
    showPanel(true);
    await refreshFiles();
  } catch {
    showPanel(false);
  }
}
$('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    await api('/api/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({password:$('password').value}) });
    $('password').value = '';
    message('Signed in successfully.');
    showPanel(true);
    await refreshFiles();
  } catch (error) { message(error.message, true); }
});
$('uploadForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const file = $('apk').files[0];
  if (!file) return;
  if (!file.name.toLowerCase().endsWith('.apk')) { message('Choose an .apk file.', true); return; }
  const button = $('uploadButton');
  button.disabled = true;
  $('progress').hidden = false;
  $('progressBar').style.width = '0%';
  $('progressText').textContent = 'Preparing secure upload…';
  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-100);
    await upload(`apks/${Date.now()}-${safeName}`, file, {
      access: 'public',
      handleUploadUrl: '/api/blob-upload',
      clientPayload: JSON.stringify({version:$('version').value.trim(), notes:$('notes').value.trim()}),
      onUploadProgress: (event) => {
        $('progressBar').style.width = `${event.percentage}%`;
        $('progressText').textContent = `Uploading: ${Math.round(event.percentage)}%`;
      }
    });
    message('APK uploaded. The landing page now serves the latest upload.');
    $('uploadForm').reset();
    $('progressText').textContent = 'Upload complete.';
    await refreshFiles();
  } catch (error) {
    message(error.message || 'Upload failed. Check Blob configuration and file size.', true);
    $('progressText').textContent = '';
  } finally { button.disabled = false; }
});
$('logout').addEventListener('click', async () => {
  try { await api('/api/logout', {method:'POST'}); } catch {}
  showPanel(false);
  message('Signed out.');
});
checkSession();
