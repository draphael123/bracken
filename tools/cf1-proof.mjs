// tools/cf1-proof.mjs - CF1 PROOF FRAMES (claude/cf1proof, 2026-11-12): crops of the game buffer around the hero, one frame per sim step, for the five demo heroes.
//   node tools/cf1-proof.mjs <out.json>      one headless browser. The flag state is whatever src/cf-impact.js ships (run it on an OFF and an ON tree), JUICE2 as shipped.
//   tools/cf1-sheets.mjs <off.json> <on.json> <outdir>  stitches the two runs into contact sheets (top row OFF, next row ON).
import { writeFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';
const out = process.argv[2] || 'work/claude/cf1proof/frames.json', CW = 128, CH = 72;
const pg = await openPage({ audio: false, fonts: false, seed: 11 });
const res = { CW, CH, sheets: {} };
try {
  await pg.evalp(`(async()=>{
    window.__set=(hero)=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=0.6;BK.SET.hitstop=true;BK.SET.shake=true;BK.SET.shakeMode='hit';BK.SET.reduceMotion=false;BK.SET.impact=true;BK.setHero(hero);BK.reset({fresh:true});BKT.setHeroLevel(hero,12);
      BKT.PROG.skillOwned[hero]={};BKT.PROG.loadouts[hero]=[];BK.applyUpgrades();BK.load(0);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');
      const L=BK.L;for(let x=2;x<60;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;BK.tp(10,21);BK.sim(60);const P=BK.P;
      Object.assign(P,{hp:P.maxHp=9999,inv:0,hurt:0,st:P.maxSt,face:1,vx:0,combo:0});BK.sim(1);P.st=P.maxSt;};
    window.__foe=(t,dx,hp)=>{const P=BK.P;BK.spawnEnt({t,x:(P.x+dx)/16,y:21});const e=BK.enemies().at(-1);e.hp=e.hp0=hp;e.cd=99;e.elT=99;e.face=-1;e.speed=0;e.__dx=dx;return e;};
    window.__pin=(e)=>{const P=BK.P;if(e&&e.alive&&!(e.y<P.y-2)){e.x=P.x+e.__dx*P.face;e.vx=0;e.kvx=0;}};
    window.__cap=()=>{const t0=performance.now();while(performance.now()-t0<17);BK.step(1);const v=BK.view,z=v.z||1,P=BK.P,sx=v.VW/2+(P.x-v.x-v.VW/2)*z,sy=v.VH/2+(P.y-v.y-v.VH/2)*z,c=document.createElement('canvas');c.width=${CW};c.height=${CH};
      const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#223';g.fillRect(0,0,${CW},${CH});g.drawImage(v.buf,Math.round(sx-${CW}/2+22),Math.round(sy-${CH}+14),${CW},${CH},0,0,${CW},${CH});
      const d=g.getImageData(0,0,${CW},${CH}).data;let s='';for(let i=0;i<d.length;i+=8192)s+=String.fromCharCode.apply(null,d.subarray(i,i+8192));
      const e=window.__e||{};return {b:btoa(s),m:{stop:+BK.stop.toFixed(3),k:P.lastKey+':'+P.lastFrame,sh:+BK.shake.toFixed(2),tip:e.cf1TipT?1:0,shaft:e.cf1ShaftT?1:0,fl:+((e.flash)||0).toFixed(2)}};};
    return 1;})()`);
  /* plan: [{foe:[t,dx,hp], act:{frame:'press'|'hold'|'release'}, n, keep:[frame idx...]}] - keeps only the listed frames of the run */
  const run = async (name, hero, foe, acts, n, keep) => {
    await pg.evalp(`(()=>{__set(${JSON.stringify(hero)});window.__e=${foe ? `__foe(${JSON.stringify(foe[0])},${foe[1]},${foe[2]})` : 'null'};return 1;})()`);
    const frames = [];
    for (let i = 0; i < n; i++) {
      const a = acts[i] || '';
      const r = await pg.evalp(`(()=>{${a === 'press' ? "BK.press('atk');" : a === 'hold' ? 'BK.keys.atk=true;' : a === 'release' ? 'BK.keys.atk=false;' : a === 'fire' ? "BK.press('skill');" : ''}__pin(window.__e);return __cap();})()`);
      if (keep.includes(i)) frames.push({ i, b: r.b, m: r.m });
    }
    res.sheets[name] = frames; console.log(name, frames.length, 'frames, max stop', Math.max(...frames.map(f => f.m.stop)), 'keys', [...new Set(frames.map(f => f.m.k))].slice(0, 6).join(' '));
  };
  const seq = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  /* 1. the five demo heroes: one light cut on a standing foe, pressed on frame 4, frames 3..10 (strike beat 0 = the press) */
  for (const [hero, dx] of [['knight', 22], ['warden', 30], ['geomancer', 22], ['ranger', 50], ['pyro', 22]])
    await run('light-' + hero, hero, ['brute', dx, 99999], { 4: 'press' }, 14, seq(3, 10));
  /* 2. the knight's HEAVY: held from frame 2; the glint at half, the flash at full, then let go on 118 */
  const heavyActs = { 2: 'hold', 118: 'release' };
  await run('heavy-charge-knight', 'knight', ['brute', 22, 99999], heavyActs, 124, [14, 28, 42, 56, 70, 84, 98, 112]);
  await run('heavy-release-knight', 'knight', ['brute', 22, 99999], heavyActs, 130, seq(117, 124));
  /* 3. the warden's point and her shaft: a foe at the tip's reach vs one against the haft */
  await run('warden-tip', 'warden', ['brute', 38, 99999], { 4: 'press' }, 14, seq(3, 10));
  await run('warden-shaft', 'warden', ['brute', 16, 99999], { 4: 'press' }, 14, seq(3, 10));
  /* 4. a kill: the pyro's last cut on a one-hp sprig */
  await run('kill-knight', 'knight', ['sprig', 22, 1], { 4: 'press' }, 16, seq(3, 12));
} finally { pg.close(); }
writeFileSync(out, JSON.stringify(res));
