const pw=require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await pw.chromium.launch({headless:true,channel:'chrome',args:['--enable-unsafe-swiftshader']});const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));try{
await page.goto(process.env.REVIEW_URL||'http://127.0.0.1:4173');await page.waitForFunction(()=>window.apartmentPlanner);
assert.equal(await page.evaluate(()=>apartmentPlanner.getGraphicsInfo().error),0);
assert.equal(await page.locator('[data-add-item="bed"] small').textContent(),'196 × 209 × 100 سم');
await page.locator('[data-add-item="bed"]').click();let s=await page.evaluate(()=>apartmentPlanner.getState());const id=s.items.at(-1).id;assert.equal(s.items.at(-1).w,1.96);
await page.locator('[data-prop="w"]').fill('2.15');await page.locator('[data-prop="w"]').press('Tab');
await page.locator('[data-action="reset-size"]').click();assert.equal((await page.evaluate(()=>apartmentPlanner.getState())).items.at(-1).w,1.96);
await page.locator('#undo').click();assert.equal((await page.evaluate(()=>apartmentPlanner.getState())).items.at(-1).w,2.15);
await page.locator('#redo').click();await page.reload();assert.equal((await page.evaluate(()=>apartmentPlanner.getState())).items.at(-1).w,1.96);
await page.locator('[data-action="delete"]').count();
await page.locator('[data-tab="alternatives"]').click();await page.locator('[data-alternative="cooking"][value="hob"]').check();
s=await page.evaluate(()=>apartmentPlanner.getState());assert.equal(s.items.find(o=>o.id==='cooking-main').h,.052);
const snap=await page.evaluate(()=>apartmentPlanner.get3DSnapshot());assert.deepEqual(snap.items,s.items.map(({id,x,y,w,d,h,z,rotation})=>({id,x,y,w,d,h,z,rotation})));
await page.locator('#reset').click();assert.equal((await page.evaluate(()=>apartmentPlanner.getWarnings())).filter(w=>w.severity==='error').length,0);await page.locator('[data-tab="catalog"]').click();await page.screenshot({path:'apartment-planner/tests/realistic-sizes-preview.png'});
assert.deepEqual(errors,[]);fs.writeFileSync('apartment-planner/tests/realistic-browser-report.json',JSON.stringify({passed:true,checks:['library sizes in centimetres','add actual frame size','reset one size','undo and redo','save and reload','thin hob alternative','2D/3D dimensions synchronized','no browser errors']},null,2));console.log('Browser checks passed');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
