"use client";

import React from "react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  size?: "sm" | "md" | "lg";
  maxPageButtons?: number;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  size = "md",
  maxPageButtons = 5,
}) => {
  const sizeClasses = {
    sm: "min-w-[28px] h-7 px-1 text-xs",
    md: "min-w-[36px] h-9 px-2 text-sm",
    lg: "min-w-[44px] h-10 px-3 text-base",
  };
  const btnClass = sizeClasses[size];

  const getPageNumbers = () => {
    const half = Math.floor(maxPageButtons / 2);

    let start = Math.max(1, currentPage - half);
    let end = start + maxPageButtons - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxPageButtons + 1);
    }

    const result = [];
    for (let i = start; i <= end; i++) {
      result.push(i);
    }
    return result;
  };

  const visiblePages = getPageNumbers();

  return (
    <div className="flex justify-center mt-6 gap-1">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className={`${btnClass} border border-gray-300 text-gray-500 rounded-md hover:bg-gray-100 disabled:opacity-30`}
        title="처음"
      >
        〈〈
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${btnClass} border border-gray-300 text-gray-500 rounded-md hover:bg-gray-100 disabled:opacity-30`}
        title="이전"
      >
        〈
      </button>

      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`${btnClass} border transition-colors duration-150 rounded-md ${
            currentPage === page
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${btnClass} border border-gray-300 text-gray-500 rounded-md hover:bg-gray-100 disabled:opacity-30`}
        title="다음"
      >
        〉
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className={`${btnClass} border border-gray-300 text-gray-500 rounded-md hover:bg-gray-100 disabled:opacity-30`}
        title="마지막"
      >
        〉〉
      </button>
    </div>
  );
};

export default Pagination;
