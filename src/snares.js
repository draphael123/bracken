// src/snares.js - THE GOBLINS' SNARES (claude/rootway2, Daniel 2026-10-09, scratch/brief-rootway2.md A4 + B2): the hunters' two traps, one module for the
// level (THE CANOPY SNARES, where they are TAUGHT) and for THE HUNTMASTER (who sets them in his stand). PURE but for ctx (main.js builds it).
//   A JAW TRAP lies open on a floor: told (open iron jaws, a red glint that winks, a '!' the first time you are near), it SNAPS on a hero who steps in it -
//     a bite (JAW.dmg, no shield turns it) and the hero is held (P.snare, main.js snareTick: mash to struggle free). JUMP OVER IT, or SPRING IT: a THROWN
//     thing (a spore pod, src/hunt-pods.js) that lands within JAW.springR of it snaps it shut on nothing. A sprung level trap is set again after JAW.reset s;
//     one the Huntmaster sets is spent once sprung (or after JAW.life s).
//   A NET hangs coiled in the branches over a stretch of bough (L.nets): when a hero passes under it, it creaks (the tell: a shadow on the bough and a red !!
//     over it, NET.tell s) and drops over NET.w px - ROLL THROUGH IT (the dodge's own frames) or step back out from under; caught, you are held (NET.hold)
//     and the bows have you. It is hauled back up after NET.reset s.
// The Huntmaster's thrown net (src/huntmaster.js) is his own projectile; what it does to a hero it catches is NET.hold, the same rule.
// ctx: L(), TS, players(), asPlayer(p, fn), damage(x, d, o) -> 'hit' | 'blocked' | false, number(x, y, txt, col), burst(...), sfx, time()
// Every capital line goes through ctx.number with a line listed in src/hint-lines.js.
export const JAW = { dmg: 10, hold: 0.9, w: 10, springR: 18, arm: 0.6, reset: 6, life: 16 };
export const NET = { tell: 0.55, w: 44, dmg: 3, hold: 1.2, reset: 5, under: 30, fall: 0.18 };

