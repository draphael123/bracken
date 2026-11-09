// src/conductor-hands.js - THE CONDUCTOR's HANDS (claude/ghosttrain, the OPUS GREYBOX). src/conductor.js is the fight (pure); this binds it to the world: his told blows on the
// heroes (keyed once a blow), THE HOLES he punches (tiles, through src/ghost-train-hands.js setCell so a reset puts every board back), THE UNCOUPLING (the gangway, then the van
// left on the line, the camera's lock moved on), THE EMERGENCY BRAKES (a hero's blow on a live handle: strike(hb)), THE LURCH - and the greybox drawing.
// GREYBOX (the sonnet art lane draws the final, src/redraw/conductor_art.js to come): every move its own windup pose and release pose (POSE, B16), its own sound (SOUND).
// main.js calls (one tagged line each): spawnBoss, owns, on, update, take, strike, drawBoss, drawOver, barName, end, read.
import * as CDM from './conductor.js';
import { CD_SAY } from './gt-lines.js';
import { GT } from './ghost-train.js';
const { CD } = CDM;

export const SOUND = { swingTell: s => (s.tell)(), swing: s => (s.whoosh || s.tell)(), punchTell: s => { (s.clank || s.tell)(); (s.clank || s.tell)(); }, punch: s => (s.crack || s.clank || s.thud)(),
  boards: s => (s.crack || s.thud)(), call: s => (s.gobShout || s.roar || s.tell)(), whistle: s => (s.whistle || s.tell)(), chain: s => (s.clank || s.tell)(), clank: s => (s.clank || s.thud)(),
  brake: s => { (s.crack || s.thud)(); (s.heavy || s.thud)(); }, thud: s => (s.thud)(), rise: s => (s.whoosh || s.tell)(), fuse: s => (s.fireWhoosh || s.boom || s.thud)(),
  blastTell: s => (s.charge || s.tell)(), blast: s => (s.fireWhoosh || s.whoosh || s.thud)(), sparksTell: s => (s.tell)(), sparks: s => (s.puff || s.thud)(), ember: s => (s.sizzle || s.puff || s.thud)(),
  graspTell: s => (s.charge || s.tell)(), grasp: s => (s.fireWhoosh || s.whoosh || s.tell)(), roar: s => (s.boreRoar || s.roar || s.thud)() };
/* THE POSE A MODE WEARS (greybox, local px, facing right, feet at 0,0): lantern hand [x, y], punch hand [x, y], lean, mouth, and what shows. Windup and release differ for every move */
export const POSE = {
  sleep: { lan: [8, -16], pun: [-6, -14], lean: 0, mouth: 'shut', eyes: 'shut' },
  wake: { lan: [10, -30], pun: [-8, -28], lean: -2, mouth: 'open', eyes: 'red' },
  walk: { lan: [9, -16], pun: [-6, -15], lean: 2, mouth: 'shut', eyes: 'open' },
  swingTell: { lan: [-12, -26], pun: [-6, -15], lean: -4, mouth: 'shut', eyes: 'red' },
  swing: { lan: [22, -14], pun: [-6, -15], lean: 6, mouth: 'open', eyes: 'red' },
  punchTell: { lan: [8, -16], pun: [4, -36], lean: -2, mouth: 'shut', eyes: 'red', clack: true },
  punch: { lan: [8, -16], pun: [16, -4], lean: 8, mouth: 'open', eyes: 'red' },
  callTell: { lan: [12, -24], pun: [4, -26], lean: -3, mouth: 'wide', eyes: 'red', cup: true },
  call: { lan: [12, -24], pun: [4, -26], lean: 0, mouth: 'wide', eyes: 'red', cup: true },
  thrown: { lan: [-14, -34], pun: [14, -34], lean: 14, mouth: 'wide', eyes: 'bulge', tumble: true },
  down: { lan: [-12, -4], pun: [12, -4], lean: 30, mouth: 'open', eyes: 'bulge', flat: true },
  refuse: { lan: [10, -10], pun: [14, -8], lean: 20, mouth: 'open', eyes: 'red' },
  rise: { lan: [10, -36], pun: [-10, -36], lean: 0, mouth: 'wide', eyes: 'red', float: true },
  glide: { lan: [16, -20], pun: [-10, -20], lean: 10, mouth: 'wide', eyes: 'red', float: true },
  fuse: { lan: [6, -30], pun: [-6, -30], lean: 0, mouth: 'wide', eyes: 'red', burn: true },
  fire: { lan: [0, 0], pun: [0, 0], lean: 0, mouth: 'wide', eyes: 'red', fused: true },
  blastTell: { lan: [0, 0], pun: [0, 0], lean: 0, mouth: 'wide', eyes: 'red', fused: true, glow: 1 },
  blast: { lan: [0, 0], pun: [0, 0], lean: 0, mouth: 'wide', eyes: 'red', fused: true, glow: 2 },
  sparksTell: { lan: [0, 0], pun: [0, 0], lean: 0, mouth: 'shut', eyes: 'red', fused: true, chuff: true },
  sparks: { lan: [0, 0], pun: [0, 0], lean: 0, mouth: 'open', eyes: 'red', fused: true, chuff: true },
  graspTell: { lan: [0, 0], pun: [0, 0], lean: 0, mouth: 'wide', eyes: 'red', fused: true, hand: 6 },
  grasp: { lan: [0, 0], pun: [0, 0], lean: 0, mouth: 'wide', eyes: 'red', fused: true, hand: 40 },
};
const R = Math.round;
const rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };

