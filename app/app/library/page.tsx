import { supabaseServer } from "@/lib/supabase/server";

export default async function LibraryPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("resume_artifacts")
    .select("id,artifact_type,title,created_at,content")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(25);

  return (
    <main className="space-y-4">
      <section className="panel p-6">
        <h1 className="text-2xl font-bold">Library</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Saved master bullets and targeted resumes.</p>
      </section>
      <section className="space-y-3">
        {(data ?? []).map((item) => (
          <article key={item.id} className="panel p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">{item.artifact_type}</p>
            <h2 className="mt-1 font-bold">{item.title}</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">{new Date(item.created_at).toLocaleString()}</p>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-md bg-[#f5f8f6] p-3 text-sm">
              {item.content}
            </pre>
          </article>
        ))}
        {!data?.length && <p className="panel p-5 text-sm text-[var(--muted)]">No artifacts yet.</p>}
      </section>
    </main>
  );
}

