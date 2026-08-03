import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import WriteActionButton from '../components/common/WriteActionButton';
import { getApiErrorMessage } from '../api/client';
import { getDocuments } from '../api/documents';
import '../styles/home.css';

function formatDateTime(value) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function isSameDate(value, compareDate = new Date()) {
  if (!value) return false;

  const date = new Date(value);
  return date.getFullYear() === compareDate.getFullYear()
    && date.getMonth() === compareDate.getMonth()
    && date.getDate() === compareDate.getDate();
}

function isCreatedActivity(document) {
  if (!document.createdAt || !document.updatedAt) return true;

  const createdAt = new Date(document.createdAt).getTime();
  const updatedAt = new Date(document.updatedAt).getTime();
  return Math.abs(updatedAt - createdAt) < 1000;
}

function buildActivityLabel(document) {
  return isCreatedActivity(document) ? '글 작성' : '글 수정';
}

function getPreview(document) {
  const preview = document.preview?.trim();
  if (preview) return preview;
  return '본문 미리보기가 없습니다.';
}

export default function HomePage({ currentUser }) {
  const navigate = useNavigate();
  const nickname = currentUser?.nickname?.trim();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadHomeDocuments() {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const response = await getDocuments();
        if (!ignore) setDocuments(response.data ?? []);
      } catch (error) {
        if (!ignore) setErrorMessage(getApiErrorMessage(error, '홈 데이터를 불러오지 못했습니다.'));
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadHomeDocuments();

    return () => {
      ignore = true;
    };
  }, []);

  const sortedDocuments = useMemo(
    () => [...documents].sort((a, b) => new Date(b.updatedAt ?? b.createdAt ?? 0) - new Date(a.updatedAt ?? a.createdAt ?? 0)),
    [documents],
  );

  const recentDocuments = sortedDocuments.slice(0, 4);
  const recentActivities = sortedDocuments.slice(0, 5);
  const todayDocuments = documents.filter((document) => isSameDate(document.updatedAt) || isSameDate(document.createdAt));
  const todayCharCount = todayDocuments.reduce((sum, document) => sum + Number(document.charCount ?? 0), 0);
  const totalCharCount = documents.reduce((sum, document) => sum + Number(document.charCount ?? 0), 0);

  return (
    <div className="home-page">
      <div className="home-layout">
        <section
          className="home-hero"
          aria-labelledby="home-title"
          style={{
            '--home-hero-image-light': 'url("/images/heroimage(light).png")',
            '--home-hero-image-dark': 'url("/images/heroimage(dark).png")',
          }}
        >
          <div className="home-hero__content">
            <h1 id="home-title">
              {nickname ? `안녕하세요, ${nickname}님` : '안녕하세요'}
              <span aria-hidden="true">👋</span>
            </h1>
            <p>오늘도 좋은 글을 써보세요.</p>
          </div>
        </section>

        <section className="home-card home-record" aria-labelledby="today-record-title">
          <header className="home-card__header">
            <h2 id="today-record-title">오늘의 기록</h2>
          </header>
          <div className="home-record__grid">
            <div className="home-record__item">
              <span>오늘 작성/수정 글자 수</span>
              <strong>{isLoading ? '-' : todayCharCount.toLocaleString()}</strong>
            </div>
            <div className="home-record__item">
              <span>전체 글 수</span>
              <strong>{isLoading ? '-' : documents.length.toLocaleString()}</strong>
            </div>
            <div className="home-record__item">
              <span>전체 글자 수</span>
              <strong>{isLoading ? '-' : totalCharCount.toLocaleString()}</strong>
            </div>
          </div>
          <p className="home-card__empty-message">
            오늘 기록은 현재 글 목록 API 기준으로 계산합니다. 연속 작성일과 목표 달성률은 전용 API 연결 후 표시합니다.
          </p>
        </section>

        <section className="home-card home-recent" aria-labelledby="recent-writing-title">
          <header className="home-card__header">
            <h2 id="recent-writing-title">최근 작성한 글</h2>
            <WriteActionButton />
          </header>

          {isLoading && (
            <div className="home-empty-state">
              <DescriptionOutlinedIcon aria-hidden="true" />
              <strong>최근 글을 불러오는 중입니다.</strong>
              <span>저장된 글 목록을 확인하고 있습니다.</span>
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="home-empty-state">
              <ErrorOutlineRoundedIcon aria-hidden="true" />
              <strong>{errorMessage}</strong>
              <span>잠시 후 다시 시도해 주세요.</span>
            </div>
          )}

          {!isLoading && !errorMessage && recentDocuments.length === 0 && (
            <div className="home-empty-state">
              <DescriptionOutlinedIcon aria-hidden="true" />
              <strong>아직 작성한 글이 없습니다.</strong>
              <span>작성한 글은 최근 수정 순서로 표시됩니다.</span>
            </div>
          )}

          {!isLoading && !errorMessage && recentDocuments.length > 0 && (
            <div className="home-document-list">
              {recentDocuments.map((document) => (
                <button
                  key={document.id}
                  className="home-document-card"
                  type="button"
                  onClick={() => navigate(`/writings/${document.id}`)}
                >
                  <strong>{document.title || '제목 없음'}</strong>
                  <p>{getPreview(document)}</p>
                  <span>
                    최근 수정 {formatDateTime(document.updatedAt ?? document.createdAt)}
                    {' · '}
                    {Number(document.charCount ?? 0).toLocaleString()}자
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="home-card home-activity" aria-labelledby="recent-activity-title">
          <header className="home-card__header">
            <h2 id="recent-activity-title">최근 활동</h2>
          </header>

          {isLoading && (
            <div className="home-empty-state home-empty-state--side">
              <HistoryOutlinedIcon aria-hidden="true" />
              <strong>최근 활동을 불러오는 중입니다.</strong>
              <span>글 작성/수정 기록을 확인하고 있습니다.</span>
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="home-empty-state home-empty-state--side">
              <ErrorOutlineRoundedIcon aria-hidden="true" />
              <strong>최근 활동을 표시하지 못했습니다.</strong>
              <span>{errorMessage}</span>
            </div>
          )}

          {!isLoading && !errorMessage && recentActivities.length === 0 && (
            <div className="home-empty-state home-empty-state--side">
              <HistoryOutlinedIcon aria-hidden="true" />
              <strong>최근 활동이 없습니다.</strong>
              <span>글과 폴더를 관리한 기록이 표시됩니다.</span>
            </div>
          )}

          {!isLoading && !errorMessage && recentActivities.length > 0 && (
            <div className="home-activity-list">
              {recentActivities.map((document) => (
                <button
                  key={`${document.id}-${document.updatedAt}`}
                  className="home-activity-item"
                  type="button"
                  onClick={() => navigate(`/writings/${document.id}`)}
                >
                  <span aria-hidden="true">
                    <HistoryOutlinedIcon />
                  </span>
                  <div>
                    <strong>{buildActivityLabel(document)}</strong>
                    <p>{document.title || '제목 없음'}</p>
                    <small>{formatDateTime(document.updatedAt ?? document.createdAt)}</small>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="home-card home-folders" aria-labelledby="folder-summary-title">
          <header className="home-card__header">
            <h2 id="folder-summary-title">내 폴더</h2>
            <button className="home-card__more" type="button" onClick={() => navigate('/folders')}>
              <span>전체 보기</span>
              <ChevronRightRoundedIcon />
            </button>
          </header>
          <div className="home-folder-empty">
            <div className="home-folder-empty__icon" aria-hidden="true">
              <FolderOutlinedIcon />
            </div>
            <div>
              <strong>폴더 API 연결 대기 중입니다.</strong>
              <span>폴더 목록 API가 연결되면 이곳에서 자주 쓰는 폴더를 빠르게 확인할 수 있습니다.</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
