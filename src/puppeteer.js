// src/puppeteer.js - THE PUPPETEER, the boss of THE MASKWRIGHT'S THEATRE (claude/puppeteer). PUPPETEER3 (2026-09-30), after Daniel played the second
// build: "still really easy, and the enemies are just health sponges. How do I actually attack the boss? Cutting strings doesn't seem to do anything.
// Why not make one puppet have fast, weak attacks and the other slow and heavy, and balance the fight around that?" - so the fight is rebuilt round
// HIS DUO, and every way of hurting anything is made plain.
//
// THE DUO, on the stage floor:
//   THE HARLEQUIN  FAST AND WEAK: short strings of quick jabs (!, block or step back; PUP.harl.jab each) and a low kick (!!, jump it); he darts round you,
//                  and a hero who stands still is jumped at once. Fragile: PUP.harl.hp, and ONE string - one cut drops him.
//   THE BRUTE      SLOW AND HEAVY (the soldier puppet, built half again as big): a long-told HEAVY CHOP (!!: no shield holds it - get out from under), a GROUND SLAM (!!, a shock
//                  along the boards: jump it) and a GRAB (!!, get out of reach) - PUP.brute.dmg, two or three of them and you are in trouble - and after
//                  every swing a long RECOVERY that is the window to cut him or hit him. Two strings: the ARM (cut it and the chop and the grab are gone:
//                  the arm hangs limp) and the BACK (cut it and the slam is gone: he stoops).
// DAMAGE IS PLAIN. A puppet takes a blow like anything else (a flash, a knock, a number, its health bar under it). Its strings are the SHORTCUT: always
// drawn, cut whenever a blow crosses one; cut in the GOLD (a windup or a blow) it also CANCELS that blow and staggers the puppet. A cut is a SNAP: a
// hit-stop, the string whipping away, the limb falling limp, that attack gone. A puppet with its strings all cut, or its health gone, DROPS in a heap
// and stays down PUP.downT s (a ring counts it out), then he strings it again.
// HOW TO HURT HIM. He HANGS FROM HIS CONTROL BAR over the stage. Every puppet you drop lowers his bar (drawn: he sinks on his line, out of reach); with
// BOTH down he is DRAGGED TO THE BOARDS - "HE'S DOWN - STRIKE HIM", a ring, OPEN, a timer - for PUP.downOpenT s at PUP.openMul. The ALWAYS-THERE, HARD
// way: climb to the gallery (the batten at the stage door, the pin rail beside it) and strike the LINE HE HANGS FROM: he is jolted down onto the
// gallery boards, open for PUP.joltT s (then not again for PUP.joltCd s). Anywhere else a blow that reaches him is PUP.ward.
// PHASES (each changes how the duo combines, rule A10):
//   1 (full to 2/3)  ONE AT A TIME: they take turns to strike.
//   2 (2/3 to 1/3)   TOGETHER: the Harlequin harasses while the Brute winds up; the Brute's SLAM breaks the boards where it lands (a trapdoor pit, told
//                    by the red crack of its windup); a hero on the gallery has the Harlequin flown up to him, and the Puppeteer whips (!!).
//   3 (1/3 to 0)     THE MASTERPIECE: the Brute is packed away and a wooden king twice a man's height comes down in his place (the same heavy three: a
//                    swat !, a stomp !!, a reach !!), with the Harlequin still at your heels. Drop it (health or its four strings) with the Harlequin
//                    down too and its crossbar drags him down: open.
// Between cycles (when he hauls himself back up) a told SCENE CHANGE brings new painted flats to stand on.
// Health is never the lever. PURE: no DOM, no main.js; the world is `c` (src/puppeteer-hands.js). tools/puppeteer.mjs proves it.

export const PUP = {
  hp: 720, w: 16, h: 40, markH: 50,
  ward: 0.05, openMul: 1.0, joltMul: 1.0,
  downOpenT: 4.0,                      // BOTH PUPPETS DOWN: he is on the boards this long
  joltT: 1.6, joltCd: 8.0,             // THE HARD WAY: his line struck from the gallery
  hangLow: 56,                         // one puppet down: his bar sinks this far below the gallery (still out of reach from the boards)
  descendT: 0.7, haulT: 1.2, riseT: 0.8,
  sceneT: 1.6,
  downT: { harlequin: 6.0, marionette: 8.0, masterpiece: 8.0 },   // a dropped puppet stays down this long, then he strings it again
  cutStun: 0.7,                        // a GOLD cut: the puppet staggers this long
  flySpeed: 170,
  harl: { hp: 40, speed: 130, jabTell: 0.36, jabNext: 0.24, jabT: 0.1, jabs: 3, jabReach: 26, jab: 8, kickTell: 0.5, kickT: 0.2, kickReach: 34, kick: 10,
    rest: 0.35, still: 0.7, dart: 2.2 },
  brute: { hp: 110, speed: 38, chopTell: 1.1, chopReach: 40, chop: 28, slamTell: 1.3, slamReach: 70, slamTop: 12, slam: 30, grabTell: 1.0, grabReach: 30, grab: 32,
    recover: 1.4, range: 44, scale: 1.5 },
  master: { hp: 150, swatTell: 0.9, swatReach: 58, swatTop: 64, swat: 24, stompTell: 1.1, stompHalf: 24, stomp: 30, reachTell: 1.0, reachT: 0.45, reachSpan: 200, reach: 22,
    recover: 1.6, speed: 34, lowerT: 1.6 },
  whipEvery: 3.4, whipTell: 0.9, whipT: 0.35, whipReach: 240, whip: 16,
  slamPitT: 4.0, slamPitHalf: 1,       // phase 2: the slam breaks the boards (its column and one each side) for this long
  lowTop: 10, highTop: 24, highBot: 10,
  gap: [0.9, 0.6, 0.6],                // P1: the rest between one duo blow and the next
  pace: 26, keep: 72, mW: 34, mH: 92,
  p2: 2 / 3, p3: 1 / 3,
};
export const PUPPETS = { marionette: { w: 18, h: 44 }, harlequin: { w: 12, h: 28 }, acrobat: { w: 12, h: 28 }, masterpiece: { w: PUP.mW, h: PUP.mH } };
/* THE STRINGS: where each attaches, and the LIMB it holds up (cut it and that limb's attacks are gone) */
export const STRINGS = {
  marionette: [{ k: 'arm', limb: 'arm', dx: 10, up: 9 }, { k: 'back', limb: 'back', dx: -7, up: 10 }],   /* (x the Brute's 1.5: 13-15 px up - where every hero's blade from the boards reaches: the knight's to 17, the pyromancer's staff to 15) */
  harlequin: [{ k: 'cross', limb: 'all', dx: 0, up: 12 }],
  acrobat: [{ k: 'wrist', limb: 'all', dx: 5, up: 13 }],
  masterpiece: [{ k: 'left hand', limb: 'swat', dx: -18, up: 38 }, { k: 'right hand', limb: 'reach', dx: 18, up: 38 }, { k: 'head', limb: 'stomp', dx: 0, up: 94 }, { k: 'back', limb: 'body', dx: -6, up: 70 }],
};
/* which limb a move needs: a move whose limb's string is cut is gone */
export const NEEDS = { chop: 'arm', grab: 'arm', slam: 'back', jab: 'all', kick: 'all', swat: 'swat', stomp: 'stomp', reach: 'reach' };
export const NAME = { marionette: 'THE BRUTE', harlequin: 'THE HARLEQUIN', masterpiece: 'THE MASTERPIECE' };
export const isPuppet = e => !!e && (e.t === 'marionette' || e.t === 'harlequin' || e.t === 'acrobat' || e.t === 'masterpiece');
export const PUP_F = { work: [0, 1], tell: 2, whip: 3, snareTell: 4, ride: 5, restring: [6, 7], fallen: 8, climb: 9, hurt: 10, dead: 11, cut: 12 };
export const MAR_F = { hang: 0, hop: [1, 2], tell: 3, blow: 4, stagger: 5, heap: 6, rise: 7, drop: 8, highTell: 9, high: 10 };
export const MP_F = { hang: 0, walk: [1, 2], swatTell: 3, swat: 4, stompTell: 5, stomp: 6, reachTell: 7, reach: 8, stagger: 9, heap: 10 };
/* SCENES: painted flats brought on between cycles ([x0, x1, rows up], stage columns 1..38; the batten's columns 1-3 are never touched) */
export const SCENES = [
  { name: 'THE BARE STAGE', flats: [] },
  { name: 'THE FOREST', flats: [[9, 13, 3], [25, 29, 3]] },
  { name: 'THE CASTLE', flats: [[15, 22, 4]] },
  { name: 'THE STORM AT SEA', flats: [[5, 8, 3], [31, 34, 3]] },
];
export const sceneOf = cycle => (cycle <= 0 ? 0 : 1 + ((cycle - 1) % 3));

