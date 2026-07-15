import type { Currency } from "@/lib/format";

export type ProjectStatus =
  | "planning"
  | "pre_production"
  | "shooting"
  | "post"
  | "delivered";

export const PROJECT_STATUSES: ProjectStatus[] = [
  "planning",
  "pre_production",
  "shooting",
  "post",
  "delivered",
];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: "Planning",
  pre_production: "Pre-production",
  shooting: "Shooting",
  post: "Post",
  delivered: "Delivered",
};

export interface ClientContact {
  name: string;
  phone: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  client_name: string;
  client_contacts: ClientContact[];
  description: string;
  status: ProjectStatus;
  currency: Currency;
  start_date: string | null;
  end_date: string | null;
  total_budget: number;
  client_logo_path: string | null;
  archived: boolean;
  share_key: string;
  created_at: string;
}

export interface ProjectWithSpend extends Project {
  spent: number;
}

export interface CostCategory {
  id: string;
  name: string;
}

export interface Cost {
  id: string;
  project_id: string;
  category_id: string | null;
  description: string;
  amount: number;
  cost_date: string | null;
  paid: "unpaid" | "paid";
  payment_status: CrewPaymentStatus;
  receipt_path: string | null;
  cost_categories: { name: string } | null;
  /** signed URL injected server-side when receipt_path exists */
  receipt_url?: string;
}

export interface CrewMember {
  id: string;
  name: string;
  default_role: string;
  phone: string;
  email: string;
  default_day_rate: number | null;
}

export type CrewPaymentStatus = "unpaid" | "partial" | "paid";

export interface ProjectCrewRow {
  id: string;
  project_id: string;
  crew_member_id: string;
  role: string;
  rate: number;
  is_flat_fee: boolean;
  days: number;
  payment_status: CrewPaymentStatus;
  amount_paid: number;
  crew_members: CrewMember;
}

export function crewTotal(c: Pick<ProjectCrewRow, "rate" | "days" | "is_flat_fee">): number {
  return Number(c.rate) * (c.is_flat_fee ? 1 : c.days);
}

/** costs rows + computed crew totals, as fetched nested on projects */
export interface ProjectSpendRows {
  costs: { amount: number }[];
  project_crew: { rate: number; days: number; is_flat_fee: boolean }[];
}

export function computeSpent(rows: ProjectSpendRows): number {
  const costs = rows.costs.reduce((sum, c) => sum + Number(c.amount), 0);
  const crew = rows.project_crew.reduce(
    (sum, c) => sum + Number(c.rate) * (c.is_flat_fee ? 1 : c.days),
    0
  );
  return costs + crew;
}
