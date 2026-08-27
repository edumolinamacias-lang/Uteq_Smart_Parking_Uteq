import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
} from '@coreui/react'
import { useVehiculos } from '../../hooks/useVehiculos'

export default function Vehiculos() {
  const { fetchVehiculos, addVehiculo, updateVehiculo, deleteVehiculo, loading } = useVehiculos()
  const [vehiculos, setVehiculos] = useState([])
  const [formData, setFormData] = useState({ placa: '', propietario: '', marca: '' })
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    const data = await fetchVehiculos()
    if (data) setVehiculos(data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    let exito
    if (isEditing) {
      exito = await updateVehiculo(editId, formData)
    } else {
      exito = await addVehiculo(formData)
    }
    
    if (exito) {
      setFormData({ placa: '', propietario: '', marca: '' })
      setIsEditing(false)
      setEditId(null)
      cargarDatos()
    }
  }

  const handleEdit = (vehiculo) => {
    setFormData({ placa: vehiculo.placa, propietario: vehiculo.propietario, marca: vehiculo.marca })
    setIsEditing(true)
    setEditId(vehiculo.id)
  }

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este registro?')) {
      const exito = await deleteVehiculo(id)
      if (exito) cargarDatos()
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Gestión de Vehículos y Propietarios</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit} className="row g-3 mb-4 p-3 bg-light rounded border">
              <div className="col-md-3">
                <CFormLabel>Placa</CFormLabel>
                <CFormInput required type="text" value={formData.placa} onChange={(e) => setFormData({...formData, placa: e.target.value})} placeholder="Ej. ABC-123" />
              </div>
              <div className="col-md-4">
                <CFormLabel>Propietario</CFormLabel>
                <CFormInput required type="text" value={formData.propietario} onChange={(e) => setFormData({...formData, propietario: e.target.value})} placeholder="Nombre del propietario" />
              </div>
              <div className="col-md-3">
                <CFormLabel>Marca</CFormLabel>
                <CFormInput required type="text" value={formData.marca} onChange={(e) => setFormData({...formData, marca: e.target.value})} placeholder="Ej. Toyota" />
              </div>
              <div className="col-md-2 d-flex align-items-end gap-2">
                <CButton type="submit" color="primary" className="w-100">
                  {isEditing ? 'Actualizar' : 'Guardar'}
                </CButton>
                {isEditing && (
                  <CButton type="button" color="secondary" onClick={() => { setIsEditing(false); setFormData({placa: '', propietario: '', marca: ''}) }}>
                    X
                  </CButton>
                )}
              </div>
            </CForm>

            {loading ? <p>Cargando registros...</p> : (
              <CTable align="middle" hover responsive bordered>
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell>Placa</CTableHeaderCell>
                    <CTableHeaderCell>Propietario</CTableHeaderCell>
                    <CTableHeaderCell>Marca</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {vehiculos.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan="4" className="text-center text-muted">No hay registros disponibles</CTableDataCell>
                    </CTableRow>
                  ) : (
                    vehiculos.map((v) => (
                      <CTableRow key={v.id}>
                        <CTableDataCell className="fw-bold text-uppercase">{v.placa}</CTableDataCell>
                        <CTableDataCell>{v.propietario}</CTableDataCell>
                        <CTableDataCell>{v.marca}</CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CButton color="warning" size="sm" className="me-2 text-white" onClick={() => handleEdit(v)}>Editar</CButton>
                          <CButton color="danger" size="sm" className="text-white" onClick={() => handleEliminar(v.id)}>Eliminar</CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  )}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}