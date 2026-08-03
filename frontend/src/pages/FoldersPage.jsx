import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import '../styles/writings.css';
import '../styles/folders.css';

const folderItems = [];

const INITIAL_FOLDER_FORM = {
  name: '',
  type: 'MEMO',
  description: '',
  useTargetCharacterCount: false,
  targetCharacterCount: '',
  useDiaryDate: true,
};

const folderTypes = [
  {
    id: 'NOVEL',
    label: '소설',
    description: '목표 글자 수와 달성률을 관리하는 장기 글쓰기 폴더입니다.',
    Icon: AutoStoriesOutlinedIcon,
  },
  {
    id: 'DIARY',
    label: '일기',
    description: '작성 날짜와 연속 작성 기록을 관리하는 일기 폴더입니다.',
    Icon: CalendarMonthOutlinedIcon,
  },
  {
    id: 'MEMO',
    label: '메모',
    description: '짧은 생각과 소재를 빠르게 모아두는 기본 폴더입니다.',
    Icon: NotesOutlinedIcon,
  },
];

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(new Date(value));
}

function getFolderTypeLabel(type) {
  return folderTypes.find((folderType) => folderType.id === type)?.label ?? '기타';
}

function createInitialFolderForm(folder) {
  if (!folder) return INITIAL_FOLDER_FORM;

  return {
    name: folder.name ?? '',
    type: folder.type ?? 'MEMO',
    description: folder.description ?? '',
    useTargetCharacterCount: Boolean(folder.targetCharacterCount),
    targetCharacterCount: folder.targetCharacterCount ? String(folder.targetCharacterCount) : '',
    useDiaryDate: folder.useDiaryDate ?? true,
  };
}

function validateFolderForm(form) {
  const errors = {};
  const trimmedName = form.name.trim();
  const targetCharacterCount = Number(form.targetCharacterCount);

  if (!trimmedName) errors.name = '폴더 이름을 입력해 주세요.';
  else if (trimmedName.length > 30) errors.name = '폴더 이름은 최대 30자까지 입력할 수 있습니다.';

  if (!folderTypes.some(({ id }) => id === form.type)) {
    errors.type = '폴더 유형을 선택해 주세요.';
  }

  if (form.description.trim().length > 120) {
    errors.description = '폴더 설명은 최대 120자까지 입력할 수 있습니다.';
  }

  if (form.type === 'NOVEL' && form.useTargetCharacterCount) {
    if (!form.targetCharacterCount) {
      errors.targetCharacterCount = '목표 글자 수를 입력해 주세요.';
    } else if (!Number.isInteger(targetCharacterCount) || targetCharacterCount < 100 || targetCharacterCount > 1000000) {
      errors.targetCharacterCount = '목표 글자 수는 100~1,000,000 사이의 숫자로 입력해 주세요.';
    }
  }

  return errors;
}

