# ERDCloud 반영 항목: document_external_files

## 테이블 목적

`document_external_files`는 Still Writer 문서와 Google Drive 같은 외부 저장소 파일의 연결 관계를 저장하는 테이블입니다.

이 테이블을 통해 다음 기능을 구현합니다.

- 문서를 Google Drive로 내보낸 뒤 같은 파일을 다시 갱신
- 문서 단위 백업 파일 추적
- 단방향 또는 수동 동기화 상태 관리
- 외부 파일의 버전, 마지막 동기화 시점, 실패 사유 추적

외부 파일의 실제 내용은 이 테이블에 저장하지 않습니다. 실제 파일은 Google Drive에 있고, DB에는 어떤 Still Writer 문서가 어떤 외부 파일과 연결되어 있는지만 저장합니다.

## 테이블

```text
document_external_files
```

## 컬럼

| 컬럼명 | 데이터 타입 | NULL 허용 | 기본값 | 설명 |
|---|---:|---:|---|---|
| id | BIGINT | N | IDENTITY | 문서-외부 파일 연결 고유번호 |
| document_id | BIGINT | N |  | 외부 파일과 연결된 글 |
| external_storage_account_id | BIGINT | N |  | 외부 저장소 연동 계정 |
| provider | VARCHAR(30) | N |  | 외부 저장소 제공자. 현재 GOOGLE_DRIVE |
| provider_file_id | VARCHAR(512) | N |  | Google Drive fileId 같은 외부 파일 식별자 |
| file_name | VARCHAR(255) | N |  | 외부 저장소에 저장된 파일명 |
| mime_type | VARCHAR(191) | Y |  | 외부 파일 MIME 타입 |
| export_format | VARCHAR(10) | N |  | TXT, DOCX, PDF, MARKDOWN |
| purpose | VARCHAR(20) | N | 'EXPORT' | EXPORT, BACKUP, SYNC |
| sync_status | VARCHAR(20) | N | 'LINKED' | LINKED, SYNCED, PENDING, FAILED, CONFLICT, DISCONNECTED |
| web_view_link | VARCHAR(2048) | Y |  | Google Drive 웹 보기 링크 |
| remote_revision_id | VARCHAR(191) | Y |  | 외부 저장소의 파일 버전 또는 revision 식별자 |
| remote_modified_at | TIMESTAMPTZ(6) | Y |  | 외부 파일의 마지막 수정 시점 |
| last_synced_at | TIMESTAMPTZ(6) | Y |  | 마지막 동기화 성공 시점 |
| last_exported_at | TIMESTAMPTZ(6) | Y |  | 마지막 내보내기 성공 시점 |
| last_imported_at | TIMESTAMPTZ(6) | Y |  | 마지막 가져오기 성공 시점 |
| last_error_message | VARCHAR(1000) | Y |  | 마지막 연동 실패 사유 |
| checksum_sha256 | CHAR(64) | Y |  | 외부 파일 내용 검증용 SHA-256 |
| metadata | JSONB | Y |  | Google Drive parents, iconLink 등 추가 메타데이터 |
| created_at | TIMESTAMPTZ(6) | N | CURRENT_TIMESTAMP | 연결 생성 시점 |
| updated_at | TIMESTAMPTZ(6) | N | CURRENT_TIMESTAMP | 연결 정보 수정 시점 |

## PK

```text
id
```

## FK

```text
document_id -> documents.id
ON DELETE CASCADE

external_storage_account_id -> external_storage_accounts.id
ON DELETE CASCADE
```

## UNIQUE

```text
UNIQUE(external_storage_account_id, provider_file_id)
UNIQUE(document_id, external_storage_account_id, purpose, export_format)
```

## CHECK

```text
provider IN ('GOOGLE_DRIVE')
export_format IN ('TXT', 'DOCX', 'PDF', 'MARKDOWN')
purpose IN ('EXPORT', 'BACKUP', 'SYNC')
sync_status IN ('LINKED', 'SYNCED', 'PENDING', 'FAILED', 'CONFLICT', 'DISCONNECTED')
checksum_sha256 IS NULL OR checksum_sha256 ~ '^[0-9A-Fa-f]{64}$'
```

## 인덱스

```text
idx_document_external_files_document
  (document_id, purpose, updated_at DESC)

idx_document_external_files_account_status
  (external_storage_account_id, sync_status, updated_at DESC)

idx_document_external_files_pending
  (sync_status, updated_at)
  WHERE sync_status IN ('PENDING', 'FAILED', 'CONFLICT')
```
