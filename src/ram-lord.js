import { drawArm, drawSlab, drawProp } from './scree-lip.js';
import { boulderFrame, boulderSocket, shardRidge, stompCrack, dustRing, DUST_N } from './scree-art.js';
// ram-lord.js - THE RAM LORD, REWORKED (claude/scree2; scratch/brief-scree2.md item 3, Daniel 10-08: "the boss could be better").
// A BEAST DUELIST (design-standard B11) WITH A RULE OPENING (B1). Header, as B11 asks: HE IS A DUELIST - always hittable, guarding by angle.
//   HIS HORNS GUARD HIS FRONT: a blow from the front at his height is turned (clank + GO ROUND, src/boss-read.js); from behind, from the flank or from
//     above (a jump cut, a plunge) it lands (the shared ANGLE.mul). He is off the boss rule's x0.05 chip (src/boss-greed.js FULL_DAMAGE, with the reason);
//     the greed reprisal still answers a mash.
//   THE LEVEL'S RULE IS HIS OPENING: "the cliff drops what it likes". Two LOOSE OVERHANGS lean out over the fold, each held up by the shepherds' dry-stone
//     PROP at its foot. The prop glints gold while he stands in the overhang's fall line (drawn on the floor); strike it (any blow, standing - every hero)
//     and the overhang creaks and comes down: rock on whatever is under it. Under it, he is STUNNED - the shared OPEN read (B10): a GOLD ring and a timer
//     bar, blows land x8 (claude/ramtune2: was x4, Daniel 10-24 "too much health for the mechanics"; the wall crash x6, was x4). A spent overhang loosens again (told: grit trickles, the crack glows) after LIP.rearm seconds.
//   THE WALL CRASH stays a BONUS opening (a charge you got out of the way of, into the stone): gold now, not green (the shared read), x1.5.
//   THE WARD (B3): when either opening ends he shakes off the stone - a told ~3 s ward (a pale shell round him, WARDED on every blow, the overhang's rock
//     bounces off him) so he can never be chain-locked.
//   ONE NEW MOVE PER PHASE, AND THE PHASES CHANGE THE FOLD (B5): P1 (100-66%) his kit - the charge (and its feint), the leap, the stamp, the butt, the toss.
//     P2 (66-33%) THE FOLD SLIDES: its floor is scree, running toward the banked wall, and he BANKS OFF THE WALL (his charge comes back). P3 (33-0%)
//     THE CLIFF COMES DOWN: told rocks rain on the fold (a red ring where each lands), and THE HORN SWEEP - a full turn of his horns, front and back:
//     jump it. NO ADDS: his flock call is gone (Daniel: no adds unless the brief says so).
//   claude/scree3 (Daniel 11-01, scratch/brief-scree3-1109.md): ONE OPENING PROFILE (RAM.open): the rock on him and the wall slam each land the same CRACK and open the same window
//     ("the cliff and the wall hit him the same"); a 6th move, THE BOULDER BUTT (he horns the cliff, a boulder rolls the fold: jump it, or let it knock a prop); his stomp's ground shock drawn as
//     a cracked ring and an ochre rock-shard ridge (drawRamWave, stompFx).
// main.js wires it (updateRam calls ramStep; the hit code asks ramGuard; the draw asks drawRamLips/drawRamRead). tools/ram-lord.mjs is its check.
export const RAM = {
  hp: 6000,             // (was 360 on the chip; a duelist's blows land - and a fight is ~90-150 s)
  open: { impact: 300, t: 3.2, mul: 6, cap: 0.25 },   /* ONE OPENING for the cliff's rock (stun) and the wall slam (crash): CRACK for impact at once, then t seconds of blows x mul, ended early at cap of his blood */
  boulder: { tell: 0.85, release: 0.25, headIn: 0.7, r: 10, h: 20, sp: [150, 175, 190], back: 0.6, weight: 0.15, cd: 6, minAd: 60, wallMax: 175, knock: 200, shove: 120 },   /* the boulder butt */
  stunT: 3.2, stunMul: 6, crashMul: 6,   /* (Daniel 10-24: x8 measured 92% with flasks -> x6; claude/scree3: both openings read RAM.open) */ wardT: 2, frontMul: 0.4, burnMul: 0.4, paceExtra: [0.1, 0.05, 0],   /* burnMul: a burn tick outside his openings (off the chip, the pyro's fire ran whole: 4/4 in 34-48 s) */
  p2: 0.66, p3: 0.33,
  rainEvery: 2.1, rainTell: 0.95,
  sweepTell: 0.65, sweepR: 42, sweepH: 22,
  carry: 52,            // px/s the P2 scree floor carries a hero toward the bank (x0)
};
export const LIP = { rearm: 7, creak: 0.32, fall: 0.2, zone: 76, gap: 0, propW: 8, propH: 28, rock: 16, foeDmg: 45 };   /* foeDmg: what the road's overhangs do to a foe under them (he is BURIED, stood still) */   /* creak + fall: about half a second from the blow to the rock */
/* THE TWO OVERHANGS of a fold A (px): a prop 5 tiles in from each wall; its fall line runs from the prop toward the middle of the fold */
export function ramLips(A, TS = 16) {
  return [1, -1].map(side => { const x = side > 0 ? A.x0 + 5 * TS + 8 : A.x1 - 5 * TS - 8, z0 = x + side * LIP.gap, z1 = x + side * (LIP.gap + LIP.zone);
    return { x, side, z0: Math.min(z0, z1), z1: Math.max(z0, z1), state: 'armed', t: 0, n: 0, glow: 0 }; });
}
export const ramState = (e, A) => e.rl || (e.rl = { lips: ramLips(A), ph: 1, rainT: 1.5, floor: A.floor });
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
  c.bb = boulderStep(e, c);   /* the boulder rolling the fold (a box when it can knock a prop) */
  /* THE PHASES change the fold */
  const f = e.hp / e.maxHp;
  if (S.ph < 2 && f <= RAM.p2) { S.ph = 2; e.phase = 2; c.scree(true); c.say(e.x, e.y - e.h - 22, 'THE FOLD SLIDES: THE SCREE RUNS TO THE WALL', '#ff9a5c'); c.sfx('roar'); c.shake(6); }
  if (S.ph < 3 && f <= RAM.p3) { S.ph = 3; e.phase = 3; c.say(e.x, e.y - e.h - 22, 'THE CLIFF COMES DOWN', '#ff6b6b'); c.sfx('roar'); c.shake(8); }
  /* P3: THE RAIN - a told rock where the hero is going, now and then */
  if (S.ph >= 3 && e.mode !== 'sleep') { S.rainT -= dt; if (S.rainT <= 0) { S.rainT = RAM.rainEvery; const x = Math.max(A.x0 + 20, Math.min(A.x1 - 20, c.P.x + (c.P.vx || 0) * 0.5 + (Math.random() - 0.5) * 50)); c.rock(x, floor - 150, { delay: RAM.rainTell, tx: x }); } }
  /* THE OVERHANGS */
  for (const L of S.lips) stepLip(L, c, floor, inZone(L, e.x, (e.w || 48) / 2 - 8) && !(e.ward > 0) && !ramOpenMode(e), () => {
    if (Math.abs(e.y - floor) < 6 && inZone(L, e.x, (e.w || 48) / 2 - 8) && e.mode !== 'leap' && e.mode !== 'butt') {
      if (e.ward > 0) c.say(e.x, e.y - e.h - 14, 'HE SHRUGS THE STONE OFF: WARDED', '#c9d1dc');
      else { openIn(e, c, 'stun'); c.say(e.x, e.y - e.h - 14, 'THE CLIFF HAS HIM: STUNNED', '#ffd36b'); c.sfx('sting'); } } });
  if (e.mode === 'stun') { e.vx = 0; openCap(e, c); if (e.modeT <= 0) {   /* (updateRam ticks modeT) */ e.crashHp = undefined; e.mode = 'pace'; e.modeT = 0.5; e.stagger = 0; ward(e, c); } return true; }
  return false;
}
/* ONE OVERHANG, ONE FRAME (the fold's two, and THE LEVEL'S own - the 'overhang' ent, taught on the road before him: B14, the key is taught first). glowNow: something
   worth dropping it on stands in its line (the prop glints). onDown(L): the rock is down - the caller says what it caught. c as ramStep's. */
