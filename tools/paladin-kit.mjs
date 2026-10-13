// tools/paladin-kit.mjs — PALADIN 2: HOLY GROUND + LIGHT SPENT (claude/paladin2, scratch/brief-paladin2.md, src/holy-ground.js). On flat Stockade
// floor, with the real keys, this fails when:
//   - a TAP of C does not plant ONE circle at his feet (or costs no wind), a second circle can stand beside the first, a tap inside the
//     replant wait plants again, or a tap after it does not MOVE the circle to where he stands
//   - standing in his circle does not mend him slowly (or he mends out of it), a foe standing in it does not burn (or one outside does)
//   - his maul does not land harder in his circle than out of it (HG.hitMul)
//   - LIGHT IS NOT SPENT: a tap in his circle with HG.empower.cost does not EMPOWER it (wider, longer) and take the Light; a full bar there is
//     not JUDGEMENT; UP + C with HG.throw.cost is not the HAMMER THROW (Light taken, a foe ahead struck) or with too little it throws and
//     takes anything; the held overhead in his circle with HG.smite.cost is not a SMITE (Light taken), or out of it it takes any
//   - the circle goes out early or stands past its life
//   - CO-OP: a partner standing in his circle while he holds the AEGIS is not covered (the blow turned, the paladin's wind paying), or one
//     outside it / with the aegis down / a RED blow is covered
//   - the page throws
//   node tools/paladin-kit.mjs            (PORT from tools/ports.mjs)
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { HG } from '../src/holy-ground.js';

