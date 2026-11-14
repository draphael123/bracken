// PAGE TOOL: launches headless Chrome
// tools/cf1-skills.mjs - CF1 PROOF (claude/cf1proof): every mapped capstone / move-ender (src/cf-impact.js SKILL_CLASS) cast through the REAL key (F = 'throw') at a standing
// foe (and at a pack of three for the ring skills): the freezes it landed (count, longest, each foe's stop starts per 0.30 s). Run on an OFF and an ON tree, compare.
//   node tools/cf1-skills.mjs [hero,hero..]      one headless browser; seed pinned; game speed 0.6 like the tools.
import { openPage } from './cdp.mjs';
const TABLE = { knight: ['lunge', 'whirlwind', 'shieldThrow', 'groundSlam', 'swordOfRealm', 'warCry'], warden: ['javelin', 'rainOfSpears', 'skewer', 'harrier'], geomancer: ['boulder', 'spikeRow', 'faultLine', 'avalanche'], pyro: ['meteor', 'flashover'], ranger: [] };
const heroes = (process.argv[2] || Object.keys(TABLE).join(',')).split(',');
const pg = await openPage({ audio: false, fonts: false, seed: 11 });
const rows = [];
try {
  await pg.evalp(`(async()=>{
    window.__set=(hero,sk)=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=0.6;BK.SET.hitstop=true;BK.SET.shake=true;BK.SET.shakeMode='hit';BK.SET.reduceMotion=false;BK.setHero(hero);BK.reset({fresh:true});BKT.setHeroLevel(hero,${+process.env.LV||40});
      BKT.PROG.skillOwned[hero]={[sk]:1};BKT.PROG.loadouts[hero]=[sk];BK.PROG.skill=sk;BK.PROG.skill2=null;BK.applyUpgrades();BK.load(0);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');
      const L=BK.L;for(let x=2;x<80;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;BK.tp(10,21);BK.sim(60);const P=BK.P;
      Object.assign(P,{hp:P.maxHp=99999,inv:0,hurt:0,st:P.maxSt,face:1,vx:0,combo:0,cds:{},skReady:{}});if('mana' in P)P.mana=999;if('ult' in P)P.ult=0;BK.sim(1);P.st=P.maxSt;};
    window.__foes=(n,dx)=>{const P=BK.P,out=[];for(let i=0;i<n;i++){BK.spawnEnt({t:'brute',x:(P.x+dx+i*14)/16,y:21});const e=BK.enemies().at(-1);e.hp=e.hp0=99999;e.cd=99;e.elT=99;e.face=-1;e.speed=0;out.push(e);}return out;};
    return 1;})()`);
  for (const h of heroes) for (const sk of TABLE[h] || []) for (const n of [1, 3]) {
    const r = await pg.evalp(`(()=>{__set(${JSON.stringify(h)},${JSON.stringify(sk)});const es=__foes(${n},${h === 'ranger' || h === 'warden' ? 40 : 26});const P=BK.P;const hp0=es.map(e=>e.hp);
      let was=0,starts=0,peak=0,hits=0,frames=0;const st=[];BK.press('throw');
      for(let i=0;i<150;i++){BK.step(1);frames++;const s=BK.stop;if(s>0&&was<=0){starts++;st.push([i,+s.toFixed(3)]);}if(s>peak)peak=s;was=s;es.forEach(e=>{if(e.alive){e.vx=0;e.kvx=0;}});}
      const dealt=es.reduce((a,e,j)=>a+(hp0[j]-e.hp),0);return {starts,peak:+peak.toFixed(3),dealt:Math.round(dealt),st:st.slice(0,8),cast:!!(P.cds&&Object.keys(P.cds).length)||dealt>0,cf:P.cf1Skill||null};})()`);
    rows.push({ h, sk, n, ...r }); console.log(h.padEnd(10), sk.padEnd(13), 'x' + n, JSON.stringify(r));
  }
} finally { pg.close(); }
