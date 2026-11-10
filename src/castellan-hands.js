// src/castellan-hands.js - THE CASTELLAN'S GHOST's HANDS (claude/hollowmanor, the OPUS GREYBOX). src/castellan.js is the fight (pure); this binds it to the world:
// the racks (the live one's visor lit), his told blows on the heroes (keyed once a blow), the wisp a hero strikes in the final (the opening) - and the greybox.
// GREYBOX (the sonnet art lane draws the final, src/redraw/castellan_art.js to come): every move its own windup pose and release pose (POSE, B16), its own sound.
// main.js calls (one tagged line each): spawnBoss, owns, on, update, take, strike, drawBoss, drawOver, barName, end, clear.
import * as CSM from './castellan.js';
import { CS_SAY } from './mn-lines.js';
const { CS } = CSM;

export const SOUND = { thrustTell: s => (s.clank || s.tell)(), thrust: s => (s.throwWhoosh || s.whoosh || s.tell)(), bashTell: s => (s.charge || s.clank || s.tell)(), bash: s => (s.heavy || s.thud)(),
  sweepTell: s => (s.haft || s.charge || s.tell)(), sweep: s => (s.whoosh || s.tell)(), chopTell: s => (s.charge || s.tell)(), chop: s => (s.heavy || s.crash || s.thud)(),
  feintTell: s => (s.clank || s.tell)(), feint: s => (s.whoosh || s.tell)(), lungeTell: s => (s.ui || s.tell)(), lunge: s => (s.throwWhoosh || s.whoosh || s.tell)(),
  flurryTell: s => (s.clank || s.tell)(), flurry: s => (s.whoosh || s.tell)(), breakerTell: s => (s.charge || s.roar || s.tell)(), breaker: s => (s.crash || s.heavy || s.thud)(),
  whirlTell: s => (s.haft || s.charge || s.tell)(), whirl: s => (s.whoosh || s.tell)(), open: s => { (s.clank || s.thud)(); (s.ui || s.tell)(); }, leave: s => (s.hiss || s.roar || s.tell)(),
  possess: s => (s.clank || s.tell)(), swap: s => (s.hiss || s.tell)(), wisp: s => (s.hiss || s.tell)(), final: s => (s.roar || s.hiss || s.tell)(), wake: s => (s.clank || s.roar || s.tell)() };
/* THE POSE A MODE WEARS (greybox, local px, facing right, feet at 0,0): arm = the weapon arm's angle (deg, 0 = level ahead, -90 = raised), reach = how far the weapon
   stands out, lean = the body's lean (px), crouch, shield = the shield's height (knight), spin (whirl), slump (an opening), ghost = how far the ghost shows out of the suit */
