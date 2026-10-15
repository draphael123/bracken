process.env.BLOW_CENSUS='1';
const { runFights } = await import('./boss-run.mjs');
const hero=process.argv[2]||'knight', n=+process.argv[3]||4; const f=[];for(let s=1;s<=n;s++)f.push({r:'unburied',way:'practiced',h:hero,s,profile:'human',flasks:'kit'});
const out=await runFights(f,{jobs:1,secs:240});
for(const x of out){if(x.hits)console.log(x.hits.map(a=>a.join('|')).join('\n'));console.log(hero,x.seed,x.outcome,x.secs,x.bossLeft,'taken',x.taken,'sw',x.swings,'op',x.opened);}
