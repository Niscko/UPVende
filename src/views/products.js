import { db } from '../store/db.js'
import { icons } from '../icons.js'
import { categoryLabel, escapeHtml, formatMoney, stockLabel, stockStatus } from '../utils.js'

const CATEGORIES = ['todos', 'postres', 'ropa', 'accesorios', 'otro']

export default {
  title: 'Productos',
  render() {
    return `
      <section class="page">
        <div class="toolbar">
          <label class="search">${icons.search}<input id="product-search" type="search" placeholder="Buscar producto" /></label>
          <a class="btn btn--primary" href="#/productos/nuevo">${icons.plus} Nuevo</a>
        </div>
        <div class="filters" id="category-filters">
          ${CATEGORIES.map((cat, i) => `<button type="button" class="filter ${i === 0 ? 'is-active' : ''}" data-cat="${cat}">${cat === 'todos' ? 'Todos' : categoryLabel(cat)}</button>`).join('')}
        </div>
        <div id="product-list" class="list">${renderList(db.products())}</div>
      </section>
    `
  },
  afterRender() {
    const search = document.getElementById('product-search')
    const filters = document.getElementById('category-filters')
    const list = document.getElementById('product-list')
    let category = 'todos'
    const apply = () => {
      const q = search.value.trim().toLowerCase()
      list.innerHTML = renderList(
        db.products().filter((p) => (category === 'todos' || p.category === category) && p.name.toLowerCase().includes(q)),
      )
    }
    search.addEventListener('input', apply)
    filters.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-cat]')
      if (!btn) return
      category = btn.dataset.cat
      filters.querySelectorAll('.filter').forEach((el) => el.classList.remove('is-active'))
      btn.classList.add('is-active')
      apply()
    })
  },
}

function renderList(products) {
  if (!products.length) {
    return `<div class="empty"><p>No hay productos en esta lista.</p><a class="btn btn--primary" href="#/productos/nuevo">Agregar producto</a></div>`
  }
  return products.map((p) => {
    const status = stockStatus(p)
    return `<a class="row-card" href="#/productos/${p.id}"><div class="row-card__icon">${icons.box}</div><div><strong>${escapeHtml(p.name)}</strong><p class="muted">${categoryLabel(p.category)} · ${formatMoney(p.price)}</p></div><div class="row-card__side"><span class="badge badge--${status}">${p.stock} ${escapeHtml(p.unit)}</span><small>${stockLabel(status)}</small></div></a>`
  }).join('')
}
