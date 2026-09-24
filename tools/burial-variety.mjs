/* tools/burial-variety.mjs — THE BLIND VAULT, THE UNLIT CRYPT and THE ROTTEN BRIDGES (Daniel, 2026-09-24; src/burial-variety.js).
   By the map:
     1. two dark places, each a darkZone, each lit by pockets no further apart than a screen can show two of (from the dark
        there is always a lamp ahead), and a sign at its door that says what it is
     2. two rotten spans over green water; the water is told (poison, harm, foul colour), every end of it has a chain that
        reaches its bed and climbs above the road (C5), nobody is garrisoned on a board, and with EVERY board gone the Buried
        Dead can still be reached (B4: the bridges are the quick way, never the only way)
   By the page:
     3. a hero who keeps walking crosses a span on its boards; the boards behind him crack first (a told half-second) and
        then go; a hero who STANDS on one goes through into the poison
     4. a span comes back on its own once it has been quiet, and whole on a respawn
     5. the dark is dark: the same frame with the zone taken away is much brighter; and the crypt's vents glow before they puff */
import assert from 'node:assert/strict';
import { LEVELS, T, TS } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { CRUMBLE } from '../src/burial-variety.js';
import { openPage } from './cdp.mjs';

const build = () => LEVELS.find(l => l.id === 'burial').build();
const L = build(), at = (x, y) => L.grid[y * L.W + x];
const reachesArena = S => { const s = floodReach(S, T, { rides: true }).seen, t = Math.floor(S.arena.trigger / 16); return [...s].some(k => +k.split(',')[0] >= t); };
// 1. the dark places
const zones = (L.darkZones || []).filter(z => z.name);
assert.deepEqual(zones.map(z => z.name).sort(), ['THE BLIND VAULT', 'THE UNLIT CRYPT'], 'two named dark places');
for (const z of zones) {
  assert.ok(z.dark >= 0.5 && z.dark <= 0.7, z.name + ': dark enough to be a place, not so dark the footing goes (0.72 lost the Reef its footing): ' + z.dark);
  const x0 = z.x0 / TS, x1 = z.x1 / TS, lamps = L.ents.filter(e => e.t === 'torch' && e.x >= x0 - 6 && e.x <= x1 + 6 && e.y * TS >= z.y0 && e.y * TS < z.y1).map(e => e.x).sort((a, b) => a - b);
  assert.ok(lamps.length >= 4, z.name + ' has its lamps: ' + lamps);
  const gaps = lamps.slice(1).map((x, i) => x - lamps[i]);
  assert.ok(Math.max(...gaps) <= 22, z.name + ': from the dark a lamp is always on the screen ahead (gaps ' + gaps + ')');
  assert.ok(Math.min(...gaps) >= 8, z.name + ': the pockets have dark between them (gaps ' + gaps + ')');
  assert.ok(L.ents.some(e => e.t === 'sign' && e.x >= x0 - 4 && e.x <= x0 + 4 && e.text.startsWith(z.name)), z.name + ' is named at its door');
}
// 2. the bridges
assert.equal((L.crumble || []).length, 2, 'two rotten spans');
for (const z of L.crumble) {
  for (let x = z.x0; x <= z.x1; x++) assert.equal(at(x, z.row), z.tile, 'span board at ' + x);
  const pool = L.pools.find(p => p.x0 <= z.x0 * TS && p.x1 >= (z.x1 + 1) * TS && p.y > z.row * TS);
  assert.ok(pool && pool.poison && pool.harm && pool.foulCol, 'green water under the span at ' + z.x0 + ' (C1)');
  const bed = Math.round(pool.bottom / TS) - 1;
  for (const x of [z.x0 - 1, z.x1 + 1]) { for (let y = 30; y <= bed; y++) assert.equal(at(x, y), T.NET, 'a chain out of the poison at ' + x + ',' + y + ' (C5)'); }
  assert.ok(L.ents.filter(e => !['coin', 'deco', 'torch'].includes(e.t) && e.x >= z.x0 && e.x <= z.x1 && e.y >= z.row - 4 && e.y <= z.row + 8).length === 0, 'nothing placed on or under the boards at ' + z.x0);
  assert.ok(L.ents.some(e => e.t === 'sign' && e.text.startsWith('THE ROTTEN BRIDGES')), 'the bridges are named');
}
{ const S = build(); for (const z of S.crumble) for (let x = z.x0; x <= z.x1; x++) S.grid[z.row * S.W + x] = T.AIR;
  assert.ok(reachesArena(S), 'with every board gone the way on is still open, through the poison and up the chains (B4)'); }
assert.ok(reachesArena(L), 'and with them the arena is reachable');

