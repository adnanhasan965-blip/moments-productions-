import type { Currency } from "@/lib/format";

export type DocumentType = "receipt" | "invoice";
export type DocumentStatus = "active" | "void";
export type DocumentLanguage = "en" | "ar";

export interface InvoiceItem {
  description: string;
  amount: number;
}

export interface BankDetails {
  accountName: string;
  bankName: string;
  branch: string;
  iban: string;
  accountNumber: string;
  swift: string;
}

export interface ReceiptSnapshot {
  projectName: string;
  currency: Currency;
  crewName: string;
  crewRole: string;
  amount: number;
  paymentDate: string; // ISO date
  paymentMethod: string;
  notes: string;
}

export interface InvoiceSnapshot {
  projectName: string;
  currency: Currency;
  clientName: string;
  clientContact: string; // free line: name · phone · email
  items: InvoiceItem[];
  /** false = "total only" invoice: items listed without amounts,
   *  total entered manually (undefined/true = itemized, legacy) */
  showItemAmounts?: boolean;
  subtotal: number;
  discount: number;
  total: number;
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
  /** legacy freeform bank details (kept for old invoices) */
  bankDetails: string;
  /** structured bank details (new invoices) */
  bank?: BankDetails;
  notes: string;
}

export interface DocumentRow {
  id: string;
  project_id: string;
  doc_type: DocumentType;
  doc_number: string;
  status: DocumentStatus;
  language: DocumentLanguage;
  snapshot: ReceiptSnapshot | InvoiceSnapshot;
  pdf_path: string | null;
  share_key: string;
  created_at: string;
  /** signed URL injected server-side */
  pdf_url?: string;
}

/** Bilingual labels for the document templates. */
export const DOC_LABELS = {
  receipt_title: { en: "Payment receipt", ar: "إيصال دفع" },
  invoice_title: { en: "Invoice", ar: "فاتورة" },
  number: { en: "No.", ar: "رقم" },
  project: { en: "Project", ar: "المشروع" },
  received_from: { en: "Paid to", ar: "دُفع إلى" },
  role: { en: "Role", ar: "الدور" },
  amount: { en: "Amount", ar: "المبلغ" },
  payment_date: { en: "Payment date", ar: "تاريخ الدفع" },
  payment_method: { en: "Payment method", ar: "طريقة الدفع" },
  payer_signature: { en: "Payer signature", ar: "توقيع الدافع" },
  receiver_signature: { en: "Receiver signature", ar: "توقيع المستلم" },
  bill_to: { en: "Bill to", ar: "فاتورة إلى" },
  description: { en: "Description", ar: "الوصف" },
  subtotal: { en: "Subtotal", ar: "المجموع الفرعي" },
  discount: { en: "Discount", ar: "الخصم" },
  total: { en: "Total", ar: "الإجمالي" },
  issue_date: { en: "Issue date", ar: "تاريخ الإصدار" },
  due_date: { en: "Due date", ar: "تاريخ الاستحقاق" },
  payment_terms: { en: "Payment terms", ar: "شروط الدفع" },
  bank_details: { en: "Bank details", ar: "البيانات البنكية" },
  bank_account_name: { en: "Name", ar: "الاسم" },
  bank_name: { en: "Bank name", ar: "اسم البنك" },
  bank_branch: { en: "Branch", ar: "الفرع" },
  bank_iban: { en: "IBAN", ar: "الآيبان" },
  bank_account_number: { en: "Account number", ar: "رقم الحساب" },
  bank_swift: { en: "Swift code", ar: "رمز السويفت" },
  notes: { en: "Notes", ar: "ملاحظات" },
  void: { en: "VOID", ar: "ملغى" },
  tagline: { en: "a series of moments", ar: "سلسلة من اللحظات" },
} as const;

export type DocLabelKey = keyof typeof DOC_LABELS;

export function docLabel(key: DocLabelKey, lang: DocumentLanguage): string {
  return DOC_LABELS[key][lang];
}
