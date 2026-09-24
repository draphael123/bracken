// unburied-foes.js — THE UNBURIED FIELD's creatures and its battle (Lane C2, 2026-09-25). Brief: .claude/briefs/unburied-field.md.
// The level is src/unburied-field.js; this file is everything that MOVES on it. main.js keeps only the glue (one block,
// "THE UNBURIED FIELD", beside villageReset) and the table rows every creature needs. Nothing here imports main.js, so
// tools/unburied-fights.mjs can drive every fight in Node.
//
// THE LEVEL'S SENTENCE: WHILE A BEARER'S STANDARD FLIES, THE FALLEN NEAR IT GET UP. CUT THE BEARER AND THEY STAY DOWN.
//   THE FALLEN (corpse)        lies on the field. Under a planted standard it RISES (a quiet tell: dust and a violet glint)
//                              and fights - one told cut, ! a shield turns it. Cut down under a standard it only FALLS,
//                              and gets up again; struck while it lies there, or burned, it is finished for good.
//   THE BANNER-BEARER          walks the standard up to you and PLANTS it (quiet: the plant is not a blow), then guards it
//                              with the pole, ! a shield turns it. Kill him and every man his standard raised lies down,
//                              and his stretch of ridge stops loosing volleys (the field goes quiet behind you).
//   THE BARROW RIDER (mini)    the old order's last knight on a ghost horse, the old banner for a lance (2026-09-24, in place
//                              of the Standard-Bearer). THE RIDE-THROUGH !! (the arena's length, THROUGH you: jump or
//                              dodge), REARING TRAMPLE ! (guard), GRAVE-FIRE ! (slow green bolts: guard), THE LANCE LINE !!
//                              (lances out of the ground toward you: step out). Strike him as he rides through and he is
//                              out of the saddle, OPEN. Phase two: the horse falls apart and he fights ON FOOT - THE BANNER
//                              THRUST ! and the lance line - until the bones crawl back and he REMOUNTS; strike the bones
//                              and the remount breaks, and he is OPEN.
//   THE FIRST DEATH KNIGHT     the armour and the scythe the class inherits - and, since 2026-09-24, the CLASS'S OWN KIT turned
//                              on you, boss-sized (Daniel: "fights with the Death Knight hero's kit"):
//                              THE CLEAVE        !   over the shoulder and down through what is in front of him: guard it
//                              DEATH GRIP        !!  a chain along the floor; caught, you are dragged to his feet and cleaved
//                              BLOOD BOIL        !!  the ground boils where you stand and cuts while you stay: step out
//                              THE LONG PASSING  !!  the greatsword rush: through you and far past: jump or dodge it
//                              BLOOD WARD, NOVA  !!  the ward keeps every blow on it; he lets go and the nova pays it out
//                              SUMMON SKELETON       (quiet) one of his dead gets up
//                              THE OPENING IS CAUSED, AND IT IS THE HERO'S OWN RULE: a FULL ward struck again BREAKS, and he
//                              reels OPEN. Left alone the ward opens nothing - it only makes the nova bigger.
//                              PHASE TWO (A10; "he is the banner", approved 2026-09-23, kept): anything of his that falls in
//                              the chapel gets up again unless you finish it on the floor or his own NOVA cuts it; SUMMON
//                              becomes GRAVECALL (three at once) and BLOOD SURGE !! (get away from him) joins the rotation.
// Touching none of them hurts (the touch rule): every blow is a told one.
import { canvas, rect, line, circle, fillPoly, outline, flipX, whiten } from './px.js';

export const UNB = {
  hp: { bannerbearer: 56, corpse: 30, barrowrider: 720, deathknight: 1000 },
  dmg: { pole: 12, corpseCut: 10, brRide: 18, brTrample: 14, brFire: 10, brLance: 16, brThrust: 14, cleave: 12, grip: 6, boil: 6, pass: 12, nova: 10, novaPer: 3, surge: 10, volley: 8, cavalry: 18 },
  bannerR: 120,        /* a planted standard raises the fallen within this many pixels of its foot */
  riseT: 1.1, downT: 3.2, plantRange: 150, tether: 44,
  corpseSpeed: 21, bearerSpeed: 26,
  /* THE BARROW RIDER: tells in seconds; the ride at rideV px/s the arena's length; the lance line lanceN lances lanceStep apart, one
     every lanceGap; on foot footT seconds before the bones crawl back, boneHits blows on them to break it, mountMoves in the saddle */
  br: { walk: 44, keep: 70, footWalk: 30, footKeep: 38, cd: 1.1, cdP2: 0.9, tell: { ride: 1.0, trample: 0.75, fire: 0.8, lance: 0.9, thrust: 0.6, remount: 2.2 },
    rideV: 290, rideHit: 22, trampleR: 42, bolts: 2, boltsP2: 3, boltT: 1.5, lanceN: 8, lanceStep: 22, lanceGap: 0.07, lanceR: 9, thrustR: 58, openT: 3.2, openMul: 1.6,
    footT: 7, mountMoves: 3, boneHits: 2, order: ['trample', 'fire', 'ride', 'lance', 'fire', 'ride'], orderFoot: ['thrust', 'lance', 'thrust'] },
  /* THE FIRST DEATH KNIGHT: tells in seconds; the chain runs chainV px/s out to gripR; a pool of blood boils boilT seconds, a cut every
     boilTick; the passing crosses passStep past where you stood in passT; the ward stands wardT and is FULL at wardFull blows */
  dk: { walk: 34, keep: 48, cd: 1.15, cdP2: 0.85, tell: { cleave: 0.7, cleaveAfter: 0.6, grip: 0.8, boil: 0.9, pass: 0.8, ward: 0.5, nova: 0.6, raise: 1.0, call: 1.2, surge: 1.0 },
    cleaveR: 56, gripR: 180, chainV: 480, boilR: 30, boilT: 2.5, boilTick: 0.5, passStep: 80, passT: 0.35, wardT: 2.4, wardFull: 3, novaR: 70, novaPer: 12, surgeR: 90,
    openT: 3.4, openMul: 1.5, raise: 1, call: 3, adds: 2, addsP2: 4,
    order: ['cleave', 'grip', 'ward', 'raise', 'boil', 'pass', 'cleave', 'ward', 'boil', 'pass'],
    orderP2: ['call', 'surge', 'ward', 'grip', 'boil', 'pass', 'cleave', 'surge', 'ward', 'pass'] },
};
export const UNB_FOES = new Set(['bannerbearer', 'corpse', 'barrowrider', 'deathknight']);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const tells = e => typeof e.mode === 'string' && e.mode.endsWith('Tell');

/* ---------------- THE BANNER RULE ---------------- */
/* Who is holding a standard up over this spot: a bearer whose standard is PLANTED, or - in his second phase, inside his own
   chapel - the First Death Knight himself. (The Barrow Rider raises nobody: his banner is a lance now.) */
export function coverOf(q, bearers, o = {}) {
  for (const b of bearers) {
    if (!b || !b.alive) continue;
    if (b.t === 'bannerbearer' && b.planted && Math.abs(q.x - b.flagX) < UNB.bannerR && Math.abs(q.y - b.flagY) < 64) return b;
    if (b.t === 'deathknight' && b.phase === 2 && o.bossLive && o.arena && q.x > o.arena.x0 && q.x < o.arena.x1 && Math.abs(q.y - o.arena.floor) < 60) return b;
  }
  return null;
}
/* THE FALLEN, TAKING A BLOW. Returns the damage to apply, or false when the blow is absorbed here. 'finish' is the answer to
   the whole level: a corpse that is LYING DOWN is finished by any blow at all (the scythe's rule, and anybody's boot). */
export function corpseHurt(e, dmg, cover, burning) {
  if (e.mode === 'down' || e.mode === 'riseTell') return Math.max(dmg, e.hp + 1);
  if (dmg >= e.hp && cover && !burning) { layDown(e, cover); return false; }
  return dmg;
}
export function layDown(e, cover) { e.mode = 'down'; e.modeT = UNB.downT; e.hp = e.hp0 || UNB.hp.corpse; e.h = 7; e.vx = 0; e.raisedBy = cover || null; e.fell = (e.fell || 0) + 1; }
/* A BEARER IS CUT DOWN: every man his standard holds up lies down, and they do not get up for him again */
export function bannerFalls(b, foes) {
  let n = 0;
  for (const q of foes) if (q.alive && q.t === 'corpse' && q.raisedBy === b && q.mode !== 'down') { layDown(q, null); q.modeT = 1e9; q.laid = true; n++; }
  if (b.t === 'bannerbearer') b.planted = false;
  return n;
}

/* ---------------- THE FALLEN ---------------- */
export function updateCorpse(e, dt, c) {
  const { P } = c; e.modeT -= dt; e.vx = 0; e.hp0 ??= e.hp;
  e.vy = Math.min(320, (e.vy || 0) + 1000 * dt); { const r = c.move(e, 0, e.vy * dt); if (r && r.ground) e.vy = 0; }
  if (e.mode === 'down') { e.h = 7;
    if (e.burn > 0) { c.finish(e, 'IT BURNS AND STAYS DOWN'); return; }   /* burned corpses do not rise again */
    const b = c.cover(e); if (b && e.modeT <= 0) { e.mode = 'riseTell'; e.modeT = UNB.riseT; e.raisedBy = b; e.laid = false; c.say('THE FALLEN RISE', '#c8b6ff'); c.sound('rise'); }
    return; }
  if (e.mode === 'riseTell') { e.h = 7 + Math.round(17 * clamp(1 - e.modeT / UNB.riseT, 0, 1)); if (e.modeT <= 0) { e.mode = 'walk'; e.h = 24; } return; }
  e.h = 24;
  if (e.mode === 'cutTell') { if (e.modeT > 0) return;
    const dx = (P.x - e.x) * e.face; if (!P.dead && dx > -6 && dx < 30 && Math.abs(P.y - e.y) < 24) c.hit(e.x, UNB.dmg.corpseCut, false, 'A DEAD MAN\'S BLADE');
    e.mode = 'cut'; e.modeT = 0.25; c.sound('slash'); return; }
  if (e.mode === 'cut') { if (e.modeT <= 0) { e.mode = 'rest'; e.modeT = 0.8; } return; }
  if (e.mode === 'rest') { if (e.modeT <= 0) e.mode = 'walk'; return; }
  const dx = P.x - e.x; e.face = Math.sign(dx) || e.face || 1;
  if (!P.dead && Math.abs(dx) < 26 && Math.abs(P.y - e.y) < 24) { e.mode = 'cutTell'; e.modeT = 0.75; return; }
  if (Math.abs(dx) > 18 && Math.abs(dx) < 260 && c.solid(e.x + e.face * 10, e.y + 4) && !c.solid(e.x + e.face * 10, e.y - 8)) { e.vx = e.face * UNB.corpseSpeed; c.move(e, e.vx * dt, 0); }
}

/* ---------------- THE BANNER-BEARER ---------------- */
export function updateBannerbearer(e, dt, c) {
  const { P } = c; e.modeT -= dt; e.cd = (e.cd ?? 1) - dt; e.vx = 0;
  e.vy = Math.min(320, (e.vy || 0) + 1000 * dt); { const r = c.move(e, 0, e.vy * dt); if (r && r.ground) e.vy = 0; }
  const dx = P.x - e.x;
  if (e.mode === 'plantTell') { if (e.modeT > 0) return; e.planted = true; e.flagX = e.x + e.face * 10; e.flagY = e.y; e.mode = 'guard'; e.cd = 0.8; c.say('THE BANNER STANDS', '#c8b6ff'); c.sound('plant'); return; }
  if (e.mode === 'poleTell') { if (e.modeT > 0) return;
    const f = (P.x - e.x) * e.face; if (!P.dead && f > -6 && f < 38 && Math.abs(P.y - e.y) < 26) c.hit(e.x, UNB.dmg.pole, false, 'THE STANDARD\'S POLE');
    e.mode = 'pole'; e.modeT = 0.22; c.sound('slash'); return; }
  if (e.mode === 'pole') { if (e.modeT <= 0) { e.mode = 'rest'; e.modeT = 0.8; e.cd = 1.3; } return; }
  if (e.mode === 'rest') { if (e.modeT <= 0) e.mode = e.planted ? 'guard' : 'walk'; return; }
  e.face = Math.sign(dx) || e.face || 1;
  if (!e.planted) {
    if (!P.dead && Math.abs(dx) < UNB.plantRange && Math.abs(P.y - e.y) < 48) { e.mode = 'plantTell'; e.modeT = 0.9; return; }
    if (Math.abs(dx) < 300 && c.solid(e.x + e.face * 10, e.y + 4) && !c.solid(e.x + e.face * 10, e.y - 8)) { e.vx = e.face * UNB.bearerSpeed; c.move(e, e.vx * dt, 0); }
    return; }
  /* planted: he keeps to his standard, and the pole keeps you off it */
  if (!P.dead && Math.abs(dx) < 34 && Math.abs(P.y - e.y) < 26 && e.cd <= 0) { e.mode = 'poleTell'; e.modeT = 0.7; return; }
  const want = clamp(P.x, e.flagX - UNB.tether, e.flagX + UNB.tether), d = want - e.x;
  if (Math.abs(d) > 20 && c.solid(e.x + Math.sign(d) * 10, e.y + 4)) { e.vx = Math.sign(d) * UNB.bearerSpeed; c.move(e, e.vx * dt, 0); }
}

/* ---------------- THE BARROW RIDER (mini) ---------------- */
/* A knight of the old order buried with his horse under the field; the battle got him up, and the horse came with him as a ghost.
   The banner he carried is his lance. He is not the Lancer (whose charge the SHIELD stops, and who wheels) and not the Hound
   Master (mounted, a yellow charge, his dogs): the Rider's gallop is RED, it goes THROUGH you, and it does not stop at you.
   The caused openings (A11) are both yours: strike him as he rides through and he is out of the saddle; in phase two, strike
   the bones crawling back to him and the remount breaks. Left alone, neither happens. */
