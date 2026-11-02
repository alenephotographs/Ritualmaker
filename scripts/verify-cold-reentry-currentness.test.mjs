import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {join,dirname,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const paths=['docs/internal/00_SYSTEM_INDEX.md','docs/internal/02_CURRENT_STATE.md','docs/internal/11_TASK_ROUTING_PROTOCOL.md','vercel.json'];
const cases=[
 ['docs/internal/00_SYSTEM_INDEX.md','PR #19'],
 ['docs/internal/00_SYSTEM_INDEX.md','MATERIALLY ACTIVE NATIVE PROGRAM OMITTED FROM REENTRY => FAIL CLOSED'],
 ['docs/internal/02_CURRENT_STATE.md','PR #19 — active client-portal payment/invoice recovery'],
 ['docs/internal/02_CURRENT_STATE.md','GREEN SOURCE != LIVE STRIPE/EMAIL/MIGRATION PROOF'],
 ['docs/internal/11_TASK_ROUTING_PROTOCOL.md','CURRENT STATE READ != ACTIVE PROGRAM CENSUS COMPLETE'],
 ['docs/internal/11_TASK_ROUTING_PROTOCOL.md','PROTECTED LIVE EFFECT != BLOCKED NON-EFFECTFUL HARDENING'],
];
for(const [path,marker] of cases)test('cold entry fails on omission: '+marker,()=>{
 const dir=mkdtempSync(join(tmpdir(),'ritual-reentry-'));
 try{
  for(const p of paths){const dest=join(dir,p);mkdirSync(dirname(dest),{recursive:true});writeFileSync(dest,readFileSync(join(root,p)));}
  const f=join(dir,path);writeFileSync(f,readFileSync(f,'utf8').replaceAll(marker,'REMOVED_BY_ADVERSARIAL_TEST'));
  const v=spawnSync(process.execPath,[join(root,'scripts/verify-cold-reentry-currentness.mjs')],{cwd:dir,encoding:'utf8'});
  assert.notEqual(v.status,0,v.stdout+v.stderr);
  assert.match(v.stderr,/RITUALMAKER_REENTRY_FAIL/);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
