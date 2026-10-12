import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/shell";
import { currentRole } from "@/lib/server/session";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = { title: "Yuval Control — אבטיפוס DESIGN-01", robots: { index: false, follow: false } };
export const viewport: Viewport = { themeColor: "#080F18", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const role = await currentRole();
  return (
    <html lang="he" dir="rtl">
      <body>
        <StoreProvider initialRole={role}>
          <Suspense>
            <AppShell>{children}</AppShell>
          </Suspense>
        </StoreProvider>
      </body>
    </html>
  );
}
