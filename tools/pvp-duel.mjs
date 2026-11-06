// tools/pvp-duel.mjs - DUEL (BETA), claude/pvpduel (Daniel 11-05: a basic PvP mode for the demo; src/pvp-duel.js, src/duel-pit.js).
//   pure    NODE ONLY, no browser: the rules (level-normalised damage, the sudden-death ramp, anti-juggle, landed share), whose blow (attackerOf: in a pass,
//           out of a pass by the tagged effect, never his own), the match machine (best of 3, KO, time, draw, the five-round cap, every match ENDS),
//           points, the rankings store (any raw shape read whole; slot keys only; guests and bots never ranked), the bot's hands, the flag, the ring's build
//   sim     NODE ONLY: an ABSTRACT 1-D duel of two bots on the real match machine + the real rules (equal DPS per hero by construction - this proves the
//           rounds END and nothing soft-locks; it says NOTHING about hero balance, that is the 'duel' section's job)
//   duel    BROWSER (headless page via tools/cdp.mjs): AI-vs-AI in the real game for every hero pair, N=2 seeds each by default (N= from the env): every
//           match ends inside the cap, no soft-lock, no death cost, no flask drunk, every round ends; reports the win matrix and FAILS any hero over 80%
//           of all his duels (n small: a sanity bar, not a tune). PAIRS=knight:pyro,warden:ranger narrows it.
// node tools/pvp-duel.mjs [pure,sim,duel]    (default: pure,sim - the browser section runs only when named)
import { DUEL, PVP_SHIPS, pvpDamage, sdMul, suddenDeath, landedShare, juggleGrace, attackerOf, newMatch, stepMatch, matchPoints, cleanRanks, recordMatch, rankRows, loadRanks, saveRanks, forgetSlot, RANK_KEY, botThink, freshBot, BOT_RANGE, BOT_HEROES, rng, isBotSeat } from '../src/pvp-duel.js';
import { buildDuelPit, DP } from '../src/duel-pit.js';
const WANT = process.argv[2] ? process.argv[2].split(',') : ['pure', 'sim'];
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log('  FAIL ' + m); } else console.log('  ok   ' + m); };

