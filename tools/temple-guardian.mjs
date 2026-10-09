// tools/temple-guardian.mjs - THE TEMPLE GUARDIAN 2's own check (claude/monastery2; src/temple-guardian.js, scratch/brief-temple2.md).
//   NODE: the numbers (B15's floor: a blade outside its opening lands at >= 0.4; its stagger pays more; a told ward after) and the hall as built
//         (two bells, each over a gallery three rows up - a jump for every hero; the hall tall enough for a guardian twice the old size).
//   PAGE, per hero (knight / warden / pyro), in the real Monastery:
//     - THE FALL-THROUGH BUG (Daniel 10-08): every block it raises is solid from above (a hero dropped on it lands ON it), from the side (walking
//       into it stops you) and is never raised on a hero (no soft-lock); a hero put inside one is lifted out on top
//     - THE BELL IS A NOTE: a hall bell struck with the guardian in its drawn reach STAGGERS it (still, open, gold); out of reach it does not; its
//       ward after the stagger turns the next note; a bell its TOLL set swinging cannot be struck
//     - THE BLOCKS ARE AMMO: INTERACT takes a raised block, ATTACK throws it, and it lands on the guardian and staggers it
//     - THE DAMAGE: a blade outside its opening lands at TG.take, inside it at TG.open
//     - WHEN HURT it hurls its blocks (a block leaves the floor and flies at you)
//     node tools/temple-guardian.mjs           both          --static   Node only
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { TG, inBellReach } from '../src/temple-guardian.js';

