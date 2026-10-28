// tools/powder-monkey.mjs - THE POWDER MONKEY (claude/flotilla4, src/powder-monkey.js; scratch/brief-flotilla4-1027.md item 4). Node part + one page.
//   NODE: the module's numbers are sane (small and quick: his box under the big pirates', low health, a told windup, a fuse longer than its flight, the teach fuse longer);
//         the Flotilla places him 3 times (the first, the TEACH, alone on the Powder Ship's forecastle with the shrine behind and a sign at the point of use) and THE
//         HURRICANE DECK 1-2 times; every placement stands on a deck.
//   PAGE (flotilla): he sees you, tells '!!' and LOBS; the first grenade of the level is the TEACH (the long fuse); STRUCK BACK it meets him and he goes down (a body
//         that goes down, src/main.js spawnCorpse's common fall); unstruck it goes off and costs the hero; struck while he holds it lit he DROPS it; a struck grenade's blast
//         fires a DECK GUN in reach and sets off a POWDER KEG; a grenade in the harbour goes out. (hurricane) his grenade is lobbed on her deck too.
// usage: PORT=6616 node tools/powder-monkey.mjs [--node]
import { openPage, ROOT } from './cdp.mjs';
import { pathToFileURL } from 'url';
import { join } from 'path';
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const imp = p => import(pathToFileURL(join(ROOT, p)).href);
const { PM } = await imp('src/powder-monkey.js');
const { LEVELS } = await imp('src/level.js');
ok(PM.h <= 14 && PM.w <= 9, 'he is SMALL: ' + PM.w + 'x' + PM.h + ' (the big pirates are 10-12 x 18-25)');
ok(PM.hp <= 30 && PM.speed >= 90, 'low health (' + PM.hp + ') and quick (' + PM.speed + ' px/s)');
ok(PM.lightTell >= 0.6, 'the lob is told ' + PM.lightTell + ' s');
ok(PM.fuse > PM.lobT + 1 && PM.teachFuse > PM.fuse && PM.kickFuse >= 1, 'the fuse outlasts the flight (' + PM.fuse + ' > ' + PM.lobT + ' + 1), the teach fuse is longer (' + PM.teachFuse + '), a struck one never goes at your feet (' + PM.kickFuse + ')');
for (const [id, lo, hi] of [['flotilla', 2, 3], ['hurricane', 1, 2]]) { const L = LEVELS.find(l => l.id === id).build(), ms = L.ents.filter(e => e.t === 'powdermonkey');
  ok(ms.length >= lo && ms.length <= hi, id + ': ' + ms.length + ' powder monkeys placed (' + lo + '-' + hi + ')');
  for (const m of ms) { const under = L.grid[(m.y + 1) * L.W + m.x], at = L.grid[m.y * L.W + m.x]; ok(under !== 0 && at === 0, id + ' monkey at ' + m.x + ',' + m.y + ' stands on a deck'); }
  if (id === 'flotilla') { const first = ms.slice().sort((a, b) => a.x - b.x)[0], foes = L.ents.filter(e => ['cutlass', 'netter', 'sapper', 'bosun', 'marine', 'boarder', 'grapnel', 'lookout', 'manta', 'petrel'].includes(e.t) && Math.abs(e.x - first.x) < 14 && Math.abs(e.y - first.y) < 8);
    const sign = L.ents.find(e => e.t === 'sign' && Math.abs(e.x - first.x) < 12 && /GRENADE/.test(e.text || '')), shrine = L.ents.filter(e => e.t === 'check' && e.x < first.x).sort((a, b) => b.x - a.x)[0];
    ok(!foes.length, 'the TEACH monkey (' + first.x + ') stands alone: ' + foes.map(e => e.t + '@' + e.x).join(',')); ok(!!sign, 'a sign at the point of use names the answer'); ok(shrine && first.x - shrine.x < 20, 'a shrine just behind him (' + (shrine && shrine.x) + ')'); } }
