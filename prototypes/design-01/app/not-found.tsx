import Link from "next/link";
export default function NotFound() {
  return (
    <div role="alert" className="py-16 text-center">
      <h1 className="text-xl font-bold">הרשומה לא נמצאה</h1>
      <p className="mt-2 text-text-secondary">ייתכן שהקישור שגוי. בגרסת ההדגמה קיימים רק נתונים בדויים.</p>
      <Link href="/s02" className="mt-4 inline-flex min-h-11 items-center rounded-input bg-primary px-4 font-semibold text-bg">חזרה למרכז הפניות</Link>
    </div>
  );
}
