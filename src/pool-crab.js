// src/pool-crab.js - THE TIDE-POOL CRAB, LONG WATER 3's one new foe (claude/longwater3, the OPUS GREYBOX, 11-07). PURE: no DOM, no main.js.
// Plan item 1: "New foe: TIDE-POOL CRAB (low tide only)." It lives in the pools on the flats and is OUT only at low water: as the tide turns in it is TOLD
// (it digs - sand flies, 'DIGS IN') and then it is BURIED (two eye-stalks over the sand: a blade passes over it, it hurts no one). As the sea goes out the sand
// BOILS (told) and it comes up. So the tide is the answer twice over: ring the BELL and the patrol digs in under you; hold the SLUICE and it stays out.
// (Not master's 'tidecrab' skin - that one is the opposite: buried at LOW water, up with the flood - src/variety-pass.js.)
//   OUT          scuttles SIDEWAYS toward you, never more than PC.home px from its pool
//   THE PINCH    (! 0.5 s: the claw goes up) a short reach at your shins - GUARD IT (blockable) or step back out of it
//   CLAW OPEN    after a pinch it is open (x1.5) for PC.pinch.rec s; outside that its shell turns a blade to x0.6 (the shell is the rule, never nothing)
//   FLIPPED      a plunge or a heavy blow on top flips it (x2, as master's crab) for PC.flip s
export const PC = {
  hp: 30, w: 14, h: 9, speed: 36, sense: 112, home: 88,
  emerge: 0.7, dig: 0.8, lowK: 0.15, highK: 0.2,
  pinch: { tell: 0.5, r: 18, h: 14, dmg: 12, rec: 0.7, cool: 0.9 },
  flip: 1.6,
  k: { shell: 0.6, open: 1.5, flipped: 2 },
};
export const PC_SAY = { dig: 'DIGS IN', up: 'THE SAND BOILS', buried: 'IN THE SAND' };
/* marks.js rows: [mode, mark, answer, height] */
export const PC_TELLS = [['pinchTell', '!', 'block', 'low'], ['emerge', '', '', ''], ['digTell', '', '', '']];
export const pcOpen = e => e.mode === 'rec' || e.mode === 'flipped';

export function spawnCrab(base, e, hp) {
  return { ...base, t: 'poolcrab', w: PC.w, h: PC.h, hp: hp || PC.hp, maxHp: hp || PC.hp, home: base.x, mode: 'buried', modeT: 0, cool: 0, face: e.face || -1, buried: true };
}
const setMode = (e, m, t) => { e.mode = m; e.modeT = t; };

/* ONE FRAME. h = the nearest hero { x, y, alive } or null; c = { k() (the tide, 0 low .. 1 high), mark(m), sound(k), hit(box, dmg, name, o) -> 'hit'|'blocked'|null,
   say(e, word), move(e, dx) (a collision-aware step: returns the dx it took) } */
export function stepCrab(e, dt, h, c) {
  const k = c.k();
  e.modeT -= dt; e.cool = Math.max(0, e.cool - dt);
  switch (e.mode) {
    case 'buried': e.buried = true; if (k <= PC.lowK && e.modeT <= 0) { setMode(e, 'emerge', PC.emerge); c.sound('boil'); } return;
    case 'emerge': if (e.modeT <= 0) { e.buried = false; setMode(e, 'walk', 0.3); } return;
    case 'digTell': if (e.modeT <= 0) { e.buried = true; setMode(e, 'buried', 0.4); } return;
    case 'flipped': if (e.modeT <= 0) setMode(e, 'walk', 0.3); return;
  }
  /* THE TIDE TURNS IN: it digs (told), wherever it is - mid-pinch it finishes the pinch first */
  if (k > PC.highK && (e.mode === 'walk' || e.mode === 'rec')) { setMode(e, 'digTell', PC.dig); c.say(e, PC_SAY.dig); c.sound('dig'); return; }
  switch (e.mode) {
    case 'walk': {
      if (!h || !h.alive) return;
      const dx = h.x - e.x, ad = Math.abs(dx);
      if (ad > PC.sense || Math.abs(h.y - e.y) > 48) { const back = e.home - e.x; if (Math.abs(back) > 4) c.move(e, Math.sign(back) * PC.speed * 0.6 * dt); return; }
      e.face = Math.sign(dx) || e.face;
      if (ad <= PC.pinch.r + 4 && e.cool <= 0 && Math.abs(h.y - e.y) < 20) { setMode(e, 'pinchTell', PC.pinch.tell); c.mark('!'); c.sound('tell'); return; }
      const want = e.x + Math.sign(dx) * PC.speed * dt;
      if (Math.abs(want - e.home) <= PC.home && ad > PC.pinch.r - 4) c.move(e, Math.sign(dx) * PC.speed * dt);
      return; }
    case 'pinchTell': if (e.modeT <= 0) { setMode(e, 'pinch', 0.15); c.sound('snip');
        e.lastPinch = c.hit([e.x + (e.face > 0 ? 0 : -PC.pinch.r - 6), e.x + (e.face > 0 ? PC.pinch.r + 6 : 0), e.y - PC.pinch.h, e.y + 2], PC.pinch.dmg, 'THE PINCH', { blockable: true, low: true, key: 'pc' + Math.round(e.home) + ':' + Math.round((e.n = (e.n || 0) + 1)) }); }
      return;
    case 'pinch': if (e.modeT <= 0) { setMode(e, 'rec', PC.pinch.rec); e.cool = PC.pinch.cool; } return;
    case 'rec': if (e.modeT <= 0) setMode(e, 'walk', 0.2); return;
  }
}

/* WHAT A BLOW IS WORTH. top = the blow came from above (a plunge) or was heavy. Buried: nothing to hit (0, 'IN THE SAND'). Returns { k, word } */
export function crabTake(e, top) {
  if (e.buried || e.mode === 'buried' || e.mode === 'emerge') return { k: 0, word: PC_SAY.buried };
  if (e.mode === 'flipped') return { k: PC.k.flipped, word: null };
  if (top) { e.mode = 'flipped'; e.modeT = PC.flip; return { k: PC.k.flipped, word: 'FLIPPED' }; }
  if (e.mode === 'rec') return { k: PC.k.open, word: null };
  return { k: PC.k.shell, word: null };
}
