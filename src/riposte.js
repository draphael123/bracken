// src/riposte.js - THE UNIVERSAL PARRY -> RIPOSTE, THE POISE BAR'S OPENINGS AND THE MIX-UP CHAIN (claude/riposte, Daniel 2026-10-11;
// scratch/brief-riposte.md, all recs).
//
// ONE PARRY FOR EIGHT HEROES. Every hero already had an answer on the beat - the knight's perfect guard, the warden's deflect, the berserker's
// brace, the paladin's aegis raised on the beat, the pyromancer's ember flare, the geomancer's rune-ward on the beat, the freebooter's parry,
// the death knight's ward let go as the blow lands. Those ARE each hero's parry LOOK (nothing new is bound: every hero has a guard key). What
// was missing was ONE timing and ONE payoff behind them. Each hero's branch in main.js damagePlayer0 now asks onBeat() whether its answer was
// on the beat and, if it was, calls parried(): the hero gets the RIPOSTE window (PARRY.window), the foe gets ONE reaction (react):
//   A COMMON FOE   staggers PARRY.foeHold s (it stands reeling, its turn given back - a gold ring and the RIPOSTE read, a sound), and the
//                  hero's next cut into it inside the window lands PARRY.mul (x2). Corpses and skins are untouched (a state, not a body).
//   AN ELITE       staggers shorter (PARRY.eliteHold) and the riposte still pays x2; PARRY.eliteBreakN ripostes BREAK HIS GUARD - his poise
//                  bar is emptied into the break he already had (main.js addPoise -> breakBeat -> src/elite-kit.js broke: THE opening).
//   A BOSS / MINI  a SHORT TOLD OPENING (PARRY.bossOpen s, a DUELIST PARRY.duelOpen): the shared B10 read (a gold ring and a timer bar), every
//                  hero blow in it x PARRY.bossMul, src/boss-greed.js counts it as an opening (no chip, no greed). When it ends: the B3 WARD -
//                  PARRY.ward s in which a parry turns his blow but opens nothing (told: a pale shell and WARDED). Never a lock, never a chain;
//                  his blades are never made immune (B13/B15: outside an opening he still takes his floor).
// A RED (!!) blow, and a piercing BOLT (a projectile, not a blade at arm's length), is never parried: TOO STRONG (tooStrong).
//
// THE POISE BAR (the same reaction code): the bar main.js addPoise already fills is SHOWN for elites (under the plate's health), bosses and
// minis (under the boss bar, drawHudPoise). Ripostes, heavies, plunges and the LEVEL'S VERB wear it: an opening his OPEN_RULE names that
// was not his break or a riposte (that is the verb: the bell, the water, the cage...) leans PARRY.poise.verb on it, the most of anything.
// BROKEN, a boss is open for his biggest told opening (the same gold read), then the same B3 ward (poiseCd already forbids a second break).
//
// THE MIX-UP CHAIN (Daniel 10-11 13:20): every LANDED hero blow whose verb differs from the last adds a pip (max MIX.max); each pip is
// MIX.per more damage AND the same factor on poise wear. Repeating a verb neither adds nor removes; taking a hit, or MIX.idle s without
// landing one, resets it. Per player (the fields live on the hero object, so co-op is per player). Gold pips by the HUD (drawPips) and a
// rising chime. The verbs are noteVerb's (VERB_OF below - one table).
//
// main.js hooks (each one line, commented "(claude/riposte)"): installRiposte (beside the boss read), the hero branches in damagePlayer0
// (parried / onBeat / tooStrong), the hit-reset in damagePlayer0, tick in updateEnemies (before BROKEN), payoff + chain in hurtEnemy0, the
// chain on addPoise, ripOpen in boss-greed openOf, the plate / HUD draws. tools/riposte.mjs is its check.