const BR_TELL = { ride: 'rideTell', trample: 'trampleTell', fire: 'fireTell', lance: 'lanceTell', thrust: 'thrustTell', remount: 'remountTell' };
const BR_SAY = { rideTell: 'THE RIDE-THROUGH: JUMP IT', trampleTell: 'THE HORSE REARS: GUARD', fireTell: 'GRAVE-FIRE: GUARD', lanceTell: 'THE LANCE LINE: STEP OUT', thrustTell: 'THE BANNER THRUST: GUARD', remountTell: 'THE BONES CRAWL BACK TO HIM' };
const BR_SND = { rideTell: 'snort', trampleTell: 'bellow', fireTell: 'fire', lanceTell: 'plant', thrustTell: 'charge', remountTell: 'bones' };
export const brOpen = e => e.mode === 'unsaddled' || e.mode === 'scattered';
/* a blow on him: a blow while he rides through UNSADDLES him (the caused opening), and an open Rider takes more */
export function brHurt(e, dmg) { if (e.mode === 'ride' && e.mounted) e.unsaddle = true; return brOpen(e) ? Math.round(dmg * UNB.br.openMul) : dmg; }
function brCollapse(e, c, why) { e.mode = 'collapse'; e.modeT = 1.2; e.mounted = false; e.bonesX = e.horseX ?? e.x; e.horseX = null; e.footLeft = UNB.br.footT; e.boneHits = 0;
  c.say(why || 'THE HORSE FALLS APART UNDER HIM', '#ff6b6b'); c.sound('crack'); c.sound('bones'); c.shake(4); }
export function updateBarrowRider(e, dt, c) {
  const { P, A } = c, S = UNB.br, floor = A.floor;
  if (!e.alive || e.mode === 'sleep') return;
  e.modeT -= dt; e.cd = (e.cd ?? 1) - dt; e.turn ??= 0; e.mounted ??= true; e.bolts ??= []; e.lances ??= []; e.y = floor; e.vx = 0;
  e.w = e.mounted ? 30 : 12; e.h = e.mounted ? 52 : 28; e.arenaX ??= [A.x0 + 24, A.x1 - 24];
  e.open = brOpen(e) ? Math.max(0, e.modeT) : 0;
  /* GRAVE-FIRE in the air: slow, and each one only once */
  for (const b of e.bolts) { b.vy += 140 * dt; b.x += b.vx * dt; b.y += b.vy * dt;
    if (!P.dead && Math.abs(P.x - b.x) < 8 && b.y > P.y - 24 && b.y < P.y + 2) { b.done = true; c.hit(b.x, UNB.dmg.brFire, false, 'GRAVE-FIRE'); }
    if (b.y >= floor - 2 || b.x < A.x0 || b.x > A.x1) { b.done = true; b.burst = true; } }
  e.bolts = e.bolts.filter(b => !b.done);
  /* THE LANCE LINE: one lance after another out of the ground, each once */
  for (const l of e.lances) { if (!l.up) { l.t -= dt; if (l.t <= 0) { l.up = true; l.life = 0.45; c.sound('crack');
        if (!e.lanceHit && !P.dead && Math.abs(P.x - l.x) < S.lanceR + 4 && P.y > floor - 34) { e.lanceHit = true; c.hit(l.x, UNB.dmg.brLance, true, 'THE LANCE LINE'); } } }
    else l.life -= dt; }
  e.lances = e.lances.filter(l => !l.up || l.life > 0);
  /* the horse that threw him runs on, and comes back for him */
  if (e.horseX !== null && e.horseX !== undefined && !e.mounted) { e.horseX += (e.horseV || 0) * dt; if (e.horseX < A.x0 + 10 || e.horseX > A.x1 - 10) { e.horseV = -(e.horseV || 0) * 0.5; e.horseX = clamp(e.horseX, A.x0 + 10, A.x1 - 10); } }
  if (e.phase !== 2 && e.hp <= e.maxHp * 0.5 && !tells(e) && e.mode !== 'ride' && !brOpen(e)) { e.phase = 2; if (e.mounted) { brCollapse(e, c); return; } }
  /* ON FOOT IN PHASE TWO the clock to the remount runs whatever he is doing - a thrust does not stop the bones */
  if (!e.mounted && e.phase === 2 && e.mode !== 'remountTell' && e.mode !== 'scattered' && e.mode !== 'collapse') e.footLeft = (e.footLeft ?? S.footT) - dt;
  if (e.mode === 'wake') { if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = 0.6; } return; }
  if (e.mode === 'collapse') { if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = 0.6; } return; }
  if (e.mode === 'unsaddled') { if (e.modeT <= 0) { e.horseV = 0;
      if (e.phase === 2) { brCollapse(e, c, 'THE HORSE COMES BACK IN PIECES'); return; }
      e.mode = 'mountUp'; e.modeT = 0.5; e.x = e.horseX ?? e.x; c.sound('snort'); } return; }
  if (e.mode === 'mountUp') { if (e.modeT <= 0) { e.mounted = true; e.horseX = null; e.mode = 'stalk'; e.cd = 0.7; c.say('HE IS BACK IN THE SADDLE', '#ffd36b'); } return; }
  if (e.mode === 'scattered') { if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = 0.6; e.footLeft = S.footT; c.say('HE GATHERS HIMSELF', '#ffd36b'); } return; }
  if (e.mode === 'ride') {
    if (e.unsaddle) { e.unsaddle = false; e.mounted = false; e.mode = 'unsaddled'; e.modeT = S.openT; e.open = S.openT; e.horseX = e.x; e.horseV = e.face * S.rideV * 0.7;
      c.say('OUT OF THE SADDLE: HE IS OPEN', '#8fd160'); c.sound('heavy'); c.sound('snort'); c.shake(5); return; }
    e.x = clamp(e.x + e.face * S.rideV * dt, A.x0 + 24, A.x1 - 24); e.vx = e.face * S.rideV;
    if (!e.rideHit && !P.dead && Math.abs(P.x - e.x) < S.rideHit && P.y > floor - 30) { e.rideHit = true; c.hit(e.x, UNB.dmg.brRide, true, 'THE RIDE-THROUGH'); }
    if (e.modeT <= 0 || e.x <= A.x0 + 24 || e.x >= A.x1 - 24) { e.mode = 'wheel'; e.modeT = 0.7; c.shake(3); c.sound('heavy'); }
    return; }
  if (e.mode === 'drawBack') { const wall = e.face > 0 ? A.x0 + 30 : A.x1 - 30; e.x += Math.sign(wall - e.x) * 150 * dt; e.vx = Math.sign(wall - e.x) * 150;
    if (Math.abs(wall - e.x) < 6 || e.modeT <= 0) begin2(e, 'ride', c); return; }
  if (e.mode === 'thrust') { if (e.modeT > 0.18) { const nx = e.x + e.face * 60 * dt; if (nx > A.x0 + 20 && nx < A.x1 - 20) e.x = nx; } }
  if (e.mode === 'trample' || e.mode === 'fire' || e.mode === 'lance' || e.mode === 'thrust' || e.mode === 'wheel' || e.mode === 'rest') { if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = e.phase === 2 ? S.cdP2 : S.cd; } return; }
  if (e.mode === 'remountTell') {
    const tgt = e.x, k = Math.min(1, dt / Math.max(dt, e.modeT)); e.bonesX += (tgt - e.bonesX) * k;
    if (c.struck(e.bonesX - 12, floor - 10, 24, 10, e.boneKey ??= {})) { e.boneHits = (e.boneHits || 0) + 1; c.sound('crack');
      if (e.boneHits >= S.boneHits) { e.mode = 'scattered'; e.modeT = S.openT; e.open = S.openT; e.bonesX = e.face > 0 ? A.x0 + 40 : A.x1 - 40; e.boneHits = 0; c.say('THE BONES SCATTER: HE IS OPEN', '#8fd160'); c.sound('heavy'); c.shake(5); return; }
      c.say('THE BONES SCATTER', '#8fd160'); }
    if (e.modeT <= 0) { e.mounted = true; e.mountLeft = S.mountMoves; e.mode = 'stalk'; e.cd = 0.6; e.bonesX = null; c.say('HE IS BACK IN THE SADDLE', '#ff6b6b'); c.sound('snort'); }
    return; }
  if (tells(e)) {
    if (e.mode !== 'rideTell' && e.mode !== 'lanceTell') e.face = Math.sign(P.x - e.x) || e.face;
    if (e.modeT > 0) return;
    const f = (P.x - e.x) * e.face;
    if (e.mode === 'rideTell') { e.mode = 'ride'; e.modeT = 3; e.rideHit = false; c.sound('gallop'); c.sound('charge'); return; }
    if (e.mode === 'trampleTell') { e.mode = 'trample'; e.modeT = 0.35; c.sound('heavy'); c.shake(4); c.ring(e.x, floor - 4, S.trampleR, '#ffd36b');
      if (!P.dead && Math.abs(P.x - e.x) < S.trampleR && P.y > floor - 26) c.hit(e.x, UNB.dmg.brTrample, false, 'THE REARING TRAMPLE'); return; }
    if (e.mode === 'fireTell') { e.mode = 'fire'; e.modeT = 0.4; c.sound('whoosh');
      /* SLOW: each is thrown to come down at chest height a second and a half later - one where you stand, one a stride past you, and
         in phase two one a stride short. Standing still, one finds you; the shield turns it; walking out from under them turns all */
      const n = e.phase === 2 ? S.boltsP2 : S.bolts, sx = e.x + e.face * 8, sy = floor - (e.mounted ? 46 : 26), T = S.boltT;
      for (let i = 0; i < n; i++) { const tx = clamp(P.x + [0, 28, -28][i] * e.face, A.x0 + 8, A.x1 - 8); e.bolts.push({ x: sx, y: sy, vx: (tx - sx) / T, vy: ((Math.min(P.y, floor) - 12) - sy - 70 * T * T) / T }); }
      return; }
    if (e.mode === 'lanceTell') { e.mode = 'lance'; e.modeT = S.lanceN * S.lanceGap + 0.5; e.lanceHit = false; c.sound('plant'); c.shake(3); e.lances = e.lanceAt.map((x, k) => ({ x, t: k * S.lanceGap, up: false })); return; }
    if (e.mode === 'thrustTell') { e.mode = 'thrust'; e.modeT = 0.3; c.sound('slash'); if (!P.dead && f > -6 && f < S.thrustR && P.y > floor - 30) c.hit(e.x, UNB.dmg.brThrust, false, 'THE BANNER THRUST'); return; }
  }
  /* STALKING: mounted he keeps a lance's length off you, on foot a pole's */
  const d = P.x - e.x, ad = Math.abs(d); e.face = Math.sign(d) || e.face;
  const keep = e.mounted ? S.keep : S.footKeep, sp = e.mounted ? S.walk : S.footWalk;
  const want = ad > keep ? e.face : ad < keep - 24 && e.mounted ? -e.face : 0, nx = e.x + want * sp * dt; if (nx > A.x0 + 20 && nx < A.x1 - 20) e.x = nx; e.vx = want * sp;
  if (!e.mounted && e.phase === 2 && e.footLeft <= 0 && e.cd <= 0 && !P.dead) { beginBR(e, 'remount', c); return; }
  if (e.cd > 0 || P.dead) return;
  if (e.mounted && e.phase === 2) { e.mountLeft = (e.mountLeft ?? S.mountMoves) - 1; if (e.mountLeft < 0) { brCollapse(e, c); return; } }
  const order = e.mounted ? S.order : S.orderFoot;
  let what = order[e.turn++ % order.length];
  if (what === 'trample' && ad > S.trampleR + 50) what = 'fire';
  if (e.mounted && ad < S.trampleR) what = 'trample';   /* UNDER HIM is where the trample is for: stand there and it is what comes */
  if (what === 'thrust' && ad > S.thrustR + 40) what = 'lance';
  beginBR(e, what, c);
}
function begin2(e, what, c) { const { P } = c; e.mode = BR_TELL[what]; e.modeT = UNB.br.tell[what]; if (what !== 'ride') e.face = Math.sign(P.x - e.x) || e.face || 1;
  if (what === 'lance') { const S = UNB.br, A = c.A, at = []; for (let k = 1; k <= S.lanceN; k++) { const x = e.x + e.face * (18 + k * S.lanceStep); if (x < A.x0 + 8 || x > A.x1 - 8) break; at.push(x); } e.lanceAt = at; }
  if (what === 'remount') { e.bonesX ??= e.face > 0 ? c.A.x0 + 40 : c.A.x1 - 40; e.boneHits = 0; e.boneKey = {}; }
  c.say(BR_SAY[e.mode], what === 'ride' || what === 'lance' ? '#ff6b6b' : what === 'remount' ? '#c8b6ff' : '#ffd36b'); c.sound(BR_SND[e.mode]); }
function beginBR(e, what, c) { const { P, A } = c;
  /* THE RIDE-THROUGH is the arena's length: he draws back to the wall behind him first (no tell: he is only riding), then paws */
  if (what === 'ride') { e.face = Math.sign(P.x - e.x) || e.face || 1; const wall = e.face > 0 ? A.x0 + 30 : A.x1 - 30;
    if (Math.abs(wall - e.x) > 12) { e.mode = 'drawBack'; e.modeT = 3; return; } }
  begin2(e, what, c); }
export const brForce = (e, what, c) => { if (what === 'ride') e.face = Math.sign(c.P.x - e.x) || e.face || 1; begin2(e, what, c); };   /* for the harness: A3, every attack forced (the ride straight to its tell) */
/* MOUNTED 0 idle | 1,2 walk | 3 ride tell | 4,5 gallop | 6 rear (trample tell) | 7 trample | 8 fire tell | 9 fire | 10 lance tell | 11 lance | 12 hurt
   ON FOOT 13 idle | 14,15 walk | 16 thrust tell | 17 thrust | 18 lance tell | 19 lance | 20 open (on a knee) | 21 remount (calling his bones) | 22 hurt | 23 the horse falling apart */
