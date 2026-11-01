const fs=require('fs');
function ed(f,pairs){let s=fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n');for(const [a,b] of pairs){if(s.split(a).length!==2)throw new Error(f+': '+a.slice(0,70));s=s.replace(a,()=>b);}fs.writeFileSync(f,s.replace(/\n/g,'\r\n'));}
ed('tools/level-reach.mjs',[
["      /* THE SECRETS (needsTime / needsKills)",
 "      /* THE BURNING VILLAGE (claude/smallfix7, Daniel 11-01): opens on KING GORM beaten in ONE LIFE (PROG.burningOpen, tools/gorm-unlock.mjs proves the fight; Kingswood is reached by normal play), so a cleared Kingswood stands for a clean win here */\n      if (P.kings && P.kings.cleared && !P.burningOpen) { P.burningOpen = 1; changed = true; }\n      /* THE SECRETS (needsTime / needsKills)"],
["      P[j] = { cleared: true, medal: { bronze: 1, silver: 2, gold: 3 }[lv.opensOn.medal] || 0, ...(lv.opensOn.time ? { best: lv.opensOn.time } : {}) }; }",
 "      P[j] = { cleared: true, medal: { bronze: 1, silver: 2, gold: 3 }[lv.opensOn.medal] || 0, ...(lv.opensOn.time ? { best: lv.opensOn.time } : {}) }; if (lv.opensOn.gorm) { s.gorm = true; s.stepWhileShut = false; for (const key of ['ArrowUp', 'ArrowDown']) { goTo(j); press(key); if (BKT.PROG.mapNodeId === id) s.stepWhileShut = true; } P.burningOpen = 1; } }"],
["  for (const s of r.steps) assert.ok(s.onSpur,",
 "  for (const s of r.steps) if (s.gorm) assert.ok(!s.stepWhileShut && s.tip && s.tip[0] === 'LOCKED: BEAT KING GORM WITHOUT FALLING', s.id + ': the Gorm-locked road must stay shut with the Stockade cleared and SHOW its rule (' + JSON.stringify(s) + ')');\n  for (const s of r.steps) assert.ok(s.onSpur,"],
]);
