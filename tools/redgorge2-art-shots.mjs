// tools/redgorge2-art-shots.mjs - RED GORGE 2's art-pass pictures (claude/redgorge2). Not in the suite. god mode, a picture not a playtest.
//   usage: PORT=8672 node tools/redgorge2-art-shots.mjs <before|after> [name-filter]   -> work/claude/redgorge2-art/<tag>/*.png (frames from the game's own canvas, 2x)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after', filt = process.argv[3] || '';
const out = join(ROOT, 'work/claude/redgorge2-art', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: true });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = []; const filt = ${JSON.stringify(filt)};
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'redgorge'); const fresh = () => { BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4); };
    const snap = (name) => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const phase = (p) => { for (let i = 0; i < 2000 && BK.redgorge().phase !== p; i++) { BK.redgorge().t = Math.min(BK.redgorge().t, 0.02); BK.sim(1); } if (p === 'flood') BK.sim(20); };
    const at = (name, x, y, ph, n) => { if (filt && !name.includes(filt)) return; fresh(); BK.tp(x, y); run(n || 20); if (ph) { phase(ph); BK.tp(x, y); run(ph === 'horn' ? 30 : 6); } BK.look(x, y); snap(name); };
    at('r1-start', 136, 218);
    at('r2-timber', 114, 218);
    at('r3-horn', 114, 218, 'horn');
    at('r4-twin', 96, 218);
    at('r5-last', 84, 218);
    at('c1-foot', 72, 215);
    at('c2-rock', 56, 209);
    at('c3-rope', 50, 199);
    at('c4-chute', 58, 189, 'flood');
    at('c5-gusts', 60, 171);
    at('c6-top', 55, 165);
    at('n1-door', 50, 21);
    at('n2-ledge', 70, 21);
    at('n3-ledge-east', 86, 21);
    at('n4-crown', 70, 13);
    at('n5-nest', 84, 11);
    /* THE MATRIARCH: forced modes on the ledge (a picture, not a fight) */
    { const mats = (name, mode, f) => { if (filt && !name.includes(filt)) return; fresh(); BK.tp(53, 21); run(80); const e = BK.boss; if (!e) return; e.mode = mode; e.modeT = 99; if (f) f(e); BK.look(e.x / 16, 21); run(2); e.mode = mode; BK.look(e.x / 16, 21); snap(name); };
      mats('m1-walk', 'walk'); mats('m2-crouch', 'pounceTell'); mats('m3-screech', 'screechTell'); mats('m4-open', 'staggered', e => { e.open = 3; }); mats('m5-wall', 'wallRun', e => { e.y = 160; }); mats('m6-perch', 'perch', e => { e.y = 224; }); }
    return res; })()`, 900000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/redgorge2-art/' + tag + '/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
