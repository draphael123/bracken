// src/gong-master.js - THE GONG-MASTER, THE BANDIT KSAR 3's MINI (claude/ksar3, the OPUS GREYBOX, 11-06). Pure: no DOM, no main.js; src/ksar3-hands.js binds it.
// Sources: scratch/plan-desert-1105.md s1.7 + s2 (Daniel approved 11-05 14:07), brief-newminis-1015 (!! 10-15 DANIEL APPROVED THE KITS: 4 told attacks + the
// level-verb opening; lanes may tune numbers, not swap moves), brief-ksar3-1016 item 3.
//
// WHO: the fort's bell-keeper - a broad bandit in a brass-studded coat with a two-handed GONG MALLET, in THE GONG YARD under three gongs hung on ropes from
// a mud-brick arch. THE RULE IS THE LEVEL'S: THE FORT ANSWERS ITS GONGS - A RUNG GONG CALLS EVERY BANDIT IN EARSHOT, AND A CUT ROPE SILENCES IT.
// HIS KIT (the approved four, each told: its own windup + release pose, its own sound, a mark):
//   1 GONG STRIKE  '!!' he swings at the nearest hanging gong: a FLOOR SHOCKWAVE runs out both ways along the yard (JUMP it) and the gong CALLS 1-2 bandits
//                  down from the yard's doors (capped: GM.addCap alive at once). A cut gong cannot be struck: cut them all and he cannot call.
//   2 MALLET SLAM  '!!' (red) the mallet goes up overhead and comes down in front of him: ROLL through/out (unblockable).
//   3 THROWN CYMBAL '!' a brass cymbal flies out HIGH and comes back LOW (or the other way: its first height drawn on his hand) - DUCK the high, JUMP the low,
//                  twice; a shield turns either.
//   4 ROPE SWING   '!!' (phase two, his one new move) he takes a hanging gong's rope, MARKS your spot (a ring on the floor) and swings across to crash on it:
//                  MOVE OFF the mark. A cut rope cannot be swung on (no rope left: he slams instead).
// HIS OPENING (the level's verb, plan s2): CUT A GONG ROPE (a blade on it, src/ksar-hands.js cuts it) - the disc drops (on him if he stands under it: a SMALL
//   STAGGER only, never the opening itself - plan s2) and he is SILENCED: OPEN x GM.openMul for GM.openT s (the gold ring + timer, B10), at most GM.openCap of
//   him a window; then a told GM.wardT s ward (B3). GM.rehang s after a cut he hauls a new rope up (told GM.rehangTell s: 'HE RE-HANGS THE GONG') - the gong
//   hangs again, the verb comes back.
// THE FLOOR (B15): outside an opening his studded coat takes a blow at GM.coat (0.75x) - never invulnerable; in the ward GM.floor (0.4x).
// PHASES: P1 (100-50%) strike / slam / cymbal; P2 (50-0%) + ROPE SWING, shorter gaps. One windup at a time.
// MINI BAND (plan s2 / Q7): 70-80% WITH flasks - the tune lane's (browser). The toy duel in tools/ksar3.mjs is a flow sim, not the rate.

