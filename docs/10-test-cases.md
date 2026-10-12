# מקרי בדיקה — זיהוי כפילויות, הרשאות, ממלא מקום

עדיין אין קוד יישומי. המקרים כתובים בפורמט Given/When/Then, ויהפכו לבדיקות Vitest (חבילת `domain`) ו-Playwright (E2E) ב-Sprint 1 וב-Sprint 2. כל מקרה מפנה לתיקון שהוא בודק (A-xx) ולתנאי הקבלה שלו (AC).
ערכים מספריים נלקחים מ-`settings`. הבדיקות לא מקודדות אותם ישירות.

## זיהוי כפילויות (A-01 · AC1.3)
| ID | Given | When | Then |
|---|---|---|---|
| TC-DUP-01 | לקוח קיים עם business_id תקין `516123452`, ללא priority_customer_id | ליד מטופס האתר עם `51-612345-2` | business_id מנורמל ל-`516123452`, `customer_match=exact`, הליד בתור "לבדיקה וקישור", **0** לקוחות חדשים |
| TC-DUP-02 | ליד מ-TC-DUP-01 פתוח | ליד מ-WhatsApp עם אותו business_id | שורת `lead_duplicates(rule=business_id)` אחת, **0** לקוחות חדשים (UAT 1) |
| TC-DUP-03 | — | business_id עם ספרת ביקורת שגויה (`516123453`) | `business_id=NULL`, `business_id_raw` נשמר, אין התאמה לפי מזהה עסק |
| TC-DUP-04 | לקוח עם טלפון `+972501234567` | ליד עם `050-123-4567`, בלי business_id | `customer_match=suspected`, `lead_duplicates(rule=phone)`, **customer_id נשאר NULL**, אין מיזוג |
| TC-DUP-05 | לקוח עם אימייל `Info@Acme.co.il ` | ליד עם `info@acme.co.il` | חשד לכפילות לפי email, אין מיזוג אוטומטי |
| TC-DUP-06 | — | ליד בלי business_id, טלפון או אימייל תואם | ליד חדש עם `customer_match=none` ו-`customer_id=NULL` |
| TC-DUP-07 | ליד ללא ח.פ. מגיע ל-QUALIFIED | מעבר סטטוס | נחסם עד שמתועד חיפוש לקוח ידני. אחרי החיפוש נוצר לקוח פנימי עם `priority_customer_id=NULL` |
| TC-DUP-08 | ליד A עם 2 משימות, 3 interactions והצעה. ליד B שורד | משתמש עם `leads:merge` ממזג את A לתוך B | כל 6 הרשומות מקושרות ל-B. A נשאר עם `status=MERGED` ו-`merged_into_id=B`. audit אחד. בעלי B ללא שינוי |
| TC-DUP-09 | שני לקוחות עם priority_customer_id שונה | ניסיון מיזוג | נחסם, נוצרת התראה למנהל, אין שינוי בנתונים |
| TC-DUP-10 | משתמש ללא `leads:merge` | קריאה ישירה ל-Server Action של מיזוג | 403, אין שינוי |
| TC-DUP-11 | שתי בקשות קליטה זהות במקביל | race | ליד אחד לכל event (idempotency לפי מזהה ההודעה בערוץ) |

