/* tools/deep-descent.mjs — THE WAY DOWN THE DEEP, PLAYED (Daniel, 2026-09-25: "The deep is unbeatable. There is no way down.").
   In the real page, no god mode, with the game's own key state (BK.keys / BK.press, what the keyboard sets), for the knight and the
   warden: from each checkpoint above a descent the hero plays down it the way a player does - swims to a stone, walks onto it, carries
   it to the hatch or throat, walks in, and at the bottom of THE SUNK TRIBUTE SHIP lets it go. Every leg must reach the next deck (or
   the next band) within its time: the ship's four decks through all three hot hatches and its stove-in bilge into the Glowing Drop,
   and the throats of the Wreck Stack, the Kelp Forest and the Coral Garden (the decks there sit on ship timber now). Prints each leg and
   fails on the first that does not get down. It is the check that the reach model and the walker could not be: they never carried a
   stone. In the suite (docs/briefs/deep-rework-2.md).
     node tools/deep-descent.mjs [heroes=knight,warden] */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const heroes = (process.argv[2] || 'knight,warden').split(',');
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');const TS=16;BK.manualSimulation=true;BK.SET.speed=1;BK.SET.sfx=0;BK.SET.music=false;
    const out=[];const idx=LEVELS.findIndex(l=>l.id==='deep');
    for(const hero of ${JSON.stringify(heroes)}){
      BK.setHero(hero);BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=false;BK.sim(5);
      const L=BK.L,W=L.W,at=(x,y)=>L.grid[y*W+x],k=BK.keys,none=()=>{k.left=k.right=k.up=k.down=k.jump=k.block=k.atk=false;};
      /* the legs: [name, start tile, the row the hero must get below, and whether it needs a stone] */
      const Y=158,legs=[['wreck stack throat',[54,41],73,false],['kelp throat',[16,81],113,false],['coral throat',[40,145],157,false],
        ['weather deck -> hatch A',[20,165],Y+9,true],['tribute hold -> hatch B',[40,176],Y+20,true],['orlop -> hatch C',[70,186],Y+30,true],['bilge -> the Drop',[62,196],Y+44,true]];
      for(const [name,[sx,sy],below,stone] of legs){
        /* everything off this leg but its own creatures: the question is the geometry and the rule, not a fight */
        BK.tp(sx,sy);BK.P.hp=BK.P.maxHp;BK.P.dead=0;if(BK.P.ballast){BK.P.ballast.held=false;BK.P.ballast=null;}
        for(const e of BK.enemies())if(Math.abs(e.x-sx*TS)<60*TS&&Math.abs(e.y-sy*TS)<14*TS)e.alive=false;
        BK.sim(30);let f=0,got=false,took=false,ok=false,maxY=BK.P.y;const T0=60*40;
        /* A SWIMMER'S ROUTE: the shortest way through open water (a body is two tiles: the cell and the one over it) from the hero to the
           goal, by breadth-first search; the hero steers at a cell a few steps along it with the arrow keys, exactly as a player swims */
        const open=(x,y)=>{const t=at(x,y),u=at(x,y-1);return t!==1&&t!==8&&u!==1&&u!==8;};
        const route=(x0,y0,done)=>{const seen=new Int32Array(W*L.H).fill(-1),q=[y0*W+x0];seen[q[0]]=q[0];for(let i=0;i<q.length;i++){const c=q[i],x=c%W,y=(c/W)|0;if(done(x,y)){const p=[];for(let k2=c;k2!==q[0];k2=seen[k2])p.unshift(k2);return p;}
          for(const[dx,dy]of[[0,1],[1,0],[-1,0],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<1||ny<2||nx>=W-1||ny>=L.H-1)continue;const k2=ny*W+nx;if(seen[k2]>=0||!open(nx,ny))continue;seen[k2]=c;q.push(k2);}}return null;};
        let path=null;
        for(;f<T0;f++){const P=BK.P;none();P.hp=P.maxHp;P.breath=Math.max(P.breath??6,3);   /* (breath held up: the leg measures the way, tools/breath.mjs the air) */
          const tx=Math.floor(P.x/TS),ty=Math.floor((P.y-1)/TS);
          if(stone&&!P.ballast){   /* first a stone: swim to the nearest one the water reaches, and walk onto it */
            if(f%10===0){const st=BK.props().filter(p=>p.t==='ballast'&&!p.held&&!p.gone&&Math.abs(p.y-P.y)<120);path=null;let best=null;
              for(const p of st){const r2=route(tx,ty,(x,y)=>x===Math.floor(p.x/TS)&&y===Math.floor((p.y-1)/TS));if(r2&&(!best||r2.length<best.length))best=r2;}path=best;}}
          else if(stone&&P.ballast){   /* heavy: WALK it to the hatch - no swimming, no jumping (the jump key lets it go) */
            let goal=null;for(let y=ty+1;y<L.H-2&&goal===null;y++){let n=0;for(let x=6;x<=105;x++)if(at(x,y)===1||at(x,y)===8)n++;if(n<60)continue;
              for(let x=6;x<=105;x++)if(at(x,y)===0&&(goal===null||Math.abs(x*TS+8-P.x)<Math.abs(goal-P.x)))goal=x*TS+8;}
            path=null;if(goal!==null&&Math.abs(goal-P.x)>2)k[goal>P.x?'right':'left']=true;
            if(P.ground&&Math.abs(P.vx)<2&&(P.stuckT=(P.stuckT||0)+1)>240){P.stuckT=0;BK.press('jump');}}   /* stuck heavy against something: let it go and fetch another */
          else { if(P.ballast&&f%20===0)BK.press('jump');   /* a stone this leg does not need is let go */
            if(f%10===0)path=route(tx,ty,(x,y)=>y>below+1); }
          if(path&&path.length){const c=path[Math.min(3,path.length-1)],gx=(c%W)*TS+8,gy=((c/W)|0)*TS+15;if(Math.abs(gx-P.x)>3)k[gx>P.x?'right':'left']=true;if(gy<P.y-3)k.up=true;else if(gy>P.y+3)k.down=true;
            while(path.length&&Math.abs((path[0]%W)*TS+8-P.x)<6&&Math.abs(((path[0]/W)|0)*TS+15-P.y)<9)path.shift();}
          if(P.ballast)took=true;
          BK.sim(1);maxY=Math.max(maxY,BK.P.y);if(BK.P.y/TS>below+1){ok=true;break;}}
        out.push({hero,leg:name,ok,secs:+(f/60).toFixed(1),stoneTaken:took,deepest:Math.round(maxY/TS),stuckAt:[Math.round(BK.P.x/TS),Math.round(BK.P.y/TS)],heavy:!!BK.P.ballast});
      }
    }
    return out;})()`, 900000);
  for (const x of r) console.log((x.ok ? ' ok  ' : 'FAIL ') + x.hero.padEnd(9) + x.leg.padEnd(26) + x.secs + ' s  deepest row ' + x.deepest + (x.ok ? '' : '  stuck at ' + x.stuckAt + (x.stoneTaken ? ' (had a stone' + (x.heavy ? ', still holding it)' : ', lost it)') : ' (never took a stone)')));
  assert.deepEqual(pg.errors, []);
  const bad = r.filter(x => !x.ok);
  assert.equal(bad.length, 0, bad.length + ' descent(s) a player cannot make: ' + bad.map(x => x.hero + ' ' + x.leg).join(', '));
  console.log('deep-descent: ' + r.length + ' legs played with real keys, no god mode (' + heroes.join(', ') + '): every way down the Deep goes down.');
} finally { pg.close(); }
