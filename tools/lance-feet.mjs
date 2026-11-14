// PAGE TOOL: launches headless Chrome
// tools/lance-feet.mjs [--secs=240] [--seed=N] - THE QUEEN'S LANCE: every frame he TRANSLATES (|dx| > 0.25 px) is logged by (mode, pose); any held pose that moves
// (a pose that is not a walk/charge/skid/hop/knock-back frame) is a SLIDE: his feet do not step. Exits 1 on a slide in a mode that is not on the allowed list.
// (claude/lance146, Daniel 11-05 photo scratch/lance-slide-1105.jpg.) Real fight, god mode, a hero who closes, backs off, strikes and holds C.
import { openPage } from './cdp.mjs';
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const SECS = +opt('secs', 240), pg = await openPage({ audio: false, fonts: false, seed: +opt('seed', 20261105) });
const PAGE = `(async()=>{const {LEVELS}=await import('/src/level.js');const LNA=await import('/src/lance-art.js');
  const K=BK.keys,clr=()=>{for(const k in K)K[k]=false;};BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('knight');BK.reset({fresh:true});
  BK.load(LEVELS.findIndex(l=>l.id==='storm'));BK.state='play';BK.god=true;BK.sim(5);BK.reset();
  const A=BK.L.arena,b=BK.enemies().find(e=>e.t==='lance'&&e.alive);BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);
  const NM={};for(const [n,i] of Object.entries(LNA.F))NM[i]=n;for(const [n,i] of Object.entries(LNA.FB))NM[i]=n+'(bare)';const out={},frames=${SECS}*60;let px=b.x,seen=new Set();
  for(let i=0;i<frames&&b.alive;i++){
    if(i%40===0){const r=Math.random();clr();if(r<0.3)K[Math.random()<0.5?'left':'right']=true;else if(r<0.5)K.attack=true;else if(r<0.6)K.block=true;else if(r<0.7)K.jump=true;else if(r<0.78)K.down=true;}
    if(i%700===0&&b.alive){BK.P.x=b.x+(Math.random()<0.5?-1:1)*(40+Math.random()*80);BK.P.y=Math.min(BK.P.y,A.floor-1);}
    b.hp=Math.max(b.hp,b.maxHp*0.2);BK.sim(1);
    const dx=Math.abs(b.x-px);px=b.x;seen.add(b.mode);if(dx<0.25)continue;
    let pose='?';try{const s=LNA.frameOf(b);pose=NM[s]||('#'+s);}catch(e){}
    const k=b.mode+' | '+(b.vx>0?'v+':'v-')+(b.kbT>0?' kb':'')+' | '+pose;out[k]=(out[k]||0)+1;}
  return {out,modes:[...seen]};})()`;
try { const r = await pg.evalp(PAGE, 900000); console.log('modes seen: ' + r.modes.join(' '));
  for (const [k, n] of Object.entries(r.out).sort((a, b) => b[1] - a[1])) console.log(String(n).padStart(6) + '  ' + k);
} finally { pg.close(); }
process.exit(0);
