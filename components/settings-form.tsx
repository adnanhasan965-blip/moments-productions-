"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateCompanySettings } from "@/app/(app)/settings/actions";
import type { ActionState } from "@/app/(app)/projects/[id]/finance-actions";

interface Settings {
  company_name: string;
  payment_terms: string;
  bank_account_name: string;
  bank_name: string;
  bank_branch: string;
  bank_iban: string;
  bank_account_number: string;
  bank_swift: string;
  receipt_prefix: string;
  invoice_prefix: string;
  next_receipt_number: number;
  next_invoice_number: number;
  public_email: string;
  public_phone: string;
  public_phone_2: string;
  instagram_url: string;
  youtube_url: string;
  tiktok_url: string;
  linkedin_url: string;
  youtube_channel_id: string;
  showreel_youtube_id: string;
}

export function SettingsForm({ settings }: { settings: Settings }) {
  const t = useTranslations();

  const bankFields = [
    ["bank_account_name", "docs.bankAccountName", settings.bank_account_name],
    ["bank_name", "docs.bankName", settings.bank_name],
    ["bank_branch", "docs.bankBranch", settings.bank_branch],
    ["bank_iban", "docs.bankIban", settings.bank_iban],
    ["bank_account_number", "docs.bankAccountNumber", settings.bank_account_number],
    ["bank_swift", "docs.bankSwift", settings.bank_swift],
  ] as const;

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateCompanySettings,
    {}
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="company_name">{t("settings.companyName")}</Label>
        <Input
          id="company_name"
          name="company_name"
          defaultValue={settings.company_name}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="payment_terms">{t("settings.paymentTerms")}</Label>
        <Textarea
          id="payment_terms"
          name="payment_terms"
          rows={3}
          placeholder={t("settings.paymentTermsPlaceholder")}
          defaultValue={settings.payment_terms}
        />
      </div>

      <fieldset className="space-y-4 border p-4">
        <legend className="px-1 text-sm font-bold">
          {t("settings.bankDetails")}
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {bankFields.map(([name, labelKey, value]) => (
            <div key={name} className="space-y-2">
              <Label htmlFor={name}>{t(labelKey)}</Label>
              <Input id={name} name={name} defaultValue={value} dir="ltr" />
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-4 border p-4">
        <legend className="px-1 text-sm font-bold">{t("settings.publicSite")}</legend>
        <p className="text-xs text-muted-foreground">{t("settings.publicSiteHint")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["public_email", "settings.publicEmail", settings.public_email, "ltr"],
              ["public_phone", "settings.publicPhone", settings.public_phone, "ltr"],
              ["public_phone_2", "settings.publicPhone2", settings.public_phone_2, "ltr"],
              ["instagram_url", "settings.instagramUrl", settings.instagram_url, "ltr"],
              ["youtube_url", "settings.youtubeUrl", settings.youtube_url, "ltr"],
              ["tiktok_url", "settings.tiktokUrl", settings.tiktok_url, "ltr"],
              ["linkedin_url", "settings.linkedinUrl", settings.linkedin_url, "ltr"],
              ["showreel_youtube_id", "settings.showreelId", settings.showreel_youtube_id, "ltr"],
              ["youtube_channel_id", "settings.youtubeChannel", settings.youtube_channel_id, "ltr"],
            ] as const
          ).map(([name, labelKey, value]) => (
            <div key={name} className="space-y-2">
              <Label htmlFor={name}>{t(labelKey)}</Label>
              <Input id={name} name={name} defaultValue={value} dir="ltr" />
            </div>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
        <p>
          {t("settings.nextReceipt")}{" "}
          <span className="font-bold text-foreground">
            {settings.receipt_prefix}
            {String(settings.next_receipt_number).padStart(4, "0")}
          </span>
        </p>
        <p>
          {t("settings.nextInvoice")}{" "}
          <span className="font-bold text-foreground">
            {settings.invoice_prefix}
            {String(settings.next_invoice_number).padStart(4, "0")}
          </span>
        </p>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.done && <p className="text-sm">{t("common.saved")}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? t("common.saving") : t("settings.save")}
      </Button>
    </form>
  );
}
