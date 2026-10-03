// src/venom-hud.js - THE VENOM ICON (claude/welltown-polish; Daniel 10-02): while a hero is poisoned, green drops sit under the stamina bar, one per STACK.
// THE CISTERN QUEEN's venom (src/cistern-queen-hands.js: P.cqVenom, a clock per stack, three at most) slows the stamina's regen by 25% a stack, so the stack count
// is the number that matters; a drop EMPTIES as its stack runs out (a full drop = a fresh stack, six seconds), the unlit slots stay dark so the cap reads, and the
// slowdown is written beside them ("-50%"). Any other poison (the gas, the green water, the husks: P.venomT, a tick of damage) shows as ONE drop that drains with it.
// Pure: no DOM, no main.js. main.js calls venomIcon(P) for what to draw and drawVenomIcon(g, text, x, y, v, time) to draw it; asserted by tools/cistern-queen.mjs (the stacks, the slot cap, the clean hero).

export const VENOM_HUD = { max: 3, stackT: 6, plainT: 2.4, drop: { w: 7, h: 7 }, gap: 8 };

/* the drops to show for a hero: null when clean. { stacks: n, drops: [fill 0..1 ...], slots, slow } */
export function venomIcon(P, CQV) {
  if (!P) return null;
  const stk = P.cqVenom && P.cqVenom.length ? P.cqVenom.slice().sort((a, b) => b - a).slice(0, VENOM_HUD.max) : [];
  if (stk.length) { const T = (CQV && CQV.t) || VENOM_HUD.stackT, slow = Math.round(100 * (1 - (P.venomSlow == null ? 1 : P.venomSlow)));
    return { stacks: stk.length, drops: stk.map(t => Math.max(0.12, Math.min(1, t / T))), slots: (CQV && CQV.max) || VENOM_HUD.max, slow, mode: 'stack' }; }
  if (P.venomT > 0) return { stacks: 1, drops: [Math.max(0.12, Math.min(1, P.venomT / VENOM_HUD.plainT))], slots: 1, slow: 0, mode: 'plain' };
  return null;
}

/* one drop, 7 x 7: the shape as rows of 0 (air) / 1 (outline) / 2 (body); `fill` of it (from the bottom) is lit */
const SHAPE = ['0001000', '0012100', '0122210', '0122210', '1222221', '1222221', '0111110'].map(r => r.split('').map(Number));
const COL = { out: '#10190a', dim: '#27341d', lit: '#8fe04a', litHi: '#d6f8a0', litLo: '#4f9a24', glow: '#b8f070' };
export function drawVenomIcon(g, textFn, x, y, v, time) {
  if (!v) return;
  const { w, h } = VENOM_HUD.drop, pulse = 0.5 + 0.5 * Math.sin(time * 6);
  for (let i = 0; i < v.slots; i++) {
    const dx = x + i * VENOM_HUD.gap, fill = v.drops[i] || 0, lit = Math.round(fill * (h - 1)) + (fill > 0 ? 1 : 0);   /* rows lit, from the bottom */
    for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) { const s = SHAPE[r][c]; if (!s) continue;
      const on = fill > 0 && r >= h - lit;
      g.fillStyle = s === 1 ? COL.out : on ? (c <= 2 && r >= 2 && r <= 4 ? COL.litHi : (c >= 4 || r >= 5) ? COL.litLo : COL.lit) : COL.dim; g.fillRect(dx + c, y + r, 1, 1); }
    if (fill > 0 && i === v.stacks - 1) { g.fillStyle = COL.glow; g.globalAlpha = 0.25 + 0.5 * pulse; g.fillRect(dx + 3, y - 1, 1, 1); g.globalAlpha = 1; } }
  if (v.slow > 0) textFn('-' + v.slow + '%', x + v.slots * VENOM_HUD.gap + 1, y, COL.lit, 'left', 6);
  else if (v.mode === 'plain') textFn('POISON', x + VENOM_HUD.gap + 1, y, COL.lit, 'left', 6);
}
