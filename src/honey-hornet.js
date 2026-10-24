// src/honey-hornet.js - THE FAT HONEY HORNET (claude/hornetsnest2; scratch/brief-hornetsnest2-1023.md item 4, Daniel 10-23: "NEW FOE - THE FAT HONEY HORNET, reusable in
// later wood/garden levels"). THE HORNET'S NEST's heavy flyer: a hornet gone fat on the nest's honey, slow, its swollen abdomen plated like a beetle's back.
//   ent('honeyhornet', x, y) - the cell it keeps its beat in. PURE: main.js gives it X (below) and runs it; src/redraw/honey_hornet_art.js draws its sheet.
//   IT KEEPS A SLOW BEAT over its post, a deep drone. A hero near (HONEY.wake) and it comes for him, by turns:
//   THE DRIP (told): it hangs over you, its honey sac swells and drips (a yellow !) - then it lets go a HONEY GLOB. The glob falls; it stings a little where it hits,
//     and where it SPLASHES it leaves a STICKY PATCH a few seconds (the nest's own rule: fresh comb holds your feet - X.glob lays it). Step off its line.
//   THE RAM (told): it drops to your height beside you, LEANS BACK with a wind-up buzz (a yellow !: a shield turns it) and RAMS straight along its line. A ram
//     taken on a shield knocks it reeling (open a moment). Jump it, or block it.
//   ITS ARMOURED ABDOMEN: a blow from BEHIND it (its back half) glances off the plates - HONEY.armour (0.5, told: a clank and ARMOURED), never nothing (B15's
//     spirit for a foe). Its head is soft: come at it from the front - after a ram, as it hangs there reeling - or from the smoke.
//   SMOKE MAKES IT DROWSY: a carried pot near it, a set-down pot or a cloud (X.calm) and it goes heavy - it SINKS to the ground and lies there, OPEN (x HONEY.drowsyK)
//     until HONEY.drowsy s after the smoke has left it, then climbs back up to its beat.
// X = { heroes(), calm(x, y) -> bool, floorAt(x, y) -> px (the footing under a point), solidAt(x, y), hit(e, box, dmg, o) (o: { blockable, onBlock, name }),
//   glob(x, y) (a glob splashed here: lay the sticky patch), mark(e, txt, col), sfx, hint(id, msg) }
export const HONEY = {
  hp: 54, w: 22, h: 18, speed: 40, wake: 150, leash: 190, beat: 46, hover: 64, ramH: 14,
  dripTell: 0.7, dripCd: 2.0, globG: 700, globDmg: 14, globR: 7, patch: 6,
  ramTell: 0.8, ramSpeed: 210, ramT: 0.55, ramDmg: 36, ramRange: 110, ramMin: 26, ramDy: 14, ramCd: 1.0, recover: 0.9, reel: 1.3,
  armour: 0.5, drowsy: 3.0, drowsyK: 2, sink: 150, rise: 40,
};
export const HONEY_SAY = { drip: '!', ram: '!', armour: 'ARMOURED', drowsy: 'DROWSY: IT SINKS', reel: 'IT REELS', rouse: 'IT ROUSES' };
export const HONEY_HINT = { drowsy: 'SMOKE MAKES A FAT HONEY HORNET DROWSY: IT SINKS TO THE GROUND AND LIES OPEN. ITS PLATED BACK TURNS A CUT - STRIKE ITS HEAD.',
  armour: 'A FAT HONEY HORNET\'S ABDOMEN IS PLATED: A CUT FROM BEHIND GLANCES OFF. STRIKE ITS HEAD - AFTER ITS RAM, OR SMOKE IT DOWN.' };
/* THE POSE IDS (the art lane's contract, src/redraw/honey_hornet_art.js): 0-1 FLY (two wing beats) 2 DRIP TELL (the sac swollen, a bead hanging) 3 DROP (the sac let go)
   4 RAM TELL (leaning back, wings wide) 5 RAM (stretched along its line, wings swept back) 6 REEL (knocked crooked, after a blocked ram / its recover) 7 DROWSY (down on the
   ground, wings folded, the sac flat) 8 HURT 9 DEAD (on its back, legs up: the corpse) */
