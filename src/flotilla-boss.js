// src/flotilla-boss.js (was src/admiral.js: ad blockers block any /admiral.js) - THE ADMIRAL, THE FLOTILLA's boss (claude/flotilla3, the OPUS greybox, 2026-10-25; scratch/brief-flotilla3-1018.md part C, folded with the
// APPROVED review scratch/review-flotilla-1018.md - Daniel 10-18 10:18 'all recs'). He replaces THE ADMIRAL'S CHAMPION in the Flotilla's boss slot; the Champion
// stays registered (src/admirals-champion.js) for THE UNDERWATER KEEP's mini slot (brief part B, with KEEP 2).
//
// WHO HE IS: a real PIRATE admiral - captain's coat, tricorn, cutlass and a BRACE OF PISTOLS - bolted into SALVAGED SHIP ARMOUR: three iron HULL PLATES riveted
//   over the coat (CHEST, BACK, PAULDRONS). He holds THE LASHINGS: the Powder Ship's stern lashed to his FLAGSHIP's waist, a gap of foul harbour between.
// THE LEVEL'S RULE IS HIS FIGHT (B1/B17): "STRIKE A BREECH AND THE GUN CLEARS ITS LINE. WHEN HIS FLAG RUNS RED, HIS GUNS CLEAR YOURS."
//   YOUR GUNS: strike a DECK GUN's breech while he stands in its line and the round shot BLOWS A PLATE OFF (a big crunch; the plate falls in the harbour) and
//     staggers him (OPEN). Each plate gone opens more of him; all three gone he is BARE (phase two). NO REFIT. His own POWDER KEG struck back at him does the same.
//   HIS GUNS: BROADSIDE CALL - he whistles, his flagship's gunports glow, the deck cells they are laid on are marked red, and the shot comes down on them.
// WHAT A BLOW DOES TO HIM (B10/B15; Daniel's option (a) for the armour - a NAMED, Daniel-approved departure from the 0.4x floor, the armour only):
//   ARMOURED (any plate on)  a blade CHIPS: AD.chip[plates left] (0.15 with all three, 0.25 with two, 0.35 with one) - LOUD SPARKS and the word IRON PLATE.
//                            Never nothing: you are never stuck. And while a plate is on he cannot be cut below AD.floor of his health (HIS PLATE HOLDS) - the
//                            guns are the way in (A4: one REQUIRED use before the end).
//   HIS OPENINGS             x1 while armoured, x AD.openMul bare - gold ring + timer: STAGGERED (a plate blown), RELOADING (after the brace of pistols), SOAKED / OFF
//                            HIS LINE (his grapnel line cut), THE AXE IN THE DECK (phase two), KNOCKED FLAT (a ball or a keg on him bare: capped, AD.flatCap).
//   BARE (phase two)         x1 outside his openings (a duelist: always hittable, B11).
//   THE WARD (B3)            after every blown plate / knockdown a told AD.wardT s grey ring: a ball glances off, a blade lands at the chip (or 0.4 bare).
// HIS MOVES (B17: seven told answers; B16: each its own windup + release pose - src/redraw/admiral_art.js; one windup at a time):
//   PHASE ONE - THE ARMOURED ADMIRAL:
//     THE CUTLASS       (! a shield turns it)        two cuts and a step; the recovery after is his
//     BRACE OF PISTOLS  (!! roll it / jump it)       he levels a pistol (the aim line drawn, then it locks): BANG; the second; then a SLOW RELOAD = AN OPENING
//     POWDER KEG        (!! jump it - or STRIKE IT)  he rolls a lit keg down the deck at you; strike it and it rolls back at him - on him it blows a plate
//     BROADSIDE CALL    (!! off the red cells)       the whistle; his gunports glow; the deck cells under you are marked; then the shot comes down on them
//     GRAPNEL SWING     (!! off the mark - or CUT IT) he hooks the flagship's main yard and swings over the lashing onto your hull (a told mark where he lands);
//                                                   CUT HIS LINE mid-swing (a blow on him or the line) and he drops - into the harbour if over it - and comes up OPEN
//   PHASE TWO (every plate gone) - BARE: he throws off the last iron and THE FLAGSHIP LISTS (one told, FIXED list toward the lashing: on her deck you slide to the
//     gap unless you walk against it; the Hurricane's ROLL stays the Hurricane's - review Q6). His new move:
//     THE BOARDING FLURRY (! a shield turns the cutlass) four quick cuts of cutlass and boarding axe, then THE AXE (!! step out): missed, it bites the deck - OPEN
//     (and the cutlass, the pistols, the keg, the broadside and the grapnel all stay: the guns still knock him FLAT, bare)
// PURE: no DOM, no main.js. The world is a context `c` (src/admiral-hands.js binds it). adPlan is the boss lab's HUMAN bot (src/lab.js).

