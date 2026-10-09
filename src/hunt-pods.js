// src/hunt-pods.js - THE SPORE POD (claude/rootway2, Daniel 2026-10-09, scratch/brief-rootway2.md: "a throw springs them" + "when your ARROW / thrown thing
// hits him he STAGGERS LONGER"). Sporewood's fungus, carried up the climb: a POD CAP (L.podCaps) holds one ripe spore pod. E takes it, ATTACK throws it in
// src/carry-throw.js's told arc (UP lobs, DOWN tosses short; the arc you are shown is the arc it flies, its ring gold when it will hit him or a trap).
//   - where it lands it BURSTS (a puff of spores) and every set JAW TRAP within reach snaps shut on nothing (src/snares.js spring)
//   - on THE HUNTMASTER it is his long STAGGER (src/huntmaster.js podHit): he drops off his perch, gold OPEN, the first blows land
//   - on any other foe it is a small blow (the room's: tagged 'throw')
//   - a blow on you drops it; E with one in hand sets it down (gone); the cap grows another in POD.regrow s
// PURE but for ctx (main.js builds it): L(), P(), keys(), boss() (the Huntmaster while his fight runs), enemies(), solidPx(x, y, falling), number, text, burst,
//   sfx, hint(msg), told() / tell(), onBoss(e, x) -> result, hurtFoe(e, d, x), spring(x, y) -> n traps, traps() -> [{ x, y, state }]
import * as CT from './carry-throw.js';
export const POD = { reachX: 14, reachY: 16, regrow: 4, dmg: 4, col: '#c8f08a', pad: 4 };
CT.addKind('pod', { aims: { low: { vx: 110, vy: -120 }, mid: { vx: 170, vy: -200 }, high: { vx: 110, vy: -320 } }, g: 620, r: 3, ring: 10, dots: 14 });

