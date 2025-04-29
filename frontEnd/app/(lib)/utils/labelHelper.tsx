// src/utils/labelHelper.ts
import { OptionType } from "@/components/ui/LabeledSelect";

/**
 * value에 대응하는 label을 반환하는 함수
 */
export const getLabel = (
  options: OptionType[],
  value: string | undefined
): string => {
  return options.find((option) => option.value === value)?.label || "정보 없음";
};

/**
 * OptionType[] → Record<string, string> 으로 변환
 */
export const toLabelMap = (options: OptionType[]): Record<string, string> => {
  return options.reduce((acc, cur) => {
    acc[cur.value] = cur.label;
    return acc;
  }, {} as Record<string, string>);
};
