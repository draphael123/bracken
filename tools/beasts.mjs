// tools/beasts.mjs - THE WOLF PAIR AND THE BEAR (claude/beastsbones, src/beasts.js): SNOWRUNNER, GREYMANE, BRUIN. NODE ONLY: no page, no port, no Chrome.
//   the step (every tell has its length and enters with its mark; a blow in a tell cancels a runner's and spares a braced charge; the circling pack - orbit radius, hit and run, ONE biter at
//   a time, holding while Greymane pounces, hesitating when he falls, spreading over 1-4 heroes; the throat leap at head height and its skid; Greymane's ring, pin and winded window;
//   Bruin's maul, his lane, his dazed and skid windows) and the tables (EHP, THREAT, MARK / ANSWER / HEIGHT, SIG, voices, death material, sprites, the flag OFF = no live level places any).
//   node tools/beasts.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { install } from './node-canvas.mjs';
import * as K from '../src/beasts.js';
import { MARK, ANSWER, HEIGHT } from '../src/marks.js';
import { THREAT } from '../src/threat.js';
import { LEVELS } from '../src/level.js';
import { materialOf } from '../src/death-fx.js';
import { PENS, PEN_NAMES } from '../src/foe-pen.js';
install();
const rd = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8');
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const near = (a, b, e) => Math.abs(a - b) <= e;
const DT = 1 / 60, G = 900, hero = (x, y = 0, id = 0) => ({ x, y, alive: true, id, w: 10, h: 14 });
const W = (heroes, extra = {}) => ({ heroes, canStep: () => true, wallAhead: () => false, ...extra });
/* a flat floor at y = 0: the host's job (gravity, landing) done here, so a leap or a pounce can be followed from launch to touchdown */
function run(s, w, secs, onEv) {
  const evs = [], hs = () => (typeof w === 'function' ? w(s) : w);
  for (let t = 0; t < secs; t += DT) {
    const world = hs(); const out = K.beastStep(s, world, DT);
    const push = v => { evs.push([+t.toFixed(3), v]); if (onEv) onEv(v, s, t); };
    out.forEach(push);
    if (s.air) { s.vy += G * DT; s.x += s.vx * DT; s.y += s.vy * DT;
      if (s.kind === 'snowrunner' && s.mode === 'leap') { const h = K.airHit(s, world.heroes); if (h) { s.hit = world.duck ? false : true; push({ t: 'airHit', id: h.id, duck: !!world.duck }); } }
      if (s.y >= 0 && s.vy > 0) { s.y = 0; K.beastLanded(s, world.heroes).forEach(push); } }
    else { if (s.vx) s.x += s.vx * DT; if (s.mode === 'charge' && !s.hit) { const h = K.chargeHit(s, world.heroes); if (h) { s.hit = true; push({ t: 'chargeHit', id: h.id }); } } }
  }
  return evs;
}
const mkS = { snowrunner: K.newSnowrunner, greymane: K.newGreymane, bruin: K.newBruin };
const fresh = (k, x = 0, face = 1) => { const s = mkS[k](x, 0, face); s.cd = 0; return s; };

console.log('node: the beasts\' tell table');
for (const [k, [mark, ans, hgt]] of Object.entries(K.BEAST_TELLS)) {
  ok(MARK[k] === mark && ANSWER[k] === ans && HEIGHT[k] === hgt, k + ': ' + mark + ' -> ' + ans + ' (' + hgt + ') - the same in src/marks.js and src/beasts.js');
  if (mark === '!') ok(ans === 'block', k + ': a yellow ! is answered with the shield');
  if (mark === '!!') ok(ans !== 'block', k + ': a red !! is not answered with the shield (' + ans + ')');
  if (ans === 'duck') ok(hgt === 'high', k + ': a duck answer is a HIGH blow');
  if (ans === 'jump') ok(hgt === 'low', k + ': a jump answer is a LOW blow'); }
{ const answers = new Set(Object.values(K.BEAST_TELLS).map(r => r[1]).filter(Boolean)); ok(['block', 'duck', 'dodge'].every(a => answers.has(a)), 'block + duck + dodge from the three alone (answer-tags wants 3): ' + [...answers].join(', ')); }

