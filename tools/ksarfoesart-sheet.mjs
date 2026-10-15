// tools/ksarfoesart-sheet.mjs - contact sheets of THE FALCONER / THE PLATED BANDIT / the falconer's hawk in Node (claude/ksarfoesart; not in the suite).
//   usage: node tools/ksarfoesart-sheet.mjs <out.png> [falconer|plate|bare|hawk|all] [scale]
import { install, sheet, savePNG } from './node-canvas.mjs';
install();
const out = process.argv[2] || 'ksarfoesart-sheet.png', which = process.argv[3] || 'all', sc = +(process.argv[4] || 5);
const A = await import('../src/redraw/ksar_foes_art.js'); const S = A.bakeKsarFoeSets(); const items = [];
if (which === 'falconer' || which === 'all') items.push(...S.falconer.R);
if (which === 'plate' || which === 'all') items.push(...S.ksarplate.R);
if (which === 'bare' || which === 'all') items.push(...S.ksarplatebare.R);
if (which === 'hawk' || which === 'all') items.push(...S.falconhawk.R);
savePNG(sheet(items, { maxW: 180, bg: '#a87a68', pad: 4, scale: sc }), out); console.log('wrote ' + out + ' (' + items.length + ' items)');
