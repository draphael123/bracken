// src/crypt-mother-hands.js - THE CRYPT MOTHER's HANDS (claude/silk, the OPUS GREYBOX). src/crypt-mother.js is the fight (pure); this binds it to the world:
// the knots (a hero's blow on the live one = THE CUT), the floor strands P2 drops (through src/silk-hands.js setCell, so a reset puts them back), her sacs (a torch
// from src/silk-hands.js burns them), the spiderlings they hatch (src/silk-hands.js ling), her told blows on the heroes (keyed once a blow), the snare - and the greybox.
// GREYBOX (the sonnet art lane draws the final, src/redraw/crypt_mother_art.js to come): every move its own windup pose and release pose (POSE, B16), its own sound.
// main.js calls (one tagged line each): spawnBoss, owns, on, update, take, strike, drawBoss, drawOver, barName, end, clear.
import * as CMM from './crypt-mother.js';
import { CM_SAY, SK_SAY } from './sk-lines.js';
const { CM } = CMM;

export const SOUND = { spitTell: s => (s.hiss || s.tell)(), spit: s => (s.puff || s.whoosh || s.tell)(), pounceTell: s => (s.hiss || s.tell)(), pounce: s => (s.whoosh || s.tell)(),
  slam: s => (s.thud)(), clutchTell: s => (s.squelch || s.tell)(), clutch: s => (s.squelch || s.thud)(), sweepTell: s => (s.charge || s.tell)(), sweep: s => (s.whoosh || s.tell)(),
  cut: s => { (s.crack || s.thud)(); (s.ui || s.tell)(); }, climb: s => (s.hiss || s.tell)(), lament: s => (s.roar || s.hiss || s.thud)(), hatch: s => (s.squelch || s.thud)(),
  burn: s => (s.sizzle || s.puff || s.thud)(), flash: s => (s.crack || s.tell)(), collapse: s => (s.crash || s.thud)(), wake: s => (s.hiss || s.roar || s.tell)() };
/* THE POSE A MODE WEARS (greybox, local px, facing right, body centre at 0,0): legs spread (px), legs raised (front pair lift), abdomen lift, spinneret, fangs, upside down */
export const POSE = {
  sleep: { spread: 16, lift: 0, abd: 0, fang: 0, curl: true },
  wake: { spread: 26, lift: 8, abd: 2, fang: 2 },
  hang: { spread: 24, lift: 2, abd: 0, fang: 0 },
  climb: { spread: 20, lift: 0, abd: -2, fang: 0 },
  spitTell: { spread: 22, lift: 0, abd: -8, fang: 0, spin: true },
  spit: { spread: 24, lift: 0, abd: 6, fang: 2, spin: true },
  pounceTell: { spread: 14, lift: -4, abd: 4, fang: 3, crouch: true },
  pounce: { spread: 32, lift: 10, abd: 0, fang: 4 },
  landed: { spread: 30, lift: 0, abd: 2, fang: 2 },
  clutchTell: { spread: 24, lift: 0, abd: 10, fang: 0, pulse: true },
  clutch: { spread: 24, lift: 0, abd: 14, fang: 0, pulse: true },
  sweepTell: { spread: 22, lift: 0, abd: 0, fang: 1, leg: -20 },
  sweep: { spread: 22, lift: 0, abd: 0, fang: 1, leg: 40 },
  fallen: { spread: 18, lift: -10, abd: 0, fang: 0, upside: true },
  lament: { spread: 34, lift: 14, abd: 4, fang: 4 },
};
const R = Math.round;
const rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };

