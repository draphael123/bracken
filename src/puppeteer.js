// src/puppeteer.js - THE PUPPETEER, the boss of THE MASKWRIGHT'S THEATRE (claude/puppeteer; Daniel approved the level and the boss 2026-09-30).
// The theatre's MAIN STAGE is his arena: a stage floor, and nine rows over it THE FLY GALLERY (a catwalk hung from the grid), where he stands and
// works his marionettes on long strings. The fight's one rule is the level's: CUT THE STRINGS.
//
// THE RULE. His puppets are wood: a blow on a body clacks and does nothing. Every puppet hangs on STRINGS that run up to the control bar in his
// hands, and a string can be cut - but only while it is TAUT, and a string is taut exactly when the puppet is doing something: through every
// windup and every blow (and the whole time it is flown up off the floor), when it glows gold. So the answer to every puppet's blow is the same
// question: block it / jump it / get out of it - or step in and cut the glowing string, which cancels the blow and staggers it. A small puppet
// has two strings; the second cut drops it in a heap.
// He is out of reach up in the loft, and there his hands on the bars guard him: a blow that does reach him lands at PUP.ward. The OPENINGS are
// caused, every one of them by cutting (rule A11), and every one is said in the hint box (src/hint-lines.js, never number()):
//
//   PHASE 1  THE PLAY     (full to 2/3)  two marionettes on the stage floor - THE SOLDIER (a told chop the shield turns, !) and THE HARLEQUIN (a told
//                                        spinning kick along the floor, !!: jump it) - and THE DROP (!!): he hoists one of them over you and lets it
//                                        fall, its shadow on the boards under you. Cut BOTH down and his hands are empty: he rides his fly line down
//                                        to the stage to tie them back on, and kneels there RE-STRINGING - open, PUP.openMul, for PUP.restringT s.
//                                        One puppet down and the other still dancing, he lowers a new string to the heap from the loft (told, slow,
//                                        and it can be cut on the way down).
//   PHASE 2  THE LOFT     (2/3 to 1/3)   he cuts his own fly line (he will not come down again) and THE COUNTERWEIGHT comes free: stand on the batten at
//                                        the stage's west wall and strike the PIN RAIL beside it, and the sandbag drops and the batten flies you up to
//                                        the gallery. Up there his marionettes are FLOWN up to your floor (taut while they are hauled, and in every windup), and
//                                        he fights with the strings themselves: THE WHIP (!!, low - jump - or high - duck, along the catwalk) and THE
//                                        SNARE (!!, a loop drawn on the boards at your feet: step out of it, or be caught and pulled - mash to break
//                                        free). Cut both flown puppets down and he re-strings them where he stands: open, as below.
//   PHASE 3  THE MASTERPIECE (1/3 to 0)  he packs the two away and lowers his own masterpiece onto the stage: a giant marionette, twice a man's height,
//                                        on FOUR strings from a great crossbar. THE SWAT (!, a shield turns the flat of its hand), THE STOMP (!!, its
//                                        foot comes down where it marked you) and, while you are in the loft, THE REACH (!!, its hand swept along the
//                                        catwalk at head height: duck). Cut all four and it falls - and the crossbar drags him off the gallery with
//                                        it: he lands on the stage, tangled, OPEN for PUP.fallT s at PUP.fallMul. Then he climbs back and rigs it again.
// Health is never the lever: every phase is a new thing asked, and every window is one the player made.
//
// PURE: no DOM, no main.js. The world is a context `c` (src/puppeteer-hands.js binds it); the frame's events are returned for tools/puppeteer.mjs,
// which proves every line above in Node and in the page. The stage itself is laid by stagePuppeteer (the theatre's level calls it for its main
// stage; buildPuppetStage is the standalone arena, level 'puppetstage', that the boss is tested in until the theatre lands).

export const PUP = {
  hp: 720, w: 16, h: 40, markH: 50,
  ward: 0.2, openMul: 1.25, fallMul: 1.4,
  // PHASE 1: his opening
  descendTell: 1.0, descendT: 0.9, restringT: 2.8, ascendT: 1.0,
  lonelyT: 6.5, lowerT: 2.6,          // one puppet alone this long, and a new string starts down to the other (it takes lowerT to reach the heap)
  riseT: 0.8,                          // a heap coming back up on its new strings
  // THE PUPPETS
  hopT: 0.22, hopRest: 0.18,          // jerky: a hop of hopT, a rest of hopRest
  soldierSpeed: 70, harlequinSpeed: 96,
  chopTell: 0.7, chopT: 0.22, chopReach: 30, chopRange: 34,
  spinTell: 0.85, spinT: 0.4, spinReach: 42, spinRange: 48, spinTop: 12,
  dropTell: 1.0, dropT: 0.3, dropHalf: 16, dropEvery: 3,   // every dropEvery-th puppet blow in phase 1 is THE DROP
  recoverT: 0.55, staggerT: 0.9, limp: 0.6,
  gapT: [1.3, 1.1, 0.9],              // the rest between one puppet blow and the next (the puppets take turns: one blow at a time)
  flySpeed: 170,
  // PHASE 2: the loft
  cutLineT: 1.3,
  whipEvery: 3.4, whipFirst: 2.2, whipTell: 0.9, whipT: 0.35, whipReach: 240,
  snareEvery: 7.5, snareFirst: 4.5, snareTell: 0.9, snareR: 14, snareHold: 1.3,
  lowTop: 10, highTop: 24, highBot: 10,   // THE WHIP'S BANDS (as the Wicker Queen's ribbons): low jumps, high ducks
  loftRestringT: 2.8,
  pace: 26,                           // px/s he walks along the gallery
  keep: 72,                           // in the loft he keeps this far from you, backing along the gallery while he can
  // PHASE 3: the masterpiece
  masterTell: 2.2, mW: 34, mH: 92, mSpeed: 34,
  swatTell: 0.9, swatT: 0.3, swatReach: 58, swatRange: 64,
  stompTell: 1.1, stompT: 0.25, stompHalf: 24,
  reachTell: 1.0, reachT: 0.45, reachSpan: 200,
  mGap: [1.2, 1.2, 1.0],
  yankT: 0.7, fallT: 4.0, climbT: 1.4, rerigT: 3.0,
  // THE STRINGS: a blow in a box that crosses a taut, uncut string cuts it
  dmg: { chop: 16, spin: 18, drop: 22, whip: 18, snare: 12, swat: 20, stomp: 26, reach: 20 },
  p2: 2 / 3, p3: 1 / 3,
};
/* the three kinds of puppet he works, and the strings each hangs on (the attach point on the body: dx along its face, up from its feet) */
export const PUPPETS = { marionette: { w: 12, h: 30 }, harlequin: { w: 12, h: 28 }, masterpiece: { w: PUP.mW, h: PUP.mH } };
export const STRINGS = {
  marionette: [{ k: 'sword hand', dx: 7, up: 12 }, { k: 'shield hand', dx: -6, up: 12 }],   /* at the hands, low, where every hero's blow from the boards reaches (the pyromancer's staff and the warden's point are the lowest, 15-16 px up) */
  harlequin: [{ k: 'hand', dx: 6, up: 12 }, { k: 'knee', dx: -3, up: 8 }],
  masterpiece: [{ k: 'left hand', dx: -18, up: 38 }, { k: 'right hand', dx: 18, up: 38 }, { k: 'head', dx: 0, up: 94 }, { k: 'back', dx: -6, up: 70 }],   /* the hands a jump reaches from the boards; the head and the back only from the gallery, where they pass the catwalk */
};
export const isPuppet = e => !!e && (e.t === 'marionette' || e.t === 'harlequin' || e.t === 'masterpiece');
/* the frames of the sprites in src/redraw/puppeteer_art.js */
export const PUP_F = { work: [0, 1], tell: 2, whip: 3, snareTell: 4, ride: 5, restring: [6, 7], fallen: 8, climb: 9, hurt: 10, dead: 11, cut: 12 };
export const MAR_F = { hang: 0, hop: [1, 2], tell: 3, blow: 4, stagger: 5, heap: 6, rise: 7, drop: 8 };
export const MP_F = { hang: 0, walk: [1, 2], swatTell: 3, swat: 4, stompTell: 5, stomp: 6, reachTell: 7, reach: 8, stagger: 9, heap: 10 };

