// tools/skeleton-king.mjs — THE SKELETON KING's fight logic (src/skeleton-king.js) on the light (src/light.js) and the storm
// (src/desert-rules.js), proved in Node: the room's beams go where the design says, the four told attacks all fire and every one has
// an answer in a human quarter-second, nothing makes him untouchable for long, the three phases come in order with their layers AT
// ONCE, and THE OPENING is caused - a fighter who works the mirrors and windows burns him, one who only swings never does.
// Logic and fight rules, NOT balance: the pilot in the page (>= 21 runs at normal health) is the boss batch's.
import { T } from '../src/level.js';
import { trace, turnMirror, litBox, makeOpaque } from '../src/light.js';
import { KING, newKing, kingStep, kingHurt, kingTouchable, kingSources, kingBox, ARENA_MIRRORS, ARENA_WINDOWS } from '../src/skeleton-king.js';
import { newStorm, stormStep, gustDrift } from '../src/desert-rules.js';
let fails = 0; const log = s => console.log(s), ok = (c, m) => { log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const DT = 1 / 60, W = 40, H = 14, F = KING.floor;
const g = new Uint8Array(W * H); for (let x = 0; x < W; x++) { g[0 * W + x] = x === 20 ? 0 : T.SOLID; for (let y = F; y < H; y++) g[y * W + x] = T.SOLID; } for (let y = 0; y < F; y++) { g[y * W] = y === 5 ? 0 : T.SOLID; g[y * W + W - 1] = y === 5 ? 0 : T.SOLID; }
const tileAt = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : g[y * W + x], opaque = makeOpaque(T), opts = { opaque, W, H };
const colLit = (res, col) => res.lit.has(col + ',' + (F - 1));

log('THE ROOM\'S LIGHT');
{ const M = ARENA_MIRRORS(), win = ARENA_WINDOWS(), K = newKing(20 * 16);
  const at = () => trace(tileAt, kingSources(K, win), M, [], opts);
  const r0 = at(); ok(!colLit(r0, 20) && !colLit(r0, 6) && !colLit(r0, 33), 'as the fight opens the altar mirror throws the sun into the vault: no beam on the floor');
  turnMirror(M[1]); const r1 = at(); ok(colLit(r1, 6) && !colLit(r1, 33), 'turn the west wall mirror and the beam the altar throws west comes down column 6 to the floor');
  turnMirror(M[0]); const r2 = at(); ok(!colLit(r2, 6) && !colLit(r2, 33), 'turn the altar east and the west column is dark (and the east mirror still throws it up): one mirror is never enough');
  K.capstone = false; win[1].open = true; const M2 = ARENA_MIRRORS(); M2[2].state = '/'; const r3 = trace(tileAt, kingSources(K, win), M2, [], opts); M2[2].state = '\\'; const r4 = trace(tileAt, kingSources(K, win), M2, [], opts);
  ok(!colLit(r3, 20) && (colLit(r3, 33) || colLit(r4, 33)), 'in the dark (capstone shut) an opened east window, routed by the east wall mirror, lights column 33 - and nothing else is lit'); }

/* THE FIGHT. A scripted fighter: walks to him and swings (20 a blow, 0.4 s), answers each tell 0.25 s after it shows (the hook:
   block; the sweep: a jump; the spikes: step off the marked tiles; the flare: step out of any beam), and if `mirrors`, works the
   room: when he stands within a tile of a wall column, turns the mirrors (and in the dark opens that side's window) to put the
   beam on him. The court is counted as a layer, not fought. */
function fight(mirrors, seed = 1) {
  const K = newKing(20 * 16), M = ARENA_MIRRORS(), win = ARENA_WINDOWS(), storm = newStorm([1, -1]);
  let px = 12 * 16, t = 0, swing = 0, pending = [], hits = 0, blocked = 0, jumpT = 0, block = 0, flee = 0, fleeFrom = 0, inv = 0, court = [], priestT = 0;
  const S = { opens: 0, tells: {}, phaseAt: {}, maxUntouch: 0, untouch: 0, layers2: 0, layers3: 0, t: 0, hitsBy: {}, courtMax: 0, turns: 0 };
  const route = side => { // put the beam down the wall column on `side` (west 6 / east 33)
    const wm = M[side === 'west' ? 1 : 2], want = side === 'west' ? '/' : '\\';
    if (K.capstone) { const altarWant = side === 'west' ? '/' : '\\'; if (M[0].state !== (side === 'west' ? '/' : '\\')) { turnMirror(M[0]); S.turns++; } }   // the altar sends S->W with '/', S->E with '\'
    else { const w0 = win.find(w => w.name === side); if (!w0.open) { w0.open = true; S.turns++; } }
    // the wall mirror: coming from the altar the beam runs W along row 5 into the west mirror ('/' sends W->S) or E into the east ('\' sends E->S);
    // coming from a window it runs E into the west mirror ('\' sends E->S) or W into the east ('/' sends W->S)
    const need = K.capstone ? (side === 'west' ? '/' : '\\') : (side === 'west' ? '\\' : '/');
    if (wm.state !== need) { turnMirror(wm); S.turns++; } void want; };
  while (t < 400 && K.hp > 0) {
    const res = trace(tileAt, kingSources(K, win), M, [], opts);
    if (mirrors) { const kc = Math.floor(K.x / 16); if (Math.abs(kc - 6) <= 1) route('west'); else if (Math.abs(kc - 33) <= 1) route('east'); }
    const out = kingStep(K, { px, py: F * 16, lightRes: res, windows: win }, DT, litBox);
    for (const o of out) {
      if (o.t === 'tell') { S.tells[o.what] = (S.tells[o.what] || 0) + 1; pending.push([t + 0.25, o]); }
      if (o.t === 'open') S.opens++;
      if (o.t === 'court') { court = o.spawn.map((c, i) => ({ ...c, until: t + 20 + i * 4 })); priestT = KING.priestShut; }   /* the court falls in 20-28 s (other blows, abstracted: fixed, not random) */
      if (o.t === 'mode') S.phaseAt[o.mode] = t;
      if (o.t === 'stormOn') S.phaseAt.storm = t;
      if (o.t === 'hit' && inv <= 0) { let hit = false;
        if (o.beams) hit = res.lit.has(Math.floor(px / 16) + ',' + (F - 1));
        else if (o.box) hit = px >= o.box[0] - 5 && px <= o.box[1] + 5 && (jumpT > 0 ? o.box[2] < F * 16 - 30 : true);
        if (hit) { if (o.blockable && block > 0) blocked++; else { hits++; S.hitsBy[o.what] = (S.hitsBy[o.what] || 0) + 1; inv = 0.8; } } }
    }
    pending = pending.filter(([at, o]) => { if (t < at) return true;
      if (o.what === 'hook') block = 0.6; else if (o.what === 'sweep') jumpT = 0.55; else if (o.what === 'spikes') { flee = 0.7; fleeFrom = (o.tiles[1] + 0.5) * 16; } else if (o.what === 'flare') { flee = 0.9; fleeFrom = -1; }
      return false; });
    // the priest shuts an open window every priestShut seconds while it lives (the court is a layer: counted, not fought)
    if (K.phase === 2 && court.some(c => c.kind === 'priest')) { priestT -= DT; if (priestT <= 0) { priestT = KING.priestShut; for (const w of win) w.open = false; } }
    S.courtMax = Math.max(S.courtMax, court.length);
    if (K.phase >= 2 && court.length && (!K.capstone || K.storm)) S.layers2 += DT;
    if (K.phase === 3 && K.storm && court.length) S.layers3 += DT;
    if (K.phase === 3) { const st = stormStep(storm, DT); px += gustDrift(st, { braced: block > 0 }) * DT * 0.3; }
    // move: flee a tell's spot, else close in and swing; the court thins over time (other heroes' blows, abstracted)
    if (flee > 0) { const from = fleeFrom < 0 ? K.x : fleeFrom; const inBeam = fleeFrom < 0 && res.lit.has(Math.floor(px / 16) + ',' + (F - 1)); px += (Math.sign(px - from) || 1) * 92 * DT * (fleeFrom < 0 && !inBeam ? 0 : 1); flee -= DT; }
    else if (mirrors && Math.abs(K.x - px) > 24) { const home = (px < W * 8 ? 4.3 : 34.7) * 16; px += Math.sign(home - px) * Math.min(92 * DT, Math.abs(home - px)); }   /* BAIT HIM: wait under a wall mirror, just outside its column, and let him walk into the beam */
    else if (Math.abs(K.x - px) > 24) px += Math.sign(K.x - px) * 92 * DT * (block > 0 ? 0.3 : 1);
    px = Math.max(24, Math.min(W * 16 - 24, px));
    swing -= DT; if (swing <= 0 && Math.abs(K.x - px) < 30 && kingTouchable(K)) { kingHurt(K, 20); swing = 0.4; }
    court = court.filter(c => t < c.until);
    const touch = kingTouchable(K); if (!touch) { S.untouch += DT; S.maxUntouch = Math.max(S.maxUntouch, S.untouch); } else S.untouch = 0;
    block = Math.max(0, block - DT); jumpT = Math.max(0, jumpT - DT); inv = Math.max(0, inv - DT); t += DT;
  }
  S.t = t; S.hp = K.hp; S.hits = hits; S.blocked = blocked; return S;
}
log('THE FIGHT (logic and rules, not balance)');
const A = fight(true), B = fight(false);
ok(['hook', 'sweep', 'spikes', 'flare'].every(k => A.tells[k] > 0), `A1/A3: four told attacks, every one fired (${Object.entries(A.tells).map(([k, n]) => k + ' x' + n).join(', ')})`);
ok(A.phaseAt.shut !== undefined && A.phaseAt.tear > A.phaseAt.shut && A.phaseAt.storm >= A.phaseAt.tear, `the phases come in order: the capstone shuts at ${A.phaseAt.shut?.toFixed(0)} s, is torn off at ${A.phaseAt.tear?.toFixed(0)} s, and the storm pours in`);
ok(Math.max(A.maxUntouch, B.maxUntouch) <= KING.shutT + 0.05, `A5: the longest he cannot be hit is ${Math.max(A.maxUntouch, B.maxUntouch).toFixed(2)} s (the capstone moments)`);
ok(A.layers2 > 5 && A.layers3 > 0 && A.courtMax <= KING.courtCap, `the layers run at once: ${A.layers2.toFixed(0)} s with him + the court + the dark or the storm together, ${A.layers3.toFixed(1)} s with all three of phase 3; the court never over ${KING.courtCap}`);
ok(A.opens >= 3 && B.opens === 0, `THE OPENING IS CAUSED: working the mirrors and windows burned him ${A.opens} times (${A.turns} turns); only swinging, ${B.opens}`);
ok(A.hp === 0 && (B.hp > 0 || B.t > A.t * 1.25), `the opening matters: the mirror fighter wins in ${A.t.toFixed(0)} s; the swinger ${B.hp > 0 ? 'has not in ' + B.t.toFixed(0) + ' s (' + Math.round(B.hp) + ' left)' : 'takes ' + B.t.toFixed(0) + ' s'} (scripted: a shape, not a balance)`);
ok(A.hits === 0, `a fighter who answers each tell in 0.25 s takes ${A.hits} hits from him ${JSON.stringify(A.hitsBy)} (${A.blocked} hooks blocked)`);
console.log(fails ? `\nskeleton-king: ${fails} FAILED` : '\nskeleton-king: all passed');
process.exit(fails ? 1 : 0);
