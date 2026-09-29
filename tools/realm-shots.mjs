// tools/realm-shots.mjs - THE UNDEAD ARCHMAGE, claude/undead3: pictures of his wards on the spiral stair and of his three spell realms
// (src/spiral-chase.js, src/mage-realms.js), rendered with BK.step and saved at 2x into <out>/. God mode. Not in the suite: pictures are
// for eyes.
// usage: node tools/realm-shots.mjs <out dir>
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2] || 'work/undead3/shots'; mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');const MR=await import('/src/mage-realms.js');BK.manualSimulation=true;const res=[];
    const snap=(name,note)=>{const c=document.createElement('canvas');c.width=BK.view.VW*2;c.height=BK.view.VH*2;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,c.width,c.height);res.push([name,c.toDataURL('image/png'),note]);};
    const run=(n,f)=>{for(let i=0;i<n;i++){BK.P.hp=BK.P.maxHp;BK.sim(1);if(f&&f())break;if(i%4===0)BK.step(1);}BK.step(1);};
    BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='fallingtower'));BK.state='play';BK.god=true;BK.sim(10);
    BK.tp(33,50);for(let i=0;i<60;i++){BK.keys.right=true;BK.sim(1);}BK.keys.right=false;run(30);
    BK.tp(94,117);run(60);snap('seal-brazier','flight 1: the first brazier (ringed, the lesson) and his ward barring the landing, him over it');
    const s=BK.L.spiral.seals[0];BK.P.face=1;BK.press('atk');run(40,()=>s.wall&&s.wall.i>=3);snap('seal-fire','the brazier struck: its fire going up the stair to the ward');
    run(120,()=>s.broken);run(8);snap('seal-burnt','the ward burns and he flees');
    BK.board();run(60);const b=BK.boss;for(let i=0;i<300&&b.mode==='wake';i++)BK.sim(1);
    for(let k=0;k<3;k++){b.hp=Math.floor(b.hp0*MR.REALM.at[k]);b.realmRest=0;run(600,()=>b.mode==='realmTell'&&b.modeT<0.6);snap('tear-'+k,'he tears a portal: '+MR.REALM.kinds[k]);
      run(200,()=>!!b.realm);const R=b.realm;
      if(R.kind==='fire'){run(400,()=>R.ph==='tell');snap('fire-tell','the fire realm: the tiles of the pattern glowing');run(120,()=>R.ph==='burn');run(10);snap('fire-burn','the pillars stand up');run(900,()=>R.wall&&R.wall.back);snap('fire-wall','his fire wall rolling back');b.mode='scorched';b.modeT=0.2;}
      if(R.kind==='ice'){run(400,()=>R.icicles.some(q=>q.st==='crack'));run(20);snap('ice-crack','the ice realm: an icicle cracking over you, frost down to the floor; him in his shell');b.mode='shattered';b.modeT=0.2;}
      if(R.kind==='poison'){run(300);run(600,()=>b.mode==='sporeTell');run(20);snap('poison-spores','the poison realm: the risen mire, the vent, the spore rings - the beam cut');b.mode='vented';b.modeT=0.2;}
      run(200,()=>!b.realm);}
    return res;})()`, 600000);
  r.forEach(([name, d, note], j) => { writeFileSync(join(out, String(j).padStart(2, '0') + '-' + name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(String(j).padStart(2, '0') + '-' + name, '-', note); });
} finally { pg.close(); }
