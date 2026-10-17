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
  hp: 3000, walk: 30, keep: 44, cd: 1.5, cdP2: 1.15,
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
  if (e.orbFlash && (e.orbFlash.t += dt) > e.orbFlash.T) e.orbFlash = null;   /* the burst's gold flash (art only: it times nothing) */
  const o = e.orb; if (!o) return;
  o.t += dt; if (o.t < o.T) return;
  e.orb = null; e.orbFlash = { x: o.tx, t: 0, T: 0.4 }; const { P } = c, floor = c.A.floor;
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
/* the helpers of the belfry's art: a twisted hemp line, a little bronze bell with its clapper, a 4-point glint */
function twist(g, x0, y0, x1, y1, c1 = '#c8b088', c2 = '#8a6a3e') {
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
  for (let i = 0; i <= n; i++) { const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n);
    g.fillStyle = c1; g.fillRect(x, y, 2, 1); g.fillStyle = (i >> 1) & 1 ? c2 : c1; g.fillRect(x + 1, y, 1, 1); g.fillStyle = '#4a3418'; g.fillRect(x + 2, y, 1, 1); } }
function bronzeBell(g, x, y, sw, big) {   /* hung from (x,y), swinging sw px: a dome, a flared lip, the clapper */
  const k = big ? 1.5 : 1, h = Math.round(8 * k), w = Math.round(5 * k);
  const bx = x + sw, rows = [[-2, 2], [-3, 3], [-4, 4], [-4, 4], [-5, 5], [-6, 6]];
  g.fillStyle = '#2a1c0c'; g.fillRect(bx - w - 1, y + 1, 2 * w + 3, h + 2);
  for (let r = 0; r < h; r++) { const t = r / (h - 1), hw = Math.round(2 + t * (w - 2) + (r === h - 1 ? 1 : 0));
    g.fillStyle = '#9a7634'; g.fillRect(bx - hw, y + 2 + r, 2 * hw + 1, 1);
    g.fillStyle = '#c9a44a'; g.fillRect(bx - hw + Math.ceil(hw / 2), y + 2 + r, hw, 1);
    g.fillStyle = '#f0dc8a'; g.fillRect(bx + 1, y + 2 + r, 1, 1); }
  g.fillStyle = '#6a4a1e'; g.fillRect(bx - w - 1, y + h + 1, 2 * w + 3, 1);
  g.fillStyle = '#3a2a12'; g.fillRect(bx - 1 - Math.sign(sw), y + h + 2, 3, 2); }
function glint(g, x, y, c, r = 2) { g.fillStyle = c; g.fillRect(x, y - r, 1, 2 * r + 1); g.fillRect(x - r, y, 2 * r + 1, 1); }
/* THE BELFRY'S ROPES: each from an iron-strapped beam bracket over a little bronze bell, a twisted rope with a striped wool SALLY and a knotted tail -
   the one he is about to take JERKS and its bell swings and rings (the tell), the one he is on runs to his hands. Drawn whenever the belfry is. */
