import fs from 'fs';
let f='src/progression.js', s=fs.readFileSync(f,'utf8'); s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{ if(!s.includes(a)) throw Error('missing '+a.slice(0,50)); s=s.replace(a,()=>b); };
rep(/\/\* THE THIRD SLOT OPENS[\s\S]*?export const slotsAt[^\n]*\n/.exec(s)[0],
`/* ONE ABILITY SLOT, A SECOND AT LEVEL 30, AND TWO IS THE MOST (Daniel 2026-11-01: "by default the player can only have ONE ability equipped... once you
   get to like level 30 you can get a second... three kind of breaks the game"). It was two from the start and a third at 16 (2026-10-04). A save with
   more equipped than its hero's level holds (trimSlots, before the save is judged) keeps the FIRST equipped ability in the first slot; the rest stay
   LEARNED (skillOwned) and unequipped. equipped() only reads the slots the level has. */
export const MAX_SLOTS = 2;
export const SLOT_LEVELS = [0, 30];
export const SECOND_SLOT_LEVEL = SLOT_LEVELS[1];
export const slotsAt = lv => SLOT_LEVELS.filter(n => (lv || 0) >= n).length;
`);
rep(/\/\* MORE THAN MAX_SLOTS IN A LOADOUT[\s\S]*?export function trimSlots[^\n]*\n/.exec(s)[0],
`/* MORE EQUIPPED THAN THE HERO'S LEVEL HOLDS (a save from the two-, three- or four-slot days): the abilities past the slots his level has are
   dropped from the loadout - they stay owned (skillOwned), only unequipped. Below level 30 the FIRST equipped ability is kept, moved to the first
   slot if the first was empty (a save with [null, 'x'] must not leave the hero with nothing). From level 30 two slots stay where they were. */
export function trimSlots(p){
 if(!object(p)||!object(p.loadouts))return false;let cut=false;
 for(const h of Object.keys(p.loadouts)){
  const v=p.loadouts[h];if(!Array.isArray(v))continue;
  const room=Math.min(MAX_SLOTS,slotsAt(levelOfXp(object(p.xp)&&Number.isFinite(p.xp[h])?p.xp[h]:0)));
  if(room>=2){if(v.length>2){p.loadouts[h]=v.slice(0,2);cut=true;}continue;}
  const first=v.find(id=>typeof id==='string'&&!isPassive(h,id)),out=first?[first]:[];
  if(JSON.stringify(out)!==JSON.stringify(v)){p.loadouts[h]=out;cut=true;}
 }
 return cut;
}
`);
rep(`index<0||index>=slotsAt(lv))return 'Slot is locked';`,`index<0||index>=slotsAt(lv))return index===1?'A second skill slot opens at level '+SECOND_SLOT_LEVEL:'Slot is locked';`);
fs.writeFileSync(f,s.replace(/\n/g,'\r\n'));
