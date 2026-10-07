// src/glass-foes.js - THE CRACK SWARM's SKITTER, THE GLASS SEA's one new foe (claude/glasssea). Pure: no DOM, no main.js; the desert machines' contract
// (src/desert-foes.js): newSkitter(x, y) -> state, skitterStep(s, w, dt) -> events ('tell' / 'hit' with a box, its mark and its damage).
// A skitter is a glass-shelled night crawler the size of a hand, poured out of a crack in the glass after dark. It RUNS at you (a swarm runner), and
// BITES: a short told nip (the yellow '!': a shield turns it), then skitters off a step and comes again. One is nothing; six are a fight. It will not
// step into FIRELIGHT (src/glass-sea-hands.js fear: main.js treats a lit tile ahead as an edge), so a fire, or a fire beam laid on its crack, holds them.
// Frames (src/redraw/glasssea_art.js bakeSkitter): 0,1 run | 2 BITE TELL (!, raised, mandibles open) | 3 BITE | 4 hurt.
export const SKITTER = { hp: 9, speed: 78, sight: 220, biteR: 14, biteTell: 0.32, bite: 0.14, dmg: 5, cd: 0.9, back: 0.35, w: 9, h: 6 };
const ev = (a, t, extra) => a.push({ t, ...extra });
export function newSkitter(x, y) { return { kind: 'skitter', x, y, home: x, hp: SKITTER.hp, mode: 'run', t: 0, face: -1, cd: 0.4, frame: 0 }; }
export function skitterStep(e, w, dt) {
  const out = [], d = w.px - e.x, ad = Math.abs(d), near = Math.abs(w.py - e.y) < 28;
  e.t -= dt; e.cd -= dt;
  switch (e.mode) {
    case 'run': e.frame = Math.floor(w.time * 12) % 2;
      if (near && ad < SKITTER.sight) e.face = Math.sign(d) || e.face;
      if (near && e.cd <= 0 && ad < SKITTER.biteR) { e.mode = 'biteTell'; e.t = SKITTER.biteTell; e.frame = 2; ev(out, 'tell', { what: 'bite', mark: '!' }); }
      else if (!(near && ad < SKITTER.biteR * 0.6)) e.x += e.face * SKITTER.speed * (near && ad < SKITTER.sight ? 1 : 0.35) * dt;
      break;
    case 'biteTell': if (e.t <= 0) { e.mode = 'bite'; e.t = SKITTER.bite; e.frame = 3; ev(out, 'hit', { what: 'bite', mark: '!', box: [e.x + (e.face > 0 ? 0 : -SKITTER.biteR - 2), e.x + (e.face > 0 ? SKITTER.biteR + 2 : 0), e.y - 8, e.y], blockable: true, dmg: SKITTER.dmg }); } break;
    case 'bite': if (e.t <= 0) { e.mode = 'back'; e.t = SKITTER.back; } break;
    case 'back': e.x -= e.face * SKITTER.speed * 0.7 * dt; e.frame = Math.floor(w.time * 12) % 2; if (e.t <= 0) { e.mode = 'run'; e.cd = SKITTER.cd; } break;
  }
  return out;
}
