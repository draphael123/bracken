// src/lantern-eater.js - THE LANTERN-EATER, the boss at the end of THE FOG CANAL (claude/lanterneater, Daniel 10-07: Jenny Greenteeth's raft duel "just isn't
// working, clunky" - he KEPT THE RAFT ARENA and approved a new BEAST under the canal basin). The level's rule: "THE BARGE GOES WHERE THE WATER LETS IT. A
// LANTERN SHOWS YOU - TO THEM TOO." It is that rule, personified (design standard B1): an enormous anglerfish-like thing under the basin whose LURE is a FALSE
// LANTERN glowing in the fog, looking like the basin's own lamps. Make for the wrong light and you are in its mouth.
//
// A BEAST WITH VULNERABILITY KEYS (design standard B14), NOT A DUELIST: each phase is keyed to ONE angle every hero has with base kit (src/lantern-eater.js
// blowAngle: HIGH = a jump attack, the rising cut, the air up-swing, a plunge; LOW = the low sweep, the knight's trip, the warden's low poke, a crouched blow).
// The key is SHOWN (chevrons under what it keys - up for HIGH, down for LOW) and a blow at the wrong angle CLANKS and names it (TOO LOW / TOO HIGH, the shared
// turned-blow read, src/boss-read.js). It is never invisible-invulnerable (B12/B13): its keyed part is in reach EVERY cycle, and the openings are things you DO.
//   PHASE 1  TWO LIGHTS IN THE FOG. Each cycle two lights come down over the raft's ends: the basin's REAL LAMP (it FLICKERS) and THE LURE (it SWAYS). The
//            lure is its weak point, keyed HIGH while it dangles. Strike it high and it is SNAGGED: OPEN (gold ring + timer, B10), every angle lands. Leave it
//            and THE GULP comes up under it (!! red, the new move): the jaws close where the lure hung. The real lamp only clanks: THAT IS A LAMP.
//   PHASE 2  IT SURFACES BESIDE THE RAFT, jaws open over one end - its GUMS keyed LOW at the rail. Then THE SNAP (!! red, the new move): the jaws lunge onto
//            the deck where you stand (the mark follows you, then fixes). Stepped out of, its teeth go into the raft's timber: STUCK, OPEN. One end at a time,
//            either end: one windup at a time on a tight raft.
//   PHASE 3  IT SNUFFS EVERY LAMP. Your raft's lantern is the only real light left and it HUNTS it: THE HUNT (!! red, the new move) comes up under the lantern.
//            STRIKE THE LANTERN to DIM it and it bites at lure-copies out in the fog instead (the rule's trade) - but the lure surfaces only when you raise the
//            light again (strike it again). Lit, its lure comes to your light, keyed HIGH, snagged OPEN as in phase one.
//   EVERY PHASE  THE SWELL (!! red): its body passes under the raft and a swell runs along the deck - jump it.
// AFTER EVERY OPENING A TOLD WARD (LE.wardT, B3): the lure drawn up or the jaws sunk in a grey ring - WARDED - so it cannot be chain-opened.
// A fall into its water bites and hands you back onto the raft (src/lantern-eater-hands.js keeps the raft as the ground you are handed back to).
//
// PURE: no DOM, no main.js. The world is a context c (src/lantern-eater-hands.js binds it); the frame's events are returned for tools/lantern-eater.mjs.
// The stage (the raft on its water between two stone landings) is THE FOG CANAL's lock chamber from claude/canal4, laid by stageLanternEater (src/fog-canal.js
// section 7). (JENNY GREENTEETH's own module, src/benched/jenny-greenteeth.js, is kept unwired - saved for a future mini.)

export const LE = {
  hp: 1900, markH: 26,
  ward: 0.05, openMul: 1.4, openCap: 0.09, openT: 3.2, wardT: 3.0,
  /* THE RAFT: the last barge widened with the lock's timbers (claude/canal4's stage) */
  raftW: 224, raftSpeed: 70, bob: 1.5,
  /* THE LURE (and the lamp): its box when it dangles - the bottom LE.dangleY over the deck, LE.lureH tall (a standing swing touches it: it clanks) */
  lureW: 14, lureH: 22, dangleY: 12, highY: 100, endIn: 30,
  /* PHASE ONE: the lights come down; then the lure DANGLES AS BAIT while THE GULP comes up under it (told, keyed HIGH): LE.snagN keyed blows in the tell snag it */
  lightsT: 1.6, gulpTell: 1.5, gulpT: 0.3, gulpR: 32, pull: 45, pullR: 64, riseT: 0.8, snagN: 2,
  /* PHASE TWO: it surfaces at an end (keyed LOW), then THE SNAP where you stand */
  jawsW: 26, jawsH: 20, surfaceT: 0.9, jawsT: 1.3, snapTell: 1.1, snapFollow: 0.65, snapR: 20, snapT: 0.25, sinkT: 0.7,
  /* PHASE THREE: the lamps snuffed, THE HUNT under your lantern; dimmed, it bites lure-copies */
  snuffT: 2.4, huntTell: 1.5, huntR: 40, huntT: 0.3, decoyT: 2.4, dimNudge: 6, lanternDx: -38, lureSide3: 40,
  /* EVERY PHASE: THE SWELL along the deck (jump it) */
  swellTell: 1.0, swellSpeed: 240, swellEvery: 2,
  /* FIERCER EACH PHASE: its tells x, and the breath between cycles (s) */
  tellK: [1, 0.92, 0.86], gap: [0.9, 0.7, 0.6], wakeT: 2.4, phaseT: 2.2,
  dmg: { gulp: 110, snap: 95, hunt: 110, swell: 70 },
  p2: 2 / 3, p3: 1 / 3,
};
/* THE MOVES: tell (s, phase one's - LE.tellK scales it), blow (s), the mark's promise, the answer, the height (src/marks.js rows) */
export const MOVES = {
  gulp:  { tell: LE.gulpTell,  blow: LE.gulpT, mark: '!!', answer: 'dodge', h: 'low' },
  snap:  { tell: LE.snapTell,  blow: LE.snapT, mark: '!!', answer: 'dodge', h: 'low' },
  hunt:  { tell: LE.huntTell,  blow: LE.huntT, mark: '!!', answer: 'dodge', h: 'low' },
  swell: { tell: LE.swellTell, blow: 1.0,      mark: '!!', answer: 'jump',  h: 'low' },
};
export const MOVE_NAME = { gulp: 'THE GULP', snap: 'THE SNAP', hunt: 'THE HUNT', swell: 'THE SWELL' };
/* ONE NEW TOLD MOVE A PHASE (the swell is in every phase) */
export const NEW_MOVE = { 1: 'gulp', 2: 'snap', 3: 'hunt' };
/* THE KEY OF EACH PHASE (B14): what a blow must be to land whole on its keyed part */
export const KEY = { 1: 'high', 2: 'low', 3: 'high' };
export const KEY_WORD = { high: 'TOO LOW', low: 'TOO HIGH' };   /* (the turned blow says what was wrong with it) */
/* its modes: the ones its keyed part is in reach in, and the open one */
const KEYED = new Set(['gulpTell', 'huntTell', 'jaws', 'snapTell']);
export const OPEN_MODES = new Set(['open']);
export const leOpen = e => !!e && OPEN_MODES.has(e.mode);
export const lePhase = e => (e.hp <= e.maxHp * LE.p3 ? 3 : e.hp <= e.maxHp * LE.p2 ? 2 : 1);
export const keyedNow = e => !!e && KEYED.has(e.mode) && (e.part === 'lure' || e.part === 'jaws');
export const keyOf = e => KEY[(e && e.phase) || 1];
const SPECIAL = new Set(['sleep', 'wake', 'phase', 'snuff', 'dead']);
export const special = e => SPECIAL.has(e.mode);

