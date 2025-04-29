"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import apiClient from "@/(lib)/utils/apiClient";
import LabeledField from "@/components/ui/LabeledField";
import LabeledSelect, {OptionType} from "@/components/ui/LabeledSelect";
import LabeledFileWithPreview from "@/components/ui/LabeledFileWithPreview";
import LabeledCheckbox from "@/components/ui/LabeledCheckbox";
import {Button} from "@/components/ui/Button";
import {SmartButton} from "@/components/ui/SmartButton";
import { useAuth } from "@/(lib)/utils/AuthContext";

interface FormProps {
  category: string;
  title: string;
  content: string;
  isAnonymous: string;
  tags?: string[];
}

export default function CommunityFormPage() {
  const router = useRouter();
  const { role, isLoggedIn, isLoading } = useAuth();
  const [form, setForm] = useState<FormProps>({
    category: "free",
    title: "",
    content: "",
    isAnonymous: "N",
    tags: [] as string[],
  });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const categoryOptions: OptionType[] = [
    { value: "free", label: "자유" },
    { value: "qna", label: "Q&A" },
    { value: "review", label: "후기" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } : any= e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
    attachments.forEach((file) => formData.append("attachments", file));

    try {
      setIsButtonLoading(true);
      await apiClient.post("/user/community", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("게시글이 등록되었습니다.");
      router.replace(`/community`);
    } catch (error) {
      setIsButtonLoading(false);
      console.error("등록 실패", error);
      alert("게시글 등록에 실패했습니다.");
    }finally{
      setIsButtonLoading(false);
    }
  };

  const handleCancel = () => {
    const confirmCancel = confirm("작성 중인 내용이 사라집니다. 정말 취소하시겠습니까?");
    if (confirmCancel) {
      router.back();
      // router.push("/community");
    }
  };

  
  useEffect(() => {
    // 로딩 중이면 아무 것도 하지 않음
    if (isLoading) return;
  
    if (!isLoggedIn || !role) {
      alert("로그인 후 이용이 가능합니다.");
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, role, router]);
  

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">커뮤니티 글 작성</h1>
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
          placeholder="예: 채용, 후기"
          onChange={handleTagChange}
        />

        <LabeledFileWithPreview
          label="썸네일 이미지"
          id="thumbnail"
          name="thumbnail"
          onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
        />

        <LabeledFileWithPreview
          label="첨부파일"
          id="attachments"
          name="attachments"
          multiple
          onChange={(e) => setAttachments(Array.from(e.target.files || []))}
        />

        <div className="flex justify-end space-x-2 mt-4">
          <SmartButton type="button" variant="primary" onClick={handleSubmit} disabled={isButtonLoading}>등록하기</SmartButton>
          <Button type="button" variant="gray" onClick={handleCancel}>취소하기</Button>
        </div>
      </form>
    </div>
  );
}
