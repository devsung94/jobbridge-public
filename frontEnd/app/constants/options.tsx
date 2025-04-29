// src/constants/options.ts
import { OptionType } from "@/components/ui/LabeledSelect";

// 서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주
export const cityTypeOptions: OptionType[] = [
  { value: "서울", label: "서울" },
  { value: "부산", label: "부산" },
  { value: "대구", label: "대구" },
  { value: "인천", label: "인천" },
  { value: "광주", label: "광주" },
  { value: "대전", label: "대전" },
  { value: "울산", label: "울산" },
  { value: "세종", label: "세종" },
  { value: "경기", label: "경기" },
  { value: "강원", label: "강원" },
  { value: "충북", label: "충북" },
  { value: "충남", label: "충남" },
  { value: "전북", label: "전북" },
  { value: "전남", label: "전남" },
  { value: "경북", label: "경북" },
  { value: "경남", label: "경남" },
  { value: "제주", label: "제주" },
];

export const communityTypeOptions: OptionType[] = [
  { value: "all", label: "전체" },
  { value: "free", label: "자유" },
  { value: "qna", label: "Q&A" },
  { value: "review", label: "후기" },
];

export const isWorkingOptions: OptionType[] = [
  { value: "퇴사", label: "퇴사" },
  { value: "재직", label: "재직중" },
];

export const contractTypeOptions: OptionType[] = [
  { value: "정규직", label: "정규직" },
  { value: "계약직", label: "계약직" },
  { value: "인턴", label: "인턴" },
  { value: "프리랜서", label: "프리랜서" },
  { value: "기타", label: "기타" },
];

export const graduationStatusOptions: OptionType[] = [
  { value: "졸업", label: "졸업" },
  { value: "재학", label: "재학" },
  { value: "중퇴", label: "중퇴" },
  { value: "휴학", label: "휴학" },
];

export const companyOptions: OptionType[] = [
  { value: "large", label: "대기업" },
  { value: "mid", label: "중견기업" },
  { value: "small", label: "중소기업" },
  { value: "startup", label: "스타트업" },
  { value: "public", label: "공기업" },
  { value: "foreign", label: "외국계" },
];

export const industryOptions: OptionType[] = [
  { value: "it", label: "정보통신업" },
  { value: "manufacturing", label: "제조업" },
  { value: "finance", label: "금융업" },
  { value: "education", label: "교육서비스업" },
  { value: "retail", label: "도소매업" },
  { value: "construction", label: "건설업" },
  { value: "medical", label: "의료/보건" },
  { value: "etc", label: "기타" },
];

export const experienceOptions: OptionType[] = [
  { value: "0", label: "신입" },
  { value: "1", label: "1년" },
  { value: "2", label: "2년" },
  { value: "3", label: "3년" },
  { value: "4", label: "4년" },
  { value: "5", label: "5년 이상" },
];

export const educationOptions: OptionType[] = [
  { value: "highschool", label: "고등학교 졸업" },
  { value: "associate", label: "전문학사" },
  { value: "bachelor", label: "학사" },
  { value: "master", label: "석사" },
  { value: "doctorate", label: "박사" },
];
