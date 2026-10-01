// tools/fair-shots.mjs - THE HARVEST FAIR's pictures (claude/fairlevel: the vertical rebuild), one per set piece, rendered with BK.step and saved at 2x into work/claude/fairlevel/<tag>/.
// God mode, the hero teleported to each spot. Not in the suite: pictures are for eyes.   usage: node tools/fair-shots.mjs [tag] [only,names]
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after', only = (process.argv[3] || '').split(',').filter(Boolean), out = join(ROOT, 'work/claude/fairlevel', tag); mkdirSync(out, { recursive: true });
const STOPS = [   // name, tile x, tile y (the hero's feet), facing, frames to run, [extra js], note
  ['01-gate-refresher', 52, 27, 1, 50, '', 'THE GATE: one sign, one mummer, faced and frozen'],
  ['02-high-striker-boardwalk', 86, 27, 1, 40, '', 'THE HIGH STRIKER under the boardwalk, and the roof stair up to it'],
  ['03-stall-row-pincer', 148, 27, 1, 40, '', 'THE STALL ROW: the slope stair (drawn as slopes now), two mummers at its foot, one at the top'],
  ['04-gallery-crows-nest', 172, 21, 1, 40, '', 'THE SHOOTING GALLERY on the terrace: three targets, the clock bar over the awning'],
  ['05-back-lot', 205, 34, 1, 30, 'BK.P.y=35*16;', 'THE BACK LOT (secret): the cellar under the road: a silver, tickets, a heart'],
  ['06-carousel-twist', 276, 25, 1, 60, '', 'THE CAROUSEL: it turns you (the bulbs go red first)'],
  ['07-big-wheel', 300, 27, 1, 30, '', 'THE BIG WHEEL: six cars on a circle, hop on when one comes round low'],
  ['08-wheel-top-swings', 316, 16, 1, 30, '', 'THE HIGH ROAD: the boardwalk at the wheel\'s top, the first swing-ride chair'],
  ['09-hall-of-mirrors', 322, 27, 1, 60, '', 'THE HALL OF MIRRORS: dark, true glass shows what is behind you, cracked glass does not'],
  ['09z-hall-zoom', 322, 27, 1, 60, '', 'the hall, close up', [40, 20, 160, 90]],
  ['10-tower-stair', 354, 18, 1, 40, '', 'THE TOWER STAIR: a mummer on the landing under a guttering lantern'],
  ['11-helter-skelter', 372, 13, 1, 30, '', 'THE HELTER-SKELTER: the tower top and the slide down'],
  ['12-corn-maze', 425, 27, 1, 40, '', 'THE CORN MAZE: three tiers, blind corners, scarecrows (some are not straw)'],
  ['13-corn-top-tier', 424, 17, 1, 40, '', 'THE CORN MAZE, tier three: the dark tier'],
  ['14-ghost-train-cutting', 476, 30, 1, 30, '', 'THE GHOST-TRAIN CUTTING (reserved): the road sunk three rows, a boarded arch'],
  ['14b-corn-top-walk', 420, 11, 1, 30, '', 'THE CORN-TOP WALK over the maze, reached by the tall striker'],
  ['07b-wide-car', 300, 27, 1, 30, '', 'THE BIG WHEEL: the wide car with a hobby-horse riding it'],
  ['15-last-round', 526, 27, 1, 60, '', 'THE LAST ROUND: the small carousel with a mummer and a horse aboard'],
  ['16-night-lane', 572, 13, 1, 30, '', 'THE NIGHT LANE: a plank run in full night, lanterns failing, reached by the tall striker'],
  ['17-prize-booth', 588, 27, 1, 30, '', 'THE PRIZE BOOTH: eight tickets for a silver'],
  ['18-maypole-green', 646, 27, 1, 60, '', 'THE MAYPOLE GREEN (the boss arena, not this lane\'s)'],
];
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const res=[];const only=${JSON.stringify(only)};
    const snap=(name,note,crop)=>{const c=document.createElement('canvas');const sc=crop?4:2;if(crop){c.width=crop[2]*sc;c.height=crop[3]*sc;}else{c.width=BK.view.VW*sc;c.height=BK.view.VH*sc;}const g=c.getContext('2d');g.imageSmoothingEnabled=false;if(crop)g.drawImage(BK.buf,crop[0],crop[1],crop[2],crop[3],0,0,c.width,c.height);else g.drawImage(BK.buf,0,0,c.width,c.height);res.push([name,c.toDataURL('image/png'),note]);};
    const run=(n)=>{for(let i=0;i<n;i++){BK.sim(1);if(i%4===0)BK.step(1);}BK.step(1);};
    const fi=LEVELS.findIndex(l=>l.id==='fair');
    BK.setHero('knight');BK.reset({fresh:true});BK.load(fi);BK.state='play';BK.god=true;BK.sim(10);
    for(const [name,x,y,face,n,js,note,crop] of ${JSON.stringify(STOPS)}){ if(only.length&&!only.some(o=>name.includes(o)))continue;
      BK.tp(x,y);BK.P.face=face;if(js)eval(js);run(n);snap(name,note,crop); }
    return res;})()`, 900000);
  r.forEach(([name, d, note]) => { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/fairlevel/' + tag + '/' + name + '.png  -  ' + note); });
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
