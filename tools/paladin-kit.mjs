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
//   PALADIN 4 (claude/paladin4, Daniel 10-15 - the DESIGN CHANGES are stated, nothing weakened):
//   - EVERY PIP COUNTS: 1 = SMITE, 2 = TWIN SMITE (strikes twice), 3 = RADIANCE, 4 = RADIANCE+ (bigger, mends him), 5 = SUNFALL - each tap spends its own cost
//     (Paladin 3's '2 pips smite one, 4 pips radiance three' is replaced)
//   - THE LIGHT-WARD: a block is +1 pip every SECOND block (was every block), costs no wind a blow (a steady drain while held instead), turns a blow from BEHIND,
//     a PIERCING blow goes through, a blow with too little wind left or a big one BREAKS it (winded, half lands)
//   - SANCTUARY STEP: the dodge is a short step (HG.step.t) that leaves a patch of holy light where he stood; a foe in it is slowed
//   - PRAYER: kneeling ANYWHERE pays a pip (HG.pray.every s after HG.pray.settle)
//   - DAWNFALL: the plunge on a foe strikes a foe beside it (the pillar), +1 pip, the aura lit
//   - VERDICT scales: 3+ pips mark faster and leave patches, 5 pips JUDGED breaks a raised guard; it never spends
//   - SPEAR OF LIGHT: a wind-up (no hit in it), then a thrown spear that strikes the FIRST foe only
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
    const H = () => BK.holy(), aura = () => H().circles.find(c => (c.owner === 1 || c.owner === null) && !c.out && !c.patch) || null, patches = () => H().circles.filter(c => c.patch);
    const home = (dx = 0) => { clear(); none(); BK.holyHands().clear(); BK.god = true; BK.tp(spot[0], spot[1]); BK.sim(40); BK.god = false; const P = BK.P; P.x += dx; P.hp = P.maxHp; P.st = P.maxSt; P.vx = 0; P.hurt = 0; P.face = 1; P.light = 0; P.inv = 0; P.verdict = []; BK.sim(20); };
    const tap = (o = {}) => { none(); if (o.up) K.up = true; K.block = true; BK.sim(3); K.block = false; BK.sim(2); K.up = false; BK.sim(o.after ?? 20); };
    const foe = (dx, o = {}) => { const [f] = BK.spawnFoe({ t: o.t || 'sprig', x: spot[0] + dx, y: spot[1] - (o.up || 0), face: -1 }); f.hp = f.maxHp = o.hp || 900; f.stagger = 9; f.cd = 99; return f; };
    const hold = (f, dx) => { f.x = (spot[0] + dx) * 16 + 8; f.stagger = 9; };
    const out = {};
    /* 1. NO CONVICTION: a tap spends nothing and lights nothing */
    home(); tap(); out.none = { light: BK.P.light, aura: !!aura() };
    /* 2. SMITE (1 pip): one spent, the foe in front struck, the aura lit */
    home(); { const f = foe(1); BK.P.light = 1 * HG.conv.pip; const h0 = f.hp; tap({ after: 10 }); out.smite = { light: Math.round(BK.P.light), dmg: h0 - f.hp, aura: !!aura(), life: aura() && +aura().life.toFixed(2) }; }
    /* 3. THE AURA TRAVELS WITH HIM, mends him, burns a foe in it, goes out after its life */
    home(); { const P = BK.P; P.light = HG.conv.pip; tap({ after: 2 }); const c = aura(); const x0 = c && c.x; P.x += 60; BK.sim(4); out.follow = { x0: Math.round(x0), x1: Math.round(aura() && aura().x), want: Math.round(P.x) };
      P.hp = 40; BK.sim(60); out.mend = +(P.hp - 40).toFixed(2); const f = foe(0); hold(f, Math.round(P.x / 16) - spot[0]); const fh = f.hp; for (let k = 0; k < 40; k++) { f.x = P.x + 6; f.stagger = 9; P.hp = P.maxHp; BK.sim(1); } out.burn = fh - f.hp;
      BK.sim(Math.round((HG.aura.base + HG.aura.perPip) * 60)); out.goneAfter = !aura(); }
    /* 4. RADIANCE (3 pips) */
    home(); { const f = foe(2); BK.P.light = 3 * HG.conv.pip; const h0 = f.hp; tap({ after: 10 }); out.radiance = { light: Math.round(BK.P.light), dmg: h0 - f.hp, life: aura() && +aura().life.toFixed(2) }; }
    /* 5. SUNFALL (5 pips) */
    home(); { const f = foe(3); BK.P.light = 100; const h0 = f.hp; tap({ after: 4 }); out.sunfall = { light: Math.round(BK.P.light), blast: BK.P.blastT > 0, dmg: 0 }; BK.sim(30); out.sunfall.dmg = h0 - f.hp; }
    /* 6. THE HAMMER THROW (UP + C, 3 pips); with 2 nothing */
    home(); { const P = BK.P, f = foe(5); const h0 = f.hp; P.light = 3 * HG.conv.pip; tap({ up: true, after: 2 }); const lAfter = P.light; for (let k = 0; k < 90; k++) { hold(f, 5); BK.sim(1); }
      out.throw = { light: Math.round(lAfter), dmg: h0 - f.hp }; P.light = 2 * HG.conv.pip; tap({ up: true, after: 4 }); out.throw.poor = Math.round(P.light); }
    /* 7. THE GUARD: a blow on the aegis +1 pip; raised on the beat +2 and a holy flash */
    home(); { const P = BK.P, f = foe(2); hold(f, 2); none(); K.block = true; BK.sim(40); P.wardBlocks = 0; const l0 = P.light, st0 = P.st; const r = BK.holyHurt(P, f.x, 10, {}); const paid = st0 - P.st, g1 = Math.round(P.light - l0); BK.sim(2); const r2 = BK.holyHurt(P, f.x, 10, {});
      out.block = { r, r2, gain1: g1, gain: Math.round(P.light - l0), paid: +paid.toFixed(2), aegis: !!P.aegis }; P.st = P.maxSt; const rb = BK.holyHurt(P, P.x - 30, 10, {}); out.block.behind = rb; P.st = P.maxSt; out.block.pierce = BK.holyHurt(P, f.x, 10, { pierce: true }); K.block = false; BK.sim(30); }
    /* (PALADIN 4) THE LIGHT-WARD's wind: a steady drain while held; a blow with too little wind left, or a big one, BREAKS it */
    home(); { const P = BK.P, f = foe(2); hold(f, 2); none(); K.block = true; BK.sim(20); const st0 = P.st; BK.sim(30); out.drain = +(st0 - P.st).toFixed(1); P.st = 3; P.inv = 0; P.hurt = 0; const rw = BK.holyHurt(P, f.x, 12, {}); out.breakLow = { r: rw, winded: !!P.winded }; K.block = false; BK.sim(90); }
    home(); { const P = BK.P, f = foe(2); hold(f, 2); none(); K.block = true; BK.sim(30); P.st = P.maxSt; const rw = BK.holyHurt(P, f.x, Math.ceil(P.maxHp * 0.4), {}); out.breakBig = { r: rw, winded: !!P.winded }; K.block = false; BK.sim(90); }
    /* (PALADIN 4) TWIN SMITE (2) and RADIANCE+ (4) */
    home(); { const f = foe(1); BK.P.light = 2 * HG.conv.pip; let h = f.hp, hits = 0; none(); K.block = true; BK.sim(3); K.block = false; for (let k = 0; k < 40; k++) { hold(f, 1); BK.sim(1); if (f.hp < h) { hits++; h = f.hp; } } out.twin = { light: Math.round(BK.P.light), hits }; }
    home(); { const P = BK.P, f = foe(3); P.light = 4 * HG.conv.pip; P.hp = 50; const h0 = f.hp; tap({ after: 6 }); out.radPlus = { light: Math.round(P.light), dmg: h0 - f.hp, mend: Math.round(P.hp - 50) }; }
    /* (PALADIN 4) SANCTUARY STEP: a short step, a patch where he stood, a foe in it slowed */
    home(); { const P = BK.P, x0 = P.x; none(); K.right = true; BK.press('dodge'); BK.sim(2); out.step = { len: +(P.dodgeMax || 0).toFixed(2), step: !!P.sStep, inv: +(P.dodgeInv || 0).toFixed(2) }; K.right = false; BK.sim(4);
      const pt = patches()[0]; out.step.patch = !!pt; out.step.patchAt = pt ? Math.round(pt.x - x0) : null; const s0 = H().stats.slowed || 0; if (pt) { const f = foe(0); f.x = pt.x; f.y = pt.y; f.stagger = 0; BK.sim(4); } out.step.slowed = (H().stats.slowed || 0) - s0; BK.sim(150); out.step.gone = !patches().length; }
    /* (PALADIN 4) PRAYER: kneeling anywhere pays a pip */
    home(); { const P = BK.P; P.light = 0; none(); K.down = true; BK.sim(Math.round((HG.pray.settle + HG.pray.every) * 60) + 30); out.pray = { light: Math.round(P.light), holy: !!(BK.crouchB() || {}).holyPray }; K.down = false; BK.sim(10); }
    /* (PALADIN 4) DAWNFALL: onto a foe - the pillar strikes the one beside it, +1 pip, the aura lit */
    home(); { const P = BK.P, a = foe(3), b = foe(4); P.light = 0; const hb = b.hp; BK.sim(2); hold(a, 3); hold(b, 4); P.x = a.x; P.y = a.y - (a.h || 16) - 40; P.vx = 0; P.vy = 40; P.ground = false; none(); K.down = true; BK.press('atk');
      let land = false; for (let k = 0; k < 120 && !land; k++) { hold(b, 4); a.x = (spot[0] + 3) * 16 + 8; BK.sim(1); land = (P.dawnN || 0) > 0; } K.down = false; BK.sim(4); out.dawn = { landed: land, side: hb - b.hp, light: Math.round(P.light), aura: !!aura(), life: aura() && +aura().life.toFixed(2) }; BK.sim(60); }
    /* (PALADIN 4) VERDICT SCALES: at 3 pips a sigil faster, patches under the struck, never spends; at 5 JUDGED breaks a raised guard */
    home(); { const fs = [foe(3), foe(5), foe(6)]; BK.P.light = 3 * HG.conv.pip; none(); BK.press('atk'); K.atk = true; let n60 = 0; for (let k = 0; k < 70; k++) { fs.forEach((f, i) => hold(f, [3, 5, 6][i])); BK.sim(1); if (k === 50) n60 = (BK.P.verdict || []).length; }
      K.atk = false; BK.sim(3); out.v3 = { n60, light: Math.round(BK.P.light), patches: patches().length }; BK.sim(150); }
    home(); { const fs = [foe(3), foe(5), foe(6)]; none(); BK.press('atk'); K.atk = true; let n60 = 0; for (let k = 0; k < 70; k++) { fs.forEach((f, i) => hold(f, [3, 5, 6][i])); BK.sim(1); if (k === 50) n60 = (BK.P.verdict || []).length; } K.atk = false; BK.sim(3); out.v0 = { n60, patches: patches().length }; BK.sim(30); }
    home(); { const f = foe(3), el = foe(5); delete f.maxHp; delete el.maxHp; el.elite = true;   /* (a COMMON foe and an elite: maxHp marks a boss) */ BK.P.light = 100; none(); BK.press('atk'); K.atk = true; let mk = 0; for (let k = 0; k < 60; k++) { hold(f, 3); hold(el, 5); f.rxGuard = 5; el.stagger = 0; BK.sim(1); if (k === 50) mk = (BK.P.verdict || []).length; }
      el.stagger = 0; K.atk = false; BK.sim(2); out.judged = { mk, alive: f.alive, broken: +(f.broken || 0).toFixed(2), guard: f.rxGuard || 0, light: Math.round(BK.P.light), elite: +(el.stagger || 0).toFixed(2) }; BK.sim(30); }
    /* (PALADIN 4, Daniel 10-15 ~20:45) SPEAR OF LIGHT: a wind-up (nothing struck), then the spear thrown - the FIRST foe struck, the one behind it not */
    { BKT.PROG.skillOwned.paladin = { ...(BKT.PROG.skillOwned.paladin || {}), lightLance: true }; BKT.PROG.loadouts.paladin = ['lightLance']; BK.applyUpgrades(); }
    home(); { const P = BK.P, a = foe(4), b = foe(7); const ha = a.hp, hb = b.hp; P.cds = {}; none(); BK.press('throw'); let first = -1, wind = 0;
      for (let k = 0; k < 90; k++) { hold(a, 4); hold(b, 7); BK.sim(1); if (k === 10) wind = +(P.lanceWind || 0).toFixed(2); if (first < 0 && a.hp < ha) first = k; }
      out.spear = { wind, first, dmgA: ha - a.hp, dmgB: hb - b.hp, cd: +((P.cds || {}).lightLance || 0).toFixed(1) }; }
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
ok(R.smite.light === 0 && R.smite.dmg > 0 && R.smite.aura && R.smite.life > HG.aura.base, 'one pip: a tap is SMITE - one pip spent, the foe in front struck, the aura lit: ' + JSON.stringify(R.smite));
ok(Math.abs(R.follow.x1 - R.follow.want) < 3 && Math.abs(R.follow.x1 - R.follow.x0) > 40, 'the HALLOWED AURA travels with him: ' + JSON.stringify(R.follow));
ok(R.mend > 0.1 && R.burn > 0, 'his aura mends him and burns a foe in it: mend +' + R.mend + ', burn ' + R.burn);
ok(R.goneAfter, 'the aura goes out after its life (' + HG.aura.base + ' + ' + HG.aura.perPip + ' a pip)');
ok(R.radiance.light === 0 && R.radiance.dmg > 0 && R.radiance.life >= HG.aura.base + 3 * HG.aura.perPip - 0.3, 'three pips: a tap is RADIANCE - three spent, the foe beside him struck, a longer aura: ' + JSON.stringify(R.radiance));
ok(R.sunfall.light === 0 && R.sunfall.blast && R.sunfall.dmg > 0, 'five pips: a tap is SUNFALL - all spent, the blast, the foe struck: ' + JSON.stringify(R.sunfall));
ok(R.throw.light === 0 && R.throw.dmg > 0 && R.throw.poor === 2 * pip, 'UP + C: three pips throw the hammer (a foe ahead struck), two throw nothing: ' + JSON.stringify(R.throw));
ok(R.block.r === 'blocked' && R.block.r2 === 'blocked' && R.block.gain1 === 0 && R.block.gain === pip, 'THE LIGHT-WARD: +1 pip every SECOND block: ' + JSON.stringify(R.block));
ok(R.block.paid < 1, 'THE LIGHT-WARD: a block costs no wind of its own (the drain is per second): ' + JSON.stringify(R.block));
ok(R.block.behind === 'blocked', 'THE LIGHT-WARD turns a blow from BEHIND (all round): ' + JSON.stringify(R.block));
ok(R.block.pierce !== 'blocked', 'THE LIGHT-WARD: a PIERCING blow goes through: ' + JSON.stringify(R.block));
ok(R.drain >= 0.3 * HG.ward.drain, 'THE LIGHT-WARD costs a steady wind a second while held (' + HG.ward.drain + '/s): lost ' + R.drain + ' in 0.5 s');
ok(R.breakLow.r !== 'blocked' && R.breakLow.winded, 'THE LIGHT-WARD BREAKS with too little wind left (winded, half lands): ' + JSON.stringify(R.breakLow));
ok(R.breakBig.r !== 'blocked' && R.breakBig.winded, 'THE LIGHT-WARD BREAKS under a big blow even with a full bar: ' + JSON.stringify(R.breakBig));
ok(R.twin.light === 0 && R.twin.hits >= 2, 'two pips: a tap is TWIN SMITE - both spent, the foe struck twice: ' + JSON.stringify(R.twin));
ok(R.radPlus.light === 0 && R.radPlus.dmg > 0 && R.radPlus.mend >= 1, 'four pips: a tap is RADIANCE+ - four spent, the foe struck, he mends: ' + JSON.stringify(R.radPlus));
ok(Math.abs(R.step.len - HG.step.t) < 0.02 && R.step.step && R.step.patch && Math.abs(R.step.patchAt) <= 4 && R.step.slowed > 0 && R.step.gone, 'SANCTUARY STEP: a short step, a patch of holy light where he stood that slows a foe in it and goes out: ' + JSON.stringify(R.step));
ok(R.pray.light >= pip, 'PRAYER: kneeling anywhere pays a pip in ' + (HG.pray.settle + HG.pray.every) + ' s: ' + JSON.stringify(R.pray));
ok(R.dawn.landed && R.dawn.side > 0 && R.dawn.light >= pip && R.dawn.aura, 'DAWNFALL: the pillar strikes the foe beside, +1 pip, the aura lit: ' + JSON.stringify(R.dawn));
ok(R.v3.n60 > R.v0.n60 && R.v3.light === 3 * pip && R.v3.patches >= 1 && R.v0.patches === 0, 'VERDICT SCALES: at 3 pips a sigil faster and a patch under the struck, nothing spent: ' + JSON.stringify([R.v3, R.v0]));
ok(R.judged.broken > 0 && !(R.judged.guard > 0) && R.judged.light === 100 && R.judged.elite >= 0.5, 'VERDICT JUDGED (5 pips): a raised guard broken, an elite staggered, nothing spent: ' + JSON.stringify(R.judged));
ok(R.spear.wind > 0 && R.spear.first >= Math.round(HG.lance.wind * 60) - 2 && R.spear.dmgA > 0 && R.spear.dmgB === 0, 'SPEAR OF LIGHT: a wind-up, then the spear strikes the FIRST foe only: ' + JSON.stringify(R.spear));
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
console.log('paladin-kit: ok - Conviction tiers (smite / twin smite / radiance / radiance+ / sunfall / throw), the light-ward (2 blocks a pip, drain, all round, pierce, break), sanctuary step, prayer, dawnfall, verdict scaling + judged, the spear of light; the aura travels, mends and burns, the guard pays pips + the holy flash, bulwark, verdict x' + R.verdict.marked + ', heaven\'s arc x' + R.arc.hits + ', the partner aegis');
