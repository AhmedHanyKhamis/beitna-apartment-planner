import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,initialState,makeItem,geometry,validateState,clone,setAlternative,resetItemSize} from '../src/model.js';
import {View3D} from '../src/view3d.js';
import {Store} from '../src/store.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('confirmed wall segments and end-of-wall bathroom window use exact clear offsets',()=>{
 const s=initialState(),g=geometry(s),w=g.walls.find(w=>w.id==='balcony-reception'),[door,win]=w.openings;
 near(w.length,7.69);near(door.center-door.width/2,1.75);near(win.center-win.width/2-(door.center+door.width/2),2.05);near(w.length-win.center-win.width/2,1.15);
 near(g.bands.O-g.bands.Y,4.7);near(g.bands.O-g.bands.H,.4);near(g.bands.L-g.bands.A,3.6);near(g.bands.R-g.bands.L,1.2);near(g.bands.R-g.bands.A,4.8);near(g.bands.E-g.bands.A,3.5);
 const bw=g.walls.find(w=>w.id==='court-ensuite'),o=bw.openings[0];near(o.center-o.width/2,.7);near(o.width,.8);near(o.center+o.width/2,bw.length);
});
test('new items use external furniture dimensions and appliance body dimensions',()=>{
 for(const [type,size] of Object.entries({bed:[1.96,2.09,1],singleBed:[1.06,2.09,1],sofa:[2.27,.95,.83],washer:[.55,.565,.93],hob:[.59,.52,.052],oven:[.595,.567,.595]})){
  const o=makeItem(type,2,2);assert.deepEqual([o.w,o.d,o.h],size);
 }
 const s=initialState();setAlternative(s,'cooking','hob');const hob=s.items.find(o=>o.id==='cooking-main');near(hob.z+hob.h,.9);validateState(s);
});
test('legacy files lacking the small bathroom width load without changing their previous footprint',()=>{
 const s=initialState();s.params.ensuiteDepth.value=1.9;delete s.params.ensuiteWidth;
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
  const parts=boxes.slice(1);for(const [x,y,z,w,d,h] of parts){assert.ok(Math.abs(x)+w/2<=o.w/2+1e-8);assert.ok(Math.abs(y)+d/2<=o.d/2+1e-8);assert.ok(z+h<=o.h+1e-8);assert.ok(h>0);}
  near(Math.max(...parts.map(b=>b[2]+b[5])),height);
 }
});
