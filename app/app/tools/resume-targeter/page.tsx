"use client";

import { FormEvent, useState } from "react";

type Output = {
  artifactId: string;
  targeted_resume: string;
  keywords_added: string[];
  changes_made: string[];
  ats_alignment_notes: string[];
};

export default function ResumeTargeterPage() {
  const [masterBulletsArtifactId, setMasterBulletsArtifactId] = useState("");
  const [pastedResumeText, setPastedResumeText] = useState("");
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [result, setResult] = useState<Output | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    const res = await fetch("/api/tools/resume-targeter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        masterBulletsArtifactId: masterBulletsArtifactId || undefined,
        pastedResumeText: pastedResumeText || undefined,
        jobDescriptionText,
        company: company || null,
        jobTitle: jobTitle || null,
      }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Request failed");
      return;
    }
    setResult(data as Output);
  }

  return (
    <main className="space-y-4">
      <section className="panel p-6">
        <h1 className="text-2xl font-bold">Resume Targeter</h1>
      </section>
      <section className="panel p-6">
        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="space-y-1 block">
            <span className="text-sm font-medium">Master Bullets Artifact ID (optional)</span>
            <input
              className="input"
              value={masterBulletsArtifactId}
              onChange={(e) => setMasterBulletsArtifactId(e.target.value)}
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-sm font-medium">Pasted Resume/Master Text (optional if artifact ID used)</span>
            <textarea className="input min-h-40" value={pastedResumeText} onChange={(e) => setPastedResumeText(e.target.value)} />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium">Company (optional)</span>
              <input className="input" value={company} onChange={(e) => setCompany(e.target.value)} />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Job Title (optional)</span>
              <input className="input" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            </label>
          </div>
          <label className="space-y-1 block">
            <span className="text-sm font-medium">Job Description</span>
            <textarea
              className="input min-h-56"
              value={jobDescriptionText}
              onChange={(e) => setJobDescriptionText(e.target.value)}
              required
            />
          </label>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Generating..." : "Generate Targeted Resume"}
          </button>
        </form>
      </section>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {result && (
        <section className="panel p-6 space-y-3">
          <p className="text-sm font-semibold text-[var(--accent)]">Artifact ID: {result.artifactId}</p>
          <h2 className="font-bold">Targeted Resume</h2>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-[#f5f8f6] p-3 text-sm">{result.targeted_resume}</pre>
        </section>
      )}
    </main>
  );
}

