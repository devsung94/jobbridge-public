// components/ui/Tabs.tsx
"use client";

import React from "react";

interface TabProps {
  label: string;
  value: string;
  isActive: boolean;
  onClick: () => void;
}

export const Tab = ({ label, isActive, onClick }: TabProps) => (
  <button
    className={`text-sm font-medium px-4 py-2 border-b-2 transition-colors duration-200 whitespace-nowrap
      ${isActive ? "text-blue-600 border-blue-600" : "text-gray-500 border-transparent hover:text-blue-500"}`}
    onClick={onClick}
  >
    {label}
  </button>
);

interface TabsProps {
  active: string;
  options: { label: string; value: string }[];
  onTabChange: (val: string) => void;
}

export const Tabs = ({ active, options, onTabChange }: TabsProps) => (
  <div className="flex gap-2 border-b mb-6 overflow-x-auto">
    {options.map((opt) => (
      <Tab
        key={opt.value}
        label={opt.label}
        value={opt.value}
        isActive={active === opt.value}
        onClick={() => onTabChange(opt.value)}
      />
    ))}
  </div>
);