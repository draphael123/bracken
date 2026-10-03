// src/djinn.js - THE DJINN OF THE GREAT WELL, THE WELL TOWN's boss (claude/welltown5; Daniel 2026-10-03: the Cistern Queen is benched for a level of
// her own, and the town's boss is the thing the whole town draws its water from). Something is BOUND at the bottom of the well - shackled at the
// wrists, a whirl of sand from the waist down. The Gang Leader's men fouled the windlass to keep it down; the well turned, and it rises.
// His fight is the level's verb at its hardest: WATER IS CARRIED, and every opening is water.
//
// THE HALL (stageDjinn): the deep cistern under the old well - forty tiles, fifteen rows high, under the street. The old well's SHAFT comes down through
// the vault in the middle (you drop in by it), a grated SUMP under it, a stone LEDGE high on each wall with a rope ladder, a spring BASIN under each
// ledge (fill your skin: they glint), THE WINDLASS on the floor and a CRANK on the east ledge (either one drops the shaft's great bucket).
//
// THREE PHASES, every blow told (src/marks.js rows: a yellow ! the shield turns, a red !! nothing does), every cycle a different order:
//   P1 SAND (to 2/3)  a whirl of sand: a blade PASSES THROUGH him (THE SAND TAKES THE BLADE). SAND LASH (!: his arm of sand cracks out in front),
//                     SAND BLAST (!: three stones arc at you), DUST DEVIL (!!: a whirlwind runs the floor - jump it). OPEN: POUR your skin on him -
//                     he turns to MUD, solid and slow (DJ.openT), and a blade bites; then he dries back to sand.
//   P2 FIRE (to 1/3)  he catches fire and BURNS: his heat scorches you close to him and SETS YOU ALIGHT (E with water douses you), and his fire turns
//                     the blade. FIRE LASH (!), FIRE BREATH (!!: a stream at head height in front - duck it or step out), FLAME PILLARS (!!: three
//                     marked spots erupt - get off them). OPEN: DOUSE him (a pour) - smoke and clay, open; then he FLARES (told, DJ.flareT) and burns again.
//   P3 FLOOD (to 0)   he takes the well: the hall floods (the water drags at you: get up on a ledge) and he rises in the shaft as a column of water.
//                     SPOUT (!!: a spout erupts under you - roll out, or be held and mash out), WAVE (!!: a wave runs the ledges and the water - jump
//                     it), HAND SLAM (!!: his hand comes down on your ledge - and stays there, glinting: strike it). OPEN: drop the GREAT BUCKET on
//                     him (strike the windlass, or the crank on the east ledge) - it bails him out of the shaft and he spills onto a ledge, open.
// ALWAYS: outside an opening a blade does nothing to him (sand, fire, water) - only his slammed HAND takes a blow in phase three; greed is answered by the
// global reprisal (src/boss-greed.js OPEN_RULE.djinn: his openings and his hand). The mash bot cannot pour: it can never open him.
//
// PURE: no DOM, no main.js. The world is a context `c` (src/djinn-hands.js binds it). djinnPlan is the boss lab's HUMAN bot (src/lab.js).

export const DJ = {
  hp: 1000, w: 34, h: 64, markH: 92,
  openMul: 1.9, openT: 3.2, openCap: 0.08,       /* a water opening: x openMul, one takes no more than openCap of him */
  p2: 2 / 3, p3: 1 / 3,
  walk: 50, keep: 74, gap: [0.8, 0.7, 0.75],
  waryT: 6,                                    /* P1: dried back to sand he WHIRLS this long (told: a storm round him) - water is flung off him */
  /* P1 SAND */
  lashTell: 0.6, lashT: 0.2, lashReach: 62,
  blastTell: 0.6, blastFly: 0.8,
  devilTell: 0.85, devilSpeed: 170,
  /* P2 FIRE */
  breathTell: 0.8, breathT: 0.7, breathReach: 150,
  pillarTell: 0.95, pillarT: 0.45, pillarR: 18,
  heatTick: 0.6, heatR: 14, douseT: 5, flareT: 1.0,
  burnT: 2.6, burnTick: 0.5,                     /* a hero set alight: this long, a tick each burnTick, unless doused */
  /* P3 FLOOD */
  floodT: 2.2, waterH: 56, floodTick: 1.0,
  spoutTell: 0.9, spoutT: 0.45, spoutR: 18, snare: 2.4, holdT: 1.3,
  waveTell: 0.8, waveSpeed: 210,
  slamTell: 0.85, slamT: 0.25, slamStay: 1.5, handR: 16, handCap: 0.06, handMul: 1.0,
  bucketFall: 0.55, bucketCd: 8, pourR: 66,
  dmg: { lash: 17, blast: 8, devil: 18, flash: 17, breath: 20, pillar: 18, heat: 5, burn: 3, spout: 10, held: 22, wave: 17, slam: 19, flood: 2 },
};
export const CYCLES = {
  1: [['lash', 'blast', 'devil'], ['devil', 'lash', 'lash', 'blast'], ['blast', 'devil', 'lash'], ['lash', 'devil', 'blast', 'lash']],
  2: [['breath', 'pillars', 'flash'], ['pillars', 'flash', 'breath'], ['flash', 'breath', 'pillars', 'breath']],
  3: [['spout', 'wave', 'slam'], ['slam', 'spout', 'wave'], ['wave', 'slam', 'spout', 'slam']],
};
export const MOVES = {
  lashTell: { mark: '!', answer: 'block', h: 'low' }, blastTell: { mark: '!', answer: 'block', h: 'low' }, devilTell: { mark: '!!', answer: 'jump', h: 'low' },
  flashTell: { mark: '!', answer: 'block', h: 'low' }, breathTell: { mark: '!!', answer: 'duck', h: 'high' }, pillarTell: { mark: '!!', answer: 'dodge', h: 'low' },
  spoutTell: { mark: '!!', answer: 'dodge', h: 'low' }, waveTell: { mark: '!!', answer: 'jump', h: 'low' }, slamTell: { mark: '!!', answer: 'dodge', h: 'low' },
};
export const MOVE_NAME = { lash: 'THE SAND LASH', blast: 'THE SAND', devil: 'THE DUST DEVIL', flash: 'THE FIRE LASH', breath: 'HIS FIRE', pillar: 'THE FLAME PILLAR', heat: 'HIS HEAT',
  burn: 'ALIGHT', spout: 'THE SPOUT', held: 'THE WELL', wave: 'THE WAVE', slam: 'HIS HAND', flood: 'THE FLOOD' };
