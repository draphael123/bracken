const fs=require('fs');let s=fs.readFileSync('tools/coop-boss-rates.mjs','utf8');
function rep(a,b){if(s.split(a).length!==2)throw new Error(a);s=s.replace(a,()=>b);}
rep("const r=tp0.call(BK,x,y);BK.players()","const r=tp0.call(BK,x,y);if(!window.__cbFl0)window.__cbFl0=BK.players().map(q=>q.flasks|0);BK.players()");
rep("const wipes0=BK.stats().deaths;let r,","window.__cbFl0=null;const wipes0=BK.stats().deaths;let r,");
rep("return {seatsN,wipes,party,mul,take,stk:","return {fl0:window.__cbFl0,seatsN,wipes,party,mul,take,stk:");
rep("' party ' + JSON.stringify(","' fl0 ' + JSON.stringify(rec.fl0) + ' party ' + JSON.stringify(");
fs.writeFileSync('tools/coop-boss-rates.mjs',s);
