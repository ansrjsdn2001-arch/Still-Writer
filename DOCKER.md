# Still Writer Docker 개발 환경

이 Docker 구성은 로컬 개발용입니다.

## 구성

```text
docker-compose.yml
├─ backend  : Spring Boot 백엔드, 8080 포트
├─ frontend : Vite 프론트엔드, 5173 포트
└─ DB       : Docker로 띄우지 않고 Supabase PostgreSQL 원격 DB 사용
```

## 실행 전 확인

`backend/.env` 파일에 Supabase DB, 메일, OAuth 환경변수가 있어야 합니다.

`.env` 파일은 Docker 이미지에 복사하지 않고 `docker-compose.yml`의 `env_file`로 컨테이너 실행 시에만 주입합니다.

## 실행

```bash
docker compose up --build
```

실행 후 접속 주소:

- 프론트엔드: http://localhost:5173
- 백엔드: http://localhost:8080

## 종료

```bash
docker compose down
```

## 코드 수정 후 반영

현재 구성은 단순한 개발용 구성이라 소스 코드를 컨테이너에 복사해서 실행합니다.

코드를 수정한 뒤 컨테이너에 반영하려면 다시 빌드합니다.

```bash
docker compose up --build
```

## 주의

- Supabase DB는 Docker로 생성하지 않습니다.
- `backend/.env`는 Git에 커밋하면 안 됩니다.
- Docker 이미지 안에도 `.env`가 들어가지 않도록 `backend/.dockerignore`, `frontend/.dockerignore`에 제외했습니다.