export function makeSnares(ctx) {
  const S = { jaws: [], nets: [], said: new Set(), n: { snapped: 0, sprung: 0, netted: 0, rolled: 0, set: 0 } };
  const TS = ctx.TS, R = Math.round;
  const once = k => { if (S.said.has(k)) return false; S.said.add(k); return true; };
  /* the level's own (L.jaws: [x, row] where row is the floor's top row - the trap lies on it; L.nets: { x0, x1, row (the bough's top), top (the coil's row) }) */
  S.reset = () => { const L = ctx.L(); S.jaws = []; S.nets = []; S.said = S.said || new Set();
    if (!L) return;
    for (const [x, row] of (L.jaws || [])) S.jaws.push({ x: x * TS + 8, y: row * TS, state: 'set', armT: 0, t: 0, lvl: true });
    for (const n of (L.nets || [])) S.nets.push({ x: (n.x0 + n.x1 + 1) * TS / 2, y: n.row * TS, top: n.top * TS, state: 'hang', t: 0, w: Math.max(NET.w, (n.x1 - n.x0 + 1) * TS) }); };
  S.on = () => S.jaws.length > 0 || S.nets.length > 0;
  /* THE HUNTMASTER SETS ONE (B2): it arms after JAW.arm s - you see it land and open */
  S.place = (x, y) => { S.jaws.push({ x, y, state: 'arming', armT: JAW.arm, t: JAW.life, lvl: false, boss: true }); S.n.set++; };
  S.clearBoss = () => { S.jaws = S.jaws.filter(j => !j.boss); };
  /* A THROWN THING LANDS (or flies low through): every set trap within reach of it snaps on nothing */
  S.spring = (x, y, r) => { let k = 0; for (const j of S.jaws) if ((j.state === 'set' || j.state === 'arming') && Math.abs(j.x - x) < (r || JAW.springR) && Math.abs(j.y - y) < 20) { shut(j); k++; S.n.sprung++; }
    if (k) ctx.number(x, y - 24, 'THE TRAP SNAPS ON NOTHING', '#8fd160'); return k; };
  const shut = j => { j.state = 'sprung'; j.armT = j.lvl ? JAW.reset : 0; ctx.sfx.clank && ctx.sfx.clank(); ctx.burst(j.x, j.y - 3, 6, ['#8a8490', '#c8ccd4', '#5a3c26'], 50, 0.4); };
  S.update = dt => {
    const ps = ctx.players().filter(p => !p.dead);
    for (const j of S.jaws) {
      if (j.boss) { j.t -= dt; if (j.t <= 0 && j.state !== 'gone') j.state = 'gone'; }
      if (j.state === 'arming') { j.armT -= dt; if (j.armT <= 0) j.state = 'set'; continue; }
      if (j.state === 'sprung') { if (j.lvl) { j.armT -= dt; if (j.armT <= 0 && !ps.some(p => Math.abs(p.x - j.x) < 24 && Math.abs(p.y - j.y) < 20)) j.state = 'set'; } else j.state = 'gone'; continue; }
      if (j.state !== 'set') continue;
      for (const p of ps) { if (Math.abs(p.x - j.x) > 7 || Math.abs(p.y - j.y) > 3 || !p.ground) { if (Math.abs(p.x - j.x) < 60 && Math.abs(p.y - j.y) < 30 && once('jawSeen' + (j.lvl ? 'L' : 'B'))) ctx.number(j.x, j.y - 22, 'A JAW TRAP: JUMP IT, OR THROW SOMETHING ON IT', '#ff6b6b'); continue; }
        shut(j); S.n.snapped++;
        ctx.asPlayer(p, () => { const res = ctx.damage(j.x, JAW.dmg, { name: 'THE JAW TRAP', unblockable: true, noKnock: true }); if (res === 'hit') { p.snare = Math.max(p.snare || 0, JAW.hold); p.vx = 0; ctx.number(p.x, p.y - 30, 'THE TRAP HAS YOU: STRUGGLE', '#ff6b6b'); } });
        break; }
    }
    S.jaws = S.jaws.filter(j => j.state !== 'gone');
    for (const n of S.nets) {
      if (n.state === 'hang') { if (ps.some(p => Math.abs(p.x - n.x) < NET.under && p.y <= n.y + 2 && p.y > n.top)) { n.state = 'tell'; n.t = NET.tell; ctx.sfx.creak ? ctx.sfx.creak() : ctx.sfx.tell && ctx.sfx.tell(true); ctx.number(n.x, n.y - 44, '!!', '#ff6b6b'); if (once('netSeen')) ctx.number(n.x, n.y - 30, 'A NET: ROLL THROUGH IT', '#ff6b6b'); } continue; }
      if (n.state === 'tell') { n.t -= dt; if (n.t <= 0) { n.state = 'fall'; n.t = NET.fall; } continue; }
      if (n.state === 'fall') { n.t -= dt; if (n.t > 0) continue; n.state = 'down'; n.t = NET.reset; ctx.sfx.thud && ctx.sfx.thud();
        for (const p of ps) { if (Math.abs(p.x - n.x) > n.w / 2 || p.y > n.y + 4 || p.y < n.y - 40) continue;
          ctx.asPlayer(p, () => { const res = ctx.damage(n.x, NET.dmg, { name: 'THE NET', unblockable: true, noKnock: true });
            if (res === 'hit') { S.n.netted++; p.snare = Math.max(p.snare || 0, NET.hold); p.vx = 0; ctx.number(p.x, p.y - 30, 'NETTED', '#c9b27c'); } else { S.n.rolled++; ctx.number(p.x, p.y - 30, 'THROUGH THE NET', '#8fd160'); } }); }
        continue; }
      if (n.state === 'down') { n.t -= dt; if (n.t <= 0 && !ps.some(p => Math.abs(p.x - n.x) < n.w / 2 + 8 && Math.abs(p.y - n.y) < 30)) n.state = 'hang'; }
    }
  };
  S.read = () => ({ jaws: S.jaws.map(j => ({ x: j.x, y: j.y, state: j.state, boss: !!j.boss })), nets: S.nets.map(n => ({ x: n.x, y: n.y, w: n.w, state: n.state, t: n.t })), n: { ...S.n } });
  /* THE READ (the art pass, claude/rootway2art): a JAW TRAP is iron - a plate and a pin and a chain to a peg, two toothed jaws that stand open (set: the trigger plate pale, a red glint winking in the
     teeth), lie half-raised and dull (arming: a puff of dust under them), or are shut on nothing (sprung: a spark). A NET is a rolled coil of cord and bone weights hung in the bough over the way (the
     bough creaks and its shadow is a DITHERED decal on the floor when it tells), then a real net - a lattice, knots at the crossings, weights on the hem - falls and lies over the ground. */
  const JAWP = { open: [[-7, -2], [-8, -5], [-8, -8], [-7, -11], [-5, -13]], half: [[-7, -2], [-7, -4], [-6, -6], [-4, -7], [-2, -8]], shut: [[-7, -2], [-6, -4], [-5, -6], [-3, -7], [-1, -8]] };
  S.draw = (g, cx, cy, time) => {
    const rc = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
    const jaws = (x, y, pose, dull) => { const pts = JAWP[pose];
      for (const s of [-1, 1]) for (let i = 0; i < pts.length - 1; i++) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1], n = Math.max(Math.abs(bx - ax), Math.abs(by - ay)) || 1;
        for (let k = 0; k <= n; k++) { const px = x + s * Math.round(ax + (bx - ax) * k / n) - (s > 0 ? 1 : 0), py = y + Math.round(ay + (by - ay) * k / n); rc(px, py, 2, 2, dull ? '#6a646c' : '#8a8490'); rc(px + (s > 0 ? 1 : 0), py, 1, 1, dull ? '#8a8490' : '#c8ccd4'); } }
      for (const s of [-1, 1]) for (let i = 1; i < pts.length; i++) { const [ax, ay] = pts[i], tx = x + s * ax + (s > 0 ? 1 : -1); rc(tx, y + ay + 1, 1, 2, dull ? '#a8a8b0' : '#f0f0f8'); }   /* the teeth, pointing in */ };
    for (const j of S.jaws) { const x = R(j.x - cx), y = R(j.y - cy); if (x < -24 || x > 2000) continue;
      rc(x - 8, y - 2, 17, 2, '#2a2224'); rc(x - 8, y - 2, 17, 1, '#5a5258'); rc(x - 6, y - 1, 1, 1, '#c8ccd4'); rc(x + 6, y - 1, 1, 1, '#c8ccd4');   /* the plate and its rivets */
      rc(x + 9, y - 1, 3, 1, '#3a2a22'); rc(x + 12, y - 4, 2, 4, '#5a3c26'); rc(x + 12, y - 4, 1, 4, '#8a6a48');   /* the chain to its peg */
      if (j.state === 'set' || j.state === 'arming') { const arming = j.state === 'arming'; jaws(x, y, arming ? 'half' : 'open', arming);
        rc(x - 2, y - 3, 5, 1, arming ? '#8a7a5a' : '#e8c878');   /* the trigger plate, pale */
        if (arming) { g.globalAlpha = 0.6; rc(x - 10, y - 1, 3, 1, '#c9b27c'); rc(x + 8, y - 2, 2, 1, '#c9b27c'); g.globalAlpha = 1; }
        else if (Math.floor(time * 4 + j.x) % 3 === 0) { rc(x - 1, y - 9, 2, 2, '#ff6b6b'); rc(x - 1, y - 10, 2, 1, '#ffb0a0'); } }
      else { jaws(x, y, 'shut', true); if (j.lvl && j.armT > JAW.reset - 0.25) { rc(x - 1, y - 11, 1, 1, '#ffffff'); rc(x + 2, y - 10, 1, 1, '#ffe8a0'); rc(x - 4, y - 10, 1, 1, '#ffffff'); } }
    }
    for (const n of S.nets) { const x = R(n.x - cx), y = R(n.y - cy), top = R(n.top - cy), hw = R(n.w / 2); if (x < -60 || x > 2000) continue;
      const knot = (kx, ky) => { rc(kx, ky, 1, 1, '#f0e0b0'); };
      if (n.state === 'hang' || n.state === 'tell') { const tell = n.state === 'tell', sh = tell ? (Math.floor(time * 16) % 2 ? 1 : 0) : 0, sw = tell ? 0 : Math.round(Math.sin(time * 1.2 + n.x) * 0.6);
        rc(x + sw, top - 40, 1, 40, '#8a7a5a');   /* the rope up into the bough */
        rc(x - 10 + sh + sw, top, 21, 8, '#5a4a30'); rc(x - 10 + sh + sw, top, 21, 1, '#8a7a5a'); rc(x - 10 + sh + sw, top + 7, 21, 1, '#33281a');   /* the coil: cord wound on itself */
        for (let k = -9; k < 10; k += 3) { rc(x + k + sh + sw, top + 1, 1, 6, '#c9b27c'); rc(x + k + 1 + sh + sw, top + 2 + (k & 1), 1, 3, '#e8dcc0'); }
        rc(x - 11 + sh + sw, top + 5, 2, 4, '#e8dcc0'); rc(x + 10 + sh + sw, top + 5, 2, 4, '#e8dcc0'); rc(x - 11 + sh + sw, top + 5, 1, 1, '#fff6e0'); rc(x + 10 + sh + sw, top + 5, 1, 1, '#fff6e0');   /* the bone weights hung off its ends */
        if (tell) { const k = 1 - n.t / NET.tell, rows = k > 0.5 ? 3 : 2; g.globalAlpha = 0.55 + 0.3 * k; for (let r2 = 0; r2 < rows; r2++) for (let xx = -hw; xx < hw; xx++) if (((xx + r2) & 1) === 0) rc(x + xx, y - 1 - r2, 1, 1, '#1a1210');   /* the creak's shadow: a dithered decal on the ground, deepening */
          g.globalAlpha = 1; if (Math.floor(time * 12) % 2) { rc(x - hw, y - 1, 2, 1, '#e8685a'); rc(x + hw - 2, y - 1, 2, 1, '#e8685a'); } } }
      else { const k = n.state === 'fall' ? 1 - n.t / NET.fall : 1, ny = R(top + (y - top) * k), open = n.state === 'fall';
        if (open) { /* in the air: a spread lattice, the hem weighted, the cord it falls on streaming up */
          g.globalAlpha = 0.95; for (let i = -hw; i <= hw; i += 5) rc(x + i, ny - 20, 1, 20, '#c9b27c'); for (let r2 = ny - 20; r2 <= ny; r2 += 5) rc(x - hw, r2, hw * 2 + 1, 1, '#c9b27c'); for (let i = -hw; i <= hw; i += 5) for (let r2 = ny - 20; r2 <= ny; r2 += 5) knot(x + i, r2); g.globalAlpha = 1;
          for (let i = -hw; i <= hw; i += 11) rc(x + i - 1, ny, 3, 3, '#e8dcc0'); }
        else { /* lying over the ground: a low heap of mesh, its hem weights out at the edges */
          g.globalAlpha = 0.9; for (let r2 = 0; r2 < 3; r2++) { const yy = y - 1 - r2 * 2, w2 = hw - r2 * 4; for (let i = -w2; i <= w2; i += 1) if (((i + r2 * 2) % 4 + 4) % 4 !== 3) rc(x + i, yy, 1, 1, '#c9b27c'); }
          for (let i = -hw + 2; i <= hw - 2; i += 6) knot(x + i, y - 3); g.globalAlpha = 1;
          rc(x - hw - 1, y - 3, 3, 3, '#e8dcc0'); rc(x + hw - 1, y - 3, 3, 3, '#e8dcc0'); rc(x - hw - 1, y - 3, 1, 1, '#fff6e0'); rc(x + hw - 1, y - 3, 1, 1, '#fff6e0'); } }
    }
  };
  return S;
}
