# אתר החברה תצוגה ראשונה ובדיקות

26.10.2026. גרסת עיצוב והדגמה בלבד, לא אתר ציבורי סופי.

## תוצרים שנשמרו
- prototypes/design-01/public/company-preview/index.html: אתר עברי RTL עצמאי, ניווט, פתיחה, שירותים, אודות, תהליך, הדמיות גימור, שאלות, טופס הדגמה, פרטיות ונגישות.
- logo.png: עיבוד של הלוגו שסיפק דניאל. יש להעדיף קובץ מותג מקורי בהמשך.
- mobile-preview.html: עותק בדיקת פריסה ברוחב 390 פיקסלים עם סגנונות המסך הצר. זהו מתקן CSS לבדיקה, לא אמולציית מכשיר ולא הוכחת בדיקת Safari או טלפון אמיתי. עותק זה אינו מקור האפליקציה ויש לעדכנו או להסירו כשמשנים את האתר.

## פריסה
- קומיט אתר ראשון: 9fa5e3229b40b5bb7e4150e1ce831100f3845b26.
- קיצור כפתור ניווט בנייד: a88ea62f8c9adbadbd0c8bced6ed585a95698a29.
- קומיט תצוגת הבדיקה: e61c5209c17d7a7f77c6b28274fee90f82e158b1.
- פריסה: dpl_61PepWWH7nQnhCxgWUDaaKUQ7fTn, READY, target null (Preview).
- קישור: https://yuval-control-preview-7jzfuwtv0-danielzigdon11-7703.vercel.app/company-preview/index.html
- הגנת התחברות Vercel נבדקה ונותרה פעילה לכל הפריסות. קיים noindex,nofollow. לא בוצעה פריסת Production.

## תוצאות שנצפו בפועל
| בדיקה | תוצאה |
|---|---|
| תחביר JavaScript | node --check עבר |
| מבנה סטטי | מזהים ייחודיים, קישורים פנימיים קיימים, h1 יחיד, ללא כתובות משאבים חיצוניות |
| טעינת האתר והלוגו | אומתה בדפדפן הענן |
| רוחב מחשב 1348px | scrollWidth=clientWidth=1348, ללא גלישה אופקית של העמוד |
| טופס ריק | שלוש שגיאות שדה ומיקוד בשדה הראשון |
| טופס עם נתונים סינתטיים | הודעת תקינות המבהירה שאין שליחה או שמירה; המיקוד הועבר להודעה |
| חלון פרטיות | שם נגיש מתאים; Escape סגר והחזיר מיקוד לכפתור פרטיות |
| שאלות נפוצות | פתיחה נצפתה |
| מתקן פריסה צר | bodyWidth=bodyScrollWidth=390; ניווט 354px; כפתור ההצעה נשאר במבנה |
| תפריט צר | נפתח, aria-expanded=true; Escape סגר והחזיר מיקוד לכפתור |
| משאבים בקוד וב־DOM | אין script[src] או תמונה חיצונית; CSP מגביל connect-src ו־form-action ל־none |

בדיקות ההתנהגות בטופס ובחלון בוצעו בפריסה הראשונה; אחריה השתנו רק תווית כפתור הניווט ומתקן בדיקת התצוגה. הפריסה העדכנית נפתחה ונבדקה חזותית. בדיקת DOM וקוד אינה לכידת רשת מלאה. בשורת השגיאות של הדפדפן הופיעו שגיאות של הרחבת הדפדפן; אין לייחס אותן לקוד האתר.

ניסיון ראשוני להציג את האתר ב־iframe נחסם בהגנת המסגור. לא בוטלה ההגנה; מתקן הבדיקה הוחלף בעמוד עצמאי.

