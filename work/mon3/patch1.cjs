const fs=require('fs');const f='src/monastery3.js';let s=fs.readFileSync(f,'utf8');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1)throw new Error('match '+n+': '+a.slice(0,60));s=s.replace(a,b);};
rep("  ent('sign', 9, 199 - 1, { text: '' });\n  ents.pop();\n","");
rep("  hatch(51, 85, 6);   ","  block(50, 57, 85, 87); hatch(51, 85, 6);   ");
// cliff path v3
const a=s.indexOf("  // the crag's west face: a buttress"), b=s.indexOf("  /* ================= THE BELL TOWERS");
s=s.slice(0,a)+`  block(3, 3, 119, 139);                                               /* the rope well's wall (the well runs on down to the roof) */
  // the monks' ROPE LADDER off the roof, up to a scaffold board hung from the shelf
  rope(12, 129, 145); boards(13, 128, 6); rope(18, 119, 127);
  // THE MONKS' HOIST: two baskets on one rope over a wheel in the crag - board one, and ride the other up as it passes
  pair(22, 26, 133, 5, 121); block(21, 28, 119, 120);
  ent('sign', 15, 127, { text: 'THE MONKS\' HOIST. STAND IN A BASKET AND IT SINKS, AND THE OTHER COMES UP PAST YOU. JUMP ACROSS AS IT GOES BY.' });
  // THE HANGING SCAFFOLD the monks strung along the face, each board on its rope from the shelf - one of them old timber that fails
  boards(29, 125, 6); rope(34, 119, 124);
  boards(38, 127, 6); rope(43, 119, 126);
  boards(46, 125, 6); rope(51, 119, 124); crumbles.push({ x0: 46, x1: 51, row: 125, rows: 1, count: 3 });
  ent('sign', 40, 126, { text: 'OLD TIMBER. STAND ON IT AND IT COUNTS DOWN, THEN IT GOES - BACK A FEW SECONDS LATER.' });
  // under the broken shelf, crag SPIRES up off the roof: the birds' perches, and yours
  for (const [x0, top] of [[55, 127], [61, 129], [66, 127], [72, 129], [77, 127]]) block(x0, x0 + 2, top, 145);
  // the last: a rope from the east tower's foot - grab it from the last spire and climb up through the tower's floor
  hatch(83, 116, 4); rope(84, 117, 131);
  // birds on the outside: harpies over the drop, fledglings on the spires, bats round the hoist's crag
  ent('bat', 25, 123); ent('bat', 40, 121); ent('harpy', 63, 122); ent('harpy', 74, 133); ent('fledgling', 56, 126, { face: 1 }); ent('fledgling', 78, 126, { face: -1 });
  coins([12, 140], [12, 134], [16, 127], [31, 124], [41, 126], [49, 124], [56, 126], [62, 128], [67, 126], [73, 128], [84, 124]);
  ent('silver', 14, 127);
  flags.push([30, 120, 50, 121]);

`+s.slice(b);
// east tower: no door at its foot; it is entered up through its floor from the cliff rope
rep("block(BX + 7, BX + 7, 92, 115); air(BX + 7, BX + 7, 113, 115);","block(BX + 7, BX + 7, 92, 115);");
rep("ent('sign', BX + 2, 115, {","ent('sign', BX + 5, 115, {");
fs.writeFileSync(f,s);console.log('ok');