export const pupPhase = e => (e.hp <= e.maxHp * PUP.p3 ? 3 : e.hp <= e.maxHp * PUP.p2 ? 2 : 1);
export const pupOpen = e => !!e && (e.mode === 'restring' || e.mode === 'fallen');
/* WHAT A BLOW ON HIM IS WORTH: re-stringing (his hands full of string), PUP.openMul; fallen with his masterpiece, PUP.fallMul; the rest of the time his
   hands are on the bars and the bars take it: PUP.ward */
export const pupTake = e => (e.mode === 'fallen' ? PUP.fallMul : e.mode === 'restring' ? PUP.openMul : PUP.ward);
export const PUP_TELLS = ['whipLowTell', 'whipHighTell', 'snareTell', 'descendTell', 'masterTell'];
/* THE WHIP'S BAND in world y, from the floor it runs along: [top, bottom] */
export const whipBand = (kind, floor) => (kind === 'low' ? [floor - PUP.lowTop, floor] : [floor - PUP.highTop, floor - PUP.highBot]);
export const bandCatches = (kind, floor, box) => { const [t, b] = whipBand(kind, floor); return box.b > t && box.t < b; };
export const WHIP_ORDER = ['low', 'high', 'high', 'low', 'high', 'low', 'low', 'high'];

/* ---------- THE STRINGS ---------- */
/* is this puppet's string taut now (it glows, and it can be cut)? Through every windup and every blow, and while it is being flown up or let down */
export const pupTaut = p => { if (!p || !p.alive) return false; const m = p.mode || '';
  if (m === 'heap' || m === 'fall' || m === 'packed' || m === 'collapse' || m === 'lower') return false;
  return m.endsWith('Tell') || m === 'chop' || m === 'spin' || m === 'drop' || m === 'swat' || m === 'stomp' || m === 'reach' || m === 'fly'; };   /* (flown up to the gallery, the same rule: taut while it is hauled, and in its windups) */
/* the control bar in his hands: where every string starts. The masterpiece hangs from a crossbar twice as wide */
export function barOf(e, big) { const y = e.y - (e.mode === 'restring' ? 16 : 34);
  return big ? { x0: e.x - 22, x1: e.x + 22, y } : { x0: e.x - 7, x1: e.x + 7, y }; }
/* EVERY STRING NOW, as segments: { p, i, k, x0, y0, x1, y1, taut, cut }. Cut strings are left out (a cut end is drawn by the hands from p.str[i].cutAt) */
export function stringsOf(e, show) {
  const out = []; if (!e || !show) return out;
  for (const p of show.puppets) { if (!p.alive || p.mode === 'packed' || p.mode === 'lower' && p.t !== 'masterpiece') continue;
    const S = STRINGS[p.t], big = p.t === 'masterpiece', bar = barOf(e, big), taut = pupTaut(p);
    S.forEach((s, i) => { const st = p.str[i]; if (!st || st.cut) return;
      const n = S.length, x0 = bar.x0 + (bar.x1 - bar.x0) * (n === 1 ? 0.5 : i / (n - 1)), f = p.face || 1;
      out.push({ p, i, k: s.k, x0, y0: bar.y, x1: p.x + s.dx * f, y1: p.y - s.up, taut, cut: false }); }); }
  if (show.lowering) { const q = show.lowering, bar = barOf(e, false), k = Math.min(1, 1 - q.t / PUP.lowerT), p = q.p;
    const tx = p.x, ty = p.y - 6; out.push({ p, i: -1, k: 'new', x0: bar.x0 + 7, y0: bar.y, x1: bar.x0 + 7 + (tx - bar.x0 - 7) * k, y1: bar.y + (ty - bar.y) * k, taut: true, cut: false, lowering: true }); }
  return out;
}
/* does the segment (x0,y0)-(x1,y1) cross the box {l,r,t,b}? (Liang-Barsky) */
export function segHitsBox(x0, y0, x1, y1, b) {
  let t0 = 0, t1 = 1; const dx = x1 - x0, dy = y1 - y0;
  for (const [p, q] of [[-dx, x0 - b.l], [dx, b.r - x0], [-dy, y0 - b.t], [dy, b.b - y0]]) {
    if (p === 0) { if (q < 0) return false; continue; }
    const r = q / p; if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; } }
  return t0 <= t1;
}
/* A BLOW IN BOX hb: a taut, uncut string it crosses is cut - one string of each puppet a swing (`seen` is the swing's hit set, so a swing held over
   several frames still cuts one). Returns the cuts: [{ p, k }] */
export function strikeStrings(e, show, hb, seen) {
  const cuts = []; if (!e || !show || !hb) return cuts;
  const once = seen || new Set();   /* ONE STRING OF A PUPPET A SWING: the second is the second blow (a swing through both hands parts only one) */
  for (const s of stringsOf(e, show)) { if (!s.taut) continue; const tag = s.lowering ? show.lowering : s.p.str[s.i], pt = s.p.strTag || (s.p.strTag = {});
    if (once.has(tag) || (!s.lowering && once.has(pt))) continue;
    if (!segHitsBox(s.x0, s.y0, s.x1, s.y1, hb)) continue;
    once.add(tag); if (!s.lowering) once.add(pt);
    if (s.lowering) { show.lowering = null; show.n.lowerCut++; cuts.push({ p: s.p, k: 'new' }); continue; }
    s.p.str[s.i].cut = true; s.p.str[s.i].cutAt = { x: (s.x0 + s.x1) / 2, y: (s.y0 + s.y1) / 2 }; show.n.cut++; cuts.push({ p: s.p, k: s.k }); }
  return cuts;
}
export const stringsLeft = p => (p.str || []).filter(s => !s.cut).length;
export const heaped = p => !p.alive || p.mode === 'heap' || p.mode === 'fall' || p.mode === 'collapse' || p.mode === 'packed';

