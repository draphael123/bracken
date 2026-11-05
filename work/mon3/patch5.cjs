const fs=require('fs');const f='src/monastery3.js';let s=fs.readFileSync(f,'utf8');
const a=s.indexOf("  boards(29, 125, 6); rope(34, 119, 124);"), b=s.indexOf("  ent('sign', 40, 126,");
if(a<0||b<0)throw 'nf';
s=s.slice(0,a)+`  boards(26, 128, 6); rope(31, 119, 127);                             /* the hoist's top landing: where the rising basket puts you */
  boards(34, 126, 6); rope(39, 119, 125);
  boards(42, 127, 6); rope(47, 119, 126); crumbles.push({ x0: 42, x1: 47, row: 127, rows: 1, count: 3 });
  boards(50, 125, 4); rope(53, 119, 124);
`+s.slice(b);
s=s.replace("ent('sign', 40, 126, {","ent('sign', 36, 125, {");
s=s.replace("coins([12, 140], [12, 134], [16, 127], [31, 124], [41, 126], [49, 124], [56, 126],","coins([12, 140], [12, 134], [16, 127], [28, 127], [36, 125], [44, 126], [51, 124], [56, 126],");
fs.writeFileSync(f,s);console.log('ok');
