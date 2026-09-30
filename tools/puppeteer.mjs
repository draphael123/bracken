// tools/puppeteer.mjs - THE PUPPETEER, the Maskwright's Theatre's boss (claude/puppeteer). src/puppeteer.js is the fight (its header is the design).
// PURE (src/puppeteer.js, no page):
//   - THE RULE: a puppet's string is cut only while it is TAUT (in a windup, a blow, or being flown) - a swing across a slack one cuts nothing; a cut in a
//     windup CANCELS the blow (no hit is thrown) and staggers it; the second cut drops it in a heap
//   - EVERY ATTACK FIRES (rule A3) and is TOLD with its own windup, mark, answer and height: the soldier's chop (!, block), the harlequin's spin (!!, jump,
//     low), the drop (!!, dodge), his whip low (!!, jump) and high (!!, duck), his snare (!!, dodge), the masterpiece's swat (!, block), stomp (!!, dodge)
//     and reach (!!, duck, high); coming down and lowering the masterpiece throw no blow; each blow lands only after its full told time
//   - THE OPENINGS ARE CAUSED (A11): left alone for a minute he never opens; both puppets cut down, he comes down his line and re-strings them - open,
//     at PUP.openMul; working in the loft a blow on him lands at PUP.ward
//   - ONE DOWN, THE OTHER DANCING: he lowers a new string to the heap, and it can be cut on its way down
//   - PHASE 2 (2/3): he cuts his line (no more descents) and the pin rail is free (locked before); the batten rises to the gallery and comes back; a
//     hero on the gallery has the puppets flown up to him, and cut down there he re-strings them where he stands, open; his whip bands catch a
//     standing hero and miss a jumping (low) or ducked (high) one; the snare takes a hero who stays on the loop and not one who stepped out
//   - PHASE 3 (1/3): the puppets are packed away and the masterpiece is lowered in on four strings; all four cut, it falls and he is dragged down to
//     the stage - fallen, open at PUP.fallMul
// THE STAGE: the standalone level holds the arena (walls, trigger past the door, a checkpoint outside it, ~40 wide, the gallery 9 rows up, the batten,
//   his own music); ?boss=puppeteer finds him (the boss table reads the levels)
// IN THE PAGE: the fight wakes past the door; a blow on a puppet's body does nothing; a real swing across a glowing string cuts it and cancels the chop;
//   a blow on him in the loft is warded; both cut down he comes down and a blow bites harder; the pin rail is locked in phase 1 and frees the batten in
//   phase 2; his death ends the fight, drops the puppets and lets the curtain down.
//   node tools/puppeteer.mjs        (PORT from tools/ports.mjs)
import { openPage } from './cdp.mjs';
import * as M from '../src/puppeteer.js';
import { MARK, ANSWER, HEIGHT } from '../src/marks.js';
import { LEVELS } from '../src/level.js';

const bad = [], ok = (c, m) => { if (!c) bad.push(m); };
const DT = 1 / 60, TS = 16, R = 20, SX = 14, FLOOR = R * TS, GAL = (R - 9) * TS;
const A = { x0: (SX + 1) * TS, x1: (SX + 39) * TS, floor: FLOOR, gallery: GAL, gx0: (SX + 3) * TS, gx1: (SX + 39) * TS };
/* a show and a world: `log` counts what the world was asked to do */
function rig(o = {}) {
  const show = M.newShow(A), e = M.newPuppeteer({ t: 'puppeteer', x: o.bx ?? (SX + 30) * TS, y: GAL, hp: o.hp ?? 720, maxHp: 720, alive: true });
  e.mode = 'work'; e.modeT = 0;
  const mk = (t, x) => M.newPuppet({ t, x, y: FLOOR, alive: true, face: -1, hp: 999, maxHp: 999 }, show);
  const sol = o.noSoldier ? null : mk('marionette', o.sx ?? 420), har = o.noHarlequin ? null : mk('harlequin', o.hx ?? 520);
  const hero = { x: o.x ?? 380, y: FLOOR, face: 1, alive: true, ground: true };
  const log = { hits: [], bands: [], snares: 0, lines: [], summons: 0, events: {} };
  const c = { heroes: [hero], say: () => {}, sound: () => {}, number: (x, y, t) => log.lines.push(t),
    hit: (box, d, name, opt) => log.hits.push({ box, d, name, opt }), band: (kind, fy, x0, x1, d, name, key) => log.bands.push({ kind, fy, x0, x1, d, name, key }),
    snare: () => log.snares++, pack: p => { p.alive = false; },
    summon: (t, x, y) => { log.summons++; const p = { t, x, y, alive: true, face: -1, hp: 999, maxHp: 999 }; M.newPuppet(p, show); return null; } };
  const step = () => { hero.lastFloor = M.heroFloor(show, { ...hero, lastFloor: hero.lastFloor }); const ev = M.stepShow(e, show, DT, c); for (const v of ev) log.events[v.t] = (log.events[v.t] || 0) + 1; return ev; };
  const swingAt = (px, py, face = 1) => M.strikeStrings(e, show, face > 0 ? { l: px + 2, r: px + 26, t: py - 22, b: py } : { l: px - 26, r: px - 2, t: py - 22, b: py }, new Set());
  return { show, e, sol, har, hero, log, c, step, swingAt };
}
const until = (r, pred, n = 600) => { for (let i = 0; i < n; i++) { if (pred()) return true; r.step(); } return pred(); };