/* ---------- THE COUNTERWEIGHT (phase 2 on): the batten at the west wall and the pin rail beside it ---------- */
/* b = { x, w, down, up, y, st: 'down'|'rise'|'up'|'lower', t } - y is the batten's top (a mover's y). Strike the pin rail while it is down and free: the
   sandbag drops, the batten flies up to the gallery (0.9 s), holds there PUP.battenHold s, and is lowered again at a walk */
export const BATTEN = { riseSpeed: 170, lowerSpeed: 60, hold: 4.5, cool: 0.8 };
export function pinStrike(b, free) {
  if (!free) return 'locked';
  if (b.st !== 'down' || b.t > 0) return 'busy';
  b.st = 'rise'; return 'free';
}
export function stepBatten(b, dt) {
  b.t = Math.max(0, (b.t || 0) - dt);
  if (b.st === 'rise') { b.y = Math.max(b.up, b.y - BATTEN.riseSpeed * dt); if (b.y <= b.up) { b.st = 'up'; b.t = BATTEN.hold; } }
  else if (b.st === 'up') { if (b.t <= 0) b.st = 'lower'; }
  else if (b.st === 'lower') { b.y = Math.min(b.down, b.y + BATTEN.lowerSpeed * dt); if (b.y >= b.down) { b.st = 'down'; b.t = BATTEN.cool; } }
  return b.y;
}
/* how far down the sandbag hangs (0 = up in the flies, 1 = on the stage): it falls as the batten rises */
export const sandbagK = b => (b.down === b.up ? 0 : (b.down - b.y) / (b.down - b.up));

/* ---------- THE SHOW: his state for the whole fight ---------- */
/* A = { x0, x1, floor, gallery, gx0, gx1 } (world px): the stage between its walls, its floor, the gallery's boards and their ends */
export function newShow(A) {
  return { A, puppets: [], turn: 0, gap: 1.2, blows: 0, lonely: 0, lowering: null, snare: null, whip: null, line: true, free: false, master: null,
    n: { cut: 0, lowerCut: 0, descend: 0, restring: 0, loftRestring: 0, drop: 0, chop: 0, spin: 0, whip: 0, snare: 0, snared: 0, swat: 0, stomp: 0, reach: 0, fall: 0, fly: 0, rerig: 0, pin: 0 } };
}
export function newPuppet(p, show) {
  const S = STRINGS[p.t]; p.str = S.map(() => ({ cut: false })); p.mode = p.t === 'masterpiece' ? 'lower' : 'hang'; p.modeT = 0; p.anim = 0; p.vx = 0;
  p.hopT = 0; p.flown = false; p.floorY = show.A.floor; p.face = p.face || -1; p.puppet = true; show.puppets.push(p); return p;
}
export function newPuppeteer(e) {
  return Object.assign(e, { mode: 'sleep', modeT: 0, phase: 1, open: 0, whipCd: PUP.whipFirst, snareCd: PUP.snareFirst, whipN: 0, whipKind: null, whipR: 0,
    home: e.x, anim: 0, vx: 0, onStage: false });
}
/* WHICH FLOOR IS THIS HERO ON: the gallery's boards or the stage (in the air, the last floor he stood on) */
export function heroFloor(show, h) { const A = show.A;
  if (h.ground && Math.abs(h.y - A.gallery) < 6) return A.gallery;   /* (the batten, up, is the gallery's floor too) */
  if (h.ground && h.y > A.gallery + 20) return A.floor;
  return h.lastFloor || A.floor; }