export const pupPhase = e => (e.hp <= e.maxHp * PUP.p3 ? 3 : e.hp <= e.maxHp * PUP.p2 ? 2 : 1);
export const pupOpen = e => !!e && (e.mode === 'downed' || e.mode === 'jolted');
export const pupTake = e => (e.mode === 'downed' ? PUP.openMul : e.mode === 'jolted' ? PUP.joltMul : PUP.ward);
export const whipBand = (kind, floor) => (kind === 'low' ? [floor - PUP.lowTop, floor] : [floor - PUP.highTop, floor - PUP.highBot]);
export const bandCatches = (kind, floor, box) => { const [t, b] = whipBand(kind, floor); return box.b > t && box.t < b; };
const BLOWS = ['jab', 'kick', 'chop', 'slam', 'grab', 'swat', 'stomp', 'reach'];
const tellOf = m => (typeof m === 'string' && m.endsWith('Tell') ? m.slice(0, -4) : null);
export const limbGone = (p, limb) => limb && p.str.some((s, i) => s.cut && (STRINGS[p.t][i].limb === limb || STRINGS[p.t][i].limb === 'all'));
export const canUse = (p, move) => !limbGone(p, NEEDS[move]);

/* ---------- THE STRINGS ---------- */
/* GOLD: a cut in a windup or a blow is a bonus cut (it cancels the blow). A string can be cut at any time */
export const pupTaut = p => { if (!p || !p.alive) return false; const m = p.mode || '';
  return m.endsWith('Tell') || BLOWS.includes(m) || m === 'fly'; };
export function barOf(e, big) { const y = e.y - 34;
  return big ? { x0: e.x - 22, x1: e.x + 22, y } : { x0: e.x - 7, x1: e.x + 7, y }; }
export const heaped = p => !p.alive || p.mode === 'heap' || p.mode === 'fall' || p.mode === 'collapse' || p.mode === 'packed';
/* EVERY STRING NOW: { p, i, k, limb, x0, y0, x1, y1, taut } (cut ones are left out) */
export function stringsOf(e, show) {
  const out = []; if (!e || !show) return out;
  for (const p of show.puppets) { if (heaped(p) || p.mode === 'lower' || p.mode === 'lowerIn') continue;
    const S = STRINGS[p.t], big = p.t === 'masterpiece', bar = barOf(e, big), taut = pupTaut(p), f = p.face || 1, sc = p.t === 'marionette' ? PUP.brute.scale : 1;
    S.forEach((s, i) => { const st = p.str[i]; if (!st || st.cut) return;
      const n = S.length, x0 = bar.x0 + (bar.x1 - bar.x0) * (n === 1 ? 0.5 : i / (n - 1));
      out.push({ p, i, k: s.k, limb: s.limb, x0, y0: bar.y, x1: p.x + s.dx * f * sc, y1: p.y - s.up * sc, taut }); }); }
  return out;
}
export function segHitsBox(x0, y0, x1, y1, b) {
  let t0 = 0, t1 = 1; const dx = x1 - x0, dy = y1 - y0;
  for (const [p, q] of [[-dx, x0 - b.l], [dx, b.r - x0], [-dy, y0 - b.t], [dy, b.b - y0]]) {
    if (p === 0) { if (q < 0) return false; continue; }
    const r = q / p; if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; } }
  return t0 <= t1;
}
/* A BLOW IN BOX hb: every string it crosses is cut - one of each puppet a swing (`seen` is the swing's hit set). A cut in the gold is .gold.
   Returns [{ p, k, limb, gold, at }] */
export function strikeStrings(e, show, hb, seen) {
  const cuts = []; if (!e || !show || !hb) return cuts;
  const once = seen || new Set();
  for (const s of stringsOf(e, show)) { const pt = s.p.strTag || (s.p.strTag = {});
    if (once.has(pt) || !segHitsBox(s.x0, s.y0, s.x1, s.y1, hb)) continue;
    once.add(pt); const st = s.p.str[s.i], at = { x: Math.max(hb.l, Math.min(hb.r, s.x1)), y: Math.max(hb.t, Math.min(hb.b, s.y1)) };
    st.cut = true; st.cutAt = at; st.gold = s.taut; show.n.cut++; if (s.taut) show.n.goldCut++;
    cuts.push({ p: s.p, k: s.k, limb: s.limb, gold: s.taut, at }); }
  return cuts;
}
export const stringsLeft = p => (p.str || []).filter(s => !s.cut).length;

