"use client";

import { useLocale, useTranslations } from "next-intl";
import { useOptimistic, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TodoDialog } from "@/components/production/todo-dialog";
import {
  deleteTodo,
  reorderTodos,
  toggleTodoDone,
} from "@/app/(app)/projects/[id]/days/day-actions";
import { formatDate } from "@/lib/format";
import type { DayType, TodoItem, TodoPriority } from "@/lib/production";

const PRIORITY_CLASSES: Record<TodoPriority, string> = {
  high: "bg-[var(--brand-signal)] text-[var(--brand-cream)]",
  medium: "border border-foreground text-foreground",
  low: "text-muted-foreground border border-muted-foreground/40",
};

function isOverdue(todo: TodoItem): boolean {
  if (!todo.due_date || todo.done) return false;
  return todo.due_date < new Date().toISOString().slice(0, 10);
}

function TodoRow({
  todo,
  projectId,
  dayType,
}: {
  todo: TodoItem;
  projectId: string;
  dayType: DayType;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: todo.id });
  const [pending, startTransition] = useTransition();

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex flex-wrap items-center gap-3 border-b p-3 ${
        isDragging ? "z-10 bg-secondary" : "bg-background"
      } ${todo.done ? "opacity-50" : ""}`}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground"
        aria-label={t("shots.dragLabel")}
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>
      <Checkbox
        checked={todo.done}
        disabled={pending}
        aria-label={t("todos.done")}
        onCheckedChange={(v) =>
          startTransition(() => toggleTodoDone(todo.id, projectId, v === true))
        }
      />
      <div className="min-w-48 flex-1 text-sm">
        <p className={todo.done ? "line-through" : ""}>{todo.title}</p>
        {todo.notes && (
          <p className="truncate text-xs text-muted-foreground">{todo.notes}</p>
        )}
      </div>
      <span
        className={`px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase ${PRIORITY_CLASSES[todo.priority]}`}
      >
        {t(`todos.priority_${todo.priority}`)}
      </span>
      {todo.due_date && (
        <span
          className={`text-xs ${
            isOverdue(todo)
              ? "font-bold text-[var(--brand-signal)]"
              : "text-muted-foreground"
          }`}
        >
          {formatDate(todo.due_date, locale)}
        </span>
      )}
      <div className="flex flex-wrap justify-end">
        <TodoDialog
          projectId={projectId}
          dayType={dayType}
          todo={todo}
          trigger={
            <Button variant="ghost" size="sm">
              {t("common.edit")}
            </Button>
          }
        />
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          disabled={pending}
          onClick={() => {
            if (window.confirm(t("todos.deleteConfirm"))) {
              startTransition(() => deleteTodo(todo.id, projectId));
            }
          }}
        >
          {t("common.delete")}
        </Button>
      </div>
    </div>
  );
}

export function TodosTable({
  todos,
  projectId,
  dayType,
}: {
  todos: TodoItem[];
  projectId: string;
  dayType: DayType;
}) {
  const t = useTranslations("todos");
  const [optimisticTodos, applyOrder] = useOptimistic(
    todos,
    (_current, next: TodoItem[]) => next
  );
  const [, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = optimisticTodos.findIndex((x) => x.id === active.id);
    const newIndex = optimisticTodos.findIndex((x) => x.id === over.id);
    const next = arrayMove(optimisticTodos, oldIndex, newIndex);
    startTransition(async () => {
      applyOrder(next);
      await reorderTodos(projectId, dayType, next.map((x) => x.id));
    });
  }

  if (todos.length === 0) {
    return (
      <p className="border p-10 text-center text-sm text-muted-foreground">
        {t("empty")}
      </p>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext
        items={optimisticTodos.map((x) => x.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="border border-b-0">
          {optimisticTodos.map((todo) => (
            <TodoRow
              key={todo.id}
              todo={todo}
              projectId={projectId}
              dayType={dayType}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
