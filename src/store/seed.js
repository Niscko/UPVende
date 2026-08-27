import { db } from './db.js'
import { uid } from '../utils.js'

export const DEMO = {
  email: 'demo@upventa.app',
  password: 'demo123',
}

export const ADMIN = {
  email: 'admin@upventa.app',
  password: 'admin123',
}

const sampleProducts = [
  { name: 'Brownie de chocolate', category: 'comida', price: 8000, stock: 12, minStock: 4, unit: 'und' },
  { name: 'Cheesecake de frutos', category: 'comida', price: 12000, stock: 6, minStock: 3, unit: 'und' },
  { name: 'Galletas de avena x4', category: 'comida', price: 4500, stock: 24, minStock: 8, unit: 'paq' },
  { name: 'Camiseta oversized', category: 'ropa', price: 45000, stock: 8, minStock: 3, unit: 'und' },
  { name: 'Tote bag de lona', category: 'ropa', price: 28000, stock: 3, minStock: 3, unit: 'und' },
  { name: 'Aretes de perla', category: 'accesorios', price: 18000, stock: 15, minStock: 4, unit: 'par' },
  { name: 'Collar minimal', category: 'accesorios', price: 22000, stock: 2, minStock: 3, unit: 'und' },
  { name: 'Scrunchie pack x3', category: 'accesorios', price: 9000, stock: 20, minStock: 6, unit: 'paq' },
]

const cafeProducts = [
  { name: 'Tinto', category: 'comida', price: 2500, stock: 40, minStock: 10, unit: 'und' },
  { name: 'Cappuccino', category: 'comida', price: 6000, stock: 18, minStock: 5, unit: 'und' },
  { name: 'Almojábana', category: 'comida', price: 3500, stock: 8, minStock: 6, unit: 'und' },
  { name: 'Brownie de café', category: 'comida', price: 5000, stock: 2, minStock: 4, unit: 'und' },
]

const stickerProducts = [
  { name: 'Sticker laptop UPB', category: 'accesorios', price: 4000, stock: 30, minStock: 8, unit: 'und' },
  { name: 'Pack x5 frases', category: 'accesorios', price: 15000, stock: 6, minStock: 3, unit: 'paq' },
  { name: 'Pin esmaltado', category: 'accesorios', price: 12000, stock: 4, minStock: 4, unit: 'und' },
]

export function sampleCatalog() {
  return sampleProducts.map((p) => ({ ...p }))
}

function ensureUser({ name, email, password, business, role }) {
  const users = db.getUsers()
  let user = users.find((u) => u.email === email)
  if (!user) {
    user = {
      id: uid(),
      name,
      email,
      password,
      business,
      role,
      createdAt: Date.now(),
    }
    db.saveUser(user)
    return user
  }
  if (user.role !== role) {
    user = { ...user, role }
    db.updateUser(user)
  }
  return user
}

function seedSales(userId, find, recipes, now) {
  const sales = recipes
    .map((recipe) => {
      const items = recipe.items
        .map((line) => {
          const product = find(line.match)
          if (!product) return null
          return {
            productId: product.id,
            name: product.name,
            qty: line.qty,
            unitPrice: product.price,
            subtotal: product.price * line.qty,
          }
        })
        .filter(Boolean)
      if (!items.length) return null
      return {
        items,
        total: items.reduce((sum, i) => sum + i.subtotal, 0),
        units: items.reduce((sum, i) => sum + i.qty, 0),
        note: recipe.note || '',
        createdAt: now - recipe.ago,
      }
    })
    .filter(Boolean)
  if (sales.length) db.appendSales(sales, userId)
  recipes.forEach((recipe) => {
    recipe.items.forEach((line) => {
      const product = find(line.match)
      if (product) db.adjustStock(product.id, -line.qty)
    })
  })
}

function seedWorker(spec) {
  const user = ensureUser(spec)
  if (db.productsOf(user.id).length === 0) {
    db.appendProducts(spec.catalog.map((p) => ({ ...p })), user.id)
    const products = db.productsOf(user.id)
    const find = (match) => products.find((p) => p.name.includes(match))
    seedSales(user.id, find, spec.sales, Date.now())
  }
  if (!db.dayGoalOf(user.id) && spec.goal) db.setDayGoalFor(user.id, spec.goal)
  return user
}

export function ensureTeam() {
  const admin = ensureUser({
    name: 'Laura Vélez',
    email: ADMIN.email,
    password: ADMIN.password,
    business: 'Coordinación campus',
    role: 'admin',
  })

  const camila = seedWorker({
    name: 'Camila Restrepo',
    email: DEMO.email,
    password: DEMO.password,
    business: 'Dulce & Tela',
    role: 'worker',
    catalog: sampleProducts,
    goal: 50000,
    sales: [
      {
        ago: 1000 * 60 * 40,
        note: 'Pedido WhatsApp',
        items: [
          { match: 'Brownie', qty: 2 },
          { match: 'Galletas', qty: 1 },
        ],
      },
      {
        ago: 1000 * 60 * 12,
        note: '',
        items: [{ match: 'Aretes', qty: 1 }],
      },
    ],
  })

  const andres = seedWorker({
    name: 'Andrés Mora',
    email: 'andres@upventa.app',
    password: DEMO.password,
    business: 'Café del 9',
    role: 'worker',
    catalog: cafeProducts,
    goal: 60000,
    sales: [
      {
        ago: 1000 * 60 * 90,
        note: 'Mesa 2',
        items: [
          { match: 'Cappuccino', qty: 2 },
          { match: 'Tinto', qty: 1 },
        ],
      },
      {
        ago: 1000 * 60 * 25,
        note: '',
        items: [
          { match: 'Almojábana', qty: 3 },
          { match: 'Brownie', qty: 1 },
        ],
      },
    ],
  })

  const valentina = seedWorker({
    name: 'Valentina Ruiz',
    email: 'vale@upventa.app',
    password: DEMO.password,
    business: 'Stickers UPB',
    role: 'worker',
    catalog: stickerProducts,
    goal: 40000,
    sales: [
      {
        ago: 1000 * 60 * 55,
        note: 'Feria de emprendimiento',
        items: [
          { match: 'Sticker', qty: 4 },
          { match: 'Pack', qty: 1 },
        ],
      },
    ],
  })

  return { admin, camila, andres, valentina }
}

export function ensureDemoAccount() {
  const { camila } = ensureTeam()
  db.setSession(camila)
  return camila
}

export function ensureAdminAccount() {
  const { admin } = ensureTeam()
  db.setSession(admin)
  return admin
}
