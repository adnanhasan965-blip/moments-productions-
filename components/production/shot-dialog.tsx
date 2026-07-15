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
import { TimeInput } from "@/components/time-input";
import { saveShot } from "@/app/(app)/projects/[id]/days/day-actions";
import type { ActionState } from "@/app/(app)/projects/[id]/finance-actions";
import { SHOT_SIZES, type Shot } from "@/lib/production";

interface Props {
  dayId: string;
  projectId: string;
  shot?: Shot;
  trigger?: React.ReactNode;
  /** server components pass a label instead of an element (RSC-safe) */
  triggerLabel?: string;
  triggerVariant?: "default" | "outline";
}

export function ShotDialog({ dayId, projectId, shot, trigger, triggerLabel, triggerVariant }: Props) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const action = saveShot.bind(null, dayId, projectId, shot?.id ?? null);
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{shot ? t("shots.editTitle") : t("shots.addTitle")}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="shot_number">{t("shots.shotNumber")}</Label>
              <Input
                id="shot_number"
                name="shot_number"
                placeholder="1A"
                defaultValue={shot?.shot_number}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scene">{t("shots.scene")}</Label>
              <Input id="scene" name="scene" defaultValue={shot?.scene} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shot_size">{t("shots.size")}</Label>
              <Input
                id="shot_size"
                name="shot_size"
                list="shot-sizes"
                placeholder={t("shots.sizePlaceholder")}
                defaultValue={shot?.shot_size}
              />
              <datalist id="shot-sizes">
                {SHOT_SIZES.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t("shots.description")}</Label>
            <Textarea
              id="description"
              name="description"
              rows={2}
              required
              defaultValue={shot?.description}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="camera_notes">{t("shots.cameraNotes")}</Label>
              <Input
                id="camera_notes"
                name="camera_notes"
                placeholder={t("shots.cameraPlaceholder")}
                defaultValue={shot?.camera_notes}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">{t("shots.location")}</Label>
              <Input id="location" name="location" defaultValue={shot?.location} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cast_subjects">{t("shots.cast")}</Label>
              <Input
                id="cast_subjects"
                name="cast_subjects"
                defaultValue={shot?.cast_subjects}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="planned_time">{t("shots.plannedTime")}</Label>
              <TimeInput
                id="planned_time"
                name="planned_time"
                defaultValue={shot?.planned_time ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated_minutes">{t("shots.estMinutes")}</Label>
              <Input
                id="estimated_minutes"
                name="estimated_minutes"
                type="number"
                min="0"
                step="5"
                defaultValue={shot?.estimated_minutes ?? ""}
              />
            </div>
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t("common.saving") : t("shots.saveShot")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
