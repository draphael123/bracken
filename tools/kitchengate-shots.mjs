/* tools/kitchengate-shots.mjs [only,tags] - real-page stills of THE KITCHEN GATE and LORD GRUBBAG (claude/kitchengate greybox) for the lane report and the art lane: each named
   area at its point of use, each machine banked and then worked (the copper's steam, the great spit turning, the trail burning to the tallow door and the door gone), the great
   pot's fire, the butcher and the butcher burning, and his every move at its windup / release (B16), eating, CHOKING, the ward, the powder pie on the line.
   Headless Chrome through tools/cdp.mjs, the knight in god mode, the level reloaded before each shot. Writes work/claude/lane-done/kitchengate-<tag>.png (640x360). Not in the suite.
     PORT=<port> node tools/kitchengate-shots.mjs */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), OUT = join(ROOT, 'work', 'claude', 'lane-done');
const only = process.argv[2] ? new Set(process.argv[2].split(',')) : null;
mkdirSync(OUT, { recursive: true });
const stoke = (id, n) => `BK.kitchen().stoke('${id}');for(let k=0;k<${n};k++){BK.step(1);BK.P.hp=BK.P.maxHp;}`;
/* the boss: his hall, him set into a mode */
const gb = (m, t, extra) => `BK.tp(398,21);for(let k=0;k<320;k++){BK.sim(1);BK.P.hp=BK.P.maxHp;}const GH=BK.grubbagHands(),S=GH&&GH.show(),b=BK.boss;if(S&&b){S.restT=99;S.waves=[];S.throws=[];S.floods=[];S.items=[];S.oven.st='cold';BK.tp(406,21);b.mode='${m}';b.modeT=${t};b.openT0=${t};b.face=-1;${extra || ''}}`;
const SHOTS = [
  ['cellar', 6, 39, ''], ['cold-store', 30, 37, ''], ['scullery', 58, 39, ''], ['scullery-steam', 62, 39, stoke('scullery', 40)],
  ['vaults', 72, 26, ''], ['brewhouse', 84, 26, stoke('brewhouse', 30)],
  ['spit-hall', 106, 25, ''], ['first-spit-turning', 109, 25, stoke('spit1', 90)], ['second-spit', 134, 19, stoke('spit2', 60)],
  ['steam-hook', 160, 13, stoke('trench', 40)], ['fire-trench', 172, 13, ''],
  ['grease', 205, 23, ''], ['tallow-door', 222, 23, ''], ['tallow-burning', 224, 23, stoke('stove1', 50)], ['tallow-melted', 232, 23, stoke('stove1', 260)],
  ['grease-pot', 244, 23, ''], ['grease-pot-fire', 251, 23, "for(let k=0;k<70;k++){BK.P.x+=1.6;BK.step(1);BK.P.hp=BK.P.maxHp;}"],
  ['butcher', 286, 23, "for(let k=0;k<40;k++){BK.step(1);BK.P.hp=BK.P.maxHp;}"], ['butcher-burning', 286, 23, "{const bu=BK.enemies().find(e=>e.alive&&e.t==='butcher'&&e.x<300*16);if(bu){bu.x=291*16;}}" + stoke('stove2', 50)],
  ['feast-hall', 304, 21, ''], ['gallery', 318, 15, ''], ['hearth-trench', 328, 15, ''], ['buttery', 344, 21, ''], ['spice-vault', 360, 21, ''],
  ['gb-sit', 0, 0, gb('sit', 1)], ['gb-belchTell', 0, 0, gb('belchTell', 0.6)], ['gb-belch', 0, 0, gb('belch', 0.3, "for(const d of [-1,1])S.waves.push({x:b.x+d*30,dir:d,life:2,delay:0,key:'x'+d,dmg:1});")],
  ['gb-throwTell', 0, 0, gb('throwTell', 0.5)], ['gb-throw', 0, 0, gb('throw', 0.3, "for(const dx of [-64,0,64])S.throws.push({x0:b.x,y0:S.G.floorY-130,tx:BK.P.x+dx,ty:S.G.floorY,t:0.4,T:1,key:'t'+dx,dmg:1,plate:false});")],
  ['gb-forkTell', 0, 0, gb('forkTell', 0.5)], ['gb-fork', 0, 0, gb('fork', 0.2)],
  ['gb-slamTell', 0, 0, gb('slamTell', 0.6)], ['gb-slam', 0, 0, gb('slam', 0.3, "for(let k=0;k<4;k++)S.throws.push({x0:S.G.table[0],y0:S.G.floorY-44,tx:S.G.table[0]-40-k*40,ty:S.G.floorY,t:0.4,T:0.9,key:'p'+k,dmg:1,plate:true});")],
  ['gb-floodTell', 0, 0, gb('floodTell', 0.6)], ['gb-flood', 0, 0, gb('flood', 0.3, "S.floods.push({x:b.x-190,dir:-1,key:'f',dmg:1});S.gravy=3;")],
  ['gb-grabTell', 0, 0, gb('grabTell', 0.5)], ['gb-grab', 0, 0, gb('grab', 0.28, "b.grabDir=-1;b.handX=b.x-250;")],
  ['gb-pie', 0, 0, gb('sit', 1, "S.oven.st='out';S.items.push({id:99,kind:'pie',x:S.G.line.x0+150,state:'ride',k:0});S.items.push({id:98,kind:'dish',x:S.G.line.x0+40,state:'ride',k:0});")],
  ['gb-eat', 0, 0, gb('eat', 0.4, "b.eating={kind:'pie'};")],
  /* (claude/grubbagbig) THE BELLY FLOP: the heave (his shadow told), up over the table, belly down (the shock each way), the roll back up */
  ['gb-flopTell', 0, 0, gb('flopTell', 0.5, "b.landX=BK.P.x;b.chairFace=-1;")], ['gb-flop', 0, 0, gb('flop', 0.36, "b.landX=BK.P.x+20;b.flopFrom=S.G.chairX;b.chairFace=-1;")],
  ['gb-flopDown', 0, 0, gb('flopDown', 1.2, "b.landX=BK.P.x+150;b.x=b.landX;b.w=200;b.h=72;b.chairFace=-1;for(const d of [-1,1])S.waves.push({x:b.landX+d*150,dir:d,life:1,delay:0,key:'fw'+d,dmg:0,sp:190,hw:11,kind:'flop',name:'flopShock'});")],
  ['gb-flopRoll', 0, 0, gb('flopRoll', 0.4, "b.landX=BK.P.x+150;b.x=b.landX+60;b.chairFace=-1;")], ['gb-choke', 0, 0, gb('choke', 3)], ['gb-ward', 0, 0, gb('recover', 0.4, "S.ward=2;")],
].filter(s => !only || only.has(s[0]));
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const LV=(await import('/src/level.js')).LEVELS;const idx=LV.findIndex(l=>l.id==='kitchengate');BK.manualSimulation=true;
    const snap=()=>{const c=document.createElement('canvas');c.width=640;c.height=360;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,640,360);return c.toDataURL('image/png');};
    const load=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(60);};
    const out=[];for(const [tag,x,y,extra] of ${JSON.stringify(SHOTS)}){load();if(x)BK.tp(x,y);BK.sim(tag.startsWith('gb-')?20:360);eval(extra);for(let k=0;k<(tag.startsWith('gb-')?2:20);k++)BK.step(1);out.push({tag,png:snap()});}
    BK.manualSimulation=false;return out;})()`, 900000);
  for (const s of r) { writeFileSync(join(OUT, 'kitchengate-' + s.tag + '.png'), Buffer.from(s.png.split(',')[1], 'base64')); console.log('kitchengate-' + s.tag + '.png'); }
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 3));
} finally { await pg.close(); }
process.exit(0);
