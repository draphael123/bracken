// work/mon3/probe.mjs - which of THE MONASTERY 3's waypoints the reach model gets to (lane helper)
import { LEVELS, T } from '../../src/level.js'; import { floodReach } from '../../src/reachcore.js';
const L = LEVELS.find(l => l.id === 'spire').build(); const R = floodReach(L, T, { rides: true, hero: process.env.REACH_HERO });
const near = (x, y) => { for (let dy = -2; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (R.seen.has((x + dx) + ',' + (y + dy))) return true; return false; };
const pts = { garthTop:[80,208], wheelTop:[90,202], refectory:[60,199], kitchen:[4,199], flueLedge:[10,191], flueTop:[9,175], scriptW:[20,181], scriptE:[80,181], cellA:[90,181], cellTop:[86,165], dorterE:[88,162], dorterMid:[70,162], dorterW:[10,162], roofLedge:[2,148], roof:[10,145], ropeBoard:[15,127], b1:[30,124], b3:[48,124], spire1:[56,126], spire5:[78,126], crevice:[85,115], towerTop:[85,90], bridgeMid:[70,90], westTop:[54,90], aLanding:[53,87], chapelE:[54,84], gallery:[20,74], loft:[25,58], ante:[25,55], hall:[40,55], ropeTop:[60,38], crawl:[30,35], arena:[50,29] };
for (const [k, [x, y]] of Object.entries(pts)) console.log(k.padEnd(10), x + ',' + y, near(x, y) ? 'yes' : '--');
