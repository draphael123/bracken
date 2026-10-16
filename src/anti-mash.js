// src/anti-mash.js - ANTI-MASH INSIDE OPENINGS (claude/difficulty; Daniel's 10-15 ~12:55 interview, all recs - scratch/brief-difficulty.md).
//
// src/boss-greed.js already chips and reprises a masher OUTSIDE a boss's openings. INSIDE them, mashing the basic attack was the best play.
// Three rules, on EVERY hero generically - they hook the shared damage path (main.js hurtEnemy0 / addPoise), never a hero's branch:
//
// 1. STALE BLOWS. Inside ONE opening (a boss's or a mini's told window, a riposte opening, or BROKEN), the same attack VERB landed again pays
//    STALE.pay[n]: x1.0, 0.85, 0.7, then 0.55 for every repeat after. A different verb resets the count (and that blow pays whole). A new opening
//    starts clean. The verbs are src/riposte.js verbOf's: cut, heavy, plunge, sweep, rise, dash, shot, riposte, skill (a ROOM's blow - a throw,
//    a seed sent back - and a burn are the level's, never stale). THE READ: a stale blow's spark is dimmer and its hit sound duller - no word.
// 2. THE BREAK BAR, ON EVERY BOSS AND MINI (the old poise bar generalised; a mini's is lighter). Heavies, plunges, ripostes and ABILITIES fill
//    it fast; the basic cut barely (and only inside an opening - outside one, as before, a cut leans on nothing). FULL = BROKEN: he stands
//    still BREAK.secs (x his damage %, src/damage-pct.js), every hero blow lands x BREAK.mul, and ONE FINISHER is waiting: the first heavy or
//    ability into him lands x BREAK.finisher more, with a big hitstop. BREAK_SKIP lists the few with no body to break (said why).
// 3. VARIED HITS REFILL ABILITIES: a landed blow on a boss or mini whose verb differs from the last one takes CD_REFILL s off every ability's wait.
//
// The difficulty mode may tighten rule 1 (src/difficulty.js 'stale') and scale the bar's fill ('poise').
export const STALE = {
  pay: [1, 0.85, 0.7, 0.55],   // what the 1st, 2nd, 3rd and 4th+ landing of the SAME verb inside one opening pays (the floor repeats)
  dimSparks: 0.4,              // a stale blow throws this share of a fresh one's sparks (the read)
};
/* THE VERBS THAT ARE THE HERO'S HAND (a room's blow - throw / reflect - is never stale, never counted) */
export const HAND_VERBS = new Set(['cut', 'heavy', 'plunge', 'sweep', 'rise', 'dash', 'shot', 'riposte', 'skill']);
/* WHAT EACH VERB ADDS TO THE BREAK BAR (of BREAK.max), inside an opening. Outside one the cut adds nothing (the 10-04 rule: a tap never broke him). */
export const BREAK = {
  max: { boss: 100, mini: 70 },
  fill: { cut: 3, shot: 4, sweep: 7, rise: 7, dash: 12, heavy: 26, plunge: 22, riposte: 32, skill: 28 },
  outside: 0.6,      // x on a heavy/plunge/riposte/ability's fill outside his openings (he is guarding; the blow still leans on him)
  secs: { boss: 3.2, mini: 2.8 },   // BROKEN: how long he stands (the old poise break was 1.8 / 2.4)
  mul: 2,            // every hero blow into a BROKEN boss or mini (the old poise break paid 1.5)
  finisher: 1.5,     // the ONE finisher on top: the first heavy or ability into him while BROKEN
  finisherStop: 0.16,   // s of hitstop on the finisher (the big one)
};
export const FINISHER_VERBS = new Set(['heavy', 'skill', 'plunge', 'riposte']);
export const CD_REFILL = 0.25;   // s off every ability's wait for a varied blow on a boss or mini
/* NO BODY TO BREAK: left without the bar, each for a reason a boss-wave lane can revisit */
export const BREAK_SKIP = {
  mother: 'her body is armoured to every blade (the heart node is the fight)',
  kraken: 'no blade reaches the body - his arms carry his openings',
  krakenarm: 'an arm of the Kraken, not a body',
  undeadmage: "Daniel's explicit B15 exception: his ward turns every blade; his openings are his spells struck back",
  heart: 'the Mother\'s heart node is her opening, not a body to break',
  gill: 'the Mother\'s gills are props',
};
export const breakMax = e => (!e || BREAK_SKIP[e.t] ? 0 : e.xpRole === 'mini' || e.mini ? BREAK.max.mini : BREAK.max.boss);

/* RULE 1. The pay for a blow of `verb` on e, and the count it leaves. open: is he open right now (the caller asks src/boss-greed.js openOf + broken).
   e.stOpenN is his opening's number (openTick below bumps it on every opening's first frame); the count lives on e.stale = { n, verb, k }. */
export function staleMul(e, verb, open, pay = STALE.pay) {
  if (!e || !open || !HAND_VERBS.has(verb)) return 1;
  const k = e.stOpenN || 0, s = e.stale;
  if (!s || s.k !== k || s.verb !== verb) { e.stale = { n: 1, verb, k }; return pay[0]; }
  s.n++; return pay[Math.min(s.n, pay.length) - 1];
}
/* once a frame for a boss or mini: a new opening starts the count clean */
export function openTick(e, open) { if (open && !e.stOpenWas) e.stOpenN = (e.stOpenN || 0) + 1; e.stOpenWas = !!open; }
/* RULE 2. What a blow of `verb` adds to e's break bar (before the mode's poise and any hero's own poise talents) */
export function breakFill(e, verb, open) {
  if (!breakMax(e) || !HAND_VERBS.has(verb)) return 0;
  const n = BREAK.fill[verb] || 0; if (!open) return verb === 'cut' || verb === 'shot' || verb === 'sweep' || verb === 'rise' ? 0 : n * BREAK.outside;
  return e.xpRole === 'mini' || e.mini ? n * BREAK.max.mini / BREAK.max.boss * 1.15 : n;   /* a mini's lighter bar fills a little faster than its size alone */
}
export const breakSecs = e => (e.xpRole === 'mini' || e.mini ? BREAK.secs.mini : BREAK.secs.boss);
/* the finisher: true once per BROKEN, for the first heavy or ability */
export function finisherNow(e, verb) { if (!(e.broken > 0) || !e.bkBroke || e.bkFinished || !FINISHER_VERBS.has(verb)) return false; e.bkFinished = true; return true; }
/* RULE 3. a varied blow: true when this verb differs from the hero's last on a boss or mini */
export function varied(P, verb) { if (!HAND_VERBS.has(verb)) return false; const v = P.amLastVerb !== undefined && P.amLastVerb !== verb; P.amLastVerb = verb; return v; }
