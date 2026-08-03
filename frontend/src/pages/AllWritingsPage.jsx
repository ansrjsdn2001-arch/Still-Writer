import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import WriteActionButton from '../components/common/WriteActionButton';
import { getDocuments } from '../api/documents';
import { getApiErrorMessage } from '../api/client';
import '../styles/writings.css';

const tabs = [
  { id: 'all', label: '전체 글' },
  { id: 'recent', label: '최근 작성' },
  { id: 'folders', label: '폴더' },
];

function formatDateTime(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function AllWritingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('updated-desc');
  const [writings, setWritings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadDocuments() {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const response = await getDocuments();
        if (!ignore) setWritings(response.data ?? []);
      } catch (error) {
        if (!ignore) setErrorMessage(getApiErrorMessage(error, '글 목록을 불러오지 못했습니다.'));
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadDocuments();

    return () => {
      ignore = true;
    };
  }, []);

  const visibleWritings = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase('ko-KR');
    const filtered = normalizedQuery
      ? writings.filter((writing) =>
          [writing.title, writing.preview]
            .filter(Boolean)
            .some((value) => value.toLocaleLowerCase('ko-KR').includes(normalizedQuery)),
        )
      : writings;

    return [...filtered].sort((a, b) => {
      if (sortOrder === 'created-desc') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOrder === 'created-asc') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortOrder === 'title-asc') return (a.title ?? '').localeCompare(b.title ?? '', 'ko-KR');
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  }, [searchQuery, sortOrder, writings]);

  const emptyTitle = searchQuery.trim()
    ? '검색 결과가 없습니다.'
    : '아직 작성한 글이 없습니다.';
  const emptyDescription = searchQuery.trim()
    ? '다른 검색어를 입력해 보세요.'
    : '글을 작성하면 최근 수정 순서로 이곳에 표시됩니다.';

  return (
    <div className="writings-page">
      <header className="writings-page__heading">
        <h1>글</h1>
        <p>지금까지 작성한 모든 글을 관리하고 찾아보세요.</p>
      </header>

      <nav className="writings-tabs" role="tablist" aria-label="글 보기 방식">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? 'is-active' : ''}
            type="button"
            role="tab"
            onClick={() => setActiveTab(tab.id)}
            aria-selected={activeTab === tab.id}
            aria-controls="writings-list-panel"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="writings-controls" aria-label="글 검색 및 정렬">
        <label className="writings-search">
          <SearchRoundedIcon aria-hidden="true" />
          <span className="sr-only">글 검색</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="글 제목, 내용 검색"
          />
        </label>

        <label className="writings-sort">
          <TuneRoundedIcon aria-hidden="true" />
          <span className="sr-only">글 정렬 기준</span>
          <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
            <option value="updated-desc">최신 수정순</option>
            <option value="created-desc">최신 작성순</option>
            <option value="created-asc">오래된 작성순</option>
            <option value="title-asc">제목 가나다순</option>
          </select>
        </label>

        <WriteActionButton />
      </section>

      <section id="writings-list-panel" className="writings-list" role="tabpanel" aria-label="글 목록" aria-live="polite">
        {isLoading && (
          <div className="writings-empty">
            <span className="writings-empty__icon" aria-hidden="true">
              <DescriptionOutlinedIcon />
            </span>
            <strong>글 목록을 불러오는 중입니다.</strong>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="writings-empty">
            <span className="writings-empty__icon" aria-hidden="true">
              <DescriptionOutlinedIcon />
            </span>
            <strong>{errorMessage}</strong>
          </div>
        )}

        {!isLoading && !errorMessage && visibleWritings.length === 0 && (
          <div className="writings-empty">
            <span className="writings-empty__icon" aria-hidden="true">
              <DescriptionOutlinedIcon />
            </span>
            <strong>{emptyTitle}</strong>
            <p>{emptyDescription}</p>
          </div>
        )}

        {!isLoading && !errorMessage && visibleWritings.length > 0 && (
          <div className="writings-card-list">
            {visibleWritings.map((writing) => (
              <button
                key={writing.id}
                className="writings-card"
                type="button"
                onClick={() => navigate(`/writings/${writing.id}`)}
              >
                <strong>{writing.title || '제목 없음'}</strong>
                <p>{writing.preview || '본문 내용이 없습니다.'}</p>
                <span>
                  {formatDateTime(writing.updatedAt)} · {Number(writing.charCount ?? 0).toLocaleString()}자
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
