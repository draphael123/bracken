// PAGE TOOL: launches headless Chrome
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
import { makeDuel, cleanSettings, defaultSettings, loadSettings, saveSettings, SET_KEY, SETTING_CHOICES, matchOpts, BOT_DIFF, DUEL, PVP_SHIPS, pvpDamage, sdMul, suddenDeath, landedShare, juggleGrace, attackerOf, newMatch, stepMatch, matchPoints, cleanRanks, recordMatch, rankRows, loadRanks, saveRanks, forgetSlot, RANK_KEY, botThink, freshBot, BOT_RANGE, BOT_HEROES, rng, isBotSeat } from '../src/pvp-duel.js';
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

  /* ===== pvpduel3: the match options, the bot's difficulty, the planks, and the runtime on a mock game ===== */
  ok(PVP_SHIPS === true, 'the ship flag is ON (DUEL (BETA) is public in the demo cut)');
  { const D = defaultSettings();
    ok(D.lives === 1 && D.health === 100 && D.stamina === 'normal' && D.rounds === 3 && D.teams === false && D.level === 'even' && D.timeLimit === 90 && D.botDifficulty === 'normal' && D.seats.length === 2 && !D.seats[0].isBot && D.seats[1].isBot, "settings: the defaults are today's duel (1 life, 100%, normal stamina, best of 3, EVEN - LEVEL 1, 90 s)");
    const J = cleanSettings({ lives: 9, health: 77, stamina: 'x', rounds: 4, level: 'bad', timeLimit: 33, botDifficulty: 'insane', teams: 'yes', seats: 'no' });
    ok(J.lives === 5 && J.health === 100 && J.stamina === 'normal' && J.rounds === 3 && J.level === 'even' && J.timeLimit === 90 && J.botDifficulty === 'normal' && J.teams === false, 'settings: junk values fall back to the defaults, lives clamp to 1-5');
    ok(cleanSettings({ lives: 0 }).lives === 1 && cleanSettings({ lives: 3.7 }).lives === 3 && SETTING_CHOICES.health.join() === '50,100,150' && cleanSettings({ timeLimit: 0 }).timeLimit === 0, 'settings: lives 1-5 whole, health 50/100/150, a time limit of 0 = OFF');
    const T = cleanSettings({ teams: true });
    ok(T.seats.length === 4 && T.seats.filter(q => q.team === 1).length === 2 && T.seats.filter(q => q.team === 2).length === 2, 'settings: TEAMS = four seats, two a side');
    const T2 = cleanSettings({ teams: true, seats: [{ team: 1 }, { team: 1 }, { team: 1 }, { team: 1 }] }); ok(T2.seats.some(q => q.team === 2), '...an all-one-team list is repaired (both teams get a body)');
    for (const raw of [undefined, null, 5, 'x', [], { seats: [null, 7, { hero: 'Bad Hero!' }] }]) { let o = null, err = ''; try { o = cleanSettings(raw); } catch (e) { err = String(e); } ok(!err && o.seats.length >= 2 && o.seats.length <= 4 && o.seats.every(q => q.hero === 'random' || q.hero === '' || /^[a-z]{2,12}$/.test(q.hero)), 'settings: ' + JSON.stringify(raw) + ' reads whole'); }
    const mem = new Map(), ls = { getItem: k => mem.has(k) ? mem.get(k) : null, setItem: (k, v) => mem.set(k, String(v)) };
    saveSettings(ls, 'slot2', { ...D, lives: 3, health: 150, level: 'your' }); const back = loadSettings(ls, 'slot2'), other = loadSettings(ls, 'slot1');
    ok(back.lives === 3 && back.health === 150 && back.level === 'your' && other.lives === 1 && mem.has(SET_KEY) && mem.size === 1, 'settings: REMEMBERED per save slot in one device key (' + SET_KEY + '), never inside a save');
    mem.set(SET_KEY, '{nope'); ok(loadSettings(ls, 'slot2').lives === 1, '...a broken store reads as the defaults');
    const o3 = matchOpts(cleanSettings({ rounds: 1, timeLimit: 0 })), o5 = matchOpts(cleanSettings({ rounds: 5, timeLimit: 60 })), o0 = matchOpts(D);
    ok(o3.toWin === 1 && o3.fightT === Infinity && o5.toWin === 3 && o5.fightT === 60 && o0.toWin === 2 && o0.maxRounds === DUEL.round.maxRounds, 'match options: rounds 1/3/5 = first to 1/2/3, time limit 0 = no sudden death, 90 s default'); }
  { const m = newMatch([1, 2], { toWin: 1, fightT: Infinity, timeUp: 240 }); const run = (secs, st, sh) => { for (let i = 0; i < secs * 60; i++) stepMatch(m, 1 / 60, st, sh); };
    run(DUEL.round.count + 0.1, [1, 2]); run(200, [1, 2], { 1: 1, 2: 1 }); ok(m.phase === 'fight' && !suddenDeath(m.clock, m.fightT) && sdMul(m.clock, m.fightT) === 1, 'time limit OFF: 200 s in and no sudden death');
    run(41, [1, 2], { 1: 0.9, 2: 0.2 }); ok(m.phase === 'ko' && m.wins[1] === 1, '...the round still ends at its cap (240 s) on health');
    run(DUEL.round.ko + 0.1, [1, 2]); ok(m.phase === 'over' && m.winner === 1, 'ROUNDS 1: one round wins the match'); }
  { const m = newMatch([1, 2], { fightT: 60 }); ok(suddenDeath(60, m.fightT) && !suddenDeath(59, m.fightT) && pvpDamage(10, 1, 70, 60) > pvpDamage(10, 1, 0, 60), "time limit 60 s: sudden death from 60 s (and the ramp follows the match's limit)"); }
  { const m = newMatch([1, 2]); stepMatch(m, 4, [1, 2]); stepMatch(m, 1, [1, 2]); stepMatch(m, 0.1, [2]); ok(m.wins[2] === 1 && m.last.win === 2, 'teams: the round goes to the team with someone left standing (the ids are the teams)'); }
  { const easy = BOT_DIFF.easy, hard = BOT_DIFF.hard, norm = BOT_DIFF.normal;
    ok(norm.think === 0.1 && norm.cd === 0.22 && norm.block === 0.45 && norm.dodge === 0.18 && norm.react === 0, 'bot difficulty: NORMAL is exactly the old bot');
    ok(easy.react > hard.react && easy.block < norm.block && norm.block < hard.block && easy.cd > norm.cd && norm.cd > hard.cd && easy.think > hard.think, 'bot difficulty: easy is slower to think, swing and answer; hard is quicker and guards more');
    const count = d => { const r = rng(11), me = { x: 100, y: 272, face: 1, ground: true, atk: -1, hero: 'knight' }; const s = freshBot(d); let a = 0, b = 0; for (let i = 0; i < 3600; i++) { const o = botThink(me, { x: 114, y: 272, atk: i % 40 < 14 ? 0 : -1 }, s, r, 1 / 60); if (o.press.atk) a++; if (o.keys.block || o.press.dodge) b++; } return { a, b }; };
    const e = count('easy'), n = count('normal'), h = count('hard');
    ok(h.a >= n.a * 0.8 && n.a > e.a * 1.4 && h.b > n.b && n.b > e.b, 'bot difficulty over a minute in reach: swings easy ' + e.a + ' < normal ' + n.a + ' < hard ' + h.a + '; guards easy ' + e.b + ' < normal ' + n.b + ' < hard ' + h.b); }
  { const T = { AIR: 0, SOLID: 1, ONEWAY: 2 }, painter = (W, H) => { const grid = new Uint8Array(W * H), ents = [], set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
      return { W, H, grid, ents, set, block: (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.SOLID); }, plat: (x, y, l) => { for (let i = 0; i < l; i++) set(x + i, y, T.ONEWAY); }, ent: (t, x, y, e = {}) => ents.push({ t, x, y, ...e }) }; };
    const L = buildDuelPit({ painter, T }), W = L.W, rows = []; for (let y = 0; y < L.H; y++) { let x = 0; while (x < W) { if (L.grid[y * W + x] === T.ONEWAY) { let e = x; while (e + 1 < W && L.grid[y * W + e + 1] === T.ONEWAY) e++; rows.push({ y, x0: x, x1: e }); x = e + 1; } else x++; } }
    ok(rows.length >= 2 && rows.length <= 3, 'the ring has 2-3 floating planks (' + rows.length + ')');
    const JUMP = 3; /* tiles: a flat jump peaks 51 px = 3.2 tiles; the floor's top is row DP.FLOOR */
    const reach = new Set([DP.FLOOR]); let grew = true; while (grew) { grew = false; for (const r of rows) if (!reach.has(r.y) && [...reach].some(h => h - r.y <= JUMP && h - r.y >= 1 && (h === DP.FLOOR || rows.some(q => q.y === h && q.x1 + 4 >= r.x0 && q.x0 - 4 <= r.x1)))) { reach.add(r.y); grew = true; } }
    ok(rows.every(r => reach.has(r.y)), 'every plank is a jump (<= ' + JUMP + ' tiles) from the floor or from another plank: ' + rows.map(r => 'row ' + r.y + ' x' + r.x0 + '-' + r.x1).join(', '));
    ok(!L.ents.some(e => !['deco'].includes(e.t)), 'no hazard or gimmick in the ring'); }
  { /* THE RUNTIME on a mock game: lives, health, teams, stamina, the level option, sudden death */
    let now = 0, cur = null; const players = [], enemies = [], floats = [], mk = (hero, extra = {}) => ({ hero, n: players.length + 1, x: 0, y: 272, down: 0, dead: 0, hp: 100, maxHp: 100, maxSt: 100, st: 100, flasks: 0, face: 1, ...extra });
    const api = { L: () => ({ duelPit: { floor: 17, spots: [5, 20, 9, 16] }, W: 26 }), players: () => players, time: () => now, TS: 16, P: () => cur,
      asPlayer: (p, fn) => { const w = cur; cur = p; try { return fn(); } finally { cur = w; } }, passOn: () => cur, upright: p => !(p.down > 0) && !(p.dead > 0), enemies: () => enemies, owned: () => [],
      goDown: (p) => { p.down = 1; }, seatAdd: sp => { if (players.length >= 4) return null; const p = mk(sp.hero, { src: sp.src }); players.push(p); return p; }, seatDrop: p => { const i = players.indexOf(p); if (i > 0) { players.splice(i, 1); players.forEach((q, k) => { q.n = k + 1; }); } },
      float: (x, y, t) => floats.push(t), callout() {}, hint() {}, sfx() {}, colourOf: n => ({ c: '#fff', name: 'C' + n }), tagOf: p => 'P' + p.n, heroName: h => String(h).toUpperCase(), heroes: () => [], text() {}, board() {}, bar() {},
      damage: (v, fx, probe) => ({ r: 'hit', landed: probe }), norm: () => 0.5, hand: p => ({ base: 10, add: p.lvlAdd || 0 }), rankOf: p => p === players[0] ? { key: 'slot1', name: 'SAVE 1' } : null, ls: () => null, leave() {}, enter() {}, pressRead: () => ({}), eatPress() {}, keysWrite() {}, pressWrite() {} };
    const D = makeDuel(api); const reset = () => { players.length = 0; enemies.length = 0; players.push(mk('knight', { lvlAdd: 12 })); };
    const fresh = (settings, o = {}) => { reset(); now = 0; return D.begin({ settings, seed: 5, ...o }); };
    const blow = (att, vic, dmg = 20) => { const e = D.st.prox.get(vic); cur = att; const r = D.hit(e, dmg, att.x); cur = null; return r; };
    const step = (secs) => { for (let i = 0; i < secs * 60; i++) { now += 1 / 60; D.tick(1 / 60); } };
    ok(fresh(cleanSettings({ lives: 2, health: 150, stamina: 'unlimited' })), 'runtime: a duel begins on the mock game');
    let [A, B] = players; step(DUEL.round.count + 0.2);
    ok(D.debug().m.phase === 'fight' && A.duelHp === 150 && A.duelMax === 150 && A.duelLives === 2 && B.duelLives === 2, 'options: HEALTH 150% = 150 PvP health, LIVES 2');
    A.x = 100; B.x = 140; A.st = 5; step(0.1); ok(A.st === 100, 'options: STAMINA unlimited refills every frame');
    blow(A, B, 20); ok(B.duelHp < 150 && B.duelHp > 0, 'a landed blow takes PvP health (' + B.duelHp + '/150)');
    B.duelGrace = 0; B.duelHp = 1; blow(A, B, 20); step(0.05); ok(B.down > 0 && B.duelLives === 1 && D.debug().m.phase === 'fight', 'LIVES: a K.O. with a life left does NOT end the round (lives ' + B.duelLives + ')');
    step(1.9); ok(B.down === 0 && B.duelHp === 150 && B.duelGrace > now, 'LIVES: he is back up at full health with a moment of grace');
    B.duelGrace = 0; B.duelHp = 1; blow(A, B, 20); step(0.05); step(2); ok(B.duelLives === 0 && B.down > 0 && D.debug().m.phase === 'ko' && D.debug().m.last.win === A.n, 'LIVES: the last life gone ends the round for the other');
    ok(fresh(cleanSettings({ level: 'even' })), 'runtime: level EVEN begins'); [A, B] = players; ok(D.st.norm.get(A) === 0.5 && D.st.lvl.get(A) === 1, "LEVEL even: today's normalised hand (norm from the game, no level mul)");
    ok(fresh(cleanSettings({ level: 'your' })), 'runtime: level YOUR begins'); [A, B] = players; ok(D.st.norm.get(A) === 1 && D.st.lvl.get(A) === 1 && D.st.lvl.get(B) > 1, "LEVEL your: the human at his own hand, the bot lifted to the highest human's level (x" + D.st.lvl.get(B).toFixed(2) + ')');
    ok(fresh(cleanSettings({ teams: true })), 'runtime: a 2v2 begins'); step(DUEL.round.count + 0.2);
    ok(players.length === 4 && players.map(p => p.duelTeam).join() === '1,1,2,2' && D.st.m.ids.join() === '1,2', 'teams: four seats, two a side, the match counts teams');
    { const [a1, a2, b1, b2] = players; a1.x = 100; a2.x = 110; b1.x = 150; b2.x = 160; const h0 = a2.duelHp; const r = blow(a1, a2, 30); ok(r === true && a2.duelHp === h0, "teams: a teammate's blow does nothing"); blow(a1, b1, 30); ok(b1.duelHp < b1.duelMax, "teams: a foe's blow lands");
      for (const p of [b1, b2]) { p.duelGrace = 0; p.duelHp = 1; blow(a1, p, 30); } step(0.2); ok(D.debug().m.phase === 'ko' && D.debug().m.last.win === 1, 'teams: both foes down = TEAM 1 takes the round'); }
    ok(fresh(cleanSettings({ timeLimit: 60 })), 'runtime: a 60 s limit begins'); [A, B] = players; step(DUEL.round.count + 0.2); step(59); ok(A.duelHp === 100 && B.duelHp === 100, 'sudden death: not yet at 59 s'); step(2); ok(A.duelHp === 1 && B.duelHp === 1, 'sudden death: at the limit everyone is on 1 health (ONE HIT)');
    A.x = 100; B.x = 140; B.duelGrace = 0; blow(A, B, 5); step(0.1); ok(B.down > 0 && D.debug().m.last && D.debug().m.last.win === A.n, 'sudden death: the next landed blow ends it');
    ok(fresh(cleanSettings({ botDifficulty: 'hard', seats: [{}, { hero: 'ranger', isBot: true, botDifficulty: 'easy' }] })), 'runtime: per-seat bot difficulty begins'); ok(D.debug().seats[1].diff === 'easy' && D.debug().seats[1].hero === 'ranger', 'a bot seat keeps its own hero and difficulty (' + D.debug().seats[1].hero + ', ' + D.debug().seats[1].diff + ')');
    D.setSettings({ lives: 4, level: 'your' }); D.setSeat(1, { hero: 'pyro', botDifficulty: 'hard' }); const g = D.getSettings(); ok(g.lives === 4 && g.level === 'your' && g.seats[1].hero === 'pyro' && g.seats[1].botDifficulty === 'hard', 'API: setSettings / setSeat / getSettings round-trip');
    D.setSettings({ teams: true }); ok(D.getSettings().seats.length === 4, 'API: teams on makes it four seats'); D.setSeatCount(3); ok(D.getSettings().seats.length === 4, '...and teams hold it at four');
    ok(fresh(cleanSettings({ rounds: 5, seats: [{}, { hero: 'random' }, { hero: 'random' }] })), 'runtime: three seats with random heroes begins'); ok(players.length === 3 && players.slice(1).every(p => BOT_HEROES.includes(p.hero)), 'random hero: each bot seat gets a real hero (' + players.map(p => p.hero).join(',') + ')'); }
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
