import fs from 'node:fs/promises';
import path from 'node:path';
import { parseStoreTags, selectGameplayTags } from './game-metadata.mjs';

const root = path.resolve(process.argv[2] ?? '.');
const cache = path.join(root, '.work/steam-tags');
await fs.mkdir(cache, { recursive: true });
const results = [];
for (const entry of await fs.readdir(path.join(root, 'content/games'), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const file = path.join(root, 'content/games', entry.name, 'index.md');
  const text = await fs.readFile(file, 'utf8');
  const appid = text.match(/^steamAppId:\s*(\d+)/m)?.[1];
  // Editorial tags are authoritative. This tool only fills explicitly empty arrays.
  if (!appid || !/^tags:\s*\[\s*\][ \t]*$/m.test(text)) continue;
  try {
    let tags;
    const cached = path.join(cache, `${appid}.json`);
    try { tags = JSON.parse(await fs.readFile(cached, 'utf8')).tags; } catch {}
    if (!Array.isArray(tags) || process.argv.includes('--refresh')) {
      const response = await fetch(`https://store.steampowered.com/app/${appid}/?l=english`, { signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      tags = parseStoreTags(await response.text());
      if (!tags.length) throw new Error('No store tags (unavailable page or age gate)');
      await fs.writeFile(cached, JSON.stringify({ appid, tags, fetchedAt: new Date().toISOString() }, null, 2));
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    const selected = selectGameplayTags(tags);
    if (selected.length) await fs.writeFile(file, text.replace(/^tags:\s*\[\s*\][ \t]*$/m, `tags: ${JSON.stringify(selected)}`));
    results.push({ appid, status: selected.length ? 'updated' : 'no-gameplay-tags', tags: selected });
  } catch (error) {
    results.push({ appid, status: 'failed', reason: error.message });
  }
  console.log(appid, results.at(-1).status);
}
await fs.writeFile(path.join(cache, 'status.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results.reduce((counts, item) => ({ ...counts, [item.status]: (counts[item.status] ?? 0) + 1 }), {})));
