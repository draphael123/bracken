// tools/paladin-kit.mjs — PALADIN 3: CONVICTION (claude/paladin3, scratch/brief-paladin3-1014.md; was PALADIN 2's holy-ground check, rewritten:
// the planted circle is gone). On flat Stockade floor, with the real keys, this fails when:
//   - CONVICTION is not five pips of the Light store (HG.conv.pip each), or a tap of C with none spends anything
//   - a tap of C does not spend BY TIER: 1-2 pips = SMITE (one pip, a foe in front struck), 3-4 = RADIANCE (three, a foe beside him struck),
//     5 = SUNFALL (all of it, the old Judgement's blast); UP + C with 3 is not the HAMMER THROW (three spent, a foe ahead struck), with 2 throws nothing
//   - a spend does not light the HALLOWED AURA, or the aura stays where it was lit instead of TRAVELLING WITH HIM, or it does not mend him / burn
//     a foe in it, or it stands past its life (base + perPip a pip)
//   - THE GUARD: a blow on the aegis is not +1 pip, a blow on the aegis raised ON THE BEAT (a perfect guard) is not +2 and a holy flash that
//     staggers the attacker
//   - BULWARK ADVANCE: the aegis held and pressing ahead does not walk him forward slowly and shove a common foe back (a boss is never moved)
//   - VERDICT (hold X): no sigil on each of the foes ahead, one a beat, up to four - or the release swings the hammer, or does not strike them all
//   - HEAVEN'S ARC (up + X in the air): not two hits on a foe over him
//   - CO-OP: a partner in his AURA while he holds the aegis is not covered (the paladin paying the wind), or a RED blow is
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
    const H = () => BK.holy(), aura = () => H().circles.find(c => (c.owner === 1 || c.owner === null) && !c.out) || null;
    const home = (dx = 0) => { clear(); none(); BK.holyHands().clear(); BK.god = true; BK.tp(spot[0], spot[1]); BK.sim(40); BK.god = false; const P = BK.P; P.x += dx; P.hp = P.maxHp; P.st = P.maxSt; P.vx = 0; P.hurt = 0; P.face = 1; P.light = 0; P.inv = 0; P.verdict = []; BK.sim(20); };
    const tap = (o = {}) => { none(); if (o.up) K.up = true; K.block = true; BK.sim(3); K.block = false; BK.sim(2); K.up = false; BK.sim(o.after ?? 20); };
    const foe = (dx, o = {}) => { const [f] = BK.spawnFoe({ t: o.t || 'sprig', x: spot[0] + dx, y: spot[1] - (o.up || 0), face: -1 }); f.hp = f.maxHp = o.hp || 900; f.stagger = 9; f.cd = 99; return f; };
    const hold = (f, dx) => { f.x = (spot[0] + dx) * 16 + 8; f.stagger = 9; };
    const out = {};
    /* 1. NO CONVICTION: a tap spends nothing and lights nothing */
    home(); tap(); out.none = { light: BK.P.light, aura: !!aura() };
    /* 2. SMITE (1 pip): one spent, the foe in front struck, the aura lit */
    home(); { const f = foe(1); BK.P.light = 2 * HG.conv.pip; const h0 = f.hp; tap({ after: 10 }); out.smite = { light: Math.round(BK.P.light), dmg: h0 - f.hp, aura: !!aura(), life: aura() && +aura().life.toFixed(2) }; }
    /* 3. THE AURA TRAVELS WITH HIM, mends him, burns a foe in it, goes out after its life */
    home(); { const P = BK.P; P.light = HG.conv.pip; tap({ after: 2 }); const c = aura(); const x0 = c && c.x; P.x += 60; BK.sim(4); out.follow = { x0: Math.round(x0), x1: Math.round(aura() && aura().x), want: Math.round(P.x) };
      P.hp = 40; BK.sim(60); out.mend = +(P.hp - 40).toFixed(2); const f = foe(0); hold(f, Math.round(P.x / 16) - spot[0]); const fh = f.hp; for (let k = 0; k < 40; k++) { f.x = P.x + 6; f.stagger = 9; P.hp = P.maxHp; BK.sim(1); } out.burn = fh - f.hp;
      BK.sim(Math.round((HG.aura.base + HG.aura.perPip) * 60)); out.goneAfter = !aura(); }
    /* 4. RADIANCE (3 pips) */
    home(); { const f = foe(2); BK.P.light = 4 * HG.conv.pip; const h0 = f.hp; tap({ after: 10 }); out.radiance = { light: Math.round(BK.P.light), dmg: h0 - f.hp, life: aura() && +aura().life.toFixed(2) }; }
    /* 5. SUNFALL (5 pips) */
    home(); { const f = foe(3); BK.P.light = 100; const h0 = f.hp; tap({ after: 4 }); out.sunfall = { light: Math.round(BK.P.light), blast: BK.P.blastT > 0, dmg: 0 }; BK.sim(30); out.sunfall.dmg = h0 - f.hp; }
    /* 6. THE HAMMER THROW (UP + C, 3 pips); with 2 nothing */
    home(); { const P = BK.P, f = foe(5); const h0 = f.hp; P.light = 3 * HG.conv.pip; tap({ up: true, after: 2 }); const lAfter = P.light; for (let k = 0; k < 90; k++) { hold(f, 5); BK.sim(1); }
      out.throw = { light: Math.round(lAfter), dmg: h0 - f.hp }; P.light = 2 * HG.conv.pip; tap({ up: true, after: 4 }); out.throw.poor = Math.round(P.light); }
    /* 7. THE GUARD: a blow on the aegis +1 pip; raised on the beat +2 and a holy flash */
    home(); { const P = BK.P, f = foe(2); hold(f, 2); none(); K.block = true; BK.sim(40); const l0 = P.light; const r = BK.holyHurt(P, f.x, 10, {}); out.block = { r, gain: Math.round(P.light - l0), aegis: !!P.aegis }; K.block = false; BK.sim(30); }
    home(); { const P = BK.P, f = foe(2); hold(f, 2); f.stagger = 0; none(); K.block = true; for (let k = 0; k < 30 && !P.aegis; k++) BK.sim(1); BK.sim(1); const l1 = P.light; const r2 = BK.holyHurt(P, f.x, 10, {}); out.perfect = { r: r2, gain: Math.round(P.light - l1), stagger: +(f.stagger || 0).toFixed(2) }; K.block = false; BK.sim(30); }
    /* 8. BULWARK ADVANCE */
    home(); { const P = BK.P, f = foe(2); delete f.maxHp; f.stagger = 0; none(); K.block = true; BK.sim(30);   /* (a COMMON foe: maxHp marks a boss, which the bulwark never moves) */ const x0 = P.x, fx0 = f.x; K.right = true; BK.sim(50); out.bulwark = { walked: Math.round(P.x - x0), aegis: !!P.aegis, shoved: Math.round(f.x - fx0), speed: Math.round(Math.abs(P.vx)) }; none(); BK.sim(20); }
    /* 9. VERDICT: hold X before three foes - three sigils, one a beat; the release strikes them all, no hammer swing */
    home(); { const fs = [foe(3), foe(5), foe(6)]; none(); BK.press('atk'); K.atk = true; let n1 = 0; for (let k = 0; k < 120; k++) { fs.forEach((f, i) => hold(f, [3, 5, 6][i])); BK.sim(1); if (k === 30) n1 = (BK.P.verdict || []).length; }
      const marked = (BK.P.verdict || []).length, h0 = fs.map(f => f.hp); K.atk = false; BK.sim(2); const swung = BK.P.atk >= 0; BK.sim(20);
      out.verdict = { early: n1, marked, struck: fs.filter((f, i) => f.hp < h0[i]).length, swung }; }
    /* 10. HEAVEN'S ARC: up + X in the air over a foe - two hits */
    home(); { const P = BK.P, f = foe(0, { up: 2 }); f.noGrav = true; f.fly = true; none(); K.jump = true; BK.press('jump'); BK.sim(16); K.jump = false;   /* (past the jump's first 0.18 s: up + X there is still the rising cut) */ let hits = 0, h = f.hp;
      K.up = true; BK.press('atk'); for (let k = 0; k < 24; k++) { f.x = P.x + P.face * 4; f.y = P.y - 26; f.vy = 0; f.stagger = 9; BK.sim(1); if (f.hp < h) { hits++; h = f.hp; } } K.up = false; BK.sim(30); out.arc = { hits, kind: P.swingKind }; }
    /* 11. CO-OP: THE AEGIS COVERS A PARTNER IN HIS AURA */
    home(); BK.P.light = HG.conv.pip; tap({ after: 2 }); BK.coopStart('knight', false); BK.sim(2); { const [a, b] = BK.players(); const place = dx => { b.x = a.x + dx; b.y = a.y; b.vx = 0; b.hurt = 0; b.inv = 0; b.hp = b.maxHp; b.ground = true; };
      const hit = (o = {}) => { const hp0 = b.hp, st0 = a.st, r = BK.holyHurt(b, b.x + 30, 12, o); return { r, lost: hp0 - b.hp, paid: st0 - a.st }; };
      none(); K.block = true; BK.sim(20); out.coop = { aegis: !!a.aegis, aura: !!aura() };
      place(20); out.coop.inside = hit(); BK.sim(20);
      place(20); out.coop.red = hit({ unblockable: true }); BK.coopEnd(); }
    none(); return out; })()`, 120000);
} catch (e) { console.log('FAIL the page: ' + e.message); pg.close(); process.exit(1); }
const errs = pg.errors.slice(); pg.close();
if (R.err) { console.log('FAIL ' + R.err); process.exit(1); }
const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
const pip = HG.conv.pip;
ok(R.none.light === 0 && !R.none.aura, 'a tap with no Conviction spends nothing and lights no aura: ' + JSON.stringify(R.none));
ok(R.smite.light === pip && R.smite.dmg > 0 && R.smite.aura && R.smite.life > HG.aura.base, 'two pips: a tap is SMITE - one pip spent, the foe in front struck, the aura lit: ' + JSON.stringify(R.smite));
ok(Math.abs(R.follow.x1 - R.follow.want) < 3 && Math.abs(R.follow.x1 - R.follow.x0) > 40, 'the HALLOWED AURA travels with him: ' + JSON.stringify(R.follow));
ok(R.mend > 0.5 && R.burn > 0, 'his aura mends him and burns a foe in it: mend +' + R.mend + ', burn ' + R.burn);
ok(R.goneAfter, 'the aura goes out after its life (' + HG.aura.base + ' + ' + HG.aura.perPip + ' a pip)');
ok(R.radiance.light === pip && R.radiance.dmg > 0 && R.radiance.life >= HG.aura.base + 3 * HG.aura.perPip - 0.3, 'four pips: a tap is RADIANCE - three spent, the foe beside him struck, a longer aura: ' + JSON.stringify(R.radiance));
ok(R.sunfall.light === 0 && R.sunfall.blast && R.sunfall.dmg > 0, 'five pips: a tap is SUNFALL - all spent, the blast, the foe struck: ' + JSON.stringify(R.sunfall));
ok(R.throw.light === 0 && R.throw.dmg > 0 && R.throw.poor === 2 * pip, 'UP + C: three pips throw the hammer (a foe ahead struck), two throw nothing: ' + JSON.stringify(R.throw));
ok(R.block.r === 'blocked' && R.block.gain === pip, 'a blow on the aegis is +1 pip: ' + JSON.stringify(R.block));
ok(R.perfect.r === 'blocked' && R.perfect.gain === 2 * pip && R.perfect.stagger >= HG.flash.stagger - 0.05, 'a PERFECT GUARD is +2 pips and a holy flash that staggers the attacker: ' + JSON.stringify(R.perfect));
ok(R.bulwark.aegis && R.bulwark.walked > 8 && R.bulwark.speed <= 30 && R.bulwark.shoved > 12, 'BULWARK ADVANCE: behind the aegis he walks slowly forward and shoves the foe back: ' + JSON.stringify(R.bulwark));
ok(R.verdict.early >= 1 && R.verdict.early < 3 && R.verdict.marked === 3 && R.verdict.struck === 3 && !R.verdict.swung, 'VERDICT: a sigil a beat on the foes ahead (3), the release strikes all three, no hammer swing: ' + JSON.stringify(R.verdict));
ok(R.arc.hits >= 2, "HEAVEN'S ARC: up + X in the air hits a foe over him twice: " + JSON.stringify(R.arc));
ok(R.coop.aegis && R.coop.aura, 'the paladin raised the aegis in his aura for the co-op test: ' + JSON.stringify(R.coop));
ok(R.coop.inside.r === 'blocked' && R.coop.inside.lost === 0 && R.coop.inside.paid >= HG.cover.st - 1, 'a partner in his aura under his aegis is covered, the paladin paying the wind: ' + JSON.stringify(R.coop.inside));
ok(R.coop.red.r !== 'blocked' && R.coop.red.lost > 0, 'a RED blow is never covered: ' + JSON.stringify(R.coop.red));
ok(!errs.length, 'the page threw: ' + errs.join(' | '));
if (process.env.PK_VERBOSE) console.log(JSON.stringify(R, null, 1));
if (fails.length) { console.log('paladin-kit: ' + fails.length + ' FAIL\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('paladin-kit: ok - Conviction tiers (smite / radiance / sunfall / throw), the aura travels, mends and burns, the guard pays pips + the holy flash, bulwark, verdict x' + R.verdict.marked + ', heaven\'s arc x' + R.arc.hits + ', the partner aegis');
