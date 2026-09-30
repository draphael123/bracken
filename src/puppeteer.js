// src/puppeteer.js - THE PUPPETEER, the boss of THE MASKWRIGHT'S THEATRE (claude/puppeteer; Daniel approved the level and the boss 2026-09-30;
// PUPPETEER2, the rework after he played it the same day: "cool concept but repetitive and very easy").
// The theatre's MAIN STAGE is his arena: a stage floor, and nine rows over it THE FLY GALLERY (an iron catwalk hung from the grid), where he stands
// and works his marionettes on long strings. The fight's one rule is the level's: CUT THE STRINGS.
//
// THE RULE. His puppets are wood: a blow on a body clacks and does nothing. Every puppet hangs on STRINGS that run up to the control bar in his
// hands, and a string can be cut only while it is TAUT: it glows gold for the LAST PUP.glowT s of every windup, through the blow, and while the
// puppet is being flown. A cut in the glow cancels the blow and staggers the puppet; one string of a puppet a swing; the second cut drops it in a
// heap. A HALF-CUT puppet RE-TIES its cut string after PUP.retieT s unless you finish it. From the second act each puppet also hangs on a GREY
// DECOY string (dull grey with red tags, never gold): a swing that crosses it and cuts nothing real snares you in it. So: wait for the gold.
//
// EVERY CYCLE CHANGES. A cycle ends when he re-strings. Then a told SCENE CHANGE (the lights drop, the boards that will open flash red, the flats
// ride in on their tracks) sets a new stage - painted flats you can stand on, trapdoors open in the boards - and no two cycles in a row play on the
// same layout (SCENES). The puppets come back in a new pairing (PAIRINGS: the Soldier and the Harlequin, then the Harlequin and THE ACROBAT, then
// all three), and every puppet that comes back re-strung has ONE NEW MOVE (MOVES by lvl: the Soldier's head-high THRUST, the Harlequin's HIGH
// KICK, the Acrobat's SWING). With a high move and a low move on the stage they PAIR: two puppets wind up together, the high blow lands first and
// the low one PUP.pairGap s after it - duck, then jump (or step out of the drop), or cut one of them in its glow. Never a guaranteed hit.
//
// HE FIGHTS TOO, from the loft, between his puppets' blows (never on top of one: a told threat at a time): SANDBAGS (a shadow on the boards, !!),
// THE SPOTLIGHT (a beam swings onto you and settles, told: stand in it when it lands and you are DAZZLED - the glow of the strings is lost in
// the glare for PUP.dazzleT s; it throws no blow) and THE SCENERY (he cuts a rope and a painted flat falls on the red band, !!).
//
//   PHASE 1  THE PLAY     (full to 2/3)  cut every puppet on the stage down and he rides his fly line down to tie them back on, kneeling: open,
//                                        PUP.openMul, for PUP.restringT s. One down and the other dancing, a new string comes down to the heap (cut it).
//   PHASE 2  THE LOFT     (2/3 to 1/3)   he cuts his own line; THE COUNTERWEIGHT comes free (the pin rail at the batten: it flies you up to the gallery).
//                                        Up there the puppets are flown to your floor, he whips (!!, low/high) and snares (!!). Cut them down up
//                                        there and he re-strings where he stands: open.
//   PHASE 3  THE MASTERPIECE (1/3 to 0)  a wooden king on four strings (swat !, stomp !!, reach !! - its hand sweeps whatever floor above the boards
//                                        you stand on). Cut all four - each re-ties PUP.retieBigT s after it is cut - and it falls and drags him
//                                        down: open PUP.fallT s at PUP.fallMul. He climbs back, the scene changes, and he rigs it again.
// Health is never the lever (720, as before); every window is one the player made, and a blow on him anywhere else is PUP.ward.
//
// PURE: no DOM, no main.js. The world is a context `c` (src/puppeteer-hands.js binds it); the frame's events are returned for tools/puppeteer.mjs.
// The stage is laid by stagePuppeteer (the theatre's level calls it); buildPuppetStage is the standalone arena, level 'puppetstage'.

export const PUP = {
  hp: 720, w: 16, h: 40, markH: 50,
  ward: 0.05, openMul: 3.0, fallMul: 3.2,   /* (PUPPETEER2: the windows are shorter - 1.8 s and 3 s - and worth more: a window is the whole of a cycle's work) */
  // THE STRINGS
  glowT: 0.4,                          // a windup's strings glow (and can be cut) only for its last glowT s
  retieT: 3.5, retieBigT: 7.0,         // a half-cut puppet's string ties itself back this long after the cut (the masterpiece's, each)
  decoySnare: 1.0, decoyDmg: 0,        // a grey decoy crossed: snared this long (it hurts nothing itself: what hurts is what comes while you are held)
  // PHASE 1: his opening
  descendTell: 1.0, descendT: 0.9, restringT: 1.8, ascendT: 1.0,
  lonelyT: 9.0, lowerT: 2.6, riseT: 0.8, lowerInT: 1.0,
  sceneT: 1.8,                         // THE SCENE CHANGE: told this long before the boards move
  // THE PUPPETS
  hopT: 0.22, hopRest: 0.18, speed: { marionette: 70, harlequin: 96, acrobat: 60 },
  recoverT: 0.55, staggerT: 0.6, limp: 0.6,
  gapT: [0.9, 0.8, 0.7],               // the rest between one blow and the next
  pairEvery: 3, pairGap: 0.55, dropRest: 4.0, landT: 1.1,         // every third turn a pair, if the stage has a high and a low; the low lands pairGap s after the high
  flySpeed: 170,
  lowTop: 10, highTop: 24, highBot: 10,   // the bands: low jumps, high ducks (as the whip and the Wicker Queen's ribbons)
  // HIS OWN BLOWS (from the loft, a hero on the stage)
  actEvery: [7.0, 6.0, 5.0], actFirst: 5.0,
  sandbagTell: 0.9, sandbagHalf: 12,
  spotTell: 1.1, spotHalf: 26, dazzleT: 2.2,
  sceneryTell: 1.2, sceneryHalf: 22,
  // PHASE 2: the loft
  cutLineT: 1.3,
  whipEvery: 3.4, whipFirst: 2.2, whipTell: 0.9, whipT: 0.35, whipReach: 240,
  snareEvery: 7.5, snareFirst: 4.5, snareTell: 0.9, snareR: 14, snareHold: 1.3,
  loftRestringT: 1.8,
  pace: 26, keep: 72,
  // PHASE 3: the masterpiece
  masterTell: 2.2, mW: 34, mH: 92, mSpeed: 34,
  swatTell: 0.9, swatT: 0.3, swatReach: 58, swatRange: 64, swatTop: 64,
  stompTell: 1.1, stompT: 0.25, stompHalf: 24,
  reachTell: 1.0, reachT: 0.45, reachSpan: 200,
  mGap: [1.2, 1.2, 1.0],
  yankT: 0.7, fallT: 3.0, climbT: 1.4, rerigT: 3.0,
  /* THE BLOWS (claude/puppeteer2: harder, in line with the mid-game bosses - the Wicker Queen's sickle 26 and lash 20, the Winchmaster's send) */
  dmg: { chop: 18, thrust: 20, spin: 20, kick: 20, drop: 22, swing: 20, whip: 20, snare: 14, swat: 22, stomp: 28, reach: 22, sandbag: 16, scenery: 22 },
  p2: 2 / 3, p3: 1 / 3,
};
/* THE PUPPETS' MOVES. lvl: the times it must have come back re-strung before it has this move. h: 'low' (jump it, or block the chop) | 'high' (duck it).
   both: the blow reaches both sides of it. The drop is the Acrobat's (hoisted over you, a shadow, then let go) */
export const MOVES = {
  chop:   { who: 'marionette', lvl: 0, tell: 0.7,  blow: 0.22, reach: 30, range: 34, h: 'low', top: 30, block: true },
  thrust: { who: 'marionette', lvl: 1, tell: 0.8,  blow: 0.25, reach: 46, range: 50, h: 'high' },
  spin:   { who: 'harlequin',  lvl: 0, tell: 0.85, blow: 0.4,  reach: 42, range: 48, h: 'low', top: 12, both: true },
  kick:   { who: 'harlequin',  lvl: 1, tell: 0.8,  blow: 0.25, reach: 36, range: 40, h: 'high' },
  drop:   { who: 'acrobat',    lvl: 0, tell: 1.0,  blow: 0.3,  reach: 16, range: 999, h: 'low' },
  swing:  { who: 'acrobat',    lvl: 1, tell: 1.0,  blow: 0.5,  reach: 96, range: 90, h: 'high', both: true },
};
export const MOVE_NAME = { chop: 'THE SOLDIER', thrust: 'THE THRUST', spin: 'THE HARLEQUIN', kick: 'THE HIGH KICK', drop: 'THE DROP', swing: 'THE SWING' };
/* WHO IS ON THE STAGE, cycle by cycle (the last one repeats) */
export const PAIRINGS = [['marionette', 'harlequin'], ['harlequin', 'acrobat'], ['marionette', 'harlequin', 'acrobat']];
export const lineupOf = cycle => PAIRINGS[Math.min(cycle, PAIRINGS.length - 1)];
/* THE SCENES: the stage's layouts, in stage columns (1..38 inside the walls; the batten's slot and the pin rail, 1-3, are never touched).
   flats: [x0, x1, rows up] - a painted flat run in on its track, its top a ledge you can stand on. traps: [x0, x1] - trapdoors open in the boards
   (two deep, over the rock the stage stands on). Cycle 0 is the bare stage; after it 1, 2, 3, 1, 2, 3 ... so no cycle repeats the one before */
