"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/(lib)/utils/AuthContext";
import { formatDateTime } from "@/(lib)/utils/common";
import { SmartButton } from "@/components/ui/SmartButton";
import apiClient from "@/(lib)/utils/apiClient";

interface Comment {
  idx: number;
  content: string;
  userId: string;
  userName: string;
  regDate: string;
  parentId?: number;
  replies?: Comment[];
}

interface Props {
  communityId: number;
  onCommentUpdate: (updatedComments: Comment[]) => void;
}

export default function CommunityComments({ communityId, onCommentUpdate }: Props) {
  const { userId, role, isLoggedIn } = useAuth();
  const router = useRouter();

  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isSubLoading, setIsSubLoading] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState("");

  const [replyTargetId, setReplyTargetId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
  const [editedReplyContent, setEditedReplyContent] = useState("");
  
  const commentListRef = useRef<HTMLDivElement | null>(null);

  const fetchComments = async (pageNum: number | "last"): Promise<number | undefined> => {
    try {
      let targetPage: number;
  
      // 마지막 페이지 계산
      if (pageNum === "last") {
        const meta = await apiClient.get(`/community/${communityId}/comments?page=1&size=5`);
        targetPage = meta.data.data.totalPages || 1;
      } else {
        targetPage = pageNum;
      }
  
      // 실제 댓글 데이터 호출
      const { data } = await apiClient.get(
        `/community/${communityId}/comments?page=${targetPage}&size=5`
      );
  
      if (data.result === "Y") {
        setComments(data.data.comments);
        setTotalPages(data.data.totalPages);
        setPage(data.data.currentPage);
  
        // 스크롤 이동
        setTimeout(() => {
          commentListRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
  
        return data.data.totalPages;
      }
    } catch (err) {
      console.error("댓글 불러오기 실패", err);
    }
  };
  

  useEffect(() => {
    fetchComments("last");
  }, [communityId]);

  const handleAddComment = async () => {
    if (!isLoggedIn || !role) {
      if (confirm("로그인 후 이용이 가능합니다. 이동하시겠습니까?")) {
        router.push("/login");
      }
      return;
    }

    if (!newComment.trim()) return;
    try {
      setIsAddLoading(true);
      const { data } = await apiClient.post(`/user/community/${communityId}/comment`, {
        content: newComment,
      });
      if (data.result === "Y") {
        setNewComment("");
        await fetchComments("last");
      }
    } catch {
      alert("댓글 작성 실패");
    } finally {
      setIsAddLoading(false);
    }
  };

  const handleAddReply = async (parentId: number) => {
    if (!isLoggedIn || !role) {
      if (confirm("로그인 후 이용이 가능합니다. 이동하시겠습니까?")) {
        router.push("/login");
      }
      return;
    }

    if (!replyContent.trim()) return;
    try {
      setIsSubLoading(true);
      const { data } = await apiClient.post(`/user/community/${communityId}/comment`, {
        content: replyContent,
        parentId,
      });
      if (data.result === "Y") {
        setReplyContent("");
        setReplyTargetId(null);
        const newTotalPages = await fetchComments("last");
        if (newTotalPages) {
          await fetchComments(newTotalPages); // 최신 대댓글 위치
        }
      }
    } catch {
      alert("대댓글 작성 실패");
    } finally {
      setIsSubLoading(false);
    }
  };

  const handleEditComment = async (commentId: number) => {
    try {
      setIsEditLoading(true);
      const { data } = await apiClient.put(`/user/community/comment/${commentId}`, {
        content: editedContent,
      });
      if (data.result === "Y") {
        const updated = comments.map((c) =>
          c.idx === commentId ? { ...c, content: editedContent } : c
        );
        setComments(updated);
        setEditingCommentId(null);
        onCommentUpdate(updated);
      }
    } catch {
      alert("댓글 수정 실패");
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      const { data } = await apiClient.delete(`/user/community/comment/${commentId}`);
      if (data.result === "Y") {
        const updated = comments.filter((c) => c.idx !== commentId);
        const remainingCount = (totalPages - 1) * 5 + updated.length;
        const newTotalPages = Math.max(1, Math.ceil(remainingCount / 5));
        const newPage = page > newTotalPages ? newTotalPages : page;
        await fetchComments(newPage);
      }
    } catch {
      alert("댓글 삭제 실패");
    }
  };

  const handleEditReply = async (replyId: number) => {
    try {
      setIsEditLoading(true);
      const { data } = await apiClient.put(`/user/community/comment/${replyId}`, {
        content: editedReplyContent,
      });
      if (data.result === "Y") {
        const updated = comments.map((c) => ({
          ...c,
          replies: c.replies?.map((r) =>
            r.idx === replyId ? { ...r, content: editedReplyContent } : r
          ),
        }));
        setComments(updated);
        setEditingReplyId(null);
        setEditedReplyContent("");
        onCommentUpdate(updated);
      }
    } catch {
      alert("대댓글 수정 실패");
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleDeleteReply = async (replyId: number) => {
    if (!confirm("대댓글을 삭제하시겠습니까?")) return;
    try {
      const { data } = await apiClient.delete(`/user/community/comment/${replyId}`);
      if (data.result === "Y") {
        const updated = comments.map((c) => ({
          ...c,
          replies: c.replies?.filter((r) => r.idx !== replyId),
        }));
        setComments(updated);
        onCommentUpdate(updated);
      }
    } catch {
      alert("대댓글 삭제 실패");
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-2">댓글</h3>

      <div className="flex flex-col gap-2">
        {comments.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4">
            아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.idx} className="p-3 bg-gray-100 rounded-md text-sm relative">
              <div className="flex justify-between items-center">
                <div className="font-semibold text-gray-700">
                  {role === "admin"
                    ? `${comment.userName} (ID: ${comment.userId})`
                    : comment.userName}
                </div>
                <div className="text-xs text-gray-500">{formatDateTime(comment.regDate)}</div>
              </div>

              {editingCommentId === comment.idx ? (
                <div className="mt-2">
                  <textarea
                    rows={5}
                    className="w-full text-sm border p-1 rounded"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                  />
                  <div className="flex justify-end gap-2 mt-1">
                    <SmartButton
                      type="button"
                      variant="primary"
                      onClick={() => handleEditComment(comment.idx)}
                      disabled={isEditLoading}
                    >
                      저장
                    </SmartButton>
                    <Button variant="gray" onClick={() => setEditingCommentId(null)}>
                      취소
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 whitespace-pre-line break-words">{comment.content}</p>
              )}

              <div className="flex gap-2 mt-2 text-xs text-blue-600">
                {(comment.userId === userId || role === "admin") &&
                  editingCommentId !== comment.idx && (
                    <>
                      {comment.userId === userId && (
                        <button
                          onClick={() => {
                            setEditingCommentId(comment.idx);
                            setEditedContent(comment.content);
                          }}
                        >
                          수정
                        </button>
                      )}
                      <button onClick={() => handleDeleteComment(comment.idx)}>삭제</button>
                    </>
                  )}
                <button
                  onClick={() =>
                    setReplyTargetId(replyTargetId === comment.idx ? null : comment.idx)
                  }
                >
                  답글
                </button>
              </div>

              {replyTargetId === comment.idx && (
                <div className="mt-2 ml-4">
                  <textarea
                    className="w-full text-sm border p-1 rounded"
                    placeholder="답글을 입력하세요"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                  />
                  <div className="flex justify-end mt-1 gap-2">
                    <SmartButton
                      type="button"
                      variant="primary"
                      onClick={() => handleAddReply(comment.idx)}
                      disabled={isSubLoading}
                    >
                      답글 등록
                    </SmartButton>
                    <Button variant="gray" onClick={() => setReplyTargetId(null)}>
                      취소
                    </Button>
                  </div>
                </div>
              )}

              {comment.replies?.map((reply) => (
                <div
                  key={reply.idx}
                  className="ml-6 mt-3 p-2 bg-white border-l-4 border-blue-200 rounded"
                >
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-semibold text-gray-600">{reply.userName}</div>
                    <div className="text-xs text-gray-400">{formatDateTime(reply.regDate)}</div>
                  </div>

                  {editingReplyId === reply.idx ? (
                    <div className="mt-2">
                      <textarea
                        className="w-full text-sm border p-1 rounded"
                        value={editedReplyContent}
                        onChange={(e) => setEditedReplyContent(e.target.value)}
                      />
                      <div className="flex justify-end gap-2 mt-1">
                        <SmartButton
                          type="button"
                          variant="primary"
                          onClick={() => handleEditReply(reply.idx)}
                          disabled={isEditLoading}
                        >
                          저장
                        </SmartButton>
                        <Button variant="gray" onClick={() => setEditingReplyId(null)}>
                          취소
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm mt-1 break-words whitespace-pre-line">{reply.content}</p>
                  )}

                  {(reply.userId === userId || role === "admin") &&
                    editingReplyId !== reply.idx && (
                      <div className="flex gap-2 mt-1 text-xs text-blue-600">
                        {reply.userId === userId && (
                          <button
                            onClick={() => {
                              setEditingReplyId(reply.idx);
                              setEditedReplyContent(reply.content);
                            }}
                          >
                            수정
                          </button>
                        )}
                        <button onClick={() => handleDeleteReply(reply.idx)}>삭제</button>
                      </div>
                    )}
                </div>
              ))}
            </div>
          ))
        )}
        {/* <div ref={commentListRef} /> */}
      </div>

      {comments.length > 0 && totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              className={`px-2 py-1 text-sm rounded ${
                num === page ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
              onClick={() => fetchComments(num)}
            >
              {num}
            </button>
          ))}
        </div>
      )}

      {role !== "admin" && (
        <div className="mt-4">
          <textarea
            className="w-full border rounded p-2 text-sm"
            placeholder="댓글을 입력하세요"
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div className="flex justify-end mt-2">
            <SmartButton
              type="button"
              variant="primary"
              onClick={handleAddComment}
              disabled={isAddLoading}
            >
              댓글 작성
            </SmartButton>
          </div>
        </div>
      )}
    </div>
  );
}
