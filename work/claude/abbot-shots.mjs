// work/claude/abbot-shots.mjs — THE FALSE ABBOT'S ROOM in the real page: a stitched strip of the whole arena (the camera's
// own frames laid at their own camX/camY, so nothing is guessed), and fight frames with him awake.
//   node work/claude/abbot-shots.mjs <tag>      -> work/claude/abbot-room/<tag>-strip.png, <tag>-fight-N.png
import { openPage, ROOT } from '../../tools/cdp.mjs';
import { portFor } from '../../tools/ports.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'shot';
const out = join(ROOT, 'work/claude/abbot-room'); mkdirSync(out, { recursive: true });
const pg = await openPage({ port: portFor(7), audio: false });
try {
  const r = await pg.evalp(`(async () => {
    const M = await import('/src/level.js'); const i = M.LEVELS.findIndex(l => l.id === 'spire');
    BK.load(i); BK.start(); BK.god = true; BK.sim(300);
    const L = BK.L, A = L.arena, TS = 16, fr = Math.round(A.floor / TS) - 1;
    const grab = () => { const c = document.createElement('canvas'); c.width = 320; c.height = 180; const g = c.getContext('2d'); g.drawImage(BK.buf, 0, 0); const v = BK.view; return { c, x: v.x, y: v.y }; };
    const big = (c, s) => { const d = document.createElement('canvas'); d.width = c.width * s; d.height = c.height * s; const g = d.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(c, 0, 0, d.width, d.height); return d.toDataURL('image/png'); };
    /* THE STRIP: walk the camera across the room before he wakes */
    const frames = [];
    for (let x = A.wallL - 12; x <= A.wallR - 2; x += 8) { BK.tp(x, fr); for (let k = 0; k < 70; k++) BK.step(1); frames.push(grab()); }
    const x0 = Math.min(...frames.map(f => f.x)), y0 = Math.min(...frames.map(f => f.y)), x1 = Math.max(...frames.map(f => f.x)) + 320, y1 = Math.max(...frames.map(f => f.y)) + 180;
    const s = document.createElement('canvas'); s.width = Math.round(x1 - x0); s.height = Math.round(y1 - y0); const sg = s.getContext('2d');
    for (const f of frames) sg.drawImage(f.c, Math.round(f.x - x0), Math.round(f.y - y0));
    const strip = big(s, 2);
    /* THE FIGHT: in through the trigger, and a few moments of him */
    BK.god = true; BK.tp(Math.round(A.trigger / TS) + 1, fr); BK.sim(30);
    const fights = []; const at = [2, 6, 11];
    let t = 0; for (const s2 of at) { for (; t < s2 * 60; t++) BK.step(1); fights.push(big(grab().c, 2)); }
    /* THE RING AND THE BELL: wait for him to step inside the ring, grab that, then strike the bell and grab him DOWN */
    const bl = BK.props().find(p => p.t === 'tbell' && p.abbot); const extra = {}; if (bl) { BK.P.x = bl.x - 70; BK.P.y = A.floor; for (let k = 0; k < 90; k++) { BK.P.x = bl.x - 70; BK.step(1); } }
    if (bl && bl.under !== undefined) for (let i = 0; i < 60 * 40 && !extra.down; i++) { BK.step(1); const b = BK.boss;
      BK.P.x = extra.ring ? BK.P.x : bl.x - 70; if (!extra.ring && bl.under && bl.cool <= 0) { extra.ring = big(grab().c, 2); BK.P.x = bl.x - 22; BK.P.face = 1; BK.press('atk'); extra.t = i; }
      else if (extra.ring && !extra.down && b && b.mode === 'downed' && i - extra.t > 30) extra.down = big(grab().c, 2);
      else if (extra.ring && !extra.down && i - extra.t > 20 && b && b.mode !== 'downed' && bl.cool <= 0) { BK.P.x = bl.x - 22; BK.P.face = 1; BK.press('atk'); } }
    const b = BK.boss;
    return { strip, fights, extra, arena: A, boss: b && { x: b.x, mode: b.mode }, frames: frames.length };
  })()`, 600000);
  writeFileSync(join(out, tag + '-strip.png'), Buffer.from(r.strip.split(',')[1], 'base64'));
  for (const k of ['ring', 'down']) if (r.extra && r.extra[k]) writeFileSync(join(out, tag + '-' + k + '.png'), Buffer.from(r.extra[k].split(',')[1], 'base64'));
  r.fights.forEach((d, j) => writeFileSync(join(out, tag + '-fight-' + j + '.png'), Buffer.from(d.split(',')[1], 'base64')));
  console.log(JSON.stringify({ arena: r.arena, boss: r.boss, frames: r.frames }));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