export const POSE = {
  sleep: { arm: 70, reach: 6, lean: 0, slump: 4 }, wake: { arm: 20, reach: 10, lean: 0, ghost: 4 }, walk: { arm: 20, reach: 12, lean: 1 }, recover: { arm: 30, reach: 10, lean: 0 },
  thrustTell: { arm: 0, reach: 4, lean: -4, shield: 18 }, thrust: { arm: 0, reach: 30, lean: 5, shield: 18 },
  bashTell: { arm: 40, reach: 6, lean: -3, shield: 24, crouch: 3 }, bash: { arm: 40, reach: 6, lean: 7, shield: 30 },
  sweepTell: { arm: -150, reach: 26, lean: -4, crouch: 2 }, sweep: { arm: 10, reach: 40, lean: 4, crouch: 4 },
  chopTell: { arm: -95, reach: 34, lean: -5 }, chop: { arm: 25, reach: 44, lean: 6 },
  feintTell: { arm: 0, reach: 10, lean: 3 }, feint: { arm: 10, reach: 8, lean: -6 },
  lungeTell: { arm: -10, reach: 6, lean: -6, crouch: 4 }, lunge: { arm: 0, reach: 34, lean: 9 },
  flurryTell: { arm: -20, reach: 10, lean: -2 }, flurry: { arm: 5, reach: 30, lean: 4 },
  breakerTell: { arm: -120, reach: 30, lean: -6, crouch: 2 }, breaker: { arm: 35, reach: 40, lean: 8 },
  whirlTell: { arm: -60, reach: 30, lean: -3, crouch: 3 }, whirl: { arm: 0, reach: 36, lean: 0, spin: true },
  stumble: { arm: 60, reach: 8, lean: 10, slump: 6, ghost: 10 }, stuck: { arm: 50, reach: 44, lean: 8, slump: 4, ghost: 10 }, winded: { arm: 80, reach: 8, lean: 2, slump: 6, ghost: 10 },
  dizzy: { arm: 70, reach: 20, lean: -4, slump: 5, ghost: 10 }, knocked: { arm: 90, reach: 4, lean: 0, slump: 10, ghost: 16 },
  leave: { arm: 90, reach: 4, lean: 0, slump: 10, ghost: 20 }, swap: { arm: 90, reach: 4, lean: 0, slump: 10, ghost: 20 }, wisp: { wisp: true },
};
const R = Math.round, GHOST = '#9adfb0';
const rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
const SET_COL = { knight: '#8a8e90', halberd: '#7a8478', duelist: '#8a7e8e', greatsword: '#6e6e72' };

