import { db } from '../store/db.js'
import { toast } from '../components/toast.js'
import { openModal } from '../components/modal.js'
import { navigate } from '../navigate.js'
import { categoryLabel, escapeHtml, formatMoney } from '../utils.js'

export default {
  title: 'Producto',
  back: '/productos',
  render(params) {
    const isNew = params.id === 'nuevo'
    const product = isNew ? null : db.getProduct(params.id)
    if (!isNew && !product) return `<section class="page empty"><p>Producto no encontrado.</p></section>`
    const p = product || { name: '', category: 'comida', price: '', stock: '', minStock: 3, unit: 'und' }
    return `
      <section class="page">
        <form class="form" id="product-form">
          <label>Nombre<input name="name" required maxlength="50" value="${escapeHtml(p.name)}" placeholder="Brownie de chocolate" /></label>
          <label>Categoría<select name="category">${['comida', 'ropa', 'accesorios', 'otro'].map((cat) => `<option value="${cat}" ${p.category === cat ? 'selected' : ''}>${categoryLabel(cat)}</option>`).join('')}</select></label>
          <div class="form-row">
            <label>Precio (COP)<input name="price" type="number" min="0" step="100" required value="${p.price}" /></label>
            <label>Unidad<select name="unit">${['und', 'paq', 'par', 'caja'].map((unit) => `<option value="${unit}" ${p.unit === unit ? 'selected' : ''}>${unit}</option>`).join('')}</select></label>
          </div>
          <div class="form-row">
            <label>Stock actual<input name="stock" type="number" min="0" required value="${p.stock}" /></label>
            <label>Alerta desde<input name="minStock" type="number" min="0" required value="${p.minStock}" /></label>
          </div>
          <p class="hint">Cuando el stock sea igual o menor a la alerta, aparecerá en la pantalla de alertas.</p>
          <button class="btn btn--primary btn--block" type="submit">${isNew ? 'Guardar producto' : 'Guardar cambios'}</button>
          ${product ? `<button class="btn btn--ghost btn--block" type="button" id="delete-product">Eliminar</button>` : ''}
        </form>
        ${product ? `<p class="hint">Precio de venta: ${formatMoney(product.price)}.</p>` : ''}
      </section>
    `
  },
  afterRender(params) {
    const isNew = params.id === 'nuevo'
    const form = document.getElementById('product-form')
    if (!form) return
    form.addEventListener('submit', (event) => {
      event.preventDefault()
      const data = new FormData(form)
      try {
        db.saveProduct({
          id: isNew ? undefined : params.id,
          name: String(data.get('name')),
          category: String(data.get('category')),
          price: Number(data.get('price')),
          stock: Number(data.get('stock')),
          minStock: Number(data.get('minStock')),
          unit: String(data.get('unit')),
        })
        toast(isNew ? 'Producto creado' : 'Producto actualizado')
        navigate('/productos')
      } catch (error) {
        toast(error.message, 'error')
      }
    })
    document.getElementById('delete-product')?.addEventListener('click', async () => {
      const ok = await openModal({
        title: 'Eliminar producto',
        body: 'El historial de ventas conserva el nombre, pero el producto desaparece del inventario.',
        confirmLabel: 'Eliminar',
        danger: true,
      })
      if (!ok) return
      db.deleteProduct(params.id)
      toast('Producto eliminado')
      navigate('/productos')
    })
  },
}