export const SCENES = [
  { name: 'THE BARE STAGE', flats: [], traps: [] },
  { name: 'THE FOREST', flats: [[9, 13, 3], [25, 29, 3]], traps: [[18, 20]] },
  { name: 'THE CASTLE', flats: [[15, 22, 4]], traps: [[7, 9], [29, 31]] },
  { name: 'THE STORM AT SEA', flats: [[5, 8, 3], [31, 34, 3], [18, 21, 5]], traps: [[12, 14], [24, 26]] },
];
export const sceneOf = cycle => (cycle <= 0 ? 0 : 1 + ((cycle - 1) % 3));
export const PUPPETS = { marionette: { w: 12, h: 30 }, harlequin: { w: 12, h: 28 }, acrobat: { w: 12, h: 28 }, masterpiece: { w: PUP.mW, h: PUP.mH } };
export const STRINGS = {
  marionette: [{ k: 'sword hand', dx: 7, up: 12 }, { k: 'shield hand', dx: -6, up: 12 }],   /* at the hands, low, where every hero's blow from the boards reaches */
  harlequin: [{ k: 'hand', dx: 6, up: 12 }, { k: 'knee', dx: -3, up: 8 }],
  acrobat: [{ k: 'wrist', dx: 5, up: 13 }, { k: 'ankle', dx: -4, up: 7 }],
  masterpiece: [{ k: 'left hand', dx: -18, up: 38 }, { k: 'right hand', dx: 18, up: 38 }, { k: 'head', dx: 0, up: 94 }, { k: 'back', dx: -6, up: 70 }],
};
export const DECOY = { dx: 0, up: 20 };   /* THE GREY DECOY: from the middle of the bar to the belt - between the two real strings, so a swing thrown before the gold crosses it */
export const isPuppet = e => !!e && (e.t === 'marionette' || e.t === 'harlequin' || e.t === 'acrobat' || e.t === 'masterpiece');
/* the frames of the sprites in src/redraw/puppeteer_art.js */
export const PUP_F = { work: [0, 1], tell: 2, whip: 3, snareTell: 4, ride: 5, restring: [6, 7], fallen: 8, climb: 9, hurt: 10, dead: 11, cut: 12 };
export const MAR_F = { hang: 0, hop: [1, 2], tell: 3, blow: 4, stagger: 5, heap: 6, rise: 7, drop: 8, highTell: 9, high: 10 };
export const MP_F = { hang: 0, walk: [1, 2], swatTell: 3, swat: 4, stompTell: 5, stomp: 6, reachTell: 7, reach: 8, stagger: 9, heap: 10 };

export const pupPhase = e => (e.hp <= e.maxHp * PUP.p3 ? 3 : e.hp <= e.maxHp * PUP.p2 ? 2 : 1);
export const pupOpen = e => !!e && (e.mode === 'restring' || e.mode === 'fallen');
export const pupTake = e => (e.mode === 'fallen' ? PUP.fallMul : e.mode === 'restring' ? PUP.openMul : PUP.ward);
/* THE BANDS in world y, from the floor they run along: [top, bottom] */
export const whipBand = (kind, floor) => (kind === 'low' ? [floor - PUP.lowTop, floor] : [floor - PUP.highTop, floor - PUP.highBot]);
export const bandCatches = (kind, floor, box) => { const [t, b] = whipBand(kind, floor); return box.b > t && box.t < b; };
export const WHIP_ORDER = ['low', 'high', 'high', 'low', 'high', 'low', 'low', 'high'];
const BLOWS = ['chop', 'thrust', 'spin', 'kick', 'drop', 'swing', 'swat', 'stomp', 'reach'];
const tellOf = m => (typeof m === 'string' && m.endsWith('Tell') ? m.slice(0, -4) : null);

/* ---------- THE STRINGS ---------- */
/* taut (gold, cuttable): the last PUP.glowT s of a windup, the blow itself, and while it is flown */
export const pupTaut = p => { if (!p || !p.alive) return false; const m = p.mode || '';
  if (m === 'heap' || m === 'fall' || m === 'packed' || m === 'collapse' || m === 'lower' || m === 'lowerIn') return false;
  if (m.endsWith('Tell')) return p.modeT <= PUP.glowT;
  return BLOWS.includes(m) || m === 'fly' || m === 'land'; };   /* (land: the drop's strings jerk taut as it hits the boards - the drop's own glow, low where a blade reaches) */
export function barOf(e, big) { const y = e.y - (e.mode === 'restring' ? 16 : 34);
  return big ? { x0: e.x - 22, x1: e.x + 22, y } : { x0: e.x - 7, x1: e.x + 7, y }; }
/* EVERY STRING NOW: { p, i, k, x0, y0, x1, y1, taut, decoy?, lowering? } (cut strings are left out) */
export function stringsOf(e, show) {
  const out = []; if (!e || !show) return out;
  for (const p of show.puppets) { if (!p.alive || p.mode === 'packed' || p.mode === 'lowerIn' || (p.mode === 'lower' && p.t !== 'masterpiece')) continue;
    const S = STRINGS[p.t], big = p.t === 'masterpiece', bar = barOf(e, big), taut = pupTaut(p), f = p.face || 1;
    S.forEach((s, i) => { const st = p.str[i]; if (!st || st.cut) return;
      const n = S.length, x0 = bar.x0 + (bar.x1 - bar.x0) * (n === 1 ? 0.5 : i / (n - 1));
      out.push({ p, i, k: s.k, x0, y0: bar.y, x1: p.x + s.dx * f, y1: p.y - s.up, taut }); });
    if (p.decoy && !heaped(p)) out.push({ p, i: -2, k: 'decoy', x0: (bar.x0 + bar.x1) / 2 + 2, y0: bar.y, x1: p.x + DECOY.dx * f, y1: p.y - DECOY.up, taut: false, decoy: true }); }
  if (show.lowering) { const q = show.lowering, bar = barOf(e, false), k = Math.min(1, 1 - q.t / PUP.lowerT), p = q.p;
    const tx = p.x, ty = p.y - 6; out.push({ p, i: -1, k: 'new', x0: bar.x0 + 7, y0: bar.y, x1: bar.x0 + 7 + (tx - bar.x0 - 7) * k, y1: bar.y + (ty - bar.y) * k, taut: true, lowering: true }); }
  return out;
}
export function segHitsBox(x0, y0, x1, y1, b) {
  let t0 = 0, t1 = 1; const dx = x1 - x0, dy = y1 - y0;
  for (const [p, q] of [[-dx, x0 - b.l], [dx, b.r - x0], [-dy, y0 - b.t], [dy, b.b - y0]]) {
    if (p === 0) { if (q < 0) return false; continue; }
    const r = q / p; if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; } }
  return t0 <= t1;
}
/* A BLOW IN BOX hb. A taut, uncut string it crosses is cut - one of each puppet a swing (`seen` is the swing's hit set). A swing that cuts nothing real
   but crosses a GREY DECOY springs it: the result's `decoy` is that puppet (the hands snare the hero). Returns the cuts: [{ p, k }] (+ .decoy) */
export function strikeStrings(e, show, hb, seen) {
  const cuts = []; if (!e || !show || !hb) return cuts;
  const once = seen || new Set(), all = stringsOf(e, show);
  for (const s of all) { if (!s.taut || s.decoy) continue; const tag = s.lowering ? show.lowering : s.p.str[s.i], pt = s.p.strTag || (s.p.strTag = {});
    if (once.has(tag) || (!s.lowering && once.has(pt))) continue;
    if (!segHitsBox(s.x0, s.y0, s.x1, s.y1, hb)) continue;
    once.add(tag); if (!s.lowering) once.add(pt);
    if (s.lowering) { show.lowering = null; show.n.lowerCut++; cuts.push({ p: s.p, k: 'new' }); continue; }
    const st = s.p.str[s.i]; st.cut = true; st.cutAt = { x: (s.x0 + s.x1) / 2, y: (s.y0 + s.y1) / 2 }; st.retie = s.p.t === 'masterpiece' ? PUP.retieBigT : PUP.retieT; show.n.cut++; cuts.push({ p: s.p, k: s.k }); }
  if (!cuts.length) for (const s of all) { if (!s.decoy) continue; const dt = s.p.decoyTag || (s.p.decoyTag = {}); if (once.has(dt)) continue;
    if (!segHitsBox(s.x0, s.y0, s.x1, s.y1, hb)) continue; once.add(dt); show.n.decoy++; cuts.decoy = s.p; break; }
  return cuts;
}
export const stringsLeft = p => (p.str || []).filter(s => !s.cut).length;
export const heaped = p => !p.alive || p.mode === 'heap' || p.mode === 'fall' || p.mode === 'collapse' || p.mode === 'packed';

/* ---------- THE COUNTERWEIGHT (phase 2 on) ---------- */
export const BATTEN = { riseSpeed: 170, lowerSpeed: 60, hold: 4.5, cool: 0.8 };
export function pinStrike(b, free) { if (!free) return 'locked'; if (b.st !== 'down' || b.t > 0) return 'busy'; b.st = 'rise'; return 'free'; }
export function stepBatten(b, dt) {
  b.t = Math.max(0, (b.t || 0) - dt);
  if (b.st === 'rise') { b.y = Math.max(b.up, b.y - BATTEN.riseSpeed * dt); if (b.y <= b.up) { b.st = 'up'; b.t = BATTEN.hold; } }
  else if (b.st === 'up') { if (b.t <= 0) b.st = 'lower'; }
  else if (b.st === 'lower') { b.y = Math.min(b.down, b.y + BATTEN.lowerSpeed * dt); if (b.y >= b.down) { b.st = 'down'; b.t = BATTEN.cool; } }
  return b.y;
}
export const sandbagK = b => (b.down === b.up ? 0 : (b.down - b.y) / (b.down - b.up));

