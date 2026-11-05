import { LEVELS } from '../../src/level.js';
const L = LEVELS.find(l => l.id === 'spire').build(); console.log(L.moversExtra.map(m => [m.kind, m.cw, m.x/16, m.y/16, JSON.stringify(m.cwBand)].join(' ')).join('\n'));
