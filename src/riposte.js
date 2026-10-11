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
  tap: 0.2,           // a TAPPED answer's beat (the freebooter's parryW, the first 0.2 s of the warden's deflect or of the berserker's TAKE IT)
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
  pose: 0.24,         // s the PARRY POSE (the catch) is held on the hero (P.rpPoseT)   (claude/riposteart)
  catchT: 0.09,       // s of it that is frame 0, the catch itself; the rest is the hold
  ripBeats: [0.05, 0.14],   // the swing clock (P.atk) at which the riposte strike's frame 1 (the cut) and frame 2 (the follow-through) begin
};
/* THE DUELISTS: knights and heroes-turned-boss, whose fight IS the parry (brief rule 3) */
export const DUELISTS = new Set(['closedhelm', 'paladinboss', 'fogknight', 'bloodknight', 'deathknight', 'pyromancer']);   /* the Crusader (closedhelm), the Paladin, the Fog Knight, and the heroes-turned-boss */
/* EACH HERO'S PARRY LOOK (the moves list reads this: scratch/brief-moves.md B) - the input, the word it says, its colour */
export const PARRY_LOOK = {
  knight:    { look: 'SHIELD',      input: 'raise C (hold) as the blow lands', col: '#fff6e0' },
  warden:    { look: 'SPEAR DEFLECT', input: 'tap C as the blow lands',        col: '#dff0d8' },
  berserker: { look: 'TAKE IT',     input: 'raise the crossed axes (hold C) as the blow lands; the riposte is the cross-chop', col: '#ff9a5c' },   /* (claude/berserker2) */
  paladin:   { look: 'LIGHT-WARD',  input: 'raise the aegis (hold C) as the blow lands', col: '#fff6c8' },
  pyro:      { look: 'FLAME-CATCH', input: 'hold DOWN as the blow winds up (the ember flare opens after 0.3 s)', col: '#ff9a5c' },
  geomancer: { look: 'STONE-SKIN',  input: 'raise the rune-ward (hold C) as the blow lands', col: '#c8bca8' },
  pirate:    { look: 'CUTLASS BIND', input: 'tap C as the blow lands',        col: '#ffd34a' },
  reaper:    { look: 'BLADE BIND',  input: 'let go of the blood ward (C) as the blow lands', col: '#ffd0d0' },
};
/* THE MIX-UP CHAIN */
export const MIX = { max: 5, per: 0.06, idle: 3.0, word: 3 };   /* word: the pip at which the chain says MIXED UP (the old parallel bonus, folded in: claude/riposteart) */
/* THE PARRY'S ART TABLE (claude/riposteart): where each hero's weapon hand and the point of his weapon are, in px off his feet (facing +x), what the glint is called, its tip colour,
   and the gold flash his body takes. The glint ring is PARRY_LOOK's colour. 'sound' names the layer SFX.parryTone plays under the hero's own parry sound. */