export const GM = {
  hp: 1400, w: 18, h: 30, markH: 46,
  coat: 0.75, floor: 0.4, openMul: 1.5, openT: 3.5, openCap: 0.12, wardT: 2.0, staggerT: 0.6, rehang: 12, rehangTell: 1.5,
  walk: 58, keep: 34, turn: 0.4, gap: [0.95, 0.75],
  strikeTell: 0.9, strikeReach: 30, waveV: 150, waveH: 10, waveW: 10, waveLife: 1.6, addCap: 2, adds: [1, 2],
  slamTell: 0.95, slamT: 0.2, slamReach: 46, slamH: 34,
  cymTell: 0.7, cymV: 170, cymOut: 0.75, cymR: 3, cymHigh: 12, cymLow: 3,   /* (a hero's box is 14 px tall, 8 ducked: HIGH flies at 9-15 px - over a duck; LOW at 0-6 - under a jump) */
  swingTell: 1.0, swingT: 0.7, swingR: 26, swingH: 40, swingLock: 0.35,
  p2: 0.5,
  dmg: { wave: 26, slam: 62, cym: 30, swing: 54, gong: 0 },
};
export const MOVES = {
  strikeTell: { mark: '!!', answer: 'jump', pose: ['gmStrikeWind', 'gmStrikeRel'], sound: 'gong' },
  slamTell: { mark: '!!', answer: 'dodge', pose: ['gmSlamWind', 'gmSlamRel'], sound: 'slam' },
  cymTell: { mark: '!', answer: 'duck/jump', pose: ['gmCymWind', 'gmCymRel'], sound: 'cymbal' },
  swingTell: { mark: '!!', answer: 'move', pose: ['gmSwingWind', 'gmSwingRel'], sound: 'rope' },
};
export const MOVE_NAME = { wave: 'THE GONG', slam: 'HIS MALLET', cym: 'HIS CYMBAL', swing: 'HIS ROPE SWING' };
export const NEW_MOVES = { 1: ['strike', 'slam', 'cym'], 2: ['swing'] };
export const CYCLES = {
  1: [['strike', 'slam', 'cym'], ['cym', 'slam', 'strike'], ['slam', 'cym', 'slam', 'strike']],
  2: [['swing', 'strike', 'slam'], ['cym', 'swing', 'slam'], ['strike', 'cym', 'swing', 'slam']],
};

/* ---------- THE GONG YARD (local columns 0..W-1; floor surface row R, he stands on R-1) ----------
   three gongs on ropes from the ARCH (row R - archH), two side DOORS in the back wall the called bandits come out of, the WEST door you come in by (shut
   behind you), the EAST gate (opens when he falls). Mud-brick and brass: no wood. */
export const GM_STAGE = { W: 40, door: 6, archH: 7, gongs: [{ id: 'gm0', x: 9 }, { id: 'gm1', x: 20 }, { id: 'gm2', x: 31 }], doors: [4, 35], him: 26, ledges: [{ x0: 14, x1: 17, dy: 4 }, { x0: 23, x1: 26, dy: 4 }] };
export function stageGongMaster(W, T, TS, sx, R) {
  const { set, block, ent, air } = W, ex = sx + GM_STAGE.W;
  air(sx, ex - 1, R - 14, R - 1);
  block(sx - 1, sx - 1, R - 16, R - GM_STAGE.door - 1);   /* the west wall over the door you came in by */
  block(ex, ex, R - 16, R - 1);                            /* the east wall: its gate is the mini's (main.js opens it when he falls) */
  for (let y = R - GM_STAGE.door; y <= R - 1; y++) set(ex, y, T.PORT);   /* THE GATE: a portcullis in the east wall (main.js lifts L.mini.gate's PORT cells when he falls) */
  block(sx, ex - 1, R - 16, R - 15);                        /* the yard's high wall walk (roofed: shade) */
  for (let x = sx + 2; x <= ex - 3; x++) set(x, R - GM_STAGE.archH, T.ONEWAY);   /* THE ARCH: a mud-brick lintel the gongs hang from (one-way: the angle from above) */
  for (const l of GM_STAGE.ledges) for (let x = sx + l.x0; x <= sx + l.x1; x++) set(x, R - l.dy, T.ONEWAY);
  const gongs = GM_STAGE.gongs.map(g => ({ id: g.id, x: sx + g.x, y: R - 1, ear: 6, earY: 4, gm: true }));
  for (const g of gongs) ent('ksgong', g.x, g.y, { id: g.id, gm: true });
  ent('gongmaster', sx + GM_STAGE.him, R - 1, { face: -1, mini: true });
  const mini = { x0: sx * TS, x1: ex * TS, floor: R * TS, y0: (R - 16) * TS, y1: (R + 1) * TS, trigger: (sx + 4) * TS, wallL: sx - 1, wallR: ex, gate: ex, boss: 'gongmaster',
    name: 'THE GONG-MASTER', music: 'banditking', gm: { sx, R } };
  return { mini, gongs, doors: GM_STAGE.doors.map(c => sx + c) };
}
export function gmGeom(M, TS = 16) {
  const q = M.gm, X = c => (q.sx + c) * TS;
  return { TS, x0: X(0), x1: X(GM_STAGE.W), floorY: q.R * TS, archY: (q.R - GM_STAGE.archH) * TS,
    gongs: GM_STAGE.gongs.map(g => ({ id: g.id, x: X(g.x) + 8 })), doors: GM_STAGE.doors.map(c => X(c) + 8) };
}

