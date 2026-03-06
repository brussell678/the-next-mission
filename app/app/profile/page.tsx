"use client";

import { FormEvent, useEffect, useState } from "react";

type Profile = {
  branch: string;
  mos: string;
  rank: string;
  separation_date: string;
  career_interests: string;
  location_pref: string;
};

const initialState: Profile = {
  branch: "USMC",
  mos: "",
  rank: "",
  separation_date: "",
  career_interests: "",
  location_pref: "",
};

export default function ProfilePage() {
  const [form, setForm] = useState<Profile>(initialState);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/profile");
      if (!res.ok) return;
      const data = await res.json();
      if (!data.profile) return;
      setForm({
        branch: data.profile.branch ?? "USMC",
        mos: data.profile.mos ?? "",
        rank: data.profile.rank ?? "",
        separation_date: data.profile.separation_date ?? "",
        career_interests: (data.profile.career_interests ?? []).join(", "),
        location_pref: data.profile.location_pref ?? "",
      });
    }
    void load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    const payload = {
      branch: form.branch,
      mos: form.mos || null,
      rank: form.rank || null,
      separation_date: form.separation_date || null,
      career_interests: form.career_interests
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      location_pref: form.location_pref || null,
    };

    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to save profile" }));
      setStatus(err.error ?? "Failed to save profile");
      return;
    }
    setStatus("Profile saved.");
  }

  return (
    <main className="panel p-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Used to improve context quality for all tool outputs.
      </p>

      <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <label className="space-y-1">
          <span className="text-sm font-medium">Branch</span>
          <input
            className="input"
            value={form.branch}
            onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))}
            required
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">MOS</span>
          <input
            className="input"
            value={form.mos}
            onChange={(e) => setForm((f) => ({ ...f, mos: e.target.value }))}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Rank</span>
          <input
            className="input"
            value={form.rank}
            onChange={(e) => setForm((f) => ({ ...f, rank: e.target.value }))}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Separation Date</span>
          <input
            className="input"
            type="date"
            value={form.separation_date}
            onChange={(e) => setForm((f) => ({ ...f, separation_date: e.target.value }))}
          />
        </label>
        <label className="space-y-1 md:col-span-2">
          <span className="text-sm font-medium">Career Interests (comma-separated)</span>
          <input
            className="input"
            value={form.career_interests}
            onChange={(e) => setForm((f) => ({ ...f, career_interests: e.target.value }))}
          />
        </label>
        <label className="space-y-1 md:col-span-2">
          <span className="text-sm font-medium">Location Preference</span>
          <input
            className="input"
            value={form.location_pref}
            onChange={(e) => setForm((f) => ({ ...f, location_pref: e.target.value }))}
          />
        </label>
        <div className="md:col-span-2">
          <button className="btn btn-primary" disabled={saving} type="submit">
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>

      {status && <p className="mt-4 text-sm text-[var(--accent)]">{status}</p>}
    </main>
  );
}