export function stepLip(L, c, floor, glowNow, onDown) {
  const dt = c.dt; L.glow = Math.max(0, L.glow - dt);
  if (L.state === 'armed') {
    if (((c.hb && c.P && !c.P.dead && Math.abs(c.P.x - L.x) < 30 && overlap(c.hb, propBox(L, floor))) || (c.bb && overlap(c.bb, propBox(L, floor)))) && !L.hitBy) {   /* struck standing AT it (a spear swung at him from across the fold does not knock it by chance) - or a BOULDER rolling through it (claude/scree3) */ L.hitBy = true; L.state = 'creak'; L.t = LIP.creak; L.n++; c.sfx('crack'); c.shake(3); c.dust(L.x, floor - 6, 6); c.say(L.x, floor - 44, 'THE PROP GOES', '#ffd36b'); }
    if (glowNow) L.glow = 0.25;   /* something stands in its fall line: the prop glints */
  } else if (L.state === 'creak') { L.t -= dt; if (L.t <= 0) { L.state = 'fall'; L.t = LIP.fall; c.sfx('rumble'); c.shake(5);
      for (let i = 0; i < 6; i++) { const x = L.z0 + (L.z1 - L.z0) * (i + 0.5) / 6; c.rock(x, floor - 120 - Math.random() * 20, { delay: 0, tx: x, lip: true }); } } }
  else if (L.state === 'fall') { L.t -= dt; if (L.t <= 0) { L.state = 'spent'; L.t = LIP.rearm; c.shake(9); c.sfx('heavy'); for (let i = 0; i < 5; i++) c.dust(L.z0 + (L.z1 - L.z0) * i / 4, floor, 6);
      onDown(L); if (!c.P.dead && inZone(L, c.P.x) && Math.abs(c.P.y - floor) < 30) c.hurtP(L.x + L.side * 30, LIP.rock, { up: true, name: 'THE OVERHANG' }); } }
  else if (L.state === 'spent') { L.t -= dt; if (L.t <= 0) { L.state = 'armed'; L.hitBy = false; c.sfx('creak'); c.say(L.x, floor - 44, 'THE CLIFF LOOSENS AGAIN', '#ffd36b'); } }
  if (!c.hb && !c.bb) L.hitBy = false;   /* one swing, one prop */
}
/* A LEVEL OVERHANG (the 'overhang' ent at column x, standing on row `row`'s floor, its line running `side` from the prop) */
export function levelLip(x, row, side, TS = 16) { const px = x * TS + 8, z0 = px + side * LIP.gap, z1 = px + side * (LIP.gap + LIP.zone);
  return { x: px, side, z0: Math.min(z0, z1), z1: Math.max(z0, z1), floor: (row + 1) * TS, state: 'armed', t: 0, n: 0, glow: 0, level: true }; }
