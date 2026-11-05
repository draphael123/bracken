import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try { console.log(JSON.stringify(await pg.evalp(`(()=>{const ids=BKT.levelIds();const i=ids.indexOf('kings');BK.setHero('knight');BK.reset({fresh:true});BK.load(i);BK.state='play';const L=BK.L;const types={};for(const e of BK.enemies()){types[e.t]=(types[e.t]||0)+1;}return {i,W:L.W,H:L.H,types,ents:Object.keys((L.ents||[]).reduce((a,q)=>(a[q.t]=1,a),{})).slice(0,30)};})()`))); } finally { pg.close(); }
