// src/old-tusker.js - OLD TUSKER, THE GREAT BOAR OF THE FELLING CLEARING (claude/oldtusker; scratch/brief-first2.md '!! 10-19 21:42', Daniel-approved).
// He replaces THE HORNET QUEEN as THE LUMBER TRAIL's boss (she is PARKED for a future Hornet's Nest level: her code stays, and a save that cleared her keeps the clear).
// This file is the fight, PURE (his moves, his two phases, the clearing's marked pines, what a blow does to him, and the bot's plan); src/old-tusker-hands.js binds it
// to the world (main.js) and draws him. tools/old-tusker.mjs is its check.
// HEADER (design-standard B11 / B14 / B15): A BEAST BOSS WITH A RULE OPENING. He is ALWAYS HITTABLE, never invulnerable:
//   HIS HIDE TURNS A CUT: a blow at his height lands at OT.hide (0.4, the B15 floor; told: a clank and THICK HIDE). COME DOWN ON HIS BACK (a plunge - the badger/boar
//     lesson the trail teaches) and it lands whole (OT.above).
//   THE LEVEL'S RULE IS HIS OPENING (B1): "four strokes fell a marked pine, and it falls the way it leans ... on whoever stands under it". Four marked pines stand at the
//     clearing's edges, two a side, each leaning in over the floor (its fall line is drawn on the ground, gold; red while he stands in it). Strokes stay in a pine (it
//     creaks and leans further), so three strokes can be laid in early and the fourth struck when he is under it: the pine comes down ON HIM and he is PINNED -
//     the shared OPEN read (B10: a GOLD ring and a timer bar), blows land x2 (OT.pin.mul) for OT.pin.t.
//   HE RAMS A FELLED TRUNK (claude/tuskerfix, Daniel's playtest 10-21: "he gets stunned by random trees, even if they're not actually fallen"): a STANDING pine is no
//     obstacle - he charges and walks past it (it stands at the clearing's edge, behind the fight; it is no cover from his tusks either). A pine felled that MISSES him
//     lies across the floor as a TRUNK (OT.pine.lie s): a wall to him. He will not walk over it, and a CHARGE that meets it RAMS it - he reels (DAZED, OT.daze, x1.25)
//     and the trunk SPLINTERS (spent: fell another; the treeline gives up a new marked pine OT.pine.rearm s later). The clearing's wall still stops (and dazes) a charge.
//     THE RULE, ONE LINE: FELL A PINE - ON HIM = PINNED (long, x2); IN HIS PATH = HE RAMS IT (short, x1.25).
//   THE WARD (B3): when a pin ends he heaves the trunk off and shakes himself - a told ~3 s ward (a pale ring, WARDED on every blow, a pine felled on him then bounces off).
//   ONE NEW MOVE PER PHASE (B5) and every move TOLD with its own windup and release pose (B16) and its own sound:
//     P1 (100-50%)  THE CHARGE (paw + snort + dust, red !!: jump it, roll it, or be behind a felled trunk)   THE TUSK SWEEP (a yellow !: jump it or parry it)
//                   THE ROOT-UP (he digs in and flings three clods in arcs - red rings mark where they land: step off them)
//     P2 (50-0%)    HIS BLOOD IS UP: THE DOUBLE CHARGE (a charge that misses does not stop at the wall - he skids, turns and comes straight back) and THE STOMP (he rears: two
//                   shockwaves run out along the ground both ways - jump them). He does not stagger off the first charge of a double, only the second.
//   NO ADDS (Daniel: no adds unless the brief says so).
export const OT = {
  hp: 750, w: 46, h: 26, markH: 44,
  walk: 52, rest: [0.75, 0.5],                   // px/s; the beat between moves (P1, P2)
  hide: 0.4, above: 1, wardMul: 0.4,             // B15: the floor outside openings; a plunge on his back lands whole
  p2: 0.5,
  charge: { tell: [0.95, 0.72], speed: 290, dmg: 10, hitH: 20, turn: 0.42, minD: 104 },
  daze: { t: [1.45, 1.2], mul: 1.25 },           // he rams a felled trunk or the wall: reels (a short, told opening)
  sweep: { tell: [0.72, 0.58], t: 0.26, reach: 46, h: 16, dmg: 12, chip: 0.5, rec: 0.55, range: 70 },
  root: { tell: [0.85, 0.72], n: 3, flight: 1.05, r: 16, dmg: 10, rec: 0.6, spread: 64 },
  stomp: { tell: 0.78, sp: 150, life: 1.9, dmg: 14, rec: 0.75, w: 7 },
  pin: { t: 3.4, mul: 2, thrash: 0.55, ward: 3, trunk: 0.04, cap: 0.14 },   // cap: a pin is worth this share of him at most - the blow that empties it, he heaves the trunk off (told)   // trunk: the falling pine's own blow on him (a share of his health, a room blow)
  pine: { strokes: 4, fall: 0.7, len: 7, heroDmg: 10, lie: 20, rearm: 14 },   // lie: a trunk that missed him lies across the floor this long (a wall to him; a charge that rams it splinters it sooner); rearm: s until the treeline gives up another marked pine where a spent one stood (0 = never)
};
export const OT_SAY = { wake: 'OLD TUSKER', rule: 'FELL A PINE: ON HIM, PINNED. IN HIS PATH, HE RAMS IT.', p2: 'HIS BLOOD IS UP', pinned: 'PINNED', dazed: 'HE RAMS THE TRUNK',
  dazedWall: 'HE RAMS THE WALL', bounce: 'IT BOUNCES OFF HIM: WARDED', ward: 'HE HEAVES THE TRUNK OFF', jarred: 'JARRED: PARRY HIS TUSKS, OR JUMP THEM', creak: 'THE PINE CREAKS AND LEANS', timber: 'TIMBER' };
