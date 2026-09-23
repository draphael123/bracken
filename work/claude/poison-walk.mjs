import {openPage} from '../../bracken/tools/cdp.mjs';
const pg=await openPage({port:5993,audio:false,fonts:false});
async function page(){const lvm=await import('./src/level.js');BK.manualSimulation=true;const out={};
 for(const h of ['knight','pyro']){BK.setHero(h);BK.reset({fresh:true});BK.load(lvm.LEVELS.findIndex(l=>l.id==='burial'));BK.start();BK.god=false;BK.sim(10);BK.reset();for(const e of BK.enemies())e.alive=false;
  const P=BK.P,k=BK.keys;
  // walk across holding right
  BK.tp(404,31);BK.sim(20);P.hp=P.maxHp;const tr=[];for(let i=0;i<360&&P.x<446*16;i++){k.right=true;BK.sim(1);if(i%20===0)tr.push([Math.round(P.x/16*10)/10,Math.round(P.y/16*10)/10,P.swim?1:0,P.hp]);}k.right=false;
  out[h+'_walk']={hp:P.hp,end:[P.x/16,P.y/16],tr};
  // drop into the gap at 414
  BK.tp(414,31);P.hp=P.maxHp;const tr2=[];for(let i=0;i<180;i++){BK.sim(1);if(i%20===0)tr2.push([Math.round(P.x/16*10)/10,Math.round(P.y/16*10)/10,P.swim?1:0,P.hp,P.ground?1:0]);}
  out[h+'_gap']={hp:P.hp,tr:tr2};}
 return out;}
try{console.log(JSON.stringify(await pg.evalp(`(${page})()`)));}finally{pg.close();}
