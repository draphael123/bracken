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
//   THE RITE          he kneels to pray, and it heals him and wards him and his own - unless you SPOIL it
//   THE BELL          ring it while he is under it and the note goes through the rite - every blessing on the roof
//                     breaks at once, the congregation is dazed, and he is DOWNED and takes double
//
// AND THE OPENING IS YOURS TO MAKE (tools/false-abbot.mjs proves it is CAUSED): the bell only answers with him under
// it, so the fight is about MOVING him there, and two of his own attacks are what move him -
//   THE CAST        guarded, the chain snaps taut on the boards and HE is hauled a step toward you: stand past the bell
//   THE BELL ROPE   he gets about the belfry on its ropes, and he always swings TOWARD you, landing on the spot you
//                   stood on: stand just past the great bell and he lands under it himself (claude/abbot2, in place of
//                   THE PROCESSION - Daniel 10-15: "he should get around using the bells")
// A bell rung with him anywhere else does nothing but put itself on cooldown.
//
//   CENSER      !   swung at head height, the chain's reach past his body: a shield turns it, and it shoves you
//   CAST        !   thrown flat and hauled back: guarded it pulls HIM, taken it reels YOU in with the swing behind
//   BELL ROPE   X   the rope jerks and its bell clangs, the spot you stand on is marked - he leaps, swings across the
//                   roof and comes down on it with a CENSER SLAM that nothing turns: move off the mark
//   FALSE LIGHT !   the censer raised and flaring a sickly gold, then a ball of false light lobbed onto a marked spot:
//                   move off it, or a shield turns the burst (claude/abbot2: his ranged answer to a hero who stands off)
//   COALS       X   the censer tipped: burning coals along the boards, and floor fire turns on no shield
//   THE RITE        HIS HEARTBEAT, taken the moment the ward lapses: he KNEELS in a ring of candles and prays, and a
//                   SANCTUS BELL on its post behind him GLOWS while he does. Left alone, the prayer HEALS him ~8% and
//                   wards him and his congregation. STRIKE THE SANCTUS BELL (the level's verb: what the monks built
//                   answers a blow) or PLUNGE onto him and the RITE IS SPOILED: no heal, no ward, a short stagger, and
//                   he cannot start it again for a while - he fights unwarded. A blow that staggers him on it still
//                   spoils it too. It throws no blow, so it wears no mark (the QUIET list).
//   THE KNELL   X   phase two: he rings the great bell HIMSELF. It hurts everything on the roof that is not blessed,
//                   and it puts the bell on cooldown - the price of letting him reach it.
// Touching him never hurts (the touch rule): his damage is the censer, the chain, the slam, the light, the coals and the knell.
//
// B15: warded he takes 0.4 (the floor), told by the clank and WARDED in main.js; down under the bell, double.
// PURE: no DOM, no main.js. Everything the world does is a call on `c`. Proved by tools/false-abbot.mjs.
export const ABBOT = {
  hp: 2700, walk: 30, keep: 44, cd: 1.5, cdP2: 1.15,
  tell: { censer: 0.55, cast: 0.7, swing: 0.8, gleam: 0.8, coals: 0.75, rite: 2.4, knell: 1.0 },
  dmg: { censer: 20, cast: 16, reel: 10, slam: 24, light: 16, knell: 22 },
  censerR: 46,            // the chain's reach past his body
  castRange: 210,         // how far the censer is thrown
  castPull: 34,           // and how far the chain hauls HIM when it is guarded
  reelTo: 26,             // taken, it reels you to here beside him
  farAt: 150, swingMin: 90, swingMax: 380, swingT: 0.8, swingH: 56, slamR: 30, landT: 0.7,   // THE BELL ROPE: how far he swings, how long in the air, how high, the slam's ring, and his recovery
  lightT: 0.8, lightR: 26, lightUp: 70,   // FALSE LIGHT: the lob's flight, the burst's ring, how high the arc
  coals: 5, coalStep: 22, coalLife: 3.4,
  bless: 6, mend: 0.3, blessR: 130, wardTake: 0.4, heal: 0.08,   // the rite: how long it holds, what it mends in his own, B15's floor while warded, and what it heals HIM
  sanctOff: 30,           // the sanctus bell's post, this far BEHIND him (away from the hero): go round him, or come down on him
  spoilT: 1.2, riteCd: 9, downCd: 4,   // a spoiled rite: the stagger, and how long before he can kneel again (and after the bell's window, how long he fights before he kneels)
  downT: 4.2, downMul: 2,             // the bell's window, and what a blow is worth in it
  bellUnder: 40,                      // how near the bell he has to be for the note to find him
  adds: 2, addsP2: 3, addEvery: 7.5, addEveryP2: 4.2, daze: 2.2,
  order: ['censer', 'cast', 'swing', 'gleam', 'censer', 'coals', 'cast', 'swing', 'gleam', 'knell'],   /* the rite is NOT in here: it is his heartbeat, taken the moment the ward lapses */
};
/* EVERY MODE IS ITS KEY PLUS 'Tell' - no exceptions, because the one exception there was (coals -> coalTell) cost two
   debugging passes in the tool that reads them back. A convention with a hole in it is not a convention. */
