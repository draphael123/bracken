// tools/hud-default.mjs - HUD-SLIM (claude/hudslim, Daniel 2026-10-09): the MINIMAL HUD is the default, the PLATE HUD is an opt-in that never takes more
// than ~20% of the width, and a boss has ONE bar, its name once, and ONE readout per the Boss health setting.
//   1. settings: a new save and a file from before (no hudV2) get MINIMAL once; an explicit PLATE choice (hudV2) is kept; the retired BAR+BOTH is NUMBERS
//   2. the plate HUD, every hero with every meter full (their prompts used to widen it to 45%): the plate is <= 22% of the view, swimming too
//   3. a boss fight, BAR / PERCENT / NUMBERS: the bottom band holds the name once and the bar, and the readout is nothing / n% / n/N - never two of them
//   4. the idle MINIMAL HUD (full health and stamina, nothing to say) draws no bars but still draws the coins and the clock
//   node tools/hud-default.mjs
import { openPage } from './cdp.mjs';

const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
const pg = await openPage({ audio: false, fonts: true });
const E = (e, t = 300000) => pg.evalp(e, t);
try {
  await new Promise(r => setTimeout(r, 1200));
  await E('BK.manualSimulation=true;BK.step(3)');
  /* ---- 1. settings ---- */
  const S = await E(`(()=>{const r=s=>{const o=BK.ui.readSettings(s);return {hud:o.hud,bossHp:o.bossHp,v2:o.hudV2}};return {fresh:r('{}'),old:r(JSON.stringify({hud:'full',bossHp:'bar'})),oldMin:r(JSON.stringify({hud:'minimal'})),pick:r(JSON.stringify({hud:'full',hudV2:1})),pickMin:r(JSON.stringify({hud:'minimal',hudV2:1})),both:r(JSON.stringify({hudV2:1,bossHp:'both'})),pct:r(JSON.stringify({hudV2:1,bossHp:'pct'}))}})()`);
  ok(S.fresh.hud === 'minimal' && S.fresh.v2 === 1, 'a new save does not default to the MINIMAL HUD: ' + JSON.stringify(S.fresh));
  ok(S.old.hud === 'minimal', 'an old settings file (hud full, never marked) did not take MINIMAL: ' + JSON.stringify(S.old));
  ok(S.oldMin.hud === 'minimal', 'an old minimal file lost MINIMAL');
  ok(S.pick.hud === 'full', 'an explicit PLATE choice (hudV2) was overwritten: ' + JSON.stringify(S.pick));
  ok(S.pickMin.hud === 'minimal', 'an explicit MINIMAL choice was lost');
  ok(S.both.bossHp === 'num', 'the retired BAR+BOTH boss readout is not NUMBERS: ' + S.both.bossHp);
  ok(S.pct.bossHp === 'pct', 'the % readout was lost on load');
  await E('BK.ui.readSettings("{}")');

  /* ---- 2. the plate is slim ---- */
  const play = (hero, id) => E(`(async()=>{const {xpFloor}=await import('/src/xp.js');const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.setHero('${hero}');BK.reset({fresh:true});BKT.PROG.xp.${hero}=xpFloor(40);BK.load(LEVELS.findIndex(l=>l.id==='${id}'));BK.state='play';BK.sim(10);BK.god=true;BK.step(2);})()`);
  for (const h of ['knight', 'pyro', 'paladin', 'pirate', 'reaper', 'warden', 'geomancer']) {
    await play(h, 'wood'); await E(`(()=>{BK.SET.hud='full';Object.assign(BK.P,{resolve:100,heat:100,full:true,light:100,harvest:100,plunder:100,tremor:100,vigil:100,loaded:true,hp:BK.P.maxHp*0.5});BK.step(4)})()`);
    let r = await E('JSON.stringify({w:BK.uiHud.rects()[0][2],vw:BK.view.VW})'); r = JSON.parse(r);
    ok(r.w / r.vw <= 0.22, 'the plate HUD takes ' + Math.round(100 * r.w / r.vw) + '% of the width for the ' + h + ' (meters full)');
    await E(`(()=>{Object.assign(BK.P,{swim:true,breath:0});BK.step(3)})()`);
    r = JSON.parse(await E('JSON.stringify({w:BK.uiHud.rects()[0][2],vw:BK.view.VW})'));
    ok(r.w / r.vw <= 0.22, 'the plate HUD takes ' + Math.round(100 * r.w / r.vw) + '% of the width for the ' + h + ' (swimming, no air)');
  }

  /* ---- 3. one bar, the name once, one readout ---- */
  await play('knight', 'welltown');
  await E(`(()=>{BK.SET.hud='minimal';for(const e of BK.enemies()) if(!e.mini&&e!==BK.boss)e.alive=false;const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+3,Math.round(A.floor/16)-1)})()`);
  await E('(()=>{for(let i=0;i<260;i++){BK.sim(1)}BK.step(2)})()'); await E('(()=>{const b=BK.boss;if(b)b.hp=b.maxHp*0.62;BK.step(3)})()');
  ok(await E('!!(BK.boss&&BK.boss.alive)'), 'the Djinn fight did not start');
  for (const [mode, want] of [['bar', /^$/], ['pct', /^\d+%$/], ['num', /^\d+\/\d+$/]]) {
    const rec = JSON.parse(await E(`(()=>{BK.SET.bossHp='${mode}';window.__textRec=[];BK.step(2);const r=window.__textRec.filter(t=>t.kind==='text'&&t.y0>=BK.view.VH-30).map(t=>t.s);window.__textRec=null;return JSON.stringify(r)})()`));
    const digits = rec.filter(s => /\d/.test(s)), names = rec.filter(s => /^[A-Z][A-Z ',-]+$/.test(s));
    ok(names.length === 1, mode + ': the boss band says its name ' + names.length + ' times: ' + JSON.stringify(rec));
    ok(mode === 'bar' ? digits.length === 0 : digits.length === 1 && want.test(digits[0]), mode + ': the readout is not exactly one ' + want + ': ' + JSON.stringify(rec));
    const lines = await E(`BK.uiHud.rects().length`); ok(lines > 0, 'no hud rects');
  }

  /* ---- 4. the idle MINIMAL HUD ---- */
  await play('knight', 'wood');
  const idle = JSON.parse(await E(`(()=>{BK.SET.hud='minimal';BK.P.hp=BK.P.maxHp;BK.P.st=BK.P.maxSt;BK.step(3);window.__textRec=[];BK.step(2);const r=window.__textRec.filter(t=>t.kind==='text').map(t=>({s:t.s,x:t.x0,y:t.y0}));window.__textRec=null;return JSON.stringify({r,rect0:BK.uiHud.rects()[0]})})()`));
  ok(!idle.r.some(t => /^LV /.test(t.s)), 'idle MINIMAL still draws the level line');
  ok(idle.r.some(t => /\d\/\d+/.test(t.s)), 'idle MINIMAL lost the coin count: ' + JSON.stringify(idle.r.slice(0, 6)));
  ok(idle.rect0[2] === 0, 'idle MINIMAL still reserves a plate rect');
  const hurt = JSON.parse(await E(`(()=>{BK.P.hp=BK.P.maxHp*0.5;BK.step(3);window.__textRec=[];BK.step(2);const r=window.__textRec.filter(t=>t.kind==='text').map(t=>t.s);window.__textRec=null;return JSON.stringify(r)})()`));
  ok(hurt.some(s => /^\d+$/.test(s)), 'hurt MINIMAL does not show the HP number');
  ok(!(await E('BK.uiHud.rects().length < 1')), 'rects');
} finally { await pg.close(); }
if (fails.length) { console.log('FAIL hud-default:\n - ' + fails.join('\n - ')); process.exit(1); }
console.log('hud-default ok: MINIMAL is the default (a file from before takes it once), the plate HUD is <= 22% for every hero, a boss has its name once and one readout per setting, the idle HUD is only the counters.');
