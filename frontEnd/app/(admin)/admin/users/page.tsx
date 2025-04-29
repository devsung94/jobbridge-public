"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminTable } from "@/components/admin/AdminTable";
import apiClient from "@/(lib)/utils/apiClient";
import Pagination from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import AdminTabFilter from "@/components/admin/AdminTabFilter";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import AdminListHeader from "@/components/admin/AdminListHeader";

interface User {
  idx: number;
  role: string;
  userId: string;
  name: string;
  email: string;
  address: string;
  isUse: string;
}

export default function ManageUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const size = 10;
  
  const [selectedRole, setSelectedRole] = useState("");
  const [searchInput, setSearchInput] = useState({
    searchBy: "userId",
    query: "",
  });
  const [filterValues, setFilterValues] = useState<{
    searchBy: string;
    query: string;
    role?: string;
  }>({
    searchBy: "userId",
    query: "",
    role: "",
  });
  

  const tabs = [
    { label: "전체", value: "" },
    { label: "일반회원", value: "user" },
    { label: "기업회원", value: "com" },
  ];
  const filters = [
    {
      key: "searchBy",
      label: "검색 기준",
      options: [
        { value: "userId", label: "아이디" },
        { value: "name", label: "이름" },
      ],
    },
  ];

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setFilterValues((prev) => ({ ...prev, role })); // 상태만 변경
  };
  
  
  async function fetchFilteredData() {
    try {
      const { searchBy, query, role } = filterValues;
  
      // URL에 쿼리 스트링 반영
      const searchParams = new URLSearchParams();
      if (role) searchParams.set("role", role);
      if (query && searchBy) searchParams.set(searchBy, query);
      searchParams.set("page", page.toString());
      searchParams.set("size", size.toString());
  
      router.push(`/admin/users?${searchParams.toString()}`); // URL에 반영
  
      const { data } = await apiClient.get("/admin/users", {
        params: {
          page,
          size,
          ...(role && { role }),
          ...(query && searchBy ? { [searchBy]: query } : {}),
        },
      });
      // console.log(data);
  
      if (data.result === "Y") {
        setUsers(data.data.users || []);
        setTotalPages(data.data.totalPages || 1);
        setTotalElements(data.data.totalElements || 0);
      } else {
        setUsers([]);
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
  }, [selectedRole, filterValues, page]); 

  const fetchUsers = async (
    selectedRole: string,
    filterValues: { searchBy: string; query: string },
    pageNumber: number
  ) => {
    try {
      const { searchBy, query } = filterValues;
      const params: Record<string, string | number> = {
        page: pageNumber,
        size,
      };
  
      if (selectedRole) params.role = selectedRole;
      if (query && searchBy) params[searchBy] = query;
  
      const { data } = await apiClient.get("/admin/users", { params });
      // console.log(data);
  
      if(data.result==='Y'){
        setUsers(data.data.users);
        setTotalPages(data.data.totalPages);
        setTotalElements(data.data.totalElements);
      }else{
        setUsers([]);
        setTotalPages(1);
        setTotalElements(0);
      }
    } catch (error) {
      console.error("사용자 목록 오류:", error);
    } finally {
      setLoading(false);
    }
  };
  
    
  const handleDeleteSingle = async (idx: number) => {
    if (!confirm("해당 게시글을 삭제하시겠습니까?")) return;
  
    try {
      await apiClient.delete(`/admin/users/${idx}`);
      alert("삭제 완료");
      fetchUsers(selectedRole,filterValues,page);
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 실패");
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedUsers.length === 0) return alert("삭제할 사용자를 선택해주세요.");
    if (!confirm("선택한 사용자를 삭제할까요?")) return;

    try {
      await apiClient.post("/admin/users/selectDelete", { idxs: selectedUsers });
      alert("삭제 완료");
      fetchUsers(selectedRole,filterValues,page);
      setSelectedUsers([]);
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 실패");
    }
  };

  const handleForceDeleteSelected = async () => {
    if (selectedUsers.length === 0) return alert("삭제할 회원을 선택해주세요.");
    if (!confirm("선택한 회원을 **완전 삭제**하시겠습니까?\n채용공고,지원내역,커뮤니티,문의내역 전부 삭제됩니다.\n이 작업은 복구되지 않습니다.")) return;
  
    try {
      await apiClient.post("/admin/users/forceDelete", { idxs: selectedUsers });
      alert("완전 삭제 완료");
      fetchUsers(selectedRole, filterValues, page);
      setSelectedUsers([]);
    } catch (error) {
      console.error("완전 삭제 오류:", error);
      alert("완전 삭제 실패");
    }
  };

  const handleSelect = (idx: number) => {
    // const selectedItem = users.find((item) => item.idx === idx);
    // if (selectedItem?.isUse === "N") return; // 삭제된 항목이면 무시

    setSelectedUsers((prev) =>
      prev.includes(idx) ? prev.filter((v) => v !== idx) : [...prev, idx]
    );
  };

  const handleSelectAll = () => {
    const selectable = users.filter((i) => i.isUse !== 'N').map((i) => i.idx);
  
    // 이미 전체 선택되어 있으면 해제
    if (selectedUsers.length === selectable.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(selectable);
    }
  };

  const handleEdit = (idx: number) => {
    window.location.href = `/admin/users/edit/${idx}`;
  };


  const columns = [
    {
      header: "회원구분",
      render: (u: User) => (u.role === "user" ? "일반회원" : "기업회원")
    },
    {
      header: "아이디",
      render: (u: User) => <span className="cursor-pointer" onClick={() => handleEdit(u.idx)}>{u.userId}</span>
    },
    { header: "이름", render: (u: User) => u.name },
    { header: "이메일", render: (u: User) => u.email },
    { header: "주소", render: (u: User) => u.address },
    {
      header: "관리",
      render: (u: User) => (
        <div className="flex justify-center gap-2">
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => handleEdit(u.idx)}
          >
            수정
          </button>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => handleDeleteSingle(u.idx)}
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
      <h1 className="text-2xl font-bold mb-4">사용자 관리</h1>
      <AdminTabFilter
        value={selectedRole}
        onChange={handleRoleChange}
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
        selectedCount={selectedUsers.length}
        onDeleteSelected={handleDeleteSelected}
        onForceDeleteSelected={handleForceDeleteSelected}
      />

      <AdminTable
        data={users}
        columns={columns}
        selectedIds={selectedUsers}
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
