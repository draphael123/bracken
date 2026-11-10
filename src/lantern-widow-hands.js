// src/lantern-widow-hands.js - THE LANTERN WIDOW's HANDS (claude/wispwood, the OPUS GREYBOX). src/lantern-widow.js is the fight (pure); this binds it to the world:
// the heroes' lanterns and the rim lamps (through src/wispwood-hands.js: steal / giveBack / drown / snuff / light), the glade's dark (L.dark while she holds the light),
// her told blows on the heroes (keyed once a blow), A HERO'S BLOW ON HER LANTERN (strike(hb): the reclaim) or on a false light - and the drawing.
// DRAWING: src/redraw/lantern_widow_art.js (claude/wispart): every move its own windup pose and release pose (POSE, B16, the art's brief), its own sound (SOUND).
// main.js calls (one tagged line each): spawnBoss, owns, on, update, take, strike, drawBoss, drawOver, barName, end, lights, clear.
import * as WDM from './lantern-widow.js';
import { WD_SAY } from './ww-lines.js'; import * as LWA from './redraw/lantern_widow_art.js';
const { WD } = WDM;

export const SOUND = { veilTell: s => (s.tell)(), veil: s => (s.whoosh || s.tell)(), wailTell: s => (s.charge || s.tell)(), wail: s => (s.queenShriek || s.roar || s.tell)(),
  handsTell: s => (s.tell)(), hands: s => (s.thud)(), theftTell: s => { (s.charge || s.tell)(); }, theft: s => (s.ghostWake || s.moan || s.whoosh || s.tell)(),
  reclaim: s => { (s.crack || s.thud)(); (s.ui || s.tell)(); }, rise: s => (s.whoosh || s.tell)(), lament: s => (s.queenShriek || s.roar || s.thud)(),
  marchTell: s => (s.bell || s.clank || s.tell)(), march: s => (s.thud)(), pop: s => (s.puff || s.thud)(), wake: s => (s.moan || s.roar || s.tell)() };
/* THE POSE A MODE WEARS (the art's brief, local px, facing right, feet at 0,0): lantern hand [x, y], free hand [x, y], veil spread (px), lean, mouth, what shows. Windup and release differ */
export const POSE = {
  sleep: { lan: [10, -16], hand: [-6, -14], veil: 4, lean: 0, mouth: 'shut', bow: true },
  wake: { lan: [12, -30], hand: [-10, -28], veil: 10, lean: -2, mouth: 'open' },
  drift: { lan: [12, -16], hand: [-6, -16], veil: 6, lean: 3, mouth: 'shut' },
  perch: { lan: [12, -20], hand: [-8, -20], veil: 8, lean: 0, mouth: 'shut', bright: true },
  glide: { lan: [16, -18], hand: [-12, -18], veil: 14, lean: 12, mouth: 'shut', bright: true },
  veilTell: { lan: [10, -16], hand: [-16, -26], veil: 2, lean: -6, mouth: 'shut' },
  veil: { lan: [10, -16], hand: [26, -12], veil: 30, lean: 10, mouth: 'open' },
  wailTell: { lan: [12, -14], hand: [-6, -30], veil: 6, lean: -4, mouth: 'open', head: -2 },
  wail: { lan: [12, -14], hand: [-6, -30], veil: 18, lean: 0, mouth: 'wide', head: -4 },
  handsTell: { lan: [12, -24], hand: [-4, 0], veil: 6, lean: 14, mouth: 'shut', bow: true },
  hands: { lan: [12, -24], hand: [-4, 4], veil: 6, lean: 18, mouth: 'open', bow: true },
  theftTell: { lan: [4, -34], hand: [22, -20], veil: 12, lean: 6, mouth: 'open', beckon: true },
  reel: { lan: [-14, -6], hand: [10, -34], veil: 4, lean: -18, mouth: 'wide', dim: true },
  lament: { lan: [0, -40], hand: [0, -40], veil: 20, lean: 0, mouth: 'wide', head: -4, bright: true },
  marchTell: { lan: [12, -30], hand: [-14, -26], veil: 8, lean: -3, mouth: 'shut', bell: true },
  march: { lan: [12, -30], hand: [-20, -14], veil: 16, lean: 4, mouth: 'open', bell: true },
};
const R = Math.round;

