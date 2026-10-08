/* THE TURNED BLOW, ONE READ FOR EVERY BOSS AND MINI (claude/sweep1; design-standard B10 + B11, Daniel 10-05: "not always clear when the
   boss is vulnerable"). A hero's blow that MEETS a boss or a mini and takes nothing off him is never silent: it CLANKS, it FLASHES where it
   struck (a pale ring and sparks), and a short WORD floats over him that says what beats it (WARDED, GO ROUND, GUARDS HIGH...). Every blow,
   not the first one: the word is renewed, never stacked.

   THE API (small and stable - the other sweep lanes merge this branch and call it; add a boss by adding a row, never by changing a call):
     import { makeBossRead, TURN, TURN_WORD, GUARD } from './boss-read.js';
     const BR = makeBossRead(api)      api = { time(), clank(), sparks(x, y, dir, n), ring(x, y, r, col, life), word(x, y, txt, col), hitstop(t) }
     BR.turned(e, fromX, word?, o?)    a blow met him and did nothing: the clank, the flash, the word (default: wordOf). Once a frame per boss.
                                       o.stop === false: no hitstop (a blade that ALSO lands on something else in the same swing).
     BR.auto(e, fromX, was)            main.js hurtEnemy calls it after EVERY blow on a boss or a mini (was = { hp, mode, broken }, before the
                                       blow): struck, not hurt, not moved off his mode and not broken by it -> turned(e, fromX). A blow his own
                                       code already answered (turned() this frame) is not answered twice.
     BR.beats(e, fromX, air, low)      B11, GUARD BY ANGLE: a duelist (GUARD has his type) guards one way; a blow from the other way BEATS the
                                       guard and is not chipped (main.js lands it at ANGLE.mul of the blow). false for everyone else.
     BR.wordOf(e, fromX)               the word his turned blow says (TURN_WORD, else the guard's, else WARDED)
     BR.saidAt(e)                      the time turned() last ran for him (-1 if never)
   Words are drawn by api.word, which floats them like a move word (main.js turnWord: renewed in place, never stacked, off with the
   numbers setting). Sounds are api.clank: the one clank the shield family already uses. */

export const TURN = {
  WARDED: 'WARDED',            // a ward or a shell: wait for (or make) his opening
  ROUND: 'GO ROUND',           // he guards his front: hit him from behind
  HIGH: 'GUARDS HIGH',         // he guards high: hit low (a crouch cut, a sweep) or come down on him from a jump
  LOW: 'GUARDS LOW',           // he guards low: strike high (from a jump)
  STONE: 'STONE',              // stone does not bleed: the level's rule cracks him
  ARMOURED: 'ARMOURED',        // the body is armour: the weak point is elsewhere
  NOT_THERE: 'NOT THERE',      // nothing there to cut (between stones, vanished)
};

/* B11: the duelists, and the way each one guards. 'front' = his face side ('GO ROUND' beats it from behind); 'high' = a low blow or one from
   the air beats it; 'low' = a blow from the air beats it. A boss is here ONLY if his header says he is a duelist. */
export const GUARD = {
  ram: 'front',      // THE RAM LORD: his horns are his guard - from behind he is a beast like any other (claude/sweep1)
  chief: 'front',    // THE GOBLIN CHIEFTAIN: the shield on his arm - round it, or wait for his club in the ground (claude/sweep1)
  cisternqueen: 'front',   // THE CISTERN QUEEN: her raised claws on the floor - round her (claude/sweep3, Daniel 10-06: never fully invulnerable)
};
export const ROLL_SOON = 'TOO SOON';   /* (claude/sweep2) the Waymeet Paladin: a roll that started before the last beat of his swing passes through and opens nothing */
export const ANGLE = { mul: 0.5 };   // a blow that beats the guard lands at half (his openings still pay more: they are not chipped either, and his own code's multipliers stand)