const TELL = what => what + 'Tell';
const SAY = { censerTell: 'THE CENSER', castTell: 'THE CHAIN', swingTell: 'THE BELL ROPE: OFF THE MARK', gleamTell: 'FALSE LIGHT', coalsTell: 'THE COALS', riteTell: 'HE PRAYS: STRIKE HIS BELL', knellTell: 'HE RINGS IT HIMSELF' };
const RED = new Set(['swingTell', 'coalsTell', 'knellTell']);
export const abbotOpen = e => e.mode === 'downed';
export const abbotBlessed = e => (e.blessT || 0) > 0;
export const abbotPraying = e => !!e && e.alive && e.mode === 'riteTell';
/* WHAT A BLOW IS WORTH AGAINST HIM. Blessed, B15's floor (0.4, told: main.js clanks WARDED); double while down - and the
   game's own bonus for an OPEN foe stacks on top of that, so a blow in the bell's window measures about three. That is
   deliberate and it is left alone: it is the right price for a window you have to walk him into. Written down here so
   that nobody reads `downMul: 2`, measures 3, and "fixes" the wrong end of it. */
export const abbotTake = e => abbotOpen(e) ? ABBOT.downMul : abbotBlessed(e) ? ABBOT.wardTake : 1;
/* THE SANCTUS BELL on its post while he prays: where it stands, for main.js's blow test and the bot (null when he is not praying) */
export const abbotSanctus = e => abbotPraying(e) && e.sanctX !== undefined ? { x: e.sanctX } : null;
/* THE RITE SPOILED, from the world: 'sanctus' (its bell struck) or 'plunge' (come down on him). Only while he prays;
   the update turns it into the stagger next frame, where it can say so. Returns whether it took. */
export function abbotSpoil(e, why) { if (!abbotPraying(e) || e.spoilBy) return false; e.spoilBy = why || 'sanctus'; return true; }
/* the frames of bakeFalseAbbot: 0 idle | 1,2 walk | 3 censer tell | 4 censer | 5 cast tell | 6 cast | 7 haul
   8 rope tell | 9 swinging | 10 slam (landed) | 11 coals tell | 12 coals | 13 kneeling prayer | 14 rite flare | 15 knell
   16 downed | 17 hurt | 18 false light tell | 19 false light thrown | 20 rite spoiled */
