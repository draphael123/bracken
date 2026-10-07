// ===== BENCHED (claude/lanterneater, 2026-10-07): UNWIRED - saved for a future mini (kelp armour: HIT HIGH body / HIT LOW hood). =====
// Daniel 10-07: Jenny's raft duel "just isn't working, clunky"; THE FOG CANAL's boss is THE LANTERN-EATER now (src/lantern-eater.js) on the same raft.
// Nothing imports this file: main.js, the lab, the marks, the hint lines and the music no longer name her. Her sprites stay in src/redraw/greenteeth_art.js
// and src/redraw/greenteeth_kelp.js. To bring her back as a mini, wire her as claude/canal4 did (git log -- src/jenny-greenteeth.js) and give her a room.
// src/jenny-greenteeth.js - JENNY GREENTEETH, the boss at the end of THE FOG CANAL (claude/lockkeeper; Daniel's pivot 2026-09-30: the river hag of the
// English tales, who drags people under with long green arms, in place of a human lock-keeper).
// claude/canal4 (Daniel 10-05, after playing JENNY3: "the switches just aren't fun mechanically" - he picked THE RAFT DUEL + KELP GUARD): the lock's
// paddles, culverts, drain, flood and lure are GONE. The last barge WIDENS into a raft (the lock's timbers lashed to her) and goes out on Jenny's water -
// a narrow, rocking arena - and she HAULS HERSELF ABOARD AND DUELS YOU ON IT. She is a DUELIST, NOT A PUZZLE (design standard B11): ALWAYS HITTABLE,
// she GUARDS BY ANGLE with her KELP ARMOUR:
//   KELP ON HER BODY  only a HIGH blow finds her head: a jump attack, an up-swing (the rising cut), a plunge
//   KELP HOOD         only a LOW blow finds her body: the low sweep (DOWN + swing), a crouched blow
// A blow on the bare part lands whole (the bare part wears the shared OPEN read, a gold outline - B10); a blow on the kelp CLANKS and says so (KELP - HIT
// HIGH / KELP - HIT LOW) and lands at a twentieth. A plain standing swing is neither: it always meets kelp (the mash bot's whole game). The kelp MOVES
// between phases (a clear look and a told shift), and in phase three it shifts every few cycles.
//
// HER FOUR BLOWS (kept from JENNY3; every one told, every one answerable - src/marks.js rows):
//   THE SLAM   (!!, step out)  PHASE ONE'S. Her long arms rise over where you stand (a red mark on the deck that follows you, then fixes) and her claws come
//                              down. Caught, it hurts; stepped out of, her claws go into the raft's timber: STUCK, OPEN (GT.stuckT, gold ring, timer) -
//                              every angle lands, at x GT.openMul, and a blow along the stuck arm finds her.
//   THE CHARGE (!!, jump)      PHASE TWO'S. She slips over the side and comes UNDER THE RAFT: a bow-wave runs along the deck through where you stand
//                              (jump it), and she hauls herself back aboard at the far end.
//   THE NET    (!!, step out)  PHASE THREE'S. A dripping mass of weed thrown where you stand: caught, you are tangled a moment, and her next blow comes quick.
//   THE VINE   (!!, jump)      every phase: her long reach - a weed-rope along the deck at your feet for a hero out of her arms; caught, it YANKS you to her.
// EACH PHASE SHE IS FIERCER (quicker on her feet, quicker between blows, quicker tells - never under half a second) AND THE RAFT CHANGES, TOLD:
//   PHASE 1  KELP ON HER BODY: HIT HIGH. The slam and the vine.
//   PHASE 2  SHE PULLS THE KELP OVER HER HEAD: HIT LOW. + the charge; and SHE HEAVES THE RAFT (told: it tips down toward her side and you slide to her)
//   PHASE 3  SHE DRAGS THE RAFT LOWER: its ends go under (told on the ends first) and the deck is narrower. + the net; the kelp shifts every few cycles
// AFTER HER OPENING SHE IS WARY (GT.wardT, told: a ring of weed about her, kelp everywhere - B3, she cannot be chain-stuck), then she fights on.
// A fall into her water bites and hands you back onto the raft (src/jenny-greenteeth-hands.js keeps the raft as the ground you are handed back to).
//
// PURE: no DOM, no main.js. The world is a context c (src/jenny-greenteeth-hands.js binds it); the frame's events are returned for tools/greenteeth.mjs.
// Her water and the raft are laid by stageGreenteeth (THE FOG CANAL calls it, src/fog-canal.js section 7).

