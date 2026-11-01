const fs=require('fs');
function ed(f,pairs){let s=fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n');for(const [a,b] of pairs){if(s.split(a).length!==2)throw new Error(f+': '+a.slice(0,70));s=s.replace(a,()=>b);}fs.writeFileSync(f,s.replace(/\n/g,'\r\n'));}
ed('tools/class-spurs.mjs',[
["    BKT.PROG.stockade = { cleared: true, medal: 3, best: 301 };   /* DANIEL'S DESIGN CHANGE 10-15: no clock - a cleared Stockade opens the Burning Village, however slow */\n    press('ArrowUp');\n    out.slowTry = BKT.PROG.mapNodeId;\n    press('ArrowDown'); BKT.PROG.stockade = { cleared: true, medal: 1, best: 299 };\n    press('ArrowUp');",
 "    BKT.PROG.stockade = { cleared: true, medal: 3, best: 301 };   /* DANIEL 11-01: a cleared Stockade no longer opens the Burning Village - King Gorm beaten in ONE LIFE does (PROG.burningOpen, tools/gorm-unlock.mjs) */\n    press('ArrowUp');\n    out.slowTry = BKT.PROG.mapNodeId;\n    BKT.PROG.burningOpen = 1; BKT.PROG.stockade = { cleared: true, medal: 1, best: 299 };\n    press('ArrowUp');"],
["    BKT.PROG.stockade = { cleared: true, medal: 1 };\n    out.bronzeAt = goTo('stockade');\n    press('ArrowUp');\n    out.bronzeTry = BKT.PROG.mapNodeId;",
 "    BKT.PROG.stockade = { cleared: true, medal: 1 };\n    out.bronzeAt = goTo('stockade');\n    press('ArrowUp');\n    out.bronzeTry = BKT.PROG.mapNodeId;\n    BKT.PROG.burningOpen = 1; press('ArrowUp');\n    out.bronzeGorm = BKT.PROG.mapNodeId;"],
]);
