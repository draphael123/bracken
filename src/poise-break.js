// src/poise-break.js - THE BREAK, ON EVERY COMMON FOE, AND OPEN WHILE IT LASTS (the combat pass, part 2; Daniel, 2026-09-28).
//
// The stagger bar (addPoise in main.js) already broke a foe with its own sound (SFX.poiseBreak), a white flare round the
// silhouette (breakFlash) and a half-frame stop. Two things were missing for "a visible poise break on common foes":
//   1. TWENTY-FIVE COMMON FOES CARRIED NO BAR AT ALL - they were in no family of the family table, so nothing broke them: the
//      caravan's bandits, the Unburied Field's dead, the drowned knights, the scorpion, the vulture, the sheargob and more. They
//      carry one now (POISE_EXTRA: the light bar a heavy blow empties; POISE_EXTRA_HEAVY: the heavy infantry's forty).
//   2. BROKEN LOOKED LIKE STANDING STILL once the flare was gone. A broken common foe now STANDS OPEN for the whole break: it reels
//      back off its guard (staggerPose, read by poseOf), a ring of gold stars turns over its head (drawOpen), and - when a hero is
//      close enough to finish it - the stars close in and go white (the finisher's tell, src/finishers.js).
// The hooks in main.js: poiseMax reads the two sets, addPoise's break calls broke(e), poseOf calls staggerPose, drawEnemies calls
// drawOpen. BK.combat2().breaks counts breaks for tools/poise-break.mjs.

export const POISE_EXTRA = new Set(['ambusher', 'apprentice', 'bannerbearer', 'bonegob', 'burngob', 'corpse', 'cutthroat', 'feeler', 'husk',
  'jelly', 'lanternshade', 'merrowcaller', 'sheargob', 'slinger', 'tippler', 'vulture', 'zombie']);
export const POISE_EXTRA_HEAVY = new Set(['bonecorsair', 'drownedcaptain', 'drownedknight', 'gaffer', 'scorpion', 'tidemarauder']);

export const OPEN = { breaks: 0, lean: 0.22, starR: 7, stars: 3, retell: 0.35 };

/* a common foe (not a boss, a mini, an elite captain or a boss's own add) that is broken right now */
/* (not maxHp: the Waymeet's sworn swords and hedge knights carry one and are the common roster all the same - main.js familyOf) */
export const openCommon = (e, bossLike) => !!(e && e.alive && e.broken > 0 && !e.mini && !e.xpRole && !e.elite && !bossLike);

/* THE BREAK LANDED. A tell it was in the middle of is not thrown from where it stopped when the foe comes to: it is taken up again
   with at least OPEN.retell of it still to run, so the mark goes back up over it and the blow is told a second time */
export function broke(e, now) { OPEN.breaks++; e.brokeAt = now; e.brokeFor = e.broken;
  if (typeof e.mode === 'string' && e.mode.endsWith('Tell') && typeof e.modeT === 'number') e.modeT = Math.max(e.modeT, OPEN.retell); }

/* REELING OPEN: back off its guard, head down, swaying on its heels - for the whole break, and settling as it comes to */
export function staggerPose(o, e, now) {
  const left = Math.max(0, e.broken || 0), full = Math.max(0.5, e.brokeFor || left || 1), k = Math.min(1, left / 0.25, (now - (e.brokeAt ?? now) + 0.05) / 0.12);
  const sway = Math.sin(now * 5.2 + (e.x || 0) * 0.13);
  o.rot = (o.rot || 0) - (e.face || 1) * OPEN.lean * k + sway * 0.05 * k;
  o.dx -= (e.face || 1) * Math.round(2 * k); o.sy *= 1 - 0.06 * k; o.sx *= 1 + 0.03 * k;
  void full;
}

/* THE STARS OVER IT: three gold stars round its head. ready: a hero is close enough to finish it - they close in and go white */
export function drawOpen(g, e, x, y, now, ready) {
  const n = OPEN.stars, r = ready ? OPEN.starR - 2 : OPEN.starR, sp = ready ? 9 : 5;
  for (let i = 0; i < n; i++) {
    const a = now * sp + i * (Math.PI * 2 / n), sx = Math.round(x + Math.cos(a) * r), sy = Math.round(y - 3 + Math.sin(a) * r * 0.35);
    g.fillStyle = ready ? '#ffffff' : '#ffd36b'; g.fillRect(sx - 1, sy, 3, 1); g.fillRect(sx, sy - 1, 1, 3);
    if (ready) { g.fillStyle = '#ffd36b'; g.fillRect(sx, sy, 1, 1); }
  }
}