/* ---------- ONE PUPPET'S FRAME ---------- */
function puppetStep(p, e, show, dt, c, ev, hero, myTurn) {
  const A = show.A; p.anim = (p.anim || 0) + dt; p.modeT -= dt; p.vx = 0;
  const big = p.t === 'masterpiece';
  /* A STRING JUST CUT: the blow it was pulling is cancelled and the puppet staggers on what it has left (it stops holding the turn) */
  const left = stringsLeft(p); if (p.left0 === undefined) p.left0 = left;
  if (left < p.left0 && left > 0 && !heaped(p)) { if (/Tell$/.test(p.mode) || ['chop', 'spin', 'drop', 'swat', 'stomp', 'reach'].includes(p.mode)) { ev.push({ t: 'cancel', p, was: p.mode }); if (p.mode === 'dropTell' || p.mode === 'drop') { p.mode = 'fall'; p.vy = 0; } else { p.mode = 'stagger'; p.modeT = PUP.staggerT; } }
    else if (p.mode === 'hang' || p.mode === 'fly') { p.mode = 'stagger'; p.modeT = PUP.staggerT * 0.6; } c.say(big ? 'A STRING PARTS' : 'CUT', '#8fd160'); }
  p.left0 = left;
  const m = p.mode;
  /* a puppet with every string cut goes down, wherever it was */
  if (!heaped(p) && m !== 'lower' && m !== 'rise' && stringsLeft(p) === 0) {
    if (big) { p.mode = 'collapse'; p.modeT = 0.6; ev.push({ t: 'collapse', p }); c.sound('collapse'); return; }
    p.mode = p.y < A.floor - 4 ? 'fall' : 'heap'; p.vy = 0; p.flown = false; ev.push({ t: 'heap', p }); c.sound('heap'); c.say('IT FALLS', '#8fd160'); return; }
  switch (m) {
    case 'packed': return;
    case 'fall': p.vy = (p.vy || 0) + 900 * dt; p.y = Math.min(A.floor, p.y + p.vy * dt); if (p.y >= A.floor) { p.mode = stringsLeft(p) ? 'stagger' : 'heap'; p.modeT = PUP.staggerT; p.flown = false; c.sound('heap'); } return;
    case 'heap': p.y = A.floor; return;
    case 'collapse': if (p.modeT <= 0) p.mode = 'heap'; return;
    case 'lower': p.y = Math.min(A.floor, p.y + 90 * dt); if (p.y >= A.floor) { p.mode = 'hang'; p.modeT = 0.4; } return;
    case 'rise': if (p.modeT <= 0) { p.mode = 'hang'; p.modeT = 0.3; } return;
    case 'stagger': if (p.modeT <= 0) { p.mode = 'hang'; p.modeT = 0.2; } else if (p.flown && stringsLeft(p)) p.y = p.floorY; return;
    case 'recover': if (p.modeT <= 0) { p.mode = 'hang'; p.modeT = 0; show.turn = 0; show.gap = big ? PUP.mGap[(e.phase || 1) - 1] : PUP.gapT[(e.phase || 1) - 1]; } return;
  }
  const floor = big ? A.floor : hero ? heroFloor(show, hero) : A.floor;
  /* FLOWN: a small puppet goes to the floor its hero is on - hauled up to the gallery on its strings, or let down again */
  if (!big && Math.abs(p.y - floor) > 3 && (m === 'hang' || m === 'fly')) {
    if (m !== 'fly') { p.mode = 'fly'; show.n.fly++; ev.push({ t: 'fly', p, up: floor < p.y }); c.sound('fly'); }
    const d = floor - p.y, s = Math.sign(d) * Math.min(Math.abs(d), PUP.flySpeed * dt); p.y += s;
    if (hero) { const dx = hero.x - p.x; p.face = Math.sign(dx) || p.face; p.x += Math.sign(dx) * Math.min(Math.abs(dx) * 0.5, 60 * dt); }
    return; }
  if (m === 'fly') { p.mode = 'hang'; p.y = floor; }
  p.flown = floor < A.floor - 4; p.floorY = floor; p.y = floor;
  const slow = !big && stringsLeft(p) < STRINGS[p.t].length ? PUP.limp : 1;
  switch (m) {
    case 'chopTell': if (p.modeT <= 0) { p.mode = 'chop'; p.modeT = PUP.chopT; show.n.chop++; ev.push({ t: 'chop', p }); c.sound('chop');
      const f = p.face, bx = f > 0 ? [p.x, p.x + PUP.chopReach] : [p.x - PUP.chopReach, p.x]; c.hit([bx[0], bx[1], p.y - 30, p.y], PUP.dmg.chop, 'THE SOLDIER', { from: p.x }); } return;
    case 'spinTell': if (p.modeT <= 0) { p.mode = 'spin'; p.modeT = PUP.spinT; show.n.spin++; ev.push({ t: 'spin', p }); c.sound('spin');
      c.hit([p.x - PUP.spinReach, p.x + PUP.spinReach, p.y - PUP.spinTop, p.y], PUP.dmg.spin, 'THE HARLEQUIN', { from: p.x, unblockable: true }); } return;
    case 'dropTell': {   /* hoisted over the hero, its shadow on the boards: it follows him for the first two-thirds, then it is let go where it is */
      if (hero && p.modeT > PUP.dropTell / 3) p.dropX += Math.sign(hero.x - p.dropX) * Math.min(Math.abs(hero.x - p.dropX), 110 * dt);
      p.x = p.dropX; p.y = p.floorY - 70 * Math.min(1, (PUP.dropTell - p.modeT) / 0.3);
      if (p.modeT <= 0) { p.mode = 'drop'; p.modeT = PUP.dropT; p.vy = 0; show.n.drop++; ev.push({ t: 'drop', p }); c.sound('dropFall'); }
      return; }
    case 'drop': p.vy = (p.vy || 0) + 1600 * dt; p.y = Math.min(p.floorY, p.y + p.vy * dt);
      if (p.y >= p.floorY) { p.y = p.floorY; if (!p.dropHit) { p.dropHit = true; c.sound('dropLand'); c.hit([p.x - PUP.dropHalf, p.x + PUP.dropHalf, p.floorY - 40, p.floorY], PUP.dmg.drop, 'THE DROP', { from: p.x, unblockable: true, up: true }); }
        p.mode = 'recover'; p.modeT = PUP.recoverT; p.dropHit = false; }
      return;
    case 'swatTell': if (p.modeT <= 0) { p.mode = 'swat'; p.modeT = PUP.swatT; show.n.swat++; ev.push({ t: 'swat', p }); c.sound('swat');
      const f = p.face, bx = f > 0 ? [p.x, p.x + PUP.swatReach] : [p.x - PUP.swatReach, p.x]; c.hit([bx[0], bx[1], p.y - 44, p.y], PUP.dmg.swat, 'THE MASTERPIECE', { from: p.x }); } return;
    case 'stompTell': if (p.modeT <= 0) { p.mode = 'stomp'; p.modeT = PUP.stompT; show.n.stomp++; ev.push({ t: 'stomp', p, x: p.stompX }); c.sound('stomp');
      c.hit([p.stompX - PUP.stompHalf, p.stompX + PUP.stompHalf, A.floor - 22, A.floor], PUP.dmg.stomp, 'THE STOMP', { from: p.stompX, unblockable: true, up: true }); } return;
    case 'reachTell': if (p.modeT <= 0) { p.mode = 'reach'; p.modeT = PUP.reachT; p.reachR = 0; show.n.reach++; ev.push({ t: 'reach', p }); c.sound('reach'); } return;
    case 'reach': { const r0 = p.reachR || 0, r1 = PUP.reachSpan * Math.min(1, 1 - Math.max(0, p.modeT) / PUP.reachT); p.reachR = r1;
      c.band('high', A.gallery, p.x - r1, p.x + r1, PUP.dmg.reach, 'THE REACH', 'reach' + show.n.reach);
      if (p.modeT <= 0) { p.mode = 'recover'; p.modeT = PUP.recoverT; } return; }
    case 'chop': case 'spin': case 'swat': case 'stomp': if (p.modeT <= 0) { p.mode = 'recover'; p.modeT = PUP.recoverT; } return;
  }
  /* HANGING: hop toward the hero on this floor (jerky: a hop, a rest), and when it is this one's turn and he is in range, begin a told blow */
  if (!hero) return;
  const dx = hero.x - p.x, adx = Math.abs(dx), sameFloor = Math.abs(heroFloor(show, hero) - floor) < 6;
  p.face = Math.sign(dx) || p.face;
  const range = big ? PUP.swatRange : p.t === 'marionette' ? PUP.chopRange : PUP.spinRange;
  if (myTurn && show.gap <= 0 && show.turn === 0) {
    if (big) {
      if (!sameFloor && hero.ground && e.phase >= 3) { p.mode = 'reachTell'; p.modeT = PUP.reachTell; show.turn = 1; ev.push({ t: 'reachTell', p }); c.say('!!', '#ff6b6b'); c.say('HIGH', '#ff6b6b', true); c.sound('reachTell'); return; }
      if (sameFloor && adx < range) { p.mode = 'swatTell'; p.modeT = PUP.swatTell; show.turn = 1; ev.push({ t: 'swatTell', p }); c.say('!', '#ffd36b'); c.sound('swatTell'); return; }
      if (sameFloor && adx < 150 && ((show.blows++) % 2 === 1)) { p.mode = 'stompTell'; p.modeT = PUP.stompTell; p.stompX = hero.x; show.turn = 1; ev.push({ t: 'stompTell', p, x: hero.x }); c.say('!!', '#ff6b6b'); c.sound('stompTell'); return; }
    } else if (sameFloor) {
      const drop = e.phase === 1 && !p.flown && (show.blows % PUP.dropEvery) === PUP.dropEvery - 1;
      if (drop) { show.blows++; p.mode = 'dropTell'; p.modeT = PUP.dropTell; p.dropX = p.x; show.turn = 1; ev.push({ t: 'dropTell', p }); c.say('!!', '#ff6b6b'); c.sound('dropTell'); return; }
      if (adx < range) { show.blows++; show.turn = 1;
        if (p.t === 'marionette') { p.mode = 'chopTell'; p.modeT = PUP.chopTell / slow; ev.push({ t: 'chopTell', p }); c.say('!', '#ffd36b'); c.sound('chopTell'); }
        else { p.mode = 'spinTell'; p.modeT = PUP.spinTell / slow; ev.push({ t: 'spinTell', p }); c.say('!!', '#ff6b6b'); c.say('LOW', '#ff6b6b', true); c.sound('spinTell'); }
        return; } } }
  /* the walk: in hops, and never onto the other puppet; it stops a little short of its reach */
  const want = big ? range - 18 : range - 10;
  if (sameFloor && adx > want) { p.hopT = (p.hopT || 0) + dt; const cyc = PUP.hopT + PUP.hopRest, ph = p.hopT % cyc;
    if (ph < PUP.hopT) { const sp = (big ? PUP.mSpeed : p.t === 'marionette' ? PUP.soldierSpeed : PUP.harlequinSpeed) * slow; p.vx = Math.sign(dx) * sp; }
    const nx = p.x + p.vx * dt, lo = (p.flown ? A.gx0 : A.x0) + 10, hi = (p.flown ? A.gx1 : A.x1) - 10;
    p.x = Math.max(lo, Math.min(hi, nx)); }
}

