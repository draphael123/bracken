// false-abbot.js — THE FALSE ABBOT, the Monastery's boss (2026-09-22), in place of the Roc. Brief: docs/briefs/false-abbot.md.
// A goblin in the abbot's cope and mitre, twice the priest's size, with the abbot's censer on a long chain. Fought in the
// BELFRY with its roof ON (the Roc is what used to tear it off).
//
// THE FALSE ABBOT 3: "THE HOUSE ANSWERS THE BLOW" (claude/abbot3, Daniel 10-26, scratch/brief-abbot3-1026.md). The level's
// rule is WHAT THE MONKS BUILT STILL ANSWERS A BLOW, and the old fight used one piece of it (lure him under the great bell).
// Now his WARD COMES FROM THE HOUSE - its bells, his chair, its wheel glow while they bless him - and each phase the house
// is turned on him with the verb the level taught (strike a bell, ride a basket, turn a wheel / ride the smoke):
//   P1 THE BELL BRIDGES   (hp > 66%) the belfry is two towers and the great bell's gallery, joined by BRIDGES HUNG FROM BELLS.
//                         He takes his ropes up onto them to chase you, and he KNEELS MID-BRIDGE to pray, its bell glowing over
//                         him. STRIKE THE BRIDGE'S BELL (it hangs under its tower, at your height) with him on the bridge: the
//                         bridge drops with him and he lands STUNNED below = THE OPENING. The bridges are hauled back (told).
//   P2 THE CHAIR          (66-33%) he cuts his bridges and takes HIS CHAIR, hung high on a rope with a BASKET on the other end:
//                         he prays up there, out of reach. RIDE THE BASKET DOWN: the chair comes down and spills him out =
//                         THE OPENING (the goblin who stole the chair is thrown out of it).
//   P3 THE WHEEL + SMOKE  (< 33%) he prays at the PRAYER WHEEL under the gallery, his censer set down and smoking. STRIKE THE
//                         WHEEL and its stair turns up over him (and the rite is spoiled); RIDE HIS SMOKE up; and PLUNGE on
//                         him = THE OPENING. Beaten down at the end (5%), THE GREAT BELL is the last blow: ring it and he is done.
// KEPT: his whole kit (censer, chain, bell rope, false light, coals, knell, the rite as his heartbeat, the congregation).
// GONE: 'stand past the great bell and bait him under it' and the sanctus bell post (the house's devices took their places).
//
//   CENSER      !   swung at head height, the chain's reach past his body: a shield turns it, and it shoves you
//   CAST        !   thrown flat and hauled back: guarded it pulls HIM, taken it reels YOU in with the swing behind
//   BELL ROPE   X   the rope jerks and its bell clangs, the spot you stand on is marked - he leaps, swings across the
//                   roof (up onto a bridge or a tower if that is where you are) and comes down on it with a CENSER SLAM
//   FALSE LIGHT !   the censer raised and flaring a sickly gold, then a ball of false light lobbed onto a marked spot
//   COALS       X   the censer tipped: burning coals along the boards, and floor fire turns on no shield
//   THE RITE        HIS HEARTBEAT, taken the moment the ward lapses, AT THE PHASE'S DEVICE (bridge / chair / wheel): told by
//                   the device glowing, the candles and the words. Left alone it HEALS him ~8% and wards him (B15's 0.4).
//   THE KNELL   X   phase two on: he rings the great bell HIMSELF - it hurts everything on the roof that is not blessed.
// Touching him never hurts (the touch rule).
//
// B15: warded he takes 0.4 (the floor), told by the clank and WARDED in main.js; downed by the house, double.
// PURE: no DOM, no main.js. Everything the world does is a call on `c`; the house's layout is c.A.house (pixels, built by
// main.js from the level's arena.house). Proved by tools/false-abbot.mjs.
export const ABBOT = {
  hp: 3700, walk: 30, keep: 44, cd: 1.5, cdP2: 1.15,
  tell: { censer: 0.7, cast: 0.7, swing: 0.8, gleam: 0.8, coals: 0.75, rite: 2.6, knell: 1.0 },
  riteT: [3.2, 3.2, 5.0, 3.4],   /* the rite's windup by phase: on the bridge 3.2 s, in the chair 5 s (the basket is by the great bell), at the wheel 3.4 s - a hero walks ~56 px/s, and the house is a room wide */
  dmg: { censer: 15, cast: 12, reel: 10, slam: 24, light: 16, knell: 22 },   /* (claude/abbot3: censer 20, cast 16 - the short blades fight inside his chain's reach and wore every swing of it) */
  censerR: 46,            // the chain's reach past his body
  castRange: 210,         // how far the censer is thrown
  castPull: 34,           // and how far the chain hauls HIM when it is guarded
  reelTo: 26,             // taken, it reels you to here beside him
  farAt: 150, swingMin: 90, swingMax: 380, swingT: 0.8, swingH: 56, slamR: 30, landT: 0.7,   // THE BELL ROPE: how far he swings, how long in the air, how high, the slam's ring, and his recovery
  lightT: 0.8, lightR: 26, lightUp: 70,   // FALSE LIGHT: the lob's flight, the burst's ring, how high the arc
  coals: 5, coalStep: 22, coalLife: 3.4, coalFrom: 34,   /* (claude/abbot3) the line starts a stride out: it punishes standing off him, not the blade at his elbow */
  bless: 6, mend: 0.3, blessR: 130, wardTake: 0.4, heal: 0.08,   // the rite: how long it holds, what it mends in his own, B15's floor while warded, and what it heals HIM
  spoilT: 1.2, riteCd: 9, downCd: 4,   // a spoiled rite: the stagger, and how long before he can kneel again (and after an opening, how long he fights before he kneels)
  downT: 4.2, downMul: 2,             // THE OPENING (the house turned on him), and what a blow is worth in it
  p2At: 0.66, p3At: 0.33,             // the phases: bridges, chair, wheel
  fallG: 900, rehang: 6.5, rehangTell: 1.4,   // a dropped bridge: his fall, how long till it is hauled back, and how long the haul is told
  spillAt: 0.85,                      // how far the basket has to come down before his chair spills him
  smokeW: 12, smokeH: 150, smokeLift: 200,   // P3: his censer's smoke column, set down beside him at the wheel - it LIFTS you
  beatAt: 0.05, beatT: 8, beatCd: 10, beatTake: 0.4,   // THE FINALE: beaten down at 5% he kneels 8 s; blades are worth B15's floor, the great bell ends him
  adds: 2, addsP2: 2, addEvery: 8, addEveryP2: 6, daze: 2.2,   /* (claude/abbot3: P2 3 every 4.2 s - the knight died to sprigs while he walked to the basket: the house is the fight, not his congregation) */
  order: ['censer', 'cast', 'swing', 'gleam', 'censer', 'coals', 'cast', 'swing', 'gleam', 'knell'],   /* the rite is NOT in here: it is his heartbeat, taken the moment the ward lapses */
};
/* EVERY MODE IS ITS KEY PLUS 'Tell' - no exceptions, because the one exception there was (coals -> coalTell) cost two
   debugging passes in the tool that reads them back. A convention with a hole in it is not a convention. */
const TELL = what => what + 'Tell';
const SAY = { censerTell: 'THE CENSER', castTell: 'THE CHAIN', swingTell: 'THE BELL ROPE: OFF THE MARK', gleamTell: 'FALSE LIGHT', coalsTell: 'THE COALS', knellTell: 'HE RINGS IT HIMSELF' };
/* (claude/abbotp2, Daniel 10-29: "it needs to be clear in phase 2 how you actually hurt him") P2's three lines are routed (src/hint-lines.js CALL_LINES) and said in the hint box; P1 and P3 keep theirs as they were */
export const CHAIR_SAY = { cut: 'HE CUTS HIS BRIDGES: TO HIS CHAIR', ride: 'RIDE HIS BASKET DOWN: THE CHAIR COMES WITH IT', spill: 'HIS CHAIR COMES DOWN: HE IS THROWN OUT' };
const RITE_SAY = ['', 'HE PRAYS ON THE BRIDGE: STRIKE ITS BELL', CHAIR_SAY.ride, 'HE PRAYS AT THE WHEEL: COME DOWN ON HIM'];
const RED = new Set(['swingTell', 'coalsTell', 'knellTell']);
/* THE OPENING: the house has turned on him (downed), or he is falling with it */
export const abbotOpen = e => e.mode === 'downed' || e.mode === 'fall';
export const abbotBlessed = e => (e.blessT || 0) > 0;
/* IN HIS CHAIR: hung high on the basket rope, a blow (a bolt, an arrow) that finds him there is turned by the chair's gilt - B15's floor, told (WARDED), never a wall. The answer is the basket. */
export const abbotInChair = e => !!e && e.alive && e.deck === 'chair' && e.mode !== 'fall' && e.mode !== 'downed' && e.mode !== 'beaten';
export const abbotPraying = e => !!e && e.alive && e.mode === 'riteTell';
export const abbotBeaten = e => !!e && e.alive && e.mode === 'beaten';
/* WHAT A BLOW IS WORTH AGAINST HIM. Blessed, B15's floor (0.4, told: main.js clanks WARDED); double while down - and the
   game's own bonus for an OPEN foe stacks on top of that, so a blow in the window measures about three. Beaten down at the
   end, the floor again: the great bell is the last blow, the blade only the slow way to it (never nothing - B15). */
export const abbotTake = e => abbotOpen(e) ? ABBOT.downMul : abbotBeaten(e) ? ABBOT.beatTake : (abbotBlessed(e) || abbotInChair(e)) ? ABBOT.wardTake : 1;
/* (kept for old callers: the sanctus bell is gone - the house's devices took its place) */
export const abbotSanctus = () => null;
/* THE RITE SPOILED, from the world: 'plunge' (come down on him) or 'wheel' (its wheel struck). Only while he prays;
   the update turns it into the stagger next frame, where it can say so. Returns whether it took. In phase three a plunge
   on him praying OR warded is more than a spoil: it is THE OPENING (abbotPlunge). */