export const IGNITES = new Set(['flash', 'breath', 'pillar', 'heat']);

/* ---------- THE HALL ---------- */
export const STAGE = { W: 40, H: 15, shaft: [18, 21], sump: [17, 22], ledge: 6, ledgeRow: 7, ladder: 6, basin: 3, windlass: 14, crank: 3, door: 6 };
/* sx: the hall's first column; F: its floor row (solid; you stand on row F-1); top: the street row the shaft comes down from. W = { set, block, ent, air } */
export function stageDjinn(W, T, TS, sx, F, top) {
  const { set, ent, air } = W, ex = sx + STAGE.W, vault = F - STAGE.H - 1;
  air(sx, ex - 1, vault + 1, F - 1);
  air(sx + STAGE.shaft[0], sx + STAGE.shaft[1], top, vault);
  air(sx + STAGE.sump[0], sx + STAGE.sump[1], F, F + 1);
  for (let x = sx + STAGE.sump[0]; x <= sx + STAGE.sump[1]; x++) set(x, F, T.ONEWAY);
  const lr = F - STAGE.ledgeRow - 1;
  for (let x = sx; x < sx + STAGE.ledge; x++) set(x, lr, T.ONEWAY);
  for (let x = ex - STAGE.ledge; x < ex; x++) set(x, lr, T.ONEWAY);
  const ladders = [[sx + STAGE.ladder, lr, F - 1], [ex - 1 - STAGE.ladder, lr, F - 1]];
  ent('skinwell', sx + STAGE.basin, F - 1, { arena: true, basin: true });
  ent('skinwell', ex - 1 - STAGE.basin, F - 1, { arena: true, basin: true });
  ent('djwindlass', sx + STAGE.windlass, F - 1, {});
  ent('djwindlass', ex - 1 - STAGE.crank, lr - 1, { crank: true });
  ent('djinn', sx + 26, F - 1, { face: -1 });
  const arena = { x0: sx * TS, x1: ex * TS, floor: F * TS, trigger: (sx + 4) * TS, wallL: sx - 1, wallR: ex, boss: 'djinn', music: 'cisternqueen',
    tint: '#9ab0c0', tintA: 0.08, start: [sx + 9, F - 1], y0: (vault - 2) * TS, y1: (F + 2) * TS, djinn: { sx, F, vault, top, lr } };
  return { arena, ladders };
}
export function geom(A, TS = 16) {
  const q = A.djinn, sx = q.sx, ex = sx + STAGE.W, x0 = sx * TS, x1 = ex * TS;
  return { x0, x1, floor: q.F * TS, vault: (q.vault + 1) * TS, mid: (sx + STAGE.W / 2) * TS, ledgeY: q.lr * TS,
    ledgeW: [x0, (sx + STAGE.ledge) * TS], ledgeE: [(ex - STAGE.ledge) * TS, x1], ladderW: (sx + STAGE.ladder) * TS + 8, ladderE: (ex - 1 - STAGE.ladder) * TS + 8,
    basinW: (sx + STAGE.basin) * TS + 8, basinE: (ex - 1 - STAGE.basin) * TS + 8, sump: [(sx + STAGE.sump[0]) * TS, (sx + STAGE.sump[1] + 1) * TS],
    shaft: [(sx + STAGE.shaft[0]) * TS, (sx + STAGE.shaft[1] + 1) * TS], windlass: (sx + STAGE.windlass) * TS + 8, crank: (ex - 1 - STAGE.crank) * TS + 8 };
}