/* ---------- ONE FRAME OF THE SHOW ----------
   c = { heroes: [{ x, y, face, alive, ground, lastFloor }], say(text, col, low), sound(key), number(x, y, line, col) (a teaching line: main.js number() puts a line of src/hint-lines.js in the hint box),
         hit(box [l, r, t, b], dmg, name, { from, unblockable, up }), band(kind, floorY, x0, x1, dmg, name, key) (a sweeping band from
         x0 to x1 at the whip's height: the hands judge each hero once per key, against his duck box), snare(hero, t, dmg), summon(kind, x, y) -> entity (the masterpiece), pack(p) }
   Returns the frame's events. */
export function stepShow(e, show, dt, c) {
  const ev = []; if (!e || !show) return ev;
  const A = show.A, heroes = (c.heroes || []).filter(h => h.alive);
  e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.vx = 0;
  if (!e.alive || e.mode === 'sleep') return ev;
  if (e.mode === 'wake') { if (e.modeT <= 0) { e.mode = 'work'; c.number(e.x, e.y - 60, 'THE STRINGS GLOW WHEN THEY PULL: CUT THEM', '#ffd36b'); } for (const p of show.puppets) if (p.mode === 'hang') p.y = A.floor; return ev; }
  const hero = heroes.slice().sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || null;
  for (const h of heroes) if (h.lastFloor === undefined) h.lastFloor = heroFloor(show, h);   /* (the hands keep each hero's floor between frames: in the air it is the last one he stood on) */
  /* ---- THE PHASE, only between his beats (a re-stringing is finished first) ---- */
  const ph = pupPhase(e), calm = e.mode === 'work';
  if (ph > e.phase && calm) {
    e.phase = ph; ev.push({ t: 'phase', ph });
    if (ph === 2) { e.mode = 'cutLine'; e.modeT = PUP.cutLineT; show.line = false; show.free = true; c.sound('cutLine'); c.say('HE CUTS HIS OWN LINE', '#ff6b6b'); c.number(e.x, e.y - 60, 'RIDE THE BATTEN UP: STRIKE THE PIN RAIL', '#ffd36b'); return ev; }
    if (ph === 3) { e.mode = 'masterTell'; e.modeT = PUP.masterTell; for (const p of show.puppets) if (p.t !== 'masterpiece' && p.alive) { p.mode = 'packed'; c.pack(p); }
      show.lowering = null; c.sound('masterTell'); c.say('THE MASTERPIECE', '#ffd36b'); c.number(e.x, e.y - 60, 'CUT ALL FOUR OF ITS STRINGS', '#ffd36b'); return ev; } }
  e.open = pupOpen(e) ? Math.max(0, e.modeT) : 0;
  const smalls = show.puppets.filter(p => p.t !== 'masterpiece' && p.mode !== 'packed');
  const master = show.puppets.find(p => p.t === 'masterpiece' && p.alive) || null;
  /* the puppets take their turns (one blow at a time) */
  if (show.turn === 0) show.gap -= dt;
  const live = (e.phase >= 3 ? [master] : smalls).filter(p => p && !heaped(p));
  const turnOf = live.length ? live[Math.floor(e.anim / 2.4) % live.length] : null;
  const pupsGo = e.mode !== 'restring' && e.mode !== 'descend' && e.mode !== 'descendTell' && e.mode !== 'ascend' && e.mode !== 'fallen' && e.mode !== 'yanked' && e.mode !== 'climb';
  for (const p of show.puppets) { if (p.mode === 'packed' || !p.alive) continue;
    const mine = pupsGo && (p === turnOf || (live.length === 1 && live[0] === p));
    if (!pupsGo && !heaped(p) && (p.mode.endsWith('Tell'))) { p.mode = 'hang'; show.turn = 0; }
    puppetStep(p, e, show, dt, c, ev, hero, mine); }
  if (show.turn && !show.puppets.some(p => p.alive && (/Tell$/.test(p.mode) || ['chop', 'spin', 'drop', 'swat', 'stomp', 'reach', 'recover'].includes(p.mode)))) show.turn = 0;
  /* ---- A LOWERING STRING (phase 1, one puppet down): it reaches the heap and the puppet comes up ---- */
  if (show.lowering) { show.lowering.t -= dt; if (show.lowering.t <= 0) { const p = show.lowering.p; show.lowering = null; restringOne(p); p.mode = 'rise'; p.modeT = PUP.riseT; ev.push({ t: 'rise', p }); c.sound('rise'); } }
  /* ---- HIS OWN BEATS ---- */
  switch (e.mode) {
    case 'cutLine': if (e.modeT <= 0) e.mode = 'work'; return ev;
    case 'descendTell': if (e.modeT <= 0) { e.mode = 'descend'; e.modeT = PUP.descendT; e.onStage = true; ev.push({ t: 'descend' }); c.sound('descend'); } return ev;
    case 'descend': { const k = 1 - Math.max(0, e.modeT) / PUP.descendT; e.y = A.gallery + (A.floor - A.gallery) * k;
      if (e.modeT <= 0) { e.y = A.floor; e.mode = 'restring'; e.modeT = PUP.restringT; e.open = e.modeT; show.n.restring++; ev.push({ t: 'restring' }); c.sound('restring'); c.number(e.x, e.y - 60, 'HE IS RE-STRINGING THEM: CUT HIM', '#ffd36b'); } return ev; }
    case 'restring':
      if (e.modeT <= 0) { for (const p of smalls) { restringOne(p); if (p.mode !== 'rise') { p.mode = 'rise'; p.modeT = PUP.riseT; } }
        show.gap = 1.2; show.turn = 0; e.open = 0;
        if (e.onStage) { e.mode = 'ascend'; e.modeT = PUP.ascendT; c.sound('ascend'); } else e.mode = 'work';
        ev.push({ t: 'restrung' }); }
      return ev;
    case 'ascend': { const k = 1 - Math.max(0, e.modeT) / PUP.ascendT; e.y = A.floor + (A.gallery - A.floor) * k;
      if (e.modeT <= 0) { e.y = A.gallery; e.onStage = false; e.mode = 'work'; } return ev; }
    case 'whipLowTell': case 'whipHighTell':
      if (e.modeT <= 0) { e.whipKind = e.mode === 'whipLowTell' ? 'low' : 'high'; e.mode = 'whip'; e.modeT = PUP.whipT; e.whipR = 0; show.n.whip++; ev.push({ t: 'whip', kind: e.whipKind }); c.sound('whip'); }
      return ev;
    case 'whip': { const r0 = e.whipR || 0, r1 = PUP.whipReach * Math.min(1, 1 - Math.max(0, e.modeT) / PUP.whipT); e.whipR = r1;
      const f = e.face || 1;
      c.band(e.whipKind, A.gallery, f > 0 ? e.x : e.x - r1, f > 0 ? e.x + r1 : e.x, PUP.dmg.whip, 'THE WHIP', 'whip' + show.n.whip);
      if (e.modeT <= 0) { e.mode = 'work'; e.whipCd = PUP.whipEvery; e.whipR = 0; } return ev; }
    case 'snareTell':
      if (e.modeT <= 0) { const s = show.snare; show.snare = null; e.mode = 'work'; e.snareCd = PUP.snareEvery; show.n.snare++; ev.push({ t: 'snare' }); c.sound('snare');
        if (s) for (const h of heroes) if (Math.abs(h.x - s.x) <= PUP.snareR && Math.abs(h.y - s.y) < 20) { show.n.snared++; ev.push({ t: 'snared' }); c.snare(h, PUP.snareHold, PUP.dmg.snare); } }
      return ev;
    case 'masterTell':
      if (e.modeT <= PUP.masterTell - 0.4 && !master && !show.masterAsked) { show.masterAsked = true; const mp = c.summon('masterpiece', (A.x0 + A.x1) / 2, A.gallery + 10); if (mp) { newPuppet(mp, show); mp.y = A.gallery + 30; } }
      if (e.modeT <= 0) { e.mode = 'work'; show.gap = 1.0; show.turn = 0; } return ev;
    case 'yanked': { const k = Math.min(1, 1 - Math.max(0, e.modeT) / PUP.yankT); e.y = A.gallery + (A.floor - A.gallery) * k * k; e.x += (e.yankX - e.x) * Math.min(1, dt * 4);
      if (e.modeT <= 0) { e.y = A.floor; e.mode = 'fallen'; e.modeT = PUP.fallT; e.open = e.modeT; e.onStage = true; show.n.fall++; ev.push({ t: 'fallen' }); c.sound('land'); c.number(e.x, e.y - 60, 'HE FELL WITH IT: CUT HIM', '#ffd36b'); } return ev; }
    case 'fallen': if (e.modeT <= 0) { e.mode = 'climb'; e.modeT = PUP.climbT; e.open = 0; c.sound('ascend'); } return ev;
    case 'climb': { const k = 1 - Math.max(0, e.modeT) / PUP.climbT; e.y = A.floor + (A.gallery - A.floor) * k; if (e.modeT <= 0) { e.y = A.gallery; e.onStage = false; e.mode = 'rerig'; e.modeT = PUP.rerigT; show.n.rerig++; c.sound('restring'); } return ev; }
    case 'rerig': if (e.modeT <= 0) { if (master) { restringOne(master); master.mode = 'rise'; master.modeT = PUP.riseT; } e.mode = 'work'; show.gap = 1.4; show.turn = 0; ev.push({ t: 'rerigged' }); } return ev;
  }
  /* ---- WORK: in the loft, the bars in his hands. What his puppets' state asks of him comes first (rule E2: the opening is at the top) ---- */
  if (e.phase >= 3) {
    if (master && master.mode === 'heap' && !show.yankDone) { show.yankDone = true; e.mode = 'yanked'; e.modeT = PUP.yankT; e.yankX = Math.max(A.x0 + 20, Math.min(A.x1 - 20, master.x + (e.x > master.x ? 30 : -30))); ev.push({ t: 'yanked' }); c.sound('yank'); c.say('THE CROSSBAR TAKES HIM', '#8fd160'); return ev; }
    if (master && master.mode !== 'heap') show.yankDone = false;
  } else {
    const down = smalls.filter(p => heaped(p)).length;
    if (smalls.length && down === smalls.length) {
      show.lowering = null;
      if (show.line) { e.mode = 'descendTell'; e.modeT = PUP.descendTell; show.n.descend++; ev.push({ t: 'descendTell' }); c.sound('descendTell'); c.say('HE COMES DOWN', '#8fd160'); return ev; }
      /* the line is cut (phase 2): he re-strings them from the gallery. Open where he stands: in reach from the gallery, never from the stage */
      e.mode = 'restring'; e.modeT = PUP.loftRestringT; e.open = e.modeT; show.n.loftRestring++; ev.push({ t: 'restring', loft: true }); c.sound('restring');
      if (hero && hero.lastFloor === A.gallery) c.number(e.x, e.y - 60, 'HIS HANDS ARE EMPTY: CUT HIM', '#ffd36b'); else c.number(e.x, e.y - 60, 'HE RE-STRINGS THEM IN THE LOFT: CLIMB', '#ffd36b'); return ev; }
    if (down === 1 && smalls.length > 1) { show.lonely += dt;
      if (show.lonely >= PUP.lonelyT && !show.lowering) { const p = smalls.find(q => heaped(q)); show.lowering = { p, t: PUP.lowerT }; show.lonely = 0; ev.push({ t: 'lower', p }); c.sound('lower'); } }
    else show.lonely = 0;
  }
  /* HIS STRINGS AS WHIPS (phase 2 on, a hero on the gallery near him) */
  const loftHero = hero && hero.lastFloor === A.gallery && Math.abs(hero.x - e.x) < PUP.whipReach + 20 ? hero : null;
  if (e.phase >= 2 && loftHero) { e.whipCd -= dt; e.snareCd -= dt;
    if (e.snareCd <= 0 && loftHero.ground) { e.mode = 'snareTell'; e.modeT = PUP.snareTell; show.snare = { x: loftHero.x, y: A.gallery }; ev.push({ t: 'snareTell', x: loftHero.x }); c.say('!!', '#ff6b6b'); c.sound('snareTell'); return ev; }
    if (e.whipCd <= 0) { const kind = WHIP_ORDER[(e.whipN++) % WHIP_ORDER.length]; e.face = Math.sign(loftHero.x - e.x) || e.face || -1;
      e.mode = kind === 'low' ? 'whipLowTell' : 'whipHighTell'; e.modeT = PUP.whipTell; ev.push({ t: 'whipTell', kind }); c.say('!!', '#ff6b6b'); c.say(kind === 'low' ? 'LOW' : 'HIGH', '#ff6b6b', true); c.sound('whipTell'); return ev; } }
  /* HIS FEET: over his puppets on the stage; in the loft with a hero up there, he keeps his distance along the gallery */
  let tx = e.home;
  const tgt = (e.phase >= 3 ? [master] : smalls).filter(p => p && !heaped(p));
  if (tgt.length) tx = tgt.reduce((a, p) => a + p.x, 0) / tgt.length;
  if (loftHero || (hero && hero.lastFloor === A.gallery)) { const hx = hero.x, away = Math.sign(e.x - hx) || 1; if (Math.abs(e.x - hx) < PUP.keep) tx = hx + away * (PUP.keep + 20); else tx = e.x; }
  tx = Math.max(A.gx0 + 16, Math.min(A.gx1 - 16, tx));
  if (Math.abs(tx - e.x) > 4) { e.vx = Math.sign(tx - e.x) * PUP.pace * (loftHero ? 2.2 : 1); e.x += e.vx * dt; }
  if (hero) e.face = Math.sign(hero.x - e.x) || e.face;
  e.y = A.gallery;
  return ev;
}
function restringOne(p) { for (const s of p.str) { s.cut = false; s.cutAt = null; } p.flown = false; if (p.mode !== 'packed') { p.alive = true; p.hp = p.maxHp || p.hp; } }   /* (a puppet put away by anything else - a script, a hazard - is only a heap to him: he strings it again) */