export const GT = {
  hp: 2100, w: 30, h: 46, markH: 54,
  ward: 0.05, openMul: 1.25,
  /* THE RAFT: the barge widened with the lock's timbers - a narrow deck on her water */
  raftW: 224, raftLow: 160, raftSpeed: 70, bob: 1.5, tilt: 0.08,
  /* THE OPENING: at least three seconds; it takes at most its share of her (claude/jenny3's cap: a strong hero never ends a phase in one) */
  stuckT: 3.2, wrenchT: 0.45, wardT: 3.0, openCap: 0.1,
  /* HER BODY, PHASE BY PHASE: walk (px/s), the gap between her blows (s), her tells x */
  walk: [42, 54, 66], keep: 60, gap: [1.0, 0.8, 0.62], tellK: [1, 0.92, 0.85], wakeT: 2.4, phaseT: 2.0,
  /* HER BLOWS */
  slamTell: 1.1, slamFollow: 0.5, slamT: 0.22, slamR: 16, slamRange: 120,
  chargeTell: 1.0, chargeSpeed: 260, haulT: 0.9,
  netTell: 0.8, netFollow: 0.6, netT: 0.35, netR: 22, netRoot: 0.9, netQuick: 0.3, netRange: 170,
  vineTell: 0.85, vineT: 0.4, vineReach: 260, vineMin: 80, vineMin3: 56, vinePull: 230, vineLift: 180, vineHurt: 0.5,
  /* THE RAFT'S TURNS: she heaves it (phase 2 on: told, then it tips toward her a while), drags it lower (phase 3: told, then the ends are under), and the kelp shifts */
  heaveTell: 1.0, heaveT: 2.6, slide: 46, heaveCd: 9, lowerTell: 2.2, kelpTell: 1.2, kelpEvery: 13,
  dmg: { slam: 82, charge: 72, net: 55, vine: 85 },   /* (claude/jenny3's numbers: at the canal's campaign level a hero has about 200 health) */
  p2: 2 / 3, p3: 1 / 3,
};
/* THE MOVES: tell (s, phase one's - GT.tellK scales it), blow (s), the mark's promise, the answer, the height (the marks table's rows are src/marks.js) */
export const MOVES = {
  slam:   { tell: GT.slamTell,   blow: GT.slamT, mark: '!!', answer: 'dodge', h: 'low' },
  charge: { tell: GT.chargeTell, blow: 1.0,      mark: '!!', answer: 'jump',  h: 'low' },
  net:    { tell: GT.netTell,    blow: GT.netT,  mark: '!!', answer: 'dodge', h: 'low' },
  vine:   { tell: GT.vineTell,   blow: GT.vineT, mark: '!!', answer: 'jump',  h: 'low' },
};
export const MOVE_NAME = { slam: 'HER CLAWS', charge: 'HER CHARGE', net: 'THE WEED NET', vine: 'HER VINE' };
/* THE NEW BLOW OF EACH PHASE (the vine is in every phase: her long reach) */
export const NEW_MOVE = { 1: 'slam', 2: 'charge', 3: 'net' };
/* THE KELP OF EACH PHASE: where it covers her ('body': hit high; 'hood': hit low); phase three shifts it */
export const KELP = { 1: 'body', 2: 'hood', 3: 'body' };
export const bareAngle = show => (show.kelp === 'hood' ? 'low' : 'high');
export const KELP_WORD = { body: 'KELP - HIT HIGH', hood: 'KELP - HIT LOW' };
/* HER DECKS: the order she reaches for her blows in, phase by phase ('heave' is the raft's turn); a blow she cannot throw where you stand is skipped */
const DECK = {
  1: ['slam', 'vine', 'slam', 'slam', 'vine', 'slam'],
  2: ['slam', 'charge', 'vine', 'heave', 'slam', 'charge', 'slam', 'vine'],
  3: ['net', 'slam', 'vine', 'charge', 'slam', 'heave', 'net', 'vine', 'charge', 'slam'],
};
/* the frames of her sprite (src/redraw/greenteeth_art.js) */
export const GT_F = { swim: [0, 1], tell: 2, lunge: 3, reach: 4, grab: 5, stranded: [6, 7], hurt: 8, dead: 9, flushed: 10, hide: 11, drag: 12,
  slamTell: 13, stuck: 14, dazed: 15, chargeTell: 16, netTell: 17, net: 18 };

export const gtPhase = e => (e.hp <= e.maxHp * GT.p3 ? 3 : e.hp <= e.maxHp * GT.p2 ? 2 : 1);
export const OPEN_MODES = new Set(['stuck']);
export const gtOpen = e => !!e && OPEN_MODES.has(e.mode);
/* WHAT A BLOW IS, BY ITS ANGLE (the hero as he swings): HIGH from the air (a jump attack, the air up-swing, a plunge) or the rising cut; LOW the low sweep
   (DOWN + swing: the knight's shield trip and the warden's low poke are sweeps too) or a crouched blow; anything else (a plain swing, a heavy, a shot, a burn) MID */
export function blowAngle(P) {
  if (!P) return 'mid';
  if (P.swingKind === 'sweep' || P.caTrip || P.caPoke || (P.ducking && P.atk >= 0)) return 'low';
  if (P.swingKind === 'rise' || P.swingKind === 'airUp' || P.plunge || P.gtAirSwing || (!P.ground && !P.swim && !P.climb && (P.atk >= 0 || P.heavy))) return 'high';   /* (gtAirSwing: a swing begun in the air is a jump attack to its end - the reaper's cleave lands as he touches down) */
  return 'mid';
}
/* WHAT A BLOW TAKES OFF HER: open, every angle at GT.openMul; wary (B3), the kelp everywhere; the bare angle whole; the kelp a twentieth */
export function gtTakeAt(e, show, angle) {
  if (gtOpen(e)) return GT.openMul;
  if (!show || waryNow(show) || ['sleep', 'wake', 'under'].includes(e.mode)) return GT.ward;
  return angle === bareAngle(show) ? 1 : GT.ward;
}
export const gtTake = e => (gtOpen(e) ? GT.openMul : GT.ward);   /* (no angle known: a burn, a room's blow) */
const waryNow = show => !!(show.wary && show.wary.t > 0);
const SPECIAL = new Set(['wake', 'phase', 'lower', 'kelp', 'heave', 'under', 'haul', 'stuck', 'wrench', 'slamBack', 'sleep', 'dead']);
export const special = e => SPECIAL.has(e.mode);
const armMode = m => typeof m === 'string' && !!(MOVES[m] || MOVES[m.replace(/Tell$/, '')]);

/* ---------- THE STAGE'S GEOMETRY (world px) ---------- */
/* 40 columns: the gates at sx and sx+39 with a door each at the bed row; a stone LANDING inside each door (STAGE.land columns), and between them HER WATER,
   STAGE.depth rows deep, its surface level with the landings (the raft's deck is the landings' height) */
