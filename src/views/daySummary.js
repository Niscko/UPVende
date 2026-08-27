import { db } from '../store/db.js'
import { escapeHtml, formatDate, formatMoney, formatTime } from '../utils.js'

export default {
  title: 'Hoy',
  render() {
    const stats = db.dayStats()
    const max = stats.top[0]?.qty || 1
    const recientes = db.recentDaysStats(10)
    const team = db.isAdmin() ? db.teamOverview() : null
    return `
      <section class="page">
        <p class="lede">${formatDate(Date.now())} · ${db.isAdmin() ? 'cierre del equipo' : 'cierre rápido del día'}</p>
        <div class="stat-grid">
          <article class="stat"><p>Recaudo</p><strong>${formatMoney(stats.total)}</strong></article>
          <article class="stat"><p>Ventas</p><strong>${stats.count}</strong></article>
          <article class="stat"><p>Unidades</p><strong>${stats.units}</strong></article>
          <article class="stat"><p>Ticket promedio</p><strong>${formatMoney(stats.average)}</strong></article>
        </div>
        ${
          team
            ? `<div class="section-head"><h3>Por trabajador</h3></div>
               <div class="list">${team.workers
                 .map(
                   (snap) =>
                     `<a class="row-card" href="#/equipo/${snap.user.id}"><div><strong>${escapeHtml(snap.user.name)}</strong><p class="muted">${escapeHtml(snap.user.business)} · ${snap.stats.count} venta${snap.stats.count === 1 ? '' : 's'}</p></div><strong>${formatMoney(snap.stats.total)}</strong></a>`,
                 )
                 .join('')}</div>`
            : ''
        }
        <div class="section-head"><h3>Más vendidos</h3></div>
        ${
          stats.top.length
            ? `<div class="bars">${stats.top.map((item) => `<div class="bar"><div class="bar__top"><span>${escapeHtml(item.name)}</span><small>${item.qty} · ${formatMoney(item.total)}</small></div><div class="bar__track"><span style="width:${Math.max(12, (item.qty / max) * 100)}%"></span></div></div>`).join('')}</div>`
            : `<div class="empty"><p>Todavía no hay movimiento hoy.</p>${db.isAdmin() ? '' : '<a class="btn btn--primary" href="#/vender">Registrar venta</a>'}</div>`
        }
        <div class="section-head"><h3>Detalle del día</h3></div>
        <div class="list">
          ${stats.sales.map((sale) => `<a class="row-card" href="#/historial/${sale.id}"><div><strong>${formatMoney(sale.total)}</strong><p class="muted">${formatTime(sale.createdAt)} · ${sale.units} und${db.isAdmin() ? ` · ${escapeHtml(sale.workerName)}` : ''}</p></div><span class="muted">${sale.items.length} ítem${sale.items.length === 1 ? '' : 's'}</span></a>`).join('')}
        </div>

        <div class="section-head"><h3>Últimos días con ventas</h3></div>
        ${
          recientes.list.length
            ? `<article class="stat"><p>${recientes.list.length} día${recientes.list.length === 1 ? '' : 's'} · ${recientes.count} venta${recientes.count === 1 ? '' : 's'}</p><strong>${formatMoney(recientes.total)}</strong></article>
               <div class="bars">${recientes.list
                 .map(
                   (d) =>
                     `<div class="bar"><div class="bar__top"><span>${formatDate(d.day)}</span><small>${d.count} venta${d.count === 1 ? '' : 's'} · ${formatMoney(d.total)}</small></div><div class="bar__track"><span style="width:${Math.max(12, (d.total / recientes.max) * 100)}%"></span></div></div>`,
                 )
                 .join('')}</div>`
            : `<div class="empty"><p>Aún no hay ventas registradas.</p></div>`
        }
      </section>
    `
  },
}
