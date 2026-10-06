// src/death-card.js - THE DEATH SCREEN (claude/uiscreens, 2026-10-06). It was one 6 px line on a dimmed frame ("<FOE>  <blow>  RED: DODGE IT"). Now a card:
//   YOU FELL / who did it (the bestiary name) / the blow's name / THE TELL YOU MISSED (the mark that came first, and what answers it) / what the death cost.
// Then, for a few seconds after the respawn, a one-line recap sits under the timer, so a player who looked away still gets told.
// Pure draw. main.js hands in the killer record (killerOf: { name: 'BEAST   THE BLOW', red, rule }), the death-cost lines (dcLine) and `text`.
// The respawn is not delayed: the card is on screen for the same 1.2 s the old line was, and the recap carries on after it.

export const RECAP_S = 3.2;   // how long the recap stays after the respawn

/* THE TELL: what warned you, and the one thing that answers it. Same promise as the ! and !! over a foe's head (tools/tells.mjs). */
export function tellOf(k, colorSafe = false) {
  if (!k) return null;
  if (k.rule) {
    if (k.red) return { col: colorSafe ? '#5aa8ff' : '#ff6b6b', short: (colorSafe ? 'BLUE' : 'RED') + ' !!  DODGE IT', long: (colorSafe ? 'BLUE' : 'RED') + ' !! WARNED YOU: ONLY A DODGE TURNS IT' };
    if (k.rule === 'PARRY IT') return { col: '#ffd36b', short: 'PIERCING  PARRY IT', long: 'A PIERCING BLOW: ONLY A PARRY TURNS IT' };
    return { col: '#ffd36b', short: 'YELLOW !  SHIELD IT', long: 'YELLOW ! WARNED YOU: RAISE THE SHIELD' };
  }
  const n = String(k.name || '').split('   ')[0];
  const H = { 'THE FALL': 'MIND THE EDGE: NO SHIELD ANSWERS A PIT', 'THE WATER': 'DEEP WATER KILLS: STAY ON THE BANK', 'DROWNED': 'DEEP WATER KILLS: STAY ON THE BANK', 'THE FIRE': 'FIRE SPREADS: KEEP MOVING', 'A TRAP': 'LOOK FOR THE TRAP BEFORE YOU STEP' };
  const t = H[n]; return t ? { col: '#c9d1dc', short: t.split(':')[0], long: t } : null;
}
const split = k => { const [who, blow] = String(k.name || 'A TRAP').split('   '); return { who, blow: blow || '' }; };

export function drawDeathCard(g, text, fit, UI, o) {   // o: { k, cost: [[str, col]...], a (0..1), VW, VH, colorSafe }
  const { k, VW, VH } = o, { who, blow } = split(k), tell = tellOf(k, o.colorSafe), cost = o.cost && o.cost.length ? o.cost : [['NOTHING DROPPED', '#c9d1dc']];
  const w = Math.min(VW - 20, 264), x = Math.round((VW - w) / 2), h = 50 + (tell ? 11 : 0) + cost.length * 9 + (blow ? 9 : 0), y = Math.round((VH - h) / 2) - 4;
  g.globalAlpha = o.a; g.fillStyle = 'rgba(24,8,12,0.94)'; g.fillRect(x, y, w, h); g.strokeStyle = '#ff6b6b'; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  g.strokeStyle = 'rgba(255,255,255,0.10)'; g.strokeRect(x + 2.5, y + 2.5, w - 5, h - 5);
  let ty = y + 6; text('YOU FELL', VW / 2, ty, '#ff6b6b', 'center', 12); ty += 17;
  text(fit(who, w - 16, 8), VW / 2, ty, '#fff6e0', 'center', 8); ty += 11;
  if (blow) { text(fit(blow, w - 16, 6), VW / 2, ty, tell ? tell.col : '#c9d1dc', 'center', 6); ty += 9; }
  if (tell) { text(fit(tell.long, w - 8, 6), VW / 2, ty, tell.col, 'center', 6); ty += 11; }
  g.fillStyle = 'rgba(255,255,255,0.10)'; g.fillRect(x + 8, ty - 3, w - 16, 1);
  for (const [s, c] of cost) { text(fit(s, w - 12, 6), VW / 2, ty + 1, c, 'center', 6); ty += 9; }
  g.globalAlpha = 1;
}

/* the line under the timer after the respawn: who, what warned, what it cost, fading out over its last second */
export function drawRecap(g, text, fit, UI, o) {   // o: { k, cost, t (seconds since the respawn), VW, colorSafe }
  const { k, VW } = o, { who, blow } = split(k), tell = tellOf(k, o.colorSafe), left = RECAP_S - o.t, a = Math.max(0, Math.min(1, left, o.t * 4));
  if (a <= 0) return;
  const l1 = who + (blow ? '  ' + blow : ''), l2 = tell ? tell.short : '', w = Math.min(VW - 20, 230), x = Math.round((VW - w) / 2), y = 17, h = l2 ? 23 : 14;
  g.globalAlpha = 0.92 * a; g.fillStyle = 'rgba(24,8,12,0.88)'; g.fillRect(x, y, w, h); g.strokeStyle = 'rgba(255,107,107,0.7)'; g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  g.globalAlpha = a; text(fit('FELLED BY ' + l1, w - 10, 6), VW / 2, y + 4, '#fff6e0', 'center', 6); if (l2) text(fit(l2, w - 10, 6), VW / 2, y + 13, tell.col, 'center', 6); g.globalAlpha = 1;
}
