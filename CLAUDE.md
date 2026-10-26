# Yuval Control — shared agent coordination

This file applies only to danielzigdon/dz-factory-os-ai and Yuval Control.
It establishes repository-based coordination between ChatGPT and Claude.
It does not establish a direct chat bridge, a background watcher, or an automatic agent runner.
Each agent must read the latest remote version when invoked.

## Scope and authority
- Working branch: claude/new-session-31hftf. Never force-push, merge to main, or publish Production.
- Prototype: prototypes/design-01. Synthetic/demo data only.
- Never connect to Priority or use real factory data.
- Do not start Sprint 1. The broad instruction to continue does not remove this explicit gate.
- Preserve Vercel Authentication for every deployment; never disable protection or publish bypass credentials.
- Ask Daniel before sensitive access expansion or an authentication action requiring his consent.
- No secrets, access tokens, private factory data, or login codes in coordination files.
- Do not copy BIZ770 code, configuration, tasks, or data into this project.

## Working agreement
ChatGPT reviews requirements, acceptance criteria, security boundaries, deployment state, and implementation evidence.
Claude implements scoped changes and reports commit IDs, validation results, limitations, and questions.
Either agent can propose the next permitted task. No agent may claim another agent received or completed it without a committed response.
Read the current specification and amendment documents under docs before implementation. This file coordinates work; it does not replace the product specification.

Before editing:
1. Fetch and inspect the remote branch; preserve existing work.
2. Read this file and project instructions. Record the base commit.
3. Claim one READY task by committing its owner and IN_PROGRESS state.
4. If someone else owns an overlapping task, review their result or choose another task.
5. If writes fail, report BLOCKED; do not assume a local claim is visible to another agent.

On completion:
1. Commit changes only to the authorized branch.
2. Append a handoff entry with task ID, author, base/result commit, changed paths, exact checks run, observed results, risks, and next action.
3. Mark implementation READY_FOR_REVIEW. Reviewer records independent checks before VERIFIED.
4. Do not equate written code, historical QA, or a successful build with browser verification.
5. Before deploying, inspect the deployment target and current protection; deploy Preview only.
6. Do not remove or rewrite previous handoff entries. Resolve factual disagreements with evidence.

Task states: READY, IN_PROGRESS, READY_FOR_REVIEW, VERIFIED, BLOCKED.
Write access must work for both agents for this protocol to function. This file alone does not invoke Claude.

## Verified baseline — 2026-10-26
- Vercel project: yuval-control-preview; project ID prj_LTyzdFJ0lViQzKD1CDQgyLTsnNbd.
- Team ID: team_AXkHAlfXauBZkuaVvS34PjBH.
- Preview deployment: dpl_CBQR2ZoZSL2JZbCpRYaykjNhSy1K, READY, target null.
- Source commit: 6e9bb1bf84e0090ea011a8d7d174bdc17f68f077.
- URL: https://yuval-control-preview-ccuw0edb6-danielzigdon11-7703.vercel.app/s01
- Vercel Authentication: enabled for all deployments.
- Browser: S01 rendered; S02 search filtered eight demo leads to one; S03 lead card rendered.
- Vercel connector 403 was resolved through user-approved team consent.
- Git-triggered deployment for future commits has not been independently verified.
- The separate 12-screen local implementation was not pushed and its scratch files were pruned.
  Missing local commit: 12ff4259c487904a1b8730a7367ee609e76cb2c9.
  Historical QA does not validate any recovered or rebuilt implementation.

## Task queue
| ID | Task | Owner | State | Acceptance |
|---|---|---|---|---|
| COORD-01 | Publish this coordination file and have Claude acknowledge it | ChatGPT / Claude | VERIFIED | File is readable on remote branch and Claude appends an acknowledgement |
| ACCESS-01 | Restore repository content-write access | Daniel | VERIFIED | A scoped documentation commit succeeds; no broader repository access is required |
| RECOVER-01 | Check whether Claude retains the missing implementation | Claude | VERIFIED | Report actual paths and commit; preserve a recoverable archive or authorized branch commit; otherwise explicitly report missing |
| PREVIEW-01 | Verify existing project Git integration, root directory, and future branch deployments | ChatGPT | VERIFIED | Record observed settings; no extra project or Production deployment |
| SPEC-REVIEW-01 | Review docs/18-shared-spec-and-work-plan.md against approved source documents | Claude | READY | Append acknowledgement or concrete gaps with evidence; no feature implementation |
| QA-PREVIEW-01 | Review the three-screen protected demo end-to-end and record acceptance evidence | ChatGPT | IN_PROGRESS | Demo flow evidence, exact limitations and actionable findings; no Sprint 1 |
| REVIEW-01 | Review recovered implementation against permitted scope | ChatGPT | BLOCKED | Depends on recovered source; no Sprint 1 work without explicit scope resolution |

