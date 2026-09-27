/* tools/burial2-walk.mjs <tag> [heroes] — THE BURIAL CAVERNS WALKED AND LOOKED AT (claude/burial2; RULES F9, S8). Not in the suite.
     1. THE PLAY BOT (src/playtest.js, mode 'play'): no god mode, start to gate, once per hero - the same bot before and after the rework,
        so its report (walked, deaths, lifted-over places, findings) compares like with like.
     2. THE ROUTE, SECTION BY SECTION (only on a level that names its sections with rows, i.e. after the rework): the play bot's own walker
        (makeBot) driven along the level's real route - down the rotten floor, east along gallery one, west along gallery two, across the
        black water, through the Keeper's vault, up the shaft, over the bridges to the lair's door - with what each section cost it: blows,
        health, deaths, and where it had to be lifted. Real keys, no god mode (the walker cannot fight well: RULES M).
     3. ONE CAPTURE PER CHECKPOINT, the level as built, into work/burial2/<tag>-NN.png (BURIAL2_OUT overrides the folder).
   usage: node tools/burial2-walk.mjs after knight,warden */
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
const [tag = 'now', heroList = 'knight'] = process.argv.slice(2), heroes = heroList.split(',');
const out = process.env.BURIAL2_OUT || join(ROOT, 'work/burial2'); mkdirSync(out, { recursive: true });
const pg = await openPage({ fonts: false });
const lines = [], say = s => { console.log(s); lines.push(s); };
try {
  const rep = await pg.evalp(`(async()=>{const r=await BK.playtest({levels:['burial'],heroes:${JSON.stringify(heroes)},mode:'play',quiet:true,log:false});return r.text;})()`, 2400000);
  say('==== THE PLAY BOT (' + heroes.join(', ') + ')'); say(rep);
  await pg.reload();
  const r = await pg.evalp(`(async()=>{const{LEVELS,T}=await import('/src/level.js');const PT=await import('/src/playtest.js');
    BK.manualSimulation=true;BK.SET.speed=1;BK.SET.sfx=0;BK.SET.music=false;const TS=16,idx=LEVELS.findIndex(l=>l.id==='burial');
    const boot=h=>{BK.setHero(h||'knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.sim(5);return BK.L;};
    const L=boot(),res={walks:[],shots:[]};
    const S=(L.burialSections||[]).filter(s=>s.length>=5);
    if(S.length){const {DESCENT}=await import('/src/burial-caverns.js'),A=L.arena,G=22;
      /* the route as waypoints: walk toward x until the test says you are through */
      const WAY=[{x:DESCENT.hole[0]+1,done:P=>P.y>(DESCENT.hall[2]+1)*TS},{x:DESCENT.drop[0]+1,done:P=>P.y>(DESCENT.g[0]+2)*TS},
        {x:DESCENT.rot[0]+2,done:P=>P.y>(DESCENT.oss[2]+1)*TS},{x:DESCENT.piers[1][0]+2,done:P=>P.x>DESCENT.piers[1][0]*TS&&P.y<DESCENT.pier*TS+2},
        {x:DESCENT.shaft[1],done:P=>P.x>=DESCENT.shaft[0]*TS&&P.y>DESCENT.vault[2]*TS},{x:DESCENT.shaft[1],up:true,done:P=>P.y<=G*TS&&P.x>DESCENT.shaft[0]*TS},
        {x:Math.round(A.trigger/TS)+1,done:P=>P.x>=A.trigger}];
      for(const h of ${JSON.stringify(heroes)}){boot(h);BK.god=false;for(const e of BK.enemies())if(e.buried&&false)e.alive=false;
        const secs=S.map(([name,x0,x1,y0,y1])=>({name,x0,x1,y0,y1,blows:0,lost:0,deaths:0,lifts:0,frames:0}));
        const secOf=(x,y)=>{const tx=x/TS,ty=y/TS;return secs.find(s=>tx>=s.x0&&tx<=s.x1+1&&ty>=s.y0-1&&ty<=s.y1+1)||secs[0];};
        let bot=PT.makeBot(BK),w=0,hp=BK.P.hp,d0=BK.stats().deaths,still=0,best=null,f=0,dieAt=[],lifted=[];
        const liftTo=()=>{const P=BK.P,cur=secOf(P.x,P.y),i=secs.indexOf(cur),nx=secs[Math.min(secs.length-1,i+1)];
          const c=L.ents.filter(e=>e.t==='check'&&e.x>=nx.x0&&e.x<=nx.x1&&e.y>=nx.y0-1&&e.y<=nx.y1+1).sort((a,b)=>a.x-b.x)[0];
          lifted.push(cur.name);cur.lifts++;if(c)BK.tp(c.x,c.y);else BK.tp(nx.x0+2,nx.y0+2);BK.P.hp=BK.P.maxHp;BK.P.dead=0;bot=PT.makeBot(BK);still=0;best=null;
          while(w<WAY.length-1&&WAY[w].done(BK.P))w++;};
        for(f=0;f<60*900;f++){if(BK.state!=='play')break;const P=BK.P,wp=WAY[w];
          if(wp.done(P)){if(w===WAY.length-1)break;w++;best=null;still=0;continue;}
          const r2=bot(wp.x*TS+8);if(wp.up&&P.x>=DESCENT.shaft[0]*TS-8){BK.keys.up=true;BK.keys.right=P.x<DESCENT.shaft[1]*TS+4;BK.keys.left=false;}
          BK.sim(1);const s=secOf(P.x,P.y);s.frames++;if(P.hp<hp){s.blows++;s.lost+=hp-P.hp;}hp=P.hp;
          const pr=Math.abs(P.x-wp.x*TS)+Math.abs(P.y)*0.01;if(best===null||pr<best-4){best=pr;still=0;}else still++;
          const dn=BK.stats().deaths;if(dn>d0){d0=dn;s.deaths++;dieAt.push(Math.round(P.x/TS));if(dieAt.length>=3&&Math.abs(dieAt[dieAt.length-1]-dieAt[dieAt.length-3])<8){dieAt=[];liftTo();}}
          if(r2==='stuck'||still>1800)liftTo();}
        res.walks.push({hero:h,frames:f,reachedDoor:BK.P.x>=A.trigger,deaths:BK.stats().deaths,lifted,
          secs:secs.map(s=>({name:s.name,blows:s.blows,lost:Math.round(s.lost),deaths:s.deaths,lifts:s.lifts,seconds:+(s.frames/60).toFixed(1)}))});}}
    /* THE LOOK: one frame at every checkpoint, the level as built, nothing killed */
    const checks=L.ents.filter(e=>e.t==='check').map(e=>[e.x,e.y]);
    for(const [x,y] of checks){boot();BK.god=true;BK.tp(x+3,y);BK.sim(200);BK.tp(x+3,y);for(let i=0;i<70;i++)BK.step(1);res.shots.push({at:x+'_'+y,png:document.querySelector('canvas').toDataURL('image/png')});}
    {boot();BK.god=true;const A=BK.L.arena;BK.tp(Math.round(A.trigger/TS)+1,Math.round(A.floor/TS)-1);BK.sim(200);for(let i=0;i<70;i++)BK.step(1);res.shots.push({at:'boss',png:document.querySelector('canvas').toDataURL('image/png')});}
    return res;})()`, 3600000);
  for (const w of r.walks) { say('==== THE ROUTE, ' + w.hero + ': reached the door ' + w.reachedDoor + ', deaths ' + w.deaths + ', lifted over ' + (w.lifted.join(', ') || 'nothing') + ', ' + (w.frames / 60).toFixed(0) + ' s');
    for (const s of w.secs) say('  ' + s.name.padEnd(24) + ' blows ' + String(s.blows).padStart(3) + '  health ' + String(s.lost).padStart(4) + '  deaths ' + s.deaths + '  lifts ' + s.lifts + '  ' + s.seconds + ' s'); }
  r.shots.forEach((s, i) => writeFileSync(join(out, tag + '-' + String(i).padStart(2, '0') + '-' + s.at + '.png'), Buffer.from(s.png.split(',')[1], 'base64')));
  say(r.shots.length + ' captures in ' + out + '/' + tag + '-*.png');
  if (pg.errors.length) { say('PAGE ERRORS ' + JSON.stringify(pg.errors.slice(0, 5))); process.exitCode = 1; }
  writeFileSync(join(out, 'walk-' + tag + '.txt'), lines.join('\n') + '\n');
} finally { pg.close(); }
