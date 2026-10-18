(async()=>{const{LEVELS}=await import('./src/level.js'),shots=[],rows=[];BK.setHero('knight');BK.load(LEVELS.findIndex(l=>l.id==='hurricane'));BK.state='play';BK.start();BK.god=false;BK.reset();BK.sim(30);
/* (claude/hurricane2) THE HURRICANE DECK 2, in the page, rule for rule with what it replaced (the three splitting waists, the three bulkhead guns):
   1 the sky fells her foremast across the breach and its length is walked onto the galley roof; 2 the wave knocks a hero on the open deck flat - a drain,
   no flinch; 3 a hand on a line rides it out; 4 her topmast breaks span by span BEHIND a runner, who reaches the stern stay; 5 the Captain caught off a
   line by the sea is KNOCKED FLAT and open, then warded; 6 his fight's sky marks the deck and he can be STRUCK by it */
const fresh=()=>{BK.load(LEVELS.findIndex(l=>l.id==='hurricane'));BK.state='play';BK.start();BK.god=false;BK.reset();BK.sim(30);};
const P=()=>BK.P,L=()=>BK.L,clear=x0=>{for(const e of BK.enemies())if(!e.maxHp&&Math.abs(e.x-x0*16)<900)e.alive=false;for(const p of BK.props())if(p.t==='cargo')p.gone=true,p.back=999;};
// 1. THE FOREMAST
clear(150);BK.tp(129,19);BK.sim(2);const F=L().felled[0];let n=0;while(F.state!=='down'&&n<900){BK.sim(1);n++;}if(F.state!=='down')throw Error('the foremast did not come down');
BK.tp(127,19);BK.sim(3);BK.keys.right=true;let k=0;while(P().x<175*16&&k<900){BK.sim(1);k++;}BK.keys.right=false;BK.sim(5);
if(P().x<175*16||P().swim||Math.abs(P().y-17*16)>2)throw Error('the foremast was not walked onto the galley roof: '+P().x/16+','+P().y/16);
BK.look(150,18);BK.step(0);shots.push({name:'foremast-down',png:BK.view.buf.toDataURL()});rows.push({foremast:F.state,frames:n,roofAt:Math.round(P().x/16)});
// 2. THE WAVE ON THE OPEN DECK (the bow: no lines within reach of 70, the cargo gone)
fresh();clear(70);BK.tp(71,19);BK.sim(2);let hp=P().hp,hurt=0,shoved=0,t=0;while(!shoved&&t<1600){BK.sim(1);t++;if(P().washV)shoved=Math.abs(P().washV);if(P().hurt>0)hurt++;}
if(!shoved||hurt||P().hp>=hp)throw Error('the wave did not knock the hero flat as a drain: shove '+shoved+' hurt '+hurt+' hp '+hp+'->'+P().hp);rows.push({wave:'flat',drain:hp-P().hp,shove:Math.round(shoved)});
// 3. A HAND ON A LINE
fresh();clear(98);BK.tp(98,19);BK.sim(2);BK.keys.up=true;BK.sim(12);BK.keys.up=false;if(!P().climb)throw Error('no hold on the shroud');hp=P().hp;t=0;let held=0;while(t<1600){BK.sim(1);t++;if(P().washed>0&&P().climb){held=1;break;}}
if(!held||P().hp<hp||P().washV)throw Error('the line did not hold through the wave');rows.push({line:'held'});
// 4. THE TOPMAST, BREAKING BEHIND
fresh();clear(495);BK.tp(486,6);BK.sim(3);BK.keys.right=true;k=0;while(P().x<504*16&&k<600&&P().y<8*16){BK.sim(1);k++;}BK.keys.right=false;
const downs=L().deckBreaks.filter(z=>z.down||z.t>0).length;if(P().x<503*16||P().y>8*16)throw Error('the runner did not reach the stern stay: '+P().x/16+','+P().y/16);if(downs<4)throw Error('the topmast did not break behind the runner: '+downs);
rows.push({topmast:'run',breaking:downs});
// 5 + 6. THE CAPTAIN: no lines to brace on, so the sea takes him; and the sky marks the deck between you
fresh();clear(580);BK.tp(565,15);let b=null;for(let i=0;i<300&&!(b&&b.mode!=='sleep'&&b.mode!=='wake');i++){BK.sim(1);b=BK.enemies().find(e=>e.t==='captain');}
if(!b)throw Error('no captain');BK.god=true;L().arena.lines=[];let flat=0,struck=0,ward=0;for(let i=0;i<60*40&&!(flat&&ward);i++){BK.sim(1);if(b.mode==='beach')flat=1;if(b.struck)struck=1;if(flat&&b.ward>0)ward=1;}
if(!flat)throw Error('the sea never knocked the Captain flat off a line');if(!ward)throw Error('no ward after his opening');rows.push({captain:'flat',ward:!!ward});
let tries=0;for(let i=0;i<60*60&&!struck;i++){BK.sim(1);if(b.struck)struck=1;tries++;}rows.push({captain:'sky',struck:!!struck});
return{shots,rows};})()