/* ---------- THE COUNTERWEIGHT: the batten at the stage door, the pin rail beside it (free from the first minute: the hard way up is always there) ---------- */
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
export function newShow(A) {
  return { A, puppets: [], turn: 0, gap: 1.0, line: true, free: true, cycle: 0, scene: 0, nextScene: 0, pits: [], joltCd: 0,
    n: { cut: 0, goldCut: 0, cancel: 0, heap: 0, drop: 0, downed: 0, jolt: 0, scene: 0, jab: 0, kick: 0, chop: 0, slam: 0, grab: 0, swat: 0, stomp: 0, reach: 0, whip: 0,
      pit: 0, pin: 0, fly: 0, dart: 0, rise: 0, fall: 0 } };
}
export function newPuppet(p, show) {
  const S = STRINGS[p.t]; p.str = S.map(() => ({ cut: false })); p.mode = p.t === 'masterpiece' ? 'lower' : 'hang'; p.modeT = p.t === 'masterpiece' ? PUP.master.lowerT : 0;
  p.anim = 0; p.vx = 0; p.hopT = 0; p.flown = false; p.floorY = show.A.floor; p.face = p.face || -1; p.puppet = true; p.downT = 0;
  p.hp = p.maxHp = p.t === 'harlequin' ? PUP.harl.hp : p.t === 'masterpiece' ? PUP.master.hp : p.t === 'marionette' ? PUP.brute.hp : 40;
  if (p.t === 'acrobat') { p.mode = 'packed'; p.alive = false; }   /* (PUPPETEER3: the acrobat is out of the fight - the duo is the fight) */
  show.puppets.push(p); return p;
}
export function newPuppeteer(e) {
  return Object.assign(e, { mode: 'sleep', modeT: 0, phase: 1, open: 0, whipCd: 2.0, whipN: 0, whipKind: null, whipR: 0, home: e.x, anim: 0, vx: 0, onStage: false, hang: 0 });
}
export function heroFloor(show, h) { const A = show.A;
  if (h.ground && Math.abs(h.y - A.gallery) < 6) return A.gallery;
  if (h.ground && h.y > A.gallery + 20) return Math.round(h.y);
  return h.lastFloor || A.floor; }
const onLoft = (show, h) => !!h && Math.abs((h.lastFloor ?? show.A.floor) - show.A.gallery) < 6;
const startTell = (p, mode, len) => { p.mode = mode; p.modeT = len; p.tellLen = len; p.tellId = (p.tellId || 0) + 1; };
/* DROP A PUPPET: its strings are all cut or its health is gone - a heap, down PUP.downT s */
function drop(p, show, ev, c) { if (heaped(p)) return; const big = p.t === 'masterpiece';
  p.mode = big ? 'collapse' : p.y < show.A.floor - 4 ? 'fall' : 'heap'; p.modeT = big ? 0.6 : 0; p.vy = 0; p.flown = false; p.downT = PUP.downT[p.t] || 6; p.str.forEach(s => { s.cut = true; });
  show.n.heap++; ev.push({ t: 'heap', p }); c.sound(big ? 'collapse' : 'heap'); }
function restring(p) { p.str.forEach(s => { s.cut = false; s.cutAt = null; s.gold = false; }); p.hp = p.maxHp; p.alive = true; p.flown = false; p.downT = 0; p.left0 = undefined; }

