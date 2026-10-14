// src/knock-into.js - KNOCK FOES INTO THE LEVEL (claude/knockinto, scratch/brief-combat2.md section 1, Daniel 10-11).
//
// A HEAVY cut, a RIPOSTE cut and the FINISHER-ON-BREAK (the combo's finishing cut into a foe whose poise is broken) throw the foe ALONG THE
// BLOW, weight-scaled: a small foe flies, a mid one (a shield, a soldier, a hound) goes half as far, a BRUTE goes a step - and a boss or a
// mini is never thrown, only staggered (main.js knockFoe refuses e.maxHp / e.mini as it always has). An ELITE goes shorter still; a foe
// holding a GUARD toward the blow (a mashed foe's raised guard, a cover kind's front, an elite's guard) SLIDES along the floor instead of
// flying - off a ledge it still goes over.
// Thrown INTO a level hazard, it takes that hazard: the spikes, a drop, deep water and the deadly pools KILL a common foe (as they always
// did - main.js hazardFoe), and now SAY so in the thrower's terms (INTO THE SPIKES / OFF THE EDGE / INTO THE WATER); a fire, a burning or
// foul pool takes a share of it and lights it; the press holds it under the slab (the slab does the rest, main.js 'PRESSED'). A ledge over
// a death drop is told the moment it goes over (OFF THE EDGE), before it lands. AN ELITE IS NEVER KILLED BY A THROW: he takes a share of
// his bar and is put back where he was thrown from (a section's exam is a fight, not a shove).
//
// ONE SHARED HELPER, NO PER-LEVEL CODE. hazardAt reads what every level already carries: its tiles (T.SPIKE), its floor of the world (a
// drop), L.pools (water, harm/fire/poison/deadly), its props (firepit, firevent, hotplate, brazier, crusher), the fires burning in it,
// and - for the SONNET data pass, per act - L.knockHazards: [{ kind, x0, x1, y0, y1 }] in px (a lava pit, a sun-scald, anything the
// tables above do not hold). The sun is NOT a hazard to a foe (rec, QUESTIONS): the desert's men live in it.
//
// main.js hooks (each commented `(claude/knockinto)`): the install beside knockFoe, the throw site in hurtEnemy0 (KI.throwFrom), the
// flight (KI.flight, in the THROWN block of updateEnemies) and hazardFoe's word (KI.word).

export const KNOCK = {
  small: 1, mid: 0.6, brute: 0.2,   // weight: the throw's speed scale (a small foe ~ 6-7 tiles off a heavy, a brute ~ a step)
  elite: 0.6,                       // x on top for an elite (shorter)
  slide: 0.65,                      // x for a guarded foe, and it keeps to the floor (kvy 0)
  ripPush: 230, breakPush: 260,     // the push floor of a riposte cut / a finisher-on-break (px/s before knockFoe's x1.15)
  live: 2.2,                        // s a throw stays ours (the read and the credit): a drop can take a while to reach the bottom
  eliteShare: 0.25,                 // an elite thrown into a killing hazard: this share of his full bar, and back where he was thrown from
};
/* the brutes (a step) and the mid weights (half). Anything else that is thrown at all is small. A big one (e.big) is a brute */
export const BRUTES = new Set(['brute', 'troll', 'heavy', 'merrowbrute', 'berserker', 'hedgeknight', 'golem', 'holdfast', 'tidemarauder', 'barrowrider', 'scorpion', 'armour', 'drownedknight', 'drownedcaptain', 'bellguard']);
export const MIDS = new Set(['lancer', 'shield', 'swornsword', 'pike', 'watch', 'tideguard', 'bosun', 'boarder', 'soldier', 'hound', 'cutthroat', 'cutlass', 'sailor', 'wight', 'bonecorsair', 'zombie', 'husk', 'miner', 'farmhand', 'assassin']);
export const weightOf = e => { let k = BRUTES.has(e.t) || e.big ? KNOCK.brute : MIDS.has(e.t) ? KNOCK.mid : KNOCK.small; if (e.elite) k *= KNOCK.elite; return k; };

/* WHY THIS BLOW THROWS (null: it does not). o: { riposte, broke, heavy, third, dash, quake } as main.js reads them off the hero */
export const throwWhy = o => o.riposte ? 'riposte' : o.broke ? 'broke' : o.heavy ? 'heavy' : o.third ? 'third' : o.dash ? 'dash' : o.quake ? 'quake' : null;

