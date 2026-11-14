// PAGE TOOL: launches headless Chrome
// tools/arena-straw-shots.mjs - THE STRAW CAST's screenshots (claude/arenastraw): each dummy idle, mid-attack and (the two swordsmen) at the white parry FLASH.
// node tools/arena-straw-shots.mjs   -> scratch/lane-reports/arenayard/straw-*.png   (one browser, simulated frames; poses are set by hand and drawn without a sim step)
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const OUT = process.env.SHOTS || join(ROOT, '..', 'scratch', 'lane-reports', 'arenayard'); mkdirSync(OUT, { recursive: true });
const pg = await openPage({ audio: false, fonts: false, seed: 11 }); const E = e => pg.evalp(e);
let ok = true; const chk = (n, c, x) => { if (!c) ok = false; console.log((c ? 'ok   ' : 'FAIL ') + n + (x === undefined ? '' : '  ' + x)); };
try {
  await E(`(async()=>{const {LEVELS}=await import('/src/level.js');window.__IDX=LEVELS.findIndex(l=>l.id==='arena_yard');
    window.__go=h=>{BK.manualSimulation=true;for(const k in BK.keys)BK.keys[k]=false;BK.setHero(h);BK.reset({fresh:true});BK.applyUpgrades();BK.load(__IDX);BK.start();BK.god=false;BK.sim(30);};
    window.__ent=(t,i)=>BK.enemies().filter(e=>e.t===t).sort((a,b)=>a.x-b.x)[i];})()`);
  await E(`__go('knight')`);
  const skins = await E(`BK.enemies().filter(e=>e.t==='swornsword'||e.t==='archer').sort((a,b)=>a.x-b.x).map(e=>e.t+':'+e.cnSkin).join(',')`);
  chk('skins', skins === 'swornsword:strawsword,swornsword:strawflash,archer:strawbow', skins);
  const other = await E(`BK.enemies().filter(e=>e.t!=='swornsword'&&e.t!=='archer'&&e.cnSkin).length`); chk('no other foe reskinned', other === 0, other);
  const shot = async (n, clip0) => { const clip = n.startsWith('bow') ? Object.assign({}, clip0, { x: 149 + 166 * 3 }) : clip0; await E('BK.draw1()'); const r = await pg.send('Page.captureScreenshot', Object.assign({ format: 'png' }, clip ? { clip } : {})); writeFileSync(join(OUT, 'straw-' + n + '.png'), Buffer.from((r.result || r).data, 'base64')); };
  /* the 960x540 game area sits at (149,41) in the 1258x622 headless page, 3x; the camera follows the hero, who stands 44 px left of the dummy */
  const clip = { x: 149 + 134 * 3, y: 41 + 88 * 3, width: 52 * 3, height: 46 * 3, scale: 5 };
  for (const [id, t, col, idx] of [['sword-slow', 'swornsword', 98, 0], ['sword-flash', 'swornsword', 116, 1], ['bow', 'archer', 142, 0]]) {
    await E(`(()=>{const p=BK.players()[0];p.x=${col}*16+8;p.y=22*16-0.01;p.vx=0;p.vy=0;p.face=1;p.ground=true;BK.sim(60);})()`);
    await E(`(()=>{const p=BK.players()[0],e=__ent('${t}',${idx});p.x=e.x-44;p.y=e.y-0.01;p.face=1;BK.sim(160);})()`);
    const pose = (js) => E(`(()=>{const e=__ent('${t}',${idx});${js}})()`);
    await pose(`e.mode='walk';e.vx=0;e.draw=0;e.loose=0;e.cd=99;e.face=-1;`); await shot(id + '-idle', clip);
    if (t === 'swornsword') {
      await pose(`e.mode='cutTell';e.modeT=0.5;e.glint=0;e._twAt=-99;`); await shot(id + '-tell', clip);
      await pose(`e.mode='cut';e.modeT=0.22;`); await shot(id + '-cut', clip);
      /* the FLASH: sim until the game fires its own glint + white frame (the slow dummy has none), then draw that very frame */
      const gl = await E(`(()=>{const e=__ent('${t}',${idx});e.mode='cutTell';e.modeT=0.6;e.glint=0;e._twAt=-99;for(let i=0;i<120&&!e.glint;i++)BK.sim(1);return e.glint+':'+(e._twAt>0)})()`);
      if (idx === 1) chk(id + ' flash fires', String(gl).startsWith('1'), gl); else chk(id + ' slow dummy has no glint', String(gl).startsWith('0'), gl);
      await shot(id + '-flash', clip);
    } else {
      for (const [nm, d, l] of [['draw', 0.5, 0], ['full', 0.2, 0], ['loose', 0, 0.3]]) { await pose(`e.mode='walk';e.draw=${d};e.loose=${l};`); await shot(id + '-' + nm, clip); }
    }
  }
  console.log('errors', pg.errors.length ? pg.errors.slice(0, 5) : 'none'); chk('no page errors', pg.errors.length === 0);
} finally { pg.close(); }
process.exit(ok ? 0 : 1);