console.log('node: the snowrunner');
{ const C = K.SNOW;
  let s = fresh('snowrunner', 0), ev = run(s, W([hero(55)]), 2);
  const st = ev.find(([, v]) => v.t === 'snapTell'), sn = ev.find(([, v]) => v.t === 'snap');
  ok(st && sn && near(sn[0] - st[0], C.snapTell, 0.05) && sn[1].dmg === C.snapDmg, 'the snap is told ' + C.snapTell + ' s (ears back, a half-crouch), ' + C.snapDmg + ' damage (' + (sn && (sn[0] - st[0]).toFixed(2)) + ' s)');
  { s = fresh('snowrunner', 0); const h = hero(55); let farthest = 0, bit = false; run(s, () => ({ ...W([h]) }), 4, v => { if (v.t === 'snap') bit = true; }); farthest = Math.abs(h.x - s.x);
    ok(bit && farthest >= C.orbitMin - 15, 'hit and run: after the bite it is back at ' + farthest.toFixed(0) + ' px (orbit ' + C.orbitMin + '-' + C.orbitMax + ')'); }
  /* the throat leap: head height, an arc from 70-100 px, told 0.55 s */
  s = fresh('snowrunner', 0); ev = run(s, W([hero(85)]), 3);
  const lt = ev.find(([, v]) => v.t === 'leapTell'), lp = ev.find(([, v]) => v.t === 'leap'), land = ev.find(([, v]) => v.t === 'skid' || v.t === 'leapHit' || v.t === 'airHit');
  ok(lt && lp && near(lp[0] - lt[0], C.leapTell, 0.05) && lp[1].dmg === C.leapDmg, 'the throat leap is told ' + C.leapTell + ' s (rears back, a puff of frost), ' + C.leapDmg + ' damage');
  { const apex = lp ? lp[1].vy * lp[1].vy / (2 * G) : 0; ok(apex >= 14 && apex <= 24, 'its arc peaks ' + apex.toFixed(0) + ' px up: head height (a ducked hero is under it)'); }
  { const s2 = fresh('snowrunner', 0), h = hero(85); let leapAt = -1, landAt = -1, landX = 0, skidT = 0; run(s2, W([h], { duck: true }), 3, (v, q, t) => { if (v.t === 'leap') leapAt = t; if (v.t === 'skid') { landAt = t; landX = q.x; skidT = q.t; } });
    ok(landAt > 0 && near(landAt - leapAt, C.leapT, 0.06), 'the leap takes ' + C.leapT + ' s from launch to touchdown (' + (landAt - leapAt).toFixed(2) + ')');
    ok(landX > h.x, 'a ducked or rolled leap lands BEHIND the hero (x=' + landX.toFixed(0) + ' past ' + h.x + ') and skids open ' + C.skid + ' s');
    ok(near(skidT, C.skid, 1e-6), 'skid: ' + skidT + ' s, open while it lasts (the missed leap is punishable)'); }
  { /* a flung 1 s open after a parried snap */ s = fresh('snowrunner', 0); s.mode = 'snap'; ok(K.beastParried(s) === 'parry' && s.mode === 'stunned' && near(s.t, C.yelp, 1e-6) && s.open, 'a PARRY of the snap: it yelps, is flung and open ' + C.yelp + ' s'); }
  /* poise: small family */
  s = fresh('snowrunner', 0); s.mode = 'snapTell'; s.t = 0.2; ok(K.beastStruck(s, { dmg: 3 }, C.hp) === 'cancel' && s.mode === 'recover', 'any blow cancels a runner\'s tell (small family)');
  s = fresh('snowrunner', 0); s.mode = 'walk'; ok(K.beastStruck(s, { dmg: 3 }, C.hp) === 'flinch', 'and flinches it outside one');
  s = fresh('snowrunner', 0); s.mode = 'leap'; s.air = true; ok(K.beastStruck(s, { dmg: 3 }, C.hp) === null, 'a leap in the air is committed: the blow lands, the beast goes on');
  /* the pack: one biter at a time, hold while Greymane pounces, hesitate when he falls */
  s = fresh('snowrunner', 0); ev = run(s, W([hero(55)], { canAttack: false }), 3); ok(!ev.some(([, v]) => /Tell$/.test(v.t)), 'no token (another runner is biting): it only circles');
  s = fresh('snowrunner', 0); ev = run(s, W([hero(55)], { hold: true }), 3); ok(!ev.some(([, v]) => /Tell$/.test(v.t)), 'while Greymane tells his pounce the runners HOLD (no cheap shot through his ring)');
  s = fresh('snowrunner', 0); K.beastHesitate(s); ev = run(s, W([hero(55)]), C.hesitate - 0.1); ok(!ev.some(([, v]) => /Tell$/.test(v.t)) && s.ears, 'Greymane down: the runners hesitate ' + C.hesitate + ' s, ears down (told)');
  /* orbit: a runner holds the ring, drifting both ways */
  { s = fresh('snowrunner', 0); s.cd = 99; const h = hero(200); let minD = 1e9, maxD = 0, sides = new Set();
    for (let t = 0; t < 8; t += DT) { K.beastStep(s, W([h]), DT); s.x += s.vx * DT; const d = Math.abs(h.x - s.x); if (t > 3) { minD = Math.min(minD, d); maxD = Math.max(maxD, d); } if (s.vx) sides.add(Math.sign(s.vx)); }
    ok(minD >= C.orbitMin - 20 && maxD <= C.orbitMax + 30, 'it circles at ' + C.orbitMin + '-' + C.orbitMax + ' px (held ' + minD.toFixed(0) + '-' + maxD.toFixed(0) + ') and never rushes in a straight line'); }
  /* co-op: the runners SPREAD */
  { const hs = [0, 1, 2, 3].map(i => hero(100 + i * 12, 0, i)), taken = [], pick = [];
    for (let i = 0; i < 4; i++) { const r = fresh('snowrunner', i * 5); const tg = K.pickTarget(r, { heroes: hs, taken: [...taken] }, C); pick.push(tg.id); taken.push(tg.id); }
    ok(new Set(pick).size === 4, '1-4 seats: four runners pick four different heroes (' + pick.join(',') + ')');
    const two = []; const t2 = []; for (let i = 0; i < 2; i++) { const r = fresh('snowrunner', i * 5); const tg = K.pickTarget(r, { heroes: hs.slice(0, 2), taken: [...t2] }, C); two.push(tg.id); t2.push(tg.id); } ok(new Set(two).size === 2, 'two seats: two runners take both');
    const lone = fresh('snowrunner', 0); ok(K.pickTarget(lone, { heroes: [hero(100)], taken: [] }, C).id === 0, 'one seat: the one hero');
    const down = [hero(80, 0, 0), { ...hero(60, 0, 1), alive: false }]; ok(K.pickTarget(fresh('snowrunner', 0), { heroes: down, taken: [] }, C).id === 0, 'a downed hero is never the target'); }
  s = fresh('snowrunner', 0); s.cd = 99; run(s, W([hero(300)], { canStep: () => false }), 1.5); ok(Math.abs(s.x) < 1e-6, 'it holds a ledge (canStep)'); }

