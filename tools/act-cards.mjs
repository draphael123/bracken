/* tools/act-cards.mjs - ACT CARDS + THE BOSS-KILL BEAT (claude/actcards, Daniel 10-18 B3/B4; src/act-cards.js).
     node tools/act-cards.mjs             node-only: the pure logic and the source wiring (no browser; safe beside a suite)
     node tools/act-cards.mjs --browser   adds the page checks (the integ runs this): first entry shows the card once and never blocks input, reduce-motion,
                                          the beat fires once on a boss kill, keeps the stinger under reduce-motion, and the win card still arrives.
   Exit 1 on any red row. */
import { readFileSync } from 'fs';
import * as AC from '../src/act-cards.js';
import { ACTS } from '../src/foe-react.js';
const rows = []; const ok = (name, pass, why = '') => { rows.push({ name, pass: !!pass, why }); console.log((pass ? 'ok   ' : 'FAIL ') + name + (pass ? '' : '  ' + why)); };
const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

/* --- logic --- */
ok('every act has a card name and a numeral', ACTS.every(a => AC.cardFor(a.levels[0], {}) && AC.cardFor(a.levels[0], {}).label.startsWith('ACT ') && AC.cardFor(a.levels[0], {}).name === a.name));
{ const c = AC.cardFor('scree', {}); ok('ACT II - THE CRAGS', c && c.label === 'ACT II' && c.name === 'THE CRAGS' && c.hold === 2); }
{ const p = {}; const c = AC.cardFor('wood', p); AC.markSeen(p, c.act); ok('seen once: no second card in that act', AC.cardFor('marsh', p) === null && AC.cardFor('scree', p) !== null); }
ok('an old save that cleared a level of the act gets no card', AC.cardFor('wood', { marsh: { cleared: true } }) === null && AC.cardFor('scree', { marsh: { cleared: true } }) !== null);
ok('shop / trial / unknown ids show nothing', AC.cardFor('shop', {}) === null && AC.cardFor('custom', {}) === null);
ok('card alpha fades in, holds, fades out, zero outside', AC.cardAlpha(2.0) === 0 && AC.cardAlpha(1.0) === 1 && AC.cardAlpha(0.25) > 0 && AC.cardAlpha(0.25) < 1 && AC.cardAlpha(0) === 0);
ok('beat curve 0 -> peak -> 0', AC.beatK(AC.BEAT.t) === 0 && AC.beatK(AC.BEAT.t / 2) > 0.99 && AC.beatK(0) === 0);
{ const n = AC.beatPlan({}), r = AC.beatPlan({ reduceMotion: true }), f = AC.beatPlan({ fast: true });
  ok('beat plan: full has slow-mo + push + stinger', n.stinger && n.slow > 0 && n.push > 0);
  ok('beat plan: reduce-motion keeps the stinger, drops slow-mo/push/zoom', r.stinger && !r.slow && !r.push && !r.zoom);
  ok('beat plan: ?nobeat=1 bypass keeps the stinger only', f.stinger && !f.slow && !f.push); }
ok('beat length is 0.5 s and fits inside the shortest bossWon (2.2 s): nothing waits on it', AC.BEAT.t === 0.5 && AC.BEAT.t < 2.2);

/* --- wiring in main.js --- */
const n = (re) => (src.match(re) || []).length;
ok('startBossBeat is called once, guarded by !bossBeat', n(/startBossBeat\(\)/g) === 2 && /bossWon > 0 && !bossBeat\) startBossBeat\(\)/.test(src));
ok('bossBeat and actCard are cleared on level load', /bossWon = 0; bossBeat = null; actCard = null;/.test(src));
ok('the beat plays the stinger itself; queenDies no longer doubles it', /function queenDies\(who\) \{\s*setView/.test(src) && /SFX\.bossDown\(\); if \(plan\.slow\)/.test(src));
ok('beat and card are never modal (no stop/hitstop/state change in them)', !/function startBossBeat[^}]*(hitstop|state =)/.test(src) && !/function startActCard[^}]*(state =|stop =)/.test(src));
ok('the card is seen-flagged in the save (PROG.actSeen via markSeen) and skips rush / trial / shop / boss-jump', /AC\.markSeen\(PROG, c\.act\)/.test(src) && /L\.trial \|\| L\.shop \|\| rushOn\(\) \|\| bossJumpOn/.test(src));

/* --- the page --- */
if (process.argv.includes('--browser')) {
  const { openPage } = await import('./cdp.mjs'); const pg = await openPage({ audio: false });
  try {
    const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const out = {};
      const fresh = id => { const i = LEVELS.findIndex(l => l.id === id); BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(i); BK.start(); return i; };
      fresh('scree'); out.card1 = BK.actCard && BK.actCard.label + ' ' + BK.actCard.name; out.seen = JSON.stringify(BK.PROG.actSeen);
      BK.keys.right = true; const x0 = BK.P.x; BK.sim(20); BK.keys.right = false; out.moved = BK.P.x - x0;   // input is not eaten by the card
      BK.sim(150); out.cardGone = BK.actCard === null;                                                      // 2 s = 120 frames
      BK.start(); out.replay = BK.actCard === null;                                                         // same act again, same save: no card
      fresh('wood'); out.otherAct = !!BK.actCard; return out; })()`);
    ok('first entry shows ACT II - THE CRAGS', r.card1 === 'ACT II THE CRAGS', JSON.stringify(r));
    ok('seen flag written to the save', /"2":1/.test(r.seen), r.seen);
    ok('input works while the card is up', r.moved > 2, 'moved ' + r.moved);
    ok('card gone after 2 s', r.cardGone); ok('no card on replay', r.replay); ok('another act still gets its card', r.otherAct);
    const b = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const out = {};
      for (const rm of [false, true]) { BK.SET.reduceMotion = rm; BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'wood')); BK.start(); BK.sim(30);
        BK.slay && BK.slay(); let first = null, beats = 0, last = null;
        for (let i = 0; i < 400; i++) { BK.sim(1); const bb = BK.bossBeat; if (bb && bb !== last) { beats++; last = bb; first = { slow: bb.plan.slow, push: bb.plan.push }; } if (BK.state === 'win') { out['win' + rm] = i; break; } }
        out['beats' + rm] = beats; out['plan' + rm] = first; }
      BK.SET.reduceMotion = false; return out; })()`);
    ok('beat fires exactly once per boss kill (normal and reduce-motion)', b.beatsfalse === 1 && b.beatstrue === 1, JSON.stringify(b));
    ok('reduce-motion plan has no slow-mo or push', b.plantrue && !b.plantrue.slow && !b.plantrue.push && b.planfalse && b.planfalse.slow > 0, JSON.stringify(b));
    ok('the win card still arrives after a kill', b.winfalse !== undefined && b.wintrue !== undefined, JSON.stringify(b));
    ok('no page errors', pg.errors.length === 0, JSON.stringify(pg.errors.slice(0, 2)));
  } finally { pg.close(); }
}
const bad = rows.filter(x => !x.pass); console.log(bad.length ? bad.length + ' red of ' + rows.length : 'all ' + rows.length + ' green'); process.exit(bad.length ? 1 : 0);