const TS = 16, fails = [], oks = [];
const ok = (c, m) => (c ? oks : fails).push(m);
/* ---------- NODE ---------- */
ok(TG.take >= 0.4, 'B15: a blade outside its opening lands at >= 0.4 (' + TG.take + ')');
ok(TG.open >= 1.5 && TG.open <= 2, 'its stagger pays 1.5-2x (' + TG.open + ')');
ok(TG.wardT >= 2.5 && TG.wardT <= 3.5 && TG.wardTake >= 0.4, 'B3: a told ~3 s ward after each stagger, blades still at the floor');
ok(TG.staggerT >= 1.5 && TG.staggerT2 >= 1.5, 'a stagger long enough to cut it (' + TG.staggerT + ' / ' + TG.staggerT2 + ' s)');
const L = LEVELS.find(l => l.id === 'spire').build(), M = L.mini, g = (x, y) => L.grid[y * L.W + x];
ok(M && M.boss === 'golem', 'the Monastery holds the guardian\'s hall');
const fy = M.floor / TS, bells = L.ents.filter(e => e.t === 'tbell' && e.guard);
ok(bells.length === 2, 'two hall bells');
let roof = fy - 1; while (roof > 0 && g(Math.round((M.x0 + M.x1) / 2 / TS), roof) === T.AIR) roof--;
ok(fy - 1 - roof >= Math.ceil(TG.h / TS) + 4, 'the hall is tall enough for it (' + (fy - 1 - roof) + ' rows clear over a ' + TG.h + ' px guardian)');
for (const b of bells) {
  const by = b.y * TS + 20, gal = [-2, -1, 0, 1, 2].map(dx => b.x + dx).flatMap(x => { const out = []; for (let y = fy - 6; y < fy; y++) if (g(x, y) === T.ONEWAY) out.push([x, y]); return out; });
  ok(gal.length > 0, 'bell at ' + b.x + ': a gallery under it');
  if (gal.length) { const gy = gal[0][1]; ok(fy - gy <= 3, 'bell at ' + b.x + ': its gallery is a jump off the floor (' + (fy - gy) + ' rows)'); ok(gy * TS - by <= 64 && gy * TS - by >= 40, 'bell at ' + b.x + ': struck from a jump off its gallery (' + (gy * TS - by) + ' px over it)'); }
  ok(by + 6 < M.floor - TG.h, 'bell at ' + b.x + ': it hangs over the guardian\'s head, not in it');
  ok(inBellReach({ x: b.x * TS + 8, y: by }, { x: b.x * TS + 8 + TG.bellRx - 4, y: M.floor }) && !inBellReach({ x: b.x * TS + 8, y: by }, { x: b.x * TS + 8 + TG.bellRx + 8, y: M.floor }), 'bell at ' + b.x + ': its reach is the drawn band');
}
/* ---------- PAGE ---------- */
if (!process.argv.includes('--static')) {
  const { openPage } = await import('./cdp.mjs');
  const pg = await openPage({ audio: false, fonts: false, seed: 7 });
  try {
    const out = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');const TGm=await import('/src/temple-guardian.js');const TG=TGm.TG;BK.manualSimulation=true;BK.SET.speed=1;const R={};
      const K=BK.keys, clr=()=>{for(const k of ['left','right','up','down','jump','atk'])K[k]=false;};
      for(const hero of ['knight','warden','pyro']){ const r=R[hero]={};
        BK.setHero(hero);BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='spire'));BK.state='play';BK.god=true;BK.sim(30);
        for(const e of BK.enemies())if(e.t!=='golem')e.alive=false;
        BK.tp(36,55);BK.sim(150);
        const G=BK.enemies().find(e=>e.t==='golem'), P=()=>BK.P, L=BK.L, W=L.W||L.grid.length/ (L.H||1), M=L.mini, fy=M.floor/16-1;
        r.awake=G.mode!=='sleep';
        G.x=43*16+8; G.mode='raiseTell'; G.modeT=0; BK.tp(31,52); BK.sim(3);
        const st=BK.tg().standing(); r.raised=st.length; r.raisedSolid=st.every(b=>L.grid[(b.fy-1)*BK.L.W+b.tx]===1&&L.grid[b.fy*BK.L.W+b.tx]===1);
        G.modeT=0; G.mode='walk'; G.raiseT=99; G.stompT=99; G.sweepT=99; G.throwT=99; G.tollT=99; G.hurlT=99;
        r.drops=[]; for(const b of st){ BK.tp(b.tx,b.fy-5); P().vy=0; BK.sim(50); r.drops.push(+(P().y/16).toFixed(2)===b.fy-1 ? 'on' : 'through:'+(P().y/16).toFixed(2)); }
        r.sides=[]; for(const b of st){ BK.tp(b.tx-3,fy); clr(); K.right=true; BK.sim(50); K.right=false; r.sides.push(P().x+P().w/2<=b.tx*16+0.5 ? 'stopped' : 'into:'+(P().x/16).toFixed(2)); }
        { const b=st[0]; BK.tp(b.tx,b.fy); BK.sim(2); r.unstick=+(P().y/16).toFixed(2)===b.fy-1; }
        /* never raised on a hero: stand in every column it could raise into, and make it raise */
        { const n0=BK.tg().blocks.length; for(const b of [...st]) { BK.tg().blocks.splice(BK.tg().blocks.indexOf(b),1); L.grid[(b.fy-1)*L.W+b.tx]=0; L.grid[b.fy*L.W+b.tx]=0; }
          const tx=Math.floor(G.x/16)+TG.raiseAt; BK.tp(tx,fy); BK.sim(2); G.mode='raiseTell'; G.modeT=0; BK.sim(3); r.onHero=BK.tg().standing().some(b=>b.tx===tx); G.mode='walk'; }
        /* THE BELL IS A NOTE: in reach, it staggers; the ward turns the next; out of reach, nothing */
        const bells=BK.props().filter(p=>p.t==='tbell'&&p.guard); const b0=bells[0];
        G.x=b0.x+20; G.mode='walk'; G.ward=0; G.open=0; b0.cool=0; b0.tollT=0; let res=BK.tg().note(b0); r.noteIn=res.res; r.open=G.open>0&&G.mode==='stagger';
        const hp0=G.hp; BK.tp(Math.floor(G.x/16)-2,fy); BK.sim(2); P().face=1; G.hp=hp0;
        BK.sim(Math.round((G.open+0.2)*60)); r.ward=G.ward>0&&G.open===0; res=BK.tg().note(b0); r.noteWard=res.res; r.openAfterWard=G.open>0;
        BK.sim(Math.round((G.ward+0.2)*60)); G.x=b0.x+TG.bellRx+40; G.mode='walk'; res=BK.tg().note(b0); r.noteFar=res.res; r.openFar=G.open>0;
        /* the toll sets the bells swinging: a strike on a swinging bell is turned (main.js updateMonkProps) */
        G.mode='tollTell'; G.modeT=0; BK.sim(2); r.swing=b0.tollT>0;
        /* THE BLOCKS ARE AMMO: take one (INTERACT), throw it (ATTACK) at it */
        BK.sim(150); G.ward=0; G.open=0; G.mode='walk'; G.x=46*16; for(const k of ['raiseT','stompT','sweepT','throwT','tollT','hurlT'])G[k]=99;
        G.mode='raiseTell'; G.modeT=0; BK.sim(3); G.mode='walk'; G.modeT=99; const sb=BK.tg().standing().sort((a,c)=>a.tx-c.tx)[0];
        r.ammo=!!sb; if(sb){ BK.tp(sb.tx-1,fy); P().face=1; BK.sim(2); r.took=BK.tg().take(P()); r.carry=!!(P().carry&&P().carry.t==='tgblock');
          P().face=Math.sign(G.x-P().x)||1; G.x=P().x+P().face*72; BK.tg().throwIt(); let f=0; for(;f<120&&!(G.open>0);f++)BK.sim(1); r.thrownStagger=G.open>0&&G.openBy==='throw'; }
        /* the damage: outside its opening x take, inside x open (one blow each, the same blow) */
        G.open=0; G.ward=0; G.mode='walk'; let h=G.hp; BK.tg().hurt(G, 20, P().x); r.dmgOut=h-G.hp; G.open=2; G.mode='stagger'; G.modeT=2; h=G.hp; BK.tg().hurt(G, 20, P().x); r.dmgIn=h-G.hp;
        /* hurt, it hurls: a quarter broken with a block standing */
        G.open=0; G.mode='walk'; G.modeT=0; G.ward=0; G.raiseT=0; BK.sim(80); G.hp=Math.floor(G.maxHp*0.74); G.modeT=0; let lifted=false, flew=false; for(let f=0;f<240;f++){BK.sim(1); const bs=BK.tg().blocks; if(bs.some(b=>b.state==='lift'))lifted=true; if(bs.some(b=>b.state==='fly'&&b.by==='golem'))flew=true;} r.hurl=lifted&&flew;
      }
      return R;})()`, 600000);
    for (const [hero, r] of Object.entries(out)) {
      ok(r.awake, hero + ': it wakes when you walk into its hall');
      ok(r.raised >= 1 && r.raisedSolid, hero + ': it raises blocks, and they are solid (' + r.raised + ')');
      ok(r.drops.length && r.drops.every(d => d === 'on'), hero + ': dropped on a raised block, you land ON it (' + r.drops.join(' ') + ')');
      ok(r.sides.length && r.sides.every(d => d === 'stopped'), hero + ': walking into a raised block stops you (' + r.sides.join(' ') + ')');
      ok(r.unstick, hero + ': a hero inside a block is lifted out on top');
      ok(r.onHero === false, hero + ': no block rises on a hero');
      ok(r.noteIn === 'stagger' && r.open, hero + ': a hall bell struck with it in reach staggers it (' + r.noteIn + ')');
      ok(r.ward && r.noteWard === 'ward' && !r.openAfterWard, hero + ': its told ward turns the next note (' + r.noteWard + ')');
      ok(r.noteFar === 'far' && !r.openFar, hero + ': out of the bell\'s reach the note does nothing (' + r.noteFar + ')');
      ok(r.swing, hero + ': its toll sets the hall bells swinging');
      ok(r.ammo && r.took && r.carry, hero + ': INTERACT takes a raised block');
      ok(r.thrownStagger, hero + ': its own block, thrown at it, staggers it');
      ok(r.dmgOut > 0 && Math.abs(r.dmgOut / r.dmgIn - TG.take / TG.open) < 0.12, hero + ': a blade lands at ' + TG.take + ' outside, ' + TG.open + ' inside its opening (' + r.dmgOut + ' / ' + r.dmgIn + ')');
      ok(r.hurl, hero + ': hurt, it hurls a block at you');
    }
    if (pg.errors.length) ok(false, 'page errors: ' + pg.errors.slice(0, 3).join(' | '));
  } finally { pg.close(); }
}
for (const m of fails) console.log('FAIL ' + m);
console.log('temple-guardian: ' + oks.length + ' ok, ' + fails.length + ' failed');
if (fails.length) process.exit(1);
