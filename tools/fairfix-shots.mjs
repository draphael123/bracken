// tools/fairfix-shots.mjs - THE HARVEST FAIR after the review's fixes (claude/fairfix), one picture per new beat, rendered with BK.step and saved at 2x into work/claude/fairfix/<tag>/.
// The foes are LEFT IN (this is what the fix is about); god mode; the hero teleported to each spot. Not in the suite: pictures are for eyes.
//   usage: node tools/fairfix-shots.mjs [tag] [only,names]        (the full map is tools/fair-map.mjs)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after', only = (process.argv[3] || '').split(',').filter(Boolean), out = join(ROOT, 'work/claude/fairfix', tag); mkdirSync(out, { recursive: true });
const STOPS = [   // name, tile x, tile y (the hero's feet), facing, frames to run, [extra js], note, [crop]
  ['01-boardwalk-barker', 146, 18, 1, 70, 'for(const e of BK.enemies())if(e.t==="barker"&&e.x<200*16){e.st.callT=0.2;}', 'THE BOARDWALK is not free: a mummer on its planks behind you, the barker at its far end calling you round'],
  ['02-islands', 322, 16, 1, 40, '', 'THE SWING RIDE: a marionette on island A coming to meet the chair, a horse on island B facing the way you come'],
  ['03-hall-marionette', 324, 27, 1, 50, '', 'THE HALL OF MIRRORS: the marionette by the door, the mummer at the cracked glass, the true glass ahead'],
  ['03z-hall-zoom', 324, 27, 1, 50, '', 'the hall, close up', [40, 30, 170, 95]],
  ['04-slide-stall', 381, 27, 1, 20, '', 'THE SLIDE\'S FOOT: the horse stall under the slide, behind you as you land; a mummer on the hill ahead'],
  ['05-corn-top-dark', 428, 11, 1, 40, '', 'THE CORN-TOP WALK in the dark: a scarecrow that is not straw'],
  ['06-ghost-train-chase', 478, 30, 1, 100, 'BK.P.x=477*16;', 'THE GHOST TRAIN in motion: out of the tunnel behind you, a beam ahead, a mummer in the way'],
  ['06b-ghost-train-beams', 492, 30, 1, 60, '', 'THE GHOST TRAIN\'s beams and the second mummer'],
  ['07-exam-canopy', 534, 25, 1, 60, '', 'THE LAST ROUND: the small carousel under its canopy, dark, lanterns failing, a mummer and a marionette riding it, the true mirror at the far end'],
  ['08-night-lane', 574, 13, 1, 50, '', 'THE NIGHT LANE at night: a dark sky, the lantern\'s pool, the mummer held only in it'],
  ['09-blind-stall-barker', 566, 27, 1, 60, '', 'THE LAST ROUND: the blind stall wall with a mummer behind it, the gallery, the booth, the barker on his crate'],
  ['10-door-guard-unlit', 600, 27, 1, 40, '', 'THE DOOR GUARD on the unlit stretch'],
];
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const res=[];const only=${JSON.stringify(only)};
    const snap=(name,note,crop)=>{const c=document.createElement('canvas');const sc=crop?4:2;if(crop){c.width=crop[2]*sc;c.height=crop[3]*sc;}else{c.width=BK.view.VW*sc;c.height=BK.view.VH*sc;}const g=c.getContext('2d');g.imageSmoothingEnabled=false;if(crop)g.drawImage(BK.buf,crop[0],crop[1],crop[2],crop[3],0,0,c.width,c.height);else g.drawImage(BK.buf,0,0,c.width,c.height);res.push([name,c.toDataURL('image/png'),note]);};
    const run=(n)=>{for(let i=0;i<n;i++){BK.sim(1);if(i%4===0)BK.step(1);}BK.step(1);};
    const fi=LEVELS.findIndex(l=>l.id==='fair');
    for(const [name,x,y,face,n,js,note,crop] of ${JSON.stringify(STOPS)}){ if(only.length&&!only.some(o=>name.includes(o)))continue;
      BK.setHero('knight');BK.reset({fresh:true});BK.load(fi);BK.state='play';BK.god=true;BK.sim(10);
      BK.tp(x,y);BK.P.face=face;if(js)eval(js);run(n);snap(name,note,crop); }
    return res;})()`, 900000);
  r.forEach(([name, d, note]) => { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/fairfix/' + tag + '/' + name + '.png  -  ' + note); });
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