/* ---------- ONE FIGHT ---------- */
export function newShow(G) {
  return { G, cycle: 0, ph: 1, step: 0, script: null, moveT: 0, pose: 'floor', act: 0, cur: null, shots: [], bands: [], marks: [], hand: null, held: null,
    bucket: { st: 'up', t: 0 }, water: 0, wary: 0, flood: false, burn: false, douse: 0, flare: 0, heatK: 0, heatN: 0, floodK: 0, openTaken: 0,
    told: {}, n: { cycles: 0, opens: 0, mud: 0, doused: 0, bailed: 0, pours: 0, wasted: 0, buckets: 0, flares: 0, hands: 0, handHits: 0, spouts: 0, caught: 0, passed: 0, moves: {} } };
}
export const djPhase = e => (e.hp <= e.maxHp * DJ.p3 ? 3 : e.hp <= e.maxHp * DJ.p2 ? 2 : 1);
export const djOpen = e => !!e && (e.open || 0) > 0 && (e.mode === 'mud' || e.mode === 'doused' || e.mode === 'bailed');
export const handOut = S => (S && S.hand && S.hand.stay > 0 ? S.hand : null);
export const handBox = h => ({ l: h.x - DJ.handR, r: h.x + DJ.handR, t: h.y - DJ.handR - 6, b: h.y + 2 });
const setMode = (e, m, t) => { e.mode = m; e.modeT = t; };
const nextScript = S => CYCLES[S.ph][S.cycle % CYCLES[S.ph].length].slice();
const IDLE = new Set(['walk', 'recover', 'hover']);

/* ---------- ONE FRAME. h = heroes [{ x, y, ground, alive, ducking, onLedge, pp }], c = the world (src/djinn-hands.js) ---------- */
export function stepDjinn(e, S, dt, h, c) {
  const G = S.G, P = h.filter(q => q.alive).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || h[0];
  e.modeT -= dt; S.moveT += dt;
  if (e.open > 0) e.open = Math.max(0, e.open - dt);
  if (S.hand) { if (S.hand.stay > 0) S.hand.stay -= dt; if (S.hand.stay <= 0 && S.hand.landed) S.hand = null; }
  e.hand = S.hand && S.hand.stay > 0 ? S.hand.stay : 0;   /* (src/boss-greed.js OPEN_RULE: a blow on his slammed hand is not chipped) */
  stepShots(e, S, dt, c); stepBands(e, S, dt, c); stepMarks(e, S, dt, c); stepBucket(e, S, dt, c); stepFire(e, S, dt, c); stepFlood(e, S, dt, h, c);
  e.burning = !!S.burn; e.phase = S.ph; if (S.wary > 0 && !djOpen(e)) S.wary -= dt;
  if (e.mode === 'sleep') return;
  if (e.mode === 'wake') { if (e.modeT <= 0) { S.script = nextScript(S); S.step = 0; setMode(e, 'walk', 0.9); } return; }
  const want = djPhase(e);
  if (want > S.ph && !djOpen(e) && IDLE.has(e.mode)) { S.ph = want; S.cycle = 0; S.step = 0; S.script = null; S.bands = []; S.marks = []; S.hand = null; e.phase = want;
    if (want === 2) { S.burn = true; S.douse = 0; setMode(e, 'catch', 1.2); c.number(e.x, e.y - 100, 'HE CATCHES FIRE: DOUSE HIM WITH WATER', '#ff9a5c'); c.fx('flare', e.x, G.floor); c.sound('flare'); c.music(2); return; }
    if (want === 3) { S.burn = false; S.flare = 0; S.flood = true; S.pose = 'column'; setMode(e, 'rise', DJ.floodT); c.number(G.mid, G.floor - 120, 'HE TAKES THE WELL: THE WATER RISES - GET UP', '#7ab8e8'); c.sound('flood'); c.music(3); return; } }
  switch (e.mode) {
    case 'mud': case 'doused': case 'bailed':
      if (e.open <= 0) { if (e.mode === 'mud') { c.number(e.x, e.y - 100, 'HE DRIES BACK TO SAND', '#c9a46a'); S.wary = DJ.waryT; }
        if (e.mode === 'bailed') { S.pose = 'column'; e.x = G.mid; e.y = G.floor; }
        setMode(e, 'recover', 0.6); } return;
    case 'catch': if (e.modeT <= 0) { S.script = nextScript(S); S.step = 0; setMode(e, 'walk', 0.6); } return;
    case 'rise': e.x += (G.mid - e.x) * Math.min(1, dt * 3); if (e.modeT <= 0) { e.x = G.mid; S.script = nextScript(S); S.step = 0; setMode(e, 'hover', 0.8); } return;
    case 'recover': if (e.modeT <= 0) nextMove(e, S, P, c); return;
    case 'walk': { const d = P.x - e.x, ad = Math.abs(d); e.face = Math.sign(d) || e.face;
      if (ad > DJ.keep) e.x += Math.sign(d) * DJ.walk * dt; else if (ad < DJ.keep - 30) e.x -= Math.sign(d) * DJ.walk * 0.6 * dt;   /* he keeps his reach: a whirl that hangs off you */
      e.x = Math.max(G.x0 + 30, Math.min(G.x1 - 30, e.x)); if (e.modeT <= 0) nextMove(e, S, P, c); return; }
    case 'hover': e.face = Math.sign(P.x - e.x) || e.face; if (e.modeT <= 0) nextMove(e, S, P, c); return;
  }
  stepMove(e, S, dt, P, h, c);
}
function nextMove(e, S, P, c) {
  if (!S.script || S.step >= S.script.length) { S.cycle++; S.n.cycles++; S.script = nextScript(S); S.step = 0; }
  const k = S.script[S.step++], G = S.G; S.n.moves[k] = (S.n.moves[k] || 0) + 1; S.act++; S.cur = { k, id: S.act }; e.face = Math.sign(P.x - e.x) || e.face;
  switch (k) {
    case 'lash': return tell(e, 'lashTell', DJ.lashTell, c);
    case 'flash': return tell(e, 'flashTell', DJ.lashTell, c);
    case 'blast': S.cur.x = P.x; return tell(e, 'blastTell', DJ.blastTell, c);
    case 'devil': return tell(e, 'devilTell', DJ.devilTell, c);
    case 'breath': return tell(e, 'breathTell', DJ.breathTell, c);
    case 'pillars': S.cur.spots = [P.x, P.x - 72, P.x + 72].map(x => Math.max(G.x0 + 14, Math.min(G.x1 - 14, x))); S.marks = S.cur.spots.map(x => ({ x, y: G.floor, t: DJ.pillarTell, k: 'pillar', key: 'pl' + S.act + x }));
      return tell(e, 'pillarTell', DJ.pillarTell, c);
    case 'spout': { const y = P.onLedge ? G.ledgeY : G.floor; S.cur.x = P.x; S.cur.y = y; S.n.spouts++; S.marks = [{ x: P.x, y, t: DJ.spoutTell, k: 'spout', key: 'sp' + S.act }]; return tell(e, 'spoutTell', DJ.spoutTell, c); }
    case 'wave': return tell(e, 'waveTell', DJ.waveTell, c);
    case 'slam': { const L = P.onLedge || (P.x < G.mid ? 'W' : 'E'), r = L === 'W' ? G.ledgeW : G.ledgeE, y = P.onLedge ? G.ledgeY : G.floor;
      const x = Math.max(r[0] + 14, Math.min(r[1] - 14, P.onLedge ? P.x : (L === 'W' ? r[1] - 20 : r[0] + 20)));
      S.cur.x = P.onLedge ? x : P.x; S.cur.y = y; S.marks = [{ x: S.cur.x, y, t: DJ.slamTell, k: 'slam', key: 'sl' + S.act }]; return tell(e, 'slamTell', DJ.slamTell, c); }
  }
}
function tell(e, mode, t, c) { setMode(e, mode, t); const m = MOVES[mode]; if (m && m.mark) { c.mark(m.mark); c.sound(m.mark === '!' ? 'tell' : 'tellHard'); } }
function after(e, S) { setMode(e, S.pose === 'column' ? 'hover' : 'walk', DJ.gap[S.ph - 1]); }

