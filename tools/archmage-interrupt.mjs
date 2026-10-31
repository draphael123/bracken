// tools/archmage-interrupt.mjs - AN INTERRUPTED CAST TAKES ITS OVERLAY WITH IT (claude/ft2art, Daniel 10-10: "when I hit him during the
// fill-the-area spell the text and the red line still appear"). The grave script's lines, the skulls', orrery's and void's tells live only in
// their own windup: a stagger (his own bolt struck home) mid-windup must clear them the same frame.
// usage: PORT=8808 node tools/archmage-interrupt.mjs
import assert from 'node:assert/strict';
import { openRetry } from './boss-run.mjs';
import { TOP as SPIRAL_TOP } from '../src/spiral-chase.js';
const pg = await openRetry();
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='fallingtower'));BK.state='play';BK.sim(10);
    BK.tp(${SPIRAL_TOP.check},${SPIRAL_TOP.row});BK.sim(5);if(!BK.carpet())BK.board();BK.sim(30);const b=BK.boss||BK.enemies().find(e=>e.t==='undeadmage'&&e.alive);for(let i=0;i<3600&&b&&b.leg==='ascent';i++)BK.sim(1);/* (batch131: THE ASCENT first, claude/ft4a) */for(let i=0;i<300&&b.mode==='wake';i++)BK.sim(1);
    const P=BK.P,out={};b.noBlink=99;b.realmRest=99;
    for(const [spell,idx,tell,key] of [['script',11,'scriptTell','script'],['bone',3,'boneTell','bones'],['orbit',5,'orbitTell','orbit']]){
      b.turn=idx;b.mode='hover';b.modeT=0;let n=0;for(;n<400&&b.mode!==tell;n++){P.hp=P.maxHp;BK.sim(1);}
      const had=!!b[key];b.mode='reflected';b.modeT=2;P.hp=P.maxHp;BK.sim(1);out[spell]={tellSeen:b.mode!==tell||had,had,after:!!b[key]};
      b.mode='hover';b.modeT=0.2;for(let i=0;i<30;i++){P.hp=P.maxHp;BK.sim(1);}}
    return out;})()`, 600000);
  console.log(JSON.stringify(r));
  for (const [k, v] of Object.entries(r)) { assert.ok(v.had, k + ': its windup showed an overlay'); assert.equal(v.after, false, k + ': the interrupted cast left its overlay'); }
  console.log('ok: an interrupted cast clears its overlay the same frame');
} finally { pg.close(); }
