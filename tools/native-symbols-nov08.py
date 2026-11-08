"""Exact-build immutable native PC symbolization. No browser or Game execution."""
import bisect, hashlib, json, os, pathlib, re, subprocess, urllib.request, zipfile, time
root=pathlib.Path(__file__).parent
manifest=json.loads((root/'native-symbols-nov08.json').read_text())
out=pathlib.Path(os.environ['SYMBOL_OUT']);out.mkdir(parents=True,exist_ok=True)
r={'time':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'complete':False,'manifest':manifest,'browsersLaunched':0,'gameEvaluations':0,'originalTestsExecuted':0,'sourceAdopted':False}
def digest(p):
 h=hashlib.sha256()
 with open(p,'rb') as f:
  for block in iter(lambda:f.read(8<<20),b''):h.update(block)
 return h.hexdigest()
try:
 assert manifest['version']=='Chrome/156.0.8078.79'
 archive=out/'symbols.zip'
 with urllib.request.urlopen(manifest['url'],timeout=90) as response,open(archive,'wb') as dest:
  r['http']={'status':response.status,'length':response.headers.get('Content-Length'),'lastModified':response.headers.get('Last-Modified')}
  while True:
   data=response.read(8<<20)
   if not data:break
   dest.write(data)
   assert dest.tell()<=512<<20
 assert archive.stat().st_size==404215994
 r['zipSha256']=digest(archive)
 with zipfile.ZipFile(archive) as z:
  r['members']=[{'name':i.filename,'bytes':i.file_size} for i in z.infolist()]
  files=[i for i in z.infolist() if pathlib.PurePosixPath(i.filename).name=='chrome.debug']
  assert len(files)==1 and files[0].file_size<6<<30
  debug=out/'chrome.debug'
  with z.open(files[0]) as src,open(debug,'wb') as dst:
   while True:
    b=src.read(8<<20)
    if not b:break
    dst.write(b)
 r['debugSha256']=digest(debug)
 notes=subprocess.check_output(['readelf','-n',str(debug)],text=True)
 (out/'elf-notes.txt').write_text(notes)
 ids=re.findall(r'Build ID: ([a-fA-F0-9]+)',notes);assert len(ids)==1
 b=bytes.fromhex(ids[0])[:16];actual=(b[:4][::-1]+b[4:6][::-1]+b[6:8][::-1]+b[8:]).hex().upper()+'0'
 r['elfBuildId']=ids[0];r['breakpadBuildId']=actual
 assert actual==manifest['buildId'],(actual,manifest['buildId'])
 pcs=sorted(manifest['pcs']);found={p:[] for p in pcs};count=0
 proc=subprocess.Popen(['nm','-nS','--defined-only','-C',str(debug)],stdout=subprocess.PIPE,text=True)
 for line in proc.stdout:
  m=re.match(r'^([0-9a-f]+) ([0-9a-f]+) ([tTwW]) (.*)$',line)
  if not m:continue
  start,size=int(m[1],16),int(m[2],16);count+=1
  a,b=bisect.bisect_left(pcs,start),bisect.bisect_left(pcs,start+size)
  for pc in pcs[a:b]:found[pc].append({'name':m[4],'start':start,'size':size,'offset':pc-start,'type':m[3]})
 assert proc.wait()==0
 r['functionSymbolsRead']=count;r['resolved']=sum(bool(v) for v in found.values());r['missing']=[p for p,v in found.items() if not v];r['symbols']=[{'relativePc':p,'matches':v} for p,v in found.items()];r['complete']=True
 r['qualification']='Build-ID-matched native function intervals only. Not JavaScript factory identity, object ownership, source adoption, resident saving or original gate proof. All aliases retained.'
except Exception as e:
 r['error']=repr(e);raise
finally:
 (out/'receipt.json').write_text(json.dumps(r,indent=2)+'\n')
