// PAGE TOOL: launches headless Chrome
// tools/geomancer-read.mjs - GEOMANCER READABILITY (claude/georead): the four charge tiers of hold-X (look: halo + orbiting stones), the three-stone pips under her feet with the per-stone timer, and the ward-beat first-time hint. Writes scratchlane-reportsgeoread*.png. node tools/geomancer-read.mjs <outdir>
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openPage } from './cdp.mjs';
const CW = 160, CH = 100, SC = 3;
const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.evalp(`(async()=>{const {xpFloor}=await import('/src/xp.js');
    window.__geo=(ids,foes=[[70,'sprig'],[110,'shield']])=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('geomancer');BK.reset({fresh:true});BKT.setHeroLevel("geomancer",24);
      BKT.PROG.skillOwned.geomancer=Object.fromEntries(ids.map(i=>[i,true]));BKT.PROG.loadouts.geomancer=ids.slice(0,2);BK.applyUpgrades();BK.load(0);BK.state='play';
      BK.enemies().length=0;BK.ambushes().forEach(a=>a.st='done');const L=BK.L;for(let x=2;x<46;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:(x===40&&y>=19?1:0);
      for(let x=24;x<27;x++)L.grid[22*L.W+x]=0;BK.tp(10,21);BK.sim(40);const P=BK.P;P.hp=P.maxHp;P.inv=0;P.st=P.maxSt;P.face=1;
      return foes.map(([dx,t])=>{BK.spawnEnt({t,x:(P.x+dx)/16,y:21});const e=BK.enemies().at(-1);e.hp=e.hp0=5000;e.cd=99;return e;});};
    window.__shot=(label)=>{BK.step(0);const v=BK.view,P=BK.P,z=v.z||1,sx=v.VW/2+(P.x-v.x-v.VW/2)*z,sy=v.VH/2+(P.y-v.y-v.VH/2)*z;
      const c=document.createElement('canvas');c.width=${CW * SC};c.height=${CH * SC};const g=c.getContext('2d');g.imageSmoothingEnabled=false;
      g.drawImage(v.buf,Math.round(sx-60),Math.round(sy-${CH - 24}),${CW},${CH},0,0,${CW * SC},${CH * SC});g.fillStyle='rgba(0,0,0,0.6)';g.fillRect(0,0,${CW * SC},16);
      g.fillStyle='#fff0c0';g.font='12px monospace';g.fillText(label+'   ['+P.lastKey+':'+P.lastFrame+']',4,12);return c.toDataURL();};
    window.__run=(n)=>{for(let i=0;i<n;i++)BK.step(1);};
    return 1})()`);
  const OUT = process.argv[2] || 'scratch-georead'; mkdirSync(OUT, { recursive: true });
  const S = {};
  const shot = async (name, js) => { S[name] = await pg.evalp('(()=>{' + js + '})()'); };
  const full = async (name, js) => { const d = await pg.evalp('(()=>{' + js + ';BK.step(0);const v=BK.view,c=document.createElement("canvas");c.width=v.VW;c.height=v.VH;const g=c.getContext("2d");g.imageSmoothingEnabled=false;g.drawImage(v.buf,0,0);return c.toDataURL();})()'); writeFileSync(join(OUT, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); };
  // the four tiers: frames of hold at 60/s. T0 short crack (<0.30s), T1 0.30s, T2 0.64s, T3 1.2s
  for (const [i, f] of [[0, 10], [1, 26], [2, 48], [3, 82]]) await shot('T' + i + ' hold ' + f + 'f', `__geo([],[[60,'sprig'],[120,'sprig']]);BK.keys.atk=true;__run(${f});const r=__shot('HOLD X: TIER ${i}  tierNow='+(BK.P.geoShown));BK.keys.atk=false;return r`);
  // the pips: three stones standing, then a stone's timer (EARTHFALL step)
  await shot('PIPS 3 stones', `__geo([]);for(let i=0;i<3;i++){BK.tp(8+i*4,21);BK.sim(2);BK.geo().raiseWall();BK.sim(8);}BK.tp(12,21);BK.sim(4);return __shot('3 STONES STAND: THREE PIPS ('+BK.geo().stoneCount?.()+')')`);
  await shot('PIPS 1 stone cracked', `__geo([]);BK.geo().raiseWall();BK.sim(8);const p=BK.geo().pieces?BK.geo().pieces()[0]:null;if(p)p.hp=1;BK.sim(6);return __shot('1 STONE, CRACKED: LOW PIP')`);
  const names = Object.keys(S);
  const png = await pg.evalp(`(async()=>{const S=${JSON.stringify(S)},names=Object.keys(S),per=3,W=${CW * SC},H=${CH * SC};const c=document.createElement('canvas');c.width=per*(W+4);c.height=Math.ceil(names.length/per)*(H+4);
    const g=c.getContext('2d');g.fillStyle='#222';g.fillRect(0,0,c.width,c.height);
    for(let i=0;i<names.length;i++){const im=new Image();im.src=S[names[i]];await im.decode();g.drawImage(im,(i%per)*(W+4),Math.floor(i/per)*(H+4));}return c.toDataURL();})()`);
  writeFileSync(join(OUT, 'tiers-and-pips.png'), Buffer.from(png.split(',')[1], 'base64'));
  // the ward hint: a plain block, then a block on the beat (full screen so the hint box shows)
  await full('hint-warded', `const [e]=__geo([],[[34,'sprig']]);BK.keys.block=true;__run(30);BKT.damagePlayer(e.x,10,{});__run(8);window.__h1=JSON.stringify(BK.hint)`);
  await full('hint-perfect', `BKT.PROG.geoWardTold=0;BKT.PROG.geoBeatTold=0;const [e]=__geo([],[[34,'sprig']]);BK.keys.block=true;__run(7);BKT.damagePlayer(e.x,10,{});__run(8)`);
  console.log('h1 '+await pg.evalp('window.__h1'));console.log('wrote ' + OUT + ' ' + names.length + ' cells; hint ' + JSON.stringify(await pg.evalp('(()=>({m:BK.hint,w:BKT.PROG.geoWardTold,b:BKT.PROG.geoBeatTold}))()')) + ' errors ' + JSON.stringify(pg.errors));
} finally { pg.close(); }
