import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {initialState,geometry,validateState,applyMeasuredDimensions,editDimension,clone,wallPoint} from '../src/model.js';
import {Store} from '../src/store.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const legacy=()=>JSON.parse(fs.readFileSync(new URL('./fixtures/before-user-survey.json',import.meta.url),'utf8'));

test('numbered survey dimensions are clear faces, with no invented block below the kitchen',()=>{
 const s=initialState(),g=geometry(s),c=g.clear;
 near(c.recEnd-c.recStart,7.62);near(c.entryLine-c.recStart,4.92);near(c.recEnd-c.entryLine,2.7);
 near(c.hallRight-c.recLeft,4.66);near(c.officeRight,4.4);
 near(c.officeBottom-c.officeTop,4.7);near(s.params.officeNotchWidth.value,1.08);near(s.params.entryReturn.value,1.35);
 near(c.balconyRight-c.balconyLeft,1.37);near(s.params.wallThickness.value,.31);near(s.params.exteriorWallThickness.value,.1);
 const kitchen=g.walls.find(w=>w.id==='kitchen-bottom'),entry=g.walls.find(w=>w.id==='reception-entry');
 near(kitchen.a[1],entry.a[1]);assert.ok(!g.walls.some(w=>w.id==='reception-stairs-side'));assert.ok(!g.rooms.some(r=>r.id==='stairs'));
 validateState(s);
});

test('the 210 cm reading stays intact while only the reception window location is provisional',()=>{
 const s=initialState(),g=geometry(s),w=g.walls.find(w=>w.id==='balcony-reception'),[door,win]=w.openings;
 near(door.width,1.22);near(win.width,1.55);near(door.center-door.width/2,1.95);near(w.length-win.center-win.width/2,1.12);
 assert.equal(door.positionStatus,undefined);assert.equal(win.positionStatus,'conflict');
 const raw=s.surveyReadings.numbered;assert.equal(raw[6],210);assert.equal(raw[1],600);assert.equal(s.surveyReadings.latest.approximateTotal,762);assert.equal(s.surveyReadings.latest.tail,270);assert.equal(s.params.receptionLength.status,'user-estimate');assert.equal(s.params.receptionTail.status,'measured');assert.equal(s.params.receptionEntryOffset.status,'derived');
 assert.equal([4,5,6,7,8].reduce((sum,k)=>sum+raw[k],0),794);
 const conflict=g.measurementConflicts[0];near(conflict.reportedMiddleGap,2.1);near(conflict.displayedMiddleGap,1.78);
 assert.deepEqual(conflict.affectedOpenings,['window-reception']);assert.equal(s.surveyReadings.childrenDoorToOppositeCorner,127);
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
 near(s.params.receptionEntryOffset.value,5.17);assert.equal(s.params.receptionEntryOffset.status,'derived');near(s.params.receptionTail.value,2.45);
 near(s.surveyReadings.numbered[2],480);
});

test('incompatible widths cannot silently shrink a measured opening',()=>{
 const values=new Map(),store=new Store({getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)}),before=clone(store.state);
 assert.throws(()=>store.commit(s=>editDimension(s,'officeWidth',4.6)),/فتحة أكبر/);assert.deepEqual(store.state,before);
 assert.throws(()=>store.commit(s=>s.openingOverrides['door-office-balcony'].width=1.5));assert.deepEqual(store.state,before);
 const g=geometry(store.state),wall=g.walls.find(w=>w.id==='office-bottom'),door=wall.openings[0];
 near(door.width,.86);assert.ok(wallPoint(wall,door.center-door.width/2)[0]>=g.bands.Z);assert.ok(wallPoint(wall,door.center+door.width/2)[0]<=g.clear.balconyRight);
});
