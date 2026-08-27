import { db } from '../store/db.js'
import { icons } from '../icons.js'
import { toast } from '../components/toast.js'
import { categoryLabel, escapeHtml, formatMoney, stockLabel, stockStatus } from '../utils.js'

const CATEGORIES = ['todos', 'comida', 'ropa', 'accesorios', 'otro']

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
    list.addEventListener('click', async (event) => {
      const addBtn = event.target.closest('[data-add-stock]')
      if (!addBtn) return
      event.preventDefault()
      const product = db.getProduct(addBtn.dataset.addStock)
      if (!product) return
      const qty = await askStockEntry(product)
      if (!qty) return
      db.addStock(product.id, qty)
      toast(`+${qty} ${product.unit} · ${product.name}`)
      apply()
    })
  },
}

function renderList(products) {
  if (!products.length) {
    return `<div class="empty"><p>No hay productos en esta lista.</p><a class="btn btn--primary" href="#/productos/nuevo">Agregar producto</a></div>`
  }
  return products
    .map((p) => {
      const status = stockStatus(p)
      return `
        <article class="row-card row-card--action">
          <a class="row-card__link" href="#/productos/${p.id}">
            <div class="row-card__icon">${icons.box}</div>
            <div class="row-card__body">
              <strong>${escapeHtml(p.name)}</strong>
              <p class="muted">${categoryLabel(p.category)} · ${formatMoney(p.price)}</p>
            </div>
            <div class="row-card__side">
              <span class="badge badge--${status}">${p.stock} ${escapeHtml(p.unit)}</span>
              <small>${stockLabel(status)}</small>
            </div>
          </a>
          <button type="button" class="row-card__add" data-add-stock="${p.id}" aria-label="Agregar inventario a ${escapeHtml(p.name)}">${icons.plus}</button>
        </article>`
    })
    .join('')
}

/** Modal para registrar una entrada de inventario. Devuelve la cantidad (>0) o null. */
function askStockEntry(product) {
  return new Promise((resolve) => {
    const root = document.getElementById('modal-root')
    root.innerHTML = `
      <div class="modal-backdrop" role="dialog" aria-modal="true">
        <div class="modal">
          <h3>Entrada de inventario</h3>
          <div class="modal__body">
            <p>${escapeHtml(product.name)} — stock actual: <strong>${product.stock} ${escapeHtml(product.unit)}</strong></p>
            <label class="stock-entry">Unidades que entraron
              <input type="number" min="1" step="1" inputmode="numeric" id="stock-entry-input" placeholder="0" />
            </label>
          </div>
          <div class="modal__actions">
            <button type="button" class="btn btn--ghost" data-modal="no">Cancelar</button>
            <button type="button" class="btn btn--primary" data-modal="yes">Sumar</button>
          </div>
        </div>
      </div>
    `
    const input = root.querySelector('#stock-entry-input')
    const confirm = root.querySelector('[data-modal="yes"]')
    const close = (value) => {
      root.innerHTML = ''
      resolve(value)
    }
    const commit = () => {
      const n = Math.trunc(Number(input.value))
      close(Number.isFinite(n) && n > 0 ? n : null)
    }
    root.querySelector('[data-modal="no"]').addEventListener('click', () => close(null))
    confirm.addEventListener('click', commit)
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        commit()
      }
    })
    root.querySelector('.modal-backdrop').addEventListener('click', (event) => {
      if (event.target.classList.contains('modal-backdrop')) close(null)
    })
    input.focus()
  })
}
