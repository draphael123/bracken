import * as CH from './chill.js';   /* the shared CHILL status (claude/rimebinder): her frost is its first source */
// src/rimebinder.js - THE RIMEBINDER'S KIT (claude/rimebinder 11-05, scratch/brief-rimebinder-1023.md; Daniel 10-23 all recs, 11-05 'code-only lanes').
// A frost NECROMANCER, the late-game hero unlocked on the frost/fire volcano arc (beat her on the hidden frost split path, then silver: RIME_SHIPS in
// src/hero-roster.js is false until that arc ships). She REPLACES THE FROST MAGE: the cold theme is kept, the playstyle is the empty summoner niche.
// CORE LOOP - FREEZE, THEN RAISE: her frost CHILLS (src/chill.js); a weak foe that fills its chill FREEZES solid, an elite or a boss only chills.
// A foe that dies CHILLED leaves a RIME CORPSE (its own body, frozen where it lies, a glint on it, RIME.corpse.life s). Then she chooses:
//   UP+C     RAISE the nearest corpse: a THRALL - that foe, ghost blue-white and crusted with ice, fighting for her with its own kind of blow (a
//            blade walks in and strikes; a shooter stands and looses shards). WEAKER than it was alive (RIME.thrall: ~50% of a blow, ~40% of its
//            health), CAP 2 (a third melts the oldest), gone in RIME.thrall.life s. A raise costs a third of THE RIME BAR.
//   DOWN+C   SHATTER the nearest corpse (or one of her own thralls): an ice-shard burst that hurts and CHILLS everything round it. Free.
//   UP+C AT A FULL RIME BAR   THE LONG WINTER (her ultimate, src/ultimate.js): a blizzard round her - every foe in it chilled to the full (the weak
//            frozen), struck, and every corpse in it raised at full strength (still CAP 2).
// THE REST OF HER KIT (the approved Frost Mage pieces: staff melee + bolt, her own bar, an ice-wall guard):
//   TAP X    THE FROST BOLT: flat and quick, it chills. Point-blank (a foe at the staff's length ahead) X is THE STAFF STRIKE instead (the
//            ordinary swing: main.js attackBox0); DOWN+X on her feet is the low sweep; UP+X the shared rising blow; DOWN+X in the air her plunge.
//   HOLD X   THE RIME LANCE on the shared 3-tier charge: T1 a lance, T2 a PIERCING lance (through the line), T3 a piercing lance that RIMES what it
//            kills - a corpse even from a warm foe. Under T1 it is a bolt.
//   C        THE ICE WALL: held, a wall of ice in front of her - a yellow blow and a shot from the front stop on it (wind, as a block); she is
//            planted behind it; a RED blow and a bolt go through. TAPPED as a yellow blow lands it is HER PARRY: the attacker is FROZEN (a weak
//            one) or deeply chilled (an elite, a boss - never frozen: B15) and reels (the shared riposte, src/riposte.js).
//   DODGE    THE MIST STEP: the roll, with a cloud of frost mist left where she stood - what walks through it is chilled.
//   PLUNGE   FROSTFALL: the shared plunge, and a ring of cold where she lands.
//   THE RIME BAR (her own meter, 0..100): a chilled kill (a corpse made) fills it most, a freeze a little, a shatter a little; a raise spends a
//            third, the ultimate all of it.
// BALANCE GUARDS (brief): thrall cap 2, short life, thralls are NOT party seats and never stand in a boss opening's way (they have no body foes
//   collide with, they do not parry or stagger, a boss takes their chip through his resist floor like any blow); bosses only chill.
// Every field lives ON THE HERO (p.rmBar, p.rmBolts, ...) or carries its owner (a thrall's o), so a co-op partner carries her own.
// main.js owns the world, the input and the tal() reads (rmTal); this module owns her shots, the wall, the corpses, the thralls and the bar.
export const RIME = {
  hp: 92, dmg: 13, run: 0.98,                          /* frail like the Pyromancer (88), a staff a little lighter than the Geomancer's */
  staff: { reach: 22, dmg: 1.0 },                      /* THE STAFF STRIKE: point-blank (a foe's near edge within reach ahead) X is the swing */
  bolt: { vx: 300, range: 170, dmg: 0.55, chill: 0.36, st: 5, cd: 0.34, quick: 0.65 },   /* THE FROST BOLT: three on a weak foe freeze it; quick: the cd with QUICK FROST */
  lance: { wind: 0.5, at: [0.5, 0.95, 1.45], hold: 0.8, vx: [300, 380, 440, 480], range: [170, 200, 240, 260], dmg: [0.7, 1.5, 1.8, 2.0],
    chill: [0.36, 0.5, 0.6, 0.7], pierce: [false, false, true, true], st: [5, 8, 11, 14], cols: ['#dff4ff', '#bfe6f5', '#8fd0f0', '#ffffff'],
    names: ['', 'RIME LANCE', 'PIERCING LANCE', 'RIME-MAKER'] },   /* at: s held past HEAVY_START each tier arrives; hold: s at T3 before it goes by itself */
  guard: { hold: 0.14, proj: 0.3, melee: 0.8, drain: 0.7, reach: 12 },   /* THE ICE WALL: s held before it stands; x the block's price; wind a second */
  parry: { freeze: 1.4, eliteChill: 0.6, bossChill: 0.35, beat: 1 },     /* THE PARRY: s a weak foe is frozen; the chill an elite / a boss takes */
  corpse: { life: 12, reach: 76 },                     /* a RIME CORPSE lies life s; RAISE and SHATTER find one within reach px */
  thrall: { cap: 2, life: 10, hp: 0.4, k: 0.5, reach: 16, cd: 0.9, rangedCd: 1.4, speed: 58, sight: 200, shotVx: 240, shotRange: 180 },
  shatter: { r: 44, k: 1.2, chill: 0.6, cd: 0.6, st: 6, frozenMul: 1.25 },
  bar: { kill: 22, freeze: 6, shatter: 5, raise: 34, max: 100 },
  ult: { r: 110, k: 1.6, freeze: 2.5, life: 16, k2: 0.75 },
  mist: { r: 26, life: 1.4, chill: 0.5, wide: 1.4 },  /* THE MIST STEP's cloud: px; s; chill a second to what stands in it */
  plunge: { r: 30, chill: 0.4 },
  perk: { bar: 1, linger: 1 },                         /* LEVELING2's hero perks (DEEP WINTER, LONG RIME): main.js applyUpgrades sets these; 1 = none */
  commit: { light: 0.096, third: 0.132, up: 0.096, heavy: 0.168, roll: 22, rollT: 0.32 },
  /* HER NINE BOUGHT ACTIVES (L1..L20, the starters' ladder): k = swordDmg x k x amul (src/skill-k.js's law) */
  kit: { hail: { n: 3, spread: 70, k: 0.5 }, grave: { w: 48, t: 4, chill: 0.6 }, nova: { r: 52, k: 0.6, chill: 0.7 }, call: { r: 140 },
    harvest: { r: 120 }, shroud: { t: 4, cut: 0.25, chill: 0.4 }, keeping: { add: 6 }, glacier: { k: 2.6, range: 320, chill: 1.0 }, night: { t: 8 } },
};
/* WHO SHOOTS (a thrall of one of these stands and looses shards; any other walks in with its blade). Types by name, and any foe that says so */
export const RANGED_T = new Set(['archer', 'javelin', 'spit', 'gobmage', 'shaman', 'bonearcher', 'slinger', 'crossbow', 'musket', 'gunner', 'caster', 'spitcap', 'mage',
  'scout', 'harpy', 'thrower', 'bombardier', 'sapper', 'hurler', 'lanternshade']);
