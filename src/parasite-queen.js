// src/parasite-queen.js - THE PARASITE QUEEN, THE WHALE's boss (claude/whale, the OPUS GREYBOX, 2026-11-06). PURE: no DOM, no main.js - her phases, her told moves,
// what a blow does to her, what a forced breath does to her, the bot's reading. src/whale-hands.js binds her to the world (THE HEART CHAMBER's floor, shelves and
// valve, its three nerves, the heart's own breath = a TIDE KIT tide, the heroes, the drawing).
// Sources: scratch/brief-whale-1025.md (BOSS: a great pale tick-queen rooted on the whale's heart; P1 THE ROOTED QUEEN / P2 THE SKITTER / P3 THE FLAYED HEART) and
// scratch/plan-water-1105.md item 9 ("nerve strike flushes her off her roots = OPEN; body stays at >= 0.4x outside it (fixes the brief's weak-point-only line)")
// + section 2 (openings come from THE LEVEL'S VERB - here THE NERVE; one new move per phase; gold read + timer; anti-spam ward after; >= 0.4x outside openings).
//
// WHAT A BLOW DOES TO HER (never invulnerable, never under PQ.k.floor = 0.4):
//   ROOTED (P1, P3, any time she is not open)     PQ.k.rooted (0.4x) - the word 'ROOTED' names the key: STRIKE THE NERVE
//   SKITTERING (P2, off her roots)                 PQ.k.skitter (0.6x) on her shell - PQ.k.knot (1.0x) on the BRIGHT ROOT-KNOT on her back (a blow from behind her)
//   OPEN (gold ring + timer)                       FLUSHED (P1/P3: a FORCED exhale tears her off her roots) / STRANDED (P2: a forced breath while she is on the floor) - 1.5x
//   WARD (grey ring, after an opening)             PQ.k.ward (0.4x) for PQ.ward s: the roots re-grip (drawn tightening) - the anti-spam rule
//   The whale's OWN breath never opens her: she braces on it (told: 'ROOTED'). Only a breath YOU call does - no waiting-room immunity, no timer to wait out (B13).
// HER MOVES (each its own windup pose + release pose - GREYBOX poses in the hands; one windup at a time; never the same move twice running):
//   PHASE ONE - THE ROOTED QUEEN (100-66%):
//     ROOT LASH    (!! step off it)        the floor where you stand bulges and reddens (a marked stretch), then roots burst up out of it
//     BILE SPIT    (! guard it)            her mouthparts swell, then a glob in a high arc at where you stand
//     HEART THRUM  (!! jump it)            on the heart's loud beat: she presses into it, then a ring runs out along the floor both ways (the floor only - shelves are safe)
//     CONSTRICT    (!! roll out of it)     her tendrils reach out across the chamber, then they PULL you to her (a pull field); a roll slips them; what reaches her is bitten
//   AT 66%: THE EXHALE TEARS HER OFF HER ROOTS (told, PQ.uproot s) - PHASE TWO - THE SKITTER (66-33%): off her roots she skitters between the floor, the shelves and the
//     valve. NEW MOVE: LEECH BROOD (!! cut the eggs / roll the leeches) - she lobs two egg sacs; they hatch gut leeches after PQ.brood.hatch s (at most PQ.brood.max alive).
//     OPENING: a forced breath while she is ON THE FLOOR strands her (STRANDED). A forced INHALE while she is up on a shelf drags her down to the floor first.
//   AT 33%: SHE RE-ROOTS IN THE HEART (told) - PHASE THREE - THE FLAYED HEART: the heart beats fast (its breath runs 16 s -> 11 s). NEW MOVE: HEART CRUSH (!! get off the
//     floor) - the heart swells and the whole floor pulses. OPENING as P1 (FLUSHED); and THE PAIR: a second nerve while she is flushed (the inhale) holds her off her
//     roots PQ.pair s longer, once an opening.
export const PQ = {
  hp: 3400, w: 30, h: 34, hSkit: 20, markH: 58, skitter: 110, hop: 0.4,
  p2: 0.66, p3: 0.33, uproot: 1.6, reroot: 1.6,
  lash: { tell: 0.8, w: 22, h: 30, dmg: 16, rec: 0.6 },
  spit: { tell: 0.7, flight: 0.85, g: 700, r: 14, dmg: 14, rec: 0.55 },
  thrum: { tell: 0.9, speed: 210, reach: 420, h: 12, dmg: 14, rec: 0.6 },
  constrict: { tell: 1.0, on: 1.6, pull: 72, bite: 18, rec: 0.7 },
  brood: { tell: 0.9, flight: 0.8, hatch: 2.0, max: 2, rec: 0.7 },
  crush: { tell: 1.4, on: 0.5, h: 14, dmg: 22, rec: 0.9 },
  flushed: 4.0, stranded: 4.0, pair: 2.5, ward: 3.0, idle: [0.6, 1.0],
  k: { floor: 0.4, rooted: 0.4, skitter: 0.6, knot: 1.0, open: 1.5, ward: 0.4 },
};
export const PQ_SAY = { woke: 'THE PARASITE QUEEN: "IT IS MINE. ITS BREATH IS MINE."', rule: 'SHE IS ROOTED. STRIKE A NERVE WHILE IT HOLDS: THE EXHALE TEARS HER LOOSE',
  flushed: 'FLUSHED OFF HER ROOTS: CUT HER', stranded: 'STRANDED: CUT HER', ward: 'HER ROOTS RE-GRIP', braced: 'ROOTED: THE BREATH IS NOT YOURS', uproot: 'THE EXHALE TEARS HER LOOSE',
  skitter: 'SHE SKITTERS: CATCH HER ON THE FLOOR AND CALL A BREATH', dragged: 'THE INHALE DRAGS HER DOWN', reroot: 'SHE RE-ROOTS IN THE HEART', fast: 'THE HEART BEATS FAST',
  pair: 'AND AGAIN: SHE CANNOT GRIP', down: 'THE PARASITE QUEEN LETS GO OF THE HEART' };
