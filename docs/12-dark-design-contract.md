> **סטטוס: ממתין לאישור** (בעל המפעל + ביקורת ChatGPT). הועתק ללא שינוי מ-`Yuval_Control_Design_03_Claude.md`. **הערה:** בסעיף 8.1 הנתיב הוא `docs/12-design-03-contract.md`, אך לפי הנחיית המשתמש מ-12.10.2026 הקובץ נשמר כ-`docs/12-dark-design-contract.md`.

# Yuval Control — Design Contract 03
**Status:** DESIGN-01 only. Sprint 1 is NOT authorized.
**Reference:** User selected visual concept #3, futuristic blue-on-charcoal industrial CRM, with reduced glow for readability. Reference image is a conceptual mockup, not a pixel-perfect specification.
**Date:** 2026-10-12

## 1. Authority and scope
- Product: Yuval Control, powder-coating factory management and CRM with Priority ERP remaining source of truth for official customers/orders/production/accounting.
- Design owner: ChatGPT for design specifications and review; business approval: factory owner; implementer: Claude.
- Implement **DESIGN-01 only:** static or mock-data responsive visual prototype of S01 Manager Dashboard, S02 Inquiries Center, and S03 Customer Card. Do not build the real backend, auth, DB, integrations, or production release in this phase.
- Resolve conflicts by applying: explicit business decisions > signed design contract > prior visual concepts. Raise unresolved conflicts; never invent real figures.

## 2. Design language and tokens
Visual: premium industrial command center, dark graphite/near-black surfaces, restrained electric blue focus/primary actions, green successes, amber warnings, red urgent. Crisp layouts, no ambient glows behind text, no gradients required except very subtle brand surfaces. Avoid heavy decorative imagery in primary application flows.

| Token | Hex | Usage |
|---|---|---|
| bg | `#080F18` | app background |
| sidebar | `#0D1723` | main navigation |
| surface | `#111F2D` | cards/tables |
| surface-raised | `#172A3B` | hover, active cells, elevated panels |
| border | `#294154` | 1px separators |
| text-primary | `#F1F6FC` | headings/body |
| text-secondary | `#A8BDD0` | metadata |
| primary | `#2297F5` | primary buttons, active navigation |
| primary-hover | `#177DD1` | button hover |
| success | `#27B78B` | complete/active |
| warning | `#E7A849` | review/pending |
| danger | `#F06D72` | urgent/error |
| focus | `#85C9FF` | 2px visible focus ring |

Contrast: normal text >=4.5:1 and large UI text >=3:1; icons/control boundaries >=3:1 when essential. Verify with automated and manual check. Never rely on color alone for status.
Typography: Hebrew-first sans (system UI fallback); RTL page (`lang=he`, `dir=rtl`), 14-16px body, headings 20-28px, numeric KPIs 26-34px. Tabular numerals for money/metrics; isolate LTR tokens such as email, phone, IDs, RAL and currency when appropriate. Spacing scale 4/8/12/16/24/32. Radius 8px inputs, 12px cards, 16px large panels. Button height min 40px desktop, 44px mobile. Sidebar 232-248px desktop. Visible hover/focus/disabled/loading states. Motion 120-180ms, respects reduced-motion.

## 3. Global layout
- Desktop >=1200px: right anchored sidebar; slim top bar for global search, notifications, environment marker and user. Central content max-width ~1600px; gutter 24px.
- Tablet 768-1199px: collapsible navigation/drawer; two-column KPI grid; tables scroll within containers, not page-wide.
- Mobile 360-767px: bottom navigation or accessible top drawer (choose one consistently); 16px outer padding; KPI grid 2 columns if readable; lead records as cards; one-column customer sections. No horizontal body overflow.
- Minimum breakpoints to show screenshots: 390px and 1440px; visual QA at 360, 390, 768, 1280, 1440px.
- Navigation must show current location via label and active marker; keyboard navigable; accessible names; screen readers announced statuses.
- No false live/connected status: mock prototype visibly marked `נתוני הדגמה` and Priority marked `טרם חובר`.

