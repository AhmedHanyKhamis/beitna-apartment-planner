const {chromium}=require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome',args:['--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.apartmentPlanner);
  await page.locator('[data-tab="dimensions"]').click();
  await page.locator('#dim-leftWidth').fill('4.7');await page.locator('#dim-leftWidth').press('Tab');
  await page.locator('#scenarios').click();await page.locator('#scenario-name').fill('قبل تطبيق المقاسات');await page.locator('#save-scenario').click();await page.locator('#scenario-dialog .dialog-close').click();
  const before=await page.evaluate(()=>apartmentPlanner.getState());
  await page.locator('#apply-measurements').click();
  const after=await page.evaluate(()=>apartmentPlanner.getState());
  assert.equal(before.params.leftWidth.value,4.7);assert.notEqual(before.params.leftWidth.value,after.params.leftWidth.value);
  assert.equal(after.params.leftWidth.value,4.6);assert.equal(after.params.officeWidth.value,3.6);assert.equal(after.params.kitchenWidth.value,3.25);assert.equal(after.params.ensuiteDepth.status,'derived');
  assert.equal(after.params.lobbyWidth.value,2.26);assert.equal(after.params.lobbyDepth.value,1.37);assert.equal(after.params.receptionTail.value,1.2);assert.equal(after.params.receptionWidth.value,3.5);assert.equal(after.params.ceilingHeight.value,3.1);
  assert.equal(after.openingOverrides['door-entry'].width,1.05);assert.equal(after.openingOverrides['door-balcony'].width,1.2);assert.equal(after.openingOverrides['window-children'].width,1.6);
  const updatedGeometry=await page.evaluate(()=>apartmentPlanner.getGeometry());assert.ok(Math.abs(updatedGeometry.bands.D-updatedGeometry.bands.H-5.82)<1e-8);assert.ok(Math.abs(updatedGeometry.rooms.find(r=>r.id==='lobby').area-2.26*1.37)<1e-8);
  assert.deepEqual(after.items.map(o=>[o.id,o.w,o.d,o.rotation]),before.items.map(o=>[o.id,o.w,o.d,o.rotation]));
  await page.locator('#undo').click();assert.deepEqual(await page.evaluate(()=>apartmentPlanner.getState()),before);
  await page.locator('#redo').click();assert.deepEqual(await page.evaluate(()=>apartmentPlanner.getState()),after);
  await page.reload();await page.waitForFunction(()=>window.apartmentPlanner);assert.deepEqual(await page.evaluate(()=>apartmentPlanner.getState()),after);
  await page.locator('#scenarios').click();assert.equal(await page.locator('.scenario-row').count(),1);await page.locator('#scenario-dialog .dialog-close').click();
  await page.goto(require('node:url').pathToFileURL(path.join(__dirname,'..','github-pages','index.html')).href);await page.waitForFunction(()=>window.apartmentPlanner);
  const standalone=await page.evaluate(()=>({s:apartmentPlanner.getState(),g:apartmentPlanner.getGeometry(),gl:apartmentPlanner.getGraphicsInfo()}));
  assert.equal(standalone.s.params.officeWidth.value,3.6);assert.equal(standalone.s.params.kitchenDepth.value,3.25);assert.ok(Math.abs(standalone.g.rooms.find(r=>r.id==='office').area-16.5625)<1e-8);assert.equal(standalone.gl.available,true);assert.equal(standalone.gl.error,0);
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(__dirname,'measurement-update-report.json'),JSON.stringify({passed:true,checks:['Measured-dimension button updates geometry','Furniture dimensions and IDs preserved','Undo and redo restore exact state','Save/reload retains new dimensions','Named scenario remains available','Standalone offline bundle has measured defaults and valid 3D','No page errors']},null,2));
  console.log('PASS: reversible measured-dimension application, furniture preservation, persistence and scenarios.');
 }finally{await browser.close();}
})();