/* ---------- ONE PUPPET'S FRAME ---------- */
function puppetStep(p, e, show, dt, c, ev, hero, mayStrike) {
  const A = show.A; p.anim = (p.anim || 0) + dt; p.modeT -= dt; p.vx = 0;
  const big = p.t === 'masterpiece', brute = p.t === 'marionette', harl = p.t === 'harlequin';
  /* A CUT, SEEN: in the gold it cancels the blow and staggers it; any cut takes that limb's moves away. Strings all gone, or health gone: it drops */
  const left = stringsLeft(p); if (p.left0 === undefined) p.left0 = left;
  if (!heaped(p) && (left === 0 || p.hp <= 0)) { drop(p, show, ev, c); p.left0 = 0; return; }
  if (left < p.left0 && !heaped(p)) { const gold = p.str.some(s => s.cut && s.gold && !s.seen);
    for (const s of p.str) if (s.cut) s.seen = true;
    if (gold && (/Tell$/.test(p.mode) || BLOWS.includes(p.mode))) { show.n.cancel++; ev.push({ t: 'cancel', p, was: p.mode }); p.mode = 'stagger'; p.modeT = PUP.cutStun; }
    else if (/Tell$/.test(p.mode) && !canUse(p, tellOf(p.mode))) { ev.push({ t: 'cancel', p, was: p.mode }); p.mode = 'stagger'; p.modeT = PUP.cutStun; }
    ev.push({ t: 'limp', p }); }
  p.left0 = left;
  switch (p.mode) {
    case 'packed': return;
    case 'fall': p.vy = (p.vy || 0) + 900 * dt; p.y = Math.min(A.floor, p.y + p.vy * dt); if (p.y >= A.floor) { p.mode = 'heap'; c.sound('heap'); } return;
    case 'collapse': if (p.modeT <= 0) p.mode = 'heap'; return;
    case 'heap': p.y = A.floor; if (p.downT > 0) p.downT -= dt; return;
    case 'lower': { const k = 1 - Math.max(0, p.modeT) / PUP.master.lowerT; p.y = A.gallery + 20 + (A.floor - A.gallery - 20) * k; if (p.modeT <= 0) { p.y = A.floor; p.mode = 'hang'; p.modeT = 0.3; } return; }
    case 'rise': if (p.modeT <= 0) { p.mode = 'hang'; p.modeT = 0.2; } return;
    case 'stagger': if (p.modeT <= 0) { p.mode = 'hang'; p.modeT = 0.1; } return;
    case 'recover': if (p.modeT <= 0) { p.mode = 'hang'; p.modeT = 0; if (show.turn === p) show.turn = 0; show.gap = PUP.gap[(e.phase || 1) - 1]; } return;
  }
  /* FLOWN: the Harlequin goes to the height its hero stands at (the gallery, a flat's top) */
  const floor = harl && hero ? heroFloor(show, hero) : A.floor;
  if (harl && Math.abs(p.y - floor) > 3 && (p.mode === 'hang' || p.mode === 'fly')) {
    if (p.mode !== 'fly') { p.mode = 'fly'; show.n.fly++; ev.push({ t: 'fly', p }); c.sound('fly'); }
    const d = floor - p.y; p.y += Math.sign(d) * Math.min(Math.abs(d), PUP.flySpeed * dt);
    if (hero) { const dx = hero.x - p.x; p.face = Math.sign(dx) || p.face; p.x += Math.sign(dx) * Math.min(Math.abs(dx) * 0.5, 80 * dt); }
    return; }
  if (p.mode === 'fly') { p.mode = 'hang'; p.y = floor; }
  if (p.mode === 'hang') { p.floorY = floor; p.y = floor; }
  p.flown = p.floorY < A.floor - 4;
  const tm = tellOf(p.mode), f = p.face || 1;
  /* A TELL RUNS OUT: the blow */
  if (tm) { if (p.modeT > 0) { if (tm === 'stomp' || tm === 'slam') {} return; }
    const hitFront = (reach, top, dmg, name, o = {}) => { const x0 = o.both ? p.x - reach : f > 0 ? p.x : p.x - reach, x1 = o.both ? p.x + reach : f > 0 ? p.x + reach : p.x;
      c.hit([x0, x1, p.floorY - top, p.floorY], dmg, name, { from: p.x, unblockable: !!o.unblockable, up: !!o.up, grab: !!o.grab }); };
    show.n[tm] = (show.n[tm] || 0) + 1; ev.push({ t: tm, p }); c.sound(tm);
    if (tm === 'jab') { hitFront(PUP.harl.jabReach, 26, PUP.harl.jab, 'THE HARLEQUIN'); p.mode = 'jab'; p.modeT = PUP.harl.jabT; return; }
    if (tm === 'kick') { hitFront(PUP.harl.kickReach, PUP.lowTop + 2, PUP.harl.kick, 'THE HARLEQUIN', { unblockable: true }); p.mode = 'kick'; p.modeT = PUP.harl.kickT; return; }
    if (tm === 'chop') { hitFront(PUP.brute.chopReach, 44, PUP.brute.chop, 'THE BRUTE', { unblockable: true }); p.mode = 'chop'; p.modeT = 0.25; return; }
    if (tm === 'grab') { hitFront(PUP.brute.grabReach, 40, PUP.brute.grab, 'THE BRUTE', { unblockable: true, grab: true }); p.mode = 'grab'; p.modeT = 0.35; return; }
    if (tm === 'slam') { hitFront(PUP.brute.slamReach, PUP.brute.slamTop, PUP.brute.slam, 'THE SLAM', { unblockable: true, both: true, up: true }); p.mode = 'slam'; p.modeT = 0.3;
      if (p.slamY) c.hit([p.x - PUP.brute.slamReach, p.x + PUP.brute.slamReach, p.slamY - PUP.brute.slamTop, p.slamY], PUP.brute.slam, 'THE SLAM', { from: p.x, unblockable: true, up: true });
      if (e.phase >= 2) { const tx = Math.floor(p.x / A.TS); show.pits.push({ x0: tx - PUP.slamPitHalf, x1: tx + PUP.slamPitHalf, t: PUP.slamPitT }); show.n.pit++; ev.push({ t: 'pit', x: p.x }); c.pit(tx - PUP.slamPitHalf, tx + PUP.slamPitHalf, true); }
      return; }
    if (tm === 'swat') { hitFront(PUP.master.swatReach, PUP.master.swatTop, PUP.master.swat, 'THE MASTERPIECE'); p.mode = 'swat'; p.modeT = 0.3; return; }
    if (tm === 'stomp') { c.hit([p.stompX - PUP.master.stompHalf, p.stompX + PUP.master.stompHalf, A.floor - 22, A.floor], PUP.master.stomp, 'THE STOMP', { from: p.stompX, unblockable: true, up: true }); p.mode = 'stomp'; p.modeT = 0.25; return; }
    if (tm === 'reach') { p.mode = 'reach'; p.modeT = PUP.master.reachT; p.reachR = 0; return; }
  }
  switch (p.mode) {
    case 'jab': if (p.modeT <= 0) { if ((p.combo || 0) > 1 && canUse(p, 'jab') && hero && Math.abs(hero.x - p.x) < PUP.harl.jabReach + 18) { p.combo--; startTell(p, 'jabTell', PUP.harl.jabNext); p.face = Math.sign(hero.x - p.x) || p.face; c.say('!', '#ffd36b'); }
      else { p.mode = 'recover'; p.modeT = PUP.harl.rest; } } return;
    case 'kick': if (p.modeT <= 0) { p.mode = 'recover'; p.modeT = PUP.harl.rest; } return;
    case 'chop': case 'grab': case 'slam': if (p.modeT <= 0) { p.mode = 'recover'; p.modeT = PUP.brute.recover; if (show.turn === p) show.turn = 0; ev.push({ t: 'recover', p }); } return;   /* (his recovery is no blow: the Harlequin may strike in it - that is the duo) */
    case 'swat': case 'stomp': if (p.modeT <= 0) { p.mode = 'recover'; p.modeT = PUP.master.recover; } return;
    case 'reach': { const r1 = PUP.master.reachSpan * Math.min(1, 1 - Math.max(0, p.modeT) / PUP.master.reachT); p.reachR = r1;
      c.band('high', p.reachY || A.gallery, p.x - r1, p.x + r1, PUP.master.reach, 'THE REACH', 'reach' + show.n.reach);
      if (p.modeT <= 0) { p.mode = 'recover'; p.modeT = PUP.master.recover; } return; }
  }
  /* HANGING */
  if (!hero) return;
  const hf = heroFloor(show, hero), dx = hero.x - p.x, adx = Math.abs(dx), same = Math.abs(hf - p.floorY) < 6;
  p.face = Math.sign(dx) || p.face;
  if (harl) {
    /* HE DARTS: round to your other side now and then, fast (a hop you see) */
    p.dartT = (p.dartT || PUP.harl.dart) - dt;
    if (p.dartT <= 0 && same && adx < 70) { p.dartT = PUP.harl.dart + (show.n.dart % 3) * 0.4; p.dartTo = Math.max(A.x0 + 12, Math.min(A.x1 - 12, hero.x - Math.sign(dx || 1) * 30)); show.n.dart++; ev.push({ t: 'dart', p }); c.sound('dart'); }
    if (p.dartTo !== undefined) { const d = p.dartTo - p.x; p.x += Math.sign(d) * Math.min(Math.abs(d), 260 * dt); if (Math.abs(d) < 2) p.dartTo = undefined; return; }
    if (mayStrike && same && canUse(p, 'jab')) {
      const stillPunish = hero.stillT > PUP.harl.still;
      if (adx < PUP.harl.jabReach + 10 && (show.gap <= 0 || stillPunish)) { const k = (show.n.jab + show.n.kick) % 3 === 2 ? 'kick' : 'jab';
        show.turn = e.phase >= 2 ? show.turn : p; p.combo = k === 'jab' ? PUP.harl.jabs : 0; startTell(p, k + 'Tell', k === 'jab' ? PUP.harl.jabTell : PUP.harl.kickTell); ev.push({ t: k + 'Tell', p });
        c.say(k === 'jab' ? '!' : '!!', k === 'jab' ? '#ffd36b' : '#ff6b6b'); c.sound(k + 'Tell'); return; } }
    if (same && adx > PUP.harl.jabReach - 4) { p.vx = Math.sign(dx) * PUP.harl.speed; p.x = Math.max((p.flown ? A.gx0 : A.x0) + 10, Math.min((p.flown ? A.gx1 : A.x1) - 10, p.x + p.vx * dt)); }
    return; }
  if (brute) {
    /* A HERO ON A FLAT, OR IN A PIT, is no safer: the Brute's slam shakes the boards he stands on (and only the slam reaches him there) */
    const onFlat = Math.abs(hf - A.floor) > 4 && hf > A.gallery + 20;   /* (a flat's top, or down in a broken-board pit) */
    if (mayStrike && (same || onFlat) && show.gap <= 0) {
      const opts = []; if (same && canUse(p, 'chop') && adx < PUP.brute.chopReach + 6) opts.push('chop'); if (same && canUse(p, 'grab') && adx < PUP.brute.grabReach + 4) opts.push('grab');
      if (canUse(p, 'slam') && adx < PUP.brute.slamReach - 10) opts.push('slam');
      p.slamY = onFlat ? hf : null;
      if (opts.length) { const k = opts[(p.blows = (p.blows || 0) + 1) % opts.length]; show.turn = e.phase >= 2 ? show.turn : p;
        startTell(p, k + 'Tell', PUP.brute[k + 'Tell']); ev.push({ t: k + 'Tell', p }); c.say('!!', '#ff6b6b'); c.sound(k + 'Tell'); return; } }
    if ((same || onFlat) && adx > PUP.brute.range - 12) { p.hopT = (p.hopT || 0) + dt; if (p.hopT % 0.5 < 0.3) { p.vx = Math.sign(dx) * PUP.brute.speed; p.x = Math.max(A.x0 + 14, Math.min(A.x1 - 14, p.x + p.vx * dt)); } }
    return; }
  if (big) {
    if (mayStrike && show.gap <= 0) { const M = PUP.master;
      if (!same && hero.ground && canUse(p, 'reach')) { p.reachY = hf; startTell(p, 'reachTell', M.reachTell); show.turn = show.turn || p; ev.push({ t: 'reachTell', p }); c.say('!!', '#ff6b6b'); c.sound('reachTell'); return; }
      if (same && adx < M.swatReach + 6 && canUse(p, 'swat')) { startTell(p, 'swatTell', M.swatTell); show.turn = show.turn || p; ev.push({ t: 'swatTell', p }); c.say('!', '#ffd36b'); c.sound('swatTell'); return; }
      if (same && adx < 160 && adx > M.swatReach && canUse(p, 'stomp') && ((p.blows = (p.blows || 0) + 1) % 2 === 0)) { startTell(p, 'stompTell', M.stompTell); p.stompX = hero.x; show.turn = show.turn || p; ev.push({ t: 'stompTell', p }); c.say('!!', '#ff6b6b'); c.sound('stompTell'); return; } }
    if (same && adx > 44) { p.hopT = (p.hopT || 0) + dt; if (p.hopT % 0.5 < 0.3) { p.vx = Math.sign(dx) * PUP.master.speed; p.x = Math.max(A.x0 + 20, Math.min(A.x1 - 20, p.x + p.vx * dt)); } } }
}

