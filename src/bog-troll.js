// src/bog-troll.js - THE BOG TROLL, UNDER THE FEN ROAD (claude/fenroad; scratch/brief-fenroad-1020.md, Daniel 10-20: "needs a boss" - all recs approved).
// The goblins' hired brute, who lives UNDER their boardwalk at the Stockade's gate (THE TROLL'S CROSSING, src/fen-road.js). NOT a goblin (the Chieftain is next).
// This file is the fight, PURE (his moves, his two phases, what a blow does to him, the bot's plan); src/bog-troll-hands.js binds it to the world (main.js),
// to the road's rotten sections (src/fen-road-hands.js) and draws him. tools/bog-troll.mjs is its check.
// HEADER (design-standard B1 / B11 / B14 / B15): A BEAST BOSS WITH A RULE OPENING. Always hittable when he is up out of the water, never invulnerable:
//   HIS PEAT-CAKED HIDE turns a blow: x0.4 outside his openings (B15's floor; told: a clank and PEAT HIDE). Under the boards he is out of reach (he is
//     UNDER them - a told move between moves, bubbles where he swims, never a wait: B13).
//   THE LEVEL'S VERB IS HIS OPENING (B1): he feels your WEIGHT on the boards and BURSTS UP under you. Stand on one of the crossing's three ROTTEN sections
//     while he hunts you, step off as his bulge sets (it turns red and stops following) - and he bursts up through rotten boards that give way round
//     him: STUCK waist-deep in the wreck, the shared OPEN read (B10: a gold ring and a timer bar), blows land x2. One stuck is worth at most BT.stuck.cap
//     of him (he tears free early, told). The section is gone until the planks float back (src/fen-road-hands.js SAG.regrow).
//   THE WARD (B3): tearing free he shakes the wreck off - a told ~3 s ward (a pale ring, WARDED on every blow, a rotten section he bursts under then
//     breaks on him but does not hold him).
//   ONE NEW MOVE PER PHASE (B5) and every move TOLD with its own windup and release pose (B16) and its own sound:
//     P1 (100-50%)  THE BURST UP (bubbles, then a bulge under your boards that follows you, sets red: step off it - he erupts, a red !!)
//                   THE DRAG (his arm comes up out of the fen dripping weed, a red !!: it sweeps the boards to drag you in - JUMP it or ROLL it)
//                   THE PEAT HURL (he scoops a clod of bog and lobs it, a red !! and a red ring where it lands - step off it)
//     P2 (50-0%)    RIP THE ROAD: he grips the boardwalk and tears two stretches of it away (the boards flash red first: get off them) - the crossing is three
//                   plank islands over the biting water from then on; his hurl is two clods; he comes up in the open water too.
//   NO ADDS (no summons in the brief).
export const BT = {
  hp: 900, w: 40, h: 56, markH: 60, up: 26, under: 84,   // up: his feet under the boards when he stands waist-deep (px below the road); under: where he swims
  rest: [0.7, 0.55], hide: 0.4, wardMul: 0.4, p2: 0.5,
  sink: 0.45, swim: [0.9, 0.75], swimV: 180,
  burst: { track: 0.6, lock: 0.65, t: 0.3, r: 18, h: 40, dmg: 18, kick: -300, rise: 0.5 },
  stuck: { t: [4.2, 3.6], mul: 2, cap: 0.17, heave: 0.6, ward: 3, w: 52 },
  drag: { tell: [0.85, 0.7], t: 0.32, reach: 118, h: 12, dmg: 12, pull: 210, rec: 0.6, range: 150 },
  hurl: { tell: [0.8, 0.65], flight: 1.0, r: 16, dmg: 12, spread: 56, rec: 0.55 },
  rip: { tell: 1.4, t: 0.6, roar: 0.8 },
};
export const BT_SAY = { wake: 'THE BOG TROLL', rule: 'HE FEELS YOUR WEIGHT. LURE HIS BURST UNDER A ROTTEN SECTION.', stuck: 'STUCK IN THE BOARDS', free: 'HE TEARS FREE', ward: 'HE SHAKES OFF THE WRECK',
  bounce: 'THE BOARDS BREAK ON HIM: WARDED', p2: 'HE RIPS THE ROAD', dragged: 'DRAGGED', hide: 'PEAT HIDE' };