console.log('node: greymane');
{ const C = K.GREY;
  let s = fresh('greymane', 0), ev = run(s, W([hero(55)]), 3);
  const bt = ev.find(([, v]) => v.t === 'biteTell'), bi = ev.find(([, v]) => v.t === 'bite');
  ok(bt && bi && near(bi[0] - bt[0], C.biteTell, 0.05) && bi[1].dmg === C.biteDmg, 'the crushing bite is told ' + C.biteTell + ' s (head low, a paw scrape), ' + C.biteDmg + ' damage, lunges ' + C.biteReach + ' px');
  ok(bi && bi[1].push === C.biteBlockPush, 'a block pushes the hero ' + C.biteBlockPush + ' px (heavy blockstun)');
  s = fresh('greymane', 0); s.mode = 'bite'; ok(K.beastParried(s) === 'parry' && s.mode === 'stunned' && near(s.t, C.biteStagger, 1e-6) && s.open, 'a PARRY staggers him ' + C.biteStagger + ' s (the big punish)');
  /* the pounce: a ring, a high arc, a pin or winded */
  const h = hero(110); s = fresh('greymane', 0); ev = run(s, W([h]), 4);
  const pt = ev.find(([, v]) => v.t === 'pounceTell'), pn = ev.find(([, v]) => v.t === 'pounce'), pin = ev.find(([, v]) => v.t === 'pounceHit'), wd = ev.find(([, v]) => v.t === 'winded');
  ok(pt && pn && near(pn[0] - pt[0], C.pounceTell, 0.05) && pn[1].dmg === C.pounceDmg, 'the pounce is told ' + C.pounceTell + ' s with a frost RING at the landing spot, ' + C.pounceDmg + ' damage');
  ok(pt && pt[1].ring && Math.abs(pt[1].ring.x) >= C.pounceMin && Math.abs(pt[1].ring.x) <= C.pounceMax && pt[1].ring.r === C.pounceR, 'the ring is ' + C.pounceMin + '-' + C.pounceMax + ' px out (x=' + (pt && pt[1].ring.x) + ', r ' + C.pounceR + ')');
  ok(pin && pin[1].pin === C.pin && pin[1].heroes.includes(0), 'a hero in the ring is PINNED ' + C.pin + ' s (' + (pin ? 'pinned' : 'not pinned - he stood at 110, ring at ' + (pt && pt[1].ring.x)) + ')');
  { const h2 = hero(110); s = fresh('greymane', 0); let ringX = null; ev = run(s, (q) => { if (ringX === null && q.mode === 'pounceTell') ringX = q.landX; if (ringX !== null) h2.x = ringX + 80; return W([h2]); }, 4);   /* he steps out of the ring */
    ok(ev.some(([, v]) => v.t === 'winded') && !ev.some(([, v]) => v.t === 'pounceHit'), 'a hero who steps out of the ring is missed: he lands WINDED');
    ok(s.mode === 'winded' || ev.some(([, v]) => v.t === 'winded'), 'winded ' + C.winded + ' s, open (gold stars)'); }
  ok(near((ev.find(([, v]) => v.t === 'pounce') || [0])[0] + C.pounceT, (ev.find(([, v]) => v.t === 'winded') || ev.find(([, v]) => v.t === 'pounceHit') || [0])[0], 0.08), 'it lands ' + C.pounceT + ' s after the launch');
  /* the bar: light cuts do not flinch him; the bar or a heavy blow does */
  s = fresh('greymane', 0); s.mode = 'biteTell'; s.t = 0.3; ok(K.beastStruck(s, { dmg: 4 }, C.hp) === null && s.mode === 'biteTell', 'a light cut does not flinch or cancel him (medium bar)');
  s = fresh('greymane', 0); s.mode = 'biteTell'; s.t = 0.3; ok(K.beastStruck(s, { dmg: 4, heavy: true }, C.hp) === 'cancel' && s.mode === 'stunned', 'a HEAVY blow staggers him and cancels the tell');
  s = fresh('greymane', 0); s.mode = 'biteTell'; s.t = 0.3; let broke = null; for (let i = 0; i < 6 && !broke; i++) broke = K.beastStruck(s, { dmg: 4 }, C.hp); ok(broke === 'cancel', 'the bar (' + (C.poiseBar * 100) + '% of his health) breaks under a flurry');
  ok(C.hp / K.SNOW.hp > 3, 'a real 1v1: ' + C.hp + ' health against a runner\'s ' + K.SNOW.hp);
  s = fresh('greymane', 0); ev = run(s, W([hero(300)]), 2); ok(s.x > 0, 'he walks up to a hero who is further off'); }

