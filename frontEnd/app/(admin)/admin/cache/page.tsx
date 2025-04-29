"use client";

import { useEffect, useState } from "react";
import { AdminTable } from "@/components/admin/AdminTable";
import Pagination from "@/components/ui/Pagination";
import apiClient from "@/(lib)/utils/apiClient";
import { Button } from "@/components/ui/Button";

interface CacheKey {
  idx: number;
  key: string;
}

const pageSize = 10; // 1페이지당 10개

export default function ManageCaches() {
  const [cacheKeys, setCacheKeys] = useState<CacheKey[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCacheKeys();
  }, []);

  const fetchCacheKeys = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/admin/cache/keys");
      if (Array.isArray(data)) {
        setCacheKeys(
          data.map((key: string, index: number) => ({
            idx: index + 1,
            key,
          }))
        );
      } else {
        setCacheKeys([]);
      }
    } catch (error) {
      console.error("캐시 키 조회 실패", error);
      setCacheKeys([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSingleCache = async (cacheKey: string) => {
    if (!confirm(`정말 ${cacheKey} 캐시를 초기화하시겠습니까?`)) return;
    try {
      const { data } = await apiClient.post(`/admin/cache/clear-key`, null, {
        params: { cacheKey },
      });
      if (data.result === "Y") {
        alert(`${cacheKey} 캐시 초기화 완료`);
        fetchCacheKeys();
      } else {
        alert(`캐시 초기화 실패: ${data.message}`);
      }
    } catch (error) {
      console.error("캐시 초기화 실패", error);
      alert("캐시 초기화 실패");
    }
  };

  const handleClearSelectedCaches = async () => {
    if (selectedIds.length === 0) {
      alert("초기화할 캐시를 선택해주세요.");
      return;
    }

    if (!confirm("선택한 캐시를 모두 초기화하시겠습니까?")) return;

    try {
      const selectedKeys = cacheKeys
        .filter((item) => selectedIds.includes(item.idx))
        .map((item) => item.key);

      // 여러 키를 하나씩 초기화
      for (const key of selectedKeys) {
        await apiClient.post(`/admin/cache/clear-key`, null, {
          params: { cacheKey: key },
        });
      }

      alert("선택한 캐시 초기화 완료");
      fetchCacheKeys();
      setSelectedIds([]);
    } catch (error) {
      console.error("선택 캐시 초기화 실패", error);
      alert("선택 캐시 초기화 실패");
    }
  };

  const totalPages = Math.ceil(cacheKeys.length / pageSize);

  const paginatedKeys = cacheKeys.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedKeys.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedKeys.map((item) => item.idx));
    }
  };

  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const columns = [
    { header: "캐시 키", render: (item: CacheKey) => item.key },
    {
      header: "관리",
      render: (item: CacheKey) => (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleClearSingleCache(item.key)}
        >
          초기화
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">캐시 관리</h1>

      <div className="flex justify-between items-center mb-4">
        <Button
          variant="default"
          onClick={fetchCacheKeys}
          disabled={loading}
        >
          {loading ? "새로고침 중..." : "새로고침"}
        </Button>

        <Button
          variant="destructive"
          onClick={handleClearSelectedCaches}
          disabled={selectedIds.length === 0}
        >
          선택 초기화
        </Button>
      </div>

      <AdminTable
        data={paginatedKeys}
        columns={columns}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelect={handleSelect}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
