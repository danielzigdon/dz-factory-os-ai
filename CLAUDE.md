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
| SPEC-REVIEW-01 | Review docs/18-shared-spec-and-work-plan.md against approved source documents | Claude | VERIFIED | Append acknowledgement or concrete gaps with evidence; no feature implementation |
| A11Y-DIALOG-01 | Give each prototype dialog a unique accessible heading and verify assignment | ChatGPT | VERIFIED | Correct accessible name with multiple mounted dialogs; protected Preview only |
| QA-PREVIEW-01 | Review the three-screen protected demo end-to-end and record acceptance evidence | ChatGPT | READY_FOR_REVIEW | Demo flow evidence, exact limitations and actionable findings; no Sprint 1 |
| SEC-01 | Upgrade Next.js 16.4.0 → 16.4.3 (critical advisories; `next build` now exits 1) and re-verify the prototype | Claude | VERIFIED | Build exits 0; npm audit has no critical/high; full Playwright + contrast pass; Preview redeploys READY |
| WEB-FIX-01 | Fix WEBSITE-REVIEW-01 findings 1–3 (320px overflow, logo weight, Playwright coverage replacing mobile-preview.html) | Claude | READY_FOR_REVIEW | No overflow at 320–1440; logo ≤ 60 KB; website tests in the suite pass; axe 0; no content/claim changes |
| REVIEW-01 | Review recovered implementation against permitted scope | ChatGPT | BLOCKED | Depends on recovered source; no Sprint 1 work without explicit scope resolution |

| WEBSITE-COPY-01 | Research industry sources and write original Yuval website copy | ChatGPT | READY_FOR_REVIEW | Original educational content; no copied company history, claims or images |

| WEBSITE-COPY-REVIEW-01 | Review original industry-informed copy and rerun existing website tests | Claude | READY_FOR_REVIEW | Check doc21 sources, no unsupported Yuval claims, website suite on current branch |

| WEBSITE-PHOTOS-01 | Integrate Daniel-supplied factory photographs into protected website Preview | ChatGPT | READY_FOR_REVIEW | Deduplicated optimized photos, accurate captions, no customer identities or operational records |

| WEBSITE-PHOTOS-REVIEW-01 | Independently verify photo assets, viewer keyboard behavior and viewport suite | Claude | VERIFIED | Current website tests and photo interactions; no new claims or scope expansion |
| WEBSITE-FACTS-REVIEW-01 | Independently review owner-supplied business facts, accuracy of copy, privacy exclusions and website tests | Claude | VERIFIED | Confirm only supplied claims appear, contact links work, no financial identifiers, and current Preview tests pass |
| WEBSITE-FACADE-01 | Add Daniel-supplied factory exterior photograph to the protected website Preview | ChatGPT | VERIFIED | Crop phone screenshot borders and parked vehicles; preserve visible company sign; strip metadata; verify actual Preview; keep other images unchanged |
| WEBSITE-PHOTOS-02 | Add a curated set of additional Daniel-supplied product and process photographs to the protected website Preview | ChatGPT | IN_PROGRESS | Three distinct photos, no identifiable workers or screenshot borders, optimized metadata-free assets, accessible captions, live Preview verification |
| WEBSITE-PHOTOS-02-REVIEW | Independently review the additional photo assets and live gallery behavior | Claude | READY_FOR_REVIEW | Verify image/caption accuracy, asset metadata, dialog keyboard interaction, and no layout overflow; no Production |
| WEBSITE-FACTS-01 | Integrate Daniel-supplied company identity, service and contact facts in the protected website Preview | ChatGPT | VERIFIED | User-supplied company facts and contact details in protected Preview; bank/ID excluded; live verified; Claude review pending |

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

### 2026-10-26 — Claude (WEB-FIX-01)
- Base `f1db3a2` → result `924210a`.
- Changed paths:
  - `public/company-preview/index.html` (one CSS breakpoint, `max-width:359px`, no copy changes)
  - `public/company-preview/logo.png` (96×125, 11.7 KB)
  - `docs/design-01/brand/logo-source.png` (the original, moved and not deployed)
  - `public/company-preview/mobile-preview.html` (deleted)
  - `tests/website.spec.ts` (new, 11 tests)
  - `docs/20` (appended)
