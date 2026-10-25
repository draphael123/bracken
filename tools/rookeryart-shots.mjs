/* tools/rookeryart-shots.mjs [only,tags] - real-page stills of THE ROOKERY and THE SHRIEK SISTERS (claude/rookeryart: the art pass, the greybox shots rookery-shots.mjs took) for the lane report and the art lane:
   each named area at its point of use, a cracked rock before (its result ghosted) and after her dive broke it, the shrieker's mark, and the sisters' every move at its
   windup / release (B16) and STUNNED. Headless Chrome through tools/cdp.mjs, the knight in god mode, the level reloaded before each shot.
   Writes work/claude/lane-done/rookeryart-<tag>.png (OUT=<dir> to change) (640x360). Not in the suite.   PORT=<port> node tools/rookeryart-shots.mjs */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), OUT = process.env.OUT || join(ROOT, 'work', 'claude', 'lane-done');
const only = process.argv[2] ? new Set(process.argv[2].split(',')) : null;
mkdirSync(OUT, { recursive: true });
const brk = id => `BK.rookery().breakCrack('${id}');for(let k=0;k<60;k++)BK.step(1);`;
const aim = id => `{const d=BK.L.hoists.find(h=>h.id==='${id}');BK.tp(d.cleat[0],d.cleat[1]);for(let k=0;k<300;k++){BK.step(1);if(BK.enemies().some(e=>e.alive&&e.rkAim&&e.rkAim.t<0.4))break;}}`;
/* the sisters: the summit, each sister set into a mode (the others hovering) */
const sis = (r, m, t, x, y) => `BK.tp(380,10);BK.sim(300);const S=BK.shriekSistersHands().show();if(S){for(const q of ['diver','shrieker','snatcher']){S.sis[q].cd=99;if(q!=='${r}'){S.sis[q].mode=q==='snatcher'?'fly':'hover';}}const s=S.sis['${r}'];s.mode='${m}';s.modeT=${t};s.openT0=${t};s.x=${x};s.y=S.G.floorY-${y};s.face=-1;
  if('${m}'==='diveTell')s.aim={x:BK.P.x,lock:${t} < 0.3,y:S.G.floorY};if('${m}'==='dropTell')s.dropX=s.x;if('${m}'==='stuck'){s.y=S.G.floorY;s.purse=999;S.G.slabs[1].st='rubble';S.G.slabs[1].t=9;}if('${m}'==='snatchTell'||'${m}'==='snatch')s.sDir=1;}`;
const SHOTS = [
  ['nest-whole', 115, 37, ''], ['nest-broken', 115, 37, brk('firstNest')], ['pillar-whole', 148, 37, ''], ['pillar-broken', 148, 37, brk('firstPillar')], ['slab-whole', 94, 42, ''], ['slab-broken', 94, 42, brk('roostSlab')],
  ['eggnest-whole', 187, 34, ''], ['eggnest-broken', 187, 34, brk('eggNest')], ['floor-whole', 50, 39, ''], ['floor-broken', 50, 39, brk('firstFloor')],
  ['updraft-a', 262, 31, 'BK.sim(30)'], ['updraft-b', 262, 31, 'BK.sim(90)'], ['updraft-c', 262, 31, 'BK.sim(150)'], ['updraft-d', 262, 31, 'BK.sim(210)'], ['roost', 100, 42, ''],

  ['ledges', 14, 43, ''], ['first-floor', 44, 39, ''], ['first-floor-aim', 0, 0, aim('firstFloor')], ['first-floor-after', 46, 39, brk('firstFloor')],
  ['first-roost', 88, 42, ''], ['first-roost-after', 90, 42, brk('roostSlab')],
  ['first-nest', 110, 37, ''], ['first-nest-after', 112, 37, brk('firstNest')], ['shrieker', 134, 37, "for(let k=0;k<200;k++){BK.step(1);BK.P.hp=BK.P.maxHp;if(BK.rookery().read().marks)break;}"],
  ['first-pillar', 144, 37, ''], ['first-pillar-after', 146, 37, brk('firstPillar')], ['egg-ledges', 180, 34, ''],
  ['chimney', 206, 34, ''], ['ledge-slab', 220, 25, ''], ['ledge-slab-after', 222, 25, brk('ledgeSlab')], ['wind-gap', 250, 19, ''],
  ['broken-span', 284, 15, ''], ['bone-stair', 318, 15, ''], ['top-slab', 342, 15, ''], ['top-slab-after', 344, 15, brk('topSlab')],
  ['sis-diveTell', 0, 0, sis('diver', 'diveTell', 0.6, 'BK.P.x+60', 110)], ['sis-diveLock', 0, 0, sis('diver', 'diveTell', 0.2, 'BK.P.x+60', 100)], ['sis-dive', 0, 0, sis('diver', 'dive', 0.2, 'BK.P.x+30', 50)],
  ['sis-stuck', 0, 0, sis('diver', 'stuck', 2.5, 'S.G.slabs[1].x', 0)], ['sis-screamTell', 0, 0, sis('shrieker', 'screamTell', 0.8, 'BK.P.x+40', 140)], ['sis-scream', 0, 0, sis('shrieker', 'scream', 0.3, 'BK.P.x+40', 140)],
  ['sis-swoop', 0, 0, sis('shrieker', 'swoop', 1.5, 'BK.P.x+50', 34)], ['sis-waveTell', 0, 0, sis('shrieker', 'waveTell', 0.6, 'BK.P.x+60', 34)], ['sis-wave', 0, 0, sis('shrieker', 'wave', 0.3, 'BK.P.x+60', 34)],
  ['sis-pick', 0, 0, sis('snatcher', 'pick', 1, 'S.G.perch[1]', 48)], ['sis-carry', 0, 0, sis('snatcher', 'carry', 2, 'BK.P.x+40', 104)], ['sis-dropTell', 0, 0, sis('snatcher', 'dropTell', 0.6, 'BK.P.x+30', 104)],
  ['sis-snatchTell', 0, 0, sis('snatcher', 'snatchTell', 0.6, 'BK.P.x-90', 30)], ['sis-snatch', 0, 0, sis('snatcher', 'snatch', 0.3, 'BK.P.x-40', 16)],
].filter(s => !only || only.has(s[0]));
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const LV=(await import('/src/level.js')).LEVELS;const idx=LV.findIndex(l=>l.id==='rookery');BK.manualSimulation=true;
    const snap=()=>{const c=document.createElement('canvas');c.width=${+(process.env.SNAPW||640)};c.height=${+(process.env.SNAPH||360)};const g=c.getContext('2d');g.imageSmoothingEnabled=false;{const cr=${JSON.stringify((process.env.CROP||'').split(',').map(Number))};if(cr.length===4&&cr.every(Number.isFinite))g.drawImage(BK.buf,cr[0],cr[1],cr[2],cr[3],0,0,c.width,c.height);else g.drawImage(BK.buf,0,0,c.width,c.height);}return c.toDataURL('image/png');};
    const load=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(420);};
    const out=[];for(const [tag,x,y,extra] of ${JSON.stringify(SHOTS)}){load();if(x)BK.tp(x,y);BK.sim(20);eval(extra);for(let k=0;k<(tag.startsWith('sis-')?2:20);k++)BK.step(1);out.push({tag,png:snap()});}
    BK.manualSimulation=false;return out;})()`, 900000);
  for (const s of r) { writeFileSync(join(OUT, 'rookeryart-' + s.tag + '.png'), Buffer.from(s.png.split(',')[1], 'base64')); console.log('rookeryart-' + s.tag + '.png'); }
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 3));
} finally { await pg.close(); }
process.exit(0);
