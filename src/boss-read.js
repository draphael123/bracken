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
     BR.takes / turnedKey / drawKey / keyOf   B14 VULNERABILITY KEYS (claude/keyscore): see KEYS below
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

/* B11: the duelists, and the way each one guards. 'front' = his face side ('GO ROUND' beats it from behind); 'wall' = from behind or from above (claude/keyscore); 'high' = a low blow or one from
   the air beats it; 'low' = a blow from the air beats it. A boss is here ONLY if his header says he is a duelist. */
export const GUARD = {
  ram: 'front',      // THE RAM LORD: his horns are his guard - from behind he is a beast like any other (claude/sweep1)
  chief: 'front',    // THE GOBLIN CHIEFTAIN: the shield on his arm - round it, or wait for his club in the ground (claude/sweep1)
  cisternqueen: 'front',   // THE CISTERN QUEEN: her raised claws on the floor - round her (claude/sweep3, Daniel 10-06: never fully invulnerable)
  /* (claude/keyscore, B13 CHIP SWEEP - Daniel 10-05: no waiting-room invulnerability) 'wall' = his front is a wall: a blow from behind him OR from above him
     (a plunge, or a hero in the air over his feet) beats it and lands at ANGLE.mul; from the front at his height it is TURNED (GO ROUND). In his
     openings (src/boss-greed.js OPEN_RULE) every blow lands whole. These four were a flat NO, or a twentieth, until he chose to open. */
  lance: 'wall',          // THE QUEEN'S LANCE: plate and shield on his front - round him or over him; committed (planted, thrusting, reeling) he is open
  closedhelm: 'wall',     // THE WAYMEET PALADIN: his ward faces you - round him or over him; his sword met on the beat still breaks it (x2)
  captain: 'wall',        // THE SALVAGE CAPTAIN: on his own wave the sea is in front of him - cut him from behind it or from above; beached he is open
  quarter: 'wall',        // THE QUARTERMASTER: EN GARDE (and her deck guard) offers the blade to the front - a cut into it is answered; round her or over her lands
};
export const ROLL_SOON = 'TOO SOON';   /* (claude/sweep2) the Waymeet Paladin: a roll that started before the last beat of his swing passes through and opens nothing */
export const ANGLE = { mul: 0.5, wall: 1, front: 0.4 };   /* (claude/keyscore, B15) THE DUELIST'S WALL (GUARD 'wall'): round or over it a blow lands WHOLE (wall); into it at his height ANGLE.front (0.4: somewhat resistant, never invulnerable) */

