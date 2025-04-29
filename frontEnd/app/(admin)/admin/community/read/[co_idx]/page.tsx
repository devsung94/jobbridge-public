"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Paperclip } from "lucide-react";
import apiClient from "@/(lib)/utils/apiClient";
import { Button } from "@/components/ui/Button";
// 상단 import에 추가
import CommunityComments from "@/components/community/CommunityComment";


interface CommunityDetail {
  idx: number;
  userId: string;
  userName: string;
  category: string;
  title: string;
  content: string;
  isAnonymous: string;
  regDate: string;
  views: number;
  tags: string[];
  commentsCount: number;
  thumbnailUrl?: string;
  attachments?: {
    idx: number;
    fileUrl: string;
    fileName: string;
    fileSize: number;
  }[];
}

export default function AdminCommunityDetailPage() {
  const router = useRouter();
  const { co_idx } = useParams();
  const [post, setPost] = useState<CommunityDetail | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await apiClient.get(`/community/${co_idx}`);
        // console.log(data);

        if (data.result === "Y") {
          setPost(data.data);
        } else {
          alert("게시글 정보를 불러오지 못했습니다.");
          router.push("/admin/community");
        }
      } catch (error) {
        console.error("게시글 불러오기 실패:", error);
        alert("오류가 발생했습니다.");
        router.push("/admin/community");
      }
    };

    if (co_idx) fetchPost();
  }, [co_idx, router]);

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const { data } = await apiClient.delete(`/user/community/${co_idx}`);

      if (data.result === "Y") {
        alert("게시글이 삭제되었습니다.");
        router.push("/admin/community");
      } else {
        alert("삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const categoryMap: Record<string, string> = {
    free: "자유",
    qna: "Q&A",
    review: "후기",
  };

  if (!post) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg font-semibold">게시글 로딩 중...</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <div className="mb-4 border-b border-gray-300 pb-4">
          <span className="text-sm text-blue-600 font-semibold">
            [{categoryMap[post.category] || post.category}]
          </span>
          <h1 className="text-2xl font-bold mt-1">{post.title}</h1>
          <p className="text-sm text-gray-600 mt-1">
            작성자 ID: <b>{post.userId}</b> / 이름: <b>{post.userName}</b> | 조회수: {post.views} | 작성일:{" "}
            {new Date(post.regDate).toLocaleDateString()}
          </p>
        </div>

        {post.thumbnailUrl && (
          <div className="my-4 w-full flex justify-center">
            <img
              src={post.thumbnailUrl}
              alt="썸네일"
              className="w-full max-h-[300px] object-contain rounded border border-gray-300"
            />
          </div>
        )}

        <div className="text-base text-gray-800 whitespace-pre-line mb-4">
          {post.content}
        </div>

        {post.tags?.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold text-sm text-gray-700 mb-1">태그</h4>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-gray-100 border border-gray-300 text-gray-700 text-xs px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {post.attachments && post.attachments.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold text-sm text-gray-700 mb-2">첨부파일</h4>
            <ul className="space-y-2">
              {post.attachments.map((file) => (
                <li key={file.idx}>
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 border rounded hover:bg-gray-100 transition text-blue-600 text-sm"
                  >
                    <Paperclip className="w-4 h-4" />
                    <span>{file.fileName}</span>
                    <span className="text-gray-400 text-xs ml-auto">
                      ({(file.fileSize / 1024).toFixed(1)} KB)
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end space-x-2 mt-6">
          <Button onClick={() => router.push(`/admin/community/edit/${co_idx}`)} variant="primary">
            수정
          </Button>
          <Button onClick={handleDelete} variant="danger">
            삭제
          </Button>
          <Button onClick={() => router.push("/admin/community")} variant="gray">
            목록으로
          </Button>
        </div>
        
        <CommunityComments
          communityIdx={post.idx}
          onCommentUpdate={(updated) =>
            setPost((prev) => (prev ? { ...prev, commentsCount: updated.length } : prev))
          }
        />
      </div>
      
    </>
  );
}