export function makeLanternWidowHands(ctx) {
  let S = null; const H = {};
  const TS = ctx.TS, A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'lanternwidow' ? ctx.L.arena : null);
  const WWH = () => ctx.ww && ctx.ww();
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'lanternwidow';
  H.clear = () => { if (S && ctx.L && S.dark0 !== undefined) ctx.L.dark = S.dark0; S = null; };
  const live = () => { const e = ctx.boss; return e && e.alive && e.t === 'lanternwidow' ? e : null; };
  const keyed = (pp, key) => { pp.wdKeys = pp.wdKeys || new Set(); if (pp.wdKeys.size > 200) pp.wdKeys.clear(); if (pp.wdKeys.has(key)) return true; pp.wdKeys.add(key); return false; };
  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null; S = WDM.newFight(WDM.geom(ctx.L, TS)); S.dark0 = ctx.L.dark || 0;
    const hp = (ctx.EHP && ctx.EHP.lanternwidow) || WD.hp;
    const e = { ...base, t: 'lanternwidow', w: WD.w, h: WD.h, hp, maxHp: hp, noGrav: true, markH: WD.markH, face: -1, mode: 'sleep', modeT: 0, phase: 1, boss: true };
    for (const pp of ctx.players()) pp.wdKeys = null; return e; };
  const heroes = () => ctx.players().map((pp, i) => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: !pp.dead && (ctx.upright ? ctx.upright(pp) : true), pp, id: i }));
  const sayKey = { theft: [WD_SAY.theft, '#ff9a5c'], theftAll: [WD_SAY.theftAll, '#ff9a5c'], reclaim: [WD_SAY.reclaim + ': ' + WD_SAY.open, '#ffd36b'], drown: [WD_SAY.drown, '#8aa0c0'], falseLight: [WD_SAY.falseLight, '#bfe6f5'] };
  function world(e) {
    const G = WWH(), lamps = () => (G && ctx.L && ctx.L.ww ? ctx.L.ww.lamps.filter(l => S.G.lamps.includes(l.id)) : []);
    return {
      sound: k => { const f = SOUND[k]; if (f && ctx.sfx) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake && ctx.shake(n),
      mark: (m, who) => ctx.number(who.x, who.y - WD.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      say: (k, x, y) => { const s = sayKey[k]; if (s) ctx.number(x, y - WD.markH - 8, s[0], s[1]); },
      fx: (k, x, y) => { if (k === 'open' && ctx.ring) ctx.ring(x, y - WD.h / 2, 22, '#ffd36b'); },
      music: () => {},
      hitHero: (h, d, name, key, o = {}) => { const pp = h.pp; if (!pp || keyed(pp, key)) return; ctx.asPlayer(pp, () => { const hp0 = pp.hp; const r = ctx.damage(e.x, d, { who: e, name: 'THE LANTERN WIDOW', unblockable: !o.blockable });
        if (pp.hp < hp0) { S.hurt[name] = (S.hurt[name] || 0) + (hp0 - pp.hp); if (o.hold && r !== 'blocked') pp.rootT = Math.max(pp.rootT || 0, o.hold); } }); },
      stealAll: () => { if (G) for (const pp of ctx.players()) if (!pp.dead) G.steal(pp, 'widow'); if (ctx.L) ctx.L.dark = 0.88; },
      giveAll: () => { if (G) for (const pp of ctx.players()) G.giveBack(pp); if (ctx.L) ctx.L.dark = S.dark0; },
      drown: () => { if (G) { for (const l of lamps()) G.light(l.id); for (const pp of ctx.players()) G.drown(pp, WD_SAY.drown); } if (ctx.L) ctx.L.dark = S.dark0; },
      snuffLamps: () => { if (G) for (const l of lamps()) G.snuff(l.id); },
      lampsNear: (x, r) => lamps().filter(l => Math.abs(l.x - x) <= r).map(l => l.id),
      snuff: id => G && G.snuff(id),
    };
  }
  /* THE LIGHTS SHE LENDS the wood's spectral cells (src/wispwood-hands.js ctx.extraLights): her great lantern, her false lights */
  H.lights = () => { const e = live(); if (!S || !e || !A()) return []; const lp = WDM.lanternAt(e), out = [{ x: lp.x, y: lp.y, r: WDM.glowOf(e, S), kind: 'widow' }];
    for (const f of S.falses) if (!f.dead) out.push({ x: f.x, y: f.y, r: WD.falseLight.glow, kind: 'false' }); return out; };
  H.update = (e, dt) => { if (!S || !e.alive || !A()) return;
    if (e.mode === 'wake' && !S.woke) { S.woke = true; ctx.number(e.x, e.y - WD.markH - 16, WD_SAY.wake, '#bfe6ff'); world(e).sound('wake'); if (WWH()) for (const l of (ctx.L.ww.lamps || [])) if (S.G.lamps.includes(l.id)) WWH().light(l.id); }
    if (S.woke && S.n.thefts === 1 && !S.told.rule) { S.told.rule = 1; ctx.hint && ctx.hint(WD_SAY.rule); }
    WDM.step(e, S, dt, heroes(), world(e)); e.phase = S.ph; e.open = WDM.wdOpen(e) ? Math.max(0, e.modeT) : 0; };
  /* A HERO'S BLOW on her lantern (the reclaim) or on a false light */
  H.strike = hb => { if (!S || !hb || !ctx.bossActive) return; const e = live(); if (!e) return; const lp = WDM.lanternAt(e), r = WD.reclaim.r;
    if (S.stolen && hb.l < lp.x + r && hb.r > lp.x - r && hb.t < lp.y + r && hb.b > lp.y - r) WDM.reclaim(e, S, world(e));
    S.falses.forEach((f, i) => { if (!f.dead && hb.l < f.x + 8 && hb.r > f.x - 8 && hb.t < f.y + 8 && hb.b > f.y - 8) WDM.popFalse(S, i, world(e)); }); };
  H.reclaim = () => { const e = live(); return e && S ? WDM.reclaim(e, S, world(e)) : 'none'; };   /* (a pilot hook for the tune lane's page bot) */
  H.take = (e, dmg) => { if (!S) return dmg; const [d, word] = WDM.takeBlow(e, S, dmg);
    if (word === 'VEIL') { e.chipHit = ctx.time ? ctx.time() : 0; e.guardFx = 0.2; e.guardWord = WD_SAY.warded; if (!S.told.veil) { S.told.veil = 1; ctx.hint && ctx.hint(WD_SAY.warded + '. ' + WD_SAY.rule + '.'); } }
    if (word === 'HOLDS') ctx.number(e.x, e.y - WD.markH, WD_SAY.holds, '#bfe6f5');
    return d; };
  H.barName = e => WD_SAY.name + (WDM.wdOpen(e) ? '  ' + WDM.OPEN_NAME[e.mode] : S && S.stolen ? '  ' + WD_SAY.chase : '');
  H.end = () => { if (S) { const e = { x: 0, y: 0 }; void e; if (WWH()) for (const pp of ctx.players()) WWH().giveBack(pp); if (ctx.L) ctx.L.dark = S.dark0; S.stolen = false; S.rings = []; S.spots = []; S.marches = []; S.falses = []; S.won = true; } };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, stolen: S.stolen, perch: S.perchI, litT: +S.litT.toFixed(2), n: { ...S.n }, hurt: { ...S.hurt }, won: S.won };
  /* ================= THE DRAWING (src/redraw/lantern_widow_art.js: claude/wispart) ================= */
  /* her: every POSE mode through the art; hurt flashes her white; once she has fallen she comes apart into blossom and her lantern drops (about 4.4 s) */
  H.drawBoss = (g, e, cx, cy, time) => { const dead = !e.alive; let t = 0;
    if (dead) { if (!S) return; if (S.diedAt == null) { S.diedAt = time; S.deadLan = WDM.lanternAt(e); S.deadAt = { x: e.x, y: e.y }; } t = time - S.diedAt; if (t > 4.4) return; }
    const p = POSE[dead ? 'reel' : e.mode] || POSE.drift, f = e.face || 1, ex = R((dead ? S.deadAt.x : e.x) - cx), ey = R((dead ? S.deadAt.y : e.y) - cy) + (dead ? Math.min(t, 0.9) * 14 : Math.sin(time * 2.2) * 2);
    LWA.drawWidow(g, ex, ey, dead ? 'dead' : e.mode, p, f, time, { stolen: !!(S && S.stolen), flash: e.flash > 0, t });
    if (dead) LWA.drawDeathLantern(g, ex, R(S.G.floorY - cy), S.deadLan.x - cx, S.deadLan.y - cy, t, time); };
  /* over the world: her wail's rings, the hands that rise, the march and the toll-gate that tells it, her false lights */
  H.drawOver = (g, cx, cy, VW, VH, time) => { if (!S) return; const x = v => R(v - cx), y = v => R(v - cy);
    for (const r of S.rings) { const k = Math.min(1, r.t / WD.wail.act); LWA.drawWailRing(g, x(r.x), y(r.y), WD.wail.r * k, k, time); }
    for (const s of S.spots) LWA.drawHandSpot(g, x(s.x), y(s.y), s.t, time);
    for (const m of S.marches) LWA.drawMourners(g, x(m.x), y(S.G.floorY), m.dir, WD.march.h, time);
    S.falses.forEach((f, i) => { if (!f.dead) LWA.drawFalseLight(g, x(f.x), y(f.y), time, i); });
    const e = live(); if (e && e.mode === 'marchTell') { const wx = e.marchDir > 0 ? S.G.x0 : S.G.x1; LWA.drawMarchGate(g, x(wx), y(S.G.floorY), time); } };
  return H;
}
