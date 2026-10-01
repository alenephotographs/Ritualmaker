import fs from "node:fs";

const read = (p) => fs.readFileSync(p, "utf8");
const index = read("docs/internal/00_SYSTEM_INDEX.md");
const current = read("docs/internal/02_CURRENT_STATE.md");
const routing = read("docs/internal/11_TASK_ROUTING_PROTOCOL.md");
const vercel = JSON.parse(read("vercel.json"));
const errors = [];
const need = (src, text, label) => { if (!src.includes(text)) errors.push(label); };

need(index, "## 2026-09-30 cold-reentry active-program census", "system index active-program census missing");
need(index, "PR #19", "system index omits active PR19");
need(index, "MATERIALLY ACTIVE NATIVE PROGRAM OMITTED FROM REENTRY => FAIL CLOSED", "active-program omission law missing");
need(index, "OPEN LAWFUL NATIVE WORK MUST REMAIN SELECTABLE", "lawful-work conservation missing");

need(current, "## 2026-09-30 currentness supersession", "current-state supersession missing");
need(current, "PR #19 — active client-portal payment/invoice recovery", "current state omits PR19");
need(current, "PAYMENT EFFECT PROTECTED != PAYMENT/RECOVERY PLANNING EXHAUSTED", "protected-effect/non-effectful distinction missing");
need(current, "GREEN SOURCE != LIVE STRIPE/EMAIL/MIGRATION PROOF", "proof ceiling missing");

need(routing, "### Active-program census gate", "routing census gate missing");
need(routing, "CURRENT STATE READ != ACTIVE PROGRAM CENSUS COMPLETE", "routing completeness law missing");
need(routing, "PROTECTED LIVE EFFECT != BLOCKED NON-EFFECTFUL HARDENING", "routing protected-effect law missing");

if (vercel?.git?.deploymentEnabled !== false) errors.push("Git-triggered Vercel deployment is not fail-closed");

if (errors.length) {
  for (const e of errors) console.error(`RITUALMAKER_REENTRY_FAIL: ${e}`);
  process.exit(1);
}
console.log("Ritualmaker cold-reentry active-program census guard passed.");
