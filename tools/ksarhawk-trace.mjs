// tools/ksarhawk-trace.mjs - ONE HAWK-MISTRESS FIGHT, traced (claude/ksarhawk; not in the suite): the bot's reasons (counted), her counters (src/hawk-mistress.js S.n),
//   and a line every few seconds. usage: PORT=8892 node tools/ksarhawk-trace.mjs <hero> [seed] [secs] [profile]
import { openPage } from './cdp.mjs';
import { campaignLevel } from './boss-level.mjs';
import { flaskKitAt, beatenBeforeIn } from '../src/campaign-kit.js';
import { LEVELS } from '../src/level.js';
import { depthsOf } from '../src/campaign-order.js';
const [h = 'warden', seed = '1', secs = '240', prof = 'human'] = process.argv.slice(2), lvl = campaignLevel('ksar'), fk = flaskKitAt('ksar', depthsOf(LEVELS).ksar ?? 1, beatenBeforeIn(LEVELS, 'ksar'));
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{ BK.manualSimulation = true; const P0 = BKT.PROG, h = ${JSON.stringify(h)}; BKT.setHeroLevel(h, ${lvl}); P0.flaskItems = ${JSON.stringify(fk)};
    BK.setHero(h); BK.reset({ fresh: true }); BK.applyUpgrades(); const why = {}, log = [], src = {}; let last = -9, hp0 = null;
    const row = (await BK.bossLab({ bosses: ['ksar'], heroes: [h], maxSecs: ${+secs}, healthMode: 'normal', seed: ${+seed}, profile: ${JSON.stringify(prof)},
      onFrame: ({ boss, P, f, why: w }) => { if (hp0 !== null && P.hp < hp0) { const S0 = BK.hawkMistressHands().show(), gd = BK.enemies().some(q => q.alive && q.hmGuard && Math.abs(q.x - P.x) < 50), K0 = BK.ksar && BK.ksar(); const k = P.ksLift ? 'shaft' : gd ? 'guard?' : (K0 && K0.fx.some(q => q.k === 'blast')) ? 'blast' : 'her ' + boss.mode + '/' + (S0 && S0.hawk.mode); src[k] = (src[k] || 0) + (hp0 - P.hp); } hp0 = P.hp; const k = (w || '').replace(/[0-9]+/g, '#'); why[k] = (why[k] || 0) + 1; if (f / 60 - last >= 4) { last = f / 60; const S = BK.hawkMistressHands().show();
        log.push(Math.round(f / 60) + 's hp ' + Math.round(boss.hp) + ' mode ' + boss.mode + ' hawk ' + (S && S.hawk.mode) + ' P ' + Math.round(P.x) + ',' + Math.round(P.y) + ' hero ' + Math.round(P.hp) + ' carry ' + (P.carry ? P.carry.thrKind : '-') + ' why ' + w); } } })).rows[0] || {};
    const H = BK.hawkMistressHands(), S = H && H.show(), K = BK.ksar && BK.ksar();
    return { src, out: row.outcome, secs: row.secs, left: row.hpLeftPct, why, log, n: S && S.n, hurt: S && S.hurt, ks: K && { torches: K.n.torchesThrown, kegs: K.n.kegsThrown, hawkHits: K.n.hawkHits, rings: K.n.heroRings, shaftFalls: K.n.shaftFalls } }; })()`, 900000);
  console.log(r.out, r.secs, 'left', r.left); for (const l of r.log) console.log('  ' + l);
  console.log('why:', Object.entries(r.why).sort((a, b) => b[1] - a[1]).slice(0, 24).map(([k, v]) => k + ' ' + v).join(' | '));
  console.log('src:', JSON.stringify(Object.fromEntries(Object.entries(r.src).map(([k, v]) => [k, Math.round(v)])))); console.log('n:', JSON.stringify(r.n)); console.log('hurt:', JSON.stringify(r.hurt)); console.log('ks:', JSON.stringify(r.ks));
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
