// src/lantern-widow-hands.js - THE LANTERN WIDOW's HANDS (claude/wispwood, the OPUS GREYBOX). src/lantern-widow.js is the fight (pure); this binds it to the world:
// the heroes' lanterns and the rim lamps (through src/wispwood-hands.js: steal / giveBack / drown / snuff / light), the glade's dark (L.dark while she holds the light),
// her told blows on the heroes (keyed once a blow), A HERO'S BLOW ON HER LANTERN (strike(hb): the reclaim) or on a false light - and the greybox drawing.
// GREYBOX (the sonnet art lane draws the final, src/redraw/lantern_widow_art.js to come): every move its own windup pose and release pose (POSE, B16), its own sound (SOUND).
// main.js calls (one tagged line each): spawnBoss, owns, on, update, take, strike, drawBoss, drawOver, barName, end, lights, clear.
import * as WDM from './lantern-widow.js';
import { WD_SAY } from './ww-lines.js';
const { WD } = WDM;

export const SOUND = { veilTell: s => (s.tell)(), veil: s => (s.whoosh || s.tell)(), wailTell: s => (s.charge || s.tell)(), wail: s => (s.queenShriek || s.roar || s.tell)(),
  handsTell: s => (s.tell)(), hands: s => (s.thud)(), theftTell: s => { (s.charge || s.tell)(); }, theft: s => (s.ghostWake || s.moan || s.whoosh || s.tell)(),
  reclaim: s => { (s.crack || s.thud)(); (s.ui || s.tell)(); }, rise: s => (s.whoosh || s.tell)(), lament: s => (s.queenShriek || s.roar || s.thud)(),
  marchTell: s => (s.bell || s.clank || s.tell)(), march: s => (s.thud)(), pop: s => (s.puff || s.thud)(), wake: s => (s.moan || s.roar || s.tell)() };
/* THE POSE A MODE WEARS (greybox, local px, facing right, feet at 0,0): lantern hand [x, y], free hand [x, y], veil spread (px), lean, mouth, what shows. Windup and release differ */
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
const rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };

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
  /* ================= THE GREYBOX DRAWING ================= */
  H.drawBoss = (g, e, cx, cy, time) => { const p = POSE[e.mode] || POSE.drift, f = e.face || 1, ex = R(e.x - cx), ey = R(e.y - cy) + Math.sin(time * 2.2) * 2;
    g.globalAlpha = p.dim ? 0.6 : 0.88; const lean = p.lean * f;
    rect(g, ex - 8 + lean * 0.2 - p.veil / 2, ey - 26, 16 + p.veil, 24, 'rgba(220,226,240,0.35)');           /* the veil, wide in the sweep */
    rect(g, ex - 6 + lean * 0.3, ey - 26, 12, 26, '#d8dce8'); rect(g, ex - 8 + lean * 0.3, ey - 6, 16, 6, '#c0c6d8');   /* the gown */
    const hy = ey - 34 + (p.head || 0) + (p.bow ? 4 : 0); rect(g, ex - 4 + lean * 0.5, hy, 8, 8, '#eef2fa'); rect(g, ex - 5 + lean * 0.5, hy - 2, 10, 3, '#bfc8dc');   /* the head, the veil's crown */
    if (p.mouth !== 'shut') rect(g, ex - 1 + lean * 0.5, hy + 5, 3, p.mouth === 'wide' ? 3 : 1, '#0a0a14');
    const lx = ex + p.lan[0] * f, ly = ey + p.lan[1], lit = S && !(S.stolen === false && p.dim); rect(g, lx - 4, ly - 5, 9, 10, lit ? (S && S.stolen ? '#fff6c8' : '#ffe9a0') : '#5a5e6a'); rect(g, lx - 5, ly - 7, 11, 2, '#8a8e98');
    if (S && S.stolen) { rect(g, lx - 6, ly - 7, 13, 1, 'rgba(255,211,107,' + (0.5 + 0.5 * Math.sin(time * 10)).toFixed(2) + ')'); }   /* THE STOLEN LIGHT burns in it: strike it */
    const hx = ex + p.hand[0] * f, hyy = ey + p.hand[1]; rect(g, hx - 2, hyy - 2, 4, 4, '#eef2fa');
    if (p.beckon && (time * 6) % 2 < 1) rect(g, hx - 6, hyy - 1, 12, 2, '#ffd36b');
    if (p.bell) rect(g, hx - 3, hyy - 4, 6, 6, '#c8a040');
    g.globalAlpha = 1; };
  H.drawOver = (g, cx, cy, VW, VH, time) => { if (!S) return; const x = v => R(v - cx), y = v => R(v - cy);
    for (const r of S.rings) { const rad = WD.wail.r * Math.min(1, r.t / WD.wail.act); rect(g, x(r.x - rad) - 2, y(r.y) - 10, 4, 12, 'rgba(200,230,255,0.8)'); rect(g, x(r.x + rad) - 2, y(r.y) - 10, 4, 12, 'rgba(200,230,255,0.8)'); }
    for (const s of S.spots) { if (s.t > 0.15) rect(g, x(s.x) - 6, y(s.y) - 1, 12, 2, (time * 10) % 2 < 1 ? '#ff4a2a' : '#6a3a8a'); else rect(g, x(s.x) - 4, y(s.y) - 22, 8, 22, '#120a1c'); }
    for (const m of S.marches) for (let k = 0; k < 4; k++) rect(g, x(m.x - m.dir * k * 14) - 4, y(S.G.floorY) - WD.march.h, 8, WD.march.h, 'rgba(210,220,240,' + (0.7 - k * 0.15).toFixed(2) + ')');
    for (const f of S.falses) if (!f.dead) rect(g, x(f.x) - 3, y(f.y) - 3, 6, 6, '#fff6c8');
    const e = live(); if (e && e.mode === 'marchTell') { const wx = e.marchDir > 0 ? S.G.x0 : S.G.x1; rect(g, x(wx) - 3, y(S.G.floorY) - 40, 6, 40, (time * 8) % 2 < 1 ? '#ff4a2a' : '#ff9a5c'); } };
  return H;
}
