// Fetches frames off the main thread so decoding never competes with scroll.
self.addEventListener('message', async (e) => {
  if (e.data.type !== 'frames') return;
  const blobs = await Promise.all(
    e.data.payload.frames.map(async (url) => {
      try { return { url, blob: await (await fetch(url)).blob() }; }
      catch { return null; }
    })
  );
  self.postMessage({ type: 'blobs', payload: { blobs: blobs.filter(Boolean) } });
});
