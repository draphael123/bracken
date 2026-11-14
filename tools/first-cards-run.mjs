// PAGE TOOL: launches headless Chrome
// tools/first-cards-run.mjs - BROWSER RUNTIME CHECK of the first-time cards and boss hints (claude/onboard2). NOT YET RUN (written under a release gate: no browser).
//   usage: node tools/first-cards-run.mjs        (one headless page, like tools/salt-card.mjs)
//   SKILLS   a real level, calm for FC.CALM_S: the skills card comes up by itself, once; the world holds still under it
//   KEY      a press inside ARM_S does not dismiss it; the confirm key after it does; the flag is in the save
//   ONCE     the same card is not owed twice (teachAdd on a told id is refused)
//   HINT     teachAdd('hint:oldtusker') shows the boss card straight away (even in a fight); the card names the boss
//   LEVEL    a told 'levelup' opens nothing extra; an untold one shows first and the choice card opens when it is dismissed
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false }); const fails = [], out = {};
try {
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js'),FC=await import('/src/first-cards.js');BK.manualSimulation=true;BK.saltForce=true;const fails=[],out={};
const W=id=>LEVELS.findIndex(l=>l.id===id);
const fresh=(id)=>{for(const k in BK.keys)BK.keys[k]=false;BK.setHero('knight');BK.reset({fresh:true});BK.load(W(id));BK.start();BK.god=true;};
const ARM=Math.ceil(FC.ARM_S*60)+6;
fresh('wood');
/* SKILLS */ for(let i=0;i<Math.ceil(FC.CALM_S*60)+80&&!BK.teach().card;i++)BK.sim(1);
let c=BK.teach().card;if(!c||c.id!=='skills')fails.push('no skills card after a calm stretch: '+JSON.stringify(c&&c.id));
else{out.skills=c.card.paras;const x0=BK.P.x;for(let i=0;i<30;i++)BK.sim(1);if(Math.abs(BK.P.x-x0)>0.01)fails.push('the world moved under the card');
 BK.teachConfirm();BK.sim(1);if(!BK.teach().card)fails.push('a press inside ARM_S dismissed the card');
 for(let i=0;i<ARM;i++)BK.sim(1);BK.teachConfirm();BK.sim(1);if(BK.teach().card)fails.push('the confirm key did not dismiss the card');}
if(!BKT.PROG.firstCards||!BKT.PROG.firstCards.skills)fails.push('the save has no skills flag');
/* ONCE */ if(BK.teachAdd('skills'))fails.push('a told card was owed again');
/* HINT */ if(!BK.teachAdd('hint:oldtusker'))fails.push('the hint was refused');BK.sim(2);c=BK.teach().card;
if(!c||c.id!=='hint:oldtusker')fails.push('no boss hint card');else out.hint=[c.card.title,...c.card.paras];
for(let i=0;i<ARM;i++)BK.sim(1);BK.teachConfirm();BK.sim(1);if(BK.teach().card)fails.push('the hint did not dismiss');
/* FLASK / SLOT2 */ BK.teachAdd('flask');BK.teachAdd('slot2');BK.sim(2);out.q=BK.teach().q.length;
return {fails,out};})()`);
  fails.push(...r.fails); Object.assign(out, r.out);
} finally { pg.close(); }
console.log(JSON.stringify(out, null, 1));
if (fails.length) { console.error('FAIL\n' + fails.join('\n')); process.exit(1); }
console.log('first-cards-run ok');
