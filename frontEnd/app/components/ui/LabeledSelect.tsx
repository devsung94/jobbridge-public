"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type OptionType = {
  value: string;
  label: string;
};

type LabeledSelectProps = {
  label?: string;
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: OptionType[];
  placeholder?: string;
  required?: boolean;
  className?: string;
  selectRef?: React.Ref<HTMLButtonElement>; // 추가된 ref
};

const LabeledSelect: React.FC<LabeledSelectProps> = ({
  label,
  id,
  name,
  value,
  onChange,
  options,
  placeholder = "선택하세요",
  required = false,
  className = "",
  selectRef,
}) => {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <Select value={value} onValueChange={onChange} name={name} required={required}>
        <SelectTrigger ref={selectRef} id={id} className="w-full h-[42px] min-h-[42px]">
          <SelectValue placeholder={placeholder}  />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LabeledSelect;
