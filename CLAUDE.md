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
| WEBSITE-SPEC-01 | Specify the public Yuval Gvanim website requested by Daniel | ChatGPT | READY_FOR_REVIEW | Detailed scope, content evidence, accessibility, security and measurable acceptance; protected Preview only |
| WEBSITE-PREVIEW-01 | Build a protected public-company website demonstration and verify desktop/mobile behavior | ChatGPT | READY_FOR_REVIEW | Standalone brand-led website preview with synthetic marked content, no real submissions or Priority |
| WEBSITE-REVIEW-01 | Review docs/19-public-website-spec.md and the update to docs/18 | Claude | READY_FOR_REVIEW | Record gaps or approval; no unapproved company claims, no Production |
| SPEC-REVIEW-01 | Review docs/18-shared-spec-and-work-plan.md against approved source documents | Claude | READY_FOR_REVIEW | Append acknowledgement or concrete gaps with evidence; no feature implementation |
| QA-PREVIEW-01 | Review the three-screen protected demo end-to-end and record acceptance evidence | ChatGPT | IN_PROGRESS | Demo flow evidence, exact limitations and actionable findings; no Sprint 1 |
| SEC-01 | Upgrade Next.js 16.4.0 → 16.4.3 (critical advisories; `next build` now exits 1) and re-verify the prototype | Claude | READY_FOR_REVIEW | Build exits 0; npm audit has no critical/high; full Playwright + contrast pass; Preview redeploys READY |
| WEB-FIX-01 | Fix WEBSITE-REVIEW-01 findings 1–3 (320px overflow, logo weight, Playwright coverage replacing mobile-preview.html) | Claude | IN_PROGRESS | No overflow at 320–1440; logo ≤ 60 KB; website tests in the suite pass; axe 0; no content/claim changes |
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

### 2026-10-26 — ChatGPT (public website requirement)
Daniel explicitly requested adding a high-quality public-facing Yuval Gvanim company website to the specification. Existing sources mention website/media only at Sprint 5+, without a complete website brief. Claimed WEBSITE-SPEC-01. Public website screen IDs will use W01+ separately from the internal S01-S12. Current work is specification; no Production, Priority, real customer data or Sprint 1.
QA-PREVIEW-01 remains active. During live demo review, unassigned filter showed 3 items; assigning one demo lead to Noa reduced it to 2 with a success toast. Found an accessible-name defect: assignment dialog is announced as new-lead dialog because all ConfirmationDialog instances use the same dlg-title ID. Source review confirmed the duplicate ID. Track a focused prototype accessibility fix; this is not authorization for Sprint 1.

### 2026-10-26 — ChatGPT (website specification ready for review)
- Created docs/19-public-website-spec.md at 7522c979515fd0a3a0937379e24924f29a6e1934 and linked it in docs/18. Public W01-W08 are separate from internal S01-S12.
- Requirements: polished brand-led industrial design with existing logo, truthful approved content, service/process/gallery/contact pages, usable enquiry flow, WCAG 2.2 AA target, protected noindex Preview, security/privacy/performance and measurable acceptance. No invented testimonials, certificates or capabilities. The ISO text in a supplied photograph does not prove current certification.
- Pending: Claude review, approved public materials, homepage/mobile design, implementation and acceptance testing. No website code was created and no Production/Sprint 1/Priority authorization is inferred.
- Daniel asked what is still missing. The remaining content and implementation gaps are described explicitly in docs/19; historical internal QA does not validate this unbuilt public website.

### 2026-10-26 — ChatGPT (website Preview implementation)
Daniel explicitly instructed continued execution of the website work sequence. Claimed WEBSITE-PREVIEW-01: build a standalone static website demonstration under prototypes/design-01/public/company-preview, within the existing Vercel-protected prototype. This does not start internal Sprint 1. Use supplied logo, no unapproved real factory/customer content, no actual messages or uploads, no Production. Claude review tasks remain pending; do not claim automatic collaboration occurred.

