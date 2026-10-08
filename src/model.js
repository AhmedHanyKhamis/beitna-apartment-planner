// All lengths are metres. Plan x runs right, y runs down; z is elevation.
// Named dimension bands resolve shared vertices, never independently scaled room boxes.
import {measurementRevision,measurementStatus,measurementNotes,measurementOpenings} from './measurement-data.js';
export const SCHEMA=1;
export const clone=v=>JSON.parse(JSON.stringify(v));
export const uid=()=>globalThis.crypto?.randomUUID?.()||`id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
export const parameterInfo={
  leftWidth:['عرض أوضة الأطفال',4.6,3,7],officeWidth:['عرض المكتب - الحيطة B',3.6,2.5,7],
  officeNotchWidth:['عرض ركنة المكتب B ناقص A',.25,.15,1.5],hallWidth:['عرض طرقة الأوض بعد ركنة المكتب',1.95,.75,4],
  kitchenWidth:['عرض المطبخ شامل امتداد المنور',3.25,2.5,5],courtyardWidth:['عرض المنور المستنتج',1.13,.5,1.8],
  bedroomDepth:['عمق أوض النوم',3.6,3,6],ensuiteDepth:['عمق حمام النوم المستنتج',1.9,1.2,3.5],
  bathDepth:['عمق الحمام الكبير',2.8,1.8,4],lobbyDepth:['الطرقة الصغيرة بين الحمام والمطبخ',1.37,.65,2],
  lobbyWidth:['عرض الطرقة الصغيرة حتى المنور',2.26,1.6,3],
  kitchenDepth:['عمق المطبخ',3.25,2,5],receptionTail:['الريسبشن من ركنة المدخل للنهاية',1.2,.5,6],
  receptionWidth:['عرض الجزء السفلي من الريسبشن',3.5,1.8,5],
  balconyWidth:['عرض البلكونة مثل باب المكتب - مؤقت',.83,.5,1.5],entryReturn:['عمق ركنة المكتب - من التسجيل السابق',1.43,.5,2.4],
  wallThickness:['سمك الحائط - غير مقاس',.15,.1,.3],ceilingHeight:['ارتفاع السقف',3.1,2.4,3.6],grossArea:['المساحة الإجمالية المبلّغ عنها',150,80,250]
};
export const catalog={
 bed:{name:'سرير كبير',w:1.8,d:2,h:.55,color:'#e3c6a0',kind:'bed',group:'نوم'},
 singleBed:{name:'سرير أطفال',w:1,d:2,h:.5,color:'#9fbecb',kind:'bed',group:'نوم'},
 wardrobe:{name:'دولاب',w:2.2,d:.6,h:2.2,color:'#b69779',group:'نوم'},
 vanity:{name:'تسريحة',w:1.1,d:.45,h:.8,color:'#d7bd9d',group:'نوم'},
 sofa:{name:'كنبة',w:2.4,d:.85,h:.78,color:'#77988d',kind:'sofa',group:'قعدة'},
 armchair:{name:'كرسي ضيوف',w:.8,d:.8,h:.78,color:'#bb9b80',kind:'sofa',group:'قعدة'},
 coffee:{name:'ترابيزة وسط',w:1.1,d:.6,h:.42,color:'#cba97b',group:'قعدة'},
 tv:{name:'تلفزيون ووحدة',w:1.5,d:.35,h:1.1,color:'#718390',kind:'tv',group:'قعدة'},
 desk:{name:'مكتب بشاشتين',w:1.6,d:.75,h:.76,color:'#bda889',kind:'desk',group:'مكتب'},
 chair:{name:'كرسي مكتب',w:.58,d:.6,h:.95,color:'#667c88',kind:'chair',group:'مكتب'},
 fridge:{name:'ثلاجة',w:.75,d:.7,h:1.85,color:'#b7c4c8',kind:'appliance',clearance:.65,group:'مطبخ'},
 freezer:{name:'فريزر رأسي',w:.6,d:.65,h:1.65,color:'#a8b7bd',kind:'appliance',clearance:.65,group:'مطبخ'},
 cooker:{name:'بوتاجاز بفرن',w:.6,d:.6,h:.9,color:'#8c9da4',kind:'cooker',group:'مطبخ'},
 hob:{name:'مسطح طهي',w:.6,d:.6,h:.9,color:'#8c9da4',kind:'cooker',group:'مطبخ'},
 oven:{name:'فرن منفصل',w:.6,d:.6,h:.9,color:'#8c9da4',kind:'appliance',group:'مطبخ'},
 hood:{name:'شفاط',w:.65,d:.45,h:.25,z:1.8,color:'#718790',kind:'hood',group:'مطبخ'},
 sink:{name:'حوض مطبخ',w:.8,d:.6,h:.9,color:'#a2bbc0',kind:'sink',group:'مطبخ'},
 counter:{name:'وحدة مطبخ',w:.6,d:.6,h:.9,color:'#c6baa5',group:'مطبخ'},
 dishwasher:{name:'مكان غسالة أطباق',w:.6,d:.6,h:.86,color:'#c2cbd0',kind:'appliance',clearance:.6,group:'مطبخ'},
 microwave:{name:'ميكروويف',w:.5,d:.4,h:.3,z:.95,color:'#a1afb4',kind:'appliance',group:'مطبخ'},
 washer:{name:'غسالة فتحة علوية',w:.6,d:.65,h:.95,color:'#b1c8d1',kind:'washer',lid:.6,group:'خدمات'},
 shower:{name:'دش بحاجز زجاج',w:.9,d:.9,h:2,color:'#a8d4d6',kind:'shower',group:'حمام'},
 tub:{name:'بانيو',w:1.7,d:.75,h:.6,color:'#c5dce0',kind:'tub',group:'حمام'},
 toilet:{name:'قاعدة حمام',w:.4,d:.68,h:.72,color:'#cbd6dc',kind:'toilet',group:'حمام'},
 basin:{name:'حوض حمام',w:.55,d:.45,h:.85,color:'#b7d0d1',kind:'sink',group:'حمام'},
 gasHeater:{name:'سخان غاز (مكان مبدئي)',w:.4,d:.28,h:.65,z:1.65,color:'#bac9ca',group:'خدمات'},
 electricHeater:{name:'سخان كهرباء (مكان مبدئي)',w:.48,d:.45,h:.7,z:1.65,color:'#bac9ca',group:'خدمات'},
 ac:{name:'وحدة تكييف مبدئية',w:.85,d:.22,h:.3,z:2.25,color:'#c6d6df',group:'خدمات'}
};
export function makeItem(type,x,y,extra={}) {const c=catalog[type];return {id:uid(),type,name:c.name,x,y,w:c.w,d:c.d,h:c.h,z:c.z||0,rotation:0,color:c.color,...extra};}
export function initialState(){
 const params=Object.fromEntries(Object.entries(parameterInfo).map(([k,v])=>[k,{value:v[1],status:measurementStatus[k]}]));
 const s={schemaVersion:SCHEMA,apartmentId:'confirmed-draft-03',measurementRevision,name:'توزيعنا بالمقاسات',params,openingOverrides:clone(measurementOpenings),alternatives:{cooking:'cooker',bathing:'shower',heater:'electricHeater'},items:[],servicePoints:[],notes:measurementNotes};
 const add=(t,x,y,e)=>s.items.push(makeItem(t,x,y,e));
 add('singleBed',.7,1.3,{id:'child-bed-1'});add('singleBed',3.85,1.3,{id:'child-bed-2'});add('wardrobe',2.3,3.2,{w:1.7,id:'child-wardrobe'});
 add('bed',6.85,1.3,{id:'main-bed'});add('wardrobe',8.3,1.5,{w:2.2,rotation:90,id:'main-wardrobe'});add('vanity',5.4,.35);add('tv',6.8,3.3,{w:1.2});
 add('desk',1.25,4.75,{id:'desk-1'});add('desk',1.25,6.9,{id:'desk-2'});add('chair',1.25,5.5);add('chair',1.25,7.65);
 add('sofa',1.5,10.45,{rotation:90,id:'daily-sofa'});add('tv',4.5,10.45,{rotation:90,id:'daily-tv'});add('coffee',2.75,10.45);
 add('sofa',2.5,13.55,{w:2.1,id:'guest-sofa'});add('armchair',1.5,12.35);add('armchair',3.5,12.35);add('coffee',2.5,12.55,{w:.9});
 add('shower',6.6,6.05,{id:'bathing-main',role:'bathing'});add('toilet',7.07,7.6,{rotation:90});add('basin',5.95,6.8);
 add('shower',7.12,4.925);add('toilet',6.1,5.06,{rotation:90});add('basin',7.1,4.1,{w:.5,d:.35});
 add('washer',7.25,9.05,{id:'washer'});add('electricHeater',7.25,9.05,{id:'heater-choice',role:'heater'});
 add('fridge',6.22,12.45,{id:'fridge',rotation:180});add('freezer',7,12.45,{rotation:180});add('sink',8.32,10.55,{rotation:90});add('dishwasher',8.32,11.35,{rotation:90});add('cooker',5.95,11.1,{rotation:270,id:'cooking-main',role:'cooking'});add('hood',5.95,11.1,{rotation:270,id:'cooking-hood'});add('counter',7.75,12.45);
 add('ac',2.3,.2);add('ac',7.2,.2);add('ac',2.4,3.8);add('ac',2,13.82);
 return s;
}
const area=p=>Math.abs(p.reduce((a,v,i)=>{const n=p[(i+1)%p.length];return a+v[0]*n[1]-n[0]*v[1];},0)/2);
export function geometry(s){
 const p=Object.fromEntries(Object.entries(s.params).map(([k,v])=>[k,v.value]));
 const C=p.leftWidth,L=p.officeWidth??C,R=L+p.hallWidth,T=R+p.kitchenWidth,B=T-p.courtyardWidth;
 const Y=p.bedroomDepth,N=Y+p.entryReturn,S=Y+p.ensuiteDepth,H=S+p.bathDepth,K=H+p.lobbyDepth,J=K+p.kitchenDepth,D=J+p.receptionTail;
 const A=p.balconyWidth,E=p.receptionWidth===undefined?L-.35:A+p.receptionWidth,X=L-(p.officeNotchWidth??1.05);
 const V=R+(p.lobbyWidth??(B-R));
 const rooms=[];const room=(id,name,poly,color,usable=true)=>rooms.push({id,name,poly,color,area:area(poly),usable});
 room('children','أوضة الأطفال',[[0,0],[C,0],[C,Y],[0,Y]],'#e6edf1');
 room('bedroom','أوضة النوم',[[C,0],[T,0],[T,Y],[C,Y]],'#eee8dd');
 room('office','المكتب',[[0,Y],[X,Y],[X,N],[L,N],[L,H],[0,H]],'#e6ece6');
 room('hall','طرقة الأوض',[[X,Y],[R,Y],[R,H],[L,H],[L,N],[X,N]],'#f0efe8');
 room('ensuite','حمام النوم',[[R,Y],[B,Y],[B,S],[R,S]],'#deedf0');
 room('bath','الحمام الكبير',[[R,S],[B,S],[B,H],[R,H]],'#dcebf0');
 room('lobby','طرقة صغيرة',[[R,H],[V,H],[V,K],[R,K]],'#e7ece5');
 room('courtyard','المنور',[[B,Y],[T,Y],[T,K],[V,K],[V,H],[B,H]],'#ccd6d3',false);
 room('kitchen','المطبخ',[[R,K],[T,K],[T,J],[R,J]],'#eae8de');
 room('reception','الريسبشن',[[A,H],[R,H],[R,J],[E,J],[E,D],[A,D]],'#eee8df');
 room('balcony','البلكونة',[[0,H],[A,H],[A,D],[0,D]],'#dce6de');
 room('stairs','السلم • خارج الشقة',[[E,J],[T,J],[T,D],[E,D]],'#e6e9e9',false);
 const walls=[]; const wall=(id,a,b,open=[])=>{const length=Math.hypot(b[0]-a[0],b[1]-a[1]);walls.push({id,a,b,length,thickness:p.wallThickness,openings:open.map(o=>{const q={...o,...s.openingOverrides[o.id]};q.width=Math.min(q.width,length-.1);q.center=Math.max(q.width/2+.025,Math.min(length-q.width/2-.025,q.anchor*length));return q;})});};
 const door=(id,anchor,width=.85,swing=1,hinge=0)=>({id,type:'door',anchor,width,swing,hinge,height:2.1,status:'assistant-estimate'});
 const win=(id,anchor,width=1.1)=>({id,type:'window',anchor,width,height:1.1,sill:1,status:'assistant-estimate'});
 wall('outer-top',[0,0],[T,0]);wall('left-children',[0,0],[0,Y],[win('window-children',.5,1.25)]);wall('left-office',[0,Y],[0,H],[win('window-office',.55)]);wall('left-balcony',[0,H],[0,D]);
 wall('bedroom-split',[C,0],[C,Y]);wall('children-bottom',[0,Y],[C,Y],[door('door-children',(C-.54)/C,.9,-1)]);
 wall('bedroom-bottom',[C,Y],[T,Y],[door('door-bedroom',(R-C)/(2*(T-C)),Math.min(.95,R-C-.05),-1),door('door-ensuite',(R+(B-R)*.35-C)/(T-C),.75,1),win('window-bedroom',(B+(T-B)/2-C)/(T-C),.55)]);
 wall('outer-bedroom',[T,0],[T,Y]);wall('office-return',[X,Y],[X,N],[door('door-office',.5,.92,-1)]);wall('office-return-bottom',[X,N],[L,N]);wall('office-hall',[L,N],[L,H]);
 wall('office-bottom',[0,H],[L,H],[door('door-office-balcony',A/(2*L),Math.max(.65,A-.08),-1)]);
 wall('service-hall',[R,Y],[R,K],[{...door('passage-lobby',(H+p.lobbyDepth/2-Y)/(K-Y),Math.min(.85,p.lobbyDepth-.1)),type:'passage'}]);
 wall('bath-divider',[R,S],[B,S]);wall('bath-bottom',[R,H],[B,H],[door('door-bath',.27,.8,-1)]);
 wall('court-ensuite',[B,Y],[B,S],[win('window-ensuite',.5,.6)]);wall('court-bath',[B,S],[B,H],[win('window-bath',.55,.65)]);wall('court-lobby',[V,H],[V,K],[win('window-lobby',.5,.55)]);
 if(Math.abs(V-B)>.001)wall('lobby-bath-return',[B,H],[V,H]);
 wall('kitchen-top',[R,K],[T,K],[door('door-kitchen',.23,.8,1),win('window-kitchen',((V+T)/2-R)/p.kitchenWidth,.55)]);
 wall('kitchen-left',[R,K],[R,J]);wall('kitchen-right',[T,K],[T,J]);wall('kitchen-bottom',[R,J],[T,J]);
 wall('reception-entry',[E,J],[R,J],[door('door-entry',.52,1.05,-1)]);wall('reception-lower-right',[E,J],[E,D]);wall('reception-bottom',[A,D],[E,D]);
 wall('balcony-bottom',[0,D],[A,D]);wall('balcony-reception',[A,H],[A,D],[door('door-balcony',.22,.75,1),win('window-reception',.83,1.1)]);
 return {rooms,walls,width:T,depth:D,ceiling:p.ceilingHeight,usableArea:rooms.filter(r=>r.usable).reduce((a,r)=>a+r.area,0),bands:{C,L,R,B,T,Y,N,S,H,K,J,D,A,E,X,V}};
}
export function wallPoint(w,d){const t=d/w.length;return [w.a[0]+(w.b[0]-w.a[0])*t,w.a[1]+(w.b[1]-w.a[1])*t];}
export function wallPieces(w){let cursor=0;const out=[];for(const o of [...w.openings].sort((a,b)=>a.center-b.center)){const a=o.center-o.width/2,b=o.center+o.width/2;if(a>cursor)out.push({a:wallPoint(w,cursor),b:wallPoint(w,a),z:0,h:null});if(o.type==='window')out.push({a:wallPoint(w,a),b:wallPoint(w,b),z:0,h:o.sill});if(o.type!=='passage')out.push({a:wallPoint(w,a),b:wallPoint(w,b),z:(o.sill||0)+o.height,h:null});cursor=b;}if(cursor<w.length)out.push({a:wallPoint(w,cursor),b:w.b,z:0,h:null});return out;}
export function editDimension(s,key,value,status){const spec=parameterInfo[key];if(!spec||!Number.isFinite(value)||value<spec[2]||value>spec[3])throw Error('المقاس خارج المجال المتاح للحفاظ على التقسيمة.');
 const before=geometry(s);s.params[key]={value,status:status||s.params[key].status};if(s.params.kitchenWidth.value-s.params.courtyardWidth.value<1.6)throw Error('عرض الحمامات المتبقي أقل من 1.6 متر.');if(s.params.entryReturn.value>s.params.ensuiteDepth.value)throw Error('ركنة المكتب يجب أن تنتهي قبل حائط الحمامين.');const after=geometry(s);
 // Translate room-relative items, preserving physical furniture sizes and rotations.
 for(const collection of [s.items,s.servicePoints])for(const o of collection){const r=before.rooms.find(r=>r.usable&&pointInPoly([o.x,o.y],r.poly));if(!r)continue;const n=after.rooms.find(n=>n.id===r.id);const min=p=>[Math.min(...p.map(v=>v[0])),Math.min(...p.map(v=>v[1]))];const a=min(r.poly),b=min(n.poly);o.x+=b[0]-a[0];o.y+=b[1]-a[1];}
 return s;
}
export function applyMeasuredDimensions(s){
 const before=geometry(s);
 s.params=Object.fromEntries(Object.entries(parameterInfo).map(([k,v])=>[k,
  ['wallThickness','grossArea'].includes(k)&&s.params[k]?.status==='measured'
   ?clone(s.params[k]):{value:v[1],status:measurementStatus[k]}]));
 const after=geometry(s),minimum=r=>[Math.min(...r.poly.map(p=>p[0])),Math.min(...r.poly.map(p=>p[1]))];
 for(const [id,measured]of Object.entries(measurementOpenings))s.openingOverrides[id]={...s.openingOverrides[id],...measured};
 for(const objects of [s.items,s.servicePoints])for(const o of objects){
  const oldRoom=before.rooms.find(r=>r.usable&&pointInPoly([o.x,o.y],r.poly));if(!oldRoom)continue;
  const room=after.rooms.find(r=>r.id===oldRoom.id),a=minimum(oldRoom),b=minimum(room);
  o.x+=b[0]-a[0];o.y+=b[1]-a[1];
 }
 s.measurementRevision=measurementRevision;s.notes=measurementNotes;
 return s;
}
export function pointInPoly([x,y],p){let inside=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
export function corners(o,pad=0){const t=o.rotation*Math.PI/180,c=Math.cos(t),s=Math.sin(t);return [[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>[o.x+x*(o.w/2+pad)*c-y*(o.d/2+pad)*s,o.y+x*(o.w/2+pad)*s+y*(o.d/2+pad)*c]);}
export function setAlternative(s,key,type){const roles={cooking:'cooking-main',bathing:'bathing-main',heater:'heater-choice'};let item=s.items.find(x=>x.id===roles[key]);if(!item){const b=geometry(s).bands,pos={cooking:[b.R+.38,b.K+1.2],bathing:[b.B-.62,b.S+.57],heater:[b.B-.6,b.H+.55]}[key];item=makeItem(type,...pos,{id:roles[key],role:key,rotation:key==='cooking'?270:0});s.items.push(item);}const c=catalog[type];Object.assign(item,{type,name:c.name,w:c.w,d:c.d,h:c.h,z:c.z||0,color:c.color});s.alternatives[key]=type;
 if(key==='cooking'){s.items=s.items.filter(x=>x.id!=='separate-oven');if(type==='hob'){const g=geometry(s);s.items.push(makeItem('oven',g.bands.R+.4,g.bands.J-.5,{id:'separate-oven'}));}}
}
export function validateState(s){
 if(!s||s.schemaVersion!==SCHEMA||s.apartmentId!=='confirmed-draft-03')throw Error('الملف ليس تصميمًا متوافقًا مع تقسيمة هذه الشقة.');
 s=clone(s);
 // Keep legacy saved layouts intact. New fields reproduce their previous geometry,
 // rather than silently replacing a user's saved furniture or measurements.
 if(s.params?.leftWidth&&s.params?.balconyWidth){
  s.params.officeWidth??=clone(s.params.leftWidth);
  s.params.officeNotchWidth??={value:1.05,status:'assistant-estimate'};
  s.params.receptionWidth??={value:s.params.leftWidth.value-.35-s.params.balconyWidth.value,status:'assistant-estimate'};
  s.params.lobbyWidth??={value:s.params.kitchenWidth.value-s.params.courtyardWidth.value,status:'assistant-estimate'};
 }
 if(typeof s.name!=='string'||s.name.length>100||!Array.isArray(s.items)||s.items.length>400||!Array.isArray(s.servicePoints)||s.servicePoints.length>300)throw Error('بيانات التصميم غير صحيحة أو أكبر من الحد المتاح.');
 for(const [k,v]of Object.entries(parameterInfo)){const p=s.params?.[k];if(!p||!Number.isFinite(p.value)||p.value<v[2]||p.value>v[3]||!['measured','derived','user-estimate','assistant-estimate'].includes(p.status))throw Error('مقاسات أو حالات قياس غير صالحة.');}
 if(s.params.kitchenWidth.value-s.params.courtyardWidth.value<1.6||s.params.entryReturn.value>s.params.ensuiteDepth.value)throw Error('المقاسات تتعارض مع الحيطان المشتركة.');
 const bounds=geometry(s).bands;
 if(bounds.X<=0||bounds.X>=bounds.C||bounds.C>=bounds.R-.5||bounds.E>=bounds.R-.1||bounds.L>bounds.C||bounds.V>=bounds.T-.3)throw Error('الأبعاد تفصل مداخل الغرف أو تجعل امتداد الريسبشن خارج حدوده.');
 if(!s.openingOverrides||typeof s.openingOverrides!=='object'||Array.isArray(s.openingOverrides)||!s.alternatives||!['cooker','hob'].includes(s.alternatives.cooking)||!['shower','tub'].includes(s.alternatives.bathing)||!['gasHeater','electricHeater'].includes(s.alternatives.heater))throw Error('بدائل أو فتحات غير صالحة.');
 const ids=new Set();for(const o of s.items){if(!catalog[o.type]||typeof o.id!=='string'||!/^[-a-zA-Z0-9_]{1,80}$/.test(o.id)||ids.has(o.id)||typeof o.name!=='string'||o.name.length>100||!/^#[0-9a-f]{6}$/i.test(o.color)||!['x','y','w','d','h','z','rotation'].every(k=>Number.isFinite(o[k]))||o.w<.1||o.d<.1||o.h<.05||o.w>8||o.d>8||o.h>4||o.z<0||o.z>3.6||Math.abs(o.rotation)>3600||Math.abs(o.x)>40||Math.abs(o.y)>40)throw Error('قطعة فرش غير صالحة.');ids.add(o.id);}
 for(const o of s.servicePoints){if(typeof o.id!=='string'||!/^[-a-zA-Z0-9_]{1,80}$/.test(o.id)||ids.has(o.id)||!['electric','water','drain'].includes(o.type)||!['x','y','z'].every(k=>Number.isFinite(o[k]))||Math.abs(o.x)>40||Math.abs(o.y)>40||o.z<0||o.z>3.6||typeof o.name!=='string'||o.name.length>100)throw Error('نقطة خدمات غير صالحة.');ids.add(o.id);}
 const openingIds=new Set(geometry({...s,openingOverrides:{}}).walls.flatMap(w=>w.openings.map(o=>o.id)));for(const [id,o]of Object.entries(s.openingOverrides)){if(!openingIds.has(id)||!o||typeof o!=='object')throw Error('فتحة غير معروفة.');for(const k of Object.keys(o))if(!['width','anchor','swing','hinge','sill','height','status'].includes(k))throw Error('خاصية فتحة غير معروفة.');if(o.width!==undefined&&(!Number.isFinite(o.width)||o.width<.3||o.width>2.5)||o.anchor!==undefined&&(!Number.isFinite(o.anchor)||o.anchor<0||o.anchor>1)||o.swing!==undefined&&![1,-1].includes(o.swing)||o.hinge!==undefined&&![0,1].includes(o.hinge)||o.height!==undefined&&(!Number.isFinite(o.height)||o.height<.3||o.height>2.4)||o.sill!==undefined&&(!Number.isFinite(o.sill)||o.sill<.3||o.sill>1.6)||o.status!==undefined&&!['measured','user-estimate','assistant-estimate'].includes(o.status))throw Error('مقاس أو اتجاه فتحة غير صالح.');}
 const g=geometry(s);for(const w of g.walls){let end=-.01;for(const o of [...w.openings].sort((a,b)=>a.center-b.center)){if(o.center-o.width/2<end-.001)throw Error('الفتحات متداخلة على نفس الحائط؛ قلّل العرض أو غيّر موضعها.');end=o.center+o.width/2;if(o.type!=='passage'&&(o.sill||0)+o.height>g.ceiling)throw Error('ارتفاع الفتحة يتجاوز السقف.');}}
 return clone(s);
}
