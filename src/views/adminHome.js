import { db } from '../store/db.js'
import { icons } from '../icons.js'
import { escapeHtml, formatMoney, greeting } from '../utils.js'

export default {
  title: '',
  render() {
    const session = db.getSession()
    const team = db.teamOverview()
    return `
      <section class="page home">
        <div class="home__hello">
          <p class="eyebrow">${greeting()}</p>
          <h2>${escapeHtml(session.name.split(' ')[0])}</h2>
          <p class="muted">${escapeHtml(session.business)}</p>
          <span class="role-pill">Administrador</span>
        </div>
        <article class="hero-card">
          <p class="eyebrow">Recaudo del equipo hoy</p>
          <strong>${formatMoney(team.todayTotal)}</strong>
          <div class="hero-card__meta">
            <span>${team.workers.length} trabajadores</span>
            <span>${team.todayCount} ventas</span>
            <span>${team.todayUnits} und</span>
          </div>
        </article>
        ${
          team.alerts
            ? `<a class="alert-banner" href="#/alertas">${icons.alert}<div><strong>${team.alerts} alerta${team.alerts === 1 ? '' : 's'} de stock</strong><p>Revisa el inventario de tus trabajadores.</p></div>${icons.chevron}</a>`
            : ''
        }
        <div class="section-head"><h3>Trabajadores</h3><span>${team.workers.length}</span></div>
        ${
          team.workers.length
            ? `<div class="list">${team.workers.map(workerCard).join('')}</div>`
            : `<div class="empty"><p>Aún no hay trabajadores registrados.</p></div>`
        }
      </section>
    `
  },
}

function workerCard(snap) {
  const { user, stats, goal, pct, alerts, products } = snap
  return `
    <a class="row-card" href="#/equipo/${user.id}">
      <div class="row-card__icon avatar-letter">${escapeHtml(user.name.slice(0, 1))}</div>
      <div>
        <strong>${escapeHtml(user.name)}</strong>
        <p class="muted">${escapeHtml(user.business)}</p>
        <p class="muted">${formatMoney(stats.total)} hoy${goal ? ` · meta ${pct}%` : ''} · ${products.length} productos${alerts.length ? ` · ${alerts.length} alerta${alerts.length === 1 ? '' : 's'}` : ''}</p>
      </div>
      ${icons.chevron}
    </a>
  `
}