export const isRanged = e => !!e && (RANGED_T.has(e.t) || RANGED_T.has(e.cnSkin) || !!e.ranged || !!e.shooter);
/* a THRALL's numbers from the foe it was (pure: tools/rimebinder.mjs) */
export function thrallStats(hp0, ranged, full = false, T = {}) {
  const th = RIME.thrall, hp = Math.max(4, Math.round((hp0 || 10) * (full ? 1 : th.hp) * (T.thick ? 1.5 : 1)));
  return { hp, k: (full ? RIME.ult.k2 : th.k) * (T.hungry ? 1.2 : 1), life: (full ? RIME.ult.life : th.life) + (T.march ? 4 : 0), ranged: !!ranged };
}
/* the lance's tier from how long X has been held past HEAVY_START (s): 0 under T1 (a bolt), 1..3 */
export function lanceTier(charge, quick = 1) { const a = RIME.lance.at; return charge >= a[2] * quick ? 3 : charge >= a[1] * quick ? 2 : charge >= a[0] * quick ? 1 : 0; }
export const raiseCost = T => Math.round(RIME.bar.raise * (T && T.crown ? 0.75 : 1));
/* may a dead foe leave a RIME CORPSE? chilled (or a RIME-MAKER mark, or THE LONG NIGHT) - and never a boss, a mini, a harmless or a summoned-in-a-wave thing */
export function rimeable(e, now = 0, night = false) {
  if (!e || CH.isBossLike(e) || e.harmless || e.t === 'dummy') return false;
  return night || CH.chilled(e) || (e.rmMarkT || 0) > now;
}

