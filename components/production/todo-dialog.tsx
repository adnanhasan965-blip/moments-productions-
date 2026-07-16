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
import { saveTodo } from "@/app/(app)/projects/[id]/days/day-actions";
import type { ActionState } from "@/app/(app)/projects/[id]/finance-actions";
import { TODO_PRIORITIES, type DayType, type TodoItem } from "@/lib/production";

interface Props {
  projectId: string;
  dayType: DayType;
  todo?: TodoItem;
  trigger?: React.ReactNode;
  /** server components pass a label instead of an element (RSC-safe) */
  triggerLabel?: string;
  triggerVariant?: "default" | "outline";
}

export function TodoDialog({
  projectId,
  dayType,
  todo,
  trigger,
  triggerLabel,
  triggerVariant,
}: Props) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const action = saveTodo.bind(null, projectId, dayType, todo?.id ?? null);
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
          <DialogTitle>
            {todo ? t("todos.editTitle") : t("todos.addTitle")}
          </DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t("todos.task")}</Label>
            <Input id="title" name="title" required defaultValue={todo?.title} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="priority">{t("todos.priority")}</Label>
              <select
                id="priority"
                name="priority"
                defaultValue={todo?.priority ?? "medium"}
                className="border-input h-9 w-full min-w-0 border bg-transparent px-3 py-1 text-sm outline-none focus-visible:ring-2"
              >
                {TODO_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {t(`todos.priority_${p}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">{t("todos.dueDate")}</Label>
              <Input
                id="due_date"
                name="due_date"
                type="date"
                defaultValue={todo?.due_date ?? ""}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">{t("todos.notes")}</Label>
            <Textarea id="notes" name="notes" rows={2} defaultValue={todo?.notes} />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t("common.saving") : t("todos.saveTask")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
