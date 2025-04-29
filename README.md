# JobBridge - Portfolio 🧳

구직자와 채용기업을 연결하는 풀스택 채용 플랫폼  
실무 기반 Spring Boot + Next.js 프로젝트

![Tech Stack](https://img.shields.io/badge/Java-17-blue?style=flat-square&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3-green?style=flat-square&logo=springboot)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-blue?style=flat-square&logo=tailwindcss)
![MySQL](https://img.shields.io/badge/MySQL-Aiven-orange?style=flat-square&logo=mysql)

---

## 📌 프로젝트 개요

**JobBridge**는 실무에서 사용되는 구직/채용 플랫폼을 직접 구현한 풀스택 프로젝트입니다.  
일반회원/기업회원/관리자 3가지 역할을 기반으로 이력서 관리, 채용공고 등록, 커뮤니티 기능,  
실시간 알림 시스템 등 실전 수준의 백엔드 아키텍처를 경험하며 개발했습니다.

> 💡 이 저장소는 **포트폴리오 제출용**이며, 민감 정보는 제거된 상태입니다.  
> 실제 배포는 `Render` (Spring Boot) + `Vercel` (Next.js)로 구성되어 있습니다.  
> 🚧 현재 리팩토링 및 추가 기능 개발 진행 중입니다.

---

## 🧪 테스트 계정

프로젝트를 쉽게 체험할 수 있도록 테스트 계정을 제공합니다.

| 구분 | 아이디 (이메일) | 비밀번호 |
|:---|:---|:---|
| 일반회원 | test | 123456 |
| 기업회원 | com_test | 123456 |
| 관리자 | admin | 123456 |

🔗 **접속 링크**: [https://jobbridge.co.onl](https://jobbridge.co.onl)

> 🔒 테스트 계정은 포트폴리오 제출 및 시연용으로만 사용되며, 별도 개인정보는 포함되어 있지 않습니다.

---

## 🔧 사용 기술

### ✅ Backend
- Java 17, Spring Boot 3
- Spring Security + JWT 인증
- JPA (Hibernate), MySQL (Aiven)
- Kafka (Redpanda), Redis
- WebSocket (실시간 알림)
- Multipart 이미지 처리, 이미지 압축, EXIF 회전 보정
- REST API 설계

### ✅ Frontend
- Next.js 15 (App Router), React 18
- TypeScript, TailwindCSS
- shadcn/ui, Axios
- Tiptap 에디터 (툴바, 이미지 리사이징)
- 클라이언트 폼 검증 및 상태 관리

### ✅ Infra (배포 환경용)
- Docker (백엔드 Render 배포)
- Vercel (프론트엔드 정적 호스팅)
- GitHub Actions (자동화 가능)

---

## 🎯 주요 기능

### 👤 회원 시스템
- JWT 로그인/로그아웃/토큰 재발급
- 이메일 인증 및 약관 모달
- 일반/기업/관리자 Role 분리 및 접근 제어

### 📄 이력서 관리
- 사람인 스타일 이력서 작성 및 수정
- 사진 업로드 + 미리보기 + PDF 다운로드
- 경력/학력/스킬/자격증/자기소개서 등록

### 📢 채용공고
- 기업회원 공고 등록/수정 (Tiptap Editor 활용)
- 조건 필터 + 키워드/지역 검색
- 공고 상세 및 리스트 UI 구성

### 💼 지원 기능
- 이력서로 공고 지원 + 상태 변경 (지원완료/불합격/면접제의/취소)
- 지원 당시 이력서 스냅샷 저장 (사진 포함)
- 지원자 목록 모달 + 상세 이력서 2단 미리보기

### 💬 커뮤니티
- 게시글 작성/수정/삭제 + 첨부파일 + 태그
- 댓글/대댓글 구현 + 댓글 수 자동 동기화

### 🛎 실시간 알림
- Kafka + WebSocket 기반 알림 시스템
- 면접제의/불합격 실시간 전송 + 알림 뱃지

### ⚙️ 관리자 페이지
- 회원/이력서/회사/공고/문의 관리
- 지원자 상태 변경 및 상세 이력서 조회
- 점검모드 설정(ADMIN 제외한 모든 API 차단)

---

## 📂 프로젝트 구조 (일부)

```bash
jobbridge-portfolio/
├── backend/
│   ├── src/main/java/com/jobbridge
│   │   ├── controller/              # API 컨트롤러
│   │   ├── dto/                     # 요청/응답 DTO
│   │   ├── entity/                  # JPA 엔티티
│   │   ├── service/                 # 서비스 로직
│   │   └── config/                  # Spring 설정
│   └── build.gradle                 # Gradle 설정
├── frontend/
│   ├── app/                         # Next.js App Router
│   ├── components/                 # 공통 UI 컴포넌트
│   ├── lib/                         # 유틸, API 클라이언트 등
│   └── tailwind.config.ts          # Tailwind 설정
├── .gitignore
└── README.md