export const PARRY = {
  hold: null,         // a HELD guard's beat = main.js perfectWindow() (0.11 s, PERFECT GUARD 0.22): handed in by the api, never copied
  tap: 0.2,           // a TAPPED answer's beat (the freebooter's parryW, the first 0.2 s of the warden's deflect or the berserker's brace)
  window: 0.6,        // s the hero's riposte waits (was RIPOSTE.window, the knight's)
  mul: 2,             // the riposte cut into a parried common foe or elite
  foeHold: 0.6,       // s a common foe stands reeling, parried
  eliteHold: 0.35,    // s an elite does
  eliteBreakN: 2,     // ripostes that break an elite's guard
  bossOpen: 0.5,      // s a boss or mini stands open off a parry
  duelOpen: 0.9,      // s a DUELIST does (the parry is his core)
  bossMul: 1.5,       // a hero blow inside it
  ward: 3.0,          // s of the B3 ward after a riposte opening or a poise break ends
  poise: { riposte: 16, verb: 35 },
};
/* THE DUELISTS: knights and heroes-turned-boss, whose fight IS the parry (brief rule 3) */
export const DUELISTS = new Set(['closedhelm', 'paladinboss', 'fogknight', 'bloodknight', 'deathknight', 'pyromancer']);   /* the Crusader (closedhelm), the Paladin, the Fog Knight, and the heroes-turned-boss */
/* EACH HERO'S PARRY LOOK (the moves list reads this: scratch/brief-moves.md B) - the input, the word it says, its colour */
export const PARRY_LOOK = {
  knight:    { look: 'SHIELD',      input: 'raise C (hold) as the blow lands', col: '#fff6e0' },
  warden:    { look: 'SPEAR DEFLECT', input: 'tap C as the blow lands',        col: '#dff0d8' },
  berserker: { look: 'AXE BRACE',   input: 'tap C as the blow lands',          col: '#ff9a5c' },
  paladin:   { look: 'LIGHT-WARD',  input: 'raise the aegis (hold C) as the blow lands', col: '#fff6c8' },
  pyro:      { look: 'FLAME-CATCH', input: 'DOWN as the blow lands (the ember flare)', col: '#ff9a5c' },
  geomancer: { look: 'STONE-SKIN',  input: 'raise the rune-ward (hold C) as the blow lands', col: '#c8bca8' },
  pirate:    { look: 'CUTLASS BIND', input: 'tap C as the blow lands',        col: '#ffd34a' },
  reaper:    { look: 'BLADE BIND',  input: 'let go of the blood ward (C) as the blow lands', col: '#ffd0d0' },
};
/* THE MIX-UP CHAIN */
export const MIX = { max: 5, per: 0.06, idle: 3.0 };
/* A LANDED BLOW'S VERB (noteVerb's names), from the blow's TAG: the riposte first (a cut out of a parry is its own verb), then the hand's */
export const VERB_OF = { riposte: 'riposte', heavy: 'heavy', sweep: 'sweep', rise: 'rise', plunge: 'plunge', throw: 'throw', dash: 'dash', shot: 'shot', light: 'cut', reflect: 'reflect' };
const has = (b, v) => !!b && (b === v || (Array.isArray(b) && b.includes(v)));
export function verbOf(tag, skillNow) {
  if (!tag) return null;
  if (has(tag, 'riposte')) return 'riposte';
  if (skillNow) return 'skill';
  for (const k of ['heavy', 'plunge', 'sweep', 'rise', 'throw', 'dash', 'shot', 'reflect', 'light']) if (has(tag, k)) return VERB_OF[k];
  return null;
}

