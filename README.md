# Gallae Mallae Frontend

Gallae Mallae(갈래 말래)는 여행이나 모임에서 음식 취향을 모으고, 식당 후보를 비교한 뒤 `갈래 / 애매해 / 말래`로 투표해 간단한 일정을 만드는 React/Vite 프론트엔드 MVP입니다.

현재 버전은 운영 백엔드에 연결된 서비스가 아니라, 로컬에서 클릭 가능한 mock/fallback 데이터 기반 프로토타입입니다.

## 주요 기능

- 로그인/그룹 진입 플로우
- 여행 그룹 생성
- 개인 취향 설문
- 그룹 취향 분석
- 추천 식당 후보 확인
- `갈래 / 애매해 / 말래` 투표
- 투표 결과 기반 일정 확인

## 기술 스택

- React 19
- Vite 6
- Vitest
- Testing Library
- lucide-react

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

기본 접속 주소는 다음과 같습니다.

```text
http://localhost:5173
```

WSL/Windows 환경에서 브라우저 접속 주소를 명확히 고정하고 싶다면 다음처럼 실행할 수 있습니다.

```bash
npm run dev -- --host 127.0.0.1
```

## 테스트와 빌드

```bash
npm test
npm run build
```

현재 `build` 스크립트는 다음처럼 설정되어 있습니다.

```bash
vite build --emptyOutDir false
```

이 설정은 일부 Windows/WSL 체크아웃에서 기존 `dist/` 디렉터리 삭제 권한 문제로 빌드가 중단되는 것을 피하기 위한 것입니다. `dist/`는 Git에 포함하지 않는 로컬 산출물입니다.

## 환경 변수

로컬 환경 변수 예시는 `.env.example`을 기준으로 합니다.

```bash
VITE_API_BASE_URL=
VITE_USE_MOCK=true
```

- `VITE_API_BASE_URL`을 비워두면 현재 mock/fallback 동작을 사용합니다.
- `VITE_USE_MOCK`은 향후 API 전환을 위한 옵션이며, 현재 코드에서는 아직 직접 사용하지 않습니다.

## 프로젝트 구조

```text
src/
  app/                 # 앱 플로우 상태
  assets/              # 화면 이미지 리소스
  components/          # 공통 UI 컴포넌트
  data/                # mock/default data
  features/
    landing/           # 랜딩 화면
    auth/              # 로그인 화면
    groups/            # 그룹 목록/생성/대시보드
    taste/             # 개인 취향 설문/결과
    analysis/          # 그룹 취향 분석
    recommendation/    # 추천 후보와 투표
    results/           # 투표 결과와 일정
  utils/               # 투표/지도 보조 로직
```

주요 진입점은 다음과 같습니다.

- `src/main.jsx`
- `src/App.jsx`
- `src/app/useAppFlow.js`
- `src/data/appData.js`

## 현재 범위와 제한

- 라우터 기반 멀티 페이지 앱이 아니라, 앱 내부 flow state로 화면을 전환합니다.
- 실제 계정 인증, 그룹 초대, 투표 저장, 일정 저장은 아직 프로덕션 기능이 아닙니다.
- API 래퍼는 존재하지만, `VITE_API_BASE_URL`이 없으면 mock/fallback 흐름을 사용합니다.
- 식당/지도/일정 데이터는 실제 운영 데이터가 아니라 프로토타입용 데이터입니다.

## 배포 전 TODO

- 실제 백엔드 API 연동
- 인증/초대/투표/일정 저장 정책 확정
- 라우팅 구조 도입 여부 결정
- 접근성 및 반응형 추가 검증
- 실제 식당/지도 데이터 연동
- 운영 환경 변수와 배포 파이프라인 정리
