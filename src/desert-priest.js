// src/desert-priest.js - THE DESERT PRIEST, the 12th hero (claude/desertpriest, Daniel 11-04 22:19: "the 12th hero = DESERT PRIEST, unlock from the desert arc").
// His kit is THE SUN PRIEST's (docs/sun-priest-design.md; the pure light logic is src/sun-priest.js, proved by tools/sun-priest.mjs). Pyromancer family: a light
// caster with a staff, no shield. HE FIGHTS WITH THE LIGHT IN THE ROOM, and he is weaker where there is none.
//   X x3      the staff: a jab, a sweep, the third a FLASH (a burst of light a tile round the staff tip: it counts as light for RADIANCE a moment)
//   HOLD X    THE SUNBEAM: the staff planted, a beam along the row to the first wall (UP held: up the column). ROOTED. It burns the DEAD hard and the living a
//             little, stops at the first foe (DAWN: SECOND LIGHT goes through one more), and while it burns something it fills RADIANCE. Stamina to plant, and to hold.
//   RADIANCE  0..1. Fills standing in light (a lit level, a lamp/candle/fire, his own patch, his beam burning, THE FLASH, SUNRISE); drains in the dark.
//             His blows and his beam are x DP.rad.lo empty .. x DP.rad.hi full.
//   tap C     THE DISC (his ward, the house rule: tap C = the ward): the sun-disc on the staff raised. Raised AS a yellow blow lands = HIS PARRY (the shared beat,
//             src/riposte.js); a missile met on the beat is thrown back along its line. Off the beat it is nothing: his defence is timing, not a wall.
//   hold C    THE FLARE: a flash round him (3 tiles), HALF the bar. A wind-up in reach is stopped (flinch) and the living are dazzled; for DP.flare.beat s after
//             it goes off ANY blow that reaches him, red or bolt, is turned - THE SAVE, at a price. A foe stopped is not stopped again for 8 s (no locking a boss).
//   DOWN+C    CONSECRATE: a patch of sunlight on the floor (3 tiles, 6 s), a THIRD of the bar: it mends him, burns the dead on it, lights the dark.
//   UP+C full SUNRISE (THE ULTIMATE, every hero's input): 6 s of the whole screen in the light - the bar cannot drain, his beam burns double, he mends.
//   plunge    SUNFALL: a ring of light where he lands (burns, and a patch for 2 s).
//   dash+X    THE GLARE STEP (main.js DASH_STRIKE.sunpriest: through the small, a guard thrown wide).
// THE HARD RULE (Daniel 2026-09-21, src/sun-priest.js): his light is not the SUN. Sight, radiance and burning answer to it; sun-doors, plates and THE SKELETON
// KING's opening never do (none of those exist in a live level yet: when the desert levels land they read light.js's `sun` trace, never his).
// main.js owns the world, the input and the tal()/tech()/upg() reads; this module owns his bar, his beam, his patches, his disc and flare. Every field lives ON
// THE HERO (P.spRad, P.spPatches, P.spBeam...) so a co-op partner carries his own. BK.spk() reads it for tools and the bots.
/* THE REFLECT-KIT ROW (claude/reflectkit src/reflect-kit.js: the Demon King's bolt-return table, row `sunpriest`): his normal returns are the staff, THE BEAM
   through the bolt and the SUNFALL ring; his POWER return is THE FLARE going off as the bolt lands (flareAnswer(age, dx, dy): age <= FLARE_BEAT 0.2 s, within 3
   tiles). The kit's side of that contract: P.spFlareAt (when it went off) and DP.flare.beat / DP.flare.r are the same numbers; flareTakes turns the blow. */
export const REFLECT_ROW = { id: 'sunpriest', beat: 0.2, r: 3 * 16 };

