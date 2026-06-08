"use client";

import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadState = "idle" | "dragging" | "uploading" | "success" | "error";

const ACCEPTED = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_MB = 20;

export default function UploadPage() {
  const [state, setState] = useState<UploadState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [bureau, setBureau] = useState<"Equifax" | "TransUnion" | "Experian" | "">("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function validateFile(f: File): string | null {
    if (!ACCEPTED.includes(f.type)) return "Only PDF, JPG, PNG, or WEBP files are accepted.";
    if (f.size > MAX_MB * 1024 * 1024) return `File must be under ${MAX_MB} MB.`;
    return null;
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const f = files[0];
    const err = validateFile(f);
    if (err) { setError(err); return; }
    setFile(f);
    setError("");
    setState("idle");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setState("idle");
    handleFiles(e.dataTransfer.files);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !bureau) return;
    setState("uploading");
    setError("");

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("bureau", bureau);

      const res = await fetch("/api/credit-report/upload", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }
      setState("success");
      setFile(null);
      setBureau("");
    } catch (err: any) {
      setError(err.message ?? "Upload failed. Please try again.");
      setState("error");
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl space-y-6">
      <div>
        <p className="section-label mb-1">Credit Reports</p>
        <h1 className="text-2xl font-bold text-white">Upload Credit Report</h1>
        <p className="text-slate-400 text-sm mt-1">Upload your credit report PDF or screenshot for AI analysis</p>
      </div>

      {/* Info banner */}
      <div className="card p-4 flex items-start gap-3 border-brand-gold/10 bg-brand-gold/5">
        <Info className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-400 leading-relaxed">
          Download your free annual credit report from AnnualCreditReport.com. Upload one report per bureau. Our AI will extract and analyze all negative items automatically.
        </p>
      </div>

      {state === "success" ? (
        <div className="card p-10 flex flex-col items-center text-center gap-4">
          <CheckCircle2 className="w-12 h-12 text-status-active" />
          <div>
            <h2 className="text-lg font-semibold text-white">Report Uploaded</h2>
            <p className="text-slate-400 text-sm mt-1">Your report is queued for AI analysis. Check back in a few minutes.</p>
          </div>
          <button onClick={() => setState("idle")} className="btn-gold">Upload Another</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Bureau selector */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Which bureau is this report from?</label>
            <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Credit bureau selection">
              {(["Equifax", "TransUnion", "Experian"] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  role="radio"
                  aria-checked={bureau === b}
                  onClick={() => setBureau(b)}
                  className={cn(
                    "p-3 rounded-xl border text-sm font-medium transition-all",
                    bureau === b
                      ? "bg-brand-gold/10 border-brand-gold/40 text-brand-gold-2"
                      : "bg-surface-1 border-white/[0.06] text-slate-400 hover:border-white/20"
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Drop zone */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Report file</label>
            <div
              role="button"
              aria-label="Drop zone for credit report file upload"
              tabIndex={0}
              onDragOver={(e) => { e.preventDefault(); setState("dragging"); }}
              onDragLeave={() => setState("idle")}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
              className={cn(
                "card p-10 flex flex-col items-center justify-center gap-3 cursor-pointer border-2 border-dashed transition-all",
                state === "dragging" ? "border-brand-gold/50 bg-brand-gold/5" : "border-white/10 hover:border-white/25"
              )}
            >
              {file ? (
                <>
                  <FileText className="w-8 h-8 text-brand-gold" />
                  <p className="text-sm font-medium text-white">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-500" />
                  <p className="text-sm text-slate-400">Drag &amp; drop or <span className="text-brand-gold-2 underline">browse</span></p>
                  <p className="text-xs text-slate-600">PDF, JPG, PNG, WEBP — max {MAX_MB} MB</p>
                </>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
              aria-label="File input"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-status-cancelled" role="alert">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!file || !bureau || state === "uploading"}
            className="btn-gold w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {state === "uploading" ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
            ) : (
              <><Upload className="w-4 h-4" /> Upload Report</>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
