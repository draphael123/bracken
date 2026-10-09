/* THE GREAT HOUND'S OWN RULES (claude/hound, Daniel 10-07: "too difficult simply because he's invincible outside of very small windows.
   He should NOT be invincible. You can give him a little more health, give him one more attack, but he shouldn't be invincible.")

   WHAT HE IS (design standard B11 + B13): a BEAST DUELIST. He is ALWAYS HITTABLE for real damage - he is off the mini chip
   (src/boss-greed.js: not on CHIP_MINI, on FULL_DAMAGE) - and he GUARDS BY ANGLE: his head and jaws turn part of a blow struck into his face
   (a hero at his height, in front of him: GH.front of it lands, CLANK, the word GO ROUND); from behind him, or from the air over him, it
   lands whole. Never a silent blow, never a wait.
   HIS BONUS OPENINGS (kept from claude/bosswave1): his lunge taken on a shield (IT SKIDS) and both pups killed in time (IT WHINES) stand him
   still for GH.openT s - a gold ring and a timer bar - and every blow in them lands x GH.openMul from any side. A third of him at most per
   opening (main.js updateGreatHound, GH_TAKE). When one ends his WARD is told (B3): GH.wardT s in which nothing opens him again (he is still
   hit for real: the ward only shuts the bonus).
   HIS NEW MOVE (B5): THE BOUGHS - he rears and slams the old oak, and dead boughs come down on three marked spots (red rings on the floor
   for the whole tell, the boughs seen falling for its last part). Get clear of the rings (a roll, a step) - no shield turns a bough (!!).
   He stands in his rear the while: the move is also a window to cut him. */
export const GH = {
  hp: 765,          // (220 on master, ON THE CHIP: outside a 3 s window a blow took a twentieth. Hit whole now - kings:mini, human bot, 765 with BOSS_HIT 1.5: kn 6/8 wa 6/8 py 7/8 = 79%; 740-770 pooled 72/96 = 75%)
  front: 0.4,       // a blow into his face at his height
  openMul: 1.5, openT: 3.0, wardT: 3.0,
  bough: { tell: 0.95, tellP2: 0.8, fall: 0.4, every: 7.5, everyP2: 5.5, spread: 50, r: 13, dmg: 16 },
};
export const houndOpen = e => !!e && e.open > 0;
export const houndWard = e => !!e && e.ghWard > 0;
/* a hero's blow, struck from fromX (air: off the ground over him). Returns what comes off the bar, and whether his jaws turned part of it */
export function houndTake(e, dmg, fromX, air, isBlow) {
  if (!(dmg > 0)) return { dmg, turned: false };
  if (houndOpen(e)) return { dmg: Math.round(dmg * GH.openMul), turned: false };
  if (!isBlow || e.broken > 0 || e.mode === 'wait') return { dmg, turned: false };
  const front = Math.sign(fromX - e.x) === (e.face || 1) || Math.abs(fromX - e.x) < 4;
  if (front && !air) return { dmg: Math.max(1, Math.round(dmg * GH.front)), turned: true };
  return { dmg, turned: false };
}
/* every frame (before his moves): the ward's clock. An opening that just ended (by its clock or his third) starts the ward, told */
export function houndWardStep(e, dt, say) {
  if (e.ghWard > 0) e.ghWard = Math.max(0, e.ghWard - dt);
  if (e.ghWasOpen && !(e.open > 0)) { e.ghWard = GH.wardT; if (say) say(e); }
  e.ghWasOpen = e.open > 0;
}
/* THE BOUGHS: three spots, one where you stand and one a stride either side (clamped to the floor he fights on) */
export function boughSpots(px, x0, x1) {
  const s = GH.bough.spread, c = Math.max(x0 + 16, Math.min(x1 - 16, px));
  return [c - s, c, c + s].map(x => Math.max(x0 + 10, Math.min(x1 - 10, x)));
}
/* did a bough landing at bx catch the hero (px, py on a floor at floorY)? */
export const boughHits = (bx, px, py, floorY) => Math.abs(px - bx) < GH.bough.r && py > floorY - 34;

/* DRAWN OVER HIM: the gold ring and the timer bar while he is open, a pale flicker of his ward, and THE BOUGHS' red rings and the falling wood */
export function drawHound(g, e, cx, cy, time, floorY) {
  if (!e || !e.alive) return;
  const x = Math.round(e.x - cx), fy = Math.round((floorY ?? e.y) - cy), k = 0.5 + 0.5 * Math.sin(time * 9);
  if (houndOpen(e)) {
    g.globalAlpha = 0.55 + 0.35 * k; g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, fy - 2, 24 + 2 * k, 6, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
    const top = Math.round(e.y - cy) - 30; g.fillStyle = '#1b1626'; g.fillRect(x - 14, top, 28, 5); g.fillStyle = '#ffd36b'; g.fillRect(x - 13, top + 1, Math.round(26 * Math.min(1, e.open / GH.openT)), 3);
  } else if (houndWard(e)) {
    g.globalAlpha = 0.25 + 0.2 * k; g.strokeStyle = '#c9d1dc'; g.beginPath(); g.ellipse(x, fy - 2, 20, 5, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
  }
  if (e.mode === 'boughTell' && e.boughs) {
    const T = e.boughT0 || GH.bough.tell, left = Math.max(0, e.modeT), fall = GH.bough.fall;
    for (const bx of e.boughs) { const sx = Math.round(bx - cx), q = 0.5 + 0.5 * Math.sin(time * 16);
      g.globalAlpha = 0.55 + 0.45 * q; g.strokeStyle = '#ff6b6b'; g.lineWidth = 2; g.beginPath(); g.ellipse(sx, fy - 1, GH.bough.r, 4, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1;
      for (let i = 0; i < 4; i++) { const ly = fy - 12 - ((Math.floor(time * 60) + i * 23) % 90), lx = sx - 8 + ((i * 7 + Math.floor(time * 3)) % 17); g.fillStyle = i % 2 ? '#d08a3a' : '#8a5a2a'; g.fillRect(lx, ly, 2, 1); }   /* leaves shaken loose over the ring */
      g.fillStyle = 'rgba(10,8,14,0.5)'; g.beginPath(); g.ellipse(sx, fy - 1, Math.round(GH.bough.r * (1 - Math.min(1, left / T) * 0.6)), 2, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
      if (left < fall) { const by = fy - 4 - Math.round(150 * (left / fall));   /* the bough, seen coming down */
        g.fillStyle = '#1a120a'; g.fillRect(sx - 9, by - 3, 18, 5); g.fillStyle = '#6a4a2a'; g.fillRect(sx - 8, by - 2, 16, 3); g.fillStyle = '#8a6a3a'; g.fillRect(sx - 8, by - 2, 16, 1);
        g.fillStyle = '#4e6a2e'; g.fillRect(sx + 5, by - 5, 4, 3); g.fillRect(sx - 9, by + 1, 3, 2); } }
  }
}
