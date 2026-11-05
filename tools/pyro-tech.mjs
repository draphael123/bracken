// tools/pyro-tech.mjs - THE PYROMANCER'S L25-L50 KIT (claude/pyropack). NODE ONLY: no browser, no page. Reads the data (src/tech-pyro.js), runs every pure rule in
// src/pyro-tech.js with real numbers, and reads src/main.js + src/lab.js as text to prove each technique and upgrade id is wired and every new blow is swordDmg x k.
// What only a browser shows (the look and sound of each tell, a real-key check) is listed in the lane report as owed.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PYRO_TECH, PYRO_UPGRADES } from '../src/tech-pyro.js';
import * as W from '../src/pyro-tech.js';
import * as PR from '../src/progression.js';
const bad = []; const check = (n, f) => { try { f(); } catch (e) { bad.push(n + ': ' + e.message); } };
const rd = f => readFileSync(new URL('../src/' + f, import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const MAIN = rd('main.js'), LAB = rd('lab.js'), SKK = rd('skill-k.js');
const ALL = PR.TECH_LEVELS.flatMap(n => PR.techniquesAt('pyro', n));
const body = (name) => { const i = MAIN.indexOf('function ' + name + '('); assert(i > 0, name); const j = MAIN.indexOf('\nfunction ', i + 10); return MAIN.slice(i, j > 0 ? j : i + 3000); };

check('data: fixed 25/35/45, forks 30/40/50 with differing roles and one trade line, capstone pair, 8 upgrades, unique ids', () => {
  assert.deepEqual(PR.FORK_LEVELS, [30, 40, 50]); assert.deepEqual(Object.keys(PYRO_TECH).map(Number), PR.TECH_LEVELS);
  for (const n of [25, 35, 45]) assert(!PR.isFork('pyro', n), 'L' + n + ' fixed');
  for (const n of PR.FORK_LEVELS) { const [a, b] = PR.techniquesAt('pyro', n); assert(PR.isFork('pyro', n) && a.role && b.role && a.role !== b.role && a.trade && a.trade === b.trade, 'L' + n); }
  assert.deepEqual(PR.techniquesAt('pyro', 50).map(t => t.id), ['pstar', 'pshower']); assert(PR.techniquesAt('pyro', 50).every(t => t.capstone));
  assert.equal(PYRO_UPGRADES.length, 8); const ids = ALL.map(t => t.id).concat(PYRO_UPGRADES.map(u => u.id)); assert.equal(new Set(ids).size, ids.length);
  for (const t of ALL) { assert(t.name && t.what && t.teach && t.input, t.id); assert(t.k === null || (t.k > 0 && t.k <= 6.0), 'k ' + t.id); }
  for (const u of PYRO_UPGRADES) assert(u.what.length === 2 && u.what[0] && u.what[1], u.id);
  assert.equal(PR.techniquesAt('pyro', 30)[0].k, W.PT.nova.k); assert.equal(PR.techniquesAt('pyro', 30)[1].k, 0.9); assert.equal(PR.techniquesAt('pyro', 50)[1].k, W.PT.shower.k);
  assert.equal(PR.techniquesAt('pyro', 50)[0].k, 3.0 * W.PT.star.mul, 'the card says the star hits x4.5 of a sword (k 3.0 x 1.5)');
});
check('every technique and upgrade id is read (tech / upg in main.js)', () => {
  for (const t of ALL) assert(MAIN.includes("tech('" + t.id + "')"), 'tech id not read: ' + t.id);
  for (const u of PYRO_UPGRADES) assert(MAIN.includes("upg('" + u.id + "')"), 'upgrade id not read: ' + u.id);
});
check('L25 KINDLING: +5 heat a burst, only when owned', () => { assert.equal(W.kindle(true), 5); assert.equal(W.kindle(false), 0); });
check('L30 A WARD NOVA: ring 70 px, small foe x0.8 + pip, boss/mini a pip only, outside nothing; B TRAILING EMBER: a step 3-5 ball only', () => {
  assert.deepEqual(W.nova(true, false, 40), { dmg: 0.8, pips: 1 }); assert.deepEqual(W.nova(true, true, 40), { dmg: 0, pips: 1 }); assert.equal(W.nova(true, false, 71), null); assert.equal(W.nova(false, false, 10), null);
  for (const st of [1, 2, 6]) assert.equal(W.trail(true, st), null, 'step ' + st); for (const st of [3, 4, 5]) assert.deepEqual(W.trail(true, st), { step: 1, wait: 0.25 }); assert.equal(W.trail(false, 4), null);
});
check('L35 WHITE HEAT: +3 s on 5 and on BLAZE 10', () => { assert.equal(W.fullHold(5, true), 8); assert.equal(W.fullHold(10, true), 13); assert.equal(W.fullHold(5, false), 5); });
check('L40 A CONCUSSIVE BURST: 0.5 s on a small foe, never a boss/mini; B PHOENIX STEP: x1.25, small foes only, near the body', () => {
  assert.equal(W.conc(true, false), 0.5); assert.equal(W.conc(true, true), 0); assert.equal(W.conc(false, false), 0);
  assert.equal(W.stepMul(true), 1.25); assert.equal(W.stepMul(false), 1); assert(W.wakeCatch(true, false, 10, 0)); assert(!W.wakeCatch(true, true, 0, 0), 'a boss is not marked'); assert(!W.wakeCatch(true, false, 40, 0)); assert(!W.wakeCatch(false, false, 0, 0));
});
check('L45 SLOW FUSE + WIDE BURST: pips 10 s, reach +16 (+8/+16)', () => {
  assert.equal(W.pipLife(6, true), 10); assert.equal(W.pipLife(6, false), 6); assert.equal(W.burstReach(66, false, 0), 66); assert.equal(W.burstReach(66, true, 0), 82); assert.equal(W.burstReach(66, true, 2), 98);
});
check('upgrades: ranked multipliers move the right way and clamp', () => {
  assert.equal(W.upMul('stoke', 2), 1.3); assert.equal(W.upMul('parry', 2), 6); assert.equal(W.upMul('cost', 2), 0.8); assert.equal(W.upMul('burn', 1), 1.2); assert.equal(W.upMul('heat', 2), 1.2); assert.equal(W.upMul('fire', 2), 1.1); assert.equal(W.upMul('fuel', 2), 0.7);
  assert.equal(W.upMul('fire', 9), 1.1); assert.equal(W.upMul('fire', -1), 1); assert.equal(W.upMul('reach', 0), 0);
});
check('L50 A STAR FALL reshapes the meteor; not owned = the old numbers exactly; B METEOR SHOWER replaces it', () => {
  const base = { tell: 0.9, R: 56, capPct: 0.04, capMini: 0.10, burn: 3 }; assert.deepEqual(W.meteorShape(base, false), { ...base, mul: 1 });
  const st = W.meteorShape(base, true); assert(st.tell > base.tell && st.R > base.R && st.mul === 1.5 && st.capPct > base.capPct && st.capPct <= 0.05 && st.capMini <= 0.12);
  assert.equal(W.capstone(false, false), null); assert.equal(W.capstone(true, false), 'star'); assert.equal(W.capstone(false, true), 'shower');
});
check('L50 B METEOR SHOWER: 5 spots 60-300 ahead both ways, 0.3 s apart, snapping to a near foe; one lone boss takes less than the star', () => {
  for (const face of [1, -1]) { const p = W.showerPlan(face, 100, []); assert.equal(p.length, 5); const d = p.map(o => (o.x - 100) * face); assert(d[0] >= 59.99 && d[4] <= 300.01); assert(d.every((x, i) => !i || x > d[i - 1]), 'ascending, no stacking'); assert(p.every(o => !o.done && !o.snapped));
    assert(Math.abs(p[4].at - 1.2) < 1e-9 && Math.abs(p[1].at - 0.3) < 1e-9); }
  const p = W.showerPlan(1, 0, [118, 500]); assert(p[1].snapped && p[1].x === 118 && p.filter(o => o.snapped).length === 1, 'one foe pulls one spot');
  const S = W.PT.shower, gap = (S.to - S.from) / (S.n - 1), hit = Math.floor((2 * (S.R + 20)) / gap + 1e-9) + 1;   /* a ~40 px boss: spots within R + half his width */
  const showerBoss = hit * S.capPct, starBoss = W.PT.star.capPct;
  assert(showerBoss < starBoss, 'the shower is the crowd capstone: ' + (showerBoss * 100).toFixed(1) + '% of a boss vs the star ' + starBoss * 100 + '%');
  assert(S.n * S.k >= 5, 'a crowd takes a real cast');
});
check('law: every new blow is swordDmg x k, bosses get capped damage only, nothing heals', () => {
  const land = body('showerLand'); assert(/sw \* S\.k \* amul\('meteorFall'\) \* m\.hm/.test(land) && /capPct/.test(land) && !/heal|\.hp \+=|pinFoe|stagger/.test(land));
  const nova = body('pyParryTech'); assert(/sw \* r\.dmg \* amul\('livingBomb'\) \* hm/.test(nova) && !/heal|\.hp \+=|stagger/.test(nova), 'nova = sword x k; a boss gets r.dmg 0');
  assert(/sw \* SKK\.K\.meteorFall \* \(m\.mul \|\| 1\) \* amul\('meteorFall'\) \* m\.hm/.test(MAIN), 'star = the meteor x its mul');
  const det = body('pyDetonate'); assert(/PYT\.conc\(!!tech\('pconc'\), big\)/.test(det), 'concussive: bosses get 0'); assert(/rpWardT/.test(det) && /broken/.test(det), 'never in a ward or break');
  const tt = body('pyTechTick'); assert(/!!e\.maxHp \|\| !!e\.mini/.test(tt) && /inFlight/.test(tt), 'wake skips bosses; trail respects the in-flight cap');
  assert(!/hurtFire|hurtAs/.test(tt), 'the wake and the trailing ember only mark and lob (the ember is an ordinary step-1 ball with the ball table k)');
  assert(SKK.includes('meteorFall: 3.0'), 'the base meteor k is unchanged (the card quotes 4.5 = 3.0 x 1.5)');
});
check('wiring: cast reshapes/replaces, heat hooks, ward hook, dodge, HUD name, the bot already casts UP+C at a full bar', () => {
  const cast = body('castMeteorFall'); assert(/cap === 'shower'/.test(cast) && /P\.heat = 0/.test(cast) && /P\.full = false/.test(cast), 'the bar is spent before either branch');
  assert(MAIN.includes("PYT.fullHold(tal('blaze') ? 10 : 5, !!tech('pwhite'))") && MAIN.includes("PYT.upMul('fuel', upg('ufuel'))") && MAIN.includes("PYT.upMul('heat', upg('uheat'))") && MAIN.includes("PYT.upMul('stoke', upg('ustoke'))"));
  assert(MAIN.includes('parried: f => { RP.parried(f); pyParryTech(f); }') && MAIN.includes("PYT.stepMul(!!tech('pstep'))") && MAIN.includes("PYT.upMul('cost', upg('ucost'))") && MAIN.includes("PYT.upMul('burn', upg('uburn'))") && MAIN.includes("PYT.upMul('fire', upg('ufire'))"));
  assert(MAIN.includes("tech('pshower') ? 'METEOR SHOWER' : tech('pstar') ? 'STAR FALL' : 'METEOR FALL'") && MAIN.includes('meteorTick(dt); pyTechTick(dt);') && MAIN.includes('const lbLife = () =>') && !/PYRO_KIT\.lb\.life/.test(MAIN.replace(/const lbLife[^\n]*/, '')));
  assert(/METEOR FALL IS FOR SPENDING|BANKED METEOR FALL/.test(LAB), 'the lab bot spends a full bar with UP+C (the pick reshapes what the press does)');
});
check('a save with the kit: respec + picks owed still balance for the pyromancer', () => {
  const p = { card: { pyro: { v: 0, e: 0, m: 0, ms: {} } } }; for (const n of PR.TECH_LEVELS) { const o = PR.perkOffer(p, 'pyro', n); assert(o[0].tech && o[0].rec); assert.equal(PR.pickMilestone(p, 'pyro', n, o[0].id, 50), null); }
  assert.equal(PR.techOn(p, 'pyro', 'pstar'), true); assert(PR.forkLocked(p, 'pyro', 'pshower'));
  PR.validateProgress(JSON.parse(JSON.stringify(p))); PR.respecCard(p, 'pyro'); assert.deepEqual(p.card.pyro.ms, {});
  const q = { card: { pyro: { v: 0, e: 0, m: 0, ms: {} } } }; for (const [n, id] of [[25, 'pkindle'], [30, 'ptrail'], [35, 'pwhite'], [40, 'pstep'], [45, 'pfuse'], [50, 'pshower']]) PR.pickMilestone(q, 'pyro', n, id, 50);
  for (const id of ['pkindle', 'ptrail', 'pwhite', 'pstep', 'pfuse', 'pshower']) assert(PR.techOn(q, 'pyro', id), id); for (const id of ['pnova', 'pconc', 'pstar']) assert(PR.forkLocked(q, 'pyro', id), id);
});
if (bad.length) { console.log('PYRO-TECH: ' + bad.length + ' problem(s)\n  - ' + bad.join('\n  - ')); process.exit(1); }
console.log('Pyro tech: 3 fixed + 3 forks (pairs differ in role, one trade line, capstone pair), 8 upgrades, every rule with real numbers, every id wired, blows are swordDmg x k, bosses never staggered or pinned by a new technique, the shower is the crowd capstone');
