// tools/hero-keys-strip.mjs - THE HERO'S MOVES AS THE GAME DRAWS THEM, frame by frame (claude/herokeys, art direction 2026-10-09).
// The real page in Chrome, stepped with the draw on (BK.step renders). Per hero one picture: the light chain (three real presses), the heavy
// (held, then let go), and the jump with its landing - each caught every N ticks in a crop round the hero, blown up. Also the TIMING FINGERPRINT:
// for every tick of the light chain and the heavy, the attack box (BK.attackBox()) and the stamina/commit numbers are written to a JSON, so a
// before and an after can be diffed to prove an art change moved no window.   node tools/hero-keys-strip.mjs <outDir> [hero,hero,...]
//   -> <outDir>/<hero>-strip.png and <outDir>/<hero>-timing.json
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openPage } from './cdp.mjs';

const OUT = process.argv[2] || 'work/claude/herokeys/strips';
const HEROES = (process.argv[3] || 'knight,warden,pyro,paladin,pirate,reaper,geomancer').split(',');
const CW = 84, CH = 64, SC = 2, PER = 12;
mkdirSync(OUT, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.evalp(`(async()=>{
    window.__setup=(hero)=>{BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(hero);BK.reset({fresh:true});BKT.setHeroLevel(hero,24);BK.applyUpgrades();BK.load(0);BK.state='play';
      BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');const L=BK.L;for(let x=2;x<40;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;
      BK.tp(10,21);BK.sim(120);BK.P.hp=BK.P.maxHp;BK.P.inv=0;BK.P.st=BK.P.maxSt;BK.P.face=1;
      BK.spawnEnt({t:'sprig',x:(BK.P.x+30)/16,y:21});const e=BK.enemies().at(-1);e.hp=e.hp0=99999;e.cd=99;e.harmless=false;};
    window.__crop=(label)=>{const v=BK.view,P=BK.P,z=v.z||1,sx=v.VW/2+(P.x-v.x-v.VW/2)*z,sy=v.VH/2+(P.y-v.y-v.VH/2)*z;
      const c=document.createElement('canvas');c.width=${CW};c.height=${CH};const g=c.getContext('2d');g.imageSmoothingEnabled=false;
      g.drawImage(v.buf,Math.round(sx-${CW / 3}),Math.round(sy-${CH - 12}),${CW},${CH},0,0,${CW},${CH});return {c,label:label+' '+(P.lastKey||'')+':'+(P.lastFrame??'')};};
    window.__fp=()=>{const P=BK.P,b=BK.attackBox();return [P.atk>=0?+P.atk.toFixed(3):-1,P.atkRec?+P.atkRec.toFixed(3):0,P.swingKind||'',P.heavy?1:0,b?Object.values(b).map(v=>typeof v==="number"?Math.round(v):0):0,Math.round(P.st)]};
    return 1})()`);
  for (const hero of HEROES) {
    const rows = [], timing = { chain: [], heavy: [] };
    /* the light chain: three presses, one every 14 ticks, caught every second tick */
    await pg.evalp(`(()=>{__setup(${JSON.stringify(hero)});window.__s=[];window.__t=[];BK.step(1);for(let i=0;i<64;i++){if(i%14===0)BK.press('atk');BK.step(1);__t.push(__fp());if(i%2===0)__s.push(__crop('c'+i));}return 1})()`);
    timing.chain = await pg.evalp(`(()=>__t)()`); rows.push(['light x3', await pg.evalp(`(()=>__s.length)()`)]);
    await pg.evalp(`(()=>{window.__s1=__s;__setup(${JSON.stringify(hero)});window.__s=[];window.__t=[];BK.step(1);BK.keys.atk=true;BK.press('atk');for(let i=0;i<96;i++){if(i===44)BK.keys.atk=false;BK.step(1);__t.push(__fp());if(i%3===0)__s.push(__crop('h'+i));}BK.keys.atk=false;return 1})()`);
    timing.heavy = await pg.evalp(`(()=>__t)()`); rows.push(['heavy', await pg.evalp(`(()=>__s.length)()`)]);
    await pg.evalp(`(()=>{window.__s2=__s;__setup(${JSON.stringify(hero)});window.__s=[];const P=BK.P;BK.step(1);BK.keys.right=true;BK.step(10);const s=__s;s.push(__crop('run'));BK.keys.jump=true;BK.press('jump');for(let i=0;i<14;i++){BK.step(1);if(i%2===0)s.push(__crop('j'+i));}
      BK.keys.jump=false;BK.keys.right=false;for(let i=0;i<100&&!P.ground;i++){BK.step(1);if(i%3===0)s.push(__crop('a'+i));}for(let i=0;i<8;i++){BK.step(1);s.push(__crop('l'+i));}return 1})()`);
    rows.push(['jump', await pg.evalp(`(()=>__s.length)()`)]);
    const url = await pg.evalp(`(()=>{const sets=[__s1,__s2,__s],names=['light x3','heavy','run / jump / fall / land'],W=${CW * SC},H=${CH * SC},PER=${PER};
      let nr=0;sets.forEach(s=>nr+=Math.ceil(s.length/PER));const c=document.createElement('canvas');c.width=PER*(W+4)+8;c.height=34+nr*(H+18)+sets.length*18;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
      g.fillStyle='#14121c';g.fillRect(0,0,c.width,c.height);g.fillStyle='#e8dcc0';g.font='bold 16px monospace';g.fillText(${JSON.stringify(hero)}+' - real page, BK.step',8,22);
      let y=34;sets.forEach((s,k)=>{g.fillStyle='#ffd34a';g.font='bold 13px monospace';g.fillText(names[k],8,y+12);y+=18;
        s.forEach((h,j)=>{const x=8+(j%PER)*(W+4),yy=y+Math.floor(j/PER)*(H+18);g.drawImage(h.c,x,yy,W,H);g.strokeStyle='#3a3450';g.strokeRect(x+.5,yy+.5,W-1,H-1);g.fillStyle='#c9b27c';g.font='11px monospace';g.fillText(h.label,x+1,yy+H+12);});
        y+=Math.ceil(s.length/PER)*(H+18);});
      return c.toDataURL('image/png')})()`);
    writeFileSync(join(OUT, hero + '-strip.png'), Buffer.from(url.split(',')[1], 'base64'));
    writeFileSync(join(OUT, hero + '-timing.json'), JSON.stringify(timing));
    console.log('wrote ' + hero);
  }
  if (pg.errors.length) console.log('page errors:', pg.errors.slice(0, 5));
} finally { pg.close(); }