export const OPEN_NAME = { pinned: 'PINNED', rammed: 'DAZED' };
export const otOpen = e => !!e && (e.mode === 'pinned' || e.mode === 'rammed');
const TELLS = new Set(['chargeTell', 'turn', 'sweepTell', 'rootTell', 'stompTell']);
export const otTelling = e => TELLS.has(e.mode);
/* THE CLEARING (px): x0/x1 the floor's ends inside the walls, floorY, and the pines: arena.pines = [{ col, dir }] (dir: the way it leans and falls, +1 east) */
export function geom(A, TS = 16) {
  const pines = (A.pines || []).map((p, i) => ({ id: i, x: p.col * TS + 8, dir: p.dir, len: p.len || OT.pine.len }));
  return { x0: A.x0, x1: A.x1, floorY: A.floor, mid: (A.x0 + A.x1) / 2, start: A.start ? A.start[0] * TS + 8 : (A.x0 + A.x1) / 2 + 80, pines, TS };
}
/* a pine's fall line on the floor: [lo, hi] px */
export const lineOf = p => { const a = p.x + p.dir * 8, b = p.x + p.dir * (p.len * 16); return [Math.min(a, b), Math.max(a, b)]; };
export const underLine = (p, x, half = 0) => { const [lo, hi] = lineOf(p); return x + half > lo && x - half < hi; };
export function newFight(G) {
  return { G, ph: 1, ward: 0, act: 0, last: [], walkT: 0, restT: 1, clods: [], waves: [], told: {}, n: { charge: 0, sweep: 0, root: 0, stomp: 0, pinned: 0, rammed: 0, bounced: 0, strokes: 0 },
    pines: G.pines.map(p => ({ ...p, hp: OT.pine.strokes, st: 'stand', t: 0, lean: 0, onHim: false })), trunk: null };
}
/* (claude/tuskerfix) the FELLED TRUNKS lying on the floor (a pine that missed him): his walls. A standing pine is no obstacle any more. */
export const trunks = S => S.pines.filter(p => p.st === 'down');
/* a trunk's near end, met going dir (px): its west end going east, its east end going west */
export const trunkEnd = (p, dir) => { const [lo, hi] = lineOf(p); return dir > 0 ? lo : hi; };
/* what stops his charge (and his walk), going dir from x: the nearest felled trunk whose near end is ahead of him, else the wall. Returns { x (where his body stops), pine (the trunk, or null) } */
export function chargeStop(S, x, dir) {
  const half = OT.w / 2, G = S.G; let best = null, bd = Infinity;
  for (const p of trunks(S)) { const d = (trunkEnd(p, dir) - x) * dir; if (d > half - 6 && d < bd) { best = p; bd = d; } }
  if (best) return { x: trunkEnd(best, dir) - dir * (half + 3), pine: best };
  return { x: dir > 0 ? G.x1 - half - 2 : G.x0 + half + 2, pine: null };
}
/* a felled trunk lying between him (x) and the hero (hx) */
export const trunkBetween = (S, x, hx) => { const dir = Math.sign(hx - x) || 1; return trunks(S).find(p => { const n = trunkEnd(p, dir); return (n - x) * dir > OT.w / 2 - 6 && (hx - n) * dir > 0; }) || null; };
/* A HERO'S STROKE on a pine (its blow box hit it): the pine creaks and leans; the fourth stroke starts its fall */
export function strokePine(S, p, w) {
  if (!p || p.st !== 'stand') return false;
  p.hp--; p.lean = (OT.pine.strokes - p.hp) * 0.06; S.n.strokes++; w.sound('stroke');
  if (!S.told['stroke' + p.id]) { S.told['stroke' + p.id] = 1; w.number(p.x, S.G.floorY - 84, p.hp > 0 ? OT_SAY.creak : OT_SAY.timber, '#ffd36b'); }
  if (p.hp <= 0) { p.st = 'fall'; p.t = OT.pine.fall; w.sound('creak'); }
  return true;
}
/* ---------- ONE FRAME OF HIM. heroes: [{ x, y, ground, alive, pp }]; w: the world (src/old-tusker-hands.js world()) ---------- */
export function stepTusker(e, S, dt, heroes, w) {
  const G = S.G, ph = S.ph, i = ph - 1, P = heroes.find(h => h.alive) || heroes[0];
  S.ward = Math.max(0, S.ward - dt); e.ward = S.ward;
  stepPines(e, S, dt, heroes, w);
  stepClods(S, dt, heroes, w); stepWaves(S, dt, heroes, w);
  if (e.mode === 'sleep') return;
  e.modeT -= dt;
  const dx = P ? P.x - e.x : 0, ad = Math.abs(dx);
  /* THE PHASE: at half he roars (never through a pin or a daze: it waits for him to be on his feet) */
  if (S.ph < 2 && e.hp <= e.maxHp * OT.p2 && (e.mode === 'walk' || e.mode === 'recover')) {
    S.ph = 2; e.phase = 2; w.number(e.x, e.y - OT.h - 30, OT_SAY.p2, '#ff6b6b'); w.sound('roar'); w.shake(6); w.music(2);
    e.mode = 'stompTell'; e.modeT = OT.stomp.tell; w.mark('!!'); S.act++; return; }
  const face = () => { if (P) e.face = Math.sign(dx) || e.face; };
  const half = OT.w / 2, floor = G.floorY;
  const slide = vx => { if (!vx) return; const sg = Math.sign(vx); let x = Math.max(G.x0 + half + 2, Math.min(G.x1 - half - 2, e.x + vx * dt));
    /* (claude/tuskerfix) a FELLED trunk is a wall in his way (he walks up to it, never over it - he rams it); a standing pine he walks past */
    const st = chargeStop(S, e.x, sg); if (st.pine && (x - st.x) * sg > 0) x = (e.x - st.x) * sg > 0 ? e.x : st.x;
    e.x = x; };
  switch (e.mode) {
    case 'wake': if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0; S.restT = 0.6; } return;
    case 'walk': {
      face(); S.restT -= dt;
      const want = ad > OT.sweep.range - 10 ? Math.sign(dx) * OT.walk * (ph > 1 ? 1.25 : 1) : 0; slide(want); S.walkT += dt;
      if (S.restT > 0 || !P || !P.alive) return;
      S.coverP = P && trunkBetween(S, e.x, P.x) ? 1 : 0;   /* (claude/tuskerfix) a felled trunk lies between him and the hero */
      pick(e, S, ad, w); return; }
    case 'chargeTell':
      if (e.modeT > OT.charge.tell[i] * 0.45) face();   /* (he picks his line in the first half of the paw; after that it is set) */
      if (e.modeT <= 0) { e.mode = 'charge'; e.modeT = 4; e.hitKey = 'ch' + S.act + (e.charge2 ? 'b' : 'a'); const st = chargeStop(S, e.x, e.face); e.stopX = st.x; e.stopPine = st.pine ? st.pine.id : -1; w.sound('charge'); }
      return;
    case 'charge': {
      const sp = OT.charge.speed * (ph > 1 ? 1.08 : 1), st = chargeStop(S, e.x, e.face); e.stopX = st.x; e.stopPine = st.pine ? st.pine.id : -1;
      const nx = e.x + e.face * sp * dt; w.dust(e.x - e.face * half, floor, 1);
      w.hit([e.x - half + 4, e.x + half - 4, floor - OT.charge.hitH, floor], OT.charge.dmg, 'charge', { key: e.hitKey, knock: e.face * 240 });
      if ((st.x - nx) * e.face <= 0 || e.modeT <= 0) { e.x = st.x;
        if (ph > 1 && !e.charge2 && !st.pine) { e.mode = 'turn'; e.modeT = OT.charge.turn; e.charge2 = true; w.sound('skid'); w.dust(e.x, floor, 8); return; }
        e.charge2 = false; e.mode = 'rammed'; e.modeT = OT.daze.t[i]; e.openT0 = e.modeT; S.n.rammed++; w.shake(7); w.sound('ram'); w.dust(e.x + e.face * half, floor - 10, 10);
        w.number(e.x, e.y - OT.h - 24, st.pine ? OT_SAY.dazed : OT_SAY.dazedWall, '#ffd36b');
        if (st.pine) { const p = S.pines[st.pine.id]; p.st = 'spent'; p.t = OT.pine.rearm; S.n.trunkRams = (S.n.trunkRams || 0) + 1; w.splinter({ id: p.id, x: p.x }); w.sound('timber'); } return; }   /* (claude/tuskerfix) the trunk he rams SPLINTERS: spent, fell another */
      e.x = nx; return; }
    case 'turn': if (e.modeT <= 0) { face(); e.mode = 'chargeTell'; e.modeT = 0.32; w.sound('snort'); w.mark('!!'); } return;
    case 'rammed': if (e.modeT <= 0) { e.mode = 'walk'; S.restT = OT.rest[i] * 0.6; } return;
    case 'sweepTell': if (e.modeT <= 0) { e.mode = 'sweep'; e.modeT = OT.sweep.t; e.hitKey = 'sw' + S.act; e.barked = false; w.sound('sweep'); } return;
    case 'sweep': {
      const f = e.face, a = e.x + f * (half - 8); let b = e.x + f * (half + OT.sweep.reach);   /* (claude/tuskerfix) a STANDING pine is no cover any more (jump his tusks or parry them) - */
      for (const p of trunks(S)) { const n = trunkEnd(p, f); if ((n - a) * f > -4 && (b - n) * f > 0) { b = n; if (!e.barked) { e.barked = true; w.sound('clank'); } } }   /* - but a FELLED trunk is: his tusks bite its bark, not you beyond it */
      w.hit([Math.min(a, b), Math.max(a, b), floor - OT.sweep.h, floor], OT.sweep.dmg, 'sweep', { key: e.hitKey, blockable: true, blockChip: OT.sweep.chip, knock: f * 180 });
      if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = OT.sweep.rec; } return; }
    case 'rootTell': if (Math.random() < dt * 20) w.dust(e.x + e.face * half, floor, 1);
      if (e.modeT <= 0) { e.mode = 'root'; e.modeT = 0.35; w.sound('root'); const px = P ? P.x : e.x, sp = OT.root.spread;
        const ts = [px, px - sp, px + sp].slice(0, OT.root.n).map(x => Math.max(G.x0 + 10, Math.min(G.x1 - 10, x)));
        for (const tx of ts) S.clods.push({ x0: e.x + e.face * half, y0: floor - 12, tx, t: 0, T: OT.root.flight, key: 'cl' + S.act + '.' + tx.toFixed(0) }); }
      return;
    case 'root': if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = OT.root.rec; } return;
    case 'stompTell': if (e.modeT <= 0) { e.mode = 'stomp'; e.modeT = 0.3; w.sound('stomp'); w.shake(8); w.dust(e.x, floor, 14);
        for (const d of [-1, 1]) S.waves.push({ x: e.x + d * (half - 6), dir: d, life: OT.stomp.life, key: 'wv' + S.act + d }); }
      return;
    case 'stomp': if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = OT.stomp.rec; } return;
    case 'recover': if (e.modeT <= 0) { e.mode = 'walk'; S.restT = OT.rest[i]; } return;
    case 'pinned': if (e.modeT <= 0) { e.mode = 'thrash'; e.modeT = OT.pin.thrash; w.sound('thrash'); w.shake(5); } return;
    case 'thrash': if (e.modeT <= 0) { e.mode = 'walk'; S.restT = 0.4; S.ward = OT.pin.ward; e.ward = S.ward; w.fx('ward', e.x, e.y); w.number(e.x, e.y - OT.h - 24, OT_SAY.ward, '#c8d8e8');
        if (S.trunk) { const p = S.pines[S.trunk.id]; p.st = 'spent'; p.onHim = false; p.t = OT.pine.rearm; w.splinter(S.trunk); S.trunk = null; } }
      return;
    default: e.mode = 'walk';
  }
}
/* WHICH MOVE: close in, the sweep; at range, the charge or the root-up; from his phase two, the stomp too. Never the same move three times running. */
function pick(e, S, ad, w) {
  const ph = S.ph, i = ph - 1, last = S.last, twice = k => last.length >= 2 && last[0] === k && last[1] === k;
  let k;
  const cover = S.coverP;   /* (stepTusker sets it: a felled trunk between him and the hero - he cannot walk over it: he roots clods over it, or charges it down) */
  if (cover) k = Math.random() < (ph > 1 ? 0.35 : 0.45) && !twice('root') ? 'root' : ph > 1 && Math.random() < 0.4 ? 'stomp' : 'charge';
  else if (ad < OT.sweep.range) k = ph > 1 && Math.random() < 0.35 && !twice('stomp') ? 'stomp' : 'sweep';
  else if (ad > OT.charge.minD) { const r = Math.random(); k = r < (ph > 1 ? 0.5 : 0.6) ? 'charge' : r < (ph > 1 ? 0.78 : 1) ? 'root' : 'stomp'; }
  else { if (S.walkT < 1.1) return; k = Math.random() < 0.6 ? 'root' : ph > 1 ? 'stomp' : 'charge'; }
  if (twice(k)) k = k === 'charge' ? 'root' : k === 'sweep' ? (ad > 40 ? 'root' : 'charge') : 'charge';
  if (k === 'charge' && ad < 50 && !cover) k = 'sweep';
  last.unshift(k); last.length = Math.min(last.length, 3); S.walkT = 0; S.act++; S.n[k]++;
  if (k === 'charge') { e.mode = 'chargeTell'; e.modeT = OT.charge.tell[i]; e.charge2 = false; w.mark('!!'); w.sound('snort'); }
  else if (k === 'sweep') { e.mode = 'sweepTell'; e.modeT = OT.sweep.tell[i]; w.mark('!'); w.sound('grunt'); }
  else if (k === 'root') { e.mode = 'rootTell'; e.modeT = OT.root.tell[i]; w.mark('!!'); w.sound('dig'); }
  else { e.mode = 'stompTell'; e.modeT = OT.stomp.tell; w.mark('!!'); w.sound('rear'); }
}
/* THE PINES: a felled pine falls for OT.pine.fall, then lands - on him (PINNED, unless his ward is up: it bounces off), on a hero under its line (it hurts), or on the empty floor */
function stepPines(e, S, dt, heroes, w) {
  for (const p of S.pines) {
    if (p.shake > 0) p.shake -= dt;
    if (p.st === 'fall') { p.t -= dt; if (p.t > 0) continue;
      p.st = 'down'; p.t = OT.pine.lie; w.sound('timber'); w.shake(8); const [lo, hi] = lineOf(p); for (let k = 0; k < 6; k++) w.dust(lo + (hi - lo) * k / 5, S.G.floorY, 4);
      for (const h of heroes) if (h.alive && h.ground !== false && Math.abs(h.y - S.G.floorY) < 20 && underLine(p, h.x, 4)) w.hitHero(h, OT.pine.heroDmg, 'pine');
      const onFloor = Math.abs(e.y - S.G.floorY) < 6;
      if (e.alive && e.mode !== 'sleep' && onFloor && underLine(p, e.x, OT.w / 2 - 6)) {
        if (S.ward > 0 || e.mode === 'thrash' || e.mode === 'pinned') { S.n.bounced++; w.number(e.x, e.y - OT.h - 24, OT_SAY.bounce, '#c8d8e8'); w.sound('clank'); }
        else { e.mode = 'pinned'; e.modeT = OT.pin.t; e.openT0 = OT.pin.t; S.purse = e.maxHp * OT.pin.cap; e.charge2 = false; S.n.pinned++; p.onHim = true; S.trunk = { id: p.id, x: e.x }; p.st = 'pin';
          w.number(e.x, e.y - OT.h - 24, OT_SAY.pinned, '#ffd36b'); w.fx('open', e.x, e.y); w.trunkBlow(Math.max(1, Math.round(e.maxHp * OT.pin.trunk))); }
      }
      continue; }
    if (p.st === 'down') { p.t -= dt; if (p.t <= 0) { p.st = 'spent'; p.t = OT.pine.rearm; w.splinter({ id: p.id, x: p.x }); } continue; }
    if (p.st === 'spent' && OT.pine.rearm > 0) { p.t -= dt; if (p.t <= 0) { p.st = 'stand'; p.hp = OT.pine.strokes; p.lean = 0; } }
  }
}
function stepClods(S, dt, heroes, w) {
  for (const c of S.clods) { c.t += dt; if (c.t < c.T || c.done) continue; c.done = true; w.dust(c.tx, S.G.floorY, 6); w.sound('clod');
    w.hit([c.tx - OT.root.r, c.tx + OT.root.r, S.G.floorY - 22, S.G.floorY + 2], OT.root.dmg, 'clod', { key: c.key }); }
  S.clods = S.clods.filter(c => !c.done);
}
function stepWaves(S, dt, heroes, w) {
  for (const q of S.waves) { q.life -= dt; q.x += q.dir * OT.stomp.sp * dt; if (q.x < S.G.x0 || q.x > S.G.x1) q.life = 0;
    for (const h of heroes) if (h.alive && h.ground && Math.abs(h.y - S.G.floorY) < 6 && Math.abs(h.x - q.x) < OT.stomp.w) w.hitHero(h, OT.stomp.dmg, 'stomp', q.key); }
  S.waves = S.waves.filter(q => q.life > 0);
}
/* where a clod is in its arc (px): k in 0..1 */
export function clodAt(c, floorY) { const k = Math.min(1, c.t / c.T); return { x: c.x0 + (c.tx - c.x0) * k, y: c.y0 + (floorY - c.y0) * k - Math.sin(k * Math.PI) * 70 }; }
/* ---------- A BLOW ON HIM (B15) -> [what lands, the word or null] ---------- */
export function takeBlow(e, S, dmg, plunge) {
  if (S.ward > 0 || e.mode === 'thrash') return [Math.max(1, Math.round(dmg * OT.wardMul)), 'WARDED'];
  if (e.mode === 'pinned') { const d = Math.round(dmg * OT.pin.mul), left = S.purse ?? Infinity; if (d >= left) { S.purse = 0; e.modeT = 0; return [Math.max(1, Math.round(left)), null]; } S.purse = left - d; return [d, null]; }
  if (e.mode === 'rammed') return [Math.round(dmg * OT.daze.mul), null];
  if (plunge) return [Math.round(dmg * OT.above), null];
  return [Math.max(1, Math.round(dmg * OT.hide)), 'THICK HIDE'];
}