- Checks on a fresh build: `tsc`, `eslint` clean. `next build` exit 0. Playwright **117/117** (`--reporter=list`). An earlier run in the same tree reported 116 passed, and that run's output did not show the 117th result, so a single flake can't be ruled out. Contrast 55/55.
- Website measured: no page overflow and nothing off-screen at 320/360/390/768/1440. axe WCAG 2.2 AA 0 violations. 0 external requests. Logo ≤ 60 KB. The form never sends a non-GET request.
- Not verified by Claude: the Vercel deployment of `924210a` (Claude cannot reach `vercel.app`), Safari/Firefox, real devices, screen readers.
- Open for ChatGPT/Daniel: WEBSITE-REVIEW-01 findings 4–6 (separate app/project for the site, S02 intake path in doc 19, order of content-map/visual approval).

### 2026-10-27 — ChatGPT (continued execution)
Read Claude's committed SPEC/SEC/WEB review and fixes. Claude has completed substantive work; issue #1 itself has no comments. Claiming A11Y-DIALOG-01 for the duplicate heading IDs in ConfirmationDialog. Will independently verify latest protected deployment and apply documentation gaps. No Sprint 1, Priority, Production or other repository changes.

### 2026-10-27 — ChatGPT (A11Y-DIALOG-01, specification and live deployment review)
- Base e866f6a. Fix b00d42e: ConfirmationDialog now uses React useId for its heading and aria-labelledby. Regression coverage 2f18d07 asserts the assignment accessible name and unique mounted dialog heading IDs.
- Independent cloud-browser verification on dpl_9orJ9GjufdyieorxLcdciAFc1AbU / 2f18d07, READY Preview target null: S02 assignment opens as 'שיוך פנייה'; two heading IDs are distinct. Assigned the synthetic garden-furniture lead to Noa; row became assigned. New-lead dialog then announced its own title. S01 displayed the updated unassigned count; S03/C-101 overview rendered.
- Website on Claude's dpl_C4p96feUXMNsUjqX5SMTg6LuKneR renders; deployed logo is 96x125, loaded; document width and scrollWidth both 1348; robots noindex,nofollow. Empty form reports three errors and focuses the name field.
- Vercel project inspection confirms Node 24.x, Next.js and authentication enabled for all deployments. Latest code build is READY. SEC-01 deployment gate is VERIFIED; audit and 117-suite results remain explicitly attributed to Claude, not rerun here.
- Documentation: b00adb5 resolves SPEC-REVIEW-01 gaps (A-02 MFA/invitation/offboarding, deputy exclusions, Q-15/Q-17, status limitation and Node build evidence). 571178f adds content map, S02 server intake rules, separate-app release boundary and explicit design/content approval status to doc19.
- Limitations: no local node_modules in this environment, so the new regression assertions/full suite have not been executed here. Live targeted behavior was verified. Safari/Firefox, real devices, screen reader and measured performance remain open. No final public-site acceptance or Production approval is claimed.
- Next Claude task: independently review b00d42e/2f18d07 and docs18/19; run the focused assignment regression, then the relevant suite on current source. Record results before marking A11Y-DIALOG-01 VERIFIED. No other repository, Priority or Sprint 1 work.

### 2026-10-27 — Claude (status message to ChatGPT, independent review of A11Y-DIALOG-01)
- Read up to `11242a7` (includes `b00d42e`, `2f18d07`, `b00adb5`).
- **A11Y-DIALOG-01, independent checks** (owner ChatGPT, still IN_PROGRESS): the `useId` fix in `ConfirmationDialog` is correct (unique `aria-labelledby` per mounted dialog). At `11242a7`, fresh `npm ci` plus a fresh `.next`: `tsc` and `eslint` clean, `next build` exit 0, Playwright **117/117** (`--reporter=list`), contrast 55/55, `npm audit --omit=dev` 0. Ready for VERIFIED once you mark it READY_FOR_REVIEW.
- **SPEC-REVIEW-01 follow-up:** all 5 gaps are reflected in doc 18 (MFA/invitations, full deputy exclusions, Q-15/Q-17, the Node 24 deploy evidence, the status-selector limitation). From my side the review is closed.
- **Closed from Claude's side, awaiting your VERIFIED or rejection with evidence:** SPEC-REVIEW-01, WEBSITE-REVIEW-01, SEC-01 (your record: `16f4c0c` READY as `dpl_C4p96feUXMNsUjqX5SMTg6LuKneR` on 16.4.3), WEB-FIX-01.
- **Waiting window:** Claude polls this branch every 10 minutes while Daniel's session is open, and keeps doing so. If nothing new appears, Claude does not stop; it only lengthens the interval (up to 30 minutes). To hand Claude work, add a READY row owned by Claude and push.
- **Still for Daniel:** website findings 4–6 (separate app before going public, S02 intake path, approval of the content map/visual direction). No Sprint 1, Priority or Production.

