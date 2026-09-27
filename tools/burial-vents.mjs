/* tools/burial-vents.mjs — THE MACHINE, IN THE PAGE (claude/burial2, 2026-09-26; src/burial-expansion.js, docs/briefs/burial-rework-2.md §2).
   The level's sentence is LIGHT THE GAS: THE DEAD WILL NOT RISE IN ITS LIGHT. On the Candle Path's lesson, with real keys and no god mode:
     1. walking past the candle puts FIRE IN HAND, and it burns down
     2. a swing at the vent with fire in hand lights it; a swing with no fire does nothing
     3. a burning vent does not puff: standing in it for five seconds costs nothing, where the same vent cold poisons
     4. the dead man buried in its light stays in the ground while the hero stands over him; with the vent cold he gets up
     5. it burns VENT.lit seconds and goes out; a burning vent gives fire as a candle does (the Blind Vault, vent to vent)
     6. a blow puts the fire in your hand out, and so does water
     7. in the dark a burning vent is a lamp: THE BLIND VAULT is much brighter round a lit vent than round the same vent cold
   And in the lair: a vent lit with him standing on it SCORCHES the Buried Dead - open - and the dead he calls do not come up in its light. */
import assert from 'node:assert/strict';
import { VENT } from '../src/burial-expansion.js';
import { openPage } from './cdp.mjs';

