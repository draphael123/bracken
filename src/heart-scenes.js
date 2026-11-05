/* src/heart-scenes.js - THE HEART OF THE MOUNTAIN'S TWO SCENES (lane SC SCENES, claude/scenes; scratch/lane-reports/heartplan.md rows SC + section 6). Pure: timing, cues, positions, rows. No canvas.
   SCENE A "THE SEAL BREAKS"   (~11 s): the drake is BEATEN (hp 0 = its last chain parted, it lies on the split seal) -> white light up the cracks, a laugh under the floor, a column of black
                               fire; THE DEMON KING rises out of it HALF-FORMED and up the crater's throat, the volcano ERUPTS; the drake drags itself up, lowers its neck, you climb on, it takes off.
                               Ends by loading the SKY FIGHT. THE CHECKPOINT: the sky fight starts here - a death in it restarts it at mount-up (checkpointOf below), flasks refilled.
   SCENE B "THE ESCAPE"        (~16 s): the last return knocked him down onto the drake's neck -> you run up the back, the DRAKE twists its head and BLASTS him off; he catches himself on wings of smoke,
                               laughs, and dives into the crater: the caldera CRACKS OPEN (THE BREACH), corruption pours down the mountain; the drake glides to the rim and lands, you step off.
                               THE CARD ("THE BREACH" / "HE IS NOT DONE. NOR ARE YOU.") -> the map. It always ends ON THE MAP (endOnMap), never auto-loads a level.
   Both are rows of src/transitions.js's TABLE (one scene beat + the fade), so they inherit its rules: any press skips (after MIN_SKIP), the clear is credited BEFORE the scene, the TRANSITIONS
   setting (ALWAYS / FIRST TIME / NEVER) and ?trans=0 govern whether the pictures play. A row with `chain: true` is NEVER dropped: when the pictures do not play (a replay, NEVER, ?trans=0) the
   state is the same as after a skip - a short fade, then the next stop (the sky fight for A, the map for B). So the road drakelab -> A -> skylab -> B -> map holds in every setting. */
const clamp01 = v => Math.max(0, Math.min(1, v));
const smooth = v => { v = clamp01(v); return v * v * (3 - 2 * v); };
const lerp = (a, b, k) => a + (b - a) * k;

/* ---------- SCENE A ---------- */
export const SEAL = {
  dur: 11.0,
  lightAt: 1.2, lightUp: 2.0,          // the white column rises 1.2 -> 3.2 s
  laughAt: 2.4,                        // the laugh under the floor (sound)
  fireAt: 3.4, fireUp: 1.4,            // the black fire column
  kingAt: 3.8, kingRise: 2.6,          // he rises out of it 3.8 -> 6.4 s and on up the throat
  eruptAt: 5.6, eruptUp: 1.6,          // the volcano erupts behind him
  drakeStirAt: 6.4, drakeUpAt: 7.2,    // it lifts its head, then drags itself up
  neckAt: 7.8,                         // lowers its neck to you
  climbAt: 8.4, climbT: 1.2,           // you climb on (8.4 -> 9.6)
  takeoffAt: 9.8,                      // wings, off the ground
  mount: 'skylab',                     // where the scene ends: the sky fight, at mount-up
};
/* cues the main.js loop plays once as the scene clock crosses them: [time, SFX name] (every name is a real SFX; audio.js) */
export const SEAL_CUES = [[0.5, 'dkCrash'], [1.2, 'dkChain'], [2.4, 'dkLaugh'], [3.4, 'dkBlast'], [5.4, 'dkEruption'], [7.0, 'drakeBank'], [9.8, 'drakeWing'], [10.4, 'drakeWing']];
export const sealLightK = s => smooth((s - SEAL.lightAt) / SEAL.lightUp) * (1 - smooth((s - SEAL.kingAt - 1.6) / 2.0) * 0.7);
export const sealFireK = s => smooth((s - SEAL.fireAt) / SEAL.fireUp);
export const sealEruptK = s => smooth((s - SEAL.eruptAt) / SEAL.eruptUp);
/* the King's rise: 0 at the seal's floor .. 1 out of the top of the screen. Half-formed all the way (phase 1 sprite). */
export function kingRiseK(s) { return smooth((s - SEAL.kingAt) / SEAL.kingRise); }
export const kingPoseA = s => (s < SEAL.kingAt + 1.1 ? 'rise' : s < SEAL.kingAt + 2.3 ? 'laugh' : 'rise');
/* the drake: 'down' (lies on the split seal) -> 'rise' (lifts its head) -> 'walk' (up on its legs, neck lowered to you) -> 'takeoff' -> 'hover' */
export function drakePoseA(s) {
  if (s < SEAL.drakeStirAt) return 'down'; if (s < SEAL.drakeUpAt) return 'rise'; if (s < SEAL.takeoffAt) return 'walk';
  if (s < SEAL.takeoffAt + 0.6) return 'takeoff'; return 'hover';
}
/* its lift off the floor (px): 0 until takeoff, then it rises and keeps rising */
export const drakeLiftA = s => (s < SEAL.takeoffAt ? 0 : 6 + (s - SEAL.takeoffAt) * 22 + smooth((s - SEAL.takeoffAt) / 1.2) * 14);
/* hero i of n: stood left of the seal; walks to the drake's flank when it kneels; climbs on (an arc up its side onto the back); then rides with it.
   Returns { x, y (px ABOVE the floor), walking, onBack } on a screen VW wide. */
