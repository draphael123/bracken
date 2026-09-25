// src/sexton.js — THE SEXTON, the Falling Tower's mini, at the Bell Loft (docs/briefs/falling-tower-rework.md §3).
// The tower's bell-ringer, dead and still on duty: a tall, stooped figure in a grey-violet cassock with a bronze hand-bell on a
// short chain. He is fought on the bell deck - failing planks (src/tower-collapse.js) over a two-row bell pit, on joists - with two
// stone RINGERS' WALKS standing two rows over it. His art: src/redraw/sexton.js.
//   THE SWING       !    the bell drawn back on its chain and swung through the space in front of him: guard it, or step back
//   THE RUSH        !    head down, bell lowered like a ram, the length of the deck: guard it, or jump him
//   THE TOLL        !!   the bell raised in both hands and brought down: a ring along the deck and the pit strikes anyone standing on
//                        them - get off the deck (a ringers' walk, a jump). AND IT IS THE ROOM'S CLOCK: every plank near him starts
//                        its count (the plank under his own feet does not - he knows his own deck)
//   THE BELL DROPS  !!   he hauls on a bell-rope; a shadow marks where you stood and a bell falls from the frame onto it: leave the shadow
// THE OPENING IS CAUSED (A11; tools/boss-openings.mjs proves it): he never walks onto counting planks of his own accord - he stops at
// their edge. But THE RUSH IS COMMITTED: charge him across a counting plank and it breaks under him. He goes through into the bell pit,
// CAUGHT, open for PIT seconds and taking double, then heaves himself out onto the nearest joist. A plank that goes under him for any
// other reason (your weight started it and you left late with him on it) does the same. Left alone - whole planks between you - the
// rush is only a rush and opens nothing.
// PHASE TWO (A10), at half: "HE RINGS THE WHOLE DECK." Every plank in the room counts on each toll, on a shorter count, and the bells
// come down in pairs. The deck stops being somewhere to stand.
// Touching him never hurts (the touch rule): his damage is his swing, his rush, his toll and his bells.
export const SEXTON = {
  hp: 520, walk: 28, keep: 34, cd: 1.25, cdP2: 0.95,
  tell: { swing: 0.8, rush: 0.85, toll: 1.0, drop: 0.95 },
  dmg: { swing: 17, rush: 14, toll: 14, drop: 16 },
  swingReach: 48, rushV: 150, rushT: 0.7, rushFrom: 80, tollR: 80, tollHit: 150, count: 3, countP2: 2,
  dropHalf: 14, pairGap: 44, pit: 3.2, pitMul: 2, climb: 0.55, pitDepth: 32,
  order: ['swing', 'toll', 'rush', 'swing', 'drop', 'rush', 'toll'],
};
const TELL = { swing: 'swingTell', rush: 'rushTell', toll: 'tollTell', drop: 'dropTell' };
const SAY = { swingTell: 'THE SWING', rushTell: 'HE CHARGES', tollTell: 'THE TOLL: OFF THE DECK', dropTell: 'THE BELL DROPS' };
export const sextonOpen = e => e.mode === 'pit';
/* the frames of bakeSexton: 0 stand | 1,2 walk | 3 swing tell | 4 swing | 5 rush tell | 6 rush | 7 toll tell | 8 toll | 9 drop tell (hauling)
   | 10,11 caught in the pit (THE OPENING) | 12 climbing out | 13 hurt */
