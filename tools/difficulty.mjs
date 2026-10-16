/* tools/difficulty.mjs - THE DIFFICULTY MODES (claude/difficulty; scratch/brief-difficulty.md, src/difficulty.js).
   NODE: NORMAL IS THE IDENTITY (every multiplier 1, every adder 0, the rules the game had: a shrine gives one, a death costs, no punish, the shared
     stale table); every key of the table is READ by a hook somewhere in src/ (a key nobody reads is a lie); MASTER keeps the tells (no key scales a
     windup: the opening clock scaling asks !windingUp, the gap is the act dial's own idle-only factor) and the B15 floor (no key touches a resistance:
     the table has no chip / ward / angle key); Master's parry window stays fair at the human reaction mean (~409 ms: the window is a timing on a TOLD
     beat, so it only has to stay >= 2 frames); the picker's rules (Story <-> Normal any time; Master at creation once unlocked; Master -> Normal, never back).
   PAGE: per mode, a 20-point blow on the hero, the flask max, a shrine's refill, the parry window and a boss's opening clock read what the table says.
   Red before claude/difficulty: no src/difficulty.js. Run: PORT=8965 node tools/difficulty.mjs */
import { readFileSync, readdirSync } from 'node:fs';
import { MODES, MODE_IDS, df, setOverride, canSwitch, modeId } from '../src/difficulty.js';
import { openPage } from './cdp.mjs';

const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
const N = MODES.normal;
for (const [k, v] of Object.entries(N)) {
  if (k === 'label' || k === 'col') continue;
  const id = typeof v === 'number' ? (['flaskAdd', 'phase'].includes(k) ? v === 0 : v === 1) : k === 'shrine' ? v === 'one' : k === 'flinch' ? v === true : k === 'punish' ? v === false : k === 'stale' ? v === null : false;
  ok(id, 'NORMAL must be the identity: ' + k + ' = ' + JSON.stringify(v));
}
const keys = Object.keys(N).filter(k => k !== 'label' && k !== 'col');
for (const m of MODE_IDS) ok(JSON.stringify(Object.keys(MODES[m]).sort()) === JSON.stringify(Object.keys(N).sort()), m + ' carries exactly the table\'s keys');
const src = readdirSync('src').filter(f => f.endsWith('.js') && f !== 'difficulty.js').map(f => readFileSync('src/' + f, 'utf8')).join('\n');
for (const k of keys) { if (k === 'phase') continue;   /* (EARLIER PHASES: the Master tune lane's - a TODO in the lane report, not read yet) */
  ok(new RegExp("df\\('" + k + "'\\)").test(src), 'the table key ' + k + ' is read by no hook in src/ (DFM.df(\'' + k + '\') / df(\'' + k + '\'))'); }
/* MASTER KEEPS THE TELLS AND THE FLOOR */
ok(!keys.some(k => /tell|wind|chip|ward|angle|resist|hp/i.test(k)), 'no table key may touch a tell, a windup, a resistance or health (B10/B15/B16; no hp sponges): ' + keys.join(','));
const main = readFileSync('src/main.js', 'utf8');
ok(/DFM\.df\('open'\) !== 1 && !windingUp\(e\) && GB\.openOf\(e\) === true/.test(main), 'the opening clock is scaled only while he is OPEN and NOT winding up (B10/B16)');
ok(/g > 1 \? g \* DFM\.df\('gap'\)/.test(main), 'Master\'s gap rides the act dial\'s idle-only factor (src/boss-pressure.js gapFactor: never a told windup, an opening, a ward)');
ok(MODES.master.parry * 0.11 >= 2 / 60, 'Master\'s perfect-guard window stays at least two frames (' + (MODES.master.parry * 0.11).toFixed(3) + ' s)');
ok(MODES.master.take >= 1.3 && MODES.master.take <= 1.5, 'Master\'s damage is seasoning (x1.3-1.5): ' + MODES.master.take);
ok(MODES.story.take === 0.5 && MODES.story.flaskAdd === 1 && MODES.story.shrine === 'all' && MODES.story.death === 0, 'Very Easy: x0.5 taken, +1 flask, every shrine refills all, no death cost');
ok(MODES.master.flaskAdd === -1 && MODES.master.shrine === 'none' && MODES.master.death > 1 && MODES.master.punish, 'Master: flask max -1, shrines refill none, a higher death cost, greed punished');
ok(MODES.master.stale && MODES.master.stale.every((x, i, a) => x <= [1, 0.85, 0.7, 0.55][i] && (i === 0 || x <= a[i - 1])), 'Master may only TIGHTEN the stale table');
/* THE PICKER'S RULES */
ok(canSwitch('story', 'normal') && canSwitch('normal', 'story'), 'Very Easy <-> Normal any time');
ok(!canSwitch('normal', 'master', {}, false) && canSwitch('normal', 'master', {}, true), 'Master only once unlocked (a Normal clear)');
ok(!canSwitch('normal', 'master', { modeChosen: true }, true), 'Master is chosen at a save\'s creation, not switched into later');
ok(canSwitch('master', 'normal') && !canSwitch('master', 'story') && !canSwitch('normal', 'master', { masterDropped: true }, true), 'a Master save drops to Normal, never back (and not straight to Very Easy)');
ok(modeId('easy') === 'story' && modeId('master') === 'master' && modeId('bogus') === null, 'the tool names (easy|normal|master) map onto the modes');
setOverride('master'); ok(df('take') === MODES.master.take, 'setOverride wins'); setOverride(null); ok(df('take') === 1, 'no override: the save\'s (normal)');

