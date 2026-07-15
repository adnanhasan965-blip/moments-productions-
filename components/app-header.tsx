import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { logout } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/locale-switcher";

export async function AppHeader({ email }: { email?: string }) {
  const t = await getTranslations("nav");

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2 sm:min-h-16 sm:px-6">
        <Link href="/dashboard" className="shrink-0">
          <Image
            src="/brand/logo.png"
            alt="Moments Productions"
            width={1200}
            height={436}
            className="h-8 w-auto dark:hidden sm:h-9"
            priority
          />
          <Image
            src="/brand/logo-dark.png"
            alt="Moments Productions"
            width={1200}
            height={436}
            className="hidden h-8 w-auto dark:sm:h-9 dark:block"
            priority
          />
        </Link>
        <nav className="order-3 -mx-2 flex w-full items-center gap-0 overflow-x-auto text-sm sm:order-none sm:mx-0 sm:w-auto sm:gap-1">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">{t("projects")}</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/settings">{t("settings")}</Link>
          </Button>
        </nav>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          {email && (
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {email}
            </span>
          )}
          <form action={logout}>
            <Button variant="outline" size="sm" type="submit">
              {t("signOut")}
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
