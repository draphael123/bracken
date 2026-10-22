// Install collection only in disposable lab helpers that rebuild native-backed art.
// This function is serialized into the page; keep it independent of module bindings.
export function installLabCollection(BK, collect, names = ['load', 'setHero', 'reset'], every = 4) {
  let count = 0, pending = 0;
  for (const name of names) {
    const original = BK[name];
    if (typeof original !== 'function' || original.__labGc) continue;
    const wrapped = function (...args) {
      try { return original.apply(this, args); }
      finally {
        if (name === 'load') { pending = 0; collect(); }
        else if ((name !== 'reset' || args[0]?.fresh) && ++pending >= every) { pending = 0; collect(); }
      }
    };
    Object.defineProperty(wrapped, '__labGc', { value: true });
    BK[name] = wrapped; count++;
  }
  return count;
}