/* ---------- THE SHOW ---------- */
/* A = { x0, x1, floor, gallery, gx0, gx1, sx, TS } (world px; sx the stage's west wall column): the stage, its floor, the gallery's boards */
export function newShow(A) {
  return { A, puppets: [], turn: 0, gap: 1.2, blows: 0, turns: 0, lonely: 0, lowering: null, snare: null, line: true, free: false, cycle: 0, scene: 0, sceneDue: false,
    open: [], flats: [], falls: [], mine: null, deferred: [],
    n: { cut: 0, lowerCut: 0, decoy: 0, retie: 0, descend: 0, restring: 0, loftRestring: 0, scene: 0, pair: 0, drop: 0, chop: 0, thrust: 0, spin: 0, kick: 0, swing: 0,
      whip: 0, snare: 0, snared: 0, swat: 0, stomp: 0, reach: 0, fall: 0, fly: 0, rerig: 0, pin: 0, sandbag: 0, spot: 0, dazzled: 0, scenery: 0 } };
}
export function newPuppet(p, show) {
  const S = STRINGS[p.t]; p.str = S.map(() => ({ cut: false })); p.mode = p.t === 'masterpiece' ? 'lower' : 'hang'; p.modeT = 0; p.anim = 0; p.vx = 0;
  p.hopT = 0; p.flown = false; p.floorY = show.A.floor; p.face = p.face || -1; p.puppet = true; p.lvl = 0; p.decoy = false; show.puppets.push(p);
  if (p.t !== 'masterpiece' && !lineupOf(show.cycle).includes(p.t)) { p.mode = 'packed'; p.alive = false; }   /* not in this act: up in the flies */
  return p;
}
export function newPuppeteer(e) {
  return Object.assign(e, { mode: 'sleep', modeT: 0, phase: 1, open: 0, whipCd: PUP.whipFirst, snareCd: PUP.snareFirst, whipN: 0, whipKind: null, whipR: 0,
    actCd: PUP.actFirst, actN: 0, home: e.x, anim: 0, vx: 0, onStage: false });
}
/* WHICH FLOOR IS THIS HERO ON: the gallery, or the height he stands at on the stage (the boards, a flat's top, a trapdoor's pit); in the air, the last */
export function heroFloor(show, h) { const A = show.A;
  if (h.ground && Math.abs(h.y - A.gallery) < 6) return A.gallery;
  if (h.ground && h.y > A.gallery + 20) return Math.round(h.y);
  return h.lastFloor || A.floor; }
const onLoft = (show, h) => !!h && Math.abs((h.lastFloor ?? show.A.floor) - show.A.gallery) < 6;
const movesOf = p => Object.keys(MOVES).filter(k => MOVES[k].who === p.t && MOVES[k].lvl <= (p.lvl || 0));
const startTell = (p, mode, len) => { p.mode = mode; p.modeT = len; p.tellLen = len; p.tellId = (p.tellId || 0) + 1; };

