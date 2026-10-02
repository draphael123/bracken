const fs=require('fs');let s=fs.readFileSync('src/main.js','utf8');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('miss '+a.slice(0,50));s=s.replace(a,()=>b);};
rep("    text(mapPanel.open ? '↑↓ SELECT  Z JUMP  TAB CLOSE' : 'ARROWS MOVE  Z ENTER  TAB ALL LEVELS  X BEASTS', 4, VH - 8, UI.dim, 'left', 6);\r\n    text(coopLbl, VW - 4, VH - 8, on ? '#8fd160' : UI.dim, 'right', 6); }",
"    for (const f of mapFooter(mapPanel.open, on)) text(f.t, f.x, VH - 8, f.right ? (on ? '#8fd160' : UI.dim) : UI.dim, f.right ? 'right' : 'left', 6); }");
rep("    const on = coopShown(), coopLbl = 'F CO-OP ' + (on ? 'ON' : 'OFF');\r\n","    const on = coopShown();\r\n");
rep("function drawMap() {","/* THE FOOTER'S LABELS: the controls on the left, the co-op switch on the right; tools/map-spacing.mjs measures them (BK.mapFooter) and fails if they touch */\r\nfunction mapFooter(open, on) { return [{ t: open ? '↑↓ SELECT  Z JUMP  TAB CLOSE' : 'ARROWS MOVE  Z ENTER  TAB LEVELS  X BEASTS', x: 4 }, { t: 'F CO-OP ' + (on ? 'ON' : 'OFF'), x: VW - 4, right: true }]; }\r\nfunction drawMap() {");
rep("window.BK.mapLook = ","window.BK.mapFooter = () => [false, true].flatMap(open => [false, true].map(on => mapFooter(open, on).map(f => ({ ...f, w: textW(f.t, 6) })))); window.BK.mapLook = ");
fs.writeFileSync('src/main.js',s);
