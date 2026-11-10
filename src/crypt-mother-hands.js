// src/crypt-mother-hands.js - THE CRYPT MOTHER's HANDS (claude/silk, the OPUS GREYBOX). src/crypt-mother.js is the fight (pure); this binds it to the world:
// the knots (a hero's blow on the live one = THE CUT), the floor strands P2 drops (through src/silk-hands.js setCell, so a reset puts them back), her sacs (a torch
// from src/silk-hands.js burns them), the spiderlings they hatch (src/silk-hands.js ling), her told blows on the heroes (keyed once a blow), the snare - and the greybox.
// DRAWN (src/redraw/crypt_mother_art.js, claude/silkart): every move its own windup pose and release pose (POSE, B16), its own sound.
// main.js calls (one tagged line each): spawnBoss, owns, on, update, take, strike, drawBoss, drawOver, barName, end, clear.
import * as CMM from './crypt-mother.js';
import { CM_SAY, SK_SAY } from './sk-lines.js'; import * as CMA from './redraw/crypt_mother_art.js'; import * as ART from './redraw/silk_art.js';
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
  H.take = (e, dmg, tag, from) => { if (!S) return dmg; const who = from || (ctx.hero && ctx.hero()); const [d, word] = CMM.takeBlow(e, S, dmg, who ? { x: who.x, y: who.y } : null);
    if (word === 'HIDE') { e.chipHit = ctx.time ? ctx.time() : 0; e.guardFx = 0.2; e.guardWord = CM_SAY.warded; if (!S.told.hide) { S.told.hide = 1; ctx.hint && ctx.hint(CM_SAY.warded + '. ' + CM_SAY.rule + '.'); } }
    if (word === 'ABOVE') ctx.number(e.x, e.y - CM.markH, CM_SAY.abdomen, '#ffd36b');
    if (word === 'HOLDS') ctx.number(e.x, e.y - CM.markH, CM_SAY.holds, '#e6e6ee');
    return d; };
  H.barName = e => CM_SAY.name + (CMM.cmOpen(e) ? '  ' + CMM.OPEN_NAME[e.mode] : '');
  H.end = () => { if (S) { S.globs = []; S.sacs.forEach(s => { s.dead = true; }); S.flash = null; S.won = true; } };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, knot: S.knot, fallen: [...S.fallen], n: { ...S.n }, hurt: { ...S.hurt }, won: S.won };
  /* ================= THE DRAWING (src/redraw/crypt_mother_art.js, claude/silkart) ================= */
  H.drawBoss = (g, e, cx, cy, time) => { const p = POSE[e.mode] || POSE.hang, f = e.face || 1, ex = R(e.x - cx), ey = R(e.y - cy);
    if (CMM.hanging(e) || e.mode === 'climb' || e.mode === 'wake' || e.mode === 'sleep') { const k = S && CMM.knotOf(S); if (k) CMA.drawAnchorLine(g, R(k.x - cx), R(k.y - cy), ex, ey - 8); }
    CMA.drawMother(g, ex + 6 * f, ey - 6, p, f, time, { flash: e.flash > 0.06 && e.alive }); };   /* (claude/nighttune) the art's origin sits 6 px behind its mass (abdomen -24..head +16): drawn 6 px forward and 6 up so the 30x20 hitbox sits on the body, not 10 px to its left */
  H.drawOver = (g, cx, cy, VW, VH, time) => { if (!S) return; const x = v => R(v - cx), y = v => R(v - cy);
    for (const k of S.G.knots) ART.drawKnot(g, x(k.x), y(k.y), false, time, k === CMM.knotOf(S));   /* THE KNOTS: the live one glints */
    if (S.shadow) CMA.drawPounceShadow(g, x(S.shadow.x), y(S.G.floorY), y(S.G.hangY), time);
    for (const gl of S.globs) ART.drawGlob(g, x(gl.x), y(gl.y), gl.vx || 0, gl.vy || 0);
    for (const s of S.sacs) if (!s.dead) ART.drawSac(g, x(s.x), y(s.y), 'whole', 1 - s.t / CM.clutch.hatch, time);
    if (S.flash) { const s = S.G.secs[S.flash.i]; CMA.drawStrandFlash(g, x(s.px0), x(s.px1), y(S.G.floorY), time); }
    const e = live(); if (e && e.mode === 'sweepTell') CMA.drawSweepTell(g, x(e.x), y(S.G.floorY), CM.sweep.reach, time); };
  return H;
}