export const DP = {
  hp: 85, dmg: 13,                                   /* base health (src/progression.js growthAt) and the staff's base damage (main.js swordDmg) */
  run: 1.0,
  rad: { fill: 1 / 6, drain: 1 / 20, lo: 0.75, hi: 1.15, start: 0.5, dark: 0.4 },   /* full in ~6 s lit, empty in ~20 s dark; dark: L.dark at or over this is a dark level */
  combo: { third: 1.4, flashR: 18, flashT: 0.6 },    /* THE FLASH: the third blow x1.4, a burst of light 18 px round the tip, light for 0.6 s */
  beam: { start: 0.22, plant: 20, drain: 8, tick: 0.25, living: 0.8, dead: 2.0, up: 0.7, len: 22 * 16, half: 5, step: 4 },   /* k per second x swordDmg x radMult; up: the column at 0.7 (SHAFT OF NOON: 1) */
  disc: { rec: 0.3, r: 18, dy: 14 },                 /* a tap's recovery; a missile within r px in front is thrown back on the beat */
  flare: { hold: 0.22, cost: 0.5, r: 48, lock: 8, dazzle: 0.8, beat: 0.2, rec: 0.6 },
  consecrate: { cost: 1 / 3, half: 1, t: 6, mend: 4, burn: 0.9, rec: 0.5 },   /* burn: k per second x swordDmg on the dead standing in it */
  sunrise: { t: 6, beamMult: 2, mend: 4 },
  sunfall: { half: 1, t: 2, k: 0.8, r: 26 },
  perk: { fill: 1, flare: 1 },                       /* the hero's own perks (progression.js HERO_PERKS.sunpriest) set these in main.js applyUpgrades */
  kit: {                                              /* his ten bought actives (progression-catalog.js, sp*) */
    shard: { vx: 300, k: 1.2, dead: 2, life: 0.9 },  /* SUN SHARD (1) */
    step: { dist: 64, inv: 0.25 },                    /* HALLOWED STEP (3) */
    lamp: { t: 12, r: 40 },                           /* SUN-LAMP (4) */
    ward: { t: 3 },                                   /* DAWN WARD (5): the next blow turned */
    pillar: { delay: 0.6, k: 2.0, dead: 1.5, range: 160, w: 12 },   /* PILLAR OF NOON (7) */
    mercy: { pct: 0.18, t: 3 },                       /* MERCY (9) */
    glare: { r: 64, dazzle: 1.2, poise: 25 },         /* GLARE (12) */
    wind: { k: 0.8, len: 96, push: 260 },             /* SOLAR WIND (14) */
    halo: { t: 8 },                                   /* HALO OF NOON (17) */
    eye: { t: 10, every: 0.6, k: 0.5, dead: 2, range: 140 },   /* THE BURNING EYE (20) */
  },
  tech: { spear: { k: 1.4, len: 64 }, solar: { k: 2.0 }, fall: { k: 3.0, boss: 1.5 }, prism: { k: 0.6 } },   /* the L25-50 techniques' numbers (src/tech-priest.js) */
};
export const radMultOf = (rad, floor = DP.rad.lo) => Math.max(floor, DP.rad.lo + (DP.rad.hi - DP.rad.lo) * Math.max(0, Math.min(1, rad || 0)));

