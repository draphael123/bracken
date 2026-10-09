    const stand=(c,y)=>{P.x=c*TS+8;P.y=y===undefined?fl:y;P.vx=P.vy=0;};
    for(const a of e.arms.slice())if(!a.severed){a.hp=1;a.ae.hp=1;a.st='down';a.t=9;a.low=true;a.tx=a.bx;a.ty=fl-6;BK.sim(1);BKT.hurtEnemy(a.ae,5,a.bx,false);}
    for(let i=0;i<600&&e.mode!=='stride2';i++)BK.sim(1);hush();stand(588,fl-48);BK.sim(2);BK.step(1);snap('s2-stride');
    e.mode='breath';e.modeT=9;e.nearWant=1;BK.sim(90);hush();e.mode='breath';BK.step(1);snap('s2-breath');
    e.hp=e.stageFloor;e.mode='stride2';e.modeT=0;for(let i=0;i<600&&e.mode!=='stride3';i++)BK.sim(1);hush();stand(592);BK.sim(30);BK.step(1);snap('s3-maw');
    const eye=(()=>{const r={};return r;})();
    e.mode='lungeTell';e.modeT=0.5;BK.sim(20);BK.step(1);snap('s3-lungeTell');
