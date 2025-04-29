"use client";

import { Button } from "@/components/ui/Button";
import { Building2 } from "lucide-react";

interface AdminListHeaderProps {
  totalCount: number;
  selectedCount: number;
  onDeleteSelected: () => void;
  onForceDeleteSelected: () => void;
}

export default function AdminListHeader({
  totalCount,
  selectedCount,
  onDeleteSelected,
  onForceDeleteSelected,
}: AdminListHeaderProps) {
  // console.log("totalCount",totalCount);
  return (
    <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-1">
            <Building2 className="w-5 h-5 text-blue-500" />
          </h2>
          <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
            총 {totalCount}개
          </span>
        </div>

      
        <div className="flex gap-2">
          <Button
            onClick={onDeleteSelected}
            disabled={selectedCount === 0}
            className="mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            선택 삭제
          </Button>

          <Button
            onClick={onForceDeleteSelected}
            disabled={selectedCount === 0}
            className="mb-4 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
          >
            선택 완전 삭제
          </Button>
        </div>
    </div>
  );
}
