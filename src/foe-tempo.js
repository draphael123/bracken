// src/foe-tempo.js - TIGHTER, STILL TOLD: THE COMMON FOES' TEMPO IN ONE PLACE (claude/combat3, the combat pass; Daniel 2026-10-01).
//
// Daniel's target is HOLLOW KNIGHT / SALT & SANCTUARY: foes deadly one-on-one through damage and AI, never through more health. A common
// foe's windups are hundreds of literals inside its own update (e.mode = 'slashTell'; e.modeT = 0.5), so there was no one knob for
// "tighter". This is it: the moment a windup is GRANTED its turn (src/attack-tokens.js claim -> board.on.grant), before anything else
// (foe-tactics' held wind-ups add their beat after this), its own timer is cut to TEMPO.tell of itself - never under TEMPO.tellFloor,
// and a windup already that short is left alone. A red !! (a heavy, which comes alone) keeps its full length. The mark is the same mark and it is up the whole time: tighter, still told.
// And when a foe gives its token back after its blow, the cooldown it is reloading on runs TEMPO.recover of what was left (a quicker
// next blow), and TOKENS.rest (the wait before the same foe asks again) is TEMPO.rest.
//
// ONLY foes whose windup counts down on e.modeT are tightened: TIGHT is the list measured by tools/foe-tempo.mjs (a foe whose tell is
// a bow's draw, a charge to a range, or a timer of its own is left as it was, and listed there). Bosses, minis and the adds of their
// fights are outside the purse (TOKENS.exempt) and so outside this too: their tells are their scripts' and have their own floors.
// main.js hooks it with one call (installTempo) before installTactics.

export const TEMPO = {
  on: true,
  probeAll: false,    // tools/foe-tempo.mjs only: tighten every granted windup, to measure which ones count down on e.modeT
  tell: 0.8,          // a common foe's told windup runs this much of its own length (Daniel 10-01: "tighter (still told) windups")
  tellFloor: 0.3,     // s: never shorter than this (a human reads a mark in about a quarter of a second); a tell already under it is left
  recover: 0.75,      // what is left of its reload when it gives its token back (Daniel 10-01: "faster recovery")
  recoverFloor: 0.2,  // s: a reload is never cut under this
  rest: 0.55,         // TOKENS.rest: s before the same foe may ask for its next turn (was 0.7)
};

/* THE WINDUPS THAT COUNT DOWN ON e.modeT (type|mode), measured by tools/foe-tempo.mjs: a foe set beside a standing hero, its windup
   timed with TEMPO off and on. A kind|mode not here is never touched. */
/* (54, measured 2026-10-01 with --probe: each came out at x0.79-0.86 of its own length. Left alone, and why: a red !! keeps its length;
   the sprig (its held wind-up made its plain length too noisy to time); the cutthroat, scorpion, slinger, gaffer, berserker, tome, horn,
   hopper, hound, thief, sapper, shardling, emberwisp, spitcap time their tells on a clock of their own or tell in red; the crossbow, sworn
   sword and hedge knight carry a health bar and are not timed here; the angler, eel, gar, jelly, puffer, lamprey, urchin need water and
   the imp and turret their own level) */
export const TIGHT = new Set([
  'apprentice|grabTell', 'armour|swingTell', 'assassin|stabTell', 'badger|chargeTell', 'bannerbearer|plantTell', 'bannerbearer|poleTell',
  'bellguard|hookTell', 'boarder|throwTell', 'bonecorsair|cutTell', 'broom|dashTell', 'brute|wind', 'burngob|swingTell',
  'crab|pinchTell', 'cutlass|slashTell', 'drownedcaptain|comboTell', 'drownedcaptain|lungeTell', 'drownedknight|lungeTell', 'farmhand|swingTell',
  'feeler|lashTell', 'fledgling|peckTell', 'gobmage|boltTell', 'gobpriest|censerTell', 'haunt|throwTell', 'hearthgob|raise',
  'heronfoe|strikeTell', 'husk|grabTell', 'kite|dropTell', 'lanternshade|flareTell', 'lurker|springTell', 'manta|diveTell',
  'marine|shootTell', 'merrowbrute|ramTell', 'merrowspear|throwTell', 'miner|swingTell', 'netter|castTell', 'prise|reachTell',
  'propman|raise', 'pumpkin|biteTell', 'rook|diveTell', 'sailor|hookTell', 'sheargob|snipTell', 'shield|shoveTell',
  'snuffer|swipeTell', 'soldier|slashTell', 'spit|spitTell', 'sporeling|biteTell', 'sweep|popTell', 'thorn|wind',
  'tideguard|thrustTell', 'tidemarauder|harpoonTell', 'topiary|swipeTell', 'turtle|snapTell', 'weaver|spitTell', 'zombie|grabTell',
]);

export function installTempo(board, TOKENS) {
  TOKENS.rest = TEMPO.rest;
  const prevGrant = board.on.grant;
  board.on.grant = e => {
    if (prevGrant) prevGrant(e);
    if (!TEMPO.on || e.tokHeavy || (e.tokSnap && e.tokSnap.wu) || !(e.modeT > TEMPO.tellFloor) || !(TEMPO.probeAll || TIGHT.has(e.t + '|' + e.mode))) return;   /* (probeAll: tools/foe-tempo.mjs measuring which kinds count down) */
    const t0 = e.modeT; e.modeT = Math.max(TEMPO.tellFloor, t0 * TEMPO.tell); e.tempoCut = t0 - e.modeT; board.stats.tight = (board.stats.tight || 0) + 1;
  };
  const prevRelease = board.on.release;
  board.on.release = (e, why) => {
    if (prevRelease) prevRelease(e, why);
    if (!TEMPO.on || why !== 'done' || !e.alive) return;
    if (typeof e.cd === 'number' && e.cd > TEMPO.recoverFloor) e.cd = Math.max(TEMPO.recoverFloor, e.cd * TEMPO.recover);
  };
}
