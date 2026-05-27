"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// ---- Auth ----

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

// ---- Admin: letter approval ----

export async function approveLetters(letterIds: number[]) {
  const webhookUrl = process.env.N8N_APPROVAL_WEBHOOK;
  if (!webhookUrl) throw new Error("N8N_APPROVAL_WEBHOOK is not set.");

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ letter_ids: letterIds }),
  });

  if (!res.ok) {
    throw new Error(`Approval webhook failed (${res.status}): ${await res.text()}`);
  }

  revalidatePath("/admin");
  revalidatePath("/portal");
  return res.json().catch(() => ({ ok: true }));
}

// ---- Admin: reject/flag letter for rewrite ----

export async function rejectLetter(letterId: number, reason: string) {
  const supabase = await createClient();
  await supabase
    .from("dispute_letters")
    .update({ letter_status: "needs_rewrite", lint_violations: [reason], updated_at: new Date().toISOString() })
    .eq("letter_id", letterId);

  revalidatePath("/admin");
}

// ---- Client: record score snapshot ----

export async function recordScoreSnapshot(
  caseId: string,
  scores: { bureau: "experian" | "transunion" | "equifax"; score: number; model?: string }[]
) {
  const supabase = await createClient();
  const rows = scores.map((s) => ({
    case_id: caseId,
    bureau: s.bureau,
    score: s.score,
    score_model: s.model ?? "FICO 8",
  }));
  const { error } = await supabase.from("score_history").insert(rows);
  if (error) throw new Error(error.message);
  revalidatePath("/portal");
  revalidatePath("/portal/score");
}

// ---- Client: save legal letter request ----

export async function saveLegalLetter(data: {
  caseId: string | null;
  letterType: string;
  powerRating: "medium" | "strong" | "nuclear";
  recipientName: string;
  recipientAddr: string;
  violationDesc: string;
  letterBody: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("legal_letter_requests").insert({
    case_id: data.caseId,
    letter_type: data.letterType,
    power_rating: data.powerRating,
    recipient_name: data.recipientName,
    recipient_addr: data.recipientAddr,
    violation_desc: data.violationDesc,
    letter_body: data.letterBody,
  });
  if (error) throw new Error(error.message);
}

// ---- Trigger n8n workflow via webhook ----

export async function triggerN8nWorkflow(webhookEnvVar: string, payload: Record<string, unknown>) {
  const webhookUrl = process.env[webhookEnvVar];
  if (!webhookUrl) throw new Error(`${webhookEnvVar} is not set.`);

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Webhook ${webhookEnvVar} failed (${res.status}): ${await res.text()}`);
  }

  return res.json().catch(() => ({ ok: true }));
}

// ---- Client: request case cancellation (CROA 3-day window) ----

export async function requestCancellation(caseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Verify case belongs to this user and is still in cooling_off
  const { data: caseData } = await supabase
    .from("cases")
    .select("case_status, cancellation_deadline, email")
    .eq("case_id", caseId)
    .single();

  if (!caseData || caseData.email !== user.email) throw new Error("Unauthorized");

  const now = new Date();
  const deadline = caseData.cancellation_deadline ? new Date(caseData.cancellation_deadline) : null;

  if (caseData.case_status !== "cooling_off" || !deadline || now > deadline) {
    throw new Error("Cancellation window has closed.");
  }

  await supabase
    .from("cases")
    .update({ case_status: "cancelled", cancelled_at: now.toISOString(), updated_at: now.toISOString() })
    .eq("case_id", caseId);

  await supabase.from("events").insert({
    case_id: caseId,
    event_type: "case_cancelled",
    detail: { cancelled_by: user.email, reason: "CROA 3-day window cancellation" },
  });

  revalidatePath("/portal");
  redirect("/portal");
}