export function drawAbbotRopes(g, ropes, roofY, floorY, cx, cy, time, e) {
  const ry = Math.round(roofY - cy), fy = Math.round(floorY - cy);
  for (const r of ropes || []) {
    const x = Math.round(r - cx); if (x < -30 || x > g.canvas.width + 30) continue;
    const mine = e && e.alive && e.rope === r && (e.mode === 'swingTell' || e.mode === 'swing');
    const tell = mine && e.mode === 'swingTell', on = mine && e.mode === 'swing';
    const jerk = tell ? Math.round(Math.sin(time * 40) * 2) : 0;
    const idle = Math.round(Math.sin(time * 1.3 + r * 0.05) * 1);   /* a rope hangs, and breathes */
    /* the bracket: a timber stub off the roof with an iron strap and a pulley wheel */
    g.fillStyle = '#2a1c0c'; g.fillRect(x - 8, ry, 17, 6); g.fillStyle = '#5a3a22'; g.fillRect(x - 7, ry, 15, 4); g.fillStyle = '#7a5232'; g.fillRect(x - 7, ry, 15, 1);
    g.fillStyle = '#4a4a52'; g.fillRect(x - 7, ry + 2, 15, 1); g.fillStyle = '#8a8a96'; g.fillRect(x - 5, ry + 2, 1, 1); g.fillRect(x + 4, ry + 2, 1, 1);
    bronzeBell(g, x, ry + 4, tell ? jerk : idle, false);
    if (tell && Math.sin(time * 40) > 0.3) { glint(g, x - 9, ry + 12, '#ffe08a', 1); glint(g, x + 9, ry + 11, '#ffe08a', 1); }   /* it RINGS */
    const top = ry + 15 + (tell ? 0 : 0);
    if (on) {
      const hx = Math.round(e.x - cx), hy = Math.round(e.y - cy) - 52, sag = Math.round(Math.abs(hx - x) * 0.06);
      twist(g, x + jerk, top, (x + hx) / 2 + 1, (top + hy) / 2 + sag); twist(g, (x + hx) / 2 + 1, (top + hy) / 2 + sag, hx, hy);
    } else {
      const sx = x - jerk + idle * 0, sy = fy - 60;   /* the sally hangs at the height of a reaching hand */
      twist(g, x + jerk, top, sx, sy);
      g.fillStyle = '#2a1c0c'; g.fillRect(sx - 1, sy, 5, 15);
      for (let k = 0; k < 13; k++) { g.fillStyle = k % 4 < 2 ? '#8e3a32' : '#efe6d2'; g.fillRect(sx, sy + 1 + k, 3, 1); }
      g.fillStyle = '#5a1e1e'; g.fillRect(sx + 2, sy + 1, 1, 13);
      twist(g, sx, sy + 15, sx - jerk, fy - 44);
      g.fillStyle = '#2a1c0c'; g.fillRect(sx - jerk - 2, fy - 47, 7, 6); g.fillStyle = '#a88a5a'; g.fillRect(sx - jerk - 1, fy - 46, 5, 4); g.fillStyle = '#c8b088'; g.fillRect(sx - jerk, fy - 46, 2, 1);   /* the tail's knot */
    }
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
  /* THE SLAM: a gold shock ring and a second behind it, the boards dust thrown out both ways, spark flecks */
  if (e.mode === 'land' && e.modeT > ABBOT.landT - 0.4) { const k = (e.modeT - (ABBOT.landT - 0.4)) / 0.4, u = 1 - k;
    for (const [d, a0] of [[0, 0.7], [7, 0.4]]) { const rr = ABBOT.slamR + u * (14 + d);
      g.globalAlpha = a0 * k; g.strokeStyle = d ? '#ffe08a' : '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, fy - 1, rr, 5 + u * 2, 0, 0, Math.PI * 2); g.stroke(); }
    g.lineWidth = 1; g.globalAlpha = 0.8 * k; g.fillStyle = '#d8d0c0';
    for (let i = 0; i < 6; i++) { const dir = i < 3 ? -1 : 1, j = i % 3; g.fillRect(x + dir * (10 + u * (16 + j * 7)), fy - 3 - j * 2 - Math.round(u * 6), 3 - (j > 1), 2); }
    g.fillStyle = '#ffe08a'; for (let i = 0; i < 4; i++) g.fillRect(x + (i - 1.5) * 9 * (0.5 + u), fy - 6 - Math.round(Math.sin(u * 3 + i) * 8 * k) - i, 1, 1);
    g.globalAlpha = 1; }
  /* FALSE LIGHT: the censer flares a sickly gold in front of him, the mark follows you, and the ball arcs onto it */
  const SICK = '#d8d860', SICKL = '#f4f0a0', GOLD = '#ffe08a';
  const gl = (px_, py_, r, col, a0) => { const gr = g.createRadialGradient(px_, py_, 0, px_, py_, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(216,216,96,0)'); g.globalAlpha = a0; g.fillStyle = gr; g.beginPath(); g.arc(px_, py_, r, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; };
  if (e.mode === 'gleamTell') { const k = 1 - Math.max(0, e.modeT) / ABBOT.tell.gleam, p = 0.5 + 0.5 * Math.sin(time * 18);
    gl(x + (e.face || 1) * 19, fy - 55, 10 + 12 * k, SICKL, 0.3 + 0.4 * k * p);
    if (k > 0.3) for (let i = 0; i < 3; i++) glint(g, Math.round(x + (e.face || 1) * 19 + Math.cos(time * 5 + i * 2.1) * 12), Math.round(fy - 55 + Math.sin(time * 5 + i * 2.1) * 9), SICKL, 1);
    if (e.lightAim !== undefined) { const mx = Math.round(e.lightAim - cx);
      for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2 + time * 1.5; g.globalAlpha = 0.25 + 0.45 * k; g.fillStyle = SICK; g.fillRect(Math.round(mx + Math.cos(an) * ABBOT.lightR), Math.round(fy - 1 + Math.sin(an) * 4), 2, 1); }
      g.globalAlpha = (0.1 + 0.2 * k) * (0.6 + 0.4 * p); g.fillStyle = SICK; g.beginPath(); g.ellipse(mx, fy - 1, ABBOT.lightR, 4, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; } }
  if (e.orb) { const o = e.orb, s = Math.min(1, o.t / o.T), mx = Math.round(o.tx - cx), p = 0.5 + 0.5 * Math.sin(time * 22);
    /* the mark pulls TIGHT as the ball comes down: the outer ring is where it will burst, the inner ring is how long you have */
    g.lineWidth = 2; g.globalAlpha = 0.4 + 0.45 * s; g.strokeStyle = SICK; g.beginPath(); g.ellipse(mx, fy - 1, ABBOT.lightR, 4, 0, 0, Math.PI * 2); g.stroke();
    g.globalAlpha = 0.25 + 0.5 * s; g.strokeStyle = SICKL; g.lineWidth = 1; g.beginPath(); g.ellipse(mx, fy - 1, ABBOT.lightR * (1 - s) + 2, 4 * (1 - s) + 1, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
    const at = q => ({ x: Math.round(o.x0 + (o.tx - o.x0) * q - cx), y: Math.round(o.y0 + (floorY - 6 - o.y0) * q - ABBOT.lightUp * Math.sin(Math.PI * q) - cy) });
    for (let i = 5; i >= 1; i--) { const q = Math.max(0, s - i * 0.04), t = at(q), sm = i > 3 ? 1 : 0; g.globalAlpha = 0.5 - i * 0.08; g.fillStyle = i & 1 ? SICK : SICKL; g.fillRect(t.x - 2 + sm, t.y - 2 + sm, 5 - sm * 2, 5 - sm * 2); }
    const ob = at(s); g.globalAlpha = 1; gl(ob.x, ob.y, 13, SICKL, 0.55 + 0.2 * p);
    g.fillStyle = SICK; g.beginPath(); g.arc(ob.x, ob.y, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = SICKL; g.beginPath(); g.arc(ob.x, ob.y, 3, 0, Math.PI * 2); g.fill(); g.fillStyle = '#fffbe0'; g.fillRect(ob.x - 1, ob.y - 1, 2, 2);
    glint(g, ob.x + Math.round(Math.cos(time * 9) * 7), ob.y + Math.round(Math.sin(time * 9) * 7), '#fffbe0', 1); }
  /* THE BURST: a gold flash where it came down - a white-gold flare over the mark, a pillar of false light and a spray of sparks */
  if (e.orbFlash) { const f = e.orbFlash, k = 1 - f.t / f.T, u = f.t / f.T, mx = Math.round(f.x - cx);
    gl(mx, fy - 8, ABBOT.lightR * (0.9 + u * 0.7), '#fffbe0', 0.9 * k * k);
    g.globalAlpha = 0.85 * k; g.fillStyle = '#fffbe0'; g.fillRect(mx - Math.round(5 * k), fy - 52, Math.max(1, Math.round(10 * k)), 52); g.globalAlpha = 0.5 * k; g.fillStyle = GOLD; g.fillRect(mx - Math.round(9 * k), fy - 44, Math.max(1, Math.round(18 * k)), 44);
    g.globalAlpha = k; g.strokeStyle = GOLD; g.lineWidth = 2; g.beginPath(); g.ellipse(mx, fy - 1, ABBOT.lightR * (0.5 + u * 0.7), 5 * (0.5 + u * 0.7), 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1;
    g.fillStyle = SICKL; for (let i = 0; i < 10; i++) { const an = i / 10 * Math.PI, d = 8 + u * 28; g.fillRect(Math.round(mx + Math.cos(an) * d * (i & 1 ? 1 : -1)), Math.round(fy - 4 - Math.sin(an) * d * 0.9), 2, 2); }
    g.globalAlpha = 1; }
  /* THE RITE: a CIRCLE of candles on the boards, each a stub of wax with its drip and its flame, the front ones larger, and a ring of gold between them -
     lit one by one as he kneels; and the sanctus bell on its post behind him GLOWING - strike it */
  if (e.mode === 'riteTell' || e.mode === 'rite') {
    const lit = e.mode === 'riteTell' ? Math.min(1, (ABBOT.tell.rite - Math.max(0, e.modeT)) / 0.4) : 1;
    g.globalAlpha = 0.18 + 0.3 * lit; g.strokeStyle = '#e8a83a'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, fy - 2, 22, 4, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
    for (let i = 0; i < 8; i++) { if (i / 8 > lit) continue; const an = i / 8 * Math.PI * 2, sn = Math.sin(an), cxp = Math.round(x + Math.cos(an) * 22), cyp = Math.round(fy - 2 + sn * 4), big = sn > 0.2 ? 1 : 0, hgt = 5 + big * 2;
      const fl = Math.sin(time * 20 + i * 1.7) > 0;
      gl(cxp, cyp - hgt - 2, 7, '#ffd36b', 0.3 + 0.15 * (fl ? 1 : 0));
      g.fillStyle = '#2a1c0c'; g.fillRect(cxp - 2, cyp - hgt - 1, 4, hgt + 2); g.fillStyle = '#efe6d2'; g.fillRect(cxp - 1, cyp - hgt, 2, hgt); g.fillStyle = '#c9bda0'; g.fillRect(cxp, cyp - hgt, 1, hgt); g.fillRect(cxp - 1, cyp - 2 - (i & 1), 1, 2 + (i & 1));
      g.fillStyle = '#ff9a3c'; g.fillRect(cxp - 1, cyp - hgt - 3 - (fl ? 1 : 0), 2, 3); g.fillStyle = '#ffe08a'; g.fillRect(cxp, cyp - hgt - 2 - (fl ? 1 : 0), 1, 2); } }
  if (e.mode === 'riteTell' && e.sanctX !== undefined) { const sx = Math.round(e.sanctX - cx), p = 0.5 + 0.5 * Math.sin(time * 9), bx = sx + 4, by = fy - 22;
    g.fillStyle = '#2a1c0c'; g.fillRect(sx - 6, fy - 4, 13, 4); g.fillStyle = '#8a8a96'; g.fillRect(sx - 5, fy - 4, 11, 3); g.fillStyle = '#6a6a76'; g.fillRect(sx - 5, fy - 2, 11, 1);
    g.fillStyle = '#2a1c0c'; g.fillRect(sx - 2, fy - 31, 5, 28); g.fillStyle = '#5a3a22'; g.fillRect(sx - 1, fy - 30, 3, 26); g.fillStyle = '#7a5232'; g.fillRect(sx - 1, fy - 30, 1, 26);
    g.fillStyle = '#2a1c0c'; g.fillRect(sx - 2, fy - 32, 14, 5); g.fillStyle = '#5a3a22'; g.fillRect(sx - 1, fy - 31, 12, 3); g.fillStyle = '#4a4a52'; g.fillRect(sx + 9, fy - 31, 2, 3);
    g.fillStyle = '#2a1c0c'; g.fillRect(sx + 5, fy - 28, 2, 5);
    gl(bx, by, 16 + 4 * p, GOLD, 0.35 + 0.35 * p);
    bronzeBell(g, bx, fy - 27, Math.round(Math.sin(time * 9) * 1), true);
    for (let i = 0; i < 3; i++) if (Math.sin(time * 6 + i * 2.2) > 0.2) glint(g, Math.round(bx + Math.cos(time * 3 + i * 2.1) * 12), Math.round(by + Math.sin(time * 3 + i * 2.1) * 9), '#fffbe0', 1); }
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
