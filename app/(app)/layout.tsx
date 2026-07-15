import { AppHeader } from "@/components/app-header";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let email: string | undefined;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email;
  } catch {
    // Supabase not configured yet — header still renders.
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader email={email} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
