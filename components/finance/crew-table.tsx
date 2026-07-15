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
import { CrewDialog } from "@/components/finance/crew-dialog";
import { ReceiptDialog } from "@/components/documents/receipt-dialog";
import { removeProjectCrew } from "@/app/(app)/projects/[id]/finance-actions";
import { formatMoney, type Currency } from "@/lib/format";
import { crewTotal, type CrewMember, type ProjectCrewRow } from "@/lib/types";

function PaymentBadge({ status }: { status: ProjectCrewRow["payment_status"] }) {
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

function RemoveButton({ row, projectId }: { row: ProjectCrewRow; projectId: string }) {
  const t = useTranslations();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive"
      disabled={pending}
      onClick={() => {
        if (window.confirm(t("crew.removeConfirm", { name: row.crew_members.name }))) {
          startTransition(() => removeProjectCrew(row.id, projectId));
        }
      }}
    >
      {t("common.remove")}
    </Button>
  );
}

interface Props {
  projectId: string;
  currency: Currency;
  crew: ProjectCrewRow[];
  directory: CrewMember[];
}

export function CrewTable({ projectId, currency, crew, directory }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const total = crew.reduce((s, c) => s + crewTotal(c), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl">{t("crew.title")}</h3>
        <CrewDialog
          projectId={projectId}
          currency={currency}
          directory={directory}
          trigger={<Button size="sm">{t("crew.add")}</Button>}
        />
      </div>
      <div className="overflow-x-auto border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("crew.colName")}</TableHead>
              <TableHead>{t("crew.colRole")}</TableHead>
              <TableHead>{t("crew.colContact")}</TableHead>
              <TableHead className="text-end">{t("crew.colRate")}</TableHead>
              <TableHead className="text-end">{t("crew.colDays")}</TableHead>
              <TableHead className="text-end">{t("crew.colTotal")}</TableHead>
              <TableHead>{t("crew.colPayment")}</TableHead>
              <TableHead className="w-32" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {crew.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  {t("crew.empty")}
                </TableCell>
              </TableRow>
            )}
            {crew.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-bold">{row.crew_members.name}</TableCell>
                <TableCell>{row.role || row.crew_members.default_role || "—"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {[row.crew_members.phone, row.crew_members.email]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </TableCell>
                <TableCell className="text-end whitespace-nowrap">
                  {formatMoney(Number(row.rate), currency, locale)}
                  {row.is_flat_fee && (
                    <span className="text-xs text-muted-foreground"> {t("crew.flat")}</span>
                  )}
                </TableCell>
                <TableCell className="text-end">
                  {row.is_flat_fee ? "—" : row.days}
                </TableCell>
                <TableCell className="text-end whitespace-nowrap font-bold">
                  {formatMoney(crewTotal(row), currency, locale)}
                </TableCell>
                <TableCell>
                  <PaymentBadge status={row.payment_status} />
                </TableCell>
                <TableCell className="text-end">
                  <ReceiptDialog
                    projectId={projectId}
                    currency={currency}
                    defaults={{
                      crewName: row.crew_members.name,
                      crewRole: row.role || row.crew_members.default_role,
                      amount: crewTotal(row) - Number(row.amount_paid),
                    }}
                    trigger={
                      <Button variant="ghost" size="sm">
                        {t("crew.receipt")}
                      </Button>
                    }
                  />
                  <CrewDialog
                    projectId={projectId}
                    currency={currency}
                    directory={directory}
                    row={row}
                    trigger={
                      <Button variant="ghost" size="sm">
                        {t("common.edit")}
                      </Button>
                    }
                  />
                  <RemoveButton row={row} projectId={projectId} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5}>{t("crew.total")}</TableCell>
              <TableCell className="text-end whitespace-nowrap font-bold">
                {formatMoney(total, currency, locale)}
              </TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
