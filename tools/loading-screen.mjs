// tools/loading-screen.mjs - THE LOADING SCREEN (claude/loadbar, 2026-09-30). Daniel: "progress bars for loading and a hero do a dance at them."
// src/loading-screen.js puts a pixel bar with the percentage and the player's own hero dancing (his K.R.dance frames) over every slow load: the
// first boot (scripts, hero, art slices, tiles, props, sky, the first wood) and a wood entered from the map (and a restart, and a trial).
//   1. IT IS THERE. The page has window.BKLoad, index.html loads src/loading-screen.js before main.js, and main.js drives it.
//   2. THE BOOT BAR IS TRUE. The boot job finishes with every step it lists done (true progress 100% BEFORE the screen is dropped: the bar is
//      never forced to 100), the number on show never goes back, ends on 100, moved in many small steps, and the page threw nothing.
//   3. A FAST LOAD SHOWS NOTHING. A generator that finishes inside 150 ms is run straight through (its continuation is called before drive returns),
//      the screen never mounts a frame, and the game is not held.
//   4. A SLOW LOAD SHOWS THE BAR. A load that takes 400 ms puts the screen up, holds the game's input and the main loop (BKLoad.busy), the bar is
//      monotonic and ends at 100%, and the hero DANCES: the picture beside the bar changes through his frames, and it is not empty.
//   5. A REAL WOOD, THE HEAVIEST ONE, through BK.loadThen: the screen shows, the bar is monotonic to 100%, and the level it loads is EXACTLY the one
//      the plain synchronous BK.load builds (the generator changed how the load is paced, not what it builds).
//   node tools/loading-screen.mjs            the check
//   node tools/loading-screen.mjs --times    also print what every load costs here (boot steps, every wood)
//   node tools/loading-screen.mjs --shots=after|before   work/loadbar/<name>.png: the page mid-boot, as the player sees it
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { openPage, ROOT } from './cdp.mjs';

const arg = k => (process.argv.find(a => a.startsWith('--' + k + '=')) || '').slice(k.length + 3);
const TIMES = process.argv.includes('--times'), SHOT = arg('shots');
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---- a picture, mid-boot: the real page, screenshotted by the browser itself ---- */
if (SHOT) {
  const pg = await openPage({ audio: false, fonts: false, noWait: true });
  try {
    let got = false;
    for (let i = 0; i < 400 && !got; i++) {
      const p = await pg.evalp('(()=>{const s=window.BKLoad&&window.BKLoad.state;return s?Math.round(s.true*100):(document.getElementById("boot")?-1:-2)})()', 3000).catch(() => -3);
      if (p >= 45 || (p === -1 && i > 30)) got = true; else await sleep(80);
    }
    const shot = await pg.send('Page.captureScreenshot', { format: 'png' });
    const dir = join(ROOT, 'work', 'loadbar'); mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, SHOT + '.png'), Buffer.from(shot.result.data, 'base64'));
    console.log('wrote work/loadbar/' + SHOT + '.png');
  } finally { await pg.close(); }
  process.exit(0);
}

const HTML = readFileSync(join(ROOT, 'index.html'), 'utf8');
assert.ok(existsSync(join(ROOT, 'src/loading-screen.js')), 'src/loading-screen.js is missing: there is no loading screen');
assert.ok(HTML.indexOf('src/loading-screen.js') > 0 && HTML.indexOf('src/loading-screen.js') < HTML.indexOf('src/main.js'), 'index.html must load src/loading-screen.js BEFORE src/main.js (the bar has to be on the glass while the game\'s own scripts arrive)');
console.log('ok  wired          index.html loads the loading screen before main.js');

