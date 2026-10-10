// src/foe-tactics.js - FEWER, BETTER, DEADLIER: WHAT A COMMON FOE DOES WITH ITS TURN (the combat pass, part 2; Daniel, 2026-09-28).
//
// Part 1 (src/attack-tokens.js) decided WHO may swing at a hero. This decides a few things about HOW, on the hooks part 1 left:
//
//   HELD WIND-UPS (board.on.grant). A handful of foes sometimes hold a told swing a beat longer before they let it go: the mark is up
//     the whole time and the blow comes when it comes down, so nothing is untold - but the hero who rolls the instant the ! appears
//     rolls into the swing. Only on the foes in HOLD, only sometimes (HOLD_CHANCE), never shortened, and never on a red !!: a heavy
//     is already the one thing coming, and it is read by its size, not by a guess.
//   REACTIVE WAITING (TOKENS.waitMove, per foe). A foe waiting its turn on the ring is no longer the same for everyone:
//     the SHIELD brings its shield round to you at its own slow pace (crossing behind it is still the lesson) and presses in close,
//     the ARCHER backs off to bow range instead of standing in a sword's reach,
//     the BRUTE, waiting, covers up: a third light cut in a row off the front is turned (braceHit) - a heavy blow still goes through.
//   SQUADS (the SPRINKLE-CUT lane, later). SQUAD is the hook: a squad's roles, and the purse bonus a banner will give. Nothing is
//     placed in any level here; the numbers are all zero until that lane sets them.
//
// main.js hooks it in with one call (installTactics) beside the token board, and one line in the melee hit loop (braceHit).

export const TAC = {
  HOLD: new Set(['brute|wind', 'soldier|slashTell', 'soldier|windUp', 'swornsword|cutTell', 'hedgeknight|swingTell', 'pike|tell', 'sprig|biteTell']),
  HOLD_CHANCE: 0.35,     // how often one of those swings is held
  HOLD_MIN: 0.2, HOLD_MAX: 0.35,   // added to the tell's own timer when it is (a tell's timer runs slower than the clock near the hero: on the screen, about a third to three fifths of a second more)
  archerRing: 112,       // px: a waiting archer keeps this far off (its own point-blank line is 40)
  shieldPress: 18,       // px: a waiting shield stands this much closer in than the ring
  shieldTurn: 0.8,       // s: how long the shield takes to bring its shield round (the shieldgob's own turn)
  braceWindow: 1.1,      // s: light cuts closer together than this are one flurry
  braceAt: 3,            // the cut of a flurry the brute turns
};

// THE SPRINKLE CUT (Daniel, 2026-09-29, "FEWER, BETTER FOES"). The garrison SPRINKLER (src/level.js garrison()) filled open floor with a grid of
// foes: "a dozen enemies, no challenge". Its rows are halved (sprinkle) and every level SECTION now stands at least one DESIGNED encounter, a
// squad the builder places on purpose: a shield covering a bow, a priest to kill first, a hornblower behind a brute, a heavy alone on a
// ledge; at a chokepoint, on a ledge, or beside spikes, water or barrels (garrison() scores every floor spot for exactly that).
// Sprinkled foes carry garrison:true, squad members carry squad:'<name>' and NOT garrison. tools/sprinkle-cap.mjs holds every level to
// the numbers below. PLAN is what each level's squads are made of, hero side first ('shield' first is the cover: it stands in front).
export const SPRINKLE = {
  sprinkle: 0.5,        // what is left of a garrison row after the cut (the old 0.75 * COMBAT.garrison stays, then this)
  screenW: 30, screenH: 22,   // a screen, in tiles (a tall level is measured by rows too)
  screenCap: 2,         // sprinkled foes in any one screen
  avgCap: 1.0,          // sprinkled foes per screen, averaged over the level (a wide level by columns, a tall one by rows)
  sectionW: 200, sectionH: 60,   // a SECTION: a wide level's columns / a tall level's rows; each holds >= 1 designed encounter
  gap: 22,              // tiles between two designed encounters
};
export const PLAN = {
  marsh: [['hopper', 'archer'], ['thorn', 'spit', 'archer']],
  spore: [['sporeling', 'weaver'], ['thorn', 'spitcap']],
  scree: [['goat', 'rockgoblin'], ['sapper']],
  hanging: [['rockgoblin', 'snuffer']],
  spire: [['rockgoblin', 'gobpriest', 'gobmage'], ['sentry', 'gobpriest']],
  moor: [['goat', 'rockgoblin'], ['troll']],
  storm: [['shield', 'archer'], ['brute', 'horn'], ['pike', 'gobpriest']],
  crown: [['shield', 'javelin'], ['heavy', 'javelin'], ['soldier', 'soldier', 'javelin']],
  longwater: [['tideguard', 'scout'], ['tideguard', 'netter']],
  reef: [['tideguard', 'scout'], ['sailor', 'netter']],
  hurricane: [['cutlass', 'scout'], ['tideguard', 'marine']],
  lamplit: [['tideguard', 'scout'], ['watch', 'wight'], ['tideguard', 'netter']],
  keep: [['tideguard', 'watch'], ['wight', 'watch', 'wight']],
  causeway: [['tideguard', 'scout'], ['cutlass', 'netter']],
  harbor: [['boarder', 'horn'], ['marine', 'bosun'], ['tideguard', 'scout']],
  fields: [['swornsword', 'wight'], ['hedgeknight']],
  burial: [['zombie', 'bonearcher'], ['husk', 'bonegob', 'bonearcher']],
  mage: [['armour', 'apprentice'], ['zombie', 'apprentice']],
  fallingtower: [['armour', 'apprentice']],
  burning: [['shield', 'archer', 'sapper'], ['pike', 'burngob']],
  caravan: [['cutthroat', 'cutthroat'], ['scorpion']],
  quarry: [['shield', 'archer'], ['brute', 'horn']],
  hunt: [['shield', 'archer'], ['soldier', 'javelin']],
  frost: [['wight', 'troll']],
  skyship: [['shield', 'archer'], ['boarder', 'horn']],
};

