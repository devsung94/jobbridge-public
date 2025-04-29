"use client";

import React, { useRef, useState, useEffect } from "react";

export type ExistingFile = {
  idx: number;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
};

interface LabeledFileWithPreviewProps {
  label: string;
  id: string;
  name: string;
  accept?: string;
  multiple?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  defaultPreview?: ExistingFile[] | string | string[];
  onRemoveExisting?: (idx: number) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const LabeledFileWithPreview: React.FC<LabeledFileWithPreviewProps> = ({
  label,
  id,
  name,
  accept = "image/*",
  multiple = false,
  onChange,
  defaultPreview,
  onRemoveExisting,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([]);

  useEffect(() => {
    if (defaultPreview) {
      if (Array.isArray(defaultPreview)) {
        // string[] 또는 ExistingFile[]
        if (typeof defaultPreview[0] === "string") {
          setPreviews(defaultPreview as string[]);
        } else {
          const files = defaultPreview as ExistingFile[];
          setExistingFiles(files);
          setPreviews([]); // 파일형 첨부파일은 목록으로 따로 관리
        }
      } else {
        // string 하나만 온 경우
        setPreviews([defaultPreview as string]);
      }
    }
  }, [defaultPreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`파일 "${file.name}"은(는) 5MB를 초과할 수 없습니다.`);
        return false;
      }
      return true;
    });

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);

    const dataTransfer = new DataTransfer();
    validFiles.forEach((file) => dataTransfer.items.add(file));
    if (inputRef.current) inputRef.current.files = dataTransfer.files;

    const fakeEvent = {
      ...e,
      target: {
        ...e.target,
        files: dataTransfer.files,
      },
    } as React.ChangeEvent<HTMLInputElement>;

    onChange(fakeEvent);
  };

  const handleRemoveExisting = (idx: number) => {
    const updated = existingFiles.filter((file) => file.idx !== idx);
    setExistingFiles(updated);
    onRemoveExisting?.(idx);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

      <input
        id={id}
        name={name}
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={handleClick}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
      >
        파일 선택하기
      </button>

      {/* 기존 첨부파일 미리보기 */}
      {existingFiles.length > 0 && (
        <div className="mt-3 space-y-2">
          {existingFiles.map((file) => (
            <div key={file.idx} className="flex items-center space-x-3">
              <a
                href={file.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-sm truncate max-w-xs"
              >
                {file.fileName}
              </a>
              <button
                type="button"
                onClick={() => handleRemoveExisting(file.idx)}
                className="text-red-500 text-sm"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 이미지 미리보기 (썸네일 or 새 업로드 이미지) */}
      {previews.length > 0 && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 justify-items-center">
          {previews.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`미리보기 ${idx + 1}`}
              className="w-24 h-24 object-cover rounded border border-gray-300"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LabeledFileWithPreview;
