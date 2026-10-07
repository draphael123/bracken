// tools/level-jump.mjs - THE PLAYTEST LEVEL JUMP (claude/theatre, THEATRE2; docs/PLAYTEST.md): ?level=<id>[&hero=<id>] starts any level from its own
// entrance, and never writes a save. In the page, with a real save in storage: the URL lands in play on that level at its START with the hero asked for
// (and at full health, no god mode); a bad id leaves the title alone; and after the level is run to its gate the save is byte-identical.
import { openPage } from './cdp.mjs';
import { LEVELS } from '../src/level.js';
import { campaignLevel } from './boss-level.mjs';
import { beatenBefore, tonicsAt, charmAt } from './level-walk.mjs';
import { depthsOf } from '../src/campaign-order.js';
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
    BK.manualSimulation = true; BK.god = true;
    if (L.gateAfterBoss) { const A = L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); BK.sim(150); const e = BK.boss; if (e) { e.hp = 1; e.mode = 'downed'; e.modeT = 3; BKT.hurtEnemy(e, 99, e.x - 10, false); } for (let i = 0; i < 400 && BK.bossActive; i++) BK.sim(1); for (let i = 0; i < 300 && !L.gateOpen; i++) BK.sim(1); }   /* the theatre's gate opens when THE PUPPETEER falls (gateAfterBoss): he is put down on his stage first, as in tools/puppeteer.mjs */
    BK.god = false;
    const g = L.ents.find(e => e.t === 'gate'); BK.tp(g.x - 1, g.y);   /* one column off the gate, outside his arena wall */ for (let i = 0; i < 400 && BK.state === 'play'; i++) { BK.keys.right = true; BK.sim(1); } BK.keys.right = false; for (let i = 0; i < 300; i++) BK.sim(1);
    o.after = BK.state; return o; })()`, 120000);
  ok(r.state === 'play' && r.theatre, '?level=theatre did not land in play on the theatre: ' + JSON.stringify(r));
  ok(r.hero === 'pyro', '&hero=pyro was not taken: ' + r.hero);
  ok(r.hp === r.maxHp && r.maxHp > 0 && r.god === false, 'not at full health, or god mode is on');
  ok(Math.abs(r.at[0] - r.start[0]) <= 1 && Math.abs(r.at[1] - r.start[1]) <= 1, 'not at the level\'s entrance: at ' + r.at + ', START ' + r.start);
  ok(r.after !== 'play', 'the level did not end at its gate (the check proves nothing about the save): ' + r.after);
  ok((await store()) === s0, 'THE SAVE CHANGED after a ?level= run to the gate');
  /* &campaign=1 (claude/levelpilot): the hero as a player arriving - the walker's kit (src/campaign-kit.js), still no save */
  const DEPTH = depthsOf(LEVELS);
  for (const id of ['marsh', 'causeway']) {
    await nav('/?level=' + id + '&campaign=1&hero=knight'); const c0 = await store();
    for (let i = 0; i < 200 && (await pg.evalp('BK.state', 3000)) !== 'play'; i++) await sleep(100);
    const d = DEPTH[id] ?? 1; const k = await pg.evalp(`(async()=>{ const BEATEN = ${JSON.stringify(beatenBefore(id))}; const P = BK.P, PG = BKT.PROG; BK.manualSimulation = true; for (let i = 0; i < 120; i++) BK.sim(1);
      return { state: BK.state, lvl: BKT.heroLevel(), hp: P.hp, maxHp: P.maxHp, god: BK.god, tag: BK.campaignTag, loadout: (PG.loadouts && PG.loadouts.knight) || [], items: Object.keys(PG.items || {}).filter(k => PG.items[k]), tonics: PG.tonics, charm: PG.charm, flasks: BK.flasks(), flaskMax: BK.flaskMax(), hero: PG.hero, wantItems: BK.UPGRADES.filter(u => !u.consumable && (u.needs ? BEATEN.includes(u.needs) : ${d >= 2})).map(u => u.id) }; })()`, 30000);
    const want = campaignLevel(id);
    ok(k.state === 'play', '?level=' + id + '&campaign=1 did not land in play: ' + JSON.stringify(k));
    ok(k.lvl === want, id + ': campaign hero is L' + k.lvl + ', the walkers campaignLevel is L' + want);
    ok(k.hp === k.maxHp && k.god === false, id + ': not at full health, or god mode on');
    ok(/^CAMPAIGN L/.test(k.tag) && k.tag.indexOf('L' + want + ' ') > 0, id + ': no CAMPAIGN line: ' + k.tag);
    ok(k.loadout.length > 0, id + ': no skills in the slots');
    ok(JSON.stringify(k.items.slice().sort()) === JSON.stringify(k.wantItems.slice().sort()), id + ': smith gear ' + k.items + ' want ' + k.wantItems);
    ok(k.tonics === tonicsAt(d) && k.charm === charmAt(d), id + ': tonics/charm ' + k.tonics + '/' + k.charm + ' want ' + tonicsAt(d) + '/' + charmAt(d));
    ok(k.flasks === k.flaskMax && k.flaskMax > 0, id + ': flasks ' + k.flasks + '/' + k.flaskMax);
    ok((await store()) === c0, 'THE SAVE CHANGED after ?level=' + id + '&campaign=1');
    console.log('  ' + id + ' campaign: L' + k.lvl + ' ' + k.hp + 'hp ' + k.loadout.join('+') + ' gear[' + k.items.join(',') + '] tonics ' + k.tonics + ' charm ' + k.charm + ' flasks ' + k.flasks + ' tag "' + k.tag + '"');
  }
  await nav('/?level=nosuchlevel'); const bad = await pg.evalp('BK.state', 5000); ok(bad !== 'play', 'a bad ?level= id started a level: ' + bad);
} finally { pg.close(); }
if (fails.length) { console.log('level-jump: ' + fails.length + ' failure(s)\n  ' + fails.join('\n  ')); process.exitCode = 1; }
else console.log('ok  level-jump  ?level=theatre&hero=pyro lands in play at the entrance, at full health, no god mode; run to the gate, the save is byte-identical; a bad id starts nothing');
