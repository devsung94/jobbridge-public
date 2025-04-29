"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminTable } from "@/components/admin/AdminTable";
import Pagination from "@/components/ui/Pagination";
import apiClient from "@/(lib)/utils/apiClient";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import AdminListHeader from "@/components/admin/AdminListHeader";
import { formatDateTime } from "@/(lib)/utils/common";

interface Visitor {
  idx: number;
  ipAddress: string;
  path: string;
  userAgent: string;
  regDate: string;
}

export default function ManageVisitors() {
  const router = useRouter();
  const [selectedVisitors, setSelectedVisitors] = useState<number[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const size = 10;

  const [searchInput, setSearchInput] = useState({
    searchBy: "ipAddress",
    query: "",
  });
  const [filterValues, setFilterValues] = useState({
    searchBy: "ipAddress",
    query: "",
  });

  const filters = [
    {
      key: "searchBy",
      label: "검색 기준",
      options: [
        { value: "ipAddress", label: "IP 주소" },
        { value: "path", label: "방문 경로" },
      ],
    },
  ];

  const handleSelect = (idx: number) => {
    setSelectedVisitors((prev) =>
      prev.includes(idx) ? prev.filter((id) => id !== idx) : [...prev, idx]
    );
  };

  const handleSelectAll = () => {
    if (selectedVisitors.length === visitors.length) {
      setSelectedVisitors([]);
    } else {
      setSelectedVisitors(visitors.map((v) => v.idx));
    }
  };

  const handleDeleteSingle = async (idx: number) => {
    if (!confirm("해당 방문자 기록을 삭제하시겠습니까?")) return;

    try {
      await apiClient.delete(`/admin/visitors/${idx}`);
      alert("삭제 완료");
      fetchVisitors();
      setSelectedVisitors((prev) => prev.filter((id) => id !== idx));
    } catch (error) {
      console.error("방문자 삭제 오류:", error);
      alert("삭제 실패");
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedVisitors.length === 0) {
      alert("삭제할 방문자를 선택해주세요.");
      return;
    }

    if (!confirm("선택한 방문자 기록을 삭제할까요?")) return;

    try {
      await apiClient.post("/admin/visitors/selectDelete", { idxs: selectedVisitors });
      alert("삭제 완료");
      fetchVisitors();
      setSelectedVisitors([]);
    } catch (error) {
      console.error("방문자 삭제 오류:", error);
      alert("삭제 실패");
    }
  };


  const handleForceDeleteSelected = async () => {
    if (selectedVisitors.length === 0) return alert("삭제할 방문 기록을 선택해주세요.");
    if (!confirm("선택한 방문 기록을 **완전 삭제**하시겠습니까?\n이 작업은 복구되지 않습니다.")) return;
  
    try {
      await apiClient.post("/admin/visitors/forceDelete", { idxs: selectedVisitors });
      alert("완전 삭제 완료");
      fetchVisitors();
      setSelectedVisitors([]);
    } catch (error) {
      console.error("완전 삭제 오류:", error);
      alert("완전 삭제 실패");
    }
  };

  async function fetchVisitors() {
    try {
      const { searchBy, query } = filterValues;

      const searchParams = new URLSearchParams();
      if (query && searchBy) searchParams.set(searchBy, query);
      searchParams.set("page", page.toString());
      searchParams.set("size", size.toString());

      router.push(`/admin/visitors?${searchParams.toString()}`);

      const { data } = await apiClient.get("/admin/visitors", {
        params: {
          page,
          size,
          ...(query && searchBy ? { [searchBy]: query } : {}),
        },
      });

      if (data.result === "Y") {
        setVisitors(data.data.visitors || []);
        setTotalPages(data.data.totalPages || 1);
        setTotalElements(data.data.totalElements || 0);
      } else {
        setVisitors([]);
        setTotalPages(1);
        setTotalElements(0);
      }
    } catch (error) {
      console.error("방문자 목록 조회 오류:", error);
      alert("방문자 목록 조회 중 오류가 발생했습니다.");
    }
  }

  useEffect(() => {
    fetchVisitors();
  }, [filterValues, page]);

  const columns = [
    { header: "IP 주소", render: (v: Visitor) => v.ipAddress },
    { header: "방문 경로", render: (v: Visitor) => v.path },
    { header: "User-Agent", render: (v: Visitor) => v.userAgent },
    { header: "방문일시", render: (v: Visitor) => formatDateTime(v.regDate) },
    {
      header: "관리",
      render: (v: Visitor) => (
        <div className="flex justify-center gap-2">
          <button
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => handleDeleteSingle(v.idx)}
          >
            삭제
          </button>
        </div>
      ),
      className: "whitespace-nowrap"
    }
  ];

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">방문자 관리</h1>

      <AdminFilterBar
        filters={filters}
        values={searchInput}
        onChange={(key, value) =>
          setSearchInput((prev) => ({ ...prev, [key]: value }))
        }
        onSearch={() =>
          setFilterValues((prev) => ({
            ...prev,
            searchBy: searchInput.searchBy,
            query: searchInput.query,
          }))
        }
      />

      <AdminListHeader
        totalCount={totalElements}
        selectedCount={selectedVisitors.length}
        onDeleteSelected={handleDeleteSelected}
        onForceDeleteSelected={handleForceDeleteSelected}
      />

      <AdminTable
        data={visitors}
        columns={columns}
        selectedIds={selectedVisitors}
        onSelectAll={handleSelectAll}
        onSelect={handleSelect}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}
