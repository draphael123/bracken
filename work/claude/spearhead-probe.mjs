/* SPEARHEAD, rescoped 2026-09-24: a tapped third thrust stays a thrust; a HELD third fires the run-through near-instantly. Not in the suite. */
import{openPage}from'../../tools/cdp.mjs';
const pg=await openPage({audio:false,fonts:false});try{
const r=await pg.evalp(`(async()=>{const {xpFloor}=await import('/src/xp.js');BK.manualSimulation=true;
const run=(hold,lv)=>{for(const k in BK.keys)BK.keys[k]=false;BK.setHero('warden');BK.reset({fresh:true});BKT.PROG.xp.warden=xpFloor(lv);BK.applyUpgrades();BK.load(0);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');BK.tp(3,21);BK.sim(1);
 const out=[];for(let i=0;i<3;i++){BK.P.st=BK.P.maxSt;BK.press('atk');BK.keys.atk=true;let heavy=false,t=0;const n=(i===2?hold:0.05);for(;t<n;t+=1/60){BK.sim(1/60);if(BK.P.heavy||BK.P.runThrough)heavy=true;}BK.keys.atk=false;for(let k=0;k<(i===2?40:24);k++){BK.sim(1/60);if(BK.P.heavy||BK.P.runThrough)heavy=true;}out.push({combo:BK.P.combo,heavy,held:+t.toFixed(2)});}return out;};
const f=(h,l)=>run(h,l)[2].heavy;return {tapL24:f(0.05,24),tapL10:f(0.05,10),hold20L24:f(0.2,24),hold20L21:f(0.2,21),hold20L22:f(0.2,22),hold30L10:f(0.3,10),hold60L10:f(0.6,10)};})()`);
console.log(JSON.stringify(r));}finally{await pg.close();}
