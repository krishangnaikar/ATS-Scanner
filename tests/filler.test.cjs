const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
async function setup({resumeText='Resume',jobText='Job',resumeReady=true,jobReady=false}={}) {
  const events=[]; let observer, removed=0;
  class Field {dispatchEvent(e){events.push(e.type);} focus(){} }
  const resume=new Field(),job=new Field();
  const ready={resume:resumeReady,job:jobReady};
  const chrome={storage:{sync:{get:async()=>({resumeText})},local:{get:async()=>({lastJobDescription:jobText}),remove:async()=>{removed++;}}}};
  class MutationObserver {constructor(callback){this.callback=callback;observer=this;}observe(){}disconnect(){this.disconnected=true;}}
  const context={chrome,HTMLTextAreaElement:Field,HTMLInputElement:Field,Event:class{constructor(type){this.type=type;}},KeyboardEvent:class{constructor(type){this.type=type;}},setTimeout:fn=>fn(),MutationObserver,document:{documentElement:{},body:new Field(),querySelector:s=>s.includes('Resume Text')?(ready.resume?resume:null):s.includes('Job Description')?(ready.job?job:null):null}};
  await vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../partyrock_filler.js'),'utf8'),context);
  return {resume,job,ready,events,get removed(){return removed;},get observer(){return observer;}};
}
for(const missing of ['job','resume'])test(`waits for delayed ${missing} field before writing or submitting`,async()=>{
  const app=await setup({resumeReady:missing!=='resume',jobReady:missing!=='job'});
  assert.equal(app.removed,0);assert.equal(app.events.length,0);assert.ok(app.observer);
  app.ready[missing]=true;
  await app.observer.callback();
  assert.equal(app.resume.value,'Resume');assert.equal(app.job.value,'Job');
  assert.equal(app.removed,1);assert.equal(app.observer.disconnected,true);
  assert.ok(app.events.includes('keydown'));
});
test('resume-only input does not wait for an unused job field',async()=>{
 const app=await setup({jobText:''});assert.equal(app.resume.value,'Resume');assert.equal(app.observer,undefined);
});
test('job-only input does not wait for an unused resume field',async()=>{
 const app=await setup({resumeText:'',resumeReady:false,jobReady:true});assert.equal(app.job.value,'Job');assert.equal(app.observer,undefined);
});
