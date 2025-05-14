import { format, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata um número como moeda brasileira
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formata uma data usando o formato especificado
 */
export function formatDate(date: Date | string, formatString: string = 'dd/MM/yyyy'): string {
  if (typeof date === 'string') {
    // Se a data já for uma string no formato YYYY-MM-DD, converte para o formato brasileiro
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`;
    }
    date = new Date(date);
  }
  return format(date, formatString, { locale: ptBR });
}

/**
 * Calcula o número de dias até uma data
 */
export function getDaysUntil(dateString: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = parseISO(dateString);
  return differenceInDays(targetDate, today);
}

/**
 * Formata um número com separadores de milhar
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

/**
 * Formata uma porcentagem
 */
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}