export function heroA(i, n, s, VW) {
  const home = VW * 0.20 + i * 13, flank = VW * 0.54 + i * 5, back = VW * 0.60 - i * 4;
  const wk = smooth((s - SEAL.neckAt + 0.3) / 0.9), cl = smooth((s - SEAL.climbAt) / SEAL.climbT);
  const x = s < SEAL.neckAt - 0.3 ? home : cl > 0 ? lerp(flank, back, cl) : lerp(home, flank, wk);
  const y = cl > 0 ? Math.sin(cl * Math.PI * 0.5) * 18 + cl * 5 : 0;
  return { x, y: y + drakeLiftA(s), walking: s >= SEAL.neckAt - 0.3 && cl <= 0 && wk < 1, onBack: cl >= 1 };
}
/* the camera shake (px) the scene asks for at s: the seal's break, the eruption. Reduce-motion: 0 */
export function shakeA(s, reduce) { if (reduce) return 0; return Math.max(0, 1 - Math.abs(s - 1.2) / 0.5) * 2 + sealEruptK(s) * (s < SEAL.eruptAt + 2.6 ? 2.5 : 0.8); }

/* ---------- SCENE B ---------- */
export const ESCAPE = {
  dur: 16.0,
  runAt: 0.4, runT: 2.2,       // you run up the back
  twistAt: 2.8, blastAt: 3.5,  // the drake twists its head, blasts him off
  flyAt: 3.5, flyT: 1.6,       // he is flung up and away
  wingsAt: 5.0,                // he catches himself on wings of smoke
  laughAt: 5.8,
  diveAt: 7.0, diveT: 1.6,     // dives into the crater
  crackAt: 8.0, crackT: 2.4,   // the caldera cracks open beneath him
  glideAt: 9.4, landAt: 12.0,  // the drake glides down, lands on the rim
  stepOffAt: 12.6,
  cardAt: 12.4, cardIn: 1.0,   // the card (to the end of the scene)
};
export const ESCAPE_CARD = { title: 'THE BREACH', line: 'HE IS NOT DONE. NOR ARE YOU.' };
export const ESCAPE_CUES = [[0.0, 'dkScream'], [3.4, 'drakeBank'], [3.6, 'dkBlast'], [5.8, 'dkLaugh'], [7.2, 'dkSwoop'], [8.2, 'dkEruption'], [8.4, 'dkCrash'], [11.8, 'drakeWing'], [12.2, 'pStep'], [12.4, 'dkChain']];
export const crackK = s => smooth((s - ESCAPE.crackAt) / ESCAPE.crackT);
export const cardK = s => smooth((s - ESCAPE.cardAt) / ESCAPE.cardIn);
export const kingFlyK = s => clamp01((s - ESCAPE.flyAt) / ESCAPE.flyT);
export const diveK = s => clamp01((s - ESCAPE.diveAt) / ESCAPE.diveT);
export const glideK = s => smooth((s - ESCAPE.glideAt) / (ESCAPE.landAt - ESCAPE.glideAt));
export function kingPoseB(s) {
  if (s < ESCAPE.flyAt) return 'prone'; if (s < ESCAPE.wingsAt) return 'tumble'; if (s < ESCAPE.diveAt) return s >= ESCAPE.laughAt ? 'laugh' : 'wings'; return s < ESCAPE.diveAt + ESCAPE.diveT ? 'dive' : 'gone';
}
export function heroB(i, n, s, VW) {
  const k = smooth((s - ESCAPE.runAt) / ESCAPE.runT), x0 = VW * 0.20 + i * 11, x1 = VW * 0.50 + i * 11;
  const off = smooth((s - ESCAPE.stepOffAt) / 1.0);
  return { x: lerp(x0, x1, k) + off * 24, running: s > ESCAPE.runAt && k < 1, off: s >= ESCAPE.stepOffAt };
}

/* ---------- cues ---------- */
/* the cue names whose time lies in (s0, s1] */
export function cuesBetween(cues, s0, s1) { return cues.filter(c => c[0] > s0 && c[0] <= s1).map(c => c[1]); }

/* ---------- the rows (spread into src/transitions.js's TABLE) ---------- */
export const ROWS = [
  /* A: THE FIRE DRAKE is BEATEN (drakelab; the Heart level will name its own id): the pictures, then the sky fight loads, fresh, at mount-up. chain = never dropped. */
  { from: 'drakelab', to: 'skylab', scene: 'seal', chain: true, beats: [{ id: 'seal', dur: SEAL.dur, sc: true }, { id: 'fade', dur: 0.9 }], arrive: null },
  /* B: THE DEMON KING is KNOCKED DOWN (skylab; the Heart's sky fight): the escape, THE BREACH card, then the WORLD MAP (mapOnly: its target is the map's node, not a level to load). */
  { from: 'skylab', to: 'breach', scene: 'escape', chain: true, mapOnly: true, endOnMap: true, beats: [{ id: 'escape', dur: ESCAPE.dur, sc: true }, { id: 'fade', dur: 1.0 }], arrive: null },
];

/* ---------- THE CHECKPOINT (Daniel rec 2) ----------
   Scene A ends by loading the sky fight's level, so the level's start IS mount-up. A death in the sky fight restarts the fight there: a fresh fight (king bars full), the back reset to phase 1,
   every hero back on it, flasks refilled (respawn's deathRefill, the same as at any shrine). It does NOT replay the drake. Pure answer for the node check and for main.js's respawn hook. */
export function checkpointOf(levelId) { return levelId === SEAL.mount || levelId === 'heart-sky' ? { at: 'mount-up', freshFight: true, resetBack: true, refillFlasks: true, replaysDrake: false } : null; }
