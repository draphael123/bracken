/* src/cf-impact.js - CF1 IMPACT, the blow (claude/cf1, plan scratch/lane-reports/cf-plan-1111.md section 2; Daniel 11-11: flags OFF).
   ONE FLAG. CF1_SHIPS false = batch158 byte for byte: every main.js / audio.js hook is `CF1_SHIPS && ...` or a call that returns its input.
   On = the blow's weight matches what it is: a skill's own size decides its class, a flame tick or a multi-hit does not stutter, the warden's tip reads her
   sweet spot, the hero leans into the cut (DRAW ONLY), the heavy wind-up shows its half and full, the thwack gets material + combo pitch, a kill gets a low boom.
   FEEL ONLY: no damage, hp, AI, commit window, real knockback or hit box. The JUICE / JUICE2 rows are never edited here; everything below layers on them.
   Pure functions + tables; main.js only calls in (tools/cf1.mjs asserts all of it, node only). Preview: ?cf1=1 (main.js, next to ?traits=). */
export let CF1_SHIPS = false;
export const setCF1 = on => { CF1_SHIPS = !!on; };

export const CF1 = {
  tickGap: 0.12,          /* real seconds: at most ONE light stop per foe in this window (5 hits in 0.3 s -> 3 stops) */
  heavyGap: 0.30,         /* a skill-upgraded heavy: a second one on the same foe inside this window lands as a light (a whirlwind's rings do not freeze 110 ms each) */
  skillWindow: 1.5,       /* s after the skill went off in which a blow counts as the skill's (the same window main.js rpSkillBlow uses) */
  jet: { sparks: 2, flash: 0.06, gap: 0.12, cols: ['#ff9a5c', '#ffd36b'] },   /* a flame tick: flash + 2 sparks + a soft sizzle, NO stop */
  tip: { stop: 'light', ring: 10, star: 'heavy' },                            /* the warden's point: the light stop (65 ms) + the JUICE2 star at the tip + a 10 px ring; TIP.stop 0.035 retired */
  shaft: { gain: Math.pow(10, -3 / 20), pitch: 0.92 },                         /* mid-shaft: a light stop, no star, a duller thwack (-3 dB, pitch -8%) */
  lean: { light: 2, heavy: 3 },                                                /* px toward face on the strike frame; eased back by beat 3 */
  leanEase: [0, 1, 0.5, 0, 0],                                                 /* per attackPose frame 0..4 (frame 1 = the strike) */
  glintAt: 0.5,           /* the weapon glints at half charge; at full a white flash + the tick the game already plays */
  flashFull: 0.08,        /* s of white on the hero at full charge (Flashes scales it; Reduce motion = none) */
  releaseSmear: 0.08,     /* s (about 2 frames at 0.6 speed) the heavy release's smear holds full alpha */
  material: { flesh: 1.0, wood: 0.92, bone: 1.1, steel: 1.25 },               /* thwack pitch by what it hit (MAT classes folded into these four) */
  comboSemis: 3,          /* the 3rd cut of a combo: +3 semitones on the transient (the combo climbs) */
  boom: { hz: 70, dur: 0.12, vol: 0.2, duck: Math.pow(10, -4 / 20), duckSec: 0.15 },   /* a kill: thwack finish + a low boom, the music ducked -4 dB for 150 ms */
  kick: { heavy: 1.5, finish: 2 },   /* camera kick along the blow's face, px; rides the 'land' tag so OFF / Reduce motion still give 0 */
};

/* the MAT table (main.js) has more classes than the four the thwack cares about */
const MAT_FOLD = { steel: 'steel', stone: 'steel', shell: 'steel', crystal: 'steel', wood: 'wood', bone: 'bone', fungus: 'flesh', chitin: 'flesh' };
export const matClass = m => MAT_FOLD[m] || 'flesh';

/* 1. SKILL CLASS TABLE (matrix #2 / #9): the move's own size decides the class, not dmg >= 18. Keys are the real skill ids (progression-catalog) of the 5 demo heroes.
   Only ever raises a light blow to heavy: the state guess, the tag guess and IMPACT (a cast naming its own class) all keep priority. 'finish' stays the kill's. */
export const SKILL_CLASS = {
  lunge: 'heavy', whirlwind: 'heavy', shieldThrow: 'heavy', groundSlam: 'heavy', swordOfRealm: 'heavy',   /* knight: lunge end, last ring, throw return, quake, capstone */
  javelin: 'heavy', rainOfSpears: 'heavy',                                                                   /* warden: the heavy throw, the capstone */
  boulder: 'heavy', spikeRow: 'heavy', faultLine: 'heavy', avalanche: 'heavy',                              /* geomancer: boulder, spike row, quake land, capstone */
  meteor: 'heavy', flashover: 'heavy',                                                                       /* pyro: the fireball burst, the stomp */
};
const hasTag = (b, v) => !!b && (b === v || (Array.isArray(b) && b.includes(v)));
/* base = what blowKind guessed ('light' | 'heavy'); skillId / age = the last skill used and seconds since (P.cf1Skill / time - P.cf1SkillAt); tag = the blow's own tag */
export function cfClass(base, skillId, age, tag) {
  if (!CF1_SHIPS || base !== 'light') return base;
  if (!skillId || !(age >= 0) || age >= CF1.skillWindow || SKILL_CLASS[skillId] !== 'heavy') return base;
  if (hasTag(tag, 'shot') && !hasTag(tag, 'heavy')) return base;   /* a plain arrow / bolt of a skill stays a tap */
  return 'heavy';
}

