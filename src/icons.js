const svg = (path, viewBox = '0 0 24 24') =>
  `<svg viewBox="${viewBox}" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`

export const icons = {
  home: svg(
    '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"/>',
  ),
  box: svg(
    '<path d="M21 8.5 12 3 3 8.5v7L12 21l9-5.5v-7Z"/><path d="M3 8.5 12 14l9-5.5M12 14v7"/>',
  ),
  cart: svg(
    '<circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M3 4h2l.7 3M7 13h10l3-8H6.2M7 13 5.7 7M7 13l-1.2 4h12"/>',
  ),
  clock: svg('<circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 1.5"/>'),
  bell: svg(
    '<path d="M18 16v-5a6 6 0 1 0-12 0v5l-1.5 2h15L18 16Z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
  ),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  minus: svg('<path d="M5 12h14"/>'),
  search: svg('<circle cx="11" cy="11" r="6"/><path d="m20 20-3.5-3.5"/>'),
  chevron: svg('<path d="m9 6 6 6-6 6"/>'),
  back: svg('<path d="M15 6 9 12l6 6"/>'),
  alert: svg(
    '<path d="M12 9v4M12 17h.01"/><path d="m10.2 4.8-7 12A2 2 0 0 0 5 20h14a2 2 0 0 0 1.8-3.2l-7-12a2 2 0 0 0-3.6 0Z"/>',
  ),
  spark: svg(
    '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.2 6.2l2.8 2.8M15 15l2.8 2.8M17.8 6.2 15 9M9 15l-2.8 2.8"/>',
  ),
}

export const logoMark = `
<svg class="logo-mark" viewBox="0 0 64 64" aria-hidden="true">
  <rect width="64" height="64" rx="18" fill="#1a1a1a"/>
  <path d="M18 26 32 18l14 8v16L32 50 18 42V26Z" fill="#c9a227" fill-opacity=".16"/>
  <path d="M18 26 32 34l14-8M32 34v16" stroke="#c9a227" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="m26 27 4.2 4.2L38.5 23" stroke="#9e1b2f" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
