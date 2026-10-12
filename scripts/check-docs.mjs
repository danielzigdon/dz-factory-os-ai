#!/usr/bin/env node
// Phase 0 consistency checks for docs/. Exits non-zero on any failure.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

const root = join(dirname(new URL(import.meta.url).pathname), "..", "docs");
const files = readdirSync(root).filter((f) => f.endsWith(".md"));
const doc = Object.fromEntries(files.map((f) => [f, readFileSync(join(root, f), "utf8")]));
const all = Object.values(doc).join("\n");
const results = [];
const check = (name, problems) => results.push({ name, problems });

// 1. Relative links resolve.
const broken = [];
for (const [f, text] of Object.entries(doc))
  for (const [, href] of text.matchAll(/\]\(([^)#\s]+)(#[^)]*)?\)/g))
    if (!/^https?:/.test(href) && !existsSync(join(root, href))) broken.push(`${f} -> ${href}`);
check("relative links resolve", broken);

// 2. Every referenced ID is defined (as a table row "| ID |") in its home document.
const homes = { R: "01-spec-review.md", S: "01-spec-review.md", P: "01-spec-review.md", Q: "06-open-questions-risks.md", K: "06-open-questions-risks.md" };
const undefinedIds = [];
for (const id of new Set(all.match(/\b[RSPQK]-\d{2}\b/g))) {
  if (!new RegExp(`\\|\\s*${id}\\s*\\|`).test(doc[homes[id[0]]])) undefinedIds.push(id);
}
for (const id of new Set(all.match(/\bW-\d{2}\b/g)))
  if (!doc["01-spec-review.md"].includes(`**${id}:**`)) undefinedIds.push(id);
for (const id of new Set(all.match(/\bADR-\d{3}\b/g)))
  if (!doc["04-technical-decisions.md"].includes(`## ${id}`)) undefinedIds.push(id);
for (const id of new Set(all.match(/\bAC\d\.\d\b/g)))
  if (!doc["05-sprint-plan.md"].includes(`**${id}**`)) undefinedIds.push(id);
check("all referenced IDs are defined", undefinedIds);

// 3. Every entity of spec section 6 appears in the data model table.
const spec = doc["00-spec-v11.md"];
const section6 = spec.slice(spec.indexOf("# 6."), spec.indexOf("# 7."));
const specEntities = [...section6.matchAll(/^\| ([a-z_]+)\s+\|/gm)].map((m) => m[1]);
const model = doc["03-data-model.md"];
const modelRows = new Set([...model.matchAll(/^\| ([a-z_ /]+?) \|/gm)].flatMap((m) => m[1].split(" / ")));
check(`spec entities (${specEntities.length}) present in data model`, specEntities.filter((e) => !modelRows.has(e)));
if (specEntities.length !== 17) results.at(-1).problems.push(`expected 17 spec entities, parsed ${specEntities.length}`);

// 4. ERD entities exist in the data model table.
const erd = model.slice(model.indexOf("erDiagram"));
const erdEntities = new Set([...erd.matchAll(/^\s+([a-z_]+) [|}o]/gm), ...erd.matchAll(/[|{o] ([a-z_]+) :/gm)].map((m) => m[1]));
check("ERD entities defined in table", [...erdEntities].filter((e) => !modelRows.has(e)));

// 5. Every screen S01..S12 is scheduled in the sprint plan; every UAT 1..7 has an AC.
const plan = doc["05-sprint-plan.md"];
const screens = [...new Set(spec.match(/\bS(0[1-9]|1[0-2])\b/g))];
check(`screens (${screens.length}) scheduled`, screens.filter((s) => !plan.includes(s)).concat(screens.length === 12 ? [] : ["expected 12 screens"]));
check("UAT 1-7 mapped to AC", [1, 2, 3, 4, 5, 6, 7].filter((n) => !plan.includes(`UAT ${n}`)).map((n) => `UAT ${n}`));

// 6. Spec state machines preserved in data model.
const states = ["NEW", "TRIAGE", "ASSIGNED", "CONTACTED", "QUALIFIED", "QUOTED", "NEGOTIATION", "WON", "LOST",
  "DRAFT", "REVIEW", "APPROVED_INTERNAL", "SENT", "ACCEPTED_CUSTOMER", "SYNC_PENDING", "SYNCED", "ORDER_LINKED", "REJECTED", "EXPIRED"];
check("spec states present in data model", states.filter((s) => !spec.includes(s) || !model.includes(s)));

// 7. Mermaid/code fences balanced.
check("code fences balanced", Object.entries(doc).filter(([, t]) => (t.match(/^```/gm) || []).length % 2).map(([f]) => f));

let failed = 0;
for (const { name, problems } of results) {
  console.log(`${problems.length ? "FAIL" : "PASS"}  ${name}${problems.length ? ": " + problems.join(", ") : ""}`);
  failed += problems.length ? 1 : 0;
}
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
