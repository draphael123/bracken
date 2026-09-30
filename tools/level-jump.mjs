// tools/level-jump.mjs - THE PLAYTEST LEVEL JUMP (claude/theatre, THEATRE2; docs/PLAYTEST.md): ?level=<id>[&hero=<id>] starts any level from its own
// entrance, and never writes a save. In the page, with a real save in storage: the URL lands in play on that level at its START with the hero asked for
// (and at full health, no god mode); a bad id leaves the title alone; and after the level is run to its gate the save is byte-identical.
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false }); const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SAVE = { hero: 'knight', heroes: { knight: true }, wood: { cleared: true, medal: 2 } };
async function nav(url) {
  await pg.evalp('(()=>{localStorage.clear();localStorage.setItem("bracken.progress.0",' + JSON.stringify(JSON.stringify(SAVE)) + ');window.__gone=1;setTimeout(()=>location.assign(' + JSON.stringify(url) + '),0);return 1})()', 8000).catch(() => {});
  const search = url.replace(/^[^?]*/, '');
  for (let i = 0; i < 400; i++) { await sleep(150); const r = await pg.evalp('!window.__gone&&typeof window.BK==="object"&&!!window.BK.lookPass&&location.search===' + JSON.stringify(search), 3000).catch(() => false); if (r) return; }
  throw new Error('page never came up on ' + url);
}
const store = () => pg.evalp('JSON.stringify(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)]))', 8000);
try {
  await nav('/?level=theatre&hero=pyro'); const s0 = await store();
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const L = BK.L, P = BK.P;
    const o = { state: BK.state, id: LEVELS.findIndex(l => l.build && L && l.id === 'theatre'), theatre: !!(L && L.theatre), hero: BK.PROG.hero, hp: P.hp, maxHp: P.maxHp, god: BK.god,
      at: [Math.floor(P.x / 16), Math.floor((P.y - 1) / 16)], start: [L.START.x, L.START.y] };
    BK.manualSimulation = true; if (L.gateAfterBoss) L.gateOpen = true;   /* the theatre's gate opens when THE PUPPETEER falls (gateAfterBoss): this check is about the save, not the fight, so the gate is opened by hand */
    const g = L.ents.find(e => e.t === 'gate'); BK.tp(g.x - 2, g.y); for (let i = 0; i < 400 && BK.state === 'play'; i++) { BK.keys.right = true; BK.sim(1); } BK.keys.right = false; for (let i = 0; i < 300; i++) BK.sim(1);
    o.after = BK.state; return o; })()`, 120000);
  ok(r.state === 'play' && r.theatre, '?level=theatre did not land in play on the theatre: ' + JSON.stringify(r));
  ok(r.hero === 'pyro', '&hero=pyro was not taken: ' + r.hero);
  ok(r.hp === r.maxHp && r.maxHp > 0 && r.god === false, 'not at full health, or god mode is on');
  ok(Math.abs(r.at[0] - r.start[0]) <= 1 && Math.abs(r.at[1] - r.start[1]) <= 1, 'not at the level\'s entrance: at ' + r.at + ', START ' + r.start);
  ok(r.after !== 'play', 'the level did not end at its gate (the check proves nothing about the save): ' + r.after);
  ok((await store()) === s0, 'THE SAVE CHANGED after a ?level= run to the gate');
  await nav('/?level=nosuchlevel'); const bad = await pg.evalp('BK.state', 5000); ok(bad !== 'play', 'a bad ?level= id started a level: ' + bad);
} finally { pg.close(); }
if (fails.length) { console.log('level-jump: ' + fails.length + ' failure(s)\n  ' + fails.join('\n  ')); process.exitCode = 1; }
else console.log('ok  level-jump  ?level=theatre&hero=pyro lands in play at the entrance, at full health, no god mode; run to the gate, the save is byte-identical; a bad id starts nothing');
