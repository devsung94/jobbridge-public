import { Search } from "lucide-react";
import LabeledSelect from "@/components/ui/LabeledSelect";
import { communityTypeOptions } from "@/constants/options";

export function CommunitySearchBar({
  category,
  setCategory,
  searchKeyword,
  setSearchKeyword,
  onSearch,
}: {
  category: string;
  setCategory: (value: string) => void;
  searchKeyword: string;
  setSearchKeyword: (value: string) => void;
  onSearch: () => void;
}) {
  return (
    <div className="flex items-center gap-3 w-full">
      {/* 셀렉트 + 검색창 그룹 */}
      <div className="flex w-full gap-2">
        {/* 카테고리 셀렉트 (25%) */}
        <div className="w-1/4">
          <LabeledSelect
            label=""
            id="category"
            name="category"
            value={category}
            onChange={(value) => setCategory(value)}
            options={communityTypeOptions}
            placeholder="카테고리"
            className="w-full h-[42px]"
          />
        </div>

        {/* 검색창 (75%) */}
        <div className="flex items-center w-3/4 border rounded px-4 py-2 bg-white shadow-sm">
          <input
            type="text"
            placeholder="제목 또는 내용을 검색해주세요."
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
    </div>
  );
}