export function brFrame(e) {
  const m = e.mode;
  if (m === 'collapse') return 23;
  if (e.mounted) { switch (m) { case 'rideTell': return 3; case 'ride': return 4 + Math.floor((e.anim || 0) * 10) % 2; case 'trampleTell': return 6; case 'trample': return 7; case 'fireTell': return 8; case 'fire': return 9; case 'lanceTell': return 10; case 'lance': return 11; case 'sleep': case 'wake': return 0; }
    if (e.hurtT > 0) return 12; return Math.abs(e.vx || 0) > 3 ? 1 + Math.floor((e.anim || 0) * 6) % 2 : 0; }
  switch (m) { case 'thrustTell': return 16; case 'thrust': return 17; case 'lanceTell': return 18; case 'lance': return 19; case 'unsaddled': case 'scattered': case 'mountUp': return 20; case 'remountTell': return 21; }
  if (e.hurtT > 0) return 22;
  return Math.abs(e.vx || 0) > 3 ? 14 + Math.floor((e.anim || 0) * 5) % 2 : 13;
}

/* ---------------- THE FIRST DEATH KNIGHT (boss) ---------------- */
/* HE FIGHTS WITH THE KIT THE CLASS INHERITS (Daniel, 24 Sept: "the First Death Knight fights with the Death Knight hero's kit").
   Every move is one of the playable Death Knight's, boss-sized; the scythe stays (the polish lane's silhouette), so a greatsword
   blow is a scythe blow here. The hero's own rule is his opening: a FULL ward struck again BREAKS. */
const DK_TELL = { cleave: 'cleaveTell', grip: 'gripTell', boil: 'boilTell', pass: 'passTell', ward: 'wardTell', raise: 'raiseTell', call: 'callTell', surge: 'surgeTell' };
const DK_SAY = { cleaveTell: 'THE CLEAVE: GUARD', gripTell: 'DEATH GRIP: JUMP THE CHAIN', boilTell: 'BLOOD BOIL: STEP OUT', passTell: 'THE LONG PASSING: JUMP IT', wardTell: 'BLOOD WARD: BREAK IT', novaTell: 'BLOOD NOVA: JUMP IT',
  raiseTell: 'SUMMON SKELETON', callTell: 'GRAVECALL', surgeTell: 'BLOOD SURGE: GET AWAY' };
const DK_SND = { cleaveTell: 'charge', gripTell: 'crank', boilTell: 'fire', passTell: 'pass', wardTell: 'plant', novaTell: 'roar', raiseTell: 'rise', callTell: 'horn', surgeTell: 'pass' };
const DK_COL = { cleaveTell: '#ffd36b', raiseTell: '#c8b6ff', callTell: '#c8b6ff', wardTell: '#8fd160' };
export const dkOpen = e => e.mode === 'open';
/* A BLOW ON HIM. While the ward stands it takes the blow and keeps it (the hero's ward: a blow on its face is stopped and FILLS
   it); a FULL ward struck again BREAKS, and he reels. Returns the damage that reaches him. */
export function dkHurt(e, dmg) {
  if (e.mode === 'ward') { if ((e.wardFill || 0) >= UNB.dk.wardFull) { e.wardBroke = true; return 0; } e.wardFill = (e.wardFill || 0) + 1; e.wardEvt = 'fill'; return 0; }
  return dkOpen(e) ? Math.round(dmg * UNB.dk.openMul) : dmg;
}
export function updateDeathKnight(e, dt, c) {
  const { P, A } = c, D = UNB.dk, floor = A.floor;
  if (!e.alive || e.mode === 'sleep') return;
  e.modeT -= dt; e.cd = (e.cd ?? 1) - dt; e.turn ??= 0; e.pools ??= []; e.y = floor; e.vx = 0;
  e.open = dkOpen(e) ? Math.max(0, e.modeT) : 0;
  /* BLOOD BOIL: each pool cuts whoever stands in it, every half second, until it cools */
  for (const p of e.pools) { p.t -= dt; p.tick -= dt; if (p.tick <= 0) { p.tick = D.boilTick; if (!P.dead && Math.abs(P.x - p.x) < D.boilR && P.y > floor - 20) c.hit(p.x, UNB.dmg.boil, true, 'BLOOD BOIL'); } }
  e.pools = e.pools.filter(p => p.t > 0);
  if (e.phase !== 2 && e.hp <= e.maxHp * 0.5 && !tells(e) && e.mode !== 'pass' && e.mode !== 'grip' && e.mode !== 'ward' && e.mode !== 'open') { e.phase = 2; e.mode = 'rally'; e.modeT = 1.4; e.turn = 0; c.say('HE IS THE BANNER NOW: WHAT FALLS HERE GETS UP', '#ff6b6b'); c.sound('horn'); return; }
  if (e.mode === 'wake' || e.mode === 'rally') { if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = 0.6; } return; }
  if (e.mode === 'open') { if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = 0.7; c.say('HE TAKES UP THE SCYTHE', '#ffd36b'); } return; }
  /* THE WARD STANDS: it keeps what it is given; FULL and struck again it breaks (A11); left alone, he lets go and the nova pays it out */
  if (e.mode === 'ward') {
    if (e.wardBroke) { e.wardBroke = false; e.mode = 'open'; e.modeT = D.openT; e.open = D.openT; c.say('THE WARD BREAKS: HE IS OPEN', '#8fd160'); c.sound('crack'); c.sound('heavy'); c.shake(6); return; }
    if (e.wardEvt) { e.wardEvt = null; c.sound('crank'); if (e.wardFill >= D.wardFull) c.say('THE WARD IS FULL: STRIKE IT AGAIN', '#8fd160'); }
    if (e.modeT <= 0) { e.mode = 'novaTell'; e.modeT = D.tell.nova; c.say(DK_SAY.novaTell, '#ff6b6b'); c.sound(DK_SND.novaTell); }
    return; }
  if (e.mode === 'grip') {   /* the chain runs out along the floor; what it catches it brings to his feet, and the cleave follows */
    e.chainX += e.face * D.chainV * dt;
    if (!P.dead && (P.x - e.x) * e.face > 0 && (P.x - e.chainX) * e.face <= 0 && P.y > floor - 26 && Math.abs(P.x - e.x) <= D.gripR) { c.hit(e.x, UNB.dmg.grip, true, 'DEATH GRIP'); c.sound('crank');
      P.x = e.x + e.face * 26; e.mode = 'cleaveTell'; e.modeT = D.tell.cleaveAfter; c.say('COME HERE', '#8fd160'); return; }
    if (Math.abs(e.chainX - e.x) >= D.gripR || e.modeT <= 0) { e.mode = 'rest'; e.modeT = 0.5; }
    return; }
  if (e.mode === 'pass') { const k = 1 - clamp(e.modeT / D.passT, 0, 1), was = e.x; e.x = e.passX0 + (e.passX1 - e.passX0) * k;
    if (!e.passHit && !P.dead && P.y > floor - 30 && (P.x - was) * (P.x - e.x) <= 0) { e.passHit = true; c.hit(e.x, UNB.dmg.pass, true, 'THE LONG PASSING'); }
    if (e.modeT <= 0) { e.x = e.passX1; e.mode = 'rest'; e.modeT = 0.7; } return; }
  if (e.mode === 'cleave' || e.mode === 'boil' || e.mode === 'nova' || e.mode === 'raise' || e.mode === 'surge' || e.mode === 'rest') { if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = e.phase === 2 ? D.cdP2 : D.cd; } return; }
  if (tells(e)) {
    if (e.mode !== 'passTell' && e.mode !== 'boilTell' && e.mode !== 'gripTell') e.face = Math.sign(P.x - e.x) || e.face;
    if (e.mode === 'surgeTell') c.pull?.(e.x, D.surgeR + 30, 30, dt);   /* the drain takes a step of you toward him */
    if (e.modeT > 0) return;
    const f = (P.x - e.x) * e.face, ad = Math.abs(P.x - e.x);
    if (e.mode === 'cleaveTell') { e.mode = 'cleave'; e.modeT = 0.35; c.sound('whoosh'); c.shake(3);
      if (!P.dead && f > -8 && f < D.cleaveR && P.y > floor - 40) c.hit(e.x, UNB.dmg.cleave, false, 'THE CLEAVE'); return; }
    if (e.mode === 'gripTell') { e.mode = 'grip'; e.modeT = 1; e.chainX = e.x + e.face * 10; c.sound('whoosh'); return; }
    if (e.mode === 'boilTell') { e.mode = 'boil'; e.modeT = 0.3; e.pools.push({ x: e.boilX, t: D.boilT, tick: 0 }); c.sound('fire'); c.ring(e.boilX, floor - 4, D.boilR, '#ff6b6b'); return; }
    if (e.mode === 'passTell') { e.mode = 'pass'; e.modeT = D.passT; e.passX0 = e.x; e.passHit = false; const side = Math.sign(e.markX - e.x) || e.face; e.passX1 = clamp(e.markX + side * D.passStep, A.x0 + 24, A.x1 - 24); e.face = side; c.sound('pass'); return; }
    if (e.mode === 'wardTell') { e.mode = 'ward'; e.modeT = D.wardT; e.wardFill = 0; e.wardBroke = false; c.sound('plant'); return; }
    if (e.mode === 'novaTell') { const R = D.novaR + D.novaPer * (e.wardFill || 0); e.mode = 'nova'; e.modeT = 0.45; c.sound('boom'); c.shake(4 + (e.wardFill || 0)); c.ring(e.x, floor - 10, R, '#ff6b6b');
      if (!P.dead && ad < R && P.y > floor - 30) c.hit(e.x, UNB.dmg.nova + UNB.dmg.novaPer * (e.wardFill || 0), true, 'BLOOD NOVA');
      for (const q of c.adds(e)) if (Math.abs(q.x - e.x) < R && Math.abs(q.y - floor) < 30) c.cut(q);   /* phase two's rule: his own nova finishes his own dead */
      return; }
    if (e.mode === 'raiseTell' || e.mode === 'callTell') { const call = e.mode === 'callTell'; e.mode = 'raise'; e.modeT = 0.5; c.sound('rise');
      const cap = e.phase === 2 ? D.addsP2 : D.adds, n = Math.min(call ? D.call : D.raise, cap - c.adds(e).filter(q => q.mode !== 'down').length);
      for (let i = 0; i < n; i++) { const side = i % 2 ? -1 : 1, x = clamp(e.x + side * (54 + 34 * (i >> 1)), A.x0 + 30, A.x1 - 30); c.raise(x, floor, e); }
      return; }
    if (e.mode === 'surgeTell') { e.mode = 'surge'; e.modeT = 0.5; c.sound('pass'); c.ring(e.x, floor - 12, D.surgeR, '#ff6b6b');
      if (!P.dead && ad < D.surgeR && P.y > floor - 44) c.hit(e.x, UNB.dmg.surge, true, 'BLOOD SURGE'); return; }
  }
  /* STALKING */
  const d = P.x - e.x, ad = Math.abs(d); e.face = Math.sign(d) || e.face;
  const want = ad > D.keep ? e.face : 0, nx = e.x + want * D.walk * dt; if (nx > A.x0 + 20 && nx < A.x1 - 20) e.x = nx; e.vx = want * D.walk;
  if (e.cd > 0 || P.dead) return;
  const order = e.phase === 2 ? D.orderP2 : D.order;
  let what = order[e.turn++ % order.length];
  if (what === 'cleave' && ad > D.cleaveR + 30) what = 'grip';
  if (what === 'surge' && ad > D.surgeR + 40) what = 'boil';
  begin(e, what, c);
}
function begin(e, what, c) { const { P, A } = c; e.mode = DK_TELL[what]; e.modeT = UNB.dk.tell[what]; e.face = Math.sign(P.x - e.x) || e.face || 1;
  if (what === 'pass') { e.markX = clamp(P.x, A.x0 + 16, A.x1 - 16); }
  if (what === 'boil') { e.boilX = clamp(P.x, A.x0 + 16, A.x1 - 16); }
  c.say(DK_SAY[e.mode], DK_COL[e.mode] || '#ff6b6b'); c.sound?.(DK_SND[e.mode]); }
export const dkForce = (e, what, c) => begin(e, what, c);   /* for the harness: A3, every attack forced */
/* 0 idle | 1,2 walk | 3 cleave tell | 4 cleave | 5 grip tell | 6 grip | 7 boil tell | 8 passing tell | 9 passing | 10 ward | 11 nova tell |
   12 nova | 13 summon / gravecall | 14 surge tell | 15 open | 16 hurt */
