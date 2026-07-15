"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { setProjectArchived } from "@/app/(app)/projects/actions";

export function ArchiveProjectButton({
  projectId,
  archived,
}: {
  projectId: string;
  archived: boolean;
}) {
  const t = useTranslations("project");
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (archived || window.confirm(t("archiveConfirm"))) {
          startTransition(() => setProjectArchived(projectId, !archived));
        }
      }}
    >
      {pending ? "…" : archived ? t("unarchive") : t("archive")}
    </Button>
  );
}