export function abbotSpoil(e, why) { if (!abbotPraying(e) || e.spoilBy) return false; e.spoilBy = why || 'plunge'; return true; }
/* the frames of bakeFalseAbbot: 0 idle | 1,2 walk | 3 censer tell | 4 censer | 5 cast tell | 6 cast | 7 haul
   8 rope tell | 9 swinging | 10 slam (landed) | 11 coals tell | 12 coals | 13 kneeling prayer | 14 rite flare | 15 knell
   16 downed | 17 hurt | 18 false light tell | 19 false light thrown | 20 rite spoiled | 21 fall | 22 beaten */
export const ABBOT_FRAMES = 23;
export function abbotFrame(e) {
  switch (e.mode) {
    case 'censerTell': return 3; case 'censer': return 4;
    case 'castTell': return 5; case 'cast': return 6; case 'haul': return 7;
    case 'swingTell': return 8; case 'swing': return 9; case 'land': return 10;
    case 'coalsTell': return 11; case 'coals': return 12;
    case 'riteTell': return 13; case 'rite': return 14; case 'spoiled': return 20;
    case 'knellTell': case 'knell': return 15;
    case 'gleamTell': return 18; case 'gleam': return 19;
    case 'downed': return 16; case 'beaten': return 22; case 'fall': return 21;
    case 'sleep': case 'wake': return 0;
  }
  if (e.hurtT > 0) return 17;
  return Math.abs(e.vx || 0) > 3 ? 1 + Math.floor((e.anim || 0) * 5) % 2 : 0;
}
const clampX = (A, x, pad = 20) => Math.max((A.landLo ?? A.x0 + pad), Math.min((A.landHi ?? A.x1 - pad), x));

/* ---------- THE HOUSE: where he can stand ----------
   H = c.A.house (pixels): { deckY, spans: [[x0,x1]..] the tower decks and the great bell's gallery (always there),
   bridges: [{x0,x1,bells:[x..]}], chairX, chairY, basketX, wheels: [{x, spotX, smokeX}], bellX }. Without a house (old rigs) he is
   the old floor-only Abbot. e.br[i]: bridge i is hung; e.brGone: phase two cut them for good. */
const house = c => c.A && c.A.house;
export function abbotHighSpans(e, H) {
  if (!H) return [];
  const iv = H.spans.map(s => [s[0], s[1]]);
  (H.bridges || []).forEach((b, i) => { if (bridgeUp(e, i)) iv.push([b.x0, b.x1]); });
  iv.sort((a, b) => a[0] - b[0]); const out = [];
  for (const s of iv) { const l = out[out.length - 1]; if (l && s[0] <= l[1] + 2) l[1] = Math.max(l[1], s[1]); else out.push(s.slice()); }
  return out;
}
export const bridgeUp = (e, i) => !e.brGone && (!e.br || e.br[i] !== false);
const spanAt = (e, H, x) => abbotHighSpans(e, H).find(s => x >= s[0] - 2 && x <= s[1] + 2) || null;
/* where the hero is: on the high boards (a tower, a bridge, the gallery), or on the floor (in the air counts as below you) */
export function abbotLevelOf(e, H, P, floor) {
  if (H && P.ground !== false && Math.abs(P.y - H.deckY) < 6 && spanAt(e, H, P.x)) return 'high';
  return 'floor';
}
/* the chair's height now: up at chairY, down at the floor as the basket comes down (c.basketK 0..1) */
export const abbotChairY = (H, floor, k) => H.chairY + (floor - 6 - H.chairY) * Math.max(0, Math.min(1, k || 0));
/* SWING HIM TO a place: { x, y, deck } - the bell rope takes him up as well as across */
function goTo(e, c, to, rite) { e.swGoal = { ...to, rite: !!rite }; begin(e, 'swing', c); }
function placeFor(e, c, P) {   /* where a rope to the hero puts him: on the boards you stand on, or the floor under you */
  const H = house(c), floor = c.A.floor;
  if (H && abbotLevelOf(e, H, P, floor) === 'high') { const s = spanAt(e, H, P.x); return { x: Math.max(s[0] + 6, Math.min(s[1] - 6, P.x)), y: H.deckY, deck: 'high' }; }
  return { x: P.x, y: floor, deck: 'floor' };
}
/* HE FALLS WITH IT: off a dropped bridge, out of a dropped chair - the house has answered the blow, and he lands STUNNED */
function drop(e, c, why) {
  e.mode = 'fall'; e.modeT = 2; e.vy = 0; e.vx = 0; e.blessT = 0; e.spoilBy = null; e.deck = 'floor'; e.fallWhy = why;
  e.houseN = (e.houseN || 0) + 1;
  if (c.breakBlessings) c.breakBlessings();
  c.say(why, false); c.sound('break'); c.shake(4);
}
function downed(e, c) {
  e.smoke = null; e.mode = 'downed'; e.modeT = ABBOT.downT; e.open = ABBOT.downT; e.blessT = 0; e.vx = 0; e.vy = 0; e.cd = 0.4; e.spoilBy = null; e.y = c.A.floor; e.deck = 'floor';
  if (c.dazeFlock) c.dazeFlock(ABBOT.daze);
  c.sound('heavy'); c.shake(6); if (c.dust) c.dust(e.x, c.A.floor);
  c.say('THE HOUSE ANSWERS THE BLOW', false);
}
function begin(e, what, c) {
  const { P, A } = c;
  e.mode = TELL(what); e.modeT = what === 'rite' ? (ABBOT.riteT[e.phase || 1] ?? ABBOT.tell.rite) : ABBOT.tell[what];
  e.face = Math.sign(P.x - e.x) || e.face || 1;
  if (what === 'swing') {
    /* THE BELL ROPE, always TOWARD you, onto the spot you stand on - or, with a goal (his rite's place, the boards you
       climbed to), onto that: up onto a bridge or a tower as readily as across the floor */
    const to = e.swGoal || placeFor(e, c, P);
    let tx;
    if (e.swGoal) tx = to.x;
    else if (to.deck === 'high') tx = to.x;
    else if (e.deck !== 'floor') tx = clampX(A, to.x);   /* down off the boards: onto the spot under you */
    else { const dir = e.face, d = Math.min(ABBOT.swingMax, Math.max(ABBOT.swingMin, Math.abs(P.x - e.x))); tx = clampX(A, e.x + dir * d); }
    e.sw0 = e.x; e.swY0 = e.y; e.swTo = tx; e.swY = to.y ?? A.floor; e.swDeck = to.deck || 'floor'; e.swRite = !!(e.swGoal && e.swGoal.rite);
    e.face = Math.sign(e.swTo - e.x) || e.face;
    e.swGoal = null;
    const mid = (e.sw0 + e.swTo) / 2, ropes = A.ropes || [];
    e.rope = ropes.length ? ropes.reduce((b, r) => Math.abs(r - mid) < Math.abs(b - mid) ? r : b, ropes[0]) : mid;
    c.sound('rope');   /* the rope jerks and its bell clangs FIRST: that is the tell, heard and drawn (drawFalseAbbot) */
  }
  if (what === 'gleam') { e.lightAim = clampX(A, P.x); e.lightY = P.ground === false ? A.floor : P.y; }
  if (what === 'rite') { e.riteAt = e.phase || 1; if (e.riteAt === 3 && house(c)) { const w = house(c).wheels[e.riteWheel || 0]; e.smoke = { x: w.smokeX }; } }
  c.say(what === 'rite' ? RITE_SAY[e.riteAt] || 'HE PRAYS' : SAY[e.mode], RED.has(e.mode), what === 'rite');   /* the rite throws no blow, so it wears no mark: it says what to do instead */
}
/* THE GREAT BELL, RUNG BY THE PLAYER. It is the LAST BLOW now (Daniel 10-26: "rung once he is beaten down - not the whole
   fight"): beaten down, the note goes through him and he is done ('finish'). Any other time it only rings ('cold'). */
export function abbotBellRung(e, bellX, c) {
  if (!e || !e.alive) return 'cold';
  if (e.mode === 'beaten') { e.finished = true; return 'finish'; }
  return 'cold';
}
/* P1: A BRIDGE'S BELL, STRUCK (the world calls this with the bridge's index). The bridge drops - and with him on it, he
   goes with it. Returns 'him' | 'empty' | 'down' (it was already down) | 'gone' (phase two cut them). */
export function abbotBridgeBell(e, i, c) {
  const H = house(c); if (!H || !H.bridges[i]) return 'empty';
  if (e.brGone) return 'gone';
  e.br = e.br || H.bridges.map(() => true); e.brT = e.brT || H.bridges.map(() => 0);
  if (!e.br[i]) return 'down';
  e.br[i] = false; e.brT[i] = ABBOT.rehang; if (c.bridge) c.bridge(i, false);
  const b = H.bridges[i];
  if (e.alive && e.mode !== 'sleep' && e.deck === 'high' && e.mode !== 'swing' && e.mode !== 'fall' && e.x >= b.x0 - 6 && e.x <= b.x1 + 6 && !spanAt(e, H, e.x)) { drop(e, c, 'THE BRIDGE GOES WITH HIM'); return 'him'; }
  return 'empty';
}
/* P3: THE WHEEL, STRUCT while he prays at it: the rite is spoiled (and the world turns its stair up over him) */
export function abbotWheelStruck(e, i) { if (abbotPraying(e) && e.riteAt === 3 && (i === undefined || i === (e.riteWheel || 0))) return abbotSpoil(e, 'wheel'); return false; }
/* P3: COME DOWN ON HIM. A plunge on him praying, or warded, in phase three is THE OPENING - the smoke and the wheel's stair
   were the way up to it. (In phases one and two a plunge on him praying spoils the rite, as it always did.) */
