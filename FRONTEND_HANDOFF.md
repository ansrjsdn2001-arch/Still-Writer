# Still Writer 프론트엔드 인수인계

최종 확인일: 2026-06-30  
대상 경로: `frontend/`

## 1. 프로젝트 개요

Still Writer는 소설·일기·메모 등의 글과 폴더, 소재를 관리하는 반응형 글쓰기 서비스입니다.

현재 프론트엔드는 UI 구조를 만드는 단계이며 백엔드 API와 실제 인증은 아직 연결되지 않았습니다. API 데이터가 없는 화면에는 임의의 더미데이터를 넣지 않고 빈 상태를 표시합니다.

## 2. 다른 PC에서 시작하기

### 필수 환경

- Windows 10/11
- Node.js 20.20.0 권장
- npm
- VS Code 권장

현재 프로젝트에서 빌드가 확인된 Node.js 버전은 `20.20.0`입니다.

### 최초 설치 및 실행

PowerShell에서 프로젝트 루트로 이동한 뒤 실행합니다.

```powershell
Set-Location -LiteralPath '.\frontend'
npm ci
npm run dev
```

기본 접속 주소는 Vite가 터미널에 출력하는 주소를 사용합니다. 일반적으로 다음 주소입니다.

```text
http://localhost:5173
```

### 검증 명령

```powershell
npm run lint
npm run build
npm run preview
```

- `npm run lint`: ESLint 검사
- `npm run build`: 배포용 빌드 생성
- `npm run preview`: 생성된 `dist/` 결과 미리보기

`dist/`는 빌드 결과물이므로 직접 수정하지 않습니다.

## 3. 기술 환경

| 구분 | 사용 기술 |
|---|---|
| UI | React 19.1 |
| 빌드 도구 | Vite 8.1 |
| 언어 | JavaScript, JSX |
| 라우팅 | React Router DOM 7.18 |
| UI·아이콘 | MUI 7.2, Emotion 11.14 |
| HTTP 클라이언트 | Axios 1.18 |
| 스타일 | 전역 CSS와 화면별 CSS |
| 패키지 관리자 | npm |

현재 필요한 패키지는 `frontend/package.json`과 `frontend/package-lock.json`에 기록되어 있습니다. 새로운 라이브러리를 추가하기 전에 기존 MUI, Axios, React Router로 해결 가능한지 먼저 확인합니다.

## 4. 주요 실행 구조

```text
frontend/src/main.jsx
└── BrowserRouter
    └── App.jsx
        ├── AppHeader
        ├── 인증 화면
        │   └── /login
        └── Workspace
            ├── AppSidebar
            ├── 페이지 Routes
            └── MobileNavigation
```

`AppHeader`는 모든 경로에서 표시됩니다. 데스크탑·태블릿에서는 사이드바, 모바일에서는 하단 내비게이션이 표시됩니다.

## 5. 현재 라우트

| 경로 | 화면 | 상태 |
|---|---|---|
| `/` | `HomePage` | UI 완료, API 미연동 |
| `/writings` | `AllWritingsPage` | 검색·정렬·빈 상태 UI, API 미연동 |
| `/write` | `WritePage` | 입력·기본 서식·글자 수 UI 완료, 저장 API 미연동 |
| `/profile` | `ProfileSettingsPage` | 안내용 화면, 폼·API 미구현 |
| `/login` | `Login` | UI만 구현, 실제 로그인 미구현 |
| 기타 경로 | `/`로 이동 | 임시 처리 |

다음 링크는 화면에 존재하지만 아직 정상 라우트가 없습니다.

- `/join`: `Join.jsx`가 비어 있고 `App.jsx`에 라우트가 등록되지 않음
- `/find-password`: 페이지와 라우트가 없음

## 6. 현재 구현 상태

### 공용 헤더

파일: `frontend/src/components/layout/AppHeader.jsx`

- 로고 클릭 시 `/` 이동
- 라이트·다크 테마 변경
- 비로그인 상태에서 로그인·회원가입 링크 표시
- 로그인 상태에서 닉네임과 계정 메뉴 표시
- 계정 메뉴에 프로필 설정·로그아웃 제공
- ESC와 외부 클릭으로 계정 메뉴 닫기
- 모바일 로그인 상태에서는 계정 메뉴를 숨김

테마는 다음 Local Storage 키를 사용합니다.

```text
still-writer-theme
```

### 인증 상태

현재 실제 JWT 인증은 구현되어 있지 않습니다. `App.jsx`가 아래 Local Storage 값을 읽어 로그인 표시 상태만 결정합니다.

```text
키: still-writer-user
예상 형태: { "nickname": "사용자 닉네임" }
```

`Login.jsx`의 제출 함수는 현재 `preventDefault()`만 실행합니다. 로그인 API, 토큰 저장, 사용자 상태 갱신을 별도로 구현해야 합니다.

### 사이드바

파일: `frontend/src/components/layout/AppSidebar.jsx`

현재 표시 순서:

```text
홈
모든 글
소재 보관함
즐겨찾기
휴지통
내 폴더
설정
```

