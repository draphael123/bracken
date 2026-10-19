// tools/foe-pass.mjs - THE FOE PASS CORE, ITS RULES (Node; claude/foepass, scratch/brief-foepass-1016.md + brief-polishpro-1016.md 1 + brief-bloodknight-1017.md 1).
// The page half is tools/foe-pass-page.mjs. This one holds the tables and the pure rules, and GATES the act I-II told attacks:
//   LEVER 2  the break bar: a varied blow pays FB.varied, the same one again FB.stale[n] (never more than x1, the floor > 0); a varied LIGHT verb leans
//            on a light bar and a stale one never does; the finisher refunds wind + ~3% max hp (never under hpMin) - src/foe-break.js
//   LEVER 4b every family that stands in an ACT I or II level (a common foe with a told blow, src/marks.js) has ONE signature in src/told-attacks.js
//            SIG whose blow is a real MARK row and whose answer agrees with it (PARRY = a yellow ! the shield turns; JUMP = a low blow; DUCK = a high
//            one) - or a line in TOLD_TODO (its every blow is a red !!: its act sweep builds it a new one). TOLD_TODO may only SHRINK (BASE_TODO below).
//            Acts III-V are REPORTED (the sweep lanes' list). The pose shape and the parry lane, on a stub foe.
//   LEVER 3  four affixes, one a foe at most; SHIELDED takes >= B15's 0.4 into its shell (never immune) and the right blow shatters it; HASTED never
//            touches a windup; HEAVY / VOLATILE numbers; the pick is deterministic; FOEPASS's levels are campaign levels; no affix in act I; the
//            density never falls along the acts and Master > Normal > Very Easy - src/foe-affix.js, src/foe-pass.js, src/difficulty.js
//   LEVER 1  every PURSUE kind is a creature the game spawns; a walker's pursuit stays under a hero's run (you can get away), a hunter's over it; the
//            leash is finite; the archer's lead is never perfect (k < 1) and capped; squad roles: a squad of two with no front gets one
//   FEEL     ONE TELL-COLOUR LANGUAGE (gold answer / red get clear / white breakable) in the new reads; the WEAPON weight row; the Death Knight's
//            ward-release parry says THROWN BACK (a move word: it is drawn), refunds >= 14 wind, stops hard, and his yard teaches it (not the roll)
//   HOOKS    main.js calls every one of them (a rule nothing calls is a wish)
//     node tools/foe-pass.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS } from '../src/level.js';
import { ACTS } from '../src/foe-react.js';
import * as MK from '../src/marks.js';
import * as FB from '../src/foe-break.js';
import * as TA from '../src/told-attacks.js';
import * as FA from '../src/foe-affix.js';
import * as FP from '../src/foe-pursuit.js';
import * as FPL from '../src/foe-pass.js';
import { MODES } from '../src/difficulty.js';
import { WEAPON, WEAPON_OF } from '../src/juice.js';

const bad = [], must = (ok, msg) => { if (!ok) bad.push(msg); };
const MAIN = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), LEVEL_SRC = readFileSync(new URL('../src/level.js', import.meta.url), 'utf8');
const actOfId = id => (ACTS.find(a => a.levels.includes(id)) || {}).act;
const campaign = LEVELS.filter(d => !(d.hidden && !d.secret) && !/^(shop|trial_|custom)/.test(d.id));

