import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {initialState,geometry,validateState,applyMeasuredDimensions,editDimension,clone,wallPoint} from '../src/model.js';
import {Store} from '../src/store.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const legacy=()=>JSON.parse(fs.readFileSync(new URL('./fixtures/before-user-survey.json',import.meta.url),'utf8'));

test('numbered survey dimensions are clear faces, with no invented block below the kitchen',()=>{
 const s=initialState(),g=geometry(s),c=g.clear;
 near(c.recEnd-c.recStart,7.94);near(c.entryLine-c.recStart,5.24);near(c.recEnd-c.entryLine,2.7);
 near(c.hallRight-c.recLeft,4.66);near(c.officeRight,4.4);
 near(c.officeBottom-c.officeTop,4.7);near(s.params.officeNotchWidth.value,1.08);near(s.params.entryReturn.value,1.35);
 near(c.balconyRight-c.balconyLeft,1.37);near(s.params.wallThickness.value,.31);near(s.params.exteriorWallThickness.value,.1);
 const kitchen=g.walls.find(w=>w.id==='kitchen-bottom'),entry=g.walls.find(w=>w.id==='reception-entry');
 near(kitchen.a[1],entry.a[1]);assert.ok(!g.walls.some(w=>w.id==='reception-stairs-side'));assert.ok(!g.rooms.some(r=>r.id==='stairs'));
 validateState(s);
});

test('all five confirmed reception segments now fit the adopted 794 cm wall',()=>{
 const s=initialState(),g=geometry(s),w=g.walls.find(w=>w.id==='balcony-reception'),[door,win]=w.openings;
 near(door.width,1.22);near(win.width,1.55);near(door.center-door.width/2,1.95);near(w.length-win.center-win.width/2,1.12);
 assert.equal(door.positionStatus,undefined);assert.equal(win.positionStatus,undefined);
 const raw=s.surveyReadings.numbered;assert.equal(raw[6],210);assert.equal(raw[1],600);assert.equal(s.surveyReadings.latest.approximateTotal,762);assert.equal(s.surveyReadings.latest.tail,270);assert.equal(s.params.receptionLength.status,'derived');assert.equal(s.surveyReadings.latest.adoptedTotal,794);assert.equal(s.params.receptionTail.status,'measured');assert.equal(s.params.receptionEntryOffset.status,'derived');
 assert.equal([4,5,6,7,8].reduce((sum,k)=>sum+raw[k],0),794);
 near(win.center-win.width/2-door.center-door.width/2,2.1);assert.deepEqual(g.measurementConflicts,[]);assert.equal(s.surveyReadings.childrenDoorToOppositeCorner,127);
});

test('saved geometry stays unchanged until the user applies the new survey, with undo for every change',()=>{
 const s=legacy(),before=geometry(s);assert.deepEqual(geometry(validateState(s)),before);
 const values=new Map([['our-apartment-v1',JSON.stringify({state:s,scenarios:[]})]]),storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
 const store=new Store(storage),old=clone(store.state);store.saveScenario('المقاسات السابقة');const saved=clone(store.scenarios);
 store.commit(s=>applyMeasuredDimensions(s));const updated=clone(store.state);
 assert.equal(updated.geometryBasis,'clear-survey-20261012');assert.deepEqual(store.scenarios,saved);
 assert.deepEqual(updated.items.map(o=>[o.id,o.type,o.w,o.d,o.h,o.rotation]),old.items.map(o=>[o.id,o.type,o.w,o.d,o.h,o.rotation]));
 near(updated.params.wallThickness.value,.31);near(updated.openingOverrides['door-office-balcony'].width,.86);
 assert.deepEqual(new Store(storage).state,updated);store.undo();assert.deepEqual(store.state,old);store.redo();assert.deepEqual(store.state,updated);
});

test('changing a connected depth retains the shared kitchen/entry line and marks the resulting offset derived',()=>{
 const s=initialState(),before=geometry(s);editDimension(s,'kitchenDepth',3.5);validateState(s);const g=geometry(s);
 near(g.clear.bedroomServiceThickness,before.clear.bedroomServiceThickness);
 near(g.walls.find(w=>w.id==='kitchen-bottom').a[1],g.walls.find(w=>w.id==='reception-entry').a[1]);
 near(s.params.receptionEntryOffset.value,5.49);assert.equal(s.params.receptionEntryOffset.status,'derived');near(s.params.receptionTail.value,2.45);
 near(s.surveyReadings.numbered[2],480);
});

test('incompatible widths cannot silently shrink a measured opening',()=>{
 const values=new Map(),store=new Store({getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)}),before=clone(store.state);
 assert.throws(()=>store.commit(s=>editDimension(s,'officeWidth',4.6)),/فتحة أكبر/);assert.deepEqual(store.state,before);
 assert.throws(()=>store.commit(s=>s.openingOverrides['door-office-balcony'].width=1.5));assert.deepEqual(store.state,before);
 const g=geometry(store.state),wall=g.walls.find(w=>w.id==='office-bottom'),door=wall.openings[0];
 near(door.width,.86);assert.ok(wallPoint(wall,door.center-door.width/2)[0]>=g.bands.Z);assert.ok(wallPoint(wall,door.center+door.width/2)[0]<=g.clear.balconyRight);
});

test('main bathroom door faces the kitchen across the lobby, including after kitchen edits',()=>{
 const s=initialState();
 for(const width of [3.25,3.4]){
  editDimension(s,'kitchenWidth',width);validateState(s);const g=geometry(s);
  const bath=g.walls.find(w=>w.id==='bath-bottom'),kitchen=g.walls.find(w=>w.id==='kitchen-top');
  const a=bath.openings.find(o=>o.id==='door-bath'),b=kitchen.openings.find(o=>o.id==='door-kitchen');
  near(wallPoint(bath,a.center)[0],wallPoint(kitchen,b.center)[0]);near(a.width,.9);
  assert.ok(bath.a[1]<kitchen.a[1]);assert.ok(!g.walls.find(w=>w.id==='service-hall').openings.some(o=>o.id==='door-bath'));
 }
});

test('cached misplaced-door survey layouts correct once and preserve every furniture size',()=>{
 const old=JSON.parse(fs.readFileSync(new URL('./fixtures/before-bath-door-fix.json',import.meta.url),'utf8'));
 old.openingOverrides['door-bath'].anchor=.85;
 const fixed=validateState(old),g=geometry(fixed);
 near(fixed.params.receptionLength.value,7.94);near(fixed.params.receptionEntryOffset.value,5.24);
 assert.equal(fixed.openingOverrides['door-bath'].anchor,undefined);
 assert.equal(g.walls.find(w=>w.openings.some(o=>o.id==='door-bath')).id,'bath-bottom');
 assert.deepEqual(fixed.items.map(o=>[o.id,o.type,o.w,o.d,o.h,o.rotation]),old.items.map(o=>[o.id,o.type,o.w,o.d,o.h,o.rotation]));
 assert.deepEqual(validateState(fixed),fixed,'Reload must not shift furniture a second time');
 const storage={getItem:()=>JSON.stringify({state:old,scenarios:[{id:'old',name:'توزيع محفوظ',state:old}]}),setItem(){}};
 const store=new Store(storage);near(store.state.params.receptionLength.value,7.94);near(store.scenarios[0].state.params.receptionLength.value,7.94);
});
