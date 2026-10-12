// Regression values transcribed from the clarified PDF and recorded corrections.
import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,geometry,applyMeasuredDimensions,validateState,clone,corners,pointInPoly,editDimension} from '../src/model.js';
import {measurementRevision} from '../src/measurement-data.js';
import {Store} from '../src/store.js';
import fs from 'node:fs';
const legacyState=()=>JSON.parse(fs.readFileSync(new URL('./fixtures/before-user-survey.json',import.meta.url),'utf8'));
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`);
const sizes=r=>{const xs=r.poly.map(p=>p[0]),ys=r.poly.map(p=>p[1]);return [Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)];};
test('red-line correction moves only the lower office wall and conserves the floor area',()=>{
 const s=legacyState();Object.assign(s.params,{officeDepth:{value:4.3,status:'derived'},officeWidth:{value:3.6,status:'measured'},hallWidth:{value:1.95,status:'derived'},officeNotchWidth:{value:.25,status:'user-estimate'}});const before=geometry(s);
 editDimension(s,'officeWidth',4.5,'user-estimate');validateState(s);const after=geometry(s);
 for(const id of ['children','bedroom','ensuite','bath','lobby','courtyard','kitchen','reception','balcony'])assert.deepEqual(after.rooms.find(r=>r.id===id).poly,before.rooms.find(r=>r.id===id).poly);
 const previous=before.walls.find(w=>w.id==='office-return'),current=after.walls.find(w=>w.id==='office-return');assert.deepEqual(current,previous);near(after.bands.L-before.bands.L,.9);near(after.bands.X,before.bands.X);near(after.bands.R,before.bands.R);near(after.usableArea,before.usableArea);near(after.rooms.find(r=>r.id==='office').area-before.rooms.find(r=>r.id==='office').area,.9*2.87);near(after.rooms.find(r=>r.id==='hall').area,1.05*2.87+2.2*1.43+.075*4.3+.075*2.87);
});
test('room polygons use the latest survey, including reception segments and lobby',()=>{
 const s=initialState(),g=geometry(s),room=id=>g.rooms.find(r=>r.id===id);validateState(s);
 for(const [id,expected]of Object.entries({children:[4.6,3.6],bedroom:[4.2,3.6],office:[4.7,4.7],ensuite:[2.1,1.5],bath:[2.12,2.8],lobby:[2.26,1.37],kitchen:[3.25,3.25]}))sizes(room(id)).forEach((v,i)=>near(v,expected[i]));
 const reception=room('reception');near(g.clear.recEnd-g.clear.recStart,7.94);near(reception.poly.at(-2)[0]-reception.poly.at(-1)[0],3.5);near(reception.poly.at(-2)[1]-reception.poly.at(-3)[1],2.7);near(g.ceiling,3.1);near(g.usableArea,125.6181);
 near(room('office').area,4.4*4.7-1.08*1.35+.3*.3);near(room('lobby').area,2.26*1.37);
 near(Math.min(...room('kitchen').poly.map(p=>p[1]))-Math.max(...room('courtyard').poly.map(p=>p[1])),.31);
 assert.equal(s.measurementRevision,measurementRevision);
});
test('all nine doors and eight windows retain the measured widths and heights without clamping',()=>{
 const openings=geometry(initialState()).walls.flatMap(w=>w.openings),expected={
  'door-entry':[1.05,2.3],'door-office':[.93,2.3],'door-children':[.90,2.3],'door-bedroom':[.95,2.3],'door-ensuite':[.90,2.3],'door-bath':[.90,2.3],'door-kitchen':[.93,2.3],'door-office-balcony':[.86,2.3],'door-balcony':[1.22,2.3],
  'window-children':[1.60,1.18],'window-office':[1.54,1.16],'window-reception':[1.55,1.20],'window-bedroom':[.83,1.02],'window-ensuite':[.8,.82],'window-bath':[.82,.82],'window-lobby':[1.02,.80],'window-kitchen':[.95,1.00]
 };assert.equal(openings.filter(o=>o.type!=='passage').length,17);
 for(const [id,[w,h]]of Object.entries(expected)){const o=openings.find(o=>o.id===id);assert.ok(o,id);near(o.width,w);near(o.height,h);assert.equal(o.status,'measured');}
});
test('a previous measured revision updates every corrected length and ceiling while retaining furniture',()=>{
 const s=legacyState();s.measurementRevision='2026-10-08-measured-01';s.params.lobbyDepth={value:.8,status:'measured'};s.params.lobbyWidth={value:2.12,status:'derived'};s.params.receptionTail={value:4.2,status:'user-estimate'};s.params.receptionWidth={value:2.5,status:'user-estimate'};s.params.balconyWidth={value:.75,status:'user-estimate'};s.params.ceilingHeight={value:2.9,status:'measured'};
 s.openingOverrides['door-bedroom']={width:.85,height:2.1,anchor:.12,swing:1,hinge:1};const items=clone(s.items);
 applyMeasuredDimensions(s);validateState(s);const g=geometry(s);near(g.clear.recEnd-g.clear.recStart,7.94);near(s.params.lobbyWidth.value,2.26);near(s.params.lobbyDepth.value,1.37);near(g.ceiling,3.1);
 assert.deepEqual(s.items.map(o=>[o.id,o.type,o.w,o.d,o.h,o.rotation]),items.map(o=>[o.id,o.type,o.w,o.d,o.h,o.rotation]));near(s.openingOverrides['door-bedroom'].width,.95);near(s.openingOverrides['door-bedroom'].anchor,.12);assert.equal(s.openingOverrides['door-bedroom'].hinge,1);
});
test('measurement update persists, preserves named old designs, and undo restores their previous geometry',()=>{
 const values=new Map(),storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},store=new Store(storage);
 store.state=validateState(legacyState());store.state.measurementRevision='2026-10-08-measured-01';store.state.params.lobbyDepth.value=.8;store.state.params.receptionTail.value=4.2;store.saveScenario('قبل تحديث المقاسات');const before=clone(store.state),scenarios=clone(store.scenarios);
 store.commit(s=>applyMeasuredDimensions(s));const updated=clone(store.state);assert.deepEqual(new Store(storage).state,updated);assert.deepEqual(store.scenarios,scenarios);store.undo();assert.deepEqual(store.state,before);store.redo();assert.deepEqual(store.state,updated);assert.deepEqual(store.scenarios,scenarios);
});
test('shrinking the old reception keeps its furniture inside the new floor without resizing',()=>{
 const s=legacyState();s.measurementRevision='2026-10-08-measured-01';s.params.lobbyDepth.value=.8;s.params.receptionTail.value=4.2;s.params.receptionWidth.value=2.5;s.params.balconyWidth.value=.75;
 s.params.receptionLength.value=10;const sofa=s.items.find(o=>o.id==='guest-sofa');Object.assign(sofa,{x:1.8,y:17.7,rotation:0,w:2.1,d:.85});const sizes=[sofa.w,sofa.d,sofa.h];applyMeasuredDimensions(s);validateState(s);const room=geometry(s).rooms.find(r=>r.id==='reception');assert.ok(corners(sofa).every(p=>pointInPoly(p,room.poly)));assert.deepEqual([sofa.w,sofa.d,sofa.h],sizes);assert.ok(sofa.x>1.8);assert.ok(sofa.y<geometry(s).clear.recEnd-sofa.d/2);
});
