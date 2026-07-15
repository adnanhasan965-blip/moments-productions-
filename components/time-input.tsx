"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { normalizeTime } from "@/lib/time";

interface Props
  extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "type"> {
  /** controlled value (HH:MM) — omit for uncontrolled forms */
  value?: string;
  onValueChange?: (v: string) => void;
  defaultValue?: string;
}

/**
 * 24-hour time field without the native picker's AM/PM trap:
 * type anything time-like, it normalizes to HH:MM on blur.
 */
export function TimeInput({ value, onValueChange, defaultValue, ...props }: Props) {
  const [draft, setDraft] = useState(
    (value ?? defaultValue ?? "").slice(0, 5)
  );

  // keep in sync when the controlled value changes externally (row add/remove)
  useEffect(() => {
    if (value !== undefined) setDraft(value.slice(0, 5));
  }, [value]);

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      placeholder="06:30"
      maxLength={5}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        const normalized = normalizeTime(draft);
        setDraft(normalized);
        onValueChange?.(normalized);
      }}
    />
  );
}
