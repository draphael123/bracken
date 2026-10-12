// tools/slope-momentum.mjs - SLOPE MOMENTUM, MEASURED PER HERO WITH REAL KEYS, BEFORE AND AFTER (claude/slope; scratch/brief-slopemomentum.md). A page check (PORT).
// Running DOWN a slope builds speed to 1.3x the legs' cap and a jump off it carries it (src/slopes.js HILL_RUN, hillTop; main.js updatePlayer's walk). This
// finds every SLOPE TAKE-OFF on every level with slopes - a chain of slope tiles run downhill whose foot runs out into an edge within FOOT tiles (a jump off
// the hill can be over something) - and for every hero (base movement, fresh save, god, no foes, keys held as a hand holds them: BK.keys, BK.press) runs
// down it from the crest at a run and jumps from every other frame from the hill's last two tiles to the edge, the jump held 26 frames and the stick held on,
// twice: BEFORE (HILL_RUN.off: the walk downhill's free 1.1, nothing carried) and AFTER. It prints, per take-off and hero, the speed at the edge and the
// furthest landing before/after, and every landing spot (column, row) only the AFTER reaches - the list a level designer reads for "a boosted jump skips
// a designed exam". It fails only when:
//   (a landing in quicksand, or a fall that sends him back to safe ground, is no landing)
//   A  THE MOMENTUM IS NOT THERE: on a take-off of 2+ slope tiles (one tile is too short to build on) where both runs reach the edge, the after run is not faster at the take-off (+8 px/s at least: a two-tile gentle hill builds ~+10, a long one +20-30) for a hero
//      (except on a required slide - L.duneSlides, the Glass Sea's glass - where the run keeps 1.1 by design) - or the after jump does not carry further than the before one
//   B  A ROUTE BREAKS: a row the BEFORE run landed on is landed on nowhere AFTER (momentum must only add; a shorter jump is always the stick let go)
//   PORT=8857 node tools/slope-momentum.mjs [levels] [--heroes=knight,pyro] [--v]
import { openPage } from './cdp.mjs';
const args = process.argv.slice(2), onlyLv = (args.find(a => !a.startsWith('--')) || '').split(',').filter(Boolean);
const HEROES = ((args.find(a => a.startsWith('--heroes=')) || '').slice(9) || 'knight,warden,pyro,paladin,pirate,reaper,geomancer,berserker').split(',');
const verbose = args.includes('--v');
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const pg = await openPage({ audio: false, fonts: false });
const report = [];
try {
  const levels = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const { levelHasSlopes } = await import('/src/slopes.js');
    return LEVELS.map((l, i) => { try { const L = l.build(); return levelHasSlopes(L.grid) ? { id: l.id, i } : null; } catch (e) { return null; } }).filter(Boolean); })()`, 120000);
  for (const lv of levels) {
    if (onlyLv.length && !onlyLv.includes(lv.id)) continue;
    for (const hero of HEROES) {
      const R = await pg.evalp(`(async()=>{
        const { T } = await import('/src/level.js'); const S = await import('/src/slopes.js'); const TS = 16, FOOT = 6;
        BK.manualSimulation = true; BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true }); const SET = BK.ui.settings(); const sp0 = SET.speed; SET.speed = 1;
        BK.load(${lv.i}); BK.state = 'play'; BK.god = true; BK.sim(5);
        const L = BK.level, W = L.W, H = L.H, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : L.grid[y * W + x], P = () => BK.P, k = BK.keys;
        const stand = t => t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.SOFT || t === T.ICE || t === T.CLIMB || t === T.ONEWAY || t === T.PLANK || t === T.SHELF || t === T.RAIL || t === T.CRYST;
        const clear = () => { for (const q of ['left', 'right', 'jump', 'down', 'up', 'atk', 'block']) k[q] = false; };
        /* the chains, as src/reach-hero.js hillSpeeds finds them: a crest, then slope tiles of one rise downhill (the same row or one lower) */
        const inQS = x => (L.quicksand || []).some(z => x * TS + 8 >= z.x0 && x * TS + 8 <= z.x1);   /* a quicksand pit (the Sunken Caravan: one row deep, but the sand takes you) is an edge */
        const chains = [];
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const t0 = at(x, y); if (!S.isSlope(t0)) continue; const rs = S.slopeRise(t0), dir = -rs;
          if ([0, -1].some(dy => { const t = at(x - dir, y + dy); return S.isSlope(t) && S.slopeRise(t) === rs; })) continue;
          const ch = [[x, y]]; for (let c = ch[0], n; c && ch.length < 400; c = n) { n = null; for (const dy of [0, 1]) { const t = at(c[0] + dir, c[1] + dy); if (S.isSlope(t) && S.slopeRise(t) === rs) { n = [c[0] + dir, c[1] + dy]; break; } } if (n) ch.push(n); }
          const [lx, ly] = ch[ch.length - 1]; let fx = lx + dir, n = 0, edge = null;   /* along the foot: the floor's last column before it runs out (a drop of 2+ rows) */
          for (; n < FOOT; fx += dir, n++) { if (inQS(fx)) { edge = fx - dir; break; } if (stand(at(fx, ly)) || S.isSlope(at(fx, ly))) break; if (!stand(at(fx, ly + 1)) && !S.isSlope(at(fx, ly + 1))) { if (!stand(at(fx, ly + 2)) && !S.isSlope(at(fx, ly + 2))) edge = fx - dir; break; } }
          if (edge === null && n === 0) { /* the hill runs straight off into the air (or into a quicksand pit) */ if (inQS(lx + dir) || (!stand(at(lx + dir, ly + 1)) && !stand(at(lx + dir, ly + 2)))) edge = lx; }
          if (edge !== null) chains.push({ crest: x, row: y, dir, foot: lx, footRow: ly, edge, len: ch.length, dune: (L.duneSlides || []).some(d => x >= Math.min(d.crest, d.foot) && x <= Math.max(d.crest, d.foot)), glass: L.glassFrom !== undefined && x >= L.glassFrom }); }
        const top = x => { for (let y = 0; y < H; y++) if (at(x, y) !== 0) return y; return H; };
        const out = [];
        for (const c of chains) {
          const res = {};
          for (const mode of ['before', 'after']) { S.HILL_RUN.off = mode === 'before';
            const capG = 92 * ({ pyro: 1.15, paladin: 0.9, reaper: 0.8, geomancer: 0.92 }[${JSON.stringify(hero)}] || 1);
            const start = () => { for (const e of BK.enemies()) if (!e.boss) e.alive = false; clear(); const p = P(); p.jbuf = 0; p.abuf = 0; p.dbuf = 0; p.coyote = 0; p.hillMo = false; p.rsl = 0; p.lowSlide = false; p.flatT = 0; p.hurt = 0; p.plunge = false; if (p.sandSlide) { p.sandSlide.sliding = false; p.sandSlide.carry = false; }
              BK.tp(c.crest, c.row - 1); P().vx = 0; P().vy = 0; for (let i = 0; i < 40 && !(i >= 6 && P().ground); i++) BK.sim(1); P().vx = c.dir * capG * 1.1; P().runT = 0; };   /* (every buffer of the last try emptied: a jump pressed in it fired on this one's first frame) */
            const key = c.dir > 0 ? 'right' : 'left';
            /* frames of run until he leaves the ground off the edge */
            start(); let nOff = 0, fFoot = -1; for (; nOff < 600; nOff++) { k[key] = true; BK.sim(1); if (fFoot < 0 && (Math.floor(P().x / TS) - (c.foot - c.dir)) * c.dir >= 0) fFoot = nOff; if (!P().ground) break; } clear();
            const tries = [];
            for (let f = Math.max(0, fFoot < 0 ? nOff - 36 : Math.min(fFoot, nOff - 36), nOff - 90); f <= nOff; f += 2) { start(); let air = false;   /* from the hill's last two tiles (or the last 0.6 s) to the edge */
              for (let i = 0; i < f; i++) { k[key] = true; BK.sim(1); if (!P().ground) { air = true; break; } }
              if (air) continue;
              const x0 = P().x, vx0 = Math.abs(P().vx); k.jump = true; BK.press('jump'); let landed = false, lx = 0, ly = 0, px = P().x, tele = false;
              for (let j = 0; j < 240; j++) { k[key] = true; k.jump = j < 26; BK.sim(1); if (Math.abs(P().x - px) > 40 || P().qsDepth > 0) { tele = true; break; } px = P().x; if (j > 3 && P().ground) { landed = true; break; } }
              clear(); tries.push({ f, x0: +(x0 / TS).toFixed(2), vx0: Math.round(vx0), landed: landed && !tele, col: Math.floor(P().x / TS), row: Math.floor((P().y - 1) / TS), dx: +((P().x - x0) * c.dir / TS).toFixed(2) }); }
            res[mode] = { nOff, tries }; }
          S.HILL_RUN.off = false;
          out.push({ ...c, ...res });
        }
        SET.speed = sp0; return out; })()`, 3600000);
      for (const c of R) {
        const spots = m => new Set(c[m].tries.filter(t => t.landed).map(t => t.col + ',' + t.row));
        const sb = spots('before'), sa = spots('after'), gained = [...sa].filter(s => !sb.has(s)), lost = [...sb].filter(s => !sa.has(s));
        const far = m => Math.max(-1, ...c[m].tries.filter(t => t.landed).map(t => t.dx)), v = m => Math.max(0, ...c[m].tries.map(t => t.vx0));
        const name = `${lv.id} hill ${c.crest}..${c.foot} (row ${c.row}, ${c.dir > 0 ? 'down right' : 'down left'}, ${c.len} tiles${c.dune ? ', DUNE SLIDE' : ''}${c.glass ? ', glass' : ''}) edge col ${c.edge}`;
        report.push({ lv: lv.id, hero, name, vb: v('before'), va: v('after'), fb: far('before'), fa: far('after'), gained, lost, sb: [...sb] });
        if (process.env.DUMP && name.includes(process.env.DUMP)) console.log(JSON.stringify({ nOffB: c.before.nOff, nOffA: c.after.nOff, b: c.before.tries.map(t => t.f + ':' + t.x0 + '@' + t.vx0), a: c.after.tries.map(t => t.f + ':' + t.x0 + '@' + t.vx0) }));
        if (verbose) console.log(`   ${hero.padEnd(9)} ${name}: edge ${v('before')} -> ${v('after')} px/s, furthest landing ${far('before')} -> ${far('after')} tiles; new spots ${gained.join(' ') || '-'}; lost ${lost.join(' ') || '-'}`);
        if (!c.dune && !c.glass && c.len >= 2 && c.before.tries.length && c.after.tries.length) ok(v('after') >= v('before') + 8, `A ${hero} ${name}: ${v('before')} -> ${v('after')} px/s at the take-off, ${far('before')} -> ${far('after')} tiles`);
        /* B: a spot lost counts only when the AFTER run lands on that row nowhere at all (a longer jump lands further along the same floor; a shorter one is the stick let go) */
        const rowsA = new Set([...sa].map(q => q.split(',')[1])), lostReal = lost.filter(q => !rowsA.has(q.split(',')[1]));
        ok(!lostReal.length, `B ${hero} ${name}: no landing lost (${lostReal.join(' ') || 'none'})`);
      }
    }
  }
} finally { await pg.close(); }
console.log('\n== SPOTS ONLY THE MOMENTUM REACHES (per take-off: the heroes that gain each)');
const by = new Map(); for (const r of report) if (r.gained.length) { const k = r.name; if (!by.has(k)) by.set(k, new Map()); for (const s of r.gained) { const m = by.get(k); m.set(s, (m.get(s) || []).concat(r.hero)); } }
for (const [k, m] of by) { const before = new Set(report.filter(r => r.name === k).flatMap(r => r.sb));   /* NEW: no hero landed there BEFORE from this take-off - the ones to look at */
  console.log('  ' + k + ': ' + [...m].map(([s, h]) => s + (before.has(s) ? '' : ' NEW') + ' [' + h.join(',') + ']').join('  ')); }
console.log('\n== FURTHEST LANDING, tiles past the take-off, before -> after (per hero)');
const names = [...new Set(report.map(r => r.name))];
for (const n of names) console.log('  ' + n + ': ' + report.filter(r => r.name === n).map(r => r.hero.slice(0, 4) + ' ' + r.fb + '->' + r.fa + ' @' + r.vb + '->' + r.va).join('  '));
console.log(fails ? '\nFAIL  slope-momentum: ' + fails : '\nok  slope-momentum: every hero runs faster down every hill and carries it; no landing a run reached before is lost');
process.exit(fails ? 1 : 0);
