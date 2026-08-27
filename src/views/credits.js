import { db } from '../store/db.js'
import { logoMark } from '../icons.js'
import { escapeHtml } from '../utils.js'
import { navigate } from '../navigate.js'

export default {
  title: 'Créditos',
  render() {
    const session = db.getSession()
    return `
      <section class="page credits">
        <div class="credits__brand">
          ${logoMark}
          <h2>UPVenta</h2>
          <p>Inventario y ventas para emprendedores de la UPB.</p>
        </div>
        <article class="card">
          <h3>Sesión</h3>
          <p><strong>${escapeHtml(session.name)}</strong></p>
          <p class="muted">${escapeHtml(session.business)}</p>
          <p class="muted">${escapeHtml(session.email)}</p>
        </article>
        <article class="card">
          <h3>Autores</h3>
          <ul class="authors">
            <li>
              <strong>Sebastián Muñoz Castañeda</strong>
              <span class="muted">Diseño de interfaz y experiencia de usuario</span>
            </li>
            <li>
              <strong>Nicolás Agudelo Mesa</strong>
              <span class="muted">Desarrollo y arquitectura de la aplicación</span>
            </li>
          </ul>
        </article>
        <button class="btn btn--ghost btn--block" id="logout" type="button">Cerrar sesión</button>
      </section>
    `
  },
  afterRender() {
    document.getElementById('logout').addEventListener('click', () => {
      db.logout()
      navigate('/login')
    })
  },
}
