// tools/spart-mother-states.mjs - THE SCARAB MOTHER in every move, in the real page (claude/spart): each mode forced for a frame and shot -> work/claude/shots/spart/mother-states.png (a sheet) + mother-<mode>.png.
// Not in the suite: pictures are for eyes. PORT from the environment. env: SHOTS (default work/claude/shots/spart), ONLY=a,b
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, process.env.SHOTS || 'work/claude/shots/spart'); mkdirSync(out, { recursive: true });
const MODES = ['sleep', 'wake', 'walk', 'chargeTell', 'charge', 'skid', 'dazed', 'snapTell', 'snap', 'spitTell', 'spit', 'burrowTell', 'burrowed', 'burrowUp', 'quakeTell', 'quake', 'open:block', 'open:darts', 'open:stone', 'ward'];
const want = process.env.ONLY ? process.env.ONLY.split(',') : MODES;
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); BK.load(LEVELS.findIndex(l => l.id === 'sealedpyramid')); BK.start(); BK.god = true; BK.sim(420); try { BK.SET.hud = 'minimal'; } catch (e) {}
    const A = BK.L.arena; BK.tp(462, 56); for (let k = 0; k < 70; k++) BK.step(1); BK.sim(200);
    const SH = BK.scarabMotherHands(), b = BK.enemies().find(e => e.t === 'scarabmother'), P = BK.P; const res = [];
    b.x = P.x + 70; b.face = -1;
    for (const m of ${JSON.stringify(want)}) { const [mode, kind] = m.split(':'); BK.sim(2);
      if (mode === 'ward') { b.mode = 'walk'; SH.show().ward = 3; } else { b.mode = mode === 'spit' ? 'recover' : mode; SH.show().ward = 0; }
      b.modeT = 5; b.x = P.x + 70; b.face = -1; if (kind) { b.open = 3; b.openKind = kind; } if (mode === 'spit') { SH.show().glob = { x0: b.x, x: b.x, tx: P.x, t: 0.1, key: 'z' }; }
      if (mode === 'burrowed') SH.show().mound = { x: b.x, key: 'z' };
      for (let k = 0; k < 2; k++) { P.hp = P.maxHp; b.modeT = 5; if (kind) b.open = 3; BK.step(1); }
      const c = document.createElement('canvas'); c.width = 480; c.height = 380; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; const W = BK.buf.width, H = BK.buf.height; g.drawImage(BK.buf, W * 0.3, H * 0.55, W * 0.32, H * 0.45, 0, 0, 480, 380); g.fillStyle = '#fff'; g.font = '14px monospace'; g.fillText(m, 6, 16); res.push([m, c.toDataURL('image/png')]); }
    return res; })()`);
  for (const [n, d] of r) writeFileSync(join(out, 'mother-' + n.replace(':', '-') + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  const d = await pg.evalp(`(async () => { const items = ${JSON.stringify(r)}; const cols = 4, rows = Math.ceil(items.length / cols), c = document.createElement('canvas'); c.width = cols * 480; c.height = rows * 380; const g = c.getContext('2d');
    for (let k = 0; k < items.length; k++) { const im = new Image(); im.src = items[k][1]; await im.decode(); g.drawImage(im, (k % cols) * 480, Math.floor(k / cols) * 380); } return c.toDataURL('image/png'); })()`);
  writeFileSync(join(out, 'mother-states.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('mother-states.png', r.length, 'errors', JSON.stringify(pg.errors.slice(0, 4)));
} finally { pg.close(); }
