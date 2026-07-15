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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveCost, type ActionState } from "@/app/(app)/projects/[id]/finance-actions";
import { CURRENCY_DECIMALS, type Currency } from "@/lib/format";
import type { Cost, CostCategory } from "@/lib/types";

interface Props {
  projectId: string;
  currency: Currency;
  categories: CostCategory[];
  cost?: Cost;
  trigger: React.ReactNode;
}

export function CostDialog({ projectId, currency, categories, cost, trigger }: Props) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(cost?.category_id ?? "");
  const action = saveCost.bind(null, projectId, cost?.id ?? null);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    {}
  );

  useEffect(() => {
    if (state.done) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{cost ? t("costs.editTitle") : t("costs.addTitle")}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">{t("costs.description")}</Label>
            <Input
              id="description"
              name="description"
              required
              defaultValue={cost?.description}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category_id">{t("costs.category")}</Label>
              <Select
                name="category_id"
                value={categoryId || undefined}
                onValueChange={setCategoryId}
              >
                <SelectTrigger id="category_id" className="w-full">
                  <SelectValue placeholder={t("costs.pickCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="__new__">{t("costs.newCategory")}</SelectItem>
                </SelectContent>
              </Select>
              {categoryId === "__new__" && (
                <Input
                  name="category_new"
                  placeholder={t("costs.newCategoryName")}
                  required
                  autoFocus
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">{t("costs.amount", { currency })}</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min="0"
                required
                step={1 / 10 ** CURRENCY_DECIMALS[currency]}
                defaultValue={cost?.amount}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost_date">{t("costs.date")}</Label>
              <Input
                id="cost_date"
                name="cost_date"
                type="date"
                defaultValue={cost?.cost_date ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_status">{t("crew.paymentStatus")}</Label>
              <Select
                name="payment_status"
                defaultValue={cost?.payment_status ?? "unpaid"}
              >
                <SelectTrigger id="payment_status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">{t("crew.unpaid")}</SelectItem>
                  <SelectItem value="partial">{t("crew.partial")}</SelectItem>
                  <SelectItem value="paid">{t("crew.paidStatus")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="receipt">{t("costs.receipt")}</Label>
            <Input id="receipt" name="receipt" type="file" accept="image/*,.pdf" />
            {cost?.receipt_path && (
              <p className="text-xs text-muted-foreground">
                {t("costs.receiptAttached")}
              </p>
            )}
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t("common.saving") : t("costs.saveCost")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
