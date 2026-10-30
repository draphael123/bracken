/* tools/kitchengate-shots.mjs [only,tags] - real-page stills of THE KITCHEN GATE and LORD GRUBBAG (claude/kitchengate greybox) for the lane report and the art lane: each named
   area at its point of use, each machine banked and then worked (the copper's steam, the great spit turning, the trail burning to the tallow door and the door gone), the great
   pot's fire, the butcher and the butcher burning, (claude/kitchengate2) the serving lines, the stove flares, the passage, and his every move at its windup / release (B16), eating,
   gulping, STUNNED, TOO HOT, the ward, the dish / bomb / chilli on his line.
   Headless Chrome through tools/cdp.mjs, the knight in god mode, the level reloaded before each shot. Writes work/claude/lane-done/kitchengate-<tag>.png (640x360). Not in the suite.
     PORT=<port> node tools/kitchengate-shots.mjs */
import { openPage } from './cdp.mjs';
import { oldCol, LARDER_COL, CARVERY_COL } from '../src/kitchen-gate.js';   /* (claude/kitchengate3) the shots below are in the OLD grid's columns (two rooms were let in): oldCol maps them */
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), OUT = join(ROOT, 'work', 'claude', 'lane-done');
const only = process.argv[2] ? new Set(process.argv[2].split(',')) : null;
mkdirSync(OUT, { recursive: true });
const stoke = (id, n) => `BK.kitchen().stoke('${id}');for(let k=0;k<${n};k++){BK.step(1);BK.P.hp=BK.P.maxHp;}`;
/* the boss: his hall, him set into a mode */
const gb = (m, t, extra) => `BK.tp(${oldCol(398)},21);for(let k=0;k<320;k++){BK.sim(1);BK.P.hp=BK.P.maxHp;}const GH=BK.grubbagHands(),S=GH&&GH.show(),b=BK.boss;if(S&&b){S.restT=99;S.waves=[];S.throws=[];S.flings=[];S.sweeps=[];S.burns=[];S.items=[];S.lineT=99;S.stove.st='cold';BK.tp(${oldCol(404)},21);b.mode='${m}';b.modeT=${t};b.openT0=${t};b.face=-1;${extra || ''}}`;
const SHOTS = [
  ['cellar', 6, 39, ''], ['cellar-line', 8, 39, "for(let k=0;k<200;k++){BK.step(1);BK.P.hp=BK.P.maxHp;}"], ['cold-store', 30, 37, ''], ['scullery', 58, 39, ''], ['scullery-steam', 62, 39, stoke('scullery', 40)],
  ['vaults', 72, 26, ''], ['vault-griddle', 67, 26, "for(let k=0;k<200;k++){BK.step(1);BK.P.hp=BK.P.maxHp;if(BK.kitchen().flareState('vaultGriddle')==='flame')break;}"], ['brewhouse', 84, 26, stoke('brewhouse', 30)],
  ['spit-hall', 106, 25, ''], ['first-spit-turning', 109, 25, stoke('spit1', 90)], ['ledge-griddle', 126, 19, "for(let k=0;k<200;k++){BK.step(1);BK.P.hp=BK.P.maxHp;if(BK.kitchen().flareState('ledgeGriddle')==='glow')break;}"], ['second-spit', 134, 19, stoke('spit2', 60)],
  ['steam-hook', 160, 13, stoke('trench', 40)], ['fire-trench', 172, 13, ''], ['far-line', 190, 13, "for(let k=0;k<120;k++){BK.step(1);BK.P.hp=BK.P.maxHp;}"],
  ['grease', 205, 23, ''], ['tallow-door', 222, 23, ''], ['trail-counter', 229, 20, "for(let k=0;k<400;k++){BK.step(1);BK.P.hp=BK.P.maxHp;}"], ['tallow-burning', 224, 23, stoke('stove1', 50)], ['tallow-melted', 232, 23, stoke('stove1', 260)],
  ['grease-pot', 244, 23, ''], ['grease-pot-fire', 251, 23, "for(let k=0;k<70;k++){BK.P.x+=1.6;BK.step(1);BK.P.hp=BK.P.maxHp;}"],
  ['butcher', 286, 23, "for(let k=0;k<40;k++){BK.step(1);BK.P.hp=BK.P.maxHp;}"], ['butcher-burning', 286, 23, "{const bu=BK.enemies().find(e=>e.alive&&e.t==='butcher'&&e.x<" + oldCol(300) + "*16);if(bu){bu.x=" + oldCol(291) + "*16;}}" + stoke('stove2', 50)],
  ['feast-hall', 304, 21, ''], ['gallery', 318, 15, ''], ['hearth-trench', 328, 15, ''], ['buttery', 344, 21, "for(let k=0;k<90;k++){BK.step(1);BK.P.hp=BK.P.maxHp;}"], ['spice-vault', 360, 21, ''],
  ['passage', 375, 21, "for(let k=0;k<150;k++){BK.step(1);BK.P.hp=BK.P.maxHp;}"],
  /* (claude/kitchengate2) LORD GRUBBAG reworked: seated, every move's windup and release, the line's items, his openings */
  ['gb-sit', 0, 0, gb('sit', 1, "S.items.push({id:91,kind:'dish',x:S.G.belt.x0+40,state:'ride'},{id:92,kind:'bomb',x:S.G.belt.x0+130,state:'ride',fuse:3},{id:93,kind:'chilli',x:S.G.belt.x0+210,state:'ride'});")],
  ['gb-lobTell', 0, 0, gb('lobTell', 0.5)], ['gb-lob', 0, 0, gb('lob', 0.3, "BK.tp(400,16);S.throws.push({x0:S.G.chairX-96,y0:S.G.floorY-166,tx:BK.P.x,ty:S.G.plats[1].y,t:0.5,T:1.15,key:'t',dmg:1});")],
  ['gb-flingTell', 0, 0, gb('flingTell', 0.4)], ['gb-fling', 0, 0, gb('fling', 0.2, "S.flings.push({x:S.G.chairX-200,x0:S.G.chairX-116,y0:S.G.floorY-62,ty:S.G.floorY-12,y:S.G.floorY-12,key:'f',dmg:1});")],
  ['gb-belchTell', 0, 0, gb('belchTell', 0.6)], ['gb-belch', 0, 0, gb('belch', 0.3, "S.waves.push({x:b.x-120,dir:-1,life:2,delay:0,key:'x',dmg:1});")],
  ['gb-sweepTell', 0, 0, gb('sweepTell', 0.5)], ['gb-sweep', 0, 0, gb('sweep', 0.25, "S.sweeps.push({x:S.G.belt.x1-60,key:'s',dmg:1});")],
  ['gb-greaseTell', 0, 0, gb('greaseTell', 0.6, "S.ph=2;")], ['gb-grease', 0, 0, gb('grease', 0.4, "S.ph=2;S.tipT=1.8;S.burns.push({a:S.G.cauldron.x-200,b:S.G.cauldron.x+40,lo:0,key:'g',t:1.2,beatKey:new Map()});")],
  ['gb-bellTell', 0, 0, gb('bellTell', 0.6, "S.ph=2;")], ['gb-bell', 0, 0, gb('bell', 0.3, "S.ph=2;S.rush=5;")],
  ['gb-grabTell', 0, 0, gb('grabTell', 0.5)], ['gb-grab', 0, 0, gb('grab', 0.28, "b.handX=b.x-250;")],
  ['gb-eat', 0, 0, gb('eat', 0.4, "b.eating={kind:'dish'};")], ['gb-gulp', 0, 0, gb('gulp', 0.3, "b.eating={kind:'bomb'};")],
  ['gb-stun', 0, 0, gb('stun', 3)], ['gb-hot', 0, 0, gb('hot', 3)], ['gb-ward', 0, 0, gb('recover', 0.4, "S.ward=2;")],
].map(s => s[1] ? [s[0], oldCol(s[1]), s[2], s[3]] : s);
/* (claude/kitchengate3) THE HANGING LARDER and THE CARVERY, in their own (real) columns: the rooms, a hop in the air, the haul line ridden, the carving line, the flue's glow and flame, the door */
const A = LARDER_COL, B = CARVERY_COL;
const ride = (col, row, n) => `BK.P.x=${col}*16+8;BK.P.y=${row};BK.P.vy=0;BK.keys.up=true;BK.step(2);BK.keys.up=false;for(let k=0;k<${n};k++){BK.step(1);BK.P.hp=BK.P.maxHp;}`;
const untilFlue = (st, after = 6) => `for(let k=0;k<400;k++){BK.step(1);BK.P.hp=BK.P.maxHp;if(BK.kitchen().flareState('flue')==='${st}')break;}for(let k=0;k<${after};k++)BK.step(1);`;
SHOTS.push(['kg3-larder', A + 2, 13, ''], ['kg3-larder-hop', A + 2, 13, ride(A + 4, 220, 0) + "for(let k=0;k<120&&BK.P.x<(" + A + "+11.9)*16+8;k++)BK.step(1);BK.press('jump');for(let k=0;k<14;k++)BK.step(1);"],
  ['kg3-salting-pit', A + 31, 18, ''], ['kg3-haul-line', A + 31, 18, ride(A + 58, 390, 30)], ['kg3-attendant-ledge', A + 70, 15, "for(let k=0;k<60;k++){BK.step(1);BK.P.hp=BK.P.maxHp;}"],
  ['kg3-carvery', B + 8, 23, "for(let k=0;k<240;k++){BK.step(1);BK.P.hp=BK.P.maxHp;}"], ['kg3-carvery-haul', B + 20, 23, ride(B + 22, 386, 40)],
  ['kg3-flue-glow', B + 45, 13, untilFlue('glow', 60)], ['kg3-flue-flame', B + 45, 13, untilFlue('flame', 30)], ['kg3-flue-close', B + 47, 26, untilFlue('flame', 30)], ['kg3-flue-ride', B + 45, 13, untilFlue('out', 2) + ride(B + 46, 216, 12)],
  ['kg3-carvery-door', B + 72, 21, stoke('stove4', 60)], ['kg3-hearth-hop', oldCol(318), 15, '']);
SHOTS.splice(0, SHOTS.length, ...SHOTS.filter(s => !only || only.has(s[0])));
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
