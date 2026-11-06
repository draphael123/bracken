// src/naga-queen.js - THE NAGA QUEEN, SIREN ROCKS' boss (claude/sirenrocks, the OPUS GREYBOX, 2026-11-06). PURE: no DOM, no main.js - her phases, her told moves, what a
// blow does to her, the bot's reading. src/siren-rocks-hands.js binds her to the world (THE COILED SPIRE's floor, its two singing stones, the spire's tide, the heroes, the
// drawing). Sources: scratch/brief-sirenrocks-1024.md (Daniel 10-24: "serpent-bodied siren coiled round the arena: song pull toward her coils (told), tail sweep (jump),
// spit/venom arc; P2 she sinks under the tide and sings from the water (break the singing stones to drag her up = OPEN). 60-70% with flasks, mash 0/6, 90-150 s, never
// fully invulnerable, own poses") + scratch/plan-water-1105.md section 2 (openings come from THE LEVEL'S VERB - here THE STONES; one new move per phase; gold read + timer
// on every opening; anti-spam ward after; >= 0.4x everywhere outside openings) + section 3 ("Naga P2" is a tide-kit user: the spire's water is a kit chamber).
//
// WHAT A BLOW DOES TO HER (never invulnerable, never under NQ.k.floor = 0.4):
//   HER SCALES (P1, any time she is not open)  NQ.k.body (0.6x)
//   UNDER THE TIDE (P2, coiled on the bed)     NQ.k.under (0.4x) - a hero who swims down to her still lands it
//   OPEN (gold ring + timer)                   THE SONG BREAKS (P1: a stone struck while she sings - 1.0x) - DRAGGED UP (P2: both stones silent - 1.25x)
//   WARD (grey ring, after an opening)         NQ.k.ward (0.4x) for NQ.wardT s: the anti-spam rule
// HER MOVES (each its own windup pose + release pose - GREYBOX poses in the hands; one windup at a time; never the same move twice running):
//   PHASE ONE - ON THE ROCK:
//     HER SONG        (!! the stones answer it)  she rears and draws breath (the arena's stones glow with her), then SINGS: everything is pulled to her coils (a
//                                                pull field, NQ.song.pull px/s - you can walk out of it, slowly; a guard braces it) and her coils bite what reaches them.
//                                                STRIKE A STONE WHILE SHE SINGS and it rings back down her song: THE SONG BREAKS - she reels, OPEN.
//     THE TAIL SWEEP  (!! jump it)              her tail draws back, then sweeps the floor round her (low).
//     THE VENOM ARC   (! guard it, then step out) she spits a glob in a high arc at where you stand; it splashes and leaves venom on the rock for NQ.venom.pool s.
//   PHASE TWO (under NQ.p2 of her health) - THE TIDE COMES IN: three tolls and the spire's water rises over the floor (the shelves stay dry); she sinks into it. NEW MOVE:
//     THE DROWNING SONG (!! the bubbles ring, the stones glow)  from under the water: the pull is stronger in the water (NQ.drown.wet). BREAK BOTH STONES - both silent at
//                                                 once - and her song has nothing left to sing through: she is DRAGGED UP onto the rock (OPEN), the tide falls back.
//     She surfaces to spit (THE VENOM ARC, told: her head breaks the water) and glides along the bed after you.
export const NQ = {
  hp: 3600, w: 26, h: 30, hUnder: 12, markH: 52, slither: 54, glide: 44, keep: 58,
  p2: 0.5,
  song: { tell: 1.1, on: 2.6, pull: 70, bite: 16, rec: 0.7 },
  sweep: { tell: 0.85, r: 84, h: 12, dmg: 18, rec: 0.7 },
  venom: { tell: 0.7, flight: 0.85, g: 700, r: 16, dmg: 14, pool: 2.0, poolDmg: 6, poolTick: 0.5, rec: 0.55 },
  reel: 2.8, dragged: 3.4,
  sink: { tell: 1.8 },
  drown: { tell: 1.3, on: 3.2, pull: 70, wet: 100, bite: 18, rec: 0.6 },
  surface: { tell: 0.8 },
  wardT: 1.6, idle: [0.55, 0.95],
  k: { floor: 0.4, body: 0.6, under: 0.4, open: 1.0, dragged: 1.25, ward: 0.4 },
};
export const NQ_SAY = { woke: 'THE NAGA QUEEN: "SING WITH ME."', rule: 'HER SONG RINGS IN THE STONES: BREAK ONE WHILE SHE SINGS', reel: 'THE SONG BREAKS: CUT HER',
  tide: 'THE TIDE COMES IN', under: 'SHE SINGS FROM THE WATER: SILENCE BOTH STONES', dragged: 'DRAGGED UP: CUT HER', ward: 'HER SCALES CLOSE',
  oneStone: 'ONE STONE SILENT. THE OTHER STILL SINGS', down: 'THE NAGA QUEEN SINKS AND DOES NOT RISE' };