const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  await pg.reload();
  R = await pg.evalp(`(async()=>{
    if (!BK.holy) return { err: 'no BK.holy: there is no holy ground' };
    BK.SET.speed = 1;
    const { LEVELS } = await import('/src/level.js'); const { HG } = await import('/src/holy-ground.js');
    BK.setHero('paladin'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'stockade')); BK.start(); BK.god = false; BK.sim(5);
    const L0 = BK.L, W = L0.W, at = (x, y) => L0.grid[y * W + x];
    let spot = null;
    for (let x0 = Math.floor(BK.P.x / 16); x0 < W - 30 && !spot; x0++) for (let y = 7; y < L0.H - 2 && !spot; y++) {
      let ok = true; for (let x = x0; x < x0 + 26 && ok; x++) ok = at(x, y + 1) === 1 && [0, 1, 2, 3, 4, 5, 6].every(k => at(x, y - k) === 0);
      if (ok) spot = [x0 + 9, y]; }
    if (!spot) return { err: 'no flat floor' };
    const K = BK.keys, none = () => { for (const k of ['left', 'right', 'up', 'down', 'jump', 'block', 'atk']) K[k] = false; };
    const clear = () => { for (const e of BK.enemies()) e.alive = false; for (const s of BK.seeds()) s.dead = true; };
    const H = () => BK.holy(), mine = () => H().circles.filter(c => c.owner === 1 || c.owner === null);
    const home = (dx = 0) => { clear(); none(); BK.holyHands().clear(); BK.god = true; BK.tp(spot[0], spot[1]); BK.sim(40); BK.god = false; const P = BK.P; P.x += dx; P.hp = P.maxHp; P.st = P.maxSt; P.vx = 0; P.hurt = 0; P.face = 1; P.light = 0; P.inv = 0; BK.sim(20); };
    const tap = (o = {}) => { none(); if (o.up) K.up = true; K.block = true; BK.sim(3); K.block = false; BK.sim(2); K.up = false; BK.sim(o.after ?? 20); };
    const out = {};
    /* 1. ONE CIRCLE, at his feet, for wind */
    home(); { const st0 = BK.P.st; tap({ after: 1 }); const c = H().circles; out.plant = { n: c.length, dx: c[0] ? Math.abs(c[0].x - BK.P.x) : 99, r: c[0] && c[0].r, stPaid: st0 - BK.P.st > HG.st - 3 };
      tap({ after: 5 }); out.waitN = H().circles.length; out.waitX = H().circles[0] && H().circles[0].x;
      BK.sim(80); BK.P.x += 120; BK.sim(10); const x1 = BK.P.x; tap(); out.moved = { n: H().circles.length, x: H().circles[0] && H().circles[0].x, want: Math.round(x1) }; }
    /* 2. THE SLOW MEND, in and out */
    home(); tap(); { const P = BK.P; P.hp = 40; BK.sim(120); out.mendIn = P.hp - 40; P.x += 200; BK.sim(10); P.hp = 40; BK.sim(120); out.mendOut = P.hp - 40; }
    /* 3. A FOE IN IT BURNS, one outside does not */
    home(); tap(); { const [a] = BK.spawnFoe({ t: 'sprig', x: spot[0] + 1, y: spot[1], face: -1 }); const [b] = BK.spawnFoe({ t: 'sprig', x: spot[0] + 9, y: spot[1], face: -1 });
      if (!a || !b) return { err: 'no sprigs' }; for (const e of [a, b]) { e.hp = e.maxHp = 500; e.frozen = 9; e.stagger = 9; }
      const ha = a.hp, hb = b.hp; for (let k = 0; k < 90; k++) { a.x = (spot[0] + 1) * 16 + 8; b.x = (spot[0] + 9) * 16 + 8; a.stagger = b.stagger = 9; BK.P.hp = BK.P.maxHp; BK.sim(1); }
      out.burn = { inside: ha - a.hp, outside: hb - b.hp }; }
    /* 4. HE HITS HARDER IN IT: one swing on a still foe, out of the circle and in it */
    const swingOn = inC => { home(); if (inC) tap(); else BK.sim(25);
      const [f] = BK.spawnFoe({ t: 'sprig', x: Math.floor(BK.P.x / 16) + 1, y: spot[1], face: -1 }); f.hp = f.maxHp = 900; const h0 = f.hp, b0 = H().stats.burnDmg;
      f.x = BK.P.x + 18; f.stagger = 9; BK.sim(1); none(); BK.press('atk'); for (let k = 0; k < 40; k++) { f.x = BK.P.x + 18; f.stagger = 9; BK.sim(1); } return h0 - f.hp - (H().stats.burnDmg - b0); };
    out.swing = { out: swingOn(false), in: swingOn(true) };
    /* 5. EMPOWER, then JUDGEMENT, spend the Light */
    home(); tap(); { const P = BK.P; P.light = 50; BK.sim(80); const r0 = H().circles[0].r, l0 = H().circles[0].life; tap(); const c = H().circles[0];
      out.empower = { light: Math.round(P.light), emp: c.emp, r: c.r, r0, life: c.life, l0, n: H().circles.length };
      P.light = 100; BK.sim(2); tap({ after: 4 }); out.judge = { light: Math.round(P.light), blast: P.blastT > 0 }; }
    /* 6. THE HAMMER THROW: UP + C, a quarter of the light; with too little nothing goes */
    home(); { const P = BK.P, [f] = BK.spawnFoe({ t: 'sprig', x: spot[0] + 5, y: spot[1], face: -1 }); f.hp = f.maxHp = 900; const h0 = f.hp;
      P.light = 30; tap({ up: true, after: 2 }); const lAfter = P.light; for (let k = 0; k < 90; k++) { f.x = (spot[0] + 5) * 16 + 8; f.stagger = 9; BK.sim(1); }
      out.throw = { light: Math.round(lAfter), dmg: h0 - f.hp, aegis: false };
      P.light = 10; f.hp = 900; none(); K.up = true; K.block = true; BK.sim(30); out.throw.aegisAfter = !!P.aegis; K.block = false; K.up = false; BK.sim(4); out.throw.poor = Math.round(P.light); out.throw.circles = H().circles.length; }
    /* 7. SMITE: the held overhead in the circle spends HG.smite.cost; out of it nothing */
    const heavy = () => { none(); BK.press('atk'); K.atk = true; BK.sim(50); K.atk = false; BK.sim(30); };
    home(); tap(); BK.P.light = 40; BK.sim(60); heavy(); out.smiteIn = Math.round(BK.P.light);
    home(); BK.P.light = 40; heavy(); out.smiteOut = Math.round(BK.P.light);
    /* 8. ITS LIFE */
    home(); tap(); BK.sim(Math.round((HG.life - 0.5) * 60)); out.lifeAlive = H().circles.length; BK.sim(60); out.lifeGone = H().circles.length;
    /* 9. CO-OP: THE AEGIS COVERS A PARTNER IN HIS CIRCLE */
    home(); tap(); BK.coopStart('knight', false); BK.sim(2); { const [a, b] = BK.players(); const place = dx => { b.x = a.x + dx; b.y = a.y; b.vx = 0; b.hurt = 0; b.inv = 0; b.hp = b.maxHp; b.ground = true; };
      const hit = (o = {}) => { const hp0 = b.hp, st0 = a.st, r = BK.holyHurt(b, b.x + 30, 12, o); return { r, lost: hp0 - b.hp, paid: st0 - a.st }; };
      none(); K.block = true; BK.sim(30); out.coop = { aegis: !!a.aegis };
      place(24); out.coop.inside = hit(); BK.sim(30);
      place(24); out.coop.red = hit({ unblockable: true }); BK.sim(30);
      a.st = a.maxSt; place(140); out.coop.outside = hit(); BK.sim(30);
      K.block = false; BK.sim(30); a.st = a.maxSt; place(24); out.coop.down = hit(); BK.coopEnd(); }
    none(); return out; })()`, 120000);
} catch (e) { console.log('FAIL the page: ' + e.message); pg.close(); process.exit(1); }
pg.close();
if (R.err) { console.log('FAIL ' + R.err); process.exit(1); }
const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
ok(R.plant.n === 1 && R.plant.dx < 4 && R.plant.r >= HG.r && R.plant.stPaid, 'a tap of C plants one circle at his feet for ' + HG.st + ' wind: ' + JSON.stringify(R.plant));
ok(R.waitN === 1, 'a tap inside the replant wait is not a second circle: ' + R.waitN);
ok(R.moved.n === 1 && Math.abs(R.moved.x - R.moved.want) < 4, 'a tap after the wait moves the ONE circle to his feet: ' + JSON.stringify(R.moved));
ok(R.mendIn > 1.5 && R.mendOut < 0.5, 'his circle mends him slowly, and only in it: in +' + R.mendIn.toFixed(2) + ', out +' + R.mendOut.toFixed(2));
ok(R.burn.inside >= 8 && R.burn.outside === 0, 'a foe in the circle burns, one outside does not: ' + JSON.stringify(R.burn));
ok(R.swing.in > 0 && R.swing.out > 0 && R.swing.in >= Math.floor(R.swing.out * HG.hitMul), 'his maul lands harder in his circle (x' + HG.hitMul + '): ' + JSON.stringify(R.swing));
ok(R.empower.emp && R.empower.light === 50 - HG.empower.cost && R.empower.r > R.empower.r0 && R.empower.n === 1, 'a tap in the circle with ' + HG.empower.cost + ' Light EMPOWERS it and spends the Light: ' + JSON.stringify(R.empower));
ok(R.judge.light === 0 && R.judge.blast, 'a full bar and a tap in the circle is JUDGEMENT: ' + JSON.stringify(R.judge));
ok(R.throw.light === 30 - HG.throw.cost && R.throw.dmg > 0, 'UP + C is the HAMMER THROW: ' + HG.throw.cost + ' Light spent and a foe ahead struck: ' + JSON.stringify(R.throw));
ok(R.throw.poor === 10 && !R.throw.aegisAfter && R.throw.circles === 0, 'UP + C with too little Light throws nothing, spends nothing, and the hold is not an aegis or a circle: ' + JSON.stringify(R.throw));
ok(R.smiteIn === 40 - HG.smite.cost && R.smiteOut === 40, 'the held overhead in the circle SMITES (' + HG.smite.cost + ' Light) and out of it spends none: in ' + R.smiteIn + ', out ' + R.smiteOut);
ok(R.lifeAlive === 1 && R.lifeGone === 0, 'the circle stands its ' + HG.life + ' s and then goes out: ' + R.lifeAlive + ' / ' + R.lifeGone);
ok(R.coop.aegis, 'the paladin raised the aegis for the co-op test');
ok(R.coop.inside.r === 'blocked' && R.coop.inside.lost === 0 && R.coop.inside.paid >= HG.cover.st - 1, 'a partner in his circle under his aegis is covered, the paladin paying the wind: ' + JSON.stringify(R.coop.inside));
ok(R.coop.red.r !== 'blocked' && R.coop.red.lost > 0, 'a RED blow is never covered: ' + JSON.stringify(R.coop.red));
ok(R.coop.outside.r !== 'blocked' && R.coop.outside.lost > 0, 'a partner outside his circle is not covered: ' + JSON.stringify(R.coop.outside));
ok(R.coop.down.r !== 'blocked' && R.coop.down.lost > 0, 'with the aegis down nothing is covered: ' + JSON.stringify(R.coop.down));
if (process.env.PK_VERBOSE) console.log(JSON.stringify(R, null, 1));
if (fails.length) { console.log('paladin-kit: ' + fails.length + ' FAIL\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('paladin-kit: ok - one circle, its mend and burn, x' + HG.hitMul + ' in it, empower/judgement/throw/smite spend Light, the aegis covers a partner (swing out ' + R.swing.out + ' / in ' + R.swing.in + ', burn ' + R.burn.inside + ')');