/* ---------- THE STAGE ----------
   Laid into a painter-like writer (set / block / plat / ent) with its west wall at column sx and its floor at row R (the rows over it must be free up to R - 16).
   Returns what a level adds to its return: { arena, movers } - arena.stage carries the rig (the gallery and the pin rail); movers is the batten, for
   the level's moversExtra. The theatre's own
   level calls this for its MAIN STAGE; buildPuppetStage below is the standalone arena. The stage: 40 columns wall to wall (38 inside), a floor, the fly
   gallery 9 rows up (boards hung from the grid) from column sx+3 to the east wall, the grid 7 rows over the gallery, the batten's slot in the floor at
   sx+1..sx+2 (the counterweight lift runs from there to the gallery), the pin rail beside it, a door in each wall (6 rows, closed by the fight). */
export const STAGE = { W: 40, gallery: 9, grid: 16, door: 6 };
export function stagePuppeteer(W, T, TS, sx, R) {
  const { set, block, plat, ent } = W, G = R - STAGE.gallery, top = R - STAGE.grid, ex = sx + STAGE.W - 1;
  block(sx, sx, 0, R - 1); block(ex, ex, 0, R - 1);                  /* the proscenium walls, floor to roof */
  for (let y = R - STAGE.door; y <= R - 1; y++) { set(sx, y, T.AIR); set(ex, y, T.AIR); }   /* a door in each: the fight closes them (setWall) */
  block(sx, ex, 0, top);                                              /* the grid and the roof over it */
  for (let x = sx + 1; x < ex; x++) for (let y = top + 1; y < R; y++) set(x, y, T.AIR);
  block(sx + 1, ex - 1, R, R + 1);                                    /* the boards */
  set(sx + 1, R, T.AIR); set(sx + 2, R, T.AIR);                       /* the batten's slot: it rests flush with the boards */
  plat(sx + 3, G, ex - sx - 3);                                       /* THE FLY GALLERY */
  ent('puppeteer', sx + 30, G - 1, { face: -1 });
  ent('marionette', sx + 16, R - 1, { face: -1 });
  ent('harlequin', sx + 24, R - 1, { face: -1 });
  const arena = { x0: (sx + 1) * TS, x1: ex * TS, floor: R * TS, y0: (top + 1) * TS, trigger: (sx + 5) * TS, wallL: sx, wallR: ex, boss: 'puppeteer', music: 'puppeteer',
    tint: '#6a1a2a', tintA: 0.1, camFrame: true,
    stage: { gallery: G * TS, gx0: (sx + 3) * TS, gx1: ex * TS, pinX: (sx + 3) * TS + 8, sx, R } };
  /* THE BATTEN: a lift the hands drive (mover kind 'lift', batten: true): its top rests flush with the boards and rises to the gallery's */
  const batten = { kind: 'lift', batten: true, x: (sx + 1) * TS, y: R * TS, y0: R * TS, y1: G * TS, down: R * TS, up: G * TS, w: 32, h: 8, speed: 0, st: 'down', t: 0 };
  return { arena, movers: [batten] };
}
/* THE STANDALONE ARENA (level 'puppetstage', hidden): a short wing corridor with a checkpoint, the stage, and the way on past it. Only for testing him
   until THE MASKWRIGHT'S THEATRE (src/maskwright-theatre.js, claude/theatre) lands with the main stage at its end - then this level goes */