/* WHAT A BLOW IS, BY ITS ANGLE (the hero as he swings): HIGH from the air (a jump attack, the air up-swing, a plunge) or the rising cut; LOW the low sweep
   (DOWN + swing: the knight's shield trip and the warden's low poke are sweeps too) or a crouched blow; anything else (a plain swing, a heavy, a shot, a burn) MID.
   (The same read claude/canal4 wrote for the kelp guard - every hero has both with base kit, tools/lantern-eater.mjs proves it in the page.) */
export function blowAngle(P) {
  if (!P) return 'mid';
  if (P.swingKind === 'sweep' || P.caTrip || P.caPoke || (P.ducking && P.atk >= 0)) return 'low';
  if (P.swingKind === 'rise' || P.swingKind === 'airUp' || P.plunge || P.leAirSwing || (!P.ground && !P.swim && !P.climb && (P.atk >= 0 || P.heavy))) return 'high';   /* (leAirSwing: a swing begun in the air stays a jump attack to its end) */
  return 'mid';
}
/* WHAT A BLOW TAKES OFF IT: open, every angle at LE.openMul; keyed, the key angle whole; anything else (its ward, the wrong angle, a part out of reach) LE.ward */
export function leTakeAt(e, show, angle) {
  if (leOpen(e)) return LE.openMul;
  if (!show || !keyedNow(e)) return LE.ward;
  return angle === keyOf(e) ? 1 : LE.ward;
}
export const leTake = e => (leOpen(e) ? LE.openMul : LE.ward);   /* (no angle known: a burn, a room's blow) */

/* ---------- THE STAGE'S GEOMETRY (world px) - claude/canal4's raft chamber, unchanged ---------- */
/* 40 columns: the gates at sx and sx+39 with a door each at the deck row; a stone LANDING inside each door (STAGE.land columns), and between them ITS WATER,
   STAGE.depth rows deep, its surface level with the landings (the raft's deck is the landings' height) */
export const STAGE = { W: 40, land: 3, door: 6, top: 16, depth: 5 };
export function geom(sx, R, TS) {
  const ex = sx + STAGE.W - 1, deck = R * TS;
  const pool = { x0: (sx + 1 + STAGE.land) * TS, x1: (ex - STAGE.land) * TS };
  return { sx, R, TS, x0: (sx + 1) * TS, x1: ex * TS, deck, surf: deck + 6, bed: (R + STAGE.depth) * TS, top: (R - STAGE.top) * TS, mid: (sx + 20) * TS, pool,
    moorW: pool.x0, moorMid: (sx + 20) * TS - LE.raftW / 2, moorE: pool.x1 - LE.raftW };
}

/* ---------- THE SHOW ---------- */
export function newShow(A) {
  return { A, raft: { x: A.moorW, to: A.moorW, w: LE.raftW, bob: 0 }, lights: [], lure: null, jaws: null, snap: null, swell: null, decoys: [], gulp: null,
    lantern: { lit: true, cd: 0 }, dark: 0, dimT: 0, snagged: false, snagHits: 0, cycle: 0, swellN: 0, sinceSwell: 0, gap: 1.0, told: {}, clock: 0, last: null, side: 1, keyN: 0,
    n: { lights: 0, lampHit: 0, snag: 0, jerk: 0, gulp: 0, gulpHit: 0, surface: 0, snap: 0, snapHit: 0, stuck: 0, hunt: 0, huntHit: 0, huntCopy: 0, decoy: 0, swell: 0, swellHit: 0,
      open: 0, ward: 0, cycle: 0, clank: 0, keyed: 0, dim: 0, raise: 0, phase: 0 } };
}
export function newLanternEater(e) { return Object.assign(e, { mode: 'sleep', modeT: 0, phase: 1, open: 0, anim: 0, vx: 0, face: -1, hidden: true, w: LE.lureW, h: LE.lureH }); }
export function startFight(show) { show.raft.x = show.raft.to = show.A.moorW; show.raft.w = LE.raftW; show.lantern.lit = true; show.dark = 0; return show; }
/* the deck: its ends, in px; its height */
export const raftEnds = show => [show.raft.x, show.raft.x + show.raft.w];
export const deckY = show => show.A.deck + Math.round(show.raft.bob);
export const lanternX = show => show.raft.x + show.raft.w / 2 + LE.lanternDx;
/* the raft's lantern, as a box a swing can strike (phase three's verb) */
export const lanternBox = show => { const x = lanternX(show), y = deckY(show); return { l: x - 5, r: x + 5, t: y - 22, b: y - 10 }; };   /* (hung at hip height on its short post: a standing swing reaches it) */
const onDeckX = (show, x, m = 12) => { const [a, b] = raftEnds(show); return Math.max(a + m, Math.min(b - m, x)); };
const hitsBox = (a, b) => a && b && a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;

