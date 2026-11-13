// src/freebooter-boss.js - THE FREEBOOTER, THE PIRATE FLEET's boss (claude/water1, the OPUS GREYBOX, 2026-11-05). PURE: no DOM, no main.js - his phases, his told moves,
// what a blow does to him, the bot's reading. src/freebooter-hands.js binds it to the world (the decks, the swell, the heroes, the drawing).
// Sources: scratch/brief-piratefleet.md !! 10-12 07:40 (Daniel, all recs): "FREEBOOTER BOSS = TWO DECKS, HE BOARDS: ph1 on his flagship - pistol through any guard then
//   RELOAD = your opening, five-cut run, parry-riposte duelist (always hittable, guard by angle B11); ph2 he grapples a ship alongside and the fight spans two decks on the
//   swell; his boarding plunge onto you is told -> dodge to punish. 60-70% with flasks." + scratch/plan-water-1105.md section 2 (openings from the level's verb, own windup
//   and release, one new move per phase, gold read + timer on every opening, anti-spam ward after, >= 0.4x everywhere outside openings) + the scoundrel kit
//   (scratch/brief-freebooter-scoundrel.md: the cheap shot, the powder-flash dodge).
// A HERO-TURNED-BOSS: he fights with the Freebooter's own kit (the hero is playable today; beating him is half of his unlock when the HERO UNLOCK RULE ships - not here).
//
// WHAT A BLOW DOES TO HIM (B10/B11/B15 - never invulnerable, never under FB.k.floor = 0.4):
//   GUARD (between moves, facing you)  a blow from IN FRONT is PARRIED: it lands at 0.4x and he answers with a told RIPOSTE (!). From BEHIND or from ABOVE (a plunge,
//                                      a jump-cut over his guard) it lands at FB.k.flank (0.6x): guard by angle - get round him, or over him.
//   COMMITTED (a move's recovery)      FB.k.flank (0.6x) from anywhere.
//   OPEN (gold ring + timer)           RELOADING after the pistol (1.0x) - THE BOARDING PLUNGE missed: STUCK IN THE DECK (1.25x).
//   WARD (grey ring, after an opening) FB.k.ward (0.4x) for FB.wardT s: the anti-spam rule.
// HIS MOVES (each its own windup pose + release pose - GREYBOX poses in the hands, art owed; one windup at a time; picked by where you stand; never twice running):
//   PHASE ONE - HIS DECK:
//     THE PISTOL       (!! roll it / jump it - THROUGH ANY GUARD)  he levels it (the aim line drawn, tracking), it LOCKS, BANG. Then he must RELOAD: OPEN.
//     THE FIVE CUTS    (! a guard turns them)                      a run of five cutlass cuts stepping in; the recovery after is his (COMMITTED).
//     THE CHEAP SHOT   (! jump it)                                 a low boot at your shins (scoundrel kit) - it shoves you back across the deck.
//     THE POWDER FLASH (his dodge, told by the flash)              hit FB.flash.hits times inside FB.flash.win s outside an opening: a flash of powder and he is
//                                                                  FB.flash.dist px away (never i-frames: the blow that triggered it landed). Cooldown FB.flash.cd.
//   PHASE TWO (under FB.p2 of his health) - TWO DECKS ON THE SWELL: he whistles and fires his own grapple at HIS SLOOP; she comes alongside (the hands haul her: the
//     level's verb, his turn). The fight spans his deck and her deck, bobbing on the other swell. NEW MOVE:
//     THE BOARDING PLUNGE (!! off the red mark)  he springs to the yard; a red mark follows you along the deck and LOCKS; he plunges onto it. Missed: STUCK IN THE
//                                                DECK = OPEN (1.25x). He also BOARDS across the gap to whichever deck you are on (a hop, told by a whistle).
export const FB = {
  hp: 8400, w: 14, h: 30, markH: 44, walk: 62, keep: 46,   /* he likes cutlass range (keep px) */
  p2: 0.55,
  pistol: { tell: 0.95, lock: 0.3, dmg: 30, reload: 5.5, y: 18, range: 360 },   /* aim at chest height (y px over the feet): jump it, or roll it */
  cuts: { tell: 0.6, n: 5, gap: 0.17, reach: 30, step: 9, dmg: 9, rec: 0.75 },
  boot: { tell: 0.5, reach: 28, dmg: 13, shove: 200, rec: 0.5, h: 10 },          /* low: a hero 10 px off the deck is over it */
  riposte: { tell: 0.35, reach: 32, dmg: 20, rec: 0.45 },
  flash: { hits: 3, win: 1.6, dist: 84, cd: 5, smoke: 0.4 },
  plunge: { tell: 1.15, track: 0.7, air: 0.45, r: 26, dmg: 30, stuck: 3.4, rec: 0.6 },
  haul: { tell: 1.4 }, board: { tell: 0.7, air: 0.6 },
  wardT: 1.6, idle: [0.55, 0.95],
  k: { floor: 0.4, guard: 0.7, flank: 0.8, open: 1.0, stuck: 1.25, ward: 0.5 },
};
export const FB_SAY = { woke: 'THE FREEBOOTER: "COME ABOARD, THEN."', rule: 'HIS PISTOL GOES THROUGH ANY GUARD - THEN HE MUST RELOAD', reload: 'RELOADING: CUT HIM',
  parried: 'PARRIED: GET ROUND HIM, OR OVER HIM', stuck: 'STUCK IN THE DECK: CUT HIM', flash: 'POWDER FLASH', haul: 'HE HAULS HIS SLOOP ALONGSIDE', p2: 'TWO DECKS ON THE SWELL',
  board: 'HE BOARDS', ward: 'HIS GUARD IS BACK', down: 'THE FREEBOOTER STRIKES HIS COLOURS' };