export function makeRimebinder(api) {
  const P = () => api.P, T = () => api.tal(), now = () => api.time;
  const stats = { bolts: 0, lances: [0, 0, 0, 0], freezes: 0, corpses: 0, raises: 0, shatters: 0, parries: 0, tooStrong: 0, ults: 0, thrallHits: 0, guards: 0, mists: 0 };
  let corpses = [], thralls = [], mists = [], shards = [], fx = [];   /* the world's: each carries its owner (o) */
  const ensure = p => { if (p.rmBar === undefined) { p.rmBar = 0; p.rmBolts = []; p.rmCd = 0; p.rmGuard = false; p.rmHeld = 0; } };
  const mine = (o, p) => o === p;
  const ofP = (arr, p) => arr.filter(t => mine(t.o, p));
  const dmgOf = (k, id) => Math.max(1, Math.round(api.swordDmg() * k * (id ? api.amul(id) : 1)));
  const fill = (p, n) => { const m = RIME.bar.max; p.rmBar = Math.min(m, (p.rmBar || 0) + n * RIME.perk.bar * (T().grave ? 1.25 : 1) * (1 + 0.1 * (T().barUp || 0))); };   /* (GRAVE HUNGER, the L25+ upgrade) */
  const chillAmt = a => a * (T().deep ? 1.2 : 1);
  /* chill a foe for her: freezes are counted, the bar takes its share, a BRITTLE foe is told */
  function chillFoe(p, e, a) { const r = CH.chill(e, chillAmt(a), p, now());
    if (r === 'frozen') { stats.freezes++; fill(p, RIME.bar.freeze); if (T().absolute) { e.frozen *= 1.5; e.stagger = Math.max(e.stagger || 0, e.frozen); }
      api.number(e.x, e.y - (e.h || 14) - 6, 'FROZEN', '#bfe6f5'); api.SFX.rmFreeze ? api.SFX.rmFreeze() : api.SFX.clank(); api.burst(e.x, e.y - (e.h || 14) / 2, 8, ['#bfe6f5', '#ffffff'], 40, 0.4, 0, 1); }
    return r; }
  const brittle = e => (e.frozen || 0) > 0 && T().brittle ? 1.2 : 1;
  /* ---------------- X: THE BOLT, THE LANCE ---------------- */
  const front = (p, e, reach) => { const d = (e.x - p.x) * p.face, half = (e.w || 12) / 2; return d > -half && d - half < reach && Math.abs((e.y - (e.h || 14) / 2) - (p.y - 12)) < 22; };
  const pointBlank = p => api.enemies.some(e => e.alive && !e.harmless && !(e.gone > 0) && front(p, e, RIME.staff.reach));
  function shoot(p, tier, k) { const L = RIME.lance, t = Math.max(0, Math.min(3, tier | 0));
    const b = { x: p.x + p.face * 8, y: p.y - 15, vx: p.face * L.vx[t], x0: p.x, range: L.range[t] * (t && T().longLance ? 1.2 : 1), tier: t, pierce: L.pierce[t], hit: new Set(), life: 2,
      dmg: dmgOf(k != null ? k : t ? L.dmg[t] : RIME.bolt.dmg, null), chill: (t ? L.chill[t] : RIME.bolt.chill) * (t ? 1 : 1 + 0.15 * (T().boltUp || 0)), mark: t === 3, o: p };   /* (COLDER BOLT) */
    p.rmBolts.push(b); return b; }
  function boltShot(p) { if (!api.spend(RIME.bolt.st)) { api.tired(); return false; }
    shoot(p, 0); stats.bolts++; p.rmCd = RIME.bolt.cd * (T().quickBolt ? RIME.bolt.quick : 1); api.kitPose(p, 'rmBolt', 0.2);
    api.SFX.rmBolt ? api.SFX.rmBolt(0) : api.SFX.ui(); api.noteVerb && api.noteVerb('shot'); return true; }
  /* X pressed (main.js, before the swing): 'nock' (a bolt when it is let go before the charge begins; held: the lance), 'eat', or false (the swing) */
  function press(p, aim) { ensure(p);
    if (p.rmCd > 0) return 'eat';
    const air = !p.ground && !p.swim;
    if (aim.low || aim.up) return false;                    /* the sweep, the rising blow, the plunge: the shared ones */
    if (p.dash > 0) return false;                           /* X early in the mist step: the staff's dash strike */
    if (pointBlank(p)) return false;                        /* TOO CLOSE: THE STAFF STRIKE */
    if (api.finishNear && api.finishNear()) return false;   /* a broken foe in reach is finished with the staff (src/finishers.js) */
    p.rmNock = { t: 0, air }; return 'nock'; }
  function nockStep(p, dt, keyAtk) { const n = p.rmNock; if (!n) return; n.t += dt;
    if (p.charge > 0) { p.rmNock = null; return; }          /* the charge has begun: the lance (fireHeavy -> release) */
    if (p.dead || p.hurt > 0) { p.rmNock = null; return; }
    if (!keyAtk) { p.rmNock = null; boltShot(p); } }
  /* THE LANCE LET GO (main.js fireHeavy): tier 0 is a bolt */
  function release(p, tier) { ensure(p); const t = Math.max(0, Math.min(3, tier | 0)), st = RIME.lance.st[t] * (T().iceVein ? 0.85 : 1);
    if (!api.spend(st)) { api.tired(); return false; }
    shoot(p, t); stats.lances[t]++; p.rmCd = 0.22; p.rmNock = null; api.kitPose(p, t ? 'rmLance' : 'rmBolt', t ? 0.3 : 0.2);
    if (t) { api.ringAt(p.x + p.face * 10, p.y - 15, 6 + 3 * t, RIME.lance.cols[t], 0.3); api.shakeCam(0.8 + 0.4 * t, -p.face); }
    api.SFX.rmBolt ? api.SFX.rmBolt(t) : api.SFX.ui(); return true; }
  function boltStep(p, dt) {
    for (const b of p.rmBolts) { b.life -= dt; b.x += b.vx * dt; b.y += (b.vy || 0) * dt;
      if (Math.abs(b.x - b.x0) > b.range || api.isSolid(Math.floor(b.x / api.TS), Math.floor(b.y / api.TS))) { b.life = 0; puff(b.x, b.y, b.tier); continue; }
      for (const e of api.enemies) { if (!e.alive || e.harmless || e.gone > 0 || b.hit.has(e)) continue;
        if (Math.abs(e.x - b.x) < (e.w || 12) / 2 + 4 && b.y > e.y - (e.h || 14) - 4 && b.y < e.y + 4) { b.hit.add(e);
          if (b.mark) e.rmMarkT = now() + 0.5;            /* RIME-MAKER: a kill off this lance leaves a corpse, warm or not */
          chillFoe(p, e, b.chill); api.hurtAs('shot', e, Math.round(b.dmg * brittle(e)), b.x - Math.sign(b.vx) * 10, false);
          api.sparks(b.x, b.y, Math.sign(b.vx), 3 + b.tier); api.burst(b.x, b.y, 4 + 2 * b.tier, ['#bfe6f5', '#ffffff'], 50, 0.3, 0, 1);
          if (!e.alive && b.tier >= 2 && T().splinter) splinter(p, e.x, e.y - 8);
          if (!b.pierce) { b.life = 0; break; } } } }
    for (const b of p.rmBolts) if (b.life <= 0 && b.tier >= 2 && T().sleet && !b.sleet) { b.sleet = true; const x0 = b.x0 + Math.sign(b.vx) * 10, half = Math.abs(b.x - x0) / 2;   /* SLEET (L30 B): a strip of sleet under the lance's flight, 3 s */
      if (half > 8) mists.push({ o: p, x: (x0 + b.x) / 2, y: b.y + 11, r: half, life: 3, max: 3, through: new Set(), floor: true }); }
    p.rmBolts = p.rmBolts.filter(b => b.life > 0); }
  function puff(x, y, t) { api.burst(x, y, 3 + t, ['#dff4ff', '#8fd0f0'], 30, 0.25, 0, 1); }
  function splinter(p, x, y) { for (const d of [-1, 0, 1]) shards.push({ x, y, vx: d * 160 || 0.01, vy: d ? -60 : -180, life: 0.5, o: p, dmg: dmgOf(0.3), hit: new Set(), grav: 500, chill: 0.3 }); }
  /* ---------------- C: THE ICE WALL AND THE PARRY ---------------- */
  const beatLen = () => api.tap() * RIME.parry.beat * (T().wide ? 4 / 3 : 1) + 0.03 * (T().beatUp || 0);   /* (COLD BEAT, the upgrade) */
  const onBeat = p => p.rmTapAt !== undefined && api.time - p.rmTapAt <= beatLen() + 1e-6 && !(p.rmTapSpent);
  function guardStep(p, dt, keys, ctx) {
    const cDown = !!keys.block && !keys.up && !keys.down;
    if (cDown && !p.rmCWas) { p.rmTapAt = api.time; p.rmTapSpent = false; }   /* THE TAP: the parry's beat opens on the press */
    p.rmCWas = cDown;
    p.rmHeld = cDown && !p.dead ? (p.rmHeld || 0) + dt : 0;
    const want = !p.dead && p.rmHeld >= RIME.guard.hold && !ctx.stunned && !ctx.dodging && !ctx.attacking && ctx.guardOk !== false && !p.plunge && !(p.charge > 0) && !p.rmNock
      && !(p.drinkT > 0) && (p.ground || p.swim) && !(p.guardTired > 0) && (p.st || 0) > 0;
    if (want && !p.rmGuard) { p.rmGuard = true; p.rmGuardT = 0; stats.guards++; api.SFX.rmWall ? api.SFX.rmWall() : api.SFX.clank(); api.ringAt(p.x + p.face * 10, p.y - 12, 10, '#bfe6f5', 0.2); }
    else if (!want && p.rmGuard) { p.rmGuard = false; p.rmGuardT = 0; api.burst(p.x + p.face * 10, p.y - 10, 5, ['#bfe6f5', '#ffffff'], 40, 0.3, 200, 1); }
    if (!p.rmGuard) return;
    p.rmGuardT += dt; p.st -= api.ST.hold * RIME.guard.drain * (T().hard ? 0.75 : 1) * dt; p.stDelay = api.ST.delay;
    if (!T().walkWall) p.vx = 0;
    if (p.st <= 0) { p.st = 0; p.rmGuard = false; p.guardTired = 0.8; p.stFlash = 0.5; api.SFX.guardBreak(); api.number(p.x, p.y - 22, 'THE WALL BREAKS', '#ffd36b'); } }
  /* A BLOW LANDING ON HER (main.js damagePlayer0): 'blocked' or null. The parry first (the tap's beat, wall up or not), then the wall itself */
  function guardTakes(fromX, dmg, unblockable, foe, pierce, proj) { const p = P(); ensure(p);
    const fr = Math.sign(fromX - p.x) === p.face || fromX === p.x;
    if (fr && onBeat(p)) {
      if (unblockable) { stats.tooStrong++; return null; }   /* (main.js has said TOO STRONG) */
      if (pierce && !foe) return null;                       /* a bolt is not turned by a parry: only by a raised shield */
      p.rmTapSpent = true; stats.parries++; p.parryT = 0.22; if (api.parried) api.parried(foe);
      if (foe && foe.alive) { if (CH.isWeakFoe(foe)) { foe.frozen = Math.max(foe.frozen || 0, RIME.parry.freeze); foe.stagger = Math.max(foe.stagger || 0, RIME.parry.freeze); foe.vx = 0; CH.chill(foe, 0.3, p, now()); }
        else chillFoe(p, foe, CH.isBossLike(foe) ? RIME.parry.bossChill : RIME.parry.eliteChill); }
      if (T().sentinel) fill(p, 20);
      api.SFX.parry(); api.hitstop(0.08); api.shakeCam(3, -p.face * 2); api.zoomKick(1.04, 0.16);
      api.ringAt(p.x + p.face * 10, p.y - 12, 16, '#bfe6f5', 0.3); api.burst(p.x + p.face * 10, p.y - 12, 10, ['#bfe6f5', '#ffffff'], 70, 0.35, 0, 1);
      api.number(p.x, p.y - 28, 'RIME PARRY', '#bfe6f5'); api.noteParry(); api.trialEvent('parry'); return 'blocked'; }
    if (!p.rmGuard || !fr) return null;
    if (unblockable || (pierce && !proj)) return null;      /* a RED blow and a bolt go through the wall */
    const cost = Math.max(2, Math.round(api.blockCost(dmg) * (proj ? RIME.guard.proj : RIME.guard.melee) * (T().hard ? 0.75 : 1) * [1, 0.85, 0.75][T().wallUp || 0]));   /* (THICK WALL) */
    p.st -= cost; p.stDelay = api.ST.delay; api.SFX.rmWall ? api.SFX.rmWall(true) : api.SFX.clank();
    api.burst(p.x + p.face * 11, p.y - 12, 6, ['#bfe6f5', '#ffffff'], 60, 0.3, 200, 1);
    if (T().rime && foe && foe.alive && !proj) chillFoe(p, foe, 0.35);
    if (p.st <= 0) { p.st = 0; p.rmGuard = false; p.guardTired = 1.2; p.stFlash = 0.5; api.SFX.guardBreak(); api.number(p.x, p.y - 22, 'THE WALL BREAKS', '#ffd36b'); return null; }
    api.trialEvent('block'); return 'blocked'; }
  /* ---------------- THE CORPSES ---------------- */
  /* main.js spawnCorpse, after the corpse is made: is it a RIME CORPSE? (it was chilled by a Rimebinder, or her RIME-MAKER lance marked it) */
  function onCorpse(c, e) {
    const by = e.chillBy && api.heroOf(e.chillBy) === 'rimebinder' ? e.chillBy : (e.rmMarkT || 0) > now() ? (e.chillBy || P()) : null;
    const night = !!(by && (by.rmNightT || 0) > now());
    if (!by || !rimeable(e, now(), night)) return false;
    const life = RIME.corpse.life * RIME.perk.linger * (by === P() && T().linger ? 1.5 : 1);
    Object.assign(c, { vx: 0, vy: Math.max(0, c.vy || 0), spin: 0, rot: 0, life, max: life, rime: true, rimeHp0: e.hp0 || e.maxHpBase || 10, rimeRanged: isRanged(e), rimeBy: by, rimeT: e.t, rimeW: e.w || 12, rimeH: e.h || 14 });
    corpses.push(c); stats.corpses++; fill(by, RIME.bar.kill);
    if ((by.rmCourtT || 0) > now()) { raiseCorpse(by, c, true); return true; }   /* THE FROZEN COURT (L50 A): what THE LONG WINTER fells stands up whole */
    api.number(e.x, e.y - (e.h || 14) - 4, 'RIME', '#dff4ff'); api.SFX.rmCorpse ? api.SFX.rmCorpse() : api.SFX.clank(); return true; }
  const liveCorpses = () => { const all = api.allCorpses ? api.allCorpses() : null; corpses = corpses.filter(c => c.rime && c.life > 0.05 && (!all || all.includes(c))); return corpses; };   /* (a level that clears main.js's corpses clears hers) */
  const near = (p, list, r) => { let best = null, bd = r; for (const c of list) { const d = Math.hypot(c.x - p.x, (c.y - p.y) * 1.5); if (d <= bd) { bd = d; best = c; } } return best; };
  const corpseNear = (p, r = RIME.corpse.reach) => near(p, liveCorpses(), r);
  const consume = c => { c.rime = false; c.life = 0.01; c.max = Math.max(c.max, 0.01); };
  /* ---------------- UP+C: RAISE ---------------- */
  function raiseCorpse(p, c, full) { const T0 = T(), s = thrallStats(c.rimeHp0, c.rimeRanged, full, T0);
    s.k *= 1 + 0.15 * (T0.thrallUp || 0); s.life += 2 * (T0.lifeUp || 0);   /* (HARDER THRALLS, DEEP FREEZE: the upgrades) */
    const th = { o: p, x: c.x, y: c.y, vx: 0, vy: 0, face: p.face, t: c.rimeT, set: c.set || null, ct: c.t, frame0: 0, w: c.rimeW, h: c.rimeH, ...s, max: s.life, hpMax: s.hp, cd: 0.5, anim: 0, rise: 0.4, ground: false, full };
    consume(c); const own = ofP(thralls, p);
    if (own.length >= RIME.thrall.cap) { const old = own.sort((a, b) => a.life - b.life)[0]; melt(old, true); }
    thralls.push(th); stats.raises++; api.kitPose(p, 'rmRaise', 0.35);
    api.ringAt(th.x, th.y - 8, 16, '#bfe6f5', 0.35); api.burst(th.x, th.y - 6, 12, ['#bfe6f5', '#ffffff', '#8fd0f0'], 60, 0.6, -40, 1);
    api.number(th.x, th.y - th.h - 8, full ? 'RISEN WHOLE' : 'RISE', '#dff4ff'); api.SFX.rmRaise ? api.SFX.rmRaise() : api.SFX.ui(); return th; }
  function raise(p) { ensure(p); const T0 = T(), cost = raiseCost(T0);
    if ((p.rmBar || 0) < cost) { say(p, 'THE RIME BAR: A THIRD TO RAISE'); return false; }
    const c = corpseNear(p);
    if (!c && T().bound) { const th = near(p, ofP(thralls, p), RIME.corpse.reach); if (th) { p.rmBar -= cost; th.life = Math.min(th.max + 10, th.life + 10); th.hp = th.hpMax; api.ringAt(th.x, th.y - 8, 14, '#ffffff', 0.35); api.number(th.x, th.y - th.h - 8, 'BOUND IN ICE', '#dff4ff'); return true; } }   /* BOUND IN ICE (L40 A) */
    if (!c) { say(p, 'NO RIME CORPSE NEAR'); api.teach && api.teach('raise'); return false; }
    p.rmBar -= cost; raiseCorpse(p, c, false); api.trialEvent('raise'); return true; }
  function say(p, s) { if (!p.rmSaid || api.time - p.rmSaid > 1.2) { p.rmSaid = api.time; api.number(p.x, p.y - 26, s, '#9aa39a'); } }
  /* ---------------- DOWN+C: SHATTER ---------------- */
  function burstAt(p, x, y, k, chillA, r0) { const r = r0 * (1 + 0.15 * (T().shatterUp || 0)) * (T().hoarfrost ? 1.2 : 1);   /* (WIDE SHATTER; HOARFROST L35: the shards fly further) */ api.shakeCam(3, 0); api.hitstop(0.05); api.ringAt(x, y - 8, r, '#bfe6f5', 0.32); api.burst(x, y - 8, 18, ['#ffffff', '#bfe6f5', '#8fd0f0'], 140, 0.5, 300, 2);
    api.SFX.rmShatter ? api.SFX.rmShatter() : api.SFX.crack();
    for (const e of api.enemies) { if (!e.alive || e.harmless || e.gone > 0) continue; if (Math.hypot(e.x - x, (e.y - (e.h || 14) / 2) - (y - 8)) > r + (e.w || 12) / 2) continue;
      const fz = (e.frozen || 0) > 0; chillFoe(p, e, chillA); if (T().hoarfrost) e.rmMarkT = now() + 0.3;   /* HOARFROST (L35): what the shards kill lies as a new rime corpse */ api.hurtAs('throw', e, Math.round(dmgOf(k, 'rmShatter') * (fz ? RIME.shatter.frozenMul : 1) * brittle(e)), x, false); } }
  function shatter(p) { ensure(p); if ((p.rmShatCd || 0) > 0) return false;
    const own = ofP(thralls, p), c = corpseNear(p), t = near(p, own, RIME.corpse.reach);
    const tgt = c && (!t || Math.hypot(c.x - p.x, c.y - p.y) <= Math.hypot(t.x - p.x, t.y - p.y)) ? c : t;
    if (!tgt) { say(p, 'NOTHING TO SHATTER'); return false; }
    if (!api.spend(RIME.shatter.st)) { api.tired(); return false; }
    p.rmShatCd = RIME.shatter.cd; stats.shatters++; fill(p, RIME.bar.shatter); api.kitPose(p, 'rmShatter', 0.25);
    if (tgt === c) consume(c); else { tgt.life = 0; tgt.shattered = true; }
    if (tgt !== c && T().graveCharge) { burstAt(p, tgt.x, tgt.y, 2.2, 1.0, RIME.shatter.r * 2); api.number(tgt.x, tgt.y - 30, 'GRAVE CHARGE', '#ffffff'); api.trialEvent('shatter'); return true; }   /* GRAVE CHARGE (L40 B): her own thrall goes up twice as wide and hard */
    burstAt(p, tgt.x, tgt.y, RIME.shatter.k, RIME.shatter.chill, RIME.shatter.r); api.number(tgt.x, tgt.y - 24, 'SHATTER', '#ffffff'); api.trialEvent('shatter'); return true; }
  /* ---------------- THE ULTIMATE: THE LONG WINTER ---------------- */
  const ultReady = () => { const p = P(); ensure(p); return (p.rmBar || 0) >= RIME.bar.max - 1e-6; };
  function longWinter() { const p = P(); ensure(p); if (!ultReady()) return false; const U = RIME.ult;
    p.rmBar = 0; stats.ults++; if (T().court) p.rmCourtT = now() + 0.3; api.kitPose(p, 'rmUlt', 0.5); api.zoomKick(1.08, 0.3); api.shakeCam(6, 0); api.hitstop(0.1);
    api.number(p.x, p.y - 34, 'THE LONG WINTER', '#ffffff'); api.SFX.rmUlt ? api.SFX.rmUlt() : api.SFX.crack();
    for (let i = 0; i < 3; i++) api.ringAt(p.x, p.y - 10, U.r * (0.4 + 0.3 * i), '#bfe6f5', 0.3 + 0.12 * i);
    for (let i = 0; i < 40; i++) api.parts.push({ x: p.x + (Math.random() - 0.5) * U.r * 2, y: p.y - 60 - Math.random() * 40, vx: -40 + Math.random() * 20, vy: 60 + Math.random() * 60, life: 1, max: 1, col: Math.random() < 0.5 ? '#ffffff' : '#bfe6f5', size: 1, grav: 0 });
    for (const e of api.enemies) { if (!e.alive || e.harmless || e.gone > 0 || Math.abs(e.x - p.x) > U.r || Math.abs(e.y - p.y) > U.r * 0.6) continue;
      chillFoe(p, e, 1.0); if (CH.isWeakFoe(e) && (e.frozen || 0) > 0) { e.frozen = Math.max(e.frozen, U.freeze); e.stagger = Math.max(e.stagger || 0, U.freeze); }
      api.hurtAs('heavy', e, Math.round(dmgOf(U.k, null) * brittle(e)), p.x, false); }
    const cs = liveCorpses().filter(c => Math.abs(c.x - p.x) <= U.r).sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x)).slice(0, RIME.thrall.cap);
    for (const c of cs) raiseCorpse(p, c, true);
    p.rmBar = 0;   /* (what it froze and felled does not pay the bar back: the next winter is earned) */
    api.trialEvent('meter'); return true; }
  /* ---------------- THE THRALLS ---------------- */
  function melt(th, quiet) { th.life = 0; if (!quiet) api.burst(th.x, th.y - 8, 8, ['#bfe6f5', '#ffffff'], 40, 0.5, 200, 1);
    if (!th.shattered && th.o === P() && T().lastBreath) burstAt(th.o, th.x, th.y, RIME.shatter.k * 0.5, RIME.shatter.chill * 0.5, RIME.shatter.r * 0.8); }
  function thrallStep(p, dt) {
    for (const th of thralls) { if (!mine(th.o, p)) continue; th.life -= dt; th.anim += dt; th.cd -= dt; th.rise = Math.max(0, th.rise - dt);
      if (th.life <= 0) { if (!th.shattered) melt(th); continue; }
      if (th.hp <= 0) { melt(th); continue; }
      th.vy += 900 * dt; th.y += th.vy * dt; const ty = Math.floor((th.y + 1) / api.TS), tx = Math.floor(th.x / api.TS);
      if (api.isSolid(tx, ty) || (api.isOneWay(api.tileAt(tx, ty)) && th.vy > 0)) { th.y = ty * api.TS; th.vy = 0; th.ground = true; } else th.ground = false;
      if (th.rise > 0) continue;
      let tgt = null, td = RIME.thrall.sight;
      for (const e of api.enemies) { if (!e.alive || e.harmless || e.gone > 0) continue; const d = Math.hypot(e.x - th.x, e.y - th.y); if (d < td) { td = d; tgt = e; } }
      th.moving = false;
      if (!tgt) { const dx = p.x - p.face * 18 - th.x; if (Math.abs(dx) > 20) { th.face = Math.sign(dx); step(th, th.face * RIME.thrall.speed * dt); th.moving = true; } continue; }   /* nothing to fight: it keeps to her heel */
      th.face = Math.sign(tgt.x - th.x) || th.face; const gap = Math.abs(tgt.x - th.x) - (tgt.w || 12) / 2;
      if (th.ranged) { if (gap > RIME.thrall.shotRange * 0.8) { step(th, th.face * RIME.thrall.speed * dt); th.moving = true; }
        else if (th.cd <= 0) { th.cd = RIME.thrall.rangedCd; shards.push({ x: th.x + th.face * 6, y: th.y - th.h * 0.6, vx: th.face * RIME.thrall.shotVx, vy: 0, grav: 0, life: RIME.thrall.shotRange / RIME.thrall.shotVx, o: p, dmg: dmgOf(th.k, 'rmThrall'), hit: new Set(), chill: 0.2, one: true });
          api.SFX.rmShard ? api.SFX.rmShard() : api.SFX.ui(); th.strike = 0.2; } }
      else if (gap > RIME.thrall.reach) { step(th, th.face * RIME.thrall.speed * dt); th.moving = true; }
      else if (th.cd <= 0) { th.cd = RIME.thrall.cd; th.strike = 0.2; stats.thrallHits++;
        api.hurtAs('throw', tgt, Math.round(dmgOf(th.k, 'rmThrall') * brittle(tgt)), th.x, false); chillFoe(p, tgt, 0.15);
        api.sparks(tgt.x, tgt.y - (tgt.h || 14) / 2, th.face, 4); api.SFX.foeSlash ? api.SFX.foeSlash() : api.SFX.slash(); }
      if (th.strike > 0) th.strike -= dt; }
    thralls = thralls.filter(t => t.life > 0); }
  function step(th, dx) { const nx = th.x + dx, tx = Math.floor((nx + Math.sign(dx) * 5) / api.TS), ty = Math.floor((th.y - 4) / api.TS);
    if (api.isSolid(tx, ty)) return; const below = Math.floor((th.y + 2) / api.TS); if (th.ground && !api.isSolid(tx, below) && !api.isOneWay(api.tileAt(tx, below))) return;   /* it will not walk off a ledge */
    th.x = nx; }
  function shardStep(p, dt) {
    for (const s of shards) { if (!mine(s.o, p)) continue; s.life -= dt; s.vy += (s.grav || 0) * dt; s.x += s.vx * dt; s.y += s.vy * dt;
      if (api.isSolid(Math.floor(s.x / api.TS), Math.floor(s.y / api.TS))) { s.life = 0; continue; }
      for (const e of api.enemies) { if (!e.alive || e.harmless || e.gone > 0 || s.hit.has(e)) continue;
        if (Math.abs(e.x - s.x) < (e.w || 12) / 2 + 3 && s.y > e.y - (e.h || 14) - 3 && s.y < e.y + 3) { s.hit.add(e); chillFoe(p, e, s.chill); api.hurtAs('shot', e, Math.round(s.dmg * brittle(e)), s.x, false); if (s.one) { s.life = 0; break; } } } }
    shards = shards.filter(s => s.life > 0); }
  /* ---------------- THE MIST STEP ---------------- */
  function mist(p) { ensure(p); const W = T().mist ? RIME.mist.wide : 1; mists.push({ o: p, x: p.x, y: p.y - 8, r: RIME.mist.r * W, life: RIME.mist.life * W, max: RIME.mist.life * W, through: new Set() }); stats.mists++;
    api.burst(p.x, p.y - 8, 10, ['#eef8ff', '#bfe6f5'], 40, 0.6, -20, 2); api.SFX.rmMist ? api.SFX.rmMist() : api.SFX.ui(); }
  function mistStep(p, dt) {
    for (const m of mists) { if (!mine(m.o, p)) continue; m.life -= dt;
      for (const e of api.enemies) { if (!e.alive || e.harmless || e.gone > 0) continue; if (Math.abs(e.x - m.x) > m.r || Math.abs((e.y - (e.h || 14) / 2) - m.y) > m.r) continue;
        if (T().coldFeet && !m.through.has(e) && (p.dodge || 0) > 0) { m.through.add(e); chillFoe(p, e, 1.0); } else chillFoe(p, e, RIME.mist.chill * dt); } }
    mists = mists.filter(m => m.life > 0); }
  /* FROSTFALL: the shared plunge landed (main.js DOWN_STRIKE's wave): a ring of cold */
  function frostfall(p) { ensure(p); for (const e of api.enemies) { if (!e.alive || e.harmless || e.gone > 0) continue; if (Math.abs(e.x - p.x) < RIME.plunge.r && Math.abs(e.y - p.y) < 24) chillFoe(p, e, RIME.plunge.chill); }
    api.ringAt(p.x, p.y - 2, RIME.plunge.r, '#bfe6f5', 0.3); }
  /* a blow of her STAFF landed (main.js swingDmg / hurtEnemy): a breath of cold */
  function staffHit(p, e) { chillFoe(p, e, 0.12); }
  /* ---------------- HER NINE ACTIVES (main.js rimeKit presses them: skillPress / cdReady / spend) ---------------- */
  const kit = {
    hail() { const p = P(), H = RIME.kit.hail; for (let i = 0; i < H.n; i++) { const b = shoot(p, 0); b.vy = (i - (H.n - 1) / 2) * H.spread; b.range *= 1.1; b.dmg = dmgOf(H.k, 'rmHail'); }
      api.kitPose(p, 'rmBolt', 0.25); api.SFX.rmBolt ? api.SFX.rmBolt(1) : api.SFX.ui(); },
    grave() { const p = P(), G = RIME.kit.grave; mists.push({ o: p, x: p.x + p.face * G.w * 0.6, y: p.y - 4, r: G.w / 2, life: G.t, max: G.t, through: new Set(), floor: true }); api.kitPose(p, 'rmShatter', 0.25); api.SFX.rmMist ? api.SFX.rmMist() : api.SFX.ui(); },
    nova() { const p = P(), N = RIME.kit.nova; burstAt(p, p.x, p.y, N.k, N.chill, N.r); api.kitPose(p, 'rmUlt', 0.3); },
    call() { const p = P(); let n = 0; for (const c of liveCorpses()) if (Math.abs(c.x - p.x) < RIME.kit.call.r && Math.abs(c.y - p.y) < 60) { c.x = p.x + p.face * (14 + 10 * n); c.y = p.y; n++; api.burst(c.x, c.y - 6, 6, ['#bfe6f5', '#ffffff'], 40, 0.3, 0, 1); }
      api.number(p.x, p.y - 28, n ? 'COLD CALL' : 'NO RIME CORPSE NEAR', n ? '#dff4ff' : '#9aa39a'); api.kitPose(p, 'rmRaise', 0.3); },
    harvest() { const p = P(); let n = 0; for (const c of liveCorpses().slice()) if (Math.abs(c.x - p.x) < RIME.kit.harvest.r && Math.abs(c.y - p.y) < 70) { consume(c); burstAt(p, c.x, c.y, RIME.shatter.k, RIME.shatter.chill, RIME.shatter.r); n++; }
      if (n) { fill(p, RIME.bar.shatter * n); stats.shatters += n; } api.kitPose(p, 'rmShatter', 0.3); },
    shroud() { const p = P(); p.rmShroudT = api.time + RIME.kit.shroud.t; api.ringAt(p.x, p.y - 12, 14, '#dff4ff', 0.4); api.kitPose(p, 'rmUlt', 0.25); },
    keeping() { const p = P(); for (const th of ofP(thralls, p)) { th.life = Math.min(th.max + RIME.kit.keeping.add, th.life + RIME.kit.keeping.add); th.hp = th.hpMax; api.ringAt(th.x, th.y - 8, 10, '#bfe6f5', 0.3); } api.kitPose(p, 'rmRaise', 0.3); },
    glacier() { const p = P(), G = RIME.kit.glacier, b = shoot(p, 3, G.k); b.dmg = dmgOf(G.k, 'rmGlacier'); b.range = G.range; b.chill = G.chill; b.vx = p.face * 560; api.kitPose(p, 'rmLance', 0.35); api.shakeCam(3, -p.face); api.SFX.rmBolt ? api.SFX.rmBolt(3) : api.SFX.ui(); },
    night() { const p = P(); p.rmNightT = api.time + RIME.kit.night.t; api.number(p.x, p.y - 30, 'THE LONG NIGHT', '#dff4ff'); api.kitPose(p, 'rmUlt', 0.3); },
  };
  /* WINTER SHROUD: a blow on her while it is up is a quarter lighter, and chills the one who struck (main.js damagePlayer0 asks) */
  function shroudTakes(dmg, foe) { const p = P(); if (!((p.rmShroudT || 0) > api.time)) return dmg; if (foe && foe.alive) chillFoe(p, foe, RIME.kit.shroud.chill); return Math.max(1, Math.round(dmg * (1 - RIME.kit.shroud.cut))); }
  /* ---------------- EVERY FRAME ---------------- */
  /* main.js updatePlayer: C (the wall / the parry; UP+C RAISE, DOWN+C SHATTER - the ultimate is asked first, by main.js), the nock */
  function update(dt, keys, ctx) { const p = P(); ensure(p);
    if (p.rmCd > 0) p.rmCd = Math.max(0, p.rmCd - dt); if (p.rmShatCd > 0) p.rmShatCd = Math.max(0, p.rmShatCd - dt);
    nockStep(p, dt, !!keys.atk);
    const cPress = !!keys.block && !p.rmCPrev; p.rmCPrev = !!keys.block;
    const free = !ctx.stunned && !ctx.dodging && !ctx.attacking && !p.plunge && !p.dead;
    if (cPress && free && keys.up) raise(p);
    else if (cPress && free && keys.down) shatter(p);
    guardStep(p, dt, keys, ctx); }
  /* the world she owns: her shots in flight, her thralls, the mist (once a frame per seat) */
  function kitStep(dt) { const p = P(); ensure(p); boltStep(p, dt); thrallStep(p, dt); shardStep(p, dt); mistStep(p, dt); liveCorpses(); }
  function clear() { const p = P(); ensure(p); p.rmBolts = []; p.rmNock = null; p.rmGuard = false; p.rmHeld = 0; p.rmCd = 0; p.rmShatCd = 0;
    thralls = thralls.filter(t => t.o !== p); mists = mists.filter(m => m.o !== p); shards = shards.filter(s => s.o !== p); }
  function clearWorld() { corpses = []; thralls = []; mists = []; shards = []; }
  /* ---------------- DRAWN (placeholder art: the art lane owes her thralls' ice crust, the corpse glint, the wall) ---------------- */
  function draw(g, cx, cy) { const t = api.time;
    for (const m of mists) { const k = m.life / m.max, x = Math.round(m.x - cx), y = Math.round(m.y - cy);
      g.globalAlpha = 0.22 * k; g.fillStyle = '#dff4ff'; g.beginPath(); m.floor ? g.ellipse(x, y, m.r, 5, 0, 0, 7) : g.arc(x, y, m.r * (0.8 + 0.2 * (1 - k)), 0, 7); g.fill();
      g.globalAlpha = 0.35 * k; for (let i = 0; i < 5; i++) { const a = t * 1.3 + i * 1.26; g.fillRect(Math.round(x + Math.cos(a) * m.r * 0.6), Math.round(y + Math.sin(a * 1.3) * (m.floor ? 3 : m.r * 0.5)), 2, 1); } g.globalAlpha = 1; }
    for (const c of corpses) { if (!(c.rime && c.life > 0.05)) continue; const x = Math.round(c.x - cx), y = Math.round(c.y - cy), k = Math.min(1, c.life / c.max * 3);   /* THE RIME: a crust over the body, and a glint that runs along it */
      g.globalAlpha = 0.45 * k; g.fillStyle = '#bfe6f5'; g.fillRect(x - Math.round(c.rimeW / 2), y - 5, c.rimeW, 5); g.globalAlpha = 0.8 * k; g.fillStyle = '#ffffff';
      const gx = Math.round(x - c.rimeW / 2 + ((t * 18 + c.x) % (c.rimeW + 8))) - 4; if (gx >= x - c.rimeW / 2 && gx <= x + c.rimeW / 2) { g.fillRect(gx, y - 6, 1, 3); g.fillRect(gx - 1, y - 5, 3, 1); } g.globalAlpha = 1; }
    for (const th of thralls) { const x = Math.round(th.x - cx), y = Math.round(th.y - cy), k = Math.min(1, th.life / 1.5), a = (0.55 + 0.1 * Math.sin(t * 5 + th.x)) * k * (1 - th.rise / 0.6);
      const set = api.spriteOf(th); if (set) { const n = set.R ? set.R.length : 1, fr = Math.min(n - 1, th.strike > 0 ? Math.min(n - 1, 3) : th.moving ? 1 + Math.floor(th.anim * 6) % 2 : 0); api.drawTinted(set, fr, x, y, th.face, th.full ? '#ffffff' : '#bfe6f5', a); }
      else { g.globalAlpha = a; g.fillStyle = '#bfe6f5'; g.fillRect(x - Math.round(th.w / 2), y - th.h, th.w, th.h); g.globalAlpha = 1; }
      g.globalAlpha = 0.85 * k; g.fillStyle = '#ffffff'; g.fillRect(x - 2, y - th.h + 3, 1, 1); g.fillRect(x + 1, y - th.h + 3, 1, 1);   /* its cold eyes */
      g.fillStyle = '#8fd0f0'; for (let i = 0; i < 3; i++) g.fillRect(x - Math.round(th.w / 2) + ((i * 5 + Math.floor(th.x)) % Math.max(1, th.w)), y - 2 - i * 3, 2, 1); g.globalAlpha = 1;   /* the ice crust */
      if (Math.random() < 0.3) api.parts.push({ x: th.x + (Math.random() - 0.5) * th.w, y: th.y - Math.random() * th.h, vx: 0, vy: -14, life: 0.5, max: 0.5, col: '#dff4ff', size: 1, grav: 0 }); }
    for (const p of api.heroes ? api.heroes() : [P()]) { if (!p || !p.rmBolts) continue;
      for (const b of p.rmBolts) { const x = Math.round(b.x - cx), y = Math.round(b.y - cy), f = Math.sign(b.vx) || 1, len = 4 + 4 * b.tier;
        g.fillStyle = '#8fd0f0'; g.fillRect(f > 0 ? x - len : x, y - 1, len, 2); g.fillStyle = RIME.lance.cols[b.tier]; g.fillRect(f > 0 ? x - len + 2 : x, y - (b.tier ? 1 : 0), len - 2, b.tier ? 2 : 1); g.fillStyle = '#ffffff'; g.fillRect(x + (f > 0 ? 0 : -1), y - 1, 2, 2); }
      if (p.rmGuard) { const x = Math.round(p.x + p.face * 11 - cx), y = Math.round(p.y - cy);   /* THE ICE WALL: a slab standing off her front, a crack in it as her wind runs low */
        g.globalAlpha = 0.7; g.fillStyle = '#8fd0f0'; g.fillRect(x - 2, y - 26, 5, 26); g.globalAlpha = 0.9; g.fillStyle = '#dff4ff'; g.fillRect(x - 1, y - 25, 2, 24); g.fillStyle = '#ffffff'; g.fillRect(x, y - 24 + Math.floor(t * 20) % 20, 1, 3);
        if ((p.st || 0) < 25) { g.fillStyle = '#3a6a8a'; g.fillRect(x - 1, y - 16, 3, 1); g.fillRect(x, y - 15, 1, 3); } g.globalAlpha = 1; } }
    for (const s of shards) { g.fillStyle = '#dff4ff'; g.fillRect(Math.round(s.x - cx) - 1, Math.round(s.y - cy) - 1, 3, 2); }
  }
  /* THE HUD: the rime bar's fill, the raise third marked, the thralls up */
  const hudOf = p => { ensure(p); return { bar: p.rmBar || 0, raise: raiseCost(T()), thralls: ofP(thralls, p).length, cap: RIME.thrall.cap, corpseNear: !!corpseNear(p), guard: !!p.rmGuard }; };
  /* THE BOT'S READ (src/lab.js rmHands, BK.rm()): what a hand needs to choose raise or shatter, and where the corpses are */
  const read = () => { const p = P(); ensure(p); const c = corpseNear(p);
    return { bar: +(p.rmBar || 0).toFixed(1), raiseCost: raiseCost(T()), corpses: liveCorpses().map(c => ({ x: c.x, y: c.y, life: +c.life.toFixed(2) })), corpseNear: c ? { x: c.x, y: c.y } : null,
      thralls: ofP(thralls, p).map(t => ({ x: Math.round(t.x), y: Math.round(t.y), life: +t.life.toFixed(2), ranged: t.ranged, hp: t.hp })), guard: !!p.rmGuard, onBeat: onBeat(p), nock: !!p.rmNock, cd: +(p.rmCd || 0).toFixed(2),
      ultReady: ultReady(), stats: { ...stats, lances: stats.lances.slice() } }; };
  return { RIME, press, release, update, kitStep, guardTakes, shroudTakes, onBeat: () => onBeat(P()), onCorpse, raise: () => raise(P()), shatter: () => shatter(P()), mist: () => mist(P()),
    frostfall: () => frostfall(P()), staffHit: e => staffHit(P(), e), ultReady, longWinter, kit, clear, clearWorld, draw, hud: () => hudOf(P()), hudOf, read,
    pointBlank: () => pointBlank(P()), lanceTier, thralls: () => thralls.slice(), corpses: () => liveCorpses().slice(), stats };
}
