"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TimeInput } from "@/components/time-input";
import { saveCallSheet } from "@/app/(app)/projects/[id]/days/day-actions";
import type { ActionState } from "@/app/(app)/projects/[id]/finance-actions";
import type { CallSheet, CrewCall } from "@/lib/production";

interface RowsProps<T extends Record<string, string>> {
  label: string;
  rows: T[];
  empty: T;
  /** field name (form input name) → config */
  fields: { name: string; key: keyof T; type?: string; placeholder?: string; wide?: boolean }[];
  onChange: (rows: T[]) => void;
}

/**
 * Fully controlled dynamic rows — values live in state, so adding and
 * removing rows never shifts or loses what was typed (uncontrolled
 * inputs keyed by index used to lose per-crew call times).
 */
function DynamicRows<T extends Record<string, string>>({
  label,
  rows,
  empty,
  fields,
  onChange,
}: RowsProps<T>) {
  const t = useTranslations("common");

  function setField(i: number, key: keyof T, value: string) {
    onChange(rows.map((r, j) => (j === i ? { ...r, [key]: value } : r)));
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {rows.map((row, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="grid flex-1 gap-2 sm:grid-cols-[repeat(auto-fit,minmax(8rem,1fr))]">
            {fields.map((f) =>
              f.type === "time" ? (
                <TimeInput
                  key={f.name}
                  name={f.name}
                  value={row[f.key]}
                  onValueChange={(v) => setField(i, f.key, v)}
                  aria-label={`${label} ${i + 1} — ${String(f.key)}`}
                />
              ) : (
                <Input
                  key={f.name}
                  name={f.name}
                  placeholder={f.placeholder}
                  className={f.wide ? "sm:col-span-2" : undefined}
                  value={row[f.key]}
                  onChange={(e) => setField(i, f.key, e.target.value)}
                  aria-label={`${label} ${i + 1} — ${f.placeholder ?? String(f.key)}`}
                />
              )
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={`Remove ${label} row ${i + 1}`}
            onClick={() => onChange(rows.filter((_, j) => j !== i))}
          >
            ×
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...rows, { ...empty }])}
      >
        {t("addRow")}
      </Button>
    </div>
  );
}

interface Props {
  dayId: string;
  projectId: string;
  callSheet: CallSheet | null;
  /** project crew for prefilling the crew call list */
  projectCrew: CrewCall[];
}

export function CallSheetForm({ dayId, projectId, callSheet, projectCrew }: Props) {
  const t = useTranslations();
  const action = saveCallSheet.bind(null, dayId, projectId);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    {}
  );

  const [contacts, setContacts] = useState(
    callSheet?.key_contacts?.length
      ? callSheet.key_contacts
      : [{ role: "Producer", name: "", phone: "" }]
  );
  const [schedule, setSchedule] = useState(
    callSheet?.schedule?.length
      ? callSheet.schedule
      : [{ time: "", activity: "" }]
  );
  const [crewCalls, setCrewCalls] = useState(
    callSheet?.crew_calls?.length ? callSheet.crew_calls : projectCrew
  );
  const [cast, setCast] = useState(
    callSheet?.cast_list?.length ? callSheet.cast_list : []
  );

  return (
    <form action={formAction} className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="general_call_time">{t("callSheet.generalCall")}</Label>
          <TimeInput
            id="general_call_time"
            name="general_call_time"
            defaultValue={callSheet?.general_call_time ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="day_number">{t("callSheet.dayNumber")}</Label>
          <Input
            id="day_number"
            name="day_number"
            type="number"
            min="1"
            defaultValue={callSheet?.day_number ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="total_days">{t("callSheet.totalDays")}</Label>
          <Input
            id="total_days"
            name="total_days"
            type="number"
            min="1"
            defaultValue={callSheet?.total_days ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weather_note">{t("callSheet.weather")}</Label>
          <Input
            id="weather_note"
            name="weather_note"
            placeholder={t("callSheet.weatherPlaceholder")}
            defaultValue={callSheet?.weather_note ?? ""}
          />
        </div>
      </div>

      <DynamicRows
        label={t("callSheet.keyContacts")}
        rows={contacts}
        empty={{ role: "", name: "", phone: "" }}
        onChange={setContacts}
        fields={[
          { name: "contact_role", key: "role", placeholder: t("callSheet.contactRole") },
          { name: "contact_name", key: "name", placeholder: t("callSheet.contactName") },
          { name: "contact_phone", key: "phone", placeholder: t("callSheet.contactPhone") },
        ]}
      />

      <DynamicRows
        label={t("callSheet.schedule")}
        rows={schedule}
        empty={{ time: "", activity: "" }}
        onChange={setSchedule}
        fields={[
          { name: "schedule_time", key: "time", type: "time" },
          { name: "schedule_activity", key: "activity", placeholder: t("callSheet.activity"), wide: true },
        ]}
      />

      <DynamicRows
        label={t("callSheet.crewCalls")}
        rows={crewCalls}
        empty={{ name: "", role: "", phone: "", call_time: "" }}
        onChange={setCrewCalls}
        fields={[
          { name: "crew_name", key: "name", placeholder: t("callSheet.contactName") },
          { name: "crew_role", key: "role", placeholder: t("callSheet.contactRole") },
          { name: "crew_phone", key: "phone", placeholder: t("callSheet.contactPhone") },
          { name: "crew_call_time", key: "call_time", type: "time" },
        ]}
      />

      <DynamicRows
        label={t("callSheet.cast")}
        rows={cast}
        empty={{ name: "", role: "", call_time: "" }}
        onChange={setCast}
        fields={[
          { name: "cast_name", key: "name", placeholder: t("callSheet.contactName") },
          { name: "cast_role", key: "role", placeholder: t("callSheet.castRole") },
          { name: "cast_call_time", key: "call_time", type: "time" },
        ]}
      />

      <div className="space-y-2">
        <Label htmlFor="notes">{t("callSheet.notes")}</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={callSheet?.notes ?? ""}
        />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.done && <p className="text-sm">{t("common.saved")}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? t("common.saving") : t("callSheet.save")}
      </Button>
    </form>
  );
}
