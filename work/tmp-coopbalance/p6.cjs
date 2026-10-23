const fs=require('fs');
function patch(f,a,b){let s=fs.readFileSync(f,'utf8');const crlf=s.includes('\r\n');if(crlf){s=s.replace(/\r\n/g,'\n');}const n=s.split(a).length-1;if(n!==1)throw new Error(f+': '+n+' matches for '+a.slice(0,50));s=s.replace(a,()=>b);if(crlf)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(f,s);}
const f='tools/ai-companion.mjs';
let s=fs.readFileSync(f,'utf8');const crlf=s.includes('\r\n');s=s.replace(/\r\n/g,'\n');
const i0=s.indexOf("  ok(AIC.coopMulOf([{}]) === 1");const i1=s.indexOf("  const p1 = { x: 100, y: 0 }");
if(i0<0||i1<0)throw 1;
const neu=`  /* (claude/coopbalance) THE SPLIT: the foes' health and the blow on each hero are two tables by seats */
  const near = (a, b) => Math.abs(a - b) < 0.0005, C = AIC.COOP;
  ok(AIC.coopMulOf([{}]) === 1 && AIC.coopTakeOf([{}]) === 1, 'scaling: solo x1 health, x1 blows');
  ok(near(AIC.coopMulOf([{}, {}]), C.hp[2]) && near(AIC.coopMulOf([{}, {}, {}]), C.hp[3]) && near(AIC.coopMulOf([{}, {}, {}, {}]), C.hp[4]) && C.hp[2] === 2 && C.hp[3] === 2.6 && C.hp[4] === 3.2, 'scaling: people scale the foes x2 / x2.6 / x3.2 (2 / 3 / 4 seats)');
  ok(near(AIC.coopTakeOf([{}, {}]), C.dmg[2]) && near(AIC.coopTakeOf([{}, {}, {}]), C.dmg[3]) && near(AIC.coopTakeOf([{}, {}, {}, {}]), C.dmg[4]) && C.dmg[2] < C.hp[2] && C.dmg[4] < 2, 'scaling: a blow on each hero is its own, lighter table (never the foes\' x2)');
  ok(near(AIC.coopMulOf([{}, { ai: true }]), 1.5) && near(AIC.coopMulOf([{}, { ai: true }, { ai: true }]), 2) && near(AIC.coopMulOf([{}, { ai: true }, { ai: true }, { ai: true }]), 2), 'scaling: an AI is LIGHTER - one AI x1.5 health, an AI-only party never past x2');
  ok(AIC.coopTakeOf([{}, { ai: true }]) > 1 && AIC.coopTakeOf([{}, { ai: true }]) < C.dmg[2] && near(AIC.coopTakeOf([{}, { ai: true }, { ai: true }]), C.dmg[2]), 'scaling: one AI hits a hero for less than a person would, an AI-only party never past the two-seat blow');
  ok(near(AIC.coopMulOf([{}, { ai: true }, {}]), (C.hp[2] + C.hp[3]) / 2) && AIC.coopMulOf([{}, { ai: true }, {}]) > AIC.coopMulOf([{}, {}]), 'scaling: two people and an AI sit between the two-seat and the three-seat rows');
  C.aiAsHuman = true; ok(near(AIC.coopMulOf([{}, { ai: true }]), C.hp[2]), '...the lab can count a bot as a person (COOP.aiAsHuman)'); C.aiAsHuman = false;
`;
s=s.slice(0,i0)+neu+s.slice(i1);if(crlf)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(f,s);
