// PAGE TOOL: launches headless Chrome
// tools/demoaudit-shots.mjs - stills of the demo levels along the main route (claude/demoaudit). node tools/demoaudit-shots.mjs <id>[,<id>] [--at=x,y;x,y]  -> scratch/lane-reports/demoaudit/shot-<id>-<n>.png
import { openPage, ROOT } from './cdp.mjs';
import { pacing } from './pacing.mjs';
import { LEVELS } from '../src/level.js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const OUT = process.env.SHOTS || join(ROOT, '..', 'scratch', 'lane-reports', 'demoaudit'); mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const ids = args.filter(a => !a.startsWith('-')).flatMap(a => a.split(','));
const pg = await openPage({ audio: false, fonts: false, seed: 11 }); const E = e => pg.evalp(e);
const shot = async n => { await E('BK.draw1()'); const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(OUT, 'shot-' + n + '.png'), Buffer.from(r.result.data, 'base64')); console.log('shot', n); };
try {
  await E(`(async()=>{const {LEVELS}=await import('/src/level.js');window.__LV=LEVELS;window.__go=(id)=>{BK.manualSimulation=true;for(const k in BK.keys)BK.keys[k]=false;BK.setHero('knight');BK.reset({fresh:true});BK.applyUpgrades();BK.load(LEVELS.findIndex(l=>l.id===id));BK.start();BK.sim(260);};
    window.__at=(tx,ty)=>{const p=BK.players()[0];p.x=tx*16+8;p.y=ty*16+8;p.vx=0;p.vy=0;BK.sim(40);};})()`);
  for (const id of ids) {
    const lv = LEVELS.find(l => l.id === id); const at0 = opt("at", ""); const P = at0 ? { route: [] } : pacing(lv), R = P.route, L0 = lv.build();
    await E(`__go('${id}')`);
    const pts = [];
    const at = opt('at', ''); if (at) at.split(';').forEach((s, i) => { const [x, y] = s.split(',').map(Number); pts.push(['at' + i, x, y]); });
    else { for (const f of [0, .2, .4, .6, .8]) { const [x, y] = R[Math.min(R.length - 1, Math.floor(f * R.length))]; pts.push(['r' + Math.round(f * 100), x, y]); }
      if (L0.arena) pts.push(['boss', Math.round((L0.arena.x0 + L0.arena.x1) / 32), Math.round(L0.arena.floor / 16) - 2]); }
    for (const [n, x, y] of pts) { await E(`__at(${x},${y})`); await shot(id + '-' + n); }
  }
  console.log('errors', pg.errors.length ? pg.errors.slice(0, 5) : 'none');
} finally { pg.close(); }
