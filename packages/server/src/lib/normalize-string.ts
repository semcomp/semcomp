import removeAccents from "remove-accents";

export const normalizeString = (str) =>
  removeAccents(str.toLowerCase().trim());
