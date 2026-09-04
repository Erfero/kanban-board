import { useI18n } from "../useI18n";

export default function Toast({ message, onUndo }) {
  const { t } = useI18n();
  if (!message) return null;
  return (
    <div className="kb-toast">
      <span>{message}</span>
      <button className="kb-toast-undo" onClick={onUndo}>
        {t("undoBtn")}
      </button>
    </div>
  );
}
