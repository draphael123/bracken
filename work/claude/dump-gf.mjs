import { LEVELS, T } from '../../src/level.js';
const d=LEVELS.find(l=>l.id==='kings'); const L=d.build();
const [x0,x1,y0,y1]=process.argv.slice(2).map(Number);
const ch=v=>v===0?'.':v===T.SOLID?'#':v===T.ONEWAY?'-':String(v%10);
console.log(L.W,L.H);
for(let y=y0;y<=y1;y++){let s=String(y).padStart(3)+' ';for(let x=x0;x<=x1;x++)s+=ch(L.grid[y*L.W+x]);console.log(s);}