export const STAGE = { W: 40, land: 3, door: 6, top: 16, depth: 5 };
export function geom(sx, R, TS) {
  const ex = sx + STAGE.W - 1, deck = R * TS;
  const pool = { x0: (sx + 1 + STAGE.land) * TS, x1: (ex - STAGE.land) * TS };
  return { sx, R, TS, x0: (sx + 1) * TS, x1: ex * TS, deck, surf: deck + 6, bed: (R + STAGE.depth) * TS, top: (R - STAGE.top) * TS, mid: (sx + 20) * TS, pool,
    moorW: pool.x0, moorMid: (sx + 20) * TS - GT.raftW / 2, moorE: pool.x1 - GT.raftW };
}
export const colX = (A, col) => (A.sx + col) * A.TS;

/* ---------- THE SHOW ---------- */
export function newShow(A) {
  return { A, raft: { x: A.moorW, to: A.moorW, w: GT.raftW, bob: 0, tilt: 0, heave: 0, dir: 0, low: false, lowK: 0 }, kelp: KELP[1], kelpNext: null, kelpT: 0,
    arms: [], armN: 0, charge: null, gap: 1.2, turns: 0, rot: 0, told: {}, last: null, last2: null, quick: 0, wary: null, heaveCd: 4, clock: 0, cycle: 0,
    n: { slam: 0, slamHit: 0, stuck: 0, charge: 0, chargeHit: 0, net: 0, netted: 0, vine: 0, vined: 0, heave: 0, lower: 0, kelpShift: 0, haul: 0, cycle: 0, clank: 0, bare: 0 } };
}
export function newGreenteeth(e) { return Object.assign(e, { mode: 'sleep', modeT: 0, phase: 1, open: 0, anim: 0, vx: 0, face: -1, hidden: true }); }
export function startFight(show) { show.kelp = KELP[1]; show.raft.x = show.raft.to = show.A.moorW; show.raft.w = GT.raftW; show.raft.low = false; return show; }
/* the deck she stands on and you fight on: its ends, in px */
export const raftEnds = show => [show.raft.x, show.raft.x + show.raft.w];
export const deckY = show => show.A.deck + Math.round(show.raft.bob);
const onDeckX = (show, x, m = 14) => { const [a, b] = raftEnds(show); return Math.max(a + m, Math.min(b - m, x)); };

/* ---------- THE RAFT ---------- */
function stepRaft(e, show, dt, c) {
  const R = show.raft, d = R.to - R.x; if (Math.abs(d) > 0.5) R.x += Math.sign(d) * Math.min(Math.abs(d), GT.raftSpeed * dt);
  const ph = e && e.phase || 1; R.bob = Math.sin(show.clock * 1.7) * GT.bob * (0.6 + 0.4 * ph);
  if (R.heave > 0) { R.heave -= dt; R.tilt += (R.dir * GT.tilt - R.tilt) * Math.min(1, dt * 5); if (c.slide) c.slide(R.dir * GT.slide * dt); }
  else R.tilt += (Math.sin(show.clock * 0.9) * 0.012 * ph - R.tilt) * Math.min(1, dt * 3);   /* (it rocks a little, more each phase) */
  if (c.raft) c.raft(R);
}

/* ---------- WHO IS WHERE ---------- */
/* h = { x, y, ground, swim, onRaft, alive } from the hands */
const nearestHero = (heroes, x) => heroes.slice().sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0] || null;

/* ---------- A BLOW ---------- */
function startArm(e, show, k, h, c, ev) {
  const M = MOVES[k], len = M.tell * GT.tellK[e.phase - 1], dir = Math.sign(h.x - e.x) || e.face || 1;
  const a = { k, st: 'tell', t: len, len, id: ++show.armN, hero: h, x: h.x, fy: deckY(show), dir };
  if (k === 'slam' || k === 'net') a.follow = true;
  if (k === 'vine') { a.ox = e.x; a.reach = Math.min(GT.vineReach, Math.abs(h.x - e.x) + 70); }
  show.arms.push(a); e.face = dir; show.last2 = show.last; show.last = k; show.n[k + 'Told'] = (show.n[k + 'Told'] || 0) + 1;
  ev.push({ t: k + 'Tell' }); c.say(M.mark); c.sound(k + 'Tell');
  if (k === NEW_MOVE[e.phase] && !show.told[k]) { show.told[k] = true; const y = deckY(show) - 60;   /* (each line a literal: tools/hint-shown reads them) */
    if (k === 'slam') c.number(e.x, y, 'STEP OUT OF HER SLAM: HER CLAWS STICK', '#ffd36b'); else if (k === 'charge') c.number(e.x, y, 'SHE COMES UNDER THE RAFT: JUMP THE WAVE', '#ffd36b'); else c.number(e.x, y, 'HER WEED NET TANGLES: STEP OUT OF IT', '#ffd36b'); }
  if (k === 'vine' && !show.told.vine) { show.told.vine = true; c.number(h.x, deckY(show) - 44, 'HER VINE PULLS YOU OFF: JUMP IT', '#ffd36b'); }
  return a;
}
export const blowBox = (a, show) => {
  if (a.k === 'slam') return [a.x - GT.slamR, a.x + GT.slamR, a.fy - 30, a.fy + 2];
  if (a.k === 'net') return [a.x - GT.netR, a.x + GT.netR, a.fy - 26, a.fy + 4];
  return null; };
