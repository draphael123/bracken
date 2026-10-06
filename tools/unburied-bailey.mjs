/* tools/unburied-bailey.mjs - THE BAILEY, DRIVEN FOR REAL (claude/unburied4; Daniel's playtest 10-05: "a MUD FIELD under ARROW VOLLEYS with cover you move between").
   In the page, a real hero in the real level (src/unburied-field.js 5b; the volley is src/unburied-foes.js stepYardVolley):
     1  told      the horn blows (yv.warn) before every volley, and a hero standing in the open mud is hit by it
     2  cover     a hero on the WEST side of a fixed cover (a heap of shields) is not; nor one behind a wheeled mantlet - but a GUARD held toward the breach in
                  the open does NOT turn it: only cover does (Daniel 10-05: the volley is unblockable, told red)
     3  push      walking into a mantlet pushes it east through the mud, the hero behind it - and the volleys that fall meanwhile find nothing
     4  a step    the barricade is four rows over the mud: a hero at its foot cannot get up it; with the mantlet pushed to its foot he climbs over
     5  the dead  a corpse in the open takes the volley too (the dead you draw out of cover are the bowmen's)
     6  glint     stood still by the mantlet without pushing it, the guide names it after its 10 s stall (src/stuck-spots.js ub-mantlet-a)
   Run: PORT=<free port> node tools/unburied-bailey.mjs                                                                                     */
import { openPage } from './cdp.mjs';
import { UF } from '../src/unburied-field.js';