연결 상태:

- 홈: `/` 연결
- 모든 글: `/writings` 연결
- 소재 보관함·즐겨찾기·휴지통·설정: 메뉴만 존재하며 페이지와 라우트 없음
- 내 폴더: 실제 데이터가 없어 빈 상태 표시

### 모바일 하단 내비게이션

파일: `frontend/src/components/layout/MobileNavigation.jsx`

- 홈
- 글
- 중앙 글 작성: `/write` 연결
- 소재
- 로그인 시 프로필 / 비로그인 시 설정

모바일에서는 프로필 설정을 헤더가 아닌 하단 내비게이션으로 접근하도록 설계했습니다.

### 글 작성 페이지

파일:

- `frontend/src/pages/WritePage.jsx`
- `frontend/src/styles/write.css`

구현 내용:

- 제목 입력과 50자 제한
- 본문 `contentEditable` 편집
- 제목 단계·굵게·기울임·밑줄·목록 기본 서식과 큰따옴표·작은따옴표 삽입
- 공백 포함·제외 글자 수 계산
- 되돌리기·다시 실행·타임스탬프 메뉴
- 붙여넣기 시 일반 텍스트만 허용
- 저장 API에 전달할 제목, HTML, 일반 텍스트, 글자 수 payload 준비

실제 문서 저장 API는 아직 없으므로 서버 저장은 수행하지 않습니다.

### 메인 페이지

파일:

- `frontend/src/pages/HomePage.jsx`
- `frontend/src/styles/home.css`

구성:

- 인사말 히어로
- 오늘의 기록
- 최근 작성한 글
- 최근 활동
- 내 폴더와 전체 보기 버튼

데이터는 모두 비어 있으며 임의의 글, 폴더, 통계 숫자를 넣지 않았습니다.

히어로 이미지는 다음 파일을 사용합니다.

```text
frontend/public/images/heroimage(light).png
```

히어로 배경은 `cover`로 표시하고 오른쪽 세로 위치를 `58%`로 조정해 커피잔과 받침이 보이도록 했습니다. 왼쪽에는 콘텐츠 가독성을 위한 배경색 그라데이션을 겹쳤습니다.

### 모든 글 페이지

파일:

- `frontend/src/pages/AllWritingsPage.jsx`
- `frontend/src/styles/writings.css`

구현 내용:

- 전체 글·최근 작성·폴더 탭
- 제목·내용·폴더 검색 입력
- 최신 수정순·최신 작성순·오래된 작성순·제목 가나다순 정렬 UI
- 빈 목록과 검색 결과 없음 상태

현재 `writings` 배열은 빈 배열이며 API가 연결되지 않았습니다. 정렬 선택 상태는 존재하지만 실제 데이터 정렬 로직은 추후 API 계약에 맞춰 완성해야 합니다.

### 로그인 페이지

파일:

- `frontend/src/pages/Login.jsx`
- `frontend/src/styles/login.css`

구현 내용:

- 이메일·비밀번호 입력
- 비밀번호 표시·숨김
- 로그인 상태 유지 체크박스
- 카카오·Google 로그인 UI
- 반응형 로그인 패널

라이트 모드 배경은 `frontend/public/images/heroimage(light).png`, 다크 모드 배경은 `frontend/public/images/heroimage(dark).png`를 사용합니다. 사진을 `cover`로 채우고 오버레이를 겹쳤으며, 로그인 패널에는 반투명 배경과 `backdrop-filter`를 적용했습니다.

모바일 `767px` 이하에서는 다음 기준을 사용합니다.

- 패널 최대 너비: `460px`
- 입력창·주요 버튼 높이: `52px`
- 패널 투명도 조정으로 배경 노출 확보
- `420px` 이하에서 내부 여백 추가 축소

## 7. 스타일과 반응형 기준

### 공용 색상

기준 문서: `color.txt`  
실제 변수: `frontend/src/styles/global.css`

- 라이트 배경: `#F6F1E7`
- 라이트 글자: `#2C2A27`
- 다크 배경: `#252628`
- 다크 글자: `#E8E6E1`
- 포인트: `#4F8F88`

기존 CSS 변수 `--bg`, `--surface`, `--text`, `--muted`, `--border`, `--accent` 등을 우선 재사용합니다.

### 반응형 구간

```text
모바일: 0px ~ 767px
태블릿: 768px ~ 1100px
데스크탑: 1101px 이상
```

일부 화면은 `420px` 이하 보정 규칙이 추가로 있습니다.

### 레이아웃 크기

- 공용 헤더: 데스크탑·태블릿 `72px`, 모바일 `64px`
- 데스크탑 사이드바: `272px`
- 태블릿 사이드바: `228px`
- 모바일 하단 내비게이션: `76px`

헤더와 사이드바의 기존 디자인은 페이지 콘텐츠 작업 시 임의로 변경하지 않습니다.

## 8. 주요 파일 구조

