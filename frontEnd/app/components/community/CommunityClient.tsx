'use client';

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "@/(lib)/utils/apiClient";
import { useAuth } from "@/(lib)/utils/AuthContext";
import { CommunitySearchBar } from "./CommunitySearchBar";
import { communityTypeOptions } from "@/constants/options";
import { getLabel } from "@/(lib)/utils/labelHelper";
import Pagination from "@/components/ui/Pagination";

interface Community {
  idx: number;
  title: string;
  category: string;
  userName: string;
  isAnonymous: string;
  regDate: string;
  views: number;
  commentsCount: number;
  thumbnailUrl?: string;
  attachments?: {
    idx: number;
    fileUrl: string;
    fileName: string;
    fileSize: number;
  }[];
}

export default function CommunityClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role, isLoggedIn } = useAuth();

  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("size")) || 10;

  const [searchKeyword, setSearchKeyword] = useState("");
  const [category, setCategory] = useState("all");
  const [communitys, setCommunitys] = useState<Community[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const currentParams = searchParams.toString();

  useEffect(() => {
    setSearchKeyword(searchParams.get("keyword") || "");
    setCategory(searchParams.get("category") || "all");
  }, [searchParams]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const query = new URLSearchParams({
          page: currentPage.toString(),
          size: pageSize.toString(),
        });

        const keyword = searchParams.get("keyword");
        const category = searchParams.get("category");

        if (keyword) query.set("keyword", keyword);
        if (category) query.set("category", category);

        const { data } = await apiClient.get(`/community?${query.toString()}`);

        if (data.result === "Y") {
          setCommunitys(data.data.communitys);
          setTotalPages(data.data.totalPages);
        } else {
          setCommunitys([]);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("커뮤니티 목록 불러오기 실패:", error);
        setCommunitys([]);
        setTotalPages(1);
      }
    };

    fetchPosts();
  }, [currentPage, pageSize, searchParams]);

  const handleSearch = () => {
    const query = new URLSearchParams({ page: "1", size: pageSize.toString() });
    if (searchKeyword.trim()) query.set("keyword", searchKeyword.trim());
    if (category !== "all") query.set("category", category);
    router.push(`/community?${query.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const query = new URLSearchParams(searchParams.toString());
    query.set("page", newPage.toString());
    router.push(`/community?${query.toString()}`);
  };

  const handleCheckPage = () => {
    if (!isLoggedIn || !role) {
      if (confirm("로그인 후 이용이 가능합니다. 이동하시겠습니까?")) {
        router.push("/login");
      }
    } else {
      router.push("/community/new");
    }
  };

  const renderList = () => (
    <ul className="space-y-4">
      {communitys.map((community) => (
        <li
          key={community.idx}
          className="p-4 border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer"
          onClick={() => router.push(`/community/${community.idx}?${currentParams}`)}
        >
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-600">
              [{getLabel(communityTypeOptions, community.category)}]
            </span>
            <span className="text-xs text-gray-500">
              조회 {community.views} | 댓글 {community.commentsCount}
            </span>
          </div>
          <h2 className="text-lg font-semibold mt-1">{community.title}</h2>
          <p className="text-sm text-gray-500">
            작성자: {community.isAnonymous === "Y" ? "익명" : community.userName} | {new Date(community.regDate).toLocaleDateString()}
          </p>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <div className="flex justify-between items-center gap-2 mt-2 mb-6">
        <CommunitySearchBar
          category={category}
          setCategory={setCategory}
          searchKeyword={searchKeyword}
          setSearchKeyword={setSearchKeyword}
          onSearch={handleSearch}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded whitespace-nowrap"
          onClick={handleCheckPage}
        >
          + 글쓰기
        </button>
      </div>

      {communitys.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-lg">등록된 게시글이 없습니다.</p>
          <p className="text-sm text-gray-400">첫 글을 작성해보세요!</p>
        </div>
      ) : (
        <>
          {renderList()}
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </>
  );
}