export const OPEN_NAME = { stuck: 'STUCK' };
export const btOpen = e => !!e && e.mode === 'stuck';
const TELLS = new Set(['burstTell', 'dragTell', 'hurlTell', 'ripTell']);
export const btTelling = e => TELLS.has(e.mode);
export const btUnder = e => !!e && (e.mode === 'under' || e.mode === 'burstTell');
/* THE CROSSING (px): x0/x1 the boards' ends inside the walls, floorY the road's top, waterY the fen's surface; rip: the two stretches (tile columns) he tears away */
export function geom(A, TS = 16) {
  return { x0: A.x0, x1: A.x1, floorY: A.floor, waterY: A.water || A.floor + TS, mid: (A.x0 + A.x1) / 2, rip: (A.rip || []).map(([a, b]) => [a * TS, (b + 1) * TS]), TS };
}
export function newFight(G) {
  return { G, ph: 1, ward: 0, act: 0, restT: 1, moves: 0, clods: [], ripped: false, last: [], told: {}, purse: null,
    n: { burst: 0, stuck: 0, drag: 0, hurl: 0, rip: 0, bounced: 0, dragged: 0 } };
}
/* is x (px) over the water - a stretch he has ripped? */
export const inRip = (S, x) => S.ripped && S.G.rip.some(([a, b]) => x > a && x < b);
/* ---------- ONE FRAME OF HIM. heroes: [{ x, y, ground, alive, pp }]; w: the world (src/bog-troll-hands.js world()):
   w.sectionAt(x) -> a rotten section (or null) with .st ('up'|'bow'|'under'|'gone'), w.collapse(sec), w.rip(ranges), + number/sound/shake/hit/hitHero/fx ---------- */
