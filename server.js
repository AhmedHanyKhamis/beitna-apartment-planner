import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer((req,res)=>{
  let target;
  try {target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));} catch {res.writeHead(400).end();return;}
  if(target===root)target=path.join(root,'index.html');
  if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(target,(error,data)=>{if(error){res.writeHead(404).end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache'}).end(data);});
});
server.listen(port,'127.0.0.1',()=>console.log(`Apartment planner: http://localhost:${port}`));
server.on('error',error=>{if(error.code==='EADDRINUSE'){console.log(`Port ${port} is already in use. If the planner is running, open http://localhost:${port}. Otherwise choose a different PORT.`);}else{console.error(error.message);process.exitCode=1;}});