export const MOVE_NAME = { pistol: 'THE PISTOL', cuts: 'THE FIVE CUTS', boot: 'THE CHEAP SHOT', riposte: 'THE RIPOSTE', plunge: 'THE BOARDING PLUNGE', haul: 'HIS GRAPPLE', board: 'HE BOARDS' };
/* the told mark of each move (B4: ! = a guard answers it, !! = it must be dodged) and the answer the hint lines name */
export const MOVES = {
  pistol: { mark: '!!', answer: 'ROLL IT OR JUMP IT', tell: 'pistolTell', release: 'pistolFire' },
  cuts: { mark: '!', answer: 'GUARD IT', tell: 'cutsTell', release: 'cuts' },
  boot: { mark: '!', answer: 'JUMP IT', tell: 'bootTell', release: 'boot' },
  riposte: { mark: '!', answer: 'GUARD IT', tell: 'riposteTell', release: 'riposte' },
  plunge: { mark: '!!', answer: 'OFF THE RED MARK', tell: 'plungeTell', release: 'plunge' },
};
export const PHASE_NEW = { 1: ['pistol', 'cuts', 'boot', 'riposte'], 2: ['plunge'] };
export const OPEN_MODES = new Set(['reload', 'stuck']);
export const COMMITTED = new Set(['cuts', 'cutsRec', 'boot', 'bootRec', 'riposte', 'riposteRec', 'plungeRec', 'pistolFire']);
export const fbOpen = e => !!e && OPEN_MODES.has(e.mode) && (e.open || 0) > 0;

export function newFight(G) { return { G, ph: 1, ward: 0, last: null, hits: [], flashCd: 0, mark: null, aim: null, cutN: 0, woke: false, told: {}, n: { pistol: 0, reload: 0, cuts: 0, boot: 0, riposte: 0, plunge: 0, stuck: 0, flash: 0, parried: 0, boards: 0, landed: 0 }, botWhy: '' }; }

