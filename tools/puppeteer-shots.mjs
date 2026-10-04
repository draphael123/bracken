// tools/puppeteer-shots.mjs [hero=knight] [level=theatre] [salt=1] - THE PUPPETEER in the page (claude/puppeteer; PUPPETEER2): stills of one whole fight,
// the human bot playing it (src/puppeteer.js puppetPlan) at normal health, drawn frame by frame, saved at 2x into work/claude/puppeteer/ (or SHOTS_OUT) - one
// for each beat the first time it happens: the chained lever, a cut, a green window, his prop drop and snare line, the lever freed and glinting, the visit
// (he reels on the gallery), the told knockback, each scene's tell and effect (storm, night, inferno, sea), a scene's title, the masterpiece, the curtain.
// Not in the suite: pictures are for eyes.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';
const hero = process.argv[2] || 'knight', level = process.argv[3] || 'theatre', salt = +(process.argv[4] || 1);
const out = process.env.SHOTS_OUT || join(ROOT, 'work/claude/puppeteer'); mkdirSync(out, { recursive: true });
for (const f of readdirSync(out)) if (f.endsWith('.png')) unlinkSync(join(out, f));
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const res=[],got=new Set();
    const snap=(name,note)=>{if(got.has(name))return;got.add(name);const c=document.createElement('canvas');c.width=BK.view.VW*2;c.height=BK.view.VH*2;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,c.width,c.height);res.push([name,c.toDataURL('image/png'),note]);};
    await BK.bossLab({bosses:[${JSON.stringify(level)}],heroes:[${JSON.stringify(hero)}],healthMode:'normal',maxSecs:300,draw:true,salt:${salt},onFrame:({boss,P})=>{
      const s=BK.puppeteerHands().show();if(!s)return;const m=boss.mode,pups=s.puppets.filter(p=>p.alive&&p.mode!=='packed');
      const bru=pups.find(p=>p.t==='marionette'),har=pups.find(p=>p.t==='harlequin'),mp=pups.find(p=>p.t==='masterpiece');
      const key=BK.puppeteerHands().read().sceneKey,S=s,bat=S.batten;
      if(!S.free&&P.x<BK.L.arena.stage.pinX+30&&key!=='bare')snap('0-the-lever-chained','THE LEVER, CHAINED: a padlocked chain across the pin rail until both puppets are down');
      if(S.whips&&S.whips.length&&S.whips[0].t<0.55&&pups.some(p=>p.mode!=='heap'&&p.str.some(q=>q.cut)))snap('1-a-cut','A CUT: the snap - the cut length whipping away, the limb limp');
      if(bru&&bru.mode==='recover'&&!bru.dark)snap('2-the-brute-spent','THE BRUTE spent after a swing, glowing green: the window');
      if(S.drops.length&&S.drops[0].t<0.5)snap('3-the-prop-drop','HIS PROP DROP: the growing shadow, the sandbag (or a painted piece) coming down onto it');
      if(S.snare&&S.snare.ph==='tell')snap('4a-the-snare-told','THE SNARE LINE, TOLD: its height marked the width of the stage, the line at its wing');
      if(S.snare&&S.snare.ph==='sweep'&&Math.abs(S.snare.x-P.x)<60)snap('4b-the-snare-sweeps','THE SNARE LINE sweeping across (low: jump; high: duck)');
      if(m==='slack'&&S.chainFall)snap('5-the-lever-free','BOTH DOWN: the chain falls off the lever, the glint, his bar slack');
      if(m==='slack'&&bat&&bat.st==='down'&&!S.chainFall)snap('5b-the-lever-glints','THE LEVER GLINTS while the batten waits');
      if(m==='staggered'&&boss.openT<2.4)snap('6-he-reels-on-the-gallery','THE VISIT: he reels on the gallery - OPEN, his time and the visit share under him');
      if(m==='knockTell'&&boss.modeT<0.5)snap('7-the-knockback-told','THE KNOCKBACK, TOLD: his bar whirls, the gallery glows red');
      if(key==='storm'&&S.gust&&S.gust.ph==='tell'&&S.gust.t<0.5)snap('8a-storm-curtains-billow','THE STORM: the wing curtains billow before the gust');
      if(key==='storm'&&S.gust&&S.gust.ph==='on')snap('8b-storm-gust','THE STORM: the gust (streaks), heroes and puppets shoved');
      if(key==='night'&&pups.length)snap('9-night','THE NIGHT: the dark, two spotlights, a little light round the hero');
      if(key==='night'&&pups.some(p=>p.dark&&(p.mode==='recover'||p.mode==='stagger')))snap('9b-night-spent-in-the-dark','THE NIGHT: a spent puppet in the dark (the dashed grey ring)');
      if(key==='inferno'&&S.trap&&S.trap.ph==='tell'&&S.trap.t<0.5)snap('10a-inferno-told','THE INFERNO: one set of trapdoors glowing and smoking');
      if(key==='inferno'&&S.trap&&S.trap.ph==='burn')snap('10b-inferno-burns','THE INFERNO: the flames, the strips between clear');
      if(key==='sea'&&S.wave&&S.wave.ph==='tell'&&S.wave.t<0.4)snap('11a-sea-told','THE SEA: the wave flat rising in its wing');
      if(key==='sea'&&S.wave&&S.wave.ph==='roll'&&Math.abs(S.wave.x-P.x)<80)snap('11b-sea-rolls','THE SEA: the wave rolling the stage');
      if(S.title)snap('12-scene-title','A SCENE CHANGE: its name over the stage');
      if(mp&&/Tell$/.test(mp.mode))snap('13-phase3-the-masterpiece','PHASE 3: the masterpiece with the Harlequin');
    }});
    for(let i=0;i<70;i++){BK.P.inv=99;BK.sim(1);if(i%3===0)BK.step(1);}BK.step(1);snap('14-the-curtain-falls','HIS DEATH: the curtain comes down');
    return res;})()`, 1800000);
  r.forEach(([name, d, note]) => { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/puppeteer/' + name + '.png  -  ' + note); });
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
