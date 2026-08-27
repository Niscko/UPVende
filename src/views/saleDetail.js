import { db } from '../store/db.js'
import { escapeHtml, formatDateTime, formatMoney } from '../utils.js'

export default {
  title: 'Venta',
  back: '/historial',
  render(params) {
    const sale = db.getSale(params.id)
    if (!sale) return `<section class="page empty"><p>No encontramos esta venta.</p></section>`
    return `
      <section class="page">
        <article class="hero-card hero-card--plain">
          <p class="eyebrow">${formatDateTime(sale.createdAt)}</p>
          <strong>${formatMoney(sale.total)}</strong>
          <div class="hero-card__meta">
            <span>${sale.units} unidades</span>
            <span>${sale.items.length} productos</span>
          </div>
        </article>
        <div class="section-head"><h3>Productos vendidos</h3></div>
        <div class="list">
          ${sale.items.map((item) => {
            const live = db.getProduct(item.productId)
            return `<div class="row-card row-card--static"><div><strong>${escapeHtml(item.name)}</strong><p class="muted">${item.qty} × ${formatMoney(item.unitPrice)}</p>${live ? `<p class="muted">Stock actual: ${live.stock} ${escapeHtml(live.unit)}</p>` : `<p class="muted">Producto ya no está en inventario</p>`}</div><strong>${formatMoney(item.subtotal)}</strong></div>`
          }).join('')}
        </div>
        ${sale.note ? `<p class="hint">Nota: ${escapeHtml(sale.note)}</p>` : ''}
        <a class="btn btn--primary btn--block" href="#/vender">Nueva venta</a>
      </section>
    `
  },
}
