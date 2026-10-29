// tools/clanart-sheet.mjs - THE WAR CAIRN clan on one contact sheet (claude/warcairnart): PORT=.. node tools/clanart-sheet.mjs [keys..]  env: K=scale(6) OUT=file.png BASES=1 (also draw each base sheet's frames under it)
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
const keys = process.argv.slice(2).length ? process.argv.slice(2) : ['clanaxe', 'clanthrower', 'clanguard', 'clanchamp', 'clanrunner', 'drummer'];
const K = +(process.env.K || 6), OUTF = process.env.OUT || 'work/claude/lane-done/clanart-sheet.png', BASEOF = { clanaxe: 'soldier', clanthrower: 'javelin', clanguard: 'shield', clanchamp: 'heavy', clanrunner: 'berserker', drummer: 'acolyte' };
const pg = await openPage({ audio: false, fonts: false });
try {
  const png = await pg.evalp(`(async()=>{ const SPR=BK.SPR, keys=${JSON.stringify(keys)}, BASEOF=${JSON.stringify(BASEOF)}, K=${K}, withBase=${process.env.BASES ? 'true' : 'false'}; const rows=[];
    for (const k of keys) { if (SPR[k]) rows.push([k, SPR[k]]); if (withBase && BASEOF[k] && (SPR[BASEOF[k]]||SPR.runner)) rows.push([BASEOF[k]+' (base)', SPR[BASEOF[k]]||SPR.runner]); }
    let W=0,H=8; for (const [k,s] of rows) { W=Math.max(W, 8+s.R.length*(s.R[0].width*K+8)); H+= s.R[0].height*K+22; }
    const c=document.createElement('canvas'); c.width=W; c.height=H; const g=c.getContext('2d'); g.imageSmoothingEnabled=false; g.fillStyle='#4a4a56'; g.fillRect(0,0,W,H); let y=8;
    for (const [k,s] of rows) { let x=8; g.fillStyle='#fff'; g.font='11px monospace'; g.fillText(k+'  '+s.R.length+'f  '+s.R[0].width+'x'+s.R[0].height+' ax'+s.ax+' ay'+s.ay+' hit'+s.w+'x'+s.h, 8, y+10); y+=14;
      for (const f of s.R) { g.fillStyle='#62626e'; g.fillRect(x,y,f.width*K,f.height*K); g.drawImage(f,x,y,f.width*K,f.height*K); g.fillStyle='#f0f'; g.fillRect(x+s.ax*K-1, y+s.ay*K-1, 3, 3); x+=f.width*K+8; } y+=s.R[0].height*K+8; }
    return c.toDataURL('image/png'); })()`, 120000);
  mkdirSync(dirname(OUTF), { recursive: true }); writeFileSync(OUTF, Buffer.from(png.split(',')[1], 'base64')); console.log(OUTF);
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 3));
} finally { await pg.close(); }
process.exit(0);
