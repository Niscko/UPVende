import { db } from './store/db.js'
import { currentPath, navigate } from './navigate.js'
import { renderHeader } from './components/header.js'
import { renderNav } from './components/nav.js'
import Login from './views/login.js'
import Register from './views/register.js'
import Home from './views/home.js'
import Products from './views/products.js'
import ProductForm from './views/productForm.js'
import Sale from './views/sale.js'
import DaySummary from './views/daySummary.js'
import Alerts from './views/alerts.js'
import History from './views/history.js'
import SaleDetail from './views/saleDetail.js'
import Credits from './views/credits.js'

const publicRoutes = ['/login', '/registro']

function matchRoute(path) {
  if (path === '/' || path === '') return { view: Home, path: '/inicio', params: {} }
  if (path === '/login') return { view: Login, path, params: {}, public: true }
  if (path === '/registro') return { view: Register, path, params: {}, public: true }
  if (path === '/inicio') return { view: Home, path, params: {} }
  if (path === '/productos') return { view: Products, path, params: {} }
  if (path.startsWith('/productos/')) {
    return { view: ProductForm, path: '/productos', params: { id: path.split('/')[2] } }
  }
  if (path === '/vender') return { view: Sale, path, params: {} }
  if (path === '/hoy') return { view: DaySummary, path, params: {} }
  if (path === '/alertas') return { view: Alerts, path, params: {} }
  if (path === '/historial') return { view: History, path, params: {} }
  if (path.startsWith('/historial/')) {
    return { view: SaleDetail, path: '/historial', params: { id: path.split('/')[2] } }
  }
  if (path === '/creditos') return { view: Credits, path, params: {} }
  return { view: Home, path: '/inicio', params: {} }
}

export function startRouter() {
  const render = () => {
    const session = db.getSession()
    const path = currentPath()
    const route = matchRoute(path)
    if (!session && !route.public) {
      navigate('/login')
      return
    }
    if (session && publicRoutes.includes(path)) {
      navigate('/inicio')
      return
    }
    const app = document.getElementById('app')
    if (route.public) {
      app.innerHTML = `<main class="view view--auth" id="view">${route.view.render(route.params)}</main>`
    } else {
      app.innerHTML = `
        <div class="device">
          ${renderHeader({ title: route.view.title, back: route.view.back })}
          <main class="view" id="view">${route.view.render(route.params)}</main>
          ${renderNav(route.path)}
        </div>
      `
    }
    route.view.afterRender?.(route.params)
    window.scrollTo(0, 0)
  }
  window.addEventListener('hashchange', render)
  if (!window.location.hash) window.location.hash = db.getSession() ? '#/inicio' : '#/login'
  else render()
}
