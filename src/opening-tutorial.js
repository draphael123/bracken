// src/opening-tutorial.js - THE ROADSIDE LESSON (claude/tutorial1, Daniel 11-05 22:05): a short GENERIC opening for a NEW save (the same layout for every hero),
// replayable from the inn's training yard, that ends at the door of THE CROSSROADS INN.
//   It replaces what the Arena Yard took (11-03 18:34): a new player got no teaching at all. The Arena Yard stays (tavern door / title / pause) for every move of one hero;
//   this lesson is only the basics every hero shares: MOVE, JUMP, a HELD (higher) JUMP, ATTACK, THE STRAW YARD (claude/tutorial2: HEAVY, RISING, SWEEP, PLUNGE - one gated target each), BLOCK, DODGE, a FLASK, a SHRINE. The old open yard (git: openYard, before 87cb86171)
//   gave the straw men, the gap and the ledges; they are rebuilt here as a line of stations with a gate after each one that has something to do.
//   NO `trial` flag (co-op works for a replay; flasks and the HUD must work, a trial hides both). Its safety is main.js yardSafe(): L.opening is safe like the yard.
//   What a step taught is written to PROG.taught (main.js lessonHint reads it: the wood does not say again what the lesson already said).
// Prompts are built from the CURRENT hero's own keys (keyboard / pad / touch words, main.js opnWords) - nothing is hard-coded to X or C.
// This module is pure of main.js: the level builder, the step table, the prompt lines, and a runtime that main.js hands its api.

import { ROW as PLUNGE_ROW } from './plunges.js';

export const OT = { W: 162, H: 26, FLOOR: 20, START: 4 };
/* the stations, by column (x0..x1 is where a step is "the one you are on"). gate: the column of the port that lifts when it is done (null = the ground itself is the gate).
   taught: the PROG.taught key it writes - 'third' is main.js lessonHint's (written only if a heavy third blow was struck); the rest are this lesson's own marks (jump, highjump, block, dodge, flask, shrine) for later hints to read. */
export const STEPS = [
  { id: 'move',   name: 'MOVE',        x0: 2,  x1: 14,  gate: null, taught: null,    sign: 'THE TUTORIAL. WALK ON.' },
  { id: 'jump',   name: 'JUMP',        x0: 15, x1: 27,  gate: null, taught: 'jump',  sign: 'A CURB AND A DITCH. JUMP THEM.' },
  { id: 'high',   name: 'HIGHER',      x0: 28, x1: 38,  gate: null, taught: 'highjump', sign: 'A HIGH LEDGE. HOLD THE JUMP.' },
  { id: 'attack', name: 'ATTACK',      x0: 39, x1: 50,  gate: 51,   taught: 'third', sign: 'STRAW MEN. THREE BLOWS IN A RUN: A HEAVY THIRD.', need: 3 },
  /* THE STRAW YARD (claude/tutorial2, Daniel 11-07): one gated target per shared move. `move` is the verb the step wants (credited from the blow's own tag, see blowKinds);
     a hero who has no such move skips the station (moveWords(hero)[move] === null: the gate lifts by itself, nothing is taught, the count leaves it out). taught is a list: the lesson's mark
     and the key main.js lessonHint reads (heavyblow, sweep, down) so the wood does not say it again. */
  { id: 'heavy',  name: 'HEAVY',       x0: 52, x1: 62,  gate: 63,   taught: ['heavy', 'heavyblow'], move: 'heavy',  sign: 'ARMOUR. ONLY A HEAVY BLOW BREAKS IT.' },
  { id: 'rise',   name: 'RISING',      x0: 64, x1: 74,  gate: 75,   taught: ['rising', 'rise'],     move: 'rise',   sign: 'A STRAW BIRD UP HIGH. CUT UPWARD.' },
  { id: 'sweep',  name: 'SWEEP',       x0: 76, x1: 86,  gate: 87,   taught: ['sweep'],              move: 'sweep',  sign: 'A STRAW RAT UNDER THE BEAM. CUT LOW.' },
  { id: 'plunge', name: 'PLUNGE',      x0: 88, x1: 100, gate: 101,  taught: ['plunge', 'down'],     move: 'plunge', sign: 'A BARREL LID. COME DOWN ON IT.' },
  { id: 'block',  name: 'BLOCK',       x0: 102, x1: 113, gate: 114, taught: 'block', sign: 'A STRAW SWORDSMAN. NOTHING HERE HURTS YOU.', need: 1 },
  { id: 'dodge',  name: 'DODGE',       x0: 115, x1: 126, gate: 127, taught: 'dodge', sign: 'ANOTHER. THIS TIME, GET OUT OF THE WAY.', need: 1 },
  { id: 'flask',  name: 'FLASK',       x0: 128, x1: 138, gate: 139, taught: 'flask', sign: 'THE ROAD HAS BITTEN YOU. A FLASK MENDS IT.' },
  { id: 'shrine', name: 'SHRINE',      x0: 140, x1: 149, gate: 150, taught: 'shrine', sign: 'A SHRINE. LIGHT IT.' },
];
export const GEO = { curb: 19, pit: [23, 25], ledge: [32, 34], door: 156, shrine: 144, dummies: [43, 46, 48],
  /* the straw yard: the armoured man (col), the bird on its pole (col; a one-way plank two rows up, a post under it), the rat under a beam (col, beam cols), the barrel lid by a ledge (lid col, ledge cols) */
  armour: 58, bird: 70, rat: 83, beam: [80, 86], lid: 98, pledge: [93, 95],
  block: { foe: 106, lx: [103, 113] }, dodge: { foe: 119, lx: [116, 124] /* batch150: 124 not 126 - his swing reached a hurt hero drinking at the start of the flask station */ }, inn: { x0: 151, x1: 159 } };