/* ONE OPENING PROFILE (claude/scree3): the cliff's rock ('stun') and the wall slam ('crash') both begin here. CRACK: RAM.open.impact straight away (not while he is WARDED -
   the rock bounces, as before), then RAM.open.t seconds of blows x RAM.open.mul, ended early by openCap at RAM.open.cap of his blood. c.hurtE(e, dmg) is the shared hurt path. */
export function openIn(e, c, kind) {
  const O = RAM.open; e.mode = kind; e.modeT = O.t; e.openT0 = O.t; e.vx = 0; e.crashHp = e.hp; if (kind === 'stun') { e.stagger = O.t; e.stunN = (e.stunN || 0) + 1; }
  if (!(e.ward > 0) && c.hurtE) { c.hurtE(e, O.impact); c.say(e.x, e.y - e.h - 28, 'CRACK ' + O.impact, '#ffd36b'); if (c.hitstop) c.hitstop(0.06); }
}
export function openCap(e, c) {
  if (e.crashHp === undefined) e.crashHp = e.hp;
  if (e.modeT > 0 && e.crashHp - e.hp >= e.maxHp * RAM.open.cap) { e.modeT = 0; c.sfx('snort'); c.say(e.x, e.y - e.h - 12, 'HE SHAKES IT OFF', '#ff9a5c'); }   /* a daze is worth a share of him */
}
/* THE BOULDER BUTT (claude/scree3): he trots at the nearest fold wall (boulderTell), horns it (boulderButt) and a boulder shakes loose and rolls out across the fold - r 10, 20 px tall:
   jump it or roll it, or block it (SHOVED). Hits the far wall, rolls back once at 60% speed, shatters at the wall it came from. Rolling through an ARMED prop knocks it like a blow. */
