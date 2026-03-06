"use client";

import { FormEvent, useState } from "react";

export default function DocumentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("FITREP");
  const [documentId, setDocumentId] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function upload(e: FormEvent) {
    e.preventDefault();
    if (!file) return;

    setBusy(true);
    setStatus(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("doc_type", docType);

    const res = await fetch("/api/documents/upload", { method: "POST", body: formData });
    setBusy(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Upload failed" }));
      setStatus(err.error ?? "Upload failed");
      return;
    }
    const data = await res.json();
    setDocumentId(data.documentId);
    setStatus("Upload complete. Now run extract.");
  }

  async function extract() {
    if (!documentId) return;
    setBusy(true);
    setStatus(null);
    const res = await fetch(`/api/documents/${documentId}/extract`, { method: "POST" });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) {
      setStatus(data.error ?? "Extraction failed");
      return;
    }
    setStatus("Text extracted successfully.");
  }

  return (
    <main className="space-y-4">
      <section className="panel p-6">
        <h1 className="text-2xl font-bold">Documents</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Upload PDF FITREP/EVAL files, then extract text for bullet generation.
        </p>
      </section>

      <section className="panel p-6">
        <form onSubmit={upload} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium">Document Type</span>
              <select className="input" value={docType} onChange={(e) => setDocType(e.target.value)}>
                <option value="FITREP">FITREP</option>
                <option value="EVAL">EVAL</option>
                <option value="OTHER">OTHER</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">PDF</span>
              <input
                className="input"
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy || !file}>
            {busy ? "Working..." : "Upload Document"}
          </button>
        </form>
      </section>

      <section className="panel p-6">
        <label className="space-y-1">
          <span className="text-sm font-medium">Document ID</span>
          <input
            className="input"
            value={documentId}
            onChange={(e) => setDocumentId(e.target.value)}
            placeholder="Paste or use uploaded document ID"
          />
        </label>
        <button className="btn btn-secondary mt-3" type="button" onClick={extract} disabled={busy || !documentId}>
          {busy ? "Working..." : "Extract Text"}
        </button>
      </section>

      {status && <p className="text-sm text-[var(--accent)]">{status}</p>}
    </main>
  );
}

