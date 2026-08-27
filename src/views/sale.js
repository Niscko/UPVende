import { db } from '../store/db.js'
import { icons } from '../icons.js'
import { toast } from '../components/toast.js'
import { openModal } from '../components/modal.js'
import { navigate } from '../navigate.js'
import { escapeHtml, formatMoney, stockStatus } from '../utils.js'

// cart: { [productId]: { qty, price } }  — price es el precio unitario de ESTA venta
let cart = {}

export default {
  title: 'Vender',
  render() {
    const products = db.products()
    cart = {}
    if (!products.length) {
      return `<section class="page empty"><p>Primero agrega productos al inventario.</p><a class="btn btn--primary" href="#/productos/nuevo">Nuevo producto</a></section>`
    }
    return `
      <section class="page sale">
        <p class="lede">Toca + apenas ocurra la venta. El stock se descuenta al confirmar.</p>
        <div class="list" id="sale-list">${products.map((p) => saleRow(p, cart[p.id])).join('')}</div>
        <div class="sale-bar" id="sale-bar">${saleBar()}</div>
      </section>
    `
  },
  afterRender() {
    const list = document.getElementById('sale-list')
    if (!list) return

    const refreshRow = (id, product) => {
      const row = list.querySelector(`[data-row="${id}"]`)
      if (row) row.outerHTML = saleRow(product, cart[id])
      document.getElementById('sale-bar').innerHTML = saleBar()
      bindConfirm()
    }

    list.addEventListener('click', (event) => {
      const stepBtn = event.target.closest('[data-delta]')
      if (stepBtn) {
        const id = stepBtn.dataset.id
        const product = db.getProduct(id)
        const cur = cart[id] || { qty: 0, price: product.price }
        const next = cur.qty + Number(stepBtn.dataset.delta)
        if (next < 0) return
        if (next > product.stock) {
          toast(`Solo hay ${product.stock} de ${product.name}`, 'error')
          return
        }
        if (next === 0) delete cart[id]
        else cart[id] = { qty: next, price: cur.price }
        refreshRow(id, product)
        return
      }

      const priceBtn = event.target.closest('[data-price]')
      if (priceBtn) {
        const id = priceBtn.dataset.price
        const product = db.getProduct(id)
        if (!cart[id]) return
        askUnitPrice(product, cart[id].price).then((newPrice) => {
          if (newPrice == null) return
          cart[id] = { qty: cart[id].qty, price: newPrice }
          refreshRow(id, product)
        })
      }
    })

    bindConfirm()
  },
}

function selectedItems() {
  return Object.entries(cart)
    .map(([productId, entry]) => {
      const product = db.getProduct(productId)
      if (!product || !entry || entry.qty <= 0) return null
      return { productId, name: product.name, qty: entry.qty, unitPrice: entry.price }
    })
    .filter(Boolean)
}

function saleRow(product, entry) {
  const qty = entry ? entry.qty : 0
  const price = entry ? entry.price : product.price
  const custom = qty > 0 && price !== product.price
  const status = stockStatus(product)
  const priceLine = custom
    ? `<s>${formatMoney(product.price)}</s> <span class="price-custom">${formatMoney(price)}</span>`
    : formatMoney(product.price)
  return `
    <article class="row-card row-card--static" data-row="${product.id}">
      <div>
        <strong>${escapeHtml(product.name)}</strong>
        <p class="muted">${priceLine} · ${product.stock} ${escapeHtml(product.unit)}</p>
        ${qty > 0 ? `<button type="button" class="price-btn" data-price="${product.id}">${custom ? 'Precio con descuento' : 'Cambiar precio'}</button>` : ''}
      </div>
      <div class="stepper">
        <button type="button" class="icon-btn" data-delta="-1" data-id="${product.id}" ${qty === 0 ? 'disabled' : ''}>${icons.minus}</button>
        <span class="stepper__qty ${qty ? 'is-on' : ''} ${status === 'out' ? 'is-out' : ''}">${qty}</span>
        <button type="button" class="icon-btn" data-delta="1" data-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>${icons.plus}</button>
      </div>
    </article>
  `
}

function saleBar() {
  const items = selectedItems()
  const total = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0)
  const units = items.reduce((sum, item) => sum + item.qty, 0)
  return `
    <div>
      <strong>${formatMoney(total)}</strong>
      <p>${units ? `${units} und · ${items.length} producto${items.length === 1 ? '' : 's'}` : 'Sin productos'}</p>
    </div>
    <button class="btn btn--primary" id="confirm-sale" type="button" ${items.length ? '' : 'disabled'}>Confirmar venta</button>
  `
}

function bindConfirm() {
  document.getElementById('confirm-sale')?.addEventListener('click', async () => {
    const items = selectedItems()
    if (!items.length) return
    const detail = items
      .map((item) => {
        const product = db.getProduct(item.productId)
        const disc = product && item.unitPrice !== product.price
        return `${item.qty}× ${escapeHtml(item.name)}${disc ? ` · ${formatMoney(item.unitPrice)} c/u` : ''}`
      })
      .join('<br>')
    const total = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0)
    const ok = await openModal({
      title: 'Confirmar venta',
      body: `${detail}<p class="modal__total">${formatMoney(total)}</p>`,
      confirmLabel: 'Registrar',
    })
    if (!ok) return
    try {
      const sale = db.createSale(items)
      cart = {}
      toast('Venta registrada')
      navigate(`/historial/${sale.id}`)
    } catch (error) {
      toast(error.message, 'error')
    }
  })
}

/** Modal para fijar el precio unitario de un producto solo en esta venta. */
function askUnitPrice(product, current) {
  return new Promise((resolve) => {
    const root = document.getElementById('modal-root')
    root.innerHTML = `
      <div class="modal-backdrop" role="dialog" aria-modal="true">
        <div class="modal">
          <h3>Precio para esta venta</h3>
          <div class="modal__body">
            <p>${escapeHtml(product.name)} — precio normal: <strong>${formatMoney(product.price)}</strong></p>
            <label class="stock-entry">Precio por unidad
              <input type="number" min="0" step="100" inputmode="numeric" id="price-input" value="${current}" />
            </label>
            <button type="button" class="link" id="price-reset">Usar precio normal</button>
          </div>
          <div class="modal__actions">
            <button type="button" class="btn btn--ghost" data-modal="no">Cancelar</button>
            <button type="button" class="btn btn--primary" data-modal="yes">Aplicar</button>
          </div>
        </div>
      </div>
    `
    const input = root.querySelector('#price-input')
    const close = (value) => {
      root.innerHTML = ''
      resolve(value)
    }
    root.querySelector('#price-reset').addEventListener('click', () => close(product.price))
    root.querySelector('[data-modal="no"]').addEventListener('click', () => close(null))
    root.querySelector('[data-modal="yes"]').addEventListener('click', () => {
      const n = Number(input.value)
      close(Number.isFinite(n) && n >= 0 ? Math.round(n) : null)
    })
    root.querySelector('.modal-backdrop').addEventListener('click', (event) => {
      if (event.target.classList.contains('modal-backdrop')) close(null)
    })
    input.focus()
    input.select()
  })
}