export const MOVE_NAME = { song: 'HER SONG', sweep: 'THE TAIL SWEEP', venom: 'THE VENOM ARC', drown: 'THE DROWNING SONG', surface: 'THE VENOM ARC', sink: 'THE TIDE' };
/* the told mark of each move and the answer the hint lines name */
export const MOVES = {
  song: { mark: '!!', answer: 'STRIKE A STONE', tell: 'songTell', release: 'song' },
  sweep: { mark: '!!', answer: 'JUMP IT', tell: 'sweepTell', release: 'sweep' },
  venom: { mark: '!', answer: 'GUARD IT, STEP OUT', tell: 'venomTell', release: 'venomSpit' },
  drown: { mark: '!!', answer: 'SILENCE BOTH STONES', tell: 'drownTell', release: 'drown' },
  surface: { mark: '!', answer: 'GUARD IT, STEP OUT', tell: 'surfaceTell', release: 'venomSpit' },
};
/* marks.js rows: [mode, mark, answer, height] */
export const NQ_TELLS = [['songTell', '!!', 'dodge', 'low'], ['sweepTell', '!!', 'jump', 'low'], ['venomTell', '!', 'block', 'low'], ['drownTell', '!!', 'dodge', 'low'], ['surfaceTell', '!', 'block', 'low'], ['sinkTell', '', '', '']];
export const PHASE_NEW = { 1: ['song', 'sweep', 'venom'], 2: ['drown'] };
export const OPEN_MODES = new Set(['reel', 'dragged']);
export const COMMITTED = new Set(['sweep', 'sweepRec', 'venomSpit', 'venomRec', 'songRec', 'drownRec']);
export const nqOpen = e => !!e && OPEN_MODES.has(e.mode) && (e.open || 0) > 0;

/* G = { x0, x1 (her floor, px), floor (px), stones: [ids] } */
export function newFight(G) {
  return { G, ph: 1, ward: 0, last: null, told: {}, singing: false, under: false, pull: 0, globs: [], pools: [], tide: 'out',
    n: { song: 0, broke: 0, sweep: 0, venom: 0, drown: 0, dragged: 0, tides: 0, landed: 0, bites: 0, gid: 0 } };
}

/* WHAT A BLOW IS WORTH. Never under NQ.k.floor */
export function takeAt(e, S) {
  if (S.ward > 0) return { k: NQ.k.ward, word: 'WARDED' };
  if (nqOpen(e)) return { k: e.mode === 'dragged' ? NQ.k.dragged : NQ.k.open, word: null };
  if (S.under) return { k: NQ.k.under, word: 'UNDER THE TIDE' };
  return { k: NQ.k.body, word: null };
}
export const takeK = (e, S) => Math.max(NQ.k.floor, takeAt(e, S).k);

const setMode = (e, m, t) => { e.mode = m; e.modeT = t; };
const rnd = ([a, b]) => a + Math.random() * (b - a);
const nearest = (e, hs) => { let b = null, d = 1e9; for (const h of hs) if (h.alive) { const q = Math.abs(h.x - e.x) + Math.abs(h.y - e.y) * 0.5; if (q < d) { d = q; b = h; } } return b; };
const clampX = (S, x) => Math.max(S.G.x0 + 14, Math.min(S.G.x1 - 14, x));

