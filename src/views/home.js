import { db } from '../store/db.js'
import { icons } from '../icons.js'
import { escapeHtml, formatMoney, greeting, stockStatus } from '../utils.js'
import { sampleCatalog } from '../store/seed.js'
import { toast } from '../components/toast.js'

export default {
  title: '',
  render() {
    const session = db.getSession()
    const stats = db.dayStats()
    const alerts = db.lowStock()
    const products = db.products()
    const recent = db.sales().slice(0, 3)
    return `
      <section class="page home">
        <div class="home__hello">
          <p class="eyebrow">${greeting()}</p>
          <h2>${escapeHtml(session.name.split(' ')[0])}</h2>
          <p class="muted">${escapeHtml(session.business)}</p>
        </div>
        <article class="hero-card">
          <p class="eyebrow">Ventas de hoy</p>
          <strong>${formatMoney(stats.total)}</strong>
          <div class="hero-card__meta">
            <span>${stats.count} ventas</span>
            <span>${stats.units} unidades</span>
          </div>
          <a class="btn btn--light btn--block" href="#/vender">${icons.plus} Registrar venta</a>
        </article>
        ${
          alerts.length
            ? `<a class="alert-banner" href="#/alertas">${icons.alert}<div><strong>${alerts.length} producto${alerts.length > 1 ? 's' : ''} con stock bajo</strong><p>Revisa para no quedarte sin inventario.</p></div>${icons.chevron}</a>`
            : ''
        }
        <div class="quick-grid">
          <a class="quick" href="#/productos">${icons.box}<span>Productos</span><small>${products.length}</small></a>
          <a class="quick" href="#/hoy">${icons.spark}<span>Resumen</span><small>del día</small></a>
          <a class="quick" href="#/historial">${icons.clock}<span>Historial</span><small>${db.sales().length}</small></a>
        </div>
        <div class="section-head"><h3>Últimas ventas</h3><a href="#/historial">Ver todo</a></div>
        ${
          recent.length
            ? `<div class="list">${recent.map((sale) => `<a class="row-card" href="#/historial/${sale.id}"><div><strong>${formatMoney(sale.total)}</strong><p class="muted">${sale.items.map((i) => `${i.qty}× ${escapeHtml(i.name)}`).join(' · ')}</p></div>${icons.chevron}</a>`).join('')}</div>`
            : `<div class="empty"><p>Aún no hay ventas hoy.</p><a class="btn btn--primary" href="#/vender">Registrar la primera</a></div>`
        }
        ${
          products.length === 0
            ? `<div class="empty empty--soft"><p>Empieza cargando tu inventario o usa un catálogo de ejemplo.</p><button class="btn btn--ghost" id="seed-catalog" type="button">Cargar catálogo demo</button></div>`
            : `<div class="section-head"><h3>Inventario</h3><a href="#/productos">Abrir</a></div><div class="chips">${products.slice(0, 4).map((p) => `<span class="chip chip--${stockStatus(p)}">${escapeHtml(p.name)} · ${p.stock}</span>`).join('')}</div>`
        }
      </section>
    `
  },
  afterRender() {
    document.getElementById('seed-catalog')?.addEventListener('click', () => {
      db.appendProducts(sampleCatalog())
      toast('Catálogo de ejemplo cargado')
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
  },
}