// THE SQUAD HOOK. roles: what each kind is in a squad; capBonus: what a squad's banner adds to a hero's purse (0 until the squad
// lane builds banners); coverFor: which squad member a shield covers. Read by main.js's TOKENS.cap and by nothing else yet.
export const SQUAD = {
  roles: { shield: 'cover', archer: 'shooter', crossbow: 'shooter', horn: 'caller', gobpriest: 'healer', bannerbearer: 'banner' },
  capBonus: () => 0,
  coverFor: () => null,
};

const rnd = () => Math.random();

export function installTactics(board, TOKENS, api) {
  /* HELD WIND-UPS: the grant is the moment the swing is allowed, and the tell is only ever lengthened */
  const prevGrant = board.on.grant;
  board.on.grant = e => {
    if (prevGrant) prevGrant(e);
    if (e.tokHeavy || !TAC.HOLD.has(e.t + '|' + e.mode) || !(e.modeT > 0) || (e.tokSnap && e.tokSnap.wu)) return;   /* (a swing already under way when it came under the purse is left alone) */
    if (rnd() >= TAC.HOLD_CHANCE) return;
    const add = TAC.HOLD_MIN + rnd() * (TAC.HOLD_MAX - TAC.HOLD_MIN);
    e.modeT += add; e.heldWind = add; board.stats.held = (board.stats.held || 0) + 1;
  };
  /* REACTIVE WAITING: one move per kind, the ring's own for everyone else */
  const ringMove = TOKENS.waitMove;
  const WAIT = {
    archer(e, hero, a, dt) {   /* backs off to bow range: a bow in a sword's reach is a bow wasted */
      e.tokRing = Math.max(e.tokRing || 0, TAC.archerRing); ringMove(e, hero, a, dt);
    },
    shield(e, hero, a, dt) {   /* presses in shield-first, and brings the shield round at its own pace */
      const f0 = e.face; e.tokRing = Math.max(30, (e.tokRing || 0) - TAC.shieldPress); ringMove(e, hero, a, dt);
      const want = Math.sign(hero.x - e.x) || f0;
      if (f0 !== want) { e.behindT = (e.behindT || 0) + dt; if (e.behindT >= TAC.shieldTurn) { e.face = want; e.behindT = 0; e.shoveCd = Math.max(e.shoveCd || 0, 0.5); if (api.turned) api.turned(e); } else e.face = f0; }
      else e.behindT = 0;
    },
    brute(e, hero, a, dt) {   /* waits covered up (braceHit): it paces the ring as anyone does */
      ringMove(e, hero, a, dt);
    },
  };
  TOKENS.waitMove = (e, hero, a, dt) => (WAIT[e.t] || ringMove)(e, hero, a, dt);
  /* an archer keeps no mode of its own (its bow is e.draw): standing about is not drawing, and it may be walked back to bow range */
  const standing = TOKENS.standing;
  TOKENS.standing = e => (e.t === 'archer' && e.mode === undefined ? !(e.draw > 0) && !e.horn : standing(e));
  TOKENS.cap = hero => TOKENS.perHero + (SQUAD.capBonus(hero) || 0);
  return { WAIT, ringMove };
}

// THE BRUTE COVERS UP. Called from the melee hit loop for a cut that meets a brute from the front: true means this cut is TURNED.
// A light cut is counted into a flurry (cuts less than braceWindow apart); the braceAt-th cut of a flurry is turned while the brute
// is standing about (walking, or waiting its turn) - never in its windup or its recovery (those are the hero's openings), never
// broken or reeling (more than a cut's own flinch), and never against a heavy blow, which is what goes through a guard.
export function braceHit(e, now, heavy) {
  if (e.t !== 'brute' || e.elite) return false;
  if (heavy || e.broken > 0 || (e.stagger || 0) > 0.45 || e.knock > 0) { e.flurryN = 0; return false; }   /* (a cut's own flinch is not an opening: a heavy blow's stagger, a reel or a break is) */
  if (!(now - (e.flurryAt ?? -99) < TAC.braceWindow)) e.flurryN = 0;
  e.flurryAt = now; e.flurryN = (e.flurryN || 0) + 1;
  if (e.flurryN >= TAC.braceAt && (e.mode === 'walk' || e.mode === undefined)) { e.flurryN = 0; return true; }
  return false;
}
