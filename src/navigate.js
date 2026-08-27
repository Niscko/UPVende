export function navigate(path) {
  const hash = path.startsWith('#') ? path : `#${path.startsWith('/') ? path : `/${path}`}`
  if (window.location.hash === hash) {
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    return
  }
  window.location.hash = hash
}

export function currentPath() {
  const raw = window.location.hash.replace(/^#/, '') || '/inicio'
  return raw.startsWith('/') ? raw : `/${raw}`
}
