const fs=require('fs');const f='src/monastery3.js';let s=fs.readFileSync(f,'utf8');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1)throw new Error('match '+n+': '+a.slice(0,70));s=s.replace(a,b);};
rep("  block(86, 88, 206, 208); masonry.push([86, 88, 206, 208]);           /* the dovecote's stone foot: a step up off the top terrace */\n  boards(90, 203, 5);                                                  /* the trellis under the refectory's trapdoor (keyed into the east wall) */\n",
"  /* THE GARTH'S PRAYER WHEEL (the old level's first lesson, moved out into the garden): turned to the dovecote; strike it and its stair climbs to the trapdoor */\n  wheel(209, 84, 207, 2, 'b');\n  ent('sign', 78, 208, { text: 'A PRAYER WHEEL. STRIKE IT AND ITS STAIR TURNS. STRIKE IT AGAIN AND IT TURNS BACK.' });\n");
rep("[83, 208, 'fruitTree', 2], [87, 205, 'dovecote', 0]]","[76, 208, 'fruitTree', 2], [92, 208, 'dovecote', 0]]");
rep("[80, 208], [92, 202]);","[80, 204], [91, 202]);");
rep("  boards(76, 159, 5); boards(80, 156, 4);\n","");
rep("hatch(4, 146, 4); rope(5, 149, 162);                                 /* the monks' ladder up through the roof */",
"hatch(4, 146, 4); boards(1, 149, 3); brazier(5, 163, 14, { phase: 1.0, lift: 210 });   /* the dormitory's warming brazier still breathes: its smoke goes up to the roof hatch */");
// wheel helper is defined after the garth code? ensure ordering ok (const arrow defined at top) 
fs.writeFileSync(f,s);console.log('ok');
