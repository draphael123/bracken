// src/survival.js - SURVIVAL (claude/survival, Daniel's decisions 2026-10-07 after scratch/audit-healing.md: OPTION A + the amended A10).
//
// THE NUMBERS AND THE RULES, in one place; main.js keeps the small local hooks (the drink, the shrine, the hazards, the HUD).
//
//   THE FLASK      the red tonic is no longer drunk for you. FLASK.base flasks a shrine interval, each +FLASK.heal of max health, drunk on a
//                  key (U / 1, LT on a pad, DRINK on a phone): a told, committed drink - rooted, no swing, no roll, no jump - of FLASK.drinkT s.
//                  The swallow lands at FLASK.swallowAt; a blow before it SPILLS the flask (it is spent at the lift, as in Salt & Sanctuary).
//                  (survival2, A10b) ONE to start; a shrine reached gives back ONE, a death and the start of a wood ALL; the smith's EXTRA FLASK
//                  (store id 'tonic') adds one, to FLASK.extraMax (max 3). BREAKING a shrine (SHRINE, hold interact) gives +1 over the max, no checkpoint.
//   DRY SHRINES    a shrine lights the checkpoint, banks what you carry, gives back one flask and the stamina: it no longer heals. A DEATH and a LEVEL-UP
//                  still heal in full. BACK TO THE SHRINE (R) carries your health and flasks with you (it was a free full heal).
//   HEARTS         +HEART_PCT of max health (was a flat +20). KILL HEALS: the charm, BLOOD DRAWN and BLOODLETTER halved, capped at KILL_HEAL.cap a kill.
//   HAZARDS        deep water in a wood that says L.waterHurts, and SPIKES, cost HAZARD.pct of max health - a percentage, past the difficulty,
//                  tier and armour chain - and hand you back to the last safe footing (P.safe). Bottomless pits already killed (unchanged).
//                  IN AN EXAM (L.examSpans, tile columns [x0, x1]) or a wood with L.fallRule === 'death', SPIKES ARE A REAL DEATH. Never untold:
//                  the exam says so as you walk in, and tools/survival.mjs fails a span that has no hurt spikes before it to teach them.

export const FLASK = { base: 1, extraMax: 2, heal: 0.35, richHeal: 0.45, drinkT: 0.45, swallowAt: 0.3 };   /* GAME seconds: at the default game speed (0.6) the drink is 0.75 s on the clock, the swallow at 0.5 s */
/* (claude/survival2, Daniel 10-07 A10b, after playing the pilot Marsh) ONE flask to start; the smith's EXTRA FLASK makes two more (PROG.flaskUp
   0..extraMax -> max 3). A SHRINE REACHED gives back ONE (once a shrine a life); a DEATH gives back ALL (to max); a BROKEN shrine gives +1 that may
   stand over the max until it is drunk (a death keeps a flask over the max that was not drunk: max(held, max)). */
export const flaskMax = prog => FLASK.base + Math.max(0, Math.min(FLASK.extraMax, (prog && prog.flaskUp) | 0));
/* a shrine reached: one flask back, never over the max, never taking a broken shrine's extra away */
export const shrineRefill = (held, max) => Math.max(held | 0, Math.min(max, (held | 0) + 1));
/* a death: all of them back, and a broken shrine's extra that was not drunk stays */
export const deathRefill = (held, max) => Math.max(held | 0, max);
export const flaskHeal = (maxHp, rich) => Math.max(1, Math.round(maxHp * (rich ? FLASK.richHeal : FLASK.heal)));

export const HEART_PCT = 0.12;
export const heartHeal = maxHp => Math.max(1, Math.round(maxHp * HEART_PCT));

/* the three kill heals, halved (5/2/4 -> 3/1/2) and capped: never more than 5 a kill */
export const KILL_HEAL = { charm: 3, bloodDrawn: 1, bloodletter: 2, cap: 5 };
export const killHeal = ({ charm = false, bloodDrawn = false, bloodletter = false } = {}) =>
  Math.min(KILL_HEAL.cap, (charm ? KILL_HEAL.charm : 0) + (bloodDrawn ? KILL_HEAL.bloodDrawn : 0) + (bloodletter ? KILL_HEAL.bloodletter : 0));

/* BREAK THE SHRINE (Shovel Knight; Daniel 10-07). A told, deliberate act: stand at a lit shrine and HOLD the interact key for SHRINE.breakHold game-s
   (1 s on the clock at the default game speed 0.6). The shrine cracks and goes dark for the rest of this run of the wood (a death does not mend it;
   leaving or restarting the wood does): no checkpoint there - a death wakes at the shrine lit before it, or the start - and +1 flask that may stand
   over the max. NEVER in a boss arena, never while a boss fight runs, and never THE PRE-BOSS SHRINE (the last one before the arena's near wall: the
   boss's retry point stays). A shrine is a picture, never a wall: breaking one blocks nothing. Bots never break one. */