const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out={},K=BK.keys;
    const boot=(god)=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='burial'));BK.state='play';BK.god=!!god;BK.sim(2);return BK.L;};
    const P=()=>BK.P,walkTo=(x,max=600)=>{for(let f=0;f<max&&Math.abs(P().x-x)>3;f++){K.right=P().x<x;K.left=P().x>x;BK.sim(1);}K.right=K.left=false;BK.sim(2);};
    const swingAt=v=>{P().face=Math.sign(v.x*16+8-P().x)||1;BK.press('atk');BK.sim(20);};
    const first=L=>L.gasVents.slice().sort((a,b)=>a.x-b.x)[0];
    /* 1-2 */
    {const L=boot(),v=first(L),c=L.candles[0];for(const e of BK.enemies())if(!(e.buried||e.mode==='buried'))e.alive=false;
     BK.tp(c.x-6,c.y);BK.sim(10);const before=P().candle||0;walkTo(v.x*16+8-14);const fire=P().candle||0;
     const L2=L;BK.sim(60);const burnt=fire-(P().candle||0);swingAt(v);out.light={before,fire:+fire.toFixed(1),burnt:+burnt.toFixed(2),lit:+(v.litT||0).toFixed(1)};
     const L3=boot(),v3=first(L3);for(const e of BK.enemies())if(!(e.buried||e.mode==='buried'))e.alive=false;BK.tp(v3.x-1,v3.y-1);BK.sim(5);P().candle=0;swingAt(v3);out.noFire={lit:v3.litT||0};}
    /* 3-4: lit, the column is safe and the buried stay down; cold, it poisons and he gets up */
    for(const hot of [true,false]){const L=boot(),v=first(L),z=BK.enemies().find(e=>e.mode==='buried'&&Math.abs(e.x-(v.x*16+8))<VENT_L);
     for(const e of BK.enemies())if(e!==z)e.alive=false;if(hot)v.litT=20;BK.tp(v.x,v.y-1);BK.sim(2);   /* lit BEFORE he is near: a man already rising is not stopped by a light that comes after */let hurt=0,venom=0;
     for(let f=0;f<300;f++){if(hot)v.litT=Math.max(v.litT,10);const h0=P().hp;P().x=v.x*16+8;BK.sim(1);if(P().hp<h0)hurt+=h0-P().hp;if(P().venomT>0)venom++;P().hp=P().maxHp;}
     P().x=z.x+10;for(let f=0;f<120;f++){if(hot)v.litT=Math.max(v.litT,10);P().hp=P().maxHp;BK.sim(1);}
     out[hot?'hot':'cold']={hurt,venom,dead:z.mode};}
    /* 5: it goes out; and a burning vent gives fire */
    {const L=boot(true),v=first(L);BK.tp(v.x+4,v.y-1);BK.sim(2);P().candle=0;v.litT=${VENT.lit};let t=0;while(v.litT>0&&t<60*40){BK.sim(1);t++;}
     out.burns=+(t/60).toFixed(1);v.litT=5;BK.tp(v.x,v.y-1);BK.sim(3);out.ventGives=+(P().candle||0).toFixed(1);}
    /* 6: a blow, and water */
    {const L=boot(),c=L.candles[0];BK.tp(c.x,c.y);BK.sim(3);const had=P().candle>0;BKT.damagePlayer(P().x+20,5,{});out.blow={had,after:P().candle||0};BK.sim(20);
     BK.tp(c.x,c.y);BK.sim(20);const had2=P().candle>0;const pit=L.pools.find(p=>p.poison&&p.x0>c.x*16);BK.god=true;P().x=(pit.x0+pit.x1)/2;P().y=pit.y+20;P().vy=0;BK.sim(20);out.water={had:had2,after:P().candle||0,swim:!!P().swim};}
    /* 7: a burning vent is a lamp in the dark */
    {const buf=()=>BK.view.buf.getContext('2d'),lum=(v)=>{const sx=Math.round(v.x*16+8-BK.cam[0]),sy=Math.round(v.y*16-40-BK.cam[1]);const d=buf().getImageData(Math.max(0,sx-40),Math.max(0,sy-20),80,40).data;let s=0;for(let i=0;i<d.length;i+=4)s+=d[i]*.3+d[i+1]*.59+d[i+2]*.11;return s/(d.length/4);};
     const L=boot(true),v=L.gasVents.find(v=>v.x===162);for(const e of BK.enemies())e.alive=false;v.period=1e9;BK.tp(v.x+7,v.y-1);for(let i=0;i<120;i++){v.litT=0;BK.step(1);}   /* seven tiles off, so the hero's own light is not what is measured; a period nobody reaches, so the cold vent stays idle */
     let cold=0;for(let i=0;i<30;i++){v.litT=0;BK.step(1);}cold=lum(v);let hot=0;for(let i=0;i<60;i++){v.litT=10;BK.step(1);}hot=lum(v);out.lamp={cold:Math.round(cold),hot:Math.round(hot)};}
    /* the lair: scorched, and no summons in the light */
    {const L=boot(true),A=L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(200);const b=BK.boss,v=L.gasVents.filter(v=>v.x*16>A.x0&&v.x*16<A.x1).sort((p,q)=>Math.abs(p.x*16-(A.x0+A.x1)/2)-Math.abs(q.x*16-(A.x0+A.x1)/2))[0];b.x=v.x*16+8;   /* the vent under his bier, and him on it */
     b.mode='walk';b.modeT=5;b.open=0;P().x=v.x*16+8-16;P().y=A.floor;P().candle=10;P().face=1;BK.press('atk');let mode=null,open=0;for(let i=0;i<30;i++){BK.sim(1);if(b.mode==='scorched'){mode=b.mode;open=Math.max(open,b.open);}}
     out.scorch={lit:+(v.litT||0).toFixed(1),mode,open:+open.toFixed(1)};
     for(const e of BK.enemies())if(e.graveAdd)e.alive=false;for(const w of L.gasVents)if(w.x*16>A.x0&&w.x*16<A.x1)w.litT=15;b.x=A.x0+(A.x1-A.x0)/2;b.mode='callTell';b.modeT=0;b.phase=2;BK.sim(2);
     const adds=BK.enemies().filter(e=>e.alive&&e.graveAdd);out.summon={adds:adds.length,inLight:adds.filter(e=>L.gasVents.some(w=>w.litT>0&&Math.hypot(e.x-(w.x*16+8),e.y-8-(w.y*16-16))<VENT_L)).length};}
    return out;})()`.replace(/VENT_L/g, String(VENT.light)), 600000);
  console.log(JSON.stringify(r));
  assert(r.light.before === 0 && r.light.fire > VENT.fire - 3, 'walking past the candle did not put fire in hand: ' + JSON.stringify(r.light));
  assert(r.light.burnt > 0.5, 'the fire in hand does not burn down: ' + JSON.stringify(r.light));
  assert(r.light.lit > VENT.lit - 2, 'a swing with fire in hand did not light the vent: ' + JSON.stringify(r.light));
  assert.equal(r.noFire.lit, 0, 'a swing with no fire lit the vent');
  assert.equal(r.hot.hurt, 0, 'a burning vent still puffs: ' + JSON.stringify(r.hot)); assert(r.cold.hurt > 0, 'the cold vent never puffed in five seconds: ' + JSON.stringify(r.cold));
  assert.equal(r.hot.dead, 'buried', 'one of the dead got up inside a burning vent\'s light: ' + JSON.stringify(r.hot));
  assert.notEqual(r.cold.dead, 'buried', 'with the vent cold the dead man never got up: ' + JSON.stringify(r.cold));
  assert(Math.abs(r.burns - VENT.lit) < 0.5, 'a vent burns ' + r.burns + ' s, not ' + VENT.lit);
  assert(r.ventGives > VENT.fire - 3, 'a burning vent does not give fire: ' + r.ventGives);
  assert(r.blow.had && r.blow.after === 0, 'a blow did not put the fire out: ' + JSON.stringify(r.blow));
  assert(r.water.had && r.water.after === 0, 'water did not put the fire out: ' + JSON.stringify(r.water));
  assert(r.lamp.hot > r.lamp.cold * 1.4, 'a burning vent is no lamp in the dark: ' + JSON.stringify(r.lamp));
  assert(r.scorch.lit > 0 && r.scorch.mode === 'scorched' && r.scorch.open >= 3, 'a vent lit under the Buried Dead did not open him: ' + JSON.stringify(r.scorch));
  assert.equal(r.summon.inLight, 0, 'he called his dead up inside a burning vent\'s light: ' + JSON.stringify(r.summon));
  assert.deepEqual(pg.errors, []);
  console.log('burial-vents  fire from a candle, a vent lit by a swing and not without fire, no gas while it burns, the dead stay down in its light, ' + r.burns + ' s and out, a blow and water put the fire out, a lamp in the dark (' + r.lamp.cold + ' -> ' + r.lamp.hot + '), and the Buried Dead scorched open (' + r.scorch.open + ' s)');
} finally { pg.close(); }