function stepMove(e, S, dt, P, h, c) {
  const G = S.G, cur = S.cur || {}, F = G.floor, fx = e.face || 1, key = 'dj' + cur.id;
  const front = (reach, top = 40) => fx > 0 ? [e.x, e.x + DJ.w / 2 + reach, e.y - top, e.y] : [e.x - DJ.w / 2 - reach, e.x, e.y - top, e.y];
  switch (e.mode) {
    case 'lashTell': if (e.modeT <= 0) { setMode(e, 'lash', DJ.lashT); c.sound('lash'); } return;
    case 'lash': c.hit(front(DJ.lashReach), DJ.dmg.lash, MOVE_NAME.lash, { key, blockable: true }); if (e.modeT <= 0) after(e, S); return;
    case 'flashTell': if (e.modeT <= 0) { setMode(e, 'flash', DJ.lashT); c.sound('lash'); } return;
    case 'flash': c.hit(front(DJ.lashReach), DJ.dmg.flash, MOVE_NAME.flash, { key, blockable: true, ignite: true }); if (e.modeT <= 0) after(e, S); return;
    case 'blastTell': if (e.modeT <= 0) { setMode(e, 'blast', 0.3); c.sound('blast');
      for (const dx of [-36, 0, 36]) { const tx = Math.max(G.x0 + 8, Math.min(G.x1 - 8, cur.x + dx)), sx0 = e.x + fx * 20, T = DJ.blastFly;
        S.shots.push({ x: sx0, y: F - 50, vx: (tx - sx0) / T, vy: -(0.5 * 600 * T) + (50 / T), g: 600, key: key + dx, t: T + 0.3 }); } } return;
    case 'blast': if (e.modeT <= 0) after(e, S); return;
    case 'devilTell': if (e.modeT <= 0) { S.bands.push({ k: 'devil', x: e.x + fx * 20, dir: fx, speed: DJ.devilSpeed, y: [F - 26, F], dmg: DJ.dmg.devil, name: MOVE_NAME.devil, key, kind: 'low' }); setMode(e, 'devil', 0.5); c.sound('devil'); } return;
    case 'devil': if (e.modeT <= 0) after(e, S); return;
    case 'breathTell': if (e.modeT <= 0) { setMode(e, 'breath', DJ.breathT); c.sound('breath'); } return;
    case 'breath': { const x0 = fx > 0 ? e.x : e.x - DJ.breathReach, x1 = fx > 0 ? e.x + DJ.breathReach : e.x; c.band('high', [F - 32, F - 13], x0, x1, DJ.dmg.breath, MOVE_NAME.breath, key, { ignite: true }); if (e.modeT <= 0) after(e, S); return; }
    case 'pillarTell': if (e.modeT <= 0) { setMode(e, 'pillar', DJ.pillarT); c.sound('pillar'); c.shake(3); for (const m of S.marks) m.fire = DJ.pillarT; } return;
    case 'pillar': for (const m of S.marks) c.hit([m.x - DJ.pillarR, m.x + DJ.pillarR, F - 70, F], DJ.dmg.pillar, MOVE_NAME.pillar, { key: m.key, ignite: true }); if (e.modeT <= 0) { S.marks = []; after(e, S); } return;
    case 'spoutTell': if (e.modeT <= 0) { setMode(e, 'spout', DJ.spoutT); c.sound('spout'); c.fx('splash', cur.x, cur.y); } return;
    case 'spout': { const got = c.grab([cur.x - DJ.spoutR, cur.x + DJ.spoutR, cur.y - 50, cur.y + 2], key); S.marks = [];
      if (got) { S.held = got; S.n.caught++; setMode(e, 'hold', DJ.holdT); c.number(cur.x, cur.y - 60, 'THE SPOUT HOLDS YOU: STRIKE OUT OF IT', '#ffd36b'); return; }
      if (e.modeT <= 0) after(e, S); return; }
    case 'hold': { const hh = S.held; if (!hh || c.free(hh)) { S.held = null; setMode(e, 'hover', 0.5); return; } c.holdAt(hh, cur.x);
      if (e.modeT <= 0) { c.hit([cur.x - 30, cur.x + 30, cur.y - 60, cur.y + 4], DJ.dmg.held, MOVE_NAME.held, { key: key + 'h', held: hh }); c.release(hh); S.held = null; after(e, S); } return; }
    case 'waveTell': if (e.modeT <= 0) { for (const dir of [-1, 1]) { S.bands.push({ k: 'wave', x: G.mid + dir * 24, dir, speed: DJ.waveSpeed, y: [G.ledgeY - 18, G.ledgeY], dmg: DJ.dmg.wave, name: MOVE_NAME.wave, key: key + 'l' + dir, kind: 'low' });
        S.bands.push({ k: 'wave', x: G.mid + dir * 24, dir, speed: DJ.waveSpeed, y: [F - DJ.waterH - 16, F], dmg: DJ.dmg.wave, name: MOVE_NAME.wave, key: key + 'f' + dir, kind: 'low' }); }
      setMode(e, 'wave', 0.5); c.sound('wave'); } return;
    case 'wave': if (e.modeT <= 0) after(e, S); return;
    case 'slamTell': if (e.modeT <= 0) { setMode(e, 'slam', DJ.slamT); c.sound('slam'); } return;
    case 'slam': if (e.modeT <= 0) { c.hit([cur.x - 22, cur.x + 22, cur.y - 40, cur.y + 2], DJ.dmg.slam, MOVE_NAME.slam, { key }); c.shake(5); c.fx('splash', cur.x, cur.y); S.marks = [];
        S.hand = { x: cur.x, y: cur.y - 6, stay: DJ.slamStay, landed: true, taken: 0 }; S.n.hands++;
        if (!S.told.hand) { S.told.hand = 1; c.number(cur.x, cur.y - 50, 'HIS HAND RESTS THERE: STRIKE IT', '#8fd160'); }
        setMode(e, 'reach', DJ.slamStay); } return;
    case 'reach': if (e.modeT <= 0 || !S.hand) { S.hand = null; after(e, S); } return;
  }
  if (e.modeT <= -2) after(e, S);
}