/* ---------- THE RAFT ---------- */
function stepRaft(e, show, dt, c) {
  const R = show.raft, d = R.to - R.x; if (Math.abs(d) > 0.5) R.x += Math.sign(d) * Math.min(Math.abs(d), LE.raftSpeed * dt);
  const ph = (e && e.phase) || 1; R.bob = Math.sin(show.clock * 1.7) * LE.bob * (0.6 + 0.4 * ph) + (show.swell ? 1.5 * Math.sin(show.clock * 9) : 0);
  if (c.raft) c.raft(R);
}
const nearestHero = (heroes, x) => heroes.slice().sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0] || null;
const tellOf = (e, k) => MOVES[k].tell * LE.tellK[(e.phase || 1) - 1];
/* where it is: e (its box) is always the part of it you can see - the lure, the jaws, or its bulk under the water */
function putLure(e, show, L) { e.x = L.x + (L.kind === 'lure' ? L.sway : 0); e.y = L.y; e.w = LE.lureW; e.h = LE.lureH; e.hidden = false; e.part = 'lure'; }
function putJaws(e, show, x) { e.x = x; e.y = deckY(show) + 4; e.w = LE.jawsW; e.h = LE.jawsH; e.hidden = false; e.part = 'jaws'; }
function putUnder(e, show, x) { e.x = x; e.y = show.A.surf + 30; e.w = LE.jawsW; e.h = LE.jawsH; e.hidden = true; e.part = 'under'; }

/* ---------- THE CYCLE ---------- */
function setMode(e, m, t) { e.mode = m; e.modeT = t; e.modeLen = t; }
function nextCycle(e, show, c, ev, hero) {
  show.cycle++; show.n.cycle++; show.snagged = false; show.snagHits = 0; show.lights = []; show.lure = null; show.jaws = null; show.snap = null; show.gulp = null;
  /* THE PHASE, only between cycles: the arena changes, told */
  const ph = lePhase(e);
  if (ph > e.phase) { e.phase = ph; show.n.phase++; ev.push({ t: 'phase', ph }); const dy = deckY(show);
    if (ph === 2) { setMode(e, 'phase', LE.phaseT); putUnder(e, show, show.A.mid); c.sound('phase'); c.number(show.A.mid, dy - 64, 'IT SURFACES BESIDE THE RAFT: HIT ITS GUMS LOW', '#ffd36b'); }
    else { setMode(e, 'snuff', LE.snuffT); putUnder(e, show, show.A.mid); show.lantern.lit = true; c.sound('snuff'); c.number(show.A.mid, dy - 64, 'IT SNUFFS EVERY LAMP: YOUR LANTERN IS THE ONLY LIGHT', '#ffd36b'); }
    return; }
  /* THE SWELL after every LE.swellEvery of its attacks (in phase three only while the light is up: dimmed, it is out hunting copies) */
  if (hero && show.sinceSwell >= LE.swellEvery && show.last !== 'swell' && (e.phase < 3 || show.lantern.lit)) { show.sinceSwell = 0; startSwell(e, show, c, ev, hero); return; }
  if (e.phase === 2) { show.sinceSwell++; startSurface(e, show, c, ev, hero); return; }
  if (e.phase === 3 && !show.lantern.lit) { setMode(e, 'dark', LE.decoyT); putUnder(e, show, show.A.mid); show.last = 'dark'; return; }
  show.sinceSwell++; startLights(e, show, c, ev);
}
/* PHASE ONE (and three, lit): the lights come down out of the fog over the raft */
function startLights(e, show, c, ev) {
  const [x0, x1] = raftEnds(show), dy = deckY(show); show.n.lights++; show.last = 'lights';
  if (e.phase === 3) { const side = Math.random() < 0.5 ? -1 : 1, lx = lanternX(show);
    show.lights = [{ kind: 'lure', x: onDeckX(show, lx + side * LE.lureSide3, 16), y: dy - LE.highY, sway: 0, ph: Math.random() * 6 }]; }
  else { const side = Math.random() < 0.5 ? -1 : 1, lureX = side < 0 ? x0 + LE.endIn : x1 - LE.endIn, lampX = side < 0 ? x1 - LE.endIn : x0 + LE.endIn;
    show.side = side; show.lights = [{ kind: 'lure', x: lureX, y: dy - LE.highY, sway: 0, ph: Math.random() * 6 }, { kind: 'lamp', x: lampX, y: dy - LE.highY, sway: 0, ph: Math.random() * 6 }]; }
  show.lure = show.lights[0]; putLure(e, show, show.lure); setMode(e, 'lights', LE.lightsT); ev.push({ t: 'lights' }); c.sound('lights');
  if (!show.told.lights) { show.told.lights = true; c.number(show.A.mid, dy - 70, 'TWO LIGHTS: THE LAMP FLICKERS. THE LURE SWAYS: HIT IT HIGH', '#ffd36b'); }
  if (e.phase === 3 && !show.told.lights3) { show.told.lights3 = true; c.number(show.A.mid, dy - 70, 'THE LURE COMES TO YOUR LIGHT: HIT IT HIGH', '#ffd36b'); }
}
/* PHASE TWO: it surfaces at the end nearer you, jaws open over the rail */
function startSurface(e, show, c, ev, hero) {
  const [x0, x1] = raftEnds(show), side = hero ? (hero.x < (x0 + x1) / 2 ? -1 : 1) : (show.side = -show.side);
  show.side = side; show.jaws = { side, x: side < 0 ? x0 - 6 : x1 + 6 }; putUnder(e, show, show.jaws.x); e.face = -side;
  setMode(e, 'surface', LE.surfaceT); show.n.surface++; show.last = 'surface'; ev.push({ t: 'surface', side }); c.sound('surface');
}
function startSwell(e, show, c, ev, hero) {
  const [x0, x1] = raftEnds(show), from = hero.x < (x0 + x1) / 2 ? x1 + 8 : x0 - 8, dir = from > x0 ? -1 : 1, id = ++show.swellN;
  show.swell = { x: from, dir, id, st: 'tell', to: dir > 0 ? x1 + 10 : x0 - 10 }; putUnder(e, show, from); show.last = 'swell';
  setMode(e, 'swellTell', tellOf(e, 'swell')); ev.push({ t: 'swellTell' }); c.say('!!'); c.sound('swellTell');
  if (!show.told.swell) { show.told.swell = true; c.number(show.A.mid, deckY(show) - 60, 'IT PASSES UNDER THE RAFT: JUMP THE SWELL', '#ffd36b'); }
}

