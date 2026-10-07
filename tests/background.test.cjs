const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
function setup({selectionResult='', appUrl}={}) {
  const calls={tabs:[],stored:[],scripts:[]}; let clicked;
  const chrome={runtime:{onInstalled:{addListener(){}}},contextMenus:{create(){},onClicked:{addListener(fn){clicked=fn;}}},storage:{sync:{get:async()=>({appUrl})},local:{set:async(value)=>calls.stored.push(value)}},tabs:{create:async(value)=>{calls.tabs.push(value);return {id:7};}},scripting:{executeScript:async(value)=>{calls.scripts.push(value);return [{result:{text:selectionResult}}];}}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../background.js'),'utf8'),{chrome});
  return {calls,click:info=>clicked(info,{id:3})};
}
test('a useful selection is stored without extracting the page',async()=>{
  const app=setup({appUrl:'https://example.test/app'}); const text='Detailed job description '.repeat(5);
  await app.click({menuItemId:'sendToResuMaster',selectionText:`  ${text}  `});
  assert.equal(app.calls.scripts.length,0);
  assert.equal(app.calls.stored[0].lastJobDescription,text.trim());
  assert.equal(app.calls.tabs[0].url,'https://example.test/app');
});
test('short selections fall back to page extraction',async()=>{
  const text='Extracted description '.repeat(10); const app=setup({selectionResult:text});
  await app.click({menuItemId:'sendToResuMaster',selectionText:'short'});
  assert.equal(app.calls.scripts[0].target.tabId,3);
  assert.equal(app.calls.stored[0].lastJobDescription,text.trim());
  assert.match(app.calls.tabs[0].url,/^https:\/\/partyrock\.aws\//);
});
test('unusable text does not open a tab or save a description',async()=>{
  const app=setup(); await app.click({menuItemId:'sendToResuMaster'});
  assert.equal(app.calls.stored.length,0); assert.equal(app.calls.tabs.length,0);
});
test('other menu actions are ignored',async()=>{
  const app=setup(); await app.click({menuItemId:'unrelated'});
  assert.equal(app.calls.scripts.length,0); assert.equal(app.calls.tabs.length,0);
});
