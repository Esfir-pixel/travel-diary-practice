import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Форматирование стоимости путешествия
export function formatCost(cost: number | null): string {
  if (cost === null || cost === undefined) return '—';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(cost);
}

// Форматирование дат
export function formatDate(date: string | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// «3 дня назад», «сегодня» и т.п.
export function formatRelativeDate(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'сегодня';
  if (diffDays === 1) return 'вчера';
  if (diffDays < 7) return `${diffDays} дн. назад`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`;
  return formatDate(date);
}

// Метка рейтинга безопасности
export function safetyLabel(rating: number | null): string {
  if (rating === null) return '—';
  const labels = ['', 'Опасно', 'Настороженно', 'Нормально', 'Безопасно', 'Очень безопасно'];
  return labels[rating] ?? '—';
}