/* (tune) THE PER-HERO TUNE: { in: x what his blows take off this hero, out: x what this hero's blows take off him }. Heroes not listed are 1 / 1. */
export const TUNE = { knight: { in: 1.25, out: 0.75 }, pyro: { in: 1.3, out: 0.85 }, warden: { in: 0.8, out: 1.15 }, pirate: { in: 1.1, out: 1.0 }, paladin: { in: 1.45, out: 0.42 }, reaper: { in: 1.1, out: 0.8 }, geomancer: { in: 0.85, out: 1.15 }, ranger: { in: 1.2, out: 0.9 }, berserker: { in: 1.3, out: 0.8 } };   /* (claude/flotilla4) re-tuned for the doubled openings + hp 5200 (r3 n=12: knight/paladin/berserker/reaper 12/12, warden 2/12) */
export const tuneOf = h => TUNE[h] || { in: 1, out: 1 };
export const AD = {
  hp: 4250, w: 22,   /* (claude/flotilla4) 3250 -> 4250 (+31%, the coordinator's cap: a LITTLE more health) with the openings doubled (3250: 98% wins, 77 s); the rest is pressure: AD.dmg x1.2 and the per-hero TUNE */
  h: 40, markH: 64,
  plates: 3, chip: [1, 0.35, 0.25, 0.15], floor: 0.5, openMul: 1.6, flatCap: 0.06, wardT: 3.0, gunHot: 13,
  /* (claude/flotilla4, Daniel 10-27: "too short" - both the cannonball opening and the interrupt-his-shot opening) HIS OPENINGS ~DOUBLED: were 1.9 / 1.8 / 2.1 / 1.5 / 2.0 s. If he gets
     too easy his health goes up a little - the windows are not shortened again (brief-flotilla4-1027 item 2) */
  staggerT: 3.8, reloadT: 3.6, soakedT: 4.0, axeT: 3.0, flatT: 3.6,
  walk: 46, keep: 44, turn: 0.45, gap: [0.6, 0.48],
  /* THE CUTLASS: told cutTell s, then cutNext s; each cut cutT s at cutReach px; a step cutStep px between; cutRec s after */
  cutTell: 0.58, cutNext: 0.4, cutT: 0.15, cutReach: 52, cutStep: 14, cutRec: 0.7,
  /* BRACE OF PISTOLS: told pistolTell s (the aim locks pistolLock s before the shot), the second pistol2Tell s; each shot shotV px/s; then the RELOAD */
  pistolTell: 0.85, pistol2Tell: 0.55, pistolLock: 0.25, shotV: 460, shotR: 6,
  /* POWDER KEG: told kegTell s; it rolls kegV px/s at you (back at him kegBackV), its fuse kegFuse s; the blast kegR px */
  kegTell: 0.75, kegV: 120, kegBackV: 230, kegFuse: 3.4, kegR: 40, kegRec: 0.6,
  /* BROADSIDE CALL: the whistle whistleTell s; the cells laneT s marked; cells cellW px wide; then the shot comes down for shotT s */
  whistleTell: 0.95, laneT: 1.5, cellW: 64, volleyT: 0.35, whistleRec: 0.55,
  /* GRAPNEL SWING: told grapTell s (the mark where he lands), swingT s on the line (swingH px over the deck at its middle), the landing landR px; landRec s after */
  grapTell: 0.85, swingT: 1.0, swingH: 34, landR: 30, landRec: 0.7, otherHull: 0.7, fallV: 260,
  /* PHASE TWO: the list told listTell s; on the flagship's deck a hero slides listV px/s toward the lashing; THE FLURRY: flurryTell s, flurryN cuts of flurryT s,
     flurryNext s apart, a step flurryStep px each; THE AXE: axeTell s over [axeNear, axeFar] px in front of him */
  listTell: 1.4, listV: 16, flurryTell: 0.7, flurryN: 4, flurryT: 0.13, flurryNext: 0.2, flurryStep: 16, flurryReach: 48, axeTell: 0.6, axeSwingT: 0.14, axeNear: 6, axeFar: 56, axeRec: 0.6,
  dmg: { cut: 49, pistol: 46, keg: 65, broadside: 65, land: 58, flurry: 30, axe: 74 },   /* (claude/flotilla4) x1.2 - more pressure between the long openings (were 41/38/54/54/48/25/62) */
};
/* EVERY CYCLE CHANGES: the order of each pass by phase (cycle k uses [k % n]) */
export const CYCLES = {
  1: [['cut', 'pistols', 'keg'], ['cut', 'whistle', 'pistols', 'cut'], ['keg', 'cut', 'grapnel', 'pistols'], ['whistle', 'cut', 'keg', 'pistols']],
  2: [['flurry', 'pistols', 'cut'], ['keg', 'flurry', 'whistle'], ['cut', 'flurry', 'grapnel', 'pistols'], ['whistle', 'flurry', 'keg']],
};
export const PHASE_NEW = { 1: ['cut', 'pistols', 'keg', 'whistle', 'grapnel'], 2: ['flurry'] };
/* THE MOVES: the mode while it is told, its mark, the answer (src/marks.js BY_HAND / ANSWER / HEIGHT keep the same rows) */
export const MOVES = {
  cutTell: { mark: '!', answer: 'block' }, pistolTell: { mark: '!!', answer: 'dodge' }, pistol2Tell: { mark: '!!', answer: 'dodge' }, kegTell: { mark: '!!', answer: 'jump' },
  whistleTell: { mark: '!!', answer: 'dodge' }, grapTell: { mark: '!!', answer: 'dodge' }, listTell: { mark: '', answer: '' }, flurryTell: { mark: '!', answer: 'block' }, axeTell: { mark: '!!', answer: 'dodge' },
};
export const MOVE_NAME = { cut: 'THE CUTLASS', pistol: 'BRACE OF PISTOLS', keg: 'THE POWDER KEG', broadside: 'BROADSIDE', land: 'THE GRAPNEL SWING', flurry: 'THE BOARDING FLURRY', axe: 'THE BOARDING AXE' };
/* each told move's word over him as it winds up (B5: sound + word + colour) */
export const MOVE_WORD = { pistolTell: 'PISTOL: ROLL IT', pistol2Tell: 'THE SECOND PISTOL', kegTell: 'POWDER KEG: JUMP IT OR STRIKE IT BACK', whistleTell: 'BROADSIDE! OFF THE RED',
  grapTell: 'GRAPNEL: OFF THE MARK, OR CUT HIS LINE', listTell: 'THE FLAGSHIP LISTS', flurryTell: 'BOARDERS!', axeTell: 'THE AXE: STEP OUT' };
export const PLATE_NAME = ['CHEST', 'BACK', 'PAULDRONS'];
export const PLATE_LINE = ['HIS CHEST PLATE IS OFF: CUT HIM', 'HIS BACK PLATE IS OFF: CUT HIM', 'HIS PAULDRONS ARE OFF: CUT HIM'];
/* EVERY LINE HE SAYS (src/hint-lines.js SAY_LINES lets them through number()) */
export const AD_SAY = { up: 'HE IS UP: HIS GUARD IS SET', glanceK: 'THE BLAST GLANCES OFF HIS GUARD', glance: 'THE BALL GLANCES OFF HIS GUARD: NOT YET', p0: PLATE_LINE[0], p1: PLATE_LINE[1], p2: PLATE_LINE[2],
  plates: 'EVERY PLATE OFF OPENS MORE OF HIM. NO REFIT', last: 'THE LAST PLATE IS OFF: HE IS BARE', flat: 'KNOCKED FLAT: CUT HIM NOW', bare: 'HE THROWS OFF THE LAST OF THE IRON. THE FLAGSHIP LISTS', reloaded: 'RELOADED',
  axeOut: 'HE WRENCHES THE AXE OUT', list: 'HER DECK LISTS TO THE LASHING: WALK UP IT', soaked: 'HE HAULS OUT OF THE HARBOUR SOAKED: CUT HIM', reload: 'HE RELOADS: GO IN', down: 'CUT OFF HIS LINE: HE IS DOWN',
  axe: 'THE AXE IS IN THE DECK: CUT HIM', cut: 'HIS LINE IS CUT', back: 'STRUCK BACK AT HIM', wet: 'THE KEG GOES IN THE HARBOUR', woke: 'THE ADMIRAL: THE FLAGSHIP IS HIS', rule: 'HIS IRON TURNS A BLADE. HIS OWN GUNS BLOW IT OFF',
  hauled: 'HAULED OUT OF THE HARBOUR', hot: 'HIS GUNS ARE HOT: THEY WILL NOT SPEAK AGAIN A WHILE', getting: 'HE IS GETTING UP', held: 'HIS IRON HOLDS: BLOW A PLATE OFF WITH A GUN' };

