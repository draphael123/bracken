// src/demon-hunter.js - THE DEMON HUNTER (claude/demonhunter, 11-05; docs/demon-hunter-design.md). Daniel's 10-01 interview: DUAL BLADES + DASH; the dash passes
// THROUGH foes and cuts them (i-frames on the pass); chained hits build FURY, spent on a finisher; bonus vs demons/corrupted; guard = a short BACKSTEP.
// Unlocked in THE DEMON ACT (the knights' hidden temple off THE DEMON CITY: he is its boss, then bought). Behind src/hero-roster.js HUNTER_SHIPS.
// HE MARKS THEM AS HE PASSES, THEN HE COLLECTS:
//   BRANDS   silver, ON THE FOE (e.dhBrandT = when it fades): the dash-through, the third cut (THE SCISSOR), the backstep SLIP place them. 6 s (a demon 9 s).
//   FURY     on him, 0..10: +1 a blade/dash hit, +2 on a branded foe. Kept DH.fury.keep s between hits, then it bleeds a pip every DH.fury.bleed s; a blow on him halves it.
//   X x3     the blades (commit.js light 0.072); the third is THE SCISSOR (x1.35, brands, +1 fury). HOLD X: the shared heavy (no code here).
//   dodge    THE HUNTER'S DASH: short, fast, THROUGH foes (the roll's grace): cuts each foe passed (k DH.dash.k) and brands it. In its first DH.dash.beat s a bolt
//            it passes through goes home (the reflect-kit POWER return: REFLECT_ROW); later the pass is only i-frames.
//   tap C    THE BACKSTEP: a short hop back. On the beat of a yellow blow from the front it is THE SLIP, his parry (api.parried): the striker branded, +2 fury.
//            Off the beat it is spacing. A red blow is TOO STRONG (main.js says so; a backstep is not a parry of it).
//   DOWN+C   BANISH: DH.banish.cost fury - the nearest BRANDED foe: a small demon under 40% is banished outright; anything else k 1.5 (demon x1.5). A boss: k only.
//   UP+C     THE RECKONING (the ultimate, full fury): he blinks to each branded foe on screen in turn (i-frames), a cut each; a boss once, harder.
// main.js owns the world, the input and the tal()/tech()/upg() reads; this module owns his fury, brands, dash pass, backstep, banish, the reckoning and his ten
// actives. Every field of his lives ON THE HERO (P.dh*) so a co-op partner carries his own; brands live on the foe (two hunters share them - by design).
/* THE REFLECT-KIT ROW (claude/reflectkit src/reflect-kit.js row `demonhunter`: "the dash on the beat (i-frame pass through the bolt)"): P.dhDashAt is when the dash
   began; a bolt met inside REFLECT_ROW.beat of it is a POWER return (dashAnswer(age)). Normal returns: the blades, the dash-through cut. */
export const REFLECT_ROW = { id: 'demonhunter', beat: 0.2, r: 14 };

export const DH = {
  hp: 95, dmg: 10,                                    /* base health (progression.js growthAt) and a blade's base damage (main.js swordDmg) */
  fury: { max: 10, keep: 1.6, bleed: 0.25, hit: 1, branded: 2, struck: 0.5 },
  combo: { third: 1.35 },
  brand: { t: 6, demon: 9 },
  demon: { mul: 1.15, branded: 1.3 },
  dash: { speed: 300, k: 0.6, beat: 0.2, reachX: 6, reachY: 10 },
  step: { speed: 230, t: 0.12, rec: 0.35 },
  banish: { cost: 5, r: 96, under: 0.4, k: 1.5, demonK: 1.5 },
  reck: { step: 0.12, max: 6, k: 2.0, boss: 2.5, r: 170, dy: 70 },
  perk: { keep: 1, brand: 1 },                        /* HERO_PERKS.demonhunter (main.js applyUpgrades) */
  kit: {                                              /* his ten bought actives (progression-catalog.js dh*) */
    knives: { n: 3, vx: 280, k: 0.5, life: 0.6 },     /* SILVER KNIVES (1) */
    hook: { range: 96 },                              /* CHAIN HOOK (3) */
    oil: { t: 8, demon: 1.25 },                       /* HOLY OIL (4) */
    vault: { range: 48, k: 0.8 },                     /* OVER THE HORNS (5) */
    storm: { t: 0.8, every: 0.2, r: 28, k: 0.5 },     /* BLADE STORM (7) */
    sigil: { t: 6, w: 40, every: 0.5, k: 0.2 },       /* WARDING SIGIL (9) */
    call: { r: 128 },                                 /* HUNTER'S CALL (12) */
    rain: { delay: 0.4, from: 16, to: 96, k: 0.7 },   /* SILVER RAIN (14) */
    chase: { n: 3, len: 0.24 },                       /* THE CHASE (17) */
    sentence: { t: 6, under: 0.3, boss: 3.0 },        /* THE SENTENCE (20) */
  },
  tech: { wake: { t: 1, k: 0.4 }, rend: { k: 1.2 }, blink: { win: 0.4 }, cull: 2, volley: { k: 1.5, boss: 2.0, left: 5 }, surge: 1.15 },
};
export const DEMON_RE = /demon|fiend|infernal|corrupt|^(fire|venom)?imp$/;
export const isDemon = e => !!(e && (e.demon || e.corrupted || e.dkSkin === 'demon' || DEMON_RE.test(String(e.t || ''))));

