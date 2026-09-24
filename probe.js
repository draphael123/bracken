(async()=>{const {LEVELS}=await import('/src/level.js');BK.load(LEVELS.findIndex(l=>l.id==='caravan'));BK.start();BK.sim(5);const L=BK.L;
return JSON.stringify({ents:L.ents.filter(e=>e.t==='deco').slice(0,12).map(e=>e.kind+'@'+e.x+','+e.y), keys:Object.keys(BK).filter(k=>/deco|decor|prop/i.test(k))})})()
