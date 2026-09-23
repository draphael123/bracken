// false-abbot.js — THE FALSE ABBOT, the Monastery's boss (2026-09-22), in place of the Roc. Brief: docs/briefs/false-abbot.md.
// A goblin in the abbot's cope and mitre, twice the priest's size, with the abbot's censer on a long chain. Fought in the
// BELFRY with its roof ON (the Roc is what used to tear it off), the great bell hanging over the ringing floor.
//
// WHY HIM. The goblin priest cannot be a boss as he stands: DMG.gobpriest is 0 and his whole verb is the rite - he mends
// the goblins near him and gives them six seconds of taking HALF of every blow. He is a support unit. But this level's own
// rule line is "WHAT THE MONKS BUILT STILL ANSWERS A BLOW", and it teaches that sentence twice before the top (a bell over
// the golem cracks it; a bell under the Roc goes through her). So the boss that belongs here is the rite made into a
// fight, with the monastery's own great bell as the thing that beats it.
//
// THREE LAYERS, ALL AT ONCE (a boss is layers running concurrently, or it is a pattern you memorise):
//   THE CONGREGATION  goblins up the ladder in a trickle, never more than ABBOT.adds, sharing ONE windup between them
//   THE RITE          he blesses them AND HIMSELF, and a warded Abbot takes a FIFTH: you cannot out-swing it
//   THE BELL          ring it while he is under it and the note goes through the rite - every blessing on the roof
//                     breaks at once, the congregation is dazed, and he is DOWNED and takes double
//
// AND THE OPENING IS YOURS TO MAKE (tools/boss-openings.mjs proves it is CAUSED): the bell only answers with him under
// it, so the fight is about MOVING him there, and two of his own attacks are what move him -
//   THE CAST   guarded, the chain snaps taut on the boards and HE is hauled a step toward you: stand past the bell
//   THE PROCESSION  a straight walk he cannot turn out of: bait it from the far side and he crosses under it himself
// A bell rung with him anywhere else does nothing but put itself on cooldown.
//
//   CENSER      !   swung at head height, the chain's reach past his body: a shield turns it, and it shoves you
//   CAST        !   thrown flat and hauled back: guarded it pulls HIM, taken it reels YOU in with the swing behind
//   PROCESSION  X   he walks a line, censer whirling, and nothing turns it: go over him or round him
//   COALS       X   the censer tipped: burning coals along the boards, and floor fire turns on no shield
//   THE RITE        HIS HEARTBEAT: taken the moment the ward lapses, so the ward is his standing condition and this
//                   windup is the price of it. It throws no blow, so it wears no mark (the QUIET list), and a blow
//                   that staggers him ON its windup SPOILS it - the other way to get at him, and the harder one
//   THE KNELL   X   phase two: he rings the great bell HIMSELF. It hurts everything on the roof that is not blessed,
//                   and it puts the bell on cooldown - the price of letting him reach it.
// Touching him never hurts (the touch rule): his damage is the censer, the chain, the coals and the knell.
//
// PURE: no DOM, no main.js. Everything the world does is a call on `c`. Proved by tools/false-abbot.mjs.
export const ABBOT = {
  hp: 900, walk: 30, keep: 44, cd: 1.5, cdP2: 1.15,
  tell: { censer: 0.55, cast: 0.7, process: 0.9, coals: 0.75, rite: 1.5, knell: 1.0 },
  dmg: { censer: 20, cast: 16, reel: 10, process: 24, knell: 22 },
  censerR: 46,            // the chain's reach past his body
  castRange: 210,         // how far the censer is thrown
  castPull: 34,           // and how far the chain hauls HIM when it is guarded
  reelTo: 26,             // taken, it reels you to here beside him
  processSp: 86, processT: 1.7, processR: 26,
  coals: 5, coalStep: 22, coalLife: 3.4,
  bless: 6, mend: 0.3, blessR: 130, wardTake: 0.2,   // the rite: who it reaches, what it mends, how long it holds, and what a blow is worth against it
  downT: 4.2, downMul: 2,             // the bell's window, and what a blow is worth in it
  bellUnder: 40,                      // how near the bell he has to be for the note to find him
  adds: 3, addEvery: 6.5, addEveryP2: 4.2, daze: 2.2,
  order: ['censer', 'cast', 'process', 'censer', 'coals', 'cast', 'process', 'knell'],   /* the rite is NOT in here: it is his heartbeat, taken the moment the ward lapses */
};
/* EVERY MODE IS ITS KEY PLUS 'Tell' - no exceptions, because the one exception there was (coals -> coalTell) cost two
   debugging passes in the tool that reads them back. A convention with a hole in it is not a convention. */
