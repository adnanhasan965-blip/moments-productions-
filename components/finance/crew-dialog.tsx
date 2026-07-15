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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  saveProjectCrew,
  type ActionState,
} from "@/app/(app)/projects/[id]/finance-actions";
import { CURRENCY_DECIMALS, type Currency } from "@/lib/format";
import type { CrewMember, ProjectCrewRow } from "@/lib/types";

interface Props {
  projectId: string;
  currency: Currency;
  directory: CrewMember[];
  row?: ProjectCrewRow;
  trigger: React.ReactNode;
}

export function CrewDialog({ projectId, currency, directory, row, trigger }: Props) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [memberId, setMemberId] = useState(row?.crew_member_id ?? "");
  const [flat, setFlat] = useState(row?.is_flat_fee ?? false);
  const action = saveProjectCrew.bind(null, projectId, row?.id ?? null);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    {}
  );

  useEffect(() => {
    if (state.done) setOpen(false);
  }, [state]);

  const selected = directory.find((m) => m.id === memberId);
  const step = 1 / 10 ** CURRENCY_DECIMALS[currency];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {row
              ? t("crew.editTitle", { name: row.crew_members.name })
              : t("crew.addTitle")}
          </DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {!row && (
            <div className="space-y-2">
              <Label htmlFor="crew_member_id">{t("crew.member")}</Label>
              <Select
                name="crew_member_id"
                value={memberId || undefined}
                onValueChange={setMemberId}
              >
                <SelectTrigger id="crew_member_id" className="w-full">
                  <SelectValue placeholder={t("crew.pickMember")} />
                </SelectTrigger>
                <SelectContent>
                  {directory.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                      {m.default_role ? ` · ${m.default_role}` : ""}
                    </SelectItem>
                  ))}
                  <SelectItem value="__new__">{t("crew.newMember")}</SelectItem>
                </SelectContent>
              </Select>
              {memberId === "__new__" && (
                <div className="grid gap-2 border p-3 sm:grid-cols-2">
                  <Input name="new_name" placeholder={t("crew.newName")} required autoFocus />
                  <Input name="new_phone" placeholder={t("crew.newPhone")} />
                  <Input
                    name="new_email"
                    type="email"
                    placeholder={t("crew.newEmail")}
                    className="sm:col-span-2"
                  />
                </div>
              )}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="role">{t("crew.role")}</Label>
              <Input
                id="role"
                name="role"
                placeholder={t("crew.rolePlaceholder")}
                defaultValue={row?.role ?? selected?.default_role ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">
                {flat ? t("crew.flatFee", { currency }) : t("crew.dayRate", { currency })}
              </Label>
              <Input
                id="rate"
                name="rate"
                type="number"
                min="0"
                step={step}
                defaultValue={row?.rate ?? selected?.default_day_rate ?? ""}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_flat_fee"
                name="is_flat_fee"
                checked={flat}
                onCheckedChange={(v) => setFlat(v === true)}
              />
              <Label htmlFor="is_flat_fee">{t("crew.flatFeeLabel")}</Label>
            </div>
            {!flat && (
              <div className="space-y-2">
                <Label htmlFor="days">{t("crew.days")}</Label>
                <Input
                  id="days"
                  name="days"
                  type="number"
                  min="1"
                  step="1"
                  defaultValue={row?.days ?? 1}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="payment_status">{t("crew.paymentStatus")}</Label>
              <Select name="payment_status" defaultValue={row?.payment_status ?? "unpaid"}>
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
            <div className="space-y-2">
              <Label htmlFor="amount_paid">{t("crew.amountPaid", { currency })}</Label>
              <Input
                id="amount_paid"
                name="amount_paid"
                type="number"
                min="0"
                step={step}
                defaultValue={row?.amount_paid ?? 0}
              />
            </div>
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t("common.saving") : t("common.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
