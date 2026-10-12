// All lengths are metres. Plan x runs right, y runs down; z is elevation.
// Named dimension bands resolve shared vertices, never independently scaled room boxes.
import {measurementRevision,measurementStatus,measurementNotes,measurementOpenings,surveyReadings} from './measurement-data.js';
import {geometrySurvey} from './survey-geometry.js';
export const SCHEMA=1;
export const clone=v=>JSON.parse(JSON.stringify(v));
export const uid=()=>globalThis.crypto?.randomUUID?.()||`id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
export const parameterInfo={
  leftWidth:['عرض أوضة الأطفال',4.6,3,7],bedroomWidth:['عرض أوضة النوم الصافي',4.2,3,6],officeWidth:['عرض المكتب بعد الركنة',4.4,2.5,7],
  officeDepth:['طول المكتب الفعلي',4.7,3,7],
  officeNotchWidth:['عرض الردّة الأفقية عند باب المكتب',1.08,.15,1.5],hallWidth:['عرض طرقة الأوض بعد ركنة المكتب',1.2,.75,4],
  kitchenWidth:['عرض المطبخ شامل امتداد المنور',3.25,2.5,5],courtyardWidth:['عرض المنور المستنتج',1.13,.5,1.8],
  bedroomDepth:['عمق أوض النوم',3.6,3,6],ensuiteDepth:['طول الحمام الصغير',1.5,1.2,3.5],
  ensuiteWidth:['عرض الحمام الصغير',2.1,1.6,3],
  bathDepth:['عمق الحمام الكبير',2.8,1.8,4],lobbyDepth:['الطرقة الصغيرة بين الحمام والمطبخ',1.37,.65,2],
  lobbyWidth:['عرض الطرقة الصغيرة حتى المنور',2.26,1.6,3],
  kitchenDepth:['عمق المطبخ',3.25,2,5],receptionLength:['طول حائط بلكونة الريسبشن – تقريبي',7.62,3,16],
  receptionEntryOffset:['من حائط المكتب إلى باب الشقة – محسوب',4.92,2,10],receptionUpperWidth:['عرض الريسبشن الواسع الصافي',4.66,3.5,7],
  receptionTail:['الريسبشن من ركنة المدخل للنهاية',2.7,.5,6],
  receptionWidth:['عرض الجزء السفلي من الريسبشن',3.5,1.8,5],
  balconyWidth:['موضع حائط البلكونة مع الريسبشن – من المحاذاة',.75,.5,3],
  balconyClearWidth:['عرض البلكونة الصافي',1.37,.3,3],balconyDoorReturnWidth:['عرض الردّة عند باب المكتب – مبدئي',.3,0,1],balconyDoorReturnDepth:['عمق الردّة عند باب المكتب – مبدئي',.3,0,1],entryReturn:['عمق ركنة المكتب الصافي',1.35,.5,2.4],
  exteriorWallThickness:['سمك عينة الحائط الخارجي',.1,.05,.4],wallThickness:['سمك عينة الحائط الداخلي',.31,.1,.5],ceilingHeight:['ارتفاع السقف',3.1,2.4,3.6],grossArea:['المساحة الإجمالية المبلّغ عنها',150,80,250]
};
export const catalog={
 bed:{name:'سرير كبير · مرتبة 180 × 200',w:1.96,d:2.09,h:1,color:'#e3c6a0',kind:'bed',group:'نوم',note:'المقاس الخارجي شامل الهيكل والتاج؛ سطح المرتبة نحو 55 سم.'},
 singleBed:{name:'سرير أطفال · مرتبة 90 × 200',w:1.06,d:2.09,h:1,color:'#9fbecb',kind:'bed',group:'نوم',note:'المقاس الخارجي شامل الهيكل والتاج؛ سطح المرتبة نحو 55 سم.'},
 wardrobe:{name:'دولاب',w:2.2,d:.6,h:2.2,color:'#b69779',group:'نوم'},
 vanity:{name:'تسريحة',w:1.1,d:.45,h:.8,color:'#d7bd9d',group:'نوم'},
 sofa:{name:'كنبة 3 مقاعد',w:2.27,d:.95,h:.83,color:'#77988d',kind:'sofa',group:'قعدة'},
 armchair:{name:'كرسي ضيوف',w:.8,d:.8,h:.78,color:'#bb9b80',kind:'sofa',group:'قعدة'},
 coffee:{name:'ترابيزة وسط',w:1.1,d:.6,h:.42,color:'#cba97b',group:'قعدة'},
 tv:{name:'تلفزيون ووحدة',w:1.5,d:.35,h:1.1,color:'#718390',kind:'tv',group:'قعدة'},
 desk:{name:'مكتب بشاشتين',w:1.6,d:.8,h:.75,color:'#bda889',kind:'desk',group:'مكتب'},
 chair:{name:'كرسي مكتب',w:.68,d:.68,h:1.05,color:'#667c88',kind:'chair',group:'مكتب'},
 fridge:{name:'ثلاجة',w:.75,d:.7,h:1.85,color:'#b7c4c8',kind:'appliance',clearance:.65,group:'مطبخ'},
 freezer:{name:'فريزر رأسي',w:.6,d:.65,h:1.65,color:'#a8b7bd',kind:'appliance',clearance:.65,group:'مطبخ'},
 cooker:{name:'بوتاجاز بفرن',w:.6,d:.6,h:.9,color:'#8c9da4',kind:'cooker',group:'مطبخ'},
 hob:{name:'مسطح طهي مدمج',w:.59,d:.52,h:.052,z:.848,color:'#8c9da4',kind:'cooker',group:'مطبخ',note:'مسطح رفيع على ارتفاع رخامة 90 سم؛ وحدة المطبخ تحته تُضاف منفصلة.'},
 oven:{name:'فرن مدمج منفصل',w:.595,d:.567,h:.595,z:.1,color:'#8c9da4',kind:'appliance',clearance:.6,group:'مطبخ',note:'مقاس جسم الفرن؛ وحدة التركيب تُضاف منفصلة.'},
 hood:{name:'شفاط',w:.65,d:.45,h:.25,z:1.8,color:'#718790',kind:'hood',group:'مطبخ'},
 sink:{name:'حوض مطبخ',w:.8,d:.6,h:.9,color:'#a2bbc0',kind:'sink',group:'مطبخ'},
 counter:{name:'وحدة مطبخ',w:.6,d:.6,h:.9,color:'#c6baa5',group:'مطبخ'},
 dishwasher:{name:'مكان غسالة أطباق',w:.6,d:.6,h:.86,color:'#c2cbd0',kind:'appliance',clearance:.6,group:'مطبخ'},
 microwave:{name:'ميكروويف',w:.5,d:.4,h:.3,z:.95,color:'#a1afb4',kind:'appliance',group:'مطبخ'},
 washer:{name:'غسالة فتحة علوية 9 كجم',w:.55,d:.565,h:.93,color:'#b1c8d1',kind:'washer',lid:.6,group:'خدمات',note:'مقاس جسم غسالة توشيبا 9 كجم؛ فراغ الغطاء والتوصيلات إضافي.'},
 shower:{name:'دش بحاجز زجاج',w:.9,d:.9,h:2,color:'#a8d4d6',kind:'shower',group:'حمام'},
 tub:{name:'بانيو',w:1.7,d:.75,h:.6,color:'#c5dce0',kind:'tub',group:'حمام'},
 toilet:{name:'قاعدة حمام',w:.4,d:.68,h:.72,color:'#cbd6dc',kind:'toilet',group:'حمام'},
 basin:{name:'حوض حمام',w:.55,d:.45,h:.85,color:'#b7d0d1',kind:'sink',group:'حمام'},
 gasHeater:{name:'سخان غاز (مكان مبدئي)',w:.4,d:.28,h:.65,z:1.65,color:'#bac9ca',group:'خدمات'},
 electricHeater:{name:'سخان كهرباء (مكان مبدئي)',w:.48,d:.45,h:.7,z:1.65,color:'#bac9ca',group:'خدمات'},
 ac:{name:'وحدة تكييف مبدئية',w:.85,d:.22,h:.3,z:2.25,color:'#c6d6df',group:'خدمات'}
};
export function makeItem(type,x,y,extra={}) {const c=catalog[type];return {id:uid(),type,name:c.name,x,y,w:c.w,d:c.d,h:c.h,z:c.z||0,rotation:0,color:c.color,...extra};}
export function resetItemSize(item){const c=catalog[item.type];Object.assign(item,{w:c.w,d:c.d,h:c.h,z:c.z||0});}
export function initialState(){
 const params=Object.fromEntries(Object.entries(parameterInfo).map(([k,v])=>[k,{value:v[1],status:measurementStatus[k]}]));
 const s={schemaVersion:SCHEMA,apartmentId:'confirmed-draft-03',measurementRevision,geometryBasis:'clear-survey-20261012',surveyReadings:clone(surveyReadings),hallWidthBasis:'clear',balconyShape:'external-return',exteriorLayout:'unmapped',lobbySideIsPassage:false,name:'توزيعنا بالمقاسات',params,openingOverrides:clone(measurementOpenings),alternatives:{cooking:'cooker',bathing:'shower',heater:'electricHeater'},items:[],servicePoints:[],notes:measurementNotes};
 const add=(t,x,y,e)=>s.items.push(makeItem(t,x,y,e));
 add('singleBed',.7,1.3,{id:'child-bed-1'});add('singleBed',3.85,1.3,{id:'child-bed-2'});add('wardrobe',2.3,3.2,{w:1.7,id:'child-wardrobe'});
 add('bed',7.07,1.3,{id:'main-bed'});add('wardrobe',8.69,1.5,{w:2.2,rotation:90,id:'main-wardrobe'});add('vanity',5.49,.35);add('tv',6.8,3.3,{w:1.2});
 add('desk',1.25,4.75,{id:'desk-1'});add('desk',2.2,6.3,{id:'desk-2'});add('chair',1.25,5.5);add('chair',2.2,7.05);
 add('sofa',1.85,10.9,{rotation:90,id:'daily-sofa'});add('tv',5.55,10.9,{rotation:90,id:'daily-tv'});add('coffee',3.1,10.9);
 add('sofa',3,15.92,{w:2.1,id:'guest-sofa'});add('armchair',1.85,14.37);add('armchair',4.15,14.37);add('coffee',3,14.57,{w:.9});
 add('shower',6.85,6.3,{id:'bathing-main',role:'bathing'});add('toilet',7.5,7.42,{rotation:90});add('basin',7.85,8.02);
 add('shower',7.75,4.97);add('toilet',6.65,5.17,{rotation:90});add('basin',7.8,4.23,{w:.5,d:.35});
 add('washer',7.7,9.62,{id:'washer'});add('electricHeater',7.7,9.62,{id:'heater-choice',role:'heater'});
 add('fridge',6.7,13.42,{id:'fridge',rotation:180});add('freezer',7.6,13.42,{rotation:180});add('sink',9.08,11.52,{rotation:90});add('dishwasher',9.08,12.32,{rotation:90});add('cooker',6.55,11.87,{rotation:270,id:'cooking-main',role:'cooking'});add('hood',6.55,11.87,{rotation:270,id:'cooking-hood'});add('counter',8.35,13.42);
 add('ac',2.3,.2);add('ac',7.2,.2);add('ac',2.4,4.12);add('ac',2,16.35);
 return s;
}
const area=p=>Math.abs(p.reduce((a,v,i)=>{const n=p[(i+1)%p.length];return a+v[0]*n[1]-n[0]*v[1];},0)/2);
export function geometry(s){
 if(s.geometryBasis==='clear-survey-20261012')return geometrySurvey(s);
 const p=Object.fromEntries(Object.entries(s.params).map(([k,v])=>[k,v.value]));
 const C=p.leftWidth,L=p.officeWidth??C,R=L+p.hallWidth,T=R+p.kitchenWidth,B=T-p.courtyardWidth;
 const Y=p.bedroomDepth,N=Y+p.entryReturn,S=Y+p.ensuiteDepth,H=S+p.bathDepth,K=H+p.lobbyDepth,J=K+p.kitchenDepth;
 const O=Y+(p.officeDepth??(p.ensuiteDepth+p.bathDepth));
 const D=p.receptionLength===undefined?J+p.receptionTail:O+p.receptionLength,P=D-p.receptionTail;
 const A=p.balconyWidth,E=p.receptionWidth===undefined?L-.35:A+p.receptionWidth,X=L-(p.officeNotchWidth??1.05);
 const externalBalcony=s.balconyShape==='external-return',F=externalBalcony?A-p.balconyClearWidth-p.wallThickness:0,Z=externalBalcony?-p.balconyDoorReturnWidth:0,G=externalBalcony?O-p.balconyDoorReturnDepth:O;
 const Q=R+(p.ensuiteWidth??(B-R));
 const V=R+(p.lobbyWidth??(B-R));
 const rooms=[];const room=(id,name,poly,color,usable=true)=>rooms.push({id,name,poly,color,area:area(poly),usable});
 room('children','أوضة الأطفال',[[0,0],[C,0],[C,Y],[0,Y]],'#e6edf1');
 room('bedroom','أوضة النوم',[[C,0],[T,0],[T,Y],[C,Y]],'#eee8dd');
 room('office','المكتب',externalBalcony?[[0,Y],[X,Y],[X,N],[L,N],[L,O],[Z,O],[Z,G],[0,G]]:[[0,Y],[X,Y],[X,N],[L,N],[L,O],[0,O]],'#e6ece6');
 room('hall','طرقة الأوض',[[X,Y],[R,Y],[R,H],[L,H],[L,N],[X,N]],'#f0efe8');
 room('ensuite','حمام النوم',[[R,Y],[Q,Y],[Q,S],[R,S]],'#deedf0');
 room('bath','الحمام الكبير',[[R,S],[B,S],[B,H],[R,H]],'#dcebf0');
 room('lobby','طرقة صغيرة',[[R,H],[V,H],[V,K],[R,K]],'#e7ece5');
 room('courtyard','المنور',[[Q,Y],[T,Y],[T,K],[V,K],[V,H],[B,H],[B,S],[Q,S]],'#ccd6d3',false);
 room('kitchen','المطبخ',[[R,K],[T,K],[T,J],[R,J]],'#eae8de');
 room('reception','الريسبشن',Math.abs(O-H)<.001?[[A,H],[R,H],[R,P],[E,P],[E,D],[A,D]]:[[A,O],[L,O],[L,H],[R,H],[R,P],[E,P],[E,D],[A,D]],'#eee8df');
 room('balcony','البلكونة',[[F,O],[A,O],[A,D],[F,D]],'#dce6de');
 if(s.exteriorLayout!=='unmapped')room('stairs','السلم • خارج الشقة',P>J+.001?[[E,P],[R,P],[R,J],[T,J],[T,D],[E,D]]:[[E,P],[T,P],[T,D],[E,D]],'#e6e9e9',false);
 const walls=[]; const wall=(id,a,b,open=[])=>{const length=Math.hypot(b[0]-a[0],b[1]-a[1]);walls.push({id,a,b,length,thickness:p.wallThickness,openings:open.map(o=>{const q={...o,...s.openingOverrides[o.id]};q.width=Math.min(q.width,length-.1);q.center=Math.max(q.width/2+(o.id==='window-ensuite'?0:.025),Math.min(length-q.width/2-(o.id==='window-ensuite'?0:.025),q.anchor*length));return q;})});};
 const door=(id,anchor,width=.85,swing=1,hinge=0)=>({id,type:'door',anchor,width,swing,hinge,height:2.1,status:'assistant-estimate'});
 const win=(id,anchor,width=1.1)=>({id,type:'window',anchor,width,height:1.1,sill:1,status:'assistant-estimate'});
 wall('outer-top',[0,0],[T,0]);wall('left-children',[0,0],[0,Y],[win('window-children',.5,1.25)]);wall('left-office',[0,Y],[0,G],[win('window-office',.55)]);wall('left-balcony',[F,O],[F,D]);
 if(externalBalcony){wall('office-balcony-return-top',[0,G],[Z,G]);wall('office-balcony-return-side',[Z,G],[Z,O]);wall('balcony-projection-top',[F,O],[Z,O]);}
 wall('bedroom-split',[C,0],[C,Y]);wall('children-bottom',[0,Y],[C,Y],[door('door-children',(C-.54)/C,.9,-1)]);
 wall('bedroom-bottom',[C,Y],[T,Y],[door('door-bedroom',(R-C)/(2*(T-C)),Math.min(.95,R-C-.05),-1),door('door-ensuite',(R+(B-R)*.35-C)/(T-C),.75,1),win('window-bedroom',(B+(T-B)/2-C)/(T-C),.55)]);
 wall('outer-bedroom',[T,0],[T,Y]);wall('office-return',[X,Y],[X,N],[door('door-office',.5,.92,-1)]);wall('office-return-bottom',[X,N],[L,N]);wall('office-hall',[L,N],[L,H]);
 if(O>H+.001)wall('office-reception-step',[L,H],[L,O]);
 const officeBalconyDoor=externalBalcony?door('door-office-balcony',((Z+A)/2-Z)/(L-Z),.83,1):door('door-office-balcony',A/(2*L),Math.max(.65,A-.08),-1);
 wall('office-bottom',[Z,O],[L,O],[officeBalconyDoor]);
 wall('service-hall',[R,Y],[R,K],[{...door('passage-lobby',(H+p.lobbyDepth/2-Y)/(K-Y),Math.min(.85,p.lobbyDepth-.1)),type:'passage'}]);
 wall('bath-divider',[R,S],[Math.max(B,Q),S]);wall('bath-bottom',[R,H],[B,H],[door('door-bath',.27,.8,-1)]);
 wall('court-ensuite',[Q,Y],[Q,S],[win('window-ensuite',1.1/p.ensuiteDepth,.8)]);wall('court-bath',[B,S],[B,H],[win('window-bath',.55,.65)]);wall('court-lobby',[V,H],[V,K],[win('window-lobby',.5,.55)]);
 if(Math.abs(V-B)>.001)wall('lobby-bath-return',[B,H],[V,H]);
 wall('kitchen-top',[R,K],[T,K],[door('door-kitchen',.23,.8,1),win('window-kitchen',((V+T)/2-R)/p.kitchenWidth,.55)]);
 wall('kitchen-left',[R,K],[R,J]);wall('kitchen-right',[T,K],[T,J]);wall('kitchen-bottom',[R,J],[T,J]);
 if(P>J+.001)wall('reception-stairs-side',[R,J],[R,P]);
 if(Math.abs(E-R)<.001){wall('reception-entry',[E,P],[E,D],[door('door-entry',.25,1.05,-1)]);}else{wall('reception-entry',[E,P],[R,P],[door('door-entry',.52,1.05,-1)]);wall('reception-lower-right',[E,P],[E,D]);}wall('reception-bottom',[A,D],[E,D]);
 wall('balcony-bottom',[F,D],[A,D]);wall('balcony-reception',[A,O],[A,D],[door('door-balcony',.22,.75,1),win('window-reception',.83,1.1)]);
 // The confirmed hall width is face-to-face. Put half the wall thickness
 // on each adjoining room, keeping the measured circulation strip [L,R] clear.
 if(s.hallWidthBasis==='clear'){
  const t=p.wallThickness/2;
  for(const r of rooms){if(['ensuite','bath','lobby'].includes(r.id)){r.poly=r.poly.map(([x,y])=>[x+t,y]);r.area=area(r.poly);continue;}
   if(r.id==='courtyard'){r.poly=r.poly.map(([x,y])=>[Math.abs(x-T)<1e-8?x:x+t,y]);r.area=area(r.poly);continue;}
   if(r.id==='reception'){const i=r.poly.findIndex(q=>Math.abs(q[0]-R)<1e-8&&Math.abs(q[1]-H)<1e-8);if(i>=0)r.poly.splice(i,1,[R+t,H],[R+t,K],[R,K]);}
   if(['office','hall','reception'].includes(r.id)){
   r.poly=r.poly.map(([x,y])=>[Math.abs(x-L)<1e-8&&y>=N-1e-8?x-t:Math.abs(x-R)<1e-8&&['hall','ensuite','bath','lobby'].includes(r.id)?x+t:x,y]);r.area=area(r.poly);
  }}
  for(const w of walls){
   if(['office-return-bottom','office-hall','office-reception-step','office-bottom'].includes(w.id))for(const q of [w.a,w.b])if(Math.abs(q[0]-L)<1e-8)q[0]-=t;
   if(['service-hall','bath-divider','bath-bottom','court-ensuite','court-bath','court-lobby','lobby-bath-return'].includes(w.id))for(const q of [w.a,w.b])q[0]+=t;
   if(w.id==='kitchen-top'&&Math.abs(w.a[0]-R)<1e-8)w.a[0]+=t;
   const oldLength=w.length;w.length=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]);
   if(Math.abs(w.length-oldLength)>1e-8)for(const op of w.openings){const pad=op.id==='window-ensuite'?0:.025;op.width=Math.min(op.width,w.length-.1);op.center=Math.max(op.width/2+pad,Math.min(w.length-op.width/2-pad,op.anchor*w.length));}
  }
 }
 return {rooms,walls,minX:F,maxX:T,width:T-F,depth:D,ceiling:p.ceilingHeight,usableArea:rooms.filter(r=>r.usable).reduce((a,r)=>a+r.area,0),bands:{C,L,R,B,T,Y,N,S,H,K,J,D,A,E,X,V,O,P,F,Z,G}};
}
export function wallPoint(w,d){const t=d/w.length;return [w.a[0]+(w.b[0]-w.a[0])*t,w.a[1]+(w.b[1]-w.a[1])*t];}
export function wallPieces(w){let cursor=0;const out=[];for(const o of [...w.openings].sort((a,b)=>a.center-b.center)){const a=o.center-o.width/2,b=o.center+o.width/2;if(a>cursor)out.push({a:wallPoint(w,cursor),b:wallPoint(w,a),z:0,h:null});if(o.type==='window')out.push({a:wallPoint(w,a),b:wallPoint(w,b),z:0,h:o.sill});if(o.type!=='passage')out.push({a:wallPoint(w,a),b:wallPoint(w,b),z:(o.sill||0)+o.height,h:null});cursor=b;}if(cursor<w.length)out.push({a:wallPoint(w,cursor),b:w.b,z:0,h:null});return out;}
export function editDimension(s,key,value,status){const spec=parameterInfo[key];if(!spec||!Number.isFinite(value)||value<spec[2]||value>spec[3])throw Error('المقاس خارج المجال المتاح للحفاظ على التقسيمة.');
 const before=geometry(s);s.params[key]={value,status:status||s.params[key].status};
 // This field adjusts the shared office/hall boundary, keeping the door return
 // and service-side wall fixed, as the user's red-line correction specifies.
 if(key==='officeWidth'&&s.geometryBasis!=='clear-survey-20261012'){
  const hall=before.bands.R-value,notch=value-before.bands.X;
  if(hall<parameterInfo.hallWidth[2]||hall>parameterInfo.hallWidth[3]||notch<parameterInfo.officeNotchWidth[2]||notch>parameterInfo.officeNotchWidth[3])throw Error('موضع الحيطة لا يترك عرضًا مناسبًا للطرقة والردّة.');
  s.params.hallWidth={value:hall,status:'derived'};s.params.officeNotchWidth={value:notch,status:s.params.officeNotchWidth.status};
 }
 if(s.geometryBasis==='clear-survey-20261012'){
  // Keep the existing bedroom/service connection while an edited depth moves
  // the shared entry/kitchen line. Its new offset is explicitly derived.
  const follows=['kitchenDepth','lobbyDepth','bathDepth','ensuiteDepth','wallThickness'];
  if(follows.includes(key)||key==='officeDepth'){const old=before.clear.bedroomServiceThickness;const delta=old-(s.params.officeDepth.value+s.params.receptionEntryOffset.value-s.params.kitchenDepth.value-s.params.lobbyDepth.value-s.params.bathDepth.value-s.params.ensuiteDepth.value-s.params.wallThickness.value);s.params.receptionEntryOffset={value:s.params.receptionEntryOffset.value+delta,status:'derived'};s.params.receptionTail={value:s.params.receptionLength.value-s.params.receptionEntryOffset.value,status:'derived'};}
  if(key==='receptionLength'||key==='receptionEntryOffset')s.params.receptionTail={value:s.params.receptionLength.value-s.params.receptionEntryOffset.value,status:'derived'};
  if(key==='receptionTail')s.params.receptionEntryOffset={value:s.params.receptionLength.value-value,status:'derived'};
 }
 if(s.params.kitchenWidth.value-s.params.courtyardWidth.value<1.6)throw Error('عرض الحمامات المتبقي أقل من 1.6 متر.');if(s.params.entryReturn.value>s.params.ensuiteDepth.value)throw Error('ركنة المكتب يجب أن تنتهي قبل حائط الحمامين.');const after=geometry(s);
 // Translate room-relative items, preserving physical furniture sizes and rotations.
 for(const collection of [s.items,s.servicePoints])for(const o of collection){const r=before.rooms.find(r=>r.usable&&pointInPoly([o.x,o.y],r.poly));if(!r)continue;const n=after.rooms.find(n=>n.id===r.id);const min=p=>[Math.min(...p.map(v=>v[0])),Math.min(...p.map(v=>v[1]))];const a=min(r.poly),b=min(n.poly);o.x+=b[0]-a[0];o.y+=b[1]-a[1];}
 return s;
}
export function applyMeasuredDimensions(s){
 const before=geometry(s);
 s.params=Object.fromEntries(Object.entries(parameterInfo).map(([k,v])=>[k,
  k==='grossArea'&&s.params[k]?.status==='measured'
   ?clone(s.params[k]):{value:v[1],status:measurementStatus[k]}]));
 s.geometryBasis='clear-survey-20261012';s.hallWidthBasis='clear';s.balconyShape='external-return';s.exteriorLayout='unmapped';s.lobbySideIsPassage=false;s.surveyReadings=clone(surveyReadings);
 for(const [id,measured]of Object.entries(measurementOpenings))s.openingOverrides[id]={...s.openingOverrides[id],...measured};
 const after=geometry(s),minimum=r=>[r.id==='office'?0:Math.min(...r.poly.map(p=>p[0])),Math.min(...r.poly.map(p=>p[1]))];
 for(const [id,measured]of Object.entries(measurementOpenings))s.openingOverrides[id]={...s.openingOverrides[id],...measured};
 for(const objects of [s.items,s.servicePoints])for(const o of objects){
  const oldRoom=before.rooms.find(r=>r.usable&&pointInPoly([o.x,o.y],r.poly));if(!oldRoom)continue;
  const room=after.rooms.find(r=>r.id===oldRoom.id),a=minimum(oldRoom),b=minimum(room);
  o.x+=b[0]-a[0];o.y+=b[1]-a[1];
  keepObjectInRoom(o,room,s.geometryBasis==='clear-survey-20261012'?0:s.params.wallThickness.value);
 }
 s.hallWidthBasis='clear';s.balconyShape='external-return';s.exteriorLayout='unmapped';s.lobbySideIsPassage=false;s.measurementRevision=measurementRevision;s.notes=measurementNotes;
 return s;
}
// On a survey update, shrinking a room must not strand existing furniture beyond
// its floor. Keep physical sizes; choose the nearest fitting position in that room.
function keepObjectInRoom(o,room,wallThickness){
 const isFurniture=Number.isFinite(o.w),pad=isFurniture?wallThickness/2+.015:.04;
 const shape=()=>isFurniture?corners(o,pad):[[o.x,o.y]];
 const fits=()=>shape().every(p=>pointInPoly(p,room.poly));if(fits())return;
 const original=[o.x,o.y],t=(o.rotation||0)*Math.PI/180;
 const halfX=isFurniture?Math.abs(Math.cos(t))*(o.w/2+pad)+Math.abs(Math.sin(t))*(o.d/2+pad):pad;
 const halfY=isFurniture?Math.abs(Math.sin(t))*(o.w/2+pad)+Math.abs(Math.cos(t))*(o.d/2+pad):pad;
 const xs=[o.x,...room.poly.flatMap(p=>[p[0]+halfX+.001,p[0]-halfX-.001])],ys=[o.y,...room.poly.flatMap(p=>[p[1]+halfY+.001,p[1]-halfY-.001])];
 let best=null,distance=Infinity;for(const x of xs)for(const y of ys){o.x=x;o.y=y;const d=(x-original[0])**2+(y-original[1])**2;if(d<distance&&fits()){best=[x,y];distance=d;}}
 [o.x,o.y]=best||original;
}
export function pointInPoly([x,y],p){let inside=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
export function corners(o,pad=0){const t=o.rotation*Math.PI/180,c=Math.cos(t),s=Math.sin(t);return [[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>[o.x+x*(o.w/2+pad)*c-y*(o.d/2+pad)*s,o.y+x*(o.w/2+pad)*s+y*(o.d/2+pad)*c]);}
export function setAlternative(s,key,type){const roles={cooking:'cooking-main',bathing:'bathing-main',heater:'heater-choice'};let item=s.items.find(x=>x.id===roles[key]);if(!item){const b=geometry(s).bands,pos={cooking:[b.R+.38,b.K+1.2],bathing:[b.B-.62,b.S+.57],heater:[b.B-.6,b.H+.55]}[key];item=makeItem(type,...pos,{id:roles[key],role:key,rotation:key==='cooking'?270:0});s.items.push(item);}const c=catalog[type];Object.assign(item,{type,name:c.name,w:c.w,d:c.d,h:c.h,z:c.z||0,color:c.color});s.alternatives[key]=type;
 if(key==='cooking'){s.items=s.items.filter(x=>x.id!=='separate-oven');if(type==='hob'){s.items.push(makeItem('oven',item.x,item.y,{id:'separate-oven',rotation:item.rotation}));}}
}
export function validateState(s){
 if(!s||s.schemaVersion!==SCHEMA||s.apartmentId!=='confirmed-draft-03')throw Error('الملف ليس تصميمًا متوافقًا مع تقسيمة هذه الشقة.');
 s=clone(s);
 // Keep legacy saved layouts intact. New fields reproduce their previous geometry,
 // rather than silently replacing a user's saved furniture or measurements.
 if(s.params?.leftWidth&&s.params?.balconyWidth){
  s.params.balconyClearWidth??={value:Math.max(.3,s.params.balconyWidth.value-s.params.wallThickness.value),status:'derived'};
  s.params.balconyDoorReturnWidth??={value:0,status:'assistant-estimate'};s.params.balconyDoorReturnDepth??={value:0,status:'assistant-estimate'};
  s.params.officeWidth??=clone(s.params.leftWidth);
  s.params.officeNotchWidth??={value:1.05,status:'assistant-estimate'};
  s.params.receptionWidth??={value:s.params.leftWidth.value-.35-s.params.balconyWidth.value,status:'assistant-estimate'};
  s.params.lobbyWidth??={value:s.params.kitchenWidth.value-s.params.courtyardWidth.value,status:'assistant-estimate'};
  s.params.officeDepth??={value:s.params.ensuiteDepth.value+s.params.bathDepth.value,status:'derived'};
  s.params.receptionLength??={value:s.params.ensuiteDepth.value+s.params.bathDepth.value+s.params.lobbyDepth.value+s.params.kitchenDepth.value+s.params.receptionTail.value-s.params.officeDepth.value,status:'derived'};
  s.params.ensuiteWidth??={value:s.params.kitchenWidth.value-s.params.courtyardWidth.value,status:'derived'};
 }
 for(const k of ['bedroomWidth','exteriorWallThickness','receptionEntryOffset','receptionUpperWidth'])s.params[k]??={value:parameterInfo[k][1],status:'assistant-estimate'};
 if(s.geometryBasis!==undefined&&s.geometryBasis!=='clear-survey-20261012')throw Error('نظام مقاسات غير معروف.');
 if(typeof s.name!=='string'||s.name.length>100||!Array.isArray(s.items)||s.items.length>400||!Array.isArray(s.servicePoints)||s.servicePoints.length>300)throw Error('بيانات التصميم غير صحيحة أو أكبر من الحد المتاح.');
 for(const [k,v]of Object.entries(parameterInfo)){const p=s.params?.[k];if(!p||!Number.isFinite(p.value)||p.value<v[2]||p.value>v[3]||!['measured','derived','user-estimate','assistant-estimate'].includes(p.status))throw Error('مقاسات أو حالات قياس غير صالحة.');}
 if(s.params.kitchenWidth.value-s.params.courtyardWidth.value<1.6||s.params.entryReturn.value>s.params.ensuiteDepth.value)throw Error('المقاسات تتعارض مع الحيطان المشتركة.');
 const checkedGeometry=geometry(s),bounds=checkedGeometry.bands;
 if(s.balconyShape==='external-return'){
  const doorWall=checkedGeometry.walls.find(w=>w.id==='office-bottom'),op=doorWall.openings.find(o=>o.id==='door-office-balcony'),start=wallPoint(doorWall,op.center-op.width/2)[0],end=wallPoint(doorWall,op.center+op.width/2)[0],t=s.geometryBasis==='clear-survey-20261012'?0:s.params.wallThickness.value/2;
  if(s.params.balconyClearWidth.value<op.width+.1||bounds.F>=bounds.Z||bounds.G<=bounds.N||bounds.G>=bounds.O-.1||start<bounds.Z+t||end>(checkedGeometry.clear?.balconyRight??bounds.A-t))throw Error('البروز والردّة لا يتركان فتحة باب المكتب كاملة داخل البلكونة.');
 }
 if(s.geometryBasis==='clear-survey-20261012'&&(checkedGeometry.clear.bedroomServiceThickness<.05-1e-8||checkedGeometry.clear.bedroomServiceThickness>.6+1e-8||Math.abs(s.params.receptionLength.value-s.params.receptionEntryOffset.value-s.params.receptionTail.value)>.001))throw Error('الأطوال لا تتفق مع محاذاة المطبخ وباب الشقة؛ راجع الأبعاد المترابطة.');
 if(bounds.P<bounds.J-.001)throw Error('ركنة المدخل تتداخل مع المطبخ؛ راجع طول حائط الريسبشن والجزء الأخير.');
 if((!checkedGeometry.clear&&bounds.O<bounds.H-.001)||bounds.O>=bounds.J-.1)throw Error('طول المكتب يتعارض مع محاذاة الحمامات والمطبخ.');
 if(bounds.X<=0||bounds.X>=bounds.C||bounds.C>=bounds.R-.5||bounds.E>=bounds.R-.1||bounds.L>bounds.C||bounds.V>=bounds.T-.3)throw Error('الأبعاد تفصل مداخل الغرف أو تجعل امتداد الريسبشن خارج حدوده.');
 if(!s.openingOverrides||typeof s.openingOverrides!=='object'||Array.isArray(s.openingOverrides)||!s.alternatives||!['cooker','hob'].includes(s.alternatives.cooking)||!['shower','tub'].includes(s.alternatives.bathing)||!['gasHeater','electricHeater'].includes(s.alternatives.heater))throw Error('بدائل أو فتحات غير صالحة.');
 const ids=new Set();for(const o of s.items){if(!catalog[o.type]||typeof o.id!=='string'||!/^[-a-zA-Z0-9_]{1,80}$/.test(o.id)||ids.has(o.id)||typeof o.name!=='string'||o.name.length>100||!/^#[0-9a-f]{6}$/i.test(o.color)||!['x','y','w','d','h','z','rotation'].every(k=>Number.isFinite(o[k]))||o.w<.1||o.d<.1||o.h<.05||o.w>8||o.d>8||o.h>4||o.z<0||o.z>3.6||Math.abs(o.rotation)>3600||Math.abs(o.x)>40||Math.abs(o.y)>40)throw Error('قطعة فرش غير صالحة.');ids.add(o.id);}
 for(const o of s.servicePoints){if(typeof o.id!=='string'||!/^[-a-zA-Z0-9_]{1,80}$/.test(o.id)||ids.has(o.id)||!['electric','water','drain'].includes(o.type)||!['x','y','z'].every(k=>Number.isFinite(o[k]))||Math.abs(o.x)>40||Math.abs(o.y)>40||o.z<0||o.z>3.6||typeof o.name!=='string'||o.name.length>100)throw Error('نقطة خدمات غير صالحة.');ids.add(o.id);}
 const openingIds=new Set(geometry({...s,openingOverrides:{}}).walls.flatMap(w=>w.openings.map(o=>o.id)));for(const [id,o]of Object.entries(s.openingOverrides)){if(!openingIds.has(id)||!o||typeof o!=='object')throw Error('فتحة غير معروفة.');for(const k of Object.keys(o))if(!['width','anchor','swing','hinge','sill','height','status'].includes(k))throw Error('خاصية فتحة غير معروفة.');if(o.width!==undefined&&(!Number.isFinite(o.width)||o.width<.3||o.width>2.5)||o.anchor!==undefined&&(!Number.isFinite(o.anchor)||o.anchor<0||o.anchor>1)||o.swing!==undefined&&![1,-1].includes(o.swing)||o.hinge!==undefined&&![0,1].includes(o.hinge)||o.height!==undefined&&(!Number.isFinite(o.height)||o.height<.3||o.height>2.4)||o.sill!==undefined&&(!Number.isFinite(o.sill)||o.sill<.3||o.sill>1.6)||o.status!==undefined&&!['measured','user-estimate','assistant-estimate'].includes(o.status))throw Error('مقاس أو اتجاه فتحة غير صالح.');}
 const g=geometry(s);for(const w of g.walls){let end=-.01;for(const o of [...w.openings].sort((a,b)=>a.center-b.center)){if(o.center-o.width/2<end-.001)throw Error('الفتحات متداخلة على نفس الحائط؛ قلّل العرض أو غيّر موضعها.');end=o.center+o.width/2;if(o.type!=='passage'&&(o.sill||0)+o.height>g.ceiling)throw Error('ارتفاع الفتحة يتجاوز السقف.');}}
 return clone(s);
}
