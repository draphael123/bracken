import { LEVELS } from '../../src/level.js';
import { depthsOf, gateOf } from '../../src/campaign-order.js';
import { campaignLevel } from '../../tools/boss-level.mjs';
const D = depthsOf(LEVELS);
const rows = LEVELS.filter(l => l.arena && l.arena.boss).map(l => ({ id: l.id, name: l.name, d: D[l.id], boss: l.arena.boss, L: campaignLevel(l.id), act: l.act }));
rows.sort((a, b) => (a.d ?? 99) - (b.d ?? 99));
for (const r of rows) console.log(JSON.stringify(r));