```text
frontend/
├── package.json
├── package-lock.json
├── vite.config.js
├── eslint.config.js
├── public/
│   └── images/
│       ├── background2.png
│       ├── heroimage(light).png
│       ├── heroimage(dark).png
│       └── still-writer-logo.png
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── components/
    │   ├── common/
    │   │   ├── BrandLogo.jsx
    │   │   └── MaterialTypeIcon.jsx
    │   └── layout/
    │       ├── AppHeader.jsx
    │       ├── AppSidebar.jsx
    │       └── MobileNavigation.jsx
    ├── pages/
    │   ├── AllWritingsPage.jsx
    │   ├── HomePage.jsx
    │   ├── Join.jsx
    │   ├── Login.jsx
    │   └── ProfileSettingsPage.jsx
    └── styles/
        ├── global.css
        ├── home.css
        ├── layout.css
        ├── login.css
        └── writings.css
```

## 9. 참고 디자인 자료

기기별 디자인 이미지는 다음 경로에 있습니다.

```text
frontend/desktop/
frontend/tablet/
frontend/mobile/
```

페이지를 구현할 때 헤더·사이드바·모바일 하단 내비게이션과 페이지 본문을 구분해서 참고합니다. 본문 디자인 요청에서 공용 레이아웃 변경 요청이 없다면 공용 컴포넌트는 유지합니다.

프로젝트 요구사항 문서:

```text
기능.txt
페이지 구성.txt
폴더 상세 보기 정렬 기준.txt
color.txt
DB구조.txt
AGENTS.md
```

`기능.txt`와 `페이지 구성.txt`의 완료 상태가 서로 다를 수 있습니다. 실제 소스 코드와 최신 사용자 요청을 우선 확인합니다.

## 10. 아직 구현되지 않은 항목

- 실제 로그인·로그아웃 API와 JWT 처리
- 회원가입 페이지와 `/join` 라우트
- 비밀번호 찾기 페이지와 `/find-password` 라우트
- 프로필 수정 폼과 API
- 글 저장 API와 자동 저장
- 글 목록 API, 실제 검색·정렬
- 폴더 목록·상세·생성
- 소재 보관함
- 즐겨찾기
- 휴지통 복원·영구 삭제
- 설정 페이지
- 404 전용 페이지
- 로딩·네트워크 오류·재시도 처리

## 11. 다음 작업 시 권장 순서

1. 백엔드 API 명세와 DTO를 먼저 확정합니다.
2. Axios 공용 인스턴스와 오류 처리 방식을 정합니다.
3. 실제 인증 상태와 보호 라우트를 구현합니다.
4. 비어 있는 회원가입·비밀번호 찾기 화면을 완성합니다.
5. 사이드바의 미연결 메뉴에 실제 라우트를 연결합니다.
6. 글·폴더·소재 데이터를 API로 연결합니다.
7. 로딩·빈 상태·오류·권한 없음 상태를 각각 검증합니다.

## 12. 작업 규칙과 주의사항

- 모든 파일은 UTF-8로 저장합니다.
- Windows PowerShell에서 읽을 때 `Get-Content -Encoding UTF8`을 사용합니다.
- 더미데이터를 임의로 추가하지 않습니다.
- 기존 공용 컴포넌트와 CSS 변수를 우선 재사용합니다.
- 디자인 변경 시 요청받지 않은 기능과 라우팅을 변경하지 않습니다.
- 새로운 npm 라이브러리는 팀 승인 후 설치합니다.
- 라이브러리를 추가하면 변경 이유와 버전을 팀에 공유합니다.
- 비밀키, 토큰, 개인정보를 소스와 콘솔에 출력하지 않습니다.
- `package-lock.json`을 함께 공유해 다른 PC에서도 동일 버전을 설치합니다.
- `node_modules/`는 복사하지 않고 다른 PC에서 `npm ci`로 다시 설치합니다.

현재 프로젝트 루트에는 `.gitignore`가 확인되지 않았습니다. Git으로 공유할 경우 `node_modules/`, `frontend/dist/`, 로컬 환경 파일이 커밋되지 않도록 팀 기준에 맞는 `.gitignore`를 먼저 확인하거나 추가해야 합니다.

## 13. 최종 검증 체크리스트

다른 PC로 옮긴 후 다음 항목을 확인합니다.

- [ ] `npm ci` 성공
- [ ] `npm run lint` 성공
- [ ] `npm run build` 성공
- [ ] `/` 메인 페이지 표시
- [ ] `/writings` 모든 글 빈 상태 표시
- [ ] `/login` 반응형 로그인 화면 표시
- [ ] 테마 변경 후 새로고침해도 테마 유지
- [ ] 데스크탑·태블릿에서 사이드바 표시
- [ ] 모바일에서 사이드바가 숨겨지고 하단 내비게이션 표시
- [ ] 브라우저 콘솔 오류 없음
- [ ] 한글과 이미지 경로 깨짐 없음

## 14. 마지막 확인 결과

2026-06-30 기준 `npm run build`가 성공했습니다.

```text
Vite production build: 성공
추가 라이브러리: 없음
```