function stepArms(e, show, dt, c, ev) {
  for (const a of show.arms) {
    a.t -= dt; a.fy = deckY(show);
    if (a.st === 'tell') {
      if (a.follow && a.hero && a.t > a.len * (1 - (a.k === 'slam' ? GT.slamFollow : GT.netFollow))) { const d = a.hero.x - a.x; a.x = onDeckX(show, a.x + Math.sign(d) * Math.min(Math.abs(d), 90 * dt), 4); }
      if (a.k === 'slam') { const side = Math.sign(e.x - a.x) || -1, tx = onDeckX(show, a.x + side * 26); e.x += (tx - e.x) * Math.min(1, dt * 2); }   /* she leans over the mark */
      if (a.t > 0) continue;
      a.st = 'blow'; a.t = MOVES[a.k].blow; show.n[a.k]++; ev.push({ t: a.k }); c.sound(a.k);
      if (a.k === 'slam') { if (slamLands(e, show, a, c, ev)) return; }
      else if (a.k === 'net') { if (c.net(blowBox(a, show), GT.dmg.net, GT.netRoot)) { show.n.netted++; show.quick = GT.netQuick; ev.push({ t: 'netted' }); } }
      else if (a.k === 'charge') { a.st = 'back'; a.t = 0; startCharge(e, show, a, c, ev); return; }
      continue; }
    if (a.st === 'blow' && a.k === 'vine') { const r = a.reach * Math.min(1, 1 - Math.max(0, a.t) / GT.vineT); a.r = r;
      const tip = a.ox + a.dir * r, tail = a.ox + a.dir * Math.max(0, r - 48);   /* (its end whips past at your feet: once it is by you, you can land) */
      const got = c.vine([a.fy - 14, a.fy + 6], Math.min(tip, tail), Math.max(tip, tail), GT.dmg.vine, 'vine' + a.id, e.x);
      if (got && !a.caught) { a.caught = true; show.n.vined++; ev.push({ t: 'vined' }); } }
    if (a.st === 'blow' && a.t <= 0) { a.st = 'back'; a.t = 0.25; }
  }
  show.arms = show.arms.filter(a => !(a.st === 'back' && a.t <= 0));
  const tells = show.arms.filter(a => a.st === 'tell'), blows = show.arms.filter(a => a.st === 'blow');
  if (tells.length) { const L = tells[0]; if (e.mode !== L.k + 'Tell') { e.mode = L.k + 'Tell'; e.tellLen = L.len; } e.modeT = L.t; }
  else if (blows.length) { e.mode = blows[0].k; e.modeT = Math.max(0, blows[0].t); }
  else if (armMode(e.mode)) e.mode = 'duel';
}
const clearArms = show => { show.arms = []; };
/* THE SLAM LANDS: on a hero it hurts and she draws back; stepped out of, her claws go into the raft's timber and she is STUCK there, open */
function slamLands(e, show, a, c, ev) {
  const hit = c.slam(blowBox(a, show), GT.dmg.slam);
  if (hit) { show.n.slamHit++; clearArms(show); e.mode = 'slamBack'; e.modeT = 0.45; ev.push({ t: 'slamHit' }); return true; }
  if (waryNow(show) && show.wary.k === 'slam') return false;
  clearArms(show); openHer(e, show, 'stuck', GT.stuckT); e.claw = { x: a.x, y: a.fy }; e.x = onDeckX(show, a.x + (Math.sign(e.x - a.x) || -1) * 22); e.face = Math.sign(a.x - e.x) || e.face;
  show.n.stuck++; ev.push({ t: 'stuck' }); c.sound('stuck'); c.number(a.x, a.fy - 40, 'HER CLAWS ARE STUCK: CUT HER', '#ffd36b'); return true;
}
/* THE CHARGE: she slips over the side and comes under the raft behind a bow-wave, through where you stand and on to its far end, where she hauls herself aboard */
function startCharge(e, show, a, c, ev) {
  const [x0, x1] = raftEnds(show), dir = a.dir || 1, to = dir > 0 ? x1 - 6 : x0 + 6;
  show.charge = { x: e.x, dir, to, id: a.id }; e.mode = 'under'; e.modeT = 4; e.hidden = true; ev.push({ t: 'charge' }); c.sound('charge');
}
function stepCharge(e, show, dt, c, ev) {
  const ch = show.charge; if (!ch) { e.mode = 'duel'; e.hidden = false; return; }
  ch.x += ch.dir * GT.chargeSpeed * dt; e.x = ch.x; e.y = show.A.surf + 30;
  const dy = deckY(show); c.band('low', [dy - 10, dy + 4], ch.x - 12, ch.x + 12, GT.dmg.charge, MOVE_NAME.charge, 'charge' + ch.id, { push: ch.dir * 180, from: ch.x - ch.dir * 20 });
  if ((ch.dir > 0 && ch.x >= ch.to) || (ch.dir < 0 && ch.x <= ch.to)) { show.charge = null; e.x = ch.to; e.y = dy; e.hidden = false; e.mode = 'haul'; e.modeT = GT.haulT; e.face = -ch.dir; show.n.haul++; ev.push({ t: 'haul' }); c.sound('haul');
    if (!show.told.haul) { show.told.haul = true; c.number(e.x, dy - 50, 'SHE HAULS HERSELF ABOARD', '#ffd36b'); } }
}

/* ---------- THE OPENING ---------- */
function openHer(e, show, mode, t) {
  clearArms(show); show.charge = null; e.hidden = false;
  e.mode = mode; e.modeT = t; e.openLen = t; e.open = t; e.openKind = mode;
  e.capLen = e.capLeft = Math.round((e.maxHp || GT.hp) * GT.openCap);
}
/* A BLOW IN THE OPENING (main.js, after the take): whole until the opening's share of her is spent, then her kelp takes the rest (GT.ward) */
export function gtCap(e, dmg) { if (!gtOpen(e) || !(e.capLeft >= 0)) return dmg; const d = Math.min(dmg, e.capLeft); e.capLeft -= d; return Math.round(d + (dmg - d) * GT.ward / GT.openMul); }
/* the opening ends: she is WARY (told) - the kelp everywhere and no slam - and the cycle turns */
function closeOpening(e, show, ev, c) {
  show.wary = { k: 'slam', t: GT.wardT }; e.open = 0; show.cycle++; show.n.cycle++; e.claw = null;
  if (!show.told.wary) { show.told.wary = true; c.number(e.x, deckY(show) - 60, 'SHE IS WARY: NOT THE SAME TRICK TWICE', '#9aa39a'); }
  ev.push({ t: 'wary', k: 'slam' }, { t: 'cycle', cycle: show.cycle });
}

