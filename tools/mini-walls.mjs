// tools/mini-walls.mjs — A FIGHT THAT PINS ITS FEET NEVER ENDS A FRAME IN ROCK (Falling Tower round 2, docs/briefs/falling-tower-round2.md §1a).
// Daniel, 2026-09-25: THE SEXTON "gets stuck in walls a lot". His feet were pinned to his deck and his x was clamped only to his room's
// box, so he walked, rushed and climbed out of the bell pit into the two stone ringers' walks that stand two rows proud of that deck.
// Several minis move the same way - the feet set to the room's floor every frame, the x clamped to the room - and none of them is told
// where the room's rock is. So each is woken in its own room, seeded, and chased round it for a while by a god-mode hero thrown to a
// new spot every two and a half seconds, and at the END OF EVERY FRAME its box (w x h over its feet, a pixel in from each side) must be clear of
// rock (SOLID and a shut PORT). It must also have moved: a boss frozen in a corner passes a rock test for the wrong reason.
// usage: node tools/mini-walls.mjs [runs=6]
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';

const RUNS = +(process.argv[2] || 6), SECS = 30;
const ROOMS = [['fallingtower', 'sexton'], ['burial', 'gravewarden'], ['witchlight', 'hedgewarden'], ['unburied', 'barrowrider']];
const pg = await openPage({ audio: false, fonts: false });
const bad = [], seen = []; let leaps = 0;
try {
  for (const [lv, t] of ROOMS) {
    const r = await pg.evalp(`(async()=>{const{LEVELS,T}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out=[];
      const mul=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
      const real=Math.random;
      try{for(let run=0;run<${RUNS};run++){Math.random=mul(9173+run*7919);
        BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id===${JSON.stringify(lv)}));BK.state='play';BK.god=true;BK.sim(10);
        const L=BK.L,M=L.mini,P=BK.P,W=L.W,rock=v=>v===T.SOLID||v===T.PORT;
        const boss=BK.enemies().find(e=>e.t===${JSON.stringify(t)}&&e.alive);if(!M||!boss){out.push({run,skip:!M?'no mini':'no boss'});continue;}
        for(const e of BK.enemies())if(e!==boss&&!e.maxHp)e.alive=false;
        BK.tp(Math.round(M.trigger/16)+1,Math.round(M.floor/16)-1);BK.sim(90);
        /* where to throw the hero: every standable cell inside the room's walls, at or a few rows over its floor */
        const x0=Math.ceil(M.x0/16)+1,x1=Math.floor(M.x1/16)-2,fr=Math.round(M.floor/16),spots=[];
        for(let x=x0;x<=x1;x++)for(let y=fr-6;y<=fr+3;y++){const u=L.grid[(y+1)*W+x],h=L.grid[y*W+x];if(h===T.AIR&&u!==T.AIR&&u!==T.NET&&u!==T.SPIKE)spots.push([x,y]);}
        let inRock=0,first=null,xs=new Set(),frames=0;const modes={};
        for(let f=0;f<${SECS}*60&&boss.alive;f++){
          if(f%150===0&&spots.length){const[sx,sy]=spots[Math.floor(Math.random()*spots.length)];BK.tp(sx,sy);}
          P.hp=P.maxHp;P.dead=0;boss.hp=Math.max(boss.hp,boss.maxHp*(f<${SECS}*30?1:0.45));   /* the second half in phase two */
          BK.sim(1);frames++;xs.add(Math.round(boss.x/16));modes[boss.mode]=(modes[boss.mode]||0)+1;
          const w=boss.w||20,h=boss.h||30,L0=Math.floor((boss.x-w/2+1)/16),R0=Math.floor((boss.x+w/2-1)/16),T0=Math.floor((boss.y-h+1)/16),B0=Math.floor((boss.y-1)/16);
          let hit=null;for(let y=T0;y<=B0&&!hit;y++)for(let x=L0;x<=R0&&!hit;x++)if(rock(L.grid[y*W+x]))hit=[x,y];
          if(hit){inRock++;if(!first)first={f,x:Math.round(boss.x),y:Math.round(boss.y),mode:boss.mode,cell:hit};}
        }
        out.push({run,frames,inRock,first,cols:xs.size,modes});}
      }finally{Math.random=real;}
      return out;})()`, 900000);
    for (const q of r) { if (q.skip) { bad.push(`${lv}/${t}: ${q.skip}`); continue; }
      seen.push(`${t} run ${q.run}: ${q.inRock}/${q.frames} frames in rock, ${q.cols} columns visited${q.modes.leap ? ', ' + q.modes.leap + ' frames leaping' : ''}`); if (t === 'sexton') leaps += q.modes.leap || 0;
      if (q.inRock) bad.push(`${lv}/${t} run ${q.run}: ${q.inRock} of ${q.frames} frames with his box in rock - first ${JSON.stringify(q.first)}`);
      if (q.cols < 4) bad.push(`${lv}/${t} run ${q.run}: he visited only ${q.cols} columns - frozen, not fought`); }
  }
  assert.deepEqual(pg.errors, []);
} finally { pg.close(); }
for (const s of seen) console.log('   ' + s);
assert.ok(leaps > 0, "THE SEXTON never leapt a ringers' walk in any run: the rock test passed with him penned in one bay");
assert.equal(bad.length, 0, bad.length + ' fight(s) ended a frame with the boss in the rock:\n  ' + bad.join('\n  '));
console.log(`ok  mini-walls   ${ROOMS.map(r => r[1]).join(', ')}: ${RUNS} seeded runs each, ${SECS} s chased round the room, never a frame ending in rock`);
