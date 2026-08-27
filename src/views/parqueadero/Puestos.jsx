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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CSpinner,
  CAlert,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash, cilReload, cilGrid } from '@coreui/icons'
import { supabase } from '../../../lib/supabase'

const initialForm = {
  codigo: '',
  columna: 'A',
  numero: '',
  sensor_id_rtdb: '',
  ruta_firebase: '',
  estado: 'LIBRE',
  distancia_cm: 0,
}

const Puestos = () => {
  const [puestos, setPuestos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(initialForm)
  const [saving, setSaving] = useState(false)

  const fetchPuestos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('puestos')
        .select('*')
        .order('id', { ascending: true })

      if (fetchError) throw fetchError
      setPuestos(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPuestos()
  }, [fetchPuestos])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const openCreateModal = () => {
    setEditingId(null)
    setFormData(initialForm)
    setModalVisible(true)
  }

  const openEditModal = (item) => {
    setEditingId(item.id)
    setFormData({
      codigo: item.codigo || '',
      columna: item.columna || 'A',
      numero: item.numero || '',
      sensor_id_rtdb: item.sensor_id_rtdb || '',
      ruta_firebase: item.ruta_firebase || '',
      estado: item.estado || 'LIBRE',
      distancia_cm: item.distancia_cm || 0,
    })
    setModalVisible(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        codigo: formData.codigo,
        columna: formData.columna,
        numero: formData.numero ? parseInt(formData.numero, 10) : null,
        sensor_id_rtdb: formData.sensor_id_rtdb,
        ruta_firebase: formData.ruta_firebase,
        estado: formData.estado,
        distancia_cm: formData.distancia_cm ? parseFloat(formData.distancia_cm) : 0,
        ultima_actualizacion: new Date().toISOString(),
      }

      if (editingId) {
        const { error: updateError } = await supabase
          .from('puestos')
          .update(payload)
          .eq('id', editingId)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('puestos')
          .insert([payload])
        if (insertError) throw insertError
      }

      setModalVisible(false)
      fetchPuestos()
    } catch (err) {
      alert(`Error al guardar: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este puesto?')) return
    try {
      const { error: deleteError } = await supabase
        .from('puestos')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      fetchPuestos()
    } catch (err) {
      alert(`Error al eliminar: ${err.message}`)
    }
  }

  return (
    <CCard className="mb-4 shadow-sm">
      <CCardHeader className="d-flex justify-content-between align-items-center bg-primary text-white">
        <h5 className="mb-0 d-flex align-items-center gap-2">
          <CIcon icon={cilGrid} /> Gestión de Puestos de Estacionamiento
        </h5>
        <div className="d-flex gap-2">
          <CButton color="light" variant="outline" size="sm" onClick={fetchPuestos}>
            <CIcon icon={cilReload} /> Refrescar
          </CButton>
          <CButton color="success" className="text-white" size="sm" onClick={openCreateModal}>
            <CIcon icon={cilPlus} /> Nuevo Puesto
          </CButton>
        </div>
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
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Código</CTableHeaderCell>
                <CTableHeaderCell>Ubicación (Col / N°)</CTableHeaderCell>
                <CTableHeaderCell>Sensor ID (RTDB)</CTableHeaderCell>
                <CTableHeaderCell>Ruta Firebase</CTableHeaderCell>
                <CTableHeaderCell>Distancia (cm)</CTableHeaderCell>
                <CTableHeaderCell>Estado</CTableHeaderCell>
                <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {puestos.length > 0 ? (
                puestos.map((p) => {
                  const isOcupado = p.estado?.toUpperCase() === 'OCUPADO'
                  return (
                    <CTableRow key={p.id}>
                      <CTableDataCell className="fw-bold">{p.id}</CTableDataCell>
                      <CTableDataCell>
                        <span className="badge bg-secondary font-monospace">{p.codigo}</span>
                      </CTableDataCell>
                      <CTableDataCell>
                        Col. <strong>{p.columna}</strong> - N° <strong>#{p.numero}</strong>
                      </CTableDataCell>
                      <CTableDataCell>
                        <small className="font-monospace text-muted">{p.sensor_id_rtdb || 'N/A'}</small>
                      </CTableDataCell>
                      <CTableDataCell>
                        <small className="font-monospace text-muted">{p.ruta_firebase || 'N/A'}</small>
                      </CTableDataCell>
                      <CTableDataCell>
                        <span className="badge bg-light text-dark font-monospace border">
                          {p.distancia_cm != null ? `${p.distancia_cm} cm` : 'N/A'}
                        </span>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={isOcupado ? 'danger' : 'success'}>
                          {p.estado ? p.estado.toUpperCase() : 'LIBRE'}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="text-end">
                        <CButton
                          color="warning"
                          size="sm"
                          className="me-2 text-white"
                          onClick={() => openEditModal(p)}
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton
                          color="danger"
                          size="sm"
                          className="text-white"
                          onClick={() => handleDelete(p.id)}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  )
                })
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan="8" className="text-center py-4 text-muted">
                    No hay puestos registrados en la base de datos.
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CForm onSubmit={handleSave}>
          <CModalHeader>
            <CModalTitle>{editingId ? `Editar Puesto #${editingId}` : 'Nuevo Puesto'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <div className="row mb-3">
              <div className="col-md-4">
                <CFormLabel>Código</CFormLabel>
                <CFormInput name="codigo" value={formData.codigo} onChange={handleInputChange} placeholder="A-01" required />
              </div>
              <div className="col-md-4">
                <CFormLabel>Columna</CFormLabel>
                <CFormInput name="columna" maxLength={2} value={formData.columna} onChange={handleInputChange} placeholder="A" required />
              </div>
              <div className="col-md-4">
                <CFormLabel>Número</CFormLabel>
                <CFormInput type="number" name="numero" value={formData.numero} onChange={handleInputChange} placeholder="1" required />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <CFormLabel>Sensor ID (RTDB)</CFormLabel>
                <CFormInput name="sensor_id_rtdb" value={formData.sensor_id_rtdb} onChange={handleInputChange} placeholder="sensor_01" />
              </div>
              <div className="col-md-6">
                <CFormLabel>Ruta Firebase</CFormLabel>
                <CFormInput name="ruta_firebase" value={formData.ruta_firebase} onChange={handleInputChange} placeholder="puestos/A01" />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <CFormLabel>Estado</CFormLabel>
                <CFormSelect name="estado" value={formData.estado} onChange={handleInputChange}>
                  <option value="LIBRE">LIBRE</option>
                  <option value="OCUPADO">OCUPADO</option>
                  <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                </CFormSelect>
              </div>
              <div className="col-md-6">
                <CFormLabel>Distancia (cm)</CFormLabel>
                <CFormInput type="number" step="0.1" name="distancia_cm" value={formData.distancia_cm} onChange={handleInputChange} />
              </div>
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setModalVisible(false)}>
              Cancelar
            </CButton>
            <CButton color="primary" type="submit" disabled={saving}>
              {saving ? <CSpinner size="sm" /> : 'Guardar Puesto'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </CCard>
  )
}

export default Puestos