export function makePriest(api) {
  const P = () => api.P, T = () => api.tal(), K = id => !!(api.tech && api.tech(id)), U = id => (api.upg ? api.upg(id) : 0) | 0;
  const stats = { beamTicks: 0, beamDead: 0, parries: 0, flares: 0, flareTurned: 0, consecrates: 0, sunrises: 0, sunfalls: 0, mended: 0, thrown: 0 };
  let shards = [], pillars = [], lamps = [];
  function ensure(p) { if (p.spRad === undefined) { p.spRad = DP.rad.start; p.spPatches = []; p.spLocks = new Map(); p.spSunrise = 0; p.spFlashT = 0; p.spBeam = null; p.spBeamT = 0; p.spBeamTick = 0; p.spBeamHitT = 0;
    p.spDiscAt = -9; p.spDiscRec = 0; p.spFlareAt = -9; p.spFlareRec = 0; p.spCHeld = 0; p.spCWas = false; p.spCMode = null; p.spWardT = 0; p.spHaloT = 0; p.spEyeT = 0; p.spEyeTick = 0; p.spMendT = 0; p.spMendPer = 0; p.spWasPlunge = false; p.spSeared = null; } }
  const big = e => !!(e && (e.maxHp || e.mini || e === api.boss || e.elite));
  const live = e => e && e.alive && !e.harmless && !(e.gone > 0) && !e.turncoat;
  const undead = e => !!(e && api.undead(e));
  const rad = p => { ensure(p); return p.spRad; };
  const floorMul = () => (T().nightEyes && api.dark()) ? 0.95 : DP.rad.lo;
  const radMult = (p = P()) => radMultOf(rad(p), floorMul());
  const full = p => rad(p) >= 1 - 1e-9;
  const tile = v => Math.floor(v / api.TS);
  function lightsHere(p) {   /* is he standing in light this frame (not counting the dark's own drain) */
    if (p.spSunrise > 0 || p.spFlashT > 0 || p.spBeamHitT > 0 || (T().noonBeam && p.spBeam)) return true;
    if (onPatch(p)) return true;
    for (const l of lamps) if (Math.abs(l.x - p.x) < l.r && Math.abs(l.y - p.y) < l.r) return true;
    return !!api.inLightAt(p.x, p.y - 8);
  }
  function onPatch(p) { const tx = tile(p.x), ty = tile(p.y - 1); return (p.spPatches || []).some(q => q.y === ty && tx >= q.x0 && tx <= q.x1); }
  function lay(p, half, t, kind) { const c = tile(p.x), y = tile(p.y - 1); p.spPatches.push({ x0: c - half, x1: c + half, y, t, max: t, kind, burnT: 0 }); }
  function gain(p, n) { const was = p.spRad; p.spRad = Math.max(0, Math.min(1, p.spRad + n)); if (was < 1 && p.spRad >= 1) { api.meterReady('#ffe89a'); api.teach && api.teach('full'); } }
  function mend(p, n) { if (!(n > 0) || p.dead) return; const was = p.hp; p.hp = Math.min(p.maxHp, p.hp + n); stats.mended += p.hp - was; }

  // ---- THE BEAM ----
  /* the beam's line this frame: {x0,y0,x1,y1,up,hit[]} - stops at the first wall, and at the first foe (SECOND LIGHT: one more) */
  function beamLine(p) {
    const up = !!(p.spBeam && p.spBeam.up), S = DP.beam.step, half = DP.beam.half, pierce = T().pierce ? 2 : 1, hit = [];
    let x = p.x + (up ? 0 : p.face * 6), y = up ? p.y - 22 : p.y - 11; const x0 = x, y0 = y; let n = 0;
    const foes = api.enemies.filter(live);
    while (n * S < DP.beam.len) { const nx = up ? x : x + p.face * S, ny = up ? y - S : y; if (api.isSolid(tile(nx), tile(ny))) break; x = nx; y = ny; n++;
      for (const e of foes) { if (hit.includes(e)) continue; const b = api.box(e); if (up ? (x > b.l - half && x < b.r + half && y > b.t && y < b.b) : (x > b.l && x < b.r && y > b.t - half && y < b.b + half)) hit.push(e); }
      if (hit.length >= pierce) break; }
    return { x0, y0, x1: x, y1: y, up, hit };
  }
  function beamStep(p, dt, keys) {
    const B = DP.beam; p.spBeamT += dt; p.spBeamTick -= dt; p.vx *= 0.5;
    if (!api.spend(B.drain * dt * (K('spzenith') && p.spBeam.up ? 0.5 : 1))) { beamOff(p, 'tired'); api.tired(); return; }
    p.spBeam.up = !!keys.up;
    const ln = beamLine(p); p.spBeam.line = ln;
    if (p.spBeamTick <= 0) { p.spBeamTick = B.tick;
      const upMul = ln.up ? (T().column || K('spzenith') ? 1 : B.up) : 1, sr = p.spSunrise > 0 ? DP.sunrise.beamMult : 1, um = 1 + 0.15 * U('urays');
      for (const e of ln.hit) { const k = (undead(e) ? B.dead : B.living) * upMul * sr * um * (K('spprism') ? 1 + DP.tech.prism.k : 1);
        api.hurtAs('shot', e, Math.max(1, Math.round(api.swordDmg() * k * B.tick)), p.x, false); stats.beamTicks++; if (undead(e)) stats.beamDead++;
        if (T().sear && !big(e)) p.spSeared = e;
        p.spBeamHitT = 0.35; }
      if (ln.hit.length) api.sparks(ln.x1, ln.y1, -p.face, 2); }
  }
  function beamOn(p, up) { if (!api.spend(DP.beam.plant * (T().longPlant ? 2 / 3 : 1))) { api.tired(); return false; } p.spBeam = { up: !!up, line: null }; p.spBeamT = 0; p.spBeamTick = 0; api.kitPose(p, 'flash', 0.3); api.SFX.lightFull && api.SFX.lightFull(); api.noteVerb('heavy'); return true; }
  function beamOff(p, why) { if (!p.spBeam) return; p.spBeam = null; p.spBeamT = 0; if (why === 'tired') api.number(p.x, p.y - 26, 'THE BEAM GOES OUT', '#9aa39a'); }
  /* HOLD X (main.js updateCharge hands the hold here and does nothing else for him): the beam is planted at DP.beam.start s and burns while X is held */
  function charge(dt, keys, can) { const p = P(); ensure(p);
    if (!keys.atk || !can) { beamOff(p); p.atkHeld = 0; p.charge = 0; return; }
    p.atkHeld = (p.atkHeld || 0) + dt;
    if (!p.spBeam && p.atkHeld >= DP.beam.start && p.atk < 0) { if (!beamOn(p, keys.up)) { p.atkHeld = -1e9; return; } }
    if (p.spBeam) { p.charge = 0.01; beamStep(p, dt, keys); }
  }

  // ---- THE STAFF ----
  /* the third blow's FLASH: a burst of light round the staff tip (light for RADIANCE a moment); THE SUN SPEAR (L25) throws it as a lance along the row */
  function thirdFlash() { const p = P(); ensure(p); p.spFlashT = DP.combo.flashT * (T().rays ? 1.5 : 1); const tx = p.x + p.face * 16, ty = p.y - 12, r = DP.combo.flashR * (T().rays ? 2 : 1);
    api.ringAt(tx, ty, r * 0.8, '#fff2b0', 0.25); api.burst(tx, ty, 6, ['#ffffff', '#ffd36b'], 60, 0.3, -20, 1);
    for (const e of api.enemies) if (live(e) && Math.abs(e.x - tx) < r && Math.abs((e.y - (e.h || 16) / 2) - ty) < r && undead(e)) { api.hurtAs('shot', e, Math.max(1, Math.round(api.swordDmg() * 0.5)), p.x, false); }
    if (K('spspear')) { const L = DP.tech.spear; for (const e of api.enemies) if (live(e) && (e.x - p.x) * p.face > 0 && Math.abs(e.x - p.x) < L.len && Math.abs(e.y - p.y) < 20) api.hurtAs('shot', e, Math.max(1, Math.round(api.swordDmg() * L.k * radMult(p))), p.x, false);
      api.streaks(tx, ty, 5, ['#fff6c8', '#ffd36b'], 220); } }
  /* every staff blow: x radiance; SEARED (DAWN) the next blow on the foe his beam marked */
  function blowMul(e) { const p = P(); ensure(p); let m = radMult(p); if (p.spSeared && p.spSeared === e) { m *= 1.25; p.spSeared = null; } if (p.spHaloT > 0 && T().haloMend) mend(p, 1); return m; }

  // ---- C: THE DISC, THE FLARE, CONSECRATE ----
  const beatW = () => api.tap() * (T().longBeat ? 4 / 3 : 1) * (1 + 0.1 * U('udisc'));
  const onBeat = (p = P()) => { ensure(p); return api.time - p.spDiscAt <= beatW(); };
  function disc(p) { p.spDiscAt = api.time; p.spDiscRec = DP.disc.rec; api.kitPose(p, 'ring', 0.18); api.SFX.aegis && api.SFX.aegis(); api.ringAt(p.x + p.face * 8, p.y - 14, 8, '#ffe89a', 0.16); }
  function consecrate(p) { const C = DP.consecrate; if (p.spRad < C.cost - 1e-9) { api.number(p.x, p.y - 26, 'TOO LITTLE LIGHT', '#9aa39a'); api.SFX.buzz && api.SFX.buzz(); return false; }
    p.spRad -= C.cost; lay(p, C.half + (T().wideHoly ? 1 : 0), (C.t + (T().longHoly ? 3 : 0) + U('uhallow')) * (K('spnoon') ? 1.5 : 1), 'consecrate'); stats.consecrates++;
    api.kitPose(p, 'wall', 0.4); api.ringAt(p.x, p.y - 2, 24, '#ffe89a', 0.4); api.SFX.lightFull && api.SFX.lightFull(); api.trialEvent('consecrate'); return true; }
  const flareCost = () => Math.max(0.3, (T().cheapFlare ? 0.4 : DP.flare.cost) - 0.05 * U('uquick')) / DP.perk.flare;
  function flare(p) { const F = DP.flare, c = flareCost(); if (p.spRad < c - 1e-9) { api.number(p.x, p.y - 26, 'TOO LITTLE LIGHT', '#9aa39a'); return false; }
    p.spRad -= c; p.spFlareAt = api.time; p.spFlareRec = F.rec; stats.flares++; api.kitPose(p, 'ring', 0.35); api.SFX.lightFull && api.SFX.lightFull(); api.hitstop(0.04); api.shakeCam(2);
    api.ringAt(p.x, p.y - 12, F.r, '#fff6c8', 0.35); api.ringAt(p.x, p.y - 12, F.r * 0.5, '#ffffff', 0.2); api.burst(p.x, p.y - 12, 10, ['#ffffff', '#ffe89a'], 90, 0.35, 0, 1); p.spFlashT = Math.max(p.spFlashT, 0.4);
    for (const e of api.enemies) { if (!live(e) || Math.abs(e.x - p.x) > F.r || Math.abs((e.y - (e.h || 16) / 2) - (p.y - 10)) > F.r) continue;
      const last = p.spLocks.get(e); if (last !== undefined && api.time - last < F.lock) continue;
      if (api.windingUp(e)) { p.spLocks.set(e, api.time); if (!big(e)) api.flinch(e); else api.poiseLean(e, 30); }   /* a wind-up stopped (a boss's: only leaned on - his blow is turned on the beat below, never cancelled) */
      if (!big(e)) { e.stagger = Math.max(e.stagger || 0, F.dazzle * (K('spblind') ? 2.5 : 1)); if (K('spblind')) e.spBlindT = api.time + 2; } }
    api.trialEvent('flare'); return true; }
  /* THE FLARE AS IT LANDS: any blow that reaches him inside DP.flare.beat of it going off is turned - red, bolt or yellow (its price was half the bar). The
     reflect-kit row (claude/reflectkit src/reflect-kit.js flareAnswer) reads p.spFlareAt the same way: a demon-king bolt reaching him in the beat is a POWER return. */
  const flareAge = (p = P()) => { ensure(p); return api.time - p.spFlareAt; };
  function flareTakes(fromX, dmg, o = {}) { const p = P(); ensure(p); if (flareAge(p) > DP.flare.beat + 1e-9 || flareAge(p) < 0) return null;
    if (Math.abs(fromX - p.x) > DP.flare.r * 1.6) return null;
    stats.flareTurned++; p.parryT = 0.22; const foe = o.who; if (api.parried && foe && foe.alive) api.parried(foe);
    if (K('spsolar') && foe && foe.alive) api.hurtAs('shot', foe, Math.max(1, Math.round(api.swordDmg() * DP.tech.solar.k * radMult(p))), p.x, false);
    api.SFX.parry(); api.hitstop(0.08); api.number(p.x, p.y - 28, 'FLARE', '#fff6c8'); api.noteParry(); return 'blocked'; }
  /* THE DISC ON THE BEAT: a yellow blow from the front, turned - his parry. Red: main.js has said TOO STRONG (rpAnswerUp). A bolt with no foe is not a disc's. */
  function discTakes(fromX, dmg, unblockable, foe, pierce) { const p = P(); ensure(p); if (!onBeat(p)) return null;
    const front = Math.sign(fromX - p.x) === p.face || fromX === p.x; if (!front || unblockable) return null; if (pierce && !foe) return null;
    stats.parries++; p.parryT = 0.22; if (api.parried) api.parried(foe);
    if (T().burnBack && foe && foe.alive) api.hurtAs('shot', foe, Math.max(1, Math.round(api.swordDmg() * 0.6)), p.x, false);
    api.SFX.parry(); api.hitstop(0.07); api.shakeCam(2, -p.face * 2); api.ringAt(p.x + p.face * 9, p.y - 13, 14, '#ffe89a', 0.28); api.sparks(p.x + p.face * 9, p.y - 13, p.face, 7); api.number(p.x, p.y - 28, 'THE DISC', '#ffe89a');
    api.noteParry(); api.trialEvent('parry'); return 'blocked'; }
  /* a missile met on the beat goes back along its line (DUSK: LIT RETURN - it burns what it finds) */
  function discSeeds() { const p = P(); if (!onBeat(p) || !api.seeds) return;
    for (const s of api.seeds) { if (s.dead || s.reflected || s.chain || s.noBlock || s.unblockable || s.owner === p) continue;
      const dx = (s.x - p.x) * p.face; if (dx < -4 || dx > DP.disc.r || Math.abs(s.y - (p.y - 12)) > DP.disc.dy) continue;
      if (api.boltHome && api.boltHome(s)) { stats.thrown++; p.parryT = 0.22; api.noteParry(); return; }
      api.reflect(s); if (T().litReturn) s.dmgMul = (s.dmgMul || 1) * 1.5; stats.thrown++; p.parryT = 0.22; api.number(p.x, p.y - 28, 'THROWN BACK', '#ffe89a'); api.noteParry(); api.trialEvent('parry'); return; } }
  /* SUNRISE (the ultimate: main.js ultRegister) */
  const sunriseReady = () => { const p = P(); ensure(p); return full(p) && !(p.spSunrise > 0); };
  function sunrise() { const p = P(); ensure(p); if (!sunriseReady()) return false; p.spRad = 0; p.spSunrise = DP.sunrise.t * (K('spdawn') ? 10 / 6 : 1); stats.sunrises++;
    api.kitPose(p, 'storm', 0.5); api.shakeCam(5); api.zoomKick(1.06, 0.3); api.ringAt(p.x, p.y - 12, 70, '#fff6c8', 0.6); api.number(p.x, p.y - 34, 'SUNRISE', '#fff6c8'); api.SFX.lightFull && api.SFX.lightFull(); api.trialEvent('meter'); p.spFallDue = K('spfallsun'); return true; }
  function sunsetFall(p) {   /* THE FALLING SUN (L50 B): SUNRISE ends in a sun dropped on the room - every foe on screen */
    const F = DP.tech.fall; api.shakeCam(8); api.zoomKick(1.1, 0.4); api.number(p.x, p.y - 34, 'THE FALLING SUN', '#ffd36b');
    for (const e of api.enemies) { if (!live(e) || Math.abs(e.x - p.x) > 170 || Math.abs(e.y - p.y) > 110) continue; const k = F.k * (big(e) ? F.boss / F.k : 1) * (undead(e) ? 2 : 1);
      api.hurtAs('shot', e, Math.max(1, Math.round(api.swordDmg() * k * api.amul('sunrise'))), p.x, false); api.ringAt(e.x, e.y - (e.h || 16) / 2, 18, '#ffd36b', 0.35); } }

  // ---- EACH FRAME ----
  /* ctx: { stunned, dodging, attacking, guardOk } */
  function update(dt, keys, ctx) { const p = P(); ensure(p); if (p.dead) { beamOff(p); return; }
    const C = keys.block, press = C && !p.spCWas; p.spCWas = !!C;
    p.spDiscRec = Math.max(0, p.spDiscRec - dt); p.spFlareRec = Math.max(0, p.spFlareRec - dt); p.spFlashT = Math.max(0, p.spFlashT - dt); p.spBeamHitT = Math.max(0, p.spBeamHitT - dt);
    const free = !ctx.stunned && !ctx.dodging && !p.plunge && !p.spBeam && ctx.guardOk !== false;
    if (press && free) {
      if (keys.down && !keys.up && (p.ground || p.swim) && !ctx.attacking) { p.spCMode = 'done'; consecrate(p); }
      else if (!keys.up && p.spDiscRec <= 0) { p.spCMode = 'disc'; p.spCHeld = 0; disc(p); }
      else p.spCMode = 'done';
    }
    if (C && p.spCMode === 'disc') { p.spCHeld += dt; if (p.spCHeld >= DP.flare.hold && p.spFlareRec <= 0 && !ctx.stunned) { p.spCMode = 'done'; flare(p); } }
    if (!C) p.spCMode = null;
    discSeeds();
    // RADIANCE: lit fills, the dark drains (SUNRISE: it cannot); NOON's QUICK DAWN, the perk, the upgrade
    const lit = lightsHere(p), fill = DP.rad.fill * (T().quickFill ? 1.25 : 1) * DP.perk.fill * (1 + 0.15 * U('uwell')), drain = DP.rad.drain * (T().glow ? 0.5 : 1) * (1 - 0.2 * U('ustill'));
    if (p.spSunrise > 0 || p.spHaloT > 0) gain(p, fill * dt); else gain(p, (lit ? fill : -drain) * dt);
    if (K('spnoon') && p.spRad < 0.25 && !lit) p.spRad = Math.min(0.25, p.spRad + drain * dt);   /* HIGH NOON: never drains under a quarter */
    if (T().ember && p.spRad < 0.15) p.spRad = 0.15;
    // the patches: mend him, burn the dead
    const onIt = onPatch(p), mendRate = DP.consecrate.mend * (T().deepMend ? 1.5 : 1) * (1 + 0.25 * U('umend')) * (K('spdawn') && p.spSunrise > 0 ? 2 : 1);
    if (onIt) mend(p, mendRate * dt);
    if (p.spSunrise > 0) mend(p, DP.sunrise.mend * (T().sunriseMend ? 2 : 1) * dt);
    if (T().zenith && full(p)) mend(p, 1 * dt);
    if (p.spMendT > 0) { p.spMendT -= dt; mend(p, p.spMendPer * dt); }
    for (const q of p.spPatches) { q.t -= dt; q.burnT -= dt; if (q.burnT <= 0) { q.burnT = 0.5;
      for (const e of api.enemies) { if (!live(e) || !undead(e)) continue; const b = api.box(e), by = tile(e.y - 1); if (by === q.y && tile(b.r - 0.01) >= q.x0 && tile(b.l) <= q.x1) api.hurtAs('shot', e, Math.max(1, Math.round(api.swordDmg() * DP.consecrate.burn * 0.5)), p.x, false); } } }
    p.spPatches = p.spPatches.filter(q => q.t > 0);
    if (K('sphalo') && api.seeds) for (const s of api.seeds) { if (s.dead || s.reflected || s.owner === p || s.unblockable) continue; const tx = tile(s.x), ty = tile(s.y);   /* HALLOWED GROUND (L30 B): a shot crossing his ground burns out */
      if (p.spPatches.some(q => q.kind === 'consecrate' && tx >= q.x0 && tx <= q.x1 && ty <= q.y && ty >= q.y - 2)) { s.dead = true; api.sparks(s.x, s.y, 1, 3); } }
    // SUNFALL: the plunge lands in a ring of light
    if (p.spWasPlunge && !p.plunge && (p.ground || p.swim)) sunfall(p);
    p.spWasPlunge = !!p.plunge;
    // the timers
    if (p.spSunrise > 0) { p.spSunrise -= dt; if (p.spSunrise <= 0 && p.spFallDue) { p.spFallDue = false; sunsetFall(p); } }
    p.spWardT = Math.max(0, p.spWardT - dt); p.spHaloT = Math.max(0, p.spHaloT - dt);
    if (p.spBeam && (ctx.stunned || ctx.dodging || !(p.ground || p.swim))) beamOff(p);
  }
  function sunfall(p) { const S = DP.sunfall; stats.sunfalls++; lay(p, S.half, T().fallPatch ? 5 : S.t, 'sunfall'); api.ringAt(p.x, p.y - 2, S.r, '#ffe89a', 0.3); p.spFlashT = Math.max(p.spFlashT, 0.4);
    for (const e of api.enemies) if (live(e) && Math.abs(e.x - p.x) < S.r && Math.abs(e.y - p.y) < 20) api.hurtAs('plunge', e, Math.max(1, Math.round(api.swordDmg() * S.k * (1 + 0.2 * U('ufall')) * (undead(e) ? 1.5 : 1))), p.x, true); }
  /* his kit's world each frame (shards, pillars, lamps, the eye) - for whoever is the priest; drawn below */
  function kitStep(dt) { const p = P(); ensure(p);
    for (const s of shards) { s.t += dt; s.x += s.vx * dt; if (s.t > DP.kit.shard.life || api.isSolid(tile(s.x), tile(s.y))) s.dead = true;
      for (const e of api.enemies) { if (s.dead || !live(e) || s.hit.has(e)) continue; const b = api.box(e); if (s.x > b.l && s.x < b.r && s.y > b.t && s.y < b.b) { s.hit.add(e); s.dead = true;
        api.hurtAs('shot', e, Math.max(1, Math.round(api.swordDmg() * DP.kit.shard.k * (undead(e) ? DP.kit.shard.dead : 1) * radMult(p) * api.amul('spShard'))), s.x - Math.sign(s.vx) * 10, false); api.sparks(s.x, s.y, -Math.sign(s.vx), 4); } } }
    shards = shards.filter(s => !s.dead);
    for (const q of pillars) { q.t -= dt; if (q.t <= 0 && !q.done) { q.done = true; api.shakeCam(3); api.ringAt(q.x, q.y - 4, 16, '#fff6c8', 0.3);
      for (const e of api.enemies) if (live(e) && Math.abs(e.x - q.x) < DP.kit.pillar.w + (e.w || 12) / 2) api.hurtAs('shot', e, Math.max(1, Math.round(api.swordDmg() * DP.kit.pillar.k * (undead(e) ? DP.kit.pillar.dead : 1) * api.amul('spPillar'))), q.x, false); } }
    pillars = pillars.filter(q => q.t > -0.3);
    for (const l of lamps) l.t -= dt; lamps = lamps.filter(l => l.t > 0);
    if (p.spEyeT > 0) { p.spEyeT -= dt; p.spEyeTick -= dt; if (p.spEyeTick <= 0) { p.spEyeTick = DP.kit.eye.every; let best = null, bd = DP.kit.eye.range; for (const e of api.enemies) if (live(e)) { const d = Math.hypot(e.x - p.x, e.y - p.y); if (d < bd) { bd = d; best = e; } }
      if (best) { api.hurtAs('shot', best, Math.max(1, Math.round(api.swordDmg() * DP.kit.eye.k * (undead(best) ? DP.kit.eye.dead : 1) * api.amul('spEye'))), p.x, false); p.spEyeLine = { x: best.x, y: best.y - (best.h || 16) / 2, t: 0.12 }; } } }
    if (p.spEyeLine) { p.spEyeLine.t -= dt; if (p.spEyeLine.t <= 0) p.spEyeLine = null; }
  }
  /* THE TEN BOUGHT ACTIVES (main.js priestKit presses them: skillPress / cdReady / spend, like everyone's) */
  const kit = {
    shard() { const p = P(); shards.push({ x: p.x + p.face * 8, y: p.y - 12, vx: p.face * DP.kit.shard.vx, t: 0, hit: new Set() }); api.kitPose(p, 'flash', 0.25); api.SFX.lightFull && api.SFX.lightFull(); },
    step() { const p = P(); lay(p, 0, 2, 'sunfall'); let d = 0; while (d < DP.kit.step.dist && !api.isSolid(tile(p.x + p.face * (d + 6)), tile(p.y - 8))) d += 4; p.x += p.face * d; p.inv = Math.max(p.inv || 0, DP.kit.step.inv); lay(p, 0, 2, 'sunfall'); api.streaks(p.x, p.y - 10, 6, ['#fff6c8', '#ffd36b'], 160); },
    lamp() { const p = P(); lamps.push({ x: p.x, y: p.y - 8, t: DP.kit.lamp.t, r: DP.kit.lamp.r }); api.kitPose(p, 'wall', 0.3); api.ringAt(p.x, p.y - 8, 20, '#ffe89a', 0.3); },
    ward() { const p = P(); p.spWardT = DP.kit.ward.t; api.ringAt(p.x, p.y - 12, 18, '#fff6c8', 0.3); },
    pillar() { const p = P(); let x = p.x + p.face * 60; let bd = DP.kit.pillar.range; for (const e of api.enemies) if (live(e) && (e.x - p.x) * p.face > 0 && Math.abs(e.x - p.x) < bd && Math.abs(e.y - p.y) < 60) { bd = Math.abs(e.x - p.x); x = e.x; }
      pillars.push({ x, y: p.y, t: DP.kit.pillar.delay }); api.kitPose(p, 'storm', 0.4); },
    mercy() { const p = P(); p.spMendT = DP.kit.mercy.t; p.spMendPer = p.maxHp * DP.kit.mercy.pct / DP.kit.mercy.t; api.ringAt(p.x, p.y - 10, 22, '#dfffb0', 0.4); },
    glare() { const p = P(), G = DP.kit.glare; api.ringAt(p.x + p.face * 30, p.y - 12, G.r * 0.6, '#ffffff', 0.25);
      for (const e of api.enemies) if (live(e) && (e.x - p.x) * p.face > -8 && Math.abs(e.x - p.x) < G.r && Math.abs(e.y - p.y) < 40) { if (big(e)) api.poiseLean(e, G.poise); else e.stagger = Math.max(e.stagger || 0, G.dazzle); } },
    wind() { const p = P(), W = DP.kit.wind; api.dust(p.x + p.face * 12, p.y, 6); api.streaks(p.x + p.face * 20, p.y - 6, 8, ['#fff6c8', '#e8c24a'], 240);
      for (const e of api.enemies) if (live(e) && (e.x - p.x) * p.face > -4 && Math.abs(e.x - p.x) < W.len && Math.abs(e.y - p.y) < 24) { api.hurtAs('shot', e, Math.max(1, Math.round(api.swordDmg() * W.k * api.amul('spWind'))), p.x, false); if (!big(e) && !api.knockSkip(e)) e.vx = p.face * W.push; } },
    halo() { const p = P(); p.spHaloT = DP.kit.halo.t; api.ringAt(p.x, p.y - 26, 10, '#ffe89a', 0.4); },
    eye() { const p = P(); p.spEyeT = DP.kit.eye.t; p.spEyeTick = 0.2; api.ringAt(p.x, p.y - 30, 10, '#ffd36b', 0.4); },
  };
  /* DAWN WARD: the next blow that reaches him in its time is turned (main.js asks before the disc) */
  function wardTakes() { const p = P(); ensure(p); if (!(p.spWardT > 0)) return null; p.spWardT = 0; api.number(p.x, p.y - 28, 'DAWN WARD', '#fff6c8'); api.ringAt(p.x, p.y - 12, 20, '#fff6c8', 0.3); api.SFX.aegis && api.SFX.aegis(); return 'blocked'; }

  // ---- DRAWN (placeholder light: the art pass owes his own beam/patch/flare sprites) ----
  function draw(g, cx, cy) { const p = P(); if (!p || p.spRad === undefined) return;
    for (const q of p.spPatches || []) { const a = Math.min(1, q.t / 0.6) * (q.kind === 'sunfall' ? 0.45 : 0.6), x = q.x0 * api.TS - cx, y = (q.y + 1) * api.TS - cy;
      g.globalAlpha = a * 0.35; g.fillStyle = '#ffe89a'; g.fillRect(x, y - 10, (q.x1 - q.x0 + 1) * api.TS, 10); g.globalAlpha = a; g.fillStyle = '#fff6c8'; g.fillRect(x, y - 2, (q.x1 - q.x0 + 1) * api.TS, 2); g.globalAlpha = 1; }
    for (const l of lamps) { g.globalAlpha = 0.25; g.fillStyle = '#ffe89a'; g.beginPath(); g.arc(l.x - cx, l.y - cy, l.r * 0.7, 0, 7); g.fill(); g.globalAlpha = 1; g.fillStyle = '#fff6c8'; g.fillRect(Math.round(l.x - cx) - 1, Math.round(l.y - cy) - 3, 3, 4); }
    if (p.spBeam && p.spBeam.line) { const ln = p.spBeam.line, w = 3 + (p.spSunrise > 0 ? 2 : 0), fl = Math.floor(api.time * 20) % 2;
      g.fillStyle = fl ? '#fff2b0' : '#ffe89a'; if (ln.up) g.fillRect(Math.round(ln.x1 - cx - w / 2), Math.round(ln.y1 - cy), w, Math.round(ln.y0 - ln.y1)); else g.fillRect(Math.round(Math.min(ln.x0, ln.x1) - cx), Math.round(ln.y0 - cy - w / 2), Math.round(Math.abs(ln.x1 - ln.x0)), w);
      g.fillStyle = '#ffffff'; if (ln.up) g.fillRect(Math.round(ln.x1 - cx), Math.round(ln.y1 - cy), 1, Math.round(ln.y0 - ln.y1)); else g.fillRect(Math.round(Math.min(ln.x0, ln.x1) - cx), Math.round(ln.y0 - cy), Math.round(Math.abs(ln.x1 - ln.x0)), 1); }
    for (const s of shards) { g.fillStyle = '#fff6c8'; g.fillRect(Math.round(s.x - cx) - 2, Math.round(s.y - cy) - 1, 5, 3); g.fillStyle = '#ffd36b'; g.fillRect(Math.round(s.x - cx) - 1, Math.round(s.y - cy), 3, 1); }
    for (const q of pillars) { const k = q.t > 0 ? 0.25 : 0.8; g.globalAlpha = k; g.fillStyle = q.t > 0 ? '#ffe89a' : '#fff6c8'; g.fillRect(Math.round(q.x - cx) - (q.t > 0 ? 1 : 6), 0, q.t > 0 ? 2 : 12, Math.round(q.y - cy)); g.globalAlpha = 1; }
    if (p.spEyeT > 0) { const ex = Math.round(p.x - cx), ey = Math.round(p.y - 34 - cy); g.fillStyle = '#ffd36b'; g.fillRect(ex - 2, ey - 2, 5, 5); g.fillStyle = '#fff6c8'; g.fillRect(ex - 1, ey - 1, 3, 3);
      if (p.spEyeLine) { g.strokeStyle = '#fff2b0'; g.lineWidth = 1; g.beginPath(); g.moveTo(ex + 0.5, ey + 0.5); g.lineTo(Math.round(p.spEyeLine.x - cx) + 0.5, Math.round(p.spEyeLine.y - cy) + 0.5); g.stroke(); } }
    if (p.spSunrise > 0) { g.globalAlpha = 0.08 + 0.03 * Math.sin(api.time * 4); g.fillStyle = '#fff2b0'; g.fillRect(0, 0, 9999, 9999); g.globalAlpha = 1; }
  }
  /* what the HUD bar shows */
  const hud = () => { const p = P(); ensure(p); return { rad: p.spRad, full: full(p), sunrise: p.spSunrise > 0, lit: lightsHere(p), mul: radMult(p) }; };
  function clear() { shards = []; pillars = []; lamps = []; const p = P(); if (p) { ensure(p); p.spPatches = []; p.spBeam = null; p.spSunrise = 0; p.spEyeT = 0; p.spLocks = new Map(); } }
  return { DP, stats, update, charge, kitStep, kit, draw, hud, clear, thirdFlash, blowMul, radMult: () => radMult(P()), rad: () => rad(P()), onBeat: () => onBeat(P()),
    discTakes, flareTakes, wardTakes, flareAge: () => flareAge(P()), sunriseReady, sunrise, beaming: () => !!(P() && P().spBeam), beamLine: () => beamLine(P()),
    patches: () => (P().spPatches || []).slice(), lightsHere: () => lightsHere(P()), ensure: () => ensure(P()) };
}
