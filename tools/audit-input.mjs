// tools/audit-input.mjs — INPUT AND RESPONSE, by scripted input traces in the page. Findings only; it changes nothing.
// For each hero, from Bracken Wood's own ground, it presses the real input layer (BK.press / BK.keys, the same presses the keyboard raises)
// on an exact frame and watches what the hero does. Each question is asked at every frame offset in turn, from a fresh start each time:
//   coyote     walk off a ledge, press jump k frames after the feet leave it: how many k in a row, from 0, still jump
//   buffer     fall onto flat ground, press jump k frames before landing: how many k in a row, from 0, still jump on landing
//   swing      press swing at frame k of a swing: does a second swing start, and on what frame (queued, at once, or dropped)
//   cancel     press dodge at frame k of a swing: does the roll start, and on what frame
//   rollSwing  press swing at frame k of a roll: when does the swing start
//   jumpSwing  press jump at frame k of a swing: when does the jump start
//   turn       running right, hold left: frames until he faces left and until he moves left (and the same from standing)
//   node tools/audit-input.mjs                 every hero -> SCRATCH/input.json and a table
//   node tools/audit-input.mjs knight          one hero
// Frames are 60 fps updates (BK.sim(1) is one); "press at k" is a press raised before update k, counting the first press as update 0.
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { openAudit, SCRATCH } from './audit-lib.mjs';

const heroes = (process.argv[2] || 'knight,warden,pyro,paladin,pirate,reaper').split(',');
mkdirSync(SCRATCH, { recursive: true });

