export function uid() {
  if (crypto.randomUUID) return crypto.randomUUID()
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function formatMoney(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

export function formatDate(ts) {
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(ts)
}

export function formatTime(ts) {
  return new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(ts)
}

export function formatDateTime(ts) {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(ts)
}

export function startOfDay(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function greeting() {
  const hour = new Date().getHours()
  if (hour >= 18 || hour < 5) return 'Buenas noches' // 18:00 – 04:59
  if (hour < 12) return 'Buenos días' // 05:00 – 11:59
  return 'Buenas tardes' // 12:00 – 17:59
}

export function categoryLabel(key) {
  const map = {
    comida: 'Comida',
    ropa: 'Ropa',
    accesorios: 'Accesorios',
    otro: 'Otro',
  }
  return map[key] || key
}

export function stockStatus(product) {
  if (product.stock <= 0) return 'out'
  if (product.stock <= product.minStock) return 'low'
  return 'ok'
}

export function stockLabel(status) {
  if (status === 'out') return 'Agotado'
  if (status === 'low') return 'Stock bajo'
  return 'En stock'
}
