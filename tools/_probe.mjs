import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try { const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const o=[];
 for(let i=0;i<LEVELS.length;i++){try{BK.setHero('knight');BK.reset({fresh:true});BK.load(i);BK.start();const L=BK.L;o.push([LEVELS[i].id,L.arena?L.arena.boss:'',L.mini?L.mini.boss:'',L.W].join(' '));}catch(e){o.push(LEVELS[i].id+' ERR '+e.message)}}
 return o;})()`, 600000); console.log(r.join('\n')); console.log(pg.errors.slice(0,3)); } finally { pg.close(); }