/* THE HAZARDS: what each does to a thrown COMMON foe, and its read. kill: it dies (hazardFoe's rule). share: that share of its full bar,
   burn: seconds alight, hold: held where it is (the press). elite: the share an elite takes instead (never a kill). old: the word the same
   death said before (a foe that walked or fell in, not thrown) - kept, so nothing that was not thrown reads differently. */
export const HAZ = {
  spikes: { word: 'INTO THE SPIKES', old: 'IMPALED', kill: true },
  drop:   { word: 'OFF THE EDGE', old: 'OVER THE EDGE', kill: true },
  water:  { word: 'INTO THE WATER', old: 'DROWNED', kill: true },
  lava:   { word: 'INTO THE LAVA', kill: true },
  fire:   { word: 'INTO THE FIRE', share: 0.45, burn: 2, elite: 0.15 },
  foul:   { word: 'INTO THE MIRE', share: 0.35, elite: 0.12 },
  poison: { word: 'INTO THE POISON', share: 0.45, elite: 0.15 },
  press:  { word: 'UNDER THE PRESS', hold: 1.4 },
  sand:   { word: 'INTO THE SAND', hold: 2.2 },   /* (claude/kifollow) quicksand (L.quicksand, auto-listed): it holds a thrown foe, it never kills it (as it never kills a hero) */
};
export const COL = '#8fd160';
export const WORDS = Object.values(HAZ).flatMap(h => [h.word, h.old]).filter(Boolean);

/* THE KILLING HAZARDS, exactly as main.js hazardFoe has always judged them (spikes at the feet or the body, the floor of the world, a deep
   pool that is not a swim and not shallow - a turtle or a crab is home in one). W: { TS, LH, tile(tx, ty), T, pools, amphib(e) } */
export function killAt(e, W) {
  const TS = W.TS, tx = Math.floor(e.x / TS);
  if (W.tile(tx, Math.floor((e.y + 1) / TS)) === W.T.SPIKE || W.tile(tx, Math.floor((e.y - 4) / TS)) === W.T.SPIKE) return { kind: 'spikes' };
  if (e.y > W.LH * TS + 8) return { kind: 'drop' };
  if (!W.amphib(e)) for (const p of (W.pools || [])) if (!p.shallow && !p.swim && !p.dry && e.x > p.x0 && e.x < p.x1 && e.y > p.y + 6 && (p.bottom === undefined || e.y <= p.bottom + 8))
    return { kind: p.lava ? 'lava' : 'water', pool: p };
  return null;
}
/* (claude/kifollow) A KILLING L.knockHazards ROW (lava): the data pass's rows whose hazard kills, for a thrown common foe (hazardFoe asks) */
export function killRowAt(e, W) {
  for (const h of (W.extra || [])) if (HAZ[h.kind] && HAZ[h.kind].kill && e.x >= h.x0 && e.x <= h.x1 && e.y >= h.y0 && e.y <= h.y1) return { kind: h.kind, row: h };
  return null;
}
/* THE REST, for a THROWN foe only (a foe that walks through its own camp's fire is not hurt by this - its AI keeps it out, or its level
   decides): fire (the fires burning, a lit firepit, a firevent's gout, a hot plate, a lit brazier), a harm pool you can swim in, the press
   coming down, and the level's own L.knockHazards rows */
