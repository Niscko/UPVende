import { db } from '../store/db.js'
import { icons } from '../icons.js'
import { toast } from '../components/toast.js'
import { openModal } from '../components/modal.js'
import { navigate } from '../navigate.js'
import { escapeHtml, formatMoney, stockStatus } from '../utils.js'

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
        <div class="list" id="sale-list">${products.map((p) => saleRow(p, 0)).join('')}</div>
        <div class="sale-bar" id="sale-bar">${saleBar()}</div>
      </section>
    `
  },
  afterRender() {
    const list = document.getElementById('sale-list')
    if (!list) return
    list.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-delta]')
      if (!btn) return
      const id = btn.dataset.id
      const product = db.getProduct(id)
      const next = (cart[id] || 0) + Number(btn.dataset.delta)
      if (next < 0) return
      if (next > product.stock) {
        toast(`Solo hay ${product.stock} de ${product.name}`, 'error')
        return
      }
      if (next === 0) delete cart[id]
      else cart[id] = next
      list.querySelector(`[data-row="${id}"]`).outerHTML = saleRow(product, cart[id] || 0)
      document.getElementById('sale-bar').innerHTML = saleBar()
      bindConfirm()
    })
    bindConfirm()
  },
}

function selectedItems() {
  return Object.entries(cart)
    .map(([productId, qty]) => {
      const product = db.getProduct(productId)
      if (!product || qty <= 0) return null
      return { productId, name: product.name, qty, unitPrice: product.price }
    })
    .filter(Boolean)
}

function saleRow(product, qty) {
  const status = stockStatus(product)
  return `
    <article class="row-card row-card--static" data-row="${product.id}">
      <div>
        <strong>${escapeHtml(product.name)}</strong>
        <p class="muted">${formatMoney(product.price)} · ${product.stock} ${escapeHtml(product.unit)}</p>
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
    const detail = items.map((item) => `${item.qty}× ${escapeHtml(item.name)}`).join('<br>')
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
