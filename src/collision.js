import {corners,pointInPoly,wallPoint,catalog} from './model.js';
export function overlap(a,b){for(const p of [a,b])for(let i=0;i<p.length;i++){const v=p[i],n=p[(i+1)%p.length],axis=[-(n[1]-v[1]),n[0]-v[0]];const pa=a.map(v=>v[0]*axis[0]+v[1]*axis[1]),pb=b.map(v=>v[0]*axis[0]+v[1]*axis[1]);if(Math.max(...pa)<=Math.min(...pb)+1e-7||Math.max(...pb)<=Math.min(...pa)+1e-7)return false;}return true;}
export function wallRect(a,b,t){const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy),nx=-dy/l*t/2,ny=dx/l*t/2;return [[a[0]+nx,a[1]+ny],[b[0]+nx,b[1]+ny],[b[0]-nx,b[1]-ny],[a[0]-nx,a[1]-ny]];}
export function doorSector(w,o){const a=wallPoint(w,o.center-o.width/2),b=wallPoint(w,o.center+o.width/2),hinge=o.hinge?b:a,other=o.hinge?a:b;const angle=Math.atan2(other[1]-hinge[1],other[0]-hinge[0]);const turn=o.swing*(o.hinge?-1:1);return [hinge,...Array.from({length:13},(_,i)=>{const t=angle+turn*i/12*Math.PI/2;return [hinge[0]+Math.cos(t)*o.width,hinge[1]+Math.sin(t)*o.width];})];}
export function clearances(item){const c=catalog[item.type],r=[];if(c.clearance){const t=item.rotation*Math.PI/180;r.push({kind:'front',poly:corners({...item,x:item.x-Math.sin(t)*(item.d/2+c.clearance/2),y:item.y+Math.cos(t)*(item.d/2+c.clearance/2),d:c.clearance}),z:item.z,h:item.h,label:'مساحة فتح باب الجهاز'});}if(c.lid)r.push({kind:'lid',poly:corners(item),z:item.z+item.h,h:c.lid,label:'مساحة رفع غطاء الغسالة'});return r;}
function vertical(a,b){return a.z+a.h>b.z+.015&&b.z+b.h>a.z+.015;}
export function checkCollisions(s,g){const warnings=[],add=(ids,message,severity='warning')=>warnings.push({ids,message,severity});const polys=new Map(s.items.map(o=>[o.id,corners(o)]));
 for(const o of s.items){const poly=polys.get(o.id);const samples=[...poly,...poly.map((p,i)=>[(p[0]+poly[(i+1)%4][0])/2,(p[1]+poly[(i+1)%4][1])/2]),[o.x,o.y]];
  if(samples.some(p=>!g.rooms.some(r=>r.usable&&pointInPoly(p,r.poly))))add([o.id],`${o.name}: جزء خارج أرضية الشقة.`,'error');
  if(o.z+o.h>g.ceiling)add([o.id],`${o.name}: أعلى القطعة يتجاوز السقف.`,'error');
  const hit=g.walls.some(w=>{let pos=0;for(const op of [...w.openings].sort((a,b)=>a.center-b.center)){const start=op.center-op.width/2,end=op.center+op.width/2;if(start>pos&&overlap(poly,wallRect(wallPoint(w,pos),wallPoint(w,start),w.thickness)))return true;if((op.type==='window'&&(o.z<op.sill||o.z+o.h>op.sill+op.height)||op.type==='door'&&o.z+o.h>op.height)&&overlap(poly,wallRect(wallPoint(w,start),wallPoint(w,end),w.thickness)))return true;pos=end;}return pos<w.length&&overlap(poly,wallRect(wallPoint(w,pos),w.b,w.thickness));});
  if(hit)add([o.id],`${o.name}: يتداخل مع حائط.`,'error');
  for(const w of g.walls)for(const op of w.openings)if(op.type==='door'&&o.z<op.height&&overlap(poly,doorSector(w,op)))add([o.id,op.id],`${o.name}: داخل مساحة فتح باب (اتجاه الفتح مفترض).`);
 }
 for(let i=0;i<s.items.length;i++){const a=s.items[i];for(const b of s.items.slice(i+1))if(vertical(a,b)&&overlap(polys.get(a.id),polys.get(b.id)))add([a.id,b.id],`${a.name} يتداخل مع ${b.name}.`,'error');
  for(const c of clearances(a)){for(const b of s.items)if(b.id!==a.id&&vertical(c,b)&&overlap(c.poly,polys.get(b.id)))add([a.id,b.id],`${a.name}: ${c.label} تتعارض مع ${b.name}.`);if(c.kind==='front'&&c.poly.some(p=>!g.rooms.some(r=>r.usable&&pointInPoly(p,r.poly))))add([a.id],`${a.name}: مساحة فتح الجهاز خارج الأرضية.`);}
 }
 const washer=s.items.find(o=>o.type==='washer');if(washer){const room=g.rooms.find(r=>r.id==='lobby');if(pointInPoly([washer.x,washer.y],room.poly)){const clearance=(Math.max(...room.poly.map(p=>p[1]))-Math.min(...room.poly.map(p=>p[1])))-washer.d-g.walls[0].thickness;add([washer.id],`الغسالة في الطرقة الصغيرة: العمق المتبقي حوالي ${clearance.toFixed(2)} م؛ جرّب موضعًا لا يضيّق المرور.`);}}
 return warnings;
}