export const SEXTON_F = { stand: 0, walk: [1, 2], swingTell: 3, swing: 4, rushTell: 5, rush: 6, tollTell: 7, toll: 8, dropTell: 9, drop: 9, pit: [10, 11], climb: 12, hurt: 13 };
export function sextonFrame(e) {
  const F = SEXTON_F, m = e.mode;
  if (m === 'pit') return F.pit[Math.floor((e.anim || 0) * 5) % 2];
  if (F[m] !== undefined && !Array.isArray(F[m])) return F[m];
  return Math.abs(e.vx || 0) > 3 ? F.walk[Math.floor((e.anim || 0) * 5) % 2] : F.stand;
}
/* HIS HEALTH: the pit doubles what lands (called by hurtEnemy0 with the blow's damage, returns what comes off the bar) */
export const sextonTake = (e, dmg) => (dmg > 0 && sextonOpen(e) ? Math.round(dmg * SEXTON.pitMul) : dmg);
function begin(e, what, c) {
  e.mode = TELL[what]; e.modeT = SEXTON.tell[what] * (e.phase === 2 ? 0.85 : 1); e.face = Math.sign(c.P.x - e.x) || e.face || 1;
  if (what === 'drop') { e.spots = [c.P.x]; if (e.phase === 2) e.spots.push(c.P.x + (Math.sign(c.P.vx || 0) || e.face) * SEXTON.pairGap); c.shadow(e.spots, e.modeT); }
  c.say(SAY[e.mode], what === 'toll' || what === 'drop');
}
/* into the pit: the plank under him is gone */
function fall(e, c, why) {
  e.mode = 'pit'; e.modeT = SEXTON.pit; e.open = SEXTON.pit; e.vx = 0; e.y = c.A.floor + SEXTON.pitDepth;
  c.say(why || 'CAUGHT IN THE BELL PIT', false, true); c.sound('crash'); c.shake(6); c.dust(e.x, c.A.floor);
}
export function updateSexton(e, dt, c) {
  const { P, A, hit } = c, floor = A.floor, rnd = c.rnd || Math.random;
  if (!e.alive || e.mode === 'sleep') return;
  e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.cd = (e.cd ?? 1) - dt; e.turn ??= 0;
  e.open = e.mode === 'pit' ? Math.max(0, e.modeT) : 0;
  if (e.mode === 'wake') { e.y = floor; if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = 0.8; if (!e.dealt) { e.dealt = true; e.turn = Math.floor(rnd() * SEXTON.order.length); } } return; }
  if (e.phase !== 2 && e.hp <= e.maxHp / 2) { e.phase = 2; c.say('HE RINGS THE WHOLE DECK', true); c.sound('toll'); c.shake(5); }
  // ---- THE PIT: caught, open; then he heaves himself out onto the nearest joist ----
  if (e.mode === 'pit') { e.y = floor + SEXTON.pitDepth; if (e.modeT <= 0) { e.mode = 'climb'; e.modeT = SEXTON.climb; c.sound('heavy'); } return; }
  if (e.mode === 'climb') { if (e.modeT <= 0) { const j = c.joist(e.x); if (j !== null) e.x = j; e.y = floor; e.mode = 'stalk'; e.cd = 0.7; c.dust(e.x, floor); } return; }
  e.y = floor;
  /* a plank that goes under him for any reason takes him down with it */
  const under = c.plank(e.x); if (under && under.st === 'down' && e.mode !== 'rush') { fall(e, c); return; }
  // ---- THE ATTACKS ----
  if (e.mode === 'swingTell' || e.mode === 'rushTell' || e.mode === 'tollTell' || e.mode === 'dropTell') {
    if (e.mode === 'swingTell' || e.mode === 'tollTell') e.face = Math.sign(P.x - e.x) || e.face;
    if (e.modeT > 0) return;
    if (e.mode === 'swingTell') { e.mode = 'swing'; e.modeT = 0.4; c.sound('swing');
      const dx = (P.x - e.x) * e.face; if (!P.dead && dx > -10 && dx < SEXTON.swingReach && Math.abs(P.y - floor) < 40) hit(e.x, SEXTON.dmg.swing, false, 'THE SWING'); return; }
    if (e.mode === 'rushTell') { e.mode = 'rush'; e.modeT = SEXTON.rushT; e.rushHit = false; c.sound('rush'); return; }
    if (e.mode === 'tollTell') { e.mode = 'toll'; e.modeT = 0.5; c.sound('toll'); c.shake(4); c.ring(e.x, floor, e.phase === 2 ? 400 : SEXTON.tollHit);
      /* the ring runs along the deck and down into the pit: on them, you are struck; on a ringers' walk or in the air, you are not */
      if (!P.dead && P.ground && P.y > floor - 12 && (e.phase === 2 || Math.abs(P.x - e.x) < SEXTON.tollHit)) hit(e.x, SEXTON.dmg.toll, true, 'THE TOLL');
      c.count(e.x, e.phase === 2 ? Infinity : SEXTON.tollR, e.phase === 2 ? SEXTON.countP2 : SEXTON.count); return; }
    if (e.mode === 'dropTell') { e.mode = 'drop'; e.modeT = 0.35; c.sound('drop'); c.shake(3);
      for (const x of e.spots || []) { c.bell(x); if (!P.dead && Math.abs(P.x - x) < SEXTON.dropHalf && P.y > floor - 60) { hit(x, SEXTON.dmg.drop, true, 'THE BELL'); break; } }
      e.spots = null; return; }
  }
  if (e.mode === 'rush') { const nx = e.x + e.face * SEXTON.rushV * dt; e.vx = e.face * SEXTON.rushV;
    if (nx > A.x0 + 16 && nx < A.x1 - 16) e.x = nx; else e.modeT = 0;
    /* THE OPENING: a counting plank breaks under his charge; one already down he runs straight into */
    const p = c.plank(e.x); if (p && (p.st === 'count' || p.st === 'down')) { if (p.st === 'count') c.breakPlank(p); fall(e, c, 'THE PLANKS GIVE UNDER HIS CHARGE'); return; }
    if (!e.rushHit && !P.dead && Math.abs(P.x - e.x) < 20 && Math.abs(P.y - floor) < 34) { e.rushHit = true; hit(e.x, SEXTON.dmg.rush, false, 'THE RUSH'); }
    if (e.modeT <= 0) { e.mode = 'stalk'; e.vx = 0; e.cd = (e.phase === 2 ? SEXTON.cdP2 : SEXTON.cd) * (0.8 + 0.4 * rnd()); } return; }
  if (e.mode === 'swing' || e.mode === 'toll' || e.mode === 'drop') { if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = (e.phase === 2 ? SEXTON.cdP2 : SEXTON.cd) * (0.8 + 0.4 * rnd()); } return; }
  // ---- STALKING: he keeps to his reach and comes on, and never onto a plank that is counting ----
  const d = P.x - e.x, ad = Math.abs(d); e.face = Math.sign(d) || e.face;
  let want = ad > SEXTON.keep ? e.face : 0; const nx = e.x + want * SEXTON.walk * (e.phase === 2 ? 1.25 : 1) * dt, ahead = c.plank(nx + want * 8);
  if (want && ahead && ahead !== under && (ahead.st === 'count' || ahead.st === 'down')) want = 0;   /* he stops at the edge of it */
  if (want && nx > A.x0 + 16 && nx < A.x1 - 16) e.x = nx; e.vx = want * SEXTON.walk;
  if (e.cd > 0 || P.dead) return;
  let what = SEXTON.order[e.turn++ % SEXTON.order.length];
  if (what === 'swing' && ad > SEXTON.swingReach + 30) what = ad > SEXTON.rushFrom ? 'rush' : 'toll';
  if (what === 'rush' && ad < SEXTON.rushFrom * 0.6) what = 'swing';
  begin(e, what, c);
}
