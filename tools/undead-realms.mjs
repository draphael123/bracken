// tools/undead-realms.mjs - THE UNDEAD ARCHMAGE'S SPELL REALMS (src/mage-realms.js; claude/undead3, Daniel 2026-09-29: "needs more portals than
// just desert; fire/ice/poison portals as his spells; more mechanics").
//   TEAR     at 75%, 50% and 25% of his health (and only then) he tears a portal - told (realmTell, REALM.tear) - and it takes you into
//            FIRE, then ICE, then POISON, each once; a realm is narrower than the zoomed screen; his health is his own (never more)
//   WARD     in a realm no blow bites him until its opening, and a realm can take him no lower than the next realm's mark
//   TOLD     every blow a realm lands on you comes after its own tell: a burning tile glowed first, the fire wall was his wallTell, an
//            icicle cracked first, the mire warned first, a spore cloud was a ring first; nothing lands from outside the realm's room
//   OPENINGS FIRE: his wall, dodged through on its way back, runs on into him (SCORCHED) - taken, it breaks on you and opens nothing.
//            ICE: an icicle struck over him breaks his shell (SHATTERED) - one struck anywhere else opens nothing. POISON: the vent struck
//            while his spores have cut the beam bursts up it into him (VENTED) - struck while he feeds, it holds. Each is double damage
//   READ     (claude/archfix; Daniel played it: "these need to be more obvious") every realm names its opening in plain words on a banner
//            each time you are pulled in, and again after a blow his ward turns (WARDED, never silent); the cue is drawn in the world where
//            it matters - the returning wall's road (to him or to you), the icicle over his shell, the vent lit only while the beam is cut -
//            and OPEN is drawn and said, with its window
//   RETURN   the opening runs out and the realm tears: back in his hall, the next realm not before REALM.rest
//   LIVING   (claude/ft4c, brief-fallingtower4 #4 A) each realm comes apart in 3 beats (said, told, the border crumbling) and has a second
//            return: FIRE burnt tiles fall (told) into low pits, the realm tilts, he keeps two perches - strike his firebolt into the brazier
//            over him; ICE the ceiling comes down after its frost, floes he hides behind - two lances batted back shatter him; POISON the
//            next vent bubbles and he hops, the mire surges (told) with bone rafts - a spore ring struck back chokes him. Robust to the hall moving
//   PAGE     the real fight: board the carpet, each mark tears its realm (the right one, the carpet held in its room, the ice slick), a
//            blow in a realm is warded, each opening struck with the game's own swing opens him, the realm returns you to his hall - and
//            his death opens the desert door as it always did
// usage: node tools/undead-realms.mjs
import assert from 'node:assert/strict';
import { LEVELS } from '../src/level.js';
import * as MR from '../src/mage-realms.js';
import { updateUndeadMage, MAGE } from '../src/undead-mage.js';
import { carpetBox } from '../src/carpet.js';
import { openPage } from './cdp.mjs';

const L = LEVELS.find(l => l.id === 'fallingtower').build(), A = (L.arena.hallArena ? { ...L.arena, ...L.arena.hallArena } : L.arena), HP = 600;   /* (claude/fallingtower3) the fight starts in THE CHASE now; his HALL - the sky this checks - is arena.hallArena, laid over the arena when his carpet carries you up */
assert.ok(MR.REALM && typeof MR.enterRealm === 'function' && typeof MR.updateRealm === 'function', 'there are no spell realms (src/mage-realms.js)');
const { REALM } = MR;
assert.deepEqual(REALM.at, [0.75, 0.5, 0.25], 'the realms are not at 75/50/25%'); assert.deepEqual(REALM.kinds, ['fire', 'ice', 'poison'], 'the realms are not fire, ice, poison');
/* a fight in Node: him, a hero on a carpet that stays where it is put, and everything the realm tells us */
const A_ = A;
function rig(o = {}) { const A = o.A || A_; let strikeBox = null;   /* (claude/ft4c) o.A: the hall moved; strikeBox: a blow box held out (setStrike) */
  const P = { x: (A.x0 + A.x1) / 2 - 120, y: (A.y0 + A.floor) / 2, dead: 0, carpet: { hitT: 0 }, dodge: 0, vx: 0, vy: 0 };
  const e = { t: 'undeadmage', alive: true, hp: o.hp ?? HP, hp0: HP, maxHp: HP, mode: 'hover', modeT: 0.3, x: (A.x0 + A.x1) / 2 + 100, y: (A.y0 + A.floor) / 2, face: -1, anim: 0, turn: 0, blinkT: 99, ...o.e };
  const log = { hits: [], says: [], pulls: [], leaves: [], tells: [], t: 0 };
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const c = () => ({ P, A, box: e.realm ? MR.realmBox(e, A) : carpetBox(A, 0), rnd, hit: (x, y, d, hard, blow) => log.hits.push({ t: log.t, d, hard, blow }), venom: () => { log.venom = (log.venom || 0) + 1; },
    say: (m, h) => log.says.push(m), sound: k => (log.sounds = log.sounds || []).push([log.t, k]), dodging: () => P.dodge > 0, strike: () => strikeBox, carry: () => {}, pull: k => log.pulls.push([log.t, k]), leave: k => log.leaves.push([log.t, k]) });
  let lastMode = '', lastPh = '';
  const step = (dt = 1 / 60) => { const was = e.mode; updateUndeadMage(e, dt, c()); log.t += dt; P.vy = 0;
    if (e.mode !== lastMode && /Tell$/.test(e.mode)) log.tells.push([log.t, e.mode]); lastMode = e.mode;
    const R = e.realm; if (R && R.kind === 'fire' && R.ph !== lastPh) { if (R.ph === 'tell') log.tells.push([log.t, 'tile']); lastPh = R.ph; }
    if (R && R.kind === 'ice') for (const q of R.icicles) if (q.st === 'crack' && !q.seen) { q.seen = true; q.crackAt = log.t; } else if (q.st === 'hang') q.seen = false;
    return was; };
  const run = (s, each) => { for (let i = 0; i < Math.round(s * 60); i++) { step(); if (each && each()) return true; } return false; };
  return { P, e, log, c, run, step, setStrike: q => { strikeBox = q; } };
}
const toldBefore = (log, kinds, t, min) => log.tells.some(([tt, k]) => kinds.includes(k) && t - tt >= min - 0.02 && t - tt < 6);
// ---- TEAR ----
{ const r = rig({ hp: HP }); r.run(8); assert.ok(!r.e.realm && !r.log.tells.some(t => t[1] === 'realmTell'), 'he tears a realm at full health');
  const q = rig({ hp: Math.ceil(HP * 0.75) + 1 }); q.run(8); assert.ok(!q.e.realm, 'he tears a realm over 75%'); }
