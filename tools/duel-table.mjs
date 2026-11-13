// tools/duel-table.mjs - DUELTABLE (claude/dueltable-d): the resumable 9x9 ordered-pairing duel matrix the pvp-duel
// 'duel' section does not try to be (that one is a sanity bar, n=2, FAILS over 80%; this one is the actual table,
// n=10 (n=30 later on the worst 8), EVERY ordered pair, persisted to disk after EVERY fight so a killed browser or a
// box reboot costs at most one fight. PAIRS / N / --resume below. Default arena = the Pit (duel_pit), EVEN/LEVEL 1
// (today's bot-vs-bot defaults from cleanSettings(null): lives 1, health 100, rounds 3, timeLimit 90, level 'even').
//
// node tools/duel-table.mjs --out=work/claude/tune/dueltable-n10.json --resume [--n=10] [--pairs=knight:pyro,...]
//
// SCHEMA (meta + rows), written whole after every single fight (small file, ~720 rows max at n=10):
//   meta: { startedAt, level, arena, masterSha, recycle }
//   rows: [{ a, b, seed, winner, endReason, secs, rounds, dealtA, dealtB, hpA, hpB, livesA, livesB,
//            landed, blocked, breaks, kos, self, nobody }]
// `a` is seat 1 (P1), `b` is seat 2 (P2) - an ORDERED pairing, so knight:pyro and pyro:knight are both run (both
// seats). winner: 1 (a won), 2 (b won), or null (draw/unfinished - should not happen, the cap is 6 min sim per match
// same as pvp-duel.mjs duel). landed/blocked/breaks/kos/self/nobody are the match's OWN delta off the page's running
// st.stats (which never resets itself - tools/pvp-duel.mjs 'duel' prints it cumulative; here we diff it per match so
// each row stands alone). dealtA/dealtB/hpA/hpB/livesA/livesB come straight off debug().seats (duelDealt resets at
// each begin(), so dealt is this match's own).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { execSync } from 'child_process';
import { BOT_HEROES } from '../src/pvp-duel.js';
import { openPage } from './cdp.mjs';

const argv = Object.fromEntries(process.argv.slice(2).map(a => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] ?? true] : [a, true]; }));
const OUT = argv.out || 'work/claude/tune/dueltable-n10.json';
const N = +(argv.n || process.env.N || 10);
const RESUME = !!argv.resume;
const CAP_S = 6 * 60;
const RECYCLE = +(argv.recycle || process.env.RECYCLE || 6);
const HEROES = argv.pairs ? [...new Set(argv.pairs.split(',').flatMap(p => p.split(':')))] : BOT_HEROES;
const PAIRS = argv.pairs ? argv.pairs.split(',').map(p => p.split(':')) : BOT_HEROES.flatMap(a => BOT_HEROES.filter(b => b !== a).map(b => [a, b]));

let masterSha = ''; try { masterSha = execSync('git rev-parse HEAD', { cwd: new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]):/, '$1:') }).toString().trim(); } catch (e) { masterSha = 'unknown (' + e.message.slice(0, 60) + ')'; }

function load() {
  if (RESUME && existsSync(OUT)) { try { return JSON.parse(readFileSync(OUT, 'utf8')); } catch (e) { console.log('  note: --resume could not read ' + OUT + ' (' + e.message + '), starting fresh'); } }
  return { meta: { startedAt: new Date().toISOString(), level: 'even', arena: 'duel_pit', masterSha, recycle: RECYCLE, n: N }, rows: [] };
}
const state = load();
const done = new Set(state.rows.map(r => r.a + '|' + r.b + '|' + r.seed));
function save() { mkdirSync(dirname(OUT), { recursive: true }); writeFileSync(OUT, JSON.stringify(state, null, 1)); }

function summary() {
  const key = (a, b) => a + '>' + b;
  const byPair = new Map();
  for (const r of state.rows) { const k = key(r.a, r.b); if (!byPair.has(k)) byPair.set(k, { w: 0, n: 0 }); const q = byPair.get(k); q.n++; if (r.winner === 1) q.w++; }
  console.log('  --- matrix so far: ' + byPair.size + ' / ' + PAIRS.length + ' pairings have at least one fight, ' + state.rows.length + ' fights total ---');
  const rows = [...byPair.entries()].map(([k, q]) => ({ k, pct: Math.round(100 * q.w / q.n), n: q.n })).sort((x, y) => x.pct - y.pct);
  for (const r of rows.slice(0, 8)) console.log('    ' + r.k + '  seatA ' + r.pct + '%  (n=' + r.n + ')');
  if (rows.length > 8) console.log('    ... (' + (rows.length - 8) + ' more)');
}

