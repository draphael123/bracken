// src/chill.js - CHILL, A SHARED STATUS (claude/rimebinder 11-05). Pure: no DOM, no main.js. Proved by tools/rimebinder.mjs.
// The game had FROZEN (e.frozen: a held stagger, drawn pale - the parry's freeze, Last Rites) but no CHILL: nothing that slows a creature's whole clock
// and builds toward a freeze (foevariety found this). THE RIMEBINDER is the first to use it; it is written as a status ANY source may apply, so a frost
// foe (the mountain arc) can chill a hero later with the same module (chillHero / heroClock below - wired into the run speed, unused by any foe yet).
//
// THE RULE (the approved Frost Mage rule, kept for the Rimebinder - brief-rimebinder-1023.md): her frost CHILLS; a weak foe that fills its chill FREEZES
// solid (the existing e.frozen + stagger, so every system that already reads a frozen foe - foeOpen, eliteLost, the pale tint - reads hers); ELITES and
// BOSSES only chill: their clock slows, never stops (B15: a boss is never frozen; the resist floor is untouched - chill changes time, not damage).
//   e.chill      0..1   how cold it is. Each source adds an amount (CHILL.amt below names the kit's); it starts to thaw CHILL.hold s after the last one.
//   e.chillImm   s      after a freeze thaws the foe cannot freeze again for this long (no freeze-lock: it still chills)
//   e.chillBy    hero   who chilled it last (the Rimebinder's RIME CORPSE asks: was it chilled when it died, and by whom)
//   clock(e)     the multiplier main.js puts on the foe's dt (beside the hasted foe's, src/foe-affix.js): weak 1 -> 0.55, elite -> 0.7, boss -> 0.82
export const CHILL = {
  hold: 1.2,            /* s after the last chill before it thaws */
  thaw: 0.3,            /* chill lost a second once thawing */
  slow: { weak: 0.45, elite: 0.3, boss: 0.18 },   /* clock = 1 - slow x chill */
  freeze: { t: 1.6, after: 0.35, imm: 2.5 },      /* a weak foe at full chill: frozen t s (stagger too), left at `after` chill, no second freeze for imm s */
  bossCap: 0.6,         /* a boss (or a mini) never sits above this much chill: he is slowed, never near stopped */
  hero: { slow: 0.4, max: 3 },                    /* (for frost FOES later) a chilled hero runs 1 - slow x k; k decays over its own seconds, max s */
};
export const isBossLike = e => !!e && (!!e.maxHp || !!e.mini || e.xpRole === 'mini' || !!e.isBoss);
export const isEliteFoe = e => !!e && !isBossLike(e) && !!e.elite;
export const isWeakFoe = e => !!e && !isBossLike(e) && !e.elite;
export const tierOf = e => isBossLike(e) ? 'boss' : isEliteFoe(e) ? 'elite' : 'weak';
/* CHILL IT: amt (0..1) more cold. Returns 'frozen' when this one froze it, 'chilled' when it took the cold, null when it could not (dead, harmless) */
export function chill(e, amt, by = null, now = 0) {
  if (!e || !e.alive || e.harmless || !(amt > 0)) return null;
  const t = tierOf(e), cap = t === 'boss' ? CHILL.bossCap : 1;
  e.chill = Math.min(cap, (e.chill || 0) + amt); e.chillHold = CHILL.hold; if (by) e.chillBy = by; e.chillAt = now;
  if (t === 'weak' && e.chill >= 1 && !(e.chillImm > 0)) {
    e.frozen = Math.max(e.frozen || 0, CHILL.freeze.t); e.stagger = Math.max(e.stagger || 0, CHILL.freeze.t); e.vx = 0;
    e.chill = CHILL.freeze.after; e.chillImm = CHILL.freeze.t + CHILL.freeze.imm; e.chillFroze = (e.chillFroze || 0) + 1;
    return 'frozen';
  }
  return 'chilled';
}
/* once a frame per foe (main.js updateEnemies): the hold runs down, then it thaws */
export function tick(e, dt) {
  if (e.chillImm > 0) e.chillImm = Math.max(0, e.chillImm - dt);
  if (!(e.chill > 0)) return;
  if (e.chillHold > 0) { e.chillHold -= dt; return; }
  e.chill = Math.max(0, e.chill - CHILL.thaw * dt);
}
export const chilled = e => !!e && ((e.chill || 0) > 0.02 || (e.frozen || 0) > 0);
/* the foe's clock: 1 warm, lower the colder (a frozen foe's own freeze already holds it: its clock is the floor) */
export function clock(e) {
  const c = e && e.chill || 0; if (c <= 0) return 1;
  return 1 - CHILL.slow[tierOf(e)] * Math.min(1, c);
}
/* ---- THE HERO SIDE (for the frost foes of the mountain arc; nothing applies it yet). p.chillT: s of cold left; heroClock: his run x ---- */
export function chillHero(p, s) { if (!p || p.dead || !(s > 0)) return; p.chillT = Math.min(CHILL.hero.max, (p.chillT || 0) + s); }
export function heroTick(p, dt) { if (p && p.chillT > 0) p.chillT = Math.max(0, p.chillT - dt); }
export const heroClock = p => !p || !(p.chillT > 0) ? 1 : 1 - CHILL.hero.slow * Math.min(1, p.chillT / CHILL.hero.max * 2);
/* THE READ (main.js draws it over the foe): a pale tint that deepens with the cold, frost motes; a frozen foe keeps the existing tint */
export const tintAlpha = e => !e || (e.frozen || 0) > 0 ? 0 : Math.min(0.42, 0.12 + 0.34 * (e.chill || 0));
export const CHILL_COL = '#bfe6f5';
