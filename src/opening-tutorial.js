// src/opening-tutorial.js - THE ROADSIDE LESSON (claude/tutorial1, Daniel 11-05 22:05): a short GENERIC opening for a NEW save (the same layout for every hero),
// replayable from the inn's training yard, that ends at the door of WAYMEET'S CROSSROADS INN.
//   It replaces what the Arena Yard took (11-03 18:34): a new player got no teaching at all. The Arena Yard stays (tavern door / title / pause) for every move of one hero;
//   this lesson is only the basics every hero shares: MOVE, JUMP, a HELD (higher) JUMP, ATTACK, BLOCK, DODGE, a FLASK, a SHRINE. The old open yard (git: openYard, before 87cb86171)
//   gave the straw men, the gap and the ledges; they are rebuilt here as a line of stations with a gate after each one that has something to do.
//   NO `trial` flag (co-op works for a replay; flasks and the HUD must work, a trial hides both). Its safety is main.js yardSafe(): L.opening is safe like the yard.
//   What a step taught is written to PROG.taught (main.js lessonHint reads it: the wood does not say again what the lesson already said).
// Prompts are built from the CURRENT hero's own keys (keyboard / pad / touch words, main.js opnWords) - nothing is hard-coded to X or C.
// This module is pure of main.js: the level builder, the step table, the prompt lines, and a runtime that main.js hands its api.

export const OT = { W: 112, H: 26, FLOOR: 20, START: 4 };
/* the stations, by column (x0..x1 is where a step is "the one you are on"). gate: the column of the port that lifts when it is done (null = the ground itself is the gate).
   taught: the PROG.taught key it writes - 'third' is main.js lessonHint's (written only if a heavy third blow was struck); the rest are this lesson's own marks (jump, highjump, block, dodge, flask, shrine) for later hints to read. */
export const STEPS = [
  { id: 'move',   name: 'MOVE',        x0: 2,  x1: 14,  gate: null, taught: null,    sign: 'THE ROADSIDE LESSON. WALK ON.' },
  { id: 'jump',   name: 'JUMP',        x0: 15, x1: 27,  gate: null, taught: 'jump',  sign: 'A CURB AND A DITCH. JUMP THEM.' },
  { id: 'high',   name: 'HIGHER',      x0: 28, x1: 38,  gate: null, taught: 'highjump', sign: 'A HIGH LEDGE. HOLD THE JUMP.' },
  { id: 'attack', name: 'ATTACK',      x0: 39, x1: 50,  gate: 51,   taught: 'third', sign: 'STRAW MEN. THREE BLOWS IN A RUN: A HEAVY THIRD.', need: 3 },
  { id: 'block',  name: 'BLOCK',       x0: 52, x1: 63,  gate: 64,   taught: 'block', sign: 'A STRAW SWORDSMAN. NOTHING HERE HURTS YOU.', need: 1 },
  { id: 'dodge',  name: 'DODGE',       x0: 65, x1: 76,  gate: 77,   taught: 'dodge', sign: 'ANOTHER. THIS TIME, GET OUT OF THE WAY.', need: 1 },
  { id: 'flask',  name: 'FLASK',       x0: 78, x1: 88,  gate: 89,   taught: 'flask', sign: 'THE ROAD HAS BITTEN YOU. A FLASK MENDS IT.' },
  { id: 'shrine', name: 'SHRINE',      x0: 90, x1: 99,  gate: 100,  taught: 'shrine', sign: 'A SHRINE. LIGHT IT.' },
];
export const GEO = { curb: 19, pit: [23, 25], ledge: [32, 34], door: 106, shrine: 94, dummies: [43, 46, 48], block: { foe: 56, lx: [53, 63] }, dodge: { foe: 69, lx: [66, 76] }, inn: { x0: 101, x1: 109 } };
export const ROLL_GRACE = 0.45;   /* s: a roll that ended up to this long before his blow still counts (a dodge is 0.2 s; the flash is the beat, not a frame) */
export const STALL_S = 40;   /* s in one station with no headway: its gate opens anyway ("ON WE GO"): a lesson never traps anybody (a step opened this way teaches nothing) */
export const INN_SIGN = "WAYMEET'S CROSSROADS INN";
export const INN_CARD = { title: 'THE CROSSROADS INN', body: 'YOUR HOME BETWEEN ROADS: FRIENDS JOIN HERE, CHANGE YOUR LOOK, TRAIN, THEN TAKE THE ROAD.' };
export const LESSON_TIPS = ["THE CROSSROADS INN: PRESS F ON THE MAP. FRIENDS JOIN, THE WARDROBE, TRAINING.", "THE ARENA YARD IS THROUGH THE INN'S TRAINING YARD: EVERY MOVE YOUR HERO HAS.", "WANT THE OPENING LESSON AGAIN? THE LESSON BOARD IN THE INN'S YARD REPLAYS IT."];

