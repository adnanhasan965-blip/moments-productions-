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
import { createReceipt } from "@/app/(app)/projects/[id]/document-actions";
import type { ActionState } from "@/app/(app)/projects/[id]/finance-actions";
import { CURRENCY_DECIMALS, type Currency } from "@/lib/format";

interface Props {
  projectId: string;
  currency: Currency;
  defaults?: { crewName?: string; crewRole?: string; amount?: number };
  trigger?: React.ReactNode;
  /** server components pass a label instead of an element (RSC-safe) */
  triggerLabel?: string;
  triggerVariant?: "default" | "outline";
}

export function ReceiptDialog({ projectId, currency, defaults, trigger, triggerLabel, triggerVariant }: Props) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const action = createReceipt.bind(null, projectId);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    {}
  );

  useEffect(() => {
    if (state.done) setOpen(false);
  }, [state]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant={triggerVariant}>
            {triggerLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("docs.receiptTitle")}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="crew_name">{t("docs.paidTo")}</Label>
              <Input
                id="crew_name"
                name="crew_name"
                required
                defaultValue={defaults?.crewName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crew_role">{t("docs.role")}</Label>
              <Input id="crew_role" name="crew_role" defaultValue={defaults?.crewRole} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">{t("docs.amount", { currency })}</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                required
                min="0"
                step={1 / 10 ** CURRENCY_DECIMALS[currency]}
                defaultValue={defaults?.amount || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_date">{t("docs.paymentDate")}</Label>
              <Input
                id="payment_date"
                name="payment_date"
                type="date"
                defaultValue={today}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_method">{t("docs.paymentMethod")}</Label>
              <Input
                id="payment_method"
                name="payment_method"
                placeholder={t("docs.paymentMethodPlaceholder")}
                list="payment-methods"
              />
              <datalist id="payment-methods">
                <option value="Cash" />
                <option value="Bank transfer" />
                <option value="Wamd" />
                <option value="Cheque" />
              </datalist>
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
            <Label htmlFor="notes">{t("docs.notes")}</Label>
            <Textarea id="notes" name="notes" rows={2} />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t("common.generating") : t("docs.generateReceipt")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
