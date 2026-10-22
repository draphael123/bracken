// src/hero-pass.js - HERO PASS A (claude/heropassa, Friday 10-16 hero pass, OPUS core; scratch/brief-heroidentity.md item 1 + the '!! 10-14 LATE'
// KNIGHT / WARDEN lines + the '!! 10-15' WARDEN TIP UP TO 2x line; the RANGER's two lines live in src/ranger.js).
//
// ONE DODGE A HERO (item 1, read through scratch/audit-hero-identity.md): the SAME input (V / SHIFT / pad B, or a way tapped twice), the same
// shared budget (src/commit.js: the roll's wind cost, a grace no longer than STAM.rollInv 0.26 s from the start, the 0.5 s cooldown), but
// each hero's ON THE GROUND is their own move. IN THE AIR every hero keeps the shared air dodge (the dash that holds the fall level) - so no
// gap a dodge used to clear changes, and no reach tool counts a dodge as a route (A7) - except the Geomancer, whose AIR dodge IS her new one.
//   KNIGHT     THE SHIELD-STEP: a short step (step.t) with the shield UP through it. The shield stays on the NEAREST FOE (within step.face px) -
//              a step away from him is a step back with the shield still on him; with nobody near he faces the way he steps. The grace is shorter (step.inv) because the shield covers the rest: through the step and step.guard s after it, a yellow
//              blow from the front is TURNED at a raised shield's price (commit.js blockCost) - NEVER a perfect guard (no riposte, no refund:
//              the parry is a shield RAISED on the beat), never a red one, never a bolt; out of wind it is a GUARD BREAK (the knight's rules).
//              Stepping the way he faces it keeps the dash in it (X early = THE SHOULDER CHARGE, a jump = a running jump); stepping back it is
//              ground given, no dash (the Warden's back-step rule).
//   WARDEN     THE STEP (unchanged: back by default, two quick then the wait) - and tapped FORWARD on her feet it is now a LOW HOP: her feet come
//              up off the turf for the step (drawn: hop.lift px), and a LOW blow (src/duck.js blowLow, or a blow its caller marks low) passes
//              under her - red or yellow, as the duck lets a high one over. She stays on the ground in the physics, so a jump out of it is still
//              THE VAULT and no route changes.
//   PYROMANCER THE EMBER BLINK: a short flash forward (blink.t s at blink.speed: ~60 px), untouchable for blink.inv from its start and NOT on the
//              landing (the brief: no i-frames on landing). She is not drawn in the middle of it - a streak of embers is. No trail fire (the old
//              CINDER ROLL's alight); it still costs 8 heat (main.js). PHOENIX TRAIL still drops its fire along it.
//   FREEBOOTER THE POWDER FLASH: the roll, through a puff of black powder thrown where he stood - whatever was IN FRONT of him (flash.r px) is
//              DAZZLED: a common foe flash.dazzle s (it reels, its tell is lost), an elite flash.elite s, a boss or a mini only FLINCHES (flash.boss,
//              told - never a lock, B3/B13). Escape and set-up for a blow from behind. (scratch/brief-freebooter-scoundrel.md item 3.)
//   DEATH KNIGHT THE SHADOW-STEP: shorter and quicker (step.t at step.speed: ~70 px) than the old passing, drawn as his shadow - and THE WAKE (his
//              cold decoy that foes swing at, main.js wakes[]) is left behind as before.
//   GEOMANCER  on the floor THE BURROW (unchanged). IN THE AIR: THE STONE SHRUG - she does not move: her skin turns to stone for shrug.t s, and the
//              FIRST blow in it is shrugged off whole (any colour: it replaces the grace, which she does not get). Pinned to the floor is her
//              weakness; the shrug is what she has off it.
//   BERSERKER  THE SHOULDER BARGE: his shoulder roll, a fifth further (src/berserker.js BZ.roll.speed), into the foes: the small ones are shoved
//              (knock-into), the brutes, elites, minis and bosses are not (berserker.js rollStep).
//   PALADIN    not here: PALADIN 4 (claude/paladin4) owns his - SANCTUARY STEP (main.js, the dodge block's isPaladin() branch). start() returns
//              at once for him so that branch drops in beside this one.
//   RANGER     THE BACKFLIP (src/ranger.js flip) - already her own; untouched.
//
// THE KNIGHT (the '!! 10-14 LATE' lines; he stays the clean baseline):
//   UP+C (a tap)  THE SHIELD BASH: the shield punched out in front (bash.t s: a windup, the strike at bash.hit, the recovery). The input is
//              UP+C because C alone is his guard (held) and its perfect guard (raised on the beat), DOWN+C his low guard and C at a full bar THE LAST
//              CHARGE - UP+C was free, and the bash does not raise the shield (P.block stays down while it runs), so it is never a free perfect guard.
//              A common foe it meets IN ITS WIND-UP (main.js windingUp / a ...Tell mode) LOSES the blow (main.js flinch: 'FLINCHES') and staggers
//              bash.stagger s; an elite loses it and reels bash.eliteStagger; a boss or a mini is never interrupted - it leans on his poise
//              (bash.bossLean) and says BRACED. A foe that was not winding up is only shoved. It costs bash.st wind and bash.cd s.
//   VALIANT STRIKE  at a FULL RESOLVE his next HEAVY CUT (held X, any stage) is VALIANT: it spends the bar (the bar is EITHER the last charge OR
//              this - the player's choice) and the cut is UNBLOCKABLE - a common foe's or an elite's guard is broken by it (GUARD BROKEN, open
//              valiant.guardBreak s) and an elite staggers valiant.eliteStagger s; a duelist boss's guard-by-angle wall does not turn it (main.js:
//              the wall line reads P.valiant) and it leans valiant.bossLean of his poise bar. Told: a gold flash on the blade and 'VALIANT'.
//
// THE WARDEN (the '!! 10-14 LATE' lines + '!! 10-15 ~12:40'):
//   COUNTER-THRUST  a deflect ON THE BEAT (src/riposte.js parried) makes her next thrust the RIPOSTE (the shared 'riposte' tag, x2 into the
//              parried foe) - and that thrust DRIVES the foe back OUT TO TIP RANGE (counter.to px from her, the near edge): a common foe or an elite
//              slides there (knockFoe's rules: never a boss, a mini or what cannot be thrown). 'COUNTER-THRUST'. The next thrust lands on the point.
//   WALL PLANT  in the AIR, pressed INTO a wall (holding the way she faces, the wall within plant.reach px), tap C: the spear is driven into the
//              wall at her hip and she stands on its shaft - a FOOTHOLD (plant.w px wide) that lasts plant.life s. A jump off it, an X, or the time
//              running out PULLS IT FREE (she has no spear while it is in the wall). Once a landing; plant.st wind. Never a route (A7): it exists
//              only at run time, the reach tools never see it.
//   THE TIP UP TO 2x  (main.js tipPay - the numbers live here: TIP)
//
// main.js hooks (each one line, commented "(claude/heropassa)"): makeHeroPass beside the Ranger's kit; start() in the dodge block; takes() in
// damagePlayer0 right after the invulnerable return; the knight's UP+C and the P.block line; heavyCut -> valiantArm; heroCut -> pre/post;
// the duelist wall line; the warden's C block -> plantPress; the mover landing -> footLand; the jump -> footJump; the draw -> drawMod/pose/draw.
// tools/hero-pass.mjs is its check (dodges, the knight, the warden, the tip).