/* ---------- ONE FIGHT ---------- */
export function newGongFight(G) {
  return { G, ph: 1, cycle: 0, step: 0, script: null, act: 0, ward: 0, openTaken: 0, behindT: 0, stagger: 0, waves: [], cym: null, swing: null, mark: null, rehang: [], told: {},
    n: { cycles: 0, opens: 0, cuts: 0, cutsOpen: 0, staggers: 0, rehangs: 0, strikes: 0, strikesDry: 0, calls: 0, waves: 0, slams: 0, cyms: 0, swings: 0, swingsDry: 0, wards: 0, warded: 0, coated: 0, moves: {} } };
}
export const gPhase = e => (e.hp <= e.maxHp * GM.p2 ? 2 : 1);
export const gmOpen = e => !!e && e.mode === 'silenced' && (e.open || 0) > 0;
const STRIKE = new Set(['slam', 'swing', 'strike']);
function setMode(e, m, t) { e.mode = m; e.modeT = t; }
const clampX = (G, x) => Math.max(G.x0 + 14, Math.min(G.x1 - 14, x));
function tell(e, F, c, mode, t) { setMode(e, mode, t); F.act++; F.n.moves[mode] = (F.n.moves[mode] || 0) + 1; const mv = MOVES[mode]; e.pose = mv.pose[0]; c.mark(mv.mark); c.sound(mv.mark === '!!' ? 'tellHard' : 'tell'); }
const hanging = (F, c) => c.gongs().filter(g => !g.cut);
const nearestGong = (F, c, x) => hanging(F, c).sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0] || null;
const nextScript = F => { const set = CYCLES[F.ph]; return set[F.cycle % set.length].slice(); };

/* A GONG ROPE CUT (the hands: src/ksar-hands.js cut it). Returns 'open' | 'stagger' | 'busy' (cut while he is open/warded: just cut - one opening at a time) */
export function ropeCut(e, F, c, id) {
  const g = c.gongs().find(q => q.id === id); if (!g) return 'busy';
  F.n.cuts++; F.rehang.push({ id, t: GM.rehang, told: false });
  let res = 'busy';
  if (Math.abs(g.x - e.x) < 18 && e.alive) { F.stagger = GM.staggerT; F.n.staggers++; res = 'stagger'; c.fx('gongfall', g.x, F.G.floorY); c.number(e.x, e.y - 56, 'THE GONG FALLS ON HIM', '#ffd36b'); }   /* a SMALL stagger only (plan s2) */
  if (!e.alive || e.mode === 'sleep' || e.mode === 'wake' || gmOpen(e) || F.ward > 0) return res;
  /* SILENCED: he breaks off whatever he was telling and stands, mallet down, looking for his gong */
  F.swing = null; F.mark = null; F.cym = F.cym && F.cym.back ? F.cym : null;
  setMode(e, 'silenced', GM.openT + 0.05); e.open = GM.openT; e.openT0 = GM.openT; F.openTaken = 0; F.n.opens++; F.n.cutsOpen++; e.pose = 'gmSilenced';
  c.fx('open', e.x, e.y); c.sound('clank');
  c.number(e.x, e.y - 70, F.told.open ? 'SILENCED - CUT HIM' : 'THE ROPE IS CUT: HE IS SILENCED - CUT HIM', '#8fd160'); F.told.open = 1;
  return 'open';
}

