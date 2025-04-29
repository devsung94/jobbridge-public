"use client";

import Link from "next/link";

export default function JobListSection() {
  return (
    <div>
      {/* 상단 네비게이션 메뉴 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">JobBridge</div>
          <nav className="space-x-6 text-sm font-medium text-gray-700">
            <Link href="/jobs" className="hover:text-blue-600">채용공고</Link>
            <Link href="/community" className="hover:text-blue-600">커뮤니티</Link>
            <Link href="/mypage" className="hover:text-blue-600">마이페이지</Link>
          </nav>
          <div className="space-x-4 text-sm">
            <Link href="/login" className="text-gray-700 hover:text-blue-600">로그인</Link>
            <Link href="/signup" className="text-blue-600 font-semibold hover:underline">회원가입</Link>
          </div>
        </div>
      </header>

      <section className="px-4 py-10 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* 타이틀 영역 */}
          <div className="bg-blue-600 rounded-2xl p-8 text-white mb-8">
            <h2 className="text-3xl font-bold mb-2">최신 채용 공고</h2>
            <p className="text-sm">당신을 위한 딱! 맞춤 채용 공고를 찾아보세요</p>
          </div>

          {/* 채용 공고 카드 리스트 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 왼쪽 카드 */}
            <div className="border rounded-xl p-5 shadow-sm">
              <h3 className="text-lg font-semibold">가다다 회사 2024년 개발직 채용</h3>
              <p className="text-sm text-gray-500 mt-1">채용중</p>
              <p className="text-sm text-gray-600 mt-1">정규직 · 서울 강남구 · 04:22</p>
              <Link href="#" className="text-blue-600 text-sm mt-2 inline-block">자세히 보기</Link>
            </div>

            {/* 오른쪽 카드들 */}
            <div className="space-y-4">
              <div className="flex items-start border rounded-xl p-4 shadow-sm">
                <div className="bg-blue-100 text-blue-600 rounded-lg p-2 mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M9 21h6M12 3v18" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">마케팅 A 국내 정력자 모집합니다</h4>
                  <p className="text-sm text-gray-500">정규 · 오늘</p>
                  <p className="text-sm text-gray-500">2020 0급</p>
                  <Link href="#" className="text-blue-600 text-sm mt-1 inline-block">자세히 보기</Link>
                </div>
              </div>

              <div className="flex items-start border rounded-xl p-4 shadow-sm">
                <div className="bg-blue-100 text-blue-600 rounded-lg p-2 mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M9 21h6M12 3v18" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">백앤드 개발자 채용 공고 (안재트)</h4>
                  <p className="text-sm text-gray-500">정규 · 대전</p>
                  <p className="text-sm text-gray-500">14:33-14:00</p>
                  <Link href="#" className="text-blue-600 text-sm mt-1 inline-block">자세히 보기</Link>
                </div>
              </div>

              <div className="flex items-start border rounded-xl p-4 shadow-sm">
                <div className="bg-blue-100 text-blue-600 rounded-lg p-2 mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M9 21h6M12 3v18" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">나무 주식회사 정직원 백앤도 채용</h4>
                  <p className="text-sm text-gray-500">정규직 · 무산</p>
                  <p className="text-sm text-gray-500">대산 · 04:21</p>
                  <Link href="#" className="text-blue-600 text-sm mt-1 inline-block">자세히 보기</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-400 mt-10">
            © 2024 JobBridge. All rights reserved.
          </div>
        </div>
      </section>
    </div>
  );
}