/* ---------- THE OPENINGS: all water ---------- */
export function openUp(e, S, how, c, P) {
  const G = S.G; e.open = DJ.openT; S.openTaken = 0; S.n.opens++; S.n[how]++; setMode(e, how, DJ.openT + 0.05); S.bands = S.bands.filter(b => b.k !== 'devil'); S.marks = []; S.hand = null;
  if (S.held) { c.release(S.held); S.held = null; }
  if (how === 'mud') { c.number(e.x, e.y - 100, 'MUD: HE IS SOLID. CUT HIM', '#8fd160'); c.fx('mud', e.x, G.floor); c.sound('soak'); }
  if (how === 'doused') { S.burn = false; S.flare = 0; S.douse = DJ.douseT; c.number(e.x, e.y - 100, 'DOUSED: SMOKE AND CLAY. CUT HIM', '#8fd160'); c.fx('steam', e.x, G.floor); c.sound('soak'); }
  if (how === 'bailed') { const L = P && P.onLedge ? P.onLedge : (P && P.x < G.mid ? 'W' : 'E'), r = L === 'W' ? G.ledgeW : G.ledgeE;
    S.pose = 'spilled'; e.x = L === 'W' ? r[1] - 26 : r[0] + 26; e.y = G.ledgeY; e.face = L === 'W' ? -1 : 1;
    c.number(e.x, e.y - 90, 'THE BUCKET BAILS HIM OUT: CUT HIM', '#8fd160'); c.fx('splash', e.x, e.y); c.sound('soak'); c.shake(5); }
}
/* A POUR AT HIM (the hero's E with a sip): phase one turns him to mud, phase two douses him; it must reach him (in front, near, on his floor) */
export function pourAim(e, S, hero) {
  if (!e || !e.alive || djOpen(e) || e.mode === 'sleep' || e.mode === 'wake' || S.ph === 3 || S.pose !== 'floor') return null; const G = S.G;
  const d = (e.x - hero.x) * (hero.face || 1); if (d <= 0 || d > DJ.w / 2 + DJ.pourR || Math.abs(hero.y - G.floor) > 20) return null;
  const off = S.ph === 1 ? S.wary > 0 : !(S.burn || S.flare > 0);   /* (whirling, the water is flung off; smoking, there is no fire to put out) */
  return { x: e.x - (hero.face || 1) * (DJ.w / 2 - 4), y: G.floor - 30, what: off ? 'off' : S.ph === 1 ? 'sand' : 'fire' };
}
export function pourAt(e, S, hero, c) { const a = pourAim(e, S, hero); S.n.pours++; if (!a) { S.n.wasted++; return 'wasted'; }
  if (a.what === 'off') { S.n.wasted++; c.number(e.x, e.y - 100, S.ph === 1 ? 'HE WHIRLS: THE WATER IS FLUNG OFF' : 'NO FIRE TO PUT OUT: WAIT FOR HIS FLARE', '#9aa39a'); return 'off'; } openUp(e, S, a.what === 'sand' ? 'mud' : 'doused', c); return 'open'; }
