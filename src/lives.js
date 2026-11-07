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

/* ---- DIFFPICK (Daniel 11-07): the DIFFICULTY row on the same new-save card. PROG.mode = 'story' | 'normal' | 'master' (src/difficulty.js MODES), NORMAL pre-selected
   and the value of every old save; LOCKED with LIVES at the first campaign entry (lockedOf). MASTER stays behind its device-wide unlock (a Normal clear of the road,
   difficulty.js masterUnlocked) unless the ?difficulty=master dev override is set. ---- */
import { MODES, MODE_IDS, modeId } from './difficulty.js';
export { MODES, MODE_IDS };
export const modeOf = prog => modeId(prog && prog.mode) || 'normal';
export const modeLabel = id => (MODES[id] || MODES.normal).label;
export const modeCol = id => (MODES[id] || MODES.normal).col;
/* one line each, from the MODES table's own comments */
export const MODE_BLURB = { story: 'half damage taken, an extra flask, shrines refill all', normal: 'the game as it was built', master: 'harder hits, boss reprisals, fewer flasks' };
export const MASTER_LOCKED_NOTE = 'MASTER UNLOCKS AFTER YOU CLEAR THE ROAD ON NORMAL';
/* the pick: an unlocked save only; MASTER only when `masterOpen`; returns the value now in force */
export function setMode(prog, v, levelIds = [], masterOpen = false) {
  if (!prog || lockedOf(prog, levelIds) || !MODE_IDS.includes(v) || (v === 'master' && !masterOpen)) return modeOf(prog);
  prog.mode = v; return v;
}
/* the neighbour in a direction on the VERY EASY / NORMAL / MASTER row (no wrap); setMode then refuses a locked MASTER */
export function stepMode(cur, dir) { const i = MODE_IDS.indexOf(modeId(cur) || 'normal'); return MODE_IDS[Math.max(0, Math.min(MODE_IDS.length - 1, i + (dir < 0 ? -1 : 1)))]; }
/* the slot card's read-only tags, left to right: [text, colour]. The mode shows once chosen (rulesSet) or when it is not NORMAL; old saves show only LIVES (if ON). */
export function cardTags(prog) {
  const t = [], m = modeOf(prog);
  if (prog && (prog.rulesSet || m !== 'normal')) t.push([modeLabel(m), modeCol(m)]);
  if (isOn(prog)) t.push(['LIVES', '#ffd36b']);
  return t;
}