export const HONEY_POSE = { fly: 0, fly2: 1, dripTell: 2, drop: 3, ramTell: 4, ram: 5, reel: 6, recover: 6, drowsy: 7, hurt: 8, dead: 9 };
export const newHoneyHornet = e => Object.assign(e, { hx: e.x, hy: e.y, mode: 'patrol', modeT: 0, noGrav: true, vx: 0, vy: 0, cd: 0.3, next: 'drip', tgt: null, globs: [], drowsyT: 0, phase: (Math.floor(e.x) % 9) * 0.7, face: e.face || -1 });
const steer = (e, tx, ty, sp, dt) => { const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy) || 1, v = Math.min(sp, d * 3); e.vx += (dx / d * v - e.vx) * Math.min(1, dt * 3); e.vy += (dy / d * v - e.vy) * Math.min(1, dt * 3); e.x += e.vx * dt; e.y += e.vy * dt; };
/* ONE FRAME. Everything it does to a hero goes through X */
export function stepHoneyHornet(e, dt, X) {
  const Hc = HONEY, S = X.sfx || {}; e.modeT -= dt; e.cd -= dt; e.phase += dt;
  stepGlobs(e, dt, X);
  const smoked = X.calm(e.x, e.y - Hc.h / 2);
  if (smoked && e.mode !== 'drowsy') { e.mode = 'drowsy'; e.vx = 0; e.vy = 0; X.mark(e, HONEY_SAY.drowsy, '#c8d0d8'); X.hint('drowsy', HONEY_HINT.drowsy); S.puff && S.puff(); }
  if (smoked) e.drowsyT = Hc.drowsy;
  const heroes = X.heroes().filter(H => !H.dead);
  const near = heroes.filter(H => Math.abs(H.x - e.x) < Hc.wake && Math.abs(H.y - e.y) < Hc.wake && Math.hypot(H.x - e.hx, H.y - e.hy) < Hc.leash + 60).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || null;
  switch (e.mode) {
    case 'drowsy': {   /* SMOKED: it sinks to the ground and lies there, open; it rouses HONEY.drowsy s after the smoke leaves it */
      const fl = X.floorAt(e.x, e.y); if (e.y < fl) e.y = Math.min(fl, e.y + Hc.sink * dt); e.vx = 0; e.vy = 0;
      if (!smoked) { e.drowsyT -= dt; if (e.drowsyT <= 0) { e.mode = 'rouse'; e.modeT = 1.2; X.mark(e, HONEY_SAY.rouse, '#ffd36b'); } }
      break; }
    case 'rouse': e.y -= Hc.rise * dt; if (e.modeT <= 0) { e.mode = 'patrol'; e.cd = 0.8; } break;
    case 'dripTell': {   /* THE DRIP'S TELL: over you, the sac swelling - it keeps over you (slowly: you can walk off its line) */
      const T = e.tgt && !e.tgt.dead ? e.tgt : near; if (T) steer(e, T.x, Math.min(e.y, T.y - Hc.hover), Hc.speed * 0.6, dt); else { e.vx *= 0.9; e.vy *= 0.9; }
      if (e.modeT <= 0) { e.mode = 'drop'; e.modeT = 0.35; e.globs.push({ x: e.x, y: e.y + 2, vy: 30 }); S.splash ? S.splash() : S.drip && S.drip(); e.cd = Hc.dripCd; e.next = 'ram'; }
      break; }
    case 'drop': e.vx *= 0.9; e.vy = -12; e.y += e.vy * dt; if (e.modeT <= 0) e.mode = 'hunt'; break;
    case 'ramTell': {   /* THE RAM'S TELL: it holds its height beside you, leaning back, its wings a wide buzz */
      e.vx *= 0.85; e.vy = 0; e.x += e.vx * dt - e.face * 6 * dt; if (e.ramY !== undefined) e.y += (e.ramY - e.y) * Math.min(1, dt * 6);   /* it settles to your height as it leans back */
      if (e.modeT <= 0) { e.mode = 'ram'; e.modeT = Hc.ramT; e.vx = e.face * Hc.ramSpeed; e.vy = 0; S.charge ? S.charge() : S.whoosh && S.whoosh(); e.ramKey = (e.ramKey || 0) + 1; }
      break; }
    case 'ram': {   /* THE RAM: straight along its line; it strikes what it meets (a shield turns it, and it reels) */
      e.x += e.vx * dt; if (X.solidAt(e.x + e.face * Hc.w / 2, e.y - Hc.h / 2)) { e.x -= e.vx * dt; e.modeT = 0; }
      X.hit(e, { l: e.x - Hc.w / 2 - 2, r: e.x + Hc.w / 2 + 2, t: e.y - Hc.h - 2, b: e.y + 6 }, Hc.ramDmg, { blockable: true, key: 'hr' + e.ramKey, name: 'A FAT HONEY HORNET',
        onBlock: () => { e.mode = 'reel'; e.modeT = Hc.reel; e.vx = -e.face * 60; X.mark(e, HONEY_SAY.reel, '#8fd160'); } });
      if (e.mode !== 'ram') break;
      if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = Hc.recover; e.vx *= 0.2; e.cd = Hc.ramCd; e.next = 'drip'; }
      break; }
    case 'reel': case 'recover': e.vx *= 0.9; e.vy = Math.sin(e.phase * 9) * 8; e.x += e.vx * dt; if (e.modeT <= 0) { e.mode = 'hunt'; e.cd = Math.max(e.cd, 0.6); e.next = 'drip'; } break;
    case 'hunt': {   /* AFTER A HERO NEAR: over him to drip, or down beside him to ram, by turns */
      if (!near) { e.mode = 'home'; break; } const T = near; e.tgt = T;
      if (e.next === 'drip' && !clearDrop(e, T, X)) e.next = 'ram';   /* (a ledge between it and you: the glob would only splash on the ledge - it comes down to ram instead) */
      if (e.next === 'drip') { const ty = Math.min(e.hy + 30, T.y - Hc.hover); steer(e, T.x, ty, Hc.speed, dt); e.face = Math.sign(T.x - e.x) || e.face;
        if (e.cd <= 0 && Math.abs(T.x - e.x) < 18 && Math.abs(e.y - ty) < 14) { e.mode = 'dripTell'; e.modeT = Hc.dripTell; X.mark(e, HONEY_SAY.drip, '#ffd36b'); S.buzz && S.buzz(); } }
      else { const side = Math.sign(e.x - T.x) || -e.face, tx = T.x + side * Hc.ramRange * 0.6, ty = T.y - Hc.ramH; steer(e, tx, ty, Hc.speed * 1.2, dt); e.face = Math.sign(T.x - e.x) || e.face;
        const adx = Math.abs(T.x - e.x); if (e.cd <= 0 && adx > Hc.ramMin && adx < Hc.ramRange && Math.abs(T.y - Hc.ramH - e.y) < Hc.ramDy) { e.mode = 'ramTell'; e.modeT = Hc.ramTell; e.vx = 0; e.vy = 0; e.ramY = T.y - Hc.ramH; X.mark(e, HONEY_SAY.ram, '#ffd36b'); S.buzz && S.buzz(); } }
      if (Math.hypot(e.x - e.hx, e.y - e.hy) > Hc.leash) e.mode = 'home';
      break; }
    case 'home': steer(e, e.hx, e.hy, Hc.speed, dt); if (Math.hypot(e.x - e.hx, e.y - e.hy) < 6) { e.mode = 'patrol'; } if (near && Math.hypot(near.x - e.hx, near.y - e.hy) < Hc.leash) e.mode = 'hunt'; break;
    default: {   /* PATROL: a slow heavy beat over its post */
      e.mode = 'patrol'; steer(e, e.hx + Math.sin(e.phase * 0.5) * Hc.beat, e.hy + Math.sin(e.phase * 1.1) * 4, Hc.speed * 0.6, dt); e.face = Math.sign(e.vx) || e.face;
      if (near && e.cd <= 0) { e.mode = 'hunt'; e.tgt = near; }
    }
  }
}
/* is the glob's fall from over the hero to his head clear of footing? */
const clearDrop = (e, T, X) => { for (let y = Math.min(e.y, T.y - HONEY.hover) + 4; y < T.y - 28; y += 8) if (X.solidAt(T.x, y)) return false; return true; };
/* THE GLOBS: they fall; they sting a hero they meet and splash at his feet, or splash where they land - a sticky patch either way */
function stepGlobs(e, dt, X) {
  for (const g of e.globs) { g.vy = Math.min(420, g.vy + HONEY.globG * dt); g.y += g.vy * dt;
    for (const H of X.heroes()) { if (H.dead || g.done) continue; if (Math.abs(H.x - g.x) < HONEY.globR + 5 && g.y > H.y - 26 && g.y < H.y + 2) { X.hit(e, { l: g.x - HONEY.globR, r: g.x + HONEY.globR, t: g.y - HONEY.globR, b: g.y + HONEY.globR }, HONEY.globDmg, { blockable: true, key: 'hg' + Math.round(g.x) + '.' + Math.round(g.vy), name: 'A HONEY GLOB' }); g.done = true; X.glob(g.x, H.ground === false ? X.floorAt(g.x, g.y) : H.y); } }
    if (!g.done && X.solidAt(g.x, g.y)) { g.done = true; X.glob(g.x, Math.floor(g.y / 16) * 16); }
    if (g.y > 4000) g.done = true; }
  e.globs = e.globs.filter(g => !g.done);
}
/* A BLOW ON IT: the multiplier. Drowsy: open. From behind: its plated abdomen glances it (told by the hands) */
export function honeyTake(e, fromX) {
  if (e.mode === 'drowsy') return HONEY.drowsyK;
  const behind = Math.sign(fromX - e.x) === -Math.sign(e.face || 1) && Math.abs(fromX - e.x) > 2;
  return behind ? HONEY.armour : 1;
}
export const honeyFrame = e => e.hurtT > 0 && e.mode !== 'drowsy' ? HONEY_POSE.hurt : HONEY_POSE[e.mode] ?? (Math.floor((e.anim || e.phase || 0) * 10) % 2 ? HONEY_POSE.fly2 : HONEY_POSE.fly);
export const honeyGlobs = e => e.globs || [];
import { bakeHoneyHornetSheet } from './redraw/honey_hornet_art.js';
export function bakeHoneyHornet(canvas, flipX, whiten) { return bakeHoneyHornetSheet(canvas, flipX, whiten, HONEY); }
