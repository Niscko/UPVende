import { db } from '../store/db.js'
import { icons } from '../icons.js'
import { categoryLabel, escapeHtml, formatMoney, formatTime, stockStatus } from '../utils.js'

export default {
  title: 'Equipo',
  back: '/inicio',
  render(params) {
    const snap = db.workerSnapshot(params.id)
    if (!snap) {
      return `<section class="page empty"><p>No encontramos a este trabajador.</p><a class="btn btn--ghost" href="#/inicio">Volver al equipo</a></section>`
    }
    const { user, stats, goal, pct, products, alerts, sales } = snap
    const recent = sales.slice(0, 5)
    return `
      <section class="page admin-worker">
        <div class="home__hello">
          <p class="eyebrow">Trabajador</p>
          <h2>${escapeHtml(user.name)}</h2>
          <p class="muted">${escapeHtml(user.business)}</p>
          <p class="muted">${escapeHtml(user.email)}</p>
        </div>
        <div class="stat-grid">
          <article class="stat"><p>Hoy</p><strong>${formatMoney(stats.total)}</strong></article>
          <article class="stat"><p>Ventas</p><strong>${stats.count}</strong></article>
          <article class="stat"><p>Unidades</p><strong>${stats.units}</strong></article>
          <article class="stat"><p>Ticket</p><strong>${formatMoney(stats.average)}</strong></article>
        </div>
        <div class="home__goal">
          <div class="home__goal-head">
            <p class="eyebrow">Meta del día</p>
            ${goal ? `<small>${formatMoney(stats.total)} · ${pct}%</small>` : ''}
          </div>
          ${
            goal
              ? `<p class="admin-worker__goal">${formatMoney(goal)}</p>
                 <div class="bar__track" aria-hidden="true"><span style="width:${pct}%"></span></div>`
              : `<p class="hint">Este trabajador aún no definió una meta.</p>`
          }
        </div>
        ${
          alerts.length
            ? `<a class="alert-banner" href="#/alertas">${icons.alert}<div><strong>${alerts.length} producto${alerts.length === 1 ? '' : 's'} con stock bajo</strong><p>${alerts.map((p) => escapeHtml(p.name)).join(', ')}</p></div>${icons.chevron}</a>`
            : ''
        }
        <div class="section-head"><h3>Inventario</h3><span>${products.length}</span></div>
        ${
          products.length
            ? `<div class="chips">${products.map((p) => `<span class="chip chip--${stockStatus(p)}">${escapeHtml(p.name)} · ${p.stock} ${escapeHtml(p.unit)} · ${categoryLabel(p.category)}</span>`).join('')}</div>`
            : `<div class="empty empty--soft"><p>Todavía no carga productos.</p></div>`
        }
        <div class="section-head"><h3>Ventas</h3><a href="#/historial">Ver todo</a></div>
        ${
          recent.length
            ? `<div class="list">${recent.map((sale) => `<a class="row-card" href="#/historial/${sale.id}"><div><strong>${formatMoney(sale.total)}</strong><p class="muted">${formatTime(sale.createdAt)} · ${sale.items.map((i) => `${i.qty}× ${escapeHtml(i.name)}`).join(' · ')}</p></div>${icons.chevron}</a>`).join('')}</div>`
            : `<div class="empty"><p>Aún no registra ventas.</p></div>`
        }
      </section>
    `
  },
}
