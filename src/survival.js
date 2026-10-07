// src/survival.js - SURVIVAL (claude/survival, Daniel's decisions 2026-10-07 after scratch/audit-healing.md: OPTION A + the amended A10).
//
// THE NUMBERS AND THE RULES, in one place; main.js keeps the small local hooks (the drink, the shrine, the hazards, the HUD).
//
//   THE FLASK      the red tonic is no longer drunk for you. FLASK.base flasks a shrine interval, each +FLASK.heal of max health, drunk on a
//                  key (U / 1, LT on a pad, DRINK on a phone): a told, committed drink - rooted, no swing, no roll, no jump - of FLASK.drinkT s.
//                  The swallow lands at FLASK.swallowAt; a blow before it SPILLS the flask (it is spent at the lift, as in Salt & Sanctuary).
//                  A lit shrine, a death and the start of a wood fill them; the smith's EXTRA FLASK (store id 'tonic') adds one, to FLASK.extraMax.
//   DRY SHRINES    a shrine lights the checkpoint, banks what you carry, refills flasks and stamina: it no longer heals. A DEATH and a LEVEL-UP
//                  still heal in full. BACK TO THE SHRINE (R) carries your health and flasks with you (it was a free full heal).
//   HEARTS         +HEART_PCT of max health (was a flat +20). KILL HEALS: the charm, BLOOD DRAWN and BLOODLETTER halved, capped at KILL_HEAL.cap a kill.
//   HAZARDS        deep water in a wood that says L.waterHurts, and SPIKES, cost HAZARD.pct of max health - a percentage, past the difficulty,
//                  tier and armour chain - and hand you back to the last safe footing (P.safe). Bottomless pits already killed (unchanged).
//                  IN AN EXAM (L.examSpans, tile columns [x0, x1]) or a wood with L.fallRule === 'death', SPIKES ARE A REAL DEATH. Never untold:
//                  the exam says so as you walk in, and tools/survival.mjs fails a span that has no hurt spikes before it to teach them.

export const FLASK = { base: 3, extraMax: 2, heal: 0.35, richHeal: 0.45, drinkT: 0.7, swallowAt: 0.45 };
/* the flasks a shrine fills: three, and the smith's extra ones (PROG.flaskUp, 0..extraMax) */
export const flaskMax = prog => FLASK.base + Math.max(0, Math.min(FLASK.extraMax, (prog && prog.flaskUp) | 0));
export const flaskHeal = (maxHp, rich) => Math.max(1, Math.round(maxHp * (rich ? FLASK.richHeal : FLASK.heal)));

export const HEART_PCT = 0.12;
export const heartHeal = maxHp => Math.max(1, Math.round(maxHp * HEART_PCT));

/* the three kill heals, halved (5/2/4 -> 3/1/2) and capped: never more than 5 a kill */
export const KILL_HEAL = { charm: 3, bloodDrawn: 1, bloodletter: 2, cap: 5 };
export const killHeal = ({ charm = false, bloodDrawn = false, bloodletter = false } = {}) =>
  Math.min(KILL_HEAL.cap, (charm ? KILL_HEAL.charm : 0) + (bloodDrawn ? KILL_HEAL.bloodDrawn : 0) + (bloodletter ? KILL_HEAL.bloodletter : 0));

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
  shrine: 'A SHRINE SAVES AND FILLS YOUR FLASKS. IT DOES NOT HEAL: DRINK A FLASK (KEY).',
  drink: 'HURT? KEY DRINKS A FLASK: +35% HEALTH. STAND STILL: A BLOW SPILLS IT.',
  exam: 'THE EXAM: HERE THE SPIKES KILL.',
};