/* ---------- ONE FRAME OF THE SHOW ----------
   c = { heroes: [{ x, y, face, alive, ground, lastFloor, stillT }], say, sound, number(x, y, line, col) (a src/hint-lines.js line), hit(box, dmg, name, { from,
         unblockable, up, duck, grab }), band(kind, floorY, x0, x1, dmg, name, key), tile(x, y, 'air'|'ledge'|'floor'), pit(x0, x1, open), summon, pack } */
export function stepShow(e, show, dt, c) {
  const ev = []; if (!e || !show) return ev;
  const A = show.A, heroes = (c.heroes || []).filter(h => h.alive);
  e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.vx = 0; show.joltCd = Math.max(0, show.joltCd - dt);
  if (e.mode !== e.lastMode) { e.lastMode = e.mode; e.tellId = (e.tellId || 0) + 1; }
  if (!e.alive || e.mode === 'sleep') return ev;
  if (e.mode === 'wake') { if (e.modeT <= 0) { e.mode = 'work'; c.number(e.x, e.y - 60, 'DROP BOTH PUPPETS AND HE COMES DOWN', '#ffd36b'); } return ev; }
  const hero = heroes.slice().sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || null;
  for (const h of heroes) if (h.lastFloor === undefined) h.lastFloor = heroFloor(show, h);
  /* the slam's broken boards mend */
  for (const pt of show.pits) { pt.t -= dt; if (pt.t <= 0 && !heroes.some(h => Math.floor(h.x / A.TS) >= pt.x0 && Math.floor(h.x / A.TS) <= pt.x1 && h.y > A.floor + 2)) { pt.done = true; c.pit(pt.x0, pt.x1, false); } }
  show.pits = show.pits.filter(pt => !pt.done);
  /* ---- THE PHASE, between beats ---- */
  const ph = pupPhase(e);
  if (ph > e.phase && (e.mode === 'work' || e.mode === 'hang1')) {
    e.phase = ph; ev.push({ t: 'phase', ph });
    if (ph === 3) { for (const p of show.puppets) if (p.t === 'marionette' && p.alive) { p.mode = 'packed'; p.alive = false; c.pack(p); }
      if (!show.puppets.some(p => p.t === 'masterpiece')) c.summon('masterpiece', (A.x0 + A.x1) / 2, A.gallery + 10);
      c.sound('masterTell'); c.number(e.x, e.y - 60, 'DROP THE KING AND THE HARLEQUIN: HE FALLS', '#ffd36b'); }
    if (ph === 2) c.number(e.x, e.y - 60, 'TOGETHER NOW: HIS SLAM BREAKS THE BOARDS', '#ffd36b'); }
  e.open = pupOpen(e) ? Math.max(0, e.modeT) : 0;
  const stage = show.puppets.filter(p => p.mode !== 'packed' && p.t !== 'acrobat');
  const live = stage.filter(p => !heaped(p));
  const busy = ['downed', 'descend', 'haul', 'scene', 'jolted'].includes(e.mode);
  if (show.turn && (heaped(show.turn) || !show.puppets.includes(show.turn) || !(/Tell$/.test(show.turn.mode) || BLOWS.includes(show.turn.mode) || show.turn.mode === 'recover'))) show.turn = 0;
  if (!show.turn) show.gap -= dt;
  /* WHO MAY STRIKE: phase 1, one at a time (the turn); phase 2 on, both */
  for (const p of show.puppets) { if (p.mode === 'packed' || !p.alive && p.mode !== 'heap') continue;
    if (busy && !heaped(p) && /Tell$/.test(p.mode)) p.mode = 'hang';
    const may = !busy && (e.phase >= 2 || !show.turn || show.turn === p || (p.t === 'harlequin' && show.turn && show.turn.t !== 'harlequin' && !/Tell$/.test(show.turn.mode) ? true : p.t === 'harlequin' && show.turn && show.turn.mode.endsWith('Tell') && show.turn.modeT < show.turn.tellLen - 0.4));   /* (phase 1: they do not START together; the Harlequin may come in while the Brute is well into a windup or a swing) */
    puppetStep(p, e, show, dt, c, ev, hero, may); }
  /* ---- HIS OWN BEATS ---- */
  switch (e.mode) {
    case 'descend': { const k = 1 - Math.max(0, e.modeT) / PUP.descendT; e.y = e.y0 + (A.floor - e.y0) * k;
      if (e.modeT <= 0) { e.y = A.floor; e.mode = 'downed'; e.modeT = PUP.downOpenT; e.open = e.modeT; e.onStage = true; show.n.downed++; ev.push({ t: 'downed' }); c.sound('land'); c.number(e.x, e.y - 60, "HE'S DOWN - STRIKE HIM", '#ffd36b'); } return ev; }
    case 'downed': if (e.modeT <= 0) { e.mode = 'haul'; e.modeT = PUP.haulT; e.open = 0; c.sound('ascend'); ev.push({ t: 'haul' }); } return ev;
    case 'haul': { const k = 1 - Math.max(0, e.modeT) / PUP.haulT; e.y = A.floor + (A.gallery - A.floor) * k;
      if (e.modeT <= 0) { e.y = A.gallery; e.onStage = false; show.cycle++; show.nextScene = sceneOf(show.cycle); if (show.nextScene === show.scene) show.nextScene = 1 + (show.scene % 3);
        e.mode = 'scene'; e.modeT = PUP.sceneT; ev.push({ t: 'sceneTell', to: show.nextScene }); c.sound('sceneTell'); c.number(e.x, e.y - 60, 'SCENE CHANGE: WATCH THE BOARDS', '#ffd36b'); } return ev; }
    case 'scene': if (e.modeT <= 0) { sceneLay(show, c); for (const p of stage) { restring(p); p.mode = p.t === 'masterpiece' ? 'lower' : 'rise'; p.modeT = p.t === 'masterpiece' ? PUP.master.lowerT : PUP.riseT; if (p.t !== 'masterpiece') p.y = A.floor; }
        show.n.rise++; c.sound('rise'); e.mode = 'work'; show.turn = 0; show.gap = 1.0; ev.push({ t: 'restrung' }); } return ev;
    case 'jolted': if (e.modeT <= 0) { e.mode = 'work'; e.open = 0; } return ev;
    case 'whipLowTell': case 'whipHighTell':
      if (e.modeT <= 0) { e.whipKind = e.mode === 'whipLowTell' ? 'low' : 'high'; e.mode = 'whip'; e.modeT = PUP.whipT; e.whipR = 0; show.n.whip++; ev.push({ t: 'whip', kind: e.whipKind }); c.sound('whip'); }
      return ev;
    case 'whip': { const r1 = PUP.whipReach * Math.min(1, 1 - Math.max(0, e.modeT) / PUP.whipT); e.whipR = r1; const f = e.face || 1;
      c.band(e.whipKind, A.gallery, f > 0 ? e.x : e.x - r1, f > 0 ? e.x + r1 : e.x, PUP.whip, 'THE WHIP', 'whip' + show.n.whip);
      if (e.modeT <= 0) { e.mode = 'work'; e.whipCd = PUP.whipEvery; e.whipR = 0; } return ev; }
  }
  /* ---- WORK: he hangs from his bar. How many of his puppets are down sets how low it hangs; with them all down he is dragged to the boards ---- */
  const down = stage.filter(p => heaped(p)).length;
  if (stage.length && down === stage.length) { e.y0 = e.y; e.mode = 'descend'; e.modeT = PUP.descendT; show.n.drop++; ev.push({ t: 'descend' }); c.sound('descend'); return ev; }
  /* one down: the other is being strung again once its time is out (he cannot hold a bar with a dead puppet for ever) */
  for (const p of stage) if (heaped(p) && p.downT <= 0 && p.mode === 'heap') { restring(p); p.mode = p.t === 'masterpiece' ? 'lower' : 'rise'; p.modeT = p.t === 'masterpiece' ? PUP.master.lowerT : PUP.riseT; p.y = p.t === 'masterpiece' ? A.gallery + 20 : A.floor; ev.push({ t: 'rise', p }); c.sound('rise'); }
  const hangTo = A.gallery + (down > 0 ? PUP.hangLow : 0);
  e.y += Math.sign(hangTo - e.y) * Math.min(Math.abs(hangTo - e.y), 80 * dt);
  e.mode = down > 0 ? 'hang1' : 'work';
  /* HIS WHIP, a hero on the gallery near him (phase 2 on) */
  const loftHero = hero && onLoft(show, hero) && Math.abs(hero.x - e.x) < PUP.whipReach + 20 ? hero : null;
  if (e.phase >= 2 && loftHero && down === 0) { e.whipCd -= dt;
    if (e.whipCd <= 0) { const kind = (e.whipN++) % 2 ? 'high' : 'low'; e.face = Math.sign(loftHero.x - e.x) || e.face || -1;
      e.mode = kind === 'low' ? 'whipLowTell' : 'whipHighTell'; e.modeT = PUP.whipTell; ev.push({ t: 'whipTell', kind }); c.say('!!', '#ff6b6b'); c.sound('whipTell'); return ev; } }
  /* HIS FEET: over his puppets */
  let tx = e.home; const tgt = live.length ? live : stage;
  if (tgt.length) tx = tgt.reduce((a, p) => a + p.x, 0) / tgt.length;
  if (hero && onLoft(show, hero)) { const hx = hero.x, away = Math.sign(e.x - hx) || 1; if (Math.abs(e.x - hx) < PUP.keep) tx = hx + away * (PUP.keep + 20); }
  tx = Math.max(A.gx0 + 16, Math.min(A.gx1 - 16, tx));
  if (Math.abs(tx - e.x) > 4) { e.vx = Math.sign(tx - e.x) * PUP.pace * 1.6; e.x += e.vx * dt; }
  if (hero) e.face = Math.sign(hero.x - e.x) || e.face;
  return ev;
}
/* THE HARD WAY: a blow on the line he hangs from, from the gallery: he is jolted down onto the boards of the gallery, open */
export function hangLine(e, show) { const A = show.A; return { x0: e.x + 3, y0: A.y0, x1: e.x + 3, y1: e.y - 40 }; }
export function strikeLine(e, show, hb) {
  if (!e || !show || show.joltCd > 0 || !['work', 'hang1'].includes(e.mode)) return false;
  const l = hangLine(e, show); if (!segHitsBox(l.x0, l.y0, l.x1, l.y1, hb)) return false;
  e.mode = 'jolted'; e.modeT = PUP.joltT; e.open = e.modeT; e.y = show.A.gallery; show.joltCd = PUP.joltCd; show.n.jolt++; return true;
}
function sceneLay(show, c) {
  const A = show.A, sx = A.sx, R = Math.round(A.floor / A.TS), cells = new Map();
  for (const [x0, x1, h] of SCENES[show.scene].flats) for (let x = x0; x <= x1; x++) cells.set((sx + x) + ',' + (R - h), { x: sx + x, y: R - h, t: 'air' });
  for (const [x0, x1, h] of SCENES[show.nextScene].flats) for (let x = x0; x <= x1; x++) cells.set((sx + x) + ',' + (R - h), { x: sx + x, y: R - h, t: 'ledge' });
  for (const o of cells.values()) c.tile(o.x, o.y, o.t);
  show.scene = show.nextScene; show.n.scene++;
}