/* ---------- THE OPENING ---------- */
function openIt(e, show, ev, c, why) {
  setMode(e, 'open', LE.openT); e.open = LE.openT; e.openLen = LE.openT; e.openKind = why; show.n.open++;
  e.capLen = e.capLeft = Math.round((e.maxHp || LE.hp) * LE.openCap); ev.push({ t: 'open', why });
}
/* A BLOW IN THE OPENING (main.js, after the take): whole until the opening's share of it is spent, then its ward takes the rest (LE.ward) */
export function leCap(e, dmg) { if (!leOpen(e) || !(e.capLeft >= 0)) return dmg; const d = Math.min(dmg, e.capLeft); e.capLeft -= d; return Math.round(d + (dmg - d) * LE.ward / LE.openMul); }
/* the opening ends: its told ward (B3) - the lure drawn up, the jaws sunk, in a grey ring - and the cycle turns */
function closeOpening(e, show, ev, c) {
  e.open = 0; show.n.ward++; const dy = deckY(show);
  if (e.part === 'lure') { e.y = dy - LE.highY * 0.75; } else putUnder(e, show, e.x);
  setMode(e, 'ward', LE.wardT); ev.push({ t: 'ward' }); c.sound('ward');
  if (!show.told.ward) { show.told.ward = true; c.number(e.x, dy - 60, 'IT DRAWS BACK: WARDED A MOMENT', '#9aa39a'); }
}
/* THE SNAG: blows at the key angle on the dangling lure (src/lantern-eater-hands.js take calls it): the first JERKS it, LE.snagN snag it ('jerk' | 'snag' | null) */
export function snag(e, show) { if (!e || !show || e.part !== 'lure' || !keyedNow(e)) return null; show.snagHits++; if (show.snagHits < LE.snagN) { show.n.jerk++; return 'jerk'; } show.snagged = true; return 'snag'; }
/* THE LANTERN STRUCK (phase three): dim it, or raise it. Returns 'dim' | 'raise' | null */
export function strikeLantern(e, show, c) {
  if (!e || e.phase !== 3 || special(e) || show.lantern.cd > 0) return null;
  show.lantern.lit = !show.lantern.lit; show.lantern.cd = 0.3; const dy = deckY(show), lx = lanternX(show);
  if (show.lantern.lit) { show.n.raise++; show.dimT = 0; if (c) { c.sound('raise'); c.number(lx, dy - 50, 'YOUR LIGHT IS UP: THE LURE COMES TO IT - SO DOES IT', '#ffd36b'); } return 'raise'; }
  show.n.dim++; if (c) { c.sound('dim'); c.number(lx, dy - 50, 'YOUR LANTERN IS DIM: IT HUNTS THE COPIES', '#9ad0ff'); }
  /* dimmed mid-hunt it veers off after a copy; dimmed under a dangling lure, the lure goes back up into the dark */
  if (e.mode === 'huntTell') { show.n.huntCopy++; show.decoys.push({ x: lx + (lx < show.A.mid ? -90 : 90), t: 0.8 }); setMode(e, 'rise', LE.riseT); }
  else if (e.mode === 'lights') setMode(e, 'rise', LE.riseT);
  return 'dim';
}

/* ---------- ONE FRAME ----------
   c = { heroes: [h], say(mark), sound(key), number(x, y, line, col), zone([x0, x1], [t, b], dmg, name, key) -> heroes hit (a roll through is not hit),
         band(kind, [t, b], x0, x1, dmg, name, key, { push }) (the swell: a jump clears it), pull(x, r, speed) (heroes on the raft drawn toward x), raft(raft) }
   h = { x, y, ground, swim, onRaft, alive }. Returns the frame's events. */
