// The requested recycle threshold is distinct from the emergency ceiling for an individual check.
export const DEFAULT_RECYCLE_MB=1536,DEFAULT_RENDERER_MB=2816;
export function memoryAction(rendererMb,{recycleMb=DEFAULT_RECYCLE_MB,hardMb=DEFAULT_RENDERER_MB}={}){
 if(hardMb>0&&rendererMb>hardMb)return'interrupt';
 return recycleMb>0&&rendererMb>recycleMb?'recycle':'continue';
}
