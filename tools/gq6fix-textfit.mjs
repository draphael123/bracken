// PAGE TOOL: launches headless Chrome
/* tools/gq6fix-textfit.mjs - GQ6FIX: does the NEW tower-top text fit? The gq5q2-textfit recording (src/main.js __textRec, textfit.mjs's own OFFSCREEN / OVERFLOW / COLLIDE math), driving the real roof entry (toRoof), the teach
   shard's prompt, a direct blow on her (the roof WARDED line + its hint) and the reflected-stone hit confirm. Strings read: STRIKE IT!, STRUCK - 8%!, WARDED - REFLECT HER STONES, the entry hint + plate, the ward hint.
   node tools/gq6fix-textfit.mjs */
import { openPage } from './cdp.mjs';
process.env.BRACKEN_GQ5Q2 = '1';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
    const {LEVELS}=await import('/src/level.js');
    const BK=window.BK, G=BK.g;
    // ---- the same fillRect/roundRect/strokeRect -> window.__textRec patch tools/textfit.mjs applies (verbatim) ----
    const orig={}; for (const m of ['fillRect','roundRect','strokeRect']) { orig[m]=G[m]; G[m]=function(x,y,w,h,...rest){
      const rr=(m==='fillRect'&&(typeof this.fillStyle!=='string'||(this.globalAlpha*(/^rgba(.*,s*([d.]+))$/.exec(this.fillStyle)?+RegExp.$1:1))<0.25))?null:window.__textRec;
      if (rr && Math.abs(w)>=6 && Math.abs(h)>=6) rr.push({kind:'rect',m,x0:Math.min(x,x+w),y0:Math.min(y,y+h),w:Math.abs(w),h:Math.abs(h)});
      else if (rr && m==='fillRect' && Math.abs(w)>=12 && Math.abs(h)>=1 && this.globalAlpha>=0.3) rr.push({kind:'bar',x0:Math.min(x,x+w),y0:Math.min(y,y+h),w:Math.abs(w),h:Math.abs(h)});
      return orig[m].call(this,x,y,w,h,...rest); }; }
    // ---- textfit.mjs's own analyse(), trimmed to OFFSCREEN/OVERFLOW/COLLIDE (verbatim math, tools/textfit.mjs:90-123) ----
    const issues=[]; const seenIssue=new Set();
    const report=(type,screen,t,extra={})=>{ const key=type+'|'+t.s+'|'+(t.at||'')+'|'+(extra.other||''); if (seenIssue.has(key)) return; seenIssue.add(key);
      issues.push(Object.assign({type,screen,s:t.s,at:t.at},extra)); };
    function analyse(screen, rec) {
      const VW=BK.view.VW, VH=BK.view.VH; rec.forEach((r,i)=>{r.i=i;});
      const texts=rec.filter(r=>r.kind==='text' && !r.world && r.s && r.s.trim() && r.alpha>0.05);
      for (const t of texts) {
        if (t.x0<-1 || t.x0+t.w>VW+1 || t.y0<-1 || t.y0+t.h>VH+1) report('OFFSCREEN',screen,t,{box:[t.x0,t.y0,t.w,t.h],VW,VH});
        const ax=t.align==='center'?t.x0+t.w/2:t.align==='right'?t.x0+t.w-2:t.x0+2, ay=t.y0+t.h/2;
        const inside=r=>{const ix=Math.min(t.x0+t.w,r.x0+r.w)-Math.max(t.x0,r.x0), iy=Math.min(t.y0+t.h,r.y0+r.h)-Math.max(t.y0,r.y0); return ix>0&&iy>0?ix*iy/Math.max(1,t.w*t.h):0;};
        const under=rec.filter(r=>r.kind==='rect'&&r.i<t.i&&(((r.m==='board')&&ax>=r.x0&&ax<=r.x0+r.w&&ay>=r.y0&&ay<=r.y0+r.h)||((r.w<VW-2||r.h<=40)&&t.x0>=r.x0&&t.x0+t.w<=r.x0+r.w&&t.y0>=r.y0&&t.y0+t.h<=r.y0+r.h))).pop(), floor=under?under.i:-1;
        const cands=rec.filter(r=>r.kind==='rect'&&r.i<t.i&&r.i>=floor&&ax>=r.x0&&ax<=r.x0+r.w&&ay>=r.y0&&ay<=r.y0+r.h&&r.h>=t.h&&r.w>=20&&!(r.w>=VW-2&&r.h>=VH-2)&&(r.m==='board'?inside(r)>0:inside(r)>=0.35&&t.y0>=r.y0-1&&t.y0+t.h<=r.y0+r.h+1));
        if (cands.length && t.style!=='outline') { const p=cands.reduce((a,b)=>a.w*a.h<=b.w*b.h?a:b);
          const over=Math.max(p.x0-t.x0, t.x0+t.w-(p.x0+p.w), p.y0-t.y0, t.y0+t.h-(p.y0+p.h));
          if (over>2) report('OVERFLOW',screen,t,{by:Math.round(over),plate:[Math.round(p.x0),Math.round(p.y0),Math.round(p.w),Math.round(p.h)],text:[t.x0,t.y0,t.w,t.h]}); } }
      for (let a=0;a<texts.length;a++) for (let b=a+1;b<texts.length;b++) { const A=texts[a],B=texts[b];
        if (A.s===B.s && Math.abs(A.x0-B.x0)<=1 && Math.abs(A.y0-B.y0)<=1) continue;
        const ix=Math.min(A.x0+A.w,B.x0+B.w)-Math.max(A.x0,B.x0), iy=Math.min(A.y0+A.h,B.y0+B.h)-Math.max(A.y0,B.y0);
        if (ix>1 && iy>1) report('COLLIDE',screen,A,{other:B.s}); }
      /* (claude/prepqon) the OFFSCREEN / OVERFLOW / COLLIDE math above stays HUD-only (world text is in world coordinates), but the strings SEEN include world text: the plate lines and ctx.number() words (WARDED, SHE RUNS) are drawn inside the map transform (world:true) and were filtered out, so this tool read 0 of 4 (rel180) */
      return rec.filter(r=>r.kind==='text' && r.s && r.s.trim() && r.alpha>0.05).map(r=>r.s);
    }
    // ---- drive the real roof entry, warded perch and sweep, recording every frame along the way ----
    BK.manualSimulation=true; BK.SET.speed=1; BK.setHero('knight'); BK.reset({fresh:true}); BK.load(LEVELS.findIndex(l=>l.id==='crown')); BK.state='play'; BK.god=false; BK.step(5);
    const A=BK.L.arena; BK.tp(Math.round(A.trigger/16)+1, Math.round(A.floor/16)-1);
    for (let k=0;k<300;k++){BK.P.hp=BK.P.maxHp;BK.step(1);}
    let q=BK.boss;   /* (rel181: the old hall timers pinned to 99 here stopped skipRoof from ever reaching the roof, so no roof string was drawn; the probe that left them alone reads all four) */
    const P=BK.P, run=k=>{for(let i=0;i<k;i++){P.hp=P.maxHp;BK.step(1);}};   /* (GQ5Q2-TUNE textfit fix: BK.sim() updates but never render()s - src/main.js:38667 vs 38678 - so text()/number() never ran and window.__textRec stayed empty; BK.step() renders every call) */
    q.hp=2; const hu=BK.hurt||(BK.env&&BK.env().hurt); if (hu) hu(q,50,P.x); run(140);
    const H=BK.gqHands();
    const allSeen=new Set(); window.__textRec=[];   // (GQ5Q2-TUNE textfit fix: E.begin() draws the hint+plate ONCE, synchronously inside skipRoof() itself - __textRec must already be the array BEFORE calling it, not after)
    run(900);   /* the escape's own hint has run out, as it has by the time a real player has climbed the tower */ H.skipRoof(); for (let f=0;f<240;f++){ run(1); for (const s of analyse('roof entry', window.__textRec)) allSeen.add(s); window.__textRec=[]; }   /* (rel181) analyse ONE frame at a time: the rect patch pushes ~900 rects a frame and the recorder stops at 20000 entries, so a 90-frame window never reached the hint */
    window.__textRec=null;
    /* the teach prompt, struck home, then a direct blow */ const G52=H.q52(); { window.__textRec=[]; q.mode='roofStand'; q.modeT=99; const T=G52.state().teach; T.done=false; T.shard=null; T.tellAt=0; T.nextAt=0; T.n=0; q.modeT=0; let sh=null; for (let f=0; f<300; f++) { run(1); for (const s of analyse('teach', window.__textRec)) allSeen.add(s); window.__textRec=[]; sh=T.shard||sh; if (T.shard && !T.shard.home && Math.abs(T.shard.x-P.x)<20) { P.face=T.shard.x<P.x?-1:1; BK.press('atk'); } if (T.struck) break; } for (let f=0; f<40; f++){ run(1); for (const s of analyse('struck home', window.__textRec)) allSeen.add(s); window.__textRec=[]; }
      q.mode='roofStand'; q.modeT=99; q.x=P.x+26; q.y=P.y; P.face=1; BK.press('atk'); for (let f=0; f<60; f++){ run(1); for (const s of analyse('direct blow', window.__textRec)) allSeen.add(s); window.__textRec=[]; } window.__textRec=null; }
    window.__textRec=[]; q.mode='roofStand'; q.modeT=99; G52.state().perch.phase='idle'; G52.state().perch.nextAt=0; G52.perchStart(q);
    for (let i=0;i<60 && q.mode!=='perch'; i++) run(1); for (let f=0;f<150;f++){ run(1); for (const s of analyse('cupola warded', window.__textRec)) allSeen.add(s); window.__textRec=[]; }
    window.__textRec=null;
    window.__textRec=[]; q.mode='roofStand'; q.modeT=99; q.x=P.x+30; q.face=-1; const st=G52.state(); st.sweep.cd=0; G52.sweepStart(q); for (let f=0;f<60;f++){ run(1); for (const s of analyse('sceptre sweep tell', window.__textRec)) allSeen.add(s); window.__textRec=[]; }
    window.__textRec=null;
    for (const m in orig) G[m]=orig[m];
    return { issues, allSeen: [...allSeen], stringsSeen: [...allSeen].filter(s=>/STRIKE HER STONES BACK AT HER|AND WHEN SHE HIDES IN THE BELL, RING IT|STRIKE IT!|STRUCK - 8%!|WARDED - REFLECT HER STONES|HER WARD TURNS BLADES|WARDED - RING THE BELL|SHE RUNS FOR THE BELL|CLANK OR A SCRATCH|A SCRATCH/.test(s)) };
  })()`, 120000);
  console.log('GQ6FIX textfit-style overflow check (real page, real roof entry + teach + direct blow):');
  console.log('  our strings actually drawn and measured: ' + JSON.stringify(r.stringsSeen));
  console.log('  DEBUG all strings seen: ' + JSON.stringify(r.allSeen));
  console.log('  issues found: ' + (r.issues.length ? JSON.stringify(r.issues, null, 1) : 'NONE'));
  console.log('page errors: ' + JSON.stringify(pg.errors.slice(0, 6)));
} finally { await pg.close(); }
