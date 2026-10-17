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
// main.js calls: on, clear, strike(hb), stepMover(m, time, oldY), drawMover(g, m, cx, cy, time), drawWorld(g, cx, cy, time).
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
  /* ---------- DRAWING (GREYBOX) ---------- */
  H.drawMover = (g, m, cx, cy, time) => {
    const x = R(m.x - cx), y = R(m.y - cy);
    if (m.flot === 'bench') {
      /* the frame it rides in (two uprights down to the bilge), the bench, its oar loom, and the stroke marks (the low and high of its ride) */
      const lowY = R(m.y0 - cy), hiY = R(m.y0 - m.rise - cy);
      g.fillStyle = '#4a3a28'; g.fillRect(x + 2, hiY - 2, 3, lowY - hiY + 30); g.fillRect(x + m.w - 5, hiY - 2, 3, lowY - hiY + 30);
      g.fillStyle = '#8a7454'; g.fillRect(x + 1, lowY + 3, 5, 1); g.fillRect(x + m.w - 6, lowY + 3, 5, 1); g.fillRect(x + 1, hiY + 3, 5, 1); g.fillRect(x + m.w - 6, hiY + 3, 5, 1);
      g.fillStyle = '#6a5034'; g.fillRect(x, y, m.w, 6); g.fillStyle = '#9a7c54'; g.fillRect(x, y, m.w, 2); g.fillStyle = '#3a2a1a'; g.fillRect(x, y + 6, m.w, 2);
      const r = (F() && F().rowers.find(q => q.bench === m.bench)) || null;
      if (r) drawRower(g, R(r.x - cx), y, r.freed, time + m.phase * 3);
      else { g.fillStyle = '#5a4a34'; g.fillRect(x + 6, y - 8, m.w - 12, 2); }   /* an empty bench: the oar shipped */
      return true; }
    if (m.flot === 'yard') {
      /* the yard (a spar, tapered), its two lines up to the stay, and the footrope under it */
      g.strokeStyle = '#c9b27c'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 4.5, y); g.lineTo(x + m.w / 2 + 0.5, y - 64); g.lineTo(x + m.w - 3.5, y); g.stroke();
      g.fillStyle = '#5a4630'; g.fillRect(x, y, m.w, 5); g.fillStyle = '#8a6e4a'; g.fillRect(x + 1, y, m.w - 2, 2); g.fillStyle = '#3a2c1c'; g.fillRect(x - 2, y + 1, 2, 3); g.fillRect(x + m.w, y + 1, 2, 3);
      g.strokeStyle = 'rgba(201,178,124,0.6)'; g.beginPath(); g.moveTo(x + 0.5, y + 6.5); g.quadraticCurveTo(x + m.w / 2, y + 11, x + m.w - 0.5, y + 6.5); g.stroke();
      return true; }
    return false; };
  /* a pressed fisherman at his oar: pulling (a rocking lean), the chain from his ankle to the bench's ring; freed, he stands, the chain broken */
  function drawRower(g, x, y, free, t) {
    const lean = free ? 0 : R(Math.sin(t * 2.4) * 3);
    g.fillStyle = '#2a2a30'; g.fillRect(x - 3, y - 4, 6, 4);   /* legs */
    g.fillStyle = free ? '#7a8a9a' : '#5a6a7a'; g.fillRect(x - 3 + lean, y - (free ? 14 : 11), 6, free ? 10 : 7);   /* jerkin */
    g.fillStyle = '#d8b090'; g.fillRect(x - 2 + lean, y - (free ? 18 : 15), 4, 4);   /* head */
    g.fillStyle = '#c9b27c'; g.fillRect(x - 3 + lean, y - (free ? 19 : 16), 6, 1);   /* a fisher's cap */
    if (!free) { g.strokeStyle = '#8a6e4a'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + lean + 2, y - 9); g.lineTo(x + lean + 16, y - 2 + lean); g.stroke(); g.lineWidth = 1;   /* the oar's loom */
      g.fillStyle = '#9aa0a8'; for (let i = 0; i < 4; i++) g.fillRect(x + 3 + i * 2, y - 1 + (i % 2), 1, 1); }   /* the chain */
    else { g.fillStyle = '#9aa0a8'; g.fillRect(x + 4, y - 1, 1, 1); g.fillRect(x + 8, y, 1, 1); g.fillStyle = '#8fd160'; g.fillRect(x - 1, y - 24, 2, 2); } }
  return H;
}
