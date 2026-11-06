// src/salt-card.js - THE FIRST-DEATH CARD (claude/onboard1, Daniel 11-06). A save's FIRST death that actually drops something (gold or XP)
// is followed, after the respawn, by ONE card that says exactly what the death cost rule did: how much you dropped, where it lies, how to
// get it back, and what a second death does. Dismissed with the confirm key (armed after a beat so a mashed attack key cannot skip it).
// Once per save: PROG.deathCost.card = 1 (src/death-cost.js keeps it through normalize). Pure logic + draw; main.js owns the state.
// The rule it describes is src/death-cost.js / main.js deathCost: a foe that killed you carries the bundle (kill it to drop it); a boss's
// bundle lies at his arena door; otherwise it lies where you fell (a pit, spikes or water: your last safe footing). Walk into it to take
// it back. A shrine banks what you carry. Die AGAIN carrying something new before you get it and it is gone.
export const ARM_S = 0.9;   // seconds before the confirm key may dismiss it

export const amountOf = b => [(b.coins | 0) + (b.purse | 0) ? ((b.coins | 0) + (b.purse | 0)) + ' GOLD' : '', b.xp ? b.xp + ' XP' : ''].filter(Boolean).join(' AND ');

/* where the bundle lies, in words: info = { where: 'foe'|'door'|'spot', name, fell } */
export function whereLine(i) {
  if (i.where === 'foe') return ['THE ' + String(i.name || 'FOE').replace(/^THE /, '') + ' HAS IT: KILL IT TO DROP IT', 'A FOE HAS IT: KILL IT TO DROP IT'];
  if (i.where === 'door') return ['IT LIES AT THE ARENA DOOR', 'IT LIES AT THE DOOR'];
  return i.fell === false ? ['IT LIES AT YOUR LAST SAFE FOOTING', 'IT LIES AT SAFE GROUND'] : ['IT LIES WHERE YOU FELL', 'IT LIES WHERE YOU FELL'];
}
/* the card's body, as [text, colour] lines; fit(s, w, size) is main.js fitText. Each line has a long and a short form so the long one is never cut. */
export function lines(info, textW, maxW) {
  const pick = a => a.find(s => textW(s, 6) <= maxW) || a[a.length - 1];
  return [
    [pick([amountOf(info) + ' DROPPED']), '#ffd36b'],
    [pick(whereLine(info)), '#fff6e0'],
    [pick(['WALK INTO IT TO TAKE IT BACK', 'WALK INTO IT TO GET IT BACK']), '#8fd160'],
    [pick(['DIE AGAIN FIRST AND IT IS GONE FOR GOOD', 'DIE AGAIN FIRST: GONE FOR GOOD']), '#ff9a5c'],
    [pick(['A SHRINE BANKS WHAT YOU CARRY, SAFE', 'A SHRINE BANKS WHAT YOU CARRY']), '#c9d1dc'],
  ];
}
export function draw(g, text, fit, textW, o) {   // o: { info, t, VW, VH, touch, board }
  const { VW, VH } = o, w = Math.min(VW - 16, 256), x = Math.round((VW - w) / 2), L = lines(o.info, textW, w - 10), h = 40 + L.length * 11 + 6, y = Math.round((VH - h) / 2) - 2, a = Math.min(1, o.t * 4);
  g.globalAlpha = 0.6 * a; g.fillStyle = '#0a060e'; g.fillRect(0, 0, VW, VH); g.globalAlpha = a;
  if (o.board) o.board(x, y, w, h); else { g.fillStyle = 'rgba(24,8,12,0.96)'; g.fillRect(x, y, w, h); g.strokeStyle = '#ffd36b'; g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); }
  let ty = y + 7; text('YOU DROPPED YOUR HAUL', VW / 2, ty, '#ffd36b', 'center', 8); ty += 16;
  g.fillStyle = 'rgba(255,255,255,0.10)'; g.fillRect(x + 8, ty - 3, w - 16, 1);
  for (const [s, c] of L) { text(fit(s, w - 10, 6), VW / 2, ty + 2, c, 'center', 6); ty += 11; }
  ty += 4; if (o.t > ARM_S && Math.floor(o.t * 2) % 2 === 0) text(o.touch ? 'TAP  CONTINUE' : 'Z  CONTINUE', VW / 2, ty, '#8fd160', 'center', 6);
  g.globalAlpha = 1;
}
