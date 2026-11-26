#!/usr/bin/env node
/**
 * Ritualmaker native receiving for FCL TOPOLOGY.expressionDerivation.
 * Disposition: NATIVE_EDGE_CONSUME (FCL SPHERE_ADAPTER_RECEIVING_CENSUS).
 * No parallel expression registry; validates binding at the site-adapter edge.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BINDING_PATH =
  "docs/internal/project-adapters/topology-expression-receiving/RM_TOPOLOGY_EXPRESSION_RECEIVING_BINDING_01.json";
const SPHERE = "Ritualmaker";
const REPO = "alenephotographs/Ritualmaker";
const DISPOSITION = "NATIVE_EDGE_CONSUME";
const REQUIRED = [
  "nativeReferentId",
  "semanticPurpose",
  "humanPurpose",
  "owner",
  "authorityMembrane",
  "accessibilityEquivalent",
  "falsifier",
  "returnRoute",
  "interactionMechanic",
];

function hasText(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function exactSourceRevision(v) {
  return typeof v === "string" && /^[a-f0-9]{40}$/.test(v);
}

export function consumeRitualmakerExpressionDerivations(binding) {
  const errors = [];
  if (!binding || binding.sphereId !== SPHERE || binding.repository !== REPO) {
    return { status: "INVALID", errors: ["RM_RECEIVING_SPHERE_MISMATCH"], grantsAuthority: false };
  }
  if (binding.adapterReceivingDisposition !== DISPOSITION) {
    return { status: "INVALID", errors: ["RM_RECEIVING_DISPOSITION_MISMATCH"], grantsAuthority: false };
  }
  for (const flag of ["authorityCreated", "runtimeAdoptionClaimed", "humanBenefitClaimed", "ownerAdoption", "mergeAuthorized"]) {
    if (binding[flag] === true) errors.push(`RM_RECEIVING_BOUNDARY_${flag}`);
  }
  if (binding.masterBindLedgerPr === 4709) errors.push("RM_RECEIVING_HOLD_4709_FORBIDDEN");
  if (binding.fclPortabilityTipSha !== "b55f78023e3431b5f08fe86ed7daf5eb7ef7b7f7") errors.push("RM_RECEIVING_FCL_TIP_PIN_MISMATCH");
  if (binding.eightRepoReceivingHold !== true) errors.push("RM_RECEIVING_EIGHT_REPO_HOLD_REQUIRED");
  const rows = binding.topologyExpressionRows;
  if (!Array.isArray(rows) || !rows.length) errors.push("TOPOLOGY_EXPRESSION_EMPTY");
  const seen = new Set();
  const consumed = [];
  for (const row of rows || []) {
    if (!row || !hasText(row.id) || seen.has(row.id)) {
      errors.push("TOPOLOGY_EXPRESSION_INVALID_OR_DUPLICATE");
      continue;
    }
    seen.add(row.id);
    if (row.sphereId !== SPHERE || row.repository !== REPO) errors.push(`TOPOLOGY_EXPRESSION_FOREIGN_${row.id}`);
    if (row.adapterReceivingDisposition !== DISPOSITION) {
      errors.push(`TOPOLOGY_EXPRESSION_DISPOSITION_CLASS_${row.id}`);
    }
    for (const field of REQUIRED) {
      if (!hasText(row[field])) errors.push(`TOPOLOGY_EXPRESSION_MISSING_${field}_${row.id}`);
    }
    if (!hasText(row.returnRoute) || !String(row.returnRoute).startsWith(SPHERE)) {
      errors.push(`TOPOLOGY_EXPRESSION_RETURN_${row.id}`);
    }
    if (row.disposition !== "BOUND") errors.push(`TOPOLOGY_EXPRESSION_DISPOSITION_${row.id}`);
    if (!Array.isArray(row.alternatives) || row.alternatives.length < 2 ||
        new Set(row.alternatives.map(String)).size !== row.alternatives.length) {
      errors.push(`TOPOLOGY_EXPRESSION_ALTERNATIVES_${row.id}`);
    }
    if (!Array.isArray(row.sourceRefs) || !row.sourceRefs.length) {
      errors.push(`TOPOLOGY_EXPRESSION_SOURCE_${row.id}`);
    } else {
      for (const ref of row.sourceRefs) {
        if (!ref || !hasText(ref.artifact) || !hasText(ref.owner) || !exactSourceRevision(ref.revision) ||
            !["FOUNDER_SOURCE", "RESEARCH_SOURCE", "NATIVE_SOURCE", "PARTICIPANT_STATED", "OBSERVATION", "HYPOTHESIS"].includes(ref.evidenceClass) ||
            (ref.currentness !== "CURRENT_AT_REQUIRED_REF" && row.disposition !== "OWNER_BOUND_HOLD")) {
          errors.push(`TOPOLOGY_EXPRESSION_SOURCE_${row.id}`);
        }
      }
    }
    for (const field of ["authorityCreated", "runtimeAdoptionClaimed", "humanBenefitClaimed", "foreignGeometryImported"]) {
      if (row[field] !== false) errors.push(`TOPOLOGY_EXPRESSION_BOUNDARY_${field}_${row.id}`);
    }
    // Manifestation honesty: seasonal / tactile — reject foreign Boutique geometry labels
    const blob = JSON.stringify(row);
    if (/BOUTIQUE_ARCHIVE_METASPHERIC|orbit-orange|contributor-to-sale/i.test(blob)) {
      errors.push(`TOPOLOGY_EXPRESSION_FOREIGN_GEOMETRY_${row.id}`);
    }
    if (!errors.some((e) => e.includes(row.id) || e.startsWith("TOPOLOGY_EXPRESSION_FOREIGN"))) {
      consumed.push({
        derivationId: row.id,
        nativeReferentId: row.nativeReferentId,
        interactionMechanic: row.interactionMechanic,
        grantsAuthority: false,
        portabilityCarrierPr: 4707,
      });
    }
  }
  if (errors.length) {
    return { status: "TOPOLOGY_EXPRESSION_CONSUME_INVALID", errors, consumed, grantsAuthority: false };
  }
  return {
    status: "RM_TOPOLOGY_EXPRESSION_BINDINGS_CONSUMED",
    sphereId: SPHERE,
    consumed,
    grantsAuthority: false,
    runtimeAdoptionProven: false,
  };
}

function adversarial() {
  const binding = JSON.parse(readFileSync(join(ROOT, BINDING_PATH), "utf8"));
  const base = consumeRitualmakerExpressionDerivations(binding);
  if (base.status !== "RM_TOPOLOGY_EXPRESSION_BINDINGS_CONSUMED") {
    throw new Error(`BASE_FAIL:${JSON.stringify(base)}`);
  }

  const foreign = structuredClone(binding);
  foreign.topologyExpressionRows[0].sphereId = "Boutique";
  const f = consumeRitualmakerExpressionDerivations(foreign);
  if (!f.errors?.some((e) => e.includes("FOREIGN"))) throw new Error("FALSE_SUCCESS_FOREIGN");

  const inflated = structuredClone(binding);
  inflated.authorityCreated = true;
  const a = consumeRitualmakerExpressionDerivations(inflated);
  if (!a.errors?.includes("RM_RECEIVING_BOUNDARY_authorityCreated")) throw new Error("FALSE_SUCCESS_AUTHORITY");

  const wrongClass = structuredClone(binding);
  wrongClass.adapterReceivingDisposition = "OWNER_BOUND_HOLD";
  const w = consumeRitualmakerExpressionDerivations(wrongClass);
  if (!w.errors?.includes("RM_RECEIVING_DISPOSITION_MISMATCH") && w.status !== "INVALID") {
    throw new Error("FALSE_SUCCESS_DISPOSITION");
  }

  const boutiqueGeom = structuredClone(binding);
  boutiqueGeom.topologyExpressionRows[0].semanticPurpose =
    "Import BOUTIQUE_ARCHIVE_METASPHERIC atlas orbit-orange contributor-to-sale geometry";
  const g = consumeRitualmakerExpressionDerivations(boutiqueGeom);
  if (!g.errors?.some((e) => e.includes("FOREIGN_GEOMETRY"))) throw new Error("FALSE_SUCCESS_FOREIGN_GEOMETRY");

  const mergeClaim = structuredClone(binding);
  mergeClaim.mergeAuthorized = true;
  const m = consumeRitualmakerExpressionDerivations(mergeClaim);
  if (!m.errors?.includes("RM_RECEIVING_BOUNDARY_mergeAuthorized")) throw new Error("FALSE_SUCCESS_MERGE");

  const adopt = structuredClone(binding);
  adopt.ownerAdoption = true;
  const o = consumeRitualmakerExpressionDerivations(adopt);
  if (!o.errors?.includes("RM_RECEIVING_BOUNDARY_ownerAdoption")) throw new Error("FALSE_SUCCESS_OWNER_ADOPTION");

  const ledger = structuredClone(binding);
  ledger.masterBindLedgerPr = 4709;
  const l = consumeRitualmakerExpressionDerivations(ledger);
  if (!l.errors?.includes("RM_RECEIVING_HOLD_4709_FORBIDDEN")) throw new Error("FALSE_SUCCESS_4709");

  const tip = structuredClone(binding);
  tip.fclPortabilityTipSha = "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef";
  const t = consumeRitualmakerExpressionDerivations(tip);
  if (!t.errors?.includes("RM_RECEIVING_FCL_TIP_PIN_MISMATCH")) throw new Error("FALSE_SUCCESS_TIP_PIN");

  return {
    status: "RM_TOPOLOGY_EXPRESSION_RECEIVING_ADVERSARIAL_PASS",
    baseStatus: base.status,
    consumed: base.consumed.length,
    falseSuccessFamilyChecked: [
      "FOREIGN_SPHERE",
      "AUTHORITY_INFLATION",
      "DISPOSITION_MISMATCH",
      "FOREIGN_BOUTIQUE_GEOMETRY",
      "MERGE_AUTHORIZED",
      "OWNER_ADOPTION",
      "MASTER_BIND_4709",
      "FCL_TIP_PIN",
    ],
    grantsAuthority: false,
  };
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("verify-rm-topology-expression-receiving.mjs")) {
  console.log(JSON.stringify(adversarial(), null, 2));
}
