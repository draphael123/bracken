// src/ty-champion-hands.js - THE CHAMPION's HANDS (claude/tourney, the OPUS GREYBOX). src/ty-champion.js is the fight (pure); this binds it to the world: his told
// blows on the heroes (keyed once a blow), the couched lance's blow on him at a clean pass (through main.js hurtEnemy, so it is a hero's blow like any other),
// THE SQUIRE (a hero's blow on him: strike(hb)), THE RIVAL KNIGHTS (spawned out of the pavilion, one at a time), and when the hero's horse is led off
// (mountedPhase: src/tourney-hands.js reads it for the arena's ride) - and the greybox drawing.
// GREYBOX (the sonnet art lane draws the final, src/redraw/ty_champion_art.js to come): every move its own windup pose and release pose (POSE, B16), its own sound (SOUND).
// main.js calls (one tagged line each): spawnBoss, owns, on, update, take, strike, drawBoss, drawOver, barName, end, read, mountedPhase.
import * as TCM from './ty-champion.js';
import { CH_SAY } from './ty-lines.js';
const { TC } = TCM;

export const SOUND = { charge: s => { (s.snort || s.tell)(); (s.roar || s.tell)(); }, drop: s => (s.charge || s.tell)(), feint: s => (s.tell)(), shatter: s => { (s.crack || s.thud)(); (s.clank || s.thud)(); },
  unhorse: s => { (s.heavy || s.thud)(); (s.bellow || s.thud)(); }, rise: s => (s.clank || s.tell)(), swipeTell: s => (s.tell)(), swipe: s => (s.whoosh || s.slash || s.tell)(),
  squire: s => (s.ui || s.tell)(), squireDrop: s => (s.clank || s.thud)(), arm: s => (s.clank || s.tell)(), flailTell: s => (s.chain || s.clank || s.tell)(), flail: s => (s.whoosh || s.slash || s.thud)(),
  overTell: s => { (s.chain || s.clank || s.tell)(); (s.charge || s.tell)(); }, over: s => (s.heavy || s.thud)(), mired: s => (s.thud)(), rushTell: s => (s.charge || s.tell)(), rush: s => (s.roar || s.whoosh || s.tell)(),
  horn: s => (s.horn || s.whistle || s.tell)(), wake: s => (s.roar || s.tell)() };
/* THE POSE A MODE WEARS (greybox, local px, facing right, feet at 0,0): lance [angle: 0 level .. 1 upright], arm/flail hand [x, y], shield [x, y], lean, mounted. Windup and release differ */
export const POSE = {
  sleep: { lance: 1, hand: [6, -30], shield: [-6, -26], lean: 0, mounted: true },
  wake: { lance: 1, hand: [4, -40], shield: [-6, -26], lean: -2, mounted: true, visor: true },
  wheel: { lance: 0.9, hand: [6, -30], shield: [-6, -26], lean: -3, mounted: true },
  pass: { lance: 0.7, hand: [8, -30], shield: [-4, -28], lean: 4, mounted: true },
  passDown: { lance: 0, hand: [10, -28], shield: [-2, -30], lean: 8, mounted: true, boss: true },
  swipeTell: { lance: 0.5, hand: [-8, -36], shield: [-6, -26], lean: -6, mounted: true },
  swipe: { lance: 0.1, hand: [16, -26], shield: [-6, -26], lean: 8, mounted: true },
  lanceless: { lance: -1, hand: [6, -22], shield: [-6, -26], lean: -4, mounted: true, stub: true },
  arm: { lance: 1, hand: [2, -38], shield: [-6, -26], lean: 0, mounted: true },
  fetch: { lance: -1, hand: [6, -24], shield: [-6, -26], lean: 4, mounted: true },
  unhorsed: { lance: -1, hand: [-12, -6], shield: [12, -6], lean: 30, flat: true },
  rise: { lance: -1, hand: [6, -14], shield: [-6, -16], lean: 14 },
  walk: { lance: -1, hand: [8, -20], shield: [-4, -20], lean: 2, flail: [12, -12] },
  flailTell: { lance: -1, hand: [-6, -30], shield: [-4, -20], lean: -4, flail: [-14, -34] },
  flail: { lance: -1, hand: [12, -18], shield: [-4, -20], lean: 6, flail: [30, -14] },
  overTell: { lance: -1, hand: [0, -36], shield: [-4, -22], lean: -6, flail: [-6, -50] },
  over: { lance: -1, hand: [12, -10], shield: [-4, -20], lean: 10, flail: [34, -2] },
  mired: { lance: -1, hand: [14, -6], shield: [-6, -14], lean: 18, flail: [30, 0], stuck: true },
  recover: { lance: -1, hand: [8, -18], shield: [-4, -20], lean: 2, flail: [12, -10] },
  rushTell: { lance: -1, hand: [-6, -18], shield: [6, -22], lean: -8, flail: [-10, -10], crouch: true },
  rush: { lance: -1, hand: [-6, -18], shield: [10, -20], lean: 12, flail: [-12, -10] },
  hornTell: { lance: -1, hand: [6, -30], shield: [-4, -20], lean: -2, flail: [10, -10], horn: true },
  horn: { lance: -1, hand: [6, -30], shield: [-4, -20], lean: 0, flail: [10, -10], horn: true },
};
const R = Math.round;
const rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };

export function makeChampionHands(ctx) {
  let S = null; const H = {};
  const TS = ctx.TS, A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'tychampion' ? ctx.L.arena : null);
  const TYH = () => ctx.ty && ctx.ty();
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'tychampion';
  H.clear = () => { S = null; };
  const live = () => { const e = ctx.boss; return e && e.alive && e.t === 'tychampion' ? e : null; };
  /* THE ARENA'S RIDE: mounted until he is unhorsed (and on foot after the win) - src/tourney-hands.js asks this */
  H.mountedPhase = () => !(S && (S.ph === 2 || S.won || (ctx.boss && ctx.boss.t === 'tychampion' && (ctx.boss.mode === 'unhorsed' || ctx.boss.mode === 'rise'))));
  const keyed = (pp, key) => { pp.tcKeys = pp.tcKeys || new Set(); if (pp.tcKeys.size > 200) pp.tcKeys.clear(); if (pp.tcKeys.has(key)) return true; pp.tcKeys.add(key); return false; };
  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null; S = TCM.newFight(TCM.geom(ctx.L, TS));
    const hp = (ctx.EHP && ctx.EHP.tychampion) || TC.hp;
    const e = { ...base, t: 'tychampion', w: TC.w, h: TC.h, hp, maxHp: hp, noGrav: true, markH: TC.markH, face: -1, mode: 'sleep', modeT: 0, phase: 1, boss: true, lance: true, vx: 0 };
    for (const pp of ctx.players()) pp.tcKeys = null; return e; };
  const heroes = () => ctx.players().map((pp, i) => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: (ctx.upright ? ctx.upright(pp) : true) && !pp.dead, ducking: !!pp.ducking, blocking: !!(pp.block || pp.blocking),
    mounted: TYH() ? TYH().mounted(pp) : false, couched: TYH() ? TYH().couched(pp) : false, pace: TYH() ? TYH().pace(pp) : 0, pp, id: i }));
  const sayKey = { lance: [CH_SAY.lance, '#ff6b6b'], feint: [CH_SAY.feint, '#ff6b6b'], clean: [CH_SAY.clean, '#ffd36b'], glance: [CH_SAY.glance, '#bfe6f5'], squire: [CH_SAY.squire, '#bfe6f5'],
    squireStop: [CH_SAY.squireStop, '#8fd160'], armed: [CH_SAY.armed, '#ff9a5c'], unhorsed: [CH_SAY.unhorsed, '#8fd160'], foot: [CH_SAY.foot, '#ff9a5c'], mired: [CH_SAY.mired + ': ' + 'OPEN', '#ffd36b'], horn: [CH_SAY.horn, '#ff9a5c'] };
  function world(e) {
    return {
      sound: k => { const f = SOUND[k]; if (f && ctx.sfx) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake && ctx.shake(n),
      mark: (m, who) => ctx.number(who.x, who.y - TC.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      say: (k, x, y) => { const s = sayKey[k]; if (s) ctx.number(x, y - TC.markH - 8, s[0], s[1]); },
      music: ph => ctx.music && ctx.music(ph === 2 ? 'tychampion:p2' : 'tychampion'),   /* (claude/tourneyart) on foot: the faster, tenser voicing of his march */
      hitHero: (h, d, name, key, o = {}) => { const pp = h.pp; if (!pp || keyed(pp, key)) return; ctx.asPlayer(pp, () => { const r = ctx.damage(e.x, d, { who: e, name: 'THE CHAMPION', unblockable: !o.blockable });
        S.hurt[name] = (S.hurt[name] || 0) + d; if (o.knock && r === 'hit') { pp.vx = o.knock; pp.vy = Math.min(pp.vy || 0, -140); } }); },
      lanceHit: (boss, h) => { const pp = h.pp; if (!pp) return; const dmg = Math.round((ctx.swordDmg ? ctx.swordDmg() : 20) * (ctx.lanceK || 1.5)); ctx.asPlayer(pp, () => ctx.hurt(boss, dmg, pp.x)); },
      dismount: () => { ctx.hint && ctx.hint(CH_SAY.unhorsed + '. ' + CH_SAY.foot + '.'); },
      callRival: x => { if (!ctx.spawn) return; const k = (S.n.horns % 2) ? 'hedgeknight' : 'swornsword'; const r = ctx.spawn(k, Math.floor(x / TS), Math.floor(S.G.floorY / TS) - 1, { squad: 'rival', tyRival: true }); if (r) { r.tyRival = true; S.rivals++; } },
      rivalsAlive: () => (ctx.enemies ? ctx.enemies().filter(q => q.alive && q.tyRival).length : 0),
    };
  }
  H.update = (e, dt) => { if (!S || !e.alive || !A()) return;
    if (e.mode === 'sleep') { e.mode = 'wake'; e.modeT = TC.joust.wake; }
    if (e.mode === 'wake' && !S.woke) { S.woke = true; ctx.number(e.x, e.y - TC.markH - 16, CH_SAY.wake, '#ffd36b'); world(e).sound('wake'); }
    if (S.woke && !S.told.rule && e.mode !== 'wake') { S.told.rule = 1; ctx.hint && ctx.hint(CH_SAY.rule); }
    TCM.step(e, S, dt, heroes(), world(e));
    e.phase = S.ph; e.w = S.ph === 2 || e.mode === 'unhorsed' ? TC.footW : TC.w; e.h = S.ph === 2 ? TC.footH : TC.h; e.open = TCM.tcOpen(e) ? Math.max(0.1, e.modeT) : 0; };
  /* A HERO'S BLOW on the squire (an attack box), or his couched lance */
  H.strike = hb => { if (!S || !hb || !ctx.bossActive) return; const e = live(); if (!e || !S.squire || S.squire.st !== 'run') return; const q = S.squire, y = S.G.floorY;
    if (hb.l < q.x + 8 && hb.r > q.x - 8 && hb.t < y && hb.b > y - TC.squire.h - 4) TCM.stopSquire(e, S, world(e)); };
  H.lanceSquire = pp => { if (!S || !S.squire || S.squire.st !== 'run') return false; const tp = TYH() && TYH().tipOf(pp); if (!tp || Math.abs(tp.x - S.squire.x) > 10) return false; const e = live(); return !!(e && TCM.stopSquire(e, S, world(e))); };
  H.take = (e, dmg) => { if (!S) return dmg; const hx = ctx.hero ? ctx.hero().x : undefined; const [d, word] = TCM.takeBlow(e, S, dmg, hx);
    if (word === 'SHIELD') { e.chipHit = ctx.time ? ctx.time() : 0; e.guardFx = 0.2; e.guardWord = CH_SAY.warded; if (!S.told.coat) { S.told.coat = 1; ctx.hint && ctx.hint(CH_SAY.warded + '. ' + CH_SAY.rule + '.'); } }
    if (word === 'HOLDS') ctx.number(e.x, e.y - TC.markH, CH_SAY.holds, '#bfe6f5');
    return d; };
  H.barName = e => CH_SAY.name + (TCM.tcOpen(e) ? '  ' + TCM.OPEN_NAME[e.mode] : S && S.ph === 2 ? '  ON FOOT' : '');
  H.end = () => { if (S) { S.squire = null; S.won = true; } };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, passes: S.passes, shatters: S.shatters, squire: S.squire && S.squire.st, n: { ...S.n }, hurt: { ...S.hurt }, won: S.won };
  /* ================= THE GREYBOX DRAWING ================= */
  H.drawBoss = (g, e, cx, cy, time) => { const m = e.mode === 'pass' && e.lanceDown ? 'passDown' : e.mode, p = POSE[m] || POSE.walk, f = e.face || 1, ex = R(e.x - cx), ey = R(e.y - cy);
    if (p.flat) { rect(g, ex - 18, ey - 8, 34, 8, '#c8ccd4'); rect(g, ex + 12 * f, ey - 10, 7, 7, '#a8acb4'); rect(g, ex - 6, ey - 10, 10, 3, '#ffd36b'); return; }
    const up = p.mounted ? 14 : 0, lean = p.lean * f;
    if (p.mounted) { const gait = Math.abs(e.vx || 0) > 120 ? 16 : 6, ph = Math.sin(time * gait) * 3;   /* THE BARDED CHARGER: gold and blue */
      rect(g, ex - 16, ey - 18, 32, 11, '#e8e0d0'); rect(g, ex + f * 14 - 4, ey - 28, 9, 12, '#e8e0d0'); rect(g, ex - 16, ey - 16, 32, 5, '#2a4ab0'); rect(g, ex - 16, ey - 11, 32, 2, '#ffd36b');
      for (const [lx, k] of [[-13, 1], [-6, -1], [6, 1], [13, -1]]) rect(g, ex + lx, ey - 7, 3, 7 + (k * ph > 0 ? 0 : -2), '#c8c0b0'); }
    const by = ey - up; rect(g, ex - 7 + lean * 0.3, by - 28, 14, 22, '#c8ccd4'); rect(g, ex - 6 + lean * 0.4, by - 38, 12, 10, '#a8acb4');   /* plate; the great helm */
    rect(g, ex - 4 + lean * 0.4 + (f > 0 ? 3 : 0), by - 34, 5, p.visor ? 1 : 2, '#1a1a24'); rect(g, ex - 1 + lean * 0.4, by - 44, 3, 6, '#d84a4a');   /* the visor slit; the plume */
    const sx = ex + p.shield[0] * f, sy = by + p.shield[1]; rect(g, sx - 6, sy - 9, 12, 18, '#2a4ab0'); const glint = p.boss ? 0.6 + 0.4 * Math.sin(time * 30) : 1; g.globalAlpha = glint; rect(g, sx - 2, sy - 2, 5, 5, '#ffd36b'); g.globalAlpha = 1;   /* THE GOLD BOSS */
    const hx = ex + p.hand[0] * f, hy = by + p.hand[1];
    if (p.lance >= 0) { const L0 = 46, ang = p.lance * Math.PI / 2, lx = Math.cos(ang) * L0 * f, ly = -Math.sin(ang) * L0; g.strokeStyle = '#e0d4b0'; g.lineWidth = 3; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + lx, hy + ly); g.stroke(); rect(g, hx + lx - 2, hy + ly - 2, 4, 4, p.lance === 0 ? '#ff6b4a' : '#e0d4b0'); }
    else if (p.stub) rect(g, hx, hy - 2, 10 * f, 3, '#8a7a5a');
    if (p.flail) { const fx = ex + p.flail[0] * f, fy = by + p.flail[1]; g.strokeStyle = '#6a6a72'; g.lineWidth = 1; g.beginPath(); g.moveTo(hx, hy); g.lineTo(fx, fy); g.stroke(); rect(g, fx - 4, fy - 4, 8, 8, p.stuck ? '#8a8a92' : '#4a4a52'); }
    if (p.horn) rect(g, ex + 10 * f, by - 32, 6, 4, '#ffd36b');
    rect(g, hx - 2, hy - 2, 4, 4, '#a8acb4'); };
  H.drawOver = (g, cx, cy, VW, VH, time) => { if (!S) return; const q = S.squire; if (q && q.st !== 'gone') { const qx = R(q.x - cx), qy = R(S.G.floorY - cy), f = q.face || -1;
      rect(g, qx - 4, qy - 14, 8, 14, '#d8b030'); rect(g, qx - 3, qy - 19, 6, 5, '#e0b090'); if (q.st === 'run' || q.st === 'wait') { rect(g, qx - f * 20, qy - 16, 40, 2, '#e0d4b0'); if ((time * 6) % 2 < 1) ctx.number && 0; } }
    const e = live(); if (e && e.mode === 'pass' && !e.lanceDown) { const ex = R(e.x - cx), ey = R(e.y - cy); rect(g, ex - 1, ey - TC.markH - 4, 3, 3, 'rgba(255,211,107,0.6)'); } };
  return H;
}