/* ---- LEVER 2: THE BREAK BAR ---- */
{ const e = {}, seq = ['cut', 'cut', 'cut', 'cut', 'cut'].map((v, i) => FB.vary(e, v, i * 0.3).k);
  must(seq[0] === 1 && seq[1] < 1 && seq[2] < seq[1] && seq[4] > 0, 'the same verb spammed must go stale and never to nothing: ' + seq);
  const f = {}, mix = ['cut', 'sweep', 'rise', 'cut'].map((v, i) => FB.vary(f, v, i * 0.3));
  must(mix[0].k === 1 && mix.slice(1).every(r => r.varied && r.k === FB.FB.varied && FB.FB.varied > 1), 'a varied verb must pay FB.varied: ' + mix.map(r => r.k));
  const hv = {}, hs = ['heavy', 'heavy', 'heavy'].map((v, i) => FB.vary(hv, v, i * 0.3).k); must(hs.every(k => k === 1), 'a heavy is never stale (weight breaks a guard): ' + hs);
  const g = {}; FB.vary(g, 'cut', 0); must(FB.vary(g, 'cut', FB.FB.window + 0.1).k === 1, 'a new exchange (past FB.window) starts clean');
  must(FB.vary({}, 'throw', 0).k === 1 && FB.vary({}, null, 0).k === 1, 'a room\'s blow (a throw) and no verb are never counted');
  const h = {}; FB.vary(h, 'cut', 0); const v2 = FB.vary(h, 'sweep', 0.2), v3 = FB.vary(h, 'sweep', 0.4);
  must(FB.lightAdd(v2, 'sweep', true) > 0 && FB.lightAdd(v3, 'sweep', true) === 0 && FB.lightAdd(v2, 'sweep', false) === 0 && FB.lightAdd(v2, 'heavy', true) === 0, 'only a VARIED LIGHT verb on a LIGHT bar leans on it');
  must(Math.ceil(24 / (FB.FB.lightVaried * FB.FB.varied)) <= 3, 'three varied taps must break a goblin\'s light bar (24)');
  const r1 = FB.refundOf(100), r2 = FB.refundOf(300), r0 = FB.refundOf(10);
  must(r1.hp === 3 && r2.hp === 9 && r0.hp === FB.FB.refund.hpMin && r1.st >= 10, 'the finisher refund: ~3% max hp (min ' + FB.FB.refund.hpMin + ') and wind: ' + JSON.stringify([r0, r1, r2]));
  must(/api\.refund\(\)/.test(readFileSync(new URL('../src/finishers.js', import.meta.url), 'utf8')), 'finishFoe does not pay the refund (src/finishers.js api.refund)'); }

/* ---- LEVER 4b: THE TOLD ATTACKS ---- */
const BASE_TODO = new Set(['thief', 'spitcap', 'sapper', 'emberwisp', 'stormshaman', 'clinger', 'shardling']);   /* (the list may only SHRINK) */
const BLOWS = Object.keys(MK.MARK).filter(k => MK.MARK[k] === '!' || MK.MARK[k] === '!!');
const fams = new Map();   /* kind -> lowest act it stands in */
for (const lv of campaign) { const a = actOfId(lv.id); if (!a) continue; const L = lv.build(), boss = new Set([L.arena && L.arena.boss, L.mini && L.mini.boss]);
  for (const e of [...(L.ents || []), ...(L.ambushes || []).flatMap(A => A.waves.flat().map(f => ({ t: f[0] })))]) {
    if (!e.t || boss.has(e.t) || e.elite || TA.NOT_FAMILY.has(e.t) || MK.HARMLESS.has(e.t) || !BLOWS.some(k => k.startsWith(e.t + '|'))) continue;
    fams.set(e.t, Math.min(fams.get(e.t) ?? 9, a)); } }
const okAnswer = (k, ans) => ans === 'parry' ? MK.MARK[k] === '!' && MK.ANSWER[k] === 'block' : ans === 'jump' ? MK.ANSWER[k] === 'jump' || MK.HEIGHT[k] === 'low' : ans === 'duck' ? MK.HEIGHT[k] === 'high' : false;
for (const [t, r] of Object.entries(TA.SIG)) { const k = t + '|' + r.mode;
  must(MK.MARK[k] === '!' || MK.MARK[k] === '!!', 'SIG ' + t + ': ' + k + ' is no told blow in src/marks.js MARK');
  must(['parry', 'jump', 'duck'].includes(r.answer), 'SIG ' + t + ': the answer must be parry, jump or duck (not ' + r.answer + ')');
  must(okAnswer(k, r.answer), 'SIG ' + t + ': ' + r.answer + ' disagrees with the mark (' + MK.MARK[k] + ', ANSWER ' + MK.ANSWER[k] + ', HEIGHT ' + MK.HEIGHT[k] + ')');
  must(!TA.TOLD_TODO[t], 'SIG ' + t + ' is still on TOLD_TODO: take it off'); }
