export function openModal({ title, body, confirmLabel = 'Confirmar', danger = false }) {
  return new Promise((resolve) => {
    const root = document.getElementById('modal-root')
    root.innerHTML = `
      <div class="modal-backdrop" role="dialog" aria-modal="true">
        <div class="modal">
          <h3>${title}</h3>
          <div class="modal__body">${body}</div>
          <div class="modal__actions">
            <button type="button" class="btn btn--ghost" data-modal="no">Cancelar</button>
            <button type="button" class="btn ${danger ? 'btn--danger' : 'btn--primary'}" data-modal="yes">
              ${confirmLabel}
            </button>
          </div>
        </div>
      </div>
    `
    const close = (value) => {
      root.innerHTML = ''
      resolve(value)
    }
    root.querySelector('[data-modal="no"]').addEventListener('click', () => close(false))
    root.querySelector('[data-modal="yes"]').addEventListener('click', () => close(true))
    root.querySelector('.modal-backdrop').addEventListener('click', (event) => {
      if (event.target.classList.contains('modal-backdrop')) close(false)
    })
  })
}
