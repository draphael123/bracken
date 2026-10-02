const fs=require('fs');let s=fs.readFileSync('src/main.js','utf8');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('miss '+a.slice(0,50));s=s.replace(a,()=>b);};
// plates + panel from one cached worst-case layout
const a=s.indexOf('  const plateAt = layoutPlates(');const b=s.indexOf('\r\n',a);
s=s.slice(0,a)+'  const plateAt = mapPlates().plates;   /* the worst case (every level two-line), so a board never moves with your progress and the lint proves what you see */'+s.slice(b);
rep("import { layoutPlates } from './map-plates.js';","import { layoutPlates, plateNodes, placePanel } from './map-plates.js';");
rep("function drawMap() {","/* THE MAP'S PLATES AND INFO PANEL (src/map-plates.js): one layout for every board, and for each node a camera height and panel corner that cover no node or board around it */\r\nlet mapPlateCache = null;\r\nfunction mapPlates() { if (!mapPlateCache) { const pn = plateNodes(NODES, n2 => LEVELS[n2.level].name); mapPlateCache = { pn, plates: layoutPlates(pn, VW), panels: new Map() }; } return mapPlateCache; }\r\nfunction mapPanelFor(nd) { const c = mapPlates(); let r = c.panels.get(nd.id); if (!r) { r = placePanel(c.pn.find(n2 => n2.id === nd.id), c.pn, c.plates); c.panels.set(nd.id, r); } return r; }\r\nfunction drawMap() {");
rep("const want = Math.max(0, Math.min(MAPH - VH, py - VH * 0.55));","const sit = !map.walking && NODES[map.node], want = Math.max(0, Math.min(MAPH - VH, py - VH * (sit ? mapPanelFor(sit).anchor : 0.55)));");
rep("    const cw = Math.min(VW - 12, 218), ch = store ? 26 : 58;","    const pp = mapPanelFor(nd), cw = pp.w, ch = pp.h;");
// the old corner logic
const c=s.indexOf('    const onRight = nd.x < VW / 2;');const d=s.indexOf('\r\n',s.indexOf('const cx0 = onRight',c));
s=s.slice(0,c)+'    const cx0 = pp.x, cy0 = pp.y;   /* the corner (and the camera height, in updateMap) that hides nothing around this node: placePanel */'+s.slice(d);
fs.writeFileSync('src/main.js',s);