for (const t of Object.keys(TA.TOLD_TODO)) must(BASE_TODO.has(t), 'TOLD_TODO grew: ' + t + ' (the list may only shrink - give the family its told attack)');
const early = [...fams].filter(([, a]) => a <= 2).map(([t]) => t), late = [...fams].filter(([, a]) => a >= 3).map(([t]) => t);
for (const t of early) must(TA.SIG[t] || TA.TOLD_TODO[t], 'act I-II family ' + t + ' has no told attack (src/told-attacks.js SIG) and no TOLD_TODO line');
const lateMissing = late.filter(t => !TA.SIG[t] && !TA.TOLD_TODO[t]);
{ const o = { dx: 0, dy: 0, sx: 1, sy: 1 }, sprig = { t: 'sprig', mode: 'biteTell', face: 1 }, hound = { t: 'hound', mode: 'pounceTell', face: 1 }, plain = { t: 'sprig', mode: 'walk', face: 1 };
  must(TA.toldPose(o, sprig, 0.2, 1) && o.rot < 0, 'a PARRY signature draws back (toldPose)'); const o2 = { dx: 0, dy: 0, sx: 1, sy: 1 };
  must(TA.toldPose(o2, hound, 0.2, 1) && o2.sy < 1 && o2.sx > 1, 'a JUMP signature goes down low (toldPose)'); must(!TA.toldPose({ dx: 0, dy: 0, sx: 1, sy: 1 }, plain, 0.2, 1), 'no pose outside the signature');
  must(TA.laneFor(sprig, '') === 'parry' && TA.laneFor(hound, 'jump') === 'jump' && TA.laneFor(plain, 'duck') === 'duck', 'the parry lane goes on a parry signature only');
  must(TA.PARRY_PIX.length === 8 && TA.PARRY_PIX.every(r => r.length === 7), 'the parry glyph is 7x8 like the duck and jump lanes'); }
{ const e = { t: 'hound', x: 100, y: 100, alive: true }, hero = { x: 120, y: 100, ground: false, dead: false }; let leaned = 0, said = '';
  const api = { lean: () => { leaned++; }, say: (q, w) => { said = w; } };
  must(TA.released(e, 'pounceTell', hero, 1), 'a hound pouncing at a hero beside it is watched'); hero.y = 80; TA.judge(e, 1.1, hero, false, undefined, api); TA.judge(e, 1.5, hero, false, undefined, api);
  must(leaned === 1 && said === 'OVER IT', 'a hound pounce jumped, unhurt, OVERREACHES (' + leaned + ', ' + said + ')');
  const e2 = { t: 'hound', x: 100, y: 100, alive: true }; hero.y = 100; hero.ground = true; TA.released(e2, 'pounceTell', hero, 2); TA.judge(e2, 2.1, hero, false, undefined, api); TA.judge(e2, 2.5, hero, false, undefined, api);
  must(leaned === 1, 'a pounce NOT jumped must not overreach');
  const e3 = { t: 'hound', x: 100, y: 100, alive: true }; hero.y = 80; hero.ground = false; TA.released(e3, 'pounceTell', hero, 3); TA.judge(e3, 3.1, hero, false, undefined, api); TA.judge(e3, 3.5, hero, false, 3.2, api);
  must(leaned === 1, 'a pounce jumped but that hurt him anyway must not overreach'); }

/* ---- LEVER 3: AFFIXES ---- */
must(FA.KINDS.length === 4 && ['shielded', 'hasted', 'heavy', 'volatile'].every(k => FA.AFFIX[k]), 'the four affixes of the brief');
for (const k of FA.KINDS) must(FA.AFFIX[k].col && FA.AFFIX[k].tint > 0 && FA.ICON[k] && FA.ICON[k].length === 5, k + ': a tint and an icon (the read)');
must(FA.AFFIX.shielded.take >= 0.4, 'SHIELDED: a blow into the shell lands at >= 0.4 (B15: never immune), not ' + FA.AFFIX.shielded.take);
{ const e = { fa: 'shielded', faShell: 20, faShell0: 20, x: 0, y: 0, h: 16 }, api = { say() {}, sfx() {}, burst() {}, stagger() {}, lean() {} };
  const b1 = FA.shellTake(e, 10, 'cut', false, api); must(b1 === 4 && e.faShell === 10, 'a cut into the shell: 40% to the body, the rest wears it (' + b1 + ', shell ' + e.faShell + ')');
  const b2 = FA.shellTake(e, 10, 'heavy', false, api); must(b2 === 10 && e.faShell === 0, 'a heavy SHATTERS the shell and lands whole');
  const e2 = { fa: 'shielded', faShell: 20, faShell0: 20, x: 0, y: 0 }; must(FA.shellTake(e2, 7, 'cut', true, api) === 7 && e2.faShell === 0, 'its family\'s right tool shatters it too'); }
