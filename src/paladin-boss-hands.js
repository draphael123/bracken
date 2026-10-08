// src/paladin-boss-hands.js - THE PALADIN's HANDS (claude/litchurch, the greybox). src/paladin-boss.js is the fight (pure: his three phases, his cycles, his light,
// the falter, the bot's reading); this binds it to the world: his told blows on the heroes (keyed once a blow; a shield turns only the yellow ones), THE
// SANCTUARY's LAMPS (the level's: src/lit-church-hands.js snuffs them - onLamp - and lights them when he kindles), and the drawing (GREYBOX shapes until the
// art pass): a tall man in white-and-gold plate, a maul, his AEGIS a pale ward in front of him while he guards, his LIGHT BAR over him.
// THE SHARED READ (design standard B10): OPEN = a gold ring round him and a timer bar (HE FALTERS); WARDED = a pale shell ring and the word; HIS AEGIS = a turned
// blow CLANKS, flashes and says HIS AEGIS: GO ROUND - and his light bar ticks up gold (you fed him) - never silent.
// main.js calls: spawnBoss, owns, on, update, take, drawBoss, drawOver, barName, end, read, show, clear, onLamp, onKindled.
import * as PBM from './paladin-boss.js';
import * as PAL from './redraw/paladin_art.js';
import { BOSS_PHASE } from './boss-music.js';
const { PB } = PBM;

const SOUND = { tell: s => s.tell && s.tell(false), tellHard: s => s.tell && s.tell(true), slam: s => (s.heavy || s.slash)(), bash: s => (s.clank || s.slash)(), glow: s => (s.chime || s.bell || s.tell)(false),
  radiance: s => (s.aegis || s.chime || s.bell)(), leap: s => (s.pJump || s.whoosh || s.slash)(), falter: s => (s.crack || s.clank)() };