export function stepTroll(e, S, dt, heroes, w) {
  const G = S.G, ph = S.ph, i = ph - 1, P = heroes.find(h => h.alive) || heroes[0];
  S.ward = Math.max(0, S.ward - dt); e.ward = S.ward;
  stepClods(S, dt, heroes, w);
  if (e.mode === 'sleep') return;
  e.modeT -= dt;
  const dx = P ? P.x - e.x : 0, ad = Math.abs(dx), face = () => { if (P) e.face = Math.sign(dx) || e.face; };
  const clampX = x => Math.max(G.x0 + 24, Math.min(G.x1 - 24, x));
  const upY = G.floorY + BT.up, underY = G.floorY + BT.under;
  switch (e.mode) {
    case 'wake': e.y = Math.max(upY, e.y - 90 * dt); if (e.modeT <= 0) { e.mode = 'up'; e.y = upY; S.restT = 0.7; } return;
    case 'up': {
      face(); e.y = upY; S.restT -= dt;
      /* THE PHASE: at half he grips the road (only when he is up and free: never through a stuck) */
      if (S.ph < 2 && e.hp <= e.maxHp * BT.p2) { S.ph = 2; e.phase = 2; e.mode = 'ripTell'; e.modeT = BT.rip.tell; w.mark('!!'); w.sound('roar'); w.number(e.x, G.floorY - 70, BT_SAY.p2, '#ff6b6b'); w.music(2); S.act++; return; }
      if (S.restT > 0 || !P || !P.alive) return;
      pick(e, S, ad, w); return; }
    case 'sink': e.y = Math.min(underY, e.y + 140 * dt); if (e.modeT <= 0) { e.mode = 'under'; e.y = underY; e.modeT = BT.swim[i]; w.sound('gurgle'); } return;
    case 'under': {
      /* he swims to where your weight is (bubbles over him), then the bulge starts */
      e.y = underY; if (P) { const tx = clampX(P.x), d = tx - e.x; e.x += Math.sign(d) * Math.min(Math.abs(d), BT.swimV * dt); }
      if (e.modeT <= 0) { e.mode = 'burstTell'; e.modeT = BT.burst.track + BT.burst.lock; e.locked = false; e.lockX = e.x; S.act++; w.sound('bubble'); } return; }
    case 'burstTell': {
      e.y = underY;
      if (!e.locked) { if (P) { const tx = clampX(P.x), d = tx - e.x; e.x += Math.sign(d) * Math.min(Math.abs(d), 260 * dt); } e.lockX = e.x;
        if (e.modeT <= BT.burst.lock) { e.locked = true; w.mark('!!'); w.sound('bulge'); } }
      if (e.modeT <= 0) { e.mode = 'burst'; e.modeT = BT.burst.t; e.x = e.lockX; e.hitKey = 'bu' + S.act; S.n.burst++; w.sound('burst'); w.shake(8); w.splash(e.x);
        const sec = w.sectionAt(e.x);
        if (sec && (sec.st === 'up' || sec.st === 'bow')) {
          w.collapse(sec);
          if (S.ward > 0) { S.n.bounced++; w.number(e.x, G.floorY - 60, BT_SAY.bounce, '#c8d8e8'); }
          else { e.mode = 'stuckIn'; e.modeT = 0.25; e.stuckSec = sec.id; } } }
      return; }
    case 'burst': {
      e.y = Math.max(upY, e.y - 400 * dt);
      w.hit([e.x - BT.burst.r, e.x + BT.burst.r, G.floorY - BT.burst.h, G.floorY + 4], BT.burst.dmg, 'burst', { key: e.hitKey, up: BT.burst.kick });
      if (e.modeT <= 0) { e.mode = 'up'; e.y = upY; S.restT = BT.burst.rise; } return; }
    case 'stuckIn': e.y = Math.max(upY, e.y - 400 * dt);
      w.hit([e.x - BT.burst.r, e.x + BT.burst.r, G.floorY - BT.burst.h, G.floorY + 4], BT.burst.dmg, 'burst', { key: e.hitKey, up: BT.burst.kick });
      if (e.modeT <= 0) { e.mode = 'stuck'; e.y = upY; e.modeT = BT.stuck.t[i]; e.openT0 = e.modeT; S.purse = e.maxHp * BT.stuck.cap; S.n.stuck++; w.number(e.x, G.floorY - 60, BT_SAY.stuck, '#ffd36b'); w.fx('open', e.x, G.floorY); w.sound('stuck'); }
      return;
    case 'stuck': e.y = upY; if (e.modeT <= 0) { e.mode = 'heave'; e.modeT = BT.stuck.heave; w.sound('roar'); w.shake(5); w.number(e.x, G.floorY - 60, BT_SAY.free, '#ff9a5c'); } return;
    case 'heave': if (e.modeT <= 0) { S.ward = BT.stuck.ward; e.ward = S.ward; w.fx('ward', e.x, G.floorY); w.number(e.x, G.floorY - 72, BT_SAY.ward, '#c8d8e8'); e.mode = 'sink'; e.modeT = BT.sink; } return;
    case 'dragTell': if (e.modeT <= 0) { e.mode = 'drag'; e.modeT = BT.drag.t; e.hitKey = 'dr' + S.act; w.sound('drag'); } return;
    case 'drag': {
      const f = e.face, a = e.x + f * 14, b = e.x + f * (14 + BT.drag.reach);
      w.hit([Math.min(a, b), Math.max(a, b), G.floorY - BT.drag.h, G.floorY + 2], BT.drag.dmg, 'drag', { key: e.hitKey, pull: -f * BT.drag.pull });
      if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = BT.drag.rec; } return; }
    case 'hurlTell': if (e.modeT <= 0) { e.mode = 'hurl'; e.modeT = 0.35; w.sound('hurl'); const px = P ? P.x : e.x, sp = BT.hurl.spread;
        const ts = ph > 1 ? [px, px + (px < G.mid ? sp : -sp)] : [px];
        for (const tx of ts) S.clods.push({ x0: e.x + e.face * 12, y0: G.floorY - 24, tx: Math.max(G.x0 + 10, Math.min(G.x1 - 10, tx)), t: 0, T: BT.hurl.flight, key: 'cl' + S.act + '.' + Math.round(tx) }); }
      return;
    case 'hurl': if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = BT.hurl.rec; } return;
    case 'recover': if (e.modeT <= 0) { e.mode = 'up'; S.restT = BT.rest[i] * 0.5; } return;
    case 'ripTell': face(); if (e.modeT <= 0) { e.mode = 'rip'; e.modeT = BT.rip.t; w.rip(); S.ripped = true; S.n.rip++; w.sound('rip'); w.shake(10); } return;
    case 'rip': if (e.modeT <= 0) { e.mode = 'roar'; e.modeT = BT.rip.roar; w.sound('roar'); } return;
    case 'roar': if (e.modeT <= 0) { e.mode = 'up'; S.restT = 0.4; } return;
    default: e.mode = 'up';
  }
}
/* WHICH MOVE, up out of the water: one or two of the drag and the hurl, then down he goes to hunt your weight. Never the same move three times running. */
function pick(e, S, ad, w) {
  const ph = S.ph, i = ph - 1, last = S.last, twice = k => last.length >= 2 && last[0] === k && last[1] === k;
  let k;
  if (S.moves >= (ph > 1 ? 1 + (Math.random() < 0.4 ? 1 : 0) : 1)) k = 'sink';
  else if (ad < BT.drag.range) k = Math.random() < 0.6 ? 'drag' : 'hurl';
  else k = Math.random() < 0.75 ? 'hurl' : 'sink';
  if (k !== 'sink' && twice(k)) k = k === 'drag' ? 'hurl' : ad < BT.drag.range ? 'drag' : 'sink';
  if (k === 'sink') { S.moves = 0; e.mode = 'sink'; e.modeT = BT.sink; w.sound('sink'); return; }
  last.unshift(k); last.length = Math.min(last.length, 3); S.moves++; S.act++; S.n[k]++;
  if (k === 'drag') { e.mode = 'dragTell'; e.modeT = BT.drag.tell[i]; w.mark('!!'); w.sound('dragTell'); }
  else { e.mode = 'hurlTell'; e.modeT = BT.hurl.tell[i]; w.mark('!!'); w.sound('scoop'); }
}
function stepClods(S, dt, heroes, w) {
  for (const c of S.clods) { c.t += dt; if (c.t < c.T || c.done) continue; c.done = true; w.splash(c.tx, 3); w.sound('clod');
    w.hit([c.tx - BT.hurl.r, c.tx + BT.hurl.r, S.G.floorY - 22, S.G.floorY + 2], BT.hurl.dmg, 'clod', { key: c.key }); }
  S.clods = S.clods.filter(c => !c.done);
}
export function clodAt(c, floorY) { const k = Math.min(1, c.t / c.T); return { x: c.x0 + (c.tx - c.x0) * k, y: c.y0 + (floorY - c.y0) * k - Math.sin(k * Math.PI) * 64 }; }
/* ---------- A BLOW ON HIM (B15) -> [what lands, the word or null] ---------- */
export function takeBlow(e, S, dmg) {
  if (btUnder(e) || e.mode === 'sink') return [0, null];   /* (under the boards: no blow reaches him - the hands never let one through; here for the tools) */
  if (S.ward > 0 || e.mode === 'heave') return [Math.max(1, Math.round(dmg * BT.wardMul)), 'WARDED'];
  if (e.mode === 'stuck') { const d = Math.round(dmg * BT.stuck.mul), left = S.purse ?? Infinity; if (d >= left) { S.purse = 0; e.modeT = 0; return [Math.max(1, Math.round(left)), null]; } S.purse = left - d; return [d, null]; }
  return [Math.max(1, Math.round(dmg * BT.hide)), BT_SAY.hide];
}

