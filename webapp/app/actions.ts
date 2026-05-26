"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function approveLetters(letterIds: number[]) {
  const webhookUrl = process.env.N8N_APPROVAL_WEBHOOK;
  if (!webhookUrl) {
    throw new Error("N8N_APPROVAL_WEBHOOK environment variable is not set.");
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ letter_ids: letterIds }),
  });

  if (!res.ok) {
    throw new Error(
      `Approval webhook failed with status ${res.status}: ${await res.text()}`
    );
  }

  return res.json().catch(() => ({ ok: true }));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
