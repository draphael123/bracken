// tools/kitchengate4-keys.mjs - LORD GRUBBAG's hall with REAL KEYS, every hero (claude/kitchengate4, Daniel 10-30: the coal trench, the meat-hook rails, the platter drop).
// In the page, the engine's own loop: for each of the nine heroes, base movement (no mobility skill), the boss awake but held in his chair (no blows thrown):
//   THE COAL TRENCH  dropped on the coal bed: holding toward the nearer end and pressing JUMP at the step, he climbs back onto the floor - the coals bite (spared: never a death),
//                    and the climb takes a couple of seconds, not more
//   THE HOOKS        on the line under the lower rail: UP takes it; JUMP in its red stretch hands off to the upper rail; riding on, he comes down on the platter -
//                    LORD GRUBBAG is KNOCKED OFF HIS FEET (the third opening) and the food on the line goes flying
//   No page error.    PORT=<port> node tools/kitchengate4-keys.mjs [--heroes=knight,warden]
import { openPage } from './cdp.mjs';
const HEROES = (process.argv.find(a => a.startsWith('--heroes=')) || '--heroes=knight,warden,pyro,paladin,pirate,reaper,geomancer,berserker,ranger').slice(9).split(',');
const pg = await openPage({ audio: false, fonts: false }); let bad = 0;
const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
try {
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');const {oldCol:O}=await import('/src/kitchen-gate.js');BK.manualSimulation=true;const id=LEVELS.findIndex(l=>l.id==='kitchengate');const out={};
    for(const h of ${JSON.stringify(HEROES)}){const o=out[h]={};
      BK.setHero(h);BK.reset({fresh:true});BK.load(id);BK.state='play';BK.sim(20);const P=BK.P;BK.tp(O(396),21);for(let i=0;i<300;i++){BK.sim(1);P.hp=P.maxHp;}
      const GH=BK.grubbagHands(),S=GH&&GH.show(),b=BK.boss;if(!S||!b){o.err='no fight';continue;}
      const hold=()=>{if(b.mode!=='drop'&&b.mode!=='recover'){b.mode='sit';}S.restT=99;S.lineT=99;S.throws=[];S.flings=[];S.waves=[];S.sweeps=[];S.burns=[];};
      const keys=BK.keys,clear=()=>{keys.left=keys.right=keys.up=keys.down=keys.jump=false;};
      /* THE COAL TRENCH: both ends */
      const T=S.G.trench;o.trench=[];
      for(const side of [-1,1]){clear();hold();S.coal.bite.clear();const c0=S.n.coal,hp0=P.hp;P.x=side<0?T.x0+24:T.x1-24;P.y=T.y;P.vx=0;P.vy=0;BK.sim(2);let f=0,jf=-99;
        for(;f<60*6;f++){hold();keys[side<0?'left':'right']=true;const st=T.steps[side<0?0:1],sx=(st[0]+st[1])/2;
          if(P.ground&&f-jf>14&&(Math.abs(P.x-sx)<26||P.y<T.y-4)){BK.press('jump');jf=f;keys.jump=true;}else if(f-jf>16)keys.jump=false;
          BK.sim(1);if(P.ground&&Math.abs(P.y-S.G.floorY)<3)break;}
        clear();o.trench.push({side,out:f<60*6,t:+(f/60).toFixed(2),bites:S.n.coal-c0,lost:Math.round(hp0-P.hp),of:Math.round(P.maxHp),alive:!P.dead&&P.hp>0});P.hp=P.maxHp;}
      /* THE HOOKS: UP under the lower rail, JUMP in its red stretch, ride to the platter */
      clear();hold();S.ward=0;S.cd.drop=0;S.items=[{id:801,kind:'dish',x:S.G.belt.x0+150,state:'ride',fuse:0}];const RA=S.G.rails.find(z=>z.hand),RB=RA.hand;
      P.x=RA.x0+20;P.y=S.G.belt.y;P.vx=0;P.vy=0;BK.sim(2);keys.up=true;let took=false,hand=false,f=0;
      for(;f<60*5;f++){hold();S.items.forEach(q=>{if(q.state==='ride')q.x=Math.min(q.x,S.G.belt.x1-30);});if(P.zip===RA)took=true;if(P.zip===RB)hand=true;
        if(took&&P.zip===RA&&P.x>=(RA.hop[0]+RA.hop[1])/2){BK.press('jump');}
        if(took)keys.up=false;BK.sim(1);P.hp=P.maxHp;if(b.mode==='drop')break;}
      o.hook={took,hand,drop:b.mode==='drop',t:+(f/60).toFixed(2),flying:S.n.flying,open:b.mode==='drop'?+b.modeT.toFixed(2):0,landX:Math.round(P.x),platter:[S.G.platter.x0,S.G.platter.x1]};
      if(b.mode==='drop'){o.hook.take=GH.take(b,20,P.x,false);}
      clear();}
    BK.manualSimulation=false;return out;})()`, 900000);
  for (const [h, o] of Object.entries(r)) {
    if (o.err) { ok(false, h + ': ' + o.err); continue; }
    ok(o.trench.every(q => q.out && q.t <= 3.5 && q.alive && q.bites >= 1), h + ': THE COAL TRENCH - bitten, and climbed back out at both ends with base movement ' + JSON.stringify(o.trench));
    ok(o.hook.took && o.hook.hand && o.hook.drop && o.hook.flying >= 1 && o.hook.take === 40, h + ': THE HOOKS - UP takes the lower rail, JUMP hands off to the upper, he lands on the platter: KNOCKED OFF HIS FEET, the food flies, a blade x2 ' + JSON.stringify(o.hook));
  }
  if (pg.errors.length) ok(false, 'page errors: ' + pg.errors.slice(0, 3).join(' | ')); else ok(true, 'no page error');
} finally { await pg.close(); }
console.log(bad ? '\nkitchengate4-keys: ' + bad + ' FAILED' : '\nok  kitchengate4-keys');
process.exit(bad ? 1 : 0);