export const ABBOT_FRAMES = 21;
export function abbotFrame(e) {
  switch (e.mode) {
    case 'censerTell': return 3; case 'censer': return 4;
    case 'castTell': return 5; case 'cast': return 6; case 'haul': return 7;
    case 'swingTell': return 8; case 'swing': return 9; case 'land': return 10;
    case 'coalsTell': return 11; case 'coals': return 12;
    case 'riteTell': return 13; case 'rite': return 14; case 'spoiled': return 20;
    case 'knellTell': case 'knell': return 15;
    case 'gleamTell': return 18; case 'gleam': return 19;
    case 'downed': return 16;
    case 'sleep': case 'wake': return 0;
  }
  if (e.hurtT > 0) return 17;
  return Math.abs(e.vx || 0) > 3 ? 1 + Math.floor((e.anim || 0) * 5) % 2 : 0;
}
const clampX = (A, x, pad = 20) => Math.max((A.landLo ?? A.x0 + pad), Math.min((A.landHi ?? A.x1 - pad), x));
function begin(e, what, c) {
  const { P, A } = c;
  e.mode = TELL(what); e.modeT = ABBOT.tell[what];
  e.face = Math.sign(P.x - e.x) || e.face || 1;
  if (what === 'swing') {
    /* THE BELL ROPE, always TOWARD you, onto the spot you stand on: never shorter than swingMin, never past swingMax */
    const dir = e.face, d = Math.min(ABBOT.swingMax, Math.max(ABBOT.swingMin, Math.abs(P.x - e.x)));
    e.sw0 = e.x; e.swTo = clampX(A, e.x + dir * d);
    const mid = (e.sw0 + e.swTo) / 2, ropes = A.ropes || [];
    e.rope = ropes.length ? ropes.reduce((b, r) => Math.abs(r - mid) < Math.abs(b - mid) ? r : b, ropes[0]) : mid;
    c.sound('rope');   /* the rope jerks and its bell clangs FIRST: that is the tell, heard and drawn (drawFalseAbbot) */
  }
  if (what === 'gleam') e.lightAim = clampX(A, P.x);
  if (what === 'rite') e.sanctX = Math.max(A.x0 + 12, Math.min(A.x1 - 12, e.x - e.face * ABBOT.sanctOff));
  c.say(SAY[e.mode], RED.has(e.mode), what === 'rite');   /* the rite throws no blow, so it wears no mark: it says what to do instead */
}
/* THE BELL, RUNG BY THE PLAYER. Returns what the note did, so the world can say it: 'down' (he was under it),
   'cold' (he was not) - and a bell that finds him breaks every blessing on the roof at once. Swinging OVER it is not under it. */
