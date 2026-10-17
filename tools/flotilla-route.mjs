/* tools/flotilla-route.mjs - EVERY HERO ROUTES THE FLOTILLA'S MOVING WAYS WITH BASE MOVEMENT (claude/flotilla2; design standard A7).
   The reach model cannot ride a mover and the level walker (tools/level-walk.mjs) only follows the reach model's route, which swims the bilge and the harbour
   under THE GALLEY HULL's benches and THE RIGGING RUN's yards. So this plays each chain of them with a player's inputs, per hero, in the page: stand at the
   edge, WAIT for the next bench / yard to come where a plain jump reaches it, jump toward it holding the direction, land ON it, ride it, and jump off onto the
   next - every link, no god-mode lift, foes cleared (this measures the platforming, not the fights). A link is passed when the hero is footed on the target
   (a mover: P.onMover; a ledge: footed within its columns at its row). It also proves the told verb: a bench stopped high by freeing its rower is a step.
   node tools/flotilla-route.mjs [--heroes=a,b] (PORT)  */
import { openPage } from './cdp.mjs';
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const HEROES = opt('heroes', 'knight,warden,pyro,ranger,paladin,reaper,geomancer').split(',');
/* the chains: a start (tile, the hero's feet row) and an ordered list of links - { bench: id } | { yard: x0col } | { ledge: [c0, c1, row] } */
const CHAINS = [
  { name: 'GALLEY HULL: the teach well', start: [100, 23], links: [{ bench: 'b0' }, { ledge: [110, 117, 23] }] },
  { name: 'GALLEY HULL: the test well', start: [116, 23], links: [{ bench: 'b1' }, { bench: 'b2' }, { bench: 'b3' }, { ledge: [139, 152, 23] }] },
  { name: 'GALLEY HULL: up to the stern castle', start: [151, 23], links: [{ bench: 'b4' }, { bench: 'b5' }, { bench: 'b6' }, { ledge: [174, 186, 14] }] },
  { name: 'GALLEY HULL: the exam well', start: [185, 14], links: [{ bench: 'b7' }, { bench: 'b8' }, { bench: 'b9' }, { ledge: [205, 208, 23] }] },
  { name: 'RIGGING RUN: teach + test', start: [289, 8], links: [{ yard: 289 }, { ledge: [301, 305, 8] }, { yard: 305 }, { yard: 313 }, { ledge: [321, 325, 7] }] },
  { name: 'RIGGING RUN: the lashing and the remix', start: [323, 7], links: [{ ledge: [325, 336, 10] }, { ledge: [337, 341, 8] }, { yard: 341 }, { ledge: [356, 360, 7] }] },
  { name: 'RIGGING RUN: the exam', start: [358, 7], links: [{ yard: 361 }, { yard: 368 }, { yard: 376 }, { ledge: [385, 389, 6] }] },
];
const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  R = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out={};const CH=${JSON.stringify(CHAINS)};
    const idx=LEVELS.findIndex(l=>l.id==='flotilla');
    for(const h of ${JSON.stringify(HEROES)}){out[h]=[];
      for(const c of CH){BK.setHero(h);BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=false;BK.sim(5);for(const e of BK.enemies())e.alive=false;
        const P=BK.P,K=BK.keys,none=()=>{for(const k of ['left','right','up','down','jump','block','atk','dodge'])K[k]=false;};
        BK.tp(c.start[0],c.start[1]);BK.sim(20);P.hp=P.maxHp;let done=0,why='';const t0=performance.now();
        const footedOn=L=>L.bench?(P.onMover&&P.onMover.bench===L.bench):L.yard?(P.onMover&&P.onMover.flot==='yard'&&Math.round(P.onMover.x0/16)===L.yard):(P.ground&&!P.onMover&&P.x>=L.ledge[0]*16&&P.x<=(L.ledge[1]+1)*16&&Math.abs(P.y-L.ledge[2]*16-16)<3);
        const tgt=L=>{if(L.ledge)return {l:L.ledge[0]*16,r:(L.ledge[1]+1)*16,y:L.ledge[2]*16+16,m:null};const m=BK.movers().find(q=>L.bench?q.bench===L.bench:(q.flot==='yard'&&Math.round(q.x0/16)===L.yard));return m?{l:m.x,r:m.x+m.w,y:m.y,m}:null;};
        for(const L of c.links){let ok=false;
          const TR=[];for(let f=0;f<60*30&&!ok;f++){none();if(f%4===0){const T0=tgt(L)||{};const nb=BK.movers().filter(q=>q.flot).sort((a,b)=>Math.abs(a.x+a.w/2-P.x)-Math.abs(b.x+b.w/2-P.x))[0];TR.push([f,Math.round(P.x),Math.round(P.y),Math.round(P.vy),P.ground?1:0,P.onMover?(P.onMover.bench||'y'):'-',K.left?'L':K.right?'R':'.',nb?Math.round(nb.x)+'/'+Math.round(nb.y):''].join(','));if(TR.length>14)TR.shift();}if(P.dead||P.swim||P.y>30*16){why='fell at link '+JSON.stringify(L)+' TRACE '+TR.join(' | ');break;}
            if(footedOn(L)){ok=true;break;}
            const T=tgt(L);if(!T){why='no target '+JSON.stringify(L);break;}
            const kind=L.bench?'bench':L.yard?'yard':'ledge',mid=(T.l+T.r)/2,dir=Math.sign(mid-P.x)||1,gapX=dir>0?T.l-P.x:P.x-T.r,dy=T.y-P.y,on=P.onMover;
            if(P.ground){
              /* A PLAYER'S READ: the target's top is within a plain jump up (40 px) or a drop below, and near enough across */
              const hOK=kind==='ledge'?dy>-40&&dy<200:kind==='bench'?dy>-36&&dy<(on?40:230)&&(T.m.dy<=0.3||T.m.y<=T.m.y0-T.m.rise+6||T.m.halted):dy>-40&&dy<48;
              const hOK2=hOK&&(!on||on.flot!=='bench'||dy>-20);   /* (off a moving bench: wait for the next to come level, as a player does) */
              if(hOK2&&gapX<=2&&dy>=-4){K[dir>0?'right':'left']=true;BK.sim(1);continue;}   /* over it already, or the edge touches it: step on */
              if(hOK2&&gapX<=58){K[dir>0?'right':'left']=true;BK.press('jump');K.jump=true;
                for(let i=0;i<80&&!(P.ground&&i>4)&&!P.swim;i++){const T2=tgt(L)||T,m2=(T2.l+T2.r)/2;K.jump=i<18;K.right=K.left=false;if(P.x<T2.l+6)K.right=true;else if(P.x>T2.r-6)K.left=true;else if(Math.abs(P.x-m2)>4&&P.vy<0)K[m2>P.x?'right':'left']=true;BK.sim(1);}none();BK.sim(2);continue;}
              /* not yet: ride to the edge of what we stand on nearest it, and wait there */
              const edge=on?(dir>0?on.x+on.w-6:on.x+6):null;if(edge!==null){if(Math.abs(P.x-edge)>3)K[edge>P.x?'right':'left']=true;}
              else{const G=BK.L.grid,W=BK.L.W,c=Math.floor((P.x+dir*10)/16),r=Math.floor((P.y+2)/16),t=G[r*W+c];if(t===1||t===2||t===4||t===14||t===11)K[dir>0?'right':'left']=true;}}
            BK.sim(1);}
          if(ok){for(let i=0;i<20;i++){none();BK.sim(1);}}   /* settle on what we landed on, as a player does, before the next */
          if(!ok){if(!why){const T=tgt(L)||{};why='timed out at '+JSON.stringify(L)+' hero '+[Math.round(P.x),Math.round(P.y),P.ground?'g':'a',P.onMover?(P.onMover.bench||P.onMover.flot||'m'):'-'].join(',')+' target '+[Math.round(T.l),Math.round(T.r),Math.round(T.y)].join(',');}break;}done++;}
        out[h].push({chain:c.name,links:c.links.length,done,why});}}
    /* THE VERB: free the castle bench's rower at the top of its stroke and it is a fixed step to the castle */
    {BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.sim(5);for(const e of BK.enemies())e.alive=false;const L=BK.L,r=L.flot2.rowers.find(q=>q.bench==='b6'),m=BK.movers().find(q=>q.bench==='b6');
      for(let i=0;i<600&&!(m.y<=m.y0-m.rise+1);i++)BK.sim(1);BK.P.x=r.x+18;BK.P.y=m.y;BK.P.vx=0;BK.P.vy=0;BK.P.face=-1;BK.P.inv=99;BK.sim(1);BK.P.x=r.x+18;BK.P.y=m.y;BK.P.face=-1;BK.press('atk');BK.sim(20);const y1=m.y;BK.sim(240);
      out.verb={freed:r.freed,still:Math.abs(m.y-y1)<0.5,top:Math.round(m.y0-m.rise),y:Math.round(m.y)};}
    return out;})()`, 1800000);
} finally { pg.close(); }
let fails = 0;
for (const h of HEROES) for (const c of R[h]) { const ok = c.done === c.links; if (!ok) fails++; console.log((ok ? 'ok  ' : 'FAIL') + ' ' + h.padEnd(9) + c.chain.padEnd(40) + c.done + '/' + c.links + (ok ? '' : '  ' + c.why)); }
const v = R.verb; if (!(v.freed && v.still && Math.abs(v.y - v.top) <= 3)) { fails++; console.log('FAIL the castle bench, its rower freed at the top, does not stay a step: ' + JSON.stringify(v)); } else console.log('ok   the castle bench stopped high by freeing its rower stays a step (' + JSON.stringify(v) + ')');
console.log(fails ? fails + ' FAILED' : 'flotilla-route: ok'); process.exit(fails ? 1 : 0);
