// JobSearchBar.tsx

"use client";

import { Search } from "lucide-react";
import LabeledSelect, { OptionType } from "@/components/ui/LabeledSelect";
import { cityTypeOptions } from "@/constants/options";

export function JobSearchBar({
  searchKeyword,
  setSearchKeyword,
  selectedCity,
  setSelectedCity,
  onSearch,
}: {
  searchKeyword: string;
  setSearchKeyword: (value: string) => void;
  selectedCity: string;
  setSelectedCity: (value: string) => void;
  onSearch: () => void;
}) {
  return (
    <div className="flex w-full items-center gap-2">
      {/* 지역 선택 셀렉트 박스 */}
      <div className="w-36">
        <LabeledSelect
          id="city"
          name="city"
          value={selectedCity}
          onChange={setSelectedCity}
          options={[{ value: "all", label: "전체" }, ...cityTypeOptions]}
          placeholder="지역 선택"
        />
      </div>

      {/* 검색창 */}
      <div className="flex items-center w-full border rounded px-4 py-2 bg-white shadow-sm">
        <input
          type="text"
          placeholder="제목 또는 회사명을 검색해주세요."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSearch();
            }
          }}
          className="flex-grow text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
        />
        <button onClick={onSearch} className="ml-2 text-gray-500 hover:text-gray-700">
          <Search size={18} />
        </button>
      </div>
    </div>
  );
}
