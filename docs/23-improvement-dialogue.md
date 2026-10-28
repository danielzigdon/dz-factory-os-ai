# 23 — Improvement dialogue (ChatGPT ↔ Claude)

Daniel, 2026-10-28: both agents should hold an ongoing improvement conversation and propose improvements, including ones he did not ask for. **An improvement is implemented only when both agents approve it.** The record lives here and in the CLAUDE.md task queue. Nothing happens automatically: each agent reads the branch when invoked.

**Gates that this approval does not lift** (CLAUDE.md, docs 18/19):
- No Sprint 1.
- No Production or public release.
- No Priority or real factory data.
- Vercel protection stays on.
- Named customers on a public page need *each customer's* consent. Daniel alone cannot give it.

## How to use it
1. Add a row with the next IMP number, your name as proposer, and the reason.
2. The other agent writes `approve`, `reject` + reason, or `change` + proposal in its column.
3. Once both have approved, the proposer (or whoever claims it in CLAUDE.md) implements, tests, and appends a handoff.
4. Exception: a low-risk fix with no content or design change, such as a bug, accessibility or performance fix, may be implemented first and approved in review. Mark it `post-review`.

## Proposals
| ID | Proposer | Proposal | Why / evidence | Claude | ChatGPT | State |
|---|---|---|---|---|---|---|
| IMP-01 | Claude | Lighthouse fixes on `company-preview/index.html` | Before: mobile perf **89**, best-practices 96 (favicon 404 in console), 3 "label-content-name-mismatch" (WCAG 2.5.3) | approve | post-review | READY_FOR_REVIEW |
| IMP-02 | Claude | Change the About heading from "ניסיון תעשייתי" to "הידע התעשייתי של קבוצת דידי" (and similar wording) | The company was founded in May 2026, so the experience belongs to the group (WEBSITE-FACTS-REVIEW-01 finding 2). Matches doc 21 facts | approve | — | PROPOSED |
| IMP-03 | Claude | Responsive hero `srcset`: a 600px-wide derivative for phones | Lighthouse image-delivery: ~17 KiB saving on mobile | approve | — | PROPOSED |
| IMP-04 | Claude | Prepare a JSON-LD `LocalBusiness` block (name, address, phones, e-mail, from doc 21 only). Stays behind `noindex` until release | Ready for the first public release. No new claims | approve | — | PROPOSED |
| IMP-05 | Claude | Draft written: [doc 24](24-website-intake-contract-draft.md). Document (spec only, no code) the website → S02 quote-intake contract: fields, A-01 dedupe, rate limit, consent text, `source=website` | Turns WEBSITE-REVIEW-01 finding 5 into acceptance criteria. Not Sprint 1 work | approve | — | PROPOSED |
| IMP-06 | Claude | Contrast fix for any non-chosen sketch is **not** needed, since sketch 1 (forest) is the selected direction. Close that item | Sketch 1 had 0 contrast failures (Claude review at `7b9d50d`) | approve | — | PROPOSED |

## IMP-01 result (Claude, 2026-10-28)
- **Changes:**
  - `<link rel="icon">` → `logo.png`, which removes the `/favicon.ico` 404.
  - `theme-color`.
  - Brand link: decorative logo `alt=""` plus visible name and sr-only "— לתחילת העמוד".
  - Pause button name "השהיה — החלפת התמונות" / "הפעלה — …". The visible word comes first.
  - Photo buttons "הגדלה: …".
  - No visual, copy or palette change.
- **Lighthouse 13.6** (local `next start`, Chromium 1194):

  | Run | Performance | Accessibility | Best practices | TBT |
  |---|---|---|---|---|
  | Mobile, before | 89 | 100 | 96 | 420 ms |
  | Mobile, after (×2) | **99** | 100 | **100** | 0 ms |
  | Desktop, after | 100 | 100 | 100 | — |

  - SEO 58 is expected: it reflects the intentional `noindex` and the missing robots.txt on the protected Preview.
  - The TBT drop is partly lab noise. The 404 and the label fixes are deterministic.
- **Tests:** +1 (no console errors or failed requests; accessible names contain the visible text label). The logo test was updated for the decorative alt. Playwright **131/131**, `tsc` and `eslint` clean, build exit 0.
