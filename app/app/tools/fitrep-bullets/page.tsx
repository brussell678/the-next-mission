"use client";

import { FormEvent, useState } from "react";

type Output = {
  artifactId: string;
  bullets: { category: string; bullet: string; metrics_used: string[] }[];
  suggested_job_titles: string[];
  core_keywords: string[];
};

export default function FitrepBulletsPage() {
  const [pastedText, setPastedText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [result, setResult] = useState<Output | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const res = await fetch("/api/tools/fitrep-bullets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pastedText, targetRole: targetRole || null }),
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
        <h1 className="text-2xl font-bold">FITREP/EVAL {"->"} Bullets</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Do not upload SSN/DOB or sensitive personal data.</p>
      </section>
      <section className="panel p-6">
        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="space-y-1 block">
            <span className="text-sm font-medium">Target Role (optional)</span>
            <input className="input" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
          </label>
          <label className="space-y-1 block">
            <span className="text-sm font-medium">FITREP/EVAL text</span>
            <textarea
              className="input min-h-56"
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste extracted text here"
              required
            />
          </label>
          <button className="btn btn-primary" disabled={loading} type="submit">
            {loading ? "Generating..." : "Generate Master Bullets"}
          </button>
        </form>
      </section>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {result && (
        <section className="panel p-6 space-y-3">
          <p className="text-sm font-semibold text-[var(--accent)]">Artifact ID: {result.artifactId}</p>
          <h2 className="text-lg font-bold">Bullets</h2>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {result.bullets.map((b, idx) => (
              <li key={`${b.category}-${idx}`}>{b.bullet}</li>
            ))}
          </ul>
          <p className="text-sm">
            <span className="font-semibold">Suggested roles:</span> {result.suggested_job_titles.join(", ")}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Keywords:</span> {result.core_keywords.join(", ")}
          </p>
        </section>
      )}
    </main>
  );
}