/* WHAT A BLOW IS WORTH: e = him, S = the fight, from = { x, y } the striker's feet. Never under FB.k.floor */
export function takeAt(e, S, from) {
  if (S.ward > 0) return { k: FB.k.ward, word: 'WARDED' };
  if (fbOpen(e)) return { k: e.mode === 'stuck' ? FB.k.stuck : FB.k.open, word: null };
  if (COMMITTED.has(e.mode) || /Tell$/.test(e.mode)) return { k: FB.k.flank, word: null };
  const front = from && Math.sign(from.x - e.x) === (e.face || 1), above = from && from.y < e.y - 20;
  if (front && !above) return { k: FB.k.guard, word: 'PARRIED', parry: true };
  return { k: FB.k.flank, word: null };
}
/* a parried blow: he answers it (if he is free to) */
export function parried(e, S, c) { S.n.parried++; if (e.mode === 'guard' || e.mode === 'walk' || e.mode === 'idle') { setMode(e, 'riposteTell', FB.riposte.tell); c.mark('!'); c.sound('tell'); } if (!S.told.parried) { S.told.parried = 1; c.number(e.x, e.y - 70, FB_SAY.parried, '#ffd36b'); } }
/* every landed blow outside an opening counts toward his POWDER FLASH */
export function landed(e, S, t, c) { S.n.landed++; if (fbOpen(e) || S.ward > 0) return;
  S.hits = S.hits.filter(h => t - h < FB.flash.win); S.hits.push(t);
  if (S.hits.length >= FB.flash.hits && S.flashCd <= 0 && !COMMITTED.has(e.mode)) { S.hits = []; S.flashCd = FB.flash.cd; S.n.flash++; c.flash(e); c.sound('flash'); c.number(e.x, e.y - 60, FB_SAY.flash, '#ff9a5c');
    const dir = -Math.sign((c.nearest(e) || { x: e.x - 1 }).x - e.x) || 1; e.x = c.clampX(e.x + dir * FB.flash.dist); setMode(e, 'idle', 0.4); } }

const setMode = (e, m, t) => { e.mode = m; e.modeT = t; };
const nearest = (e, hs) => { let b = null, d = 1e9; for (const h of hs) if (h.alive) { const q = Math.abs(h.x - e.x) + Math.abs(h.y - e.y) * 0.5; if (q < d) { d = q; b = h; } } return b; };

/* ONE FRAME OF HIM. hs = heroes [{ x, y, ground, alive, dodge }], c = the world (hands): number, sound, mark, hit(box, dmg, name, o), floorAt(x), clampX(x),
   deckOf(x) (0 his deck, 1 her deck, -1 the gap), haul() (fire his grapple at the sloop), sloopIn() (she is alongside), flash(e), nearest(e) */
