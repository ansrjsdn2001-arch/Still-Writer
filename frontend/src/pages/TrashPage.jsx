import { useMemo, useState } from 'react';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import '../styles/writings.css';
import '../styles/trash.css';

const deletedItems = [];
const categories = [
  { id: 'all', label: '전체' },
  { id: 'writing', label: '글' },
  { id: 'folder', label: '폴더' },
];

/** 삭제된 글과 폴더를 복원하거나 영구 삭제하기 위한 관리 페이지입니다. */
export default function TrashPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('deleted-desc');
  const [statusMessage, setStatusMessage] = useState('');

  const visibleItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase('ko-KR');
    return deletedItems.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.type === activeCategory;
      const matchesQuery = !normalizedQuery || [item.title, item.content, item.folderName]
        .filter(Boolean)
        .some((value) => value.toLocaleLowerCase('ko-KR').includes(normalizedQuery));
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  const handleRefresh = () => setStatusMessage('휴지통을 새로고침했습니다.');
  const handleEmptyTrash = () => setStatusMessage('영구 삭제할 휴지통 항목이 없습니다.');

  return (
    <div className="trash-page">
      <header className="trash-heading">
        <div><h1>휴지통</h1><p>삭제된 글과 폴더는 30일 후 자동으로 영구 삭제됩니다.</p></div>
        <div className="trash-heading__actions">
          <button type="button" onClick={handleRefresh}><RefreshRoundedIcon /><span>새로고침</span></button>
          <button type="button" onClick={handleEmptyTrash}><DeleteForeverOutlinedIcon /><span>휴지통 비우기</span></button>
        </div>
      </header>

      <nav className="trash-categories" aria-label="휴지통 유형">
        {categories.map((category) => {
          const count = deletedItems.filter((item) => category.id === 'all' || item.type === category.id).length;
          return <button key={category.id} className={activeCategory === category.id ? 'is-active' : ''} type="button" onClick={() => setActiveCategory(category.id)} aria-pressed={activeCategory === category.id}>{category.label} {count}</button>;
        })}
      </nav>

      <section className="trash-controls" aria-label="휴지통 검색 및 정렬">
        <label className="writings-search">
          <SearchRoundedIcon aria-hidden="true" /><span className="sr-only">휴지통 검색</span>
          <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="휴지통에서 검색" />
        </label>
        <label className="writings-sort">
          <TuneRoundedIcon aria-hidden="true" /><span className="sr-only">휴지통 정렬 기준</span>
          <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}><option value="deleted-desc">최근 삭제순</option><option value="deleted-asc">오래된 삭제순</option><option value="remaining-asc">삭제 임박순</option></select>
        </label>
      </section>

      <p className="trash-count">총 {visibleItems.length.toLocaleString()}개의 휴지통 항목</p>

      <section className="trash-list" aria-label="휴지통 목록" aria-live="polite">
        {visibleItems.length === 0 && (
          <div className="trash-empty">
            <span aria-hidden="true"><DeleteOutlineRoundedIcon /></span>
            <strong>{searchQuery.trim() ? '검색 결과가 없습니다.' : '휴지통이 비어 있습니다.'}</strong>
            <p>{searchQuery.trim() ? '다른 검색어를 입력해 보세요.' : '삭제한 글과 폴더가 이곳에 표시됩니다.'}</p>
          </div>
        )}
      </section>

      <aside className="trash-guide"><DeleteForeverOutlinedIcon aria-hidden="true" /><span>영구 삭제된 항목은 복구할 수 없습니다. 필요한 항목은 만료 전에 복원해 주세요.</span></aside>
      <p className="trash-status" role="status">{statusMessage}</p>
    </div>
  );
}