/* ---------- THE LASHINGS (the arena: the Champion's stage, kept) ----------
   local columns 0..W-1, the decks' surface row R (the hero stands on R-1): THE POWDER SHIP's stern (west hull, 0..g0-1), THE LASHING (g0..g1: foul harbour),
   THE FLAGSHIP's waist (east hull, g1+1..W-1); a DECK GUN at each hull's outer end laid along the deck toward the lashing - a round shot runs both decks. */
export const AD_STAGE = { W: 52, gap: [24, 26], guns: [3, 48], him: 40 };
export function geom(A, TS = 16) {
  const q = A.ac, X = c => (q.sx + c) * TS, S = AD_STAGE;
  return { TS, x0: X(0), x1: X(S.W), floorY: q.R * TS, gap: [X(S.gap[0]), X(S.gap[1] + 1)], gapMid: (X(S.gap[0]) + X(S.gap[1] + 1)) / 2,
    hulls: [[X(0), X(S.gap[0])], [X(S.gap[1] + 1), X(S.W)]], guns: S.guns.map((c, i) => ({ x: X(c) + 8, aim: i === 0 ? 1 : -1 })),
    yard: { x: (X(S.gap[0]) + X(S.gap[1] + 1)) / 2, y: q.R * TS - 150 }, cols: { sx: q.sx, g0: q.sx + S.gap[0], g1: q.sx + S.gap[1], R: q.R } };
}
export const hullOf = (G, x) => (x < G.gapMid ? 0 : 1);
export const inGap = (G, x) => x > G.gap[0] - 2 && x < G.gap[1] + 2;
export const footX = (G, x) => { const k = hullOf(G, x), [a, b] = G.hulls[k]; return Math.max(a + 18, Math.min(b - 18, x)); };
/* THE BROADSIDE'S CELLS: both decks cut into AD.cellW cells from each hull's outer end */
export function cellsOf(G) { const out = []; for (const [a, b] of G.hulls) { const n = Math.max(1, Math.round((b - a) / AD.cellW)), w = (b - a) / n; for (let i = 0; i < n; i++) out.push([a + i * w, a + (i + 1) * w]); } return out; }
export const cellAt = (cells, x) => cells.findIndex(([a, b]) => x >= a && x < b);

/* ---------- ONE FIGHT ---------- */
export function newFight(G) {
  return { G, ph: 1, plates: AD.plates, off: [], cycle: 0, step: 0, script: null, act: 0, ward: 0, taken: 0, behindT: 0, otherT: 0, cutsLeft: 0, told: {}, why: '',
    shots: [], keg: null, lanes: null, swing: null, fall: null, list: false, cells: cellsOf(G), floorHeld: 0,
    n: { cycles: 0, plates: 0, platesByGun: 0, platesByKeg: 0, flats: 0, wards: 0, chipped: 0, warded: 0, held: 0, landed: 0, glanced: 0, cuts: 0, shots: 0, shotHits: 0, reloads: 0,
      kegs: 0, kegBack: 0, kegOnHim: 0, kegBlasts: 0, kegHits: 0, volleys: 0, volleyHits: 0, swings: 0, lineCut: 0, landHits: 0, flurries: 0, axes: 0, axeStuck: 0, axeHits: 0, slid: 0, hauled: 0, moves: {} } };
}
export const OPEN_MODES = new Set(['stagger', 'reload', 'soaked', 'axeStuck', 'flat']);
export const adOpen = e => !!e && OPEN_MODES.has(e.mode) && (e.open || 0) > 0;
export const adFlat = e => !!e && e.mode === 'flat' && (e.open || 0) > 0;
const STRIKE = new Set(['cut', 'flurry', 'axe', 'swing']);
const COMMITTED = new Set(['cutRec', 'kegRec', 'whistleRec', 'landRec', 'axeRec', 'flurryRec', 'listTell']);
export const committed = e => !!e && COMMITTED.has(e.mode);
export const airborne = e => !!e && (e.mode === 'swing' || e.mode === 'fall');
export const armoured = S => !!S && S.plates > 0;

/* WHAT A BLOW TAKES OFF HIM: { k, word }. Never nothing (B15; the armour chip is Daniel's named exception) */
export function takeAt(e, S) {
  if (!e || e.mode === 'sleep' || e.mode === 'wake' || e.mode === 'climb') return { k: e && e.mode === 'climb' ? AD.chip[Math.max(1, S.plates)] : 0, word: e && e.mode === 'climb' ? 'IN THE HARBOUR' : '' };
  const arm = S.plates > 0;
  if (adOpen(e)) return { k: arm ? 1 : AD.openMul, word: '' };
  if (S.ward > 0) return { k: arm ? AD.chip[S.plates] : 0.4, word: 'WARDED' };
  if (arm) return { k: AD.chip[S.plates], word: 'IRON PLATE' };
  return { k: 1, word: '' };
}

const nextScript = S => { const set = CYCLES[S.ph]; return set[S.cycle % set.length].slice(); };
function setMode(e, m, t) { e.mode = m; e.modeT = t; }
const clampDeck = (G, k, x) => { const [a, b] = G.hulls[k]; return Math.max(a + 14, Math.min(b - 14, x)); };
function tell(e, S, c, mode, t) { setMode(e, mode, Math.max(0.5, t)); S.act++; S.n.moves[mode] = (S.n.moves[mode] || 0) + 1; const mv = MOVES[mode]; if (mv && mv.mark) c.mark(mv.mark);
  c.sound(mode === 'whistleTell' ? 'whistle' : mv && mv.mark === '!!' ? 'tellHard' : 'tell'); if (MOVE_WORD[mode]) c.word(e, MOVE_WORD[mode], mode); }
function open(e, S, c, mode, t, line, col = '#8fd160') { setMode(e, mode, t + 0.05); e.open = t; S.taken = 0; S.cutsLeft = 0; if (line) c.number(e.x, e.y - 76, line, col); c.sound('open'); }
function endOpen(e, S, c) { e.open = 0; S.ward = AD.wardT; S.n.wards++; S.taken = 0; c.number(e.x, e.y - 76, AD_SAY.up, '#9ab0c0'); c.sound('tell'); c.fx('ward', e.x, e.y); }

/* ---------- THE RULE ON HIM (the hands call it) ----------
   A ROUND SHOT met him (src/main.js updateBalls), or his own KEG blew on him. On his line or falling it passes under him; in his ward it glances off; otherwise A PLATE
   GOES (staggered, OPEN) - or, bare, HE GOES DOWN (knocked flat). Returns 'plate' | 'flat' | 'ward' | 'air' | 'busy' */