export function stepFreebooter(e, S, dt, hs, c) {
  S.ward = Math.max(0, S.ward - dt); S.flashCd = Math.max(0, S.flashCd - dt);
  const h = nearest(e, hs); c.nearest = () => h;
  if (e.mode === 'sleep') return;
  e.modeT -= dt; if (e.open > 0) e.open = Math.max(0, e.open - dt);
  const fy = c.floorAt(e.x); if (fy != null && e.mode !== 'plunge' && e.mode !== 'plungeAir' && e.mode !== 'boardAir') e.y = fy;
  if (h && !/Tell$/.test(e.mode) && !COMMITTED.has(e.mode) && !OPEN_MODES.has(e.mode) && !/Air$/.test(e.mode)) e.face = Math.sign(h.x - e.x) || e.face || 1;
  /* PHASE TWO comes at the next free moment under his line */
  if (S.ph === 1 && e.hp < e.maxHp * FB.p2 && (e.mode === 'guard' || e.mode === 'idle' || e.mode === 'walk')) { S.ph = 2; setMode(e, 'haulTell', FB.haul.tell); c.sound('whistle'); c.number(e.x, e.y - 80, FB_SAY.haul, '#ffd36b'); }
  switch (e.mode) {
    case 'wake': if (e.modeT <= 0) { setMode(e, 'guard', 0.8); if (!S.told.rule) { S.told.rule = 1; c.number(e.x, e.y - 90, FB_SAY.rule, '#ffd36b'); } } return;
    case 'haulTell': if (e.modeT <= 0) { c.haul(); c.sound('pistol'); setMode(e, 'haulWait', 2.6); } return;
    case 'haulWait': if (c.sloopIn() || e.modeT <= 0) { S.ward = 0; setMode(e, 'guard', 0.5); c.number(e.x, e.y - 80, FB_SAY.p2, '#ffd36b'); } return;
    case 'guard': case 'idle': case 'walk': {
      if (!h) return;
      const dx = h.x - e.x, ad = Math.abs(dx), myDeck = c.deckOf(e.x), hisDeck = c.deckOf(h.x);
      /* phase two: he boards whatever deck you are on */
      if (S.ph === 2 && c.sloopIn() && hisDeck >= 0 && myDeck >= 0 && hisDeck !== myDeck && e.modeT <= 0) { setMode(e, 'boardTell', FB.board.tell); c.sound('whistle'); S.boardTo = c.clampX(h.x - Math.sign(dx) * FB.keep, hisDeck); return; }
      if (e.modeT > 0) { if (ad > FB.keep + 8 && ad < 200) { e.x = c.clampX(e.x + Math.sign(dx) * FB.walk * dt, myDeck); e.mode = 'walk'; } return; }
      pick(e, S, h, ad, c); return; }
    case 'pistolTell': { if (h && e.modeT > FB.pistol.lock) S.aim = { x: h.x, y: h.y - FB.pistol.y, dir: e.face };   /* it tracks you, then LOCKS for its last FB.pistol.lock s */
      if (e.modeT <= 0) { setMode(e, 'pistolFire', 0.12); S.n.pistol++; c.sound('pistol'); const A = S.aim || { x: e.x + e.face * 100, y: e.y - FB.pistol.y, dir: e.face };
        /* the shot: a line from his hand through the locked point to the range - a hero on it at this instant is hit, THROUGH ANY GUARD (unblockable) */
        const x0 = e.x + e.face * 10, y0 = e.y - FB.pistol.y, dx = A.x - x0, dy = A.y - y0, n = Math.hypot(dx, dy) || 1;
        S.shot = { x0, y0, x1: x0 + dx / n * FB.pistol.range, y1: y0 + dy / n * FB.pistol.range, t: 0.25 };
        c.shot(S.shot, FB.pistol.dmg, 'THE PISTOL'); }
      return; }
    case 'pistolFire': if (e.modeT <= 0) { setMode(e, 'reload', FB.pistol.reload); e.open = FB.pistol.reload; S.n.reload++; S.aim = null; c.number(e.x, e.y - 70, FB_SAY.reload, '#ffd36b'); c.sound('open'); } return;
    case 'reload': if (e.modeT <= 0) { e.open = 0; S.ward = FB.wardT; c.ringWard(e); setMode(e, 'guard', 0.4); } return;
    case 'cutsTell': if (e.modeT <= 0) { setMode(e, 'cuts', FB.cuts.gap); S.cutN = 0; } return;
    case 'cuts': if (e.modeT <= 0) { S.cutN++; S.n.cuts++; c.sound('slash'); e.x = c.clampX(e.x + e.face * FB.cuts.step, c.deckOf(e.x));
        c.hit([e.x + (e.face > 0 ? 0 : -FB.cuts.reach), e.x + (e.face > 0 ? FB.cuts.reach : 0), e.y - 26, e.y], FB.cuts.dmg, 'THE FIVE CUTS', { blockable: true, key: 'cut' + S.n.cuts });
        if (S.cutN >= FB.cuts.n) setMode(e, 'cutsRec', FB.cuts.rec); else e.modeT = FB.cuts.gap; } return;
    case 'bootTell': if (e.modeT <= 0) { setMode(e, 'boot', 0.12); S.n.boot++; c.sound('slash');
        c.hit([e.x + (e.face > 0 ? 0 : -FB.boot.reach), e.x + (e.face > 0 ? FB.boot.reach : 0), e.y - FB.boot.h, e.y], FB.boot.dmg, 'THE CHEAP SHOT', { blockable: true, shove: e.face * FB.boot.shove, key: 'boot' + S.n.boot }); } return;
    case 'boot': if (e.modeT <= 0) setMode(e, 'bootRec', FB.boot.rec); return;
    case 'riposteTell': if (e.modeT <= 0) { setMode(e, 'riposte', 0.12); S.n.riposte++; c.sound('slash');
        c.hit([e.x + (e.face > 0 ? 0 : -FB.riposte.reach), e.x + (e.face > 0 ? FB.riposte.reach : 0), e.y - 28, e.y], FB.riposte.dmg, 'THE RIPOSTE', { blockable: true, key: 'rip' + S.n.riposte }); } return;
    case 'riposte': if (e.modeT <= 0) setMode(e, 'riposteRec', FB.riposte.rec); return;
    case 'cutsRec': case 'bootRec': case 'riposteRec': case 'plungeRec': if (e.modeT <= 0) setMode(e, 'guard', rnd(FB.idle)); return;
    case 'plungeTell': { if (h && e.modeT > FB.plunge.tell - FB.plunge.track) S.mark = { x: c.clampX(h.x, c.deckOf(h.x) < 0 ? c.deckOf(e.x) : c.deckOf(h.x)) };   /* the mark follows you, then LOCKS */
      e.y = (c.floorAt(e.x) || e.y) - 46 * Math.min(1, (FB.plunge.tell - e.modeT) / 0.3);   /* up to the yard */
      if (e.modeT <= 0) { setMode(e, 'plungeAir', FB.plunge.air); S.n.plunge++; S.from = { x: e.x, y: e.y }; c.sound('whoosh'); } return; }
    case 'plungeAir': { const k = 1 - Math.max(0, e.modeT) / FB.plunge.air, M = S.mark || { x: e.x }, fy2 = c.floorAt(M.x) ?? S.from.y + 46;
      e.x = S.from.x + (M.x - S.from.x) * k; e.y = S.from.y + (fy2 - S.from.y) * k * k;
      if (e.modeT <= 0) { e.x = M.x; e.y = fy2; c.sound('thud'); c.fx('land', e.x, e.y);
        const any = c.hit([e.x - FB.plunge.r, e.x + FB.plunge.r, e.y - 30, e.y + 2], FB.plunge.dmg, 'THE BOARDING PLUNGE', { key: 'pl' + S.n.plunge });
        S.mark = null;
        if (any) setMode(e, 'plungeRec', FB.plunge.rec); else { setMode(e, 'stuck', FB.plunge.stuck); e.open = FB.plunge.stuck; S.n.stuck++; c.number(e.x, e.y - 70, FB_SAY.stuck, '#ffd36b'); c.sound('open'); } } return; }
    case 'stuck': if (e.modeT <= 0) { e.open = 0; S.ward = FB.wardT; c.ringWard(e); setMode(e, 'guard', 0.4); } return;
    case 'boardTell': if (e.modeT <= 0) { setMode(e, 'boardAir', FB.board.air); S.from = { x: e.x, y: e.y }; S.n.boards++; c.number(e.x, e.y - 70, FB_SAY.board, '#ff9a7a'); } return;
    case 'boardAir': { const k = 1 - Math.max(0, e.modeT) / FB.board.air, to = S.boardTo ?? e.x, fy2 = c.floorAt(to) ?? S.from.y;
      e.x = S.from.x + (to - S.from.x) * k; e.y = S.from.y + (fy2 - S.from.y) * k - Math.sin(k * Math.PI) * 40;
      if (e.modeT <= 0) { e.x = to; e.y = fy2; c.fx('land', e.x, e.y); setMode(e, 'guard', 0.5); } return; }
  }
}
const rnd = ([a, b]) => a + Math.random() * (b - a);
/* WHAT HE DOES NEXT: by where you stand, never the same move twice running */
export function pick(e, S, h, ad, c) {
  const opts = [];
  if (ad > 90 && ad < FB.pistol.range) opts.push('pistol', 'pistol');
  if (ad <= 64) opts.push('cuts', 'cuts', 'boot');
  if (ad > 64 && ad <= 90) opts.push('cuts', 'pistol');
  if (S.ph === 2) { opts.push('plunge'); if (ad > 60) opts.push('plunge'); }
  let m = opts.filter(o => o !== S.last); if (!m.length) m = ['cuts'];
  const mv = m[Math.floor(Math.random() * m.length)]; S.last = mv;
  if (mv === 'pistol') { setMode(e, 'pistolTell', FB.pistol.tell); c.mark('!!'); c.sound('tellHard'); }
  else if (mv === 'cuts') { setMode(e, 'cutsTell', FB.cuts.tell); c.mark('!'); c.sound('tell'); }
  else if (mv === 'boot') { setMode(e, 'bootTell', FB.boot.tell); c.mark('!'); c.sound('tell'); }
  else if (mv === 'plunge') { setMode(e, 'plungeTell', FB.plunge.tell); c.mark('!!'); c.sound('tellHard'); }
  return mv;
}
/* THE BOT'S READING (for a lab hook later: tools/boss-rates.mjs piratefleet - owed): what the human answer to his current move is */
export function fbPlan(e, S) {
  if (!e) return { why: 'none' };
  if (fbOpen(e)) return { why: 'open', go: 'in', attack: true };
  if (e.mode === 'pistolTell' && e.modeT < 0.25) return { why: 'pistol', jump: true };
  if (e.mode === 'plungeTell' && e.modeT < 0.35) return { why: 'plunge', dodge: true, away: S.mark ? S.mark.x : e.x };
  if (e.mode === 'cutsTell' || e.mode === 'riposteTell') return { why: 'guard', block: true };
  if (e.mode === 'bootTell') return { why: 'boot', jump: true };
  if (e.mode === 'guard') return { why: 'flank', go: 'behind' };
  return { why: 'wait' };
}

