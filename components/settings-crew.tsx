"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteCrewMember,
  saveCrewMember,
} from "@/app/(app)/settings/actions";
import type { ActionState } from "@/app/(app)/projects/[id]/finance-actions";
import type { CrewMember } from "@/lib/types";

function MemberDialog({
  member,
  trigger,
}: {
  member?: CrewMember;
  trigger: React.ReactNode;
}) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const action = saveCrewMember.bind(null, member?.id ?? null);
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {member
              ? t("crew.editTitle", { name: member.name })
              : t("crew.addTitle")}
          </DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t("crew.newName")}</Label>
              <Input id="name" name="name" required defaultValue={member?.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_role">{t("crew.colRole")}</Label>
              <Input
                id="default_role"
                name="default_role"
                placeholder={t("crew.rolePlaceholder")}
                defaultValue={member?.default_role}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("crew.newPhone")}</Label>
              <Input id="phone" name="phone" defaultValue={member?.phone} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("crew.newEmail")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={member?.email}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_day_rate">{t("crew.defaultRate")}</Label>
              <Input
                id="default_day_rate"
                name="default_day_rate"
                type="number"
                min="0"
                step="0.001"
                defaultValue={member?.default_day_rate ?? ""}
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

function DeleteMemberButton({ member }: { member: CrewMember }) {
  const t = useTranslations();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive"
      disabled={pending}
      onClick={() => {
        if (window.confirm(t("settings.deleteMemberConfirm", { name: member.name }))) {
          startTransition(() => deleteCrewMember(member.id));
        }
      }}
    >
      {t("common.delete")}
    </Button>
  );
}

export function SettingsCrew({ directory }: { directory: CrewMember[] }) {
  const t = useTranslations();

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl">{t("settings.crewDirectory")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("settings.crewDirectoryHint")}
          </p>
        </div>
        <MemberDialog trigger={<Button size="sm">{t("crew.add")}</Button>} />
      </div>
      <div className="overflow-x-auto border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("crew.colName")}</TableHead>
              <TableHead>{t("crew.colRole")}</TableHead>
              <TableHead>{t("crew.colContact")}</TableHead>
              <TableHead className="text-end">{t("crew.colRate")}</TableHead>
              <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {directory.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  {t("settings.crewDirectoryEmpty")}
                </TableCell>
              </TableRow>
            )}
            {directory.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-bold">{m.name}</TableCell>
                <TableCell>{m.default_role || "—"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {[m.phone, m.email].filter(Boolean).join(" · ") || "—"}
                </TableCell>
                <TableCell className="text-end">
                  {m.default_day_rate ?? "—"}
                </TableCell>
                <TableCell className="text-end">
                  <MemberDialog
                    member={m}
                    trigger={
                      <Button variant="ghost" size="sm">
                        {t("common.edit")}
                      </Button>
                    }
                  />
                  <DeleteMemberButton member={m} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