let pg = null, nPage = 0;
const E = e => pg.evalp(e);
const openDI = () => E(`(async()=>{const {LEVELS}=await import('/src/level.js');window.__DI=LEVELS.findIndex(l=>l.id==='duel_pit');return window.__DI;})()`);
async function fresh() { try { await pg?.close?.(); } catch (e) {} pg = await openPage({ duelBeta: true, audio: false, fonts: false, seed: 5 }); nPage = 0; await openDI(); }

async function runOne(a, b, seed) {
  const expr = `(async()=>{BK.manualSimulation=true;for(const k in BK.keys)BK.keys[k]=false;BK.setHero('${a}');BK.reset({fresh:true});BK.applyUpgrades();BK.load(__DI);BK.start();BK.coopStart('${b}',false);BK.sim(10);
    const D=BK.duel();const s0=JSON.stringify(D.debug().stats);const began=D.begin({bots:'all',seed:${seed}});let f=0;
    while(f<${CAP_S * 60}&&D.debug().m&&D.debug().m.phase!=='over'){BK.sim(60);f+=60;}
    const d=D.debug(),s1=d.stats;const s0o=JSON.parse(s0);
    return {began,phase:d.m&&d.m.phase,winner:d.m&&d.m.winner,endReason:d.m&&d.m.last&&d.m.last.how,rounds:d.m&&d.m.log.length,secs:f/60,
      seats:d.seats,delta:{landed:s1.landed-s0o.landed,blocked:s1.blocked-s0o.blocked,breaks:s1.breaks-s0o.breaks,kos:s1.kos-s0o.kos,self:s1.self-s0o.self,nobody:s1.nobody-s0o.nobody}};})()`;
  let r; try { r = await E(expr); } catch (e) { console.log('  note ' + a + ' v ' + b + ' #' + seed + ': ' + String(e.message || e).slice(0, 100) + ' -> fresh page, retry'); await fresh(); r = await E(expr); }
  return r;
}

async function main() {
  console.log('duel-table: ' + PAIRS.length + ' ordered pairings x n=' + N + ' = ' + (PAIRS.length * N) + ' fights, out=' + OUT + (RESUME ? ' (resume)' : ' (fresh)'));
  console.log('  already have ' + state.rows.length + ' fights persisted' + (RESUME ? ' (skipping those)' : ''));
  await fresh();
  try {
    for (const [a, b] of PAIRS) {
      let addedThisPair = 0;
      for (let seed = 1; seed <= N; seed++) {
        const k = a + '|' + b + '|' + seed;
        if (done.has(k)) continue;
        if (nPage >= RECYCLE) await fresh();
        nPage++;
        const r = await runOne(a, b, seed);
        const sa = r.seats && r.seats[0], sb = r.seats && r.seats[1];
        const row = { a, b, seed, winner: r.winner, endReason: r.endReason || null, secs: r.secs, rounds: r.rounds,
          dealtA: sa ? sa.dealt : null, dealtB: sb ? sb.dealt : null, hpA: sa ? sa.hp : null, hpB: sb ? sb.hp : null,
          livesA: sa ? sa.lives : null, livesB: sb ? sb.lives : null,
          landed: r.delta.landed, blocked: r.delta.blocked, breaks: r.delta.breaks, kos: r.delta.kos, self: r.delta.self, nobody: r.delta.nobody };
        state.rows.push(row); done.add(k); save(); addedThisPair++;
        console.log('  ' + a + ' v ' + b + ' #' + seed + ': winner=' + (r.winner === 1 ? a : r.winner === 2 ? b : 'draw') + ' (' + r.endReason + ', ' + r.secs + 's, ' + r.rounds + ' rounds)');
      }
      if (addedThisPair > 0) summary();
    }
  } finally { try { await pg?.close?.(); } catch (e) {} }
  console.log('\nduel-table: done - ' + state.rows.length + ' fights persisted to ' + OUT);
}
main();