/* ---------- THE STAGE ----------
   FOOTPRINT: 40 columns wall to wall, rows R-16 .. R+1 the stage's own, and ROW R+2 SOLID under the whole stage (the slam's broken boards drop to it).
   Returns { arena, movers } (movers: the batten, for moversExtra). */
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
  ent('sign', 4, S, { text: 'THE MAIN STAGE. DROP HIS PUPPETS AND HE COMES DOWN TO YOU.' });
  ent('check', 7, S);
  const { arena, movers } = stagePuppeteer({ set, block, plat, ent }, T, TS, 14, R);
  ent('gate', 58, S);
  block(54, 62, 0, R - 8);
  return { W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: S }, pools: [], falls: [], moversExtra: movers, interiors: [[1, 13, 13, S], [15, 52, 5, S], [54, 62, 13, S]], arena, gateAfterBoss: true,
    music: 'puppeteer', palette: { set: 'village', dress: 'village', sky: 'dusk', far: 'town', mid: 'town', near: 'town', nearSet: 'town', haze: 'rgba(120,40,60,0.10)' },
    ambient: [{ x0: 0, x1: 99999, kind: 'tavern' }] };
}

/* ---------- THE BOT'S READING (src/lab.js): A HUMAN BOT ----------
   It sees a tell PLAN.react s after it began, misreads PLAN.missDodge of them, and goes for a string (rather than the body) PLAN.goString of the time.
   s = { P: { x, y, face, ground, atk }, e, show, reach, shield, onBatten, t, rng, mem } */