### 2026-10-27 — ChatGPT (WEBSITE-COPY-01)
Daniel will supply photographs and explicitly requested industry-informed website copy. Claiming original copy research/adaptation, using professional primary sources as factual references. This does not authorize replacing another company's name in its copyrighted copy or transferring its credentials/history to Yuval. General explanations and quotation-preparation guidance only; company-specific capabilities remain subject to confirmation. Read Claude's new independent 117/117 report at 11242a7; A11Y-DIALOG-01 and SPEC-REVIEW-01 can close on that evidence.

### 2026-10-27 — ChatGPT (WEBSITE-COPY-01 handoff)
- Code 1c2f810: original Hebrew service descriptions and eight FAQs. Sources and claim boundaries documented in docs/21 at b1daba9. No competitor text/name substitution, no transferred credentials/history/images, no specific coating-product performance promises.
- Vercel dpl_4rMUkNdRwCsPLuGk1rXbPEZvp4A8 READY Preview target null. Cloud browser verified all new content rendered, eight FAQ entries, exterior-use FAQ opens and displays correct answer; desktop clientWidth=scrollWidth=1348.
- URL https://yuval-control-preview-rd4ng8adj-danielzigdon11-7703.vercel.app/company-preview/index.html
- Existing website tests reviewed: no fixed FAQ-count assertion affected. Full suite not rerun here for copy-only changes. Claude owns independent copy review + existing website tests. Daniel will provide actual photos; business-specific claims still require factual approval. No Production, Priority, other repo or Sprint 1.

### 2026-10-27 — Claude (WEBSITE-COPY-REVIEW-01)
- Base `3569cbc`. Reviewed `docs/21` and the copy changes from `1c2f810` (3 service cards, 8 FAQs) in `public/company-preview/index.html`. No files changed by Claude.
- **Content review — approved as demo copy:**
  - Technically accurate: electrostatic application then oven cure, surface prep driven by substrate/contaminants/use environment, gloss and texture as distinct from hue, a physical sample over the on-screen colour, and that coating alone is not a corrosion guarantee.
  - No Yuval-specific capability, certification, years, clients, capacity, lead time or warranty is asserted. A grep for ISO/ותק/שנות ניסיון/מוביל/אחריות/"תוך N" returned 0 hits.
  - Company-specific items are explicitly deferred ("יאושרו מול יובל גוונים", "טעונות בדיקה").
  - The section demo marker "הצעת תוכן להמחשה" is still present.
- **Optional wording notes (non-blocking):**
  1. "מתקשה בתנור" fits thermoset powders. Thermoplastic powders melt and flow rather than cure; acceptable for a general audience.
  2. RAL is cited as an example only. Keep it that way unless Yuval confirms it works to RAL references.
- **Sources:** not re-fetched by Claude. The container network policy blocks `powdercoating.org` (curl 000). The source list and claim boundaries in doc 21 are consistent with the published copy.
- **Tests at `3569cbc`, fresh `.next`:** `tsc` and `eslint` clean, `next build` exit 0, Playwright **117/117** (11 website tests included: 320–1440 no overflow, axe WCAG 2.2 AA 0, 0 external requests), contrast 55/55.
- Next: ChatGPT reviews → VERIFIED. Daniel supplies photos and approves facts. No Production, Priority or Sprint 1.

### 2026-10-27 — ChatGPT (WEBSITE-PHOTOS-01)
Daniel finished supplying photographs and instructed their integration in the website. This authorizes using the supplied photographs as website assets in protected Preview; the demo-only restriction on CRM data, no Priority/Production/Sprint 1 and other-project isolation remain. Select photographs without visible people or customer labels when practical. No publication of source EXIF metadata. Replace illustrative gallery with factual visual captions only; do not infer coating specifications or before/after claims. Claude's copy review accepted; no overlapping photo task found.

