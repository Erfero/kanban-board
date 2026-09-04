import { createContext, useContext, useEffect, useState } from "react";

const DICT = {
  fr: {
    sidebarBoards: "Mes tableaux",
    newBoard: "+ Nouveau tableau",
    createBtn: "Créer",
    boardNamePlaceholder: "Nom du tableau",
    collapseTitle: "Réduire",
    expandTitle: "Agrandir",
    deleteBoardTitle: "Supprimer ce tableau",
    footerTagline: "Projet personnel — Code4Life",
    footerDataLocal: "Données stockées localement",
    cardsCountSuffix: "cartes",
    emptyBoardMessage: "Aucun tableau. Crée-en un pour commencer.",
    addColumnPlaceholder: "Nom de la colonne",
    addBtn: "Ajouter",
    cancelBtn: "Annuler",
    addColumnTrigger: "+ Ajouter une colonne",
    deleteColumnTitle: "Supprimer la colonne",
    noCards: "Aucune carte",
    addCardPlaceholder: "Titre de la carte...",
    addCardTrigger: "+ Ajouter une carte",
    confirmDeleteBoard: "Supprimer ce tableau et toutes ses cartes ?",
    priorityLow: "Basse",
    priorityMedium: "Moyenne",
    priorityHigh: "Haute",
    modalDescription: "Description",
    modalDescPlaceholder: "Ajoute des détails sur cette tâche...",
    modalPriority: "Priorité",
    modalDueDate: "Échéance",
    modalTags: "Étiquettes",
    tagInputPlaceholder: "Nouvelle étiquette + Entrée",
    deleteCardBtn: "Supprimer la carte",
    saveBtn: "Enregistrer",
    dateLocale: "fr-FR",
    searchPlaceholder: "Rechercher une carte…",
    filterAllPriorities: "Toutes priorités",
    noResults: "Aucune carte ne correspond.",
    undoBtn: "Annuler",
    boardDeletedToast: "Tableau « {name} » supprimé.",
    columnDeletedToast: "Colonne « {name} » supprimée.",
    cardDeletedToast: "Carte « {name} » supprimée.",
    exportBtn: "Exporter",
    importBtn: "Importer",
    importSuffix: "importé",
    importError: "Fichier invalide, import annulé.",
    checklistLabel: "Sous-tâches",
    checklistPlaceholder: "Ajouter une sous-tâche + Entrée",
    dragColumnTitle: "Glisser pour réordonner",
  },
  en: {
    sidebarBoards: "My boards",
    newBoard: "+ New board",
    createBtn: "Create",
    boardNamePlaceholder: "Board name",
    collapseTitle: "Collapse",
    expandTitle: "Expand",
    deleteBoardTitle: "Delete this board",
    footerTagline: "Personal project — Code4Life",
    footerDataLocal: "Data stored locally",
    cardsCountSuffix: "cards",
    emptyBoardMessage: "No board yet. Create one to get started.",
    addColumnPlaceholder: "Column name",
    addBtn: "Add",
    cancelBtn: "Cancel",
    addColumnTrigger: "+ Add a column",
    deleteColumnTitle: "Delete column",
    noCards: "No cards",
    addCardPlaceholder: "Card title...",
    addCardTrigger: "+ Add a card",
    confirmDeleteBoard: "Delete this board and all its cards?",
    priorityLow: "Low",
    priorityMedium: "Medium",
    priorityHigh: "High",
    modalDescription: "Description",
    modalDescPlaceholder: "Add details about this task...",
    modalPriority: "Priority",
    modalDueDate: "Due date",
    modalTags: "Tags",
    tagInputPlaceholder: "New tag + Enter",
    deleteCardBtn: "Delete card",
    saveBtn: "Save",
    dateLocale: "en-US",
    searchPlaceholder: "Search a card…",
    filterAllPriorities: "All priorities",
    noResults: "No card matches.",
    undoBtn: "Undo",
    boardDeletedToast: 'Board "{name}" deleted.',
    columnDeletedToast: 'Column "{name}" deleted.',
    cardDeletedToast: 'Card "{name}" deleted.',
    exportBtn: "Export",
    importBtn: "Import",
    importSuffix: "imported",
    importError: "Invalid file, import cancelled.",
    checklistLabel: "Checklist",
    checklistPlaceholder: "Add a subtask + Enter",
    dragColumnTitle: "Drag to reorder",
  },
};

const I18nContext = createContext({ lang: "fr", t: (k) => DICT.fr[k] ?? k, toggleLang: () => {} });

function getInitialLang() {
  const params = new URLSearchParams(window.location.search);
  const urlLang = params.get("lang");
  if (urlLang === "fr" || urlLang === "en") return urlLang;
  const stored = localStorage.getItem("kb_lang");
  return stored === "fr" || stored === "en" ? stored : "fr";
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(getInitialLang);

  useEffect(() => {
    localStorage.setItem("kb_lang", lang);
  }, [lang]);

  const toggleLang = () => setLang((l) => (l === "fr" ? "en" : "fr"));
  const t = (key, vars) => {
    let str = DICT[lang][key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, v);
      }
    }
    return str;
  };

  return <I18nContext.Provider value={{ lang, t, toggleLang }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}