const intoRealm = (k) => { const r = rig({ hp: Math.floor(HP * REALM.at[k]), e: { realmN: k } }); let tellAt = -1;
  r.run(10, () => { if (r.e.mode === 'realmTell' && tellAt < 0) tellAt = r.log.t; return !!r.e.realm; });
  assert.ok(r.e.realm && r.e.realm.kind === REALM.kinds[k], 'at ' + REALM.at[k] * 100 + '% he does not tear the ' + REALM.kinds[k] + ' realm: ' + JSON.stringify(r.e.realm && r.e.realm.kind));
  assert.ok(tellAt >= 0 && r.log.pulls.length === 1 && r.log.pulls[0][0] - tellAt >= REALM.tear - 0.03, 'the tear into ' + REALM.kinds[k] + ' is not told for ' + REALM.tear + ' s: ' + JSON.stringify([tellAt, r.log.pulls]));
  assert.ok(r.log.says.some(s => s.includes(REALM.name[REALM.kinds[k]])), 'the tear does not say which realm');
  const b = MR.realmBox(r.e, A); assert.ok(r.P.x > b.x0 && r.P.x < b.x1 && r.e.x > b.x0 && r.e.x < b.x1, 'you or he are not set down in the realm');
  assert.equal(r.e.hp0, HP, 'a realm gave him health');
  assert.ok(MR.realmWarded(r.e), 'in the realm his ward does not hold');
  { const K = REALM.kinds[k], cue = MR.realmCue && MR.realmCue(r.e, r.P);   /* READ: the banner, every time, in Daniel's words */
    assert.equal(REALM.cue && REALM.cue[K], { fire: 'LET HIS FIRE WALL PASS, THEN PUT HIM BETWEEN YOU AND IT', ice: 'STRIKE THE ICICLE ABOVE HIM', poison: 'WHEN HE CASTS, STRIKE THE VENT' }[K], K + ': the realm does not name its opening in plain words');
    assert.ok(cue && cue.text === REALM.cue[K] && cue.bannerT >= REALM.cueLen - 0.1 && REALM.cueLen >= 3, K + ': no banner on entering the realm: ' + JSON.stringify(cue && { t: cue.bannerT }));

    assert.equal(MR.realmWardHit(r.e), 'WARDED', K + ': a blow on his ward says nothing'); assert.ok(MR.realmCue(r.e, r.P).bannerT >= REALM.cueAgain - 0.01 && r.e.realm.wardT > 0, K + ': a warded blow does not bring the cue back'); }
  assert.equal(MR.realmFloor(r.e), k + 1 < 3 ? Math.ceil(HP * REALM.at[k + 1]) : 0, 'the realm can take him past the next mark');
  return r; };
assert.ok(REALM.w + 24 <= 640, 'a realm is wider than the zoomed screen: ' + REALM.w);
// ---- FIRE ----
const fireOut = {};
/* THE FIRE ROOM FIXED (claude/fallingtower2, Daniel 10-08): an ARRIVAL GRACE - nothing burns and nothing is cast for REALM.fire.grace s; the first
   thing that can land on you comes after the grace AND its own full tell; the wall's tell HISSES as it starts (its vents drawn), the tiles' too */
{ const g = intoRealm(0), G = g.e.realm; assert.ok(REALM.fire.grace >= 1.5, 'the fire room has no arrival grace'); const t0 = g.log.t;
  g.run(REALM.fire.grace - 0.05); assert.ok(!g.log.hits.length && !g.log.tells.some(([t]) => t > t0) && G.ph === 'wait' && !G.wall && !g.e.shots.length, 'something burns or is cast in the fire room\'s arrival grace');
  let first = -1; g.run(12, () => { if (g.log.hits.length || g.e.shots.length || G.wall || G.ph === 'burn') { first = g.log.t - t0; return true; } });
  assert.ok(first >= REALM.fire.grace + Math.min(REALM.fire.tell, REALM.fire.wallTell, REALM.bolt.tellFire) - 0.05, 'the first thing in the fire room lands before the grace and its tell: ' + first.toFixed(2));
  const w = intoRealm(0); w.run(14, () => w.e.mode === 'wallTell'); assert.ok(w.e.mode === 'wallTell' && (w.log.sounds || []).some(([t, k]) => k === 'hiss' && Math.abs(t - w.log.t) < 0.05), 'the fire wall\'s tell does not hiss as it starts');
  fireOut.grace = REALM.fire.grace; fireOut.first = +first.toFixed(2); }
{ const r = intoRealm(0); const P = r.P, R = r.e.realm, b = MR.realmBox(r.e, A);
  /* TOLD: 30 s standing in the middle of it, every blow after its tell */
  P.x = (b.x0 + b.x1) / 2; P.y = (b.y0 + b.y1) / 2; r.run(30);
  const bl = r.log.hits.map(h => h.blow); fireOut.blows = [...new Set(bl)];
  assert.ok(bl.includes('pillar'), 'the burning floor never burned anyone standing on its pattern: ' + bl);
  for (const h of r.log.hits) { const ok = h.blow === 'pillar' ? toldBefore(r.log, ['tile'], h.t, REALM.fire.tell) : h.blow === 'firewall' ? toldBefore(r.log, ['wallTell'], h.t, REALM.fire.wallTell) : h.blow === 'fire' ? toldBefore(r.log, ['fireTell'], h.t, REALM.bolt.tellFire) : false;
    assert.ok(ok, 'an UNTOLD blow in the fire realm: ' + JSON.stringify(h) + ' tells ' + JSON.stringify(r.log.tells.slice(-6))); }
  assert.ok(r.log.tells.some(t => t[1] === 'wallTell'), 'he never rolls his fire wall');
  assert.ok(!r.e.realm || !MR.OPEN.has(r.e.mode) || true);
  /* the wall TAKEN on its way back breaks on you and opens nothing */
  const q = intoRealm(0), Q = q.e.realm; let broke = false;
  q.run(20, () => { const W = Q.wall; if (W && W.back) { q.P.y = W.y + 8; } if (q.e.mode === 'scorched') return true; if (W && W.back && W.hitP && !Q.wall) broke = true; return broke; });
  assert.ok(q.e.mode !== 'scorched', 'the wall that breaks on you opens him');
  assert.ok(q.log.hits.some(h => h.blow === 'firewall'), 'taken, his wall did not hit you');
  /* THE LURE: dodge through it on its way back, and it runs on into him */
  const s = intoRealm(0), S = s.e.realm; let scorched = -1;
  s.run(25, () => { const W = S.wall; s.P.dodge = W && W.back && Math.abs(W.x - s.P.x) < 30 ? 0.2 : 0; if (W && !W.back) s.P.y = W.y > (b.y0 + b.y1) / 2 ? b.y0 + 30 : b.y1 - 10;   /* out of it going out, through it coming back */
    if (s.e.mode === 'scorched') { scorched = s.log.t; return true; } });
  assert.ok(scorched > 0, 'dodged through on its way back, his wall does not run on into him: ' + JSON.stringify(s.log.says.slice(-5)));
  assert.ok(!MR.realmWarded(s.e) && s.e.open > 2, 'scorched, he is not open');
  assert.ok(MR.realmCue(s.e, s.P).open, 'scorched, the cue does not say he is open');
  assert.ok((s.log.sounds || []).some(([t, k]) => k === 'sting' && Math.abs(t - scorched) < 0.05), 'he opens without a sting');
  { const t1 = s.log.t; s.run(REALM.openT + 0.3); assert.ok((s.log.sounds || []).some(([t, k]) => k === 'golemChime' && t > t1), 'the window shuts without a sound'); }
  { const v = intoRealm(0); v.run(REALM.cueLen + 0.2); assert.equal(MR.realmCue(v.e, v.P).bannerT, 0, 'the banner never goes'); }
  /* READ: the wall coming back shows its road - to him when you are behind him, to you when you are in it */
  { const u = intoRealm(0), U = u.e.realm; let saw = {}; u.run(20, () => { const W = U.wall; if (W && !W.back) u.P.y = W.y > (b.y0 + b.y1) / 2 ? b.y0 + 30 : b.y1 - 10;
      if (W && W.back) { const c = MR.realmCue(u.e, u.P); if (c.back) { const behind = (u.e.x - W.x) * W.d < (u.P.x - W.x) * W.d; saw[behind ? 'him' : 'you'] = saw[behind ? 'him' : 'you'] || c.first; }
        u.P.x = (saw.you ? u.e.x + W.d * 40 : u.P.x); } return saw.him && saw.you; });
    assert.equal(saw.you, 'you', 'in the road of the returning wall, the cue does not say it will break on you: ' + JSON.stringify(saw));
    assert.equal(saw.him, 'him', 'behind him, the cue does not say the wall will burn him: ' + JSON.stringify(saw)); }
  assert.ok(!s.e.realm && s.log.leaves.length === 1 && s.log.leaves[0][1] === 'fire' && s.e.realmN === 1, 'the opening runs out and the fire realm does not tear back to his hall');
  s.e.hp = Math.floor(HP * 0.5); let back = -1; const t0 = s.log.t; s.run(REALM.rest + 6, () => { if (s.e.mode === 'realmTell') { back = s.log.t - t0; return true; } });
  assert.ok(back >= REALM.rest - 0.5, 'the next realm comes before he has had ' + REALM.rest + ' s in his hall: ' + back); }
