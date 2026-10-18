// src/deacon-hands.js - THE DEACON's HANDS (claude/church2). src/deacon.js is the fight (pure); this binds it to the world: his told blows on the heroes (keyed
// once a blow; a shield turns only the yellow ones), the hook's haul, HIS FOUR LAMPS (the level's: src/lit-church-hands.js snuffs them - onLamp, brings a
// chandelier down, and lights them when he kindles), his waiting (asleep behind the parclose until you come up the well into his room),
// and the drawing: GREYBOX shapes until the art pass - a tall cleric in a black cassock and a white stole, a long brass pole (a hook one end, a flame the
// other), every move its own windup + release pose of the pole; his LIGHT BAR, the holy fire of the arc, and the B10 read.
// main.js calls: spawn, owns, idle, wake, update, take, drawBoss, drawOver, barName, end, read, show, clear, onLamp.
import * as DCM from './deacon.js';
import * as ART from './redraw/deacon_art.js';
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
      lamps: () => (ctx.lamps ? ctx.lamps() : []), kindle: id => (ctx.kindle ? ctx.kindle(id) : false), douse: id => (ctx.douse ? ctx.douse(id) : false),
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
  /* (claude/church3) TWO WAYS: a lamp he doused, lit again by a hero's flame - he falters (src/lit-church-hands.js lightLamp -> ctx.bossKindled) */
  H.onKindled = l => { const e = live(); if (!S || !e || !l || !l.deacon || l.by !== 'hero' || !l.wasDoused) return; DCM.relit(e, S, world(e)); };
  /* HIS ARC'S HOLY FIRE is a fire: E beside a patch takes a flame (src/lit-church-hands.js fires) */
  H.fires = () => (S && live() ? S.fire.filter(q => q.t > 0.4).map(q => ({ x: q.x, y: S.G.floorY, patch: true })) : []);
  H.take = (e, dmg, blow) => { if (!S) return dmg; const P = ctx.hero();
    if (!blow && ctx.burnTick && ctx.burnTick()) return DCM.burnOn(e, S, dmg).dmg;
    const heavy = ctx.blowHas ? ctx.blowHas(blow, 'heavy') : false, low = ctx.blowHas ? (ctx.blowHas(blow, 'sweep') || ctx.blowHas(blow, 'low')) : false;
    const r = DCM.blowOn(e, S, world(e), dmg, P.x, P.y, !P.ground && !P.climb, heavy, low);
    if (r.read === 'ward') { e.guardFx = 0.25; e.guardWord = 'WARDED'; ctx.sfx.clank && ctx.sfx.clank(); return 0; }
    if (r.read === 'guard') { e.guardFx = 0.25; e.guardWord = 'GUARDS HIGH: HIT LOW'; ctx.sfx.clank && ctx.sfx.clank(); ctx.sparks(e.x + (Math.sign(P.x - e.x) || 1) * 8, e.y - 36, Math.sign(P.x - e.x) || 1, 5); return r.dmg; }
    e.angleHit = ctx.time(); return r.dmg; };
  H.barName = e => 'THE DEACON' + (DCM.dcOpen(e) ? '  OPEN' : S && S.ward > 0 ? '  WARDED' : '');
  H.end = () => { if (S) { S.fire = []; S.haul = null; } };
  H.read = () => S && { mode: (live() || {}).mode, ph: S.ph, light: R(S.light), douseCd: +S.douseCd.toFixed(2), n: JSON.parse(JSON.stringify(S.n)), ward: S.ward, hurt: { ...(S.hurt || {}) } };

  /* ---------- DRAWING (src/redraw/deacon_art.js: the pixel sheet; this decides WHEN, and lays the chain, the arc's fire, the light bar and the read over it) ---------- */
  H.drawBoss = (g, e, cx, cy, time) => { if (!e.alive) return; const f = e.face || 1, x = R(e.x - cx), y = R(e.y - cy), flash = (e.hurtT || 0) > 0;
    const r = ART.drawDeacon(g, e, x, y, f, time, flash); e.lastSet = H.bodySet || e.lastSet; e.lastFrame = 0;
    const tipAt = r.B.hook ? r.at(r.B.hook) : null;
    if (tipAt && (e.mode === 'hook' || e.mode === 'hookTell' || e.mode === 'jabTell' || e.mode === 'jab')) {   /* THE SNUFFER CHAIN: coiled while he draws it back, flung its whole reach, slack once it has caught */
      if (e.mode === 'hook') ART.drawChain(g, tipAt[0], tipAt[1] + 3, x + f * DC.hook.reach, tipAt[1] + 6, time, true);
      else if (e.mode === 'hookTell') { for (let i = 0; i < 3; i++) ART.drawChain(g, tipAt[0] - f * (2 + i * 3), tipAt[1] + 3 + i * 2, tipAt[0] - f * (2 + i * 3) + f * 2, tipAt[1] + 9 + i * 2, time, false); }
      else ART.drawChain(g, tipAt[0], tipAt[1] + 3, tipAt[0] + f * 10, tipAt[1] + 14, time, false); }
    if (e.mode === 'douseTell' || e.mode === 'douse') { const tl = (ctx.lamps ? ctx.lamps() : []).find(q => q.id === S.douseId), up = e.mode === 'douseTell', tx = tl ? R(tl.x - cx) : x + f * 40, ty = up ? y - 58 : y - 30;   /* (claude/church3, GREYBOX) THE SNUFFER CAP: raised over the lamp (windup), brought down on it (release) */
      g.strokeStyle = '#c8a040'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + f * 4, y - 34); g.lineTo(tx, ty); g.stroke(); g.lineWidth = 1; g.fillStyle = '#8a6a28'; g.fillRect(tx - 4, ty, 8, 5); g.fillStyle = '#e8c870'; g.fillRect(tx - 3, ty, 6, 1);
      if (up) { g.globalAlpha = 0.5 + 0.4 * Math.sin(time * 14); g.fillStyle = '#ffd36b'; g.fillRect(tx - 1, ty - 4, 2, 2); g.globalAlpha = 1; } }
    if (e.guardFx > 0) { e.guardFx = Math.max(0, e.guardFx - 1 / 60); g.globalAlpha = Math.min(1, e.guardFx * 6); g.fillStyle = '#ffffff'; g.fillRect(x + f * 10 - 2, y - 46, 4, 4); g.fillRect(x + f * 10 - 5, y - 44, 10, 1); g.fillRect(x + f * 10 - 1, y - 49, 2, 10); g.globalAlpha = 1; }
  };
  /* OVER: the holy fire of the arc, his light bar, the read */
  H.drawOver = (g, cx, cy, time) => { const Ar = A(), e = live(); if (!S || !Ar || !e || e.mode === 'away') return; const fy = R(Ar.floor - cy);
    for (const q of S.fire) ART.drawArcPatch(g, R(q.x - cx), fy, Math.min(1, q.t / 0.6), time, q.x);
    const w = 36, x = Math.max(w / 2 + 30, Math.min(ctx.VW() - w / 2 - 4, R(e.x - cx))), by = R(e.y - DC.h - 18 - cy), k = S.light / DC.light.max;
    ART.drawLightBar(g, x, by, k, S.barDown > 0 ? 'down' : S.barUp > 0 ? 'up' : '', time);
    ctx.text('LIGHT', x - w / 2 - 14, by - 7, '#ffd36b', 'center', 4);
    const yy = R(e.y - DC.h / 2 - cy);
    if (DCM.dcOpen(e)) { const kk = Math.max(0, e.open / DC.gropeT); g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, yy, 26, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      ctx.text('HE GROPES', x, by - 12, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(x - 18, by - 7, 36, 3); g.fillStyle = '#8fd160'; g.fillRect(x - 18, by - 7, R(36 * kk), 3); }
    if (S.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.beginPath(); g.arc(x, yy, 28, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; ctx.text('WARDED', x, by - 12, '#c8d8e8', 'center', 6); }
    if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, x, by - 22 - R((0.25 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#e8c070', 'center', 6); };
  /* THE BESTIARY CARD (the guard, the pole's flame flickering, a step) and THE BODY HE LEAVES (kneeling over the planted pole: bossBodies draws it tipping over) */
  H.bakeSet = (canvas, flipX, whiten) => { const card = ART.bakeCard(canvas, flipX, whiten), B = ART.bakePose('dead');
    H.bodySet = { R: [B.c], L: [B.cL], white: { R: [B.cW], L: [B.cWL] }, ax: ART.AX, ay: ART.AY, w: DC.w, h: DC.h }; return card; };
  return H;
}