export function dkFrame(e) {
  switch (e.mode) { case 'cleaveTell': return 3; case 'cleave': return 4; case 'gripTell': return 5; case 'grip': return 6; case 'boilTell': case 'boil': return 7; case 'passTell': return 8; case 'pass': return 9;
    case 'wardTell': case 'ward': return 10; case 'novaTell': return 11; case 'nova': return 12; case 'raiseTell': case 'callTell': case 'raise': case 'rally': return 13; case 'surgeTell': case 'surge': return 14; case 'open': return 15; case 'sleep': case 'wake': return 0; }
  if (e.hurtT > 0) return 16;
  return Math.abs(e.vx || 0) > 3 ? 1 + Math.floor((e.anim || 0) * 5) % 2 : 0;
}
/* 0 idle carrying | 1,2 walk | 3 plant tell | 4 guard (planted, pole in hand) | 5 pole tell | 6 pole | 7 hurt */
export function bbFrame(e) {
  if (e.mode === 'plantTell') return 3; if (e.mode === 'poleTell') return 5; if (e.mode === 'pole') return 6;
  if (e.hurtT > 0) return 7;
  if (Math.abs(e.vx || 0) > 3) return 1 + Math.floor((e.anim || 0) * 6) % 2;
  return e.planted ? 4 : 0;
}
/* 0 lying | 1 kneeling (rising) | 2 standing | 3,4 walk | 5 cut tell | 6 cut | 7 hurt */
export function corpseFrame(e) {
  if (e.mode === 'down') return 0; if (e.mode === 'riseTell') return e.modeT > UNB.riseT * 0.45 ? 1 : 2;
  if (e.mode === 'cutTell') return 5; if (e.mode === 'cut') return 6; if (e.hurtT > 0) return 7;
  return Math.abs(e.vx || 0) > 3 ? 3 + Math.floor((e.anim || 0) * 5) % 2 : 2;
}
export const unbFrame = e => e.t === 'deathknight' ? dkFrame(e) : e.t === 'barrowrider' ? brFrame(e) : e.t === 'bannerbearer' ? bbFrame(e) : corpseFrame(e);

/* ---------------- THE BATTLE ROUND YOU: volleys, cover, the cavalry, arrow pegs, the engines ---------------- */
/* F is built once a (re)spawn from the level and its placed props, and stepped every frame with the world's hands in c. */
export function newField(L, TS = 16) {
  if (!L || !L.volleys) return null;
  const G = L.cavalry ? L.cavalry.row : 36;
  const props = (L.ents || []).filter(e => ['cover', 'ballista', 'trebuchet', 'oilbarrel'].includes(e.t)).map(e => ({ t: e.t, kind: e.kind, x: e.x * TS + 8, y: (e.y + 1) * TS, tx: e.x, ty: e.y,
    aim: e.aim ? { x: e.aim[0] * TS + 8, y: (e.aim[1] + 1) * TS } : null, spill: e.spill ? [e.spill[0] * TS, (e.spill[1] + 1) * TS] : null, knocks: e.knocks || null, cd: 0, state: 'ready', t2: 0 }));
  return {
    TS, G,
    volleys: L.volleys.map((v, i) => ({ ...v, t: (i * 2.1) % v.period, quiet: false, warn: false, fell: 0 })),
    cav: L.cavalry ? { ...L.cavalry, t: 0, x: null, warn: false, hitP: false } : null,
    pegs: (L.pegs || []).map(p => ({ ...p, up: 0, zone: null, stray: 0 })),
    covers: props.filter(p => p.t === 'cover'), engines: props.filter(p => p.t !== 'cover'),
    bolts: [], stones: [], arrows: [], breach: false, surf: groundLine(L, G),
  };
}
/* WHERE THE GROUND IS, column by column: the first solid-or-ledge row from above the field down (for the mist to lie on) */
function groundLine(L, G) { const W = L.W, s = new Int16Array(W).fill(-1); if (!L.grid) return s;
  for (let x = 0; x < W; x++) for (let y = G - 8; y < Math.min(L.H, G + 8); y++) { const t = L.grid[y * W + x]; if (t !== 0) { s[x] = t === 3 ? -1 : y; break; } }   /* 3: T.SPIKE - no mist over a stake line, the hazard stays plain */
  return s; }
export const HORN_CAV = 3.0;
/* WHERE AN ARROW CANNOT FIND YOU: behind a cover prop on its own floor, or down in a trench (the low route is sheltered) */
export function sheltered(F, P) {
  const TS = F.TS;
  if (P.y > (F.G + 1) * TS + 20) return true;   /* in a trench: two rows under the field */
  return F.covers.some(cv => Math.abs(P.x - cv.x) < 20 && Math.abs(P.y - cv.y) < 12);
}
export function stepField(F, dt, c) {
  if (!F) return;
  const { P } = c, TS = F.TS;
  for (const p of F.pegs) p.zone = F.volleys.find(v => p.x * TS >= v.x0 && p.x * TS <= v.x1) || null;
  /* THE VOLLEYS: a horn, then the ridge looses across its stretch of field. The stretch goes quiet when its bearer is cut. */
  for (const v of F.volleys) {
    if (!v.quiet && v.bearer && !c.bearerAlive(v.bearer)) { v.quiet = true; c.say(P.x, P.y - 40, 'THAT STRETCH OF RIDGE GOES QUIET', '#c8b6ff'); }
    if (v.quiet) { v.warn = false; continue; }
    const near = P.x > v.x0 - 200 && P.x < v.x1 + 200;
    v.t += dt; const wasWarn = v.warn; v.warn = v.t >= v.period - v.horn && v.t < v.period;
    if (v.warn && !wasWarn && near) { c.sound('horn'); if (P.x > v.x0 && P.x < v.x1) c.say(P.x, P.y - 40, 'A HORN ON THE RIDGE: GET UNDER COVER', '#ff6b6b'); }
    if (v.t >= v.period) { v.t -= v.period; v.fell = 0.6;
      if (near) { c.sound('volley'); for (let i = 0; i < 18; i++) F.arrows.push({ x: clamp(P.x + (Math.random() - 0.5) * 400, v.x0, v.x1), y: P.y - 190 - Math.random() * 60, vy: 420 + Math.random() * 80, t: 0.8 }); }
      if (!P.dead && P.x > v.x0 && P.x < v.x1 && !sheltered(F, P)) c.hurtP(P.x, UNB.dmg.volley, 'THE VOLLEY');
      for (const p of F.pegs) if (p.zone === v && c.wallStands(p)) { p.up = p.life; c.pegs(p, true); } }
    v.fell = Math.max(0, v.fell - dt);
  }
  /* A PEG WALL OUT OF ANY ZONE takes a stray flight on the same rhythm: arrows into the wall, nobody under them */
  for (const p of F.pegs) { if (!p.zone) { p.stray += dt; if (p.stray >= 6) { p.stray = 0; if (Math.abs(P.x - p.x * TS) < 400 && c.wallStands(p)) { c.sound('volley'); p.up = p.life; c.pegs(p, true); } } }
    if (p.up > 0) { p.up -= dt; if (p.up <= 0 || !c.wallStands(p)) { p.up = 0; c.pegs(p, false); } } }
  /* THE GHOST CAVALRY: horns and dust, then a line of riders down the lane - off the ground, or be ridden down */
  const cv = F.cav; if (cv) {
    const inLane = P.x > cv.x0 - 120 && P.x < cv.x1 + 120;
    if (cv.x === null) { if (inLane) { cv.t += dt; const warn = cv.t >= cv.period - HORN_CAV; if (warn && !cv.warn) { c.sound('cavhorn'); c.say(P.x, P.y - 40, 'HORNS AND DUST: GET OFF THE GROUND', '#ff6b6b'); } cv.warn = warn;
        if (cv.t >= cv.period) { cv.t = 0; cv.warn = false; cv.x = cv.x1 + 40; cv.hitP = false; c.sound('gallop'); } } }
    else { cv.x -= 380 * dt;
      if (!cv.hitP && !P.dead && Math.abs(P.x - cv.x) < 20 && P.y > (cv.row + 6) * TS - 20) { cv.hitP = true; c.hurtP(cv.x, UNB.dmg.cavalry, 'THE GHOST CAVALRY'); }
      for (const q of c.foes()) if (q.alive && !q.maxHp && Math.abs(q.x - cv.x) < 16 && q.y > (cv.row + 6) * TS - 20 && !q.cavHit) { q.cavHit = true; c.hurtFoe(q, 30, cv.x + 20); }
      if (cv.x < cv.x0 - 40) { cv.x = null; for (const q of c.foes()) q.cavHit = false; } }
  }
  /* THE ENGINES YOU WORK */
  for (const en of F.engines) {
    en.cd = Math.max(0, en.cd - dt);
    if (en.t === 'ballista' && en.cd <= 0 && c.struck(en.x - 14, en.y - 20, 28, 20, en)) { en.cd = 4; c.sound('bolt');
      const dx = en.aim.x - en.x, dy = en.aim.y - 8 - (en.y - 12), d = Math.hypot(dx, dy) || 1; F.bolts.push({ x: en.x, y: en.y - 12, vx: dx / d * 520, vy: dy / d * 520, t: d / 520 + 0.05, hit: new Set() }); }
    if (en.t === 'trebuchet') { if (en.state === 'ready' && c.struck(en.x - 18, en.y - 36, 36, 36, en)) { en.state = 'wind'; en.t2 = 1.0; c.sound('crank'); c.say(en.x, en.y - 50, 'THE COUNTERWEIGHT DROPS', '#ffd36b'); }
      else if (en.state === 'wind') { en.t2 -= dt; if (en.t2 <= 0) { en.state = 'spent'; const T = 1.4; F.stones.push({ x: en.x, y: en.y - 40, vx: (en.aim.x - en.x) / T, vy: (en.aim.y - (en.y - 40) - 0.5 * 400 * T * T) / T, t: T, knocks: en.knocks }); c.sound('whoosh'); } } }
    if (en.t === 'oilbarrel') { if (en.state === 'ready' && c.struck(en.x - 9, en.y - 16, 18, 16, en)) { en.state = 'tip'; en.t2 = 0.6; c.say(en.x, en.y - 30, 'THE PITCH SPILLS', '#ff9a5c'); c.sound('crack'); }
      else if (en.state === 'tip') { en.t2 -= dt; if (en.t2 <= 0) { en.state = 'spent'; c.spill(en.spill[0], en.spill[1], en.y); c.sound('fire'); } } }
  }
  for (const b of F.bolts) { b.x += b.vx * dt; b.y += b.vy * dt; b.t -= dt;
    for (const q of c.foes()) if (q.alive && !b.hit.has(q) && Math.abs(q.x - b.x) < 12 && q.y > b.y - 6 && q.y - (q.h || 16) < b.y + 6) { b.hit.add(q); c.hurtFoe(q, q.maxHp ? 30 : 60, b.x - Math.sign(b.vx) * 10); } }
  F.bolts = F.bolts.filter(b => b.t > 0);
  for (const s of F.stones) { s.vy += 400 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.t -= dt; if (s.t <= 0 && !s.done) { s.done = true; if (s.knocks === 'tower') { F.breach = true; c.breach(); } } }
  F.stones = F.stones.filter(s => s.t > -0.1);
  for (const a of F.arrows) { a.y += a.vy * dt; a.t -= dt; } F.arrows = F.arrows.filter(a => a.t > 0);
}

/* ---------------- DRAWING (the world's parts; the creatures are sprites) ---------------- */
/* THE BARROW RIDER'S WORLD: the lane his ride will take, the lances coming and standing, his grave-fire, the horse that threw him,
   and the bones of it on the floor - crawling back to him in phase two, outlined green, because that is the window */
