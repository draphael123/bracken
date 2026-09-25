// work/claude/dk2-mother.mjs - THE MOTHER CAP'S LAST QUARTER, measured per hero: time, kill, and every heart window by phase
// (opened, cut, missed) with the knot's anchor (tiles from her) when it opened. One page per (mode, salt), all six heroes in
// mother-pilot's order and then the geomancer, so the six rows replay exactly as mother-pilot pins them.
//   node work/claude/dk2-mother.mjs            MODES=refill,normal SALTS=,1,2,3 HEROES=... OUT=file.json
//   MV=near|long sets window.__MV for a build that reads it (the lane measured its two options that way; the shipped code does not)
import { openPage } from '../../tools/cdp.mjs';
import { writeFileSync } from 'node:fs';
const heroes = (process.env.HEROES || 'knight,pyro,paladin,pirate,reaper,warden,geomancer').split(',');
const modes = (process.env.MODES || 'refill,normal').split(',');
const salts = (process.env.SALTS ?? ',1,2,3').split(',');
const all = {};
const pg = await openPage({ audio: false, fonts: false });
try {
  for (const mode of modes) for (const salt of salts) {
    await pg.reload();
    const r = await pg.evalp(`(async()=>{
      BK.manualSimulation=true;window.__MV=${JSON.stringify(process.env.MV || '')};
      const realSim=BK.sim;let cur=null;
      BK.sim=function(n){
        const b=BK.boss;
        if(n===1&&b&&b.t==='mother'&&BK.bossActive&&cur){
          const m0=b.mode,hp0=b.heart?b.heart.hp:null,ph=b.phase||1;
          const res=realSim.call(this,n);
          if(m0!=='open'&&b.mode==='open'){const node=BK.props().find(p=>p.motherNode);cur.win={ph,anchor:node?Math.round((node.x-b.x)/16):null,f:cur.f,dist:Math.round(Math.abs(BK.P.x-b.x))};}
          if(m0==='open'&&b.mode!=='open'&&cur.win){cur.win.cut=(b.heart?b.heart.hp:0)<hp0||!b.alive;cur.win.len=cur.f-cur.win.f;cur.wins.push(cur.win);cur.win=null;}
          cur.f++;return res;
        }
        return realSim.call(this,n);
      };
      const out=[];
      try{
        for(const h of ${JSON.stringify(heroes)}){
          cur={f:0,wins:[],win:null};
          const r=await BK.bossLab({bosses:['spore'],heroes:[h],healthMode:${JSON.stringify(mode)},maxSecs:180${salt ? `,salt:${JSON.stringify(salt)}` : ''}});
          const row=r.rows[0];if(cur.win){cur.win.cut=false;cur.win.len=cur.f-cur.win.f;cur.win.cutOff=true;cur.wins.push(cur.win);}
          const byPh={};for(const w of cur.wins){const k='p'+w.ph;byPh[k]=byPh[k]||{open:0,cut:0,missed:0,missedAt:[]};byPh[k].open++;if(w.cut)byPh[k].cut++;else{byPh[k].missed++;byPh[k].missedAt.push(w.anchor);}}
          out.push({h,secs:row.secs,killed:row.killed,outcome:row.outcome,died:row.health.died,swings:row.swings,byPh,p3:cur.wins.filter(w=>w.ph>=3).map(w=>[w.anchor,w.cut?1:0])});
        }
      }finally{BK.sim=realSim;}
      return out;
    })()`, 3600000);
    all[mode + '|' + (salt || 'pinned')] = r;
    for (const x of r) console.log(mode.padEnd(6), ('salt ' + (salt || '-')).padEnd(7), x.h.padEnd(9), String(x.secs).padStart(6), x.killed ? 'kill' : 'FAIL', x.died ? 'died' : '    ',
      'p3', JSON.stringify(x.byPh.p3 || {}), 'missed', Object.values(x.byPh).reduce((a, b) => a + b.missed, 0));
    if (process.env.OUT) writeFileSync(process.env.OUT, JSON.stringify(all, null, 1));
  }
  console.log('errors', JSON.stringify(pg.errors));
} finally { pg.close(); }
