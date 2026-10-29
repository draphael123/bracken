// Perfetto TrackEventDescriptor: repeated category(field1), category name(field1).
// Schema: https://android.googlesource.com/platform/external/perfetto/+/HEAD/protos/perfetto/common/track_event_descriptor.proto
import assert from'node:assert/strict';
export function descriptorCategories(bytes){
 assert(Buffer.isBuffer(bytes)&&bytes.length<=4*1048576);const fields=b=>{let p=0;const rows=[],varint=()=>{let n=0,f=1;for(let i=0;i<10;i++){assert(p<b.length,'Truncated descriptor varint');const v=b[p++];n+=(v&127)*f;assert(Number.isSafeInteger(n),'Unsafe descriptor varint');if(!(v&128))return n;f*=128;}throw Error('Oversized descriptor varint');};while(p<b.length){const tag=varint(),id=Math.floor(tag/8),wire=tag%8;assert(id>0);if(wire===0)varint();else if(wire===1){p+=8;assert(p<=b.length);}else if(wire===5){p+=4;assert(p<=b.length);}else if(wire===2){const size=varint();assert(p+size<=b.length);rows.push({id,bytes:b.subarray(p,p+size)});p+=size;}else throw Error('Unsupported descriptor wire type '+wire);}return rows;};
 const result=fields(bytes).filter(x=>x.id===1).flatMap(x=>fields(x.bytes).filter(y=>y.id===1).map(y=>y.bytes.toString('utf8')));assert(result.length>0&&result.every(x=>x.length>0&&x.length<512&&!x.includes('\0')),'No readable categories in descriptor');return[...new Set(result)];
}
