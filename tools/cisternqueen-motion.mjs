// tools/cisternqueen-motion.mjs - THE CISTERN QUEEN's motion, frame by frame (claude/queen4, Daniel 10-07: "her animations jumping around look really awkward").
// Not in the suite: god mode, pictures. Boots her hall in the Underwell, forces each of her trips and moves by script, and lays the game's own frames out in a
// contact sheet per move (every `every`-th frame, left to right) - a pop shows as a jump between two cells.
//   PORT=8720 node tools/cisternqueen-motion.mjs [tag=after] [every=3]   -> work/claude/queen4/<tag>/motion-<move>.png
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after', every = +(process.argv[3] || 3);
const out = join(ROOT, 'work/claude/queen4', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const CQG = await import('/src/cistern-queen.js'); const res = [];
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'underwell'); BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4);
    for (const e of BK.enemies()) if (e.t !== 'cisternqueen') e.alive = false;
    const A = BK.L.arena; BK.tp(A.start[0], A.start[1]); for (let i = 0; i < 200; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); }
    const q = BK.boss, H = BK.cisternQueenHands(), S = () => H.show(), stub = { number() {}, sound() {}, shake() {}, fx() {}, music() {}, mark() {} };
    const sheet = (name, frames, until) => { const cells = []; for (let i = 0; i < frames; i++) { BK.P.hp = BK.P.maxHp; BK.P.x = Math.max(A.x0 + 30, Math.min(A.x1 - 30, BK.P.x)); BK.step(1);
        if (i % ${every} === 0) { const v = BK.view, z = v.z || 1, sx = v.VW / 2 + (q.x - v.x - v.VW / 2) * z, sy = v.VH / 2 + (Math.min(q.y, A.floor) - 50 - v.y - v.VH / 2) * z, cw0 = 300, ch0 = 190;
          const c = document.createElement('canvas'); c.width = cw0; c.height = ch0; c.getContext('2d').drawImage(BK.buf, Math.round(sx - cw0 / 2), Math.round(sy - ch0 / 2), cw0, ch0, 0, 0, cw0, ch0); cells.push([c, q.mode]); } if (until && until()) break; }
      const cols = 8, W = 300, Hh = 190, sc = 1, cw = Math.round(W * sc), ch = Math.round(Hh * sc), rows = Math.ceil(cells.length / cols);
      const out = document.createElement('canvas'); out.width = cw * cols; out.height = (ch + 10) * rows; const g = out.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, out.width, out.height);
      cells.forEach(([c, m], i) => { const x = (i % cols) * cw, y = Math.floor(i / cols) * (ch + 10); g.drawImage(c, x, y + 10, cw, ch); g.fillStyle = '#fff'; g.font = '9px monospace'; g.fillText(i * ${every} + ' ' + m, x + 2, y + 8); });
      res.push([name, out.toDataURL('image/png')]); };
    const force = (ph, script, hp) => { q.hp = Math.round(q.maxHp * hp); const s = S(); s.pose = 'floor'; s.mound = null; s.trip = null; s.wallK = 0; s.shaftK = null; q.gone = 0; q.y = A.floor; s.ph = ph; q.phase = ph; s.script = script; s.step = 0; q.mode = 'walk'; q.modeT = 0; };
    for (let i = 0; i < 120; i++) BK.sim(1);
    force(1, ['burrow:strike', 'pincer'], 0.9); BK.P.x = q.x - 90; sheet('dig-and-burst', 120);
    force(1, ['pincer', 'snapsnap'], 0.9); BK.P.x = q.x + (q.face || 1) * -70; sheet('turn-and-pincer', 90);
    force(2, ['wall:W', 'spit'], 0.6); S().burn = false; sheet('to-the-west-wall', 120);
    force(2, ['wall:E', 'spit'], 0.6); S().burn = false; sheet('across-to-the-east-wall', 150);
    force(2, ['shaft', 'pounce'], 0.6); S().burn = false; sheet('leap-into-the-shaft-and-pounce', 170);
    force(2, ['wall:W', 'ambush'], 0.6); S().burn = false; BK.P.x = A.x1 - 120; sheet('ambush-through-the-tunnel', 210);
    force(2, ['wall:W', 'spit', 'spit'], 0.6); S().burn = false; for (let i = 0; i < 130; i++) BK.sim(1); CQG.openUp(q, S(), 'fallen', stub); sheet('off-the-wall-on-her-back', 60);
    q.hp = Math.round(q.maxHp * 0.3); for (let i = 0; i < 400 && !S().flood; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); } for (let i = 0; i < 120; i++) BK.sim(1);
    force(3, ['bloom', 'wave'], 0.3); S().flood = true; BK.P.x = q.x + 60; sheet('venom-bloom', 210);
    return res; })()`, 900000);
  for (const [name, d] of r) { writeFileSync(join(out, 'motion-' + name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/queen4/' + tag + '/motion-' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
