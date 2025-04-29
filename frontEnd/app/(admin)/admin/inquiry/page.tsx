"use client";

import { useEffect, useState } from "react";
import { AdminTable } from "@/components/admin/AdminTable";
import apiClient from "@/(lib)/utils/apiClient";
import Pagination from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useRouter, useSearchParams } from "next/navigation";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import AdminListHeader from "@/components/admin/AdminListHeader";

interface AnswerDTO {
    idx: number;
    userId: string;
    userName: string;
    inquiryType: "answer";
    parentsIdx: number;
    title: string;
    content: string;
    isUse: string;
    regDate: string;
    editDate: string | null;
  }
  
  interface Inquiry {
    idx: number;
    userId: string;
    userName: string;
    title: string;
    content: string;
    isUse: string;
    status: "N" | "Y";
    regDate: string;
    answerDTO?: AnswerDTO; // 선택적 객체로 선언
  }
  

export default function AdminInquiryManagePage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  
  const [currentAnswerIdx, setCurrentAnswerIdx] = useState<number | null>(null);
  const [isEditAnswerMode, setIsEditAnswerMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentIdx, setCurrentIdx] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState("");
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const pageSize = 10;

  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState({
    searchBy: "title",
    query: "",
  });
  const [filterValues, setFilterValues] = useState({
    searchBy: "title",
    query: "",
  });

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


  // 2. 검색 실행 함수
  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (searchInput.query) searchParams.set("query", searchInput.query);
    if (searchInput.searchBy) searchParams.set("searchBy", searchInput.searchBy);
    searchParams.set("page", "1");
  
    router.push(`/admin/inquiry?${searchParams.toString()}`); // URL 반영
    setPage(1);
  };

  useEffect(() => {
    const paramQuery = searchParams.get("query") || "";
    const paramSearchBy = searchParams.get("searchBy") || "title";

    setSearchInput({ searchBy: paramSearchBy, query: paramQuery });
    setFilterValues({ searchBy: paramSearchBy, query: paramQuery });
    fetchInquiries(page, paramSearchBy, paramQuery);
  }, [searchParams, page]);

  const fetchInquiries = async (pageNumber: number, searchBy: string, query: string) => {
    try {
      const params: Record<string, any> = {
        page: pageNumber,
        size: pageSize,
      };
      if (query && searchBy) {
        params[searchBy] = query;
      }
      // console.log("params",params);
      const { data } = await apiClient.get("/admin/inquiry", { params });
      // console.log(data);

      if (data.result === "Y") {
        setInquiries(data.data.contents);
        setTotalPages(data.data.totalPages);
        setTotalElements(data.data.totalElements);
      } else {
        setInquiries([]);
        setTotalPages(1);
        setTotalElements(0);
      }
    } catch (err) {
      console.error("문의 목록 로딩 오류:", err);
      alert("오류가 발생했습니다.");
    }
  };

  const handleDeleteSingle = async (idx: number) => {
    if (!confirm("해당 문의를 삭제하시겠습니까?")) return;
    try {
      const { data } = await apiClient.delete(`/admin/inquiry/${idx}`);
      if (data.result === "Y") {
        alert("삭제 완료");
        fetchInquiries(page, filterValues.searchBy, filterValues.query);
      } else {
        alert("삭제 실패: " + data.message);
      }
    } catch (err) {
      console.error("삭제 오류:", err);
      alert("삭제 중 오류 발생");
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return alert("삭제할 항목을 선택해주세요.");
    if (!confirm("선택한 문의를 삭제하시겠습니까?")) return;
    try {
      await apiClient.post("/admin/inquiry/selectDelete", { idxs: selectedIds });
      alert("삭제 완료");
      fetchInquiries(page, filterValues.searchBy, filterValues.query);
      setSelectedIds([]);
    } catch (err) {
      console.error("삭제 오류:", err);
      alert("삭제 실패");
    }
  };

  
  const handleForceDeleteSelected = async () => {
    if (selectedIds.length === 0) return alert("삭제할 문의를 선택해주세요.");
    if (!confirm("선택한 문의를 **완전 삭제**하시겠습니까? 이 작업은 복구되지 않습니다.")) return;
  
    try {
      await apiClient.post("/admin/inquiry/forceDelete", { idxs: selectedIds });
      alert("완전 삭제 완료");
      fetchInquiries(page, filterValues.searchBy, filterValues.query);
      setSelectedIds([]);
    } catch (error) {
      console.error("완전 삭제 오류:", error);
      alert("완전 삭제 실패");
    }
  };

  

  const handleSelect = (idx: number) => {
    // const selectedItem = inquiries.find((item) => item.idx === idx);
    // if (selectedItem?.isUse === "N") return; // 삭제된 항목이면 무시
  
    setSelectedIds((prev) =>
      prev.includes(idx) ? prev.filter((v) => v !== idx) : [...prev, idx]
    );
  };
  
  const handleSelectAll = () => {
    const selectable = inquiries.filter((i) => i.isUse !== 'N').map((i) => i.idx);
  
    // 이미 전체 선택되어 있으면 해제
    if (selectedIds.length === selectable.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(selectable);
    }
  };

  const openAnswerDialog = (idx: number) => {
    setCurrentIdx(idx);
    setCurrentAnswerIdx(null); // 등록
    setAnswerText("");
    setIsDialogOpen(true);
  }; 

  const openEditDialog = (inquiry: Inquiry) => {
    setCurrentIdx(inquiry.idx);
    setEditTitle(inquiry.title);
    setEditContent(inquiry.content);
    setIsEditDialogOpen(true);
  };
  
  const submitInquiryEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      return alert("제목과 내용을 모두 입력해주세요.");
    }
  
    try {
      const { data } = await apiClient.put(`/admin/inquiry/${currentIdx}`, {
        title: editTitle,
        content: editContent,
      });
  
      if (data.result === "Y") {
        alert("문의가 수정되었습니다.");
        setIsEditDialogOpen(false);
        fetchInquiries(page, filterValues.searchBy, filterValues.query);
      } else {
        alert("수정 실패: " + data.message);
      }
    } catch (err) {
      console.error("문의 수정 오류:", err);
      alert("문의 수정 중 오류 발생");
    }
  };
  

  
  const submitAnswer = async () => {
    if (!answerText.trim()) return alert("답변 내용을 입력해주세요.");
  
    try {
      let res;
  
      if (currentAnswerIdx) {
        // 답변 수정
        res = await apiClient.put(`/admin/inquiry/answer/${currentAnswerIdx}`, {
          content: answerText,
        });
      } else {
        // 답변 등록
        res = await apiClient.post(`/admin/inquiry/answer`, {
          parentsIdx: currentIdx,
          content: answerText,
        });
      }
  
      if (res.data.result === "Y") {
        alert("답변이 저장되었습니다.");
        setIsDialogOpen(false);
        fetchInquiries(page, filterValues.searchBy, filterValues.query);
      } else {
        alert("답변 처리 실패: " + res.data.message);
      }
    } catch (err) {
      console.error("답변 처리 오류:", err);
      alert("답변 처리 중 오류 발생");
    }
  };
  

  const columns = [
    {
      header: "제목",
      render: (i: Inquiry) => i.title,
    },
    {
      header: "작성자",
      render: (i: Inquiry) => (
        <div className="leading-snug">
          <div>{i.userName}</div>
          <div className="text-gray-500 text-xs">({i.userId})</div>
        </div>
      ),
    },
    {
      header: "등록일",
      render: (i: Inquiry) => new Date(i.regDate).toLocaleDateString(),
    },
    {
      header: "내용",
      render: (i: Inquiry) => (
        <div className="text-left whitespace-pre-wrap max-w-xs truncate">
          {i.content}
        </div>
      ),
    },
    {
      header: "답변상태",
      render: (i: Inquiry) => (
        <span
          className={`px-2 py-1 text-xs rounded ${
            i.status === "Y"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {i.status === "Y" ? "답변완료" : "답변대기"}
        </span>
      ),
    },
    {
      header: "답변",
      render: (i: Inquiry) =>
        i.answerDTO ? (
            <>
                <div className="text-left whitespace-pre-wrap max-w-xs truncate mb-5">
                    {i.answerDTO.content}
                </div>
                { i.isUse==='N' ? "-" :
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                        setCurrentIdx(i.idx);
                        setCurrentAnswerIdx(i.answerDTO!.idx); // 답변 ID
                        setAnswerText(i.answerDTO!.content);   // 기존 내용
                        setIsEditAnswerMode(true);             // 수정 모드 ON
                        setIsDialogOpen(true);
                        }}
                    >
                        답변 수정
                    </Button>              
                }
            </>
        ) : (
            i.isUse=='N' ? "-" 
                         :  <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setCurrentIdx(i.idx);
                                    setCurrentAnswerIdx(null); // 등록 모드
                                    setAnswerText("");
                                    setIsEditAnswerMode(false);
                                    setIsDialogOpen(true);
                                }}
                            >
                                답변 등록
                            </Button>
                       
        ),
        
    },
    {
        header: "관리",
        render: (i: Inquiry) => (
           i.isUse==="N" ? "-" :  
          <div className="flex gap-2 justify-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => openEditDialog(i)}
            >
              문의 수정
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDeleteSingle(i.idx)}
            >
              문의 삭제
            </Button>
          </div>
        )
      },
  ];

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">문의 관리</h1>

      <AdminFilterBar
          filters={filters}
          values={searchInput}
          onChange={(key, value) => setSearchInput((prev) => ({ ...prev, [key]: value }))}
          onSearch={handleSearch}
        />
      
      <AdminListHeader
        totalCount={totalElements}
        selectedCount={selectedIds.length}
        onDeleteSelected={handleDeleteSelected}
        onForceDeleteSelected={handleForceDeleteSelected}
      />

      <AdminTable
        data={inquiries}
        columns={columns}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelect={handleSelect}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* 답변 모달 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditAnswerMode ? "답변 수정" : "답변 등록"}</DialogTitle>
          </DialogHeader>
          <Textarea
            className="w-full min-h-[150px]"
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="답변 내용을 입력하세요"
          />
          <DialogFooter className="mt-4">
            <Button variant="gray" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={submitAnswer} className="ml-2">
                {isEditAnswerMode ? "수정하기" : "등록하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 문의 수정 모달 */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>문의 수정</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
            <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded"
            />
            <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="내용을 입력하세요"
                className="w-full min-h-[150px]"
            />
            </div>

            <DialogFooter className="mt-4">
            <Button variant="gray" onClick={() => setIsEditDialogOpen(false)}>
                취소
            </Button>
            <Button onClick={submitInquiryEdit} className="ml-2">
                수정하기
            </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>

    </div>
  );
}
