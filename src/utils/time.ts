// src/utils/time.ts
// Versión que NO modifica horas pero SÍ calcula el estado

export function formatTime12h(_date: string, timeLocal: string, _timezone: string): string {
  try {
    const [hours, minutes] = timeLocal.split(':').map(Number);
    const ampm = hours >= 12 ? 'p. m.' : 'a. m.';
    const hour12 = hours % 12 || 12;
    const minuteStr = minutes.toString().padStart(2, '0');
    return `${hour12}:${minuteStr} ${ampm}`;
  } catch (error) {
    console.error('Error en formatTime12h:', error);
    return 'Hora no disponible';
  }
}

export function getMatchStatus(_date: string, timeLocal: string, _timezone: string): string {
  try {
    const [hours, minutes] = timeLocal.split(':').map(Number);
    const now = new Date();
    const nowHours = now.getHours();
    const nowMinutes = now.getMinutes();
    
    const matchTotalMinutes = hours * 60 + minutes;
    const nowTotalMinutes = nowHours * 60 + nowMinutes;
    const diffMin = nowTotalMinutes - matchTotalMinutes;
    
    if (diffMin < 0) return "Próximo";
    if (diffMin <= 105) return "En curso";
    return "Finalizado";
  } catch (error) {
    console.error('Error en getMatchStatus:', error);
    return "Próximo";
  }
}
