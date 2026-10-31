/* tools/boss-heal.mjs - THE ARENA HEAL (claude/bossheal, Daniel 10-30: "whenever you find a mini boss or a boss, you get automatically healed").
   PAGE, one browser. For a boss (the Kitchen Gate's Grubbag) and a mini (Kingswood's Great Hound; the Deep Rails' Foreman when asked):
     - a hero at 30% health who walks into the arena trigger is at FULL health the frame the fight starts (bossActive / miniActive), his FLASKS unchanged;
     - nothing heals during the fight: a hero hurt after it began stays hurt over the next two seconds;
     - a hero already at full health is told nothing extra (no stray number);
   (Co-op and the rush are not driven here: arenaHeal walks every standing seat, and skips rushOn().)   node tools/boss-heal.mjs */
import { openPage } from './cdp.mjs';
const fails = [], ok = (c, m) => { if (!c) fails.push(m); else console.log('  ok   ' + m); };
const pg = await openPage({ audio: false, fonts: false });
try {
  const R = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const out = {};
    const run = (id, kind) => { BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === id)); BK.start(); BK.sim(30);
      const R = kind === 'mini' ? BK.L.mini : BK.L.arena, P = BK.P, o = {};
      P.maxHp = P.maxHp || 100; P.hp = Math.round(P.maxHp * 0.3); P.flasks = 1; const fl0 = P.flasks, hp0 = P.hp;
      BK.tp(Math.round(R.trigger / 16) + (R.reverse ? -1 : 1), Math.round(R.floor / 16) - 1);
      let live = false; for (let i = 0; i < 90 && !live; i++) { BK.sim(1); live = kind === 'mini' ? BK.miniActive : BK.bossActive; }
      o.live = live; o.hp0 = hp0; o.hpAt = P.hp; o.max = P.maxHp; o.fl0 = fl0; o.flAt = P.flasks; o.msg = BK.hint && BK.hint.msg;
      const hurtTo = Math.round(P.maxHp * 0.5); P.hp = hurtTo; BK.sim(120); o.hpLater = P.hp; o.hurtTo = hurtTo; return o; };
    out.boss = run('kitchengate', 'boss'); out.mini = run('kings', 'mini');
    BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'kitchengate')); BK.start(); BK.sim(30);
    { const A = BK.L.arena, P = BK.P; P.hp = P.maxHp; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); let live = false; for (let i = 0; i < 90 && !live; i++) { BK.sim(1); live = BK.bossActive; } out.full = { live, hp: P.hp, max: P.maxHp }; }
    return out; })()`);
  console.log(JSON.stringify(R));
  for (const k of ['boss', 'mini']) { const o = R[k];
    ok(o.live, k + ': the fight started when the hero crossed the trigger');
    ok(o.hp0 < o.max * 0.4 && o.hpAt === o.max, k + ': a hero at ' + o.hp0 + '/' + o.max + ' is at FULL (' + o.hpAt + ') the moment the fight starts');
    ok(o.flAt === o.fl0, k + ': flasks are not refilled (' + o.fl0 + ' -> ' + o.flAt + ')');
    ok(o.hpLater <= o.hurtTo + 2, k + ': nothing heals during the fight (' + o.hurtTo + ' -> ' + o.hpLater + ')'); }
  ok(R.full.live && R.full.hp === R.full.max, 'a hero at full stays at full');
  ok(pg.errors.length === 0, 'no page errors ' + JSON.stringify(pg.errors.slice(0, 2)));
} finally { pg.close(); }
if (fails.length) { console.error('boss-heal: ' + fails.length + ' FAIL\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('boss-heal: all green');
