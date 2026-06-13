// Generación de imágenes para compartir sin dependencias externas.
//
// La técnica: se serializa un nodo del DOM dentro de un <foreignObject> de SVG,
// se rasteriza ese SVG sobre un <canvas> y se exporta como PNG. Funciona siempre
// que el nodo use SOLO estilos en línea y SVG en línea (sin variables CSS ni
// hojas de estilo externas), porque el <foreignObject> se renderiza aislado del
// documento. La tarjeta de ShareableMatchCard cumple esa condición.

// Convierte un nodo del DOM en un Blob PNG.
export async function nodeToPngBlob(
  node,
  { width, height, scale = 2.5, background = '#0b0b0c' } = {},
) {
  if (!node) throw new Error('Nodo no disponible para la captura')

  const w = width ?? node.offsetWidth
  const h = height ?? node.offsetHeight
  if (!w || !h) throw new Error('El nodo no tiene dimensiones medibles')

  // Se serializa el subárbol vivo: así el navegador conserva los espacios de
  // nombres correctos de los SVG (banderas, logo) y los estilos en línea.
  const serialized = new XMLSerializer().serializeToString(node)

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
    `<foreignObject x="0" y="0" width="100%" height="100%">` +
    `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${w}px;height:${h}px;">` +
    serialized +
    `</div></foreignObject></svg>`

  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)

  const img = new Image()
  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = () => reject(new Error('No se pudo rasterizar la imagen'))
    img.src = url
  })
  // En Safari/iOS conviene asegurar que la imagen quedó decodificada antes de
  // dibujarla; de lo contrario el canvas puede salir en blanco.
  if (typeof img.decode === 'function') {
    try {
      await img.decode()
    } catch {
      /* onload ya resolvió; se continúa con lo disponible */
    }
  }

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(w * scale)
  canvas.height = Math.round(h * scale)
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)
  ctx.fillStyle = background
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(img, 0, 0, w, h)

  const blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('No se pudo exportar el PNG'))),
      'image/png',
      0.95,
    ),
  )
  return blob
}

// Comparte (Web Share API con archivos) o descarga la imagen como respaldo.
// Devuelve la acción realizada: 'shared' | 'downloaded'. Lanza con name
// 'AbortError' si la persona cancela el diálogo nativo de compartir.
export async function shareOrDownloadImage(blob, { fileName, title, text } = {}) {
  const name = fileName || 'la-copa-familiar.png'
  const file = new File([blob], name, { type: 'image/png' })

  // En celulares con soporte para compartir archivos, se abre la hoja nativa
  // (WhatsApp, Instagram, X, etc.). Es el camino esperado en redes sociales.
  if (
    typeof navigator !== 'undefined' &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    await navigator.share({ files: [file], title, text })
    return 'shared'
  }

  // Respaldo de escritorio: descarga directa del PNG.
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return 'downloaded'
}
