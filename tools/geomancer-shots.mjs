// tools/geomancer-shots.mjs — THE GEOMANCER, MID-MOVE, FROM THE REAL PAGE. Every base move and every one of her nine abilities is
// played through the real input on a flat floor with two straw foes in front of her, and the drawn screen (BK.step renders it) is
// cropped round her at the moment the move is doing its thing. One sheet (docs/geomancer/moves.png), a cell a move, labelled with
// the pose key the draw chose. `node tools/geomancer-shots.mjs`
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { openPage, ROOT } from './cdp.mjs';
const CW = 200, CH = 110, SC = 2;
const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.evalp(`(async()=>{const {xpFloor}=await import('/src/xp.js');
    window.__geo=(ids,foes=[[70,'sprig'],[110,'shield']])=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('geomancer');BK.reset({fresh:true});BKT.PROG.xp.geomancer=xpFloor(24);
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
  const S = {};
  const shot = async (name, js) => { S[name] = await pg.evalp('(()=>{' + js + '})()'); };
  await shot('1 HEAD-STRIKE (X)', `__geo([]);BK.press('atk');__run(7);return __shot('X: HEAD-STRIKE')`);
  await shot('2 BUTT-JAB (X X)', `__geo([]);BK.press('atk');__run(14);BK.press('atk');__run(7);return __shot('X X: BUTT-JAB')`);
  await shot('3 THE SPIN (X X X) SHATTERS', `__geo([],[[110,'sprig']]);BK.geo().raiseWall();__run(4);BK.press('atk');__run(18);BK.press('atk');__run(18);BK.press('atk');__run(9);return __shot('X X X: THE SPIN shatters stone (a parked wall)')`);
  await shot('4 RUNE-WARD RISING (C)', `__geo([]);BK.keys.block=true;__run(3);const r=__shot('C: THE WARD RISES');BK.keys.block=false;return r`);
  await shot('4b RUNE-WARD (C held)', `__geo([]);BK.keys.block=true;__run(20);const r=__shot('HOLD C: THE RUNE-WARD, PLANTED');BK.keys.block=false;return r`);
  await shot('5 WARD, PERFECT: EMPOWERED', `const [e]=__geo([],[[34,'sprig']]);BK.keys.block=true;__run(7);BKT.damagePlayer(e.x,10,{});__run(6);const r=__shot('ON THE BEAT: EMPOWERED');BK.keys.block=false;return r`);
  await shot('5b WARD, BROKEN THROUGH (RED)', `const [e]=__geo([],[[34,'sprig']]);BK.keys.block=true;__run(20);BKT.damagePlayer(e.x,10,{unblockable:true});__run(3);const r=__shot('A RED BLOW: BROKEN THROUGH');BK.keys.block=false;return r`);
  await shot('5d BURROW (dodge)', `__geo([]);BK.press('dodge');__run(9);return __shot('DODGE: BURROW, UNDER THE FLOOR')`);
  await shot('6 FAULT LINE (HOLD X) WIND', `__geo([],[[40,'sprig'],[110,'swornsword']]);BK.keys.atk=true;__run(22);return __shot('HOLD X: THE LINE IS MARKED')`);
  await shot('7 FAULT LINE RUNS', `__geo([],[[40,'sprig'],[110,'swornsword']]);BK.keys.atk=true;__run(40);BK.keys.atk=false;__run(4);return __shot('FAULT LINE: THE CRACK RUNS')`);
  await shot('7b FAULT LINE SPIKE', `__geo([],[[40,'sprig'],[150,'swornsword']]);BK.keys.atk=true;__run(40);BK.keys.atk=false;__run(22);return __shot('FULL: THE SPIKE LAUNCHES')`);
  await shot('8 SPUR (UP+X)', `__geo([]);BK.keys.up=true;BK.press('atk');__run(6);BK.keys.up=false;return __shot('UP+X: SPUR')`);
  await shot('9 STONEFALL (plunge)', `__geo([],[[34,'sprig'],[-34,'sprig']]);BK.press('jump');BK.keys.jump=true;__run(18);BK.keys.jump=false;BK.keys.down=true;BK.press('atk');let i=0;while(!BK.P.ground&&i++<60)__run(1);__run(1);BK.keys.down=false;return __shot('DOWN+X: STONEFALL')`);
  await shot('10 ROLLING STONE (dash X)', `__geo([],[[90,'sprig']]);BK.press('right');__run(2);BK.press('right');__run(1);BK.press('atk');__run(12);return __shot('DASH, X: ROLLING STONE')`);
  await shot('11 THE QUAKE (full TREMOR, C)', `__geo([],[[50,'sprig'],[-60,'sprig'],[110,'shield']]);BK.P.tremor=100;BK.keys.block=true;__run(1);BK.keys.block=false;__run(26);return __shot('FULL TREMOR, C: THE QUAKE')`);
  const AB = [['stoneStep', 8, 'STONE STEP (1)', ''], ['boulder', 20, 'BOULDER (3)', ''], ['spikeRow', 16, 'SPIKE ROW (5)', ''], ['archway', 16, 'ARCHWAY (7)', ''], ['stoneWall', 16, 'STONE WALL (9)', ''],
    ['entomb', 20, 'ENTOMB (12)', ''], ['faultLine', 16, 'THE RIFT (14)', ''], ['golem', 50, 'GOLEM (17)', ''], ['avalanche', 44, 'AVALANCHE (20)', '']];
  for (const [id, n, label] of AB) await shot('A ' + label, `__geo(['${id}'],[[40,'sprig'],[80,'shield']]);${id === 'archway' ? 'BK.P.x+=180;BK.sim(2);' : ''}${id === 'stoneStep' ? 'BK.press("jump");BK.keys.jump=true;__run(16);BK.keys.jump=false;' : ''}BK.press('throw');__run(${n});return __shot('${label}')`);
  const names = Object.keys(S);
  const png = await pg.evalp(`(async()=>{const S=${JSON.stringify(S)},names=Object.keys(S),per=4,W=${CW * SC},H=${CH * SC};const c=document.createElement('canvas');c.width=per*(W+4);c.height=Math.ceil(names.length/per)*(H+4);
    const g=c.getContext('2d');g.fillStyle='#222';g.fillRect(0,0,c.width,c.height);
    for(let i=0;i<names.length;i++){const im=new Image();im.src=S[names[i]];await im.decode();g.drawImage(im,(i%per)*(W+4),Math.floor(i/per)*(H+4));}return c.toDataURL();})()`);
  const OUT = process.argv[2] || 'docs/geomancer/moves.png';   /* (a path under the repo, given as the first argument: round 3 keeps its own pair beside its other pictures) */
  writeFileSync(join(ROOT, OUT), Buffer.from(png.split(',')[1], 'base64'));
  console.log('wrote ' + OUT + ': ' + names.length + ' moves; errors ' + JSON.stringify(pg.errors));
} finally { pg.close(); }