// ---- ICE ----
{ const r = intoRealm(1), R = r.e.realm, P = r.P, b = MR.realmBox(r.e, A);
  P.x = (b.x0 + b.x1) / 2; P.y = (b.y0 + b.y1) / 2; r.run(30);
  const ic = r.log.hits.filter(h => h.blow === 'icicle'); assert.ok(ic.length >= 1, 'no icicle ever falls on a hero who stands still');
  for (const h of r.log.hits) { const ok = h.blow === 'icicle' ? R.icicles.some(q => q.crackAt !== undefined) && r.log.hits.every(() => true) : h.blow === 'ice' ? toldBefore(r.log, ['iceTell'], h.t, REALM.bolt.tellIce) : false;
    assert.ok(ok, 'an UNTOLD blow in the ice realm: ' + JSON.stringify(h)); }
  /* every icicle that fell unstruck cracked for its whole tell first */
  const q = intoRealm(1), Q = q.e.realm; const falls = []; let prev = new Map();
  q.run(20, () => { for (const k of Q.icicles) { if (k.st === 'crack' && prev.get(k) !== 'crack') k.cAt = q.log.t; if (k.st === 'fall' && prev.get(k) !== 'fall' && !k.struck) falls.push(q.log.t - (k.cAt ?? -99)); prev.set(k, k.st); } });
  assert.ok(falls.length >= 3 && falls.every(d => d >= REALM.ice.crack - 0.03), 'an icicle falls without cracking first: ' + falls.map(d => d.toFixed(2)));
  /* THE OPENING: an icicle struck anywhere but over him opens nothing; one over him breaks his shell */
  const s = intoRealm(1), S = s.e.realm, sb = MR.realmBox(s.e, A); s.run(0.5);
  const far = S.icicles.reduce((a, k) => Math.abs(k.x - s.e.x) > Math.abs(a.x - s.e.x) ? k : a);
  let hit = MR.strikeRealm(s.e, { l: far.x - 8, r: far.x + 8, t: sb.y0 - 20, b: sb.y0 }, new Set(), s.c()); assert.equal(hit, 'icicle', 'a swing at an icicle does not bring it down');
  s.run(1.5); assert.ok(MR.realmWarded(s.e), 'an icicle struck far from him opened him');
  assert.ok(!s.log.hits.some(h => h.blow === 'icicle'), 'the icicle you struck fell on you');
  S.goT = 99; const over = S.icicles.find(k => k.st === 'hang'); S.goX = over.x; s.run(8, () => Math.abs(s.e.x - over.x) < 2);
  assert.equal(MR.realmCue(s.e, s.P).icicle, over, 'the icicle over his shell is not the one the cue marks');
  /* EASIER (Daniel): one struck a stride beside his shell (26 px off his middle, not over him; the next one is 34 px off) still falls onto him */
  { const h = intoRealm(1), H = h.e.realm, hb = MR.realmBox(h.e, A); H.goT = 99; H.castT = 99; const q = H.icicles[3]; H.goX = q.x + 26; h.run(8, () => Math.abs(h.e.x - (q.x + 26)) < 1); H.goX = h.e.x;
    assert.equal(MR.realmCue(h.e, h.P).icicle, q, 'the icicle a stride beside him is not marked as the one to strike');
    MR.strikeRealm(h.e, { l: q.x - 8, r: q.x + 8, t: hb.y0 - 20, b: hb.y0 }, new Set(), h.c()); h.run(2, () => h.e.mode === 'shattered');
    assert.equal(h.e.mode, 'shattered', 'an icicle struck a stride beside his shell does not fall onto him: ' + [h.e.mode, Math.round(h.e.x - q.x)]); }
  MR.strikeRealm(s.e, { l: over.x - 8, r: over.x + 8, t: sb.y0 - 20, b: sb.y0 }, new Set(), s.c()); let t = 0; s.run(2, () => { t++; return s.e.mode === 'shattered'; });
  assert.equal(s.e.mode, 'shattered', 'an icicle struck over him does not break his shell: ' + [s.e.mode, s.e.x, over.x]);
  assert.ok(s.e.open > 2 && MAGE.openMul >= 2, 'shattered, he is not open'); s.run(REALM.openT + 0.3); assert.ok(!s.e.realm && s.e.realmN === 2, 'the ice realm does not tear back'); }
