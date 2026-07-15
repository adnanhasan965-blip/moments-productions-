import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const t = useTranslations("status");

  if (status === "shooting") {
    // The recording light.
    return (
      <Badge className="bg-[var(--brand-signal)] text-[var(--brand-cream)]">
        ● {t(status)}
      </Badge>
    );
  }
  if (status === "delivered") {
    return <Badge>{t(status)}</Badge>;
  }
  return <Badge variant="outline">{t(status)}</Badge>;
}
