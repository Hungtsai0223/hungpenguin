import { mkdir, writeFile, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { readFile } from 'node:fs/promises';
const data = JSON.parse(await readFile(new URL('../src/data/portfolio.json', import.meta.url), 'utf8'));
await Promise.all(data.reels.map(async reel => {
  const dest = resolve('public', reel.localCover.slice(1));
  try { await access(dest); return; } catch {}
  try {
    const response = await fetch(reel.cover, { signal: AbortSignal.timeout(12000), headers: { 'Accept': 'image/jpeg,image/*' } });
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error('Invalid image response ' + response.status);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 1000 || bytes.length > 5000000) throw new Error('Unexpected image size');
    await mkdir(dirname(dest), {recursive:true});
    await writeFile(dest, bytes);
    console.log('Saved original Reel cover:', reel.localCover, bytes.length);
  } catch(error) { console.warn('Reel cover local copy unavailable; using official source URL:', reel.localCover, error.message); }
}));
