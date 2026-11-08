// src/attract.js - ATTRACT MODE (claude/intro, Daniel 11-08): after about twenty seconds idle on the title (the scene or the main menu), the game plays short clips of itself
// like an arcade cabinet - a bot walks and fights a few of the first woods for about nine seconds each: platforming, a co-op pair, a boss glimpse. ANY key, click, tap or pad
// press ends it at once and is NOT also a menu choice. It never touches the save: main.js runs it behind the same sandbox flag as the boss jump (bossJumpOn: no saveProgress, no
// credit, no records), on a copy of PROG that is put back, and tools/attract.mjs compares every localStorage key before and after.
// This file is the pure part: the timing, the clip list and the "may it start now" rule. main.js owns the state and the bot's hands (the playtest walker + the lab's duel hands).

export const IDLE_S = 20;        // seconds idle on the title before the first clip
export const CLIP_S = 9;         // each clip, about 8-10 s
export const FADE_S = 0.5;       // the last half second of a clip fades to black; the next comes up out of it
export const PRELOAD_S = 8;      // the bot's modules are fetched this far into the wait, so the first clip is not held for a download
export const SWALLOW_MS = 260;   // the press that ends a clip, and the ones right behind it, never reach the title menu

/* THE CLIPS, all from the first act (the demo's own slice, so a fresh player sees nothing they have not met a screen of): the free starters only, no hero who is bought.
   kind 'run': he walks the wood from its door; 'boss': he stands at the boss's door and the fight wakes; buddy: the computer partner of a co-op pair (the game's own AI seat). */
export const CLIPS = [
  { id: 'wood-run',   level: 'wood',  hero: 'ranger',    kind: 'run' },
  { id: 'marsh-pair', level: 'marsh', hero: 'knight',    kind: 'run', buddy: 'geomancer' },
  { id: 'tusker',     level: 'wood',  hero: 'warden',    kind: 'boss' },
  { id: 'spore-run',  level: 'spore', hero: 'geomancer', kind: 'run' },
];

/* WHY IT MAY NOT START (the first reason, or '' when it may). Everything the caller knows goes in; nothing here reads the game. */
export function blockedBy(c) {
  if (c.off) return 'switched off (?noattract, a tool, or a page that said so)';
  if (c.reduceMotion) return 'reduce-motion is on';
  if (c.noAudio) return 'the sound is not unlocked yet (no first press: the clips would carry the sound banner)';
  if (c.state !== 'title') return 'not on the title';
  if (c.pressCard) return 'the press prompt is still up';
  if (c.titleSub) return 'a submenu is open';
  if (c.overlay) return 'a screen or form is open over the title';
  if (c.savePrompt) return 'a save prompt or a save problem is up';
  if (c.hidden) return 'the page is hidden';
  return '';
}

/* ONE STEP OF THE IDLE CLOCK: any press, held key or touch zeroes it; a blocked title keeps it at zero; otherwise it counts. */
export const idleStep = (idle, dt, blocked, touched) => (blocked || touched) ? 0 : idle + dt;

/* THE CLIP AFTER i, or -1 when the pass is over (the whole list plays once, then the title again until the next wait) */
export const nextClip = (i, n = CLIPS.length) => i + 1 < n ? i + 1 : -1;