export function makeHuntPods(ctx) {
  let caps = [], items = [], arc = null, near = null;
  const W = { n: { taken: 0, thrown: 0, bossHits: 0, foeHits: 0, sprung: 0, dropped: 0 } };
  const TS = 16, R = Math.round;
  const held = P => (P && P.carry && P.carry.t === 'pod' ? P.carry : null);
  const handAt = P => ({ x: P.x + (P.face || 1) * 6, y: P.y - 18 });
  const boxOf = e => ({ l: e.x - (e.w || 14) / 2 - POD.pad, r: e.x + (e.w || 14) / 2 + POD.pad, t: e.y - (e.h || 26) - POD.pad, b: e.y + POD.pad });
  const inBox = (e, x, y) => { const b = boxOf(e); return x > b.l && x < b.r && y > b.t && y < b.b; };
  const foes = () => ctx.enemies().filter(e => e.alive && !e.harmless && e.t !== 'huntmaster');
  const target = (x, y) => { const e = ctx.boss(); if (e && e.alive && inBox(e, x, y)) return e; for (const f of foes()) if (inBox(f, x, y)) return f; return null; };
  const arcFor = (P, aim) => { const h = handAt(P), a = CT.KINDS.pod.aims[aim], v = { vx: (P.face || 1) * a.vx, vy: a.vy };
    return CT.predictArc('pod', h.x, h.y, v, ctx.solidPx, { stopAt: (x, y) => target(x, y) }); };
  const trapNear = land => land && ctx.traps().some(j => (j.state === 'set' || j.state === 'arming') && Math.abs(j.x - land.x) < 18 && Math.abs(j.y - land.y) < 20);
  W.on = () => caps.length > 0;
  W.reset = () => { const L = ctx.L(); items = []; arc = null; near = null; caps = ((L && L.podCaps) || []).map(([x, row]) => ({ x: x * TS + 8, y: row * TS, ripe: true, t: 0 })); };
  W.held = () => !!held(ctx.P());
  W.caps = () => caps.map(c => ({ x: c.x, y: c.y, ripe: c.ripe }));
  const reachable = P => { if (!P || P.dead || P.carry) return null; return caps.find(c => c.ripe && Math.abs(P.x - c.x) < POD.reachX && Math.abs(P.y - c.y) < POD.reachY) || null; };
  W.canTake = () => !!reachable(ctx.P());
  /* THE AIM THAT HITS HIM from where you stand (a player reads the same ring): 'mid' | 'high' | 'low' | null */
  W.aimAt = () => { const P = ctx.P(), e = ctx.boss(); if (!held(P) || !e) return null; for (const aim of ['mid', 'high', 'low']) { const r = arcFor(P, aim); if (r.land && r.land.hit === e) return aim; } return null; };
  W.interact = P => {
    if (!W.on() || !P || P.dead) return false;
    const h = held(P); if (h) { P.carry = null; h.state = 'gone'; W.n.dropped++; ctx.burst(P.x + (P.face || 1) * 6, P.y - 4, 5, ['#8ac050', '#c8f08a'], 40, 0.4); return true; }
    const c = reachable(P); if (!c) return false;
    c.ripe = false; c.t = POD.regrow; W.n.taken++;
    const q = { t: 'pod', thrKind: 'pod', state: 'held', holder: P, x: P.x, y: P.y - 18, vx: 0, vy: 0, hurtWas: P.hurt > 0, launch: PP => CT.launchOf('pod', PP, ctx.keys ? ctx.keys() : {}) };
    items.push(q); P.carry = q; ctx.sfx.pickup ? ctx.sfx.pickup() : ctx.sfx.clank && ctx.sfx.clank();
    ctx.number(P.x, P.y - 34, 'A SPORE POD: ATTACK THROWS IT', POD.col);
    if (!ctx.told()) { ctx.tell(); ctx.hint('E TAKES A SPORE POD. ATTACK THROWS IT - UP LOBS, DOWN TOSSES SHORT. IT SPRINGS A JAW TRAP; ON THE HUNTMASTER IT STAGGERS HIM.'); }
    return true; };
  const burstAt = (x, y) => { ctx.burst(x, y - 4, 10, ['#8ac050', '#c8f08a', '#e8ffd0'], 70, 0.6); ctx.sfx.puff ? ctx.sfx.puff() : null; const k = ctx.spring(x, y); W.n.sprung += k; };
  W.update = dt => {
    const P = ctx.P();
    for (const c of caps) if (!c.ripe) { c.t -= dt; if (c.t <= 0) c.ripe = true; }
    for (const q of items) {
      if (q.state === 'held') { const H = q.holder;
        if (!H || H.dead || H.carry !== q) { if (H && H.carry === q) H.carry = null; q.state = 'gone'; continue; }
        const h = handAt(H); q.x = h.x; q.y = h.y;
        if (H.hurt > 0 && !q.hurtWas) { H.carry = null; q.state = 'gone'; W.n.dropped++; ctx.number(H.x, H.y - 34, 'A BLOW: YOU DROP THE POD', '#ff9a5c'); ctx.burst(H.x, H.y - 6, 6, ['#8ac050', '#c8f08a'], 50, 0.5); continue; }
        q.hurtWas = H.hurt > 0; continue; }
      if (q.state === 'fly') { if (!q.counted) { q.counted = true; W.n.thrown++; } q.holder = null;
        const k = CT.KINDS.pod, px = q.x, py = q.y; CT.stepArc(q, dt, k.g);
        const e = target(q.x, q.y);
        if (e) { q.state = 'gone'; burstAt(q.x, q.y);
          if (e === ctx.boss()) { W.n.bossHits++; ctx.onBoss(e, q.x); } else { W.n.foeHits++; ctx.hurtFoe(e, POD.dmg, q.x); } continue; }
        if (ctx.solidPx(q.x + Math.sign(q.vx) * k.r, py, false) && !ctx.solidPx(px, py, false)) { q.state = 'gone'; burstAt(px, py); continue; }
        if (q.vy < 0 && ctx.solidPx(q.x, q.y - k.r, false)) q.vy = 0;
        if (q.vy >= 0 && ctx.solidPx(q.x, q.y + k.r, true)) { q.state = 'gone'; burstAt(q.x, Math.floor((q.y + k.r) / TS) * TS); continue; }
        if (q.t0 === undefined) q.t0 = 0; q.t0 += dt; if (q.t0 > 4) q.state = 'gone'; continue; }
    }
    items = items.filter(q => q.state !== 'gone');
    near = reachable(P);
    arc = held(P) && !P.dead ? arcFor(P, CT.aimOf('pod', P.face || 1, ctx.keys ? ctx.keys() : {}).aim) : null;
  };
  W.read = () => ({ caps: W.caps(), held: W.held(), flying: items.filter(q => q.state === 'fly').length, n: { ...W.n } });
  /* THE READ: a pod cap with its ripe pod (a pale-green glow that breathes), E: A POD over the one in reach, the pod in hand and its told arc */
  W.draw = (g, cx, cy, time) => {
    if (!W.on()) return; const R2 = R;
    for (const c of caps) { const x = R2(c.x - cx), y = R2(c.y - cy); if (x < -30 || x > 2000) continue;
      g.fillStyle = '#4a3a50'; g.fillRect(x - 1, y - 7, 3, 7); g.fillStyle = '#8a5a7a'; g.fillRect(x - 6, y - 10, 13, 3); g.fillStyle = '#c88ab0'; g.fillRect(x - 5, y - 11, 11, 1);
      if (c.ripe) { const p = 0.5 + 0.5 * Math.sin(time * 4 + c.x * 0.1); g.globalAlpha = 0.3 + 0.3 * p; g.fillStyle = POD.col; g.fillRect(x - 5, y - 19, 11, 9); g.globalAlpha = 1;
        g.fillStyle = '#5a8a3a'; g.fillRect(x - 3, y - 17, 7, 6); g.fillStyle = '#c8f08a'; g.fillRect(x - 2, y - 17, 3, 2); g.fillStyle = '#34562a'; g.fillRect(x - 3, y - 12, 7, 1); }
      else { const k = 1 - Math.max(0, c.t) / POD.regrow; g.fillStyle = '#5a8a3a'; g.fillRect(x - 1, y - 11 - R2(4 * k), 3, R2(4 * k) + 1); } }
    if (near && ctx.text) ctx.text('E: A POD', R2(near.x - cx), R2(near.y - cy) - 26, POD.col, 'center');
    for (const q of items) { const x = R2(q.x - cx), y = R2(q.y - cy); g.fillStyle = '#34562a'; g.fillRect(x - 3, y - 3, 7, 6); g.fillStyle = '#8ac050'; g.fillRect(x - 2, y - 2, 5, 4); g.fillStyle = '#e8ffd0'; g.fillRect(x - 1, y - 2, 2, 1); }
    if (arc) CT.drawArc(g, arc, cx, cy, time, arc.land && (arc.land.hit || trapNear(arc.land)) ? '#ffd36b' : '#c8ccd4');
  };
  return W;
}
