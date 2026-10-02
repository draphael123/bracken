import fs from 'node:fs'; import vm from 'node:vm';
import { LEVELS } from '../../../src/level.js';
import { layoutPlates, plateNodes, placePanel } from '../../../src/map-plates.js';
const src = fs.readFileSync(new URL('../../../src/main.js', import.meta.url), 'utf8');
const ctx = vm.createContext({ LEVELS });
vm.runInContext(src.slice(src.indexOf('const MAPW ='), src.indexOf('const MAPC =')) + '\nglobalThis.route = { NODES };', ctx);
const nodes = plateNodes(ctx.route.NODES, n => LEVELS[n.level].name), plates = layoutPlates(nodes, 320);
let bad = 0; for (const n of nodes) { const r = placePanel(n, nodes, plates); if (!r.ok) { bad++; console.log(n.id, 'best hits', r.hits.map(h => h.id + ':' + h.what).join(',')); } }
console.log(bad, 'of', nodes.length, 'infeasible');