/* ---------- ONE PUPPET'S FRAME ---------- */
function puppetStep(p, e, show, dt, c, ev, hero, myTurn) {
  const A = show.A; p.anim = (p.anim || 0) + dt; p.modeT -= dt; p.vx = 0; if (p.dropCd > 0) p.dropCd -= dt;
  const big = p.t === 'masterpiece';
  /* A STRING JUST CUT: its blow is cancelled and it staggers (and, half-cut, its string starts to re-tie) */
  const left = stringsLeft(p); if (p.left0 === undefined) p.left0 = left;
  if (left < p.left0 && left > 0 && !heaped(p)) { if (/Tell$/.test(p.mode) || BLOWS.includes(p.mode)) { ev.push({ t: 'cancel', p, was: p.mode }); if (p.mode === 'dropTell' || p.mode === 'drop') { p.mode = 'fall'; p.vy = 0; } else { p.mode = 'stagger'; p.modeT = PUP.staggerT; } show.gap = Math.min(show.gap, 0.3); }
    else if (p.mode === 'hang' || p.mode === 'fly') { p.mode = 'stagger'; p.modeT = PUP.staggerT * 0.6; } }
  /* THE RE-TIE: a cut string of a puppet still hanging ties itself back unless the rest are cut first */
  if (!heaped(p) && left > 0) for (const st of p.str) if (st.cut && st.retie !== undefined) { st.retie -= dt; if (st.retie <= 0) { st.cut = false; st.cutAt = null; st.retie = undefined; show.n.retie++; ev.push({ t: 'retie', p }); c.sound('retie'); } }
  p.left0 = stringsLeft(p);
  const m = p.mode;
  if (!heaped(p) && m !== 'lower' && m !== 'lowerIn' && m !== 'rise' && stringsLeft(p) === 0) {
    if (big) { p.mode = 'collapse'; p.modeT = 0.6; ev.push({ t: 'collapse', p }); c.sound('collapse'); return; }
    p.mode = p.y < A.floor - 4 ? 'fall' : 'heap'; p.vy = 0; p.flown = false; ev.push({ t: 'heap', p }); c.sound('heap'); return; }
  switch (m) {
    case 'packed': return;
    case 'fall': p.vy = (p.vy || 0) + 900 * dt; p.y = Math.min(A.floor, p.y + p.vy * dt); if (p.y >= A.floor) { p.mode = stringsLeft(p) ? 'stagger' : 'heap'; p.modeT = PUP.staggerT; p.flown = false; c.sound('heap'); } return;
    case 'heap': p.y = A.floor; return;
    case 'collapse': if (p.modeT <= 0) p.mode = 'heap'; return;
    case 'lower': p.y = Math.min(A.floor, p.y + 90 * dt); if (p.y >= A.floor) { p.mode = 'hang'; p.modeT = 0.4; } return;
    case 'lowerIn': { const k = 1 - Math.max(0, p.modeT) / PUP.lowerInT; p.y = A.gallery + (A.floor - A.gallery) * k; if (p.modeT <= 0) { p.y = A.floor; p.mode = 'hang'; p.modeT = 0.3; } return; }
    case 'rise': if (p.modeT <= 0) { p.mode = 'hang'; p.modeT = 0.3; } return;
    case 'land': if (p.modeT <= 0) { p.mode = 'recover'; p.modeT = 0.2; } return;
    case 'stagger': if (p.modeT <= 0) { p.mode = 'hang'; p.modeT = 0.2; } else if (p.flown && stringsLeft(p)) p.y = p.floorY; return;
    case 'recover': if (p.modeT <= 0) { p.mode = 'hang'; p.modeT = 0; if (show.turn === 1 && !show.puppets.some(q => q !== p && q.alive && (/Tell$/.test(q.mode) || BLOWS.includes(q.mode)))) { show.turn = 0; show.gap = big ? PUP.mGap[(e.phase || 1) - 1] : PUP.gapT[(e.phase || 1) - 1]; } } return;
  }
  const floor = big ? A.floor : hero ? heroFloor(show, hero) : A.floor;
  /* FLOWN: a small puppet goes to the height its hero stands at - hauled up on its strings, or let down */
  if (!big && Math.abs(p.y - floor) > 3 && (m === 'hang' || m === 'fly')) {
    if (m !== 'fly') { p.mode = 'fly'; show.n.fly++; ev.push({ t: 'fly', p, up: floor < p.y }); c.sound('fly'); }
    const d = floor - p.y, s = Math.sign(d) * Math.min(Math.abs(d), PUP.flySpeed * dt); p.y += s;
    if (hero) { const dx = hero.x - p.x; p.face = Math.sign(dx) || p.face; p.x += Math.sign(dx) * Math.min(Math.abs(dx) * 0.5, 60 * dt); }
    return; }
  if (m === 'fly') { p.mode = 'hang'; p.y = floor; }
  if (m === 'hang') { p.floorY = floor; p.y = floor; }
  p.flown = p.floorY < A.floor - 4;
  const slow = !big && stringsLeft(p) < STRINGS[p.t].length ? PUP.limp : 1;
  /* A TELL RUNS OUT: the blow */
  const tm = tellOf(m);
  if (tm && MOVES[tm] && tm !== 'drop') { if (p.modeT > 0) return;
    const M = MOVES[tm], f = p.face || 1; p.mode = tm; p.modeT = M.blow; show.n[tm]++; ev.push({ t: tm, p, pair: !!p.pair }); c.sound(tm); p.pair = false;
    if (M.h === 'high') { const x0 = M.both ? p.x - M.reach : f > 0 ? p.x : p.x - M.reach, x1 = M.both ? p.x + M.reach : f > 0 ? p.x + M.reach : p.x;
      c.hit([x0, x1, p.floorY - PUP.highTop, p.floorY - PUP.highBot], PUP.dmg[tm], MOVE_NAME[tm], { from: p.x, unblockable: true, duck: true }); }
    else { const x0 = M.both ? p.x - M.reach : f > 0 ? p.x : p.x - M.reach, x1 = M.both ? p.x + M.reach : f > 0 ? p.x + M.reach : p.x;
      c.hit([x0, x1, p.floorY - M.top, p.floorY], PUP.dmg[tm], MOVE_NAME[tm], { from: p.x, unblockable: !M.block }); }
    return; }
  switch (m) {
    case 'dropTell': {   /* hoisted over the hero, its shadow on the boards: it follows him for the first half, then it is let go where it is */
      const len = p.tellLen || MOVES.drop.tell;
      if (hero && p.modeT > len / 2) { p.dropX += Math.sign(hero.x - p.dropX) * Math.min(Math.abs(hero.x - p.dropX), 80 * dt);   /* (slower than a running hero, and let go at half its windup: you can step out) */ p.floorY = heroFloor(show, hero) > A.gallery + 20 ? heroFloor(show, hero) : A.floor; }
      p.x = p.dropX; p.y = p.floorY - 70 * Math.min(1, (len - p.modeT) / 0.3);
      if (p.modeT <= 0) { p.mode = 'drop'; p.modeT = MOVES.drop.blow; p.vy = 0; show.n.drop++; ev.push({ t: 'drop', p, pair: !!p.pair }); c.sound('dropFall'); }
      return; }
    case 'drop': p.vy = (p.vy || 0) + 1600 * dt; p.y = Math.min(p.floorY, p.y + p.vy * dt);
      if (p.y >= p.floorY) { p.y = p.floorY; c.sound('dropLand'); c.hit([p.x - MOVES.drop.reach, p.x + MOVES.drop.reach, p.floorY - 40, p.floorY], PUP.dmg.drop, 'THE DROP', { from: p.x, unblockable: true, up: true });
        p.mode = 'land'; p.modeT = PUP.landT; p.pair = false; p.dropCd = PUP.dropRest; }
      return;
    case 'swatTell': if (p.modeT <= 0) { p.mode = 'swat'; p.modeT = PUP.swatT; show.n.swat++; ev.push({ t: 'swat', p }); c.sound('swat');
      const f = p.face, bx = f > 0 ? [p.x, p.x + PUP.swatReach] : [p.x - PUP.swatReach, p.x]; c.hit([bx[0], bx[1], p.y - PUP.swatTop, p.y], PUP.dmg.swat, 'THE MASTERPIECE', { from: p.x }); } return;
    case 'stompTell': if (p.modeT <= 0) { p.mode = 'stomp'; p.modeT = PUP.stompT; show.n.stomp++; ev.push({ t: 'stomp', p, x: p.stompX }); c.sound('stomp');
      c.hit([p.stompX - PUP.stompHalf, p.stompX + PUP.stompHalf, A.floor - 22, A.floor], PUP.dmg.stomp, 'THE STOMP', { from: p.stompX, unblockable: true, up: true }); } return;
    case 'reachTell': if (p.modeT <= 0) { p.mode = 'reach'; p.modeT = PUP.reachT; p.reachR = 0; show.n.reach++; ev.push({ t: 'reach', p }); c.sound('reach'); } return;
    case 'reach': { const r1 = PUP.reachSpan * Math.min(1, 1 - Math.max(0, p.modeT) / PUP.reachT); p.reachR = r1;
      c.band('high', p.reachY || A.gallery, p.x - r1, p.x + r1, PUP.dmg.reach, 'THE REACH', 'reach' + show.n.reach);
      if (p.modeT <= 0) { p.mode = 'recover'; p.modeT = PUP.recoverT; } return; }
    case 'chop': case 'thrust': case 'spin': case 'kick': case 'swing': case 'swat': case 'stomp': if (p.modeT <= 0) { p.mode = 'recover'; p.modeT = PUP.recoverT; } return;
  }
  /* HANGING */
  if (!hero) return;
  const hf = heroFloor(show, hero), dx = hero.x - p.x, adx = Math.abs(dx), sameFloor = Math.abs(hf - floor) < 6;
  p.face = Math.sign(dx) || p.face;
  if (big) {
    if (myTurn && show.gap <= 0 && show.turn === 0) {
      if (!sameFloor && hero.ground && e.phase >= 3) { p.reachY = hf; startTell(p, 'reachTell', PUP.reachTell); show.turn = 1; ev.push({ t: 'reachTell', p }); c.say('!!', '#ff6b6b'); c.sound('reachTell'); return; }
      if (sameFloor && adx < PUP.swatRange) { startTell(p, 'swatTell', PUP.swatTell); show.turn = 1; ev.push({ t: 'swatTell', p }); c.say('!', '#ffd36b'); c.sound('swatTell'); return; }
      if (sameFloor && adx < 150 && ((show.blows++) % 2 === 1)) { startTell(p, 'stompTell', PUP.stompTell); p.stompX = hero.x; show.turn = 1; ev.push({ t: 'stompTell', p, x: hero.x }); c.say('!!', '#ff6b6b'); c.sound('stompTell'); return; } }
  } else if (myTurn && show.gap <= 0 && show.turn === 0 && sameFloor) {
    const mv = movesOf(p), inRange = mv.filter(k => k === 'drop' ? !p.flown && !(p.dropCd > 0) : adx < MOVES[k].range);   /* (the drop wants PUP.dropRest s between drops: it is hoisted, not thrown) */
    if (inRange.length) { const k = inRange.includes('drop') && show.blows % 3 === 2 ? 'drop' : inRange.filter(q => q !== 'drop').length ? inRange.filter(q => q !== 'drop')[show.blows % inRange.filter(q => q !== 'drop').length] : 'drop';
      show.blows++; show.turn = 1; beginMove(p, k, 1 / slow, hero, show, ev, c); return; } }
  /* the walk: in hops; it stops a little short of its reach */
  const want = (big ? PUP.swatRange - 18 : Math.max(...movesOf(p).map(k => k === 'drop' ? 0 : MOVES[k].range)) - 10);
  if (sameFloor && adx > want) { p.hopT = (p.hopT || 0) + dt; const cyc = PUP.hopT + PUP.hopRest, ph = p.hopT % cyc;
    if (ph < PUP.hopT) { const sp = (big ? PUP.mSpeed : PUP.speed[p.t]) * slow; p.vx = Math.sign(dx) * sp; }
    const nx = p.x + p.vx * dt, lo = (p.flown ? A.gx0 : A.x0) + 10, hi = (p.flown ? A.gx1 : A.x1) - 10;
    p.x = Math.max(lo, Math.min(hi, nx)); }
}
function beginMove(p, k, mul, hero, show, ev, c, extra = 0) {
  const M = MOVES[k]; startTell(p, k + 'Tell', M.tell * mul + extra); if (k === 'drop') p.dropX = hero ? hero.x : p.x;
  ev.push({ t: k + 'Tell', p }); c.say(M.block ? '!' : '!!', M.block ? '#ffd36b' : '#ff6b6b'); c.sound(k === 'drop' ? 'dropTell' : k + 'Tell');
}
/* A PAIR: a high blow from one puppet and a low from another, told together; the low lands PUP.pairGap s after the high. Only when the stage has both */
function tryPair(show, hero, ev, c) {
  const live = show.puppets.filter(p => p.t !== 'masterpiece' && p.alive && p.mode === 'hang' && !heaped(p)); if (live.length < 2 || !hero) return false;
  const hf = heroFloor(show, hero), near = p => Math.abs(p.floorY - hf) < 6 || Math.abs(p.y - hf) < 6;
  for (const hi of live) for (const lo of live) { if (hi === lo || !near(hi) || !near(lo)) continue;
    const hk = movesOf(hi).find(k => MOVES[k].h === 'high' && Math.abs(hero.x - hi.x) < MOVES[k].range);
    const lk = movesOf(lo).find(k => MOVES[k].h === 'low' && !MOVES[k].block && (k === 'drop' ? !lo.flown : Math.abs(hero.x - lo.x) < MOVES[k].range));
    if (!hk || !lk) continue;
    hi.face = Math.sign(hero.x - hi.x) || hi.face; lo.face = Math.sign(hero.x - lo.x) || lo.face;
    const hiT = MOVES[hk].tell, loExtra = hiT + PUP.pairGap - MOVES[lk].tell;
    beginMove(hi, hk, 1, hero, show, ev, c); beginMove(lo, lk, 1, hero, show, ev, c, Math.max(0, loExtra)); hi.pair = lo.pair = true;
    show.turn = 1; show.n.pair++; ev.push({ t: 'pair', hi: hk, lo: lk }); return true; }
  return false;
}

/* ---------- THE SCENE CHANGE ---------- */
/* the tiles the next scene lays: [{ x, y, t: 'air'|'ledge'|'floor' }] in world tiles, from the current layout to the next. Trapdoors in use (a hero in
   the pit) stay open and are tried again each frame (show.deferred) */
export function sceneTiles(show, from, to) {
  const A = show.A, sx = A.sx, R = Math.round(A.floor / A.TS), out = [], S0 = SCENES[from], S1 = SCENES[to];
  for (const [x0, x1, h] of S0.flats) for (let x = x0; x <= x1; x++) out.push({ x: sx + x, y: R - h, t: 'air' });
  for (const [x0, x1] of S0.traps) for (let x = x0; x <= x1; x++) for (const y of [R, R + 1]) out.push({ x: sx + x, y, t: 'floor', trap: true });
  for (const [x0, x1, h] of S1.flats) for (let x = x0; x <= x1; x++) out.push({ x: sx + x, y: R - h, t: 'ledge' });
  for (const [x0, x1] of S1.traps) for (let x = x0; x <= x1; x++) for (const y of [R, R + 1]) out.push({ x: sx + x, y, t: 'air', trap: true });
  /* a cell the next scene keeps as it is: the last word wins */
  const m = new Map(); for (const o of out) m.set(o.x + ',' + o.y, o); return [...m.values()];
}
function applyScene(show, c, heroes) {
  const cells = sceneTiles(show, show.scene, show.nextScene); show.scene = show.nextScene; show.deferred = [];
  const inPit = (x) => heroes.some(h => Math.floor(h.x / show.A.TS) === x && h.y > show.A.floor + 2);
  for (const o of cells) { if (o.t === 'floor' && o.trap && inPit(o.x)) { show.deferred.push(o); continue; } c.tile(o.x, o.y, o.t); }
  show.n.scene++;
}
function lineupIn(show, ev, c) {
  const want = lineupOf(show.cycle);
  for (const p of show.puppets) { if (p.t === 'masterpiece') continue;
    if (want.includes(p.t)) { const back = p.mode === 'packed';
      restringOne(p); p.lvl = (p.lvl || 0) + (p.seen ? 1 : 0); p.seen = true; p.decoy = show.cycle >= 1; p.pair = false;
      if (back) { p.mode = 'lowerIn'; p.modeT = PUP.lowerInT; p.y = show.A.gallery; p.x = Math.max(show.A.x0 + 40, Math.min(show.A.x1 - 40, p.x)); ev.push({ t: 'lowerIn', p }); }
      else { p.mode = 'rise'; p.modeT = PUP.riseT; } }
    else if (p.mode !== 'packed') { p.mode = 'packed'; p.alive = false; c.pack(p); } }
  c.sound('rise');
}