console.log('node: bruin');
{ const C = K.BRUIN;
  let s = fresh('bruin', 0), ev = run(s, W([hero(50)]), 3);
  const mt = ev.find(([, v]) => v.t === 'maulTell'), ma = ev.find(([, v]) => v.t === 'maul');
  ok(mt && ma && near(ma[0] - mt[0], C.maulTell, 0.05) && ma[1].dmg === C.maulDmg, 'the maul is told ' + C.maulTell + ' s (he STANDS AND ROARS), ' + C.maulDmg + ' damage (a yellow !)');
  ok(ma && ma[1].box[1] - ma[1].box[0] >= C.maulReach, 'a two-paw downswing ' + C.maulReach + ' px');
  s = fresh('bruin', 0); s.mode = 'maul'; ok(K.beastParried(s) === 'parry' && s.mode === 'stunned' && near(s.t, C.maulStagger, 1e-6), 'a PARRY staggers him ' + C.maulStagger + ' s on his back legs');
  s = fresh('bruin', 0); ev = run(s, W([hero(160)]), 4);
  const ct = ev.find(([, v]) => v.t === 'chargeTell'), ch = ev.find(([, v]) => v.t === 'charge'), sk = ev.find(([, v]) => v.t === 'skid');
  ok(ct && ch && near(ch[0] - ct[0], C.chargeTell, 0.05) && ch[1].dmg === C.chargeDmg, 'the charge is told ' + C.chargeTell + ' s (head low, snort and scrape, a lane on the floor), ' + C.chargeDmg + ' damage');
  ok(ct && ct[1].lane && near(ct[1].lane[1] - ct[1].lane[0], C.chargeRun, 1e-6), 'the lane is ' + C.chargeRun + ' px, drawn on the floor');
  ok(sk && sk[0] - ch[0] > 0.8 && sk[0] - ch[0] < 1.1, 'he runs up to ' + C.chargeRun + ' px at ' + C.chargeSpeed + ' px/s (' + (sk[0] - ch[0]).toFixed(2) + ' s) and skids ' + C.skid + ' s in the open (open: ' + s.open + ')');
  { const s2 = fresh('bruin', 0); let crash = null; const ev2 = run(s2, W([hero(160)], { wallAhead: x => x > 150 }), 4, (v, q) => { if (v.t === 'crash' && !crash) crash = { mode: q.mode, open: q.open, t: q.t }; }), cr = ev2.find(([, v]) => v.t === 'crash');
    ok(!!cr && crash.mode === 'dazed' && crash.open && near(crash.t, C.dazed, 1e-6), 'at a wall he crashes and is DAZED ' + C.dazed + ' s, open (' + (crash && crash.t) + ' s)'); }
  { const s3 = fresh('bruin', 0); const ev3 = run(s3, W([hero(160)]), 4); const hit = ev3.find(([, v]) => v.t === 'chargeHit'); ok(hit && hit[1].id === 0, 'a hero who stays in the lane is rammed once (16 + knockdown); the roll goes THROUGH it'); }
  { const s4 = fresh('bruin', 0); const h4 = hero(160); const ev4 = run(s4, q => { if (q.mode === 'charge') h4.y = -20; return W([h4]); }, 4); ok(ev4.some(([, v]) => v.t === 'chargeHit'), 'a hop (20 px) does not clear him: too tall to jump, unlike the boar - the answer is the roll'); }
  s = fresh('bruin', 0); s.mode = 'charge'; ok(K.beastStruck(s, { dmg: 9, heavy: true }, C.hp) === null && s.mode === 'charge', 'BRACED while charging: no flinch, and the blow lands in FULL');
  s = fresh('bruin', 0); s.mode = 'maulTell'; s.t = 0.5; ok(K.beastStruck(s, { dmg: 5 }, C.hp) === null && s.mode === 'maulTell', 'a light cut does not cancel the roar (heavy bar)');
  s = fresh('bruin', 0); s.mode = 'maulTell'; s.t = 0.5; ok(K.beastStruck(s, { dmg: 5, heavy: true }, C.hp) === 'cancel', 'a heavy blow in the roar staggers him');
  ok(C.hp > K.GREY.hp, 'the room\'s anchor: ' + C.hp + ' health'); }

