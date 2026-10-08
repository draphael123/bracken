// src/paladin-boss-hands.js - THE PALADIN's HANDS (claude/litchurch, the greybox). src/paladin-boss.js is the fight (pure: his three phases, his cycles, his light,
// the falter, the bot's reading); this binds it to the world: his told blows on the heroes (keyed once a blow; a shield turns only the yellow ones), THE
// SANCTUARY's LAMPS (the level's: src/lit-church-hands.js snuffs them - onLamp - and lights them when he kindles), and the drawing (GREYBOX shapes until the
// art pass): a tall man in white-and-gold plate, a maul, his AEGIS a pale ward in front of him while he guards, his LIGHT BAR over him.
// THE SHARED READ (design standard B10): OPEN = a gold ring round him and a timer bar (HE FALTERS); WARDED = a pale shell ring and the word; HIS AEGIS = a turned
// blow CLANKS, flashes and says HIS AEGIS: GO ROUND - and his light bar ticks up gold (you fed him) - never silent.
// main.js calls: spawnBoss, owns, on, update, take, drawBoss, drawOver, barName, end, read, show, clear, onLamp, onKindled.
import * as PBM from './paladin-boss.js';
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
      music: ph => { BOSS_PHASE.paladin = ph; if (ctx.music) ctx.music(ph > 1 ? 'paladin:p' + ph : 'paladin'); },
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
  H.onKindled = () => { const e = live(); if (!S || !e) return; ctx.number(e.x, e.y - 70, 'THE LAMP BURNS AGAIN: HIS LIGHT FILLS', '#ff9a5c'); };
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

  /* ---------- DRAWING (GREYBOX) ---------- */
  /* HIM: white-and-gold plate, a great maul, a pale aegis in front while he guards; his pose by mode (plain shapes until the art pass) */
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    const x = R(e.x - cx), y = R(e.y - cy - (e.lift || 0)), f = e.face || 1, m = e.mode, flash = (e.hurtT || 0) > 0;
    const plate = flash ? '#ffffff' : '#d8dce4', shade = flash ? '#ffffff' : '#9aa0ac', gold = flash ? '#ffffff' : '#d8b040', dark = '#1b1626';
    g.globalAlpha = 0.3; g.fillStyle = '#10060a'; g.fillRect(x - 11, R(e.y - cy) - 1, 22, 2); g.globalAlpha = 1;
    const kneel = m === 'falter', crouch = kneel ? 10 : m === 'leapTell' ? 4 : 0;
    /* legs, body, helm */
    g.fillStyle = shade; g.fillRect(x - 6, y - 12 + crouch, 5, 12 - crouch); g.fillRect(x + 1, y - 12 + crouch, 5, 12 - crouch);
    g.fillStyle = plate; g.fillRect(x - 8, y - 28 + crouch, 16, 17); g.fillStyle = gold; g.fillRect(x - 8, y - 20 + crouch, 16, 2); g.fillRect(x - 1, y - 28 + crouch, 2, 8);
    g.fillStyle = plate; g.fillRect(x - 5, y - 36 + crouch, 10, 9); g.fillStyle = dark; g.fillRect(x + (f > 0 ? 1 : -4), y - 33 + crouch, 3, 2); g.fillStyle = gold; g.fillRect(x - 5, y - 37 + crouch, 10, 1);
    g.fillStyle = '#e8e0c8'; g.fillRect(x - f * 9, y - 26 + crouch, 3, 14);   /* the tabard's tail */
    /* THE MAUL, by pose: up for a tell, down through a blow, its head on the floor when he falters */
    const up = /Tell$/.test(m) && m !== 'mendTell' && m !== 'kindleTell', swing = m === 'chain' || m === 'bash' || m === 'land' || m === 'rad';
    let hx = x + f * 10, hy = y - 22 + crouch;
    if (up) { hx = x - f * 4; hy = y - 46; } else if (swing) { hx = x + f * 22; hy = y - 8; } else if (kneel) { hx = x + f * 14; hy = y - 3; }
    g.strokeStyle = '#6a4a2a'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + f * 4, y - 20 + crouch); g.lineTo(hx, hy); g.stroke(); g.lineWidth = 1;
    g.fillStyle = flash ? '#ffffff' : '#7c8797'; g.fillRect(hx - 5, hy - 4, 10, 8); g.fillStyle = gold; g.fillRect(hx - 5, hy - 1, 10, 2);
    if (up && (m === 'radTell' || m === 'leapTell')) { g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 14); g.fillStyle = '#fff6c8'; g.beginPath(); g.arc(hx, hy, 7, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
    /* HIS AEGIS: a pale arc of light in front of him while he guards (the angle it turns), brighter as the light is fuller */
    if (m === 'walk' || m === 'recover') { const k = 0.25 + 0.5 * (S.light / PB.light.max); g.globalAlpha = k; g.strokeStyle = '#fff6c8'; g.lineWidth = 2; g.beginPath(); g.arc(x + f * 6, y - 18, 16, f > 0 ? -1.1 : Math.PI - 1.1 + 0.0, f > 0 ? 1.1 : Math.PI + 1.1); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; }
    /* the bash: the aegis shoved forward */
    if (m === 'bash' || m === 'bashTell') { g.globalAlpha = m === 'bash' ? 0.8 : 0.4; g.fillStyle = '#fff6c8'; g.fillRect(x + f * 12 - (f < 0 ? 4 : 0), y - 32, 4, 28); g.globalAlpha = 1; }
    /* a prayer (mend, kindle): gold rising round him */
    if (m === 'mendTell' || m === 'kindleTell') { g.globalAlpha = 0.4 + 0.3 * Math.sin(time * 12); g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(x, y - 18, 18, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; ctx.text(m === 'mendTell' ? 'MEND' : 'KINDLE', x, y - 48, '#ffd36b', 'center', 6); }
    if (m === 'sleep') ctx.text('Z', x + 8 * f, y - 40 - R((time * 8) % 8), '#c8d8e8', 'center', 6);
    if (e.guardFx > 0) { g.fillStyle = '#ffffff'; g.fillRect(x + f * 12 - 2, y - 34, 5, 18); }
  };
  /* THE MARKS, THE HOLY FLOOR, THE LIGHT BAR, and THE READ (open ring + timer, ward shell, the aegis's word) */
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar || !ctx.bossActive) return; const e = ctx.boss; if (!e || e.t !== 'paladinboss') return; const G = S.G;
    const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0', fy = R(G.floorY - cy);
    /* RADIANCE: red crosses on the floor, then the columns (the window's light) */
    for (const mk of S.marks) { const x = R(mk.x - cx);
      if (e.mode === 'radTell') { g.strokeStyle = blink; g.beginPath(); g.moveTo(x - 6, fy - 8); g.lineTo(x + 6, fy); g.moveTo(x + 6, fy - 8); g.lineTo(x - 6, fy); g.stroke(); g.globalAlpha = 0.15 + 0.1 * Math.sin(time * 10); g.fillStyle = '#fff6c8'; g.fillRect(x - PB.radR, R(G.roofY - cy), PB.radR * 2, fy - R(G.roofY - cy)); g.globalAlpha = 1; }
      if (e.mode === 'rad') { g.globalAlpha = 0.75; g.fillStyle = '#fff6c8'; g.fillRect(x - PB.radR, R(G.roofY - cy), PB.radR * 2, fy - R(G.roofY - cy)); g.globalAlpha = 1; } }
    /* JUDGEMENT: the red ring where he will land */
    if (S.leap && (e.mode === 'leapTell' || e.mode === 'leap')) { const x = R(S.leap.x - cx); g.strokeStyle = blink; g.lineWidth = 2; g.beginPath(); g.ellipse(x, fy - 1, PB.leapR, 5, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; }
    /* THE HOLY FLOOR: it burns where he landed */
    for (const q of S.holy) { const x = R(q.x - cx); for (let i = -PB.holyW; i < PB.holyW; i += 3) { const h = 4 + 5 * Math.abs(Math.sin(time * 9 + i)); g.fillStyle = (i / 3) & 1 ? '#ffd36b' : '#fff6c8'; g.fillRect(x + i, fy - R(h), 2, R(h)); } }
    /* THE LIGHT BAR over him (drawn with every change: gold up when his aegis drinks a blow, a dark notch when one lands) */
    const x = R(e.x - cx), by = R(e.y - PB.h - 18 - cy - (e.lift || 0)), w = 40, k = S.light / PB.light.max;
    g.fillStyle = '#1b1626'; g.fillRect(x - w / 2 - 1, by - 1, w + 2, 5); g.fillStyle = PBM.pbOpen(e) ? '#5a5a6a' : S.barUp > 0 ? '#ffffff' : '#ffd36b'; g.fillRect(x - w / 2, by, R(w * k), 3);
    if (S.barDown > 0) { g.fillStyle = '#ff6b6b'; g.fillRect(x - w / 2 + R(w * k), by, 3, 3); }
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