export function blowPlate(e, S, c, by = 'gun', dir = 0) {
  if (!e || !e.alive || e.mode === 'sleep' || e.mode === 'wake' || e.mode === 'dead') return 'busy';
  if (airborne(e) || e.mode === 'climb') return 'air';
  if (adFlat(e) || e.mode === 'stagger') return 'busy';
  if (S.ward > 0) { S.n.glanced++; c.number(e.x, e.y - 66, by === 'keg' ? AD_SAY.glanceK : AD_SAY.glance, '#9ab0c0'); c.sound('clank'); return 'ward'; }
  S.shots = S.shots.filter(q => !q.his); S.swing = null; S.cutsLeft = 0; S.lanes = S.lanes && S.lanes.t > 0 ? S.lanes : null;
  if (S.plates > 0) {
    /* WHICH PLATE: a shot from in front of him takes the CHEST, from behind the BACK, a keg (or the third) the PAULDRONS */
    const front = dir !== 0 && Math.sign(dir) === -(e.face || 1), want = by === 'keg' ? 2 : front ? 0 : 1;
    const left = [0, 1, 2].filter(i => !S.off.includes(i)), which = left.includes(want) ? want : left[0];
    S.off.push(which); S.plates--; S.n.plates++; S.n[by === 'keg' ? 'platesByKeg' : 'platesByGun']++; S.floorHeld = 0;
    c.fx('plate', e.x, e.y, which); c.sound('crunch'); c.shake(8);
    if (S.plates > 0) { open(e, S, c, 'stagger', AD.staggerT, PLATE_LINE[which], '#8fd160');
      if (!S.told.plate) { S.told.plate = 1; c.number((S.G.x0 + S.G.x1) / 2, S.G.floorY - 136, AD_SAY.plates, '#ffd36b'); } }
    else { open(e, S, c, 'stagger', AD.staggerT, AD_SAY.last, '#ffd36b'); S.bareNext = true; }
    return 'plate'; }
  setMode(e, 'flat', AD.flatT + 0.05); e.open = AD.flatT; S.taken = 0; S.n.flats++;
  c.fx('flat', e.x, e.y); c.sound('flat'); c.shake(7); c.number(e.x, e.y - 76, AD_SAY.flat, '#8fd160');
  return 'flat';
}

/* ---------- ONE FRAME. h = the heroes [{ x, y, ground, alive, dodge, holding, pp }], c = the world:
   c.hit(box, dmg, name, o) -> landed   c.slide(pp, dx)   c.number(x, y, line, col)   c.word(e, line, mode)   c.mark(m)   c.sound(k)   c.fx(kind, x, y, k)
   c.shake(n)   c.music(ph)   c.list(on) ---------- */
export function stepAdmiral(e, S, dt, h, c) {
  const G = S.G, P = h.filter(q => q.alive).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || h[0];
  e.modeT -= dt; if (!airborne(e) && e.mode !== 'climb') e.y = G.floorY;
  if (e.open > 0) e.open = Math.max(0, e.open - dt);
  if (S.ward > 0) S.ward = Math.max(0, S.ward - dt); e.ward = S.ward; e.plates = S.plates;
  stepShots(e, S, dt, h, c); stepKeg(e, S, dt, h, c); stepLanes(e, S, dt, h, c); stepList(e, S, dt, h, c);
  if (e.mode === 'sleep') return;
  if (e.mode === 'wake') { if (e.modeT <= 0) { S.script = nextScript(S); S.step = 0; setMode(e, 'walk', 0.6); } return; }
  if (P && hullOf(G, P.x) !== hullOf(G, e.x) && P.y > G.floorY - 60 && !inGap(G, P.x)) S.otherT += dt; else S.otherT = 0;
  /* THE PHASE: the last plate's stagger runs out first, then he throws the iron off and the flagship lists */
  if (S.ph === 1 && S.plates <= 0 && !adOpen(e) && (e.mode === 'walk' || e.mode === 'recover')) {
    S.ph = 2; S.cycle = 0; S.step = 0; S.script = null; e.phase = 2; c.music(2); S.bareNext = false;
    c.number((G.x0 + G.x1) / 2, G.floorY - 146, AD_SAY.bare, '#ff9a5c'); tell(e, S, c, 'listTell', AD.listTell); return; }
  switch (e.mode) {
    case 'stagger': case 'reload': case 'soaked': case 'axeStuck': case 'flat':
      if (e.open <= 0) { if (e.mode === 'reload') { c.number(e.x, e.y - 66, AD_SAY.reloaded, '#9aa39a'); setMode(e, 'recover', 0.35); }
        else if (e.mode === 'axeStuck') { c.number(e.x, e.y - 66, AD_SAY.axeOut, '#9aa39a'); setMode(e, 'recover', 0.4); }
        else { endOpen(e, S, c); setMode(e, 'recover', 0.45); } } return;   /* B4: open, he stands (or lies) where he is */
    case 'listTell': if (e.modeT <= 0) { S.list = true; c.list(true); c.fx('list', e.x, e.y); c.sound('creak'); c.shake(6);
      if (!S.told.list) { S.told.list = 1; c.number((G.x0 + G.x1) / 2, G.floorY - 136, AD_SAY.list, '#ffd36b'); } setMode(e, 'recover', 0.5); } return;
    case 'climb': if (e.modeT <= 0) { e.y = G.floorY; e.x = S.climbTo; open(e, S, c, 'soaked', AD.soakedT, AD_SAY.soaked, '#8fd160'); } else e.y = G.floorY + 20 * Math.max(0, e.modeT); return;
    case 'recover': if (e.modeT <= 0) nextMove(e, S, P, c); return;
    case 'walk': {
      const d = P.x - e.x;
      if ((e.face || 1) * d < -8) { S.behindT += dt; if (S.behindT > AD.turn) { e.face = Math.sign(d) || e.face; S.behindT = 0; } } else S.behindT = 0;
      const k = hullOf(G, e.x);
      if (hullOf(G, P.x) === k) { if (Math.abs(d) > AD.keep) e.x = clampDeck(G, k, e.x + Math.sign(d) * AD.walk * dt); else if (Math.abs(d) < AD.keep - 20) e.x = clampDeck(G, k, e.x - Math.sign(d) * AD.walk * 0.5 * dt); }
      if (e.modeT <= 0) nextMove(e, S, P, c); return; }
  }
  stepMove(e, S, dt, P, h, c);
}
function nextMove(e, S, P, c) {
  if (!S.script || S.step >= S.script.length) { S.cycle++; S.n.cycles++; S.script = nextScript(S); S.step = 0; }
  const G = S.G; let m = S.script[S.step++];
  const dx = P.x - e.x, ad = Math.abs(dx), same = hullOf(G, P.x) === hullOf(G, e.x); e.face = Math.sign(dx) || e.face;
  if (S.otherT > AD.otherHull && P.ground) { m = 'grapnel'; S.step--; }   /* across the lashing: he swings over after you */
  if (m === 'grapnel' && same) m = ad > 150 ? 'pistols' : S.ph === 1 ? 'cut' : 'flurry';   /* (a swing onto the deck he stands on is not a swing) */
  if ((m === 'keg' || m === 'whistle' || m === 'pistols') && S.keg) m = S.ph === 1 ? 'cut' : 'flurry';   /* one keg on the deck at a time */
  if (m === 'whistle' && S.lanes) m = 'pistols';
  const reach = { cut: AD.cutReach + 30, flurry: AD.flurryReach + 40 };
  if (reach[m] && (ad > reach[m] || !same)) { if (!same) m = 'pistols'; else { setMode(e, 'walk', 0.5); S.step--; return; } }
  switch (m) {
    case 'cut': S.cutsLeft = 2; tell(e, S, c, 'cutTell', AD.cutTell); return;
    case 'pistols': S.pistol = 1; S.aimY = P.y - 14; tell(e, S, c, 'pistolTell', AD.pistolTell); return;
    case 'keg': tell(e, S, c, 'kegTell', AD.kegTell); return;
    case 'whistle': tell(e, S, c, 'whistleTell', AD.whistleTell); S.n.volleys++; layLanes(e, S, P); return;
    case 'grapnel': { const to = footX(G, P.x); tell(e, S, c, 'grapTell', AD.grapTell); S.swing = { x0: e.x, x1: to, t: 0, cut: false }; e.face = Math.sign(to - e.x) || e.face; return; }
    case 'flurry': S.cutsLeft = AD.flurryN; S.n.flurries++; tell(e, S, c, 'flurryTell', AD.flurryTell); return;
  }
  setMode(e, 'walk', 0.5);
}
/* THE BROADSIDE'S CELLS: every other cell from the one you stand in; his own cell his gunners lay round */
function layLanes(e, S, P) { const ci = cellAt(S.cells, P.x), par = ci >= 0 ? ci % 2 : 0, mine = cellAt(S.cells, e.x);
  const hit = S.cells.map((_, i) => i % 2 === par && i !== mine); S.lanes = { hit, t: AD.whistleTell + AD.laneT, fired: false, key: 'volley' + S.act }; }
