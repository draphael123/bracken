// tools/rgart-shots.mjs - THE RED GORGE REWORK's art-pass pictures (claude/rgart): the Spillway climb and the Matriarch's ledge set. Not in the suite. god mode, a picture not a playtest.
//   usage: PORT=8897 node tools/rgart-shots.mjs <before|after> [name-filter]   -> work/claude/shots/rgart/<tag>/*.png (frames from the game's own canvas, 2x)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after', filt = process.argv[3] || '';
const out = join(ROOT, 'work/claude/shots/rgart', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: true });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = []; const filt = ${JSON.stringify(filt)};
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'redgorge'); const fresh = () => { BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4); };
    const snap = (name) => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const at = (name, x, y, lx, ly, n) => { if (filt && !name.includes(filt)) return; fresh(); BK.tp(x, y); run(n || 20); BK.look(lx ?? x, ly ?? y); run(2); BK.look(lx ?? x, ly ?? y); snap(name); };
    /* THE SPILLWAY */
    at('s1-crest', 51, 21);
    at('s2-shaft', 55, 40);
    at('s3-basin', 62, 61);
    at('s4-basket1', 67, 61, 69, 58);
    at('s5-west-ledges', 60, 45);
    at('s6-bridge', 66, 42, 70, 40);
    at('s7-basket2', 74, 42);
    at('s8-basket3', 79, 33, 80, 28);
    at('s9-head', 88, 21);
    at('s10-door', 92, 21);
    /* THE LEDGE: a fight staged by hand (a picture, not a fight) */
    { const led = (name, f, lx) => { if (filt && !name.includes(filt)) return; fresh(); BK.tp(98, 21); run(80); const e = BK.boss; if (!e) return; const S = window.__RM_S; f && f(e, S); BK.look(lx || 116, 18); run(2); f && f(e, S, 1); BK.look(lx || 116, 18); snap(name); };
      led('f1-ledge-W', (e, S) => { e.mode = 'sleep'; }, 104);
      led('f2-lever-marker', (e, S, again) => { if (S) { S.sluice.W = true; S.sluice.E = true; } e.mode = 'pounceTell'; e.modeT = 9; e.x = 96*16 + 9*16; e.y = 24*16; if (S) S.lure = 1; }, 112);
      led('f3-wave', (e, S) => { e.mode = 'walk'; e.modeT = 9; if (S) { S.wave = { x: 96*16 + 14*16, dir: 1 }; } }, 112);
      led('f4-baskets-up', (e, S) => { e.mode = 'wallRun'; e.modeT = 9; e.y = 160; if (S) { S.ph = 2; for (const k in S.press) { S.press[k].charge = 5; S.press[k].h = k === 'W' ? 0.9 : 0.45; } } }, 116);
      led('f5-baskets-dry', (e, S) => { e.mode = 'walk'; e.modeT = 9; if (S) S.ph = 2; }, 116);
      led('f6-tumble', (e, S) => { e.mode = 'fly'; e.modeT = 9; e.y = 14*16; e.x = 96*16 + 8*16; if (S) { S.fly = { then: 'knocked', t0: 1, tx: e.x, ty: 24*16 }; } }, 108);
      led('f7-stunned', (e, S) => { e.mode = 'stunned'; e.modeT = 9; e.open = 4; e.x = 96*16 + 9*16; e.y = 24*16; }, 112); }
    return res; })()`, 900000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/shots/rgart/' + tag + '/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
