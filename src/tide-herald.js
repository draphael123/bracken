// src/tide-herald.js - THE TIDE HERALD 2, LONG WATER 3's boss (claude/longwater3, the OPUS GREYBOX, 11-07). PURE: no DOM, no main.js - his phases, his told moves,
// what a blow does to him, how the TIDE opens him, the bot's reading. src/longwater3-hands.js binds him to THE TIDE FLATS (the arena's kit tide 'square', its BELL on
// the west stone and its SLUICE WHEEL on the east one, the stones, the heroes). He keeps master's ent type 'herald' (his sprite sheet, bestiary card, music, the boss
// rule's OPEN_RULE herald = mired | reel and chipBy herald 0.4), so every mode name below that master's sheet draws is master's own.
// Sources: plan-water-1105 item 1 ("Boss TIDE HERALD 60-70%: opened by the bell (lure him onto flats, sea goes out = mired) and the sluice") + s2 (openings from the
// LEVEL'S VERB, one new move a phase, gold read + timer, anti-spam ward, >= 0.4x outside openings); brief-longwater3 item 5 (94% -> 60-70% with flasks, mash 0/6, 90-150 s).
//
// HE WALKS ON THE WATER. At high water he strides over the flats on the sea (THE WAVE is his); at low water he wades the mud, slow. The stones are dry at both ends.
// WHAT OPENS HIM (the only openings; gold ring + timer; then a told WARD at x0.4):
//   MIRED (x1.5, TH.mire s, at most TH.mireCap of him a mire): the sea goes out from under him while he stands OUT ON THE FLATS (not on a stone).
//     - THE BELL (P1): ring it at low water and the sea comes in early - and HE COMES OUT ON IT after you (LURED, told). A called sea is short (LW3.square.calledHigh)
//       and goes out fast; lured, he does not make for the stones: stay out on the flats and the ebb leaves him in the mud.
//     - THE SLUICE (P1): turn it while the water is up and he is out on the flats: the sea drops from under him NOW.
//     - On a NATURAL ebb he makes for the stones (told: HE MAKES FOR THE STONES) and usually reaches one - waiting is not an opening.
//   PHASE TWO (under TH.p2): THE SEA IS HIS. He calls it up and holds it (the flats stay under; the bell does nothing to a held sea; the sluice alone only DIPS it -
//     told: THE SEA IS HIS). RING THE BELL: it BREAKS HIS CALL - the sea turns, and he stands and CALLS IT BACK (! TH.recall s, rooted). TURN THE SLUICE inside that
//     call and the sea drops from under him: MIRED (x1.5). Both verbs, in order: the P2 fight is the exam's combination again.
//   REEL (x1.0, TH.thrust.reel s): his THRUST guarded (parried) - master's PARRIED.
// WHAT A BLOW DOES OTHERWISE: on the water TH.k.body (0.5; the boss rule's chip makes it 0.4), wading TH.k.mud (0.45), warded TH.k.ward (0.4). Never under 0.4.
// HIS MOVES (each its own windup + release pose: POSE below; one windup at a time; never the same move twice running):
//   THE GLAIVE SWEEP  (!! low, unblockable: JUMP)        THE THRUST (! guard it: PARRIED = reel)        SPEARS OF WATER (! three columns walk at you: guard or step)
//   THE WAVE          (!! high water only: a wave runs the flats - GET ON A STONE or jump its crest)
//   P2 NEW: THE UNDERTOW (! he drags the sea to his feet: everything in it is pulled to him, a stone or a guard halves it; his feet bite once)
export const TH = {
  hp: 1300, w: 18, h: 36, markH: 56,
  stride: 46, wade: 26, hurry: 58, lure: 52,
  p2: 0.5,
  sweep: { tell: 0.65, r: 70, dmg: 22, rec: 0.55 },
  thrust: { tell: 0.55, r: 112, dmg: 18, rec: 0.45, reel: 1.2 },
  spear: { tell: 0.7, n: 3, gap: 34, every: 0.3, dmg: 16, w: 12, h: 54 },
  wave: { tell: 1.0, speed: 230, dmg: 20, cd: 9 },
  undertow: { tell: 1.0, on: 2.2, pull: 80, pullHalf: 40, bite: 18, r: 180, cd: 8 },
  seize: 1.6, recall: 2.5,
  mire: 3.4, mireP2: 3.8, mireCap: 0.22, ward: 1.4,
  idle: [0.5, 0.9],
  k: { floor: 0.4, body: 0.5, mud: 0.45, reel: 1.0, mired: 1.5, ward: 0.4 },
  wetK: 0.5, dryK: 0.25, waterK: 0.3,
};
export const TH_SAY = {
  woke: 'THE TIDE HERALD: "THE SEA KEEPS ITS OWN HOURS."', rule: 'HE WALKS ON THE WATER: CALL THE SEA, THEN TAKE IT FROM UNDER HIM',
  lured: 'THE SEA CALLS HIM OUT', stones: 'HE MAKES FOR THE STONES', mired: 'IN THE MUD: CUT HIM', out: 'HE DRAGS HIMSELF OUT', stone: 'HE STANDS ON THE STONE',
  seize: 'THE SEA IS HIS NOW', his: 'THE SEA IS HIS: RING THE BELL FIRST', broke: 'THE BELL BREAKS HIS CALL', recall: 'HE CALLS THE SEA BACK', back: 'THE SEA COMES BACK TO HIM',
  ward: 'HE STANDS UP OUT OF IT', down: 'THE TIDE GOES OUT',
};
export const MOVE_NAME = { sweep: 'THE GLAIVE SWEEP', thrust: 'THE THRUST', spear: 'SPEARS OF WATER', wave: 'THE WAVE', undertow: 'THE UNDERTOW', recall: 'HE CALLS THE SEA', seize: 'THE SEA' };
export const MOVES = {
  sweep: { mark: '!!', answer: 'JUMP IT', tell: 'sweepTell', release: 'sweep' },
  thrust: { mark: '!', answer: 'GUARD IT', tell: 'thrustTell', release: 'thrust' },
  spear: { mark: '!', answer: 'GUARD OR STEP', tell: 'spearTell', release: 'spear' },
  wave: { mark: '!!', answer: 'GET ON A STONE', tell: 'raise', release: 'wave' },
  undertow: { mark: '!', answer: 'GET ON A STONE, GUARD', tell: 'maelTell', release: 'mael' },   /* (master's row: herald|maelTell is '!' - the bite is guarded, the drag is halved by a guard or a stone) */
  recall: { mark: '', answer: 'TURN THE SLUICE', tell: 'callTell', release: 'stride' },   /* (not a blow: master's row herald|callTell is unmarked; the call is told by its ring and words) */
};
/* B16: each move's windup pose and release pose (the art lane draws these; master's sheet has frames for sweepTell/sweep/thrustTell/thrust/raise/wave/mired/reel) */
export const POSE = { sweep: ['glaiveBack', 'glaiveLow'], thrust: ['glaiveCouch', 'glaiveLunge'], spear: ['glaiveDown', 'waterUp'], wave: ['glaiveHigh', 'glaiveCast'],
  undertow: ['armsWide', 'armsDrag'], recall: ['bellHand', 'seaUp'], seize: ['glaiveHigh', 'seaUp'], mired: ['sunk', 'heave'] };