export const ROLL_GRACE = 0.45;   /* s: a roll that ended up to this long before his blow still counts (a dodge is 0.2 s; the flash is the beat, not a frame) */
export const STALL_S = 40;   /* s in one station with no headway: its gate opens anyway ("ON WE GO"): a lesson never traps anybody (a step opened this way teaches nothing) */
export const INN_SIGN = "THE CROSSROADS INN";
export const INN_CARD = { title: "THE CROSSROADS INN", body: 'YOUR HOME BETWEEN ROADS: FRIENDS JOIN HERE, CHANGE YOUR LOOK, TRAIN, THEN TAKE THE ROAD.' };
export const LESSON_TIPS = ["THE CROSSROADS INN: PRESS F ON THE MAP. FRIENDS JOIN, THE WARDROBE, TRAINING.", "THE ARENA YARD IS THROUGH THE INN'S TRAINING YARD: EVERY MOVE YOUR HERO HAS.", "WANT THE TUTORIAL AGAIN? THE TUTORIAL BOARD IN THE INN'S YARD REPLAYS IT."];

/* THE HERO'S OWN WORDS for the four straw-yard moves, from src/controls.js cardRows (the controls card is the one place those words live):
   heavy = the card's held-swing row (knight HEAVY CUT, geomancer FAULT LINE, berserker DOUBLE CHOP, ranger DRAW, the rest HEAVY BLOW; geomancer and ranger LET GO),
   rise = RISING CUT (ranger RISING SHOT), sweep = LOW SWEEP, plunge = the plunge row (ranger DOWN SHOT, paladin DAWN HAMMER, pirate BOARDING, geomancer EARTHFALL, berserker AXE SPIN, the rest PLUNGE).
   null = the hero has no such move here and skips the station: the ranger's DOWN+SWING on her feet is a kneeling DRAW in the bow stance (the knife's sweep needs the knife drawn), so she has no low sweep to teach on this road. */
export function moveWords(h) {
  const heavy = { knight: 'HEAVY CUT', geomancer: 'FAULT LINE', berserker: 'DOUBLE CHOP', ranger: 'DRAW' }[h] || 'HEAVY BLOW';
  return {
    heavy: { name: heavy, letgo: h === 'geomancer' || h === 'ranger' },
    rise: { name: h === 'ranger' ? 'RISING SHOT' : 'RISING CUT' },
    sweep: h === 'ranger' ? null : { name: 'LOW SWEEP' },
    plunge: { name: (h === 'ranger' ? 'DOWN SHOT' : (PLUNGE_ROW[h] || ['plunge'])[0]).toUpperCase() },
  };
}
/* does this step run for this hero (a step with no `move` always does) */
export const stepLive = (step, h) => !step.move || !!moveWords(h)[step.move];
export const liveSteps = h => STEPS.filter(s => stepLive(s, h));
/* WHICH OF THE FOUR A BLOW ON A STRAW MAN WAS, from the blow's own tag (main.js BLOW: 'heavy', 'rise', 'sweep', 'plunge', a list for a shot) and hurtEnemy's plunge flag */
export function blowKinds(tag, plunge) {
  const has = v => tag === v || (Array.isArray(tag) && tag.includes(v)), out = [];
  if (plunge || has('plunge') || has('down')) out.push('plunge');
  if (has('heavy')) out.push('heavy');
  if (has('rise')) out.push('rise');
  if (has('sweep')) out.push('sweep');
  return out;
}
/* the yard's own events (main.js trialEvent), for the blows whose tag is not the plain verb: the paladin's VERDICT, the geomancer's FAULT, the warden's RUN-THROUGH, the paladin's DAWNFALL, the ranger's DOWN SHOT */
export const EVENT_KIND = { heavyblow: 'heavy', verdict: 'heavy', fault: 'heavy', runthrough: 'heavy', rise: 'rise', sweep: 'sweep', pogo: 'plunge', hammerfall: 'plunge', down: 'plunge', spin: 'plunge' };
export const WRONG_HIT = { heavy: 'ARMOURED', rise: 'TOO HIGH', sweep: 'TOO LOW', plunge: 'FROM ABOVE' };