export function stepShow(e, show, dt, c) {
  const ev = []; if (!e || !show) return ev;
  const heroes = (c.heroes || []).filter(h => h.alive), hero = nearestHero(heroes.filter(h => h.onRaft).length ? heroes.filter(h => h.onRaft) : heroes, e.x);
  show.clock += dt; e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.vx = 0; if (show.lantern.cd > 0) show.lantern.cd -= dt;
  for (const d of show.decoys) d.t -= dt; show.decoys = show.decoys.filter(d => d.t > 0);
  for (const L of show.lights) { L.sway = L.kind === 'lure' ? Math.sin(show.clock * 2.6 + L.ph) * 7 : 0; L.flick = L.kind === 'lamp' ? (Math.sin(show.clock * 31 + L.ph) * Math.sin(show.clock * 13.7) > 0.25 ? 0.45 : 1) : 1; }
  if (e.phase === 3 && show.dark < 1) show.dark = Math.min(1, show.dark + dt / LE.snuffT);
  if (e.phase === 3 && !show.lantern.lit) { show.dimT += dt; if (show.dimT >= LE.dimNudge && !show.told.dimNudge) { show.told.dimNudge = true; c.number(lanternX(show), deckY(show) - 50, 'RAISE YOUR LIGHT: THE LURE COMES ONLY TO A LIT LANTERN', '#ffd36b'); } }
  stepRaft(e, show, dt, c);
  if (!e.alive || e.mode === 'sleep') return ev;
  const dy = deckY(show);
  e.open = leOpen(e) ? Math.max(0, e.modeT) : 0;
  switch (e.mode) {
    case 'wake': if (!show.woke) { show.woke = true; e.modeT = LE.wakeT; e.modeLen = LE.wakeT; show.raft.to = show.A.moorMid; putUnder(e, show, show.A.mid); c.sound('wake'); c.number(show.A.mid, dy - 70, 'SOMETHING VAST MOVES UNDER THE RAFT', '#ffd36b'); }
      if (e.modeT <= 0) { ev.push({ t: 'duel' }); show.cycle = -1; show.gap = 0; nextCycle(e, show, c, ev, hero); }
      return ev;
    case 'phase': case 'snuff':
      if (e.modeT <= 0) { show.cycle = -1; nextCycle(e, show, c, ev, hero); } return ev;
    case 'idle': if (e.modeT <= 0) nextCycle(e, show, c, ev, hero); return ev;
    /* ---- THE LIGHTS: down out of the fog over the raft's ends; the lure sways, the lamp flickers ---- */
    case 'lights': { const k = 1 - Math.max(0, e.modeT) / LE.lightsT; for (const L of show.lights) L.y = dy - LE.dangleY - (LE.highY - LE.dangleY) * (1 - k * k * (3 - 2 * k)); putLure(e, show, show.lure);
      if (e.modeT <= 0) { for (const L of show.lights) L.y = dy - LE.dangleY; show.n.keyed++; if (e.phase === 3) startHunt(e, show, c, ev); else startGulp(e, show, c, ev); putLure(e, show, show.lure);
        if (!show.told.key) { show.told.key = true; c.number(show.A.mid, dy - 60, 'THE LURE IS ITS WEAK POINT: JUMP AND STRIKE, OR UP AND STRIKE', '#ffd36b'); } }
      return ev; }
    case 'gulpTell': for (const L of show.lights) L.y = dy - LE.dangleY; if (show.lure) putLure(e, show, show.lure); else putUnder(e, show, show.gulp.x);
      if (show.snagged) { snagged(e, show, c, ev); return ev; }
      if (c.pull) c.pull(show.gulp.x, LE.pullR, LE.pull);   /* the water draws toward its mouth: the wrong light pulls you in */
      if (e.modeT <= 0) { const g = show.gulp, hit = c.zone([g.x - LE.gulpR, g.x + LE.gulpR], [dy - 40, dy + 4], LE.dmg.gulp, MOVE_NAME.gulp, 'gulp' + g.id);
        show.n.gulp++; if (hit) show.n.gulpHit++; ev.push({ t: 'gulp', hit }); c.sound('gulp'); show.lights = show.lights.filter(L => L.kind !== 'lure');
        putJaws(e, show, g.x); setMode(e, 'gulp', LE.gulpT); }
      return ev;
    case 'gulp': case 'hunt': if (e.modeT <= 0) { setMode(e, 'rise', LE.riseT); } return ev;
    case 'huntTell': for (const L of show.lights) L.y = dy - LE.dangleY; if (show.lure) putLure(e, show, show.lure); else putUnder(e, show, show.hunt.x);
      if (show.snagged) { snagged(e, show, c, ev); return ev; }
      if (e.modeT <= 0) { show.lights = []; show.lure = null; const hx = show.hunt.x, hit = c.zone([hx - LE.huntR, hx + LE.huntR], [dy - 40, dy + 4], LE.dmg.hunt, MOVE_NAME.hunt, 'hunt' + show.hunt.id);
        show.n.hunt++; if (hit) show.n.huntHit++; ev.push({ t: 'hunt', hit }); c.sound('hunt'); putJaws(e, show, hx); setMode(e, 'hunt', LE.huntT); }
      return ev;
    case 'rise': { const k = Math.max(0, e.modeT) / LE.riseT; for (const L of show.lights) L.y = dy - LE.dangleY - (LE.highY - LE.dangleY) * (1 - k); if (show.lure && show.lights.includes(show.lure)) putLure(e, show, show.lure); else putUnder(e, show, e.x);
      if (e.modeT <= 0) { show.lights = []; idle(e, show); } return ev; }
    /* ---- THE OPENING and its ward ---- */
    case 'open': if (e.part === 'lure' && show.lure) { show.lure.y = dy - LE.dangleY + 4; putLure(e, show, show.lure); }
      if (e.modeT <= 0) closeOpening(e, show, ev, c); return ev;
    case 'ward': if (e.part === 'lure' && show.lure) { show.lure.y += (dy - LE.highY - show.lure.y) * Math.min(1, dt * 1.5); putLure(e, show, show.lure); }
      if (e.modeT <= 0) { show.lights = []; idle(e, show); } return ev;
    /* ---- PHASE TWO: up beside the raft, the gums at the rail (keyed LOW), then THE SNAP where you stand ---- */
    case 'surface': putUnder(e, show, show.jaws.x); if (e.modeT <= 0) { putJaws(e, show, show.jaws.x); setMode(e, 'jaws', LE.jawsT); show.n.keyed++; ev.push({ t: 'jaws' });
        if (!show.told.jaws) { show.told.jaws = true; c.number(show.jaws.x, dy - 50, 'ITS GUMS AT THE RAIL: SWEEP THEM LOW', '#ffd36b'); } } return ev;
    case 'jaws': putJaws(e, show, show.jaws.x); if (e.modeT <= 0) { if (hero && hero.onRaft) startSnap(e, show, c, ev, hero); else { setMode(e, 'sink', LE.sinkT); } } return ev;
    case 'snapTell': { putJaws(e, show, show.jaws.x); const s = show.snap, len = e.modeLen;
      if (!s.fixed && e.modeT > len * (1 - LE.snapFollow) && hero) { const d = hero.x - s.x; s.x = onDeckX(show, s.x + Math.sign(d) * Math.min(Math.abs(d), 110 * dt), 8); }
      else if (!s.fixed) s.fixed = true;
      if (e.modeT <= 0) { const hit = c.zone([s.x - LE.snapR, s.x + LE.snapR], [dy - 30, dy + 4], LE.dmg.snap, MOVE_NAME.snap, 'snap' + s.id); show.n.snap++; c.sound('snap'); ev.push({ t: 'snap', hit });
        putJaws(e, show, s.x);
        if (hit) { show.n.snapHit++; setMode(e, 'sink', LE.sinkT + 0.2); }
        else { show.n.stuck++; openIt(e, show, ev, c, 'stuck'); c.sound('stuck'); c.number(s.x, dy - 44, 'ITS TEETH ARE IN THE TIMBER: CUT IT', '#ffd36b'); } }
      return ev; }
    case 'sink': putUnder(e, show, e.x); if (e.modeT <= 0) idle(e, show); return ev;
    /* ---- PHASE THREE, DIMMED: it bites at copies of the light out in the fog ---- */
    case 'dark': putUnder(e, show, e.x);
      if (show.lantern.lit) { idle(e, show, 0.3); return ev; }
      if (e.modeT <= 0) { const [x0, x1] = raftEnds(show), side = Math.random() < 0.5 ? -1 : 1, x = side < 0 ? Math.max(show.A.pool.x0 + 10, x0 - 40) : Math.min(show.A.pool.x1 - 10, x1 + 40);
        show.decoys.push({ x, t: 1.0 }); show.n.decoy++; c.sound('decoy'); ev.push({ t: 'decoy', x }); setMode(e, 'dark', LE.decoyT); }
      return ev;
    /* ---- THE SWELL: told, then a swell runs along the deck ---- */
    case 'swellTell': if (e.modeT <= 0) { show.swell.st = 'run'; show.n.swell++; setMode(e, 'swell', 3); c.sound('swell'); ev.push({ t: 'swell' }); } return ev;
    case 'swell': { const s = show.swell; s.x += s.dir * LE.swellSpeed * dt; putUnder(e, show, s.x);
      const n = c.band('low', [dy - 10, dy + 4], s.x - 12, s.x + 12, LE.dmg.swell, MOVE_NAME.swell, 'swell' + s.id, { push: s.dir * 150 }); if (n) show.n.swellHit += n;
      if ((s.dir > 0 && s.x >= s.to) || (s.dir < 0 && s.x <= s.to) || e.modeT <= 0) { show.swell = null; idle(e, show); }
      return ev; }
  }
  return ev;
}
function idle(e, show, t) { setMode(e, 'idle', t ?? LE.gap[(e.phase || 1) - 1]); putUnder(e, show, e.x); }
function snagged(e, show, c, ev) {
  show.snagged = false; show.n.snag++; show.lights = show.lights.filter(L => L.kind === 'lure'); openIt(e, show, ev, c, 'snag'); c.sound('snag');
  c.number(e.x, deckY(show) - 56, 'THE LURE IS SNAGGED: CUT IT', '#ffd36b');
}
let ID = 0;
function startGulp(e, show, c, ev) {
  show.gulp = { x: show.lure.x, id: ++ID }; setMode(e, 'gulpTell', tellOf(e, 'gulp')); ev.push({ t: 'gulpTell' }); c.say('!!'); c.sound('gulpTell'); show.last = 'gulp';
  if (!show.told.gulp) { show.told.gulp = true; c.number(show.lure.x, deckY(show) - 56, 'ITS MOUTH IS UNDER THE LURE: GET OUT FROM UNDER IT', '#ffd36b'); }
}
function startHunt(e, show, c, ev) {
  show.hunt = { x: lanternX(show), id: ++ID }; setMode(e, 'huntTell', tellOf(e, 'hunt')); ev.push({ t: 'huntTell' }); c.say('!!'); c.sound('huntTell'); show.last = 'hunt';
  if (!show.told.hunt) { show.told.hunt = true; c.number(show.hunt.x, deckY(show) - 56, 'IT HUNTS YOUR LIGHT: LEAVE THE LANTERN, OR DIM IT', '#ffd36b'); }
}
function startSnap(e, show, c, ev, hero) {
  show.snap = { x: onDeckX(show, hero.x, 8), hero, id: ++ID, fixed: false }; setMode(e, 'snapTell', tellOf(e, 'snap')); ev.push({ t: 'snapTell' }); c.say('!!'); c.sound('snapTell'); show.last = 'snap';
  if (!show.told.snap) { show.told.snap = true; c.number(show.jaws.x, deckY(show) - 56, 'THE SNAP: STEP OUT AND ITS TEETH STICK IN THE RAFT', '#ffd36b'); }
}