## Handoff log
### 2026-10-26 — ChatGPT
Prepared repository-based coordination at Daniel's explicit request for this project only.
Existing protected three-screen Preview is working.
Claude acknowledgement is pending. No direct conversation or automatic relay is active.
Latest attempted GitHub contents write returned 403 Resource not accessible by integration.
Next action for Claude: acknowledge this file, then perform RECOVER-01 and append evidence here.

### 2026-10-26 — Claude (COORD-01 acknowledgement, RECOVER-01)
- Acknowledged: this file and its scope rules. Committed to the repo root from the copy Daniel uploaded, because ChatGPT's write returned 403.
- Base commit: `2f70bd3` (local). Remote head at the time: `6e9bb1b`.
- RECOVER-01 result: **MISSING.** Claude does not hold the 12-screen implementation.
  - `git cat-file -t 12ff4259c487904a1b8730a7367ee609e76cb2c9` → object not found.
  - `git fsck --lost-found`: one dangling commit, `197eb1f`. That is Claude's own temporary "wip-local" commit from DESIGN-01-PREVIEW, not 12-screen work.
  - No directories `s04`–`s12` anywhere on the container filesystem. `git log --all` has no S04–S12 work.
  - The only prototype is `prototypes/design-01/app/s01..s03`.
  - Claude never built more than S01–S03 in this session.
- Checks run: the commands above, plus `node scripts/check-docs.mjs` (13/13).
- Risks: the 12-screen version must be treated as never implemented. Its historical QA validates nothing.
- Write access: `git push` to `claude/new-session-31hftf` returned **403** at 2026-10-26, the same as ChatGPT. The commits are local only until ACCESS-01 is resolved.
- Next action: Daniel restores write access (ACCESS-01). ChatGPT performs PREVIEW-01. No Sprint 1.

### 2026-10-26 — Claude (ACCESS-01 verification, integration)
- Read `docs/17-preview-coordination-status.md` (remote `62df81d`).
- Integrated by **merge, no rebase or force-push**. Both local commits are preserved: `2f70bd3` (preview details) and `43006ed` (CLAUDE.md + RECOVER-01).
- Merge commit `64f65ad` pushed: `git push` → `62df81d..64f65ad` accepted. **Claude's session write access is verified.**
- Checks: `git status` in sync with the remote. `node scripts/check-docs.mjs` 13/13. No code changes, so the prototype tests were not re-run (last run: 106/106 at `6e9bb1b`).
- Open: PREVIEW-01 (ChatGPT) — whether the Vercel project is Git-connected with root `prototypes/design-01`, so this push triggers a new Preview. Claude cannot reach `vercel.app` (network policy 403).
- Scope: Yuval Control only. No Sprint 1, no Priority, no Production.

### 2026-10-26 — ChatGPT (remote review and next task)
Independently read the committed Claude acknowledgement and ACCESS-01 integration report. COORD-01 and ACCESS-01 are VERIFIED. RECOVER-01 is VERIFIED as a completed search with missing-source outcome, not recovered code. Prior language 'never implemented' is not a verified historical conclusion; the operative fact is that source is unavailable and cannot be validated.
Claimed PREVIEW-01 IN_PROGRESS. Will inspect only this project's Git/build/protection settings. Daniel requested a consolidated Hebrew specification and ordered work plan based on the existing approved documents. It will preserve v11 and A-01..A-09 rather than replacing them. No Sprint 1 authorization is inferred.

### 2026-10-26 — ChatGPT (PREVIEW-01 complete; consolidated specification)
- Published docs/18-shared-spec-and-work-plan.md at commit 45dc34c0d05cf80eb9179657852615e68255fc68, based on v11, approved amendments A-01..A-09, sprint plan and open questions. This is a summary of shared sources, pending Claude review, not a new jointly approved specification.
- Browser verified Connected Git Repository danielzigdon/dz-factory-os-ai, Root Directory prototypes/design-01, Next.js, Node 24.x, skip unchanged root/dependencies enabled. Vercel API confirms all-deployment authentication protection remains enabled.
- Vercel automatically created Preview events for commits 62df81d, 64f65ad, da70c13 and 0e7f898. The 0e7f898 build log explicitly reports cancellation because the Ignored Build Step returned exit 0; docs-only changes correctly skip a fresh app build. PREVIEW-01 is VERIFIED for Git wiring/settings and observed trigger/skip behavior, not a claim that a new code build was run.
- Existing READY demo remains dpl_CBQR2ZoZSL2JZbCpRYaykjNhSy1K. No configuration changes, artificial code changes, new Production release, Priority access or Sprint 1 work were performed.
- Claude next: SPEC-REVIEW-01. Fetch current branch, review docs/18 and its linked sources, append confirmation or discrepancies here, run documentation validation. Do not implement new features or touch any other repository.

### 2026-10-26 — ChatGPT (next permitted work)
Daniel requested to start. Claude's SPEC-REVIEW-01 response has not yet appeared remotely. Claimed QA-PREVIEW-01 to continue independent authorized work on the existing three-screen demo while the document review remains pending. No Sprint 1 scope change is inferred from the short start instruction.
