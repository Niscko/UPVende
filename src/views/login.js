import { db } from '../store/db.js'
import { DEMO, ensureDemoAccount } from '../store/seed.js'
import { logoMark } from '../icons.js'
import { toast } from '../components/toast.js'
import { navigate } from '../navigate.js'

export default {
  render() {
    return `
      <section class="auth">
        <div class="auth__brand">
          ${logoMark}
          <h1>UPVenta</h1>
          <p>Inventario y ventas para tu emprendimiento, en el celular.</p>
        </div>
        <form class="card form" id="login-form">
          <label>Correo<input type="email" name="email" autocomplete="username" required placeholder="tu@correo.com" /></label>
          <label>Clave<input type="password" name="password" autocomplete="current-password" required placeholder="••••••••" /></label>
          <button class="btn btn--primary btn--block" type="submit">Entrar</button>
          <button class="btn btn--ghost btn--block" type="button" id="demo-btn">Probar cuenta demo</button>
        </form>
        <p class="auth__swap">¿Aún no tienes cuenta? <a href="#/registro">Crear cuenta</a></p>
      </section>
    `
  },
  afterRender() {
    document.getElementById('login-form').addEventListener('submit', (event) => {
      event.preventDefault()
      const data = new FormData(event.target)
      try {
        db.login(String(data.get('email')), String(data.get('password')))
        navigate('/inicio')
      } catch (error) {
        toast(error.message, 'error')
      }
    })
    document.getElementById('demo-btn').addEventListener('click', () => {
      ensureDemoAccount()
      db.login(DEMO.email, DEMO.password)
      toast('Entraste con la cuenta demo')
      navigate('/inicio')
    })
  },
}