export function boulderStart(e, c, wallSide) {
  const A = c.A, K = RAM.boulder, ph = Math.min(2, (e.phase || 1) - 1), x = wallSide < 0 ? A.x0 + 22 : A.x1 - 22;
  e.boulder = { x, y: c.floor - 74, vy: 0, ph: 'fall', dir: -wallSide, sp: K.sp[ph], rot: 0, hitT: 0, snd: 0, life: 0 };
  c.sfx('stone'); c.shake(7); c.dust(x, c.floor, 10);
}
export function boulderStep(e, c) {
  const B = e.boulder; if (!B) return null; const dt = c.dt, A = c.A, K = RAM.boulder, floor = c.floor; B.life += dt; B.hitT = Math.max(0, B.hitT - dt);
  if (B.ph === 'fall') { B.vy += 700 * dt; B.y += B.vy * dt; if (B.y >= floor - K.r) { B.y = floor - K.r; B.vy = 0; B.ph = 'roll'; c.sfx('thud'); c.shake(4); c.dust(B.x, floor, 8); } return null; }
  const sp = B.sp * (B.ph === 'back' ? K.back : 1); B.x += B.dir * sp * dt; B.rot += B.dir * sp * dt / K.r; B.snd -= dt;
  if (B.snd <= 0) { B.snd = 0.28; c.sfx('boulderRoll'); c.dust(B.x - B.dir * 6, floor, 2); }
  const P = c.P;
  if (!P.dead && B.hitT <= 0 && Math.abs(P.x - B.x) < K.r + 4 && P.y > floor - K.h + 2 && !(P.dodge > 0)) {   /* the hero's feet below its crown: a jump (20 px) clears it, so does a roll */
    B.hitT = 0.8; const res = c.hurtP(B.x - B.dir * 20, c.dmgBoulder, { name: 'THE BOULDER' });
    if (res === 'hit') { P.vx = B.dir * K.knock; P.vy = -120; } else if (res === 'blocked') { P.vx = B.dir * K.shove; c.say(P.x, P.y - 24, 'SHOVED', '#c9d1dc'); } }
  const wl = A.x0 + K.r + 6, wr = A.x1 - K.r - 6;
  if (B.x <= wl || B.x >= wr) { B.x = Math.max(wl, Math.min(wr, B.x));
    if (B.ph === 'roll') { B.ph = 'back'; B.dir = -B.dir; c.sfx('stone'); c.shake(5); c.dust(B.x, floor, 8); }
    else { c.sfx('stone'); c.shake(4); c.dust(B.x, floor, 12); c.dust(B.x + 8, floor, 6); e.boulder = null; return null; } }
  if (B.life > 16) { e.boulder = null; return null; }
  return { l: B.x - K.r, r: B.x + K.r, t: floor - K.h, b: floor };
}
/* ONE LOOK FOR HIS GROUND SHOCKS (claude/scree3): the stomp, the leap's landing and the P2 butt's landing. A wave travels as an ochre ROCK-SHARD RIDGE drawn as tall as the wave's hit box
   (main.js: a hero is hit when its feet are below the wave's y - 4, so a jump of 5 px clears it; stones that pop above it are grit, not hit). x/y the wave on screen. */