/* ---------- STRIKES ON WHAT IS NOT ITS BODY: the real lamp (it clanks), the raft's lantern (phase three's verb) ---------- */
export function lampBox(L) { return { l: L.x - LE.lureW / 2, r: L.x + LE.lureW / 2, t: L.y - LE.lureH, b: L.y }; }
export function strikeAt(e, show, hb, seen) {
  const out = []; if (!e || !show || !hb) return out; const once = seen || new Set();
  for (const L of show.lights) if (L.kind === 'lamp' && !once.has('lamp') && hitsBox(hb, lampBox(L))) { once.add('lamp'); show.n.lampHit++; out.push({ what: 'lamp', x: L.x, y: L.y }); }
  if (e.phase === 3 && !once.has('lantern') && hitsBox(hb, lanternBox(show))) { once.add('lantern'); out.push({ what: 'lantern' }); }
  return out;
}

/* ---------- THE STAGE ----------
   Laid into a painter-like writer (set / block / plat / ent) with its WEST GATE at column sx and its LANDINGS' floor at row R - claude/canal4's raft chamber.
   FOOTPRINT: 40 columns, sx .. sx+39 (the two gates are sx and sx+39), rows R-16 .. R+STAGE.depth+1.
     - the gates' columns are solid from row R-16 down, with a door at rows R-6 .. R-1 in each (the arena walls close it when it wakes);
     - a stone LANDING inside each door (STAGE.land columns, floor row R), and between them its WATER (rows R .. R+depth-1, the bed under it);
     - THE RAFT is a mover (m.leRaft: src/lantern-eater-hands.js moves it), moored at the west landing.
   Returns { arena, movers, pools }. */