const TELL = what => what + 'Tell';
const SAY = { censerTell: 'THE CENSER', castTell: 'THE CHAIN', processTell: 'HE PROCESSES: GET OVER HIM', coalsTell: 'THE COALS', riteTell: 'THE RITE', knellTell: 'HE RINGS IT HIMSELF' };
const RED = new Set(['processTell', 'coalsTell', 'knellTell']);
export const abbotOpen = e => e.mode === 'downed';
export const abbotBlessed = e => (e.blessT || 0) > 0;
/* WHAT A BLOW IS WORTH AGAINST HIM. Blessed, a fifth - the priest's blessing on a goblin is half, and half was
   measured (tools/false-abbot.mjs) to be no answer at all: a hero who simply swung killed him in NINETEEN SECONDS and
   never went near the bell, which would have made the whole opening decoration. A fifth is a WARD, not a tax, and it
   leaves him exactly two ways to be hurt - the bell's window, and the rite BROKEN on its windup. Double while down.
   AND DOWN IS WORTH THREE, NOT TWO. Measured in the page: a plain blow 10, a warded one 2, one in the bell's window 30 -
   because the game's own bonus for an OPEN foe stacks on top of this multiplier. That is deliberate and it is left
   alone: fifteen times a warded blow is the right price for a window you have to walk him into. It is written down
   here so that nobody reads `downMul: 2`, measures 3, and "fixes" the wrong end of it. */
export const abbotTake = e => abbotOpen(e) ? ABBOT.downMul : abbotBlessed(e) ? ABBOT.wardTake : 1;
/* the frames of bakeFalseAbbot: 0 idle | 1,2 walk | 3 censer tell | 4 censer | 5 cast tell | 6 cast | 7 haul
   8 procession tell | 9,10 procession | 11 coals tell | 12 coals | 13 rite tell | 14 rite | 15 knell | 16 downed | 17 hurt */
export function abbotFrame(e) {
  switch (e.mode) {
    case 'censerTell': return 3; case 'censer': return 4;
    case 'castTell': return 5; case 'cast': return 6; case 'haul': return 7;
    case 'processTell': return 8; case 'process': return 9 + Math.floor((e.anim || 0) * 6) % 2;
    case 'coalsTell': return 11; case 'coals': return 12;
    case 'riteTell': return 13; case 'rite': return 14; case 'spoiled': return 17;
    case 'knellTell': case 'knell': return 15;
    case 'downed': return 16;
    case 'sleep': case 'wake': return 0;
  }
  if (e.hurtT > 0) return 17;
  return Math.abs(e.vx || 0) > 3 ? 1 + Math.floor((e.anim || 0) * 5) % 2 : 0;
}
function begin(e, what, c) {
  e.mode = TELL(what); e.modeT = ABBOT.tell[what];
  if (what !== 'process') e.face = Math.sign(c.P.x - e.x) || e.face || 1;
  c.say(SAY[e.mode], RED.has(e.mode), what === 'rite');   /* the rite throws no blow, so it wears no mark: it says THE RITE instead */
  if (what === 'process') { e.procDir = Math.sign(c.P.x - e.x) || e.face || 1; e.face = e.procDir; }
}
/* THE BELL, RUNG BY THE PLAYER. Returns what the note did, so the world can say it: 'down' (he was under it),
   'cold' (he was not) - and a bell that finds him breaks every blessing on the roof at once. */