/* the word his turned blow says, per type (a string, or (e, fromX) => string). Anything not here: the guard's word, else WARDED. */
export const behind = (e, fromX) => Math.sign(fromX - e.x) === -(e.face || 1);   /* (claude/keyscore: exported - B14's FROM BEHIND key and every hands file ask the same question) */
export const TURN_WORD = {
  golem: TURN.STONE,
  mother: TURN.ARMOURED,
  king: 'THE CROWN',                                        // only a cage brings his head down
  ram: (e, fromX) => behind(e, fromX) ? TURN.WARDED : TURN.ROUND,
  chief: (e, fromX) => behind(e, fromX) ? TURN.WARDED : TURN.ROUND,
  frog: 'THE HIDE',
  windcaller: e => e.mode === 'blink' || e.mode === 'appear' || e.mode === 'gone' ? TURN.NOT_THERE : TURN.WARDED,
  grandmother: e => (e.ward > 0 ? TURN.WARDED : 'SHE HEARD YOU'),           // (claude/underleaf2) B14 FROM BEHIND: her front hears the blade and turns it; her ward after an opening
  winchmaster: 'IRON',                                      // his plate: jam his drum
  greathound: TURN.ROUND,                                   // (claude/hound) his jaws turn part of a blow into his face: go round, or come down on him
  queen: 'THE SWARM',                                       // her drones close over her
  /* (claude/sweep2) ACT II */
  captain: TURN.ROUND,                                      // (claude/keyscore, B13) on his wave or on his feet his front is a wall: round him or over him (was ON THE WAVE: wait for the beach)
  reefmaw: e => ['lurk', 'sink', 'sleep', 'drain'].includes(e.mode) ? 'IN ITS HOLE' : TURN.WARDED,   // in its hole: make it come out (the bait, the jaw)
  lance: TURN.ROUND,                                        // (claude/keyscore, B13) his plate faces you: round him or over him (was HIS PLATE: plate all round until he committed)
  kraken: 'NOT THE BODY',                                   // the body is out at sea: cut the arms on the road
  /* ACT III (claude/sweep3) */
  archmage: e => e.mode === 'ward' ? 'THE RUNES HOLD' : e.mode === 'blink' || e.mode === 'change' || e.mode === 'wake' ? TURN.NOT_THERE : e.stage === 2 ? 'REACH HIM' : TURN.WARDED,   // the runes take it; in a room he has written, the way through the room is the opening
  gargoyle: TURN.STONE,                                     // stone until he lies on the spikes
  gangleader: e => e.mode === 'dodge' ? TURN.NOT_THERE : 'NOT INTO HIS CUTS',   // his other blade guards while one is moving
  homunculus: e => e.hidden ? TURN.NOT_THERE : TURN.WARDED,  // in the smoke there is nothing there
  hawkmistress: e => (e.ward > 0 ? TURN.WARDED : 'HER GAUNTLET'),
  paladinboss: e => (e.ward > 0 ? TURN.WARDED : 'HIS AEGIS'),   // (claude/litchurch) his aegis turns the front while he guards (and drinks the blow into his light): go round, or come down on him   // (claude/ksar) her falconer's gauntlet turns the front while she is on guard: go round, or come down on her
  fogknight: e => (e.ward > 0 ? TURN.WARDED : e.mode === 'dissolve' ? TURN.NOT_THERE : 'HIS STANCE'),   // (claude/towpath) his stance turns the wrong angle: his own take names it (GUARDS HIGH / GUARDS LOW / FULL GUARD)
  lanterneater: e => (e.mode === 'open' ? TURN.WARDED : ['gulpTell', 'huntTell'].includes(e.mode) && e.part === 'lure' ? 'TOO LOW' : ['jaws', 'snapTell'].includes(e.mode) ? 'TOO HIGH' : TURN.WARDED),   // (claude/lanterneater) B14 keys: its lure HIGH, its gums LOW - the word names the wrong height (src/lantern-eater.js KEY_WORD)
  /* (claude/rootway) THE GOBLIN HUNTMASTER: the bow across him guards his front between moves (GO ROUND, or from a jump); in his ward after an opening, HE GUARDS */
  huntmaster: (e, fromX) => e.ward > 0 ? 'HE GUARDS' : behind(e, fromX) ? TURN.WARDED : TURN.ROUND,
  roc: e => e.ward > 0 ? TURN.WARDED : TURN.LOW,           // (claude/roc2) THE ROC: her feathers' ward after an opening; else her talons guard low - strike her from the air (src/roc-eyrie.js)
};
/* ==== B14, VULNERABILITY KEYS (claude/keyscore, design-standard B14; scratch/audit-keys.md section 2): ONE TABLE FOR "WHICH OF MY ATTACKS OPENS HIM".
   A BEAST / CONSTRUCT / PUZZLE boss phase may be keyed to ONE attack the player controls. The boss SHOWS its key (a per-key glyph, drawKeyGlyph)
   and a blow that is not the key is TURNED and NAMES it (the key's word: FROM ABOVE, FROM BELOW, THROW IT, HEAVY...). DUELISTS are exempt (B11).
   THE BLOW TAG: main.js hurtAs(tag, ...) names every hero blow - 'light' 'heavy' 'sweep' 'rise' 'plunge' 'dash' 'shot', and now also 'throw' (a carried
   prop thrown onto a foe), 'reflect' (a seed sent back onto its owner) and 'riposte' (a cut out of a parry, added to the melee verb). Every boss hook
   in hurtEnemy0/wardedDamage receives that tag (tools/blow-tags.mjs checks it); the old 'plunge' boolean is the hero's own body only.
     KEYS[k]          { word, col, tags, glyph, teach, how }: the tags that ARE the key (any one), the word a wrong blow says, the trial yard that teaches it.
     KEY_ROWS[type]   [{ ph, key, word? }]: a boss's keyed phases (ph: e.phase / e.stage number, or '*'). EMPTY in keys-core: the per-act key lanes add rows.
     keyOf(e)         his row for the phase he is in, or null.  keyed(key, tag, e, fromX): does this blow satisfy that key?
     BR.takes(e, tag, fromX)  -> null (no key row) | { key, ok, word }.  BR.turnedKey(e, fromX, key): the turned read with the key's word + its glyph flash.
     BR.drawKey(g, e, cx, cy, t)  his key's glyph (main.js draws it over every keyed boss and mini); drawKeyGlyph(g, key, x, y, t, s) the bare glyph.
   EVERY HERO HAS EVERY KEY WITH BASE KIT (audit-keys.md section 2): the riposte key also takes a REFLECT (every hero's swing sends an owned seed back),
   because the warden and the pyromancer have no riposte window; the pyromancer's plunge is her FIREDROP, tagged 'plunge' (never by the boolean). */
