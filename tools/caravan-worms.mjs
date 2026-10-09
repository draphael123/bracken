// tools/caravan-worms.mjs - THE SUNKEN CARAVAN's SANDWORMS, IN PLAY, PER HERO, WITH REAL KEYS (claude/caravan2; Daniel 10-09: "the mini sand worms must appear" -
// they never did: no row ever placed one in the caravan). A page check (PORT). For every placed sandworm (src/draft/sunken-caravan.js WORMS) and every hero
// (knight, warden, pyro by default), a fresh save, no god, every other foe gone, the hero walks into its bed from outside with the keys a hand holds:
//   EMERGES   the worm is drawn (src/desert-foes2.js sandwormShown: its ripple, its dome, its body) once the hero is on its sand
//   TOLD      it winds up its strike on a mark: the dome (lungeTell), the red !! over it (src/marks.js) and the sound (windingUp)
//   LANDS     a hero who stands on the dome is struck (the first strike is taken standing still)
//   KILLED    after that the hero lets the ripple come, steps off each dome as it rises and cuts it while it is up and swaying (exposed): it dies within 60 s
//   PORT=8787 node tools/caravan-worms.mjs [heroes]
import { openPage } from './cdp.mjs';
const HEROES = (process.argv[2] || 'knight,warden,pyro').split(',');
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const pg = await openPage({ audio: false, fonts: false });
try {
  for (const hero of HEROES) {
    const R = await pg.evalp(`(async()=>{
      const { LEVELS } = await import('/src/level.js'); const TS = 16, id = LEVELS.findIndex(l => l.id === 'caravan');
      BK.manualSimulation = true; const out = [];
      const worms = LEVELS[id].build().ents.filter(e => e.t === 'sandworm');
      for (const w of worms) {
        BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true }); BK.load(id); BK.state = 'play'; BK.god = false; BK.sim(5);
        const P = () => BK.P, k = BK.keys, clear = () => { for (const q of ['left', 'right', 'jump', 'down', 'up', 'atk', 'block']) k[q] = false; };
        const worm = BK.enemies().find(e => e.t === 'sandworm' && Math.abs(e.x - (w.x * TS + 8)) < 20);
        for (const e of BK.enemies()) if (e !== worm) e.alive = false;
        if (!worm) { out.push({ squad: w.squad, err: 'not spawned' }); continue; }
        const bed0 = w.bed[0], from = bed0; BK.tp(from, w.y);   /* at the edge of its sand (outside it a quicksand pit or a slope may stand)*/ P().vx = 0; clear(); BK.sim(10);
        const r = { squad: w.squad, x: w.x, shown: false, tell: null, mark: null, heard: false, took: 0, firstHit: false, dead: false, secs: 0, modes: {} };
        let phase = 'stand', dodgeT = 0, dodgeDir = 1, f = 0;
        for (; f < 60 * 60 && worm.alive; f++) {
          P().hp = Math.max(P().hp, 30); P().sun = { v: 0 };   /* the sun and a long fight are not what is measured here */
          const s = worm.st; r.modes[s.mode] = 1;
          if (s.mode !== 'lurk' && s.mode !== 'under' && s.mode !== 'deep') r.shown = true;
          if (s.mode === 'lungeTell' && !r.tell) { r.tell = worm.mode; r.mark = BK.markOf(worm); r.heard = BK.telling(worm); }
          clear(); const dx = worm.x - P().x;
          if (phase === 'stand') { if (Math.abs(P().x - (w.x * TS + 8)) > 6 && !r.tell) k[(w.x * TS + 8) > P().x ? 'right' : 'left'] = true; }   /* walk in to its middle, then stand: the first dome is taken standing */
          else if (s.mode === 'lungeTell') { if (dodgeT <= 0) { dodgeT = 22; dodgeDir = Math.sign(P().x - worm.x) || 1; }   /* a step and a bit off the dome: its strike is a tile wide */ }
          if (dodgeT > 0) { dodgeT--; k[dodgeDir > 0 ? 'right' : 'left'] = true; }
          else if (phase === 'fight' && (s.mode === 'exposed' || s.mode === 'lunge' || s.mode === 'burrow')) { if (Math.abs(dx) > 14) k[dx > 0 ? 'right' : 'left'] = true; else { P().face = Math.sign(dx) || 1; if (P().atk < 0) BK.press('atk'); } }
          else if (phase === 'fight' && (s.mode === 'lurk' || s.mode === 'deep') && Math.abs(P().x - (w.x * TS + 8)) > 10) k[(w.x * TS + 8) > P().x ? 'right' : 'left'] = true;   /* knocked off its sand: back onto it */
          const hp0 = P().hp; BK.sim(1); if (P().hp < hp0) { r.took += hp0 - P().hp; if (phase === 'stand') { r.firstHit = true; phase = 'fight'; } }
          if (phase === 'stand' && f > 60 * 12) phase = 'fight';
          if (f % 60 === 0) (r.log ||= []).push(s.mode + ':' + worm.hp + ':' + Math.round(worm.x - P().x) + ':' + phase);
        }
        r.dead = !worm.alive; r.secs = +(f / 60).toFixed(1); r.modes = Object.keys(r.modes).join(','); out.push(r); clear();
      }
      return out; })()`, 1800000);
    console.log('\n== ' + hero);
    for (const r of R) {
      if (r.err) { ok(false, r.squad + ': ' + r.err); continue; }
      ok(r.shown, r.squad + ' @' + r.x + ': EMERGES - drawn once the hero is on its sand (modes ' + r.modes + ')');
      ok(r.tell === 'lungeTell' && r.mark === '!!' && r.heard, r.squad + ': TOLD - its dome (' + r.tell + '), the mark ' + r.mark + ', heard ' + r.heard);
      ok(r.firstHit, r.squad + ': LANDS - a hero standing on the dome is struck');
      ok(r.dead, r.squad + ': KILLED - stepped off and cut while it is up: ' + (r.dead ? 'dead in ' + r.secs + ' s' : 'still alive after ' + r.secs + ' s') + ' (took ' + r.took + ')' + (r.dead ? '' : ' ' + (r.log || []).join(' ')));
    }
  }
} finally { await pg.close(); }
console.log(fails ? '\nFAIL  caravan-worms: ' + fails : '\nok  caravan-worms: every sandworm in the caravan emerges, is told, lands and can be killed, by every hero');
process.exit(fails ? 1 : 0);
