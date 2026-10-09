// tools/scree-chase.mjs - THE ROCKSLIDE CHASE on the Scree Path (claude/scree2, src/scree-chase.js; Daniel 10-08: "a LONGER section fleeing the rockslide").
//   NODE   the built level hands src/chase.js ONE chase (the old once-a-save L.slide is gone); the engine's lint passes it with the level's own shrines (one
//          within 15 tiles before the start line); every surge is warned; it HURTS on contact (never an outright kill: the pits kill) and is RE-ARMED by a
//          death (chaseReset - never a mark); the shrine AFTER it stands on the gorge bank past the safe line, and no shrine stands on the run; the run is
//          long (>= 160 columns crest to bank); every span between the crest and the bank is either ground or a pit no wider than 4 tiles; both lines of the
//          fork exist (the high shelves bridge the chute's pit); nothing is sprinkled onto the run (L.calm); rocks off the cliff are told (tell >= 1 s, only on
//          screen); a hero who stands still is caught in Node, a hero who keeps moving at a walk is not.
//   PAGE   EVERY HERO (knight, warden, pyro, paladin, pirate, reaper, geomancer), a fresh save, BASE MOVEMENT, NO GOD, no foes, REAL KEYS (BK.keys / BK.press,
//          the keyboard's own path): from the crest's shrine, right held, a jump at each lip and each step up (a hand that sees the ground ahead), down BOTH
//          lines of the fork - and it reaches the bank's safe line with no death and the front never once on it; the run takes 20-55 s (the reaper, the slowest walker, ~50). A hero who stands at
//          the crest after the start is caught by the front within 8 s, and a death on the run puts the front back at the crest (re-armed).
//   PORT=8741 node tools/scree-chase.mjs [heroes]   exit 1 on any failure
import { LEVELS, T } from '../src/level.js';
import { chaseProblems, chaseSpec, newChase, chaseStep } from '../src/chase.js';
import { CHASE, SPANS, SHELVES, X0, X1, BANK, TRIGGER, CHECK_BEFORE } from '../src/scree-chase.js';
import { openPage } from './cdp.mjs';
const HEROES = (process.argv[2] || 'knight,warden,pyro,paladin,pirate,reaper,geomancer').split(',');
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const TS = 16, L = LEVELS.find(l => l.id === 'scree').build(), W = L.W, at = (x, y) => L.grid[y * W + x];
console.log('== NODE');
ok(!L.slide && Array.isArray(L.chases) && L.chases.length === 1 && L.chases[0].id === 'rockslide', 'the level hands the chase engine one chase (the old once-a-save boulder front is gone)');
const checks = L.ents.filter(e => e.t === 'check').map(e => ({ x: e.x * TS + 8, y: (e.y + 1) * TS, tx: e.x }));
const lint = chaseProblems(L.chases, checks.map(c => ({ x: c.x, y: c.y })).concat([{ x: L.START.x * TS + 8, y: (L.START.y + 1) * TS }]));
ok(!lint.length, 'the engine\'s lint passes it with the level\'s own shrines' + (lint.length ? ': ' + lint.join('; ') : ''));
const sp = chaseSpec(L.chases[0]);
ok(sp.contact === 'hurt' && sp.dmg >= 24, 'the front HURTS (' + sp.dmg + '), it is the pits that kill');
ok(sp.curve.slice(1).every(r => r.warn), 'every surge is warned (' + sp.curve.slice(1).map(r => r.warn).join(' / ') + ')');
ok(checks.some(c => c.tx === CHECK_BEFORE) && checks.some(c => c.tx > BANK - 1 && c.tx <= BANK + 3), 'a shrine stands before the start line (' + CHECK_BEFORE + ') and one AFTER the safe line on the gorge bank');
ok(!checks.some(c => c.tx > TRIGGER && c.tx < BANK), 'no shrine on the run itself');
ok(BANK - X0 >= 160, 'the run is long: ' + (BANK - X0) + ' columns crest to bank (>= 160)');
{ let x = X0, worst = 0, bad = []; const spans = SPANS.slice().sort((a, b) => a[0] - b[0]); for (const s of spans) { if (s[0] > x) { worst = Math.max(worst, s[0] - x); if (s[0] - x > 4) bad.push(x + '-' + (s[0] - 1)); } x = Math.max(x, s[1] + 1); }
  ok(!bad.length, 'every gap on the run is a jump (widest ' + worst + ' tiles, none over 4)' + (bad.length ? ': ' + bad.join(', ') : '')); }
{ const pitBridged = SHELVES.some(([x, , n]) => x <= 364 && x + n - 1 >= 365); let pit = true; for (let y = 0; y < L.H; y++) if (at(364, y) !== T.AIR && at(364, y) !== T.ONEWAY) pit = false;
  ok(pitBridged && pit, 'THE FORK: the low chute ends in an open pit, and the high shelves bridge it'); }