// ---- THE RULE: only a taut string is cut; a cut cancels the blow; the second drops it ----
{ const r = rig({ noHarlequin: true, x: 390, sx: 410 }); const s = r.sol;
  ok(!M.pupTaut(s), 'a hanging puppet\'s strings are taut before it does anything');
  const c0 = r.swingAt(r.hero.x, FLOOR); ok(c0.length === 0, 'a swing across a SLACK string cut it (' + c0.length + ')');
  ok(until(r, () => s.mode === 'chopTell', 600), 'the soldier never wound up its chop at a hero 20 px away (mode ' + s.mode + ')');
  ok(M.pupTaut(s), 'the soldier\'s strings are not taut in its windup');
  const c1 = r.swingAt(r.hero.x, FLOOR); ok(c1.length >= 1, 'a swing across the soldier\'s strings in its windup cut nothing');
  const hits0 = r.log.hits.length; for (let i = 0; i < 60; i++) r.step();
  ok(r.log.hits.filter(h => h.name === 'THE SOLDIER').length === 0 || r.log.hits.length === hits0, 'a cut in the windup did not cancel the chop: it still landed');
  ok(r.log.events.cancel >= 1 || c1.length === 2, 'the cut did not cancel (no cancel event)');
  if (M.stringsLeft(s) > 0) { ok(until(r, () => M.pupTaut(s), 900), 'a one-string soldier never wound up again'); r.swingAt(r.hero.x, FLOOR); for (let i = 0; i < 90; i++) r.step(); }
  ok(M.heaped(s) && s.mode === 'heap', 'two strings cut and the soldier is not in a heap (mode ' + s.mode + ', left ' + M.stringsLeft(s) + ')'); }

// ---- THE CHOP, LEFT ALONE, LANDS - after its whole told time; and its mark/answer/height rows ----
{ const r = rig({ noHarlequin: true, x: 390, sx: 410 }); let tell = -1, blow = -1;
  for (let i = 0; i < 900 && blow < 0; i++) { r.step(); if (r.sol.mode === 'chopTell' && tell < 0) tell = i; if (r.log.hits.some(h => h.name === 'THE SOLDIER')) blow = i; }
  ok(blow > 0 && tell >= 0 && (blow - tell) * DT >= M.PUP.chopTell - 0.03, 'the chop landed ' + ((blow - tell) * DT).toFixed(2) + ' s after its windup began (told ' + M.PUP.chopTell + ' s)');
  const h = r.log.hits.find(q => q.name === 'THE SOLDIER'); ok(h && !h.opt.unblockable, 'the chop is not a blow a shield turns'); }
const ROWS = { 'marionette|chopTell': ['!', 'block', 'low'], 'marionette|dropTell': ['!!', 'dodge', 'low'], 'harlequin|spinTell': ['!!', 'jump', 'low'], 'harlequin|dropTell': ['!!', 'dodge', 'low'],
  'puppeteer|whipLowTell': ['!!', 'jump', 'low'], 'puppeteer|whipHighTell': ['!!', 'duck', 'high'], 'puppeteer|snareTell': ['!!', 'dodge', 'low'],
  'masterpiece|swatTell': ['!', 'block', 'low'], 'masterpiece|stompTell': ['!!', 'dodge', 'low'], 'masterpiece|reachTell': ['!!', 'duck', 'high'] };
