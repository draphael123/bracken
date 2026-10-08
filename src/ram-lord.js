// ram-lord.js - THE RAM LORD, REWORKED (claude/scree2; scratch/brief-scree2.md item 3, Daniel 10-08: "the boss could be better").
// A BEAST DUELIST (design-standard B11) WITH A RULE OPENING (B1). Header, as B11 asks: HE IS A DUELIST - always hittable, guarding by angle.
//   HIS HORNS GUARD HIS FRONT: a blow from the front at his height is turned (clank + GO ROUND, src/boss-read.js); from behind, from the flank or from
//     above (a jump cut, a plunge) it lands (the shared ANGLE.mul). He is off the boss rule's x0.05 chip (src/boss-greed.js FULL_DAMAGE, with the reason);
//     the greed reprisal still answers a mash.
//   THE LEVEL'S RULE IS HIS OPENING: "the cliff drops what it likes". Two LOOSE OVERHANGS lean out over the fold, each held up by the shepherds' dry-stone
//     PROP at its foot. The prop glints gold while he stands in the overhang's fall line (drawn on the floor); strike it (any blow, standing - every hero)
//     and the overhang creaks and comes down: rock on whatever is under it. Under it, he is STUNNED - the shared OPEN read (B10): a GOLD ring and a timer
//     bar, blows land x2. A spent overhang loosens again (told: grit trickles, the crack glows) after LIP.rearm seconds.
//   THE WALL CRASH stays a BONUS opening (a charge you got out of the way of, into the stone): gold now, not green (the shared read), x1.5.
//   THE WARD (B3): when either opening ends he shakes off the stone - a told ~3 s ward (a pale shell round him, WARDED on every blow, the overhang's rock
//     bounces off him) so he can never be chain-locked.
//   ONE NEW MOVE PER PHASE, AND THE PHASES CHANGE THE FOLD (B5): P1 (100-66%) his kit - the charge (and its feint), the leap, the stamp, the butt, the toss.
//     P2 (66-33%) THE FOLD SLIDES: its floor is scree, running toward the banked wall, and he BANKS OFF THE WALL (his charge comes back). P3 (33-0%)
//     THE CLIFF COMES DOWN: told rocks rain on the fold (a red ring where each lands), and THE HORN SWEEP - a full turn of his horns, front and back:
//     jump it. NO ADDS: his flock call is gone (Daniel: no adds unless the brief says so).
// main.js wires it (updateRam calls ramStep; the hit code asks ramGuard; the draw asks drawRamLips/drawRamRead). tools/ram-lord.mjs is its check.
export const RAM = {
  hp: 1750,             // (was 360 on the chip; a duelist's blows land - and a fight is ~90-150 s)
  stunT: 3.4, stunMul: 2, crashMul: 1.5, wardT: 3, burnMul: 0.35, paceExtra: [0.5, 0.35, 0.2],   /* burnMul: a burn tick outside his openings (off the chip, the pyro's fire ran whole: 4/4 in 34-48 s) */
  p2: 0.66, p3: 0.33,
  rainEvery: 2.1, rainTell: 0.95,
  sweepTell: 0.65, sweepR: 42, sweepH: 22,
  carry: 52,            // px/s the P2 scree floor carries a hero toward the bank (x0)
};
export const LIP = { rearm: 7, creak: 0.32, fall: 0.2, zone: 76, gap: 0, propW: 8, propH: 28, rock: 16 };   /* creak + fall: about half a second from the blow to the rock */
/* THE TWO OVERHANGS of a fold A (px): a prop 5 tiles in from each wall; its fall line runs from the prop toward the middle of the fold */
export function ramLips(A, TS = 16) {
  return [1, -1].map(side => { const x = side > 0 ? A.x0 + 5 * TS + 8 : A.x1 - 5 * TS - 8, z0 = x + side * LIP.gap, z1 = x + side * (LIP.gap + LIP.zone);
    return { x, side, z0: Math.min(z0, z1), z1: Math.max(z0, z1), state: 'armed', t: 0, n: 0, glow: 0 }; });
}
export const ramState = (e, A) => e.rl || (e.rl = { lips: ramLips(A), ph: 1, rainT: 1.5 });
export const inZone = (lip, x, half = 0) => x + half >= lip.z0 && x - half <= lip.z1;   /* half: a body's half-width - the rock lands on any of him under the line */
/* where a hero stands to knock a prop out: just outside its fall line, on the wall's side */
export const lipSpot = lip => lip.x - lip.side * 14;
export const propBox = (lip, floor) => ({ l: lip.x - LIP.propW, r: lip.x + LIP.propW, t: floor - LIP.propH, b: floor });
export const ramOpenMode = e => e.mode === 'crash' || e.mode === 'stun';
/* THE GUARD: what a hero's blade does to him. 'ward' (turned: WARDED), 'horns' (turned: GO ROUND), or null (it lands) */
export function ramGuard(e, fromX, air) {
  if (e.ward > 0) return 'ward';
  if (ramOpenMode(e)) return null;
  const behind = Math.sign(fromX - e.x) === -(e.face || 1);
  return behind || air ? null : 'horns';
}
/* THE STEP, every frame of his fight before his own move code. c = { P, A, floor, dt, hb (the hero's blow box or null), say(x, y, t, col), sfx(k),
   shake(n), dust(x, y, n), rock(x, y, o), hurtP(x, dmg, o), scree(on) }. Returns true when it took his turn this frame (stunned). */