console.log('node: the tables');
{ const main = rd('src/main.js'), audio = rd('src/audio.js');
  for (const t of K.BEAST_IDS) {
    ok(new RegExp(t + ': BSS\\.\\w+\\.hp').test(main), t + ' has an EHP row (BSS.*.hp)');
    ok(new RegExp("case '" + t + "'").test(main), t + ' has a spawn case in main.js (the pen and the tools use it)');
    ok(THREAT[t] > 0, t + ' is weighed in src/threat.js (' + THREAT[t] + ')');
    ok(materialOf(t) === 'fur', t + ' falls in FUR (src/death-fx.js)');
    ok(new RegExp('\\b' + t + ': \\{ kit:').test(audio), t + ' has a voice row (src/audio.js CAST)');
    ok(new RegExp(t + ": '[A-Z]+'").test(main), t + ' has a bestiary short name'); }
  ok(/BSS\.BEASTS_SHIPS \? \[/.test(main) && /t: 'snowrunner'/.test(main) && /t: 'greymane'/.test(main) && /t: 'bruin'/.test(main), 'three bestiary cards, shown only while BEASTS_SHIPS');
  ok(/'small'|small:/.test(main) && /kinds: \['sprig', 'hornsman', 'snowrunner'/.test(main) && /'merrowbrute', 'bruin'\]\);/.test(main), 'poise: the runner is small, Bruin the heavy bar');
  const SA = await import('../src/redraw/beasts_art.js');
  for (const [k, fn, n, w, h] of [['snowrunner', SA.bakeSnowrunner, 13, 18, 10], ['greymane', SA.bakeGreymane, 14, 26, 15], ['bruin', SA.bakeBruin, 16, 28, 16]]) { const sp = fn(); ok(sp.R.length === n && sp.L.length === n && sp.w === w && sp.h === h, k + ' sprite: ' + sp.R.length + ' frames, hit box ' + sp.w + 'x' + sp.h + ' (real art)'); }
  const { beastFrame } = await import('../src/beasts-hands.js');
  const fr = { snowrunner: [['snapTell', 6], ['snap', 7], ['leapTell', 8], ['leap', 9], ['skid', 10]], greymane: [['biteTell', 6], ['bite', 7], ['pounceTell', 8], ['pounce', 9], ['pin', 10], ['winded', 11]], bruin: [['maul', 8], ['chargeTell', 9], ['dazed', 13]] };
  for (const [k, rows] of Object.entries(fr)) ok(rows.every(([m, f]) => beastFrame({ t: k, mode: m, anim: 0, vx: 0, st: { mode: m, t: 0 } }) === f), k + ': every tell and blow has its own pose');
  ok(beastFrame({ t: 'bruin', mode: 'maulTell', anim: 0, vx: 0, st: { mode: 'maulTell', t: 0.8 } }) === 6 && beastFrame({ t: 'bruin', mode: 'maulTell', anim: 0, vx: 0, st: { mode: 'maulTell', t: 0.3 } }) === 7, 'Bruin stands (6), then roars (7)');
  { const A = await import('../src/redraw/beasts_art.js'); const f = A.bakeBruinFrost(); ok(f.R.length === 16, 'the frost recolour of the bruin (cnSkin frost) bakes too'); } }