/* THE TOLD BLOWS */
function stepMove(e, S, dt, P, h, c) {
  const G = S.G, f = e.face || 1, after = t => setMode(e, 'recover', t ?? AD.gap[S.ph - 1]), k = hullOf(G, e.x);
  switch (e.mode) {
    case 'cutTell': if (e.modeT <= 0) { setMode(e, 'cut', AD.cutT); S.n.cuts++; c.sound('slash'); } return;
    case 'cut': c.hit([f > 0 ? e.x - 6 : e.x - AD.cutReach, f > 0 ? e.x + AD.cutReach : e.x + 6, e.y - 38, e.y], AD.dmg.cut, MOVE_NAME.cut, { blockable: true, key: 'cut' + S.act + '.' + S.cutsLeft });
      if (e.modeT <= 0) { S.cutsLeft--; if (S.cutsLeft > 0) { e.x = clampDeck(G, k, e.x + f * AD.cutStep); e.face = Math.sign(P.x - e.x) || f; setMode(e, 'cutTell', AD.cutNext); c.mark('!'); c.sound('tell'); } else setMode(e, 'cutRec', AD.cutRec); } return;
    case 'cutRec': if (e.modeT <= 0) after(); return;
    /* BRACE OF PISTOLS: the aim follows you until it locks, then the shot */
    case 'pistolTell': case 'pistol2Tell': if (e.modeT > AD.pistolLock) { S.aimY = Math.max(G.floorY - 34, Math.min(G.floorY - 6, P.y - 14)); e.face = Math.sign(P.x - e.x) || f; }
      if (e.modeT <= 0) { S.shots.push({ x: e.x + (e.face || 1) * 16, y: S.aimY, vx: (e.face || 1) * AD.shotV, t: 0, his: true, key: 'shot' + S.act + '.' + S.pistol }); S.n.shots++; c.sound('pistol'); c.fx('muzzle', e.x + (e.face || 1) * 16, S.aimY);
        if (S.pistol === 1) { S.pistol = 2; tell(e, S, c, 'pistol2Tell', AD.pistol2Tell); }
        else { S.n.reloads++; open(e, S, c, 'reload', AD.reloadT, AD_SAY.reload, '#8fd160'); } } return;
    case 'kegTell': if (e.modeT <= 0) { const dir = Math.sign(P.x - e.x) || f; S.keg = { x: e.x + dir * 18, y: G.floorY, vx: dir * AD.kegV, fuse: AD.kegFuse, back: false, key: 'keg' + S.act, hull: k }; S.n.kegs++; c.sound('fuse'); setMode(e, 'kegRec', AD.kegRec); } return;
    case 'kegRec': if (e.modeT <= 0) after(); return;
    case 'whistleTell': if (e.modeT <= 0) { setMode(e, 'whistleRec', AD.laneT + AD.whistleRec); c.sound('gunports'); } return;
    case 'whistleRec': if (e.modeT <= 0) after(); return;
    case 'grapTell': if (S.swing) e.face = Math.sign(S.swing.x1 - e.x) || f; if (e.modeT <= 0) { setMode(e, 'swing', AD.swingT + 0.05); S.n.swings++; c.sound('swing'); S.otherT = 0; } return;
    case 'swing': { const W = S.swing; if (!W) { after(); return; } W.t += dt; const u = Math.min(1, W.t / AD.swingT);
      e.x = W.x0 + (W.x1 - W.x0) * u; e.y = G.floorY - AD.swingH * Math.sin(Math.PI * u) - 6 * Math.sin(Math.PI * u * 2) * 0;
      if (u >= 1) { e.y = G.floorY; e.x = W.x1; c.shake(6); c.fx('land', e.x, e.y); c.sound('land');
        if (c.hit([e.x - AD.landR, e.x + AD.landR, G.floorY - 14, G.floorY + 2], AD.dmg.land, MOVE_NAME.land, { key: 'land' + S.act, ground: true })) S.n.landHits++;
        S.swing = null; e.face = Math.sign(P.x - e.x) || f; setMode(e, 'landRec', AD.landRec); } return; }
    case 'fall': { S.fallVy = (S.fallVy || 0) + 900 * dt; e.y = Math.min(G.floorY + 40, e.y + S.fallVy * dt);
      const wet = inGap(G, e.x);
      if (!wet && e.y >= G.floorY) { e.y = G.floorY; c.fx('land', e.x, e.y); c.sound('land'); c.shake(5); open(e, S, c, 'soaked', AD.soakedT, AD_SAY.down, '#8fd160'); }
      else if (wet && e.y >= G.floorY + 30) { c.fx('splash', e.x, G.floorY + 8); c.sound('splash'); S.climbTo = e.x < G.gapMid ? G.gap[0] - 16 : G.gap[1] + 16; setMode(e, 'climb', 1.0); } return; }
    case 'landRec': if (e.modeT <= 0) after(); return;
    case 'flurryTell': if (e.modeT <= 0) { setMode(e, 'flurry', AD.flurryT); c.sound('slash'); } return;
    case 'flurry': c.hit([f > 0 ? e.x - 6 : e.x - AD.flurryReach, f > 0 ? e.x + AD.flurryReach : e.x + 6, e.y - 38, e.y], AD.dmg.flurry, MOVE_NAME.flurry, { blockable: true, key: 'fl' + S.act + '.' + S.cutsLeft });
      if (e.modeT <= 0) { S.cutsLeft--; if (S.cutsLeft > 0) { e.x = clampDeck(G, k, e.x + f * AD.flurryStep); e.face = Math.sign(P.x - e.x) || f; setMode(e, 'flurryGap', AD.flurryNext); } else { S.n.axes++; tell(e, S, c, 'axeTell', AD.axeTell); S.axeX = e.x + f * (AD.axeNear + AD.axeFar) / 2; } } return;
    case 'flurryGap': if (e.modeT <= 0) { setMode(e, 'flurry', AD.flurryT); c.sound('slash'); } return;
    case 'axeTell': if (e.modeT <= 0) { setMode(e, 'axe', AD.axeSwingT); c.sound('slam'); S.axeHit = false; } return;
    case 'axe': { const a = e.x + f * AD.axeNear, b = e.x + f * AD.axeFar;
      if (c.hit([Math.min(a, b), Math.max(a, b), e.y - 44, e.y], AD.dmg.axe, MOVE_NAME.axe, { key: 'axe' + S.act })) { S.axeHit = true; S.n.axeHits++; }
      if (e.modeT <= 0) { c.shake(5); c.fx('splinter', S.axeX, G.floorY);
        if (S.axeHit) setMode(e, 'axeRec', AD.axeRec); else { S.n.axeStuck++; open(e, S, c, 'axeStuck', AD.axeT, AD_SAY.axe); } } return; }
    case 'axeRec': if (e.modeT <= 0) after(); return;
    case 'flurryRec': if (e.modeT <= 0) after(); return;
    default: setMode(e, 'walk', 0.5);
  }
}
/* CUT HIS LINE (a blow on him, or on the line, while he swings): he drops - into the harbour if he is over it */
export function cutLine(e, S, c) { if (!e || e.mode !== 'swing' || !S.swing || S.swing.cut) return false;
  S.swing.cut = true; S.swing = null; S.n.lineCut++; S.fallVy = -40; setMode(e, 'fall', 3); c.sound('snap'); c.fx('snap', e.x, e.y - 30);
  c.number(e.x, e.y - 60, AD_SAY.cut, '#8fd160'); return true; }