/* THE PROMPT of a step, from the hero's own words k = { move, jump, atk, block, dodge, flask, pause }. Pure. Every line fits three rows of the step panel. */
export function stepLine(id, k) {
  switch (id) {
    case 'move': return 'MOVE: ' + k.move + '. WALK ON TO THE CURB.';
    case 'jump': return 'JUMP: ' + k.jump + '. HOP THE CURB, THEN CLEAR THE DITCH.';
    case 'high': return 'HOLD ' + k.jump + ' LONGER FOR A HIGHER JUMP. CLIMB THE LEDGE.';
    case 'attack': return 'ATTACK: ' + k.atk + '. HIT THE STRAW MEN. THREE IN A RUN MAKE A HEAVY THIRD BLOW.';
    case 'block': return 'BLOCK: HOLD ' + k.block + ' AS HIS SWORD COMES DOWN. THE SWORD IS STRAW.';
    case 'dodge': return 'DODGE AS HIS SWORD COMES DOWN: ' + k.dodge + '. ROLL RIGHT THROUGH IT.';
    case 'flask': return 'YOU ARE HURT. DRINK A FLASK: ' + k.flask + '. STAND STILL; A BLOW SPILLS IT.';
    case 'shrine': return 'WALK UP TO THE SHRINE TO LIGHT IT. IT SAVES YOUR PLACE AND GIVES A FLASK BACK.';
    default: return '';
  }
}
export const SKIP_LINE = k => 'SKIP: ' + k.pause + ', THEN SKIP LESSON';
export const stepCount = () => STEPS.length;

/* THE LEVEL: painter + tile ids handed in by level.js (the way src/arena-yard.js is). One floor, a curb, a ditch, a ledge, straw, a gate after each station, a door to the inn. */
export function buildLesson({ painter, T }) {
  const { W, H, FLOOR: F } = OT, L = painter(W, H);
  const { block, ent, set } = L;
  const gy = F - 1;
  block(0, W - 1, F, H - 1); block(0, 1, 0, F - 1); block(W - 2, W - 1, 0, F - 1);
  for (const s of STEPS) ent('sign', s.x0 + 2, gy, { text: s.sign });
  for (const x of [8, 20, 36, 52, 66, 80, 96]) ent('torch', x, gy);
  // ---- JUMP: a one-tile curb, then a three-wide ditch two rows deep (a floor in it: nothing is lost, and a jump climbs out) ----
  block(GEO.curb, GEO.curb, gy, gy);
  for (let x = GEO.pit[0]; x <= GEO.pit[1]; x++) for (let y = F; y <= F + 1; y++) set(x, y, T.AIR);
  block(GEO.pit[0], GEO.pit[1], F + 2, H - 1);
  // ---- HIGHER: a two-row ledge, three wide, the whole column solid to the floor ----
  block(GEO.ledge[0], GEO.ledge[1], F - 2, F - 1);
  // ---- ATTACK: three straw men ----
  for (const x of GEO.dummies) ent('dummy', x, gy);
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
    reskin: { swornsword: 'strawsword' }, openYard: true, opening: { steps: STEPS, gates, door: GEO.door, floor: F }, duskStart: -1, duskLen: 1, music: 'select', reachExact: true, noCoin: true,
    palette: { sky: 'autumn', near: 'autumn', dress: 'wood', haze: 'rgba(200,120,80,0.12)', grass: '#6a8a3a', grassL: '#9ac050', grassD: '#3a5a24', dirt: '#4a3020', dirtL: '#5e3f2a', dirtD: '#2c1a10' },
  };
}

