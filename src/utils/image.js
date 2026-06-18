// Reads an image File, downscales it, and returns a Blob ready to upload.
// `mime` defaults to JPEG (for photos); pass 'image/png' to keep transparency
// (used for stamps). Resizing keeps files reasonably sized.
export function fileToResizedBlob(file, { maxSize = 1600, quality = 0.85, mime = 'image/jpeg' } = {}) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error(`${file.name} is not an image`))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Could not decode image'))
      img.onload = () => {
        let { width, height } = img
        if (width > maxSize || height > maxSize) {
          const scale = Math.min(maxSize / width, maxSize / height)
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('Could not encode image'))),
          mime,
          quality,
        )
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
