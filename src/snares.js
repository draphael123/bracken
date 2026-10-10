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
  /* THE READ: open jaws with a winking red glint (set), a dull pair (arming, sprung); a coiled net in the branches, its shadow and its drop */
  S.draw = (g, cx, cy, time) => {
    for (const j of S.jaws) { const x = R(j.x - cx), y = R(j.y - cy); if (x < -20 || x > 2000) continue;
      g.fillStyle = '#2a2224'; g.fillRect(x - 6, y - 1, 12, 1);   /* the chain plate */
      if (j.state === 'set' || j.state === 'arming') { const a = j.state === 'arming' ? 0.55 : 1; g.globalAlpha = a;
        g.fillStyle = '#5a5258'; g.fillRect(x - 7, y - 3, 3, 2); g.fillRect(x + 4, y - 3, 3, 2); g.fillStyle = '#9a929c'; for (let k = -6; k <= 5; k += 2) g.fillRect(x + k, y - 4 - (k === -6 || k === 4 ? 1 : 0), 1, 2);
        g.fillStyle = '#c8ccd4'; g.fillRect(x - 6, y - 5, 1, 1); g.fillRect(x + 5, y - 5, 1, 1); g.globalAlpha = 1;
        if (j.state === 'set' && Math.floor(time * 4 + j.x) % 3 === 0) { g.fillStyle = '#ff6b6b'; g.fillRect(x - 1, y - 6, 2, 2); } }
      else { g.fillStyle = '#5a5258'; g.fillRect(x - 3, y - 6, 6, 5); g.fillStyle = '#9a929c'; g.fillRect(x - 3, y - 6, 6, 1); }
    }
    for (const n of S.nets) { const x = R(n.x - cx), y = R(n.y - cy), top = R(n.top - cy), hw = R(n.w / 2); if (x < -60 || x > 2000) continue;
      if (n.state === 'hang' || n.state === 'tell') { const sh = n.state === 'tell' ? (Math.floor(time * 16) % 2 ? 1 : 0) : 0;
        g.strokeStyle = '#8a7a5a'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, top - 40); g.lineTo(x, top); g.stroke();
        g.fillStyle = '#6a5a3a'; g.fillRect(x - 9 + sh, top, 18, 7); g.fillStyle = '#c9b27c'; for (let k = -8; k < 9; k += 3) g.fillRect(x + k + sh, top + 1 + (k & 1), 1, 5);
        if (n.state === 'tell') { g.globalAlpha = 0.25 + 0.3 * (1 - n.t / NET.tell); g.fillStyle = '#1a1210'; g.fillRect(x - hw, y - 2, hw * 2, 2); g.globalAlpha = 1; g.fillStyle = '#ff6b6b'; if (sh) g.fillRect(x - hw, y - 3, hw * 2, 1); } }
      else { const k = n.state === 'fall' ? 1 - n.t / NET.fall : 1, ny = R(top + (y - top) * k);
        g.strokeStyle = '#c9b27c'; g.globalAlpha = 0.85; for (let i = -hw; i <= hw; i += 5) { g.beginPath(); g.moveTo(x + i, ny - 22); g.lineTo(x + i + 3, ny); g.stroke(); } for (let r = ny - 20; r <= ny; r += 5) { g.beginPath(); g.moveTo(x - hw, r); g.lineTo(x + hw, r); g.stroke(); } g.globalAlpha = 1; }
    }
  };
  return S;
}
