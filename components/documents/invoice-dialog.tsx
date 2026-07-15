"use client";

import { useActionState, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createInvoice } from "@/app/(app)/projects/[id]/document-actions";
import type { ActionState } from "@/app/(app)/projects/[id]/finance-actions";
import { CURRENCY_DECIMALS, type Currency } from "@/lib/format";

interface Props {
  projectId: string;
  currency: Currency;
  clientName: string;
  trigger?: React.ReactNode;
  /** server components pass a label instead of an element (RSC-safe) */
  triggerLabel?: string;
  triggerVariant?: "default" | "outline";
}

export function InvoiceDialog({ projectId, currency, clientName, trigger, triggerLabel, triggerVariant }: Props) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [itemCount, setItemCount] = useState(1);
  const [totalOnly, setTotalOnly] = useState(false);
  const action = createInvoice.bind(null, projectId);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    {}
  );

  useEffect(() => {
    if (state.done) setOpen(false);
  }, [state]);

  const today = new Date().toISOString().slice(0, 10);
  const step = 1 / 10 ** CURRENCY_DECIMALS[currency];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant={triggerVariant}>
            {triggerLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("docs.invoiceTitle")}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="client_name">{t("docs.client")}</Label>
              <Input id="client_name" name="client_name" defaultValue={clientName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issue_date">{t("docs.issueDate")}</Label>
              <Input id="issue_date" name="issue_date" type="date" defaultValue={today} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">{t("docs.dueDate")}</Label>
              <Input id="due_date" name="due_date" type="date" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label>{t("docs.lineItems")}</Label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  name="total_only"
                  checked={totalOnly}
                  onChange={(e) => setTotalOnly(e.target.checked)}
                />
                {t("docs.totalOnly")}
              </label>
            </div>
            {Array.from({ length: itemCount }).map((_, i) => (
              <div
                key={i}
                className={totalOnly ? "" : "grid grid-cols-[1fr_9rem] gap-2"}
              >
                <Input name="item_description" placeholder={t("docs.itemDescription", { n: i + 1 })} />
                {!totalOnly && (
                  <Input
                    name="item_amount"
                    type="number"
                    min="0"
                    step={step}
                    placeholder={currency}
                  />
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setItemCount(itemCount + 1)}
            >
              {t("docs.addLine")}
            </Button>
            {totalOnly && (
              <div className="space-y-2 pt-2">
                <Label htmlFor="manual_total">
                  {t("docs.manualTotal", { currency })}
                </Label>
                <Input
                  id="manual_total"
                  name="manual_total"
                  type="number"
                  min="0"
                  step={step}
                  required
                />
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="discount">{t("docs.discount", { currency })}</Label>
              <Input id="discount" name="discount" type="number" min="0" step={step} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">{t("docs.language")}</Label>
              <Select name="language" defaultValue="en">
                <SelectTrigger id="language" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_terms">{t("docs.paymentTerms")}</Label>
            <Textarea id="payment_terms" name="payment_terms" rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">{t("docs.notes")}</Label>
            <Textarea id="notes" name="notes" rows={2} />
          </div>

          <p className="text-xs text-muted-foreground">
            {t("docs.bankFromSettings")}
          </p>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t("common.generating") : t("docs.generateInvoice")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
