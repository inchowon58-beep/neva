# 네바 마스커레이드 분양 - 자동 서브페이지 생성기

Next.js 동적 라우팅(`/landing/[slug]`)을 활용해 관리자가 등록한 키워드별 SEO 랜딩페이지를 자동 생성하는 프로젝트입니다.

## 주요 기능

- **동적 랜딩페이지**: `/landing/인천네바마스커레이드분양` 등 키워드별 페이지 자동 생성
- **관리자 페이지**: 하단 "관리자 로그인" 버튼 → `/admin`에서 키워드·이미지·URL·전화번호 관리
- **Gemini AI 콘텐츠**: 등록된 키워드 기반 SEO 최적화 본문 자동 생성
- **SEO**: 메타태그, Open Graph, JSON-LD, sitemap.xml, robots.txt

## 로컬 실행

```bash
npm install
cp .env.example .env.local
# .env.local에 GEMINI_API_KEY 등 설정
npm run dev
```

- 메인: http://localhost:3000
- 관리자: http://localhost:3000/admin
- 랜딩 예시: http://localhost:3000/landing/인천네바마스커레이드분양

## 관리자 계정

| 항목 | 값 |
|------|-----|
| 아이디 | inchowon58 |
| 비밀번호 | yuna070207 |

환경 변수 `ADMIN_USERNAME`, `ADMIN_PASSWORD`로 변경 가능합니다.

## Vercel 배포

1. GitHub에 푸시 후 [Vercel](https://vercel.com)에서 Import
2. **Storage > Blob** 생성 (데이터 영구 저장용)
3. 환경 변수 설정:
   - `GEMINI_API_KEY` - [Google AI Studio](https://aistudio.google.com/apikey)에서 발급
   - `ADMIN_SESSION_SECRET` - 32자 이상 랜덤 문자열
   - `NEXT_PUBLIC_SITE_URL` - 배포 URL (예: `https://your-app.vercel.app`)
   - `ADMIN_USERNAME`, `ADMIN_PASSWORD` (선택)
4. Deploy

## 사용 흐름

1. 관리자 로그인 → 키워드 등록 (예: `인천네바마스커레이드분양`)
2. 이미지 URL, 홈페이지, 전화번호 입력
3. "AI 콘텐츠 생성" 클릭 → Gemini가 SEO 본문 작성
4. `/landing/인천네바마스커레이드분양` 페이지 자동 생성
5. 검색 유입 시 해당 키워드 페이지 표시

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx              # 메인 홈
│   ├── admin/page.tsx        # 관리자
│   ├── landing/[slug]/page.tsx  # 동적 랜딩 (핵심)
│   └── api/                  # 인증, 키워드 CRUD, AI 생성
├── components/
├── lib/
│   ├── db.ts                 # 데이터 저장 (로컬 JSON / Vercel Blob)
│   ├── gemini.ts             # Gemini API
│   └── auth.ts               # JWT 세션
└── types/
```
