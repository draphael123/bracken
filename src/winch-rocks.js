// src/winch-rocks.js - THE ORE ROCK (claude/winch5; Daniel 2026-10-08, scratch/brief-winchmaster5.md item 1, approved). THE WINCHMASTER
// packs ORE ARMOUR round himself (src/winchmaster.js, round seven); a blade on it only chips. What breaks it is a ROCK off one of his own
// loaded skips, THROWN: E takes one from a skip you ride (or stand beside, level with it, at a line's end), ATTACK throws it in
// src/carry-throw.js's told arc (UP lobs, DOWN tosses short; the arc you are shown is the arc it flies, and its ring closes on him when it
// will hit him). It shatters his plates (winchRock) and he is knocked down onto his ledge, STAGGERED. So the rides matter: the rocks are
// on the skips.
//   - while he is plated, every skip that has a rock to give is HIGHLIGHTED (a gold ring on its ore) and the one in reach says E: A ROCK
//     (the sign at the point of use); the first time one is in reach the hint says the whole rule once (PROG flag)
//   - one rock a skip a lap (it comes back reloaded out of its station house); a skip stays LOADED (an emptied drum skip would ride high
//     enough to put a jump onto a housing - main.js updateBucket)
//   - a blow on you drops it; E with one in hand sets it down (it is gone - fetch another); it never weighs you off a ladder
// Only on the Winchmaster's arena, only while he is up and on his drums (phases one and two). PURE but for ctx (main.js builds it).
import * as CT from './carry-throw.js';
export const ROCK = { reachX: 10, reachY: 14, pad: 4, col: '#ffd36b' };
CT.addKind('orerock', { aims: { low: { vx: 115, vy: -170 }, mid: { vx: 150, vy: -265 }, high: { vx: 95, vy: -340 } }, g: 640, r: 3, ring: 10, dots: 14 });

