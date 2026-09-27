// work/claude/winch-shots.mjs <set> - THE ORE ROAD drawn by the REAL renderer (Node renders lie about light). Each shot: optionally a
// fresh load, a place (tile x, y), code run in the page first (pre), then steps until a condition (until, in page JS) or n frames,
// and the frame is saved. Sets: checks | cavern | final. Writes work/claude/or-<set>-<n>.jpg at 2x.
// usage: node work/claude/winch-shots.mjs final
import { openPage, ROOT } from '../../tools/cdp.mjs';
import { portFor } from '../../tools/ports.mjs';
import { writeFileSync } from 'fs';
import { join } from 'path';
const set = process.argv[2] || 'checks';
const SETS = {
  checks: `BK.L.ents.filter(e=>e.t==='check').map(e=>({x:e.x+3,y:e.y,n:60,label:'check '+e.x}))`,
  cavern: `[{x:30,y:36,n:260},{x:100,y:36,n:90},{x:230,y:27,n:90},{x:300,y:30,n:90},{x:430,y:12,n:90}]`,
  final: `[
    {label:'cavern 1: the yard, lamps, timbers, the roof', fresh:1, x:46, y:36, n:240},
    {label:'cavern 2: the first span over the chasm, the pit and its turbines far below', x:104, y:36, n:120},
    {label:'cavern 3: the sorting tower top deck', x:190, y:21, n:120},
    {label:'cavern 4: the wreck over its bed', x:306, y:31, n:120},
    {label:'a told rockfall: dust off the roof, the ring on the cable', fresh:1, x:103, y:36, n:900, until:"BK.props().some(p=>p.t==='rockfall'&&Math.abs(p.x-BK.P.x)<200&&p.timer>0.15&&p.timer<0.55&&(p.seenT||0)>0.4)"},
    {label:'a seam being struck (cracked, flashing)', fresh:1, pre:"const v=BK.L.veins.find(q=>q.x===61);BK.tp(v.x-1,v.y);BK.sim(30);BK.P.face=1;BK.press('atk');", x:null, n:8},
    {label:'the seam mined: the coins spilling', pre:"BK.sim(25);BK.P.face=1;BK.press('atk');BK.sim(25);BK.P.face=1;BK.press('atk');", x:null, n:6},
    {label:'the pit: the bite, the turbines roaring', fresh:1, pre:"for(const e of BK.enemies())if(!e.maxHp)e.alive=false;BK.sim(400);", x:100, y:49, n:200, until:"BK.P.pitLift&&BK.P.pitLift.t>0.15"},
    {label:'the turbine lift, on its way to the ledge', x:null, n:200, until:"BK.P.pitLift&&BK.P.pitLift.t>1.2"},
    {label:'the recovery ledge and the ladder home', x:null, n:600, until:"!BK.P.pitLift&&BK.P.ground"},
    {label:'the boss: up his ladder, fighting him on the Great Drum', fresh:1, pre:"for(const e of BK.enemies())if(!e.maxHp)e.alive=false;BK.sim(400);BK.tp(479,12);BK.sim(150);", x:511, y:8, n:40},
    {label:'the brake bar coming round on his housing', x:null, n:400, until:"BK.boss.mode==='leverTell'&&BK.boss.modeT<0.3"},
    {label:'he retreats: on the cable to the Head Frame', pre:"const b=BK.boss;b.hp=b.qMark-b.maxHp*0.26;", x:null, n:200, until:"BK.boss.mode==='swing'&&BK.boss.modeT<0.85"},
    {label:'on the Head Frame, and his rock off the roof told', x:null, n:600, until:"BK.boss.mode!=='swing'&&(BK.boss.rocks||[]).some(r=>r.t<0.6)"},
  ]`,
  /* ROUND THREE (Daniel 2026-09-24): the bigger housings over the drum pit, him bigger, the enraged leap told, the pit's lift, the bomb goblins and the bats */
  round3: `[
    {label:'the drum house from the entrance deck: the Head Frame (6 wide), its ladder down to the pit ledge, the pit below', fresh:1, pre:"for(const e of BK.enemies())if(!e.maxHp)e.alive=false;BK.sim(200);", x:484, y:12, n:90},
    {label:'the Tail Wheel (7 wide) and the Great Drum (9 wide), the spikes and turbines under them', x:505, y:8, n:40},
    {label:'him, bigger (1.3x), on the Great Drum, you up with him', x:514, y:8, n:120},
    {label:'ENRAGED: he crouches, HE CROUCHES TO LEAP, the red ring on the Tail Wheel where you stand', pre:"const b=BK.boss;b.qMark=-1e9;b.hp=Math.round(b.maxHp*0.45);b.revCd=b.sendCd=b.hookCd=b.leverCd=99;b.cd=0;b.leapCd=3;BK.tp(505,4);", x:null, n:900, until:"BK.boss.mode==='leapTell'&&BK.boss.modeT<0.35"},
    {label:'the leap in the air, the ring held on where he lands', x:null, n:120, until:"BK.boss.mode==='leap'&&BK.boss.modeT<0.45"},
    {label:'into the drum pit: the turbines take you', pre:"BK.boss.leapCd=99;BK.tp(492,20);", x:null, n:400, until:"BK.P.pitLift&&BK.P.pitLift.t>0.3"},
    {label:'the drum pit recovery ledge and the Head Frame ladder home', x:null, n:900, until:"!BK.P.pitLift&&BK.P.ground"},
    {label:'the bomb goblin back on the first pylon (the lookouts)', fresh:1, x:96, y:36, n:100},
    {label:'the Tipple House: a bomb goblin on the chute rest, bats (not harpies) over the chute', fresh:1, x:229, y:27, n:90},
  ]`,
};
const pg = await openPage({ port: portFor(7), audio: false, fonts: false });
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  const shots = await pg.evalp(`(async () => {
    const i = __LV.findIndex(l => l.id === 'oreroad'), load = () => { BK.setHero('knight'); BK.reset({fresh:true}); BK.load(i); BK.start(); BK.god = true; BK.sim(420); BK.P.hp = BK.P.maxHp; };   /* (long enough for the level's banners to have gone) */
    load(); const list = ${SETS[set] || set}, res = [];
    for (const s of list) { if (s.fresh) load(); if (s.x !== null && s.x !== undefined && !s.pre) BK.tp(s.x, s.y); if (s.pre) (0, eval)(s.pre); if (s.pre && s.x !== null && s.x !== undefined) BK.tp(s.x, s.y);
      let k = 0; for (; k < (s.n || 60); k++) { if (s.until && (0, eval)(s.until)) break; BK.step(1); }
      const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d');
      g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); res.push({ label: s.label || (s.x + ',' + s.y), met: !s.until || (0, eval)(s.until), k, d: c.toDataURL('image/jpeg', 0.92) }); }
    return res;
  })()`, 900000);
  shots.forEach((s, j) => { const f = join(ROOT, 'work/claude', `or-${set.replace(/[^a-z0-9]/gi, '').slice(0, 12)}-${j}.jpg`); writeFileSync(f, Buffer.from(s.d.split(',')[1], 'base64')); console.log(f, '|', s.label, s.met ? '' : '(CONDITION NOT MET after ' + s.k + ' frames)'); });
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
