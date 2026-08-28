import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { CCard, CCardBody, CCardHeader, CCol, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow, CBadge } from '@coreui/react'

export default function HistorialAcceso() {
  const [registros, setRegistros] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistorial = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('registros_estacionamiento')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error && data) {
        setRegistros(data)
      }
      setLoading(false)
    }

    fetchHistorial()
  }, [])

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4 shadow-sm border-0">
          <CCardHeader className="bg-dark text-white fw-bold">
            Registro de Ocupación e Historial
          </CCardHeader>
          <CCardBody>
            {loading ? (
              <p className="text-center py-4">Cargando registros...</p>
            ) : (
              <div className="table-responsive">
                <CTable align="middle" hover bordered className="mb-0 text-sm">
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell>Fecha y Hora</CTableHeaderCell>
                      <CTableHeaderCell>Placa Detectada</CTableHeaderCell>
                      <CTableHeaderCell>Código Registro</CTableHeaderCell>
                      <CTableHeaderCell>Estado</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {registros.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan="4" className="text-center text-muted py-4">
                          No hay registros disponibles
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      registros.map((reg) => (
                        <CTableRow key={reg.id}>
                          <CTableDataCell>{reg.created_at ? new Date(reg.created_at).toLocaleString() : 'N/D'}</CTableDataCell>
                          <CTableDataCell className="fw-bold">{reg.placa_detectada || 'N/A'}</CTableDataCell>
                          <CTableDataCell>{reg.codigo_registro || 'N/A'}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={reg.estado === 'Ocupado' ? 'danger' : 'success'}>
                              {reg.estado || 'Registrado'}
                            </CBadge>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    )}
                  </CTableBody>
                </CTable>
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}