// the page
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out={};
    const boot=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='burial'));BK.state='play';BK.god=false;for(const e of BK.enemies())e.alive=false;return BK.L;};
    const P=()=>BK.P,board=(L,x)=>L.grid[L.crumble[0].row*L.W+x];
    /* 3a. WALK IT: from the west bank, holding right, to the pier */
    {const L=boot(),z=L.crumble[0];BK.tp(z.x0-3,31);BK.sim(20);let low=0,cracked=0;const seen=new Set();
     while(P().x<(z.x1+3)*16&&low<1){BK.keys.right=true;BK.sim(1);if(P().y>32*16)low++;for(const k in L.crumbleState||{}){const s=L.crumbleState[k];if(s.st==='crack'&&!seen.has(k)){seen.add(k);cracked++;}}}
     BK.keys.right=false;BK.sim(40);let gone=0;for(let x=z.x0;x<=z.x1;x++)if(board(L,x)!==8)gone++;
     out.walk={fell:low>0,cracked,gone,of:z.x1-z.x0+1,venom:+(P().venomT||0).toFixed(2),x:Math.round(P().x/16)};}
    /* 3b. STAND ON ONE: the board holds while it cracks, then it goes and so do you */
    {const L=boot(),z=L.crumble[0],x=z.x0+6;BK.tp(x,31);BK.sim(3);const y0=P().y;let heldFor=0,fellAt=null;
     for(let f=0;f<120;f++){BK.sim(1);if(fellAt===null&&P().y>y0+4)fellAt=f;else if(fellAt===null)heldFor=f;}
     BK.sim(60);out.stand={heldFor:+(heldFor/60).toFixed(2),fellAt,venom:+(P().venomT||0).toFixed(2),inWater:P().y>33*16};}
    /* 4a. IT COMES BACK: out of its way on the pier, the span is whole again after it has been quiet */
    {const L=boot(),z=L.crumble[0];BK.tp(z.x0+4,31);BK.sim(90);BK.tp(z.x1+3,31);let backAt=null;
     for(let f=0;f<60*10;f++){BK.sim(1);let whole=true;for(let x=z.x0;x<=z.x1;x++)if(board(L,x)!==8)whole=false;if(whole){backAt=f;break;}}
     out.back={secs:backAt===null?null:+(backAt/60).toFixed(1)};}
    /* 4b. AND A DEATH PUTS IT BACK: break boards, die, respawn */
    {const L=boot(),z=L.crumble[0];BK.tp(z.x0+4,31);BK.sim(90);let broke=0;for(let x=z.x0;x<=z.x1;x++)if(board(L,x)!==8)broke++;
     BKT.respawn();BK.sim(5);
     let whole=0;for(let x=z.x0;x<=z.x1;x++)if(board(L,x)===8)whole++;out.respawn={broke,whole,of:z.x1-z.x0+1,alive:!BK.P.dead};}
    /* 5. THE DARK, by the pixels: the same place, zone on and zone off */
    const lum=()=>{const c=document.querySelector('canvas'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let s=0;for(let i=0;i<d.length;i+=16)s+=d[i]*.3+d[i+1]*.59+d[i+2]*.11;return s/(d.length/16);};
    {const L=boot();BK.tp(355,31);BK.step(90);const on=lum();const keep=L.darkZones;L.darkZones=[];BK.step(90);const off=lum();L.darkZones=keep;out.dark={on:Math.round(on),off:Math.round(off)};}
    {const L=boot();const v=L.gasVents.find(v=>v.x===540);BK.tp(534,38);BK.step(30);let idle=null,puff=null;
     for(let f=0;f<400&&(idle===null||puff===null);f++){BK.step(1);const c=document.querySelector('canvas'),k=c.width/320;const sx=Math.round((v.x*16+8-BK.cam[0])*k),sy=Math.round((v.y*16-24-BK.cam[1])*k);
       const d=c.getContext('2d').getImageData(Math.max(0,sx-8*k),Math.max(0,sy-8*k),16*k,16*k).data;let s=0;for(let i=0;i<d.length;i+=4)s+=d[i]*.3+d[i+1]*.59+d[i+2]*.11;s/=d.length/4;
       if(v.state==='idle'&&idle===null)idle=s;if(v.state==='puff'&&puff===null&&f>30)puff=s;}
     out.vent={idle:Math.round(idle),puff:Math.round(puff)};}
    return out;})()`, 600000);
  console.log(JSON.stringify(r));
  assert.ok(!r.walk.fell, 'a hero who keeps walking crosses on the boards: ' + JSON.stringify(r.walk));
  assert.ok(r.walk.x > 0 && r.walk.cracked >= 8, 'and the boards he walked cracked under him: ' + JSON.stringify(r.walk));
  assert.ok(r.walk.gone >= 8, 'and went, behind him: ' + JSON.stringify(r.walk));
  assert.ok(r.stand.heldFor >= CRUMBLE.hold - 0.1, 'a board holds for its told half-second: ' + JSON.stringify(r.stand));
  assert.ok(r.stand.fellAt !== null && r.stand.fellAt < 60, 'and then drops whoever is standing on it: ' + JSON.stringify(r.stand));
  assert.ok(r.stand.venom > 0, 'into the poison: ' + JSON.stringify(r.stand));
  assert.ok(r.back.secs !== null && r.back.secs <= CRUMBLE.back + 2, 'the span comes back once it is quiet: ' + JSON.stringify(r.back));
  assert.ok(r.respawn.broke > 0 && r.respawn.whole === r.respawn.of, 'and is whole on a respawn: ' + JSON.stringify(r.respawn));
  assert.ok(r.dark.on < r.dark.off * 0.7, 'THE BLIND VAULT is dark: ' + JSON.stringify(r.dark));
  assert.ok(r.vent.puff > r.vent.idle + 8, 'a vent in the dark glows when it puffs: ' + JSON.stringify(r.vent));
  assert.deepEqual(pg.errors, []);
  console.log('burial variety: two dark places lamp to lamp, two rotten spans that crack, drop, come back and never cut the road');
} finally { pg.close(); }
