import { useMemo, useState } from 'react';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CollectionsBookmarkOutlinedIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import '../styles/writings.css';
import '../styles/materials.css';

const materialItems = [];
const categories = [
  { id: 'all', label: '전체' },
  { id: 'writing', label: '글' },
  { id: 'file', label: '파일' },
  { id: 'image', label: '이미지' },
];
const materialTypes = [
  { id: 'writing', label: '글 소재', description: '작성한 메모나 아이디어를 보관합니다.', Icon: DescriptionOutlinedIcon },
  { id: 'file', label: '파일', description: '참고할 문서 파일을 보관합니다.', Icon: InsertDriveFileOutlinedIcon },
  { id: 'image', label: '이미지', description: '글에 활용할 이미지를 보관합니다.', Icon: ImageOutlinedIcon },
];

/** 글 작성에 활용할 메모·파일·이미지를 한곳에서 관리하는 페이지입니다. */
export default function MaterialsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('stored-desc');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const visibleMaterials = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase('ko-KR');
    return materialItems.filter((material) => {
      const matchesCategory = activeCategory === 'all' || material.type === activeCategory;
      const matchesQuery = !normalizedQuery || [material.title, material.description, ...(material.tags ?? [])]
        .filter(Boolean)
        .some((value) => value.toLocaleLowerCase('ko-KR').includes(normalizedQuery));
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  const handleMaterialTypeSelect = (typeLabel) => {
    setIsAddDialogOpen(false);
    setStatusMessage(`${typeLabel} 추가 화면은 저장 API 연결 후 제공됩니다.`);
  };

  return (
    <div className="materials-page">
      <header className="materials-heading">
        <div><h1>소재 보관함</h1><p>글 작성에 활용할 소재를 모아두세요.</p></div>
        <div className="materials-heading__actions">
          <label className="writings-search materials-search">
            <SearchRoundedIcon aria-hidden="true" /><span className="sr-only">소재 검색</span>
            <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="소재 검색" />
          </label>
          <button className="materials-add-button" type="button" onClick={() => setIsAddDialogOpen(true)}><AddRoundedIcon /><span>소재 추가</span></button>
        </div>
      </header>

      <nav className="materials-categories" aria-label="소재 유형">
        {categories.map((category) => (
          <button key={category.id} className={activeCategory === category.id ? 'is-active' : ''} type="button" onClick={() => setActiveCategory(category.id)} aria-pressed={activeCategory === category.id}>
            {category.label} ({materialItems.filter((item) => category.id === 'all' || item.type === category.id).length})
          </button>
        ))}
      </nav>

      <section className="materials-controls" aria-label="소재 정렬 및 필터">
        <label className="materials-sort"><TuneRoundedIcon aria-hidden="true" /><span className="sr-only">소재 정렬</span><select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}><option value="stored-desc">최근 보관 순</option><option value="stored-asc">오래된 보관 순</option><option value="title-asc">제목 가나다순</option></select></label>
        <button className="materials-filter-button" type="button" onClick={() => setStatusMessage('필터는 소재 데이터 API 연결 후 사용할 수 있습니다.')}><TuneRoundedIcon /><span>필터</span></button>
      </section>

      <section className="materials-list" aria-label="소재 목록" aria-live="polite">
        {visibleMaterials.length === 0 && (
          <div className="materials-empty">
            <span aria-hidden="true"><CollectionsBookmarkOutlinedIcon /></span>
            <strong>{searchQuery.trim() ? '검색 결과가 없습니다.' : '보관된 소재가 없습니다.'}</strong>
            <p>{searchQuery.trim() ? '다른 검색어를 입력해 보세요.' : '글, 파일, 이미지를 추가하면 이곳에서 확인할 수 있습니다.'}</p>
            {!searchQuery.trim() && <button type="button" onClick={() => setIsAddDialogOpen(true)}><AddRoundedIcon />첫 소재 추가</button>}
          </div>
        )}
      </section>

      <aside className="materials-guide"><CollectionsBookmarkOutlinedIcon aria-hidden="true" /><span>소재 보관함의 항목은 글 작성 시 쉽게 가져와 사용할 수 있습니다.</span></aside>
      <p className="materials-status" role="status">{statusMessage}</p>

      {isAddDialogOpen && (
        <div className="materials-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setIsAddDialogOpen(false)}>
          <section className="materials-dialog" role="dialog" aria-modal="true" aria-labelledby="materials-dialog-title">
            <header><div><h2 id="materials-dialog-title">소재 추가</h2><p>보관할 소재 유형을 선택하세요.</p></div><button type="button" onClick={() => setIsAddDialogOpen(false)} aria-label="닫기"><CloseRoundedIcon /></button></header>
            <div className="materials-dialog__options">
              {materialTypes.map(({ id, label, description, Icon }) => <button key={id} type="button" onClick={() => handleMaterialTypeSelect(label)}><Icon /><span><strong>{label}</strong><small>{description}</small></span></button>)}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