let HORSE_ART = null;
function drawRiderWorld(g, e, x, fy, cx, cy, time) {
  const A = e.arenaX, f = e.face || 1;
  if (e.mode === 'rideTell' || e.mode === 'drawBack') { const k = 0.5 + 0.5 * Math.sin(time * 20); g.globalAlpha = (e.mode === 'rideTell' ? 0.22 : 0.08) + 0.14 * k; g.fillStyle = '#ff6b6b';
    const x1 = A ? Math.round((f > 0 ? A[1] : A[0]) - cx) : (f > 0 ? x + 400 : x - 400); g.fillRect(Math.min(x, x1), fy - 30, Math.abs(x1 - x), 30); g.globalAlpha = 1; }
  if (e.mode === 'lanceTell') for (const lx of e.lanceAt || []) { const sx = Math.round(lx - cx), k = 0.5 + 0.5 * Math.sin(time * 18 + lx); g.globalAlpha = 0.35 + 0.4 * k; R(g, sx - 4, fy - 2, 9, 2, '#ff6b6b'); R(g, sx - 1, fy - 6, 3, 4, '#ff6b6b'); g.globalAlpha = 1; }
  for (const l of e.lances || []) { if (!l.up) continue; const sx = Math.round(l.x - cx), h = Math.round(34 * Math.min(1, (0.45 - l.life) / 0.08 + 0.2));
    g.globalAlpha = 0.85; R(g, sx - 1, fy - h, 2, h, '#c8d6ff'); R(g, sx - 3, fy - h - 4, 6, 4, '#e8eeff'); R(g, sx, fy - h - 7, 1, 3, '#ffffff'); g.globalAlpha = 1; }
  for (const b of e.bolts || []) { const bx = Math.round(b.x - cx), by = Math.round(b.y - cy); R(g, bx - 3, by - 3, 6, 6, '#4fa87c'); R(g, bx - 2, by - 2, 4, 4, '#9ff0c0'); R(g, bx - 1, by - 1, 2, 2, '#efffe0');
    g.globalAlpha = 0.5; R(g, bx - 3 - Math.sign(b.vx) * 5, by - 1, 4, 2, '#9ff0c0'); g.globalAlpha = 1; }
  if (!e.mounted && e.horseX !== null && e.horseX !== undefined && (e.mode === 'unsaddled' || e.mode === 'mountUp') && HORSE_ART) { const hs = HORSE_ART, fr = Math.floor(time * 10) % 2, img = (e.horseV || e.face) >= 0 ? hs.R[fr] : hs.L[fr];
    g.globalAlpha = 0.85; g.drawImage(img, Math.round(e.horseX - cx) - hs.ax, fy - hs.ay); g.globalAlpha = 1; }
  if (!e.mounted && e.bonesX !== null && e.bonesX !== undefined && e.mode !== 'collapse') { const bx = Math.round(e.bonesX - cx), crawl = e.mode === 'remountTell';
    for (let i = 0; i < 7; i++) { const ox = (i - 3) * (crawl ? 3 : 5) + (crawl ? Math.round(Math.sin(time * 14 + i) * 2) : 0); R(g, bx + ox - 2, fy - 3 - (i % 3), 5, 2, '#e4e8f0'); }
    R(g, bx + 8, fy - 6, 5, 4, '#e4e8f0'); R(g, bx + 10, fy - 5, 1, 1, '#9ff0c0');   /* the skull */
    if (crawl) { const k = 0.5 + 0.5 * Math.sin(time * 10); g.globalAlpha = 0.35 + 0.35 * k; g.strokeStyle = '#8fd160'; g.lineWidth = 1; g.strokeRect(bx - 13, fy - 11, 26, 11); g.globalAlpha = 1;
      for (let i = 0; i < (e.boneHits || 0); i++) R(g, bx - 4 + i * 5, fy - 16, 3, 3, '#8fd160');
      g.globalAlpha = 0.4; for (let i = 0; i < 4; i++) R(g, bx + Math.round((x - bx) * (i + 1) / 5), fy - 2, 3, 1, '#9ff0c0'); g.globalAlpha = 1; } }
  if (brOpen(e)) { const k = 0.5 + 0.5 * Math.sin(time * 10); g.globalAlpha = 0.35 + 0.35 * k; g.strokeStyle = '#8fd160'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, fy - 2, 20 + k * 3, 6, 0, 0, 7); g.stroke(); g.globalAlpha = 1; }
}
export function setHorseArt(h) { HORSE_ART = h; }
const R = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
/* a torn battle standard on its pole, foot at (x, y): the thing the whole level is about, so it is the loudest colour on the field */
export function drawStandard(g, x, y, time, big, torn) {
  const hgt = big ? 60 : 40, fw = big ? 22 : 14, fh = big ? 16 : 11, top = y - hgt, wave = Math.sin(time * 5 + x) * 1.5;
  R(g, x - 1, top, 2, hgt, '#4a3222'); R(g, x - 2, top - 3, 4, 3, '#d8b04a');
  if (torn) { R(g, x + 1, top + 6, 6, 4, '#7a1e24'); return; }
  for (let i = 0; i < fw; i++) { const k = i / fw, dy = Math.round(Math.sin(time * 6 + i * 0.5) * 1.5 * k + wave * k); R(g, x + 1 + i, top + 2 + dy, 1, fh - (i > fw - 4 ? (i % 2) * 3 : 0), i % 5 === 0 ? '#a8342c' : '#8e2a26'); }
  R(g, x + 3, top + 4 + Math.round(wave * 0.3), Math.min(6, fw - 6), 2, '#e8c35a'); R(g, x + 5, top + 7, 2, 4, '#e8c35a');   /* the order's gold mark */
}
export function drawUnbWorld(g, foes, cx, cy, time) {
  for (const e of foes) {
    if (!e.alive) continue;
    const x = Math.round(e.x - cx), fy = Math.round(e.y - cy);
    if (e.t === 'bannerbearer' && e.planted) { const fx = Math.round(e.flagX - cx);
      g.globalAlpha = 0.14 + 0.06 * Math.sin(time * 3); g.fillStyle = '#b07cf0'; g.fillRect(fx - UNB.bannerR, fy - 2, UNB.bannerR * 2, 2); g.globalAlpha = 1;   /* the ground its standard holds */
      drawStandard(g, fx, fy, time, false, false); }
    if (e.t === 'barrowrider') drawRiderWorld(g, e, x, fy, cx, cy, time);
    if (e.t === 'corpse' && e.mode === 'riseTell') { for (let i = 0; i < 3; i++) R(g, x - 8 + i * 7 + Math.round(Math.sin(time * 14 + i) * 2), fy - 3 - ((time * 30 + i * 5) % 8), 2, 2, '#c8b6ff'); }
    if (e.t === 'deathknight') { const D = UNB.dk, f = e.face || 1, k = 0.5 + 0.5 * Math.sin(time * 12);
      /* BLOOD BOIL: where it will come up (bubbles, red), and the pools while they boil */
      if (e.mode === 'boilTell' && Number.isFinite(e.boilX)) { const bx = Math.round(e.boilX - cx); g.globalAlpha = 0.3 + 0.4 * k; g.strokeStyle = '#ff6b6b'; g.lineWidth = 2; g.beginPath(); g.ellipse(bx, fy - 2, D.boilR, 5, 0, 0, 7); g.stroke(); g.globalAlpha = 1;
        for (let i = 0; i < 4; i++) R(g, bx - 20 + i * 12, fy - 3 - ((time * 40 + i * 7) % 8), 2, 2, '#c0283a'); }
      for (const p of e.pools || []) { const bx = Math.round(p.x - cx); g.globalAlpha = 0.55; g.fillStyle = '#8a1020'; g.beginPath(); g.ellipse(bx, fy - 1, D.boilR, 4, 0, 0, 7); g.fill(); g.globalAlpha = 1;
        for (let i = 0; i < 6; i++) { const h = (time * 30 + i * 11) % 10; R(g, bx - D.boilR + 6 + i * 9, fy - 2 - h, 2, 2, i % 2 ? '#ff6b6b' : '#c0283a'); } }
      /* DEATH GRIP: the line the chain will run, then the chain of runes itself */
      if (e.mode === 'gripTell') { g.globalAlpha = 0.25 + 0.3 * k; R(g, f > 0 ? x : x - D.gripR, fy - 6, D.gripR, 4, '#ff6b6b'); g.globalAlpha = 1; }
      if (e.mode === 'grip' && Number.isFinite(e.chainX)) { const x1 = Math.round(e.chainX - cx); for (let q = Math.min(x, x1); q < Math.max(x, x1); q += 5) R(g, q, fy - 6 + ((q >> 2) % 2), 3, 2, (q >> 2) % 2 ? '#8fd160' : '#dfffa0'); }
      /* THE LONG PASSING: the lane he will cross */
      if (e.mode === 'passTell' && Number.isFinite(e.markX)) { const x1 = Math.round(e.markX - cx + Math.sign(e.markX - e.x || f) * D.passStep); g.globalAlpha = 0.18 + 0.2 * k; R(g, Math.min(x, x1), fy - 30, Math.abs(x1 - x), 30, '#ff6b6b'); g.globalAlpha = 1; }
      /* BLOOD WARD: the crimson ward in front of him, a pip for every blow it has kept - and FULL, it is outlined green: the window */
      if (e.mode === 'wardTell' || e.mode === 'ward') { const wx = x + f * 18, full = (e.wardFill || 0) >= D.wardFull;
        g.globalAlpha = 0.35 + 0.1 * (e.wardFill || 0); g.fillStyle = '#c0283a'; g.fillRect(wx - 4, fy - 50, 8, 48); g.globalAlpha = 0.8; g.fillStyle = '#ff6b6b'; g.fillRect(wx - 4, fy - 50, 8, 2); g.fillRect(f > 0 ? wx + 3 : wx - 4, fy - 50, 1, 48); g.globalAlpha = 1;
        for (let i = 0; i < D.wardFull; i++) R(g, wx - 6 + i * 5, fy - 58, 3, 3, i < (e.wardFill || 0) ? '#ff6b6b' : '#3a1418');
        if (full) { g.globalAlpha = 0.45 + 0.4 * k; g.strokeStyle = '#8fd160'; g.lineWidth = 1; g.strokeRect(wx - 6, fy - 52, 12, 52); g.globalAlpha = 1; } }
      /* BLOOD NOVA and BLOOD SURGE: the ring they will reach, drawing in */
      if (e.mode === 'novaTell') { const r = D.novaR + D.novaPer * (e.wardFill || 0), t = 1 - Math.max(0, e.modeT) / D.tell.nova; g.globalAlpha = 0.25 + 0.4 * t; g.strokeStyle = '#ff6b6b'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, fy - 4, r, 9, 0, 0, 7); g.stroke(); g.globalAlpha = 1; }
      if (e.mode === 'surgeTell') { const t = 1 - Math.max(0, e.modeT) / D.tell.surge; g.globalAlpha = 0.2 + 0.4 * t; g.strokeStyle = '#ff6b6b'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, fy - 12, D.surgeR, 14, 0, 0, 7); g.stroke(); g.globalAlpha = 1;
        for (let i = 0; i < 6; i++) { const a = time * 3 + i, rr = D.surgeR * (1 - ((time * 0.8 + i / 6) % 1)); R(g, x + Math.cos(a) * rr, fy - 12 + Math.sin(a) * 8, 2, 2, '#c0283a'); } }
      if (e.mode === 'open') { const k = 0.5 + 0.5 * Math.sin(time * 10); g.globalAlpha = 0.35 + 0.35 * k; g.strokeStyle = '#8fd160'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, fy - 2, 26 + k * 3, 7, 0, 0, 7); g.stroke(); g.globalAlpha = 1; }
    }
  }
}
export function drawField(g, F, cx, cy, time, VW, VH) {
  if (!F) return; const TS = F.TS;
  /* LOW GROUND MIST (the rework, 2026-09-24): a band along the ground's own line, pooling in trenches and craters. It is drawn here,
     under the creatures and their marks, and it never lies over a stake line - readability first, weather second */
  if (F.surf) { const G = F.G, x0 = Math.max(0, Math.floor(cx / TS)), x1 = Math.min(F.surf.length - 1, Math.ceil((cx + VW) / TS));
    for (let tx = x0; tx <= x1; tx++) { const r = F.surf[tx]; if (r < 0) continue; const deep = Math.max(0, r - (G + 1)), sx = tx * TS - cx, top = r * TS - cy;
      for (let q = 0; q < TS; q += 4) { const n = 0.5 + 0.5 * Math.sin((tx * TS + q) * 0.07 + time * 0.6) * Math.sin((tx * TS + q) * 0.023 - time * 0.35);
        g.globalAlpha = 0.07 + 0.07 * n; R(g, sx + q, top - 6 - Math.round(n * 3), 4, 6 + Math.round(n * 3), '#b8aec4');
        if (deep) { g.globalAlpha = 0.09 + 0.05 * n; R(g, sx + q, top - deep * TS, 4, deep * TS, '#a89cb6'); } } }
    g.globalAlpha = 1; }
  /* THE GHOST ARMY on the ridge, over every stretch that is still fighting - and nothing over the ones you have ended */
  for (const v of F.volleys) { if (v.quiet) continue; const x0 = Math.max(0, v.x0 - cx), x1 = Math.min(VW, v.x1 - cx); if (x1 <= x0) continue;
    const ry = Math.round((F.G - 13) * TS - cy * 0.6);
    g.globalAlpha = 0.16; for (let x = x0 - ((cx * 0.4) % 9); x < x1; x += 9) { const b = Math.round(Math.sin(time * 2 + x) * 1); R(g, x, ry + b, 3, 8, '#c8b6ff'); R(g, x, ry - 3 + b, 3, 3, '#c8b6ff'); if ((x | 0) % 27 === 0) R(g, x + 1, ry - 12, 1, 10, '#c8b6ff'); }
    g.globalAlpha = 1;
    if (v.warn) { const k = 0.5 + 0.5 * Math.sin(time * 16); g.globalAlpha = 0.07 + 0.08 * k; R(g, x0, 0, x1 - x0, VH, '#ff6b6b'); g.globalAlpha = 1;
      /* C5: the escape, lit from inside the danger - every cover prop in reach glows */
      for (const cv of F.covers) { const sx = cv.x - cx; if (sx < x0 - 20 || sx > x1 + 20) continue; g.globalAlpha = 0.5 + 0.4 * k; g.strokeStyle = '#8fd160'; g.lineWidth = 1; g.strokeRect(Math.round(sx) - 14, Math.round(cv.y - cy) - 26, 28, 26); R(g, sx - 1, cv.y - cy - 34 - k * 3, 3, 5, '#8fd160'); g.globalAlpha = 1; } } }
  for (const a of F.arrows) { const x = Math.round(a.x - cx), y = Math.round(a.y - cy); R(g, x, y - 7, 1, 7, '#5a4a36'); R(g, x - 1, y - 8, 3, 2, '#c8b6ff'); }
  /* COVER: shields, wagons, mantlets */
  for (const cv of F.covers) { const x = Math.round(cv.x - cx), y = Math.round(cv.y - cy); if (x < -40 || x > VW + 40) continue;
    if (cv.kind === 'wagon') { R(g, x - 14, y - 18, 28, 12, '#5a3e26'); R(g, x - 14, y - 18, 28, 2, '#7a5634'); R(g, x - 10, y - 8, 7, 7, '#2e2016'); R(g, x + 4, y - 8, 7, 7, '#2e2016'); R(g, x - 8, y - 6, 3, 3, '#7a5634'); R(g, x + 6, y - 6, 3, 3, '#7a5634'); }
    else if (cv.kind === 'mantlet') { R(g, x - 12, y - 24, 24, 22, '#6a4a2c'); for (let q = -10; q < 12; q += 5) R(g, x + q, y - 24, 1, 22, '#3e2a18'); R(g, x - 12, y - 25, 24, 2, '#8a6a44'); R(g, x - 10, y - 3, 3, 3, '#3e2a18'); R(g, x + 7, y - 3, 3, 3, '#3e2a18'); }
    else { for (let q = 0; q < 3; q++) { const sx = x - 12 + q * 8; R(g, sx, y - 16 + (q % 2) * 2, 8, 14, q % 2 ? '#7a6a58' : '#6a5a48'); R(g, sx + 3, y - 11 + (q % 2) * 2, 2, 4, '#c8a44a'); } }   /* upturned shields */
  }
  /* PEGS: the arrows standing in the palisade, going out in the last second */
  for (const p of F.pegs) { if (!(p.up > 0)) continue; const x = Math.round(p.x * TS - cx), blink = p.up < 1 && Math.floor(time * 14) % 2;
    if (blink) continue; for (const r of p.rows) { const y = Math.round(r * TS - cy); for (let k = 0; k < 3; k++) { R(g, x - 13 + k * 4, y + k % 2, 12 - k * 3, 2, '#6a5236'); R(g, x - 15 + k * 4, y - 1 + k % 2, 3, 3, '#c8b6ff'); } } }
  /* THE CAVALRY: the lane marked while the horns blow, and the riders */
  const cv = F.cav; if (cv) { const ly = Math.round((cv.row + 6) * TS - cy);
    if (cv.warn || cv.x !== null) { const k = 0.5 + 0.5 * Math.sin(time * 18); g.globalAlpha = 0.18 + 0.2 * k; R(g, cv.x0 - cx, ly - 22, cv.x1 - cv.x0, 22, '#ff6b6b'); g.globalAlpha = 1;
      if (cv.warn) { const dx = Math.min(VW - 20, cv.x1 - cx); for (let i = 0; i < 6; i++) { g.globalAlpha = 0.5; R(g, dx - i * 8 + Math.sin(time * 9 + i) * 3, ly - 8 - (i % 3) * 5, 6, 4, '#c9b27c'); } g.globalAlpha = 1;
        text2(g, '!!', Math.max(20, Math.min(VW - 20, cv.x1 - cx - 30)), ly - 40, '#ff6b6b'); } }
    if (cv.x !== null) { const x = Math.round(cv.x - cx); for (let i = 0; i < 5; i++) { const hx = x + i * 26, b = Math.round(Math.sin(time * 26 + i) * 2);
        g.globalAlpha = 0.55; R(g, hx - 10, ly - 16 + b, 22, 9, '#c8d6ff'); R(g, hx - 13, ly - 20 + b, 6, 6, '#c8d6ff'); R(g, hx - 8, ly - 7 + b, 2, 7, '#c8d6ff'); R(g, hx + 8, ly - 7 - b, 2, 7, '#c8d6ff'); R(g, hx + 1, ly - 28 + b, 5, 12, '#e8eeff'); R(g, hx - 8, ly - 30 + b, 20, 1, '#e8eeff'); g.globalAlpha = 1; } } }
  /* THE ENGINES */
  for (const en of F.engines) { const x = Math.round(en.x - cx), y = Math.round(en.y - cy); if (x < -60 || x > VW + 60) continue;
    if (en.t === 'ballista') { R(g, x - 12, y - 8, 24, 8, '#4a3222'); R(g, x - 3, y - 16, 6, 8, '#5a3e26'); R(g, x - 14, y - 18, 28, 3, '#6a4a2c'); R(g, x - 1, y - 20, 16, 2, en.cd > 0 ? '#3a2a1a' : '#c8c8d0');
      if (en.cd <= 0) { g.globalAlpha = 0.25; g.strokeStyle = '#ffd36b'; g.setLineDash([3, 4]); g.beginPath(); g.moveTo(x, y - 12); g.lineTo(Math.round(en.aim.x - cx), Math.round(en.aim.y - 8 - cy)); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; } }
    if (en.t === 'trebuchet') { const arm = en.state === 'ready' ? -0.9 : en.state === 'wind' ? -0.9 + (1 - en.t2) * 2 : 1.1;
      R(g, x - 18, y - 6, 36, 6, '#4a3222'); fillPoly(g, [[x - 14, y - 6], [x - 2, y - 34], [x + 2, y - 34], [x + 14, y - 6]], '#5a3e26');
      g.strokeStyle = '#6a4a2c'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - Math.cos(arm) * 12, y - 34 - Math.sin(arm) * 12); g.lineTo(x + Math.cos(arm) * 30, y - 34 + Math.sin(arm) * 30); g.stroke();
      R(g, x - Math.cos(arm) * 12 - 5, y - 34 - Math.sin(arm) * 12 - 3, 10, 9, '#3a3a44');
      if (en.state === 'ready') { g.globalAlpha = 0.25; g.strokeStyle = '#ffd36b'; g.setLineDash([3, 4]); g.beginPath(); g.moveTo(x, y - 40); g.quadraticCurveTo((x + en.aim.x - cx) / 2, y - 140, Math.round(en.aim.x - cx), Math.round(en.aim.y - cy)); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; } }
    if (en.t === 'oilbarrel' && en.state !== 'spent') { const tilt = en.state === 'tip' ? Math.round((0.6 - en.t2) * 10) : 0; R(g, x - 7 + tilt, y - 15, 14, 15, '#3a2a1c'); R(g, x - 7 + tilt, y - 12, 14, 2, '#8a8a94'); R(g, x - 7 + tilt, y - 5, 14, 2, '#8a8a94'); R(g, x - 3 + tilt, y - 17, 6, 2, '#1a1410'); R(g, x - 2 + tilt, y - 10, 4, 3, '#ff9a5c'); }
  }
  for (const b of F.bolts) { const x = Math.round(b.x - cx), y = Math.round(b.y - cy), f = Math.sign(b.vx) || 1; R(g, f > 0 ? x - 14 : x, y, 14, 2, '#c8c8d0'); R(g, f > 0 ? x : x - 3, y - 1, 3, 4, '#e8e8f0'); }
  for (const s of F.stones) { R(g, s.x - cx - 5, s.y - cy - 5, 10, 10, '#6a6a74'); R(g, s.x - cx - 3, s.y - cy - 4, 4, 3, '#9a9aa4'); }
}
function text2(g, s, x, y, col) { /* two red bars and a gap: the '!!' without the font (the font is main.js's) */ for (let i = 0; i < s.length; i++) { R(g, x + i * 4 - 3, y, 2, 6, col); R(g, x + i * 4 - 3, y + 8, 2, 2, col); } }