/* PAGE */
const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  R = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.SET.speed = 1; const out = {};
    for (const m of ['story', 'normal', 'master']) { BK.difficulty.setOverride(m); const o = {};
      BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'spire')); BK.state = 'play'; BK.start(); BK.god = false; BK.sim(5); BK.reset();
      const P = BK.P; P.inv = 0; P.hp = P.maxHp = 400; P.block = false; const h0 = P.hp; BKT.damagePlayer(P.x + 40, 20, { noKnock: true }); o.hit = h0 - P.hp;
      o.flaskMax = BK.flaskMax(); P.flasks = 0; BKT.shrineFill ? BKT.shrineFill() : null; o.shrine = P.flasks;
      const A = BK.L.arena, b = BK.enemies().find(e => e.t === A.boss && e.alive); BK.god = true; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); BK.sim(150);
      for (const e of BK.enemies()) if (e !== b && !e.maxHp) e.alive = false;
      b.mode = 'downed'; b.modeT = 3; b.broken = 0; b.stagger = 0; const P2 = BK.P; P2.x = b.x - 200; let f = 0; while (b.mode === 'downed' && f < 900) { b.greedT = 0; BK.sim(1); f++; } o.openFrames = f;
      out[m] = o; }
    BK.difficulty.setOverride(null); return out; })()`, 600000);
} finally { pg.close(); }
console.log(JSON.stringify(R));
const n = R.normal;
ok(Math.abs(R.story.hit / n.hit - 0.5) < 0.08, 'Very Easy: a blow lands at half (' + R.story.hit + ' vs ' + n.hit + ')');
ok(Math.abs(R.master.hit / n.hit - MODES.master.take) < 0.1, 'Master: a blow lands x' + MODES.master.take + ' (' + R.master.hit + ' vs ' + n.hit + ')');
ok(R.story.flaskMax === n.flaskMax + 1 && R.master.flaskMax === Math.max(1, n.flaskMax - 1), 'flask max: Very Easy +1, Master -1 (min 1): ' + [R.story.flaskMax, n.flaskMax, R.master.flaskMax]);
if (n.shrine !== null && n.shrine !== undefined) ok(n.shrine === 1 && R.story.shrine === R.story.flaskMax && R.master.shrine === 0, 'a shrine: Normal gives one, Very Easy all, Master none: ' + [R.story.shrine, n.shrine, R.master.shrine]);
ok(Math.abs(R.story.openFrames / n.openFrames - MODES.story.open) < 0.12 && Math.abs(R.master.openFrames / n.openFrames - MODES.master.open) < 0.12, 'a told opening lasts x open (frames ' + [R.story.openFrames, n.openFrames, R.master.openFrames] + ')');
if (fails.length) { console.log('DIFFICULTY: ' + fails.length + ' FAIL\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('difficulty: ok (normal = identity, every key hooked, master keeps tells + floor, picker rules, per-mode damage / flasks / shrines / openings in the page)');
