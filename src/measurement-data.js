// Latest survey: مقاسات.jpg, with the user's subsequent corrections in cm.
// "derived" means calculated from confirmed lengths using the approved topology.
// Photo readings and assumptions remain estimates until individually confirmed.
export const measurementRevision='2026-10-12-outline-08';
export const measurementStatus={
 leftWidth:'measured',officeDepth:'measured',officeWidth:'derived',officeNotchWidth:'user-estimate',hallWidth:'measured',
 kitchenWidth:'measured',courtyardWidth:'derived',bedroomDepth:'measured',
 ensuiteWidth:'measured',ensuiteDepth:'measured',bathDepth:'measured',lobbyDepth:'measured',lobbyWidth:'measured',
 kitchenDepth:'measured',receptionLength:'measured',receptionTail:'measured',receptionWidth:'measured',
 balconyWidth:'derived',balconyClearWidth:'user-estimate',balconyDoorReturnWidth:'user-estimate',balconyDoorReturnDepth:'user-estimate',entryReturn:'user-estimate',wallThickness:'assistant-estimate',
 ceilingHeight:'measured',grossArea:'user-estimate'
};
export const measurementNotes='تصحيح 12 أكتوبر: طرقة الأوض عرضها 1.20 م صافي بين وجهي الحائطين، وسماكة الحيطان لا تُخصم منه. الحمام الصغير 2.10 م عرض × 1.50 م طول، شباكه 0.80 م بعد 0.70 م من حائط النوم حتى نهاية الحائط. حائط الريسبشن: 1.75 م حائط + 1.20 م باب بلكونة + 2.05 م حائط + 1.54 م شباك + 1.15 م حائط = 7.69 م. عرض الجزء الضيق من الريسبشن 3.50 م، ويتسع أمام باب الشقة حتى حائط المطبخ؛ 3.60 م حتى بداية الطرقة + 1.20 م طرقة = 4.80 م للجزء الواسع. عرض المكتب بعد الركنة محسوب 4.35 م للحفاظ على حد الخدمات السابق؛ موضع حائط البلكونة مع الريسبشن 0.75 م من المحاذاة؛ البلكونة بارزة للخارج وفيه ردة عند باب المكتب حسب المستخدم. عرضها الصافي 1.10 م، والردة 0.30 × 0.30 م كمقاسات مبدئية قابلة للتعديل وليست قياسًا مباشرًا؛ طول المكتب 4.70 م مؤكد، ونهايته بعد نهاية الحمام الكبير 0.40 م. الجزء من ركنة باب الشقة للنهاية 1.20 م مستقل عن طول حائط البلكونة 7.69 م. جانب الغسالة ليس مسار مرور حسب المستخدم. عمق ركنة المكتب وأبعاد البروز والردة يحتاجان قياسًا مباشرًا. المساحة الخارجية المضافة تحت المطبخ حُذفت حسب تصحيح المستخدم؛ خارج حدود الشقة غير مرسوم لعدم وجود قياسات معتمدة له. سماكات الحيطان واتجاه الفتح وجلسات الشبابيك تقديرية.';
export const measurementOpenings={
 'door-entry':{width:1.05,height:2.30,status:'measured'},
 'door-office':{width:.93,height:2.30,status:'measured'},
 'door-children':{width:.90,height:2.30,status:'measured'},
 'door-bedroom':{width:.95,height:2.30,status:'measured'},
 'door-ensuite':{width:.90,height:2.30,status:'measured'},
 'door-bath':{width:.90,height:2.30,status:'measured'},
 'door-kitchen':{width:.93,height:2.30,status:'measured'},
 'door-office-balcony':{width:.83,height:2.30,status:'measured'},
 'door-balcony':{anchor:2.35/7.69,width:1.20,height:2.30,status:'measured'},
 'window-children':{width:1.60,height:1.18,status:'measured'},
 'window-office':{width:1.54,height:1.16,status:'measured'},
 'window-reception':{anchor:5.77/7.69,width:1.54,height:1.20,status:'measured'},
 'window-bedroom':{width:.83,height:1.02,status:'measured'},
 'window-ensuite':{anchor:1.1/1.5,width:.80,height:.82,status:'measured'},
 'window-bath':{width:.82,height:.82,status:'measured'},
 'window-lobby':{width:1.02,height:.80,status:'measured'},
 'window-kitchen':{width:.95,height:1.00,status:'measured'}
};