/* A STONE WAS STRUCK (the hands call it). silent = how many of the arena's stones are silent now, total = how many there are. -> 'reel' | 'dragged' | null */
export function stoneStruck(e, S, c, silent, total) {
  if (!e || !e.alive || e.mode === 'sleep' || e.mode === 'wake') return null;
  if (S.ph === 1 && e.mode === 'song') { S.singing = false; S.n.broke++; setMode(e, 'reel', NQ.reel); e.open = NQ.reel; c.number(e.x, e.y - 70, NQ_SAY.reel, '#ffd36b'); c.sound('open'); return 'reel'; }
  if (S.ph === 2 && S.tide === 'in' && e.mode !== 'sinkTell' && !nqOpen(e)) {
    if (silent >= total) { drag(e, S, c); return 'dragged'; }
    if (!S.told.one) { S.told.one = 1; c.number(e.x, e.y - 60, NQ_SAY.oneStone, '#e2c8ff'); }
  }
  return null;
}
function drag(e, S, c) {
  S.singing = false; S.under = false; S.n.dragged++; e.h = NQ.h; e.y = S.G.floor;
  setMode(e, 'dragged', NQ.dragged); e.open = NQ.dragged; c.tide('out'); S.tide = 'out';
  c.number(e.x, e.y - 70, NQ_SAY.dragged, '#ffd36b'); c.sound('open'); c.fx && c.fx('drag', e.x, e.y);
}

/* ONE FRAME OF HER. hs = heroes [{ x, y, ground, alive, wet, dodge }], c = the world (hands): number, sound, mark, hit(box, dmg, name, o) -> any, tide('in'|'out'),
   tideK() (0 dry .. 1 flooded), floorY(x) (the rock under x: the floor or a shelf), fx(kind, x, y), stonesSilent() -> n, stonesTotal */