export function abbotBellRung(e, bellX, c) {
  if (!e || !e.alive) return 'cold';
  if (Math.abs(e.x - bellX) > ABBOT.bellUnder) return 'cold';
  e.mode = 'downed'; e.modeT = ABBOT.downT; e.open = ABBOT.downT; e.blessT = 0; e.vx = 0; e.cd = 0.4;
  if (c && c.breakBlessings) c.breakBlessings();
  if (c && c.dazeFlock) c.dazeFlock(ABBOT.daze);
  return 'down';
}
export function updateFalseAbbot(e, dt, c) {
  const { P, A, hit } = c, floor = A.floor;
  if (!e.alive || e.mode === 'sleep') return;
  e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.cd = (e.cd ?? 1) - dt; e.turn ??= 0;
  e.blessT = Math.max(0, (e.blessT || 0) - dt);
  e.addT = (e.addT ?? 2) - dt;
  e.open = abbotOpen(e) ? Math.max(0, e.modeT) : 0;
  const p2 = e.hp <= e.maxHp * 0.5;
  if (p2 && e.phase !== 2) { e.phase = 2; c.say('HE TAKES THE ROPE HIMSELF', true); c.sound('roar'); }
  e.y = floor;
  // ---- THE CONGREGATION, all the way through: it does not stop for his windups ----
  if (e.mode !== 'downed' && c.adds && c.summon) {
    if (e.addT <= 0) { e.addT = e.phase === 2 ? ABBOT.addEveryP2 : ABBOT.addEvery;
      if (c.adds() < ABBOT.adds) c.summon(); }
  }
  if (e.mode === 'wake') { if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = 0.9; } return; }
  // ---- THE OPENING: the note went through the rite and he is down ----
  if (e.mode === 'downed') { e.vx = 0; if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = 1.0; c.say('HE GETS UP', false); } return; }
  // ---- the windups ----
  if (e.mode.endsWith('Tell')) {
    if (e.mode !== 'processTell') e.face = Math.sign(P.x - e.x) || e.face;
    /* THE RITE BREAKS, exactly as the priest's does downstairs: a blow that staggers him mid-censer spills it and
       nobody is blessed. It is the OTHER answer to the ward - harder than the bell, because the congregation is on
       you and the windup is short, but it is there, and a player who finds it has earned it. */
    if (e.mode === 'riteTell' && e.stagger > 0) { e.mode = 'spoiled'; e.modeT = ABBOT.daze * 0.6; e.cd = ABBOT.cd;
      c.say('THE RITE BREAKS', false); c.sound('break'); return; }
    if (e.modeT > 0) return;
    if (e.mode === 'censerTell') { e.mode = 'censer'; e.modeT = 0.4; c.sound('whoosh');
      const dx = (P.x - e.x) * e.face;
      if (!P.dead && dx > -10 && dx < ABBOT.censerR && Math.abs(P.y - floor) < 32) { const r = hit(e.x, ABBOT.dmg.censer, false, 'THE CENSER'); if (r === 'hit') c.shove(e.face * 170, -120); }
      return; }
    if (e.mode === 'castTell') { e.mode = 'cast'; e.modeT = 0.45; e.castHit = false; e.castX = e.x + e.face * Math.min(ABBOT.castRange, Math.max(60, Math.abs(P.x - e.x) + 20)); c.sound('throw'); return; }
    if (e.mode === 'processTell') { e.mode = 'process'; e.modeT = ABBOT.processT; e.procHit = false; c.sound('heavy'); c.shake(2); return; }
    if (e.mode === 'coalsTell') { e.mode = 'coals'; e.modeT = 0.5; c.sound('puff');
      for (let i = 0; i < ABBOT.coals; i++) c.fire(e.x + e.face * (14 + i * ABBOT.coalStep), ABBOT.coalLife, i * 0.06);
      return; }
    if (e.mode === 'riteTell') { e.mode = 'rite'; e.modeT = 0.5; c.sound('bless');
      /* HE BLESSES HIMSELF TOO: that is the whole difference between him and the priest downstairs */
      e.blessT = ABBOT.bless; e.hp = Math.min(e.maxHp, e.hp + Math.ceil(e.maxHp * 0.04));
      const n = c.blessFlock ? c.blessFlock(ABBOT.blessR, ABBOT.bless, ABBOT.mend) : 0;
      c.say(n ? 'BLESSED' : 'HE BLESSES HIMSELF', false, true);
      return; }
    if (e.mode === 'knellTell') { e.mode = 'knell'; e.modeT = 0.6; c.sound('bell'); c.shake(6);
      if (!P.dead) hit(e.x, ABBOT.dmg.knell, true, 'THE KNELL');
      if (c.bellSpend) c.bellSpend();   /* he has used the room's one answer, and it is cold for a while */
      return; }
  }
  // ---- what the windups turned into ----
  if (e.mode === 'cast') {
    /* THE CHAIN. It goes out flat and comes back. GUARDED, it snaps taut on the boards and hauls HIM toward you -
       which is the whole reason to stand on the far side of the bell. TAKEN, it reels YOU in and the swing follows. */
    if (!e.castHit && !P.dead) { const lo = Math.min(e.x, e.castX), hi = Math.max(e.x, e.castX);
      if (P.x > lo - 8 && P.x < hi + 8 && Math.abs(P.y - floor) < 30) { e.castHit = true;
        /* FROM HIM, NOT FROM ITS HEAD. castX is thrown twenty pixels PAST you, so a blow said to come from there came from
           BEHIND a hero who was facing him - and the guard only turns what is in front. For its first day nobody could guard
           the chain at all, which is the one thing the fight asks of you (found by the lab pilot, 2026-09-23). */
        const r = hit(e.x, ABBOT.dmg.cast, false, 'THE CHAIN');
        if (r === 'blocked') { e.mode = 'haul'; e.modeT = 0.5;
          const to = e.x + e.face * ABBOT.castPull; e.x = Math.max(A.x0 + 20, Math.min(A.x1 - 20, to));
          c.say('THE CHAIN SNAPS TAUT: IT HAULS HIM', false); c.sound('clank'); c.shake(3); return; }
        if (r === 'hit') { c.reel(e.x + e.face * ABBOT.reelTo); }
      } }
    if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = e.phase === 2 ? ABBOT.cdP2 : ABBOT.cd; }
    return; }
  if (e.mode === 'haul' || e.mode === 'spoiled') { if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = e.mode === 'spoiled' ? ABBOT.cd : 0.5; } return; }
  if (e.mode === 'process') {
    /* A STRAIGHT LINE HE CANNOT TURN OUT OF. He walks it to the wall or to the end of his beat, and the censer
       whirls the whole way: nothing turns it, so you go over him or round him. */
    const nx = e.x + e.procDir * ABBOT.processSp * dt;
    e.x = Math.max(A.x0 + 16, Math.min(A.x1 - 16, nx)); e.vx = e.procDir * ABBOT.processSp;
    if (!P.dead && Math.abs(P.x - e.x) < ABBOT.processR && Math.abs(P.y - floor) < 26) {
      if (!e.procHit) { e.procHit = true; const r = hit(e.x, ABBOT.dmg.process, true, 'THE PROCESSION'); if (r) c.shove(e.procDir * 200, -170); } }
    else e.procHit = false;
    if (e.modeT <= 0 || e.x <= A.x0 + 16 || e.x >= A.x1 - 16) { e.mode = 'stalk'; e.vx = 0; e.cd = e.phase === 2 ? ABBOT.cdP2 : ABBOT.cd; }
    return; }
  if (e.mode === 'censer' || e.mode === 'coals' || e.mode === 'rite' || e.mode === 'knell') {
    if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = e.phase === 2 ? ABBOT.cdP2 : ABBOT.cd; } return; }
  // ---- PROCESSING: slow, heavy, always coming ----
  const d = P.x - e.x, ad = Math.abs(d); e.face = Math.sign(d) || e.face;
  const want = ad > ABBOT.keep ? e.face : 0, nx = e.x + want * ABBOT.walk * dt;
  if (nx > A.x0 + 20 && nx < A.x1 - 20) e.x = nx; e.vx = want * ABBOT.walk;
  if (e.cd > 0 || P.dead) return;
  /* THE RITE IS HIS HEARTBEAT, not one move in ten. Measured with it in the order (tools/false-abbot.mjs) he was warded
     about a quarter of the time and a hero who simply swung killed him in twenty seconds without going near the bell -
     the ward was a rounding error and the opening was decoration. He re-lights it the moment it lapses now, so the ward
     is his standing condition and the 1.5 s windup is the price he pays for it: that windup is the OTHER opening. */
  if ((e.blessT || 0) <= 0) { begin(e, 'rite', c); return; }
  let what = ABBOT.order[e.turn++ % ABBOT.order.length];
  if (what === 'censer' && ad > ABBOT.censerR + 26) what = 'cast';                 /* too far to swing: throw it */
  if (what === 'cast' && ad < 40) what = 'censer';                                  /* too close to throw: swing it */
  if (what === 'knell' && e.phase !== 2) what = 'coals';                            /* he does not touch the rope until he is hurt */
  if (what === 'knell' && c.bellCold && c.bellCold()) what = 'process';             /* nor while it is still ringing */
  begin(e, what, c);
}
/* his chain and its head, the line the procession will walk, the coals' warning, and the ring round him while he is down */
export function drawFalseAbbot(g, e, cx, cy, time, floorY) {
  if (!e?.alive) return;
  const fy = Math.round(floorY - cy), x = Math.round(e.x - cx);
  if (e.mode === 'processTell') { const k = 1 - Math.max(0, e.modeT) / ABBOT.tell.process, dir = e.procDir || e.face;
    g.globalAlpha = 0.25 + 0.45 * k; g.fillStyle = '#ff6b6b';
    g.fillRect(dir > 0 ? x : x - 150, fy - 3, 150, 2); g.globalAlpha = 1; }
  if (e.mode === 'coalsTell') { const k = 1 - Math.max(0, e.modeT) / ABBOT.tell.coals;
    for (let i = 0; i < ABBOT.coals; i++) { const bx = Math.round(x + e.face * (14 + i * ABBOT.coalStep));
      g.globalAlpha = (0.2 + 0.5 * k) * (1 - i * 0.12); g.fillStyle = '#ff9a3c'; g.fillRect(bx - 4, fy - 2, 8, 2); } g.globalAlpha = 1; }
  if (e.mode === 'cast' || e.mode === 'castTell' || e.mode === 'haul') {
    const to = e.mode === 'castTell' ? x + e.face * 18 : Math.round((e.castX ?? e.x) - cx), k = e.mode === 'haul' ? 0.4 : 1;
    g.globalAlpha = 0.85 * k; g.strokeStyle = '#8a8478'; g.lineWidth = 1; g.beginPath();
    g.moveTo(x + e.face * 6, fy - 22); g.lineTo(to, fy - 10); g.stroke();
    g.fillStyle = '#c9a44a'; g.fillRect(to - 3, fy - 13, 6, 6); g.fillStyle = '#f0dc8a'; g.fillRect(to - 3, fy - 13, 6, 1); g.globalAlpha = 1; }
  if (e.mode === 'censer' || e.mode === 'censerTell' || e.mode === 'process') {
    const k = e.mode === 'censerTell' ? 0.35 : 1; g.globalAlpha = 0.25 * k; g.strokeStyle = e.mode === 'process' ? '#ff6b6b' : '#ffd36b';
    g.lineWidth = 2; g.beginPath(); g.ellipse(x, fy - 16, e.mode === 'process' ? ABBOT.processR : ABBOT.censerR, 12, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; }
  if (abbotBlessed(e)) { const k = 0.5 + 0.5 * Math.sin(time * 5); g.globalAlpha = 0.20 + 0.18 * k; g.strokeStyle = '#e8a83a'; g.lineWidth = 2;
    g.beginPath(); g.ellipse(x, fy - 20, 20, 26, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; }
  if (e.mode === 'downed') { const k = 0.5 + 0.5 * Math.sin(time * 10); g.globalAlpha = 0.35 + 0.35 * k; g.strokeStyle = '#8fd160'; g.lineWidth = 2;
    g.beginPath(); g.ellipse(x, fy - 2, 28 + k * 3, 6, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; }
}