export function abbotBellRung(e, bellX, c) {
  if (!e || !e.alive || e.mode === 'swing') return 'cold';
  if (Math.abs(e.x - bellX) > ABBOT.bellUnder) return 'cold';
  e.mode = 'downed'; e.modeT = ABBOT.downT; e.open = ABBOT.downT; e.blessT = 0; e.vx = 0; e.cd = 0.4; e.spoilBy = null;
  if (c && c.breakBlessings) c.breakBlessings();
  if (c && c.dazeFlock) c.dazeFlock(ABBOT.daze);
  return 'down';
}
/* the false light in flight: it goes on whatever he does next (it has left his hand), and bursts on its mark */
function stepOrb(e, dt, c) {
  const o = e.orb; if (!o) return;
  o.t += dt; if (o.t < o.T) return;
  e.orb = null; const { P } = c, floor = c.A.floor;
  c.sound('puff'); if (c.dust) c.dust(o.tx, floor);
  if (!P.dead && Math.abs(P.x - o.tx) < ABBOT.lightR && P.y > floor - 34) c.hit(o.x0, ABBOT.dmg.light, false, 'FALSE LIGHT');   /* from where it was thrown: the guard turns what is in front */
}
export function updateFalseAbbot(e, dt, c) {
  const { P, A, hit } = c, floor = A.floor;
  if (!e.alive || e.mode === 'sleep') return;
  e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.cd = (e.cd ?? 1) - dt; e.turn ??= 0;
  e.blessT = Math.max(0, (e.blessT || 0) - dt);
  e.riteCd = Math.max(0, (e.riteCd || 0) - dt);
  e.addT = (e.addT ?? 2) - dt;
  e.open = abbotOpen(e) ? Math.max(0, e.modeT) : 0;
  const p2 = e.hp <= e.maxHp * 0.5;
  if (p2 && e.phase !== 2) { e.phase = 2; c.say('HE TAKES THE ROPE HIMSELF', true); c.sound('roar'); }
  e.y = floor;
  stepOrb(e, dt, c);
  // ---- THE CONGREGATION, all the way through: it does not stop for his windups ----
  if (e.mode !== 'downed' && c.adds && c.summon) {
    if (e.addT <= 0) { e.addT = e.phase === 2 ? ABBOT.addEveryP2 : ABBOT.addEvery;
      if (c.adds() < (e.phase === 2 ? ABBOT.addsP2 : ABBOT.adds)) c.summon(); }
  }
  if (e.mode === 'wake') { if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = 0.9; } return; }
  // ---- THE OPENING: the note went through the rite and he is down ----
  if (e.mode === 'downed') { e.vx = 0; if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = 1.0; e.riteCd = Math.max(e.riteCd || 0, ABBOT.downCd); c.say('HE GETS UP', false); } return; }
  // ---- the windups ----
  if (e.mode.endsWith('Tell')) {
    /* he turns to you through every windup but two: on the rope he has already chosen where he lands, and on his knees
       he does not turn round - which is what leaves the sanctus bell behind him for you to go round to */
    if (e.mode !== 'swingTell' && e.mode !== 'riteTell') e.face = Math.sign(P.x - e.x) || e.face;
    if (e.mode === 'gleamTell') e.lightAim = clampX(A, P.x);   /* the mark follows you until he lets go */
    /* THE RITE SPOILED: its bell struck, or a plunge on him, or (the old way, kept) a blow that staggers him mid-prayer.
       No heal, no ward, a short stagger - and he cannot kneel again for a while, so he fights unwarded. */
    if (e.mode === 'riteTell' && (e.spoilBy || e.stagger > 0)) {
      e.mode = 'spoiled'; e.modeT = ABBOT.spoilT; e.cd = ABBOT.cd; e.riteCd = ABBOT.riteCd; e.vx = 0;
      c.say(e.spoilBy === 'plunge' ? 'RITE SPOILED: COME DOWN ON' : 'RITE SPOILED', false); c.sound('break'); c.shake(3);
      e.spoilBy = null; return; }
    if (e.modeT > 0) return;
    if (e.mode === 'censerTell') { e.mode = 'censer'; e.modeT = 0.4; c.sound('whoosh');
      const dx = (P.x - e.x) * e.face;
      if (!P.dead && dx > -10 && dx < ABBOT.censerR && Math.abs(P.y - floor) < 32) { const r = hit(e.x, ABBOT.dmg.censer, false, 'THE CENSER'); if (r === 'hit') c.shove(e.face * 170, -120); }
      return; }
    if (e.mode === 'castTell') { e.mode = 'cast'; e.modeT = 0.45; e.castHit = false; e.castX = e.x + e.face * Math.min(ABBOT.castRange, Math.max(60, Math.abs(P.x - e.x) + 20)); c.sound('throw'); return; }
    if (e.mode === 'swingTell') { e.mode = 'swing'; e.modeT = ABBOT.swingT; c.sound('whoosh'); return; }
    if (e.mode === 'gleamTell') { e.mode = 'gleam'; e.modeT = 0.35; c.sound('throw');
      e.orb = { x0: e.x + e.face * 8, y0: floor - 52, tx: e.lightAim ?? P.x, t: 0, T: ABBOT.lightT };
      return; }
    if (e.mode === 'coalsTell') { e.mode = 'coals'; e.modeT = 0.5; c.sound('puff');
      for (let i = 0; i < ABBOT.coals; i++) c.fire(e.x + e.face * (14 + i * ABBOT.coalStep), ABBOT.coalLife, i * 0.06);
      return; }
    if (e.mode === 'riteTell') { e.mode = 'rite'; e.modeT = 0.5; c.sound('bless');
      /* HE BLESSES HIMSELF TOO, and the prayer HEALS him: that is the whole difference between him and the priest downstairs */
      e.blessT = ABBOT.bless; e.hp = Math.min(e.maxHp, e.hp + Math.ceil(e.maxHp * ABBOT.heal));
      const n = c.blessFlock ? c.blessFlock(ABBOT.blessR, ABBOT.bless, ABBOT.mend) : 0;
      c.say(n ? 'BLESSED: HE IS MENDED' : 'HE IS MENDED AND WARDED', false, true);
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
  if (e.mode === 'swing') {
    /* ACROSS THE ROOF ON THE ROPE: from where he leapt to the mark, up through an arc, and down on it with the censer */
    const s = Math.min(1, 1 - Math.max(0, e.modeT) / ABBOT.swingT), k = s * s * (3 - 2 * s);
    e.x = e.sw0 + (e.swTo - e.sw0) * k; e.vx = 0; e.swLift = ABBOT.swingH * Math.sin(Math.PI * s); e.y = floor - e.swLift;
    if (e.modeT > 0) return;
    e.x = e.swTo; e.y = floor; e.swLift = 0; e.mode = 'land'; e.modeT = ABBOT.landT;
    c.sound('heavy'); c.shake(5); if (c.dust) c.dust(e.x, floor);
    if (!P.dead && Math.abs(P.x - e.x) < ABBOT.slamR && Math.abs(P.y - floor) < 34) { const r = hit(e.x, ABBOT.dmg.slam, true, 'THE CENSER SLAM'); if (r) c.shove((Math.sign(P.x - e.x) || e.face) * 190, -150); }
    return; }
  if (e.mode === 'haul' || e.mode === 'spoiled' || e.mode === 'land') { if (e.modeT <= 0) { const was = e.mode; e.mode = 'stalk'; e.cd = was === 'haul' ? 0.5 : e.phase === 2 ? ABBOT.cdP2 : ABBOT.cd; } return; }
  if (e.mode === 'censer' || e.mode === 'coals' || e.mode === 'rite' || e.mode === 'knell' || e.mode === 'gleam') {
    if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = e.phase === 2 ? ABBOT.cdP2 : ABBOT.cd; } return; }
  // ---- PROCESSING: slow, heavy, always coming ----
  const d = P.x - e.x, ad = Math.abs(d); e.face = Math.sign(d) || e.face;
  const want = ad > ABBOT.keep ? e.face : 0, nx = e.x + want * ABBOT.walk * dt;
  if (nx > A.x0 + 20 && nx < A.x1 - 20) e.x = nx; e.vx = want * ABBOT.walk;
  if (e.cd > 0 || P.dead) return;
  /* THE RITE IS HIS HEARTBEAT, not one move in ten. Measured with it in the order (tools/false-abbot.mjs) he was warded
     about a quarter of the time and a hero who simply swung killed him in twenty seconds without going near the bell -
     the ward was a rounding error and the opening was decoration. He kneels the moment it lapses - unless you spoiled
     the last one, and then he fights bare for a while (riteCd): that is what spoiling it buys you. */
  if ((e.blessT || 0) <= 0 && e.riteCd <= 0) { begin(e, 'rite', c); return; }
  let what = ABBOT.order[e.turn++ % ABBOT.order.length];
  if (what === 'censer' && ad > ABBOT.censerR + 26) what = 'cast';                 /* too far to swing: throw it */
  if (what === 'cast' && ad > ABBOT.castRange + 30) what = (e.far = !e.far) ? 'gleam' : 'swing';   /* too far to throw: the false light reaches, or he takes a rope to you - turn about */
  if (what === 'cast' && ad < 40) what = 'censer';                                  /* too close to throw: swing it */
  if (what === 'swing' && ad < ABBOT.swingMin) what = 'censer';                     /* close enough to hit: no need of the rope */
  if (what === 'gleam' && ad < 50) what = 'censer';
  if (what === 'knell' && e.phase !== 2) what = 'coals';                            /* he does not touch the rope until he is hurt */
  if (what === 'knell' && c.bellCold && c.bellCold()) what = 'swing';               /* nor while it is still ringing */
  if (what === 'swing' && ad < ABBOT.swingMin) what = 'censer';
  if (ad > ABBOT.farAt && what !== 'knell' && what !== 'swing' && what !== 'gleam') what = (e.far = !e.far) ? 'gleam' : 'swing';   /* FAR OFF, HE GETS ABOUT BY THE BELLS: a rope to you, or the false light - he does not walk the length of the belfry */
  begin(e, what, c);
}
/* THE BELFRY'S ROPES: each from the roof beam to head height with its little bell at the top - the one he is about to
   take JERKS and its bell swings (the tell), and the one he is on runs to his hands. Drawn whenever the belfry is. */
