import React, { useState, useEffect, useCallback } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CSpinner,
  CAlert,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilHistory, cilReload } from '@coreui/icons'
import { supabase } from '../../../lib/supabase'

const HistorialAcceso = () => {
  const [registros, setRegistros] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRegistros = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('registros_estacionamiento')
        .select('*')
        .order('fecha_entrada', { ascending: false })
        .limit(100)

      if (fetchError) throw fetchError
      setRegistros(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRegistros()
  }, [fetchRegistros])

  return (
    <CCard className="mb-4 shadow-sm">
      <CCardHeader className="d-flex justify-content-between align-items-center bg-primary text-white">
        <h5 className="mb-0 d-flex align-items-center gap-2">
          <CIcon icon={cilHistory} /> Historial de Registros de Estacionamiento
        </h5>
        <CButton color="light" variant="outline" size="sm" onClick={fetchRegistros}>
          <CIcon icon={cilReload} /> Refrescar Registros
        </CButton>
      </CCardHeader>

      <CCardBody>
        {error && <CAlert color="danger">{error}</CAlert>}

        {loading ? (
          <div className="text-center my-4">
            <CSpinner color="primary" />
          </div>
        ) : (
          <CTable align="middle" hover responsive striped className="border">
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell>Cód. Registro</CTableHeaderCell>
                <CTableHeaderCell>Placa Detectada</CTableHeaderCell>
                <CTableHeaderCell>Puesto ID</CTableHeaderCell>
                <CTableHeaderCell>Entrada / Salida</CTableHeaderCell>
                <CTableHeaderCell>Duración</CTableHeaderCell>
                <CTableHeaderCell>Dist. Entrada</CTableHeaderCell>
                <CTableHeaderCell>Estado</CTableHeaderCell>
                <CTableHeaderCell>Observación</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {registros.length > 0 ? (
                registros.map((r) => {
                  const isFinalizado = r.estado?.toUpperCase() === 'FINALIZADO'
                  const isActivo = r.estado?.toUpperCase() === 'ACTIVO'

                  return (
                    <CTableRow key={r.id}>
                      <CTableDataCell>
                        <small className="font-monospace fw-bold">{r.codigo_registro || `#${r.id}`}</small>
                      </CTableDataCell>
                      <CTableDataCell>
                        <span className="badge bg-dark text-white font-monospace">
                          {r.placa_detectada || 'N/A'}
                        </span>
                      </CTableDataCell>
                      <CTableDataCell>
                        <small className="font-monospace">Puesto #{r.puesto_id || 'N/A'}</small>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="small font-monospace">
                          <strong>Entrada:</strong> {r.fecha_entrada ? new Date(r.fecha_entrada).toLocaleString() : 'N/A'}
                        </div>
                        {r.fecha_salida && (
                          <div className="small font-monospace text-muted">
                            <strong>Salida:</strong> {new Date(r.fecha_salida).toLocaleString()}
                          </div>
                        )}
                      </CTableDataCell>
                      <CTableDataCell>
                        <small className="font-monospace">
                          {r.duracion_minutos != null ? `${r.duracion_minutos} min` : 'En curso'}
                        </small>
                      </CTableDataCell>
                      <CTableDataCell>
                        <span className="badge bg-light text-dark font-monospace border">
                          {r.distancia_cm_entrada != null ? `${r.distancia_cm_entrada} cm` : 'N/A'}
                        </span>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={isActivo ? 'warning' : isFinalizado ? 'success' : 'secondary'}>
                          {r.estado ? r.estado.toUpperCase() : 'N/A'}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <small className="text-muted">{r.observacion || '-'}</small>
                      </CTableDataCell>
                    </CTableRow>
                  )
                })
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan="8" className="text-center py-4 text-muted">
                    No existen registros de estacionamiento guardados.
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
  )
}

export default HistorialAcceso