export function stepQueen(e, S, dt, hs, c) {
  S.ward = Math.max(0, S.ward - dt);
  stepGlobs(S, dt, hs, c);
  if (e.mode === 'sleep') return;
  const h = nearest(e, hs);
  e.modeT -= dt; if (e.open > 0) e.open = Math.max(0, e.open - dt);
  S.pull = 0;
  if (h && !/Tell$/.test(e.mode) && !COMMITTED.has(e.mode) && !OPEN_MODES.has(e.mode) && e.mode !== 'song' && e.mode !== 'drown') e.face = Math.sign(h.x - e.x) || e.face || 1;
  /* PHASE TWO at the next free moment under her line */
  if (S.ph === 1 && e.hp < e.maxHp * NQ.p2 && (e.mode === 'idle' || e.mode === 'slither')) { S.ph = 2; S.singing = false; sinkTell(e, S, c); return; }
  switch (e.mode) {
    case 'wake': if (e.modeT <= 0) { setMode(e, 'idle', 0.8); if (!S.told.rule) { S.told.rule = 1; c.number(e.x, e.y - 90, NQ_SAY.rule, '#ffd36b'); } } return;
    case 'idle': case 'slither': {
      if (!h) return;
      const dx = h.x - e.x, ad = Math.abs(dx);
      if (ad > NQ.keep + 6) { e.x = clampX(S, e.x + Math.sign(dx) * NQ.slither * dt); e.mode = 'slither'; } else e.mode = 'idle';
      if (e.modeT <= 0) pick(e, S, h, ad, c);
      return; }
    /* ---- HER SONG ---- */
    case 'songTell': if (e.modeT <= 0) { setMode(e, 'song', NQ.song.on); S.singing = true; S.n.song++; c.sound('song'); } return;
    case 'song': S.singing = true; S.pull = NQ.song.pull; bite(e, S, c, NQ.song.bite, 'HER COILS', 's' + S.n.song);
      if (e.modeT <= 0) { S.singing = false; setMode(e, 'songRec', NQ.song.rec); } return;
    case 'songRec': case 'sweepRec': case 'venomRec': if (e.modeT <= 0) setMode(e, 'idle', rnd(NQ.idle)); return;
    /* ---- THE TAIL SWEEP ---- */
    case 'sweepTell': if (e.modeT <= 0) { setMode(e, 'sweep', 0.18); S.n.sweep++; c.sound('whoosh');
        c.hit([e.x - NQ.sweep.r, e.x + NQ.sweep.r, e.y - NQ.sweep.h, e.y + 2], NQ.sweep.dmg, 'THE TAIL SWEEP', { key: 'sw' + S.n.sweep, low: true }); } return;
    case 'sweep': if (e.modeT <= 0) setMode(e, 'sweepRec', NQ.sweep.rec); return;
    /* ---- THE VENOM ARC (both phases) ---- */
    case 'venomTell': case 'surfaceTell': if (h && e.modeT > 0.2) S.aim = { x: h.x, y: c.floorY(h.x) };
      if (e.modeT <= 0) { spit(e, S, c); setMode(e, 'venomSpit', 0.15); } return;
    case 'venomSpit': if (e.modeT <= 0) { if (S.ph === 2 && S.tide === 'in') { S.under = true; e.h = NQ.hUnder; setMode(e, 'under', rnd(NQ.idle)); } else setMode(e, 'venomRec', NQ.venom.rec); } return;
    /* ---- OPEN ---- */
    case 'reel': if (e.modeT <= 0) { e.open = 0; S.ward = NQ.wardT; c.ringWard && c.ringWard(e); c.number(e.x, e.y - 70, NQ_SAY.ward, '#9ab0c0'); setMode(e, 'idle', 0.5); } return;
    case 'dragged': if (e.modeT <= 0) { e.open = 0; S.ward = NQ.wardT; c.ringWard && c.ringWard(e); sinkTell(e, S, c); } return;
    /* ---- PHASE TWO ---- */
    case 'sinkTell': if (e.modeT <= 0) { S.under = true; e.h = NQ.hUnder; setMode(e, 'under', 1.0); if (!S.told.under) { S.told.under = 1; c.number(e.x, e.y - 60, NQ_SAY.under, '#e2c8ff'); } } return;
    case 'under': {
      if (!h) return; const dx = h.x - e.x, ad = Math.abs(dx);
      if (ad > 20) e.x = clampX(S, e.x + Math.sign(dx) * NQ.glide * dt);
      if (e.modeT <= 0 && c.tideK() > 0.9) { const opts = ['drown', 'drown', 'surface'].filter(o => o !== S.last); const mv = opts[Math.floor(Math.random() * opts.length)] || 'drown'; S.last = mv;
        if (mv === 'drown') { setMode(e, 'drownTell', NQ.drown.tell); c.mark('!!'); c.sound('tellHard'); }
        else { setMode(e, 'surfaceTell', NQ.surface.tell); S.under = false; e.h = NQ.h; c.mark('!'); c.sound('tell'); } }   /* her head out of the water: her scales, not the tide */
      return; }
    case 'drownTell': if (e.modeT <= 0) { setMode(e, 'drown', NQ.drown.on); S.singing = true; S.n.drown++; c.sound('song'); } return;
    case 'drown': S.singing = true; S.pull = NQ.drown.pull; bite(e, S, c, NQ.drown.bite, 'HER COILS', 'd' + S.n.drown);
      if (e.modeT <= 0) { S.singing = false; setMode(e, 'drownRec', NQ.drown.rec); } return;
    case 'drownRec': if (e.modeT <= 0) setMode(e, 'under', rnd(NQ.idle)); return;
  }
}
function sinkTell(e, S, c) { S.under = false; e.h = NQ.h; e.y = S.G.floor; setMode(e, 'sinkTell', NQ.sink.tell); S.tide = 'in'; S.n.tides++; c.tide('in'); c.sound('toll'); c.mark('');
  c.number(e.x, e.y - 80, NQ_SAY.tide, '#bfe6f5'); }
