import { openPage } from '../../../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;BK.load(0);BK.state='play';BK.start();BK.reset();BK.sim(30);const P=BK.P;P.hp=20;P.inv=0;
   const out={flasks:P.flasks,row:BK.flaskRow(),slots:BK.skillSlots(),rows:BK.flaskRows()};out.drank=BK.drinkFlask();for(let i=0;i<60;i++)BK.sim(1);out.hp=P.hp;out.after=P.flasks;out.row2=BK.flaskRow();return out;})()`, 60000);
  console.log(JSON.stringify(r));
  console.log('errors', JSON.stringify(pg.errors));
} finally { pg.close(); }