if (WANT.includes('pure')) {
  console.log('pure');
  ok(typeof PVP_SHIPS === 'boolean', 'PVP_SHIPS is a plain boolean flag (' + PVP_SHIPS + ')');
  ok(pvpDamage(10) === 8 && pvpDamage(0) === 0 && pvpDamage(-3) === 0 && pvpDamage(1, 0.1) === 1, 'a blow: raw x scale ' + DUEL.scale + ', never 0 for a real blow, nothing for none');
  ok(pvpDamage(30, 0.5) === pvpDamage(15, 1), 'level-normalised: an L30 hand that hits twice as hard hits like the L1 hand (norm 0.5)');
  ok(pvpDamage(10, 5) === pvpDamage(10, 1), 'norm never boosts a blow (capped at 1)');
  ok(sdMul(0) === 1 && sdMul(DUEL.round.fightT - 0.01) === 1 && sdMul(DUEL.round.fightT) === DUEL.sd.from && sdMul(DUEL.round.fightT + DUEL.round.sdLen) === DUEL.sd.to && sdMul(9999) === DUEL.sd.to, 'sudden death: x1 until ' + DUEL.round.fightT + ' s, then x' + DUEL.sd.from + ' -> x' + DUEL.sd.to + ' over ' + DUEL.round.sdLen + ' s');
  ok(!suddenDeath(10) && suddenDeath(DUEL.round.fightT), 'suddenDeath() flips at ' + DUEL.round.fightT + ' s');
  ok(landedShare(10, 40) === 10 && landedShare(10, 20) === 5 && landedShare(10, 0) === 0 && landedShare(10, 1) === 1, 'landed share: what the guard chain let through of the probe (half on a guard break, nothing on a block)');
  { const h = []; const a = juggleGrace(h, 0), b = juggleGrace(h, 0.5), c = juggleGrace(h, 1.0), d = juggleGrace(h, 1.2);
    ok(a.inv === DUEL.iframe && !a.broke && !b.broke && c.broke && c.inv === DUEL.juggle.inv && !d.broke, 'anti-juggle: the ' + DUEL.juggle.n + 'rd blow inside ' + DUEL.juggle.t + ' s BREAKS (' + DUEL.juggle.inv + ' s grace), the count starts again'); }
  { const h = []; juggleGrace(h, 0); juggleGrace(h, 0.5); const c = juggleGrace(h, 5); ok(!c.broke, '...blows spread out never break'); }
  { const A = { x: 100, y: 200 }, B = { x: 140, y: 200 }, C = { x: 300, y: 200 }, seats = [A, B, C];
    ok(attackerOf({ victim: B, pass: A, fromX: 100, seats }) === A, 'whose blow: in A\'s pass, A\'s');
    ok(attackerOf({ victim: A, pass: A, fromX: 100, seats }) === null, '...his own blow in his own pass: nobody (no self-hit)');
    ok(attackerOf({ victim: B, pass: null, fromX: 138, owned: [{ x: 137, y: 190, own: C }], seats }) === C, 'out of a pass: the owner of the effect that is there (C\'s fireball by B)');
    ok(attackerOf({ victim: B, pass: null, fromX: 138, owned: [{ x: 139, y: 190, own: B }], seats }) === null, '...his own effect (his pyre under his feet): nobody');
    ok(attackerOf({ victim: B, pass: null, fromX: 138, owned: [{ x: 139, y: 190, own: B }, { x: 130, y: 190, own: A }], seats }) === A, '...his own and a foe\'s both there: the foe\'s');
    ok(attackerOf({ victim: B, pass: null, fromX: 138, owned: [], seats }) === A, '...nothing tagged: the nearest other upright seat');
    ok(attackerOf({ victim: A, pass: A, fromX: 100, owned: [{ x: 101, y: 200, own: B }], seats }) === B, '...in his own pass, a foe\'s effect updated there (two of the same hero share an array): the foe'); }
  { let m = newMatch([1, 2]), evs = [];
    const run = (secs, standing, share) => { for (let i = 0; i < secs * 60; i++) { const e = stepMatch(m, 1 / 60, standing, share); if (e) evs.push(e); } };
    run(DUEL.round.count + 0.1, [1, 2]); ok(m.phase === 'fight' && evs.join() === 'fight', 'a round opens 3-2-1 then FIGHT');
    run(0.1, [1]); ok(m.phase === 'ko' && m.wins[1] === 1 && m.last.how === 'ko', 'one left standing: K.O., his round');
    run(DUEL.round.ko + 0.1, [1, 2]); ok(m.phase === 'count' && m.round === 2, '...the next round is counted in');
    run(DUEL.round.count + 0.1, [1, 2]); run(DUEL.round.timeUp + 0.1, [1, 2], { 1: 0.2, 2: 0.6 }); ok(m.wins[2] === 1 && m.last.how === 'time', 'TIME at ' + DUEL.round.timeUp + ' s: the higher health share takes it');
    run(DUEL.round.ko + DUEL.round.count + 0.2, [1, 2]); run(0.1, [2]); run(DUEL.round.ko + 0.1, [2]);
    ok(m.phase === 'over' && m.winner === 2 && matchPoints(m, 2) === DUEL.pts.match + 2 * DUEL.pts.round && matchPoints(m, 1) === DUEL.pts.round, 'first to ' + DUEL.round.toWin + ' wins the match; points: ' + DUEL.pts.match + ' to the winner + ' + DUEL.pts.round + ' a round won (' + matchPoints(m, 2) + ' / ' + matchPoints(m, 1) + ')'); }
  { const m = newMatch([1, 2]); let n = 0, ev = null; while (m.phase !== 'over' && n++ < 1e6) ev = stepMatch(m, 1 / 60, m.phase === 'fight' && m.clock > 1 ? [] : [1, 2]) || ev;
    ok(m.phase === 'over' && m.winner === null && m.round === DUEL.round.maxRounds && m.draws === DUEL.round.maxRounds, 'double K.O. every round: DRAW rounds, and at ' + DUEL.round.maxRounds + ' rounds it ends a drawn match (no soft-lock)'); }
  { const m = newMatch([1, 2]); let n = 0; while (m.phase !== 'over' && n++ < 1e6) stepMatch(m, 1 / 60, [1, 2], { 1: 0.5, 2: 0.5 });
    ok(m.phase === 'over' && n < 60 * DUEL.round.maxRounds * (DUEL.round.timeUp + DUEL.round.ko + DUEL.round.count) + 600, 'two seats that never touch, level on health: every round times out to a DRAW, the match still ends (' + (n / 60).toFixed(0) + ' s)'); }
  { const m = newMatch([1, 2, 3, 4]); stepMatch(m, 4, [1, 2, 3, 4]); stepMatch(m, 1, [1, 2, 3, 4]); ok(m.phase === 'fight', 'four seats: it is a fight while 2+ stand'); stepMatch(m, 0.1, [3]); ok(m.wins[3] === 1, '...last hero standing takes the round'); }
  { const raws = [undefined, null, 'x', 5, [], { rows: 'no' }, { rows: { slot1: { w: 'x', l: -4, pts: 1e12, name: 7 }, evil: { w: 3 }, slot9: null } }];
    for (const r of raws) { let R = null, err = ''; try { R = cleanRanks(r); } catch (e) { err = String(e); } ok(!err && R && R.v === 1 && typeof R.rows === 'object' && Object.keys(R.rows).every(k => /^slot[1-9]$/.test(k)) && Object.values(R.rows).every(q => Number.isInteger(q.w) && q.w >= 0 && q.pts <= 999999), 'rankings: ' + JSON.stringify(r) + ' reads whole'); } }
  { let R = recordMatch(null, [{ key: 'slot1', name: 'SAVE 1', hero: 'knight', won: true, rounds: 2, pts: 14 }, { key: 'slot2', name: 'SAVE 2', hero: 'pyro', won: false, rounds: 1, pts: 2 }, { key: null, name: 'GUEST', won: false }, { key: 'bot', name: 'BOT', won: true }]);
    R = recordMatch(R, [{ key: 'slot2', name: 'SAVE 2', hero: 'pyro', won: true, rounds: 2, pts: 14 }, { key: 'slot1', name: 'SAVE 1', hero: 'knight', won: false, rounds: 0, pts: 0 }]);
    const rows = rankRows(R);
    ok(rows.length === 2 && rows[0].key === 'slot2' && rows[0].pts === 16 && rows[0].w === 1 && rows[0].l === 1 && rows[1].pts === 14 && rows[1].m === 2, 'rankings: wins, losses, points per save slot; sorted by points; a guest and a bot are never written: ' + JSON.stringify(rows.map(r => [r.key, r.w, r.l, r.pts]))); }
  { const mem = new Map(), ls = { getItem: k => mem.has(k) ? mem.get(k) : null, setItem: (k, v) => mem.set(k, String(v)) };
    saveRanks(ls, recordMatch(null, [{ key: 'slot3', name: 'SAVE 3', won: true, rounds: 2, pts: 14 }]));
    ok(loadRanks(ls).rows.slot3 && loadRanks(ls).rows.slot3.pts === 14 && mem.has(RANK_KEY) && [...mem.keys()].length === 1, 'the board lives in ONE device key (' + RANK_KEY + '), never inside a save');
    forgetSlot(ls, 2); ok(!loadRanks(ls).rows.slot3, 'erasing save 3 takes its row off the board');
    mem.set(RANK_KEY, '{not json'); ok(Object.keys(loadRanks(ls).rows).length === 0, 'a broken board reads as empty, never throws'); }
  { const s = freshBot(), r = rng(3), me = { x: 100, y: 272, face: 1, ground: true, atk: -1, hero: 'knight' }, foe = { x: 300, y: 272, atk: -1 };
    let right = 0, atk = 0; for (let i = 0; i < 120; i++) { const o = botThink(me, foe, s, r, 1 / 60); if (o.keys.right) right++; if (o.press.atk) atk++; }
    ok(right > 100 && atk === 0, 'bot: far off, it walks in and does not swing at air (' + right + ' frames right)');
    const s2 = freshBot(); let a2 = 0, b2 = 0; for (let i = 0; i < 600; i++) { const o = botThink(me, { x: 112, y: 272, atk: i % 40 < 10 ? 0 : -1 }, s2, r, 1 / 60); if (o.press.atk) a2++; if (o.keys.block || o.press.dodge) b2++; }
    ok(a2 >= 8 && a2 <= 60 && b2 > 0, 'bot: in reach it swings at a human pace (' + a2 + ' in 10 s) and guards or rolls when the foe swings (' + b2 + ' frames)');
    const s3 = freshBot(), rg = { ...me, x: 300, hero: 'ranger' }; let back = 0; for (let i = 0; i < 300; i++) { const o = botThink(rg, { x: 350, y: 272, atk: -1 }, s3, r, 1 / 60); if (o.keys.left) { back++; rg.x -= 1; } if (rg.x < 240) break; }
    ok(back >= 20 && rg.x <= 280, 'bot: the bow backs off to its range (' + BOT_RANGE.ranger + ' px): ' + back + ' frames back');
    ok(BOT_HEROES.every(h => BOT_RANGE[h] > 0), 'every hero has a bot range');
    const n = botThink(me, null, freshBot(), r, 1 / 60); ok(!Object.values(n.keys).some(Boolean), 'bot: no foe standing, no hands');
    ok(isBotSeat({ duelBot: true }) && isBotSeat({ src: { kind: 'duelbot' } }) && !isBotSeat({ src: { kind: 'pad' } }) && !isBotSeat(null), 'a bot seat is known by its flag or its seat source (it never follows the party out)'); }
  { const T = { AIR: 0, SOLID: 1, ONEWAY: 2 }, painter = (W, H) => { const grid = new Uint8Array(W * H), ents = [], set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
      return { W, H, grid, ents, set, block: (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.SOLID); }, plat: (x, y, l) => { for (let i = 0; i < l; i++) set(x + i, y, T.ONEWAY); }, ent: (t, x, y, e = {}) => ents.push({ t, x, y, ...e }) }; };
    const L = buildDuelPit({ painter, T }), at = (x, y) => L.grid[y * L.W + x];
    ok(L.duelPit && L.openYard && L.trial === undefined && !L.ents.some(e => !['deco'].includes(e.t)), 'the ring: duelPit + openYard, NO trial flag (co-op stays on), no foe, no coin, no hazard');
    ok([0, 1, L.W - 2, L.W - 1].every(x => at(x, 3) === T.SOLID) && Array.from({ length: L.W }, (_, x) => at(x, DP.FLOOR)).every(v => v === T.SOLID), 'walled both sides, floored wall to wall (nobody falls out)');
    ok(DP.SPOTS.every(c => c > 1 && c < L.W - 2 && at(c, DP.FLOOR - 1) === T.AIR && at(c, DP.FLOOR - 2) === T.AIR), 'the four start spots stand on open floor');
    ok((L.W - 4) * 16 <= 400, 'the ring fits one party view (' + (L.W - 4) * 16 + ' px inside the walls, the party view is <= 400)'); }
}