export const MOVE_NAME = { lash: 'ROOT LASH', spit: 'BILE SPIT', thrum: 'HEART THRUM', constrict: 'CONSTRICT', brood: 'LEECH BROOD', crush: 'HEART CRUSH' };
/* the told mark of each move and the answer the hint lines name */
export const MOVES = {
  lash: { mark: '!!', answer: 'STEP OFF IT', tell: 'lashTell', release: 'lash' },
  spit: { mark: '!', answer: 'GUARD IT', tell: 'spitTell', release: 'spit' },
  thrum: { mark: '!!', answer: 'JUMP IT', tell: 'thrumTell', release: 'thrum' },
  constrict: { mark: '!!', answer: 'ROLL OUT', tell: 'constrictTell', release: 'constrict' },
  brood: { mark: '!!', answer: 'CUT THE EGGS', tell: 'broodTell', release: 'brood' },
  crush: { mark: '!!', answer: 'GET OFF THE FLOOR', tell: 'crushTell', release: 'crush' },
};
/* marks.js rows: [mode, mark, answer, height] */
export const PQ_TELLS = [['lashTell', '!!', 'dodge', 'low'], ['spitTell', '!', 'block', 'low'], ['thrumTell', '!!', 'jump', 'low'], ['constrictTell', '!!', 'dodge', 'low'],
  ['broodTell', '!!', 'dodge', 'low'], ['crushTell', '!!', 'jump', 'low'], ['uprootTell', '', '', ''], ['rerootTell', '', '', '']];
export const PHASE_MOVES = { 1: ['lash', 'spit', 'thrum', 'constrict'], 2: ['spit', 'lash', 'brood'], 3: ['lash', 'spit', 'thrum', 'constrict', 'crush'] };
export const PHASE_NEW = { 1: ['lash', 'spit', 'thrum', 'constrict'], 2: ['brood'], 3: ['crush'] };
export const OPEN_MODES = new Set(['flushed', 'stranded']);
export const COMMITTED = new Set(['lash', 'lashRec', 'spit', 'spitRec', 'thrum', 'thrumRec', 'constrict', 'constrictRec', 'brood', 'broodRec', 'crush', 'crushRec', 'hop']);
export const pqOpen = e => !!e && OPEN_MODES.has(e.mode) && (e.open || 0) > 0;

/* G = { x0, x1 (her floor, px), floor (px), heartX (px: where her roots are), spots: [{ x, y, floor }] (P2: where she skitters to) } */
export function newFight(G) {
  return { G, ph: 1, ward: 0, last: null, told: {}, globs: [], rings: [], roots: [], eggs: [], pull: 0, constricting: false, paired: false, target: null,
    n: { lash: 0, spit: 0, thrum: 0, constrict: 0, brood: 0, crush: 0, flushed: 0, stranded: 0, braced: 0, pairs: 0, dragged: 0, landed: 0, bites: 0, gid: 0 } };
}
export const onFloor = (e, S) => Math.abs(e.y - S.G.floor) < 4;

