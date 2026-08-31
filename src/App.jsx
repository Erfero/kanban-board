import { useState } from "react";
import { BoardsProvider, useBoardsState, useBoardsDispatch } from "./context/BoardsContext";
import { ThemeProvider } from "./useTheme";
import { LangProvider, useI18n } from "./useI18n";
import Sidebar from "./components/Sidebar";
import Board from "./components/Board";
import "./App.css";

function AppShell() {
  const state = useBoardsState();
  const dispatch = useBoardsDispatch();
  const { t } = useI18n();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

  const activeBoard = state.boards.find((b) => b.id === state.activeBoardId) || state.boards[0];

  function handleCreateBoard(name) {
    dispatch({ type: "ADD_BOARD", name });
  }

  function handleDeleteBoard(boardId) {
    if (window.confirm(t("confirmDeleteBoard"))) {
      dispatch({ type: "DELETE_BOARD", boardId });
    }
  }

  function startRename() {
    setNameDraft(activeBoard.name);
    setRenaming(true);
  }

  function commitRename() {
    setRenaming(false);
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== activeBoard.name) {
      dispatch({ type: "RENAME_BOARD", boardId: activeBoard.id, name: trimmed });
    }
  }

  if (!activeBoard) {
    return (
      <div className="kb-empty-state">
        <p>{t("emptyBoardMessage")}</p>
      </div>
    );
  }

  return (
    <div className="kb-app">
      <Sidebar
        boards={state.boards}
        activeBoardId={activeBoard.id}
        onSelect={(id) => {
          dispatch({ type: "SET_ACTIVE_BOARD", boardId: id });
          setMobileOpen(false);
        }}
        onCreate={handleCreateBoard}
        onDelete={handleDeleteBoard}
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
      />
      {mobileOpen && <div className="kb-sidebar-backdrop" onClick={() => setMobileOpen(false)} />}
      <main className="kb-main">
        <header className="kb-topbar">
          <button
            type="button"
            className="kb-mobile-menu-btn"
            aria-label="menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            ☰
          </button>
          {renaming ? (
            <input
              autoFocus
              className="kb-board-title-input"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") setRenaming(false);
              }}
            />
          ) : (
            <h1 className="kb-board-title" onClick={startRename}>
              {activeBoard.name}
            </h1>
          )}
          <span className="kb-topbar-meta">
            {activeBoard.columns.reduce((sum, c) => sum + c.cards.length, 0)} {t("cardsCountSuffix")}
          </span>
        </header>
        <Board board={activeBoard} dispatch={dispatch} />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <BoardsProvider>
          <AppShell />
        </BoardsProvider>
      </LangProvider>
    </ThemeProvider>
  );
}