## הזדהות והרשאות (A-02, A-07 · AC1.4–AC1.6)
| ID | Given | When | Then |
|---|---|---|---|
| TC-AUTH-01 | — | POST ל-endpoint ההרשמה של Better Auth | 4xx, אין משתמש חדש |
| TC-AUTH-02 | הזמנה תקפה לתפקיד manager | המוזמן מגדיר סיסמה בלי TOTP | אין session עד ש-TOTP מוגדר ומאומת |
| TC-AUTH-03 | הזמנה שפג תוקפה או כבר נוצלה | שימוש בטוקן | נדחה. שימוש חוזר נדחה גם הוא |
| TC-AUTH-04 | — | בקשת איפוס לאימייל קיים ולאימייל שאינו קיים | תגובה וזמן תגובה זהים (סטייה ≤ 100ms בממוצע על 20 ניסיונות) |
| TC-AUTH-05 | טוקן איפוס אחרי תפוגה או אחרי שימוש | איפוס | נדחה |
| TC-AUTH-06 | 2 sessions פעילים | איפוס סיסמה מוצלח | שני ה-sessions מבוטלים |
| TC-AUTH-07 | — | 5 כניסות שגויות ב-15 דקות | הניסיון השישי נחסם גם עם סיסמה נכונה. audit והתראה למנהל |
| TC-AUTH-08 | עובד מחובר | מנהל מסמן `active=false` | הבקשה הבאה של העובד מקבלת 401. sessions=0. הלידים שלו בתור "ללא אחראי" |
| TC-AUTH-09 | session ללא פעילות מעבר לתפוגה המוגדרת (שעון מדומה) | בקשה | 401 |
| TC-AUTH-10 | מטריצה: כל תפקיד × משאב × פעולה | קריאה **ישירה לשרת**, בלי ממשק | 403 בכל מקום שאין הרשאה (AC1.4) |
| TC-AUTH-11 | תפקיד sales ו-deputy | GET להצעה או ללקוח | ב-JSON אין `cost`, `margin`, `estimated_cost` או `supplier_price` (בדיקה רקורסיבית של המפתחות) |
| TC-AUTH-12 | deputy | `quotes:approve`, `approvals:decide`, `supplier_prices:write`, `margin:read`, `users:invite` | 403 לכל אחת (A-07, UAT 2) |
| TC-AUTH-13 | תפקיד עם `leads:assign` scope=all | כניסה בלי MFA | נחסם |

## ממלא מקום, SLA והעברת אחריות (A-09 · AC2.1–AC2.5)
שעון מדומה, `business_calendar` בימים א'–ה' 08:00–17:00 [נתון בדיקה בלבד, Q-02].

| ID | Given | When | Then |
|---|---|---|---|
| TC-DEL-01 | למנהל 4 לידים פתוחים | הפעלת מצב היעדרות ידני | ב-4 הלידים `acting_owner_id=deputy` ו-`original_owner_id=manager`. נרשמו 4 `ownership_transfers(reason=manual_absence)` |
| TC-DEL-02 | TC-DEL-01 | ה-deputy מנסה לאשר הצעה או לצפות ברווח | 403 (ההעברה לא מעניקה הרשאות) |
| TC-DEL-03 | ליד נכנס ביום ג' ב-10:00, ללא טיפול | 10:30 | התראת L1 **אחת** למנהל ולממלא המקום |
| TC-DEL-04 | TC-DEL-03, `sla_auto_transfer=true` | 11:00 | העברה זמנית אחת עם `reason=sla_auto`, והתראת L2 אחת |
| TC-DEL-05 | TC-DEL-04, `sla_auto_transfer=false` | 11:00 | אין העברה. התראה מוסלמת אחת לערוץ החלופי |
| TC-DEL-06 | TC-DEL-04 | שעון מתקדם ב-24 שעות | **0** התראות נוספות על אותו אירוע |
| TC-DEL-07 | שני workers מריצים את אותו job במקביל | L1 | שורת `notifications` אחת (UNIQUE event_id). ה-INSERT השני נכשל בשקט |
| TC-DEL-08 | ליד נכנס ביום ה' ב-16:50 | — | L1 ביום א' ב-08:20 (רק שעות פעילות נספרות) |
| TC-DEL-09 | ליד ב-10:00 | ב-10:10 נפתח כרטיס בלבד | ה-SLA ממשיך, L1 ב-10:30 |
| TC-DEL-10 | ליד ב-10:00 | ב-10:10 שיבוץ ושיחה מתועדת | אין L1 ואין L2 |
| TC-DEL-11 | היעדרות פעילה. ה-deputy השלים משימה אחת, משימה אחת פתוחה, ויצר הזדמנות | סיום ההיעדרות | הלידים: `acting_owner_id=NULL` עם `returned_at`. המשימה הפתוחה עוברת לבעלים. המשימה שהושלמה נשארת עם `completed_by=deputy`. בעלי ההזדמנות = manager. **0** רשומות נמחקו |
| TC-DEL-12 | היעדרות עם `end_at` בעבר | job חוזר רץ פעמיים | ההחזרה מתבצעת פעם אחת (idempotent) |