must(FA.clock({ fa: 'hasted' }, true) === 1 && FA.clock({ fa: 'hasted' }, false) > 1 && FA.clock({ fa: 'heavy' }, false) === 1, 'HASTED runs fast but never through a windup');
must(FA.blowMul({ fa: 'heavy' }) > 1 && FA.poiseMul({ fa: 'heavy' }) > 1 && FA.blowMul({}) === 1, 'HEAVY hits harder and carries a deeper bar');
must(FA.AFFIX.volatile.fuse >= 0.6, 'VOLATILE: the fuse is told long enough to get clear (>= 0.6 s)');
{ const picks = new Set(); for (let i = 0; i < 400; i++) { const a = FA.pick('moor', '7.' + i, 'soldier', 'front', 0.15); if (a) picks.add(a); must(a === FA.pick('moor', '7.' + i, 'soldier', 'front', 0.15), 'the pick is deterministic'); }
  must([...picks].every(a => FA.FIT.front.includes(a)), 'a front foe carries a front affix'); must(FA.pick('moor', '1', 'x', 'flank', 0) === null, 'no density, no affix');
  const e = { t: 'soldier', hp: 20, hp0: 20, alive: true }; FA.apply(e, 'heavy'); must(e.fa === 'heavy' && e.hp === 25 && !FA.eligible(e), 'HEAVY: a little more health, and one affix a foe at most'); }
for (const id of Object.keys(FPL.FOEPASS)) { must(campaign.some(l => l.id === id), 'FOEPASS names ' + id + ', not a campaign level');
  if (FPL.FOEPASS[id].affix) must(actOfId(id) >= 2, 'FOEPASS ' + id + ': affixes from act II only (it is act ' + actOfId(id) + ')'); }
{ const d = [1, 2, 3, 4, 5].map(a => FPL.AFFIX_ACT[a]); must(d[0] === 0 && d.every((x, i) => !i || x >= d[i - 1]), 'AFFIX_ACT: none in act I, never falling: ' + d);
  must(MODES.story.affix < MODES.normal.affix && MODES.normal.affix === 1 && MODES.master.affix > 1, 'the difficulty modes: Very Easy fewer affixes, Master more');
  must(FPL.densityOf('moor', 2, MODES.master.affix) > FPL.densityOf('moor', 2, 1) && FPL.densityOf('marsh', 1, 1) === 0, 'densityOf follows the act and the mode'); }

/* ---- LEVER 1: PURSUIT, THE LEAD; LEVER 4a: SQUAD ROLES ---- */
const SPAWNED = new Set([...MAIN.matchAll(/case '(\w+)':/g)].map(m => m[1]));
for (const [t, k] of Object.entries(FP.PURSUE)) { must(SPAWNED.has(t), 'PURSUE names ' + t + ', which the game never spawns'); must(k === 'walk' || k === 'hunt', 'PURSUE ' + t + ': walk or hunt'); }
must(FP.paceOf({ t: 'soldier', speed: 30 }) < 92 && FP.paceOf({ t: 'brute', speed: 999 }) < 92, 'a walker pursues under a hero\'s run (92): he can get away');
must(FP.paceOf({ t: 'hound', speed: 105 }) > 92, 'a hunter pursues faster than a run');
must(FP.PURSUIT.leash > 0 && FP.PURSUIT.leash < 600 && FP.PURSUIT.lose > 0, 'the leash is finite');
{ const s = FP.leadShot({ x: 100, vx: 92 }, 0, 200); must(s.T === 0.75 && s.x > 100 && s.x <= 150, 'the led shot keeps the flat flight (a lob would fall on a DUCKING hero) and its reach: ' + JSON.stringify(s)); }
must(FP.LEAD.k > 0 && FP.LEAD.k < 1 && FP.aimX({ x: 0, vx: 1000 }, 1, true) === FP.LEAD.max && FP.aimX({ x: 0, vx: 92 }, 0.75, false) === 0, 'the lead is partial, capped, and off where the level is not live');
{ const sq = [{ t: 'sprig', squad: 'a', alive: true, hp: 5 }, { t: 'archer', squad: 'a', alive: true, hp: 3 }], r = FP.assignRoles(sq, e => e.sqRole || (e.t === 'archer' ? 'back' : 'flank'));
  must(r.squads === 1 && r.promoted === 1 && sq[0].sqRole === 'front' && sq[1].sqRole === 'back', 'a squad with no front gets its sturdiest melee as its front'); }

