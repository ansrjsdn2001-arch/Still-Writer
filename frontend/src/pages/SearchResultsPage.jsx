import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CollectionsBookmarkOutlinedIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import { getApiErrorMessage } from '../api/client';
import { getDocuments } from '../api/documents';
import '../styles/search.css';

const categoryTabs = [
  { id: 'all', label: '전체' },
  { id: 'writings', label: '글' },
  { id: 'folders', label: '폴더' },
  { id: 'materials', label: '소재' },
];

function normalizeSearchValue(value) {
  return String(value ?? '').trim().toLocaleLowerCase('ko-KR');
}

function stripHtml(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatDateTime(value) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getWritingSnippet(writing) {
  const sourceText = writing.preview ?? writing.content ?? writing.body ?? writing.plainText ?? '';
  const snippet = stripHtml(sourceText);
  if (!snippet) return '본문 미리보기가 없습니다.';
  return snippet.length > 140 ? `${snippet.slice(0, 140)}...` : snippet;
}

function matchesWriting(writing, normalizedQuery) {
  if (!normalizedQuery) return false;

  return [
    writing.title,
    writing.preview,
    writing.content,
    writing.body,
    writing.plainText,
  ]
    .filter(Boolean)
    .some((value) => stripHtml(value).toLocaleLowerCase('ko-KR').includes(normalizedQuery));
}

export default function SearchResultsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const activeCategory = searchParams.get('type') ?? 'all';
  const [searchInput, setSearchInput] = useState(query);
  const [writings, setWritings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

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

  const normalizedQuery = normalizeSearchValue(query);
  const safeActiveCategory = categoryTabs.some((tab) => tab.id === activeCategory) ? activeCategory : 'all';
  const shouldSearch = normalizedQuery.length > 0;

  const writingResults = useMemo(() => {
    if (!shouldSearch) return [];

    return writings
      .filter((writing) => matchesWriting(writing, normalizedQuery))
      .sort((a, b) => new Date(b.updatedAt ?? b.createdAt ?? 0) - new Date(a.updatedAt ?? a.createdAt ?? 0));
  }, [normalizedQuery, shouldSearch, writings]);

  const totalResultCount = writingResults.length;
  const showWritings = safeActiveCategory === 'all' || safeActiveCategory === 'writings';
  const showFolders = safeActiveCategory === 'all' || safeActiveCategory === 'folders';
  const showMaterials = safeActiveCategory === 'all' || safeActiveCategory === 'materials';

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const nextQuery = searchInput.trim();
    if (!nextQuery) {
      setSearchParams({}, { replace: true });
      return;
    }

    setSearchParams({ q: nextQuery, type: safeActiveCategory }, { replace: false });
  };

  const handleCategoryChange = (categoryId) => {
    const nextParams = {};
    if (query.trim()) nextParams.q = query.trim();
    if (categoryId !== 'all') nextParams.type = categoryId;
    setSearchParams(nextParams, { replace: false });
  };

  return (
    <div className="search-page">
      <header className="search-hero">
        <span className="search-hero__icon" aria-hidden="true">
          <SearchRoundedIcon />
        </span>
        <div>
          <h1>검색 결과</h1>
          <p>글, 폴더, 소재를 한 화면에서 찾을 수 있도록 준비한 통합 검색 화면입니다.</p>
        </div>
      </header>

      <form className="search-form" onSubmit={handleSearchSubmit} role="search" aria-label="통합 검색">
        <label className="writings-search search-form__input">
          <SearchRoundedIcon aria-hidden="true" />
          <span className="sr-only">검색어</span>
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="검색어를 입력해 주세요"
          />
        </label>
        <button type="submit">
          <SearchRoundedIcon aria-hidden="true" />
          검색
        </button>
      </form>

      <nav className="search-tabs" aria-label="검색 결과 유형">
        {categoryTabs.map((tab) => (
          <button
            key={tab.id}
            className={safeActiveCategory === tab.id ? 'is-active' : ''}
            type="button"
            onClick={() => handleCategoryChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="search-summary" aria-live="polite">
        <TuneRoundedIcon aria-hidden="true" />
        {shouldSearch ? (
          <p>
            <strong>{query}</strong> 검색어로 현재 확인 가능한 글 {totalResultCount.toLocaleString()}건을 찾았습니다.
          </p>
        ) : (
          <p>검색어를 입력하면 결과가 이곳에 표시됩니다.</p>
        )}
      </section>

      {!shouldSearch && (
        <section className="search-empty">
          <span aria-hidden="true">
            <SearchRoundedIcon />
          </span>
          <strong>검색어를 입력해 주세요.</strong>
          <p>제목이나 본문에 포함된 단어를 입력하면 글 결과를 먼저 확인할 수 있습니다.</p>
        </section>
      )}

      {shouldSearch && (
        <div className="search-results">
          {showWritings && (
            <section className="search-section" aria-labelledby="search-writings-title">
              <div className="search-section__header">
                <span aria-hidden="true">
                  <DescriptionOutlinedIcon />
                </span>
                <div>
                  <h2 id="search-writings-title">글</h2>
                  <p>기존 글 목록 API에서 제목과 본문 미리보기를 기준으로 검색합니다.</p>
                </div>
              </div>

              {isLoading && (
                <div className="search-section__state">
                  <strong>글 결과를 불러오는 중입니다.</strong>
                </div>
              )}

              {!isLoading && errorMessage && (
                <div className="search-section__state is-error">
                  <ErrorOutlineRoundedIcon aria-hidden="true" />
                  <strong>{errorMessage}</strong>
                </div>
              )}

              {!isLoading && !errorMessage && writingResults.length === 0 && (
                <div className="search-section__state">
                  <strong>일치하는 글이 없습니다.</strong>
                  <p>다른 검색어를 입력하거나 띄어쓰기를 줄여서 다시 검색해 보세요.</p>
                </div>
              )}

              {!isLoading && !errorMessage && writingResults.length > 0 && (
                <div className="search-card-list">
                  {writingResults.map((writing) => (
                    <button
                      key={writing.id}
                      className="search-result-card"
                      type="button"
                      onClick={() => navigate(`/writings/${writing.id}`)}
                    >
                      <strong>{writing.title || '제목 없음'}</strong>
                      <p>{getWritingSnippet(writing)}</p>
                      <span>
                        최근 수정 {formatDateTime(writing.updatedAt ?? writing.createdAt)}
                        {' · '}
                        {Number(writing.charCount ?? 0).toLocaleString()}자
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {showFolders && (
            <section className="search-section" aria-labelledby="search-folders-title">
              <div className="search-section__header">
                <span aria-hidden="true">
                  <FolderOutlinedIcon />
                </span>
                <div>
                  <h2 id="search-folders-title">폴더</h2>
                  <p>폴더 검색 API가 연결되면 이름, 유형, 설명 기준으로 결과를 표시합니다.</p>
                </div>
              </div>
              <div className="search-section__state">
                <strong>폴더 검색 API 연결 대기 중입니다.</strong>
                <p>현재는 화면 영역만 준비되어 있으며 실제 폴더 데이터 검색은 아직 연결되지 않았습니다.</p>
              </div>
            </section>
          )}

          {showMaterials && (
            <section className="search-section" aria-labelledby="search-materials-title">
              <div className="search-section__header">
                <span aria-hidden="true">
                  <CollectionsBookmarkOutlinedIcon />
                </span>
                <div>
                  <h2 id="search-materials-title">소재</h2>
                  <p>소재 검색 API가 연결되면 텍스트, 링크, 파일 메타데이터 기준으로 결과를 표시합니다.</p>
                </div>
              </div>
              <div className="search-section__state">
                <strong>소재 검색 API 연결 대기 중입니다.</strong>
                <p>현재는 화면 영역만 준비되어 있으며 실제 소재 데이터 검색은 아직 연결되지 않았습니다.</p>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