export function stageLanternEater(W, T, TS, sx, R) {
  const { set, block, ent } = W, ex = sx + STAGE.W - 1, top = R - STAGE.top, D = STAGE.depth;
  block(sx, sx, top, R + D); block(ex, ex, top, R + D);
  for (let y = R - STAGE.door; y <= R - 1; y++) { set(sx, y, T.AIR); set(ex, y, T.AIR); }
  for (let x = sx + 1; x < ex; x++) for (let y = top; y < R; y++) set(x, y, T.AIR);
  block(sx + 1, sx + STAGE.land, R, R + D); block(ex - STAGE.land, ex - 1, R, R + D);   /* the landings, stone to the bed */
  for (let x = sx + STAGE.land + 1; x < ex - STAGE.land; x++) for (let y = R; y < R + D; y++) set(x, y, T.AIR);   /* its water */
  block(sx + 1, ex - 1, R + D, R + D + 1);                                                  /* the bed */
  ent('lanterneater', sx + 20, R - 1, { face: -1 });
  const A = geom(sx, R, TS);
  const arena = { x0: A.x0, x1: A.x1, floor: A.deck, y0: A.top, trigger: (sx + STAGE.land + 2) * TS, wallL: sx, wallR: ex, boss: 'lanterneater', music: 'lanterneater',
    tint: '#101a22', tintA: 0.14, camFrame: true, start: [sx + STAGE.land + 4, R - 1], door: [sx + STAGE.land, R], lock: { sx, R, raft: true } };
  const movers = [{ kind: 'lift', leRaft: true, x: A.moorW, y: A.deck, y0: A.deck, y1: A.deck, w: LE.raftW, h: 8, speed: 0 }];
  const pools = [{ x0: A.pool.x0, x1: A.pool.x1, y: A.surf, bottom: A.bed, swim: false, clear: true, shallow: false, depth: A.bed - A.surf, lock: true, leWater: true }];
  return { arena, movers, pools };
}

/* ---------- THE BOT'S READING (src/lab.js) ----------
   A HUMAN BOT. It reads only what is DRAWN: the lights' motion (the lure's sway against the lamp's flicker - a read it gets right PLAN.misLight short of every
   time, PLAN.readT after they show), the red marks and rings of its tells (its mode, a reaction late through the lab's eyes), the snap's mark on the deck, the
   swell's crest, the lantern's light, the gold ring of an opening. It swings at the wrong angle now and then (PLAN.wrongAngle: a plain swing - it clanks),
   misses some tells (PLAN.missDodge) and takes a breath between swings (PLAN.rest).
   s = { P: { x, y, face, ground, swim, snare, atk }, e, show, reach, t (seconds), rng, mem, eyes } -> keys
   out = { gx, face, atk, jump, down, up, why } */