/* ---- FEEL: TELL COLOURS, WEAPON WEIGHT, THE DEATH KNIGHT'S PARRY ---- */
must(TA.TELL_COLOURS.parry === TA.TOLD.col && TA.TELL_COLOURS.breakable === FA.AFFIX.shielded.col && /'#ff6b6b'/.test(FA.drawFuses.toString()), 'the tell-colour language: gold answer (told), white breakable (the shell), red get clear (the fuse)');
must(WEAPON_OF.reaper === 'greatsword' && WEAPON.greatsword.stop > 1 && WEAPON.greatsword.shove > 2, 'the greatsword lands heavier (src/juice.js WEAPON)');
{ const m = MAIN.match(/const DK_RETURN = \{ st: (\d+), stop: ([\d.]+)/); must(m && +m[1] >= 14 && +m[2] > 0.1, 'the ward-release parry: >= 14 wind back and a hard stop');
  must(/number\(P\.x, P\.y - 30, 'THROWN BACK'/.test(MAIN) && /MOVE_WORDS\.add\(w\)[^\n]*THROWN BACK|'THROWN BACK'\]\) MOVE_WORDS\.add/.test(MAIN), 'the ward-release parry says THROWN BACK, and it is a move word (drawn)');
  must(/SFX\.dkClang/.test(MAIN) && /dkClang\(\)/.test(readFileSync(new URL('../src/audio.js', import.meta.url), 'utf8')), 'the ward-release parry has its own clang');
  must(/'flash', 2, 'THE RETURN: HOLD C, LET GO AS HIS SWORD FLASHES WHITE/.test(LEVEL_SRC), 'the Death Knight\'s yard teaches the ward-release parry (its flash station)');
  must(!/isPyro\(\) \|\| isReaper\(\)\) && P\.dodge > 0/.test(MAIN), 'the Death Knight\'s flash station must not count the roll any more'); }

/* ---- HOOKS ---- */
for (const [what, re] of [['the varied / stale fill in addPoise', /FBR\.vary\(e, verb, time\)/], ['the light bar\'s varied lean', /FBR\.lightAdd\(fbv, verb/], ['the plunge finisher', /FBR\.FB\.plungeFinish && FINISH_OK/],
  ['the finisher refund api', /refund: \(\) => \{ const r = FBR\.refundOf\(P\.maxHp\)/], ['the told pose', /TA\.toldPose\(o, e, tellClock\(e\), time\)/], ['the parry lane', /TA\.laneFor\(e, laneOf\(tellKey\(e\)\)\)/],
  ['the told release', /TA\.released\(e, e\.fpWuMode, P, time\)/], ['the told judge', /TA\.judge\(e, time, P, P\.ducking, P\.fpHurtAt, TA_API\)/], ['the shell', /FOA\.shellTake\(e, dmg, amV/],
  ['the hasted clock', /FOA\.clock\(e, windingUp\(e\)\)/], ['the heavy blow', /FOA\.blowMul\(src\)/], ['the heavy bar', /FOA\.poiseMul\(e\)/], ['the fuses', /FOA\.frame\(enemies, dt, FA_API\)/],
  ['the affix read', /FOA\.tint\(e, time/], ['the spawn', /foePassSpawn\(\);/], ['the pursuit', /FP\.step\(e, P, dt, FP_API, FPS\)/], ['the lead', /FP\.leadShot\(P, sx/], ['the hurt clock', /P\.fpHurtAt = time/]])
  must(re.test(MAIN), 'main.js does not call ' + what);

assert.deepEqual(bad, [], 'the foe pass:\n  ' + bad.join('\n  '));
console.log(`foe pass: break bar (varied x${FB.FB.varied}, stale ${FB.FB.stale.join('/')}, refund ${FB.FB.refund.st} wind + ${FB.FB.refund.hpPct * 100}% hp); ` +
  `${Object.keys(TA.SIG).length} told attacks, every act I-II family answered (${early.length}, ${Object.keys(TA.TOLD_TODO).length} on TOLD_TODO); ` +
  `act III-V families without one (the sweeps): ${lateMissing.length}; ${FA.KINDS.length} affixes live on ${Object.keys(FPL.FOEPASS).filter(k => FPL.FOEPASS[k].affix).join(', ')}; ` +
  `pursuit + lead live on ${Object.keys(FPL.FOEPASS).join(', ')}.`);