for (const [k, [m, a, hgt]] of Object.entries(ROWS)) { ok(MARK[k] === m, k + ' wears ' + JSON.stringify(MARK[k]) + ', not ' + m); ok(ANSWER[k] === a, k + ' is answered ' + JSON.stringify(ANSWER[k]) + ', not ' + a); ok(HEIGHT[k] === hgt, k + ' is ' + JSON.stringify(HEIGHT[k]) + ' high, not ' + hgt); }
for (const k of ['puppeteer|descendTell', 'puppeteer|masterTell']) ok(MARK[k] === '', k + ' throws no blow but wears ' + JSON.stringify(MARK[k]));

// ---- EVERY ATTACK FIRES (A3): a fuzz on the stage and in the loft ----
{ const fired = {}; let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (const ph of [1, 2, 3]) { const r = rig({ hp: ph === 1 ? 720 : ph === 2 ? 400 : 200, x: 400 });
    for (let i = 0; i < 60 * 70; i++) { if (i % 90 === 0) { r.hero.x = A.x0 + 40 + rnd() * (A.x1 - A.x0 - 80); const up = ph > 1 && rnd() < 0.5; r.hero.y = up ? GAL : FLOOR; }
      r.step();
      for (const k of ['chop', 'spin', 'drop', 'whip', 'snare', 'swat', 'stomp', 'reach']) if (r.show.n[k]) fired[k] = true; } }
  for (const k of ['chop', 'spin', 'drop', 'whip', 'snare', 'swat', 'stomp', 'reach']) ok(fired[k], 'THE ' + k.toUpperCase() + ' never fired in a fuzz of all three phases (rule A3)'); }

// ---- THE OPENING IS CAUSED: left alone a minute he never opens; both cut down he comes down, re-strings, open ----
{ const r = rig({ x: 250 }); let opened = 0; for (let i = 0; i < 60 * 60; i++) { r.hero.x = 250; r.step(); if (M.pupOpen(r.e)) opened++; }
  ok(opened === 0, 'left alone for a minute (nobody cutting) he was open ' + opened + ' frames');
  ok(M.pupTake(r.e) === M.PUP.ward, 'working the bars he takes ' + M.pupTake(r.e) + ' of a blow, not the ward ' + M.PUP.ward); }
{ const r = rig(); for (const p of [r.sol, r.har]) for (const s of p.str) s.cut = true; r.step(); r.step();
  ok(r.e.mode === 'descendTell', 'both puppets cut down and he did not start down his line (mode ' + r.e.mode + ')');
  ok(until(r, () => r.e.mode === 'restring', 200), 'he never reached the stage to re-string (mode ' + r.e.mode + ')');
  ok(r.e.y === FLOOR && M.pupOpen(r.e) && M.pupTake(r.e) === M.PUP.openMul, 'kneeling on the stage re-stringing he is not open at ' + M.PUP.openMul + ' (y ' + r.e.y + ', take ' + M.pupTake(r.e) + ')');
  ok(r.log.lines.includes('HE IS RE-STRINGING THEM: CUT HIM'), 'his opening was not said in the hint box');
  ok(until(r, () => r.e.mode === 'work' && r.e.y === GAL, 400), 'after re-stringing he did not go back up (mode ' + r.e.mode + ')');
  ok(M.stringsLeft(r.sol) === 2 && M.stringsLeft(r.har) === 2, 'the puppets came back without their strings'); }

// ---- ONE DOWN, THE OTHER DANCING: a new string comes down to the heap, and it can be cut ----
{ const r = rig({ x: 250 }); for (const s of r.sol.str) s.cut = true; r.step(); r.step();
  ok(until(r, () => !!r.show.lowering, 60 * 9), 'one puppet down for ' + M.PUP.lonelyT + ' s and no new string came down to it');
  if (r.show.lowering) { for (let i = 0; i < 40; i++) r.step(); const s = M.stringsOf(r.e, r.show).find(q => q.lowering);
    ok(s && s.taut, 'the new string on its way down is not taut (it must glow)');
    const cut = s && M.strikeStrings(r.e, r.show, { l: s.x1 - 4, r: s.x1 + 4, t: s.y1 - 4, b: s.y1 + 4 }, new Set());
    ok(cut && cut.length === 1 && !r.show.lowering && r.show.n.lowerCut === 1, 'the new string could not be cut on its way down'); } }

