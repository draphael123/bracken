// tools/desert-foes2.mjs - THE DESERT'S SECOND CAST (claude/desertfoes; src/desert-foes2.js, src/desert-foes2-hands.js, src/redraw/desert_foes2.js), proved.
// Daniel 10-03: "the desert roster is mostly cutthroats; Well Town feels samey." usage: node tools/desert-foes2.mjs [--node]   (--node: skip the page part)
//   THE FIRE SCORPION   the scorpion's machine: every blow told, a quarter-second reactor takes nothing, an ignorer is hurt; its sting and its death leave a
//                       BURNING PATCH that ticks a hero standing in it (not one beside it), burns out, and THE POUR puts it out (in the page: the skin's E)
//   THE VENOM SCORPION  a sting that lands puts THE CISTERN QUEEN's venom in you (her own numbers: three stacks, a quarter each off stamina's return, six
//                       seconds), it wears off, and the venom HUD shows it (in the page: a real sting, a real P.cqVenom, P.venomSlow back to 1 after)
//   THE SANDWORM        the one new foe: nothing hurts but its lunge, and the lunge is told (!!, the dome) long enough to step off; under the sand (lurk, the
//                       ripple, under, deep) a blade finds nothing; up and swaying it is open; it comes up again AHEAD; THE FLOOD FLUSHES IT (at the horn it goes
//                       down and stays down till the water is past) - in the page, in the real gorge, on the real horn
//   THE DYNAMITE BANDIT the sapper's AI under a man's skin: his stick is told (!!), thrown to where you stand, lies in its ring, and THE FLOOD DOUSES THE FUSE
//   THE SHIELD GUARD    the shieldgob's AI under a man's skin (the reskin rule: cnSkin, a sprite, a bestiary card - tools/goblin-lint.mjs holds THE RED GORGE now)
//   THE PLACEMENT       THE WELL TOWN swaps a good chunk of its cutthroats; THE RED GORGE's roster is six types or more with none over ~35%; the worm keeps the
//                       dry riverbed; every new kind is wired (spawn, health, sprite, card, marks, threat, the hint lines)
import { readFileSync } from 'node:fs';
import { install } from './node-canvas.mjs';
install();
const D2 = await import('../src/desert-foes2.js');
const DF = await import('../src/desert-foes.js');
const ART = await import('../src/redraw/desert_foes2.js');
const { MARK, ANSWER, HEIGHT, BY_HAND } = await import('../src/marks.js');
const { THREAT } = await import('../src/threat.js');
const { CALL_LINES } = await import('../src/hint-lines.js');
const { CQ } = await import('../src/cistern-queen.js');
const { venomIcon } = await import('../src/venom-hud.js');
const { LEVELS } = await import('../src/level.js');
const { REDGORGE } = await import('../src/red-gorge.js');