/* 2. TICK LIMITER (J1 deferred, matrix #4): per foe, real seconds. gate() says whether this blow may freeze the world and at what class. */
export function makeLimiter() { return { lastAny: new WeakMap(), lastHeavy: new WeakMap(), lastJet: new WeakMap() }; }
export function stopGate(lim, foe, cls, now, upgraded = false) {
  if (!CF1_SHIPS || !foe) return { stop: true, cls };
  if (cls === 'heavy' && upgraded) { const h = lim.lastHeavy.get(foe); if (h !== undefined && now - h < CF1.heavyGap) cls = 'light'; else lim.lastHeavy.set(foe, now); }
  if (cls === 'light') { const t = lim.lastAny.get(foe); if (t !== undefined && now - t < CF1.tickGap - 1e-9) return { stop: false, cls }; }
  lim.lastAny.set(foe, now);
  return { stop: true, cls };
}
/* a flame tick (P.jetHit / burn): no stop ever, at most one feedback per foe per jet.gap */
export function jetGate(lim, foe, now) { if (!CF1_SHIPS || !foe) return false; const t = lim.lastJet.get(foe); if (t !== undefined && now - t < CF1.jet.gap - 1e-9) return false; lim.lastJet.set(foe, now); return true; }

/* 3. WARDEN TIP / SHAFT (matrix #7): what the point and the middle of the shaft do (the spear's tipPay stamps the foe with the kind) */
export const tipRead = kind => !CF1_SHIPS ? null : kind === 'tip' ? { stop: CF1.tip.stop, star: CF1.tip.star, ring: CF1.tip.ring, gain: 1, pitch: 1 } : kind === 'shaft' ? { stop: 'light', star: null, ring: 0, gain: CF1.shaft.gain, pitch: CF1.shaft.pitch } : null;

/* 4. STEP INTO THE SWING: draw-only px of lean toward face for the pose on screen; 0 under Reduce motion, with the flag off, outside a swing, or on non-cut art */
const CUT_KEYS = new Set(['atk', 'atkB', 'atkC', 'bloodLash', 'heavy', 'gFist', 'kBash3', 'windup']);
export function leanPx(st, key, frame, reduce) {
  if (!CF1_SHIPS || reduce || !st || !(st.atk >= 0) || !CUT_KEYS.has(key) || st.dead) return 0;
  const k = CF1.leanEase[Math.max(0, Math.min(4, frame | 0))] || 0; if (!k) return 0;
  return (st.face || 1) * k * ((st.heavy || st.heavySwing) ? CF1.lean.heavy : CF1.lean.light);
}

/* 5. HEAVY CHARGE READ: the glint fires once as the charge crosses half; the full-charge flash is a time window the draw reads */
export const glintDue = (k, already) => CF1_SHIPS && !already && k >= CF1.glintAt;
export const flashAlpha = (now, at, flashesOn, reduce) => (!CF1_SHIPS || !flashesOn || reduce || at == null) ? 0 : Math.max(0, 1 - (now - at) / CF1.flashFull) * 0.7;
/* the heavy release's smear: true for the first releaseSmear s of the swing (atk clock) so the crescent is at full alpha for about two frames */
export const releaseSmearHit = (st, now) => !!CF1_SHIPS && !!st && st.cf1RelAt != null && now - st.cf1RelAt < 0.3 && st.atk >= 0 && st.atk < CF1.releaseSmear + 0.04;

/* 7. SOUND: opts for SFX.thwack(cls, opts); undefined with the flag off so audio.js plays today's sound. pitch is a multiplier on the transient. */
export function thwackOpts(mat, third, shaft) {
  if (!CF1_SHIPS) return undefined;
  let pitch = CF1.material[matClass(mat)] || 1, gain = 1;
  if (third) pitch *= Math.pow(2, CF1.comboSemis / 12);
  if (shaft) { pitch *= CF1.shaft.pitch; gain *= CF1.shaft.gain; }
  return { pitch, gain };
}

/* 8. SHAKE: the camera kick along the blow's face for a class (px, signed by dir); 0 for a tap or with the flag off */
export const kickFor = (cls, dir) => !CF1_SHIPS ? 0 : (CF1.kick[cls] || 0) * (dir || 1);