export function buildPuppetStage({ painter, T, TS }) {
  const W = 64, H = 24, R = 20, S = R - 1, L = painter(W, H), { set, block, plat, ent } = L;
  L.floor(0, W - 1, R); block(0, 0, 0, R - 1); block(W - 1, W - 1, 0, R - 1);
  block(1, 13, 0, R - 8);                                             /* the wings: a low corridor to the stage door */
  ent('sign', 4, S, { text: 'THE MAIN STAGE. HE WORKS THEM FROM THE FLIES. CUT THE STRINGS.' });
  ent('check', 7, S);
  const { arena, movers } = stagePuppeteer({ set, block, plat, ent }, T, TS, 14, R);
  ent('gate', 58, S);
  block(54, 62, 0, R - 8);
  return { W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: S }, pools: [], falls: [], moversExtra: movers, interiors: [[1, 13, 13, S], [15, 52, 5, S], [54, 62, 13, S]], arena, gateAfterBoss: true,
    music: 'puppeteer', palette: { set: 'village', dress: 'village', sky: 'dusk', far: 'town', mid: 'town', near: 'town', nearSet: 'town', haze: 'rgba(120,40,60,0.10)' },
    ambient: [{ x0: 0, x1: 99999, kind: 'tavern' }] };
}

/* ---------- THE BOT'S READING (src/lab.js): what a hero should do this frame, from what is on the screen ----------
   s = { P: { x, y, face, ground, snare, atk }, e (him), show, reach (the hero's reach, px), shield (bool) }
   Returns { gx, face, atk, jump, down, drop, block, why } - gx the x to walk to (null: stand), atk: swing now facing `face`, jump / down (duck) / drop
   (down + jump through the gallery) / block. It reads only what a player sees: the glow, the marks, the shadow, the loop, the band. */
