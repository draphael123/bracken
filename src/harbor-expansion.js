// The inner harbor adds a land route, water route, ship climb, cargo hall and storm wall.
export function extendHarbor({L,T,TS,pools,interiors,structures,moversExtra}){
 const {block,set,ent,coins}=L,G=30;
 const deco=(kind,x,y=29,v=0)=>ent('deco',x,y,{kind,v});
 const sign=(x,text,y=29)=>ent('sign',x,y,{text});
 const rope=(x,a,b)=>{for(let y=a;y<=b;y++)set(x,y,T.NET);};
 const deck=(a,b,y)=>{block(a,b,y,y+1);for(let x=a;x<=b;x++)set(x,y,T.PLANK);structures.push({x0:a,x1:b,top:y,floor:G,kind:'timber'});};
 const pool=(a,b)=>{for(let y=G;y<40;y++)for(let x=a;x<=b;x++)set(x,y,T.AIR);pools.push({x0:a*TS,x1:(b+1)*TS,y:29*TS,swim:true,clear:true,bottom:40*TS,depth:11*TS});rope(a,27,39);rope(b,27,39);for(const x of [a-1,b+1])deco('pierPost',x);};
 const foe=(t,x,y=29,extra={})=>ent(t,x,y,{face:-1,...extra});
 block(360,1079,G,43);
 // Storm market: the awnings are a second route over shield-and-shooter pairs.
 ent('check',365,29);sign(367,'THE STORM MARKET. TAKE THE AWNINGS ABOVE THE SHIELDS, OR BREAK THROUGH BELOW.');
 for(const [a,b] of [[378,399],[415,438]]){deck(a,b,26);rope(a,25,29);rope(b,25,29);interiors.push([a,b,27,29,'ship']);deco('stall',a+6);deco('rumBarrels',b-3);foe('marine',b-5,25);foe('boarder',a+8);foe('cutlass',b-1);coins([a+3,25],[a+10,25],[b-3,25]);}
 foe('netter',449);deco('chartTable',456);deco('lanternDeck',370);deco('lanternDeck',441);
 // Pump basin: swim below the sentries or use the high maintenance walk.
 ent('check',460,29);sign(462,'THE PUMP BASIN. SWIM UNDER THE SENTRIES. THE SIDE NETS RETURN YOU TO THE QUAY.');pool(474,514);deck(478,510,23);rope(480,22,39);rope(507,22,39);
 foe('eel',484,35);foe('angler',504,37);foe('marine',484,22);foe('netter',504,22);foe('crab',469);foe('sailor',520);coins([480,36],[489,37],[501,35],[508,38]);deco('capstan',519);deco('waterButt',528);
 deck(537,548,27);rope(548,26,29);foe('lookout',543,26);foe('cutlass',553);
 // Drydock: the hull is solid below the deck, with permanent stairs at both ends.
 ent('check',557,29);sign(559,'THE DRYDOCK. CLIMB THE HULL STEPS. THE QUARTERDECK HOLDS A SILVER PIECE.');
 for(let k=0;k<4;k++)block(566+k*3,568+k*3,28-k*2,29);
 block(578,638,22,29);for(let x=578;x<=638;x++)set(x,22,T.PLANK);
 structures.push({x0:578,x1:638,top:22,floor:30,kind:'timber'});
 for(let k=0;k<4;k++)block(639+k*3,641+k*3,22+k*2,29);
 deco('mastStump',598,21);deco('wreckBow',580,21);deco('chartTable',626,21);deco('rumBarrels',611,21);deco('lanternDeck',632,21);
 for(const x of [584,605,632])foe('boarder',x,21);foe('marine',616,21);foe('petrel',602,16);ent('silver',624,21);coins([579,21],[590,21],[608,21],[628,21],[644,23]);
 foe('cutlass',657);deco('anchor',665);
 // Cargo warehouse: elevators are optional; fixed stairs reach both galleries.
 ent('check',735,29);ent('check',675,29);sign(677,'THE CARGO HALL. FIXED STEPS REACH THE GALLERIES. THE LIFTS SHORTEN THE CROSSING.');
 block(688,782,16,17);interiors.push([688,782,18,29,'ship']);structures.push({x0:688,x1:782,top:18,floor:30,kind:'timber'});
 for(const a of [697,748]){for(let k=0;k<3;k++)block(a+k*3,a+k*3+2,28-k*2,29);deck(a+9,a+25,24);rope(a+25,23,29);foe('marine',a+18,23);foe('boarder',a+31);deco('plunder',a+13,23);coins([a+11,23],[a+23,23]);}
 moversExtra.push({kind:'lift',x:735*TS,y:29*TS,y0:29*TS,y1:19*TS,w:32,h:7,speed:28,dir:-1});
 for(const x of [691,737,779])deco('kegStack',x);foe('bosun',734);foe('cutlass',785);deco('lanternDeck',687);deco('lanternDeck',783);
 // Breakwater: exposed gaps, timed wind and ranged threats, with permanent water recovery.
 ent('check',866,29);ent('check',794,29);sign(796,'THE BREAKWATER. WAIT OUT THE GUSTS. MISS A JUMP AND THE NETS BRING YOU BACK.');
 for(const [a,b] of [[810,823],[848,861],[886,899]]){pool(a,b);foe('eel',a+5,35);foe('netter',b+5);deco('mastStump',a-5);coins([a+3,34],[b-2,36]);}
 for(const x of [833,873,909])foe('petrel',x,23);foe('sailor',840);foe('boarder',880);deco('lanternDeck',905);
 // Lighthouse approach: compact upward route, a quiet reward, then the boss checkpoint.
 ent('check',915,29);sign(917,'THE LIGHTHOUSE ROAD. FOLLOW THE STEPS FOR THE LAST SILVER. THE WARDEN HOLDS THE SEA GATE.');
 for(let k=0;k<4;k++)block(935+k*3,937+k*3,28-k*2,29);
 deck(947,979,22);rope(979,21,29);deco('lanternDeck',965,21);deco('chartTable',956,21);ent('silver',974,21);
 foe('boarder',948,21);foe('marine',967,21);foe('cutlass',988);foe('netter',1000);coins([942,23],[953,21],[963,21],[977,21]);
 for(const x of [926,983,1007,1014,1066])deco('lanternDeck',x);
 ent('check',1015,29);sign(1016,'THE WARDEN. JUMP LOW SURGES. LEAVE MARKS. STRIKE THE OPEN HELMET.');
 // Two fixed, supported refuges. A high current asks the player to step back down.
 for(const a of [1025,1051]){for(let x=a;x<a+5;x++)set(x,27,T.ONEWAY);structures.push({x0:a,x1:a+4,top:27,floor:30,kind:'timber'});}
 for(let y=0;y<30;y++)set(1062,y,T.PORT);
 ent('harbormaster',1043,29);deco('anchor',1022);deco('capstan',1059);
 const arena={x0:1020*TS,x1:1062*TS,floor:30*TS,y0:18*TS,trigger:1022*TS,wallL:1019,wallR:1062,boss:'harbormaster',music:'boss2',tint:'#256f78',tintA:.12};
 const gusts=[{x0:802*TS,x1:913*TS,y0:18*TS,y1:30*TS,dir:-1,period:8,on:3,phase:0}];
 const harborSections=[['Broken quays',0,95],['Customs hold',96,173],['Salvage cranes',174,251],['Salvage Captain',252,359],['Storm market',360,459],['Pump basin',460,556],['Drydock ship',557,674],['Cargo warehouse',675,793],['Breakwater',794,914],['Lighthouse road',915,1018],['Breakwater Warden',1019,1079]];
 return {arena,gusts,harborSections};
}
