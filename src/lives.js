/* src/lives.js - THE LIVES OPTION (claude/lives, Daniel 11-07): a rule chosen at NEW SAVE, next to the (future) difficulty pick, stored in the save as
   PROG.lives = 'off' | 'on', LOCKED once the save has entered a level.
     OFF  (the pre-selected one, and every old save): today's death rules, nothing here runs.
     ON   5 lives each time a campaign level is entered; every 100 coins PICKED UP in that level grants +1 life ('+1 LIFE' + a chime); every death still
          follows the normal rules (shrine respawn, salt) AND costs a life; losing the last one is a GAME OVER card and back to the WORLD MAP (the next
          entry starts on 5 again). Co-op: ONE shared pool for the party (5 a level, +1 per 100 party coins); online the host's save rules, the host's pool.
   Boss Rush / Arena / Duel / tavern / trials / shops / Boss Select are not campaign levels: lives do not apply there (main.js livesActive).
   Pure: no page, no storage. The Settings > Iron Knight toggle (3 lives, no coin lives, a medal) is the older rule and stays as it was. */
export const LIVES_START = 5, LIVES_PER_COINS = 100;
export const LIVES_VALUES = ['off', 'on'];
export const livesOf = prog => (prog && prog.lives === 'on' ? 'on' : 'off');
export const isOn = prog => livesOf(prog) === 'on';
/* LOCKED once the save has entered a level: the flag set at the first campaign entry, or (a save that predates the flag) any level record */
export const lockedOf = (prog, levelIds = []) => !!(prog && (prog.livesLocked || levelIds.some(id => prog[id])));
/* the pick: only an unlocked save can change it; returns the value now in force */
export function setLives(prog, v, levelIds = []) {
  if (!prog || lockedOf(prog, levelIds) || !LIVES_VALUES.includes(v)) return livesOf(prog);
  prog.lives = v; return v;
}
export const lockIn = prog => { if (prog) prog.livesLocked = 1; return prog; };
/* the pool when a campaign level is entered */
export const startLives = prog => (isOn(prog) ? LIVES_START : Infinity);
/* coins picked up this level: returns the new running count and how many lives it earned (a pile of 9 can cross a hundred, so more than one is possible only
   in principle: a count never skips the hundred it crossed) */
export function coinTick(coins, n = 1) {
  const before = Math.floor(coins / LIVES_PER_COINS), now = coins + Math.max(0, n);
  return { coins: now, gained: Math.floor(now / LIVES_PER_COINS) - before };
}
/* a death: one life, and whether the game is over (the pool is empty) */
export function loseLife(lives) { const left = Math.max(0, lives - 1); return { lives: left, over: left <= 0 }; }
/* the word on the death toast */
export const leftWord = n => n + (n === 1 ? ' LIFE LEFT' : ' LIVES LEFT');
/* what the slot card says about a save */
export const cardTag = prog => (isOn(prog) ? 'LIVES' : '');
