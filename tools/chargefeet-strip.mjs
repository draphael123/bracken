// PAGE TOOL: launches headless Chrome
// tools/chargefeet-strip.mjs - A HERO WALKING WHILE HE HOLDS THE CHARGE, frame by frame as the game draws it (claude/chargefeet).
// The real page in Chrome: hold the attack key (the charge) and walk right on flat ground; 8 crops (every 5th tick, the warden's wind is short: every 2nd), blown up.
// Prints the pose key / frame drawn. Run it in the old checkout and in this one for the before / after strips.
//   PORT=<p> node tools/chargefeet-strip.mjs <hero> <out.png> [label]     (hero: knight paladin reaper berserker warden geomancer ranger)
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { openPage } from './cdp.mjs';

const HERO = process.argv[2] || 'knight', OUT = process.argv[3] || 'work/claude/chargefeet/' + HERO + '.png', LABEL = process.argv[4] || HERO;
const FAST = HERO === 'warden', STEP = FAST ? 2 : 5, SETTLE = FAST ? 6 : 24, CW = 52, CH = 44, SC = 5, PER = 8;
mkdirSync(dirname(OUT), { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const out = await pg.evalp(`(()=>{
    BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(${JSON.stringify(HERO)});BK.reset({fresh:true});BKT.setHeroLevel(${JSON.stringify(HERO)},24);BK.applyUpgrades();BK.load(0);BK.state='play';
    BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');const L=BK.L;for(let x=2;x<80;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;
    BK.tp(10,21);BK.sim(120);const P=BK.P;P.hp=P.maxHp;P.inv=0;P.st=P.maxSt;P.face=1;
    const crop=(label)=>{const v=BK.view,z=v.z||1,sx=v.VW/2+(P.x-v.x-v.VW/2)*z,sy=v.VH/2+(P.y-v.y-v.VH/2)*z;
      const c=document.createElement('canvas');c.width=${CW};c.height=${CH};const g=c.getContext('2d');g.imageSmoothingEnabled=false;
      g.drawImage(v.buf,Math.round(sx-${CW / 2}),Math.round(sy-${CH - 8}),${CW},${CH},0,0,${CW},${CH});return {c,label};};
    const s=[],info=[];BK.step(1);BK.keys.atk=true;BK.keys.right=true;for(let i=0;i<${SETTLE};i++)BK.step(1);
    for(let i=0;i<${PER * STEP};i++){BK.step(1);if(i%${STEP}===0){s.push(crop(P.lastKey+':'+P.lastFrame+' vx'+Math.round(P.vx)));info.push([P.lastKey,P.lastFrame,Math.round(P.vx),+(P.charge||0).toFixed(2),Math.round(P.x)]);}}
    const W=${CW * SC},H=${CH * SC},PER=${PER},nr=Math.ceil(s.length/PER),c=document.createElement('canvas');c.width=PER*(W+4)+8;c.height=34+nr*(H+18);
    const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#14121c';g.fillRect(0,0,c.width,c.height);g.fillStyle='#e8dcc0';g.font='bold 16px monospace';g.fillText(${JSON.stringify(LABEL)}+' - hold attack + walk right, every ${STEP}th tick',8,22);
    s.forEach((h,j)=>{const x=8+(j%PER)*(W+4),yy=34+Math.floor(j/PER)*(H+18);g.drawImage(h.c,x,yy,W,H);g.strokeStyle='#3a3450';g.strokeRect(x+.5,yy+.5,W-1,H-1);g.fillStyle='#c9b27c';g.font='11px monospace';g.fillText(h.label,x+1,yy+H+12);});
    return JSON.stringify({url:c.toDataURL('image/png'),info})})()`);
  const o = JSON.parse(out);
  writeFileSync(OUT, Buffer.from(o.url.split(',')[1], 'base64'));
  console.log('wrote ' + OUT); console.log(JSON.stringify(o.info));
  if (pg.errors.length) console.log('page errors:', pg.errors.slice(0, 5));
} finally { pg.close(); }