/* THE WINDLASS / THE CRANK: the shaft's great bucket comes down (DJ.bucketFall); in phase three it bails him out of the shaft. It winds back in DJ.bucketCd */
export function strikeWindlass(e, S, c) { const b = S.bucket; if (b.st !== 'up') return false; b.st = 'fall'; b.t = DJ.bucketFall; S.n.buckets++; c.sound('windlass'); c.number(S.G.mid, S.G.vault + 30, 'THE GREAT BUCKET COMES DOWN', '#7ab8e8'); return true; }
function stepBucket(e, S, dt, c) {
  const b = S.bucket, G = S.G;
  if (b.st === 'fall') { b.t -= dt; if (b.t <= 0) { b.st = 'down'; b.t = DJ.bucketCd; c.fx('splash', G.mid, G.floor); c.sound('splash');
    if (e.alive && !djOpen(e) && S.ph === 3 && S.pose === 'column' && e.mode !== 'rise') openUp(e, S, 'bailed', c, b.who); } }
  else if (b.st === 'down') { b.t -= dt; if (b.t <= 0) { b.st = 'up'; c.sound('windlass'); } }
}
/* ---------- WHAT FLIES, RUNS, ERUPTS, BURNS AND RISES ---------- */
function stepShots(e, S, dt, c) { const F = S.G.floor;
  for (const s of S.shots) { s.t -= dt; s.vy += s.g * dt; s.x += s.vx * dt; s.y += s.vy * dt; c.hit([s.x - 4, s.x + 4, s.y - 4, s.y + 4], DJ.dmg.blast, MOVE_NAME.blast, { key: s.key, blockable: true, onHit: () => { s.t = 0; } });
    if (s.y >= F - 2 && s.vy > 0) { c.fx('sand', s.x, F); s.t = 0; } }
  S.shots = S.shots.filter(s => s.t > 0); }
function stepBands(e, S, dt, c) { const G = S.G;
  for (const b of S.bands) { b.x += b.dir * b.speed * dt; c.band(b.kind, b.y, b.x - 14, b.x + 14, b.dmg, b.name, b.key, {}); if (b.x < G.x0 - 20 || b.x > G.x1 + 20) b.done = true; }
  S.bands = S.bands.filter(b => !b.done); }
function stepMarks(e, S, dt, c) { for (const m of S.marks) m.t -= dt; }
function heatBox(e, S) { if (S.pose !== 'floor' || e.mode === 'sleep') return null; return [e.x - DJ.w / 2 - DJ.heatR, e.x + DJ.w / 2 + DJ.heatR, e.y - DJ.h, e.y]; }
function stepFire(e, S, dt, c) {
  if (S.ph !== 2 || !e.alive) return;
  if (S.burn) { S.heatK += dt; if (S.heatK >= DJ.heatTick) { S.heatK = 0; S.heatN++; const b = heatBox(e, S); if (b) c.hit(b, DJ.dmg.heat, MOVE_NAME.heat, { key: 'heat' + S.heatN, noKnock: true, ignite: true }); } return; }
  if (S.flare > 0) { S.flare -= dt; if (S.flare <= 0) { S.flare = 0; S.burn = true; c.fx('flare', e.x, S.G.floor); c.sound('flare'); } return; }
  if (!djOpen(e) && S.douse > 0) { S.douse -= dt; if (S.douse <= 0) { S.flare = DJ.flareT; S.n.flares++; c.number(e.x, e.y - 100, 'HE FLARES UP: DOUSE HIM AGAIN', '#ff9a5c'); c.sound('tellHard'); } } }
