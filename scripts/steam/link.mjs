import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'yaml';

const root = path.resolve(process.argv[2] ?? '.');
const key = process.argv[3];
if (!key) throw new Error('Usage: node scripts/steam/link.mjs <content-root> <steamAppId|slug>');
const config = parse(await fs.readFile(path.join(root, 'config/site.yaml'), 'utf8'));
const gamesConfig = parse(await fs.readFile(path.join(root, 'config/games.yaml'), 'utf8'));
if (!gamesConfig.enable) throw new Error('Games are disabled');
const matches = [];
for (const entry of await fs.readdir(path.join(root, 'content/games'), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const text = await fs.readFile(path.join(root, 'content/games', entry.name, 'index.md'), 'utf8');
  const data = parse(text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '');
  if (entry.name === key || String(data.steamAppId) === key || data.aliases?.includes(key)) matches.push({ data, slug: entry.name });
}
if (matches.length !== 1) throw new Error(`Expected one game, found ${matches.length}`);
const { data, slug } = matches[0];
if (data.draft || gamesConfig.disabledIds?.includes(slug) || gamesConfig.disabledKeys?.includes(slug)) throw new Error('Game is unpublished or disabled');
const stable = data.steamAppId ? `steam-${data.steamAppId}` : slug;
const base = '/' + (config.base ?? '/').replace(/^\/+|\/+$/g, '');
const href = `${base === '/' ? '' : base}/games/${stable}/`;
console.log(`[${String(data.title).replace(/[\\\[\]]/g, '\\$&')}](${href})`);
