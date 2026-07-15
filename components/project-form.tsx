"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
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
import { CURRENCY_DECIMALS, type Currency } from "@/lib/format";
import {
  PROJECT_STATUSES,
  type ClientContact,
  type Project,
} from "@/lib/types";
import type { ProjectFormState } from "@/app/(app)/projects/actions";

interface Props {
  action: (prev: ProjectFormState, formData: FormData) => Promise<ProjectFormState>;
  project?: Project;
  submitLabel: string;
}

export function ProjectForm({ action, project, submitLabel }: Props) {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState(action, {});
  const [currency, setCurrency] = useState<Currency>(project?.currency ?? "KWD");
  const [contacts, setContacts] = useState<ClientContact[]>(
    project?.client_contacts?.length
      ? project.client_contacts
      : [{ name: "", phone: "", email: "" }]
  );

  return (
    <form action={formAction} className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-2xl">{t("projectForm.section")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">{t("projectForm.name")}</Label>
            <Input id="name" name="name" required defaultValue={project?.name} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">{t("projectForm.description")}</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={project?.description}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">{t("projectForm.status")}</Label>
            <Select name="status" defaultValue={project?.status ?? "planning"}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`status.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">{t("projectForm.currency")}</Label>
            <Select
              name="currency"
              defaultValue={currency}
              onValueChange={(v) => setCurrency(v as Currency)}
            >
              <SelectTrigger id="currency" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KWD">{t("projectForm.kwd")}</SelectItem>
                <SelectItem value="SAR">{t("projectForm.sar")}</SelectItem>
                <SelectItem value="USD">{t("projectForm.usd")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="start_date">{t("projectForm.startDate")}</Label>
            <Input
              id="start_date"
              name="start_date"
              type="date"
              defaultValue={project?.start_date ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">{t("projectForm.endDate")}</Label>
            <Input
              id="end_date"
              name="end_date"
              type="date"
              defaultValue={project?.end_date ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="total_budget">{t("projectForm.totalBudget", { currency })}</Label>
            <Input
              id="total_budget"
              name="total_budget"
              type="number"
              min="0"
              step={1 / 10 ** CURRENCY_DECIMALS[currency]}
              defaultValue={project?.total_budget ?? ""}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl">{t("projectForm.clientSection")}</h2>
        <div className="space-y-2">
          <Label htmlFor="client_name">{t("projectForm.clientName")}</Label>
          <Input
            id="client_name"
            name="client_name"
            defaultValue={project?.client_name}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client_logo">{t("projectForm.clientLogo")}</Label>
          <Input
            id="client_logo"
            name="client_logo"
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
          />
          <p className="text-xs text-muted-foreground">
            {t("projectForm.clientLogoHint")}
          </p>
          {project?.client_logo_path && (
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" name="remove_client_logo" />
              {t("projectForm.removeClientLogo")}
            </label>
          )}
        </div>
        <div className="space-y-3">
          <Label>{t("projectForm.contacts")}</Label>
          {contacts.map((c, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <Input
                name="contact_name"
                placeholder={t("projectForm.contactName")}
                defaultValue={c.name}
                aria-label={`Contact ${i + 1} name`}
              />
              <Input
                name="contact_phone"
                placeholder={t("projectForm.contactPhone")}
                defaultValue={c.phone}
                aria-label={`Contact ${i + 1} phone`}
              />
              <Input
                name="contact_email"
                type="email"
                placeholder={t("projectForm.contactEmail")}
                defaultValue={c.email}
                aria-label={`Contact ${i + 1} email`}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={`Remove contact ${i + 1}`}
                onClick={() => setContacts(contacts.filter((_, j) => j !== i))}
                disabled={contacts.length === 1}
              >
                ×
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setContacts([...contacts, { name: "", phone: "", email: "" }])
            }
          >
            {t("projectForm.addContact")}
          </Button>
        </div>
      </section>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? t("common.saving") : submitLabel}
        </Button>
      </div>
    </form>
  );
}
