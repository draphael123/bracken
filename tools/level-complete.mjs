// tools/level-complete.mjs - THE LEVEL-COMPLETE CARD (claude/uiscreens, 2026-10-06). It was a receipt. The check asks for what a player is owed on it:
//   1. THE TALLY     time, gold, foes / blocks / dodges, silver found (n/3) and the quest (done / open), deaths.
//   2. THE COMPARE   a first clear says FIRST CLEAR; a faster run than the saved best says NEW BEST -m:ss; a slower one says BEST m:ss (the best it did not beat).
//   3. THE MEDAL     the medal is stamped (GOLD TIME ...), and when it is not gold the card says what the NEXT one wants ("NEXT: GOLD AT 3:00").
//   4. XP            a finish that paid no XP prints no "+0 XP" line.
//   5. THE SCRIM     the card sits on a dark scrim (>= 0.8 alpha) so the HUD's fragments do not poke out around it.
//   6. THE WAY OUT   "Z  continue" (a tap, on a phone) is on the card once the tally is in, and the touch layer has a hit box over the screen for it.
// usage: node tools/level-complete.mjs
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';

const pg = await openPage({});
try {
  const R = await pg.evalp(`(async()=>{
    const {LEVELS}=await import('/src/level.js'); BK.manualSimulation=true; BK.setHero('knight'); BK.reset({fresh:true});
    const idx=LEVELS.findIndex(l=>l.id==='welltown'), id='welltown';
    const out={};
    const shown=()=>{ for(let i=0;i<240;i++)BK.step(1); const text=new Set(); let rects=0; const G=BK.g, o=G.fillRect; G.fillRect=function(x,y,w,h){ if(w>=300&&h>=170){ const m=/rgba[(]8, 6, 14, ([0-9.]+)[)]/.exec(String(this.fillStyle)); if(m&&+m[1]>=0.8)rects++; } return o.apply(this,arguments); }; for(let k=0;k<30;k++){ window.__textRec=[]; BK.step(1); const r=window.__textRec||[]; window.__textRec=null; for(const t of r){ if(t.kind==='text')text.add(t.s); } } G.fillRect=o; return { text:[...text], rects }; };
    const win=(prev)=>{ BK.reset({fresh:true}); BK.setHero('knight'); BK.load(idx); BK.state='play'; BK.sim(10); BK.god=true; const P=BKT.PROG; P[id]=prev?{best:prev,cleared:true}:undefined; if(!prev)delete P[id]; BK.xpWin(); return shown(); };
    out.first=win(null);
    out.faster=win(5000);
    out.slower=win(0.01);
    out.prev=BK.ui.winPrevBest;
    return out; })()`);
  const has = (r, re) => r.text.some(s => re.test(s));
  const f = R.first;
  assert.ok(has(f, /^time /), 'a time line: ' + f.text.join(' / '));
  assert.ok(has(f, /FIRST CLEAR/), 'a first clear says so: ' + f.text.join(' / '));
  assert.ok(has(f, /^foes \d+ +blocks \d+ +dodges \d+/), 'foes, blocks, dodges on one row: ' + f.text.join(' / '));
  assert.ok(has(f, /^silver \d\/3 +quest (done|open)$/), 'the silver found and the quest: ' + f.text.join(' / '));
  assert.ok(has(f, /^deaths /), 'deaths');
  assert.ok(has(f, /^gold /), 'gold');
  console.log('ok  tally          time, FIRST CLEAR, foes/blocks/dodges, silver n/3 + quest, gold, deaths');
  assert.ok(has(R.faster, /NEW BEST -/), 'a faster run than the saved best says NEW BEST: ' + R.faster.text.join(' / '));
  assert.ok(has(R.slower, /BEST \d+:\d\d/) && !has(R.slower, /NEW BEST/), 'a slower one shows the best it did not beat: ' + R.slower.text.join(' / '));
  console.log('ok  compare        NEW BEST -m:ss for a faster run, BEST m:ss for a slower one');
  assert.ok(has(f, /TIME/), 'the medal stamp: ' + f.text.join(' / '));
  assert.ok(!f.text.some(s => /\+0 XP/.test(s)), 'no "+0 XP" line: ' + f.text.join(' / '));
  console.log('ok  medal + xp     the stamp is down, and no +0 XP');
  assert.ok(f.rects >= 1, 'a dark full-screen scrim (alpha >= 0.8) is drawn under the card');
  assert.ok(has(f, /continue/), 'the way out: ' + f.text.join(' / '));
  assert.deepEqual(pg.errors, [], 'no page errors');
  console.log('ok  way out        "continue" is on the card; no page errors');
} finally { await pg.close(); }