export const KEYS = {
  plunge:  { word: 'FROM ABOVE',  col: '#ffd36b', tags: ['plunge'],             glyph: 'above',  teach: 'pogo',      how: 'down + attack in the air (the pyromancer: her FIREDROP)' },
  rise:    { word: 'FROM BELOW',  col: '#9fe8ff', tags: ['rise'],               glyph: 'below',  teach: 'rise',      how: 'up + attack (the rising cut, the air up-cut)' },
  sweep:   { word: 'SWEEP LOW',   col: '#8fd160', tags: ['sweep'],              glyph: 'low',    teach: 'sweep',     how: 'down + attack on the ground (the knight trip, the warden poke, her fire on the floor)' },
  behind:  { word: 'FROM BEHIND', col: '#e0b0ff', tags: [],                     glyph: 'back',   teach: null,        how: 'any blow from his back (position, not a verb)' },
  throw:   { word: 'THROW IT',    col: '#ffb070', tags: ['throw'],              glyph: 'target', teach: null,        how: 'carry a prop and attack: it is thrown (src/throwables.js, src/carry-throw.js)' },
  heavy:   { word: 'HEAVY',       col: '#ff8a5c', tags: ['heavy'],              glyph: 'crack',  teach: 'heavyblow', how: 'hold attack (the pyromancer: her bellows)' },
  riposte: { word: 'PARRY HIM',   col: '#fff3b0', tags: ['riposte', 'reflect'], glyph: 'parry',  teach: 'parry',     how: 'a cut out of a parry, or his own shot sent back by a swing' },
  verb:    { word: 'USE THE PLACE', col: '#ffd36b', tags: ['verb'],             glyph: 'ring',   teach: null,        how: "the level's own act (OPEN_RULE in src/boss-greed.js makes the window)" },
};
export const KEY_ORDER = ['plunge', 'rise', 'sweep', 'behind', 'throw', 'heavy', 'riposte', 'verb'];
/* the blow tags that are NOT a hero's hand on the boss: the ROOM's blow (src/boss-greed.js: a mechanic lands whole, is never chipped and is never greed) */
export const ROOM_TAGS = ['throw', 'reflect'];
export const tagHas = (b, v) => !!b && (b === v || (Array.isArray(b) && b.includes(v)));
export const roomBlow = b => ROOM_TAGS.some(v => tagHas(b, v));
/* the keyed phases, per boss type: [{ ph: 1 | 2 | 3 | '*', key: 'plunge' | ..., word?: a word of his own instead of the key's }] */
export const KEY_ROWS = {};
export function keyOf(e) { const rows = e && KEY_ROWS[e.t]; if (!rows || !rows.length) return null; const ph = e.phase ?? e.stage ?? 1;
  return rows.find(r => r.ph === ph) || rows.find(r => r.ph === '*') || null; }
export function keyed(key, tag, e, fromX) { const K = KEYS[key]; if (!K) return false;
  if (key === 'behind') return !!e && fromX !== undefined && behind(e, fromX);
  return K.tags.some(v => tagHas(tag, v)); }
/* THE GLYPH: one small drawing per key, in its colour, over (or under) the boss - the shared helper so no lane invents its own (audit-keys 2f).
   x, y: the point it is drawn at (glyphAt: his head for the high keys, his feet for the low ones); t: the clock; s: scale (1). */