/* ---------------- THE ART (baked once; the house pixel style: px.js shapes, a dark outline, flipped for the left) ---------------- */
/* one armoured body, posed: feet at (cx, fy). o.lean shifts the torso, o.kneel folds a leg, the arms go to where the hands are */
const hx0 = (o, cx, s) => cx + (o.lean || 0) * s;   /* where the shoulders are over the hips */
function figure(g, o) {
  const s = o.s || 1, cx = o.cx, fy = o.fy, P2 = o.pal;
  const hip = fy - 11 * s * (o.kneel ? 0.62 : 1), sh = hip - 11 * s, lean = (o.lean || 0) * s, hx = cx + lean;
  const legA = o.stride || 0;
  /* THE TATTERED CLOAK (2026-09-24, POLISH): hung from the shoulders and flying out behind, its hem torn into tongues. Drawn first, so
     the legs and the body stand in front of it; it is what makes a tall armoured man a SHAPE at game scale and not a column. */
  if (o.cloak && !o.lying) { const [cl, clD] = o.cloak, sy = hip - 11 * s, hem = fy - 2 * s, back = cx - (12 + (o.flut || 0) % 3) * s;
    const pts = [[hx0(o, cx, s) - 4 * s, sy], [hx0(o, cx, s) + 2 * s, sy], [cx + 3 * s, hem]];
    const N = 7; for (let k = 0; k <= N; k++) { const t = k / N, x = cx + 3 * s + (back - cx - 3 * s) * t, tongue = (k + (o.flut || 0)) % 2 ? 0 : 3 + ((k * 5 + (o.flut || 0)) % 3);
      pts.push([x, hem - tongue * s * 0.9 + t * -2 * s]); }
    pts.push([back + 2 * s, sy + 12 * s]);
    fillPoly(g, pts, clD);
    fillPoly(g, [[hx0(o, cx, s) - 2 * s, sy + 1], [hx0(o, cx, s) + 1 * s, sy + 1], [cx, hem - 4 * s], [back + 5 * s, hem - 6 * s], [back + 4 * s, sy + 12 * s]], cl);
    for (let k = 0; k < 3; k++) rect(g, back + (4 + k * 5) * s, hem - (5 + k % 2 * 2) * s, Math.max(1, s), Math.max(1, s), clD); }   /* moth holes */
  if (o.lying) {   /* on his back across the ground, the blade beside him */
    rect(g, cx - 12 * s, fy - 5 * s, 20 * s, 5 * s, P2.mail); rect(g, cx - 10 * s, fy - 6 * s, 12 * s, 3 * s, P2.cloth); circle(g, cx + 11 * s, fy - 3 * s, 3.2 * s, P2.bone); rect(g, cx + 10 * s, fy - 4 * s, 1, 1, P2.eye);
    line(g, cx - 14 * s, fy - 1, cx - 3 * s, fy - 1, P2.steel, 1); return; }
  /* legs */
  if (o.kneel) { line(g, cx - 2 * s, hip, cx - 7 * s, fy - 1, P2.mailD, Math.max(2, 3 * s)); line(g, cx + 2 * s, hip, cx + 8 * s, hip + 2 * s, P2.mailD, Math.max(2, 3 * s)); line(g, cx + 8 * s, hip + 2 * s, cx + 8 * s, fy - 1, P2.mailD, Math.max(2, 3 * s)); }
  else { line(g, cx - 2 * s, hip, cx - 3 * s - legA * 3 * s, fy - 2, P2.mailD, Math.max(2, 3 * s)); line(g, cx + 2 * s, hip, cx + 3 * s + legA * 3 * s, fy - 2, P2.mail, Math.max(2, 3 * s)); }
  rect(g, cx - 5 * s - legA * 3 * s, fy - 2 * s, 5 * s, 2 * s, P2.boot); rect(g, cx + 1 * s + legA * 3 * s, fy - 2 * s, 5 * s, 2 * s, P2.boot);
  /* back arm */
  if (o.back) line(g, hx - 3 * s, sh + 2 * s, cx + o.back[0] * s, fy + o.back[1] * s, P2.mailD, Math.max(2, 2.5 * s));
  /* torso: mail, and the tabard over it */
  fillPoly(g, [[hx - 5 * s, sh], [hx + 5 * s, sh], [cx + 4 * s, hip + 1], [cx - 4 * s, hip + 1]], P2.mail);
  fillPoly(g, [[hx - 3 * s, sh + 2 * s], [hx + 3 * s, sh + 2 * s], [cx + 4 * s, hip + 5 * s], [cx - 4 * s, hip + 5 * s]], P2.cloth, P2.clothD);
  rect(g, cx - 5 * s, hip - 1, 10 * s, Math.max(1, s), P2.belt);
  if (P2.mark) rect(g, hx - 1 * s, sh + 4 * s, 2 * s, 3 * s, P2.mark);
  /* head: a helm with the face gone */
  const hy = sh - 5 * s;
  if (o.helm === 'great' && !o.crest) { rect(g, hx - 4 * s, hy - 5 * s, 8 * s, 9 * s, P2.steel); rect(g, hx - 4 * s, hy - 1 * s, 8 * s, Math.max(1, s), '#101018'); rect(g, hx + 1 * s, hy - 1 * s, 2 * s, Math.max(1, s), P2.eye); rect(g, hx - 1 * s, hy - 8 * s, 2 * s, 3 * s, P2.plume || P2.steel); }   /* (the old box helm: nobody on the field wears it now - the Barrow Rider has the crested one too) */
  else if (o.helm === 'great') {
    /* A GREAT HELM, NOT A BOX (2026-09-24, POLISH): an 8x9 rectangle read as a crate on his shoulders. Now: a crown that narrows, cheeks that
       swell and a skirt that flares onto the gorget, lit down its facing edge and dark down its back; a visor slit with the eyes in it,
       breaths punched under it on the side he faces, a ridge down the middle, and a crest - a torn
       iron fin and a horn of bone. The Death Knight's first; the Barrow Rider (2026-09-24) wears it in the order's red. */
    const u = Math.max(1, s), lo = P2.steelD || P2.mailD, hi = P2.steelL || '#c8ccd4';
    if (o.crest === 'fin') { fillPoly(g, [[hx - 3 * s, hy - 4 * s], [hx + 2 * s, hy - 4 * s], [hx + 1 * s, hy - 8 * s], [hx - 0.5 * s, hy - 6.5 * s], [hx - 2 * s, hy - 10 * s], [hx - 3.5 * s, hy - 7 * s], [hx - 5 * s, hy - 8.5 * s]], P2.plume);
      line(g, hx - 3.5 * s, hy - 2 * s, hx - 7 * s, hy - 5 * s, P2.bone, Math.max(2, 1.5 * s)); line(g, hx - 7 * s, hy - 5 * s, hx - 7.5 * s, hy - 8 * s, P2.bone, u); }
    fillPoly(g, [[hx - 2.5 * s, hy - 5.5 * s], [hx + 2.5 * s, hy - 5.5 * s], [hx + 4 * s, hy - 3.5 * s], [hx + 4.5 * s, hy + 2.5 * s], [hx + 5.5 * s, hy + 4.5 * s], [hx - 5.5 * s, hy + 4.5 * s], [hx - 4.5 * s, hy + 2.5 * s], [hx - 4 * s, hy - 3.5 * s]], P2.steel);
    fillPoly(g, [[hx - 2.5 * s, hy - 5.5 * s], [hx - 1 * s, hy - 5.5 * s], [hx - 2.5 * s, hy + 4.5 * s], [hx - 5.5 * s, hy + 4.5 * s], [hx - 4.5 * s, hy + 2.5 * s], [hx - 4 * s, hy - 3.5 * s]], lo);   /* its back, in shadow */
    line(g, hx + 3.5 * s, hy - 3.5 * s, hx + 4 * s, hy + 2 * s, hi, u);   /* the lit edge on the side he faces */
    line(g, hx + 0.5 * s, hy - 5 * s, hx + 0.5 * s, hy - 2 * s, hi, u);   /* the ridge */
    rect(g, hx - 4 * s, hy - 1.5 * s, 8.5 * s, u, '#101018'); rect(g, hx + 1 * s, hy - 1.5 * s, 2.5 * s, u, P2.eye);   /* the visor slit, and his eyes in it */
    for (let k = 0; k < 3; k++) rect(g, hx + (1.5 + (k % 2) * 1.5) * s, hy + (1 + k) * s, u, u, '#101018');   /* the breaths */
    rect(g, hx - 5.5 * s, hy + 3.5 * s, 11 * s, u, lo); }
  else if (o.helm === 'hood') { circle(g, hx, hy, 4.5 * s, P2.clothD); circle(g, hx + 0.5 * s, hy + 0.5 * s, 3 * s, '#141018'); rect(g, hx + 1 * s, hy, Math.max(1, s), Math.max(1, s), P2.eye); rect(g, hx - 1.5 * s, hy, Math.max(1, s), Math.max(1, s), P2.eye); }
  else { circle(g, hx, hy, 4 * s, P2.bone); rect(g, hx - 4 * s, hy - 4 * s, 8 * s, 3 * s, P2.steel); rect(g, hx + 1 * s, hy - 1 * s, 2 * s, 2 * s, '#101018'); rect(g, hx + 1.5 * s, hy - 0.5 * s, 1, 1, P2.eye); rect(g, hx - 1 * s, hy + 2 * s, 3 * s, 1, '#6a6450'); }
  /* front arm */
  if (o.front) line(g, hx + 3 * s, sh + 2 * s, cx + o.front[0] * s, fy + o.front[1] * s, P2.mail, Math.max(2, 2.5 * s));
}
function setOf(frames, w, h, ax, ay, bw, bh) { const Rr = frames.map(c => outline(c)); const W = Rr.map(c => whiten(c)); return { R: Rr, L: Rr.map(flipX), white: { R: W, L: W.map(flipX) }, ax, ay, w: bw, h: bh }; }
const SOLDIER = { mail: '#7a8088', mailD: '#565c66', cloth: '#7a2a28', clothD: '#5a1e1e', belt: '#4a3a26', boot: '#2e2a28', bone: '#d8d2b8', steel: '#8a8e98', eye: '#c8b6ff', mark: '#c8a44a' };
/* THE FALLEN: a man of the order's army in rotten mail and what is left of the red, the violet in his eyes where the banner reached him */
export function bakeCorpse() {
  const F = [];
  for (let f = 0; f < 8; f++) { const [c, g] = canvas(34, 36), cx = 14, fy = 35;
    if (f === 0) figure(g, { cx: cx + 2, fy, pal: SOLDIER, lying: true });
    else if (f === 1) { figure(g, { cx, fy, pal: SOLDIER, kneel: true, lean: 2, front: [8, -2], back: [-6, -6] }); line(g, cx + 8, fy - 2, cx + 16, fy - 1, SOLDIER.steel, 1); }
    else { const walk = f === 3 ? 1 : f === 4 ? -1 : 0, tell = f === 5, cut = f === 6, hurt = f === 7;
      const hand = tell ? [-2, -30] : cut ? [14, -10] : [7, -13];
      figure(g, { cx: cx - (hurt ? 2 : 0), fy, pal: SOLDIER, stride: walk, lean: hurt ? -3 : tell ? -1 : 1, front: hand, back: [-5, -9] });
      /* the blade he died holding */
      const bx = cx + hand[0], by = fy + hand[1];
      if (tell) line(g, bx, by, bx - 6, by - 11, SOLDIER.steel, 2); else if (cut) line(g, bx, by, bx + 12, by + 4, SOLDIER.steel, 2); else line(g, bx, by, bx + 9, by - 7, SOLDIER.steel, 2); }
    F.push(c); }
  return setOf(F, 34, 36, 14, 35, 10, 24);
}
const BEARER = { ...SOLDIER, cloth: '#9a3028', clothD: '#6a2020', mail: '#6e747e', eye: '#d0b8ff' };
/* THE BANNER-BEARER: the same army, carrying the thing that gets them up - a torn standard on a pole twice his height */
export function bakeBannerbearer() {
  const F = [];
  for (let f = 0; f < 8; f++) { const [c, g] = canvas(44, 64), cx = 18, fy = 63;
    const walk = f === 1 ? 1 : f === 2 ? -1 : 0, plant = f === 3, guard = f === 4, tell = f === 5, pole = f === 6, hurt = f === 7;
    const hand = plant ? [4, -34] : tell ? [-4, -20] : pole ? [16, -14] : guard ? [8, -16] : [6, -18];
    figure(g, { cx: cx - (hurt ? 2 : 0), fy, pal: BEARER, helm: 'hood', stride: walk, lean: hurt ? -3 : tell ? -2 : 0, front: hand, back: plant ? [2, -30] : [-5, -10] });
    const bx = cx + hand[0], by = fy + hand[1];
    if (guard || tell || pole) { const tx = pole ? bx + 16 : tell ? bx - 6 : bx + 2, ty = pole ? by - 2 : tell ? by - 8 : by - 22; line(g, bx - (pole ? 6 : 0), by + (pole ? 0 : 10), tx, ty, '#4a3222', 2); rect(g, tx - 1, ty - 2, 3, 3, '#d8b04a'); }   /* the pole alone: his standard is in the ground */
    else { /* carried: the pole up past his head and the red on it */ const top = plant ? by - 26 : by - 30; line(g, bx, by + 12, bx + (plant ? 0 : 2), top, '#4a3222', 2); rect(g, bx - 1 + (plant ? 0 : 2), top - 3, 3, 3, '#d8b04a');
      for (let i = 0; i < 12; i++) rect(g, bx + (plant ? 1 : 3) + i, top + 1 + (i > 8 ? (i % 2) : 0) + Math.round(Math.sin(i * 0.7 + f) * 1), 1, 9 - (i > 8 ? (i % 2) * 3 : 0), i % 4 === 0 ? '#a8342c' : '#8e2a26');
      rect(g, bx + (plant ? 3 : 5), top + 3, 4, 2, '#e8c35a'); }
    F.push(c); }
  return setOf(F, 44, 64, 18, 63, 12, 26);
}
/* THE BARROW RIDER'S HORSE: a ghost of a destrier, bone showing through it - drawn from points, so a rear is a turn of the
   same points about the hind hooves and not a smeared rotation (the house style has no anti-aliasing). Feet at (cx, fy),
   facing right. o.rear: radians the forehand is lifted; o.gait: 0 stand, 1/2 walk, 3/4 gallop, 5 stamp (forehand down hard),
   6 pawing; o.broken: it is coming apart (the bones fall away from each other). */
