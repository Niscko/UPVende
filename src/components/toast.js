let timer

export function toast(message, type = 'ok') {
  const root = document.getElementById('toast-root')
  if (!root) return
  root.innerHTML = `
    <div class="toast toast--${type}" role="status">
      <p>${message}</p>
    </div>
  `
  clearTimeout(timer)
  timer = setTimeout(() => {
    root.innerHTML = ''
  }, 2600)
}
