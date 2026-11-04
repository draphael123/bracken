// src/arena-yard.js - THE ARENA YARD (claude/arenayard, Daniel 11-03; scratch/plan-arenayard-1103.md): ONE shared practice yard that replaces the
// open / per-class yard as the default training stop. It is a level ('arena_yard', LEVELS, appended) built here and a runtime (makeArenaYard) that
// main.js wires in. Two rules the whole file keeps:
//   - NO `trial` flag on the level. `trial` is truthy-tested all over main.js and it switches CO-OP OFF; the yard's safety is its own flag, `arenaYard`
//     (main.js `yardSafe()`), so a party of up to four can train here together. `openYard: true` gives it the inn's rules (no death cost, straw respawns).
//   - Dummies hit for NOTHING but read as hits (knock-back, flash, sound, a red HIT). What a block / parry / ward does is the hero's own kit, graded
//     PERFECT / GOOD / HIT from the game's own counters: no new timing window is made here.
// Placeholder art: the existing palette and plain rails. The ART lane (claude/arenayardart) draws the arena set; the ids it should keep are in YARD_ART.
export const AY = { W: 164, H: 30, FLOOR: 22, START: 5 };
/* the stations, by column: x0..x1 is the zone an attacking dummy is awake in (every other dummy is held asleep while no living player is inside) */
export const STATIONS = [
  { id: 'gate', x0: 2, x1: 11, name: 'THE GATE', sign: 'THE ARENA YARD. NOTHING HERE ENDS YOU. UP AT THE BOARD: YOUR MOVES.', at: 4 },
  { id: 'straw', x0: 13, x1: 28, name: 'THE STRAW ROW', sign: 'X X X: THE THIRD CUT. DODGE THEN X: DASH ATTACK.', at: 14,
    signBy: { geomancer: 'X X X: THE FIST PLANTS A STONE. THREE UP? DOWN+C: BLOW THEM ALL.' } },   /* (claude/geopop d) a sign speaks to the hero reading it (main.js: e[hero()] || e.text); the yard counts STONES n/3, then DETONATED xN, in GRADE gold */
  { id: 'steps', x0: 30, x1: 44, name: 'THE STEPS', sign: 'JUMP. DOWN+JUMP ON A PLANK DROPS THROUGH.', at: 30 },
  { id: 'gap', x0: 46, x1: 55, name: 'THE GAP', sign: 'THE GAP: DODGE OVER, OR PLUNGE THE STRAW BELOW.', at: 46 },
  { id: 'climb', x0: 57, x1: 68, name: 'THE CLIMB', sign: 'CLIMB, THEN DOWN+X IN THE AIR: THE PLUNGE.', at: 57 },
  { id: 'guard', x0: 72, x1: 88, name: 'THE GUARD PEN', sign: 'A GUARD TURNS A LIGHT BLOW. HOLD X / DOWN+X UNDER / UP+X LIFTS.', at: 72 },
  { id: 'slow', x0: 92, x1: 106, name: 'THE SLOW SWINGER', sign: 'HE SWINGS SLOW. HOLD C (YOUR GUARD) AND TAKE IT.', at: 92, grade: true },
  { id: 'flash', x0: 110, x1: 124, name: 'THE FLASH', sign: 'HIS SWORD FLASHES WHITE: GUARD ON THE FLASH. PERFECT OPENS HIM.', at: 110, grade: true },
  { id: 'archer', x0: 128, x1: 160, name: 'THE ARCHER', sign: 'HIS ARROWS: GUARD, PARRY OR DEFLECT THEM. YOUR BOARD SAYS HOW.', at: 128, grade: true },
];
/* the three things you walk up to and press UP at (the move board's plate is read in main.js; these are columns) */
export const SPOTS = { start: 5, board: 8, leave: 11 };   /* (claude/yardswap) the TRIALS DOOR (col 3) is gone with the hero trials */
export const BARRIERS = [12, 29, 45, 56, 70, 90, 108, 126];   /* deco only: an oak rail between stations (no collision) */
/* the art ids the ART lane keeps (plan section 2): tiles, deco kinds, backdrop */
export const YARD_ART = { palette: 'arena', deco: ['arenaBarrier', 'weaponRack', 'pennonPole', 'brazier', 'moveBoard', 'leaveGate'], skins: ['strawSword', 'strawBow'] };
export const GRADE = { PERFECT: { txt: 'PERFECT', col: '#ffd36b' }, GOOD: { txt: 'GOOD', col: '#fff6e0' }, HIT: { txt: 'HIT', col: '#ff6b6b' } };

