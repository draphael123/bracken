// tools/lantern-eater-sheet.mjs [tag=art] - THE LANTERN-EATER's CYCLE SHEET (claude/lanterneater art pass): every pose of src/redraw/lanterneater_art.js drawn
// on a dark basin backdrop at 4x - the two lights (lamp flickering vs lure swaying, the lure snagged), the raft lantern lit/shuttered, the bulk, the jaws surfacing /
// open / snapping / clamped / sinking, the gulp, the swell, the snuffed lamps, the decoy and its splash, the death guttering, the card.
//   PORT=8723 node tools/lantern-eater-sheet.mjs art  -> work/claude/lanterneater-art/sheet-<tag>-*.png. Not in the suite.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'art', out = join(ROOT, 'work/claude/lanterneater-art'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{const A=await import('/src/redraw/lanterneater_art.js');
    const S=4,CW=96,CH=96;
    const sheet=(name,cells,cols)=>{const rows=Math.ceil(cells.length/cols),c=document.createElement('canvas');c.width=cols*CW*S;c.height=rows*CH*S;const G=c.getContext('2d');G.imageSmoothingEnabled=false;
      cells.forEach(([label,fn],i)=>{const cc=document.createElement('canvas');cc.width=CW;cc.height=CH;const g=cc.getContext('2d');
        g.fillStyle='#22262a';g.fillRect(0,0,CW,CH);g.fillStyle='#1a1d20';for(let y=0;y<CH;y+=8)g.fillRect(0,y,CW,1);   /* the wall */
        g.fillStyle='#0f1c22';g.fillRect(0,70,CW,26);g.fillStyle='#5a8a80';g.fillRect(0,70,CW,1);   /* the water */
        fn(g);
        G.drawImage(cc,(i%cols)*CW*S,((i/cols)|0)*CH*S,CW*S,CH*S);G.fillStyle='#fff';G.font='bold 16px monospace';G.fillText(label,(i%cols)*CW*S+6,((i/cols)|0)*CH*S+18);});
      return [name,c.toDataURL('image/png')];};
    const res=[];
    res.push(sheet('lights',[
      ['lamp t0',g=>A.drawLamp(g,48,60,1,0)],['lamp dip',g=>A.drawLamp(g,48,60,0.3,1)],['lamp low',g=>A.drawLamp(g,48,60,0.55,2)],['lamp leap',g=>A.drawLamp(g,48,60,0.95,3)],
      ['lure sway -6',g=>A.drawLure(g,48,60,-6,80,70,0,false,false)],['lure sway 0',g=>A.drawLure(g,48,60,0,80,70,1,false,false)],['lure sway +6',g=>A.drawLure(g,48,60,6,80,70,2,false,false)],['lure pulse',g=>A.drawLure(g,48,60,0,80,70,3,false,false)],
      ['lure struck',g=>A.drawLure(g,48,60,3,80,70,0.5,false,true)],['snagged jerk 1',g=>A.drawLure(g,48,60,0,80,70,0.1,true,true)],['snagged jerk 2',g=>A.drawLure(g,48,60,0,80,70,0.2,true,true)],['snagged jerk 3',g=>A.drawLure(g,48,60,0,80,70,0.3,true,true)],
      ['glimpse',g=>A.drawGlimpse(g,48,50,4,70,70,1,0)],['key up',g=>{A.drawLure(g,48,40,0,80,70,0,false,false);A.drawKey(g,48,48,-1,0);}],
      ['raft lantern lit',g=>{g.fillStyle='#54422c';g.fillRect(10,60,76,6);A.drawRaftLantern(g,48,60,true,0.2,false);}],
      ['lantern dark/hot',g=>{g.fillStyle='#54422c';g.fillRect(10,60,76,6);A.drawRaftLantern(g,48,60,true,0.5,true);}],
      ['lantern shuttered',g=>{g.fillStyle='#54422c';g.fillRect(10,60,76,6);A.drawRaftLantern(g,48,60,false,0.3,true);}],
      ['basin lamp lit',g=>A.drawBasinLamp(g,48,70,false,0.3)],['snuffing .3',g=>A.drawBasinLamp(g,48,70,0.3,0.3)],['snuffing .7',g=>A.drawBasinLamp(g,48,70,0.7,0.3)],['snuffed',g=>A.drawBasinLamp(g,48,70,true,0.3)],
    ],4));
    res.push(sheet('beast',[
      ['bulk deep',g=>A.drawBulk(g,48,70,0.1,1,0)],['bulk near',g=>A.drawBulk(g,48,70,1,1,1)],['bulk left',g=>A.drawBulk(g,48,70,1,-1,2)],
      ['boil .3',g=>A.drawBoil(g,48,70,18,0.3,0.1)],['boil .9',g=>A.drawBoil(g,48,70,18,0.9,0.4)],['surface .6',g=>A.drawJaws(g,48,64,1,0.2,0,false,0.4)],
      ['surface .9',g=>A.drawJaws(g,48,64,1,0.2,0,false,0.75)],['jaws open (LOW key)',g=>A.drawJaws(g,48,64,1,0.6,0.3,true,1)],['jaws wide',g=>A.drawJaws(g,48,64,-1,1,0.9,false,1)],
      ['snap tell',g=>A.drawJaws(g,48,64,1,0.2,0.5,false,1)],['snap lunge',g=>A.drawGulp(g,48,68,0.5,0,true,0)],['sinking .5',g=>A.drawGulp(g,48,68,0.5,0,true,0.5)],
      ['gulp .2',g=>A.drawGulp(g,48,68,0.2,0,false,0)],['gulp .4',g=>A.drawGulp(g,48,68,0.4,0,false,0)],['gulp .65',g=>A.drawGulp(g,48,68,0.65,0,false,0)],['gulp .9',g=>A.drawGulp(g,48,68,0.9,0,false,0)],
      ['clamped 1',g=>A.drawClamped(g,48,64,0.0)],['clamped 2',g=>A.drawClamped(g,48,64,0.12)],['clamped 3',g=>A.drawClamped(g,48,64,0.31)],['clamped 4',g=>A.drawClamped(g,48,64,0.5)],
      ['swell L',g=>A.drawSwell(g,48,64,70,-1,0.2)],['swell R',g=>A.drawSwell(g,48,64,70,1,0.5)],
      ['decoy',g=>A.drawDecoy(g,48,70,0.9,0.3)],['decoy bitten',g=>A.drawDecoy(g,48,70,0.2,0.3)],['decoy splash',g=>A.drawDecoy(g,48,70,0.05,0.3)],
      ['death 0.2',g=>A.drawGutter(g,48,34,0.2,0.1,70)],['death 0.5',g=>A.drawGutter(g,48,34,0.5,0.2,70)],['death 0.8',g=>A.drawGutter(g,48,34,0.8,0.3,70)],['death 0.9',g=>A.drawGutter(g,48,34,0.9,0.3,70)],
      ['card',g=>{const c=A.bakeCard();g.drawImage(c.R[0],22,20);}],
    ],5));
    return res;})()`, 60000);
  for (const [n, d] of r) writeFileSync(join(out, 'sheet-' + tag + '-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log('sheets', r.map(x => x[0]).join(' '));
} finally { pg.close(); }