export function makeCastellanHands(ctx) {
  let S = null; const H = {};
  const TS = ctx.TS, A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'castellan' ? ctx.L.arena : null);
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'castellan';
  H.clear = () => { S = null; };
  const live = () => { const e = ctx.boss; return e && e.alive && e.t === 'castellan' ? e : null; };
  const keyed = (pp, key) => { pp.csKeys = pp.csKeys || new Set(); if (pp.csKeys.size > 200) pp.csKeys.clear(); if (pp.csKeys.has(key)) return true; pp.csKeys.add(key); return false; };
  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null; S = CSM.newFight(CSM.geom(ctx.L, TS));
    const hp = (ctx.EHP && ctx.EHP.castellan) || CS.hp, r0 = Ar.racks[0];
    const e = { ...base, t: 'castellan', w: CS.w, h: CS.h, hp, maxHp: hp, noGrav: true, markH: CS.markH, face: 1, mode: 'sleep', modeT: 0, phase: 1, boss: true, x: r0.x, y: Ar.floor };
    for (const pp of ctx.players()) pp.csKeys = null; return e; };
  const heroes = () => ctx.players().map((pp, i) => ({ x: pp.x, y: pp.y, ground: !!pp.ground, dodging: (pp.inv || 0) > 0, alive: !pp.dead && (ctx.upright ? ctx.upright(pp) : true), pp, id: i }));
  const sayKey = { open: [CS_SAY.open, '#ffd36b'], leaves: [CS_SAY.leaves, '#9adfb0'], final: [CS_SAY.final, '#ff9a5c'], wisp: [CS_SAY.wisp, '#9adfb0'] };
  function world(e) {
    return {
      sound: k => { const f = SOUND[k]; if (f && ctx.sfx) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake && ctx.shake(n),
      mark: (m, who) => ctx.number(who.x, who.y - CS.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      say: (k, x, y) => { const s = sayKey[k]; if (s) ctx.number(x, y - CS.markH - 8, s[0], s[1]); },
      fx: (k, x, y) => { if (k === 'open' && ctx.ring) ctx.ring(x, y - 20, 24, GHOST); },
      hitHero: (h, d, name, key, o = {}) => { const pp = h.pp; if (!pp || keyed(pp, key)) return null; let r = null; ctx.asPlayer(pp, () => { const hp0 = pp.hp; r = ctx.damage(e.x, d, { who: e, name: CS_SAY.name, unblockable: !o.blockable, low: !!o.low });
        if (pp.hp < hp0) S.hurt[name] = (S.hurt[name] || 0) + (hp0 - pp.hp); }); return r; },
    };
  }
  H.update = (e, dt) => { if (!S || !e.alive || !A()) return;
    if (e.mode === 'sleep' && ctx.bossActive) { e.mode = 'wake'; e.modeT = 1.4; }
    if (e.mode === 'wake' && !S.woke) { S.woke = true; ctx.number(e.x, e.y - CS.markH - 16, CS_SAY.wake, '#c8d8cc'); world(e).sound('wake'); }
    if (S.woke && !S.told.rule && e.mode === 'walk') { S.told.rule = 1; ctx.hint && ctx.hint(CS_SAY.rule); }
    const was = S.si; CSM.step(e, S, dt, heroes(), world(e)); e.phase = S.final ? 5 : S.si + 1; e.open = CSM.csOpen(e) ? Math.max(0, e.modeT) : 0;
    if (S.si !== was && S.si < CS.order.length) ctx.number(e.x, e.y - CS.markH - 20, CS_SAY.sets[S.set], GHOST); };
  /* A HERO'S BLOW on his wisp in the final (the opening) */
  H.strike = (hb) => { if (!S || !hb || !ctx.bossActive) return; const e = live(); if (!e || e.mode !== 'wisp') return;
    if (hb.l < e.x + 10 && hb.r > e.x - 10 && hb.t < e.y + 10 && hb.b > e.y - 10) CSM.strikeWisp(e, S, world(e)); };
  H.take = (e, dmg, tag, from) => { if (!S) return dmg; const who = from || (ctx.hero && ctx.hero());
    if (S.final && e.mode === 'wisp') CSM.strikeWisp(e, S, world(e));   /* a blow that lands on the wisp knocks him out */
    const [d, word] = CSM.takeBlow(e, S, dmg, who ? { x: who.x, y: who.y } : null);
    if (word === 'ARMOUR' || word === 'SHIELD') { e.chipHit = ctx.time ? ctx.time() : 0; e.guardFx = 0.2; e.guardWord = word === 'SHIELD' ? CS_SAY.shield : CS_SAY.warded; if (!S.told.hide) { S.told.hide = 1; ctx.hint && ctx.hint(CS_SAY.warded + '. ' + CS_SAY.rule + '.'); } }
    if (word === 'HOLDS') ctx.number(e.x, e.y - CS.markH, CS_SAY.holds, '#c8d8cc');
    return d; };
  H.barName = e => CS_SAY.name + ' - ' + (S && S.final ? 'EVERY SUIT' : CS_SAY.sets[S ? S.set : 'knight']) + (CSM.csOpen(e) ? '  ' + CSM.OPEN_MODES[e.mode] : '');
  H.end = () => { if (S) { S.won = true; S.wisp = null; } };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, set: CSM.setName(S), si: S.si, final: S.final, sets: [...S.sets], n: { ...S.n }, hurt: { ...S.hurt }, won: S.won };
  /* ================= THE GREYBOX DRAWING ================= */
  const suit = (g, px, py, f, set, p, lit, time) => {   /* a suit of armour: legs, body, helm, its weapon */
    const c = SET_COL[set] || '#7a7e80', cr = p.crouch || 0, sl = p.slump || 0, ln = p.lean || 0;
    rect(g, px - 5, py - 12 + cr, 4, 12 - cr, c); rect(g, px + 1, py - 12 + cr, 4, 12 - cr, c);
    rect(g, px - 7 + ln * f * 0.5, py - 26 + cr + sl, 14, 14, c); rect(g, px - 5 + ln * f, py - 34 + cr + sl, 10, 8, c);
    rect(g, px - 3 + ln * f + f * 1, py - 31 + cr + sl, 6, 2, lit ? GHOST : '#202424');   /* THE VISOR: lit ghost-green while he is in it */
    if (set === 'knight') rect(g, px + f * 8 - 2, py - 26 + cr - (p.shield || 14) + 14, 4, p.shield || 14, '#9a9ea0');
    const a = (p.arm || 0) * Math.PI / 180, ax = px + f * (6 + ln), ay = py - 20 + cr, rr = (p.reach || 10) + (set === 'halberd' ? 14 : set === 'greatsword' ? 10 : 0);
    g.strokeStyle = set === 'duelist' ? '#e6e6ee' : '#c8c8c8'; g.lineWidth = set === 'greatsword' ? 4 : set === 'duelist' ? 1 : 2; g.beginPath(); g.moveTo(ax, ay);
    const sa = p.spin ? time * 20 : a; g.lineTo(ax + f * Math.cos(sa) * rr, ay + Math.sin(sa) * rr); g.stroke();
    if (set === 'halberd') rect(g, ax + f * Math.cos(sa) * rr - 3, ay + Math.sin(sa) * rr - 3, 6, 6, '#c8c8c8'); };
  H.drawBoss = (g, e, cx, cy, time) => { const p = CSM.csOpen(e) ? (POSE[e.mode] || POSE.walk) : (POSE[e.mode] || POSE.walk), f = e.face || 1, ex = R(e.x - cx), ey = R(e.y - cy);
    if (p.wisp) { rect(g, ex - 6, ey - 6, 12, 12, GHOST); rect(g, ex - 3, ey - 3, 6, 6, '#e6fff0'); rect(g, ex - f * 10, ey - 2, 6, 4, 'rgba(154,223,176,0.5)'); return; }
    const set = S ? S.set : 'knight'; suit(g, ex, ey, f, set, p, !(e.mode === 'leave' || e.mode === 'swap'), time);
    if (p.ghost) { g.globalAlpha = 0.55 + 0.25 * Math.sin(time * 10); rect(g, ex - 5, ey - 34 - p.ghost, 10, p.ghost + 4, GHOST); g.globalAlpha = 1; }   /* THE GHOST, half out of the suit: the opening's read */
    if (CSM.csOpen(e)) rect(g, ex - 12, ey - 44, 24, 2, '#ffd36b'); };
  H.drawOver = (g, cx, cy, VW, VH, time) => { if (!S) return; const x = v => R(v - cx), y = v => R(v - cy), e = live();
    S.G.racks.forEach((r, i) => { if (e && i === S.rack && !(e.mode === 'leave' || e.mode === 'wisp')) return;   /* the suit he wears walks; the others stand on their racks */
      const broken = S.sets.includes(r.set) && !S.final, lightUp = e && e.mode === 'swap' && i === S.rack;
      rect(g, x(r.x) - 9, y(S.G.floorY) - 2, 18, 2, '#3a3a3a'); suit(g, x(r.x), y(S.G.floorY), -Math.sign(r.x - (S.G.x0 + S.G.x1) / 2) || 1, r.set, broken ? { arm: 80, reach: 6, slump: 8 } : POSE.sleep, lightUp && (time * 10) % 2 < 1, time); });
    if (e && e.mode === 'chopTell') { const cx0 = S.chopAt !== undefined ? S.chopAt : e.x + (e.face || 1) * CS.halberd.chop.at; rect(g, x(cx0) - CS.halberd.chop.w, y(S.G.floorY) - 2, CS.halberd.chop.w * 2, 2, (time * 8) % 2 < 1 ? '#ff4a2a' : '#ff9a5c'); }   /* where the chop lands */
    if (e && e.mode === 'sweepTell') rect(g, x(e.x) - CS.halberd.sweep.reach, y(S.G.floorY) - 3, CS.halberd.sweep.reach * 2, 2, (time * 8) % 2 < 1 ? '#ff4a2a' : '#ff9a5c');
    if (e && e.mode === 'wisp' && S.wisp) { g.strokeStyle = 'rgba(154,223,176,0.4)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x(e.x) + 0.5, y(e.y)); g.lineTo(x(S.wisp.x1) + 0.5, y(S.G.floorY) - 30); g.stroke(); } };
  return H;
}