// ---- PHASE 2: the line is cut, the pin rail is free, the batten carries you up; flown puppets; the loft re-stringing; the whip; the snare ----
{ const b = { x: 240, w: 32, y: FLOOR, down: FLOOR, up: GAL, st: 'down', t: 0 };
  ok(M.pinStrike(b, false) === 'locked' && b.st === 'down', 'the pin rail is not locked in phase 1');
  const r = rig({ hp: 470 }); r.step(); ok(r.e.phase === 2 && r.e.mode === 'cutLine' && !r.show.line && r.show.free, 'below 2/3 he did not cut his own line and free the counterweight (phase ' + r.e.phase + ', mode ' + r.e.mode + ')');
  ok(r.log.lines.includes('RIDE THE BATTEN UP: STRIKE THE PIN RAIL'), 'the counterweight was not taught in the hint box');
  ok(M.pinStrike(b, true) === 'free', 'struck in phase 2 the pin rail did not free the batten');
  let t = 0; while (b.st === 'rise' && t < 200) { M.stepBatten(b, DT); t++; }
  ok(b.st === 'up' && b.y === GAL && t * DT < 1.3, 'the batten did not reach the gallery in time (' + (t * DT).toFixed(2) + ' s, ' + b.st + ')');
  for (let i = 0; i < 60 * 9 && b.st !== 'down'; i++) M.stepBatten(b, DT); ok(b.st === 'down' && b.y === FLOOR, 'the batten never came back down');
  // a hero on the gallery: the puppets are flown up to him
  r.hero.y = GAL; r.hero.x = 500; ok(until(r, () => r.sol.flown && r.har.flown, 60 * 4), 'with a hero in the loft his puppets were not flown up to the gallery');
  for (const p of [r.sol, r.har]) for (const s of p.str) s.cut = true;
  ok(until(r, () => r.e.mode === 'restring', 60 * 4), 'cut down in the loft, he did not re-string them (mode ' + r.e.mode + ')');
  ok(r.e.y === GAL && M.pupOpen(r.e), 'phase 2: he came down his cut line, or is not open re-stringing in the loft');
  ok(until(r, () => r.e.mode === 'work', 60 * 5), 'the loft re-stringing never ended'); }
{ for (const [kind, box, hit] of [['low', { t: FLOOR - 28, b: FLOOR }, true], ['low', { t: FLOOR - 58, b: FLOOR - 30 }, false], ['high', { t: FLOOR - 28, b: FLOOR }, true], ['high', { t: FLOOR - 8, b: FLOOR }, false]])
    ok(M.bandCatches(kind, FLOOR, box) === hit, 'the ' + kind + ' whip ' + (hit ? 'misses a standing hero' : 'catches a ' + (kind === 'low' ? 'jumping' : 'ducked') + ' one')); }
{ for (const stay of [true, false]) { const r = rig({ hp: 400 }); r.e.phase = 2; r.show.line = false; r.show.free = true; r.hero.y = GAL; r.hero.x = r.e.x - 60; r.e.snareCd = 0; r.e.whipCd = 99;
    for (let i = 0; i < 30 && r.e.mode !== 'snareTell'; i++) r.step();
    ok(r.e.mode === 'snareTell' && r.show.snare, 'with a hero in the loft near him the snare was never told');
    if (!stay) r.hero.x += 40; for (let i = 0; i < 70; i++) r.step();
    ok(stay ? r.log.snares === 1 : r.log.snares === 0, stay ? 'a hero standing on the loop was not snared' : 'a hero who stepped out of the loop was snared'); } }

