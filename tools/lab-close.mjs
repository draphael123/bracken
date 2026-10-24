// Browser shutdown can synchronously wait for its process tree on Windows.
// Keep the owned server alive until that wait is over, so its exit deadline is not starved.
export async function closeLabResources(closeBrowser,closeServer){
 try{await closeBrowser();}finally{await closeServer();}
}