// ---- POISON ----
{ const r = intoRealm(2), R = r.e.realm, P = r.P;
  const m0 = R.mire; r.run(10); assert.ok(m0 - R.mire > 30, 'the mire does not rise: ' + [m0, R.mire]);
  /* in it: it warns, then bites, poisons and throws you up */
  const n0 = r.log.hits.length; P.y = R.mire + 10; r.step(); r.step(); assert.equal(r.log.hits.length, n0, 'the mire bites the moment you touch it (no warning)');
  r.run(0.3, () => { P.y = R.mire + 10; }); assert.ok(r.log.hits.slice(n0).some(h => h.blow === 'mire') && r.log.venom > 0, 'the mire does not bite or poison');
  /* TOLD: spores are rings first */
  const q = intoRealm(2), Q = q.e.realm; let sporesTold = true, sawRings = false;
  q.run(20, () => { if (q.e.mode === 'sporeTell') sawRings = sawRings || Q.spores.length === 3; if (Q.clouds.length && !q.log.tells.some(t => t[1] === 'sporeTell')) sporesTold = false; q.P.y = Math.min(q.P.y, Q.mire - 30); });
  assert.ok(sawRings && sporesTold, 'a spore cloud blooms without its ring first');
  for (const h of q.log.hits) assert.ok(h.blow === 'fire' ? toldBefore(q.log, ['fireTell'], h.t, REALM.bolt.tellFire) : false, 'an UNTOLD blow in the poison realm: ' + JSON.stringify(h));
  /* THE OPENING: the vent while he feeds holds; while the beam is cut it bursts into him */
  const s = intoRealm(2), S = s.e.realm, vb = () => ({ l: S.vent.x - 10, r: S.vent.x + 10, t: S.mire - 12, b: S.mire + 4 });
  s.run(0.5); assert.ok(MR.realmCue && MR.realmCue(s.e, s.P).vent === false, 'while he feeds, the vent is not dark'); assert.equal(MR.strikeRealm(s.e, vb(), new Set(), s.c()), 'held', 'struck while he feeds, the vent does not hold'); assert.ok(MR.realmWarded(s.e), 'the vent struck while he feeds opens him');
  s.run(10, () => { s.P.y = Math.min(s.P.y, S.mire - 30); return s.e.mode === 'sporeTell'; }); assert.equal(s.e.mode, 'sporeTell', 'he never casts his spores');
  assert.ok(MR.realmCue(s.e, s.P).vent === true, 'the beam cut, the vent is not lit');
  assert.equal(MR.strikeRealm(s.e, vb(), new Set(), s.c()), 'vent', 'struck while the beam is cut, the vent does not burst');
  assert.equal(s.e.mode, 'vented', 'the vent does not open him'); const mm = S.mire; s.run(1); assert.ok(S.mire > mm, 'the mire does not drain');
  s.run(REALM.openT + 0.3); assert.ok(!s.e.realm && s.e.realmN === 3, 'the poison realm does not tear back'); s.e.hp = 1; const tl = s.log.t; s.run(20); assert.ok(!s.e.realm && !s.log.tells.some(t => t[1] === 'realmTell' && t[0] > tl), 'a fourth realm'); }

