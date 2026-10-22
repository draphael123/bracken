// Measurement-only: preserve spawn arguments/return values and retain the PIDs we own.
import cp from 'node:child_process';
import {syncBuiltinESMExports} from 'node:module';
import {appendFileSync} from 'node:fs';
const original=cp.spawn;
cp.spawn=function(...args){
 const child=Reflect.apply(original,this,args);
 if(process.env.BALANCE_PROCESS_LOG)appendFileSync(process.env.BALANCE_PROCESS_LOG,JSON.stringify({time:new Date().toISOString(),parent:process.pid,pid:child.pid,executable:String(args[0]).split(/[\\/]/).pop()})+'\n');
 return child;
};
syncBuiltinESMExports();