/* the word his turned blow says, per type (a string, or (e, fromX) => string). Anything not here: the guard's word, else WARDED. */
const behind = (e, fromX) => Math.sign(fromX - e.x) === -(e.face || 1);
export const TURN_WORD = {
  golem: TURN.STONE,
  mother: TURN.ARMOURED,
  king: 'THE CROWN',                                        // only a cage brings his head down
  ram: (e, fromX) => behind(e, fromX) ? TURN.WARDED : TURN.ROUND,
  chief: (e, fromX) => behind(e, fromX) ? TURN.WARDED : TURN.ROUND,
  frog: 'THE HIDE',
  windcaller: e => e.mode === 'blink' || e.mode === 'appear' || e.mode === 'gone' ? TURN.NOT_THERE : TURN.WARDED,
  grandmother: e => (e.alpha !== undefined && e.alpha < 0.35) || e.mode === 'vanish' ? TURN.NOT_THERE : TURN.WARDED,
  winchmaster: 'IRON',                                      // his plate: jam his drum
  greathound: TURN.WARDED,
  queen: 'THE SWARM',                                       // her drones close over her
  /* (claude/sweep2) ACT II */
  captain: e => e.mode === 'ride' ? 'ON THE WAVE' : TURN.WARDED,                   // he rides the wave he called: wait for it to beach him
  reefmaw: e => ['lurk', 'sink', 'sleep', 'drain'].includes(e.mode) ? 'IN ITS HOLE' : TURN.WARDED,   // in its hole: make it come out (the bait, the jaw)
  lance: 'HIS PLATE',                                       // plate all round until he plants or reels: step off his line
  kraken: 'NOT THE BODY',                                   // the body is out at sea: cut the arms on the road
  /* ACT III (claude/sweep3) */
  archmage: e => e.mode === 'ward' ? 'THE RUNES HOLD' : e.mode === 'blink' || e.mode === 'change' || e.mode === 'wake' ? TURN.NOT_THERE : e.stage === 2 ? 'REACH HIM' : TURN.WARDED,   // the runes take it; in a room he has written, the way through the room is the opening
  gargoyle: TURN.STONE,                                     // stone until he lies on the spikes
  gangleader: e => e.mode === 'dodge' ? TURN.NOT_THERE : 'NOT INTO HIS CUTS',   // his other blade guards while one is moving
  homunculus: e => e.hidden ? TURN.NOT_THERE : TURN.WARDED,  // in the smoke there is nothing there
  hawkmistress: e => (e.ward > 0 ? TURN.WARDED : 'HER GAUNTLET'),   // (claude/ksar) her falconer's gauntlet turns the front while she is on guard: go round, or come down on her
  lanterneater: e => (e.mode === 'open' ? TURN.WARDED : ['gulpTell', 'huntTell'].includes(e.mode) && e.part === 'lure' ? 'TOO LOW' : ['jaws', 'snapTell'].includes(e.mode) ? 'TOO HIGH' : TURN.WARDED),   // (claude/lanterneater) B14 keys: its lure HIGH, its gums LOW - the word names the wrong height (src/lantern-eater.js KEY_WORD)
  /* (claude/rootway) THE GOBLIN HUNTMASTER: the bow across him guards his front between moves (GO ROUND, or from a jump); in his ward after an opening, HE GUARDS */
  huntmaster: (e, fromX) => e.ward > 0 ? 'HE GUARDS' : behind(e, fromX) ? TURN.WARDED : TURN.ROUND,
  roc: e => e.ward > 0 ? TURN.WARDED : TURN.LOW,           // (claude/roc2) THE ROC: her feathers' ward after an opening; else her talons guard low - strike her from the air (src/roc-eyrie.js)
};
const COL = '#d8e2ee', RING = '#eef4ff';

export function makeBossRead(api) {
  const said = new WeakMap();
  const wordOf = (e, fromX) => { const w = TURN_WORD[e.t]; if (typeof w === 'function') return w(e, fromX); if (w) return w;
    const g = GUARD[e.t]; return g === 'front' ? TURN.ROUND : g === 'high' ? TURN.HIGH : g === 'low' ? TURN.LOW : TURN.WARDED; };
  function turned(e, fromX, word, o) {
    if (!e) return false; const t = api.time(); if (said.get(e) === t) return true; said.set(e, t);
    const dir = Math.sign(fromX - e.x) || 1, hx = e.x + dir * Math.min(14, (e.w || 20) / 2), hy = e.y - (e.h || 20) * 0.55;
    api.clank(); api.ring(hx, hy, 12, RING, 0.16); api.sparks(hx, hy, dir, 4); if (!(o && o.stop === false)) api.hitstop(0.03);
    api.word(e.x, e.y - (e.h || 20) - 16, word || wordOf(e, fromX), COL);
    return true; }
  return {
    turned, wordOf,
    saidAt: e => (said.has(e) ? said.get(e) : -1),
    auto(e, fromX, was) {
      if (!e || !e.alive || !was || e.mode === 'sleep' || e.mode === 'wake') return false;
      if (e.hp < was.hp || e.mode !== was.mode || (e.broken || 0) > (was.broken || 0)) return false;
      return turned(e, fromX); },
    beats(e, fromX, air, low) { const g = e && GUARD[e.t]; if (!g || !e.alive) return false;
      return g === 'front' ? behind(e, fromX) : g === 'high' ? !!(air || low) : g === 'low' ? !!air : false; },
  };
}
