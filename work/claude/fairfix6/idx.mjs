import { LEVELS } from '../../../src/level.js';
import { THREAT, measureLevel, indexOf, spanOf } from '../../../src/threat.js';
const L = LEVELS.find(l => l.id === 'fair').build(), T2 = { BOUNCER: 10, SPIKE: 3, AIR: 0, SOLID: 1 };
const idx = L2 => { const m = measureLevel(L2, { T: T2, TS: 16 }); return [indexOf({ threat: m.threat, kinds: m.kinds, hazTiles: m.hazTiles, gap: m.gap, span: spanOf(L2.W, L2.H) }), m.threat, m.kinds]; };
console.log('now', idx(L));
const drop = f => ({ ...L, ents: L.ents.filter(e => !f(e)) });
console.log('no wickermen', idx(drop(e => e.t === 'wickerman')));
console.log('no exam wm', idx(drop(e => e.t === 'wickerman' && e.x > 500)));
console.log('wm weight', THREAT.wickerman, 'strongman?', THREAT.brute, THREAT.strongman);
