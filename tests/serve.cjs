// Local server for the tests: serves the site like Cloudflare does, WITH the headers of _headers (so the security
// policy is tested too) and the single-page fallback. Run: node tests/serve.cjs [port]
const http=require('http'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),port=+process.argv[2]||8765;
const H={};let cur=null;
for(const line of fs.readFileSync(path.join(root,'_headers'),'utf8').split('\n')){
  if(!line.trim())continue;
  if(!/^\s/.test(line)){cur=line.trim();H[cur]=H[cur]||{};continue}
  const i=line.indexOf(':');H[cur][line.slice(0,i).trim()]=line.slice(i+1).trim();
}
const match=(pat,p)=>new RegExp('^'+pat.replace(/[.+?^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*')+'$').test(p);
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
http.createServer((req,res)=>{
  let p=decodeURIComponent(new URL(req.url,'http://x').pathname);if(p.endsWith('/'))p+='index.html';
  let f=path.join(root,p);
  if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(root,'index.html');
  const h={'Content-Type':TYPES[path.extname(f)]||'application/octet-stream'};
  for(const [pat,v] of Object.entries(H))if(match(pat,p))Object.assign(h,v);
  res.writeHead(200,h);fs.createReadStream(f).pipe(res);
}).listen(port,'127.0.0.1',()=>console.log('serving on',port));
