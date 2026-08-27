import { db } from './db.js'
import { uid } from '../utils.js'

export const DEMO = {
  email: 'demo@upventa.app',
  password: 'demo123',
}

const sampleProducts = [
  { name: 'Brownie de chocolate', category: 'postres', price: 8000, stock: 12, minStock: 4, unit: 'und' },
  { name: 'Cheesecake de frutos', category: 'postres', price: 12000, stock: 6, minStock: 3, unit: 'und' },
  { name: 'Galletas de avena x4', category: 'postres', price: 4500, stock: 24, minStock: 8, unit: 'paq' },
  { name: 'Camiseta oversized', category: 'ropa', price: 45000, stock: 8, minStock: 3, unit: 'und' },
  { name: 'Tote bag de lona', category: 'ropa', price: 28000, stock: 3, minStock: 3, unit: 'und' },
  { name: 'Aretes de perla', category: 'accesorios', price: 18000, stock: 15, minStock: 4, unit: 'par' },
  { name: 'Collar minimal', category: 'accesorios', price: 22000, stock: 2, minStock: 3, unit: 'und' },
  { name: 'Scrunchie pack x3', category: 'accesorios', price: 9000, stock: 20, minStock: 6, unit: 'paq' },
]

export function sampleCatalog() {
  return sampleProducts.map((p) => ({ ...p }))
}

export function ensureDemoAccount() {
  const users = db.getUsers()
  let user = users.find((u) => u.email === DEMO.email)
  if (!user) {
    user = {
      id: uid(),
      name: 'Camila Restrepo',
      email: DEMO.email,
      password: DEMO.password,
      business: 'Dulce & Tela',
      createdAt: Date.now(),
    }
    db.saveUser(user)
  }
  db.setSession(user)
  if (db.products().length === 0) {
    db.appendProducts(sampleCatalog())
    const products = db.products()
    const brownie = products.find((p) => p.name.includes('Brownie'))
    const galletas = products.find((p) => p.name.includes('Galletas'))
    const aretes = products.find((p) => p.name.includes('Aretes'))
    const now = Date.now()
    const sales = []
    if (brownie && galletas) {
      sales.push({
        items: [
          { productId: brownie.id, name: brownie.name, qty: 2, unitPrice: brownie.price, subtotal: brownie.price * 2 },
          { productId: galletas.id, name: galletas.name, qty: 1, unitPrice: galletas.price, subtotal: galletas.price },
        ],
        total: brownie.price * 2 + galletas.price,
        units: 3,
        note: 'Pedido WhatsApp',
        createdAt: now - 1000 * 60 * 40,
      })
    }
    if (aretes) {
      sales.push({
        items: [
          { productId: aretes.id, name: aretes.name, qty: 1, unitPrice: aretes.price, subtotal: aretes.price },
        ],
        total: aretes.price,
        units: 1,
        note: '',
        createdAt: now - 1000 * 60 * 12,
      })
    }
    if (sales.length) {
      db.appendSales(sales)
      if (brownie) db.addStock(brownie.id, -2)
      if (galletas) db.addStock(galletas.id, -1)
      if (aretes) db.addStock(aretes.id, -1)
    }
  }
  return user
}
