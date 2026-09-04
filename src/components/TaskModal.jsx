import { useEffect, useState } from "react";
import { tagColor } from "../utils/tags";
import { useI18n } from "../useI18n";
import { uid } from "../context/BoardsContext";
import { TrashIcon, CloseIcon, PlusIcon } from "../icons";

export default function TaskModal({ card, onClose, onSave, onDelete }) {
  const { t } = useI18n();
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [priority, setPriority] = useState(card.priority || "medium");
  const [dueDate, setDueDate] = useState(card.dueDate || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState(card.tags || []);
  const [checklist, setChecklist] = useState(card.checklist || []);
  const [checklistInput, setChecklistInput] = useState("");

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function addTag() {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput("");
  }

  function removeTag(tag) {
    setTags(tags.filter((t) => t !== tag));
  }

  function addChecklistItem() {
    const trimmed = checklistInput.trim();
    if (trimmed) {
      setChecklist([...checklist, { id: uid(), text: trimmed, done: false }]);
    }
    setChecklistInput("");
  }

  function toggleChecklistItem(id) {
    setChecklist(checklist.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  }

  function removeChecklistItem(id) {
    setChecklist(checklist.filter((item) => item.id !== id));
  }

  const checklistDone = checklist.filter((i) => i.done).length;

  function handleSave() {
    onSave({
      ...card,
      title: title.trim() || card.title,
      description: description.trim(),
      priority,
      dueDate: dueDate || null,
      tags,
      checklist,
    });
    onClose();
  }

  return (
    <div className="kb-modal-overlay" onMouseDown={onClose}>
      <div className="kb-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="kb-modal-header">
          <input
            className="kb-modal-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button className="kb-modal-close" onClick={onClose}>
            <CloseIcon size={17} />
          </button>
        </div>

        <div className="kb-modal-body">
          <label className="kb-field-label">{t("modalDescription")}</label>
          <textarea
            className="kb-field-textarea"
            rows={4}
            placeholder={t("modalDescPlaceholder")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="kb-modal-row">
            <div>
              <label className="kb-field-label">{t("modalPriority")}</label>
              <select
                className="kb-field-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">{t("priorityLow")}</option>
                <option value="medium">{t("priorityMedium")}</option>
                <option value="high">{t("priorityHigh")}</option>
              </select>
            </div>
            <div>
              <label className="kb-field-label">{t("modalDueDate")}</label>
              <input
                type="date"
                className="kb-field-select"
                value={dueDate || ""}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <label className="kb-field-label">{t("modalTags")}</label>
          <div className="kb-tag-editor">
            {tags.map((tag) => (
              <span
                key={tag}
                className="kb-tag kb-tag-removable"
                style={{ background: `${tagColor(tag)}26`, color: tagColor(tag) }}
              >
                {tag}
                <button onClick={() => removeTag(tag)}>
                  <CloseIcon size={10} />
                </button>
              </span>
            ))}
            <input
              className="kb-tag-input"
              placeholder={t("tagInputPlaceholder")}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
          </div>

          <label className="kb-field-label">
            {t("checklistLabel")}
            {checklist.length > 0 && (
              <span className="kb-checklist-progress-label"> {checklistDone}/{checklist.length}</span>
            )}
          </label>
          {checklist.length > 0 && (
            <div className="kb-checklist-bar">
              <div
                className="kb-checklist-bar-fill"
                style={{ width: `${(checklistDone / checklist.length) * 100}%` }}
              />
            </div>
          )}
          <div className="kb-checklist-items">
            {checklist.map((item) => (
              <label key={item.id} className="kb-checklist-item">
                <input type="checkbox" checked={item.done} onChange={() => toggleChecklistItem(item.id)} />
                <span className={item.done ? "kb-checklist-item-done" : ""}>{item.text}</span>
                <button
                  type="button"
                  className="kb-checklist-item-remove"
                  onClick={() => removeChecklistItem(item.id)}
                  aria-label="remove"
                >
                  <CloseIcon size={11} />
                </button>
              </label>
            ))}
          </div>
          <div className="kb-checklist-add">
            <input
              className="kb-tag-input kb-checklist-input"
              placeholder={t("checklistPlaceholder")}
              value={checklistInput}
              onChange={(e) => setChecklistInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addChecklistItem();
                }
              }}
            />
            <button type="button" className="kb-checklist-add-btn" onClick={addChecklistItem} aria-label="add">
              <PlusIcon size={14} />
            </button>
          </div>
        </div>

        <div className="kb-modal-footer">
          <button
            className="kb-btn kb-btn-danger"
            onClick={() => {
              onDelete(card.id);
              onClose();
            }}
          >
            <TrashIcon size={13} /> {t("deleteCardBtn")}
          </button>
          <button className="kb-btn kb-btn-accent" onClick={handleSave}>
            {t("saveBtn")}
          </button>
        </div>
      </div>
    </div>
  );
}