/* THE PROMPT of a step, from the hero's own words k = { move, jump, atk, block, dodge, flask, pause, up, down } and, for the straw yard, his id h. Pure. Every line fits three rows of the step panel. */
export function stepLine(id, k, h) {
  const up = k.up || 'UP', down = k.down || 'DOWN', mv = moveWords(h || 'knight');
  switch (id) {
    case 'move': return 'MOVE: ' + k.move + '. WALK ON TO THE CURB.';
    case 'jump': return 'JUMP: ' + k.jump + '. HOP THE CURB, THEN CLEAR THE DITCH.';
    case 'high': return 'HOLD ' + k.jump + ' LONGER FOR A HIGHER JUMP. CLIMB THE LEDGE.';
    case 'attack': return 'ATTACK: ' + k.atk + '. HIT THE STRAW MEN. THREE IN A RUN MAKE A HEAVY THIRD BLOW.';
    case 'heavy': return mv.heavy.name + ': HOLD ' + k.atk + (mv.heavy.letgo ? ', LET GO' : '') + '. THE ARMOUR TURNS A LIGHT BLOW.';
    case 'rise': return mv.rise.name + ': ' + up + ' + ' + k.atk + '. KNOCK THE STRAW BIRD OFF ITS POLE.';
    case 'sweep': return mv.sweep ? mv.sweep.name + ': ' + down + ' + ' + k.atk + '. TRIP THE STRAW RAT UNDER THE BEAM.' : '';
    case 'plunge': return mv.plunge.name + ': JUMP, THEN ' + down + ' + ' + k.atk + ' IN THE AIR. COME DOWN ON THE BARREL LID.';
    case 'block': return 'BLOCK: HOLD ' + k.block + ' AS HIS SWORD COMES DOWN. THE SWORD IS STRAW.';
    case 'dodge': return 'DODGE AS HIS SWORD COMES DOWN: ' + k.dodge + '. ROLL RIGHT THROUGH IT.';
    case 'flask': return 'YOU ARE HURT. DRINK A FLASK: ' + k.flask + '. STAND STILL; A BLOW SPILLS IT.';
    case 'shrine': return 'WALK UP TO THE SHRINE TO LIGHT IT. IT SAVES YOUR PLACE AND GIVES A FLASK BACK.';
    default: return '';
  }
}
export const SKIP_LINE = k => 'SKIP: ' + k.pause + ', THEN SKIP TUTORIAL';
export const stepCount = h => liveSteps(h).length;