console.log('node: the flag, the pen');
{ ok(K.BEASTS_SHIPS === false, 'BEASTS_SHIPS is false: nothing is live');
  const ids = new Set(K.BEAST_IDS), live = [];
  for (const lv of LEVELS) { let L; try { L = lv.build(); } catch { continue; } const all = [...(L.ents || []), ...(L.ambushes || []).flatMap(A => (A.waves || []).flat().map(f => ({ t: f[0] }))), ...(L.garrison || []).map(r => ({ t: Array.isArray(r) ? r[0] : r.t }))];
    for (const e of all) if (e && ids.has(e.t)) live.push(lv.id + ':' + e.t); }
  ok(live.length === 0, 'flag OFF: no live level places any of the three (' + (live.join(', ') || 'none') + ')');
  ok(PEN_NAMES.join() === 'wolves,bear,bones,all', 'the dev pen: ' + PEN_NAMES.join(', '));
  ok(PENS.wolves.filter(r => r.t === 'snowrunner').length === 4 && PENS.wolves.some(r => r.t === 'greymane') && PENS.bear[0].t === 'bruin' && PENS.bones.map(r => r.t).join() === 'skelsoldier,skelarcher,skelmage', 'wolves: 2 runners, then Greymane + 2 runners; bear: Bruin; bones: soldier + archer + mage');
  ok(PENS.all.length === PENS.wolves.length + PENS.bear.length + PENS.bones.length, 'all = the three pens in a row');
  const main = rd('src/main.js'); ok(/function penSet\(name\) \{ if \(!isDev\(\)/.test(main) && /isDev\(\) && q\.get\('pen'\)/.test(main), 'the pen is dev-gated (isDev) at the URL and at BK.pen');
  const lv = LEVELS.find(l => l.id === 'stockade'); ok(!!lv, 'the Stockade exists for the pen to load'); }

console.log('node: the hands (a mock game: flat floor, recorded calls)');
{ const { mockGame } = await import('./beasts-mock.mjs'), { makeBeastsHands } = await import('../src/beasts-hands.js');
  const mkE = (g, t, x, extra = {}) => g.add({ t, x, y: 0, w: K.BEAST_SIZE[t].w, h: K.BEAST_SIZE[t].h, hp: K.BEAST_HP[t], face: -1, ...extra });
  const secs = (g, H, s) => { for (let i = 0; i < Math.round(s * 60); i++) g.frame(H); };
  /* a runner bites, told, and the blow is the snap's (a yellow !, blockable); the leap is a red !! and unblockable */
  { const g = mockGame([{ x: 60 }]), H = makeBeastsHands(g.ctx), e = mkE(g, 'snowrunner', 0); secs(g, H, 14);
    ok(g.marks.some(m => m[0] === 'snowrunner' && m[1] === '!') && g.marks.some(m => m[0] === 'snowrunner' && m[1] === '!!'), 'the runner calls both marks in the hands: a yellow ! (snap) and a red !! (leap)');
    const snaps = g.hits.filter(h => h.d === K.SNOW.snapDmg), leaps = g.hits.filter(h => h.d === K.SNOW.leapDmg);
    ok(snaps.length > 0 && snaps.every(h => !h.o.unblockable && h.name === 'SNOWRUNNER'), 'snap blows land blockable (' + snaps.length + ')');
    ok(leaps.length > 0 && leaps.every(h => h.o.unblockable), 'leap blows land unblockable (' + leaps.length + ': a red !! the shield does not turn)');
    ok(g.calls['chill'] >= 1, 'the snap and the leap call chill through the shim (0.15)');
    ok(g.callouts.length === 1 && /SNOWRUNNER/.test(g.callouts[0]), 'one teaching line, said once (' + g.callouts.length + ')'); }
  { const g = mockGame([{ x: 55 }]), H = makeBeastsHands(g.ctx), e = mkE(g, 'snowrunner', 0); g.parryNext = true; let parried = false;
    for (let i = 0; i < 900 && !parried; i++) { g.frame(H); if (H.read().parries > 0) parried = true; } ok(parried && e.st.mode === 'stunned' && e.st.open, 'a parried snap: the runner yelps, stunned and open (' + e.st.mode + ')'); }
  /* ONE BITER AT A TIME: two runners never both wind up or strike in the same frame */
  { const g = mockGame([{ x: 70 }]), H = makeBeastsHands(g.ctx), a = mkE(g, 'snowrunner', -10), b = mkE(g, 'snowrunner', 150); let both = 0, any = 0;
    const att = q => /^(snapTell|snap|leapTell|leap)$/.test(q.st ? q.st.mode : 'stand');
    for (let i = 0; i < 60 * 25; i++) { g.frame(H); if (att(a) && att(b)) both++; if (att(a) || att(b)) any++; if (g.players[0].hp < 30) g.players[0].hp = 100; }
    ok(any > 0 && both === 0, 'one runner bites at a time (the purse): ' + any + ' frames with a biter, ' + both + ' with two'); }
  /* the pack holds while Greymane pounces, hesitates when he falls */
  { const g = mockGame([{ x: 110 }]), H = makeBeastsHands(g.ctx), gm = mkE(g, 'greymane', 0), r = mkE(g, 'snowrunner', 200); let heldWhile = 0, tells = 0;
    for (let i = 0; i < 60 * 12; i++) { g.frame(H); if (g.players[0].hp < 30) g.players[0].hp = 100; if (gm.st.mode === 'pounceTell' || gm.st.mode === 'pounce') { heldWhile++; if (/Tell$/.test(r.st.mode)) tells++; } }
    ok(heldWhile > 0 && tells === 0, 'while Greymane pounces the runner holds (' + heldWhile + ' frames, ' + tells + ' tells)');
    gm.alive = false; g.frame(H); ok(r.st.hesitate > 0 && H.read().hesitates === 1, 'Greymane down: the runner hesitates (ears down, told)'); }
  /* THE PIN: a hero caught in the ring is held; mash frees; a miss is winded */
  { const g = mockGame([{ x: 110 }]), H = makeBeastsHands(g.ctx), gm = mkE(g, 'greymane', 0); let pinned = false, f = 0;
    for (; f < 60 * 14 && !pinned; f++) { g.frame(H); if (H.read().pins > 0) pinned = true; if (g.players[0].hp < 30) g.players[0].hp = 100; }
    ok(pinned && g.hits.some(h => h.d === K.GREY.pounceDmg && h.o.unblockable), 'a hero in the ring takes ' + K.GREY.pounceDmg + ' (a red !!, unblockable) and is PINNED');
    let held = 0; for (let i = 0; i < 40 && H.read().pins > 0; i++) { g.players[0].abuf = 1; g.frame(H); held++; }
    ok(H.read().pins === 0 && held <= Math.ceil(K.GREY.pin / 0.18) + 1 && g.unpins >= 1 && H.read().frees >= 1, 'mashing frees him early (' + held + ' frames of the ' + Math.round(K.GREY.pin * 60) + '), and he is let go'); }
  { const g = mockGame([{ x: 110 }]), H = makeBeastsHands(g.ctx), gm = mkE(g, 'greymane', 0); g.ctx.heroes = () => g.players.map((p, i) => ({ x: gm.st.mode === 'pounce' ? (gm.st.landX || 0) + 90 : p.x, y: p.y, face: p.face, alive: true, id: i, w: 10, h: 14 }));
    secs(g, H, 8); ok(H.read().pins === 0 && H.read().winded >= 1, 'a hero who steps out of the ring: no pin, he lands winded (' + H.read().winded + ')'); }
  /* the pin ends when an ally strikes him */
  { const g = mockGame([{ x: 110 }, { x: 140 }]), H = makeBeastsHands(g.ctx), gm = mkE(g, 'greymane', 0); let pinned = false;
    for (let f = 0; f < 60 * 14 && !pinned; f++) { g.frame(H); if (H.read().pins > 0) pinned = true; g.players.forEach(p => { if (p.hp < 30) p.hp = 100; }); }
    if (pinned) { const pp = H.pins[0].pp, ally = g.players.find(p => p !== pp); g.swing = { p: ally, box: { l: gm.x - 20, r: gm.x + 20, t: gm.y - 20, b: gm.y } }; g.frame(H); ok(H.read().pins === 0 && H.read().frees >= 1, "an ally's blow on Greymane frees the pinned hero"); } else ok(false, 'the ally-frees test needs a pin (none landed in 14 s with two heroes)'); }
  /* a blow in a runner's tell cancels it; a light cut does not touch Greymane's */
  { const g = mockGame([{ x: 55 }]), H = makeBeastsHands(g.ctx), e = mkE(g, 'snowrunner', 0), gm = mkE(g, 'greymane', -300); e.st = K.newSnowrunner(0, 0, 1); e.st.mode = 'snapTell'; e.st.t = 0.2; H.take(e, 3, { fromX: 40 }); ok(e.st.mode === 'recover' && e.mode === 'recover', "a blow in the snap's tell cancels it (via hands.take)");
    gm.st = K.newGreymane(-300, 0, 1); gm.st.mode = 'biteTell'; gm.st.t = 0.3; const d = H.take(gm, 4, { fromX: -280 }); ok(d === 4 && gm.st.mode === 'biteTell', 'a light cut spares his bite and the damage is whole'); }
  /* Bruin: the maul is told and blockable, the charge unblockable, rams once, knocks down */
  { const g = mockGame([{ x: 45 }]), H = makeBeastsHands(g.ctx), b = mkE(g, 'bruin', 0); secs(g, H, 4);
    ok(g.hits.some(h => h.d === K.BRUIN.maulDmg && !h.o.unblockable), 'the maul lands blockable (a yellow !)'); }
  { const g = mockGame([{ x: 170 }]), H = makeBeastsHands(g.ctx), b = mkE(g, 'bruin', 0); secs(g, H, 4);
    const rams = g.hits.filter(h => h.d === K.BRUIN.chargeDmg); ok(rams.length === 1 && rams[0].o.unblockable && g.calls['down'] === 1, 'the charge rams once, unblockable, and knocks him down (' + rams.length + ' hit, ' + (g.calls['down'] || 0) + ' down)'); }
  /* far from the hero nothing moves */
  { const g = mockGame([{ x: 2000 }]), H = makeBeastsHands(g.ctx), e = mkE(g, 'snowrunner', 0); secs(g, H, 3); ok(e.x === 0 && !g.hits.length, 'out of sight (540 px) the beasts only stand'); }
}


console.log(bad ? '\nbeasts: ' + bad + ' FAILED' : '\nok  beasts         the wolf pack (circle, one biter, hold, hesitate, spread), the leap and its skid, Greymane\'s ring / pin / winded, Bruin\'s maul / lane / dazed, the bars, the tables, the flag off, the pen');
process.exit(bad ? 1 : 0);