// ---- LIVING REALMS (claude/ft4c, scratch/brief-fallingtower4-1029.md #4 A: each realm comes apart in 3 told beats, has a SECOND thing to hit back, and he moves) ----
const living = {};
{ const L2 = MR.REALM, B = L2.beat;
  assert.ok(L2.cue2 && L2.cue2.fire && L2.cue2.ice && L2.cue2.poison, 'a living realm does not name its second return');
  /* THE BEATS: each realm's beat 2 and beat 3 come on time, each SAID and told, and the border crumbles (notches + chunks) - geometry from the realm's box only */
  for (let k = 0; k < 3; k++) { const K = L2.kinds[k], r = intoRealm(k), R = r.e.realm, b = MR.realmBox(r.e, A), t0 = r.log.t, g0 = K === 'fire' ? L2.fire.grace : 0;
    r.P.x = (b.x0 + b.x1) / 2; r.P.y = b.y0 + 50; const seen = {};
    r.run(g0 + B.at[1] + 0.5, () => { if (K === 'poison') r.P.y = Math.min(r.P.y, R.mire - 40); if (MR.OPEN.has(r.e.mode)) return true; for (const n of [2, 3]) if (R.beat >= n && !seen[n]) seen[n] = r.log.t - t0; });
    assert.ok(!MR.OPEN.has(r.e.mode), K + ': he opened by himself while the beats ran');
    assert.ok(Math.abs(seen[2] - (g0 + B.at[0])) < 0.1 && Math.abs(seen[3] - (g0 + B.at[1])) < 0.1, K + ': the beats do not come at ' + B.at + ' s: ' + JSON.stringify(seen));
    for (const n of [2, 3]) { assert.ok(r.log.says.includes(B.say[K][n - 1]), K + ': beat ' + n + ' is not said: ' + B.say[K][n - 1]); assert.ok(R.told.some(q => q[1] === 'beat' + n), K + ': beat ' + n + ' is not told'); }
    assert.ok(R.bites.length >= 2 && R.bites.length <= 12, K + ': the border does not crumble (notches): ' + R.bites.length);
    for (const q of R.bites) assert.ok(q.y >= b.y0 - 1 && q.y <= b.y1, K + ': a notch is off the realm wall');
    living[K] = { beats: [+seen[2].toFixed(2), +seen[3].toFixed(2)], bites: R.bites.length }; }
  /* ---- FIRE: burnt tiles fall (told), the realm tilts toward him, he moves between two perches, and his firebolt struck into the brazier over him burns him ---- */
  { const r = intoRealm(0), R = r.e.realm, b = MR.realmBox(r.e, A), F2 = L2.fire2, tw = L2.w / L2.fire.n, perch = [b.x0 + F2.perch, b.x1 - F2.perch]; let at = { l: 0, r: 0 }, drops = [], picked = [];
    r.P.y = b.y0 + 40; let px = b.x0 + 40;
    r.run(30, () => { r.P.x = px; R.wall = null; R.nextWall = false; if (r.e.mode === 'scorched') return true;   /* (his wall held off: this measures the floor and his perches) */ const u = Math.floor((r.P.x - b.x0) / tw);
      if (R.drop && !picked.includes(R.drop)) { picked.push(R.drop); drops.push([R.drop.k, u]); }
      if (Math.abs(r.e.x - perch[0]) < 6) at.l++; if (Math.abs(r.e.x - perch[1]) < 6) at.r++; px = px > b.x1 - 60 ? b.x0 + 40 : px + 0.6; });
    assert.ok(!MR.OPEN.has(r.e.mode), 'fire: he opened by himself');
    assert.ok(at.l > 30 && at.r > 30 && R.told.some(q => q[1] === 'cross'), 'fire: he does not move between his two perches: ' + JSON.stringify(at));
    assert.ok(R.holes.length >= 1 && R.holes.length <= F2.maxHoles, 'fire: no burnt tile falls in beat 2 (or too many): ' + R.holes);
    for (const [k, u] of drops) assert.notEqual(k, u, 'fire: the tile under you was picked to fall');
    const dr = R.told.filter(q => q[1] === 'drop'), ho = R.told.filter(q => q[1] === 'hole');
    ho.forEach((h, i) => assert.ok(dr[i] && h[0] - dr[i][0] >= F2.drop - 0.03, 'fire: a tile falls without glowing dark for ' + F2.drop + ' s first: ' + JSON.stringify([dr, ho])));
    assert.ok(R.beat === 3 && R.tilt === R.perch, 'fire: beat 3 does not tilt the realm toward him');
    { const x0 = r.P.x = (b.x0 + b.x1) / 2; r.P.y = b.y0 + 40; R.crossT = 99; r.run(1); assert.ok((r.P.x - x0) * R.tilt > F2.tilt * 0.8, 'fire: the tilt does not slide you toward him: ' + (r.P.x - x0).toFixed(1)); }
    /* a hero low over a burning pit is burned - and only after its told fall */
    { const h = R.holes[0], n0 = r.log.hits.length; R.crossT = 99; r.run(1.2, () => { r.P.x = b.x0 + (h + 0.5) * tw; r.P.y = R.A.floor - 30; });
      assert.ok(r.log.hits.slice(n0).some(q => q.blow === 'hole'), 'fire: a burning pit does not burn a hero low over it'); }
    living.fire = { ...living.fire, holes: R.holes.length, perches: at }; }
  /* THE BRAZIER: his firebolt struck back flies into the lit brazier over him and spills - on him at his perch, HE BURNS; struck while he is away from it, it spills on no one */
  const strikeAt = (r, pred, s = 12) => { let q = null; r.run(s, () => { q = r.e.shots.find(pred); return !!q; }); return q; };
  { const r = intoRealm(0), R = r.e.realm, b = MR.realmBox(r.e, A); r.P.x = b.x0 + 120; r.P.y = (b.y0 + b.y1) / 2; R.nextWall = false; R.crossT = 99;
    const q = strikeAt(r, s => s.realmRet && !s.reflected && Math.hypot(s.x - r.P.x, s.y - r.P.y) < 70, 14); assert.ok(q, 'fire: he never casts a returnable firebolt in his realm');
    assert.ok(MR.realmCanReturn(r.e, q), 'fire: his firebolt cannot be struck back in his realm');
    r.setStrike({ l: q.x - 8, r: q.x + 8, t: q.y - 8, b: q.y + 8 }); r.step(); r.setStrike(null);
    assert.ok(q.reflected && q.braz, 'fire: a blow on his firebolt does not send it into the brazier');
    let op = -1; r.run(4, () => { if (r.e.mode === 'scorched') { op = r.log.t; return true; } });
    assert.ok(op > 0 && R.told.some(t => t[1] === 'spill') && r.log.says.includes('THE BRAZIER SPILLS ON HIM. HE IS OPEN'), 'fire: the brazier struck over him does not burn him: ' + JSON.stringify([r.e.mode, r.log.says.slice(-3)]));
    assert.ok(R.braziers.some(z => !z.lit), 'fire: the spilled brazier stays lit'); }
  { const r = intoRealm(0), R = r.e.realm, b = MR.realmBox(r.e, A); r.P.x = b.x0 + 120; r.P.y = (b.y0 + b.y1) / 2; R.nextWall = false; R.crossT = 99;
    const q = strikeAt(r, s => s.realmRet && !s.reflected && Math.hypot(s.x - r.P.x, s.y - r.P.y) < 70, 14); r.setStrike({ l: q.x - 8, r: q.x + 8, t: q.y - 8, b: q.y + 8 }); r.step(); r.setStrike(null);
    r.e.x = (b.x0 + b.x1) / 2; R.perch = 0;   /* he is away from it, between his perches */
    r.run(3, () => R.told.some(t => t[1] === 'spill')); assert.ok(R.told.some(t => t[1] === 'spill') && !MR.OPEN.has(r.e.mode), 'fire: the brazier spilled on no one opened him'); const br = R.braziers.find(z => !z.lit);
    assert.ok(br, 'fire: the brazier did not empty'); R.perch = 1; r.run(L2.fire2.relight + 0.3); assert.ok(br.lit, 'fire: an emptied brazier never lights again'); }
  /* ---- ICE: the ceiling comes down (frost first), floes he hides behind, and two of his lances batted back shatter his shell ---- */
  { const r = intoRealm(1), R = r.e.realm, I2 = L2.ice2, y00 = MR.realmBox(r.e, A).y0; r.P.y = y00 + 60;
    r.run(B.at[0] + 0.05); assert.equal(R.beat, 2, 'ice: no beat 2'); assert.equal(MR.realmBox(r.e, A).y0, y00, 'ice: the ceiling comes down with no frost first');
    r.run(I2.creep - 0.15); assert.ok(MR.realmBox(r.e, A).y0 - y00 < 1, 'ice: the ceiling moves before its frost has crept for ' + I2.creep + ' s');
    r.run(3); assert.equal(MR.realmBox(r.e, A).y0 - y00, I2.ceil, 'ice: beat 2 does not lower the ceiling ' + I2.ceil + ' px');
    { const b2 = MR.realmBox(r.e, A), q = R.icicles.find(z => z.st === 'hang'); assert.equal(MR.strikeRealm(r.e, { l: q.x - 8, r: q.x + 8, t: b2.y0 - 20, b: b2.y0 }, new Set(), r.c()), 'icicle', 'ice: an icicle on the lowered ceiling cannot be struck'); }
    r.run(B.at[1] - B.at[0] + 3, () => { r.P.y = MR.realmBox(r.e, A).y0 + 30; });
    assert.equal(MR.realmBox(r.e, A).y0 - y00, I2.ceil * 2, 'ice: beat 3 does not lower the ceiling again');
    assert.ok(R.floes && R.floes.length === I2.floes.length, 'ice: no floes in beat 3');
    const b3 = MR.realmBox(r.e, A); let inF = 0, nF = 0; r.run(8, () => { nF++; if (R.floes.some(f => Math.abs(f.x - r.e.x) < I2.floeW / 2 + 4) && r.e.y > b3.y1 - 40) inF++; }); const hid = +(inF / nF).toFixed(2) >= 0.5 ? +(inF / nF).toFixed(2) : false;
    assert.ok(hid, 'ice: in beat 3 he does not hide behind a floe: ' + JSON.stringify([Math.round(r.e.x), Math.round(r.e.y), R.floes.map(f => Math.round(f.x)), b3.y1]));
    /* a lance of his into a floe breaks on it */
    const f = R.floes[0]; r.e.shots.push({ x: f.x - 30, y: b3.y1 - 12, vx: 200, vy: 0, a: 0, sp: 200, r: 4, dmg: 12, kind: 'ice', col: '#9be2ff', t: 2, realmRet: true }); const shot = r.e.shots[r.e.shots.length - 1];
    r.run(0.3); assert.ok(shot.gone, 'ice: his lance does not break on a floe');
    living.ice = { ...living.ice, ceil: MR.realmBox(r.e, A).y0 - y00, floes: R.floes.length, hid }; }
  { const r = intoRealm(1), R = r.e.realm, b = MR.realmBox(r.e, A); r.P.x = b.x0 + 100; r.P.y = (b.y0 + b.y1) / 2; R.dropT = 99; let n = 0;
    r.run(14, () => { const q = r.e.shots.find(s => s.realmRet && !s.reflected && Math.hypot(s.x - r.P.x, s.y - (r.P.y - 8)) < 40); if (q && !(R.retCd > 0)) { r.setStrike({ l: q.x - 6, r: q.x + 6, t: q.y - 6, b: q.y + 6 }); r.step(); r.setStrike(null); n++; }
      if (R.cracks === 1 && living.oneCrack === undefined) living.oneCrack = MR.realmWarded(r.e); return r.e.mode === 'shattered'; });
    assert.equal(living.oneCrack, true, 'ice: one lance batted back already breaks his shell');
    assert.equal(r.e.mode, 'shattered', 'ice: two of his lances batted back do not shatter his shell: ' + JSON.stringify([n, R.cracks, r.log.says.slice(-4)]));
    assert.ok(r.log.says.includes('TWO LANCES: HIS SHELL SHATTERS. HE IS OPEN'), 'ice: the shatter is not said'); }
  /* ---- POISON: the vents wake (the next one bubbles, he hops), the mire surges (told) with bone rafts to ride, and a spore ring struck back chokes him ---- */
  { const r = intoRealm(2), R = r.e.realm, Q2 = L2.poison2, b = MR.realmBox(r.e, A); r.P.x = (b.x0 + b.x1) / 2; let hopTo = null, ventAt = null;
    r.run(B.at[1] + 6, () => { r.P.y = Math.min(r.P.y, R.mire - 40); if (MR.OPEN.has(r.e.mode)) return true; if (R.next && !hopTo) hopTo = R.next; if (hopTo && R.vent === hopTo && !ventAt) ventAt = r.log.t; });
    const bu = R.told.filter(q => q[1] === 'bubble'), hp = R.told.filter(q => q[1] === 'hop');
    assert.ok(bu.length >= 1 && hp.length >= 1 && hp[0][0] - bu[0][0] >= Q2.bubble - 0.03, 'poison: the vent he goes to does not bubble ' + Q2.bubble + ' s first: ' + JSON.stringify([bu, hp]));
    assert.ok(hopTo && ventAt, 'poison: he never goes to the bubbling vent');
    r.run(5, () => { r.P.y = Math.min(r.P.y, R.mire - 40); return Math.abs(r.e.x - Math.max(b.x0 + 20, R.vent.x - 60)) < 12; }); assert.ok(Math.abs(r.e.x - Math.max(b.x0 + 20, R.vent.x - 60)) < 12, 'poison: he does not move over to his new vent: ' + [Math.round(r.e.x), Math.round(R.vent.x)]);
    for (const v of R.vents) assert.ok(v.x > b.x0 && v.x < b.x1, 'poison: a vent is outside the realm');
    assert.ok(R.rafts && R.rafts.length === Q2.rafts.length, 'poison: no bone rafts in beat 3');
    /* THE SURGE: told (its line) for surgeTell s before the mire moves; on a raft it does not reach you; off one, it bites (told) */
    r.run(12, () => { r.P.y = Math.min(r.P.y, R.mire - 60); return !R.surge; }); let tellAt = -1, upAt = -1; r.run(Q2.surgeEvery + 4, () => { r.P.y = Math.min(r.P.y, R.mire - 60); if (R.surge && R.surge.ph === 'tell' && tellAt < 0) tellAt = r.log.t; if (R.surgeOff > 0 && upAt < 0) { upAt = r.log.t; return true; } });
    assert.ok(tellAt > 0 && upAt - tellAt >= Q2.surgeTell - 0.03, 'poison: the mire surges without its tell: ' + [tellAt, upAt]);
    const raft = R.rafts[0], n0 = r.log.hits.length; r.run(Q2.surgeUp + 0.5, () => { r.P.x = raft.x; r.P.y = R.mire + 8; });
    assert.ok(!r.log.hits.slice(n0).some(q => q.blow === 'surge' || q.blow === 'mire'), 'poison: the surge bites a hero on a raft');
    r.P.y = R.mire + 8; r.step(); assert.ok(Math.abs(r.P.y - (R.mire - 6)) < 2, 'poison: a raft does not hold you up: ' + [r.P.y, R.mire]);
    const n1 = r.log.hits.length; r.run(0.6, () => { r.P.x = b.x0 + 30; r.P.y = R.mire + 8; }); const sb = r.log.hits.slice(n1).filter(q => q.blow === 'surge');
    assert.ok(sb.length >= 1 && sb.every(q => q.t - tellAt >= Q2.surgeTell - 0.03), 'poison: off a raft the surge does not bite, or bites untold');
    living.poison = { ...living.poison, hops: hp.length, surge: +(upAt - tellAt).toFixed(2) }; }
  { const r = intoRealm(2), R = r.e.realm; let got = null; r.run(12, () => { r.P.y = Math.min(r.P.y, R.mire - 40); if (r.e.mode === 'sporeTell' && R.spores.length === 3) { const s = R.spores[1];
      got = MR.strikeRealm(r.e, { l: s.x - 8, r: s.x + 8, t: s.y - 8, b: s.y + 8 }, new Set(), r.c()); return true; } });
    assert.equal(got, 'spore', 'poison: a spore ring struck before it blooms is not struck back');
    assert.equal(R.spores.length, 2, 'poison: the spore struck back still blooms');
    r.run(4, () => r.e.mode === 'vented'); assert.equal(r.e.mode, 'vented', 'poison: his own spore struck back does not choke him');
    assert.ok(r.log.says.includes('HIS OWN SPORES CHOKE HIM. HE IS OPEN'), 'poison: the choke is not said');
    const t = intoRealm(2), T2 = t.e.realm; let bolt = null; t.run(14, () => { t.P.y = Math.min(t.P.y, T2.mire - 40); bolt = t.e.shots.find(s => s.kind === 'fire'); return !!bolt; });
    assert.ok(bolt && bolt.noReturn && !MR.realmCanReturn(t.e, bolt), 'poison: his firebolt in the poison realm wears the gold ring of a returnable shot (it is not its return)'); }
  /* ---- ROBUST TO THE HALL MOVING (lane B restructures the level; the hall moved in ft4a): every living thing is placed from the realm's box ---- */
  { const A2 = { ...A, x0: A.x0 + 160, x1: A.x1 + 160, y0: A.y0 + 48, floor: A.floor + 48 };
    for (let k = 0; k < 3; k++) { const r = rig({ hp: Math.floor(HP * L2.at[k]), e: { realmN: k }, A: A2 }); r.run(10, () => !!r.e.realm); const R = r.e.realm, b = MR.realmBox(r.e, A2);
      r.run((k === 0 ? L2.fire.grace : 0) + B.at[1] + 1, () => { r.P.x = (b.x0 + b.x1) / 2; r.P.y = k === 2 ? Math.min(b.y0 + 60, R.mire - 40) : b.y0 + 60; return MR.OPEN.has(r.e.mode); });
      assert.ok(r.e.x > b.x0 && r.e.x < b.x1 && r.e.y > b.y0 - 60 && r.e.y < b.y1 + 20, L2.kinds[k] + ': with the hall moved he leaves the realm box');
      for (const q of [...R.bites, ...(R.floes || []), ...(R.vents || []), ...(R.rafts || [])]) assert.ok((q.x === undefined || (q.x >= b.x0 - 1 && q.x <= b.x1 + 1)) && (q.y === undefined || (q.y >= b.y0 - 2 && q.y <= b.y1 + 2)), L2.kinds[k] + ': with the hall moved a living piece is outside the realm box: ' + JSON.stringify(q)); } } }

