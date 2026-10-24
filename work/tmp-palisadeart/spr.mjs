import { openPage } from '../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try { const r = await pg.evalp(`(async()=>{const S=BK.SPR;const o={};for(const k of ['sprig','rockgoblin','brute','shield','archer','sporeling']){const s=S[k];o[k]=s&&{n:s.R.length,w:s.R[0].width,h:s.R[0].height,ax:s.ax,ay:s.ay,sw:s.w,sh:s.h};}return JSON.stringify(o);})()`, 60000); console.log(r); } finally { await pg.close(); }
process.exit(0);
