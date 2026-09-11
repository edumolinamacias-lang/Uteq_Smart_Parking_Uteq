import React, { useState } from 'react'

export default function MonitoreoEntrada() {
  const [loading, setLoading] = useState(false)
  const [resultadoOCR, setResultadoOCR] = useState(null)
  const [error, setError] = useState(null)

  const handleArchivoSeleccionado = async (e) => {
    const archivo = e.target.files[0]
    if (!archivo) return

    setLoading(true)
    setError(null)
    setResultadoOCR(null)

    try {
      const resultado = await enviarImagenOCR(archivo)
      setResultadoOCR(resultado)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function enviarImagenOCR(archivo) {
    let blobAEnviar = archivo
    let contentType = archivo.type

    // Normaliza formatos no admitidos (como WebP) convirtiéndolos a JPEG vía Canvas
    if (!['image/jpeg', 'image/png', 'application/octet-stream'].includes(archivo.type)) {
      blobAEnviar = await convertirAJpeg(archivo)
      contentType = 'image/jpeg'
    }

    const response = await fetch(import.meta.env.VITE_OCR_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
      },
      body: blobAEnviar,
    })

    if (!response.ok) {
      throw new Error(`Error en el servidor: ${response.status} (${response.statusText})`)
    }

    return await response.json()
  }

  function convertirAJpeg(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0)
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob)
              else reject(new Error('Fallo al convertir la imagen a Blob'))
            },
            'image/jpeg',
            0.9
          )
        }
        img.onerror = reject
        img.src = e.target.result
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="p-6 bg-slate-900 text-white min-h-screen">
      <h1 className="text-xl font-bold mb-4">Monitoreo de entrada</h1>

      <div className="mb-4">
        <label className="block mb-2 text-sm text-slate-300">
          O seleccionar imagen (JPG / PNG)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleArchivoSeleccionado}
          className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-violet-600 file:text-white hover:file:bg-violet-700 cursor-pointer"
        />
      </div>

      {loading && <p className="text-yellow-400 animate-pulse">Procesando imagen y enviando OCR...</p>}
      {error && <p className="text-red-400 bg-red-950/50 p-3 rounded border border-red-800">Error: {error}</p>}

      {resultadoOCR && (
        <div className="mt-4 p-4 bg-slate-800 rounded border border-slate-700">
          <h3 className="font-semibold mb-2 text-emerald-400">Resultado OCR Exitoso:</h3>
          <pre className="text-xs bg-slate-950 p-3 rounded overflow-x-auto text-slate-200">
            {JSON.stringify(resultadoOCR, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
