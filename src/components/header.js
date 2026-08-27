import { db } from '../store/db.js'
import { icons, logoMark } from '../icons.js'
import { escapeHtml } from '../utils.js'

export function renderHeader({ title, back, path } = {}) {
  const session = db.getSession()
  const alerts = db.unseenAlerts().length
  const onAlerts = path === '/alertas'
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
        <a class="icon-btn ${onAlerts ? 'is-active' : ''} ${alerts ? 'has-badge' : ''}" id="bell-btn" href="#/alertas"
           aria-label="${onAlerts ? 'Cerrar alertas' : 'Alertas de stock'}" aria-pressed="${onAlerts}">
          ${icons.bell}
          ${alerts ? `<span class="badge-dot">${alerts}</span>` : ''}
        </a>
        <a class="avatar" href="#/creditos" aria-label="${session?.role === 'admin' ? 'Perfil administrador' : 'Créditos'}">
          ${escapeHtml((session?.name || 'U').slice(0, 1))}
        </a>
      </div>
    </header>
  `
}
