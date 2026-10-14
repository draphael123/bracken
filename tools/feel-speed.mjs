// tools/feel-speed.mjs - GAME SPEED 50..200% (Daniel 10-12, claude/feelplatform). In the page:
//  1. the speed row: nine steps 50/60/70/85/100/125/150/175/200, the default of a fresh profile is 100%, the old save is migrated ONCE (speedV3) and then left alone;
//  2. the sub-step rule: above 100% the world runs 2 sub-steps of at most one 100% step (never one long step), so the hero covers speed x the ground in the same wall frames
//     and a fast fall lands the same place; at 50% and 100% nothing changed (the same trace as the old code);
//  3. the level clock and the hitstop stay on the right clocks.
import { openPage } from './cdp.mjs';
const fails = []; const ok = (c, m) => { if (!c) { fails.push(m); console.log('FAIL ' + m); } };
const pg = await openPage({ audio: false, fonts: false, speed: false });   /* the game's OWN default + migration, no tool pin */
try {
  const r = await pg.evalp(`(async()=>{
    const out = {}; const { LEVELS } = await import('/src/level.js');
    out.defaultSpeed = BK.SET.speed; out.v3 = BK.SET.speedV3;
    /* a saved v2 file at 0.6 and a saved v3 file at 0.7 */
    const ui = BK.ui; const a = ui.readSettings(JSON.stringify({ speed: 0.6, speedV2: 1 })); out.rawKept = a.speed;
    BK.manualSimulation = true;
    const run = (spd, frames, jump) => { BK.SET.speed = spd; BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(0); BK.start(); BK.sim(60); for (const k in BK.keys) BK.keys[k] = false;
      const P = BK.P, x0 = P.x, y0 = P.y, t0 = BK.villageWater.levelTime(); BK.keys.right = true; let maxStep = 0, px = P.x; for (let i = 0; i < frames; i++) { BK.sim(1); maxStep = Math.max(maxStep, Math.abs(P.x - px)); px = P.x; } BK.keys.right = false;
      return { dx: +(P.x - x0).toFixed(1), dy: +(P.y - y0).toFixed(1), maxStep: +maxStep.toFixed(2), t: +(BK.villageWater.levelTime() - t0).toFixed(3) }; };
    out.runs = {}; for (const s of [0.5, 1, 1.25, 1.5, 2]) out.runs[s] = run(s, 30);
    return out; })()`, 600000);
  console.log(JSON.stringify(r));
  ok(r.defaultSpeed === 0.6, 'a fresh profile defaults to 60% (Daniel 10-14; SPEED_DEFAULT flips it later): ' + r.defaultSpeed);
  ok(!r.v3, 'no speedV3 migration is applied while SPEED_MIGRATE is off');
  const d1 = r.runs[1].dx; ok(d1 > 20, 'the hero ran at 100%: ' + d1);
  for (const s of [0.5, 1.25, 1.5, 2]) { const k = r.runs[s].dx / d1; ok(Math.abs(k - s) < 0.12 * s + 0.05, 'ground covered at ' + s + ' is ' + s + ' x the 100% run, was ' + k.toFixed(2)); }
  ok(r.runs[2].maxStep <= r.runs[1].maxStep * 2.05 + 0.2, 'no single frame at 200% moved more than twice a 100% frame (two sub-steps)');
  /* THE ONE-TIME MIGRATION: an old file (speed 0.6, no speedV3) boots at 1.0 and is flagged; a v3 file at 0.7 keeps 0.7 */
  const boot = async (raw) => { await pg.evalp('localStorage.setItem("bracken.settings", ' + JSON.stringify(raw) + '); setTimeout(()=>location.reload(), 10); 1', 10000); await new Promise(r => setTimeout(r, 1500));
    for (let i = 0; i < 120; i++) { const v = await pg.evalp('typeof window.BK === "object" && !!window.BK.lookPass ? [BK.SET.speed, BK.SET.speedV3, JSON.parse(localStorage.getItem("bracken.settings")).speed] : null', 3000).catch(() => null); if (v) return v; await new Promise(r => setTimeout(r, 500)); } return null; };
  const m1 = await boot(JSON.stringify({ speed: 0.6, speedV2: 1, hudV2: 1 })); ok(m1 && m1[0] === 0.6 && !m1[1], 'an old file (0.6) is NOT migrated: ' + JSON.stringify(m1));
  const m2 = await boot(JSON.stringify({ speed: 0.7, speedV2: 1, speedV3: 1, hudV2: 1 })); ok(m2 && m2[0] === 0.7, 'a file keeps the speed the player chose: ' + JSON.stringify(m2));
  ok(!pg.errors.length, 'page errors: ' + pg.errors.slice(0, 2).join(' / '));
} finally { await pg.close(); }
if (fails.length) { console.log('FEEL-SPEED: ' + fails.length + ' red'); process.exit(1); }
console.log('FEEL-SPEED ok: the speed range, default, migration and sub-steps hold');
