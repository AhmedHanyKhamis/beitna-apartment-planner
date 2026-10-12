import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,initialState,makeItem,geometry,validateState,clone,setAlternative,resetItemSize,wallPoint,applyMeasuredDimensions,pointInPoly,corners} from '../src/model.js';
import {View3D} from '../src/view3d.js';
import {Store} from '../src/store.js';
import fs from 'node:fs';
const legacyState=()=>JSON.parse(fs.readFileSync(new URL('./fixtures/before-user-survey.json',import.meta.url),'utf8'));
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('removed exterior block has no floor in the plan or 3D, including after a saved-layout update',()=>{
 const s=legacyState();delete s.exteriorLayout;assert.ok(geometry(s).rooms.some(r=>r.id==='stairs'));
 applyMeasuredDimensions(s);validateState(s);const g=geometry(s);
 assert.ok(!g.rooms.some(r=>r.id==='stairs'));assert.equal(g.bands.P,g.bands.J);
 const markedPoints=[[(g.bands.R+g.bands.T)/2,g.bands.P+.15],[(g.bands.E+g.bands.T)/2,(g.bands.P+g.bands.D)/2]];
 for(const p of markedPoints)assert.ok(!g.rooms.some(r=>pointInPoly(p,r.poly)));
 const floors=[];const view={gl:{},canvas:{dataset:{}},floor(poly){floors.push(poly)},box(x,y,z,w,d,h,color,rotation=0){if(z<0)floors.push(corners({x,y,w,d,rotation}))},draw(){}};
 View3D.prototype.render.call(view,{...s,items:[]},{...g,walls:[]},null,[]);
 for(const p of markedPoints)assert.ok(!floors.some(poly=>pointInPoly(p,poly)),'The renderer must not fill the removed area with a rectangular base.');
});
test('external balcony and door return contain the full 86 cm opening without moving reception',()=>{
 const s=initialState(),g=geometry(s),left=g.walls.find(w=>w.id==='left-balcony'),right=g.walls.find(w=>w.id==='balcony-reception');
 near(right.a[0]-right.thickness/2-(left.a[0]+left.thickness/2),1.37);assert.ok(left.a[0]<0);
 const bottom=g.walls.find(w=>w.id==='office-bottom'),door=bottom.openings.find(o=>o.id==='door-office-balcony');near(door.width,.86);
 const start=wallPoint(bottom,door.center-door.width/2)[0],end=wallPoint(bottom,door.center+door.width/2)[0];
 assert.ok(start>=g.bands.Z);assert.ok(end<=g.clear.balconyRight);
 const before=clone(g.rooms.find(r=>r.id==='reception').poly);s.params.balconyClearWidth.value=1.4;s.params.balconyDoorReturnWidth.value=.4;validateState(s);
 assert.deepEqual(geometry(s).rooms.find(r=>r.id==='reception').poly,before);
 s.params.balconyClearWidth.value=.8;assert.throws(()=>validateState(s));
});
test('applying the external return keeps office furniture at its existing position',()=>{
 const s=initialState();delete s.balconyShape;const desks=s.items.filter(o=>o.type==='desk').map(o=>[o.id,o.x,o.y]);
 applyMeasuredDimensions(s);validateState(s);assert.deepEqual(s.items.filter(o=>o.type==='desk').map(o=>[o.id,o.x,o.y]),desks);
});
test('hall remains 120 cm between actual wall faces across wall thickness choices',()=>{
 for(const thickness of [.1,.15,.3]){
  const s=initialState();s.params.wallThickness.value=thickness;s.params.balconyClearWidth.value=1.6;
  const g=geometry(s),left=g.walls.find(w=>w.id==='office-hall'),right=g.walls.find(w=>w.id==='service-hall');
  near(right.a[0]-right.thickness/2-(left.a[0]+left.thickness/2),1.2);validateState(s);
 }
});
test('entry tail is 270 cm independently of the 794 cm confirmed balcony wall and kitchen depth',()=>{
 const s=initialState();for(const depth of [3,3.25,3.6]){
  s.params.kitchenDepth.value=depth;const g=geometry(s),tail=g.walls.find(w=>w.id==='reception-lower-right');
  near(g.clear.recEnd-g.clear.entryLine,2.7);near(g.walls.find(w=>w.id==='balcony-reception').length,7.94);near(g.bands.P,g.bands.J);
 }
});
test('confirmed wall segments and end-of-wall bathroom window use exact clear offsets',()=>{
 const s=initialState(),g=geometry(s),w=g.walls.find(w=>w.id==='balcony-reception'),[door,win]=w.openings;
 near(w.length,7.94);near(door.center-door.width/2,1.95);near(w.length-win.center-win.width/2,1.12);
 near(g.clear.officeBottom-g.clear.officeTop,4.7);near(g.clear.hallRight-g.clear.recLeft,4.66);near(g.clear.hallRight-g.clear.hallLeft,1.2);near(g.clear.recLowerRight-g.clear.recLeft,3.5);
 assert.equal(win.positionStatus,undefined);near(s.surveyReadings.numbered[6],210);assert.deepEqual(g.measurementConflicts,[]);
 const bw=g.walls.find(w=>w.id==='court-ensuite'),o=bw.openings[0];near(o.center-o.width/2,.7);near(o.width,.8);near(o.center+o.width/2,bw.length);
});
test('new items use external furniture dimensions and appliance body dimensions',()=>{
 for(const [type,size] of Object.entries({bed:[1.96,2.09,1],singleBed:[1.06,2.09,1],sofa:[2.27,.95,.83],washer:[.55,.565,.93],hob:[.59,.52,.052],oven:[.595,.567,.595]})){
  const o=makeItem(type,2,2);assert.deepEqual([o.w,o.d,o.h],size);
 }
 const s=initialState();setAlternative(s,'cooking','hob');const hob=s.items.find(o=>o.id==='cooking-main');near(hob.z+hob.h,.9);validateState(s);
});
test('legacy files lacking the small bathroom width load without changing their previous footprint',()=>{
 const s=legacyState();s.params.ensuiteDepth.value=1.9;delete s.params.ensuiteWidth;
 const oldPoly=geometry(s).rooms.find(r=>r.id==='ensuite').poly,parsed=validateState(s);
 near(parsed.params.ensuiteWidth.value,2.12);geometry(parsed).rooms.find(r=>r.id==='ensuite').poly.forEach((p,i)=>p.forEach((v,j)=>near(v,oldPoly[i][j])));
});
test('restoring one default size preserves layout and other pieces and can be undone',()=>{
 const values=new Map(),store=new Store({getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)});
 store.commit(s=>Object.assign(s.items[0],{w:1.2,d:2.3,h:1.15,x:2,rotation:90}));const before=clone(store.state);
 store.commit(s=>resetItemSize(s.items[0]));const o=store.state.items[0];near(o.w,catalog.singleBed.w);near(o.x,2);near(o.rotation,90);assert.deepEqual(store.state.items.slice(1),before.items.slice(1));
 store.undo();assert.deepEqual(store.state,before);store.redo();near(store.state.items[0].w,1.06);
});
test('3D bed headboard stays inside the metric footprint and reaches the declared height',()=>{
 for(const type of ['bed','singleBed'])for(const height of [.5,1,1.3]){
  const o=makeItem(type,0,0,{h:height}),boxes=[];
  const view={gl:{},canvas:{dataset:{}},box(...args){boxes.push(args)},draw(){},opaque:[],transparent:[]};
  View3D.prototype.render.call(view,{items:[o],servicePoints:[]},{width:10,depth:10,ceiling:3.1,rooms:[],walls:[]},null,[]);
  const parts=boxes;for(const [x,y,z,w,d,h] of parts){assert.ok(Math.abs(x)+w/2<=o.w/2+1e-8);assert.ok(Math.abs(y)+d/2<=o.d/2+1e-8);assert.ok(z+h<=o.h+1e-8);assert.ok(h>0);}
  near(Math.max(...parts.map(b=>b[2]+b[5])),height);
 }
});
