    const stand=(c,y)=>{P.x=c*TS+8;P.y=y===undefined?fl:y;P.vx=P.vy=0;};P.maxHp=P.hp=9999;
    for(let i=0;i<900&&e.mode!=='stride';i++)BK.sim(1);hush();
    stand(590);e.T.ink=0;e.mode='stride';e.modeT=0;BK.sim(1);hush();BK.sim(30);BK.step(1);snap('p1-ink-fly');BK.sim(50);BK.step(1);snap('p1-ink-patch');
    hush();e.mode='waveTell';e.modeT=0.6;BK.sim(20);BK.step(1);snap('p1-waveTell');BK.sim(40);BK.step(1);snap('p1-wave');for(let i=0;i<300&&e.mode==='wave';i++)BK.sim(1);hush();
    stand(588);e.mode='stride';e.modeT=0;e.T.co=0;BK.sim(1);hush();BK.sim(25);BK.step(1);snap('p1-co-tell');BK.sim(40);BK.step(1);snap('p1-co-sweep');BK.sim(60);hush();
    stand(580);e.mode='stride';e.modeT=0;e.T.spout=0;BK.sim(1);hush();BK.sim(30);BK.step(1);snap('p1-spoutTell');BK.sim(40);BK.step(1);snap('p1-spout');BK.sim(60);hush();
    const out={};out.inkLobs=e.inkLobs;out.cos=e.cos;out.waves=e.waves1;
    for(const a of e.arms.slice())if(!a.severed){a.hp=1;a.ae.hp=1;a.st='down';a.t=9;a.low=true;a.tx=a.bx;a.ty=fl-6;BK.sim(1);BKT.hurtEnemy(a.ae,5,a.bx,false);}
    for(let i=0;i<600&&e.mode!=='stride2';i++)BK.sim(1);hush();stand(582);BK.sim(10);BK.step(1);snap('p2-sign');
    hush();e.mode='breath';e.modeT=4;e.breathMax=4.4;e.nearWant=1;for(let i=0;i<80;i++){e.mode='breath';e.modeT=4;BK.sim(1);}BK.step(1);snap('p2-breath');
    BK.krakRing(1);BK.sim(10);BK.step(1);snap('p2-bellring');BK.sim(30);out.knell=e.mode;BK.step(1);snap('p2-knelled');
    hush();e.hp=e.stageFloor;e.mode='stride2';e.modeT=0;for(let i=0;i<900&&e.mode!=='stride3';i++)BK.sim(1);hush();stand(588);BK.sim(30);BK.step(1);snap('p3-start');
    const a=e.arms.find(q=>q.regrown&&!q.severed);a.hp=1;a.ae.hp=1;a.st='down';a.t=9;a.low=true;a.tx=a.bx-30;a.ty=fl-6;BK.sim(1);BKT.hurtEnemy(a.ae,5,a.bx,false);out.ramp=!!e.ramp;BK.sim(5);BK.step(1);snap('p3-ramp-fall');BK.sim(40);hush();
    /* walk up it with real keys */
    stand(591);e.ramp.fall=0;const k=BK.keys;k.right=true;let f=0;for(;f<240&&P.x<e.ramp.x1-6;f++){hush();e.ramp.t=9;BK.sim(1);}k.right=false;out.walk={f,x:Math.round(P.x),y:Math.round(P.y),onRamp:e.onRamp,top:[Math.round(e.ramp.x1),Math.round(e.ramp.y1)],};
    BK.step(1);snap('p3-on-ramp-top');
    e.eyeT=2.8;e.wardT=0;BK.sim(2);BK.step(1);snap('p3-eye-open');const hp0=e.hp;P.face=1;BK.press('atk');for(let i=0;i<30;i++){e.ramp.t=9;BK.sim(1);}out.eyeHit=hp0-e.hp;
    e.eyeT=0.01;BK.sim(3);BK.step(1);snap('p3-ward');const hp1=e.hp;BK.press('atk');for(let i=0;i<30;i++){e.ramp.t=9;BK.sim(1);}out.wardHit=hp1-e.hp;
    e.mode='biteTell';e.modeT=0.6;BK.sim(10);BK.step(1);snap('p3-biteTell');BK.sim(40);out.bitten=e.bitten||0;
    stand(596);hush();e.ramp.t=9;
    e.mode='shakeTell';e.modeT=0.6;BK.sim(10);BK.step(1);snap('p3-shakeTell');
    res.push(['info','data:text/plain;base64,'+btoa(JSON.stringify(out))]);
