import fs from 'node:fs/promises';
import { gameSlug } from './game-metadata.mjs';
import path from 'node:path';
import { parseEnv } from 'node:util';
const root=path.resolve(process.argv[2]??'.');
let local={};
try { local=parseEnv(await fs.readFile(path.join(root,'.env'),'utf8')); } catch(e) { if(e.code!=='ENOENT')throw e; }
const key=process.env.STEAM_WEB_API_KEY||local.STEAM_WEB_API_KEY;
if(!key)throw Error('Set STEAM_WEB_API_KEY in the environment or content root .env');
const profile=await fs.readFile(path.join(root,'config/profile.yaml'),'utf8');
const steamid=profile.match(/steamcommunity\.com\/profiles\/(\d+)/)?.[1];
if(!steamid)throw Error('A numeric Steam profile URL is required in config/profile.yaml');
const endpoint=new URL('https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/');
for(const [k,v] of Object.entries({steamid,include_appinfo:'1',include_played_free_games:'1'}))endpoint.searchParams.set(k,v);
let response;
try { const res=await fetch(endpoint,{headers:{'x-webapi-key':key},signal:AbortSignal.timeout(30000)});if(!res.ok)throw Error();response=(await res.json()).response; } catch { throw Error('Steam library request failed; credentials have not been logged.'); }
if(!Array.isArray(response?.games))throw Error('Steam returned no visible library; existing content was preserved.');
const dir=path.join(root,'content/games');await fs.mkdir(dir,{recursive:true});
const existing=new Map();
for(const item of await fs.readdir(dir,{withFileTypes:true}))if(item.isDirectory()) { const file=path.join(dir,item.name,'index.md');try{const text=await fs.readFile(file,'utf8');const id=text.match(/^steamAppId:\s*(\d+)/m)?.[1];if(id)existing.set(Number(id),{file,text});}catch(e){if(e.code!=='ENOENT')throw e;} }
const occupied = new Set(await fs.readdir(dir));
let created=0,updated=0;
for(const game of response.games) {
 const hours=Math.round(game.playtime_forever/6)/10;
 const date=game.rtime_last_played>0?new Date(game.rtime_last_played*1000).toISOString().slice(0,10):null;
 const old=existing.get(game.appid);
 if(old){let text=old.text;const end=text.indexOf('\n---',3);let head=text.slice(0,end);for(const [name,value]of Object.entries({hours,lastPlayed:date})){if(value===null)continue;const re=new RegExp('^'+name+':.*$','m');head=re.test(head)?head.replace(re,name+': '+value):head+'\n'+name+': '+value;}await fs.writeFile(old.file,head+text.slice(end));updated++;continue;}
 const slug=gameSlug(game.name,game.appid,occupied);occupied.add(slug);
 const folder=path.join(dir,slug);await fs.mkdir(folder,{recursive:true});
 let cover='';try{const r=await fetch('https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/'+game.appid+'/header.jpg',{signal:AbortSignal.timeout(15000)});if(r.ok&&r.headers.get('content-type')?.startsWith('image/')){await fs.writeFile(path.join(folder,'cover.jpg'),Buffer.from(await r.arrayBuffer()));cover='./cover.jpg';}}catch{}
 const text=['---','title: '+JSON.stringify(game.name),'kind: product','status: ""','hours: '+hours,...(date?['lastPlayed: '+date]:[]),'platforms: [Steam]','tags: []','summary: ""','steamAppId: '+game.appid,'cover: '+JSON.stringify(cover),'links:','  - label: Steam','    url: https://store.steampowered.com/app/'+game.appid+'/','draft: true','---','',''].join('\n');
 await fs.writeFile(path.join(folder,'index.md'),text);created++;
}
console.log(JSON.stringify({received:response.games.length,created,updated}));
