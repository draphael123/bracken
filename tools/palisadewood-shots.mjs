/* tools/palisadewood-shots.mjs [only,tags] - real-page stills of THE PALISADE WOOD and THE BATTERING BEAST (claude/palisadewood greybox) for the lane report and the art lane:
   each named area at its point of use, a prop before (its result ghosted) and after, the stake-setter's wall, and the beast's every move at its windup / release (B16) and STUCK.
   Headless Chrome through tools/cdp.mjs, the knight in god mode, the level reloaded before each shot. Writes work/claude/lane-done/palisadewood-<tag>.png (640x360).
   Not in the suite.   PORT=<port> node tools/palisadewood-shots.mjs */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), OUT = join(ROOT, 'work', 'claude', 'lane-done'), PRE = process.env.SHOT_PREFIX || 'palisadewood';   /* (claude/palisade2) SHOT_PREFIX names a lane's stills */
const only = process.argv[2] ? new Set(process.argv[2].split(',')) : null;
mkdirSync(OUT, { recursive: true });
const knock = id => `BK.pwood().knockProp('${id}');for(let k=0;k<90;k++)BK.step(1);`;
const boss = (m, t, more) => `BK.tp(462,24);BK.sim(260);const b=BK.boss,S=BK.batteringBeastHands().show();if(b){b.mode='${m}';b.modeT=${t || 0.5};b.x=478*16;b.face=-1;${more || ''}}`;
/* (claude/palisade2) the reworked beast: P2 poses need the chains cut; the pots and the pitch drawn; a deck battered with you on it */
const P2 = 'S.ph=2;b.phase=2;S.harness.cut=true;';
const POTS = 'S.pots.push({x0:b.x,y0:S.G.floorY-56,tx:b.x-90,ty:S.G.floorY,t:0.5,T:0.95,key:"a"});S.fires.push({x:b.x-150,life:3,key:"b",tick:0,n:0});';
const DECK = 'const sc=S.scafs[1];BK.tp(Math.floor((sc.x0+sc.x1)/32),sc.cols[2]-1);b.x=sc.x0-28+6;b.face=1;b.batterId=1;sc.shake=1;';
const SHOTS = [
  ['edge', 12, 37, ''], ['edge-ramp-after', 16, 37, knock('edgeRamp')], ['crew', 27, 32, ''],
  ['yard-stakes', 106, 31, ''], ['yard-tower', 138, 31, ''], ['yard-tower-after', 140, 31, knock('yardTower')],
  ['setter-wall', 133, 31, "BK.god=false;for(let k=0;k<200;k++){BK.step(1);BK.P.hp=BK.P.maxHp;if(BK.pwood().read().walls.length)break;}BK.god=true;"],
  ['scaffolds', 208, 25, ''], ['wall-ramp-after', 209, 19, knock('wallRamp')], ['wall-top', 232, 12, ''], ['unbuilt-span', 247, 12, ''],
  ['gatehouse', 382, 24, ''], ['gate-passage', 400, 24, ''],
  ['breach-enter', 310, 24, ''], ['breach-tower1', 321, 21, ''], ['breach-boards', 331, 20, ''], ['breach-tower2', 346, 18, ''], ['breach-exam', 355, 19, ''], ['breach-landing', 364, 24, ''],
  ['leaves-edge', 30, 32, ''],
  ['beast-walk', 0, 0, boss('walk')], ['beast-chargeTell', 0, 0, boss('chargeTell', 0.8)], ['beast-charge', 0, 0, boss('charge', 3)], ['beast-sweepTell', 0, 0, boss('sweepTell', 0.6)],
  ['beast-sweep', 0, 0, boss('sweep', 0.3)], ['beast-volleyTell', 0, 0, boss('volleyTell', 0.8)], ['beast-trampleTell', 0, 0, boss('trampleTell', 0.8)], ['beast-stuck', 0, 0, boss('stuck', 3)],
  ['beast-loose', 0, 0, boss('loose', 3, P2)],
  ['beast-sweepBack', 0, 0, boss('sweepBack', 0.2)], ['beast-potTell', 0, 0, boss('potTell', 0.6, POTS)], ['beast-pot', 0, 0, boss('pot', 0.2, POTS)],
  ['beast-batterTell', 0, 0, boss('batterTell', 0.6, DECK)], ['beast-batter', 0, 0, boss('batter', 0.9, DECK)],
  ['beast-unchain', 0, 0, boss('unchain', 0.6)], ['beast-walkP2', 0, 0, boss('walk', 0.5, P2)],
  ['beast-flailTell-low', 0, 0, boss('flailTell', 0.6, P2 + 'S.flailHigh=false;')], ['beast-flailTell-high', 0, 0, boss('flailTell', 0.6, P2 + 'S.flailHigh=true;')], ['beast-flail', 0, 0, boss('flail', 0.3, P2 + 'S.flailHigh=false;')],
  ['beast-kickTell', 0, 0, boss('kickTell', 0.5, P2 + 'b.face=1;')], ['beast-kick', 0, 0, boss('kick', 0.2, P2 + 'b.face=1;')],
].filter(s => !only || only.has(s[0]));
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const LV=(await import('/src/level.js')).LEVELS;const idx=LV.findIndex(l=>l.id==='palisadewood');BK.manualSimulation=true;
    const snap=()=>{const c=document.createElement('canvas');c.width=640;c.height=360;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,640,360);return c.toDataURL('image/png');};
    const load=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(420);};
    const out=[];for(const [tag,x,y,extra] of ${JSON.stringify(SHOTS)}){load();if(x)BK.tp(x,y);BK.sim(20);eval(extra);for(let k=0;k<20;k++)BK.step(1);out.push({tag,png:snap()});BK.SET.speed=1;}
    BK.manualSimulation=false;return out;})()`, 900000);
  for (const s of r) { writeFileSync(join(OUT, PRE + '-' + s.tag + '.png'), Buffer.from(s.png.split(',')[1], 'base64')); console.log(PRE + '-' + s.tag + '.png'); }
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 3));
} finally { await pg.close(); }
process.exit(0);
