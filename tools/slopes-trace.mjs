// tools/slopes-trace.mjs — THE EQUIVALENCE CHECK IN THE REAL PAGE (docs/slopes-integration.md §8.3).
//
// WHY THIS EXISTS. Phase 2 replaces `moveBody` — the one function under ~138 call sites — with a wrapper that picks
// between today's mover and the slope mover. Thirty levels already ship on today's mover. tools/slopes.mjs proves the
// two are identical in NODE, against a copy of moveBody cut out of the file; this proves it IN THE GAME, with the real
// knight, the real levels, the real enemies and the real frame loop, which is the only place a wiring mistake (a stale
// `SLOPES_ON`, an opts object reused across bodies, a field written where nothing expected one) can actually show.
//
// HOW. For each of four shipped levels: seed Math.random, load the level, then stand the knight on up to 24 starts
// spread across its width and drive a fixed 60-frame script from each, recording (x, y, vx, vy, ground) every frame.
// 1260-1440 frames a level. Recorded once BEFORE the swap into docs/slopes-trace.json, re-recorded after it and compared
// with ===. It must be IDENTICAL, frame for frame, on every level.
//
//   node tools/slopes-trace.mjs --record     write the baseline (run this on the code BEFORE the swap)
//   node tools/slopes-trace.mjs              compare against the baseline; exit 1 on the first frame that differs
//
// THE SPREAD OF STARTS IS THE POINT, and they were not in the first draft of this tool. A single scripted walk from
// the level's own start covered about thirty pixels of one level and never touched the LEDGE ASSIST — changing its
// `<= 6` to `<= 5` inside moveBody left every frame of every level identical. That check would have passed vacuously
// over exactly the branch most likely to break.
//
// THE NEGATIVE CONTROL, and run it again if you ever change the script: edit `b.y - lip <= 6` in moveBody to `<= 5`,
// run this tool, and watch it FAIL on every level; then put the 6 back. A green run of this check means nothing until
// you have seen it go red for a one-character change to the function it is guarding.
//
// THE BASELINE IS THE PRE-SLOPES BUILD OF THIS BRANCH, not `9e0e28a` as §8.3 says. 9e0e28a was the pre-slopes commit
// when the plan was written; `master` has since moved +1151/-142 lines of src/main.js, so a trace from there would
// differ everywhere for reasons that have nothing to do with slopes and the check would be unreadable. `moveBody`
// itself is byte-for-byte identical between 9e0e28a and the branch point, so the mover under test is the one the plan
// meant — only the code around it is current. That is the stricter reading of "verify a fix against the OLD code".
import { readFileSync, writeFileSync } from 'fs';
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';

const BASE = new URL('../docs/slopes-trace.json', import.meta.url);
const RECORD = process.argv.includes('--record');
const IDS = ['wood', 'kings', 'keep', 'burial'];   /* §8.3's four: a wood, a castle, an underwater one, a cavern */
const STARTS = 24, PER = 60;

/* THE SCRIPT, a pure function of the frame number within one start, so it is the same every run and on both sides of
   the swap. It exercises exactly the parts of the knight that go through moveBody: the walk, the sprint cap, a held
   jump, a cut jump, turning round, DOWN + jump (drop-through), and walking off whatever he was put on. */
const SCRIPT = `(f) => {
  const k = BK.keys;
  k.left = k.right = k.up = k.down = k.jump = k.atk = k.block = k.dodge = false;
  if (f < 10) k.right = true;
  else if (f < 22) { k.right = true; k.jump = true; if (f === 10) BK.press('jump'); }      /* a held jump, to the top of the arc */
  else if (f < 28) { k.right = true; if (f === 24) BK.press('jump'); }                     /* a CUT jump: pressed, released at once */
  else if (f < 40) k.left = true;                                                          /* turn round and walk back */
  else if (f < 46) { k.down = true; if (f === 41) BK.press('jump'); }                       /* DOWN + jump: drop through a one-way */
  else { k.right = true; k.jump = f < 54; if (f === 48) BK.press('jump'); }                 /* and away again */
}`;