/* the level: painter + tile ids handed in by level.js (the way src/lumber-trail.js is). Returns the level object. */
export function buildArenaYard({ painter, T }) {
  const { W, H, FLOOR: F } = AY, L = painter(W, H);
  const { block, plat, ent, coins, set } = L;
  const gy = F - 1;                                                       // the row a thing stands on (the floor's top is row 22)
  block(0, W - 1, F, H - 1); block(0, 1, 0, F - 1); block(W - 2, W - 1, 0, F - 1);   // the yard, walled
  for (const s of STATIONS) ent('sign', s.at, gy, { text: s.sign, ...(s.signBy || {}) });
  for (const x of [20, 40, 64, 80, 100, 118, 136, 156]) ent('torch', x, gy);
  for (const x of BARRIERS) ent('deco', x, gy, { kind: 'arenaBarrier', v: x % 2 });
  for (const x of [12, 29, 56, 90, 126]) ent('deco', x, gy, { kind: 'pennonPole', v: x & 1 });   /* (claude/arenayardart) arena dressing, deco only: pennon poles on the rails, practice racks, two braziers */
  for (const x of [15, 75, 97, 114, 133]) ent('deco', x, gy, { kind: 'weaponRack' });
  for (const x of [6, 142]) ent('deco', x, gy, { kind: 'brazier' });
  ent('deco', SPOTS.board, gy, { kind: 'moveBoard' }); ent('deco', SPOTS.leave, gy, { kind: 'leaveGate' });
  // ---- the straw row: three men on the floor ----
  for (const x of [18, 22, 26]) ent('dummy', x, gy);
  // ---- the steps: one-way planks 19/17/15/13, a man on the top ----
  plat(31, 19, 4); plat(35, 17, 4); plat(39, 15, 4); plat(43, 13, 2);
  coins([32, 18], [36, 16], [40, 14], [44, 12]);
  ent('dummy', 43, 12);
  // ---- the gap: eight wide, a floor six rows down, a ledge to climb out by, and a man at the bottom to plunge ----
  for (let x = 47; x <= 54; x++) for (let y = F; y < H; y++) set(x, y, T.AIR);
  block(47, 54, 28, H - 1); plat(53, 25, 2);
  ent('dummy', 50, 27);
  // ---- the climb: a pillar faced with net, a ledge at the top, two men below ----
  block(60, 61, 8, gy); for (let y = 9; y <= gy - 1; y++) { set(60, y, T.NET); set(61, y, T.NET); }
  plat(62, 8, 6); coins([63, 7], [66, 7]);
  ent('dummy', 64, gy); ent('dummy', 67, gy);
  // ---- the guard pen: a guard that turns a light blow and a soldier behind it, both straw ----
  ent('shield', 82, gy, { face: -1, trainer: 'still', lx0: 74, lx1: 86 }); ent('soldier', 86, gy, { face: -1, trainer: 'still', lx0: 74, lx1: 87 });
  // ---- the slow swinger and the flash: a straw swordsman each, awake only while somebody stands in the station ----
  ent('swornsword', 102, gy, { face: -1, trainer: 'drill', lx0: 94, lx1: 105, yardZone: [92, 106], yardPace: 2.0 });
  ent('swornsword', 120, gy, { face: -1, trainer: 'drill', lx0: 112, lx1: 123, yardZone: [110, 124], yardTell: true, cnSkin: 'strawflash' });
  // ---- the archer: on a stand, facing the way you came; he never goes down and shoots only while somebody is in his station ----
  block(150, 154, gy - 1, gy);
  ent('archer', 152, gy - 2, { face: -1, trainer: 'drill', lx0: 140, lx1: 158, yardZone: [128, 160] });
  ent('sign', 160, gy, { text: 'THE YARD ENDS HERE. BACK TO THE GATE FOR THE BOARD AND THE WAY OUT.' });
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: SPOTS.start, y: gy }, pools: [], falls: [], moversExtra: [], interiors: [],
    reskin: { swornsword: 'strawsword', archer: 'strawbow' }, openYard: true, arenaYard: { stations: STATIONS, spots: SPOTS, floor: AY.FLOOR, gate: [2, 13] }, duskStart: -1, duskLen: 1, music: 'arenayard', reachExact: true, noCoin: true,
    palette: { set: 'arena', sky: 'autumn', near: 'none', noFg: true, noNear: true, dress: 'arena', haze: 'rgba(200,120,80,0.12)', grass: '#6a8a3a', grassL: '#9ac050', grassD: '#3a5a24', dirt: '#34302a', dirtL: '#524c44', dirtD: '#24201c' },
  };
}

/* THE GRADE of one blow at a hero, from the game's own counters. `snap` is what damagePlayer's wrapper read BEFORE the call (parries, RP parries,
   the hero's parryT); `res` is damagePlayer's answer ('hit' / 'blocked' / false). A blocked blow is PERFECT when any counter moved or the hero's
   parry timer was just set (every kit's perfect sets one of them); a plain guard / ward is GOOD; a landed blow is HIT; a miss (rolled, ducked) says nothing. */
