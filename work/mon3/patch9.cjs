const fs=require('fs');let s=fs.readFileSync('src/monastery3.js','utf8');
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1)throw new Error('match '+n+': '+a.slice(0,70));s=s.replace(a,b);};
rep("wheel(209, 85, 207, 2, 'b');","wheel(208, 85, 207, 2, 'b');");
rep("wheel(74, 35, 71, 6, 'a');","wheel(73, 35, 71, 6, 'a');");
rep("[82, 82, 116, 118, 'the shelf between the broken floor and the crevice, under the east tower']]","[82, 82, 116, 118, 'the shelf between the broken floor and the crevice, under the east tower'], [3, 3, 119, 139, 'the rope well wall, down the outside of the crag'], [3, 12, 163, 184, 'the kitchen chimney breast: only the rope well parts it from the map wall']]");
fs.writeFileSync('src/monastery3.js',s);
let t=fs.readFileSync('src/stuck-spots.js','utf8');t=t.replace("at: [86, 209], glint","at: [86, 208], glint").replace("at: [36, 74], glint","at: [36, 73], glint");fs.writeFileSync('src/stuck-spots.js',t);console.log('ok');
