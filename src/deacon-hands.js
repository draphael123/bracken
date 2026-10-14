// src/deacon-hands.js - THE DEACON's HANDS (claude/church2). src/deacon.js is the fight (pure); this binds it to the world: his told blows on the heroes (keyed
// once a blow; a shield turns only the yellow ones), the hook's haul, HIS FOUR LAMPS (the level's: src/lit-church-hands.js snuffs them - onLamp, brings a
// chandelier down, and lights them when he kindles), his waiting (asleep behind the parclose until you come up the well into his room),
// and the drawing: GREYBOX shapes until the art pass - a tall cleric in a black cassock and a white stole, a long brass pole (a hook one end, a flame the
// other), every move its own windup + release pose of the pole; his LIGHT BAR, the holy fire of the arc, and the B10 read.
// main.js calls: spawn, owns, idle, wake, update, take, drawBoss, drawOver, barName, end, read, show, clear, onLamp.
import * as DCM from './deacon.js';
const { DC } = DCM;
const SOUND = { tell: s => s.tell && s.tell(false), tellHard: s => s.tell && s.tell(true), glow: s => (s.chime || s.bell || s.tell)(false), whoosh: s => (s.whoosh || s.slash)(), slash: s => (s.slash || s.whoosh)(),
  falter: s => (s.hiss || s.crack || s.clank)(), fire: s => (s.fuse || s.ignite || s.whoosh)() };

