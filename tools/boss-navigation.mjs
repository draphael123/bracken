import assert from 'node:assert/strict';
import {openPage} from './cdp.mjs';
const pg=await openPage({audio:false,fonts:false});
try {
  for (const [lvl,h] of [['reef','warden'],['longwater','reaper'],['flotilla','knight'],['canal','knight'],['theatre','knight']]) {
    await pg.reload();
    const result=await pg.evalp(`(async()=>{
      BK.manualSimulation=true;let seed=1919;${lvl==='theatre'?"(await import('/src/puppeteer.js')).PLAN.goLoft=1;{const P0=BKT.PROG;BKT.setHeroLevel('knight',22);P0.skillOwned.knight={};P0.loadouts.knight=[];if(P0.talents)P0.talents.knight={};}":""}
      Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
      const grounded=new Set();let loft=false,walk=0,swam=0;
      const r=await BK.bossLab({bosses:[${JSON.stringify(lvl)}],heroes:[${JSON.stringify(h)}],maxSecs:${lvl==='theatre'?300:lvl==='longwater'?240:180},modes:true,onFrame:({P,boss})=>{if(P.ground&&Math.abs(P.y-boss.y)<3)grounded.add(boss.phase);const st=BK.L.arena&&BK.L.arena.stage;if(st&&P.ground&&Math.abs(P.y-st.gallery)<3)loft=true;const lk=BK.L.arena&&BK.L.arena.lock;if(lk){if(P.ground&&P.onMover&&P.onMover.leRaft)walk++;if(P.swim)swam++;}}});
      return {row:r.rows[0],groundedPhases:[...grounded],loft,walk,swam};
    })()`);
    const row=result.row;
    /* (claude/dkhero, batch75: a rules change - the Death Knight's ward now cuts the last 0.25 s of his swing, so the legacy bot, which wards through its swings, kills THE HERALD in 206 s where it took 156: the longwater row has 240 s; the assert is the same) */
    if(lvl==='flotilla') assert.deepEqual(result.groundedPhases,[1,2,3],'the pilot must stand on each fighting deck, not just jump within sword range');
    /* THE PUPPETEER: the pilot takes the hard way only on a roll (PLAN.goLoft per cycle), so this row pins the roll to 1: the question is whether it CAN ride the batten and stand on the gallery through ordinary inputs, not whether a seed happens to roll it (claude/integ51: in the theatre the seed-1919 fight won in 71 s without a roll) */
    /* (claude/theatre3, a rules change: the Puppeteer is opened only by climbing to the gallery and cutting his slack bar, x0.05 outside it; a FRESH level-1 knight
       walks too slowly to make the 12 s slack bar from the stage and needs 7+ cycles (300 s and more on seed 1919). This row's knight is the theatre's campaign
       depth (level 22, no skills: as tools/combat-pilots.mjs and the mash bot), the time and the asserts are the same as every row) */
    /* (claude/puppeteer2, a rules change: THE PUPPETEER is a 2-3 minute fight now - three to five visits up the batten, Daniel's brief - so the theatre row has 300 s, as tools/puppeteer.mjs's bot row; every other row keeps 180 s) */
    if(lvl==='theatre') assert.ok(result.loft,'THE PUPPETEER: the pilot must ride the batten up and stand on the fly gallery (claude/puppeteer)');
    if(lvl==='canal') assert.ok(result.walk>60,'THE LANTERN-EATER (claude/lanterneater; Jenny Greenteeth's raft before it, claude/canal4): the pilot must fight it on the raft: '+JSON.stringify({walk:result.walk}));
    assert.equal(row.killed,true,`${h} must reach and finish ${lvl} through ordinary inputs`);
    assert.ok(row.damage.other>row.damage.plunge,'ordinary attacks must remain the majority of credited damage');
    if(lvl==='reef') assert.ok(row.modes.stuck>0,'evading the bite must create a genuine stuck-jaw opening');
    assert.deepEqual(pg.errors,[]);
    console.log(JSON.stringify(row));
  }
} finally {pg.close();}
