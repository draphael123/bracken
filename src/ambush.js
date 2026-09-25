// ONE CAPTAIN HOLDS THE ROOM: the others lose their nerve when that captain falls.
export const AMBUSH_LEADERS = new Set(['husk','shield','archer','brute','pike','troll','tideguard','boarder','hedgeknight','armour','hopper','goat','cutlass','watch','scarecrow','thorn','gaffer','scorpion','apprentice']);   /* THE GAFFER leads THE SORTING FLOOR: eight feet of boat hook in a room 27 tiles wide is exactly the read the room is for */
export const AMBUSH_TARGET = { min: 15, max: 35 };
// Captains must survive the first counter and get to use their own attack loop.
// Room-specific budgets account for approach distance and supporting enemies; never for the chosen hero.
export const AMBUSH_HEALTH = {wood:1.7,marsh:2.2,stockade:2.5,spore:6,kings:2,scree:1.7,hanging:2.2,spire:1.5,moor:1.6,storm:3,longwater:1.8,flotilla:1.4,hurricane:2.1,lamplit:2.8,causeway:1.9,waymeet:1.3,crown:2.6,burning:3,fields:2,mage:1,burial:2,oreroad:1.4,caravan:2,fallingtower:1.4};
export const AMBUSH_CAPTAINS={marsh:'thorn',kings:'archer',scree:'troll',moor:'goat',hurricane:'cutlass',lamplit:'watch',fields:'scarecrow',burial:'husk',oreroad:'gaffer',caravan:'scorpion',fallingtower:'apprentice'};   /* the caverns' dead have no captains of the usual kinds: the grave husk leads their rooms */
export function singleAmbush(A,id){
 const all=A.waves.flat(),lead=all.find(f=>f[0]===AMBUSH_CAPTAINS[id])||all.find(f=>f[3]?.elite&&AMBUSH_LEADERS.has(f[0]))||[...A.waves.at(-1),...all].find(f=>AMBUSH_LEADERS.has(f[0]));
 if(!lead)throw Error('No eligible ambush leader: '+A.name);
 const rest=all.filter(f=>f!==lead&&!f[3]?.elite&&(f[1]!==lead[1]||(f[2]??A.row)!==(lead[2]??A.row))).slice(0,3).map(f=>[f[0],f[1],f[2],{...(f[3]||{}),elite:false}]);
 return {...A,waves:[[[lead[0],lead[1],lead[2],{...(lead[3]||{}),elite:true}],...rest]]};
}
