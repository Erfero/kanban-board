import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { tagColor } from "../utils/tags";
import { useI18n } from "../useI18n";
import { CheckSquareIcon } from "../icons";

function formatDueDate(value, locale) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(locale, { day: "2-digit", month: "short" });
}

export default function TaskCard({ card, onClick, dragging = false, dragDisabled = false }) {
  const { t } = useI18n();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "card" },
    disabled: dragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const PRIORITY_LABELS = { low: t("priorityLow"), medium: t("priorityMedium"), high: t("priorityHigh") };
  const due = formatDueDate(card.dueDate, t("dateLocale"));
  const overdue =
    card.dueDate && new Date(card.dueDate) < new Date(new Date().toDateString());
  const checklistDone = card.checklist?.filter((i) => i.done).length ?? 0;
  const checklistTotal = card.checklist?.length ?? 0;

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
        {checklistTotal > 0 && (
          <span className={`kb-checklist-badge${checklistDone === checklistTotal ? " kb-checklist-done" : ""}`}>
            <CheckSquareIcon size={11} /> {checklistDone}/{checklistTotal}
          </span>
        )}
        {due && (
          <span className={`kb-due${overdue ? " kb-due-overdue" : ""}`}>{due}</span>
        )}
      </div>
    </div>
  );
}
