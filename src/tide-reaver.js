// tide-reaver.js — THE TIDE REAVER, the Drowned Causeway's mini (2026-09-22, Daniel: "he's just a basic enemy right now").
// He was a Tide Marauder with a name: a harpoon and a low rake, turn about, and nothing the player did changed anything. The common
// marauders on the causeway still fight that way (updateTidemarauder in main.js); the one holding the road fights like this.
//   THE THRUST     !    the harpoon, straight out: guard it, or step back out of it
//   THE LOW RAKE   ✕    the harpoon swept along the stones: nothing guards it - jump it
//   THE CAST       !    at range he throws the harpoon on its line along the road. Guarded, it drops and he hauls it back. Taken,
//                       it bites and he REELS you in - and the thrust comes straight after
//   THE UNDERTOW   ✕    (the second half) he drives the harpoon into the causeway and the sea comes back over it: a wave rolls
//                       the length of the arena from the far wall to him. Jump it
// THE OPENING IS YOURS (tools/boss-openings.mjs proves it): get OVER or OUT of the cast's line. A cast that finds no one runs on into
// the arena wall and sticks there, and he has to wade over and wrench it out: DISARMED, every blow counts twice until he has it.
// A cast you guard, or one that bites, opens nothing.
// PHASE TWO (under half): the undertow joins his round, a rake can be followed by a wave, and he rests less. No tell gets shorter.
// Touching him never hurts (the touch rule): his damage is the harpoon and the sea.
export const REAVER = {
  walk: 34, keep: 56, cd: 1.15, cdP2: 0.85,
  tell: { thrust: 0.75, rake: 1.05, cast: 0.8, undertow: 1.0, reelThrust: 0.8 },
  dmg: { thrust: 20, rake: 24, cast: 8, undertow: 18 },
  thrustReach: 85, rakeReach: 90, castMin: 60, castV: 300, reelTo: 56, reelT: 0.35,
  waveV: 150, waveH: 18, fetchWalk: 70, disarmMax: 3.2, disarmMul: 2, backT: 0.5, backV: 110, pullT: 0.9, rakeWave: 0.5,
  order: ['thrust', 'rake', 'cast', 'thrust', 'cast', 'rake'], orderP2: ['thrust', 'undertow', 'cast', 'rake', 'thrust', 'cast', 'undertow'],
};
const TELL = { thrust: 'thrustTell', rake: 'rakeTell', cast: 'castTell', undertow: 'undertowTell' };
const SAY = { thrustTell: 'THE THRUST', rakeTell: 'THE LOW RAKE: JUMP', castTell: 'THE CAST', undertowTell: 'THE UNDERTOW: JUMP THE WAVE' };
export const reaverOpen = e => e.mode === 'disarmed' || e.mode === 'fetch' || e.mode === 'wrench';
/* THE OPENING, on the bar: while he has no harpoon every blow counts twice */
export const reaverTake = (e, dmg) => dmg > 0 && reaverOpen(e) ? Math.round(dmg * REAVER.disarmMul) : dmg;
/* his frames are the drowned corsairs' (main.js): 0 stand | 1 walk | 2 tell | 3 the low tell | 4 rest */
export function reaverFrame(e) {
  switch (e.mode) {
    case 'thrustTell': case 'castTell': case 'reelThrust': return 2;
    case 'rakeTell': case 'undertowTell': return 3;
    case 'thrust': case 'rake': case 'cast': case 'undertow': case 'wrench': case 'haul': return 4;
    case 'backstep': return 1;
    case 'fetch': return Math.floor((e.anim || 0) * 6) % 2;
    case 'disarmed': return 4;
  }
  return Math.abs(e.vx || 0) > 3 ? 1 : 0;
}
function begin(e, what, c) { e.mode = TELL[what]; e.modeT = REAVER.tell[what]; e.face = Math.sign(c.P.x - e.x) || e.face || 1; c.say(SAY[e.mode], what === 'rake' || what === 'undertow'); c.sound('clank'); }
const rest = (e, rnd) => { e.mode = 'stalk'; e.cd = (e.phase === 2 ? REAVER.cdP2 : REAVER.cd) * (0.8 + 0.4 * rnd()); };
export function updateTideReaver(e, dt, c) {
  const { P, A, hit } = c, floor = A.floor, rnd = c.rnd || Math.random;
  if (!e.alive) return;
  e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.cd = (e.cd ?? 1) - dt; e.turn ??= 0; e.vx = 0;
  e.open = reaverOpen(e) ? 1 : 0;
  if (!e.dealt) { e.dealt = true; e.turn = Math.floor(rnd() * REAVER.order.length); e.mode = 'stalk'; e.cd = 0.7; }   /* where in his round he starts is his own, fight to fight */
  if (e.phase !== 2 && e.hp <= e.maxHp * 0.5) { e.phase = 2; e.turn = Math.floor(rnd() * REAVER.orderP2.length); c.say('THE TIDE TURNS WITH HIM', true); }
  /* the wave runs on its own clock, whatever he is doing */
  const w = e.wave; if (w) { w.x += w.dir * REAVER.waveV * dt;
    if (!w.hit && !P.dead && Math.abs(P.x - w.x) < 12 && P.y > floor - REAVER.waveH) { w.hit = true; hit(w.x, REAVER.dmg.undertow, true, 'THE UNDERTOW'); }
    if (w.x < A.x0 + 8 || w.x > A.x1 - 8 || (w.dir > 0 ? w.x > e.x + 10 : w.x < e.x - 10)) e.wave = null; }
  /* the harpoon on its line */
  const h = e.harpoon;
  if (e.mode === 'cast' && h) { h.x += h.dir * REAVER.castV * dt;
    if (!h.missed && !P.dead && Math.abs(P.x - h.x) < 12 && Math.abs(P.y - (floor - 12)) < 16) {
      const r = hit(h.x, REAVER.dmg.cast, false, 'THE CAST');
      if (r === false) h.missed = true;   /* rolled through it (the hero untouchable): it flies on to the wall, as if jumped */
      else {
      if (r === 'blocked') { e.harpoon = null; e.mode = 'haul'; e.modeT = REAVER.pullT; c.say('GUARDED: HE HAULS IT BACK', false); c.sound('clank'); return; }
      e.harpoon = null; e.mode = 'reel'; e.modeT = REAVER.reelT; e.reelFrom = P.x; c.say('REELED IN', true); c.sound('reel'); return; } }
    if (h.x <= A.x0 + 6 || h.x >= A.x1 - 6) { h.x = Math.max(A.x0 + 6, Math.min(A.x1 - 6, h.x)); h.stuck = true;
      e.mode = 'disarmed'; e.modeT = 0.45; e.disarmT = 0; c.say('THE HARPOON STICKS: HE IS DISARMED', false, true); c.sound('thud'); c.shake(3); return; }
    return; }
  if (e.mode === 'reel') { const to = e.x + e.face * REAVER.reelTo, k = Math.max(0, e.modeT / REAVER.reelT);
    c.pull(to + (e.reelFrom - to) * k);
    if (e.modeT <= 0) { e.mode = 'reelThrust'; e.modeT = REAVER.tell.reelThrust; c.say('THE THRUST', false); } return; }
  if (e.mode === 'haul') { if (e.modeT <= 0) rest(e, rnd); return; }
  if (e.mode === 'backstep') { const nx = e.x - e.face * REAVER.backV * dt; if (nx > A.x0 + 16 && nx < A.x1 - 16) e.x = nx; e.vx = -e.face * REAVER.backV;
    if (e.modeT <= 0) begin(e, 'cast', c); return; }
  /* DISARMED: he stands a beat, wades to the wall, wrenches it out */
  if (e.mode === 'disarmed') { if (e.modeT <= 0) e.mode = 'fetch'; return; }
  if (e.mode === 'disarmed' || e.mode === 'fetch') e.disarmT = (e.disarmT || 0) + dt;
  if (e.mode === 'fetch') { const hx = e.harpoon ? e.harpoon.x : e.x, d = hx - e.x; e.face = Math.sign(d) || e.face;
    if (e.disarmT >= REAVER.disarmMax) { e.mode = 'wrench'; e.modeT = 0.6; c.say('HE HAULS IT IN ON THE LINE', false); c.sound('reel'); return; }   /* the opening is never longer than this, however far the wall */
    if (Math.abs(d) > 14) { e.vx = e.face * REAVER.fetchWalk; e.x += e.vx * dt; } else { e.mode = 'wrench'; e.modeT = 0.6; c.sound('crack'); } return; }
  if (e.mode === 'wrench') { if (e.modeT <= 0) { e.harpoon = null; c.say('ARMED AGAIN', true); rest(e, rnd); e.cd = 0.5; } return; }
  // ---- THE TELLS, and what comes out of them ----
  if (e.mode === 'thrustTell' || e.mode === 'reelThrust' || e.mode === 'rakeTell' || e.mode === 'castTell' || e.mode === 'undertowTell') {
    if (e.mode !== 'reelThrust') e.face = Math.sign(P.x - e.x) || e.face;
    if (e.modeT > 0) return;
    const d = (P.x - e.x) * e.face, ad = Math.abs(P.x - e.x), dy = Math.abs(P.y - floor);
    if (e.mode === 'thrustTell' || e.mode === 'reelThrust') { e.mode = 'thrust'; e.modeT = 0.35; c.sound('slash');
      if (!P.dead && d > -8 && d < REAVER.thrustReach && dy < 30) hit(e.x, REAVER.dmg.thrust, false, 'THE THRUST'); return; }
    if (e.mode === 'rakeTell') { e.mode = 'rake'; e.modeT = 0.4; c.ring(e.x, floor - 2, REAVER.rakeReach); c.sound('splash');
      if (!P.dead && ad < REAVER.rakeReach && P.y > floor - 24) hit(e.x, REAVER.dmg.rake, true, 'THE LOW RAKE');
      if (e.phase === 2 && !e.wave && rnd() < REAVER.rakeWave) e.rakeWave = true; return; }
    if (e.mode === 'castTell') { e.mode = 'cast'; e.modeT = 3; e.harpoon = { x: e.x + e.face * 12, dir: e.face }; c.sound('whoosh'); return; }
    if (e.mode === 'undertowTell') { e.mode = 'undertow'; e.modeT = 0.5; startWave(e, A, c); return; }
  }
  if (e.mode === 'thrust' || e.mode === 'rake' || e.mode === 'undertow') {
    if (e.modeT <= 0) { if (e.rakeWave) { e.rakeWave = false; begin(e, 'undertow', c); return; } rest(e, rnd); } return; }
  // ---- STALKING: he keeps to his reach and comes on, and casts at anyone who keeps away ----
  const d = P.x - e.x, ad = Math.abs(d); e.face = Math.sign(d) || e.face;
  const want = ad > REAVER.keep ? e.face : 0, nx = e.x + want * REAVER.walk * dt;
  if (nx > A.x0 + 16 && nx < A.x1 - 16) e.x = nx; e.vx = want * REAVER.walk;
  if (e.cd > 0 || P.dead) return;
  const order = e.phase === 2 ? REAVER.orderP2 : REAVER.order;
  let what = order[e.turn++ % order.length];
  if (what === 'cast' && ad < REAVER.castMin) { e.mode = 'backstep'; e.modeT = REAVER.backT; e.face = Math.sign(d) || e.face; return; }   /* too close to throw: he steps back down the road first */
  if ((what === 'thrust' || what === 'rake') && ad > REAVER.thrustReach + 30) what = 'cast';
  if (what === 'undertow' && e.wave) what = 'thrust';
  begin(e, what, c);
}
/* the wave starts at the wall behind you and rolls back to him */
function startWave(e, A, c) { const dir = c.P.x >= e.x ? -1 : 1; e.wave = { x: dir < 0 ? A.x1 - 10 : A.x0 + 10, dir, hit: false }; c.sound('splash'); c.shake(2); }
/* the harpoon on its line, the one stuck in the wall, and the wave */
export function drawTideReaver(g, e, cx, cy, time, floorY) {
  if (!e?.alive) return;
  const fy = Math.round(floorY - cy), ex = Math.round(e.x - cx);
  const h = e.harpoon;
  if (h) { const x = Math.round(h.x - cx), y = fy - 12;
    if (e.mode === 'cast') { g.strokeStyle = '#c9b88a'; g.lineWidth = 1; g.beginPath(); g.moveTo(ex + e.face * 8, fy - 20); g.lineTo(x, y); g.stroke(); }   /* the line back to his hand */
    const s = h.dir; g.fillStyle = '#6a5236'; g.fillRect(Math.min(x, x - s * 16), y - 1, 16, 2);   /* shaft */
    g.fillStyle = '#c9d1dc'; g.fillRect(x + (s > 0 ? 0 : -4), y - 2, 4, 4); g.fillRect(x + (s > 0 ? 4 : -6), y - 1, 2, 2);   /* the head */
    if (h.stuck) { const k = 0.5 + 0.5 * Math.sin(time * 10); g.globalAlpha = 0.35 + 0.35 * k; g.strokeStyle = '#8fd160'; g.lineWidth = 2; g.beginPath(); g.ellipse(ex, fy - 2, 18 + k * 3, 5, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; } }
  if (e.wave) { const x = Math.round(e.wave.x - cx), H = REAVER.waveH;
    g.fillStyle = 'rgba(120,190,200,0.75)'; g.fillRect(x - 10, fy - H + 4, 20, H - 4); g.fillStyle = '#e8f6f4'; g.fillRect(x - 10 + (e.wave.dir > 0 ? 12 : 0), fy - H, 8, 4);   /* the crest leans the way it runs */
    for (let k = 0; k < 4; k++) { g.fillStyle = '#ffffff'; g.fillRect(x - 8 + k * 5, fy - H - 1 - ((k + Math.floor(time * 12)) % 3), 1, 1); } }
}
