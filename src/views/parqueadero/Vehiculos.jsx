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
  CFormInput,
  CPagination,
  CPaginationItem,
  CBadge,
  CForm,
} from '@coreui/react'
import { useVehiculos } from '../../hooks/useVehiculos'
import { supabase } from '../../lib/supabase'

export default function Vehiculos() {
  const { fetchVehiculos, loading } = useVehiculos()
  const [vehiculos, setVehiculos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const registrosPorPagina = 10

  // Estados para el CRUD (Crear / Editar)
  const [form, setForm] = useState({ placa: '', propietario_nombre: '', marca: '' })
  const [editandoId, setEditandoId] = useState(null)

  const cargarDatos = async () => {
    const data = await fetchVehiculos()
    if (data) setVehiculos(data)
  }

  useEffect(() => {
    cargarDatos()
  }, [fetchVehiculos])

  // Función Guardar / Crear / Actualizar
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editandoId) {
      await supabase.from('vehiculos').update(form).eq('id', editandoId)
      setEditandoId(null)
    } else {
      await supabase.from('vehiculos').insert([form])
    }
    setForm({ placa: '', propietario_nombre: '', marca: '' })
    cargarDatos()
  }

  // Función Eliminar
  const eliminarVehiculo = async (id) => {
    if (window.confirm('¿Deseas eliminar este registro?')) {
      await supabase.from('vehiculos').delete().eq('id', id)
      cargarDatos()
    }
  }

  // Función Cargar datos en el formulario para Editar
  const prepararEdicion = (v) => {
    setForm({ placa: v.placa || '', propietario_nombre: v.propietario_nombre || '', marca: v.marca || '' })
    setEditandoId(v.id)
  }

  const vehiculosFiltrados = vehiculos.filter((v) => {
    const query = busqueda.toLowerCase()
    return (
      (v.placa && v.placa.toLowerCase().includes(query)) ||
      (v.marca && v.marca.toLowerCase().includes(query)) ||
      (v.propietario_nombre && v.propietario_nombre.toLowerCase().includes(query))
    )
  })

  const totalPaginas = Math.ceil(vehiculosFiltrados.length / registrosPorPagina) || 1
  const indiceUltimoRegistro = paginaActual * registrosPorPagina
  const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina
  const registrosActuales = vehiculosFiltrados.slice(indicePrimerRegistro, indiceUltimoRegistro)

  return (
    <CRow>
      <CCol xs={12}>
        {/* Formulario CRUD integrado */}
        <CCard className="mb-4 shadow-sm border-0">
          <CCardHeader className="bg-dark text-white fw-bold">
            {editandoId ? 'Editar Vehículo y Propietario' : 'Registrar Nuevo Vehículo'}
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit} className="row g-3">
              <CCol md={3}>
                <CFormInput
                  type="text"
                  placeholder="Ej. ABC-123"
                  value={form.placa}
                  onChange={(e) => setForm({ ...form, placa: e.target.value })}
                  required
                />
              </CCol>
              <CCol md={4}>
                <CFormInput
                  type="text"
                  placeholder="Nombre del propietario"
                  value={form.propietario_nombre}
                  onChange={(e) => setForm({ ...form, propietario_nombre: e.target.value })}
                  required
                />
              </CCol>
              <CCol md={3}>
                <CFormInput
                  type="text"
                  placeholder="Marca"
                  value={form.marca}
                  onChange={(e) => setForm({ ...form, marca: e.target.value })}
                  required
                />
              </CCol>
              <CCol md={2} className="d-flex align-items-end">
                <CButton type="submit" color="primary" className="w-100">
                  {editandoId ? 'Actualizar' : 'Guardar'}
                </CButton>
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>

        {/* Tabla principal */}
        <CCard className="mb-4 shadow-sm border-0">
          <CCardHeader className="d-flex justify-content-between align-items-center bg-white py-3">
            <div>
              <h5 className="mb-0 fw-bold text-dark">Vehículos y Propietarios</h5>
              <small className="text-muted">Control y gestión de vehículos autorizados - UTEQ Smart Parking</small>
            </div>
            <CButton color="success" size="sm" onClick={cargarDatos} className="text-white">
              Actualizar
            </CButton>
          </CCardHeader>
          <CCardBody>
            <div className="mb-3 d-flex justify-content-between align-items-center">
              <CFormInput
                type="text"
                placeholder="Buscar placa, vehículo o propietario..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value)
                  setPaginaActual(1)
                }}
                style={{ maxWidth: '400px' }}
              />
              <span className="text-muted small">Total: {vehiculosFiltrados.length} registros</span>
            </div>

            {loading ? (
              <p className="text-center py-4">Cargando registros...</p>
            ) : (
              <>
                <CTable align="middle" hover responsive bordered className="mb-0 text-center">
                  <CTableHead color="dark">
                    <CTableRow>
                      <CTableHeaderCell>Foto Auto</CTableHeaderCell>
                      <CTableHeaderCell>Placa</CTableHeaderCell>
                      <CTableHeaderCell>Vehículo</CTableHeaderCell>
                      <CTableHeaderCell>Año / Color</CTableHeaderCell>
                      <CTableHeaderCell>Foto Propietario</CTableHeaderCell>
                      <CTableHeaderCell>Propietario</CTableHeaderCell>
                      <CTableHeaderCell>Cédula</CTableHeaderCell>
                      <CTableHeaderCell>Estado</CTableHeaderCell>
                      <CTableHeaderCell>Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {registrosActuales.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan="9" className="text-center text-muted py-4">
                          No se encontraron registros
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      registrosActuales.map((v, index) => (
                        <CTableRow key={v.id || index}>
                          <CTableDataCell>
                            <img
                              src={v.foto_url || 'https://via.placeholder.com/70'}
                              alt="Auto"
                              className="rounded shadow-sm"
                              style={{ width: '70px', height: '45px', objectFit: 'cover' }}
                            />
                          </CTableDataCell>
                          <CTableDataCell>
                            <span className="badge bg-dark text-white px-2 py-1">{v.placa}</span>
                          </CTableDataCell>
                          <CTableDataCell className="text-start">
                            <div className="fw-bold">{v.marca}</div>
                            <div className="text-muted small">{v.modelo}</div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <div>{v.anlo}</div>
                            <div className="text-muted small">{v.color}</div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <img
                              src={v.foto_propietario_url || 'https://via.placeholder.com/40'}
                              alt="Propietario"
                              className="rounded-circle shadow-sm"
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                            />
                          </CTableDataCell>
                          <CTableDataCell className="fw-semibold text-start text-uppercase small">
                            {v.propietario_nombre}
                          </CTableDataCell>
                          <CTableDataCell>{v.cedula_enmascarada}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={v.autorizado ? 'success' : 'danger'}>
                              {v.autorizado ? 'Autorizado' : 'No autorizado'}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            <div className="d-flex justify-content-center gap-1">
                              <CButton color="warning" size="sm" onClick={() => prepararEdicion(v)}>
                                Editar
                              </CButton>
                              <CButton color="danger" size="sm" className="text-white" onClick={() => eliminarVehiculo(v.id)}>
                                Eliminar
                              </CButton>
                            </div>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    )}
                  </CTableBody>
                </CTable>

                <CPagination aria-label="Paginación" className="justify-content-center mt-4">
                  <CPaginationItem
                    disabled={paginaActual === 1}
                    onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                    style={{ cursor: 'pointer' }}
                  >
                    Anterior
                  </CPaginationItem>
                  {Array.from({ length: totalPaginas }, (_, i) => (
                    <CPaginationItem
                      key={i + 1}
                      active={i + 1 === paginaActual}
                      onClick={() => setPaginaActual(i + 1)}
                      style={{ cursor: 'pointer' }}
                    >
                      {i + 1}
                    </CPaginationItem>
                  ))}
                  <CPaginationItem
                    disabled={paginaActual === totalPaginas}
                    onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
                    style={{ cursor: 'pointer' }}
                  >
                    Siguiente
                  </CPaginationItem>
                </CPagination>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}
