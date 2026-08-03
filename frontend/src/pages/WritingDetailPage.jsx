import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import TextFieldsRoundedIcon from '@mui/icons-material/TextFieldsRounded';
import { getDocument } from '../api/documents';
import { getApiErrorMessage } from '../api/client';
import '../styles/writings.css';

function formatDateTime(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getSafeDocumentHtml(contentHtml) {
  if (!contentHtml) return '';

  const parser = new DOMParser();
  const parsedDocument = parser.parseFromString(contentHtml, 'text/html');

  parsedDocument.querySelectorAll('script, style, iframe, object, embed').forEach((element) => element.remove());
  parsedDocument.body.querySelectorAll('*').forEach((element) => {
    [...element.attributes].forEach((attribute) => {
      const attributeName = attribute.name.toLowerCase();
      const attributeValue = attribute.value.trim().toLowerCase();

      if (attributeName.startsWith('on')) element.removeAttribute(attribute.name);
      if ((attributeName === 'href' || attributeName === 'src') && attributeValue.startsWith('javascript:')) {
        element.removeAttribute(attribute.name);
      }
    });
  });

  return parsedDocument.body.innerHTML;
}

function createPlainTextHtml(plainText) {
  return plainText
    .split('\n')
    .map((line) => `<p>${line.replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[char]) || '<br>'}</p>`)
    .join('');
}

/** 저장된 글을 편집하지 않고 읽기 전용으로 확인하는 상세 화면입니다. */
export default function WritingDetailPage() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadDocument() {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const response = await getDocument(documentId);
        if (!ignore) setDocument(response.data);
      } catch (error) {
        if (!ignore) setErrorMessage(getApiErrorMessage(error, '글을 불러오지 못했습니다.'));
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadDocument();

    return () => {
      ignore = true;
    };
  }, [documentId]);

  const contentHtml = useMemo(() => {
    if (!document) return '';
    const safeHtml = getSafeDocumentHtml(document.contentHtml);
    if (safeHtml.trim()) return safeHtml;
    return createPlainTextHtml(document.plainText ?? '');
  }, [document]);

  const handleEdit = () => {
    navigate(`/write?documentId=${encodeURIComponent(documentId ?? '')}`);
  };

  return (
    <div className="writing-detail-page">
      <button className="writing-detail-back" type="button" onClick={() => navigate('/writings')}>
        <ArrowBackRoundedIcon />
        <span>글 목록으로 돌아가기</span>
      </button>

      {isLoading && (
        <section className="writing-detail-state" aria-live="polite">
          <span aria-hidden="true"><DescriptionOutlinedIcon /></span>
          <strong>글을 불러오는 중입니다.</strong>
        </section>
      )}

      {!isLoading && errorMessage && (
        <section className="writing-detail-state" role="alert">
          <span aria-hidden="true"><ErrorOutlineRoundedIcon /></span>
          <strong>{errorMessage}</strong>
          <p>목록으로 돌아가거나 잠시 후 다시 시도해 주세요.</p>
        </section>
      )}

      {!isLoading && !errorMessage && document && (
        <article className="writing-detail-article">
          <header className="writing-detail-header">
            <div>
              <span className="writing-detail-kicker">읽기 모드</span>
              <h1>{document.title?.trim() || '제목 없음'}</h1>
              <dl>
                <div>
                  <dt>작성</dt>
                  <dd>{formatDateTime(document.createdAt)}</dd>
                </div>
                <div>
                  <dt>수정</dt>
                  <dd>{formatDateTime(document.updatedAt)}</dd>
                </div>
              </dl>
            </div>
            <button className="writing-detail-edit-button" type="button" onClick={handleEdit}>
              <EditOutlinedIcon />
              <span>수정하기</span>
            </button>
          </header>

          <section className="writing-detail-stats" aria-label="글 통계">
            <article>
              <TextFieldsRoundedIcon aria-hidden="true" />
              <span>공백 포함</span>
              <strong>{Number(document.charCount ?? 0).toLocaleString()}자</strong>
            </article>
            <article>
              <TextFieldsRoundedIcon aria-hidden="true" />
              <span>공백 제외</span>
              <strong>{Number(document.charCountWithoutSpaces ?? 0).toLocaleString()}자</strong>
            </article>
            <article>
              <ScheduleRoundedIcon aria-hidden="true" />
              <span>문장 수</span>
              <strong>{Number(document.sentenceCount ?? 0).toLocaleString()}개</strong>
            </article>
          </section>

          <section className="writing-detail-content" aria-label="글 본문">
            {contentHtml.trim() ? (
              <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
            ) : (
              <p className="writing-detail-content__empty">본문 내용이 없습니다.</p>
            )}
          </section>
        </article>
      )}
    </div>
  );
}