/* ---------- ONE FRAME. h = the heroes [{ x, y, ground, alive, ducking, pp }]; c = the world:
   c.hit(box, dmg, name, o) -> landed   o: { key, low (a jump clears it), duck (a duck clears it), blockable, roll (only a roll's frames clear it) }
   c.number  c.mark(m)  c.sound(k)  c.fx(kind, x, y)  c.shake(n)  c.music(ph)
   c.gongs() -> [{ id, x, cut }]   c.ring(id) -> 'rung' | 'cut' | 'hum'   c.rehang(id)   c.call(n) -> how many bandits came   c.adds() -> alive called ---------- */
export function stepGongMaster(e, F, dt, h, c) {
  const G = F.G, P = h.filter(q => q.alive).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || h[0];
  e.modeT -= dt; e.y = G.floorY;
  if (e.open > 0) e.open = Math.max(0, e.open - dt);
  if (F.ward > 0) F.ward = Math.max(0, F.ward - dt); e.ward = F.ward;
  stepWaves(e, F, dt, c); stepCym(e, F, dt, c); stepRehang(e, F, dt, c);
  if (e.mode === 'sleep') return;
  if (e.mode === 'wake') { if (e.modeT <= 0) { F.script = nextScript(F); F.step = 0; setMode(e, 'walk', 0.6); } return; }
  if (F.stagger > 0) { F.stagger -= dt; if (!gmOpen(e)) { e.pose = 'gmStagger'; return; } }
  const want = gPhase(e);
  if (want > F.ph && !gmOpen(e) && (e.mode === 'walk' || e.mode === 'recover')) {
    F.ph = want; F.cycle = 0; F.step = 0; F.script = null; e.phase = want; c.music(want);
    c.number(e.x, e.y - 70, 'HE TAKES THE ROPES: MOVE OFF HIS MARK', '#ff9a5c'); c.sound('tellHard'); setMode(e, 'recover', 0.8); return; }
  switch (e.mode) {
    case 'silenced': if (e.open <= 0) { e.open = 0; F.ward = GM.wardT; F.n.wards++; c.number(e.x, e.y - 66, 'HE GATHERS HIS MALLET: HE GUARDS', '#9ab0c0'); c.fx('ward', e.x, e.y); setMode(e, 'recover', 0.5); } return;
    case 'recover': e.pose = 'gmIdle'; if (e.modeT <= 0) nextMove(e, F, P, c); return;
    case 'walk': { e.pose = 'gmWalk'; const d = P.x - e.x;
      if ((e.face || 1) * d < -8) { F.behindT += dt; if (F.behindT > GM.turn) { e.face = Math.sign(d) || e.face; F.behindT = 0; } } else F.behindT = 0;
      if (Math.abs(d) > GM.keep) e.x = clampX(G, e.x + Math.sign(d) * GM.walk * dt);
      if (e.modeT <= 0) nextMove(e, F, P, c); return; }
    case 'toGong': { e.pose = 'gmWalk'; const g = c.gongs().find(q => q.id === F.gong && !q.cut); if (!g) { setMode(e, 'recover', 0.3); return; }
      const tx = g.x + (P.x < g.x ? 14 : -14); if (Math.abs(tx - e.x) > 3) { e.x = clampX(G, e.x + Math.sign(tx - e.x) * GM.walk * 1.4 * dt); e.face = Math.sign(g.x - e.x) || e.face; }
      if (Math.abs(tx - e.x) <= 3 || e.modeT <= 0) { e.face = Math.sign(g.x - e.x) || e.face; tell(e, F, c, 'strikeTell', GM.strikeTell); } return; }
  }
  stepMove(e, F, dt, P, c);
}
function nextMove(e, F, P, c) {
  if (F.cym || F.swing) { setMode(e, 'walk', 0.15); return; }   /* one windup at a time: the cymbal comes home first */
  if (!F.script || F.step >= F.script.length) { F.cycle++; F.n.cycles++; F.script = nextScript(F); F.step = 0; }
  let m = F.script[F.step++]; const dx = P.x - e.x, ad = Math.abs(dx), G = F.G;
  e.face = Math.sign(dx) || e.face;
  if (m === 'strike') { const g = nearestGong(F, c, e.x); if (!g) { F.n.strikesDry++; m = ad < GM.slamReach + 20 ? 'slam' : 'cym'; if (!F.told.dry) { F.told.dry = 1; c.number(e.x, e.y - 60, 'NO GONG LEFT TO HIM', '#8fd160'); } }
    else { F.gong = g.id; setMode(e, 'toGong', 1.6); return; } }
  if (m === 'swing') { const g = nearestGong(F, c, (e.x + P.x) / 2); if (!g) { F.n.swingsDry++; m = 'slam'; }
    else { tell(e, F, c, 'swingTell', GM.swingTell); F.swing = { gong: g.id, gx: g.x, x0: e.x, x: clampX(G, P.x), t: 0, key: 'swing' + F.act, lock: false }; F.mark = { x: F.swing.x }; F.n.swings++;
      if (!F.told.swing) { F.told.swing = 1; c.number(e.x, e.y - 60, 'HE SWINGS ON THE ROPE: MOVE OFF THE MARK', '#ff6b6b'); } return; } }
  if (m === 'slam' && ad > GM.slamReach + 24) { setMode(e, 'walk', 0.45); F.step--; return; }
  switch (m) {
    case 'slam': tell(e, F, c, 'slamTell', GM.slamTell); if (!F.told.slam) { F.told.slam = 1; c.number(e.x, e.y - 60, 'THE MALLET: ROLL', '#ff6b6b'); } return;
    case 'cym': { tell(e, F, c, 'cymTell', GM.cymTell); const first = (F.n.cyms % 2) ? 'low' : 'high'; F.cymFirst = first;
      if (!F.told.cym) { F.told.cym = 1; c.number(e.x, e.y - 60, 'HIS CYMBAL: DUCK THE HIGH, JUMP THE LOW - IT COMES BACK', '#ffd36b'); } return; }
  }
  setMode(e, 'walk', 0.5);
}
function stepMove(e, F, dt, P, c) {
  const G = F.G, f = e.face || 1, after = t => setMode(e, 'recover', t ?? GM.gap[F.ph - 1]);
  switch (e.mode) {
    case 'strikeTell': if (e.modeT <= 0) { e.pose = MOVES.strikeTell.pose[1]; setMode(e, 'strike', 0.25); F.n.strikes++;
        const g = c.gongs().find(q => q.id === F.gong && !q.cut);
        if (!g) { after(0.4); return; }   /* cut while he wound up at it: nothing rings */
        c.sound('gong'); c.shake(3); c.fx('wave', g.x, G.floorY);
        F.waves.push({ x: g.x, dir: -1, t: GM.waveLife, key: 'wave' + F.act + 'w' }, { x: g.x, dir: 1, t: GM.waveLife, key: 'wave' + F.act + 'e' }); F.n.waves++;
        const r = c.ring ? c.ring(g.id) : 'rung';
        if (r === 'rung') { const want = Math.max(0, Math.min(GM.adds[F.ph - 1], GM.addCap - (c.adds ? c.adds() : 0))); const n = want && c.call ? c.call(want) : 0; F.n.calls += n;
          if (n && !F.told.call) { F.told.call = 1; c.number(g.x, G.archY - 20, 'THE GONG CALLS THE FORT: CUT ITS ROPE', '#ff9a5c'); } }
        if (!F.told.wave) { F.told.wave = 1; c.number(g.x, G.floorY - 50, 'THE FLOOR SHAKES: JUMP THE WAVE', '#ffd36b'); } } return;
    case 'strike': if (e.modeT <= 0) after(); return;
    case 'slamTell': if (e.modeT <= 0) { e.pose = MOVES.slamTell.pose[1]; setMode(e, 'slam', GM.slamT); F.n.slams++; c.sound('slam'); c.shake(4); c.fx('slam', e.x + f * 24, G.floorY);
        c.hit([f > 0 ? e.x : e.x - GM.slamReach, f > 0 ? e.x + GM.slamReach : e.x, e.y - GM.slamH, e.y + 2], GM.dmg.slam, MOVE_NAME.slam, { key: 'slam' + F.act, roll: true }); } return;
    case 'slam': if (e.modeT <= 0) after(); return;
    case 'cymTell': if (e.modeT <= 0) { e.pose = MOVES.cymTell.pose[1]; setMode(e, 'cymThrow', 0.2); F.n.cyms++; c.sound('cymbal');
        F.cym = { x: e.x + f * 10, x0: e.x, vx: f * GM.cymV, ht: F.cymFirst, t: GM.cymOut, back: false, key: 'cym' + F.act + 'a' }; } return;
    case 'cymThrow': if (e.modeT <= 0) after(0.5); return;
    case 'swingTell': { const S = F.swing; if (!S) { after(0.3); return; } if (e.modeT > GM.swingLock) S.x = clampX(G, P.x); else S.lock = true; F.mark = { x: S.x };
      if (e.modeT <= 0) { const g = c.gongs().find(q => q.id === S.gong && !q.cut); if (!g) { F.swing = null; F.mark = null; after(0.3); return; }   /* the rope he held is cut under him */
        e.pose = MOVES.swingTell.pose[1]; setMode(e, 'swing', GM.swingT); S.x0 = e.x; S.t = 0; c.sound('rope'); } return; }
    case 'swing': { const S = F.swing; if (!S) { after(0.3); return; } S.t += dt; const k = Math.min(1, S.t / GM.swingT);
      e.x = S.x0 + (S.x - S.x0) * k; e.yOff = -Math.sin(Math.PI * k) * GM.swingH;
      if (k >= 1) { e.yOff = 0; c.fx('crash', S.x, G.floorY); c.shake(5); c.sound('slam');
        c.hit([S.x - GM.swingR, S.x + GM.swingR, G.floorY - 40, G.floorY + 2], GM.dmg.swing, MOVE_NAME.swing, { key: S.key }); F.swing = null; F.mark = null; after(0.7); } return; }
    default: setMode(e, 'walk', 0.5);
  }
}
/* THE SHOCKWAVE: a low wave along the floor; a hero on the ground in it is hit (JUMP it) */
function stepWaves(e, F, dt, c) {
  if (!F.waves.length) return; const G = F.G;
  for (const w of F.waves) { w.t -= dt; w.x += w.dir * GM.waveV * dt;
    c.hit([w.x - GM.waveW, w.x + GM.waveW, G.floorY - GM.waveH, G.floorY + 2], GM.dmg.wave, MOVE_NAME.wave, { key: w.key, low: true, blockable: true });
    if (w.x < G.x0 || w.x > G.x1) w.t = 0; }
  F.waves = F.waves.filter(w => w.t > 0);
}
/* THE CYMBAL: out at one height, back at the other; it comes home to his hand */
function stepCym(e, F, dt, c) {
  const K = F.cym; if (!K) return; const G = F.G;
  K.x += K.vx * dt; K.t -= dt;
  const y = G.floorY - (K.ht === 'high' ? GM.cymHigh : GM.cymLow); K.y = y;
  c.hit([K.x - GM.cymR, K.x + GM.cymR, y - GM.cymR, y + GM.cymR], GM.dmg.cym, MOVE_NAME.cym, { key: K.key, blockable: true, duck: K.ht === 'high', low: K.ht === 'low' });
  if (!K.back && (K.t <= 0 || K.x < G.x0 + 6 || K.x > G.x1 - 6)) { K.back = true; K.vx = -K.vx; K.ht = K.ht === 'high' ? 'low' : 'high'; K.key = K.key.replace(/a$/, 'b'); c.sound('cymbal'); }
  else if (K.back && Math.abs(K.x - e.x) < 10) F.cym = null;
  else if (K.back && (K.x < G.x0 - 10 || K.x > G.x1 + 10)) F.cym = null;
}
/* THE RE-HANG: GM.rehang s after a cut he hauls a new rope; told GM.rehangTell s before it hangs */
function stepRehang(e, F, dt, c) {
  for (const r of F.rehang) { r.t -= dt;
    if (!r.told && r.t <= GM.rehangTell) { r.told = true; const g = c.gongs().find(q => q.id === r.id); c.number(g ? g.x : e.x, F.G.archY - 16, 'HE RE-HANGS THE GONG', '#ff9a5c'); c.sound('rope'); }
    if (r.t <= 0) { if (e.alive && c.rehang) c.rehang(r.id); F.n.rehangs++; } }
  F.rehang = F.rehang.filter(r => r.t > 0);
}
/* A BLOW ON HIM: silenced x openMul (a window holds openCap of him); warded x floor; otherwise his coat x coat - never 0 (B15) */
export function gmTake(e, F, dmg) {
  if (!F || e.mode === 'sleep' || e.mode === 'wake') return 0;
  if (gmOpen(e)) { const cap = e.maxHp * GM.openCap, d = Math.min(dmg * GM.openMul, Math.max(0, cap - F.openTaken)); F.openTaken += d; return Math.max(d, dmg * GM.floor); }
  if (F.ward > 0) { F.n.warded++; return dmg * GM.floor; }
  F.n.coated++; return dmg * GM.coat;
}

