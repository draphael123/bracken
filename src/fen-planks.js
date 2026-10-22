// src/fen-planks.js - LAY THE ROAD (claude/fenroad2; scratch/brief-fenroad2-1022.md LANE B, Daniel 10-22 approved the rec live: "it needs ANOTHER VERB").
// THE FEN ROAD's second verb. The goblins' WORK CREWS leave PLANK BUNDLES on the road (L.bundles: [col, row]); a bundle never runs out.
//   E (INTERACT) at a bundle TAKES A PLANK: carried on your shoulder (P.carry, src/throwables.js THROW_KIND.plank: SLOWER, NO ATTACK, no climbing).
//   E AT A BROKEN EDGE LAYS IT: stood at the near edge of a BROKEN stretch of the road (src/fen-road-hands.js slots: a peat hole, a crew's gap, or a bowed
//     section gone under), facing it - the plank goes down across it (a ghost plank over the gap says where, before you press). A LAID PLANK IS ROAD that
//     SAGS LIKE THE REST (a bowed section of its own: it creaks, bows, goes under if you stand on it too long, and floats back).
//   ATTACK THROWS IT (src/carry-throw.js's told arc: UP lobs, DOWN tosses short): a foe it meets STAGGERS (a small blow, tagged 'throw'); a STILT-WALKER
//     it meets loses his stilts (src/stilt-walker.js cutStilt: he topples). It lies where it lands on the boards (E takes it again); the fen keeps it.
//   E with a plank and no broken edge in front of you SETS IT DOWN. A blow on you, or the water, makes you drop it.
// PURE but for ctx (main.js builds it): L(), P(), keys(), enemies(), fen() (the road's hands: slotAhead, lay), solidPx(x, y, falling), number, text, burst, dust,
//   sfx, hint(msg), told() / tell(), hurtFoe(e, d, x), topple(e) -> bool
import * as CT from './carry-throw.js'; import * as FPA from './redraw/fen_planks_art.js';   /* (claude/fenroad2art) the bundle, the plank, the ghost */
export const PLANK = { reachX: 16, reachY: 18, dmg: 6, stagger: 0.9, col: '#e8c27a', len: 7, keep: 4, layT: 0.35, throwT: 0.25 };
export const PLANK_SAY = { take: 'A PLANK: E LAYS IT, ATTACK THROWS IT', laid: 'THE PLANK IS DOWN', dropped: 'A BLOW: YOU DROP THE PLANK', lost: 'THE FEN TAKES THE PLANK', down: 'YOU SET THE PLANK DOWN', stagger: 'THE PLANK STAGGERS IT' };
export const PLANK_HINT = 'E TAKES A PLANK. CARRIED, YOU ARE SLOW AND CANNOT SWING. E AT A BROKEN EDGE LAYS IT ACROSS; ATTACK THROWS IT - A STILT-WALKER LOSES HIS STILTS.';
/* THE HERO'S POSE HOOKS (the art lane draws them for every hero - src/main.js reads none yet): P.plankPose = 'carry' (the plank on his shoulder, both hands),
   'lay' (crouched, the plank going down in front: PLANK.layT s), 'throw' (the plank heaved two-handed overhead: PLANK.throwT s) */
export const PLANK_POSES = ['carry', 'lay', 'throw'];
CT.addKind('plank', { aims: { low: { vx: 100, vy: -100 }, mid: { vx: 175, vy: -170 }, high: { vx: 120, vy: -280 } }, g: 640, r: 4, ring: 11, dots: 14 });