### 2026-10-27 — ChatGPT (WEBSITE-PHOTOS-01 implementation)
- Base a3bd4216 → result 9d33be02, atomically committed six WebP assets, index.html and docs/22. All files remain in authorized repo/branch; fast-forward update with expected parent, no force.
- Replaced hero and about illustrations plus the three mock sample figures with six user-supplied factory photographs and factual captions. Added native dialog photo enlargement, close button and alt text; lazy loading below hero. Selected photographs avoid recognizable people and prominent customer labels. No original EXIF/GPS carried into site assets; original uploads unchanged.
- Local checks: unique IDs, six gallery buttons, alt attributes, all photo source paths exist; node --check of inline JS passed. Asset total 673 KiB. No external services or form behavior changed.
- Deployment dpl_7mryb4EPduwHJ6bd3X9LAMZue4KL is the Git-triggered Preview for 9d33be02. Protection remains enabled for all deployments. Live cloud-browser attempt reached Vercel Login because this browser session requires renewed authentication; no bypass or protection change attempted. Live photo load/enlargement/viewport verification is still pending, not claimed complete.
- Next: Claude runs independent website tests and image/viewer checks on current source. ChatGPT resumes live verification after browser sign-in. No Production, Priority, internal Sprint 1 or other project changes.

### 2026-10-27 — ChatGPT (WEBSITE-PHOTOS-01 live verification complete)
- Browser authentication renewed via user-selected Google using secure browserAuth; fresh page shows the actual website. No protection setting changed.
- Independently tested live Preview 9d33be02 / dpl_7mryb4EPduwHJ6bd3X9LAMZue4KL READY, target null. All six gallery photographs opened and decoded at natural width 900; all page image sources loaded. Native photo dialog shows the selected caption and alt text. Escape closes it and focus returns to the invoking photo button. Close-button interaction also passed for each remaining photo.
- Desktop document width and scrollWidth both 1348. Gallery visually inspected. No native mobile-device, screen-reader, Safari/Firefox or fresh viewport-suite result claimed here; independent WEBSITE-PHOTOS-REVIEW-01 remains READY for Claude.
- Verified website URL: https://yuval-control-preview-9kl68x76v-danielzigdon11-7703.vercel.app/company-preview/index.html#finishes
- Photo integration implementation is ready for review. Public business contact details and final content approval remain separate. Video was not embedded; this handoff covers the selected six photographs only.


### 2026-10-27 — ChatGPT (WEBSITE-FACTS-01 claim)
- Daniel supplied company background, services, equipment, suppliers, customer names and a company-details sheet. This authorizes their use as website content in the existing protected Preview.
- The screenshot includes tax and bank information. Do not publish company ID, bank, or account details. Use only the business name, address, phone numbers and email relevant to customer contact.
- No Production deployment or protection change. No Priority or internal factory data. Avoid presenting named customers/suppliers as endorsements or formal partnerships.
- Base `d83c7a5`. Next: review and integrate verified user-supplied facts into the preview, test and deploy on the authorized branch.


### 2026-10-27 — ChatGPT (WEBSITE-FACTS-01 implementation)
- Base `c5fbedc`; implementation commits `d65e21d` and `d0e4d34` on the authorized branch.
- Updated the website title/description, hero, services, company story, process, customer/supplier text and contact section using only the facts Daniel supplied in chat and the company-details image. The supplied sheet contains bank and company ID data; neither was added to site code. The website form remains a demo and does not send or save submissions.
- Content states that Yuval Gvanim Ltd. was established in May 2026 by Didi, is a subsidiary of Didi Advanced Solutions for Industry, serves the parent company and other industrial customers, coats iron/metals/aluminum, uses Wagner and Ideal coating systems/guns, has chemical wash and curing ovens, checks part dimensions/weight/coating thickness, and offers coordinated pickup/delivery nationwide. Names of customers and suppliers were transcribed from Daniel's text, as plain text without logos or endorsement claims.
- Live Preview deployment `dpl_2NaP4huqTFx5ApzA948oNv7zLWah` is READY, target `null`, source `d0e4d34`. Project inspection confirms `live:false` and Vercel SSO protection `enabled:true, deploymentType:all`; no protection setting changed.
- Live browser check: Hebrew page loaded; business facts, six images and contact links were visible. All first-view images decoded; later gallery assets remain lazy-loaded until scrolled. Document width 1348 equals viewport content width; no bank or tax identifiers in rendered page; `noindex,nofollow`; form has no action attribute. Contact section visually reviewed. Full viewport suite and independent copy review are delegated as WEBSITE-FACTS-REVIEW-01; no mobile/device QA claimed in this handoff.
- Preview URL: https://yuval-control-preview-fuzhxdw7a-danielzigdon11-7703.vercel.app/company-preview/index.html#about
- Next: Claude independently reviews this change and reports any corrections. No Production, Priority, other-project changes or Sprint 1.


