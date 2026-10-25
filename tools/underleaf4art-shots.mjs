/* tools/underleaf4art-shots.mjs [only,tags] - real-page stills of UNDERLEAF 4's art (claude/underleaf4art): THE POTION CROSSING (gully + shafts) and THE POTION MASTER at each phase / move / opening.
   Headless Chrome through tools/cdp.mjs, god mode. Writes scratch/lane-reports/underleaf4art-<PREFIX>-<tag>.png (OUTDIR env), 2x (640x360). PREFIX = before | after.   PREFIX=after node tools/underleaf4art-shots.mjs [tags] */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
const OUT = process.env.OUTDIR || 'C:/Users/Daniel Raphael/.claude/bracken-lanes/scratch/lane-reports', PFX = process.env.PREFIX || 'after';
const only = process.argv[2] ? new Set(process.argv[2].split(',')) : null;
mkdirSync(OUT, { recursive: true });
/* the boss at a phase and mode: she is moved beside the hero, facing him */
const boss = (ph, m, extra = '', dur = 0.5) => `BK.tp(536,29);BK.sim(300);const b=BK.enemies().find(e=>e.t==='grandmother');if(b){b.phase=${ph};b.hedge=${ph === 1};b.aloft=${ph === 2};b.ring=${ph === 3};if(${ph}===3)b.skinNow='grandmother2';if(${ph}===2)b.skinNow='grandmother3';b.mode='${m}';b.modeT=${dur};b.x=BK.P.x+70;b.face=-1;BK.P.face=1;${extra}}`;
const grow = `const H=BK.potions();for(const b of H.state().beds)H.growBed(b);`;
const SHOTS = [
  ['1-gully-bank', 376, 29, ''], ['2-gully-grown', 381, 28, grow], ['3-gully-cliff', 408, 26, grow],
  ['4-shafts-lip', 419, 20, ''], ['5-shafts-racks', 428, 13, ''], ['6-shafts-remix', 440, 11, grow], ['7-shafts-farbank', 449, 5, grow],
  ['10-p1-idle', 0, 0, boss(1, 'walk')], ['11-p1-lashTell', 0, 0, boss(1, 'lashTell', '', 0.4)], ['12-p1-lash', 0, 0, boss(1, 'lash', '', 0.2)],
  ['13-p1-jarTell', 0, 0, boss(1, 'jarTell', "b.hurlCol='green';", 0.3)], ['14-p1-opened', 0, 0, boss(1, 'opened', 'b.hedge=false;b.hedgeBurn=0.3;', 2)],
  ['20-p2-aloft', 0, 0, boss(2, 'walk', 'b.y-=40;')], ['21-p2-trapTell', 0, 0, boss(2, 'trapTell', 'b.y-=40;', 0.3)], ['22-p2-fireTell', 0, 0, boss(2, 'fireballTell', 'b.y-=40;', 0.3)],
  ['23-p2-snared', 0, 0, boss(2, 'opened', 'b.aloft=false;b.vine=1;', 2)],
  ['30-p3-ring', 0, 0, boss(3, 'walk')], ['31-p3-stirTell', 0, 0, boss(3, 'stirTell', '', 0.3)], ['32-p3-hurlTell', 0, 0, boss(3, 'jarTell', "b.hurlCol='red';", 0.3)],
  ['33-p3-floated', 0, 0, boss(3, 'floated', 'b.ring=false;b.floatLen=3;b.floatY0=b.y;b.modeT=2.5;')],
  ['40-shelves', 0, 0, boss(2, 'walk', "b.y-=40;BK.potions().state().jars.filter(j=>j.arena).forEach((j,i)=>{if(i%2){j.state='return';j.t=0}})")],
].filter(s => !only || only.has(s[0]) || only.has(s[0].split('-')[0]));
const pg = await openPage({ audio: false, fonts: false });
try {
  var r = await pg.evalp(`(async()=>{const LV=(await import('/src/level.js')).LEVELS;const idx=LV.findIndex(l=>l.id==='underleaf');BK.manualSimulation=true;
    const snap=()=>{const c=document.createElement('canvas');c.width=640;c.height=360;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,640,360);return c.toDataURL('image/png');};
    const load=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(200);};
    const out=[];for(const [tag,x,y,extra] of ${JSON.stringify(SHOTS)}){load();if(extra.includes('growBed')){eval(extra);}if(x){BK.tp(x,y);BK.sim(400);}else BK.sim(20);try{if(!extra.includes('growBed'))eval(extra);}catch(e){out.push({tag:tag+'-ERR',png:snap(),err:String(e)});}for(let k=0;k<12;k++)BK.step(1);out.push({tag,png:snap()});}
    BK.manualSimulation=false;return out;})()`, 900000);
  for (const s of r) { writeFileSync(join(OUT, 'underleaf4art-' + PFX + '-' + s.tag + '.png'), Buffer.from(s.png.split(',')[1], 'base64')); console.log('underleaf4art-' + PFX + '-' + s.tag + '.png' + (s.err ? ' ' + s.err : '')); }
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 3));
} finally { await pg.close(); }
process.exit(0);
