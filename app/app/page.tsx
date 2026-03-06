import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

function nextStep(profileExists: boolean, hasMasterBullets: boolean, hasTargetedResume: boolean) {
  if (!profileExists) return { href: "/app/profile", label: "Complete profile" };
  if (!hasMasterBullets) return { href: "/app/tools/fitrep-bullets", label: "Generate master bullets" };
  if (!hasTargetedResume) return { href: "/app/tools/resume-targeter", label: "Create targeted resume" };
  return { href: "/app/library", label: "Review your library" };
}

export default async function DashboardPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [profileRes, artifactsRes] = await Promise.all([
    supabase.from("profiles").select("id").eq("id", user.id).maybeSingle(),
    supabase.from("resume_artifacts").select("artifact_type").eq("user_id", user.id),
  ]);

  const artifactTypes = new Set((artifactsRes.data ?? []).map((row) => row.artifact_type));
  const step = nextStep(!!profileRes.data, artifactTypes.has("master_bullets"), artifactTypes.has("targeted_resume"));

  return (
    <main className="space-y-4">
      <section className="panel p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-2 text-[var(--muted)]">
          Follow the guided sequence to move from military record to targeted civilian resume.
        </p>
        <Link className="btn btn-primary mt-4 inline-flex" href={step.href}>
          Next Step: {step.label}
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="panel p-5">
          <h2 className="font-bold">Core Workflow</h2>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-[var(--muted)]">
            <li>Complete profile</li>
            <li>Upload/extract FITREP or EVAL</li>
            <li>Generate master bullets</li>
            <li>Paste job description</li>
            <li>Create targeted resume</li>
          </ol>
        </article>
        <article className="panel p-5">
          <h2 className="font-bold">Tools</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link className="btn btn-secondary text-sm" href="/app/tools/fitrep-bullets">FITREP Bullets</Link>
            <Link className="btn btn-secondary text-sm" href="/app/tools/mos-translator">MOS Translator</Link>
            <Link className="btn btn-secondary text-sm" href="/app/tools/jd-decoder">JD Decoder</Link>
            <Link className="btn btn-secondary text-sm" href="/app/tools/resume-targeter">Resume Targeter</Link>
          </div>
        </article>
      </section>
    </main>
  );
}