### 2026-10-27 — ChatGPT (WEBSITE-FACADE-01 claim)
- Daniel supplied a new batch of company photographs after the first gallery integration. Add the company exterior photo to the existing protected Preview. The photo includes a phone screenshot border and parked cars; crop to the signed facade, excluding the vehicles and registration plates.
- Do not add photos where workers' faces are visible. No semantic image alteration, EXIF/GPS metadata, new customer claims, or production publication.
- Base `4b979ba`. Next: integrate the cropped exterior as the About image, test the live Preview and append evidence.

### 2026-10-27 — Claude (WEBSITE-PHOTOS-REVIEW-01)
- Base `125c753` (includes WEBSITE-FACADE-01 `065ae03`) → result `1630e22`. Changed: `prototypes/design-01/tests/website.spec.ts` (+3 tests). No site files changed.
- **Assets (7 WebP incl. factory-front):** EXIF tags 0, GPS none, no XMP or ICC. Sizes 26–168 KB, max 900 px wide. Visual contact-sheet check: no visible faces, licence plates or customer labels. The facade is cropped to the building and sign, with no vehicles. Alt texts and captions match the image content and add no material/RAL/spec claims.
- **Viewer:** keyboard Enter opens, the caption is copied, the large image decodes, there is no page overflow, and Esc and × both close and **return focus to the trigger** (tested at 390 and 1440).
- **Checks at `1630e22`, fresh `.next`:** `tsc` and `eslint` clean, `next build` exit 0, Playwright **120/120**, including the website suite at 320–1440 (axe WCAG 2.2 AA 0 with photos present, 0 external requests). Contrast 55/55.
- Not verified: rights and consent for the photos (Daniel), real devices, screen readers.
- Claude now claims WEBSITE-FACTS-REVIEW-01.

### 2026-10-27 — Claude (WEBSITE-FACTS-REVIEW-01)
- Base `4500908`. Reviewed the rendered text of hero/about/contact against `docs/19` and `docs/21` (the owner-supplied facts table). No files changed by Claude.
- **Matches doc 21:** founded May 2026 by Ami Didi, subsidiary of Didi Advanced Solutions; iron, metals and aluminum; Wagner and Ideal; curing ovens; checks of dimensions, weight and coating thickness; packing and nationwide pickup/delivery; customer and supplier names as plain text with no logos; address, phone/fax, mobile and two e-mails. Nothing beyond the doc 21 list was found.
- **Privacy exclusions:**
  - No bank, branch, account, IBAN or company/tax ID in the page. The pattern scan hits were Hebrew substrings and the phone digits only.
  - `tel:+97286611769` / `tel:+972543232500` correctly encode 08-6611769 / 054-3232500. Both `mailto:` addresses match.
  - The form has no action, the CSP has `form-action 'none'`, and the copy warns not to enter real personal data.
- **Findings — none block the protected Preview; items 1–2 block public release:**
  1. **Customer names** (ישראלייזר, אלקטרה, א.ד. מירז, Lee Cooper, Golf, רנואר) appear under "בין לקוחות החברה". Doc 19 requires the named customer's approval before a public reference. Obtain written consent per customer, or remove the names before going public.
  2. "**ניסיון תעשייתי**" (about heading) and "**ניסיון עם חברות ומותגים**", for a company founded in May 2026, can read as Yuval's own track record. Suggest attributing it to the group ("הידע התעשייתי של קבוצת דידי"), or have Daniel confirm the wording.
  3. Supplier and equipment brands (נירלט, טמבור, IBA, Wagner, Ideal) are factual mentions. Keep them as text only (no logos), as now.
  4. Puffery ("ציוד צביעה מתקדם", "צוות מקצועי ומיומן") is acceptable marketing tone. Daniel to confirm.
  5. Plain `mailto:` addresses will be harvested by spam bots once public. Consider a contact form with server intake (finding 5 of WEBSITE-REVIEW-01).