export function ramStep(e, c) {
  const S = ramState(e, c.A), dt = c.dt, A = c.A, floor = c.floor; if (!S.go) { S.go = true; c.scree(false); }   /* a fresh fight: the fold's floor is still */
  e.ward = Math.max(0, (e.ward || 0) - dt);
  /* THE PHASES change the fold */
  const f = e.hp / e.maxHp;
  if (S.ph < 2 && f <= RAM.p2) { S.ph = 2; e.phase = 2; c.scree(true); c.say(e.x, e.y - e.h - 22, 'THE FOLD SLIDES: THE SCREE RUNS TO THE WALL', '#ff9a5c'); c.sfx('roar'); c.shake(6); }
  if (S.ph < 3 && f <= RAM.p3) { S.ph = 3; e.phase = 3; c.say(e.x, e.y - e.h - 22, 'THE CLIFF COMES DOWN', '#ff6b6b'); c.sfx('roar'); c.shake(8); }
  /* P3: THE RAIN - a told rock where the hero is going, now and then */
  if (S.ph >= 3 && e.mode !== 'sleep') { S.rainT -= dt; if (S.rainT <= 0) { S.rainT = RAM.rainEvery; const x = Math.max(A.x0 + 20, Math.min(A.x1 - 20, c.P.x + (c.P.vx || 0) * 0.5 + (Math.random() - 0.5) * 50)); c.rock(x, floor - 150, { delay: RAM.rainTell, tx: x }); } }
  /* THE OVERHANGS */
  for (const L of S.lips) {
    L.glow = Math.max(0, L.glow - dt);
    if (L.state === 'armed') {
      if (c.hb && c.P && !c.P.dead && Math.abs(c.P.x - L.x) < 30 && overlap(c.hb, propBox(L, floor)) && !L.hitBy) {   /* struck standing AT it (a spear swung at him from across the fold does not knock it by chance) */ L.hitBy = true; L.state = 'creak'; L.t = LIP.creak; L.n++; c.sfx('crack'); c.shake(3); c.dust(L.x, floor - 6, 6); c.say(L.x, floor - 44, 'THE PROP GOES', '#ffd36b'); }
      if (inZone(L, e.x, (e.w || 48) / 2 - 8) && !(e.ward > 0) && !ramOpenMode(e)) L.glow = 0.25;   /* he is in its fall line: the prop glints */
    } else if (L.state === 'creak') { L.t -= dt; if (L.t <= 0) { L.state = 'fall'; L.t = LIP.fall; c.sfx('rumble'); c.shake(5);
        for (let i = 0; i < 6; i++) { const x = L.z0 + (L.z1 - L.z0) * (i + 0.5) / 6; c.rock(x, floor - 120 - Math.random() * 20, { delay: 0, tx: x, lip: true }); } } }
    else if (L.state === 'fall') { L.t -= dt; if (L.t <= 0) { L.state = 'spent'; L.t = LIP.rearm; c.shake(9); c.sfx('heavy'); for (let i = 0; i < 5; i++) c.dust(L.z0 + (L.z1 - L.z0) * i / 4, floor, 6);
        if (Math.abs(e.y - floor) < 6 && inZone(L, e.x, (e.w || 48) / 2 - 8) && e.mode !== 'leap' && e.mode !== 'butt') {
          if (e.ward > 0) c.say(e.x, e.y - e.h - 14, 'HE SHRUGS THE STONE OFF: WARDED', '#c9d1dc');
          else { e.mode = 'stun'; e.modeT = RAM.stunT; e.openT0 = RAM.stunT; e.stagger = RAM.stunT; e.vx = 0; e.stunN = (e.stunN || 0) + 1; c.say(e.x, e.y - e.h - 14, 'THE CLIFF HAS HIM: STUNNED', '#ffd36b'); c.sfx('sting'); } }
        if (!c.P.dead && inZone(L, c.P.x) && Math.abs(c.P.y - floor) < 30) c.hurtP(L.x + L.side * 30, LIP.rock, { up: true, name: 'THE OVERHANG' }); } }
    else if (L.state === 'spent') { L.t -= dt; if (L.t <= 0) { L.state = 'armed'; L.hitBy = false; c.say(L.x, floor - 44, 'THE CLIFF LOOSENS AGAIN', '#ffd36b'); } }
    if (!c.hb) L.hitBy = false;   /* one swing, one prop */
  }
  if (e.mode === 'stun') { e.vx = 0; if (e.modeT <= 0) {   /* (updateRam ticks modeT) */ e.mode = 'pace'; e.modeT = 0.5; e.stagger = 0; ward(e, c); } return true; }
  return false;
}
/* THE WARD after an opening (B3): told, and drawn */
export function ward(e, c) { e.ward = RAM.wardT; c.say(e.x, e.y - e.h - 14, 'HE SHAKES IT OFF: WARDED', '#c9d1dc'); c.sfx('snort'); }
const overlap = (a, b) => a.r > b.l && a.l < b.r && a.b > b.t && a.t < b.b;
/* THE DRAW of the fold's overhangs (world px; g the frame, cx/cy the camera, t the clock): the lip of rock leaning out of the cliff over the fall line, its
   dry-stone prop at the foot; armed - grit trickles and, while he is in its fall line, the prop GLINTS gold and the line on the floor shows; spent - the
   lip is gone, a scar in the cliff, the rubble on the floor */