/* ---------- CHOOSING A BLOW ---------- */
function chooseBlow(e, show, h, c, ev) {
  const ph = e.phase, dist = Math.abs(h.x - e.x), opts = new Set(), on = h.onRaft && h.ground && !h.swim;
  if (!waryNow(show) && on && dist < GT.slamRange) opts.add('slam');
  if (on && dist >= (ph >= 3 ? GT.vineMin3 : GT.vineMin) && dist < GT.vineReach) opts.add('vine');   /* (on the narrowed raft of phase three, nearer: there is no far end left) */
  if (ph >= 2 && on && dist > 50) opts.add('charge');
  if (ph >= 3 && on && dist < GT.netRange) opts.add('net');
  if (ph >= 2 && on && show.heaveCd <= 0 && show.raft.heave <= 0) opts.add('heave');
  if (!opts.size) return false;
  show.turns++;
  const deck = DECK[ph]; let k = opts.has('vine') && dist >= 100 && show.last !== 'vine' ? 'vine' : null;   /* (a hero far down the deck: her long reach first) */
  for (let i = 0; i < deck.length && !k; i++) { const q = deck[(show.rot + i) % deck.length]; if (opts.has(q) && !(q === show.last && q === show.last2)) { k = q; show.rot = (show.rot + i + 1) % deck.length; } }
  if (!k) k = [...opts][0];
  if (k === 'heave') { startHeave(e, show, h, c, ev); return true; }
  startArm(e, show, k, h, c, ev);
  return true;
}
/* SHE HEAVES THE RAFT (phase two on): told, then for GT.heaveT s it tips down toward her side and a hero on it slides to her */
function startHeave(e, show, h, c, ev) {
  e.mode = 'heave'; e.modeT = GT.heaveTell * GT.tellK[e.phase - 1]; show.heaveCd = GT.heaveCd; show.last2 = show.last; show.last = 'heave'; show.n.heave++;
  show.raft.pendDir = Math.sign(e.x - (show.raft.x + show.raft.w / 2)) || (h && h.x > e.x ? -1 : 1);
  ev.push({ t: 'heaveTell' }); c.say('!'); c.sound('heave'); if (!show.told.heave) { show.told.heave = true; c.number(e.x, deckY(show) - 60, 'SHE HEAVES THE RAFT: KEEP YOUR FEET', '#ffd36b'); }
}

/* ---------- ONE FRAME ----------
   c = { heroes: [h], say(mark), sound(key), number(x, y, line, col), band(kind, [t,b], x0, x1, dmg, name, key, {push, from}),
         slam(box, dmg) -> true if a hero was under it (rolled through is not), net(box, dmg, root) -> caught, vine([t,b], x0, x1, dmg, key, toX) -> hero|null,
         slide(dx) (heroes on the raft), raft(raft) }
   Returns the frame's events. */