export function makePaladinHands(ctx) {
  let S = null;
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'paladinboss' ? ctx.L.arena : null);
  const R = Math.round;
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'paladinboss';
  H.clear = () => { S = null; BOSS_PHASE.paladin = 1; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.pbKeys = pp.pbKeys || new Map(); if (pp.pbKeys.size > 80) pp.pbKeys.clear(); if (pp.pbKeys.has(key)) return true; pp.pbKeys.set(key, 1); return false; };
  const live = () => { const e = ctx.boss; return e && e.alive && e.t === 'paladinboss' ? e : null; };

  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    S = PBM.newFight(PBM.geom(Ar, ctx.TS)); BOSS_PHASE.paladin = 1;
    const e = { ...base, t: 'paladinboss', w: PB.w, h: PB.h, hp: ctx.EHP.paladinboss, maxHp: ctx.EHP.paladinboss, noGrav: true, markH: PB.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1, pbLight: S.light };
    e.y = S.G.floorY; for (const pp of ctx.players) pp.pbKeys = null; return e; };

  /* ---------- THE WORLD AS HE SEES IT ---------- */
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, air: !pp.ground && !pp.climb, alive: ctx.upright(pp) && !pp.dead, pp }));
  function world(e) {
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n), time: () => ctx.time(),
      music: ph => { BOSS_PHASE.paladin = ph; },   /* (his theme is the file 'Church combat': the phases do not switch it) */
      mark: m => ctx.number(e.x, e.y - PB.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      lamps: () => (ctx.lamps ? ctx.lamps() : []), kindle: id => (ctx.kindle ? ctx.kindle(id) : false),
      fx: (k, x, y) => {
        if (k === 'land') ctx.burst(x, y - 4, 16, ['#fff6c8', '#ffd36b', '#c9b27c'], 90, 0.6);
        else if (k === 'column') ctx.burst(x, y - 30, 14, ['#fff6c8', '#ffd36b', '#ffffff'], 70, 0.5);
        else if (k === 'mend') ctx.burst(x, y - 20, 14, ['#ffd36b', '#fff6c8'], 60, 0.6);
        else if (k === 'open') ctx.ring(x, y - 18, 32, '#ffd36b');
        else if (k === 'ward') ctx.ring(x, y - 18, 36, '#c8d8e8');
        else if (k === 'ring' || k === 'cross') ctx.ring(x, y - 4, k === 'ring' ? PB.leapR : PB.radR, '#ff6b6b'); },
      hit: (bx, d, name, o = {}) => { let any = false; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key || name)) return;
          const hp0 = P.hp; let res; hurt(name, () => { res = ctx.damagePlayer(e.x, d, { who: e, name, unblockable: !o.blockable, noKnock: !!o.noKnock }); }); if (P.hp < hp0) any = true;
          if (o.blockable && (res === 'blocked' || (ctx.answered && ctx.answered(res)))) PBM.blowTurned(e, S, world(e), !!(ctx.answered && ctx.answered(res))); }); return any; },
    };
  }

  /* ---------- ONE FRAME OF HIM ---------- */
  H.update = (e, dt) => {
    if (!S || !e.alive) return; const Ar = A(); if (!Ar) return;
    if (e.mode === 'wake' && !S.woke) { S.woke = true; e.modeT = 1.8; ctx.number(e.x, e.y - 84, 'THE PALADIN, SWORN TO THE LIGHT', '#ffd36b'); }
    if (S.woke && !S.told.rule && e.mode !== 'wake') { S.told.rule = 1; ctx.number((S.G.x0 + S.G.x1) / 2, S.G.floorY - 120, 'HIS AEGIS FEEDS HIS LIGHT: GO ROUND IT AND STARVE IT', '#ffd36b'); }
    PBM.stepPaladin(e, S, dt, heroes(), world(e));
    e.phase = S.ph;
    /* THE BAR's change, for the drawing: a gold tick when it climbs on a blow, a dark notch when it drops */
    if (S.light > S.lastLight + 4) S.barUp = 0.35; else if (S.light < S.lastLight - 4) S.barDown = 0.35; S.lastLight = S.light; S.barUp = Math.max(0, (S.barUp || 0) - dt); S.barDown = Math.max(0, (S.barDown || 0) - dt);
  };
  /* THE RULE ON HIM: a sanctuary lamp snuffed by a hero (src/lit-church-hands.js) */
  H.onLamp = () => { const e = live(); if (!S || !e || !ctx.bossActive) return; PBM.lampOut(e, S, world(e)); };
  H.onKindled = () => { const e = live(); if (!S || !e) return; ctx.number(e.x, e.y - 70, 'THE LAMP BURNS AGAIN: HIS LIGHT CLIMBS FROM IT', '#ff9a5c'); };
  /* A BLOW ON HIM: src/paladin-boss.js blowOn - the ward turns everything; his aegis turns the front while he guards (and drinks it); open, x falterMul */
  H.take = (e, dmg, blow) => { if (!S) return dmg; const P = ctx.hero(), t = ctx.time();
    const heavy = ctx.blowHas ? ctx.blowHas(blow, 'heavy') : false, r = PBM.blowOn(e, S, world(e), dmg, P.x, P.y, !P.ground && !P.climb, heavy);
    if (r.read === 'ward') { e.guardFx = 0.25; e.guardWord = 'WARDED'; ctx.sfx.clank && ctx.sfx.clank(); return 0; }
    if (r.read === 'aegis') { e.guardFx = 0.25; e.guardWord = S.n.guarded < 6 ? ['HIS AEGIS: GO ROUND', 'HIS AEGIS: STRIKE FROM ABOVE'][S.n.guarded % 2] : 'HIS AEGIS';
      ctx.sfx.aegis ? ctx.sfx.aegis() : ctx.sfx.clank && ctx.sfx.clank(); ctx.sparks(e.x + (Math.sign(P.x - e.x) || 1) * 12, e.y - 20, Math.sign(P.x - e.x) || 1, 5); return 0; }
    e.angleHit = t;   /* (a blow round his aegis is the right blow: not greed - src/main.js greedHit) */
    return r.dmg; };
  H.barName = e => 'THE PALADIN' + (PBM.pbOpen(e) ? '  OPEN' : S && S.ward > 0 ? '  WARDED' : '');
  H.end = e => { if (S) { S.marks = []; S.holy = []; S.leap = null; } BOSS_PHASE.paladin = 1; };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, cycle: S.cycle, light: Math.round(S.light), n: JSON.parse(JSON.stringify(S.n)), ward: S.ward, hurt: { ...(S.hurt || {}) } };

  /* ---------- DRAWING (the art pass: src/redraw/paladin_art.js paints him from a pose rig that glides between his moves) ---------- */
  /* HIM: white-and-gold plate, a gilt-rimmed aegis, a great maul, a nimbus that is his light bar made visible; the pose by mode, eased (no pops) */
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    const p = e.pa || (e.pa = PAL.newPose()), dt = e.paT == null ? 1 / 60 : Math.max(0.001, Math.min(0.06, time - e.paT)); e.paT = time;
    PAL.stepPose(p, e.mode, dt, e.x, { ward: S.ward > 0 });
    const f = e.face || 1, x = R(e.x - cx), y = R(e.y - cy - (e.lift || 0)), fy = R(e.y - cy), flash = (e.hurtT || 0) > 0, m = e.mode, open = PBM.pbOpen(e);
    g.globalAlpha = 0.3 * (1 - Math.min(1, (e.lift || 0) / 90)); g.fillStyle = '#10060a'; g.fillRect(x - 12, fy - 1, 24, 2); g.globalAlpha = 1;   /* his shadow stays on the floor when he leaps */
    const spr = PAL.bakeFigure(p, { light: open ? 0 : S.light / PB.light.max, flash, phase3: S.ph >= 3, guard: m === 'walk' || m === 'recover', hammerGlow: m === 'rad' || m === 'radTell' ? 1 : 0 });
    if (f > 0) g.drawImage(spr, x - PAL.OX, y - PAL.OY); else { g.save(); g.translate(x, 0); g.scale(-1, 1); g.drawImage(spr, -PAL.OX, y - PAL.OY); g.restore(); }
    /* HIS AEGIS: a ward arc of light in front of him while he guards (the angle it turns): brighter as the light is fuller */
    if (m === 'walk' || m === 'recover') { const k = 0.25 + 0.5 * (S.light / PB.light.max); g.globalAlpha = k * (0.8 + 0.2 * Math.sin(time * 8)); g.strokeStyle = '#fff6c8'; g.lineWidth = 2; g.beginPath(); g.arc(x + f * 9, y - 18, 17, f > 0 ? -1.1 : Math.PI - 1.1, f > 0 ? 1.1 : Math.PI + 1.1); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; }
    if (m === 'bash' || m === 'bashTell') { g.globalAlpha = m === 'bash' ? 0.7 : 0.35; g.fillStyle = '#fff6c8'; g.fillRect(x + f * 18 - (f < 0 ? 3 : 0), y - 30, 3, 24); g.globalAlpha = 1; }
    /* a prayer (mend, kindle): gold rising round him */
    if (m === 'mendTell' || m === 'kindleTell') { for (let i = 0; i < 7; i++) { const t = (time * 0.9 + i / 7) % 1; g.globalAlpha = 0.9 * (1 - t); g.fillStyle = i & 1 ? '#ffd36b' : '#fff6c8'; g.fillRect(x - 12 + ((i * 19) % 25), R(y - 6 - t * 38), 1, 2); } g.globalAlpha = 1; ctx.text(m === 'mendTell' ? 'MEND' : 'KINDLE', x, y - 58, '#ffd36b', 'center', 6); }
    if (m === 'sleep') ctx.text('Z', x + 8 * f, y - 52 - R((time * 8) % 8), '#c8d8e8', 'center', 6);
    if (e.guardFx > 0) { g.fillStyle = '#ffffff'; g.fillRect(x + f * 14 - 2, y - 34, 5, 18); }
  };
  /* THE MARKS, THE HOLY FLOOR, THE LIGHT BAR, and THE READ (open ring + timer, ward shell, the aegis's word) */
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar || !ctx.bossActive) return; const e = ctx.boss; if (!e || e.t !== 'paladinboss') return; const G = S.G;
    const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0', fy = R(G.floorY - cy);
    /* RADIANCE: red crosses on the floor, then the columns (the window's light) */
    for (const mk of S.marks) { const x = R(mk.x - cx);
      if (e.mode === 'radTell') { g.strokeStyle = blink; g.beginPath(); g.moveTo(x - 6, fy - 8); g.lineTo(x + 6, fy); g.moveTo(x + 6, fy - 8); g.lineTo(x - 6, fy); g.stroke(); PAL.drawColumn(g, x, R(G.roofY - cy), fy, PB.radR, time, 0.16 + 0.1 * Math.sin(time * 10)); }
      if (e.mode === 'rad') PAL.drawColumn(g, x, R(G.roofY - cy), fy, PB.radR, time, 1); }
    /* JUDGEMENT: the red ring where he will land */
    if (S.leap && (e.mode === 'leapTell' || e.mode === 'leap')) { const x = R(S.leap.x - cx); g.strokeStyle = blink; g.lineWidth = 2; g.beginPath(); g.ellipse(x, fy - 1, PB.leapR, 5, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; }
    /* THE HOLY FLOOR: it burns where he landed */
    for (const q of S.holy) PAL.drawHolyFloor(g, R(q.x - cx), fy, PB.holyW, time, 1);
    /* THE LIGHT BAR over him (drawn with every change: gold up when his aegis drinks a blow, a dark notch when one lands) */
    const x = R(e.x - cx), by = R(e.y - PB.h - 18 - cy - (e.lift || 0)), w = 40, k = S.light / PB.light.max;
    PAL.drawLightBar(g, x, by, w, k, { open: PBM.pbOpen(e), up: S.barUp > 0, down: S.barDown > 0 });
    ctx.text('LIGHT', x - w / 2 - 14, by - 1, '#ffd36b', 'center', 4);
    /* THE READ (B10) */
    const yy = R(e.y - PB.h / 2 - cy);
    if (PBM.pbOpen(e)) { const kk = Math.max(0, e.open / PB.falterT);
      g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, yy, 26, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      ctx.text('HE FALTERS', x, by - 10, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(x - 18, by - 5, 36, 3); g.fillStyle = '#8fd160'; g.fillRect(x - 18, by - 5, R(36 * kk), 3); }
    if (S.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.beginPath(); g.arc(x, yy, 28, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      ctx.text('WARDED', x, by - 10, '#c8d8e8', 'center', 5); }
    if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, x, by - 20 - R((0.25 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#e8c070', 'center', 6);
  };
  return H;
}