export function thrownAt(e, W) {
  const x = e.x, y = e.y;
  for (const f of (W.fires || [])) if (!(f.delay > 0) && Math.abs(x - f.x) < 10 && Math.abs(y - f.y) < 14) return { kind: 'fire' };
  for (const p of (W.pools || [])) if (p.harm && !p.dry && p.swim && x > p.x0 && x < p.x1 && y > p.y + 4 && (p.bottom === undefined || y <= p.bottom + 8))
    return { kind: p.fire ? 'fire' : p.poison ? 'poison' : 'foul', pool: p };
  for (const pr of (W.props || [])) {
    const dx = Math.abs(x - pr.x);
    if (pr.t === 'firepit' && pr.lit && dx < 10 && Math.abs(y - pr.y) < 12) return { kind: 'fire', prop: pr };
    if (pr.t === 'firevent' && pr.on > 0 && dx < 8 && y <= pr.y + 2 && y > pr.y - 28) return { kind: 'fire', prop: pr };
    if (pr.t === 'hotplate' && pr.hot > 0 && dx < 16 && Math.abs(y - pr.y) < 5) return { kind: 'fire', prop: pr };
    if (pr.t === 'brazier' && pr.lit && !pr.tipped && dx < 7 && y > pr.y - 16 && y <= pr.y + 2) return { kind: 'fire', prop: pr };
    if (pr.t === 'crusher' && (pr.st === 'tell' || pr.st === 'drop') && dx < 18 && y > pr.y - 22 && y <= pr.y + 2) return { kind: 'press', prop: pr };
  }
  for (const h of (W.extra || [])) if (HAZ[h.kind] && x >= h.x0 && x <= h.x1 && y >= h.y0 && y <= h.y1) return { kind: h.kind, row: h };
  return null;
}
/* hazardAt: the one question - what is this foe in? (thrown: the full list; not thrown: the killing ones only, as before) */
export const hazardAt = (e, W, thrown) => killAt(e, W) || (thrown ? thrownAt(e, W) : null);

/* A LEDGE OVER A DEATH DROP: nothing under (x, y) all the way down to the floor of the world (a tile you stand on, a spike bed, a pool's
   surface all stop it). standable(tx, ty) is the level's own */
export function deathBelow(x, y, W) {
  const tx = Math.floor(x / W.TS);
  for (const h of (W.extra || [])) if (x >= h.x0 && x <= h.x1 && h.y1 > y && h.y0 >= y - 2) return false;   /* (claude/kifollow) a lava / sand row below speaks for itself (INTO THE LAVA), not OFF THE EDGE */
  for (let ty = Math.max(0, Math.floor(y / W.TS)); ty < W.LH; ty++) {
    const t = W.tile(tx, ty); if (t === W.T.SPIKE || W.standable(tx, ty)) return false;
    for (const p of (W.pools || [])) if (x > p.x0 && x < p.x1 && (ty + 1) * W.TS > p.y) return false;
  }
  return true;
}
/* WHOSE GUARD IS UP toward the blow: it slides, not flies. cover: the cover kinds (src/foe-react.js COVER); eliteGuard(e) is elite-kit's */
export const guardedOf = (e, fromX, cover, eliteGuard) => !(e.broken > 0) && (e.rxGuard > 0
  || ((cover.has(e.t) || (e.elite && eliteGuard && eliteGuard(e))) && Math.sign(fromX - e.x) === (e.ekSide || e.face || 1)));

