// src/flotilla3.js - THE FLOTILLA 3's own pieces (claude/flotilla3, the OPUS greybox; scratch/brief-flotilla3-1018.md part D + the APPROVED review
// scratch/review-flotilla-1018.md - Daniel 10-18 10:18 'all recs'). The level is theFlotilla() in src/level.js; src/flotilla2.js keeps the benches and the yards.
// THE ONE RULE (review fix 1): STRIKE A BREECH AND THE GUN CLEARS ITS LINE. WHEN HIS FLAG RUNS RED, HIS GUNS CLEAR YOURS. This module is the second half and the
// guns that are not deck guns:
//   HIS BROADSIDE (L.flot3.zones): a stretch of the level the Admiral's flagship has its guns laid on. Told (A3): the flagship's SIGNAL HOIST runs up RED (the
//     'signalhoist' ents in the play plane, and the landmark flagship far off - drawBack), her gunports glow at the zone's end, and the deck ROW the shot will cross is
//     marked red; ~2.5 s after the flag the shot crosses that row from the flagship's side. Cover: anything solid between you and her (a mantlet, a bulwark, a door),
//     or be OFF THE ROW (a bench stopped high or low, down a hatch, up the shrouds). A ball takes ~25% of your health and shoves you ALONG the deck (never overboard,
//     review Q3 - in the exams it can put you in the water), kills his own men in its way, and BLOWS A COPPER DOOR it meets (his gun as your tool). The rock's zone
//     is HARMLESS: the shot falls short and throws spray (the tell taught where it costs nothing).
//   THE LAID GUNS ('aimgun' ents): a swivel or a fighting-top gun laid on a target the level DRAWS FIRST (a dotted line to it - the trebuchet test, A8). Strike its
//     breech and the shot flies the line: it blows the target's cells open (hole) and/or drops a yard level across a gap (bridge). Once: it stays that way.
//   THE GRAPNEL BOARDER ('grapnel', the level's ONE NEW FOE, review Q4): he waits on a hull alongside, whirls his hook (told), and SWINGS across onto your deck,
//     landing on a told mark. CUT HIS LINE mid-swing (a blow on him or the line) and he drops - into the harbour if he is over it. Landed, he fights with his cutlass.
//   THE KEG ROLLER's keg (the powder monkey's machine, cnSkin 'kegroller'): he rolls it lit down the deck at you; STRIKE IT and it rolls back at him.
// main.js calls: on, clear, update(dt), strike(hb), ownsFoe(e), spawnFoe(base, e), updateFoe(e, dt), takeFoe(e, dmg, blow), drawFoe(g, e, cx, cy, time), rollKeg(e),
//   drawBack(g, cx, cy, time), drawOver(g, cx, cy, time), read().
const R = Math.round;
export const F3 = {
  tell: 2.5, every: 10, shotV: 520, pct: 0.25, shove: 150, examShove: 260,
  /* THE GRAPNEL BOARDER: he sees you sightX px off and within sightY; whirls whirlT s; swings swingT s (swingH px over the straight line at its middle); lands on a
     mark landR px; then fights: cutTell s, a cut cutT s at cutReach px, cutRec s after */
  sightX: 260, sightY: 120, whirlT: 0.9, swingT: 1.0, swingH: 30, landR: 22, cutTell: 0.5, cutT: 0.15, cutReach: 28, cutRec: 0.65, walk: 52, hp: 70, dmg: 18, landDmg: 14,
  /* THE KEG ROLLER's keg: rolls kegV px/s, back at him kegBackV; fuse kegFuse s; blast kegR px */
  kegV: 105, kegBackV: 210, kegFuse: 2.8, kegR: 34,
};
/* EVERY LINE THE LEVEL SAYS (src/hint-lines.js SAY_LINES lets them through number()) */
export const F3_SAY = { flag: 'HIS FLAG RUNS RED: OFF THE MARKED ROW, OR BEHIND SOMETHING SOLID', short: 'OUT HERE HIS SHOT FALLS SHORT', door: 'HIS SHOT TAKES THE DOOR',
  fired: 'THE SHOT FLIES ITS LINE', hole: 'THE DECK IS OPEN', bridge: 'THE YARD DROPS: A BRIDGE', cut: 'CUT OFF HIS LINE', wet: 'INTO THE HARBOUR', back: 'STRUCK BACK AT HIM',
  boarders: 'BOARDERS! CUT THEM OFF THEIR LINES', kegWet: 'THE KEG GOES IN THE HARBOUR' };