/* ---------- ONE FRAME OF THE SHOW ----------
   c = { heroes: [{ x, y, face, alive, ground, lastFloor }], say(text, col, low), sound(key), number(x, y, line, col) (a src/hint-lines.js line),
         hit(box [l, r, t, b], dmg, name, { from, unblockable, up, duck }) (duck: judged against the hero's duck box - a high blow), band(kind, floorY, x0, x1, dmg,
         name, key), snare(hero, t, dmg), dazzle(hero, t), tile(x, y, 'air'|'ledge'|'floor'), summon(kind, x, y), pack(p) }
   Returns the frame's events. */
export function stepShow(e, show, dt, c) {
  const ev = []; if (!e || !show) return ev;
  const A = show.A, heroes = (c.heroes || []).filter(h => h.alive);
  e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.vx = 0;
  if (e.mode !== e.lastMode) { e.lastMode = e.mode; e.tellId = (e.tellId || 0) + 1; }   /* (each beat of his is its own thing to see: the bot's eye keys on it) */
  if (!e.alive || e.mode === 'sleep') return ev;
  if (e.mode === 'wake') { if (e.modeT <= 0) { e.mode = 'work'; c.number(e.x, e.y - 60, 'THE STRINGS GLOW WHEN THEY PULL: CUT THEM', '#ffd36b'); for (const p of show.puppets) if (p.alive) p.seen = true; } for (const p of show.puppets) if (p.mode === 'hang') p.y = A.floor; return ev; }
  const hero = heroes.slice().sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || null;
  for (const h of heroes) if (h.lastFloor === undefined) h.lastFloor = heroFloor(show, h);
  /* deferred trapdoors close once the pit is empty */
  if (show.deferred.length) show.deferred = show.deferred.filter(o => { const busy = heroes.some(h => Math.floor(h.x / A.TS) === o.x && h.y > A.floor + 2); if (!busy) c.tile(o.x, o.y, o.t); return busy; });
  /* ---- falling things (his sandbags and scenery) land ---- */
  for (const f of show.falls) { f.vy += 1400 * dt; f.y += f.vy * dt; if (f.y >= f.floor && !f.done) { f.done = true; c.sound(f.k === 'sandbag' ? 'dropLand' : 'land');
    c.hit([f.x - f.half, f.x + f.half, f.floor - 34, f.floor], PUP.dmg[f.k], f.k === 'sandbag' ? 'A SANDBAG' : 'THE SCENERY', { from: f.x, unblockable: true, up: true }); ev.push({ t: f.k + 'Land', x: f.x }); } }
  show.falls = show.falls.filter(f => !f.done || (f.linger = (f.linger ?? 0.4) - dt) > 0);
  /* ---- THE PHASE, only between his beats ---- */
  const ph = pupPhase(e), calm = e.mode === 'work';
  if (ph > e.phase && calm) {
    e.phase = ph; ev.push({ t: 'phase', ph }); show.mine = null;
    if (ph === 2) { e.mode = 'cutLine'; e.modeT = PUP.cutLineT; show.line = false; show.free = true; c.sound('cutLine'); c.number(e.x, e.y - 60, 'RIDE THE BATTEN UP: STRIKE THE PIN RAIL', '#ffd36b'); return ev; }
    if (ph === 3) { e.mode = 'masterTell'; e.modeT = PUP.masterTell; for (const p of show.puppets) if (p.t !== 'masterpiece' && p.alive) { p.mode = 'packed'; p.alive = false; c.pack(p); }
      show.lowering = null; c.sound('masterTell'); c.number(e.x, e.y - 60, 'CUT ALL FOUR OF ITS STRINGS', '#ffd36b'); return ev; } }
  e.open = pupOpen(e) ? Math.max(0, e.modeT) : 0;
  const smalls = show.puppets.filter(p => p.t !== 'masterpiece' && p.mode !== 'packed');
  const master = show.puppets.find(p => p.t === 'masterpiece' && p.alive) || null;
  if (show.turn === 0) show.gap -= dt;
  const live = (e.phase >= 3 ? [master] : smalls).filter(p => p && !heaped(p));
  const pupsGo = !['restring', 'descend', 'descendTell', 'ascend', 'fallen', 'yanked', 'climb', 'scene'].includes(e.mode);
  /* a PAIR when the stage has a high and a low and it is time */
  const halfLive = live.some(p => p.t !== 'masterpiece' && stringsLeft(p) < STRINGS[p.t].length);
  if (pupsGo && !halfLive && e.phase < 3 && show.turn === 0 && show.gap <= 0 && live.length >= 2 && (show.turns % PUP.pairEvery) === PUP.pairEvery - 1 && tryPair(show, hero, ev, c)) { /* (the turn count moves below, as for any turn) */ }
  /* a HALF-CUT puppet takes the next turn: its second string comes into the glow before the first can re-tie (a chance to finish it, never a sure one) */
  const halfCut = live.find(p => p.t !== 'masterpiece' && stringsLeft(p) < STRINGS[p.t].length);
  const ready = live.filter(p => p.mode === 'hang' || p.t === 'masterpiece').sort((a, b) => (hero ? Math.abs(a.x - hero.x) - Math.abs(b.x - hero.x) : 0));
  const turnOf = halfCut || ready[0] || live[0] || null;   /* (else the one nearest you: nothing holds the turn it cannot use) */
  const turn0 = show.turn;
  for (const p of show.puppets) { if (p.mode === 'packed' || !p.alive) continue;
    const mine = pupsGo && (p === turnOf || (live.length === 1 && live[0] === p));
    if (!pupsGo && !heaped(p) && /Tell$/.test(p.mode)) { p.mode = 'hang'; if (show.turn === 1) show.turn = 0; }
    puppetStep(p, e, show, dt, c, ev, hero, mine); }
  if (turn0 === 0 && show.turn === 1) show.turns++;
  if (show.turn === 1 && !show.puppets.some(p => p.alive && (/Tell$/.test(p.mode) || BLOWS.includes(p.mode) || p.mode === 'recover'))) show.turn = 0;
  if (show.lowering) { show.lowering.t -= dt; if (show.lowering.t <= 0) { const p = show.lowering.p; show.lowering = null; restringOne(p); p.mode = 'rise'; p.modeT = PUP.riseT; ev.push({ t: 'rise', p }); c.sound('rise'); } }
  /* ---- HIS OWN BEATS ---- */
  switch (e.mode) {
    case 'cutLine': if (e.modeT <= 0) e.mode = 'work'; return ev;
    case 'descendTell': if (e.modeT <= 0) { e.mode = 'descend'; e.modeT = PUP.descendT; e.onStage = true; ev.push({ t: 'descend' }); c.sound('descend'); } return ev;
    case 'descend': { const k = 1 - Math.max(0, e.modeT) / PUP.descendT; e.y = A.gallery + (A.floor - A.gallery) * k;
      if (e.modeT <= 0) { e.y = A.floor; e.mode = 'restring'; e.modeT = PUP.restringT; e.open = e.modeT; show.n.restring++; ev.push({ t: 'restring' }); c.sound('restring'); c.number(e.x, e.y - 60, 'HE IS RE-STRINGING THEM: CUT HIM', '#ffd36b'); } return ev; }
    case 'restring':
      if (e.modeT <= 0) { e.open = 0; show.cycle++; show.sceneDue = true; ev.push({ t: 'restrung', cycle: show.cycle });
        if (e.onStage) { e.mode = 'ascend'; e.modeT = PUP.ascendT; c.sound('ascend'); } else e.mode = 'work'; }
      return ev;
    case 'ascend': { const k = 1 - Math.max(0, e.modeT) / PUP.ascendT; e.y = A.floor + (A.gallery - A.floor) * k;
      if (e.modeT <= 0) { e.y = A.gallery; e.onStage = false; e.mode = 'work'; } return ev; }
    case 'scene':
      if (e.modeT <= 0) { applyScene(show, c, heroes); if (e.phase < 3) lineupIn(show, ev, c); else if (master) { restringOne(master); master.mode = 'rise'; master.modeT = PUP.riseT; }
        e.mode = 'work'; show.gap = 1.2; show.turn = 0; show.turns = 0; ev.push({ t: 'sceneDone', scene: show.scene }); }
      return ev;
    case 'whipLowTell': case 'whipHighTell':
      if (e.modeT <= 0) { e.whipKind = e.mode === 'whipLowTell' ? 'low' : 'high'; e.mode = 'whip'; e.modeT = PUP.whipT; e.whipR = 0; show.n.whip++; ev.push({ t: 'whip', kind: e.whipKind }); c.sound('whip'); }
      return ev;
    case 'whip': { const r1 = PUP.whipReach * Math.min(1, 1 - Math.max(0, e.modeT) / PUP.whipT); e.whipR = r1; const f = e.face || 1;
      c.band(e.whipKind, A.gallery, f > 0 ? e.x : e.x - r1, f > 0 ? e.x + r1 : e.x, PUP.dmg.whip, 'THE WHIP', 'whip' + show.n.whip);
      if (e.modeT <= 0) { e.mode = 'work'; e.whipCd = PUP.whipEvery; e.whipR = 0; } return ev; }
    case 'snareTell':
      if (e.modeT <= 0) { const s = show.snare; show.snare = null; e.mode = 'work'; e.snareCd = PUP.snareEvery; show.n.snare++; ev.push({ t: 'snare' }); c.sound('snare');
        if (s) for (const h of heroes) if (Math.abs(h.x - s.x) <= PUP.snareR && Math.abs(h.y - s.y) < 20) { show.n.snared++; ev.push({ t: 'snared' }); c.snare(h, PUP.snareHold, PUP.dmg.snare); } }
      return ev;
    /* HIS OWN BLOWS from the loft: while one is told, no puppet begins (show.turn 2) - one told threat at a time */
    case 'sandbagTell': case 'spotTell': case 'sceneryTell': {
      const M = show.mine, len = PUP[e.mode], k = e.mode.slice(0, -4);
      if (M && hero && e.modeT > len * (k === 'scenery' ? 1 : 0.45)) { M.x += Math.sign(hero.x - M.x) * Math.min(Math.abs(hero.x - M.x), 140 * dt); M.floor = Math.max(A.gallery + 24, heroFloor(show, hero)); }
      if (e.modeT <= 0) { show.n[k]++; ev.push({ t: k, x: M && M.x }); c.sound(k);
        if (M && k === 'spot') { for (const h of heroes) if (Math.abs(h.x - M.x) <= PUP.spotHalf && Math.abs(h.y - M.floor) < 24) { show.n.dazzled++; ev.push({ t: 'dazzled' }); c.dazzle(h, PUP.dazzleT); } }
        else if (M) show.falls.push({ k, x: M.x, y: k === 'sandbag' ? A.gallery : A.y0 + 10, vy: 0, floor: M.floor, half: PUP[k + 'Half'] });
        show.mine = null; e.mode = 'work'; if (show.turn === 2) show.turn = 0; show.gap = Math.max(show.gap, 0.6); }
      return ev; }
    case 'masterTell':
      if (e.modeT <= PUP.masterTell - 0.4 && !master && !show.masterAsked) { show.masterAsked = true; const mp = c.summon('masterpiece', (A.x0 + A.x1) / 2, A.gallery + 10); if (mp) { newPuppet(mp, show); mp.y = A.gallery + 30; } }
      if (e.modeT <= 0) { e.mode = 'work'; show.gap = 1.0; show.turn = 0; } return ev;
    case 'yanked': { const k = Math.min(1, 1 - Math.max(0, e.modeT) / PUP.yankT); e.y = A.gallery + (A.floor - A.gallery) * k * k; e.x += (e.yankX - e.x) * Math.min(1, dt * 4);
      if (e.modeT <= 0) { e.y = A.floor; e.mode = 'fallen'; e.modeT = PUP.fallT; e.open = e.modeT; e.onStage = true; show.n.fall++; ev.push({ t: 'fallen' }); c.sound('land'); c.number(e.x, e.y - 60, 'HE FELL WITH IT: CUT HIM', '#ffd36b'); } return ev; }
    case 'fallen': if (e.modeT <= 0) { e.mode = 'climb'; e.modeT = PUP.climbT; e.open = 0; c.sound('ascend'); } return ev;
    case 'climb': { const k = 1 - Math.max(0, e.modeT) / PUP.climbT; e.y = A.floor + (A.gallery - A.floor) * k; if (e.modeT <= 0) { e.y = A.gallery; e.onStage = false; e.mode = 'rerig'; e.modeT = PUP.rerigT; show.n.rerig++; c.sound('restring'); } return ev; }
    case 'rerig': if (e.modeT <= 0) { show.cycle++; show.sceneDue = true; e.mode = 'work'; ev.push({ t: 'rerigged' }); } return ev;
  }
  /* ---- WORK ---- */
  /* THE SCENE CHANGE, owed from a re-stringing: told first, then the boards move */
  if (show.sceneDue) { show.sceneDue = false; show.nextScene = sceneOf(show.cycle); if (show.nextScene === show.scene) show.nextScene = 1 + (show.scene % 3);
    e.mode = 'scene'; e.modeT = PUP.sceneT; show.turn = 0; show.mine = null; ev.push({ t: 'sceneTell', to: show.nextScene }); c.sound('sceneTell'); c.number(e.x, e.y - 60, 'SCENE CHANGE: WATCH THE BOARDS', '#ffd36b'); return ev; }
  if (e.phase >= 3) {
    if (master && master.mode === 'heap' && !show.yankDone) { show.yankDone = true; e.mode = 'yanked'; e.modeT = PUP.yankT; e.yankX = Math.max(A.x0 + 20, Math.min(A.x1 - 20, master.x + (e.x > master.x ? 30 : -30))); ev.push({ t: 'yanked' }); c.sound('yank'); return ev; }
    if (master && master.mode !== 'heap') show.yankDone = false;
  } else {
    const down = smalls.filter(p => heaped(p)).length;
    if (smalls.length && down === smalls.length) {
      show.lowering = null;
      if (show.line) { e.mode = 'descendTell'; e.modeT = PUP.descendTell; show.n.descend++; ev.push({ t: 'descendTell' }); c.sound('descendTell'); return ev; }
      e.mode = 'restring'; e.modeT = PUP.loftRestringT; e.open = e.modeT; show.n.loftRestring++; ev.push({ t: 'restring', loft: true }); c.sound('restring');
      if (hero && onLoft(show, hero)) c.number(e.x, e.y - 60, 'HIS HANDS ARE EMPTY: CUT HIM', '#ffd36b'); else c.number(e.x, e.y - 60, 'HE RE-STRINGS THEM IN THE LOFT: CLIMB', '#ffd36b'); return ev; }
    if (down >= 1 && smalls.length > down) { show.lonely += dt;
      if (show.lonely >= PUP.lonelyT && !show.lowering) { const p = smalls.find(q => heaped(q)); show.lowering = { p, t: PUP.lowerT }; show.lonely = 0; ev.push({ t: 'lower', p }); c.sound('lower'); } }
    else show.lonely = 0;
  }
  const loftHero = hero && onLoft(show, hero) && Math.abs(hero.x - e.x) < PUP.whipReach + 20 ? hero : null;
  /* HIS STRINGS AS WHIPS (phase 2 on, a hero on the gallery near him) */
  if (e.phase >= 2 && loftHero) { e.whipCd -= dt; e.snareCd -= dt;
    if (e.snareCd <= 0 && loftHero.ground) { e.mode = 'snareTell'; e.modeT = PUP.snareTell; e.tellLen = PUP.snareTell; show.snare = { x: loftHero.x, y: A.gallery }; ev.push({ t: 'snareTell', x: loftHero.x }); c.say('!!', '#ff6b6b'); c.sound('snareTell'); return ev; }
    if (e.whipCd <= 0) { const kind = WHIP_ORDER[(e.whipN++) % WHIP_ORDER.length]; e.face = Math.sign(loftHero.x - e.x) || e.face || -1;
      e.mode = kind === 'low' ? 'whipLowTell' : 'whipHighTell'; e.modeT = PUP.whipTell; e.tellLen = PUP.whipTell; ev.push({ t: 'whipTell', kind }); c.say('!!', '#ff6b6b'); c.sound('whipTell'); return ev; } }
  /* HIS OWN BLOWS ON A HERO BELOW: sandbag, spotlight, scenery in turn - only between his puppets' blows */
  if (hero && !onLoft(show, hero)) { e.actCd -= dt;
    if (e.actCd <= 0 && show.turn === 0 && !smalls.some(p => !heaped(p) && stringsLeft(p) < STRINGS[p.t].length)) {   /* (never over a half-cut puppet's finishing window) */ const k = ['sandbag', 'spot', 'scenery'][(e.actN++) % 3], len = PUP[k + 'Tell'];
      e.mode = k + 'Tell'; e.modeT = len; e.tellLen = len; show.turn = 2; e.actCd = PUP.actEvery[e.phase - 1];
      show.mine = { k, x: Math.max(A.x0 + 16, Math.min(A.x1 - 16, hero.x)), floor: Math.max(A.gallery + 24, heroFloor(show, hero)) };
      ev.push({ t: k + 'Tell', x: show.mine.x }); if (k !== 'spot') c.say('!!', '#ff6b6b'); c.sound(k + 'Tell'); return ev; } }
  let tx = e.home;
  const tgt = (e.phase >= 3 ? [master] : smalls).filter(p => p && !heaped(p));
  if (tgt.length) tx = tgt.reduce((a, p) => a + p.x, 0) / tgt.length;
  if (hero && onLoft(show, hero)) { const hx = hero.x, away = Math.sign(e.x - hx) || 1; if (Math.abs(e.x - hx) < PUP.keep || Math.abs(e.x - hx) > PUP.keep + 70) tx = hx + away * (PUP.keep + 20); else tx = e.x; }   /* (in the loft he works near you: his whip's length, never the far end) */
  tx = Math.max(A.gx0 + 16, Math.min(A.gx1 - 16, tx));
  if (Math.abs(tx - e.x) > 4) { e.vx = Math.sign(tx - e.x) * PUP.pace * (loftHero ? 2.2 : 1); e.x += e.vx * dt; }
  if (hero) e.face = Math.sign(hero.x - e.x) || e.face;
  e.y = A.gallery;
  return ev;
}
function restringOne(p) { for (const s of p.str) { s.cut = false; s.cutAt = null; s.retie = undefined; } p.flown = false; p.left0 = undefined; if (p.mode !== 'packed') { p.alive = true; p.hp = p.maxHp || p.hp; } else { p.alive = true; } }

