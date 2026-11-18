async function loadLatest() {
  const button = document.getElementById('downloadButton');
  const note = document.getElementById('downloadNote');
  try {
    const response = await fetch('/api/latest');
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not load APK details');
    if (!data.latest) {
      button.classList.add('disabled');
      button.removeAttribute('href');
      note.textContent = 'No APK has been uploaded yet. Please check back later.';
      return;
    }
    document.getElementById('version').textContent = data.latest.version || '—';
    document.getElementById('size').textContent = `${(data.latest.size / 1048576).toFixed(1)} MB`;
    note.textContent = `Latest upload: ${new Date(data.latest.uploadedAt).toLocaleDateString()}`;
  } catch {
    note.textContent = 'APK information is temporarily unavailable.';
  }
}
document.getElementById('share').addEventListener('click', async () => {
  const data = { title: document.title, url: location.href };
  if (navigator.share) { try { await navigator.share(data); } catch {} }
  else if (navigator.clipboard) { await navigator.clipboard.writeText(location.href); alert('Page link copied.'); }
});
document.getElementById('save').addEventListener('click', e => {
  e.currentTarget.textContent = e.currentTarget.textContent.includes('Save') ? '✓  Page saved' : '☆  Save page';
});
loadLatest();
