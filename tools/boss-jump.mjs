// tools/boss-jump.mjs - THE PLAYTEST BOSS JUMP LOADS EVERY BOSS AND MINI, AND NEVER TOUCHES THE PLAYER'S SAVE (docs/PLAYTEST.md).
// In the page, with a real save already in storage, for EVERY row of the hidden boss table (BK.bossJump.table(): read from every level's
// own arena and mini, and required to be exactly what the levels build, so a NEW boss appears by itself):
//   1. jump through the same function ?boss=<id> calls (BK.bossJump.go; a boss by its own id, a mini as <level>:mini);
//   2. the fight is live: state 'play', the level's arena (or mini) is that boss's, the boss is on the board, alive, at full health for
//      the hero, no god mode, and its fight wakes (bossActive / miniActive) within ten seconds of standing at the door;
//   3. THE SAVE IS UNTOUCHED: every localStorage key and value is compared before and after the boss is cut down and the fight and its
//      level-clear have run their course (kill, win, music heard, coins banked all go through saveProgress). Any difference fails.
// A page load is slow (about ten seconds), so the real URL is loaded for a handful of ids that cover the kinds of fight (the first boss, a
// mini whose save says it is already down, the carpet sky fight, the last row) and for &hero=, a level id, a bad hero, a bad id; and SHIFT+B
// on the title screen opens the same list, scrolls it, and ENTER jumps into the chosen fight with the chosen hero.
//   BJ_ONLY=queen,frog node tools/boss-jump.mjs      only those rows (debugging)
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false }); const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SAVE = { hero: 'knight', heroes: { knight: true }, wood: { cleared: true, mini: true, medal: 2 }, kings: { cleared: true, mini: true } };
/* Put the page on `url` with the seeded save in storage (written by the page being left, so it is there before the new one loads) */
async function nav(url, seed = true) {
  try { await pg.evalp('(()=>{' + (seed ? 'localStorage.clear();localStorage.setItem("bracken.progress.0",' + JSON.stringify(JSON.stringify(SAVE)) + ');' : '') + 'window.__gone=1;setTimeout(()=>location.assign(' + JSON.stringify(url) + '),0);return 1})()', 8000); } catch {}
  const search = url.replace(/^[^?]*/, '');
  for (let i = 0; i < 400; i++) { await sleep(150); const r = await pg.evalp('!window.__gone&&typeof window.BK==="object"&&!!window.BK.lookPass&&location.search===' + JSON.stringify(search), 3000).catch(() => false); if (r) return true; }
  throw new Error('page never came up on ' + url);
}
const store = () => pg.evalp('JSON.stringify(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)]))', 8000);
const argOf = r => r.kind === 'mini' ? r.level + ':mini' : r.t;
/* the fight, as it stands after a jump: what the probes below read */
const FIGHT = `(kind,t)=>{const A=kind==='mini'?BK.L.mini:BK.L.arena;const e=BK.enemies().find(q=>q.t===t&&q.alive&&(kind==='boss'||q.mini||q.t==='greathound'));
  return{state:BK.state,arena:A&&A.boss,hasBoss:!!e,hp:BK.P.hp,maxHp:BK.P.maxHp,god:!!BK.god,hero:BK.PROG.hero,on:BK.bossJump.on,seed:!!(BK.PROG.wood&&BK.PROG.wood.cleared)};}`;
const KILL = `async(kind,t)=>{BK.manualSimulation=true;const live=()=>kind==='mini'?BK.miniActive:BK.bossActive;
  const e=BK.enemies().find(q=>q.t===t&&q.alive&&(kind==='boss'||q.mini||q.t==='greathound'));const o={};
  let f=0;for(;f<600&&!live();f++)BK.sim(1);o.woke=live();o.wokeAt=f;
  if(e){let n=0;for(;n<1000&&e.alive;n++){BK.P.inv=99;BK.P.hp=BK.P.maxHp;e.hp=Math.min(e.hp,1);e.inv=0;BKT.hurtEnemy(e,999,e.x-10,false);BK.sim(2);}o.killed=!e.alive;o.blows=n;}
  for(let i=0;i<500;i++){BK.P.inv=99;BK.sim(1);}
  return o;}`;
