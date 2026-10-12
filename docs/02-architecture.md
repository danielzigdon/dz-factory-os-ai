# ארכיטקטורה — Yuval Control

מצב: **אושר בתנאי (D-14, D-15)**. הזדהות לפי A-02. ה-mock של Priority הוא ברירת המחדל היחידה עד אישור נפרד.

## עקרונות
1. **Priority היא מקור האמת** להזמנות, פקודות עבודה, תעודות משלוח וחשבוניות. Yuval Control מחזיקה מראה (mirror) לקריאה ואת המידע שהיא עצמה מנהלת: פניות, הזדמנויות, הצעות, אישורים, האצלות ו-SLA.
2. **רק שירות האינטגרציה מדבר עם Priority.** אפליקציית ה-web לא מחזיקה credentials של Priority (S-03).
3. **כל כתיבה ל-Priority עוברת בתור עבודות**, עם `idempotency_key`, בדיקת קיום לפני ניסיון חוזר (P-02), ותיעוד ב-audit.
4. **הרשאות נאכפות בשרת**, ברמת משאב וברמת שדה (S-02).
5. **לוגיקה עסקית טהורה** (מכונות מצב, תמחור, SLA) נמצאת בחבילת `domain`, בלי תלות ב-DB או ב-UI, כך שאפשר לבדוק אותה ביחידה.

## תרשים רכיבים

```mermaid
flowchart LR
  subgraph Users["משתמשים (דפדפן, RTL)"]
    U1[מנהל] --- U2[איש מכירות] --- U3[ממלא מקום] --- U4[אחראי ייצור]
  end
  subgraph Channels["ערוצי פניות"]
    C1[טופס אתר] --- C2[מייל] --- C3["WhatsApp (Q-10)"]
  end
  subgraph App["apps/web — Next.js"]
    W1[UI: RSC + shadcn/ui]
    W2[Server Actions / Route Handlers]
    W3["AuthZ (RBAC + field-level)"]
    W4["/api/intake (HMAC, rate-limit)"]
  end
  subgraph Worker["apps/integration — Node worker"]
    I1[pg-boss job runner]
    I2[Priority adapter + mapping]
    I3[SLA / escalation scheduler]
    I4[Notifications dispatcher]
  end
  DB[(PostgreSQL)]
  PR[(Priority ERP)]
  Users --> W1 --> W2 --> W3 --> DB
  Channels --> W4 --> DB
  W2 -- enqueue jobs --> DB
  DB -- jobs --> I1
  I1 --> I2 -- "REST/OData (read; write from S5+)" --> PR
  I1 --> I3 --> DB
  I1 --> I4
```

## זרימת כתיבה ל-Priority (Sprint 5+)

```mermaid
sequenceDiagram
  participant W as web
  participant DB as Postgres
  participant I as integration
  participant P as Priority
  W->>DB: quote ACCEPTED_CUSTOMER → SYNC_PENDING + job(idempotency_key)
  I->>DB: lock job (pg-boss)
  I->>P: lookup by idempotency_key (custom field, P-02)
  alt כבר קיים
    I->>DB: SYNCED + external_document_id
  else לא קיים
    I->>P: create document
    alt timeout / 5xx
      I->>P: lookup שוב לפני retry
    end
    I->>DB: SYNCED / FAILED (+audit)
  end
```

## מבנה תיקיות מוצע (pnpm workspaces)

```
dz-factory-os-ai/
├── apps/
│   ├── web/                 # Next.js (App Router), UI + Server Actions, RTL
│   │   ├── app/(auth)/ app/(dashboard)/s01..s12/
│   │   ├── components/ui/   # shadcn/ui (קוד מקומי)
│   │   └── lib/authz/       # בדיקות הרשאה ומיסוך שדות
│   └── integration/         # Node worker: pg-boss, Priority adapter, SLA, התראות
│       ├── src/jobs/ src/priority/ src/sla/
│       └── test/fixtures/   # תגובות Priority מוקלטות/מדומות (ללא מערכת חיה)
├── packages/
│   ├── db/                  # Prisma schema, migrations, seed (dev בלבד)
│   ├── domain/              # מכונות מצב, תמחור, SLA, idempotency — TS טהור
│   ├── priority-client/     # typed client + mock server לפי חוזה
│   └── config/              # tsconfig, eslint, prettier משותפים
├── docs/                    # מסמכי שלב 0 (זה)
├── scripts/                 # בדיקות עקביות מסמכים וכלים
└── docker-compose.yml       # Postgres מקומי לפיתוח בלבד (Sprint 1)
```

## סביבות
| סביבה | DB | Priority | הערה |
|---|---|---|---|
| local | Postgres ב-Docker | mock (`priority-client/mock`) | ברירת מחדל |
| staging | Postgres מנוהל | **סביבת בדיקה של Priority בלבד** (Q-06) | נפתחת ב-Sprint 4 |
| production | מנוהל + גיבויים (Q-11) | חיה, קריאה בלבד עד Sprint 5 | **לא בשלב 0** |

אירוח (Vercel, Azure או שרת מקומי) עדיין לא הוכרע (Q-12). ה-worker צריך תהליך שרץ ברציפות, ולכן הוא לא יכול לרוץ כפונקציית serverless.
