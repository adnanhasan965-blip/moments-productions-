"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateDocumentPdf } from "@/lib/pdf";
import type { InvoiceItem, InvoiceSnapshot, ReceiptSnapshot } from "@/lib/documents";
import type { ActionState } from "./finance-actions";

async function insertDocument(
  projectId: string,
  docType: "receipt" | "invoice",
  language: string,
  snapshot: ReceiptSnapshot | InvoiceSnapshot
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: docNumber, error: numError } = await supabase.rpc(
    "next_document_number",
    { p_type: docType }
  );
  if (numError) return { error: numError.message };

  const { data: doc, error } = await supabase
    .from("documents")
    .insert({
      project_id: projectId,
      doc_type: docType,
      doc_number: docNumber,
      language,
      snapshot,
      created_by: user?.id,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  // PDF generation is best-effort: the printable page always works,
  // and the UI offers a retry when pdf_path is missing.
  await generateDocumentPdf(doc.id);

  revalidatePath(`/projects/${projectId}`);
  return { done: true };
}

export async function createReceipt(
  projectId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("name, currency")
    .eq("id", projectId)
    .single();
  if (!project) return { error: "Project not found" };

  const snapshot: ReceiptSnapshot = {
    projectName: project.name,
    currency: project.currency,
    crewName: ((formData.get("crew_name") as string) ?? "").trim(),
    crewRole: ((formData.get("crew_role") as string) ?? "").trim(),
    amount: Number(formData.get("amount") || 0),
    paymentDate:
      (formData.get("payment_date") as string) ||
      new Date().toISOString().slice(0, 10),
    paymentMethod: ((formData.get("payment_method") as string) ?? "").trim(),
    notes: ((formData.get("notes") as string) ?? "").trim(),
  };

  if (!snapshot.crewName) return { error: "Crew member name is required." };
  if (snapshot.amount <= 0) return { error: "Amount must be greater than zero." };

  return insertDocument(
    projectId,
    "receipt",
    (formData.get("language") as string) || "en",
    snapshot
  );
}

export async function createInvoice(
  projectId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const [{ data: project }, { data: settings }] = await Promise.all([
    supabase
      .from("projects")
      .select("name, currency, client_name, client_contacts")
      .eq("id", projectId)
      .single(),
    supabase
      .from("company_settings")
      .select(
        "payment_terms, bank_details, bank_account_name, bank_name, bank_branch, bank_iban, bank_account_number, bank_swift"
      )
      .eq("id", 1)
      .single(),
  ]);
  if (!project) return { error: "Project not found" };

  const totalOnly = formData.get("total_only") === "on";
  const descriptions = formData.getAll("item_description") as string[];
  const amounts = formData.getAll("item_amount") as string[];

  let items: InvoiceItem[];
  let subtotal: number;
  if (totalOnly) {
    // items are descriptions only; the total is typed manually
    items = descriptions
      .map((d) => ({ description: d.trim(), amount: 0 }))
      .filter((it) => it.description);
    if (items.length === 0) return { error: "Add at least one line item." };
    subtotal = Number(formData.get("manual_total") || 0);
    if (subtotal <= 0) return { error: "Enter the invoice total." };
  } else {
    items = descriptions
      .map((d, i) => ({ description: d.trim(), amount: Number(amounts[i] || 0) }))
      .filter((it) => it.description && it.amount > 0);
    if (items.length === 0) return { error: "Add at least one line item." };
    subtotal = items.reduce((s, it) => s + it.amount, 0);
  }

  const discount = Math.max(0, Number(formData.get("discount") || 0));

  const contact = (project.client_contacts ?? [])[0];
  const snapshot: InvoiceSnapshot = {
    projectName: project.name,
    currency: project.currency,
    clientName:
      ((formData.get("client_name") as string) ?? "").trim() ||
      project.client_name,
    clientContact: contact
      ? [contact.name, contact.phone, contact.email].filter(Boolean).join(" · ")
      : "",
    items,
    showItemAmounts: !totalOnly,
    subtotal,
    discount,
    total: subtotal - discount,
    issueDate:
      (formData.get("issue_date") as string) ||
      new Date().toISOString().slice(0, 10),
    dueDate: (formData.get("due_date") as string) || "",
    paymentTerms:
      ((formData.get("payment_terms") as string) ?? "").trim() ||
      settings?.payment_terms ||
      "",
    bankDetails: settings?.bank_details ?? "",
    bank: {
      accountName: settings?.bank_account_name ?? "",
      bankName: settings?.bank_name ?? "",
      branch: settings?.bank_branch ?? "",
      iban: settings?.bank_iban ?? "",
      accountNumber: settings?.bank_account_number ?? "",
      swift: settings?.bank_swift ?? "",
    },
    notes: ((formData.get("notes") as string) ?? "").trim(),
  };

  return insertDocument(
    projectId,
    "invoice",
    (formData.get("language") as string) || "en",
    snapshot
  );
}

export async function voidDocument(docId: string, projectId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("documents")
    .update({ status: "void" })
    .eq("id", docId);
  if (error) throw new Error(error.message);

  // Regenerate the stored PDF so downloads carry the VOID mark.
  await generateDocumentPdf(docId);
  revalidatePath(`/projects/${projectId}`);
}

export async function retryDocumentPdf(
  docId: string,
  projectId: string
): Promise<void> {
  await generateDocumentPdf(docId);
  revalidatePath(`/projects/${projectId}`);
}
