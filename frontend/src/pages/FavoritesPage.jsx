import { useMemo, useState } from 'react';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import '../styles/writings.css';
import '../styles/favorites.css';

const favoriteWritings = [];

/** 즐겨찾기로 지정한 글을 검색하고 정렬하는 페이지입니다. */
export default function FavoritesPage() {
  const [contentType, setContentType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('favorited-desc');

  const visibleFavorites = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase('ko-KR');
    return favoriteWritings.filter((writing) => {
      const matchesType = contentType === 'all' || writing.contentType === contentType;
      const matchesQuery = !normalizedQuery || [writing.title, writing.content, writing.folderName]
        .filter(Boolean)
        .some((value) => value.toLocaleLowerCase('ko-KR').includes(normalizedQuery));
      return matchesType && matchesQuery;
    });
  }, [contentType, searchQuery]);

  const hasSearchQuery = Boolean(searchQuery.trim());

  return (
    <div className="writings-page favorites-page">
      <header className="writings-page__heading">
        <h1>즐겨찾기</h1>
        <p>중요한 글을 한곳에 모아 빠르게 확인하세요.</p>
      </header>

      <div className="favorites-filters" role="group" aria-label="즐겨찾기 유형">
        <button className={contentType === 'all' ? 'is-active' : ''} type="button" onClick={() => setContentType('all')} aria-pressed={contentType === 'all'}>전체</button>
        <button className={contentType === 'writing' ? 'is-active' : ''} type="button" onClick={() => setContentType('writing')} aria-pressed={contentType === 'writing'}>글</button>
      </div>

      <section className="writings-controls favorites-controls" aria-label="즐겨찾기 검색 및 정렬">
        <label className="writings-search">
          <SearchRoundedIcon aria-hidden="true" />
          <span className="sr-only">즐겨찾기 검색</span>
          <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="즐겨찾기한 글 검색" />
        </label>
        <label className="writings-sort">
          <TuneRoundedIcon aria-hidden="true" />
          <span className="sr-only">즐겨찾기 정렬 기준</span>
          <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
            <option value="favorited-desc">최근 추가순</option>
            <option value="updated-desc">최신 수정순</option>
            <option value="title-asc">제목 가나다순</option>
          </select>
        </label>
      </section>

      <p className="favorites-count">총 {visibleFavorites.length.toLocaleString()}개의 즐겨찾기 글</p>

      <section className="writings-list" aria-label="즐겨찾기 글 목록" aria-live="polite">
        {visibleFavorites.length === 0 && (
          <div className="writings-empty">
            <span className="writings-empty__icon" aria-hidden="true"><StarBorderRoundedIcon /></span>
            <strong>{hasSearchQuery ? '검색 결과가 없습니다.' : '즐겨찾기한 글이 없습니다.'}</strong>
            <p>{hasSearchQuery ? '다른 검색어를 입력해 보세요.' : '중요한 글을 즐겨찾기에 추가하면 이곳에서 확인할 수 있습니다.'}</p>
          </div>
        )}
      </section>
    </div>
  );
}
