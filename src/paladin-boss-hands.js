// src/paladin-boss-hands.js - THE PALADIN's HANDS (claude/church2: the hero as the boss; RE-POINTED by claude/church3 to the PALADIN 4 kit and the church's flame).
// src/paladin-boss.js is the fight (pure: his three phases, his cycles, his conviction, the brazier rule, the falter, the bot's reading); this binds it to the world:
// his told blows on the heroes (keyed once a blow; a shield turns only the yellow ones), HIS HALLOWED AURA (a makeHolyGround instance of his own, side 'foe': it
// walks with him, burns the heroes standing in it and mends him), THE SANCTUARY's BRAZIERS (the level's: src/lit-church-hands.js lights them - onKindled: a brazier
// lit beside him is his falter - and snuffs them - a hero's blade (onLamp), his own hammer in the Bastion (ctx.snuff)), and the drawing: HIS BODY is the hero's own
// sheet (main.js SPR.paladinboss, the generic enemy draw x PB.scale, frame = palFrame); over it the hero's own FX (src/holy-fx.js: the smite's column, the radiance,
// the sunfall, the verdict's sigils and strikes, the dawnfall's pillar, the spear, the light-ward dome) - the man you will play - his CONVICTION PIPS, and the B10 read.
// THE SHARED READ (design standard B10): OPEN = a gold ring round him and a timer bar (HE FALTERS); WARDED = a pale shell ring and the word; HIS LIGHT-WARD = a turned
// blow CLANKS, the dome flares and the word names the answer (LIGHT A BRAZIER BESIDE HIM) - and a pip fills a little (you fed him) - never silent.
// main.js calls: spawnBoss, owns, on, update, take, frame, drawUnder, drawOver, barName, end, read, show, clear, onLamp, onKindled.
import * as PBM from './paladin-boss.js';
import { makeHolyGround } from './holy-ground.js';
import { BOSS_PHASE } from './boss-music.js';
import * as C3 from './redraw/church3_art.js';   /* (claude/church3art) his conviction pips, light-ward, ward-broken, brazier flare, verdict + dawn marks, prayer */
const { PB } = PBM;