// ---- PHASE 3: the masterpiece; all four cut and he falls with it, open ----
{ const r = rig({ hp: 230, x: 300 }); r.e.phase = 2; r.show.line = false; r.show.free = true; r.step();
  ok(r.e.phase === 3 && r.e.mode === 'masterTell', 'below 1/3 he did not lower his masterpiece (mode ' + r.e.mode + ')');
  ok(!r.sol.alive && !r.har.alive, 'the small puppets were not packed away for the masterpiece');
  ok(until(r, () => r.show.puppets.some(p => p.t === 'masterpiece'), 120) && r.log.summons === 1, 'the masterpiece never came');
  const mp = r.show.puppets.find(p => p.t === 'masterpiece'); ok(mp && mp.str.length === 4, 'the masterpiece does not hang on four strings');
  if (mp) { until(r, () => r.e.mode === 'work' && mp.mode === 'hang', 400); for (const s of mp.str) s.cut = true;
    ok(until(r, () => r.e.mode === 'yanked', 120), 'all four strings cut and the crossbar did not drag him off the gallery (mode ' + r.e.mode + ', ' + mp.mode + ')');
    ok(until(r, () => r.e.mode === 'fallen', 120) && r.e.y === FLOOR && M.pupTake(r.e) === M.PUP.fallMul, 'he did not land on the stage fallen and open at ' + M.PUP.fallMul);
    ok(until(r, () => r.e.mode === 'rerig', 60 * 8) && until(r, () => r.e.mode === 'work', 60 * 5) && M.stringsLeft(mp) === 4, 'after the fall he did not climb back and rig the masterpiece again'); } }

// ---- THE STAGE (the standalone level) ----
{ const lv = LEVELS.find(l => l.id === 'puppetstage'); ok(lv && lv.hidden, 'the standalone stage is not a hidden level');
  if (lv) { const L = lv.build(), A2 = L.arena; ok(A2 && A2.boss === 'puppeteer' && A2.music === 'puppeteer', 'the stage is not his arena with his music');
    const w = A2.wallR - A2.wallL; ok(w >= 36 && w <= 44, 'the stage is ' + w + ' wide (rule A7: about forty)');
    ok(A2.trigger > (A2.wallL + 1) * 16, 'the trigger is not past the door');
    ok(L.ents.some(e => e.t === 'check' && e.x < A2.wallL), 'no checkpoint stands outside the stage door');
    ok(L.ents.filter(e => e.t === 'puppeteer').length === 1 && L.ents.some(e => e.t === 'marionette') && L.ents.some(e => e.t === 'harlequin'), 'he and his two puppets are not on the stage');
    ok((L.moversExtra || []).some(m => m.batten), 'the stage has no batten'); const G = A2.stage.gallery / 16;
    let boards = 0; for (let x = A2.wallL + 3; x < A2.wallR; x++) if (L.grid[G * L.W + x] === 2) boards++; ok(boards >= 30, 'the fly gallery has ' + boards + ' boards'); } }

