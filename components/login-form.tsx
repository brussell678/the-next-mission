"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

export function LoginForm({ error }: { error?: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const redirectTo = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/auth/confirm?next=/app`;
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const supabase = supabaseBrowser();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    setLoading(false);
    if (authError) {
      setMessage(authError.message);
      return;
    }
    setMessage("Check your email for the sign-in link.");
  }

  return (
    <section className="panel w-full p-8 md:p-10">
      <p className="text-xs font-semibold tracking-wider text-[var(--accent)]">THE NEXT MISSION</p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Sign in to your workspace</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        We send a secure magic link. No password required.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block space-y-1">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            required
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Sending..." : "Send magic link"}
        </button>
      </form>
      {(error || message) && (
        <p className="mt-4 rounded-md bg-[#fff7e6] px-3 py-2 text-sm text-[var(--warn)]">
          {error ?? message}
        </p>
      )}
      <p className="mt-6 text-sm text-[var(--muted)]">
        Need context first? <Link href="/" className="font-semibold text-[var(--accent)]">View overview</Link>
      </p>
    </section>
  );
}

