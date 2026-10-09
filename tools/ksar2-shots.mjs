// tools/ksar2-shots.mjs - THE BANDIT KSAR 2's art pictures (claude/ksar2 part B; not in the suite): the new props in every state, the fortress, the rooftops, her poses. god mode.
//   usage: PORT=8792 node tools/ksar2-shots.mjs [tag] [filter,filter]   -> work/claude/ksar2art/<tag>/*.png
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after', filt = process.argv[3] || '', out = join(ROOT, 'work/claude/ksar2art', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = []; const filt = ${JSON.stringify(filt)};
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'ksar'); const fresh = () => { BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4); };
    const snap = name => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const ok = n => !filt || filt.split(',').some(f => n.includes(f));
    const at = (name, x, y, f) => { if (!ok(name)) return; fresh(); BK.tp(x, y); run(20); const K = BK.ksar(); if (f) f(K); BK.look(x, y); run(3); snap(name); };
    at('a01-tower2-crown', 98, 21); at('a02-wall-breach', 124, 27); at('a03-gatehouse', 262, 27); at('a04-souq-keep', 300, 33); at('a05-store-roofs', 446, 24);
    at('b01-reeds-whole', 596, 33, K => {}); at('b02-reeds-burning', 596, 33, K => { const r = K.reeds[0]; r.st = 'burning'; r.t = 0.45; });
    at('b03-reeds-burnt', 596, 33, K => { K.reeds[0].st = 'burnt'; });
    at('b04-torch-rack', 590, 33); at('b05-nests', 628, 26); at('b06-nests-blind', 628, 26, K => { for (const e of BK.enemies()) if (e.nest) e.ksStun = 3; });
    at('b07-zip-teach', 644, 26); at('b08-powder-run', 650, 33); at('b09-bridge-raised', 672, 31); at('b10-bridge-burning', 672, 31, K => { const r = K.ropes[0]; r.st = 'burning'; r.t = 0.4; });
    at('b11-bridge-down', 672, 31, K => { const r = K.ropes[0]; r.st = 'down'; r.t = 0; });
    at('b12-trail-dry', 690, 33); at('b13-trail-lit', 690, 33, K => { const t = K.trails[0]; t.st = 'lit'; t.a = t.x0 * 16; t.b = (t.x0 + 5) * 16; });
    at('b14-alley', 730, 33); at('b15-raid-post', 760, 33); at('b16-tower-stair', 786, 26); at('b17-tower-top', 793, 12);
    at('b18-arch-rubble', 778, 33, K => { const b = K.barricades.find(q => q.id === 'alleyArch'); if (b) b.broken = true; });
    { fresh(); const A = BK.ksar().L.arena.hm; at('c01-roof-west', A.sx + 6, A.R - 1); at('c02-shaft-1', A.sx + 12, A.R - 1); at('c03-roof-mid', A.sx + 22, A.R - 1); at('c04-shaft-2', A.sx + 29, A.R - 1); }
    if (ok('d')) { fresh(); { const A = BK.ksar().L.arena.hm; BK.tp(A.sx + 4, A.R - 1); } run(200); const e = BK.boss, H = BK.hawkMistressHands(); if (e && H) { BK.god = true;
      const hold = (mode, name, f) => { e.mode = mode; e.modeT = 99; e.face = -1; if (f) f(); BK.state = 'play'; BK.tp(e.x / 16 - 4, BK.ksar().L.arena.hm.R - 1); BK.look(e.x - 60, e.y - 10); run(3); e.modeT = 99; BK.state = 'play'; BK.look(e.x - 60, e.y - 10); run(2); snap(name); };
      const T = 99; for (const [m, n, mt] of [['walk', 'd01-idle', 99], ['snareTell', 'd02-snare-early', 0.55], ['snareTell', 'd03-snare-late', 0.15], ['fanTell', 'd04-fan-early', 0.6], ['fanTell', 'd05-fan-late', 0.15], ['kegTell', 'd06-keg-early', 0.5], ['kegTell', 'd07-keg-late', 0.1], ['lashTell', 'd08-lash-early', 0.5], ['whistle', 'd09-whistle', 99], ['rakeTell', 'd10-rake', 0.3]]) { e.mode = m; e.modeT = mt; e.face = -1; BK.state = 'play'; BK.tp(e.x / 16 - 4, BK.ksar().L.arena.hm.R - 1); BK.look(e.x - 60, e.y - 10); BK.step(0); snap(n); } } }
    return res; })()`, 900000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/ksar2art/' + tag + '/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