/* THE LEVEL: painter + tile ids handed in by level.js (the way src/arena-yard.js is). One floor, a curb, a ditch, a ledge, straw, a gate after each station, a door to the inn. */
export function buildLesson({ painter, T }) {
  const { W, H, FLOOR: F } = OT, L = painter(W, H);
  const { block, ent, set } = L;
  const gy = F - 1;
  block(0, W - 1, F, H - 1); block(0, 1, 0, F - 1); block(W - 2, W - 1, 0, F - 1);
  for (const s of STEPS) ent('sign', s.x0 + 2, gy, { text: s.sign, mute: true });   /* (claude/polish151, first5 audit) a step's sign says what the prompt strip already says, and the hero spawns / stands on it: no floating E over him with nothing to use (the inn's own sign below stays talkable) */
  for (const x of [8, 20, 36, 60, 72, 84, 100, 108, 122, 136, 146]) ent('torch', x, gy);
  // ---- JUMP: a one-tile curb, then a three-wide ditch two rows deep (a floor in it: nothing is lost, and a jump climbs out) ----
  block(GEO.curb, GEO.curb, gy, gy);
  for (let x = GEO.pit[0]; x <= GEO.pit[1]; x++) for (let y = F; y <= F + 1; y++) set(x, y, T.AIR);
  block(GEO.pit[0], GEO.pit[1], F + 2, H - 1);
  // ---- HIGHER: a two-row ledge, three wide, the whole column solid to the floor ----
  block(GEO.ledge[0], GEO.ledge[1], F - 2, F - 1);
  // ---- ATTACK: three straw men ----
  for (const x of GEO.dummies) ent('dummy', x, gy);
  // ---- THE STRAW YARD (claude/tutorial2): four straw targets, each only the move it teaches reaches. otKind picks the sprite (src/tavern-art.js strawSet), otH the hit box ----
  ent('dummy', GEO.armour, gy, { otKind: 'armour' });   /* plate over the straw: a light blow rings off it (the lesson credits only a heavy one) */
  L.plat(GEO.bird, F - 2, 1); ent('dummy', GEO.bird, F - 3, { otKind: 'bird', otH: 16 });   /* a straw crow on a plank two rows up: over a standing swing, inside a rising cut's reach */
  ent('dummy', GEO.rat, gy, { otKind: 'rat', otH: 9 });   /* a straw rat, knee high and low under the beam: a swing passes over it, a sweep takes it */
  ent('dummy', GEO.lid, gy, { otKind: 'barrel', otH: 12 }); block(GEO.pledge[0], GEO.pledge[1], F - 2, F - 1);   /* a barrel with a straw lid, a ledge beside it to drop from */
  // ---- BLOCK and DODGE: a straw swordsman each, slow (tells twice as long), never down, kept to his own station ----
  ent('swornsword', GEO.block.foe, gy, { face: -1, trainer: 'drill', lx0: GEO.block.lx[0], lx1: GEO.block.lx[1], yardPace: 2.0 });
  ent('swornsword', GEO.dodge.foe, gy, { face: -1, trainer: 'drill', lx0: GEO.dodge.lx[0], lx1: GEO.dodge.lx[1], yardPace: 1.5, yardTell: true });   /* his sword flashes at the beat: roll as it flashes */
  // ---- the shrine ----
  ent('check', GEO.shrine, gy);   /* a shrine is the 'check' ent */
  // ---- the gates: a port from row 14 to the floor with stone above, so no jump gets over one ----
  const gates = [];
  for (const s of STEPS) if (s.gate) { for (let y = 14; y <= gy; y++) set(s.gate, y, T.PORT); block(s.gate, s.gate, 0, 13); gates.push({ id: s.id, col: s.gate }); }
  ent('sign', GEO.inn.x0 + 1, gy, { text: INN_SIGN + '. THE ROAD STARTS HERE. YOUR HOME BETWEEN ROADS.' });
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: OT.START, y: gy }, pools: [], falls: [], moversExtra: [], interiors: [],
    reskin: { swornsword: 'strawsword' }, openYard: true, opening: { steps: STEPS, gates, door: GEO.door, floor: F, props: [{ k: 'pole', x0: GEO.bird, row: F - 2 }, { k: 'beam', x0: GEO.beam[0], x1: GEO.beam[1], row: F - 4 }] }, duskStart: -1, duskLen: 1, music: 'select', ambient: [{ x0: 0, x1: 99999, kind: 'wind' }], reachExact: true, noCoin: true,
    palette: { sky: 'autumn', near: 'autumn', dress: 'wood', haze: 'rgba(200,120,80,0.12)', grass: '#6a8a3a', grassL: '#9ac050', grassD: '#3a5a24', dirt: '#4a3020', dirtL: '#5e3f2a', dirtD: '#2c1a10' },
  };
}

/* which step a column belongs to (or the last one past the end) */
export const stepAtCol = col => STEPS.findIndex(s => col >= s.x0 && col <= s.x1);

