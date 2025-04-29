"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminTable } from "@/components/admin/AdminTable";
import apiClient from "@/(lib)/utils/apiClient";
import Pagination from "@/components/ui/Pagination";
import { getLabel } from "@/(lib)/utils/labelHelper";
import { communityTypeOptions } from "@/constants/options";
import { Button } from "@/components/ui/Button";
import AdminTabFilter from "@/components/admin/AdminTabFilter";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import AdminListHeader from "@/components/admin/AdminListHeader";

interface Community {
  idx: number;
  title: string;
  category: string;
  userName: string;
  isAnonymous: string;
  isUse: string;
  regDate: string;
  views: number;
  commentsCount: number;
}

export default function ManageCommunity() {
  const router = useRouter();
  const [posts, setPosts] = useState<Community[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const size = 10;
 
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchInput, setSearchInput] = useState({
    searchBy: "title",
    query: "",
  });
  const [filterValues, setFilterValues] = useState<{
    searchBy: string;
    query: string;
    category?: string;
  }>({
    searchBy: "title",
    query: "",
    category: "",
  });

  const tabs = [
    { label: "전체", value: "" },
    { label: "자유", value: "free" },
    { label: "Q&A", value: "qna" },
    { label: "후기", value: "review" },
  ];
  const filters = [
    {
      key: "searchBy",
      label: "검색 기준",
      options: [
        { value: "title", label: "제목" },
        { value: "userId", label: "아이디" },
        { value: "name", label: "이름" },
      ],
    },
  ];

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setFilterValues((prev) => ({ ...prev, category })); // 상태만 변경
  };

  
  async function fetchFilteredData() {
    try {
      const { searchBy, query, category } = filterValues;
  
      // URL에 쿼리 스트링 반영
      const searchParams = new URLSearchParams();
      if (category) searchParams.set("category", category);
      if (query && searchBy) searchParams.set(searchBy, query);
      searchParams.set("page", page.toString());
      searchParams.set("size", size.toString());
  
      router.push(`/admin/community?${searchParams.toString()}`); // URL에 반영
  
      const { data } = await apiClient.get("/admin/community", {
        params: {
          page,
          size,
          ...(category && { category }),
          ...(query && searchBy ? { [searchBy]: query } : {}),
        },
      });
      // console.log(data);
  
      if (data.result === "Y") {
        setPosts(data.data.communitys || []);
        setTotalPages(data.data.totalPages || 1);
        setTotalElements(data.data.totalElements || 0);
      } else {
        setPosts([]);
        setTotalPages(1);
        setTotalElements(0);
      }
    } catch (error) {
      console.error("사용자 목록 조회 오류:", error);
      alert("사용자 목록 조회 중 오류가 발생했습니다.");
    }
  }
  useEffect(() => {
    fetchFilteredData();
  }, [selectedCategory, filterValues, page]);

  const fetchPosts = async (
    selectedCategory: string,
    filterValues: { searchBy: string; query: string },
    pageNumber: number
  ) => {
    try {
      const { searchBy, query } = filterValues;
      const params: Record<string, string | number> = {
        page: pageNumber,
        size,
      };
      if (selectedCategory) params.category = selectedCategory;
      if (query && searchBy) params[searchBy] = query;
  
      const { data } = await apiClient.get("/admin/community", { params });
      // console.log(data);
      if(data.result==='Y'){
        setPosts(data.data.communitys);
        setTotalPages(data.data.totalPages);
        setTotalElements(data.data.totalElements);
      }else{
        setPosts([]);
        setTotalPages(1);
        setTotalElements(0);
      }
    } catch (error) {
      console.error("커뮤니티 목록 불러오기 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSingle = async (idx: number) => {
    if (!confirm("해당 게시글을 삭제하시겠습니까?")) return;
  
    try {
      await apiClient.post(`/admin/community/${idx}`);
      alert("삭제 완료");
      fetchPosts(selectedCategory,filterValues,page);
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 실패");
    }
  };
  
  const handleDeleteSelected = async () => {
    if (selectedPosts.length === 0) return alert("삭제할 게시글을 선택해주세요.");
    if (!confirm("선택한 게시글을 삭제하시겠습니까?")) return;

    try {
      await apiClient.post("/admin/community/selectDelete", { idxs: selectedPosts });
      alert("삭제 완료");
      fetchPosts(selectedCategory,filterValues,page);
      setSelectedPosts([]);
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 실패");
    }
  };

  const handleForceDeleteSelected = async () => {
    if (selectedPosts.length === 0) return alert("삭제할 게시글을 선택해주세요.");
    if (!confirm("선택한 게시글을 **완전 삭제**하시겠습니까? 이 작업은 복구되지 않습니다.")) return;
  
    try {
      await apiClient.post("/admin/community/forceDelete", { idxs: selectedPosts });
      alert("완전 삭제 완료");
      fetchPosts(selectedCategory, filterValues, page);
      setSelectedPosts([]);
    } catch (error) {
      console.error("완전 삭제 오류:", error);
      alert("완전 삭제 실패");
    }
  };


  const handleSelect = (idx: number) => {
    // const selectedItem = posts.find((item) => item.idx === idx);
    // if (selectedItem?.isUse === "N") return; // 삭제된 항목이면 무시

    setSelectedPosts((prev) =>
      prev.includes(idx) ? prev.filter((v) => v !== idx) : [...prev, idx]
    );
  };

  const handleSelectAll = () => {
    const selectable = posts.filter((i) => i.isUse !== 'N').map((i) => i.idx);
  
    // 이미 전체 선택되어 있으면 해제
    if (selectedPosts.length === selectable.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(selectable);
    }
  };

  const handleEdit = (idx: number) => {
    window.location.href = `/admin/community/read/${idx}`;
  };

  const columns = [
    {
      header: "카테고리",
      render: (c: Community) => getLabel(communityTypeOptions, c.category)
    },
    {
      header: "제목",
      render: (c: Community) => (
        <span
          className="cursor-pointer text-blue-600 hover:underline"
          onClick={() => handleEdit(c.idx)}
        >
          {c.title}
        </span>
      )
    },
    {
      header: "작성자",
      render: (c: Community) =>
        c.isAnonymous === "Y" ? "익명" : c.userName
    },
    {
      header: "등록일",
      render: (c: Community) =>
        new Date(c.regDate).toLocaleDateString()
    },
    {
      header: "조회수",
      render: (c: Community) => c.views
    },
    {
      header: "댓글수",
      render: (c: Community) => c.commentsCount
    },
    {
      header: "관리",
      render: (c: Community) => (
        <div className="flex justify-center gap-2">
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => handleEdit(c.idx)}
          >
            수정
          </button>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => handleDeleteSingle(c.idx)}
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
      <h1 className="text-2xl font-bold mb-4">커뮤니티 관리</h1>

      <AdminTabFilter
        value={selectedCategory}
        onChange={handleCategoryChange}
        onSearch={fetchFilteredData}
        tabs={tabs}
      />
      
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
        selectedCount={selectedPosts.length}
        onDeleteSelected={handleDeleteSelected}
        onForceDeleteSelected={handleForceDeleteSelected}
      />
      
      <AdminTable
        data={posts}
        columns={columns}
        selectedIds={selectedPosts}
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
