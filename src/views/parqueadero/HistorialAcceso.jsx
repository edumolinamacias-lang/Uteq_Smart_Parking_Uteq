import React, { useState, useEffect, useCallback } from 'react'

import { useHistorial } from '../../hooks/useHistorial'
import { useVehiculos } from '../../hooks/useVehiculos'
import { usePuestos } from '../../hooks/usePuestos'

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
  CBadge,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormSelect,
} from '@coreui/react'

export default function HistorialAcceso() {
  // =====================================================
  // HOOK HISTORIAL
  // =====================================================

  const {
    fetchHistorial,
    insertHistorial,
    updateHistorial,
    deleteHistorial,
    loading,
    error,
  } = useHistorial()

  // =====================================================
  // HOOK VEHICULOS
  // =====================================================

  const {
    fetchVehiculos,
  } = useVehiculos()

  // =====================================================
  // HOOK PUESTOS
  // =====================================================

  const {
    fetchPuestos,
  } = usePuestos()

  // =====================================================
  // ESTADOS
  // =====================================================

  const [registros, setRegistros] = useState([])

  const [vehiculos, setVehiculos] = useState([])

  const [puestos, setPuestos] = useState([])

  const [busqueda, setBusqueda] = useState('')

  const [visibleModal, setVisibleModal] = useState(false)

  const [editandoId, setEditandoId] = useState(null)

  // =====================================================
  // FORMULARIO
  // =====================================================

  const [formData, setFormData] = useState({
    vehiculo_id: '',
    puesto_id: '',
    sensor_id_rtdb: '',
    fecha_entrada: '',
    fecha_salida: '',
    duracion_minutos: '',
    distancia_cm_entrada: '',
    estado: 'OCUPADO',
    observacion: '',
  })

  // =====================================================
  // CARGAR HISTORIAL
  // =====================================================

  const cargarRegistros = useCallback(async () => {
    const data = await fetchHistorial()

    if (data) {
      setRegistros(data)
    }
  }, [fetchHistorial])

  // =====================================================
  // CARGAR VEHICULOS
  // =====================================================

  const cargarVehiculos = useCallback(async () => {
    const data = await fetchVehiculos()

    if (data) {
      setVehiculos(data)
    }
  }, [fetchVehiculos])

  // =====================================================
  // CARGAR PUESTOS
  // =====================================================

  const cargarPuestos = useCallback(async () => {
    const data = await fetchPuestos()

    if (data) {
      setPuestos(data)
    }
  }, [fetchPuestos])

  // =====================================================
  // CARGAR TODO
  // =====================================================

  useEffect(() => {
    cargarRegistros()
    cargarVehiculos()
    cargarPuestos()
  }, [
    cargarRegistros,
    cargarVehiculos,
    cargarPuestos,
  ])

  // =====================================================
  // OBTENER VEHICULO
  // =====================================================

  const obtenerVehiculo = (vehiculoId) => {
    if (!vehiculoId) return null

    return vehiculos.find(
      (vehiculo) =>
        String(vehiculo.id) === String(vehiculoId)
    )
  }

  // =====================================================
  // OBTENER PUESTO
  // =====================================================

  const obtenerPuesto = (puestoId) => {
    if (!puestoId) return null

    return puestos.find(
      (puesto) =>
        String(puesto.id) === String(puestoId)
    )
  }

  // =====================================================
  // ABRIR MODAL
  // =====================================================

  const handleOpenModal = (reg = null) => {
    if (reg) {
      setEditandoId(reg.id)

      setFormData({
        vehiculo_id: reg.vehiculo_id || '',
        puesto_id: reg.puesto_id || '',
        sensor_id_rtdb: reg.sensor_id_rtdb || '',

        fecha_entrada: reg.fecha_entrada
          ? new Date(reg.fecha_entrada)
              .toISOString()
              .slice(0, 16)
          : '',

        fecha_salida: reg.fecha_salida
          ? new Date(reg.fecha_salida)
              .toISOString()
              .slice(0, 16)
          : '',

        duracion_minutos:
          reg.duracion_minutos ?? '',

        distancia_cm_entrada:
          reg.distancia_cm_entrada ?? '',

        estado:
          reg.estado || 'OCUPADO',

        observacion:
          reg.observacion || '',
      })
    } else {
      setEditandoId(null)

      setFormData({
        vehiculo_id: '',
        puesto_id: '',
        sensor_id_rtdb: '',

        fecha_entrada:
          new Date()
            .toISOString()
            .slice(0, 16),

        fecha_salida: '',

        duracion_minutos: '',

        distancia_cm_entrada: '',

        estado: 'OCUPADO',

        observacion: '',
      })
    }

    setVisibleModal(true)
  }

  // =====================================================
  // CAMBIAR PUESTO
  // =====================================================

  const handlePuestoChange = (e) => {
    const puestoId = e.target.value

    const puesto = obtenerPuesto(puestoId)

    setFormData((prev) => ({
      ...prev,

      puesto_id: puestoId,

      sensor_id_rtdb:
        puesto?.sensor_id_rtdb || '',

      distancia_cm_entrada:
        puesto?.distancia_cm ?? '',
    }))
  }

  // =====================================================
  // GUARDAR
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    // ===================================================
    // VALIDACIONES
    // ===================================================

    if (!formData.vehiculo_id) {
      alert('Debe seleccionar un vehículo.')
      return
    }

    if (!formData.puesto_id) {
      alert('Debe seleccionar un puesto.')
      return
    }

    if (!formData.sensor_id_rtdb) {
      alert(
        'El puesto seleccionado no tiene sensor_id_rtdb.'
      )
      return
    }

    if (!formData.fecha_entrada) {
      alert(
        'Debe ingresar la fecha de entrada.'
      )
      return
    }

    if (
      formData.fecha_salida &&
      new Date(formData.fecha_salida) <
        new Date(formData.fecha_entrada)
    ) {
      alert(
        'La fecha de salida no puede ser anterior a la entrada.'
      )
      return
    }

    // ===================================================
    // DATOS
    // ===================================================

    const datos = {
      vehiculo_id:
        Number(formData.vehiculo_id),

      puesto_id:
        Number(formData.puesto_id),

      sensor_id_rtdb:
        formData.sensor_id_rtdb,

      fecha_entrada:
        new Date(
          formData.fecha_entrada
        ).toISOString(),

      fecha_salida:
        formData.fecha_salida
          ? new Date(
              formData.fecha_salida
            ).toISOString()
          : null,

      duracion_minutos:
        formData.duracion_minutos !== ''
          ? Number(
              formData.duracion_minutos
            )
          : null,

      distancia_cm_entrada:
        formData.distancia_cm_entrada !== ''
          ? Number(
              formData.distancia_cm_entrada
            )
          : null,

      estado:
        formData.estado,

      observacion:
        formData.observacion.trim() || null,
    }

    // ===================================================
    // INSERTAR / ACTUALIZAR
    // ===================================================

    let res

    if (editandoId) {
      res = await updateHistorial(
        editandoId,
        datos
      )
    } else {
      res = await insertHistorial(datos)
    }

    // ===================================================
    // RESULTADO
    // ===================================================

    if (res.success) {
      setVisibleModal(false)

      await cargarRegistros()
    } else {
      alert(
        'Error al guardar: ' +
          res.error
      )
    }
  }

  // =====================================================
  // ELIMINAR
  // =====================================================

  const handleDelete = async (id) => {
    const confirmar = window.confirm(
      '¿Estás seguro de eliminar este registro histórico?'
    )

    if (!confirmar) return

    const res =
      await deleteHistorial(id)

    if (res.success) {
      await cargarRegistros()
    } else {
      alert(
        'Error al eliminar: ' +
          res.error
      )
    }
  }

  // =====================================================
  // FILTRAR
  // =====================================================

  const registrosFiltrados =
    registros.filter((reg) => {
      const vehiculo =
        obtenerVehiculo(
          reg.vehiculo_id
        )

      const puesto =
        obtenerPuesto(
          reg.puesto_id
        )

      const texto =
        busqueda.toLowerCase().trim()

      return (
        (reg.codigo_registro || '')
          .toLowerCase()
          .includes(texto) ||

        (reg.placa_detectada || '')
          .toLowerCase()
          .includes(texto) ||

        (vehiculo?.placa || '')
          .toLowerCase()
          .includes(texto) ||

        (puesto?.codigo || '')
          .toLowerCase()
          .includes(texto) ||

        (reg.sensor_id_rtdb || '')
          .toLowerCase()
          .includes(texto) ||

        (reg.estado || '')
          .toLowerCase()
          .includes(texto)
      )
    })

  // =====================================================
  // INTERFAZ
  // =====================================================

  return (
    <CRow>
      <CCol xs={12}>

        {/* =================================================
            TABLA
        ================================================= */}

        <CCard className="mb-4 shadow-sm border-0">

          <CCardHeader
            className="
              bg-dark
              text-white
              fw-bold
              d-flex
              flex-column
              flex-md-row
              justify-content-between
              align-items-center
              py-3
              gap-3
            "
          >

            <span>
              Registro de Ocupación e Historial
            </span>

            <div
              className="
                d-flex
                align-items-center
                gap-2
                w-100
                w-md-auto
                justify-content-end
              "
            >

              <CFormInput
                type="text"
                placeholder="Buscar placa, puesto, sensor..."
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(
                    e.target.value
                  )
                }
                style={{
                  maxWidth: '280px',
                }}
                size="sm"
              />

              <CButton
                color="success"
                size="sm"
                onClick={() =>
                  handleOpenModal()
                }
              >
                + Nuevo
              </CButton>

            </div>

          </CCardHeader>

          <CCardBody>

            {error && (
              <p className="text-danger text-center">
                Error: {error}
              </p>
            )}

            {loading &&
            registros.length === 0 ? (

              <p className="text-center py-4">
                Cargando registros...
              </p>

            ) : (

              <div className="table-responsive">

                <CTable
                  align="middle"
                  hover
                  bordered
                  className="mb-0 text-sm"
                >

                  <CTableHead color="light">

                    <CTableRow>

                      <CTableHeaderCell>
                        Código
                      </CTableHeaderCell>

                      <CTableHeaderCell>
                        Vehículo
                      </CTableHeaderCell>

                      <CTableHeaderCell>
                        Puesto
                      </CTableHeaderCell>

                      <CTableHeaderCell>
                        Sensor
                      </CTableHeaderCell>

                      <CTableHeaderCell>
                        Entrada
                      </CTableHeaderCell>

                      <CTableHeaderCell>
                        Salida
                      </CTableHeaderCell>

                      <CTableHeaderCell>
                        Duración
                      </CTableHeaderCell>

                      <CTableHeaderCell>
                        Distancia
                      </CTableHeaderCell>

                      <CTableHeaderCell>
                        Estado
                      </CTableHeaderCell>

                      <CTableHeaderCell className="text-center">
                        Acciones
                      </CTableHeaderCell>

                    </CTableRow>

                  </CTableHead>

                  <CTableBody>

                    {registrosFiltrados.length ===
                    0 ? (

                      <CTableRow>

                        <CTableDataCell
                          colSpan="10"
                          className="
                            text-center
                            text-muted
                            py-4
                          "
                        >
                          No se encontraron registros
                        </CTableDataCell>

                      </CTableRow>

                    ) : (

                      registrosFiltrados.map(
                        (reg) => {

                          const vehiculo =
                            obtenerVehiculo(
                              reg.vehiculo_id
                            )

                          const puesto =
                            obtenerPuesto(
                              reg.puesto_id
                            )

                          return (
                            <CTableRow
                              key={reg.id}
                            >

                              {/* CÓDIGO */}

                              <CTableDataCell
                                className="fw-bold"
                              >
                                {reg.codigo_registro ||
                                  `REG-${reg.id}`}
                              </CTableDataCell>

                              {/* VEHÍCULO */}

                              <CTableDataCell>

                                {vehiculo ? (

                                  <div>

                                    <strong>
                                      {vehiculo.placa ||
                                        'Sin placa'}
                                    </strong>

                                    <br />

                                    <small className="text-muted">
                                      {vehiculo.marca ||
                                        ''}{' '}
                                      {vehiculo.modelo ||
                                        ''}
                                    </small>

                                  </div>

                                ) : (

                                  <span className="text-danger">
                                    N/D
                                  </span>

                                )}

                              </CTableDataCell>

                              {/* PUESTO */}

                              <CTableDataCell>

                                {puesto ? (

                                  <div>

                                    <strong>
                                      {puesto.codigo}
                                    </strong>

                                    <br />

                                    <small className="text-muted">
                                      Columna{' '}
                                      {puesto.columna}
                                      {' - '}
                                      Nro{' '}
                                      {puesto.numero}
                                    </small>

                                  </div>

                                ) : (

                                  <span className="text-danger">
                                    N/D
                                  </span>

                                )}

                              </CTableDataCell>

                              {/* SENSOR */}

                              <CTableDataCell>
                                <code>
                                  {reg.sensor_id_rtdb ||
                                    'N/D'}
                                </code>
                              </CTableDataCell>

                              {/* ENTRADA */}

                              <CTableDataCell>
                                {reg.fecha_entrada
                                  ? new Date(
                                      reg.fecha_entrada
                                    ).toLocaleString()
                                  : 'N/D'}
                              </CTableDataCell>

                              {/* SALIDA */}

                              <CTableDataCell>
                                {reg.fecha_salida
                                  ? new Date(
                                      reg.fecha_salida
                                    ).toLocaleString()
                                  : 'En curso'}
                              </CTableDataCell>

                              {/* DURACIÓN */}

                              <CTableDataCell>
                                {reg.duracion_minutos !=
                                null
                                  ? `${reg.duracion_minutos} min`
                                  : 'N/D'}
                              </CTableDataCell>

                              {/* DISTANCIA */}

                              <CTableDataCell>
                                {reg.distancia_cm_entrada !=
                                null
                                  ? `${reg.distancia_cm_entrada} cm`
                                  : 'N/D'}
                              </CTableDataCell>

                              {/* ESTADO */}

                              <CTableDataCell>

                                <CBadge
                                  color={
                                    reg.estado?.toUpperCase() ===
                                    'FINALIZADO'
                                      ? 'success'
                                      : 'warning'
                                  }
                                >
                                  {reg.estado ||
                                    'N/D'}
                                </CBadge>

                              </CTableDataCell>

                              {/* ACCIONES */}

                              <CTableDataCell className="text-center">

                                <CButton
                                  size="sm"
                                  color="warning"
                                  className="me-1 text-white"
                                  onClick={() =>
                                    handleOpenModal(
                                      reg
                                    )
                                  }
                                >
                                  Editar
                                </CButton>

                                <CButton
                                  size="sm"
                                  color="danger"
                                  variant="outline"
                                  onClick={() =>
                                    handleDelete(
                                      reg.id
                                    )
                                  }
                                >
                                  Eliminar
                                </CButton>

                              </CTableDataCell>

                            </CTableRow>
                          )
                        }
                      )

                    )}

                  </CTableBody>

                </CTable>

              </div>

            )}

          </CCardBody>

        </CCard>

        {/* =================================================
            MODAL
        ================================================= */}

        <CModal
          visible={visibleModal}
          onClose={() =>
            setVisibleModal(false)
          }
        >

          <CModalHeader>

            <CModalTitle>
              {editandoId
                ? 'Editar Registro'
                : 'Nuevo Registro de Estacionamiento'}
            </CModalTitle>

          </CModalHeader>

          <CForm
            onSubmit={handleSubmit}
          >

            <CModalBody>

              {/* VEHÍCULO */}

              <div className="mb-3">

                <label className="form-label fw-bold">
                  Vehículo *
                </label>

                <CFormSelect
                  value={
                    formData.vehiculo_id
                  }
                  onChange={(e) =>
                    setFormData(
                      (prev) => ({
                        ...prev,
                        vehiculo_id:
                          e.target.value,
                      })
                    )
                  }
                  required
                >

                  <option value="">
                    Seleccione un vehículo
                  </option>

                  {vehiculos.map(
                    (vehiculo) => (

                      <option
                        key={vehiculo.id}
                        value={vehiculo.id}
                      >
                        {vehiculo.placa ||
                          'Sin placa'}
                        {' - '}
                        {vehiculo.marca ||
                          ''}
                        {' '}
                        {vehiculo.modelo ||
                          ''}
                      </option>

                    )
                  )}

                </CFormSelect>

              </div>

              {/* PUESTO */}

              <div className="mb-3">

                <label className="form-label fw-bold">
                  Puesto *
                </label>

                <CFormSelect
                  value={
                    formData.puesto_id
                  }
                  onChange={
                    handlePuestoChange
                  }
                  required
                >

                  <option value="">
                    Seleccione un puesto
                  </option>

                  {puestos.map(
                    (puesto) => (

                      <option
                        key={puesto.id}
                        value={puesto.id}
                      >
                        {puesto.codigo}
                        {' - Columna '}
                        {puesto.columna}
                        {' - Nro '}
                        {puesto.numero}
                      </option>

                    )
                  )}

                </CFormSelect>

              </div>

              {/* SENSOR */}

              <div className="mb-3">

                <label className="form-label fw-bold">
                  Sensor ID (RTDB) *
                </label>

                <CFormInput
                  type="text"
                  value={
                    formData.sensor_id_rtdb
                  }
                  onChange={(e) =>
                    setFormData(
                      (prev) => ({
                        ...prev,
                        sensor_id_rtdb:
                          e.target.value,
                      })
                    )
                  }
                  required
                />

              </div>

              {/* ENTRADA */}

              <div className="mb-3">

                <label className="form-label fw-bold">
                  Fecha y hora de entrada *
                </label>

                <CFormInput
                  type="datetime-local"
                  value={
                    formData.fecha_entrada
                  }
                  onChange={(e) =>
                    setFormData(
                      (prev) => ({
                        ...prev,
                        fecha_entrada:
                          e.target.value,
                      })
                    )
                  }
                  required
                />

              </div>

              {/* SALIDA */}

              <div className="mb-3">

                <label className="form-label fw-bold">
                  Fecha y hora de salida
                </label>

                <CFormInput
                  type="datetime-local"
                  value={
                    formData.fecha_salida
                  }
                  onChange={(e) =>
                    setFormData(
                      (prev) => ({
                        ...prev,
                        fecha_salida:
                          e.target.value,
                      })
                    )
                  }
                />

              </div>

              {/* DURACIÓN */}

              <div className="mb-3">

                <label className="form-label fw-bold">
                  Duración (minutos)
                </label>

                <CFormInput
                  type="number"
                  min="0"
                  value={
                    formData.duracion_minutos
                  }
                  onChange={(e) =>
                    setFormData(
                      (prev) => ({
                        ...prev,
                        duracion_minutos:
                          e.target.value,
                      })
                    )
                  }
                />

              </div>

              {/* DISTANCIA */}

              <div className="mb-3">

                <label className="form-label fw-bold">
                  Distancia de entrada (cm) *
                </label>

                <CFormInput
                  type="number"
                  step="0.01"
                  min="0"
                  value={
                    formData.distancia_cm_entrada
                  }
                  onChange={(e) =>
                    setFormData(
                      (prev) => ({
                        ...prev,
                        distancia_cm_entrada:
                          e.target.value,
                      })
                    )
                  }
                  required
                />

              </div>

              {/* ESTADO */}

              <div className="mb-3">

                <label className="form-label fw-bold">
                  Estado *
                </label>

                <CFormSelect
                  value={
                    formData.estado
                  }
                  onChange={(e) =>
                    setFormData(
                      (prev) => ({
                        ...prev,
                        estado:
                          e.target.value,
                      })
                    )
                  }
                  required
                >

                  <option value="OCUPADO">
                    OCUPADO
                  </option>

                  <option value="FINALIZADO">
                    FINALIZADO
                  </option>

                </CFormSelect>

              </div>

              {/* OBSERVACIÓN */}

              <div className="mb-3">

                <label className="form-label fw-bold">
                  Observación
                </label>

                <CFormInput
                  type="text"
                  placeholder="Observación del registro"
                  value={
                    formData.observacion
                  }
                  onChange={(e) =>
                    setFormData(
                      (prev) => ({
                        ...prev,
                        observacion:
                          e.target.value,
                      })
                    )
                  }
                />

              </div>

            </CModalBody>

            <CModalFooter>

              <CButton
                color="secondary"
                type="button"
                onClick={() =>
                  setVisibleModal(false)
                }
              >
                Cancelar
              </CButton>

              <CButton
                color="primary"
                type="submit"
              >
                {editandoId
                  ? 'Guardar Cambios'
                  : 'Registrar'}
              </CButton>

            </CModalFooter>

          </CForm>

        </CModal>

      </CCol>
    </CRow>
  )
}