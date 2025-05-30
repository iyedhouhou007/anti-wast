import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

// Format date to relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
  if (!date) return "";

  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsedDate)) return "";

  return formatDistanceToNow(parsedDate, {
    addSuffix: true,
    locale: fr,
  });
};

// Format date to standard display format
export const formatDate = (date, pattern = "PP") => {
  if (!date) return "";

  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsedDate)) return "";

  return format(parsedDate, pattern, { locale: fr });
};

// Format date for API requests
export const formatApiDate = (date) => {
  if (!date) return "";

  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsedDate)) return "";

  return format(parsedDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
};

// Check if date is today
export const isToday = (date) => {
  if (!date) return false;

  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsedDate)) return false;

  const today = new Date();
  return format(parsedDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
};

// Format time only
export const formatTime = (date) => {
  if (!date) return "";

  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsedDate)) return "";

  return format(parsedDate, "HH:mm");
};

// Get expiration time string
export const getExpirationTime = (date) => {
  if (!date) return "";

  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsedDate)) return "";

  const now = new Date();
  if (parsedDate < now) {
    return "Expiré";
  }

  return formatRelativeTime(parsedDate);
};

// Format date range
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return "";

  const parsedStartDate =
    typeof startDate === "string" ? parseISO(startDate) : startDate;
  const parsedEndDate =
    typeof endDate === "string" ? parseISO(endDate) : endDate;

  if (!isValid(parsedStartDate) || !isValid(parsedEndDate)) return "";

  if (
    format(parsedStartDate, "yyyy-MM-dd") ===
    format(parsedEndDate, "yyyy-MM-dd")
  ) {
    return `${format(parsedStartDate, "PP", { locale: fr })} ${format(
      parsedStartDate,
      "HH:mm"
    )} - ${format(parsedEndDate, "HH:mm")}`;
  }

  return `${format(parsedStartDate, "PP HH:mm", { locale: fr })} - ${format(
    parsedEndDate,
    "PP HH:mm",
    { locale: fr }
  )}`;
};
