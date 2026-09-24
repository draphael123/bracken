// tools/hero-trials.mjs — EVERY HERO HAS A YARD, AND THE NEW YARDS CAN BE FINISHED (2026-09-24, POLISH).
// The practice menu offered the WARDEN and the GEOMANCER a line that said "her yard is not built yet" where the other five
// have THE <HERO>'S TRIAL (level.js trialYard). Two things are asked here:
//   every   every hero on the hero list (main.js HEROES) has a LEVELS entry 'trial_<id>', and no practice line says "not built"
//   played  the Warden's and the Geomancer's yards, PLAYED through the real input in the real page, station by station: each
//           station's own thing is done to it (the point rung at the spear's length, the deflect / the wall on the flash, the marks,
//           the run-through, the pin, the pillar, STONEFALL, the full bar spent) until its gate lifts. A station nothing can finish
//           is a wall across the yard, so every one must end `done`.
// PROVED RED FIRST: before the two yards were built, `every` failed on warden and geomancer (no trial level) and `played` had
// nothing to play.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { openPage, ROOT } from './cdp.mjs';

const main = readFileSync(join(ROOT, 'src/main.js'), 'utf8');
const heroBlock = main.slice(main.indexOf('const HEROES = ['), main.indexOf('];', main.indexOf('const HEROES = [')));
const heroes = [...heroBlock.matchAll(/\{ id: '(\w+)'/g)].map(m => m[1]);
const drills = main.slice(main.indexOf('const YARD_DRILLS = {'), main.indexOf('};', main.indexOf('const YARD_DRILLS = {')));
const fails = [], ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;   /* ONLY=pin,flash: play just those stations (for building a yard; the gate runs them all) */
if (heroes.length < 7) fails.push('read only ' + heroes.length + ' heroes off main.js HEROES');
if (/not built/.test(drills)) fails.push('a practice line still says "not built": ' + (drills.match(/\w+: '[^']*not built[^']*'/g) || []).join('; '));

const pg = await openPage({ audio: false, fonts: false });
const out = {};
try {
  const ids = await pg.evalp(`import('/src/level.js').then(m => m.LEVELS.map(l => l.id))`);
  for (const h of heroes) if (!ids.includes('trial_' + h)) fails.push('no trial_' + h + ' in LEVELS');
  await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');
    window.__yard=h=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(h);BK.reset({fresh:true});BK.applyUpgrades();
      const i=LEVELS.findIndex(l=>l.id==='trial_'+h);if(i<0)return false;BK.load(i);BK.state='play';BK.god=false;BK.sim(30);return true;};
    window.__foes=st=>BK.enemies().filter(e=>e.alive&&e.x>st.x0*16&&e.x<st.gate*16).sort((a,b)=>a.x-b.x);
    window.__fresh=()=>{const P=BK.P;P.st=P.maxSt;P.hp=P.maxHp;};
    window.__tapC=()=>{BK.keys.block=true;BK.sim(1);BK.keys.block=false;};
    window.__play=(h,si,early=false,frames=60*90)=>{const st=BK.L.trial[si],P=BK.P,K=BK.keys,run=n=>{for(let i=0;i<n&&!st.done;i++)BK.sim(1);};
      for(const k in K)K[k]=false;for(let i=0;i<3&&(P.pinning||P.perch>0);i++){BK.press('jump');BK.sim(40);}BK.tp(st.x0+3,19);P.vx=0;P.vy=0;P.face=1;BK.sim(20);__fresh();
      const F=()=>__foes(st),kind=st.kind;let tries=0;
      if(kind==='tip'){for(let d=30;d<=44&&!st.done;d+=2)for(let k=0;k<2&&!st.done;k++){const e=F()[0];P.x=e.x-e.w/2-d;P.face=1;P.vx=0;BK.sim(12);__fresh();BK.press('atk');run(30);}}
      else if(kind==='runthrough'){while(!st.done&&tries++<6){const e=F()[0];P.x=e.x-30;P.face=1;P.vx=0;BK.sim(20);__fresh();K.atk=true;run(45);K.atk=false;run(50);}}
      else if(kind==='upheaval'){while(!st.done&&tries++<6){const e=F()[0];P.x=e.x-60;P.face=1;P.vx=0;BK.sim(10);__fresh();K.atk=true;run(50);K.atk=false;run(80);}}
      else if(kind==='pin'){while(!st.done&&tries++<8){const e=F()[tries%2]||F()[0];BK.sim(20);P.x=e.x;P.y=e.y-(e.h||8)-30;P.vx=0;P.vy=40;P.ground=false;P.face=1;__fresh();K.down=true;BK.press('atk');
          let f=0;while(!P.pinning&&f++<60)BK.sim(1);K.down=false;run(10);BK.press('jump');run(40);}}
      else if(kind==='stonefall'){while(!st.done&&tries++<6){const [a,b]=F();BK.sim(10);P.x=(a.x+b.x)/2;P.y=a.y-50;P.vx=0;P.vy=40;P.ground=false;P.face=1;__fresh();K.down=true;BK.press('atk');
          let f=0;while(!P.ground&&f++<80)BK.sim(1);K.down=false;run(40);}}
      else if(kind==='meter'){run(10);__fresh();__tapC();run(90);}
      else if(kind==='skill'){run(10);__fresh();BK.press('throw');run(60);__fresh();BK.press('skill2');run(60);}
      else if(kind==='flash'||kind==='tells'){const e=F()[0],late=early?-99:h==='geomancer'?2:3;let pressed=0,glintAt=-1,awayT=0;
        for(let f=0;f<frames&&!st.done;f++){P.face=Math.sign(e.x-P.x)||1;__fresh();const gap=Math.abs(e.x-P.x);if(awayT<=0){K.right=gap>30&&e.x>P.x;K.left=gap>30&&e.x<P.x;}
          if(kind==='flash'){if(e.mode==='cutTell'&&(e.glint||early)){if(glintAt<0)glintAt=f;if(!pressed&&(early?e.modeT>0.6:f-glintAt>=late)){__tapC();pressed=1;continue;}}else{glintAt=-1;pressed=0;}}
          else{if(e.mode==='swingTell'&&e.modeT<(h==='geomancer'?0.12:0.2)&&!pressed){__tapC();pressed=1;continue;}if(e.mode!=='swingTell')pressed=0;
            if(e.mode==='leapTell'||e.mode==='leap')awayT=40;if(awayT-->0){K.left=e.x>P.x;K.right=e.x<P.x;}}
          BK.sim(1);}
        K.left=K.right=false;}
      return {kind,got:st.got||0,n:st.n,done:!!st.done,have:st.have||null};};
    return 1})()`);
  for (const h of ['warden', 'geomancer']) {
    if (!(await pg.evalp(`__yard('${h}')`))) { out[h] = 'no yard'; continue; }
    const n = await pg.evalp('BK.L.trial.length'), rows = [];
    for (let i = 0; i < n; i++) { if (ONLY && !ONLY.includes(await pg.evalp(`BK.L.trial[${i}].kind`))) continue; rows.push(await pg.evalp(`__play('${h}',${i})`)); }
    out[h] = rows;
    for (const r of rows) if (!r.done) fails.push(h + ': station ' + r.kind + ' not finished (' + r.got + ' of ' + r.n + (r.have ? ' ' + JSON.stringify(r.have) : '') + ')');
    /* AND NOT OFF THE BEAT: C tapped as the tell STARTS, long before the flash, for three of his cuts - the station must not count it
       (her wall is up by then but is no longer new; his deflect has run out) */
    if (!ONLY || ONLY.includes('flash')) { await pg.evalp(`__yard('${h}')`); const fi = await pg.evalp("BK.L.trial.findIndex(q=>q.kind==='flash')");
      const r = await pg.evalp(`__play('${h}',${fi},true,60*9)`); out[h + 'Early'] = r; if (r.got) fails.push(h + ': a C tapped long before the flash was counted as the beat (' + r.got + ')'); }
    if (pg.errors.length) fails.push(h + ': page errors ' + JSON.stringify(pg.errors.slice(0, 3)));
  }
} finally { pg.close(); }
console.log(JSON.stringify({ heroes, out }));
assert.deepEqual(fails, []);
console.log('hero trials: all ' + heroes.length + ' heroes have a yard; the Warden\'s and the Geomancer\'s are played to the last gate');
