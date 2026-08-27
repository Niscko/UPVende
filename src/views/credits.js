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
          <p>Inventario y ventas para un emprendimiento pequeño.</p>
        </div>
        <article class="card">
          <h3>Sesión</h3>
          <p><strong>${escapeHtml(session.name)}</strong></p>
          <p class="muted">${escapeHtml(session.business)}</p>
          <p class="muted">${escapeHtml(session.email)}</p>
        </article>
        <article class="card">
          <h3>Equipo</h3>
          <ul>
            <li>Integrante 1 — rol (completar)</li>
            <li>Integrante 2 — rol (completar)</li>
          </ul>
        </article>
        <article class="card">
          <h3>Curso</h3>
          <p>Aplicaciones móviles — UPB. Entrega 2: App híbrida (SPA Vanilla JS + Vite + SASS).</p>
        </article>
        <article class="card">
          <h3>Datos</h3>
          <p>Todo se guarda en localStorage. La app funciona sin internet y sin base de datos.</p>
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
