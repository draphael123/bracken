// src/flotilla2.js - THE FLOTILLA 2's own pieces (claude/flotilla2, the OPUS greybox; scratch/brief-flotilla2.md A1-A2). The level is theFlotilla() in src/level.js;
// this is what moves in it and how it is drawn until the art pass (GREYBOX shapes - the art lane replaces drawBench / drawYard / drawRower):
//   THE ROWING BENCHES (THE GALLEY HULL): L.moversExtra { flot: 'bench', bench: id, vert, rise, period, phase } - a bench on its frame rides from its low row up `rise`
//     and back with the oars. A PRESSED FISHERMAN rows it (L.flot2.rowers { bench, x, freed }): STRIKE HIS CHAIN and he lets go - THE BENCH STOPS WHERE IT IS (it holds
//     that height for the rest of the life; a death puts every man back at his oar). The rule's state is drawn: the rower pulling, the chain to his ankle, the bench's
//     frame and its stroke marks; freed, he stands and the chain lies broken.
//   THE YARDS (THE RIGGING RUN): { flot: 'yard', span, period, phase } - a yard on its stays rides out from its mast and back as the hulls rock apart and together
//     (x from x0 to x0 + span); its two lines are drawn up to the stay over it.
//   THE ROUND SHOT AND THE KEG (L.flot2.ballKegs): a deck gun's ball that meets a keg on the deck blows it (src/main.js updateBalls calls ballKeg) - how a crate hatch is
//     blown from across the deck.
// main.js calls: on, clear, strike(hb), stepMover(m, time, oldY), drawMover(g, m, cx, cy, time), drawBack(g, cx, cy, time), drawDoor / drawGun (src/flotilla2-art.js draws them all).
import { makeFlotilla2Art } from './flotilla2-art.js';
const R = Math.round;
export function makeFlotilla2(ctx) {
  const H = {}; let freed = new Set();
  const F = () => (ctx.L && ctx.L.flot2) || null;
  H.on = () => !!F();
  H.clear = () => { freed = new Set(); const f = F(); if (f) for (const r of f.rowers) r.freed = false; };
  H.isFreed = id => freed.has(id);
  /* the bench a rower rows, among the live movers */
  const benchOf = id => ctx.movers().find(m => m.flot === 'bench' && m.bench === id);
  /* A BLOW ON A ROWER'S CHAIN: he lets go, and his bench stops where it is */
  H.strike = hb => { const f = F(); if (!f || !hb) return; const P = ctx.hero();
    for (const r of f.rowers) { if (r.freed) continue; const m = benchOf(r.bench); if (!m) continue;
      const box = { l: r.x - 8, r: r.x + 8, t: m.y - 20, b: m.y + 4 };
      if (!ctx.overlap(hb, box) || (P.hitSet && P.hitSet.has(r))) continue; if (P.hitSet) P.hitSet.add(r);
      r.freed = true; freed.add(r.bench); m.halted = true; m.dy = 0; ctx.sfx.clank && ctx.sfx.clank();
      ctx.sparks(r.x, m.y - 6, P.face || 1, 6); ctx.number(r.x, m.y - 30, 'FREE: HIS BENCH STOPS', '#8fd160');
      if (!f.toldFree) { f.toldFree = true; ctx.hint('THE BENCH HOLDS WHERE IT WAS WHEN HE LET GO. STOP ONE HIGH, AND IT IS A STEP.'); }
      if (f.rowers.every(q => q.freed)) ctx.number(r.x, m.y - 46, 'EVERY OAR IS DOWN: THE FISHERFOLK ARE FREE', '#ffd36b'); } };
  /* ONE STEP OF A FLOTILLA MOVER: true when it was ours */
  H.stepMover = (m, time, oldY) => {
    if (m.flot === 'bench') { if (m.halted || freed.has(m.bench)) { m.halted = true; m.dy = 0; return true; }
      const ph = (time / m.period + (m.phase || 0)) % 1, k = ph < 0.5 ? ph * 2 : 2 - ph * 2, e = k * k * (3 - 2 * k);
      m.y = m.y0 - m.rise * e; m.dy = m.y - oldY; return true; }
    if (m.flot === 'yard') { const oldX = m.x, u = 0.5 - 0.5 * Math.cos(2 * Math.PI * (time / m.period + (m.phase || 0)));
      m.x = m.x0 + m.span * u; m.dx = m.x - oldX; m.dy = 0; return true; }
    return false; };
  /* ---------- DRAWING (the art pass: src/flotilla2-art.js) ---------- */
  const ART = makeFlotilla2Art(ctx);
  H.drawMover = (g, m, cx, cy, time) => {
    if (m.flot === 'bench') { const r = (F() && F().rowers.find(q => q.bench === m.bench)) || null; ART.bench(g, m, cx, cy, time, r, r ? r.freed : false); return true; }
    if (m.flot === 'yard') { ART.yard(g, m, cx, cy, time); return true; }
    return false; };
  H.drawBack = (g, cx, cy, time) => { if (F()) ART.back(g, cx, cy, time); };   /* the static rigging, the copper, the hatch, the magazine: behind the bodies */
  H.drawDoor = (g, pr, cx, cy, time) => ART.door(g, pr, cx, cy, time);
  H.drawGun = (g, pr, cx, cy, time) => ART.gun(g, pr, cx, cy, time);
  return H;
}
