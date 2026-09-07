export function formatCurrencyMXN(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDuration(minutos: number): string {
  const minutosRedondeados = Math.round(minutos);
  const horas = Math.floor(minutosRedondeados / 60);
  const mins = minutosRedondeados % 60;
  if (horas === 0) return `${mins} min`;
  if (mins === 0) return `${horas} h`;
  return `${horas} h ${mins} min`;
}

export function formatCO2(kg: number): string {
  if (kg <= 0) return '0 kg CO₂';
  if (kg < 1) return `${Math.round(kg * 1000)} g CO₂`;
  return `${kg.toFixed(1)} kg CO₂`;
}
