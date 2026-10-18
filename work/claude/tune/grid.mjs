import { openPage } from '../../../tools/cdp.mjs';
const [c0, c1, r0, r1] = process.argv.slice(2).map(Number);
const pg = await openPage({ audio: false, fonts: false });
try { const R = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const idx=LEVELS.findIndex(l=>l.id==='flotilla');BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.sim(5);const L=BK.L,o=[];for(let r=${r0};r<=${r1};r++){let s=String(r).padStart(3)+' ';for(let c=${c0};c<=${c1};c++)s+=String(L.grid[r*L.W+c]).padStart(3);o.push(s);}return o.join(String.fromCharCode(10));})()`, 600000); console.log(R); } finally { pg.close(); }
