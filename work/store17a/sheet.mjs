import{openPage}from'../../tools/cdp.mjs';import{writeFileSync}from'node:fs';
const pg=await openPage({audio:false,fonts:false});try{
const d=await pg.evalp(`(async()=>{const M=await import('/src/ability-preview.js');BK.setHero('knight');
const ids=['lunge','shieldThrow','warCry','groundSlam','whirlwind','meteor','wisp','fireWall','consecrate','grapeshot','keelhaul','graveTide','summonSkeleton','skewer','harrier','rainOfSpears','stoneStep','boulder','archway','entomb','blessedHammer','disarm','divineShield','risingCut'];
const cv=document.createElement('canvas');cv.width=146*6;cv.height=76*4;const g=cv.getContext('2d');g.imageSmoothingEnabled=false;
const fr=document.createElement('canvas');fr.width=16;fr.height=26;const f=fr.getContext('2d');f.fillStyle='#8a96a8';f.fillRect(3,0,10,26);
ids.forEach((id,i)=>M.drawAbilityPreview(g,(i%6)*146,Math.floor(i/6)*76,146,76,{id,hero:'knight',t:0.8+0.7,idle:[fr],atk:[fr,fr,fr],icon:null}));
return cv.toDataURL();})()`);
writeFileSync('work/store17a/sheet.png',Buffer.from(d.split(',')[1],'base64'));console.log(pg.errors);
}finally{pg.close();}
