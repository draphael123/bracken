const fs=require('fs');const f='src/level.js';let s=fs.readFileSync(f,'utf8');const NL=s.includes('\r\n')?'\r\n':'\n';
const rep=(a,b)=>{const n=s.split(a).length-1;if(n!==1)throw new Error('match '+n+': '+a.slice(0,70));s=s.replace(a,b);};
rep("import { buildArenaYard } from './arena-yard.js';","import { buildArenaYard } from './arena-yard.js';"+NL+"import { MON3 } from './mon3-flag.js'; import { rebuildMonastery3 } from './monastery3.js';   /* (claude/monastery3-1105) THE MONASTERY 3: the new layout, behind its flag (off on master) */");
rep("build: theMonastery, needs: 'hanging' },","build: MON3 ? () => rebuildMonastery3(theMonastery(), { T, TS }) : theMonastery, needs: 'hanging' },");
const hook="for (const lv of LEVELS) if (!lv.hidden || lv.secret) { const b = lv.build, id = lv.id; lv.build = () => { const L = b(); if (REVIEW[id]) REVIEW[id](L);";
rep(hook, `/* (claude/monastery3-1105) THE MONASTERY 3's own rows in the tables keyed by id (only with its flag on: src/mon3-flag.js). The old rows name tiles of the old layout. */
if (MON3) {
  REVIEW.spire = () => {};   /* the cloud camp stood on the old cloister (row 99): the dorter has its own camp now */
  GARRISON.spire = [['sentry', 5], ['rockgoblin', 5], ['gobpriest', 3], ['gobmage', 3], ['troll', 2]];   /* NO BIRDS in the sprinkle: birds outside only, placed by hand on the cliff path and the towers (Daniel 11-02 15:55 #1) */
  AMBUSH.spire = [{ name: 'THE FEAST', row: 199, wallL: 13, wallR: 88, check: false,   /* the refectory's goblin feast: the long tables are the floor of the fight (15:55 #2) */
    waves: [[['troll', 56, null, { elite: true }], ['hearthgob', 38], ['gobpriest', 70], ['rockgoblin', 24]]] }];
  { const kr = knightRow('spire'); ELITES.spire = kr ? [[kr[0], 70, 162, kr[3]]] : []; }   /* THE GONG MAUL holds the dorter's east bay (the scriptorium's troll he replaced is gone with the old scriptorium) */
  CHECK_DROP.spire = [];   /* the new layout places its three by hand (15:55 #5): the kitchen, the dorter roof, the crawl door */
}
`+hook);
fs.writeFileSync(f,s);console.log('ok');
