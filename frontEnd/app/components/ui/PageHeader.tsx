"use client";

import { useAuth } from "@/(lib)/utils/AuthContext";
import { usePathname } from "next/navigation";

type PageHeaderProps = {
  title?: string;
  description?: string;
};

const headerPatterns: {
  pattern: RegExp;
  title: string;
  description: string | ((role: string) => string);
}[] = [
  { pattern: /^\/$/, title: "최신 채용 공고", description: "회원님을 위한 맞춤 채용 공고를 확인해보세요." },
  { pattern: /^\/signup$/, title: "회원가입", description: "간단한 가입으로 다양한 서비스를 이용해보세요." },
  { pattern: /^\/jobs$/, title: "채용 공고", description: "원하는 조건의 채용 공고를 자유롭게 찾아보세요." },
  { pattern: /^\/community$/, title: "커뮤니티 게시판", description: "개발자들과 자유롭게 소통하고 정보를 나누어보세요." },
  { pattern: /^\/resume$/, title: "이력서 등록", description: "경력과 역량을 이력서로 깔끔하게 정리해보세요." },
  {
    pattern: /^\/mypage$/,
    title: "마이페이지",
    description: (role) =>
      role === "user"
        ? "지원한 채용공고와 활동 내역을 확인할 수 있어요."
        : "등록한 채용공고와 기업 활동 내역을 확인하세요.",
  },
  { pattern: /^\/mypage\/edit-info$/, title: "정보 수정", description: "회원님의 개인정보를 변경할 수 있습니다." },
  { pattern: /^\/mypage\/company\/create$/, title: "회사정보 등록", description: "당신의 회사를 간단히 소개하고 등록해보세요" },
  { pattern: /^\/mypage\/company\/edit$/, title: "회사정보 수정", description: "회사 정보를 최신 상태로 유지해주세요." },
  {
    pattern: /^\/mypage\/resume\/create$/,
    title: "이력서 등록",
    description: "나의 경력과 스킬을 담은 이력서를 새로 작성해보세요.",
  },
  {
    pattern: /^\/mypage\/resume\/edit$/,
    title: "이력서 수정",
    description: "기존 이력서를 최신 정보로 업데이트하세요.",
  },
  { pattern: /^\/mypage\/appliedJobs$/, title: "내가 지원한 공고 목록", description: "지원한 공고와 지원 상태를 확인하세요." },

  { pattern: /^\/mypage\/jobs$/, title: "내가 등록한 채용공고", description: "등록한 공고 목록을 한눈에 확인하세요." },
  {
    pattern: /^\/mypage\/jobs\/\d+\/applications$/,
    title: "지원자 목록",
    description: "채용공고에 지원한 지원자들의 이력서를 확인해보세요.",
  },
  {
    pattern: /^\/mypage\/jobs\/\d+\/applications\/\d+$/,
    title: "지원자 이력서",
    description: "채용공고에 지원한 지원자 이력서를 확인해보세요.",
  },
  { pattern: /^\/mypage\/inquiry$/, title: "고객센터", description: "자주 묻는 질문과 문의 내용을 확인해보세요." },
  { pattern: /^\/find-idpw$/, title: "계정 찾기", description: "이메일 인증을 통해 계정을 찾을 수 있어요." },
];


const PageHeader: React.FC<PageHeaderProps> = ({ title, description }) => {
  const pathname = usePathname();
  const { role } = useAuth();

  const matched = headerPatterns.find(({ pattern }) => pattern.test(pathname));
  if (!matched) return null;

  const resolvedTitle = title ?? matched.title;
  const resolvedDesc =
    typeof matched.description === "function"
      ? matched.description(role ?? "")
      : matched.description;

  return (
    <div className="bg-blue-600 rounded-2xl p-8 text-white mb-8">
      <h2 className="text-3xl font-bold mb-2">{resolvedTitle}</h2>
      {resolvedDesc && <p className="text-sm">{resolvedDesc}</p>}
    </div>
  );
};

export default PageHeader;