const GHOST = { body: '#6f8499', bodyD: '#4c5c70', bodyL: '#9fb4c8', bone: '#e4e8f0', boneD: '#a8b0bc', flame: '#9ff0c0', flameD: '#4fa87c', eye: '#dfffa0', hoof: '#2a3040' };
function horse(g, o) {
  const cx = o.cx, fy = o.fy, rear = o.rear || 0, gait = o.gait || 0, br = o.broken || 0, K = o.k || 1;
  const px = cx - 18 * K, py = fy - 1;   /* the pivot a rear turns about: the hind hooves */
  /* o.k: the whole horse scaled about its feet - a destrier stands a head over the man on it, so it is drawn at 1.35 */
  const R = (x0, y0) => { const x = cx + (x0 - cx) * K, y = fy + (y0 - fy) * K; if (!rear) return [x, y]; const dx = x - px, dy = y - py, c = Math.cos(-rear), s = Math.sin(-rear); return [px + dx * c - dy * s, py + dx * s + dy * c]; };
  const P2 = (x, y, k = 0) => { const [a, b] = R(x, y); return [a + (br ? (k % 3 - 1) * br * 6 : 0), b + (br ? br * (4 + (k % 4) * 3) : 0)]; };
  const leg = (x0, y0, x1, y1, x2, y2, col, k) => { const a = P2(x0, y0, k), b = P2(x1, y1, k), d = P2(x2, y2, k); line(g, a[0], a[1], b[0], b[1], col, 3); line(g, b[0], b[1], d[0], d[1], col, 2); rect(g, d[0] - 2, d[1] - 1, 4, 2, GHOST.hoof); };
  /* the legs: [hip x, knee dx, knee dy, hoof dx] per leg, by gait */
  const G = [[0, 0, 0, 0], [3, -3, 2, -2], [-3, 3, -2, 2], [8, -8, 6, -6], [-7, 9, -5, 7], [0, 0, 0, 0], [0, 0, 0, 0]][gait] || [0, 0, 0, 0];
  const lift = gait === 3 ? 4 : gait === 4 ? 2 : 0;
  /* far legs first, in the dark */
  leg(cx - 14, fy - 20, cx - 16 + G[1], fy - 10 - lift, cx - 18 + G[1] * 1.2, fy - 1 - lift * 0.5, GHOST.bodyD, 1);
  if (gait === 6) leg(cx + 14, fy - 20, cx + 22, fy - 16, cx + 24, fy - 8, GHOST.bodyD, 2);   /* pawing: the far fore up */
  else leg(cx + 14, fy - 20, cx + 15 + G[3], fy - 10 - lift, cx + 16 + G[3] * 1.3, fy - 1 - lift * 0.3, GHOST.bodyD, 2);
  /* the body: a barrel, the croup behind, the chest forward */
  const body = [P2(cx - 24, fy - 30, 3), P2(cx - 10, fy - 33, 4), P2(cx + 8, fy - 33, 5), P2(cx + 20, fy - 30, 6), P2(cx + 22, fy - 22, 7), P2(cx + 12, fy - 17, 8), P2(cx - 10, fy - 17, 9), P2(cx - 22, fy - 20, 10)];
  fillPoly(g, body, GHOST.body, GHOST.bodyD);
  fillPoly(g, [P2(cx - 22, fy - 29, 3), P2(cx + 18, fy - 31, 5), P2(cx + 18, fy - 28, 6), P2(cx - 20, fy - 26, 3)], GHOST.bodyL);   /* its back, lit */
  /* THE RIBS: bone showing through the ghost */
  for (let k = 0; k < 5; k++) { const a = P2(cx - 6 + k * 4, fy - 30, 11 + k), b = P2(cx - 8 + k * 4, fy - 19, 11 + k); line(g, a[0], a[1], b[0], b[1], GHOST.bone, 1); }
  /* the neck up and forward, and the skull */
  const nb = P2(cx + 16, fy - 30, 20), nt = P2(cx + 24, fy - 44, 21);
  fillPoly(g, [P2(cx + 12, fy - 31, 20), P2(cx + 20, fy - 46, 21), P2(cx + 27, fy - 44, 22), P2(cx + 22, fy - 26, 23)], GHOST.body, GHOST.bodyD);
  const sk = P2(cx + 26, fy - 46, 24), sn = P2(cx + 36, fy - 40, 25);
  fillPoly(g, [[sk[0] - 3, sk[1] - 3], [sk[0] + 3, sk[1] - 4], [sn[0] + 1, sn[1] - 1], [sn[0], sn[1] + 2], [sk[0] + 1, sk[1] + 4]], GHOST.bone);
  line(g, sk[0] + 2, sk[1] + 3, sn[0] - 1, sn[1] + 2, GHOST.boneD, 1);   /* the jaw */
  rect(g, sk[0], sk[1] - 1, 2, 2, GHOST.eye);   /* the eye, alight */
  rect(g, sk[0] - 3, sk[1] - 6, 2, 3, GHOST.bone);   /* an ear */
  /* THE MANE AND THE TAIL: cold green fire, streaming back */
  const stream = gait >= 3 && gait <= 4 ? 6 : 2;
  for (let k = 0; k < 5; k++) { const a = P2(cx + 20 - k * 2, fy - 46 + k * 3, 26 + k); fillPoly(g, [[a[0], a[1]], [a[0] - 4 - stream, a[1] - 2 + (k % 2)], [a[0] - 2, a[1] + 3]], k % 2 ? GHOST.flame : GHOST.flameD); }
  const t0 = P2(cx - 24, fy - 28, 31); for (let k = 0; k < 4; k++) fillPoly(g, [[t0[0], t0[1] + k * 2], [t0[0] - 8 - stream - k * 2, t0[1] + 2 + k * 3], [t0[0] - 3, t0[1] + 4 + k * 2]], k % 2 ? GHOST.flame : GHOST.flameD);
  /* the saddle cloth: the order's red, rotten */
  fillPoly(g, [P2(cx - 10, fy - 33, 32), P2(cx + 6, fy - 33, 33), P2(cx + 4, fy - 21, 34), P2(cx - 8, fy - 21, 35)], '#7a2a28', '#5a1e1e');
  rect(g, ...P2(cx - 4, fy - 29, 36), 3, 3, '#c8a44a');
  /* near legs, in front */
  if (gait === 6 || rear > 0.3) leg(cx + 16, fy - 21, cx + 26, fy - 22, cx + 28, fy - 13, GHOST.body, 40);   /* the near fore struck up high */
  else if (gait === 5) leg(cx + 16, fy - 21, cx + 22, fy - 10, cx + 24, fy - 1, GHOST.body, 40);   /* stamped down */
  else leg(cx + 16, fy - 21, cx + 16 - G[3], fy - 10 - lift * 0.5, cx + 16 - G[3] * 1.3, fy - 1, GHOST.body, 40);
  leg(cx - 16, fy - 21, cx - 15 - G[1], fy - 10, cx - 15 - G[1] * 1.3, fy - 1, GHOST.body, 41);
  /* (the hind hooves stay down through a rear: they are what it turns about) */
}
const RIDER = { mail: '#6a6e78', mailD: '#4a4e58', cloth: '#8e2a26', clothD: '#5e1a1a', belt: '#c8a44a', boot: '#24222a', bone: '#dcd6bc', steel: '#8e949e', steelD: '#50565e', steelL: '#c0c6ce', eye: '#9ff0c0', mark: '#e8c35a', plume: '#8e2a26' };
/* THE OLD BANNER, his lance: a pole with a torn red flag near the head and the order's gold on it. (bx, by) the hands, ang the pole */
function bannerLance(g, bx, by, ang, len, fl) {
  const ca = Math.cos(ang), sa = Math.sin(ang), tx = bx + ca * len, ty = by + sa * len, ex = bx - ca * 12, ey = by - sa * 12;
  line(g, ex, ey, tx, ty, '#4a3222', 2);
  fillPoly(g, [[tx, ty], [tx + ca * 6 - sa * 2, ty + sa * 6 + ca * 2], [tx + ca * 6 + sa * 2, ty + sa * 6 - ca * 2]], '#c0c6ce');   /* the lance head */
  rect(g, tx - 1, ty - 1, 3, 3, '#d8b04a');
  /* the flag hangs off the pole below the head, and trails (fl: how far it streams) */
  const fx = bx + ca * (len - 16), fy = by + sa * (len - 16);
  for (let i = 0; i < 12; i++) { const k = i / 12, x = fx - ca * i * 0.4 - fl * k * 6, y = fy - sa * i * 0.4 + 1 + Math.round(Math.sin(i * 0.9) * 1); rect(g, x, y, 1, 8 - (i > 8 ? (i % 2) * 3 : 0), i % 4 === 0 ? '#a8342c' : '#7e2622'); }
  rect(g, fx - fl * 2 - 2, fy + 3, 3, 2, '#e8c35a');
}
export function bakeBarrowRider() {
  const F = [];
  for (let f = 0; f < 24; f++) { const [c, g] = canvas(124, 100), cx = 58, fy = 99, s = 1.25, HK = 1.35;
    const foot = f >= 13 && f !== 23;
    if (!foot) {
      /* MOUNTED (and 23: the horse coming apart under him) */
      const gait = f === 1 ? 1 : f === 2 ? 2 : f === 3 ? 6 : f === 4 ? 3 : f === 5 ? 4 : f === 7 ? 5 : 0, rear = f === 6 ? 0.55 : 0, broken = f === 23 ? 1 : 0;
      horse(g, { cx, fy, gait, rear, broken, k: HK });
      /* IN THE SADDLE: seated on its back (the kneeling legs of figure() are a rider's - one thigh forward along the flank, the
         shin down it), low enough that the horse reads as the bigger animal */
      const seatX = cx - 2 + (rear ? 10 : 0), seatY = fy - 31 * HK - (rear ? 16 : 0) + (f === 23 ? 14 : 0) + (f === 4 || f === 5 ? (f % 2) : 0);
      const lean = f === 3 || f === 4 || f === 5 ? 3 : f === 6 ? 4 : f === 12 ? -4 : f === 23 ? -3 : 0;
      const hand = f === 3 || f === 4 || f === 5 ? [10, -20] : f === 8 ? [-12, -34] : f === 9 ? [14, -26] : f === 10 ? [4, -44] : f === 11 ? [14, -16] : f === 6 ? [8, -30] : f === 7 ? [12, -24] : [8, -24];
      figure(g, { cx: seatX, fy: seatY + 6.8 * s, s, pal: RIDER, helm: 'great', crest: 'fin', cloak: ['#3a2224', '#22141a'], flut: f, lean, kneel: true, front: hand.map(v => v / s), back: f === 8 ? [8 / s, -30 / s] : [6 / s, -22 / s] });
      const bx = seatX + hand[0], by = seatY + 6.8 * s + hand[1];
      if (f === 8) { bannerLance(g, seatX + 6, seatY + 1, -1.45, 46, 1); circle(g, bx - 1, by - 2, 4, '#4fa87c'); circle(g, bx - 1, by - 3, 2.5, '#9ff0c0'); rect(g, bx - 2, by - 4, 2, 2, '#efffe0'); }   /* grave-fire in his hand */
      else { const ang = f === 3 || f === 4 || f === 5 ? 0.05 : f === 10 ? -1.5 : f === 11 ? 1.0 : f === 6 ? -1.1 : f === 7 ? 0.35 : f === 9 ? -1.2 : f === 12 ? -1.9 : f === 23 ? 0.9 : -1.35;
        bannerLance(g, bx, by, ang, f === 11 ? 40 : 46, f === 4 || f === 5 ? 3 : 1); }
      if (f === 9) for (let i = 0; i < 4; i++) rect(g, bx + 4 + i * 3, by - 3 + (i % 2) * 2, 2, 2, i % 2 ? '#4fa87c' : '#9ff0c0');   /* the throw's trail */
      if (f === 7) for (let i = 0; i < 6; i++) rect(g, cx + 14 + i * 4, fy - 2 - (i % 2) * 2, 3, 2, '#9a8a6a');   /* the stamp's dust */
      if (f === 23) for (let i = 0; i < 7; i++) rect(g, cx - 20 + i * 7, fy - 3 - (i % 3), 4, 2, GHOST.bone);   /* bones already on the ground */
    } else {
      /* ON FOOT: the knight alone, a head taller than a man, with the banner */
      const walk = f === 14 ? 1 : f === 15 ? -1 : 0, kneel = f === 20, s2 = 1.6;
      const hand = f === 16 ? [-10, -30] : f === 17 ? [18, -24] : f === 18 ? [4, -52] : f === 19 ? [14, -14] : f === 20 ? [10, -12] : f === 21 ? [-2, -40] : f === 22 ? [4, -24] : [8, -28];
      figure(g, { cx: cx - (f === 22 ? 3 : 0), fy, s: s2, pal: RIDER, helm: 'great', crest: 'fin', cloak: ['#3a2224', '#22141a'], flut: f, stride: walk, kneel, lean: f === 22 ? -4 : f === 16 ? -2 : f === 17 ? 4 : 0, front: hand.map(v => v / s2), back: f === 21 ? [10 / s2, -40 / s2] : [-8 / s2, -18 / s2] });
      const bx = cx + hand[0], by = fy + hand[1];
      const ang = f === 16 ? 0.15 : f === 17 ? 0.02 : f === 18 ? -1.52 : f === 19 ? 0.95 : f === 20 ? 0.5 : f === 21 ? -1.6 : f === 22 ? -1.9 : -1.4;
      if (f === 21) { bannerLance(g, cx + 20, fy - 2, -1.57, 46, 0); for (let i = 0; i < 5; i++) rect(g, cx - 26 + i * 6, fy - 3 - (i % 2) * 3, 3, 2, GHOST.flame); }   /* the banner planted beside him; the green going out along the ground to the bones */
      else bannerLance(g, bx, by, ang, 46, f === 17 ? 2 : 1);
    }
    F.push(c); }
  return setOf(F, 124, 100, 58, 99, 30, 52);
}
/* the horse alone, for when it has thrown him and runs on: two strides of a gallop */
export function bakeBarrowHorse() { const F = []; for (const gait of [3, 4]) { const [c, g] = canvas(96, 70); horse(g, { cx: 44, fy: 69, gait, k: 1.35 }); F.push(c); } return (HORSE_ART = setOf(F, 96, 70, 44, 69, 30, 30)); }
const KNIGHT = { steelD: '#38423e', steelL: '#8a9892', mail: '#3e4a44', mailD: '#2a322e', cloth: '#1e2622', clothD: '#141a18', belt: '#6a5a3a', boot: '#161a18', bone: '#c8d0c0', steel: '#5a6660', eye: '#9ff0c0', mark: '#9ff0c0', plume: '#2a3a34' };
/* THE FIRST DEATH KNIGHT: black-green plate, the eyes the class wears, and the scythe - long enough to reach a room */
export function bakeDeathKnight() {
  const F = [];
  /* 0 idle | 1,2 walk | 3 CLEAVE TELL (over the shoulder) | 4 CLEAVE (down through the front) | 5 GRIP TELL (the free hand thrust out) |
     6 GRIP (hauling it in) | 7 BLOOD BOIL (the point down, the hand to the ground) | 8 PASSING TELL (crouched, the blade trailed) |
     9 PASSING (the rush) | 10 WARD (the scythe planted before him) | 11 NOVA TELL (both hands up) | 12 NOVA (flung wide) |
     13 SUMMON / GRAVECALL (the hand up, green) | 14 SURGE (arms out, drinking) | 15 OPEN (on a knee, the ward broken) | 16 hurt */
  for (let f = 0; f < 17; f++) { const [c, g] = canvas(96, 84), cx = 42, fy = 83, s = 2;
    const walk = f === 1 ? 1 : f === 2 ? -1 : 0, ctell = f === 3, cleave = f === 4, gtell = f === 5, grip = f === 6, boil = f === 7, ptell = f === 8, pass = f === 9, ward = f === 10, ntell = f === 11, nova = f === 12, raise = f === 13, surge = f === 14, open = f === 15, hurt = f === 16;
    const hand = ctell ? [-14, -44] : cleave ? [22, -20] : gtell ? [-4, -36] : grip ? [-8, -30] : boil ? [14, -20] : ptell ? [-8, -22] : pass ? [18, -30] : ward ? [14, -34] : ntell ? [4, -58] : nova ? [-6, -48] : raise ? [-6, -34] : surge ? [-10, -38] : open ? [16, -8] : [10, -30];
    figure(g, { cx: cx - (hurt ? 4 : 0), fy, s, pal: KNIGHT, helm: 'great', crest: 'fin', cloak: ['#1c2420', '#0c100e'], flut: f, stride: walk || (pass ? 1 : 0), kneel: open || ptell || boil, lean: hurt ? -4 : ctell ? -3 : pass ? 5 : cleave ? 4 : grip ? -3 : 0,
      front: hand.map(v => v / s), back: gtell ? [26 / s, -36 / s] : grip ? [14 / s, -34 / s] : raise ? [-12 / s, -58 / s] : ntell ? [-8 / s, -60 / s] : nova ? [-24 / s, -44 / s] : surge ? [26 / s, -40 / s] : boil ? [-16 / s, -4 / s] : [-10 / s, -22 / s] });
    const bx = cx + hand[0], by = fy + hand[1];
    /* the scythe: a long haft, and the blade hung off the top of it the way the hero's is */
    const ang = ctell ? -2.6 : cleave ? 0.7 : gtell ? -1.05 : grip ? -0.95 : boil ? 1.35 : ptell ? 2.9 : pass ? 0.05 : ward ? 1.52 : ntell ? -1.57 : nova ? -2.2 : raise ? -1.1 : surge ? -1.15 : open ? 0.35 : -1.25;
    const L1 = 34, tx = bx + Math.cos(ang) * L1, ty = by + Math.sin(ang) * L1, ex = bx - Math.cos(ang) * 14, ey = by - Math.sin(ang) * 14;
    /* THE SCYTHE, READ AT A GLANCE (2026-09-24, POLISH): a haft three pixels through with its lit side, a steel collar where the blade is
       socketed, and the blade a real crescent - broad at the heel, curving to a point, a bright cutting edge and a dark back - where it
       was a thin grey sliver the plate swallowed. Same angles, same hands, frame for frame: only the picture of it changed. */
    line(g, ex, ey, tx, ty, '#3a2e24', 3); line(g, ex + 1, ey, tx + 1, ty, '#6a5440', 1);
    const bl = [Math.cos(ang + 1.9), Math.sin(ang + 1.9)], ca = Math.cos(ang), sa = Math.sin(ang), BL = 27;
    const bpt = (k, off) => [tx + bl[0] * k + ca * off, ty + bl[1] * k + sa * off];
    fillPoly(g, [bpt(0, 4), bpt(8, 6), bpt(17, 6), bpt(BL, 3), bpt(BL - 4, -1), bpt(14, -2), bpt(5, -3), bpt(0, -3)], '#b8c4bc');
    line(g, ...bpt(0, 4), ...bpt(8, 6), '#e8f4ec', 1); line(g, ...bpt(8, 6), ...bpt(17, 6), '#e8f4ec', 1); line(g, ...bpt(17, 6), ...bpt(BL, 3), '#e8f4ec', 1);   /* the edge */
    line(g, ...bpt(5, -3), ...bpt(BL - 4, -1), '#6e7a74', 1);   /* its back */
    rect(g, tx - 2, ty - 2, 4, 4, '#8a968e');   /* the collar */
    if (raise) for (let i = 0; i < 5; i++) rect(g, cx - 18 + i * 9, fy - 4 - (i % 2) * 3, 2, 3, '#9ff0c0');
    if (gtell || grip) { const hx = cx + (gtell ? 26 : 14), hy = fy - (gtell ? 36 : 34); circle(g, hx, hy, 3, '#8fd160'); for (let i = 0; i < 3; i++) rect(g, hx + (gtell ? 4 + i * 4 : 3 + i * 3), hy - 1 + (i % 2), 2, 2, '#dfffa0'); }   /* the rune-chain in his hand */
    if (boil) for (let i = 0; i < 5; i++) rect(g, cx - 22 + i * 6, fy - 3 - (i % 2) * 2, 3, 2, i % 2 ? '#c0283a' : '#ff6b6b');   /* the blood coming up where his hand is */
    if (ntell || nova || surge) { for (let i = 0; i < (nova ? 8 : 5); i++) { const a = i * 0.8 + f, r = nova ? 20 : 12; rect(g, cx + Math.cos(a) * r, fy - 40 + Math.sin(a) * r * 0.6, 2, 2, i % 2 ? '#c0283a' : '#ff6b6b'); } }   /* the blood gathering round him */
    if (ward) { rect(g, cx + 20, fy - 48, 3, 46, '#c0283a'); rect(g, cx + 20, fy - 48, 1, 46, '#ff6b6b'); }   /* the ward standing up off the blade */
    if (open) for (let i = 0; i < 4; i++) rect(g, bx + 6 + i * 4, fy - 4 - (i % 2) * 3, 3, 2, '#c0283a');   /* the broken ward, spilled */
    F.push(c); }
  return setOf(F, 96, 84, 42, 83, 24, 52);
}
/* the world's own props (cover, engines) are drawn live in drawField; this bakes one sheet of everything for the PNG review */
export function bakeAll() { return { bannerbearer: bakeBannerbearer(), corpse: bakeCorpse(), barrowrider: bakeBarrowRider(), barrowhorse: bakeBarrowHorse(), deathknight: bakeDeathKnight() }; }
