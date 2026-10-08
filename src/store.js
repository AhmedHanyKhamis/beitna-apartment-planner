import {clone,initialState,validateState} from './model.js';
const KEY='our-apartment-v1';
export class Store{
 constructor(storage=globalThis.localStorage){this.storage=storage;this.undoStack=[];this.redoStack=[];this.listeners=[];this.scenarios=[];this.error=null;try{const saved=JSON.parse(storage.getItem(KEY)||'null');if(saved){this.state=validateState(saved.state);this.scenarios=(saved.scenarios||[]).map(x=>({id:x.id,name:x.name,state:validateState(x.state)}));}}catch(e){this.error='تعذر قراءة الحفظ السابق؛ احتُفظ بالملف الأصلي في المتصفح حتى تحفظ نسخة جديدة.';}this.state||=initialState();}
 subscribe(fn){this.listeners.push(fn);}
 emit(commit=true){for(const fn of this.listeners)fn(this.state,commit);}
 commit(fn){const before=clone(this.state);try{fn(this.state);validateState(this.state);}catch(e){this.state=before;throw e;}this.undoStack.push(before);if(this.undoStack.length>80)this.undoStack.shift();this.redoStack=[];this.emit();this.save();}
 begin(){this.before=clone(this.state);}
 preview(fn){fn(this.state);this.emit(false);}
 finish(){if(this.before&&JSON.stringify(this.before)!==JSON.stringify(this.state)){try{validateState(this.state);}catch(e){this.state=this.before;this.before=null;this.emit();throw e;}this.undoStack.push(this.before);if(this.undoStack.length>80)this.undoStack.shift();this.redoStack=[];this.before=null;this.emit();this.save();}else this.before=null;}
 undo(){if(!this.undoStack.length)return;this.redoStack.push(clone(this.state));this.state=this.undoStack.pop();this.emit();this.save();}
 redo(){if(!this.redoStack.length)return;this.undoStack.push(clone(this.state));this.state=this.redoStack.pop();this.emit();this.save();}
 reset(){this.commit(()=>{this.state=initialState();});}
 save(){try{this.storage.setItem(KEY,JSON.stringify({state:this.state,scenarios:this.scenarios}));this.error=null;return true;}catch{this.error='الحفظ المحلي غير متاح أو ممتلئ؛ صدّر JSON لحفظ عملك.';return false;}}
 saveScenario(name){if(!name.trim())throw Error('اكتب اسمًا للنسخة.');if(this.scenarios.length>=25)throw Error('وصلت إلى 25 نسخة؛ احذف نسخة قديمة بعد تصديرها.');this.scenarios.push({id:crypto.randomUUID(),name:name.trim().slice(0,100),state:clone({...this.state,name:name.trim().slice(0,100)})});this.save();this.emit();}
 loadScenario(id){const s=this.scenarios.find(s=>s.id===id);if(s)this.commit(()=>{this.state=clone(s.state);});}
 removeScenario(id){this.scenarios=this.scenarios.filter(s=>s.id!==id);this.save();this.emit();}
 import(text){if(text.length>2000000)throw Error('الملف أكبر من 2 ميجابايت.');const state=validateState(JSON.parse(text));this.commit(()=>{this.state=state;});}
 export(){return JSON.stringify(this.state,null,2);}
}
