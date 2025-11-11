"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface DateRangePickerProps {
  value?: { from?: string; to?: string };
  onChange?: (value: { from?: string; to?: string }) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [state, setState] = useState<{ from?: string; to?: string }>(value ?? {});

  const display = state.from && state.to ? `${format(new Date(state.from), "MMM d")} - ${format(new Date(state.to), "MMM d")}` : "Pick range";

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => {
          const today = new Date();
          const nextWeek = new Date();
          nextWeek.setDate(today.getDate() + 7);
          const nextState = { from: state.from ?? today.toISOString().slice(0, 10), to: state.to ?? nextWeek.toISOString().slice(0, 10) };
          setState(nextState);
          onChange?.(nextState);
        }}
      >
        <CalendarIcon className="h-4 w-4" />
        <span className="text-sm">{display}</span>
      </Button>
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <Input
          type="date"
          value={state.from ?? ""}
          onChange={(event) => {
            const nextState = { ...state, from: event.target.value };
            setState(nextState);
            onChange?.(nextState);
          }}
        />
        <Input
          type="date"
          value={state.to ?? ""}
          onChange={(event) => {
            const nextState = { ...state, to: event.target.value };
            setState(nextState);
            onChange?.(nextState);
          }}
        />
      </div>
    </div>
  );
}