/* THE RUNTIME. api: { L(), P(), hero(), enemies(), guarding(p), time(), TS, shrines(), words(), openGate(col), sfx(k), say(msg, col), taught(kind), hint(msg, secs), hurtMe(), save(), leave(), text, wrap, board, VW, VH } */
export function makeLesson(api) {
  const st = { i: 0, done: {}, got: {}, sayAt: -9, ev: { hit: 0, third: 0, blocked: 0, dodged: 0 }, inStep: 0, jumped: false, drunk: false, prime: false, card: null, t: 0, stats: { skipped: 0, finished: 0, stalls: 0 }, nearDoor: false, rollAt: -9 };
  const on = () => !!api.L() && !!api.L().opening;
  const heroId = () => (api.hero ? api.hero() : '') || 'knight';
  const col = () => { const P = api.P(); return P ? P.x / api.TS : 0; };
  const reset = () => { st.i = 0; st.done = {}; st.got = {}; st.sayAt = -9; st.ev = { hit: 0, third: 0, blocked: 0, dodged: 0 }; st.inStep = 0; st.jumped = false; st.drunk = false; st.prime = false; st.nearDoor = false; };
  function finish(step, why) {
    st.done[step.id] = why || 'ok'; st.inStep = 0; if (step.gate && api.L().opening.gates.some(g => g.id === step.id)) api.openGate(step.gate);
    if (why === 'skip') { /* this hero has no such move: the gate lifts, nothing is said or taught */ } else if (why !== 'stall') { api.sfx('coin'); api.say(step.name + ' DONE', '#8fd160'); if (step.taught && (step.id !== 'attack' || st.ev.third > 0)) api.taught(step.taught); } else { st.stats.stalls++; api.say('ON WE GO', '#ffd36b'); }
    st.i = Math.min(STEPS.length, STEPS.findIndex(s => !st.done[s.id]) < 0 ? STEPS.length : STEPS.findIndex(s => !st.done[s.id]));
  }
  /* each step's own test, from the world: what the hero did, polled; the hooks (hit / blow) only count */
  function test(step, P) {
    const c = col();
    switch (step.id) {
      case 'move': return c >= 14;
      case 'jump': return st.jumped && c >= 27;
      case 'high': return P.ground && P.y <= (OT.FLOOR - 2) * api.TS + 2 && c >= GEO.ledge[0] && c <= GEO.ledge[1] + 1 || c >= 36;
      case 'attack': return st.ev.hit >= step.need;
      case 'block': return st.ev.blocked >= step.need || (st.ev.blocked + st.ev.dodged) >= step.need + 1;
      case 'dodge': return st.ev.dodged >= step.need || (st.ev.blocked + st.ev.dodged) >= step.need + 2;
      case 'heavy': case 'rise': case 'sweep': case 'plunge': return !!st.got[step.move];
      case 'flask': return st.drunk;
      case 'shrine': return api.shrines().some(s => s.lit);
      default: return false;
    }
  }
  function tick(dt) {
    if (!on()) return;
    const hero = heroId();
    for (const sp of STEPS) if (!st.done[sp.id] && !stepLive(sp, hero)) finish(sp, 'skip');   /* a station this hero has no move for opens at once */
    const P = api.P(); if (!P || P.dead) return; st.t += dt;
    const c = col(), here = stepAtCol(Math.floor(c));
    if (!P.ground && P.vy < -120 && here === 1) st.jumped = true;
    if (P.dodge > 0) st.rollAt = api.time();   /* the last frame you were rolling */
    if (P.drinkT > 0 && P.drunk) st.drunk = true;
    /* A ROLL THROUGH HIS BLOW: his swing lands only on a hero in front of him within reach, so a roll that carries you through never calls damagePlayer - read his own swing (mode 'cut', once) against your roll */
    for (const e of api.enemies()) { if (e.t !== 'swornsword' || !e.trainer) continue; if (e.mode === 'cut') { if (!e.lessonCut) { e.lessonCut = true; if (api.time() - st.rollAt < ROLL_GRACE && Math.abs(e.x - P.x) < 70 && Math.abs(e.y - P.y) < 24) st.ev.dodged++; else if (api.guarding(P) && Math.abs(e.x - P.x) < 56 && Math.abs(e.y - P.y) < 24 && Math.sign(e.x - P.x) === (P.face || 1)) st.ev.blocked++; } } else e.lessonCut = false; }
    if (st.i >= STEPS.length) { st.nearDoor = Math.abs(c - (OT.W > 0 ? api.L().opening.door : 0)) < 1.6 && P.ground; return; }
    const step = STEPS[st.i];
    if (step.id === 'flask' && !st.prime && c >= step.x0 + 1) { st.prime = true; api.hurtMe(); }   /* the road has bitten you: 45% health and at least one flask, once, when you reach it */
    if (test(step, P)) { finish(step); return; }
    if (here === st.i) { st.inStep += dt; if (st.inStep > STALL_S && step.gate) finish(step, 'stall'); }
    st.nearDoor = Math.abs(c - api.L().opening.door) < 1.6 && P.ground;
  }
  /* the hooks main.js calls */
  function dummyHit(P, tag, plunge) { if (!on()) return; st.ev.hit++; if (P && P.heavySwing && !P.heavy) st.ev.third++;
    const ks = blowKinds(tag, plunge); let got = false; for (const k of ks) got = credit(k) || got;
    if (!got) wrong(); }
  /* a straw-yard step's credit: the verb it wants, struck while the hero stands in its station (a hair either side: a plunge off the ledge, a cut from the gate) */
  function credit(kind) { if (!on() || st.i >= STEPS.length) return false; const step = STEPS[st.i]; if (!step.move || step.move !== kind) return false; const c = col(); if (c < step.x0 - 1 || c > step.x1 + 2) return false; st.got[kind] = 1; return true; }
  const event = kind => { const k = EVENT_KIND[kind]; if (k) credit(k); };
  /* the wrong blow on the station's target says why, once a second */
  function wrong() { const step = STEPS[st.i]; if (!step || !step.move || api.time() - st.sayAt < 1.2) return; const c = col(); if (c < step.x0 - 1 || c > step.x1 + 2) return; st.sayAt = api.time(); api.say(WRONG_HIT[step.move], '#9aa39a'); }
  function blow(res, dodging) { if (!on()) return; if (res === 'blocked') st.ev.blocked++; else if (res === false && dodging) st.ev.dodged++; }
  function innCard(secs) { st.card = { t0: api.time(), dur: secs || 9 }; }
  /* the step panel, on the screen: what to do (the hero's own keys), how far along, and how to skip */
  function drawStep(g, VW, VH) {
    if (!on()) return;
    const k = api.words(), hero = heroId(), live = liveSteps(hero), step = STEPS[Math.min(st.i, STEPS.length - 1)], n = Math.min(live.indexOf(step), live.length - 1) < 0 ? live.length : live.indexOf(step);
    const done = st.i >= STEPS.length, msg = done ? 'THE ROAD STARTS AT THE INN. ' + k.talk + ' AT ITS DOOR TO GO IN.' : stepLine(step.id, k, hero);
    const w = VW - 16, lines = api.wrap(msg, w - 12, 6).slice(0, 3), h = lines.length * 8 + 17, x = 8, y = VH - h - 4, col = done ? '#8fd160' : '#c9b27c';
    g.fillStyle = 'rgba(10,8,20,0.84)'; g.beginPath(); g.roundRect(x, y, w, h, 3); g.fill(); g.strokeStyle = col; g.lineWidth = 1; g.beginPath(); g.roundRect(x + 0.5, y + 0.5, w - 1, h - 1, 3); g.stroke();
    lines.forEach((ln, i) => api.text(ln, x + 6, y + 4 + i * 8, '#fff6e0', 'left', 6));
    const yy = y + 5 + lines.length * 8;
    api.text(SKIP_LINE(k), x + 6, yy, '#9fc6e8', 'left', 6);
    api.text((done ? live.length : n + 1) + ' OF ' + live.length + (done ? '' : '  ' + step.name), x + w - 6, yy, col, 'right', 6);
  }
  /* the inn's welcome: once, on the first arrival (PROG.innTold), fading out */
  function drawCard(g, VW, VH) {
    const c = st.card; if (!c) return; c.t = api.time() - c.t0; if (c.t >= c.dur) { st.card = null; return; }
    const a = Math.min(1, c.t / 0.4, (c.dur - c.t) / 0.6), w = VW - 40, lines = api.wrap(INN_CARD.body, w - 12, 6).slice(0, 3), h = lines.length * 8 + 22, x = 20, y = 40;
    g.globalAlpha = a; api.board(x, y, w, h);
    api.text(INN_CARD.title, x + w / 2, y + 4, '#ffd36b', 'center', 6);
    lines.forEach((ln, i) => api.text(ln, x + w / 2, y + 14 + i * 8, '#fff6e0', 'center', 6));
    g.globalAlpha = 1;
  }
  return { st, on, tick, reset, dummyHit, event, blow, innCard, drawStep, drawCard, test, finish };
}
