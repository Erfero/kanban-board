import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import Column from "./Column";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import { uid } from "../context/BoardsContext";
import { useI18n } from "../useI18n";

function findColumnOfCard(columns, cardId) {
  return columns.find((c) => c.cards.some((card) => card.id === cardId));
}

export default function Board({ board, dispatch }) {
  const { t } = useI18n();
  const [activeCard, setActiveCard] = useState(null);
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

  function handleDragStart(event) {
    const card = cardsById.get(event.active.id);
    setActiveCard(card || null);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) return;

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
      },
    });
  }

  function handleSaveCard(card) {
    dispatch({ type: "UPDATE_CARD", boardId: board.id, card });
  }

  function handleDeleteCard(cardId) {
    dispatch({ type: "DELETE_CARD", boardId: board.id, cardId });
  }

  function handleRenameColumn(columnId, title) {
    dispatch({ type: "RENAME_COLUMN", boardId: board.id, columnId, title });
  }

  function handleDeleteColumn(columnId) {
    dispatch({ type: "DELETE_COLUMN", boardId: board.id, columnId });
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
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
            />
          ))}

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
        </div>

        <DragOverlay>
          {activeCard ? <TaskCard card={activeCard} dragging /> : null}
        </DragOverlay>
      </DndContext>

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