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
import { saveDay } from "@/app/(app)/projects/[id]/days/day-actions";
import type { ActionState } from "@/app/(app)/projects/[id]/finance-actions";
import { DAY_TYPES, type ProductionDay } from "@/lib/production";

interface Props {
  projectId: string;
  day?: ProductionDay;
  trigger?: React.ReactNode;
  /** server components pass a label instead of an element (RSC-safe) */
  triggerLabel?: string;
  triggerVariant?: "default" | "outline";
}

export function DayDialog({ projectId, day, trigger, triggerLabel, triggerVariant }: Props) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [locations, setLocations] = useState(
    day?.locations?.length ? day.locations : [{ name: "", map_link: "" }]
  );
  const action = saveDay.bind(null, projectId, day?.id ?? null);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    {}
  );

  useEffect(() => {
    if (state.done) setOpen(false);
  }, [state]);

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
          <DialogTitle>{day ? t("days.editTitle") : t("days.addTitle")}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="day_date">{t("days.date")}</Label>
              <Input
                id="day_date"
                name="day_date"
                type="date"
                required
                defaultValue={day?.day_date}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="day_type">{t("days.type")}</Label>
              <Select name="day_type" defaultValue={day?.day_type ?? "shoot"}>
                <SelectTrigger id="day_type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAY_TYPES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {t(`dayType.${d}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">{t("days.dayTitle")}</Label>
              <Input
                id="title"
                name="title"
                placeholder={t("days.dayTitlePlaceholder")}
                defaultValue={day?.title}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("days.locations")}</Label>
            {locations.map((l, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <Input name="location_name" placeholder={t("days.location")} defaultValue={l.name} />
                <Input
                  name="location_link"
                  placeholder={t("days.mapLink")}
                  defaultValue={l.map_link}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={`Remove location ${i + 1}`}
                  onClick={() => setLocations(locations.filter((_, j) => j !== i))}
                  disabled={locations.length === 1}
                >
                  ×
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setLocations([...locations, { name: "", map_link: "" }])}
            >
              {t("days.addLocation")}
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">{t("days.notes")}</Label>
            <Textarea id="notes" name="notes" rows={2} defaultValue={day?.notes} />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t("common.saving") : t("days.saveDay")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