/* the line's two ends while he swings (drawn; the hands test a blow on it) */
export const lineOf = (e, S) => (e && e.mode === 'swing' && S.swing ? [S.G.yard.x, S.G.yard.y, e.x, e.y - 30] : null);
/* HIS PISTOL SHOT in flight: it runs flat at the height the aim locked at; a hero it meets (not rolling) is hit; it stops at the arena's edge */
function stepShots(e, S, dt, h, c) {
  for (const s of S.shots) { s.t += dt; const x0 = s.x; s.x += s.vx * dt;
    for (const q of h) { if (!q.alive || q.dodge) continue; if (q.x + 7 < Math.min(x0, s.x) || q.x - 7 > Math.max(x0, s.x)) continue; if (s.y < q.y - 26 || s.y > q.y + 1) continue;
      if (c.hit([q.x - 2, q.x + 2, q.y - 24, q.y], AD.dmg.pistol, MOVE_NAME.pistol, { key: s.key })) { S.n.shotHits++; s.dead = true; } }
    if (s.x < S.G.x0 - 20 || s.x > S.G.x1 + 20 || s.t > 2) s.dead = true; }
  S.shots = S.shots.filter(s => !s.dead);
}
/* HIS KEG: it rolls down the deck at you; struck, it rolls back at him; it stops at the deck's end or falls in the lashing; the fuse decides */
export function kegStruck(S, dir, c) { const K = S.keg; if (!K || K.back) return false; K.back = true; K.vx = dir * AD.kegBackV; S.n.kegBack++; c.number(K.x, K.y - 26, AD_SAY.back, '#8fd160'); c.sound('clank'); return true; }
function stepKeg(e, S, dt, h, c) {
  const K = S.keg; if (!K) return; const G = S.G; K.fuse -= dt;
  if (!K.wet) { const nx = K.x + K.vx * dt; if (inGap(G, nx) && !inGap(G, K.x)) { K.wet = true; K.x = nx; c.fx('splash', K.x, G.floorY + 8); c.sound('splash'); c.number(K.x, G.floorY - 20, AD_SAY.wet, '#bfe6f5'); }
    else { K.x = Math.max(G.x0 + 6, Math.min(G.x1 - 6, nx)); if (K.x <= G.x0 + 6 || K.x >= G.x1 - 6) K.vx = 0; } }
  if (K.wet) { if (K.fuse < AD.kegFuse - 0.6 || K.fuse <= 0) S.keg = null; return; }
  /* back at him: it meets him on the deck - IT BLOWS ON HIM */
  if (K.back && e.alive && !airborne(e) && Math.abs(K.x - e.x) < 16 + AD.w / 2) { S.keg = null; S.n.kegOnHim++; c.fx('blast', K.x, G.floorY); c.sound('boom'); c.shake(9); blowPlate(e, S, c, 'keg', K.vx); return; }
  if (K.fuse <= 0) { S.keg = null; S.n.kegBlasts++; c.fx('blast', K.x, G.floorY); c.sound('boom'); c.shake(8);
    if (c.hit([K.x - AD.kegR, K.x + AD.kegR, G.floorY - 40, G.floorY + 2], AD.dmg.keg, MOVE_NAME.keg, { key: K.key })) S.n.kegHits++;
    if (e.alive && !airborne(e) && Math.abs(K.x - e.x) < AD.kegR) blowPlate(e, S, c, 'keg', K.vx); }
}
/* THE BROADSIDE: the marked cells, then the shot comes down on them (a hero on a marked cell, on the deck or just over it, is hit) */
function stepLanes(e, S, dt, h, c) {
  const L = S.lanes; if (!L) return; L.t -= dt;
  if (!L.fired && L.t <= AD.volleyT) { L.fired = true; c.sound('broadside'); c.shake(6); for (let i = 0; i < S.cells.length; i++) if (L.hit[i]) c.fx('volley', (S.cells[i][0] + S.cells[i][1]) / 2, S.G.floorY); }
  if (L.fired) for (let i = 0; i < S.cells.length; i++) { if (!L.hit[i]) continue; const [a, b] = S.cells[i];
    if (c.hit([a + 2, b - 2, S.G.floorY - 46, S.G.floorY + 2], AD.dmg.broadside, MOVE_NAME.broadside, { key: L.key, shove: true })) S.n.volleyHits++; }
  if (L.t <= 0) S.lanes = null;
}
/* THE LIST (phase two): a hero on the flagship's deck slides toward the lashing (walking against it holds; a line held, or the air, is not on the deck) */
function stepList(e, S, dt, h, c) {
  if (!S.list) return; const [a, b] = S.G.hulls[1];
  for (const q of h) { if (!q.alive || !q.ground || q.holding || q.x < a || q.x > b || Math.abs(q.y - S.G.floorY) > 4) continue; c.slide(q.pp, -AD.listV * dt); S.n.slid += AD.listV * dt; }
}
export function landed(e, S) { S.n.landed++; }
/* HIS PLATE HOLDS: armoured, no blow takes him under AD.floor of his health (the hands clamp it) */
export const floorHp = (e, S) => (S && S.plates > 0 ? e.maxHp * AD.floor : 0);

