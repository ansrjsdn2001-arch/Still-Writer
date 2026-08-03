import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import WriteActionButton from '../components/common/WriteActionButton';
import '../styles/writings.css';
import '../styles/folders.css';

const folderDocuments = [];

const folderTypeDetails = {
  NOVEL: {
    label: '소설',
    Icon: AutoStoriesOutlinedIcon,
    description: '목표 글자 수와 진행률을 확인하는 소설 폴더입니다.',
  },
  DIARY: {
    label: '일기',
    Icon: CalendarMonthOutlinedIcon,
    description: '작성 날짜와 연속 작성 기록을 확인하는 일기 폴더입니다.',
  },
  MEMO: {
    label: '메모',
    Icon: NotesOutlinedIcon,
    description: '짧은 생각과 소재를 정리하는 메모 폴더입니다.',
  },
};

const fallbackFolder = {
  id: null,
  name: '폴더 상세',
  type: 'MEMO',
  description: '폴더 API가 연결되면 이 영역에 실제 폴더 정보가 표시됩니다.',
  documentCount: 0,
  targetCharacterCount: null,
  currentCharacterCount: 0,
  consecutiveWritingDays: 0,
  updatedAt: null,
};

function formatDateTime(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getProgressPercent(current, target) {
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

/** 선택한 폴더의 정보와 내부 글 목록을 확인하는 화면입니다. */
export default function FolderDetailPage() {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('updated-desc');
  const [statusMessage, setStatusMessage] = useState('');
  const folder = { ...fallbackFolder, id: folderId };
  const folderType = folderTypeDetails[folder.type] ?? folderTypeDetails.MEMO;
  const FolderTypeIcon = folderType.Icon;
  const progressPercent = getProgressPercent(folder.currentCharacterCount, folder.targetCharacterCount);

  const visibleDocuments = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase('ko-KR');
    const filtered = folderDocuments.filter((document) => {
      if (!normalizedQuery) return true;
      return [document.title, document.preview]
        .filter(Boolean)
        .some((value) => value.toLocaleLowerCase('ko-KR').includes(normalizedQuery));
    });

    return [...filtered].sort((a, b) => {
      if (sortOrder === 'created-desc') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOrder === 'title-asc') return (a.title ?? '').localeCompare(b.title ?? '', 'ko-KR');
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  }, [searchQuery, sortOrder]);

  const handleEditFolder = () => {
    setStatusMessage('폴더 수정은 폴더 API 연결 후 상세 화면에서 저장까지 연결됩니다.');
  };

  const handleCreateDocumentInFolder = () => {
    navigate(`/write?folderId=${encodeURIComponent(folderId ?? '')}`);
  };

  const emptyTitle = searchQuery.trim()
    ? '검색 결과가 없습니다.'
    : '이 폴더에 작성한 글이 없습니다.';
  const emptyDescription = searchQuery.trim()
    ? '다른 검색어를 입력해 보세요.'
    : '이 폴더에서 새 글을 작성하면 이곳에 목록이 표시됩니다.';

  return (
    <div className="folder-detail-page">
      <button className="folder-detail-back" type="button" onClick={() => navigate('/folders')}>
        <ArrowBackRoundedIcon />
        <span>내 폴더로 돌아가기</span>
      </button>

      <section className="folder-detail-hero" aria-labelledby="folder-detail-title">
        <div className="folder-detail-hero__icon" aria-hidden="true">
          <FolderTypeIcon />
        </div>
        <div className="folder-detail-hero__content">
          <span>{folderType.label} 폴더</span>
          <h1 id="folder-detail-title">{folder.name}</h1>
          <p>{folder.description || folderType.description}</p>
          <dl>
            <div>
              <dt>폴더 ID</dt>
              <dd>{folder.id ?? '-'}</dd>
            </div>
            <div>
              <dt>최근 사용</dt>
              <dd>{formatDateTime(folder.updatedAt)}</dd>
            </div>
          </dl>
        </div>
        <div className="folder-detail-hero__actions">
          <button type="button" onClick={handleEditFolder}>
            <EditOutlinedIcon />
            <span>폴더 수정</span>
          </button>
          <button type="button" onClick={handleCreateDocumentInFolder}>
            <DescriptionOutlinedIcon />
            <span>이 폴더에 글쓰기</span>
          </button>
        </div>
      </section>

      <section className="folder-detail-stats" aria-label="폴더 통계">
        <article>
          <span>글 수</span>
          <strong>{Number(folder.documentCount ?? 0).toLocaleString()}개</strong>
        </article>
        <article>
          <span>누적 글자 수</span>
          <strong>{Number(folder.currentCharacterCount ?? 0).toLocaleString()}자</strong>
        </article>
        <article>
          <span>{folder.type === 'DIARY' ? '연속 작성일' : '목표 달성률'}</span>
          <strong>{folder.type === 'DIARY' ? `${folder.consecutiveWritingDays}일` : `${progressPercent}%`}</strong>
        </article>
      </section>

      {folder.targetCharacterCount && (
        <section className="folder-detail-progress" aria-label="목표 글자 수 진행률">
          <div>
            <strong>목표 글자 수</strong>
            <span>
              {Number(folder.currentCharacterCount ?? 0).toLocaleString()} / {Number(folder.targetCharacterCount).toLocaleString()}자
            </span>
          </div>
          <div className="folder-detail-progress__bar" aria-hidden="true">
            <span style={{ width: `${progressPercent}%` }} />
          </div>
        </section>
      )}

      <section className="folder-detail-controls" aria-label="폴더 내부 글 검색 및 정렬">
        <label className="writings-search">
          <SearchRoundedIcon aria-hidden="true" />
          <span className="sr-only">폴더 내부 글 검색</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="이 폴더에서 글 검색"
          />
        </label>

        <label className="writings-sort">
          <TuneRoundedIcon aria-hidden="true" />
          <span className="sr-only">폴더 내부 글 정렬 기준</span>
          <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
            <option value="updated-desc">최신 수정순</option>
            <option value="created-desc">최신 작성순</option>
            <option value="title-asc">제목 가나다순</option>
          </select>
        </label>

        <WriteActionButton />
      </section>

      <section className="folder-detail-documents" aria-label="폴더 내부 글 목록" aria-live="polite">
        {visibleDocuments.length === 0 && (
          <div className="folders-empty">
            <span aria-hidden="true">
              <FolderOutlinedIcon />
            </span>
            <strong>{emptyTitle}</strong>
            <p>{emptyDescription}</p>
            {!searchQuery.trim() && (
              <button type="button" onClick={handleCreateDocumentInFolder}>
                <DescriptionOutlinedIcon />
                이 폴더에 첫 글 쓰기
              </button>
            )}
          </div>
        )}

        {visibleDocuments.length > 0 && (
          <div className="writings-card-list">
            {visibleDocuments.map((document) => (
              <button
                key={document.id}
                className="writings-card"
                type="button"
                onClick={() => navigate(`/writings/${document.id}`)}
              >
                <strong>{document.title || '제목 없음'}</strong>
                <p>{document.preview || '본문 내용이 없습니다.'}</p>
                <span>
                  {formatDateTime(document.updatedAt)} · {Number(document.charCount ?? 0).toLocaleString()}자
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <p className="folders-status" role="status">{statusMessage}</p>
    </div>
  );
}
