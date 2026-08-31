import { useEffect, useState } from "react";
import { tagColor } from "../utils/tags";
import { useI18n } from "../useI18n";

export default function TaskModal({ card, onClose, onSave, onDelete }) {
  const { t } = useI18n();
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [priority, setPriority] = useState(card.priority || "medium");
  const [dueDate, setDueDate] = useState(card.dueDate || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState(card.tags || []);

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

  function handleSave() {
    onSave({
      ...card,
      title: title.trim() || card.title,
      description: description.trim(),
      priority,
      dueDate: dueDate || null,
      tags,
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
            &times;
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
                <button onClick={() => removeTag(tag)}>&times;</button>
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
        </div>

        <div className="kb-modal-footer">
          <button
            className="kb-btn kb-btn-danger"
            onClick={() => {
              onDelete(card.id);
              onClose();
            }}
          >
            {t("deleteCardBtn")}
          </button>
          <button className="kb-btn kb-btn-accent" onClick={handleSave}>
            {t("saveBtn")}
          </button>
        </div>
      </div>
    </div>
  );
}