export function makeRiposte(api) {
  /* api: { time(), P(), boss(), isBoss(e), poiseMax(e), breakPoise(e), lean(e, n), openOf(e), tokenRelease(e), number(x,y,s,col), ring(x,y,r,col,l),
     sparks(x,y,d,n), sfx(name), hitstop(t), lessonHint(k), perfectWindow(), squash(sx,sy,t) } */
  const stats = { parries: 0, tooStrong: 0, foe: 0, elite: 0, eliteBreaks: 0, boss: 0, bossWarded: 0, ripostes: 0, bossOpenHits: 0, verbPoise: 0, pipsMax: 0, pips: 0, verbs: {} };
  const t = () => api.time();
  const bossLike = e => !!e && (api.isBoss(e) || e.xpRole === 'mini' || e.xpRole === 'boss' || !!e.mini);   /* (not maxHp: the Waymeet's sworn swords carry one and are common foes - the wood's lesson swordsman among them) */
  /* WAS THE ANSWER ON THE BEAT? kind 'hold' (a guard raised age s ago) or 'tap' (a tap pressed age s ago) */
  function onBeat(kind, age) { if (!(age >= 0)) return false; return kind === 'tap' ? age <= PARRY.tap + 1e-6 : age < api.perfectWindow(); }
  /* A RED BLOW (or a bolt through a guard) MET ON THE BEAT: it is not parried, and it SAYS so - once a beat */
  function tooStrong() { const P = api.P(); if (P.rpTooAt !== undefined && t() - P.rpTooAt < 0.6) return; P.rpTooAt = t(); stats.tooStrong++; api.number(P.x, P.y - 34, 'TOO STRONG', '#ff6b6b'); }
  /* THE PARRY LANDED. foe: the one whose blow it was (null for a projectile or a hazard: the hero still has his window, nothing reels).
     o.heavy: the knight's (his riposte cut is HEAVY too - his identity, kept on top) */
  function parried(foe, o = {}) {
    const P = api.P(); stats.parries++;
    P.riposteT = PARRY.window; P.ripSrc = 'parry'; P.riposteHeavy = !!o.heavy; P.rpPoseT = 0.24; P.rpLookAt = t();
    if (api.squash) api.squash(1.1, 0.92, 0.1);   /* THE CATCH: the placeholder pose (every hero) - art lane: a PARRY POSE per hero */
    api.lessonHint('parry');
    if (foe && foe.alive && !foe.harmless && foe.t !== 'dummy') react(foe);
    return foe;
  }
  /* ONE REACTION, every kind (no per-kind code): see the header */
  function react(e) {
    const now = t(), h = (e.h || 16), cy = e.y - h / 2;
    if (bossLike(e)) {
      if (e.broken > 0) return;   /* broken, he is open already */
      if (e.rpWardT > 0) { stats.bossWarded++; api.ring(e.x, cy, 20, '#d8e2ee', 0.2); api.number(e.x, e.y - h - 16, 'WARDED', '#d8e2ee'); return; }
      const dur = DUELISTS.has(e.t) ? PARRY.duelOpen : PARRY.bossOpen;
      e.rpOpenT = e.rpOpenMax = dur; e.stagger = Math.max(e.stagger || 0, Math.min(dur, 0.4)); e.flash = 0.2; stats.boss++;
      api.ring(e.x, cy, 30, '#ffd36b', 0.35); api.number(e.x, e.y - h - 18, 'RIPOSTE', '#ffd36b'); api.sfx('riposte'); return;
    }
    if (e.elite) {
      e.rpHold = PARRY.eliteHold; e.stagger = Math.max(e.stagger || 0, PARRY.eliteHold); e.rpOpenT = PARRY.window; e.flash = 0.2; e.vx = 0; stats.elite++;
      api.ring(e.x, cy, 24, '#ffd36b', 0.3); api.number(e.x, e.y - h - 18, 'RIPOSTE', '#ffd36b'); api.sfx('riposte'); retell(e); api.tokenRelease(e); return;
    }
    e.rpHold = PARRY.foeHold; e.stagger = Math.max(e.stagger || 0, PARRY.foeHold); e.rpOpenT = PARRY.window; e.rpAt = now; e.flash = 0.2; e.vx = 0; stats.foe++;
    api.ring(e.x, cy, 22, '#ffd36b', 0.3); api.number(e.x, e.y - h - 18, 'RIPOSTE', '#ffd36b'); api.sfx('riposte'); retell(e); api.tokenRelease(e);
  }
  /* a tell it was in the middle of is told again when it comes to (as a break's is, src/poise-break.js broke) */
  function retell(e) { if (typeof e.mode === 'string' && e.mode.endsWith('Tell') && typeof e.modeT === 'number') e.modeT = Math.max(e.modeT, 0.35); }
  /* EVERY FRAME, for every creature (main.js updateEnemies, before BROKEN). True: it stands reeling this frame (its own AI waits) */
  function tick(e, dt) {
    if (e.rpOpenT > 0) { e.rpOpenT -= dt; if (e.rpOpenT <= 0 && bossLike(e)) { e.rpOpenT = 0; e.rpWardT = PARRY.ward; e.rpWardMax = PARRY.ward; } }
    if (e.rpWardT > 0) e.rpWardT -= dt;
    if (bossLike(e)) {
      /* THE BREAK ENDS: his B3 ward (told), as a riposte opening's end */
      if (e.broken > 0) e.rpBrokeMax = Math.max(e.rpBrokeMax || 0, e.broken); else if (e.rpBrokeMax > 0) { e.rpBrokeMax = 0; e.rpWardT = Math.max(e.rpWardT || 0, PARRY.ward); e.rpWardMax = PARRY.ward; }
      /* THE LEVEL'S VERB: an opening his OPEN_RULE names that is not his break or a parry's - lean on the bar, the most of anything */
      const o = !(e.broken > 0) && !(e.rpOpenT > 0) && api.openOf(e) === true;
      if (o && !e.rpVerbWas && e.alive && api.poiseMax(e) > 0) { stats.verbPoise++; api.lean(e, PARRY.poise.verb); }
      e.rpVerbWas = o;
      return false;
    }
    if (e.rpHold > 0) { e.rpHold -= dt; if (e.alive && !(e.knock > 0) && !(e.carried > 0) && !(e.pinned > 0)) { e.vx = 0; return true; } }
    return false;
  }
  /* THE PAYOFF, in hurtEnemy0 (after every boss's own gate): a riposte cut into a parried common foe or elite x PARRY.mul (once); any hero blow
     into a boss's riposte opening x PARRY.bossMul, and into his poise break the break's own x1.5 (main.js) */
  function payoff(e, dmg, blow) {
    if (!(dmg > 0) || !e.alive) return dmg;
    if (bossLike(e)) { if (e.rpOpenT > 0 && blow) { stats.bossOpenHits++; return Math.round(dmg * PARRY.bossMul); } return dmg; }
    if (e.rpOpenT > 0 && has(blow, 'riposte')) { e.rpOpenT = 0; stats.ripostes++;
      if (e.elite && (e.ekRipN = (e.ekRipN || 0) + 1) >= PARRY.eliteBreakN && !(e.broken > 0)) { e.ekRipN = 0; stats.eliteBreaks++; api.breakPoise(e); }
      api.ring(e.x, e.y - (e.h || 16) / 2, 18, '#fff6c8', 0.25); api.hitstop(0.05); return Math.round(dmg * PARRY.mul); }
    return dmg;
  }
  const ripOpen = e => !!e && e.rpOpenT > 0 && bossLike(e);

  /* ---- THE MIX-UP CHAIN (per hero object) ---- */
  function chainOf(P) { if (P.mixN > 0 && t() - (P.mixAt ?? -99) > MIX.idle) { P.mixN = 0; P.mixLast = null; } return P.mixN || 0; }
  const chainMul = P => 1 + MIX.per * chainOf(P);
  function landed(P, verb) {
    if (!verb) return; chainOf(P);
    if (P.mixLast && verb !== P.mixLast && (P.mixN || 0) < MIX.max) { P.mixN = (P.mixN || 0) + 1; stats.pips++; stats.pipsMax = Math.max(stats.pipsMax, P.mixN); api.sfx('chime', P.mixN); }
    stats.verbs[verb] = (stats.verbs[verb] || 0) + 1;
    P.mixLast = verb; P.mixAt = t();
  }
  function hitReset(P) { P.mixN = 0; P.mixLast = null; }
  /* THE PIPS, by the HUD: x, y the first; gold, steady under reduce-motion, the newest one pulsing otherwise */
  function drawPips(g, P, x, y, still) {
    const n = chainOf(P); if (!n) return 0;
    for (let i = 0; i < MIX.max; i++) { const on = i < n, px = x + i * 5;
      g.fillStyle = 'rgba(10,8,20,0.7)'; g.fillRect(px - 1, y - 1, 5, 5);
      g.fillStyle = on ? (i === n - 1 && !still && Math.floor(t() * 8) % 2 ? '#fff6c8' : '#ffd36b') : '#4a4030'; g.fillRect(px, y, 3, 3); }
    return MIX.max * 5;
  }

  /* ---- THE SHARED B10 READ, for a riposte opening, a boss's poise break and the B3 ward after: a gold ring round him + a timer bar over him;
     the ward: a pale shell ring + a pale bar ---- */
  function drawRead(g, e, cx, cy) {
    if (!e || !e.alive || !bossLike(e)) return;
    const x = Math.round(e.x - cx), h = e.h || 20, top = Math.round(e.y - h - cy), mid = Math.round(e.y - h / 2 - cy), r = Math.max(14, Math.round(Math.max(e.w || 20, h) * 0.6));
    let k = 0, col = null;
    if (e.rpOpenT > 0) { k = e.rpOpenT / (e.rpOpenMax || PARRY.bossOpen); col = '#ffd36b'; }
    else if (e.broken > 0 && e.rpBrokeMax > 0) { k = e.broken / e.rpBrokeMax; col = '#ffd36b'; }
    else if (e.rpWardT > 0) { k = e.rpWardT / (e.rpWardMax || PARRY.ward); col = '#d8e2ee'; }
    if (!col) return;
    g.save(); g.globalAlpha = col === '#ffd36b' ? 0.85 : 0.45; g.strokeStyle = col; g.lineWidth = 1; g.beginPath(); g.arc(x, mid, r, 0, Math.PI * 2); g.stroke(); g.restore();
    const w = 26, bx = x - w / 2, by = top - 6; g.fillStyle = 'rgba(10,8,20,0.75)'; g.fillRect(bx - 1, by - 1, w + 2, 3); g.fillStyle = col; g.fillRect(bx, by, Math.round(w * Math.max(0, Math.min(1, k))), 1);
  }
  /* THE POISE BAR UNDER A HEALTH BAR (the boss HUD, an elite's plate): x, y, w; thin, gold; flashing white while he is broken */
  function drawPoiseBar(g, e, x, y, w, hgt = 1) {
    const m = api.poiseMax(e); if (!m || !e) return false;
    g.fillStyle = 'rgba(10,8,20,0.8)'; g.fillRect(x - 1, y - 1, w + 2, hgt + 2);
    if (e.broken > 0) { g.fillStyle = Math.floor(t() * 12) % 2 ? '#ffd36b' : '#fff6c8'; g.fillRect(x, y, w, hgt); }
    else { g.fillStyle = e.rpWardT > 0 ? '#9a927c' : '#e0b040'; g.fillRect(x, y, Math.round(w * Math.min(1, (e.poise || 0) / m)), hgt); }
    return true;
  }
  /* THE HERO'S RIPOSTE WINDOW, ON HIM (every hero now - was the knight's alone, main.js drawRiposteGlint): returns the colour or null */
  const glintCol = (P, heroId) => (P.riposteT > 0 && P.ripSrc === 'parry' && !P.dead ? (PARRY_LOOK[heroId] || PARRY_LOOK.knight).col : null);

  return { PARRY, MIX, stats, onBeat, tooStrong, parried, react, tick, payoff, ripOpen, chainOf, chainMul, landed, hitReset, drawPips, drawRead, drawPoiseBar, glintCol,
    resetStats: () => { for (const k in stats) stats[k] = k === 'verbs' ? {} : 0; } };
}
