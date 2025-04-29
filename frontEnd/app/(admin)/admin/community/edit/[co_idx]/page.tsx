"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import apiClient from "@/(lib)/utils/apiClient";
import LabeledField from "@/components/ui/LabeledField";
import LabeledSelect, { OptionType } from "@/components/ui/LabeledSelect";
import LabeledFileWithPreview, { ExistingFile } from "@/components/ui/LabeledFileWithPreview";
import LabeledCheckbox from "@/components/ui/LabeledCheckbox";
import { Button } from "@/components/ui/Button";
import { SmartButton } from "@/components/ui/SmartButton";

interface FormProps {
  category: string;
  title: string;
  content: string;
  isAnonymous: string;
  tags?: string[];
}

export default function AdminCommunityEditPage() {
  const router = useRouter();
  const { co_idx } = useParams();
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const [form, setForm] = useState<FormProps>({
    category: "free",
    title: "",
    content: "",
    isAnonymous: "N",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | undefined>(undefined);

  const [existingAttachments, setExistingAttachments] = useState<ExistingFile[]>([]);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);

  const categoryOptions: OptionType[] = [
    { value: "free", label: "자유" },
    { value: "qna", label: "Q&A" },
    { value: "review", label: "후기" },
  ];

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await apiClient.get(`/community/${co_idx}`);
        if (data.result === "Y") {
          const post = data.data;
          setForm({
            category: post.category,
            title: post.title,
            content: post.content,
            isAnonymous: post.isAnonymous === "Y" ? "Y" : "N",
            tags: post.tags || [],
          });
          setTagInput((post.tags || []).join(", "));
          setThumbnailPreview(post.thumbnailUrl);
          setExistingAttachments(post.attachments || []);
        }
      } catch (err) {
        console.error(err);
        alert("게시글 정보를 불러오지 못했습니다.");
        router.push("/admin/community");
      }
    };
    if (co_idx) fetchPost();
  }, [co_idx, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } : any = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
    }));
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);
    const tagsArray = value.split(",").map((tag) => tag.trim());
    setForm((prev) => ({ ...prev, tags: tagsArray }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return alert("제목을 입력해주세요.");
    if (!form.content.trim()) return alert("내용을 입력해주세요.");

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "tags") {
        (value as string[]).forEach((tag) => formData.append("tags", tag));
      } else {
        formData.append(key, value as string);
      }
    });

    if (thumbnail) formData.append("thumbnail", thumbnail);
    newAttachments.forEach((file) => formData.append("attachments", file));
    existingAttachments.forEach((file) => {
      formData.append("existingAttachmentIdxs", String(file.idx));
    });

    try {
      setIsButtonLoading(true);
      await apiClient.put(`/user/community/${co_idx}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("게시글이 수정되었습니다.");
      router.push(`/admin/community/read/${co_idx}`);
    } catch (error) {
      console.error("수정 실패", error);
      alert("게시글 수정에 실패했습니다.");
      setIsButtonLoading(false);
    } finally {
      setIsButtonLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/admin/community/read/${co_idx}`);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">커뮤니티 글 수정 (관리자)</h1>
      <form className="space-y-4">
        <LabeledCheckbox
          id="isAnonymous"
          name="isAnonymous"
          label="익명으로 작성"
          value="Y"
          checked={form.isAnonymous === "Y"}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              isAnonymous: e.target.checked ? "Y" : "N",
            }))
          }
        />
        <LabeledSelect
          label="카테고리"
          id="category"
          name="category"
          value={form.category}
          onChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
          options={categoryOptions}
        />
        <LabeledField
          label="제목"
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <LabeledField
          label="내용"
          id="content"
          name="content"
          as="textarea"
          rows={8}
          value={form.content}
          onChange={handleChange}
          required
        />
        <LabeledField
          label="태그 (쉼표로 구분)"
          id="tags"
          name="tags"
          value={tagInput}
          onChange={handleTagChange}
        />

        <LabeledFileWithPreview
          label="썸네일 이미지"
          id="thumbnail"
          name="thumbnail"
          onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
          defaultPreview={thumbnailPreview}
        />

        <LabeledFileWithPreview
          label="첨부파일"
          id="attachments"
          name="attachments"
          multiple
          defaultPreview={existingAttachments}
          onChange={(e) => setNewAttachments(Array.from(e.target.files || []))}
          onRemoveExisting={(removedIdx) =>
            setExistingAttachments((prev) => prev.filter((f) => f.idx !== removedIdx))
          }
        />

        <div className="flex justify-end space-x-2 mt-4">
          <SmartButton type="button" variant="primary" onClick={handleSubmit} disabled={isButtonLoading}>
            수정하기
          </SmartButton>
          <Button type="button" variant="gray" onClick={handleCancel}>
            취소하기
          </Button>
        </div>
      </form>
    </div>
  );
}