/* her coils: a hero inside her body box while she sings is bitten once a song */
function bite(e, S, c, dmg, name, key) { if (c.hit([e.x - NQ.w / 2 - 4, e.x + NQ.w / 2 + 4, e.y - e.h - 4, e.y + 2], dmg, name, { key, blockable: true })) S.n.bites++; }
function spit(e, S, c) {
  const A = S.aim || { x: e.x + e.face * 80, y: S.G.floor }, x0 = e.x + e.face * 10, y0 = e.y - (S.ph === 2 ? 14 : NQ.h - 4), T = NQ.venom.flight;
  S.globs.push({ id: ++S.n.gid, x: x0, y: y0, vx: (A.x - x0) / T, vy: (A.y - y0) / T - 0.5 * NQ.venom.g * T, t: T + 0.4 }); S.n.venom++; c.sound('spit'); S.aim = null;
}
function stepGlobs(S, dt, hs, c) {
  for (const g of S.globs) { g.t -= dt; g.vy += NQ.venom.g * dt; g.x += g.vx * dt; g.y += g.vy * dt;
    const fy = c.floorY(g.x); if (fy != null && g.y >= fy) { g.t = 0; g.y = fy; c.hit([g.x - NQ.venom.r, g.x + NQ.venom.r, fy - 22, fy + 2], NQ.venom.dmg, 'THE VENOM ARC', { key: 'g' + g.id, blockable: true });
      S.pools.push({ id: g.id, x: g.x, y: fy, t: NQ.venom.pool, tick: 0 }); c.fx && c.fx('splash', g.x, fy); } }
  S.globs = S.globs.filter(g => g.t > 0);
  for (const p of S.pools) { p.t -= dt; p.tick -= dt; if (p.tick <= 0) { p.tick = NQ.venom.poolTick; c.hit([p.x - 16, p.x + 16, p.y - 6, p.y + 2], NQ.venom.poolDmg, 'HER VENOM', { key: 'p' + p.id + ':' + Math.round(p.t * 10), low: true }); } }
  S.pools = S.pools.filter(p => p.t > 0);
}
/* WHAT SHE DOES NEXT (P1): by where you stand, never the same move twice running */
export function pick(e, S, h, ad, c) {
  const opts = [];
  if (ad <= NQ.sweep.r + 8) opts.push('sweep', 'sweep', 'song');
  else opts.push('venom', 'song', 'song');
  if (ad > NQ.sweep.r + 8 && ad < 200) opts.push('venom');
  let m = opts.filter(o => o !== S.last); if (!m.length) m = ['venom'];
  const mv = m[Math.floor(Math.random() * m.length)]; S.last = mv;
  if (mv === 'song') { setMode(e, 'songTell', NQ.song.tell); c.mark('!!'); c.sound('tellHard'); }
  else if (mv === 'sweep') { setMode(e, 'sweepTell', NQ.sweep.tell); c.mark('!!'); c.sound('tellHard'); }
  else { setMode(e, 'venomTell', NQ.venom.tell); c.mark('!'); c.sound('tell'); }
  return mv;
}
/* THE BOT'S READING (for a lab hook later: tools/boss-rates.mjs sirenrocks - owed): the human answer to what she is doing now. stone = the nearest stone's x */
export function nqPlan(e, S, stoneX) {
  if (!e) return { why: 'none' };
  if (nqOpen(e)) return { why: 'open', go: 'in', attack: true };
  if (e.mode === 'songTell' || e.mode === 'song') return { why: 'song', go: 'stone', to: stoneX, attack: e.mode === 'song' };
  if (e.mode === 'drownTell' || e.mode === 'drown' || (S.ph === 2 && S.under)) return { why: 'stones', go: 'stone', to: stoneX, attack: true };
  if (e.mode === 'sweepTell' && e.modeT < 0.25) return { why: 'sweep', jump: true };
  if ((e.mode === 'venomTell' || e.mode === 'surfaceTell') && e.modeT < 0.3) return { why: 'venom', block: true };
  return { why: 'flank', go: 'in', attack: true };
}
