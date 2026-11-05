const fs=require('fs');
function edit(f,fn){let s=fs.readFileSync(f,'utf8');s=fn(s);fs.writeFileSync(f,s);}
const rep=(s,a,b)=>{const n=s.split(a).length-1;if(n!==1)throw new Error('match '+n+': '+a.slice(0,70));return s.replace(a,b);};
edit('src/stuck-spots.js',s=>{
 s=rep(s,"import { uwX, UW_SPILL, UW_RES } from './underwell.js';","import { uwX, UW_SPILL, UW_RES } from './underwell.js'; import { MON3 } from './mon3-flag.js';   /* (claude/monastery3-1105) THE MONASTERY 3's own spots, behind its flag */");
 s=rep(s,"export const STUCK_HANDS = {",`/* (claude/monastery3-1105) THE MONASTERY 3 (src/monastery3.js, behind src/mon3-flag.js): every machine its route needs, one spot each (tools/stuck.mjs) */
if (MON3) STUCK.spire = [
  { id: 'm3-wheel-garth', zone: [78, 203, 92, 209], at: [86, 209], glint: 'stall', line: 'THE GARTH WHEEL TURNS ITS STAIR TO THE TRAPDOOR' },
  { id: 'm3-flue-1', zone: [1, 193, 11, 199], at: [7, 199], glint: 'stall', line: 'THE HEARTH BRAZIER: RIDE ITS SMOKE UP THE FLUE' },
  { id: 'm3-flue-2', zone: [8, 188, 11, 192], at: [10, 191], line: 'A COLD CENSER ON THE LEDGE: IT ANSWERS A BLOW' },
  { id: 'm3-flue-3', zone: [5, 179, 9, 184], at: [7, 183], glint: 'stall', line: 'THE LAST FLUE BRAZIER: UP, AND EAST INTO THE SCRIPTORIUM' },
  { id: 'm3-dorter-vent', zone: [1, 155, 10, 162], at: [5, 162], glint: 'stall', line: 'THE DORMITORY BRAZIER: ITS SMOKE GOES UP TO THE ROOF HATCH' },
  { id: 'm3-bell-rope-1', zone: [6, 158, 14, 162], at: [9, 162], line: 'THE BELL OVER THE ROPE WELL: A WAY BACK UP FROM THE KITCHEN' },
  { id: 'm3-hoist', zone: [12, 124, 30, 140], mover: { cw: 'm3cw0' }, line: 'THE MONKS\' HOIST: STAND IN ONE BASKET, RIDE THE OTHER UP' },
  { id: 'm3-drawbridge', zone: [82, 86, 90, 91], at: [86, 90], done: ['tbell', 86, 90, 'down'], line: 'THE BELL ON THE TOWER LETS THE DRAWBRIDGE DOWN' },
  { id: 'm3-altar', zone: [36, 79, 48, 84], at: [42, 84], glint: 'stall', line: 'THE ALTAR CENSER: ITS SMOKE LIFTS YOU TO THE ROOD LOFT' },
  { id: 'm3-wheel-rood', zone: [24, 66, 44, 73], at: [36, 74], glint: 'stall', line: 'THE ROOD WHEEL: TURN ITS STAIR TO THE TRAPDOOR' },
  { id: 'm3-bell-rope-2', zone: [1, 50, 12, 55], at: [6, 55], line: 'THE BELL AT THE GUARDIAN\'S DOOR: A WAY BACK UP FROM THE DORTER ROOF' },
  ...STUCK.spire.filter(q => q.id === 'sp-wheel-3'),
];
export const STUCK_HANDS = {`);
 s=rep(s,"export const STUCK_SIGNS = {","export const STUCK_SIGNS = {"); return s; });
// STUCK_SIGNS.spire: the old book-hoist sign - gate after the object
edit('src/stuck-spots.js',s=>{const i=s.indexOf("export const STUCK_SIGNS = {");const j=s.indexOf("\n};",i);return s.slice(0,j+3)+"\nif (MON3) delete STUCK_SIGNS.spire;   /* (claude/monastery3-1105) the old book hoist's sign: the new layout signs its own hoist */"+s.slice(j+3);});
edit('src/reach-gaps.js',s=>{s=rep(s,"  spire: c => { c.ledge(58, 59, 137); },","  spire: c => { if (!MON3) c.ledge(58, 59, 137); },   /* (claude/monastery3-1105) the old layout's corridor: not in THE MONASTERY 3 */");
 const k=s.indexOf("export const GAPS");return s.slice(0,k)+"import { MON3 } from './mon3-flag.js';\n"+s.slice(k);});
edit('src/monastery3.js',s=>{
 s=rep(s,"[60, 115, 'bellFrame', 1]","[51, 90, 'bellFrame', 1]");
 s=rep(s,"  ent('sign', 78, 208, { text: 'A PRAYER WHEEL. STRIKE IT AND ITS STAIR TURNS. STRIKE IT AGAIN AND IT TURNS BACK.' });","  ent('sign', 78, 208, { text: 'A PRAYER WHEEL IN THE GARTH. STRIKE IT AND ITS STAIR TURNS. STRIKE IT AGAIN AND IT TURNS BACK.' });");
 s=rep(s,"    grid: g, ents,","    grid: g, ents, islands: islands.concat([[3, 58, 56, 118, 'the crag under the chapel and the guardian\'s floor: only the rope well parts it from the map wall'], [82, 82, 116, 118, 'the shelf between the broken floor and the crevice, under the east tower']]),");
 s=rep(s,"darkZones, islands, cloudLine","darkZones, cloudLine");
 return s;});
console.log('ok');