export const PLAN = { react: 0.25, missDodge: 0.18, goString: 0.5 };
export function puppetPlan(s) { const out = planOf(s), P = s.P, A = s.show.A;
  if (P.ground && P.y > A.floor + 8 && !out.down) { out.jump = true; if (out.gx == null) out.gx = P.x + (P.face || 1) * 30; }   /* in a broken-board pit, going somewhere: jump out */
  return out; }
function planOf(s) {
  const { P, e, show, reach } = s, A = show.A, out = { gx: null, face: P.face, atk: false, jump: false, down: false, drop: false, block: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = key => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= PLAN.react; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const keyOf = p => (p.t || 'him') + '|' + p.mode + '|' + (p.tellId || 0);
  const sees = p => seenFor(keyOf(p)), dodges = p => sees(p) && !roll(keyOf(p) + '|d', PLAN.missDodge);
  const onGal = Math.abs(P.y - A.gallery) < 6 && P.ground, onStage = P.y > A.gallery + 20, clampX = x => Math.max(A.x0 + 12, Math.min(A.x1 - 12, x));
  const pups = show.puppets.filter(p => p.alive && !heaped(p) && p.mode !== 'packed' && p.mode !== 'lower');
  const near = (p, r) => Math.abs(p.x - P.x) < r && Math.abs((p.floorY ?? p.y) - P.y) < 14;
  /* ---- 1. HE IS OPEN: to him ---- */
  if (pupOpen(e) && sees(e)) { const hisFloor = e.y > A.gallery + 20 ? 'stage' : 'loft';
    if ((hisFloor === 'stage' && onStage) || (hisFloor === 'loft' && onGal)) { const d = e.x - P.x; out.face = Math.sign(d) || 1; out.gx = Math.abs(d) > reach - 4 ? e.x - out.face * (reach - 8) : null; out.atk = Math.abs(d) < reach + 8; out.why = 'open'; }
    else if (hisFloor === 'stage' && onGal) { out.drop = true; out.why = 'down to him'; return out; } }
  if (e.mode === 'descend' && onStage && sees(e)) { const d = e.x - P.x; out.face = Math.sign(d) || 1; out.gx = clampX(e.x - out.face * (reach - 10)); out.why = 'under him'; }
  /* ---- 2. A BLOW COMING at you: answer it (a misread is a miss) ---- */
  const threats = pups.filter(p => { const k = tellOf(p.mode) || p.mode; return BLOWS.includes(k) && (/Tell$/.test(p.mode) || BLOWS.includes(p.mode)) && sees(p); })
    .sort((a, b) => (/Tell$/.test(a.mode) ? a.modeT : 0) - (/Tell$/.test(b.mode) ? b.modeT : 0));
  for (const p of threats) { const k = tellOf(p.mode) || p.mode, tell = /Tell$/.test(p.mode); if (!dodges(p)) continue;
    const r = k === 'slam' ? PUP.brute.slamReach : k === 'chop' ? PUP.brute.chopReach : k === 'grab' ? PUP.brute.grabReach : k === 'jab' ? PUP.harl.jabReach : k === 'kick' ? PUP.harl.kickReach : k === 'swat' ? PUP.master.swatReach : 60;
    if (k === 'stomp' && Math.abs(p.stompX - P.x) < PUP.master.stompHalf + 14) { out.gx = clampX(p.stompX + (P.x < p.stompX ? -50 : 50)); out.atk = false; out.why = 'the stomp'; return out; }
    if (k === 'reach' && Math.abs((p.reachY || A.gallery) - P.y) < 6 && (!tell || p.modeT < 0.35)) { out.down = true; out.atk = false; out.why = 'duck the reach'; return out; }
    if (!near(p, r + 16)) continue;
    if ((k === 'slam' || k === 'kick') && (!tell || p.modeT < 0.18) && P.ground) { out.jump = true; out.why = 'jump the ' + k; return out; }
    if ((k === 'jab' || k === 'swat') && s.shield && (!tell || p.modeT < (k === 'jab' ? 0.2 : 0.35))) { out.block = true; out.atk = false; out.face = Math.sign(p.x - P.x) || 1; out.why = 'block the ' + k; return out; }
    if (tell && p.modeT < (k === 'jab' ? 0.25 : 0.45) && k !== 'slam' && k !== 'kick') { out.gx = clampX(p.x + (P.x < p.x ? -1 : 1) * (r + 22)); out.atk = false; out.why = 'back off the ' + k; return out; } }
  if (out.why === 'open' || out.why === 'under him') return out;
  /* ---- 3. OFFENCE: the Brute in his recovery first (the big window), else the Harlequin when he is close, else the nearest one ---- */
  const brute = pups.find(p => p.t === 'marionette' || p.t === 'masterpiece'), harl = pups.find(p => p.t === 'harlequin');
  const recovering = brute && brute.mode === 'recover' && sees(brute);
  let tgt = recovering ? brute : harl && near(harl, 60) ? harl : brute || harl;
  if (!tgt) return out;
  /* a string, or the body: decided once a target-window */
  const wantString = roll(keyOf(tgt) + '|s', PLAN.goString);
  const blade = P.y - 9, strs = stringsOf(e, show).filter(q => q.p === tgt).map(q => { const k2 = q.y1 === q.y0 ? 1 : Math.max(0, Math.min(1, (blade - q.y0) / (q.y1 - q.y0))); return { x: q.x0 + (q.x1 - q.x0) * k2, y: q.y0 + (q.y1 - q.y0) * k2 }; }).filter(o => Math.abs(o.y - blade) < 7);
  const aim = wantString && strs.length ? strs.sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0].x : tgt.x;
  /* not into a Brute winding up (wait out of his reach for the recovery) */
  if (tgt === brute && /Tell$/.test(brute.mode) && dodges(brute)) { const r = PUP.brute.slamReach + 20; out.gx = clampX(brute.x + (P.x < brute.x ? -1 : 1) * r); out.face = Math.sign(brute.x - P.x) || 1; out.why = 'wait out the windup'; return out; }
  /* on a flat over a target on the boards: drop down to it */
  if (P.ground && P.y < A.floor - 20 && P.y > A.gallery + 20 && (tgt.floorY ?? tgt.y) > P.y + 20 && Math.abs(tgt.x - P.x) < 120) { out.drop = true; out.why = 'down off the flat'; return out; }
  const d = aim - P.x, side = Math.sign(d) || 1, stand = tgt === brute && !wantString ? (tgt.w || 18) / 2 + reach - 8 : reach - 10;
  out.face = side; if (Math.abs(d) > stand + 2) out.gx = clampX(aim - side * stand);
  out.atk = Math.abs(d) < stand + 8 && Math.abs((tgt.floorY ?? tgt.y) - P.y) < 30; out.why = (wantString ? 'cut the ' : 'hit the ') + NAME[tgt.t];
  /* THE HARLEQUIN PUNISHES STANDING STILL: shuffle */
  if (!out.gx && !out.atk && harl && near(harl, 50)) out.gx = clampX(P.x + (P.x < harl.x ? -14 : 14));
  return out;
}