const judge = (id, p, k) => {
  ok(p.on, id + ': bossJump.on was not set'); ok(p.state === 'play', id + ': not in play, state ' + p.state);
  ok(p.arena === (k && k.t), id + ': the level\'s ' + (k && k.kind) + ' is ' + p.arena); ok(p.hasBoss, id + ': its boss is not on the board');
  ok(p.hp === p.maxHp && p.maxHp > 0, id + ': not at full health: ' + p.hp + '/' + p.maxHp); ok(p.god === false, id + ': god mode is on');
  ok(p.seed, id + ': the seeded save was not the one loaded (the check is not testing anything)');
};
let table, results = [];
try {
  await nav('/?bj=table');
  const rows = await pg.evalp('(async()=>{const {LEVELS}=await import("/src/level.js");const want=[];for(const lv of LEVELS){let b;try{b=lv.build();}catch{continue;}for(const k of ["mini","arena"])if(b[k]&&b[k].boss)want.push(lv.id+":"+k+":"+b[k].boss);}return{table:BK.bossJump.table(),want};})()', 120000);
  table = rows.table; const tt = table.map(r => r.level + ':' + (r.kind === 'mini' ? 'mini' : 'arena') + ':' + r.t);
  ok(table.length > 40, 'the boss table is nearly empty: ' + table.length);
  ok(JSON.stringify(tt) === JSON.stringify(rows.want), 'the table is not every arena and mini the levels build, in order: ' + tt.length + ' vs ' + rows.want.length);
  ok(new Set(table.map(r => r.t)).size === table.length, 'a boss id appears twice in the table (the URL id would be ambiguous)');
  ok(table.every(r => r.name && r.levelName), 'a row has no name');
  const only = (process.env.BJ_ONLY || '').split(',').filter(Boolean);
  const s0 = await store();
  ok(s0.includes('bracken.progress.0'), 'the seeded save is not in storage');
  for (const r of table) {
    if (only.length && !only.includes(r.t)) continue;
    const t0 = Date.now(), id = r.kind + ' ' + r.t + ' (' + r.level + ')', k = { t: r.t, kind: r.kind === 'mini' ? 'mini' : 'boss' };
    const went = await pg.evalp('BK.manualSimulation=true,BK.bossJump.go(' + JSON.stringify(argOf(r)) + ')', 60000);
    ok(went === true, id + ': go() found no such boss');
    judge(id, await pg.evalp('(' + FIGHT + ')(' + JSON.stringify(k.kind) + ',' + JSON.stringify(r.t) + ')'), k);
    const p = await pg.evalp('(' + KILL + ')(' + JSON.stringify(k.kind) + ',' + JSON.stringify(r.t) + ')', 600000);
    ok(p.woke, id + ': the fight never woke within ten seconds of the door');
    results.push({ id, killed: p.killed });
    console.log('  ' + id.padEnd(34) + 'woke at frame ' + String(p.wokeAt).padEnd(4) + (p.killed ? 'cut down' : 'NOT cut down').padEnd(14) + ((Date.now() - t0) / 1000).toFixed(1) + 's');
  }
  ok((await store()) === s0, 'THE SAVE CHANGED across ' + results.length + ' fights, each cut down and run out (localStorage before and after differ)');
  /* THE REAL URL, for the kinds of fight: it must land in the same place through ?boss= (the handler at the foot of main.js) */
  const urls = [table[0], table.find(r => r.kind === 'mini'), table.find(r => r.t === 'undeadmage'), table[table.length - 1]].filter(Boolean);
  for (const r of urls) {
    if (only.length) break;
    await nav('/?boss=' + argOf(r)); const before = await store();
    const k = { t: r.t, kind: r.kind === 'mini' ? 'mini' : 'boss' };
    judge('URL ?boss=' + argOf(r), await pg.evalp('(' + FIGHT + ')(' + JSON.stringify(k.kind) + ',' + JSON.stringify(r.t) + ')'), k);
    const p = await pg.evalp('(' + KILL + ')(' + JSON.stringify(k.kind) + ',' + JSON.stringify(r.t) + ')', 600000);
    ok(p.woke, 'URL ?boss=' + argOf(r) + ': the fight never woke'); ok((await store()) === before, 'URL ?boss=' + argOf(r) + ': THE SAVE CHANGED');
    console.log('  URL ?boss=' + argOf(r));
  }
  if (!only.length) {
    /* &hero=, level ids, a mini by level id, and a bad id */
    await nav('/?boss=queen&hero=pyro');
    let s = await pg.evalp('({hero:BK.PROG.hero,state:BK.state,t:BK.enemies().some(e=>e.t==="queen")})');
    ok(s.hero === 'pyro' && s.state === 'play' && s.t, '?boss=queen&hero=pyro: ' + JSON.stringify(s));
    await nav('/?boss=queen&hero=nobody');
    s = await pg.evalp('({hero:BK.PROG.hero,state:BK.state})'); ok(s.hero === 'knight' && s.state === 'play', 'a bad hero id must fall back to the saved hero: ' + JSON.stringify(s));
    await nav('/?boss=kings');
    s = await pg.evalp('({lvl:BK.L.arena&&BK.L.arena.boss,state:BK.state})'); ok(s.lvl === 'king' && s.state === 'play', '?boss=<level id> is that level\'s boss: ' + JSON.stringify(s));
    await nav('/?boss=kings:mini');
    s = await pg.evalp('({m:BK.L.mini&&BK.L.mini.boss,state:BK.state,p:BK.PROG.kings.mini})'); ok(s.m === 'greathound' && s.state === 'play' && s.p === false, '?boss=kings:mini fights the mini even though the save has it down: ' + JSON.stringify(s));
    await nav('/?boss=nonsense');
    s = await pg.evalp('({state:BK.state,on:BK.bossJump.on})'); ok(s.state === 'title' && !s.on, 'a bad boss id must leave the title screen alone: ' + JSON.stringify(s));
    /* THE TITLE-SCREEN CHORD */
    await nav('/');
    const c0 = await store();
    const chord = await pg.evalp(`(async()=>{BK.manualSimulation=true;const key=(k,shift)=>{window.dispatchEvent(new KeyboardEvent('keydown',{key:k,shiftKey:!!shift}));window.dispatchEvent(new KeyboardEvent('keyup',{key:k,shiftKey:!!shift}));BK.sim(1);};
      const o={};BK.state='title';BK.sim(2);key('b',false);o.plainB=BK.state;key('B',true);o.opened=BK.state;BK.sim(6);o.n=BK.bossJump.table().length;
      key('ArrowDown');o.down=BK.bossJump.cursor;key('ArrowUp');key('ArrowUp');o.wrap=BK.bossJump.cursor;
      key('ArrowRight');o.hero=BK.bossJump.hero;key('Escape');o.back=BK.state;
      key('B',true);BK.sim(6);o.reopened=BK.state;const last=BK.bossJump.table().length-1;BK.bossJump.cursor=last;key('ArrowRight');const want=BK.bossJump.hero;key('Enter');
      o.jumped=BK.state;o.wantHero=want;o.gotHero=BK.PROG.hero;o.tLast=BK.bossJump.table()[last].t;o.boss=BK.enemies().some(e=>e.t===o.tLast&&e.alive);o.on=BK.bossJump.on;return o;})()`, 300000);
    ok(chord.plainB === 'title', 'plain B must not open the boss list: ' + JSON.stringify(chord));
    ok(chord.opened === 'bossjump', 'SHIFT+B on the title must open the list: ' + JSON.stringify(chord));
    ok(chord.n === table.length, 'the list must hold every table row');
    ok(chord.down === 1 && chord.wrap === table.length - 1, 'UP/DOWN must scroll and wrap: ' + JSON.stringify(chord));
    ok(chord.hero !== 'knight' && chord.back === 'title', 'RIGHT must change the hero and ESC must go back: ' + JSON.stringify(chord));
    ok(chord.jumped === 'play' && chord.boss && chord.gotHero === chord.wantHero && chord.on, 'ENTER on the last row must jump into that fight with the chosen hero: ' + JSON.stringify(chord));
    ok((await store()) === c0, 'the chord jump changed the save');
  }
} finally { pg.close(); }
for (const x of fails) console.log('  ' + x);
if (fails.length) { console.log('BOSS-JUMP: ' + fails.length + ' problem(s)'); process.exit(1); }
console.log('BOSS-JUMP: all ' + results.length + ' boss and mini fights load through ?boss=<id> at full health with no god mode and wake at the door; ' + results.filter(x => x.killed).length + ' were cut down and run out and the save (every localStorage key) never changed; the real URL, &hero=, level ids, <level>:mini, a bad id and SHIFT+B all behave.');