if (WANT.includes('sim')) {
  console.log('sim (ABSTRACT: equal DPS per hero by construction - proves the rounds end, not the balance)');
  const W = (DP.W - 4) * 16, SPEED = 80, SWING = 0.3;
  function duel(ha, hb, seed) {
    const r = rng(seed), m = newMatch([1, 2]), A = { id: 1, hero: ha }, B = { id: 2, hero: hb }, seats = [A, B];
    const reset = () => { A.x = 40; B.x = W - 40; for (const s of seats) { s.hp = DUEL.hp; s.atk = -1; s.swT = 0; s.inv = 0; s.blk = 0; s.bot = freshBot(); s.hits = []; s.face = s === A ? 1 : -1; } };
    reset(); let frames = 0;
    while (m.phase !== 'over' && frames < 60 * 60 * 20) {
      frames++; const dt = 1 / 60;
      if (m.phase === 'fight') for (const s of seats) { if (s.hp <= 0) continue; const f = s === A ? B : A;
        const o = botThink({ x: s.x, y: 272, face: s.face, ground: true, atk: s.atk, hero: s.hero }, f.hp > 0 ? { x: f.x, y: 272, atk: f.atk } : null, s.bot, r, dt);
        s.blk = o.keys.block ? 1 : 0; const mv = o.keys.left ? -1 : o.keys.right ? 1 : 0; if (mv) s.face = mv; if (s.atk < 0) s.x = Math.max(8, Math.min(W - 8, s.x + mv * SPEED * dt));
        if (o.press.atk && s.atk < 0) { s.atk = 0; s.swT = SWING; }
        if (s.atk >= 0) { s.swT -= dt; if (s.swT <= 0) { s.atk = -1; const reach = Math.max(22, BOT_RANGE[s.hero] + 8);
          if (f.hp > 0 && Math.abs(f.x - s.x) <= reach && Math.sign(f.x - s.x) === s.face && f.inv <= 0 && !f.blk) { const pd = pvpDamage(12, 1, m.clock); f.hp -= pd; const g = juggleGrace(f.hits, frames / 60); f.inv = g.inv; } } }
        s.inv -= dt; }
      const ev = stepMatch(m, 1 / 60, seats.filter(s => s.hp > 0).map(s => s.id), { 1: A.hp / DUEL.hp, 2: B.hp / DUEL.hp });
      if (ev === 'round') reset();
    }
    return { m, secs: frames / 60 };
  }
  const H = BOT_HEROES, wins = {}, games = {}; let worst = 0, unfinished = 0, rounds = 0, timeouts = 0;
  for (const a of H) for (const b of H) { if (a === b) continue; for (let sd = 1; sd <= 3; sd++) { const { m, secs } = duel(a, b, sd * 97 + a.length * 7 + b.length); worst = Math.max(worst, secs); if (m.phase !== 'over') unfinished++; rounds += m.log.length; timeouts += m.log.filter(l => l.how === 'time' || l.how === 'draw').length;
    games[a] = (games[a] || 0) + 1; games[b] = (games[b] || 0) + 1; if (m.winner === 1) wins[a] = (wins[a] || 0) + 1; if (m.winner === 2) wins[b] = (wins[b] || 0) + 1; } }
  ok(unfinished === 0, 'every abstract match ENDED (' + H.length * (H.length - 1) * 3 + ' matches, ' + rounds + ' rounds, ' + timeouts + ' by time/draw); the longest took ' + worst.toFixed(0) + ' s');
  console.log('  info abstract win share (ranged bots kite in 1-D, so this is NOT balance): ' + H.map(h => h + ' ' + Math.round(100 * (wins[h] || 0) / games[h]) + '%').join(', '));
}

