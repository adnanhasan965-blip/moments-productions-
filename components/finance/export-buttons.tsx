"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { CURRENCY_DECIMALS, type Currency } from "@/lib/format";
import { crewTotal, type Cost, type ProjectCrewRow } from "@/lib/types";

interface Props {
  projectName: string;
  currency: Currency;
  budget: number;
  costs: Cost[];
  crew: ProjectCrewRow[];
}

function buildRows({ costs, crew, currency, budget }: Props) {
  const dec = CURRENCY_DECIMALS[currency];
  const round = (n: number) => Number(n.toFixed(dec));

  const costRows = costs.map((c) => ({
    Date: c.cost_date ?? "",
    Category: c.cost_categories?.name ?? "",
    Description: c.description,
    [`Amount (${currency})`]: round(Number(c.amount)),
    Payment: c.payment_status,
  }));

  const crewRows = crew.map((c) => ({
    Name: c.crew_members.name,
    Role: c.role || c.crew_members.default_role,
    Phone: c.crew_members.phone,
    Email: c.crew_members.email,
    [`Rate (${currency})`]: round(Number(c.rate)),
    Basis: c.is_flat_fee ? "Flat fee" : "Day rate",
    Days: c.is_flat_fee ? "" : c.days,
    [`Total (${currency})`]: round(crewTotal(c)),
    Payment: c.payment_status,
  }));

  const costsTotal = costs.reduce((s, c) => s + Number(c.amount), 0);
  const crewSum = crew.reduce((s, c) => s + crewTotal(c), 0);
  const summary = [
    { Item: "Total budget", [`Amount (${currency})`]: round(budget) },
    { Item: "Costs (line items)", [`Amount (${currency})`]: round(costsTotal) },
    { Item: "Crew", [`Amount (${currency})`]: round(crewSum) },
    { Item: "Total spent", [`Amount (${currency})`]: round(costsTotal + crewSum) },
    { Item: "Remaining", [`Amount (${currency})`]: round(budget - costsTotal - crewSum) },
  ];

  return { costRows, crewRows, summary };
}

export function ExportButtons(props: Props) {
  const t = useTranslations("costs");
  const fileBase = `${props.projectName.replace(/[^\w-]+/g, "_")}_budget`;

  async function exportXlsx() {
    const XLSX = await import("xlsx");
    const { costRows, crewRows, summary } = buildRows(props);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), "Summary");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(costRows), "Costs");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(crewRows), "Crew");
    XLSX.writeFile(wb, `${fileBase}.xlsx`);
  }

  async function exportCsv() {
    const XLSX = await import("xlsx");
    const { costRows } = buildRows(props);
    const ws = XLSX.utils.json_to_sheet(costRows);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${fileBase}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={exportXlsx}>
        {t("exportExcel")}
      </Button>
      <Button variant="outline" size="sm" onClick={exportCsv}>
        {t("exportCsv")}
      </Button>
    </div>
  );
}
