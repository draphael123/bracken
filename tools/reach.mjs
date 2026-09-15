// tools/reach.mjs — can you actually get there?
// Flood-fills the standable tiles of a level from its START using the knight's real numbers (the fill
// itself lives in src/reachcore.js, which the coin sprinkler uses too), then reports anything the player
// is expected to touch that the fill never reached: the gate, the checkpoints, the silver, the quest
// items, the relic, the boss - and any gold outside it.
//
// It cannot model a mover, a swing or a wind gust, so a level that uses those will report things it can
// in fact reach. Every such miss is listed as ASSISTED rather than UNREACHABLE, and the levels that lean
// on them say so at the top.
// usage: node tools/reach.mjs [levelId] [--plain]
//
// --plain runs the fill a SECOND time with nothing that moves and nothing that is only there sometimes (no vine, no
// ghost furniture, no cart, no wheel, no swing, no phantom plank: reachcore's noAssist) and lists every CLIMB that leans
// on one of them, and for each: whether it is the ONLY way to something you are meant to touch (take it out, board the
// rest, see what is lost), and for a vine whether it is FAIR - its grown leaf a jump from where you board and a jump
// from the top (reachcore's fairVines). A vine or a mover may be the TAUGHT way up, but the slowest hero has to be able
// to get there: a step within a jump, a permanent stair, a ride that keeps its own visible beat, or a vine whose leaf he
// can jump to. Earned: the bale bank on the lane out of the Hexed Fields, four rows tall, its vine's leaf fifty-six
// pixels over the lane against a fifty-one pixel jump. It is a report, not a check: read the UNFAIR lines, exits 0.
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';