function FolderFormDialog({ mode, initialFolder, onClose, onSubmit }) {
  const [form, setForm] = useState(() => createInitialFolderForm(initialFolder));
  const [errors, setErrors] = useState({});
  const isEditMode = mode === 'edit';

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    const nextValue = name === 'targetCharacterCount'
      ? value.replace(/\D/g, '').slice(0, 7)
      : value;

    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : nextValue,
    }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleTypeChange = (typeId) => {
    setForm((current) => ({
      ...current,
      type: typeId,
      useTargetCharacterCount: typeId === 'NOVEL' ? current.useTargetCharacterCount : false,
      targetCharacterCount: typeId === 'NOVEL' ? current.targetCharacterCount : '',
      useDiaryDate: typeId === 'DIARY' ? current.useDiaryDate : true,
    }));
    setErrors((current) => ({ ...current, type: undefined, targetCharacterCount: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = validateFolderForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const firstInvalidName = Object.keys(nextErrors)[0];
      event.currentTarget.elements.namedItem(firstInvalidName)?.focus();
      return;
    }

    onSubmit({
      name: form.name.trim(),
      type: form.type,
      description: form.description.trim(),
      targetCharacterCount: form.type === 'NOVEL' && form.useTargetCharacterCount
        ? Number(form.targetCharacterCount)
        : null,
      useDiaryDate: form.type === 'DIARY' ? form.useDiaryDate : null,
    });
  };

  return (
    <div className="folders-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="folders-dialog" role="dialog" aria-modal="true" aria-labelledby="folders-dialog-title">
        <header className="folders-dialog__header">
          <div>
            <h2 id="folders-dialog-title">{isEditMode ? '폴더 수정' : '새 폴더 만들기'}</h2>
            <p>{isEditMode ? '폴더 이름과 유형별 설정을 수정합니다.' : '글을 정리할 폴더 유형과 기본 정보를 입력합니다.'}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기">
            <CloseRoundedIcon />
          </button>
        </header>

        <form className="folders-form" onSubmit={handleSubmit} noValidate>
          <fieldset className="folders-form__types">
            <legend>폴더 유형</legend>
            <div>
              {folderTypes.map(({ id, label, description, Icon }) => (
                <button
                  key={id}
                  className={form.type === id ? 'is-active' : ''}
                  type="button"
                  onClick={() => handleTypeChange(id)}
                  aria-pressed={form.type === id}
                >
                  <Icon aria-hidden="true" />
                  <span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                </button>
              ))}
            </div>
            {errors.type && <p className="folders-form__error">{errors.type}</p>}
          </fieldset>

          <label className={`folders-form__field${errors.name ? ' is-invalid' : ''}`}>
            <span>폴더 이름</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="예: 장편 소설 초안"
              maxLength={30}
              aria-invalid={Boolean(errors.name)}
              required
            />
            <small>{form.name.length}/30</small>
          </label>
          {errors.name && <p className="folders-form__error">{errors.name}</p>}

          <label className={`folders-form__field${errors.description ? ' is-invalid' : ''}`}>
            <span>폴더 설명</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="폴더의 목적을 짧게 적어두면 나중에 찾기 쉽습니다."
              maxLength={120}
              rows={3}
              aria-invalid={Boolean(errors.description)}
            />
            <small>{form.description.length}/120</small>
          </label>
          {errors.description && <p className="folders-form__error">{errors.description}</p>}

          {form.type === 'NOVEL' && (
            <div className="folders-form__option">
              <label className="folders-form__checkbox">
                <input
                  type="checkbox"
                  name="useTargetCharacterCount"
                  checked={form.useTargetCharacterCount}
                  onChange={handleChange}
                />
                <span>목표 글자 수 설정</span>
              </label>
              {form.useTargetCharacterCount && (
                <label className={`folders-form__field${errors.targetCharacterCount ? ' is-invalid' : ''}`}>
                  <span>목표 글자 수</span>
                  <input
                    type="text"
                    name="targetCharacterCount"
                    value={form.targetCharacterCount}
                    onChange={handleChange}
                    inputMode="numeric"
                    placeholder="예: 80000"
                    aria-invalid={Boolean(errors.targetCharacterCount)}
                  />
                </label>
              )}
              {errors.targetCharacterCount && <p className="folders-form__error">{errors.targetCharacterCount}</p>}
            </div>
          )}

          {form.type === 'DIARY' && (
            <div className="folders-form__option">
              <label className="folders-form__checkbox">
                <input
                  type="checkbox"
                  name="useDiaryDate"
                  checked={form.useDiaryDate}
                  onChange={handleChange}
                />
                <span>일기 생성 시 날짜 자동 기입</span>
              </label>
              <p>이 설정을 켜면 일기 폴더에서 새 글을 만들 때 작성 날짜를 기본값으로 사용할 수 있습니다.</p>
            </div>
          )}

          <div className="folders-form__actions">
            <button className="folders-form__cancel" type="button" onClick={onClose}>취소</button>
            <button className="folders-form__submit" type="submit">{isEditMode ? '수정하기' : '만들기'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

/** 사용자가 만든 글 폴더를 검색하고 분류해서 확인하는 화면입니다. */
export default function FoldersPage() {
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('updated-desc');
  const [statusMessage, setStatusMessage] = useState('');
  const [folderDialogState, setFolderDialogState] = useState({ open: false, mode: 'create', folder: null });

  const visibleFolders = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase('ko-KR');
    const filtered = folderItems.filter((folder) => {
      const matchesType = activeType === 'ALL' || folder.type === activeType;
      const matchesQuery = !normalizedQuery || [folder.name, folder.description]
        .filter(Boolean)
        .some((value) => value.toLocaleLowerCase('ko-KR').includes(normalizedQuery));

      return matchesType && matchesQuery;
    });

    return [...filtered].sort((a, b) => {
      if (sortOrder === 'created-desc') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOrder === 'name-asc') return (a.name ?? '').localeCompare(b.name ?? '', 'ko-KR');
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  }, [activeType, searchQuery, sortOrder]);

  const folderCountByType = useMemo(() => {
    const counts = { ALL: folderItems.length };
    folderTypes.forEach(({ id }) => {
      counts[id] = folderItems.filter((folder) => folder.type === id).length;
    });
    return counts;
  }, []);

  const handleCreateFolder = () => {
    setStatusMessage('');
    setFolderDialogState({ open: true, mode: 'create', folder: null });
  };

  const handleFolderFormClose = () => {
    setFolderDialogState((current) => ({ ...current, open: false }));
  };

  const handleFolderFormSubmit = (payload) => {
    setFolderDialogState((current) => ({ ...current, open: false }));
    setStatusMessage(
      folderDialogState.mode === 'edit'
        ? `${payload.name} 폴더 수정은 폴더 API 연결 후 저장됩니다.`
        : `${payload.name} 폴더 생성은 폴더 API 연결 후 저장됩니다.`,
    );
  };

  return (
    <div className="folders-page">
      <header className="folders-heading">
        <div>
          <h1>내 폴더</h1>
          <p>소설, 일기, 메모 폴더를 분류해서 글을 관리하세요.</p>
        </div>
        <button className="folders-create-button" type="button" onClick={handleCreateFolder}>
          <CreateNewFolderOutlinedIcon />
          <span>새 폴더</span>
        </button>
      </header>

      <section className="folders-summary" aria-label="폴더 유형 안내">
        {folderTypes.map(({ id, label, description, Icon }) => (
          <button
            key={id}
            className={`folders-summary-card${activeType === id ? ' is-active' : ''}`}
            type="button"
            onClick={() => setActiveType((current) => (current === id ? 'ALL' : id))}
            aria-pressed={activeType === id}
          >
            <span className="folders-summary-card__icon" aria-hidden="true">
              <Icon />
            </span>
            <span>
              <strong>{label}</strong>
              <small>{description}</small>
              <em>{folderCountByType[id].toLocaleString()}개</em>
            </span>
          </button>
        ))}
      </section>

      <nav className="folders-categories" aria-label="폴더 유형 필터">
        <button className={activeType === 'ALL' ? 'is-active' : ''} type="button" onClick={() => setActiveType('ALL')} aria-pressed={activeType === 'ALL'}>
          전체 {folderCountByType.ALL.toLocaleString()}
        </button>
        {folderTypes.map(({ id, label }) => (
          <button key={id} className={activeType === id ? 'is-active' : ''} type="button" onClick={() => setActiveType(id)} aria-pressed={activeType === id}>
            {label} {folderCountByType[id].toLocaleString()}
          </button>
        ))}
      </nav>

      <section className="folders-controls" aria-label="폴더 검색 및 정렬">
        <label className="writings-search">
          <SearchRoundedIcon aria-hidden="true" />
          <span className="sr-only">폴더 검색</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="폴더 이름 검색"
          />
        </label>

        <label className="writings-sort">
          <TuneRoundedIcon aria-hidden="true" />
          <span className="sr-only">폴더 정렬 기준</span>
          <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
            <option value="updated-desc">최근 사용순</option>
            <option value="created-desc">최근 생성순</option>
            <option value="name-asc">이름 가나다순</option>
          </select>
        </label>
      </section>

      <section className="folders-list" aria-label="폴더 목록" aria-live="polite">
        {visibleFolders.length === 0 && (
          <div className="folders-empty">
            <span aria-hidden="true">
              <FolderOpenOutlinedIcon />
            </span>
            <strong>{searchQuery.trim() ? '검색 결과가 없습니다.' : '생성된 폴더가 없습니다.'}</strong>
            <p>
              {searchQuery.trim()
                ? '다른 폴더 이름을 입력해 보세요.'
                : '새 폴더를 만들면 소설, 일기, 메모를 목적에 맞게 정리할 수 있습니다.'}
            </p>
            {!searchQuery.trim() && (
              <button type="button" onClick={handleCreateFolder}>
                <CreateNewFolderOutlinedIcon />
                첫 폴더 만들기
              </button>
            )}
          </div>
        )}

        {visibleFolders.length > 0 && (
          <div className="folders-card-list">
            {visibleFolders.map((folder) => (
              <button key={folder.id} className="folders-card" type="button" onClick={() => navigate(`/folders/${folder.id}`)}>
                <span className="folders-card__icon" aria-hidden="true">
                  <FolderOutlinedIcon />
                </span>
                <span>
                  <strong>{folder.name}</strong>
                  <small>{getFolderTypeLabel(folder.type)} · {Number(folder.documentCount ?? 0).toLocaleString()}개 글</small>
                  <em>최근 사용 {formatDate(folder.updatedAt)}</em>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <p className="folders-status" role="status">{statusMessage}</p>

      {folderDialogState.open && (
        <FolderFormDialog
          mode={folderDialogState.mode}
          initialFolder={folderDialogState.folder}
          onClose={handleFolderFormClose}
          onSubmit={handleFolderFormSubmit}
        />
      )}
    </div>
  );
}