export function makeFenPlanks(ctx) {
  let bundles = [], items = [], arc = null, near = null, ahead = null;
  const W = { n: { taken: 0, laid: 0, thrown: 0, foeHits: 0, toppled: 0, dropped: 0, lost: 0, setDown: 0 } };
  const TS = 16, R = Math.round;
  const held = P => (P && P.carry && P.carry.t === 'fplank' ? P.carry : null);
  const handAt = P => ({ x: P.x + (P.face || 1) * 4, y: P.y - 20 });
  const boxOf = e => ({ l: e.x - (e.w || 14) / 2 - 3, r: e.x + (e.w || 14) / 2 + 3, t: e.y - (e.h || 26) - 3, b: e.y + 3 });
  const inBox = (e, x, y) => { const b = boxOf(e); return x > b.l && x < b.r && y > b.t && y < b.b; };
  const foes = () => ctx.enemies().filter(e => e.alive && !e.harmless && !e.boss && !(e.t === 'leech' && e.mode === 'lurk'));
  const target = (x, y) => { for (const f of foes()) if (inBox(f, x, y)) return f; return null; };
  const arcFor = (P, aim) => { const h = handAt(P), a = CT.KINDS.plank.aims[aim], v = { vx: (P.face || 1) * a.vx, vy: a.vy };
    return CT.predictArc('plank', h.x, h.y, v, ctx.solidPx, { stopAt: (x, y) => target(x, y) }); };
  W.on = () => bundles.length > 0;
  W.reset = () => { const L = ctx.L(); items = []; arc = null; near = null; ahead = null; bundles = ((L && L.bundles) || []).map(([x, row]) => ({ x: x * TS + 8, y: (row + 1) * TS })); };
  W.held = () => !!held(ctx.P());
  W.bundles = () => bundles.map(b => ({ x: b.x, y: b.y }));
  const reachable = P => { if (!P || P.dead || P.carry || !P.ground) return null;
    const b = bundles.find(c => Math.abs(P.x - c.x) < PLANK.reachX && Math.abs(P.y - c.y) < PLANK.reachY); if (b) return b;
    return items.find(q => q.state === 'rest' && Math.abs(P.x - q.x) < PLANK.reachX + 6 && Math.abs(P.y - q.y) < PLANK.reachY) || null; };
  W.canTake = () => !!reachable(ctx.P());
  /* E: lay it (a broken edge in front of you), set it down, or take one */
  W.interact = P => {
    if (!W.on() || !P || P.dead) return false;
    const h = held(P);
    if (h) { const F = ctx.fen(), slot = F && F.slotAhead ? F.slotAhead(P) : null;
      if (slot && F.lay(slot)) { P.carry = null; h.state = 'gone'; W.n.laid++; P.plankPose = 'lay'; P.plankPoseT = PLANK.layT; ctx.sfx.stone ? ctx.sfx.stone() : ctx.sfx.thud && ctx.sfx.thud(); ctx.number(P.x, P.y - 34, PLANK_SAY.laid, PLANK.col); return true; }
      if (!P.ground) return false;
      P.carry = null; h.state = 'rest'; h.x = P.x + (P.face || 1) * 10; h.y = P.y; h.restT = 0; W.n.setDown++; ctx.dust(h.x, h.y, 3); return true; }
    const c = reachable(P); if (!c) return false;
    if (c.state === 'rest') { c.state = 'gone'; }
    W.n.taken++;
    const q = { t: 'fplank', thrKind: 'plank', noClimb: true, state: 'held', holder: P, x: P.x, y: P.y - 20, vx: 0, vy: 0, hurtWas: P.hurt > 0, launch: PP => CT.launchOf('plank', PP, ctx.keys ? ctx.keys() : {}) };
    items.push(q); P.carry = q; P.plankPose = 'carry'; ctx.sfx.clank ? ctx.sfx.clank() : null;
    ctx.number(P.x, P.y - 34, PLANK_SAY.take, PLANK.col);
    if (!ctx.told()) { ctx.tell(); ctx.hint(PLANK_HINT); }
    return true; };
  const lose = (q, x, y) => { q.state = 'gone'; W.n.lost++; ctx.burst(x, y, 8, ['#9fb3a6', '#e6efe6', '#8a6a40'], 70, 0.5); ctx.sfx.splash ? ctx.sfx.splash() : null; };
  const inWater = (x, y) => { const L = ctx.L(); return (L.pools || []).some(p => x > p.x0 && x < p.x1 && y > p.y + 2 && (p.bottom === undefined || y < p.bottom + 16)); };
  W.update = dt => {
    const P = ctx.P();
    if (P && P.plankPoseT > 0) { P.plankPoseT -= dt; if (P.plankPoseT <= 0) P.plankPose = held(P) ? 'carry' : null; }
    for (const q of items) {
      if (q.state === 'held') { const H = q.holder;
        if (!H || H.dead || H.carry !== q) { if (H && H.carry === q) H.carry = null; if (H && !H.dead && q.state === 'held') { /* (the carry went on a throw: main.js throwCarry set it flying) */ } if (q.state === 'held') q.state = 'gone'; if (H && H.plankPose === 'carry') H.plankPose = null; continue; }
        const h = handAt(H); q.x = h.x; q.y = h.y; H.plankPose = H.plankPoseT > 0 ? H.plankPose : 'carry';
        /* A BLOW, or THE WATER, and it goes */
        if ((H.hurt > 0 && !q.hurtWas) || H.swim) { H.carry = null; H.plankPose = null; W.n.dropped++;
          if (H.swim || !H.ground) lose(q, H.x, H.y); else { q.state = 'rest'; q.x = H.x - (H.face || 1) * 8; q.y = H.y; q.restT = 0; ctx.number(H.x, H.y - 34, PLANK_SAY.dropped, '#ff9a5c'); }
          continue; }
        q.hurtWas = H.hurt > 0; continue; }
      if (q.state === 'fly') { if (!q.counted) { q.counted = true; W.n.thrown++; if (q.holder) { q.holder.plankPose = 'throw'; q.holder.plankPoseT = PLANK.throwT; } } q.holder = null;
        q.spin = (q.spin || 0) + dt * 14 * Math.sign(q.vx || 1);
        const k = CT.KINDS.plank, px = q.x, py = q.y; CT.stepArc(q, dt, k.g);
        const e = target(q.x, q.y);
        if (e) { W.n.foeHits++; const top = e.t === 'stiltwalker' && ctx.topple(e); if (top) W.n.toppled++; else { ctx.hurtFoe(e, PLANK.dmg, q.x, PLANK.stagger); if (e.alive) ctx.number(e.x, e.y - (e.h || 20) - 8, PLANK_SAY.stagger, '#ffd36b'); }
          ctx.burst(q.x, q.y, 10, ['#c9b27c', '#8a6a40', '#e8c27a'], 90, 0.5); q.state = 'rest'; q.vx = -Math.sign(q.vx || 1) * 30; q.vy = -80; q.bounce = true; continue; }
        if (inWater(q.x, q.y)) { lose(q, q.x, q.y); continue; }
        if (ctx.solidPx(q.x + Math.sign(q.vx) * k.r, py, false) && !ctx.solidPx(px, py, false)) { q.vx = 0; q.x = px; }
        if (q.vy < 0 && ctx.solidPx(q.x, q.y - k.r, false)) q.vy = 0;
        if (q.vy >= 0 && ctx.solidPx(q.x, q.y + k.r, true)) { q.state = 'rest'; q.y = Math.floor((q.y + k.r) / TS) * TS; q.restT = 0; ctx.sfx.stone ? ctx.sfx.stone() : null; ctx.dust(q.x, q.y, 3); continue; }
        if (q.y > ctx.L().H * TS) q.state = 'gone';
        continue; }
      if (q.state === 'rest') { q.restT = (q.restT || 0) + dt;
        if (q.bounce) { q.vy += 640 * dt; q.x += q.vx * dt; q.y += q.vy * dt; if (inWater(q.x, q.y)) { lose(q, q.x, q.y); continue; } if (q.vy > 0 && ctx.solidPx(q.x, q.y + 2, true)) { q.bounce = false; q.y = Math.floor((q.y + 2) / TS) * TS; } }
        else if (!ctx.solidPx(q.x, q.y + 2, true)) { q.vy = 0; q.bounce = true; }   /* the board it lay on went under */
      }
    }
    items = items.filter(q => q.state !== 'gone');
    { const rest = items.filter(q => q.state === 'rest'); if (rest.length > PLANK.keep) { rest[0].state = 'gone'; items = items.filter(q => q.state !== 'gone'); } }
    near = reachable(P);
    const F = ctx.fen(); ahead = held(P) && !P.dead && F && F.slotAhead ? F.slotAhead(P) : null;
    arc = held(P) && !P.dead && !ahead ? arcFor(P, CT.aimOf('plank', P.face || 1, ctx.keys ? ctx.keys() : {}).aim) : null;
  };
  W.read = () => ({ bundles: W.bundles(), held: W.held(), ahead: ahead ? { id: ahead.id, x0: ahead.x0, x1: ahead.x1, row: ahead.row } : null, resting: items.filter(q => q.state === 'rest').map(q => ({ x: q.x, y: q.y })), flying: items.filter(q => q.state === 'fly').length, n: { ...W.n } });
  /* ---------- DRAWING (GREYBOX: the art lane draws the bundle, the plank and the hero's carry/lay/throw poses) ---------- */
  const plankAt = (g, x, y, len, ang, alpha = 1) => { g.save(); g.globalAlpha = alpha; g.translate(R(x), R(y)); g.rotate(ang); const w = len * 8;
    g.fillStyle = '#3e2c1c'; g.fillRect(-w - 1, -3, w * 2 + 2, 5); g.fillStyle = '#a07a48'; g.fillRect(-w, -2, w * 2, 3); g.fillStyle = '#c99a5a'; g.fillRect(-w, -2, w * 2, 1);
    g.fillStyle = '#6a4a2a'; for (let k = -w + 6; k < w; k += 11) g.fillRect(k, -1, 3, 1); g.restore(); };
  W.draw = (g, cx, cy, time) => {
    if (!W.on()) return; const rc = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
    /* THE BUNDLES (claude/fenroad2art): the stack on its sawhorses, roped, a glint sweeping it */
    for (const b of bundles) { const x = R(b.x - cx), y = R(b.y - cy); if (x < -60 || x > 2000) continue; FPA.drawBundle(g, x, y, time, b.x); }
    for (const q of items) { const x = q.x - cx, y = q.y - cy;
      if (q.state === 'held') continue;   /* a carried plank is drawn with the hero's arms (drawHeld, src/redraw/hero_plank_poses.js) */
      else if (q.state === 'fly') FPA.drawPlank(g, x, y, q.spin || 0, 1);
      else if (q.state === 'rest') { FPA.drawPlank(g, x, y - 3, 0, 1); if (!held(ctx.P())) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 5 + q.x); rc(x - 15, y - 8, 30, 1, '#fff6d8'); g.globalAlpha = 1; } } }
    const P = ctx.P();
    if (near && ctx.text) ctx.text('E: A PLANK', R(near.x - cx), R(near.y - cy) - 30, PLANK.col, 'center');
    /* WHERE IT WILL GO DOWN: a ghost plank across the broken stretch in front of you, and the word */
    if (ahead && P) { const x0 = ahead.x0 * TS - cx, x1 = (ahead.x1 + 1) * TS - cx, y = ahead.row * TS - cy + 2; g.globalAlpha = 0.45 + 0.25 * Math.sin(time * 6);
      g.globalAlpha = 1; FPA.drawGhost(g, x0, x1, y - 1, time); if (ctx.text) ctx.text('E: LAY IT', R((x0 + x1) / 2), R(y - 22), PLANK.col, 'center'); }
    if (arc) CT.drawArc(g, arc, cx, cy, time, arc.land && arc.land.hit ? '#8fd160' : '#c8ccd4');
  };
  return W;
}
