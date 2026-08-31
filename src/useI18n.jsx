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
  const t = (key) => DICT[lang][key] ?? key;

  return <I18nContext.Provider value={{ lang, t, toggleLang }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}