ok((L.calm || []).some(z => z[0] <= X0 && z[1] >= BANK - 1), 'nothing is sprinkled onto the run (a calm over it)');
{ const rocks = L.ents.filter(e => e.t === 'rockfall' && e.x >= X0 && e.x <= X1); ok(rocks.length >= 4 && rocks.every(r => r.seen && r.tell >= 1), rocks.length + ' rocks off the cliff ahead, every one told (>= 1 s, only on screen)'); }
{ const s1 = newChase(); let hits = 0; for (let f = 0; f < 60 * 12; f++) for (const e of chaseStep(sp, s1, sp.trigger + 2, 1 / 60)) if (e.k === 'contact') hits++;
  const s2 = newChase(); let h2 = 0, x = sp.trigger + 2; for (let f = 0; f < 60 * 60 && s2.phase !== 'done'; f++) { x += 72 / 60; for (const e of chaseStep(sp, s2, x, 1 / 60)) if (e.k === 'contact') h2++; }
  ok(hits >= 1 && h2 === 0, 'in Node a hero who stands is caught (' + hits + ' hits in 12 s); one who keeps moving at 72 px/s never is (' + h2 + ')'); }
console.log('== PAGE (real keys, every hero)');
const pg = await openPage({ audio: false, fonts: false });
try {
  for (const hero of HEROES) {
    const r = await pg.evalp(`(async()=>{
      const { LEVELS } = await import('/src/level.js'); const TS = 16;
      BK.manualSimulation = true; BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true });
      BK.load(LEVELS.findIndex(l => l.id === 'scree')); BK.state = 'play'; BK.god = false; BK.sim(5);
      const L = BK.level, W = L.W, k = BK.keys, P = () => BK.P, T = ${JSON.stringify(T)};
      const solid = (x, y) => { const t = L.grid[y * W + x]; return t === T.SOLID; }, stand = (x, y) => { const t = L.grid[y * W + x]; return t === T.SOLID || t === T.ONEWAY || t === T.SHELF; };
      const clear = () => { for (const q of ['left', 'right', 'jump', 'down', 'up', 'atk', 'block']) k[q] = false; };
      const st = () => BK.chase.states()[0];
      const kill = () => { for (const e of BK.enemies()) if (!e.boss) e.alive = false; for (const p of BK.props()) if (p.t === 'rockfall') p.timer = 1e9; };
      /* the run: from the crest's shrine. line 'low' runs off the fork's step into the chute; 'high' takes the shelves */
      const run = (line, stand0) => { kill(); BK.tp(${CHECK_BEFORE}, 12); clear(); BK.sim(30); BK.chase.reset(); kill(); const hp0 = P().maxHp; P().hp = hp0;
        const life0 = BK.lifeN; let f = 0, jumpT = 0, standF = stand0 || 0, startF = -1, deathAt = null, rearmed = null, minHp = P().hp, maxX = 0;
        while (f++ < 60 * 90) { const s = st(); if (s.phase === 'run' && startF < 0) startF = f; if (s.phase === 'done') break;
          if (BK.lifeN !== life0) { deathAt = deathAt || Math.round(P().x / TS); rearmed = st().phase === 'idle' && Math.abs(P().x / TS - ${CHECK_BEFORE}) < 8; break; }
          const p = P(), tx = Math.floor(p.x / TS), ty = Math.floor((p.y - 1) / TS); clear(); maxX = Math.max(maxX, tx); minHp = Math.min(minHp, p.hp);
          if (standF > 0 && s.phase === 'run') { standF--; if (standF === 0) break; BK.sim(1); continue; }
          k.right = true;
          if (jumpT > 0) { jumpT--; k.jump = true; }
          else if (p.ground) { const ahead = Math.floor((p.x + 9) / TS), next = Math.floor((p.x + 14) / TS);
            const spikeAhead = [1, 2].some(d => { const c = Math.floor((p.x + d * 12) / TS); for (let yy = ty; yy <= ty + 2; yy++) if (L.grid[yy * W + c] === T.SPIKE) return true; return false; });
            const wall = solid(ahead, ty) || solid(ahead, ty - 1) || spikeAhead, lip = !stand(next, ty + 1) && !stand(next, ty + 2) && !stand(next, ty + 3) && !stand(next, ty + 4);
            const fork = line === 'high' && tx >= 332 && tx <= 333 && ty <= 14;
            if (wall || fork || (lip && !(stand(next, ty + 2) || stand(next, ty + 3)) )) { BK.press('jump'); k.jump = true; jumpT = 22; } }
          BK.sim(1); }
        const s = st(); return { line, done: s.phase === 'done', secs: startF > 0 ? +((f - startF) / 60).toFixed(1) : null, hits: s.hits, death: deathAt, rearmed, lost: Math.round(100 * (hp0 - minHp) / hp0), maxX, hp: Math.round(P().hp) }; };
      const low = run('low'), high = run('high');
      const stood = run('low', 60 * 8);   /* starts, then stands on the crest for up to 8 s */
      return { low, high, stood: { hits: stood.hits, death: stood.death } };
    })()`, 900000);
    console.log('\n== ' + hero + '  low ' + JSON.stringify(r.low) + '\n   high ' + JSON.stringify(r.high) + '\n   stood ' + JSON.stringify(r.stood));
    for (const q of [r.low, r.high]) ok(q.done && !q.death && q.hits === 0 && q.secs >= 20 && q.secs <= 55, hero + ' ' + q.line.toUpperCase() + ': reaches the bank with real keys - ' + (q.done ? q.secs + ' s, the front on him ' + q.hits + ' times, ' + q.lost + '% health lost' : 'NOT DONE (died at ' + q.death + ', reached ' + q.maxX + ')'));
    ok(r.stood.hits >= 1, hero + ': a hero who stands at the crest is caught (' + r.stood.hits + ' hits in 8 s)');
  }
  /* RE-ARMED: a death on the run puts the front back at the crest */
  const re = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true });
    BK.load(LEVELS.findIndex(l => l.id === 'scree')); BK.state = 'play'; BK.sim(5); BK.tp(${CHECK_BEFORE}, 12); BK.sim(30); for (let i = 0; i < 150; i++) { BK.keys.right = true; BK.sim(1); } BK.keys.right = false;
    const a = BK.chase.states()[0].phase; BK.P.hp = 1; BK.damagePlayer(BK.P.x, 999, { unblockable: true }); BK.sim(240); const b = BK.chase.states()[0];
    return { a, b: b.phase, pos: Math.round(b.pos / 16), x: Math.round(BK.P.x / 16) }; })()`, 120000);
  ok(re.a === 'run' && re.b === 'idle' && re.x < 300, 'a death on the run re-arms the front: it was ' + re.a + ', after the death it is ' + re.b + ' and the hero wakes at ' + re.x);
} finally { await pg.close(); }
console.log(fails ? '\nFAIL  scree-chase: ' + fails : '\nok  scree-chase: the rockslide runs ~' + (BANK - X0) + ' columns, told, re-armed, and every hero outruns it with real keys down both lines');
process.exit(fails ? 1 : 0);
