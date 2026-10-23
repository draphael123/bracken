const fs=require('fs');
function patch(f,a,b){let s=fs.readFileSync(f,'utf8');const crlf=s.includes('\r\n');if(crlf){s=s.replace(/\r\n/g,'\n');}const n=s.split(a).length-1;if(n!==1)throw new Error(f+': '+n+' matches for '+a.slice(0,50));s=s.replace(a,()=>b);if(crlf)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(f,s);}
const f='src/ai-companion.js';
patch(f,`export const AI_WEIGHT = 0.5;
export function coopMulOf(bodies) {
  if (!bodies || bodies.length < 2) return 1;
  const rest = bodies.slice(1);
  if (rest.some(b => b && !b.ai)) return 2;
  return Math.min(2, 1 + AI_WEIGHT * rest.length);
}`,`export const AI_WEIGHT = 0.5;
/* (claude/coopbalance, Daniel 10-21) THE SPLIT. Co-op used to be one number (x2) for the foes' health AND every blow on a hero, so a person in co-op was
   about twice as deadly-off as alone. Now two tables by SEATS (index = seats; 1 is solo): COOP.hp the foes' health, COOP.dmg the blow on EACH hero. An AI is a
   partial seat (AI_WEIGHT), so a party's worth is people + AI_WEIGHT a AI, and a value between two seats is the line between their rows; an AI-only party
   keeps its old cap (the x2 health row, the 2-seat blow row). Mutable on purpose: the lab sweeps it (BK.aiComp.AIC.COOP). */
export const COOP = { hp: [1, 1, 2, 2.6, 3.2], dmg: [1, 1, 1.35, 1.45, 1.5] };
const rowAt = (row, w) => { const lo = Math.max(1, Math.min(4, Math.floor(w))), hi = Math.min(4, lo + 1), t = Math.max(0, Math.min(1, w - lo)); return row[lo] + (row[hi] - row[lo]) * t; };
/* the party's worth in seats: 1 for the first, 1 a person after him (a body with no ai flag), AI_WEIGHT an AI (b.labHuman: the lab's second bot, counted as a person) */
export function seatsOf(bodies) {
  if (!bodies || bodies.length < 2) return 1;
  let w = 1, people = 0;
  for (const b of bodies.slice(1)) { const ai = b && b.ai && !b.labHuman; w += ai ? AI_WEIGHT : 1; if (!ai) people++; }
  return people ? w : Math.min(w, 1 + AI_WEIGHT * 2);
}
export function coopMulOf(bodies) { const w = seatsOf(bodies); return w <= 1 ? 1 : Math.round(rowAt(COOP.hp, w) * 1000) / 1000; }   /* the foes' health */
export function coopTakeOf(bodies) { const w = seatsOf(bodies); return w <= 1 ? 1 : Math.round(rowAt(COOP.dmg, w) * 1000) / 1000; }   /* the blow on each hero (and the breath, and the ward's price) */`);
const m='src/main.js';
patch(m,`const coopMul = () => (coop() ? AIC.coopMulOf(players) : 1);`,`const coopMul = () => (coop() ? AIC.coopMulOf(players) : 1);
const coopTake = () => (coop() ? AIC.coopTakeOf(players) : 1);   /* (claude/coopbalance) the other half, split from the first: every blow on a hero, the breath, the ward's price */`);
patch(m,`(1 + 0.28 * hitTierOf(curId(), who || updFoe)) * coopMul() * (perk('iron')`,`(1 + 0.28 * hitTierOf(curId(), who || updFoe)) * coopTake() * (perk('iron')`);
patch(m,`(1 + 0.28 * hitTierOf(curId())) * coopMul() * (perk('iron') ? 0.9 : 1);   /* hp a second`,`(1 + 0.28 * hitTierOf(curId())) * coopTake() * (perk('iron') ? 0.9 : 1);   /* hp a second`);
patch(m,`(1 + 0.28 * hitTierOf(curId())) * coopMul());   /* a trial never hurts */`,`(1 + 0.28 * hitTierOf(curId())) * coopTake());   /* a trial never hurts */`);
patch(m,`takeScale: () => diffNow().take * (1 + 0.28 * hitTierOf(curId())) * coopMul(),`,`takeScale: () => diffNow().take * (1 + 0.28 * hitTierOf(curId())) * coopTake(),`);
patch(m,`const lands = dmg * diffNow().take * (1 + 0.28 * hitTierOf(curId())) * coopMul();`,`const lands = dmg * diffNow().take * (1 + 0.28 * hitTierOf(curId())) * coopTake();`);
