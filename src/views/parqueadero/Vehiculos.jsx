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
  CFormCheck,
  CSpinner,
  CAlert,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash, cilReload, cilCarAlt } from '@coreui/icons'
import { supabase } from '../../../lib/supabase'

const initialForm = {
  placa: '',
  marca: '',
  modelo: '',
  anio: '',
  color: '',
  tipo: 'AUTOMOVIL',
  foto_url: '',
  foto_fuente_url: '',
  foto_propietario_url: '',
  cedula_propietario: '',
  cedula_enmascarada: '',
  propietario_nombre: '',
  correo_institucional: '',
  correo_microsoft: '',
  autorizado: true,
}

const Vehiculos = () => {
  const [vehiculos, setVehiculos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(initialForm)
  const [saving, setSaving] = useState(false)

  const fetchVehiculos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('vehiculos')
        .select('*')
        .order('id', { ascending: true })

      if (fetchError) throw fetchError
      setVehiculos(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVehiculos()
  }, [fetchVehiculos])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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
      placa: item.placa || '',
      marca: item.marca || '',
      modelo: item.modelo || '',
      anio: item.anio || '',
      color: item.color || '',
      tipo: item.tipo || 'AUTOMOVIL',
      foto_url: item.foto_url || '',
      foto_fuente_url: item.foto_fuente_url || '',
      foto_propietario_url: item.foto_propietario_url || '',
      cedula_propietario: item.cedula_propietario || '',
      cedula_enmascarada: item.cedula_enmascarada || '',
      propietario_nombre: item.propietario_nombre || '',
      correo_institucional: item.correo_institucional || '',
      correo_microsoft: item.correo_microsoft || '',
      autorizado: item.autorizado ?? true,
    })
    setModalVisible(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        const { error: updateError } = await supabase
          .from('vehiculos')
          .update(formData)
          .eq('id', editingId)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('vehiculos')
          .insert([formData])
        if (insertError) throw insertError
      }

      setModalVisible(false)
      fetchVehiculos()
    } catch (err) {
      alert(`Error al guardar: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este registro?')) return
    try {
      const { error: deleteError } = await supabase
        .from('vehiculos')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      fetchVehiculos()
    } catch (err) {
      alert(`Error al eliminar: ${err.message}`)
    }
  }

  return (
    <CCard className="mb-4 shadow-sm">
      <CCardHeader className="d-flex justify-content-between align-items-center bg-primary text-white">
        <h5 className="mb-0 d-flex align-items-center gap-2">
          <CIcon icon={cilCarAlt} /> Gestión de Vehículos y Propietarios
        </h5>
        <div className="d-flex gap-2">
          <CButton color="light" variant="outline" size="sm" onClick={fetchVehiculos}>
            <CIcon icon={cilReload} />
          </CButton>
          <CButton color="success" className="text-white" size="sm" onClick={openCreateModal}>
            <CIcon icon={cilPlus} /> Nuevo Registro
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
                <CTableHeaderCell>Foto</CTableHeaderCell>
                <CTableHeaderCell>Placa / Vehículo</CTableHeaderCell>
                <CTableHeaderCell>Propietario</CTableHeaderCell>
                <CTableHeaderCell>Cédula</CTableHeaderCell>
                <CTableHeaderCell>Correo</CTableHeaderCell>
                <CTableHeaderCell>Estado</CTableHeaderCell>
                <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {vehiculos.length > 0 ? (
                vehiculos.map((v) => (
                  <CTableRow key={v.id}>
                    <CTableDataCell>
                      <img
                        src={v.foto_url || `https://placehold.co/80x50?text=${v.marca || 'Auto'}`}
                        alt={v.modelo}
                        style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="fw-bold font-monospace">{v.placa}</div>
                      <small className="text-muted">{v.marca} {v.modelo} ({v.anio})</small>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="fw-semibold">{v.propietario_nombre || 'N/A'}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <small className="font-monospace">{v.cedula_enmascarada || v.cedula_propietario || 'N/A'}</small>
                    </CTableDataCell>
                    <CTableDataCell>
                      <small>{v.correo_institucional || v.correo_microsoft || 'N/A'}</small>
                    </CTableDataCell>
                    <CTableDataCell>
                      {v.autorizado ? (
                        <CBadge color="success">Autorizado</CBadge>
                      ) : (
                        <CBadge color="danger">No Autorizado</CBadge>
                      )}
                    </CTableDataCell>
                    <CTableDataCell className="text-end">
                      <CButton
                        color="warning"
                        size="sm"
                        className="me-2 text-white"
                        onClick={() => openEditModal(v)}
                      >
                        <CIcon icon={cilPencil} />
                      </CButton>
                      <CButton
                        color="danger"
                        size="sm"
                        className="text-white"
                        onClick={() => handleDelete(v.id)}
                      >
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan="7" className="text-center py-4 text-muted">
                    No hay registros.
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>

      {/* Modal Ajustado al Esquema */}
      <CModal size="lg" visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CForm onSubmit={handleSave}>
          <CModalHeader>
            <CModalTitle>{editingId ? 'Editar Registro' : 'Nuevo Registro'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <h6 className="text-primary mb-3">Datos del Vehículo</h6>
            <div className="row mb-3">
              <div className="col-md-4">
                <CFormLabel>Placa</CFormLabel>
                <CFormInput name="placa" value={formData.placa} onChange={handleInputChange} required />
              </div>
              <div className="col-md-4">
                <CFormLabel>Marca</CFormLabel>
                <CFormInput name="marca" value={formData.marca} onChange={handleInputChange} required />
              </div>
              <div className="col-md-4">
                <CFormLabel>Modelo</CFormLabel>
                <CFormInput name="modelo" value={formData.modelo} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-4">
                <CFormLabel>Año</CFormLabel>
                <CFormInput type="number" name="anio" value={formData.anio} onChange={handleInputChange} />
              </div>
              <div className="col-md-4">
                <CFormLabel>Color</CFormLabel>
                <CFormInput name="color" value={formData.color} onChange={handleInputChange} />
              </div>
              <div className="col-md-4">
                <CFormLabel>Tipo</CFormLabel>
                <CFormInput name="tipo" value={formData.tipo} onChange={handleInputChange} />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <CFormLabel>URL Foto Vehículo</CFormLabel>
                <CFormInput name="foto_url" value={formData.foto_url} onChange={handleInputChange} />
              </div>
              <div className="col-md-6">
                <CFormLabel>URL Foto Fuente</CFormLabel>
                <CFormInput name="foto_fuente_url" value={formData.foto_fuente_url} onChange={handleInputChange} />
              </div>
            </div>

            <hr />
            <h6 className="text-primary mb-3">Datos del Propietario</h6>

            <div className="row mb-3">
              <div className="col-md-6">
                <CFormLabel>Nombre Propietario</CFormLabel>
                <CFormInput name="propietario_nombre" value={formData.propietario_nombre} onChange={handleInputChange} />
              </div>
              <div className="col-md-3">
                <CFormLabel>Cédula Propietario</CFormLabel>
                <CFormInput name="cedula_propietario" value={formData.cedula_propietario} onChange={handleInputChange} />
              </div>
              <div className="col-md-3">
                <CFormLabel>Cédula Enmascarada</CFormLabel>
                <CFormInput name="cedula_enmascarada" value={formData.cedula_enmascarada} onChange={handleInputChange} />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-4">
                <CFormLabel>Correo Institucional</CFormLabel>
                <CFormInput type="email" name="correo_institucional" value={formData.correo_institucional} onChange={handleInputChange} />
              </div>
              <div className="col-md-4">
                <CFormLabel>Correo Microsoft</CFormLabel>
                <CFormInput type="email" name="correo_microsoft" value={formData.correo_microsoft} onChange={handleInputChange} />
              </div>
              <div className="col-md-4">
                <CFormLabel>URL Foto Propietario</CFormLabel>
                <CFormInput name="foto_propietario_url" value={formData.foto_propietario_url} onChange={handleInputChange} />
              </div>
            </div>

            <div className="mb-3">
              <CFormCheck
                id="autorizadoCheck"
                label="Vehículo Autorizado para ingreso"
                name="autorizado"
                checked={formData.autorizado}
                onChange={handleInputChange}
              />
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setModalVisible(false)}>
              Cancelar
            </CButton>
            <CButton color="primary" type="submit" disabled={saving}>
              {saving ? <CSpinner size="sm" /> : 'Guardar'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </CCard>
  )
}

export default Vehiculos