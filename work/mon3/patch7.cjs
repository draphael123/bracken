const fs=require('fs');const f='src/main.js';let s=fs.readFileSync(f,'utf8');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1)throw new Error('match '+n+': '+a.slice(0,70));s=s.replace(a,b);};
// 1. the prop carries its rope, and a struck one starts down
rep("span: e.span || null, offer: !!e.offer,","span: e.span || null, rope: e.rope || null, offer: !!e.offer,");
rep("down: !!(e.span && marks.has('tbell:' + e.x + ',' + e.y)) });","down: !!((e.span || e.rope) && marks.has('tbell:' + e.x + ',' + e.y)) });");
// 2. applyWorld: a rope a bell let down stays down
rep("  /* a bridge a bell brought down stays down */","  /* a bridge a bell brought down stays down */"); // sanity no-op
const tail="{ const [x0, x1, row] = e.span; for (let x = x0; x <= x1; x++) { const i = row * LW + x; if (L.grid[i] === T.AIR) { L.grid[i] = T.PLANK; tileSpr[i] = null; ch = true; } } } return ch; }";
rep(tail, "{ const [x0, x1, row] = e.span; for (let x = x0; x <= x1; x++) { const i = row * LW + x; if (L.grid[i] === T.AIR) { L.grid[i] = T.PLANK; tileSpr[i] = null; ch = true; } } } for (const e of L.ents) if (e.t === 'tbell' && e.rope && marks.has('tbell:' + e.x + ',' + e.y)) { const [rx, y0, y1] = e.rope; for (let y = y0; y <= y1; y++) { const i = y * LW + rx; if (L.grid[i] === T.AIR) { L.grid[i] = T.NET; tileSpr[i] = null; ch = true; } } } return ch; }   /* (claude/monastery3-1105) and so does a BELL ROPE: THE MONASTERY 3's shortcuts (src/monastery3.js) */");
// 3. the strike: a rope bell unrolls its rope down the well
rep("    else if (pr.guard) { pr.cool = 2.5; if (TGM) TGM.bellNote(pr); }",
"    else if (pr.rope) { pr.cool = 1.5;   /* (claude/monastery3-1105) A BELL ROPE (THE MONASTERY 3's shortcuts, Daniel 11-02 15:55 #5): struck, its rope unrolls down the well - and stays down (applyWorld) */\n      if (!pr.down) { pr.down = true; marks.add(pr.key); const [rx, y0, y1] = pr.rope; for (let y = y0; y <= y1; y++) { const i = y * LW + rx; if (L.grid[i] === T.AIR) { L.grid[i] = T.NET; tileSpr[i] = null; } }\n        resolveTiles(); SFX.gateDrop(); number(pr.x, pr.y - 36, 'THE ROPE UNROLLS: A WAY BACK UP', '#8fd160'); } }\n    else if (pr.guard) { pr.cool = 2.5; if (TGM) TGM.bellNote(pr); }");
fs.writeFileSync(f,s);console.log('ok');