export function makeCryptMotherHands(ctx) {
  let S = null; const H = {};
  const TS = ctx.TS, A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'cryptmother' ? ctx.L.arena : null);
  const SKH = () => ctx.sk && ctx.sk();
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'cryptmother';
  H.clear = () => { S = null; };
  const live = () => { const e = ctx.boss; return e && e.alive && e.t === 'cryptmother' ? e : null; };
  const keyed = (pp, key) => { pp.cmKeys = pp.cmKeys || new Set(); if (pp.cmKeys.size > 200) pp.cmKeys.clear(); if (pp.cmKeys.has(key)) return true; pp.cmKeys.add(key); return false; };
  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null; S = CMM.newFight(CMM.geom(ctx.L, TS));
    const hp = (ctx.EHP && ctx.EHP.cryptmother) || CM.hp;
    const e = { ...base, t: 'cryptmother', w: CM.w, h: CM.h, hp, maxHp: hp, noGrav: true, markH: CM.markH, face: -1, mode: 'sleep', modeT: 0, phase: 1, boss: true, y: Ar.hang.y, x: Ar.hang.x };
    for (const pp of ctx.players()) pp.cmKeys = null; return e; };
  const heroes = () => ctx.players().map((pp, i) => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: !pp.dead && (ctx.upright ? ctx.upright(pp) : true), pp, id: i }));
  const sayKey = { open: [CM_SAY.open, '#ffd36b'], p2: [CM_SAY.p2, '#ff9a5c'], falls: [CM_SAY.falls, '#ff6b6b'], hatch: [SK_SAY.hatch, '#ff9a5c'], burned: [SK_SAY.burned, '#ffb04a'] };
  function world(e) {
    return {
      sound: k => { const f = SOUND[k]; if (f && ctx.sfx) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake && ctx.shake(n),
      mark: (m, who) => ctx.number(who.x, who.y - CM.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      say: (k, x, y) => { const s = sayKey[k]; if (s) ctx.number(x, y - CM.markH - 8, s[0], s[1]); },
      fx: (k, x, y) => { if (k === 'open' && ctx.ring) ctx.ring(x, y, 24, '#ffd36b'); },
      music: () => {},
      hitHero: (h, d, name, key, o = {}) => { const pp = h.pp; if (!pp || keyed(pp, key)) return null; let r = null; ctx.asPlayer(pp, () => { const hp0 = pp.hp; r = ctx.damage(e.x, d, { who: e, name: 'THE CRYPT MOTHER', unblockable: !o.blockable, low: !!o.low });
        if (pp.hp < hp0) { S.hurt[name] = (S.hurt[name] || 0) + (hp0 - pp.hp); if (o.snare && r !== 'blocked') { pp.snare = Math.max(pp.snare || 0, o.snare); ctx.number(pp.x, pp.y - 30, SK_SAY.snared, '#ff6b6b'); } } }); return r; },
      spawnLings: (x, y, n) => { const G = SKH(); if (G) for (let i = 0; i < n; i++) G.ling(x + (i - (n - 1) / 2) * 10, y); },
      dropSec: i => { const G = SKH(), s = S.G.secs[i]; if (G) for (let x = s.x0; x <= s.x1; x++) G.setCell(x, s.row, ctx.T.AIR); },
      solidAt: (x, y) => { const L0 = ctx.L, tx = Math.floor(x / TS), ty = Math.floor(y / TS); return tx >= 0 && ty >= 0 && tx < L0.W && ty < L0.H && L0.grid[ty * L0.W + tx] === ctx.T.SOLID; },
    };
  }
  H.update = (e, dt) => { if (!S || !e.alive || !A()) return;
    if (e.mode === 'sleep' && ctx.bossActive) { e.mode = 'wake'; e.modeT = 1.6; }
    if (e.mode === 'wake' && !S.woke) { S.woke = true; ctx.number(e.x, e.y - CM.markH - 16, CM_SAY.wake, '#e6e6ee'); world(e).sound('wake'); }
    if (S.woke && !S.told.rule && e.mode === 'hang') { S.told.rule = 1; ctx.hint && ctx.hint(CM_SAY.rule); }
    CMM.step(e, S, dt, heroes(), world(e)); e.phase = S.ph; e.open = CMM.cmOpen(e) ? Math.max(0, e.modeT) : 0; };
  /* A HERO'S BLOW on her live knot (THE CUT) or on one of her sacs */
  H.strike = (hb, by) => { if (!S || !hb || !ctx.bossActive) return; const e = live(); if (!e) return; const k = CMM.knotOf(S);
    if (k && hb.l < k.x + 9 && hb.r > k.x - 9 && hb.t < k.y + 9 && hb.b > k.y - 9) CMM.cutKnot(e, S, k.id, world(e));
    const G = SKH(), torch = !!(G && by && G.hasTorch(by));
    S.sacs.forEach((s, i) => { if (!s.dead && hb.l < s.x + 8 && hb.r > s.x - 8 && hb.t < s.y && hb.b > s.y - 14) CMM.strikeSac(S, i, torch, world(e)); }); };
  /* a torch-bearer who walks into a sac burns it too */
  H.touch = () => { const e = live(), G = SKH(); if (!S || !e || !G) return; for (const pp of ctx.players()) if (!pp.dead && G.hasTorch(pp)) S.sacs.forEach((s, i) => { if (!s.dead && Math.abs(pp.x - s.x) < 12 && Math.abs(pp.y - s.y) < 20) CMM.strikeSac(S, i, true, world(e)); }); };
  H.cut = () => { const e = live(); return e && S ? CMM.cutKnot(e, S, CMM.knotOf(S).id, world(e)) : 'none'; };   /* (a pilot hook for the tune lane's page bot) */
  H.take = (e, dmg, from) => { if (!S) return dmg; const who = from || (ctx.hero && ctx.hero()); const [d, word] = CMM.takeBlow(e, S, dmg, who ? { x: who.x, y: who.y } : null);
    if (word === 'HIDE') { e.chipHit = ctx.time ? ctx.time() : 0; e.guardFx = 0.2; e.guardWord = CM_SAY.warded; if (!S.told.hide) { S.told.hide = 1; ctx.hint && ctx.hint(CM_SAY.warded + '. ' + CM_SAY.rule + '.'); } }
    if (word === 'ABOVE') ctx.number(e.x, e.y - CM.markH, CM_SAY.abdomen, '#ffd36b');
    if (word === 'HOLDS') ctx.number(e.x, e.y - CM.markH, CM_SAY.holds, '#e6e6ee');
    return d; };
  H.barName = e => CM_SAY.name + (CMM.cmOpen(e) ? '  ' + CMM.OPEN_NAME[e.mode] : '');
  H.end = () => { if (S) { S.globs = []; S.sacs.forEach(s => { s.dead = true; }); S.flash = null; S.won = true; } };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, knot: S.knot, fallen: [...S.fallen], n: { ...S.n }, hurt: { ...S.hurt }, won: S.won };
  /* ================= THE GREYBOX DRAWING ================= */
  H.drawBoss = (g, e, cx, cy, time) => { const p = POSE[e.mode] || POSE.hang, f = e.face || 1, ex = R(e.x - cx), ey = R(e.y - cy), up = p.upside ? -1 : 1;
    if (CMM.hanging(e) || e.mode === 'climb' || e.mode === 'wake' || e.mode === 'sleep') { const k = S && CMM.knotOf(S); if (k) { g.strokeStyle = 'rgba(235,235,245,0.85)'; g.lineWidth = 1; g.beginPath(); g.moveTo(ex + 0.5, ey - 8); g.lineTo(R(k.x - cx) + 0.5, R(k.y - cy)); g.stroke(); } }
    for (let i = 0; i < 4; i++) { const lx = (6 + i * 5), ly = (p.lift * (i === 0 ? 1 : 0.3)) * -up, sp = p.spread;   /* eight legs, four a side */
      rect(g, ex - lx - sp * 0.4, ey + ly - 2 + i, sp * 0.4 + 2, 2, '#2a2a30'); rect(g, ex + lx, ey + ly - 2 + i, sp * 0.4 + 2, 2, '#2a2a30'); }
    if (p.leg) rect(g, ex + f * 10, ey + 6, f * p.leg, 3, '#3a3a44');
    rect(g, ex - 10 - f * 4, ey - 8 + p.abd * -up * 0.3, 20, 16, p.pulse && (time * 8) % 2 < 1 ? '#5a6a4a' : '#3a3a44');   /* the abdomen */
    rect(g, ex - 6 + f * 8, ey - 5, 12, 10, '#4a4a54');   /* the cephalothorax */
    rect(g, ex - 2 + f * 13, ey - 3, 2, 2, '#ff4a2a'); rect(g, ex + f * 13, ey - 3, 2, 2, '#ff4a2a');
    if (p.fang) rect(g, ex + f * 14, ey + 2, 2, p.fang, '#e6e6ee');
    if (p.spin) rect(g, ex - f * 14, ey - 2, 4, 4, '#e6e6ee');
    if (p.upside) rect(g, ex - 12, ey - 12, 24, 2, '#ffd36b');   /* ON HER BACK: the open read */
  };
  H.drawOver = (g, cx, cy, VW, VH, time) => { if (!S) return; const x = v => R(v - cx), y = v => R(v - cy);
    for (const k of S.G.knots) { const live0 = k === CMM.knotOf(S); rect(g, x(k.x) - 4, y(k.y) - 4, 8, 8, live0 ? ((time * 4) % 2 < 1 ? '#ffd36b' : '#e6e6ee') : '#6a6a78'); }   /* THE KNOTS: the live one glints */
    if (S.shadow) { rect(g, x(S.shadow.x) - 14, y(S.G.floorY) - 2, 28, 3, 'rgba(10,10,14,0.8)'); g.strokeStyle = (time * 10) % 2 < 1 ? '#ff4a2a' : '#e6e6ee'; g.beginPath(); g.moveTo(x(S.shadow.x) + 0.5, y(S.G.hangY)); g.lineTo(x(S.shadow.x) + 0.5, y(S.G.floorY)); g.stroke(); }
    for (const gl of S.globs) rect(g, x(gl.x) - 3, y(gl.y) - 3, 6, 6, '#d8e8c8');
    for (const s of S.sacs) if (!s.dead) { const k = 1 - s.t / CM.clutch.hatch; rect(g, x(s.x) - 5, y(s.y) - 12, 10, 12, 'rgba(150,220,120,' + (0.4 + 0.5 * k * ((time * (4 + 8 * k)) % 2 < 1 ? 1 : 0.4)).toFixed(2) + ')'); }
    if (S.flash) { const s = S.G.secs[S.flash.i]; if ((time * 8) % 2 < 1) rect(g, x(s.px0), y(S.G.floorY), s.px1 - s.px0, 4, '#ff4a2a'); }
    const e = live(); if (e && e.mode === 'sweepTell') rect(g, x(e.x) - CM.sweep.reach, y(S.G.floorY) - 3, CM.sweep.reach * 2, 2, (time * 8) % 2 < 1 ? '#ff4a2a' : '#ff9a5c'); };
  return H;
}