/* ---------- THE STAGE ----------
   Laid into a painter-like writer (set / block / plat / ent) with its west wall at column sx and its floor at row R. FOOTPRINT: 40 columns wall to wall,
   rows R-16 .. R+1 are the stage's own, and ROW R+2 MUST BE SOLID under the whole stage (PUPPETEER2: a trapdoor opens rows R and R+1, and its pit's floor is
   R+2). Returns { arena, movers } - movers is the batten, for the level's moversExtra. */
export const STAGE = { W: 40, gallery: 9, grid: 16, door: 6 };
export function stagePuppeteer(W, T, TS, sx, R) {
  const { set, block, plat, ent } = W, G = R - STAGE.gallery, top = R - STAGE.grid, ex = sx + STAGE.W - 1;
  block(sx, sx, 0, R - 1); block(ex, ex, 0, R - 1);
  for (let y = R - STAGE.door; y <= R - 1; y++) { set(sx, y, T.AIR); set(ex, y, T.AIR); }
  block(sx, ex, 0, top);
  for (let x = sx + 1; x < ex; x++) for (let y = top + 1; y < R; y++) set(x, y, T.AIR);
  block(sx + 1, ex - 1, R, R + 1);
  set(sx + 1, R, T.AIR); set(sx + 2, R, T.AIR);
  plat(sx + 3, G, ex - sx - 3);
  ent('puppeteer', sx + 30, G - 1, { face: -1 });
  ent('marionette', sx + 16, R - 1, { face: -1 });
  ent('harlequin', sx + 24, R - 1, { face: -1 });
  ent('acrobat', sx + 20, R - 1, { face: -1 });   /* (in the flies until its act: PAIRINGS) */
  const arena = { x0: (sx + 1) * TS, x1: ex * TS, floor: R * TS, y0: (top + 1) * TS, trigger: (sx + 5) * TS, wallL: sx, wallR: ex, boss: 'puppeteer', music: 'puppeteer',
    tint: '#6a1a2a', tintA: 0.1, camFrame: true,
    stage: { gallery: G * TS, gx0: (sx + 3) * TS, gx1: ex * TS, pinX: (sx + 3) * TS + 8, sx, R } };
  const batten = { kind: 'lift', batten: true, x: (sx + 1) * TS, y: R * TS, y0: R * TS, y1: G * TS, down: R * TS, up: G * TS, w: 32, h: 8, speed: 0, st: 'down', t: 0 };
  return { arena, movers: [batten] };
}
export function buildPuppetStage({ painter, T, TS }) {
  const W = 64, H = 24, R = 20, S = R - 1, L = painter(W, H), { set, block, plat, ent } = L;
  L.floor(0, W - 1, R); block(0, 0, 0, R - 1); block(W - 1, W - 1, 0, R - 1);
  block(1, 13, 0, R - 8);
  ent('sign', 4, S, { text: 'THE MAIN STAGE. HE WORKS THEM FROM THE FLIES. CUT THE STRINGS.' });
  ent('check', 7, S);
  const { arena, movers } = stagePuppeteer({ set, block, plat, ent }, T, TS, 14, R);
  ent('gate', 58, S);
  block(54, 62, 0, R - 8);
  return { W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: S }, pools: [], falls: [], moversExtra: movers, interiors: [[1, 13, 13, S], [15, 52, 5, S], [54, 62, 13, S]], arena, gateAfterBoss: true,
    music: 'puppeteer', palette: { set: 'village', dress: 'village', sky: 'dusk', far: 'town', mid: 'town', near: 'town', nearSet: 'town', haze: 'rgba(120,40,60,0.10)' },
    ambient: [{ x0: 0, x1: 99999, kind: 'tavern' }] };
}

