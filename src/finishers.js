// src/finishers.js - EXECUTIONS: A BROKEN COMMON FOE IS FINISHED, EACH HERO IN HIS OWN WAY (the combat pass, part 2; Daniel, 2026-09-28).
//
// Blasphemous's rule: an enemy you have stunned can be executed. Here: a COMMON foe whose poise is broken (src/poise-break.js) stands
// open, and a melee blow that reaches it while it is open does not cut it - it FINISHES it, whatever health it had left:
//   THE TELL      the gold stars over a broken foe close in and go white when a hero is near enough to finish it (drawOpen, ready),
//                 so the player knows before he swings that this blow will be the last
//   THE FINISHER  his own name for it over the foe, the world stopped a beat (hit-stop), a white flash and the camera in close, a
//                 ring in his colour, and a short signature of his own (below) - then it dies its own death as any kill does
// NEW FRAMES WERE TOO COSTLY: the finisher plays on the hero's own attack frames (the swing that reached the foe is the finishing
// blow) and is made a finisher by the stop, the flash, the zoom, the word and the signature. (A common foe with a boss-sized bar - the
// Waymeet's sworn swords carry one - is still a common foe.) Bosses, minis, elite captains, a boss's
// adds, the harmless and the trainers' straw men are never finished this way (FINISH_OK).
//
// main.js hooks it in the melee hit loop (tryFinish, before the blow is struck) and drawEnemies (ready, for the tell).

export const FINISH = {
  knight:    { name: 'EXECUTED',    col: '#fff6e0', sfx: ['heavy', 'judgement'], sig: 'thrust' },   /* the step-in thrust: his sword run home */
  pyro:      { name: 'IMMOLATED',   col: '#ff9a5c', sfx: ['puff', 'heavy'],      sig: 'flame' },    /* the staff drives her ember in: it goes up */
  reaper:    { name: 'REAPED',      col: '#ff6b6b', sfx: ['judgement', 'heavy'], sig: 'shade' },    /* the Death Knight takes what was left: it rises off it red */
  pirate:    { name: 'RUN THROUGH', col: '#ffd34a', sfx: ['heavy', 'clank'],     sig: 'coins' },    /* the cutlass to the guard, and its pockets empty */
  paladin:   { name: 'SMITTEN',     col: '#ffe6a0', sfx: ['hammerfall', 'heavy'], sig: 'light' },   /* the maul comes down in light, and the light is his */
  geomancer: { name: 'SHATTERED',   col: '#e0a040', sfx: ['crack', 'heavy'],     sig: 'shards' },   /* stone on it: it goes to pieces, amber */
  warden:    { name: 'SKEWERED',    col: '#8fd160', sfx: ['tipRing', 'heavy'],   sig: 'point' },    /* the point through it, and it rings */
};
export const FIN = { reach: 34, rise: 26, stop: 0.14, zoom: 1.14, inv: 0.45, heal: 3, done: 0, byHero: {} };

/* may this foe be finished at all? (a common foe, broken, and not one of the things a finisher is not for) */
export const FINISH_OK = (e, bossLike) => !!(e && e.alive && e.broken > 0 && !e.mini && !e.elite && !e.xpRole && !e.harmless
  && !e.trainer && !e.turncoat && e.t !== 'dummy' && !bossLike);

/* a hero near enough that his next blow is a finisher: the stars close in (the tell) */
export const finishReady = (e, P, bossLike) => FINISH_OK(e, bossLike) && !P.dead && Math.abs(P.x - e.x) < FIN.reach + (e.w || 10) / 2 && Math.abs(P.y - e.y) < FIN.rise;

/* THE FINISHER. api: { hero, number, hitstop, zoomKick, shakeCam, ringAt, burst, sparks, SFX, kill(e), flash(), heal(n), light(n), coins(e) } */
export function finishFoe(e, P, api) {
  const h = api.hero(), f = FINISH[h] || FINISH.knight, cx = e.x, cy = e.y - (e.h || 16) / 2;
  api.number(cx, e.y - (e.h || 16) - 22, f.name, f.col);
  api.hitstop(FIN.stop); api.zoomKick(FIN.zoom, 0.3); api.shakeCam(6, (P.face || 1) * 3); api.flash();
  api.ringAt(cx, cy, 30, f.col, 0.4); api.ringAt(cx, cy, 14, '#ffffff', 0.25); api.sparks(cx, cy, P.face || 1, 14);
  for (const k of f.sfx) if (api.SFX[k]) api.SFX[k]();
  /* HIS SIGNATURE: a few pixels of his own on top of the shared beat */
  if (f.sig === 'thrust') { P.vx = (P.face || 1) * 120; api.burst(cx, cy, 10, ['#dfe8ff', '#fff6e0'], 110, 0.35); }
  else if (f.sig === 'flame') api.burst(cx, cy, 18, ['#fff6c8', '#ffd36b', '#ff6b2c'], 90, 0.6, -120, 2);
  else if (f.sig === 'shade') api.burst(cx, cy - 6, 14, ['#ff6b6b', '#3a0c14', '#c9463d'], 40, 0.8, -80, 2);
  else if (f.sig === 'coins') { api.burst(cx, cy, 10, ['#ffd34a', '#fff6c8'], 100, 0.5, 300, 1); if (api.coins) api.coins(e); }
  else if (f.sig === 'light') { api.ringAt(cx, cy, 46, '#ffe6a0', 0.45); if (api.light) api.light(8); }
  else if (f.sig === 'shards') api.burst(cx, cy, 16, ['#e0a040', '#8a6030', '#fff0c0'], 140, 0.5, 320, 2);
  else if (f.sig === 'point') { api.ringAt(cx, cy, 20, '#8fd160', 0.35); api.sparks(cx, cy, -(P.face || 1), 8); }
  P.inv = Math.max(P.inv || 0, FIN.inv); if (P.hp > 0 && api.heal) api.heal(FIN.heal);
  e.finished = true; FIN.done++; FIN.byHero[h] = (FIN.byHero[h] || 0) + 1;
  api.kill(e);
}