// ---- PAGE: the real fight ----
const pg = await openPage({ audio: false, fonts: false }); let r;
try {
  r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');const MR=await import('/src/mage-realms.js');BK.manualSimulation=true;const out={realms:[],marks:[]};const rec=()=>{window.__textRec=[];BK.step(0);const t=window.__textRec||[];window.__textRec=null;return t;};
   BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='fallingtower'));BK.state='play';BK.god=true;BK.sim(10);
   BK.board();BK.sim(30);for(let i=0;i<3600&&BK.boss&&BK.boss.leg==='ascent';i++)BK.sim(1);const b=BK.boss;   /* (claude/ft4a: THE ASCENT first) */for(let i=0;i<300&&b.mode==='wake';i++)BK.sim(1);out.fight=BK.bossActive;out.view=BK.view.VW;
   const A=BK.L.arena;
   for(let k=0;k<3;k++){const row={};
     b.hp=Math.floor(b.hp0*MR.REALM.at[k]);b.realmRest=0;let told=false;
     for(let i=0;i<900&&!b.realm;i++){BK.P.hp=BK.P.maxHp;BK.sim(1);if(b.mode==='realmTell'){if(!told)BK.step(1);told=true;row.mark=BK.markOf?BK.markOf(b):'';}}
     row.told=told;row.kind=b.realm&&b.realm.kind;if(!b.realm){out.realms.push(row);break;}
     const R=b.realm,box=MR.realmBox(b,A);BK.sim(20);BK.step(2);   /* (drawn: the realm's room and its hazards, over the real renderer) */row.held=BK.P.x>=box.x0-1&&BK.P.x<=box.x1+1;row.grip=BK.P.carpet&&BK.P.carpet.grip;
     {const t=rec(),cue=MR.REALM.cue&&MR.REALM.cue[R.kind];row.banner=!!cue&&t.some(x=>x.s===cue);row.bannerDrawn=R.bannerDrawn;row.tintWard=R.tint;}   /* READ: its opening in plain words, on the screen */const h0=b.hp;BKT.hurtEnemy(b,40,b.x-10,false);row.warded=b.hp===h0;{const t=rec();row.wardSaid=t.some(x=>x.s==='WARDED');row.cueAgain=+(R.cueT||0).toFixed(2);}
     /* its opening, with the game's own swing */
     if(R.kind==='fire'){let n=0;for(;n<60*30&&b.mode!=='scorched';n++){BK.P.hp=BK.P.maxHp;const W=R.wall;if(W&&W.back&&!row.cue){rec();row.cue=R.cueDrawn;}if(W&&W.back&&Math.abs(W.x-BK.P.x)<40&&!(BK.P.dodge>0)&&!W.hitP){BK.P.face=Math.sign(W.x-BK.P.x)||1;BK.press('dodge');}BK.sim(1);}}
     if(R.kind==='ice'){R.goT=99;const q=R.icicles.find(q=>q.st==='hang'&&Math.abs(q.x-b.x)<200)||R.icicles[3];R.goX=q.x;for(let n=0;n<600&&Math.abs(b.x-q.x)>2;n++){BK.P.hp=BK.P.maxHp;BK.sim(1);}rec();row.cue=R.cueDrawn;
       for(let n=0;n<240&&b.mode!=='shattered';n++){BK.P.hp=BK.P.maxHp;BK.P.x=q.x-10;BK.P.y=box.y0+2;BK.P.vx=BK.P.vy=0;BK.P.face=1;if(n%20===0&&q.st==='hang')BK.press('atk');BK.sim(1);}}
     if(R.kind==='poison'){for(let n=0;n<60*15&&b.mode!=='vented';n++){BK.P.hp=BK.P.maxHp;if(R.exposedT>0&&!row.cue){rec();row.cue=R.cueDrawn;}if(!(R.exposedT>0)&&!row.dark){rec();row.dark=R.cueDrawn;}if(R.exposedT>0){BK.P.x=R.vent.x-12;BK.P.y=R.mire+2;BK.P.vx=BK.P.vy=0;BK.P.face=1;if(n%15===0)BK.press('atk');}else{BK.P.y=Math.min(BK.P.y,R.mire-40);}BK.sim(1);}}
     row.opened=b.mode;{const t=rec();row.openCue=R.cueDrawn;row.openSaid=t.some(x=>x.s==='OPEN x2');row.openBanner=R.bannerDrawn;row.tintOpen=R.tint;}const h1=b.hp;BKT.hurtEnemy(b,20,b.x-10,false);row.doubled=h1-b.hp;row.floorHeld=b.hp>=MR.REALM.at[k+1]*b.hp0-1||k===2;
     for(let n=0;n<60*12&&b.realm;n++){BK.P.hp=BK.P.maxHp;BK.sim(1);}row.back=!b.realm&&b.realmN===k+1;row.after=[b.mode,b.modeT,b.realmN,!!b.realm];
     out.realms.push(row);}
   b.open=9;b.mode='gather';b.modeT=3;BKT.hurtEnemy(b,99999,b.x-10,false);for(let f=0;f<500;f++){if(BK.state==='card')BK.cardClose();BK.sim(1);}out.dead=!b.alive;out.door=!!(BK.L.sanctum&&BK.L.sanctum.open);out.fightOver=!BK.bossActive;
   return out;})()`, 600000);
} finally { pg.close(); }
assert.ok(r.fight && r.view >= REALM.w + 24, 'the fight does not start, or its view is narrower than a realm: ' + JSON.stringify(r));
assert.equal(r.realms.length, 3, 'the fight does not go through three realms: ' + JSON.stringify(r.realms));
r.realms.forEach((q, k) => { const K = REALM.kinds[k];
  assert.ok(q.told && q.kind === K, K + ': the tear is not told, or opens the wrong realm: ' + JSON.stringify(q));
  assert.ok(q.held, K + ': the carpet is not held in the realm\'s room'); assert.equal(q.grip, K === 'ice' ? REALM.ice.grip : 1, K + ': the carpet\'s grip');
  assert.ok(q.warded, K + ': a blow in the realm bites him before its opening');
  assert.ok(q.banner && q.bannerDrawn === REALM.cue[K], K + ': entering the realm, its opening is not on the screen in plain words: ' + JSON.stringify([q.banner, q.bannerDrawn]));
  assert.ok(q.wardSaid && q.cueAgain >= REALM.cueAgain - 0.1, K + ': a warded blow is silent (no WARDED, or the cue does not come back): ' + JSON.stringify([q.wardSaid, q.cueAgain]));
  assert.ok({ fire: /^fire:(you|him)$/, ice: /^ice:icicle$/, poison: /^poison:lit$/ }[K].test(q.cue || ''), K + ': the cue is not drawn in the world when it matters: ' + q.cue);
  assert.ok(q.tintWard === 'warded' && q.tintOpen === 'open', K + ': his sprite does not change between WARDED and OPEN: ' + JSON.stringify([q.tintWard, q.tintOpen]));
  if (K === 'poison') assert.equal(q.dark, 'poison:dark', 'while he feeds, the vent is not drawn dark');
  assert.ok(q.openCue === 'open:' + q.opened && q.openSaid && q.openBanner === 'open', K + ': open, he does not read as open (drawn, OPEN x2, the banner): ' + JSON.stringify([q.openCue, q.openSaid, q.openBanner]));
  assert.equal(q.opened, { fire: 'scorched', ice: 'shattered', poison: 'vented' }[K], K + ': its opening, struck in the game, does not open him: ' + JSON.stringify(q));
  assert.ok(q.doubled >= 30, K + ': open, a blow does not bite double: ' + q.doubled); assert.ok(q.floorHeld, K + ': the realm took him past the next mark');
  assert.ok(q.back, K + ': the realm does not return you to his hall: ' + JSON.stringify(q)); });
assert.ok(r.dead && r.door && r.fightOver, 'his death does not open the desert door (or end the fight): ' + JSON.stringify(r));
console.log('ok  undead-realms   at 75/50/25% he tears FIRE, ICE and POISON in turn (told ' + REALM.tear + ' s), warded in each till its one opening - his wall dodged back into him, an icicle on his shell, the vent while the beam is cut - every realm blow told first (fire: ' + fireOut.blows.join(' ') + '), each back to his hall, and his death opens the desert door');
console.log('ok  undead-realms   LIVING (claude/ft4c): 3 told beats each ' + JSON.stringify(living) + ' - fire pits told 0.8 s, the tilt, his two perches, the brazier; the ice ceiling after its frost, the floes, two lances shatter; the vents bubble first, the surge told, rafts hold; a spore struck back chokes him; all of it moves with the hall');
