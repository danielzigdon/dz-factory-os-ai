# החלטות טכניות וגרסאות

הגרסאות נבדקו מול npm registry ב-2026-10-12 (`npm view <pkg> dist-tags/engines/peerDependencies`). בכל מקום נבחרה הגרסה היציבה (`latest`) **ולא** prerelease, אלא אם מצוין אחרת.

## טבלת גרסאות מומלצת

| כלי | גרסה לנעילה | נימוק / תאימות שנבדקה |
|---|---|---|
| Node.js | 22 LTS (סביבה: 22.22.0) | עומד בכל דרישות ה-engines: Prisma 7 `^22.12`, Vitest 5 `^22.12`, Next 16 `>=20.9` |
| pnpm | 10.x (סביבה: 10.28.0) | workspaces |
| Next.js | 16.4.0 | peer: `react ^19` |
| React / react-dom | 19.3.0 | עומד ב-peer של Next 16.4 |
| TypeScript | **5.9.3** | `latest` היא 7.0.2 (קומפיילר native חדש). ראו ADR-003 |
| Tailwind CSS | 4.3.3 (+ `@tailwindcss/postcss` 4.3.3) | v4 נתמכת ב-shadcn CLI 4.x |
| shadcn (CLI) | 4.21.4 | engines `>=20.18.1` |
| Prisma / @prisma/client | **7.10.0** (+ `@prisma/adapter-pg` 7.10.0) | dist-tag `latest` של prisma מצביע על `8.0.0-rc.22`, שזו prerelease. לכן נבחרה 7.10.0 (`prev`, יציבה). בנוסף, Better Auth מצהירה על תמיכה ב-`prisma ^5‖^6‖^7` בלבד |
| PostgreSQL | 16 (סביבה: client 16.15) | גרסה נתמכת. גרסת השרת המנוהל תיקבע עם האירוח |
| Better Auth | 1.7.7 | peer: `next ^14‖^15‖^16`, `@prisma/client ^7`, `vitest ≤5` |
| Zod | 4.6.6 | ולידציה משותפת לשרת וללקוח |
| pg-boss | 12.37.1 | תור עבודות על Postgres, בלי צורך ב-Redis. engines `>=22.12` |
| Vitest | 5.0.4 | בדיקות יחידה. peer `@types/node ^22` |
| Playwright | 1.64.0 | E2E. Chromium מותקן מראש בסביבה |
| ESLint / eslint-config-next | **9.39.5** / 16.4.0 | עודכן ב-PHASE-0-FIX: עם ESLint 10.12.0 התקבלו 3 אזהרות ERESOLVE, כי eslint-plugin-react 7.37.5, eslint-plugin-import 2.32.0 ו-eslint-plugin-jsx-a11y 6.10.2 תומכים רק עד `^9`. עם 9.39.5 יש 0 אזהרות ו-lint עובר (V7) |
| pino | 10.4.0 | לוג מובנה עם redaction |

**התקנה בפועל (PHASE-0-FIX, V7):** בוצעה בפרויקט ניסיון מבודד ב-scratchpad, מחוץ לריפו. עברו install, `prisma validate` ו-`prisma generate`, `tsc` (כולל import של Better Auth עם prismaAdapter ו-twoFactor, pg-boss, pino ו-PrismaPg), `next build` עם Tailwind 4 ו-RTL, `eslint` ו-`vitest`. **לא נבדקו:** `shadcn init` (דורש registry), ריצה מול Postgres, ו-Better Auth בזמן ריצה. אלה ייבדקו ב-Sprint 1 (AC1.1, AC1.2).

## ADR-001 — Monorepo עם pnpm workspaces
web, integration ו-domain חולקים טיפוסים וסכמה. ריפו אחד מבטיח שינוי אטומי של חוזה ה-DB. החלופה, ריפו נפרד לשירות האינטגרציה, נדחתה בשלב זה.

## ADR-002 — שירות אינטגרציה נפרד, ותור על Postgres
לפי דרישת הסטאק. התור מבוסס pg-boss (טבלאות ב-Postgres) ולא BullMQ/Redis, כדי לחסוך רכיב תשתית. ההחלטה תיבחן מחדש אם עומס ה-polling יגדל. ה-worker רץ כתהליך ארוך ולא כ-serverless.

## ADR-003 — TypeScript 5.9 במקום 7.0
TypeScript 7 הוא כתיבה מחדש (native) של הקומפיילר. typescript-eslint, Prisma ו-Next עלולים להסתמך על ה-API של TS 5.x. נעילה על 5.9.3 מקטינה סיכון. בדיקה מחדש בתום Sprint 2.

## ADR-004 — Prisma 7 (לא 8-rc)
אין להשתמש ב-RC ב-Production. Prisma 7 עובדת עם driver adapter (`@prisma/adapter-pg`). המיגרציות ב-dev ייווצרו עם `prisma migrate dev`, ובסביבות אחרות יופעלו רק דרך `migrate deploy` ב-CI באישור.

## ADR-005 — Better Auth
Auth.js (`next-auth`) בגרסה היציבה 4.x לא תוכננה ל-App Router, ו-v5 לא יצאה כגרסה יציבה. Better Auth יציבה, תומכת ב-Prisma וב-Next 16, וכוללת TOTP/MFA ו-organizations (S-01). **אושר (D-02):** אימייל וסיסמה, ללא SSO, ללא הרשמה ציבורית, ו-MFA לתפקידי ניהול. פירוט ב-A-02.

## ADR-006 — RTL ועברית
`<html dir="rtl" lang="he">`. ב-Tailwind משתמשים ב-logical properties (`ms-*`, `pe-*`). פורמט תאריכים, מספרים ומטבע דרך `Intl` עם locale `he-IL` ואזור זמן `Asia/Jerusalem`. ב-DB הזמנים נשמרים ב-UTC.

## ADR-007 — Priority רק דרך adapter עם mock
`packages/priority-client` מגדיר ממשק ומימוש mock שמבוסס על fixtures. עד שיתקבלו גישה לסביבת בדיקה ואישור (Q-05, Q-06), **לא תתבצע שום קריאה** ל-Priority.

## ADR-008 — ESLint 9 במקום 10
התוספים של `eslint-config-next` 16.4.0 עדיין לא מצהירים על תמיכה ב-ESLint 10 (נמדד, K-09). ננעל על 9.39.5. בדיקה מחדש כשהתוספים יתעדכנו.