if (!process.argv.includes('--node')) {
  const pg = await openPage({ audio: false });
  try {
    const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const out = {}; const li = LEVELS.findIndex(l => l.id === 'flotilla');
      BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); const go = n => { for (let i = 0; i < n; i++) { if (BK.state !== 'play') BK.state = 'play'; BK.sim(1); } };
      const H = BK.powderMonkeys(), mk = () => BK.enemies().filter(e => e.t === 'powdermonkey').sort((a, b) => a.x - b.x);
      const fresh = () => { BK.load(li); BK.state = 'play'; BK.god = true; go(2); };
      /* 1. the teach: he lobs, the first is long; struck back it meets him */
      fresh(); out.n = mk().length; const m = mk()[0]; BK.tp(397, 23); BK.P.face = 1; let q = null, sawTell = false;
      for (let i = 0; i < 600 && !q; i++) { go(1); if (m.mode === 'lightTell') sawTell = true; q = H.grenades()[0] || null; }
      out.lob = { sawTell, got: !!q, teach: q && q.teach, fuse: q && +q.fuse.toFixed(2) };
      for (let i = 0; i < 200 && q && !q.ground; i++) go(1);
      if (q) { BK.P.x = q.x - 10; BK.P.face = 1; BK.P.hitSet = new Set(); H.strike({ l: q.x - 8, r: q.x + 8, t: q.y - 14, b: q.y + 2 }); out.kicked = q.kicked; const c0 = BK.corpses().length;
        for (let i = 0; i < 240 && m.alive; i++) go(1); out.killed = !m.alive; out.body = BK.corpses().slice(c0).filter(c => c.body).map(c => c.t + ':' + c.fall).join(','); }
      /* 2. unstruck, his grenade costs the hero */
      fresh(); BK.god = false; BK.P.hp = BK.P.maxHp; const m2 = mk()[0]; BK.tp(397, 23); BK.P.face = 1; const hp0 = BK.P.hp; let boomed = false, mine = null;
      for (let i = 0; i < 900 && !boomed; i++) { BK.P.vx = 0; go(1); if (!mine) mine = H.grenades()[0] || null; if (mine) out.flew = true; if (mine && !H.grenades().includes(mine)) boomed = true; }
      out.cost = { boomed, hp0, hp: BK.P.hp }; BK.god = true;
      /* 3. struck while he holds it lit: he drops it */
      fresh(); const m3 = mk()[0]; BK.tp(397, 23); for (let i = 0; i < 600 && m3.mode !== 'lightTell'; i++) go(1);
      if (m3.mode === 'lightTell') { BK.env().hurt(m3, 1, m3.x - 10); m3.stagger = Math.max(m3.stagger || 0, 0.3); go(20); out.drop = H.grenades().some(g => g.dropped); }
      /* 4. a struck grenade's blast fires a deck gun in reach and sets off a keg */
      fresh(); const gun = BK.props().find(p => p.t === 'cannon' && p.deck && Math.abs(p.x / 16 - 398) < 2), keg = BK.props().find(p => p.t === 'keg' && !p.gone && Math.abs(p.x / 16 - 428) < 2);
      H.add({ x: gun.x + 6, y: gun.y, fuse: 0.05, kicked: true, ground: true }); H.add({ x: keg.x + 8, y: keg.y, fuse: 0.05, kicked: true, ground: true });
      go(30); out.gun = gun.cool > 0; out.keg = !!keg.gone;
      /* 5. in the harbour it goes out */
      fresh(); const wq = H.add({ x: 215 * 16, y: 31 * 16, fuse: 2 }); go(30); out.wet = !H.grenades().includes(wq);
      /* 6. the hurricane: he lobs on her deck */
      const lh = LEVELS.findIndex(l => l.id === 'hurricane'); BK.load(lh); BK.state = 'play'; BK.god = true; go(2); const mh = mk()[0]; out.hn = mk().length;
      BK.tp(Math.round(mh.x / 16) - 7, Math.round(mh.y / 16) - 1); let qh = null; for (let i = 0; i < 900 && !qh; i++) { go(1); qh = H.grenades()[0] || null; } out.hlob = !!qh;
      return out; })()`, 600000);
    console.log('  ' + JSON.stringify(r));
    ok(r.n === 3, 'the flotilla spawns 3 powder monkeys');
    ok(r.lob.sawTell && r.lob.got, 'he tells (!!, lightTell) and lobs a grenade at you');
    ok(r.lob.teach && r.lob.fuse >= PM.teachFuse, 'the first grenade of the level is the TEACH (fuse ' + r.lob.fuse + ')');
    ok(r.kicked && r.killed, 'struck back, it meets him and he goes down');
    ok(/powdermonkey:tip/.test(r.body || ''), 'his body goes down (' + r.body + ')');
    ok(r.cost.boomed && r.cost.hp < r.cost.hp0, 'unstruck, it goes off and costs the hero (' + r.cost.hp0 + ' -> ' + r.cost.hp + ')');
    ok(r.drop, 'struck while he holds it lit, he drops it at his feet');
    ok(r.gun, 'a struck grenade\'s blast fires the deck gun in reach');
    ok(r.keg, 'and sets off the powder keg');
    ok(r.wet, 'a grenade in the harbour goes out');
    ok(r.hn >= 1 && r.hlob, 'the hurricane: ' + r.hn + ' placed, and he lobs on her deck');
    if (pg.errors.length) { bad++; console.log('  FAIL page errors: ' + pg.errors.slice(0, 3).join(' | ')); }
  } finally { await pg.close(); }
}
console.log(bad ? bad + ' FAILED  powder-monkey' : 'ok  powder-monkey');
process.exit(bad ? 1 : 0);