/* ---------- THE BOT'S READING (tools/ksar3.mjs toy duel; src/lab.js later) ----------
   A HUMAN BOT: a tell seen PLAN.react s late, some misread; it JUMPS the wave, ROLLS the slam, DUCKS/JUMPS the cymbal, steps OFF the swing's mark; between his
   blows it CUTS THE ROPE of the gong he walks to (or any hanging one) and cuts him hard while he is silenced; it cuts a called bandit when one is at its side.
   s = { P: { x, y, ground }, e, F, gongs, t, rng, mem } -> { gx, atk, jump, dodge, duck, block, why } */
export const PLAN = { react: 0.25, miss: 0.14, cutR: 12 };
export function gmPlan(s) {
  const { P, e, F } = s, rng = s.rng || Math.random, mem = s.mem || {}, out = { gx: null, atk: false, jump: false, dodge: false, duck: false, block: false, why: '' };
  mem.seen = mem.seen || new Map(); const key = e.mode + F.act, t = s.t || 0;
  if (!mem.seen.has(key)) mem.seen.set(key, { t, miss: rng() < PLAN.miss });
  const sn = mem.seen.get(key), late = t - sn.t < PLAN.react, wrong = sn.miss;
  const near = Math.abs(P.x - e.x);
  for (const w of F.waves) if (Math.abs(w.x - P.x) < 34 && Math.sign(P.x - w.x) === w.dir && P.ground && !wrong) { out.jump = true; out.why = 'jump the wave'; }
  if (F.cym && Math.abs(F.cym.x - P.x) < 40 && !wrong) { if (F.cym.ht === 'high') out.duck = true; else if (P.ground) out.jump = true; out.why = 'the cymbal'; }
  if (F.mark && (e.mode === 'swingTell' || e.mode === 'swing') && Math.abs(P.x - F.mark.x) < GM.swingR + 16) { out.gx = F.mark.x + (P.x < F.mark.x ? -60 : 60); out.why = 'off the mark'; if (late || wrong) out.gx = null; return out; }
  if (e.mode === 'slamTell' && near < GM.slamReach + 18 && !late && !wrong && e.modeT < 0.3) { out.dodge = true; out.why = 'roll the slam'; return out; }
  if (gmOpen(e)) { out.gx = e.x - Math.sign(e.x - P.x || 1) * 18; out.atk = near < 30; out.why = 'cut him: silenced'; return out; }
  /* THE VERB: the gong he goes for, else any hanging one */
  const gs = (s.gongs || []).filter(g => !g.cut); const want = gs.find(g => g.id === F.gong && (e.mode === 'toGong' || e.mode === 'strikeTell')) || (F.ward > 0 ? null : gs.sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0]);
  if (want && !(F.ward > 0)) { out.gx = want.x; out.atk = Math.abs(P.x - want.x) < PLAN.cutR; out.why = 'cut the rope'; return out; }
  out.gx = near > 60 ? e.x : null; out.atk = near < 30 && rng() < 0.3; out.why = 'chip / wait';
  return out;
}