const trace = async pg => pg.evalp(`(async () => {
  const { LEVELS, T } = await import('./src/level.js');
  const script = ${SCRIPT};
  const out = {};
  for (const id of ${JSON.stringify(IDS)}) {
    const i = LEVELS.findIndex(l => l.id === id);
    if (i < 0) throw new Error('no level ' + id);
    /* the house seed (tools/combat-replay.mjs and the pilots use the same generator), so particles, enemy turns and
       every other Math.random consumer replay identically on both sides of the swap */
    const real = Math.random; let seed = 1919;
    Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    try {
      BK.manualSimulation = true;
      BK.load(i); BK.state = 'play'; BK.god = true;
      const L = BK.L, W = L.W, H = L.H, at = (x, y) => L.grid[y * W + x];
      /* standing places spread across the level: the first floor under the top of each column band */
      const starts = [];
      for (let n = 0; n < ${STARTS}; n++) {
        const tx = Math.min(W - 2, Math.max(1, Math.floor((n + 0.5) * W / ${STARTS})));
        for (let ty = 2; ty < H - 1; ty++) if (at(tx, ty) === T.SOLID && at(tx, ty - 1) === T.AIR && at(tx, ty - 2) === T.AIR) { starts.push([tx, ty - 1]); break; }
      }
      const rows = [];
      for (const [tx, ty] of starts) {
        for (const kk in BK.keys) BK.keys[kk] = false;
        BK.P.dead = 0; BK.P.hp = BK.P.maxHp;
        BK.tp(tx, ty);
        for (let f = 0; f < ${PER}; f++) {
          script(f);
          BK.sim(1);
          const P = BK.P;
          rows.push([P.x, P.y, P.vx, P.vy, P.ground ? 1 : 0]);
        }
      }
      out[id] = rows;
    } finally { Math.random = real; BK.manualSimulation = false; }
  }
  return out;
})()`);

const compare = (want, got) => {
  let bad = 0;
  for (const id of IDS) {
    const a = want[id], b = got[id];
    if (!a) { console.log(`FAIL ${id}: no baseline recorded`); bad++; continue; }
    if (a.length !== b.length) { console.log(`FAIL ${id}: ${b.length} frames against ${a.length}`); bad++; continue; }
    let first = -1;
    for (let f = 0; f < a.length && first < 0; f++) for (let c = 0; c < 5; c++) if (a[f][c] !== b[f][c]) first = f;
    if (first >= 0) { console.log(`FAIL ${id}: first difference at frame ${first} of ${a.length} (start ${(first / PER) | 0}) — was [${a[first]}], now [${b[first]}]`); bad++; }
    else console.log(`ok   ${id}: ${a.length} frames identical (x, y, vx, vy, ground) over ${a.length / PER} starts`);
  }
  return bad;
};

const pg = await openPage({ port: portFor(7), fonts: false });
try {
  const got = await trace(pg);
  assert.deepEqual(pg.errors, [], 'the page threw while tracing');
  for (const id of IDS) if (!got[id] || got[id].length < STARTS * PER * 0.5) throw new Error(`${id}: only ${got[id] ? got[id].length : 0} frames — the start finder found too little footing`);

  if (RECORD) {
    writeFileSync(BASE, JSON.stringify(got));
    for (const id of IDS) console.log(`recorded ${id}: ${got[id].length} frames over ${got[id].length / PER} starts`);
    console.log('slopes-trace: baseline written to docs/slopes-trace.json — this is the OLD side. Re-run without --record after the swap.');
  } else {
    const bad = compare(JSON.parse(readFileSync(BASE, 'utf8')), got);
    if (bad) { console.log(`slopes-trace: ${bad} of ${IDS.length} levels DIFFER from the pre-slopes build`); process.exit(1); }
    console.log('slopes-trace: every frame of every level identical to the pre-slopes build');
  }
} finally { pg.close(); }
