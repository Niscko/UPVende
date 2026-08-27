import { db } from '../store/db.js'
import { logoMark } from '../icons.js'
import { toast } from '../components/toast.js'
import { navigate } from '../navigate.js'

export default {
  render() {
    return `
      <section class="auth">
        <div class="auth__brand">
          ${logoMark}
          <h1>Crea tu cuenta</h1>
          <p>Regístrate para llevar el control de tu inventario y tus ventas.</p>
        </div>
        <form class="card form" id="register-form">
          <label>Tu nombre<input type="text" name="name" required maxlength="40" placeholder="Camila Restrepo" /></label>
          <label>Nombre del emprendimiento<input type="text" name="business" required maxlength="40" placeholder="Dulce & Tela" /></label>
          <label>Correo<input type="email" name="email" required placeholder="tu@correo.com" /></label>
          <label>Clave<input type="password" name="password" required minlength="4" placeholder="Mínimo 4 caracteres" /></label>
          <button class="btn btn--primary btn--block" type="submit">Crear cuenta</button>
        </form>
        <p class="auth__swap">¿Ya tienes cuenta? <a href="#/login">Entrar</a></p>
      </section>
    `
  },
  afterRender() {
    document.getElementById('register-form').addEventListener('submit', (event) => {
      event.preventDefault()
      const data = new FormData(event.target)
      try {
        db.register({
          name: String(data.get('name')),
          business: String(data.get('business')),
          email: String(data.get('email')),
          password: String(data.get('password')),
        })
        toast('Cuenta lista. Ya puedes registrar productos')
        navigate('/inicio')
      } catch (error) {
        toast(error.message, 'error')
      }
    })
  },
}