export function stepShow(e, show, dt, c) {
  const ev = []; if (!e || !show) return ev;
  const heroes = (c.heroes || []).filter(h => h.alive);
  show.clock += dt; e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.vx = 0;
  if (show.wary && show.wary.t > 0) show.wary.t -= dt;
  if (show.quick > 0) show.quick -= dt;
  if (show.heaveCd > 0 && e.mode !== 'sleep') show.heaveCd -= dt;
  stepRaft(e, show, dt, c);
  if (!e.alive || e.mode === 'sleep') return ev;
  const hero = nearestHero(heroes, e.x), dy = deckY(show);
  e.open = gtOpen(e) ? Math.max(0, e.modeT) : 0;
  if (!special(e) && e.mode !== 'under') stepArms(e, show, dt, c, ev);
  switch (e.mode) {
    case 'wake': if (!show.woke) { show.woke = true; e.modeT = GT.wakeT; show.raft.to = show.A.moorMid; e.hidden = false; c.sound('wake'); c.number(show.A.mid, dy - 70, 'SHE HAULS HERSELF ONTO THE RAFT', '#ffd36b'); }
      { const [, x1] = raftEnds(show); e.x = x1 - 16; e.y = dy + Math.max(0, e.modeT - 0.8) * 20; e.face = -1; }
      if (e.modeT <= 0) { e.mode = 'duel'; e.y = dy; show.gap = 1.0; c.number(e.x, dy - 60, show.kelp === 'body' ? 'KELP ON HER BODY: HIT HIGH' : 'KELP OVER HER HEAD: HIT LOW', '#ffd36b'); ev.push({ t: 'duel' }); }
      return ev;
    case 'slamBack': e.y = dy; if (e.modeT <= 0) e.mode = 'duel'; return ev;
    case 'under': stepCharge(e, show, dt, c, ev); return ev;
    case 'haul': e.y = dy; if (e.modeT <= 0) { e.mode = 'duel'; show.gap = Math.max(show.gap, 0.4); } return ev;
    case 'stuck': e.y = dy; if (e.modeT <= 0) { e.mode = 'wrench'; e.modeT = GT.wrenchT; closeOpening(e, show, ev, c); c.sound('wrench'); } return ev;
    case 'wrench': e.y = dy; if (e.modeT <= 0) e.mode = 'duel'; return ev;
    case 'heave': e.y = dy; if (e.modeT <= 0) { show.raft.heave = GT.heaveT; show.raft.dir = show.raft.pendDir || 1; e.mode = 'duel'; ev.push({ t: 'heave' }); c.sound('heaved'); show.gap = Math.max(show.gap, 0.35); } return ev;
    case 'phase': e.y = dy; if (e.modeT <= 0) { show.kelp = KELP[2]; show.n.kelpShift++; e.mode = 'duel'; show.gap = 0.8; ev.push({ t: 'kelp', kelp: show.kelp }); } return ev;
    case 'lower': e.y = dy; if (e.modeT <= 0) { const R = show.raft, cut = (R.w - GT.raftLow) / 2; R.low = true; R.x += cut; R.to += cut; R.w = GT.raftLow; show.n.lower++; e.mode = 'kelp'; e.modeT = GT.kelpTell; show.kelpNext = 'body';
        ev.push({ t: 'lowered' }); c.sound('lowered'); } return ev;
    case 'kelp': e.y = dy; if (e.modeT <= 0) { show.kelp = show.kelpNext || (show.kelp === 'body' ? 'hood' : 'body'); show.kelpNext = null; show.kelpT = 0; show.n.kelpShift++; e.mode = 'duel'; ev.push({ t: 'kelp', kelp: show.kelp });
        c.number(e.x, dy - 60, show.kelp === 'body' ? 'THE KELP SLIDES DOWN HER: HIT HIGH' : 'SHE PULLS THE KELP OVER HER HEAD: HIT LOW', '#ffd36b'); } return ev;
  }
  /* ---- THE PHASE, only between her blows: fiercer, and the raft and the kelp change, told ---- */
  const ph = gtPhase(e);
  if (ph > e.phase && !show.arms.length) {
    e.phase = ph; ev.push({ t: 'phase', ph }); clearArms(show); show.wary = null; show.charge = null;
    if (ph === 2) { e.mode = 'phase'; e.modeT = GT.phaseT; c.sound('phase'); c.number(e.x, dy - 60, 'SHE PULLS THE KELP OVER HER HEAD: HIT LOW', '#ffd36b'); }
    else { e.mode = 'lower'; e.modeT = GT.lowerTell; c.sound('lower'); c.number(e.x, dy - 60, 'SHE DRAGS THE RAFT LOWER: THE ENDS GO UNDER', '#ffd36b'); }
    return ev; }
  /* ---- PHASE THREE: the kelp shifts every few cycles (told) ---- */
  if (e.phase === 3) show.kelpT += dt;
  if (e.phase === 3 && !show.arms.length && e.mode === 'duel') { if (show.kelpT >= GT.kelpEvery) { e.mode = 'kelp'; e.modeT = GT.kelpTell; show.kelpNext = show.kelp === 'body' ? 'hood' : 'body'; ev.push({ t: 'kelpTell' }); c.sound('kelp'); return ev; } }
  /* ---- WHERE SHE GOES: on the deck, keeping a duel's distance from you on her side ---- */
  if (!show.arms.length) show.gap -= dt;
  if (hero) { const side = Math.sign(e.x - hero.x) || 1; let tx = onDeckX(show, hero.x + side * GT.keep);
    if (Math.abs(tx - hero.x) < 24) tx = onDeckX(show, hero.x - side * GT.keep);   /* (pinned at an end: she goes round you) */
    const sp = GT.walk[e.phase - 1] * (show.arms.length ? 0.3 : 1), d = tx - e.x;
    if (Math.abs(d) > 3 && !show.arms.some(a => a.k === 'slam' || a.st === 'blow')) { e.vx = Math.sign(d) * sp; e.x += Math.sign(d) * Math.min(Math.abs(d), sp * dt); }
    if (!show.arms.length) e.face = Math.sign(hero.x - e.x) || e.face; }
  e.x = onDeckX(show, e.x); e.y = dy; e.hidden = false;
  /* ---- A BLOW ---- */
  if (hero && (show.gap <= 0 || (show.quick > 0 && show.gap <= GT.gap[e.phase - 1] - GT.netQuick)) && !show.arms.length) {
    if (chooseBlow(e, show, hero, c, ev)) { show.gap = GT.gap[e.phase - 1]; show.quick = 0; } else show.gap = 0.3; }
  if (!show.arms.length && !special(e) && e.mode !== 'duel') e.mode = 'duel';
  return ev;
}

/* ---------- A HERO'S SWING ON HER STUCK ARM (the hands answer it as a blow on her) ---------- */
export function strikeAt(e, show, hb, seen) {
  const out = []; if (!e || !show || !hb) return out; const once = seen || new Set();
  if (e.mode === 'stuck' && e.claw && !once.has('claw')) { if (segHitsBox(e.claw.x, e.claw.y - 2, e.x, e.y - GT.h + 14, hb)) { once.add('claw'); out.push({ what: 'claw' }); } }
  return out;
}
export function segHitsBox(x0, y0, x1, y1, b) {
  let t0 = 0, t1 = 1; const dx = x1 - x0, dy = y1 - y0;
  for (const [p, q] of [[-dx, x0 - b.l], [dx, b.r - x0], [-dy, y0 - b.t], [dy, b.b - y0]]) {
    if (p === 0) { if (q < 0) return false; continue; }
    const r = q / p; if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; } }
  return t0 <= t1;
}