## 4. Screen S01 — Manager Dashboard
Purpose: identify what needs manager attention in <10 seconds.
Layout desktop: header title `לוח מנהל`; 4 KPIs across: new leads, unassigned leads, overdue follow-ups, open lead value (estimated). Beneath: urgent/unassigned lead queue (dominant panel), today's tasks, owner/deputy availability. Optional small activity feed. Avoid production profitability/orders data before Priority connection.
Mobile: 2x2 KPI cards, urgent queue first, next tasks second, availability compact. Primary action `למרכז הפניות`.
State examples: loading skeleton; all-clear empty; API error with retry; urgent red text+icon; limited privileges with no sensitive financial elements.

## 5. Screen S02 — Inquiries Center
Purpose: receive and assign all leads through central inbox.
Desktop: searchable/sortable table with lead name/company, source, received, urgency, status, responsible, next task, action. Filters for unassigned, urgent, status, source. Clear `פנייה חדשה` call-to-action. Bulk assign allowed only for authorized manager/deputy role in prototype; confirmation dialog for bulk actions.
Mobile: individual lead cards with company, status, urgency, owner, next task; filters behind labeled button; quick action `שייך` and open details. Search remains visible.
Duplicate warning: match by validated business ID = needs human linkage; matching phone/email only = suspicion, NEVER auto-merge; show provenance/why flagged.
States: empty filters, no records, loading, malformed input, duplicate suspect, unauthorized assignment, error.

## 6. Screen S03 — Customer/Lead Card
Purpose: single source of commercial context, without creating duplicate Priority record.
Desktop: customer header (name, status, lead/customer distinction, owner, last contact); right primary content with tabs or sections `סקירה`, `אנשי קשר`, `פעילות`, `משימות`, `הצעות`, `קבצים`; secondary area for next task, source and Priority connection status. User can add note and schedule a follow-up in prototype (mock local state only).
Mobile: customer header and primary call/email action where safe; sections stacked or tabs with accessible overflow. Do not show fake operational history as real.
Never display supplier prices, cost price, profit/margin to sales/deputy roles. Mock limited-view mode must show fields truly omitted from the rendered data, not merely concealed with CSS.

## 7. Components and interactions
Reusable: AppShell, SideNav, MobileNav, TopBar, StatCard, StatusBadge, LeadTable/LeadCard, FilterBar, Search, OwnerSelect, DueDate, ActivityTimeline, EmptyState, ErrorState, LoadingSkeleton, PermissionGuard, ConfirmationDialog, Toast.
Each clickable element must have real prototype behavior (state update, navigation, filter, reset, or explanatory disabled state). No inert CTA. Status semantics must be consistent between screens. Any illustrative chart must be labeled mock data and tied to coherent fixture values.

## 8. Required deliverables for DESIGN-01
1. `docs/12-design-03-contract.md` copy of this contract; indicate approval pending.
2. Figma-like design tokens implemented in centralized CSS theme or token file; a brief component inventory.
3. Renderable isolated static prototype S01, S02, S03 using deterministic non-sensitive fixtures only, with working navigation and demonstrative interactions.
4. Screenshots: six minimum — desktop 1440px + mobile 390px for each of S01, S02, S03. Additionally screenshot key empty/error/duplicate/permission states (at least four state captures).
5. Written design QA report listing viewport tests, text truncation, RTL keyboard flow, visible focus, contrast, accessibility, missing interactions, and known gaps.
6. Commands to launch prototype; changed files; commit SHA; images path; what remains blocked.

## 9. Exit criteria / visual acceptance
- All 3 screens render at both required widths; no clipped text, overlapping controls or unwanted page horizontal scroll.
- RTL Hebrew correct; phone/email/IDs display legibly; control labels understandable.
- Tokens match section 2, restrained glow, high-contrast typography; appropriate empty/loading/error/limited states.
- Responsive navigation functions and active state matches screen.
- Filtering, owner assignment (mock), tab navigation, task/note interaction work as advertised; no dead primary CTAs.
- Permissions simulated with safe DTO/fixture differences; no costs or profitability visible to deputy/sales.
- No Priority API calls; no real DB or auth integration; no real customers; no external messaging; no production deploy.
- Report discrepancies transparently. Do not claim checklist pass without screenshots/tests.
- **STOP** after DESIGN-01; do not begin Sprint 1 or proceed to another design phase until owner and ChatGPT review screenshots and explicitly approve.

## 10. Message to Claude
Read this file and previous project decision documents. Perform DESIGN-01 only. First save this design contract in repo and outline implementation. Build a renderable mock prototype, execute visual + interaction tests, capture screenshots, and report results with paths and commit. Do not implement production systems. Stop for approval.