function stepFlood(e, S, dt, h, c) {
  if (!S.flood) return; if (S.water < DJ.waterH) { S.water = Math.min(DJ.waterH, S.water + (DJ.waterH / DJ.floodT) * dt); c.water(S.water); }
  S.floodK += dt; if (S.floodK < DJ.floodTick) return; S.floodK = 0; S.floodN = (S.floodN || 0) + 1;
  c.hit([S.G.x0, S.G.x1, S.G.floor - S.water + 8, S.G.floor + 4], DJ.dmg.flood, MOVE_NAME.flood, { key: 'fl' + S.floodN, noKnock: true, flood: true });
}

/* ---------- THE BOT'S READING (src/lab.js) ----------
   A HUMAN BOT: it reads a tell DJ_PLAN.react s after it began and misreads some (miss), lets some pours go (missPour). It fills the skin at a basin when it
   is dry, closes to pouring distance and pours (phase one: mud; phase two: douse), cuts in the opening, keeps off his heat, ducks his breath, gets off
   the pillars' marks, jumps the devil and the waves; in the flood it climbs to the east ledge, strikes the crank when the bucket is up, strikes his hand
   when it rests on its ledge, and rolls out of the spout (or strikes out of it).
   s = { P: { x, y, face, ground, atk, climb, onLedge, snare, burn }, e, S, sips, reach, shield, t, rng, mem } -> { gx, face, atk, jump, block, dodge, talk, down, up, why } */