async function INPUT(o) {
  const BK = window.BK, P = BK.P, A = window.__AUD, lvm = await import('/src/level.js'), T = lvm.T, TS = 16;
  const wood = lvm.LEVELS.findIndex(l => l.id === 'wood'), h = o.hero;
  BK.setHero(h); A.settings(); BK.PROG.talents = BK.PROG.talents || {}; BK.PROG.talents[h] = {};
  BK.load(wood); BK.state = 'play'; BK.god = true; BK.sim(3); for (const q of BK.enemies()) q.alive = false; A.clearKeys(); BK.sim(10);
  const L = BK.L, W = L.W, tile = (x, y) => L.grid[y * W + x];
  const solid = (x, y) => tile(x, y) === T.SOLID, air = (x, y) => tile(x, y) === T.AIR;
  /* a ledge: eight tiles of flat solid ground with two rows of air over it, then a drop of four rows */
  let ledge = null, flat = null;
  for (let y = 4; y < L.H - 6 && !ledge; y++) for (let x = 12; x < W - 12; x++) {
    let ok = true; for (let i = -8; i <= 0 && ok; i++) ok = solid(x + i, y) && air(x + i, y - 1) && air(x + i, y - 2) && air(x + i, y - 3);
    if (!ok) continue; for (let d = 0; d <= 4 && ok; d++) ok = air(x + 1, y + d) && air(x + 2, y + d) && air(x + 1, y - 1 - (d > 1 ? 1 : 0));
    if (ok) { ledge = { x, y }; break; } }
  for (let y = 4; y < L.H - 6 && !flat; y++) for (let x = 12; x < W - 12; x++) { let ok = true; for (let i = -10; i <= 10 && ok; i++) ok = solid(x + i, y) && air(x + i, y - 1) && air(x + i, y - 2) && air(x + i, y - 3) && air(x + i, y - 4) && air(x + i, y - 5) && air(x + i, y - 6); if (ok) { flat = { x, y }; break; } }
  if (!ledge || !flat) return { hero: h, error: 'no ledge or flat ground found in the wood' };
  const fresh = (tx, ty) => { A.clearKeys(); BK.reset(); P.cds = {}; BK.tp(tx, ty - 1); P.face = 1; P.vx = 0; P.vy = 0; P.combo = 0; P.dodgeCd = 0; P.atk = -1; P.swingEndT = -9; P.lastSwingT = -9; BK.sim(30); P.st = P.maxSt; };
  /* A JUMP IS HELD: a tap lets the short-hop cut (updatePlayer: !keys.jump && canCut clamps the rise to -110) take it at once, so every press
     here holds jump for the frames after it, the way a player's finger does, and a jump is a rise faster than the cut allows */
  const press0 = BK.press.bind(BK); let holdJ = 0;
  BK.press = k => { if (k === 'jump') { holdJ = 12; BK.keys.jump = true; } return press0(k); };
  const sim0 = BK.sim.bind(BK); BK.sim = n => { for (let i = 0; i < (n || 1); i++) { sim0(1); if (holdJ > 0 && --holdJ === 0) BK.keys.jump = false; } };
  const jumped = () => P.vy < -150;
  /* FRAMES HELD is how many presses in a row still jump, from k = 0. A press on the first frame in the air (or on the landing
     frame) already needs one frame of grace, so the last k that jumps is one short of the count */
  const held = res => { const i = res.indexOf(0); return i < 0 ? res.length : i; };
  const out = { hero: h, ledge, flat };
  /* COYOTE */
  { fresh(ledge.x - 6, ledge.y); const x0 = P.x; BK.keys.right = true; let fl = null; for (let f = 0; f < 120; f++) { BK.sim(1); if (!P.ground) { fl = f; break; } }
    const res = []; for (let k = 0; k <= 14; k++) { fresh(ledge.x - 6, ledge.y); BK.keys.right = true; let off = null, ok = false;
      for (let f = 0; f < 160; f++) { if (off !== null && f === off + k) BK.press('jump'); const wasG = P.ground; BK.sim(1); if (off === null && wasG && !P.ground) off = f + 1; if (off !== null && f >= off + k && f <= off + k + 4 && jumped()) { ok = true; break; } if (off !== null && f > off + k + 5) break; }
      res.push(ok ? 1 : 0); }
    out.coyote = { byK: res.join(''), frames: held(res), leftAtF: fl }; }
  /* JUMP BUFFER */
  { const drop = () => { fresh(flat.x, flat.y); P.y -= 64; P.vy = 0; P.ground = false; };
    drop(); let land = null; for (let f = 0; f < 120; f++) { BK.sim(1); if (P.ground) { land = f; break; } }
    const res = []; for (let k = 0; k <= 14; k++) { drop(); let ok = false;
      for (let f = 0; f <= land + 6; f++) { if (f === land - k) BK.press('jump'); BK.sim(1); if (f >= land && jumped()) { ok = true; break; } }
      res.push(ok ? 1 : 0); }
    out.buffer = { byK: res.join(''), frames: held(res), landAt: land }; }
  /* THE SWING, and what can be pressed during it */
  const swingLen = () => { fresh(flat.x, flat.y); BK.press('atk'); for (let f = 0; f < 120; f++) { BK.sim(1); P.st = P.maxSt; if (f > 1 && P.atk < 0) return f; } return null; };
  const Ls = swingLen(); out.swingLen = Ls;
  const during = (first, second, startOf, until) => { const rows = [];
    for (let k = 1; k <= (until || 40); k++) { fresh(flat.x, flat.y); let started = null, prev = startOf(), n0 = null;
      for (let f = 0; f < k + 45; f++) { if (f === 0) first(); if (f === k) second(); const before = startOf(); BK.sim(1); P.st = P.maxSt; const now = startOf();
        if (f >= k && started === null && now && (!before || (typeof now === 'number' && now !== before))) { started = f; break; } }
      rows.push([k, started]); }
    return rows; };
  /* A SWING STARTS WHERE ITS VOICE DOES: every swing the input starts calls SFX.pSlash once (updatePlayer), so a count of those is the
     count of swings - reading P.atk misses the freebooter, whose blade passes its first 0.02 s between two updates */
  const AU = await import('/src/audio.js'); if (!window.__swingCount) { const f0 = AU.SFX.pSlash; window.__swingCount = { n: 0 }; AU.SFX.pSlash = function (...a) { window.__swingCount.n++; return f0.apply(this, a); }; }
  const swings = () => window.__swingCount.n;
  out.swing = during(() => BK.press('atk'), () => BK.press('atk'), swings, Ls + 10);
  out.cancel = during(() => BK.press('atk'), () => BK.press('dodge'), () => P.dodge > 0 ? 1 : 0, Ls + 6);
  { fresh(flat.x, flat.y); BK.press('dodge'); let Ld = null; for (let f = 0; f < 90; f++) { BK.sim(1); if (f > 1 && !(P.dodge > 0)) { Ld = f; break; } } out.rollLen = Ld; }
  out.rollSwing = during(() => BK.press('dodge'), () => BK.press('atk'), () => P.atk >= 0 ? 1 : 0, (out.rollLen || 20) + 6);
  out.jumpSwing = during(() => BK.press('atk'), () => BK.press('jump'), () => jumped() ? 1 : 0, Ls + 6);
  /* TURN */
  { fresh(flat.x - 8, flat.y); BK.keys.right = true; BK.sim(40); const v0 = Math.round(P.vx); BK.keys.right = false; BK.keys.left = true; let face = null, move = null;
    for (let f = 0; f < 60; f++) { BK.sim(1); if (face === null && P.face < 0) face = f; if (move === null && P.vx < 0) move = f; if (face !== null && move !== null) break; }
    fresh(flat.x, flat.y); BK.keys.left = true; let face2 = null, move2 = null; for (let f = 0; f < 60; f++) { BK.sim(1); if (face2 === null && P.face < 0) face2 = f; if (move2 === null && P.vx < 0) move2 = f; if (face2 !== null && move2 !== null) break; }
    out.turn = { runSpeed: v0, runFaceF: face, runMoveF: move, standFaceF: face2, standMoveF: move2 }; }
  A.clearKeys(); BK.god = false;
  return out;
}

async function main() {
  const pg = await openAudit(); const rows = [];
  try {
    for (const h of heroes) { const r = await pg.evalp('(' + INPUT.toString() + ')(' + JSON.stringify({ hero: h }) + ')'); rows.push(r);
      if (r.error) { console.log(h, r.error); continue; }
      const cls = (arr, len) => arr.map(([k, s]) => k + ':' + (s === null ? 'DROP' : s === k || s === k + 1 ? 'now' : 'f' + s)).join(' ');
      console.log('== ' + h + '  coyote ' + r.coyote.frames + 'f (' + r.coyote.byK + ')  buffer ' + r.buffer.frames + 'f (' + r.buffer.byK + ')  swing ' + r.swingLen + 'f  roll ' + r.rollLen + 'f  turn ' + JSON.stringify(r.turn));
      console.log('  swing during swing: ' + cls(r.swing)); console.log('  dodge during swing: ' + cls(r.cancel)); console.log('  swing during roll:  ' + cls(r.rollSwing)); console.log('  jump during swing:  ' + cls(r.jumpSwing));
      if (pg.errors.length) console.log('  page errors: ' + pg.errors.splice(0).slice(0, 3).join(' | ').slice(0, 300)); }
    writeFileSync(join(SCRATCH, 'input.json'), JSON.stringify(rows, null, 1)); console.log('wrote ' + join(SCRATCH, 'input.json'));
  } finally { pg.close(); }
}
main().catch(err => { console.error(err); process.exit(1); });