/* ---------- THE BOT'S READING (src/lab.js) ----------
   A HUMAN BOT (PUPPETEER2): it sees a tell or a glow only PLAN.react s after it began, it lets some glows go (PLAN.missCut), it misreads some tells
   (PLAN.missDodge), and now and then it swings too early and finds a decoy (PLAN.eager). It cannot see a glow while dazzled.
   s = { P: { x, y, face, ground, snare, atk, dazzle }, e, show, reach, shield, onBatten, t (seconds), rng (a seeded 0..1), mem (kept between frames) } */
export const PLAN = { react: 0.25, missCut: 0.25, missDodge: 0.12, eager: 0.08 };
export function puppetPlan(s) { const out = planOf(s), P = s.P, A = s.show.A;
  /* in a trapdoor's pit, going somewhere: jump out */
  if (P.ground && P.y > A.floor + 8 && out.gx != null && Math.abs(out.gx - P.x) > 8) out.jump = true;
  return out; }
function planOf(s) {
  const { P, e, show, reach } = s, A = show.A, out = { gx: null, face: P.face, atk: false, jump: false, down: false, drop: false, block: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map();
  if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  /* THE EYE: a thing is seen PLAN.react s after it began; each thing is judged once (a miss is a miss for the whole of it) */
  const seenFor = key => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= PLAN.react; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const keyOf = p => (p.t || 'him') + '|' + p.mode + '|' + (p.tellId || 0);
  const sees = p => seenFor(keyOf(p)), dodges = p => sees(p) && !roll(keyOf(p) + '|d', PLAN.missDodge);
  const onGal = Math.abs(P.y - A.gallery) < 6 && P.ground, onStage = P.y > A.gallery + 20;
  const bat = show.batten, blind = (P.dazzle || 0) > 0, blade = P.y - 9, clampX = x => Math.max(A.x0 + 12, Math.min(A.x1 - 12, x));
  const crossOf = q => { const k = q.y1 === q.y0 ? 1 : Math.max(0, Math.min(1, (blade - q.y0) / (q.y1 - q.y0))); return { x: q.x0 + (q.x1 - q.x0) * k, y: q.y0 + (q.y1 - q.y0) * k }; };
  const allStr = stringsOf(e, show).filter(q => !q.decoy);
  const pups = show.puppets.filter(p => p.alive && p.mode !== 'packed' && !heaped(p));
  const sameH = p => Math.abs((p.floorY ?? p.y) - P.y) < 10 || Math.abs(p.y - P.y) < 10;
  /* ---- 1. HIS OWN: the sandbag's shadow and the scenery's band - out from under; the spotlight - out of its landing ---- */
  const M = show.mine;
  if (M && e.mode === M.k + 'Tell' && !onGal && dodges(e)) { const half = PUP[M.k + 'Half'] || 20;
    if (Math.abs(M.x - P.x) < half + (M.k === 'spot' ? 12 : 40) && (M.k !== 'spot' || e.modeT < 0.6)) { const room = half + 50, side = M.x - A.x0 < room ? 1 : A.x1 - M.x < room ? -1 : (P.x < M.x ? -1 : 1);
      out.gx = clampX(M.x + side * (half + (M.k === 'spot' ? 24 : 44))); out.why = 'out from under ' + M.k; return out; } }
  /* ---- 2. THE LOFT'S: his snare and his whip ---- */
  if (show.snare && onGal && Math.abs(show.snare.x - P.x) < PUP.snareR + 12 && dodges(e)) { out.gx = show.snare.x + (P.x < show.snare.x ? -34 : 34); out.why = 'snare'; return out; }
  const wk = e.mode === 'whipLowTell' ? 'low' : e.mode === 'whipHighTell' ? 'high' : e.mode === 'whip' ? e.whipKind : null;
  if (wk && onGal && (e.mode === 'whip' || dodges(e))) { if (wk === 'low' && (e.mode === 'whip' || e.modeT < 0.2)) out.jump = true; if (wk === 'high' && (e.mode === 'whip' || e.modeT < 0.3)) { out.down = true; out.why = 'duck the whip'; return out; } }
  /* ---- 3a. HE IS COMING DOWN (his line, or dragged by the masterpiece): be where he lands ---- */
  if (['descendTell', 'descend', 'yanked'].includes(e.mode) && sees(e) && onStage) { const lx = e.mode === 'yanked' ? e.yankX : e.x, d = lx - P.x; out.face = Math.sign(d) || 1; out.gx = Math.abs(d) > reach - 6 ? clampX(lx - out.face * (reach - 10)) : null; out.why = 'under him'; return out; }
  if (e.mode === 'yanked' && onGal) { out.drop = true; out.why = 'down after him'; return out; }
  /* ---- 3. HE IS OPEN: to him, and cut ---- */
  if (pupOpen(e) && sees(e)) { const hisFloor = e.y > A.gallery + 20 ? 'stage' : 'loft';
    if ((hisFloor === 'stage' && onStage) || (hisFloor === 'loft' && onGal)) { const d = e.x - P.x; out.face = Math.sign(d) || 1; out.gx = Math.abs(d) > reach - 4 ? e.x - out.face * (reach - 8) : null; out.atk = Math.abs(d) < reach + 8; out.why = 'open'; return out; }
    if (hisFloor === 'loft' && onStage) return climb(out, P, A, bat, s);
    if (hisFloor === 'stage' && onGal) { out.drop = true; out.why = 'down to him'; return out; } }
  /* ---- 4. A PUPPET'S BLOW COMING: the most imminent one near you. Decided once, as its windup is seen: GO FOR THE STRING (walk in, swing at the gold)
     or ANSWER IT (block, back off, jump, duck, step out of the shadow). Either can be fumbled: missed glows, misread tells ---- */
  const threats = pups.filter(p => { const k = tellOf(p.mode) || p.mode; return (MOVES[k] || ['swat', 'stomp', 'reach'].includes(k)) && (/Tell$/.test(p.mode) || BLOWS.includes(p.mode)) && sees(p); })
    .filter(p => p.mode.startsWith('drop') || p.mode.startsWith('stomp') || p.mode.startsWith('reach') || (sameH(p) && Math.abs(p.x - P.x) < 110))
    .sort((a, b) => (/Tell$/.test(a.mode) ? a.modeT : 0) - (/Tell$/.test(b.mode) ? b.modeT : 0));
  for (const p of threats) {
    const k = tellOf(p.mode) || p.mode, tell = /Tell$/.test(p.mode), key = keyOf(tell ? p : { ...p, mode: k + 'Tell' }), Mv = MOVES[k] || {};
    const cut = tell && !blind && !roll(key + '|c', PLAN.missCut) && k !== 'stomp' && k !== 'drop';
    if (cut) { const mine = allStr.filter(q => q.p === p).map(q => ({ q, c: crossOf(q) })).filter(o => Math.abs(o.c.y - blade) < 7).sort((a, b) => Math.abs(a.c.x - P.x) - Math.abs(b.c.x - P.x))[0];
      if (mine) { const d = mine.c.x - P.x, gold = mine.q.taut && seenFor('g|' + key); out.face = Math.sign(d) || P.face;
        if (Math.abs(d) > reach - 6) out.gx = mine.c.x - out.face * (reach - 10);
        out.atk = gold && Math.abs(d) < reach - 2; out.why = gold ? 'cut' : 'in for the string';
        /* too late to cut: the blow is landing - answer it after all */
        if (!(p.modeT < (Mv.h === 'high' || k === 'spin' ? 0.24 : 0.1) && !out.atk)) return out; } }
    if (!dodges(p)) continue;
    const near = Math.abs(p.x - P.x) < (Mv.reach || 40) + 16;
    if (k === 'drop' && Math.abs(p.x - P.x) < MOVES.drop.reach + 40) { const side = p.x - A.x0 < 90 ? 1 : A.x1 - p.x < 90 ? -1 : (P.x < p.x ? -1 : 1); out.gx = clampX(p.x + side * 44); out.why = 'the drop'; return out; }
    if (k === 'stomp' && Math.abs(p.stompX - P.x) < PUP.stompHalf + 14) { out.gx = clampX(p.stompX + (P.x < p.stompX ? -50 : 50)); out.why = 'the stomp'; return out; }
    if (k === 'reach' && Math.abs((p.reachY || A.gallery) - P.y) < 6 && (!tell || p.modeT < 0.35)) { out.down = true; out.why = 'duck the reach'; return out; }
    if (!near) continue;
    if (Mv.h === 'high' && (!tell || p.modeT < 0.25)) { out.down = true; out.why = 'duck ' + k; return out; }
    if (k === 'spin' && (!tell || p.modeT < 0.18) && P.ground) { out.jump = true; out.why = 'jump the spin'; return out; }
    if ((k === 'chop' || k === 'swat') && s.shield && (!tell || p.modeT < 0.35)) { out.block = true; out.face = Math.sign(p.x - P.x) || 1; out.why = 'block'; return out; }
    if (k === 'chop' || k === 'swat') { out.gx = clampX(p.x + (P.x < p.x ? -1 : 1) * ((Mv.reach || PUP.swatReach) + 24)); out.why = 'back off'; return out; }
    if (tell) { out.gx = P.x; out.why = 'wait for it'; return out; }
  }
  /* ---- 4b. A GLOW THAT IS NO BLOW'S (a drop just landed, a puppet being flown): go and cut it, if you catch it ---- */
  if (!blind) { const g = allStr.filter(q => q.taut && !q.lowering && !/Tell$/.test(q.p.mode) && !BLOWS.includes(q.p.mode)).map(q => ({ q, c: crossOf(q) })).filter(o => Math.abs(o.c.y - blade) < 7 && Math.abs(o.c.x - P.x) < 80)
      .sort((a, b) => Math.abs(a.c.x - P.x) - Math.abs(b.c.x - P.x))[0];
    if (g && !roll(keyOf(g.q.p) + '|c', PLAN.missCut)) { const d = g.c.x - P.x; out.face = Math.sign(d) || P.face; if (Math.abs(d) > reach - 6) out.gx = g.c.x - out.face * (reach - 10); out.atk = Math.abs(d) < reach - 2 && seenFor('g|' + keyOf(g.q.p)); out.why = 'cut the landed one'; return out; } }
  /* ---- 5. A NEW STRING COMING DOWN (always gold): cut it if it is near ---- */
  const low = !blind && allStr.find(q => q.lowering);
  if (low) { const c = crossOf(low); if (Math.abs(c.y - blade) < 7 && Math.abs(c.x - P.x) < 90) { const d = c.x - P.x; out.face = Math.sign(d) || P.face; if (Math.abs(d) > reach - 6) out.gx = c.x - out.face * (reach - 10); out.atk = Math.abs(d) < reach - 2 && seenFor('low|' + (show.n.lowerCut)); out.why = 'the new string'; return out; } }
  /* ---- EAGER: now and then a swing at a puppet's windup before the gold - and the grey decoy is in the way ---- */
  const early = pups.find(p => /Tell$/.test(p.mode) && p.decoy && Math.abs(p.x - P.x) < reach + 6 && sees(p) && roll(keyOf(p) + '|e', PLAN.eager));
  if (early && P.atk < 0) { out.face = Math.sign(early.x - P.x) || 1; out.atk = true; out.why = 'too early'; return out; }
  /* ---- 6. UP TO THE LOFT from phase 2 ---- */
  if (e.phase >= 2 && onStage && pups.length) return climb(out, P, A, bat, s);
  if (onGal) { const cross = allStr.map(q => crossOf(q).x).filter(x => x > A.gx0 + 8 && x < A.gx1 - 8).sort((a, b) => Math.abs(a - P.x) - Math.abs(b - P.x))[0];
    if (cross !== undefined) { const side = Math.sign(P.x - cross) || 1; out.gx = cross + side * (reach - 10); out.face = -side; out.why = 'wait at a string'; return out; } }
  /* ---- 7. WAIT just outside the nearest puppet's reach, facing it ---- */
  const tp = pups.filter(p => sameH(p)).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
  const half = tp && tp.t !== 'masterpiece' && stringsLeft(tp) < STRINGS[tp.t].length && allStr.filter(q => q.p === tp).map(q => crossOf(q)).find(c => Math.abs(c.y - blade) < 7);
  if (half) { const side = Math.sign(P.x - half.x) || 1; out.gx = clampX(half.x + side * (reach - 10)); out.face = -side; out.why = 'on the half-cut one'; return out; }
  if (tp) { const side = Math.sign(P.x - tp.x) || 1, r = tp.t === 'masterpiece' ? PUP.swatRange : Math.max(20, ...Object.keys(MOVES).filter(k => MOVES[k].who === tp.t && MOVES[k].lvl <= (tp.lvl || 0) && k !== 'drop').map(k => MOVES[k].range));
    out.gx = clampX(tp.x + side * (r + 6)); out.face = -side; out.why = 'wait'; }
  return out;
}
function climb(out, P, A, bat, s) {
  if (!bat) return out;
  const onBat = s.onBatten, mid = bat.x + bat.w / 2;
  if (bat.st === 'down' && !onBat) { out.gx = mid - 4; out.face = 1; out.why = 'to the batten'; return out; }
  if (bat.st === 'down' && onBat) { out.gx = mid - 4; out.face = 1; out.atk = !(bat.t > 0); out.why = 'strike the pin rail'; return out; }
  if (onBat && bat.st !== 'down') { out.gx = null; out.why = 'ride'; if (bat.st === 'up') { out.gx = bat.x + bat.w + 24; out.why = 'step off'; } return out; }
  out.gx = mid + 40; out.why = 'wait for the batten'; return out;
}

/* ---------- THE FRAME each body shows (src/redraw/puppeteer_art.js) ---------- */
export function pupFrame(e) {
  const a = e.anim || 0, m = e.mode || '';
  if (e.t === 'puppeteer') {
    if (m === 'whipLowTell' || m === 'whipHighTell' || m === 'sceneryTell') return PUP_F.tell;
    if (m === 'whip') return PUP_F.whip;
    if (m === 'snareTell' || m === 'sandbagTell' || m === 'spotTell') return PUP_F.snareTell;
    if (m === 'descendTell' || m === 'descend' || m === 'yanked') return PUP_F.ride;
    if (m === 'ascend' || m === 'climb') return PUP_F.climb;
    if (m === 'restring') return PUP_F.restring[Math.floor(a * 4) % 2];
    if (m === 'fallen') return PUP_F.fallen;
    if (m === 'cutLine') return PUP_F.cut;
    if (e.flash > 0.05) return PUP_F.hurt;
    return PUP_F.work[Math.floor(a * 3) % 2];
  }
  if (e.t === 'masterpiece') {
    if (m === 'heap' || m === 'collapse') return MP_F.heap;
    if (m === 'swatTell') return MP_F.swatTell; if (m === 'swat') return MP_F.swat;
    if (m === 'stompTell') return MP_F.stompTell; if (m === 'stomp') return MP_F.stomp;
    if (m === 'reachTell') return MP_F.reachTell; if (m === 'reach') return MP_F.reach;
    if (m === 'stagger') return MP_F.stagger;
    if (Math.abs(e.vx || 0) > 2) return MP_F.walk[Math.floor(a * 4) % 2];
    return MP_F.hang;
  }
  if (m === 'heap' || m === 'collapse') return MAR_F.heap;
  if (m === 'fall' || m === 'dropTell' || m === 'drop' || m === 'fly' || m === 'lowerIn') return MAR_F.drop;
  const k = tellOf(m) || m;
  if (MOVES[k] && MOVES[k].h === 'high') return m.endsWith('Tell') ? MAR_F.highTell : MAR_F.high;
  if (m.endsWith('Tell')) return MAR_F.tell;
  if (BLOWS.includes(m)) return MAR_F.blow;
  if (m === 'stagger' || m === 'land') return MAR_F.stagger;
  if (m === 'rise') return MAR_F.rise;
  if (Math.abs(e.vx || 0) > 2) return MAR_F.hop[Math.floor(a * 5) % 2];
  return MAR_F.hang;
}
