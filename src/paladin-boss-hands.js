// src/paladin-boss-hands.js - THE PALADIN's HANDS (claude/church2: the hero as the boss). src/paladin-boss.js is the fight (pure: his three phases, his
// cycles, his Light, the falter, the bot's reading); this binds it to the world: his told blows on the heroes (keyed once a blow; a shield turns only the
// yellow ones), HIS HOLY GROUND (a makeHolyGround instance of his own, side 'foe': it burns the heroes standing in it and mends him), THE SANCTUARY's LAMPS
// (the level's: src/lit-church-hands.js snuffs them - onLamp - and lights them when the rose window kindles them), and the drawing: HIS BODY is the hero's
// own sheet (main.js SPR.paladinboss, the generic enemy draw x PB.scale, frame = palFrame); over it his circle, the hammer of light and the holy spires
// (src/holy-fx.js - the hero's own FX), the judgement's crosses and columns, the leap's ring, his aegis arc, his LIGHT BAR, and the B10 read.
// THE SHARED READ (design standard B10): OPEN = a gold ring round him and a timer bar (HE FALTERS); WARDED = a pale shell ring and the word; HIS AEGIS = a
// turned blow CLANKS, flashes and says HIS AEGIS: GO ROUND - and his light bar ticks up gold (you fed him) - never silent.
// main.js calls: spawnBoss, owns, on, update, take, frame, drawUnder, drawOver, barName, end, read, show, clear, onLamp, onKindled.
import * as PBM from './paladin-boss.js';
import * as PAL from './redraw/paladin_art.js';
import { makeHolyGround, HG } from './holy-ground.js';
import { BOSS_PHASE } from './boss-music.js';
const { PB } = PBM;

const SOUND = { tell: s => s.tell && s.tell(false), tellHard: s => s.tell && s.tell(true), slam: s => (s.heavy || s.slash)(), glow: s => (s.chime || s.bell || s.tell)(false),
  radiance: s => (s.judgement || s.aegis || s.chime || s.bell)(), leap: s => (s.pJump || s.whoosh || s.slash)(), falter: s => (s.crack || s.clank)(), throw: s => (s.throwWhoosh || s.whoosh || s.slash)(),
  charge: s => (s.charge || s.whoosh || s.slash)() };