export function abbotPlunge(e, c) {
  if (!e || !e.alive) return false;
  if ((e.phase || 1) === 3 && (abbotPraying(e) || abbotBlessed(e)) && !abbotOpen(e) && e.mode !== 'beaten') { e.smoke = null; e.houseN = (e.houseN || 0) + 1; downed(e, c); c.say('COME DOWN ON HIM: THE RITE BREAKS', false); return true; }
  return abbotSpoil(e, 'plunge');
}
/* THE FINALE'S FLOOR: in phase three a blow that would take him under 5% beats him DOWN instead (he kneels at that
   floor, and the great bell is the last blow). Once a window, then he can die to the blade too (beatCd) - never a wall. */
export function abbotClamp(e, dmg) {
  if (!e || (e.phase || 1) !== 3 || e.mode === 'beaten' || (e.beatCd || 0) > 0) return dmg;
  const fl = Math.ceil(e.maxHp * ABBOT.beatAt);
  if (e.hp - dmg < fl) { e.beatNow = true; return Math.max(0, e.hp - fl); }
  return dmg;
}
/* the false light in flight: it goes on whatever he does next (it has left his hand), and bursts on its mark */
function stepOrb(e, dt, c) {
  if (e.orbFlash && (e.orbFlash.t += dt) > e.orbFlash.T) e.orbFlash = null;   /* the burst's gold flash (art only: it times nothing) */
  const o = e.orb; if (!o) return;
  o.t += dt; if (o.t < o.T) return;
  e.orb = null; const ty = o.ty ?? c.A.floor; e.orbFlash = { x: o.tx, y: ty, t: 0, T: 0.4 }; const { P } = c;
  c.sound('puff'); if (c.dust) c.dust(o.tx, ty);
  if (!P.dead && Math.abs(P.x - o.tx) < ABBOT.lightR && P.y > ty - 34 && P.y < ty + 8) c.hit(o.x0, ABBOT.dmg.light, false, 'FALSE LIGHT');   /* from where it was thrown: the guard turns what is in front */
}
/* the bridges hauled back up after their beat (told: the last rehangTell s the rope creaks and the bridge swings up) */
function stepBridges(e, dt, c) {
  const H = house(c); if (!H || !e.brT) return;
  for (let i = 0; i < e.brT.length; i++) { if (e.brGone || e.br[i]) continue;
    e.brT[i] -= dt;
    if (e.brT[i] <= ABBOT.rehangTell && !e.brTold?.[i]) { (e.brTold = e.brTold || [])[i] = true; c.say('THE BRIDGE IS HAULED BACK UP', false, true); c.sound('rope'); }
    if (e.brT[i] <= 0) { e.br[i] = true; e.brTold[i] = false; if (c.bridge) c.bridge(i, true); } }
}
/* the phase changes: each one changes the house (B5) */
function phaseTo(e, n, c) {
  const H = house(c); e.phase = n;
  if (n === 2) { c.say(CHAIR_SAY.cut, true); c.sound('roar');
    if (H) { e.br = e.br || H.bridges.map(() => true);
      H.bridges.forEach((b, i) => { if (e.br[i] && c.bridge) c.bridge(i, false); e.br[i] = false; });
      e.brGone = true;
      if (e.deck === 'high' && !spanAt(e, H, e.x) && e.mode !== 'swing') { e.smoke = null; e.swRite = false; goTo(e, c, { x: e.x, y: c.A.floor, deck: 'floor' }); } } }   /* he cuts them from the boards: he takes the rope down first */
  if (n === 3) { c.say('THE WHEEL TURNS FOR HIM: HIS SMOKE CARRIES YOU', true); c.sound('roar'); if (c.phase3) c.phase3(); }
}
export function updateFalseAbbot(e, dt, c) {
  const { P, A, hit } = c, floor = A.floor, H = house(c);
  if (!e.alive || e.mode === 'sleep') return;
  e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.cd = (e.cd ?? 1) - dt; e.turn ??= 0;
  e.blessT = Math.max(0, (e.blessT || 0) - dt);
  e.riteCd = Math.max(0, (e.riteCd || 0) - dt);
  e.beatCd = Math.max(0, (e.beatCd || 0) - dt);
  e.addT = (e.addT ?? 2) - dt;
  e.open = abbotOpen(e) ? Math.max(0, e.modeT) : 0;
  e.deck ??= 'floor'; if (e.y === undefined || e.deck === 'floor' && e.mode !== 'swing' && e.mode !== 'fall') e.y = floor;
  e.phase ??= 1;
  if (H) { e.br = e.br || H.bridges.map(() => true); e.brT = e.brT || H.bridges.map(() => 0); }
  const fr = e.hp / e.maxHp;
  if (e.phase < 2 && fr <= ABBOT.p2At) phaseTo(e, 2, c);
  if (e.phase < 3 && fr <= ABBOT.p3At) phaseTo(e, 3, c);
  stepOrb(e, dt, c); stepBridges(e, dt, c);
  /* the chair rides the basket: in it, he goes where it goes - and far enough down, it spills him (P2's opening) */
  if (H && e.deck === 'chair' && e.mode !== 'swing' && e.mode !== 'swingTell') { const k = c.basketK ? c.basketK() : 0; e.y = abbotChairY(H, floor, k); e.x = H.chairX;
    if (k >= ABBOT.spillAt && e.mode !== 'swing') { e.deck = 'floor'; drop(e, c, CHAIR_SAY.spill); e.vy = 120; if (c.spill) c.spill(e); } }   /* the payoff: a hit-stop, a dust burst, the chair swinging empty (main.js) */
  /* standing on boards that are not there any more (a bridge dropped under him some other way): he falls */
  if (H && e.deck === 'high' && e.mode !== 'swing' && e.mode !== 'fall' && !spanAt(e, H, e.x)) drop(e, c, 'THE BRIDGE GOES WITH HIM');
  // ---- THE CONGREGATION, all the way through: it does not stop for his windups ----
  if (e.mode !== 'downed' && e.mode !== 'beaten' && c.adds && c.summon) {
    if (e.addT <= 0) { e.addT = e.phase >= 2 ? ABBOT.addEveryP2 : ABBOT.addEvery;
      if (c.adds() < (e.phase >= 2 ? ABBOT.addsP2 : ABBOT.adds)) c.summon(); }
  }
  if (e.mode === 'wake') { if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = 0.9; } return; }
  // ---- THE FINALE: beaten down at the floor of his blood, he kneels - ring the great bell ----
  if (e.beatNow && e.mode !== 'beaten') { e.beatNow = false; e.mode = 'beaten'; e.modeT = ABBOT.beatT; e.vx = 0; e.blessT = 0; e.smoke = null; e.orb = null;
    if (e.deck !== 'floor') { e.deck = 'floor'; e.y = floor; }
    c.say('BEATEN DOWN: RING THE GREAT BELL', false, true); c.sound('break'); c.shake(4); return; }
  if (e.mode === 'beaten') { e.vx = 0; if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = 1.0; e.beatCd = ABBOT.beatCd; c.say('HE GETS UP', false); } return; }
  // ---- HE FALLS WITH THE HOUSE ----
  if (e.mode === 'fall') { e.vy = (e.vy || 0) + ABBOT.fallG * dt; e.y += e.vy * dt;
    if (e.y >= floor) { e.y = floor; downed(e, c); e.riteCd = Math.max(e.riteCd || 0, ABBOT.downCd); } return; }
  // ---- THE OPENING: the house answered the blow and he is down ----
  if (e.mode === 'downed') { e.vx = 0; if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = 1.0; e.riteCd = Math.max(e.riteCd || 0, ABBOT.downCd); c.say('HE GETS UP', false); } return; }
  // ---- the windups ----
  if (e.mode.endsWith('Tell')) {
    /* he turns to you through every windup but two: on the rope he has already chosen where he lands, and on his knees
       he does not turn round */
    if (e.mode !== 'swingTell' && e.mode !== 'riteTell') e.face = Math.sign(P.x - e.x) || e.face;
    if (e.mode === 'gleamTell') { e.lightAim = clampX(A, P.x); e.lightY = P.ground === false ? (e.lightY ?? floor) : P.y; }   /* the mark follows you until he lets go */
    /* THE RITE SPOILED: a plunge on him, the wheel he prays at struck, or (the old way, kept) a blow that staggers him mid-prayer.
       No heal, no ward, a short stagger - and he cannot kneel again for a while, so he fights unwarded. */
    if (e.mode === 'riteTell' && (e.spoilBy || e.stagger > 0)) {
      e.mode = 'spoiled'; e.modeT = ABBOT.spoilT; e.cd = ABBOT.cd; e.riteCd = ABBOT.riteCd; e.vx = 0; e.smoke = null;
      c.say(e.spoilBy === 'plunge' ? 'RITE SPOILED: COME DOWN ON' : e.spoilBy === 'wheel' ? 'THE WHEEL TURNS AGAINST HIM: RITE SPOILED' : 'RITE SPOILED', false); c.sound('break'); c.shake(3);
      e.spoilBy = null; return; }
    if (e.modeT > 0) return;
    if (e.mode === 'censerTell') { e.mode = 'censer'; e.modeT = 0.4; c.sound('whoosh');
      const dx = (P.x - e.x) * e.face;
      if (!P.dead && dx > -10 && dx < ABBOT.censerR && Math.abs(P.y - e.y) < 32) { const r = hit(e.x, ABBOT.dmg.censer, false, 'THE CENSER'); if (r === 'hit') c.shove(e.face * 170, -120); }
      return; }
    if (e.mode === 'castTell') { e.mode = 'cast'; e.modeT = 0.45; e.castHit = false; e.castX = e.x + e.face * Math.min(ABBOT.castRange, Math.max(60, Math.abs(P.x - e.x) + 20)); c.sound('throw'); return; }
    if (e.mode === 'swingTell') { e.mode = 'swing'; e.modeT = ABBOT.swingT; c.sound('whoosh'); return; }
    if (e.mode === 'gleamTell') { e.mode = 'gleam'; e.modeT = 0.35; c.sound('throw');
      e.orb = { x0: e.x + e.face * 8, y0: e.y - 52, tx: e.lightAim ?? P.x, ty: e.lightY ?? floor, t: 0, T: ABBOT.lightT };
      return; }
    if (e.mode === 'coalsTell') { e.mode = 'coals'; e.modeT = 0.5; c.sound('puff');
      const sp = H && e.deck === 'high' ? spanAt(e, H, e.x) : null;
      for (let i = 0; i < ABBOT.coals; i++) { const fx = e.x + e.face * (ABBOT.coalFrom + i * ABBOT.coalStep); if (sp && (fx < sp[0] || fx > sp[1])) continue; c.fire(fx, ABBOT.coalLife, i * 0.06, e.y); }
      return; }
    if (e.mode === 'riteTell') { e.mode = 'rite'; e.modeT = 0.5; c.sound('bless'); e.smoke = null;
      /* HE BLESSES HIMSELF TOO, and the prayer HEALS him: that is the whole difference between him and the priest downstairs */
      e.blessT = ABBOT.bless; e.hp = Math.min(e.maxHp, e.hp + Math.ceil(e.maxHp * ABBOT.heal)); e.riteN = (e.riteN || 0) + 1;
      const n = c.blessFlock ? c.blessFlock(ABBOT.blessR, ABBOT.bless, ABBOT.mend) : 0;
      c.say(n ? 'BLESSED: HE IS MENDED' : 'HE IS MENDED AND WARDED', false, true);
      return; }
    if (e.mode === 'knellTell') { e.mode = 'knell'; e.modeT = 0.6; c.sound('bell'); c.shake(6);
      if (!P.dead) hit(e.x, ABBOT.dmg.knell, true, 'THE KNELL');
      if (c.bellSpend) c.bellSpend();
      return; }
  }
  // ---- what the windups turned into ----
  if (e.mode === 'cast') {
    /* THE CHAIN. It goes out flat and comes back. GUARDED, it snaps taut on the boards and hauls HIM toward you;
       TAKEN, it reels YOU in and the swing follows. */
    if (!e.castHit && !P.dead) { const lo = Math.min(e.x, e.castX), hi = Math.max(e.x, e.castX);
      if (P.x > lo - 8 && P.x < hi + 8 && Math.abs(P.y - e.y) < 30) { e.castHit = true;
        /* FROM HIM, NOT FROM ITS HEAD: the guard only turns what is in front (found by the lab pilot, 2026-09-23) */
        const r = hit(e.x, ABBOT.dmg.cast, false, 'THE CHAIN');
        if (r === 'blocked') { e.mode = 'haul'; e.modeT = 0.5;
          let to = e.x + e.face * ABBOT.castPull; to = Math.max(A.x0 + 20, Math.min(A.x1 - 20, to));
          if (H && e.deck === 'high') { const sp = spanAt(e, H, e.x); if (sp) to = Math.max(sp[0] + 4, Math.min(sp[1] - 4, to)); }
          e.x = to;
          c.say('THE CHAIN SNAPS TAUT: IT HAULS HIM', false); c.sound('clank'); c.shake(3); return; }
        if (r === 'hit') { c.reel(e.x + e.face * ABBOT.reelTo); }
      } }
    if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = e.phase >= 2 ? ABBOT.cdP2 : ABBOT.cd; }
    return; }
  if (e.mode === 'swing') {
    /* ACROSS THE ROOF ON THE ROPE: from where he leapt to the mark, up through an arc, and down on it with the censer */
    const s = Math.min(1, 1 - Math.max(0, e.modeT) / ABBOT.swingT), k = s * s * (3 - 2 * s), y0 = e.swY0 ?? floor, y1 = e.swY ?? floor;
    e.x = e.sw0 + (e.swTo - e.sw0) * k; e.vx = 0; e.swLift = ABBOT.swingH * Math.sin(Math.PI * s); e.y = y0 + (y1 - y0) * k - e.swLift;
    if (e.modeT > 0) return;
    e.x = e.swTo; e.y = y1; e.swLift = 0; e.deck = e.swDeck || 'floor';
    if (e.swRite) { e.swRite = false; e.cd = 0; begin(e, 'rite', c); return; }   /* he came to pray: no slam, he kneels */
    e.mode = 'land'; e.modeT = ABBOT.landT;
    c.sound('heavy'); c.shake(5); if (c.dust) c.dust(e.x, e.y);
    if (!P.dead && Math.abs(P.x - e.x) < ABBOT.slamR && Math.abs(P.y - e.y) < 34) { const r = hit(e.x, ABBOT.dmg.slam, true, 'THE CENSER SLAM'); if (r) c.shove((Math.sign(P.x - e.x) || e.face) * 190, -150); }
    return; }
  if (e.mode === 'haul' || e.mode === 'spoiled' || e.mode === 'land') { if (e.modeT <= 0) { const was = e.mode; e.mode = 'stalk'; e.cd = was === 'haul' ? 0.5 : e.phase >= 2 ? ABBOT.cdP2 : ABBOT.cd; } return; }
  if (e.mode === 'censer' || e.mode === 'coals' || e.mode === 'knell' || e.mode === 'gleam') {
    if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = e.phase >= 2 ? ABBOT.cdP2 : ABBOT.cd; } return; }
  if (e.mode === 'rite') {
    if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = e.phase >= 2 ? ABBOT.cdP2 : ABBOT.cd;
      if (e.deck === 'chair') { e.cd = 0; goTo(e, c, placeFor(e, c, P)); } }   /* blessed, he leaves his chair: down on the rope to you */
    return; }
  // ---- PROCESSING: slow, heavy, always coming ----
  if (e.deck === 'chair') { goTo(e, c, placeFor(e, c, P)); return; }   /* not praying, he does not sit up there: down to you */
  const lvl = H ? abbotLevelOf(e, H, P, floor) : 'floor', same = !H || (lvl === 'high') === (e.deck === 'high');
  const d = P.x - e.x, ad = Math.abs(d); e.face = Math.sign(d) || e.face;
  const sp = H && e.deck === 'high' ? spanAt(e, H, e.x) : null;
  const want = same && ad > ABBOT.keep ? e.face : 0, nx = e.x + want * ABBOT.walk * dt;
  if (nx > A.x0 + 20 && nx < A.x1 - 20 && (!sp || (nx > sp[0] + 4 && nx < sp[1] - 4))) e.x = nx; e.vx = want * ABBOT.walk;
  if (e.cd > 0 || P.dead) return;
  /* THE RITE IS HIS HEARTBEAT, not one move in ten. He kneels the moment the ward lapses - unless you spoiled the last
     one or the house answered (riteCd) - and he goes to the PHASE'S DEVICE to do it: mid-bridge, his chair, the wheel. */
  if ((e.blessT || 0) <= 0 && e.riteCd <= 0) {
    if (!H) { begin(e, 'rite', c); return; }
    const ph = e.phase || 1;
    /* he prays at the device NEAREST YOU - he flaunts it: the bridge with a bell by you, the wheel by you (the chair is the one chair) */
    const near = xs => Math.min(...xs.map(x => Math.abs(x - P.x)));
    if (ph === 1) { const ups = H.bridges.map((b, i) => ({ b, i })).filter(q => bridgeUp(e, q.i));
      if (ups.length) { const q = ups.reduce((a, b) => near(a.b.bells) <= near(b.b.bells) ? a : b);
        const bx = q.b.bells.reduce((a, b) => Math.abs(a - P.x) <= Math.abs(b - P.x) ? a : b), mid = Math.max(q.b.x0 + 24, Math.min(q.b.x1 - 24, bx < (q.b.x0 + q.b.x1) / 2 ? q.b.x0 + 56 : q.b.x1 - 56)); e.riteBr = q.i;   /* he kneels near the bell by you: on the bridge, a few steps out from its tower */
        if (e.deck === 'high' && Math.abs(e.x - mid) < 24) { begin(e, 'rite', c); return; }
        goTo(e, c, { x: mid, y: H.deckY, deck: 'high' }, true); return; }
      e.riteCd = 1.5; }   /* both bridges are down: he fights until one is hauled back */
    else if (ph === 2) { const k = c.basketK ? c.basketK() : 0;
      if (k < 0.3) { goTo(e, c, { x: H.chairX, y: abbotChairY(H, floor, k), deck: 'chair' }, true); return; }
      e.riteCd = 1.5; }   /* his chair is down (someone is in the basket): he fights until it is hauled back up */
    else { const wi = H.wheels.reduce((b, w, i) => Math.abs(w.spotX - P.x) < Math.abs(H.wheels[b].spotX - P.x) ? i : b, 0), w = H.wheels[wi]; e.riteWheel = wi;
      if (e.deck === 'floor' && Math.abs(e.x - w.spotX) < 20) { begin(e, 'rite', c); return; }
      goTo(e, c, { x: w.spotX, y: floor, deck: 'floor' }, true); return; }
  }
  let what;
  if (!same) what = (e.far = !e.far) ? 'gleam' : 'swing';   /* YOU ARE ABOVE HIM OR BELOW HIM: the false light reaches, or he takes a rope to you */
  else {
    what = ABBOT.order[e.turn++ % ABBOT.order.length];
    if (what === 'censer' && ad > ABBOT.censerR + 26) what = 'cast';                 /* too far to swing: throw it */
    if (what === 'cast' && ad > ABBOT.castRange + 30) what = (e.far = !e.far) ? 'gleam' : 'swing';   /* too far to throw: the false light reaches, or he takes a rope to you - turn about */
    if (what === 'cast' && ad < 40) what = 'censer';                                  /* too close to throw: swing it */
    if (what === 'swing' && ad < ABBOT.swingMin) what = 'censer';                     /* close enough to hit: no need of the rope */
    if (what === 'gleam' && ad < 50) what = 'censer';
    if (what === 'knell' && e.phase < 2) what = 'coals';                              /* he does not touch the great bell until he is hurt */
    if (what === 'knell' && c.bellCold && c.bellCold()) what = 'swing';               /* nor while it is still ringing */
    if (what === 'swing' && ad < ABBOT.swingMin) what = 'censer';
    if (ad > ABBOT.farAt && what !== 'knell' && what !== 'swing' && what !== 'gleam') what = (e.far = !e.far) ? 'gleam' : 'swing';   /* FAR OFF, HE GETS ABOUT BY THE BELLS */
    if (what === 'knell' && e.deck !== 'floor') what = 'censer';
  }
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
  let fy = Math.round((e.y ?? floorY) - cy), x = Math.round(e.x - cx);
  /* THE BELL ROPE'S MARK: red, on the spot he will come down on, from the moment the rope jerks */
  if ((e.mode === 'swingTell' || e.mode === 'swing') && e.swTo !== undefined) {
    const fy = Math.round((e.swY ?? floorY) - cy), k = e.mode === 'swing' ? 1 : 1 - Math.max(0, e.modeT) / ABBOT.tell.swing, mx = Math.round(e.swTo - cx), p = 0.5 + 0.5 * Math.sin(time * 14);
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
    if (e.lightAim !== undefined) { const mx = Math.round(e.lightAim - cx), ly = Math.round((e.lightY ?? floorY) - cy);
      for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2 + time * 1.5; g.globalAlpha = 0.25 + 0.45 * k; g.fillStyle = SICK; g.fillRect(Math.round(mx + Math.cos(an) * ABBOT.lightR), Math.round(ly - 1 + Math.sin(an) * 4), 2, 1); }
      g.globalAlpha = (0.1 + 0.2 * k) * (0.6 + 0.4 * p); g.fillStyle = SICK; g.beginPath(); g.ellipse(mx, ly - 1, ABBOT.lightR, 4, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; } }
  if (e.orb) { const o = e.orb, fy = Math.round((o.ty ?? floorY) - cy), s = Math.min(1, o.t / o.T), mx = Math.round(o.tx - cx), p = 0.5 + 0.5 * Math.sin(time * 22);
    /* the mark pulls TIGHT as the ball comes down: the outer ring is where it will burst, the inner ring is how long you have */
    g.lineWidth = 2; g.globalAlpha = 0.4 + 0.45 * s; g.strokeStyle = SICK; g.beginPath(); g.ellipse(mx, fy - 1, ABBOT.lightR, 4, 0, 0, Math.PI * 2); g.stroke();
    g.globalAlpha = 0.25 + 0.5 * s; g.strokeStyle = SICKL; g.lineWidth = 1; g.beginPath(); g.ellipse(mx, fy - 1, ABBOT.lightR * (1 - s) + 2, 4 * (1 - s) + 1, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
    const at = q => ({ x: Math.round(o.x0 + (o.tx - o.x0) * q - cx), y: Math.round(o.y0 + ((o.ty ?? floorY) - 6 - o.y0) * q - ABBOT.lightUp * Math.sin(Math.PI * q) - cy) });
    for (let i = 5; i >= 1; i--) { const q = Math.max(0, s - i * 0.04), t = at(q), sm = i > 3 ? 1 : 0; g.globalAlpha = 0.5 - i * 0.08; g.fillStyle = i & 1 ? SICK : SICKL; g.fillRect(t.x - 2 + sm, t.y - 2 + sm, 5 - sm * 2, 5 - sm * 2); }
    const ob = at(s); g.globalAlpha = 1; gl(ob.x, ob.y, 13, SICKL, 0.55 + 0.2 * p);
    g.fillStyle = SICK; g.beginPath(); g.arc(ob.x, ob.y, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = SICKL; g.beginPath(); g.arc(ob.x, ob.y, 3, 0, Math.PI * 2); g.fill(); g.fillStyle = '#fffbe0'; g.fillRect(ob.x - 1, ob.y - 1, 2, 2);
    glint(g, ob.x + Math.round(Math.cos(time * 9) * 7), ob.y + Math.round(Math.sin(time * 9) * 7), '#fffbe0', 1); }
  /* THE BURST: a gold flash where it came down - a white-gold flare over the mark, a pillar of false light and a spray of sparks */
  if (e.orbFlash) { const f = e.orbFlash, fy = Math.round((f.y ?? floorY) - cy), k = 1 - f.t / f.T, u = f.t / f.T, mx = Math.round(f.x - cx);
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
  if (e.mode === 'cast' || e.mode === 'castTell' || e.mode === 'haul') {
    const to = e.mode === 'castTell' ? x + e.face * 18 : Math.round((e.castX ?? e.x) - cx), k = e.mode === 'haul' ? 0.4 : 1;
    g.globalAlpha = 0.85 * k; g.strokeStyle = '#8a8478'; g.lineWidth = 1; g.beginPath();
    g.moveTo(x + e.face * 6, fy - 22); g.lineTo(to, fy - 10); g.stroke();
    g.fillStyle = '#c9a44a'; g.fillRect(to - 3, fy - 13, 6, 6); g.fillStyle = '#f0dc8a'; g.fillRect(to - 3, fy - 13, 6, 1); g.globalAlpha = 1; }
  if (e.mode === 'censer' || e.mode === 'censerTell') {
    const k = e.mode === 'censerTell' ? 0.35 : 1; g.globalAlpha = 0.25 * k; g.strokeStyle = '#ffd36b';
    g.lineWidth = 2; g.beginPath(); g.ellipse(x, fy - 16, ABBOT.censerR, 12, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; }
  if (e.mode === 'coalsTell') { const k = 1 - Math.max(0, e.modeT) / ABBOT.tell.coals;
    for (let i = 0; i < ABBOT.coals; i++) { const bx = Math.round(x + e.face * (ABBOT.coalFrom + i * ABBOT.coalStep));
      g.globalAlpha = (0.2 + 0.5 * k) * (1 - i * 0.12); g.fillStyle = '#ff9a3c'; g.fillRect(bx - 4, fy - 2, 8, 2); } g.globalAlpha = 1; }
  if (abbotBlessed(e)) { const k = 0.5 + 0.5 * Math.sin(time * 5), y = Math.round(e.y - cy); g.globalAlpha = 0.20 + 0.18 * k; g.strokeStyle = '#e8a83a'; g.lineWidth = 2;
    g.beginPath(); g.ellipse(x, y - 20, 20, 26, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; }
  if (e.mode === 'fall') { g.fillStyle = '#d8d0c0'; g.globalAlpha = 0.6;   /* THE FALL (claude/abbot3art): speed streaks above him, and a dust of the boards he came off */
    for (let i = 0; i < 6; i++) g.fillRect(Math.round(x - 15 + i * 6), Math.round(fy - 66 + (time * 150 + i * 23) % 30), 1, 7);
    g.fillStyle = '#a49c8c'; for (let i = 0; i < 4; i++) g.fillRect(Math.round(x - 9 + i * 6 + Math.sin(time * 20 + i) * 2), Math.round(fy - 58 + (time * 60 + i * 11) % 16), 2, 1); g.globalAlpha = 1; }
  if (e.mode === 'downed') { const k = 0.5 + 0.5 * Math.sin(time * 10); g.globalAlpha = 0.35 + 0.35 * k; g.strokeStyle = '#8fd160'; g.lineWidth = 2;
    g.beginPath(); g.ellipse(x, fy - 2, 28 + k * 3, 6, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; }
}
/* THE HOUSE THAT BLESSES HIM (claude/abbot3 build, claude/abbot3art art), drawn under him. H in pixels. In order:
   the belfry's own dressing (maroon banners and bronze lamps hung off the decks - cloth and bronze, no timber but what is already the frame);
   the bridges' BELLS (a stone corbel and iron strap off the deck, a yoke, the bronze bell, the bridge's hauling rope with its iron ring; the bell that blesses him
   rings its gold ripples), a DROPPED bridge (iron-strapped, hung off its hinge, swaying, then hauled back up told by the dust and the shuddering rope);
   his CHAIR (red velvet, gilt, mitre finial, four cords to a bronze ring) hung over the beam, and the WINDLASS CATCH on that beam (a ratchet wheel turning
   with the basket and the pawl that holds the chair up until the basket is ridden down) - the mechanism that makes 'the basket down is the chair down' readable;
   the PRAYER WHEEL's halo (spinning bronze ring, prayer strips); his CENSER set down on its brazier with the SMOKE COLUMN that lifts you (billows and rising chevrons);
   the GREAT BELL once he is beaten (a pillar of light, tolling rings, a drift of motes from him to it). Canvas primitives on the 320x180 buffer. */
const STONE = ['#4a463e', '#6a645a', '#8a8478', '#a49c8c', '#c8c0aa'], BRZ = ['#3a2a12', '#6a4a1e', '#9a7634', '#c9a44a', '#f0dc8a'], IRON = ['#26262e', '#3c3c44', '#5a5a64', '#8a8a96'];
const CLOTH = ['#3a1216', '#5a1e1e', '#8e3a32', '#b8584a'], SAFF = ['#a8681c', '#e8a83a', '#ffe08a'], ROPE = ['#4a3418', '#8a6a3e', '#c8b088'];
export function drawAbbotHouse(g, e, H, cx, cy, time, floorY, basketK) {
  if (!H) return;
  const W = g.canvas.width, fy = Math.round(floorY - cy), dy = Math.round(H.deckY - cy), p = 0.5 + 0.5 * Math.sin(time * 9), alive = !!(e && e.alive && e.mode !== 'sleep');
  const R = (c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
  const GOLD = '#ffe08a', glow = (x, y, r, a0) => { g.fillStyle = GOLD; for (let k = 3; k >= 1; k--) { g.globalAlpha = a0 * 0.34 * (4 - k) / 3 * 0.9; g.beginPath(); g.arc(x, y, r * k / 3, 0, Math.PI * 2); g.fill(); } g.globalAlpha = 1; };   /* (three stacked discs: the radial gradient this used to be cost a gradient object per glow per frame) */
  const rope = (x0, y0, x1, y1, w = 2) => { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0))); for (let i = 0; i <= n; i++) { const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n); R(ROPE[(i >> 1) & 1 ? 1 : 2], x, y, w, 1); if (w > 1) R(ROPE[0], x + w, y, 1, 1); } };
  const ph = alive ? (e.phase || 1) : 1, praying = alive && e.mode === 'riteTell', warded = alive && (e.blessT || 0) > 0, onX = x => x > -140 && x < W + 140;
  /* ---- THE BELFRY'S DRESSING: banners and lamps off the underside of the decks ---- */
  (H.spans || []).forEach(([a, b], si) => {
    const n = Math.max(0, Math.floor((b - a) / 70));
    for (let k = 0; k < n; k++) { const bx = Math.round(a + (k + 0.5) * (b - a) / n - cx); if (!onX(bx)) continue;
      const sw = Math.round(Math.sin(time * 1.2 + si * 2 + k * 1.7) * 1), top = dy + 5, len = 21 + ((si + k) % 2) * 4;
      R(BRZ[1], bx - 6, top - 1, 13, 2); R(BRZ[3], bx - 6, top - 1, 13, 1); R(BRZ[3], bx - 7, top - 2, 2, 4); R(BRZ[3], bx + 6, top - 2, 2, 4);   /* the bronze rod and its finials */
      for (let r = 0; r < len; r++) { const x0 = bx - 4 + (r > 8 ? sw : 0), y = top + 1 + r, full = r <= len - 6, ws = full ? 9 : Math.max(0, 5 - (r - (len - 6)));   /* the swallow-tail: two strips that narrow away from the middle */
        if (full) R(CLOTH[1], x0, y, 9, 1); else { R(CLOTH[1], x0, y, ws, 1); R(CLOTH[1], x0 + 9 - ws, y, ws, 1); }
        R(CLOTH[2], x0, y, Math.min(2, ws), 1); R(CLOTH[0], x0 + 9 - Math.min(2, ws), y, Math.min(2, ws), 1); }
      for (let r = 2; r < len - 4; r++) { const x0 = bx - 1 + (r > 8 ? sw : 0); R(SAFF[1], x0, top + 1 + r, 3, 1); if (r % 5 === 2) R(SAFF[2], x0 - 1, top + 1 + r, 5, 1); }   /* the orphrey, with its crosspieces */
      R(SAFF[1], bx - 1 + sw, top + len - 3, 3, 3); R(SAFF[2], bx + sw, top + len - 3, 1, 3); }   /* a gilt tassel at the tail */
    for (const lx of [a + 10, b - 10]) { const bx = Math.round(lx - cx); if (!onX(bx) || b - a < 80) continue;
      const fl = Math.sin(time * 17 + lx) > 0 ? 1 : 0;
      for (let r = 0; r < 7; r++) R(r & 1 ? IRON[2] : IRON[1], bx, dy + 5 + r, 1, 1);   /* the chain */
      R(BRZ[1], bx - 4, dy + 12, 9, 1); R(BRZ[2], bx - 3, dy + 13, 7, 3); R(BRZ[3], bx - 2, dy + 13, 2, 3); R(BRZ[0], bx - 2, dy + 16, 5, 1);   /* the lamp's bronze cup */
      R('#ff9a3c', bx - 1, dy + 10 - fl, 3, 2); R(GOLD, bx, dy + 9 - fl, 1, 2);
      glow(bx, dy + 11, 12 + fl, 0.18); }
  });
  /* ---- THE BRIDGES' BELLS ---- */
  (H.bridges || []).forEach((b, i) => b.bells.forEach((bellX, j) => {
    const up = !alive || bridgeUp(e, i), bx = Math.round(bellX - cx), near = bellX < (b.x0 + b.x1) / 2 ? b.x0 : b.x1, nx = Math.round(near - cx);
    if (!onX(bx)) return;
    const mine = alive && up && e.deck === 'high' && e.x >= b.x0 - 6 && e.x <= b.x1 + 6, ring = mine && (praying || warded), by = fy - 50;
    const hauling = !up && alive && !e.brGone && e.brT && e.brT[i] <= ABBOT.rehangTell, shud = hauling ? Math.round(Math.sin(time * 38) * 1) : 0;
    /* the bracket: a stone corbel under the deck, an iron strap down it to the yoke the bell hangs from */
    R(STONE[1], bx - 5, dy + 5, 11, 3); R(STONE[3], bx - 5, dy + 5, 11, 1); R(STONE[2], bx - 3, dy + 8, 7, 3); R(STONE[0], bx - 3, dy + 10, 7, 1); R(STONE[3], bx - 3, dy + 8, 2, 2);
    for (let r = dy + 11; r < by - 2; r++) R(IRON[(r >> 1) & 1 ? 1 : 2], bx, r, 2, 1);
    R(IRON[0], bx + 2, dy + 11, 1, by - dy - 13);
    R(IRON[1], bx - 4, by - 3, 9, 2); R(IRON[3], bx - 4, by - 3, 9, 1); R(BRZ[3], bx - 5, by - 4, 2, 4); R(BRZ[3], bx + 4, by - 4, 2, 4);   /* the yoke and its bronze gudgeons */
    if (!(alive && e.brGone)) { rope(bx + 3 + shud, by - 2, nx, dy + 3, 1); R(IRON[2], nx - 2, dy, 5, 2); R(IRON[3], nx - 1, dy + 1, 3, 1); R(IRON[0], nx - 1, dy + 3, 3, 1); }   /* the hauling rope to the iron ring in its bridge end */
    if (ring) { for (let k = 0; k < 3; k++) { const ph2 = ((time * 1.4 + k / 3) % 1); g.globalAlpha = (1 - ph2) * 0.75; g.strokeStyle = GOLD; g.lineWidth = 1; g.beginPath(); g.ellipse(bx, by + 8, 7 + ph2 * 16, 5 + ph2 * 12, 0, 0, Math.PI * 2); g.stroke(); } g.globalAlpha = 1;
      glow(bx, by + 8, 18 + 4 * p, 0.35 + 0.3 * p); for (let k = 0; k < 4; k++) if (Math.sin(time * 6 + k * 2.2) > 0.1) glint(g, Math.round(bx + Math.cos(time * 3 + k * 1.6) * 13), Math.round(by + 8 + Math.sin(time * 3 + k * 1.6) * 10), '#fffbe0', 1); }
    const sw = hauling ? Math.round(Math.sin(time * 18) * 2) : Math.round(Math.sin(time * 1.3 + i) * 1);
    bronzeBell(g, bx, by, sw, true);
    if (ring) { g.globalAlpha = 0.55 * (0.5 + 0.5 * p); R('#fffbe0', bx - 4 + sw, by + 6, 1, 7); g.globalAlpha = 1; }   /* the lip kindles */
    /* DOWN: the bridge hangs off its hinge on the far tower - iron-strapped, swaying - and hauled back it swings up again; the haul is told by dust off the deck and the shuddering rope */
    if (!up && j === 0) { const far = b.x1 - b.x0 > 120 ? (near === b.x0 ? b.x1 : b.x0) : b.x1, fx = Math.round(far - cx), len = Math.min(88, Math.abs(b.x1 - b.x0)), dir = Math.sign(near - far) || 1;
      const rise = alive && !e.brGone && e.brT ? Math.max(0, Math.min(1, 1 - e.brT[i] / ABBOT.rehangTell)) : 0, an = (Math.PI / 2) * (1 - rise) + (rise ? 0 : Math.sin(time * 2.1 + i) * 0.05);
      for (let s = 0; s < len; s += 4) { const px_ = Math.round(fx + dir * Math.cos(an) * s), py = Math.round(dy + Math.sin(an) * s);
        R('#2a1c0c', px_ - 5, py, 11, 4); R(s % 8 ? '#7a5232' : '#8e6440', px_ - 4, py, 9, 3); R('#a8805a', px_ - 4, py, 9, 1); R(ROPE[2], px_ - 5, py, 1, 4); R(ROPE[2], px_ + 5, py, 1, 4);
        if (s % 16 === 0) { R(IRON[1], px_ - 4, py + 1, 9, 1); R(BRZ[3], px_ - 4, py + 1, 1, 1); R(BRZ[3], px_ + 4, py + 1, 1, 1); } }   /* an iron strap and its bronze studs every fourth plank */
      R(IRON[1], fx - 3, dy - 1, 7, 3); R(BRZ[3], fx - 2, dy - 1, 5, 1); R(IRON[0], fx - 1, dy + 1, 3, 1);   /* the hinge pin on the tower */
      if (rise > 0) { rope(bx + 3, by - 2, Math.round(fx + dir * Math.cos(an) * len), Math.round(dy + Math.sin(an) * len), 1);
        g.fillStyle = '#d8d0c0'; g.globalAlpha = 0.5; for (let k = 0; k < 6; k++) g.fillRect(Math.round(fx + dir * (4 + k * 9) + Math.sin(time * 9 + k) * 2), Math.round(dy + 3 + ((time * 40 + k * 13) % 22)), 2, 1); g.globalAlpha = 1; } }
  }));
  /* ---- THE CHAIR, ITS BEAM AND THE WINDLASS CATCH ---- */
  if (H.chairX !== undefined) {
    const cxp = Math.round(H.chairX - cx), cyp = Math.round(abbotChairY(H, floorY, basketK) - cy), py = Math.round(H.pulleyY - cy), bxp = Math.round(H.basketX + 16 - cx), mx = Math.round((cxp + bxp) / 2);
    if (cxp > -90 && cxp < W + 130) {
      const k = Math.max(0, Math.min(1, basketK || 0)), inIt = alive && e.deck === 'chair', ring = inIt && (praying || warded), spilled = k >= ABBOT.spillAt, lo = Math.min(cxp, bxp) - 11, wd = Math.abs(bxp - cxp) + 23;
      /* the beam: an iron-bound gantry hung from the belfry roof on two chains, end plates riveted, a bronze cap on each */
      for (const qx of [lo + 3, lo + wd - 4]) { for (let r = py - 70; r < py - 4; r += 3) { R(IRON[2], qx, r, 2, 2); R(IRON[0], qx + 1, r + 1, 1, 2); } }
      R(IRON[0], lo, py - 5, wd, 7); R(IRON[1], lo, py - 4, wd, 4); R(IRON[3], lo, py - 4, wd, 1);
      R(BRZ[2], lo - 1, py - 6, 4, 9); R(BRZ[3], lo - 1, py - 6, 1, 9); R(BRZ[2], lo + wd - 3, py - 6, 4, 9); R(BRZ[3], lo + wd - 3, py - 6, 1, 9);
      for (let r = 0; r < wd - 8; r += 6) R(IRON[3], lo + 5 + r, py - 3, 1, 1);   /* rivets */
      /* THE WINDLASS CATCH: a ratchet wheel on the beam turning with the basket (two turns over the ride), and the PAWL that holds the chair up till the basket moves */
      const wy = py - 13, rot = k * Math.PI * 4, held = k < 0.04;
      R(IRON[1], mx - 1, py - 7, 3, 3);   /* its pillow block */
      for (let t = 0; t < 8; t++) { const an = rot + t * Math.PI / 4; R(BRZ[3], mx + Math.cos(an) * 7 - 1, wy + Math.sin(an) * 7 - 1, 2, 2); }   /* the teeth */
      g.fillStyle = BRZ[1]; g.beginPath(); g.arc(mx, wy, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = BRZ[2]; g.beginPath(); g.arc(mx, wy, 4.5, 0, Math.PI * 2); g.fill();
      g.strokeStyle = BRZ[0]; g.lineWidth = 1; g.beginPath(); for (let t = 0; t < 4; t++) { const an = rot + t * Math.PI / 2; g.moveTo(mx, wy); g.lineTo(mx + Math.cos(an) * 5, wy + Math.sin(an) * 5); } g.stroke();
      R(BRZ[4], mx - 1, wy - 1, 3, 3); R(BRZ[0], mx, wy, 1, 1);
      const tipY = held ? wy - 5 : wy - 10 - Math.round(Math.abs(Math.sin(rot * 4)));   /* the pawl rides up on the teeth while the wheel runs */
      R(IRON[1], mx - 15, py - 16, 2, 11); R(IRON[3], mx - 15, py - 16, 1, 11);   /* the pawl's post */
      g.strokeStyle = IRON[3]; g.beginPath(); g.moveTo(mx - 14, py - 15); g.lineTo(mx - 8, tipY); g.stroke(); g.strokeStyle = IRON[0]; g.beginPath(); g.moveTo(mx - 14, py - 14); g.lineTo(mx - 8, tipY + 1); g.stroke();
      R(BRZ[4], mx - 9, tipY - 1, 3, 2);   /* the catch's tip */
      rope(mx - 15, py - 16, mx - 15, py - 10, 1); R(STONE[2], mx - 18, py - 10, 6, 5); R(STONE[3], mx - 18, py - 10, 6, 1); R(STONE[0], mx - 18, py - 6, 6, 1);   /* the stone that weights the pawl */
      if (!held && Math.sin(time * 30) > 0.3) glint(g, mx - 8, tipY - 3, '#fffbe0', 1);   /* the click of it */
      /* the pulleys: bronze sheaves in iron stirrups, the chair's rope over the left one */
      for (const qx of [cxp, bxp]) { R(IRON[1], qx - 4, py, 9, 3); R(IRON[3], qx - 4, py, 9, 1); g.fillStyle = BRZ[0]; g.beginPath(); g.arc(qx, py + 6, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = BRZ[2]; g.beginPath(); g.arc(qx, py + 6, 3.5, 0, Math.PI * 2); g.fill(); R(BRZ[4], qx - 1, py + 5, 2, 2); }
      /* the chair's cord: one rope up to the sheave, a bronze ring, four cords down to the arms - swaying once he is thrown out of it */
      const tilt = spilled ? Math.round(Math.sin(time * 7) * 3) : 0, ringY = cyp - 47;
      rope(cxp - 1, py + 11, cxp - 1, ringY - 2, 2);
      g.strokeStyle = BRZ[3]; g.lineWidth = 1; g.beginPath(); g.arc(cxp, ringY, 3, 0, Math.PI * 2); g.stroke(); R(BRZ[1], cxp - 1, ringY + 2, 3, 2);
      g.strokeStyle = ROPE[2]; g.beginPath(); g.moveTo(cxp - 2, ringY + 2); g.lineTo(cxp - 11 + tilt, cyp - 30); g.moveTo(cxp + 2, ringY + 2); g.lineTo(cxp + 11 + tilt, cyp - 30); g.moveTo(cxp - 1, ringY + 2); g.lineTo(cxp - 6 + tilt, cyp - 34); g.moveTo(cxp + 1, ringY + 2); g.lineTo(cxp + 6 + tilt, cyp - 34); g.stroke();
      /* THE BASKET CUE (claude/abbotp2, Daniel 10-29: how you hurt him must be CLEAR): while he sits in the chair, the BASKET glows - gold ripples and glints, as the bell does that blesses him on a bridge - three gold chevrons
         bob down onto it, and a line of gold beads runs the whole rope from the basket over the beam to his chair, so the link is drawn: this is what brings that down. Gone the moment the chair spills. */
      const cueOn = alive && ph === 2 && !spilled && (e.deck === 'chair' || ((e.mode === 'swing' || e.mode === 'swingTell') && e.swGoal && e.swGoal.deck === 'chair'));
      if (cueOn && H.basketY0 !== undefined) {
        const b0 = Math.round(H.basketY0 - cy), b1 = Math.round(floorY - 8 - cy), bY = Math.round(b0 + (b1 - b0) * k), pts = [[bxp, bY - 10], [bxp, py + 6], [cxp, py + 6], [cxp, cyp - 47]];
        let run = 0; const off = (time * 26) % 7;   /* beads every 7 px, marching from the basket toward the chair */
        for (let sI = 0; sI < pts.length - 1; sI++) { const [x0, y0] = pts[sI], [x1, y1] = pts[sI + 1], len = Math.hypot(x1 - x0, y1 - y0) || 1;
          for (let d = (7 - ((run + off) % 7)) % 7; d < len; d += 7) { const bx_ = Math.round(x0 + (x1 - x0) * d / len), by_ = Math.round(y0 + (y1 - y0) * d / len); g.globalAlpha = 0.95; R('#2a1c0c', bx_ - 1, by_ - 1, 4, 4); R(GOLD, bx_, by_, 2, 2); R('#fffbe0', bx_, by_, 1, 1); }
          run += len; }
        g.globalAlpha = 1;
        glow(bxp, bY + 4, 26 + 5 * p, 0.3 + 0.3 * p);
        for (let q = 0; q < 3; q++) { const ph2 = (time * 1.4 + q / 3) % 1; g.globalAlpha = (1 - ph2) * 0.8; g.strokeStyle = GOLD; g.lineWidth = 1; g.beginPath(); g.ellipse(bxp, bY + 6, 14 + ph2 * 16, 7 + ph2 * 9, 0, 0, Math.PI * 2); g.stroke(); } g.globalAlpha = 1;
        for (let q = 0; q < 4; q++) if (Math.sin(time * 6 + q * 2.2) > 0.1) glint(g, Math.round(bxp + Math.cos(time * 3 + q * 1.6) * 20), Math.round(bY + 3 + Math.sin(time * 3 + q * 1.6) * 8), '#fffbe0', 1);
        if (k < 0.04) for (let q = 0; q < 3; q++) { const u = (time * 1.1 + q / 3) % 1, yy = Math.round(bY - 44 + u * 26); g.globalAlpha = Math.sin(Math.PI * u) * 0.95;   /* the way in: chevrons pointing DOWN onto it */
          R('#2a1c0c', bxp - 7, yy - 1, 15, 4); R(GOLD, bxp - 6, yy, 3, 2); R(GOLD, bxp - 3, yy + 1, 3, 2); R(GOLD, bxp, yy + 2, 1, 2); R(GOLD, bxp + 1, yy + 1, 3, 2); R(GOLD, bxp + 4, yy, 3, 2); }
        g.globalAlpha = 1; }
      if (ring) { glow(cxp, cyp - 18, 28 + 4 * p, 0.3 + 0.3 * p); for (let q = 0; q < 3; q++) { const ph2 = ((time * 1.2 + q / 3) % 1); g.globalAlpha = (1 - ph2) * 0.5; g.strokeStyle = GOLD; g.beginPath(); g.ellipse(cxp, cyp - 18, 14 + ph2 * 14, 20 + ph2 * 10, 0, 0, Math.PI * 2); g.stroke(); } g.globalAlpha = 1; }
      /* THE CHAIR: a tall gabled back of bronze-gilt framing with the red velvet let into it, a mitre finial, gilt arms with bronze knobs, a cushion with its tassel, a footboard */
      const X = cxp + Math.round(tilt * 0.5);
      R('#1b0a10', X - 11, cyp - 33, 23, 34);
      R(BRZ[1], X - 11, cyp - 31, 23, 3); R(BRZ[3], X - 11, cyp - 31, 23, 1); R(BRZ[1], X - 8, cyp - 34, 17, 3); R(BRZ[3], X - 8, cyp - 34, 17, 1); R(BRZ[1], X - 4, cyp - 37, 9, 3); R(BRZ[3], X - 4, cyp - 37, 9, 1);   /* the gable, stepped */
      R(BRZ[4], X - 1, cyp - 41, 3, 5); R(BRZ[3], X - 3, cyp - 39, 7, 1);   /* the finial: a little cross-and-mitre */
      R(CLOTH[1], X - 9, cyp - 28, 19, 19); R(CLOTH[2], X - 8, cyp - 27, 6, 17); R(CLOTH[0], X + 5, cyp - 27, 4, 17);   /* the velvet, lit on the left */
      for (let r = 0; r < 4; r++) { R(BRZ[2], X - 6 + r * 4, cyp - 25, 1, 1); R(BRZ[2], X - 6 + r * 4, cyp - 17, 1, 1); R(BRZ[2], X - 6 + r * 4, cyp - 12, 1, 1); }   /* the buttons of the quilting */
      R(SAFF[1], X - 1, cyp - 28, 3, 19); R(SAFF[2], X, cyp - 28, 1, 19);   /* the orphrey up the back */
      R(BRZ[2], X - 12, cyp - 12, 3, 12); R(BRZ[3], X - 12, cyp - 12, 1, 12); R(BRZ[2], X + 10, cyp - 12, 3, 12); R(BRZ[3], X + 10, cyp - 12, 1, 12);   /* the arms */
      R(BRZ[4], X - 13, cyp - 14, 4, 3); R(BRZ[4], X + 10, cyp - 14, 4, 3);   /* with knobs */
      R(CLOTH[0], X - 11, cyp - 7, 23, 7); R(CLOTH[2], X - 11, cyp - 8, 23, 2); R(CLOTH[1], X - 10, cyp - 6, 21, 5); R(SAFF[1], X - 11, cyp - 8, 23, 1);   /* the seat's cushion */
      R(SAFF[1], X + 10, cyp - 3, 2, 6); R(SAFF[2], X + 10, cyp - 3, 1, 6); R(SAFF[1], X + 9, cyp + 3, 4, 2);   /* the tassel */
      R(BRZ[1], X - 9, cyp + 1, 19, 2); R(BRZ[3], X - 9, cyp + 1, 19, 1); R(BRZ[0], X - 9, cyp + 3, 19, 1);   /* the footboard */
    } }
  /* ---- THE PRAYER WHEEL'S HALO (phase three): a spinning bronze ring with its prayer strips, over the wheel that blesses him ---- */
  if (alive && ph === 3 && H.wheels && (praying && e.riteAt === 3 || warded)) { const wx = Math.round(H.wheels[e.riteWheel || 0].x - cx), wy = fy - 14;
    glow(wx, wy, 22 + 4 * p, 0.3 + 0.3 * p);
    for (let t = 0; t < 12; t++) { const an = time * 5 + t * Math.PI / 6; g.globalAlpha = 0.55 + 0.35 * p; R(t % 3 ? BRZ[3] : BRZ[4], wx + Math.cos(an) * 14 - 1, wy + Math.sin(an) * 14 - 1, t % 3 ? 2 : 3, t % 3 ? 2 : 3); }   /* the ring: studs counting round */
    for (let t = 0; t < 5; t++) { const an = -time * 3.4 + t * 1.26, rr = 19 + (t & 1) * 3; g.globalAlpha = 0.75; R(t & 1 ? CLOTH[3] : '#efe6d2', wx + Math.cos(an) * rr, wy + Math.sin(an) * rr * 0.8, 2, 4); }   /* prayer strips in the draught of it */
    g.globalAlpha = 1; g.lineWidth = 1; for (let t = 0; t < 3; t++) { const ph2 = (time * 0.9 + t / 3) % 1; g.globalAlpha = (1 - ph2) * 0.55; g.strokeStyle = GOLD; g.beginPath(); g.arc(wx, wy, 11 + ph2 * 12, 0, Math.PI * 2); g.stroke(); } g.globalAlpha = 1; }
  /* ---- HIS CENSER, SET DOWN ON ITS BRAZIER, AND THE SMOKE THAT LIFTS YOU ---- */
  if (alive && e.smoke) { const sx = Math.round(e.smoke.x - cx), N = 15;
    /* the column: puffs of incense billowing up and widening, warm at the foot, pale and thin at the head */
    for (let k = 0; k < N; k++) { const u = ((time * 0.45 + k / N) % 1), y = fy - 10 - u * (ABBOT.smokeH - 6), wob = Math.sin(time * 3 + k * 1.9 + u * 5) * (3 + u * 4), r = 5 + u * 6;
      g.globalAlpha = 0.5 * (1 - u * 0.75) * Math.min(1, u * 8 + 0.3); g.fillStyle = u < 0.2 ? '#e8c880' : u < 0.55 ? '#f0e4c8' : '#f6eee0';
      g.beginPath(); g.ellipse(sx + wob, y, r, r * 0.8, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha *= 0.7; g.fillStyle = '#fffaf0'; g.beginPath(); g.ellipse(sx + wob - r * 0.3, y - r * 0.2, r * 0.45, r * 0.35, 0, 0, Math.PI * 2); g.fill(); }
    g.globalAlpha = 1;
    /* the lift: gold chevrons riding up it, so it reads as a thing to stand in */
    for (let k = 0; k < 5; k++) { const u = ((time * 0.55 + k / 5) % 1), y = Math.round(fy - 14 - u * (ABBOT.smokeH - 26)), wb = Math.round(Math.sin(time * 3 + k * 1.9 + u * 5) * (3 + u * 4)); g.globalAlpha = 0.85 * Math.sin(Math.PI * u);
      R(GOLD, sx + wb, y - 2, 1, 1); R(GOLD, sx + wb - 1, y - 1, 1, 1); R(GOLD, sx + wb + 1, y - 1, 1, 1); R(GOLD, sx + wb - 2, y, 1, 1); R(GOLD, sx + wb + 2, y, 1, 1); }
    g.globalAlpha = 1;
    /* the brazier: three bronze feet, a bowl pierced for the coals, the lid propped open - the censer he set down */
    R(BRZ[0], sx - 7, fy - 2, 3, 2); R(BRZ[0], sx + 5, fy - 2, 3, 2); R(BRZ[0], sx - 1, fy - 2, 3, 2);
    R(BRZ[1], sx - 7, fy - 11, 15, 2); R(BRZ[3], sx - 7, fy - 11, 15, 1); R(BRZ[2], sx - 6, fy - 9, 13, 7); R(BRZ[3], sx + 2, fy - 9, 5, 7); R(BRZ[0], sx - 6, fy - 3, 13, 1);
    for (const dx of [-4, -1, 2, 5]) R(dx & 1 ? '#ff9a3c' : GOLD, sx + dx, fy - 7 + (dx & 1), 1, 2);   /* the coals through the piercing */
    R(BRZ[1], sx - 6, fy - 14, 13, 3); R(BRZ[3], sx - 6, fy - 14, 13, 1); R(BRZ[4], sx, fy - 16, 1, 2);
    glow(sx, fy - 10, 14 + 2 * p, 0.28); }
  /* ---- THE GREAT BELL, once he is beaten down: a pillar of light from the roof, rings of its note, and the way there from him ---- */
  if (alive && e.mode === 'beaten' && H.bellX !== undefined) { const gx = Math.round(H.bellX - cx), by = fy - 30;
    g.globalAlpha = 0.14 + 0.1 * p; R(GOLD, gx - 9, 0, 18, by); g.globalAlpha = 0.22 + 0.12 * p; R('#fffbe0', gx - 4, 0, 8, by); g.globalAlpha = 1;
    glow(gx, by, 30 + 6 * p, 0.38 + 0.4 * p);
    for (let q = 0; q < 3; q++) { const ph2 = (time * 0.85 + q / 3) % 1; g.globalAlpha = (1 - ph2) * 0.8; g.strokeStyle = q ? GOLD : '#fffbe0'; g.lineWidth = 2; g.beginPath(); g.ellipse(gx, by, 10 + ph2 * 36, 12 + ph2 * 30, 0, 0, Math.PI * 2); g.stroke(); } g.lineWidth = 1; g.globalAlpha = 1;
    for (let k = 0; k < 6; k++) glint(g, Math.round(gx + Math.cos(time * 2.6 + k * 1.05) * 22), Math.round(by + Math.sin(time * 2.6 + k * 1.05) * 18), '#fffbe0', 1 + (k & 1));
    for (let k = 0; k < 3; k++) { const bob = Math.round(Math.abs(Math.sin(time * 5 + k)) * 3); R(GOLD, gx - 4 + k * 3, by - 24 - bob + k % 2, 1, 1); }   /* three bright specks bobbing over the crown: strike here */
    const ex = Math.round(e.x - cx), dxs = gx - ex, steps = Math.min(14, Math.floor(Math.abs(dxs) / 14));
    for (let k = 0; k < steps; k++) { const u = ((time * 0.6 + k / steps) % 1); g.globalAlpha = Math.sin(Math.PI * u) * 0.7; R(GOLD, ex + dxs * u, fy - 14 - Math.sin(u * Math.PI) * 18, 2, 2); } g.globalAlpha = 1; }
}