/* marks.js rows: [mode, mark, answer, height] */
export const TH_TELLS = [['sweepTell', '!!', 'jump', 'low'], ['thrustTell', '!', 'block', 'mid'], ['spearTell', '!', 'block', 'low'], ['raise', '!!', 'jump', 'low'], ['maelTell', '!', 'block', 'low'], ['callTell', '', '', ''], ['seize', '', '', '']];
export const PHASE_NEW = { 1: ['sweep', 'thrust', 'spear', 'wave'], 2: ['undertow'] };
export const OPEN_MODES = new Set(['mired', 'reel']);
export const COMMITTED = new Set(['sweep', 'thrust', 'spear', 'wave', 'mael', 'rec']);
export const thOpen = e => !!e && OPEN_MODES.has(e.mode) && (e.open || 0) > 0;

/* G = { x0, x1 (his floor, px), floor (px), stones: [[x0, x1] px], bellX, sluiceX } */
export function newFight(G) {
  return { G, ph: 1, ward: 0, last: null, told: {}, lured: false, wet: false, sea: 'free', calling: false, pull: 0, pullX: 0, wave: null, spears: [], cd: { wave: 4, undertow: 3 },
    n: { mired: 0, bellMire: 0, sluiceMire: 0, natMire: 0, reel: 0, wave: 0, undertow: 0, broke: 0, recalls: 0, landed: 0, dips: 0, lures: 0 } };
}

