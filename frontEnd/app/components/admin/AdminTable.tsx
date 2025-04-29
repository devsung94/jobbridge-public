"use client";

import React from "react";

export type Column<T> = {
  header: string;
  render: (item: T, index: number) => React.ReactNode;
  className?: string;
};

export type AdminTableProps<T extends { idx: number }> = {
  data: T[];
  columns: Column<T>[];
  selectedIds: number[];
  onSelectAll: () => void;
  onSelect: (id: number) => void;
};

export function AdminTable<T extends { idx: number }>({
  data,
  columns,
  selectedIds,
  onSelectAll,
  onSelect,
}: AdminTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded shadow-sm">
      <table className="min-w-full text-sm text-center">
        <thead className="bg-gray-100 text-gray-700 font-semibold">
          <tr>
            <th className="px-4 py-2 border">
              {(() => {
                const activeIds = data.filter((item) => (item as any).isUse !== "N").map((item) => item.idx);
                return (
                  <input
                    type="checkbox"
                    onChange={onSelectAll}
                    checked={activeIds.length > 0 && selectedIds.length === activeIds.length}
                  />
                );
              })()}
            </th>
            {columns.map((col, idx) => (
              <th key={idx} className={`px-4 py-2 border ${col.className || ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="text-gray-800">
          {data.length > 0 ? (
            data.map((item, rowIndex) => (
              <tr
                key={item.idx}
                className={`hover:bg-gray-50 ${
                  (item as any).isUse === "N" ? "opacity-50 text-gray-400 line-through" : ""
                }`}
              >
                <td className="px-4 py-2 border">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.idx)}
                    onChange={() => onSelect(item.idx)}
                  />
                </td>
                {columns.map((col, idx) => (
                  <td
                    key={idx}
                    className={`px-4 py-2 border whitespace-nowrap ${col.className || ""}`}
                  >
                    {col.render(item, rowIndex)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + 1} className="text-center text-gray-500 py-6">
                데이터가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}