### 2026-10-26 — Claude (SPEC-REVIEW-01)
- Base: `e61c520`. Reviewed `docs/18-shared-spec-and-work-plan.md` against 00, 05, 06, 08, 09, 10, 12–14.
- **Accepted:** the scope gates, screen list S01–S12, lead/opportunity split (A-05), dedupe rules (A-01), "handled" definition and SLA timing from event start (A-09 supersedes v11's "60 more minutes"), quote versioning/lock (A-03), quote origin + verified sync (A-06), Priority mirrors (A-04), sprint order, and the PREVIEW-01 record.
- **Gaps to fix in doc 18** (documentation only):
  1. Auth decisions D-02/D-03 (A-02) are absent from the "product rules": invitation-only, no public sign-up, MFA (TOTP) for every admin-capable role, including a deputy with `leads:assign` scope=all, server-side checks, offboarding revokes sessions.
  2. Deputy exclusions are incomplete versus A-07: also `supplier_prices:write`, `price_lists:write` and `settings:*`, not only cost/margin/approvals/users.
  3. Open decisions omit Q-15 (does S07 planning write back to Priority) and Q-17 (security default values, pending approval). Q-01 is listed.
  4. PREVIEW-01 records **Node 24.x** on Vercel. The stack was tested on Node 22 LTS (ADR / 04, local 22.22). Either pin Vercel to 22.x or record a Node-24 build verification.
  5. Prototype limitation from 14 §6 is not carried over: a status change exists only through assignment (no free status selector), pending Daniel's decision.
- **New blocking finding (outside doc 18) → SEC-01:** `next@16.4.0` is in range for GHSA-2464-fhr4-w9xw (unauthenticated RCE, image optimizer + SVG), GHSA-673q-mjm6-r5xr (RCE, `use cache` typed arrays) and GHSA-p3m5-59mp-jv5r (DoS, Server Actions). Fixed in 16.4.3. `next build` now ends with `SecurityFatalError`, exit 1, so any new Vercel Preview build will fail. The current protected Preview still serves 16.4.0.
- Checks: `node scripts/check-docs.mjs` 13/13. `tsc` + `eslint` clean. `next build` **exit 1** (above). Playwright 106/106 ran against a previously built `.next`, so it does **not** validate the current tree; re-run under SEC-01. Contrast 55/55.
- Next: ChatGPT applies gaps 1–5 to doc 18 (or disputes them with evidence). Claude performs SEC-01 now. Then WEBSITE-REVIEW-01.

### 2026-10-26 — Claude (SEC-01)
- Base `4808e43` → result `50136e8`. Changed: `prototypes/design-01/package.json`, `package-lock.json` (`next` and `eslint-config-next` 16.4.0 → **16.4.3**, exact pins).
- Checks on a **fresh** `.next` (deleted first): `next build` exit **0** (was exit 1 with `SecurityFatalError`). `npm audit --omit=dev` **0 vulnerabilities**. `tsc --noEmit` and `eslint .` clean. Playwright **106/106**. `npm run contrast` 55/55.
- Not verified by Claude: the Vercel Preview build for this commit (Claude cannot reach `vercel.app`). ChatGPT please confirm that the deployment for `50136e8` is READY and that Authentication is still enabled.
- Note for WEBSITE-PREVIEW-01: website changes under `public/` could not have deployed with 16.4.0, because every new build failed. Re-check the website Preview after this commit.
- Next: ChatGPT reviews SEC-01 and the SPEC-REVIEW-01 gaps. Claude takes WEBSITE-REVIEW-01.

### 2026-10-26 — ChatGPT (company website Preview ready)
Built and committed the standalone company website demo and supplied-logo asset under public/company-preview. Current code e61c5209, deployment dpl_61PepWWH7nQnhCxgWUDaaKUQ7fTn READY Preview with all-deployment Vercel authentication retained. URL and detailed observed checks/limitations are in docs/20-company-website-preview-qa.md. Tested desktop loading, logo, form validation and demo result, FAQ, privacy Escape/focus return, and 390px CSS fixture menu and no page overflow. This is not full device, accessibility or performance certification. No real submissions, Priority, Production, internal Sprint 1 or other project changes.
Opened GitHub issue #1 with @claude for review; receipt/agent execution not yet verified. Next: independent review, targeted fixes and approval of public content. WEBSITE-PREVIEW-01 is READY_FOR_REVIEW, not final site completion.

### 2026-10-26 — Claude (SEC-01 addendum: deploy skip rule)
- Problem found: `vercel.json` `ignoreCommand` compared only `HEAD^..HEAD`. A push whose **last** commit is docs-only (for example `50136e8` code followed by `e4d1497` docs) would skip the build, and the security fix would never deploy.
- Change: `prototypes/design-01/vercel.json` `ignoreCommand` now compares against `$VERCEL_GIT_PREVIOUS_SHA` (the last successful deployment for the branch), and **builds** if that SHA is empty or missing from the clone.
- Verified locally in the working tree: prev empty → BUILD (exit 1). `6e9bb1b` → BUILD. `50136e8` / `e4d1497` → SKIP (exit 0). Unknown SHA → BUILD (exit 128).
- This commit touches `prototypes/design-01/`, so both the old and the new rule trigger a build for it.
- ChatGPT: please confirm the Vercel deployment for this commit is READY on Next 16.4.3 with Authentication on (SEC-01 → VERIFIED).

### 2026-10-26 — Claude (WEBSITE-REVIEW-01)
- Base: `88d2de0`. Reviewed `docs/19`, `docs/20`, the website paragraphs in `docs/18`, and `public/company-preview/*`. Checked live with `next start` + Playwright/Chromium + axe (WCAG 2.0/2.1/2.2 A/AA).
- **Observed:**
  - `dir=rtl`, `lang=he`, one `h1`, skip link present.
  - axe **0** violations at 320/360/390/768/1440.
  - **0** non-localhost requests.
  - CSP: `connect-src 'none'`, `form-action 'none'`. `noindex` in both meta and header. `X-Frame-Options: DENY`.
  - Text at 200% (640px) reflows with no overflow.
  - No unapproved claims found (no ISO/years/client counts/phones/emails). Demo markers present (10× "הדגמה", 3× "המחשה").
- **Findings:**
  1. **320px reflow fails** (doc 19 accessibility, WCAG 1.4.10): `button.menu-toggle` sits at L=-20, so the page overflows by 20px. 360+ is clean.
  2. **Logo weight:** `logo.png` is 704 KB at 1098×1432 but renders at 34–42px. It works against the doc 19 LCP ≤ 2.5s and Lighthouse ≥ 90 targets. Serve a ~96px (2×) asset and keep the original as the source file.
  3. `mobile-preview.html` is a hand-kept copy that will drift (docs/20 says so). Replace it with Playwright viewport tests in the prototype suite.
  4. Architecture: the public site lives inside the internal CRM prototype app (same Vercel project and domain as S01–S03). That is acceptable for a protected Preview, but doc 19 "separation" calls for its own app/folder (and later its own project/domain) before W01–W08 grow. Recommend a decision before more pages are added.
  5. Future quote intake: doc 19 should state that submissions enter S02 via the server intake (A-01 dedupe, HMAC + rate limit per AC1.6, `source=website`), never directly to Priority. WhatsApp depends on Q-10 consent.
  6. Order: the Preview was built before steps 3–4 (content map, visual direction). That's fine as a demo; record Daniel's direction approval before expanding.
- **Correction to my SEC-01 handoff:** "website changes could not have deployed with 16.4.0" was an inference from the local build, and it is **wrong**. ChatGPT recorded `dpl_61PepWWH7nQnhCxgWUDaaKUQ7fTn` READY on `e61c520`. Vercel's build evidently did not hit the local `SecurityFatalError`. The upgrade is still required for the advisories.
- Next: Claude takes WEB-FIX-01 (findings 1–3, no copy changes). ChatGPT/Daniel decide findings 4–6.
