import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import TrackChangesOutlinedIcon from "@mui/icons-material/TrackChangesOutlined";
import WriteActionButton from "../components/common/WriteActionButton";
import "../styles/home.css";

/**
 * 데스크탑 시안의 메인 콘텐츠 배치만 구현한 화면입니다.
 * API 연동 전이므로 글, 폴더, 통계에는 더미데이터 대신 빈 상태를 표시합니다.
 */
export default function HomePage({ currentUser }) {
  const nickname = currentUser?.nickname?.trim();

  return (
    <div className="home-page">
      <div className="home-layout">
        <section
          className="home-hero"
          aria-labelledby="home-title"
          style={{
            "--home-hero-image-light": 'url("/images/heroimage(light).png")',
            "--home-hero-image-dark": 'url("/images/heroimage(dark).png")',
          }}
        >
          <div className="home-hero__content">
            <h1 id="home-title">
              {nickname ? `안녕하세요, ${nickname}님` : "안녕하세요"}
              <span aria-hidden="true">👋</span>
            </h1>
            <p>오늘도 좋은 글을 써보세요.</p>
          </div>
        </section>

        <section
          className="home-card home-record"
          aria-labelledby="today-record-title"
        >
          <header className="home-card__header">
            <h2 id="today-record-title">오늘의 기록</h2>
          </header>
          <div className="home-record__grid">
            <div className="home-record__item">
              <DescriptionOutlinedIcon aria-hidden="true" />
              <span>작성 글자 수</span>
              <strong aria-label="기록 없음">-</strong>
            </div>
            <div className="home-record__item">
              <CalendarMonthOutlinedIcon aria-hidden="true" />
              <span>연속 작성일</span>
              <strong aria-label="기록 없음">-</strong>
            </div>
            <div className="home-record__item">
              <TrackChangesOutlinedIcon aria-hidden="true" />
              <span>목표 달성률</span>
              <strong aria-label="기록 없음">-</strong>
            </div>
          </div>
          <p className="home-card__empty-message">
            글을 작성하면 실제 기록을 확인할 수 있습니다.
          </p>
        </section>

        <section
          className="home-card home-recent"
          aria-labelledby="recent-writing-title"
        >
          <header className="home-card__header">
            <h2 id="recent-writing-title">최근 작성한 글</h2>
            <WriteActionButton />
          </header>
          <div className="home-empty-state">
            <DescriptionOutlinedIcon aria-hidden="true" />
            <strong>아직 작성한 글이 없습니다.</strong>
            <span>작성한 글은 최근 수정 순서로 표시됩니다.</span>
          </div>
        </section>

        <section
          className="home-card home-activity"
          aria-labelledby="recent-activity-title"
        >
          <header className="home-card__header">
            <h2 id="recent-activity-title">최근 활동</h2>
          </header>
          <div className="home-empty-state home-empty-state--side">
            <HistoryOutlinedIcon aria-hidden="true" />
            <strong>최근 활동이 없습니다.</strong>
            <span>글과 폴더를 관리한 기록이 표시됩니다.</span>
          </div>
        </section>

        <section
          className="home-card home-folders"
          aria-labelledby="folder-summary-title"
        >
          <header className="home-card__header">
            <h2 id="folder-summary-title">내 폴더</h2>
            <button className="home-card__more" type="button">
              <span>전체 보기</span>
              <ChevronRightRoundedIcon />
            </button>
          </header>
          <div className="home-folder-empty">
            <div className="home-folder-empty__icon" aria-hidden="true">
              <FolderOutlinedIcon />
            </div>
            <div>
              <strong>생성된 폴더가 없습니다.</strong>
              <span>폴더를 생성하면 이곳에서 빠르게 확인할 수 있습니다.</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
