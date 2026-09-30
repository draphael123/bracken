import{openPage}from'../../tools/cdp.mjs';import{writeFileSync}from'node:fs';
const tag=process.argv[2]||'x';
const pg=await openPage({audio:false,fonts:false});try{
const r=await pg.evalp(`(async()=>{const{xpFloor}=await import('/src/xp.js');BK.manualSimulation=true;const shots=[];
BK.setHero('knight');BK.reset({fresh:true});BKT.PROG.xp.knight=xpFloor(12);BKT.PROG.coins=400;BK.applyUpgrades();BK.load(0);BK.state='map';
BK.state="store";BK.step(40);BK.ui.storeMode='buy';BK.ui.storeTab=4;BK.ui.storeI=0;BK.step(1);shots.push(['store-skills',BK.view.buf.toDataURL()]);
BK.ui.storeTab=0;BK.ui.storeI=1;BK.step(1);shots.push(['store-heroes',BK.view.buf.toDataURL()]);
BK.state='tree';BK.ui.treeTab=0;BK.ui.treeI=2;BK.step(50);BK.step(1);shots.push(['tree',BK.view.buf.toDataURL()]);
return shots;})()`);
for(const[n,d]of r)writeFileSync('work/store17a/'+tag+'-'+n+'.png',Buffer.from(d.split(',')[1],'base64'));
console.log(pg.errors);
}finally{pg.close();}
