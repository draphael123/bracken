// tools/glasssea-slide.mjs - THE GLASS SEA's SLIDE GAP, MEASURED PER HERO WITH REAL KEYS (claude/slickslope). A page check (PORT).
// Daniel 10-07, playing the GEOMANCER at L32 on the live site: "This jump can't be beat by the geomancer." Every check before this one said the gap was fine:
//   - src/reachcore.js credits a SIX-tile run-jump across (JUMP_ACROSS), so the five-wide crack read as a plain jump for anyone (the fill has no slide at all);
//   - tools/glasssea-route.mjs's hand slid and leapt FRAME-PERFECT (the last frame on the foot, the jump held 26 frames) and passed on `col() >= 148`: it landed
//     on the far lip with its toes (the mantle caught it) and nothing to spare, and nobody measured how wide the window a person has to hit was;
//   - tools/checkpoint-stand.mjs waived the gap as "measured by tools/glasssea.mjs" - which is Node only and never measured it.
// This measures what a player has, not what a bot can do: for EVERY hero (knight, warden, pyro, paladin, pirate, reaper, geomancer), a fresh save, base movement,
// god and no foes, keys held as a hand holds them (BK.keys, BK.press - the keyboard's own path):
//   A  THE TEACH IS REAL: a plain running jump (no slide) from the very edge of the foot falls in.
//   B  THE SLIDE CLEARS IT WITH ROOM: from the crest, right + DOWN held, a full jump off the foot lands >= SPARE_FOOT tiles past the far lip.
//   C  A HUMAN'S WINDOW: the slide-jump clears the lip (no toe-hold on it) from >= WINDOW frames of take-off, and every take-off from the last WIN_TILES
//      tiles before the crack (the slope's foot and the foot itself) lands >= SPARE_MIN tiles past the far lip.
//   D  A SHORTER PRESS: the same with the jump held 14 frames (a quick press, not a tap) - the foot still clears with room (>= SPARE_SHORT).
//   E  DOWN STILL HELD as the jump is pressed (the sign says HOLD DOWN... THEN JUMP: a hand keeps it down) - the foot still clears with room.
//   PORT=8718 node tools/glasssea-slide.mjs [heroes]   exit 1 on any failure; prints the numbers per hero
import { openPage } from './cdp.mjs';
const HEROES = (process.argv[2] || 'knight,warden,pyro,paladin,pirate,reaper,geomancer').split(',');
const SPARE_FOOT = 1.0, SPARE_MIN = 0.75, SPARE_SHORT = 0.75, WINDOW = 20, WIN_TILES = 2;
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const pg = await openPage({ audio: false, fonts: false });
try {
  for (const hero of HEROES) {
    const r = await pg.evalp(`(async()=>{
      const { LEVELS } = await import('/src/level.js'); const TS = 16;
      BK.manualSimulation = true; BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true });
      BK.load(LEVELS.findIndex(l => l.id === 'glasssea')); BK.state = 'play'; BK.god = true; BK.sim(5);
      for (const e of BK.enemies()) if (!e.boss) e.alive = false;
      const L = BK.level, gap = L.cracks.find(c => c.id === 'slideGap'), lipX = (gap.x1 + 1) * TS, edgeX = gap.x0 * TS;
      const P = () => BK.P, k = BK.keys, falls = () => BK.glassSea().n.falls;
      const clear = () => { for (const q of ['left', 'right', 'jump', 'down', 'up', 'atk', 'block']) k[q] = false; };
      const sg = L.ents.find(e => e.t === 'sign' && /HOLD DOWN TO SLIDE/.test(e.text)), crest = sg.x;
      const start = () => { BK.tp(crest, sg.y); P().vx = P().vy = 0; clear(); BK.sim(20); let n = 0;
        while (Math.abs(P().x - (crest * TS + 8)) > 2 && n++ < 200) { clear(); k[(crest * TS + 8) > P().x ? 'right' : 'left'] = true; BK.sim(1); } clear(); P().vx = 0; BK.sim(10); };
      /* one try: hold right (+down when slide) for f frames, then press jump (held hold frames, down kept if keepDown); null when it left the ground first */
      const one = (f, slide, hold, keepDown) => { start(); const f0 = falls();
        for (let i = 0; i < f; i++) { k.right = true; k.down = slide; BK.sim(1); if (!P().ground) return null; }
        const x0 = P().x, vx0 = P().vx; k.down = slide && keepDown; k.jump = true; BK.press('jump');
        for (let j = 0; j < 150; j++) { k.right = true; k.down = slide && keepDown; k.jump = j < hold; BK.sim(1); if (falls() > f0) break; if (j > 4 && P().ground) break; }
        clear(); const fell = falls() > f0; return { f, x0: +(x0 / TS).toFixed(2), vx0: Math.round(vx0), fell, spare: fell ? null : +((P().x - lipX) / TS).toFixed(2) }; };
      const sweep = (slide, hold, keepDown) => { const out = []; for (let f = 0; f < 400; f++) { const q = one(f, slide, hold, keepDown); if (!q) break; out.push(q); } return out; };
      const full = sweep(true, 26, false), short = sweep(true, 14, false), held = sweep(true, 26, true), run = sweep(false, 26, false);
      return { gap: [gap.x0, gap.x1, gap.y], crest, edge: gap.x0, full, short, held, run, vmax: Math.max(...full.map(q => q.vx0)) };
    })()`, 900000);
    const across = q => q && !q.fell && q.spare >= 0, last = a => a[a.length - 1];
    const foot = a => last(a), winMin = a => { const w = a.filter(q => q.x0 >= r.edge - WIN_TILES); return w.length ? Math.min(...w.map(q => q.fell ? -9 : q.spare)) : -9; };
    const windowN = a => a.filter(across).length;
    console.log('\n== ' + hero + '  (gap ' + r.gap.join(',') + ', crest ' + r.crest + ', top slide ' + r.vmax + ' px/s)');
    ok(foot(r.run).fell || foot(r.run).spare < 0, 'A  a plain running jump from the foot\'s edge does not make the far side (' + (foot(r.run).fell ? 'fell in, at ' + foot(r.run).vx0 + ' px/s' : 'only a toe-hold on the lip, ' + foot(r.run).spare + ' tiles: the mantle') + ')');
    ok(across(foot(r.full)) && foot(r.full).spare >= SPARE_FOOT, 'B  the slide-jump off the foot lands ' + (foot(r.full).fell ? 'IN THE CRACK' : foot(r.full).spare + ' tiles past the far lip') + ' (>= ' + SPARE_FOOT + ')');
    ok(windowN(r.full) >= WINDOW && winMin(r.full) >= SPARE_MIN, 'C  ' + windowN(r.full) + ' frames of take-off clear it (>= ' + WINDOW + '); the worst take-off from the last ' + WIN_TILES + ' tiles lands ' + winMin(r.full) + ' tiles past (>= ' + SPARE_MIN + ')');
    ok(across(foot(r.short)) && foot(r.short).spare >= SPARE_SHORT, 'D  a 14-frame jump off the foot lands ' + (foot(r.short).fell ? 'IN THE CRACK' : foot(r.short).spare + ' tiles past') + ' (>= ' + SPARE_SHORT + '); window ' + windowN(r.short) + ' frames');
    ok(across(foot(r.held)) && foot(r.held).spare >= SPARE_FOOT, 'E  DOWN still held through the jump: ' + (foot(r.held).fell ? 'IN THE CRACK' : foot(r.held).spare + ' tiles past') + ' (>= ' + SPARE_FOOT + '); window ' + windowN(r.held) + ' frames');
    if (process.argv.includes('--v')) for (const k of ['full', 'short', 'held', 'run']) console.log('   ' + k + ': ' + r[k].filter(q => q.x0 >= r.edge - 6).map(q => q.x0 + (q.fell ? 'X' : '>' + q.spare) + '@' + q.vx0).join(' '));
  }
} finally { await pg.close(); }
console.log(fails ? '\nFAIL  glasssea-slide: ' + fails : '\nok  glasssea-slide: every hero clears the slide gap with room, and a plain jump does not');
process.exit(fails ? 1 : 0);
