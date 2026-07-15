"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { deleteDay } from "@/app/(app)/projects/[id]/days/day-actions";

export function DeleteDayButton({
  dayId,
  projectId,
}: {
  dayId: string;
  projectId: string;
}) {
  const t = useTranslations();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (window.confirm(t("days.deleteConfirm"))) {
          startTransition(() => deleteDay(dayId, projectId));
        }
      }}
    >
      {pending ? t("common.deleting") : t("days.deleteDay")}
    </Button>
  );
}