/* api: { time(), knock(e, dir, push, { wt, slide, k, lift, tumble }), scale(e, slide) -> { k, lift, tumble } (claude/damagepct: the foe's %), hurt(e, dmg, x), fullHp(e), number(x, y, txt, col), smoke(x, y), sfx(name), world(), log } */
export function makeKnockInto(api) {
  const stats = { thrown: 0, slid: 0, into: {}, elitesBack: 0, edges: 0, byWhy: {}, said: [] };
  const say = (e, txt) => { api.number(e.x, e.y - (e.h || 16) - 10, txt, COL); stats.said.push(txt); if (stats.said.length > 24) stats.said.shift(); };
  /* THE THROW: the blow's push, the weight, the guard. Returns true when it flew (or slid) */
  function throwFoe(e, dir, push, why, o = {}) {
    let wt = weightOf(e); const slide = !!o.guarded;
    if (slide) wt *= KNOCK.slide;
    if (why === 'riposte') push = Math.max(push, KNOCK.ripPush); else if (why === 'broke') push = Math.max(push, KNOCK.breakPush);
    const was = { x: e.x, y: e.y };
    /* (claude/damagepct) THE DISTANCE IS THE FOE'S DAMAGE %, no longer a fixed small/mid/brute throw: sc.k scales the speed (0% a shove, ~72% the old throw, 200% twice it and more),
       sc.lift the arc, sc.tumble a launch that turns over in the air (src/damage-pct.js). The weight classes above still multiply it */
    const sc = api.scale ? api.scale(e, slide) : null;
    if (!api.knock(e, dir, push, { wt, slide, k: sc ? sc.k : 1, lift: sc ? sc.lift : 1, tumble: !!(sc && sc.tumble) })) return false;
    if (why === 'broke' && e.broken > 0) e.broken = 0;   /* the throw SPENDS the break once it flies: spent AFTER the knock asks, so a BROKEN UNSTOPPABLE elite (and the order's brute) can be thrown (claude/orderart) */
    e.kiT = api.time() + KNOCK.live; e.kiSlide = slide; e.kiWhy = why; e.kiFrom = was; e.kiBy = o.by || null; e.kiEdge = false; e.kiHz = null;
    stats.thrown++; if (slide) stats.slid++; stats.byWhy[why] = (stats.byWhy[why] || 0) + 1;
    return true;
  }
  const thrown = e => !!e && e.kiT > api.time();
  const fx = (kind, e) => { if (api.fx) api.fx(kind, e); };   /* (claude/kifollow) the entry burst for this hazard kind (src/ki-art.js entryFx) */
  /* EVERY FRAME OF THE FLIGHT (main.js, the THROWN block, before hazardFoe): the death-drop read, and the hazards only a throw finds.
     true: it was dealt with (dead, held, put back) - the caller stops there */
  function flight(e, grounded) {
    if (!thrown(e) || !e.alive) return false;
    const W = api.world();
    if (!e.kiEdge && !grounded && e.kiFrom && e.y > e.kiFrom.y + 2 && deathBelow(e.x, e.y, W)) { e.kiEdge = true; stats.edges++;
      say(e, HAZ.drop.word); api.sfx('whoosh'); }
    if (e.kiHz) return false;   /* one hazard a throw */
    const hz = thrownAt(e, W); if (!hz) return false;
    return apply(e, hz.kind, hz);
  }
  /* WHAT A NON-KILLING HAZARD DOES (and an elite's killing one) */
  function apply(e, kind, hz) {
    const H = HAZ[kind]; if (!H) return false; if (H.kill && !e.elite) return false;   /* (a common foe's killing hazard is hazardFoe's: it says the word and bursts there) */
    e.kiHz = kind; stats.into[kind] = (stats.into[kind] || 0) + 1;
    say(e, H.word); fx(kind, e);
    if (H.hold) { e.knock = 0; e.kvx = 0; e.vx = 0; e.stagger = Math.max(e.stagger || 0, H.hold); e.kiHeld = hz && hz.prop; api.sfx('thud'); return true; }
    const share = e.elite ? (H.kill ? KNOCK.eliteShare : H.elite || 0) : H.share || 0;
    const dmg = Math.max(1, Math.round(api.fullHp(e) * share));
    if (H.burn) e.burn = Math.max(e.burn || 0, H.burn);
    api.sfx(kind === 'fire' ? 'puff' : kind === 'spikes' ? 'clank' : 'splash');
    api.hurt(e, dmg, e.x + 1);
    if (e.elite && H.kill && e.alive) back(e);
    return !!(e.elite && H.kill);
  }
  /* AN ELITE IS PUT BACK where he was thrown from (his post), standing, a beat to come to */
  function back(e) {
    const f = e.kiFrom || e.home || { x: e.x, y: e.y }; api.smoke(e.x, e.y - 8);
    e.x = f.x; e.y = f.y; e.vx = 0; e.vy = 0; e.knock = 0; e.kvx = 0; e.kvy = 0; e.knockAir = 0; e.stagger = Math.max(e.stagger || 0, 0.6); e.kiT = 0;
    api.smoke(e.x, e.y - 8); stats.elitesBack++;
  }
  /* hazardFoe asks, for a killing hazard: the word to say (null: say nothing - the third cut or the edge read said it), and whether this
     is an elite the throw must not kill (then it has been dealt with: share + back) */
  function onKill(e, kind, thirdSaid) {
    if (!thrown(e)) return { word: HAZ[kind] && HAZ[kind].old };
    if (e.elite) { apply(e, kind); return { spared: true }; }
    stats.into[kind] = (stats.into[kind] || 0) + 1;
    fx(kind, e);
    if (thirdSaid || (kind === 'drop' && e.kiEdge)) return { word: null };
    stats.said.push(HAZ[kind].word); return { word: HAZ[kind].word };
  }
  return { throwFoe, thrown, flight, onKill, apply, stats, killRow: e => killRowAt(e, api.world()), reset() { for (const k of Object.keys(stats)) stats[k] = typeof stats[k] === 'number' ? 0 : Array.isArray(stats[k]) ? [] : {}; } };
}