export function gradeOf(res, snap, now) {
  if (res === 'hit') return 'HIT';
  if (res !== 'blocked') return null;
  const perfect = now.parries > snap.parries || now.rpParries > snap.rpParries || now.fwParryAt !== snap.fwParryAt || now.parryT >= 0.2 && (snap.parryT < 0.2 || now.parryT > snap.parryT) || now.geoBeat || now.retSince < 0.02 || now.palOpened;
  return perfect ? 'PERFECT' : 'GOOD';
}
/* which station a column is in */
export const stationAt = col => STATIONS.find(s => col >= s.x0 && col <= s.x1) || null;
/* an attacking dummy sleeps unless a living player is inside its zone [x0, x1] (columns): a list of {x, dead, down} and the tile size */
export function zoneAwake(zone, ps, TS) { if (!zone) return true; return ps.some(p => p && !p.dead && !(p.down > 0) && p.x >= zone[0] * TS && p.x < (zone[1] + 1) * TS); }

/* THE RUNTIME. api: { L, players, time, TS, number(x,y,txt,col), hint(msg, secs), sfx(k), pressOf(p), eatTalk(p), openBoard(p), leave(), nums } */
export function makeArenaYard(api) {
  const st = { cheer: 0, cheerAt: -9, saidFirst: new Set(), stats: { perfect: 0, good: 0, hit: 0, boards: 0, leaves: 0 }, last: null, near: new Map() };
  const on = () => !!api.L() && !!api.L().arenaYard;
  const TS = api.TS;
  const spotX = c => c * TS + TS / 2;
  /* the nearest thing a hero can use: the board, the leave gate */
  function spotNear(p) {
    if (!p || p.dead || p.down > 0 || !p.ground) return null;
    for (const [id, c] of [['board', SPOTS.board], ['leave', SPOTS.leave]]) if (Math.abs(spotX(c) - p.x) < 20 && Math.abs(p.y - (AY.FLOOR) * TS) < 28) return id;
    return null;
  }
  const VERB = { board: 'YOUR MOVES', leave: 'LEAVE' };
  const FIRST = { board: 'THE MOVE BOARD: EVERY MOVE THIS HERO HAS. LEFT / RIGHT TURN THE PAGE.', leave: 'THE GATE OUT: BACK TO THE INN OR THE MAP.' };
  /* hold an attacking dummy asleep while nobody is in its station: its cooldown (and an archer's draw) never runs out */
  function hold(e, dt) {
    /* (claude/arenafinish) THE ARCHER STAYS ON HIS MARK: a parry that shoves him (the Blood Knight's return, a bind) leaves him a few px off, and his lobbed arrows then land short of the stand -
       ungradeable. Once he is no longer reeling he walks back to where he was placed. */
    if (e.t === 'archer' && e.yardZone) { if (e.homeX === undefined) e.homeX = e.x; else if (!(e.stagger > 0) && !(e.rpHold > 0) && Math.abs(e.homeX - e.x) > 0.5) e.x += Math.sign(e.homeX - e.x) * Math.min(Math.abs(e.homeX - e.x), 60 * (dt || 1 / 60)); }
    if (!e.yardZone || zoneAwake(e.yardZone, api.players(), TS)) return;
    e.cd = Math.max(e.cd || 0, 0.5); e.timer = Math.max(e.timer || 0, 0.5); if (e.t === 'archer') e.draw = 0;
  }
  function grade(g, p, foeX) {
    if (!g) return; const G = GRADE[g]; st.stats[g.toLowerCase()]++; st.last = { g, t: api.time() };
    api.nums(p.x, p.y - 38, G.txt, G.col);
    if (g === 'PERFECT') { st.cheer = 1; st.cheerAt = api.time(); api.sfx('cheer'); api.sfx('sting'); }
  }
  function tick(dt) {
    if (!on()) { st.board = null; return; } st.cheer = Math.max(0, st.cheer - dt);
    if (st.board && (!api.players().includes(st.board.p) || st.board.p.dead)) st.board = null;   /* a new yard (a restart, a re-entry) never inherits the last reader's board */
    for (const p of api.players()) {
      const s = spotNear(p); st.near.set(p, s);
      if (s && !st.saidFirst.has(s)) { st.saidFirst.add(s); api.hint(FIRST[s], 5); }
      const pr = api.pressOf(p);
      if (s && pr.talk) { api.eatTalk(p); st.stats[s === 'board' ? 'boards' : 'leaves']++; if (s === 'board') api.openBoard(p); else api.leave(p); }
    }
  }
  return { st, on, tick, hold, grade, spotNear, spotX, VERB, FIRST };
}