export function drawRamWave(g, x, y, dir, wx, t) {
  const sd = Math.floor(wx / 6);
  g.drawImage(shardRidge(sd), x - 12, y - 7);   /* the baked ridge (scree-art.js): 5 px at most above the foot, the wave's real hit height */
  for (let k = 0; k < 4; k++) { const ph = (t * 5 + k * 0.25 + sd * 0.13) % 1, px = x - dir * (8 + k * 7) + ((k * 5) % 3), py = y - 1 - Math.sin(ph * Math.PI) * (6 + k % 3 * 2); g.globalAlpha = 0.85 - ph * 0.5; g.fillStyle = k % 2 ? '#d8b888' : '#8a6a48'; g.fillRect(Math.round(px), Math.round(py), 2, 2); }   /* grit popping off the ridge, in its wake */
  g.globalAlpha = 1;
}
/* THE GROUND CRACK + DUST RING + FLASH at the point of a stomp (e.rl.fx, read by drawRamRead); big: the stomp, not the leap */
export function stompFx(e, x, t, big = true) { const S = e.rl; if (!S) return; (S.fx || (S.fx = [])).push({ x, t0: t, big, sd: Math.floor(x) & 255 }); if (S.fx.length > 6) S.fx.shift(); }
function drawStompFx(g, S, cx, cy, floor, t) {
  if (!S.fx) return; S.fx = S.fx.filter(f => t - f.t0 < 1.3);
  for (const f of S.fx) { const a = t - f.t0, x = Math.round(f.x - cx), y = Math.round(floor - cy);
    if (a < 0.06 && f.big) { g.globalAlpha = 0.5; g.fillStyle = '#fff6e0'; g.beginPath(); g.ellipse(x, y - 2, 34, 9, 0, 0, Math.PI * 2); g.fill(); }   /* the flash, one frame */
    /* the crack: a baked decal (scree-art.js stompCrack) that opens out from the hoof in 0.12 s, then fades over 1.2 s; the leap's landing gets the smaller one */
    const open = Math.min(1, a / 0.12), hw = Math.max(2, Math.round(32 * open)), cw = f.big ? 1 : 0.72, cwid = Math.round(hw * cw);
    g.globalAlpha = Math.max(0, Math.min(1, (1.2 - a) / 0.7)); g.drawImage(stompCrack(f.sd), 32 - cwid, 0, cwid * 2, 10, x - cwid, y - 5, cwid * 2, 10); g.globalAlpha = 1;
    const rk = Math.min(1, a / 0.35); if (rk < 1) { g.globalAlpha = 0.85 * (1 - rk * rk); g.drawImage(dustRing(Math.floor(rk * DUST_N)), x - 52, y - 16); }   /* the dust ring: baked puffs, 0 -> 46 px */
  }
  g.globalAlpha = 1;
}
/* THE BOULDER, drawn: a baked lumpy ochre rock (scree-art.js boulderFrame) turning with B.rot, its shadow under it; the 24 px sprite is centred on the hitbox's disc (r 10) */
function drawBoulder(g, B, cx, cy, floor, t) {
  const x = Math.round(B.x - cx), y = Math.round(B.y - cy), r = RAM.boulder.r;
  g.globalAlpha = 0.4; g.fillStyle = '#0a0814'; g.beginPath(); g.ellipse(x, Math.round(floor - cy) - 1, r - 1, 3, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
  g.drawImage(boulderFrame(B.rot), x - 12, y - 12);
}
/* THE WARD after an opening (B3): told, and drawn */
export function ward(e, c) { e.ward = RAM.wardT; c.say(e.x, e.y - e.h - 14, 'HE SHAKES IT OFF: WARDED', '#c9d1dc'); c.sfx('snort'); }
const overlap = (a, b) => a.r > b.l && a.l < b.r && a.b > b.t && a.t < b.b;
/* THE DRAW of the fold's overhangs (world px; g the frame, cx/cy the camera, t the clock): the lip of rock leaning out of the cliff over the fall line, its
   dry-stone prop at the foot; armed - grit trickles and, while he is in its fall line, the prop GLINTS gold and the line on the floor shows; spent - the
   lip is gone, a scar in the cliff, the rubble on the floor */
export function drawRamLips(g, e, floor, cx, cy, t) {
  const S = e && e.rl; if (!S) return;
  for (const L of S.lips) drawLip(g, L, floor, cx, cy, t);
}
export function drawLip(g, L, floor, cx, cy, t) {
  {
    const px = Math.round(L.x - cx), fy = Math.round(floor - cy), lipX0 = Math.round(Math.min(L.x, L.x + L.side * (LIP.gap + LIP.zone)) - cx), lipW = LIP.gap + LIP.zone + 10;
    const up = L.state === 'armed' || L.state === 'creak', warn = L.state === 'armed' && L.glow > 0, shake = L.state === 'creak' ? Math.round(Math.sin(t * 60) * 2) : warn ? Math.round(Math.sin(t * 38) * 1.2) : 0, drop = L.state === 'fall' ? Math.round((1 - L.t / LIP.fall) * 50) : 0;
    { const wx = L.side > 0 ? lipX0 : lipX0 + lipW, ay = fy - 58; drawArm(g, wx, ay, L.side); }   /* THE CRAG ARM it leans out on, up out of the view: rock, not a flat polygon (claude/screefix, src/scree-lip.js) */
    if (up || L.state === 'fall') {   /* THE LIP: a slab of ochre rock out of the cliff, its underside ragged */
      const ly = fy - 58 + drop; drawSlab(g, lipX0 + shake, ly, lipW);   /* THE LIP: a slab of the hill's rock, a stalactite fringe under it (src/scree-lip.js) */
      if (L.state === 'armed' && Math.floor(t * 3 + L.x) % 2 === 0) { g.fillStyle = '#b0a090'; g.fillRect(lipX0 + ((t * 40) % lipW | 0), ly + 20 + ((t * 70) % 90 | 0), 1, 2); } }
    else { g.fillStyle = '#4a3e3a'; g.fillRect(lipX0, fy - 58, lipW, 3); }   /* the scar where it came away */
    /* THE PROP: a dry-stone pillar under it, cracked; gold while he is in the fall line */
    if (up) { const gl = L.glow > 0 || L.state === 'creak';   /* THE PROP: a dry-stone pier, its stones in courses, wider at the foot, a crack up its middle */
      drawProp(g, px, fy, L.state === 'creak' ? (L.t > LIP.creak * 0.5 ? 'knock0' : 'knock1') : gl ? 'glint' : 'armed', L.side);   /* THE CHOCK CAIRN (scree-lip.js): armed / glint (the wedge gold) / the blow's two frames */
      if (gl) { const k = 0.5 + 0.5 * Math.sin(t * 12); g.globalAlpha = 0.5 + 0.5 * k; g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.strokeRect(px - 8, fy - LIP.propH - 2, 16, LIP.propH + 2); g.fillStyle = '#fff6c8'; g.fillRect(px - 1, fy - 22, 2, 2);
        /* HE IS ABOUT TO BE STUNNED (claude/ramtune2): the fall line is a bright band on the floor, a pulsing gold ring round the prop and a bouncing gold arrow over it, and grit + pebbles drop through the line while the slab shakes */
        const z0 = Math.round(Math.min(L.z0, L.z1) - cx), zw = Math.round(Math.abs(L.z1 - L.z0));
        g.globalAlpha = 0.3 + 0.3 * k; g.fillStyle = '#ffd36b'; g.fillRect(z0, fy - 3, zw, 3); g.globalAlpha = 0.9; g.fillStyle = '#fff6c8'; g.fillRect(z0, fy - 1, zw, 1);
        g.globalAlpha = 0.4 + 0.5 * k; g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.ellipse(px, fy - LIP.propH / 2, 11 + k * 4, LIP.propH / 2 + 4 + k * 3, 0, 0, Math.PI * 2); g.stroke();
        const ab = fy - LIP.propH - 14 - Math.round(k * 4); g.globalAlpha = 1; g.fillStyle = '#ffd36b'; g.beginPath(); g.moveTo(px - 6, ab - 8); g.lineTo(px + 6, ab - 8); g.lineTo(px, ab); g.closePath(); g.fill(); g.fillRect(px - 2, ab - 15, 4, 8); g.strokeStyle = '#3a2a10'; g.lineWidth = 1; g.strokeRect(px - 2.5, ab - 15.5, 5, 8);
        for (let i = 0; i < 8; i++) { const ph = (t * 1.7 + i * 0.37) % 1, dx = z0 + ((i * 53 + 11) % Math.max(1, zw)), dy = fy - 56 + ph * 54; g.globalAlpha = 0.95 - ph * 0.5; g.fillStyle = i % 2 ? '#d8c8a8' : '#8a7a6a'; const sz = i % 3 === 0 ? 2 : 1; g.fillRect(dx, Math.round(dy), sz, sz); }
        g.globalAlpha = 1; } }
    else { const p = L.state === 'spent' ? 1 - Math.max(0, L.t) / LIP.rearm : 0, st = L.state === 'spent' && p > 0.66 ? 'rearm2' : L.state === 'spent' && p > 0.33 ? 'rearm1' : 'spent';   /* the prop's rubble, the stones settling back up over LIP.rearm */
      drawProp(g, px, fy, st, L.side);
      if (st !== 'spent') for (let q = 0; q < 4; q++) { const ph = (t * 1.6 + q * 0.27) % 1; g.globalAlpha = 0.9 - ph * 0.7; g.fillStyle = q % 2 ? '#d8c8a8' : '#8a7a6a'; g.fillRect(px - 7 + q * 5 + (q % 2), Math.round(fy - 20 + ph * 18), 1, 2); } g.globalAlpha = 1; }
  }
}
/* THE SHARED READ (B10): open = a GOLD ring and a timer bar; warded = a pale shell; P3's horn sweep tell = a red arc both ways */
export function drawRamRead(g, e, cx, cy, t) {
  const x = Math.round(e.x - cx), y = Math.round(e.y - cy), fl = e.rl && e.rl.floor !== undefined ? e.rl.floor : e.y;
  if (e.rl) drawStompFx(g, e.rl, cx, cy, fl, t);
  if (e.boulder) drawBoulder(g, e.boulder, cx, cy, fl, t);
  if (e.mode === 'stampTell') { const k = 0.5 + 0.5 * Math.sin(t * 22), fy = Math.round(e.y - cy) - 1;   /* THE STOMP, told: a red ground ellipse at his true hit radius (30 px), dust lifting at the hooves */
    g.globalAlpha = 0.18 + 0.2 * k; g.fillStyle = '#ff4a3a'; g.beginPath(); g.ellipse(x, fy, 30, 7, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 0.55 + 0.35 * k; g.strokeStyle = '#ff6b4a'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, fy, 30, 7, 0, 0, Math.PI * 2); g.stroke();
    for (let q = 0; q < 6; q++) { const ph = (t * 3 + q * 0.17) % 1; g.globalAlpha = 0.7 * (1 - ph); g.fillStyle = '#c8a888'; g.fillRect(x + (q % 2 ? 1 : -1) * (6 + (q >> 1) * 6), Math.round(fy - ph * 12), 2, 2); } g.globalAlpha = 1; }
  if ((e.mode === 'boulderTell' || e.mode === 'boulderButt') && e.bl) { const B = e.bl, K = RAM.boulder, side = B.wall || 1, by = Math.round(B.floor - cy) - 70, dist = side > 0 ? 38 : 22, face = Math.round(B.wallX + side * dist - cx);   /* the pillar's inner face: 38 px past boulderStart's x at the east wall (the arena edge sits a tile short of it), 22 at the west */   /* THE BOULDER WORKS LOOSE OF THE PILLAR: a rock lodged in the wall's own face (a socket round it, grit trickling) - not hung in the sky. At the butt it slides out to where it falls from (boulderStart's x) */
    const tell = e.mode === 'boulderTell', sh = tell ? Math.round(Math.sin(t * 50) * 1.2) : 0, slide = tell ? 0 : Math.min(1, 1 - e.modeT / K.release), bx = Math.round(face - side * (2 + (dist - 2) * slide));
    g.save(); g.beginPath(); g.rect(side > 0 ? face : face - 16, by - 16, 16, 32); g.clip(); g.drawImage(boulderSocket(), face + side * 4 - 16, by - 16); g.restore();   /* the hollow, cut to the pillar's own 16 px */
    g.drawImage(boulderFrame(0), bx - 12 + sh, by - 12);   /* the rock, whole, lodged half in it: it slides out of the hollow at the butt */
    for (let q = 0; q < 6; q++) { const ph = (t * 2.2 + q * 0.19) % 1; g.globalAlpha = 0.9 - ph * 0.6; g.fillStyle = q % 2 ? '#d8c8a8' : '#8a7a6a'; g.fillRect(bx - 8 + q * 3, Math.round(by + 10 + ph * 50), 1, 2); } g.globalAlpha = 1; }
  if (ramOpenMode(e)) { const k = 0.5 + 0.5 * Math.sin(t * 10); g.globalAlpha = 0.45 + 0.4 * k; g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y - 2, 28 + k * 3, 7, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
    const T0 = e.openT0 || 3, fr = Math.max(0, Math.min(1, e.modeT / T0)); g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(x - 16, y - e.h - 12, 32, 3); g.fillStyle = '#ffd36b'; g.fillRect(x - 16, y - e.h - 12, Math.round(32 * fr), 3); }
  else if (e.ward > 0) { g.globalAlpha = 0.25 + 0.2 * Math.sin(t * 8); g.strokeStyle = '#d8e2ee'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y - e.h / 2, 30, e.h / 2 + 6, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
  if (e.mode === 'sweepTell') { g.globalAlpha = 0.5 + 0.4 * Math.sin(t * 20); g.strokeStyle = '#ff6b6b'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y - 6, RAM.sweepR, 8, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
}
