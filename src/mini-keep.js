// src/mini-keep.js - MINIS NEVER RESPAWN (B18; scratch/brief-sealedpyramid3-1014.md item 1, plan-desert-1105 section 3i) - claude/sealedpyramid3, 11-05.
// THE BUG: main.js spawnEntities() resets `miniDone = false` on every attempt (a death, a restart) and on the level load itself, after loadLevel had read it from
// PROG. Only the harbour and the reverse tower re-read it. So a beaten mini stood up again after a death before the next shrine (and on a later visit), and
// fought again; the gate she lifted was already open, so the reward was the only thing the save remembered.
// THE FIX (one place, the shared lifecycle): after that reset, ask miniKeep() what the save says. A mini once beaten stays beaten for the run (PROG[level].mini,
// PROG[level].mini2 - written by miniEnd the moment she falls, before any shrine); her gate cells are opened again; no refight, no second reward. Boss rush
// (rushOn) is untouched: a rush fights every mini every time.
// PURE: L is the level object (L.mini, L.mini1, L.mini2, L.unburied), prog = PROG[levelId] (or undefined), rush = rushOn().
// -> { done, mini, gates } : done = the mini the road meets next is down; mini = the L.mini to use (a two-mini level's second once the first is down);
//    gates = the tile columns whose PORT cells open (each beaten mini's gate; never the Unburied Field's, whose gate is its chapel's business).
export function miniKeep(L, prog, rush = false) {
  const p = prog || {};
  if (!L || !L.mini) return { done: false, mini: L ? L.mini : null, gates: [] };
  if (rush) return { done: false, mini: L.mini2 ? (L.mini1 || L.mini) : L.mini, gates: [] };
  const gate = m => (m && m.gate !== undefined && !L.unburied ? [m.gate] : []);
  if (L.mini2) {
    const m1 = L.mini1 || L.mini;
    if (!p.mini) return { done: false, mini: m1, gates: [] };
    return { done: !!p.mini2, mini: L.mini2, gates: [...gate(m1), ...(p.mini2 ? gate(L.mini2) : [])] };
  }
  return { done: !!p.mini, mini: L.mini, gates: p.mini ? gate(L.mini) : [] };
}
/* the same question for a single spawn row: is this placed creature a mini the save says is down? (main.js spawnEnt's guard reads miniDone; this is the test's) */
export function miniStaysDown(L, prog, ent, rush = false) {
  if (rush || !L || !L.mini || !ent) return false; const k = miniKeep(L, prog, rush), p = prog || {};
  if (L.mini2) { const m1 = L.mini1 || L.mini; return !!((ent.t === m1.boss && p.mini && (ent.mini || ent.t !== L.mini2.boss)) || (ent.t === L.mini2.boss && p.mini2)); }
  return k.done && ent.t === L.mini.boss;
}
