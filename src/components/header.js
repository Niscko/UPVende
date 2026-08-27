import { db } from '../store/db.js'
import { icons, logoMark } from '../icons.js'
import { escapeHtml } from '../utils.js'

export function renderHeader({ title, back } = {}) {
  const session = db.getSession()
  const alerts = db.lowStock().length
  return `
    <header class="topbar">
      <div class="topbar__left">
        ${
          back
            ? `<a class="icon-btn" href="#${back}" aria-label="Volver">${icons.back}</a>`
            : `<a class="brand" href="#/inicio">${logoMark}<span>UPVenta</span></a>`
        }
      </div>
      <h1 class="topbar__title">${title || ''}</h1>
      <div class="topbar__right">
        <a class="icon-btn ${alerts ? 'has-badge' : ''}" href="#/alertas" aria-label="Alertas de stock">
          ${icons.bell}
          ${alerts ? `<span class="badge-dot">${alerts}</span>` : ''}
        </a>
        <a class="avatar" href="#/creditos" aria-label="Créditos">
          ${escapeHtml((session?.name || 'U').slice(0, 1))}
        </a>
      </div>
    </header>
  `
}