export const PARRY_ART = {
  knight:    { hand: [7, -10],  tip: [4, -22],  style: 'steel', glint: '#ffffff', flash: '#fff6e0', sound: 'knight' },
  warden:    { hand: [6, -10],  tip: [15, -19], style: 'shaft', glint: '#dff0d8', flash: '#dff0d8', sound: 'warden' },
  berserker: { hand: [7, -10],  tip: [14, -18], style: 'rage',  glint: '#ffb27a', flash: '#ffb27a', sound: 'berserker' },
  paladin:   { hand: [8, -10],  tip: [8, -22],  style: 'halo',  glint: '#fff6c8', flash: '#fff6c8', sound: 'paladin' },
  pyro:      { hand: [8, -12],  tip: [3, -26],  style: 'ember', glint: '#ffd36b', flash: '#ffb23e', sound: 'pyro' },
  geomancer: { hand: [8, -10],  tip: [8, -22],  style: 'stone', glint: '#ffe0a0', flash: '#e8c890', sound: 'geomancer' },
  pirate:    { hand: [7, -10],  tip: [13, -18], style: 'steel', glint: '#ffe58a', flash: '#ffd34a', sound: 'pirate' },
  reaper:    { hand: [9, -12],  tip: [9, -26],  style: 'blood', glint: '#dfffc0', flash: '#ffd0d0', sound: 'reaper' },
};
export const glintArt = heroId => PARRY_ART[heroId] || PARRY_ART.knight;
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
  const stats = { parries: 0, tooStrong: 0, foe: 0, elite: 0, eliteBreaks: 0, boss: 0, bossWarded: 0, ripostes: 0, bossOpenHits: 0, verbPoise: 0, pipsMax: 0, pips: 0, mixedUp: 0, verbs: {} };
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
    api.lessonHint('parry'); if (api.parryFx) api.parryFx();   /* (claude/riposteart) the gold flash, the hero's own sound layer, the body's tint */
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
      e.rpAt = now; e.rpHold = PARRY.eliteHold; e.stagger = Math.max(e.stagger || 0, PARRY.eliteHold); e.rpOpenT = PARRY.window; e.flash = 0.2; e.vx = 0; stats.elite++;
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
    if (e.rpOpenT > 0 && has(blow, 'riposte')) { e.rpOpenT = 0; e.rpPaidAt = t(); stats.ripostes++;
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
    if (P.mixLast && verb !== P.mixLast && (P.mixN || 0) < MIX.max) { P.mixN = (P.mixN || 0) + 1; stats.pips++; stats.pipsMax = Math.max(stats.pipsMax, P.mixN); api.sfx('chime', P.mixN);
      /* (claude/riposteart) MIXED UP, FOLDED INTO THE CHAIN: the old parallel bonus (three verbs in 4 s, the next blow x1.5 and a break) is gone; the third pip says the word */
      if (P.mixN === MIX.word) { stats.mixedUp++; api.number(P.x, P.y - 30, 'MIXED UP', '#8fd160'); api.ring(P.x, P.y - 10, 14, '#8fd160', 0.24); api.ring(P.x, P.y - 10, 8, '#dfffa0', 0.16); } }
    stats.verbs[verb] = (stats.verbs[verb] || 0) + 1;
    P.mixLast = verb; P.mixAt = t();
  }
  function hitReset(P) { P.mixN = 0; P.mixLast = null; }
  /* THE PIPS, by the HUD (claude/riposteart): a little GEM each - a dark-rimmed diamond, gold with a white glint when lit, a hollow dim one when not - five of them,
     the newest pulsing (steady under reduce-motion; from MIX.word pips on, the chain's own green MIXED UP edge on the lit ones). x, y the first one's top-left; step 6 px.
     Returns the width it used (0 when the chain is empty, so nothing is drawn at all). */
  const PIP = ['..#..', '.#o#.', '#ooo#', '.#o#.', '..#..'];
  function drawPips(g, P, x, y, still, step = 6) {
    const n = chainOf(P); if (!n) return 0;
    const pulse = !still && Math.floor(t() * 8) % 2;
    for (let i = 0; i < MIX.max; i++) {
      const px = x + i * step, on = i < n, hot = n >= MIX.word;
      for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) { const k = PIP[r][c]; if (k === '.') continue;
        g.fillStyle = k === '#' ? (on ? (hot ? '#3f6a22' : '#6a4a10') : 'rgba(10,8,20,0.85)') : on ? (i === n - 1 && pulse ? '#fff6c8' : '#ffd36b') : '#3a3226';
        g.fillRect(px + c, y + r, 1, 1); }
      if (on) { g.fillStyle = '#ffffff'; g.fillRect(px + 2, y + 1, 1, 1); }
    }
    return MIX.max * step - 1;
  }

  /* ---- THE SHARED B10 READ, for a riposte opening, a boss's poise break and the B3 ward after (claude/riposteart, was a ring and a bar):
     OPEN  a gold ring round him that is the CLOCK - a bright arc sweeping away round it as the opening runs out, a head dot on the arc, four stars turning on the ring,
           and over his head the crossed-blades mark with the timer bar under it; a DUELIST's (the parry is his core) has a second, wider ring
     BREAK the same, flashing white and gold
     WARD  a pale SHELL: six plates round him that go dark one by one as the ward runs down, turning slowly, and a shield mark over his head with its bar
     Reduce-motion: nothing turns, nothing flashes ---- */
  function drawRead(g, e, cx, cy) {
    if (!e || !e.alive || !bossLike(e)) return;
    const x = Math.round(e.x - cx), h = e.h || 20, top = Math.round(e.y - h - cy), mid = Math.round(e.y - h / 2 - cy), r = Math.max(14, Math.round(Math.max(e.w || 20, h) * 0.6));
    let k = 0, kind = null;
    if (e.rpOpenT > 0) { k = e.rpOpenT / (e.rpOpenMax || PARRY.bossOpen); kind = DUELISTS.has(e.t) ? 'duel' : 'open'; }
    else if (e.broken > 0 && e.rpBrokeMax > 0) { k = e.broken / e.rpBrokeMax; kind = 'break'; }
    else if (e.rpWardT > 0) { k = e.rpWardT / (e.rpWardMax || PARRY.ward); kind = 'ward'; }
    if (!kind) return;
    k = Math.max(0, Math.min(1, k)); const still = !!(api.still && api.still()), tt = still ? 0 : t(), gold = kind !== 'ward';
    const col = gold ? '#ffd36b' : '#d8e2ee', hi = gold ? '#fff6c8' : '#ffffff';
    g.save();
    if (gold) {
      g.lineWidth = 3; g.globalAlpha = 0.45; g.strokeStyle = 'rgba(10,8,20,0.9)'; g.beginPath(); g.arc(x, mid, r, 0, Math.PI * 2); g.stroke();   /* the groove the clock runs in */
      g.lineWidth = 2; g.globalAlpha = 0.95; g.strokeStyle = kind === 'break' && !still && Math.floor(t() * 12) % 2 ? hi : col;
      g.beginPath(); g.arc(x, mid, r, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); g.stroke();                                              /* the clock: what is left of it */
      if (k > 0.02) { const a = -Math.PI / 2 + k * Math.PI * 2; g.fillStyle = hi; g.fillRect(Math.round(x + Math.cos(a) * r) - 1, Math.round(mid + Math.sin(a) * r) - 1, 3, 3); }   /* its head */
      if (kind === 'duel') { g.lineWidth = 1; g.globalAlpha = 0.5; g.strokeStyle = col; g.beginPath(); g.arc(x, mid, r + 4, 0, Math.PI * 2); g.stroke(); }   /* the duelist's wider ring: the parry is HIS fight */
      g.globalAlpha = 1; g.fillStyle = hi;
      for (let i = 0; i < 4; i++) { const a = (still ? Math.PI / 4 : tt * 1.6) + i * Math.PI / 2, sx = Math.round(x + Math.cos(a) * r), sy = Math.round(mid + Math.sin(a) * r);
        g.fillRect(sx - 1, sy, 3, 1); g.fillRect(sx, sy - 1, 1, 3); }                                                                          /* four stars turning on the ring */
    } else {
      const lit = Math.ceil(k * 6), turn = still ? 0 : tt * 0.5; g.lineWidth = 2;
      for (let i = 0; i < 6; i++) { const a0 = turn + i * Math.PI / 3 + 0.12, on = i < lit;
        g.globalAlpha = on ? (i === lit - 1 && !still && Math.floor(t() * 6) % 2 ? 0.55 : 0.85) : 0.18; g.strokeStyle = on ? col : '#5a6270';
        g.beginPath(); g.arc(x, mid, r, a0, a0 + Math.PI / 3 - 0.24); g.stroke(); }                                                            /* six plates, going dark one by one */
      g.globalAlpha = 0.5; g.fillStyle = hi; for (let i = 0; i < lit; i++) { const a = turn + i * Math.PI / 3 + Math.PI / 6; g.fillRect(Math.round(x + Math.cos(a) * r), Math.round(mid + Math.sin(a) * r), 1, 1); }
    }
    g.restore();
    /* the mark over his head and the bar under it */
    const w = 26, bx = x - w / 2, by = top - 6, my = by - 8;
    g.fillStyle = 'rgba(10,8,20,0.75)';
    if (gold) { /* crossed blades */ g.fillRect(x - 5, my - 1, 11, 7);
      g.fillStyle = col; for (let i = 0; i < 4; i++) { g.fillRect(x - 4 + i, my + 4 - i, 1, 1); g.fillRect(x + 4 - i, my + 4 - i, 1, 1); } g.fillStyle = hi; g.fillRect(x, my + 1, 1, 1); g.fillRect(x - 4, my, 1, 1); g.fillRect(x + 4, my, 1, 1); }
    else { /* a shield */ g.fillRect(x - 4, my - 1, 9, 8);
      g.fillStyle = col; g.fillRect(x - 3, my, 7, 3); g.fillRect(x - 2, my + 3, 5, 1); g.fillRect(x - 1, my + 4, 3, 1); g.fillStyle = hi; g.fillRect(x - 2, my + 1, 1, 1); g.fillRect(x, my + 4, 1, 1); }
    g.fillStyle = 'rgba(10,8,20,0.75)'; g.fillRect(bx - 1, by - 1, w + 2, 3); g.fillStyle = col; g.fillRect(bx, by, Math.round(w * k), 1);
  }
  /* THE POISE BAR UNDER A HEALTH BAR (the boss HUD, an elite's plate): x, y, w; thin and gold (claude/riposteart polish): quarter notches in the fill, a bright head pixel on its end,
     brighter as it fills, and at 85% and over a pulsing READY - the cap pips lit at both ends. White and gold while he is broken, grey with a dotted edge in the ward. */
  function drawPoiseBar(g, e, x, y, w, hgt = 1) {
    const m = api.poiseMax(e); if (!m || !e) return false;
    const still = !!(api.still && api.still()), f = Math.max(0, Math.min(1, (e.poise || 0) / m)), n = Math.round(w * f), near = f >= 0.85 && !(e.broken > 0) && !(e.rpWardT > 0), blink = still || Math.floor(t() * 6) % 2;
    g.fillStyle = 'rgba(10,8,20,0.8)'; g.fillRect(x - 1, y - 1, w + 2, hgt + 2);
    if (e.broken > 0) { g.fillStyle = still || Math.floor(t() * 12) % 2 ? '#ffd36b' : '#fff6c8'; g.fillRect(x, y, w, hgt); }
    else {
      const ward = e.rpWardT > 0;
      g.fillStyle = ward ? '#9a927c' : f >= 0.75 ? '#ffd36b' : f >= 0.4 ? '#e0b040' : '#c08a28'; g.fillRect(x, y, n, hgt);
      if (!ward && near && blink) { g.fillStyle = '#fff6c8'; g.fillRect(x, y, n, hgt); }
      if (ward) { g.fillStyle = 'rgba(10,8,20,0.55)'; for (let i = 1; i < w; i += 3) g.fillRect(x + i, y, 1, hgt); }                          /* dotted: not filling */
      g.fillStyle = 'rgba(10,8,20,0.55)'; for (let q = 1; q < 4; q++) { const nx = x + Math.round(w * q / 4); if (nx < x + n) g.fillRect(nx, y, 1, hgt); }   /* the quarters */
      if (!ward && n > 2) { g.fillStyle = '#fff6c8'; g.fillRect(x + n - 1, y, 1, hgt); }                                                       /* its head */
    }
    if (near && blink) { g.fillStyle = '#ffd36b'; g.fillRect(x - 3, y - 1, 1, hgt + 2); g.fillRect(x + w + 2, y - 1, 1, hgt + 2); }          /* READY: the caps */
    return true;
  }
  /* A PARRIED COMMON FOE OR ELITE, over its head: the riposte WINDOW as a little gold bar closing, with a glint on it for the first beat (the foe's weapon knocked wide) */
  function drawParried(g, e, x, y) {
    if (!e || !e.alive || bossLike(e) || !(e.rpOpenT > 0)) return;
    const still = !!(api.still && api.still()), k = Math.max(0, Math.min(1, e.rpOpenT / PARRY.window)), w = 9, bx = x - 4;
    g.fillStyle = 'rgba(10,8,20,0.8)'; g.fillRect(bx - 1, y - 1, w + 2, 3); g.fillStyle = k < 0.25 && !still && Math.floor(t() * 10) % 2 ? '#fff6c8' : '#ffd36b'; g.fillRect(bx, y, Math.round(w * k), 1);
    const a = t() - (e.rpAt ?? t()); if (a < 0.16) { const f = e.face || 1, gx = x + f * Math.round(4 + a * 40), gy = y + 7 - Math.round(a * 20); g.fillStyle = '#ffffff'; g.fillRect(gx - 1, gy, 3, 1); g.fillRect(gx, gy - 1, 1, 3); g.fillStyle = '#ffd36b'; g.fillRect(gx + f * 2, gy - 2, 1, 1); g.fillRect(gx - f * 2, gy + 2, 1, 1); }
  }
  /* THE HERO'S RIPOSTE WINDOW, ON HIM (every hero now - was the knight's alone, main.js drawRiposteGlint): returns the colour or null */
  const glintCol = (P, heroId) => (P.riposteT > 0 && P.ripSrc === 'parry' && !P.dead ? (PARRY_LOOK[heroId] || PARRY_LOOK.knight).col : null);
  /* THE GLINT, PER WEAPON (claude/riposteart): a ring round the hand that closes with the window, a star running from the hand out along the weapon, and the weapon's own
     small business (embers off her staff, a halo on his maul, chips off her stave, red and green wisps off his blade...). (x, y) the HERO's feet on the screen, face -1/1. */
  function drawGlint(g, P, heroId, x, y, face, k) {
    const A = glintArt(heroId), look = PARRY_LOOK[heroId] || PARRY_LOOK.knight, still = !!(api.still && api.still()), tt = t();
    const hx = x + face * A.hand[0], hy = y + A.hand[1], tx = x + face * A.tip[0], ty = y + A.tip[1], run = still ? 0.5 : (1 - k);
    g.save(); g.globalCompositeOperation = 'lighter';
    g.globalAlpha = 0.35 + 0.5 * k; g.strokeStyle = look.col; g.lineWidth = 1; g.beginPath(); g.arc(hx, hy, 5 + 10 * k, 0, 7); g.stroke();
    const sx = Math.round(hx + (tx - hx) * ((run * 1.6) % 1)), sy = Math.round(hy + (ty - hy) * ((run * 1.6) % 1));
    g.globalAlpha = 0.9; g.fillStyle = '#ffffff'; g.fillRect(sx - 1, sy, 3, 1); g.fillRect(sx, sy - 1, 1, 3);
    g.fillStyle = A.glint; g.fillRect(tx, ty, 1, 1); g.fillRect(tx - 1, ty, 1, 1);
    const wob = still ? 0 : Math.sin(tt * 14);
    switch (A.style) {
      case 'ember': g.fillStyle = '#ffb23e'; for (let i = 0; i < 3; i++) g.fillRect(Math.round(tx + Math.sin(tt * 6 + i * 2) * 3), Math.round(ty - ((tt * 14 + i * 5) % 10)), 1, 1); break;
      case 'halo': g.globalAlpha = 0.4 * k + 0.2; g.strokeStyle = '#fff6c8'; g.beginPath(); g.ellipse(tx, ty + 1, 4, 2, 0, 0, 7); g.stroke(); break;
      case 'stone': g.fillStyle = '#e0b050'; g.fillRect(Math.round(hx + face * 2 + wob), Math.round(hy + 3), 1, 1); g.fillRect(Math.round(tx - face * 2), Math.round(ty + 3 + wob), 1, 1); break;
      case 'blood': g.fillStyle = '#ff6b6b'; g.fillRect(Math.round(tx + wob), ty + 2, 1, 1); g.fillStyle = '#8fd160'; g.fillRect(Math.round(hx - face * 2), hy - 2, 1, 1); break;
      case 'rage': g.fillStyle = '#ff9a5c'; g.fillRect(Math.round(tx + face * wob), ty - 1, 2, 1); g.fillRect(Math.round(hx - face), hy - 3, 1, 2); break;
      case 'shaft': g.globalAlpha = 0.5 * k + 0.2; g.strokeStyle = '#dff0d8'; g.beginPath(); g.moveTo(hx, hy); g.lineTo(tx, ty); g.stroke(); break;
      default: g.fillStyle = '#ffffff'; g.fillRect(Math.round(tx), Math.round(ty - 2 + wob), 1, 1);
    }
    g.restore();
  }
  /* WHICH PARRY FRAME: 0 the catch for the first beat, 1 the hold; WHICH RIPOSTE FRAME (off the swing clock): 0 the step-in, 1 the cut, 2 the follow-through */
  const parryFrame = P => (P.rpPoseT > 0 ? (PARRY.pose - P.rpPoseT < PARRY.catchT ? 0 : 1) : -1);
  const ripoFrame = P => (P.atk < PARRY.ripBeats[0] ? 0 : P.atk < PARRY.ripBeats[1] ? 1 : 2);

  /* A PARRIED COMMON FOE'S RECOIL, keyed (poseOf, in place of the poise-break's slump): the SNAP back off the blow (weapon thrown wide, the body reared), the REBOUND, the
     STAGGER held (head sunk, swaying), the COME-TO at the tail. A heavy body (an elite, anything 14 px or broader) rocks less and slides back more; a flyer is thrown back in the air. */
  function parriedPose(o, e, now) {
    const f = e.face || 1, hold = e.elite ? PARRY.eliteHold : PARRY.foeHold, el = Math.max(0, Math.min(hold, now - (e.rpAt ?? now))), left = Math.max(0, e.rpHold || 0);
    const heavy = e.elite || (e.w || 12) >= 14, fly = !!e.flying || !!e.fly, amp = heavy ? 0.6 : 1, tail = Math.min(1, left / 0.15), snap = Math.min(1, el / 0.07);
    let rot, dx = 0, sy = 1, sx = 1, dy = 0;
    if (el < 0.07) { rot = 0.34 * snap; dx = Math.round((heavy ? 5 : 4) * snap); sy = 1 + 0.07 * snap; sx = 1 - 0.05 * snap; }
    else if (el < 0.22) { const q = (el - 0.07) / 0.15; rot = 0.34 - 0.2 * q; dx = Math.round(heavy ? 5 : 4) - Math.round(q); sy = 1.07 - 0.1 * q; sx = 0.95 + 0.04 * q; }
    else { rot = 0.14 + Math.sin(now * 5 + (e.x || 0) * 0.13) * 0.035; dx = 3; sy = 0.97; sx = 1.01; }
    o.rot = (o.rot || 0) - f * rot * amp * tail; o.dx -= f * dx * tail; o.sy *= 1 + (sy - 1) * tail; o.sx *= 1 + (sx - 1) * tail;
    if (fly) o.dy -= Math.round(3 * Math.min(1, snap) * tail);
    void dy;
  }

  return { PARRY, MIX, stats, onBeat, tooStrong, parried, react, tick, payoff, ripOpen, chainOf, chainMul, landed, hitReset, drawPips, drawRead, drawPoiseBar, drawParried, drawGlint, parriedPose, parryFrame, ripoFrame, glintCol,
    resetStats: () => { for (const k in stats) stats[k] = k === 'verbs' ? {} : 0; } };
}