export function makeFlotilla3(ctx) {
  const H = {}; let Z = [], GUNS = [], KEGS = [], TOLD = {};
  const F = () => (ctx.L && ctx.L.flot3) || null, TS = () => ctx.TS;
  H.on = () => !!F();
  H.clear = () => { const f = F(); TOLD = {}; KEGS = [];
    Z = f ? f.zones.map(z => ({ ...z, st: 'wait', t: z.first ?? 3, balls: [], key: 0 })) : [];
    GUNS = f ? (ctx.L.ents || []).filter(e => e.t === 'aimgun').map(e => ({ ...e, fired: false, ball: null, smoke: 0 })) : []; };
  H.zones = () => Z; H.guns = () => GUNS;
  H.read = () => ({ zones: Z.map(z => ({ id: z.id, st: z.st, t: +z.t.toFixed(2), balls: z.balls.length, harmless: !!z.harmless })), guns: GUNS.map(g => ({ id: g.id, x: g.x, y: g.y, fired: g.fired })), kegs: KEGS.length });
  const hero = () => ctx.hero();
  const inZone = (z, P) => P.x > (z.x0 - 4) * TS() && P.x < (z.x1 + 4) * TS() && P.y > (z.y0 - 12) * TS() && P.y < (z.y1 + 10) * TS();
  /* ---------- HIS BROADSIDE ---------- */
  function stepZone(z, dt) { const P = hero(), T = TS();
    if (z.st === 'wait') { if (!P || P.dead || !inZone(z, P)) { z.t = Math.max(z.t, z.first ?? 3); return; } z.t -= dt; if (z.t <= 0) { z.st = 'tell'; z.t = F3.tell; z.key++; ctx.sound('whistle');
        if (!TOLD['f' + z.id]) { TOLD['f' + z.id] = 1; ctx.number(P.x, P.y - 46, z.harmless ? F3_SAY.short : F3_SAY.flag, '#ff9a7a'); } } return; }
    if (z.st === 'tell') { z.t -= dt; if (z.t <= 0) { z.st = 'fire'; ctx.sound('broadside'); ctx.shake(z.harmless ? 2 : 5);
        const x = (z.from > 0 ? z.x1 + 1 : z.x0) * T, top = z.y0 * T, bot = (z.y1 + 1) * T, n = Math.max(2, Math.round((bot - top) / 11));
        for (let i = 0; i < n; i++) z.balls.push({ x: x + (z.from > 0 ? i * 14 : -i * 14), y: top + 5 + (bot - top - 10) * (n === 1 ? 0.5 : i / (n - 1)), vx: -(z.from || 1) * F3.shotV, t: 0 }); } return; }
    /* the shot in flight */
    for (const b of z.balls) { b.t += dt; const x0 = b.x; b.x += b.vx * dt; const tx = Math.floor(b.x / T), ty = Math.floor(b.y / T);
      if (z.harmless && b.x < (z.short ?? z.x1) * T) { b.dead = true; ctx.burst(b.x, (z.splashY ?? z.y1 + 6) * T, 10, ['#dff2f8', '#bfe6f5', '#7a8a3a'], 120, 0.6, -120); continue; }
      /* a copper door it meets: blown (src/main.js updateBalls opens it - the door IS wall, so this is asked before the wall) */
      const door = (ctx.props() || []).find(p => p.t === 'bulkhead' && !p.open && p.span && b.x > p.span[0] * T - 4 && b.x < (p.span[1] + 1) * T + 4 && b.y > p.span[2] * T - 4 && b.y < (p.span[3] + 1) * T + 4);
      if (door) { b.dead = true; ctx.pushBall({ x: b.x, y: b.y, vx: b.vx * 0.5, t: 0 }); if (!TOLD['d' + z.id]) { TOLD['d' + z.id] = 1; ctx.number(b.x, b.y - 30, F3_SAY.door, '#8fd160'); } continue; }
      if (ctx.isSolid(tx, ty)) { b.dead = true; ctx.burst(b.x, b.y, 8, ['#9aa39a', '#e8dcc0'], 80, 0.4); continue; }
      if (b.x < (z.x0 - 2) * T || b.x > (z.x1 + 3) * T || b.t > 3) { b.dead = true; continue; }
      if (z.harmless) continue;
      for (const pp of ctx.players) ctx.asPlayer(pp, () => { const Q = ctx.hero(); if (Q.dead || (Q.f3Key || '') === z.id + '.' + z.key) return; const bx = ctx.box(Q);
        if (b.y < bx.t || b.y > bx.b || Math.min(x0, b.x) > bx.r || Math.max(x0, b.x) < bx.l) return; Q.f3Key = z.id + '.' + z.key;
        const hp0 = Q.hp; ctx.damagePlayer(b.x, 1, { unblockable: true, noKnock: true, pct: F3.pct, name: 'HIS BROADSIDE', blow: 'HIS BROADSIDE' }); if (Q.hp < hp0 && !Q.dead) Q.vx = Math.sign(b.vx) * (z.exam ? F3.examShove : F3.shove); b.dead = true; });
      for (const e of ctx.enemies()) { if (b.dead || !e.alive || e.harmless || e.maxHp || e === ctx.boss) continue; if (Math.abs(e.x - b.x) > (e.w || 12) / 2 + 4 || b.y < e.y - (e.h || 16) || b.y > e.y + 2) continue; ctx.hurtEnemy(e, 80, b.x); b.dead = true; } }
    z.balls = z.balls.filter(b => !b.dead); if (!z.balls.length) { z.st = 'wait'; z.t = z.every || F3.every; }
  }
  /* ---------- THE LAID GUNS ---------- */
  function fireGun(gn) { if (gn.fired) return; const T = TS(); gn.fired = true; gn.smoke = 1.2; const sx = gn.x * T + 8, sy = gn.y * T + 4, tx = gn.tx * T + 8, ty = gn.ty * T + 8, d = Math.hypot(tx - sx, ty - sy) || 1;
    gn.ball = { x: sx, y: sy, tx, ty, vx: (tx - sx) / d * 420, vy: (ty - sy) / d * 420, left: d }; ctx.sound('boom'); ctx.shake(7); ctx.number(sx, sy - 18, F3_SAY.fired, '#ffd36b'); }
  function landGun(gn) { const T = TS(), L = ctx.L;
    if (gn.hole) { const [x0, x1, y0, y1] = gn.hole; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (L.grid[y * L.W + x] !== 0) { ctx.cellSet(x, y, 0); ctx.burst(x * T + 8, y * T + 8, 3, ['#6a5a44', '#c9b27c', '#3a2e22'], 140, 0.9, 260); }
      ctx.number((x0 + x1 + 1) / 2 * T, y0 * T - 12, F3_SAY.hole, '#8fd160'); }
    if (gn.bridge) { const [x0, x1, y] = gn.bridge; for (let x = x0; x <= x1; x++) if (L.grid[y * L.W + x] === 0) ctx.cellSet(x, y, ctx.T.ONEWAY); ctx.number((x0 + x1 + 1) / 2 * T, y * T - 14, F3_SAY.bridge, '#8fd160'); }
    ctx.resolve(); ctx.sound('crack'); ctx.shake(8); ctx.burst(gn.tx * T + 8, gn.ty * T + 8, 18, ['#ffd36b', '#9aa39a', '#e8dcc0'], 140, 0.7, 0); }
  function stepGuns(dt) { for (const gn of GUNS) { gn.smoke = Math.max(0, gn.smoke - dt); const b = gn.ball; if (!b) continue; const s = Math.hypot(b.vx, b.vy) * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.left -= s;
      if (b.left <= 0) { gn.ball = null; landGun(gn); } } }
  /* ---------- THE KEG ROLLER's keg ---------- */
  H.rollKeg = e => { if (!F()) return false; const P = hero(), dir = Math.sign(P.x - e.x) || e.face || 1; KEGS.push({ x: e.x + dir * 10, y: e.y, vx: dir * F3.kegV, vy: 0, fuse: F3.kegFuse, from: e, back: false });
    ctx.sound('fuse'); return true; };
  function stepKegs(dt) { const T = TS();
    for (const k of KEGS) { k.fuse -= dt; k.vy = Math.min(400, k.vy + 900 * dt); const nx = k.x + k.vx * dt, ny = k.y + k.vy * dt;
      if (ctx.isSolid(Math.floor(nx / T), Math.floor((k.y - 6) / T))) k.vx = 0; else k.x = nx;
      if (ctx.isSolid(Math.floor(k.x / T), Math.floor(ny / T)) || ctx.oneWay(Math.floor(k.x / T), Math.floor(ny / T)) && k.vy > 0 && Math.floor(k.y / T) < Math.floor(ny / T)) { k.y = Math.floor(ny / T) * T; k.vy = 0; } else k.y = ny;
      if (ctx.wet(k.x, k.y - 2)) { k.dead = true; ctx.burst(k.x, k.y, 10, ['#dff2f8', '#bfe6f5'], 90, 0.5, -80); continue; }
      if (k.back && k.from && k.from.alive && Math.abs(k.from.x - k.x) < 12 && Math.abs(k.from.y - k.y) < 20) k.fuse = 0;
      if (k.fuse <= 0) { k.dead = true; ctx.explode(k.x, k.y - 4, F3.kegR); } }
    KEGS = KEGS.filter(k => !k.dead); }
  /* ---------- A HERO'S BLOW: a keg struck back, a laid gun's breech, a boarder's line ---------- */
  H.strike = hb => { if (!F() || !hb) return; const P = hero(), T = TS(); P.hitSet = P.hitSet || new Set();
    for (const k of KEGS) { if (k.back || P.hitSet.has(k) || !ctx.overlap(hb, { l: k.x - 7, r: k.x + 7, t: k.y - 13, b: k.y })) continue; P.hitSet.add(k); k.back = true; k.vx = -Math.sign(k.vx || -(P.face || 1)) * F3.kegBackV; if (k.from && k.from.alive) k.vx = (Math.sign(k.from.x - k.x) || 1) * F3.kegBackV;
      ctx.sound('clank'); ctx.number(k.x, k.y - 22, F3_SAY.back, '#8fd160'); }
    for (const gn of GUNS) { if (gn.fired || P.hitSet.has(gn)) continue; const bx = { l: gn.x * T - 6, r: gn.x * T + 22, t: gn.y * T - 4, b: gn.y * T + 16 }; if (!ctx.overlap(hb, bx)) continue; P.hitSet.add(gn); fireGun(gn); }
    for (const e of ctx.enemies()) { if (e.t !== 'grapnel' || !e.alive || e.gmode !== 'swing' || !e.g3) continue; const L2 = lineOf(e); let cut = ctx.overlap(hb, { l: e.x - 8, r: e.x + 8, t: e.y - 24, b: e.y });
      if (!cut && L2) for (let i = 0; i <= 10; i++) { const x = L2[0] + (L2[2] - L2[0]) * i / 10, y = L2[1] + (L2[3] - L2[1]) * i / 10; if (x >= hb.l && x <= hb.r && y >= hb.t && y <= hb.b) { cut = true; break; } }
      if (cut) cutLine(e); } };
  /* ---------- THE GRAPNEL BOARDER ---------- */
  H.ownsFoe = e => e && e.t === 'grapnel';
  H.spawnFoe = (base, ent) => { const T = TS(); return { ...base, t: 'grapnel', w: 12, h: 22, hp: ctx.EHP.grapnel || F3.hp, maxHp: 0, face: ent.face || -1, gmode: 'wait', gT: 0, vx: 0, vy: 0, onGround: false,
    g3: { px: (ent.px ?? ent.x) * T + 8, py: (ent.py ?? ent.y - 8) * T, land: ent.land ? [ent.land[0] * T, ent.land[1] * T] : null, homeX: base.x, homeY: base.y } }; };
  const lineOf = e => (e.gmode === 'swing' && e.g3 ? [e.g3.px, e.g3.py, e.x, e.y - 18] : e.gmode === 'whirl' && e.g3 ? [e.g3.px, e.g3.py, e.x, e.y - 22] : null);
  function cutLine(e) { if (e.gmode !== 'swing') return; e.gmode = 'fall'; e.vy = -30; e.vx = (e.sw ? Math.sign(e.sw.x1 - e.sw.x0) : e.face) * 60; ctx.sound('snap'); ctx.number(e.x, e.y - 28, F3_SAY.cut, '#8fd160'); }
  H.takeFoe = (e, dmg, blow) => { if (e.gmode === 'swing' && blow) cutLine(e); return dmg; };
  H.updateFoe = (e, dt) => { const P = hero(), T = TS(); if (!e.alive || !P) return; e.gT -= dt; e.anim = (e.anim || 0) + dt * 8;
    const d = P.x - e.x, ad = Math.abs(d);
    switch (e.gmode) {
      case 'wait': { e.face = Math.sign(d) || e.face; const ok = !P.dead && ad < F3.sightX && ad > 30 && Math.abs(P.y - e.y) < F3.sightY;
        if (ok && !e.waitOnce) { e.gmode = 'whirl'; e.gT = F3.whirlT; ctx.number(e.x, e.y - e.h - 8, '!!', '#ff6b6b'); ctx.sound('whirl');
          if (!TOLD.board) { TOLD.board = 1; ctx.number(e.x, e.y - 40, F3_SAY.boarders, '#ffd36b'); }
          const lo = e.g3.land ? e.g3.land[0] : P.x - 60, hi = e.g3.land ? e.g3.land[1] : P.x + 60; const lx = Math.max(lo, Math.min(hi, P.x)); e.sw = { x0: e.x, y0: e.y, x1: lx, y1: groundAt(lx, Math.min(P.y, e.y)), t: 0 }; }
        fall(e, dt); return; }
      case 'whirl': if (e.sw) e.face = Math.sign(e.sw.x1 - e.x) || e.face; if (e.gT <= 0) { e.gmode = 'swing'; e.sw.t = 0; ctx.sound('swing'); } return;
      case 'swing': { const S = e.sw; S.t += dt; const u = Math.min(1, S.t / F3.swingT); e.x = S.x0 + (S.x1 - S.x0) * u; e.y = S.y0 + (S.y1 - S.y0) * u - F3.swingH * Math.sin(Math.PI * u);
        if (u >= 1) { e.x = S.x1; e.y = S.y1; e.gmode = 'landed'; e.gT = 0.35; e.waitOnce = true; ctx.burst(e.x, e.y, 10, ['#c9b27c', '#6a5a44'], 80, 0.5, -40);
          if (!P.dead && Math.abs(P.x - e.x) < F3.landR && Math.abs(P.y - e.y) < 20) ctx.damagePlayer(e.x, F3.landDmg, { unblockable: true, who: e, name: 'THE GRAPNEL BOARDER' }); } return; }
      case 'fall': { e.vy = Math.min(420, e.vy + 900 * dt); const nx = e.x + e.vx * dt, ny = e.y + e.vy * dt;
        if (ctx.wet(nx, ny - 4)) { ctx.burst(nx, ny, 14, ['#dff2f8', '#bfe6f5', '#7a8a3a'], 120, 0.6, -100); ctx.number(nx, ny - 20, F3_SAY.wet, '#bfe6f5'); e.x = nx; e.y = ny; ctx.hurtEnemy(e, 9999, e.x); return; }
        if (ctx.isSolid(Math.floor(nx / T), Math.floor(ny / T)) || (ctx.oneWay(Math.floor(nx / T), Math.floor(ny / T)) && Math.floor(e.y / T) < Math.floor(ny / T))) { e.y = Math.floor(ny / T) * T; e.x = nx; e.gmode = 'landed'; e.gT = 0.9; e.stagger = 0.9; e.waitOnce = true; return; }
        e.x = nx; e.y = ny; if (e.y > ctx.L.H * T) ctx.hurtEnemy(e, 9999, e.x); return; }
      case 'landed': fall(e, dt); if (e.gT <= 0) { e.gmode = 'fight'; e.gT = 0.3; } return;
      case 'fight': { fall(e, dt); if (e.stagger > 0) { e.stagger -= dt; return; } e.face = Math.sign(d) || e.face;
        if (!P.dead && ad < F3.cutReach + 6 && Math.abs(P.y - e.y) < 24 && e.gT <= 0) { e.gmode = 'cutTell'; e.gT = F3.cutTell; ctx.number(e.x, e.y - e.h - 8, '!', '#ffd36b'); return; }
        if (!P.dead && ad > F3.cutReach - 4 && ad < 260 && Math.abs(P.y - e.y) < 60) walk(e, Math.sign(d) * F3.walk, dt); return; }
      case 'cutTell': fall(e, dt); if (e.stagger > 0) { e.gmode = 'fight'; e.gT = 0.6; return; } if (e.gT <= 0) { e.gmode = 'cut'; e.gT = F3.cutT; ctx.sound('slash');
          if (!P.dead && Math.sign(d) === e.face && ad < F3.cutReach + 8 && Math.abs(P.y - e.y) < 24) { const r = ctx.damagePlayer(e.x, F3.dmg, { who: e, name: 'THE GRAPNEL BOARDER', blow: 'cut' }); if (r === 'blocked') { e.stagger = 1.0; ctx.number(e.x, e.y - e.h - 10, 'PARRIED', '#8fd160'); } } } return;
      case 'cut': fall(e, dt); if (e.gT <= 0) { e.gmode = 'fight'; e.gT = F3.cutRec; } return;
    } };
  /* the floor under a landing mark (a mark over a deck: the deck's height) */
  function groundAt(x, y0) { const T = TS(), tx = Math.floor(x / T); for (let ty = Math.floor((y0 - 80) / T); ty < ctx.L.H; ty++) if (ctx.isSolid(tx, ty) || ctx.oneWay(tx, ty)) return ty * T; return y0; }
  function fall(e, dt) { const T = TS(); e.vy = Math.min(420, (e.vy || 0) + 900 * dt); const r = ctx.moveBody(e, 0, e.vy * dt); if (r && r.ground) e.vy = 0; if (ctx.wet(e.x, e.y - 4)) ctx.hurtEnemy(e, 9999, e.x); }
  function walk(e, vx, dt) { const T = TS(), ax = e.x + Math.sign(vx) * 8, tx = Math.floor(ax / T), ty = Math.floor((e.y + 2) / T);
    if (!ctx.isSolid(tx, ty) && !ctx.oneWay(tx, ty)) return;   /* he will not walk off his deck */ ctx.moveBody(e, vx * dt, 0); }
  /* ---------- ONE FRAME ---------- */
  H.update = dt => { if (!F()) return; for (const z of Z) stepZone(z, dt); stepGuns(dt); stepKegs(dt); };
  /* ---------- DRAWING (GREYBOX: the ART sonnet dresses the hoists, the flagship, the swivel, the boarder) ---------- */
  const red = () => Z.some(z => z.st === 'tell' && !z.harmless) || Z.some(z => z.st === 'tell');
  H.drawBack = (g, cx, cy, time) => { if (!F()) return; const f = F(), VW = ctx.VW(), VH = ctx.VH();
    /* THE FLAGSHIP, the landmark: far off on the harbour, his black hull and red-and-gold stern, growing as you near her (review fix 8) */
    const P = hero(), k = Math.max(0, Math.min(1, (P ? P.x : 0) / ((f.flagX || 560) * TS()))), sc = 0.45 + 0.75 * k * k, hx = R(VW * (0.86 - 0.18 * k) - (cx * 0.02) % 40), hy = R(VH * 0.52 - 6 * k);
    g.globalAlpha = 0.5 + 0.3 * k; g.fillStyle = '#16121a'; g.fillRect(hx - R(60 * sc), hy, R(120 * sc), R(14 * sc)); g.fillStyle = '#6a1c1e'; g.fillRect(hx + R(40 * sc), hy - R(10 * sc), R(20 * sc), R(10 * sc));
    g.fillStyle = '#d8b04a'; for (let i = 0; i < 3; i++) g.fillRect(hx + R((42 + i * 6) * sc), hy - R(6 * sc), R(2 * sc) || 1, R(2 * sc) || 1);
    g.fillStyle = '#2a2230'; for (const m of [-30, 0, 30]) g.fillRect(hx + R(m * sc), hy - R(60 * sc), Math.max(1, R(2 * sc)), R(60 * sc));
    const rf = red(); g.fillStyle = rf ? (Math.floor(time * 6) % 2 ? '#ff3a2a' : '#ff9a7a') : '#e8dcc0'; g.fillRect(hx + R(1 * sc), hy - R(60 * sc), R(10 * sc) || 2, R(6 * sc) || 2);   /* his SIGNAL HOIST: red = his guns */
    g.globalAlpha = 1;
    /* the laid guns' targets, drawn first (A8): a dotted line from the breech to what it will take */
    const T = TS(); for (const gn of GUNS) { if (gn.fired) continue; const sx = gn.x * T + 8 - cx, sy = gn.y * T + 4 - cy, tx = gn.tx * T + 8 - cx, ty = gn.ty * T + 8 - cy, n = Math.max(1, R(Math.hypot(tx - sx, ty - sy) / 6));
      if (Math.max(sx, tx) < -20 || Math.min(sx, tx) > VW + 20) continue; g.globalAlpha = 0.55 + 0.25 * Math.sin(time * 4); g.fillStyle = '#ffd36b'; for (let i = 0; i <= n; i += 1) g.fillRect(R(sx + (tx - sx) * i / n), R(sy + (ty - sy) * i / n), 2, 2);
      g.strokeStyle = '#ffd36b'; g.strokeRect(R(tx) - 6, R(ty) - 6, 12, 12); g.globalAlpha = 1; } };
  H.drawOver = (g, cx, cy, time) => { if (!F()) return; const T = TS(), VW = ctx.VW();
    for (const e of (ctx.L.ents || [])) { if (e.t !== 'signalhoist') continue; const x = R(e.x * T + 8 - cx), y = R((e.y + 1) * T - cy); if (x < -30 || x > VW + 30) continue;
      const z = Z.find(q => q.id === e.zone), on = z && z.st === 'tell';
      g.fillStyle = '#3a2e22'; g.fillRect(x - 1, y - 64, 3, 64); g.fillStyle = '#5a4a34'; g.fillRect(x - 6, y - 64, 13, 2);
      for (let i = 0; i < 3; i++) { g.fillStyle = on ? (Math.floor(time * 8 + i) % 2 ? '#ff3a2a' : '#c9182a') : ['#e8dcc0', '#2a4a7a', '#e8dcc0'][i]; g.fillRect(x + 2, y - 62 + i * 8 + (on ? 0 : 0), on ? 12 : 8, 6); } }
    for (const z of Z) { if (z.st === 'tell') { const a = R(z.x0 * T - cx), b = R((z.x1 + 1) * T - cx), top = R(z.y0 * T - cy), bot = R((z.y1 + 1) * T - cy), k = 1 - z.t / F3.tell, pul = 0.35 + 0.35 * (0.5 + 0.5 * Math.sin(time * (6 + 16 * k)));
        g.globalAlpha = pul; g.fillStyle = z.harmless ? '#ffd36b' : '#ff4a3a'; for (let x = Math.max(a, -8); x < Math.min(b, VW + 8); x += 8) { g.fillRect(x, top, 5, 1); g.fillRect(x, bot - 1, 5, 1); }
        g.globalAlpha = 0.08 + 0.1 * k; g.fillRect(Math.max(a, 0), top, Math.min(b, VW) - Math.max(a, 0), bot - top); g.globalAlpha = 1;
        const ex = R((z.from > 0 ? z.x1 + 1 : z.x0) * T - cx); for (let i = 0; i < 3; i++) { g.fillStyle = Math.floor(time * 10 + i) % 2 ? '#ffd36b' : '#ff9a5c'; g.fillRect(ex - 4, top + 2 + i * R((bot - top) / 3), 4, 4); } }   /* her gunports glowing */
      for (const b of z.balls) { const x = R(b.x - cx), y = R(b.y - cy); g.fillStyle = '#1b1626'; g.fillRect(x - 3, y - 3, 6, 6); g.fillStyle = '#9aa39a'; g.fillRect(x + 3, y - 1, 6, 2); } }
    for (const gn of GUNS) { const x = R(gn.x * T - cx), y = R(gn.y * T - cy); if (x < -40 || x > VW + 40) continue;
      g.fillStyle = '#2a2b32'; g.fillRect(x, y + 6, 16, 6); g.fillStyle = '#4b4d5a'; const ang = Math.atan2(gn.ty - gn.y, gn.tx - gn.x); for (let i = 0; i < 12; i++) g.fillRect(R(x + 8 + Math.cos(ang) * i), R(y + 6 + Math.sin(ang) * i), 3, 3);
      g.fillStyle = gn.fired ? '#6a6a6a' : '#c9a44c'; g.fillRect(x + 2, y + 4, 4, 4); if (gn.smoke > 0) { g.globalAlpha = gn.smoke / 1.2 * 0.6; g.fillStyle = '#e8dcc0'; g.fillRect(x + 6, y - 6, 12, 8); g.globalAlpha = 1; }
      if (gn.ball) { g.fillStyle = '#1b1626'; g.fillRect(R(gn.ball.x - cx) - 3, R(gn.ball.y - cy) - 3, 6, 6); } }
    for (const k of KEGS) { const x = R(k.x - cx), y = R(k.y - cy); g.save(); g.translate(x, y - 6); g.rotate(k.x / 6); g.fillStyle = '#6a4a2a'; g.fillRect(-6, -6, 12, 12); g.fillStyle = '#3a3a40'; g.fillRect(-6, -2, 12, 2); g.restore();
      if (Math.floor(time * 16) % 2) { g.fillStyle = k.fuse < 0.8 ? '#ff6b6b' : '#ffd36b'; g.fillRect(x - 1, y - 15, 3, 3); } if (k.back) { g.fillStyle = '#8fd160'; g.fillRect(x - 6, y - 18, 12, 1); } } };
  H.drawFoe = (g, e, cx, cy, time) => { const x = R(e.x - cx), y = R(e.y - cy), f = e.face || 1, fl = (e.hurtT || 0) > 0;
    const L2 = lineOf(e); if (L2) { g.fillStyle = '#c9b27c'; const n = Math.max(1, R(Math.hypot(L2[2] - L2[0], L2[3] - L2[1]) / 2)); for (let i = 0; i <= n; i++) g.fillRect(R(L2[0] + (L2[2] - L2[0]) * i / n - cx), R(L2[1] + (L2[3] - L2[1]) * i / n - cy), 1, 1); }
    if (e.gmode === 'whirl' && e.sw) { g.globalAlpha = 0.5; g.fillStyle = '#ff6b6b'; g.fillRect(R(e.sw.x1 - cx) - F3.landR, R(e.sw.y1 - cy) - 2, F3.landR * 2, 2); g.globalAlpha = 1; }
    drawBoarder(g, x, y, f, e.gmode, time, fl); };
  return H;
}
/* THE GRAPNEL BOARDER, GREYBOX: a pirate in a striped jersey and a red head-scarf, a cutlass, a grapnel and its coil of line over the shoulder */
export function drawBoarder(g, x, y, f, mode, time, flash) {
  const c = flash ? { j: '#ffffff', j2: '#f0f0f0', s: '#ffffff', h: '#ffffff', b: '#e0e0e0' } : { j: '#e8dcc0', j2: '#2a4a7a', s: '#c9463d', h: '#d8a07a', b: '#2a2018' };
  const fr = (u, v, w, h, col) => { g.fillStyle = col; g.fillRect(f > 0 ? x + u : x - u - w, y - v - h, w, h); };
  const sw = mode === 'swing' || mode === 'fall', bob = mode === 'fight' ? R(Math.abs(Math.sin(time * 8))) : 0;
  fr(-4, 0, 3, sw ? 4 : 7, c.b); fr(1, 0, 3, sw ? 4 : 7, c.b);
  for (let i = 0; i < 4; i++) fr(-4, 7 + i * 2 + bob, 8, 1, c.j); for (let i = 0; i < 4; i++) fr(-4, 8 + i * 2 + bob, 8, 1, c.j2);
  fr(-3, 15 + bob, 6, 5, c.h); fr(-4, 19 + bob, 8, 3, c.s); fr(1, 17 + bob, 1, 1, '#1a1010');
  if (sw || mode === 'whirl') { fr(2, 14, 2, 8, c.h); fr(2, 22, 2, 2, '#4a4e58'); } else { fr(4, 10 + bob, 2, 3, c.h); fr(5, 12 + bob, mode === 'cut' ? 10 : 2, mode === 'cut' ? 1 : 8, '#dfe6ec'); }
  fr(-6, 9 + bob, 2, 6, '#c9b27c');
}