export const SHRINE = { breakHold: 0.6 };
/* the pre-boss shrine: the nearest one outside the arena's near wall (shrines [{x, y}] in pixels; A.wallL/wallR in columns) */
export function preBossShrine(L, shrines, TS = 16) {
  const A = L && L.arena; if (!A) return null; let best = null;
  for (const s of shrines) { const c = s.x / TS; if (A.reverse ? c <= A.wallR : c >= A.wallL) continue; if (!best || (A.reverse ? s.x < best.x : s.x > best.x)) best = s; }
  return best;
}
/* may this shrine be broken now? -> null (yes) or the reason it may not */
export function breakBlock(L, s, shrines, { bossActive = false, TS = 16 } = {}) {
  if (!L || L.trial || L.shop) return 'no shrines to break here';
  if (!s || !s.lit || s.broken || s.noBreak) return 'not a lit shrine';
  if (bossActive) return 'not in a boss fight';
  const A = L.arena; if (A && s.x >= A.x0 && s.x <= A.x1) return 'not in a boss arena';
  if (s === preBossShrine(L, shrines, TS)) return 'the pre-boss shrine stays';
  return null;
}
/* where a death wakes once a shrine is broken: the last lit, unbroken shrine (litN order), else null (the wood's start) */
export const wakeShrine = shrines => shrines.filter(s => s.lit && !s.broken).sort((a, b) => (b.litN || 0) - (a.litN || 0))[0] || null;
/* STAMINA (Daniel 10-07 A10b): the bar refills STAM_REGEN_MUL faster everywhere from the start (src/commit.js STAM.regen 75 -> 105); every stamina
   upgrade still multiplies on top (staminaOf regenMul) */
export const STAM_REGEN_MUL = 1.4;

/* water and spikes: a share of the bar (25-30%, Daniel), whatever the wood, the difficulty or the armour */
export const HAZARD = { pct: 0.27 };
export const hazardHit = maxHp => Math.max(1, Math.round(maxHp * HAZARD.pct));

/* THE EXAM SPANS: [x0, x1] in tile columns, inclusive. x is in pixels (P.x) */
export const examAt = (L, x, TS = 16) => { for (const s of (L && L.examSpans) || []) if (x >= s[0] * TS && x < (s[1] + 1) * TS) return s; return null; };
/* what a spike bite is HERE: 'death' in an exam or a wood whose rule is death, else 'hurt' (a hurt + the safe return) */
export const spikeRule = (L, x, TS = 16) => (L && L.fallRule === 'death') || examAt(L, x, TS) ? 'death' : 'hurt';

/* NEVER AN UNTOLD DEATH (the lint): every exam span with spikes in it has hurt spikes earlier in the wood, outside every span - the rule was
   taught before it kills. -> [{ span, spikes, taughtBefore }] for the spans that fail (empty = told) */
export function untoldExams(L, SPIKE) {
  const spans = (L && L.examSpans) || [], bad = [];
  if (L && L.fallRule === 'death') return bad;   /* a whole wood on the death rule says so on its card (none yet) */
  const cols = new Set(); for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) if (L.grid[y * L.W + x] === SPIKE) cols.add(x);
  const inAny = x => spans.some(s => x >= s[0] && x <= s[1]);
  for (const s of spans) {
    const spikes = [...cols].filter(x => x >= s[0] && x <= s[1]).length; if (!spikes) continue;
    const taughtBefore = [...cols].filter(x => x < s[0] && !inAny(x)).length;
    if (!taughtBefore) bad.push({ span: s, spikes, taughtBefore });
  }
  return bad;
}

/* THE BOTS' DRINK (one small hook for every bot that plays like a person: the v2/human boss bot, the level walkers). A bot calls
   BK.drinkFlask() when this says so; it returns true when a drink began. */
export const BOT_DRINK_AT = 0.35;
export const botShouldDrink = (P, at = BOT_DRINK_AT) => !!P && !P.dead && P.hp > 0 && (P.flasks | 0) > 0 && !(P.drinkT > 0) && P.hp < P.maxHp * at;

/* THE TOLD LINES (main.js says them; tools/survival.mjs checks they exist) */
export const LINES = {
  shrine: 'A SHRINE SAVES AND GIVES BACK ONE FLASK. IT DOES NOT HEAL: DRINK ONE (KEY).',
  breakIt: 'HOLD (KEY): BREAK THE SHRINE: +1 FLASK, NO CHECKPOINT',
  broken: 'SHRINE BROKEN: +1 FLASK. NO CHECKPOINT HERE NOW.',
  drink: 'HURT? KEY DRINKS A FLASK: +35% HEALTH. STAND STILL: A BLOW SPILLS IT.',
  exam: 'THE EXAM: HERE THE SPIKES KILL.',
};
