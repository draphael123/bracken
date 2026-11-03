import fs from 'fs';
let f='src/main.js', s=fs.readFileSync(f,'utf8'); s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{ const n=s.split(a).length-1; if(n!==1) throw Error(n+' x '+a.slice(0,60)); s=s.replace(a,()=>b); };
rep("skillFor, skillsFor, equipped,", "skillFor, skillsFor, equipped, SECOND_SLOT_LEVEL,");
// skills screen
rep("limit=slotsAt(lv),width=(VW-20)/limit;", "limit=slotsAt(lv),width=(VW-20)/2;");
rep("['F','G',SET.skill3Key.toUpperCase()][i]", "['F','G'][i]");
rep("text(fitName(sk?sk.name:'EMPTY',width-lw-8,6),x+4+lw,40,UI.text,'left',6);}\n", "text(fitName(sk?sk.name:'EMPTY',width-lw-8,6),x+4+lw,40,UI.text,'left',6);}\n if(limit<2){const x=10+width;g.fillStyle='#232130';g.fillRect(x,38,width-3,11);text('G',x+4,40,UI.dim,'left',6);text(fitName('SECOND SLOT AT LEVEL '+SECOND_SLOT_LEVEL,width-20,6),x+4+inkW('G',6)+8,40,UI.dim,'left',6);}   /* (Daniel 11-01: ONE slot, a second at 30: the locked one is shown, so the rule is told where the loadout is) */\n");
rep("rankHelp?rankHelp:treeBranch===1?STORE_HELP.passives:STORE_HELP.skills;", "rankHelp?rankHelp:treeBranch===1?STORE_HELP.passives:limit>1?STORE_HELP.skills.replace('F slot','F/G slot'):STORE_HELP.skills;");
// level-up line
rep("const pas = got.length ?", "const slot2 = from < SECOND_SLOT_LEVEL && n >= SECOND_SLOT_LEVEL ? ' A SECOND SKILL SLOT.' : '', pas = (got.length ?");
rep("' PASSIVE: ' + got[0].name + '.') : '';\n  const head", "' PASSIVE: ' + got[0].name + '.') : '') + slot2;\n  const head");
// HUD
rep("slot(load[2],106,SET.skill3Key.toUpperCase(),'#8fb8ff');slot(load[3],124,SET.skill4Key.toUpperCase(),'#e6a8e0'); }", " }   /* (Daniel 11-01: one slot, a second at level 30 - the old third and fourth draws are gone) */");
// DK keys
rep("skill: 'G: THE SKILL HE HAS CHOSEN FROM HIS TREES'", "skill: 'G: A SECOND SKILL, FROM LEVEL 30'");
// hero card
rep("sk2Name = skillsOwned().length > (isReaper() ? 0 : 1) ? nameOfSkill(skill2Now()) : 'LOCKED';", "sk2Name = slotsAt(heroLevel()) < 2 ? 'AT LEVEL ' + SECOND_SLOT_LEVEL : skillsOwned().length > (isReaper() ? 0 : 1) ? nameOfSkill(skill2Now()) : 'LOCKED';");
fs.writeFileSync(f,s.replace(/\n/g,'\r\n'));
