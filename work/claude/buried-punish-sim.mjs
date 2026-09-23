// does the arm-in-the-ground punish ever come round in PHASE ONE? A hero who stands where he erupted and never moves.
// usage: node work/claude/buried-punish-sim.mjs   (prints how many times his arm went into the ground in 120 s of phase one)
import { updateBuriedDead } from '../../src/buried-dead.js';
const A = { x0: 0, x1: 672, floor: 500 }, P = { x: 320, y: 500, h: 22, dead: false };
const c = { P, A, hit: () => {}, summon: () => {}, say: () => {}, sound: () => {}, ring: () => {} };
const e = { alive: true, hp: 100, hp0: 100, phase: 1, mode: 'walk', modeT: 0.5, x: 320, y: 500, anim: 0, turn: 0, markX: 320 };
let stuck = 0, first = null;
for (let f = 0; f < 60 * 120; f++) { e.hp = 100; const was = e.mode; updateBuriedDead(e, 1 / 60, c); if (e.mode === 'stuck' && was !== 'stuck') { stuck++; if (first == null) first = +(f / 60).toFixed(1); } }
console.log(JSON.stringify({ phase: e.phase, stuck, firstAt: first }));
