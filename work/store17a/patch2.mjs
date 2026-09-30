import fs from 'node:fs';
let s=fs.readFileSync('src/main.js','utf8');
const rep=(a,b)=>{const i=s.indexOf(a);if(i<0||s.indexOf(a,i+1)>=0)throw Error('not unique: '+a.slice(0,50));s=s.replace(a,()=>b);};
rep("      } else {\r\n        const icon = iconOf(k);\r\n        const isc = squeeze",
"      } else if (tab.talent) {   /* the SKILLS shop window: your hero's abilities performed one after another (src/ability-preview.js) */\r\n        const acts = treeNodesFor(hero()), a = acts[Math.floor(time / 3.6) % Math.max(1, acts.length)];\r\n        if (a) { treePreview(a, pvX + 2, pvY + 2, pvW - 4, 44 - squeeze); text(fitName(a.name, pvW - 12, 6), pvX + 6, pvY + 4, UI.gold, 'left', 6); }\r\n      } else {\r\n        const icon = iconOf(k);\r\n        const isc = squeeze");
rep("const treeNodes = () =>","const treeNodesFor = h => skillsFor(h).filter(n => n.active).sort((a,b) => a.level-b.level || a.price-b.price || a.name.localeCompare(b.name));\r\nconst treeNodes = () =>");
fs.writeFileSync('src/main.js',s);
