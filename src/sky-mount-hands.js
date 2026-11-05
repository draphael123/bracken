// src/sky-mount-hands.js - THE DRAKE'S BACK, WIRED (lane S1 SKYMOUNT). The glue between src/sky-mount.js (the pure arena) and main.js:
// main.js holds ONE object made here (SKH) and calls it from a few one-line hooks, so a merge with the Fire Drake lane (D1) or the Demon
// King lane (S2) touches as little of main.js as possible. Every hook is a no-op unless the level has `skyMount` (the lab 'skylab'; the
// Heart of the Mountain's sky fight when lane S2/SC wire it).
//   update(dt)                 once a frame, before the heroes: build/step the back, mount every hero (the AI partner too), lab hooks
//   pre(P)                     top of a hero's step, before main.js's mover carry
//   foot(P, prevY, dt, o)      after main.js's mover landing: walls, sky top, no falling through, the bank's slide, the prone clock
//   knock(P)                   damagePlayer0's throw: true = knocked DOWN instead (main.js skips its knock-back)
//   cam(VW, VH)                the camera, locked on the drake (or null)
//   aiWalk(p, goal, keys)      the AI partner's walk on the back (true = handled; its tile walker is skipped)
//   drawSky / drawDrake        the greybox pictures (src/sky-mount-draw.js)
// S2's handle: hands.back() is the live back - holdBank / beginClimb / kingLandX / plantOnBack from src/sky-mount.js act on it.
import * as SK from './sky-mount.js';
import { drawSky as paintSky, drawDrake as paintDrake } from './sky-mount-draw.js';

export function makeSkyMountHands(api) {
  // api: { L(), players(), number(x, y, txt, col), sfx(k), solid, bk() }
  let said = false;
  const on = () => { const L = api.L(); return !!(L && L.skyMount); };
  const back = () => { const L = api.L(); if (!L || !L.skyMount) return null; if (!L.skyBack) L.skyBack = SK.newBack(L.skyMount); return L.skyBack; };
  const heroes = () => (api.players() || []).filter(Boolean);
  function labHooks(b) {   /* the lab's handles, for a person at the console and for the owed page checks: BK.skyMount.bank(1) / .phase(2) / .hold(4) */
    const BK = api.bk && api.bk(); if (!BK || BK.skyMount) return;
    BK.skyMount = { back: () => back(), bank: dir => { const k = back(); if (k) { k.nextBank = 0; k.hold = 0; k.forceDir = dir || 1; } },
      phase: n => { const k = back(); if (k) SK.beginClimb(k, n); }, hold: s => { const k = back(); if (k) SK.holdBank(k, s || 4); },
      kingLand: () => { const k = back(); return k ? SK.kingLandX(k, heroes()) : null; }, SKM: SK.SKM };
  }
  function update(dt) {
    if (!on()) { for (const p of heroes()) if (p.mount) SK.dismount(p); said = false; return; }
    const b = back(); labHooks(b);
    const ev = SK.stepBack(b, dt, { dir: b.forceDir }); if (ev.includes('tell')) b.forceDir = 0;
    if (ev.includes('tell')) { api.number(b.x1 + 40, b.y0 - 60, b.bank.dir > 0 ? 'THE DRAKE BANKS >' : '< THE DRAKE BANKS', '#ffd36b'); api.sfx('roar'); }
    if (ev.includes('tilt')) api.sfx('wing');
    const hs = heroes(), slots = SK.spawnSlots(b, hs.length);
    hs.forEach((p, i) => { if (p.mount !== b) SK.mount(p, b, p.mount ? p.x : slots[i]); });
    if (!said && api.L().skyMount.lab) { said = true; api.number(b.cx, b.y0 - 70, "THE DRAKE'S BACK (LAB)", '#e0c090'); }
  }
  function pre(P) { const b = P.mount; if (b && on() && b === back()) SK.preStep(P, b); }
  function foot(P, prevY, dt, o = {}) {
    const b = P.mount; if (!b || !on() || b !== back()) return null;
    const r = SK.footStep(P, b, prevY, { dt, block: !!o.block, dodging: !!o.dodging, coyote: o.coyote, solid: api.solid });
    if (r.landed) api.sfx('land');
    return r;
  }
  function knock(P) { if (!P.mount || !on()) return false; SK.knockDown(P); api.number(P.x, P.y - 28, 'KNOCKED DOWN', '#ff6b6b'); return true; }
  function cam(VW, VH) { const b = on() && back(); return b ? SK.camFor(b, VW, VH) : null; }
  function aiWalk(p, goal, keys) { const b = p.mount; if (!b || !on()) return false; SK.aiKeys(p, b, goal, keys); return true; }
  return { on, back, update, pre, foot, knock, cam, aiWalk,
    drawSky: (g, VW, VH, time, parallax) => { const b = on() && back(); if (b) paintSky(g, b, VW, VH, time, parallax); },
    drawDrake: (g, cx, cy, time) => { const b = on() && back(); if (b) paintDrake(g, b, cx, cy, time); } };
}
