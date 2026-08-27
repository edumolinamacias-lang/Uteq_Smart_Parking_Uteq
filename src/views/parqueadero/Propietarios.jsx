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
  CAvatar,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPeople, cilReload } from '@coreui/icons'
import { supabase } from '../../lib/supabase'

const Propietarios = () => {
  const [propietarios, setPropietarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPropietarios = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Consultamos directamente de la tabla 'vehiculos' donde ya residen los datos
      const { data, error: fetchError } = await supabase
        .from('vehiculos')
        .select(`
          id,
          propietario_nombre,
          cedula_enmascarada,
          correo_institucional,
          foto_propietario_url,
          autorizado,
          placa,
          marca,
          modelo
        `)
        .order('propietario_nombre', { ascending: true })

      if (fetchError) throw fetchError
      setPropietarios(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPropietarios()
  }, [fetchPropietarios])

  return (
    <CCard className="mb-4 shadow-sm">
      <CCardHeader className="d-flex justify-content-between align-items-center bg-primary text-white">
        <h5 className="mb-0 d-flex align-items-center gap-2">
          <CIcon icon={cilPeople} /> Registro de Propietarios (UTEQ)
        </h5>
        <CButton color="light" variant="outline" size="sm" onClick={fetchPropietarios}>
          <CIcon icon={cilReload} /> Refrescar
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
                <CTableHeaderCell className="text-center">Perfil</CTableHeaderCell>
                <CTableHeaderCell>Nombre del Propietario</CTableHeaderCell>
                <CTableHeaderCell>Cédula</CTableHeaderCell>
                <CTableHeaderCell>Correo Institucional</CTableHeaderCell>
                <CTableHeaderCell>Vehículo Asociado</CTableHeaderCell>
                <CTableHeaderCell>Estado Acceso</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {propietarios.length > 0 ? (
                propietarios.map((item) => (
                  <CTableRow key={item.id}>
                    <CTableDataCell className="text-center">
                      <CAvatar
                        src={item.foto_propietario_url || 'https://placehold.co/100x100?text=User'}
                        size="md"
                        status={item.autorizado ? 'success' : 'danger'}
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="fw-semibold">{item.propietario_nombre || 'Sin Registro'}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <small className="font-monospace">{item.cedula_enmascarada || 'N/A'}</small>
                    </CTableDataCell>
                    <CTableDataCell>
                      <small>{item.correo_institucional || 'N/A'}</small>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color="info" className="font-monospace text-dark me-1 mb-1">
                        {item.placa} ({item.marca} {item.modelo})
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      {item.autorizado ? (
                        <CBadge color="success">Habilitado</CBadge>
                      ) : (
                        <CBadge color="danger">Inhabilitado</CBadge>
                      )}
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan="6" className="text-center py-4 text-muted">
                    No existen propietarios registrados.
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

export default Propietarios