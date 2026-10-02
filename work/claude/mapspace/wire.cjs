const fs=require('fs');let s=fs.readFileSync('src/main.js','utf8');
const cut=(from,to,rep)=>{const a=s.indexOf(from);const b=s.indexOf(to,a);if(a<0||b<0)throw new Error('miss '+from.slice(0,30));s=s.slice(0,a)+rep+s.slice(b+to.length);};
// 1. the placement block (placed/hit/node boxes) -> one layoutPlates call over the visible nodes
cut("  const placed = [], hit =", "// the nodes and their flags are not to be covered either",
"  /* THE PLATES' PLACES come from src/map-plates.js (one function, shared with tools/map-spacing.mjs, which fails the build when two\r\n     nodes or plates would overlap); a node's own `plate: 'above' | 'below' | 'left' | 'right'` is the side tried first. */\r\n  const plateAt = layoutPlates(NODES.filter(n2 => !nodeSecret(n2)).map(n2 => { const lk2 = nodeLocked(n2), lb = n2.kind === 'store' ? (n2.id === 'highstore' ? 'HIGH STORE' : 'STORE') : (LEVELS[n2.level].secret && lk2) ? '? ? ?' : LEVELS[n2.level].name; return { id: n2.id, x: n2.x, y: n2.y, kind: n2.kind, plate: n2.plate, label: lb, twoLine: n2.kind === 'level' && !!PROG[LEVELS[n2.level].id] && !lk2 }; }), VW);");
// 2. inside the loop: take the layout instead of the greedy tries
cut("    let lx = Math.max(tw / 2 + 6, Math.min(VW - tw / 2 - 6, nd.x)), ly = nd.y + 12;", "placed.push({ x: lx - tw / 2, y: ly, w: tw, h: th }); }",
"    const pl = plateAt.get(nd.id), lx = pl.x + pl.w / 2, ly = pl.y;");
if(!s.includes("import { layoutPlates }")){ const i=s.indexOf('\r\n', s.indexOf('import '));s=s.slice(0,i)+"\r\nimport { layoutPlates } from './map-plates.js';"+s.slice(i);}
fs.writeFileSync('src/main.js',s);