// ---- IN THE PAGE ----
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out={};
    const boot=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='puppetstage'));BK.state='play';BK.god=true;BK.sim(10);
      const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(150);return BK.boss;};
    const e=boot(),PH=BK.puppeteerHands(),S=PH.show(),A=BK.L.arena,P=BK.P;
    out.woke=BK.bossActive&&e&&e.t==='puppeteer';out.bar=BK.bossOpen(e);
    const sol=S.puppets.find(p=>p.t==='marionette'),har=S.puppets.find(p=>p.t==='harlequin');
    /* a blow on a puppet's body: wood */
    const hp0=sol.hp;BKT.hurtEnemy(sol,40,sol.x-10,false);out.wood={hp:sol.hp-hp0,alive:sol.alive,left:sol.str.filter(s=>!s.cut).length};
    /* a warded blow on him in the loft */
    const bh=e.hp;BKT.hurtEnemy(e,50,e.x-10,false);out.ward=bh-e.hp;
    /* a real swing across the soldier's glowing string: stand beside it, wait for the chop's windup, press X */
    har.x=A.x1-40;S.gap=0;S.turn=0;let tries=0;
    for(;tries<600&&sol.mode!=='chopTell';tries++){P.x=sol.x-18;P.face=1;P.vx=0;BK.sim(1);}
    const inTell=sol.mode==='chopTell',left0=sol.str.filter(s=>!s.cut).length,hitsTaken=P.hp;P.face=1;BK.press('atk');BK.sim(14);
    out.swing={inTell,left0,left1:sol.str.filter(s=>!s.cut).length,mode:sol.mode};
    /* both down: he comes down, and a blow bites harder */
    for(const p of [sol,har])for(const s of p.str)s.cut=true;let f=0;for(;f<400&&e.mode!=='restring';f++)BK.sim(1);
    const oh=e.hp;BKT.hurtEnemy(e,50,e.x-10,false);out.open={mode:e.mode,y:e.y,dmg:oh-e.hp,floor:A.floor,bar:BK.bossOpen(e)};
    /* the pin rail, locked (phase 1) */
    const b=S.batten;out.pin1=PH.read().free;
    /* phase 2: the rail frees the batten */
    for(let i=0;i<400&&e.mode!=='work';i++)BK.sim(1);e.hp=Math.floor(e.maxHp*0.6);for(let i=0;i<5;i++)BK.sim(1);out.phase2={phase:e.phase,free:S.free,line:S.line};
    P.x=b.x+b.w/2-4;P.y=A.floor;P.face=1;P.vx=0;BK.sim(20);P.face=1;BK.press('atk');BK.sim(10);let up=0;for(let i=0;i<120;i++){BK.sim(1);if(b.st==='up'){up=i;break;}}
    out.batten={st:b.st,y:b.y,up:b.up,pin:S.n.pin,onIt:P.onMover===b,heroY:Math.round(P.y)};
    /* his death ends the fight: the puppets drop and the curtain comes down */
    e.hp=1;e.mode='restring';e.modeT=3;BKT.hurtEnemy(e,99,e.x-10,false);for(let i=0;i<200&&BK.bossActive;i++){P.inv=99;BK.sim(1);}
    out.death={alive:e.alive,active:BK.bossActive,curtain:S.curtain>0,heaps:S.puppets.filter(p=>p.alive&&p.mode==='heap').length};
    return out;})()`, 300000);
  ok(r.woke, 'the fight did not wake past the stage door');
  ok(r.wood.hp === 0 && r.wood.alive && r.wood.left === 2, 'a blow on a puppet\'s body did something: ' + JSON.stringify(r.wood));
  ok(r.ward > 0 && r.ward <= Math.ceil(50 * M.PUP.ward * 1.3), 'a blow on him working the bars was not warded (' + r.ward + ' of 50)');
  ok(r.swing.inTell && r.swing.left1 === r.swing.left0 - 1 && r.swing.mode === 'stagger', 'a real swing across the soldier\'s glowing strings in its windup did not cut ONE (the second is the second blow) and stagger it: ' + JSON.stringify(r.swing));
  ok(r.open.mode === 'restring' && r.open.y === r.open.floor && r.open.bar && r.open.dmg > r.ward * 3, 'both puppets down, he did not come down open (a blow did ' + r.open.dmg + '): ' + JSON.stringify(r.open));
  ok(r.pin1 === false, 'the pin rail was free in phase 1');
  ok(r.phase2.phase === 2 && r.phase2.free && !r.phase2.line, 'phase 2 did not free the counterweight: ' + JSON.stringify(r.phase2));
  ok(r.batten.pin >= 1 && r.batten.st === 'up' && r.batten.onIt && Math.abs(r.batten.heroY - r.batten.up) < 3, 'a swing at the pin rail from the batten did not carry the hero up: ' + JSON.stringify(r.batten));
  ok(!r.death.alive && !r.death.active && r.death.curtain && r.death.heaps === 2, 'his death did not end the fight and bring the curtain down: ' + JSON.stringify(r.death));
  ok(pg.errors.length === 0, 'the page threw: ' + pg.errors.slice(0, 3).join(' | '));
  console.log(JSON.stringify(r));
} finally { pg.close(); }

if (bad.length) { console.log('PUPPETEER: ' + bad.length + ' problem(s):'); for (const b of bad) console.log('  - ' + b); process.exit(1); }
console.log('ok  puppeteer  the strings are cut only taut, a cut cancels the blow, every attack fires told with its mark/answer/height, the openings are caused (the descent, the loft, the fall), the batten, the flown puppets, the whip and the snare, the masterpiece, the stage, and in the page');
