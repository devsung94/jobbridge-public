"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/(lib)/utils/apiClient";
import { Tabs } from "@/components/ui/Tabs";
import Pagination from "@/components/ui/Pagination";
import { getLabel } from "@/(lib)/utils/labelHelper";
import { communityTypeOptions } from "@/constants/options";
import { useAuth } from "@/(lib)/utils/AuthContext";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CommunityPost {
  idx: number;
  title?: string;
  category?: string;
  userName: string;
  regDate: string;
  content?: string;
  views?: number;
  commentsCount?: number;
  isAnonymous?: string;
  latestCommentId : number;
}

export default function MyCommunityPosts() {
  const router = useRouter();
  const { mode } = useParams(); // <-- mode 받아옴
  const { userId } = useAuth();

  const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const size = 10;

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let apiUrl =
      mode === "posts" ? `/user/community/posts` : `/user/community/comments`;
      const { data } = await apiClient.get(`${apiUrl}?page=${page}&size=${size}`);
      // console.log("fetch : ",data);
      if (data.result == "Y") {
        setPosts(data.data.items);
        setTotalPages(data.data.totalPages);
        setTotalElements(data.data.totalElements);
      } else {
        setPosts([]);
        setTotalPages(1);
        setTotalElements(0);
      }
    } catch (err) {
      console.error("목록 불러오기 실패:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "posts" || mode === "comments") {
      setActiveTab(mode);
    } else {
      router.replace("/mypage/community/posts");
      return;
    }
  
    if (userId) {
      fetchPosts();
    }
  }, [mode, activeTab, page, userId]);
  

  return (
    <div className="max-w-4xl mx-auto mt-6 px-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">내 커뮤니티 활동</h2>

      <Tabs
        active={activeTab}
        onTabChange={(val) => {
          setPage(1);
          router.push(`/mypage/community/${val}`);
        }}
        options={[
          { label: "작성한 게시글", value: "posts" },
          { label: "댓글 단 게시글", value: "comments" },
        ]}
      />

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-1">
            <Building2 className="w-5 h-5 text-blue-500" />
          </h2>
          <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
            총 {totalElements}개
          </span>
        </div>
        <Button variant={"white"} size={"sm"} onClick={() => router.back()}>
          ← 뒤로가기
        </Button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">로딩 중...</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-500">등록한 채용공고가 없습니다.</p>
      ) : (
        <>
            <ul className="space-y-4">
                {posts.map((post) => (
                <li
                    key={post.idx}
                    className="p-4 border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      let this_link = (mode=="comments") ? `?mode=posts&highlightComment=${post.latestCommentId}` : "?mode=posts";
                      router.push(`/community/${post.idx}${this_link}`)
                    }}
                >
                    <div className="flex justify-between items-center">
                    {post.category && (
                        <span className="text-sm text-blue-600">
                        [{getLabel(communityTypeOptions, post.category)}]
                        </span>
                    )}
                    <span className="text-xs text-gray-500">
                        {post.views !== undefined ? `조회 ${post.views}` : ""}
                        {post.commentsCount !== undefined ? ` | 댓글 ${post.commentsCount}` : ""}
                    </span>
                    </div>
                    <h2 className="text-lg font-semibold mt-1">{post.title || "제목 없음"}</h2>
                    <p className="text-sm text-gray-500">
                    작성자: {post.isAnonymous === "Y" ? "익명" : post.userName} |{" "}
                    {new Date(post.regDate).toLocaleDateString()}
                    </p>
                </li>
                ))}
            </ul>

            <Pagination 
                currentPage={page} 
                totalPages={totalPages} 
                onPageChange={setPage} />

        </>
      )}
    </div>
  );
}
