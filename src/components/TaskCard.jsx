import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { tagColor } from "../utils/tags";
import { useI18n } from "../useI18n";

function formatDueDate(value, locale) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(locale, { day: "2-digit", month: "short" });
}

export default function TaskCard({ card, onClick, dragging = false }) {
  const { t } = useI18n();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id, data: { type: "card" } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const PRIORITY_LABELS = { low: t("priorityLow"), medium: t("priorityMedium"), high: t("priorityHigh") };
  const due = formatDueDate(card.dueDate, t("dateLocale"));
  const overdue =
    card.dueDate && new Date(card.dueDate) < new Date(new Date().toDateString());

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`kb-card${dragging ? " kb-card-overlay" : ""}`}
      onClick={() => onClick?.(card)}
    >
      {card.tags?.length > 0 && (
        <div className="kb-card-tags">
          {card.tags.map((tag) => (
            <span
              key={tag}
              className="kb-tag"
              style={{ background: `${tagColor(tag)}26`, color: tagColor(tag) }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <p className="kb-card-title">{card.title}</p>
      {card.description && (
        <p className="kb-card-desc">{card.description}</p>
      )}
      <div className="kb-card-footer">
        <span className={`kb-priority kb-priority-${card.priority}`}>
          {PRIORITY_LABELS[card.priority]}
        </span>
        {due && (
          <span className={`kb-due${overdue ? " kb-due-overdue" : ""}`}>{due}</span>
        )}
      </div>
    </div>
  );
}