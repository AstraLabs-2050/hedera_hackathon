"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  differenceInDays,
  differenceInMonths,
  differenceInYears,
} from "date-fns";

const options = [
  { label: "24hrs", value: "24h" },
  { label: "7 days", value: "7d" },
  { label: "1 month", value: "1mo" },
  { label: "1 year", value: "1y" },
  { label: "Custom", value: "custom" },
];

const getCustomRangeLabel = (date: Date) => {
  const now = new Date();
  if (date > now) return "today";

  const years = differenceInYears(now, date);
  if (years > 0) return `last ${years} year${years > 1 ? "s" : ""}`;

  const months = differenceInMonths(now, date);
  if (months > 0) return `last ${months} month${months > 1 ? "s" : ""}`;

  const days = differenceInDays(now, date);
  return `last ${days} day${days !== 1 ? "s" : ""}`;
};

export default function StatsDropdown({
  filter,
  setFilter,
  customDate,
  setCustomDate,
}: {
  filter: string;
  setFilter: (val: string) => void;
  customDate: Date | null;
  setCustomDate: (date: Date | null) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const selectedLabel = () => {
    if (filter === "custom" && customDate)
      return getCustomRangeLabel(customDate);
    return options.find((o) => o.value === filter)?.label || "7 days";
  };

  if (!hasMounted) return null;

  const handleSelect = (val: string) => {
    if (val === "custom") {
      setShowCalendar(true);
      setFilter(val);
    } else {
      setShowCalendar(false);
      setFilter(val);
      setCustomDate(null);
      setIsOpen(false);
    }
  };

  return (
    <div className='flex items-center gap-2'>
      <Popover
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (open && filter === "custom") {
            setShowCalendar(false); // reset calendar on open
          }
        }}>
        <PopoverTrigger asChild>
          <div className='flex items-center gap-1 cursor-pointer text-sm font-medium text-gray-800 rounded-md transition'>
            <span>from {selectedLabel()}</span>
            <ChevronDown size={16} />
          </div>
        </PopoverTrigger>

        <PopoverContent className='w-[250px] p-2'>
          {!showCalendar ? (
            <div className='grid grid-cols-3 gap-2 text-sm'>
              {options.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`text-center p-2 rounded cursor-pointer border hover:bg-gray-100 transition ${
                    opt.value === "custom"
                      ? "col-span-2 flex justify-center items-center gap-1"
                      : ""
                  }`}>
                  {opt.value === "custom" ? "📅 " : ""}
                  {opt.label}
                </div>
              ))}
            </div>
          ) : (
            <div className='mt-3'>
              <Calendar
                mode='single'
                selected={customDate ?? undefined}
                onSelect={(date) => {
                  if (date) {
                    setCustomDate(date);
                    setIsOpen(false);
                  }
                }}
                disabled={(date) => date > new Date()}
              />
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
