"use client";

import React from "react";

interface TabItem {
  label: string;
  value: string;
}

interface AdminTabFilterProps {
  tabs: TabItem[];
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
}

const AdminTabFilter: React.FC<AdminTabFilterProps> = ({ tabs, value, onChange, onSearch }) => {
    const handleClick = (val: string) => {
      onChange(val);
      // if (onSearch) onSearch();
    };
    return (
        <div className="flex  p-1 min-w-100 mb-3">
        {tabs.map((tab) => (
            <button
            key={tab.value}
            onClick={() => handleClick(tab.value)}
            type="button"
            className={`px-4 py-2 text-sm  font-medium transition-colors
                ${
                value === tab.value
                    ? "bg-white text-blue-600 shadow border border-blue-500"
                    : "text-gray-600 hover:bg-white  border border-gray-300"
                }`}
            >
            {tab.label}
            </button>
        ))}
        </div>
    );
};

export default AdminTabFilter;
