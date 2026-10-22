// Collect abandoned native-backed art in disposable lab helpers, including long synchronous simulations.
// This function is serialized into the page; keep it independent of module bindings.
export function installLabCollection(BK, collect, names = ['load', 'setHero', 'reset', 'sim', 'step', 'draw1', 'look'], every = 1) {
  let count = 0, pending = 0, frames = 0, draws = 0;
  for (const name of names) {
    const original = BK[name];
    if (typeof original !== 'function' || original.__labGc) continue;
    const wrapped = function (...args) {
      try { return original.apply(this, args); }
      finally {
        if (name === 'sim' || name === 'step') {
          const n = args[0]; frames += n === undefined ? 1 : typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.ceil(n)) : 1;
          if (frames >= 240) { frames = 0; collect(); }
        }
        else if (name === 'draw1' || name === 'look') { if (++draws >= 60) { draws = 0; collect(); } }
        else if (name === 'load') { pending = frames = draws = 0; collect(); }
        else if ((name !== 'reset' || args[0]?.fresh) && ++pending >= every) { pending = 0; collect(); }
      }
    };
    Object.defineProperty(wrapped, '__labGc', { value: true });
    BK[name] = wrapped; count++;
  }
  return count;
}