export const PLAN = { react: 0.25, readT: 0.45, misLight: 0.15, missDodge: 0.12, wrongAngle: 0.12, jumpAtk: 0.45, rest: 0.18, bail: 0.5 };
export function lanternPlan(s) {
  const { P, e, show, reach } = s, out = { gx: null, face: P.face, atk: false, jump: false, down: false, up: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 800) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = PLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  if (mem.seed === undefined) mem.seed = Math.floor(rng() * 1e9);
  const die = key => { let h = 2166136261 ^ mem.seed; for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); } h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); h ^= h >>> 15; return (h >>> 0) / 4294967296; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, die(key) < pr); return mem.roll.get(key); };
  const [rx0, rx1] = raftEnds(show), clamp = x => Math.max(rx0 + 10, Math.min(rx1 - 10, x));
  const away = (x, r) => { const room = [rx1 - x, x - rx0], side = room[0] > room[1] ? 1 : -1; let g = x + side * (r + 22); if (g < rx0 + 10 || g > rx1 - 10) g = x - side * (r + 22); return clamp(g); };
  const m = e.mode, cyc = 'c' + show.n.cycle, left = (e.modeT || 0) + (s.eyes ? (die('lt' + cyc + Math.floor(t * 4)) - 0.5) * 0.12 : 0);
  if (P.snare > 0) { out.why = 'held'; return out; }
  /* ---- 1. A STRIKE HIGH at whatever light it took for the lure (a breath between swings; now and then a plain swing - it clanks) ---- */
  const strikeHigh = (px, why) => { const d = px - P.x; out.face = Math.sign(d) || P.face; const at = px - out.face * 10; out.gx = Math.abs(at - P.x) > 4 ? clamp(at) : null;
    if (Math.abs(at - P.x) > 9) { out.why = 'under the ' + why; return out; }
    const breath = mem.lastAtk !== undefined && t - mem.lastAtk < PLAN.rest; if (breath || P.atk >= 0) { out.why = 'under the ' + why; return out; }
    const sw = 's' + Math.floor(t / 0.4); if (roll(sw + 'w', PLAN.wrongAngle)) { out.atk = true; mem.lastAtk = t; out.why = 'a plain swing (wrong)'; return out; }
    if (!P.ground) { out.atk = true; mem.lastAtk = t; out.why = 'a jump attack at the ' + why; return out; }
    if (roll(sw + 'j', PLAN.jumpAtk)) { out.jump = true; out.why = 'jump for the ' + why; return out; }
    out.up = true; out.atk = true; mem.lastAtk = t; out.why = 'the rising cut at the ' + why; return out; };
  /* which light it takes for the lure (read off the sway and the flicker PLAN.readT after they show; wrong now and then - until the lamp clanks) */
  const pickOf = () => { const lure = show.lights.find(L => L.kind === 'lure'), lamp = show.lights.find(L => L.kind === 'lamp'), key = 'L' + show.n.lights;
    if (!seenFor(key, PLAN.readT)) return null;
    if (show.n.lampHit > (mem.lampSeen || 0)) { mem.lampSeen = show.n.lampHit; mem.lampHit = show.n.lights; }
    return lamp && roll(key + 'mis', PLAN.misLight) && mem.lampHit !== show.n.lights ? lamp : lure; };
  /* ---- 2. THE BAIT: the lure over its mouth (the gulp, the hunt) - strike while the tell has time left, then get out of the zone ---- */
  const zoneOf = m === 'gulpTell' ? show.gulp : m === 'huntTell' ? show.hunt : null;   /* (its mode is read a reaction late: the zone it names may be gone) */
  if (zoneOf) { const z = zoneOf.x, R = m === 'gulpTell' ? LE.gulpR : LE.huntR, inZone = Math.abs(P.x - z) < R + 12;
    const pick = pickOf(), lure = show.lights.find(L => L.kind === 'lure'), dodge = !roll(cyc + 'zd', PLAN.missDodge);
    if (pick && !(inZone && left <= PLAN.bail)) return strikeHigh(pick.x + (pick.sway || 0), pick === lure ? 'lure' : 'lamp');
    if (inZone && dodge) { out.gx = away(z, R); out.face = Math.sign(z - P.x) || 1; out.why = 'out of its mouth'; return out; }
    out.gx = P.x; out.why = 'wait'; return out; }
  if (m === 'snapTell' && show.snap && !roll(cyc + 'sd', PLAN.missDodge)) { const sn = show.snap, len = e.modeLen || LE.snapTell;
    if (Math.abs(sn.x - P.x) < LE.snapR + 14) { if (left < len * (1 - LE.snapFollow)) { out.gx = away(sn.x, LE.snapR); out.why = 'out of the snap'; return out; } out.gx = P.x; out.why = 'let the mark fix'; return out; }
    out.gx = P.x; out.why = 'clear of the snap: wait'; return out; }
  if ((m === 'swellTell' || m === 'swell') && show.swell) { const sw = show.swell, ahead = Math.sign(P.x - sw.x) === sw.dir || Math.abs(P.x - sw.x) < 8;
    if (m === 'swell' && ahead && Math.abs(sw.x - P.x) < 50 && P.ground && !roll('sw' + sw.id, PLAN.missDodge)) { out.jump = true; out.gx = P.x; out.why = 'jump the swell'; return out; }
    out.gx = P.x; out.why = 'the swell is coming'; return out; }
  if (['wake', 'phase', 'snuff', 'sleep'].includes(m)) { out.gx = clamp((rx0 + rx1) / 2); out.why = 'wait'; return out; }
  /* ---- 3. PHASE THREE: a dim lantern is raised (struck) before anything else ---- */
  if (e.phase === 3 && !show.lantern.lit) { const lx = lanternX(show), d = lx - P.x; out.face = Math.sign(d) || 1;
    out.gx = Math.abs(d) > reach - 4 ? clamp(lx - out.face * Math.max(8, reach - 8)) : null; if (Math.abs(d) < reach + 2 && P.atk < 0 && P.ground && (mem.lastAtk === undefined || t - mem.lastAtk > 0.3)) { out.atk = true; mem.lastAtk = t; } out.why = 'raise the light'; return out; }
  /* ---- 4. OPEN: to it, and cut (any angle lands) ---- */
  if (m === 'open' && (s.eyes || seenFor('open' + show.n.open))) { const d = e.x - P.x; out.face = Math.sign(d) || 1;
    if (e.part === 'lure') { out.gx = Math.abs(d) > 6 ? clamp(e.x - out.face * 6) : null; if (Math.abs(d) < 14 && P.atk < 0 && (mem.lastAtk === undefined || t - mem.lastAtk > 0.1)) { out.atk = true; mem.lastAtk = t; if (P.ground) out.up = true; } }
    else { out.gx = Math.abs(d) > reach - 6 ? clamp(e.x - out.face * (reach - 10)) : null; if (Math.abs(d) < reach + 8 && P.atk < 0 && (mem.lastAtk === undefined || t - mem.lastAtk > 0.1)) { out.atk = true; mem.lastAtk = t; } }
    out.why = 'open: cut it'; return out; }
  if (m === 'ward' || m === 'rise' || m === 'gulp' || m === 'hunt' || m === 'sink' || m === 'dark') { out.gx = clamp(m === 'dark' ? (rx0 + rx1) / 2 : P.x); out.why = 'it draws back'; return out; }
  /* ---- 5. THE LIGHTS COMING DOWN: under the one it takes for the lure ---- */
  if (m === 'lights' && show.lights.length) { const pick = pickOf(); if (!pick) { out.gx = P.x; out.why = 'reading the lights'; return out; }
    const px = pick.x + (pick.sway || 0), d = px - P.x; out.face = Math.sign(d) || P.face; const at = px - out.face * 10; out.gx = Math.abs(at - P.x) > 4 ? clamp(at) : null; out.why = 'under the light'; return out; }
  /* ---- 6. PHASE TWO: the gums at the rail, LOW ---- */
  if ((m === 'jaws' || m === 'surface') && show.jaws) { const jx = show.jaws.x, side = show.jaws.side, stand = clamp(jx - side * Math.max(10, reach - 6)); out.face = Math.sign(jx - P.x) || 1;
    out.gx = Math.abs(stand - P.x) > 4 ? stand : null; if (m === 'surface' || Math.abs(P.x - stand) > 8) { out.why = 'to the rail'; return out; }
    const breath = mem.lastAtk !== undefined && t - mem.lastAtk < PLAN.rest; if (breath || P.atk >= 0) { out.why = 'at the rail'; return out; }
    const sw = 's' + Math.floor(t / 0.4); if (roll(sw + 'w', PLAN.wrongAngle)) { out.atk = true; mem.lastAtk = t; out.why = 'a plain swing (wrong)'; return out; }
    out.down = true; out.gx = null; if (P.ground) { out.atk = true; mem.lastAtk = t; } out.why = 'sweep its gums low'; return out; }
  out.gx = clamp((rx0 + rx1) / 2 + (e.phase === 3 ? 30 : 0)); out.why = 'mid-raft'; return out;
}
