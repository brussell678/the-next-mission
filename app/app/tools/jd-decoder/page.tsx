"use client";

import { FormEvent, useState } from "react";

type Output = {
  plain_english_summary: string;
  must_haves: string[];
  nice_to_haves: string[];
  keywords: string[];
  role_level_guess: string;
  likely_interview_questions: string[];
};

export default function JdDecoderPage() {
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [result, setResult] = useState<Output | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    const res = await fetch("/api/tools/jd-decoder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobDescriptionText }),
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
        <h1 className="text-2xl font-bold">JD Decoder</h1>
      </section>
      <section className="panel p-6">
        <form className="space-y-4" onSubmit={onSubmit}>
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
            {loading ? "Decoding..." : "Decode JD"}
          </button>
        </form>
      </section>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {result && (
        <section className="panel p-6 space-y-2">
          <p className="font-semibold">{result.plain_english_summary}</p>
          <p className="text-sm"><span className="font-semibold">Role level:</span> {result.role_level_guess}</p>
          <p className="text-sm"><span className="font-semibold">Keywords:</span> {result.keywords.join(", ")}</p>
        </section>
      )}
    </main>
  );
}

