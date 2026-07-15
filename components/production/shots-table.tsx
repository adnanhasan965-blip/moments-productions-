"use client";

import { useTranslations } from "next-intl";

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
import { ShotDialog } from "@/components/production/shot-dialog";
import {
  deleteShot,
  duplicateShot,
  reorderShots,
  toggleShotStatus,
} from "@/app/(app)/projects/[id]/days/day-actions";
import type { Shot } from "@/lib/production";

function ShotRow({
  shot,
  dayId,
  projectId,
}: {
  shot: Shot;
  dayId: string;
  projectId: string;
}) {
  const t = useTranslations();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: shot.id });
  const [pending, startTransition] = useTransition();

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex flex-wrap items-center gap-3 border-b p-3 ${
        isDragging ? "z-10 bg-secondary" : "bg-background"
      } ${shot.status === "done" ? "opacity-50" : ""}`}
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
      <div className="w-16 shrink-0 text-sm">
        <p className="font-bold">{shot.shot_number || "—"}</p>
        <p className="text-xs text-muted-foreground">
          {[shot.scene && `SC ${shot.scene}`, shot.shot_size]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      <div className="min-w-48 flex-1 text-sm">
        <p className={shot.status === "done" ? "line-through" : ""}>
          {shot.description}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {[shot.camera_notes, shot.location, shot.cast_subjects]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {shot.planned_time && (
          <span className="font-bold text-foreground">
            {shot.planned_time.slice(0, 5)}
          </span>
        )}
        {shot.estimated_minutes ? t("shots.min", { n: shot.estimated_minutes }) : ""}
        <label className="flex items-center gap-1.5">
          <Checkbox
            checked={shot.status === "done"}
            disabled={pending}
            onCheckedChange={(v) =>
              startTransition(() =>
                toggleShotStatus(shot.id, dayId, projectId, v === true)
              )
            }
          />
          {t("shots.done")}
        </label>
      </div>
      <div className="flex flex-wrap justify-end">
        <ShotDialog
          dayId={dayId}
          projectId={projectId}
          shot={shot}
          trigger={
            <Button variant="ghost" size="sm">
              {t("common.edit")}
            </Button>
          }
        />
        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() => startTransition(() => duplicateShot(shot.id, dayId, projectId))}
        >
          {t("shots.duplicate")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          disabled={pending}
          onClick={() => {
            if (window.confirm(t("shots.deleteConfirm", { number: shot.shot_number || "" }))) {
              startTransition(() => deleteShot(shot.id, dayId, projectId));
            }
          }}
        >
          {t("common.delete")}
        </Button>
      </div>
    </div>
  );
}

export function ShotsTable({
  shots,
  dayId,
  projectId,
}: {
  shots: Shot[];
  dayId: string;
  projectId: string;
}) {
  const t = useTranslations("shots");
  const [optimisticShots, applyOrder] = useOptimistic(
    shots,
    (_current, next: Shot[]) => next
  );
  const [, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = optimisticShots.findIndex((s) => s.id === active.id);
    const newIndex = optimisticShots.findIndex((s) => s.id === over.id);
    const next = arrayMove(optimisticShots, oldIndex, newIndex);
    startTransition(async () => {
      applyOrder(next);
      await reorderShots(dayId, projectId, next.map((s) => s.id));
    });
  }

  if (shots.length === 0) {
    return (
      <p className="border p-10 text-center text-sm text-muted-foreground">
        {t("empty")}
      </p>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext
        items={optimisticShots.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="border border-b-0">
          {optimisticShots.map((shot) => (
            <ShotRow key={shot.id} shot={shot} dayId={dayId} projectId={projectId} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