/* WHAT A BLOW IS WORTH. fromX = the striker's x (P2: a blow from behind her finds the root-knot). Never under PQ.k.floor */
export function takeAt(e, S, fromX) {
  if (S.ward > 0) return { k: PQ.k.ward, word: 'WARDED' };
  if (pqOpen(e)) return { k: PQ.k.open, word: null };
  if (S.ph === 2 && e.mode !== 'uprootTell' && e.mode !== 'rerootTell') { const behind = fromX !== undefined && Math.sign(fromX - e.x) === -Math.sign(e.face || 1); return behind ? { k: PQ.k.knot, word: null, knot: true } : { k: PQ.k.skitter, word: 'HER SHELL' }; }
  return { k: PQ.k.rooted, word: 'ROOTED' };
}
export const takeK = (e, S, fromX) => Math.max(PQ.k.floor, takeAt(e, S, fromX).k);

const setMode = (e, m, t) => { e.mode = m; e.modeT = t; };
const rnd = ([a, b]) => a + Math.random() * (b - a);
const nearest = (e, hs) => { let b = null, d = 1e9; for (const h of hs) if (h.alive) { const q = Math.abs(h.x - e.x) + Math.abs(h.y - e.y) * 0.5; if (q < d) { d = q; b = h; } } return b; };
const busy = e => /Tell$/.test(e.mode) || COMMITTED.has(e.mode) || OPEN_MODES.has(e.mode) || e.mode === 'sleep' || e.mode === 'wake';

/* A BREATH WAS FORCED IN THE CHAMBER (the hands call it when a struck nerve's flare goes off). kind = 'exhale' | 'inhale'. -> 'flushed' | 'stranded' | 'dragged' | 'pair' | 'braced' | null */
export function breathForced(e, S, c, kind) {
  if (!e || !e.alive || e.mode === 'sleep' || e.mode === 'wake' || e.mode === 'uprootTell' || e.mode === 'rerootTell') return null;
  if (pqOpen(e)) {   /* THE PAIR (P3): the second nerve while she is flushed holds her off her roots longer, once */
    if (S.ph === 3 && kind === 'inhale' && !S.paired) { S.paired = true; S.n.pairs++; e.open += PQ.pair; e.modeT += PQ.pair; c.number(e.x, e.y - 76, PQ_SAY.pair, '#ffd36b'); c.sound('open'); return 'pair'; }
    return null;
  }
  if (S.ward > 0) return null;
  if (S.ph === 2) {
    if (onFloor(e, S) && e.mode !== 'hop') { open(e, S, c, 'stranded', PQ.stranded, PQ_SAY.stranded); S.n.stranded++; return 'stranded'; }
    if (kind === 'inhale') { S.n.dragged++; S.target = { x: e.x, y: S.G.floor, floor: true }; hop(e, S); c.number(e.x, e.y - 60, PQ_SAY.dragged, '#e8c0c8'); return 'dragged'; }
    return null;
  }
  if (kind === 'exhale') { open(e, S, c, 'flushed', PQ.flushed, PQ_SAY.flushed); S.n.flushed++; return 'flushed'; }
  S.n.braced++; return 'braced';
}
function open(e, S, c, mode, t, word) {
  S.constricting = false; S.pull = 0; S.paired = false; S.roots = [];
  setMode(e, mode, t); e.open = t; c.number(e.x, e.y - 70, word, '#ffd36b'); c.sound('open'); c.fx && c.fx('flush', e.x, e.y);
}
/* the whale's own (unforced) exhale: she braces on her roots - told, so the player learns it is not theirs */
export function breathNatural(e, S, c) { if (!e || !e.alive || busy(e) || S.ph === 2) return; if (!S.told.braced) { S.told.braced = 1; c.number(e.x, e.y - 70, PQ_SAY.braced, '#9ab0c0'); } }

/* ONE FRAME OF HER. hs = heroes [{ x, y, ground, alive, dodge }], c = the world (hands): number, sound, mark, hit(box, dmg, name, o) -> any, floorY(x, y),
   fx(kind, x, y), rate(r) (the heart's breath tempo), leeches() -> n alive, hatch(x, y) */