let fails = 0; const log = s => console.log(s), ok = (c, m) => { log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const DT = 1 / 60, FLOOR = 320;
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

/* A FIGHTER on flat ground (the caravan's duel, tools/bandits.mjs): walks in to standOff; policy(o, t) says what to do 0.25 s after a tell ('block' 0.7 s,
   'step' away from the foe or its mark 0.7 s); 'still' stands where it is the whole time */
function duel(make, step, policy, { secs = 30, py = FLOOR, standOff = 16, still = false, start = -90 } = {}) {
  const e = make(); let px = e.x + start, face = 1, t = 0, block = 0, flee = 0, fleeFrom, inv = 0, pending = [], hits = 0, blocked = 0, tells = {}, marks = {}, hitsBy = {}, live = [];
  while (t < secs) {
    const out = step(e, { px, py, pface: face, time: t, flood: false }, DT);
    for (const o of out) {
      if (o.t === 'tell') { tells[o.what] = (tells[o.what] || 0) + 1; (marks[o.what] = marks[o.what] || new Set()).add(o.mark); const a = policy(o, t); if (a) pending.push([t + 0.25, a, o.x]); }
      if (o.t === 'hit') { live.push(e.mode); if (inv <= 0 && px >= o.box[0] - 5 && px <= o.box[1] + 5 && py - 14 <= o.box[3] && py >= o.box[2]) { if (o.blockable && block > 0) blocked++; else { hits++; hitsBy[o.what] = (hitsBy[o.what] || 0) + 1; } inv = 0.6; } } }
    pending = pending.filter(([at, a, mx]) => { if (t < at) return true; if (a === 'block') block = 0.7; else if (a === 'step') { flee = 0.7; fleeFrom = mx; } return false; });
    const ex = e.x; if (flee > 0) { const from = fleeFrom ?? ex; px += (Math.sign(px - from) || -1) * 92 * DT; flee -= DT; if (flee <= 0) fleeFrom = undefined; }
    else if (!still && Math.abs(ex - px) > standOff) { px += Math.sign(ex - px) * 92 * DT * (block > 0 ? 0.35 : 1); face = Math.sign(ex - px) || face; }
    block = Math.max(0, block - DT); inv = Math.max(0, inv - DT); t += DT; }
  return { hits, blocked, tells, marks, hitsBy, live };
}
const reader = o => o.mark === '!' ? 'block' : (o.mark === '!!' || o.mark === 'X') ? 'step' : null;   /* (the scorpion's machine calls its sting X: the red mark, !! in the marks table) */

// ================= THE SCORPION VARIANTS (the scorpion's machine) =================
log('THE FIRE AND VENOM SCORPIONS: the scorpion\'s machine');
{ const mk = () => DF.newScorpion(FLOOR, FLOOR);
  const r = duel(mk, DF.scorpionStep, reader), ig = duel(mk, DF.scorpionStep, () => null);
  ok(r.tells.claw > 2 && r.tells.sting > 2 && [...r.marks.claw].join() === '!' && [...r.marks.sting].join() === 'X', 'both blows told: the claw ! (' + r.tells.claw + '), the sting X - the red mark (' + r.tells.sting + ')');
  ok(r.hits === 0, 'a fighter who answers each mark in a quarter second takes nothing (blocked ' + r.blocked + ')');
  ok(ig.hits >= 4, 'one who ignores the marks is hurt (' + ig.hits + ' hits: ' + JSON.stringify(ig.hitsBy) + ')');
  const st = DF.newScorpion(FLOOR, FLOOR); let any = false; for (let t = 0; t < 20; t += DT) for (const o of DF.scorpionStep(st, { px: FLOOR + 400, py: FLOOR, time: t }, DT)) if (o.t === 'hit') any = true;
  ok(!any, 'THE TOUCH RULE: a scorpion with nobody near throws nothing (it hurts only by a told blow)'); }

log('THE BURNING PATCH');
{ const p = D2.newPatch(200, FLOOR, 'e'); const inP = { x: 202, y: FLOOR, w: 10 }, beside = { x: 200 + D2.PATCH.w / 2 + 12, y: FLOOR, w: 10 };
  let burntIn = 0, burntBy = 0, t = 0; while (t < 3) { for (const h of D2.patchStep(p, [inP, beside], DT)) (h === inP ? burntIn++ : burntBy++); t += DT; }
  ok(burntIn === Math.floor(3 / D2.PATCH.tick) + 1 || Math.abs(burntIn - 3 / D2.PATCH.tick) <= 1, 'a hero standing in a patch is burnt every ' + D2.PATCH.tick + ' s (' + burntIn + ' ticks in 3 s, ' + D2.PATCH.dmg + ' each)');
  ok(burntBy === 0, 'one standing beside it is not');
  let life = 0; const q = D2.newPatch(0, FLOOR); while (!q.out && life < 30) { D2.patchStep(q, [], DT); life += DT; }
  ok(Math.abs(life - D2.PATCH.life) < 0.1, 'left alone it burns out in ' + life.toFixed(1) + ' s (nothing resolves itself? it does, slowly: the pour is the quick way)');
  const ps = [D2.newPatch(100, FLOOR), D2.newPatch(100 + D2.PATCH.w - 2, FLOOR), D2.newPatch(300, FLOOR)];
  ok(D2.pourPatch(ps, 70, FLOOR, 1, 48) === ps[0] && D2.pourPatch(ps, 70, FLOOR, -1, 48) === null && D2.pourPatch(ps, 200, FLOOR, 1, 48) === null, 'THE POUR finds the near patch IN FRONT (not behind, not out of reach)');
  ok(D2.dousePatches(ps, ps[0]) === 2 && ps[0].out && ps[1].out && !ps[2].out, 'one sip puts out a patch and the flames touching it, not one across the street'); }

log('THE VENOM (THE CISTERN QUEEN\'s rule)');
{ ok(D2.VENOM.max === CQ.venom.max && D2.VENOM.slow === CQ.venom.slow && D2.VENOM.t === CQ.venom.t, 'the same numbers as the Queen\'s (' + JSON.stringify(CQ.venom) + ')');
  const P = {}; D2.venomOn(P, 1); const one = P.venomSlow; D2.venomOn(P, 4); const v = venomIcon(P, CQ.venom);
  ok(one === 1 - CQ.venom.slow && P.cqVenom.length === 3 && Math.abs(P.venomSlow - (1 - 3 * CQ.venom.slow)) < 1e-9, 'a sting: a stack (stamina back at ' + Math.round(one * 100) + '%); five: three at most (' + Math.round(P.venomSlow * 100) + '%)');
  ok(v && v.stacks === 3 && v.mode === 'stack' && v.slow === 75, 'the venom HUD shows three drops and -75%');
  let t = 0; while (P.cqVenom.length && t < 20) { D2.venomTick(P, DT); t += DT; }
  ok(Math.abs(t - CQ.venom.t) < 0.1 && P.venomSlow === 1 && !venomIcon(P, CQ.venom), 'it wears off in ' + t.toFixed(1) + ' s and the HUD is clean'); }

// ================= THE SANDWORM =================
log('THE SANDWORM');
{ const K = D2.SANDWORM, mk = () => D2.newSandworm(FLOOR, FLOOR, [FLOOR - 160, FLOOR + 160]);
  const r = duel(mk, D2.sandwormStep, reader, { standOff: 0 }), still = duel(mk, D2.sandwormStep, () => null, { still: true, start: -40 }), walker = duel(mk, D2.sandwormStep, () => null, { standOff: 0 });
  ok(r.tells.lunge >= 3 && [...r.marks.lunge].join() === '!!' && [...(r.marks.ripple || [])].join() === '', 'every lunge is told !! (' + r.tells.lunge + ' in 30 s); the ripple is the sign it is there and wears no mark (no blow behind it)');
  ok(K.lungeTell >= 0.45, 'the dome stands ' + K.lungeTell + ' s before it comes up: a quarter-second read and a step clear (' + Math.round((K.lungeTell - 0.25) * 92) + ' px, the strike is ' + K.lungeR + ' px wide each side)');
  ok(r.hits === 0, 'a fighter who steps off the dome a quarter second after it shows takes nothing');
  ok(still.hits >= 3 && walker.hits >= 3, 'one who stands still in its bed (' + still.hits + ' hits) or walks at it ignoring the dome (' + walker.hits + ') is hurt');
  ok(r.live.every(m => m === 'lunge'), 'THE TOUCH RULE: only the lunge throws a blow (' + r.live.length + ' blows, all from the lunge)');
  /* under the sand nothing finds it; up out of it, it is open */
  const s = mk(); const seen = {}; let t = 0, open = 0, openRun = 0, maxOpen = 0, aheadOk = 0, aheadN = 0, lastMode = s.mode, px = FLOOR - 20;
  while (t < 30) { const was = s.mode, x0 = s.x; D2.sandwormStep(s, { px, py: FLOOR, pface: 1, time: t, flood: false }, DT); (seen[s.mode] = seen[s.mode] || { touch: new Set() }).touch.add(D2.sandwormTouchable(s));
    if (was === 'under' && s.mode === 'ripple') { aheadN++; if (s.x > px) aheadOk++; }
    if (s.mode === 'exposed') { openRun += DT; maxOpen = Math.max(maxOpen, openRun); } else openRun = 0; px += 30 * DT * Math.sin(t); t += DT; }
  ok(['lurk', 'ripple', 'lungeTell', 'under'].every(m => !seen[m] || ![...seen[m].touch].includes(true)), 'under the sand - lurking, the ripple, the dome, travelling under - a blade finds nothing');
  ok(seen.exposed && [...seen.exposed.touch].every(Boolean) && seen.lunge && [...seen.lunge.touch].every(Boolean) && maxOpen >= 1.2, 'up out of it (the lunge, then ' + maxOpen.toFixed(2) + ' s swaying) it is open');
  ok(aheadN >= 2 && aheadOk === aheadN, 'it comes up again AHEAD of you (the way you face), as a ripple you can see (' + aheadOk + '/' + aheadN + ')');
  /* it keeps its bed */
  const b = D2.newSandworm(FLOOR, FLOOR, [FLOOR - 40, FLOOR + 40]); let minX = 1e9, maxX = -1e9; t = 0; while (t < 30) { D2.sandwormStep(b, { px: FLOOR + 60 * Math.sin(t * 0.7), py: FLOOR, pface: 1, time: t }, DT); minX = Math.min(minX, b.x); maxX = Math.max(maxX, b.x); t += DT; }
  ok(minX >= FLOOR - 40 && maxX <= FLOOR + 40, 'it never leaves its bed (' + Math.round(minX - FLOOR) + '..' + Math.round(maxX - FLOOR) + ' px of +-40)');
  /* THE FLOOD FLUSHES IT */
  const f = mk(); t = 0; let deepAt = null, back = null, hitIn = 0, touchIn = 0;
  while (f.mode !== 'ripple' && t < 5) { D2.sandwormStep(f, { px: FLOOR - 10, py: FLOOR, pface: 1, time: t }, DT); t += DT; }
  const t0 = t; while (t < t0 + 4.4) { for (const o of D2.sandwormStep(f, { px: FLOOR - 10, py: FLOOR, pface: 1, time: t, flood: true }, DT)) if (o.t === 'hit') hitIn++; if (D2.sandwormTouchable(f)) touchIn++; if (f.mode === 'deep' && deepAt === null) deepAt = t - t0; t += DT; }
  const t1 = t; while (t < t1 + 3 && back === null) { D2.sandwormStep(f, { px: FLOOR - 200, py: FLOOR, pface: 1, time: t, flood: false }, DT); if (f.mode === 'lurk') back = t - t1; t += DT; }
  ok(deepAt !== null && deepAt <= DT * 2 && hitIn === 0 && touchIn === 0 && f.flushed === 1, 'THE FLOOD FLUSHES IT: at the horn its ripple goes deep at once (' + (deepAt === null ? 'never' : deepAt.toFixed(3) + ' s') + '), and for the horn and the torrent (4.4 s) it strikes nothing and is nowhere to strike');
  ok(back !== null && Math.abs(back - K.flushAfter) < 0.1, 'when the water has gone by it is back in its own sand ' + (back === null ? 'never' : back.toFixed(2) + ' s') + ' later');
  const g = mk(); t = 0; while (g.mode !== 'exposed' && t < 10) { D2.sandwormStep(g, { px: FLOOR, py: FLOOR, pface: 1, time: t }, DT); t += DT; } let gDeep = null; const tg = t;
  while (t < tg + 2 && gDeep === null) { D2.sandwormStep(g, { px: FLOOR, py: FLOOR, pface: 1, time: t, flood: true }, DT); if (g.mode === 'deep') gDeep = t - tg; t += DT; }
  ok(g.mode === 'deep' && gDeep <= K.burrow + 0.05, 'caught up out of the sand at the horn, it burrows at once and goes deep (' + (gDeep === null ? 'never' : gDeep.toFixed(2) + ' s') + ', inside the horn\'s 2 s)'); }

// ================= THE ART =================
log('THE ART');
{ const base = (await import('../src/redraw/desert_foes.js')).bakeScorpion(), sets = { firescorpion: ART.bakeFireScorpion(base), venomscorpion: ART.bakeVenomScorpion(base), sandworm: ART.bakeSandworm(), shieldguard: ART.bakeShieldGuard(), dynamiter: ART.bakeDynamiter() };
  const one = s => s.R.every(c => c.width === s.R[0].width && c.height === s.R[0].height) && s.L.length === s.R.length && s.white.R.length === s.R.length;
  ok(Object.values(sets).every(one), 'every set bakes, one canvas size a set, each with its flip and its white: ' + Object.entries(sets).map(([k, s]) => k + ' ' + s.R.length).join(', '));
  ok(sets.firescorpion.R.length === base.R.length && sets.venomscorpion.R.length === base.R.length, 'the scorpion variants keep the scorpion\'s seven frames (its machine names them)');
  ok(sets.shieldguard.R.length === 7 && sets.dynamiter.R.length === 7 && sets.sandworm.R.length === 7, 'the shield guard carries the shieldgob\'s seven frames, the dynamiter the sapper\'s six and a seventh (the lit stick held high), the worm seven');
  const diff = (a, b) => { const A = a.getContext('2d').getImageData(0, 0, a.width, a.height).data, B = b.getContext('2d').getImageData(0, 0, b.width, b.height).data; let n = 0; for (let i = 0; i < A.length; i += 4) if (A[i] !== B[i] || A[i + 1] !== B[i + 1]) n++; return n; };
  ok(diff(sets.firescorpion.R[0], base.R[0]) > 40 && diff(sets.venomscorpion.R[0], base.R[0]) > 40 && diff(sets.firescorpion.R[0], sets.venomscorpion.R[0]) > 40, 'the fire and venom scorpions read apart from the desert\'s scorpion and from each other');
  ok(typeof ART.drawPatch === 'function' && ART.bakeCharge().width === 10, 'the burning patch and the stick of dynamite are drawn'); }

// ================= THE WIRING =================
log('THE WIRING (read off the source)');
{ const cards = new Set([...main.slice(main.indexOf('const BEASTS = ['), main.indexOf('];', main.indexOf('const BEASTS = ['))).matchAll(/\{ t: '([a-zA-Z0-9]+)'/g)].map(m => m[1]));
  const skins = ['firescorpion', 'venomscorpion', 'shieldguard', 'dynamiter'];
  ok(/case 'sandworm':/.test(main) && /sandworm: DF2\.SANDWORM\.hp/.test(main) && /CV_FOES = new Set\(\[[^\]]*'sandworm'/.test(main) && /CV_STEP = \{[^}]*sandworm: DF2\.sandwormStep/.test(main), 'THE SANDWORM: a spawn case, its health, and it runs on the desert\'s hands (CV_FOES, CV_STEP)');
  ok([...skins, 'sandworm'].every(k => new RegExp('SPR\\.' + k + '\\s*=').test(main) && cards.has(k)), 'every new face has a sprite and a bestiary card: ' + [...skins, 'sandworm'].join(', '));
  ok(/if \(e\.cnSkin\) for \(let i = n0; i < enemies\.length; i\+\+\) \{ enemies\[i\]\.cnSkin = e\.cnSkin;/.test(main) && /if \(e\.cnSkin && SPR\[e\.cnSkin\]\) sprSet = SPR\[e\.cnSkin\]/.test(main), 'a reskin rides from the ent onto the foe (cnSkin) and is drawn in its own skin');
  ok(/DF2_CORPSE = \{ firescorpion: 6, venomscorpion: 6, shieldguard: 4, dynamiter: 4 \}/.test(main) && /c\.t = e\.cnSkin; c\.frame = DF2_CORPSE\[e\.cnSkin\]/.test(main) && /HAS_HURT\.add\('sandworm'\)/.test(main), 'THE CORPSES: a reskin lies in its own skin (not the goblin\'s), the worm in its hurt pose');
  ok(BY_HAND['sandworm|lungeTell'] === '!!' && MARK['sandworm|lungeTell'] === '!!' && ANSWER['sandworm|lungeTell'] === 'dodge' && HEIGHT['sandworm|lungeTell'] === 'low', 'its mark (!!), its answer (dodge) and its height (low)');
  ok(THREAT.sandworm > 0, 'a threat weight (' + THREAT.sandworm + ')');
  ok(['WATER PUTS IT OUT', 'THE PATCH GOES OUT', 'VENOM: YOUR STAMINA COMES BACK SLOWER', 'THE HORN DRIVES IT UNDER', 'THE FLOOD DOUSES THE FUSE'].every(l => CALL_LINES.has(l)), 'its teaching lines are hint lines (number() shows them)');
  ok(/pourables: \(\) => \[[^\]]*DF2H && DF2H\.pourable/.test(main), 'THE POUR reaches a burning patch (a pourable for the well town\'s hands)');
  ok(/b\.dyn && DF2H && DF2H\.wet\(b\.x, b\.y - 3\)/.test(main) && /e\.cnSkin === 'dynamiter' && DF2H && DF2H\.wet\(e\.x, e\.y - 8\)/.test(main), 'THE FLOOD DOUSES THE FUSE: a stick on the ground, or lit in his hand'); }

// ================= THE PLACEMENT =================
log('THE PLACEMENT');
const roster = L => { const c = {}; for (const e of L.ents) { if (!/^(cutthroat|slinger|scorpion|raptor|vulture|waterthief|archer|shield|sapper|sandworm)$/.test(e.t)) continue; const k = e.cnSkin || e.t; c[k] = (c[k] || 0) + 1; } return c; };
{ const W = LEVELS.find(l => l.id === 'welltown').build(), c = roster(W), n = Object.values(c).reduce((a, b) => a + b, 0);
  ok((c.cutthroat || 0) <= 6 && (c.firescorpion || 0) >= 3 && (c.vulture || 0) >= 2 && (c.waterthief || 0) >= 11 && (c.venomscorpion || 0) >= 2, 'THE WELL TOWN swaps its cutthroats (11 -> ' + c.cutthroat + ') for fire scorpions (' + c.firescorpion + '), vultures (' + c.vulture + '), a water-thief (' + c.waterthief + ' in all), and two of its cistern scorpions are the Queen\'s venom brood: ' + JSON.stringify(c));
  ok(n === 40, 'a swap, not a heap: ' + n + ' foes, as before (40)'); }
{ const G = LEVELS.find(l => l.id === 'redgorge').build(), c = roster(G), n = Object.values(c).reduce((a, b) => a + b, 0), top = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
  ok(Object.keys(c).length >= 6 && top[1] / n <= 0.355, 'THE RED GORGE: ' + Object.keys(c).length + ' types (>= 6), the most common ' + top[0] + ' at ' + Math.round(100 * top[1] / n) + '% (<= ~35%): ' + JSON.stringify(c));
  ok(n <= 37, 'cutthroats swapped, not added to: ' + n + ' foes (36 before, and the one new foe in the riverbed)');
  const w = G.ents.filter(e => e.t === 'sandworm'), [C0, C1] = REDGORGE.ch;
  ok(w.length >= 1 && w.every(e => e.bed && e.bed[0] >= C0 && e.bed[1] <= C1 && e.x >= C0 && e.x <= C1 && e.y === REDGORGE.floor - 1), 'THE SANDWORM keeps THE DRY RIVERBED: the channel\'s floor at the gorge mouth (cols ' + C0 + '-' + C1 + '), where the flood runs');
  ok(G.ents.filter(e => e.t === 'sapper' || e.t === 'shield').every(e => e.cnSkin === 'dynamiter' || e.cnSkin === 'shieldguard'), 'no goblin in the gorge: every sapper is a dynamite bandit, every shieldgob a shield guard'); }

// ================= THE PAGE =================
if (!process.argv.includes('--node')) {
  log('IN THE PAGE');
  const { openPage } = await import('./cdp.mjs');
  const pg = await openPage({ audio: false, fonts: false });
  try {
    await pg.evalp('(()=>{setTimeout(()=>location.assign("/?nosw"),0);return 1})()', 8000).catch(() => {});
    for (let i = 0; i < 200; i++) { await new Promise(r => setTimeout(r, 150)); if (await pg.evalp('typeof BK==="object"&&!!BK.load', 4000).catch(() => false)) break; }
    const w = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out={};
      BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='welltown'));BK.state='play';BK.sim(10);const P=BK.P,H=()=>BK.desertFoes2();
      for(const e of BK.enemies())e.alive=false;
      const spawn=(t,x,y,o)=>{const n0=BK.enemies().length;BKT.spawnEnt?BKT.spawnEnt(Object.assign({t,x,y,face:-1},o||{})):BK.spawnEnt(Object.assign({t,x,y,face:-1},o||{}));return BK.enemies()[n0];};
      /* THE FIRE SCORPION: a sting that lands, the patch where it struck; standing in it burns; the skin's pour puts it out */
      BK.tp(60,29);BK.sim(5);BK.god=false;P.hp=P.maxHp=999;
      const f=spawn('scorpion',63,29,{cnSkin:'firescorpion'});out.fire={skin:f&&f.cnSkin,t:f&&f.t};
      for(let i=0;i<60*8&&!H().patches.length;i++){P.hp=999;P.x=f.x-30;BK.sim(1);}out.patch=H().patches.length;out.patchAt=H().patches[0]?[Math.round(H().patches[0].x-f.x),H().patches[0].y-f.y]:null;
      f.alive=false;BK.sim(1);H().patches.length=0;const p=H().patches;
      const pp={x:P.x,y:Math.round(P.y),t:8,life:8,tick:0,from:null,out:false};for(let i=0;i<150;i++){P.x=pp.x-60;BK.sim(1);}H().patches.push(pp);pp.t=8;const h0=P.hp;for(let i=0;i<150;i++){P.x=pp.x;BK.sim(1);}out.burnt=h0-P.hp;
      const pp2={x:P.x+30,y:Math.round(P.y),t:8,life:8,tick:0,from:null,out:false};H().patches.length=0;H().patches.push(pp2);P.x=pp2.x-34;P.face=1;P.skin={sips:3,max:3};BK.sim(1);out.verb=BK.welltownHands().verbNow(P);out.verb=out.verb&&out.verb.verb;
      BK.press('talk');BK.sim(3);out.poured={out:pp2.out,sips:P.skin.sips,doused:H().n.doused};
      /* its death leaves a patch */
      const f2=spawn('scorpion',70,29,{cnSkin:'firescorpion'});BK.sim(2);H().patches.length=0;BKT.hurtEnemy(f2,999,f2.x-10,false);BK.sim(2);out.deathPatch=H().patches.length;
      /* THE VENOM SCORPION: a sting that lands puts the venom in; it wears off */
      P.cqVenom=[];P.venomSlow=1;const v=spawn('scorpion',90,29,{cnSkin:'venomscorpion'});BK.tp(88,29);
      for(let i=0;i<60*10&&!(P.cqVenom&&P.cqVenom.length);i++){P.hp=999;P.x=v.x-30;P.face=1;BK.sim(1);}out.venom={stacks:(P.cqVenom||[]).length,slow:P.venomSlow,n:H().n.venom};
      v.alive=false;for(let i=0;i<60*20&&P.cqVenom.length;i++)BK.sim(1);out.venomAfter={stacks:(P.cqVenom||[]).length,slow:P.venomSlow};
      /* the corpses keep their skins */
      const f3=spawn('scorpion',100,29,{cnSkin:'venomscorpion'});BK.sim(2);BKT.hurtEnemy(f3,999,f3.x-10,false);BK.sim(2);{const c=BK.corpses().find(c=>Math.abs(c.x-f3.x)<4)||{};out.corpse=c.set&&c.set===BK.SPR.venomscorpion?"venomscorpion":(c.t||"none");}
      return out;})()`, 300000);
    ok(w.fire.skin === 'firescorpion' && w.fire.t === 'scorpion', 'a fire scorpion spawns as the scorpion with its skin');
    ok(w.patch >= 1 && w.patchAt && w.patchAt[1] === 0 && Math.abs(w.patchAt[0]) <= 40, 'its sting leaves a burning patch on the ground where it struck ' + JSON.stringify(w.patchAt));
    ok(w.burnt > 0, 'standing in the patch burns (' + w.burnt + ' health in 150 frames)');
    ok(w.verb === 'POUR' && w.poured.out && w.poured.sips === 2 && w.poured.doused >= 1, 'with water in the skin the HUD says E: POUR at a patch, and E puts it out for a sip ' + JSON.stringify(w.poured));
    ok(w.deathPatch >= 1, 'a fire scorpion dies in its own fire (a patch where it fell)');
    ok(w.venom.stacks >= 1 && w.venom.slow < 1 && w.venom.n >= 1, 'a venom scorpion\'s sting puts the Queen\'s venom in you ' + JSON.stringify(w.venom));
    ok(w.venomAfter.stacks === 0 && w.venomAfter.slow === 1, 'and it wears off with no Queen in the room to wear it off ' + JSON.stringify(w.venomAfter));
    ok(w.corpse === 'venomscorpion', 'a reskin lies in its own skin when it dies (' + w.corpse + ')');
    const g = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out={};
      BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='redgorge'));BK.state='play';BK.god=true;BK.sim(10);const P=BK.P,G=()=>BK.redgorge(),H=()=>BK.desertFoes2();
      const till=(ph,n=60*30)=>{for(let i=0;i<n&&G().phase!==ph;i++){P.hp=P.maxHp;BK.sim(1);}};
      const D2=await import('/src/desert-foes2.js'),DF2open=s=>D2.sandwormTouchable(s)&&s.mode!=='burrow';const worm=BK.enemies().find(e=>e.t==='sandworm'),dyn=BK.enemies().find(e=>e.cnSkin==='dynamiter'&&e.y>160*16),sg=BK.enemies().filter(e=>e.cnSkin==='shieldguard');
      out.cast={worm:!!worm,dyn:!!dyn&&dyn.t,shield:sg.length&&sg[0].t,h:dyn&&dyn.h};
      for(const e of BK.enemies())if(e!==worm&&e!==dyn&&e.t!=='gorgecrab')e.alive=false;dyn.alive=false;
      /* THE SANDWORM in the riverbed: it wakes as you stand in its bed; the horn drives it under; it comes back after */
      till('dry');BK.tp(23,165);let rip=0;for(let i=0;i<60*2;i++){P.hp=P.maxHp;BK.sim(1);if(worm.st.mode!=='lurk')rip=1;}out.woke=rip;
      const f0=worm.st.flushed;till('horn');BK.sim(3);out.atHorn=worm.st.mode;let shown=0;for(let i=0;i<60*8&&G().phase!=='dry';i++){P.hp=P.maxHp;P.x=worm.x;BK.sim(1);if(DF2open(worm.st))shown++;}
      out.flushed=worm.st.flushed-f0;out.shownInFlood=shown;out.n=H().n.flushed;
      till('dry');for(let i=0;i<300&&worm.st.mode==='deep';i++){P.hp=P.maxHp;P.x=40*16;BK.sim(1);}out.after=worm.st.mode;
      /* THE DYNAMITE BANDIT: he lights at range, throws to where you stand; THE FLOOD DOUSES THE FUSE */
      dyn.alive=true;dyn.hp=99;dyn.x=14*16;dyn.y=166*16;dyn.mode='walk';dyn.fleeT=0;dyn.dynCd=0;worm.alive=false;BK.tp(21,165);P.y=166*16;BK.god=true;
      till('dry');let lit=0,thrown=null;for(let i=0;i<60*5&&!thrown;i++){P.hp=P.maxHp;P.x=21*16+8;BK.sim(1);if(dyn.mode==='lightTell')lit++;thrown=BK.bombs().find(b=>b.dyn);}
      out.lit=lit;let land=null;for(let i=0;i<240&&thrown&&!land;i++){P.hp=P.maxHp;P.x=21*16+8;BK.sim(1);if(thrown.vy===0)land=[Math.round(thrown.x-P.x),Math.round(thrown.y-P.y)];}out.land=land;
      for(let i=0;i<120;i++){P.hp=P.maxHp;P.x=30*16;BK.sim(1);}dyn.alive=false;
      till('flood');BK.sim(10);const b={x:24*16+8,y:165*16,vx:0,vy:0,fuse:1,dyn:true};BK.bombs().push(b);const fz=H().n.fizzled;BK.sim(2);out.douse={gone:!BK.bombs().includes(b),fizzled:H().n.fizzled-fz};
      /* the shield guard dies as a man */
      const s=sg[0];s.alive=true;s.hp=5;BKT.hurtEnemy(s,999,s.x+10,false);BK.sim(2);{const c=BK.corpses().find(c=>Math.abs(c.x-s.x)<4)||{};out.sgCorpse=c.set&&c.set===BK.SPR.shieldguard?"shieldguard":(c.t||"none");}
      return out;})()`, 300000);
    ok(g.cast.worm && g.cast.dyn === 'sapper' && g.cast.shield === 'shield' && g.cast.h === 18, 'the gorge as built: a sandworm in the riverbed, a dynamite bandit (the sapper\'s AI) and shield guards (the shieldgob\'s), men\'s height');
    ok(g.woke === 1, 'the worm wakes as you stand in its bed');
    ok((g.atHorn === 'deep' || g.atHorn === 'burrow') && g.flushed >= 1 && g.shownInFlood === 0 && g.n >= 1, 'THE FLOOD FLUSHES IT: on the real horn it goes down (burrowing, or deep), and through the horn and the torrent it is never up to strike or be struck ' + JSON.stringify({ atHorn: g.atHorn, flushed: g.flushed, shown: g.shownInFlood }));
    ok(g.after === 'lurk' || g.after === 'ripple', 'and after the water it is back in its sand (' + g.after + ')');
    ok(g.lit > 0.4 * 60 && g.land && Math.abs(g.land[0]) <= 24 && Math.abs(g.land[1]) <= 4, 'the dynamite bandit holds his lit stick high (' + (g.lit / 60).toFixed(2) + ' s, !!) and it lands where you stood ' + JSON.stringify(g.land));
    ok(g.douse.gone && g.douse.fizzled === 1, 'THE FLOOD DOUSES THE FUSE: a stick in running water is out, told (steam and its line) ' + JSON.stringify(g.douse));
    ok(g.sgCorpse === 'shieldguard', 'a shield guard lies as a man, not a goblin (' + g.sgCorpse + ')');
    if (pg.errors.length) ok(false, 'the page threw: ' + pg.errors.slice(0, 2).map(String).join(' | '));
  } finally { await pg.close(); }
}
console.log(fails ? '\ndesert-foes2: ' + fails + ' FAILED' : '\nok  desert-foes2   the fire and venom scorpions, the sandworm, the dynamite bandit and the shield guard: told, fair, wired and placed');
process.exit(fails ? 1 : 0);
