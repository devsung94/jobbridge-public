import React, { useRef, useState, useMemo, forwardRef } from "react";
import { format, parseISO, isValid } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ value, onChange }, ref) => {
    const [open, setOpen] = useState(false);

    const selectedDate = useMemo(() => {
      try {
        const parsed = parseISO(value);
        return isValid(parsed) ? parsed : undefined;
      } catch {
        return undefined;
      }
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "").slice(0, 8);
      let formatted = raw;
      if (raw.length >= 7) {
        formatted = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
      } else if (raw.length >= 5) {
        formatted = `${raw.slice(0, 4)}-${raw.slice(4, 6)}`;
      } else if (raw.length >= 4) {
        formatted = `${raw.slice(0, 4)}`;
      }
      onChange(formatted);
    };

    return (
      <div className="relative w-full mb-3">
        <input
          ref={ref}
          value={value}
          onChange={handleInputChange}
          placeholder="YYYY-MM-DD"
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setOpen((prev) => !prev)}
            >
              <CalendarIcon className="w-5 h-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-50 mt-2" align="end">
            <Calendar
              selectedDate={selectedDate}
              onSelect={(date) => {
                if (!date) return;
                const formatted = format(date, "yyyy-MM-dd");
                onChange(formatted);
                setOpen(false);
              }}
              showOutsideDays
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker"; // forwardRef 사용 시 필수

export default DatePicker;
