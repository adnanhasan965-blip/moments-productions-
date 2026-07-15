"use client";

import { useLocale, useTranslations } from "next-intl";

import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CostDialog } from "@/components/finance/cost-dialog";
import { deleteCost } from "@/app/(app)/projects/[id]/finance-actions";
import { formatDate, formatMoney, type Currency } from "@/lib/format";
import type { Cost, CostCategory } from "@/lib/types";

function PaymentBadge({ status }: { status: Cost["payment_status"] }) {
  const t = useTranslations("crew");
  if (status === "paid") return <Badge>{t("paidStatus")}</Badge>;
  if (status === "partial")
    return (
      <Badge className="bg-[var(--brand-signal)] text-[var(--brand-cream)]">
        {t("partial")}
      </Badge>
    );
  return <Badge variant="outline">{t("unpaid")}</Badge>;
}

function DeleteCostButton({ cost, projectId }: { cost: Cost; projectId: string }) {
  const t = useTranslations();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive"
      disabled={pending}
      onClick={() => {
        if (window.confirm(t("costs.deleteConfirm", { name: cost.description }))) {
          startTransition(() => deleteCost(cost.id, projectId));
        }
      }}
    >
      {t("common.delete")}
    </Button>
  );
}

interface Props {
  projectId: string;
  currency: Currency;
  costs: Cost[];
  categories: CostCategory[];
  crewTotal: number;
}

export function CostsTable({ projectId, currency, costs, categories, crewTotal }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const costsTotal = costs.reduce((s, c) => s + Number(c.amount), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl">{t("costs.title")}</h3>
        <CostDialog
          projectId={projectId}
          currency={currency}
          categories={categories}
          trigger={<Button size="sm">{t("costs.add")}</Button>}
        />
      </div>
      <div className="overflow-x-auto border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("costs.colDate")}</TableHead>
              <TableHead>{t("costs.colCategory")}</TableHead>
              <TableHead>{t("costs.colDescription")}</TableHead>
              <TableHead className="text-end">{t("costs.colAmount")}</TableHead>
              <TableHead>{t("crew.colPayment")}</TableHead>
              <TableHead>{t("costs.colReceipt")}</TableHead>
              <TableHead className="w-32" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {costs.length === 0 && crewTotal === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  {t("costs.empty")}
                </TableCell>
              </TableRow>
            )}
            {costs.map((cost) => (
              <TableRow key={cost.id}>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {cost.cost_date ? formatDate(cost.cost_date, locale) : "—"}
                </TableCell>
                {/* user content — no tracking: Arabic category names must keep joins */}
                <TableCell className="text-xs uppercase">
                  {cost.cost_categories?.name ?? "—"}
                </TableCell>
                <TableCell>{cost.description}</TableCell>
                <TableCell className="text-end whitespace-nowrap">
                  {formatMoney(Number(cost.amount), currency, locale)}
                </TableCell>
                <TableCell>
                  <PaymentBadge status={cost.payment_status} />
                </TableCell>
                <TableCell>
                  {cost.receipt_url ? (
                    <a
                      href={cost.receipt_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs underline"
                    >
                      {t("costs.view")}
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-end">
                  <CostDialog
                    projectId={projectId}
                    currency={currency}
                    categories={categories}
                    cost={cost}
                    trigger={
                      <Button variant="ghost" size="sm">
                        {t("common.edit")}
                      </Button>
                    }
                  />
                  <DeleteCostButton cost={cost} projectId={projectId} />
                </TableCell>
              </TableRow>
            ))}
            {crewTotal > 0 && (
              <TableRow className="bg-muted/40">
                <TableCell className="text-xs text-muted-foreground">—</TableCell>
                <TableCell className="text-xs uppercase tracking-wider">{t("costs.crewCategory")}</TableCell>
                <TableCell className="text-muted-foreground">
                  {t("costs.crewRollup")}
                </TableCell>
                <TableCell className="text-end whitespace-nowrap">
                  {formatMoney(crewTotal, currency, locale)}
                </TableCell>
                <TableCell colSpan={3} />
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>{t("costs.total")}</TableCell>
              <TableCell className="text-end whitespace-nowrap font-bold">
                {formatMoney(costsTotal + crewTotal, currency, locale)}
              </TableCell>
              <TableCell colSpan={3} />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
