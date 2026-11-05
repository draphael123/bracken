import { openPage } from './cdp.mjs';
import { readFileSync } from 'fs';
const src = readFileSync('tools/knight-kit.mjs','utf8');
const setup = src.match(/await pg\.evalp\(`([\s\S]*?)`\);/)[1];
const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.evalp(setup);
  console.log(JSON.stringify(await pg.evalp(`(()=>{const fs=__set([['dummy',-24],['dummy',-44],['dummy',24],['dummy',44]]);const p=BK.P;const log=[];log.push(['p',p.x,p.y,fs.map(e=>[e.x,e.y,e.h])]);BK.P.atkHeld=0;BK.keys.atk=true;for(let i=0;i<60;i++)BK.sim(1);BK.keys.atk=false;for(let i=0;i<30;i++){BK.sim(1);log.push([i,fs.map(e=>[e.hp,+(e.stagger||0).toFixed(2),+(e.floored||0).toFixed(1),+(e.broken||0).toFixed(1)].join('/'))]);}return log;})()`)));
} finally { pg.close(); }
