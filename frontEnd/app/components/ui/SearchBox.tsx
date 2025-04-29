import { Search } from "lucide-react";

type SearchBoxProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
};

export const SearchBox: React.FC<SearchBoxProps> = ({ value, onChange, onSearch }) => {
  return (
    <div className="flex items-center w-full border rounded-full px-4 py-2 bg-white shadow-sm">
      <input
        type="text"
        placeholder="검색어 입력"
        value={value}
        onChange={onChange}
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
  );
};