export const HP = {
  knight: {
    step: { t: 0.24, inv: 0.14, speed: 230, guard: 0.12, face: 90 },
    bash: { st: 12, t: 0.24, hit: 0.08, hitEnd: 0.16, reach: 26, lunge: 110, dmg: 0.35, cd: 0.55, stagger: 0.9, eliteStagger: 0.45, bossLean: 18, shove: 120 },
    valiant: { eliteStagger: 0.8, guardBreak: 0.9, bossLean: 0.3 },
  },
  pyro: { blink: { t: 0.16, inv: 0.12, speed: 375, hide: [0.03, 0.13] } },
  pirate: { flash: { r: 46, dazzle: 0.6, elite: 0.3, boss: 0.12 } },
  reaper: { step: { t: 0.2, inv: 0.14, speed: 350 } },
  geomancer: { shrug: { t: 0.4 } },
  warden: { hop: { lift: 5 }, plant: { st: 10, life: 2.2, w: 14, reach: 8, cd: 0.3 }, counter: { to: 34 } },
};
/* THE WARDEN'S TIP, UP TO 2x (Daniel 10-15 ~12:40): x1.6 at the point rising to x2.0 at full extension (TIP_AT + ramp px; DEEP SET reaches it in
   deepRamp), a boss or a mini IN HIS OPENING x2.0 (was TIP_GAP 1.5), the middle of the shaft x0.7 (was 0.75); FULL STRETCH pays the point's
   ramp (at least x1.6, was a flat 1.5); a short hitstop and a bigger spark on the point */
export const TIP = { base: 1.6, full: 2.0, ramp: 12, deepRamp: 6, gap: 2.0, mid: 0.7, stop: 0.035 };
export const tipMul = (d, at, deep) => TIP.base + (TIP.full - TIP.base) * Math.min(1, Math.max(0, d - at) / (deep ? TIP.deepRamp : TIP.ramp));