export function drawAbbotRopes(g, ropes, roofY, floorY, cx, cy, time, e) {
  const ry = Math.round(roofY - cy), fy = Math.round(floorY - cy);
  for (const r of ropes || []) {
    const x = Math.round(r - cx); if (x < -20 || x > g.canvas.width + 20) continue;
    const mine = e && e.alive && e.rope === r && (e.mode === 'swingTell' || e.mode === 'swing');
    const jerk = mine && e.mode === 'swingTell' ? Math.round(Math.sin(time * 40) * 2) : 0;
    g.fillStyle = '#6a4a2a'; g.fillRect(x - 6, ry, 13, 3);                                          // the beam's cleat
    g.fillStyle = '#c9a44a'; g.fillRect(x - 3 + jerk, ry + 3, 7, 5); g.fillStyle = '#f0dc8a'; g.fillRect(x - 3 + jerk, ry + 3, 7, 1);   // its bell
    g.strokeStyle = '#c8b088'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + jerk, ry + 8);
    if (mine && e.mode === 'swing') g.lineTo(Math.round(e.x - cx), Math.round(e.y - cy) - 52);
    else g.lineTo(x - jerk, fy - 44);
    g.stroke(); g.lineWidth = 1;
    if (!(mine && e.mode === 'swing')) { g.fillStyle = '#a88a5a'; g.fillRect(x - 2 - jerk, fy - 46, 4, 4); }   // the tail's knot
  }
}
/* his chain and its head, the rope's mark, the false light, the candle ring and the sanctus bell, and the ring round him while he is down */
export function drawFalseAbbot(g, e, cx, cy, time, floorY) {
  if (!e?.alive) return;
  const fy = Math.round(floorY - cy), x = Math.round(e.x - cx);
  /* THE BELL ROPE'S MARK: red, on the spot he will come down on, from the moment the rope jerks */
  if ((e.mode === 'swingTell' || e.mode === 'swing') && e.swTo !== undefined) {
    const k = e.mode === 'swing' ? 1 : 1 - Math.max(0, e.modeT) / ABBOT.tell.swing, mx = Math.round(e.swTo - cx), p = 0.5 + 0.5 * Math.sin(time * 14);
    g.globalAlpha = 0.3 + 0.5 * k; g.strokeStyle = '#ff6b6b'; g.lineWidth = 2;
    g.beginPath(); g.ellipse(mx, fy - 1, ABBOT.slamR, 5, 0, 0, Math.PI * 2); g.stroke();
    g.globalAlpha = (0.15 + 0.25 * k) * (0.6 + 0.4 * p); g.fillStyle = '#ff6b6b'; g.fillRect(mx - 2, fy - 6, 4, 6); g.lineWidth = 1; g.globalAlpha = 1; }
  if (e.mode === 'land' && e.modeT > ABBOT.landT - 0.25) { const k = (e.modeT - (ABBOT.landT - 0.25)) / 0.25;
    g.globalAlpha = 0.6 * k; g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, fy - 1, ABBOT.slamR + (1 - k) * 10, 5, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; }
  /* FALSE LIGHT: the censer flares a sickly gold over him, the mark follows you, and the ball arcs onto it */
  const SICK = '#d8d860', SICKL = '#f4f0a0';
  if (e.mode === 'gleamTell') { const k = 1 - Math.max(0, e.modeT) / ABBOT.tell.gleam, p = 0.5 + 0.5 * Math.sin(time * 18);
    g.globalAlpha = 0.25 + 0.45 * k * p; g.fillStyle = SICK; g.beginPath(); g.arc(x + (e.face || 1) * 4, fy - 62, 5 + 5 * k, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
    if (e.lightAim !== undefined) { const mx = Math.round(e.lightAim - cx); g.globalAlpha = 0.2 + 0.4 * k; g.strokeStyle = SICK; g.lineWidth = 1;
      g.beginPath(); g.ellipse(mx, fy - 1, ABBOT.lightR, 4, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; } }
  if (e.orb) { const o = e.orb, s = Math.min(1, o.t / o.T), mx = Math.round(o.tx - cx);
    g.globalAlpha = 0.45 + 0.4 * s; g.strokeStyle = SICK; g.lineWidth = 2; g.beginPath(); g.ellipse(mx, fy - 1, ABBOT.lightR, 4, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1;
    const ox = Math.round(o.x0 + (o.tx - o.x0) * s - cx), oy = Math.round(o.y0 + (floorY - 6 - o.y0) * s - ABBOT.lightUp * Math.sin(Math.PI * s) - cy);
    g.globalAlpha = 0.35; g.fillStyle = SICK; g.beginPath(); g.arc(ox, oy, 7, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 1; g.fillStyle = SICKL; g.beginPath(); g.arc(ox, oy, 3, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
  /* THE RITE: a ring of candles round him on the boards, and the sanctus bell on its post behind him GLOWING - strike it */
  if (e.mode === 'riteTell' || e.mode === 'rite') {
    const lit = e.mode === 'riteTell' ? Math.min(1, (ABBOT.tell.rite - Math.max(0, e.modeT)) / 0.4) : 1;
    for (let i = 0; i < 8; i++) { const an = i / 8 * Math.PI * 2, cxp = Math.round(x + Math.cos(an) * 22), cyp = Math.round(fy - 2 + Math.sin(an) * 4);
      if (i / 8 > lit) continue; g.fillStyle = '#efe6d2'; g.fillRect(cxp, cyp - 4, 2, 4); g.fillStyle = Math.sin(time * 20 + i) > 0 ? '#ffd36b' : '#ff9a3c'; g.fillRect(cxp, cyp - 6, 2, 2); } }
  if (e.mode === 'riteTell' && e.sanctX !== undefined) { const sx = Math.round(e.sanctX - cx), p = 0.5 + 0.5 * Math.sin(time * 9);
    g.fillStyle = '#5a3a22'; g.fillRect(sx - 1, fy - 26, 3, 26); g.fillRect(sx - 4, fy - 26, 9, 2);              // the post and its arm
    g.globalAlpha = 0.25 + 0.35 * p; g.fillStyle = '#ffe08a'; g.beginPath(); g.arc(sx + 3, fy - 20, 8, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;   // IT GLOWS
    g.fillStyle = '#e8a83a'; g.fillRect(sx + 1, fy - 23, 5, 5); g.fillStyle = '#ffe08a'; g.fillRect(sx + 1, fy - 23, 5, 1); g.fillRect(sx + 3, fy - 18, 1, 1); }
  if (e.mode === 'cast' || e.mode === 'castTell' || e.mode === 'haul') {
    const to = e.mode === 'castTell' ? x + e.face * 18 : Math.round((e.castX ?? e.x) - cx), k = e.mode === 'haul' ? 0.4 : 1;
    g.globalAlpha = 0.85 * k; g.strokeStyle = '#8a8478'; g.lineWidth = 1; g.beginPath();
    g.moveTo(x + e.face * 6, fy - 22); g.lineTo(to, fy - 10); g.stroke();
    g.fillStyle = '#c9a44a'; g.fillRect(to - 3, fy - 13, 6, 6); g.fillStyle = '#f0dc8a'; g.fillRect(to - 3, fy - 13, 6, 1); g.globalAlpha = 1; }
  if (e.mode === 'censer' || e.mode === 'censerTell') {
    const k = e.mode === 'censerTell' ? 0.35 : 1; g.globalAlpha = 0.25 * k; g.strokeStyle = '#ffd36b';
    g.lineWidth = 2; g.beginPath(); g.ellipse(x, fy - 16, ABBOT.censerR, 12, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; }
  if (e.mode === 'coalsTell') { const k = 1 - Math.max(0, e.modeT) / ABBOT.tell.coals;
    for (let i = 0; i < ABBOT.coals; i++) { const bx = Math.round(x + e.face * (14 + i * ABBOT.coalStep));
      g.globalAlpha = (0.2 + 0.5 * k) * (1 - i * 0.12); g.fillStyle = '#ff9a3c'; g.fillRect(bx - 4, fy - 2, 8, 2); } g.globalAlpha = 1; }
  if (abbotBlessed(e)) { const k = 0.5 + 0.5 * Math.sin(time * 5), y = Math.round(e.y - cy); g.globalAlpha = 0.20 + 0.18 * k; g.strokeStyle = '#e8a83a'; g.lineWidth = 2;
    g.beginPath(); g.ellipse(x, y - 20, 20, 26, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; }
  if (e.mode === 'downed') { const k = 0.5 + 0.5 * Math.sin(time * 10); g.globalAlpha = 0.35 + 0.35 * k; g.strokeStyle = '#8fd160'; g.lineWidth = 2;
    g.beginPath(); g.ellipse(x, fy - 2, 28 + k * 3, 6, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; }
}