/* WHAT A BLOW IS WORTH. Never under TH.k.floor */
export function takeAt(e, S, k) {
  if (S.ward > 0) return { k: TH.k.ward, word: 'WARDED' };
  if (thOpen(e)) return { k: e.mode === 'mired' ? TH.k.mired : TH.k.reel, word: null };
  if ((k ?? 1) > TH.waterK) return { k: TH.k.body, word: null };
  return { k: TH.k.mud, word: null };
}
export const takeK = (e, S, k) => Math.max(TH.k.floor, takeAt(e, S, k).k);

const setMode = (e, m, t) => { e.mode = m; e.modeT = t; };
const rnd = ([a, b]) => a + Math.random() * (b - a);
const nearest = (e, hs) => { let b = null, d = 1e9; for (const h of hs) if (h.alive) { const q = Math.abs(h.x - e.x); if (q < d) { d = q; b = h; } } return b; };
const clampX = (S, x) => Math.max(S.G.x0 + 14, Math.min(S.G.x1 - 14, x));
export const onStone = (S, x) => S.G.stones.some(([a, b]) => x >= a - 2 && x <= b + 2);
export function nearestStone(S, x) { let b = null, d = 1e9; for (const [a, z] of S.G.stones) { const m = (a + z) / 2, q = Math.abs(m - x); if (q < d) { d = q; b = m; } } return b; }
const free = e => e.mode === 'stride' || e.mode === 'rec';

/* THE BELL WAS STRUCK (the hands call it after the kit took the strike). T = the tide { k, ph } as it was struck */
export function bellStruck(e, S, c, T) {
  if (!e || !e.alive || e.mode === 'sleep' || e.mode === 'dead') return null;
  if (S.ph === 1) {
    if (T.ph === 'low' && T.k < 0.2) { c.tideCmd('called'); if (!S.lured) { S.lured = true; S.n.lures++; c.number(e.x, e.y - 70, TH_SAY.lured, '#7cc8c8'); } return 'lure'; }
    return null;   /* the sea is already coming or up: it is only a bell */
  }
  if (S.sea === 'his' && !thOpen(e) && e.mode !== 'seize') {   /* P2: THE BELL BREAKS HIS CALL */
    S.sea = 'broken'; S.n.broke++; c.tideCmd('break'); c.sound('broke'); c.number(e.x, e.y - 70, TH_SAY.broke, '#ffd36b');
    S.wave = null; S.pull = 0; setMode(e, 'callTell', TH.recall); c.number(e.x, e.y - 86, TH_SAY.recall, '#7cc8c8'); c.sound('tell'); return 'break';
  }
  return null;
}
/* THE SLUICE WAS STRUCK. T = the tide as it was struck. -> 'drop' | 'dip' | null */
export function sluiceStruck(e, S, c, T) {
  if (!e || !e.alive || e.mode === 'sleep' || e.mode === 'dead') return null;
  if (S.ph === 1) { if (T.k > TH.waterK) { c.tideCmd('drop'); if (onStone(S, e.x) && !S.told.stone) { S.told.stone = 1; c.number(e.x, e.y - 60, TH_SAY.stone, '#9ab0c0'); } return 'drop'; } return null; }
  if (S.sea === 'broken' && e.mode === 'callTell') { c.tideCmd('drop'); S.dropped = true; return 'drop'; }
  if (S.sea === 'his') { c.tideCmd('dip'); S.n.dips++; c.number(e.x, e.y - 60, TH_SAY.his, '#9ab0c0'); return 'dip'; }
  return null;
}

/* ONE FRAME OF HIM. hs = heroes [{ x, y, alive, ground, block }], c = the world (hands): tide() -> { k, ph }, tideCmd(cmd), number, sound, mark, hit(box, dmg, name, o),
   fx(kind, x, y), surfaceY() (px: the water line), floorY (px) */
