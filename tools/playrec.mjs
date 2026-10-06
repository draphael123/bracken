/* tools/playrec.mjs - THE PLAYTEST RECORDER, checked (claude/bot2; src/playrec.js). Asserts the four promises it makes Daniel:
   1. OFF BY DEFAULT: a fresh page records nothing and draws no REC.
   2. ON, it logs a whole boss fight: the boss, the hero and level, the time, the outcome, the blows that hurt (by foe and move), the hits
      landed, the openings, and what is left of the boss - here one fight of the Bullfrog King driven by the boss lab's own hands.
   3. NOTHING GOES OVER THE NETWORK: every request the page makes while it records is a file of the game itself (same origin, GET).
   4. The log is a FILE the player saves: F9 builds a download (a blob: link), it is never posted.
     PORT=8644 node tools/playrec.mjs */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const reqs = [];
const pg = await openPage({ audio: false, fonts: false, onEvent: m => { if (m.method === 'Network.requestWillBeSent') reqs.push({ url: m.params.request.url, method: m.params.request.method }); } });
try {
  const off = await pg.evalp(`(async()=>{localStorage.removeItem('bracken.rec');localStorage.removeItem('bracken.playrec');const M=await import('/src/playrec.js');M.REC.init('');return {on:M.REC.on,log:M.REC.log().length};})()`);
  assert.equal(off.on, false, 'the recorder must be OFF by default'); assert.equal(off.log, 0);
  await pg.reload();   /* (a reload clears the page's storage: cdp.mjs) */
  const PORT = new URL(await pg.evalp('location.href')).port;
  const r = await pg.evalp(`(async()=>{const M=await import('/src/playrec.js');M.REC.init('?rec=1');if(!M.REC.on||localStorage.getItem('bracken.rec')!=='1')return {on:false};BK.manualSimulation=true;
    const o=await BK.bossLab({bosses:['marsh'],heroes:['knight'],maxSecs:150,healthMode:'normal',seed:3});BK.sim(2);   /* the game's next frames, where the recorder sees how it ended (the lab stops on the frame he falls) */
    const log=M.REC.log();let dl=null;const a0=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){dl={href:this.href,name:this.download};};
    try{M.REC.key({key:'F9',shiftKey:false,ctrlKey:false});}finally{HTMLAnchorElement.prototype.click=a0;}
    return {on:true,row:o.rows[0],log,dl};})()`, 900000);
  assert.ok(r.on, '?rec=1 turns it on, and remembers it');
  assert.ok(r.log.length >= 1, 'a boss fight was logged: ' + JSON.stringify(r.log).slice(0, 200));
  const F = r.log[r.log.length - 1]; if (process.env.SHOW) console.log(JSON.stringify(r.log).slice(0, 1500));
  for (const k of ['boss', 'level', 'hero', 'heroLevel', 't', 'real', 'outcome', 'hurt', 'blows', 'hits', 'dealt', 'openings', 'skills', 'bossLeftPct', 'taken']) assert.ok(k in F, 'the fight row has ' + k);
  assert.equal(F.boss, 'frog'); assert.equal(F.level, 'marsh'); assert.equal(F.hero, 'knight');
  assert.ok(F.hits > 0 && F.dealt > 0, 'hits landed are counted');
  assert.ok(['win', 'death', 'trade', 'left'].includes(F.outcome), 'an outcome: ' + F.outcome);
  assert.equal(F.outcome === 'win' || F.outcome === 'trade', r.row.outcome === 'win' || r.row.outcome === 'trade', 'the outcome agrees with the fight (' + F.outcome + ' / ' + r.row.outcome + ')');
  if (r.row.health.damageTaken > 0) assert.ok(F.taken > 0 && Object.keys(F.hurt).length > 0, 'the blows that hurt are logged by foe and move');
  assert.ok(!JSON.stringify(F).match(/@|password|email|token/i), 'no personal data in a row');
  assert.ok(r.dl && r.dl.href.startsWith('blob:') && /^bracken-playtest-.*\.json$/.test(r.dl.name), 'F9 makes a local file download: ' + JSON.stringify(r.dl));
  const away = reqs.filter(q => { try { const u = new URL(q.url); return !(u.protocol === 'blob:' || u.protocol === 'data:' || (q.method === 'GET' && ((u.hostname === 'localhost' && u.port === PORT) || /^fonts.(googleapis|gstatic).com$/.test(u.hostname)) && !/rec|playtest/i.test(u.search)));   /* (the page's own files, and the font stylesheet index.html links) */ } catch { return true; } });
  assert.deepEqual(away, [], 'nothing leaves the page: ' + JSON.stringify(away.slice(0, 3)));
  await pg.evalp(`localStorage.removeItem('bracken.rec');localStorage.removeItem('bracken.playrec');true`);
  console.log('playrec: off by default; one fight logged (' + F.boss + ' ' + F.outcome + ', ' + F.t + ' s, ' + F.hits + ' hits, ' + F.taken + ' taken from ' + Object.keys(F.hurt).length + ' moves); F9 = a local file; ' + reqs.length + ' requests, all the game\'s own');
} finally { pg.close(); }
