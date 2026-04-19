import { AppNav } from "@/components/AppNav";
import { AuthGate } from "@/components/AuthGate";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50">
        <AppNav />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </div>
    </AuthGate>
  );
}
