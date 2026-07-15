import { useLocale, useTranslations } from "next-intl";
import { formatMoney, type Currency } from "@/lib/format";

export function BudgetBar({
  budget,
  spent,
  currency,
  showAmounts = false,
}: {
  budget: number;
  spent: number;
  currency: Currency;
  showAmounts?: boolean;
}) {
  const t = useTranslations("budget");
  const locale = useLocale();
  const over = budget > 0 && spent > budget;
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : spent > 0 ? 100 : 0;

  return (
    <div className="space-y-1">
      {showAmounts && (
        <div className="flex justify-between text-xs">
          <span className={over ? "font-bold text-destructive" : ""}>
            {formatMoney(spent, currency, locale)}
          </span>
          <span className="text-muted-foreground">
            / {formatMoney(budget, currency, locale)}
          </span>
        </div>
      )}
      <div
        className="h-1.5 w-full bg-muted"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t("used")}
      >
        <div
          className={`h-full ${over ? "bg-destructive" : "bg-foreground"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {over && (
        <p className="text-xs font-bold text-destructive">
          {t("overBudget")} · {formatMoney(spent - budget, currency, locale)}
        </p>
      )}
    </div>
  );
}
