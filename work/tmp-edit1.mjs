import fs from 'fs'; const f='src/main.js'; let s=fs.readFileSync(f,'utf8'); const crlf=s.includes('\r\n');
const rep=(a,b)=>{ if(!s.includes(a)) throw new Error('missing '+a.slice(0,60)); if(s.split(a).length!==2) throw new Error('multi '+a.slice(0,60)); s=s.replace(a,()=>b); };
rep("SPR.lance = bakeGoblinLance();","SPR.lance = LNA.bakeChampion(); SPR.lanceHorse = LNA.bakeCharger();   /* (claude/stormhold3art) THE QUEEN'S CHAMPION and his barded charger: src/lance-art.js */");
rep("import { bakePaladinBoss, bakeLancer,","import * as LNA from './lance-art.js';\nimport { bakePaladinBoss, bakeLancer,");
// frame by mode
const i0=s.indexOf("    else if (e.t === 'lance') { const mv = Math.abs(e.vx) > 6;"); const i1=s.indexOf("    else if (e.t === 'tollmaster') frame = e.dying", i0); if(i0<0||i1<0) throw new Error('lance frame block');
s=s.slice(0,i0)+"    else if (e.t === 'lance') frame = LNA.frameOf(e);   /* (claude/stormhold3art) a pose for every move (src/lance-art.js): B16 */\n"+s.slice(i1);
rep("else if (e.hurtT > 0 && HAS_HURT.has(e.t) && SPR[e.t] && SPR[e.t].R) frame =","else if (e.hurtT > 0 && e.t === 'lance') frame = e.mounted ? LNA.F.hurtRide : LNA.F.hurt;\n    else if (e.hurtT > 0 && HAS_HURT.has(e.t) && SPR[e.t] && SPR[e.t].R) frame =");
// horse
const h0=s.indexOf("function drawLanceHorse(e, cx, cy) {"); const h1=s.indexOf("const GUARD_WALL", h0);
s=s.slice(0,h0)+"function drawLanceHorse(e, cx, cy) { const S = SPR.lanceHorse; if (!S) return;   /* (claude/stormhold3art) his barded charger (src/lance-art.js): a pose for the gallop, the rear and the wheel */\n  drawSet(S, null, LNA.chargerFrame(e), e.x - cx, e.y - cy, e.face, e.flash > 0, LANCE3.horseScale, LANCE3.horseScale, 1, 0); }\n"+s.slice(h1);
fs.writeFileSync(f,s);