export const DJ_PLAN = { react: 0.25, miss: 0.13, missPour: 0.2, missHand: 0.25 };
export function djinnPlan(s) {
  const { P, e, S, reach } = s, G = S.G, out = { gx: null, face: P.face, atk: false, jump: false, block: false, dodge: false, talk: false, down: false, up: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0, sips = s.sips || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const key = e.mode + S.act, seen = () => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= DJ_PLAN.react; };
  const roll = (k, p) => { if (!mem.roll.has(k)) mem.roll.set(k, rng() < p); return mem.roll.get(k); };
  const lo = G.x0 + 12, hi = G.x1 - 12, clamp = x => Math.max(lo, Math.min(hi, x)), side = Math.sign(P.x - e.x) || 1, ad = Math.abs(P.x - e.x), toHim = Math.sign(e.x - P.x) || 1;
  const onLedge = P.onLedge, misread = roll(key + 'm', DJ_PLAN.miss), m = e.mode;
  const offLedge = () => { if (onLedge) { out.down = true; out.jump = P.ground; } };
  if (P.snare > 0) { out.atk = P.atk < 0; out.why = 'strike out of the spout'; return out; }
  if (P.burn > 0 && sips > 0 && t - (mem.burnSeen ?? (mem.burnSeen = t)) >= DJ_PLAN.react) { out.talk = true; out.why = 'douse yourself'; return out; }
  if (!(P.burn > 0)) mem.burnSeen = undefined;
  /* 0. what runs, erupts and comes down at you */
  const band = S.bands.find(b => Math.abs(b.x - P.x) < 110 && Math.sign(P.x - b.x) === b.dir && P.y > b.y[0] - 4 && P.y - 20 < b.y[1]);
  if (band && seen() && !misread && Math.abs(band.x - P.x) < 70) { out.jump = P.ground || !!P.climb; out.why = 'jump the ' + band.k; return out; }
  const mk = S.marks.find(q => Math.abs(q.x - P.x) < DJ.pillarR + 14 && Math.abs(q.y - P.y) < 30);
  if (mk && !misread && seen()) { const step = mk.k === 'pillar' ? 36 : 54; out.gx = clamp(P.x + (P.x <= mk.x ? -step : step)); if (mk.k === 'pillar' && (out.gx <= lo + 1 || out.gx >= hi - 1)) out.gx = clamp(P.x + (P.x <= mk.x ? step : -step)); if (onLedge) { const r = onLedge === 'W' ? G.ledgeW : G.ledgeE; out.gx = Math.max(r[0] + 8, Math.min(r[1] - 8, P.x + (P.x <= mk.x ? -40 : 40))); }
    if (Math.abs(mk.x - P.x) < 12 && mk.t < 0.3 && mk.k !== 'pillar') out.dodge = P.ground; out.why = 'off the ' + mk.k + ' mark'; return out; }
  if (m === 'breathTell' && seen() && !misread && ad < DJ.breathReach + 10 && Math.sign(P.x - e.x) === (e.face || 1)) { out.down = P.ground; out.why = 'duck the breath'; return out; }
  if (m === 'breath' && ad < DJ.breathReach + 10 && Math.sign(P.x - e.x) === (e.face || 1)) { out.down = P.ground; out.why = 'under the breath'; return out; }
  /* 1. THE OPENING: on him */
  if (djOpen(e)) { if (m === 'bailed') { const L = e.x < G.mid ? 'W' : 'E'; if (onLedge !== L) return climbTo(L); }
    out.gx = clamp(e.x - toHim * Math.max(8, reach * 0.6 + 8)); out.face = toHim; out.atk = ad < reach + DJ.w / 2 + 4 && Math.abs(P.y - e.y) < 40 && P.atk < 0; out.why = 'cut him: he is open'; return out; }
  /* 1b. HIS HAND on a ledge (phase three) */
  const hd = handOut(S); if (hd && hd.stay > 0.2 && !roll('hand' + S.n.hands, DJ_PLAN.missHand)) { const L = hd.x < G.mid ? 'W' : 'E', onFloor = Math.abs(hd.y + 6 - G.floor) < 8;
    if (!onFloor && onLedge !== L) return climbTo(L);
    const sd = Math.sign(P.x - hd.x) || 1; out.gx = clamp(hd.x + sd * Math.max(6, reach * 0.6)); out.face = -sd; out.atk = Math.abs(P.x - hd.x) < reach + DJ.handR && P.atk < 0; out.why = 'strike his hand'; return out; }
  /* 2. HIS TELLS in front */
  if ((m === 'lashTell' || m === 'flashTell') && seen() && !misread && ad < DJ.lashReach + DJ.w / 2 + 20) { if (s.deflect && !(P.busy > 0)) { out.face = toHim; out.block = e.modeT < 0.22; out.why = 'deflect the lash on the beat'; return out; } if (s.shield) { out.block = true; out.face = toHim; out.why = 'block the lash'; return out; } out.gx = clamp(e.x + side * (DJ.lashReach + DJ.w / 2 + 34)); out.why = 'off the lash'; return out; }
  if ((m === 'lash' || m === 'flash') && ad < DJ.lashReach + DJ.w / 2 + 10) { if ((s.deflect && !(P.busy > 0)) || s.shield) { out.block = true; out.face = toHim; return out; } out.gx = clamp(e.x + side * (DJ.lashReach + DJ.w / 2 + 34)); out.why = 'off the lash'; return out; }
  if (m === 'blastTell' && seen() && !misread && s.shield) { out.block = true; out.face = toHim; out.why = 'block the sand'; return out; }
  /* 3. PHASE THREE: up on the east ledge, the crank */
  if (S.ph === 3) { if (onLedge !== 'E') return climbTo('E');
    if (S.bucket.st === 'up' && S.pose === 'column' && m !== 'rise') { if (Math.abs(P.x - G.crank) > 10) { out.gx = G.crank + 12; out.why = 'to the crank'; return out; } out.face = -1; out.atk = P.atk < 0; out.why = 'strike the crank'; return out; }
    out.gx = G.ledgeE[0] + 40; out.face = -1; out.why = 'wait on the ledge'; return out; }
  /* 4. PHASES ONE AND TWO: water - a dry skin goes to the nearest basin; a wet one closes to pouring distance and pours */
  offLedge(); if (onLedge) return out;
  if (sips <= 0) { const bx = Math.abs(P.x - G.basinW) < Math.abs(P.x - G.basinE) ? G.basinW : G.basinE; if (Math.abs(P.x - bx) < 10 && P.ground) { out.talk = true; out.why = 'fill the skin'; return out; } out.gx = bx; out.why = 'to the basin'; return out; }
  const want = DJ.w / 2 + 36, busy = /Tell$/.test(m) && ad < want + 30;
  const dryNow = S.ph === 1 ? S.wary > 0 : !(S.burn || S.flare > 0);
  if (dryNow) { out.gx = clamp(e.x + side * (DJ.w / 2 + 70)); out.face = toHim; out.why = S.ph === 1 ? 'wait out his whirl' : 'wait for his flare'; return out; }
  if (!busy && ad < DJ.w / 2 + DJ.pourR - 6 && ad > DJ.w / 2 + DJ.heatR + 6 && P.ground && !roll(key + 'p', DJ_PLAN.missPour)) { out.face = toHim; out.talk = true; out.why = S.ph === 1 ? 'pour: mud' : 'douse him'; return out; }
  out.gx = clamp(e.x + side * want); out.face = toHim; out.why = 'to pouring distance';
  return out;
  function climbTo(L) { const lad = L === 'W' ? G.ladderW : G.ladderE, ledge = L === 'W' ? G.ledgeW : G.ledgeE, tx = L === 'W' ? ledge[1] - 30 : ledge[0] + 30;
    if (onLedge === L) { out.gx = tx; return out; }
    if (onLedge) { out.down = true; out.jump = P.ground; out.gx = lad; out.why = 'off the wrong ledge'; return out; }
    if (P.y <= G.ledgeY + 10) { out.gx = tx; out.jump = !!P.climb; out.why = 'onto the ledge'; return out; }
    if (Math.abs(P.x - lad) > 5 && !P.climb) { out.gx = lad; out.why = 'to the ledge ladder'; return out; }
    out.up = true; out.why = 'up to the ledge'; return out; }
}