/* ---------- THE STAGE ----------
   Laid into a painter-like writer (set / block / plat / ent) with its WEST GATE at column sx and its LANDINGS' floor at row R.
   FOOTPRINT: 40 columns, sx .. sx+39 (the two gates are sx and sx+39), rows R-16 .. R+STAGE.depth+1.
     - the gates' columns are solid from row R-16 down, with a door at rows R-6 .. R-1 in each (the arena walls close it when she wakes);
     - a stone LANDING inside each door (STAGE.land columns, floor row R), and between them her WATER (rows R .. R+depth-1, the bed under it);
     - THE RAFT is a mover (her bright weed's old slot: m.weed + m.gtRaft, src/jenny-greenteeth-hands.js moves it), moored at the west landing.
   Returns { arena, movers, pools }. */
export function stageGreenteeth(W, T, TS, sx, R) {
  const { set, block, ent } = W, ex = sx + STAGE.W - 1, top = R - STAGE.top, D = STAGE.depth;
  block(sx, sx, top, R + D); block(ex, ex, top, R + D);
  for (let y = R - STAGE.door; y <= R - 1; y++) { set(sx, y, T.AIR); set(ex, y, T.AIR); }
  for (let x = sx + 1; x < ex; x++) for (let y = top; y < R; y++) set(x, y, T.AIR);
  block(sx + 1, sx + STAGE.land, R, R + D); block(ex - STAGE.land, ex - 1, R, R + D);   /* the landings, stone to the bed */
  for (let x = sx + STAGE.land + 1; x < ex - STAGE.land; x++) for (let y = R; y < R + D; y++) set(x, y, T.AIR);   /* her water */
  block(sx + 1, ex - 1, R + D, R + D + 1);                                                  /* the bed */
  ent('greenteeth', sx + 20, R - 1, { face: -1 });
  const A = geom(sx, R, TS);
  const arena = { x0: A.x0, x1: A.x1, floor: A.deck, y0: A.top, trigger: (sx + STAGE.land + 2) * TS, wallL: sx, wallR: ex, boss: 'greenteeth', music: 'greenteeth',
    tint: '#1a3a2a', tintA: 0.12, camFrame: true, start: [sx + STAGE.land + 4, R - 1], door: [sx + STAGE.land, R], lock: { sx, R, raft: true } };
  const movers = [{ kind: 'lift', weed: true, gtRaft: true, wi: 0, x: A.moorW, y: A.deck, y0: A.deck, y1: A.deck, w: GT.raftW, h: 8, speed: 0 }];
  const pools = [{ x0: A.pool.x0, x1: A.pool.x1, y: A.surf, bottom: A.bed, swim: false, clear: true, shallow: false, depth: A.bed - A.surf, lock: true, gtWater: true }];
  return { arena, movers, pools };
}

/* ---------- THE BOT'S READING (src/lab.js) ----------
   A HUMAN BOT (the Puppeteer's lesson): it sees a tell PLAN.react s after it began, misreads some (PLAN.missDodge), swings at the wrong angle now and then
   (PLAN.wrongAngle: a plain swing on her kelp - it clanks), and takes a breath between swings (PLAN.rest). It reads the kelp the way a player does: the bare
   part's gold outline - and it swings HIGH (a jump attack or the rising cut) at a body in kelp, LOW (the low sweep) under a hood.
   s = { P: { x, y, face, ground, swim, snare, atk, dodge, vy }, e, show, reach, shield, t (seconds), rng, mem } -> keys
   out = { gx, face, atk, jump, down, up, drop, block, why } */
