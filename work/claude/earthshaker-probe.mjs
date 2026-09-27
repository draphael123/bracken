/* EARTHSHAKER, 2026-09-24: a full jump on flat ground must NOT quake; a drop from well above a jump must. Not in the suite. */
import{openPage}from'../../tools/cdp.mjs';
const pg=await openPage({audio:false,fonts:false});try{
const r=await pg.evalp(`(async()=>{const {xpFloor}=await import('/src/xp.js');BK.manualSimulation=true;
for(const k in BK.keys)BK.keys[k]=false;BK.setHero('paladin');BK.reset({fresh:true});BKT.PROG.xp.paladin=xpFloor(24);BK.applyUpgrades();BK.load(0);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');BK.tp(3,21);BK.sim(1);
const out={};const land=()=>{let g=BK.P.ground,d=null;for(let i=0;i<120;i++){BK.sim(1/60);if(BK.P.ground&&!g&&d===null)d=Math.round(BK.P.y-BK.P.airTopY);g=BK.P.ground;}return d;};
BK.press('jump');BK.keys.jump=true;out.flatJumpDrop=land();BK.keys.jump=false;
const y0=BK.P.y;BK.P.y-=110;BK.P.vy=0;BK.P.ground=false;out.drop110=land();out.threshold=72;out.back=Math.round(BK.P.y-y0);
return out;})()`);console.log(JSON.stringify(r));}finally{await pg.close();}
