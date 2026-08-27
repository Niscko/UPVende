import { db } from '../store/db.js'
import { icons } from '../icons.js'

const workerItems = [
  { href: '#/inicio', label: 'Inicio', icon: 'home', match: ['/inicio'] },
  { href: '#/productos', label: 'Productos', icon: 'box', match: ['/productos'] },
  { href: '#/vender', label: 'Vender', icon: 'cart', match: ['/vender'], featured: true },
  { href: '#/hoy', label: 'Hoy', icon: 'spark', match: ['/hoy'] },
  { href: '#/historial', label: 'Historial', icon: 'clock', match: ['/historial'] },
]

const adminItems = [
  { href: '#/inicio', label: 'Equipo', icon: 'users', match: ['/inicio', '/equipo'] },
  { href: '#/hoy', label: 'Hoy', icon: 'spark', match: ['/hoy'] },
  { href: '#/historial', label: 'Historial', icon: 'clock', match: ['/historial'] },
]

export function renderNav(path) {
  const items = db.isAdmin() ? adminItems : workerItems
  return `
    <nav class="tabbar ${db.isAdmin() ? 'tabbar--admin' : ''}" aria-label="Navegación principal">
      ${items
        .map((item) => {
          const active = item.match.some((route) => path.startsWith(route))
          return `
            <a class="tab ${active ? 'is-active' : ''} ${item.featured ? 'tab--featured' : ''}" href="${item.href}">
              <span class="tab__icon">${icons[item.icon]}</span>
              <span class="tab__label">${item.label}</span>
            </a>
          `
        })
        .join('')}
    </nav>
  `
}
