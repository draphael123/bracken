// src/drain.js - ENVIRONMENT DRAINS, shared (claude/ksar2; design standard A13, Daniel 10-08: "an environment drain is health off the bar with NO
// stagger, NO stun, NO flinch, NO hit-react"). The sun is the first user (src/sun-hands.js); the Long Water's OUT-OF-BREATH is meant to be the second.
// A DRAIN SOURCE is started and stopped by id on a hero; while it runs it takes a share of his MAX health a second (rate), straight off the bar through the
// caller's `take` (main.js sunDrain: P.hp down, die() naming the source if it was the last of it) - never through damagePlayer, so no knock, no hurt pose,
// no invulnerability window, no cancelled swing. Pure of the DOM; the visuals and the HUD are hooks.
//
//   const D = makeDrains({ take(pp, n, src), god(), onBeat(pp, n, src), beat })
//   D.set(pp, id, rate, o)   start (or re-rate) a source: rate = share of max health a second (0.03 = 3%/s); o = { name, col, ...anything the HUD wants }
//   D.stop(pp, id)           stop it (its part-taken fraction is dropped: a stop is a stop)
//   D.step(dt)               every hero, every source: accumulate, take whole hp, and once a `beat` (1 s) call onBeat(pp, hpTakenThatBeat, src)
//                            - the TICK VISUALS hook (a '-n', a sizzle, a gasp)
//   D.sources(pp)            [{ id, rate, name, col, ... }] - the HUD METER hook (what drains him now, and how hard)
//   D.rate(pp)               the summed rate on him now
export function makeDrains({ players, take, god = () => false, onBeat = () => {}, beat = 1 }) {
  const D = {};
  const map = pp => pp.drains || (pp.drains = new Map());
  D.set = (pp, id, rate, o = {}) => { const m = map(pp), s = m.get(id) || { id, acc: 0, took: 0, beatT: beat }; Object.assign(s, o, { rate: Math.max(0, rate) }); m.set(id, s); return s; };
  D.stop = (pp, id) => { if (pp.drains) pp.drains.delete(id); };
  D.clear = pp => { if (pp.drains) pp.drains.clear(); };
  D.sources = pp => (pp.drains ? [...pp.drains.values()].filter(s => s.rate > 0) : []);
  D.rate = pp => D.sources(pp).reduce((a, s) => a + s.rate, 0);
  D.step = dt => {
    for (const pp of players()) { if (!pp.drains) continue;
      for (const s of pp.drains.values()) {
        if (pp.dead || god(pp)) { s.acc = 0; continue; }
        if (s.rate > 0) { s.acc += s.rate * dt * (pp.maxHp || 100); const n = Math.floor(s.acc); if (n >= 1) { s.acc -= n; s.took += n; take(pp, n, s); } }
        s.beatT -= dt; if (s.beatT <= 0) { s.beatT += beat; if (s.took > 0) onBeat(pp, s.took, s); s.took = 0; } } }
  };
  return D;
}
