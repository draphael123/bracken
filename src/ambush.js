// ONE CAPTAIN HOLDS THE ROOM: the others lose their nerve when that captain falls.
export const AMBUSH_LEADERS = new Set(['shield','archer','brute','pike','troll','tideguard','boarder','hedgeknight','armour','hopper','goat','cutlass','watch','scarecrow','thorn']);
export const AMBUSH_TARGET = { min: 15, max: 35 };
export const AMBUSH_CAPTAINS={marsh:'thorn',kings:'archer',scree:'troll',moor:'goat',hurricane:'cutlass',lamplit:'watch',fields:'scarecrow'};
export function singleAmbush(A,id){
 const all=A.waves.flat(),lead=all.find(f=>f[0]===AMBUSH_CAPTAINS[id])||all.find(f=>f[3]?.elite&&AMBUSH_LEADERS.has(f[0]))||[...A.waves.at(-1),...all].find(f=>AMBUSH_LEADERS.has(f[0]));
 if(!lead)throw Error('No eligible ambush leader: '+A.name);
 const rest=all.filter(f=>f!==lead&&!f[3]?.elite&&(f[1]!==lead[1]||(f[2]??A.row)!==(lead[2]??A.row))).slice(0,3).map(f=>[f[0],f[1],f[2],{...(f[3]||{}),elite:false}]);
 return {...A,waves:[[[lead[0],lead[1],lead[2],{...(lead[3]||{}),elite:true}],...rest]]};
}