export const PLAN = { react: 0.25, missDodge: 0.14, wrongAngle: 0.12, jumpAtk: 0.4, rest: 0.18 };
export function greenteethPlan(s) {
  const { P, e, show, reach } = s, out = { gx: null, face: P.face, atk: false, jump: false, down: false, up: false, drop: false, block: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 800) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = key => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= PLAN.react; };
  /* (each roll its own die: a hash of its key and the fight's seed - the lab's seeded Math.random repeats frame to frame, and the misses came in runs) */
  if (mem.seed === undefined) mem.seed = Math.floor(rng() * 1e9);
  const die = key => { let h = 2166136261 ^ mem.seed; for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); } h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); h ^= h >>> 15; return (h >>> 0) / 4294967296; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, die(key) < pr); return mem.roll.get(key); };
  /* (claude/botreads, s.eyes) WHAT A PLAYER SEES: an arm's clock is read off its drawn mark/rope with an error (about 0.06 s, its own die per arm), not exact;
     her bow-wave was TOLD by the charge's red lines - once that tell was read the wave is met as it comes, not a reaction after it starts; her poses (heave,
     stuck) are already seen a reaction late by the lab's eyes, so no second delay on top */
  const tA = a => s.eyes ? a.t + (die('te' + a.id) + die('tf' + a.id) + die('tg' + a.id) - 1.5) * 0.12 : a.t;
  const [rx0, rx1] = raftEnds(show), clamp = x => Math.max(rx0 + 12, Math.min(rx1 - 12, x));
  const stepOut = (x, r, why) => { const room = [rx1 - x, x - rx0], side = room[0] > room[1] ? 1 : -1; out.gx = clamp(x + side * (r + 20)); out.why = why; return out; };
  /* ---- 0. NETTED / CAUGHT: nothing to do but wait ---- */
  if (P.snare > 0) { out.why = 'held'; return out; }
  /* ---- 1. THE BLOWS COMING ---- */
  for (const a of show.arms.filter(q => q.st === 'tell' || q.st === 'blow').sort((p, q) => p.t - q.t)) {
    const key = 'a' + a.id; if (!seenFor(key) || roll(key + 'd', PLAN.missDodge)) continue;
    if ((a.k === 'slam' || a.k === 'net') && a.st === 'tell' && Math.abs(a.x - P.x) < (a.k === 'slam' ? GT.slamR : GT.netR) + 14) {
      if (tA(a) < (1 - (a.k === 'slam' ? GT.slamFollow : GT.netFollow)) * a.len) return stepOut(a.x, a.k === 'slam' ? GT.slamR : GT.netR, a.k === 'slam' ? 'out of her slam' : 'out of the net');
      out.gx = P.x; out.why = 'wait for it to fix'; return out; }
    if (a.k === 'vine' && tA(a) < 0.14 + (a.st === 'blow' ? 1 : 0)) { const inRange = a.dir > 0 ? P.x > a.ox - 10 && P.x < a.ox + a.reach + 10 : P.x < a.ox + 10 && P.x > a.ox - a.reach - 10;
      if (inRange && P.ground) { out.jump = true; out.why = 'jump the vine'; return out; } }
    if (a.k === 'charge' && a.st === 'tell') { if (s.eyes) mem.chTold = t; out.gx = P.x; out.why = 'ready for the wave'; return out; }
  }
  /* a slam or a net told and seen, the hero clear of its mark: he waits it out where he is (no jump, no swing that carries him into it) */
  const live = show.arms.find(q => (q.k === 'slam' || q.k === 'net') && q.st === 'tell' && seenFor('a' + q.id) && !roll('a' + q.id + 'd', PLAN.missDodge));
  if (live && P.ground) { out.gx = P.x; out.face = Math.sign(e.x - P.x) || 1; out.why = 'clear of the mark: wait'; return out; }
  const ch = show.charge;
  if (ch && ((s.eyes && t - (mem.chTold ?? -9) < 2.5) || seenFor('c' + ch.id)) && !roll('c' + ch.id + 'd', PLAN.missDodge) && Math.sign(P.x - ch.x) === ch.dir && Math.abs(ch.x - P.x) < 70) { if (Math.abs(ch.x - P.x) < 56 && P.ground) out.jump = true; out.gx = P.x; out.why = 'the wave'; return out; }
  if (e.mode === 'heave' && (s.eyes || seenFor('hv' + show.n.heave))) { out.gx = clamp(P.x - (Math.sign(e.x - P.x) || 1) * 40); out.why = 'brace against the heave'; }
  if (show.raft.heave > 0) { out.gx = clamp(P.x - show.raft.dir * 30); out.why = 'against the tilt'; }
  if (e.mode === 'lower') { out.gx = clamp((rx0 + rx1) / 2 + (P.x < e.x ? -40 : 40)); out.why = 'off the ends'; return out; }
  if (['wake', 'under', 'phase', 'kelp', 'sleep'].includes(e.mode)) { if (out.gx === null) out.gx = clamp(P.x); return out; }
  /* ---- 2. SHE IS STUCK: to her, and cut (any angle lands) ---- */
  if (gtOpen(e) && (s.eyes || seenFor('open' + show.n.stuck))) { const tx = e.claw && Math.abs(e.claw.x - P.x) < Math.abs(e.x - P.x) ? e.claw.x : e.x, d = tx - P.x; out.face = Math.sign(d) || 1;
    out.gx = Math.abs(d) > reach - 6 ? clamp(tx - out.face * (reach - 10)) : null; out.atk = Math.abs(d) < reach + 8 && (mem.lastAtk === undefined || t - mem.lastAtk > 0.12); if (out.atk) mem.lastAtk = t; out.why = 'stuck: cut her'; return out; }
  /* ---- 3. THE DUEL: close to her and strike the bare angle ---- */
  const d = e.x - P.x, dir = Math.sign(d) || 1; out.face = dir;
  const want = e.x - dir * Math.max(14, reach - 8); if (out.gx === null) out.gx = clamp(want);
  if (show.wary && show.wary.t > 0) { out.gx = clamp(e.x - dir * (reach + 30)); out.why = 'she is wary'; return out; }
  const near = Math.abs(d) < reach + 6, breath = mem.lastAtk !== undefined && t - mem.lastAtk < PLAN.rest;
  if (!near || breath || P.atk >= 0) { out.why = 'close in'; return out; }
  const swing = 's' + Math.floor(t / 0.4), wrong = roll(swing + 'w', PLAN.wrongAngle);
  if (wrong) { out.atk = true; out.why = 'a plain swing (wrong)'; mem.lastAtk = t; return out; }
  if (bareAngle(show) === 'low') { out.down = true; out.gx = null; if (P.ground) { out.atk = true; mem.lastAtk = t; } out.why = 'low sweep under the hood'; return out; }
  if (roll(swing + 'j', PLAN.jumpAtk)) { if (P.ground) { out.jump = true; mem.jumpFor = t; out.why = 'jump to her head'; return out; } }
  if (!P.ground) { out.atk = true; mem.lastAtk = t; out.why = 'a jump attack at her head'; return out; }
  out.up = true; out.atk = true; mem.lastAtk = t; out.why = 'the rising cut at her head'; return out;
}

/* ---------- THE FRAME her body shows (src/redraw/greenteeth_art.js) ---------- */
export function gtFrame(e) {
  const a = e.anim || 0, m = e.mode || '';
  if (m === 'wake' || m === 'haul') return GT_F.drag;
  if (m === 'stuck') return GT_F.grab;
  if (m === 'slamTell') return GT_F.slamTell;
  if (m === 'slam' || m === 'wrench') return GT_F.reach;
  if (m === 'slamBack' || m === 'lower') return GT_F.grab;
  if (m === 'chargeTell' || m === 'under') return GT_F.chargeTell;
  if (m === 'netTell' || m === 'vineTell') return GT_F.netTell;
  if (m === 'net' || m === 'vine') return GT_F.net;
  if (m === 'heave' || m === 'phase' || m === 'kelp') return GT_F.tell;
  if (e.flash > 0.05) return GT_F.hurt;
  return GT_F.swim[Math.floor(a * 3) % 2];
}