/* which step a column belongs to (or the last one past the end) */
export const stepAtCol = col => STEPS.findIndex(s => col >= s.x0 && col <= s.x1);

/* THE RUNTIME. api: { L(), P(), enemies(), guarding(p), time(), TS, shrines(), words(), openGate(col), sfx(k), say(msg, col), taught(kind), hint(msg, secs), hurtMe(), save(), leave(), text, wrap, board, VW, VH } */
export function makeLesson(api) {
  const st = { i: 0, done: {}, ev: { hit: 0, third: 0, blocked: 0, dodged: 0 }, inStep: 0, jumped: false, drunk: false, prime: false, card: null, t: 0, stats: { skipped: 0, finished: 0, stalls: 0 }, nearDoor: false, rollAt: -9 };
  const on = () => !!api.L() && !!api.L().opening;
  const col = () => { const P = api.P(); return P ? P.x / api.TS : 0; };
  const reset = () => { st.i = 0; st.done = {}; st.ev = { hit: 0, third: 0, blocked: 0, dodged: 0 }; st.inStep = 0; st.jumped = false; st.drunk = false; st.prime = false; st.nearDoor = false; };
  function finish(step, why) {
    st.done[step.id] = why || 'ok'; st.inStep = 0; if (step.gate && api.L().opening.gates.some(g => g.id === step.id)) api.openGate(step.gate);
    if (why !== 'stall') { api.sfx('coin'); api.say(step.name + ' DONE', '#8fd160'); if (step.taught && (step.id !== 'attack' || st.ev.third > 0)) api.taught(step.taught); } else { st.stats.stalls++; api.say('ON WE GO', '#ffd36b'); }
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
      case 'flask': return st.drunk;
      case 'shrine': return api.shrines().some(s => s.lit);
      default: return false;
    }
  }
  function tick(dt) {
    if (!on()) return;
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
  function dummyHit(P) { if (!on()) return; st.ev.hit++; if (P && P.heavySwing && !P.heavy) st.ev.third++; }
  function blow(res, dodging) { if (!on()) return; if (res === 'blocked') st.ev.blocked++; else if (res === false && dodging) st.ev.dodged++; }
  function innCard(secs) { st.card = { t0: api.time(), dur: secs || 9 }; }
  /* the step panel, on the screen: what to do (the hero's own keys), how far along, and how to skip */
  function drawStep(g, VW, VH) {
    if (!on()) return;
    const k = api.words(), n = Math.min(st.i, STEPS.length), step = STEPS[Math.min(st.i, STEPS.length - 1)];
    const done = st.i >= STEPS.length, msg = done ? 'THE ROAD STARTS AT THE INN. ' + k.talk + ' AT ITS DOOR TO GO IN.' : stepLine(step.id, k);
    const w = VW - 16, lines = api.wrap(msg, w - 12, 6).slice(0, 3), h = lines.length * 8 + 17, x = 8, y = VH - h - 4, col = done ? '#8fd160' : '#c9b27c';
    g.fillStyle = 'rgba(10,8,20,0.84)'; g.beginPath(); g.roundRect(x, y, w, h, 3); g.fill(); g.strokeStyle = col; g.lineWidth = 1; g.beginPath(); g.roundRect(x + 0.5, y + 0.5, w - 1, h - 1, 3); g.stroke();
    lines.forEach((ln, i) => api.text(ln, x + 6, y + 4 + i * 8, '#fff6e0', 'left', 6));
    const yy = y + 5 + lines.length * 8;
    api.text(SKIP_LINE(k), x + 6, yy, '#9fc6e8', 'left', 6);
    api.text((done ? STEPS.length : n + 1) + ' OF ' + STEPS.length + (done ? '' : '  ' + step.name), x + w - 6, yy, col, 'right', 6);
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
  return { st, on, tick, reset, dummyHit, blow, innCard, drawStep, drawCard, test, finish };
}