export function makeConductorHands(ctx) {
  let S = null; const H = {};
  const TS = ctx.TS, A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'conductor' ? ctx.L.arena : null);
  const GTH = () => ctx.gt && ctx.gt();
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'conductor';
  H.clear = () => { S = null; };
  const live = () => { const e = ctx.boss; return e && e.alive && e.t === 'conductor' ? e : null; };
  const keyed = (pp, key) => { pp.cdKeys = pp.cdKeys || new Set(); if (pp.cdKeys.size > 200) pp.cdKeys.clear(); if (pp.cdKeys.has(key)) return true; pp.cdKeys.add(key); return false; };
  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null; S = CDM.newFight(CDM.geom(ctx.L, TS));
    const hp = (ctx.EHP && ctx.EHP.conductor) || CD.hp;
    const e = { ...base, t: 'conductor', w: CD.w, h: CD.h, hp, maxHp: hp, noGrav: true, markH: CD.markH, face: -1, mode: 'sleep', modeT: 0, phase: 1, boss: true };
    for (const pp of ctx.players()) pp.cdKeys = null; return e; };
  const heroes = () => ctx.players().map((pp, i) => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: (ctx.upright ? ctx.upright(pp) : true) && !pp.dead, ducking: !!pp.ducking, exposed: GTH() ? GTH().exposed(pp) : false, pp, id: i }));
  const sayKey = { pressure: [CD_SAY.pressure, '#8a8aa0'], thrown: [CD_SAY.thrown + ': ' + CD_SAY.open, '#ffd36b'], fuse: [CD_SAY.fuse, '#ff9a3c'], fused: [CD_SAY.fused, '#ff9a3c'], tunnel: [CD_SAY.tunnel, '#ff9a5c'],
    punched: [CD_SAY.punched, '#ff6b6b'], uncouple: [CD_SAY.uncouple, '#ff9a5c'], uncoupled: [CD_SAY.uncoupled, '#ffd36b'] };
  function world(e) {
    const G = GTH();
    return {
      number: (x, y, t, c) => ctx.number(x, y, t, c), sound: k => { const f = SOUND[k]; if (f && ctx.sfx) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake && ctx.shake(n),
      mark: (m, who) => ctx.number(who.x, who.y - CD.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      say: (k, x, y) => { const s = sayKey[k]; if (s) ctx.number(x, y - CD.markH - 8, s[0], s[1]); },
      fx: (k, x, y) => { if (k === 'open' && ctx.ring) ctx.ring(x, y - CD.h / 2, 22, '#ffd36b'); },
      music: () => {},
      hitHero: (h, d, name, key, o = {}) => { const pp = h.pp; if (!pp || keyed(pp, key)) return; ctx.asPlayer(pp, () => { const r = ctx.damage(e.x, d, { who: e, name: 'THE CONDUCTOR', unblockable: !o.blockable, fire: !!o.fire });
        S.hurt[name] = (S.hurt[name] || 0) + d; if (o.knock && r === 'hit') { pp.vx = -150; pp.vy = Math.min(pp.vy || 0, -80); } }); },
      /* THE PUNCHED HOLES: the deck the target stands on, never a wall, a gangway or under a brake */
      holeCells: (x, y, w) => { const out = [], row = Math.round(y / TS), tx0 = Math.floor(x / TS); const L = ctx.L; if (!G) return out;
        for (let tx = tx0; tx < tx0 + w; tx++) { const c = G.carAt(tx * TS + 8); if (!c || tx <= c.x0 || tx >= c.x1) continue;
          if (row !== GT.ROOF && row !== GT.FLOOR) continue; if (S.G.brakes.some(b => Math.abs(Math.floor(b.x / TS) - tx) <= 0)) continue;
          const t = L.grid[row * L.W + tx]; if (t === ctx.T.SOLID || t === ctx.T.ONEWAY) out.push({ x: tx, y: row }); }
        return out; },
      boards: (cells, mend) => { for (const c of cells) { if (mend) { if (G.carAt(c.x * TS + 8)) G.restoreCell(c.x, c.y); } else G.setCell(c.x, c.y, ctx.T.AIR); } },   /* a board on a van already left on the line is not put back */
      lurch: px => { for (const pp of ctx.players()) { if (pp.dead) continue; if (ctx.moveBody) ctx.moveBody(pp, px, 0); else pp.x += px; pp.vy = Math.min(pp.vy || 0, -70); } ctx.shake && ctx.shake(8); },
      gangway: (c, solid) => G && G.gangway(c.g0, c.g1, solid),
      leave: (c, next) => { if (G) G.leaveCar(c.behind); ctx.lockX0 && ctx.lockX0(next.x0); },
      tunnelEnd: () => {},
    };
  }
  H.update = (e, dt) => { if (!S || !e.alive || !A()) return;
    if (e.mode === 'wake' && !S.woke) { S.woke = true; ctx.number(e.x, e.y - CD.markH - 16, CD_SAY.wake, '#ffd36b'); world(e).sound('roar'); }
    if (S.woke && !S.told.rule && e.mode !== 'wake') { S.told.rule = 1; ctx.hint && ctx.hint(CD_SAY.rule); }
    const pr = S.press; CDM.step(e, S, dt, heroes(), world(e)); if (pr < 1 && S.press >= 1) ctx.number(e.x, e.y - CD.markH - 20, CD_SAY.ready, '#8fd160');
    e.phase = S.ph; e.open = CDM.cdOpen(e) ? Math.max(0, e.modeT) : 0; };
  /* A HERO'S BLOW on a live brake handle */
  H.strike = hb => { if (!S || !hb || !ctx.bossActive) return; const e = live(); if (!e) return;
    for (const b of S.G.brakes) { if (!CDM.brakeLive(S, b)) continue; if (hb.l < b.x + 8 && hb.r > b.x - 8 && hb.t < b.y + 10 && hb.b > b.y - 10 && (!ctx.hitOnce || ctx.hitOnce(b))) CDM.pullBrake(e, S, b.id, world(e)); } };
  H.pull = id => { const e = live(); return e && S ? CDM.pullBrake(e, S, id, world(e)) : 'none'; };
  H.take = (e, dmg) => { if (!S) return dmg; const [d, word] = CDM.takeBlow(e, S, dmg);
    if (word === 'COAT') { e.chipHit = ctx.time ? ctx.time() : 0; e.guardFx = 0.2; e.guardWord = CD_SAY.warded; if (!S.told.coat) { S.told.coat = 1; ctx.hint && ctx.hint(CD_SAY.warded + '. ' + CD_SAY.rule + '.'); } }
    if (word === 'HOLDS') ctx.number(e.x, e.y - CD.markH, CD_SAY.holds, '#bfe6f5');
    return d; };
  H.barName = e => CD_SAY.name + (CDM.cdOpen(e) ? '  ' + CDM.OPEN_NAME[e.mode] : S && S.fused ? '  THE FIREBOX' : '');
  H.end = () => { if (S) { for (const h of S.holes) if (h.st === 'open') for (const c of h.cells) if (GTH() && GTH().carAt(c.x * TS + 8)) GTH().restoreCell(c.x, c.y); S.holes = []; S.blasts = []; S.embers = []; S.tunnel = null; S.unc = null; S.won = true; } };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, press: +S.press.toFixed(2), gone: [...S.gone], x0: S.x0, fused: S.fused, holes: S.holes.length, tunnel: CDM.tunnelSpan(S), n: { ...S.n }, hurt: { ...S.hurt }, won: S.won };
  /* ================= THE GREYBOX DRAWING ================= */
  H.drawBoss = (g, e, cx, cy, time) => { const p = POSE[e.mode] || POSE.walk, f = e.face || 1, ex = R(e.x - cx), ey = R(e.y - cy) - (p.float ? 10 + Math.sin(time * 4) * 2 : 0);
    if (p.fused) { const gl = p.glow || 0; rect(g, ex - 10, ey - 26, 12, 24, gl ? (gl > 1 ? '#fff1a0' : '#ff9a3c') : '#c0401a'); rect(g, ex - 8, ey - 22, 2, 2, '#ffe9a0'); rect(g, ex - 3, ey - 22, 2, 2, '#ffe9a0');
      if (p.hand) rect(g, ex - 10 - p.hand, ey - 12, p.hand, 5, 'rgba(255,154,60,0.9)'); if (p.chuff) rect(g, ex + 70, ey - 140 - (time * 40) % 20, 10, 10, 'rgba(200,200,210,0.5)'); return; }
    const a = p.burn ? 0.6 + 0.4 * Math.sin(time * 20) : 0.92; g.globalAlpha = a;
    if (p.flat) { rect(g, ex - 16, ey - 8, 30, 8, '#2a3048'); rect(g, ex + 12 * f, ey - 10, 6, 6, '#c8d0e8'); g.globalAlpha = 1; return; }
    const lean = p.lean * f; rect(g, ex - 6 + lean * 0.3, ey - 26, 12, 24, '#2a3048'); rect(g, ex - 7 + lean * 0.4, ey - 34, 14, 3, '#1a1e30');   /* the coat; the cap's peak */
    rect(g, ex - 4 + lean * 0.5, ey - 33, 8, 7, '#c8d0e8'); rect(g, ex - 3 + lean * 0.5 + (f > 0 ? 2 : 0), ey - 30, 2, p.eyes === 'shut' ? 1 : 2, p.eyes === 'shut' ? '#5a6078' : '#ff6b6b');
    if (p.mouth !== 'shut') rect(g, ex - 1 + lean * 0.5, ey - 27, 3, p.mouth === 'wide' ? 3 : 1, '#0a0a10');
    const lx = ex + p.lan[0] * f, ly = ey + p.lan[1]; rect(g, lx - 2, ly - 3, 5, 6, '#ffe9a0'); rect(g, lx - 3, ly - 4, 7, 1, '#8a849a');
    const px = ex + p.pun[0] * f, py = ey + p.pun[1]; rect(g, px - 2, py - 2, 5, 4, '#c8ccd4'); if (p.clack && (time * 8) % 2 < 1) rect(g, px - 4, py - 6, 9, 2, '#fff');
    if (p.cup) rect(g, ex + 6 * f, ey - 30, 4, 4, '#c8d0e8'); g.globalAlpha = 1; };
  H.drawOver = (g, cx, cy, VW, VH, time) => { if (!S) return; const x = v => R(v - cx), y = v => R(v - cy);
    for (const h of S.holes) for (const c of h.cells) { if (h.st === 'tell') { const k = (time * 10) % 2 < 1; rect(g, x(c.x * TS), y(c.y * TS) - 1, TS, 3, k ? '#ff4a2a' : '#ff9a5c'); } else rect(g, x(c.x * TS), y(c.y * TS), TS, TS, 'rgba(0,0,0,0.6)'); }
    const sp = CDM.tunnelSpan(S); if (sp) { const a = Math.max(0, x(sp[0])), b = Math.min(VW, x(sp[1])); if (b > a) { rect(g, a, 0, b - a, y(GT.ROOF * TS) - 2, 'rgba(6,6,12,0.85)'); rect(g, a, y((GT.ROOF - 2) * TS), b - a, 5, '#3a3444'); } }
    else if (S.tunnel) { const k = 1 + S.tunnel.t / CD.tunnel.tell; rect(g, VW - 12, 0, 12, VH, 'rgba(255,90,60,' + (0.2 + 0.4 * Math.max(0, k)).toFixed(2) + ')'); }
    for (const b of S.blasts) rect(g, x(b.x0), y(b.y) - CD.blast.h, b.x1 - b.x0, CD.blast.h, 'rgba(255,140,40,0.75)');
    for (const m of S.embers) { const mx = x(m.x), my = y(m.y); if (!m.hot) { rect(g, mx - 7, my - 1, 14, 2, 'rgba(255,90,60,0.7)'); } else rect(g, mx - 4, my - 6, 8, 6, '#ff9a3c'); }
    if (S.unc) { const c = S.unc.c; rect(g, x(c.x) - 1, y(c.y) - 30, 3, 30, S.unc.st === 'tell' ? '#ff4a2a' : '#ffd36b'); }
    for (const b of S.G.brakes) { if (!CDM.brakeLive(S, b)) continue; const bx = x(b.x), by = y(b.y); rect(g, bx - 2, by - 8, 4, 12, '#ff4a2a'); rect(g, bx - 4, by - 10, 8, 3, '#c0401a');
      rect(g, bx - 8, by - 18, 16, 3, '#1a1626'); rect(g, bx - 8, by - 18, R(16 * S.press), 3, S.press >= 1 ? '#8fd160' : '#c8a040'); }
    const fb = S.G.firebox; rect(g, x(fb.x) - 4, y(fb.y) - 22, 6, 18, S.fused ? '#ff9a3c' : '#5a2a1a'); };
  return H;
}
