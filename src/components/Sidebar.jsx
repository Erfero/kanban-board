import { useState } from "react";
import { useTheme } from "../useTheme";
import { useI18n } from "../useI18n";

export default function Sidebar({ boards, activeBoardId, onSelect, onCreate, onDelete, collapsed, onToggle, mobileOpen }) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const { theme, toggleTheme } = useTheme();
  const { t, lang, toggleLang } = useI18n();

  function commitCreate() {
    const trimmed = name.trim();
    if (trimmed) onCreate(trimmed);
    setName("");
    setCreating(false);
  }

  return (
    <aside className={`kb-sidebar${collapsed ? " kb-sidebar-collapsed" : ""}${mobileOpen ? " kb-sidebar-mobile-open" : ""}`}>
      <div className="kb-sidebar-header">
        <a href="/" className="kb-brand">
          <span className="kb-brand-mark">{"</>"}</span>
          {!collapsed && <span>Kanban</span>}
        </a>
        <button
          className="kb-sidebar-toggle"
          onClick={onToggle}
          title={collapsed ? t("expandTitle") : t("collapseTitle")}
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>

      {!collapsed && <p className="kb-sidebar-label">{t("sidebarBoards")}</p>}

      <div className="kb-board-list">
        {boards.map((board) => (
          <div key={board.id} className="kb-board-item-wrap">
            <button
              className={`kb-board-item${board.id === activeBoardId ? " kb-board-item-active" : ""}`}
              onClick={() => onSelect(board.id)}
              title={board.name}
            >
              <span className="kb-board-dot" />
              {!collapsed && <span className="kb-board-name">{board.name}</span>}
            </button>
            {!collapsed && boards.length > 1 && (
              <button
                className="kb-board-delete"
                title={t("deleteBoardTitle")}
                onClick={() => onDelete(board.id)}
              >
                &times;
              </button>
            )}
          </div>
        ))}
      </div>

      {!collapsed && (
        creating ? (
          <div className="kb-new-board-form">
            <input
              autoFocus
              placeholder={t("boardNamePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitCreate();
                if (e.key === "Escape") setCreating(false);
              }}
            />
            <button className="kb-btn kb-btn-accent" onClick={commitCreate}>
              {t("createBtn")}
            </button>
          </div>
        ) : (
          <button className="kb-new-board-trigger" onClick={() => setCreating(true)}>
            {t("newBoard")}
          </button>
        )
      )}

      {!collapsed && (
        <div className="kb-sidebar-toggles">
          <button type="button" className="kb-icon-btn" onClick={toggleTheme} aria-label="theme">
            {theme === "dark" ? "☀" : "☾"}
          </button>
          <button type="button" className="kb-icon-btn" onClick={toggleLang} aria-label="lang">
            {lang === "fr" ? "EN" : "FR"}
          </button>
        </div>
      )}

      {!collapsed && (
        <div className="kb-sidebar-footer">
          <p>{t("footerTagline")}</p>
          <p className="kb-sidebar-footer-sub">{t("footerDataLocal")}</p>
        </div>
      )}
    </aside>
  );
}