export function makeHunter(api) {
  const P = () => api.P, T = () => api.tal(), K = id => !!(api.tech && api.tech(id)), U = id => (api.upg ? api.upg(id) : 0) | 0;
  const stats = { passes: 0, brands: 0, slips: 0, banished: 0, banishes: 0, reckonings: 0, powerReturns: 0, struck: 0 };
  let knives = [], rains = [], sigils = [], wakes = [];
  function ensure(p) { if (p.dhFury === undefined) { p.dhFury = 0; p.dhKeep = 0; p.dhBleedT = 0; p.dhDashWas = false; p.dhDashAt = -9; p.dhDashEnd = -9; p.dhDashDir = 1; p.dhPassed = new Set();
    p.dhSlipAt = -9; p.dhStepT = 0; p.dhStepRec = 0; p.dhCWas = false; p.dhOilT = 0; p.dhStormT = 0; p.dhStormTick = 0; p.dhChaseN = 0; p.dhSentenceT = 0; p.dhReck = null;
    p.dhScissorT = 0; p.dhWardT = 0; p.dhWasHurt = false; p.dhFreeDash = false; p.dhWakeFrom = null; } }
  const big = e => !!(e && (e.maxHp || e.mini || e === api.boss || e.elite));
  const live = e => e && e.alive && !e.harmless && !(e.gone > 0) && !e.turncoat;
  const demon = e => !!(e && api.demon(e));
  const tile = v => Math.floor(v / api.TS);
  const branded = e => !!e && (e.dhBrandT || 0) > api.time;
  const keepT = () => (DH.fury.keep + (T().longChain ? 0.6 : 0) + 0.2 * U('ufury')) * DH.perk.keep;
  const full = p => p.dhFury >= DH.fury.max;
  function gain(p, n) { if (!(n > 0)) return; const was = p.dhFury; p.dhFury = Math.min(DH.fury.max, p.dhFury + n); p.dhKeep = keepT(); p.dhBleedT = DH.fury.bleed; if (was < DH.fury.max && full(p)) api.meterReady('#e0e4f0'); }
  function brand(e, p = P()) { if (!live(e)) return; const was = branded(e);
    const t = (demon(e) ? DH.brand.demon : DH.brand.t) * DH.perk.brand * (1 + 0.15 * U('ubrand')) + (T().longBrand ? 4 : 0);
    e.dhBrandT = (K('dhhunt') && demon(e)) || (e.dhBoundT || 0) > api.time ? Math.max(e.dhBrandT || 0, api.time + 1e6) : Math.max(e.dhBrandT || 0, api.time + t);
    if (!was) { stats.brands++; if (T().brandFury) gain(p, 1); } }
  function unbrand(e) { if (!e) return; e.dhBrandT = 0; e.dhBoundT = 0; }
  function mend(p, n) { if (!(n > 0) || p.dead) return; p.hp = Math.min(p.maxHp, p.hp + n); }
  const cut = (e, k, x, tag = 'dash') => api.hurtAs(tag, e, Math.max(1, Math.round(api.swordDmg() * k * (demon(e) ? (branded(e) ? demonBranded() : DH.demon.mul) : 1))), x, false);
  const demonBranded = () => T().deepBrand ? 1.45 : DH.demon.branded;

  // ---- THE BLADES ----
  /* the third cut of a run: THE SCISSOR (main.js startSwing sets P.swingMul = DH.combo.third and calls this) */
  function thirdCut() { const p = P(); ensure(p); p.dhScissorT = 0.35; api.streaks(p.x + p.face * 12, p.y - 12, 5, ['#e0e4f0', '#c8203a'], 170); }
  /* every blade blow that lands (main.js swingDmg): fury, brands, demons, the oil, THE SENTENCE */
  function blowMul(e) { const p = P(); ensure(p); let m = 1 + 0.05 * U('ublade') + (T().keen ? 0.08 : 0);
    const wasB = branded(e);
    if (demon(e)) m *= wasB ? demonBranded() : DH.demon.mul;
    if (p.dhOilT > 0 && demon(e)) m *= DH.kit.oil.demon;
    if (T().twinFury && p.dhFury >= 5) m *= 1.1;
    if (K('dhsurge') && full(p)) m *= DH.tech.surge;
    if (p.dhSentenceT > 0 && wasB) { const hp0 = e.maxHp || e.hpMax || e.hp0 || 0; if (hp0 && e.hp <= hp0 * DH.kit.sentence.under) { p.dhSentenceT = 0; api.number(p.x, p.y - 30, 'SENTENCED', '#e0e4f0'); m *= big(e) ? DH.kit.sentence.boss : 99; } }
    gain(p, wasB ? DH.fury.branded : DH.fury.hit);
    if (p.dhScissorT > 0) { p.dhScissorT = 0; gain(p, 1 + (T().scissors ? 1 : 0));
      if (K('dhrend') && wasB) { unbrand(e); cut(e, DH.tech.rend.k, p.x, 'shot'); gain(p, 2); api.ringAt(e.x, e.y - (e.h || 16) / 2, 14, '#e0e4f0', 0.25); } else brand(e, p); }
    if (p.dhOilT > 0) brand(e, p);
    if ((e.dhBoundT || 0) > api.time) gain(p, 1);   /* SILVER CHAINS (L30 B): every hit on a bound foe is one more */
    return m; }

  // ---- THE DASH (his dodge: main.js starts it as the roll; this module makes it a pass) ----
  function dashStart(p, dir) { p.dhDashAt = api.time; p.dhPassed = new Set(); p.dhDashDir = dir; stats.passes++; api.noteVerb('dash');
    if (T().cheapDash) p.st = Math.min(p.maxSt || 100, (p.st || 0) + 4);
    if (p.dhFreeDash || (K('dhsurge') && full(p))) { p.dhFreeDash = false; p.st = Math.min(p.maxSt || 100, (p.st || 0) + 20); }
    if (K('dhwake')) p.dhWakeFrom = { x: p.x, y: p.y }; }
  function dashPass(p) { const R = DH.dash, sp = R.speed * (T().farDash ? 1.25 : 1);
    p.vx = p.dhDashDir * Math.max(Math.abs(p.vx || 0), sp);
    for (const e of api.enemies) { if (!live(e) || p.dhPassed.has(e)) continue; const h = e.h || 16;
      if (Math.abs(e.x - p.x) < (e.w || 12) / 2 + R.reachX && Math.abs((e.y - h / 2) - (p.y - 9)) < h / 2 + R.reachY) { p.dhPassed.add(e); const wasB = branded(e);
        cut(e, R.k * (T().dashCut ? 1.5 : 1) * (1 + 0.1 * U('udash')), p.x - p.dhDashDir * 8); brand(e, p); gain(p, wasB ? DH.fury.branded : DH.fury.hit); if (wasB && T().stepFury) gain(p, 2);
        if (T().passMend) mend(p, 1); api.sparks(e.x, e.y - h / 2, p.dhDashDir, 5); } }
    if (api.seeds) for (const s of api.seeds) { if (s.dead || s.reflected || s.owner === p || s.unblockable) continue;
      if (Math.abs(s.x - p.x) > REFLECT_ROW.r || Math.abs(s.y - (p.y - 10)) > 14) continue;
      if (api.time - p.dhDashAt <= REFLECT_ROW.beat + 1e-9) { if (!(api.boltHome && api.boltHome(s))) api.reflect(s); stats.powerReturns++; api.noteParry(); api.number(p.x, p.y - 28, 'THROUGH IT', '#e0e4f0'); } } }
  function dashEnd(p) { p.dhDashEnd = api.time; if (p.dhWakeFrom) { const a = p.dhWakeFrom.x, b = p.x; wakes.push({ x0: Math.min(a, b), x1: Math.max(a, b), y: p.y, t: DH.tech.wake.t, hit: new Map() }); p.dhWakeFrom = null; }
    if (p.dhChaseN > 0) { p.dhChaseN--; forceDash(p, p.dhDashDir); } }
  function forceDash(p, dir) { p.dodge = DH.kit.chase.len; p.dodgeInv = DH.kit.chase.len; p.inv = Math.max(p.inv || 0, DH.kit.chase.len); p.face = dir; p.vx = dir * DH.dash.speed; }
  /* the reflect-kit's answer: a bolt meeting the dash at this age (s since it began) - POWER inside the beat */
  const dashAge = (p = P()) => { ensure(p); return api.time - p.dhDashAt; };

  // ---- C: THE BACKSTEP / THE SLIP, BANISH ----
  const beatW = () => api.tap() * (T().longSlip ? 4 / 3 : 1) * (1 + 0.1 * U('uslip'));
  const onBeat = (p = P()) => { ensure(p); return api.time - p.dhSlipAt <= beatW(); };
  function backstep(p) { p.dhSlipAt = api.time; p.dhStepT = DH.step.t; p.dhStepRec = DH.step.rec; if (p.ground || p.swim) p.vx = -p.face * DH.step.speed; api.kitPose(p, 'brace', 0.18); api.dust(p.x, p.y, 3); }
  /* THE SLIP: a yellow blow from the front, on the beat of the backstep - his parry */
  function stepTakes(fromX, dmg, unblockable, foe, pierce) { const p = P(); ensure(p); if (!onBeat(p)) return null;
    const front = Math.sign(fromX - p.x) === p.face || fromX === p.x; if (!front || unblockable) return null; if (pierce && !foe) return null;
    stats.slips++; p.parryT = 0.22; if (api.parried) api.parried(foe); if (foe) brand(foe, p); gain(p, T().ghost ? 3 : 2); if (T().ghost) p.dhFreeDash = true;
    if (K('dhward')) p.dhWardT = 1.0;
    api.SFX.parry(); api.hitstop(0.07); api.shakeCam(2, -p.face * 2); api.sparks(p.x + p.face * 9, p.y - 13, p.face, 6); api.number(p.x, p.y - 28, 'SLIP', '#e0e4f0');
    api.noteParry(); api.trialEvent('parry'); return 'blocked'; }
  /* SILVER WARD (L40 B): the next blow inside a second of a slip lands at half */
  function wardTakes() { const p = P(); ensure(p); if (!(p.dhWardT > 0)) return null; p.dhWardT = 0; api.number(p.x, p.y - 28, 'SILVER WARD', '#e0e4f0'); return 'half'; }
  const banishCost = () => T().cheapBanish ? 4 : DH.banish.cost;
  function banishOne(p, e) { const B = DH.banish, under = T().wideBanish ? 0.55 : B.under, hp0 = e.maxHp || e.hpMax || e.hp0 || 0;
    unbrand(e); api.ringAt(e.x, e.y - (e.h || 16) / 2, 18, '#e0e4f0', 0.35);
    if (demon(e) && !big(e) && (!hp0 || e.hp <= hp0 * under)) { api.hurtAs('shot', e, 99999, p.x, false); stats.banished++; api.number(e.x, e.y - 24, 'BANISHED', '#e0e4f0'); return; }
    api.hurtAs('shot', e, Math.max(1, Math.round(api.swordDmg() * B.k * (demon(e) ? B.demonK : 1) * (1 + 0.15 * U('ubanish')) * api.amul('banish'))), p.x, false);
    if (big(e) && K('dhchain')) { e.dhBoundT = api.time + 10; e.dhBrandT = api.time + 10; api.poiseLean(e, 30); api.number(e.x, e.y - 24, 'BOUND', '#e0e4f0'); } }
  function banish(p) { const c = banishCost(); if (p.dhFury < c) { api.number(p.x, p.y - 26, 'NOT ENOUGH FURY', '#9aa39a'); return false; }
    const near = api.enemies.filter(e => live(e) && branded(e) && Math.abs(e.x - p.x) < DH.banish.r && Math.abs(e.y - p.y) < 48).sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x));
    if (!near.length) { api.number(p.x, p.y - 26, 'NO BRAND', '#9aa39a'); return false; }
    p.dhFury -= c; stats.banishes++; api.kitPose(p, 'ring', 0.3); api.SFX.parry(); api.hitstop(0.05);
    for (const e of (T().judgement ? near : near.slice(0, 1))) banishOne(p, e);
    api.trialEvent('banish'); return true; }

  // ---- THE RECKONING (the ultimate: main.js ultRegister) ----
  const reckonReady = () => { const p = P(); ensure(p); return full(p) && !p.dhReck; };
  function reckoning() { const p = P(); ensure(p); if (!reckonReady()) return false; const R = DH.reck; stats.reckonings++;
    p.dhFury = T().unending ? 3 : 0; api.shakeCam(4); api.zoomKick(1.05, 0.25); api.number(p.x, p.y - 34, 'THE RECKONING', '#e0e4f0'); api.trialEvent('meter');
    const inSight = api.enemies.filter(e => live(e) && Math.abs(e.x - p.x) < R.r && Math.abs(e.y - p.y) < R.dy);
    if (K('dhvolley')) { const V = DH.tech.volley; for (const e of inSight) { cut(e, (big(e) ? V.boss : V.k) * (1 + 0.1 * U('ureck')), p.x, 'shot'); brand(e, p); knives.push({ x: p.x, y: p.y - 12, tx: e.x, ty: e.y - 8, t: 0, fx: true, hit: new Set() }); }
      p.dhFury = Math.max(p.dhFury, V.left); return true; }
    let list = inSight.filter(branded).sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x)).slice(0, R.max);
    if (!list.length) { const n = inSight.sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0]; list = n ? [n] : []; }
    if (K('dhcull')) list = list.flatMap(e => [e, e]);
    p.dhReck = { list, i: 0, t: 0, home: p.x }; p.inv = Math.max(p.inv || 0, R.step * (list.length + 1)); return true; }
  function reckStep(p, dt) { const R = DH.reck, q = p.dhReck; q.t -= dt; if (q.t > 0) return; q.t = R.step;
    const e = q.list[q.i++]; if (!e) { p.dhReck = null; return; }
    if (live(e)) { const dir = Math.sign(e.x - p.x) || p.face, tx = e.x - dir * 12; if (!api.isSolid(tile(tx), tile(p.y - 8))) p.x = tx; p.face = dir;
      const k = big(e) ? R.boss : R.k; cut(e, k * (1 + 0.1 * U('ureck')) * api.amul('reckoning'), p.x, 'shot'); if (!K('dhcull') || q.list[q.i] !== e) unbrand(e);
      api.streaks(p.x, p.y - 10, 6, ['#ffffff', '#c8203a'], 220); api.hitstop(0.03); }
    p.inv = Math.max(p.inv || 0, R.step * 1.5); }

  // ---- EACH FRAME ----
  /* ctx: { stunned, dodging, attacking, guardOk } */
  function update(dt, keys, ctx) { const p = P(); ensure(p); if (p.dead) { p.dhReck = null; return; }
    const C = keys.block, press = C && !p.dhCWas; p.dhCWas = !!C;
    p.dhStepRec = Math.max(0, p.dhStepRec - dt); p.dhScissorT = Math.max(0, p.dhScissorT - dt); p.dhWardT = Math.max(0, p.dhWardT - dt);
    if (p.dhStepT > 0) { p.dhStepT -= dt; if (p.ground || p.swim) p.vx = -p.face * DH.step.speed; }
    const free = !ctx.stunned && !p.plunge && !p.dhReck && ctx.guardOk !== false;
    if (press && free) {
      if (K('dhblink') && !ctx.dodging && api.time - p.dhDashEnd <= DH.tech.blink.win) { p.dhDashEnd = -9; forceDash(p, -p.dhDashDir); api.number(p.x, p.y - 26, 'BLINK', '#e0e4f0'); }   /* BLINK BACK (L40 A): tap C right after a dash, a free pass back */
      else if (ctx.dodging) { /* nothing mid-dash */ }
      else if (keys.down && !keys.up) banish(p);
      else if (!keys.up && p.dhStepRec <= 0) backstep(p);
    }
    // the dash: the roll begins (main.js) -> a pass; it ends -> the wake, THE CHASE's next
    const dashing = (p.dodge || 0) > 0;
    if (dashing && !p.dhDashWas) dashStart(p, Math.sign(p.vx || 0) || p.face);
    if (dashing) dashPass(p);
    if (!dashing && p.dhDashWas) dashEnd(p);
    p.dhDashWas = dashing;
    // a blow on him halves fury (THICK SKIN: a third)
    const hurt = (p.hurt || 0) > 0; if (hurt && !p.dhWasHurt && p.dhFury > 0) { stats.struck++; p.dhFury = Math.floor(p.dhFury * (T().thickSkin ? 2 / 3 : DH.fury.struck)); } p.dhWasHurt = hurt;
    // fury keeps, then bleeds
    if (p.dhKeep > 0) p.dhKeep -= dt; else if (p.dhFury > 0 && !p.dhReck) { p.dhBleedT -= dt; if (p.dhBleedT <= 0) { p.dhBleedT = DH.fury.bleed; p.dhFury = Math.max(0, p.dhFury - 1); } }
    if (p.dhReck) reckStep(p, dt);
    p.dhOilT = Math.max(0, p.dhOilT - dt); p.dhSentenceT = Math.max(0, p.dhSentenceT - dt);
  }
  /* his kit's world each frame (knives, rain, sigils, the storm, the wake, the spread) - for whoever is the hunter; drawn below */
  function kitStep(dt) { const p = P(); ensure(p);
    for (const s of knives) { s.t += dt; if (s.fx) { if (s.t > 0.2) s.dead = true; continue; } s.x += s.vx * dt; s.y += s.vy * dt; if (s.t > DH.kit.knives.life || api.isSolid(tile(s.x), tile(s.y))) s.dead = true;
      for (const e of api.enemies) { if (s.dead || !live(e) || s.hit.has(e)) continue; const b = api.box(e); if (s.x > b.l && s.x < b.r && s.y > b.t && s.y < b.b) { s.hit.add(e); s.dead = true;
        cut(e, DH.kit.knives.k * (1 + 0.2 * U('uknife')) * api.amul('dhKnives'), s.x - Math.sign(s.vx) * 10, 'shot'); brand(e, p); gain(p, 1); } } }
    knives = knives.filter(s => !s.dead);
    for (const r of rains) { r.t -= dt; if (r.t <= 0 && !r.done) { r.done = true; for (const e of api.enemies) if (live(e) && e.x >= r.x0 && e.x <= r.x1 && Math.abs(e.y - r.y) < 30) { cut(e, DH.kit.rain.k * api.amul('dhRain'), e.x, 'shot'); brand(e, p); } } }
    rains = rains.filter(r => r.t > -0.25);
    for (const s of sigils) { s.t -= dt; s.tick -= dt; if (s.tick <= 0) { s.tick = DH.kit.sigil.every;
      for (const e of api.enemies) if (live(e) && Math.abs(e.x - s.x) < s.w / 2 && Math.abs(e.y - s.y) < 20) { brand(e, p); if (demon(e)) cut(e, DH.kit.sigil.k, s.x, 'shot'); } } }
    sigils = sigils.filter(s => s.t > 0);
    for (const w of wakes) { w.t -= dt; for (const e of api.enemies) { if (!live(e) || e.x < w.x0 || e.x > w.x1 || Math.abs(e.y - w.y) > 20) continue; const last = w.hit.get(e); if (last !== undefined && api.time - last < 0.5) continue; w.hit.set(e, api.time); cut(e, DH.tech.wake.k, e.x, 'shot'); } }
    wakes = wakes.filter(w => w.t > 0);
    if (p.dhStormT > 0) { p.dhStormT -= dt; p.dhStormTick -= dt; if (p.dhStormTick <= 0) { p.dhStormTick = DH.kit.storm.every; api.ringAt(p.x, p.y - 10, DH.kit.storm.r, '#e0e4f0', 0.15);
      for (const e of api.enemies) if (live(e) && Math.abs(e.x - p.x) < DH.kit.storm.r && Math.abs(e.y - p.y) < 24) { cut(e, DH.kit.storm.k * api.amul('dhStorm'), p.x, 'shot'); gain(p, 1); } } }
    if (T().spread) for (const e of api.enemies) { if (e.alive || e.dhSpreadDone || !((e.dhBrandT || 0) > api.time)) continue; e.dhSpreadDone = true;   /* SILVER SPREADS: a branded foe that dies brands those round it */
      for (const o of api.enemies) if (o !== e && live(o) && Math.abs(o.x - e.x) < 48 && Math.abs(o.y - e.y) < 32) brand(o, p); }
  }
  const ahead = (p, range, dy = 24) => api.enemies.filter(e => live(e) && (e.x - p.x) * p.face > 0 && Math.abs(e.x - p.x) < range && Math.abs(e.y - p.y) < dy).sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0] || null;
  /* THE TEN BOUGHT ACTIVES (main.js hunterKit presses them: skillPress / cdReady / spend, like everyone's) */
  const kit = {
    knives() { const p = P(), N = DH.kit.knives; for (let i = 0; i < N.n; i++) knives.push({ x: p.x + p.face * 8, y: p.y - 12, vx: p.face * N.vx, vy: (i - 1) * 60, t: 0, hit: new Set() }); api.kitPose(p, 'throw', 0.2); },
    hook() { const p = P(), e = ahead(p, DH.kit.hook.range); if (!e) { api.number(p.x, p.y - 26, 'NOTHING TO HOOK', '#9aa39a'); return; } brand(e, p);
      if (!big(e) && !api.knockSkip(e)) { const tx = p.x + p.face * 14; if (!api.isSolid(tile(tx), tile(e.y - 8))) e.x = tx; } else { const tx = e.x - p.face * 14; if (!api.isSolid(tile(tx), tile(p.y - 8))) p.x = tx; }
      api.streaks(p.x, p.y - 12, 4, ['#e0e4f0', '#8a90a0'], 200); },
    oil() { const p = P(); p.dhOilT = DH.kit.oil.t + (T().quickOil ? 4 : 0); api.ringAt(p.x, p.y - 12, 14, '#e0e4f0', 0.3); },
    vault() { const p = P(), e = ahead(p, DH.kit.vault.range); if (!e) { p.vy = -160; return; } const tx = e.x + p.face * 16; if (!api.isSolid(tile(tx), tile(p.y - 8))) p.x = tx; p.vy = -120; p.face = -p.face; p.inv = Math.max(p.inv || 0, 0.25); cut(e, DH.kit.vault.k, p.x, 'shot'); brand(e, p); },
    storm() { const p = P(); p.dhStormT = DH.kit.storm.t; p.dhStormTick = 0; api.kitPose(p, 'whirl', DH.kit.storm.t); },
    sigil() { const p = P(); sigils.push({ x: p.x, y: p.y, t: DH.kit.sigil.t, w: DH.kit.sigil.w, tick: 0 }); api.ringAt(p.x, p.y - 2, 20, '#c8203a', 0.3); },
    call() { const p = P(); let n = 0; for (const e of api.enemies) if (live(e) && Math.hypot(e.x - p.x, e.y - p.y) < DH.kit.call.r) { brand(e, p); n++; } api.ringAt(p.x, p.y - 12, DH.kit.call.r * 0.5, '#e0e4f0', 0.4); api.number(p.x, p.y - 30, n + ' BRANDED', '#e0e4f0'); },
    rain() { const p = P(), R = DH.kit.rain, a = p.x + p.face * R.from, b = p.x + p.face * R.to; rains.push({ x0: Math.min(a, b), x1: Math.max(a, b), y: p.y, t: R.delay }); },
    chase() { const p = P(); p.dhChaseN = DH.kit.chase.n - 1; forceDash(p, p.face); },
    sentence() { const p = P(); p.dhSentenceT = DH.kit.sentence.t; api.number(p.x, p.y - 30, 'THE SENTENCE', '#c8203a'); },
  };

  // ---- DRAWN (placeholder: the art pass owes his brands, knives, sigil, rain, wake) ----
  function draw(g, cx, cy) { const p = P(); if (!p || p.dhFury === undefined) return;
    for (const e of api.enemies) if (live(e) && branded(e)) { const x = Math.round(e.x - cx), y = Math.round(e.y - (e.h || 16) - 6 - cy), bl = (e.dhBrandT - api.time) < 1.5 && Math.floor(api.time * 10) % 2;
      if (bl) continue; g.fillStyle = demon(e) ? '#c8203a' : '#e0e4f0'; g.fillRect(x - 2, y, 1, 2); g.fillRect(x + 2, y, 1, 2); g.fillRect(x - 1, y + 2, 1, 1); g.fillRect(x + 1, y + 2, 1, 1); g.fillRect(x, y + 3, 1, 1); }
    for (const s of knives) { if (s.fx) { g.strokeStyle = '#e0e4f0'; g.lineWidth = 1; g.beginPath(); g.moveTo(s.x - cx, s.y - cy); g.lineTo(s.tx - cx, s.ty - cy); g.stroke(); continue; }
      g.fillStyle = '#e0e4f0'; g.fillRect(Math.round(s.x - cx) - 2, Math.round(s.y - cy), 4, 1); g.fillStyle = '#8a90a0'; g.fillRect(Math.round(s.x - cx) - 2 - Math.sign(s.vx), Math.round(s.y - cy), 1, 1); }
    for (const r of rains) { g.globalAlpha = r.t > 0 ? 0.35 : 0.8; g.fillStyle = '#e0e4f0'; for (let x = r.x0; x <= r.x1; x += 8) g.fillRect(Math.round(x - cx), Math.round(r.y - cy) - (r.t > 0 ? 40 : 16), 1, r.t > 0 ? 3 : 16); g.globalAlpha = 1; }
    for (const s of sigils) { g.globalAlpha = Math.min(1, s.t / 0.5) * 0.6; g.fillStyle = '#c8203a'; g.fillRect(Math.round(s.x - s.w / 2 - cx), Math.round(s.y - cy) - 1, s.w, 1); g.fillRect(Math.round(s.x - cx) - 1, Math.round(s.y - cy) - 4, 3, 3); g.globalAlpha = 1; }
    for (const w of wakes) { g.globalAlpha = Math.min(1, w.t) * 0.5; g.fillStyle = '#e0e4f0'; g.fillRect(Math.round(w.x0 - cx), Math.round(w.y - cy) - 9, Math.round(w.x1 - w.x0), 1); g.globalAlpha = 1; }
    if ((p.dodge || 0) > 0 && api.time - p.dhDashAt < 0.3) { g.globalAlpha = 0.4; g.fillStyle = '#e0e4f0'; g.fillRect(Math.round(p.x - cx) - p.dhDashDir * 14, Math.round(p.y - cy) - 12, 12, 1); g.globalAlpha = 1; }
  }
  /* what the HUD bar shows */
  const hud = () => { const p = P(); ensure(p); const near = api.enemies.some(e => live(e) && branded(e) && Math.abs(e.x - p.x) < DH.banish.r && Math.abs(e.y - p.y) < 48);
    return { fury: p.dhFury, max: DH.fury.max, full: full(p), keep: Math.max(0, p.dhKeep) / keepT(), banish: p.dhFury >= banishCost() && near, reck: !!p.dhReck, oil: p.dhOilT > 0 }; };
  function clear() { knives = []; rains = []; sigils = []; wakes = []; const p = P(); if (p) { ensure(p); p.dhFury = 0; p.dhReck = null; p.dhChaseN = 0; p.dhStormT = 0; p.dhOilT = 0; p.dhSentenceT = 0; p.dhWardT = 0; } }
  return { DH, stats, update, kitStep, kit, draw, hud, clear, thirdCut, blowMul, stepTakes, wardTakes, onBeat: () => onBeat(P()), dashAge: () => dashAge(P()),
    reckonReady, reckoning, fury: () => (ensure(P()), P().dhFury), branded, brand: e => brand(e), banish: () => banish(P()), reckoning0: () => !!P().dhReck, ensure: () => ensure(P()) };
}