/* ---------- THE FRAME each body shows ---------- */
export function pupFrame(e) {
  const a = e.anim || 0, m = e.mode || '';
  if (e.t === 'puppeteer') {
    if (m === 'whipLowTell' || m === 'whipHighTell') return PUP_F.tell;
    if (m === 'whip') return PUP_F.whip;
    if (m === 'descend') return PUP_F.ride;
    if (m === 'haul') return PUP_F.climb;
    if (m === 'downed' || m === 'jolted') return PUP_F.fallen;
    if (m === 'hang1') return PUP_F.ride;
    if (e.flash > 0.05) return PUP_F.hurt;
    return PUP_F.work[Math.floor(a * 3) % 2];
  }
  if (e.t === 'masterpiece') {
    if (m === 'heap' || m === 'collapse') return MP_F.heap;
    if (m === 'swatTell') return MP_F.swatTell; if (m === 'swat') return MP_F.swat;
    if (m === 'stompTell') return MP_F.stompTell; if (m === 'stomp') return MP_F.stomp;
    if (m === 'reachTell') return MP_F.reachTell; if (m === 'reach') return MP_F.reach;
    if (m === 'stagger' || m === 'recover') return MP_F.stagger;
    if (Math.abs(e.vx || 0) > 2) return MP_F.walk[Math.floor(a * 4) % 2];
    return MP_F.hang;
  }
  if (m === 'heap') return MAR_F.heap;
  if (m === 'fall' || m === 'fly') return MAR_F.drop;
  if (m === 'slamTell') return MAR_F.highTell; if (m === 'slam') return MAR_F.drop;
  if (m === 'kickTell') return MAR_F.highTell; if (m === 'kick') return MAR_F.high;
  if (m === 'grabTell') return MAR_F.highTell; if (m === 'grab') return MAR_F.high;
  if (m.endsWith('Tell')) return MAR_F.tell;
  if (BLOWS.includes(m)) return MAR_F.blow;
  if (m === 'stagger' || m === 'recover') return MAR_F.stagger;
  if (m === 'rise') return MAR_F.rise;
  if (e.str && e.str.some(s => s.cut)) return MAR_F.stagger;   /* a limb hangs limp */
  if (Math.abs(e.vx || 0) > 2) return MAR_F.hop[Math.floor(a * 5) % 2];
  return MAR_F.hang;
}
