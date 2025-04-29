// components/resume/SectionListField.tsx
"use client";
import React from "react";
import { ListField } from "@/(lib)/hooks/useResumeForm";

type Props = {
  fieldKey: ListField;
  items: any[]; // 객체 배열
  addItemToList: (field: ListField) => void;
  updateListItem: (field: ListField, index: number, value: any) => void;
  removeItemFromList: (field: ListField, index: number) => void;
};

// 항목 이름 출력용
const fieldTitles: Record<ListField, string> = {
  educationList: "학력",
  skillsList: "스킬",
  portfolioList: "포트폴리오오",
  certificationsList: "자격 / 어학 / 수상",
};

// 각 필드에서 사용하는 객체의 키값
const fieldNameMap: Record<ListField, string> = {
  educationList: "schoolName",
  skillsList: "skillName",
  portfolioList: "portfolioName",
  certificationsList: "certificationName",
};

const SectionListField = ({
  fieldKey,
  items,
  addItemToList,
  updateListItem,
  removeItemFromList,
}: Props) => {
  const fieldName = fieldNameMap[fieldKey];

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{fieldTitles[fieldKey]}</h3>
        <button
          onClick={() => addItemToList(fieldKey)}
          className="text-blue-600 hover:underline text-sm"
        >
          + 추가
        </button>
      </div>

      {items.map((item, index) => (
        <div key={index} className="flex gap-2 mb-2">
          <input
            placeholder="내용 입력"
            value={item?.[fieldName] || ""}
            onChange={(e) =>
              updateListItem(fieldKey, index, {
                ...item,
                [fieldName]: e.target.value,
              })
            }
            className="w-full border p-2 rounded"
          />
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => removeItemFromList(fieldKey, index)}
              className="text-red-500 text-sm"
            >
              삭제
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default SectionListField;