/* THE LAB BOT (claude/tune3): what a player does against him, read a reaction late (some misread). Pure: s = { P, e, S (the hands' read: ph, ward, n, mark, G), reach, shield, hero,
   tip, noRoll, v2, rest, t, rng, mem }. Returns { gx, face, atk, jump, dodge, block, why }. The fight in a line: bait the PISTOL from ~130 px (jump it as it locks), then run in
   and cut him through the RELOAD; guard the cuts and the riposte, jump the boot, cut him in every recovery (never poke the guard: a PARRIED blow answers with the riposte);
   off the red mark of the boarding plunge, and cut him stuck in the deck. */
export const FB_PLAN = { react: 0.25, miss: 0.1, bait: 130 };
export function fbLabPlan(s) {
  const { P, e, S, reach } = s, G = S.G, out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = s.v2 ? 0 : FB_PLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const myDeck = P.x >= G.deck[0] && P.x < G.deck[1] ? G.deck : (S.sloopIn && P.x >= G.sloop[0] && P.x < G.sloop[1] ? G.sloop : G.deck);
  const lo = myDeck[0] + 14, hi = myDeck[1] - 14, clamp = x => Math.max(lo, Math.min(hi, x));
  const kx = e.x, side = Math.sign(P.x - kx) || 1, dx = Math.abs(kx - P.x), hitR = reach + 14 / 2 - 2;
  const face = Math.sign(kx - P.x) || 1;
  /* (claude/wardenbot) THE WARDEN STANDS AT HER POINT, NOT ON HIS CUTLASS: her tip pays from 28 px EDGE TO EDGE (src/main.js tipPay, src/warden-id.js tipStart: x1.6-2.0, x2.0 in his opening), the mid-shaft is x0.7 and the haft x0.3. The old fixed 30 px from his CENTRE was 23 px edge to edge (he is 14 wide): every blow of hers paid the mid-shaft. s.tip is the lab's WARDEN_TIP (32): her near edge sits tip + 2 px out, a tip with a stride of drift to spare. */
  const standX = s.tip ? s.tip + 2 + (e.w || FB.w) / 2 : 14;
  const roomDir = ax => { const away = P.x <= ax ? -1 : 1, room = d => (d < 0 ? P.x - lo : hi - P.x); return room(away) >= 50 ? away : -away; };
  const swing = () => { out.face = face; out.atk = P.atk < 0; };
  const m = e.mode, ti = (S.n.pistol | 0) + (S.n.cuts | 0) + (S.n.boot | 0) + (S.n.riposte | 0) + (S.n.plunge | 0) + (S.n.boards | 0);
  if (m === 'sleep' || m === 'wake') { out.gx = clamp(kx + side * 110); out.face = face; out.why = 'to him'; return out; }
  const open = fbOpen(e);
  /* 1. THE PLUNGE: off the red mark (it follows you, then locks) */
  if ((m === 'plungeTell' || m === 'plungeAir') && S.mark && seenFor('pl' + ti + m)) {
    const lock = m === 'plungeAir' || e.modeT <= FB.plunge.tell - FB.plunge.track, mx = S.mark.x;
    if (!lock) { mem.plDir = mem.plDir || roomDir(kx); if (P.x + mem.plDir * 40 < lo + 6 || P.x + mem.plDir * 40 > hi - 6) mem.plDir = -mem.plDir; out.gx = clamp(P.x + mem.plDir * 44); out.why = 'keep moving: his mark'; return out; }
    mem.plDir = 0;
    if (Math.abs(P.x - mx) < FB.plunge.r + 20) { const d = roomDir(mx); out.gx = clamp(mx + d * (FB.plunge.r + 40)); out.why = 'off the red mark'; return out; }
    out.gx = P.x; out.face = face; out.why = 'clear of the mark'; return out;
  }
  /* 2. HIS BLOWS, a quarter-second late */
  if (/Tell$/.test(m) || m === 'cuts' || m === 'riposte') {
    const key = m.replace(/Tell$/, '') + ti, miss = s.v2 ? false : roll('m' + key, FB_PLAN.miss), seen = seenFor('a' + key);
    if (m === 'cutsTell' || m === 'riposteTell') { if (mem.gk !== key) { mem.gk = key; mem.gOK = false; } if (seen && !miss) mem.gOK = true; }
    if ((m === 'cutsTell' || m === 'cuts' || m === 'riposteTell' || m === 'riposte') && mem.gOK && dx < 95) { out.block = true; out.face = face; out.gx = P.x; out.why = 'guard the ' + m.replace(/Tell$/, ''); return out; }
    if (m === 'pistolTell' && seen && !miss && P.ground && e.modeT < 0.2 && e.modeT > 0.0) { out.jump = true; out.gx = P.x; out.why = 'jump the pistol'; return out; }
    if (m === 'bootTell' && seen && !miss && P.ground && dx < 70 && e.modeT < 0.3) { out.jump = true; out.gx = P.x; out.why = 'jump the boot'; return out; }
  }
  if (m === 'pistolTell' || m === 'pistolFire') { out.gx = P.x; out.face = face; out.why = 'wait for the bang'; return out; }
  /* 3. OPEN (reloading, stuck in the deck): cut him */
  if (open) { out.gx = clamp(kx + side * standX); out.face = face; if (dx < hitR + 4) swing(); out.why = 'cut him: open'; return out; }
  /* 4. HIS GUARD IS BACK: off him */
  if (S.ward > 0 && !s.rest) { out.gx = clamp(kx + side * 90); out.face = face; out.why = 'his ward: wait'; return out; }
  /* 5. HIS RECOVERIES: committed, a blow from anywhere is 0.6x - in and cut */
  if (m === 'cutsRec' || m === 'bootRec' || m === 'riposteRec' || m === 'plungeRec' || m === 'boot') { out.gx = clamp(kx + side * standX); out.face = face; if (dx < hitR + 4 && (P.atk >= 0 || e.modeT > (s.tip ? 0.3 : 0.18))) swing(); out.why = 'cut him: recovering'; return out; }
  /* 6. BAIT HIS PISTOL from a step out; never poke the guard */
  const stand = s.rest ? FB_PLAN.bait + 30 : FB_PLAN.bait;
  out.gx = clamp(kx + side * stand); out.face = face; out.why = 'bait the pistol'; return out;
}
