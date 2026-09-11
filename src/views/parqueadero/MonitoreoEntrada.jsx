import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CFormInput,
  CFormLabel,
  CSpinner,
  CAlert,
  CImage,
  CTable,
  CTableBody,
  CTableRow,
  CTableDataCell,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCamera, cilVideo, cilCheckCircle, cilWarning, cilXCircle, cilHome, cilSwapHorizontal } from '@coreui/icons'

const MonitoreoEntrada = () => {
  const navigate = useNavigate()
  const [stream, setStream] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [resultado, setResultado] = useState(null)
  const [isMirrored, setIsMirrored] = useState(false)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch((e) => {
        if (e.name !== 'AbortError') {
          console.error('Error al reproducir video:', e)
        }
      })
    }
  }, [stream])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    setError(null)
    setCapturedImage(null)
    setPreviewUrl(null)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      })
      setStream(mediaStream)
    } catch (err) {
      console.error('Error de cámara:', err)
      setError('No se pudo acceder a la cámara o iVCam. Verifique permisos y conexiones.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')

    if (isMirrored) {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob((blob) => {
      if (blob) {
        setCapturedImage(blob)
        setSelectedFile(null)
        setPreviewUrl(URL.createObjectURL(blob))
        stopCamera()
      }
    }, 'image/jpeg')
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Formato no admitido. Utilice únicamente imágenes JPG o PNG.')
      return
    }

    if (file.size > 4 * 1024 * 1024) {
      setError('La imagen supera el tamaño máximo permitido de 4 MiB (Error 413).')
      return
    }

    stopCamera()
    setError(null)
    setSelectedFile(file)
    setCapturedImage(null)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const detectarPlaca = async () => {
    const archivoAEnviar = capturedImage || selectedFile
    if (!archivoAEnviar) {
      setError('Debe capturar una fotografía o seleccionar un archivo antes de detectar.')
      return
    }

    setLoading(true)
    setError(null)
    setResultado(null)

    try {
      const response = await fetch(import.meta.env.VITE_OCR_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': archivoAEnviar.type || 'application/octet-stream',
        },
        body: archivoAEnviar,
      })

      if (!response.ok) {
        if (response.status === 400) throw new Error('Imagen vacía, inválida o con dimensiones no permitidas (400).')
        if (response.status === 413) throw new Error('La imagen es superior a 4 MiB (413).')
        if (response.status === 415) throw new Error('Formato de imagen no admitido (415).')
        if (response.status === 502) throw new Error('Fallo temporal del servicio OCR o de Supabase (502).')
        if (response.status === 504) throw new Error('Tiempo de espera agotado (504).')
        throw new Error(`Error del servicio (HTTP ${response.status}).`)
      }

      const data = await response.json()
      setResultado(data)
    } catch (err) {
      setError(err.message || 'Ocurrió un error al procesar la solicitud.')
    } finally {
      setLoading(false)
    }
  }

  const reiniciarProceso = () => {
    stopCamera()
    setCapturedImage(null)
    setSelectedFile(null)
    setPreviewUrl(null)
    setResultado(null)
    setError(null)
  }

  // Funciones de parseo blindadas contra objetos anidados
  const parseText = (val) => {
    if (val === null || val === undefined) return 'No disponible'
    if (typeof val === 'object') {
      const resolved = val.nombre || val.cedula || val.text || val.value || val.label || val.placa || val.marca || val.modelo
      if (resolved && typeof resolved !== 'object') return String(resolved)
      try {
        return JSON.stringify(val)
      } catch {
        return 'No disponible'
      }
    }
    return String(val)
  }

  const getSafeUrl = (val) => {
    if (!val) return ''
    if (typeof val === 'string') return val
    if (typeof val === 'object') {
      return val.url || val.secure_url || val.link || val.src || ''
    }
    return String(val)
  }

  const formatConfianza = (val) => {
    if (val === null || val === undefined) return 'No disponible'
    if (typeof val === 'object') {
      val = val.confianza || val.value || val.score || 0
    }
    const num = Number(val)
    if (!isNaN(num)) {
      if (num <= 1) {
        return `${(num * 100).toFixed(1).replace(/\.0$/, '')}%`
      }
      return `${num}%`
    }
    return parseText(val)
  }

  const imagenMarcada = resultado?.imagen_marcada?.base64
    ? `data:${resultado.imagen_marcada.mime_type || 'image/jpeg'};base64,${resultado.imagen_marcada.base64}`
    : null

  const propietarioNombre = parseText(
    resultado?.propietario_nombre ||
    resultado?.vehiculo?.propietario_nombre ||
    resultado?.propietario?.nombre
  )

  const propietarioCedula = parseText(
    resultado?.cedula_propietario ||
    resultado?.vehiculo?.cedula_propietario ||
    resultado?.cedula_enmascarada ||
    resultado?.vehiculo?.cedula_enmascarada ||
    resultado?.propietario?.cedula
  )

  const propietarioFoto = getSafeUrl(
    resultado?.foto_propietario_url ||
    resultado?.vehiculo?.foto_propietario_url ||
    resultado?.propietario?.foto ||
    ''
  )

  return (
    <>
      <div className="mb-3">
        <CButton color="secondary" variant="outline" onClick={() => navigate('/dashboard')} disabled={loading}>
          <CIcon icon={cilHome} className="me-2" /> Volver al Menú Principal
        </CButton>
      </div>

      <CRow>
        <CCol md={6}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Captura del Vehículo</strong>
            </CCardHeader>
            <CCardBody>
              {error && <CAlert color="danger">{error}</CAlert>}

              <div
                className="mb-3 text-center bg-dark rounded p-2 position-relative"
                style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: isMirrored ? 'scaleX(-1)' : 'scaleX(1)',
                    display: stream ? 'block' : 'none',
                  }}
                />

                {!stream && (
                  previewUrl ? (
                    <CImage src={previewUrl} alt="Vista previa" fluid style={{ maxHeight: '240px', objectFit: 'contain', position: 'absolute' }} />
                  ) : (
                    <span className="text-white position-absolute">La cámara está detenida</span>
                  )
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>

              <div className="d-flex flex-wrap gap-2 mb-3">
                {!stream ? (
                  <CButton color="primary" onClick={startCamera} disabled={loading}>
                    <CIcon icon={cilVideo} className="me-2" /> Iniciar cámara (iVCam / Externa)
                  </CButton>
                ) : (
                  <>
                    <CButton color="danger" onClick={stopCamera} disabled={loading}>
                      Detener
                    </CButton>
                    <CButton
                      color="info"
                      variant="outline"
                      onClick={() => setIsMirrored(!isMirrored)}
                      disabled={loading}
                      title="Invertir imagen horizontalmente"
                    >
                      <CIcon icon={cilSwapHorizontal} className="me-1" /> Espejo: {isMirrored ? 'ON' : 'OFF'}
                    </CButton>
                    <CButton color="success" onClick={capturePhoto} disabled={loading} className="ms-auto">
                      <CIcon icon={cilCamera} className="me-2" /> Capturar foto
                    </CButton>
                  </>
                )}
              </div>

              <div className="mb-3">
                <CFormLabel htmlFor="formFile">O seleccionar imagen (JPG / PNG)</CFormLabel>
                <CFormInput type="file" id="formFile" accept="image/jpeg, image/png" onChange={handleFileChange} disabled={loading} />
              </div>

              <div className="d-flex gap-2">
                <CButton color="success" className="w-50" onClick={detectarPlaca} disabled={loading || (!capturedImage && !selectedFile)}>
                  {loading ? <CSpinner size="sm" /> : 'Detectar placa'}
                </CButton>
                <CButton color="secondary" className="w-50" onClick={reiniciarProceso} disabled={loading}>
                  Procesar otra imagen
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={6}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Resultados del Monitoreo</strong>
            </CCardHeader>
            <CCardBody>
              {loading && (
                <div className="text-center py-5">
                  <CSpinner color="primary" />
                  <p className="mt-2">Procesando imagen con el servicio OCR...</p>
                </div>
              )}

              {!loading && !resultado && (
                <p className="text-muted text-center py-5">
                  Enfoque con la cámara, presione «Capturar foto» y luego «Detectar placa».
                </p>
              )}

              {!loading && resultado && (
                <div>
                  {imagenMarcada && (
                    <div className="mb-3 text-center">
                      <CImage
                        src={imagenMarcada}
                        alt="Vehículo con placa detectada"
                        fluid
                        className="rounded border"
                        style={{ maxHeight: '220px' }}
                      />
                    </div>
                  )}

                  {resultado.estado === 'encontrado' && (
                    <div>
                      <CAlert color="success" className="d-flex align-items-center mb-3">
                        <CIcon icon={cilCheckCircle} className="flex-shrink-0 me-2" size="lg" />
                        <div>Vehículo Registrado - Autorizado para el ingreso.</div>
                      </CAlert>
                      <CTable small bordered>
                        <CTableBody>
                          <CTableRow><CTableDataCell><strong>Estado</strong></CTableDataCell><CTableDataCell>Encontrado</CTableDataCell></CTableRow>
                          <CTableRow><CTableDataCell><strong>Placa</strong></CTableDataCell><CTableDataCell>{parseText(resultado.placa)}</CTableDataCell></CTableRow>
                          <CTableRow><CTableDataCell><strong>Confianza</strong></CTableDataCell><CTableDataCell>{formatConfianza(resultado.confianza)}</CTableDataCell></CTableRow>
                          <CTableRow><CTableDataCell><strong>Marca</strong></CTableDataCell><CTableDataCell>{parseText(resultado.vehiculo?.marca)}</CTableDataCell></CTableRow>
                          <CTableRow><CTableDataCell><strong>Modelo</strong></CTableDataCell><CTableDataCell>{parseText(resultado.vehiculo?.modelo)}</CTableDataCell></CTableRow>
                          <CTableRow><CTableDataCell><strong>Año</strong></CTableDataCell><CTableDataCell>{parseText(resultado.vehiculo?.anio)}</CTableDataCell></CTableRow>
                          <CTableRow><CTableDataCell><strong>Color</strong></CTableDataCell><CTableDataCell>{parseText(resultado.vehiculo?.color)}</CTableDataCell></CTableRow>
                          <CTableRow><CTableDataCell><strong>Tipo</strong></CTableDataCell><CTableDataCell>{parseText(resultado.vehiculo?.tipo)}</CTableDataCell></CTableRow>
                          <CTableRow>
                            <CTableDataCell><strong>Propietario</strong></CTableDataCell>
                            <CTableDataCell className="d-flex align-items-center gap-2">
                              {propietarioFoto && (
                                <CImage
                                  src={propietarioFoto}
                                  alt="Propietario"
                                  rounded="circle"
                                  style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                />
                              )}
                              <span>{propietarioNombre}</span>
                            </CTableDataCell>
                          </CTableRow>
                          <CTableRow><CTableDataCell><strong>Cédula</strong></CTableDataCell><CTableDataCell>{propietarioCedula}</CTableDataCell></CTableRow>
                          <CTableRow><CTableDataCell><strong>Autorización</strong></CTableDataCell><CTableDataCell><span className="badge bg-success">Autorizado</span></CTableDataCell></CTableRow>
                        </CTableBody>
                      </CTable>
                    </div>
                  )}

                  {resultado.estado === 'no_registrado' && (
                    <div>
                      <CAlert color="danger" className="d-flex align-items-center mb-3">
                        <CIcon icon={cilXCircle} className="flex-shrink-0 me-2" size="lg" />
                        <div>
                          <strong>VEHÍCULO NO REGISTRADO</strong>
                          <br />No se autoriza el ingreso al parqueadero.
                        </div>
                      </CAlert>
                      <CTable small bordered>
                        <CTableBody>
                          <CTableRow><CTableDataCell><strong>Estado</strong></CTableDataCell><CTableDataCell>No registrado</CTableDataCell></CTableRow>
                          <CTableRow><CTableDataCell><strong>Placa detectada</strong></CTableDataCell><CTableDataCell>{parseText(resultado.placa)}</CTableDataCell></CTableRow>
                          <CTableRow><CTableDataCell><strong>Confianza</strong></CTableDataCell><CTableDataCell>{formatConfianza(resultado.confianza)}</CTableDataCell></CTableRow>
                          <CTableRow><CTableDataCell><strong>Autorización</strong></CTableDataCell><CTableDataCell><span className="badge bg-danger">No autorizado</span></CTableDataCell></CTableRow>
                        </CTableBody>
                      </CTable>
                      <div className="mt-3">
                        <CButton color="secondary" className="w-100" onClick={reiniciarProceso}>
                          Procesar otra imagen
                        </CButton>
                      </div>
                    </div>
                  )}

                  {resultado.estado === 'sin_placa' && (
                    <div>
                      <CAlert color="warning" className="d-flex align-items-center mb-3">
                        <CIcon icon={cilWarning} className="flex-shrink-0 me-2" size="lg" />
                        <div>No se detectó ninguna placa en la imagen.</div>
                      </CAlert>
                      <div className="mt-3">
                        <CButton color="secondary" className="w-100" onClick={reiniciarProceso}>
                          Procesar otra imagen
                        </CButton>
                      </div>
                    </div>
                  )}

                  {resultado.estado === 'baja_confianza' && (
                    <div>
                      <CAlert color="warning" className="d-flex align-items-center mb-3">
                        <CIcon icon={cilWarning} className="flex-shrink-0 me-2" size="lg" />
                        <div>La confianza del OCR es baja. Se recomienda capturar la imagen nuevamente.</div>
                      </CAlert>
                      <div className="mt-3">
                        <CButton color="secondary" className="w-100" onClick={reiniciarProceso}>
                          Procesar otra imagen
                        </CButton>
                      </div>
                    </div>
                  )}

                  {resultado.estado === 'multiples_placas' && (
                    <div>
                      <CAlert color="warning" className="d-flex align-items-center mb-3">
                        <CIcon icon={cilWarning} className="flex-shrink-0 me-2" size="lg" />
                        <div>Se detectaron varias placas en la imagen. Intente con un plano más cerrado.</div>
                      </CAlert>
                      <div className="mt-3">
                        <CButton color="secondary" className="w-100" onClick={reiniciarProceso}>
                          Procesar otra imagen
                        </CButton>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default MonitoreoEntrada