/* ---------- THE BOT'S READING (src/lab.js) ----------
   A HUMAN BOT: it sees a tell PLAN.react s late and misreads some. It blocks or backs off the cutlass and the flurry; rolls (or jumps) the pistol shots in their last
   beat and goes in on the reload; jumps his keg - or, facing it near, STRIKES IT BACK; moves off the red cells; moves off the grapnel's mark - or, at the lashing's edge,
   cuts his line as he comes; steps out of the axe and cuts it stuck; walks up the listing deck. THE RULE: a cool deck gun with him in its line - to the breech and
   strike it; open, it cuts him; warded, it waits off him. Armoured it chips now and then (a human does).
   s = { P: { x, y, face, ground, atk }, e, S, reach, shield, t, rng, mem, v2, hero, rest, noRoll, guns: [{ x, y, cool, aim }] } -> { gx, face, atk, jump, dodge, block, down, why } */
export const PLAN = { react: 0.25, miss: 0.12, gunSeen: 0.45, chip: 0.35, kite: 104, knife: 18, kegHit: 0.55, cutLine: 0.45 };
export function adPlan(s) { const o = adPlan0(s); if (s.S) s.S.botWhy = o.why; return o; }
function adPlan0(s) {
  const { P, e, S } = s, G = S.G, reach = s.hero === 'ranger' && (adOpen(e) || committed(e)) ? PLAN.knife : s.reach,
    out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, down: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = s.v2 ? 0 : PLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const myHull = hullOf(G, P.x), [ha, hb] = G.hulls[myHull], clamp = x => Math.max(ha + 10, Math.min(hb - 10, x));
  const kx = e.x, side = Math.sign(P.x - kx) || 1, dx = Math.abs(kx - P.x), same = Math.abs(P.y - G.floorY) < 30 && hullOf(G, kx) === myHull && !airborne(e), hitR = reach + AD.w / 2 - 2;
  const swing = fx => { out.face = Math.sign(fx - P.x) || out.face; out.atk = P.atk < 0; };
  const away = d => clamp(kx + side * d);
  /* 0. IN THE WATER / ON A NET: back up onto a deck */
  if (P.y > G.floorY + 8) { out.gx = myHull === 0 ? G.gap[0] - 6 : G.gap[1] + 6; out.why = 'out of the harbour'; return out; }
  /* 0b. THE BROADSIDE: off the red cells (to the nearest cell that is not marked) */
  if (S.lanes && !S.lanes.fired) { const ci = cellAt(S.cells, P.x);
    if (ci >= 0 && S.lanes.hit[ci] && seenFor('v' + S.lanes.key)) { let best = null; for (let i = 0; i < S.cells.length; i++) { if (S.lanes.hit[i]) continue; const [a, b] = S.cells[i]; if (hullOf(G, (a + b) / 2) !== myHull) continue; const mx = (a + b) / 2, d = Math.abs(mx - P.x); if (!best || d < best.d) best = { d, x: mx }; }
      if (best) { out.gx = clamp(best.x); out.why = 'off the red cells'; return out; } }
    if (ci >= 0 && !S.lanes.hit[ci]) { const [a, b] = S.cells[ci]; out.gx = Math.max(a + 10, Math.min(b - 10, P.x)); out.face = Math.sign(kx - P.x) || 1; out.why = 'wait out the broadside'; if (adOpen(e) && same && dx < hitR) swing(kx); return out; } }
  /* 0c. THE KEG: strike it back when it comes to you and you face it; else jump it, or get off its blast */
  if (S.keg && !S.keg.wet) { const K = S.keg, kd = Math.abs(K.x - P.x), coming = !K.back && Math.sign(P.x - K.x) === Math.sign(K.vx || 1);
    if (!K.back && hullOf(G, K.x) === myHull && seenFor('k' + K.key)) {
      if (coming && kd < reach + 14 && roll('kh' + K.key, PLAN.kegHit) && P.ground) { out.face = Math.sign(K.x - P.x) || 1; out.gx = P.x; out.atk = P.atk < 0; if (s.hero === 'ranger') out.down = true; out.why = 'strike the keg back at him'; return out; }
      if (coming && kd < 40 && P.ground && K.vx) { out.jump = true; out.gx = P.x; out.why = 'jump the keg'; return out; }
      if (K.fuse < 0.9 && kd < AD.kegR + 24) { out.gx = clamp(K.x + (Math.sign(P.x - K.x) || 1) * (AD.kegR + 40)); out.why = 'off the keg\'s blast'; return out; } }
    if (K.back) { if (K.fuse < 0.9 && kd < AD.kegR + 24) { out.gx = clamp(K.x + (Math.sign(P.x - K.x) || 1) * (AD.kegR + 40)); out.why = 'off the keg\'s blast'; return out; } } }
  /* 1. HIS BLOWS (a quarter-second late, some misread) */
  if (/Tell$/.test(e.mode) || STRIKE.has(e.mode)) {
    const miss = s.v2 ? false : roll('m' + S.act + e.mode, PLAN.miss), seen = seenFor('a' + S.act + e.mode);
    if (seen && !miss) {
      if ((e.mode === 'grapTell' || e.mode === 'swing') && S.swing) { const d = Math.abs(P.x - S.swing.x1), nearEdge = Math.abs(P.x - (myHull === 0 ? G.gap[0] : G.gap[1])) < 60;
        if (e.mode === 'swing' && nearEdge && Math.abs(e.x - P.x) < reach + 30 && roll('cl' + S.act, PLAN.cutLine)) { out.face = Math.sign(e.x - P.x) || 1; out.gx = P.x; out.jump = P.ground && e.y < G.floorY - 16; out.atk = P.atk < 0; out.why = 'cut his line'; return out; }
        if (d < AD.landR + 24) { const to = clamp(S.swing.x1 + (Math.sign(P.x - S.swing.x1) || 1) * (AD.landR + 40)); out.gx = Math.abs(to - S.swing.x1) < AD.landR + 10 ? clamp(S.swing.x1 - (Math.sign(P.x - S.swing.x1) || 1) * (AD.landR + 40)) : to; out.why = 'off the grapnel\'s mark'; if (s.hero === 'ranger' && P.ground) out.dodge = true; return out; }
        out.gx = P.x; out.face = Math.sign(S.swing.x1 - P.x) || 1; out.why = 'wait for him to land'; return out; }
      if ((e.mode === 'pistolTell' || e.mode === 'pistol2Tell') && Math.sign(P.x - kx) === (e.face || 1)) {
        if (e.modeT < 0.13 && P.ground) { if (s.noRoll || rng() < 0.35) { out.jump = true; out.gx = P.x; out.why = 'jump the shot'; } else { out.dodge = true; out.gx = clamp(P.x - side * 30); out.why = 'roll the shot'; } return out; }
        out.gx = same && dx < 90 ? P.x : clamp(kx + side * Math.max(hitR + 20, Math.min(dx, 120))); out.face = Math.sign(kx - P.x) || 1; out.why = 'watch the pistol'; return out; }
      if ((e.mode === 'axeTell' || e.mode === 'axe') && same) {
        const inBox = Math.sign(P.x - kx) === (e.face || 1) && dx < AD.axeFar + 16; if (inBox) { out.gx = dx < 30 ? clamp(kx - (e.face || 1) * 30) : away(AD.axeFar + 30); out.why = 'out from under the axe'; return out; }
        out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; out.why = 'let the axe fall'; return out; }
      if ((e.mode === 'cutTell' || e.mode === 'cut' || e.mode === 'flurryTell' || e.mode === 'flurry') && dx < AD.cutReach + 24 && same) {
        if (s.hero === 'ranger' && P.ground) { out.dodge = true; out.gx = away(AD.cutReach + 60); if (Math.abs(out.gx - kx) < dx + 20) out.gx = clamp(kx - side * 50); out.face = Math.sign(kx - P.x) || 1; out.why = 'backflip the cut'; return out; }
        if (s.shield) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the cut'; return out; }
        out.gx = away(AD.cutReach + 34); out.why = 'back off the cut'; return out; }
      if (e.mode === 'flurryGap' && same && dx < AD.flurryReach + 24) { if (s.shield) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the flurry'; return out; } out.gx = away(AD.flurryReach + 40); out.why = 'back off the flurry'; return out; }
      if (e.mode === 'kegTell') { out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; out.why = 'watch the keg'; return out; }
    }
  }
  if (e.mode === 'flurryGap' && same && dx < AD.flurryReach + 24) { if (s.shield) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the flurry'; return out; } out.gx = away(AD.flurryReach + 40); out.why = 'back off the flurry'; return out; }
  /* 2. OPEN: cut him; WARDED: off him */
  if (adOpen(e) || e.mode === 'climb') { const tx = e.mode === 'climb' ? (S.climbTo || kx) : kx; if (hullOf(G, tx) !== myHull) { out.gx = P.x; out.why = 'he is open on the other hull'; return out; }
    out.gx = clamp(tx + side * Math.min(hitR - 6, 16)); if (Math.abs(tx - P.x) < hitR + 4) swing(tx); out.why = 'cut him: he is open (' + e.mode + ')'; return out; }
  if (S.ward > 0) { out.gx = away(80); out.face = Math.sign(kx - P.x) || 1; out.why = 'his ward: wait'; return out; }
  /* 3. THE RULE: a cool gun, him in its line - to the breech and strike it */
  const guns = (s.guns || []).filter(g => !(g.cool > 0) && Math.sign(kx - g.x) === g.aim && Math.abs(kx - g.x) < 760 && hullOf(G, g.x) === myHull);
  if (guns.length && !airborne(e) && seenFor('gun' + guns[0].x + '.' + Math.floor(t / 6), PLAN.gunSeen)) { const g = guns.sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
    const at = g.x - g.aim * 14;
    if (Math.abs(P.x - at) < 10 && P.ground) { out.face = g.aim; out.gx = P.x; out.atk = P.atk < 0; if (s.hero === 'ranger') out.down = true; out.why = 'fire the gun down his line'; return out; }
    if (Math.abs(P.x - g.x) < Math.abs(kx - g.x) + 40 || !same) { out.gx = at; out.why = 'to the gun: he is in its line'; return out; } }
  /* 4. WINDED: off him */
  if (s.rest) { out.gx = away(AD.cutReach + 40); out.face = Math.sign(kx - P.x) || 1; out.why = 'winded: off him'; return out; }
  if (airborne(e)) { out.gx = P.x; out.why = 'he is in the air'; return out; }
  /* 5. THE DUEL: in on his recovery; armoured, chip now and then; bare, cut him */
  const kite = s.hero === 'ranger' && !committed(e);
  if (kite && same && dx < PLAN.kite + 30 && Math.abs(away(PLAN.kite + 14) - kx) > dx + 20) { out.face = Math.sign(kx - P.x) || 1; out.gx = dx < PLAN.kite ? away(PLAN.kite + 14) : P.x; out.atk = P.atk < 0 && dx > 60; out.why = 'kite: shoot from off his reach'; return out; }
  if (!same) { out.gx = hullOf(G, kx) === myHull ? clamp(kx + side * (hitR - 6)) : P.x; out.why = 'on the other hull: let him come'; return out; }
  if (committed(e)) { if (dx < hitR) { swing(kx); out.gx = P.x; out.why = 'cut him in his recovery'; return out; } out.gx = clamp(kx + side * (hitR - 8)); out.why = 'in on his recovery'; return out; }
  if (dx > hitR + 26) { out.gx = clamp(kx + side * (hitR - 6)); out.face = Math.sign(kx - P.x) || 1; out.why = 'in to him'; return out; }
  out.face = Math.sign(kx - P.x) || 1;
  if (e.mode === 'walk' && roll('chip' + S.act + Math.floor(t * 2), S.plates > 0 ? PLAN.chip : 0.6) && dx < hitR) { swing(kx); out.gx = P.x; out.why = S.plates > 0 ? 'chip his iron' : 'cut him: he is bare'; return out; }
  out.gx = away(hitR + 10); out.why = 'on his guard: wait for his blow'; return out;
}
