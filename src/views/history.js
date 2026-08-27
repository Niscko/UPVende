import { db } from '../store/db.js'
import { icons } from '../icons.js'
import { escapeHtml, formatDate, formatMoney, formatTime, startOfDay } from '../utils.js'

export default {
  title: 'Historial',
  render() {
    return `
      <section class="page">
        <div class="filters" id="history-filters">
          <button type="button" class="filter is-active" data-range="all">Todo</button>
          <button type="button" class="filter" data-range="today">Hoy</button>
          <button type="button" class="filter" data-range="week">7 días</button>
        </div>
        <div id="history-list">${renderGroups(db.sales())}</div>
      </section>
    `
  },
  afterRender() {
    const filters = document.getElementById('history-filters')
    const list = document.getElementById('history-list')
    filters.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-range]')
      if (!btn) return
      filters.querySelectorAll('.filter').forEach((el) => el.classList.remove('is-active'))
      btn.classList.add('is-active')
      list.innerHTML = renderGroups(filterSales(btn.dataset.range))
    })
  },
}

function filterSales(range) {
  const sales = db.sales()
  if (range === 'today') return sales.filter((s) => s.createdAt >= startOfDay())
  if (range === 'week') return sales.filter((s) => s.createdAt >= Date.now() - 7 * 24 * 60 * 60 * 1000)
  return sales
}

function renderGroups(sales) {
  if (!sales.length) {
    return `<div class="empty"><p>No hay ventas en este rango.</p>${db.isAdmin() ? '' : '<a class="btn btn--primary" href="#/vender">Registrar venta</a>'}</div>`
  }
  const groups = {}
  sales.forEach((sale) => {
    const key = formatDate(sale.createdAt)
    if (!groups[key]) groups[key] = []
    groups[key].push(sale)
  })
  return Object.entries(groups)
    .map(
      ([day, items]) => `
      <div class="section-head"><h3>${day}</h3><span>${formatMoney(items.reduce((s, i) => s + i.total, 0))}</span></div>
      <div class="list">
        ${items.map((sale) => `<a class="row-card" href="#/historial/${sale.id}"><div class="row-card__icon">${icons.cart}</div><div><strong>${formatMoney(sale.total)}</strong><p class="muted">${formatTime(sale.createdAt)}${db.isAdmin() ? ` · ${escapeHtml(sale.workerName)}` : ''} · ${sale.items.map((i) => `${i.qty}× ${escapeHtml(i.name)}`).join(', ')}</p></div>${icons.chevron}</a>`).join('')}
      </div>
    `,
    )
    .join('')
}
