# Autonix Client

Autonix 프론트엔드 클라이언트입니다.

## 🛠 Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS

---

## 🚀 로컬 실행 방법

### 1. 프로젝트 폴더 생성

`C:\` 드라이브에 `Autonix-Project` 폴더를 생성합니다.

```
C:\Autonix-Project\
```

### 2. 레포지토리 클론

`Autonix-Project` 폴더 안에서 터미널을 열고 아래 명령어를 실행합니다.

```bash
git clone https://github.com/Autonix-Project/client.git
```

클론이 완료되면 `client` 폴더가 자동으로 생성됩니다.

```
C:\Autonix-Project\
└── client\
```

### 3. VS Code로 열기

VS Code에서 `client` 폴더를 엽니다.

```
파일 > 폴더 열기 > C:\Autonix-Project\client
```

### 4. 의존성 설치

VS Code 터미널에서 아래 명령어를 실행합니다.

```bash
npm install
```

### 5. 개발 서버 실행

```bash
npm run dev
```

실행 후 브라우저에서 [http://localhost:5173](http://localhost:5173) 으로 접속합니다.

---

## 🌿 브랜치 전략

| 브랜치 | 설명 |
|--------|------|
| `main` | 배포용 브랜치 |
| `develop` | 개발 통합 브랜치 |
| `feature/이슈번호-기능명` | 기능 개발 브랜치 (예: `feature/13-login-page`) |

> 작업은 항상 `develop` 에서 `feature` 브랜치를 따서 진행합니다.

---

## 📝 커밋 메시지 컨벤션

```
타입: 제목
```

| 타입 | 설명 |
|------|------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `refactor` | 기능 변경 없이 코드 구조 개선 |
| `chore` | 빌드, 설정, 의존성 등 코드 외 작업 |
| `docs` | 문서 작업 |
| `test` | 테스트 코드 작성/수정 |
| `style` | 포맷, 세미콜론 등 코드 의미 없는 변경 |
| `ci` | GitHub Actions, Docker 설정 |
| `perf` | 성능 개선 |

**예시**
```
feat: 로그인 페이지 구현
fix: 사이드바 렌더링 오류 수정
```

---

## ❗ 참고

### CSS 파일에서 빨간줄 에러 (`css-lcurlyexpected`)

Tailwind CSS v4 문법을 VS Code가 인식하지 못해서 발생하는 **오류가 아닌 경고**입니다.  
`npm run dev` 가 정상 작동하면 무시해도 됩니다.

경고를 없애고 싶다면 VS Code 설정에서 CSS 유효성 검사를 끄세요.

```
설정(Ctrl + ,) > CSS > Validate > 체크 해제
```