import { createContext, useContext, useEffect, useReducer } from "react";

const STORAGE_KEY = "kanban.boards.v1";

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function seedData() {
  const now = Date.now();
  return {
    activeBoardId: "board-demo",
    boards: [
      {
        id: "board-demo",
        name: "Refonte site vitrine",
        createdAt: now,
        columns: [
          {
            id: "col-todo",
            title: "À faire",
            cards: [
              {
                id: uid(),
                title: "Cahier des charges client",
                description: "Lister les pages, le contenu et les fonctionnalités attendues avant devis.",
                priority: "high",
                tags: ["Cadrage"],
                dueDate: null,
              },
              {
                id: uid(),
                title: "Maquettes Figma",
                description: "Version desktop et mobile pour la page d'accueil et la page contact.",
                priority: "medium",
                tags: ["Design"],
                dueDate: null,
              },
            ],
          },
          {
            id: "col-doing",
            title: "En cours",
            cards: [
              {
                id: uid(),
                title: "Intégration Hero + Navbar",
                description: "Responsive mobile-first, tester à 375/768/1440px.",
                priority: "high",
                tags: ["Dev"],
                dueDate: null,
              },
            ],
          },
          {
            id: "col-review",
            title: "En relecture",
            cards: [
              {
                id: uid(),
                title: "Formulaire de contact",
                description: "Vérifier la validation des champs et l'envoi d'email.",
                priority: "medium",
                tags: ["Dev", "QA"],
                dueDate: null,
              },
            ],
          },
          {
            id: "col-done",
            title: "Terminé",
            cards: [
              {
                id: uid(),
                title: "Choix du nom de domaine",
                description: "Domaine réservé et DNS configuré.",
                priority: "low",
                tags: ["Admin"],
                dueDate: null,
              },
            ],
          },
        ],
      },
    ],
  };
}

function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedData();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.boards) || parsed.boards.length === 0) {
      return seedData();
    }
    return parsed;
  } catch {
    return seedData();
  }
}

function reducer(state, action) {
  switch (action.type) {
    case "ADD_BOARD": {
      const board = {
        id: uid(),
        name: action.name,
        createdAt: Date.now(),
        columns: [
          { id: uid(), title: "À faire", cards: [] },
          { id: uid(), title: "En cours", cards: [] },
          { id: uid(), title: "Terminé", cards: [] },
        ],
      };
      return {
        ...state,
        boards: [...state.boards, board],
        activeBoardId: board.id,
      };
    }
    case "DELETE_BOARD": {
      const boards = state.boards.filter((b) => b.id !== action.boardId);
      const activeBoardId =
        state.activeBoardId === action.boardId
          ? boards[0]?.id ?? null
          : state.activeBoardId;
      return { ...state, boards, activeBoardId };
    }
    case "RENAME_BOARD": {
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === action.boardId ? { ...b, name: action.name } : b
        ),
      };
    }
    case "SET_ACTIVE_BOARD":
      return { ...state, activeBoardId: action.boardId };
    case "ADD_COLUMN": {
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === action.boardId
            ? {
                ...b,
                columns: [
                  ...b.columns,
                  { id: uid(), title: action.title, cards: [] },
                ],
              }
            : b
        ),
      };
    }
    case "RENAME_COLUMN": {
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === action.boardId
            ? {
                ...b,
                columns: b.columns.map((c) =>
                  c.id === action.columnId ? { ...c, title: action.title } : c
                ),
              }
            : b
        ),
      };
    }
    case "DELETE_COLUMN": {
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === action.boardId
            ? { ...b, columns: b.columns.filter((c) => c.id !== action.columnId) }
            : b
        ),
      };
    }
    case "ADD_CARD": {
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === action.boardId
            ? {
                ...b,
                columns: b.columns.map((c) =>
                  c.id === action.columnId
                    ? { ...c, cards: [...c.cards, action.card] }
                    : c
                ),
              }
            : b
        ),
      };
    }
    case "UPDATE_CARD": {
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === action.boardId
            ? {
                ...b,
                columns: b.columns.map((c) => ({
                  ...c,
                  cards: c.cards.map((card) =>
                    card.id === action.card.id ? action.card : card
                  ),
                })),
              }
            : b
        ),
      };
    }
    case "DELETE_CARD": {
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === action.boardId
            ? {
                ...b,
                columns: b.columns.map((c) => ({
                  ...c,
                  cards: c.cards.filter((card) => card.id !== action.cardId),
                })),
              }
            : b
        ),
      };
    }
    case "MOVE_CARD": {
      const { boardId, cardId, fromColumnId, toColumnId, toIndex } = action;
      return {
        ...state,
        boards: state.boards.map((b) => {
          if (b.id !== boardId) return b;
          const fromCol = b.columns.find((c) => c.id === fromColumnId);
          const movedCard = fromCol?.cards.find((c) => c.id === cardId);
          if (!movedCard) return b;
          return {
            ...b,
            columns: b.columns.map((c) => {
              if (c.id === fromColumnId && c.id === toColumnId) {
                const withoutCard = c.cards.filter((card) => card.id !== cardId);
                const clampedIndex = Math.max(0, Math.min(toIndex, withoutCard.length));
                const next = [...withoutCard];
                next.splice(clampedIndex, 0, movedCard);
                return { ...c, cards: next };
              }
              if (c.id === fromColumnId) {
                return { ...c, cards: c.cards.filter((card) => card.id !== cardId) };
              }
              if (c.id === toColumnId) {
                const next = [...c.cards];
                const clampedIndex = Math.max(0, Math.min(toIndex, next.length));
                next.splice(clampedIndex, 0, movedCard);
                return { ...c, cards: next };
              }
              return c;
            }),
          };
        }),
      };
    }
    default:
      return state;
  }
}

const BoardsStateContext = createContext(null);
const BoardsDispatchContext = createContext(null);

export function BoardsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <BoardsStateContext.Provider value={state}>
      <BoardsDispatchContext.Provider value={dispatch}>
        {children}
      </BoardsDispatchContext.Provider>
    </BoardsStateContext.Provider>
  );
}

export function useBoardsState() {
  const ctx = useContext(BoardsStateContext);
  if (!ctx) throw new Error("useBoardsState must be used within BoardsProvider");
  return ctx;
}

export function useBoardsDispatch() {
  const ctx = useContext(BoardsDispatchContext);
  if (!ctx) throw new Error("useBoardsDispatch must be used within BoardsProvider");
  return ctx;
}

export { uid };