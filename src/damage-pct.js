// src/damage-pct.js - DAMAGE % STAGGER, SMASH-STYLE (claude/damagepct, scratch/brief-damagepct.md, Daniel 10-12 ~08:00, interview rec).
//
// EVERY COMMON FOE AND ELITE CARRIES A DAMAGE %. Each HERO blow that lands adds to it (a burn, a bleed, a hazard, a foe's own fire add nothing):
//   gain = verb weight x (the damage that landed / the foe's full health) x 100, x (1 + PCT.pip per mix-up pip)
// so it reads how WORN DOWN and how HARD-HIT a foe is - a light cut is worth PCT.verb.cut of its damage, a heavy PCT.verb.heavy, a riposte
// PCT.verb.riposte - and mashing one light verb builds it slowly while mixed / heavy play builds it fast. Out of combat (PCT.calm s with no blow)
// it runs down at PCT.decay %/s.
// THE % DRIVES THE BLOW'S WEIGHT: the shove of any blow (shoveMul), the hitstun (stunMul - a light blow's a little, a heavy's a lot) and the
// THROW (src/knock-into.js: a heavy, a riposte, the finisher-on-break, the knight's third cut, the dash): its distance (knockMul) and its lift
// (liftMul). Low % = a flinch, a short shove; high % = it is LAUNCHED - a higher arc, further, and at PCT.tumble % or more it TUMBLES (spins in
// the air) into the knock-into hazards. Weight classes stay (src/knock-into.js weightOf: small 1, mid, brute a step; an elite x0.6 on top - and
// an elite is never killed by a throw).
// BOSSES AND MINIS are never thrown. They carry a % too (gained against PCT.bossRef of their health), and it lengthens their POISE BREAK
// (breakMul, capped at +PCT.bossMax); the break spends it (back to 0). Their B3 ward after, and their B15 floors, are untouched (src/riposte.js).
// THE READOUT: the foe's poise bar becomes the % - a number over its head (heat-coloured: white, gold, orange, red at a launch), the poise strip
// kept as a thin underline under it (the break still comes from the poise bar); an elite's plate shows it beside his health; a boss's beside
// his poise bar. tools/damage-pct.mjs is its check.
//
// main.js hooks (each commented "(claude/damagepct)"): the gain before e.hp -= dmg in hurtEnemy0, the shove / stun / throw there, knockFoe's
// lift + tumble, addPoise's and rpBreak's boss break length, the decay in updateEnemies, the tumble in poseOf, the draws.

