import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskCard from "./TaskCard";
import { useI18n } from "../useI18n";
import { GripIcon, CloseIcon } from "../icons";

export default function Column({ column, onOpenCard, onAddCard, onRename, onDelete, dragDisabled }) {
  const { t } = useI18n();
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({ id: column.id, data: { type: "column-body" } });
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `col-${column.id}`, data: { type: "column", columnId: column.id }, disabled: dragDisabled });
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  function commitRename() {
    setEditing(false);
    const trimmed = title.trim();
    if (trimmed && trimmed !== column.title) {
      onRename(column.id, trimmed);
    } else {
      setTitle(column.title);
    }
  }

  function commitNewCard() {
    const trimmed = newTitle.trim();
    if (trimmed) {
      onAddCard(column.id, trimmed);
    }
    setNewTitle("");
    setAdding(false);
  }

  return (
    <div ref={setSortableRef} style={style} className={`kb-column${isDragging ? " kb-column-dragging" : ""}`}>
      <div className="kb-column-header">
        {!dragDisabled && (
          <button className="kb-column-grip" title={t("dragColumnTitle")} {...attributes} {...listeners}>
            <GripIcon size={13} />
          </button>
        )}
        {editing ? (
          <input
            autoFocus
            className="kb-column-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") {
                setTitle(column.title);
                setEditing(false);
              }
            }}
          />
        ) : (
          <button className="kb-column-title" onClick={() => setEditing(true)}>
            {column.title}
          </button>
        )}
        <span className="kb-column-count">{column.cards.length}</span>
        <button
          className="kb-column-delete"
          title={t("deleteColumnTitle")}
          onClick={() => onDelete(column.id)}
        >
          <CloseIcon size={13} />
        </button>
      </div>

      <div
        ref={setDroppableRef}
        className={`kb-column-body${isOver ? " kb-column-body-over" : ""}`}
      >
        <SortableContext
          items={column.cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.cards.map((card) => (
            <TaskCard key={card.id} card={card} onClick={onOpenCard} dragDisabled={dragDisabled} />
          ))}
        </SortableContext>
        {column.cards.length === 0 && (
          <div className="kb-column-empty">{t("noCards")}</div>
        )}
      </div>

      {adding ? (
        <div className="kb-add-card-form">
          <textarea
            autoFocus
            placeholder={t("addCardPlaceholder")}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                commitNewCard();
              }
              if (e.key === "Escape") {
                setNewTitle("");
                setAdding(false);
              }
            }}
          />
          <div className="kb-add-card-actions">
            <button className="kb-btn kb-btn-accent" onClick={commitNewCard}>
              {t("addBtn")}
            </button>
            <button
              className="kb-btn kb-btn-ghost"
              onClick={() => {
                setNewTitle("");
                setAdding(false);
              }}
            >
              {t("cancelBtn")}
            </button>
          </div>
        </div>
      ) : (
        <button className="kb-add-card-trigger" onClick={() => setAdding(true)}>
          {t("addCardTrigger")}
        </button>
      )}
    </div>
  );
}
