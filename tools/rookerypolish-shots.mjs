/* tools/rookerypolish-shots.mjs - stills of THE SUMMIT's slabs/rubble/stone and the Shriek Sisters' card (claude/rookerypolish). OUT=<dir> PREFIX=<name> */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), OUT = process.env.OUT || join(ROOT, 'work', 'claude', 'lane-done'), PRE = process.env.PREFIX || 'rookerypolish';
mkdirSync(OUT, { recursive: true });
const pg = await openPage({ audio: false, fonts: false, noWait: true });
try {
  await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/tools/blank.html' }); await new Promise(r => setTimeout(r, 1500));   /* a blank page: the game's own boot is not needed to bake sprites */
  const png = await pg.evalp(`(async()=>{
    const W=await import('/src/redraw/rookery_world.js'),H=await import('/src/shriek-sisters-hands.js');const Z=6;
    const items=[];const has=k=>W[k];
    if(has('bakeSummitSlab')){items.push(['slab',W.bakeSummitSlab(48)]);items.push(['rubble',W.bakeSummitRubble(48)]);items.push(['stone',W.bakeSummitStone()]);}
    else{items.push(['(none)',document.createElement('canvas')]);}
    const card=H.bakeShriekSistersCard();items.push(['card0',card.R[0]]);items.push(['card1',card.R[1]]);
    const cv=document.createElement('canvas');cv.width=900;cv.height=520;const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#8a86a4';g.fillRect(0,0,900,520);
    let x=8,y=8;for(const [k,c] of items){const w=c.width*Z,h=c.height*Z;if(x+w>900){x=8;y+=140;}g.fillStyle='#3a3548';g.fillRect(x,y,w,h);g.drawImage(c,x,y,w,h);g.fillStyle='#fff';g.font='11px monospace';g.fillText(k,x,y+h+12);x+=w+12;}
    return cv.toDataURL('image/png');})()`, 120000);
  writeFileSync(join(OUT, PRE + '-summit-card.png'), Buffer.from(png.split(',')[1], 'base64')); console.log(PRE + '-summit-card.png');
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 3));
} finally { await pg.close(); }
process.exit(0);