export function makeDeaconHands(ctx) {
  let S = null;
  const H = {}, R = Math.round;
  const A = () => (ctx.L && ctx.L.mini && ctx.L.mini.boss === 'deacon' ? ctx.L.mini : null);
  const live = () => ctx.enemies().find(e => e.alive && e.t === 'deacon') || null;
  H.show = () => S;
  H.owns = e => e.t === 'deacon';
  H.clear = () => { S = null; };
  const geom = Ar => ({ x0: Ar.x0, x1: Ar.x1, floorY: Ar.floor, roofY: Ar.y0 });
  H.spawn = base => { const Ar = A(); S = Ar ? DCM.newFight(geom(Ar)) : null;
    return { ...base, t: 'deacon', mini: true, xpRole: 'mini', w: DC.w, h: DC.h, hp: ctx.EHP.deacon, maxHp: ctx.EHP.deacon, noGrav: true, markH: DC.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1, vx: 0 }; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.dcKeys = pp.dcKeys || new Map(); if (pp.dcKeys.size > 80) pp.dcKeys.clear(); if (pp.dcKeys.has(key)) return true; pp.dcKeys.set(key, 1); return false; };
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, pp }));
  function world(e) {
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n),
      mark: m => ctx.number(e.x, e.y - DC.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      lamps: () => (ctx.lamps ? ctx.lamps() : []), kindle: id => (ctx.kindle ? ctx.kindle(id) : false),
      fx: (k, x, y) => { if (k === 'open') ctx.ring(x, y - 22, 30, '#ffd36b'); else if (k === 'ward') ctx.ring(x, y - 22, 34, '#c8d8e8'); },
      haul: (x, v) => { for (const pp of ctx.players) { if (pp.dead || !ctx.upright(pp)) continue; const d = x - pp.x; if (Math.abs(d) < 2) continue; pp.x += Math.sign(d) * Math.min(Math.abs(d), v); pp.vx = 0; } },
      hit: (bx, d, name, o = {}) => { let any = false; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key || name)) return;
          const hp0 = P.hp; let res; hurt(name, () => { res = ctx.damagePlayer(e.x, d, { who: e, name, unblockable: !o.blockable, noKnock: !!o.noKnock }); }); if (P.hp < hp0) any = true;
          if (o.blockable && (res === 'blocked' || (ctx.answered && ctx.answered(res)))) DCM.blowTurned(e, S, world(e), !!(ctx.answered && ctx.answered(res))); }); return any; },
    };
  }
  /* BEFORE THE FIGHT he tends his lamps behind the parclose (you see him on the way to the transept: B8) */
  H.idle = (e, dt) => { if (e.mode === 'sleep') { e.vx = 0; e.anim = (e.anim || 0) + dt; } };
  H.wake = e => { const Ar = A(); if (!Ar) return; if (!S) S = DCM.newFight(geom(Ar)); e.harmless = false; e.gone = 0; e.mode = 'wake'; e.modeT = 1.4; e.y = Ar.floor;
    ctx.number(e.x, e.y - 76, 'THE DEACON KEEPS THE LAMPS', '#ffd36b'); ctx.number((Ar.x0 + Ar.x1) / 2, Ar.floor - 96, 'HIS LAMPS ARE HIS LIGHT: SNUFF THEM, HIT HIM LOW', '#ffd36b'); for (const pp of ctx.players) pp.dcKeys = null; };
  H.update = (e, dt) => { if (!S || !e.alive) return; if (e.mode === 'sleep' || e.mode === 'away') { H.wake(e); return; }
    DCM.stepDeacon(e, S, dt, heroes(), world(e));
    if (S.light > S.lastLight + 4) S.barUp = 0.35; else if (S.light < S.lastLight - 4) S.barDown = 0.35; S.lastLight = S.light; S.barUp = Math.max(0, (S.barUp || 0) - dt); S.barDown = Math.max(0, (S.barDown || 0) - dt); };
  /* THE RULE ON HIM: one of his lamps snuffed, or a chandelier brought down (src/lit-church-hands.js) */
  H.onLamp = l => { const e = live(); if (!S || !e || e.mode === 'away' || !l || !l.deacon) return; const under = !!l.dropped && Math.abs(e.x - (l.x * ctx.TS + 8)) < 20;
    const d = DCM.lampOut(e, S, world(e), { id: l.id, dropped: !!l.dropped, under }); if (d > 0 && ctx.hurtFoe) ctx.hurtFoe(e, d); };
  H.take = (e, dmg, blow) => { if (!S) return dmg; const P = ctx.hero();
    if (!blow && ctx.burnTick && ctx.burnTick()) return DCM.burnOn(e, S, dmg).dmg;
    const heavy = ctx.blowHas ? ctx.blowHas(blow, 'heavy') : false, low = ctx.blowHas ? (ctx.blowHas(blow, 'sweep') || ctx.blowHas(blow, 'low')) : false;
    const r = DCM.blowOn(e, S, world(e), dmg, P.x, P.y, !P.ground && !P.climb, heavy, low);
    if (r.read === 'ward') { e.guardFx = 0.25; e.guardWord = 'WARDED'; ctx.sfx.clank && ctx.sfx.clank(); return 0; }
    if (r.read === 'guard') { e.guardFx = 0.25; e.guardWord = 'GUARDS HIGH: HIT LOW'; ctx.sfx.clank && ctx.sfx.clank(); ctx.sparks(e.x + (Math.sign(P.x - e.x) || 1) * 8, e.y - 36, Math.sign(P.x - e.x) || 1, 5); return r.dmg; }
    e.angleHit = ctx.time(); return r.dmg; };
  H.barName = e => 'THE DEACON' + (DCM.dcOpen(e) ? '  OPEN' : S && S.ward > 0 ? '  WARDED' : '');
  H.end = () => { if (S) { S.fire = []; S.haul = null; } };
  H.read = () => S && { mode: (live() || {}).mode, ph: S.ph, light: R(S.light), n: JSON.parse(JSON.stringify(S.n)), ward: S.ward, hurt: { ...(S.hurt || {}) } };

  /* ---------- DRAWING (GREYBOX: the art lane paints him - scratch list in the lane report) ---------- */
  const POLE = 34;   /* the pole's half-length in px */
  /* the pole by mode: [angle (0 = level, + = tip down), grip x offset, grip y (from his feet), which end leads ('hook' | 'flame')] - each move its own windup + release */
  const poleOf = e => { const m = e.mode, k = Math.max(0, e.modeT);
    switch (m) {
      case 'sweepTell': return [-0.9, -6, 22, 'hook'];            /* drawn back high over his shoulder, low end behind */
      case 'sweep': return [1.25, 10, 14, 'hook'];                /* swept down low across the floor */
      case 'hookTell': return [-0.35, -10, 26, 'hook'];           /* drawn back level at the waist, the hook leading */
      case 'hook': return [0.05, 16, 22, 'hook'];                 /* thrust out its whole length */
      case 'jabTell': return [0.1, -8, 24, 'hook'];
      case 'jab': return [0.05, 18, 24, 'hook'];
      case 'arcTell': return [-1.2, -4, 30, 'flame'];             /* turned over: the flame end up behind him */
      case 'arc': return [1.0, 12, 12, 'flame'];                  /* dragged along the floor, the flame end down */
      case 'kindleTell': return [-1.35, 4, 34, 'flame'];          /* raised straight up to the lamp */
      case 'grope': return [0.5, 10, 18, 'none'];                 /* held out low before him, feeling for the way */
      case 'reel': return [-0.6, -6, 30, 'hook'];
    }
    return [0, 2, 40, 'hook'];   /* ON GUARD: crosswise HIGH over his head (the read: hit him low) */ };
  H.drawBoss = (g, e, cx, cy, time) => { if (!e.alive) return; const f = e.face || 1, x = R(e.x - cx), y = R(e.y - cy), flash = (e.hurtT || 0) > 0, open = DCM.dcOpen(e);
    const hunch = e.mode === 'grope' ? 4 : e.mode === 'reel' ? -2 : 0, top = y - DC.h + hunch;
    g.globalAlpha = 0.3; g.fillStyle = '#10060a'; g.fillRect(x - 9, y - 1, 18, 2); g.globalAlpha = 1;
    /* the cassock, the stole, the head */
    g.fillStyle = flash ? '#ffffff' : '#1d1824'; g.fillRect(x - 6, top + 10, 12, DC.h - 10 - hunch); g.fillRect(x - 7, y - 6, 14, 6);
    g.fillStyle = flash ? '#ffffff' : '#e8e0d0'; g.fillRect(x - 3, top + 11, 2, 18); g.fillRect(x + 1, top + 11, 2, 18);
    g.fillStyle = flash ? '#ffffff' : '#c9a07a'; g.fillRect(x - 3 + f, top + 2, 6, 8); g.fillStyle = '#2a2030'; g.fillRect(x - 4, top, 8, 3);
    /* the pole (brass): its angle and grip by move; the hook at one end, the flame at the other */
    const [ang, gx, gy, lead] = poleOf(e), px0 = x + f * gx, py0 = y - gy, c = Math.cos(ang), s = Math.sin(ang);
    const ax = px0 - f * c * POLE, ay = py0 - s * POLE, bx = px0 + f * c * POLE, by = py0 + s * POLE;
    g.strokeStyle = flash ? '#ffffff' : '#c8a040'; g.lineWidth = 2; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); g.lineWidth = 1;
    g.fillStyle = '#c9a07a'; g.fillRect(R(px0) - 1, R(py0) - 1, 3, 3);   /* his hands on it */
    const hookAt = lead === 'flame' ? [ax, ay] : [bx, by], flameAt = lead === 'flame' ? [bx, by] : [ax, ay];
    g.strokeStyle = '#d8b050'; g.beginPath(); g.arc(hookAt[0] + f * 2, hookAt[1] + 2, 3, -1.6, 1.6 * f); g.stroke();
    if (!open) { const fl = 2 + R(Math.sin(time * 14) * 1); g.fillStyle = e.mode === 'arc' || e.mode === 'arcTell' ? '#fff6c8' : '#ff9a3c'; g.fillRect(R(flameAt[0]) - 1, R(flameAt[1]) - 3 - fl, 3, 3 + fl); g.fillStyle = '#ffd36b'; g.fillRect(R(flameAt[0]), R(flameAt[1]) - 2 - fl, 1, 2); }
    if (e.mode === 'kindleTell') { for (let i = 0; i < 6; i++) { const t = (time * 1.4 + i / 6) % 1; g.globalAlpha = 0.9 * (1 - t); g.fillStyle = i & 1 ? '#ffd36b' : '#fff6c8'; g.fillRect(R(flameAt[0]) - 6 + ((i * 7) % 13), R(flameAt[1] - t * 20), 1, 2); } g.globalAlpha = 1; ctx.text('KINDLE', x, top - 18, '#ffd36b', 'center', 6); }
    if (e.guardFx > 0) { e.guardFx = Math.max(0, e.guardFx - 1 / 60); g.fillStyle = '#ffffff'; g.fillRect(x - 14, R(y - 40) - 1, 28, 3); }
  };
  /* OVER: the holy fire of the arc, his light bar, the read */
  H.drawOver = (g, cx, cy, time) => { const Ar = A(), e = live(); if (!S || !Ar || !e || e.mode === 'away') return; const fy = R(Ar.floor - cy);
    for (const q of S.fire) { const x = R(q.x - cx), k = Math.min(1, q.t / 0.6); for (let i = 0; i < 3; i++) { const h = 4 + R(5 * Math.abs(Math.sin(time * 9 + q.x * 0.3 + i * 2))); g.globalAlpha = 0.85 * k; g.fillStyle = i === 1 ? '#fff6c8' : '#ffd36b'; g.fillRect(x - 5 + i * 4, fy - h, 2, h); } g.globalAlpha = 0.35 * k; g.fillStyle = '#ff9a3c'; g.fillRect(x - 6, fy - 2, 12, 2); g.globalAlpha = 1; }
    const w = 36, x = Math.max(w / 2 + 30, Math.min(ctx.VW() - w / 2 - 4, R(e.x - cx))), by = R(e.y - DC.h - 18 - cy), k = S.light / DC.light.max;
    g.fillStyle = '#1b1626'; g.fillRect(x - w / 2 - 1, by - 1, w + 2, 4); g.fillStyle = S.barDown > 0 ? '#8a6a30' : S.barUp > 0 ? '#fff6c8' : '#ffd36b'; g.fillRect(x - w / 2, by, R(w * k), 2);
    ctx.text('LIGHT', x - w / 2 - 14, by - 1, '#ffd36b', 'center', 4);
    const yy = R(e.y - DC.h / 2 - cy);
    if (DCM.dcOpen(e)) { const kk = Math.max(0, e.open / DC.gropeT); g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, yy, 26, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      ctx.text('HE GROPES', x, by - 10, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(x - 18, by - 5, 36, 3); g.fillStyle = '#8fd160'; g.fillRect(x - 18, by - 5, R(36 * kk), 3); }
    if (S.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.beginPath(); g.arc(x, yy, 28, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; ctx.text('WARDED', x, by - 10, '#c8d8e8', 'center', 5); }
    if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, x, by - 20 - R((0.25 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#e8c070', 'center', 6); };
  /* A STILL SET FOR THE BESTIARY CARD (GREYBOX: his guard pose, two frames of the flame flickering; the art lane draws the real sheet) */
  H.bakeSet = (canvas, flipX, whiten) => { const R0 = [0, 1].map(i => { const [c, g] = canvas(48, 56); H.drawBoss(g, { t: 'deacon', alive: true, mode: 'walk', modeT: 0, face: 1, x: 24, y: 54, anim: i }, 0, 0, i * 0.2); return c; });
    return { R: R0, L: R0.map(flipX), white: { R: R0.map(whiten), L: R0.map(c => flipX(whiten(c))) }, ax: 24, ay: 54, w: DC.w, h: DC.h }; };
  return H;
}
