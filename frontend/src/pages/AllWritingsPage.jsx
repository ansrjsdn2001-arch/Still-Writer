import { useState } from "react";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import WriteActionButton from "../components/common/WriteActionButton";
import "../styles/writings.css";

const tabs = [
  { id: "all", label: "전체 글" },
  { id: "recent", label: "최근 작성" },
  { id: "folders", label: "폴더" },
];
const writings = [];

/**
 * 사용자가 작성한 모든 글을 검색하고 정렬하는 페이지입니다.
 * API 연결 전에는 가짜 글을 만들지 않고 빈 목록 상태를 보여줍니다.
 */
export default function AllWritingsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("updated-desc");
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("ko-KR");
  const visibleWritings = normalizedQuery
    ? writings.filter((writing) =>
        [writing.title, writing.content, writing.folderName]
          .filter(Boolean)
          .some((value) => value.toLocaleLowerCase("ko-KR").includes(normalizedQuery)),
      )
    : writings;

  const emptyTitle = searchQuery.trim()
    ? "검색 결과가 없습니다."
    : "아직 작성한 글이 없습니다.";
  const emptyDescription = searchQuery.trim()
    ? "다른 검색어를 입력해 보세요."
    : "글이 등록되면 최근 수정 순서로 이곳에 표시됩니다.";

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
            className={activeTab === tab.id ? "is-active" : ""}
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
            placeholder="글 제목, 내용, 폴더 검색"
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
        {visibleWritings.length === 0 && (
          <div className="writings-empty">
            <span className="writings-empty__icon" aria-hidden="true">
              <DescriptionOutlinedIcon />
            </span>
            <strong>{emptyTitle}</strong>
            <p>{emptyDescription}</p>
          </div>
        )}
      </section>
    </div>
  );
}
