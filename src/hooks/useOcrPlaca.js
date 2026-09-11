import { useCallback, useState } from 'react'

// URL provista por el docente. Se lee de la variable de entorno de Vite;
// nunca se escribe la URL ni el código de acceso directamente en el código.
const ENDPOINT = import.meta.env.VITE_OCR_ENDPOINT

// Mensajes para los códigos HTTP que la API puede devolver (ver enunciado, sección
// "Otros estados que deben controlarse").
const MENSAJES_HTTP = {
  400: 'La imagen está vacía, es inválida o tiene dimensiones no permitidas.',
  413: 'La imagen supera el tamaño máximo permitido (4 MiB).',
  415: 'El formato de la imagen no es admitido. Use JPG o PNG.',
  502: 'Falló el servicio de OCR o la consulta a Supabase. Intente nuevamente.',
  504: 'Se agotó el tiempo de espera del servicio. Intente nuevamente.',
}

/**
 * Hook independiente para consumir el endpoint REST de detección de placa.
 * No usa Supabase directamente: solo llama a la API que el docente entrega.
 */
export function useOcrPlaca() {
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState(null)
  const [resultado, setResultado] = useState(null)

  const detectarPlaca = useCallback(async (archivo) => {
    if (!ENDPOINT) {
      setError(
        'No se configuró VITE_OCR_ENDPOINT. Defina la variable de entorno con la URL entregada por el docente.',
      )
      return null
    }
    if (!archivo) {
      setError('No hay ninguna imagen para procesar.')
      return null
    }

    setProcesando(true)
    setError(null)
    setResultado(null)

    try {
      // Importante: se envía el archivo/blob original como cuerpo binario.
      // NO se envuelve en un objeto JSON ni se convierte a Base64 antes de enviarlo.
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': archivo.type || 'application/octet-stream',
        },
        body: archivo,
      })

      if (!response.ok) {
        const mensaje =
          MENSAJES_HTTP[response.status] || `Error del servicio (HTTP ${response.status}).`
        setError(mensaje)
        return null
      }

      const data = await response.json()
      setResultado(data)
      return data
    } catch (err) {
      setError('No se pudo contactar el servicio de reconocimiento. Verifique su conexión.')
      return null
    } finally {
      setProcesando(false)
    }
  }, [])

  const limpiar = useCallback(() => {
    setResultado(null)
    setError(null)
  }, [])

  return { procesando, error, resultado, detectarPlaca, limpiar }
}

export default useOcrPlaca