export function makePaladinHands(ctx) {
  let S = null, HGB = null;
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'paladinboss' ? ctx.L.arena : null);
  const R = Math.round;
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'paladinboss';
  H.clear = () => { S = null; if (HGB) HGB.clear(); BOSS_PHASE.paladin = 1; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.pbKeys = pp.pbKeys || new Map(); if (pp.pbKeys.size > 80) pp.pbKeys.clear(); if (pp.pbKeys.has(key)) return true; pp.pbKeys.set(key, 1); return false; };
  const live = () => { const e = ctx.boss; return e && e.alive && e.t === 'paladinboss' ? e : null; };
  /* HIS HOLY GROUND: the hero's own module, his side - it burns a hero who stands in it (x PB.circle.burnK of the hero's burn) and mends him (x PB.circle.mend) */
  const holy = () => HGB || (HGB = makeHolyGround({ time: () => ctx.time(), g: () => ctx.g(), parts: null,
    targets: () => ctx.players.filter(pp => !pp.dead && ctx.upright(pp)),
    hurt: (pp, d) => { const e = live(); if (!e || !ctx.bossActive) return; ctx.asPlayer(pp, () => { const P = ctx.hero(); if (P.dead) return; hurt(PBM.MOVE_NAME.ground, () => ctx.damagePlayer(e.x, Math.max(1, R(d * PB.circle.burnK)), { who: e, name: PBM.MOVE_NAME.ground, unblockable: true, noKnock: true })); }); },
    healers: () => { const e = live(); return e ? [e] : []; },
    heal: (b, n) => { if (b && b.alive && b.hp < b.maxHp) b.hp = Math.min(b.maxHp, b.hp + b.maxHp * n * PB.circle.mend); } }));

  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    S = PBM.newFight(PBM.geom(Ar, ctx.TS)); BOSS_PHASE.paladin = 1; holy().clear();
    const e = { ...base, t: 'paladinboss', w: PB.w, h: PB.h, hp: ctx.EHP.paladinboss, maxHp: ctx.EHP.paladinboss, noGrav: true, markH: PB.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1, pbLight: S.light, vx: 0 };
    e.y = S.G.floorY; for (const pp of ctx.players) pp.pbKeys = null; return e; };

  /* ---------- THE WORLD AS HE SEES IT ---------- */
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, air: !pp.ground && !pp.climb, alive: ctx.upright(pp) && !pp.dead, pp }));
  function world(e) {
    return {
      hg: holy(), time: () => ctx.time(),
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n),
      music: ph => { BOSS_PHASE.paladin = ph; },   /* (his theme is the file 'Church combat': the phases do not switch it) */
      mark: m => ctx.number(e.x, e.y - PB.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      lamps: () => (ctx.lamps ? ctx.lamps() : []), kindle: id => (ctx.kindle ? ctx.kindle(id) : false),
      fx: (k, x, y) => {
        if (k === 'land') ctx.burst(x, y - 4, 16, ['#fff6c8', '#ffd36b', '#c9b27c'], 90, 0.6);
        else if (k === 'column') ctx.burst(x, y - 30, 14, ['#fff6c8', '#ffd36b', '#ffffff'], 70, 0.5);
        else if (k === 'smite') { if (ctx.hfx) ctx.hfx.smite(x, y); ctx.burst(x, y - 6, 10, ['#fff6c8', '#ffd36b'], 70, 0.5); }
        else if (k === 'flare') { ctx.ring(x, y - 6, PB.empower.r, '#ffffff'); ctx.burst(x, y - 10, 18, ['#ffffff', '#fff6c8', '#ffd36b'], 110, 0.6); }
        else if (k === 'plant') ctx.burst(x, y - 4, 10, ['#ffd36b', '#fff6c8'], 50, 0.6);
        else if (k === 'open') ctx.ring(x, y - 22, 34, '#ffd36b');
        else if (k === 'ward') ctx.ring(x, y - 22, 38, '#c8d8e8');
        else if (k === 'ring' || k === 'cross') ctx.ring(x, y - 4, k === 'ring' ? PB.leap.r : PB.judge.r, '#ff6b6b'); },
      hit: (bx, d, name, o = {}) => { let any = false; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key || name)) return;
          const hp0 = P.hp; let res; hurt(name, () => { res = ctx.damagePlayer(e.x, d, { who: e, name, unblockable: !o.blockable, noKnock: !!o.noKnock }); }); if (P.hp < hp0) any = true;
          if (o.blockable && (res === 'blocked' || (ctx.answered && ctx.answered(res)))) PBM.blowTurned(e, S, world(e), !!(ctx.answered && ctx.answered(res))); }); return any; },
    };
  }

  /* ---------- ONE FRAME OF HIM ---------- */
  H.update = (e, dt) => {
    if (!S || !e.alive) return; const Ar = A(); if (!Ar) return;
    if (e.mode === 'wake' && !S.woke) { S.woke = true; e.modeT = 1.8; ctx.number(e.x, e.y - 90, 'THE PALADIN, SWORN TO THE LIGHT', '#ffd36b'); }
    if (S.woke && !S.told.rule && e.mode !== 'wake') { S.told.rule = 1; ctx.number((S.G.x0 + S.G.x1) / 2, S.G.floorY - 130, 'HIS LAMPS FEED HIS LIGHT: SNUFF THEM AND STARVE HIM', '#ffd36b'); }
    PBM.stepPaladin(e, S, dt, heroes(), world(e));
    holy().update(dt);
    e.phase = S.ph;
    /* THE BAR's change, for the drawing: a gold tick when it climbs on a blow, a dark notch when it drops */
    if (S.light > S.lastLight + 4) S.barUp = 0.35; else if (S.light < S.lastLight - 4) S.barDown = 0.35; S.lastLight = S.light; S.barUp = Math.max(0, (S.barUp || 0) - dt); S.barDown = Math.max(0, (S.barDown || 0) - dt);
  };
  /* THE RULE ON HIM: a sanctuary lamp snuffed by a hero (src/lit-church-hands.js) */
  H.onLamp = l => { const e = live(); if (!S || !e || !ctx.bossActive || (l && l.room && l.room !== 'sanctuary')) return; PBM.lampOut(e, S, world(e), l && l.id); };
  H.onKindled = l => { const e = live(); if (!S || !e || (l && l.room && l.room !== 'sanctuary')) return; ctx.number(e.x, e.y - 76, 'THE LAMP BURNS AGAIN: HIS LIGHT CLIMBS FROM IT', '#ff9a5c'); };
  /* A BLOW ON HIM: src/paladin-boss.js blowOn - the ward turns everything; his aegis turns the front while he guards (and drinks it); open, x falterMul */
  H.take = (e, dmg, blow) => { if (!S) return dmg; const P = ctx.hero(), t = ctx.time();
    if (!blow && ctx.burnTick && ctx.burnTick()) return PBM.burnOn(e, S, dmg).dmg;   /* A BURN TICK is not a blow: the fire on him neither feeds nor drains his light */
    const heavy = ctx.blowHas ? ctx.blowHas(blow, 'heavy') : false, r = PBM.blowOn(e, S, world(e), dmg, P.x, P.y, !P.ground && !P.climb, heavy);
    if (r.read === 'ward') { e.guardFx = 0.25; e.guardWord = 'WARDED'; ctx.sfx.clank && ctx.sfx.clank(); return 0; }
    if (r.read === 'aegis') { e.guardFx = 0.25; e.guardWord = S.n.guarded < 6 ? ['HIS AEGIS: GO ROUND', 'HIS AEGIS: STRIKE FROM ABOVE'][S.n.guarded % 2] : 'HIS AEGIS';
      ctx.sfx.aegis ? ctx.sfx.aegis() : ctx.sfx.clank && ctx.sfx.clank(); ctx.sparks(e.x + (Math.sign(P.x - e.x) || 1) * 14, e.y - 24, Math.sign(P.x - e.x) || 1, 5); return r.dmg; }   /* (B15: it bites at PB.aegis.take - and it fed him) */
    e.angleHit = t;   /* (a blow round his aegis is the right blow: not greed - src/main.js greedHit) */
    return r.dmg; };
  H.frame = e => PBM.palFrame(e);
  H.barName = e => 'THE PALADIN' + (PBM.pbOpen(e) ? '  OPEN' : S && S.ward > 0 ? '  WARDED' : '');
  H.end = e => { if (S) { S.marks = []; S.waves = []; S.hammer = null; S.leap = null; } if (HGB) HGB.clear(); BOSS_PHASE.paladin = 1; };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, cycle: S.cycle, light: Math.round(S.light), n: JSON.parse(JSON.stringify(S.n)), ward: S.ward, hurt: { ...(S.hurt || {}) },
    circle: (() => { const e = live(), c = e && HGB ? HGB.of(e) : null; return c ? { x: R(c.x), r: c.r, life: +c.life.toFixed(2), emp: c.emp } : null; })() };
  H.circle = () => { const e = live(), c = e && HGB ? HGB.of(e) : null; return c ? { x: c.x, r: c.r, emp: c.emp, life: c.life } : null; };

  /* ---------- DRAWING ---------- */
  /* UNDER HIM (main.js calls it with the hero's own holy pass): his circle on the floor */
  H.drawUnder = (cx, cy) => { if (!S || !A() || !ctx.bossActive || !HGB) return; HGB.draw(cx, cy); };
  /* OVER HIM: the hammer, the spires, the judgement, the leap's ring, his aegis arc, the smite's windup, the vigil, his LIGHT BAR and THE READ */
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar || !ctx.bossActive) return; const e = ctx.boss; if (!e || e.t !== 'paladinboss') return; const G = S.G, X = ctx.hfx;
    const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0', fy = R(G.floorY - cy), f = e.face || 1, x = R(e.x - cx), y = R(e.y - cy), m = e.mode;
    /* THE HAMMER OF LIGHT (the hero's own: src/holy-fx.js) and the HOLY SPIRES / THE QUAKE along the floor */
    if (S.hammer && X) X.hammer(g, { x: S.hammer.x, y: S.hammer.y, t: S.hammer.t, dir: S.hammer.dir }, cx, cy, time, null);
    for (const w of S.waves) { if (X) X.wave(g, { x: w.x, y: G.floorY, dir: w.dir }, cx, cy, time); else { g.fillStyle = '#fff6c8'; g.fillRect(R(w.x - cx) - 2, fy - 14, 4, 14); } }
    /* JUDGEMENT: red crosses on the floor, then the columns */
    for (const mk of S.marks) { const mx = R(mk.x - cx);
      if (m === 'judgeTell') { g.strokeStyle = blink; g.beginPath(); g.moveTo(mx - 6, fy - 8); g.lineTo(mx + 6, fy); g.moveTo(mx + 6, fy - 8); g.lineTo(mx - 6, fy); g.stroke(); PAL.drawColumn(g, mx, R(G.roofY - cy), fy, PB.judge.r, time, 0.16 + 0.1 * Math.sin(time * 10)); }
      if (m === 'judge') PAL.drawColumn(g, mx, R(G.roofY - cy), fy, PB.judge.r, time, 1); }
    /* HAMMER LEAP: the red ring where he will land */
    if (S.leap && (m === 'leapTell' || m === 'leap')) { const lx = R(S.leap.x - cx); g.strokeStyle = blink; g.lineWidth = 2; g.beginPath(); g.ellipse(lx, fy - 1, PB.leap.r, 5, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; }
    /* HIS AEGIS: a ward arc of light in front of him while he guards (the angle it turns) - brighter as the Light is fuller; planted, whiter; failing, broken */
    if (m === 'walk' || m === 'recover' || m === 'aegis') { const low = S.light < PB.aegis.min, k = low ? 0.15 : (m === 'aegis' ? 0.75 : 0.25 + 0.45 * (S.light / PB.light.max));
      g.globalAlpha = k * (0.8 + 0.2 * Math.sin(time * 8)); g.strokeStyle = m === 'aegis' ? '#ffffff' : '#fff6c8'; g.lineWidth = m === 'aegis' ? 3 : 2; g.beginPath();
      if (low) { for (let i = 0; i < 4; i++) { const a0 = -1.1 + i * 0.6; g.moveTo(x + f * 12 + Math.cos(a0) * 22 * f, y - 24 + Math.sin(a0) * 22); g.arc(x + f * 12, y - 24, 22, f > 0 ? a0 : Math.PI - a0 - 0.3, f > 0 ? a0 + 0.3 : Math.PI - a0); } }
      else g.arc(x + f * 12, y - 24, 22, f > 0 ? -1.1 : Math.PI - 1.1, f > 0 ? 1.1 : Math.PI + 1.1);
      g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; }
    /* THE SMITE'S WINDUP (the hero's bloom on the maul's head) and the empower's gathering light */
    if (X && m === 'smiteTell') X.windup(g, x + f * 6, y - 52, Math.min(1, 1 - e.modeT / PB.smite.tell), time);
    if (m === 'empowerTell' || m === 'plantTell') { const k = m === 'empowerTell' ? 1 : 0.5; for (let i = 0; i < 8; i++) { const t = (time * 0.9 + i / 8) % 1; g.globalAlpha = 0.9 * (1 - t) * k; g.fillStyle = i & 1 ? '#ffd36b' : '#fff6c8'; g.fillRect(x - 16 + ((i * 19) % 33), R(fy - 4 - t * 46), 1, 2); } g.globalAlpha = 1;
      ctx.text(m === 'empowerTell' ? 'EMPOWER' : 'CONSECRATE', x, y - 88, m === 'empowerTell' ? '#ff6b6b' : '#ffd36b', 'center', 6); }
    /* THE VIGIL: gold rising off the lamp into him */
    if (m === 'vigil' || m === 'vigilTell') { for (let i = 0; i < 7; i++) { const t = (time * 1.2 + i / 7) % 1; g.globalAlpha = 0.9 * (1 - t); g.fillStyle = i & 1 ? '#ffd36b' : '#fff6c8'; g.fillRect(x - 12 + ((i * 19) % 25), R(y - 6 - t * 40), 1, 2); } g.globalAlpha = 1; ctx.text('VIGIL', x, y - 88, '#ffd36b', 'center', 6); }
    if (m === 'aegis') ctx.text('AEGIS', x, y - 88, '#fff6c8', 'center', 6);
    if (m === 'sleep') ctx.text('Z', x + 8 * f, y - 60 - R((time * 8) % 8), '#c8d8e8', 'center', 6);
    if (e.guardFx > 0) { e.guardFx = Math.max(0, e.guardFx - 1 / 60); g.fillStyle = '#ffffff'; g.fillRect(x + f * 18 - 2, y - 40, 5, 22); }
    /* THE LIGHT BAR over him (drawn with every change: gold up when his aegis drinks a blow, a dark notch when one lands), the spend ticks of his kit */
    const w = 44, bx = Math.max(w / 2 + 30, Math.min(ctx.VW() - w / 2 - 4, x)), by = R(e.y - PB.h * PB.scale - 14 - cy), k = S.light / PB.light.max;   /* (kept on the screen at the room's walls, its label too) */
    PAL.drawLightBar(g, bx, by, w, k, { open: PBM.pbOpen(e), up: S.barUp > 0, down: S.barDown > 0 });
    g.fillStyle = '#1b1626'; for (const c of [HG.smite.cost, HG.throw.cost, HG.empower.cost]) g.fillRect(R(bx - w / 2 + w * c / 100), by - 1, 1, 4);
    ctx.text('LIGHT', bx - w / 2 - 15, by - 1, '#ffd36b', 'center', 4);
    /* THE READ (B10) */
    const yy = R(e.y - PB.h * PB.scale / 2 - cy);
    if (PBM.pbOpen(e)) { const kk = Math.max(0, e.open / PB.falterT);
      g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, yy, 30, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      ctx.text('HE FALTERS', x, by - 10, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(x - 18, by - 5, 36, 3); g.fillStyle = '#8fd160'; g.fillRect(x - 18, by - 5, R(36 * kk), 3); }
    if (S.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.beginPath(); g.arc(x, yy, 32, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      ctx.text('WARDED', x, by - 10, '#c8d8e8', 'center', 5); }
    if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, x, by - 20 - R((0.25 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#e8c070', 'center', 6);
  };
  return H;
}