export function stepQueen(e, S, dt, hs, c) {
  S.ward = Math.max(0, S.ward - dt);
  stepShots(e, S, dt, hs, c);
  if (e.mode === 'sleep') return;
  const h = nearest(e, hs);
  e.modeT -= dt; if (e.open > 0) e.open = Math.max(0, e.open - dt);
  if (e.mode !== 'constrict') { S.pull = 0; S.constricting = false; }
  if (h && !busy(e) && e.mode !== 'skitter') e.face = Math.sign(h.x - e.x) || e.face || 1;
  /* THE PHASE LINES, at the next free moment */
  if (!busy(e) && S.ph === 1 && e.hp < e.maxHp * PQ.p2) { setMode(e, 'uprootTell', PQ.uproot); c.mark(''); c.sound('tellHard'); c.number(e.x, e.y - 80, PQ_SAY.uproot, '#e8c0c8'); return; }
  if (!busy(e) && S.ph === 2 && e.mode !== 'hop' && e.hp < e.maxHp * PQ.p3) { setMode(e, 'rerootTell', PQ.reroot); S.target = { x: S.G.heartX, y: S.G.floor, floor: true }; c.mark(''); c.sound('tellHard'); c.number(e.x, e.y - 80, PQ_SAY.reroot, '#e8c0c8'); return; }
  switch (e.mode) {
    case 'wake': if (e.modeT <= 0) { setMode(e, 'idle', 0.9); if (!S.told.rule) { S.told.rule = 1; c.number(e.x, e.y - 90, PQ_SAY.rule, '#ffd36b'); } } return;
    case 'uprootTell': if (e.modeT <= 0) { S.ph = 2; e.h = PQ.hSkit; setMode(e, 'idle', 0.5); c.number(e.x, e.y - 60, PQ_SAY.skitter, '#e8c0c8'); } return;
    case 'rerootTell': e.x += Math.sign(S.G.heartX - e.x) * Math.min(Math.abs(S.G.heartX - e.x), PQ.skitter * dt); if (Math.abs(e.y - S.G.floor) > 1) e.y = S.G.floor;
      if (e.modeT <= 0) { S.ph = 3; e.x = S.G.heartX; e.y = S.G.floor; e.h = PQ.h; c.rate && c.rate('fast'); setMode(e, 'idle', 0.8); c.number(e.x, e.y - 60, PQ_SAY.fast, '#ff6b6b'); } return;
    case 'idle': {
      if (!h) return;
      if (S.ph === 2 && e.modeT <= 0 && Math.random() < 0.45) { skitterTo(e, S, h); return; }
      if (e.modeT <= 0) pick(e, S, h, c);
      return; }
    case 'skitter': { const T = S.target; if (!T) { setMode(e, 'idle', 0.3); return; }
      const dx = T.x - e.x; e.face = Math.sign(dx) || e.face; e.x += Math.sign(dx) * Math.min(Math.abs(dx), PQ.skitter * dt);
      if (Math.abs(T.x - e.x) < 2) { if (Math.abs(T.y - e.y) > 2) hop(e, S); else setMode(e, 'idle', rnd(PQ.idle)); } else if (e.modeT <= 0) setMode(e, 'idle', 0.2); return; }
    case 'hop': { const T = S.target, k = 1 - Math.max(0, e.modeT) / PQ.hop; if (!T) { setMode(e, 'idle', 0.3); return; }
      e.y = S.hopY0 + (T.y - S.hopY0) * k - Math.sin(k * Math.PI) * 26; e.x = S.hopX0 + (T.x - S.hopX0) * k;
      if (e.modeT <= 0) { e.x = T.x; e.y = T.y; S.target = null; setMode(e, 'idle', rnd(PQ.idle)); } return; }
    /* ---- ROOT LASH ---- */
    case 'lashTell': if (e.modeT <= 0) { setMode(e, 'lash', 0.25); S.n.lash++; c.sound('crack');
        for (const r of S.roots) c.hit([r.x - PQ.lash.w, r.x + PQ.lash.w, r.y - PQ.lash.h, r.y + 2], PQ.lash.dmg, 'ROOT LASH', { key: 'rl' + S.n.lash }); } return;
    case 'lash': if (e.modeT <= 0) { S.roots = []; setMode(e, 'lashRec', PQ.lash.rec); } return;
    /* ---- BILE SPIT ---- */
    case 'spitTell': if (h && e.modeT > 0.2) S.aim = { x: h.x, y: c.floorY(h.x, h.y - 4) ?? h.y };
      if (e.modeT <= 0) { spit(e, S, c); setMode(e, 'spit', 0.15); } return;
    case 'spit': if (e.modeT <= 0) setMode(e, 'spitRec', PQ.spit.rec); return;
    /* ---- HEART THRUM ---- */
    case 'thrumTell': if (e.modeT <= 0) { setMode(e, 'thrum', 0.2); S.n.thrum++; c.sound('heart'); S.rings.push({ id: S.n.thrum, x: e.x, r: 6, y: S.G.floor }); } return;
    case 'thrum': if (e.modeT <= 0) setMode(e, 'thrumRec', PQ.thrum.rec); return;
    /* ---- CONSTRICT ---- */
    case 'constrictTell': if (e.modeT <= 0) { setMode(e, 'constrict', PQ.constrict.on); S.n.constrict++; c.sound('squelch'); } return;
    case 'constrict': S.constricting = true; S.pull = PQ.constrict.pull;
      if (c.hit([e.x - PQ.w / 2 - 6, e.x + PQ.w / 2 + 6, e.y - e.h - 4, e.y + 2], PQ.constrict.bite, 'CONSTRICT', { key: 'cb' + S.n.constrict })) S.n.bites++;
      if (e.modeT <= 0) { S.constricting = false; S.pull = 0; setMode(e, 'constrictRec', PQ.constrict.rec); } return;
    /* ---- LEECH BROOD (P2) ---- */
    case 'broodTell': if (e.modeT <= 0) { brood(e, S, c, h); setMode(e, 'brood', 0.2); } return;
    case 'brood': if (e.modeT <= 0) setMode(e, 'broodRec', PQ.brood.rec); return;
    /* ---- HEART CRUSH (P3) ---- */
    case 'crushTell': if (e.modeT <= 0) { setMode(e, 'crush', PQ.crush.on); S.n.crush++; c.sound('boom'); c.fx && c.fx('crush', e.x, S.G.floor); } return;
    case 'crush': c.hit([S.G.x0, S.G.x1, S.G.floor - PQ.crush.h, S.G.floor + 2], PQ.crush.dmg, 'HEART CRUSH', { key: 'hc' + S.n.crush, low: true });
      if (e.modeT <= 0) setMode(e, 'crushRec', PQ.crush.rec); return;
    case 'lashRec': case 'spitRec': case 'thrumRec': case 'constrictRec': case 'broodRec': case 'crushRec': if (e.modeT <= 0) setMode(e, 'idle', rnd(PQ.idle)); return;
    /* ---- OPEN ---- */
    case 'flushed': case 'stranded': if (e.modeT <= 0) { e.open = 0; S.ward = PQ.ward; S.paired = false; c.ringWard && c.ringWard(e); c.number(e.x, e.y - 70, PQ_SAY.ward, '#9ab0c0'); setMode(e, 'idle', 0.6); } return;
  }
}
function hop(e, S) { S.hopX0 = e.x; S.hopY0 = e.y; setMode(e, 'hop', PQ.hop); }
function skitterTo(e, S, h) {
  const spots = (S.G.spots || []).filter(p => Math.abs(p.x - e.x) > 30);
  if (!spots.length) { setMode(e, 'idle', 0.4); return; }
  /* away from the nearest hero more often than not: she skitters, she does not charge */
  spots.sort((a, b) => Math.abs(b.x - h.x) - Math.abs(a.x - h.x));
  const p = Math.random() < 0.6 ? spots[0] : spots[Math.floor(Math.random() * spots.length)];
  S.target = { ...p }; setMode(e, 'skitter', 2.5);
}
/* WHAT SHE DOES NEXT: by phase, by where you stand, never the same move twice running */
export function pick(e, S, h, c) {
  const ad = Math.abs(h.x - e.x); let opts = PHASE_MOVES[S.ph].slice();
  if (S.ph === 2 && c.leeches && c.leeches() >= PQ.brood.max) opts = opts.filter(o => o !== 'brood');
  if (ad < 70) opts.push(S.ph === 2 ? 'lash' : 'thrum');
  if (S.ph === 3) opts.push('crush');
  let m = opts.filter(o => o !== S.last); if (!m.length) m = ['spit'];
  const mv = m[Math.floor(Math.random() * m.length)]; S.last = mv; S.n.pick = (S.n.pick || 0) + 1;
  const M = MOVES[mv]; setMode(e, M.tell, PQ[mv].tell); c.mark(M.mark); c.sound(M.mark === '!' ? 'tell' : 'tellHard');
  if (mv === 'lash') { const fy = c.floorY(h.x, h.y - 4); S.roots = [{ x: h.x, y: fy ?? h.y }]; }
  return mv;
}
function spit(e, S, c) {
  const A = S.aim || { x: e.x + e.face * 80, y: S.G.floor }, x0 = e.x + e.face * 12, y0 = e.y - e.h + 6, T = PQ.spit.flight;
  S.globs.push({ id: ++S.n.gid, kind: 'spit', x: x0, y: y0, vx: (A.x - x0) / T, vy: (A.y - y0) / T - 0.5 * PQ.spit.g * T, t: T + 0.5 }); S.n.spit++; c.sound('spit'); S.aim = null;
}
function brood(e, S, c, h) {
  S.n.brood++; c.sound('spit');
  for (const dx of [-60, 60]) { const tx = Math.max(S.G.x0 + 16, Math.min(S.G.x1 - 16, (h ? h.x : e.x) + dx)), x0 = e.x, y0 = e.y - e.h, T = PQ.brood.flight, ty = S.G.floor;
    S.globs.push({ id: ++S.n.gid, kind: 'egg', x: x0, y: y0, vx: (tx - x0) / T, vy: (ty - y0) / T - 0.5 * PQ.spit.g * T, t: T + 0.5 }); }
}
function stepShots(e, S, dt, hs, c) {
  for (const g of S.globs) { g.t -= dt; g.vy += PQ.spit.g * dt; g.x += g.vx * dt; g.y += g.vy * dt;
    if (g.kind === 'spit' && c.hit([g.x - 6, g.x + 6, g.y - 6, g.y + 6], PQ.spit.dmg, 'BILE SPIT', { key: 'ps' + g.id, blockable: true })) { g.t = 0; continue; }
    const fy = g.vy > 0 ? c.floorY(g.x, g.y - 6) : null;
    if (fy != null && g.y >= fy) { g.t = 0; if (g.kind === 'egg') S.eggs.push({ id: g.id, x: g.x, y: fy, t: PQ.brood.hatch, hp: 1 }); else c.fx && c.fx('splash', g.x, fy); } }
  S.globs = S.globs.filter(g => g.t > 0);
  for (const egg of S.eggs) { egg.t -= dt; if (egg.t <= 0 && egg.hp > 0) { egg.hp = 0; if (!c.leeches || c.leeches() < PQ.brood.max) c.hatch && c.hatch(egg.x, egg.y); } }
  S.eggs = S.eggs.filter(q => q.t > 0 && q.hp > 0);
  for (const r of S.rings) { r.r += PQ.thrum.speed * dt;
    for (const sx of [-1, 1]) { const x = r.x + sx * r.r; c.hit([x - 7, x + 7, r.y - PQ.thrum.h, r.y + 2], PQ.thrum.dmg, 'HEART THRUM', { key: 'th' + r.id, low: true }); } }
  S.rings = S.rings.filter(r => r.r < PQ.thrum.reach);
}
/* a blow on an egg sac (the hands test every attack box): it bursts */
export function cutEggs(S, hb) { let n = 0; for (const egg of S.eggs) if (egg.hp > 0 && hb.l < egg.x + 6 && hb.r > egg.x - 6 && hb.t < egg.y && hb.b > egg.y - 10) { egg.hp = 0; n++; } return n; }

/* THE BOT'S READING (for a lab hook later: tools/boss-rates.mjs whale - owed): the human answer to what she is doing now. nerve = { x, ready, phase } of the best nerve */
export function pqPlan(e, S, nerve) {
  if (!e) return { why: 'none' };
  if (pqOpen(e)) return { why: 'open', go: 'in', attack: true };
  if (e.mode === 'thrumTell' && e.modeT < 0.25) return { why: 'thrum', jump: true };
  if (e.mode === 'crushTell') return { why: 'crush', go: 'ledge' };
  if (e.mode === 'constrictTell' || e.mode === 'constrict') return { why: 'constrict', roll: true, go: 'away' };
  if (e.mode === 'lashTell') return { why: 'lash', go: 'away' };
  if (e.mode === 'spitTell' && e.modeT < 0.3) return { why: 'spit', block: true };
  if (S.ward <= 0 && nerve && nerve.ready && (S.ph !== 2 ? nerve.phase === 'low' : onFloor(e, S))) return { why: 'nerve', go: 'nerve', to: nerve.x, attack: true };
  if (S.ph === 2) return { why: 'knot', go: 'behind', attack: true };
  return { why: 'wait', go: 'nerve', to: nerve ? nerve.x : e.x };
}