const plainMode = process.argv.includes('--plain');
const want = process.argv.slice(2).find(a => !a.startsWith('--'));
let bad = 0;
for (const lv of LEVELS) {
  if (lv.hidden && !lv.secret) continue;
  if (want && lv.id !== want) continue;
  const L = lv.build(), W = L.W;
  const { seen, footing, assisted, near, jumpNear } = floodReach(L, T, { rides: true });
  if (plainMode) {
    /* THE CLIMBS, ONE AT A TIME. A plain fill from the start stops at the first assisted climb and everything behind it
       reads as assisted too, which says nothing. So: fill plain; find every assist the plain fill can board (stand within
       two tiles of its band) that leads to footing the plain fill has not got; write each one down as a CLIMB - what it
       is, where, from which row to which; seed the plain fill with what the full fill reaches around it, as if the
       ride had been taken; and go again until nothing new is boarded. The list is every place the level leans on a
       vine, a mover, a wheel or a plank - to be read by hand against the rule (a step within a jump, a permanent stair,
       or a vine whose leaf the slowest hero can reach). */
    const { assists } = floodReach(L, T, { rides: true });
    const WANT = { gate: 'THE GATE', check: 'a checkpoint', silver: 'a silver', stray: 'a quest item', relic: 'the relic', key: 'a key', doorway: 'a doorway' };
    /* (a plank's own standing tiles are not a destination: the plain fill has no plank to stand on) */
    const onPlank = (x, y) => !!L.fields && (L.fields.phantoms || []).some(([x0, x1, py]) => x >= x0 && x <= x1 && y === py - 1);
    /* board every assist the legs can get to, round by round. `skip` is one assist left out of the level, to ask what that
       one alone was carrying */
    const boardAll = skip => {
      const seeds = [], used = new Set(skip || []), climbs = [];
      let P = floodReach(L, T, { noAssist: true });
      for (let round = 0; round < 40; round++) {
        const found = [];
        for (const a of assists) { if (used.has(a)) continue;
          let board = null;   /* the lowest plain tile you can step aboard from (a wheel's paddle or a pad is footing you JUMP onto: three rows further down) */
          const below = a.kind === 'wheel' || a.kind === 'pad' ? 3 : 0;
          for (let y = a.y0 - 2; y <= a.y1 + below && !board; y++) for (let x = a.x0 - 2; x <= a.x1 + 2; x++) if (P.seen.has(x + ',' + y)) { board = [x, y]; }
          if (!board) continue;
          const dest = [];   /* what the full fill has around the band that the plain fill has not */
          for (let y = a.y0 - 3; y <= a.y1 + 1; y++) for (let x = a.x0 - 3; x <= a.x1 + 3; x++) { const k = x + ',' + y; if (seen.has(k) && !P.seen.has(k) && !onPlank(x, y)) dest.push([x, y]); }
          if (!dest.length) { used.add(a); continue; }
          found.push({ a, board, dest }); }
        if (!found.length) break;
        for (const f of found) { used.add(f.a); const top = Math.min(...f.dest.map(d => d[1])), from = f.board[1];
          climbs.push({ a: f.a, x: f.a.x0, board: f.board, dest: f.dest, text: `${f.a.kind.trim()} at ${f.a.x0}${f.a.x1 !== f.a.x0 ? '-' + f.a.x1 : ''} rows ${f.a.y0}-${f.a.y1}: boarded from ${f.board[0]},${f.board[1]}, leads to row ${top} (${from - top > 0 ? from - top + ' up' : top - from + ' down or along'})` });
          for (const d of f.dest) seeds.push(d); }
        P = floodReach(L, T, { noAssist: true, seeds });
      }
      return { P, climbs };
    };
    const { P, climbs } = boardAll(null);
    /* WHICH OF THEM ARE THE ONLY WAY. Take each climb out and board everything else again: whatever you are meant to touch
       that is lost with it (a checkpoint, a silver, a ewe, the boss) was only ever reachable with that assist. A climb
       that loses nothing has a second route; one that loses only ground is a side pocket. A vine goes out with its whole
       group - one spill grows them all, and the crypt's three each covered for the other two. */
    const boss = L.arena && L.arena.boss ? L.ents.find(e => e.t === L.arena.boss) : null;
    const tally = lost => { if (lost.length <= 3) return lost.join(', '); const n = new Map(); for (const l of lost) { const k = l.replace(/ at .*/, ''); n.set(k, (n.get(k) || 0) + 1); }
      return [...n].map(([k, v]) => v > 1 ? v + ' x ' + k.replace(/^an? /, '') : k).join(', '); };
    let only = 0, unfair = 0;
    for (const c of climbs) {
      const vine = c.a.kind.startsWith('hexvine'), wo = boardAll(vine ? assists.filter(a => a.kind === c.a.kind) : [c.a]).P, lost = [];
      for (const e of L.ents) { const w = WANT[e.t]; if (w && P.near(e.x, e.y) && !wo.near(e.x, e.y)) lost.push(`${w} at ${e.x},${e.y}`); }
      if (boss && P.near(boss.x, boss.y) && !wo.near(boss.x, boss.y)) lost.push('THE BOSS');
      let tiles = 0; for (const k of P.seen) if (!wo.seen.has(k)) tiles++;
      c.verdict = lost.length ? (only++, `ONLY WITH ASSISTANCE: without it, no ${tally(lost)} (${tiles} tiles)`) : tiles ? `only ground behind it (${tiles} tiles)` : 'a second route: the legs get there too';
      /* AND IS THE VINE FAIR (rule c): from where you board it, does a fill that may only JUMP onto the grown leaf get to
         the top of the climb? Movers, wheels, the cart and the moon's planks keep their own visible beat and are ridden as
         bands; a vine only grows when it is struck, so it has to be a ledge you can jump to while it is up */
      if (vine && lost.length) { const top = Math.min(...c.dest.map(d => d[1])), fair = floodReach(L, T, { rides: true, fairVines: true, seeds: [c.board] });
        const ok = c.dest.some(([x, y]) => y === top && fair.seen.has(x + ',' + y));
        c.verdict += ok ? '\n         fair: its grown leaf is a jump from where you board it and a jump from the top' : (unfair++, '\n         UNFAIR: its leaf is out of a jump - only a hero standing on the bud as the spill is struck rides it up'); }
    }
    /* things you are meant to touch that even the seeded plain fill never reaches are outside every ride: worth a look */
    const left = [];
    for (const e of L.ents) { const w = WANT[e.t]; if (!w) continue; if (near(e.x, e.y) && !P.near(e.x, e.y)) left.push(`${w} at ${e.x},${e.y}`); }
    const pp0 = Math.round(floodReach(L, T, { noAssist: true }).seen.size / Math.max(1, footing.size) * 100), fp = Math.round(seen.size / Math.max(1, footing.size) * 100);
    console.log(`== ${lv.id} (${W}x${L.H})  legs alone reach ${pp0}% of the footing, the full model ${fp}%: ${climbs.length} climb${climbs.length === 1 ? '' : 's'} lean on an assist, ${only} of them the only way, ${unfair} of those an unfair vine`);
    climbs.sort((p, q) => p.x - q.x);
    for (const c of climbs) console.log('  CLIMB  ' + c.text + '\n         ' + c.verdict);
    for (const l of left) console.log('  STILL OUT OF REACH  ' + l);
    continue;
  }

  // is everything you are meant to touch inside the fill?
  const WANT = { gate: 'THE GATE', check: 'a checkpoint', silver: 'a silver', stray: 'a quest item', relic: 'the relic', key: 'a key', doorway: 'a doorway' };
  const misses = [];
  for (const e of L.ents) { const w = WANT[e.t]; if (!w) continue; if (!near(e.x, e.y)) misses.push(`${w} at ${e.x},${e.y}`); }
  // and the boss, if the level has one
  if (L.arena && L.arena.boss) { const b = L.ents.find(e => e.t === L.arena.boss || e.t === L.arena.boss + 'lord'); if (b && !near(b.x, b.y)) misses.push(`the boss (${L.arena.boss}) at ${b.x},${b.y}`); }

  // gold nobody can get to is worse than none: count the coins outside the fill (list them for one level)
  const lost = L.ents.filter(e => e.t === 'coin' && !jumpNear(e.x, e.y));
  if (lost.length) { if (!assisted) bad++; console.log(`== ${lv.id}: ${lost.length} coin${lost.length > 1 ? 's' : ''} outside the fill${assisted ? ' (ASSISTED level: may be a mover away)' : ''}` + (want ? '\n  ' + lost.map(e => e.x + ',' + e.y).join(' ') : '')); }
  const pct = Math.round(seen.size / Math.max(1, footing.size) * 100);
  const head = `== ${lv.id} (${W}x${L.H})  reached ${pct}% of the footing${assisted ? '   [ASSISTED: has movers/wind/doors the model cannot follow]' : ''}`;
  if (!misses.length) { if (want) console.log(head + '\n  everything is reachable.'); continue; }
  console.log(head);
  for (const m of misses) { console.log('  ' + (assisted ? 'ASSISTED?  ' : 'UNREACHABLE  ') + m); bad++; }
}
console.log(bad ? `\n${bad} to check by hand.` : '\nnothing stranded.');
