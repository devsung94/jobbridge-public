"use client";

import { useState, useEffect } from "react";
import apiClient from "@/(lib)/utils/apiClient";
import Pagination from "@/components/ui/Pagination";
import {Button} from "@/components/ui/Button";
import { Building2 } from "lucide-react";

export default function InquiryPage() {
  const [activeTab, setActiveTab] = useState("inquiryList");
  const [inquiry, setInquiry] = useState({ title: "", content: "" });
  const [inquiryList, setInquiryList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editTargetIdx, setEditTargetIdx] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 5;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInquiry({ ...inquiry, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!inquiry.title || !inquiry.content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }
    try {
      const { data } = await apiClient.post("/user/inquiry", inquiry);
      if (data.result === "Y") {
        alert("문의가 성공적으로 제출되었습니다.");
        setInquiry({ title: "", content: "" });
        setActiveTab("inquiryList");
        fetchInquiryList();
      } else {
        alert("문의 제출 실패: " + data.message);
      }
    } catch (error) {
      console.error("문의 등록 오류:", error);
      alert("문의 제출 중 오류가 발생했습니다.");
    }
  };

  const handleEditClick = (item: any) => {
    setInquiry({ title: item.title, content: item.content });
    setIsEditing(true);
    setEditTargetIdx(item.idx);
    setActiveTab("inquiry");
  };

  const handleUpdate = async () => {
    if (!inquiry.title || !inquiry.content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }
    try {
      const { data } = await apiClient.put(`/user/inquiry/${editTargetIdx}`, inquiry);
      if (data.result === "Y") {
        alert("문의가 수정되었습니다.");
        setInquiry({ title: "", content: "" });
        setIsEditing(false);
        setEditTargetIdx(null);
        setActiveTab("inquiryList");
        fetchInquiryList();
      } else {
        alert("수정 실패: " + data.message);
      }
    } catch (error) {
      console.error("문의 수정 오류:", error);
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async (idx: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      const { data } = await apiClient.delete(`/user/inquiry/${idx}`);
      if (data.result === "Y") {
        alert("삭제되었습니다.");
        fetchInquiryList();
      } else {
        alert("삭제 실패: " + data.message);
      }
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const fetchInquiryList = async () => {
    try {
      const { data } = await apiClient.get(`/user/inquiry?page=${page}&size=${PAGE_SIZE}`);
      // console.log(data);
      if (data.result === "Y") {
        setInquiryList(data.data.contents);
        setTotalPages(data.data.totalPages);
        setTotalElements(data.data.totalElements);
      }
    } catch (error) {
      console.error("문의내역 로딩 오류:", error);
      alert("문의내역을 불러오는 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    if (activeTab === "inquiryList") fetchInquiryList();
  }, [activeTab, page]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border w-full max-w-3xl mx-auto">
      <div className="flex border-b mb-4">
        <button className={`flex-1 p-3 font-semibold text-center ${activeTab === "faq" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`} onClick={() => setActiveTab("faq")}>자주 묻는 질문</button>
        <button className={`flex-1 p-3 font-semibold text-center ${activeTab === "inquiry" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`} onClick={() => { setActiveTab("inquiry"); setIsEditing(false); setInquiry({ title: "", content: "" }); }}>문의하기</button>
        <button className={`flex-1 p-3 font-semibold text-center ${activeTab === "inquiryList" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`} onClick={() => setActiveTab("inquiryList")}>문의내역</button>
      </div>

      {activeTab === "faq" && (
        <div className="space-y-4">
          <div className="border p-4 rounded bg-gray-50">
            <p className="font-semibold">Q: 서비스 이용 방법이 어떻게 되나요?</p>
            <p className="text-gray-600 mt-1">A: 회원가입 후 로그인하여 원하는 서비스를 이용하실 수 있습니다.</p>
          </div>
          <div className="border p-4 rounded bg-gray-50">
            <p className="font-semibold">Q: 비밀번호를 잊어버렸어요. 어떻게 해야 하나요?</p>
            <p className="text-gray-600 mt-1">A: 로그인 페이지에서 '비밀번호 찾기'를 이용해주세요.</p>
          </div>
        </div>
      )}

      {activeTab === "inquiry" && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">{isEditing ? "문의 수정" : "문의 등록"}</h3>
          <input name="title" placeholder="제목" value={inquiry.title} onChange={handleChange} className="w-full border rounded p-3" />
          <textarea name="content" placeholder="내용을 입력하세요." value={inquiry.content} onChange={handleChange} className="w-full border rounded p-3" rows={5}></textarea>
          <button onClick={isEditing ? handleUpdate : handleSubmit} className={`w-full py-3 rounded text-white font-semibold ${isEditing ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}>{isEditing ? "문의 수정" : "문의 제출"}</button>
          {isEditing && (
            <button onClick={() => { setIsEditing(false); setEditTargetIdx(null); setInquiry({ title: "", content: "" }); setActiveTab("inquiryList"); }} className="w-full py-3 mt-2 rounded bg-gray-300 text-gray-700 hover:bg-gray-400">수정 취소</button>
          )}
        </div>
      )}

      {activeTab === "inquiryList" && (
        
        <>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-1">
              <Building2 className="w-5 h-5 text-blue-500" />
            </h2>
            <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
              총 {totalElements}개
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-2">문의내역</h3>
          {inquiryList.length === 0 ? <p className="text-gray-500">문의내역이 없습니다.</p> : (
            <ul className="space-y-4">
              {inquiryList.map((item: any) => (
                <li key={item.idx} className="border p-4 rounded bg-gray-50">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-blue-700">{item.title}</h4>
                    <span className="text-sm text-gray-400">{new Date(item.regDate).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-700 mt-2 whitespace-pre-line">{item.content}</p>
                  {item.answerDTO && (
                    <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-3 rounded">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-green-700">[관리자 답변]</p>
                        <span className="text-xs text-gray-500">{new Date(item.answerDTO.regDate).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-700 mt-2 whitespace-pre-line">{item.answerDTO.content}</p>
                    </div>
                  )}
                  {!item.answerDTO && (
                    <div className="mt-3 flex justify-end gap-2 text-sm">
                      <Button onClick={() => handleEditClick(item)} variant={"default"}>수정하기</Button>
                      <Button onClick={() => handleDelete(item.idx)} variant={"gray"}>삭제하기</Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            onPageChange={(newPage) => setPage(newPage)} />
        </div>
        </>
      )}
    </div>
  );
}