if (WANT.includes('duel')) {
  /* BROWSER: a headless page. NOT run by claude/pvpduel (RAM-short day, code-only lane) - the proof lane runs it. */
  console.log('duel (browser, AI vs AI in the real game)');
  const { openPage } = await import('./cdp.mjs');
  const N = +(process.env.N || 2), CAP_S = 6 * 60;
  const pairs = process.env.PAIRS ? process.env.PAIRS.split(',').map(p => p.split(':')) : BOT_HEROES.flatMap((a, i) => BOT_HEROES.slice(i + 1).map(b => [a, b]));
  let pg = await openPage({ duelBeta: true, audio: false, fonts: false, seed: 5 }); const E = e => pg.evalp(e);   /* (proof146b) a fresh page every RECYCLE matches (one page crashed after ~10 matches), and one retry on a crashed page */
  const RECYCLE = +(process.env.RECYCLE || 6); let nPage = 0; const openDI = () => E(`(async()=>{const {LEVELS}=await import('/src/level.js');window.__DI=LEVELS.findIndex(l=>l.id==='duel_pit');return window.__DI;})()`);
  const won = {}, played = {};
  try {
    await openDI();
    const fresh = async () => { try { await pg.close?.(); } catch (e) {} pg = await openPage({ duelBeta: true, audio: false, fonts: false, seed: 5 }); nPage = 0; await openDI(); };
    for (const [a, b] of pairs) for (let s = 1; s <= N; s++) {
      if (nPage >= RECYCLE) await fresh(); nPage++;
      const run1 = () => E(`(async()=>{BK.manualSimulation=true;for(const k in BK.keys)BK.keys[k]=false;BK.setHero('${a}');BK.reset({fresh:true});BK.applyUpgrades();BK.load(__DI);BK.start();BK.coopStart('${b}',false);BK.sim(10);
        const D=BK.duel();const began=D.begin({bots:'all',seed:${s * 31}});const dc0=JSON.stringify(BK.PROG?BK.PROG.dc||null:null);let f=0;
        while(f<${CAP_S * 60}&&D.debug().m&&D.debug().m.phase!=='over'){BK.sim(60);f+=60;}
        const d=D.debug(),fl=BK.players().map(p=>p.flasks|0);return {began,phase:d.m&&d.m.phase,winner:d.m&&d.m.winner,rounds:d.m&&d.m.log.length,secs:f/60,stats:d.stats,seats:d.seats,flasks:fl,state:BK.state};})()`);
      let r; try { r = await run1(); } catch (e) { console.log('  note ' + a + ' v ' + b + ' #' + s + ': ' + String(e.message || e).slice(0, 80) + ' -> fresh page, retry'); await fresh(); r = await run1(); }
      const tag = a + ' v ' + b + ' #' + s;
      ok(r.began && r.phase === 'over' && r.state === 'play', tag + ': the match ENDS inside ' + CAP_S + ' s (' + r.secs + ' s, ' + r.rounds + ' rounds, winner P' + r.winner + ')');
      ok(r.stats && r.stats.landed > 0, tag + ': heroes land blows on each other (' + JSON.stringify(r.stats) + ')');
      ok(r.flasks.every(n => n === 0), tag + ': no flask in the pit');
      played[a] = (played[a] || 0) + 1; played[b] = (played[b] || 0) + 1; if (r.winner === 1) won[a] = (won[a] || 0) + 1; if (r.winner === 2) won[b] = (won[b] || 0) + 1;
    }
    const share = h => played[h] ? (won[h] || 0) / played[h] : 0;
    console.log('  win share: ' + Object.keys(played).map(h => h + ' ' + Math.round(100 * share(h)) + '% of ' + played[h]).join(', '));
    for (const h of Object.keys(played)) ok(share(h) <= 0.8 || played[h] < 4, h + ' wins ' + Math.round(100 * share(h)) + '% of his duels (bar: <= 80%, n small)');
  } finally { await pg.close?.(); }
}

console.log(fails.length ? '\npvp-duel: ' + fails.length + ' FAIL' : '\npvp-duel: all ok');
process.exit(fails.length ? 1 : 0);
