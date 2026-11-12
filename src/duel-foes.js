// src/duel-foes.js - THE DUEL PIT's GOBLINS setting + FRIENDLY FIRE (claude/duelfoes; plan scratch/lane-reports/duel2-plan.md section 2, Daniel 11-12: wound only,
// a goblin kill gives NOTHING but the results card counts it, goblin duels rank like any duel). The whole feature sits behind DUEL_FOES (default OFF).
// PURE: no imports, nothing of the game; src/pvp-duel.js wires it and main.js lends the spawn / the blow probe. The schedule (foePlan) and the door data
// (FOE_ARENAS) carry no item hooks, so a later ITEM DROP can reuse the same doors and the same told spawn.
export const DUEL_FOES_FLAG = false;   /* THE SHIP SWITCH (one line): true = every player sees the GOBLINS / FRIENDLY FIRE rows. ?duelfoes (or window.__DUELFOES) turns it on for a tester */
export const DUEL_FOES = DUEL_FOES_FLAG || (typeof globalThis !== 'undefined' && (!!globalThis.__DUELFOES || (!!globalThis.location && /[?&]duelfoes(=|&|$)/.test(String(globalThis.location.search)))));

export const GOBLIN_CHOICES = ['off', 'few', 'many'];
/* THE NUMBERS. max: goblins alive (and told) at once; every: seconds between entries; first: the first entry on the FIGHT clock; tell: how long the '!' stands before he walks in;
   minSeat: never within this many tiles of a seat; blow: a goblin blow's cost as a share of the seat's duel health (flat, scaled by HEALTH because it is a share) */
export const FOE = { few: { max: 2, every: 14 }, many: { max: 4, every: 8 }, first: 10, tell: 1.0, minSeat: 6, blow: 0.06, flee: 70, popRetry: 0.25, popTries: 8 };
/* PER ARENA: the wall-edge floor columns he walks in from (doors), and the Act 1 fodder he may be (never brute, pike, mage or sapper). Only the Pit now; a later arena adds a line.
   doors are columns from the arena's left edge; a negative column counts from the right (W + col). */
export const FOE_ARENAS = { pit: { doors: [2, -3], kinds: ['sprig', 'shield'], weights: [0.65, 0.35] } };
export const GOB_NAME = { off: 'OFF', few: 'FEW', many: 'MANY' };
export const GOB_LINE = { off: 'NO GOBLINS IN THE PIT.', few: 'GOBLINS: FEW - THEY HURT ANYONE, BUT ONLY A HERO CAN K.O. YOU.', many: 'GOBLINS: MANY - THEY HURT ANYONE, BUT ONLY A HERO CAN K.O. YOU.' };
export const FF_LINE = { false: 'TEAMMATES CANNOT HURT EACH OTHER.', true: 'TEAMMATES HURT EACH OTHER TOO.' };
export const foeModeOf = v => GOBLIN_CHOICES.includes(v) ? v : 'off';
export const foeDoorCols = (W, arena = 'pit') => (FOE_ARENAS[arena] || FOE_ARENAS.pit).doors.map(c => c < 0 ? W + c : c);

/* may a goblin be TOLD now? only in the fight itself, before sudden death (never the count, the K.O. banner, the winner screen) */
export const foeAllowed = (phase, clock, fightT = Infinity) => phase === 'fight' && clock < fightT;

/* THE SCHEDULE. st = { next } (the clock time of the next ENTRY, starts at FOE.first); alive = goblins standing + goblins told and not yet in; doorOk = a door is free of seats.
   Returns { tell: bool, at } - tell: start a '!' now, he walks in at `at`. A capped or doorless moment tries again a second later; the entry after one is `every` later. Mutates st.next only. */
export function foePlan(mode, st, clock, alive, doorOk = true) {
  const M = FOE[mode]; if (!M || !st) return { tell: false, at: 0 };
  if (clock < st.next - FOE.tell) return { tell: false, at: 0 };
  if (alive >= M.max || !doorOk) { st.next = clock + FOE.tell + 1; return { tell: false, at: 0 }; }
  const at = Math.max(st.next, clock + FOE.tell); st.next = at + M.every; return { tell: true, at };
}
/* THE DOOR: the one farthest from every seat (xs: the seats' x in px), or -1 when every door is within minSeat tiles of one. cols: door columns; TS: tile px. */
export function pickDoor(cols, xs, TS = 16, minTiles = FOE.minSeat) {
  let best = -1, bd = -1;
  cols.forEach((c, i) => { const x = c * TS + TS / 2; const d = xs.length ? Math.min(...xs.map(q => Math.abs(q - x))) : 1e9; if (d >= minTiles * TS && d > bd) { bd = d; best = i; } });
  return best;
}
export const doorFree = (col, xs, TS = 16, minTiles = FOE.minSeat) => !xs.some(q => Math.abs(q - (col * TS + TS / 2)) < minTiles * TS);
/* WHICH KIND: roll r in 0..1 against the arena's weights */
export function foeKind(r, arena = 'pit') { const A = FOE_ARENAS[arena] || FOE_ARENAS.pit; let a = 0; for (let i = 0; i < A.kinds.length; i++) { a += A.weights[i]; if (r < a) return A.kinds[i]; } return A.kinds[A.kinds.length - 1]; }
/* A GOBLIN BLOW on a seat with `hp` duel health of `max`: the flat share, NEVER below 1 health, never a K.O. Returns { hp, loss } */
export function foeWound(hp, max) { const cut = Math.max(1, Math.round(max * FOE.blow)); if (!(hp > 1)) return { hp: Math.max(hp, 0) > 0 ? hp : 1, loss: 0 }; const nh = Math.max(1, hp - cut); return { hp: nh, loss: hp - nh }; }
