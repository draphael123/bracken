// tools/duelproofs-shots.mjs - LOOKS-ONLY browser proof for the duel arenas + duel foes slices (claude/duelarenas-d, 11-12 desktop).
// Stills -> $SHOTS (default C:/Users/danie/Projects/desktop-stills/duelproofs). Both flags ON (?duelarenas=1&duelfoes=1) unless noted OFF.
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const OUT = process.env.SHOTS || 'C:/Users/danie/Projects/desktop-stills/duelproofs';
mkdirSync(OUT, { recursive: true });
const fails = [];
const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails.push(m); };

async function run(flagsOn) {
  const pg = await openPage({ audio: false, fonts: true, seed: 11, duelArenas: flagsOn, duelFoes: flagsOn });
  const E = (e, ms) => pg.evalp(e, ms);
  const shot = async n => { await E('BK.draw1()'); const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(OUT, n + '.png'), Buffer.from(r.result.data, 'base64')); console.log('shot ' + n); };
  await E(`(()=>{BK.manualSimulation=true;window.__P=n=>BK.players()[n-1];
    window.__fresh=async()=>{for(const k in BK.keys)BK.keys[k]=false;BK.coopEnd();BK.reset({fresh:true});BK.tavern.record(null);BK.tavern.p1Pad(null);await BK.tavern.enter();BK.sim(10);return BK.state;};
    window.__st=id=>BK.tavern.debug().stations.find(s=>s.id===id);
    window.__atPit=()=>{const s=__st('arena');const p=__P(1);for(let i=0;i<60;i++){p.x=s.x;p.y=20*16;p.vx=p.vy=0;p.face=1;BK.sim(1);}};
    window.__roster=()=>BK.duel().D.roster.state();return 1;})()`);

  async function openRosterFor(arenaId, goblins) {
    await E('__fresh()');
    const patch = { teams: false, friendlyFire: false, seats: [{ hero: 'knight' }, { isBot: true, hero: 'warden', botDifficulty: 'normal' }] };
    if (goblins) patch.goblins = goblins;
    if (arenaId) patch.arena = arenaId;
    await E(`(()=>{try{localStorage.removeItem("bracken.duelSettings")}catch(e){}BK.duel().D.setSettings(${JSON.stringify(patch)});})()`);
    await E('(()=>{__atPit();BK.press("talk");BK.sim(5);})()');
    const s = await E('__roster()');
    ok(s.open, (flagsOn ? 'ON ' : 'OFF ') + 'roster opens (arena=' + arenaId + ' goblins=' + goblins + ')');
    return s;
  }

  if (flagsOn) {
    // --- RULES tab: ARENA / GOBLINS(MANY) / FRIENDLY FIRE rows (all rows drawn each time; only the selection + plain-words line differ) ---
    await openRosterFor('stockade', 'many');
    await E('(()=>{window.__textRec=[];BK.duel().D.roster.R.tab=1;BK.duel().D.roster.R.rrow=0;BK.sim(2);BK.draw1();})()');
    await shot('rules-tab-arena-row');
    let rec = await E('window.__textRec.filter(r=>/THE STOCKADE|RANDOM - ONE/.test(r.s||"")).map(r=>({s:r.s,w:r.w,size:r.size}))');
    console.log('textrec(arena-row):', JSON.stringify(rec));

    await E('(()=>{window.__textRec=[];BK.duel().D.roster.R.rrow=8;BK.sim(2);BK.draw1();})()');
    await shot('rules-tab-goblins-many-row');
    rec = await E('window.__textRec.filter(r=>/GOBLINS/.test(r.s||"")).map(r=>({s:r.s,w:r.w,size:r.size}))');
    console.log('textrec(goblins-many-row):', JSON.stringify(rec));

    await E('(()=>{window.__textRec=[];BK.duel().D.roster.R.rrow=9;BK.sim(2);BK.draw1();})()');
    await shot('rules-tab-friendlyfire-row');
    rec = await E('window.__textRec.filter(r=>/FRIENDLY/.test(r.s||"")).map(r=>({s:r.s,w:r.w,size:r.size}))');
    console.log('textrec(friendlyfire-row):', JSON.stringify(rec));

    // GOBLINS=FEW plain-words line, the exact string the brief checks
    await E('(()=>{BK.duel().D.setSettings({goblins:"few"});BK.duel().D.roster.R.rrow=8;window.__textRec=[];BK.sim(2);BK.draw1();})()');
    await shot('rules-tab-goblins-few-row');
    rec = await E('window.__textRec.filter(r=>/GOBLINS/.test(r.s||"")).map(r=>({s:r.s,w:r.w,size:r.size}))');
    console.log('textrec(goblins-few-row):', JSON.stringify(rec));
    await E('BK.duel().D.roster.close()');
  }

  // --- per-arena: count banner naming the arena, then round-start still with 2 seats ---
  const arenas = flagsOn ? ['stockade', 'rootway', 'kitchen', 'pit'] : ['pit'];
  for (const id of arenas) {
    await openRosterFor(flagsOn ? id : undefined, flagsOn ? 'many' : undefined);
    await E(`(()=>{const R=BK.duel().D.roster;R.pick(__P(1), R.R.cur.get(1).idx);BK.sim(2);})()`);
    const rs = await E('__roster()');
    ok(rs.fightT > 0, 'seat 1 readies and raises the FIGHT countdown (arena=' + id + ')');
    await E('(()=>{for(let i=0;i<500 && !(BK.duel().D.debug().m && BK.duel().D.debug().m.phase==="count");i++)BK.sim(1);})()');
    let d = await E('BK.duel().D.debug()');
    ok(d.on, 'match began for arena=' + id);
    await shot((flagsOn ? 'arena-' + id : 'arena-pit-FLAGOFF') + '-count-banner');
    // skip the countdown directly (game speed is pinned at 0.6x: a real wait took 400+ sim frames) then run to the fight phase
    await E('(()=>{const D=BK.duel().D;if(D.st.m)D.st.m.t=0.05;})()');
    await E('(()=>{for(let i=0;i<120 && BK.duel().D.debug().m.phase!=="fight";i++)BK.sim(1);})()');
    d = await E('BK.duel().D.debug()');
    ok(d.m && d.m.phase === 'fight', 'round goes live for arena=' + id);
    await shot((flagsOn ? 'arena-' + id : 'arena-pit-FLAGOFF') + '-roundstart');
  }

  pg.close();
}

await run(true);
await run(false);
console.log(fails.length ? ('FAIL x' + fails.length) : 'ALL OK');
process.exit(fails.length ? 1 : 0);
