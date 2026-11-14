// PAGE TOOL: launches headless Chrome
// tools/knight-shots.mjs - THE KNIGHT'S BIG BLOWS, frame by frame as the game draws them (claude/chargefeet).
// The real page in Chrome, stepped with the draw on; 12 crops round him, blown up. Run it in the old checkout and in this one for before / after.
//   PORT=<p> node tools/knight-shots.mjs <heavy|finisher|slam|slam2> <out.png> [label]
//   heavy: hold X past the cut, let go on a foe.  finisher: three links, a riposte, the cut.  slam: three links, UP+C at a foe on the floor ahead.  slam2: the same with THE LONG CHARGE (L50).
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { openPage } from './cdp.mjs';

const MODE = process.argv[2] || 'heavy', OUT = process.argv[3] || 'work/claude/chargefeet/knight-' + MODE + '.png', LABEL = process.argv[4] || MODE;
const CW = 150, CH = 64, SC = 3, PER = 4, N = 12, STEP = MODE === 'finisher' ? 2 : MODE.startsWith('slam') ? 4 : 3;
mkdirSync(dirname(OUT), { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const out = await pg.evalp(`(()=>{
    for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('knight');BK.reset({fresh:true});BKT.setHeroLevel('knight',${MODE === 'slam2' ? 50 : 24});
    BKT.PROG.skillOwned.knight={};BKT.PROG.loadouts.knight=[];BKT.PROG.card.knight.ms=${MODE === 'slam2' ? "{50:'kcharge2'}" : '{}'};BKT.PROG.card.knight.up={};BK.applyUpgrades();BK.load(0);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');
    const L=BK.L;for(let x=2;x<80;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;BK.tp(10,21);BK.sim(60);const P=BK.P;
    Object.assign(P,{hp:P.maxHp,inv:0,hurt:0,st:P.maxSt,face:1,vx:0,dodge:0,dodgeCd:0,dash:0,dashCd:0,riposteT:0,combo:0,links:0,linkT:0,linkKeep:0});BK.sim(1);P.st=P.maxSt;
    const mk=(t,dx)=>{BK.spawnEnt({t,x:(P.x+dx)/16,y:21});const e=BK.enemies().at(-1);e.hp=e.hp0=e.maxHp0=5000;e.cd=99;e.elT=99;e.face=-1;e.speed=0;return e;};
    const foes=${MODE === 'slam' || MODE === 'slam2' ? "[mk('sprig',70),mk('sprig',100),mk('sprig',-30)]" : "[mk('shield',16)]"};
    const hold=()=>{for(const e of foes){if(${MODE === 'heavy' || MODE === 'finisher'}){e.vx=0;}}};
    const crop=(label)=>{const v=BK.view,z=v.z||1,sx=v.VW/2+(P.x-v.x-v.VW/2)*z,sy=v.VH/2+(P.y-v.y-v.VH/2)*z;
      const c=document.createElement('canvas');c.width=${CW};c.height=${CH};const g=c.getContext('2d');g.imageSmoothingEnabled=false;
      g.drawImage(v.buf,Math.round(sx-${CW / 3}),Math.round(sy-${CH - 12}),${CW},${CH},0,0,${CW},${CH});return {c,label};};
    const s=[];BK.step(1);
    if('${MODE}'==='heavy'){BK.keys.atk=true;for(let i=0;i<40;i++){BK.step(1);foes[0].x=P.x+16;foes[0].vx=0;}BK.keys.atk=false;}
    else if('${MODE}'==='finisher'){P.links=3;P.riposteT=1;P.riposteHeavy=true;BK.press('atk');}
    else {P.links=3;BK.keys.up=true;BK.keys.block=false;BK.sim(2);BK.keys.block=true;BK.sim(1);BK.keys.block=false;BK.keys.up=false;}
    for(let i=0;i<${N * STEP};i++){BK.step(1);if('${MODE}'==='heavy'||'${MODE}'==='finisher'){foes[0].x=P.x+16+(i<4?0:0);foes[0].vx=0;}if(i%${STEP}===0)s.push(crop('t'+i+' '+(P.lastKey||'')+(P.finisher?' FIN':'')));}
    const W=${CW * SC},H=${CH * SC},PER=${PER},nr=Math.ceil(s.length/PER),c=document.createElement('canvas');c.width=PER*(W+4)+8;c.height=34+nr*(H+18);
    const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#14121c';g.fillRect(0,0,c.width,c.height);g.fillStyle='#e8dcc0';g.font='bold 16px monospace';g.fillText(${JSON.stringify(LABEL)}+' - ${MODE}, every ${STEP}th tick',8,22);
    s.forEach((h,j)=>{const x=8+(j%PER)*(W+4),yy=34+Math.floor(j/PER)*(H+18);g.drawImage(h.c,x,yy,W,H);g.strokeStyle='#3a3450';g.strokeRect(x+.5,yy+.5,W-1,H-1);g.fillStyle='#c9b27c';g.font='11px monospace';g.fillText(h.label,x+1,yy+H+12);});
    return JSON.stringify({url:c.toDataURL('image/png'),n:s.length})})()`);
  const o = JSON.parse(out);
  writeFileSync(OUT, Buffer.from(o.url.split(',')[1], 'base64'));
  console.log('wrote ' + OUT + ' ' + o.n);
  if (pg.errors.length) console.log('page errors:', pg.errors.slice(0, 5));
} finally { pg.close(); }
