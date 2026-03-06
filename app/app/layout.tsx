import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { AppNav } from "@/components/app-nav";
import { supabaseServer } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-6xl px-6 py-6 md:px-8">
      <header className="panel mb-6 flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-[var(--accent)]">THE NEXT MISSION</p>
          <p className="text-sm text-[var(--muted)]">{user.email}</p>
        </div>
        <AppNav />
        <form action="/api/auth/signout" method="post">
          <button className="btn btn-secondary text-sm" type="submit">
            Sign Out
          </button>
        </form>
      </header>
      {children}
    </div>
  );
}

