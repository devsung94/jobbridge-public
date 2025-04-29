"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {Button} from "@/components/ui/Button";
import { useAuth } from "@/(lib)/utils/AuthContext";
import { formatDateTime } from "@/(lib)/utils/common";
import { SmartButton } from "@/components/ui/SmartButton";
import apiClient from "@/(lib)/utils/apiClient";
import Pagination from "../ui/Pagination";

interface Comment {
  idx: number;
  content: string;
  userId: string;
  userName: string;
  isUse: string;
  regDate: string;
  parentId?: number;
  replies?: Comment[];
}

interface Props {
  communityIdx: number;
  onCommentUpdate: (updatedComments: Comment[]) => void;
  highlightIdx?: number | null;
}

export default function CommunityComments({
  communityIdx,
  onCommentUpdate,
  highlightIdx: highlightIdxFromProp,
}: Props) {
  const { userId, role, isLoggedIn } = useAuth();
  const router = useRouter();

  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isCommentsLoaded, setIsCommentsLoaded] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState<number | null>(null);
  const [highlightPage, setHighlightPage] = useState<number | null>(null);

  const commentRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

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


  const fetchComments = async (pageNum: number) => {
    try {
      const { data } = await apiClient.get(`/community/${communityIdx}/comments?page=${pageNum}&size=5`);
      if (data.result === "Y") {
        // console.log("fetchComments ",data);
        setComments(data.data.comments);
        setTotalPages(data.data.totalPages);
        setPage(data.data.currentPage);
        setIsCommentsLoaded(true);
      }
    } catch (err) {
      console.error("댓글 불러오기 실패", err);
      setIsCommentsLoaded(false);
    }
  };

  const findHighlightPage = async (commentIdx: number) => {
    try {
      const { data } = await apiClient.get(`/user/community/${communityIdx}/comments/find-page?commentIdx=${commentIdx}&size=5`);
      // console.log("findHighlightPage",data);
      if (data.result === "Y") {
        setHighlightPage(data.data.page); // 찾은 페이지 저장
      }
    } catch (error) {
      console.error("하이라이트 댓글 페이지 찾기 실패", error);
    }
  };
  useEffect(() => {
    const loadComments = async () => {
      try {
        let targetPage = 1;
  
        if (highlightIdxFromProp) {
          // 하이라이트할 댓글이 있으면 페이지 먼저 찾음
          const { data } = await apiClient.get(
            `/user/community/${communityIdx}/comments/find-page?commentIdx=${highlightIdxFromProp}&size=5`
          );
          // console.log("findHighlightPage", data);
          if (data.result === "Y") {
            targetPage = data.data.page;
          }
        }
  
        // 댓글 불러오기
        const { data } = await apiClient.get(
          `/community/${communityIdx}/comments?page=${targetPage}&size=5`
        );
        // console.log("fetchComments", data);
  
        if (data.result === "Y") {
          setComments(data.data.comments);
          setTotalPages(data.data.totalPages);
          setPage(data.data.currentPage);
          setIsCommentsLoaded(true);
  
          // 하이라이트 스크롤
          if (highlightIdxFromProp) {
            setHighlightIdx(highlightIdxFromProp);
            setTimeout(() => {
              const target = commentRefs.current[highlightIdxFromProp];
              if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "center" });
                setTimeout(() => setHighlightIdx(null), 2500);
              }
            }, 200); // DOM 렌더링 약간 기다림
          }
        }
      } catch (err) {
        console.error("댓글 또는 하이라이트 페이지 불러오기 실패", err);
        setIsCommentsLoaded(false);
      }
    };
  
    loadComments();
  }, [communityIdx, highlightIdxFromProp]);
  
  const handleAddComment = async () => {
    if (!isLoggedIn || !role) {
      if (confirm("로그인 후 이용이 가능합니다. 이동하시겠습니까?")) {
        router.push("/login");
      }
      return false;
    } 

    if (!newComment.trim()) return;
    try {
      setIsAddLoading(true);
      const { data } = await apiClient.post(`/user/community/${communityIdx}/comment`,
        { content: newComment }
      );
      if (data.result === "Y") {
        setNewComment("");
        await fetchComments(page);
        setHighlightIdx(data.data.idx);
      }
    } catch(e) {
      alert("댓글 작성 실패");
    } finally{
      setIsAddLoading(false);
    }
  };

  const handleAddReply = async (parentId: number) => {
    
    if (!isLoggedIn || !role) {
      if (confirm("로그인 후 이용이 가능합니다. 이동하시겠습니까?")) {
        router.push("/login");
      }
      return false;
    } 

    if (!replyContent.trim()) return;
    try {
      setIsSubLoading(true);
      const { data } = await apiClient.post(`/user/community/${communityIdx}/comment`,
        { content: replyContent, parentId }
      );
      if (data.result === "Y") {
        setReplyContent("");
        setReplyTargetId(null);
        await fetchComments(page);
        setHighlightIdx(data.data.idx);
      }
    } catch {
      alert("대댓글 작성 실패");
      setIsSubLoading(false);
    } finally{
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
      setIsEditLoading(false);
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      const { data } = await apiClient.delete(`/user/community/comment/${commentId}`);
      if (data.result === "Y") {
        const updated = comments.map((c) =>
          c.idx === commentId
            ? { ...c, isUse: "N", content: "삭제된 댓글입니다." }
            : c
        );
        setComments(updated);
        onCommentUpdate(updated);
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
      setIsEditLoading(false);
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
          replies: c.replies?.map((r) =>
            r.idx === replyId
              ? { ...r, isUse: "N", content: "삭제된 댓글입니다." }
              : r
          ),
        }));
        setComments(updated);
        onCommentUpdate(updated);
      }
    } catch {
      alert("대댓글 삭제 실패");
    }
  };
  
  
  const handlePageChange = (newPage: number) => {
    fetchComments(newPage); // 댓글 불러오기
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
            <div 
              key={comment.idx} 
              ref={(el:any) => (commentRefs.current[comment.idx] = el)}
              className={`p-3 bg-gray-100 rounded-md text-sm relative transition duration-300 ${
                highlightIdx === comment.idx ? "border-2 border-blue-400 bg-blue-50 animate-pulse" : ""
              }`}
              >
              <div className="flex justify-between items-center">
                <div className="font-semibold text-gray-700">
                  {role === "admin" ? `${comment.userName} (ID: ${comment.userId})` : comment.userName}
                  {highlightIdx === comment.idx && <span className="ml-2 text-xs text-red-600 font-bold">NEW</span>}
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
                      className="mr-2" 
                      onClick={() => handleEditComment(comment.idx)} 
                      disabled={isEditLoading}>저장</SmartButton>
                      
                    <Button variant="gray" onClick={() => setEditingCommentId(null)}>
                      취소
                    </Button>
                  </div>
                </div>
              ) : (
                <p
                  className={`mt-2 whitespace-pre-line break-words ${
                    comment.isUse === "N"
                      ? "text-gray-500 italic bg-gray-100 p-2 rounded"
                      : "text-gray-800"
                  }`}
                >
                  {comment.isUse === "N" ? "삭제된 댓글입니다." : comment.content}
                </p>
              )}
            
            
            {comment.isUse === "Y" && (
              <div className="flex gap-2 mt-2 text-xs text-blue-600">
                {/* 수정/삭제 버튼 - 유저 본인 또는 관리자 */}
                {(comment.userId === userId || role === "admin") 
                        && editingCommentId !== comment.idx && (
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

                {/* 답글 버튼 - 항상 보이게 */}
                <button
                  onClick={() =>
                    setReplyTargetId(replyTargetId === comment.idx ? null : comment.idx)
                  }
                >
                  답글
                </button>
              </div>
              )}

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
                      className="mr-2" 
                      onClick={() => handleAddReply(comment.idx)} 
                      disabled={isSubLoading}>답글 등록</SmartButton>
                    <Button variant="gray" onClick={() => setReplyTargetId(null)}>
                      취소
                    </Button>
                  </div>
                </div>
              )}

              {/* 대댓글 출력 */}
              {comment.replies?.map((reply) => (
                <div
                  key={reply.idx}
                  ref={(el:any) => (commentRefs.current[reply.idx] = el)}
                  className={`ml-6 mt-3 p-2 bg-white border-l-4 border-blue-200 rounded transition duration-300 ${
                    highlightIdx === reply.idx ? "border-blue-400 bg-blue-50 animate-pulse" : ""
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-semibold text-gray-600">
                      {role === "admin" ? `${reply.userName} (ID: ${reply.userId})` : reply.userName}
                      {highlightIdx === reply.idx && <span className="ml-2 text-xs text-red-600 font-bold">NEW</span>}
                    </div>
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
                    <p
                      className={`text-sm mt-1 break-words whitespace-pre-line ${
                        reply.isUse === "N"
                          ? "text-gray-500 italic bg-gray-50 p-2 rounded"
                          : "text-gray-800"
                      }`}
                    >
                      {reply.isUse === "N" ? "삭제된 댓글입니다." : reply.content}
                    </p>

                  )}

                  {reply.isUse === "Y" && (reply.userId === userId || role === "admin") && editingReplyId !== reply.idx && (
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
      </div>

      {/* 기존의 숫자 버튼 페이징 제거하고 Pagination 컴포넌트 사용 */}
      {comments.length > 0 && totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            size={"sm"}
          />
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
              className="mr-2" 
              onClick={handleAddComment} 
              disabled={isAddLoading}>댓글 작성</SmartButton>
          </div>
        </div>
      )}

    </div>
  );
}