export function puppetPlan(s) {
  const { P, e, show, reach } = s, A = show.A, out = { gx: null, face: P.face, atk: false, jump: false, down: false, drop: false, block: false, why: '' };
  const onGal = Math.abs(P.y - A.gallery) < 6 && P.ground, onStage = P.y > A.gallery + 20;
  const bat = show.batten;
  const strings = stringsOf(e, show).filter(q => q.taut);
  /* the nearest glowing string: step to where the swing's box crosses it (its point at the height of the blade), and cut */
  const blade = P.y - 9, near = strings.map(q => { const t = q.y1 === q.y0 ? 1 : Math.max(0, Math.min(1, (blade - q.y0) / (q.y1 - q.y0))), x = q.x0 + (q.x1 - q.x0) * t, y = q.y0 + (q.y1 - q.y0) * t;
    return { q, x, y }; }).filter(o => Math.abs(o.y - blade) < 7).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
  /* threats first */
  const pups = show.puppets.filter(p => p.alive && p.mode !== 'packed' && !heaped(p));
  const drop = pups.find(p => p.mode === 'dropTell' || p.mode === 'drop');
  if (drop && Math.abs(drop.x - P.x) < PUP.dropHalf + 16) { out.gx = P.x + (P.x < drop.x ? -60 : 60); out.gx = Math.max(A.x0 + 12, Math.min(A.x1 - 12, out.gx)); out.why = 'drop'; return out; }
  const spin = pups.find(p => (p.mode === 'spinTell' && p.modeT < 0.2 || p.mode === 'spin') && Math.abs(p.x - P.x) < PUP.spinReach + 10 && Math.abs(p.y - P.y) < 10);
  if (spin && P.ground) { out.jump = true; out.why = 'spin'; }
  const stomp = pups.find(p => p.mode === 'stompTell' && Math.abs(p.stompX - P.x) < PUP.stompHalf + 14);
  if (stomp) { out.gx = stomp.stompX + (P.x < stomp.stompX ? -50 : 50); out.why = 'stomp'; return out; }
  if (show.snare && Math.abs(show.snare.x - P.x) < PUP.snareR + 12 && onGal) { out.gx = show.snare.x + (P.x < show.snare.x ? -34 : 34); out.why = 'snare'; return out; }
  const wk = e.mode === 'whipLowTell' ? 'low' : e.mode === 'whipHighTell' ? 'high' : e.mode === 'whip' ? e.whipKind : null;
  if (wk && onGal) { if (wk === 'low' && (e.mode === 'whip' || e.modeT < 0.2)) out.jump = true; if (wk === 'high' && (e.mode === 'whip' || e.modeT < 0.3)) { out.down = true; out.why = 'duck'; return out; } }
  const rch = pups.find(p => p.mode === 'reachTell' || p.mode === 'reach');
  if (rch && onGal && (rch.mode === 'reach' || rch.modeT < 0.35)) { out.down = true; out.why = 'duck reach'; return out; }
  /* HE IS OPEN: get on him and cut (on the stage when he came down or fell; in the loft when he re-strings there) */
  if (pupOpen(e)) { const hisFloor = e.y > A.gallery + 20 ? 'stage' : 'loft';
    if ((hisFloor === 'stage' && onStage) || (hisFloor === 'loft' && onGal)) { const d = e.x - P.x; out.face = Math.sign(d) || 1; out.gx = Math.abs(d) > reach - 4 ? e.x - out.face * (reach - 8) : null; out.atk = Math.abs(d) < reach + 8; out.why = 'open'; return out; }
    if (hisFloor === 'loft' && onStage) return climb(out, P, A, bat, s);
    if (hisFloor === 'stage' && onGal) { out.drop = true; out.why = 'down to him'; return out; } }
  /* A GLOWING STRING in reach: cut it (a yellow blow coming at you is taken on the string instead - the cut cancels it) */
  if (near) { const d = near.x - P.x; out.face = Math.sign(d) || P.face; if (Math.abs(d) > reach - 6) out.gx = near.x - out.face * (reach - 10); out.atk = Math.abs(d) < reach - 2; out.why = 'cut'; return out; }
  const chop = pups.find(p => (p.mode === 'chopTell' || p.mode === 'swatTell') && Math.abs(p.x - P.x) < (p.t === 'masterpiece' ? PUP.swatReach + 12 : PUP.chopReach + 12) && Math.abs(p.y - P.y) < 12);
  if (chop && s.shield) { out.block = true; out.face = Math.sign(chop.x - P.x) || 1; out.why = 'block'; return out; }
  if (chop) { out.gx = chop.x + (P.x < chop.x ? -70 : 70); out.why = 'back off'; return out; }
  /* THE LOFT: from phase 2, up there is where he can be cut. Go up when both puppets are up on the stage and you are not busy */
  if (e.phase >= 2 && onStage && pups.length) return climb(out, P, A, bat, s);   /* (phase 3 too: the masterpiece's head and back strings pass the catwalk) */
  /* in the loft: close on the nearest string's crossing and wait for it to glow */
  if (onGal) { const cross = stringsOf(e, show).map(q => { const t = q.y1 === q.y0 ? 1 : Math.max(0, Math.min(1, (blade - q.y0) / (q.y1 - q.y0))); return q.x0 + (q.x1 - q.x0) * t; }).filter(x => x > A.gx0 + 8 && x < A.gx1 - 8).sort((a, b) => Math.abs(a - P.x) - Math.abs(b - P.x))[0];
    if (cross !== undefined) { const side = Math.sign(P.x - cross) || 1; out.gx = cross + side * (reach - 10); out.face = -side; out.why = 'wait at a string'; return out; } }
  /* otherwise: stand off the nearest puppet by a little more than its reach and wait for a string to glow */
  const tp = pups.filter(p => Math.abs(p.y - P.y) < 30).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
  if (tp) { const side = Math.sign(P.x - tp.x) || 1, want = tp.x + side * (tp.t === 'masterpiece' ? 44 : 22); out.gx = Math.max(A.x0 + 12, Math.min(A.x1 - 12, want)); out.face = -side; out.why = 'wait'; }
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
    if (m === 'whipLowTell' || m === 'whipHighTell') return PUP_F.tell;
    if (m === 'whip') return PUP_F.whip;
    if (m === 'snareTell') return PUP_F.snareTell;
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
  if (m === 'fall' || m === 'dropTell' || m === 'drop' || m === 'fly') return MAR_F.drop;
  if (m.endsWith('Tell')) return MAR_F.tell;
  if (m === 'chop' || m === 'spin') return MAR_F.blow;
  if (m === 'stagger') return MAR_F.stagger;
  if (m === 'rise') return MAR_F.rise;
  if (Math.abs(e.vx || 0) > 2) return MAR_F.hop[Math.floor(a * 5) % 2];
  return MAR_F.hang;
}