const pg = await openPage({ audio: false, fonts: false });
try {
  assert.equal(await pg.evalp('typeof window.BKLoad'), 'object', 'the page has no BKLoad: there is no loading screen');
  const mono = h => { for (let i = 1; i < h.length; i++) if (h[i] < h[i - 1] - 1e-9) return i; return -1; };

  /* 2. THE BOOT */
  const boot = await pg.evalp('(()=>{const s=BKLoad.state.stats;return s?{job:s.job,ms:s.ms,reached:s.reached,trace:s.trace,hist:s.hist,heroes:s.heroes,keys:Object.keys(BKLoad.JOBS.boot)}:null})()');
  assert.ok(boot && boot.job === 'boot', 'the boot never finished its bar (no boot stats)');
  assert.ok(boot.reached >= 0.999, 'the boot bar was only ' + Math.round(boot.reached * 100) + '% true when the game came up: a step in JOBS.boot is never reported (main.js LS.step / the level generator). The bar must be true, not forced to 100');
  const seen = new Set(boot.trace.map(t => t[0]));
  for (const k of boot.keys) assert.ok(seen.has(k), 'the boot step "' + k + '" never ran');
  assert.equal(mono(boot.hist), -1, 'the boot bar went BACKWARDS at sample ' + mono(boot.hist));
  assert.equal(boot.hist[boot.hist.length - 1], 1, 'the boot bar did not end on 100%');
  assert.ok(boot.hist.length >= 15, 'the boot bar moved in only ' + boot.hist.length + ' distinct steps (want 15 or more): it is one jump');
  assert.ok(boot.heroes >= 1, 'no hero dance frames reached the loading screen at boot');
  console.log('ok  boot bar       ' + boot.keys.length + ' steps, ' + boot.hist.length + ' distinct values, monotonic, ends on 100% after true ' + Math.round(boot.reached * 100) + '%, ' + boot.heroes + ' dancer(s), ' + boot.ms + ' ms');
  if (TIMES) console.log('    boot ms by step: ' + boot.trace.map(t => t.join(':')).join(' '));

  /* 3. A FAST LOAD SHOWS NOTHING */
  const fast = await pg.evalp(`(()=>{BK.manualSimulation=false;let sync=false,busyIn=null;
    const g=(function*(){yield 'build';busyIn=BKLoad.busy;yield 'tiles';yield 'props';yield 'sky';yield 'deep';yield 'rest'})();
    BKLoad.drive(g,()=>{sync=true});
    const cv=document.getElementById('loadscreen'),st=BKLoad.state.stats;
    BK.manualSimulation=true;
    return {sync,busyIn,busyAfter:BKLoad.busy,mounted:!!cv,shown:!!(cv&&cv.style.display==='block'),stShown:st.shown,ms:st.ms}})()`);
  assert.ok(fast.sync, 'a fast load was not run straight through (its continuation did not run before drive returned)');
  assert.equal(fast.busyIn, false, 'the game was held during a fast load');
  assert.equal(fast.busyAfter, false, 'the game is still held after a fast load');
  assert.ok(!fast.shown && !fast.stShown, 'a load of ' + fast.ms + ' ms flashed the loading screen (the rule is: nothing under 150 ms)');
  console.log('ok  no flash       a ' + fast.ms + ' ms load runs through untouched: no frame, no hold');

  /* 4. A SLOW LOAD SHOWS THE BAR, AND THE HERO DANCES */
  const slow = await pg.evalp(`(async()=>{BK.manualSimulation=false;const samples=[],hashes=new Set(),labels=new Set();let busySeen=false,inkSeen=false,keyHeld=null,firstShown=null;
    const spin=ms=>{const t=performance.now();while(performance.now()-t<ms);};
    const sample=()=>{const cv=document.getElementById('loadscreen');if(!cv||cv.style.display!=='block')return;const s=BKLoad.state;if(firstShown===null)firstShown=performance.now();
      busySeen=busySeen||BKLoad.busy;samples.push(s.disp);labels.add(s.label);
      const sc=Math.max(1,Math.floor(Math.min(cv.width/320,cv.height/180))),ox=Math.floor((cv.width-320*sc)/2),oy=Math.floor((cv.height-180*sc)/2);
      const x=ox+20*sc,y=oy+56*sc,w=80*sc,h=76*sc;const d=cv.getContext('2d').getImageData(x,y,w,h).data;let hsh=0,ink=0;
      for(let i=0;i<d.length;i+=4){hsh=(hsh*31+d[i]+d[i+1]*3+d[i+2]*7)|0;if(d[i]+d[i+1]+d[i+2]>120)ink++;}hashes.add(hsh);if(ink>30)inkSeen=true;
      if(keyHeld===null){window.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',code:'ArrowRight',bubbles:true,cancelable:true}));keyHeld=!!(BK.keys&&BK.keys.right);}};
    const iv=setInterval(sample,25);
    const g=(function*(){for(const id of ['build','tiles','props','sky','deep','rest']){sample();spin(90);yield id;}sample();})();
    await new Promise(res=>BKLoad.drive(g,res));clearInterval(iv);
    const st=BKLoad.state.stats;BK.manualSimulation=true;
    return {shown:st.shown,reached:st.reached,hist:st.hist,samples,dance:hashes.size,busySeen,inkSeen,keyHeld,labels:[...labels],busyAfter:BKLoad.busy,hidden:document.getElementById('loadscreen').style.display}})()`);
  assert.ok(slow.shown && slow.busySeen, 'a 540 ms load did not put the loading screen up');
  assert.ok(slow.reached >= 0.999, 'the bar was only ' + Math.round(slow.reached * 100) + '% true at the end of a load whose every step ran');
  assert.equal(mono(slow.hist), -1, 'the load bar went BACKWARDS');
  assert.equal(slow.hist[slow.hist.length - 1], 1, 'the load bar did not end on 100%');
  assert.equal(mono(slow.samples), -1, 'the number on the glass went backwards');
  assert.ok(new Set(slow.samples.map(v => v.toFixed(3))).size >= 3, 'the bar on the glass never moved between paints');
  assert.ok(slow.inkSeen, 'nothing is drawn where the hero dances');
  assert.ok(slow.dance >= 3, 'the hero does not dance: the picture beside the bar showed only ' + slow.dance + ' different frames');
  assert.equal(slow.keyHeld, false, 'a key pressed during the load reached the game');
  assert.ok(!slow.busyAfter && slow.hidden === 'none', 'the loading screen did not let go when the load ended');
  assert.ok(slow.labels.filter(Boolean).length >= 2, 'the line under the bar never named what is loading');
  console.log('ok  slow load      bar up, ' + slow.hist.length + ' values monotonic to 100%, hero drew ' + slow.dance + ' dance frames, input held, released after');

  /* 5. A REAL WOOD: the heaviest one, and it builds what the synchronous load builds */
  const real = await pg.evalp(`(async()=>{const out={};const sig=()=>{const L=BK.L;let h=0;for(let i=0;i<L.grid.length;i++)h=(h*31+L.grid[i])|0;return h+':'+L.ents.length+':'+L.W+'x'+L.H+':'+BK.levelIndex};
    const heavy=26;
    BK.manualSimulation=false;const t=performance.now();await new Promise(res=>BK.loadThen(heavy,res));out.ms=Math.round(performance.now()-t);const st=BKLoad.state.stats;
    out.shown=st.shown;out.reached=st.reached;out.hist=st.hist;out.trace=st.trace;out.driven=sig();
    BK.manualSimulation=true;BK.load(heavy);out.plain=sig();return out})()`);
  assert.equal(real.driven, real.plain, 'the loading-screen load built a different level from BK.load (' + real.driven + ' vs ' + real.plain + ')');
  assert.ok(real.reached >= 0.999, 'the real load bar was only ' + Math.round(real.reached * 100) + '% true at the end');
  assert.equal(mono(real.hist), -1, 'the real load bar went backwards');
  if (real.ms >= 300) assert.ok(real.shown, 'a ' + real.ms + ' ms load never showed the screen');
  console.log('ok  real wood      wood 26 in ' + real.ms + ' ms: ' + (real.shown ? 'bar shown' : 'quick enough to show nothing') + ', ' + real.hist.length + ' values monotonic to 100%, same level as the plain load');
  if (TIMES) {
    console.log('    wood 26 ms by step: ' + real.trace.map(t => t.join(':')).join(' '));
    const rows = await pg.evalp(`(()=>{BK.manualSimulation=true;const o=[];for(let i=0;i<40;i++){const t=performance.now();try{BK.load(i)}catch(e){o.push(i+':ERR');continue}o.push(i+':'+Math.round(performance.now()-t))}return o})()`);
    console.log('    every wood, plain load ms: ' + rows.join(' '));
  }

  assert.deepEqual(pg.errors, [], 'the page threw: ' + pg.errors.join(' | '));
  console.log('ok  console        no page errors through boot and every load above');
} finally { await pg.close(); }