- **Tests:** same tree as WEBSITE-PHOTOS-REVIEW-01 (`1630e22`, no site change since): Playwright **120/120**, website axe WCAG 2.2 AA 0 at 320–1440, 0 external requests, contrast 55/55.
- Next: ChatGPT/Daniel decide 1–2 before any public step. No Production, Priority or Sprint 1.


### 2026-10-27 — ChatGPT (WEBSITE-FACADE-01 complete; independent reviews accepted)
- Base `997c0019ceb3e49af8afd38a317f05cbf6558f0a`; this documentation commit records review evidence without changing website code.
- Completed the exterior image integration already deployed from `065ae03`: source `IMG_2477.png`, crop removes phone screenshot borders and parked vehicles/plates while preserving the company sign; derivative is 805×360 WebP (~27 KB), no EXIF/GPS transfer. Browser screenshot verified the image rendered in the About section.
- Live Preview checked: `dpl_E3e3ucNF13vTsjV5mgARCHdbEzwd`, READY, target null; URL `https://yuval-control-preview-fm7low6ld-danielzigdon11-7703.vercel.app/company-preview/index.html#about`. Rendered company facts, contacts, gallery, and demo-only form. Project remains `live:false`; SSO protection enabled for all deployments. No protection/config changes.
- Accepted Claude's independent evidence at `1630e22`: Playwright 120/120, axe WCAG 2.2 AA 0 at 320–1440, 0 external requests, contrast 55/55. No re-run claimed by ChatGPT.
- Closed WEBSITE-FACADE-01, WEBSITE-PHOTOS-REVIEW-01, WEBSITE-FACTS-REVIEW-01, and WEBSITE-FACTS-01 as VERIFIED for the protected Preview scope. Public release remains gated: written permission for named customer references or removal, clarify the wording implying Yuval's own track record, and confirm photo rights/consent. No Production, Priority, Sprint 1, or other-repository work.


### 2026-10-27 — ChatGPT (WEBSITE-PHOTOS-02 claim)
- Base `3c5ae6fb538a42854403dc59de954c0433e20225`. Daniel supplied a new photo batch. Select up to three distinct factory/product photographs that add visible variety to the existing six-image gallery; use only provided imagery and keep all changes in the protected Preview.
- Candidates selected after visual review: `IMG_2482.jpeg` (mixed light/dark brackets on the line), `IMG_2485.jpeg` (close-up of finished profiles), and `IMG_2484.jpeg` (long parts entering the coating oven). Exclude photos with visible workers or phone screenshot bars. No inferential coating/spec claims, no metadata, no external imagery.
- Next: add optimized WebP derivatives, accurate Hebrew alt text/captions, update docs/22, run site validation, deploy Preview and verify gallery interactions.

### 2026-10-27 — Claude (WEBSITE-PHOTOS-02-REVIEW)
- Base `b2e9f75` (includes `53c799e`). WEBSITE-PHOTOS-02 was still IN_PROGRESS when reviewed. This covers the three assets as committed. No files changed by Claude.
- **Assets:** `brackets-on-line` (56 KB), `long-parts-on-line` (33 KB), `olive-profiles` (30 KB), all 480×640 WebP. EXIF 0, no XMP or ICC.
- **Visual check (contact sheet):** no people, faces, plates, screenshot borders or customer labels. Alt texts and captions ("חלקי מתכת על המסוע", "פרופילים בגוון אפור־זית", "חלקים מאורכים על המסוע") match the images and add no spec/RAL/material claims.
- **Gallery and viewer:** covered by the website suite (all `assets/` images local, ≤ 200 KB, decode, with alt; viewer keyboard open, Esc/× close with focus return at 390/1440; no overflow 320–1440; axe WCAG 2.2 AA 0).
- **Checks at `b2e9f75`, fresh `.next`:** `tsc` and `eslint` clean, `next build` exit 0, Playwright **120/120**, contrast 55/55.
- Not verified by Claude: the live Vercel deployment (no `vercel.app` access), photo rights and consent, real devices.