export function makeHeroPass(api) {
  const stats = { steps: 0, stepTurned: 0, stepBroke: 0, hops: 0, hopped: 0, blinks: 0, flashes: 0, dazzled: 0, shadows: 0, shrugs: 0, shrugged: 0, barges: 0,
    bashes: 0, bashHits: 0, interrupts: 0, braced: 0, valiants: 0, valiantHits: 0, counters: 0, plants: 0, stood: 0, pulled: 0 };
  const P = () => api.P, H = () => api.hero();
  const big = e => !!(e.mini || e.xpRole === 'mini' || e.xpRole === 'boss' || e === api.boss);   /* (not maxHp: the Waymeet's sworn swords carry one and are common foes - src/riposte.js bossLike) */
  const live = e => e && e.alive && !e.harmless && !(e.gone > 0) && !e.turncoat;
  const nearFoe = (p, r) => { let best = null, bd = r; for (const e of api.enemies) { if (!live(e) || e.t === 'dummy' || Math.abs(e.y - p.y) > 40) continue; const d = Math.abs(e.x - p.x); if (d < bd) { bd = d; best = e; } } return best; };

  /* ---- (claude/heropassaart) THE ART'S FX LIST: timed world-space marks drawn by draw() - the ember streak, the shade, the powder flash and its smoke, the tip's star, the counter-thrust's chevrons, the bash's star.
     Art only: nothing here reads a box, a cost or a timer of the game (a hitstop freezes updatePlayer, so they hold still with the world). ---- */
  const fx = [];
  const addFx = o => { fx.push({ t: 0, ...o }); if (fx.length > 24) fx.shift(); };
  const star = (x, y, size, life, col = '#ffffff', col2 = '#dff0d8') => addFx({ k: 'star', x, y, size, life, col, col2 });

  /* ---- THE DODGE (main.js dodge block, after the shared set-up and before trialEvent('dodge')): the hero's own, on the ground ---- */
  function start(dir, air, back, burrow, face0) {
    const p = P(), h = H(); p.kStepG = 0; p.wHopT = 0; p.blinkT = 0; p.shrugT = 0; p.ownDodge = h !== 'warden';
    if (h === 'paladin' || h === 'ranger' || p.swim) return;   /* (PALADIN 4's SANCTUARY STEP is his branch in main.js; the Ranger's backflip is hers) */
    if (h === 'geomancer') { if (!air) return;   /* on the floor: THE BURROW */
      const S = HP.geomancer.shrug; p.dodge = p.dodgeMax = S.t; p.dodgeInv = 0; p.dash = 0; p.dashDur = 0; p.shrugT = S.t; p.vx *= 0.25; stats.shrugs++;
      api.kitPose(p, 'gShrug', S.t); api.SFX.stone && api.SFX.stone(); api.ringAt(p.x, p.y - 10, 14, '#c8bca8', 0.25);
      api.burst(p.x, p.y - 10, 8, ['#8c8a7e', '#c8bca8', '#5e4e38'], 50, 0.35, 60, 1); api.number(p.x, p.y - 26, 'STONE SHRUG', '#c8bca8'); return; }
    if (air) return;   /* everyone else keeps the shared air dodge */
    if (h === 'knight') { const S = HP.knight.step, foe = nearFoe(p, S.face); p.face = foe ? (Math.sign(foe.x - p.x) || p.face) : dir; const fwd = dir === p.face; p.kFaceT = S.t; p.faceLock = Math.max(p.faceLock || 0, S.t);   /* (the held key must not turn him in it: main.js reads faceLock) */   /* THE SHIELD STAYS ON THE NEAREST FOE (within step.face px): a step away from him is a step back with the shield on him; with nothing near, he faces the way he steps */
      p.dodge = p.dodgeMax = S.t; p.dodgeInv = Math.min(S.inv, api.CM.STAM.rollInv); p.vx = dir * S.speed; p.kStepG = S.t + S.guard;
      if (fwd) { p.dash = p.dodge; p.dashDur = p.dash; } else { p.dash = 0; p.dashDur = 0; }
      stats.steps++; api.kitPose(p, 'kStep', S.t); api.SFX.clank && api.SFX.clank(); api.dust(p.x - dir * 6, p.y, 3); return; }
    if (h === 'warden') { if (back) return; p.wHopT = p.dodge; p.wHopMax = p.dodge; stats.hops++; api.kitPose(p, 'wHop', p.dodge); api.dust(p.x, p.y, 4); return; }
    if (h === 'pyro') { const S = HP.pyro.blink; p.dodge = p.dodgeMax = S.t; p.dodgeInv = Math.min(S.inv, api.CM.STAM.rollInv); p.vx = dir * S.speed; p.dash = p.dodge; p.dashDur = p.dash;
      p.blinkT = S.t; p.blinkX0 = p.x; stats.blinks++; api.kitPose(p, 'eBlink', S.t); addFx({ k: 'ember', x0: p.x, x1: p.x, y: p.y - 9, dir, life: 0.5, live: true });
      api.burst(p.x, p.y - 10, 6, ['#fff6c8', '#ffd36b', '#ff9a5c'], 80, 0.22, -40, 1); api.ringAt(p.x, p.y - 10, 10, '#ffd36b', 0.18); return; }
    if (h === 'pirate') { powderFlash(p, face0); return; }
    if (h === 'reaper') { const S = HP.reaper.step; p.dodge = p.dodgeMax = S.t; p.dodgeInv = Math.min(S.inv, api.CM.STAM.rollInv); if (p.inv > S.inv && p.inv <= api.CM.STAM.rollInv + 1e-6) p.inv = S.inv;   /* (his roll's P.inv becomes the step's own grace: its tail is hittable, the wake takes the rest) */ p.vx = dir * S.speed; p.dash = p.dodge; p.dashDur = p.dash;
      stats.shadows++; api.kitPose(p, 'shadowStep', S.t); addFx({ k: 'shade', x0: p.x, x1: p.x, y: p.y, dir, life: 0.55, live: true });
      for (let i = 0; i < 6; i++) api.parts.push({ x: p.x + (Math.random() - 0.5) * 10, y: p.y - 6 - Math.random() * 18, vx: -dir * (30 + Math.random() * 70), vy: -70 - Math.random() * 60, life: 0.5, max: 0.5, col: Math.random() < 0.5 ? '#c0283a' : '#ff6b6b', size: Math.random() < 0.4 ? 2 : 1, grav: 240 });   /* (claude/bloodstep) a few droplets flicked off his armour */
      return; }
    if (h === 'berserker') { stats.barges++; api.kitPose(p, 'bzBarge', p.dodge); api.number(p.x, p.y - 26, 'BARGE', '#ff9a5c'); return; }
  }
  /* THE POWDER FLASH: the puff is thrown where he stood, at what was in front of him */
  function powderFlash(p, face0) { const S = HP.pirate.flash, x0 = p.x, y0 = p.y - 10; stats.flashes++;
    for (let i = 0; i < 16; i++) api.parts.push({ x: x0 + face0 * (4 + Math.random() * 18), y: y0 + (Math.random() - 0.5) * 12, vx: face0 * (20 + Math.random() * 60), vy: -10 - Math.random() * 20, life: 0.8, max: 0.8, col: Math.random() < 0.6 ? '#2a2620' : '#5a5448', size: 3, grav: -10 });
    api.ringAt(x0 + face0 * 14, y0, 18, '#fff6e0', 0.18); api.SFX.puff && api.SFX.puff(); api.SFX.spark && api.SFX.spark(); api.kitPose(p, 'powder', p.dodge || 0.3); addFx({ k: 'powder', x: x0 + face0 * 6, y: y0 + 2, dir: face0, life: 0.7 });
    for (const e of api.enemies) { if (!live(e)) continue; const dx = (e.x - x0) * face0; if (dx < -6 || dx > S.r + (e.w || 12) / 2 || Math.abs((e.y - (e.h || 16) / 2) - y0) > 26) continue;
      stats.dazzled++; e.flash = 0.2; e.dazzleT = api.time + (big(e) ? S.boss : e.elite ? S.elite : S.dazzle);
      if (big(e)) { e.stagger = Math.max(e.stagger || 0, S.boss); api.number(e.x, e.y - (e.h || 16) - 16, 'FLINCHES', '#d8d0c0'); continue; }
      if (/Tell$/.test(e.mode || '')) e.modeT = Math.max(e.modeT || 0, e.elite ? S.elite : S.dazzle);   /* its tell is lost in the smoke: told again when it can see */
      e.stagger = Math.max(e.stagger || 0, e.elite ? S.elite : S.dazzle); e.vx = 0; api.number(e.x, e.y - (e.h || 16) - 16, 'DAZZLED', '#d8d0c0'); }
    api.trialEvent('powder'); }

  /* ---- A BLOW LANDING (damagePlayer0, right after the invulnerable() return). 'blocked' | 'miss' | 'half' | null ---- */
  function takes(fromX, dmg, o) {
    const p = P(), h = H(), front = Math.sign(fromX - p.x) === p.face || fromX === p.x;
    if (h === 'geomancer' && p.shrugT > 0 && !(o.pct > 0)) { p.shrugT = 0; stats.shrugged++; p.dodge = Math.min(p.dodge, 0.05);
      api.SFX.clank && api.SFX.clank(); api.hitstop(0.05); api.shakeCam(2); api.sparks(p.x, p.y - 10, Math.sign(fromX - p.x) || p.face, 7);
      api.burst(p.x, p.y - 10, 10, ['#8c8a7e', '#c8bca8', '#5e4e38'], 70, 0.4, 120, 2); api.number(p.x, p.y - 28, 'SHRUGGED', '#c8bca8'); api.trialEvent('shrug'); return 'blocked'; }
    if (h === 'warden' && p.wHopT > 0 && (o.low || api.blowLow(o.src))) { stats.hopped++; api.number(p.x, p.y - 26, 'HOPPED', '#dff0d8'); api.dust(p.x, p.y, 4); api.trialEvent('hop'); return 'miss'; }
    if (h === 'knight' && p.kStepG > 0 && front && !o.unblockable && !o.pierce) {
      const bc = api.CM.blockCost(dmg, api.tal('steady'));
      if (p.st >= bc) { p.st -= bc; p.stDelay = api.stDelay(); stats.stepTurned++; api.gainResolve(8); api.blocked();
        api.SFX.clank && api.SFX.clank(); api.hitstop(0.05); api.shakeCam(2, -p.face * 2); api.sparks(p.x + p.face * 9, p.y - 9, p.face, 7); api.ringAt(p.x + p.face * 8, p.y - 9, 10, '#c9d1dc', 0.2);
        api.number(p.x, p.y - 26, 'SHIELD-STEP', '#c9d1dc'); api.trialEvent('kstep'); return 'blocked'; }
      stats.stepBroke++; p.kStepG = 0; api.guardBreak(); return 'half'; }
    return null;
  }

  /* THE POINT'S STAR (main.js tipPay, right after the pay is known): the size is the multiplier - x1.6 a small bright star, x2.0 a big one with a long streak back down the shaft and a second ring */
  function tipFx(e, mul) { const p = P(), k = Math.max(0, Math.min(1, (mul - TIP.base) / (TIP.full - TIP.base))), x = e.x - p.face * 3, y = e.y - (e.h || 16) / 2;
    addFx({ k: 'tip', x, y, dir: p.face, life: 0.2 + 0.1 * k, kk: k, px: p.x, py: p.y - 11 });
    if (k > 0.55) api.ringAt(x, y, 20 + 6 * k, '#ffffff', 0.26); }

  /* ---- EVERY FRAME (main.js updatePlayer, after the dodge block) ---- */
  function update(dt, keys, ctx) {
    const p = P(), h = H();
    for (let i = fx.length - 1; i >= 0; i--) { const f = fx[i]; f.t += dt; if (f.live) { if (f.k === 'ember' ? p.blinkT > 0 : p.dodge > 0 && p.kPoseK === 'shadowStep') f.x1 = p.x; else f.live = false; } if (f.t >= f.life) fx.splice(i, 1); }
    if (p.kFaceT > 0) { p.kFaceT -= dt; p.faceLock = Math.max(0, Math.min(p.faceLock || 0, p.kFaceT)); }
    p.kStepG = Math.max(0, (p.kStepG || 0) - dt); p.wHopT = Math.max(0, (p.wHopT || 0) - dt); p.shrugT = Math.max(0, (p.shrugT || 0) - dt); p.kBashCd = Math.max(0, (p.kBashCd || 0) - dt);
    if (p.blinkT > 0) { p.blinkT -= dt; if (Math.random() < dt * 60) api.parts.push({ x: p.x + (Math.random() - 0.5) * 8, y: p.y - 4 - Math.random() * 14, vx: -p.vx * 0.15, vy: -20 - Math.random() * 20, life: 0.22, max: 0.22, col: Math.random() < 0.5 ? '#ff9a5c' : '#fff6c8', size: 1, grav: -30 });
      if (p.blinkT <= 0) { api.burst(p.x, p.y - 10, 8, ['#fff6c8', '#ffd36b', '#ff9a5c'], 70, 0.3, -30, 1); api.ringAt(p.x, p.y - 10, 10, '#ff9a5c', 0.18); } }
    if (h === 'reaper' && p.dodge > 0 && Math.random() < dt * 40) api.parts.push({ x: p.x + (Math.random() - 0.5) * 10, y: p.y - 2 - Math.random() * 18, vx: -p.vx * 0.1, vy: -6, life: 0.35, max: 0.35, col: Math.random() < 0.6 ? '#8a1424' : '#c0283a', size: 2, grav: 0 });   /* (claude/bloodstep) crimson mist, not shadow */
    if (h === 'knight') bashStep(p, dt);
    if (h === 'warden') footStep(p, dt, keys);
    if (p.valiant && !(p.atk >= 0)) p.valiant = false;   /* (the valiant cut is over when its swing is) */
    if (p.dead) { p.kBashT = 0; p.foot = null; p.valiant = false; }
  }

  /* ---- THE KNIGHT: THE SHIELD BASH (UP+C) ---- */
  function bashPress() { const p = P(); if (p.kBashT > 0 || p.kBashCd > 0) return true;   /* (the press is his either way: UP+C is never the last charge) */
    if (!api.spend(HP.knight.bash.st)) { api.tired(); return true; }
    const B = HP.knight.bash; p.kBashT = B.t; p.kBashHit = new Set(); p.kBashCd = B.cd; p.block = false; p.vx = p.face * B.lunge; stats.bashes++;   /* (a half step in behind it) */
    api.kitPose(p, 'kBash', B.t); api.SFX.throwWhoosh && api.SFX.throwWhoosh(); api.noteVerb('bash'); return true; }
  function bashStep(p, dt) { if (!(p.kBashT > 0)) return; const B = HP.knight.bash; p.kBashT = Math.max(0, p.kBashT - dt); if (B.t - p.kBashT > B.hitEnd) p.vx *= Math.pow(0.02, dt);
    const el = B.t - p.kBashT; if (el < B.hit || el > B.hitEnd) return;
    const hb = p.face > 0 ? { l: p.x, r: p.x + B.reach, t: p.y - 22, b: p.y - 1 } : { l: p.x - B.reach, r: p.x, t: p.y - 22, b: p.y - 1 };
    for (const e of api.enemies) { if (!live(e) || p.kBashHit.has(e) || !api.overlap(hb, api.box(e))) continue; p.kBashHit.add(e); stats.bashHits++;
      const winding = api.windingUp(e) || /Tell$/.test(e.mode || '');
      api.hurtAs('light', e, Math.max(1, Math.round(api.swordDmg() * B.dmg)), p.x, false);
      api.SFX.clank && api.SFX.clank(); api.hitstop(0.06); api.shakeCam(2.5, p.face * 2); api.sparks(e.x - p.face * 4, e.y - (e.h || 16) / 2, p.face, 8); api.ringAt(p.x + p.face * 12, p.y - 11, 12, '#fff6e0', 0.22); star(p.x + p.face * (B.reach - 2), p.y - 11, 6, 0.24, '#ffffff', '#ffd36b');
      if (!e.alive) continue;
      if (big(e)) { api.poiseLean(e, B.bossLean); e.flash = 0.15; stats.braced++; api.number(e.x, e.y - (e.h || 16) - 18, 'BRACED', '#c9d1dc'); continue; }
      if (winding) { stats.interrupts++; api.flinch(e); e.stagger = Math.max(e.stagger || 0, e.elite ? B.eliteStagger : B.stagger); if (e.elite) e.stagger = Math.min(e.stagger, B.eliteStagger + 0.05);
        api.number(e.x, e.y - (e.h || 16) - 26, 'INTERRUPTED', '#ffd36b'); api.trialEvent('kbash'); }
      else { e.stagger = Math.max(e.stagger || 0, 0.35); if (!e.elite && !api.knockSkip(e)) e.vx = p.face * B.shove; } } }

  /* ---- THE KNIGHT: VALIANT STRIKE (heavyCut -> valiantArm; heroCut -> valiantPre / valiantPost) ---- */
  function valiantArm() { const p = P(); if (H() !== 'knight' || api.lcOn() || (p.resolve || 0) < 100) { p.valiant = false; return false; }
    p.resolve = 0; p.valiant = true; stats.valiants++;
    api.SFX.parry && api.SFX.parry(); api.zoomKick(1.05, 0.2); api.ringAt(p.x + p.face * 10, p.y - 18, 20, '#ffd36b', 0.35); api.number(p.x, p.y - 32, 'VALIANT', '#ffd36b'); return true; }
  function valiantPre(e) { const p = P(); if (!p.valiant || !p.heavy || !live(e)) return;
    if (big(e)) return;   /* (a boss's wall is read on the wall line: P.valiant) */
    const guarded = (e.guardT || 0) > 0 || (e.rxGuard || 0) > 0 || (e.raHigh || 0) >= 1 || !!e.elite || !!e.guard;   /* (only a GUARD is broken: an open foe takes the heavy cut as it is) */
    if (guarded && !(e.broken > 0)) { e.broken = HP.knight.valiant.guardBreak; e.guardT = 0; e.rxGuard = 0; e.raHigh = 0; e.vx = 0; e.valiantBroke = api.time; } }
  function valiantPost(e) { const p = P(); if (!p.valiant || !p.heavy) return; stats.valiantHits++; api.trialEvent('valiant');
    if (!e.alive) return;
    if (big(e)) { const m = api.poiseMax(e); if (m) api.poiseLean(e, m * HP.knight.valiant.bossLean); api.number(e.x, e.y - (e.h || 16) - 24, 'VALIANT', '#ffd36b'); return; }
    if (e.elite) e.stagger = Math.max(e.stagger || 0, HP.knight.valiant.eliteStagger);
    if (e.valiantBroke === api.time) api.number(e.x, e.y - (e.h || 16) - 24, 'GUARD BROKEN', '#ffd36b');
    api.sparks(e.x, e.y - (e.h || 16) / 2, p.face, 10); }
  const valiantEnd = () => { P().valiant = false; };

  /* ---- THE WARDEN: COUNTER-THRUST (heroCut -> counterPost, after the riposte thrust has landed) ---- */
  function counterPost(e) { const p = P(); if (H() !== 'warden' || !p.swingRiposte || !(p.atk >= 0) || p.swingKind || !e || !e.alive || big(e)) return;
    const d = api.tipReach(e), want = HP.warden.counter.to; stats.counters++; api.number(p.x, p.y - 30, 'COUNTER-THRUST', '#dff0d8'); api.trialEvent('counter'); addFx({ k: 'chev', x: p.x + p.face * 14, y: e.y - (e.h || 16) / 2, dir: p.face, life: 0.34 });
    if (d >= want - 2) return;
    if (api.knockFoe(e, p.face, 150, { slide: true })) e.kvx = p.face * Math.max(60, (want - d) / 0.335); }   /* (a thrown foe's knock bleeds off 0.25^t over 0.45 s: ~0.335 s of its speed is the distance) */

  /* ---- THE WARDEN: WALL PLANT (in the air, into a wall, C) ---- */
  function wallAhead(p) { const R = HP.warden.plant.reach, TS = api.TS, y = Math.floor((p.y - 10) / TS);
    for (const dx of [6, 6 + R / 2, 6 + R]) { if (api.isSolid(Math.floor((p.x + p.face * dx) / TS), y)) return Math.floor((p.x + p.face * dx) / TS); } return null; }
  function plantPress(keys) { const p = P(); if (H() !== 'warden' || p.ground || p.swim || p.climb || p.foot || p.plantUsed || (p.plantCd > 0)) return false;
    const into = p.face > 0 ? keys.right : keys.left; if (!into) return false;
    const tx = wallAhead(p); if (tx === null) return false;
    if (!api.spend(HP.warden.plant.st)) { api.tired(); return true; }
    const S = HP.warden.plant, TS = api.TS, wallX = p.face > 0 ? tx * TS : (tx + 1) * TS, y = Math.round(p.y - 2);
    p.foot = { x0: Math.min(wallX, wallX - p.face * S.w), x1: Math.max(wallX, wallX - p.face * S.w), y, wallX, dir: p.face, life: S.life }; p.plantUsed = true; stats.plants++;
    p.vy = Math.min(p.vy, 0); api.SFX.braceSet && api.SFX.braceSet(); api.SFX.clank && api.SFX.clank(); api.sparks(wallX, y, -p.face, 6); api.dust(wallX, y, 3); star(wallX - p.face * 2, y, 5, 0.22, '#ffffff', '#c9b27c');
    api.kitPose(p, 'wPlant', 0.25); api.number(p.x, p.y - 26, 'WALL PLANT', '#dff0d8'); api.trialEvent('plant'); return true; }
  /* she lands on the shaft (main.js, after the movers): the same footing rule as a mover */
  function footLand(prevY) { const p = P(), f = p.foot; if (!f || p.ground || p.vy < 0) return;
    if (prevY <= f.y + 1 && p.y >= f.y && p.y <= f.y + 10 && p.x + 4 > f.x0 && p.x - 4 < f.x1) { p.y = f.y; p.vy = 0; p.ground = true; p.coyote = 0.1; p.onFoot = true; if (!f.stood) { f.stood = true; stats.stood++; } } }
  function pullFree(p, why) { const f = p.foot; if (!f) return; p.foot = null; p.onFoot = false; p.plantCd = HP.warden.plant.cd; stats.pulled++;
    api.SFX.haftKnock && api.SFX.haftKnock(); api.dust(f.wallX, f.y, 3); if (why) api.number(p.x, p.y - 26, 'PULLED FREE', '#dff0d8'); }
  function footStep(p, dt, keys) { p.plantCd = Math.max(0, (p.plantCd || 0) - dt); if (p.ground && !p.onFoot) p.plantUsed = false;
    const f = p.foot; if (!f) { p.onFoot = false; return; }
    f.life -= dt; const on = p.ground && Math.abs(p.y - f.y) < 2 && p.x + 4 > f.x0 && p.x - 4 < f.x1; p.onFoot = on;
    if (f.life <= 0 || p.dead || p.atk >= 0 || (f.stood && !on && p.ground) || (f.stood && !on && !p.ground && p.vy < -60) || Math.abs(p.x - f.wallX) > 140) pullFree(p, f.life <= 0 || f.stood); }   /* (a jump off it pulls it free) */
  const footJump = () => { const p = P(); if (p.foot && p.onFoot) pullFree(p, true); };
  const planted = () => !!P().foot;

  /* ---- DRAWN ---- */
  function drawMod(p) { const out = { dY: 0, hide: false };
    if (p.wHopT > 0 && p.wHopMax > 0) { const k = 1 - p.wHopT / p.wHopMax; out.dY = -Math.round(Math.sin(k * Math.PI) * HP.warden.hop.lift); }
    if (p.blinkT > 0) { const el = HP.pyro.blink.t - p.blinkT; out.hide = el > HP.pyro.blink.hide[0] && el < HP.pyro.blink.hide[1]; }
    return out; }
  /* (claude/heropassaart) THE WORLD-SPACE ART. All of it is plain rects on the game buffer (no new canvases, nothing per frame but a few fillRects). */
  const rc = (g, x, y, w, h, col, a = 1) => { g.globalAlpha = a; g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); g.globalAlpha = 1; };
  function drawFx(g, cx, cy, f) { const k = f.t / f.life, fade = Math.max(0, 1 - k);
    if (f.k === 'ember') { const xa = Math.min(f.x0, f.x1) - cx, xb = Math.max(f.x0, f.x1) - cx, y = f.y - cy, n = Math.max(2, Math.round((xb - xa) / 3));   /* a rope of embers down the line she came, cooling from white to red and sinking */
      for (let i = 0; i <= n; i++) { const u = i / n, x = xa + (xb - xa) * u, near = f.dir > 0 ? u : 1 - u, h = ((i * 7 + 3) % 5) - 2, col = near > 0.7 && k < 0.3 ? '#fff6c8' : (i & 1) ? '#ff9a5c' : '#ffd36b';
        rc(g, x, y + h + k * 4 * ((i % 3) + 1) / 2, 2, 1, col, fade * (0.5 + 0.5 * near)); if (i % 3 === 0) rc(g, x, y + h - 2 - k * 6, 1, 1, '#ff6a3c', fade * 0.8); }
      if (k < 0.35) rc(g, xa, y - 1, xb - xa, 1, '#fff6c8', fade * 0.55); }
    else if (f.k === 'shade') { const xa = Math.min(f.x0, f.x1) - cx, xb = Math.max(f.x0, f.x1) - cx, y = f.y - cy;   /* THE SHADE HE LEAVES: three dark figures down the step, each fainter, two green lights in the nearest, and a ribbon along the floor */
      rc(g, xa, y - 1, xb - xa, 1, '#c0283a', fade * 0.6);   /* (claude/bloodstep) THE RED AFTER-IMAGE: three crimson figures down the step, each fainter, a pale glint in the nearest, a ribbon of blood along the floor, a mist over it */
      for (let j = 0; j < 3; j++) { const u = (j + 0.5) / 3, x = xa + (xb - xa) * (f.dir > 0 ? 1 - u : u), a = fade * (0.42 - j * 0.11);
        rc(g, x - 3, y - 17, 7, 16, '#a01a2c', a); rc(g, x - 4, y - 13, 9, 7, '#c0283a', a * 0.8); rc(g, x - 2, y - 20, 5, 4, '#a01a2c', a); if (j === 0) { rc(g, x - 1, y - 18, 1, 1, '#ffd0d0', fade); rc(g, x + 1, y - 18, 1, 1, '#ffd0d0', fade); } }
      for (let q = 0; q < 6; q++) { const x = xa + (xb - xa) * ((q * 37 % 11) / 11), yy = y - 4 - ((q * 5) % 14) - f.t * 12; rc(g, x - 2, yy, 4, 3, q & 1 ? '#ff6b6b' : '#8a1424', fade * 0.3); } }
    else if (f.k === 'powder') { const x = f.x - cx, y = f.y - cy, d = f.dir;   /* THE FLASH (the first 0.1 s: eight rays, white to orange) then the smoke: black powder smoke standing up and rolling forward, thinning to nothing */
      if (f.t < 0.1) { const r = 4 + f.t * 120; for (let q = 0; q < 8; q++) { const an = q / 8 * Math.PI * 2; rc(g, x + Math.cos(an) * r + d * 8, y + Math.sin(an) * r * 0.8, 2, 2, q & 1 ? '#ff9a5c' : '#ffd36b', 1 - f.t * 6); } rc(g, x + d * 8 - 3, y - 2, 6, 5, '#ffffff', 1 - f.t * 7); }
      for (let q = 0; q < 7; q++) { const sz = 5 + q % 3 * 2 + k * 7, px = x + d * (6 + q * 4 + k * 16), py = y - 2 - k * (10 + q * 2) + ((q * 5) % 7) - 3; rc(g, px - sz / 2, py - sz / 2, sz, sz, q % 3 === 0 ? '#5a5448' : '#2a2620', fade * 0.55); } }
    else if (f.k === 'star') { const x = f.x - cx, y = f.y - cy, r = Math.round(f.size * (0.5 + 0.8 * Math.min(1, k * 2.5)));
      rc(g, x - r, y, r * 2 + 1, 1, f.col2, fade); rc(g, x, y - r, 1, r * 2 + 1, f.col2, fade); rc(g, x - 1, y - 1, 3, 3, f.col, fade); const d = Math.round(r * 0.6); rc(g, x - d, y - d, 1, 1, f.col, fade); rc(g, x + d, y - d, 1, 1, f.col, fade); rc(g, x - d, y + d, 1, 1, f.col, fade); rc(g, x + d, y + d, 1, 1, f.col, fade); }
    else if (f.k === 'chev') { const x = f.x - cx, y = f.y - cy, d = f.dir;   /* THE COUNTER-THRUST: two green chevrons pushed out ahead of the point along the line the foe is driven back down */
      for (let q = 0; q < 2; q++) { const o = d * (q * 7 + k * 16); for (let j = 0; j < 4; j++) { rc(g, x + o - d * j, y - 3 + j, 1, 1, q ? '#8fd160' : '#dff0d8', fade); rc(g, x + o - d * j, y + 3 - j, 1, 1, q ? '#8fd160' : '#dff0d8', fade); } } }
    else if (f.k === 'tip') { const x = f.x - cx, y = f.y - cy, kk = f.kk, r = Math.round(4 + 6 * kk + 3 * Math.min(1, k * 3));   /* THE POINT'S STAR: bigger and whiter the further out it landed; the 2x one also drags a pale line back down the shaft to her hand */
      rc(g, x - r, y, r * 2 + 1, 1, '#dff0d8', fade); rc(g, x, y - r, 1, r * 2 + 1, '#dff0d8', fade); rc(g, x - 1, y - 1, 3, 3, '#ffffff', fade);
      if (kk > 0.4) { const d = Math.round(r * 0.65); for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) rc(g, x + sx * d, y + sy * d, 1, 1, '#ffffff', fade); }
      if (kk > 0.7) { const x0 = f.px - cx, n = Math.round(Math.abs(x - x0) / 2); for (let i = 0; i < n; i += 2) if (i / n < k * 2.2) rc(g, x0 + (x - x0) * (i / n) + (f.dir > 0 ? 6 : -6), y, 1, 1, '#ffffff', fade * 0.7); } } }
  function drawStoneSkin(g, cx, cy, p) { const x = p.x - cx, y = p.y - cy - 10, a = Math.min(1, p.shrugT * 5), t = api.time;   /* THE STONE SKIN: six chips of grey stone turning slowly round her like plates of a shell, the amber heart in a seam */
    for (let q = 0; q < 6; q++) { const an = t * 2.2 + q * Math.PI / 3, px = x + Math.cos(an) * 11, py = y + Math.sin(an) * 9, front = Math.sin(an) > 0; rc(g, px - 1, py - 1, 3, 3, q & 1 ? '#8c8a7e' : '#c8bca8', a * (front ? 0.95 : 0.5)); rc(g, px, py, 1, 1, '#e8dcc8', a * (front ? 0.9 : 0.3)); }
    rc(g, x - 9, y - 8, 1, 14, '#6f6a5c', a * 0.35); rc(g, x + 9, y - 8, 1, 14, '#6f6a5c', a * 0.35); rc(g, x - 1, y - 4, 2, 1, '#e8a83a', a * 0.8); }
  function draw(g, cx, cy) { const p = P(); const f = p.foot;
    if (f) { const x0 = Math.round(f.x0 - cx), x1 = Math.round(f.x1 - cx), y = Math.round(f.y - cy), w = x1 - x0, hd = f.dir > 0 ? x1 : x0;   /* THE SPEAR IN THE WALL: the shaft out level with its grip wraps, the butt cap toward her, the leaf-head gone into the stone with cracks round it */
      g.fillStyle = '#2a1a0e'; g.fillRect(x0, y - 1, w, 4); g.fillStyle = '#6a4a2a'; g.fillRect(x0, y, w, 2); g.fillStyle = '#c9b27c'; g.fillRect(x0, y, w, 1);
      g.fillStyle = '#3e2a16'; for (let i = 3; i < w - 3; i += 5) g.fillRect(x0 + i, y, 2, 2);
      const bx = f.dir > 0 ? x0 : x1 - 2; g.fillStyle = '#dff0d8'; g.fillRect(bx, y - 1, 2, 4); g.fillStyle = '#8fd160'; g.fillRect(bx, y, 2, 2);
      g.fillStyle = '#e8eef8'; g.fillRect(hd - (f.dir > 0 ? 3 : -1), y, 2, 2); g.fillStyle = '#1a1620'; g.fillRect(hd + (f.dir > 0 ? 0 : -1), y - 2, 1, 6); g.fillRect(hd + f.dir * 2, y - 3, 1, 3); g.fillRect(hd + f.dir * 2, y + 3, 1, 3);
      if (f.life < 0.6 && Math.floor(f.life * 10) % 2) { g.fillStyle = '#ffd36b'; g.fillRect(f.dir > 0 ? x0 : x1 - 1, y - 2, 2, 1); g.fillRect(f.dir > 0 ? x0 : x1 - 1, y + 3, 2, 1); }
      else if (p.onFoot) rc(g, x0 + 1, y - 1, w - 2, 1, '#8fd160', 0.5 + 0.3 * Math.sin(api.time * 8)); }
    if (p.kStepG > 0 && H() === 'knight' && !p.dead) { const x = Math.round(p.x - cx + p.face * 9), y = Math.round(p.y - cy) - 17, a = Math.min(0.85, p.kStepG * 5);   /* THE SHIELD UP THROUGH THE STEP: the whole face goes bright, a white bar down its rim, a glint at the top, a steel streak behind */
      rc(g, x + (p.face > 0 ? 1 : -3), y + 1, 3, 12, '#c9d1dc', a * 0.55); rc(g, x + (p.face > 0 ? 3 : -4), y, 1, 14, '#ffffff', a); rc(g, x + (p.face > 0 ? 3 : -5), y - 1, 2, 1, '#fff6c8', a);
      for (let q = 0; q < 3; q++) rc(g, x - p.face * (8 + q * 4) - (p.face > 0 ? 0 : 2), y + 4 + q * 3, 4, 1, '#c9d1dc', a * 0.45); }
    if (p.shrugT > 0 && H() === 'geomancer') drawStoneSkin(g, cx, cy, p);
    if (H() === 'knight' && !p.dead && (p.valiant || ((p.resolve || 0) >= 100 && !api.lcOn()))) { const t = api.time, hot = p.valiant && p.heavy;   /* VALIANT: a full bar and the blade is lit - three gold motes rising off it; in the heavy cut, a gold bar through the air ahead of the edge */
      const bx = Math.round(p.x - cx + p.face * 10), by = Math.round(p.y - cy) - 12;
      for (let q = 0; q < 3; q++) { const u = (t * 1.6 + q / 3) % 1; rc(g, bx + p.face * (3 + q * 2), by - 4 - u * 14 + q * 2, 1, 1, q ? '#ffd36b' : '#fff6c8', (1 - u) * (hot ? 1 : 0.75)); }
      if (hot) rc(g, p.face > 0 ? bx + 4 : bx - 18, by - 2, 14, 1, '#ffd36b', 0.6); }
    for (const q of fx) drawFx(g, cx, cy, q); }
  /* the dodge's body (main.js pose pick, the posed-dodge line): the key, or null for the shared roll */
  function poseKey(p) { if (!(p.dodge > 0)) return null; const h = H();
    if (h === 'knight' && p.kStepG > 0) return 'kStep'; if (h === 'warden' && p.wHopT > 0) return 'wHop'; if (h === 'pyro' && p.blinkT > 0) return 'eBlink';
    if (h === 'pirate' && p.kPoseK === 'powder') return 'powder'; if (h === 'reaper' && p.kPoseK === 'shadowStep') return 'shadowStep'; if (h === 'geomancer' && p.shrugT > 0) return 'gShrug';
    if (h === 'berserker' && p.kPoseK === 'bzBarge') return 'bzBarge'; return null; }

  function clear() { fx.length = 0; const p = P(); p.kStepG = 0; p.wHopT = 0; p.blinkT = 0; p.shrugT = 0; p.kBashT = 0; p.kBashCd = 0; p.valiant = false; p.foot = null; p.onFoot = false; p.plantUsed = false; }
  return { HP, TIP, stats, start, takes, update, bashPress, bashing: () => (P().kBashT || 0) > 0, valiantArm, valiantPre, valiantPost, valiantEnd, counterPost,
    plantPress, footLand, footJump, planted, drawMod, draw, poseKey, clear, tipFx, fxCount: () => fx.length, resetStats: () => { for (const k in stats) stats[k] = 0; } };
}
