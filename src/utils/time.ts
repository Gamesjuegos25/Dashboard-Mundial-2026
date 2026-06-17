// src/utils/time.ts

/**
 * Convierte una hora local de la sede a hora de Guatemala (UTC-6).
 * @param date "2026-06-11"
 * @param timeLocal "13:00"
 * @param timezone "America/Mexico_City"
 * @returns string con hora en formato "HH:MM"
 */
export function toGuatemalaTime(date: string, timeLocal: string, timezone: string): string {
  const dateTimeStr = `${date}T${timeLocal}:00`;
  const dt = new Date(dateTimeStr + 'Z');

  const sedeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });

  const utcFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });

  // Diferencia entre UTC y la sede
  const sedeDate = new Date(sedeFormatter.format(dt));
  const utcDate = new Date(utcFormatter.format(dt));
  const offsetMs = utcDate.getTime() - sedeDate.getTime();

  // Hora real en UTC = hora local + offset.
  // IMPORTANTE: usamos dateTimeStr + 'Z' para forzar que se interprete como UTC,
  // sin esto, new Date(dateTimeStr) usaría la zona horaria del navegador del usuario
  // y el cálculo quedaría mal en cualquier dispositivo que NO esté en UTC (ej. Guatemala).
  const utcMs = new Date(dateTimeStr + 'Z').getTime() + offsetMs;

  // Guatemala = UTC-6
  const guateMs = utcMs - (6 * 60 * 60 * 1000);
  const guate = new Date(guateMs);

  const h = guate.getUTCHours().toString().padStart(2, '0');
  const m = guate.getUTCMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Formatea una fecha ISO ("2026-06-11") a texto en español ("11 jun 2026").
 */
export function formatDateEs(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${day} ${months[month - 1]} ${year}`;
}
