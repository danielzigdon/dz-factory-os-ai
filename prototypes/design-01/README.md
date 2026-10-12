# DESIGN-01 — אבטיפוס חזותי (S01, S02, S03)

אבטיפוס לבדיקת עיצוב בלבד, לפי [`docs/12-dark-design-contract.md`](../../docs/12-dark-design-contract.md).
**אין כאן קוד Production:** אין DB, אין הזדהות אמיתית, אין Priority, ואין שליחת הודעות. כל הנתונים בדויים.

## הרצה

```bash
cd prototypes/design-01
npm ci
npm run build
npm run start          # http://localhost:3100  (/s01, /s02, /s03/C-101)
```

## בדיקות

```bash
npm run typecheck && npm run lint
npm run contrast       # שער ניגודיות לפי שימוש אמיתי בטוקנים (55 בדיקות מחייבות)
npx playwright test    # 105 בדיקות: פריסה, נגישות, אינטראקציות, הרשאות, תיקונים, ליטוש, צילומי מסך
```

Playwright מפעיל את השרת בעצמו (`npm run start`). הדפדפן הוא Chromium המותקן בסביבה (`/opt/pw-browsers/chromium`). אפשר להחליף אותו באמצעות `PW_CHROMIUM=/path/to/chrome`.
צילומי המסך נכתבים ל-`docs/design-01/screenshots/`.

## פקדי הדגמה (לא חלק מהמוצר)
- נפתחים מהסימון **"נתוני הדגמה"** בסרגל העליון (אזור הדגמה נפרד).
- **תפקיד (הדמיה):** מנהל/ת, ממלא/ת מקום או מכירות. הערך נשמר ב-cookie, והשרת בונה לפיו DTO שונה.
- **תרחיש:** רגיל, טעינה, ריק או שגיאה (`?state=`).

## מבנה
| נתיב | תוכן |
|---|---|
| `app/globals.css` | טוקני העיצוב (§2) כ-Tailwind `@theme`. מקור יחיד לצבעים |
| `components/shell.tsx` | AppShell, SideNav, MobileNav, NavDrawer, TopBar |
| `components/ui.tsx` | StatusBadge, StatCard, Panel, Button, DueDate, EmptyState, ErrorState, LoadingSkeleton, PermissionGuard, OwnerSelect, ConfirmationDialog, Toasts |
| `components/leads.tsx` | FilterBar + Search, LeadTable, LeadCard, DuplicateBadge, assign flow |
| `components/new-lead.tsx` | קליטת פנייה עם ולידציה וזיהוי כפילויות (A-01) |
| `app/s03/[id]/view.tsx` | כרטיס, טאבים, ActivityTimeline |
| `lib/server/*` | `server-only`: נתונים כספיים חסויים, DTO לפי תפקיד, session מדומה |
| `lib/fixtures.ts` | נתוני דמו דטרמיניסטיים. השעון קבוע ל-12.10.2026 10:00 |
| `tests/*` | Playwright + axe |
