/**
 * Date Utilities
 * UK-focused date formatting and calculations
 */

export const formatDate = (
  date: Date | string,
  format: 'short' | 'long' | 'full' = 'short',
  locale: string = 'en-GB'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    short: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  }[format];
  
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

export const formatDateTime = (
  date: Date | string,
  locale: string = 'en-GB'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

export const daysUntil = (date: Date | string): number => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dateObj.setHours(0, 0, 0, 0);
  
  const diffTime = dateObj.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isOverdue = (date: Date | string): boolean => {
  return daysUntil(date) < 0;
};

export const isDueSoon = (date: Date | string, days: number = 7): boolean => {
  const daysUntilDate = daysUntil(date);
  return daysUntilDate >= 0 && daysUntilDate <= days;
};

