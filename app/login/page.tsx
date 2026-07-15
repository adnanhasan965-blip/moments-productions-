"use client";

import { useActionState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocaleSwitcher } from "@/components/locale-switcher";

export default function LoginPage() {
  const t = useTranslations("login");
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="absolute end-4 top-4">
        <LocaleSwitcher />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <Image
            src="/brand/logo.png"
            alt="Moments Productions"
            width={1200}
            height={436}
            className="mx-auto mb-2 h-16 w-auto"
            priority
          />
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </div>
            {state?.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? t("signingIn") : t("signIn")}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {t("noSignup")}
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
