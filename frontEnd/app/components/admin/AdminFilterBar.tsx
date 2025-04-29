// components/AdminFilterBar.tsx
"use client";

import React from "react";

export interface AdminFilterBarProps {
  filters: {
    key: string;
    label: string;
    options: { value: string; label: string }[];
  }[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onSearch: () => void;
}

const AdminFilterBar: React.FC<AdminFilterBarProps> = ({ filters, values, onChange, onSearch }) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
      {/* 왼쪽: 분류 셀렉트 */}
      <div className="flex items-center gap-3 flex-wrap">
        {filters.map(({ key, options }) => (
          <select
            key={key}
            id={key}
            value={values[key] || ""}
            onChange={(e) => onChange(key, e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}

        {/* 검색창 */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="검색어 입력"
            value={values.query || ""}
            onChange={(e) => onChange("query", e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // 폼 제출 방지
                onSearch();
              }
            }}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm w-56"
          />
          <button
            type="button"
            onClick={onSearch}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700"
          >
            검색
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminFilterBar;
