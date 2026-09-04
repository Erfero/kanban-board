import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import Column from "./Column";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import { uid } from "../context/BoardsContext";
import { useI18n } from "../useI18n";

function findColumnOfCard(columns, cardId) {
  return columns.find((c) => c.cards.some((card) => card.id === cardId));
}

// When dragging a column, restrict collision candidates to other columns only —
// otherwise closestCorners can match a card inside a column (its rect corners can
// be numerically closer to the dragged column's corners than the column's own
// wrapper), silently breaking the reorder.
function collisionDetectionStrategy(args) {
  if (args.active.data.current?.type === "column") {
    const columnContainers = args.droppableContainers.filter(
      (container) => container.data.current?.type === "column"
    );
    return closestCorners({ ...args, droppableContainers: columnContainers });
  }
  return closestCorners(args);
}

export default function Board({ board, dispatch, dispatchWithUndo, isFiltering }) {
  const { t } = useI18n();
  const [activeCard, setActiveCard] = useState(null);
  const [activeColumn, setActiveColumn] = useState(null);
  const [openCard, setOpenCard] = useState(null);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const cardsById = useMemo(() => {
    const map = new Map();
    board.columns.forEach((col) => col.cards.forEach((card) => map.set(card.id, card)));
    return map;
  }, [board]);

  const columnsById = useMemo(() => {
    const map = new Map();
    board.columns.forEach((col) => map.set(col.id, col));
    return map;
  }, [board]);

  const totalVisibleCards = board.columns.reduce((sum, c) => sum + c.cards.length, 0);

  function handleDragStart(event) {
    const { active } = event;
    if (active.data.current?.type === "column") {
      setActiveColumn(columnsById.get(active.data.current.columnId) || null);
      return;
    }
    const card = cardsById.get(active.id);
    setActiveCard(card || null);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveCard(null);
    setActiveColumn(null);
    if (!over) return;

    if (active.data.current?.type === "column") {
      const activeColumnId = active.data.current.columnId;
      const overColumnId = over.data.current?.type === "column" ? over.data.current.columnId : over.id;
      if (!overColumnId || overColumnId === activeColumnId) return;
      const fromIndex = board.columns.findIndex((c) => c.id === activeColumnId);
      const toIndex = board.columns.findIndex((c) => c.id === overColumnId);
      if (fromIndex === -1 || toIndex === -1) return;
      dispatch({ type: "REORDER_COLUMNS", boardId: board.id, fromIndex, toIndex });
      return;
    }

    const fromColumn = findColumnOfCard(board.columns, active.id);
    if (!fromColumn) return;

    const isOverColumn = board.columns.some((c) => c.id === over.id);
    let toColumnId;
    let toIndex;

    if (isOverColumn) {
      toColumnId = over.id;
      const toColumn = board.columns.find((c) => c.id === toColumnId);
      toIndex = toColumn.cards.length;
    } else {
      const toColumn = findColumnOfCard(board.columns, over.id);
      if (!toColumn) return;
      toColumnId = toColumn.id;
      toIndex = toColumn.cards.findIndex((c) => c.id === over.id);
    }

    if (fromColumn.id === toColumnId) {
      const currentIndex = fromColumn.cards.findIndex((c) => c.id === active.id);
      if (currentIndex === toIndex) return;
    }

    dispatch({
      type: "MOVE_CARD",
      boardId: board.id,
      cardId: active.id,
      fromColumnId: fromColumn.id,
      toColumnId,
      toIndex,
    });
  }

  function handleAddCard(columnId, title) {
    dispatch({
      type: "ADD_CARD",
      boardId: board.id,
      columnId,
      card: {
        id: uid(),
        title,
        description: "",
        priority: "medium",
        tags: [],
        dueDate: null,
        checklist: [],
      },
    });
  }

  function handleSaveCard(card) {
    dispatch({ type: "UPDATE_CARD", boardId: board.id, card });
  }

  function handleDeleteCard(cardId) {
    const card = cardsById.get(cardId);
    dispatchWithUndo(
      { type: "DELETE_CARD", boardId: board.id, cardId },
      t("cardDeletedToast", { name: card?.title ?? "" })
    );
  }

  function handleRenameColumn(columnId, title) {
    dispatch({ type: "RENAME_COLUMN", boardId: board.id, columnId, title });
  }

  function handleDeleteColumn(columnId) {
    const column = columnsById.get(columnId);
    dispatchWithUndo(
      { type: "DELETE_COLUMN", boardId: board.id, columnId },
      t("columnDeletedToast", { name: column?.title ?? "" })
    );
  }

  function commitNewColumn() {
    const trimmed = newColumnTitle.trim();
    if (trimmed) {
      dispatch({ type: "ADD_COLUMN", boardId: board.id, title: trimmed });
    }
    setNewColumnTitle("");
    setAddingColumn(false);
  }

  return (
    <div className="kb-board">
      {isFiltering && totalVisibleCards === 0 ? (
        <div className="kb-no-results">{t("noResults")}</div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetectionStrategy}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={board.columns.map((c) => `col-${c.id}`)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="kb-columns">
              {board.columns.map((column) => (
                <Column
                  key={column.id}
                  column={column}
                  onOpenCard={setOpenCard}
                  onAddCard={handleAddCard}
                  onRename={handleRenameColumn}
                  onDelete={handleDeleteColumn}
                  dragDisabled={isFiltering}
                />
              ))}

              {!isFiltering && (
                <div className="kb-column kb-column-new">
                  {addingColumn ? (
                    <div className="kb-add-card-form">
                      <input
                        autoFocus
                        placeholder={t("addColumnPlaceholder")}
                        value={newColumnTitle}
                        onChange={(e) => setNewColumnTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitNewColumn();
                          if (e.key === "Escape") setAddingColumn(false);
                        }}
                      />
                      <div className="kb-add-card-actions">
                        <button className="kb-btn kb-btn-accent" onClick={commitNewColumn}>
                          {t("addBtn")}
                        </button>
                        <button className="kb-btn kb-btn-ghost" onClick={() => setAddingColumn(false)}>
                          {t("cancelBtn")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button className="kb-add-column-trigger" onClick={() => setAddingColumn(true)}>
                      {t("addColumnTrigger")}
                    </button>
                  )}
                </div>
              )}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeCard ? <TaskCard card={activeCard} dragging /> : null}
            {activeColumn ? (
              <div className="kb-column kb-column-overlay">
                <div className="kb-column-header">
                  <span className="kb-column-title">{activeColumn.title}</span>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {openCard && (
        <TaskModal
          card={openCard}
          onClose={() => setOpenCard(null)}
          onSave={handleSaveCard}
          onDelete={handleDeleteCard}
        />
      )}
    </div>
  );
}
