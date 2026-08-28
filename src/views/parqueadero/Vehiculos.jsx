
import React, { useState, useEffect, useRef } from 'react'
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

export default function Vehiculos() {
  // =====================================================
  // HOOK
  // =====================================================

  const {
    fetchVehiculos,
    addVehiculo,
    updateVehiculo,
    deleteVehiculo,
    loading,
    error,
  } = useVehiculos()

  // =====================================================
  // ESTADOS
  // =====================================================

  const [vehiculos, setVehiculos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const [editandoId, setEditandoId] = useState(null)

  const registrosPorPagina = 10

  // Referencia al formulario
  const formularioRef = useRef(null)

  // =====================================================
  // FORMULARIO INICIAL
  // =====================================================

  const formularioInicial = {
    placa: '',
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    color: '',
    tipo: 'AUTOMOVIL',

    propietario_nombre: '',
    cedula_propietario: '',
    correo_institucional: '',

    foto_url: 'https://via.placeholder.com/150',
    foto_fuente_url: 'https://via.placeholder.com/150',
    foto_propietario_url: 'https://via.placeholder.com/150',

    autorizado: true,
  }

  const [form, setForm] = useState(formularioInicial)

  // =====================================================
  // CARGAR DATOS
  // =====================================================

  const cargarDatos = async () => {
    const data = await fetchVehiculos()

    if (data) {
      setVehiculos(data)
    }
  }

  // =====================================================
  // CARGAR AL INICIAR
  // =====================================================

  useEffect(() => {
    cargarDatos()
  }, [fetchVehiculos])

  // =====================================================
  // CAMBIAR CÉDULA
  // =====================================================

  const handleCedulaChange = (e) => {
    const cedula = e.target.value
      .replace(/\D/g, '')
      .slice(0, 10)

    setForm((prev) => ({
      ...prev,
      cedula_propietario: cedula,
    }))

    // Buscar propietario automáticamente
    if (cedula.length === 10 && !editandoId) {
      const propietarioExistente = vehiculos.find(
        (v) =>
          v.cedula_propietario === cedula
      )

      if (propietarioExistente) {
        setForm((prev) => ({
          ...prev,

          propietario_nombre:
            propietarioExistente.propietario_nombre ||
            '',

          correo_institucional:
            propietarioExistente.correo_institucional ||
            '',

          foto_propietario_url:
            propietarioExistente.foto_propietario_url ||
            'https://via.placeholder.com/150',
        }))
      }
    }
  }

  // =====================================================
  // CAMBIAR CAMPOS
  // =====================================================

  const handleChange = (campo, valor) => {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  // =====================================================
  // GUARDAR / ACTUALIZAR
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    // ===================================================
    // VALIDAR CÉDULA
    // ===================================================

    const cedulaRegex = /^[0-9]{10}$/

    if (
      !cedulaRegex.test(
        form.cedula_propietario
      )
    ) {
      alert(
        'Error: La cédula del propietario debe contener exactamente 10 dígitos numéricos.'
      )
      return
    }

    // ===================================================
    // VALIDAR PLACA
    // ===================================================

    const placaRegex = /^[A-Z]{3}-[0-9]{4}$/

    if (!placaRegex.test(form.placa)) {
      alert(
        'Error: La placa debe tener el formato ecuatoriano válido. Ejemplo: ABC-1234'
      )
      return
    }

    // ===================================================
    // DATOS A ENVIAR
    // ===================================================

    const datosAEnviar = {
      placa: form.placa.trim().toUpperCase(),

      marca: form.marca.trim(),

      modelo: form.modelo.trim(),

      anio: Number(form.anio),

      color: form.color.trim(),

      tipo: form.tipo.trim().toUpperCase(),

      propietario_nombre:
        form.propietario_nombre.trim().toUpperCase(),

      cedula_propietario:
        form.cedula_propietario,

      correo_institucional:
        form.correo_institucional.trim(),

      foto_url:
        form.foto_url ||
        'https://via.placeholder.com/150',

      foto_fuente_url:
        form.foto_fuente_url ||
        'https://via.placeholder.com/150',

      foto_propietario_url:
        form.foto_propietario_url ||
        'https://via.placeholder.com/150',

      autorizado: form.autorizado,
    }

    // ===================================================
    // PROCESAR
    // ===================================================

    try {
      // =================================================
      // ACTUALIZAR
      // =================================================

      if (editandoId) {
        const resultado =
          await updateVehiculo(
            editandoId,
            datosAEnviar
          )

        if (!resultado.success) {
          alert(
            'Error al actualizar: ' +
              resultado.error
          )
          return
        }

        alert(
          'Vehículo actualizado exitosamente.'
        )
      }

      // =================================================
      // INSERTAR
      // =================================================

      else {
        const resultado =
          await addVehiculo(
            datosAEnviar
          )

        if (!resultado.success) {
          alert(
            'Error al registrar: ' +
              resultado.error
          )
          return
        }

        alert(
          'Vehículo registrado exitosamente.'
        )
      }

      // =================================================
      // LIMPIAR
      // =================================================

      setEditandoId(null)

      setForm({
        ...formularioInicial,
        anio: new Date().getFullYear(),
      })

      setPaginaActual(1)

      // =================================================
      // ACTUALIZAR TABLA
      // =================================================

      await cargarDatos()

      // =================================================
      // VOLVER AL FORMULARIO
      // =================================================

      setTimeout(() => {
        formularioRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 200)

    } catch (err) {
      alert(
        'Error inesperado: ' +
          err.message
      )
    }
  }

  // =====================================================
  // PREPARAR EDICIÓN
  // =====================================================

  const prepararEdicion = (v) => {
    setForm({
      placa: v.placa || '',

      marca: v.marca || '',

      modelo: v.modelo || '',

      anio:
        v.anio ||
        new Date().getFullYear(),

      color: v.color || '',

      tipo:
        v.tipo ||
        'AUTOMOVIL',

      propietario_nombre:
        v.propietario_nombre || '',

      cedula_propietario:
        v.cedula_propietario || '',

      correo_institucional:
        v.correo_institucional || '',

      foto_url:
        v.foto_url ||
        'https://via.placeholder.com/150',

      foto_fuente_url:
        v.foto_fuente_url ||
        'https://via.placeholder.com/150',

      foto_propietario_url:
        v.foto_propietario_url ||
        'https://via.placeholder.com/150',

      autorizado:
        v.autorizado ?? true,
    })

    setEditandoId(v.id)

    // Subir al formulario
    setTimeout(() => {
      formularioRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 100)
  }

  // =====================================================
  // CANCELAR EDICIÓN
  // =====================================================

  const cancelarEdicion = () => {
    setEditandoId(null)

    setForm({
      ...formularioInicial,
      anio: new Date().getFullYear(),
    })
  }

  // =====================================================
  // ELIMINAR VEHÍCULO
  // =====================================================

  const eliminarVehiculo = async (id) => {
    const confirmar = window.confirm(
      '¿Deseas eliminar este registro?\n\nLos registros de estacionamiento asociados también podrían eliminarse dependiendo de la configuración de Supabase.'
    )

    if (!confirmar) {
      return
    }

    const resultado =
      await deleteVehiculo(id)

    if (resultado.success) {
      alert(
        'Vehículo eliminado correctamente.'
      )

      await cargarDatos()

      // Si la página queda vacía,
      // regresar a la página anterior
      if (
        registrosActuales.length === 1 &&
        paginaActual > 1
      ) {
        setPaginaActual(
          (prev) => prev - 1
        )
      }
    } else {
      alert(
        'Error al eliminar: ' +
          resultado.error
      )
    }
  }

  // =====================================================
  // FILTRAR
  // =====================================================

  const vehiculosFiltrados =
    vehiculos.filter((v) => {
      const query =
        busqueda
          .toLowerCase()
          .trim()

      return (
        (v.placa &&
          v.placa
            .toLowerCase()
            .includes(query)) ||

        (v.marca &&
          v.marca
            .toLowerCase()
            .includes(query)) ||

        (v.modelo &&
          v.modelo
            .toLowerCase()
            .includes(query)) ||

        (v.propietario_nombre &&
          v.propietario_nombre
            .toLowerCase()
            .includes(query)) ||

        (v.cedula_propietario &&
          v.cedula_propietario
            .includes(query))
      )
    })

  // =====================================================
  // PAGINACIÓN
  // =====================================================

  const totalPaginas =
    Math.ceil(
      vehiculosFiltrados.length /
        registrosPorPagina
    ) || 1

  const indiceUltimoRegistro =
    paginaActual *
    registrosPorPagina

  const indicePrimerRegistro =
    indiceUltimoRegistro -
    registrosPorPagina

  const registrosActuales =
    vehiculosFiltrados.slice(
      indicePrimerRegistro,
      indiceUltimoRegistro
    )

  // =====================================================
  // CAMBIAR PÁGINA
  // =====================================================

  const cambiarPagina = (pagina) => {
    if (
      pagina < 1 ||
      pagina > totalPaginas
    ) {
      return
    }

    setPaginaActual(pagina)
  }

  // =====================================================
  // INTERFAZ
  // =====================================================

  return (
    <CRow>
      <CCol xs={12}>

        {/* =================================================
            FORMULARIO
        ================================================= */}

        <CCard
          ref={formularioRef}
          className="mb-4 shadow-sm border-0"
        >

          {/* HEADER */}

          <CCardHeader
            className={
              editandoId
                ? 'fw-bold bg-warning text-dark'
                : 'fw-bold bg-dark text-white'
            }
          >
            {editandoId
              ? '✏️ EDITANDO VEHÍCULO'
              : '🚗 Registrar Nuevo Vehículo'}
          </CCardHeader>

          <CCardBody>

            {/* =================================================
                AVISO DE EDICIÓN
            ================================================= */}

            {editandoId && (
              <div
                className="alert alert-warning border-0 shadow-sm d-flex align-items-center mb-4"
                role="alert"
                style={{
                  borderRadius: '12px',
                  background:
                    'linear-gradient(135deg, #fff3cd, #ffe69c)',
                }}
              >

                <div
                  className="me-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: '45px',
                    height: '45px',
                    minWidth: '45px',
                    borderRadius: '50%',
                    background: '#ffc107',
                    color: '#212529',
                    fontSize: '22px',
                  }}
                >
                  ✏️
                </div>

                <div>

                  <div className="fw-bold">
                    EDITANDO VEHÍCULO
                  </div>

                  <div className="small">
                    Estás modificando el vehículo{' '}
                    <strong>
                      {form.placa}
                    </strong>
                  </div>

                </div>

              </div>
            )}

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="alert alert-danger">
                <strong>Error:</strong>{' '}
                {error}
              </div>
            )}

            {/* =================================================
                FORMULARIO
            ================================================= */}

            <CForm
              onSubmit={handleSubmit}
              className="row g-3"
            >

              {/* =================================================
                  DATOS DEL PROPIETARIO
              ================================================= */}

              <CCol md={4}>
                <CFormInput
                  type="text"
                  label="Cédula Propietario"
                  placeholder="10 dígitos"
                  maxLength={10}
                  value={
                    form.cedula_propietario
                  }
                  onChange={
                    handleCedulaChange
                  }
                  required
                />
              </CCol>

              <CCol md={8}>
                <CFormInput
                  type="text"
                  label="Nombre del Propietario"
                  placeholder="Nombres y Apellidos"
                  value={
                    form.propietario_nombre
                  }
                  onChange={(e) =>
                    handleChange(
                      'propietario_nombre',
                      e.target.value
                    )
                  }
                  required
                />
              </CCol>

              <CCol md={6}>
                <CFormInput
                  type="email"
                  label="Correo Institucional"
                  placeholder="correo@uteq.edu.ec"
                  value={
                    form.correo_institucional
                  }
                  onChange={(e) =>
                    handleChange(
                      'correo_institucional',
                      e.target.value
                    )
                  }
                  required
                />
              </CCol>

              <CCol md={6}>
                <CFormInput
                  type="text"
                  label="URL Foto Propietario"
                  placeholder="https://..."
                  value={
                    form.foto_propietario_url
                  }
                  onChange={(e) =>
                    handleChange(
                      'foto_propietario_url',
                      e.target.value
                    )
                  }
                  required
                />
              </CCol>

              <CCol md={12}>
                <hr className="my-2" />
              </CCol>

              {/* =================================================
                  DATOS DEL VEHÍCULO
              ================================================= */}

              <CCol md={3}>
                <CFormInput
                  type="text"
                  label="Placa del Vehículo"
                  placeholder="Ej. ABC-1234"
                  maxLength={8}
                  value={form.placa}
                  onChange={(e) =>
                    handleChange(
                      'placa',
                      e.target.value
                        .toUpperCase()
                        .replace(
                          /[^A-Z0-9-]/g,
                          ''
                        )
                    )
                  }
                  required
                />
              </CCol>

              <CCol md={3}>
                <CFormInput
                  type="text"
                  label="Marca"
                  placeholder="Ej. Toyota"
                  value={form.marca}
                  onChange={(e) =>
                    handleChange(
                      'marca',
                      e.target.value
                    )
                  }
                  required
                />
              </CCol>

              <CCol md={3}>
                <CFormInput
                  type="text"
                  label="Modelo"
                  placeholder="Ej. Corolla"
                  value={form.modelo}
                  onChange={(e) =>
                    handleChange(
                      'modelo',
                      e.target.value
                    )
                  }
                  required
                />
              </CCol>

              <CCol md={3}>
                <CFormInput
                  type="number"
                  label="Año"
                  placeholder="Ej. 2026"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={form.anio}
                  onChange={(e) =>
                    handleChange(
                      'anio',
                      parseInt(
                        e.target.value
                      ) || ''
                    )
                  }
                  required
                />
              </CCol>

              <CCol md={4}>
                <CFormInput
                  type="text"
                  label="Color"
                  placeholder="Ej. Blanco"
                  value={form.color}
                  onChange={(e) =>
                    handleChange(
                      'color',
                      e.target.value
                    )
                  }
                  required
                />
              </CCol>

              <CCol md={4}>
                <CFormInput
                  type="text"
                  label="Tipo"
                  placeholder="Ej. AUTOMOVIL"
                  value={form.tipo}
                  onChange={(e) =>
                    handleChange(
                      'tipo',
                      e.target.value.toUpperCase()
                    )
                  }
                  required
                />
              </CCol>

              <CCol md={4}>
                <CFormInput
                  type="text"
                  label="URL Foto Vehículo"
                  placeholder="https://..."
                  value={form.foto_url}
                  onChange={(e) =>
                    handleChange(
                      'foto_url',
                      e.target.value
                    )
                  }
                  required
                />
              </CCol>

              <CCol md={12}>
                <CFormInput
                  type="text"
                  label="URL Foto Fuente"
                  placeholder="https://..."
                  value={
                    form.foto_fuente_url
                  }
                  onChange={(e) =>
                    handleChange(
                      'foto_fuente_url',
                      e.target.value
                    )
                  }
                  required
                />
              </CCol>

              {/* =================================================
                  AUTORIZADO
              ================================================= */}

              <CCol md={12}>

                <div className="form-check">

                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="autorizado"
                    checked={
                      form.autorizado
                    }
                    onChange={(e) =>
                      handleChange(
                        'autorizado',
                        e.target.checked
                      )
                    }
                  />

                  <label
                    htmlFor="autorizado"
                    className="form-check-label"
                  >
                    Vehículo autorizado
                  </label>

                </div>

              </CCol>

              {/* =================================================
                  BOTONES
              ================================================= */}

              <CCol
                md={12}
                className="d-flex justify-content-end gap-2 mt-3"
              >

                {editandoId && (
                  <CButton
                    type="button"
                    color="secondary"
                    onClick={
                      cancelarEdicion
                    }
                    disabled={loading}
                  >
                    Cancelar
                  </CButton>
                )}

                <CButton
                  type="submit"
                  color="primary"
                  className="text-white px-4"
                  disabled={loading}
                >
                  {loading
                    ? 'Procesando...'
                    : editandoId
                    ? 'Actualizar Registro'
                    : 'Guardar Nuevo Vehículo'}
                </CButton>

              </CCol>

            </CForm>

          </CCardBody>

        </CCard>

        {/* =================================================
            LISTA DE VEHÍCULOS
        ================================================= */}

        <CCard className="mb-4 shadow-sm border-0">

          <CCardHeader
            className="d-flex justify-content-between align-items-center bg-white py-3"
          >

            <div>

              <h5 className="mb-0 fw-bold text-dark">
                🚗 Vehículos y Propietarios
              </h5>

              <small className="text-muted">
                Control y gestión - UTEQ Smart Parking
              </small>

            </div>

            <CButton
              color="success"
              size="sm"
              onClick={cargarDatos}
              className="text-white"
              disabled={loading}
            >
              {loading
                ? 'Cargando...'
                : 'Actualizar Lista'}
            </CButton>

          </CCardHeader>

          <CCardBody>

            {/* =================================================
                BUSCADOR
            ================================================= */}

            <div className="mb-3 d-flex justify-content-between align-items-center gap-3">

              <CFormInput
                type="text"
                placeholder="Buscar placa, vehículo, propietario o cédula..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(
                    e.target.value
                  )

                  setPaginaActual(1)
                }}
                style={{
                  maxWidth: '500px',
                }}
              />

              <span className="text-muted small text-nowrap">
                Total:{' '}
                {
                  vehiculosFiltrados.length
                }{' '}
                registros
              </span>

            </div>

            {/* =================================================
                TABLA
            ================================================= */}

            {loading &&
            vehiculos.length === 0 ? (

              <div className="text-center py-5">

                <div
                  className="spinner-border text-primary mb-3"
                  role="status"
                >
                  <span className="visually-hidden">
                    Cargando...
                  </span>
                </div>

                <p className="text-muted mb-0">
                  Cargando registros...
                </p>

              </div>

            ) : (

              <>

                <CTable
                  align="middle"
                  hover
                  responsive
                  bordered
                  className="mb-0 text-center"
                >

                  {/* =================================================
                      CABECERA
                  ================================================= */}

                  <CTableHead color="dark">

                    <CTableRow>

                      <CTableHeaderCell>
                        Foto Auto
                      </CTableHeaderCell>

                      <CTableHeaderCell>
                        Placa
                      </CTableHeaderCell>

                      <CTableHeaderCell>
                        Vehículo
                      </CTableHeaderCell>

                      <CTableHeaderCell>
                        Año / Color
                      </CTableHeaderCell>

                      <CTableHeaderCell>
                        Foto Propietario
                      </CTableHeaderCell>

                      <CTableHeaderCell>
                        Propietario
                      </CTableHeaderCell>

                      <CTableHeaderCell>
                        Cédula
                      </CTableHeaderCell>

                      <CTableHeaderCell>
                        Estado
                      </CTableHeaderCell>

                      <CTableHeaderCell>
                        Acciones
                      </CTableHeaderCell>

                    </CTableRow>

                  </CTableHead>

                  {/* =================================================
                      CUERPO
                  ================================================= */}

                  <CTableBody>

                    {registrosActuales.length ===
                    0 ? (

                      <CTableRow>

                        <CTableDataCell
                          colSpan={9}
                          className="text-center text-muted py-5"
                        >
                          <div className="mb-2 fs-3">
                            🚗
                          </div>

                          No se encontraron
                          registros.

                        </CTableDataCell>

                      </CTableRow>

                    ) : (

                      registrosActuales.map(
                        (v, index) => (

                          <CTableRow
                            key={
                              v.id ||
                              index
                            }
                          >

                            {/* FOTO AUTO */}

                            <CTableDataCell>

                              <img
                                src={
                                  v.foto_url ||
                                  'https://via.placeholder.com/70'
                                }
                                alt="Auto"
                                className="rounded shadow-sm"
                                style={{
                                  width: '70px',
                                  height: '45px',
                                  objectFit:
                                    'cover',
                                }}
                                onError={(
                                  e
                                ) => {
                                  e.currentTarget.src =
                                    'https://via.placeholder.com/70'
                                }}
                              />

                            </CTableDataCell>

                            {/* PLACA */}

                            <CTableDataCell>

                              <span className="badge bg-dark text-white px-2 py-2">
                                {v.placa}
                              </span>

                            </CTableDataCell>

                            {/* VEHÍCULO */}

                            <CTableDataCell className="text-start">

                              <div className="fw-bold">
                                {v.marca}
                              </div>

                              <div className="text-muted small">
                                {v.modelo}
                              </div>

                              <div className="text-muted small">
                                {v.tipo}
                              </div>

                            </CTableDataCell>

                            {/* AÑO / COLOR */}

                            <CTableDataCell>

                              <div className="fw-semibold">
                                {v.anio}
                              </div>

                              <div className="text-muted small">
                                {v.color}
                              </div>

                            </CTableDataCell>

                            {/* FOTO PROPIETARIO */}

                            <CTableDataCell>

                              <img
                                src={
                                  v.foto_propietario_url ||
                                  'https://via.placeholder.com/40'
                                }
                                alt="Propietario"
                                className="rounded-circle shadow-sm"
                                style={{
                                  width: '45px',
                                  height: '45px',
                                  objectFit:
                                    'cover',
                                }}
                                onError={(
                                  e
                                ) => {
                                  e.currentTarget.src =
                                    'https://via.placeholder.com/40'
                                }}
                              />

                            </CTableDataCell>

                            {/* PROPIETARIO */}

                            <CTableDataCell className="fw-semibold text-start text-uppercase small">

                              {
                                v.propietario_nombre ||
                                'SIN NOMBRE'
                              }

                            </CTableDataCell>

                            {/* CÉDULA */}

                            <CTableDataCell>

                              {
                                v.cedula_propietario ||
                                '-'
                              }

                            </CTableDataCell>

                            {/* ESTADO */}

                            <CTableDataCell>

                              <CBadge
                                color={
                                  v.autorizado
                                    ? 'success'
                                    : 'danger'
                                }
                              >
                                {v.autorizado
                                  ? 'Autorizado'
                                  : 'No autorizado'}
                              </CBadge>

                            </CTableDataCell>

                            {/* ACCIONES */}

                            <CTableDataCell>

                              <div className="d-flex justify-content-center gap-1">

                                {/* EDITAR */}

                                <CButton
                                  color="warning"
                                  size="sm"
                                  className="text-white"
                                  onClick={() =>
                                    prepararEdicion(
                                      v
                                    )
                                  }
                                  disabled={
                                    loading
                                  }
                                >
                                  Editar
                                </CButton>

                                {/* ELIMINAR */}

                                <CButton
                                  color="danger"
                                  size="sm"
                                  className="text-white"
                                  onClick={() =>
                                    eliminarVehiculo(
                                      v.id
                                    )
                                  }
                                  disabled={
                                    loading
                                  }
                                >
                                  Eliminar
                                </CButton>

                              </div>

                            </CTableDataCell>

                          </CTableRow>

                        )
                      )

                    )}

                  </CTableBody>

                </CTable>

                {/* =================================================
                    PAGINACIÓN
                ================================================= */}

                {vehiculosFiltrados.length >
                  0 && (

                  <CPagination
                    aria-label="Paginación"
                    className="justify-content-center mt-4"
                  >

                    {/* ANTERIOR */}

                    <CPaginationItem
                      disabled={
                        paginaActual ===
                        1
                      }
                      onClick={() =>
                        cambiarPagina(
                          paginaActual - 1
                        )
                      }
                      style={{
                        cursor:
                          paginaActual ===
                          1
                            ? 'default'
                            : 'pointer',
                      }}
                    >
                      Anterior
                    </CPaginationItem>

                    {/* NÚMEROS */}

                    {Array.from(
                      {
                        length:
                          totalPaginas,
                      },
                      (_, i) => (

                        <CPaginationItem
                          key={
                            i + 1
                          }
                          active={
                            i + 1 ===
                            paginaActual
                          }
                          onClick={() =>
                            cambiarPagina(
                              i + 1
                            )
                          }
                          style={{
                            cursor:
                              'pointer',
                          }}
                        >
                          {i + 1}
                        </CPaginationItem>

                      )
                    )}

                    {/* SIGUIENTE */}

                    <CPaginationItem
                      disabled={
                        paginaActual ===
                        totalPaginas
                      }
                      onClick={() =>
                        cambiarPagina(
                          paginaActual + 1
                        )
                      }
                      style={{
                        cursor:
                          paginaActual ===
                          totalPaginas
                            ? 'default'
                            : 'pointer',
                      }}
                    >
                      Siguiente
                    </CPaginationItem>

                  </CPagination>

                )}

              </>

            )}

          </CCardBody>

        </CCard>

      </CCol>
    </CRow>
  )
}
