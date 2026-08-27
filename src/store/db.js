import { startOfDay, uid } from '../utils.js'

const KEYS = {
  users: 'upventa_users',
  session: 'upventa_session',
  products: 'upventa_products',
  sales: 'upventa_sales',
  alertsSeen: 'upventa_alerts_seen',
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export const db = {
  getSession() {
    return read(KEYS.session, null)
  },

  setSession(user) {
    write(KEYS.session, {
      id: user.id,
      name: user.name,
      email: user.email,
      business: user.business,
    })
  },

  logout() {
    localStorage.removeItem(KEYS.session)
  },

  getUsers() {
    return read(KEYS.users, [])
  },

  register({ name, email, password, business }) {
    const users = this.getUsers()
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Ya existe una cuenta con ese correo')
    }
    const user = {
      id: uid(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      business: business.trim(),
      createdAt: Date.now(),
    }
    users.push(user)
    write(KEYS.users, users)
    this.setSession(user)
    return user
  },

  login(email, password) {
    const user = this.getUsers().find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.password === password,
    )
    if (!user) throw new Error('Correo o clave incorrectos')
    this.setSession(user)
    return user
  },

  products() {
    const session = this.getSession()
    if (!session) return []
    return read(KEYS.products, [])
      .filter((p) => p.userId === session.id)
      .sort((a, b) => a.name.localeCompare(b.name, 'es'))
  },

  getProduct(id) {
    return this.products().find((p) => p.id === id) || null
  },

  saveProduct(data) {
    const session = this.getSession()
    const all = read(KEYS.products, [])
    if (data.id) {
      const index = all.findIndex((p) => p.id === data.id && p.userId === session.id)
      if (index < 0) throw new Error('Producto no encontrado')
      all[index] = {
        ...all[index],
        name: data.name.trim(),
        category: data.category,
        price: Number(data.price),
        stock: Number(data.stock),
        minStock: Number(data.minStock),
        unit: data.unit || 'und',
        updatedAt: Date.now(),
      }
    } else {
      all.push({
        id: uid(),
        userId: session.id,
        name: data.name.trim(),
        category: data.category,
        price: Number(data.price),
        stock: Number(data.stock),
        minStock: Number(data.minStock),
        unit: data.unit || 'und',
        createdAt: Date.now(),
      })
    }
    write(KEYS.products, all)
  },

  deleteProduct(id) {
    const session = this.getSession()
    write(
      KEYS.products,
      read(KEYS.products, []).filter((p) => !(p.id === id && p.userId === session.id)),
    )
  },

  addStock(id, amount) {
    const session = this.getSession()
    const all = read(KEYS.products, [])
    const index = all.findIndex((p) => p.id === id && p.userId === session.id)
    if (index < 0) return
    all[index].stock = Math.max(0, Number(all[index].stock) + Number(amount))
    all[index].updatedAt = Date.now()
    write(KEYS.products, all)
  },

  lowStock() {
    return this.products().filter((p) => p.stock <= p.minStock)
  },

  // --- Alertas "vistas" -------------------------------------------------
  // Se guarda la lista de productos en alerta que el usuario ya revisó.
  // Solo cuentan como "nuevas" las alertas que aún no ha visto.
  _seenAlertIds() {
    const low = new Set(this.lowStock().map((p) => p.id))
    const stored = read(KEYS.alertsSeen, [])
    const pruned = stored.filter((id) => low.has(id)) // descarta las que ya no están en alerta
    if (pruned.length !== stored.length) write(KEYS.alertsSeen, pruned)
    return new Set(pruned)
  },

  unseenAlerts() {
    const seen = this._seenAlertIds()
    return this.lowStock().filter((p) => !seen.has(p.id))
  },

  markAlertsSeen() {
    write(KEYS.alertsSeen, this.lowStock().map((p) => p.id))
  },

  sales() {
    const session = this.getSession()
    if (!session) return []
    return read(KEYS.sales, [])
      .filter((s) => s.userId === session.id)
      .sort((a, b) => b.createdAt - a.createdAt)
  },

  getSale(id) {
    return this.sales().find((s) => s.id === id) || null
  },

  salesToday() {
    const from = startOfDay()
    return this.sales().filter((s) => s.createdAt >= from)
  },

  createSale(items, note = '') {
    const session = this.getSession()
    if (!items.length) throw new Error('Agrega al menos un producto')
    const allProducts = read(KEYS.products, [])
    for (const item of items) {
      const product = allProducts.find(
        (p) => p.id === item.productId && p.userId === session.id,
      )
      if (!product) throw new Error(`No se encontró ${item.name}`)
      if (product.stock < item.qty) {
        throw new Error(`Stock insuficiente: ${product.name}`)
      }
    }
    for (const item of items) {
      const index = allProducts.findIndex((p) => p.id === item.productId)
      allProducts[index].stock -= item.qty
      allProducts[index].updatedAt = Date.now()
    }
    write(KEYS.products, allProducts)
    const sale = {
      id: uid(),
      userId: session.id,
      items: items.map((item) => ({
        productId: item.productId,
        name: item.name,
        qty: item.qty,
        unitPrice: item.unitPrice,
        subtotal: item.qty * item.unitPrice,
      })),
      total: items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0),
      units: items.reduce((sum, item) => sum + item.qty, 0),
      note: note.trim(),
      createdAt: Date.now(),
    }
    const sales = read(KEYS.sales, [])
    sales.push(sale)
    write(KEYS.sales, sales)
    return sale
  },

  dayStats() {
    const sales = this.salesToday()
    const total = sales.reduce((sum, s) => sum + s.total, 0)
    const units = sales.reduce((sum, s) => sum + s.units, 0)
    const counts = {}
    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (!counts[item.productId]) {
          counts[item.productId] = { name: item.name, qty: 0, total: 0 }
        }
        counts[item.productId].qty += item.qty
        counts[item.productId].total += item.subtotal
      })
    })
    return {
      sales,
      count: sales.length,
      total,
      units,
      average: sales.length ? Math.round(total / sales.length) : 0,
      top: Object.values(counts).sort((a, b) => b.qty - a.qty),
    }
  },

  appendProducts(products) {
    const session = this.getSession()
    const all = read(KEYS.products, [])
    write(
      KEYS.products,
      [
        ...all,
        ...products.map((p) => ({
          ...p,
          id: uid(),
          userId: session.id,
          createdAt: Date.now(),
        })),
      ],
    )
  },

  appendSales(sales) {
    const session = this.getSession()
    const all = read(KEYS.sales, [])
    write(
      KEYS.sales,
      [...all, ...sales.map((s) => ({ ...s, id: uid(), userId: session.id }))],
    )
  },

  saveUser(user) {
    const users = this.getUsers()
    users.push(user)
    write(KEYS.users, users)
  },
}
