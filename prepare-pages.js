// Create an offline, single-file publishing artifact from the modular source.
// The editor source remains separated in src/; only the deployment is bundled.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const output=path.join(root,'github-pages');
const modules=['measurement-data.js','survey-geometry.js','model.js','collision.js','store.js','view2d.js','view3d.js','app.js'];
let script='';
for(const file of modules){
 let source=await fs.readFile(path.join(root,'src',file),'utf8');
 source=source.replace(/^import\s[^\n]*;\s*$/gm,'').replace(/^export\s+(?=(?:const|let|function|class)\b)/gm,'');
 if(file==='app.js')source='const esc=escapeHTML;\n'+source;
 script+=`\n// Source: src/${file}\n${source}\n`;
}
let html=await fs.readFile(path.join(root,'index.html'),'utf8');
const css=await fs.readFile(path.join(root,'styles.css'),'utf8');
html=html.replace('<link rel="stylesheet" href="styles.css">',()=>`<style>\n${css}\n</style>`);
html=html.replace('<script type="module" src="src/app.js"></script>',()=>`<script type="module">\n${script.replaceAll('</script','<\\/script')}\n</script>`);
if(html.includes('src="src/app.js"')||html.includes('href="styles.css"')||/^import\s/m.test(script))throw Error('Publishing artifact still contains external modules.');
await fs.mkdir(output,{recursive:true});
await fs.writeFile(path.join(output,'index.html'),html);
await fs.writeFile(path.join(output,'.nojekyll'),'');
await fs.writeFile(path.join(output,'README.md'),`# بيتنا — مصمم الشقة\n\nأداة عربية لتجربة الفرش والأجهزة على تقسيمة شقة ثابتة، بمنظر 2D و3D متزامنين.\n\n## التشغيل\n\nافتح رابط GitHub Pages. لا تحتاج إلى Node.js أو تثبيت مكتبات لاستخدام الموقع.\n\n## الوظائف\n\n- إضافة الفرش وتحريكه وتدويره وتغيير أبعاده.\n- تعديل المقاسات المترابطة دون تغيير اتصال الغرف.\n- كاميرا 3D للدوران والتقريب، وتنبيهات التداخل ومساحات فتح الأبواب والأجهزة.\n- بدائل الطهي والدش/البانيو والسخان.\n- تراجع وإعادة، حفظ تلقائي ونسخ مسمّاة، واستيراد وتصدير JSON.\n- طباعة مخطط بالمقاسات وحالتها، ونقاط كهرباء ومياه وصرف مقترحة.\n\n## الحفظ والمقاسات\n\nالحفظ محلي لكل جهاز ومتصفح؛ لتبادل التصميم استخدم تصدير واستيراد JSON. عند الانتقال من النسخة المحلية إلى الموقع، صدّر تصميمك من العنوان القديم واستورده في الموقع الجديد. لا توجد مزامنة سحابية.\n\nالمقاسات الجديدة: طرقة الأوض 120 سم صافي، المكتب 440 × 470 سم وركنته 108 × 135 سم، البلكونة 137 سم صافي وبابها من المكتب 86 سم. الريسبشن حوالي 762 سم طولًا و466 سم عرضًا في الجزء الواسع، و350 سم في الضيق. الجزء من ركنة باب الشقة للنهاية 270 سم حسب آخر صورة؛ خط باب الشقة وحائط المطبخ واحد عند 492 سم محسوبة من 762−270. الـ480 سم السابقة محفوظة كمرجع. تعارض محفوظ: أجزاء حائط الريسبشن مجموعها 794 سم؛ الـ210 سم لم تتغير في سجل المصدر، وموضع الشباك مؤقت ومميز في الواجهة. عينة حائط داخلي 31 سم وخارجي 10 سم؛ بقية الوصلات والردة مستنتجة أو تقديرية. 127 سم من باب الأطفال للركنة المقابلة محفوظة مرجعًا. المقاسات الواقعية للأثاث تشمل الهيكل؛ تعديل القياسات لا يصغّر قطعة أو فتحة لإجبارها على الملاءمة. التحديث اختياري للتصميمات المحفوظة ويقبل التراجع. جانب الغسالة ليس مسار مرور.\n\n## النشر\n\nفي Settings → Pages اختر Deploy from a branch ثم main و / (root). هذه النسخة مجمّعة في index.html من ملفات المصدر المعيارية؛ لا تستخدم ملفات QA أو الصور المرجعية للنشر.\n`);
console.log(`Prepared GitHub Pages artifact: ${output}`);
console.log(`Bundled ${modules.length} modules, ${Buffer.byteLength(html)} bytes; no external dependencies.`);
