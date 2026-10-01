/* tools/onestore-shots.mjs - a picture of the store from each way into it (claude/onestore).
   node tools/onestore-shots.mjs <out-prefix>   e.g. work/claude/onestore/before
   Drives the REAL keys: the map's V and Q, the wood's Q, the pause menu's entries, the keeper's counter. Works on the old code and the new. */
import { openPage } from './cdp.mjs';
import { writeFileSync } from 'node:fs';
const prefix = process.argv[2] || 'work/claude/onestore/shot';
const pg = await openPage({ audio: false, fonts: false });
try {
  const shots = await pg.evalp(`(async()=>{const{xpFloor}=await import('/src/xp.js'),{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out=[];
    const key=k=>{dispatchEvent(new KeyboardEvent('keydown',{key:k}));BK.sim(1);dispatchEvent(new KeyboardEvent('keyup',{key:k}));BK.sim(1);};
    const snap=n=>{BK.step(40);out.push({n,state:BK.state,png:BK.view.buf.toDataURL()});};
    const fresh=()=>{BK.setHero('knight');BK.reset({fresh:true});BKT.PROG.xp.knight=xpFloor(12);BKT.PROG.coins=400;BK.applyUpgrades();};
    fresh();BK.load(0);BK.state='map';BK.step(5);key('v');snap('map-V');BK.press('pause');BK.sim(2);
    BK.state='map';key('q');snap('map-Q');BK.press('pause');BK.sim(2);
    fresh();BK.load(0);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.sim(120);key('q');snap('wood-Q');BK.press('pause');BK.sim(2);BK.state='play';
    BK.ui.openMenu('play');BK.ui.menuI=BK.ui.menuRows().indexOf('Skills');BK.step(2);BK.press('confirm');BK.sim(2);snap('pause-Skills');BK.press('pause');BK.sim(2);
    BK.ui.openMenu('play');BK.ui.menuI=BK.ui.menuRows().indexOf('Equip')>=0?BK.ui.menuRows().indexOf('Equip'):BK.ui.menuRows().indexOf('Store');BK.step(2);BK.press('confirm');BK.sim(2);snap('pause-Store');BK.press('pause');BK.sim(2);
    const si=LEVELS.findIndex(l=>l.id==='shop');fresh();BK.load(si);BK.state='play';BK.sim(60);const kp=BK.props().find(p=>p.t==='npc'&&p.kind==='keeper');BK.P.x=kp.x;BK.P.y=kp.y;BK.sim(2);BK.press('talk');BK.sim(2);snap('shop-keeper');
    return out;})()`);
  for (const s of shots) { writeFileSync(prefix + '-' + s.n + '.png', Buffer.from(s.png.split(',')[1], 'base64')); console.log(s.n, '->', s.state); }
  console.log('errors', JSON.stringify(pg.errors));
} finally { pg.close(); }