export function drawRamLips(g, e, floor, cx, cy, t) {
  const S = e && e.rl; if (!S) return;
  for (const L of S.lips) {
    const px = Math.round(L.x - cx), fy = Math.round(floor - cy), lipX0 = Math.round(Math.min(L.x, L.x + L.side * (LIP.gap + LIP.zone)) - cx), lipW = LIP.gap + LIP.zone + 10;
    const up = L.state === 'armed' || L.state === 'creak', shake = L.state === 'creak' ? Math.round(Math.sin(t * 60) * 2) : 0, drop = L.state === 'fall' ? Math.round((1 - L.t / LIP.fall) * 80) : 0;
    if (up || L.state === 'fall') {   /* THE LIP: a slab of ochre rock out of the cliff, its underside ragged */
      const ly = fy - 118 + drop; g.fillStyle = '#6b5238'; g.fillRect(lipX0 + shake, ly, lipW, 16); g.fillStyle = '#8a6a48'; g.fillRect(lipX0 + shake, ly, lipW, 4); g.fillStyle = '#c8a070'; g.fillRect(lipX0 + shake, ly, lipW, 1);
      for (let i = 0; i < lipW; i += 6) { g.fillStyle = '#5a4632'; g.fillRect(lipX0 + shake + i, ly + 16, 4, 3 + ((i * 7) % 5)); }
      g.fillStyle = '#2e2218'; for (let i = 4; i < lipW - 4; i += 11) g.fillRect(lipX0 + shake + i, ly + 5, 1, 8);   /* its cracks */
      if (L.state === 'armed' && Math.floor(t * 3 + L.x) % 2 === 0) { g.fillStyle = '#a8865a'; g.fillRect(lipX0 + ((t * 40) % lipW | 0), ly + 20 + ((t * 70) % 90 | 0), 1, 2); } }
    else { g.fillStyle = '#3e3024'; g.fillRect(lipX0, fy - 118, lipW, 3); }   /* the scar where it came away */
    /* THE PROP: a dry-stone pillar under it, cracked; gold while he is in the fall line */
    if (up) { const gl = L.glow > 0 || L.state === 'creak'; g.fillStyle = '#7a6046'; g.fillRect(px - 6, fy - LIP.propH, 12, LIP.propH); g.fillStyle = '#a8865a'; for (let y = fy - LIP.propH; y < fy; y += 5) g.fillRect(px - 6 + ((y / 5) % 2 ? 2 : 0), y, 8, 1);
      g.fillStyle = '#2e2218'; g.fillRect(px - 1, fy - 20, 1, 12); g.fillRect(px, fy - 9, 2, 1);
      if (gl) { const k = 0.5 + 0.5 * Math.sin(t * 12); g.globalAlpha = 0.5 + 0.5 * k; g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.strokeRect(px - 8, fy - LIP.propH - 2, 16, LIP.propH + 2); g.fillStyle = '#fff6c8'; g.fillRect(px - 1, fy - 22, 2, 2);
        g.globalAlpha = 0.35; g.fillStyle = '#ffd36b'; g.fillRect(Math.round(L.z0 - cx), fy - 1, Math.round(L.z1 - L.z0), 1); g.globalAlpha = 1; } }
    else { g.fillStyle = '#5a4632'; g.fillRect(px - 7, fy - 5, 14, 5); }   /* the prop's rubble */
  }
}
/* THE SHARED READ (B10): open = a GOLD ring and a timer bar; warded = a pale shell; P3's horn sweep tell = a red arc both ways */
export function drawRamRead(g, e, cx, cy, t) {
  const x = Math.round(e.x - cx), y = Math.round(e.y - cy);
  if (ramOpenMode(e)) { const k = 0.5 + 0.5 * Math.sin(t * 10); g.globalAlpha = 0.45 + 0.4 * k; g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y - 2, 28 + k * 3, 7, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
    const T0 = e.openT0 || 3, fr = Math.max(0, Math.min(1, e.modeT / T0)); g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(x - 16, y - e.h - 12, 32, 3); g.fillStyle = '#ffd36b'; g.fillRect(x - 16, y - e.h - 12, Math.round(32 * fr), 3); }
  else if (e.ward > 0) { g.globalAlpha = 0.25 + 0.2 * Math.sin(t * 8); g.strokeStyle = '#d8e2ee'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y - e.h / 2, 30, e.h / 2 + 6, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
  if (e.mode === 'sweepTell') { g.globalAlpha = 0.5 + 0.4 * Math.sin(t * 20); g.strokeStyle = '#ff6b6b'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y - 6, RAM.sweepR, 8, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
}