## מה לא נבדק ולא הושלם
- אין טענה לעמידת WCAG מלאה, ציון Lighthouse, Core Web Vitals, בדיקת חדירה או בדיקת מכשירי Safari/Firefox.
- עדיין אין גלריית עבודות אמיתית, מידע עסקי סופי, תעודות או המלצות מאושרות, פרטי קשר ציבוריים, קליטת פניות בשרת, מייל/WhatsApp אמיתי, גיבוי או מדיניות פרטיות סופית.
- הגלריה והגרפיקה הן הדמיות מסומנות, ולא הוכחת פרויקטים או יכולות.
- אין Priority או מסד נתונים. אין להשתמש במידע אמיתי בטופס.
- ביקורת Claude טרם אומתה. הבקשה נפתחה ב־https://github.com/danielzigdon/dz-factory-os-ai/issues/1 עם אזכור @claude; אין להניח שהסוכן הופעל או קרא אותה עד תגובה בפועל.

## משימות ההמשך
1. Claude: לקרוא את האפיון והקוד, לתעד פערים וביקורת במשימה וב־CLAUDE.md.
2. לתקן פערים שיימצאו, להרחיב בדיקות נגישות ומסכים, ולאמת במכשירים אמיתיים.
3. להכין רשימת חומרים ממוקדת לדניאל במקום להמציא פרטים עסקיים.
4. להוסיף רק חומרים שאושרו ולהגדיר קליטת פניות כאשר ההיקף מורשה.
5. עלייה ציבורית רק באישור נפרד. אין להתחיל Sprint 1 הפנימי או לשנות פרויקט אחר.

## WEB-FIX-01 — עדכון Claude (26.10.2026)
- **רוחב 320:** כפתור התפריט (☰) חרג 20 פיקסלים משמאל. נוספה נקודת שבירה `max-width:359px` שמצמצמת רווחים, את כפתור ההצעה ואת כותרת המותג, ומסתירה את שורת התיאור הקטנה ליד הלוגו. התוכן והטקסטים לא שונו.
- **לוגו:** הקובץ המוצג עבר להיות `logo.png` בגודל 96×125 (11.7KB, במקום 704KB). הקובץ המקורי נשמר כ-`docs/design-01/brand/logo-source.png`, מחוץ לתיקייה הנפרסת.
- **`mobile-preview.html` הוסר.** במקומו נוספו בדיקות אוטומטיות ב-`prototypes/design-01/tests/website.spec.ts`:
  - רוחבים 320, 360, 390, 768 ו-1440: RTL, אין גלישה, אין רכיב מחוץ למסך, axe WCAG 2.2 AA נקי, אפס בקשות חיצוניות.
  - טקסט ב-200%.
  - משקל הלוגו ושם נגיש.
  - תפריט ו-Esc.
  - טופס: ולידציה, אין שליחה, והודעה שזו הדגמה.
  - חלון פרטיות ו-Esc.
  - כותרות הגנה ו-CSP.

## Independent continuation check — 2026-10-27

Protected READY Preview dpl_9orJ9GjufdyieorxLcdciAFc1AbU at source 2f18d078e5be24906cc61231cc24094ac2399b9f includes Claude's SEC/WEB fixes and ChatGPT's dialog fix. Website URL: https://yuval-control-preview-ghgm0iela-danielzigdon11-7703.vercel.app/company-preview/index.html

Cloud-browser checks: company home renders; logo decoded at 96×125; no desktop overflow (clientWidth=scrollWidth=1348); robots noindex,nofollow; empty form shows three invalid fields and focuses name. CRM S01/S02/S03 rendered. Assignment dialog now has the correct accessible name, two mounted heading IDs are unique, assignment changes the demo row to Noa, and new-lead dialog has its own accessible name. Vercel project protection remains enabled for all deployments.

New assertions were committed to tests/interactions.spec.ts, but were not run in ChatGPT's dependency-free local checkout; independent Claude execution requested in issue #1. Prior 117/117, contrast 55/55 and viewport/axe results are Claude's recorded results before this focused dialog fix. No Safari/Firefox, real-device, screen-reader or performance acceptance is implied. Docs18/19 now include the review gaps and content map. Public content approval and actual intake remain pending; no Production or Sprint 1.