export const PCT = {
  verb: { cut: 0.55, heavy: 1.5, riposte: 1.8, plunge: 1.2, sweep: 1.0, rise: 1.0, dash: 1.1, throw: 1.2, shot: 0.6, skill: 0.9, reflect: 1.0 },
  other: 0.8,          // a hero blow whose verb is not named
  pip: 0.1,            // x per mix-up pip on top (the pips' damage is already in the blow)
  max: 300,            // the most it holds
  calm: 3.0,           // s without a blow before it runs down
  decay: 8,            // %/s it runs down
  bossRef: 0.15,       // a boss / mini: % against this share of his full health (a blow of 15% of him = 100% x its verb)
  bossCap: 150, bossMax: 0.5,     // his break is up to +50% longer, reached at 150%
  knock: { lo: 0.35, per: 0.9, hi: 2.15 },   // knockMul = lo + per x %/100, capped: 0% = 0.35 (a shove), ~72% = 1.0 (the old fixed throw), 200% = 2.15
  lift:  { lo: 0.5, per: 0.7, hi: 1.9 },     // the throw's upward speed, the same way: 0% = a hop, high % = a launch arc
  shove: { lo: 0.85, per: 0.4, hi: 1.35 },   // any blow's push on a common foe or elite (the light cut's nudge included)
  stun:  { cap: 150, light: 0.3, heavy: 0.9 },   // hitstun x (1 + this x min(%, cap)/cap): a light blow's flinch a little longer, a heavy's a lot
  tumble: 100,         // % from which a throw tumbles
  heat: [[100, '#ff6b6b'], [70, '#ff9a5c'], [35, '#ffd36b'], [0, '#fff6e0']],   // the readout's colour, Smash-style
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lin = (R, p) => clamp(R.lo + R.per * Math.max(0, p) / 100, R.lo, R.hi);
export const knockMul = p => lin(PCT.knock, p);
export const liftMul = p => lin(PCT.lift, p);
export const shoveMul = p => lin(PCT.shove, p);
export const stunMul = (p, heavy) => 1 + (heavy ? PCT.stun.heavy : PCT.stun.light) * Math.min(Math.max(0, p), PCT.stun.cap) / PCT.stun.cap;
export const breakMul = p => 1 + PCT.bossMax * Math.min(Math.max(0, p), PCT.bossCap) / PCT.bossCap;
export const heatOf = p => { for (const [at, c] of PCT.heat) if (p >= at) return c; return PCT.heat[PCT.heat.length - 1][1]; };
export const verbK = verb => (verb && PCT.verb[verb] !== undefined ? PCT.verb[verb] : PCT.other);
/* THE GAIN of one landed blow: dealt (the damage that landed, no more than it had), full (its full health), boss (gained against PCT.bossRef of it) */
export function gainOf(dealt, full, verb, pips, boss) {
  if (!(dealt > 0) || !(full > 0)) return 0;
  return verbK(verb) * dealt / (full * (boss ? PCT.bossRef : 1)) * 100 * (1 + PCT.pip * Math.max(0, pips || 0));
}

export function makeDamagePct(api) {
  /* api: { time(), fullHp(e), bossLike(e), text(s, x, y, col, align, size, style), textW(s, size), still() } */
  const stats = { gains: 0, gained: 0, byVerb: {}, launches: 0, tumbles: 0, bossBreaks: 0, bossBreakMax: 0, maxPct: 0 };
  const t = () => api.time();
  const pctOf = e => (e && e.dmgPct) || 0;
  /* A LANDED HERO BLOW: add to its % (returns the gain) */
  function gain(e, dealt, verb, pips) {
    if (!e || !e.alive || e.harmless || e.t === 'dummy') return 0;
    const n = gainOf(dealt, api.fullHp(e), verb, pips, api.bossLike(e)); if (!(n > 0)) return 0;
    e.dmgPct = Math.min(PCT.max, pctOf(e) + n); e.pctAt = t();
    stats.gains++; stats.gained += n; stats.byVerb[verb || 'other'] = (stats.byVerb[verb || 'other'] || 0) + n; stats.maxPct = Math.max(stats.maxPct, e.dmgPct);
    return n;
  }
  /* EVERY FRAME: out of combat it runs down */
  function tick(e, dt) { if (e.dmgPct > 0 && t() - (e.pctAt ?? -99) > PCT.calm) e.dmgPct = Math.max(0, e.dmgPct - PCT.decay * dt); }
  /* A THROW at this %: { k, lift, tumble } - k scales the throw's speed, lift its upward speed (main.js knockFoe) */
  function throwAt(e, slide) {
    const p = pctOf(e), k = knockMul(p), lift = liftMul(p), tumble = !slide && p >= PCT.tumble;
    stats.launches++; if (tumble) stats.tumbles++;
    return { k, lift, tumble, p };
  }
  /* A BOSS'S / MINI'S BREAK: its length at his %, and the % spent */
  function bossBreak(e, base) {
    const m = breakMul(pctOf(e)); e.pctBreakMul = m; e.dmgPct = 0; stats.bossBreaks++; stats.bossBreakMax = Math.max(stats.bossBreakMax, m);
    return base * m;
  }
  /* THE TUMBLE, in poseOf: thrown at a launch, it turns over in the air until it lands */
  function tumblePose(o, e, now) {
    if (!(e.pctTumble > 0) || !(e.knock > 0) || api.still()) return;
    const a = (now - e.pctTumble) * 15 * (Math.sign(e.kvx || 0) || e.face || 1);
    o.rot = (o.rot || 0) + a; o.dy -= Math.round((e.h || 12) * 0.35 * Math.abs(Math.sin(a / 2)));
  }
  /* THE READOUT OVER A COMMON FOE (was its poise bar): the % in its heat colour, the poise strip a thin underline (gold, white and gold while broken).
     x the foe's centre and y the top of its head on the screen; poiseK 0..1 the poise bar's fill (null: it carries none) */
  function drawOver(g, e, x, y, poiseK) {
    const p = Math.round(pctOf(e)), br = e.broken > 0; if (p < 1 && !(poiseK > 0) && !br) return false;
    const s = p + "%", w = Math.max(10, Math.round(api.textW(s, 6))), ty = y - 16;
    if (p >= 1) api.text(s, x, ty, heatOf(p), 'center', 6, 'outline');
    if (poiseK !== null && (poiseK > 0 || br)) { const lw = Math.max(10, w), lx = Math.round(x - lw / 2), ly = y - 8;
      g.fillStyle = 'rgba(12,10,20,0.8)'; g.fillRect(lx - 1, ly - 1, lw + 2, 3);
      g.fillStyle = br ? (api.still() || Math.floor(t() * 12) % 2 ? '#ffd36b' : '#fff6c8') : '#c9a040'; g.fillRect(lx, ly, br ? lw : Math.round(lw * Math.min(1, poiseK)), 1); }
    return true;
  }
  /* BESIDE A PLATE'S BAR (an elite's health, a boss's poise bar): the % at (x, y), left-aligned, clamped onto the screen (VW). Returns its width */
  function drawBeside(e, x, y, VW, style = 'shadow') {
    const p = Math.round(pctOf(e)); if (p < 1) return 0;
    const s = p + '%', w = api.textW(s, 6), x0 = Math.min(VW - w - 2, x);
    api.text(s, x0, y, heatOf(p), 'left', 6, style); return w;
  }
  return { PCT, stats, pctOf, gain, tick, throwAt, bossBreak, tumblePose, drawOver, drawBeside,
    reset() { for (const k in stats) stats[k] = typeof stats[k] === 'number' ? 0 : {}; } };
}