export function drawKeyGlyph(g, key, x, y, t, s = 1) {
  const K = KEYS[key]; if (!g || !K) return false; const k = 0.5 + 0.5 * Math.sin((t || 0) * 6), a = 0.55 + 0.35 * k;
  g.save(); g.globalAlpha = a; g.strokeStyle = K.col; g.fillStyle = K.col; g.lineWidth = Math.max(1, Math.round(s * 1.5)); g.beginPath();
  const chev = (cx, cy, dir) => { g.moveTo(cx - 5 * s, cy - 3 * s * dir); g.lineTo(cx, cy + 2 * s * dir); g.lineTo(cx + 5 * s, cy - 3 * s * dir); };
  switch (K.glyph) {
    case 'above':  chev(x, y - 4 * k * s, 1); chev(x, y + 3 * s - 4 * k * s, 1); break;                               /* chevrons pointing DOWN onto him */
    case 'below':  chev(x, y + 4 * k * s, -1); chev(x, y - 3 * s + 4 * k * s, -1); break;                             /* chevrons pointing UP from his feet */
    case 'low':    g.moveTo(x - 12 * s, y); g.lineTo(x + 12 * s, y); g.moveTo(x - 8 * s, y + 3 * s); g.lineTo(x + 8 * s, y + 3 * s); break;   /* a sweep line at his feet */
    case 'back':   g.arc(x, y, 8 * s, Math.PI * 0.2, Math.PI * 1.1); g.moveTo(x - 8 * s, y + 2 * s); g.lineTo(x - 11 * s, y - 2 * s); break;   /* round his back */
    case 'target': g.arc(x, y, 7 * s, 0, Math.PI * 2); g.moveTo(x + 3 * s, y); g.arc(x, y, 3 * s, 0, Math.PI * 2); break;   /* a ring to throw at */
    case 'crack':  g.moveTo(x - 6 * s, y - 6 * s); g.lineTo(x - 1 * s, y - 1 * s); g.lineTo(x - 4 * s, y + 2 * s); g.lineTo(x + 6 * s, y + 7 * s); break;   /* a seam a heavy breaks */
    case 'parry':  g.moveTo(x - 6 * s, y + 6 * s); g.lineTo(x + 6 * s, y - 6 * s); g.moveTo(x - 6 * s, y - 6 * s); g.lineTo(x + 6 * s, y + 6 * s); break;   /* crossed blades */
    default:       g.arc(x, y, 9 * s, 0, Math.PI * 2);                                                               /* the place's own ring */
  }
  g.stroke(); g.restore(); return true;
}
/* WHERE A KEY'S GLYPH SITS on him: over his head for the keys that come from above or meet his body, at his feet for the low and the rising ones,
   at his back for FROM BEHIND */
export const glyphAt = (key, e) => { const low = key === 'sweep' || key === 'rise';
  return { x: e.x + (key === 'behind' ? -(e.face || 1) * ((e.w || 20) / 2 + 6) : 0), y: low ? e.y + 4 : e.y - (e.h || 20) - 10 }; };
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
      const kr = keyOf(e); return turned(e, fromX, kr ? (kr.word || KEYS[kr.key].word) : undefined); },   /* (claude/keyscore) a keyed boss's turned blow NAMES his key (B14) */
    keyOf,
    /* B14: is this blow his key? null when he has no keyed phase now (his own code and the chip decide, as before) */
    takes(e, tag, fromX) { const r = keyOf(e); if (!r) return null; const ok = keyed(r.key, tag, e, fromX); return { key: r.key, ok, word: r.word || KEYS[r.key].word }; },
    /* B14: a wrong blow on a keyed boss - the turned read with the KEY'S word, and his glyph flashes in its colour */
    turnedKey(e, fromX, key) { const K = KEYS[key] || KEYS.verb, r = keyOf(e), ok = turned(e, fromX, (r && r.key === key && r.word) || K.word);
      if (ok && e) { const at = glyphAt(key, e); api.ring(at.x, at.y, 14, K.col, 0.22); e.keyFlash = api.time(); } return ok; },
    /* B14: his key's glyph, drawn over every keyed boss and mini (main.js drawWorld): g the canvas, cx/cy the camera */
    drawKey(g, e, cx, cy, t) { const r = keyOf(e); if (!r || !e || !e.alive) return false; const at = glyphAt(r.key, e), hot = e.keyFlash !== undefined && t - e.keyFlash < 0.3;
      return drawKeyGlyph(g, r.key, Math.round(at.x - cx), Math.round(at.y - cy), t, hot ? 1.4 : 1); },
    beats(e, fromX, air, low) { const g = e && GUARD[e.t]; if (!g || !e.alive) return false;
      return g === 'front' ? behind(e, fromX) : g === 'wall' ? behind(e, fromX) || !!air : g === 'high' ? !!(air || low) : g === 'low' ? !!air : false; },
  };
}
