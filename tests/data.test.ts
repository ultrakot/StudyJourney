import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {courses,exercises} from '../src/data';
import {blankState,parseBackup,validateState,resetCompletion,toggleProgress,validUrl,STORAGE_KEY,loadState,type State} from '../src/storage';

test('all 126 tasks exactly match the authoritative syllabus, in order',()=>{
  const source=readFileSync(new URL('../study_tracker_codex_spec.md',import.meta.url),'utf8');
  const sections=source.split(/^### Course [ABC] — /m).slice(1);
  assert.equal(courses.length,3);
  assert.equal(exercises.length,126);
  assert.equal(new Set(exercises.map(e=>e.id)).size,126);
  courses.forEach((c,index)=>{
    assert.equal(c.weeks.length,6);
    const expected=[...sections[index].split(/^## /m)[0].matchAll(/^(\d+)\. (.+)$/gm)].map(m=>m[2].trim());
    assert.equal(expected.length,42);
    const actual=c.weeks.flatMap(w=>w.exercises);
    assert.deepEqual(actual.map(e=>e.task),expected);
    c.weeks.forEach((w,i)=>{assert.equal(w.number,i+1);assert.equal(w.exercises.length,7);w.exercises.forEach((e,j)=>{assert.equal(e.day,i*7+j+1);assert.equal(e.id,`${c.id}-w${i+1}-d${e.day}`);assert.equal(e.courseId,c.id);});});
  });
});

const full:State={schemaVersion:1,theme:'dark',exercises:{'ai-w1-d1':{completed:true,completedAt:'2026-10-25T08:30:00.000Z',notes:'Unicode notes: מחשבות ✦',checklist:[{id:'step-1',text:'Check the result',done:true},{id:'step-2',text:'Explain it',done:false}],hint:'Personal hint',solution:'My reasoning',referenceUrls:['https://example.com/notes','http://localhost:8000']}}};
test('JSON export/import roundtrip retains every supported field',()=>{assert.deepEqual(parseBackup(JSON.stringify(full)),full);});
test('invalid backups are rejected without changing existing state',()=>{
  const original=JSON.stringify(full);
  const invalid:unknown[]=[null,[],{}, {...full,schemaVersion:2},{...full,exercises:[]},{...full,theme:'purple'},{...full,exercises:{unknown:{completed:false,notes:''}}}, {...full,exercises:{'ai-w1-d1':{completed:'yes',notes:''}}}];
  for(const patch of [{notes:42},{completedAt:'not a date'},{completedAt:'2026-10-25'},{hint:3},{solution:[]},{referenceUrls:['javascript:alert(1)']},{referenceUrls:['data:text/html,test']},{checklist:[{id:'x',text:'x',done:'true'}]},{checklist:[{id:'x',text:'x',done:true},{id:'x',text:'duplicate',done:false}]}]) invalid.push({...full,exercises:{'ai-w1-d1':{...full.exercises['ai-w1-d1'],...patch}}});
  invalid.forEach(v=>assert.throws(()=>validateState(v)));
  assert.throws(()=>parseBackup('{broken'),/valid JSON/);
  assert.equal(JSON.stringify(full),original);
});
test('completion and reopening preserve notes and personal fields',()=>{const p=full.exercises['ai-w1-d1'];const reopened=toggleProgress(p);assert.equal(reopened.completed,false);assert.equal(reopened.completedAt,undefined);assert.equal(reopened.notes,p.notes);assert.deepEqual(reopened.checklist,p.checklist);const done=toggleProgress(reopened);assert.equal(done.completed,true);assert.ok(done.completedAt);});
test('course reset only clears completion and dates for selected course',()=>{const state:State={...full,exercises:{...full.exercises,'linux-w1-d1':{completed:true,notes:'keep',completedAt:'2026-10-24T10:00:00Z'}}};const reset=resetCompletion(state,['ai-w1-d1']);assert.equal(reset.exercises['ai-w1-d1'].completed,false);assert.equal(reset.exercises['ai-w1-d1'].notes,full.exercises['ai-w1-d1'].notes);assert.deepEqual(reset.exercises['linux-w1-d1'],state.exercises['linux-w1-d1']);assert.equal(state.exercises['ai-w1-d1'].completed,true);});
test('malformed storage is preserved and autosave is blocked at load',()=>{const values=new Map([[STORAGE_KEY,'{invalid']]);Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(k:string)=>values.get(k)||null}});const loaded=loadState();assert.equal(loaded.raw,'{invalid');assert.match(loaded.error,/paused/);assert.deepEqual(loaded.state,blankState());assert.equal(values.get(STORAGE_KEY),'{invalid');});
test('valid browser state loads without migration or loss',()=>{Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>JSON.stringify(full)}});assert.deepEqual(loadState().state,full);assert.equal(loadState().error,'');});
test('references only accept absolute HTTP(S) URLs',()=>{assert.ok(validUrl('https://example.org'));assert.ok(validUrl('http://localhost'));for(const v of ['javascript:alert(1)','/relative','example.org','file:///tmp/a']) assert.equal(validUrl(v),false);});
