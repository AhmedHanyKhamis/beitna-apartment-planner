// Latest survey: مقاسات.jpg, with the user's subsequent corrections in cm.
// "derived" means calculated from confirmed lengths using the approved topology.
// Photo readings and assumptions remain estimates until individually confirmed.
export const measurementRevision='2026-10-09-corner-03';
export const measurementStatus={
 leftWidth:'measured',officeWidth:'user-estimate',officeNotchWidth:'user-estimate',hallWidth:'derived',
 kitchenWidth:'measured',courtyardWidth:'derived',bedroomDepth:'measured',
 ensuiteDepth:'derived',bathDepth:'measured',lobbyDepth:'measured',lobbyWidth:'measured',
 kitchenDepth:'measured',receptionTail:'measured',receptionWidth:'measured',
 balconyWidth:'user-estimate',entryReturn:'user-estimate',wallThickness:'assistant-estimate',
 ceilingHeight:'measured',grossArea:'user-estimate'
};
export const measurementNotes='تصحيح صورة ٩ أكتوبر: حيطة المكتب بعد الركنة انتقلت نحو الطرقة بحوالي ٠٫٩٠ م من العلامة الحمراء، دون تغيير حائط الباب أو حد الحمامات. عرض المكتب المصحح مؤقت ٤٫٥٠ م، والردّة ١٫١٥ م، والطرقة ١٫٠٥ م. عرض ٣٫٦٠ م المسجل سابقًا محفوظ كمرجع للقراءة السابقة ويحتاج توفيقًا مع موضع الحيطة الجديد. المصدر: مقاسات.pdf وتصحيحات المستخدم. الريسبشن كاملًا 5.82 م؛ 4.95 م كانت بدون فتحة الباب. الطرقة الصغيرة 2.26 × 1.37 م، وعرض أسفل الريسبشن 3.50 م، والسقف 3.10 م. المكتب يحتفظ بالركنة المستبعدة من مساحته؛ أبعاد الركنة من التسجيل السابق مؤقتة. حمام النوم وطرقة الأوض والربط مع البلكونة محسوبة؛ عرض البلكونة مؤقت 0.83 م مثل باب المكتب. قراءة 2.00 م لحمام النوم في الورقة تختلف 0.10 م عن المحاذاة المحسوبة 1.90 م؛ تحتاج مراجعة مباشرة. سماكات الحيطان وإزاحات الفتحات واتجاه فتح الأبواب غير مقاسة.';
export const measurementOpenings={
 'door-entry':{width:1.05,height:2.30,status:'measured'},
 'door-office':{width:.93,height:2.30,status:'measured'},
 'door-children':{width:.90,height:2.30,status:'measured'},
 'door-bedroom':{width:.95,height:2.30,status:'measured'},
 'door-ensuite':{width:.90,height:2.30,status:'measured'},
 'door-bath':{width:.90,height:2.30,status:'measured'},
 'door-kitchen':{width:.93,height:2.30,status:'measured'},
 'door-office-balcony':{width:.83,height:2.30,status:'measured'},
 'door-balcony':{width:1.20,height:2.30,status:'measured'},
 'window-children':{width:1.60,height:1.18,status:'measured'},
 'window-office':{width:1.54,height:1.16,status:'measured'},
 'window-reception':{width:1.54,height:1.20,status:'measured'},
 'window-bedroom':{width:.83,height:1.02,status:'measured'},
 'window-ensuite':{width:.82,height:.82,status:'measured'},
 'window-bath':{width:.82,height:.82,status:'measured'},
 'window-lobby':{width:1.02,height:.80,status:'measured'},
 'window-kitchen':{width:.95,height:1.00,status:'measured'}
};