export function makeWinchRocks(ctx) {
  /* ctx: on(), P(), keys(), boss() (the Winchmaster while his fight runs, else null), armoured(e), movers(), lines(), solidPx(x, y, falling),
     number(x, y, txt, col), hint(msg), told() / tell() (the one-time hint flag), sfx, burst(x, y, n, cols, v, life), onHit(e, x) -> result */
  let items = [], taken = new WeakSet(), arc = null, near = null, lastHit = null;
  const W = { n: { taken: 0, thrown: 0, shatter: 0, warded: 0, hit: 0, dropped: 0 } };
  const live = () => { const e = ctx.boss(); return e && e.alive && e.phase !== 3 ? e : null; };
  const held = P => (P && P.carry && P.carry.t === 'orerock' ? P.carry : null);
  const handAt = P => ({ x: P.x + (P.face || 1) * 6, y: P.y - 18 });
  const isDrum = m => { const ln = ctx.lines()[m.line]; return !!(ln && ln.drum); };
  /* A SKIP WITH A ROCK TO GIVE: on one of his lines, out of its station house, loaded, sound, not falling, not yet robbed this lap */
  const giving = m => m && m.kind === 'bucket' && m.vis && m.ore && !m.cracked && !(m.fallen > 0) && !taken.has(m) && isDrum(m);
  const inReach = (P, m) => P.onMover === m || (Math.abs(P.x - (m.x + m.w / 2)) < m.w / 2 + ROCK.reachX && Math.abs(P.y - m.y) < ROCK.reachY);
  const reachable = P => { if (!P || P.dead || !live() || held(P) || P.carry) return null; return ctx.movers().find(m => giving(m) && inReach(P, m)) || null; };
  const boxOf = e => ({ l: e.x - (e.w || 30) / 2 - ROCK.pad, r: e.x + (e.w || 30) / 2 + ROCK.pad, t: e.y - (e.h || 46) - ROCK.pad, b: e.y + ROCK.pad });
  const inBox = (e, x, y) => { const b = boxOf(e); return x > b.l && x < b.r && y > b.t && y < b.b; };
  const arcFor = (P, aim) => { const e = live(), h = handAt(P), a = CT.KINDS.orerock.aims[aim], v = { vx: (P.face || 1) * a.vx, vy: a.vy };
    return CT.predictArc('orerock', h.x, h.y, v, ctx.solidPx, { stopAt: (x, y) => (e && inBox(e, x, y) ? e : null) }); };
  const newRock = P => ({ t: 'orerock', thrKind: 'orerock', state: 'held', holder: P, x: P.x, y: P.y - 18, vx: 0, vy: 0, hurtWas: P.hurt > 0,
    launch: PP => CT.launchOf('orerock', PP, ctx.keys ? ctx.keys() : {}) });
  W.on = () => !!ctx.on();
  W.reset = () => { items = []; taken = new WeakSet(); arc = null; near = null; lastHit = null; for (const k of Object.keys(W.n)) W.n[k] = 0; };
  W.held = () => !!held(ctx.P());
  W.canTake = () => !!reachable(ctx.P());
  W.lastHit = () => lastHit;
  /* THE AIM THAT HITS HIM from where you stand (the bot's eyes on the told arc - a player reads the same ring): 'mid' | 'high' | 'low' | null */
  W.aimAt = () => { const P = ctx.P(), e = live(); if (!held(P) || !e) return null;
    for (const aim of ['mid', 'high', 'low']) { const r = arcFor(P, aim); if (r.land && r.land.hit === e) return aim; } return null; };
  /* E: take a rock off the skip in reach - or, with one in hand, set it down (gone) */
  W.interact = P => {
    if (!W.on() || !P || P.dead) return false;
    const h = held(P); if (h) { P.carry = null; h.state = 'gone'; W.n.dropped++; ctx.burst(P.x + (P.face || 1) * 6, P.y - 4, 5, ['#7a6a50', '#b09a5a'], 40, 0.4); return true; }
    const m = reachable(P); if (!m) return false;
    taken.add(m); const q = newRock(P); items.push(q); P.carry = q; W.n.taken++;
    if (ctx.sfx.stone) ctx.sfx.stone(); else if (ctx.sfx.clank) ctx.sfx.clank();
    ctx.number(P.x, P.y - 34, 'A ROCK: ATTACK THROWS IT', ROCK.col); return true; };
  W.update = dt => {
    const P = ctx.P();
    for (const q of items) {
      if (q.state === 'held') { const H = q.holder;
        if (!H || H.dead || H.carry !== q) { if (H && H.carry === q) H.carry = null; q.state = 'gone'; continue; }
        if (!live()) { H.carry = null; q.state = 'gone'; continue; }   /* (he is down off his drums, or dead: the rock has no work - your hands are your own again) */
        const h = handAt(H); q.x = h.x; q.y = h.y;
        if (H.hurt > 0 && !q.hurtWas) { H.carry = null; q.state = 'gone'; W.n.dropped++; ctx.number(H.x, H.y - 34, 'A BLOW: YOU DROP THE ROCK', '#ff9a5c'); ctx.burst(H.x, H.y - 6, 6, ['#7a6a50', '#b09a5a'], 50, 0.5); continue; }
        q.hurtWas = H.hurt > 0; continue; }
      if (q.state === 'fly') { if (!q.counted) { q.counted = true; W.n.thrown++; } q.holder = null;
        const k = CT.KINDS.orerock, px = q.x, py = q.y; CT.stepArc(q, dt, k.g);
        const e = live() || ctx.boss();
        if (e && e.alive && inBox(e, q.x, q.y)) { q.state = 'gone'; const r = ctx.onHit(e, q.x); lastHit = r; if (W.n[r] !== undefined) W.n[r]++; continue; }
        if (ctx.solidPx(q.x + Math.sign(q.vx) * k.r, py, false) && !ctx.solidPx(px, py, false)) { q.state = 'gone'; ctx.burst(px, py, 6, ['#7a6a50', '#b09a5a', '#3a3440'], 60, 0.5); if (ctx.sfx.stone) ctx.sfx.stone(); continue; }
        if (q.vy < 0 && ctx.solidPx(q.x, q.y - k.r, false)) q.vy = 0;
        if (q.vy >= 0 && ctx.solidPx(q.x, q.y + k.r, true)) { q.state = 'gone'; ctx.burst(q.x, q.y, 6, ['#7a6a50', '#b09a5a', '#3a3440'], 60, 0.5); if (ctx.sfx.stone) ctx.sfx.stone(); continue; }
        if (q.t0 === undefined) q.t0 = 0; q.t0 += dt; if (q.t0 > 4) q.state = 'gone'; continue; }
    }
    items = items.filter(q => q.state !== 'gone');
    /* a skip back out of its station house has a rock to give again (it comes back reloaded) */
    for (const m of ctx.movers()) if (m.kind === 'bucket' && !m.vis && taken.has(m)) taken.delete(m);
    near = reachable(P);
    if (near && !ctx.told()) { ctx.tell(); ctx.hint('E TAKES A ROCK FROM HIS SKIP. ATTACK THROWS IT - UP LOBS, DOWN TOSSES SHORT. A ROCK SHATTERS HIS ORE ARMOUR.'); }
    arc = held(P) && !P.dead ? arcFor(P, CT.aimOf('orerock', P.face || 1, ctx.keys ? ctx.keys() : {}).aim) : null;
  };
  /* THE READ: the rock-bearing skips highlighted while he is plated, E: A ROCK over the one in reach, the rock in your hand and its told
     arc (its ring gold when it will hit him), and a rock in the air */
  W.draw = (g, cx, cy, time) => {
    if (!W.on()) return; const P = ctx.P(), e = live(), R = Math.round;
    if (e && ctx.armoured(e) && !held(P)) for (const m of ctx.movers()) { if (!giving(m)) continue; const x = R(m.x + m.w / 2 - cx), y = R(m.y - cy) - 4; if (x < -40 || x > ctx.VW() + 40) continue;
      const p = 0.5 + 0.5 * Math.sin(time * 6 + m.x * 0.05); g.save(); g.globalAlpha = 0.45 + 0.4 * p; g.strokeStyle = ROCK.col; g.lineWidth = 1; g.beginPath(); g.ellipse(x + 0.5, y + 0.5, 9 + p * 2, 5 + p, 0, 0, Math.PI * 2); g.stroke(); g.restore();
      g.fillStyle = '#2a2430'; g.fillRect(x - 3, y - 3, 7, 6); g.fillStyle = '#9a8a60'; g.fillRect(x - 2, y - 2, 5, 4); g.fillStyle = '#ffd36b'; g.fillRect(x, y - 2, 1, 1); }
    if (near && e && ctx.armoured(e) && ctx.text) ctx.text('E: A ROCK', R(near.x + near.w / 2 - cx), R(near.y - cy) - 22, ROCK.col, 'center');
    for (const q of items) { const x = R(q.x - cx), y = R(q.y - cy);
      g.fillStyle = '#2a2430'; g.fillRect(x - 4, y - 4, 8, 7); g.fillStyle = '#7a6a50'; g.fillRect(x - 3, y - 3, 6, 5); g.fillStyle = '#b09a5a'; g.fillRect(x - 3, y - 3, 6, 1); g.fillStyle = '#ffd36b'; g.fillRect(x + 1, y - 1, 1, 1); }
    if (arc) CT.drawArc(g, arc, cx, cy, time, arc.land && arc.land.hit ? '#ffd36b' : '#c8ccd4');
  };
  return W;
}