const SOUND = { tell: s => s.tell && s.tell(false), tellHard: s => s.tell && s.tell(true), slam: s => (s.heavy || s.slash)(), glow: s => (s.chime || s.bell || s.tell)(false),
  radiance: s => (s.judgement || s.aegis || s.chime || s.bell)(), leap: s => (s.pJump || s.whoosh || s.slash)(), falter: s => (s.crack || s.clank)(), throw: s => (s.throwWhoosh || s.whoosh || s.slash)() };

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
  /* HIS HALLOWED AURA: the hero's own module, his side - it burns a hero who stands in it (x PB.aura.burnK of the hero's burn) and mends him (x PB.aura.mend) */
  const holy = () => HGB || (HGB = makeHolyGround({ time: () => ctx.time(), g: () => ctx.g(), parts: null,
    targets: () => ctx.players.filter(pp => !pp.dead && ctx.upright(pp)),
    hurt: (pp, d) => { const e = live(); if (!e || !ctx.bossActive) return; ctx.asPlayer(pp, () => { const P = ctx.hero(); if (P.dead) return; hurt(PBM.MOVE_NAME.ground, () => ctx.damagePlayer(e.x, Math.max(1, R(d * PB.aura.burnK)), { who: e, name: PBM.MOVE_NAME.ground, unblockable: true, noKnock: true })); }); },
    healers: () => { const e = live(); return e ? [e] : []; },
    heal: (b, n) => { if (b && b.alive && b.hp < b.maxHp) b.hp = Math.min(b.maxHp, b.hp + b.maxHp * n * PB.aura.mend); } }));

  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    S = PBM.newFight(PBM.geom(Ar, ctx.TS)); BOSS_PHASE.paladin = 1; holy().clear();
    const hpK = (PB.heroHp && ctx.heroT && PB.heroHp[ctx.heroT()]) || 1, hp = Math.round(ctx.EHP.paladinboss * hpK);
    const e = { ...base, t: 'paladinboss', w: PB.w, h: PB.h, hp, maxHp: hp, noGrav: true, markH: PB.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1, pbConv: S.conv, vx: 0 };
    e.y = S.G.floorY; for (const pp of ctx.players) pp.pbKeys = null; return e; };

  /* ---------- THE WORLD AS HE SEES IT ---------- */
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, air: !pp.ground && !pp.climb, alive: ctx.upright(pp) && !pp.dead, flame: pp.lcFlame || 0, pp }));
  function world(e) {
    return {
      hg: holy(), time: () => ctx.time(),
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n),
      music: ph => { BOSS_PHASE.paladin = ph; },   /* (his theme is one file: the phases do not switch it) */
      mark: m => ctx.number(e.x, e.y - PB.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      lamps: () => (ctx.lamps ? ctx.lamps() : []), snuff: id => (ctx.snuff ? ctx.snuff(id) : false),
      mend: k => { if (e.alive && e.hp < e.maxHp) { const h0 = e.hp; e.hp = Math.min(e.maxHp, e.hp + e.maxHp * k); ctx.number(e.x, e.y - 74, '+' + R(e.hp - h0), '#ffd36b'); } },
      fx: (k, x, y, r) => { const X = ctx.hfx;
        if (k === 'pillar') { if (X && X.dawn) X.dawn(x, y, PB.dawn.r); ctx.burst(x, y - 4, 16, ['#fff6c8', '#ffd36b', '#c9b27c'], 90, 0.6); }
        else if (k === 'column') { if (X && X.verdict) X.verdict(x, y); else ctx.burst(x, y - 30, 14, ['#fff6c8', '#ffd36b', '#ffffff'], 70, 0.5); }
        else if (k === 'smite') { if (X) X.smite(x, y); ctx.burst(x, y - 6, 10, ['#fff6c8', '#ffd36b'], 70, 0.5); }
        else if (k === 'flare') { if (X && X.radiance) X.radiance(x, y - 4, r || PB.radiance.r, (r || 0) > PB.radiance.r); else ctx.ring(x, y - 6, r || PB.radiance.r, '#ffffff'); ctx.burst(x, y - 10, 18, ['#ffffff', '#fff6c8', '#ffd36b'], 110, 0.6); }
        else if (k === 'open') { ctx.ring(x, y - 22, 34, '#ffd36b'); if (X && X.shatter) X.shatter(x, y - 24); }
        else if (k === 'ward') ctx.ring(x, y - 22, 38, '#c8d8e8');
        else if (k === 'ring' || k === 'cross') ctx.ring(x, y - 4, k === 'ring' ? PB.dawn.r : PB.sunfall.r, '#ff6b6b'); },
      hit: (bx, d, name, o = {}) => { let any = false; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key || name)) return;
          const hp0 = P.hp, dk = (PB.heroDmg && ctx.heroT && PB.heroDmg[ctx.heroT()]) || 1; let res; hurt(name, () => { res = ctx.damagePlayer(e.x, Math.round(d * dk), { who: e, name, unblockable: !o.blockable, noKnock: !!o.noKnock }); }); if (P.hp < hp0) any = true;
          if (o.blockable && (res === 'blocked' || (ctx.answered && ctx.answered(res)))) PBM.blowTurned(e, S, world(e), !!(ctx.answered && ctx.answered(res))); }); return any; },
    };
  }

  /* ---------- ONE FRAME OF HIM ---------- */
  H.update = (e, dt) => {
    if (!S || !e.alive) return; const Ar = A(); if (!Ar) return;
    if (e.mode === 'wake' && !S.woke) { S.woke = true; e.modeT = 1.8; ctx.number(e.x, e.y - 90, 'THE PALADIN, SWORN TO THE LIGHT', '#ffd36b'); }
    if (S.woke && !S.told.rule && e.mode !== 'wake') { S.told.rule = 1; ctx.number((S.G.x0 + S.G.x1) / 2, S.G.floorY - 130, 'CARRY A FLAME: LIGHT A BRAZIER BESIDE HIM', '#ffd36b'); }
    PBM.stepPaladin(e, S, dt, heroes(), world(e));
    holy().update(dt);
    e.phase = S.ph;
    /* THE PIPS' change, for the drawing: a gold tick when one fills, a dark notch when he spends */
    if (S.conv > S.lastConv + 0.3) S.barUp = 0.35; else if (S.conv < S.lastConv - 0.3) S.barDown = 0.35; S.lastConv = S.conv; S.barUp = Math.max(0, (S.barUp || 0) - dt); S.barDown = Math.max(0, (S.barDown || 0) - dt);
  };
  /* THE RULE ON HIM: a brazier lit by a hero (src/lit-church-hands.js lightLamp -> ctx.bossKindled): beside him it breaks his light-ward */
  H.onKindled = l => { const e = live(); if (!S || !e || !ctx.bossActive || !l || (l.room && l.room !== 'sanctuary') || l.by !== 'hero') return; { const r = PBM.brazierLit(e, S, world(e), l.x * ctx.TS + 8); if (r === 'break') S.broke = { t: ctx.time(), bx: l.x * ctx.TS + 8, ex: e.x, ey: e.y }; } };   /* (claude/church3art) the ward breaks: the shell's shards and the brazier's fire thrown into him */
  /* a brazier put out by a hero's blade (it cuts his prayer at it) */
  H.onLamp = l => { const e = live(); if (!S || !e || !ctx.bossActive || (l && l.room && l.room !== 'sanctuary')) return; PBM.brazierOut(e, S, world(e), l && l.id); };
  /* A BLOW ON HIM: src/paladin-boss.js blowOn - the ward turns everything; his light-ward turns every side on guard (and feeds him); open, x falterMul */
  H.take = (e, dmg, blow) => { if (!S) return dmg; const P = ctx.hero(), t = ctx.time();
    if (!blow && ctx.burnTick && ctx.burnTick()) return PBM.burnOn(e, S, dmg).dmg;   /* A BURN TICK is not a blow: the fire on him never feeds him */
    const r = PBM.blowOn(e, S, world(e), dmg);
    if (r.read === 'ward') { e.guardFx = 0.25; e.guardWord = 'WARDED'; ctx.sfx.clank && ctx.sfx.clank(); return 0; }
    if (r.read === 'guard') { e.guardFx = 0.25; e.wardHitAt = t; e.guardWord = S.n.guarded < 6 ? ['HIS LIGHT-WARD', 'BRING THE FIRE'][S.n.guarded % 2] : 'HIS LIGHT-WARD';
      ctx.sfx.aegis ? ctx.sfx.aegis() : ctx.sfx.clank && ctx.sfx.clank(); ctx.sparks(e.x + (Math.sign(P.x - e.x) || 1) * 14, e.y - 24, Math.sign(P.x - e.x) || 1, 5); return r.dmg; }   /* (B15: it bites at PB.ward.take - and it fed him) */
    e.angleHit = t;   /* (a blow while he is committed is the right blow: not greed - src/main.js greedHit) */
    return r.dmg; };
  H.frame = e => PBM.palFrame(e);
  H.barName = e => 'THE PALADIN' + (PBM.pbOpen(e) ? '  OPEN' : S && S.ward > 0 ? '  WARDED' : '');
  H.end = e => { if (S) { S.marks = []; S.sigils = []; S.waves = []; S.spear = null; S.leap = null; } if (HGB) HGB.clear(); BOSS_PHASE.paladin = 1; };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, cycle: S.cycle, conv: +S.conv.toFixed(2), pips: PBM.pips(S), n: JSON.parse(JSON.stringify(S.n)), ward: S.ward, hurt: { ...(S.hurt || {}) },
    aura: (() => { const e = live(), c = e && HGB ? HGB.of(e) : null; return c ? { x: R(c.x), r: c.r, life: +c.life.toFixed(2) } : null; })() };
  H.aura = () => { const e = live(), c = e && HGB ? HGB.of(e) : null; return c ? { x: c.x, r: c.r, life: c.life } : null; };

  /* ---------- DRAWING ---------- */
  /* UNDER HIM (main.js calls it with the hero's own holy pass): his aura on the floor */
  H.drawUnder = (cx, cy) => { if (!S || !A() || !ctx.bossActive || !HGB) return; HGB.draw(cx, cy); };
  /* OVER HIM: the spear, the quake, the sunfall's crosses, the verdict's sigils, the dawnfall's ring, his light-ward, his prayer, his CONVICTION PIPS and THE READ */
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar || !ctx.bossActive) return; const e = ctx.boss; if (!e || e.t !== 'paladinboss') return; const G = S.G, X = ctx.hfx;
    const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0', fy = R(G.floorY - cy), f = e.face || 1, x = R(e.x - cx), y = R(e.y - cy), m = e.mode;
    /* THE SPEAR OF LIGHT (the hero's own sprite: src/holy-fx.js) and THE QUAKE along the floor */
    if (S.spear) { if (X && X.spear) X.spear(g, R(S.spear.x - cx), R(S.spear.y - cy), S.spear.dir, time); else { g.fillStyle = '#fff6c8'; g.fillRect(R(S.spear.x - cx) - 8, R(S.spear.y - cy) - 1, 16, 2); } }
    for (const w of S.waves) { if (X) X.wave(g, { x: w.x, y: G.floorY, dir: w.dir }, cx, cy, time); else { g.fillStyle = '#fff6c8'; g.fillRect(R(w.x - cx) - 2, fy - 14, 4, 14); } }
    /* SUNFALL: red crosses on the floor, the columns standing faint over them while it is told */
    for (const mk of S.marks) { const mx = R(mk.x - cx);
      if (m === 'sunfallTell') { g.strokeStyle = blink; g.beginPath(); g.moveTo(mx - 6, fy - 8); g.lineTo(mx + 6, fy); g.moveTo(mx + 6, fy - 8); g.lineTo(mx - 6, fy); g.stroke(); g.globalAlpha = 0.16 + 0.1 * Math.sin(time * 10); g.fillStyle = '#fff6c8'; g.fillRect(mx - PB.sunfall.r, R(G.roofY - cy), PB.sunfall.r * 2, fy - R(G.roofY - cy)); g.globalAlpha = 1; } }
    /* VERDICT: a sigil hangs where you stood, a dotted line down to the floor (the hero's own sigil) */
    if (m === 'verdictTell') for (const sg of S.sigils) { const sx = R(sg.x - cx); if (X && X.sigil) X.sigil(g, sx, fy - 46, 1, time, fy); C3.drawVerdictFloor(g, sx, fy, PB.verdict.r, time, blink); }
    /* DAWNFALL: the red ring where he will land */
    if (S.leap && (m === 'dawnTell' || m === 'dawn')) { const lx = R(S.leap.x - cx); C3.drawDawnRing(g, lx, fy, PB.dawn.r, time, blink, m === 'dawn' ? 1 : Math.max(0, 1 - e.modeT / PB.dawn.tell)); }
    /* HIS LIGHT-WARD: the hero's all-round dome round him while he guards (brighter a beat after it turns a blow), raised whiter */
    if (PBM.isGuardMode(m) && !(S.ward > 0)) { const hitK = Math.max(0, 1 - (time - (e.wardHitAt ?? -9)) / 0.25);
      C3.drawBossWard(g, x, y, PB.scale, time, m === 'guard' ? Math.max(0.5, hitK) : hitK); }

    /* THE SMITE'S WINDUP (the hero's bloom on the hammer's head) and the radiance's gathering light */
    if (X && (m === 'smiteTell' || m === 'twinTell')) X.windup(g, x + f * 10, y - 40, Math.min(1, 1 - e.modeT / PB.smite.tell), time);
    if (m === 'radianceTell' || m === 'sunfallTell') { for (let i = 0; i < 8; i++) { const t = (time * 0.9 + i / 8) % 1; g.globalAlpha = 0.9 * (1 - t); g.fillStyle = i & 1 ? '#ffd36b' : '#fff6c8'; g.fillRect(x - 16 + ((i * 19) % 33), R(fy - 4 - t * 46), 1, 2); } g.globalAlpha = 1;
      ctx.text(m === 'sunfallTell' ? 'SUNFALL' : e.plus ? 'RADIANCE+' : 'RADIANCE', x, y - 88, '#ff6b6b', 'center', 6); }
    /* HIS PRAYER: gold rising off the brazier (or the floor) into him */
    if (m === 'pray' || m === 'prayTell') { const kb = S.kneelId && G.lamps ? G.lamps.find(q => q.id === S.kneelId) : null;
      if (kb) C3.drawPrayerLight(g, R(kb.x - cx), fy - 34, x, y - 30, time); else { for (let i = 0; i < 7; i++) { const t = (time * 1.2 + i / 7) % 1; g.globalAlpha = 0.9 * (1 - t); g.fillStyle = i & 1 ? '#ffd36b' : '#fff6c8'; g.fillRect(x - 12 + ((i * 19) % 25), R(y - 6 - t * 40), 1, 2); } g.globalAlpha = 1; }
      ctx.text('PRAYER', x, y - 88, '#ffd36b', 'center', 6); }
    if (m === 'guard') ctx.text('LIGHT-WARD', x, y - 88, '#fff6c8', 'center', 6);
    if (m === 'snuffTell') ctx.text('SNUFF', x, y - 88, '#ffd36b', 'center', 6);
    if (m === 'sleep') ctx.text('Z', x + 8 * f, y - 60 - R((time * 8) % 8), '#c8d8e8', 'center', 6);
    if (e.guardFx > 0) e.guardFx = Math.max(0, e.guardFx - 1 / 60);
    /* HIS CONVICTION: five suns in a brass plaque over him (the hero's HUD pips; src/redraw/church3_art.js) - a white flash when one fills, a notch when he spends */
    const by = R(e.y - PB.h * PB.scale - 18 - cy), bx = Math.max(40, Math.min(ctx.VW() - 40, x));
    C3.drawPips(g, bx, by, S.conv, PB.conv.pips, S.barUp || 0, S.barDown || 0, time);
    /* WARD BROKEN: a brazier lit beside him - the shell's shards and the brazier's holy fire thrown into him */
    if (S.broke) { const k = (time - S.broke.t) / 0.8; if (k >= 1) S.broke = null; else { C3.drawWardBreak(g, x, y, k); C3.drawBrazierBreak(g, R(S.broke.bx - cx), fy - 34, x, y - 26, k); } }
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