/* ---------- THE BOT (src/lab.js): what a player reads - the bubbles, the bulge (amber while it follows, red when it sets), his tells a reaction late,
   the clods' rings, the red boards before the rip - and THE RULE: stand on a rotten section while he hunts, step off when the bulge sets ---------- */
export const PLAN = { react: 0.2, miss: 0.1, missLure: 0.15 };
/* s = { P, e, S, reach, secs: [{ x0, x1, ok }] (px; ok: standing), holes: [[x0, x1]] (px: water where there are no boards), t, mem, rng, v2, shield, dodge } */
export function btPlan(s) {
  const out = btPlan0(s);
  if (globalThis.__btWhy) { const k = out.why.replace(/ \(.*/, ''); globalThis.__btWhy[k] = (globalThis.__btWhy[k] || 0) + 1; }
  /* THE WATER: never walk off the boards - a hole between him and the spot is jumped */
  const P = s.P, holes = s.holes || [];
  if (out.gx != null && P.ground && !out.jump) { const dir = Math.sign(out.gx - P.x);
    if (dir) { const ahead = holes.find(([a, b]) => (dir > 0 ? a > P.x - 2 && a < P.x + 22 : b < P.x + 2 && b > P.x - 22));
      if (ahead && Math.abs(out.gx - P.x) > 10) { const far = dir > 0 ? ahead[1] : ahead[0]; if (Math.abs(far - (dir > 0 ? ahead[0] : ahead[1])) <= 56) { out.jump = true; out.why += ' (jump the water)'; } else { out.gx = P.x; out.why += ' (water ahead)'; } } }
    if (holes.some(([a, b]) => out.gx > a - 4 && out.gx < b + 4)) { const h = holes.find(([a, b]) => out.gx > a - 4 && out.gx < b + 4); out.gx = Math.abs(out.gx - (h[0] - 8)) < Math.abs(out.gx - (h[1] + 8)) ? h[0] - 8 : h[1] + 8; } }
  return out;
}
function btPlan0(s) {
  const { P, e, S, reach } = s, G = S.G, out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, down: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = s.v2 ? 0.05 : PLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const half = BT.w / 2, lo = G.x0 + 10, hi = G.x1 - 10, clamp = x => Math.max(lo, Math.min(hi, x));
  const kx = e.x, side = Math.sign(P.x - kx) || 1, dx = Math.abs(kx - P.x), hitR = reach + half - 4;
  const swing = () => { out.face = Math.sign(kx - P.x) || out.face; out.atk = P.atk < 0; };
  const rings = S.clods.map(c => [c.tx, BT.hurl.r + 10]);
  const inRing = x => rings.some(([cx, r]) => Math.abs(x - cx) < r);
  const holes = s.holes || [], wet = x => holes.some(([a, b]) => x > a - 4 && x < b + 4);
  const safeX = x => { let q = clamp(x); for (let k = 0; k < 3; k++) for (const [cx, r] of rings) if (Math.abs(q - cx) < r) q = clamp(q < cx ? cx - r - 4 : cx + r + 4); return q; };
  const secs = (s.secs || []).filter(q => q.ok);
  const onSec = secs.find(q => P.x > q.x0 + 2 && P.x < q.x1 - 2);
  const offRot = x => { const q = secs.find(z => x > z.x0 - 6 && x < z.x1 + 6); if (!q) return x; const l = q.x0 - 10, r = q.x1 + 10; return Math.abs(x - l) < Math.abs(x - r) && !wet(l) ? l : !wet(r) ? r : l; };   /* rotten boards are for the lure only: stood on otherwise they go under you */
  /* -1. IN THE FEN: swim for the nearest boards and jump out (the water drains you) */
  if (P.y > G.floorY + 6) { let best = null; for (let dx = 0; dx < 200 && best === null; dx += 8) for (const sg of [-1, 1]) { const x = P.x + sg * dx; if (best === null && x > lo && x < hi && !wet(x)) best = x; } out.gx = best ?? P.x; out.jump = true; out.swim = true; out.why = 'out of the fen'; return out; }
  /* 0b. a rotten section about to go under me (and he is not setting his bulge on it): off it */
  if (onSec && P.ground && onSec.bow > onSec.hold - 0.7 && !(e.mode === 'burstTell' && !e.locked)) { out.gx = offRot(P.x); out.why = 'off the bowing boards'; return out; }
  /* 0. a jump is carried through */
  if (!P.ground && mem.jumpT !== undefined && t - mem.jumpT < 0.5) { out.gx = mem.jumpX; out.why = 'in the air'; return out; }
  /* 1. OFF A RING */
  if (inRing(P.x) && P.ground && e.mode !== 'stuck') { const [cx, r] = rings.find(([x0, r0]) => Math.abs(P.x - x0) < r0); out.gx = safeX(P.x + (P.x < cx ? -r - 8 : r + 8)); out.why = 'off the clod\'s ring'; return out; }
  /* 2. THE RIP: off the boards that flash red */
  if (e.mode === 'ripTell') { const bad = G.rip.find(([a, b]) => P.x > a - 10 && P.x < b + 10); if (bad && seenFor('rip' + S.act, 0.25)) { const l = bad[0] - 20, r = bad[1] + 20; out.gx = Math.abs(P.x - l) < Math.abs(P.x - r) ? l : r; out.why = 'off the red boards'; return out; } }
  /* 3. THE BURST: on a rotten section, wait for the bulge to SET (red), then step off it; on sound boards, step off the bulge */
  if (e.mode === 'burstTell') {
    const key = 'b' + S.act;
    if (e.locked && seenFor(key + 'l', s.v2 ? 0.05 : 0.12)) { const lx = e.lockX, need = BT.burst.r + 10;
      if (Math.abs(P.x - lx) < need) { const sec = secs.find(q => lx > q.x0 && lx < q.x1); let l = (sec ? sec.x0 : lx - need) - 8, r = (sec ? sec.x1 : lx + need) + 8;
        if (wet(l)) l = lx - need - 30; if (wet(r)) r = lx + need + 30; out.gx = clamp(Math.abs(P.x - l) < Math.abs(P.x - r) ? l : r); out.why = 'step off the set bulge'; return out; }
      out.gx = P.x; out.face = Math.sign(lx - P.x) || 1; out.why = 'clear of the bulge: ready'; return out; }
    if (onSec && !roll(key + 'm', PLAN.missLure)) { out.gx = clamp((onSec.x0 + onSec.x1) / 2); out.why = 'the lure: hold the rotten boards'; return out; }
    if (!onSec && Math.abs(P.x - e.x) < BT.burst.r + 14 && seenFor(key + 'f', 0.3)) { out.gx = safeX(P.x + (P.x < e.x ? -40 : 40)); out.why = 'step off the bulge'; return out; }
    const near = secs.slice().sort((a, b) => Math.abs((a.x0 + a.x1) / 2 - P.x) - Math.abs((b.x0 + b.x1) / 2 - P.x))[0];
    if (near && Math.abs((near.x0 + near.x1) / 2 - P.x) < 60) { out.gx = clamp((near.x0 + near.x1) / 2); out.why = 'to a rotten section'; return out; }
    out.gx = P.x; out.why = 'the bulge: watch it'; return out; }
  /* 4. HIS TELLS (a reaction late, some misread) */
  if (btTelling(e) || e.mode === 'drag') {
    const key = 'a' + S.act + e.mode, miss = s.v2 ? false : roll(key + 'm', PLAN.miss);
    if (seenFor(key) && !miss) {
      if ((e.mode === 'dragTell' || e.mode === 'drag') && (P.x - kx) * (e.face || 1) > 0 && dx < BT.drag.reach + 30) {
        if (e.mode === 'drag' || e.modeT < 0.24) { if (s.dodge && P.ground && !roll(key + 'd', 0.85)) { out.dodge = true; out.gx = P.x + (e.face || 1) * 30; out.why = 'roll the drag'; return out; }
          if (P.ground) { out.jump = true; out.gx = P.x; mem.jumpT = t; mem.jumpX = P.x; out.why = 'jump the drag'; return out; } }
        out.gx = P.x; out.why = 'his drag: ready to jump it'; return out; }
      if (e.mode === 'hurlTell') { out.gx = safeX(P.x + (P.x < G.mid ? 34 : -34)); out.why = 'the hurl: keep moving'; return out; }
    } }
  /* 5. OPEN: strike him (stuck) - from the sound boards at the wreck's edge */
  if (btOpen(e)) { const sd = s.tip ? BT.stuck.w / 2 + s.tip : half + Math.max(6, reach - 10); let sx = kx + side * sd; if (wet(sx)) sx = kx - side * sd; out.gx = clamp(sx);   /* (the warden at her point's distance: inside the shaft she only glances) */
    if (dx < (s.tip ? sd + 8 : hitR + 4)) swing(); out.why = 'strike him: stuck'; return out; }
  if (S.ward > 0 || e.mode === 'heave') { out.gx = safeX(kx + side * 90); out.why = 'his ward: off him'; return out; }
  /* 6. HE IS DOWN THERE: go and stand on a rotten section (the lure) */
  if (e.mode === 'sink' || e.mode === 'under') {
    const near = secs.slice().sort((a, b) => Math.abs((a.x0 + a.x1) / 2 - P.x) - Math.abs((b.x0 + b.x1) / 2 - P.x))[0];
    if (near && !roll('lure' + S.act, PLAN.missLure)) { out.gx = clamp((near.x0 + near.x1) / 2); out.why = 'the lure: onto the rotten boards'; return out; }
    out.gx = P.x; out.why = 'he is under: wait'; return out; }
  if (s.rest) { out.gx = safeX(kx + side * 120); out.why = 'winded: off him'; return out; }
  /* 7. HE IS UP: a cut when he rests (his hide turns most of it), off him otherwise */
  if (e.mode === 'up' || e.mode === 'recover' || e.mode === 'roar') {
    if (dx < hitR + 30 && roll('cut' + S.act, 0.55)) { const sd = s.tip ? half + s.tip : Math.max(half + 6, reach - 6); out.gx = offRot(safeX(kx + side * sd)); if (dx < (s.tip ? sd + 8 : hitR)) swing(); out.why = 'a cut while he is up'; return out; }
    out.gx = offRot(safeX(kx + side * Math.max(hitR + 16, 70))); out.face = Math.sign(kx - P.x) || 1; out.why = 'stand off him'; return out; }
  out.gx = offRot(safeX(kx + side * Math.max(hitR + 16, 70))); out.face = Math.sign(kx - P.x) || 1; out.why = 'stand off him'; return out;
}