export function stepHerald(e, S, dt, hs, c) {
  S.ward = Math.max(0, S.ward - dt);
  for (const k in S.cd) S.cd[k] = Math.max(0, S.cd[k] - dt);
  const T = c.tide(), h = nearest(e, hs);
  e.modeT -= dt; if (e.open > 0) e.open = Math.max(0, e.open - dt);
  stepWave(e, S, dt, c); stepSpears(e, S, dt, c);
  if (e.mode === 'sleep' || e.mode === 'dead') return;
  if (e.mode === 'wake') { if (e.modeT <= 0) { setMode(e, 'stride', 0.8); if (!S.told.rule) { S.told.rule = 1; c.number(e.x, e.y - 90, TH_SAY.rule, '#ffd36b'); } } return; }
  /* ON THE WATER: he has stood on the sea out on the flats this tide */
  const out = !onStone(S, e.x);
  if (T.k >= TH.wetK && out) S.wet = true;
  if (!out || (T.k < TH.dryK && !OPEN_MODES.has(e.mode))) { if (!out) S.wet = false; }
  /* THE SEA GOES OUT FROM UNDER HIM: mired */
  if (S.wet && out && T.k < TH.dryK && !OPEN_MODES.has(e.mode) && e.mode !== 'seize') { mire(e, S, c, T); return; }
  if (T.k < TH.dryK) { S.wet = false; if (T.ph === 'low') S.lured = false; }
  /* PHASE TWO at the next free moment under his line */
  if (S.ph === 1 && e.hp < e.maxHp * TH.p2 && free(e) && T.k < TH.dryK) { S.ph = 2; S.lured = false; setMode(e, 'seize', TH.seize); c.sound('seize'); c.number(e.x, e.y - 80, TH_SAY.seize, '#7cc8c8'); return; }
  if (S.ph === 1 && e.hp < e.maxHp * TH.p2 && free(e) && T.k >= TH.dryK && !S.lured && T.ph !== 'turn' && T.ph !== 'fall') { S.ph = 2; setMode(e, 'seize', TH.seize); c.sound('seize'); c.number(e.x, e.y - 80, TH_SAY.seize, '#7cc8c8'); return; }
  const d = h ? h.x - e.x : 0, ad = Math.abs(d), onWater = T.k > TH.waterK;
  const speed = onWater ? TH.stride : TH.wade;
  switch (e.mode) {
    case 'seize': if (e.modeT <= 0) { S.sea = 'his'; c.tideCmd('his'); setMode(e, 'stride', 0.6); } return;
    case 'mired': {
      if (e.mireHp0 !== undefined && e.mireHp0 - e.hp >= e.maxHp * TH.mireCap) e.modeT = 0;
      if (e.modeT <= 0) { e.open = 0; e.mireHp0 = undefined; S.ward = TH.ward; c.ringWard && c.ringWard(e); c.number(e.x, e.y - 60, TH_SAY.out, '#ff9a5c'); S.wet = false;
        if (S.ph === 2) { S.sea = 'his'; c.tideCmd('his'); c.number(e.x, e.y - 78, TH_SAY.back, '#7cc8c8'); }
        setMode(e, 'rec', 0.7); }
      return; }
    case 'reel': if (e.modeT <= 0) { e.open = 0; S.ward = TH.ward; c.ringWard && c.ringWard(e); setMode(e, 'rec', 0.4); } return;
    case 'callTell': if (e.modeT <= 0) { S.n.recalls++; S.sea = 'his'; S.dropped = false; c.tideCmd('his'); c.number(e.x, e.y - 70, TH_SAY.back, '#7cc8c8'); setMode(e, 'stride', 0.6); } return;
    case 'rec': if (e.modeT <= 0) setMode(e, 'stride', rnd(TH.idle)); return;
    case 'stride': {
      if (!h) return;
      /* A NATURAL EBB: he makes for the stones (told). LURED, he does not: he wants you */
      if (S.ph === 1 && !S.lured && (T.ph === 'turn' || (T.ph === 'fall' && !T.held)) && out) {   /* (a HELD fall is the sluice's: it comes too fast to read - that is the opening) */
        const sx = nearestStone(S, e.x); e.face = Math.sign(sx - e.x) || e.face; e.x = clampX(S, e.x + e.face * TH.hurry * dt);
        if (!S.told.stones) { S.told.stones = 1; c.number(e.x, e.y - 60, TH_SAY.stones, '#9ab0c0'); }
        return; }
      e.face = Math.sign(d) || e.face;
      if (ad > 46) e.x = clampX(S, e.x + e.face * (S.lured ? TH.lure : speed) * dt);
      if (e.modeT <= 0) pick(e, S, h, ad, T, c);
      return; }
    /* ---- THE GLAIVE SWEEP ---- */
    case 'sweepTell': if (e.modeT <= 0) { setMode(e, 'sweep', 0.3); c.sound('slash');
        c.hit([e.x + (e.face > 0 ? -6 : -TH.sweep.r), e.x + (e.face > 0 ? TH.sweep.r : 6), e.y - 14, e.y + 4], TH.sweep.dmg, 'THE GLAIVE SWEEP', { key: 'sw' + (S.n.sw = (S.n.sw || 0) + 1), low: true }); }
      return;
    case 'sweep': if (e.modeT <= 0) setMode(e, 'rec', TH.sweep.rec); return;
    /* ---- THE THRUST ---- */
    case 'thrustTell': if (e.modeT <= 0) { setMode(e, 'thrust', 0.25); c.sound('slash');
        const r = c.hit([e.x + (e.face > 0 ? 0 : -TH.thrust.r), e.x + (e.face > 0 ? TH.thrust.r : 0), e.y - 30, e.y - 6], TH.thrust.dmg, 'THE THRUST', { key: 'th' + (S.n.th = (S.n.th || 0) + 1), blockable: true });
        if (r === 'blocked') { setMode(e, 'reel', TH.thrust.reel); e.open = TH.thrust.reel; S.n.reel++; c.number(e.x, e.y - 60, 'PARRIED', '#8fd160'); c.sound('clank'); } }
      return;
    case 'thrust': if (e.modeT <= 0) setMode(e, 'rec', TH.thrust.rec); return;
    /* ---- SPEARS OF WATER ---- */
    case 'spearTell': if (h && e.modeT > 0.2) S.aim = h.x;
      if (e.modeT <= 0) { const dir = Math.sign((S.aim ?? e.x) - e.x) || e.face, x0 = (S.aim ?? e.x) - dir * TH.spear.gap;
        for (let i = 0; i < TH.spear.n; i++) S.spears.push({ x: x0 + i * dir * TH.spear.gap, t: -i * TH.spear.every, life: 0.55, id: (S.n.sp = (S.n.sp || 0) + 1) });
        setMode(e, 'spear', TH.spear.n * TH.spear.every + 0.2); c.sound('splash'); }
      return;
    case 'spear': if (e.modeT <= 0) setMode(e, 'rec', 0.4); return;
    /* ---- THE WAVE (high water only) ---- */
    case 'raise': if (e.modeT <= 0) { const dir = h ? Math.sign(h.x - e.x) || 1 : 1; S.wave = { x: dir > 0 ? S.G.x0 + 8 : S.G.x1 - 8, dir, id: ++S.n.wave }; S.cd.wave = TH.wave.cd; setMode(e, 'wave', 3.2); c.sound('wave'); } return;
    case 'wave': if (!S.wave || e.modeT <= 0) { S.wave = null; setMode(e, 'rec', 0.6); } return;
    /* ---- P2: THE UNDERTOW ---- */
    case 'maelTell': if (e.modeT <= 0) { setMode(e, 'mael', TH.undertow.on); S.n.undertow++; S.cd.undertow = TH.undertow.cd; c.sound('roar'); } return;
    case 'mael': S.pull = TH.undertow.pull; S.pullX = e.x;
      c.hit([e.x - 20, e.x + 20, e.y - 30, e.y + 4], TH.undertow.bite, 'THE UNDERTOW', { key: 'ut' + S.n.undertow, blockable: true });
      if (e.modeT <= 0) { S.pull = 0; setMode(e, 'rec', 0.6); } return;
  }
}
function mire(e, S, c, T) {
  S.wave = null; S.pull = 0; S.n.mired++;
  if (S.dropped || T.held) S.n.sluiceMire++; else if (S.lured) S.n.bellMire++; else S.n.natMire++;
  S.lured = false; S.wet = false; S.dropped = false;
  e.mireHp0 = e.hp; setMode(e, 'mired', S.ph === 2 ? TH.mireP2 : TH.mire); e.open = e.modeT;
  c.number(e.x, e.y - 60, TH_SAY.mired, '#8fd160'); c.sound('open'); c.fx && c.fx('mud', e.x, e.y);
}
function stepWave(e, S, dt, c) {
  const w = S.wave; if (!w) return;
  w.x += w.dir * TH.wave.speed * dt;
  const top = c.surfaceY() + 2;   /* the crest takes what stands IN the water; a stone's top and a jump's feet are over it */
  c.hit([w.x - 12, w.x + 12, top, S.G.floor + 4], TH.wave.dmg, 'THE WAVE', { key: 'wv' + w.id });
  if (w.x < S.G.x0 || w.x > S.G.x1) S.wave = null;
}
function stepSpears(e, S, dt, c) {
  for (const s of S.spears) { const was = s.t; s.t += dt;
    if (was < 0 && s.t >= 0) { c.sound('splash'); c.fx && c.fx('spout', s.x, S.G.floor); }
    if (s.t >= 0 && s.t < 0.3) c.hit([s.x - TH.spear.w, s.x + TH.spear.w, S.G.floor - TH.spear.h, S.G.floor + 4], TH.spear.dmg, 'SPEARS OF WATER', { key: 'sp' + s.id, blockable: true }); }
  S.spears = S.spears.filter(s => s.t < s.life);
}
/* WHAT HE DOES NEXT: by where you stand and the water, never the same move twice running */
export function pick(e, S, h, ad, T, c) {
  const high = T.k > 0.7, opts = [];
  if (ad <= TH.sweep.r + 6) opts.push('sweep', 'thrust');
  else if (ad <= TH.thrust.r) opts.push('thrust', 'spear');
  else opts.push('spear');
  if (high && S.cd.wave <= 0 && ad > 60) opts.push('wave', 'wave');
  if (S.ph === 2 && S.cd.undertow <= 0 && ad < TH.undertow.r && ad > 40) opts.push('undertow', 'undertow');
  let m = opts.filter(o => o !== S.last); if (!m.length) m = ['spear'];
  const mv = m[Math.floor(Math.random() * m.length)]; S.last = mv;
  const M = MOVES[mv]; setMode(e, M.tell, mv === 'sweep' ? TH.sweep.tell : mv === 'thrust' ? TH.thrust.tell : mv === 'spear' ? TH.spear.tell : mv === 'wave' ? TH.wave.tell : TH.undertow.tell);
  c.mark(M.mark); c.sound(M.mark === '!!' ? 'tellHard' : 'tell');
  return mv;
}
/* THE BOT'S READING (a lab hook later: tools/boss-rates.mjs longwater - owed). bell/sluice = their x; T = the tide */
export function thPlan(e, S, T, bellX, sluiceX) {
  if (!e) return { why: 'none' };
  if (thOpen(e)) return { why: 'open', go: 'in', attack: true };
  if (e.mode === 'raise' || S.wave) return { why: 'wave', go: 'stone', jump: !!S.wave };
  if (e.mode === 'sweepTell' && e.modeT < 0.25) return { why: 'sweep', jump: true };
  if ((e.mode === 'thrustTell' || e.mode === 'spearTell') && e.modeT < 0.3) return { why: 'guard', block: true };
  if (e.mode === 'maelTell' || e.mode === 'mael') return { why: 'undertow', go: 'stone', block: true };
  if (S.ph === 2 && e.mode === 'callTell') return { why: 'drop', go: 'sluice', to: sluiceX, strike: true };
  if (S.ph === 2 && S.sea === 'his') return { why: 'break', go: 'bell', to: bellX, strike: true };
  if (S.ph === 1 && T.k > TH.waterK && !onStone(S, e.x)) return { why: 'drop', go: 'sluice', to: sluiceX, strike: true };
  if (S.ph === 1 && T.ph === 'low') return { why: 'lure', go: 'bell', to: bellX, strike: true };
  return { why: 'flank', go: 'in', attack: true };
}