const B = UF.BAILEY.at, G = UF.G;
const fails = []; const note = (n, name, ok, detail) => { if (!ok) fails.push(n); console.log((ok ? '  ok   ' : '  FAIL ') + n + ' ' + name.padEnd(10) + (detail || '')); };
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.hud='minimal';const fi=LEVELS.findIndex(l=>l.id==='unburied');const TS=16,B=${B},G=${G};
    const fresh=()=>{BK.setHero('knight');BK.reset({fresh:true});BKT.setHeroLevel('knight',27);BK.load(fi);BK.state='play';BK.god=false;BK.sim(260);for(const e of BK.enemies())e.alive=false;};
    const P=()=>BK.P,F=()=>BK.unbField(),yv=()=>F().yv,mant=id=>BK.movers().find(m=>m.mantlet===id);
    const stand=(x,y)=>{const p=P();p.x=x;p.y=y;p.vx=p.vy=0;};
    const heal=()=>{const p=P();p.hp=p.maxHp;p.inv=0;};
    const run=(secs,fn)=>{for(let i=0;i<Math.round(secs*100);i++){if(fn)fn(i);heal();BK.sim(1);}};
    const out={};
    /* 1 TOLD: in the open, a whole period and a bit */
    fresh();stand((B+9)*TS+8,(G+2)*TS);BK.sim(2);let warned=0,firstWarnT=-1;const h0=yv().hits;run(yv().period+0.4,i=>{if(yv().warn){warned++;if(firstWarnT<0)firstWarnT=i;}});out.told={warned,hits:yv().hits-h0,n:yv().n};
    /* 2 COVER: just west of the shields at b13; and just west of mantlet A */
    fresh();const sh=F().covers.find(c=>Math.abs(c.x-((B+13)*TS+8))<4);stand(sh.x-14,sh.y);BK.sim(2);const c0=yv().covered,h1=yv().hits;run(yv().period+0.4,()=>{stand(sh.x-14,sh.y);});out.cover={covered:yv().covered-c0,hits:yv().hits-h1};
    fresh();let m=mant('a');stand(m.x-6,m.y+m.h);BK.sim(2);const c1=yv().covered,h2=yv().hits;run(yv().period+0.4,()=>{const q=mant('a');stand(q.x-6,q.y+q.h);});out.mantlet={covered:yv().covered-c1,hits:yv().hits-h2};
    fresh();stand((B+9)*TS+8,(G+2)*TS);P().face=1;BK.sim(2);const h9=yv().hits;BK.keys.block=true;run(yv().period+0.4,()=>{P().face=1;});BK.keys.block=false;out.guard={hits:yv().hits-h9,blocking:!!P().block};
    /* 3 PUSH and 4 A STEP: walk into mantlet A and keep walking to the barricade; then up it */
    fresh();m=mant('a');const mx0=m.x;stand(m.x-8,m.y+m.h);BK.sim(2);const h3=yv().hits;BK.keys.right=true;run(12);const mx1=mant('a').x;
    BK.keys.right=false;BK.sim(10);const atFoot=mant('a').x+mant('a').w>=(B+20)*TS-1;
    /* up: onto the mantlet, then the barricade's top */
    const tryUp=()=>{let best=1e9;for(let k=0;k<3;k++){BK.keys.right=true;BK.press('jump');BK.keys.jump=true;run(0.5,()=>{best=Math.min(best,P().y);});BK.keys.jump=false;run(0.3,()=>{best=Math.min(best,P().y);});}BK.keys.right=false;return {best,x:P().x,y:P().y};};
    const up=tryUp();out.push={moved:Math.round(mx1-mx0),atFoot,hitsWhilePushing:yv().hits-h3,over:up.x>(B+21)*TS+8||up.y<=(G-2)*TS,up};
    /* without the mantlet (moved away west), at the barricade's foot */
    fresh();m=mant('a');m.x=(B+5)*TS;m.x0=m.x;stand((B+19)*TS+8,(G+2)*TS);BK.sim(5);const up2=tryUp();out.noMantlet={over:up2.x>(B+21)*TS+8||up2.y<=(G-2)*TS,up:up2};
    /* 5 THE DEAD in the open */
    fresh();const z=BK.enemies().find(e=>e.t==='zombie'&&Math.abs(e.x-(B+32)*TS-8)<48);z.alive=true;z.hp=z.hp0||z.maxHp||38;const hp0=z.hp;stand((B+30)*TS+8,(G+2)*TS);BK.sim(2);const f0=yv().foes;run(yv().period+0.4,()=>{z.x=(B+33)*TS+8;z.vx=0;z.y=(G+2)*TS;});out.dead={foes:yv().foes-f0,hp0,hp:z.hp,alive:z.alive};
    /* 6 GLINT: by mantlet A, still, not pushing */
    fresh();m=mant('a');stand((B+3)*TS+8,(G+1)*TS);BK.sim(2);const g0=BKT.guide.read();run(10.5);const g1=BKT.guide.read();out.glint={key:g1.key,nudges:g1.nudges-g0.nudges,line:g1.lastNudge,targets:g1.targets.length};
    return out;})()`, 900000);
  note(1, 'told', r.told.warned > 50 && r.told.hits === 1 && r.told.n >= 1, 'horn for ' + (r.told.warned / 100).toFixed(2) + ' s, then ' + r.told.hits + ' hit in the open');
  note(2, 'cover', r.cover.covered >= 1 && r.cover.hits === 0 && r.mantlet.covered >= 1 && r.mantlet.hits === 0 && r.guard.hits === 1, 'behind the shields: ' + r.cover.covered + ' turned, ' + r.cover.hits + ' hit; behind the mantlet: ' + r.mantlet.covered + ' turned, ' + r.mantlet.hits + ' hit; a guard in the open: ' + r.guard.hits + ' hit (the guard does not turn it)');
  note(3, 'push', r.push.moved >= 150 && r.push.hitsWhilePushing === 0, 'the mantlet went ' + r.push.moved + ' px east in 12 s, ' + r.push.hitsWhilePushing + ' hits on the hero pushing it');
  note(4, 'a step', r.push.atFoot && r.push.over && !r.noMantlet.over, 'with the mantlet at its foot the hero is over (' + JSON.stringify(r.push.up) + '); without it he is not (' + JSON.stringify(r.noMantlet.up) + ')');
  note(5, 'the dead', r.dead.foes >= 1 && r.dead.hp < r.dead.hp0, 'a zombie in the open: ' + r.dead.foes + ' volley on it, hp ' + r.dead.hp0 + ' -> ' + Math.round(r.dead.hp));
  note(6, 'glint', r.glint.key === 'ub-mantlet-a' && r.glint.nudges === 1 && r.glint.targets >= 1, 'the guide: ' + r.glint.key + ', ' + r.glint.nudges + ' nudge: "' + r.glint.line + '"');
  if (pg.errors.length) { console.log('page errors', JSON.stringify(pg.errors.slice(0, 3))); fails.push('errors'); }
} finally { pg.close(); }
console.log(fails.length ? '\nFAIL unburied-bailey: ' + fails.join(', ') : '\nok  unburied-bailey  the bailey\'s volley is told, cover and the mantlets stop it, a mantlet pushes and is the step, the dead are hit, the mantlet is named');
process.exit(fails.length ? 1 : 0);
