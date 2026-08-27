import { parseAmount, startOfDay, uid } from '../utils.js'

const KEYS = {
  users: 'upventa_users',
  session: 'upventa_session',
  products: 'upventa_products',
  sales: 'upventa_sales',
  alertsSeen: 'upventa_alerts_seen',
  dayGoals: 'upventa_day_goals',
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
      role: user.role || 'worker',
    })
  },

  isAdmin() {
    return this.getSession()?.role === 'admin'
  },

  logout() {
    localStorage.removeItem(KEYS.session)
  },

  getUsers() {
    return read(KEYS.users, []).map((user) => ({
      ...user,
      role: user.role || 'worker',
    }))
  },

  getUser(id) {
    return this.getUsers().find((u) => u.id === id) || null
  },

  workers() {
    return this.getUsers()
      .filter((u) => u.role !== 'admin')
      .sort((a, b) => a.name.localeCompare(b.name, 'es'))
  },

  updateUser(user) {
    const users = read(KEYS.users, [])
    const index = users.findIndex((u) => u.id === user.id)
    if (index < 0) return
    users[index] = { ...users[index], ...user }
    write(KEYS.users, users)
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
      role: 'worker',
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

  productsOf(userId) {
    return read(KEYS.products, [])
      .filter((p) => p.userId === userId)
      .sort((a, b) => a.name.localeCompare(b.name, 'es'))
  },

  products() {
    const session = this.getSession()
    if (!session) return []
    if (this.isAdmin()) {
      return read(KEYS.products, []).sort((a, b) => a.name.localeCompare(b.name, 'es'))
    }
    return this.productsOf(session.id)
  },

  getProduct(id) {
    const product = read(KEYS.products, []).find((p) => p.id === id) || null
    if (!product) return null
    const session = this.getSession()
    if (this.isAdmin()) return product
    return product.userId === session?.id ? product : null
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

  lowStockOf(userId) {
    return this.productsOf(userId).filter((p) => p.stock <= p.minStock)
  },

  lowStock() {
    if (this.isAdmin()) {
      return this.workers().flatMap((worker) =>
        this.lowStockOf(worker.id).map((p) => ({
          ...p,
          workerName: worker.name,
          workerBusiness: worker.business,
        })),
      )
    }
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

  salesOf(userId) {
    return read(KEYS.sales, [])
      .filter((s) => s.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt)
  },

  sales() {
    const session = this.getSession()
    if (!session) return []
    const withWorker = (sale) => {
      const worker = this.getUser(sale.userId)
      return {
        ...sale,
        workerName: worker?.name || 'Trabajador',
        workerBusiness: worker?.business || '',
      }
    }
    if (this.isAdmin()) {
      return read(KEYS.sales, [])
        .map(withWorker)
        .sort((a, b) => b.createdAt - a.createdAt)
    }
    return this.salesOf(session.id).map(withWorker)
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

  getDayGoal() {
    const session = this.getSession()
    if (!session) return 0
    return this.dayGoalOf(session.id)
  },

  dayGoalOf(userId) {
    const goals = read(KEYS.dayGoals, {})
    return Number(goals[userId]) || 0
  },

  setDayGoal(amount) {
    const session = this.getSession()
    if (!session) return
    return this.setDayGoalFor(session.id, amount)
  },

  setDayGoalFor(userId, amount) {
    const goals = read(KEYS.dayGoals, {})
    const value = parseAmount(amount)
    if (value) goals[userId] = value
    else delete goals[userId]
    write(KEYS.dayGoals, goals)
    return value
  },

  workerSnapshot(userId) {
    const user = this.getUser(userId)
    if (!user || user.role === 'admin') return null
    const stats = this.dayStatsOf(userId)
    const goal = this.dayGoalOf(userId)
    const products = this.productsOf(userId)
    const alerts = this.lowStockOf(userId)
    const sales = this.salesOf(userId)
    return {
      user,
      stats,
      goal,
      pct: goal ? Math.min(100, Math.round((stats.total / goal) * 100)) : 0,
      products,
      alerts,
      sales,
    }
  },

  teamOverview() {
    const workers = this.workers().map((w) => this.workerSnapshot(w.id)).filter(Boolean)
    return {
      workers,
      todayTotal: workers.reduce((sum, w) => sum + w.stats.total, 0),
      todayCount: workers.reduce((sum, w) => sum + w.stats.count, 0),
      todayUnits: workers.reduce((sum, w) => sum + w.stats.units, 0),
      alerts: workers.reduce((sum, w) => sum + w.alerts.length, 0),
    }
  },

  dayStatsOf(userId) {
    return this._statsFromSales(this.salesOf(userId).filter((s) => s.createdAt >= startOfDay()))
  },

  dayStats() {
    return this._statsFromSales(this.salesToday())
  },

  _statsFromSales(sales) {
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

  // Estadísticas de los últimos N días EN LOS QUE HUBO VENTAS (no días de calendario).
  recentDaysStats(days = 10) {
    const byDay = new Map()
    // this.sales() viene de más reciente a más antiguo → los días entran en ese orden
    for (const sale of this.sales()) {
      const key = startOfDay(new Date(sale.createdAt))
      if (!byDay.has(key)) byDay.set(key, { day: key, total: 0, count: 0, units: 0 })
      const d = byDay.get(key)
      d.total += sale.total
      d.count += 1
      d.units += sale.units
    }
    const list = [...byDay.values()].slice(0, days)
    return {
      list,
      total: list.reduce((sum, d) => sum + d.total, 0),
      count: list.reduce((sum, d) => sum + d.count, 0),
      max: list.reduce((m, d) => Math.max(m, d.total), 0) || 1,
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
