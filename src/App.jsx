import { useMemo, useRef, useState } from "react";
import { BoardsProvider, useBoardsState, useBoardsDispatch } from "./context/BoardsContext";
import { ThemeProvider } from "./useTheme";
import { LangProvider, useI18n } from "./useI18n";
import Sidebar from "./components/Sidebar";
import Board from "./components/Board";
import Toast from "./components/Toast";
import { SearchIcon, MenuIcon, CloseIcon, ClipboardIcon } from "./icons";
import "./App.css";

const TOAST_DURATION = 5500;

function AppShell() {
  const state = useBoardsState();
  const dispatch = useBoardsDispatch();
  const { t } = useI18n();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const activeBoard = state.boards.find((b) => b.id === state.activeBoardId) || state.boards[0];

  function dispatchWithUndo(action, message) {
    const prevState = state;
    dispatch(action);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, prevState });
    toastTimerRef.current = setTimeout(() => setToast(null), TOAST_DURATION);
  }

  function undoLast() {
    if (toast) dispatch({ type: "SET_STATE", state: toast.prevState });
    setToast(null);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }

  function handleCreateBoard(name) {
    dispatch({ type: "ADD_BOARD", name });
  }

  function handleDeleteBoard(boardId) {
    const board = state.boards.find((b) => b.id === boardId);
    dispatchWithUndo({ type: "DELETE_BOARD", boardId }, t("boardDeletedToast", { name: board?.name ?? "" }));
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify({ boards: state.boards }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kanban-boards.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleImport(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const boards = Array.isArray(parsed) ? parsed : parsed.boards;
        if (!Array.isArray(boards) || boards.length === 0) throw new Error("invalid");
        dispatch({ type: "IMPORT_BOARDS", boards, importLabel: t("importSuffix") });
      } catch {
        window.alert(t("importError"));
      }
    };
    reader.readAsText(file);
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

  const filteredBoard = useMemo(() => {
    if (!activeBoard) return activeBoard;
    const q = search.trim().toLowerCase();
    if (!q && priorityFilter === "all") return activeBoard;
    return {
      ...activeBoard,
      columns: activeBoard.columns.map((col) => ({
        ...col,
        cards: col.cards.filter((card) => {
          const matchesQuery =
            !q ||
            card.title.toLowerCase().includes(q) ||
            card.description?.toLowerCase().includes(q) ||
            card.tags?.some((tag) => tag.toLowerCase().includes(q));
          const matchesPriority = priorityFilter === "all" || card.priority === priorityFilter;
          return matchesQuery && matchesPriority;
        }),
      })),
    };
  }, [activeBoard, search, priorityFilter]);

  const isFiltering = search.trim() !== "" || priorityFilter !== "all";

  if (!activeBoard) {
    return (
      <div className="kb-empty-state">
        <ClipboardIcon size={40} />
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
        onExport={handleExport}
        onImport={handleImport}
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
            <MenuIcon size={16} />
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
          <div className="kb-topbar-search">
            <SearchIcon size={14} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
            />
            {search && (
              <button className="kb-search-clear" onClick={() => setSearch("")} aria-label="clear">
                <CloseIcon size={12} />
              </button>
            )}
          </div>
          <select
            className="kb-priority-filter"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">{t("filterAllPriorities")}</option>
            <option value="low">{t("priorityLow")}</option>
            <option value="medium">{t("priorityMedium")}</option>
            <option value="high">{t("priorityHigh")}</option>
          </select>
        </header>
        <Board
          board={filteredBoard}
          dispatch={dispatch}
          dispatchWithUndo={dispatchWithUndo}
          isFiltering={isFiltering}
        />
      </main>
      <Toast message={toast?.message} onUndo={undoLast} />
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