/* ---------- THE BOT (src/lab.js): what a player reads - his tells a reaction late, the clods' marks, the waves, the pines' lines and strokes - and THE RULE: lay three
   strokes in a pine, stand behind it (its wall side, out of its line), and strike the fourth when he is under it (rammed into it, or in a tell close by) ---------- */
export const PLAN = { react: 0.25, miss: 0.12, missFell: 0.2 };
/* the plan, then THE GROUND'S HAZARDS over it: never walk back onto a clod's red ring or under a falling pine to get to a spot (the oscillation that fed the clods) */
export function otPlan(s) {
  const out = otPlan0(s), S = s.S, P = s.P, G = S.G, hz = otHazards(S);
  if (out.gx != null && !out.jump && P.ground) { const bad = x => hz.some(([hx, r]) => Math.abs(x - hx) < r);
    if (bad(out.gx) && !bad(P.x)) { out.gx = P.x; out.atk = out.atk && Math.abs(P.x - s.e.x) < s.reach + OT.w / 2; out.why += " (waits: the spot is under a mark)"; } }
  if (globalThis.__otWhy) { const k = out.why.replace(/ \(.*/, ''); globalThis.__otWhy[k] = (globalThis.__otWhy[k] || 0) + 1; }   /* (a lab probe: what the plan spent its frames on) */
  return out;
}
export const otHazards = S => [...S.clods.map(c => [c.tx, OT.root.r + 12]), ...S.pines.filter(p => p.st === "fall").map(p => { const [lo, hi] = lineOf(p); return [(lo + hi) / 2, (hi - lo) / 2 + 10]; })];
function otPlan0(s) {
  const { P, e, S, reach } = s, G = S.G, out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, down: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = s.v2 ? 0 : PLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const half = OT.w / 2, lo = G.x0 + 10, hi = G.x1 - 10, clamp = x => Math.max(lo, Math.min(hi, x));
  const kx = e.x, side = Math.sign(P.x - kx) || 1, dx = Math.abs(kx - P.x), hitR = reach + half - 4;
  const swing = fx => { out.face = Math.sign(fx - P.x) || out.face; out.atk = P.atk < 0; };
  const hazards = otHazards(S);
  const inHaz = x => hazards.some(([hx, r]) => Math.abs(x - hx) < r);
  const safeX = x => { let q = clamp(x); for (let k = 0; k < 3; k++) for (const [hx, r] of hazards) if (Math.abs(q - hx) < r) q = clamp(q < hx ? hx - r - 4 : hx + r + 4); return q; };
  /* 0. the jump is carried through */
  if (!P.ground && mem.jumpT !== undefined && t - mem.jumpT < 0.5) { out.gx = mem.jumpX; out.why = 'in the air'; if (mem.plunge && Math.abs(P.x - kx) < half && P.y < e.y - OT.h && P.vy > -40) { out.down = true; out.atk = P.atk < 0; out.why = 'plunge his back'; } return out; }
  /* 1. OFF A CLOD'S MARK; OVER A WAVE */
  if (inHaz(P.x) && P.ground) { const [hx, r] = hazards.find(([x0, r0]) => Math.abs(P.x - x0) < r0); out.gx = safeX(P.x + (P.x < hx ? -r - 8 : r + 8)); out.why = 'off the clod\'s mark'; return out; }
  const wave = S.waves.find(q => (P.x - q.x) * q.dir > 0 && Math.abs(P.x - q.x) < 40);
  if (wave && P.ground && seenFor('wv' + wave.key, 0.1)) { out.jump = true; out.gx = P.x; mem.jumpT = t; mem.jumpX = P.x; mem.plunge = false; out.why = 'jump the wave'; return out; }
  /* where he will be in a moment, and which pine stands between us (it stops his charge) */
  const between = trunkBetween(S, kx, P.x);   /* (claude/tuskerfix) a FELLED trunk between us: his charge rams it, his walk stops at it */
  /* 1b. THE FOURTH STROKE FIRST: he is under a primed pine and about to be busy for a while (a tell just begun, his recovery, a ram) - strike it, then dodge his move */
  for (const p of S.pines) { if (p.st !== 'stand' || p.hp > 1 || S.ward > 0) continue; const spot = p.x - p.dir * 12;
    const busy = e.mode === 'rammed' ? e.modeT > 0.45 : e.mode === 'recover' ? e.modeT > 0.3 : (e.mode === 'sweepTell' || e.mode === 'rootTell' || e.mode === 'stompTell' || e.mode === 'chargeTell') && e.modeT > 0.35;
    if (busy && underLine(p, kx, half - 8) && Math.abs(P.x - spot) < 10 && P.ground && !roll('fell' + S.act + p.id, PLAN.missFell)) { out.gx = spot; out.face = p.dir; out.atk = P.atk < 0; out.why = 'the fourth stroke: he is under it'; return out; } }
  /* 2. HIS TELLS (a reaction late, some misread) */
  if (otTelling(e) || e.mode === 'charge' || e.mode === 'sweep' || e.mode === 'stomp') {
    const key = 'a' + S.act + e.mode, miss = s.v2 ? false : roll(key + 'm', PLAN.miss), seen = seenFor('a' + S.act + (e.mode === 'charge' || e.mode === 'turn' ? 'chargeTell' : e.mode));   /* (claude/tuskerfix) the run itself was read off its paw: the reaction clock starts at the tell, not when he is already on you */
    if (seen && !miss) {
      if ((e.mode === 'chargeTell' || e.mode === 'turn' || e.mode === 'charge') && !between) {
        const toward = (P.x - kx) * e.face > 0, gap = Math.abs(P.x - kx) - half;
        if (e.mode === 'charge' && toward && gap < 52 + (s.v2 ? 0 : 6)) { if (s.dodge && !roll(key + 'd', 0.5)) { out.dodge = true; out.gx = P.x - e.face * 30; out.why = 'roll the charge'; return out; }
          out.jump = P.ground; out.gx = P.x + e.face * 6; mem.jumpT = t; mem.jumpX = out.gx; mem.plunge = false; out.why = 'jump the charge'; return out; }
        out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; out.why = 'his charge: ready to jump it'; return out; }
      if ((e.mode === 'chargeTell' || e.mode === 'charge' || e.mode === 'turn') && between) { out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; out.why = 'behind the trunk: let him ram it'; return out; }
      if ((e.mode === 'sweepTell' || e.mode === 'sweep') && dx < half + OT.sweep.reach + 14) {
        if (s.shield && !roll(key + 'b', 0.4)) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the sweep'; return out; }
        if (e.mode === 'sweepTell' && e.modeT < 0.17 && P.ground) { out.jump = true; out.gx = P.x; mem.jumpT = t; mem.jumpX = P.x; mem.plunge = true; out.why = 'jump the sweep'; return out; }
        out.gx = safeX(kx + side * (half + OT.sweep.reach + 26)); out.why = 'out of the sweep'; return out; }
      if (e.mode === 'stompTell' && dx < 70) { out.gx = safeX(kx + side * 90); out.why = 'back off the stomp'; return out; }
      if (e.mode === 'rootTell') { out.gx = safeX(P.x + (P.x < G.mid ? 30 : -30)); out.why = 'the root-up: keep moving'; return out; }
    }
  }
  /* 3. OPEN: strike him (pinned or dazed); WARDED: off him */
  if (otOpen(e) && !(e.mode === 'rammed' && dx - half > e.modeT * 110 + 10)) { const sx = kx + side * (s.tip ? 30 : 8 + half); out.gx = safeX(sx);
    /* a dazed boar under a pine you have laid strokes in: the fourth stroke is better than a cut */
    if (e.mode === 'rammed' && e.modeT > OT.pine.fall + 0.1) { const pr = S.pines.find(p => p.st === 'stand' && (p.hp <= 1 || (p.hp - 1) * 0.36 + OT.pine.fall < e.modeT) && underLine(p, kx, half - 6) && Math.abs(P.x - (p.x - p.dir * 12)) < 64);
      if (pr && !roll('fell' + S.act + pr.id, PLAN.missFell)) { out.gx = pr.x - pr.dir * 12; out.face = pr.dir; if (Math.abs(P.x - out.gx) < 8) out.atk = P.atk < 0; mem.strike = pr.id; out.why = 'the fourth stroke: he is under it'; return out; } }
    if (dx < hitR + 4) swing(kx); out.why = 'strike him: ' + (OPEN_NAME[e.mode] || 'open').toLowerCase(); return out; }
  if (S.ward > 0 || e.mode === 'thrash') { out.gx = safeX(kx + side * 100); out.why = 'his ward: off him'; return out; }
  if (s.rest) { const tr = trunks(S)[0];   /* winded: catch your breath behind a felled trunk (he cannot walk over it), else well off him */
    if (tr) { const d = Math.sign((lineOf(tr)[0] + lineOf(tr)[1]) / 2 - kx) || 1; out.gx = safeX(trunkEnd(tr, d) + d * 40); out.face = -d; out.why = 'winded: behind the trunk'; return out; } out.gx = safeX(kx + side * 130); out.why = 'winded: off him'; return out; }
  /* 4. THE RULE: a primed pine (one stroke left) he stands under - strike it */
  for (const p of S.pines) { if (p.st !== 'stand' || p.hp > 1) continue; const spot = p.x - p.dir * 12;
    const still = e.mode === 'rammed' || (/Tell$/.test(e.mode) && e.modeT > 0.4) || e.mode === 'recover';
    if (underLine(p, kx, half - 6) && still && Math.abs(P.x - spot) < 10 && !roll('fell' + S.act + p.id, PLAN.missFell)) { out.gx = spot; out.face = p.dir; out.atk = P.atk < 0; out.why = 'fell it on him'; return out; } }
  /* 5w. (claude/tuskerfix) THE CLEARING'S COMBO: the OUTER pine of my side felled as a WALL (its trunk ends under the INNER pine's line: he rams it and reels right there),
     then three strokes in the INNER pine - and the fourth when he reels under it (3. above) */
  { if (mem.grp === undefined || !S.pines.some(p => p.dir === mem.grp && (p.st === 'stand' || p.st === 'down'))) { const np = S.pines.filter(p => p.st === 'stand').sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0]; mem.grp = np ? np.dir : undefined; }   /* one side of the clearing, kept */
    const outerOf = ps => ps.slice().sort((a, b) => (a.x - b.x) * a.dir)[0];
    const all = S.pines.filter(p => p.dir === mem.grp), outer = all.length ? outerOf(all) : null, inner = all.find(p => p !== outer);
    const wallDown = outer && outer.st === 'down';
    if (outer && outer.st === 'stand' && Math.sign(outer.x - outer.dir * 12 - kx) === side) { const spot = outer.x - outer.dir * 12;
      if (Math.abs(P.x - spot) > 6) { out.gx = spot; out.why = 'to the outer pine: fell it as a wall'; return out; } out.face = outer.dir; out.atk = P.atk < 0; out.why = 'fell the outer pine: a wall'; return out; }
    if (wallDown && inner && inner.st === 'stand' && inner.hp > 1 && dx > 70) { const spot = inner.x - inner.dir * 12;
      if (Math.abs(P.x - spot) > 6) { out.gx = spot; out.why = 'to the inner pine'; return out; } out.face = inner.dir; out.atk = P.atk < 0; out.why = 'lay a stroke in the inner pine'; return out; } }
  /* 5a. (claude/tuskerfix) A FELLED TRUNK LIES: stand just past its near end (his side), facing him - his charge rams it and he reels in reach */
  const tr = trunks(S).filter(p => { const d = Math.sign((lineOf(p)[0] + lineOf(p)[1]) / 2 - kx) || 1; return (trunkEnd(p, d) - kx) * d > half - 6; }).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
  if (tr) { const d = Math.sign((lineOf(tr)[0] + lineOf(tr)[1]) / 2 - kx) || 1, spot = safeX(trunkEnd(tr, d) + d * 12);
    out.face = -d; if (Math.abs(P.x - spot) > 6) { out.gx = spot; out.why = 'behind the trunk'; return out; }
    if (dx < hitR && (e.mode === 'recover' || e.mode === 'walk')) { swing(kx); out.why = 'a cut over the trunk'; return out; }
    out.why = 'behind the trunk: wait for his charge'; return out; }
  /* 5. THE RULE: go to a pine and lay strokes in it (to one left), then wait behind it */
  const cand = S.pines.filter(p => p.st === 'stand');
  if (cand.length) {
    const mine = p => Math.sign(p.x - p.dir * 12 - kx) === side, near = cand.filter(mine);   /* (claude/tuskerfix) a pine on MY side of him: never walk into him to reach one across the clearing */
    const pool = near.length ? near : cand, kept = mem.pine !== undefined && pool.find(p => p.id === mem.pine);
    const target = kept || pool.sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0]; mem.pine = target.id;
    const spot = target.x - target.dir * 12;
    if (Math.abs(P.x - spot) > 6) { out.gx = spot; out.why = 'to the marked pine'; if (dx < hitR && e.mode === 'recover') swing(kx); return out; }
    out.face = target.dir; if (target.hp > 1) { out.atk = P.atk < 0; out.why = 'lay a stroke in the pine'; return out; }
    /* primed: wait behind it, facing him; a cut if he stands in reach and is slow */
    if (dx < hitR && e.mode === 'recover' && !underLine(target, kx, half - 6)) { swing(kx); out.why = 'a cut while he recovers'; return out; }
    mem.primeT = mem.primeT === undefined || mem.primeId !== target.id ? t : mem.primeT; mem.primeId = target.id;
    if (t - mem.primeT > 1.5 && !trunks(S).length && !underLine(target, kx, half + 20) && dx > 70 && !roll('wall' + target.id + Math.floor(mem.primeT), 0.3)) { out.atk = P.atk < 0; mem.primeT = undefined; out.why = 'fell it as a wall in his path'; return out; }
    out.why = 'behind the primed pine: wait for him under it'; return out;
  }
  /* 6. NO PINES LEFT: come down on his back after he commits, cut him when he reels */
  if (dx < hitR + 30 && (e.mode === 'recover' || e.mode === 'walk') && P.ground && roll('pl' + S.act, 0.6)) { out.jump = true; out.gx = kx; mem.jumpT = t; mem.jumpX = kx; mem.plunge = true; out.why = 'jump to plunge his back'; return out; }
  if (dx < hitR && e.mode === 'recover') { swing(kx); out.gx = P.x; out.why = 'cut him in his recovery'; return out; }
  out.gx = safeX(kx + side * Math.max(hitR + 10, 70)); out.face = Math.sign(kx - P.x) || 1; out.why = 'stand off him'; return out;
}
