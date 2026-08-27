import { db } from '../store/db.js'
import { icons } from '../icons.js'
import { toast } from '../components/toast.js'
import { categoryLabel, escapeHtml, stockLabel, stockStatus } from '../utils.js'

export default {
  title: 'Alertas',
  render() {
    const alerts = db.lowStock()
    return `
      <section class="page">
        <p class="lede">${db.isAdmin() ? 'Stock bajo en el inventario de tus trabajadores.' : 'Productos con stock igual o menor al mínimo que definiste.'}</p>
        ${
          alerts.length
            ? `<div class="list" id="alerts-list">${alerts.map(alertRow).join('')}</div>`
            : `<div class="empty"><p>Todo el inventario está por encima del mínimo. Bien.</p>${db.isAdmin() ? '' : '<a class="btn btn--ghost" href="#/productos">Ver productos</a>'}</div>`
        }
      </section>
    `
  },
  afterRender() {
    db.markAlertsSeen() // el usuario ya revisó las alertas actuales

    document.getElementById('alerts-list')?.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-restock]')
      if (!btn) return
      db.addStock(btn.dataset.restock, Number(btn.dataset.amount))
      toast(`+${btn.dataset.amount} al inventario`)
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
  },
}

function alertRow(product) {
  const status = stockStatus(product)
  const admin = db.isAdmin()
  return `
    <article class="row-card row-card--stack">
      <div class="row-card__main">
        <div>
          <strong>${escapeHtml(product.name)}</strong>
          <p class="muted">${categoryLabel(product.category)} · mínimo ${product.minStock}${product.workerName ? ` · ${escapeHtml(product.workerName)}` : ''}</p>
        </div>
        <span class="badge badge--${status}">${product.stock} ${escapeHtml(product.unit)} · ${stockLabel(status)}</span>
      </div>
      ${
        admin
          ? `<a class="btn btn--ghost btn--sm" href="#/equipo/${product.userId}">Ver trabajador</a>`
          : `<div class="row-card__actions">
        <button type="button" class="btn btn--ghost btn--sm" data-restock="${product.id}" data-amount="1">${icons.plus} 1</button>
        <button type="button" class="btn btn--ghost btn--sm" data-restock="${product.id}" data-amount="5">${icons.plus} 5</button>
        <a class="btn btn--ghost btn--sm" href="#/productos/${product.id}">Editar</a>
      </div>`
      }
    </article>
  `
}
